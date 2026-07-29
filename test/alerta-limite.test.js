// test/alerta-limite.test.js — Alerta proativo de limite (cod-0035)
//
// Critérios de aceite da AGENDA:
//   • alerta dispara SÓ ao cruzar o teto, idempotente no mês por alvo
//   • o número nasce em buscarGastoPorAlvo/executor, NUNCA no LLM
//   • /teto cerveja 100 grava e confirma; valor inválido/termo <3 chars = erro honesto
//   • Supabase MOCKADO via injeção de `cliente` — nunca o SDK real
//
// Rodar: node --test

'use strict';

// O supabase.js cria o client no require — env dummy só pra carga (nenhuma
// chamada de rede acontece: todos os testes injetam um cliente fake).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  interpretarTeto,
  verificarTetosEstourados,
  TETO_MIN,
  TETO_MAX,
} = require('../src/insights.js');

const {
  montarTetoConfirmado,
  montarTetoErro,
  montarAlertaLimite,
} = require('../src/formatter.js');

const {
  definirLimiteAcompanhamento,
  marcarAlertaLimiteEnviado,
  salvarAcompanhamento,
} = require('../src/supabase.js');

// ── Cliente fake (builder encadeável e thenable, como o do supabase-js).
// `respostas` é uma FILA: cada `await` consome a próxima (a última se repete),
// o que permite testar update-vazio → fallback pro upsert na mesma chamada.
function criarClienteFake(respostas) {
  const fila = Array.isArray(respostas) ? [...respostas] : [respostas];
  const chamadas = [];
  const builder = {
    from(tabela)      { chamadas.push(['from', tabela]); return builder; },
    select(cols)      { chamadas.push(['select', cols]); return builder; },
    eq(col, val)      { chamadas.push(['eq', col, val]); return builder; },
    update(obj)       { chamadas.push(['update', obj]); return builder; },
    upsert(obj, opts) { chamadas.push(['upsert', obj, opts]); return builder; },
    single()          { chamadas.push(['single']); return builder; },
    then(res, rej) {
      const r = fila.length > 1 ? fila.shift() : fila[0];
      return Promise.resolve(r).then(res, rej);
    },
  };
  return { cliente: builder, chamadas };
}

function acharChamada(chamadas, nome) {
  return chamadas.filter(([n]) => n === nome);
}

// Itens no formato que buscarItensDoMes devolve.
function item(nome, categoria, precoTotal, compraId = 1) {
  return { compra_id: compraId, nome, nome_canonico: nome, categoria, preco_total: precoTotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// interpretarTeto — parsing do comando
// ─────────────────────────────────────────────────────────────────────────────

test('interpretarTeto: "cerveja 100" → termo com limite 100', () => {
  const r = interpretarTeto('cerveja 100');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'termo');
  assert.equal(r.alvo, 'cerveja');
  assert.equal(r.rotulo, 'cerveja');
  assert.equal(r.limite, 100);
});

test('interpretarTeto: categoria conhecida vira tipo_alvo categoria', () => {
  const r = interpretarTeto('doces 150');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'categoria');
  assert.equal(r.alvo, 'doces');
  assert.equal(r.limite, 150);
});

test('interpretarTeto: alvo com mais de uma palavra (só o último token é o valor)', () => {
  const r = interpretarTeto('ração do cachorro 200');
  assert.equal(r.ok, true);
  assert.equal(r.rotulo, 'ração do cachorro');
  assert.equal(r.limite, 200);
});

test('interpretarTeto: formatos de valor que a pessoa realmente digita', () => {
  assert.equal(interpretarTeto('cerveja 100,50').limite, 100.5);
  assert.equal(interpretarTeto('cerveja R$100').limite, 100);
  assert.equal(interpretarTeto('cerveja 1.234,50').limite, 1234.5);
  assert.equal(interpretarTeto('cerveja 100.50').limite, 100.5);
  assert.equal(interpretarTeto('cerveja 1.000').limite, 1000, 'ponto separando 3 dígitos = milhar');
});

test('interpretarTeto: ruído de moeda não vira parte do alvo', () => {
  const a = interpretarTeto('cerveja R$ 100');
  assert.equal(a.ok, true);
  assert.equal(a.alvo, 'cerveja', 'o "R$" solto não pode entrar no alvo');
  assert.equal(a.limite, 100);

  const b = interpretarTeto('cerveja 100 reais');
  assert.equal(b.ok, true);
  assert.equal(b.alvo, 'cerveja');
  assert.equal(b.limite, 100);

  const c = interpretarTeto('arroz real 100');
  assert.equal(c.alvo, 'arroz real', 'palavra no meio do alvo é preservada (pode ser marca)');
});

