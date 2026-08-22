// test/fmt-moeda.test.js — cod-0065b
//
// `fmtMoeda(valor, moeda)` é a semente da internacionalização (Canadá primeiro,
// seção 7.2 do CLAUDE.md). Duas travas que importam mais que a função em si:
//
//   1. DROP-IN em BRL — `fmtMoeda(v)` tem que ser byte a byte `R$ ${brl(v)}`,
//      senão adotar a função nas mensagens pt-BR de hoje mudaria a copy sem
//      ninguém pedir (o pior tipo de regressão: silenciosa e visível ao usuário).
//   2. NUNCA CHUTAR O SÍMBOLO — moeda desconhecida devolve `null`. Exibir "R$"
//      num valor em CAD é mentir sobre dinheiro; não formatar é só um bug visível.
//
// Rodar: node --test test/fmt-moeda.test.js

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const formatter = require('../src/formatter');
const { fmtMoeda, brl } = formatter;

// Inclui os casos feios de propósito: zero, negativo, milhar, milhão,
// arredondamento pra cima, e o valor que arredonda pra zero vindo de baixo.
const VALORES = [0, 0.004, 0.005, 1, 9.9, 15, 99.9, 396.74, 1234.5, 1234567.891, -0.004, -5, -1234.5];

// ─────────────────────────────────────────────────────────────────────────────
// 1. BRL — drop-in do brl() atual
// ─────────────────────────────────────────────────────────────────────────────

test('BRL é byte a byte igual a `R$ ${brl(v)}` (inclusive negativo e zero)', () => {
  for (const v of VALORES) {
    assert.equal(fmtMoeda(v), `R$ ${brl(v)}`, `divergiu em ${v}`);
    assert.equal(fmtMoeda(v, 'BRL'), `R$ ${brl(v)}`, `divergiu em ${v} com moeda explícita`);
  }
});

test('BRL é o default — chamar sem moeda não muda nada', () => {
  assert.equal(fmtMoeda(99.9), 'R$ 99,90');
  assert.equal(fmtMoeda(1234.5), 'R$ 1.234,50');
  assert.equal(fmtMoeda(0), 'R$ 0,00');
});

test('a copy pt-BR existente segue intacta (brl não foi tocado)', () => {
  assert.equal(brl(99.9), '99,90');
  assert.equal(brl(1234.5), '1.234,50');
  assert.equal(brl(0), '0,00');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CAD — convenção local, sem depender do ICU do runtime
// ─────────────────────────────────────────────────────────────────────────────

test('CAD usa $ colado, ponto decimal e vírgula de milhar', () => {
  assert.equal(fmtMoeda(99.9, 'CAD'), '$99.90');
  assert.equal(fmtMoeda(0, 'CAD'), '$0.00');
  assert.equal(fmtMoeda(1234.5, 'CAD'), '$1,234.50');
  assert.equal(fmtMoeda(1234567.891, 'CAD'), '$1,234,567.89');
});

test('CAD negativo põe o sinal antes do símbolo', () => {
  assert.equal(fmtMoeda(-5, 'CAD'), '-$5.00');
  assert.equal(fmtMoeda(-1234.5, 'CAD'), '-$1,234.50');
});

test('CAD: valor que arredonda pra zero não vira "-$0.00"', () => {
  assert.equal(fmtMoeda(-0.004, 'CAD'), '$0.00');
  assert.equal(fmtMoeda(-0, 'CAD'), '$0.00');
});

test('nome da moeda é aceito em qualquer caixa', () => {
  assert.equal(fmtMoeda(10, 'cad'), fmtMoeda(10, 'CAD'));
  assert.equal(fmtMoeda(10, 'brl'), fmtMoeda(10, 'BRL'));
});

test('arredondamento é o mesmo nas duas moedas (meio centavo pra cima)', () => {
  assert.equal(fmtMoeda(0.005, 'CAD'), '$0.01');
  assert.equal(fmtMoeda(0.004, 'CAD'), '$0.00');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Saída segura — null em vez de número/símbolo errado
// ─────────────────────────────────────────────────────────────────────────────

test('moeda desconhecida devolve null (nunca formata com o símbolo errado)', () => {
  for (const m of ['USD', 'EUR', 'reais', '', null, undefined, 0, {}]) {
    const r = fmtMoeda(10, m);
    if (m === undefined) { assert.equal(r, 'R$ 10,00', 'undefined cai no default BRL'); continue; }
    assert.equal(r, null, `moeda ${JSON.stringify(m)} deveria devolver null`);
  }
});

test('valor não numérico devolve null nas duas moedas', () => {
  for (const v of [null, undefined, '', NaN, Infinity, -Infinity, 'abc', true, false, {}, []]) {
    assert.equal(fmtMoeda(v), null, `BRL aceitou ${JSON.stringify(v)}`);
    assert.equal(fmtMoeda(v, 'CAD'), null, `CAD aceitou ${JSON.stringify(v)}`);
  }
});

test('string numérica é aceita (o valor pode vir do parser como texto)', () => {
  assert.equal(fmtMoeda('99.9'), 'R$ 99,90');
  assert.equal(fmtMoeda('99.9', 'CAD'), '$99.90');
});

test('nenhuma saída contém NaN, undefined ou null como texto', () => {
  for (const v of VALORES) {
    for (const m of ['BRL', 'CAD']) {
      assert.doesNotMatch(fmtMoeda(v, m), /NaN|undefined|null/);
    }
  }
});
