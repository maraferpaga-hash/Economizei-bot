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
};

function brl(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Gera URL do QuickChart para gráfico de rosca de gastos por categoria.
 *
 * @param {Array<{categoria: string, total: number}>} dados - Ordenado por total desc
 * @param {string} titulo - Ex: "Maio/2026"
 * @returns {string} URL da imagem PNG (GET, sem auth)
 */
function gerarUrlGraficoCategorias(dados, titulo) {
  if (!dados || dados.length === 0) return null;

  const sorted = [...dados].sort((a, b) => b.total - a.total);
  const totalGeral = sorted.reduce((s, d) => s + d.total, 0);

  const labels = sorted.map(d => {
    const label = LABELS_PT[d.categoria] || d.categoria;
    const pct   = Math.round((d.total / totalGeral) * 100);
    return `${label} ${pct}%`;
  });

  const values = sorted.map(d => Math.round(d.total * 100) / 100);
  const colors = sorted.map(d => CORES[d.categoria] || CORES.outros);

  const config = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    },
    options: {
      title: {
        display: true,
        text: [`Gastos por categoria — ${titulo}`, `Total: R$ ${brl(totalGeral)}`],
        fontSize: 14,
        fontColor: '#1f2937',
      },
      legend: {
        position: 'bottom',
        labels: { fontSize: 11, padding: 10 },
      },
      cutoutPercentage: 38,
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(config));
  return `https://quickchart.io/chart?c=${encoded}&w=520&h=400&bkg=white&f=png`;
}

module.exports = { gerarUrlGraficoCategorias, LABELS_PT, CORES };
