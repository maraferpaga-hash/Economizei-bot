// test/agent-intents-leva2.test.js — Leva 2a de intents do Agente (cod-0040)
//
// Cobre executar() + template() das 4 intents novas (inflacao_item,
// raio_x_categorias, economia_acumulada, onde_cortar), nos dois estados:
// com dados (fato rico, fmt.* via brl) e sem dados (temDados:false → resposta
// honesta de ausência, nunca zero disfarçado). I/O sempre injetado via `deps`
// (nunca Supabase real). Camada 4: as conclusões repassam o que a análise do
// insights.js validou. Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  REGISTRO,
  inflacaoItem,
  raioXCategorias,
  economiaAcumulada,
  ondeCortar,
} = require('../src/agent/intents.js');

// ── registro ────────────────────────────────────────────────────────────────

test('leva 2a: as 4 intents estão no REGISTRO com descricao e exemplos (o classificador deriva daqui)', () => {
  for (const id of ['inflacao_item', 'raio_x_categorias', 'economia_acumulada', 'onde_cortar']) {
    const intent = REGISTRO.find((i) => i.id === id);
    assert.ok(intent, `${id} presente no REGISTRO`);
    assert.ok(intent.descricao && intent.descricao.length > 10, `${id} tem descricao`);
    assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length >= 3, `${id} tem exemplos`);
    assert.equal(typeof intent.executar, 'function');
    assert.equal(typeof intent.template, 'function');
  }
});

// ── inflacao_item ───────────────────────────────────────────────────────────

// Observações com >14 dias de intervalo e variação >8% (limiares do insights.js)
const ITENS_INFLACAO = [
  {
    nomeCanonico: 'arroz 5kg', categoria: 'mercearia',
    observacoes: [{ data: '2026-05-01', preco: 20 }, { data: '2026-06-15', preco: 25 }],
  },
  {
    nomeCanonico: 'feijão', categoria: 'mercearia',
    observacoes: [{ data: '2026-05-01', preco: 10 }, { data: '2026-06-15', preco: 9 }],
  },
];

test('inflacao_item: sem preços repetidos → temDados:false e template honesto sem número', async () => {
  const fato = await inflacaoItem.executar('551799', {}, {
    buscarHistoricoPrecoItens: async () => [],
  });
  assert.equal(fato.temDados, false);
  const msg = inflacaoItem.template(fato);
  assert.match(msg, /Ainda não tenho preços repetidos/);
  assert.ok(!/\d/.test(msg.replace('/inflacao', '')), 'ausência não cita número');
});

test('inflacao_item: fato rico com maior alta e maior queda, fmt via brl', async () => {
  const fato = await inflacaoItem.executar('551799', {}, {
    buscarHistoricoPrecoItens: async () => ITENS_INFLACAO,
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.maiorAlta.nome, 'arroz 5kg');
  assert.equal(fato.fmt.altaAntigo, 'R$ 20,00');
  assert.equal(fato.fmt.altaNovo, 'R$ 25,00');
  assert.equal(fato.fmt.altaPct, '25%');
  assert.equal(fato.maiorQueda.nome, 'feijão');
  assert.equal(fato.fmt.quedaPct, '10%'); // absoluto, sem sinal
  const msg = inflacaoItem.template(fato);
  assert.match(msg, /arroz 5kg: R\$ 20,00 → R\$ 25,00 \(\+25%\)/);
  assert.match(msg, /feijão: R\$ 10,00 → R\$ 9,00 \(−10%\)/);
  assert.match(msg, /\/inflacao/);
});

test('inflacao_item: só altas também funciona (sem trecho de queda)', async () => {
  const fato = await inflacaoItem.executar('551799', {}, {
    buscarHistoricoPrecoItens: async () => [ITENS_INFLACAO[0]],
  });
  assert.equal(fato.maiorQueda, null);
  const msg = inflacaoItem.template(fato);
  assert.ok(!msg.includes('mais caiu'));
});

// ── raio_x_categorias ───────────────────────────────────────────────────────

const GASTOS_MES = [
  { categoria: 'carnes', total: 200 },
  { categoria: 'doces', total: 60 },
  { categoria: 'hortifruti', total: 140 },
];

test('raio_x_categorias: sem gastos → temDados:false com o mês na resposta', async () => {
  const fato = await raioXCategorias.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [],
    buscarHistoricoCategorias: async () => null,
  });
  assert.equal(fato.temDados, false);
  assert.match(raioXCategorias.template(fato), /Ainda não tenho gastos categorizados em Junho\/2026/);
});

test('raio_x_categorias: fato rico com top, % e comparação com a média (Camada 4: repassa a análise)', async () => {
  const fato = await raioXCategorias.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => GASTOS_MES,
    // média histórica de carnes = 30% → 50% atual = 'acima' (limiar ±5pp do insights.js)
    buscarHistoricoCategorias: async () => ({
      mesesComDados: 3,
      porCategoria: { carnes: { mediaPct: 30, mediaValor: 120 } },
    }),
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.top.categoria, 'carnes');
  assert.equal(fato.fmt.topValor, 'R$ 200,00');
  assert.equal(fato.fmt.topPct, '50%');
  assert.equal(fato.comparativo, 'acima');
  // candidato a corte: doces = 15% do mês (≥10%) → entra como FATO
  assert.equal(fato.fmt.corteValor, 'R$ 60,00');
  const msg = raioXCategorias.template(fato);
  assert.match(msg, /maior gasto foi carnes e aves: R\$ 200,00 \(50% do mês, acima da sua média\)/);
  assert.match(msg, /doces e petiscos foram R\$ 60,00 \(15% do mês\)/);
});

