// test/agent-intents.test.js — testes do registro de intenções (cod-0012)
//
// Cobre: a lógica pura de "montar fato a partir de dados crus" (com dados e
// sem dados → temDados:false), os templates determinísticos, e a integração
// do REGISTRO com guards.validarClassificacao (cod-0011 — Camada 1).
//
// As funções de I/O (buscarGastosPorCategoria/buscarTotaisMensais) são
// INJETADAS via `deps` com dados sintéticos — nunca toca o Supabase real.
// Período é sempre passado como 'YYYY-MM' explícito (passthrough do
// periodo.js) para o teste ser determinístico, independente da data de hoje.
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  REGISTRO,
  gastoTotalMes,
  gastoPorCategoria,
  compararMeses,
  CATEGORIAS_VALIDAS,
  rotuloCategoria,
} = require('../src/agent/intents.js');

const { validarClassificacao } = require('../src/agent/guards.js');

// ── gasto_total_mes ─────────────────────────────────────────────────────────

test('gasto_total_mes: sem compras no mês → temDados:false', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [],
  });
  assert.equal(fato.temDados, false);
  assert.equal(fato.mesRef, '2026-06');
  assert.equal(
    gastoTotalMes.template(fato),
    'Ainda não tenho gastos registrados em Junho/2026.'
  );
});

test('gasto_total_mes: soma todas as categorias do mês', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [
      { categoria: 'carnes', total: 150.5 },
      { categoria: 'bebidas', total: 49.5 },
    ],
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.total, 200);
  assert.equal(fato.fmt.total, 'R$ 200,00');
  assert.equal(
    gastoTotalMes.template(fato),
    'Em Junho/2026 você gastou R$ 200,00 no total.'
  );
});

test('gasto_total_mes: período ausente cai no default mes_atual (não quebra)', async () => {
  let mesRecebido = null;
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async (phone, mesRef) => { mesRecebido = mesRef; return []; },
  });
  // formato YYYY-MM válido, sem precisar fixar o mês corrente no teste
  assert.match(mesRecebido, /^\d{4}-\d{2}$/);
  assert.equal(fato.mesRef, mesRecebido);
});

// ── gasto_por_categoria ─────────────────────────────────────────────────────

test('gasto_por_categoria: sem compras no mês → temDados:false', async () => {
  const fato = await gastoPorCategoria.executar(
    '5511999999999',
    { categoria: 'carnes', periodo: '2026-05' },
    { buscarGastosPorCategoria: async () => [] }
  );
  assert.equal(fato.temDados, false);
  assert.equal(
    gastoPorCategoria.template(fato),
    'Ainda não tenho gastos registrados em Maio/2026.'
  );
});

test('gasto_por_categoria: categoria pedida não aparece no mês → valor null, mensagem honesta', async () => {
  const fato = await gastoPorCategoria.executar(
    '5511999999999',
    { categoria: 'doces', periodo: '2026-06' },
    {
      buscarGastosPorCategoria: async () => [
        { categoria: 'carnes', total: 100 },
      ],
    }
  );
  assert.equal(fato.temDados, true);
  assert.equal(fato.valor, null);
  assert.equal(fato.fmt.valor, null);
  assert.equal(
    gastoPorCategoria.template(fato),
    'Não encontrei gastos de doces e petiscos em Junho/2026.'
  );
});

test('gasto_por_categoria: categoria encontrada → valor formatado em R$', async () => {
  const fato = await gastoPorCategoria.executar(
    '5511999999999',
    { categoria: 'carnes', periodo: '2026-06' },
    {
      buscarGastosPorCategoria: async () => [
        { categoria: 'carnes', total: 248.3 },
        { categoria: 'bebidas', total: 51.7 },
      ],
    }
  );
  assert.equal(fato.temDados, true);
  assert.equal(fato.valor, 248.3);
  assert.equal(fato.fmt.valor, 'R$ 248,30');
  assert.equal(fato.fmt.total, 'R$ 300,00');
  assert.equal(
    gastoPorCategoria.template(fato),
    'Em Junho/2026 você gastou R$ 248,30 em carnes e aves.'
  );
});

test('gasto_por_categoria: sem categoria no parâmetro → resposta cai no total do mês', async () => {
  const fato = await gastoPorCategoria.executar(
    '5511999999999',
    { periodo: '2026-06' },
    { buscarGastosPorCategoria: async () => [{ categoria: 'padaria', total: 80 }] }
  );
  assert.equal(fato.categoria, null);
  assert.equal(
    gastoPorCategoria.template(fato),
    'Em Junho/2026 você gastou R$ 80,00 no total.'
  );
});

// ── comparar_meses ──────────────────────────────────────────────────────────