test('interpretarTeto: sem argumento → vazio', () => {
  assert.deepEqual(interpretarTeto(''), { ok: false, motivo: 'vazio' });
  assert.deepEqual(interpretarTeto(null), { ok: false, motivo: 'vazio' });
  assert.deepEqual(interpretarTeto(undefined), { ok: false, motivo: 'vazio' });
});

test('interpretarTeto: só o alvo → sem_valor; só o número → sem_alvo', () => {
  assert.equal(interpretarTeto('cerveja').motivo, 'sem_valor');
  assert.equal(interpretarTeto('100').motivo, 'sem_alvo');
});

test('interpretarTeto: valor não numérico → valor_invalido (com o texto original)', () => {
  const r = interpretarTeto('cerveja muito');
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'valor_invalido');
  assert.equal(r.valor, 'muito');
});

test('interpretarTeto: valor fora dos limites de sanidade → valor_invalido', () => {
  assert.equal(interpretarTeto('cerveja 0').motivo, 'valor_invalido');
  assert.equal(interpretarTeto(`cerveja ${TETO_MIN - 0.5}`).motivo, 'valor_invalido');
  assert.equal(interpretarTeto(`cerveja ${TETO_MAX + 1}`).motivo, 'valor_invalido');
  assert.equal(interpretarTeto(`cerveja ${TETO_MAX}`).ok, true, 'o máximo em si é aceito');
});

test('interpretarTeto: termo curto demais → curto (mesma guarda do matching)', () => {
  const r = interpretarTeto('uv 100');
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'curto');
});

test('interpretarTeto: valor negativo não vira teto (o "-" nem entra no parser)', () => {
  assert.equal(interpretarTeto('cerveja -100').ok, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// verificarTetosEstourados — o coração da decisão de alertar
// ─────────────────────────────────────────────────────────────────────────────

const MES = '2026-07';

test('verificarTetosEstourados: gasto acima do teto dispara com o número real', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', rotulo: 'cerveja', limite_mensal: 100, alertado_em: null }];
  const itens = [item('cerveja', 'bebidas', 80), item('cerveja', 'bebidas', 52)];

  const r = verificarTetosEstourados(acomp, itens, MES);

  assert.equal(r.length, 1);
  assert.equal(r[0].id, 1);
  assert.equal(r[0].total, 132);
  assert.equal(r[0].limite, 100);
  assert.equal(r[0].pct, 132);
  assert.equal(r[0].rotulo, 'cerveja');
});

test('verificarTetosEstourados: gasto EXATAMENTE no teto dispara (atingiu conta)', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, alertado_em: null }];
  const r = verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 100)], MES);
  assert.equal(r.length, 1);
  assert.equal(r[0].pct, 100);
});

test('verificarTetosEstourados: gasto abaixo do teto NÃO dispara', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, alertado_em: null }];
  assert.deepEqual(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 99.99)], MES), []);
});

test('verificarTetosEstourados: idempotente — já alertado no mesmo mês fica de fora', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, alertado_em: '2026-07-01' }];
  assert.deepEqual(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 300)], MES), []);
});

test('verificarTetosEstourados: alerta de mês ANTERIOR não bloqueia o mês novo', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, alertado_em: '2026-06-01' }];
  assert.equal(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 300)], MES).length, 1);
});

test('verificarTetosEstourados: alertado_em como Date (driver que devolve objeto) é entendido', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, alertado_em: new Date('2026-07-01T00:00:00Z') }];
  assert.deepEqual(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 300)], MES), []);
});

test('verificarTetosEstourados: alvo sem teto (null/0) nunca alerta — só acompanha', () => {
  const acomp = [
    { id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: null, alertado_em: null },
    { id: 2, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 0, alertado_em: null },
    { id: 3, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 'abc', alertado_em: null },
  ];
  assert.deepEqual(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 300)], MES), []);
});

test('verificarTetosEstourados: alvo inativo é ignorado', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 100, ativo: false, alertado_em: null }];
  assert.deepEqual(verificarTetosEstourados(acomp, [item('cerveja', 'bebidas', 300)], MES), []);
});

test('verificarTetosEstourados: categoria casa por categoria, não por nome', () => {
  const acomp = [{ id: 9, tipo_alvo: 'categoria', alvo: 'doces', rotulo: 'doces', limite_mensal: 50, alertado_em: null }];
  const itens = [item('chocolate barra', 'doces', 30), item('bala', 'doces', 25), item('arroz', 'mercearia', 400)];

  const r = verificarTetosEstourados(acomp, itens, MES);
  assert.equal(r.length, 1);
  assert.equal(r[0].total, 55, 'só os itens da categoria entram na soma');
});

test('verificarTetosEstourados: itens null (leitura falhou) → nenhum alerta', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 1, alertado_em: null }];
  assert.deepEqual(verificarTetosEstourados(acomp, null, MES), []);
  assert.deepEqual(verificarTetosEstourados(acomp, undefined, MES), []);
});

