// test/filtro-gasto.test.js — blindagem de agregação (cod-0062a)
//
// POR QUE ESTE TESTE EXISTE. Com a Frente 1 (cod-0062), o comprovante de PIX
// passa a ser gravado em `compras` com `tipo='pix'` e `direcao` entrada/saída.
// Antes desta tarefa, `buscarComprasDoMes` e `buscarHistorico` — as leituras que
// alimentam o `/gastos` e o resumo mensal — NÃO filtravam `tipo` nenhum: um PIX
// entraria no total do mês como se fosse compra, e um PIX RECEBIDO viraria
// gasto. O filtro é o tipo de critério que se esquece no meio de uma tarefa de
// coração, então ele vira teste — inclusive um teste de GUARDA que reprova
// leitura agregada nova que nasça sem filtro explícito.
//
// INVENTÁRIO das leituras de `compras` em src/supabase.js (mantido à mão de
// propósito: se a lista sair de sincronia com o código, o teste de guarda no fim
// deste arquivo acusa):
//
//   FILTRADAS — só COMPRA do usuário (TIPOS_GASTO = mercado + outros):
//     • buscarHistorico ................ últimas N compras + soma do mês
//     • buscarComprasDoMes ............. resumo mensal (total, ticket, top lojas)
//     • buscarGastosPorCategoria ....... /gastos (breakdown por categoria)
//     • buscarMesMaisRecenteComGastos .. fallback de mês do /gastos
//     • buscarHistoricoCategorias ...... baseline por categoria (F2)
//
//   FILTRADAS — só MERCADO (TIPOS_MERCADO):
//     • calcularMedia .................. média 90d que alimenta o alerta
//     • buscarHistoricoPrecoItens ...... inflação pessoal (F1)
//     • buscarItensDoMes ............... matching por termo do Agente
//     • buscarTotaisMensais ............ economia acumulada (F4)
//     • buscarObservacoesComparativo ... comparativo entre mercados
//
//   NÃO FILTRADAS (de propósito, com motivo no código):
//     • salvarCompra ................... INSERT, não leitura
//     • listarUsuariosAtivosNoMes ...... elegibilidade (atividade), não gasto
//     • buscarElegiveisInativos ........ reengajamento (atividade), não gasto
//     • apagarDadosUsuario ............. DELETE do /apagar: leva TUDO (LGPD)
//     • _temColunaDirecao .............. o próprio probe do filtro (limit(0))
//
// Rodar: node --test
'use strict';

// supabase.js cria o client no require — env dummy só pra carga (nenhum teste
// aqui faz chamada de rede: tudo usa cliente fake ou leitura do fonte).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  TIPOS_GASTO,
  TIPOS_MERCADO,
  DIRECAO_SAIDA,
  filtroGasto,
  aplicarFiltroGasto,
  _detectarDirecao,
  _setCacheDirecao,
} = require('../src/supabase.js');

// ── Fake encadeável: registra as chamadas e devolve uma fila de respostas ────
function criarClienteFake(respostas = [], { colunaDirecao = false } = {}) {
  const fila = [...respostas];
  const chamadas = [];
  const builder = {
    from(t) { chamadas.push(['from', t]); return builder; },
    select(c) { chamadas.push(['select', c]); return builder; },
    eq(c, v) { chamadas.push(['eq', c, v]); return builder; },
    in(c, v) { chamadas.push(['in', c, v]); return builder; },
    gte(c, v) { chamadas.push(['gte', c, v]); return builder; },
    lt(c, v) { chamadas.push(['lt', c, v]); return builder; },
    order(c, o) { chamadas.push(['order', c, o]); return builder; },
    limit(n) {
      chamadas.push(['limit', n]);
      // limit(0) só acontece no probe da coluna `direcao`
      if (n === 0) {
        return Promise.resolve(
          colunaDirecao
            ? { data: [], error: null }
            : { data: null, error: { code: '42703', message: 'column compras.direcao does not exist' } }
        );
      }
      return builder;
    },
    then(res, rej) { return Promise.resolve(fila.shift()).then(res, rej); },
  };
  return { cliente: builder, chamadas };
}

// ── aplicarFiltroGasto (puro) ───────────────────────────────────────────────

