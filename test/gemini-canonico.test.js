// test/gemini-canonico.test.js — testes de avaliarQualidadeCanonicoItem (gemini.js).
//
// Trava de regressão da tarefa cod-0002: a heurística de qualidade do
// nome_canonico foi afrouxada em 2026-06-08 (limiar 25 chars / 95%) porque o
// critério antigo (15 chars / 80%) dava FALSO POSITIVO `pouco_simplificado` em
// nomes de cupom que já vêm muito abreviados — virava ruído de log sem problema
// real. Estes testes garantem que:
//   1. canônicos bons de cupom abreviado voltam 'ok' (não acusam mais);
//   2. a heurística ainda PEGA os casos reais (ausente/curto/longo/igual/pouco
//      simplificado de verdade) — afrouxar não pode virar "nunca sinaliza nada".
//
// É lógica PURA (só string), sem I/O. Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { avaliarQualidadeCanonicoItem } = require("../src/gemini.js");

// ── Os falsos positivos que a tarefa cod-0002 corrige (devem voltar 'ok') ─────
test("canônico bom de cupom abreviado NÃO é mais acusado (volta 'ok')", () => {
  // Exemplos verbatim dos critérios de aceite da cod-0002.
  assert.equal(
    avaliarQualidadeCanonicoItem({ nome: "Bisc Marilan 1", nome_canonico: "biscoito marilan" }),
    "ok"
  );
  assert.equal(
    avaliarQualidadeCanonicoItem({ nome: "Picanha Bov Kg 0,456 Kg", nome_canonico: "picanha bovina 0.456kg" }),
    "ok"
  );
});

test("outros canônicos legítimos de cupom abreviado também voltam 'ok'", () => {
  const casos = [
    { nome: "Refrig Coca 2L", nome_canonico: "refrigerante coca cola 2l" },
    { nome: "Sab Po Omo 1kg", nome_canonico: "sabao em po omo 1kg" },
    { nome: "Det Ype Neutro", nome_canonico: "detergente ype neutro" },
  ];
  for (const c of casos) {
    assert.equal(avaliarQualidadeCanonicoItem(c), "ok", `esperava 'ok' para ${JSON.stringify(c)}`);
  }
});

// ── A heurística continua pegando os problemas reais ──────────────────────────
test("'ausente' quando o canônico está vazio ou só espaços", () => {
  assert.equal(avaliarQualidadeCanonicoItem({ nome: "Arroz Tio Joao 5kg", nome_canonico: "" }), "ausente");
  assert.equal(avaliarQualidadeCanonicoItem({ nome: "Arroz Tio Joao 5kg", nome_canonico: "   " }), "ausente");
  assert.equal(avaliarQualidadeCanonicoItem({ nome: "Arroz Tio Joao 5kg", nome_canonico: null }), "ausente");
});

test("'muito_curto' quando o canônico tem menos de 3 caracteres", () => {
  assert.equal(avaliarQualidadeCanonicoItem({ nome: "Coca Cola", nome_canonico: "co" }), "muito_curto");
});

test("'muito_longo' quando o canônico passa de 60 caracteres", () => {
  const canonLongo = "x".repeat(61);
  assert.equal(avaliarQualidadeCanonicoItem({ nome: "Combo grande", nome_canonico: canonLongo }), "muito_longo");
});

test("'igual_ao_nome' quando o canônico é só o nome em minúsculas (sem simplificar)", () => {
  assert.equal(
    avaliarQualidadeCanonicoItem({ nome: "LEITE INTEGRAL", nome_canonico: "leite integral" }),
    "igual_ao_nome"
  );
});

test("'pouco_simplificado' AINDA dispara em nome longo de verdade quase não reduzido", () => {
  // nome original longo (>25 chars normalizados) e canônico que quase não encurtou (>=95%).
  assert.equal(
    avaliarQualidadeCanonicoItem({
      nome: "Refrigerante Coca Cola Lata 350ml Pack",
      nome_canonico: "refrigerante coca cola lata 350ml pack lata",
    }),
    "pouco_simplificado"
  );
});
