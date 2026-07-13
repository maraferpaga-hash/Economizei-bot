// Testes do formatter.js — SOMENTE mensagens não-financeiras (cod-0022).
// Fora de escopo (firewall/humano): qualquer mensagem do caminho do dinheiro
// (planos, cobrança, pagamento) — ver AGENDA.md, zona proibida.
// Runner: node:test (modelo test/insights.test.js).

const { test } = require('node:test');
const assert = require('node:assert');

const {
  montarMensagemGastos,
  montarMensagemInflacao,
  montarMensagemEconomia,
  montarMensagemCortar,
  montarMensagemComparativo,
  montarMensagemAlerta,
} = require('../src/formatter');

// ---------------------------------------------------------------
// montarMensagemGastos
// ---------------------------------------------------------------

test('gastos: estado vazio é honesto e convida a mandar cupom', () => {
  for (const vazio of [null, undefined, []]) {
    const msg = montarMensagemGastos(vazio, '2026-07');
    assert.match(msg, /Ainda não tenho dados/);
    assert.match(msg, /cupons/i);
    assert.ok(!msg.includes('R$'), 'estado vazio não deve inventar número');
  }
});

test('gastos: lista categorias com label, valor e %, e fecha com o total', () => {
  const dados = [
    { categoria: 'carnes', total: 150 },
    { categoria: 'doces', total: 50 },
  ];
  const msg = montarMensagemGastos(dados, '2026-07');
  assert.match(msg, /Julho\/2026/);
  assert.match(msg, /1\. Carnes e Aves: \*R\$ 150,00\* \(75%\)/);
  assert.match(msg, /2\. Doces e Petiscos: \*R\$ 50,00\* \(25%\)/);
  assert.match(msg, /Total: R\$ 200,00/);
});

test('gastos: categoria desconhecida usa o próprio nome como label', () => {
  const msg = montarMensagemGastos([{ categoria: 'inexistente', total: 10 }], '2026-01');
  assert.match(msg, /inexistente: \*R\$ 10,00\* \(100%\)/);
});

test('gastos: mês inválido degrada pra "esse mês" sem quebrar', () => {
  const msg = montarMensagemGastos([{ categoria: 'outros', total: 5 }], 'lixo');
  assert.match(msg, /esse mês/);
});

test('gastos: sem análise (ou sem conclusão) não mostra bloco de conclusão', () => {
  const dados = [{ categoria: 'carnes', total: 100 }];
  const semAnalise = montarMensagemGastos(dados, '2026-07');
  const semConclusao = montarMensagemGastos(dados, '2026-07', { temConclusao: false });
  assert.ok(!semAnalise.includes('maior gasto'));
  assert.strictEqual(semAnalise, semConclusao);
});

test('gastos: análise com conclusão mostra top da lista e comparativo com a média', () => {
  const analise = {
    temConclusao: true,
    top: { categoria: 'carnes', pct: 40 },
    comparativo: 'acima',
    candidatoCorte: { categoria: 'doces', valor: 52.4 },
    mesesHistorico: 3,
  };
  const msg = montarMensagemGastos([{ categoria: 'carnes', total: 100 }], '2026-07', analise);
  assert.match(msg, /\*Carnes e Aves\* foi seu maior gasto \(40% do mês, acima da sua média\)/);
  assert.match(msg, /\*Doces e Petiscos\* \(R\$ 52,40\)/);
});

test('gastos: primeiro mês (sem histórico e sem corte) promete a comparação futura', () => {
  const analise = {
    temConclusao: true,
    top: { categoria: 'carnes', pct: 40 },
    comparativo: 'sem_historico',
    candidatoCorte: null,
    mesesHistorico: 0,
  };
  const msg = montarMensagemGastos([{ categoria: 'carnes', total: 100 }], '2026-07', analise);
  assert.match(msg, /No mês que vem eu já comparo com sua média/);
});

// ---------------------------------------------------------------
// montarMensagemInflacao
// ---------------------------------------------------------------

test('inflacao: sem dados suficientes responde estado vazio honesto, sem número', () => {
  for (const vazio of [null, { temDados: false }]) {
    const msg = montarMensagemInflacao(vazio);
    assert.match(msg, /Ainda não tenho preços repetidos suficientes/);
    assert.ok(!msg.includes('R$'), 'estado vazio não deve inventar número');
  }
});