test('aplicarFiltroGasto: um tipo só usa .eq (idêntico ao filtro que existia antes)', () => {
  const { cliente, chamadas } = criarClienteFake();
  aplicarFiltroGasto(cliente, { tipos: TIPOS_MERCADO, direcao: null });
  assert.deepEqual(chamadas, [['eq', 'tipo', 'mercado']]);
});

test('aplicarFiltroGasto: vários tipos usam .in', () => {
  const { cliente, chamadas } = criarClienteFake();
  aplicarFiltroGasto(cliente, { tipos: TIPOS_GASTO, direcao: null });
  assert.deepEqual(chamadas, [['in', 'tipo', ['mercado', 'outros']]]);
});

test('aplicarFiltroGasto: com direcao resolvida, acrescenta .eq(direcao, saida)', () => {
  const { cliente, chamadas } = criarClienteFake();
  aplicarFiltroGasto(cliente, { tipos: TIPOS_GASTO, direcao: DIRECAO_SAIDA });
  assert.deepEqual(chamadas, [
    ['in', 'tipo', ['mercado', 'outros']],
    ['eq', 'direcao', 'saida'],
  ]);
});

test('aplicarFiltroGasto: filtro ausente/inválido cai no default de COMPRA (nunca "sem filtro")', () => {
  for (const filtro of [undefined, null, {}, { tipos: [] }, { tipos: 'mercado' }]) {
    const { cliente, chamadas } = criarClienteFake();
    aplicarFiltroGasto(cliente, filtro);
    assert.deepEqual(chamadas, [['in', 'tipo', ['mercado', 'outros']]],
      'sem filtro explícito o default ainda exclui tipos que não são compra');
  }
});

test('TIPOS_GASTO cobre tudo que existe hoje no banco → nenhum número muda', () => {
  // compras.tipo é NOT NULL DEFAULT 'mercado' e o gemini só produz
  // 'mercado' | 'outros' (migration 2026-06-07). Se um tipo novo for
  // introduzido sem revisar as agregações, esta asserção acusa.
  assert.deepEqual(TIPOS_GASTO, ['mercado', 'outros']);
  assert.deepEqual(TIPOS_MERCADO, ['mercado']);
});

// ── _detectarDirecao: o probe anti-A9 ───────────────────────────────────────

test('_detectarDirecao: coluna AUSENTE (42703) → false, sem lançar', async () => {
  const { cliente } = criarClienteFake([], { colunaDirecao: false });
  assert.equal(await _detectarDirecao(cliente), false);
});

test('_detectarDirecao: coluna PRESENTE → true', async () => {
  const { cliente } = criarClienteFake([], { colunaDirecao: true });
  assert.equal(await _detectarDirecao(cliente), true);
});

test('_detectarDirecao: erro que NÃO é ausência (rede/permissão) → null (inconclusivo), nunca false', async () => {
  const cliente = {
    from() { return this; },
    select() { return this; },
    limit() { return Promise.resolve({ data: null, error: { code: '08006', message: 'connection failure' } }); },
  };
  // Precisa ser null, não false: um blip de rede no primeiro acesso não pode
  // desligar o filtro de direção pelo resto da vida do processo.
  assert.equal(await _detectarDirecao(cliente), null);
});

test('_detectarDirecao: cliente que nem suporta o probe → null, nunca lança', async () => {
  const cliente = { from() { return { select() { return {}; } }; } }; // sem .limit
  assert.equal(await _detectarDirecao(cliente), null);
});

test('_detectarDirecao: "could not find the column" (PostgREST) também é ausência', async () => {
  const cliente = {
    from() { return this; },
    select() { return this; },
    limit() { return Promise.resolve({ data: null, error: { message: "Could not find the 'direcao' column" } }); },
  };
  assert.equal(await _detectarDirecao(cliente), false);
});

test('_detectarDirecao: probe é limit(0) na coluna direcao (zero linha de usuário — LGPD)', async () => {
  const { cliente, chamadas } = criarClienteFake([], { colunaDirecao: true });
  await _detectarDirecao(cliente);
  assert.deepEqual(chamadas, [['from', 'compras'], ['select', 'direcao'], ['limit', 0]]);
});

// ── filtroGasto (usa o resultado do probe) ──────────────────────────────────

test('filtroGasto: sem a coluna no banco → nenhum filtro de direcao (produção não quebra)', async () => {
  _setCacheDirecao(false);
  assert.deepEqual(await filtroGasto({ cliente: criarClienteFake().cliente }), {
    tipos: TIPOS_GASTO, direcao: null,
  });
  _setCacheDirecao(null);
});

