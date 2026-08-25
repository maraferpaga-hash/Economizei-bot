// test/parcelas.test.js — cod-0072a
//
// O que estes testes protegem, em ordem de importância:
//
//   1. DATA NUNCA VIRA PARCELA. "12/2026" e "12/12/2026" são as armadilhas que
//      motivaram a tarefa: um parser guloso lê dezembro como "12 de 2026
//      parcelas" e o compromisso futuro do usuário nasce ficção.
//   2. MARCADOR VENCE A COLUNA DE DATA. Numa linha real de fatura convivem a
//      data da compra e o parcelamento ("05/07 NETFLIX PARC 03/12"). Ler o
//      primeiro par que aparecer é errado.
//   3. AMBIGUIDADE SAI ROTULADA, NÃO ESCONDIDA. "03/12" solto é idêntico a
//      "3 de dezembro" — sai com confianca 'media' pra cod-0072 decidir.
//
// Rodar: node --test test/parcelas.test.js

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { analisarParcela, extrairParcela, MAX_PARCELAS } = require('../src/parcelas');

function par(texto, opts) {
  return extrairParcela(texto, opts);
}

// ── 1) As formas que a fatura brasileira realmente imprime ──────────────────

test('formas com marcador explícito → confianca alta', () => {
  const casos = [
    ['PARC 03/12', 3, 12],
    ['PARC. 3/12', 3, 12],
    ['PARCELA 3/12', 3, 12],
    ['PARCELAS 3/12', 3, 12],
    ['parc 3 de 12', 3, 12],
    ['PARC 3-12', 3, 12],
    ['NETFLIX.COM (03/12)', 3, 12],
    ['MAGAZINE LUIZA 3 DE 12', 3, 12],
    ['CASAS BAHIA 1 de 10', 1, 10],
  ];
  for (const [texto, atual, total] of casos) {
    const p = par(texto);
    assert.ok(p, `não leu parcela em "${texto}"`);
    assert.equal(p.parcelaAtual, atual, texto);
    assert.equal(p.parcelaTotal, total, texto);
    assert.equal(p.confianca, 'alta', `"${texto}" tem marcador — confiança devia ser alta`);
  }
});

test('forma solta NN/NN é lida', () => {
  const p = par('03/12');
  assert.deepEqual(
    { a: p.parcelaAtual, t: p.parcelaTotal, f: p.forma },
    { a: 3, t: 12, f: 'solto' }
  );
});

test('zeros à esquerda e espaços em volta da barra não atrapalham', () => {
  for (const texto of ['03 / 12', ' 3/12 ', '03/12']) {
    const p = par(texto);
    assert.ok(p, texto);
    assert.equal(p.parcelaAtual, 3, texto);
    assert.equal(p.parcelaTotal, 12, texto);
  }
});

// ── 2) O caso que motivou a tarefa: linha com data E parcela ────────────────

test('marcador vence a coluna de data na mesma linha', () => {
  const linha = '05/07 NETFLIX.COM SAO PAULO PARC 03/12 45,90';
  const p = par(linha);
  assert.equal(p.parcelaAtual, 3, 'leu a data (05) em vez da parcela (03)');
  assert.equal(p.parcelaTotal, 12, 'leu o mês (07) em vez do total (12)');
  assert.equal(p.confianca, 'alta');
});

test('linha com valor em reais depois da parcela não confunde a leitura', () => {
  const p = par('LOJAS RENNER PARC 07/10 R$ 129,90');
  assert.equal(p.parcelaAtual, 7);
  assert.equal(p.parcelaTotal, 10);
});

// ── 3) Negativos: data NUNCA vira parcela ───────────────────────────────────

test('data com ano de 4 dígitos é recusada', () => {
  for (const texto of ['12/2026', '01/2027', 'VENC 12/2026']) {
    assert.equal(par(texto), null, `"${texto}" virou parcela`);
  }
});

test('data completa DD/MM/AAAA é recusada — nem o pedaço vira parcela', () => {
  for (const texto of ['12/12/2026', '05/07/2026', 'COMPRA EM 03/12/2025']) {
    assert.equal(par(texto), null, `"${texto}" virou parcela`);
  }
});

test('data curta DD/MM/AA também é recusada', () => {
  assert.equal(par('05/07/26'), null);
});

test('"3 de 12 de 2026" é data por extenso, não parcela', () => {
  assert.equal(par('3 de 12 de 2026'), null);
});

// ── 4) Negativos: pares que existem mas não são parcelamento ────────────────

