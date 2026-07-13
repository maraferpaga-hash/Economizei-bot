// src/schemaGuard.js — Guarda de schema no boot (cod-0050)
//
// Confere, no start do servidor, que colunas/tabelas críticas existem no banco
// e LOGA um alerta gritante quando algo falta — transforma "cupom quebrado em
// silêncio por horas" (incidente A9, 07-08→07-09) em "aviso na hora do deploy".
//
// Regras de desenho:
// - NUNCA bloqueia o boot: toda falha (inclusive da própria checagem) só loga
//   e segue; esta função jamais lança exceção pro chamador.
// - Só LEITURA: cada checagem é um probe `select <coluna> ... limit 0` — o
//   PostgREST não expõe `information_schema` pela API, então o probe de leitura
//   vazia é a forma segura de detectar coluna/tabela ausente (erro 42703/42P01)
//   sem trazer nenhum dado de usuário.
// - Lista declarativa fácil de estender: adicione `{ tabela, coluna? }` abaixo.

const { log } = require('./logger');

// ── Lista declarativa das checagens críticas ────────────────────────────────
// `coluna` omitida = checa só a existência da tabela.
// (Cobre os incidentes/migrations que já morderam: A9 `compras.cnpj`, A4
// `resumos_mensais_enviados`, migration do Agente, migration do Alerta Pro.)
const CHECAGENS_CRITICAS = [
  { tabela: 'compras', coluna: 'cnpj' },                 // A9 — sem ela, salvar cupom quebra
  { tabela: 'compras', coluna: 'tipo' },                 // coerência 06-07
  { tabela: 'itens_compra', coluna: 'preco_total' },     // coerência 06-07
  { tabela: 'itens_compra', coluna: 'categoria' },       // classificação (coração)
  { tabela: 'itens_compra', coluna: 'nome_canonico' },   // classificação (coração)
  { tabela: 'usuarios', coluna: 'perguntas_mes_atual' }, // migration do Agente
  { tabela: 'usuarios', coluna: 'categorias_superfluas' }, // migration do Alerta Pro
  { tabela: 'perguntas_log' },                           // migration do Agente
  { tabela: 'mensagens_processadas' },                   // Lei 5 (idempotência)
  { tabela: 'resumos_mensais_enviados' },                // A4
  { tabela: 'lembretes_enviados' },                      // reengajamento
  { tabela: 'acompanhamentos' },                         // Alerta Pro
];

// Códigos que significam "não existe" (Postgres + PostgREST schema cache):
// 42703 = undefined_column · 42P01 = undefined_table ·
// PGRST204/PGRST205 = coluna/tabela fora do schema cache do PostgREST.
const CODIGOS_AUSENCIA = ['42703', '42P01', 'PGRST204', 'PGRST205'];

function ehErroDeAusencia(error) {
  if (!error) return false;
  if (error.code && CODIGOS_AUSENCIA.includes(String(error.code))) return true;
  const msg = String(error.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('could not find');
}

// Cliente próprio, criado sob demanda (o supabase.js não exporta o dele).
// Mesmas envs/opções do supabase.js; só é criado se ninguém injetar `cliente`.
let _clientePadrao = null;
function clientePadrao() {
  if (!_clientePadrao) {
    const { createClient } = require('@supabase/supabase-js');
    const ws = require('ws');
    _clientePadrao = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      { realtime: { transport: ws } }
    );
  }
  return _clientePadrao;
}

/**
 * Roda todas as checagens e loga o que faltar. Nunca lança.
 *
 * @param {object} [opts]
 * @param {object} [opts.cliente]   cliente supabase injetável (testes)
 * @param {Array}  [opts.checagens] lista declarativa (default CHECAGENS_CRITICAS)
 * @param {Function} [opts.logFn]   logger injetável (default log estruturado)
 * @param {Function|null} [opts.avisar] callback opcional (faltando[]) — ex.: 1 aviso ao ADMIN_PHONE
 * @returns {Promise<{ok: boolean, faltando: string[], errosChecagem: string[]}>}
 */
async function verificarSchemaCritico({ cliente, checagens = CHECAGENS_CRITICAS, logFn = log, avisar = null } = {}) {
  const resultado = { ok: true, faltando: [], errosChecagem: [] };

  let cli = cliente;
  if (!cli) {
    try {
      cli = clientePadrao();
    } catch (e) {
      logFn('schema_guard_erro', { etapa: 'cliente', erro: e && e.message ? e.message : String(e) });
      return resultado; // sem cliente não há como checar — loga e segue o boot
    }
  }

  for (const chk of checagens) {
    const alvo = chk.coluna ? `${chk.tabela}.${chk.coluna}` : chk.tabela;
    try {
      // limit(0): probe de existência sem trazer nenhuma linha (LGPD-friendly)
      const { error } = await cli.from(chk.tabela).select(chk.coluna || '*').limit(0);
      if (!error) continue;
      if (ehErroDeAusencia(error)) {
        resultado.ok = false;
        resultado.faltando.push(alvo);
        logFn('schema_guard_faltando', { alvo, detalhe: error.message || String(error.code || '') });
      } else {
        // erro que NÃO é ausência (rede, permissão…) — não afirma que falta
        resultado.errosChecagem.push(alvo);
        logFn('schema_guard_erro', { alvo, erro: error.message || String(error.code || '') });
      }
    } catch (e) {
      resultado.errosChecagem.push(alvo);
      logFn('schema_guard_erro', { alvo, erro: e && e.message ? e.message : String(e) });
    }
  }

  if (resultado.faltando.length > 0) {
    // resumo gritante em 1 linha — fácil de achar no Railway
    logFn('schema_guard_faltando_resumo', {
      total: resultado.faltando.length,
      faltando: resultado.faltando,
      acao: 'rodar a migration correspondente em supabase/ ANTES de usar o bot',
    });
    if (typeof avisar === 'function') {
      try {
        await avisar(resultado.faltando);
      } catch (e) {
        logFn('schema_guard_erro', { etapa: 'aviso_admin', erro: e && e.message ? e.message : String(e) });
      }
    }
  } else {
    logFn('schema_guard_ok', {
      checagens: checagens.length,
      errosChecagem: resultado.errosChecagem.length,
    });
  }

  return resultado;
}

module.exports = {
  verificarSchemaCritico,
  CHECAGENS_CRITICAS,
  // exportada pra teste unitário direto
  ehErroDeAusencia,
};
