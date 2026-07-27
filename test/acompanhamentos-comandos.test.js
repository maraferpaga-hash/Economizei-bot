// test/acompanhamentos-comandos.test.js — comandos de acompanhamento (cod-0033)
//
// Cobre a lógica PURA de parsing (insights.js) e as mensagens (formatter.js) dos
// comandos /acompanhar, /parar, /acompanhamentos e /superfluo. A I/O (cod-0031)
// já é testada em test/acompanhamentos-io.test.js; aqui o foco é:
//   • interpretarAcompanhamento decide categoria×termo e recusa vazio/curto
//   • interpretarSuperfluo alterna/liga/desliga e rejeita categoria inválida
//   • o alvo gerado casa itens reais via buscarGastoPorAlvo (cod-0030)
//   • copy honesta e sem gíria proibida (cê/tá/né/ó) — decisão 2026-05-26
//
// NÃO toca no caminho do dinheiro (sem gate Pro — passo humano). Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  interpretarAcompanhamento,
  interpretarSuperfluo,
  buscarGastoPorAlvo,
} = require('../src/insights.js');
const {
  montarAcompanharConfirmado,
  montarAcompanharErro,
  montarAcompanharParado,
  montarListaAcompanhamentos,
  montarSuperfluoConfirmado,
  montarSuperfluoConfig,
  montarSuperfluoInvalido,
} = require('../src/formatter.js');

// Gíria proibida no texto do bot (só marketing pode usar) — decisão 2026-05-26.
function semGiria(texto) {
  return !/\b(cê|tá|né|ó)\b/i.test(texto);
}

// ── interpretarAcompanhamento ───────────────────────────────────────────────

test('interpretarAcompanhamento: uma das 10 categorias vira tipo_alvo=categoria', () => {
  const r = interpretarAcompanhamento('doces');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'categoria');
  assert.equal(r.alvo, 'doces');
  assert.equal(r.rotulo, 'doces');
});

test('interpretarAcompanhamento: palavra livre vira tipo_alvo=termo', () => {
  const r = interpretarAcompanhamento('cerveja');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'termo');
  assert.equal(r.alvo, 'cerveja');
});

test('interpretarAcompanhamento: preserva acento no rótulo mas grava termo utilizável', () => {
  const r = interpretarAcompanhamento('Ração');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'termo');
  assert.equal(r.rotulo, 'ração');       // exibição em minúsculas com acento
  assert.equal(r.alvo, 'ração');
});

test('interpretarAcompanhamento: termo com mais de uma palavra é mantido', () => {
  const r = interpretarAcompanhamento('papel higienico');
  assert.equal(r.ok, true);
  assert.equal(r.tipo_alvo, 'termo');
  assert.equal(r.alvo, 'papel higienico');
});

test('interpretarAcompanhamento: argumento vazio é recusado', () => {
  assert.deepEqual(interpretarAcompanhamento(''), { ok: false, motivo: 'vazio' });
  assert.deepEqual(interpretarAcompanhamento('   '), { ok: false, motivo: 'vazio' });
  assert.deepEqual(interpretarAcompanhamento(null), { ok: false, motivo: 'vazio' });
});

test('interpretarAcompanhamento: termo curto demais (<3) é recusado', () => {
  assert.deepEqual(interpretarAcompanhamento('uv'), { ok: false, motivo: 'curto' });
  // 'uva' (3 letras) já passa — espelha a guarda do matching (_casaTermo ≥3)
  assert.equal(interpretarAcompanhamento('uva').ok, true);
});

test('interpretarAcompanhamento: o alvo gerado casa itens reais (buscarGastoPorAlvo)', () => {
  const itens = [
    { nome_canonico: 'cerveja skol lata 350ml', categoria: 'bebidas', preco_total: 4.5, compra_id: 1 },
    { nome_canonico: 'cerveja heineken 600ml',  categoria: 'bebidas', preco_total: 12,  compra_id: 1 },
    { nome_canonico: 'arroz tio joao 5kg',      categoria: 'mercearia', preco_total: 25, compra_id: 2 },
  ];
  const alvo = interpretarAcompanhamento('cerveja');
  const r = buscarGastoPorAlvo(itens, { tipo: alvo.tipo_alvo, valor: alvo.alvo });
  assert.equal(r.total, 16.5);
  assert.equal(r.qtdCompras, 1);
});

// ── interpretarSuperfluo ────────────────────────────────────────────────────

test('interpretarSuperfluo: sem argumento apenas lista a config atual', () => {
  const r = interpretarSuperfluo('', ['doces', 'bebidas']);
  assert.equal(r.ok, true);
  assert.equal(r.acao, 'listar');
  assert.deepEqual(r.categorias.sort(), ['bebidas', 'doces']);
});

