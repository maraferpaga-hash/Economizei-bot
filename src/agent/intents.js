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
const { calcularEconomia } = require('../insights');

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

const REGISTRO = [gastoTotalMes, gastoPorCategoria, compararMeses];

module.exports = {
  REGISTRO,
  gastoTotalMes,
  gastoPorCategoria,
  compararMeses,
  CATEGORIAS_VALIDAS,
  rotuloCategoria,
};
