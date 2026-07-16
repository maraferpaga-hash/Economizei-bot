// test/agent-intents-leva2b.test.js — Leva 2b de intents do Agente (cod-0041)
//
// Cobre executar() + template() das 2 intents novas (comparativo_mercados,
// gasto_superfluo), nos dois estados: com dados (fato rico, fmt.* via brl)
// e sem dados (temDados:false → resposta honesta de ausência, NUNCA número
// chutado — critério explícito da tarefa pro comparativo). I/O sempre
// injetado via `deps` (nunca Supabase real). O teaser do comparativo usa a
// MESMA env do /comparar (`COMPARATIVO_AMOSTRAS_FREE`) — testada aqui nas
// duas vias (env e deps.maxComparativos). Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  REGISTRO,
  comparativoMercados,
  gastoSuperfluo,
} = require('../src/agent/intents.js');

// ── registro ────────────────────────────────────────────────────────────────

test('leva 2b: as 2 intents estão no REGISTRO com descricao e exemplos (o classificador deriva daqui)', () => {
  for (const id of ['comparativo_mercados', 'gasto_superfluo']) {
    const intent = REGISTRO.find((i) => i.id === id);
    assert.ok(intent, `${id} presente no REGISTRO`);
    assert.ok(intent.descricao && intent.descricao.length > 10, `${id} tem descricao`);
    assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length >= 3, `${id} tem exemplos`);
    assert.equal(typeof intent.executar, 'function');
    assert.equal(typeof intent.template, 'function');
  }
});

// ── comparativo_mercados ────────────────────────────────────────────────────

// Observações recentes (mesma semana → dentro da janela de 60 dias) com o
// mesmo produto canônico em 2+ lojas. arroz: R$5 de diferença (20%);
// leite: R$1 (20%). O destaque é a MAIOR diferença absoluta (arroz).
const OBS_COMPARAVEIS = [
  { produto_canonico: 'arroz 5kg', loja: 'Mercado A', preco_unit: 20, data_obs: '2026-07-01' },
  { produto_canonico: 'arroz 5kg', loja: 'Mercado B', preco_unit: 25, data_obs: '2026-07-02' },
  { produto_canonico: 'leite integral', loja: 'Mercado A', preco_unit: 4, data_obs: '2026-07-01' },
  { produto_canonico: 'leite integral', loja: 'Mercado B', preco_unit: 5, data_obs: '2026-07-02' },
];

function depsComparativo(retorno) {
  return { buscarObservacoesComparativo: async () => retorno };
}

test('comparativo: base sem produto em ≥2 lojas → temDados:false e template honesto sem número', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: [
      { produto_canonico: 'arroz 5kg', loja: 'Mercado A', preco_unit: 20, data_obs: '2026-07-01' },
    ],
    produtosDoUsuario: null,
    lojaDoUsuario: null,
  }));
  assert.equal(fato.temDados, false);
  const txt = comparativoMercados.template(fato);
  assert.match(txt, /Ainda não encontrei/);
  assert.doesNotMatch(txt, /R\$/); // nunca número chutado no estado-vazio
});

test('comparativo: base vazia → temDados:false (nunca exceção)', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: [], produtosDoUsuario: null, lojaDoUsuario: null,
  }));
  assert.equal(fato.temDados, false);
});

test('comparativo: com dados → destaque é a MAIOR diferença, fmt.* via brl', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: null,
  }));
  assert.equal(fato.temDados, true);
  assert.equal(fato.destaque.produto, 'arroz 5kg'); // R$5 > R$1
  assert.equal(fato.fmt.menorPreco, 'R$ 20,00');
  assert.equal(fato.fmt.maiorPreco, 'R$ 25,00');
  assert.equal(fato.fmt.economia, 'R$ 5,00');
  assert.equal(fato.fmt.economiaPct, '20%');
  assert.equal(fato.totalComparaveis, 2);
  const txt = comparativoMercados.template(fato);
  assert.match(txt, /arroz 5kg/);
  assert.match(txt, /R\$ 20,00/);
  assert.match(txt, /R\$ 5,00/);
  assert.match(txt, /\/comparar/); // aponta pra lista completa quando há mais de 1
});

test('comparativo: usuário comprou no mais barato → elogio, sem "dava pra economizar"', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: 'Mercado A',
  }));
  assert.equal(fato.destaque.posicaoUsuario, 'mais_barato');
  const txt = comparativoMercados.template(fato);
  assert.match(txt, /mais barato/);
  assert.doesNotMatch(txt, /dava pra economizar/);
});

test('comparativo: usuário pagou mais caro → mostra o preço dele e a economia possível', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: 'Mercado B',
  }));
  assert.equal(fato.fmt.precoUsuario, 'R$ 25,00');
  assert.equal(fato.fmt.economiaUsuario, 'R$ 5,00');
  const txt = comparativoMercados.template(fato);
  assert.match(txt, /Você pagou R\$ 25,00/);
  assert.match(txt, /economizar R\$ 5,00/);
});

