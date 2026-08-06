// src/agent/contexto.js — memória curta de conversa do Agente (cod-0043)
//
// Guarda, POR USUÁRIO, a última intenção respondida com seus parâmetros, para
// que um follow-up curto ("e em junho?") reuse a intenção anterior trocando só
// o período. Nada mais: sem histórico, sem multi-turno longo, sem tabela nova.
//
// Decisões de projeto (AGENDA cod-0043):
//   • EM MEMÓRIA DO PROCESSO — zero migration, zero I/O. Reinício do servidor
//     esquece tudo; o pior caso é a pessoa repetir a pergunta inteira.
//   • TTL curto (10 min): fora da janela, o contexto simplesmente não existe e
//     o comportamento volta a ser o atual (o classificador decide sozinho).
//   • Nunca guarda o TEXTO da pergunta nem nada de sensível — só o id da
//     intenção e os parâmetros já saneados pelo vocabulário fechado (LGPD:
//     minimização; o telefone é só a chave em memória volátil).
//   • O contexto SÓ reclassifica. O número continua nascendo no executor
//     determinístico — nada aqui produz valor de dinheiro.
//
// Exporta:
//   lembrarContexto(phone, { intent, params }, _agora?)
//   recuperarContexto(phone, _agora?) → { intent, params } | null
//   esquecerContexto(phone)
//   _limparTudo() / _tamanho()   — só para os testes
//
// `_agora` é injetável (ms epoch ou Date) para testes determinísticos de TTL.

'use strict';

const CONTEXTO_TTL_MS = 10 * 60 * 1000; // 10 minutos

// Teto de entradas vivas: o Map é global ao processo, então precisa de limite
// (um pico de usuários novos não pode virar vazamento de memória). Ao estourar,
// expira o que já venceu e, se ainda estourar, descarta os mais antigos.
const MAX_ENTRADAS = 5000;

const _memoria = new Map(); // phone → { intent, params, ts }

function _ms(_agora) {
  if (_agora instanceof Date) return _agora.getTime();
  return typeof _agora === 'number' && Number.isFinite(_agora) ? _agora : Date.now();
}

function _chave(phone) {
  return phone == null ? '' : String(phone);
}

// Só valores primitivos dos params — cópia rasa evita que quem gravou continue
// mexendo no que está memorizado (os params são planos por construção).
function _copiarParams(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return {};
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) out[k] = v;
  }
  return out;
}

function _podar(agoraMs) {
  for (const [k, v] of _memoria) {
    if (agoraMs - v.ts >= CONTEXTO_TTL_MS) _memoria.delete(k);
  }
  // Ordem de inserção do Map = ordem de recência (lembrar sempre re-insere).
  while (_memoria.size > MAX_ENTRADAS) {
    const maisAntiga = _memoria.keys().next();
    if (maisAntiga.done) break;
    _memoria.delete(maisAntiga.value);
  }
}

/**
 * Memoriza a última intenção respondida para este usuário.
 * Chamada só depois de uma resposta de verdade — nunca em off-topic nem erro.
 */
function lembrarContexto(phone, ctx, _agora) {
  const k = _chave(phone);
  if (!k) return;
  if (!ctx || typeof ctx.intent !== 'string' || ctx.intent.trim() === '') return;

  const agoraMs = _ms(_agora);
  _memoria.delete(k); // re-inserir mantém a ordem de recência
  _memoria.set(k, {
    intent: ctx.intent,
    params: _copiarParams(ctx.params),
    ts: agoraMs,
  });
  if (_memoria.size > MAX_ENTRADAS) _podar(agoraMs);
}

/**
 * Devolve o contexto vivo do usuário, ou null (ausente/expirado).
 * Entrada expirada é apagada na leitura — TTL é verdade, não sugestão.
 */
function recuperarContexto(phone, _agora) {
  const k = _chave(phone);
  if (!k) return null;
  const item = _memoria.get(k);
  if (!item) return null;

  if (_ms(_agora) - item.ts >= CONTEXTO_TTL_MS) {
    _memoria.delete(k);
    return null;
  }
  return { intent: item.intent, params: { ...item.params } };
}

function esquecerContexto(phone) {
  const k = _chave(phone);
  if (k) _memoria.delete(k);
}

// ── só para testes ───────────────────────────────────────────────────────────
function _limparTudo() {
  _memoria.clear();
}

function _tamanho() {
  return _memoria.size;
}

module.exports = {
  CONTEXTO_TTL_MS,
  MAX_ENTRADAS,
  lembrarContexto,
  recuperarContexto,
  esquecerContexto,
  _limparTudo,
  _tamanho,
};
