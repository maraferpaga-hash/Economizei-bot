// test/agent-gasto-por-termo.test.js — intent NL gasto_por_termo (cod-0034)
//
// Critérios de aceite da AGENDA:
//   • mesmos padrões da Leva 2 (fato rico via brl(), temDados honesto,
//     exemplos no registro, sem gíria)
//   • estado-vazio honesto quando o termo não casa nenhum item — NUNCA
//     número chutado
//   • reusa buscarGastoPorAlvo (cod-0030) — a soma nasce no executor, não
//     no LLM (Camadas 4/5 respeitadas)
//   • I/O sempre injetado via `deps` (nunca Supabase real); a leitura nova
//     buscarItensDoMes é testada com cliente fake (padrão cod-0031)
//
// Rodar: node --test

'use strict';

// supabase.js cria o client no require — env dummy só pra carga (nenhuma
// chamada de rede: todos os testes injetam deps/cliente fake).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { REGISTRO, gastoPorTermo } = require('../src/agent/intents.js');
const { validarClassificacao } = require('../src/agent/guards.js');
const { buscarItensDoMes } = require('../src/supabase.js');

// ── registro + guards (Camada 1) ────────────────────────────────────────────

test('gasto_por_termo: está no REGISTRO com descricao, exemplos e termo obrigatório', () => {
  const intent = REGISTRO.find((i) => i.id === 'gasto_por_termo');
  assert.ok(intent, 'presente no REGISTRO (o classificador deriva daqui)');
  assert.ok(intent.descricao && intent.descricao.length > 10);
  assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length >= 3);
  assert.equal(typeof intent.executar, 'function');
  assert.equal(typeof intent.template, 'function');
  assert.equal(intent.parametros.termo.obrigatorio, true);
});

test('guards: classificação com termo livre passa; sem termo é rejeitada (obrigatório)', () => {
  const ok = validarClassificacao(
    { intent: 'gasto_por_termo', params: { termo: 'cerveja', periodo: 'mes_atual' } },
    REGISTRO
  );
  assert.equal(ok.ok, true);

  const sem = validarClassificacao({ intent: 'gasto_por_termo', params: {} }, REGISTRO);
  assert.equal(sem.ok, false);
  assert.equal(sem.motivo, 'param_obrigatorio_ausente');
  assert.equal(sem.param, 'termo');
});

// ── executar + template ─────────────────────────────────────────────────────

// Itens de um mês sintético: 2 compras com cerveja (por nome_canonico) e
// ruído que NÃO pode casar ("uva" ≠ "luva"; "cerveja" não casa "refrigerante").
const ITENS_MES = [
  { compra_id: 1, nome: 'SKOL LT 350', nome_canonico: 'cerveja skol lata 350ml', categoria: 'bebidas', preco: 3.5, preco_total: 21.0, quantidade: 6 },
  { compra_id: 2, nome: 'BRAHMA 600', nome_canonico: 'cerveja brahma garrafa 600ml', categoria: 'bebidas', preco: 9.5, preco_total: 19.0, quantidade: 2 },
  { compra_id: 2, nome: 'LUVA BORRACHA', nome_canonico: 'luva de borracha', categoria: 'limpeza', preco: 8.0, preco_total: 8.0, quantidade: 1 },
  { compra_id: 2, nome: 'REFRI COLA 2L', nome_canonico: 'refrigerante cola 2l', categoria: 'bebidas', preco: 9.0, preco_total: 9.0, quantidade: 1 },
];

function deps(itens) {
  return { buscarItensDoMes: async () => itens };
}

test('com dados: soma via buscarGastoPorAlvo, fmt.* via brl, qtdCompras por compra_id', async () => {
  const fato = await gastoPorTermo.executar('551799', { termo: 'cerveja', periodo: '2026-07' }, deps(ITENS_MES));
  assert.equal(fato.temDados, true);
  assert.equal(fato.total, 40); // 21 + 19
  assert.equal(fato.qtdCompras, 2); // compras distintas (1 e 2)
  assert.equal(fato.fmt.total, 'R$ 40,00');
  assert.equal(fato.fmt.qtdCompras, '2');
  const txt = gastoPorTermo.template(fato);
  assert.match(txt, /R\$ 40,00/);
  assert.match(txt, /cerveja/);
  assert.match(txt, /2 compras/);
});

test('singular honesto: 1 compra → "1 compra", não "1 compras"', async () => {
  const fato = await gastoPorTermo.executar('551799', { termo: 'refrigerante' }, deps(ITENS_MES));
  assert.equal(fato.temDados, true);
  assert.equal(fato.qtdCompras, 1);
  assert.match(gastoPorTermo.template(fato), /\(1 compra\)/);
});

test('palavra inteira: "uva" NÃO casa "luva" → vazio honesto, nunca número chutado', async () => {
  const fato = await gastoPorTermo.executar('551799', { termo: 'uva' }, deps(ITENS_MES));
  assert.equal(fato.temDados, false);
  assert.equal(fato.teveGastoNoMes, true);
  const txt = gastoPorTermo.template(fato);
  assert.match(txt, /Não encontrei itens de "uva"/);
  assert.doesNotMatch(txt, /R\$/);
});

test('fallback pro nome quando nome_canonico é null', async () => {
  const itens = [
    { compra_id: 9, nome: 'racao golden 15kg', nome_canonico: null, categoria: 'outros', preco_total: 120.0, quantidade: 1 },
  ];
  const fato = await gastoPorTermo.executar('551799', { termo: 'ração' }, deps(itens));
  assert.equal(fato.temDados, true); // matching normaliza acento: "ração" casa "racao"
  assert.equal(fato.fmt.total, 'R$ 120,00');
});

