// test/apagar-io.test.js — camada de persistência do /apagar (LGPD, cod-0076).
//
// O bug que motivou estes testes (verificado no código em 2026-09-03):
// `apagarDadosUsuario` apagava no 3º passo de `lembretes_enviados`, tabela que
// nunca foi criada. O 42P01 era relançado, os passos seguintes não rodavam,
// `usuarios` nunca era apagado e por isso nem o ON DELETE CASCADE de
// `acompanhamentos`/`perguntas_log` disparava — um pedido de exclusão LGPD
// não apagava nada.
//
// Critérios de aceite da AGENDA (cod-0076):
//   • o passo de `lembretes_enviados` sumiu
//   • `acompanhamentos` e `perguntas_log` têm DELETE explícito
//   • um passo que falha NÃO aborta os outros; a função lança no fim
//   • `usuarios` é sempre o último
//   • Supabase MOCKADO via injeção de `cliente` — nunca o SDK real
//
// Rodar: node --test

'use strict';

// O módulo cria o client no require — env dummy só pra carga (nenhuma chamada
// de rede acontece: todos os testes injetam um cliente fake).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { apagarDadosUsuario } = require('../src/supabase.js');

const TELEFONE = '5517999990000';

// ── Cliente fake ────────────────────────────────────────────────────────────
// Builder encadeável e thenable, como o do supabase-js. `falhasPorTabela` mapeia
// tabela → mensagem de erro; a tabela devolve { error } em vez de sucesso.
function criarClienteFake({ falhasPorTabela = {} } = {}) {
  const deletadas = []; // ordem real dos DELETEs bem-sucedidos e falhos
  const filtros = []; // [tabela, tipoDeFiltro, ...args]

  function builderPara(tabela) {
    const builder = {
      delete() {
        deletadas.push(tabela);
        return builder;
      },
      eq(coluna, valor) {
        filtros.push([tabela, 'eq', coluna, valor]);
        return builder;
      },
      or(expr) {
        filtros.push([tabela, 'or', expr]);
        return builder;
      },
      then(res, rej) {
        const msg = falhasPorTabela[tabela];
        const resposta = msg
          ? { data: null, error: new Error(msg) }
          : { data: [], error: null };
        return Promise.resolve(resposta).then(res, rej);
      },
    };
    return builder;
  }

  return {
    cliente: { from: (tabela) => builderPara(tabela) },
    deletadas,
    filtros,
  };
}

// ── Caminho feliz ───────────────────────────────────────────────────────────

test('apagarDadosUsuario: apaga TODAS as tabelas com dado pessoal', async () => {
  const { cliente, deletadas } = criarClienteFake();

  const resumo = await apagarDadosUsuario(TELEFONE, cliente);

  for (const tabela of [
    'compras',
    'indicacoes',
    'acompanhamentos',
    'perguntas_log',
    'resumos_mensais_enviados',
    'mensagens_processadas',
    'usuarios',
  ]) {
    assert.ok(deletadas.includes(tabela), `faltou o DELETE em ${tabela}`);
  }
  assert.deepEqual(resumo.falhas, []);
  assert.equal(resumo.apagadas.length, deletadas.length);
});

test('apagarDadosUsuario: NÃO toca mais em lembretes_enviados (tabela nunca criada)', async () => {
  const { cliente, deletadas } = criarClienteFake();

  await apagarDadosUsuario(TELEFONE, cliente);

  assert.ok(
    !deletadas.includes('lembretes_enviados'),
    'lembretes_enviados não existe no banco — tocar nela é o bug da cod-0076'
  );
});

test('apagarDadosUsuario: acompanhamentos e perguntas_log são explícitos, não só cascata', async () => {
  const { cliente, filtros } = criarClienteFake();

  await apagarDadosUsuario(TELEFONE, cliente);

  for (const tabela of ['acompanhamentos', 'perguntas_log']) {
    const filtro = filtros.find(([t]) => t === tabela);
    assert.deepEqual(
      filtro,
      [tabela, 'eq', 'phone_number', TELEFONE],
      `${tabela} deve filtrar pelo telefone da pessoa`
    );
  }
});

