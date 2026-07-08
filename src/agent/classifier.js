// src/agent/classifier.js — Classificador do Agente de Perguntas (cod-0013)
//
// Passo [2] do fluxo (Desenho §2/§4): recebe o texto livre do usuário e devolve
// UMA intenção conhecida (ou 'fora_de_escopo'). É a única parte da feature em que
// o LLM decide algo — e, por construção (Camada 0), ele NÃO devolve número nenhum:
// só escolhe a intenção e preenche parâmetros de vocabulário fechado.
//
// Exporta:
//   montarPromptClassificacao(registro, pergunta) → string   (PURA, testável)
//   classificar(pergunta, opts)                   → { intent, params?, confianca? }
//
// `classificar` chama o Gemini no mesmo padrão do gemini.js (gemini-2.5-flash,
// temperature 0, responseMimeType JSON) e valida a saída pela Camada 1
// (guards.validarClassificacao). A chamada ao modelo é INJETÁVEL via
// opts.chamarModelo para os testes rodarem sem tocar a API (e sem puxar o SDK).
//
// Filosofia de falha SEGURA (Desenho §5): em dúvida, degrada com honestidade.
//   - JSON inválido / erro do modelo / pergunta vazia → { intent: 'fora_de_escopo' }
//   - intenção inexistente / saída inválida           → { intent: 'fora_de_escopo' }
//   - problema SÓ de parâmetro → porta de topicalidade (Camada 2): a pergunta é
//     sobre dinheiro e a intenção existe, então NÃO jogamos fora — removemos o
//     parâmetro mal-lido e revalidamos (o template responde o mais geral; o
//     número segue blindado pelas outras camadas).

'use strict';

const { log } = require('../logger');
const { REGISTRO } = require('./intents.js');
const { validarClassificacao } = require('./guards.js');
const { resolverPeriodo } = require('./periodo.js');

const MODELO_PADRAO = process.env.AGENTE_MODELO || 'gemini-2.5-flash';
const CONFIANCAS_VALIDAS = ['alta', 'media', 'baixa'];

// ─────────────────────────────────────────────────────────────────────────────
// montarPromptClassificacao(registro, pergunta) → string  (PURA)
// Monta o prompt A PARTIR do registro: adicionar/editar intenção nunca exige
// reescrever esta função. Determinística: mesmo registro + pergunta → mesma string.
// ─────────────────────────────────────────────────────────────────────────────
function _descreverParametros(parametros) {
  if (!parametros || typeof parametros !== 'object') return '(nenhum)';
  const partes = [];
  for (const [nome, regra] of Object.entries(parametros)) {
    if (regra && regra.tipo === 'enum') {
      const valores = Array.isArray(regra.valores) ? regra.valores.join(' | ') : '';
      partes.push(`${nome} (um de: ${valores})`);
    } else if (regra && regra.tipo === 'periodo') {
      partes.push(`${nome} (rótulo de período)`);
    } else {
      partes.push(nome);
    }
  }
  return partes.length ? partes.join(', ') : '(nenhum)';
}

