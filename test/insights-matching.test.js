// test/insights-matching.test.js — testes do engine de MATCHING do Alerta Pro
// (cod-0030, Desenho §6). Funções PURAS de insights.js: casar item↔alvo,
// somar gasto por alvo e somar gasto supérfluo. Sem I/O — modelo de teste:
// test/insights.test.js. Rodar local: node --test
//
// O coração do produto é a classificação (CLAUDE.md / CODE_GUIDE §0); estes
// testes travam a parte determinística que depende dela: o matching por
// palavra-chave (palavra inteira, sem substring solta, ≥3 chars) e a soma
// honesta (nada casa → total 0, nunca número chutado).

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  casarItemComAlvo,
  buscarGastoPorAlvo,
  buscarGastoSuperfluo,
} = require("../src/insights.js");

// ── casarItemComAlvo — alvo de CATEGORIA ────────────────────────────────────
test("casarItemComAlvo: categoria casa por igualdade exata", () => {
  const item = { categoria: "doces", nome_canonico: "chocolate lacta 90g" };
  assert.equal(casarItemComAlvo(item, { tipo: "categoria", valor: "doces" }), true);
  assert.equal(casarItemComAlvo(item, { tipo: "categoria", valor: "bebidas" }), false);
});

test("casarItemComAlvo: categoria é tolerante a acento/caixa, mas não casa vazio", () => {
  const item = { categoria: "laticinios" };
  assert.equal(casarItemComAlvo(item, { tipo: "categoria", valor: "Laticínios" }), true);
  assert.equal(casarItemComAlvo(item, { tipo: "categoria", valor: "" }), false);
});

// ── casarItemComAlvo — alvo de TERMO (palavra inteira) ──────────────────────
test("casarItemComAlvo: termo casa palavra inteira no nome_canonico", () => {
  const item = { categoria: "bebidas", nome_canonico: "cerveja skol lata 350ml" };
  assert.equal(casarItemComAlvo(item, { tipo: "termo", valor: "cerveja" }), true);
  // termo que aparece em outra posição também casa (é palavra solta)
  assert.equal(casarItemComAlvo(item, { tipo: "termo", valor: "skol" }), true);
});

test("casarItemComAlvo: NÃO casa substring solta ('uva' em 'luva', 'cafe' em 'descafeinado')", () => {
  const luva = { categoria: "limpeza", nome_canonico: "luva latex multiuso media" };
  assert.equal(casarItemComAlvo(luva, { tipo: "termo", valor: "uva" }), false);

  const desc = { categoria: "mercearia", nome_canonico: "achocolatado descafeinado 200g" };
  assert.equal(casarItemComAlvo(desc, { tipo: "termo", valor: "cafe" }), false);

  // controle positivo: 'uva' casa quando é palavra de verdade
  const uva = { categoria: "hortifruti", nome_canonico: "uva verde sem semente kg" };
  assert.equal(casarItemComAlvo(uva, { tipo: "termo", valor: "uva" }), true);
});

test("casarItemComAlvo: termo é insensível a acento (cafe↔café, racao↔ração)", () => {
  const cafe = { categoria: "mercearia", nome_canonico: "café pilão tradicional 500g" };
  assert.equal(casarItemComAlvo(cafe, { tipo: "termo", valor: "cafe" }), true);

  const racao = { categoria: "outros", nome_canonico: "ração golden cães adultos 15kg" };
  assert.equal(casarItemComAlvo(racao, { tipo: "termo", valor: "racao" }), true);
  assert.equal(casarItemComAlvo(racao, { tipo: "termo", valor: "ração" }), true);
});

test("casarItemComAlvo: guarda de comprimento mínimo (termo < 3 chars não casa)", () => {
  const item = { categoria: "hortifruti", nome_canonico: "uva verde kg" };
  // 'uv' tem 2 chars → não casa, mesmo sendo prefixo de uva
  assert.equal(casarItemComAlvo(item, { tipo: "termo", valor: "uv" }), false);
});

test("casarItemComAlvo: cai pro nome quando nome_canonico está ausente", () => {
  const item = { categoria: "bebidas", nome: "CERVEJA HEINEKEN LN 330" }; // sem canônico
  assert.equal(casarItemComAlvo(item, { tipo: "termo", valor: "cerveja" }), true);
});

test("casarItemComAlvo: entradas inválidas retornam false (sem quebrar)", () => {
  assert.equal(casarItemComAlvo(null, { tipo: "termo", valor: "cerveja" }), false);
  assert.equal(casarItemComAlvo({ categoria: "doces" }, null), false);
  assert.equal(casarItemComAlvo({ categoria: "doces" }, { tipo: "xpto", valor: "y" }), false);
});

