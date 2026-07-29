// ---------------------------------------------------------------
// insights.js — funções PURAS de análise (sem I/O).
//
// Transformam o dado cru do Supabase em CONCLUSÕES sobre o gasto do
// usuário (Camadas 2 e 3 do norte estratégico). Recebem dados já buscados
// e devolvem objetos prontos pro formatter montar a mensagem.
//
// Decisão 2026-06-18: separar a inteligência (aqui) do acesso a dados
// (supabase.js) e dos templates (formatter.js) — CODE_GUIDE "um arquivo
// por responsabilidade". Alimenta:
//   F2 — analisarRaioXCategorias  (evolução do /gastos)
//   F1 — analisarInflacaoPessoal  (/inflacao)
//   F4 — calcularEconomia         (/economia + resumo mensal)
// ---------------------------------------------------------------

// Categorias discricionárias — candidatas naturais a "aliviar sem doer".
// Reutilizável por F3 no futuro. Conservador de propósito (honestidade):
// só o que é claramente supérfluo entra.
const CATEGORIAS_SUPERFLUAS = ['doces', 'bebidas'];

// As 10 categorias de item válidas — espelho de gemini.js (CATEGORIAS_VALIDAS).
// Mantido aqui pra a lógica pura de acompanhamento (cod-0033) decidir se um alvo
// é uma categoria ou uma palavra-chave livre SEM acoplar ao módulo de
// classificação. Se a lista mudar em gemini.js, atualizar aqui também.
const CATEGORIAS_VALIDAS = [
  'carnes', 'hortifruti', 'laticinios', 'padaria', 'bebidas',
  'limpeza', 'mercearia', 'congelados', 'doces', 'outros',
];

// Fatias que não são gasto de categoria real — não viram conclusão nem corte.
const CATEGORIAS_NAO_ACIONAVEIS = ['nao_identificado', 'nao_mercado'];

