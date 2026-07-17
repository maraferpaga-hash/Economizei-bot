// test/webhook-documento.test.js — Frente 1, plumbing (cod-0061).
// Cobre as partes PURAS do recebimento de DOCUMENTO no webhook:
//   • validarPayloadWebhook reconhece body.document → tipo 'documento'
//   • gate de MIME (mimeAceitavel): só foto/PDF passam
// A leitura/classificação por tipo de comprovante e a persistência são cod-0062.
//
// Rodar: node --test

'use strict';

// index.js requer supabase.js, que cria o client no require — env dummy só pra
// carga (nenhuma chamada de rede: validação de payload e mimeAceitavel são puras).
// Mesmo padrão do webhook-dedup.test.js. require.main !== module aqui → o index.js
// NÃO abre porta nem inicia scheduler.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validarPayloadWebhook, mimeAceitavel } = require('../src/index.js');
const { montarMensagemDocumentoNaoSuportado } = require('../src/formatter.js');

const PHONE = '5517999999999';
const URL_OK = 'https://cdn.z-api.io/recibo.pdf';

// ── validarPayloadWebhook — documento ────────────────────────────────────────

test('payload: documento válido (documentUrl + mimeType) → ok com tipo/documentUrl/mimeType/messageId', () => {
  const val = validarPayloadWebhook({
    phone: PHONE,
    messageId: 'MSG-D1',
    document: { documentUrl: URL_OK, mimeType: 'application/pdf' },
  });
  assert.deepEqual(val, {
    ok: true,
    phone: PHONE,
    tipo: 'documento',
    messageId: 'MSG-D1',
    documentUrl: URL_OK,
    mimeType: 'application/pdf',
  });
});

test('payload: documento com foto (image/jpeg) → ok, mimeType preservado', () => {
  const val = validarPayloadWebhook({
    phone: PHONE,
    document: { documentUrl: 'https://cdn.z-api.io/cupom.jpg', mimeType: 'image/jpeg' },
  });
  assert.equal(val.ok, true);
  assert.equal(val.tipo, 'documento');
  assert.equal(val.documentUrl, 'https://cdn.z-api.io/cupom.jpg');
  assert.equal(val.mimeType, 'image/jpeg');
});

test('payload: documento com URL em campo alternativo (url / fileUrl) → aceito (defensivo)', () => {
  const v1 = validarPayloadWebhook({ phone: PHONE, document: { url: URL_OK, mimeType: 'application/pdf' } });
  const v2 = validarPayloadWebhook({ phone: PHONE, document: { fileUrl: URL_OK, mimeType: 'application/pdf' } });
  assert.equal(v1.ok, true);
  assert.equal(v1.documentUrl, URL_OK);
  assert.equal(v2.ok, true);
  assert.equal(v2.documentUrl, URL_OK);
});

test('payload: documento sem mimeType → ok com mimeType null (gate acontece no processarDocumento)', () => {
  const val = validarPayloadWebhook({ phone: PHONE, document: { documentUrl: URL_OK } });
  assert.equal(val.ok, true);
  assert.equal(val.tipo, 'documento');
  assert.equal(val.mimeType, null);
});

test('payload: documento sem URL válida (não-http / ausente / não-string) → rejeitado, phone preservado pro rate limit', () => {
  const casos = [
    { phone: PHONE, document: { documentUrl: 'ftp://x/recibo.pdf', mimeType: 'application/pdf' } },
    { phone: PHONE, document: { documentUrl: '/recibo.pdf' } },
    { phone: PHONE, document: {} },
    { phone: PHONE, document: { documentUrl: 123 } },
  ];
  for (const body of casos) {
    const val = validarPayloadWebhook(body);
    assert.equal(val.ok, false, `deveria rejeitar: ${JSON.stringify(body.document)}`);
    assert.equal(val.motivo, 'document.documentUrl ausente');
    assert.equal(val.phone, PHONE, 'phone válido fica no resultado (rate limit conta antes de rejeitar)');
    assert.equal(val.tipo, 'documento');
  }
});

test('payload: documento com messageId com espaços é trimado', () => {
  const val = validarPayloadWebhook({ phone: PHONE, messageId: '  MSG-D9  ', document: { documentUrl: URL_OK, mimeType: 'application/pdf' } });
  assert.equal(val.messageId, 'MSG-D9');
});

test('payload: texto e imagem têm precedência sobre documento (ordem de tipo inalterada)', () => {
  // Se por algum motivo o payload trouxer text E document, mantém o comportamento
  // determinístico: texto primeiro (não vira documento).
  const comTexto = validarPayloadWebhook({ phone: PHONE, text: { message: 'oi' }, document: { documentUrl: URL_OK } });
  assert.equal(comTexto.tipo, 'texto');
  const comImagem = validarPayloadWebhook({ phone: PHONE, image: { imageUrl: 'https://x/y.jpg' }, document: { documentUrl: URL_OK } });
  assert.equal(comImagem.tipo, 'imagem');
});

// ── mimeAceitavel — gate de MIME ─────────────────────────────────────────────

test('mimeAceitavel: foto e PDF são aceitos', () => {
  for (const m of ['image/jpeg', 'image/png', 'image/webp', 'IMAGE/JPEG', 'application/pdf', 'application/pdf; charset=binary']) {
    assert.equal(mimeAceitavel(m), true, `deveria aceitar: ${m}`);
  }
});

test('mimeAceitavel: áudio/vídeo/contato/zip e afins são recusados', () => {
  for (const m of ['audio/ogg', 'video/mp4', 'text/vcard', 'application/zip', 'application/octet-stream']) {
    assert.equal(mimeAceitavel(m), false, `deveria recusar: ${m}`);
  }
});

test('mimeAceitavel: MIME ausente/desconhecido (null, undefined, número, vazio) → recusa (protege orçamento e guia o usuário)', () => {
  assert.equal(mimeAceitavel(null), false);
  assert.equal(mimeAceitavel(undefined), false);
  assert.equal(mimeAceitavel(42), false);
  assert.equal(mimeAceitavel(''), false);
  assert.equal(mimeAceitavel('   '), false);
});

// ── Mensagem honesta de MIME não suportado ───────────────────────────────────

test('montarMensagemDocumentoNaoSuportado: honesta, guia pra foto/PDF, sem gíria', () => {
  const msg = montarMensagemDocumentoNaoSuportado();
  assert.equal(typeof msg, 'string');
  assert.match(msg, /foto|PDF/i, 'deve orientar a mandar como foto ou PDF');
  // sem gíria proibida no texto do bot (regra 4 da seção 11 do CLAUDE.md: cê/tá/né/ó)
  assert.doesNotMatch(msg, /\bcê\b|\btá\b|\bné\b|\bó\b/i);
});
