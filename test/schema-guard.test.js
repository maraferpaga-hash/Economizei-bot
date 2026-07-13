// test/schema-guard.test.js — cobre a guarda de schema no boot (cod-0050).
//
// A guarda é 100% injetável (cliente + logFn + avisar), então os testes rodam
// sem SDK do Supabase e sem rede. Regra central testada: NUNCA lançar exceção
// pro chamador — falha de checagem loga e segue.
//
// Rodar local:  node --test test/schema-guard.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  verificarSchemaCritico,
  CHECAGENS_CRITICAS,
  ehErroDeAusencia,
} = require('../src/schemaGuard.js');

// ── Fakes ────────────────────────────────────────────────────────────────────

// mapa: chave 'tabela' ou 'tabela.coluna' → objeto de erro (ou ausente = ok)
function clienteFake(mapaErros = {}) {
  return {
    from(tabela) {
      return {
        select(cols) {
          const chave = cols === '*' ? tabela : `${tabela}.${cols}`;
          return {
            limit() {
              return Promise.resolve({ data: [], error: mapaErros[chave] || null });
            },
          };
        },
      };
    },
  };
}

function clienteQueLanca() {
  return {
    from() {
      throw new Error('boom sincrono');
    },
  };
}

function coletorDeLogs() {
  const eventos = [];
  const logFn = (evento, dados) => eventos.push({ evento, dados });
  return { eventos, logFn };
}

const CHECAGENS_MINI = [
  { tabela: 'compras', coluna: 'cnpj' },
  { tabela: 'perguntas_log' },
];

// ── Lista declarativa ────────────────────────────────────────────────────────

test('CHECAGENS_CRITICAS: toda entrada tem tabela string (coluna opcional)', () => {
  assert.ok(Array.isArray(CHECAGENS_CRITICAS) && CHECAGENS_CRITICAS.length > 0);
  for (const chk of CHECAGENS_CRITICAS) {
    assert.equal(typeof chk.tabela, 'string');
    if (chk.coluna !== undefined) assert.equal(typeof chk.coluna, 'string');
  }
});

test('CHECAGENS_CRITICAS: cobre os incidentes conhecidos (A9 e migration do Agente)', () => {
  const alvos = CHECAGENS_CRITICAS.map((c) => (c.coluna ? `${c.tabela}.${c.coluna}` : c.tabela));
  assert.ok(alvos.includes('compras.cnpj'));
  assert.ok(alvos.includes('usuarios.perguntas_mes_atual'));
  assert.ok(alvos.includes('perguntas_log'));
});

// ── ehErroDeAusencia ─────────────────────────────────────────────────────────

test('ehErroDeAusencia: reconhece códigos Postgres e PostgREST', () => {
  assert.equal(ehErroDeAusencia({ code: '42703', message: 'x' }), true);
  assert.equal(ehErroDeAusencia({ code: '42P01', message: 'x' }), true);
  assert.equal(ehErroDeAusencia({ code: 'PGRST205', message: 'x' }), true);
  assert.equal(ehErroDeAusencia({ message: 'column compras.cnpj does not exist' }), true);
  assert.equal(ehErroDeAusencia({ message: "Could not find the table 'x' in the schema cache" }), true);
});

test('ehErroDeAusencia: NÃO confunde erro de rede/permissão com ausência', () => {
  assert.equal(ehErroDeAusencia(null), false);
  assert.equal(ehErroDeAusencia({ code: 'ECONNREFUSED', message: 'fetch failed' }), false);
  assert.equal(ehErroDeAusencia({ code: '42501', message: 'permission denied for table compras' }), false);
});

// ── Caminho feliz ────────────────────────────────────────────────────────────

test('tudo presente → ok:true, nada faltando, loga schema_guard_ok', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const r = await verificarSchemaCritico({ cliente: clienteFake(), checagens: CHECAGENS_MINI, logFn });
  assert.equal(r.ok, true);
  assert.deepEqual(r.faltando, []);
  assert.deepEqual(r.errosChecagem, []);
  assert.ok(eventos.some((e) => e.evento === 'schema_guard_ok'));
  assert.ok(!eventos.some((e) => e.evento === 'schema_guard_faltando'));
});

// ── Detecção de ausência ─────────────────────────────────────────────────────

test('coluna faltando (42703) → detecta, loga schema_guard_faltando + resumo', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const cliente = clienteFake({
    'compras.cnpj': { code: '42703', message: 'column compras.cnpj does not exist' },
  });
  const r = await verificarSchemaCritico({ cliente, checagens: CHECAGENS_MINI, logFn });
  assert.equal(r.ok, false);
  assert.deepEqual(r.faltando, ['compras.cnpj']);
  const faltandoLog = eventos.find((e) => e.evento === 'schema_guard_faltando');
  assert.ok(faltandoLog);
  assert.equal(faltandoLog.dados.alvo, 'compras.cnpj'); // nome exato no log
  const resumo = eventos.find((e) => e.evento === 'schema_guard_faltando_resumo');
  assert.ok(resumo);
  assert.deepEqual(resumo.dados.faltando, ['compras.cnpj']);
});

