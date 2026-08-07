// test/agent-grafico.test.js — cod-0048: intent `mostrar_grafico` (gráfico sob
// demanda no Agente de Perguntas).
//
// O que está sendo garantido (criterios-de-aceite da AGENDA):
//   • "me mostra o gráfico" → imagem do gráfico de categorias do MÊS ATUAL,
//     enviada pelo MESMO envio de imagem do resumo mensal (zapi.enviarImagem,
//     injetado aqui);
//   • mês sem compras → resposta de TEXTO honesta (nunca imagem quebrada);
//   • charts.js não duplicado — a URL nasce em gerarUrlGraficoCategorias;
//   • consome cota como pergunta normal (proposta da AGENDA — ratificar na
//     revisão);
//   • sem narração LLM no caminho da imagem (não há texto numérico pro modelo).

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REGISTRO, mostrarGrafico } = require('../src/agent/intents.js');
const { responderPergunta } = require('../src/agent/index.js');
const { gerarUrlGraficoCategorias } = require('../src/charts.js');

const PHONE = '5511999999999';

// ─── a intent em si ──────────────────────────────────────────────────────────

test('mostrar_grafico: está no REGISTRO, marcada como entrega de imagem e SEM parâmetro de período', () => {
  const intent = REGISTRO.find((i) => i.id === 'mostrar_grafico');
  assert.ok(intent, 'presente no REGISTRO (classificador e ajuda derivam daqui)');
  assert.equal(intent.entregaImagem, true);
  // fora-de-escopo da AGENDA: períodos arbitrários — o gráfico é do mês atual.
  assert.deepEqual(Object.keys(intent.parametros), []);
  assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length >= 3);
});

test('executar: mês sem compras → temDados:false e template de texto honesto', async () => {
  const fato = await mostrarGrafico.executar(PHONE, {}, {
    buscarGastosPorCategoria: async () => [],
  });
  assert.equal(fato.temDados, false);
  assert.equal(fato.imagemUrl, undefined, 'sem URL — nunca imagem quebrada');
  const txt = mostrarGrafico.template(fato);
  assert.ok(txt.includes('gráfico'), 'explica que não há o que desenhar');
  assert.ok(txt.includes('📸'), 'aponta o próximo passo (mandar cupom)');
});

test('executar: com gastos → imagemUrl do charts.js real (QuickChart) + legenda com o mês', async () => {
  const dados = [
    { categoria: 'carnes', total: 120.5 },
    { categoria: 'bebidas', total: 60 },
  ];
  const fato = await mostrarGrafico.executar(PHONE, {}, {
    buscarGastosPorCategoria: async () => dados,
  });
  assert.equal(fato.temDados, true);
  // Mesma função do /gastos e do resumo mensal, chamada com os mesmos dados:
  assert.equal(fato.imagemUrl, gerarUrlGraficoCategorias(dados, fato.legenda.replace('📊 Gastos por categoria — ', '')));
  assert.ok(fato.imagemUrl.startsWith('https://quickchart.io/chart'), 'URL do QuickChart');
  assert.ok(fato.legenda.startsWith('📊 Gastos por categoria — '));
  assert.equal(mostrarGrafico.template(fato), fato.legenda, 'template com dados = legenda da imagem');
});

test('executar: geração de URL injetável (deps.gerarUrlGrafico) — prova do reúso por injeção', async () => {
  const chamadas = [];
  const fato = await mostrarGrafico.executar(PHONE, {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'doces', total: 10 }],
    gerarUrlGrafico: (dados, titulo) => { chamadas.push({ dados, titulo }); return 'https://exemplo/x.png'; },
  });
  assert.equal(fato.imagemUrl, 'https://exemplo/x.png');
  assert.equal(chamadas.length, 1);
});

test('executar: gerador devolvendo null → temDados:false (defesa contra imagem quebrada)', async () => {
  const fato = await mostrarGrafico.executar(PHONE, {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'doces', total: 10 }],
    gerarUrlGrafico: () => null,
  });
  assert.equal(fato.temDados, false);
});

test('charts.js não duplicado: intents.js importa ../charts e não contém a URL do QuickChart', () => {
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'agent', 'intents.js'), 'utf8');
  assert.ok(fonte.includes("require('../charts')"), 'reusa o módulo do gráfico');
  assert.ok(!fonte.includes('quickchart.io'), 'nenhuma lógica de gráfico copiada');
});

