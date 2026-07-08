// test/agent-classifier.test.js — testes do classificador (cod-0013)
//
// Cobre:
//  (1) montarPromptClassificacao — PURA: monta do registro (ids + exemplos +
//      vocabulário fechado), inclui a pergunta, é determinística e NÃO pede número.
//  (2) classificar — parse + validação de resposta JSON SIMULADA (chamarModelo
//      injetado, nunca toca a API): caminho feliz, fora_de_escopo, param inválido
//      (porta de topicalidade), intent inexistente, JSON inválido, erro do modelo,
//      cerca de markdown, normalização de confiança, pergunta vazia.
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { montarPromptClassificacao, classificar } = require('../src/agent/classifier.js');
const { REGISTRO } = require('../src/agent/intents.js');

// Fábrica de chamarModelo simulado: devolve sempre a mesma string bruta.
function modeloQueDevolve(brutoOuFn) {
  return async () => (typeof brutoOuFn === 'function' ? brutoOuFn() : brutoOuFn);
}
const json = (obj) => JSON.stringify(obj);

// ── montarPromptClassificacao (PURA) ────────────────────────────────────────

test('prompt: inclui os ids e exemplos do registro', () => {
  const p = montarPromptClassificacao(REGISTRO, 'quanto gastei em carne?');
  assert.ok(p.includes('gasto_total_mes'));
  assert.ok(p.includes('gasto_por_categoria'));
  assert.ok(p.includes('comparar_meses'));
  assert.ok(p.includes('quanto gastei em carne')); // um dos exemplos do registro
});

test('prompt: inclui o vocabulário fechado (categorias e rótulos de período)', () => {
  const p = montarPromptClassificacao(REGISTRO, 'x');
  assert.ok(p.includes('carnes'));
  assert.ok(p.includes('bebidas'));
  assert.ok(p.includes('mes_atual'));
  assert.ok(p.includes('mes_passado'));
  assert.ok(p.includes('fora_de_escopo'));
});

test('prompt: embute a pergunta do usuário e proíbe devolver número', () => {
  const p = montarPromptClassificacao(REGISTRO, 'tô gastando mais que mês passado?');
  assert.ok(p.includes('tô gastando mais que mês passado?'));
  assert.ok(/NUNCA devolva valores de gasto/i.test(p));
});

test('prompt: é determinístico (mesma entrada → mesma string)', () => {
  const a = montarPromptClassificacao(REGISTRO, 'quanto gastei esse mês');
  const b = montarPromptClassificacao(REGISTRO, 'quanto gastei esse mês');
  assert.equal(a, b);
});

// ── classificar — caminho feliz ─────────────────────────────────────────────

test('classificar: JSON válido de gasto_por_categoria → intent + params + confianca', async () => {
  const r = await classificar('quanto gastei em carne esse mês', {
    chamarModelo: modeloQueDevolve(
      json({ intent: 'gasto_por_categoria', params: { categoria: 'carnes', periodo: 'mes_atual' }, confianca: 'alta' })
    ),
  });
  assert.equal(r.intent, 'gasto_por_categoria');
  assert.equal(r.params.categoria, 'carnes');
  assert.equal(r.params.periodo, 'mes_atual');
  assert.equal(r.confianca, 'alta');
});

test('classificar: período mes_passado passa pela validação', async () => {
  const r = await classificar('gastei mais que mês passado?', {
    chamarModelo: modeloQueDevolve(
      json({ intent: 'comparar_meses', params: { periodo: 'mes_passado' }, confianca: 'media' })
    ),
  });
  assert.equal(r.intent, 'comparar_meses');
  assert.equal(r.params.periodo, 'mes_passado');
});

test('classificar: aceita JSON com cerca de markdown', async () => {
  const bruto = '```json\n' + json({ intent: 'gasto_total_mes', params: {}, confianca: 'alta' }) + '\n```';
  const r = await classificar('quanto gastei', { chamarModelo: modeloQueDevolve(bruto) });
  assert.equal(r.intent, 'gasto_total_mes');
});

// ── classificar — fora de escopo / degradação segura ────────────────────────

test('classificar: modelo devolve fora_de_escopo → fora_de_escopo', async () => {
  const r = await classificar('qual a capital da França?', {
    chamarModelo: modeloQueDevolve(json({ intent: 'fora_de_escopo' })),
  });
  assert.equal(r.intent, 'fora_de_escopo');
});

test('classificar: intent inexistente → fora_de_escopo', async () => {
  const r = await classificar('faz um bolo pra mim', {
    chamarModelo: modeloQueDevolve(json({ intent: 'fazer_bolo', params: {}, confianca: 'baixa' })),
  });
  assert.equal(r.intent, 'fora_de_escopo');
});

test('classificar: JSON inválido → fora_de_escopo', async () => {
  const r = await classificar('quanto gastei', { chamarModelo: modeloQueDevolve('isto não é json') });
  assert.equal(r.intent, 'fora_de_escopo');
});

test('classificar: erro do modelo → fora_de_escopo (não propaga exceção)', async () => {
  const r = await classificar('quanto gastei', {
    chamarModelo: async () => { throw new Error('Gemini fora do ar'); },
  });
  assert.equal(r.intent, 'fora_de_escopo');
});

test('classificar: pergunta vazia → fora_de_escopo sem chamar o modelo', async () => {
  let chamou = false;
  const r = await classificar('   ', { chamarModelo: async () => { chamou = true; return json({ intent: 'gasto_total_mes' }); } });
  assert.equal(r.intent, 'fora_de_escopo');
  assert.equal(chamou, false);
});

// ── classificar — porta de topicalidade (param inválido é saneado, não descartado) ──

test('classificar: categoria inválida é removida, mas a intenção (sobre dinheiro) permanece', async () => {
  const r = await classificar('quanto gastei em pet shop', {
    chamarModelo: modeloQueDevolve(
      json({ intent: 'gasto_por_categoria', params: { categoria: 'petshop' }, confianca: 'media' })
    ),
  });
  // categoria fora do enum → saneada; intent preservada (template responde o total)
  assert.equal(r.intent, 'gasto_por_categoria');
  assert.equal(r.params.categoria, undefined);
});

test('classificar: período inválido é removido, intenção permanece', async () => {
  const r = await classificar('quanto gastei ontem', {
    chamarModelo: modeloQueDevolve(
      json({ intent: 'gasto_total_mes', params: { periodo: 'ontem' }, confianca: 'baixa' })
    ),
  });
  assert.equal(r.intent, 'gasto_total_mes');
  assert.equal(r.params.periodo, undefined);
});

test('classificar: parâmetro desconhecido é descartado, intenção permanece', async () => {
  const r = await classificar('quanto gastei esse mês', {
    chamarModelo: modeloQueDevolve(
      json({ intent: 'gasto_total_mes', params: { foo: 'bar' }, confianca: 'alta' })
    ),
  });
  assert.equal(r.intent, 'gasto_total_mes');
  assert.equal(r.params.foo, undefined);
});

// ── classificar — normalização de confiança ─────────────────────────────────

test('classificar: confiança ausente/estranha vira "media"', async () => {
  const r = await classificar('quanto gastei', {
    chamarModelo: modeloQueDevolve(json({ intent: 'gasto_total_mes', params: {} })),
  });
  assert.equal(r.confianca, 'media');
});
