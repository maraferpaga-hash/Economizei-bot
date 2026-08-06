// src/agent/index.js — Orquestrador do Agente de Perguntas (cod-0017, 8/8)
//
// Fecha a cadeia cod-0010..0017: é o fluxo ponta a ponta do Desenho §2 —
//   [1] COTA → [2] CLASSIFICADOR → [3] GUARDA (dentro do classifier) →
//   [4] EXECUTOR (o número nasce AQUI, no código) → [5] RENDER (narração LLM
//   + firewall de fidelidade + airbag template) → [6] LOG (Camada 7).
//
// É chamado pelo `else` final de processarTexto (src/index.js): todo texto
// livre que não casou nenhum comando vira uma pergunta sobre os gastos.
//
// Princípios honrados:
//   • Zero atrito: responde a intenção mais provável; pergunta de volta só
//     quando o assunto não é dinheiro (porta de topicalidade, Camada 2).
//   • Honestidade: erro técnico → resposta neutra + comando equivalente,
//     NUNCA um número chutado (Desenho §9).
//   • Firewall financeiro: cota PLANA; nada aqui conhece plano de ninguém.
//
// Dependências INJETÁVEIS (deps) pros testes rodarem 100% simulados, sem
// Supabase/Z-API/Gemini. A resolução é preguiçosa POR DEPENDÊNCIA: injetar
// as funções de dados evita até o require do supabase.js (que dispara
// createClient e exige envs inexistentes no sandbox).

'use strict';

const { log, maskPhone } = require('../logger');
const { decidirCota } = require('./cota.js');
const { REGISTRO } = require('./intents.js');
const { lembrarContexto, recuperarContexto } = require('./contexto.js');
const {
  montarForaDeEscopo,
  montarAvisoMeioLimitePerguntas,
  montarLimitePerguntasAtingido,
  montarErroAgente,
} = require('../formatter');

function _resolverDeps(deps = {}) {
  const d = { ...deps };
  if (!d.verificarLimitePerguntas || !d.incrementarPerguntas || !d.registrarPergunta) {
    const s = require('../supabase');
    d.verificarLimitePerguntas = d.verificarLimitePerguntas || s.verificarLimitePerguntas;
    d.incrementarPerguntas = d.incrementarPerguntas || s.incrementarPerguntas;
    d.registrarPergunta = d.registrarPergunta || s.registrarPergunta;
  }
  if (!d.enviarMensagem) d.enviarMensagem = require('../zapi').enviarMensagem;
  if (!d.classificar) d.classificar = require('./classifier.js').classificar;
  if (!d.responder) d.responder = require('./render.js').responder;
  if (!d.registro) d.registro = REGISTRO;
  // Memória curta de conversa (cod-0043) — em memória do processo, injetável.
  if (!d.recuperarContexto) d.recuperarContexto = recuperarContexto;
  if (!d.lembrarContexto) d.lembrarContexto = lembrarContexto;
  if (!d.modo) d.modo = process.env.AGENTE_MODO || 'llm';
  return d;
}

// Log fire-and-forget (Camada 7): falha de log nunca afeta o atendimento.
function _logPergunta(d, entrada) {
  try {
    Promise.resolve(d.registrarPergunta(entrada)).catch((e) =>
      log('agente_log_erro', { erro: e && e.message ? e.message : String(e) })
    );
  } catch (e) {
    log('agente_log_erro', { erro: e && e.message ? e.message : String(e) });
  }
}

// Contexto é conveniência, nunca risco: se a leitura falhar, a pergunta segue
// o caminho normal (sem contexto) em vez de derrubar o atendimento.
function _contextoVivo(d, phone) {
  try {
    return d.recuperarContexto(phone) || null;
  } catch (e) {
    log('agente_contexto_erro', { erro: e && e.message ? e.message : String(e) });
    return null;
  }
}

function _memorizarContexto(d, phone, intent, params) {
  try {
    d.lembrarContexto(phone, { intent, params: params || {} });
  } catch (e) {
    log('agente_contexto_erro', { erro: e && e.message ? e.message : String(e) });
  }
}

/**
 * Responde uma pergunta em texto livre sobre os gastos do usuário.
 * @returns {Promise<{respondeu: boolean, motivo?: string, intent?: string, modoUsado?: string}>}
 */