// ─── orquestrador: entrega da imagem ─────────────────────────────────────────

function depsBase(extra = {}) {
  const estado = {
    mensagens: [],
    imagens: [],
    incrementos: 0,
    respostasRender: 0,
  };
  const deps = {
    verificarLimitePerguntas: async () => ({ usadas: 0, limite: 30 }),
    incrementarPerguntas: async () => { estado.incrementos += 1; return 1; },
    registrarPergunta: async () => {},
    enviarMensagem: async (phone, texto) => { estado.mensagens.push({ phone, texto }); },
    enviarImagem: async (phone, url, caption) => { estado.imagens.push({ phone, url, caption }); },
    classificar: async () => ({ intent: 'mostrar_grafico', params: {}, confianca: 'alta' }),
    responder: async (fato, def) => {
      estado.respostasRender += 1;
      return { texto: def.template(fato), modoUsado: 'template', fidelidadeOk: null, caiuNoAirbag: false };
    },
    modo: 'template',
    ...extra,
  };
  return { deps, estado };
}

test('orquestrador: "me mostra o gráfico" com dados → enviarImagem(url, legenda), sem passar pelo render', async () => {
  const { deps, estado } = depsBase({
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
  });
  // O executor real resolve deps via argumento do intent — injetamos pelo registro:
  deps.registro = [{
    ...require('../src/agent/intents.js').mostrarGrafico,
    executar: (phone, params) =>
      require('../src/agent/intents.js').mostrarGrafico.executar(phone, params, {
        buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
      }),
  }];

  const r = await responderPergunta(PHONE, 'me mostra o gráfico', deps);

  assert.equal(r.respondeu, true);
  assert.equal(r.modoUsado, 'imagem');
  assert.equal(estado.imagens.length, 1, 'exatamente 1 imagem enviada');
  assert.ok(estado.imagens[0].url.startsWith('https://quickchart.io/chart'));
  assert.ok(estado.imagens[0].caption.startsWith('📊 Gastos por categoria — '));
  assert.equal(estado.respostasRender, 0, 'sem narração LLM no caminho da imagem');
  assert.equal(estado.mensagens.length, 0, 'nenhum texto redundante junto da imagem');
  assert.equal(estado.incrementos, 1, 'consome cota como pergunta normal (proposta AGENDA)');
});

test('orquestrador: mês sem compras → texto honesto pelo caminho normal, sem imagem', async () => {
  const { deps, estado } = depsBase();
  deps.registro = [{
    ...require('../src/agent/intents.js').mostrarGrafico,
    executar: (phone, params) =>
      require('../src/agent/intents.js').mostrarGrafico.executar(phone, params, {
        buscarGastosPorCategoria: async () => [],
      }),
  }];

  const r = await responderPergunta(PHONE, 'me mostra o gráfico', deps);

  assert.equal(r.respondeu, true);
  assert.equal(estado.imagens.length, 0, 'nunca imagem quebrada');
  assert.equal(estado.mensagens.length, 1, 'resposta de texto honesta');
  assert.ok(estado.mensagens[0].texto.includes('gráfico'));
  assert.equal(estado.respostasRender, 1, 'estado-vazio segue o caminho de texto');
});

test('orquestrador: falha no envio da imagem → resposta neutra de erro (Desenho §9), cota intacta', async () => {
  const { deps, estado } = depsBase({
    enviarImagem: async () => { throw new Error('z-api fora do ar'); },
  });
  deps.registro = [{
    ...require('../src/agent/intents.js').mostrarGrafico,
    executar: (phone, params) =>
      require('../src/agent/intents.js').mostrarGrafico.executar(phone, params, {
        buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
      }),
  }];

  const r = await responderPergunta(PHONE, 'me mostra o gráfico', deps);

  assert.equal(r.respondeu, false);
  assert.equal(r.motivo, 'erro_tecnico');
  assert.equal(estado.incrementos, 0, 'cota não cobra o que não foi entregue');
  assert.equal(estado.mensagens.length, 1, 'resposta neutra enviada');
  assert.ok(!/\d/.test(estado.mensagens[0].texto.replace(/\/\w+/g, '')), 'nunca número chutado no erro');
});
