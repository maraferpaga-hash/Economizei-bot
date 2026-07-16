// test/gemini-extracao.test.js — cod-0051
//
// TESTES DA REDE DE SEGURANÇA DA EXTRAÇÃO (achado §6.1 da Auditoria Integral
// 2026-07-10): `reconciliarItens`, `validarSchema`, `parseRespostaGemini` e
// `_scoreReconciliacao` protegem o coração do produto (a leitura do cupom) e
// tinham ZERO teste. Este arquivo trava o comportamento atual — sem mudar
// prompt nem limiar.
//
// O que cada guarda faz:
//   - parseRespostaGemini: resposta do LLM → JSON sem NUNCA lançar exceção
//     (markdown fence, JSON quebrado e texto livre viram { ok:false }).
//   - validarSchema: JSON do Gemini → dado normalizado com SAÍDA SEGURA
//     (categoria inválida → 'outros'; não-mercado → 'nao_mercado'; total
//     ilegível → sucesso:false; nunca exceção com campo faltando).
//   - reconciliarItens: soma dos itens × total declarado, tolerância =
//     maior entre R$ 2,00 e 15% do total (pega extração incompleta).
//   - _scoreReconciliacao: escolhe entre as 2 tentativas de leitura a que
//     melhor fecha com o total.
//
// ⚠️ Carregar gemini.js puxa `sharp` — SIGBUS conhecido no sandbox Linux;
// passa normal no Windows (mesmo padrão do classificacao-corpus.test.js).
// É lógica PURA (nenhum teste chama Gemini/rede). Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  reconciliarItens,
  validarSchema,
  parseRespostaGemini,
  _scoreReconciliacao,
} = require("../src/gemini.js");

// ─────────────────────────────────────────────────────────────────────────────
// parseRespostaGemini — nunca lança, sempre { ok, texto[, dados] }
// ─────────────────────────────────────────────────────────────────────────────

test("parse: JSON puro válido → ok:true com dados", () => {
  const r = parseRespostaGemini('{"sucesso": true, "total": 99.9}');
  assert.equal(r.ok, true);
  assert.equal(r.dados.sucesso, true);
  assert.equal(r.dados.total, 99.9);
});

test("parse: JSON envelopado em cerca de markdown (```json) → ok:true", () => {
  const r = parseRespostaGemini('```json\n{"sucesso": false, "motivo": "borrado"}\n```');
  assert.equal(r.ok, true);
  assert.equal(r.dados.motivo, "borrado");
});

test("parse: cerca de markdown sem a tag json → ok:true", () => {
  const r = parseRespostaGemini('```\n{"sucesso": true, "total": 10}\n```');
  assert.equal(r.ok, true);
  assert.equal(r.dados.total, 10);
});

test("parse: JSON quebrado → ok:false SEM exceção", () => {
  const r = parseRespostaGemini('{"sucesso": true, "total": 99.9');
  assert.equal(r.ok, false);
  assert.equal(typeof r.texto, "string");
});

test("parse: texto livre do modelo → ok:false SEM exceção", () => {
  const r = parseRespostaGemini("Desculpe, não consegui ler a imagem do cupom.");
  assert.equal(r.ok, false);
});

test("parse: entrada null/undefined/vazia → ok:false SEM exceção", () => {
  assert.equal(parseRespostaGemini(null).ok, false);
  assert.equal(parseRespostaGemini(undefined).ok, false);
  assert.equal(parseRespostaGemini("").ok, false);
});

// ─────────────────────────────────────────────────────────────────────────────
// reconciliarItens — soma × total, tolerância max(R$2, 15%)
// ─────────────────────────────────────────────────────────────────────────────

function itens(...precos) {
  return precos.map((p, i) => ({ nome: `Item ${i + 1}`, preco_total: p }));
}

test("reconciliação: soma fecha exatamente com o total → confere:true", () => {
  const r = reconciliarItens(100, itens(40, 35.5, 24.5));
  assert.equal(r.confere, true);
  assert.equal(r.somaItens, 100);
  assert.equal(r.diferenca, 0);
});

test("reconciliação: piso de R$2 — diferença de R$1,50 num total de R$10 confere", () => {
  // 15% de 10 = 1.50, mas o piso é R$2 → tolerância = 2
  const r = reconciliarItens(10, itens(8.5));
  assert.equal(r.confere, true);
});

