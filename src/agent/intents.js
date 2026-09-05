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
// charts.js é puro (zero dependência nativa, zero I/O no import) — o require
// direto é seguro no sandbox e garante que o gráfico do agente (cod-0048) é o
// MESMO do /gastos e do resumo mensal, nunca uma cópia.
const { gerarUrlGraficoCategorias } = require('../charts');
const {
  calcularEconomia,
  analisarInflacaoPessoal,
  analisarRaioXCategorias,
  analisarOndeCortar,
  compararPrecosMercado,
  buscarGastoSuperfluo,
  buscarGastoPorAlvo,
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

// ─────────────────────────────────────────────────────────────────────────────
// Voz de usuário × voz do bot (cod-0042/cod-0044). Os `exemplos` do registro
// são voz de USUÁRIO (gíria ajuda o classificador), mas mensagem DO BOT não usa
// gíria (regra 2026-05-26). Estes helpers escolhem um exemplo "limpo" — usados
// na lista viva da ajuda (duvida_sobre_bot) e nas sugestões pós-resposta
// (render.montarSugestao). \b do JS falha após vogal acentuada ("tá") —
// compara sem acento.
// ─────────────────────────────────────────────────────────────────────────────
function temGiria(exemplo) {
  return /\b(ce|ta|ne|to)\b/.test(
    String(exemplo).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  );
}

// Primeiro exemplo sem gíria da intent; fallback no primeiro exemplo (o
// chamador decide se o fallback serve — a ajuda aceita, a sugestão não).
function exemploSemGiria(def) {
  if (!def || !Array.isArray(def.exemplos) || def.exemplos.length === 0) return null;
  return def.exemplos.find((e) => !temGiria(e)) || def.exemplos[0];
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
  // cod-0044: depois do total, o passo natural é "onde foi esse dinheiro".
  sugestoes: ['raio_x_categorias'],

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
  // cod-0044: da categoria pro item específico ("quanto gastei em cerveja?").
  sugestoes: ['gasto_por_termo'],

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
  // cod-0044: comparou e viu o movimento → o próximo passo é onde agir.
  sugestoes: ['onde_cortar'],

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
  // cod-0044: item subiu de preço → onde ele está mais barato.
  sugestoes: ['comparativo_mercados'],

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
  // cod-0044: viu o maior gasto → quanto dele foi supérfluo.
  sugestoes: ['gasto_superfluo'],

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
  // cod-0044: quer economizar mais → onde os mercados diferem de preço.
  sugestoes: ['comparativo_mercados'],

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

// ═════════════════════════════════════════════════════════════════════════════
// Leva 2b (cod-0041) — comparativo entre mercados + gasto supérfluo como
// intents de conversa. Mesmos padrões da Leva 2a: fato rico, fmt.* via brl()
// (fonte única), temDados honesto (estado-vazio NUNCA vira número chutado).
// O gate por plano é passo HUMANO separado (AGENDA cod-0041, nota-gate) —
// aqui o limite do comparativo é o MESMO teaser por env do /comparar.
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// comparativo_mercados — "onde tá mais barato?"
// Reusa buscarObservacoesComparativo (supabase.js) + compararPrecosMercado
// (insights.js, cod-0020 — puro, já testado). Honestidade: nada casa em ≥2
// lojas → estado-vazio, nunca número inventado. Fato rico: o destaque é o
// comparativo de MAIOR diferença (a lista completa fica no /comparar).
// ─────────────────────────────────────────────────────────────────────────────
const comparativoMercados = {
  id: 'comparativo_mercados',
  descricao: 'Em qual mercado os produtos que a pessoa compra estão mais baratos (comparativo de preços entre lojas)',
  exemplos: [
    'onde tá mais barato', 'qual mercado é mais barato',
    'onde compro mais barato', 'compara os preços dos mercados',
  ],
  parametros: {},

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarObservacoesComparativo || _supabase().buscarObservacoesComparativo;
    // Dois números, dois trabalhos — e NENHUMA decisão de plano aqui (cod-0075):
    //   • maxComparativos → quantos comparativos o insights.js devolve (mesmo
    //     teto do /comparar; o chamador calcula pelo perfil).
    //   • maxNarrados     → quantos entram no TEXTO. Default 1 = exatamente o
    //     comportamento de sempre (só o destaque), que é o do Free.
    // A intent não sabe quem é Pro: ela recebe o número já pronto. Quem decide
    // é o src/index.js, onde a regra de plano já mora (mostrarComparativo).
    const maxComparativos = deps.maxComparativos != null
      ? deps.maxComparativos
      : (Number(process.env.COMPARATIVO_AMOSTRAS_FREE) || 3);
    const maxNarrados = deps.maxNarrados != null ? Number(deps.maxNarrados) : 1;

    const { observacoes, produtosDoUsuario, lojaDoUsuario } = await buscar(phone);
    const resultado = compararPrecosMercado(observacoes, {
      produtosDoUsuario,
      lojaDoUsuario,
      minEconomiaPct: 3, // mesma régua do /comparar — diferença irrelevante não vira "achado"
      maxComparativos,
    });

    if (!resultado.temComparativo) return { temDados: false };

    const destaque = resultado.comparativos[0]; // maior diferença primeiro (ordenação do insights.js)
    const fmt = {
      menorPreco: `R$ ${brl(destaque.menor.preco)}`,
      maiorPreco: `R$ ${brl(destaque.maior.preco)}`,
      economia: `R$ ${brl(destaque.economia)}`,
      economiaPct: `${destaque.economiaPct}%`,
      nComparaveis: String(resultado.totalComparaveis),
    };
    if (destaque.economiaUsuario) {
      fmt.precoUsuario = `R$ ${brl(destaque.precoUsuario)}`;
      fmt.economiaUsuario = `R$ ${brl(destaque.economiaUsuario)}`;
    }

    // Linhas extras (cod-0075): do 2º comparativo em diante, até maxNarrados.
    // Free recebe maxNarrados=1 → slice(1,1) → lista vazia → texto idêntico ao
    // de hoje. Mesmo brl() do destaque, pra formatação não divergir.
    const extras = resultado.comparativos.slice(1, Math.max(1, maxNarrados));
    const linhasExtras = extras.map(
      (c) =>
        `• ${c.produto}: R$ ${brl(c.menor.preco)} no ${c.menor.loja} ` +
        `(vs R$ ${brl(c.maior.preco)} no ${c.maior.loja}) — R$ ${brl(c.economia)} de diferença`
    );
    // 🔴 Fidelidade (Camada 5): todo número do texto tem de estar autorizado.
    // A allowlist do render.js sai de fato.fmt + do texto do template, então as
    // linhas extras entram no fmt também — senão a narração do LLM cairia no
    // airbag sem motivo assim que o Pro visse mais de um comparativo.
    if (linhasExtras.length > 0) fmt.extras = linhasExtras.join(' ');

    return {
      temDados: true,
      destaque,
      linhasExtras,
      // Com lista, o render usa o template e pula a narração (ver render.js):
      // o LLM tem ordem de responder em até 2 frases e comeria as linhas extras.
      semNarracao: linhasExtras.length > 0,
      totalComparaveis: resultado.totalComparaveis,
      mostrados: resultado.mostrados,
      temMais: resultado.temMais,
      janelaDias: resultado.janelaDias,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      return 'Ainda não encontrei o mesmo produto em mercados diferentes pra comparar os preços. Quanto mais cupons a rede registra, mais rico fica o comparativo — continue mandando os seus.';
    }
    const d = fato.destaque;
    let txt = `A maior diferença que encontrei: ${d.produto} sai por ${fato.fmt.menorPreco} no ${d.menor.loja} e ${fato.fmt.maiorPreco} no ${d.maior.loja} — ${fato.fmt.economia} (${fato.fmt.economiaPct}) de diferença.`;
    if (d.posicaoUsuario === 'mais_barato') {
      txt += ' Você já comprou no mais barato.';
    } else if (fato.fmt.economiaUsuario) {
      txt += ` Você pagou ${fato.fmt.precoUsuario} — dava pra economizar ${fato.fmt.economiaUsuario}.`;
    }
    if (fato.totalComparaveis > 1) {
      txt += ` Tenho ${fato.fmt.nComparaveis} produtos comparáveis — pra lista completa: /comparar.`;
    }
    // Só chega aqui com lista quando o chamador autorizou narrar mais de um
    // (Pro). No Free, linhasExtras é sempre vazio e o texto acima é o final.
    if (Array.isArray(fato.linhasExtras) && fato.linhasExtras.length > 0) {
      txt += `\n\nOutros que valem o olho:\n${fato.linhasExtras.join('\n')}`;
    }
    return txt;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// gasto_superfluo — "quanto foi de besteira?"
// Reusa buscarGastosPorCategoria + buscarCategoriasSuperfluas (supabase.js) +
// buscarGastoSuperfluo (insights.js, cod-0030 — baseline doces+bebidas quando
// o usuário não configurou nada). Distingue os dois vazios honestamente: sem
// gasto nenhum no mês ≠ com gastos mas nada nas categorias supérfluas.
// ─────────────────────────────────────────────────────────────────────────────
const gastoSuperfluo = {
  id: 'gasto_superfluo',
  descricao: 'Quanto a pessoa gastou em itens supérfluos (besteiras) no mês, e em quais categorias',
  exemplos: [
    'quanto foi de besteira', 'quanto gastei em besteira esse mês',
    'quanto foi de supérfluo', 'gastei muito em bobagem',
  ],
  parametros: {
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },
  // cod-0044: viu o supérfluo → onde dá pra aliviar sem mexer no essencial.
  sugestoes: ['onde_cortar'],

  async executar(phone, params = {}, deps = {}) {
    const buscarGastos = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const buscarCats = deps.buscarCategoriasSuperfluas || _supabase().buscarCategoriasSuperfluas;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');

    const dados = await buscarGastos(phone, mesRef);
    if (!dados || dados.length === 0) {
      return { temDados: false, mesRef, teveGastoNoMes: false };
    }

    let categorias = null; // null → baseline (doces+bebidas) dentro da análise
    try {
      categorias = await buscarCats(phone);
    } catch (_) { /* degradação segura: análise segue no baseline */ }

    const analise = buscarGastoSuperfluo(dados, categorias);
    if (!analise.porCategoria.length || analise.totalSuperfluo <= 0) {
      return { temDados: false, mesRef, teveGastoNoMes: true };
    }

    const fmt = {
      total: `R$ ${brl(analise.totalSuperfluo)}`,
      pct: `${analise.pctDoMes}%`,
    };
    analise.porCategoria.forEach((c, i) => {
      fmt[`c${i + 1}Valor`] = `R$ ${brl(c.valor)}`;
    });

    return {
      temDados: true,
      mesRef,
      totalSuperfluo: analise.totalSuperfluo,
      pctDoMes: analise.pctDoMes,
      pct: analise.pctDoMes, // o render autoriza o % cru na allowlist via fato.pct
      porCategoria: analise.porCategoria,
      fmt,
    };
  },

  template(fato) {
    if (!fato.temDados) {
      if (fato.teveGastoNoMes) {
        return `Em ${nomeDoMes(fato.mesRef)} não encontrei gasto nas suas categorias de supérfluo. Bom sinal.`;
      }
      return `Ainda não tenho gastos registrados em ${nomeDoMes(fato.mesRef)}.`;
    }
    const partes = fato.porCategoria.map(
      (c, i) => `${rotuloCategoria(c.categoria)} ${fato.fmt[`c${i + 1}Valor`]}`
    );
    return `Em ${nomeDoMes(fato.mesRef)} foram ${fato.fmt.total} em itens supérfluos (${fato.fmt.pct} do mês): ${partes.join(', ')}.`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// gasto_por_termo — "quanto gastei em cerveja?" (cod-0034)
// Reusa buscarItensDoMes (supabase.js) + buscarGastoPorAlvo (insights.js,
// cod-0030 — matching puro por palavra inteira sobre nome_canonico||nome).
// O número NUNCA nasce no LLM: a soma vem do executor (buscarGastoPorAlvo);
// nada casa → estado-vazio honesto, nunca número chutado. Três vazios
// distintos e honestos: sem termo ≠ mês sem compras ≠ termo que não casou —
// e leitura com ERRO (null) vira "não consegui consultar", não "não achei".
// ─────────────────────────────────────────────────────────────────────────────
const gastoPorTermo = {
  id: 'gasto_por_termo',
  descricao: 'Quanto a pessoa gastou em um item ou produto específico, buscando por palavra livre nos itens dos cupons (ex.: cerveja, chocolate, ração, café)',
  exemplos: [
    'quanto gastei em cerveja', 'quanto foi de chocolate esse mês',
    'quanto gastei com ração', 'quanto estou gastando de café',
  ],
  parametros: {
    termo: { tipo: 'texto', obrigatorio: true },
    periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
  },

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarItensDoMes || _supabase().buscarItensDoMes;
    const mesRef = _resolverMesRef(params.periodo, 'mes_atual');
    const termo = typeof params.termo === 'string'
      ? params.termo.trim().toLowerCase()
      : '';

    // Defesa em profundidade: `termo` é obrigatório na Camada 1 (guards), mas
    // se chegar vazio por outra via, a resposta pede o item — nunca quebra.
    if (!termo) return { temDados: false, mesRef, termo: null, semTermo: true };

    const itens = await buscar(phone, mesRef);
    if (itens === null) {
      return { temDados: false, mesRef, termo, erroLeitura: true };
    }
    if (!Array.isArray(itens) || itens.length === 0) {
      return { temDados: false, mesRef, termo, teveGastoNoMes: false };
    }

    const r = buscarGastoPorAlvo(itens, { tipo: 'termo', valor: termo });
    if (!r.itensCasados.length || r.total <= 0) {
      return { temDados: false, mesRef, termo, teveGastoNoMes: true };
    }

    return {
      temDados: true,
      mesRef,
      termo,
      total: r.total,
      qtdCompras: r.qtdCompras,
      fmt: {
        total: `R$ ${brl(r.total)}`,
        qtdCompras: String(r.qtdCompras),
      },
    };
  },

  template(fato) {
    if (!fato.temDados) {
      if (fato.semTermo) {
        return 'Me diga qual item você quer saber — por exemplo: "quanto gastei em cerveja?".';
      }
      if (fato.erroLeitura) {
        return 'Não consegui consultar seus gastos agora. Tente novamente em instantes.';
      }
      if (fato.teveGastoNoMes) {
        return `Não encontrei itens de "${fato.termo}" nos seus cupons de ${nomeDoMes(fato.mesRef)}.`;
      }
      return `Ainda não tenho gastos registrados em ${nomeDoMes(fato.mesRef)}.`;
    }
    const compras = fato.qtdCompras === 1
      ? '1 compra'
      : `${fato.fmt.qtdCompras} compras`;
    return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.total} em ${fato.termo} (${compras}).`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// mostrar_grafico — "me mostra o gráfico" (cod-0048)
// Reusa buscarGastosPorCategoria (supabase.js) + gerarUrlGraficoCategorias
// (charts.js) — o MESMO gráfico do /gastos e do resumo mensal, nunca duplicado.
// A entrega é uma IMAGEM (`entregaImagem: true`): o fato carrega `imagemUrl` +
// `legenda`, e o orquestrador envia via zapi.enviarImagem (o mesmo envio do
// resumo mensal). Sem narração LLM: os números moram DENTRO da imagem, gerados
// deterministicamente pelo charts.js — não há texto numérico pro modelo tocar.
// Períodos arbitrários ficam fora (AGENDA cod-0048, fora-de-escopo): o gráfico
// é sempre do mês atual — por isso `parametros: {}`.
// ─────────────────────────────────────────────────────────────────────────────
const mostrarGrafico = {
  id: 'mostrar_grafico',
  descricao: 'A pessoa quer VER o gráfico de gastos por categoria do mês atual (resposta em imagem)',
  exemplos: [
    'me mostra o gráfico', 'gráfico dos gastos',
    'quero ver o gráfico do mês', 'manda o gráfico das categorias',
  ],
  parametros: {},
  entregaImagem: true,

  async executar(phone, params = {}, deps = {}) {
    const buscar = deps.buscarGastosPorCategoria || _supabase().buscarGastosPorCategoria;
    const gerarUrl = deps.gerarUrlGrafico || gerarUrlGraficoCategorias;
    const mesRef = resolverPeriodo('mes_atual');

    const categorias = await buscar(phone, mesRef);
    if (!categorias || categorias.length === 0) {
      return { temDados: false, mesRef };
    }

    const imagemUrl = gerarUrl(categorias, nomeDoMes(mesRef));
    if (!imagemUrl) {
      // charts.js só devolve null sem dados; se acontecer mesmo assim, a
      // resposta é o texto honesto de ausência — nunca uma imagem quebrada.
      return { temDados: false, mesRef };
    }

    return {
      temDados: true,
      mesRef,
      imagemUrl,
      legenda: `📊 Gastos por categoria — ${nomeDoMes(mesRef)}`,
    };
  },

  // Estado-vazio honesto (texto) e, com dados, a legenda que acompanha a imagem.
  template(fato) {
    if (!fato.temDados) {
      return `Ainda não tenho gastos categorizados em ${nomeDoMes(fato.mesRef)} pra montar o gráfico. Manda uma foto do cupom que eu começo! 📸`;
    }
    return fato.legenda;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// cod-0042 — duvida_sobre_bot: "o que você sabe fazer?" respondido natural-
// mente, em vez de cair em fora_de_escopo (o maior balde de frustração
// esperado no log). A lista de exemplos é VIVA: derivada dos `exemplos` do
// próprio REGISTRO em tempo de execução — intent nova entra na ajuda sozinha,
// sem duplicar copy. Não consome cota (flag `consomeCota:false`, mesma
// decisão do off-topic no orquestrador cod-0017): ajuda não é pergunta sobre
// os gastos. `temDados:false` no fato garante resposta pelo template, sem
// LLM (Camada 3) e sem custo.
// ═════════════════════════════════════════════════════════════════════════════
const duvidaSobreBot = {
  id: 'duvida_sobre_bot',
  descricao: 'A pessoa pergunta o que o Economizei sabe fazer, como funciona ou o que dá pra perguntar (ajuda sobre o próprio bot)',
  exemplos: [
    'o que você sabe fazer', 'como funciona',
    'que perguntas posso fazer', 'me ajuda a usar o bot',
  ],
  parametros: {},
  consomeCota: false,

  async executar() {
    // Sem I/O e sem número. temDados:false → o render responde direto pelo
    // template (não há dado pro LLM enfeitar) e nada é buscado no banco.
    return { temDados: false, ajuda: true };
  },

  template() {
    // Lista viva: 1 exemplo real por intent, exceto esta própria. Registro
    // cresceu → a ajuda cresce junto, sem tocar aqui. Exibe o primeiro
    // exemplo SEM gíria via exemploSemGiria (helper compartilhado com as
    // sugestões do cod-0044): os exemplos do registro são voz de usuário (bom
    // pro classificador), mas mensagem do bot não usa gíria (regra 2026-05-26).
    const exemplos = REGISTRO
      .filter((i) => i && i.id !== 'duvida_sobre_bot' && Array.isArray(i.exemplos) && i.exemplos.length)
      .map((i) => `• _${exemploSemGiria(i)}?_`);
    return (
      `Eu leio a foto do seu cupom e respondo perguntas sobre os seus gastos de mercado. 📸\n\n` +
      `Pode perguntar, por exemplo:\n${exemplos.join('\n')}\n\n` +
      `Pra ver os comandos: /ajuda`
    );
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
  comparativoMercados,
  gastoSuperfluo,
  gastoPorTermo,
  mostrarGrafico,
  duvidaSobreBot,
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
  comparativoMercados,
  gastoSuperfluo,
  gastoPorTermo,
  mostrarGrafico,
  duvidaSobreBot,
  CATEGORIAS_VALIDAS,
  rotuloCategoria,
  temGiria,
  exemploSemGiria,
};
