// test/datas.test.js — módulo puro de interpretação de data (cod-0065a).
//
// Os casos "canada:" são os 4 formatos que apareceram no corpus REAL de
// Vancouver (test/corpus/canada/recibos.json). Os casos "pt-BR:" existem para
// travar a regressão: o formato brasileiro não pode mudar de comportamento.
//
// Rodar local:  node --test

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { interpretarData, dataParaISO } = require('../src/datas.js');

// Referência temporal fixa em TODOS os testes: a janela de plausibilidade não
// pode depender do dia em que a suíte roda (senão o teste apodrece sozinho).
const HOJE = new Date(Date.UTC(2026, 7, 22)); // 2026-08-22
const CA = { origem: 'CA', hoje: HOJE };
const BR = { origem: 'BR', hoje: HOJE };

// ── Os 4 formatos do corpus canadense ───────────────────────────────────────

test('canada: 26/07/29 é AA/MM/DD (2026-07-29), não DD/MM/AA (2029)', () => {
  const r = interpretarData('26/07/29', CA);
  assert.equal(r.iso, '2026-07-29');
  assert.equal(r.formato, 'AA/MM/DD');
  assert.equal(r.motivo, null);
});

test('canada: "Jul 29, 2026" (mês por extenso em inglês)', () => {
  assert.equal(interpretarData('Jul 29, 2026', CA).iso, '2026-07-29');
  assert.equal(interpretarData('JUL 29 2026', CA).iso, '2026-07-29');
  assert.equal(interpretarData('July 29, 2026', CA).iso, '2026-07-29');
});

test('canada: "2026-07-29" já em ISO passa direto', () => {
  const r = interpretarData('2026-07-29', CA);
  assert.equal(r.iso, '2026-07-29');
  assert.equal(r.formato, 'AAAA-MM-DD');
});

test('canada: "27-JUL-26" (DD-MON-YY)', () => {
  const r = interpretarData('27-JUL-26', CA);
  assert.equal(r.iso, '2026-07-27');
  assert.equal(r.formato, 'DD-MES-AA');
});

test('canada: os 4 recibos do corpus batem com a data esperada', () => {
  const casos = [
    ['26/07/29', '2026-07-29'], // ca-01 No Frills
    ['Jul 29, 2026', '2026-07-29'], // ca-03 Shoppers
    ['2026-07-29', '2026-07-29'], // ca-05 Dollarama
    ['27-JUL-26', '2026-07-27'], // ca-06 Revs
  ];
  for (const [cru, esperado] of casos) {
    assert.equal(dataParaISO(cru, CA), esperado, `falhou em "${cru}"`);
  }
});

// ── pt-BR não pode mudar ────────────────────────────────────────────────────

test('pt-BR: DD/MM/AAAA continua sendo dia primeiro', () => {
  const r = interpretarData('29/07/2026', BR);
  assert.equal(r.iso, '2026-07-29');
  assert.equal(r.formato, 'DD/MM/AAAA');
});

test('pt-BR: 05/07/2026 é 5 de julho — jamais 7 de maio', () => {
  assert.equal(dataParaISO('05/07/2026', BR), '2026-07-05');
  assert.equal(dataParaISO('05/07/26', BR), '2026-07-05');
});

test('pt-BR: separadores - e . também valem', () => {
  assert.equal(dataParaISO('29-07-2026', BR), '2026-07-29');
  assert.equal(dataParaISO('29.07.2026', BR), '2026-07-29');
});

test('pt-BR: mês por extenso em português', () => {
  assert.equal(dataParaISO('29 JUL 2026', BR), '2026-07-29');
  assert.equal(dataParaISO('29-AGO-25', BR), '2025-08-29');
  assert.equal(dataParaISO('29 de'.slice(0, 0) + '15 DEZ 2025', BR), '2025-12-15');
});

test('pt-BR: origem é o default — chamada sem opts.origem se comporta como BR', () => {
  assert.equal(dataParaISO('29/07/2026', { hoje: HOJE }), '2026-07-29');
});

// ── 🔴 Ambiguidade não vira chute ───────────────────────────────────────────

test('ambiguo: 05/07/26 em recibo canadense tem 2 leituras plausíveis → null', () => {
  // MM/DD/AA = 2026-05-07 · DD/MM/AA = 2026-07-05 — as duas cabem na janela.
  const r = interpretarData('05/07/26', CA);
  assert.equal(r.iso, null);
  assert.equal(r.motivo, 'ambiguo');
  assert.deepEqual(r.candidatos, ['2026-05-07', '2026-07-05']);
});

test('ambiguo: leituras diferentes que caem na MESMA data não são ambiguidade', () => {
  // 07/07/26 → MM/DD e DD/MM dão 2026-07-07; AA/MM/DD (2007) sai pela janela.
  const r = interpretarData('07/07/26', CA);
  assert.equal(r.iso, '2026-07-07');
  assert.equal(r.motivo, null);
});