test('tabela faltando (PGRST205) → detecta pelo nome da tabela', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const cliente = clienteFake({
    perguntas_log: { code: 'PGRST205', message: "Could not find the table 'public.perguntas_log' in the schema cache" },
  });
  const r = await verificarSchemaCritico({ cliente, checagens: CHECAGENS_MINI, logFn });
  assert.equal(r.ok, false);
  assert.deepEqual(r.faltando, ['perguntas_log']);
  assert.ok(eventos.some((e) => e.evento === 'schema_guard_faltando' && e.dados.alvo === 'perguntas_log'));
});

// ── Erro de checagem ≠ ausência ──────────────────────────────────────────────

test('erro de rede → NÃO marca faltando; vai pra errosChecagem e ok segue true', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const cliente = clienteFake({
    'compras.cnpj': { code: 'ECONNREFUSED', message: 'fetch failed' },
  });
  const r = await verificarSchemaCritico({ cliente, checagens: CHECAGENS_MINI, logFn });
  assert.equal(r.ok, true);
  assert.deepEqual(r.faltando, []);
  assert.deepEqual(r.errosChecagem, ['compras.cnpj']);
  assert.ok(eventos.some((e) => e.evento === 'schema_guard_erro' && e.dados.alvo === 'compras.cnpj'));
  assert.ok(!eventos.some((e) => e.evento === 'schema_guard_faltando'));
});

// ── Nunca derruba o boot ─────────────────────────────────────────────────────

test('cliente que LANÇA exceção → capturada, loga e retorna (nunca propaga)', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const r = await verificarSchemaCritico({ cliente: clienteQueLanca(), checagens: CHECAGENS_MINI, logFn });
  assert.equal(r.ok, true); // exceção não é prova de ausência
  assert.equal(r.errosChecagem.length, CHECAGENS_MINI.length);
  assert.ok(eventos.filter((e) => e.evento === 'schema_guard_erro').length >= 2);
});

test('logFn que lança em UMA checagem não interrompe o resto', async () => {
  // ok em tudo, mas o logFn explode no schema_guard_ok final — deve propagar?
  // Não: o contrato é do chamador (index.js já embrulha em .catch), mas o loop
  // de checagens em si nunca deve morrer por causa de uma checagem individual.
  const cliente = clienteFake({
    'compras.cnpj': { code: '42703', message: 'does not exist' },
  });
  let chamadas = 0;
  const logFn = () => {
    chamadas += 1;
    if (chamadas === 1) throw new Error('logger quebrado');
  };
  // A 1ª chamada (schema_guard_faltando) lança DENTRO do try da checagem →
  // capturada como erro da checagem; as demais seguem.
  const r = await verificarSchemaCritico({ cliente, checagens: CHECAGENS_MINI, logFn });
  assert.ok(r); // chegou ao fim sem exceção
});

// ── Aviso opcional ───────────────────────────────────────────────────────────

test('avisar: chamado UMA vez com a lista exata quando falta algo', async () => {
  const { logFn } = coletorDeLogs();
  const cliente = clienteFake({
    'compras.cnpj': { code: '42703', message: 'does not exist' },
  });
  const chamadas = [];
  await verificarSchemaCritico({
    cliente,
    checagens: CHECAGENS_MINI,
    logFn,
    avisar: (faltando) => chamadas.push(faltando),
  });
  assert.equal(chamadas.length, 1);
  assert.deepEqual(chamadas[0], ['compras.cnpj']);
});

test('avisar: NÃO é chamado quando está tudo presente', async () => {
  const { logFn } = coletorDeLogs();
  let chamado = false;
  await verificarSchemaCritico({
    cliente: clienteFake(),
    checagens: CHECAGENS_MINI,
    logFn,
    avisar: () => { chamado = true; },
  });
  assert.equal(chamado, false);
});

test('avisar que lança → capturado, loga schema_guard_erro e não propaga', async () => {
  const { eventos, logFn } = coletorDeLogs();
  const cliente = clienteFake({
    'compras.cnpj': { code: '42703', message: 'does not exist' },
  });
  const r = await verificarSchemaCritico({
    cliente,
    checagens: CHECAGENS_MINI,
    logFn,
    avisar: () => { throw new Error('zapi fora do ar'); },
  });
  assert.equal(r.ok, false);
  assert.ok(eventos.some((e) => e.evento === 'schema_guard_erro' && e.dados.etapa === 'aviso_admin'));
});
