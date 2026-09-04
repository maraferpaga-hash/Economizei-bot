// test/metrics.test.js — las-04 (Fila de lastro, cobertura de testes)
//
// Cobre as 6 funcoes de `src/metrics.js`: as 4 consultas de view, o job diario
// que loga as metricas e o consolidador do endpoint /admin/metrics.
//
// Dois invariantes importam mais que os outros e estao testados de proposito:
//   1. `logarMetricasDiarias` RELANCA o erro depois de logar. O scheduler das 7h
//      depende disso pra cair no proprio catch (test/scheduler.test.js, las-05).
//   2. `buscarTodasMetricas` degrada view a view — uma view quebrada vira
//      `{ erro }` no lugar dela e as outras tres continuam respondendo.
// E um terceiro que e diagnostico de infra: o client prefere
// SUPABASE_SERVICE_ROLE_KEY e cai na anon key quando ela falta — o fallback
// silencioso que o CLAUDE.md registra como risco (S2).
//
// Nenhum I/O acontece: `@supabase/supabase-js` e `./logger` sao substituidos por
// duplos ANTES do `require` do metrics, semeando o `require.cache`. Isso e
// tecnica de teste, nao convencao de producao — `src/metrics.js` NAO e tocado
// por esta leva, e de proposito NAO usa o padrao `deps` (3o parametro), que
// segue pendente de ratificacao do Gabriel.
//
// Rodar: node --test test/metrics.test.js

'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const caminhoDe = (rel) => require.resolve(path.join(__dirname, '..', 'src', rel));
const ID_SUPABASE = require.resolve('@supabase/supabase-js');

// ── Duplo do client do Supabase ─────────────────────────────────────────────
// Registra cada consulta (tabela, colunas, limit, single) e devolve o que o
// teste configurou em `estado.respostas[tabela]`. View nao configurada devolve
// erro — assim um teste que consulte a view errada falha em vez de passar mudo.

function criarStubSupabase(estado) {
  return {
    createClient(url, chave, opcoes) {
      estado.clients.push({ url, chave, opcoes });
      return {
        from(tabela) {
          const registro = { tabela, select: null, limit: null, single: false };
          estado.consultas.push(registro);

          const resposta = () =>
            estado.respostas[tabela] ||
            { data: null, error: { message: `view ${tabela} nao configurada no teste` } };

          const encadeado = {
            select(colunas) {
              registro.select = colunas;
              return encadeado;
            },
            limit(n) {
              registro.limit = n;
              return Promise.resolve(resposta());
            },
            single() {
              registro.single = true;
              return Promise.resolve(resposta());
            },
          };
          return encadeado;
        },
      };
    },
  };
}

function novoEstado() {
  return { clients: [], consultas: [], respostas: {}, logs: [] };
}

function fingirModulo(id, exports) {
  require.cache[id] = { id, filename: id, loaded: true, exports, children: [], paths: [] };
}

// Semeia os duplos e recarrega o metrics.js pra ele enxerga-los.
// O client e criado no `require` (src/metrics.js:15), entao a env precisa
// estar posta ANTES desta chamada.
function semear(estado) {
  fingirModulo(ID_SUPABASE, criarStubSupabase(estado));
  fingirModulo(caminhoDe('logger.js'), {
    log: (evento, dados) => estado.logs.push({ evento, dados }),
    maskPhone: (p) => p,
  });
  delete require.cache[caminhoDe('metrics.js')];
  return require(caminhoDe('metrics.js'));
}

function limparCache() {
  delete require.cache[ID_SUPABASE];
  delete require.cache[caminhoDe('logger.js')];
  delete require.cache[caminhoDe('metrics.js')];
}

// ── Fixtures ────────────────────────────────────────────────────────────────

const DASHBOARD = {
  total_usuarios: 42,
  novos_7d: 7,
  novos_hoje: 1,
  pagantes: 3,
  dau: 5,
  wau: 12,
  mau: 30,
  cupons_mes_atual: 88,
  usuarios_no_limite: 2,
  campo_extra_que_nao_e_logado: 'ignorado',
};

const W2 = {
  retencao_w2_pct: 31.5,
  usuarios_retidos_w2: 9,
  usuarios_cohort: 28,
};

const ENV_ORIGINAL = {};
const ENVS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];

let estado;

beforeEach(() => {
  for (const k of ENVS) ENV_ORIGINAL[k] = process.env[k];
  process.env.SUPABASE_URL = 'https://projeto.supabase.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-service-role';
  process.env.SUPABASE_ANON_KEY = 'chave-anon';
  estado = novoEstado();
});

afterEach(() => {
  limparCache();
  for (const k of ENVS) {
    if (ENV_ORIGINAL[k] === undefined) delete process.env[k];
    else process.env[k] = ENV_ORIGINAL[k];
  }
});

// ── Criacao do client (diagnostico de infra) ────────────────────────────────

