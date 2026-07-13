// test/erro-copy.test.js — cod-0021: a copy de erro não pode mais afirmar que o
// bot rejeita farmácia/posto/restaurante (ele LÊ não-mercado desde 2026-06-04,
// salvando como tipo="outros"). Cobre a mensagem (formatter.js) e a heurística
// de categorização de erro (gemini.js `inferirCategoria`).
//
// Rodar local:  node --test

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { montarMensagemErro } = require('../src/formatter.js');
const { inferirCategoria } = require('../src/gemini.js');

// ── formatter.js — montarMensagemErro ───────────────────────────────────────
test('montarMensagemErro(nao_supermercado): não afirma mais que o bot só lê mercado', () => {
  const msg = montarMensagemErro('não deu pra processar', 'nao_supermercado');
  assert.ok(!msg.includes('só leio cupons de mercado'));
  assert.ok(!msg.includes('Farmácia, restaurante e posto ainda não'));
});

test('montarMensagemErro(nao_supermercado): reflete que lê e classifica como "Outros (não-mercado)"', () => {
  const msg = montarMensagemErro('não deu pra processar', 'nao_supermercado');
  assert.ok(msg.includes('Outros (não-mercado)'));
  assert.ok(msg.includes('qualquer estabelecimento'));
});

test('montarMensagemErro: nenhuma categoria de erro menciona rejeição por tipo de loja', () => {
  const categorias = ['borrado', 'nao_supermercado', 'sem_itens', 'muito_longo', 'nao_e_cupom', 'outro'];
  for (const cat of categorias) {
    const msg = montarMensagemErro('motivo qualquer', cat);
    assert.ok(!msg.toLowerCase().includes('só leio'), `categoria "${cat}" não deveria dizer "só leio"`);
  }
});

// ── gemini.js — inferirCategoria ────────────────────────────────────────────
test('inferirCategoria: motivo citando farmácia/posto/restaurante sozinho não vira "nao_supermercado"', () => {
  assert.notEqual(inferirCategoria('Esse cupom é de uma farmácia'), 'nao_supermercado');
  assert.notEqual(inferirCategoria('Cupom de posto de gasolina'), 'nao_supermercado');
  assert.notEqual(inferirCategoria('Parece ser de um restaurante'), 'nao_supermercado');
});

test('inferirCategoria: continua detectando o problema real mesmo citando o tipo de loja', () => {
  // Antes, "farmác" era checado antes de "item" e mascarava o motivo real.
  assert.equal(inferirCategoria('Não consegui ler os itens desse cupom de farmácia'), 'sem_itens');
  assert.equal(inferirCategoria('Imagem borrada do cupom do posto'), 'borrado');
});

test('inferirCategoria: continua funcionando pros outros motivos', () => {
  assert.equal(inferirCategoria('Foto ficou muito escura'), 'borrado');
  assert.equal(inferirCategoria('Cupom cortado, não vi o total'), 'muito_longo');
  assert.equal(inferirCategoria('Essa imagem não parece um cupom fiscal'), 'nao_e_cupom');
  assert.equal(inferirCategoria('Problema desconhecido'), 'outro');
  assert.equal(inferirCategoria(undefined), 'outro');
});
