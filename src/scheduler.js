const cronPadrao = require('node-cron');
const { executarResumoMensal } = require('./monthlySummary');
const { logarMetricasDiarias } = require('./metrics');
const { executarDigestSemanal } = require('./weeklyDigest');
const { verificarConexao, enviarMensagem } = require('./zapi');
const { purgarMensagensProcessadas, purgarPerguntasLog } = require('./supabase');
const { log } = require('./logger');

// ────────────────────────────────────────────────────────────────────────────
// REENGAJAMENTO DESLIGADO (cod-0068 — decisão do Gabriel, 2026-08-05)
//
// "vamos deixar de lado a ideia do reengajamento por agora, quero somente a
//  mensagem de final de mês indicando o quanto se gastou."
//
// O cron diário das 10h (`executarReengajamento`) foi removido daqui. O módulo
// `src/reengagement.js` e as funções `lembreteFoiEnviado` /
// `registrarLembreteEnviado` do supabase.js CONTINUAM no repositório — isto é
// "por agora", não "pra sempre".
//
// Para reverter (2 linhas): reponha o require abaixo e o bloco cron.schedule
// ('0 10 * * *') que dispara executarReengajamento; e devolva
// 'lembretes_enviados' às CHECAGENS_CRITICAS do src/schemaGuard.js.
//   const { executarReengajamento } = require('./reengagement');
//
// Contexto: a tabela `lembretes_enviados` nunca foi criada no Supabase, então
// `lembreteFoiEnviado` lançava antes de qualquer envio — o job rodou meses sem
// jamais entregar uma mensagem. Doc: "Plano_Desentupimento_e_Supabase_2026-08-05.md" §3 S1.
// ────────────────────────────────────────────────────────────────────────────

// Lista declarativa dos jobs agendados — fonte única do que é registrado E do
// que aparece no log de boot (antes as duas coisas podiam divergir em silêncio).
const JOBS_AGENDADOS = [
  'resumo_mensal (9h dias 28-31)',
  'metricas_diarias + purga_dedup (7h)',
  'zapi_health (8h)',
  'digest_semanal (9h sexta)',
];

function ehUltimoDiaDoMes(date = new Date()) {
  const amanha = new Date(date);
  amanha.setDate(date.getDate() + 1);
  return amanha.getMonth() !== date.getMonth();
}

/**
 * Registra os jobs agendados.
 * @param {object} [deps]
 * @param {object} [deps.cron]  lib de cron injetável (default node-cron) — testes
 * @param {Function} [deps.logFn] logger injetável (default log estruturado)
 */
function iniciar({ cron = cronPadrao, logFn = log } = {}) {
  // Roda 9h dia 28-31; só dispara se for de fato o último dia do mês.
  // Timezone do servidor deve ser America/Sao_Paulo (ou ajustar a hora).
  cron.schedule('0 9 28-31 * *', async () => {
    const agora = new Date();
    if (!ehUltimoDiaDoMes(agora)) {
      log('scheduler_skip_nao_ultimo_dia', { data: agora.toISOString() });
      return;
    }
    const mesRef = agora.toISOString().slice(0, 7); // 'YYYY-MM'
    log('scheduler_disparando', { mes: mesRef });
    try {
      await executarResumoMensal(mesRef);
    } catch (err) {
      log('scheduler_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  logFn('scheduler_registrado', { cron: '0 9 28-31 * *', timezone: 'America/Sao_Paulo' });

  // ------------------------------------------------------------------
  // Métricas diárias — toda manhã às 7h
  // Loga um evento 'metricas_diarias' com os números chave do dia.
  // No Railway: Logs -> filtre por 'metricas_diarias' para ver evolução.
  // ------------------------------------------------------------------
  cron.schedule('0 7 * * *', async () => {
    try {
      await logarMetricasDiarias();
    } catch (err) {
      log('metricas_cron_erro', { erro: err.message });
    }
    // Purga o dedup de webhook (TTL ~7 dias) — mantém a tabela pequena.
    try {
      await purgarMensagensProcessadas(7);
    } catch (err) {
      log('purga_mensagens_cron_erro', { erro: err.message });
    }
    // Purga o log de perguntas do agente (TTL ~90 dias — LGPD: minimização).
    // Antes da migration do agente a tabela não existe: a função degrada
    // sozinha (loga e segue), sem afetar o resto do cron.
    try {
      await purgarPerguntasLog(90);
    } catch (err) {
      log('purga_perguntas_cron_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  // ------------------------------------------------------------------
  // Health check Z-API — todo dia às 8h
  // Se desconectado, loga alerta e envia WhatsApp para ADMIN_PHONE.
  // Variável ADMIN_PHONE: seu número pessoal (ex: 5517999999999)
  // ------------------------------------------------------------------
  cron.schedule('0 8 * * *', async () => {
    try {
      const resultado = await verificarConexao();
      if (!resultado.conectado) {
        log('zapi_desconectado_alerta', { erro: resultado.erro ?? 'desconectado' });

        // Avisa pelo próprio WhatsApp se o número admin estiver configurado
        if (process.env.ADMIN_PHONE) {
          await enviarMensagem(
            process.env.ADMIN_PHONE,
            '⚠️ *ALERTA Economizei*\n\nO bot está *desconectado* do WhatsApp (Z-API offline).\n\nAcesse https://app.z-api.io e reconecte a instância para restaurar o serviço.'
          ).catch((e) => log('zapi_alerta_envio_erro', { erro: e.message }));
        }
      } else {
        log('zapi_health_ok', {});
      }
    } catch (err) {
      log('zapi_health_cron_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  // ------------------------------------------------------------------
  // Digest semanal dos "3 numeros" — toda sexta as 9h
  // Envia ao ADMIN_PHONE: cadastros novos (Supabase) + uptime
  // (UptimeRobot) + lembrete pra olhar visitas no Vercel Analytics.
  // ------------------------------------------------------------------
  cron.schedule('0 9 * * 5', async () => {
    try {
      await executarDigestSemanal();
    } catch (err) {
      log('digest_cron_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  // (o cron de reengajamento das 10h foi removido — ver nota no topo do arquivo)

  logFn('scheduler_jobs_registrados', { jobs: JOBS_AGENDADOS });
}

module.exports = { iniciar, ehUltimoDiaDoMes, JOBS_AGENDADOS };
