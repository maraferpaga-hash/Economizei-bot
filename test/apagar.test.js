// test/apagar.test.js — testes da lógica pura do /apagar (LGPD) e das mensagens.
//
// Cobre interpretarApagar (parse do comando + confirmação) e as 3 mensagens
// do formatter. As mensagens também são auditadas para NÃO falarem de
// preço/plano/pagamento — o /apagar fica longe da zona protegida do firewall.
//
// Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { interpretarApagar } = require("../src/apagar.js");
const {
  montarConfirmacaoApagar,
  montarApagarConcluido,
  montarApagarErro,
} = require("../src/formatter.js");

// --- interpretarApagar ------------------------------------------------

test("interpretarApagar: '/apagar' é pedido sem confirmação", () => {
  assert.deepEqual(interpretarApagar("/apagar"), { pedido: true, confirmar: false });
});

test("interpretarApagar: 'apagar' (sem barra) também é pedido", () => {
  assert.deepEqual(interpretarApagar("apagar"), { pedido: true, confirmar: false });
});

test("interpretarApagar: '/apagar confirmar' confirma", () => {
  assert.deepEqual(interpretarApagar("/apagar confirmar"), { pedido: true, confirmar: true });
});

test("interpretarApagar: case-insensitive e tolerante a pontuação", () => {
  assert.deepEqual(interpretarApagar("  /APAGAR, Confirmar! "), { pedido: true, confirmar: true });
});

test("interpretarApagar: confirmar SEM ser pedido não conta", () => {
  // "confirmar" sozinho não é /apagar — evita apagar por engano
  assert.deepEqual(interpretarApagar("confirmar"), { pedido: false, confirmar: false });
});

test("interpretarApagar: NÃO dispara quando 'apagar' não é a 1ª palavra", () => {
  // proteção contra gatilho acidental em frases ("quero apagar tudo")
  assert.deepEqual(interpretarApagar("quero apagar tudo"), { pedido: false, confirmar: false });
});

test("interpretarApagar: outros comandos e vazio não disparam", () => {
  for (const t of ["/gastos", "oi", "", null, undefined, "   "]) {
    assert.equal(interpretarApagar(t).pedido, false, `não deveria disparar para: ${JSON.stringify(t)}`);
  }
});

// --- mensagens --------------------------------------------------------

test("montarConfirmacaoApagar: avisa irreversível e pede o passo de confirmação", () => {
  const m = montarConfirmacaoApagar();
  assert.match(m, /apagar confirmar/i);
  assert.match(m, /não dá pra desfazer/i);
});

test("montarApagarConcluido: confirma a exclusão", () => {
  assert.match(montarApagarConcluido(), /apaguei/i);
});

test("montarApagarErro: orienta tentar de novo sem expor detalhe técnico", () => {
  assert.match(montarApagarErro(), /tentar de novo|de novo/i);
});

test("mensagens do /apagar ficam longe da zona de pagamento", () => {
  // Não falam de plano, preço ou valor em reais — o /apagar é só LGPD.
  // (Os tokens financeiros literais são auditados pelo npm run check:firewall;
  //  aqui usamos termos neutros pra não acionar o próprio firewall no teste.)
  const msgs = [montarConfirmacaoApagar(), montarApagarConcluido(), montarApagarErro()];
  for (const m of msgs) {
    assert.ok(!/plano/i.test(m), "não menciona plano");
    assert.ok(!/\bR\$/.test(m), "não menciona valor em reais");
    // "pagamento"/"cobrança" — \b evita falso-positivo com a própria palavra "apagar".
    assert.ok(!/\bpagamento\b|cobran/i.test(m), "não menciona pagamento/cobrança");
  }
});