test('client usa a SERVICE_ROLE_KEY quando ela existe', () => {
  semear(estado);
  assert.equal(estado.clients.length, 1);
  assert.equal(estado.clients[0].url, 'https://projeto.supabase.test');
  assert.equal(estado.clients[0].chave, 'chave-service-role');
});

test('client cai na ANON_KEY quando a service role esta ausente (fallback silencioso, S2)', () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  semear(estado);
  assert.equal(estado.clients[0].chave, 'chave-anon');
});

// ── buscarDashboard ─────────────────────────────────────────────────────────

test('buscarDashboard consulta v_dashboard com select(*) e single()', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: DASHBOARD, error: null };

  const data = await metrics.buscarDashboard();

  assert.deepEqual(data, DASHBOARD);
  assert.equal(estado.consultas.length, 1);
  assert.deepEqual(estado.consultas[0], {
    tabela: 'v_dashboard', select: '*', limit: null, single: true,
  });
});

test('buscarDashboard lanca com o nome da view no prefixo do erro', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: null, error: { message: 'relation does not exist' } };

  await assert.rejects(
    () => metrics.buscarDashboard(),
    /^Error: v_dashboard: relation does not exist$/,
  );
});

// ── buscarRetencaoW2 ────────────────────────────────────────────────────────

test('buscarRetencaoW2 consulta v_retencao_w2 e devolve a linha', async () => {
  const metrics = semear(estado);
  estado.respostas.v_retencao_w2 = { data: W2, error: null };

  assert.deepEqual(await metrics.buscarRetencaoW2(), W2);
  assert.equal(estado.consultas[0].tabela, 'v_retencao_w2');
  assert.equal(estado.consultas[0].single, true);
});

test('buscarRetencaoW2 lanca prefixado', async () => {
  const metrics = semear(estado);
  estado.respostas.v_retencao_w2 = { data: null, error: { message: 'permission denied' } };
  await assert.rejects(() => metrics.buscarRetencaoW2(), /v_retencao_w2: permission denied/);
});

// ── buscarCuponsPorMes ──────────────────────────────────────────────────────

test('buscarCuponsPorMes usa limite 6 por padrao (nao single)', async () => {
  const metrics = semear(estado);
  estado.respostas.v_cupons_por_mes = { data: [{ mes: '2026-08' }], error: null };

  const data = await metrics.buscarCuponsPorMes();

  assert.deepEqual(data, [{ mes: '2026-08' }]);
  assert.equal(estado.consultas[0].limit, 6);
  assert.equal(estado.consultas[0].single, false);
});

test('buscarCuponsPorMes respeita o limite passado, inclusive 0', async () => {
  const metrics = semear(estado);
  estado.respostas.v_cupons_por_mes = { data: [], error: null };

  await metrics.buscarCuponsPorMes(12);
  assert.equal(estado.consultas[0].limit, 12);

  await metrics.buscarCuponsPorMes(0);
  // 0 e falsy: se algum dia virar `limite || 6`, este teste acusa
  assert.equal(estado.consultas[1].limit, 0);
});

test('buscarCuponsPorMes lanca prefixado', async () => {
  const metrics = semear(estado);
  estado.respostas.v_cupons_por_mes = { data: null, error: { message: 'timeout' } };
  await assert.rejects(() => metrics.buscarCuponsPorMes(), /v_cupons_por_mes: timeout/);
});

// ── buscarFunil ─────────────────────────────────────────────────────────────

test('buscarFunil consulta v_funil_conversao com single()', async () => {
  const metrics = semear(estado);
  estado.respostas.v_funil_conversao = { data: { cadastro: 10, ativacao: 4, pro: 1 }, error: null };

  assert.deepEqual(await metrics.buscarFunil(), { cadastro: 10, ativacao: 4, pro: 1 });
  assert.equal(estado.consultas[0].tabela, 'v_funil_conversao');
  assert.equal(estado.consultas[0].single, true);
});

test('buscarFunil lanca prefixado', async () => {
  const metrics = semear(estado);
  estado.respostas.v_funil_conversao = { data: null, error: { message: 'sem view' } };
  await assert.rejects(() => metrics.buscarFunil(), /v_funil_conversao: sem view/);
});

// ── logarMetricasDiarias ────────────────────────────────────────────────────

test('logarMetricasDiarias loga os 12 campos com os nomes renomeados e devolve as duas linhas', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: DASHBOARD, error: null };
  estado.respostas.v_retencao_w2 = { data: W2, error: null };

  const resultado = await metrics.logarMetricasDiarias();

  assert.deepEqual(resultado, { dashboard: DASHBOARD, w2: W2 });
  assert.equal(estado.logs.length, 1);
  assert.equal(estado.logs[0].evento, 'metricas_diarias');
  assert.deepEqual(estado.logs[0].dados, {
    total_usuarios: 42,
    novos_7d: 7,
    novos_hoje: 1,
    pagantes: 3,
    dau: 5,
    wau: 12,
    mau: 30,
    cupons_mes: 88,          // renomeado de cupons_mes_atual
    usuarios_no_limite: 2,
    retencao_w2_pct: 31.5,
    usuarios_w2: 9,          // renomeado de usuarios_retidos_w2
    cohort_w2: 28,           // renomeado de usuarios_cohort
  });
});