test('interpretarSuperfluo: toggle adiciona categoria que não estava', () => {
  const r = interpretarSuperfluo('carnes', ['doces']);
  assert.equal(r.ok, true);
  assert.equal(r.acao, 'add');
  assert.equal(r.categoria, 'carnes');
  assert.ok(r.categorias.includes('carnes'));
  assert.ok(r.categorias.includes('doces'));
});

test('interpretarSuperfluo: toggle remove categoria que já estava', () => {
  const r = interpretarSuperfluo('doces', ['doces', 'bebidas']);
  assert.equal(r.ok, true);
  assert.equal(r.acao, 'remove');
  assert.ok(!r.categorias.includes('doces'));
  assert.ok(r.categorias.includes('bebidas'));
});

test('interpretarSuperfluo: flag off remove; flag on adiciona (acento tolerado)', () => {
  assert.equal(interpretarSuperfluo('bebidas off', ['doces', 'bebidas']).acao, 'remove');
  assert.equal(interpretarSuperfluo('doces on', []).acao, 'add');
  assert.equal(interpretarSuperfluo('doces não', ['doces']).acao, 'remove'); // "não" → nao
});

test('interpretarSuperfluo: categoria fora das 10 válidas é rejeitada', () => {
  const r = interpretarSuperfluo('cerveja', ['doces']);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'categoria_invalida');
  assert.equal(r.categoria, 'cerveja');
});

// ── mensagens (formatter) ───────────────────────────────────────────────────

test('montarAcompanharConfirmado: categoria usa o label; termo usa o rótulo cru', () => {
  const cat = montarAcompanharConfirmado({ tipo_alvo: 'categoria', rotulo: 'doces' });
  assert.match(cat, /Doces e Petiscos/);
  assert.ok(semGiria(cat));

  const termo = montarAcompanharConfirmado({ tipo_alvo: 'termo', rotulo: 'cerveja' });
  assert.match(termo, /cerveja/);
  assert.match(termo, /\/parar cerveja/);
  assert.ok(semGiria(termo));
});

test('montarAcompanharErro: cada motivo tem uma orientação distinta e honesta', () => {
  assert.match(montarAcompanharErro('vazio'), /acompanhar/i);
  assert.match(montarAcompanharErro('curto'), /3 letras/);
  assert.match(montarAcompanharErro('parar_sem_alvo'), /parar/i);
  assert.match(montarAcompanharErro('falha'), /de novo/i);
});

test('montarAcompanharParado: sucesso confirma; falha admite honestamente', () => {
  assert.match(montarAcompanharParado('cerveja', true), /Parei de acompanhar/);
  assert.match(montarAcompanharParado('cerveja', false), /Não consegui/);
});

test('montarListaAcompanhamentos: lista vazia orienta a criar o primeiro', () => {
  const m = montarListaAcompanhamentos([]);
  assert.match(m, /ainda não está acompanhando/i);
  assert.match(m, /\/acompanhar/);
});

test('montarListaAcompanhamentos: mostra valor, "sem itens" e "não consegui somar" distintos', () => {
  const m = montarListaAcompanhamentos([
    { rotulo: 'cerveja', total: 118, temDados: true },
    { rotulo: 'chocolate', total: 0, temDados: true },
    { rotulo: 'ração', total: 0, temDados: false },
  ], '2026-06');
  assert.match(m, /cerveja — \*R\$ 118,00\*/);
  assert.match(m, /chocolate — ainda sem itens/);
  assert.match(m, /ração — não consegui somar/);
  assert.match(m, /Junho\/2026/);
});

test('montarSuperfluoConfirmado: add e remove trocam o verbo; falha é honesta', () => {
  const add = montarSuperfluoConfirmado({ acao: 'add', categoria: 'carnes' }, ['doces', 'carnes'], true);
  assert.match(add, /passa a contar/);
  assert.match(add, /Carnes e Aves/);

  const rem = montarSuperfluoConfirmado({ acao: 'remove', categoria: 'doces' }, ['bebidas'], true);
  assert.match(rem, /não conta mais/);

  const falha = montarSuperfluoConfirmado({ acao: 'add', categoria: 'doces' }, ['doces'], false);
  assert.match(falha, /Não consegui/);
});

test('montarSuperfluoConfig: lista vazia cai no baseline doces+bebidas', () => {
  const m = montarSuperfluoConfig([]);
  assert.match(m, /Doces e Petiscos/);
  assert.match(m, /Bebidas/);
});

test('montarSuperfluoInvalido: nomeia o erro e lista as categorias válidas', () => {
  const m = montarSuperfluoInvalido('cerveja');
  assert.match(m, /cerveja/);
  assert.match(m, /doces/);
  assert.ok(semGiria(m));
});