// ── buscarGastoPorAlvo ──────────────────────────────────────────────────────
test("buscarGastoPorAlvo: soma preco_total dos itens casados e conta compras distintas", () => {
  const itens = [
    { nome_canonico: "cerveja skol lata 350ml", preco_total: 60, compra_id: 1 },
    { nome_canonico: "cerveja brahma lata 350ml", preco_total: 58, compra_id: 1 },
    { nome_canonico: "cerveja heineken ln 330ml", preco_total: 80, compra_id: 2 },
    { nome_canonico: "refrigerante coca cola 2l", preco_total: 12, compra_id: 2 },
  ];
  const r = buscarGastoPorAlvo(itens, { tipo: "termo", valor: "cerveja" });
  assert.equal(r.total, 198); // 60+58+80
  assert.equal(r.qtdCompras, 2); // compra_id 1 e 2
  assert.equal(r.itensCasados.length, 3);
});

test("buscarGastoPorAlvo: nada casa → total 0 (não chuta número)", () => {
  const itens = [
    { nome_canonico: "arroz tipo 1 5kg", preco_total: 25 },
    { nome_canonico: "feijao carioca 1kg", preco_total: 9 },
  ];
  const r = buscarGastoPorAlvo(itens, { tipo: "termo", valor: "cerveja" });
  assert.equal(r.total, 0);
  assert.equal(r.qtdCompras, 0);
  assert.equal(r.itensCasados.length, 0);
});

test("buscarGastoPorAlvo: fallback de valor (preco × quantidade) sem preco_total", () => {
  const itens = [
    { nome_canonico: "chocolate lacta ao leite 90g", preco: 4, quantidade: 3 }, // 12
    { nome_canonico: "chocolate nestle 80g", preco: 5 },                        // 5 (qtd default 1)
  ];
  const r = buscarGastoPorAlvo(itens, { tipo: "termo", valor: "chocolate" });
  assert.equal(r.total, 17);
  assert.equal(r.qtdCompras, 2); // sem compra_id → proxy = nº de itens
});

test("buscarGastoPorAlvo: alvo de categoria soma por categoria", () => {
  const itens = [
    { categoria: "doces", preco_total: 30 },
    { categoria: "doces", preco_total: 10 },
    { categoria: "carnes", preco_total: 100 },
  ];
  const r = buscarGastoPorAlvo(itens, { tipo: "categoria", valor: "doces" });
  assert.equal(r.total, 40);
  assert.equal(r.itensCasados.length, 2);
});

test("buscarGastoPorAlvo: entrada não-array é tratada como vazia", () => {
  const r = buscarGastoPorAlvo(null, { tipo: "termo", valor: "cerveja" });
  assert.equal(r.total, 0);
  assert.equal(r.qtdCompras, 0);
});

// ── buscarGastoSuperfluo ────────────────────────────────────────────────────
test("buscarGastoSuperfluo: baseline doces+bebidas quando lista é null", () => {
  const gastos = [
    { categoria: "carnes", total: 200 },
    { categoria: "doces", total: 60 },
    { categoria: "bebidas", total: 40 },
  ];
  const r = buscarGastoSuperfluo(gastos, null);
  assert.equal(r.totalSuperfluo, 100); // 60 + 40
  assert.equal(r.pctDoMes, 33); // 100/300
  // ordenado do maior pro menor valor
  assert.equal(r.porCategoria[0].categoria, "doces");
  assert.equal(r.porCategoria[0].valor, 60);
  assert.equal(r.porCategoria[0].pct, 20); // 60/300
  assert.equal(r.porCategoria[1].categoria, "bebidas");
});

test("buscarGastoSuperfluo: lista customizada substitui o baseline", () => {
  const gastos = [
    { categoria: "carnes", total: 100 },
    { categoria: "doces", total: 50 },
    { categoria: "limpeza", total: 50 },
  ];
  const r = buscarGastoSuperfluo(gastos, ["limpeza"]);
  assert.equal(r.totalSuperfluo, 50); // só limpeza
  assert.equal(r.porCategoria.length, 1);
  assert.equal(r.porCategoria[0].categoria, "limpeza");
});

test("buscarGastoSuperfluo: lista vazia → nenhum supérfluo (não recai no baseline)", () => {
  const gastos = [
    { categoria: "doces", total: 50 },
    { categoria: "bebidas", total: 40 },
  ];
  const r = buscarGastoSuperfluo(gastos, []);
  assert.equal(r.totalSuperfluo, 0);
  assert.equal(r.pctDoMes, 0);
  assert.equal(r.porCategoria.length, 0);
});

test("buscarGastoSuperfluo: sem gastos → zeros (não quebra)", () => {
  const r = buscarGastoSuperfluo([], null);
  assert.equal(r.totalSuperfluo, 0);
  assert.equal(r.pctDoMes, 0);
  assert.deepEqual(r.porCategoria, []);
});
