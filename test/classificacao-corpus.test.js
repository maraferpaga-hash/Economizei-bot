// test/classificacao-corpus.test.js — cod-0027
//
// CORPUS DE REGRESSÃO DA CLASSIFICAÇÃO (o coração do Economizei).
// A classificação dos itens é o ponto principal do produto: toda a inteligência
// do andar de cima (gastos por categoria, inflação, comparativo entre mercados
// e o ALERTA PRO de acompanhamento por palavra-chave — cod-0030) depende de o
// item ter sido nomeado (nome_canonico) liderando pelo TIPO GENÉRICO do produto.
// Se "cerveja skol lata" virar só "skol lata", a busca por "cerveja" não acha o
// item e o alerta Pro mente. Este corpus trava essa regressão.
//
// Escopo honesto do que dá pra testar SEM modelo:
//   - A geração do nome_canonico/categoria em si é feita pelo Gemini (LLM), que
//     NÃO é determinístico e não dá pra rodar num teste unitário. O que é PURO e
//     determinístico — e o que de fato protege o matching do alerta Pro — é o
//     guarda de qualidade `avaliarQualidadeCanonicoItem` (gemini.js). Ele é a
//     função que pega o canônico "errado" (começando pela marca) antes que ele
//     quebre a busca por palavra. É ele que este corpus exercita.
//   - Por isso o corpus carrega `nome` (como sai do cupom), `canonico` (a saída
//     esperada), `familia`/`categoria` (documentação do alvo de acompanhamento)
//     e `esperado` (o veredito de qualidade — ESTE é asseverado).
//
// Mexeu em prompt/extração do nome_canonico? Rode este arquivo. Se um caso
// regredir (canônico bom passa a ser acusado, ou canônico ruim deixa de ser
// pego), o teste falha aqui — antes de subir.
//
// É lógica PURA (só string), sem I/O. Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { avaliarQualidadeCanonicoItem } = require("../src/gemini.js");

// Categorias válidas de mercado (espelha CATEGORIAS_VALIDAS de gemini.js, que não
// é exportada). Usado só pra checar a consistência do PRÓPRIO corpus — pega
// erro de digitação numa categoria nova adicionada ao corpus.
const CATEGORIAS_VALIDAS = [
  "carnes", "hortifruti", "laticinios", "padaria",
  "bebidas", "limpeza", "mercearia", "congelados", "doces", "outros",
];

