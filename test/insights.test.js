// test/insights.test.js — testes das funções PURAS de insights.js.
//
// Esta é a baseline verde da "rede de segurança de código": roda no CI
// (node --test) em todo PR. Serve também de EXEMPLO pra máquina noturna —
// toda função nova de lógica deve vir com teste assim.
//
// Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  analisarRaioXCategorias,
  analisarInflacaoPessoal,
  calcularEconomia,
  analisarOndeCortar,
} = require("../src/insights.js");

// ── F4 — calcularEconomia ───────────────────────────────────────────────────
test("calcularEconomia: mês de referência abaixo da média gera economia positiva", () => {
  const totais = [
    { mes: "2026-01", total: 500, qtdCompras: 4 },
    { mes: "2026-02", total: 600, qtdCompras: 4 },
    { mes: "2026-03", total: 400, qtdCompras: 4 }, // ref
  ];
  const r = calcularEconomia(totais);
  assert.equal(r.temDados, true);
  assert.equal(r.mesRef, "2026-03");
  assert.equal(r.mediaRef, 550); // média de jan+fev
  assert.equal(r.totalMesRef, 400);
  assert.equal(r.economiaMes, 150); // 550 - 400
  assert.equal(r.economiaAno, 150); // só o mês abaixo da média entra
});

test("calcularEconomia: série curta demais não conclui", () => {
  assert.equal(calcularEconomia([{ mes: "2026-01", total: 500 }]).temDados, false);
  assert.equal(calcularEconomia([]).temDados, false);
});

// ── F2 — analisarRaioXCategorias ────────────────────────────────────────────
test("analisarRaioXCategorias: acha a maior categoria e o corte discricionário", () => {
  const atual = [
    { categoria: "carnes", total: 100 },
    { categoria: "doces", total: 60 },
    { categoria: "hortifruti", total: 40 },
  ];
  const r = analisarRaioXCategorias(atual, null);
  assert.equal(r.temConclusao, true);
  assert.equal(r.top.categoria, "carnes");
  assert.equal(r.top.pct, 50); // 100/200
  assert.ok(r.candidatoCorte, "doces pesa 30% (>=10%) e é supérflua");
  assert.equal(r.candidatoCorte.categoria, "doces");
  assert.equal(r.candidatoCorte.pct, 30);
  assert.equal(r.comparativo, null); // sem histórico
});

test("analisarRaioXCategorias: ignora fatias não-acionáveis e total zero", () => {
  assert.equal(analisarRaioXCategorias([], null).temConclusao, false);
  const soResiduo = [{ categoria: "nao_identificado", total: 80 }];
  assert.equal(analisarRaioXCategorias(soResiduo, null).temConclusao, false);
});

// ── F1 — analisarInflacaoPessoal ────────────────────────────────────────────
test("analisarInflacaoPessoal: reporta alta relevante e descarta ruído", () => {
  const itens = [
    {
      nomeCanonico: "arroz",
      categoria: "mercearia",
      observacoes: [
        { data: "2026-01-01", preco: 5 },
        { data: "2026-02-01", preco: 6 }, // +20%, 31 dias → conta
      ],
    },
    {
      nomeCanonico: "café-mesma-semana",
      categoria: "mercearia",
      observacoes: [
        { data: "2026-02-01", preco: 10 },
        { data: "2026-02-03", preco: 14 }, // < 14 dias → descarta
      ],
    },
    {
      nomeCanonico: "item-absurdo",
      categoria: "outros",
      observacoes: [
        { data: "2026-01-01", preco: 2 },
        { data: "2026-02-01", preco: 20 }, // +900% → erro de unidade, descarta
      ],
    },
  ];
  const r = analisarInflacaoPessoal(itens);
  assert.equal(r.temDados, true);
  assert.equal(r.subiram.length, 1);
  assert.equal(r.subiram[0].nome, "arroz");
  assert.equal(r.subiram[0].variacaoPct, 20);
  assert.equal(r.cairam.length, 0);
});

// ── F3 — analisarOndeCortar ─────────────────────────────────────────────────
test("analisarOndeCortar: identifica categoria supérflua com peso relevante", () => {
  const dadosMes = [
    { categoria: "carnes", total: 200 },
    { categoria: "doces", total: 80 },   // 80/330 ≈ 24% — acima do limiar
    { categoria: "hortifruti", total: 50 },
  ];
  const r = analisarOndeCortar(dadosMes, null);
  assert.equal(r.temSugestao, true);
  assert.equal(r.sugestoes.length, 1);
  assert.equal(r.sugestoes[0].categoria, "doces");
  assert.equal(r.sugestoes[0].valor, 80);
  assert.equal(r.sugestoes[0].pct, 24);
  assert.equal(r.sugestoes[0].acimaDaMedia, null); // sem histórico
  assert.equal(r.mesesHistorico, 0);
});

test("analisarOndeCortar: sem supérflua relevante retorna temSugestao:false", () => {
  // doces = 5/205 ≈ 2% — abaixo do limiar padrão de 5%
  const dadosMes = [
    { categoria: "carnes", total: 200 },
    { categoria: "doces", total: 5 },
  ];
  assert.equal(analisarOndeCortar(dadosMes, null).temSugestao, false);
  assert.equal(analisarOndeCortar([], null).temSugestao, false);
});

test("analisarOndeCortar: detecta categoria acima da média histórica e ordena por força do sinal", () => {
  // bebidas: 90/210=43%, mediaValorHist=40 → 90>44 → acimaDaMedia=true
  // doces:   20/210=10%, mediaValorHist=20 → 20>22? não → acimaDaMedia=false
  const dadosMes = [
    { categoria: "doces", total: 20 },
    { categoria: "bebidas", total: 90 },
    { categoria: "mercearia", total: 100 },
  ];
  const historico = {
    mesesComDados: 2,
    porCategoria: {
      doces:   { mediaPct: 10, mediaValor: 20 },
      bebidas: { mediaPct: 20, mediaValor: 40 },
    },
  };
  const r = analisarOndeCortar(dadosMes, historico);
  assert.equal(r.temSugestao, true);
  assert.equal(r.mesesHistorico, 2);
  // bebidas (acimaDaMedia=true) deve vir antes de doces
  assert.equal(r.sugestoes[0].categoria, "bebidas");
  assert.equal(r.sugestoes[0].acimaDaMedia, true);
  assert.equal(r.sugestoes[1].categoria, "doces");
  assert.equal(r.sugestoes[1].acimaDaMedia, false);
});