// Diferença de YYYY-MM-DD em dias (positiva se b > a). 0 se inválido.
function _diasEntre(aIso, bIso) {
  const a = new Date(`${aIso}T00:00:00Z`).getTime();
  const b = new Date(`${bIso}T00:00:00Z`).getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

function _round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// ---------------------------------------------------------------
// F2 — Raio-X de categoria com conclusão.
//   atual:     [{ categoria, total }]  (mesmo array que o /gastos exibe)
//   historico: { mesesComDados, porCategoria: { [cat]: { mediaPct, mediaValor } } }
// Devolve a maior categoria do mês, se está acima/abaixo da média histórica
// do próprio usuário, e (se houver) um candidato discricionário a corte.
// ---------------------------------------------------------------
function analisarRaioXCategorias(atual, historico) {
  if (!Array.isArray(atual) || atual.length === 0) return { temConclusao: false };

  const totalAtual = atual.reduce((s, d) => s + (Number(d.total) || 0), 0);
  if (totalAtual <= 0) return { temConclusao: false };

  const acionaveis = atual.filter((d) => !CATEGORIAS_NAO_ACIONAVEIS.includes(d.categoria));
  if (acionaveis.length === 0) return { temConclusao: false };

  const top = acionaveis.slice().sort((a, b) => b.total - a.total)[0];
  const pctAtual = (top.total / totalAtual) * 100;

  const temHist = !!(historico && historico.mesesComDados > 0);
  let comparativo = null;
  let deltaPp = null;
  let mediaPctHist = null;

  if (temHist && historico.porCategoria && historico.porCategoria[top.categoria]) {
    mediaPctHist = historico.porCategoria[top.categoria].mediaPct; // 0–100
    deltaPp = Math.round(pctAtual - mediaPctHist);
    if (deltaPp >= 5) comparativo = 'acima';
    else if (deltaPp <= -5) comparativo = 'abaixo';
    else comparativo = 'em_linha';
  }

  // Candidato a corte: a maior categoria supérflua que pese ≥10% do mês.
  let candidatoCorte = null;
  const superfluas = acionaveis
    .filter((d) => CATEGORIAS_SUPERFLUAS.includes(d.categoria))
    .sort((a, b) => b.total - a.total);
  if (superfluas.length > 0 && superfluas[0].total / totalAtual >= 0.10) {
    const c = superfluas[0];
    candidatoCorte = {
      categoria: c.categoria,
      valor: _round2(c.total),
      pct: Math.round((c.total / totalAtual) * 100),
    };
  }

  return {
    temConclusao: true,
    top: { categoria: top.categoria, valor: _round2(top.total), pct: Math.round(pctAtual) },
    comparativo,            // 'acima' | 'abaixo' | 'em_linha' | null
    deltaPp,
    mediaPctHist: mediaPctHist != null ? Math.round(mediaPctHist) : null,
    ehSuperflua: CATEGORIAS_SUPERFLUAS.includes(top.categoria),
    candidatoCorte,
    mesesHistorico: temHist ? historico.mesesComDados : 0,
  };
}

// ---------------------------------------------------------------
// F1 — Inflação pessoal por item.
//   itens: [{ nomeCanonico, categoria, observacoes: [{ data, preco }] }]
//          (preco = preço unitário já normalizado pela query)
// Compara o preço mais antigo com o mais recente de cada item recorrente.
// Filtra ruído: exige 2+ observações, intervalo mínimo e variação relevante;
// descarta variações absurdas (provável erro de unidade) pela honestidade.
// ---------------------------------------------------------------
function analisarInflacaoPessoal(itens, opts = {}) {
  const {
    limiarPct = 8,        // só reporta variação >= 8%
    minDias = 14,         // evita ruído de compras na mesma semana
    maxVariacao = 150,    // acima disso é provável erro de unidade/leitura
  } = opts;

  const movimentos = [];

  for (const it of (itens || [])) {
    const obs = (it.observacoes || [])
      .filter((o) => Number(o.preco) > 0 && o.data)
      .sort((a, b) => (a.data < b.data ? -1 : 1));
    if (obs.length < 2) continue;

    const primeira = obs[0];
    const ultima = obs[obs.length - 1];
    if (primeira.data === ultima.data) continue;
    if (_diasEntre(primeira.data, ultima.data) < minDias) continue;

    const antigo = Number(primeira.preco);
    const novo = Number(ultima.preco);
    if (antigo <= 0) continue;

    const variacaoPct = ((novo - antigo) / antigo) * 100;
    if (Math.abs(variacaoPct) < limiarPct) continue;
    if (Math.abs(variacaoPct) > maxVariacao) continue;

    movimentos.push({
      nome: it.nomeCanonico,
      categoria: it.categoria || 'outros',
      precoAntigo: _round2(antigo),
      precoNovo: _round2(novo),
      variacaoPct: Math.round(variacaoPct),
      dataAntiga: primeira.data,
      dataNova: ultima.data,
      nObs: obs.length,
    });
  }

  const subiram = movimentos.filter((m) => m.variacaoPct > 0).sort((a, b) => b.variacaoPct - a.variacaoPct);
  const cairam = movimentos.filter((m) => m.variacaoPct < 0).sort((a, b) => a.variacaoPct - b.variacaoPct);

  return {
    temDados: movimentos.length > 0,
    subiram,
    cairam,
    totalComparados: Array.isArray(itens) ? itens.length : 0,
  };
}

// ---------------------------------------------------------------
// F4 — Quanto você já economizou.
//   totaisMensais: [{ mes: 'YYYY-MM', total, qtdCompras }]  (compras de mercado)
//   opts.mesAlvo:  mês de referência (default = mês mais recente da série)
//   opts.nMesesMedia: janela da média móvel de base (default 3)
//
// economiaMes  = média dos meses anteriores − total do mês de referência (com sinal).
// economiaAno  = soma, nos meses do ano de referência em que o gasto ficou ABAIXO
//                da média móvel anterior, da diferença (só meses positivos).
//                Copy correspondente: "somando os meses em que você gastou abaixo
//                da média" — afirmação honesta do que esse número representa.
// ---------------------------------------------------------------
function calcularEconomia(totaisMensais, opts = {}) {
  const { nMesesMedia = 3, mesAlvo = null } = opts;
  if (!Array.isArray(totaisMensais) || totaisMensais.length === 0) return { temDados: false };

  const ordenado = totaisMensais
    .filter((m) => m && m.mes)
    .slice()
    .sort((a, b) => (a.mes < b.mes ? -1 : 1));

  let serie = ordenado;
  if (mesAlvo) {
    const idx = ordenado.findIndex((m) => m.mes === mesAlvo);
    if (idx === -1) return { temDados: false };
    serie = ordenado.slice(0, idx + 1);
  }
  if (serie.length < 2) return { temDados: false };

  const ref = serie[serie.length - 1];
  const janela = serie.slice(0, -1).slice(-nMesesMedia);
  const mediaRef = janela.reduce((s, m) => s + (Number(m.total) || 0), 0) / janela.length;
  const economiaMes = mediaRef - (Number(ref.total) || 0);

  const anoRef = ref.mes.slice(0, 4);
  let economiaAno = 0;
  for (let i = 0; i < serie.length; i++) {
    const m = serie[i];
    if (m.mes.slice(0, 4) !== anoRef) continue;
    const prev = serie.slice(0, i);
    if (prev.length === 0) continue;
    const jp = prev.slice(-nMesesMedia);
    const base = jp.reduce((s, x) => s + (Number(x.total) || 0), 0) / jp.length;
    const eco = base - (Number(m.total) || 0);
    if (eco > 0) economiaAno += eco;
  }

  return {
    temDados: true,
    mediaRef: _round2(mediaRef),
    totalMesRef: _round2(ref.total),
    economiaMes: _round2(economiaMes),
    economiaAno: _round2(economiaAno),
    mesRef: ref.mes,
    mesesConsiderados: serie.length,
  };
}

// ---------------------------------------------------------------
// F3 — Onde cortar sem doer.
//   dadosMes:  [{ categoria, total }]  (gastos do mês — mesmo formato de /gastos)
//   historico: { mesesComDados, porCategoria: { [cat]: { mediaPct, mediaValor } } }
//              (mesmo formato de buscarHistoricoCategorias — pode ser null)
//   opts.limiarPct: % mínimo do total do mês pra ser candidato a corte (default 5)
//
// Identifica categorias discricionárias (CATEGORIAS_SUPERFLUAS) com peso
// relevante no mês e, quando há histórico, informa se o gasto atual está
// acima da própria média do usuário. Nunca inventa número: todos os valores
// vêm dos dados reais. Retorna até 2 sugestões ordenadas por força do sinal.
// ---------------------------------------------------------------
function analisarOndeCortar(dadosMes, historico, opts = {}) {
  const { limiarPct = 5 } = opts;

  if (!Array.isArray(dadosMes) || dadosMes.length === 0) return { temSugestao: false };

  const totalMes = dadosMes.reduce((s, d) => s + (Number(d.total) || 0), 0);
  if (totalMes <= 0) return { temSugestao: false };

  const temHist = !!(historico && historico.mesesComDados > 0);

  const candidatos = [];
  for (const d of dadosMes) {
    if (!CATEGORIAS_SUPERFLUAS.includes(d.categoria)) continue;
    const valor = Number(d.total) || 0;
    const pct = (valor / totalMes) * 100;
    if (pct < limiarPct) continue;

    let acimaDaMedia = null;
    let mediaValorHist = null;
    if (temHist && historico.porCategoria && historico.porCategoria[d.categoria]) {
      mediaValorHist = _round2(historico.porCategoria[d.categoria].mediaValor);
      if (mediaValorHist > 0) {
        // Considera "acima" quando o gasto atual supera a média histórica em >10%
        acimaDaMedia = valor > mediaValorHist * 1.10;
      }
    }

    candidatos.push({
      categoria: d.categoria,
      valor: _round2(valor),
      pct: Math.round(pct),
      acimaDaMedia,   // true | false | null (null = sem histórico)
      mediaValorHist, // valor médio histórico, ou null
    });
  }

  if (candidatos.length === 0) return { temSugestao: false };

  // Prioridade: acima da média primeiro (sinal mais forte), depois por valor absoluto
  candidatos.sort((a, b) => {
    if (a.acimaDaMedia === true && b.acimaDaMedia !== true) return -1;
    if (b.acimaDaMedia === true && a.acimaDaMedia !== true) return 1;
    return b.valor - a.valor;
  });

  return {
    temSugestao: true,
    totalMes: _round2(totalMes),
    sugestoes: candidatos.slice(0, 2),
    mesesHistorico: temHist ? historico.mesesComDados : 0,
  };
}

// ---------------------------------------------------------------
// Alerta Inteligente Pro — engine de MATCHING (cod-0030, Desenho §6).
//
// Núcleo do Pilar B (acompanhamento personalizável): casar um item de cupom
// com um "alvo" que a pessoa escolheu vigiar — uma categoria OU uma
// palavra-chave livre (ex.: 'cerveja', 'ração', 'chocolate'). Tudo PURO, sem
// I/O, 100% testável. A leitura de itens/acompanhamentos (supabase.js) e os
// comandos/copy vêm em tarefas separadas (cod-0031..0035).
//
// Princípio (CLAUDE.md / CODE_GUIDE §0 — "classificação é o coração"): buscar
// "cerveja" só acerta se o nome_canonico contiver "cerveja". O matching é
// trivial de propósito; quem decide o acerto é a classificação. Honestidade:
// nada casa → total 0, NUNCA um número chutado.
// ---------------------------------------------------------------

// Remove diacríticos sem tabela ASCII (mesma técnica do gemini.js): 'ç','ã',
// 'é' → 'c','a','e'. Faixa U+0300–U+036F = sinais combinantes (pós-NFD).
const _DIACRITICOS = new RegExp(
  '[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']',
  'g'
);

