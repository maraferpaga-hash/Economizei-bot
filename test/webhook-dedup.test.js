// test/webhook-dedup.test.js — Lei 5 (idempotência por messageId) + validação
// de payload do webhook (cod-0052, achado §6.2 da Auditoria Integral 2026-07-10).
//
// Critérios de aceite da AGENDA:
//   • duplicado=true  → fn NÃO roda e loga webhook_evento_duplicado
//   • duplicado=false → fn roda
//   • sem messageId   → fn roda e loga webhook_sem_message_id
//   • dedup com dependência injetada/mockada (nunca Supabase real)
//   • payload: phone inválido, text vazio, imageUrl não-http → rejeitados
//
// Rodar: node --test

'use strict';

// O index.js requer supabase.js, que cria o client no require — env dummy só
// pra carga (nenhuma chamada de rede acontece: o dedup usa deps injetadas e a
// validação de payload é pura). Mesmo padrão do acompanhamentos-io.test.js.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// require.main !== module aqui → o index.js NÃO abre porta nem inicia scheduler.
const { despacharComDedup, validarPayloadWebhook } = require('../src/index.js');

// ── Helpers ─────────────────────────────────────────────────────────────────

// deps fake do dedup: registra as chamadas e devolve { duplicado } configurado.
function criarDeps(duplicado) {
  const eventos = [];           // logs capturados
  const registros = [];         // chamadas ao registrarMensagemProcessada
  const deps = {
    registrarMensagemProcessada: async (messageId, phone, tipo) => {
      registros.push({ messageId, phone, tipo });
      return { duplicado };
    },
    log: (evento, dados) => eventos.push({ evento, dados }),
  };
  return { deps, eventos, registros };
}

const PHONE = '5517999999999';

// ── despacharComDedup ────────────────────────────────────────────────────────

test('dedup: duplicado=true → fn NÃO roda e loga webhook_evento_duplicado', async () => {
  const { deps, eventos, registros } = criarDeps(true);
  let rodou = 0;

  await despacharComDedup('MSG-001', PHONE, 'texto', async () => { rodou++; }, deps);

  assert.equal(rodou, 0, 'fn não pode rodar em evento duplicado');
  assert.equal(registros.length, 1, 'registrar chamado exatamente 1x');
  const dup = eventos.find((e) => e.evento === 'webhook_evento_duplicado');
  assert.ok(dup, 'deve logar webhook_evento_duplicado');
  assert.equal(dup.dados.message_id, 'MSG-001');
  assert.equal(dup.dados.tipo, 'texto');
});

test('dedup: duplicado=false → fn roda exatamente 1x, sem log de duplicado', async () => {
  const { deps, eventos, registros } = criarDeps(false);
  let rodou = 0;

  await despacharComDedup('MSG-002', PHONE, 'imagem', async () => { rodou++; }, deps);

  assert.equal(rodou, 1);
  assert.equal(registros.length, 1);
  assert.ok(!eventos.some((e) => e.evento === 'webhook_evento_duplicado'));
  assert.ok(!eventos.some((e) => e.evento === 'webhook_sem_message_id'));
});

test('dedup: sem messageId → fn roda, loga webhook_sem_message_id e NUNCA consulta o registro', async () => {
  const { deps, eventos, registros } = criarDeps(false);
  let rodou = 0;

  await despacharComDedup(null, PHONE, 'texto', async () => { rodou++; }, deps);

  assert.equal(rodou, 1, 'sem messageId processa normalmente (sem dedup possível)');
  assert.equal(registros.length, 0, 'registrarMensagemProcessada não deve ser chamado sem messageId');
  assert.ok(eventos.some((e) => e.evento === 'webhook_sem_message_id'));
});

test('dedup: registrar recebe messageId, phone e tipo corretos', async () => {
  const { deps, registros } = criarDeps(false);

  await despacharComDedup('MSG-XYZ', PHONE, 'imagem', async () => {}, deps);

  assert.deepEqual(registros[0], { messageId: 'MSG-XYZ', phone: PHONE, tipo: 'imagem' });
});

test('dedup: logs mascaram o telefone (LGPD — nunca o número inteiro)', async () => {
  const { deps, eventos } = criarDeps(true);
  await despacharComDedup('MSG-003', PHONE, 'texto', async () => {}, deps);

  const { deps: deps2, eventos: eventos2 } = criarDeps(false);
  await despacharComDedup(null, PHONE, 'texto', async () => {}, deps2);

  for (const e of [...eventos, ...eventos2]) {
    assert.ok(!JSON.stringify(e.dados.phone).includes(PHONE), `log ${e.evento} vazou o phone inteiro`);
    assert.ok(String(e.dados.phone).includes('****'), `log ${e.evento} deve mascarar o phone`);
  }
});

test('dedup: erro dentro de fn propaga (o chamador é quem trata com .catch)', async () => {
  const { deps } = criarDeps(false);
  await assert.rejects(
    despacharComDedup('MSG-004', PHONE, 'texto', async () => { throw new Error('boom'); }, deps),
    /boom/
  );
});

