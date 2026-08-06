// test/scheduler-reengajamento-off.test.js — cod-0068
//
// Decisão do Gabriel (2026-08-05): desligar o reengajamento e manter SÓ a
// mensagem de fim de mês. Este teste é a trava contra o job voltar por acidente
// (e contra o log de boot mentir sobre quais jobs existem).
//
// O `iniciar()` recebe `cron` e `logFn` injetáveis, então nenhum cron real é
// registrado aqui — o cron falso só anota as expressões que receberia.
//
// Rodar: node --test test/scheduler-reengajamento-off.test.js

'use strict';

// scheduler.js -> monthlySummary/metrics/weeklyDigest/supabase, que criam o
// client do Supabase no require. Envs dummy só pra carga (nenhuma rede é
// tocada: os callbacks do cron nunca são executados neste teste).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { iniciar, JOBS_AGENDADOS } = require('../src/scheduler.js');
const { CHECAGENS_CRITICAS } = require('../src/schemaGuard.js');

// Cron falso: registra as expressões, nunca agenda nada de verdade.
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

function logFake() {
  const eventos = [];
  const fn = (evento, dados) => eventos.push({ evento, dados });
  fn.eventos = eventos;
  return fn;
}

function rodarIniciar() {
  const cron = cronFake();
  const logFn = logFake();
  iniciar({ cron, logFn });
  return { cron, logFn };
}

// ── O job de reengajamento não é mais agendado ──────────────────────────────

test('reengajamento: o cron diário das 10h NÃO é agendado', () => {
  const { cron } = rodarIniciar();
  const expressoes = cron.agendados.map((j) => j.expressao);
  assert.ok(
    !expressoes.includes('0 10 * * *'),
    `o cron de reengajamento voltou a ser agendado: ${JSON.stringify(expressoes)}`
  );
});

test('reengajamento: o scheduler não importa mais o módulo de reengajamento', () => {
  const fonte = require('node:fs').readFileSync(
    require.resolve('../src/scheduler.js'),
    'utf8'
  );
  // Só linhas de código valem — a nota de como reverter cita o require de propósito.
  const linhasDeCodigo = fonte
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'));
  assert.ok(
    !linhasDeCodigo.some((l) => l.includes("require('./reengagement')")),
    'scheduler.js voltou a requerer ./reengagement fora de comentário'
  );
});

// ── O que FICA continua intacto ─────────────────────────────────────────────

test('resumo mensal: o cron de fim de mês continua agendado (é a única mensagem proativa)', () => {
  const { cron } = rodarIniciar();
  const resumo = cron.agendados.find((j) => j.expressao === '0 9 28-31 * *');
  assert.ok(resumo, 'o cron do resumo mensal sumiu');
  assert.equal(resumo.opcoes.timezone, 'America/Sao_Paulo');
});

test('os demais jobs (métricas, health Z-API, digest) continuam agendados', () => {
  const { cron } = rodarIniciar();
  const expressoes = cron.agendados.map((j) => j.expressao);
  for (const esperada of ['0 7 * * *', '0 8 * * *', '0 9 * * 5']) {
    assert.ok(expressoes.includes(esperada), `job ${esperada} sumiu`);
  }
  assert.equal(cron.agendados.length, 4, 'a quantidade de jobs agendados mudou');
});

// ── O log de boot reflete a lista real ──────────────────────────────────────

test('log de boot: a lista de jobs bate com o que foi agendado e não cita reengajamento', () => {
  const { cron, logFn } = rodarIniciar();
  const evento = logFn.eventos.find((e) => e.evento === 'scheduler_jobs_registrados');
  assert.ok(evento, 'o log scheduler_jobs_registrados sumiu');
  assert.equal(evento.dados.jobs.length, cron.agendados.length);
  assert.deepEqual(evento.dados.jobs, JOBS_AGENDADOS);
  assert.ok(
    !JOBS_AGENDADOS.some((j) => j.toLowerCase().includes('reengajamento')),
    'a lista de jobs ainda anuncia reengajamento'
  );
});

// ── Schema guard: alarme sem ação possível saiu; o resto ficou ──────────────

test('schema guard: lembretes_enviados saiu das checagens críticas', () => {
  const alvos = CHECAGENS_CRITICAS.map((c) => (c.coluna ? `${c.tabela}.${c.coluna}` : c.tabela));
  assert.ok(!alvos.includes('lembretes_enviados'), 'lembretes_enviados voltou ao schema guard');
});

test('schema guard: as demais checagens críticas continuam intactas', () => {
  const alvos = CHECAGENS_CRITICAS.map((c) => (c.coluna ? `${c.tabela}.${c.coluna}` : c.tabela));
  const esperadas = [
    'compras.cnpj',
    'compras.tipo',
    'itens_compra.preco_total',
    'itens_compra.categoria',
    'itens_compra.nome_canonico',
    'usuarios.perguntas_mes_atual',
    'usuarios.categorias_superfluas',
    'perguntas_log',
    'mensagens_processadas',
    'resumos_mensais_enviados',
    'acompanhamentos',
  ];
  for (const alvo of esperadas) {
    assert.ok(alvos.includes(alvo), `checagem crítica ${alvo} sumiu do schema guard`);
  }
  assert.equal(alvos.length, esperadas.length, 'a lista de checagens críticas mudou de tamanho');
});

// ── O módulo continua no repo: reverter deve custar 2 linhas ────────────────

test('reversibilidade: reengagement.js e as funções de I/O continuam existindo', () => {
  const reengagement = require('../src/reengagement.js');
  assert.equal(typeof reengagement.executarReengajamento, 'function');

  const supabase = require('../src/supabase.js');
  assert.equal(typeof supabase.lembreteFoiEnviado, 'function');
  assert.equal(typeof supabase.registrarLembreteEnviado, 'function');
});