test('inflacao: mostra itens que subiram e caíram com preço antigo → novo e %', () => {
  const analise = {
    temDados: true,
    subiram: [{ nome: 'arroz 5kg', precoAntigo: 20, precoNovo: 25, variacaoPct: 25 }],
    cairam: [{ nome: 'feijão', precoAntigo: 10, precoNovo: 9, variacaoPct: -10 }],
  };
  const msg = montarMensagemInflacao(analise);
  assert.match(msg, /\*Subiram de preço:\*/);
  assert.match(msg, /Arroz 5kg: R\$ 20,00 → R\$ 25,00 \(\+25%\)/);
  assert.match(msg, /\*Caíram de preço:\*/);
  assert.match(msg, /Feijão: R\$ 10,00 → R\$ 9,00 \(-10%\)/);
});

test('inflacao: limita a 4 itens que subiram e 2 que caíram', () => {
  const mk = (n, pct) => ({ nome: `item${n}`, precoAntigo: 1, precoNovo: 2, variacaoPct: pct });
  const analise = {
    temDados: true,
    subiram: [mk(1, 10), mk(2, 10), mk(3, 10), mk(4, 10), mk(5, 10)],
    cairam: [mk(6, -10), mk(7, -10), mk(8, -10)],
  };
  const msg = montarMensagemInflacao(analise);
  assert.ok(msg.includes('Item4') && !msg.includes('Item5'), 'corta subiram em 4');
  assert.ok(msg.includes('Item7') && !msg.includes('Item8'), 'corta cairam em 2');
});

test('inflacao: só quedas também funciona (sem seção "Subiram")', () => {
  const analise = {
    temDados: true,
    subiram: [],
    cairam: [{ nome: 'leite', precoAntigo: 6, precoNovo: 5, variacaoPct: -17 }],
  };
  const msg = montarMensagemInflacao(analise);
  assert.ok(!msg.includes('Subiram'));
  assert.match(msg, /Leite: R\$ 6,00 → R\$ 5,00/);
});

// ---------------------------------------------------------------
// montarMensagemEconomia
// ---------------------------------------------------------------

test('economia: sem dados pede pelo menos dois meses, sem número', () => {
  for (const vazio of [null, { temDados: false }]) {
    const msg = montarMensagemEconomia(vazio);
    assert.match(msg, /pelo menos dois meses/);
    assert.ok(!msg.includes('R$'));
  }
});

test('economia: mês abaixo da média abre com a boa notícia e o valor no topo', () => {
  const msg = montarMensagemEconomia({ temDados: true, economiaMes: 80.5, economiaAno: 200, mediaRef: 500 });
  assert.match(msg, /^💚 \*Boa notícia!\*/);
  assert.match(msg, /R\$ 80,50 abaixo\* da sua média de mercado \(R\$ 500,00 por mês\)/);
  assert.match(msg, /R\$ 200,00\* que ficaram no seu bolso/);
});

test('economia: mês acima da média fala do valor a mais sem tom de bronca', () => {
  const msg = montarMensagemEconomia({ temDados: true, economiaMes: -50, economiaAno: 0, mediaRef: 400 });
  assert.match(msg, /R\$ 50,00 a mais que sua média/);
  assert.match(msg, /o que conta é a tendência/);
  assert.ok(!msg.includes('no seu bolso'), 'economiaAno=0 não mostra linha do ano');
});

test('economia: mês acima mas com economia no ano reforça o acumulado', () => {
  const msg = montarMensagemEconomia({ temDados: true, economiaMes: -50, economiaAno: 120, mediaRef: 400 });
  assert.match(msg, /no ano você já economizou \*R\$ 120,00\*/);
});

test('economia: praticamente em linha com a média (zona morta de ±R$0,005)', () => {
  const msg = montarMensagemEconomia({ temDados: true, economiaMes: 0.001, economiaAno: 0, mediaRef: 300 });
  assert.match(msg, /bem em linha com sua média/);
  assert.match(msg, /R\$ 300,00 por mês/);
});

// ---------------------------------------------------------------
// montarMensagemCortar
// ---------------------------------------------------------------

test('cortar: sem sugestão responde estado vazio honesto', () => {
  for (const vazio of [null, { temSugestao: false }]) {
    const msg = montarMensagemCortar(vazio);
    assert.match(msg, /não encontrei categorias discricionárias/);
    assert.ok(!msg.includes('R$'));
  }
});

test('cortar: lista sugestões com valor, % e comparação com a média histórica', () => {
  const analise = {
    temSugestao: true,
    sugestoes: [
      { categoria: 'doces', valor: 60, pct: 12, acimaDaMedia: true, mediaValorHist: 40 },
      { categoria: 'bebidas', valor: 45, pct: 9, acimaDaMedia: false, mediaValorHist: 44 },
    ],
  };
  const msg = montarMensagemCortar(analise);
  assert.match(msg, /\*Doces e Petiscos\*: R\$ 60,00 \(12% do mês\)/);
  assert.match(msg, /Acima da sua média de R\$ 40,00\/mês/);
  assert.match(msg, /\*Bebidas\*: R\$ 45,00 \(9% do mês\)/);
  assert.match(msg, /Em linha com sua média de R\$ 44,00\/mês/);
});