test('mês sem compra nenhuma → vazio honesto DIFERENTE ("ainda não tenho gastos")', async () => {
  const fato = await gastoPorTermo.executar('551799', { termo: 'cerveja' }, deps([]));
  assert.equal(fato.temDados, false);
  assert.equal(fato.teveGastoNoMes, false);
  assert.match(gastoPorTermo.template(fato), /Ainda não tenho gastos/);
});

test('erro de leitura (null) → "não consegui consultar", NUNCA "não encontrei"', async () => {
  const fato = await gastoPorTermo.executar('551799', { termo: 'cerveja' }, deps(null));
  assert.equal(fato.temDados, false);
  assert.equal(fato.erroLeitura, true);
  const txt = gastoPorTermo.template(fato);
  assert.match(txt, /Não consegui consultar/);
  assert.doesNotMatch(txt, /Não encontrei|R\$/);
});

test('sem termo (defesa em profundidade) → pede o item, nunca quebra', async () => {
  const fato = await gastoPorTermo.executar('551799', {}, deps(ITENS_MES));
  assert.equal(fato.temDados, false);
  assert.equal(fato.semTermo, true);
  assert.match(gastoPorTermo.template(fato), /qual item/i);
});

test('copy: templates sem gíria proibida e sem citar plano/preço (intent Free na cota)', async () => {
  const comDados = await gastoPorTermo.executar('551799', { termo: 'cerveja' }, deps(ITENS_MES));
  const textos = [
    gastoPorTermo.template(comDados),
    gastoPorTermo.template({ temDados: false, semTermo: true }),
    gastoPorTermo.template({ temDados: false, erroLeitura: true, termo: 'x', mesRef: '2026-07' }),
    gastoPorTermo.template({ temDados: false, teveGastoNoMes: true, termo: 'uva', mesRef: '2026-07' }),
    gastoPorTermo.template({ temDados: false, teveGastoNoMes: false, termo: 'uva', mesRef: '2026-07' }),
  ].join(' ');
  assert.doesNotMatch(textos, /\b(cê|tá|né|ó)\b/);
  assert.doesNotMatch(textos, /[Pp]lano|9,90/);
});

// ── buscarItensDoMes (I/O com cliente fake — padrão cod-0031) ───────────────

// Fake encadeável e thenable com FILA de respostas (a função faz 2 awaits:
// compras do mês, depois itens dessas compras).
function criarClienteFake(respostas) {
  const fila = [...respostas];
  const chamadas = [];
  const builder = {
    from(t)      { chamadas.push(['from', t]); return builder; },
    select(c)    { chamadas.push(['select', c]); return builder; },
    eq(c, v)     { chamadas.push(['eq', c, v]); return builder; },
    gte(c, v)    { chamadas.push(['gte', c, v]); return builder; },
    lt(c, v)     { chamadas.push(['lt', c, v]); return builder; },
    in(c, v)     { chamadas.push(['in', c, v]); return builder; },
    then(res, rej) { return Promise.resolve(fila.shift()).then(res, rej); },
  };
  return { cliente: builder, chamadas };
}

test('buscarItensDoMes: filtra tipo=mercado + janela do mês, devolve as linhas de itens', async () => {
  const itens = [{ compra_id: 1, nome: 'SKOL', nome_canonico: 'cerveja skol lata 350ml', categoria: 'bebidas', preco: 3.5, preco_total: 21, quantidade: 6 }];
  const { cliente, chamadas } = criarClienteFake([
    { data: [{ id: 1 }], error: null },
    { data: itens, error: null },
  ]);

  const r = await buscarItensDoMes('5517999990000', '2026-07', cliente);

  assert.deepEqual(r, itens);
  assert.ok(chamadas.some(([n, t]) => n === 'from' && t === 'compras'));
  assert.ok(chamadas.some(([n, t]) => n === 'from' && t === 'itens_compra'));
  assert.ok(chamadas.some(([n, c, v]) => n === 'eq' && c === 'tipo' && v === 'mercado'), 'compras de outros tipos ficam fora');
  assert.ok(chamadas.some(([n, c, v]) => n === 'gte' && c === 'data_compra' && v === '2026-07-01'));
  assert.ok(chamadas.some(([n, c, v]) => n === 'lt' && c === 'data_compra' && v === '2026-08-01'));
  assert.ok(chamadas.some(([n, c, v]) => n === 'in' && c === 'compra_id' && v.length === 1));
});

test('buscarItensDoMes: mês sem compras → [] (estado-vazio legítimo, sem 2ª query)', async () => {
  const { cliente, chamadas } = criarClienteFake([{ data: [], error: null }]);
  assert.deepEqual(await buscarItensDoMes('551700000000', '2026-07', cliente), []);
  assert.equal(chamadas.filter(([n]) => n === 'from').length, 1);
});

test('buscarItensDoMes: virada de ano — dezembro fecha em 01/01 do ano seguinte', async () => {
  const { cliente, chamadas } = criarClienteFake([{ data: [], error: null }]);
  await buscarItensDoMes('551700000000', '2026-12', cliente);
  assert.ok(chamadas.some(([n, c, v]) => n === 'lt' && c === 'data_compra' && v === '2027-01-01'));
});

test('buscarItensDoMes: erro do banco → null (distinto de vazio), sem lançar', async () => {
  const { cliente } = criarClienteFake([{ data: null, error: new Error('boom') }]);
  assert.equal(await buscarItensDoMes('551700000000', '2026-07', cliente), null);
});