test('logarMetricasDiarias consulta as duas views (dashboard + w2)', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: DASHBOARD, error: null };
  estado.respostas.v_retencao_w2 = { data: W2, error: null };

  await metrics.logarMetricasDiarias();

  assert.deepEqual(estado.consultas.map((c) => c.tabela), ['v_dashboard', 'v_retencao_w2']);
});

test('logarMetricasDiarias loga metricas_erro E RELANCA (o scheduler depende do throw)', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: null, error: { message: 'view sumiu' } };
  estado.respostas.v_retencao_w2 = { data: W2, error: null };

  await assert.rejects(() => metrics.logarMetricasDiarias(), /v_dashboard: view sumiu/);

  assert.equal(estado.logs.length, 1);
  assert.equal(estado.logs[0].evento, 'metricas_erro');
  assert.equal(estado.logs[0].dados.fn, 'logarMetricasDiarias');
  assert.match(estado.logs[0].dados.erro, /v_dashboard: view sumiu/);
  // e o log de sucesso NAO sai junto
  assert.equal(estado.logs.filter((l) => l.evento === 'metricas_diarias').length, 0);
});

test('logarMetricasDiarias nao inventa numero quando a view devolve linha incompleta', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: { total_usuarios: 5 }, error: null };
  estado.respostas.v_retencao_w2 = { data: {}, error: null };

  await metrics.logarMetricasDiarias();

  const dados = estado.logs[0].dados;
  assert.equal(dados.total_usuarios, 5);
  // campo ausente vira undefined — nunca 0, que seria um numero falso
  assert.equal(dados.pagantes, undefined);
  assert.equal(dados.retencao_w2_pct, undefined);
});

// ── buscarTodasMetricas ─────────────────────────────────────────────────────

test('buscarTodasMetricas consulta as 4 views e usa as chaves do contrato', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: DASHBOARD, error: null };
  estado.respostas.v_retencao_w2 = { data: W2, error: null };
  estado.respostas.v_cupons_por_mes = { data: [{ mes: '2026-08' }], error: null };
  estado.respostas.v_funil_conversao = { data: { pro: 1 }, error: null };

  const tudo = await metrics.buscarTodasMetricas();

  assert.deepEqual(Object.keys(tudo), ['dashboard', 'retencao_w2', 'cupons_por_mes', 'funil']);
  assert.deepEqual(tudo.dashboard, DASHBOARD);
  assert.deepEqual(tudo.retencao_w2, W2);
  assert.deepEqual(tudo.cupons_por_mes, [{ mes: '2026-08' }]);
  assert.deepEqual(tudo.funil, { pro: 1 });
  assert.equal(estado.consultas.length, 4);
});

test('buscarTodasMetricas degrada view a view: uma quebrada nao derruba as outras', async () => {
  const metrics = semear(estado);
  estado.respostas.v_dashboard = { data: DASHBOARD, error: null };
  estado.respostas.v_retencao_w2 = { data: null, error: { message: 'view ausente' } };
  estado.respostas.v_cupons_por_mes = { data: [], error: null };
  estado.respostas.v_funil_conversao = { data: { pro: 1 }, error: null };

  const tudo = await metrics.buscarTodasMetricas();

  assert.deepEqual(tudo.retencao_w2, { erro: 'v_retencao_w2: view ausente' });
  assert.deepEqual(tudo.dashboard, DASHBOARD);
  assert.deepEqual(tudo.cupons_por_mes, []);
  assert.deepEqual(tudo.funil, { pro: 1 });
});

test('buscarTodasMetricas nao lanca nem com as 4 views quebradas', async () => {
  const metrics = semear(estado); // nenhuma view configurada = as 4 devolvem erro

  const tudo = await metrics.buscarTodasMetricas();

  for (const chave of ['dashboard', 'retencao_w2', 'cupons_por_mes', 'funil']) {
    assert.ok(tudo[chave].erro, `${chave} deveria carregar o erro`);
  }
  // degradacao e silenciosa de proposito (endpoint de admin): nada e logado aqui
  assert.equal(estado.logs.length, 0);
});

// ── Contrato do modulo ──────────────────────────────────────────────────────

test('exporta exatamente as 6 funcoes que os consumidores importam', () => {
  const metrics = semear(estado);
  assert.deepEqual(Object.keys(metrics).sort(), [
    'buscarCuponsPorMes',
    'buscarDashboard',
    'buscarFunil',
    'buscarRetencaoW2',
    'buscarTodasMetricas',
    'logarMetricasDiarias',
  ]);
});