// lowercase + sem acento + espaços colapsados. Base do matching textual.
function _norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(_DIACRITICOS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Escapa metacaracteres pra usar um termo do usuário dentro de RegExp.
function _escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Valor monetário de uma linha de item, tolerante a formatos:
// preco_total (preferido) → preco × quantidade → preco. Mesma intenção do
// buscarGastosPorCategoria (agrega por preco_total, fallback preco×qtd).
function _valorItem(it) {
  if (!it) return 0;
  const pt = Number(it.preco_total ?? it.precoTotal);
  if (Number.isFinite(pt) && pt > 0) return pt;
  const preco = Number(it.preco) || 0;
  const qtd = Number(it.quantidade) || 1;
  return preco > 0 ? preco * qtd : 0;
}

// Casa um termo como PALAVRA INTEIRA (não substring solta) sobre o texto
// normalizado. Evita 'uva' casar 'luva' e 'cafe' casar 'descafeinado'. Guarda
// de comprimento mínimo (≥3) contra fragmentos curtos demais.
function _casaTermo(base, termo) {
  const t = _norm(termo);
  if (t.length < 3) return false;
  const b = _norm(base);
  if (!b) return false;
  return new RegExp('\\b' + _escaparRegex(t) + '\\b').test(b);
}

// casarItemComAlvo(item, alvo) → boolean
//   alvo = { tipo: 'categoria' | 'termo', valor: string }
//   - 'categoria': igualdade exata da categoria do item.
//   - 'termo': palavra inteira sobre norm(nome_canonico) || norm(nome).
function casarItemComAlvo(item, alvo) {
  if (!item || !alvo || !alvo.tipo) return false;

  if (alvo.tipo === 'categoria') {
    const alvoNorm = _norm(alvo.valor);
    return alvoNorm !== '' && _norm(item.categoria) === alvoNorm;
  }

  if (alvo.tipo === 'termo') {
    const canonico = item.nome_canonico ?? item.nomeCanonico;
    const base = (canonico && String(canonico).trim()) ? canonico : item.nome;
    return _casaTermo(base, alvo.valor);
  }

  return false;
}

// buscarGastoPorAlvo(itensDoMes, alvo) → { total, qtdCompras, itensCasados }
// Soma o preco_total dos itens que casam com o alvo. qtdCompras = nº de
// compras distintas (por compra_id) entre os itens casados; se os itens não
// trouxerem compra_id, cai pro nº de itens casados como proxy. Nada casa →
// total 0 (sem chutar número).
function buscarGastoPorAlvo(itensDoMes, alvo) {
  const itens = Array.isArray(itensDoMes) ? itensDoMes : [];
  const itensCasados = itens.filter((it) => casarItemComAlvo(it, alvo));
  const total = itensCasados.reduce((s, it) => s + _valorItem(it), 0);

  const compras = new Set();
  let temCompraId = false;
  for (const it of itensCasados) {
    const cid = it.compra_id ?? it.compraId;
    if (cid != null) { compras.add(cid); temCompraId = true; }
  }
  const qtdCompras = temCompraId ? compras.size : itensCasados.length;

  return { total: _round2(total), qtdCompras, itensCasados };
}

// buscarGastoSuperfluo(gastosPorCategoria, categoriasSuperfluas) →
//   { totalSuperfluo, pctDoMes, porCategoria: [{ categoria, valor, pct }] }
//   gastosPorCategoria: [{ categoria, total }]  (mesmo array do /gastos)
//   categoriasSuperfluas: lista de categorias que contam como supérfluo.
//     null/undefined/não-array → usa o baseline ['doces','bebidas'].
//     array (mesmo vazio) → usado como veio (permite zerar o supérfluo).
function buscarGastoSuperfluo(gastosPorCategoria, categoriasSuperfluas) {
  const dados = Array.isArray(gastosPorCategoria) ? gastosPorCategoria : [];
  const totalMes = dados.reduce((s, d) => s + (Number(d.total) || 0), 0);

  const lista = Array.isArray(categoriasSuperfluas) ? categoriasSuperfluas : CATEGORIAS_SUPERFLUAS;
  const setSup = new Set(lista.map((c) => _norm(c)).filter(Boolean));

  const porCategoria = dados
    .filter((d) => setSup.has(_norm(d.categoria)) && (Number(d.total) || 0) > 0)
    .map((d) => ({
      categoria: d.categoria,
      valor: _round2(d.total),
      pct: totalMes > 0 ? Math.round(((Number(d.total) || 0) / totalMes) * 100) : 0,
    }))
    .sort((a, b) => b.valor - a.valor);

  const totalSuperfluo = porCategoria.reduce((s, d) => s + d.valor, 0);

  return {
    totalSuperfluo: _round2(totalSuperfluo),
    pctDoMes: totalMes > 0 ? Math.round((totalSuperfluo / totalMes) * 100) : 0,
    porCategoria,
  };
}

// ---------------------------------------------------------------
// Acompanhamentos personalizáveis (cod-0033) — parsing PURO dos comandos.
// A I/O (salvar/ler/desativar) vive no supabase.js (cod-0031); aqui só a
// interpretação do texto que o usuário digitou. Sem gate Pro (passo humano).
// ---------------------------------------------------------------

// Interpreta o argumento de "/acompanhar <termo|categoria>" num alvo pronto pra
// gravar. Decide o tipo pelo próprio texto: casou uma das 10 categorias →
// 'categoria'; senão → 'termo' (palavra-chave livre). A guarda de comprimento
// (≥3 após normalizar) espelha o matching (_casaTermo): termo curto demais nunca
// casaria item nenhum, então recusa na criação em vez de criar um vigia morto.
//   ok    → { ok:true, tipo_alvo, alvo, rotulo }
//   vazio → { ok:false, motivo:'vazio' }   (sem argumento)
//   curto → { ok:false, motivo:'curto' }   (< 3 caracteres úteis)
function interpretarAcompanhamento(argumento) {
  const bruto = String(argumento == null ? '' : argumento).trim();
  if (!bruto) return { ok: false, motivo: 'vazio' };

  // Rótulo de exibição: minúsculas + espaços colapsados, acentos preservados.
  const rotulo = bruto.toLowerCase().replace(/\s+/g, ' ').trim();
  const alvoNorm = _norm(rotulo);
  if (alvoNorm.replace(/[^a-z0-9]/g, '').length < 3) return { ok: false, motivo: 'curto' };

  const tipo_alvo = CATEGORIAS_VALIDAS.includes(alvoNorm) ? 'categoria' : 'termo';
  // Categoria grava normalizada (casa com item.categoria); termo grava como exibido.
  const alvo = tipo_alvo === 'categoria' ? alvoNorm : rotulo;
  return { ok: true, tipo_alvo, alvo, rotulo };
}

// Interpreta "/superfluo <categoria> [on|off]" contra a config atual do usuário.
// Sem 2º termo → alterna (toggle). 'on/sim/incluir' liga; 'off/nao/remover/tirar'
// desliga. Sem categoria → lista a config atual. Categoria fora das 10 válidas →
// { ok:false }. Devolve o novo array pronto pra gravar (setCategoriasSuperfluas).
//   listar → { ok:true, acao:'listar', categorias }
//   ok     → { ok:true, acao:'add'|'remove', categoria, categorias }
//   inválida → { ok:false, motivo:'categoria_invalida', categoria }
function interpretarSuperfluo(argumento, categoriasAtuais) {
  const atual = (Array.isArray(categoriasAtuais) ? categoriasAtuais : [])
    .map((c) => _norm(c))
    .filter(Boolean);
  const partes = String(argumento == null ? '' : argumento)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return { ok: true, acao: 'listar', categorias: [...new Set(atual)] };
  }

  const categoria = _norm(partes[0]);
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return { ok: false, motivo: 'categoria_invalida', categoria: partes[0] };
  }

  const flag = _norm(partes[1] || '');
  const set = new Set(atual);
  let acao;
  if (flag === 'on' || flag === 'sim' || flag === 'incluir') {
    set.add(categoria);
    acao = 'add';
  } else if (flag === 'off' || flag === 'nao' || flag === 'remover' || flag === 'tirar') {
    set.delete(categoria);
    acao = 'remove';
  } else if (set.has(categoria)) { // toggle: já estava → remove
    set.delete(categoria);
    acao = 'remove';
  } else { // toggle: não estava → adiciona
    set.add(categoria);
    acao = 'add';
  }

  return { ok: true, acao, categoria, categorias: [...set] };
}