test('comparativo: deps.maxComparativos limita a lista (teaser), temMais honesto', async () => {
  const fato = await comparativoMercados.executar('551799', {
  }, {
    ...depsComparativo({ observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: null }),
    maxComparativos: 1,
  });
  assert.equal(fato.mostrados, 1);
  assert.equal(fato.totalComparaveis, 2);
  assert.equal(fato.temMais, true);
});

test('comparativo: sem deps.maxComparativos, usa COMPARATIVO_AMOSTRAS_FREE (mesma env do /comparar)', async () => {
  const anterior = process.env.COMPARATIVO_AMOSTRAS_FREE;
  process.env.COMPARATIVO_AMOSTRAS_FREE = '1';
  try {
    const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
      observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: null,
    }));
    assert.equal(fato.mostrados, 1);
    assert.equal(fato.temMais, true);
  } finally {
    if (anterior === undefined) delete process.env.COMPARATIVO_AMOSTRAS_FREE;
    else process.env.COMPARATIVO_AMOSTRAS_FREE = anterior;
  }
});

test('comparativo: template nunca cita plano nem valor de mensalidade (o gate é humano, depois)', async () => {
  const fato = await comparativoMercados.executar('551799', {}, depsComparativo({
    observacoes: OBS_COMPARAVEIS, produtosDoUsuario: null, lojaDoUsuario: null,
  }));
  const txt = comparativoMercados.template(fato) + comparativoMercados.template({ temDados: false });
  assert.doesNotMatch(txt, /[Pp]lano|[Pp]ro\b|9,90/);
});

// ── gasto_superfluo ─────────────────────────────────────────────────────────

const GASTOS_MES = [
  { categoria: 'carnes', total: 120 },
  { categoria: 'doces', total: 50 },
  { categoria: 'bebidas', total: 30 },
]; // total do mês: 200

function depsSuperfluo(gastos, cats) {
  return {
    buscarGastosPorCategoria: async () => gastos,
    buscarCategoriasSuperfluas: async () => cats,
  };
}

test('superfluo: mês sem gasto nenhum → temDados:false com teveGastoNoMes:false ("ainda não tenho gastos")', async () => {
  const fato = await gastoSuperfluo.executar('551799', { periodo: 'mes_atual' }, depsSuperfluo([], null));
  assert.equal(fato.temDados, false);
  assert.equal(fato.teveGastoNoMes, false);
  assert.match(gastoSuperfluo.template(fato), /Ainda não tenho gastos/);
});

test('superfluo: tem gastos mas nada nas categorias supérfluas → vazio honesto DIFERENTE ("bom sinal")', async () => {
  const fato = await gastoSuperfluo.executar('551799', {},
    depsSuperfluo([{ categoria: 'carnes', total: 100 }], null));
  assert.equal(fato.temDados, false);
  assert.equal(fato.teveGastoNoMes, true);
  assert.match(gastoSuperfluo.template(fato), /Bom sinal/);
});

test('superfluo: baseline (doces+bebidas) quando o usuário não configurou nada', async () => {
  const fato = await gastoSuperfluo.executar('551799', {}, depsSuperfluo(GASTOS_MES, null));
  assert.equal(fato.temDados, true);
  assert.equal(fato.totalSuperfluo, 80); // 50 + 30
  assert.equal(fato.pctDoMes, 40); // 80/200
  assert.equal(fato.fmt.total, 'R$ 80,00');
  assert.equal(fato.fmt.pct, '40%');
  const txt = gastoSuperfluo.template(fato);
  assert.match(txt, /R\$ 80,00/);
  assert.match(txt, /40%/);
  assert.match(txt, /doces/);
  assert.match(txt, /bebidas/);
});

test('superfluo: categorias configuradas pelo usuário substituem o baseline', async () => {
  const fato = await gastoSuperfluo.executar('551799', {}, depsSuperfluo(GASTOS_MES, ['carnes']));
  assert.equal(fato.temDados, true);
  assert.equal(fato.totalSuperfluo, 120);
  assert.equal(fato.pctDoMes, 60);
  assert.doesNotMatch(gastoSuperfluo.template(fato), /doces/);
});

test('superfluo: falha ao buscar categorias configuradas → degrada pro baseline (nunca exceção)', async () => {
  const fato = await gastoSuperfluo.executar('551799', {}, {
    buscarGastosPorCategoria: async () => GASTOS_MES,
    buscarCategoriasSuperfluas: async () => { throw new Error('rede caiu'); },
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.totalSuperfluo, 80); // baseline
});

test('superfluo: template nunca cita plano nem valor de mensalidade (o gate é humano, depois)', async () => {
  const fato = await gastoSuperfluo.executar('551799', {}, depsSuperfluo(GASTOS_MES, null));
  const txt = gastoSuperfluo.template(fato)
    + gastoSuperfluo.template({ temDados: false, teveGastoNoMes: true, mesRef: '2026-07' })
    + gastoSuperfluo.template({ temDados: false, teveGastoNoMes: false, mesRef: '2026-07' });
  assert.doesNotMatch(txt, /[Pp]lano|9,90/);
});
