// src/agent/periodo.js — parser determinístico de período (cod-0010, cod-0043)
//
// resolverPeriodo(rotulo, _hoje?) → 'YYYY-MM' | { invalido: true }
// extrairPeriodoIsolado(texto)    → rótulo de período | null       (cod-0043)
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

// ─────────────────────────────────────────────────────────────────────────────
// extrairPeriodoIsolado(texto) → rótulo de período | null            (cod-0043)
//
// Reconhece a pergunta de follow-up que é SÓ um período ("e em junho?",
// "e no mês passado?", "e 2026-05?"). É o gatilho determinístico da memória
// curta de contexto: quem herda a intenção anterior é o classifier, aqui só
// dizemos "este texto é um período solto e nada mais".
//
// PURA e CONSERVADORA de propósito: qualquer coisa que não seja exatamente um
// período (com conectores de conversa na frente) devolve null — e o fluxo
// normal segue pro classificador, comportamento atual intacto. Falso-negativo
// é inofensivo (a pessoa repete a pergunta inteira); falso-positivo mandaria
// uma pergunta off-topic pro executor de gastos.
// ─────────────────────────────────────────────────────────────────────────────

// Conectores de conversa que podem abrir um follow-up. NÃO inclui palavra que
// carregue sentido de período (ex.: "agora") — essas viram rótulo, não lixo.
const CONECTORES = new Set([
  'e', 'mas', 'entao', 'ai', 'ja', 'em', 'no', 'na', 'de', 'do', 'da',
  'que', 'tal', 'o', 'a', 'sobre', 'pra', 'para',
]);

// Sinônimos de conversa → rótulo do vocabulário fechado.
const SINONIMOS = new Map([
  ['mes passado', 'mes_passado'],
  ['mes anterior', 'mes_passado'],
  ['mes_passado', 'mes_passado'],
  ['mes atual', 'mes_atual'],
  ['mes corrente', 'mes_atual'],
  ['este mes', 'mes_atual'],
  ['esse mes', 'mes_atual'],
  ['mes', 'mes_atual'],
  ['mes_atual', 'mes_atual'],
  ['agora', 'mes_atual'],
]);

function _semAcento(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extrairPeriodoIsolado(texto) {
  if (texto == null || typeof texto !== 'string') return null;

  // Tira pontuação de conversa das pontas (mantém o hífen do 'AAAA-MM').
  let s = texto.trim().toLowerCase();
  s = s.replace(/^["'\u201c\u201d\u2018\u2019\s]+/, '').replace(/["'\u201c\u201d\u2018\u2019\s]+$/, '');
  s = s.replace(/[?!.,;:\s]+$/, '');
  if (s === '') return null;

  // Descarta os conectores iniciais ("e em junho" → "junho").
  const tokens = s.split(/\s+/);
  let i = 0;
  while (i < tokens.length && CONECTORES.has(_semAcento(tokens[i]))) i += 1;
  const resto = tokens.slice(i).join(' ');
  if (resto === '') return null;

  // Sinônimo de conversa (comparado sem acento: "mês passado" → "mes passado").
  const sinonimo = SINONIMOS.get(_semAcento(resto));
  if (sinonimo) return sinonimo;

  // Rótulo que o parser determinístico já entende ("junho", "2026-05").
  const resolvido = resolverPeriodo(resto);
  if (typeof resolvido === 'string') return resto;

  return null;
}

module.exports = { resolverPeriodo, extrairPeriodoIsolado };
