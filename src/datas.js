// src/datas.js — interpretação de DATA CRUA de recibo/cupom → ISO (AAAA-MM-DD).
//
// Por que este módulo existe (cod-0065a): o corpus real de Vancouver trouxe
// QUATRO formatos de data no mesmo país, e um deles é uma armadilha silenciosa:
// o No Frills imprime "26/07/29", que é AA/MM/DD (2026-07-29). Lido como
// DD/MM/AA vira 2029 — um cupom no futuro, que envenena média, histórico e
// alerta sem levantar nenhum erro.
//
// Princípio que rege o módulo (CODE_GUIDE §0.4 — saída segura > erro confiante):
// quando a string comporta MAIS DE UMA leitura plausível com resultados
// diferentes, este módulo devolve `null` + motivo. Ele nunca escolhe no chute.
// Data errada que parece certa é pior do que data ausente.
//
// Módulo PURO: sem I/O, sem require de nada, sem `toLocaleString` (não depende
// do ICU nem do locale do runtime). A única concessão está documentada em
// `interpretarData`: o desempate de ano com 2 dígitos precisa de uma referência
// temporal — passe `opts.hoje` para determinismo total (os testes sempre passam).

'use strict';

// Janela de plausibilidade: recibo é do passado recente, nunca do futuro.
const ANOS_PARA_TRAS = 10;
const DIAS_TOLERANCIA_FUTURO = 1; // fuso horário (Vancouver × servidor)

// Meses por abreviação de 3 letras — inglês e português colidem sem conflito
// (MAR/MAI-MAY/ABR-APR/AGO-AUG/SET-SEP/OUT-OCT/DEZ-DEC apontam pro mesmo mês).
const MESES = {
  JAN: 1, FEV: 2, FEB: 2, MAR: 3, ABR: 4, APR: 4, MAI: 5, MAY: 5,
  JUN: 6, JUL: 7, AGO: 8, AUG: 8, SET: 9, SEP: 9, OUT: 10, OCT: 10,
  NOV: 11, DEZ: 12, DEC: 12,
};

// Arranjos numéricos aceitos por origem. É a origem que decide — NÃO a
// estatística — porque no Brasil "05/07/26" é 5 de julho e ponto final: abrir
// leituras alternativas aqui quebraria todo cupom brasileiro já em produção.
//   DMA = dia/mês/ano · MDA = mês/dia/ano · AMD = ano/mês/dia
const ARRANJOS_ANO_CURTO = {
  BR: ['DMA'],
  CA: ['AMD', 'MDA', 'DMA'], // comprovado pelo corpus: os 3 convivem no mesmo país
  US: ['MDA', 'AMD'],
};
const ARRANJOS_ANO_LONGO = {
  BR: ['DMA'],
  CA: ['MDA', 'DMA'],
  US: ['MDA'],
};

const NOME_DO_ARRANJO = {
  DMA: { curto: 'DD/MM/AA', longo: 'DD/MM/AAAA' },
  MDA: { curto: 'MM/DD/AA', longo: 'MM/DD/AAAA' },
  AMD: { curto: 'AA/MM/DD', longo: 'AAAA/MM/DD' },
};

function _falha(motivo, extra = {}) {
  return { iso: null, formato: null, motivo, ...extra };
}

function _ok(iso, formato) {
  return { iso, formato, motivo: null };
}

function _pad(n) {
  return String(n).padStart(2, '0');
}

function _iso(ano, mes, dia) {
  return `${ano}-${_pad(mes)}-${_pad(dia)}`;
}

// Valida no calendário de verdade (mata 31/02, 31/04 etc. via round-trip UTC).
function _dataReal(ano, mes, dia) {
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) return false;
  if (ano < 1000 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
  );
}

function _janela(hoje) {
  const ref = hoje instanceof Date && !Number.isNaN(hoje.getTime()) ? hoje : new Date();
  const a = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const d = ref.getUTCDate();
  return {
    min: Date.UTC(a - ANOS_PARA_TRAS, m, d),
    max: Date.UTC(a, m, d + DIAS_TOLERANCIA_FUTURO),
  };
}