test('filtroGasto: com a coluna no banco → passa a exigir direcao=saida', async () => {
  _setCacheDirecao(true);
  const f = await filtroGasto({ cliente: criarClienteFake().cliente, tipos: TIPOS_MERCADO });
  assert.deepEqual(f, { tipos: TIPOS_MERCADO, direcao: DIRECAO_SAIDA });
  _setCacheDirecao(null);
});

test('filtroGasto: cliente injetado NÃO dispara probe (não polui asserções de I/O já existentes)', async () => {
  _setCacheDirecao(null);
  const { cliente, chamadas } = criarClienteFake();
  await filtroGasto({ cliente });
  assert.deepEqual(chamadas, [], 'dublê de teste não recebe query fantasma do probe');
});

// ── Teste de GUARDA: leitura agregada nova sem filtro explícito reprova ─────

const FONTE = fs.readFileSync(path.join(__dirname, '..', 'src', 'supabase.js'), 'utf8');
const LINHAS = FONTE.split('\n');
const MARCADOR = /\/\/\s*filtro-gasto:\s*(aplicado|nao-se-aplica)/;

test('guarda: TODO acesso a compras declara o filtro (marcador // filtro-gasto:)', () => {
  const acessos = [];
  LINHAS.forEach((linha, i) => {
    if (linha.includes(".from('compras')")) acessos.push(i);
  });

  assert.ok(acessos.length >= 14, `esperava encontrar os acessos a compras (achei ${acessos.length})`);

  const semMarcador = [];
  for (const i of acessos) {
    // o marcador fica nas 8 linhas acima do .from('compras') (a query pode
    // começar algumas linhas antes, com o `const { data } = await ...`)
    const janela = LINHAS.slice(Math.max(0, i - 8), i + 1).join('\n');
    if (!MARCADOR.test(janela)) semMarcador.push(i + 1);
  }

  assert.deepEqual(
    semMarcador, [],
    `leitura de compras SEM filtro declarado nas linhas ${semMarcador.join(', ')}. ` +
    'Toda leitura agregada precisa de aplicarFiltroGasto(...) + "// filtro-gasto: aplicado"; ' +
    'se de fato não se aplica, escreva "// filtro-gasto: nao-se-aplica — <motivo>".'
  );
});

test('guarda: todo acesso marcado "aplicado" chama mesmo aplicarFiltroGasto', () => {
  const faltando = [];
  LINHAS.forEach((linha, i) => {
    if (!linha.includes(".from('compras')")) return;
    const janelaAcima = LINHAS.slice(Math.max(0, i - 8), i + 1).join('\n');
    const m = janelaAcima.match(MARCADOR);
    if (!m || m[1] !== 'aplicado') return;
    const janela = LINHAS.slice(Math.max(0, i - 8), i + 4).join('\n');
    if (!janela.includes('aplicarFiltroGasto')) faltando.push(i + 1);
  });
  assert.deepEqual(faltando, [], `marcado como "aplicado" mas sem aplicarFiltroGasto: linhas ${faltando.join(', ')}`);
});

test('guarda: nenhum .eq(\'tipo\', ...) solto sobrou fora do helper', () => {
  const soltos = [];
  LINHAS.forEach((linha, i) => {
    if (linha.trim().startsWith('//')) return;          // comentário/documentação
    if (linha.includes('query.eq')) return;             // a linha do próprio helper
    if (/\.eq\(\s*['"]tipo['"]/.test(linha)) soltos.push(i + 1);
  });
  assert.deepEqual(soltos, [],
    `filtro de tipo na mão nas linhas ${soltos.join(', ')} — use aplicarFiltroGasto para manter um lugar só`);
});

test('guarda: as funções do inventário continuam exportadas (renome não passa batido)', () => {
  const mod = require('../src/supabase.js');
  for (const fn of [
    'buscarHistorico', 'buscarComprasDoMes', 'buscarGastosPorCategoria',
    'buscarMesMaisRecenteComGastos', 'buscarHistoricoCategorias',
    'calcularMedia', 'buscarHistoricoPrecoItens', 'buscarItensDoMes',
    'buscarTotaisMensais', 'buscarObservacoesComparativo',
  ]) {
    assert.equal(typeof mod[fn], 'function', `${fn} sumiu/foi renomeada — revisar o inventário do filtro`);
  }
});