test('à vista (01/01) não é parcelamento', () => {
  assert.equal(par('01/01'), null);
  assert.equal(analisarParcela('PARC 01/01').motivo, 'sem_parcelamento');
});

test('parcela atual maior que o total é recusada', () => {
  assert.equal(par('13/12'), null);
  assert.equal(analisarParcela('PARC 13/12').motivo, 'atual_maior_que_total');
});

test('parcela zero é recusada', () => {
  assert.equal(par('0/12'), null);
  assert.equal(analisarParcela('PARC 0/12').motivo, 'parcela_atual_invalida');
});

test(`total acima de ${MAX_PARCELAS} é implausível`, () => {
  assert.equal(par('50/50'), null);
  assert.equal(analisarParcela('PARC 03/60').motivo, 'total_implausivel');
  assert.ok(par(`03/${MAX_PARCELAS}`), 'o teto em si tem que passar');
});

test('texto sem par numérico nenhum devolve null', () => {
  for (const texto of ['R$ 12,00', 'UBER TRIP', 'PAGAMENTO EFETUADO', 'SALDO 1.234,56']) {
    assert.equal(par(texto), null, texto);
  }
});

test('entrada não-string ou vazia devolve null, sem lançar', () => {
  for (const v of [null, undefined, 12, {}, [], '', '   ']) {
    assert.equal(extrairParcela(v), null, String(v));
  }
  assert.equal(analisarParcela(null).motivo, 'entrada_invalida');
  assert.equal(analisarParcela('   ').motivo, 'entrada_vazia');
});

// ── 5) A ambiguidade sai rotulada ───────────────────────────────────────────

test('NN/NN solto que também é data válida sai com confianca media', () => {
  for (const texto of ['03/12', '05/07', '02/10']) {
    const p = par(texto);
    assert.ok(p, texto);
    assert.equal(p.confianca, 'media', `"${texto}" também é DD/MM — não pode sair como alta`);
  }
});

// A ambiguidade real é MENOR do que parece, e isso é resultado das regras de
// validação, não de sorte: uma data só sobrevive como parcela se o dia couber
// dentro do mês (28/02 seria "parcela 28 de 2" — recusada por atual > total).
// Sobra a faixa estreita dia ≤ mês. Travado aqui pra ninguém "simplificar"
// depois achando que a checagem de intervalo é redundante.
test('data com dia maior que o mês nem chega a ser parcela ambígua', () => {
  const recusas = ['atual_maior_que_total', 'sem_parcelamento']; // 31/01 cai na 2ª: total 1
  for (const texto of ['28/02', '31/01', '25/12', '15/07']) {
    assert.equal(par(texto), null, `"${texto}" devia ser recusado`);
    assert.ok(recusas.includes(analisarParcela(texto).motivo), `${texto}: ${analisarParcela(texto).motivo}`);
  }
});

test('NN/NN solto que NÃO pode ser data sai com confianca alta', () => {
  for (const texto of ['03/24', '02/18', '01/36']) {
    const p = par(texto);
    assert.ok(p, texto);
    assert.equal(p.confianca, 'alta', `"${texto}" não é data possível — devia ser alta`);
  }
});

test('exigirMarcador recusa tudo que não for inequívoco', () => {
  assert.equal(par('03/12', { exigirMarcador: true }), null);
  assert.equal(par('03/24', { exigirMarcador: true }), null, 'sem marcador é sem marcador');
  assert.equal(analisarParcela('03/12', { exigirMarcador: true }).motivo, 'sem_marcador');

  const p = par('PARC 03/12', { exigirMarcador: true });
  assert.ok(p, 'com marcador tem que passar mesmo no modo estrito');
  assert.equal(p.parcelaTotal, 12);
});

// ── 6) Contrato do módulo ───────────────────────────────────────────────────

test('função pura: mesma entrada, mesma saída, sem efeito colateral', () => {
  const a = analisarParcela('PARC 03/12');
  const b = analisarParcela('PARC 03/12');
  assert.deepEqual(a, b);
  assert.notEqual(a.parcela, b.parcela, 'devolve objeto novo, não uma referência compartilhada');
});

test('analisarParcela devolve motivo null quando lê, e parcela null quando recusa', () => {
  const ok = analisarParcela('PARC 03/12');
  assert.equal(ok.motivo, null);
  assert.ok(ok.parcela);

  const nao = analisarParcela('12/2026');
  assert.equal(nao.parcela, null);
  assert.ok(typeof nao.motivo === 'string' && nao.motivo.length > 0);
});
