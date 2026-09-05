// test/cron-monthly-entrada.test.js — cod-0078
//
// Achados (2) e (3) do las-06 (revisão de segurança de 2026-08-31):
//   • /cron/monthly-summary aceitava `phone` e `mes` sem validar nada, enquanto
//     o /admin/ativar-pro, 50 linhas acima, valida com regex;
//   • o mesmo endpoint devolvia o telefone SEM maskPhone no corpo da resposta.
//
// Aqui testamos a validação pura (mesma estratégia do webhook-auth.test.js:
// função exportada test-only, sem subir o servidor) e a máscara do telefone na
// forma como o handler a monta.
//
// Rodar: node --test

'use strict';

// index.js requer supabase.js, que cria o client no require — env dummy só pra
// carga (nenhuma rede: as funções sob teste são puras).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// require.main !== module aqui → o index.js NÃO abre porta nem inicia scheduler.
const {
  normalizarPhoneQuery,
  mesRefValido,
  validarEntradaResumoMensal,
} = require('../src/index.js');
const { maskPhone } = require('../src/logger.js');

// ── normalizarPhoneQuery (a regra que o /admin/ativar-pro já usava) ─────────

test('normalizarPhoneQuery: aceita DDI+DDD+numero e tira o +', () => {
  assert.equal(normalizarPhoneQuery('5517999990000'), '5517999990000');
  assert.equal(normalizarPhoneQuery('+5517999990000'), '5517999990000');
  assert.equal(normalizarPhoneQuery('  5517999990000  '), '5517999990000');
});

test('normalizarPhoneQuery: recusa o que não é telefone', () => {
  for (const ruim of ['', '55', 'abc', '55abc999990000', '5517999990000000000', null, undefined, 42, {}]) {
    assert.equal(normalizarPhoneQuery(ruim), null, `deveria recusar: ${JSON.stringify(ruim)}`);
  }
});

// ── mesRefValido ────────────────────────────────────────────────────────────

test('mesRefValido: aceita AAAA-MM com mês real', () => {
  for (const bom of ['2026-01', '2026-09', '2026-12']) {
    assert.equal(mesRefValido(bom), true, bom);
  }
});

test('mesRefValido: recusa formato torto e mês inexistente', () => {
  for (const ruim of ['2026-13', '2026-00', '2026-9', '09-2026', '2026/09', '2026', '', null, undefined, 202609]) {
    assert.equal(mesRefValido(ruim), false, `deveria recusar: ${JSON.stringify(ruim)}`);
  }
});

// ── validarEntradaResumoMensal ──────────────────────────────────────────────

test('phone inválido → recusa (viraria 400, sem tocar o banco)', () => {
  const r = validarEntradaResumoMensal({ phone: 'nao-e-telefone' });
  assert.equal(r.ok, false);
  assert.match(r.erro, /phone/);
});

test('mes inválido → recusa antes de chegar ao executarResumoMensal', () => {
  const r = validarEntradaResumoMensal({ mes: '2026-13' });
  assert.equal(r.ok, false);
  assert.match(r.erro, /mes/);
});

test('caminho feliz: sem query nenhuma, mês corrente e phone null (o cron normal)', () => {
  const r = validarEntradaResumoMensal({});
  assert.equal(r.ok, true);
  assert.equal(r.phone, null, 'sem phone = todos os usuários, comportamento de sempre');
  assert.equal(r.mesRef, new Date().toISOString().slice(0, 7));
});

test('caminho feliz: phone e mes válidos passam inalterados', () => {
  const r = validarEntradaResumoMensal({ phone: '+5517999990000', mes: '2026-08' });
  assert.deepEqual(r, { ok: true, phone: '5517999990000', mesRef: '2026-08' });
});

test('phone vazio é ausência, não erro (query string sem valor)', () => {
  const r = validarEntradaResumoMensal({ phone: '', mes: '' });
  assert.equal(r.ok, true);
  assert.equal(r.phone, null);
  assert.equal(r.mesRef, new Date().toISOString().slice(0, 7));
});

// ── LGPD: a resposta não devolve o telefone cru ─────────────────────────────

test('a resposta do endpoint mascara o telefone', () => {
  const { phone, mesRef } = validarEntradaResumoMensal({ phone: '5517999990000', mes: '2026-08' });
  // mesma expressão do handler
  const corpo = { aceito: true, mes: mesRef, phone_especifico: phone ? maskPhone(phone) : null };

  assert.notEqual(corpo.phone_especifico, '5517999990000');
  assert.equal(corpo.phone_especifico, maskPhone('5517999990000'));
  assert.ok(
    !JSON.stringify(corpo).includes('5517999990000'),
    'o número cru não pode aparecer no corpo da resposta'
  );
});

test('sem phone, a resposta continua com null (não inventa máscara)', () => {
  const { phone, mesRef } = validarEntradaResumoMensal({});
  const corpo = { aceito: true, mes: mesRef, phone_especifico: phone ? maskPhone(phone) : null };
  assert.equal(corpo.phone_especifico, null);
});