// ---------------------------------------------------------------
// Alerta proativo de limite (cod-0035) — lógica PURA.
// Fecha a cadeia do Alerta Inteligente Pro: o usuário define um teto mensal
// para um alvo que já acompanha (/teto) e o bot avisa quando o gasto do mês
// naquele alvo atinge esse teto. O número nasce SEMPRE aqui (buscarGastoPorAlvo
// sobre os itens reais do mês), nunca no LLM.
// ---------------------------------------------------------------

// Teto mínimo/máximo aceitos — guardas de sanidade contra digitação errada
// (R$ 0,50 nunca é um teto de verdade; R$ 1 milhão é dedo escorregado).
const TETO_MIN = 1;
const TETO_MAX = 1000000;

// Converte o texto de um valor em reais para número. Aceita os formatos que a
// pessoa realmente digita no WhatsApp: "100", "100,50", "R$ 100", "1.234,50",
// "1234.50". Regra: se tem vírgula, ela é o separador decimal e o ponto é de
// milhar; se só tem ponto, ele é decimal quando NÃO separa um grupo de 3
// dígitos ("100.50" → 100.5) e de milhar quando separa ("1.234" → 1234).
// Não interpretável → null (nunca chuta número).
function _valorEmReais(texto) {
  const bruto = String(texto == null ? '' : texto)
    .toLowerCase()
    .replace(/r\$/g, '')
    .replace(/\s/g, '')
    .trim();
  if (!bruto || !/^[0-9.,]+$/.test(bruto)) return null;

  let limpo;
  if (bruto.includes(',')) {
    limpo = bruto.replace(/\./g, '').replace(',', '.');
  } else if (bruto.includes('.')) {
    const depois = bruto.slice(bruto.lastIndexOf('.') + 1);
    limpo = depois.length === 3 ? bruto.replace(/\./g, '') : bruto;
  } else {
    limpo = bruto;
  }

  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

// Mês ('YYYY-MM') de um valor de data vindo do banco (string 'YYYY-MM-DD' ou
// Date). Qualquer outra coisa → null (trata como "nunca alertado").
function _mesDe(valor) {
  if (!valor) return null;
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 7);
  }
  const s = String(valor);
  return /^\d{4}-\d{2}/.test(s) ? s.slice(0, 7) : null;
}

