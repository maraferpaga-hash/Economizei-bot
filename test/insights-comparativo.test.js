// test/insights-comparativo.test.js — testes do comparativo entre mercados
// (cod-0020, feature paga nº1). Função PURA compararPrecosMercado de
// insights.js: dado o mesmo produto canônico visto em lojas diferentes, achar
// onde sai mais barato e a posição do usuário. Sem I/O — modelo: insights.test.js.
// Rodar local: node --test
//
// O coração do produto é a classificação (CLAUDE.md / CODE_GUIDE §0). Estes
// testes travam a parte determinística: casamento por nome canônico exato,
// janela temporal (preço velho não conta), e a honestidade (nada casa em ≥2
// lojas → SEM comparativo, nunca um número chutado).

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compararPrecosMercado } = require("../src/insights.js");

// Datas recentes/entre-si dentro da janela padrão de 60 dias.
const HOJE = "2026-07-01";
const ONTEM = "2026-06-30";
const SEMANA = "2026-06-24";

// ── Caso base: mesmo canônico em ≥2 lojas ───────────────────────────────────
test("compara mesmo produto em 2 lojas: menor, maior e economia corretos", () => {
  const obs = [
    { produto_canonico: "arroz tio joao 5kg", loja: "Mercado A", preco_unit: 24.9, data_obs: HOJE },
    { produto_canonico: "arroz tio joao 5kg", loja: "Mercado B", preco_unit: 19.9, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs);
  assert.equal(r.temComparativo, true);
  assert.equal(r.comparativos.length, 1);
  const c = r.comparativos[0];
  assert.equal(c.menor.loja, "Mercado B");
  assert.equal(c.menor.preco, 19.9);
  assert.equal(c.maior.loja, "Mercado A");
  assert.equal(c.maior.preco, 24.9);
  assert.equal(c.economia, 5);
  assert.equal(c.economiaPct, 20); // 5 / 24.9 ≈ 20%
  assert.equal(c.nLojas, 2);
});

// ── Empate de preço → sem comparativo (nada acionável, honestidade) ─────────
test("empate de preço entre lojas não vira comparativo", () => {
  const obs = [
    { produto_canonico: "cafe pilao 500g", loja: "Mercado A", preco_unit: 15.0, data_obs: HOJE },
    { produto_canonico: "cafe pilao 500g", loja: "Mercado B", preco_unit: 15.0, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs);
  assert.equal(r.temComparativo, false);
  assert.equal(r.comparativos.length, 0);
});

// ── Loja única → sem comparativo (não há com o que comparar) ────────────────
test("produto visto em uma loja só não vira comparativo", () => {
  const obs = [
    { produto_canonico: "leite integral 1l", loja: "Mercado A", preco_unit: 5.5, data_obs: HOJE },
    { produto_canonico: "leite integral 1l", loja: "Mercado A", preco_unit: 5.7, data_obs: ONTEM },
  ];
  const r = compararPrecosMercado(obs);
  assert.equal(r.temComparativo, false);
});

// ── Nada casa → não inventa número ──────────────────────────────────────────
test("observacoes vazio → temComparativo false, comparativos vazio", () => {
  const r = compararPrecosMercado([]);
  assert.equal(r.temComparativo, false);
  assert.deepEqual(r.comparativos, []);
  assert.equal(r.totalComparaveis, 0);
});

test("entrada não-array (null) → resultado vazio, sem lançar", () => {
  const r = compararPrecosMercado(null);
  assert.equal(r.temComparativo, false);
  assert.equal(r.comparativos.length, 0);
});

test("produtosDoUsuario que não casa nenhum canônico → sem comparativo", () => {
  const obs = [
    { produto_canonico: "arroz tio joao 5kg", loja: "Mercado A", preco_unit: 24.9, data_obs: HOJE },
    { produto_canonico: "arroz tio joao 5kg", loja: "Mercado B", preco_unit: 19.9, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs, { produtosDoUsuario: ["feijao carioca 1kg"] });
  assert.equal(r.temComparativo, false);
});

// ── Filtra linhas inválidas (preco<=0, loja/produto ausentes) ───────────────
test("descarta observações inválidas (preço <=0, loja ausente)", () => {
  const obs = [
    { produto_canonico: "acucar uniao 1kg", loja: "Mercado A", preco_unit: 0, data_obs: HOJE },
    { produto_canonico: "acucar uniao 1kg", loja: "", preco_unit: 4.5, data_obs: HOJE },
    { produto_canonico: "acucar uniao 1kg", loja: "Mercado B", preco_unit: 4.2, data_obs: HOJE },
  ];
  // Sobra 1 loja válida → sem comparativo.
  const r = compararPrecosMercado(obs);
  assert.equal(r.temComparativo, false);
});

// ── Posição do usuário ──────────────────────────────────────────────────────
test("usuário na loja mais cara: posicao 'mais_caro' + economiaUsuario", () => {
  const obs = [
    { produto_canonico: "detergente ype 500ml", loja: "Mercado Caro", preco_unit: 3.5, data_obs: HOJE },
    { produto_canonico: "detergente ype 500ml", loja: "Mercado Barato", preco_unit: 2.0, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs, { lojaDoUsuario: "Mercado Caro" });
  const c = r.comparativos[0];
  assert.equal(c.precoUsuario, 3.5);
  assert.equal(c.posicaoUsuario, "mais_caro");
  assert.equal(c.economiaUsuario, 1.5);
});

test("usuário já na loja mais barata: posicao 'mais_barato', sem economiaUsuario", () => {
  const obs = [
    { produto_canonico: "detergente ype 500ml", loja: "Mercado Caro", preco_unit: 3.5, data_obs: HOJE },
    { produto_canonico: "detergente ype 500ml", loja: "Mercado Barato", preco_unit: 2.0, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs, { lojaDoUsuario: "Mercado Barato" });
  const c = r.comparativos[0];
  assert.equal(c.posicaoUsuario, "mais_barato");
  assert.equal(c.economiaUsuario, null);
});

test("loja do usuário tolera acento/caixa ao casar", () => {
  const obs = [
    { produto_canonico: "pao de forma", loja: "Mercado São João", preco_unit: 8.0, data_obs: HOJE },
    { produto_canonico: "pao de forma", loja: "Mercado Central", preco_unit: 6.0, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs, { lojaDoUsuario: "mercado sao joao" });
  assert.equal(r.comparativos[0].posicaoUsuario, "mais_caro");
});

// ── Janela temporal: preço velho é descartado ───────────────────────────────
test("observação fora da janela não entra na comparação", () => {
  const obs = [
    { produto_canonico: "oleo soja 900ml", loja: "Mercado A", preco_unit: 7.0, data_obs: HOJE },
    // muito antiga (mais de 60 dias antes de HOJE) → descartada, sobra 1 loja
    { produto_canonico: "oleo soja 900ml", loja: "Mercado B", preco_unit: 5.0, data_obs: "2026-01-01" },
  ];
  const r = compararPrecosMercado(obs, { janelaDias: 60 });
  assert.equal(r.temComparativo, false);
});

test("dentro da janela mantém as duas lojas", () => {
  const obs = [
    { produto_canonico: "oleo soja 900ml", loja: "Mercado A", preco_unit: 7.0, data_obs: HOJE },
    { produto_canonico: "oleo soja 900ml", loja: "Mercado B", preco_unit: 5.0, data_obs: SEMANA },
  ];
  const r = compararPrecosMercado(obs, { janelaDias: 60 });
  assert.equal(r.temComparativo, true);
  assert.equal(r.comparativos[0].economia, 2);
});

// ── Dedup por loja: mantém a observação mais recente da mesma loja ──────────
test("mesma loja com preços em datas diferentes usa a observação mais recente", () => {
  const obs = [
    { produto_canonico: "cerveja lata 350ml", loja: "Mercado A", preco_unit: 3.0, data_obs: SEMANA },
    { produto_canonico: "cerveja lata 350ml", loja: "Mercado A", preco_unit: 4.0, data_obs: HOJE }, // mais recente
    { produto_canonico: "cerveja lata 350ml", loja: "Mercado B", preco_unit: 2.5, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs);
  const c = r.comparativos[0];
  assert.equal(c.maior.preco, 4.0); // usou o 4.0 recente de A, não o 3.0 antigo
  assert.equal(c.menor.preco, 2.5);
});

// ── Teaser: maxComparativos corta a lista e sinaliza temMais ────────────────
test("maxComparativos limita a lista e marca temMais/totalComparaveis", () => {
  const obs = [
    { produto_canonico: "prod1", loja: "A", preco_unit: 10, data_obs: HOJE },
    { produto_canonico: "prod1", loja: "B", preco_unit: 5, data_obs: HOJE },   // economia 5
    { produto_canonico: "prod2", loja: "A", preco_unit: 20, data_obs: HOJE },
    { produto_canonico: "prod2", loja: "B", preco_unit: 8, data_obs: HOJE },   // economia 12
    { produto_canonico: "prod3", loja: "A", preco_unit: 4, data_obs: HOJE },
    { produto_canonico: "prod3", loja: "B", preco_unit: 3, data_obs: HOJE },   // economia 1
  ];
  const r = compararPrecosMercado(obs, { maxComparativos: 2 });
  assert.equal(r.mostrados, 2);
  assert.equal(r.totalComparaveis, 3);
  assert.equal(r.temMais, true);
  // Ordenado por maior economia primeiro: prod2 (12) antes de prod1 (5).
  assert.equal(r.comparativos[0].produto, "prod2");
  assert.equal(r.comparativos[1].produto, "prod1");
});

test("sem maxComparativos mostra todos e temMais é false", () => {
  const obs = [
    { produto_canonico: "prod1", loja: "A", preco_unit: 10, data_obs: HOJE },
    { produto_canonico: "prod1", loja: "B", preco_unit: 5, data_obs: HOJE },
  ];
  const r = compararPrecosMercado(obs);
  assert.equal(r.temMais, false);
  assert.equal(r.mostrados, 1);
});

// ── minEconomiaPct: descarta diferença irrelevante ──────────────────────────
test("minEconomiaPct descarta comparativo com diferença abaixo do limiar", () => {
  const obs = [
    { produto_canonico: "sal refinado 1kg", loja: "A", preco_unit: 2.0, data_obs: HOJE },
    { produto_canonico: "sal refinado 1kg", loja: "B", preco_unit: 1.98, data_obs: HOJE }, // ~1%
  ];
  const r = compararPrecosMercado(obs, { minEconomiaPct: 5 });
  assert.equal(r.temComparativo, false);
});