test("reconciliação: diferença acima do piso de R$2 em total pequeno → confere:false", () => {
  const r = reconciliarItens(10, itens(7.5)); // diff 2.50 > 2
  assert.equal(r.confere, false);
});

test("reconciliação: 15% em total grande — diferença de R$13 em R$100 confere", () => {
  const r = reconciliarItens(100, itens(87)); // tolerância = max(2, 15) = 15
  assert.equal(r.confere, true);
  assert.equal(r.divergencia_pct, 13);
});

test("reconciliação: divergência além dos 15% → confere:false (extração incompleta)", () => {
  const r = reconciliarItens(100, itens(80)); // diff 20 > 15
  assert.equal(r.confere, false);
  assert.equal(r.divergencia_pct, 20);
});

test("reconciliação: cupom sem itens → confere:null (nada a conferir, não é erro)", () => {
  const r = reconciliarItens(50, []);
  assert.equal(r.confere, null);
  assert.equal(r.somaItens, 0);
  assert.equal(reconciliarItens(50, null).confere, null);
});

test("reconciliação: usa preco_total e cai pro preco_unitario quando falta", () => {
  const r = reconciliarItens(30, [
    { nome: "A", preco_total: 20 },
    { nome: "B", preco_unitario: 10 }, // sem preco_total
  ]);
  assert.equal(r.somaItens, 30);
  assert.equal(r.confere, true);
});