test('apagarDadosUsuario: usuarios é SEMPRE o último (FK de compras)', async () => {
  const { cliente, deletadas } = criarClienteFake();

  await apagarDadosUsuario(TELEFONE, cliente);

  assert.equal(deletadas[deletadas.length - 1], 'usuarios');
  assert.equal(deletadas.indexOf('compras'), 0, 'compras vem antes de usuarios');
});

test('apagarDadosUsuario: indicacoes cobre indicador E indicado', async () => {
  const { cliente, filtros } = criarClienteFake();

  await apagarDadosUsuario(TELEFONE, cliente);

  const filtro = filtros.find(([t]) => t === 'indicacoes');
  assert.equal(filtro[1], 'or');
  assert.ok(filtro[2].includes(`indicador_phone.eq.${TELEFONE}`));
  assert.ok(filtro[2].includes(`indicado_phone.eq.${TELEFONE}`));
});

// ── Falha em um passo não derruba os outros ─────────────────────────────────

test('apagarDadosUsuario: uma tabela falhando NÃO impede as demais', async () => {
  // Era exatamente este o cenário do bug: um passo no meio quebrava e levava
  // junto o DELETE de `usuarios`.
  const { cliente, deletadas } = criarClienteFake({
    falhasPorTabela: { indicacoes: 'relation "indicacoes" does not exist' },
  });

  await assert.rejects(() => apagarDadosUsuario(TELEFONE, cliente));

  assert.ok(deletadas.includes('usuarios'), 'usuarios tem de ser tentado mesmo assim');
  assert.ok(deletadas.includes('mensagens_processadas'));
  assert.equal(deletadas.length, 7, 'todos os passos devem ser tentados');
});

test('apagarDadosUsuario: lança no FIM quando houve falha, nomeando a tabela', async () => {
  const { cliente } = criarClienteFake({
    falhasPorTabela: { perguntas_log: 'permission denied' },
  });

  await assert.rejects(
    () => apagarDadosUsuario(TELEFONE, cliente),
    (err) => {
      assert.ok(
        err.message.includes('perguntas_log'),
        `mensagem deve nomear a tabela que falhou: ${err.message}`
      );
      // o resumo vai junto pra quem quiser auditar o que sobrou
      assert.deepEqual(
        err.resumo.falhas.map((f) => f.tabela),
        ['perguntas_log']
      );
      assert.ok(err.resumo.apagadas.includes('usuarios'));
      return true;
    }
  );
});

test('apagarDadosUsuario: falha em usuarios (FK de pagamento) também lança', async () => {
  // Cenário real previsto no comentário da função: cobrança recorrente ativa
  // barra a remoção de `usuarios` pela FK. O histórico já foi apagado, mas o
  // usuário NÃO pode ouvir "apagado" — tem de virar erro.
  const { cliente } = criarClienteFake({
    falhasPorTabela: { usuarios: 'violates foreign key constraint' },
  });

  await assert.rejects(
    () => apagarDadosUsuario(TELEFONE, cliente),
    (err) => err.message.includes('usuarios')
  );
});

test('apagarDadosUsuario: TODAS falhando ainda lança uma vez só, listando tudo', async () => {
  const { cliente, deletadas } = criarClienteFake({
    falhasPorTabela: {
      compras: 'x',
      indicacoes: 'x',
      acompanhamentos: 'x',
      perguntas_log: 'x',
      resumos_mensais_enviados: 'x',
      mensagens_processadas: 'x',
      usuarios: 'x',
    },
  });

  await assert.rejects(
    () => apagarDadosUsuario(TELEFONE, cliente),
    (err) => {
      assert.equal(err.resumo.falhas.length, 7);
      assert.deepEqual(err.resumo.apagadas, []);
      return true;
    }
  );
  assert.equal(deletadas.length, 7);
});
