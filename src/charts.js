// Gera URLs do QuickChart.io para envio de gráficos via WhatsApp
// Documentação: https://quickchart.io/documentation/

const LABELS_PT = {
  carnes:     'Carnes e Aves',
  hortifruti: 'Hortifruti',
  laticinios: 'Laticínios',
  padaria:    'Padaria',
  bebidas:    'Bebidas',
  limpeza:    'Limpeza',
  mercearia:  'Mercearia',
  congelados: 'Congelados',
  doces:      'Doces e Petiscos',
  outros:     'Outros',
  nao_mercado:'Outros (não-mercado)',
  nao_identificado: 'Não identificado',
};

const CORES = {
  carnes:     '#EF4444',
  hortifruti: '#22C55E',
  laticinios: '#3B82F6',
  padaria:    '#F59E0B',
  bebidas:    '#8B5CF6',
  limpeza:    '#06B6D4',
  mercearia:  '#F97316',
  congelados: '#64748B',
  doces:      '#EC4899',
  outros:     '#94A3B8',
  nao_mercado:'#475569',
  nao_identificado: '#CBD5E1',
};

function brl(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Gera URL do QuickChart para gráfico de BARRAS HORIZONTAIS de gastos por categoria.
 *
 * Barras ordenadas do maior pro menor gasto, cada uma com a cor da categoria,
 * e o valor em R$ + percentual impressos no fim da barra. A altura cresce conforme
 * o número de categorias para nunca ficar apertado.
 *
 * @param {Array<{categoria: string, total: number}>} dados - Lista de categorias com total
 * @param {string} titulo - Ex: "Maio/2026"
 * @returns {string} URL da imagem PNG (GET, sem auth)
 */
function gerarUrlGraficoCategorias(dados, titulo) {
  if (!dados || dados.length === 0) return null;

  const sorted = [...dados].sort((a, b) => b.total - a.total);
  const totalGeral = sorted.reduce((s, d) => s + d.total, 0) || 1;

  const labels = sorted.map(d => LABELS_PT[d.categoria] || d.categoria);
  const values = sorted.map(d => Math.round(d.total * 100) / 100);
  const colors = sorted.map(d => CORES[d.categoria] || CORES.outros);

  // Texto no fim de cada barra: "R$ 123,45 · 32%"
  const rotulos = sorted.map(d => {
    const pct = Math.round((d.total / totalGeral) * 100);
    return `R$ ${brl(d.total)}  ·  ${pct}%`;
  });

  // Altura proporcional ao nº de categorias (+ espaço de título)
  const altura = Math.max(280, 110 + sorted.length * 52);

  const config = {
    type: 'horizontalBar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        barPercentage: 0.74,
        categoryPercentage: 0.86,
        minBarLength: 4,
      }],
    },
    options: {
      layout: { padding: { left: 10, right: 120, top: 6, bottom: 6 } },
      title: {
        display: true,
        text: [`Gastos por categoria — ${titulo}`, `Total: R$ ${brl(totalGeral)}`],
        fontSize: 17,
        fontColor: '#111827',
        fontStyle: 'bold',
        padding: 16,
        lineHeight: 1.3,
      },
      legend: { display: false },
      scales: {
        xAxes: [{
          display: false,
          ticks: { beginAtZero: true },
          gridLines: { display: false, drawBorder: false },
        }],
        yAxes: [{
          ticks: { fontSize: 13, fontColor: '#374151', fontStyle: 'bold', padding: 6 },
          gridLines: { display: false, drawBorder: false },
        }],
      },
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'right',
          clamp: true,
          clip: false,
          color: '#4B5563',
          font: { size: 12.5, weight: 'bold' },
          formatter: '__FORMATTER__',
        },
      },
    },
  };

  // Injeta a função formatter (não serializável em JSON) via placeholder.
  const fn = `function(value, ctx) { return ${JSON.stringify(rotulos)}[ctx.dataIndex]; }`;
  const configStr = JSON.stringify(config).replace('"__FORMATTER__"', fn);

  const encoded = encodeURIComponent(configStr);
  return `https://quickchart.io/chart?v=2&c=${encoded}&w=560&h=${altura}&bkg=white&f=png`;
}

module.exports = { gerarUrlGraficoCategorias, LABELS_PT, CORES };
