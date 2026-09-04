// test/scheduler.test.js — las-05 (Fila de lastro, cobertura de testes)
//
// O que este arquivo cobre (e o `scheduler-reengajamento-off.test.js` NÃO):
// aquele testa o CONTRATO DE REGISTRO (quais expressões cron são agendadas, o
// log de boot, o schema guard). Aqui testamos o CORPO DOS CALLBACKS — a lógica
// que roda quando o cron dispara: o portão do último dia do mês, a degradação
// independente dos 3 sub-jobs das 7h, o caminho de alerta do health da Z-API e
// o engolimento de erro job a job.
//
// Nenhum cron real é registrado (o `iniciar()` já aceita `cron` injetável) e
// nenhum I/O acontece: os módulos de I/O são substituídos por duplos ANTES do
// `require` do scheduler, semeando o `require.cache`. Isso é técnica de teste,
// não convenção de produção — `src/scheduler.js` NÃO é tocado por esta leva.
//
// Rodar: node --test test/scheduler.test.js

'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const MODULOS_DUBLADOS = [
  'monthlySummary.js',
  'metrics.js',
  'weeklyDigest.js',
  'zapi.js',
  'supabase.js',
  'logger.js',
];

const caminhoDe = (rel) => require.resolve(path.join(__dirname, '..', 'src', rel));

// ── Duplos dos módulos de I/O ───────────────────────────────────────────────
// Cada duplo registra a chamada recebida e deixa o teste escolher se ela
// resolve (estado.retornos) ou rejeita (estado.falhas).

function espiao(nome, estado) {
  return async (...args) => {
    estado.chamadas.push({ nome, args });
    if (estado.falhas[nome]) throw new Error(estado.falhas[nome]);
    return estado.retornos[nome];
  };
}

function semearCache(estado) {
  const modulos = {
    'monthlySummary.js': { executarResumoMensal: espiao('executarResumoMensal', estado) },
    'metrics.js': { logarMetricasDiarias: espiao('logarMetricasDiarias', estado) },
    'weeklyDigest.js': { executarDigestSemanal: espiao('executarDigestSemanal', estado) },
    'zapi.js': {
      verificarConexao: espiao('verificarConexao', estado),
      enviarMensagem: espiao('enviarMensagem', estado),
    },
    'supabase.js': {
      purgarMensagensProcessadas: espiao('purgarMensagensProcessadas', estado),
      purgarPerguntasLog: espiao('purgarPerguntasLog', estado),
    },
    'logger.js': {
      log: (evento, dados) => estado.logs.push({ evento, dados }),
      maskPhone: (p) => p,
    },
  };

  for (const [rel, exports] of Object.entries(modulos)) {
    const id = caminhoDe(rel);
    require.cache[id] = { id, filename: id, loaded: true, exports, children: [], paths: [] };
  }
  // o scheduler precisa ser recarregado pra enxergar os duplos
  delete require.cache[caminhoDe('scheduler.js')];
  return require(caminhoDe('scheduler.js'));
}

function limparCache() {
  for (const rel of [...MODULOS_DUBLADOS, 'scheduler.js']) {
    delete require.cache[caminhoDe(rel)];
  }
}

// Cron falso: guarda os callbacks pra o teste disparar à mão.
function cronFake() {
  const agendados = [];
  return {
    agendados,
    schedule(expressao, callback, opcoes) {
      agendados.push({ expressao, callback, opcoes });
      return { stop() {} };
    },
  };
}

// Congela o relógio num instante fixo — o job do resumo mensal lê `new Date()`
// por dentro, então sem isso o teste passaria ou falharia conforme o dia real.
async function comDataFixa(ano, mesZeroBased, dia, fn) {
  const RelogioReal = Date;
  const instante = RelogioReal.UTC(ano, mesZeroBased, dia, 12, 0, 0);
  class DataCongelada extends RelogioReal {
    constructor(...args) {
      super(...(args.length === 0 ? [instante] : args));
    }
    static now() {
      return instante;
    }
  }
  global.Date = DataCongelada;
  try {
    return await fn();
  } finally {
    global.Date = RelogioReal;
  }
}

let estado;
let scheduler;
let cron;
let adminPhoneOriginal;

function montar() {
  estado = { chamadas: [], logs: [], falhas: {}, retornos: {} };
  scheduler = semearCache(estado);
  cron = cronFake();
  scheduler.iniciar({ cron, logFn: () => {} });
}

function callbackDe(expressao) {
  const job = cron.agendados.find((j) => j.expressao === expressao);
  assert.ok(job, `job ${expressao} não foi agendado`);
  return job.callback;
}

const nomesChamados = () => estado.chamadas.map((c) => c.nome);
const eventosLogados = () => estado.logs.map((l) => l.evento);

beforeEach(() => {
  adminPhoneOriginal = process.env.ADMIN_PHONE;
  montar();
});

