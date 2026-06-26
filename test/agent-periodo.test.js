// test/agent-periodo.test.js — testes do parser de período (cod-0010)
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolverPeriodo } = require('../src/agent/periodo.js');

// Data fixa pra testes determinísticos: 15 de junho de 2026
const HOJE = new Date('2026-06-15T12:00:00');
// Janeiro de 2026, para testar virada de ano
const HOJE_JAN = new Date('2026-01-10T12:00:00');

// ── Rótulos fixos ─────────────────────────────────────────────────────────────

test('resolverPeriodo: mes_atual retorna o mês corrente', () => {
  assert.equal(resolverPeriodo('mes_atual', HOJE), '2026-06');
});

test('resolverPeriodo: MES_ATUAL (maiúsculas) funciona por case-insensitive', () => {
  assert.equal(resolverPeriodo('MES_ATUAL', HOJE), '2026-06');
});

test('resolverPeriodo: mes_passado retorna o mês anterior', () => {
  assert.equal(resolverPeriodo('mes_passado', HOJE), '2026-05');
});

test('resolverPeriodo: mes_passado em janeiro retorna dezembro do ano anterior', () => {
  assert.equal(resolverPeriodo('mes_passado', HOJE_JAN), '2025-12');
});

// ── Nome de mês em português ─────────────────────────────────────────────────

test('resolverPeriodo: maio (já passou em junho) → 2026-05', () => {
  assert.equal(resolverPeriodo('maio', HOJE), '2026-05');
});

test('resolverPeriodo: janeiro (já passou em junho) → 2026-01', () => {
  assert.equal(resolverPeriodo('janeiro', HOJE), '2026-01');
});

test('resolverPeriodo: junho (mês atual) → 2026-06', () => {
  assert.equal(resolverPeriodo('junho', HOJE), '2026-06');
});

test('resolverPeriodo: julho (ainda não chegou em junho) → 2025-07', () => {
  assert.equal(resolverPeriodo('julho', HOJE), '2025-07');
});

test('resolverPeriodo: dezembro (ainda não chegou em junho) → 2025-12', () => {
  assert.equal(resolverPeriodo('dezembro', HOJE), '2025-12');
});

test('resolverPeriodo: março com acento → 2026-03', () => {
  assert.equal(resolverPeriodo('março', HOJE), '2026-03');
});

test('resolverPeriodo: marco sem acento → 2026-03', () => {
  assert.equal(resolverPeriodo('marco', HOJE), '2026-03');
});

// ── Passthrough YYYY-MM ───────────────────────────────────────────────────────

test('resolverPeriodo: YYYY-MM válido faz passthrough normalizado', () => {
  assert.equal(resolverPeriodo('2025-11', HOJE), '2025-11');
});

test('resolverPeriodo: YYYY-MM com padding — 2026-01 preserva zeros', () => {
  assert.equal(resolverPeriodo('2026-01', HOJE), '2026-01');
});

// ── Casos inválidos ───────────────────────────────────────────────────────────

test('resolverPeriodo: YYYY-MM com mês 13 → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo('2026-13', HOJE), { invalido: true });
});

test('resolverPeriodo: YYYY-MM com mês 00 → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo('2026-00', HOJE), { invalido: true });
});

test('resolverPeriodo: string aleatória → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo('semana', HOJE), { invalido: true });
});

test('resolverPeriodo: "essa semana" → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo('essa semana', HOJE), { invalido: true });
});

test('resolverPeriodo: null → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo(null, HOJE), { invalido: true });
});

test('resolverPeriodo: string vazia → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo('', HOJE), { invalido: true });
});

test('resolverPeriodo: número puro → {invalido:true}', () => {
  assert.deepEqual(resolverPeriodo(42, HOJE), { invalido: true });
});
