// src/parcelas.js — leitura de PARCELAMENTO numa linha de fatura de cartão.
//
// Por que este módulo existe (cod-0072a): numa fatura, "NETFLIX PARC 03/12
// 45,90" NÃO é um gasto de 45,90 dentro de uma compra de 45,90 — é a 3ª de 12
// parcelas. Sem ler o parcelamento, o mês do usuário recebe o valor certo mas
// perde o contexto (compromisso futuro), e qualquer soma "quanto ainda devo"
// nasce errada. Este módulo devolve só o par {atual, total}; o que fazer com
// ele é decisão da cod-0072.
//
// Princípio que rege o módulo (CODE_GUIDE §0.4 — saída segura > erro confiante):
// número de parcela errado é pior que parcela ausente. Qualquer coisa que possa
// ser DATA e não parcela sai como `null`. É por isso que "12/2026" e
// "12/12/2026" são recusados: o ano de 4 dígitos e a terceira casa denunciam a
// data, e um parser guloso transformaria dezembro numa fatura de 2026 parcelas.
//
// Módulo PURO: sem I/O, sem require, sem dependência de locale.
//
// ⚠️ A ambiguidade que NÃO dá pra resolver aqui dentro: um "03/12" solto é
// exatamente igual a "3 de dezembro". A linha da fatura costuma trazer as duas
// coisas ("05/07 NETFLIX PARC 03/12"), e quem sabe qual coluna é qual é o
// chamador, não este módulo. A saída expõe isso em `confianca`:
//   'alta'  → tinha marcador explícito (PARC / DE / parênteses). É parcela.
//   'media' → "NN/NN" solto que TAMBÉM seria uma data DD/MM válida.
// Quem for plugar (cod-0072) decide se aceita 'media'; `exigirMarcador: true`
// recusa tudo que não for 'alta'.

'use strict';

// Teto de plausibilidade. O varejo brasileiro chega a 48x; acima disso o par
// quase sempre é outra coisa (código, hora, porcentagem "50/50").
const MAX_PARCELAS = 48;

// Marcadores que tornam a leitura inequívoca. Ordem importa: o mais específico
// primeiro, pra "PARC 3 DE 12" não casar pela metade.
const MARCADORES = [
  // PARC / PARCELA / PARC. seguido de N/M  ou  N DE M
  /\bPARC(?:ELA)?S?\.?\s*(\d{1,2})\s*(?:\/|-|\s+DE\s+)\s*(\d{1,2})\b/i,
  // (03/12) — parênteses são marcador por si só
  /\((\d{1,2})\s*\/\s*(\d{1,2})\)/,
  // 3 DE 12  (sem a palavra PARC)
  /\b(\d{1,2})\s+DE\s+(\d{1,2})\b(?!\s+DE\b)/i,
];

// "NN/NN" solto — só vale quando NÃO faz parte de uma data maior. As duas
// âncoras negativas fazem o trabalho pesado:
//   (?<![\d/])  → nada de dígito ou barra ANTES  (mata o "12" de 12/12/2026)
//   (?![\d/])   → nada de dígito ou barra DEPOIS (mata o "/2026" e o "/26")
const NU_SOLTO = /(?<![\d/])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d/])/;

const DIAS_NO_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** "03/12" também é 3 de dezembro? Se for, a leitura solta é ambígua. */
function _pareceData(a, b) {
  return b >= 1 && b <= 12 && a >= 1 && a <= DIAS_NO_MES[b - 1];
}

function _falha(motivo) {
  return { parcela: null, motivo, confianca: null };
}

function _validar(atual, total, forma, confianca) {
  if (!Number.isInteger(atual) || !Number.isInteger(total)) return _falha('nao_numerico');
  if (atual < 1) return _falha('parcela_atual_invalida');
  if (total < 2) return _falha('sem_parcelamento'); // "01/01" é à vista, não parcela
  if (total > MAX_PARCELAS) return _falha('total_implausivel');
  if (atual > total) return _falha('atual_maior_que_total');
  return {
    parcela: { parcelaAtual: atual, parcelaTotal: total, forma, confianca },
    motivo: null,
    confianca,
  };
}

/**
 * Diagnóstico completo — use quando for logar POR QUE não leu.
 *
 * @param {string} texto  trecho da fatura (a linha inteira serve)
 * @param {{exigirMarcador?: boolean}} [opts]
 * @returns {{parcela: {parcelaAtual:number,parcelaTotal:number,forma:string,confianca:string}|null,
 *            motivo: string|null, confianca: string|null}}
 */
function analisarParcela(texto, opts = {}) {
  if (typeof texto !== 'string') return _falha('entrada_invalida');
  const s = texto.trim();
  if (!s) return _falha('entrada_vazia');

  // 1) Marcador explícito vence sempre — é ele que resolve a linha que tem
  //    data E parcela ("05/07 NETFLIX PARC 03/12": lê 03/12, ignora 05/07).
  for (const re of MARCADORES) {
    const m = re.exec(s);
    if (m) return _validar(Number(m[1]), Number(m[2]), 'marcador', 'alta');
  }

  if (opts.exigirMarcador) return _falha('sem_marcador');

  // 2) "NN/NN" solto. Só chega aqui quem não é pedaço de data maior.
  const m = NU_SOLTO.exec(s);
  if (!m) return _falha('formato_desconhecido');

  const atual = Number(m[1]);
  const total = Number(m[2]);
  const conf = _pareceData(atual, total) ? 'media' : 'alta';
  return _validar(atual, total, 'solto', conf);
}

/**
 * Açúcar: devolve `{parcelaAtual, parcelaTotal, forma, confianca}` ou `null`.
 * O motivo da recusa se perde — use `analisarParcela` quando for logar.
 *
 * @param {string} texto
 * @param {{exigirMarcador?: boolean}} [opts]
 */
function extrairParcela(texto, opts = {}) {
  return analisarParcela(texto, opts).parcela;
}

module.exports = {
  analisarParcela,
  extrairParcela,
  MAX_PARCELAS,
};