test('comparar_meses: só 1 mês de histórico (sem anterior) → temDados:false', async () => {
  const fato = await compararMeses.executar('5511999999999', { periodo: '2026-06' }, {
    buscarTotaisMensais: async () => [{ mes: '2026-06', total: 100, qtdCompras: 1 }],
  });
  assert.equal(fato.temDados, false);
  assert.equal(
    compararMeses.template(fato),
    'Ainda não tenho dados suficientes pra comparar Junho/2026 com os meses anteriores.'
  );
});

test('comparar_meses: mês sem nenhuma compra → temDados:false', async () => {
  const fato = await compararMeses.executar('5511999999999', { periodo: '2026-07' }, {
    buscarTotaisMensais: async () => [{ mes: '2026-06', total: 100, qtdCompras: 1 }],
  });
  assert.equal(fato.temDados, false);
});

test('comparar_meses: gastou abaixo da média anterior → mensagem de economia', async () => {
  const fato = await compararMeses.executar('5511999999999', { periodo: '2026-06' }, {
    buscarTotaisMensais: async () => [
      { mes: '2026-05', total: 200, qtdCompras: 1 },
      { mes: '2026-06', total: 150, qtdCompras: 1 },
    ],
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.economiaMes, 50);
  assert.equal(fato.fmt.totalMesRef, 'R$ 150,00');
  assert.equal(fato.fmt.diferenca, 'R$ 50,00');
  assert.equal(
    compararMeses.template(fato),
    'Em Junho/2026 você gastou R$ 150,00, 25% abaixo da média dos meses anteriores (R$ 50,00 a menos) 🎉'
  );
});

test('comparar_meses: gastou acima da média anterior → mensagem de alerta', async () => {
  const fato = await compararMeses.executar('5511999999999', { periodo: '2026-06' }, {
    buscarTotaisMensais: async () => [
      { mes: '2026-05', total: 100, qtdCompras: 1 },
      { mes: '2026-06', total: 150, qtdCompras: 1 },
    ],
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.economiaMes, -50);
  assert.equal(
    compararMeses.template(fato),
    'Em Junho/2026 você gastou R$ 150,00, 50% acima da média dos meses anteriores (R$ 50,00 a mais).'
  );
});

test('comparar_meses: diferença pequena (<5%) → mensagem neutra "parecido"', async () => {
  const fato = await compararMeses.executar('5511999999999', { periodo: '2026-06' }, {
    buscarTotaisMensais: async () => [
      { mes: '2026-05', total: 100, qtdCompras: 1 },
      { mes: '2026-06', total: 103, qtdCompras: 1 },
    ],
  });
  assert.equal(fato.temDados, true);
  assert.equal(
    compararMeses.template(fato),
    'Em Junho/2026 você gastou R$ 103,00 — parecido com a média dos meses anteriores (R$ 100,00).'
  );
});

// ── Helpers ──────────────────────────────────────────────────────────────────

test('CATEGORIAS_VALIDAS: espelha as 10 categorias do gemini.js', () => {
  assert.equal(CATEGORIAS_VALIDAS.length, 10);
  assert.ok(CATEGORIAS_VALIDAS.includes('carnes'));
  assert.ok(CATEGORIAS_VALIDAS.includes('outros'));
});

test('rotuloCategoria: traduz categoria conhecida; passa through categoria desconhecida', () => {
  assert.equal(rotuloCategoria('laticinios'), 'laticínios');
  assert.equal(rotuloCategoria('inexistente'), 'inexistente');
});

// ── Integração com guards.validarClassificacao (Camada 1 — vocabulário fechado) ──

test('REGISTRO: classificação válida de gasto_por_categoria passa no guard', () => {
  const saida = { intent: 'gasto_por_categoria', params: { categoria: 'carnes', periodo: 'mes_atual' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, true);
  assert.equal(r.intent, 'gasto_por_categoria');
});

test('REGISTRO: categoria fora do vocabulário fechado é rejeitada pelo guard', () => {
  const saida = { intent: 'gasto_por_categoria', params: { categoria: 'eletronicos' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_invalido');
});

test('REGISTRO: período opcional ausente é aceito (executor aplica default)', () => {
  const saida = { intent: 'comparar_meses', params: {} };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, true);
});

test('REGISTRO: parâmetro não declarado na intenção é rejeitado pelo guard', () => {
  const saida = { intent: 'gasto_total_mes', params: { categoria: 'carnes' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_desconhecido');
});

test('REGISTRO: intent fora do registro é rejeitada pelo guard', () => {
  const saida = { intent: 'previsao_do_tempo', params: {} };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'intent_desconhecida');
});

test('REGISTRO: tem exatamente as 3 intenções do MVP, todas com executar/template', () => {
  assert.equal(REGISTRO.length, 3);
  const ids = REGISTRO.map((i) => i.id).sort();
  assert.deepEqual(ids, ['comparar_meses', 'gasto_por_categoria', 'gasto_total_mes']);
  for (const intent of REGISTRO) {
    assert.equal(typeof intent.executar, 'function');
    assert.equal(typeof intent.template, 'function');
    assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length > 0);
  }
});
