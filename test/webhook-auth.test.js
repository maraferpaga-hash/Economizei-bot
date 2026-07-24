// test/webhook-auth.test.js — autenticação do webhook (cod-0053; achado N1 da
// Auditoria Externa 2026-07-17: /webhook aceitava payload forjado de qualquer origem).
//
// Critérios de aceite:
//   • sem ZAPI_WEBHOOK_TOKEN → { ok:true, modo:'aberto' } (compat, rollout sem downtime)
//   • env setada + segredo correto no path   → { ok:true,  modo:'fechado' }
//   • env setada + segredo correto no header  → { ok:true,  modo:'fechado' }
//   • env setada + segredo errado/ausente     → { ok:false, modo:'fechado' }  (→ 401 na rota)
//   • função pura (lê process.env em tempo de chamada; nunca Supabase/Z-API real)
//
// Rodar: node --test

'use strict';

// index.js requer supabase.js, que cria o client no require — env dummy só pra
// carga (nenhuma rede: autenticarWebhook é puro). Mesmo padrão do webhook-dedup.test.js.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// require.main !== module aqui → o index.js NÃO abre porta nem inicia scheduler.
const { autenticarWebhook } = require('../src/index.js');

const TOKEN = 'segredo-de-teste-abc123';

// req falso: token no path e/ou header x-webhook-token
function fakeReq({ pathToken, headerToken } = {}) {
  return {
    params: pathToken === undefined ? {} : { token: pathToken },
    header: (nome) => (nome === 'x-webhook-token' ? headerToken ?? null : null),
  };
}

// Cada caso controla process.env.ZAPI_WEBHOOK_TOKEN e restaura ao final.
function comEnv(valor, fn) {
  const antes = process.env.ZAPI_WEBHOOK_TOKEN;
  if (valor === undefined) delete process.env.ZAPI_WEBHOOK_TOKEN;
  else process.env.ZAPI_WEBHOOK_TOKEN = valor;
  try {
    fn();
  } finally {
    if (antes === undefined) delete process.env.ZAPI_WEBHOOK_TOKEN;
    else process.env.ZAPI_WEBHOOK_TOKEN = antes;
  }
}

test('sem ZAPI_WEBHOOK_TOKEN → passa em modo aberto (compat / rollout)', () => {
  comEnv(undefined, () => {
    const r = autenticarWebhook(fakeReq());
    assert.deepEqual(r, { ok: true, modo: 'aberto' });
  });
});

test('sem env: passa mesmo se vier um token qualquer no path', () => {
  comEnv(undefined, () => {
    const r = autenticarWebhook(fakeReq({ pathToken: 'qualquer-coisa' }));
    assert.equal(r.ok, true);
    assert.equal(r.modo, 'aberto');
  });
});

test('env setada + segredo correto no path → ok, modo fechado', () => {
  comEnv(TOKEN, () => {
    const r = autenticarWebhook(fakeReq({ pathToken: TOKEN }));
    assert.deepEqual(r, { ok: true, modo: 'fechado' });
  });
});

test('env setada + segredo correto no header x-webhook-token → ok', () => {
  comEnv(TOKEN, () => {
    const r = autenticarWebhook(fakeReq({ headerToken: TOKEN }));
    assert.deepEqual(r, { ok: true, modo: 'fechado' });
  });
});

test('env setada + segredo errado no path → bloqueia', () => {
  comEnv(TOKEN, () => {
    const r = autenticarWebhook(fakeReq({ pathToken: 'errado' }));
    assert.deepEqual(r, { ok: false, modo: 'fechado' });
  });
});

test('env setada + sem segredo nenhum → bloqueia (payload forjado no /webhook legado)', () => {
  comEnv(TOKEN, () => {
    const r = autenticarWebhook(fakeReq());
    assert.deepEqual(r, { ok: false, modo: 'fechado' });
  });
});

test('env setada + header errado → bloqueia', () => {
  comEnv(TOKEN, () => {
    const r = autenticarWebhook(fakeReq({ headerToken: 'nope' }));
    assert.equal(r.ok, false);
  });
});

test('path tem precedência, mas header correto também vale se o path não vier', () => {
  comEnv(TOKEN, () => {
    // path correto ganha
    assert.equal(autenticarWebhook(fakeReq({ pathToken: TOKEN, headerToken: 'x' })).ok, true);
    // sem path, header correto resolve
    assert.equal(autenticarWebhook(fakeReq({ headerToken: TOKEN })).ok, true);
  });
});

test('robusto a req sem params/header (não lança)', () => {
  comEnv(TOKEN, () => {
    assert.doesNotThrow(() => autenticarWebhook({}));
    assert.equal(autenticarWebhook({}).ok, false);
  });
});