function _plausivel(ano, mes, dia, janela) {
  const t = Date.UTC(ano, mes - 1, dia);
  return t >= janela.min && t <= janela.max;
}

// Ano de 2 dígitos: tenta os dois séculos e devolve os que caem na janela.
// Sem pivô mágico ("< 50 é 20xx") — o pivô é a própria janela de plausibilidade.
function _anosPossiveis(aa) {
  return [2000 + aa, 1900 + aa];
}

function _mesPorNome(txt) {
  const chave = txt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 3);
  return MESES[chave] ?? null;
}

// Monta os candidatos de um trio numérico segundo o arranjo pedido.
function _candidatosNumericos(campos, arranjos, anoCurto, janela) {
  const [x, y, z] = campos;
  const achados = [];
  for (const arranjo of arranjos) {
    let dia;
    let mes;
    let anos;
    if (arranjo === 'DMA') {
      dia = x; mes = y; anos = anoCurto ? _anosPossiveis(z) : [z];
    } else if (arranjo === 'MDA') {
      mes = x; dia = y; anos = anoCurto ? _anosPossiveis(z) : [z];
    } else {
      anos = anoCurto ? _anosPossiveis(x) : [x]; mes = y; dia = z;
    }
    for (const ano of anos) {
      if (!_dataReal(ano, mes, dia)) continue;
      if (!_plausivel(ano, mes, dia, janela)) continue;
      achados.push({
        iso: _iso(ano, mes, dia),
        formato: NOME_DO_ARRANJO[arranjo][anoCurto ? 'curto' : 'longo'],
      });
    }
  }
  return achados;
}

// Decide entre os candidatos sobreviventes. Empate com ISOs iguais não é
// ambiguidade (duas leituras, mesma data) — empate com ISOs diferentes é, e aí
// ninguém ganha.
function _decidir(candidatos, contexto) {
  if (candidatos.length === 0) return _falha('sem_leitura_plausivel', contexto);
  const distintos = [...new Set(candidatos.map((c) => c.iso))];
  if (distintos.length > 1) {
    return _falha('ambiguo', { ...contexto, candidatos: distintos.sort() });
  }
  return _ok(candidatos[0].iso, candidatos[0].formato);
}

/**
 * Interpreta uma data crua de recibo.
 *
 * @param {string} bruta  texto como impresso no recibo ("26/07/29", "Jul 29, 2026", …)
 * @param {object} [opts]
 * @param {'BR'|'CA'|'US'} [opts.origem='BR']  de qual país é o recibo. Governa
 *        SÓ os formatos puramente numéricos; formato com mês por extenso e ISO
 *        são iguais em qualquer origem.
 * @param {Date} [opts.hoje]  referência temporal para a janela de plausibilidade.
 *        Omitido, usa `new Date()` — a única fonte de não-determinismo do módulo.
 *        Passe sempre que quiser resultado reprodutível (todos os testes passam).
 * @returns {{iso: string|null, formato: string|null, motivo: string|null, candidatos?: string[]}}
 */
