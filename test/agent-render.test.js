// test/agent-render.test.js — testes do render do Agente de Perguntas (cod-0014)
//
// Cobre os critérios de aceite da AGENDA:
//   • caminho template (modo explícito 'template')
//   • caminho llm-APROVADO (LLM simulado que só usa números autorizados)
//   • caminho llm-REPROVADO → fallback pro template (airbag)
//   • prompt de narração proíbe calcular número e proíbe conselho além do dado
// E mais: Camada 3 (sem dado → sem narração), erro do modelo → airbag,
// narração vazia → airbag, allowlist (montarAllowlist).
//
// O LLM é sempre SIMULADO via opts.chamarModelo — nunca toca a API nem carrega
// o SDK. Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { responder, montarPromptNarracao, montarAllowlist } = require('../src/agent/render.js');

// Intent sintética no mesmo shape do intents.js (injetada — desacopla o teste).
const intentFake = {
  id: 'gasto_total_mes',
  descricao: 'Quanto a pessoa gastou no total, num período (mês)',
  template(fato) {
    if (!fato.temDados) return `Ainda não tenho gastos registrados em Junho/2026.`;
    return `Em Junho/2026 você gastou ${fato.fmt.total} no total.`;
  },
};

const fatoComDados = {
  temDados: true,
  mesRef: '2026-06',
  total: 248.3,
  fmt: { total: 'R$ 248,30' },
};

// ── caminho template ─────────────────────────────────────────────────────────

test('modo template: devolve o template determinístico, sem tocar o LLM', async () => {
  let chamouLLM = false;
  const r = await responder(fatoComDados, intentFake, 'template', {
    chamarModelo: async () => { chamouLLM = true; return 'x'; },
  });
  assert.equal(chamouLLM, false);
  assert.equal(r.texto, 'Em Junho/2026 você gastou R$ 248,30 no total.');
  assert.equal(r.modoUsado, 'template');
  assert.equal(r.fidelidadeOk, null);
  assert.equal(r.caiuNoAirbag, false);
});

// ── caminho llm APROVADO ─────────────────────────────────────────────────────

test('modo llm aprovado: narração que só usa números autorizados passa', async () => {
  const r = await responder(fatoComDados, intentFake, 'llm', {
    chamarModelo: async () => 'Neste mês de junho de 2026 suas compras somaram R$ 248,30. 🙂',
  });
  assert.equal(r.modoUsado, 'llm');
  assert.equal(r.fidelidadeOk, true);
  assert.equal(r.caiuNoAirbag, false);
  assert.ok(r.texto.includes('R$ 248,30'));
});

// ── caminho llm REPROVADO → airbag ───────────────────────────────────────────

test('modo llm reprovado: número inventado → cai no template (airbag)', async () => {
  const r = await responder(fatoComDados, intentFake, 'llm', {
    chamarModelo: async () => 'Você gastou R$ 284,30 este mês.', // dígitos trocados
  });
  assert.equal(r.modoUsado, 'template');
  assert.equal(r.fidelidadeOk, false);
  assert.equal(r.caiuNoAirbag, true);
  assert.equal(r.texto, 'Em Junho/2026 você gastou R$ 248,30 no total.');
});

test('modo llm: erro do modelo → airbag (template), nunca exceção pro caller', async () => {
  const r = await responder(fatoComDados, intentFake, 'llm', {
    chamarModelo: async () => { throw new Error('quota exceeded'); },
  });
  assert.equal(r.modoUsado, 'template');
  assert.equal(r.caiuNoAirbag, true);
  assert.equal(r.texto, 'Em Junho/2026 você gastou R$ 248,30 no total.');
});

test('modo llm: narração vazia → airbag (template)', async () => {
  const r = await responder(fatoComDados, intentFake, 'llm', {
    chamarModelo: async () => '   ',
  });
  assert.equal(r.modoUsado, 'template');
  assert.equal(r.caiuNoAirbag, true);
});

// ── Camada 3: sem dado → sem narração ────────────────────────────────────────

test('sem dados (temDados:false): responde o template honesto SEM chamar o LLM', async () => {
  let chamouLLM = false;
  const r = await responder({ temDados: false, mesRef: '2026-06' }, intentFake, 'llm', {
    chamarModelo: async () => { chamouLLM = true; return 'x'; },
  });
  assert.equal(chamouLLM, false);
  assert.equal(r.modoUsado, 'template');
  assert.equal(r.texto, 'Ainda não tenho gastos registrados em Junho/2026.');
});

// ── prompt de narração (Camadas 5 e 6 no contrato) ──────────────────────────

test('prompt: proíbe calcular/alterar número e proíbe conselho além do dado', () => {
  const prompt = montarPromptNarracao(fatoComDados, intentFake, intentFake.template(fatoComDados));
  assert.ok(/NUNCA calcule/i.test(prompt), 'deve proibir calcular');
  assert.ok(/arredonde/i.test(prompt), 'deve proibir arredondar');
  assert.ok(/conselho financeiro/i.test(prompt), 'deve proibir conselho financeiro');
  assert.ok(prompt.includes('R$ 248,30'), 'deve entregar o número já formatado');
  assert.ok(prompt.includes('sem gírias'), 'deve exigir o tom do bot (sem gíria)');
});

test('prompt: embute a resposta-base do template', () => {
  const base = intentFake.template(fatoComDados);
  const prompt = montarPromptNarracao(fatoComDados, intentFake, base);
  assert.ok(prompt.includes(base));
});

// ── allowlist ────────────────────────────────────────────────────────────────

test('montarAllowlist: inclui template, fmt.*, mesRef e pct (cru + arredondado)', () => {
  const fato = {
    temDados: true,
    mesRef: '2026-06',
    pct: -12.4,
    fmt: { totalMesRef: 'R$ 512,00', mediaRef: 'R$ 455,70', diferenca: 'R$ 56,30' },
  };
  const lista = montarAllowlist(fato, 'Em Junho/2026 você gastou R$ 512,00, 12% acima da média.');
  assert.ok(lista.some((p) => String(p).includes('R$ 455,70')));
  assert.ok(lista.includes('2026-06'));
  assert.ok(lista.includes(12), 'pct arredondado (abs) entra como número');
});

test('narração citando o % arredondado do comparativo passa na fidelidade', async () => {
  const intentComparar = {
    id: 'comparar_meses',
    descricao: 'Compara o gasto do mês com a média dos meses anteriores',
    template(fato) {
      return `Em Junho/2026 você gastou ${fato.fmt.totalMesRef}, 12% acima da média dos meses anteriores (${fato.fmt.diferenca} a mais).`;
    },
  };
  const fato = {
    temDados: true,
    mesRef: '2026-06',
    pct: -12.4,
    economiaMes: -56.3,
    fmt: { totalMesRef: 'R$ 512,00', mediaRef: 'R$ 455,70', diferenca: 'R$ 56,30' },
  };
  const r = await responder(fato, intentComparar, 'llm', {
    chamarModelo: async () =>
      'Em junho de 2026 suas compras somaram R$ 512,00 — cerca de 12% acima da sua média (R$ 56,30 a mais).',
  });
  assert.equal(r.modoUsado, 'llm');
  assert.equal(r.fidelidadeOk, true);
});

test('intent sem template() → erro claro (contrato do render)', async () => {
  await assert.rejects(() => responder(fatoComDados, { id: 'x' }, 'template'), /sem template/);
});