test('ambiguo: o desempate é a plausibilidade, não a ordem dos arranjos', () => {
  // 26/07/29 no CA: DD/MM/AA daria 2029 (futuro) e MM/DD (mês 26) nem existe.
  // Sobra AA/MM/DD. Se o módulo escolhesse "o primeiro que casa", erraria.
  assert.equal(dataParaISO('26/07/29', CA), '2026-07-29');
});

// ── Data futura implausível ─────────────────────────────────────────────────

test('futuro: recibo não é do futuro — 2029 é recusado', () => {
  const r = interpretarData('2029-07-26', CA);
  assert.equal(r.iso, null);
  assert.equal(r.motivo, 'sem_leitura_plausivel');
});

test('futuro: pt-BR distingue "fora da janela" de "data inexistente"', () => {
  assert.equal(interpretarData('26/07/2029', BR).motivo, 'fora_da_janela');
  assert.equal(interpretarData('31/02/2026', BR).motivo, 'data_invalida');
});

test('futuro: amanhã ainda passa (tolerância de fuso), depois de amanhã não', () => {
  assert.equal(dataParaISO('23/08/2026', BR), '2026-08-23');
  assert.equal(dataParaISO('24/08/2026', BR), null);
});

test('passado: mais de 10 anos atrás sai da janela', () => {
  assert.equal(dataParaISO('29/07/2020', BR), '2020-07-29');
  assert.equal(dataParaISO('29/07/2010', BR), null);
});

// ── Ano de 2 dígitos ────────────────────────────────────────────────────────

test('ano curto: o século sai da janela, não de um pivô mágico', () => {
  assert.equal(dataParaISO('29/07/26', BR), '2026-07-29');
  assert.equal(dataParaISO('29/07/17', BR), '2017-07-29');
  assert.equal(dataParaISO('29/07/99', BR), null); // 1999 e 2099: nenhum plausível
});

// ── Entradas ruins ──────────────────────────────────────────────────────────

test('lixo: entrada não-texto, vazia ou irreconhecível devolve null com motivo', () => {
  assert.equal(interpretarData(null, BR).motivo, 'entrada_nao_texto');
  assert.equal(interpretarData(20260729, BR).motivo, 'entrada_nao_texto');
  assert.equal(interpretarData(new Date(), BR).motivo, 'entrada_nao_texto');
  assert.equal(interpretarData('   ', BR).motivo, 'entrada_vazia');
  assert.equal(interpretarData('TOTAL R$ 23,24', BR).motivo, 'formato_desconhecido');
  assert.equal(interpretarData('29/07', BR).motivo, 'formato_desconhecido');
  assert.equal(interpretarData('2026/07', BR).motivo, 'formato_desconhecido');
});

test('lixo: mês por extenso desconhecido não vira mês nenhum', () => {
  assert.equal(interpretarData('29-XYZ-26', BR).motivo, 'mes_desconhecido');
  assert.equal(interpretarData('BLARG 29, 2026', BR).motivo, 'mes_desconhecido');
  // Linha de recibo que POR ACASO tem a forma "<palavra> <n> <n>": o motivo é
  // 'mes_desconhecido' (a forma casou, a palavra não é mês) — e não
  // 'formato_desconhecido'. O que importa é que `iso` é null nos dois casos.
  assert.equal(interpretarData('TOTAL 23.24', BR).iso, null);
  assert.equal(interpretarData('TOTAL 23.24', BR).motivo, 'mes_desconhecido');
});

test('lixo: dia inexistente no calendário é recusado, não arredondado', () => {
  assert.equal(dataParaISO('2026-02-31', BR), null);
  assert.equal(dataParaISO('31 FEV 2026', BR), null);
  assert.equal(dataParaISO('FEB 30, 2026', BR), null);
});

// ── Pureza ──────────────────────────────────────────────────────────────────

test('pureza: espaço extra e caixa não mudam o resultado', () => {
  assert.equal(dataParaISO('  jul 29, 2026  ', CA), '2026-07-29');
  assert.equal(dataParaISO('  29/07/2026 ', BR), '2026-07-29');
});

test('pureza: a mesma entrada com o mesmo `hoje` dá sempre o mesmo resultado', () => {
  const a = interpretarData('26/07/29', CA);
  const b = interpretarData('26/07/29', CA);
  assert.deepEqual(a, b);
});

test('pureza: `hoje` é injetável — o resultado depende dele, não do relógio', () => {
  const emJulho = new Date(Date.UTC(2026, 6, 20)); // 2026-07-20
  // 2026-07-29 ainda era futuro em 20/07/2026.
  assert.equal(dataParaISO('2026-07-29', { origem: 'CA', hoje: emJulho }), null);
  assert.equal(dataParaISO('2026-07-29', CA), '2026-07-29');
});

test('pureza: origem desconhecida cai no comportamento BR (sem lançar)', () => {
  assert.equal(dataParaISO('29/07/2026', { origem: 'ZZ', hoje: HOJE }), '2026-07-29');
});
