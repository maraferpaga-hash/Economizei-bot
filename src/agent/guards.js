// src/agent/guards.js — ❤️ Guardas de honestidade do Agente de Perguntas (cod-0011)
//
// O CORAÇÃO da feature. Num produto de finanças, um número errado uma vez quebra
// a confiança pra sempre (já mordeu o projeto em 07/06). Estas funções são a
// "defense in depth" do Desenho §5: PURAS, sem I/O, sem chamar o Gemini.
//
// Exporta:
//   validarClassificacao(saida, registro)        → { ok, motivo?, intent?, params? }
//   extrairNumeros(texto)                         → number[]  (valores numéricos do texto)
//   conferirFidelidadeNumerica(textoLLM, permitidos) → { ok, intrusos }
//
// Filosofia de falha SEGURA: em dúvida, REPROVA. Uma reprovação faz o render cair
// no template determinístico (airbag) — resposta certa, só menos fluida. Um número
// inventado escapando pro usuário é catastrófico; um falso-positivo é inofensivo.

'use strict';

const { resolverPeriodo } = require('./periodo.js');

// ─────────────────────────────────────────────────────────────────────────────
// Camada 1 — Vocabulário fechado na classificação.
// Valida a saída do classificador contra o registro de intenções (intents.js).
// O registro é INJETADO (mantém esta função pura e desacoplada do intents.js).
//
// Cada intenção do registro tem o shape:
//   { id, descricao, exemplos, parametros: { <nome>: { tipo, valores?, obrigatorio?, default? } }, ... }
//   tipo ∈ 'enum' (valores fechados) | 'periodo' (resolvido pelo periodo.js) | outro (livre)
//
// Retorno:
//   { ok: true, intent, params }                 — classificação aceita
//   { ok: false, motivo, param? }                — rejeitada (caller faz fallback)
//     motivo ∈ 'saida_invalida' | 'fora_de_escopo' | 'intent_desconhecida'
//            | 'param_desconhecido' | 'param_invalido' | 'param_obrigatorio_ausente'
// ─────────────────────────────────────────────────────────────────────────────
function validarClassificacao(saida, registro) {
  if (!saida || typeof saida !== 'object') {
    return { ok: false, motivo: 'saida_invalida' };
  }

  const intent = saida.intent;
  if (typeof intent !== 'string' || intent.trim() === '') {
    return { ok: false, motivo: 'saida_invalida' };
  }

  // Sentinela legítima de off-topic — não é erro, mas também não é acionável.
  // O orquestrador (cod-0017) trata isto enviando a mensagem de fora de escopo.
  if (intent === 'fora_de_escopo') {
    return { ok: false, motivo: 'fora_de_escopo' };
  }

  const lista = Array.isArray(registro) ? registro : [];
  const def = lista.find((i) => i && i.id === intent);
  if (!def) {
    return { ok: false, motivo: 'intent_desconhecida' };
  }

  const params = saida.params && typeof saida.params === 'object' ? saida.params : {};
  const defParams =
    def.parametros && typeof def.parametros === 'object' ? def.parametros : {};

  // (a) nenhum parâmetro fora do declarado para a intenção.
  for (const chave of Object.keys(params)) {
    if (!Object.prototype.hasOwnProperty.call(defParams, chave)) {
      return { ok: false, motivo: 'param_desconhecido', param: chave };
    }
  }

  // (b) cada parâmetro declarado: presença obrigatória + vocabulário fechado.
  for (const [chave, regra] of Object.entries(defParams)) {
    const valor = params[chave];
    const ausente = valor === undefined || valor === null || valor === '';

    if (ausente) {
      if (regra && regra.obrigatorio) {
        return { ok: false, motivo: 'param_obrigatorio_ausente', param: chave };
      }
      continue; // opcional ausente → ok (executor aplica o default depois)
    }

    if (regra && regra.tipo === 'enum') {
      const valores = Array.isArray(regra.valores) ? regra.valores : [];
      if (!valores.includes(valor)) {
        return { ok: false, motivo: 'param_invalido', param: chave };
      }
    } else if (regra && regra.tipo === 'periodo') {
      // Período NUNCA é uma data que o LLM escreveu — é resolvido pelo nosso
      // parser determinístico. Rótulo que ele não entende → inválido.
      const resolvido = resolverPeriodo(valor);
      if (resolvido && typeof resolvido === 'object' && resolvido.invalido) {
        return { ok: false, motivo: 'param_invalido', param: chave };
      }
    }
    // outros tipos: sem vocabulário fechado definido → aceitos como vieram.
  }

  return { ok: true, intent, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers numéricos (privados)
// ─────────────────────────────────────────────────────────────────────────────

// Converte um token textual de número (BR ou US) para Number, ou null.
// Convenções:
//   "248,30"     → 248.3   (vírgula = decimal, padrão BR)
//   "1.234,56"   → 1234.56 (ponto = milhar, vírgula = decimal)
//   "1.234"      → 1234    (só ponto + 3 dígitos finais = milhar)
//   "12.34"      → 12.34   (só ponto + 1-2 dígitos finais = decimal US, caso o LLM escorregue)
//   "20"         → 20
function _paraNumero(token) {
  let s = String(token).replace(/[^\d.,]/g, '');
  s = s.replace(/[.,]+$/, '').replace(/^[.,]+/, '');
  if (!/\d/.test(s)) return null;

  const temVirgula = s.includes(',');
  const temPonto = s.includes('.');

  if (temVirgula && temPonto) {
    // BR: ponto é milhar, vírgula é decimal.
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (temVirgula) {
    // Só vírgula → decimal.
    s = s.replace(/,/g, '.');
  } else if (temPonto) {
    // Só ponto → milhar OU decimal (heurística). O brl() do projeto produz
    // decimais com VÍRGULA, então um ponto sozinho nas nossas strings é sempre
    // milhar; tokens do LLM seguem a mesma convenção na esmagadora maioria.
    const partes = s.split('.');
    const ultima = partes[partes.length - 1];
    if (partes.length > 2 || ultima.length === 3) {
      s = partes.join(''); // milhar: 1.234 / 1.234.567 / 100.000
    }
    // senão: decimal US (12.34) — deixa como está
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Chave canônica pra comparar valores sem sofrer com float / zeros à direita.
// Trabalha em "centavos": 248.30 e 248.3 → 24830 (mesmo valor).
function _chave(n) {
  if (n == null || !Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// extrairNumeros(texto) → number[]
// Extrai TODO token numérico/monetário do texto (Desenho §5, Camada 5).
// Pega "R$ 248,30", "1.234,56", "20%", "20" — devolve só os valores numéricos.
// ─────────────────────────────────────────────────────────────────────────────
function extrairNumeros(texto) {
  if (texto == null) return [];
  const s = String(texto);
  // Sequências que começam por dígito e seguem com dígitos/ponto/vírgula.
  const matches = s.match(/\d[\d.,]*/g) || [];
  const nums = [];
  for (const m of matches) {
    const n = _paraNumero(m);
    if (n != null) nums.push(n);
  }
  return nums;
}

// ─────────────────────────────────────────────────────────────────────────────
// Camada 5 — Firewall de fidelidade numérica.
// conferirFidelidadeNumerica(textoLLM, permitidos) → { ok, intrusos }
//
// `permitidos` é a allowlist do que o nosso código entregou ao LLM: pode ser um
// array (ou valor único) de strings JÁ FORMATADAS ("R$ 248,30") e/ou Numbers.
// Extrai cada número da resposta do LLM e confere se está na allowlist.
//   - todos batem  → { ok: true,  intrusos: [] }
//   - algum sobra  → { ok: false, intrusos: [<valores não autorizados>] }
//
// Quem reprova, o render descarta a narração e usa o template (airbag).
// ─────────────────────────────────────────────────────────────────────────────
function conferirFidelidadeNumerica(textoLLM, permitidos) {
  const arr = Array.isArray(permitidos) ? permitidos : [permitidos];

  const autorizados = new Set();
  for (const p of arr) {
    if (p == null) continue;
    if (typeof p === 'number') {
      const k = _chave(p);
      if (k != null) autorizados.add(k);
    } else {
      // String formatada (ou qualquer texto): pega todos os números que contém.
      for (const n of extrairNumeros(String(p))) {
        const k = _chave(n);
        if (k != null) autorizados.add(k);
      }
    }
  }

  const usados = extrairNumeros(textoLLM);
  const intrusos = [];
  for (const n of usados) {
    const k = _chave(n);
    if (!autorizados.has(k)) intrusos.push(n);
  }

  return { ok: intrusos.length === 0, intrusos };
}

module.exports = {
  validarClassificacao,
  extrairNumeros,
  conferirFidelidadeNumerica,
};