function interpretarData(bruta, opts = {}) {
  const { origem = 'BR', hoje = null } = opts;

  if (typeof bruta !== 'string') return _falha('entrada_nao_texto');
  const cru = bruta.trim();
  if (!cru) return _falha('entrada_vazia');

  const janela = _janela(hoje);
  const arranjosCurto = ARRANJOS_ANO_CURTO[origem] || ARRANJOS_ANO_CURTO.BR;
  const arranjosLongo = ARRANJOS_ANO_LONGO[origem] || ARRANJOS_ANO_LONGO.BR;

  // Normalização: caixa alta, vírgula/ponto de abreviação viram espaço,
  // espaços colapsados. Separadores originais são preservados no `cru` para os
  // padrões numéricos, que os tratam explicitamente.
  const s = cru.toUpperCase().replace(/\s+/g, ' ');

  // ── 1) ISO AAAA-MM-DD — 4 dígitos na frente não competem com nada ──────────
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (m) {
    const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (!_dataReal(ano, mes, dia)) return _falha('data_invalida');
    // Achado da auto-revisão: ISO bem-formado NÃO é passe livre. "2029-07-26"
    // é sintaticamente perfeito e mesmo assim é um recibo do futuro.
    if (!_plausivel(ano, mes, dia, janela)) return _falha('sem_leitura_plausivel');
    return _ok(_iso(ano, mes, dia), 'AAAA-MM-DD');
  }

  // Para os formatos com mês por extenso, todo separador vira espaço.
  const t = s.replace(/[-/.,]/g, ' ').replace(/\s+/g, ' ').trim();

  // ── 2) MES DD AAAA  ("Jul 29, 2026" · "JULHO 29 2026") ────────────────────
  m = /^([A-Z\u00C0-\u00DD]{3,9}) (\d{1,2}) (\d{2,4})$/.exec(t);
  if (m) {
    const mes = _mesPorNome(m[1]);
    if (mes === null) return _falha('mes_desconhecido');
    const dia = Number(m[2]);
    const bruto = Number(m[3]);
    const anos = m[3].length <= 2 ? _anosPossiveis(bruto) : [bruto];
    const cand = anos
      .filter((ano) => _dataReal(ano, mes, dia) && _plausivel(ano, mes, dia, janela))
      .map((ano) => ({ iso: _iso(ano, mes, dia), formato: 'MES DD, AAAA' }));
    if (cand.length === 0 && anos.some((ano) => !_dataReal(ano, mes, dia))) {
      return _falha('data_invalida');
    }
    return _decidir(cand, {});
  }

  // ── 3) DD MES AA(AA)  ("27-JUL-26" · "29 JUL 2026") ───────────────────────
  m = /^(\d{1,2}) ([A-Z\u00C0-\u00DD]{3,9}) (\d{2,4})$/.exec(t);
  if (m) {
    const mes = _mesPorNome(m[2]);
    if (mes === null) return _falha('mes_desconhecido');
    const dia = Number(m[1]);
    const bruto = Number(m[3]);
    const anos = m[3].length <= 2 ? _anosPossiveis(bruto) : [bruto];
    const cand = anos
      .filter((ano) => _dataReal(ano, mes, dia) && _plausivel(ano, mes, dia, janela))
      .map((ano) => ({ iso: _iso(ano, mes, dia), formato: 'DD-MES-AA' }));
    if (cand.length === 0 && anos.some((ano) => !_dataReal(ano, mes, dia))) {
      return _falha('data_invalida');
    }
    return _decidir(cand, {});
  }

  // ── 4) NN/NN/AAAA — ano de 4 dígitos no fim (pt-BR clássico) ──────────────
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s);
  if (m) {
    const campos = [Number(m[1]), Number(m[2]), Number(m[3])];
    const cand = _candidatosNumericos(campos, arranjosLongo, false, janela);
    // Origem BR tem arranjo único: distinguir "não existe no calendário" de
    // "existe mas está fora da janela" ajuda quem for depurar cupom antigo.
    if (cand.length === 0 && arranjosLongo.length === 1) {
      const [x, y, z] = campos;
      return _falha(_dataReal(z, y, x) ? 'fora_da_janela' : 'data_invalida');
    }
    return _decidir(cand, {});
  }

  // ── 5) NN/NN/NN — ano de 2 dígitos: o caso genuinamente ambíguo ────────────
  m = /^(\d{2})[-/.](\d{2})[-/.](\d{2})$/.exec(s);
  if (m) {
    const campos = [Number(m[1]), Number(m[2]), Number(m[3])];
    const cand = _candidatosNumericos(campos, arranjosCurto, true, janela);
    return _decidir(cand, {});
  }

  return _falha('formato_desconhecido');
}

/**
 * Açúcar para quem só quer a string: devolve o ISO ou `null`.
 * O motivo da recusa se perde — use `interpretarData` quando for logar.
 */
function dataParaISO(bruta, opts = {}) {
  return interpretarData(bruta, opts).iso;
}

module.exports = {
  interpretarData,
  dataParaISO,
  MESES: Object.freeze({ ...MESES }),
  ANOS_PARA_TRAS,
};
