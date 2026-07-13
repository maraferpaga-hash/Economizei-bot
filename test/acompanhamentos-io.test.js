// test/acompanhamentos-io.test.js — camada de persistência dos acompanhamentos (cod-0031)
//
// Critérios de aceite da AGENDA:
//   • buscarAcompanhamentos (só ativos), salvarAcompanhamento (upsert pela UNIQUE),
//     desativarAcompanhamento, setCategoriasSuperfluas, buscarCategoriasSuperfluas
//     (fallback pro baseline ['doces','bebidas'] quando NULL)
//   • degradação segura: erro de leitura → vazio/baseline, nunca derruba o fluxo
//   • Supabase MOCKADO via injeção de `cliente` — nunca o SDK real
//
// Rodar: node --test

'use strict';

// O módulo cria o client no require — env dummy só pra carga (nenhuma chamada
// de rede acontece: todos os testes injetam um cliente fake).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  buscarAcompanhamentos,
  salvarAcompanhamento,
  desativarAcompanhamento,
  setCategoriasSuperfluas,
  buscarCategoriasSuperfluas,
  CATEGORIAS_SUPERFLUAS_BASELINE,
} = require('../src/supabase.js');

// ── Cliente fake (builder encadeável e thenable, como o do supabase-js) ─────
function criarClienteFake(resposta) {
  const chamadas = [];
  const builder = {
    from(tabela)      { chamadas.push(['from', tabela]); return builder; },
    select(cols)      { chamadas.push(['select', cols]); return builder; },
    eq(col, val)      { chamadas.push(['eq', col, val]); return builder; },
    update(obj)       { chamadas.push(['update', obj]); return builder; },
    upsert(obj, opts) { chamadas.push(['upsert', obj, opts]); return builder; },
    single()          { chamadas.push(['single']); return builder; },
    // thenable: `await builder` resolve na resposta configurada
    then(res, rej)    { return Promise.resolve(resposta).then(res, rej); },
  };
  return { cliente: builder, chamadas };
}

function acharChamada(chamadas, nome) {
  return chamadas.filter(([n]) => n === nome);
}

// ── buscarAcompanhamentos ────────────────────────────────────────────────────

