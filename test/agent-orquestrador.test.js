// test/agent-orquestrador.test.js — orquestrador do agente (cod-0017)
//
// Critérios de aceite da AGENDA: fluxo de decisão testado com dependências
// SIMULADAS — atingiu limite / off-topic / resposta normal / aviso do meio.
// E mais: erro técnico → mensagem neutra (nunca exceção nem número chutado),
// log da Camada 7 registrado, params repassados ao executor, narração LLM
// reprovada → airbag template de ponta a ponta.
//
// TODAS as dependências de I/O são injetadas: nunca toca Supabase, Z-API ou
// Gemini. O render usado é o REAL (cod-0014) — com o LLM simulado — pra
// testar a integração orquestrador→render de verdade.
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { responderPergunta } = require('../src/agent/index.js');
const { responder } = require('../src/agent/render.js');

// ── harness ──────────────────────────────────────────────────────────────────

const intentFake = {
  id: 'gasto_total_mes',
  descricao: 'Quanto a pessoa gastou no total, num período (mês)',
  parametros: { periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' } },
  async executar(phone, params) {
    this._chamadoCom = { phone, params };
    return { temDados: true, mesRef: '2026-06', total: 248.3, fmt: { total: 'R$ 248,30' } };
  },
  template(fato) {
    if (!fato.temDados) return 'Ainda não tenho gastos registrados em Junho/2026.';
    return `Em Junho/2026 você gastou ${fato.fmt.total} no total.`;
  },
};

// deps padrão de teste: cota livre, classificador direto, render real em modo
// template, envio/log capturados em arrays.
function montarDeps(sobrescrever = {}) {
  const enviadas = [];
  const logadas = [];
  const deps = {
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 3, limite: 30 }),
    incrementarPerguntas: async () => 4,
    registrarPergunta: async (e) => { logadas.push(e); },
    enviarMensagem: async (phone, texto) => { enviadas.push(texto); },
    classificar: async () => ({ intent: 'gasto_total_mes', params: { periodo: '2026-06' }, confianca: 'alta' }),
    responder,
    registro: [intentFake],
    modo: 'template',
    ...sobrescrever,
  };
  return { deps, enviadas, logadas };
}

// ── atingiu limite ───────────────────────────────────────────────────────────

test('cota atingida: envia a mensagem de limite e NÃO classifica', async () => {
  let classificou = false;
  const { deps, enviadas, logadas } = montarDeps({
    verificarLimitePerguntas: async () => ({ atingido: true, usadas: 30, limite: 30 }),
    classificar: async () => { classificou = true; return { intent: 'gasto_total_mes' }; },
  });
  const r = await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(r.respondeu, false);
  assert.equal(r.motivo, 'limite_atingido');
  assert.equal(classificou, false);
  assert.equal(enviadas.length, 1);
  assert.ok(enviadas[0].includes('30 perguntas'), 'mensagem de limite com o teto');
  assert.equal(logadas[0].respondeu, false);
});

// ── off-topic ────────────────────────────────────────────────────────────────

test('fora de escopo: mensagem gentil de escopo, sem incrementar cota', async () => {
  let incrementou = false;
  const { deps, enviadas, logadas } = montarDeps({
    classificar: async () => ({ intent: 'fora_de_escopo' }),
    incrementarPerguntas: async () => { incrementou = true; return 1; },
  });
  const r = await responderPergunta('5511999999999', 'qual a capital da França?', deps);
  assert.equal(r.respondeu, false);
  assert.equal(r.motivo, 'fora_de_escopo');
  assert.equal(incrementou, false, 'off-topic não consome cota (AGENDA cod-0017)');
  assert.ok(enviadas[0].includes('seus gastos de mercado'), 'resposta de escopo');
  assert.equal(logadas[0].intent, 'fora_de_escopo', 'Camada 7: off-topic vai pro log');
});

// ── resposta normal ──────────────────────────────────────────────────────────