function _ehMesValido(mesRef) {
  return typeof mesRef === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(mesRef);
}

// Interpreta o argumento de "/teto <termo|categoria> <valor>".
// Reusa interpretarAcompanhamento pro alvo (mesmas regras de categoria×termo e
// a guarda de ≥3 caracteres) e lê o ÚLTIMO token como valor.
//   ok       → { ok:true, tipo_alvo, alvo, rotulo, limite }
//   vazio    → { ok:false, motivo:'vazio' }          (sem argumento nenhum)
//   sem_valor→ { ok:false, motivo:'sem_valor' }      (só o alvo, sem número)
//   sem_alvo → { ok:false, motivo:'sem_alvo' }       (só o número, sem alvo)
//   invalido → { ok:false, motivo:'valor_invalido', valor }
//   curto    → { ok:false, motivo:'curto' }          (alvo com <3 caracteres)
function interpretarTeto(argumento) {
  const partes = String(argumento == null ? '' : argumento)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Ruído de moeda que a pessoa digita solto e que NÃO é parte do alvo.
  // Só no fim da frase de propósito: "arroz real 100" mantém "arroz real"
  // como alvo (pode ser marca), mas "cerveja 100 reais" e "cerveja R$ 100"
  // viram alvo "cerveja" + valor 100.
  const SUFIXO_MOEDA = /^(reais?|conto|contos|pila|pilas)$/i;
  const PREFIXO_MOEDA = /^(r\$?|rs)$/i;
  while (partes.length > 0 && SUFIXO_MOEDA.test(partes[partes.length - 1])) partes.pop();

  if (partes.length === 0) return { ok: false, motivo: 'vazio' };
  if (partes.length === 1) {
    // Um token só: distingue "esqueci o valor" de "esqueci o alvo", pra a
    // mensagem de erro dizer exatamente o que falta.
    return _valorEmReais(partes[0]) === null
      ? { ok: false, motivo: 'sem_valor' }
      : { ok: false, motivo: 'sem_alvo' };
  }

  const bruto = partes[partes.length - 1];
  const limite = _valorEmReais(bruto);
  if (limite === null || limite < TETO_MIN || limite > TETO_MAX) {
    return { ok: false, motivo: 'valor_invalido', valor: bruto };
  }

  // "cerveja R$ 100" → o "R$" ficou órfão no fim do alvo; tira antes de gravar.
  const tokensAlvo = partes.slice(0, -1);
  while (tokensAlvo.length > 0 && PREFIXO_MOEDA.test(tokensAlvo[tokensAlvo.length - 1])) tokensAlvo.pop();

  const alvo = interpretarAcompanhamento(tokensAlvo.join(' '));
  if (!alvo.ok) return alvo;

  return { ...alvo, limite: _round2(limite) };
}

