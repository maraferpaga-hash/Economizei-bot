// cod-0032 — bloco de gasto supérfluo no /gastos e no resumo mensal.
// Cobre: os estados do bloco (some / "bom sinal" / com dados), o número
// primeiro sem moralizar, a compatibilidade retro (sem o parâmetro nada muda)
// e a copy (sem gíria proibida, sem token de plano/preço).
const { test } = require('node:test');
const assert = require('node:assert');

const {
  montarBlocoSuperfluo,
  montarMensagemGastos,
  montarResumoMensal,
} = require('../src/formatter');

// Fixture no formato exato de buscarGastoSuperfluo (insights.js, cod-0030)
const ANALISE = {
  totalSuperfluo: 52.4,
  pctDoMes: 11,
  porCategoria: [
    { categoria: 'doces', valor: 30, pct: 6 },
    { categoria: 'bebidas', valor: 22.4, pct: 5 },
  ],
};

const ANALISE_VAZIA = { totalSuperfluo: 0, pctDoMes: 0, porCategoria: [] };

const DADOS_CAT = [
  { categoria: 'carnes', total: 200 },
  { categoria: 'doces', total: 30 },
];

const DADOS_RESUMO = {
  totalGasto: 480,
  qtdCompras: 4,
  ticketMedio: 120,
  topLojas: [{ loja: 'Mercado Central', total: 300, qtd: 2 }],
  topItens: [],
};

// ── montarBlocoSuperfluo ────────────────────────────────────────────────────

test('bloco: análise null/undefined/inválida → string vazia (bloco some, nunca finge)', () => {
  assert.strictEqual(montarBlocoSuperfluo(null), '');
  assert.strictEqual(montarBlocoSuperfluo(undefined), '');
  assert.strictEqual(montarBlocoSuperfluo({}), '');
  assert.strictEqual(montarBlocoSuperfluo({ totalSuperfluo: 10 }), ''); // sem porCategoria array
});

test('bloco: gastou no mês mas nada de supérfluo → "bom sinal" (≠ sem gasto no mês)', () => {
  const bloco = montarBlocoSuperfluo(ANALISE_VAZIA);
  assert.ok(bloco.includes('bom sinal'));
  assert.ok(bloco.includes('Supérfluos'));
  // honestidade: não pode parecer "mês sem compra"
  assert.ok(!bloco.toLowerCase().includes('sem gasto no mês'));
  assert.ok(!bloco.toLowerCase().includes('não tenho dados'));
});

test('bloco com dados: número primeiro, % do mês e categorias com rótulo em português', () => {
  const bloco = montarBlocoSuperfluo(ANALISE);
  assert.ok(bloco.includes('R$ 52,40'));
  assert.ok(bloco.includes('11% do mês'));
  assert.ok(bloco.includes('Doces e Petiscos'));
  assert.ok(bloco.includes('Bebidas'));
  assert.ok(bloco.includes('R$ 30,00'));
  assert.ok(bloco.includes('R$ 22,40'));
  // número primeiro: o total vem antes de qualquer nome de categoria
  assert.ok(bloco.indexOf('R$ 52,40') < bloco.indexOf('Doces e Petiscos'));
});

test('bloco: totalSuperfluo zero/negativo com porCategoria preenchida não inventa número', () => {
  const bloco = montarBlocoSuperfluo({ totalSuperfluo: 0, pctDoMes: 0, porCategoria: [{ categoria: 'doces', valor: 0, pct: 0 }] });
  assert.ok(bloco.includes('bom sinal'));
  assert.ok(!bloco.includes('0% do mês'));
});

test('bloco: categoria desconhecida cai no nome cru (não quebra)', () => {
  const bloco = montarBlocoSuperfluo({ totalSuperfluo: 5, pctDoMes: 2, porCategoria: [{ categoria: 'categoria_nova', valor: 5, pct: 2 }] });
  assert.ok(bloco.includes('categoria_nova'));
  assert.ok(bloco.includes('R$ 5,00'));
});

test('bloco: copy sem gíria proibida e sem token de plano/preço (firewall de copy)', () => {
  for (const bloco of [montarBlocoSuperfluo(ANALISE), montarBlocoSuperfluo(ANALISE_VAZIA)]) {
    const lower = bloco.toLowerCase();
    for (const proibido of ['cê', 'né', 'véi', 'mano', 'rapaz']) {
      assert.ok(!lower.includes(proibido), `gíria proibida no bloco: ${proibido}`);
    }
    for (const financeiro of ['plano', 'assine', 'r$ 9,90', 'upgrade']) {
      assert.ok(!lower.includes(financeiro), `token financeiro no bloco: ${financeiro}`);
    }
    // sem moralizar
    for (const moral of ['culpa', 'vergonha', 'desperdício', 'errado']) {
      assert.ok(!lower.includes(moral), `tom moralizante no bloco: ${moral}`);
    }
  }
});

// ── montarMensagemGastos ────────────────────────────────────────────────────

test('/gastos SEM o parâmetro novo → mensagem idêntica ao comportamento antigo (retrocompatível)', () => {
  const msg = montarMensagemGastos(DADOS_CAT, '2026-07');
  assert.ok(!msg.includes('Supérfluos'));
});

test('/gastos com análise → bloco aparece depois do Total e antes do rodapé', () => {
  const msg = montarMensagemGastos(DADOS_CAT, '2026-07', null, ANALISE);
  assert.ok(msg.includes('Supérfluos: R$ 52,40'));
  assert.ok(msg.indexOf('Total:') < msg.indexOf('Supérfluos'));
  assert.ok(msg.indexOf('Supérfluos') < msg.indexOf('/gastos a qualquer hora'));
});

test('/gastos com análise vazia → estado "bom sinal" dentro da mensagem', () => {
  const msg = montarMensagemGastos(DADOS_CAT, '2026-07', null, ANALISE_VAZIA);
  assert.ok(msg.includes('bom sinal'));
});

test('/gastos sem dados de categoria continua com o vazio honesto de sempre (sem bloco)', () => {
  const msg = montarMensagemGastos([], '2026-07', null, ANALISE);
  assert.ok(msg.includes('Ainda não tenho dados de categoria'));
  assert.ok(!msg.includes('Supérfluos'));
});

// ── montarResumoMensal ──────────────────────────────────────────────────────

test('resumo mensal SEM o parâmetro novo → sem bloco (retrocompatível)', () => {
  const msg = montarResumoMensal(DADOS_RESUMO, null, '2026-07');
  assert.ok(!msg.includes('Supérfluos'));
});

test('resumo mensal com análise → bloco no fim, com total no topo intacto', () => {
  const msg = montarResumoMensal(DADOS_RESUMO, null, '2026-07', null, ANALISE);
  assert.ok(msg.includes('R$ 480,00'));
  assert.ok(msg.includes('Supérfluos: R$ 52,40'));
  assert.ok(msg.includes('11% do mês'));
  // o total do mês continua vindo antes do bloco (número principal primeiro)
  assert.ok(msg.indexOf('R$ 480,00') < msg.indexOf('Supérfluos'));
});

test('resumo mensal com análise vazia → "bom sinal" honesto', () => {
  const msg = montarResumoMensal(DADOS_RESUMO, null, '2026-07', null, ANALISE_VAZIA);
  assert.ok(msg.includes('bom sinal'));
});
