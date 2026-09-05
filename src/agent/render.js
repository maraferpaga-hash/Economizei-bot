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
const { REGISTRO, temGiria, exemploSemGiria } = require('./intents.js');

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
// montarSugestao(intent, fato, registro) → string|null  (PURA) — cod-0044
// Sugestão contextual pós-resposta, custo zero de LLM: o texto é derivado dos
// `exemplos` do próprio REGISTRO (firewall de promessa — só aponta pra intent
// que EXISTE e é executável; intent removida do registro some da sugestão
// sozinha). Regras:
//   • no MÁXIMO 1 sugestão por resposta (o primeiro alvo válido ganha);
//   • SÓ quando a resposta teve dados (fato.temDados === true) — nunca em erro
//     ou estado-vazio: empurrar "pergunte também X" pra quem acabou de ouvir
//     "não tenho dados" é ruído, não ajuda;
//   • sem gíria (regra 2026-05-26) e sem dígito — o sufixo entra DEPOIS da
//     checagem de fidelidade numérica, então número aqui é proibido por
//     construção;
//   • intent sem `sugestoes[]` → null (resposta segue idêntica à de hoje).
// ─────────────────────────────────────────────────────────────────────────────
function montarSugestao(intent, fato, registro) {
  if (!fato || fato.temDados !== true) return null;
  if (!intent || !Array.isArray(intent.sugestoes) || intent.sugestoes.length === 0) return null;

  const lista = Array.isArray(registro) ? registro : [];
  for (const alvoId of intent.sugestoes) {
    if (alvoId === intent.id) continue; // nunca sugere a si mesma
    const alvo = lista.find((i) => i && i.id === alvoId && typeof i.executar === 'function');
    if (!alvo) continue; // firewall de promessa: fora do registro, não vira sugestão
    const exemplo = exemploSemGiria(alvo);
    if (!exemplo || temGiria(exemplo) || /\d/.test(exemplo)) continue;
    return `\n\n💡 Você também pode perguntar: _"${exemplo}?"_`;
  }
  return null;
}

// Anexa a sugestão (quando houver) ao resultado final do responder. Sem
// sugestão, devolve o MESMO objeto — intents sem `sugestoes[]` seguem idênticas.
function _anexarSugestao(resultado, intent, fato, registro) {
  const sugestao = montarSugestao(intent, fato, registro);
  if (!sugestao) return resultado;
  return { ...resultado, texto: resultado.texto + sugestao, sugestaoAnexada: true };
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

  // cod-0044: registro injetável nos testes; default = o REGISTRO real.
  const registro = Array.isArray(opts.registro) ? opts.registro : REGISTRO;
  const textoTemplate = intent.template(fato);
  const modoPedido = modo || MODO_PADRAO();

  // Opção 1 explícita, ou Camada 3: sem dado não há narração — só a resposta
  // honesta de ausência, que o template já dá. (Sem dado também não há
  // sugestão — montarSugestao devolve null com temDados !== true.)
  //
  // + `fato.semNarracao` (cod-0075): quando a resposta É uma LISTA, o template
  // manda. O prompt de narração pede "no máximo 2 frases" — o LLM resumiria a
  // lista de comparativos do Pro de volta pra um item só, desfazendo em
  // silêncio o que a intent montou. Mesmo princípio do entregaImagem: quando o
  // formato faz parte da resposta, não se reescreve. É opt-in por fato: nenhuma
  // outra intent muda de comportamento.
  if (modoPedido !== 'llm' || !fato || fato.temDados !== true || fato.semNarracao === true) {
    return _anexarSugestao(
      { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: false },
      intent, fato, registro
    );
  }

  const chamar = typeof opts.chamarModelo === 'function' ? opts.chamarModelo : _chamarGeminiNarracao;
  const prompt = montarPromptNarracao(fato, intent, textoTemplate);

  let narracao;
  try {
    narracao = await chamar(prompt, { modelo: opts.modelo || MODELO_PADRAO() });
  } catch (e) {
    log('agente_render_narracao_erro', { erro: e && e.message ? e.message : String(e) });
    return _anexarSugestao(
      { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: true },
      intent, fato, registro
    );
  }

  const texto = String(narracao == null ? '' : narracao).trim();
  if (!texto) {
    log('agente_render_narracao_vazia', {});
    return _anexarSugestao(
      { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: true },
      intent, fato, registro
    );
  }

  // Camada 5 — firewall de fidelidade numérica (determinístico, pós-geração).
  // A sugestão do cod-0044 entra DEPOIS desta checagem, deterministicamente e
  // sem dígitos — nunca compete com o firewall.
  const permitidos = montarAllowlist(fato, textoTemplate);
  const veredito = conferirFidelidadeNumerica(texto, permitidos);
  if (!veredito.ok) {
    log('agente_render_fidelidade_reprovada', { intrusos: veredito.intrusos.slice(0, 5) });
    return _anexarSugestao(
      { texto: textoTemplate, modoUsado: 'template', fidelidadeOk: false, caiuNoAirbag: true },
      intent, fato, registro
    );
  }

  return _anexarSugestao(
    { texto, modoUsado: 'llm', fidelidadeOk: true, caiuNoAirbag: false },
    intent, fato, registro
  );
}

module.exports = {
  responder,
  montarPromptNarracao,
  montarAllowlist,
  montarSugestao,
};