// verificarTetosEstourados(acompanhamentos, itensDoMes, mesRef) → alertas[]
//   acompanhamentos: linhas de `acompanhamentos` (cod-0031), com limite_mensal
//     e alertado_em (mês do último alerta — anti-spam).
//   itensDoMes: itens do mês (buscarItensDoMes). null/não-array → [] alertas
//     (leitura falhou = não inventa gasto zero nem alerta).
//   mesRef: 'YYYY-MM' do mês avaliado. Inválido → [] (sem mês não há como
//     garantir a idempotência mensal, então prefere o silêncio).
//
// Dispara quando o gasto ATINGE o teto (>=): quem definiu R$ 100 quer saber ao
// chegar em R$ 100, não só ao passar. Idempotente: um alvo já alertado no mesmo
// mês fica de fora. Ordem determinística (maior gasto primeiro).
function verificarTetosEstourados(acompanhamentos, itensDoMes, mesRef) {
  if (!_ehMesValido(mesRef)) return [];
  if (!Array.isArray(itensDoMes)) return [];

  const linhas = Array.isArray(acompanhamentos) ? acompanhamentos : [];
  const alertas = [];

  for (const a of linhas) {
    if (!a || a.ativo === false) continue;

    const limite = Number(a.limite_mensal);
    if (!Number.isFinite(limite) || limite <= 0) continue;      // só acompanha, não alerta
    if (_mesDe(a.alertado_em) === mesRef) continue;             // já avisou neste mês

    const { total } = buscarGastoPorAlvo(itensDoMes, { tipo: a.tipo_alvo, valor: a.alvo });
    if (!(total >= limite)) continue;

    alertas.push({
      id: a.id,
      rotulo: a.rotulo || a.alvo,
      tipo_alvo: a.tipo_alvo,
      alvo: a.alvo,
      total: _round2(total),
      limite: _round2(limite),
      pct: Math.round((total / limite) * 100),
    });
  }

  return alertas.sort((x, y) => y.total - x.total);
}