test('raio_x_categorias: histórico falhando não derruba a resposta (degradação segura)', async () => {
  const fato = await raioXCategorias.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
    buscarHistoricoCategorias: async () => { throw new Error('boom'); },
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.comparativo, null); // sem histórico → sem comparação inventada
  const msg = raioXCategorias.template(fato);
  assert.ok(!msg.includes('média'), 'sem histórico não fala de média');
});

// ── economia_acumulada ──────────────────────────────────────────────────────

const TOTAIS = [
  { mes: '2026-04', total: 500 },
  { mes: '2026-05', total: 500 },
  { mes: '2026-06', total: 420 },
];

test('economia_acumulada: menos de 2 meses → temDados:false, template pede mais cupons', async () => {
  const fato = await economiaAcumulada.executar('551799', {}, {
    buscarTotaisMensais: async () => [{ mes: '2026-06', total: 400 }],
  });
  assert.equal(fato.temDados, false);
  assert.match(economiaAcumulada.template(fato), /pelo menos dois meses/);
});

test('economia_acumulada: mês abaixo da média — diferença, média e acumulado do ano', async () => {
  const fato = await economiaAcumulada.executar('551799', {}, {
    buscarTotaisMensais: async () => TOTAIS,
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.mesRef, '2026-06'); // sem período → mês mais recente da série (como o /economia)
  assert.equal(fato.fmt.mediaRef, 'R$ 500,00');
  assert.equal(fato.fmt.diferencaMes, 'R$ 80,00');
  assert.equal(fato.fmt.economiaAno, 'R$ 80,00');
  const msg = economiaAcumulada.template(fato);
  assert.match(msg, /R\$ 80,00 abaixo da sua média de mercado \(R\$ 500,00\/mês\)/);
  assert.match(msg, /no seu bolso/);
});

test('economia_acumulada: mês acima da média fala do valor a mais, sem linha do ano quando economiaAno=0', async () => {
  const fato = await economiaAcumulada.executar('551799', {}, {
    buscarTotaisMensais: async () => [
      { mes: '2026-05', total: 400 },
      { mes: '2026-06', total: 460 },
    ],
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.fmt.economiaAno, undefined);
  const msg = economiaAcumulada.template(fato);
  assert.match(msg, /R\$ 60,00 a mais que sua média/);
  assert.ok(!msg.includes('no seu bolso'));
});

test('economia_acumulada: período explícito fora da série → temDados:false (nunca número chutado)', async () => {
  const fato = await economiaAcumulada.executar('551799', { periodo: '2025-01' }, {
    buscarTotaisMensais: async () => TOTAIS,
  });
  assert.equal(fato.temDados, false);
});

// ── onde_cortar ─────────────────────────────────────────────────────────────

test('onde_cortar: sem supérflua relevante → temDados:false, resposta honesta', async () => {
  const fato = await ondeCortar.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 300 }],
    buscarHistoricoCategorias: async () => null,
  });
  assert.equal(fato.temDados, false);
  assert.match(ondeCortar.template(fato), /não encontrei categorias supérfluas/);
});

test('onde_cortar: sugestões com valor, % e "acima da média" só quando a análise validou', async () => {
  const fato = await ondeCortar.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [
      { categoria: 'carnes', total: 200 },
      { categoria: 'doces', total: 60 },     // 15% do mês; média hist 40 → acima (>10%)
      { categoria: 'bebidas', total: 140 },  // 35% do mês; média hist 150 → não acima
    ],
    buscarHistoricoCategorias: async () => ({
      mesesComDados: 3,
      porCategoria: {
        doces: { mediaPct: 10, mediaValor: 40 },
        bebidas: { mediaPct: 30, mediaValor: 150 },
      },
    }),
  });
  assert.equal(fato.temDados, true);
  assert.equal(fato.sugestoes.length, 2);
  // ordenação da análise: acimaDaMedia primeiro → doces vem antes de bebidas
  assert.equal(fato.sugestoes[0].categoria, 'doces');
  assert.equal(fato.fmt.s1Valor, 'R$ 60,00');
  assert.equal(fato.fmt.s1Media, 'R$ 40,00');
  const msg = ondeCortar.template(fato);
  assert.match(msg, /doces e petiscos: R\$ 60,00 \(15% do mês, acima da sua média de R\$ 40,00\/mês\)/);
  assert.match(msg, /bebidas: R\$ 140,00 \(35% do mês\)/);
  assert.ok(!msg.match(/bebidas[^;]*acima/), 'bebidas não está acima da média — não pode afirmar');
});

test('onde_cortar: histórico falhando não derruba (sugestões sem comparação)', async () => {
  const fato = await ondeCortar.executar('551799', { periodo: '2026-06' }, {
    buscarGastosPorCategoria: async () => [
      { categoria: 'doces', total: 50 },
      { categoria: 'carnes', total: 100 },
    ],
    buscarHistoricoCategorias: async () => { throw new Error('boom'); },
  });
  assert.equal(fato.temDados, true);
  assert.ok(!ondeCortar.template(fato).includes('média'));
});
