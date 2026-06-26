// src/agent/periodo.js — parser determinístico de período (cod-0010)
//
// resolverPeriodo(rotulo, _hoje?) → 'YYYY-MM' | { invalido: true }
//
// Rótulos aceitos (produzidos pelo classifier, vocabulário fechado):
//   'mes_atual'   → mês corrente
//   'mes_passado' → mês anterior (trata virada de ano)
//   'janeiro'..'dezembro' (com ou sem acento) → mês mais recente com esse nome
//   'YYYY-MM'     → passthrough se formato e valores válidos
//   qualquer outro → { invalido: true }
//
// _hoje é injetável para testes determinísticos; em produção omite-se.

'use strict';

const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Variantes sem acento (março → marco) para tolerância
const MESES_PT_SEM_ACENTO = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatarMes(ano, mes) {
  return `${ano}-${pad2(mes)}`;
}

/**
 * Resolve um rótulo de período para uma referência de mês 'YYYY-MM'.
 * @param {string} rotulo  — rótulo produzido pelo classifier
 * @param {Date}  [_hoje]  — injetável para testes (padrão: new Date())
 * @returns {string | {invalido: true}}
 */
function resolverPeriodo(rotulo, _hoje) {
  if (!rotulo || typeof rotulo !== 'string') return { invalido: true };

  const agora = _hoje instanceof Date ? _hoje : new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1; // 1..12

  const r = rotulo.trim().toLowerCase();

  if (r === '') return { invalido: true };

  // ── Rótulos fixos ───────────────────────────────────────────────────────────
  if (r === 'mes_atual') return formatarMes(anoAtual, mesAtual);

  if (r === 'mes_passado') {
    return mesAtual === 1
      ? formatarMes(anoAtual - 1, 12)
      : formatarMes(anoAtual, mesAtual - 1);
  }

  // ── Passthrough YYYY-MM ─────────────────────────────────────────────────────
  if (/^\d{4}-\d{2}$/.test(r)) {
    const ano = parseInt(r.slice(0, 4), 10);
    const mes = parseInt(r.slice(5, 7), 10);
    if (mes >= 1 && mes <= 12 && ano >= 2000 && ano <= 2100) {
      return formatarMes(ano, mes);
    }
    return { invalido: true };
  }

  // ── Nome de mês em português ────────────────────────────────────────────────
  let idx = MESES_PT.indexOf(r);
  if (idx === -1) idx = MESES_PT_SEM_ACENTO.indexOf(r);
  if (idx !== -1) {
    const mesNum = idx + 1; // 1..12
    // Mês mais recente: se já ocorreu (ou é o atual) neste ano → ano atual;
    // se ainda não chegou → ano anterior.
    return mesNum <= mesAtual
      ? formatarMes(anoAtual, mesNum)
      : formatarMes(anoAtual - 1, mesNum);
  }

  return { invalido: true };
}

module.exports = { resolverPeriodo };