// ---------------------------------------------------------------
// Comparativo entre mercados — LEITURA (cod-0020, feature paga nº1).
//
// Hoje a base anônima `precos_mercado` só RECEBE preços; nunca é lida. Aqui
// mora a inteligência: dado um conjunto de observações de preço (o mesmo
// produto canônico visto em lojas diferentes), dizer onde cada produto sai
// mais barato e, quando dá, a posição do usuário. Tudo PURO — a query vive no
// supabase.js e os textos no formatter.js.
//
// Honestidade (CLAUDE.md / CODE_GUIDE §0 — "classificação é o coração"): nada
// casa em ≥2 lojas → SEM comparativo, nunca um número inventado. Só compara
// observações recentes (janela) — preço velho engana. O casamento é por
// nome_canonico exato, então "arroz tio joao 5kg" só compara com o mesmo nome:
// o comparativo só é tão bom quanto a classificação por baixo.
//
// observacoes: [{ produto_canonico, loja, preco_unit, data_obs }]
// opts:
//   produtosDoUsuario  string[]|null — restringe aos canônicos do usuário
//   lojaDoUsuario      string|null   — pra calcular preço/posição do usuário
//   janelaDias         number(60)    — só obs a até N dias da mais recente
//   minLojas           number(2)     — produto precisa aparecer em ≥N lojas
//   minEconomiaPct     number(0)     — descarta diferença irrelevante
//   maxComparativos    number(0)     — 0=sem limite; >0 corta a lista (teaser)
// ---------------------------------------------------------------
function compararPrecosMercado(observacoes, opts = {}) {
  const {
    produtosDoUsuario = null,
    lojaDoUsuario = null,
    janelaDias = 60,
    minLojas = 2,
    minEconomiaPct = 0,
    maxComparativos = 0,
  } = opts;

  const vazio = {
    temComparativo: false,
    comparativos: [],
    totalComparaveis: 0,
    mostrados: 0,
    temMais: false,
    janelaDias,
  };

  const obs = (Array.isArray(observacoes) ? observacoes : []).filter(
    (o) => o && o.produto_canonico && o.loja && Number(o.preco_unit) > 0 && o.data_obs
  );
  if (obs.length === 0) return vazio;

  // Âncora temporal = observação mais recente; a janela olha pra trás dela.
  const maxData = obs.reduce((m, o) => (o.data_obs > m ? o.data_obs : m), obs[0].data_obs);
  const recentes = obs.filter((o) => _diasEntre(o.data_obs, maxData) <= janelaDias);

  // Filtro opcional pelos produtos que o usuário realmente compra.
  const setUsuario = Array.isArray(produtosDoUsuario) && produtosDoUsuario.length
    ? new Set(produtosDoUsuario.map((p) => _norm(p)))
    : null;
  const lojaUserNorm = lojaDoUsuario ? _norm(lojaDoUsuario) : null;

  // Agrupa por produto canônico (normalizado) e, dentro dele, por loja —
  // mantendo a observação MAIS RECENTE de cada loja (empate → menor preço).
  const porProduto = new Map();
  for (const o of recentes) {
    const pk = _norm(o.produto_canonico);
    if (setUsuario && !setUsuario.has(pk)) continue;
    if (!porProduto.has(pk)) porProduto.set(pk, { nome: o.produto_canonico, lojas: new Map() });
    const grupo = porProduto.get(pk);
    const lk = _norm(o.loja);
    const preco = _round2(o.preco_unit);
    const atual = grupo.lojas.get(lk);
    if (!atual || o.data_obs > atual.data || (o.data_obs === atual.data && preco < atual.preco)) {
      grupo.lojas.set(lk, { loja: o.loja, lojaNorm: lk, preco, data: o.data_obs });
    }
  }

  const comparativos = [];
  for (const grupo of porProduto.values()) {
    const lojas = Array.from(grupo.lojas.values());
    if (lojas.length < minLojas) continue;

    const ordenadas = lojas.slice().sort((a, b) => a.preco - b.preco);
    const menor = ordenadas[0];
    const maior = ordenadas[ordenadas.length - 1];
    const economia = _round2(maior.preco - menor.preco);
    if (economia <= 0) continue; // empate de preço → sem diferença acionável
    const economiaPct = maior.preco > 0 ? Math.round((economia / maior.preco) * 100) : 0;
    if (economiaPct < minEconomiaPct) continue;

    let precoUsuario = null;
    let posicaoUsuario = null;
    let economiaUsuario = null;
    if (lojaUserNorm) {
      const doUsuario = lojas.find((l) => l.lojaNorm === lojaUserNorm);
      if (doUsuario) {
        precoUsuario = doUsuario.preco;
        if (precoUsuario <= menor.preco) posicaoUsuario = 'mais_barato';
        else if (precoUsuario >= maior.preco) posicaoUsuario = 'mais_caro';
        else posicaoUsuario = 'intermediario';
        const dif = _round2(precoUsuario - menor.preco);
        economiaUsuario = dif > 0 ? dif : null;
      }
    }

    comparativos.push({
      produto: grupo.nome,
      nLojas: lojas.length,
      menor: { loja: menor.loja, preco: menor.preco },
      maior: { loja: maior.loja, preco: maior.preco },
      economia,
      economiaPct,
      precoUsuario,
      posicaoUsuario,
      economiaUsuario,
    });
  }

  // Maior diferença primeiro (o comparativo mais útil no topo).
  comparativos.sort((a, b) => b.economia - a.economia);

  const totalComparaveis = comparativos.length;
  const lista = maxComparativos > 0 ? comparativos.slice(0, maxComparativos) : comparativos;

  return {
    temComparativo: lista.length > 0,
    comparativos: lista,
    totalComparaveis,
    mostrados: lista.length,
    temMais: totalComparaveis > lista.length,
    janelaDias,
  };
}

module.exports = {
  analisarRaioXCategorias,
  analisarInflacaoPessoal,
  calcularEconomia,
  analisarOndeCortar,
  casarItemComAlvo,
  buscarGastoPorAlvo,
  buscarGastoSuperfluo,
  interpretarAcompanhamento,
  interpretarSuperfluo,
  interpretarTeto,
  verificarTetosEstourados,
  compararPrecosMercado,
  TETO_MIN,
  TETO_MAX,
  CATEGORIAS_SUPERFLUAS,
  CATEGORIAS_VALIDAS,
  CATEGORIAS_NAO_ACIONAVEIS,
};