afterEach(() => {
  if (adminPhoneOriginal === undefined) delete process.env.ADMIN_PHONE;
  else process.env.ADMIN_PHONE = adminPhoneOriginal;
  limparCache();
});

// ── ehUltimoDiaDoMes: o portão que decide se o resumo mensal sai ─────────────

test('ehUltimoDiaDoMes: reconhece o último dia de meses de 31, 30 e 28 dias', () => {
  const { ehUltimoDiaDoMes } = scheduler;
  assert.equal(ehUltimoDiaDoMes(new Date(2026, 0, 31)), true, 'janeiro tem 31');
  assert.equal(ehUltimoDiaDoMes(new Date(2026, 3, 30)), true, 'abril tem 30');
  assert.equal(ehUltimoDiaDoMes(new Date(2026, 1, 28)), true, '2026 não é bissexto');
});

test('ehUltimoDiaDoMes: fevereiro bissexto — dia 28 NÃO é o último, dia 29 é', () => {
  const { ehUltimoDiaDoMes } = scheduler;
  assert.equal(ehUltimoDiaDoMes(new Date(2028, 1, 28)), false);
  assert.equal(ehUltimoDiaDoMes(new Date(2028, 1, 29)), true);
});

test('ehUltimoDiaDoMes: 31 de dezembro é último dia (vira o ano, não só o mês)', () => {
  assert.equal(scheduler.ehUltimoDiaDoMes(new Date(2026, 11, 31)), true);
});

test('ehUltimoDiaDoMes: dias 28/29/30 dentro da janela do cron que NÃO são o último', () => {
  const { ehUltimoDiaDoMes } = scheduler;
  for (const dia of [28, 29, 30]) {
    assert.equal(ehUltimoDiaDoMes(new Date(2026, 0, dia)), false, `janeiro ${dia}`);
  }
});

test('ehUltimoDiaDoMes: não muta a data recebida', () => {
  const data = new Date(2026, 0, 31);
  const antes = data.getTime();
  scheduler.ehUltimoDiaDoMes(data);
  assert.equal(data.getTime(), antes);
});

// ── Job das 9h (resumo mensal) ──────────────────────────────────────────────

test('resumo mensal: em dia que não é o último do mês, NÃO chama o resumo', async () => {
  await comDataFixa(2026, 0, 15, () => callbackDe('0 9 28-31 * *')());
  assert.ok(!nomesChamados().includes('executarResumoMensal'), 'resumo saiu fora do último dia');
  assert.ok(eventosLogados().includes('scheduler_skip_nao_ultimo_dia'));
});

test('resumo mensal: no último dia, chama com o mês de referência YYYY-MM', async () => {
  await comDataFixa(2026, 0, 31, () => callbackDe('0 9 28-31 * *')());
  const chamada = estado.chamadas.find((c) => c.nome === 'executarResumoMensal');
  assert.ok(chamada, 'o resumo mensal não foi chamado no último dia');
  assert.match(chamada.args[0], /^\d{4}-\d{2}$/, 'mês de referência fora do formato YYYY-MM');
  assert.equal(chamada.args[0], '2026-01');
});

test('resumo mensal: erro do resumo é engolido e logado (o cron não derruba o processo)', async () => {
  estado.falhas.executarResumoMensal = 'supabase fora do ar';
  await comDataFixa(2026, 0, 31, () =>
    assert.doesNotReject(callbackDe('0 9 28-31 * *')())
  );
  const erro = estado.logs.find((l) => l.evento === 'scheduler_erro');
  assert.ok(erro, 'o erro do resumo não foi logado');
  assert.equal(erro.dados.erro, 'supabase fora do ar');
});

// ── Job das 7h (métricas + 2 purgas) — degradação INDEPENDENTE ──────────────

test('métricas 7h: chama as 3 rotinas, nesta ordem, com os TTLs combinados', async () => {
  await callbackDe('0 7 * * *')();
  assert.deepEqual(nomesChamados(), [
    'logarMetricasDiarias',
    'purgarMensagensProcessadas',
    'purgarPerguntasLog',
  ]);
  const dedup = estado.chamadas.find((c) => c.nome === 'purgarMensagensProcessadas');
  const perguntas = estado.chamadas.find((c) => c.nome === 'purgarPerguntasLog');
  assert.equal(dedup.args[0], 7, 'TTL do dedup de webhook mudou');
  assert.equal(perguntas.args[0], 90, 'TTL do log de perguntas mudou (LGPD: minimização)');
});

test('métricas 7h: falha nas métricas NÃO impede as duas purgas', async () => {
  estado.falhas.logarMetricasDiarias = 'metrics off';
  await assert.doesNotReject(callbackDe('0 7 * * *')());
  assert.ok(nomesChamados().includes('purgarMensagensProcessadas'));
  assert.ok(nomesChamados().includes('purgarPerguntasLog'));
  assert.ok(eventosLogados().includes('metricas_cron_erro'));
});

