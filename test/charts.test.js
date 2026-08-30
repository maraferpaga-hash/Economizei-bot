// test/charts.test.js — las-04 (Fila de lastro)
//
// `charts.js` gera a URL do QuickChart do gráfico de categorias. É um módulo
// puro (string entra, string sai) que nunca teve um teste — e que está no
// caminho de DUAS mensagens que o usuário recebe: o resumo de fim de mês
// (`monthlySummary.js`, hoje a única mensagem proativa do produto) e a intent
// `mostrar_grafico` do Agente (cod-0048).
//
// O que se testa aqui é o que quebraria em silêncio: a URL continua sendo uma
// URL válida, o config continua decodificável, a ordem/cores/rótulos continuam
// os mesmos, e — o mais importante — **os números impressos no gráfico batem
// com os dados**. Gráfico é dinheiro exibido ao usuário: número errado aqui é
// mentira bonita, não bug feio.
//
// Rodar: node --test test/charts.test.js

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { gerarUrlGraficoCategorias, LABELS_PT, CORES } = require('../src/charts.js');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — desmontam a URL de volta no que importa
// ─────────────────────────────────────────────────────────────────────────────

// O config NÃO é JSON válido de propósito: o `formatter` é injetado como função
// depois do JSON.stringify. Por isso a leitura é por regex, não por JSON.parse.
function configDaUrl(url) {
  const bruto = url.split('&c=')[1].split('&w=')[0];
  return decodeURIComponent(bruto);
}

function arrayNomeado(config, chave) {
  const m = config.match(new RegExp(`"${chave}":\\[([^\\]]*)\\]`));
  return m ? JSON.parse(`[${m[1]}]`) : null;
}

// Os rótulos das barras vivem dentro do corpo da função injetada.
function rotulosDaUrl(url) {
  const config = configDaUrl(url);
  const m = config.match(/return (\[.*\])\[ctx\.dataIndex\]/);
  return JSON.parse(m[1]);
}

function alturaDaUrl(url) {
  return Number(url.match(/&h=(\d+)/)[1]);
}