function montarPromptClassificacao(registro, pergunta) {
  const lista = Array.isArray(registro) ? registro : [];

  const blocos = lista.map((intent) => {
    const exemplos = (intent.exemplos || []).map((e) => `"${e}"`).join(', ');
    return [
      `- id: ${intent.id}`,
      `  descrição: ${intent.descricao}`,
      exemplos ? `  exemplos: ${exemplos}` : null,
      `  parâmetros: ${_descreverParametros(intent.parametros)}`,
    ].filter(Boolean).join('\n');
  }).join('\n');

  return `Você classifica a pergunta de um usuário sobre os PRÓPRIOS gastos de supermercado numa intenção conhecida.
Retorne SOMENTE um JSON válido, sem markdown, sem texto adicional, neste formato:
{ "intent": "<um id da lista ou fora_de_escopo>", "params": { ... }, "confianca": "alta|media|baixa" }

Intenções disponíveis:
${blocos}

Rótulos de período aceitos (use exatamente um destes; nunca uma data escrita por você):
"mes_atual", "mes_passado", um nome de mês em português ("janeiro".."dezembro"), ou "AAAA-MM".

Regras invioláveis:
- "intent" só pode ser um id da lista acima OU "fora_de_escopo".
- Se a pergunta não tem relação com gastos/compras/dinheiro do usuário, devolva { "intent": "fora_de_escopo" }.
- Preencha "params" apenas com os parâmetros declarados na intenção escolhida, usando o vocabulário fechado indicado (categorias e rótulos de período). Omita um parâmetro que você não souber.
- NUNCA devolva valores de gasto, totais ou qualquer número de dinheiro. Você só identifica a intenção — quem calcula é o sistema.

Pergunta do usuário:
"""${String(pergunta).trim()}"""`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chamada real ao Gemini (mesmo padrão do gemini.js). Lazy-require do SDK para
// que IMPORTAR este módulo — e rodar os testes com chamarModelo injetado — nunca
// carregue @google/generative-ai nem exija GEMINI_API_KEY.
// ─────────────────────────────────────────────────────────────────────────────
let _genAI = null;
function _clienteGemini() {
  if (_genAI) return _genAI;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
}

async function _chamarGeminiClassificacao(prompt, opts = {}) {
  const modelo = opts.modelo || MODELO_PADRAO;
  const model = _clienteGemini().getGenerativeModel({
    model: modelo,
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de parsing (privados)
// ─────────────────────────────────────────────────────────────────────────────

// Remove cerca de markdown (```json ... ```), caso o modelo escorregue.
function _limparFence(texto) {
  let s = String(texto == null ? '' : texto).trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '').trim();
  }
  return s;
}

function _parseJson(bruto) {
  const s = _limparFence(bruto);
  if (!s) return null;
  try {
    const obj = JSON.parse(s);
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

function _normalizarConfianca(valor) {
  const c = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
  return CONFIANCAS_VALIDAS.includes(c) ? c : 'media';
}

// Mantém só os parâmetros declarados E válidos para a intenção — descarta
// desconhecidos e valores fora do vocabulário fechado. Nos 3 intents do MVP todo
// parâmetro é opcional, então sanear sempre devolve uma classificação acionável.
function _sanitizarParams(def, params) {
  const limpos = {};
  if (!def || !def.parametros || !params || typeof params !== 'object') return limpos;
  for (const [chave, valor] of Object.entries(params)) {
    const regra = def.parametros[chave];
    if (!regra) continue; // parâmetro desconhecido → descarta
    const ausente = valor === undefined || valor === null || valor === '';
    if (ausente) continue;
    if (regra.tipo === 'enum') {
      const valores = Array.isArray(regra.valores) ? regra.valores : [];
      if (valores.includes(valor)) limpos[chave] = valor;
    } else if (regra.tipo === 'periodo') {
      const resolvido = resolverPeriodo(valor);
      if (!(resolvido && typeof resolvido === 'object' && resolvido.invalido)) {
        limpos[chave] = valor;
      }
    } else {
      limpos[chave] = valor;
    }
  }
  return limpos;
}

// ─────────────────────────────────────────────────────────────────────────────
// classificar(pergunta, opts) → { intent, params?, confianca? }
//   opts.registro     — registro de intenções (default: REGISTRO do intents.js)
//   opts.chamarModelo — async (prompt, {modelo}) → string  (injetável nos testes)
//   opts.modelo       — id do modelo Gemini (default: env AGENTE_MODELO ou flash)
// ─────────────────────────────────────────────────────────────────────────────
async function classificar(pergunta, opts = {}) {
  const registro = Array.isArray(opts.registro) ? opts.registro : REGISTRO;
  const chamar = typeof opts.chamarModelo === 'function'
    ? opts.chamarModelo
    : _chamarGeminiClassificacao;
  const modelo = opts.modelo || MODELO_PADRAO;

  if (pergunta == null || String(pergunta).trim() === '') {
    return { intent: 'fora_de_escopo' };
  }

  const prompt = montarPromptClassificacao(registro, pergunta);

  let bruto;
  try {
    bruto = await chamar(prompt, { modelo });
  } catch (e) {
    log('agente_classificador_erro', { erro: e && e.message ? e.message : String(e) });
    return { intent: 'fora_de_escopo' };
  }

  const saida = _parseJson(bruto);
  if (!saida) {
    log('agente_classificador_json_invalido', { inicio: String(bruto).slice(0, 120) });
    return { intent: 'fora_de_escopo' };
  }

  // Camada 1 — vocabulário fechado contra o registro.
  let veredito = validarClassificacao(saida, registro);
  if (veredito.ok) {
    return {
      intent: veredito.intent,
      params: veredito.params,
      confianca: _normalizarConfianca(saida.confianca),
    };
  }

  // Off-topic legítimo, saída inválida ou intent inexistente → não acionável.
  if (
    veredito.motivo === 'fora_de_escopo' ||
    veredito.motivo === 'saida_invalida' ||
    veredito.motivo === 'intent_desconhecida'
  ) {
    return { intent: 'fora_de_escopo' };
  }

  // Camada 2 — porta de topicalidade: problema só de PARÂMETRO. A intenção existe
  // e a pergunta é sobre dinheiro; saneia o parâmetro mal-lido e revalida.
  const def = registro.find((i) => i && i.id === saida.intent);
  const limpos = _sanitizarParams(def, saida.params);
  veredito = validarClassificacao({ intent: saida.intent, params: limpos }, registro);
  if (veredito.ok) {
    log('agente_classificador_param_saneado', { intent: saida.intent });
    return {
      intent: veredito.intent,
      params: veredito.params,
      confianca: _normalizarConfianca(saida.confianca),
    };
  }

  return { intent: 'fora_de_escopo' };
}

module.exports = {
  montarPromptClassificacao,
  classificar,
};