test('métricas 7h: falha na purga do dedup NÃO impede a purga do log de perguntas', async () => {
  estado.falhas.purgarMensagensProcessadas = 'tabela ausente';
  await assert.doesNotReject(callbackDe('0 7 * * *')());
  assert.ok(nomesChamados().includes('purgarPerguntasLog'), 'a 2ª purga foi puxada pela 1ª');
  assert.ok(eventosLogados().includes('purga_mensagens_cron_erro'));
});

test('métricas 7h: as 3 falhando juntas ainda assim não derrubam o job', async () => {
  estado.falhas.logarMetricasDiarias = 'a';
  estado.falhas.purgarMensagensProcessadas = 'b';
  estado.falhas.purgarPerguntasLog = 'c';
  await assert.doesNotReject(callbackDe('0 7 * * *')());
  assert.deepEqual(eventosLogados(), [
    'metricas_cron_erro',
    'purga_mensagens_cron_erro',
    'purga_perguntas_cron_erro',
  ]);
});

// ── Job das 8h (health Z-API) ───────────────────────────────────────────────

test('health Z-API: conectado apenas loga OK e não manda WhatsApp', async () => {
  process.env.ADMIN_PHONE = '5517999999999';
  estado.retornos.verificarConexao = { conectado: true };
  await callbackDe('0 8 * * *')();
  assert.ok(eventosLogados().includes('zapi_health_ok'));
  assert.ok(!nomesChamados().includes('enviarMensagem'), 'mandou alerta com a conexão OK');
});

test('health Z-API: desconectado com ADMIN_PHONE avisa pelo WhatsApp do admin', async () => {
  process.env.ADMIN_PHONE = '5517999999999';
  estado.retornos.verificarConexao = { conectado: false, erro: 'instância offline' };
  await callbackDe('0 8 * * *')();

  const alerta = estado.logs.find((l) => l.evento === 'zapi_desconectado_alerta');
  assert.ok(alerta, 'não logou o alerta de desconexão');
  assert.equal(alerta.dados.erro, 'instância offline');

  const envio = estado.chamadas.find((c) => c.nome === 'enviarMensagem');
  assert.ok(envio, 'não avisou o admin');
  assert.equal(envio.args[0], '5517999999999');
  assert.match(envio.args[1], /desconectado/i);
});

test('health Z-API: desconectado SEM ADMIN_PHONE loga o alerta e não tenta enviar', async () => {
  delete process.env.ADMIN_PHONE;
  estado.retornos.verificarConexao = { conectado: false };
  await callbackDe('0 8 * * *')();
  assert.ok(eventosLogados().includes('zapi_desconectado_alerta'));
  assert.ok(!nomesChamados().includes('enviarMensagem'));
});

test('health Z-API: falha ao ENVIAR o alerta é registrada e não derruba o job', async () => {
  process.env.ADMIN_PHONE = '5517999999999';
  estado.retornos.verificarConexao = { conectado: false };
  estado.falhas.enviarMensagem = 'z-api 500';
  await assert.doesNotReject(callbackDe('0 8 * * *')());
  const erro = estado.logs.find((l) => l.evento === 'zapi_alerta_envio_erro');
  assert.ok(erro, 'o erro de envio do alerta não foi logado');
  assert.equal(erro.dados.erro, 'z-api 500');
});

test('health Z-API: falha ao VERIFICAR a conexão cai no catch do job', async () => {
  estado.falhas.verificarConexao = 'timeout';
  await assert.doesNotReject(callbackDe('0 8 * * *')());
  assert.ok(eventosLogados().includes('zapi_health_cron_erro'));
  assert.ok(!nomesChamados().includes('enviarMensagem'));
});

// ── Job de sexta 9h (digest semanal) ────────────────────────────────────────

test('digest semanal: chama o digest', async () => {
  await callbackDe('0 9 * * 5')();
  assert.deepEqual(nomesChamados(), ['executarDigestSemanal']);
});

test('digest semanal: erro é engolido e logado', async () => {
  estado.falhas.executarDigestSemanal = 'uptimerobot fora';
  await assert.doesNotReject(callbackDe('0 9 * * 5')());
  assert.ok(eventosLogados().includes('digest_cron_erro'));
});

// ── Invariantes do wiring ───────────────────────────────────────────────────

test('wiring: registrar os jobs não dispara nenhum deles', () => {
  assert.deepEqual(estado.chamadas, [], 'algum job rodou só por ter sido registrado');
});

test('wiring: todos os jobs são registrados em America/Sao_Paulo', () => {
  assert.equal(cron.agendados.length, 4);
  for (const job of cron.agendados) {
    assert.equal(job.opcoes.timezone, 'America/Sao_Paulo', `job ${job.expressao} sem timezone`);
  }
});

test('wiring: cada callback é independente (disparar um não dispara os outros)', async () => {
  await callbackDe('0 8 * * *')();
  assert.deepEqual(nomesChamados(), ['verificarConexao']);
});