const DADOS = [
  { categoria: 'bebidas', total: 50 },
  { categoria: 'carnes', total: 100 },
  { categoria: 'padaria', total: 25 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Estados vazios — nunca gerar uma URL de gráfico sem dado
// ─────────────────────────────────────────────────────────────────────────────

test('sem dados devolve null (nunca uma URL de gráfico vazio)', () => {
  assert.equal(gerarUrlGraficoCategorias([], 'Agosto/2026'), null);
  assert.equal(gerarUrlGraficoCategorias(null, 'Agosto/2026'), null);
  assert.equal(gerarUrlGraficoCategorias(undefined, 'Agosto/2026'), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. A URL — forma e parâmetros
// ─────────────────────────────────────────────────────────────────────────────

test('URL é do QuickChart v2, PNG, fundo branco, 560px de largura', () => {
  const url = gerarUrlGraficoCategorias(DADOS, 'Agosto/2026');
  assert.ok(url.startsWith('https://quickchart.io/chart?v=2&c='), url.slice(0, 60));
  assert.ok(url.includes('&w=560'));
  assert.ok(url.includes('&bkg=white'));
  assert.ok(url.endsWith('&f=png'));
});

test('a URL é parseável e o config sobrevive ao encode/decode', () => {
  const url = gerarUrlGraficoCategorias(DADOS, 'Agosto/2026');
  assert.doesNotThrow(() => new URL(url));
  const config = configDaUrl(url);
  assert.ok(config.startsWith('{"type":"horizontalBar"'));
  // Nenhum caractere cru que quebraria a query string.
  const query = url.split('&c=')[1].split('&w=')[0];
  assert.ok(!/[{}"\s]/.test(query), 'o config precisa ir 100% percent-encoded');
});

test('altura cresce com o nº de categorias, com piso de 280px', () => {
  const uma = [{ categoria: 'carnes', total: 10 }];
  assert.equal(alturaDaUrl(gerarUrlGraficoCategorias(uma, 'X')), 280);

  const dez = Array.from({ length: 10 }, (_, i) => ({ categoria: 'outros', total: i + 1 }));
  assert.equal(alturaDaUrl(gerarUrlGraficoCategorias(dez, 'X')), 110 + 10 * 52);
  // Cresce de verdade — não é só o piso repetido.
  assert.ok(alturaDaUrl(gerarUrlGraficoCategorias(dez, 'X')) > 280);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Ordem, rótulos e cores
// ─────────────────────────────────────────────────────────────────────────────

test('barras vêm do maior gasto pro menor, sem mutar a lista recebida', () => {
  const entrada = [...DADOS];
  const url = gerarUrlGraficoCategorias(entrada, 'Agosto/2026');
  assert.deepEqual(arrayNomeado(configDaUrl(url), 'data'), [100, 50, 25]);
  assert.deepEqual(arrayNomeado(configDaUrl(url), 'labels'),
    ['Carnes e Aves', 'Bebidas', 'Padaria']);
  // O array de quem chamou continua na ordem original.
  assert.equal(entrada[0].categoria, 'bebidas');
});

test('categoria conhecida vira o rótulo em português e a cor dela', () => {
  for (const categoria of Object.keys(LABELS_PT)) {
    const url = gerarUrlGraficoCategorias([{ categoria, total: 10 }], 'X');
    const config = configDaUrl(url);
    assert.deepEqual(arrayNomeado(config, 'labels'), [LABELS_PT[categoria]], categoria);
    assert.deepEqual(arrayNomeado(config, 'backgroundColor'), [CORES[categoria]], categoria);
  }
});

test('categoria desconhecida não quebra: usa a chave crua e a cor de "outros"', () => {
  const config = configDaUrl(gerarUrlGraficoCategorias([{ categoria: 'petshop', total: 5 }], 'X'));
  assert.deepEqual(arrayNomeado(config, 'labels'), ['petshop']);
  assert.deepEqual(arrayNomeado(config, 'backgroundColor'), [CORES.outros]);
});

test('LABELS_PT e CORES cobrem exatamente as mesmas categorias', () => {
  assert.deepEqual(Object.keys(LABELS_PT).sort(), Object.keys(CORES).sort());
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Os NÚMEROS impressos — a parte que não pode mentir
// ─────────────────────────────────────────────────────────────────────────────

test('cada barra imprime o valor em pt-BR e o percentual do total', () => {
  const url = gerarUrlGraficoCategorias(DADOS, 'Agosto/2026');
  // 100/175 = 57% · 50/175 = 29% · 25/175 = 14%
  assert.deepEqual(rotulosDaUrl(url), [
    'R$ 100,00  ·  57%',
    'R$ 50,00  ·  29%',
    'R$ 25,00  ·  14%',
  ]);
});

test('valor grande usa ponto de milhar e 2 casas (pt-BR)', () => {
  const url = gerarUrlGraficoCategorias([{ categoria: 'carnes', total: 1234.5 }], 'X');
  assert.deepEqual(rotulosDaUrl(url), ['R$ 1.234,50  ·  100%']);
});

test('o cifrão do "R$" sobrevive ao replace do formatter', () => {
  // `String.replace` trata `$&`, `$\``, `$1`… como padrões especiais no texto de
  // substituição. Os rótulos são construídos com "R$ " (cifrão + espaço), que
  // não é padrão especial — mas se alguém mudar o formato pra "R$1.234" o
  // cifrão colado num dígito vira substituição e o número some do gráfico.
  const url = gerarUrlGraficoCategorias([{ categoria: 'carnes', total: 1 }], 'X');
  const config = configDaUrl(url);
  assert.ok(config.includes('R$ 1,00'), 'o valor precisa aparecer inteiro no config');
  assert.ok(!config.includes('__FORMATTER__'), 'o placeholder tem que ter sido substituído');
  assert.ok(/"formatter":function\(value, ctx\)/.test(config), 'o formatter é função, não string');
});

test('valor total no título bate com a soma das barras', () => {
  const config = configDaUrl(gerarUrlGraficoCategorias(DADOS, 'Agosto/2026'));
  assert.ok(config.includes('Gastos por categoria — Agosto/2026'));
  assert.ok(config.includes('Total: R$ 175,00'));
});

test('soma zero não vira NaN nem Infinity no percentual', () => {
  const url = gerarUrlGraficoCategorias([{ categoria: 'outros', total: 0 }], 'X');
  const rotulos = rotulosDaUrl(url);
  assert.deepEqual(rotulos, ['R$ 0,00  ·  0%']);
  assert.ok(!configDaUrl(url).includes('NaN'));
  assert.ok(!configDaUrl(url).includes('Infinity'));
});

test('valor negativo (desconto tipo "Member Pricing") não produz NaN', () => {
  // O corpus canadense tem linha negativa (cod-0065). O gráfico não é o lugar
  // de decidir o que fazer com ela — mas não pode virar NaN no meio da URL.
  const url = gerarUrlGraficoCategorias(
    [{ categoria: 'carnes', total: 10 }, { categoria: 'outros', total: -3.58 }], 'X');
  const config = configDaUrl(url);
  assert.ok(!config.includes('NaN'));
  assert.deepEqual(arrayNomeado(config, 'data'), [10, -3.58]);
  assert.ok(rotulosDaUrl(url)[1].startsWith('R$ -3,58'));
});

test('centavos são arredondados a 2 casas no dado enviado', () => {
  const config = configDaUrl(
    gerarUrlGraficoCategorias([{ categoria: 'carnes', total: 10.005999 }], 'X'));
  assert.deepEqual(arrayNomeado(config, 'data'), [10.01]);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Defeito conhecido — marcado como `todo`, NÃO reprova a suíte
// ─────────────────────────────────────────────────────────────────────────────

test('DEFEITO: mês com total zero exibe "Total: R$ 1,00" no título', { todo: true }, () => {
  // `totalGeral = soma || 1` protege a divisão do percentual, mas a MESMA
  // variável é impressa no título. Num mês de total zero o usuário lê
  // "Total: R$ 1,00" — um número que não existe. Correção é de 1 linha
  // (separar o denominador do valor exibido), mas é mudança em código de
  // produção que exibe dinheiro: fica com o Gabriel, fora do lastro.
  const config = configDaUrl(gerarUrlGraficoCategorias([{ categoria: 'outros', total: 0 }], 'X'));
  assert.ok(config.includes('Total: R$ 0,00'), config.match(/Total: R\$ [\d,.]+/)[0]);
});