// ── validarPayloadWebhook — phone ────────────────────────────────────────────

test('payload: phone ausente → rejeitado com motivo "phone inválido" e phone null', () => {
  const val = validarPayloadWebhook({ text: { message: 'oi' } });
  assert.equal(val.ok, false);
  assert.equal(val.motivo, 'phone inválido');
  assert.equal(val.phone, null);
});

test('payload: phone não-string (número) → rejeitado', () => {
  const val = validarPayloadWebhook({ phone: 5517999999999, text: { message: 'oi' } });
  assert.equal(val.ok, false);
  assert.equal(val.motivo, 'phone inválido');
});

test('payload: phone curto demais / com letras → rejeitado', () => {
  assert.equal(validarPayloadWebhook({ phone: '123' }).ok, false);
  assert.equal(validarPayloadWebhook({ phone: '55179ABC9999' }).ok, false);
});

test('payload: phone com "+" inicial é normalizado (gateway inclui DDI com +)', () => {
  const val = validarPayloadWebhook({ phone: `+${PHONE}`, text: { message: 'oi' } });
  assert.equal(val.ok, true);
  assert.equal(val.phone, PHONE);
});

test('payload: body vazio/nulo → rejeitado sem exceção', () => {
  assert.equal(validarPayloadWebhook(undefined).ok, false);
  assert.equal(validarPayloadWebhook(null).ok, false);
  assert.equal(validarPayloadWebhook({}).ok, false);
});

// ── validarPayloadWebhook — texto ────────────────────────────────────────────

test('payload: text.message vazio ou só espaços → rejeitado', () => {
  const v1 = validarPayloadWebhook({ phone: PHONE, text: { message: '' } });
  const v2 = validarPayloadWebhook({ phone: PHONE, text: { message: '   ' } });
  assert.equal(v1.ok, false);
  assert.equal(v1.motivo, 'text.message ausente');
  assert.equal(v2.ok, false);
});

test('payload: text.message não-string → rejeitado (mas phone válido é preservado pro rate limit)', () => {
  const val = validarPayloadWebhook({ phone: PHONE, text: { message: 42 } });
  assert.equal(val.ok, false);
  assert.equal(val.phone, PHONE, 'phone válido fica no resultado — o handler conta o rate limit antes de rejeitar');
  assert.equal(val.tipo, 'texto');
});

test('payload: texto válido → ok com tipo/mensagem/messageId', () => {
  const val = validarPayloadWebhook({ phone: PHONE, messageId: 'MSG-9', text: { message: 'quanto gastei?' } });
  assert.deepEqual(val, { ok: true, phone: PHONE, tipo: 'texto', messageId: 'MSG-9', mensagem: 'quanto gastei?' });
});

// ── validarPayloadWebhook — imagem ───────────────────────────────────────────

test('payload: imageUrl não-http (ftp/relativa/ausente) → rejeitado', () => {
  const casos = [
    { phone: PHONE, image: { imageUrl: 'ftp://x/cupom.jpg' } },
    { phone: PHONE, image: { imageUrl: '/cupom.jpg' } },
    { phone: PHONE, image: {} },
    { phone: PHONE, image: { imageUrl: 123 } },
  ];
  for (const body of casos) {
    const val = validarPayloadWebhook(body);
    assert.equal(val.ok, false, `deveria rejeitar: ${JSON.stringify(body.image)}`);
    assert.equal(val.motivo, 'image.imageUrl ausente');
  }
});

test('payload: imagem válida (https) → ok com tipo/imageUrl', () => {
  const val = validarPayloadWebhook({ phone: PHONE, messageId: 'MSG-7', image: { imageUrl: 'https://cdn.z-api.io/x.jpg' } });
  assert.deepEqual(val, { ok: true, phone: PHONE, tipo: 'imagem', messageId: 'MSG-7', imageUrl: 'https://cdn.z-api.io/x.jpg' });
});

// ── validarPayloadWebhook — messageId e eventos ignorados ────────────────────

test('payload: messageId com espaços é trimado; vazio/whitespace/não-string vira null', () => {
  assert.equal(validarPayloadWebhook({ phone: PHONE, messageId: '  MSG-5  ', text: { message: 'oi' } }).messageId, 'MSG-5');
  assert.equal(validarPayloadWebhook({ phone: PHONE, messageId: '   ', text: { message: 'oi' } }).messageId, null);
  assert.equal(validarPayloadWebhook({ phone: PHONE, messageId: 777, text: { message: 'oi' } }).messageId, null);
  assert.equal(validarPayloadWebhook({ phone: PHONE, text: { message: 'oi' } }).messageId, null);
});

test('payload: evento sem text nem image (delivery receipt) → ok com tipo "ignorado"', () => {
  const val = validarPayloadWebhook({ phone: PHONE, messageId: 'MSG-8' });
  assert.equal(val.ok, true);
  assert.equal(val.tipo, 'ignorado');
  assert.equal(val.mensagem, undefined);
  assert.equal(val.imageUrl, undefined);
});