test('buscarAcompanhamentos: devolve as linhas e filtra ativo=true', async () => {
  const linhas = [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', rotulo: 'cerveja', limite_mensal: null, superfluo: false, alertado_em: null }];
  const { cliente, chamadas } = criarClienteFake({ data: linhas, error: null });

  const r = await buscarAcompanhamentos('5517999990000', cliente);

  assert.deepEqual(r, linhas);
  assert.deepEqual(acharChamada(chamadas, 'from')[0], ['from', 'acompanhamentos']);
  const eqs = acharChamada(chamadas, 'eq');
  assert.ok(eqs.some(([, col, val]) => col === 'ativo' && val === true), 'deve filtrar só ativos');
  assert.ok(eqs.some(([, col, val]) => col === 'phone_number' && val === '5517999990000'));
});

test('buscarAcompanhamentos: data null → [] (nunca undefined)', async () => {
  const { cliente } = criarClienteFake({ data: null, error: null });
  assert.deepEqual(await buscarAcompanhamentos('551700000000', cliente), []);
});

test('buscarAcompanhamentos: erro do banco → [] sem lançar (degradação segura)', async () => {
  const { cliente } = criarClienteFake({ data: null, error: new Error('boom') });
  assert.deepEqual(await buscarAcompanhamentos('551700000000', cliente), []);
});

// ── salvarAcompanhamento ─────────────────────────────────────────────────────

test('salvarAcompanhamento: upsert pela UNIQUE (phone_number,tipo_alvo,alvo), ativo=true', async () => {
  const gravada = { id: 7, tipo_alvo: 'categoria', alvo: 'doces' };
  const { cliente, chamadas } = criarClienteFake({ data: gravada, error: null });

  const r = await salvarAcompanhamento('5517999990000', { tipo_alvo: 'categoria', alvo: 'doces' }, cliente);

  assert.deepEqual(r, gravada);
  const [up] = acharChamada(chamadas, 'upsert');
  assert.ok(up, 'deve usar upsert');
  const [, linha, opts] = up;
  assert.equal(opts.onConflict, 'phone_number,tipo_alvo,alvo');
  assert.equal(linha.ativo, true, 'salvar (re)ativa o alvo');
  assert.equal(linha.rotulo, 'doces', 'rótulo default = o próprio alvo');
  assert.equal(linha.limite_mensal, null);
  assert.equal(linha.superfluo, false);
});

test('salvarAcompanhamento: respeita rotulo/limite_mensal/superfluo explícitos', async () => {
  const { cliente, chamadas } = criarClienteFake({ data: { id: 8 }, error: null });

  await salvarAcompanhamento('5517999990000', {
    tipo_alvo: 'termo', alvo: 'heineken', rotulo: 'Heineken', limite_mensal: 80, superfluo: true,
  }, cliente);

  const [, linha] = acharChamada(chamadas, 'upsert')[0];
  assert.equal(linha.rotulo, 'Heineken');
  assert.equal(linha.limite_mensal, 80);
  assert.equal(linha.superfluo, true);
});

test('salvarAcompanhamento: sem tipo_alvo/alvo → null (validação, nunca lança)', async () => {
  const { cliente } = criarClienteFake({ data: null, error: null });
  assert.equal(await salvarAcompanhamento('551700000000', { alvo: 'cerveja' }, cliente), null);
  assert.equal(await salvarAcompanhamento('551700000000', {}, cliente), null);
  assert.equal(await salvarAcompanhamento('551700000000', null, cliente), null);
});

test('salvarAcompanhamento: erro do banco → null sem lançar', async () => {
  const { cliente } = criarClienteFake({ data: null, error: new Error('boom') });
  const r = await salvarAcompanhamento('551700000000', { tipo_alvo: 'termo', alvo: 'x' }, cliente);
  assert.equal(r, null);
});

// ── desativarAcompanhamento ──────────────────────────────────────────────────

test('desativarAcompanhamento: update ativo=false filtrando phone+alvo → true', async () => {
  const { cliente, chamadas } = criarClienteFake({ data: null, error: null });

  const r = await desativarAcompanhamento('5517999990000', 'cerveja', cliente);

  assert.equal(r, true);
  const [, obj] = acharChamada(chamadas, 'update')[0];
  assert.deepEqual(obj, { ativo: false });
  const eqs = acharChamada(chamadas, 'eq');
  assert.ok(eqs.some(([, c, v]) => c === 'alvo' && v === 'cerveja'));
  assert.ok(eqs.some(([, c, v]) => c === 'phone_number' && v === '5517999990000'));
});

test('desativarAcompanhamento: erro do banco → false sem lançar', async () => {
  const { cliente } = criarClienteFake({ data: null, error: new Error('boom') });
  assert.equal(await desativarAcompanhamento('551700000000', 'cerveja', cliente), false);
});

// ── setCategoriasSuperfluas ──────────────────────────────────────────────────

test('setCategoriasSuperfluas: grava o array na tabela usuarios → true', async () => {
  const { cliente, chamadas } = criarClienteFake({ data: null, error: null });

  const r = await setCategoriasSuperfluas('5517999990000', ['doces', 'bebidas', 'congelados'], cliente);

  assert.equal(r, true);
  assert.deepEqual(acharChamada(chamadas, 'from')[0], ['from', 'usuarios']);
  const [, obj] = acharChamada(chamadas, 'update')[0];
  assert.deepEqual(obj, { categorias_superfluas: ['doces', 'bebidas', 'congelados'] });
});

test('setCategoriasSuperfluas: array vazio/null grava NULL (volta ao baseline)', async () => {
  const { cliente, chamadas } = criarClienteFake({ data: null, error: null });
  await setCategoriasSuperfluas('551700000000', [], cliente);
  const [, obj] = acharChamada(chamadas, 'update')[0];
  assert.deepEqual(obj, { categorias_superfluas: null });
});

test('setCategoriasSuperfluas: erro do banco → false sem lançar', async () => {
  const { cliente } = criarClienteFake({ data: null, error: new Error('boom') });
  assert.equal(await setCategoriasSuperfluas('551700000000', ['doces'], cliente), false);
});

// ── buscarCategoriasSuperfluas ───────────────────────────────────────────────

test('buscarCategoriasSuperfluas: NULL no banco → baseline doces+bebidas', async () => {
  const { cliente } = criarClienteFake({ data: { categorias_superfluas: null }, error: null });
  assert.deepEqual(await buscarCategoriasSuperfluas('551700000000', cliente), ['doces', 'bebidas']);
});

test('buscarCategoriasSuperfluas: array configurado → devolve o configurado', async () => {
  const { cliente } = criarClienteFake({ data: { categorias_superfluas: ['congelados'] }, error: null });
  assert.deepEqual(await buscarCategoriasSuperfluas('551700000000', cliente), ['congelados']);
});

test('buscarCategoriasSuperfluas: array vazio → baseline (config vazia não é config)', async () => {
  const { cliente } = criarClienteFake({ data: { categorias_superfluas: [] }, error: null });
  assert.deepEqual(await buscarCategoriasSuperfluas('551700000000', cliente), ['doces', 'bebidas']);
});

test('buscarCategoriasSuperfluas: erro do banco → baseline sem lançar (degradação segura)', async () => {
  const { cliente } = criarClienteFake({ data: null, error: new Error('boom') });
  assert.deepEqual(await buscarCategoriasSuperfluas('551700000000', cliente), ['doces', 'bebidas']);
});

test('buscarCategoriasSuperfluas: devolve CÓPIA do baseline (mutação não vaza)', async () => {
  const { cliente } = criarClienteFake({ data: { categorias_superfluas: null }, error: null });
  const a = await buscarCategoriasSuperfluas('551700000000', cliente);
  a.push('mercearia');
  assert.deepEqual(CATEGORIAS_SUPERFLUAS_BASELINE, ['doces', 'bebidas'], 'a constante não pode ser mutada');
  const { cliente: c2 } = criarClienteFake({ data: { categorias_superfluas: null }, error: null });
  assert.deepEqual(await buscarCategoriasSuperfluas('551700000000', c2), ['doces', 'bebidas']);
});
