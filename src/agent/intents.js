// src/agent/intents.js — Registro de Intenções do Agente de Perguntas (cod-0012)
//
// Peça central do Desenho Técnico (Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md
// §3): cada intenção é um objeto autocontido que serve a classificação (cod-0013),
// a execução (busca o FATO real, nunca inventa) e o template (resposta
// determinística, Opção 1 — e base da narração LLM da Opção 2, cod-0014).
//
// Princípio (Desenho §1): "o número nunca nasce no LLM". executar() só chama
// funções de leitura já testadas (supabase.js / insights.js) e devolve um FATO
// com os números crus E já formatados em `fmt.*` via brl() do formatter.js —
// fonte única de formatação (Desenho §5, nota de implementação: "o brl() tem
// que ser a única fonte de formatação — template e allowlist precisam gerar a
// mesma string, senão a checagem de fidelidade numérica dá falso-rejeição").
//
// 3 intenções do MVP (Desenho §3, tabela):
//   gasto_total_mes      — "quanto gastei esse mês?"
//   gasto_por_categoria  — "quanto gastei em carne?"
//   comparar_meses       — "tô gastando mais que mês passado?"
//
// Injeção de dependências: executar(phone, params, deps) aceita um `deps`
// opcional para sobrescrever as funções de leitura (usado em
// test/agent-intents.test.js, com dados sintéticos). Sem `deps`, usa as
// funções reais do supabase.js — exigidas via `_supabase()` (lazy require)
// para que IMPORTAR este módulo nunca dispare `createClient` do Supabase
// (que lança erro sem as envs SUPABASE_URL/SUPABASE_*_KEY configuradas —
// inexistentes neste sandbox de teste, só na máquina do Gabriel).

'use strict';

const { brl, nomeDoMes } = require('../formatter');
const { resolverPeriodo } = require('./periodo');
const {
  calcularEconomia,
  analisarInflacaoPessoal,
  analisarRaioXCategorias,
  analisarOndeCortar,
} = require('../insights');

// Lazy require — só resolve supabase.js (e o createClient que ele dispara no
// import) quando de fato chamado em produção sem `deps` injetado.
function _supabase() {
  return require('../supabase');
}

// Espelho de CATEGORIAS_VALIDAS (gemini.js) — duplicado de propósito para não
// puxar `gemini.js`, que carrega `sharp` no topo do arquivo e quebra (SIGBUS)
// em sandboxes sem libvips — mesmo problema documentado em cod-0026/0027/0030.
// Mesmo padrão já usado em formatter.js (LABELS_CATEGORIA "espelho de
// charts.js para evitar dependência circular").
const CATEGORIAS_VALIDAS = [
  'carnes', 'hortifruti', 'laticinios', 'padaria',
  'bebidas', 'limpeza', 'mercearia', 'congelados', 'doces', 'outros',
];

const ROTULO_CATEGORIA = {
  carnes: 'carnes e aves',
  hortifruti: 'hortifruti',
  laticinios: 'laticínios',
  padaria: 'padaria',
  bebidas: 'bebidas',
  limpeza: 'limpeza',
  mercearia: 'mercearia',
  congelados: 'congelados',
  doces: 'doces e petiscos',
  outros: 'outros',
};

function rotuloCategoria(categoria) {
  return ROTULO_CATEGORIA[categoria] || categoria;
}

// Resolve o rótulo de período de um parâmetro em 'YYYY-MM', com default.
// Defesa em profundidade (Camada 0): mesmo que um rótulo inválido escape da
// validação do guards.js (Camada 1), nunca quebra a pergunta — cai no default.
function _resolverMesRef(rotuloPeriodo, defaultRotulo) {
  const resolvido = resolverPeriodo(rotuloPeriodo || defaultRotulo);
  if (resolvido && typeof resolvido === 'object' && resolvido.invalido) {
    return resolverPeriodo(defaultRotulo);
  }
  return resolvido;
}