async function responderPergunta(phone, texto, deps = {}) {
  const d = _resolverDeps(deps);

  try {
    // [1] COTA — plana, anti-abuso (cod-0016).
    const cota = await d.verificarLimitePerguntas(phone);
    if (decidirCota(cota.usadas, cota.limite).atingido) {
      await d.enviarMensagem(phone, montarLimitePerguntasAtingido(cota.limite));
      _logPergunta(d, { phone, pergunta: texto, intent: null, respondeu: false });
      return { respondeu: false, motivo: 'limite_atingido' };
    }

    // [2]+[3] CLASSIFICADOR — já valida pela Camada 1 e saneia pela Camada 2
    // (cod-0013). Devolve 'fora_de_escopo' em qualquer degradação.
    // O contexto vivo (cod-0043) só entra como PISTA de reclassificação: um
    // follow-up de período herda a intenção anterior; sem contexto (ou fora do
    // TTL), o classificador decide sozinho como sempre.
    const contexto = _contextoVivo(d, phone);
    const cls = await d.classificar(texto, { contexto });
    if (!cls || cls.intent === 'fora_de_escopo') {
      await d.enviarMensagem(phone, montarForaDeEscopo());
      _logPergunta(d, {
        phone, pergunta: texto, intent: 'fora_de_escopo',
        confianca: cls && cls.confianca ? cls.confianca : null, respondeu: false,
      });
      return { respondeu: false, motivo: 'fora_de_escopo' };
    }

    // Defesa extra (o classifier já barra intent desconhecida; vale para
    // registros injetados/divergentes): sem definição → fora de escopo.
    const def = d.registro.find((i) => i && i.id === cls.intent);
    if (!def || typeof def.executar !== 'function') {
      await d.enviarMensagem(phone, montarForaDeEscopo());
      _logPergunta(d, { phone, pergunta: texto, intent: cls.intent, respondeu: false });
      return { respondeu: false, motivo: 'intent_desconhecida' };
    }

    // [4] EXECUTOR — código determinístico busca o dado e faz a conta
    // (Camada 0: o número nunca nasce no LLM).
    const fato = await def.executar(phone, cls.params || {});

    // [5] RENDER — narração (modo llm) com firewall de fidelidade; airbag
    // template em reprovação/erro (cod-0014).
    const resultado = await d.responder(fato, def, d.modo);
    await d.enviarMensagem(phone, resultado.texto);

    // [6] Cota + aviso do meio (idempotente por igualdade — cod-0016) + LOG.
    // Intent marcada com consomeCota:false (ex.: duvida_sobre_bot, cod-0042)
    // não incrementa nem dispara o aviso — mesma decisão do off-topic: ajuda
    // não é pergunta sobre os gastos.
    // Memória curta (cod-0043): guarda a intenção respondida pro follow-up de
    // período. Mesmo critério do off-topic — ajuda (`consomeCota:false`) não é
    // pergunta sobre os gastos, então não vira contexto. Grava mesmo em
    // estado-vazio: "e em junho?" depois de "não achei" continua fazendo sentido.
    if (def.consomeCota !== false) {
      _memorizarContexto(d, phone, cls.intent, cls.params || {});

      const novas = await d.incrementarPerguntas(phone);
      const usadasAgora = novas != null ? novas : cota.usadas + 1;
      if (decidirCota(usadasAgora, cota.limite).cruzouMetade) {
        await d.enviarMensagem(phone, montarAvisoMeioLimitePerguntas(usadasAgora, cota.limite));
      }
    }

    _logPergunta(d, {
      phone,
      pergunta: texto,
      intent: cls.intent,
      params: cls.params || {},
      confianca: cls.confianca || null,
      temDados: fato ? fato.temDados === true : null,
      modo: resultado.modoUsado,
      fidelidadeOk: resultado.fidelidadeOk,
      respondeu: true,
    });

    return { respondeu: true, intent: cls.intent, modoUsado: resultado.modoUsado };
  } catch (e) {
    // Desenho §9: resposta neutra + saída por comando. Nunca número chutado,
    // nunca stack trace pro usuário.
    log('agente_erro', { phone: maskPhone(phone), erro: e && e.message ? e.message : String(e) });
    try {
      await d.enviarMensagem(phone, montarErroAgente());
    } catch (e2) {
      log('agente_erro_envio', { erro: e2 && e2.message ? e2.message : String(e2) });
    }
    return { respondeu: false, motivo: 'erro_tecnico' };
  }
}

module.exports = { responderPergunta };