test('cortar: sem média histórica não mostra linha de comparação', () => {
  const analise = {
    temSugestao: true,
    sugestoes: [{ categoria: 'doces', valor: 30, pct: 8, acimaDaMedia: null, mediaValorHist: null }],
  };
  const msg = montarMensagemCortar(analise);
  assert.match(msg, /\*Doces e Petiscos\*: R\$ 30,00 \(8% do mês\)/);
  assert.ok(!msg.includes('média de R$'));
});

// ---------------------------------------------------------------
// montarMensagemAlerta (3 níveis)
// ---------------------------------------------------------------

test('alerta acima: % no topo, média formatada e saída pelo /historico', () => {
  const msg = montarMensagemAlerta({ nivel: 'acima', percentual: 22.4, media: 250 });
  assert.match(msg, /^📈 \*22% acima da sua média\* \(R\$ 250,00\/compra\)/);
  assert.match(msg, /\/historico/);
});

test('alerta abaixo: % absoluto (sem sinal) e tom de elogio', () => {
  const msg = montarMensagemAlerta({ nivel: 'abaixo', percentual: -18, media: 250 });
  assert.match(msg, /^📉 \*18% abaixo da sua média\* \(R\$ 250,00\/compra\)/);
  assert.match(msg, /Economia/);
  assert.ok(!msg.includes('-18'), 'nunca mostra percentual com sinal negativo');
});

test('alerta normal: tranquiliza sem citar percentual', () => {
  const msg = montarMensagemAlerta({ nivel: 'normal', percentual: 3, media: 250 });
  assert.match(msg, /Dentro do seu padrão/);
  assert.match(msg, /R\$ 250,00\/compra/);
  assert.ok(!msg.includes('%'));
});

test('alerta: avaliação ausente não lança exceção (degradação segura)', () => {
  assert.doesNotThrow(() => montarMensagemAlerta(null));
  assert.doesNotThrow(() => montarMensagemAlerta(undefined));
});

// ---------------------------------------------------------------
// montarMensagemComparativo
// ---------------------------------------------------------------

test('comparativo: sem dados responde estado vazio honesto, sem número chutado', () => {
  const casos = [null, { temComparativo: false, comparativos: [] }, { temComparativo: true, comparativos: [] }];
  for (const vazio of casos) {
    const msg = montarMensagemComparativo(vazio);
    assert.match(msg, /Ainda não encontrei o mesmo produto/);
    assert.ok(!msg.includes('R$'));
  }
});

function _comparativoBase(extra = {}) {
  return {
    temComparativo: true,
    janelaDias: 30,
    temMais: false,
    comparativos: [{
      produto: 'arroz 5kg',
      menor: { loja: 'Mercado A', preco: 20 },
      maior: { loja: 'Mercado B', preco: 26 },
      economia: 6,
      economiaPct: 23,
      posicaoUsuario: null,
      precoUsuario: null,
      economiaUsuario: null,
      ...extra,
    }],
  };
}

test('comparativo: mostra menor/maior preço, diferença e a janela de dias', () => {
  const msg = montarMensagemComparativo(_comparativoBase());
  assert.match(msg, /\*Arroz 5kg\*/);
  assert.match(msg, /Mais barato: Mercado A — R\$ 20,00/);
  assert.match(msg, /Mais caro: Mercado B — R\$ 26,00/);
  assert.match(msg, /Diferença: R\$ 6,00 \(23%\)/);
  assert.match(msg, /últimos 30 dias/);
});

test('comparativo: usuário que já comprou no mais barato recebe o elogio', () => {
  const msg = montarMensagemComparativo(_comparativoBase({ posicaoUsuario: 'mais_barato' }));
  assert.match(msg, /Você já comprou no mais barato/);
  assert.ok(!msg.includes('dava pra economizar'));
});

test('comparativo: usuário que pagou mais caro vê quanto dava pra economizar', () => {
  const msg = montarMensagemComparativo(_comparativoBase({
    posicaoUsuario: 'mais_caro', precoUsuario: 26, economiaUsuario: 6,
  }));
  assert.match(msg, /Você pagou R\$ 26,00 — dava pra economizar R\$ 6,00 no Mercado A/);
});

test('comparativo: com mais itens que o teto avisa quantos está mostrando', () => {
  const dados = _comparativoBase();
  dados.temMais = true;
  dados.mostrados = 3;
  dados.totalComparaveis = 8;
  const msg = montarMensagemComparativo(dados);
  assert.match(msg, /Mostrando os 3 com maior diferença, de 8 no total/);
});
