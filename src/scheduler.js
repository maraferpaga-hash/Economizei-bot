const cron = require('node-cron');
const { executarResumoMensal } = require('./monthlySummary');
const { logarMetricasDiarias } = require('./metrics');
const { executarDigestSemanal } = require('./weeklyDigest');
const { verificarConexao, enviarMensagem } = require('./zapi');
const { executarReengajamento } = require('./reengagement');
const { purgarMensagensProcessadas } = require('./supabase');
const { log } = require('./logger');

function ehUltimoDiaDoMes(date = new Date()) {
  const amanha = new Date(date);
  amanha.setDate(date.getDate() + 1);
  return amanha.getMonth() !== date.getMonth();
}

function iniciar() {
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

  log('scheduler_registrado', { cron: '0 9 28-31 * *', timezone: 'America/Sao_Paulo' });

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

  // ------------------------------------------------------------------
  // Reengajamento — todo dia às 10h (horário de Brasília)
  // Lembretes proativos para usuários inativos (tom de amizade).
  // Lógica completa em src/reengagement.js. Os segmentos por data
  // (fim de mês dias 26-27) são filtrados dentro do próprio módulo.
  // ------------------------------------------------------------------
  cron.schedule('0 10 * * *', async () => {
    log('reengajamento_disparando', { hora: new Date().toISOString() });
    try {
      await executarReengajamento();
    } catch (err) {
      log('reengajamento_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  log('scheduler_jobs_registrados', {
    jobs: ['resumo_mensal (9h dias 28-31)', 'metricas_diarias + purga_dedup (7h)', 'zapi_health (8h)', 'digest_semanal (9h sexta)', 'reengajamento (10h)'],
  });
}

module.exports = { iniciar, ehUltimoDiaDoMes };