// ─────────────────────────────────────────────────────────────────────────────
// CORPUS BOM — canônico LIDERA pelo tipo genérico (marca/especificação depois).
// Todos devem voltar 'ok'. ≥15 casos, cobrindo as famílias-alvo de
// acompanhamento: cervejas, refrigerantes, chocolates, ração, café, limpeza e
// itens vendidos por peso. `nome` reproduz a abreviação típica do cupom.
// ─────────────────────────────────────────────────────────────────────────────
const CORPUS_BOM = [
  // cervejas (bebidas) — alvo clássico de "quanto gastei em cerveja"
  { familia: "cerveja",      categoria: "bebidas",    nome: "Cerveja Skol Lata 350",   canonico: "cerveja skol lata 350ml" },
  { familia: "cerveja",      categoria: "bebidas",    nome: "Cerv Heineken LN 330",    canonico: "cerveja heineken long neck 330ml" },
  { familia: "cerveja",      categoria: "bebidas",    nome: "Cerv Brahma DM 350",      canonico: "cerveja brahma duplo malte 350ml" },

  // refrigerantes (bebidas)
  { familia: "refrigerante", categoria: "bebidas",    nome: "Refrig Coca 2L",          canonico: "refrigerante coca cola 2l" },
  { familia: "refrigerante", categoria: "bebidas",    nome: "Refri Fanta Lar 350",     canonico: "refrigerante fanta laranja lata 350ml" },
  { familia: "refrigerante", categoria: "bebidas",    nome: "Refri Sprite 2L",         canonico: "refrigerante sprite limao 2l" }, // marca (sprite) NO MEIO → ok

  // chocolates (doces)
  { familia: "chocolate",    categoria: "doces",      nome: "Choc Lacta ao Leite",     canonico: "chocolate lacta ao leite 90g" },
  { familia: "chocolate",    categoria: "doces",      nome: "Choc Garoto Talento 90",  canonico: "chocolate garoto talento castanhas 90g" },
  { familia: "chocolate",    categoria: "doces",      nome: "Choc Kitkat 41g",         canonico: "chocolate kitkat 41g" },

  // ração / pet (outros)
  { familia: "ração",        categoria: "outros",     nome: "Racao Golden Caes 15kg",  canonico: "ração golden cães adultos 15kg" },
  { familia: "ração",        categoria: "outros",     nome: "Racao Whiskas Gato 1kg",  canonico: "ração whiskas gatos carne 1kg" },

  // café (bebidas)
  { familia: "café",         categoria: "bebidas",    nome: "Cafe Pilao 500g",         canonico: "café pilão tradicional 500g" },
  { familia: "café",         categoria: "bebidas",    nome: "Cafe Melitta 500g",       canonico: "café melitta tradicional 500g" },

  // limpeza — marca no meio (omo/ype/comfort estão na lista de marcas, mas NÃO lideram)
  { familia: "limpeza",      categoria: "limpeza",    nome: "Sab Po Omo 1kg",          canonico: "sabão em pó omo 1kg" },
  { familia: "limpeza",      categoria: "limpeza",    nome: "Det Ype Neutro 500",      canonico: "detergente ype neutro 500ml" },
  { familia: "limpeza",      categoria: "limpeza",    nome: "Amac Comfort 1L",         canonico: "amaciante comfort concentrado 1l" },

  // itens por peso (carnes/hortifruti/laticinios) — preço por kg na descrição
  { familia: "peso",         categoria: "carnes",     nome: "Picanha Bov Kg 0,456 Kg", canonico: "picanha bovina 0.456kg" },
  { familia: "peso",         categoria: "hortifruti", nome: "Banana Prata Kg",         canonico: "banana prata 1.2kg" },
  { familia: "peso",         categoria: "laticinios", nome: "Queijo Muss Fat Kg",      canonico: "queijo muçarela fatiado 0.350kg" },
  { familia: "peso",         categoria: "hortifruti", nome: "Tomate Kg",               canonico: "tomate 0.8kg" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CORPUS RUIM — canônico começa pela MARCA, faltou o tipo genérico na frente.
// Todos devem voltar 'comeca_por_marca' (sinal de log; é o que cod-0026 pega).
// Cobre as mesmas famílias para garantir que o guarda não "afrouxa pra nunca
// sinalizar" depois de um ajuste no prompt.
// ─────────────────────────────────────────────────────────────────────────────
const CORPUS_RUIM = [
  { familia: "cerveja",      nome: "Cerveja Skol Lata 350",   canonico: "skol lata 350ml" },
  { familia: "cerveja",      nome: "Cerv Heineken LN 330",    canonico: "heineken long neck 330ml" },
  { familia: "refrigerante", nome: "Refrig Coca 2L",          canonico: "coca cola 2l" },
  { familia: "refrigerante", nome: "Refri Fanta Lar 350",     canonico: "fanta laranja lata 350ml" },
  { familia: "chocolate",    nome: "Choc Lacta ao Leite",     canonico: "lacta ao leite 90g" },
  { familia: "chocolate",    nome: "Choc Kitkat 41g",         canonico: "kitkat 41g" },
  { familia: "ração",        nome: "Racao Golden Caes 15kg",  canonico: "golden cães adultos 15kg" },
  { familia: "ração",        nome: "Racao Whiskas Gato 1kg",  canonico: "whiskas gatos carne 1kg" },
  { familia: "café",         nome: "Cafe Pilao 500g",         canonico: "pilão tradicional 500g" }, // acento no 1º token
  { familia: "limpeza",      nome: "Sab Po Omo 1kg",          canonico: "omo lavagem perfeita 1kg" },
];

// ── Sanidade do próprio corpus ────────────────────────────────────────────────
test("corpus bom tem ao menos 15 casos cobrindo as 7 famílias-alvo", () => {
  assert.ok(CORPUS_BOM.length >= 15, `esperava ≥15 casos bons, tem ${CORPUS_BOM.length}`);
  const familias = new Set(CORPUS_BOM.map((c) => c.familia));
  for (const f of ["cerveja", "refrigerante", "chocolate", "ração", "café", "limpeza", "peso"]) {
    assert.ok(familias.has(f), `corpus bom não cobre a família '${f}'`);
  }
});

test("toda categoria declarada no corpus é uma categoria válida de mercado", () => {
  for (const c of CORPUS_BOM) {
    assert.ok(
      CATEGORIAS_VALIDAS.includes(c.categoria),
      `categoria inválida no corpus: '${c.categoria}' (item '${c.nome}')`
    );
  }
});

// ── A trava de regressão de verdade ───────────────────────────────────────────
test("CORPUS BOM: canônico que lidera pelo tipo genérico volta 'ok'", () => {
  for (const c of CORPUS_BOM) {
    assert.equal(
      avaliarQualidadeCanonicoItem({ nome: c.nome, nome_canonico: c.canonico }),
      "ok",
      `[${c.familia}] esperava 'ok' para canônico ${JSON.stringify(c.canonico)} (nome ${JSON.stringify(c.nome)})`
    );
  }
});

test("CORPUS RUIM: canônico que começa pela marca volta 'comeca_por_marca'", () => {
  for (const c of CORPUS_RUIM) {
    assert.equal(
      avaliarQualidadeCanonicoItem({ nome: c.nome, nome_canonico: c.canonico }),
      "comeca_por_marca",
      `[${c.familia}] esperava 'comeca_por_marca' para canônico ${JSON.stringify(c.canonico)} (nome ${JSON.stringify(c.nome)})`
    );
  }
});