test("reconciliação: preço em string pt-BR ('9,90') e preço ilegível contam certo", () => {
  const r = reconciliarItens(9.9, [
    { nome: "A", preco_total: "9,90" },   // coerce vírgula → 9.90
    { nome: "B", preco_total: "abc" },    // NaN → conta 0, não NaN a soma toda
  ]);
  assert.equal(r.somaItens, 9.9);
  assert.equal(r.confere, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// validarSchema — saída segura, nunca exceção
// ─────────────────────────────────────────────────────────────────────────────

test("schema: resposta sem campo sucesso → sucesso:false sem exceção", () => {
  const r = validarSchema({});
  assert.equal(r.sucesso, false);
  assert.ok(r.motivo.length > 0);
});

test("schema: sucesso:false passa categoria_erro adiante; sem motivo → 'Cupom ilegível'", () => {
  const r = validarSchema({ sucesso: false, categoria_erro: "borrado" });
  assert.equal(r.sucesso, false);
  assert.equal(r.categoria_erro, "borrado");
  assert.equal(r.motivo, "Cupom ilegível");
});

test("schema: sucesso:false sem categoria_erro infere do motivo", () => {
  const r = validarSchema({ sucesso: false, motivo: "imagem borrada e escura" });
  assert.equal(r.categoria_erro, "borrado");
});

test("schema: sucesso:true sem total legível → vira sucesso:false (saída segura)", () => {
  assert.equal(validarSchema({ sucesso: true }).sucesso, false);
  assert.equal(validarSchema({ sucesso: true, total: "abc" }).sucesso, false);
  assert.equal(validarSchema({ sucesso: true, total: 0 }).sucesso, false);
  assert.equal(validarSchema({ sucesso: true, total: -5 }).sucesso, false);
});

test("schema: total em string pt-BR ('249,90') é coagido pra número", () => {
  const r = validarSchema({ sucesso: true, total: "249,90", itens: [] });
  assert.equal(r.sucesso, true);
  assert.equal(r.total, 249.9);
});

test("schema: loja vazia → 'Mercado'; data inválida → hoje (YYYY-MM-DD)", () => {
  const r = validarSchema({ sucesso: true, total: 10, loja: "  ", data_compra: "31/05/2026", itens: [] });
  assert.equal(r.loja, "Mercado");
  assert.match(r.data_compra, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(r.data_compra, new Date().toISOString().slice(0, 10));
});

test("schema: itens ausentes ou não-array → lista vazia, nunca exceção", () => {
  assert.deepEqual(validarSchema({ sucesso: true, total: 10 }).itens, []);
  assert.deepEqual(validarSchema({ sucesso: true, total: 10, itens: "nada" }).itens, []);
});

test("schema: item sem nome é filtrado; item nulo não quebra", () => {
  const r = validarSchema({
    sucesso: true, total: 10,
    itens: [null, { preco_total: 5 }, { nome: "Arroz 5kg", categoria: "mercearia", preco_total: 10 }],
  });
  assert.equal(r.itens.length, 1);
  assert.equal(r.itens[0].nome, "Arroz 5kg");
});

test("schema: categoria inválida vira 'outros' (nunca inventa nem lança)", () => {
  const r = validarSchema({
    sucesso: true, total: 10,
    itens: [{ nome: "Coisa", categoria: "eletronicos", preco_total: 10 }],
  });
  assert.equal(r.itens[0].categoria, "outros");
});

test("schema: categoria válida de mercado é preservada", () => {
  const r = validarSchema({
    sucesso: true, total: 10,
    itens: [{ nome: "Cerveja Skol Lata", nome_canonico: "cerveja skol lata 350ml", categoria: "bebidas", preco_total: 10 }],
  });
  assert.equal(r.itens[0].categoria, "bebidas");
});

test("schema: tipo 'outros' (não-mercado) → TODO item vira 'nao_mercado'", () => {
  const r = validarSchema({
    sucesso: true, tipo: "outros", total: 55, loja: "Farmácia Central",
    itens: [
      { nome: "Dipirona", categoria: "outros", preco_total: 15 },
      { nome: "Shampoo", categoria: "limpeza", preco_total: 40 },
    ],
  });
  assert.equal(r.tipo, "outros");
  for (const i of r.itens) assert.equal(i.categoria, "nao_mercado");
});

test("schema: tipo desconhecido cai no default 'mercado'", () => {
  const r = validarSchema({ sucesso: true, tipo: "restaurante?", total: 10, itens: [] });
  assert.equal(r.tipo, "mercado");
});

test("schema: nome_canonico vazio → null; preenchido → trim + minúsculas", () => {
  const r = validarSchema({
    sucesso: true, total: 20,
    itens: [
      { nome: "Item A", nome_canonico: "  ", categoria: "mercearia", preco_total: 10 },
      { nome: "Item B", nome_canonico: "  Arroz Tipo 1 5kg ", categoria: "mercearia", preco_total: 10 },
    ],
  });
  assert.equal(r.itens[0].nome_canonico, null);
  assert.equal(r.itens[1].nome_canonico, "arroz tipo 1 5kg");
});

test("schema: resultado sucesso:true carrega a reconciliação junto", () => {
  const r = validarSchema({
    sucesso: true, total: 100,
    itens: [{ nome: "Só um item", categoria: "mercearia", preco_total: 40 }],
  });
  assert.equal(r.reconciliacao.confere, false); // 60 de diferença em 100
  assert.equal(r.reconciliacao.somaItens, 40);
});

// ─────────────────────────────────────────────────────────────────────────────
// _scoreReconciliacao — escolhe a melhor das 2 tentativas de leitura
// ─────────────────────────────────────────────────────────────────────────────

test("score: itens que fecham com o total → 100 (melhor possível)", () => {
  assert.equal(_scoreReconciliacao({ reconciliacao: { confere: true, divergencia_pct: 0 } }), 100);
});

test("score: sem reconciliação ou cupom sem itens → 0", () => {
  assert.equal(_scoreReconciliacao({}), 0);
  assert.equal(_scoreReconciliacao({ reconciliacao: { confere: null } }), 0);
});

test("score: divergência menor pontua mais alto (escolhe a extração mais completa)", () => {
  const quaseFecha = { reconciliacao: { confere: false, divergencia_pct: 5 } };
  const longe = { reconciliacao: { confere: false, divergencia_pct: 60 } };
  assert.ok(_scoreReconciliacao(quaseFecha) > _scoreReconciliacao(longe));
  assert.equal(_scoreReconciliacao(quaseFecha), 95);
  assert.equal(_scoreReconciliacao(longe), 40);
});

test("score: divergência absurda (>100%) não vira score negativo", () => {
  assert.equal(_scoreReconciliacao({ reconciliacao: { confere: false, divergencia_pct: 400 } }), 0);
});

test("score: na prática, lerRecibo escolheria a tentativa que melhor fecha", () => {
  // Simula as 2 tentativas: processada leu 8 de 10 itens; original leu todos.
  const tentativaIncompleta = validarSchema({
    sucesso: true, total: 100,
    itens: [{ nome: "Parcial", categoria: "mercearia", preco_total: 70 }],
  });
  const tentativaCompleta = validarSchema({
    sucesso: true, total: 100,
    itens: [{ nome: "Tudo", categoria: "mercearia", preco_total: 99 }],
  });
  assert.ok(_scoreReconciliacao(tentativaCompleta) > _scoreReconciliacao(tentativaIncompleta));
});
