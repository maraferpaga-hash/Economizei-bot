// src/agent/render.js — Render do Agente de Perguntas (cod-0014)
//
// Passo [5] do fluxo (Desenho §2/§5 Camada 5 e §10): transforma o FATO
// estruturado (que o executar() da intenção montou a partir do banco) na
// resposta final ao usuário.
//
//   responder(fato, intent, modo, opts) → { texto, modoUsado, fidelidadeOk, caiuNoAirbag }
//     modo 'template' → intent.template(fato)  (determinístico, Opção 1)
//     modo 'llm'      → narra via Gemini a partir das strings JÁ FORMATADAS do
//                       fato + roda guards.conferirFidelidadeNumerica; se
//                       REPROVAR (ou o modelo falhar), cai no template — o
//                       AIRBAG. Default: 'llm' (Opção A com narração, decisão
//                       2026-06-24; configurável por env AGENTE_MODO).
//
// Princípios inegociáveis aqui:
//   • O número NUNCA nasce no LLM (Desenho §1/Camada 0). O prompt entrega os
//     números prontos e PROÍBE calcular/arredondar/inventar; a Camada 5
//     (conferirFidelidadeNumerica) confere depois, deterministicamente.
//   • Sem dado → sem LLM (Camada 3): fato.temDados === false responde direto
//     pelo template honesto de ausência. Não há o que "narrar" — e narração
//     sobre ausência é exatamente onde um LLM enfeita.
//   • Sem conselho além do dado (Camada 6): o prompt proíbe recomendação
//     financeira/promessa; o tom é formal, sem gíria (regra do bot).
//
// A chamada ao Gemini é INJETÁVEL (opts.chamarModelo) pros testes rodarem sem
// tocar a API nem carregar o SDK (lazy-require, mesmo padrão do classifier.js).

'use strict';

const { log } = require('../logger');
const { conferirFidelidadeNumerica } = require('./guards.js');

const MODO_PADRAO = () => process.env.AGENTE_MODO || 'llm';
const MODELO_PADRAO = () => process.env.AGENTE_MODELO || 'gemini-2.5-flash';

// ─────────────────────────────────────────────────────────────────────────────
// montarAllowlist(fato, textoTemplate) → string[]  (PURA)
// A allowlist da Camada 5: TUDO que o LLM tem permissão de citar como número.
//   • o texto do template (contém os números já formatados, % arredondado e o
//     "Mês/Ano" — a MESMA formatação brl() que o executor usou);
//   • as strings de fato.fmt (fonte única de formatação, Desenho §5 nota);
//   • o mesRef ('YYYY-MM' → autoriza o ano e o nº do mês, caso a narração
//     escreva "julho de 2026").
// Qualquer número fora disto na resposta do LLM → reprova → airbag.
// ─────────────────────────────────────────────────────────────────────────────
function montarAllowlist(fato, textoTemplate) {
  const permitidos = [];
  if (textoTemplate) permitidos.push(String(textoTemplate));
  if (fato && typeof fato === 'object') {
    if (fato.fmt && typeof fato.fmt === 'object') {
      for (const v of Object.values(fato.fmt)) {
        if (v != null) permitidos.push(String(v));
      }
    }
    if (fato.mesRef) permitidos.push(String(fato.mesRef));
    // % é derivado (não fica no fmt): autoriza o valor arredondado que o
    // template exibe E o cru, pra narração poder dizer "12%" sem reprovar.
    if (typeof fato.pct === 'number' && Number.isFinite(fato.pct)) {
      permitidos.push(Math.round(Math.abs(fato.pct)));
      permitidos.push(Math.abs(fato.pct));
    }
  }
  return permitidos;
}