// ─────────────────────────────────────────────────────────────────────────────
// gasto_total_mes — "quanto gastei esse mês?"
// Reusa buscarGastosPorCategoria (supabase.js) — mesma fonte do comando /gastos.
// ─────────────────────────────────────────────────────────────────────────────
const gastoTotalMes = {
  id: 'gasto_total_mes',
  descricao: 'Quanto a pessoa gastou no total, num período (mês)',
  exemplos: [
    'quanto gastei esse mês', 'quanto eu gastei em maio',
    'qual foi meu gasto total', 'quanto eu já gastei no mês',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const categorias = await buscar(phone, mesRef);
    if (!categorias || categorias.length === 0) {
      return { temDados: false, mesRef };
    }

    const total = categorias.reduce((s, c) => s + (Number(c.total) || 0), 0);
    return {
      temDados: true,
      mesRef,
      total,
      fmt: { total: `R$ ${brl(total)}` },
    };
  },

  // OPÇÃO 1 — resposta determinística. O LLM não toca aqui.
  template(fato) {
    if (!fato.temDados) {
      return `Ainda não tenho gastos registrados em ${nomeDoMes(fato.mesRef)}.`;
    }
    return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.total} no total.`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// gasto_por_categoria — "quanto gastei em carne?"
// Reusa buscarGastosPorCategoria (supabase.js).
// ─────────────────────────────────────────────────────────────────────────────
const gastoPorCategoria = {
  id: 'gasto_por_categoria',
  descricao: 'Quanto a pessoa gastou em uma categoria específica, num período',
  exemplos: [
    'quanto gastei em carne', 'gastos com bebida esse mês',
    'quanto foi de limpeza em maio', 'quanto gastei em doces',
  ],
  parametros: {
    categoria: { tipo: 'enum', valores: CATEGORIAS_VALIDAS, obrigatorio: false },
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const categorias = await buscar(phone, mesRef);
    if (!categorias || categorias.length === 0) {
      return { temDados: false, mesRef, categoria: params.categoria || null };
    }

    const total = categorias.reduce((s, c) => s + (Number(c.total) || 0), 0);
    const alvo = params.categoria
      ? categorias.find((c) => c.categoria === params.categoria)
      : null;

    return {
      temDados: true,
      mesRef,
      categoria: params.categoria || null,
      valor: alvo ? alvo.total : null,
      total,
      fmt: {
        valor: alvo ? `R$ ${brl(alvo.total)}` : null,
        total: `R$ ${brl(total)}`,
      },
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return `Ainda não tenho gastos registrados em ${nomeDoMes(fato.mesRef)}.`;
    }
    if (!fato.categoria) {
      return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.total} no total.`;
    }
    if (fato.valor == null) {
      return `Não encontrei gastos de ${rotuloCategoria(fato.categoria)} em ${nomeDoMes(fato.mesRef)}.`;
    }
    return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.valor} em ${rotuloCategoria(fato.categoria)}.`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// comparar_meses — "tô gastando mais que mês passado?"
// Reusa buscarTotaisMensais (supabase.js) + calcularEconomia (insights.js, F4
// — já testada). mediaRef é a média móvel de até 3 meses ANTERIORES ao
// mês-alvo; com só 1 mês anterior disponível, mediaRef É esse mês anterior
// (vira comparação direta mês-a-mês). Honestidade: o template fala "média dos
// meses anteriores", nunca afirma especificamente "mês passado" — o dado pode
// ser uma média de até 3 meses, não só o imediatamente anterior.
// ─────────────────────────────────────────────────────────────────────────────
const compararMeses = {
  id: 'comparar_meses',
  descricao: 'Compara o gasto do mês com a média dos meses anteriores',
  exemplos: [
    'tô gastando mais que mês passado', 'esse mês tá mais caro',
    'gastei mais ou menos que antes', 'minha compra aumentou',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarTotaisMensais || _supabase().buscarTotaisMensais;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const totais = await buscar(phone, 12);
    const economia = calcularEconomia(totais, { mesAlvo: mesRef });

    if (!economia.temDados) {
      return { temDados: false, mesRef };
    }

    const diferenca = Math.abs(economia.economiaMes);
    const pct = economia.mediaRef > 0
      ? (economia.economiaMes / economia.mediaRef) * 100
      : 0;

    return {
      temDados: true,
      mesRef,
      totalMesRef: economia.totalMesRef,
      mediaRef: economia.mediaRef,
      economiaMes: economia.economiaMes,
      pct,
      fmt: {
        totalMesRef: `R$ ${brl(economia.totalMesRef)}`,
        mediaRef: `R$ ${brl(economia.mediaRef)}`,
        diferenca: `R$ ${brl(diferenca)}`,
      },
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return `Ainda não tenho dados suficientes pra comparar ${nomeDoMes(fato.mesRef)} com os meses anteriores.`;
    }
    const nome = nomeDoMes(fato.mesRef);
    if (Math.abs(fato.pct) < 5) {
      return `Em ${nome} você gastou ${fato.fmt.totalMesRef} — parecido com a média dos meses anteriores (${fato.fmt.mediaRef}).`;
    }
    if (fato.economiaMes < 0) {
      return `Em ${nome} você gastou ${fato.fmt.totalMesRef}, ${Math.round(Math.abs(fato.pct))}% acima da média dos meses anteriores (${fato.fmt.diferenca} a mais).`;
    }
    return `Em ${nome} você gastou ${fato.fmt.totalMesRef}, ${Math.round(fato.pct)}% abaixo da média dos meses anteriores (${fato.fmt.diferenca} a menos) 🎉`;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// Leva 2a (cod-0040) — 4 intents com a inteligência JÁ PRONTA no insights.js.
// Padrão "fato rico": quando a análise tem base validada (temConclusao /
// temSugestao / histórico), o fato inclui a comparação com o histórico do
// PRÓPRIO usuário. Camada 4: as conclusões só repassam o que a análise
// validou (limiares do insights.js), nunca reinterpretam. Camada 5: todo
// número citável vive em `fmt.*` via brl() (fonte única) ou no template.
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// inflacao_item — "o que subiu de preço?"
// Reusa buscarHistoricoPrecoItens (supabase.js) + analisarInflacaoPessoal (F1,
// insights.js — filtros de honestidade: 2+ observações, ≥14 dias, 8–150%).
// ─────────────────────────────────────────────────────────────────────────────
const inflacaoItem = {
  id: 'inflacao_item',
  descricao: 'Quais itens recorrentes da pessoa subiram ou caíram de preço ao longo do tempo (inflação pessoal)',
  exemplos: [
    'o que subiu de preço', 'meus itens estão mais caros',
    'qual a inflação das minhas compras', 'o que ficou mais caro pra mim',
  ],
  parametros: {},

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarHistoricoPrecoItens || _supabase().buscarHistoricoPrecoItens;
    const itens = await buscar(phone, 6);
    const analise = analisarInflacaoPessoal(itens);
    if (!analise.temDados) return { temDados: false };

    // Fato rico: o maior movimento de cada direção (as listas completas ficam
    // no /inflacao — a resposta de conversa destaca o que mais importa).
    const maiorAlta = analise.subiram[0] || null;
    const maiorQueda = analise.cairam[0] || null;

    const fmt = {
      nSubiram: String(analise.subiram.length),
      nCairam: String(analise.cairam.length),
    };
    if (maiorAlta) {
      fmt.altaAntigo = `R$ ${brl(maiorAlta.precoAntigo)}`;
      fmt.altaNovo = `R$ ${brl(maiorAlta.precoNovo)}`;
      fmt.altaPct = `${maiorAlta.variacaoPct}%`;
    }
    if (maiorQueda) {
      fmt.quedaAntigo = `R$ ${brl(maiorQueda.precoAntigo)}`;
      fmt.quedaNovo = `R$ ${brl(maiorQueda.precoNovo)}`;
      fmt.quedaPct = `${Math.abs(maiorQueda.variacaoPct)}%`;
    }

    return {
      temDados: true,
      maiorAlta,
      maiorQueda,
      nSubiram: analise.subiram.length,
      nCairam: analise.cairam.length,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return 'Ainda não tenho preços repetidos suficientes pra comparar seus itens. Quando você comprar os mesmos itens de novo ao longo das semanas, eu te mostro o que subiu e o que caiu de preço.';
    }
    const partes = [];
    if (fato.maiorAlta) {
      partes.push(`O que mais subiu nas suas compras foi ${fato.maiorAlta.nome}: ${fato.fmt.altaAntigo} → ${fato.fmt.altaNovo} (+${fato.fmt.altaPct}).`);
    }
    if (fato.maiorQueda) {
      partes.push(`O que mais caiu foi ${fato.maiorQueda.nome}: ${fato.fmt.quedaAntigo} → ${fato.fmt.quedaNovo} (−${fato.fmt.quedaPct}).`);
    }
    partes.push(`No total, ${fato.fmt.nSubiram} subiram e ${fato.fmt.nCairam} caíram. Pra lista completa: /inflacao.`);
    return partes.join(' ');
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// raio_x_categorias — "qual meu maior gasto?"
// Reusa buscarGastosPorCategoria + buscarHistoricoCategorias (supabase.js) +
// analisarRaioXCategorias (F2). Fato rico: quando há histórico, a conclusão
// inclui acima/abaixo/em linha com a média do próprio usuário (Camada 4:
// repassa `comparativo` como veio — os limiares de ±5pp são do insights.js).
// ─────────────────────────────────────────────────────────────────────────────
const raioXCategorias = {
  id: 'raio_x_categorias',
  descricao: 'Qual foi a maior categoria de gasto do mês e como ela se compara com a média histórica da própria pessoa',
  exemplos: [
    'qual meu maior gasto', 'onde foi mais dinheiro esse mês',
    'em que categoria eu mais gasto', 'raio x dos meus gastos',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscarGastos = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const buscarHist = deps.buscarHistoricoCategorias || _supabase().buscarHistoricoCategorias;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const dados = await buscarGastos(phone, mesRef);

    let historico = null;
    try {
      historico = await buscarHist(phone, mesRef, 3);
    } catch (_) { /* degradação segura: análise segue sem histórico (padrão do /gastos) */ }

    const analise = analisarRaioXCategorias(dados || [], historico);
    if (!analise.temConclusao) return { temDados: false, mesRef };

    const fmt = {
      topValor: `R$ ${brl(analise.top.valor)}`,
      topPct: `${analise.top.pct}%`,
    };
    if (analise.candidatoCorte) {
      fmt.corteValor = `R$ ${brl(analise.candidatoCorte.valor)}`;
      fmt.cortePct = `${analise.candidatoCorte.pct}%`;
    }

    return {
      temDados: true,
      mesRef,
      top: analise.top,
      comparativo: analise.comparativo, // 'acima'|'abaixo'|'em_linha'|null — como a análise validou
      candidatoCorte: analise.candidatoCorte,
      mesesHistorico: analise.mesesHistorico,
      pct: analise.top.pct,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return `Ainda não tenho gastos categorizados em ${nomeDoMes(fato.mesRef)}.`;
    }
    let txt = `Em ${nomeDoMes(fato.mesRef)} seu maior gasto foi ${rotuloCategoria(fato.top.categoria)}: ${fato.fmt.topValor} (${fato.fmt.topPct} do mês`;
    if (fato.comparativo === 'acima') txt += ', acima da sua média';
    else if (fato.comparativo === 'abaixo') txt += ', abaixo da sua média';
    else if (fato.comparativo === 'em_linha') txt += ', em linha com sua média';
    txt += ').';
    if (fato.candidatoCorte) {
      txt += ` Só de ${rotuloCategoria(fato.candidatoCorte.categoria)} foram ${fato.fmt.corteValor} (${fato.fmt.cortePct} do mês).`;
    }
    return txt;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// economia_acumulada — "quanto já economizei?"
// Reusa buscarTotaisMensais (supabase.js) + calcularEconomia (F4). Sem período
// explícito, o mês de referência é o mais recente da série — o MESMO
// comportamento do /economia validado em produção (mes_atual vazio não vira
// "sem dados" à toa). economiaAno só entra quando > 0 (a copy do F4 explica
// exatamente o que o número soma; aqui só repassamos).
// ─────────────────────────────────────────────────────────────────────────────
const economiaAcumulada = {
  id: 'economia_acumulada',
  descricao: 'Quanto a pessoa já economizou em relação à própria média de gastos de mercado (no mês e no ano)',
  exemplos: [
    'quanto já economizei', 'estou economizando',
    'quanto guardei esse ano', 'minha economia até agora',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarTotaisMensais || _supabase().buscarTotaisMensais;
    const totais = await buscar(phone, 12);

    const opts = {};
    if (params.periodo) {
      opts.mesAlvo = _resolverMesRef(params.periodo, 'mes_atual');
    }
    const economia = calcularEconomia(totais, opts);
    if (!economia.temDados) return { temDados: false, mesRef: opts.mesAlvo || null };

    const fmt = {
      mediaRef: `R$ ${brl(economia.mediaRef)}`,
      diferencaMes: `R$ ${brl(Math.abs(economia.economiaMes))}`,
    };
    if (economia.economiaAno > 0) {
      fmt.economiaAno = `R$ ${brl(economia.economiaAno)}`;
    }

    return {
      temDados: true,
      mesRef: economia.mesRef,
      economiaMes: economia.economiaMes,
      economiaAno: economia.economiaAno,
      mediaRef: economia.mediaRef,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return 'Ainda preciso de pelo menos dois meses de compras pra calcular sua economia. Continue mandando os cupons que logo eu te mostro.';
    }
    const nome = nomeDoMes(fato.mesRef);
    const linhaAno = fato.fmt.economiaAno
      ? ` No ano, somando os meses em que você ficou abaixo da média, já são ${fato.fmt.economiaAno} no seu bolso.`
      : '';
    if (fato.economiaMes > 0.005) {
      return `Em ${nome} você gastou ${fato.fmt.diferencaMes} abaixo da sua média de mercado (${fato.fmt.mediaRef}/mês).${linhaAno}`;
    }
    if (fato.economiaMes < -0.005) {
      return `Em ${nome} você gastou ${fato.fmt.diferencaMes} a mais que sua média de mercado (${fato.fmt.mediaRef}/mês).${linhaAno}`;
    }
    return `Em ${nome} você gastou em linha com sua média de mercado (${fato.fmt.mediaRef}/mês).${linhaAno}`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// onde_cortar — "onde dá pra economizar?"
// Reusa os mesmos dados do raio-x + analisarOndeCortar (F3 — só categorias
// discricionárias com peso ≥5% do mês, até 2 sugestões, ordenadas por força
// do sinal). Camada 4: `acimaDaMedia`/valores vêm da análise, nunca daqui.
// ─────────────────────────────────────────────────────────────────────────────
const ondeCortar = {
  id: 'onde_cortar',
  descricao: 'Quais categorias supérfluas pesaram no mês — onde dá pra reduzir sem mexer no essencial',
  exemplos: [
    'onde posso cortar', 'onde dá pra economizar',
    'o que reduzir nas compras', 'quais gastos dá pra diminuir',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscarGastos = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const buscarHist = deps.buscarHistoricoCategorias || _supabase().buscarHistoricoCategorias;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const dados = await buscarGastos(phone, mesRef);

    let historico = null;
    try {
      historico = await buscarHist(phone, mesRef, 3);
    } catch (_) { /* degradação segura: análise segue sem histórico */ }

    const analise = analisarOndeCortar(dados || [], historico);
    if (!analise.temSugestao) return { temDados: false, mesRef };

    const fmt = {};
    analise.sugestoes.forEach((s, i) => {
      fmt[`s${i + 1}Valor`] = `R$ ${brl(s.valor)}`;
      fmt[`s${i + 1}Pct`] = `${s.pct}%`;
      if (s.mediaValorHist != null) {
        fmt[`s${i + 1}Media`] = `R$ ${brl(s.mediaValorHist)}`;
      }
    });

    return {
      temDados: true,
      mesRef,
      sugestoes: analise.sugestoes,
      mesesHistorico: analise.mesesHistorico,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return `Olhando ${nomeDoMes(fato.mesRef)}, não encontrei categorias supérfluas com peso relevante nos seus gastos. Bom sinal.`;
    }
    const linhas = fato.sugestoes.map((s, i) => {
      let l = `${rotuloCategoria(s.categoria)}: ${fato.fmt[`s${i + 1}Valor`]} (${fato.fmt[`s${i + 1}Pct`]} do mês`;
      if (s.acimaDaMedia === true && fato.fmt[`s${i + 1}Media`]) {
        l += `, acima da sua média de ${fato.fmt[`s${i + 1}Media`]}/mês`;
      }
      l += ')';
      return l;
    });
    return `O que dá pra aliviar sem mexer no essencial em ${nomeDoMes(fato.mesRef)}: ${linhas.join('; ')}.`;
  },
};

const REGISTRO = [
  gastoTotalMes,
  gastoPorCategoria,
  compararMeses,
  inflacaoItem,
  raioXCategorias,
  economiaAcumulada,
  ondeCortar,
];

module.exports = {
  REGISTRO,
  gastoTotalMes,
  gastoPorCategoria,
  compararMeses,
  inflacaoItem,
  raioXCategorias,
  economiaAcumulada,
  ondeCortar,
  CATEGORIAS_VALIDAS,
  rotuloCategoria,
};
