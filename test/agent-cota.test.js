// test/agent-cota.test.js — decisão de cota do agente (cod-0016)
//
// Critérios de aceite da AGENDA:
//   • decidirCota puro e testado (15/30 cruza metade; 30/30 e 31 atingido)
//   • funções supabase SEM nenhum token proibido (o teste varre o fonte dos
//     módulos do agente + a seção nova do supabase.js com termos montados
//     por partes neutras, pra própria lista não disparar o scan do firewall)
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { decidirCota, LIMITE_DEFAULT } = require('../src/agent/cota.js');

// ── decidirCota (puro) ───────────────────────────────────────────────────────

test('15/30: cruza a metade exatamente nesta pergunta (aviso do meio)', () => {
  const r = decidirCota(15, 30);
  assert.equal(r.cruzouMetade, true);
  assert.equal(r.atingido, false);
});

test('14/30 e 16/30: NÃO cruzam a metade (aviso é idempotente por igualdade)', () => {
  assert.equal(decidirCota(14, 30).cruzouMetade, false);
  assert.equal(decidirCota(16, 30).cruzouMetade, false);
});

test('30/30: atingido (não responde mais no mês)', () => {
  const r = decidirCota(30, 30);
  assert.equal(r.atingido, true);
});

test('31/30: atingido (contador acima do teto continua barrado)', () => {
  assert.equal(decidirCota(31, 30).atingido, true);
});

test('0/30: livre, sem aviso', () => {
  const r = decidirCota(0, 30);
  assert.equal(r.atingido, false);
  assert.equal(r.cruzouMetade, false);
});

test('limite ímpar: metade = ceil (7 → aviso na 4ª)', () => {
  assert.equal(decidirCota(4, 7).cruzouMetade, true);
  assert.equal(decidirCota(3, 7).cruzouMetade, false);
});

test('entradas inválidas degradam com segurança (default 30, usadas 0)', () => {
  const r = decidirCota(undefined, 'abc');
  assert.equal(r.limite, LIMITE_DEFAULT);
  assert.equal(r.usadas, 0);
  assert.equal(r.atingido, false);
});

test('usadas negativas viram 0 (nunca cota negativa)', () => {
  assert.equal(decidirCota(-3, 30).usadas, 0);
});

// ── firewall: nenhum token financeiro no código do agente ───────────────────
// Termos montados por concatenação de partes neutras — a lista em si não
// contém o token literal (mesma técnica do apagar.test.js).

const TOKENS_PROIBIDOS = [
  'is' + '_' + 'pro',
  'features' + '_pro' + '_ate',
  'assina' + 'tura',
  'mercado' + 'pago',
  'preapp' + 'roval',
  'pay' + 'wall',
  'check' + 'out',
  'ativar' + '-pro',
  'montarMensagem' + 'Planos',
];

test('src/agent/*.js não contém nenhum token financeiro', () => {
  const dir = path.join(__dirname, '..', 'src', 'agent');
  for (const arquivo of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const fonte = fs.readFileSync(path.join(dir, arquivo), 'utf8').toLowerCase();
    for (const token of TOKENS_PROIBIDOS) {
      assert.ok(
        !fonte.includes(token.toLowerCase()),
        `${arquivo} contém o token proibido "${token}"`
      );
    }
  }
});

test('seção do agente no supabase.js não contém token financeiro', () => {
  const fonte = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'supabase.js'),
    'utf8'
  );
  const inicio = fonte.indexOf('Agente de Perguntas (cod-0016)');
  // Se o mount servir versão velha sem a seção, o teste ainda acusa (>= 0).
  assert.ok(inicio >= 0, 'seção do cod-0016 presente no supabase.js');
  const fim = fonte.indexOf('// Dados da', inicio);
  const secao = fonte.slice(inicio, fim > inicio ? fim : undefined).toLowerCase();
  for (const token of TOKENS_PROIBIDOS) {
    assert.ok(
      !secao.includes(token.toLowerCase()),
      `seção do agente no supabase.js contém "${token}"`
    );
  }
});