test('verificarTetosEstourados: mês inválido → nenhum alerta (sem mês não há idempotência)', () => {
  const acomp = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 10, alertado_em: null }];
  const itens = [item('cerveja', 'bebidas', 300)];
  assert.deepEqual(verificarTetosEstourados(acomp, itens, '2026-13'), []);
  assert.deepEqual(verificarTetosEstourados(acomp, itens, 'julho'), []);
  assert.deepEqual(verificarTetosEstourados(acomp, itens, null), []);
});

test('verificarTetosEstourados: entradas vazias/lixo não quebram', () => {
  assert.deepEqual(verificarTetosEstourados(null, [], MES), []);
  assert.deepEqual(verificarTetosEstourados([null, undefined, {}], [], MES), []);
});

test('verificarTetosEstourados: vários alvos vêm ordenados por gasto (maior primeiro)', () => {
  const acomp = [
    { id: 1, tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 10, alertado_em: null },
    { id: 2, tipo_alvo: 'termo', alvo: 'chocolate', limite_mensal: 10, alertado_em: null },
  ];
  const itens = [item('cerveja', 'bebidas', 20), item('chocolate', 'doces', 90)];

  const r = verificarTetosEstourados(acomp, itens, MES);
  assert.deepEqual(r.map((a) => a.id), [2, 1]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Copy — /teto e o alerta
// ─────────────────────────────────────────────────────────────────────────────

test('montarTetoConfirmado: valor em pt-BR, sem gíria, aponta os comandos certos', () => {
  const msg = montarTetoConfirmado({ tipo_alvo: 'termo', rotulo: 'cerveja', limite: 1234.5 });
  assert.match(msg, /R\$ 1\.234,50/);
  assert.match(msg, /cerveja/);
  assert.match(msg, /\/acompanhamentos/);
  assert.match(msg, /\/teto cerveja/);
  assert.doesNotMatch(msg, /\bcê\b|\btá\b|\bné\b/);
});

test('montarTetoConfirmado: categoria usa o label de exibição', () => {
  const msg = montarTetoConfirmado({ tipo_alvo: 'categoria', rotulo: 'doces', limite: 150 });
  assert.match(msg, /Doces e Petiscos/);
});

test('montarTetoErro: cada motivo tem instrução própria e exemplo', () => {
  const motivos = ['vazio', 'sem_valor', 'sem_alvo', 'curto', 'falha'];
  const textos = motivos.map((m) => montarTetoErro(m));
  for (const t of textos) assert.ok(t.length > 0);
  assert.equal(new Set(textos).size, motivos.length, 'mensagens distintas por motivo');
  assert.match(montarTetoErro('valor_invalido', 'muito'), /muito/);
  assert.match(montarTetoErro('sem_valor'), /\/teto cerveja 100/);
});

test('montarAlertaLimite: lista vazia/inválida → string vazia (não envia nada)', () => {
  assert.equal(montarAlertaLimite([]), '');
  assert.equal(montarAlertaLimite(null), '');
  assert.equal(montarAlertaLimite(undefined), '');
});

test('montarAlertaLimite: um alvo — número no topo, sem moralizar', () => {
  const msg = montarAlertaLimite([
    { rotulo: 'cerveja', tipo_alvo: 'termo', total: 132, limite: 100, pct: 132 },
  ]);
  assert.match(msg, /^⚠️ \*R\$ 132,00 em cerveja esse mês\*/);
  assert.match(msg, /R\$ 100,00/);
  assert.match(msg, /132%/);
  assert.match(msg, /\/teto cerveja/);
  assert.doesNotMatch(msg, /exager|deveria|culpa|errado|descontrol/i);
});

test('montarAlertaLimite: gasto exatamente no teto fala em "bateu", não em "passou"', () => {
  const msg = montarAlertaLimite([
    { rotulo: 'cerveja', tipo_alvo: 'termo', total: 100, limite: 100, pct: 100 },
  ]);
  assert.match(msg, /bateu o teto/);
  assert.doesNotMatch(msg, /passou o teto/);
});

test('montarAlertaLimite: vários alvos viram UMA mensagem só', () => {
  const msg = montarAlertaLimite([
    { rotulo: 'chocolate', tipo_alvo: 'termo', total: 90, limite: 50, pct: 180 },
    { rotulo: 'doces', tipo_alvo: 'categoria', total: 60, limite: 40, pct: 150 },
  ]);
  assert.match(msg, /2 alvos/);
  assert.match(msg, /chocolate — \*R\$ 90,00\*/);
  assert.match(msg, /Doces e Petiscos — \*R\$ 60,00\*/);
});

// ─────────────────────────────────────────────────────────────────────────────
// Persistência (mockada)
// ─────────────────────────────────────────────────────────────────────────────

test('definirLimiteAcompanhamento: alvo existente → UPDATE que zera alertado_em', async () => {
  const linha = { id: 5, alvo: 'cerveja', limite_mensal: 100 };
  const { cliente, chamadas } = criarClienteFake([{ data: [linha], error: null }]);

  const r = await definirLimiteAcompanhamento(
    '5517999990000',
    { tipo_alvo: 'termo', alvo: 'cerveja', rotulo: 'cerveja', limite_mensal: 100 },
    cliente
  );

  assert.deepEqual(r, linha);
  const [, patch] = acharChamada(chamadas, 'update')[0];
  assert.equal(patch.limite_mensal, 100);
  assert.equal(patch.alertado_em, null, 'teto novo libera um novo alerta no mês');
  assert.equal(patch.ativo, true);
  assert.equal(acharChamada(chamadas, 'upsert').length, 0, 'não deve inserir quando já existe');
});

test('definirLimiteAcompanhamento: alvo inexistente → cai no upsert (passa a acompanhar)', async () => {
  const criada = { id: 11, alvo: 'cerveja', limite_mensal: 100 };
  const { cliente, chamadas } = criarClienteFake([
    { data: [], error: null },        // update não achou linha
    { data: criada, error: null },    // upsert cria
  ]);

  const r = await definirLimiteAcompanhamento(
    '5517999990000',
    { tipo_alvo: 'termo', alvo: 'cerveja', rotulo: 'cerveja', limite_mensal: 100 },
    cliente
  );

  assert.deepEqual(r, criada);
  const [, nova] = acharChamada(chamadas, 'upsert')[0];
  assert.equal(nova.limite_mensal, 100);
  assert.equal(nova.ativo, true);
});

test('definirLimiteAcompanhamento: valor inválido ou alvo faltando → null sem lançar', async () => {
  const { cliente } = criarClienteFake([{ data: [{ id: 1 }], error: null }]);
  assert.equal(await definirLimiteAcompanhamento('551700000000', { tipo_alvo: 'termo', alvo: 'x', limite_mensal: 0 }, cliente), null);
  assert.equal(await definirLimiteAcompanhamento('551700000000', { tipo_alvo: 'termo', alvo: 'x', limite_mensal: 'abc' }, cliente), null);
  assert.equal(await definirLimiteAcompanhamento('551700000000', { alvo: 'x', limite_mensal: 10 }, cliente), null);
});

test('definirLimiteAcompanhamento: erro do banco → null (degradação segura)', async () => {
  const { cliente } = criarClienteFake([{ data: null, error: new Error('boom') }]);
  const r = await definirLimiteAcompanhamento('551700000000', { tipo_alvo: 'termo', alvo: 'cerveja', limite_mensal: 10 }, cliente);
  assert.equal(r, null);
});

test('marcarAlertaLimiteEnviado: grava o 1º dia do mês de referência', async () => {
  const { cliente, chamadas } = criarClienteFake([{ data: null, error: null }]);

  assert.equal(await marcarAlertaLimiteEnviado('5517999990000', 5, '2026-07', cliente), true);

  const [, patch] = acharChamada(chamadas, 'update')[0];
  assert.equal(patch.alertado_em, '2026-07-01');
  const eqs = acharChamada(chamadas, 'eq');
  assert.ok(eqs.some(([, c, v]) => c === 'id' && v === 5));
  assert.ok(eqs.some(([, c, v]) => c === 'phone_number' && v === '5517999990000'));
});

test('marcarAlertaLimiteEnviado: id ausente, mês inválido ou erro → false sem lançar', async () => {
  const { cliente } = criarClienteFake([{ data: null, error: null }]);
  assert.equal(await marcarAlertaLimiteEnviado('551700000000', null, '2026-07', cliente), false);
  assert.equal(await marcarAlertaLimiteEnviado('551700000000', 1, '2026-13', cliente), false);

  const { cliente: cliErro } = criarClienteFake([{ data: null, error: new Error('boom') }]);
  assert.equal(await marcarAlertaLimiteEnviado('551700000000', 1, '2026-07', cliErro), false);
});

test('salvarAcompanhamento: /acompanhar NÃO apaga o teto já definido (regressão cod-0035)', async () => {
  const { cliente, chamadas } = criarClienteFake([{ data: { id: 1 }, error: null }]);

  await salvarAcompanhamento('5517999990000', { tipo_alvo: 'termo', alvo: 'cerveja' }, cliente);

  const [, linha] = acharChamada(chamadas, 'upsert')[0];
  assert.ok(!('limite_mensal' in linha), 'sem valor explícito, o upsert não toca no teto existente');
  assert.ok(!('superfluo' in linha), 'idem para a marca de supérfluo');
});
