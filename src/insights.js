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

module.exports = {
  analisarRaioXCategorias,
  analisarInflacaoPessoal,
  calcularEconomia,
  CATEGORIAS_SUPERFLUAS,
  CATEGORIAS_NAO_ACIONAVEIS,
};