test('resposta normal: executa com os params, responde e registra tudo', async () => {
  const { deps, enviadas, logadas } = montarDeps();
  const r = await responderPergunta('5511999999999', 'quanto gastei em junho?', deps);

  assert.equal(r.respondeu, true);
  assert.equal(r.intent, 'gasto_total_mes');
  assert.deepEqual(intentFake._chamadoCom.params, { periodo: '2026-06' }, 'params do classificador chegam no executor');
  assert.equal(enviadas.length, 1, 'sem aviso do meio (4/30)');
  assert.equal(enviadas[0], 'Em Junho/2026 você gastou R$ 248,30 no total.');

  const logEntry = logadas[0];
  assert.equal(logEntry.respondeu, true);
  assert.equal(logEntry.intent, 'gasto_total_mes');
  assert.equal(logEntry.temDados, true);
  assert.equal(logEntry.modo, 'template');
});

// ── aviso do meio ────────────────────────────────────────────────────────────

test('aviso do meio: 14→15 de 30 dispara a 2ª mensagem com a contagem', async () => {
  const { deps, enviadas } = montarDeps({
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 14, limite: 30 }),
    incrementarPerguntas: async () => 15,
  });
  const r = await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(r.respondeu, true);
  assert.equal(enviadas.length, 2, 'resposta + aviso do meio');
  assert.ok(enviadas[1].includes('15 das 30'), 'aviso cita a contagem exata');
});

test('aviso do meio NÃO repete fora da igualdade (15→16)', async () => {
  const { deps, enviadas } = montarDeps({
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 15, limite: 30 }),
    incrementarPerguntas: async () => 16,
  });
  await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(enviadas.length, 1);
});

test('incrementarPerguntas falhando (null): usa cota.usadas+1 como fallback', async () => {
  const { deps, enviadas } = montarDeps({
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 14, limite: 30 }),
    incrementarPerguntas: async () => null,
  });
  await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(enviadas.length, 2, 'aviso do meio ainda sai via fallback local');
});

// ── narração LLM de ponta a ponta (render real) ─────────────────────────────

test('modo llm: narração aprovada sai pro usuário; log marca fidelidade', async () => {
  const { deps, enviadas, logadas } = montarDeps({
    modo: 'llm',
    responder: (fato, def, modo) => responder(fato, def, modo, {
      chamarModelo: async () => 'Suas compras de junho de 2026 somaram R$ 248,30. 🙂',
    }),
  });
  await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.ok(enviadas[0].includes('somaram R$ 248,30'));
  assert.equal(logadas[0].modo, 'llm');
  assert.equal(logadas[0].fidelidadeOk, true);
});

test('modo llm: número inventado → airbag template chega ao usuário', async () => {
  const { deps, enviadas, logadas } = montarDeps({
    modo: 'llm',
    responder: (fato, def, modo) => responder(fato, def, modo, {
      chamarModelo: async () => 'Você gastou R$ 999,99 este mês!',
    }),
  });
  await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(enviadas[0], 'Em Junho/2026 você gastou R$ 248,30 no total.');
  assert.equal(logadas[0].modo, 'template');
  assert.equal(logadas[0].fidelidadeOk, false, 'reprovação auditável no log');
});

// ── erro técnico ─────────────────────────────────────────────────────────────

test('erro técnico (classificador caiu): mensagem neutra, sem exceção, sem número', async () => {
  const { deps, enviadas } = montarDeps({
    classificar: async () => { throw new Error('Gemini indisponível'); },
  });
  const r = await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(r.respondeu, false);
  assert.equal(r.motivo, 'erro_tecnico');
  assert.ok(enviadas[0].includes('problema técnico'));
  assert.ok(enviadas[0].includes('/gastos'), 'saída por comando (Desenho §9)');
});

test('erro técnico (executor caiu): mesma degradação honesta', async () => {
  const intentQuebrada = {
    ...intentFake,
    executar: async () => { throw new Error('query falhou'); },
  };
  const { deps, enviadas } = montarDeps({ registro: [intentQuebrada] });
  const r = await responderPergunta('5511999999999', 'quanto gastei?', deps);
  assert.equal(r.motivo, 'erro_tecnico');
  assert.ok(enviadas[0].includes('problema técnico'));
});

test('intent fora do registro injetado: cai em fora de escopo (defesa extra)', async () => {
  const { deps, enviadas } = montarDeps({
    classificar: async () => ({ intent: 'intencao_fantasma', params: {} }),
  });
  const r = await responderPergunta('5511999999999', 'x', deps);
  assert.equal(r.motivo, 'intent_desconhecida');
  assert.ok(enviadas[0].includes('seus gastos de mercado'));
});
