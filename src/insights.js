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

module.exports = {
  analisarRaioXCategorias,
  analisarInflacaoPessoal,
  calcularEconomia,
  analisarOndeCortar,
  casarItemComAlvo,
  buscarGastoPorAlvo,
  buscarGastoSuperfluo,
  CATEGORIAS_SUPERFLUAS,
  CATEGORIAS_NAO_ACIONAVEIS,
};