// ─────────────────────────────────────────────────────────────────────────────
// montarPromptNarracao(fato, intent, textoTemplate) → string  (PURA)
// O contrato da narração (Camadas 5 e 6 no prompt — e depois na checagem):
// o LLM só REESCREVE; nunca calcula; nunca aconselha além do dado.
// ─────────────────────────────────────────────────────────────────────────────
function montarPromptNarracao(fato, intent, textoTemplate) {
  const fmt = (fato && fato.fmt && typeof fato.fmt === 'object') ? fato.fmt : {};
  const linhasFmt = Object.entries(fmt)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  return `Você é o Economizei, um assistente de gastos de supermercado no WhatsApp.
Reescreva a resposta-base abaixo como UMA mensagem curta e natural de WhatsApp (no máximo 2 frases), mantendo exatamente o mesmo significado.

Resposta-base (o conteúdo é este; você só melhora a fluidez):
"""${String(textoTemplate)}"""

Números autorizados (as únicas quantias que podem aparecer na sua resposta, escritas EXATAMENTE assim):
${linhasFmt || '- (nenhum valor além dos que já estão na resposta-base)'}

Regras invioláveis:
- NUNCA calcule, some, arredonde ou altere um número. Use somente os números autorizados acima, exatamente como estão escritos. Se precisar de um número que não está aqui, não o escreva.
- Não acrescente fatos, comparações ou conclusões que não estejam na resposta-base.
- Não dê conselho financeiro, recomendação de compra ou promessa de economia. Você só apresenta o dado.
- Português do Brasil, tom cordial e claro, sem gírias (proibido: "cê", "tá", "né", "ó").
- Responda SOMENTE com o texto da mensagem, sem aspas, sem markdown de cerca.
${intent && intent.descricao ? `\nContexto da pergunta do usuário: ${intent.descricao}.` : ''}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chamada real ao Gemini — lazy-require do SDK (importar este módulo, e rodar
// os testes com chamarModelo injetado, nunca carrega @google/generative-ai).
// temperature 0: narração de finanças pede o texto mais estável possível.
// ─────────────────────────────────────────────────────────────────────────────
let _genAI = null;
function _clienteGemini() {
  if (_genAI) return _genAI;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
}

async function _chamarGeminiNarracao(prompt, opts = {}) {
  const model = _clienteGemini().getGenerativeModel({
    model: opts.modelo || MODELO_PADRAO(),
    generationConfig: { temperature: 0 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// responder(fato, intent, modo, opts) → { texto, modoUsado, fidelidadeOk, caiuNoAirbag }
//   fato   — objeto devolvido por intent.executar() (nunca inventado aqui)
//   intent — a definição da intenção (precisa de .template; .descricao ajuda o prompt)
//   modo   — 'template' | 'llm' (default: env AGENTE_MODO ou 'llm')
//   opts.chamarModelo — async (prompt, {modelo}) → string (injetável nos testes)
//   opts.modelo       — id do modelo Gemini
//
// Retorno:
//   texto        — a mensagem final (sempre existe; na pior hipótese, o template)
//   modoUsado    — 'template' | 'llm' (o que de fato saiu pro usuário)
//   fidelidadeOk — true (llm aprovado) | false (llm REPROVADO → airbag) | null (não narrou)
//   caiuNoAirbag — true quando pediu llm mas entregou template (reprovado OU erro)
// ─────────────────────────────────────────────────────────────────────────────
async function responder(fato, intent, modo, opts = {}) {
  if (!intent || typeof intent.template !== 'function') {
    throw new Error('render.responder: intent sem template()');
  }

  const textoTemplate = intent.template(fato);
  const modoPedido = modo || MODO_PADRAO();

  // Opção 1 explícita, ou Camada 3: sem dado não há narração — só a resposta
  // honesta de ausência, que o template já dá.
  if (modoPedido !== 'llm' || !fato || fato.temDados !== true) {
    return { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: false };
  }

  const chamar = typeof opts.chamarModelo === 'function' ? opts.chamarModelo : _chamarGeminiNarracao;
  const prompt = montarPromptNarracao(fato, intent, textoTemplate);

  let narracao;
  try {
    narracao = await chamar(prompt, { modelo: opts.modelo || MODELO_PADRAO() });
  } catch (e) {
    log('agente_render_narracao_erro', { erro: e && e.message ? e.message : String(e) });
    return { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: true };
  }

  const texto = String(narracao == null ? '' : narracao).trim();
  if (!texto) {
    log('agente_render_narracao_vazia', {});
    return { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: true };
  }

  // Camada 5 — firewall de fidelidade numérica (determinístico, pós-geração).
  const permitidos = montarAllowlist(fato, textoTemplate);
  const veredito = conferirFidelidadeNumerica(texto, permitidos);
  if (!veredito.ok) {
    log('agente_render_fidelidade_reprovada', { intrusos: veredito.intrusos.slice(0, 5) });
    return { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: false, caiuNoAirbag: true };
  }

  return { texto, modoUsado: 'llm', fidelidadeOk: true, caiuNoAirbag: false };
}

module.exports = {
  responder,
  montarPromptNarracao,
  montarAllowlist,
};
