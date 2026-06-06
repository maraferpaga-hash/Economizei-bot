/**
 * weeklyDigest.js — Relatório semanal dos "3 números" do roadmap
 *
 * Junta, num único resumo enviado por WhatsApp ao ADMIN_PHONE toda sexta:
 *   1. Cadastros novos da semana .... Supabase (views de métricas)
 *   2. Uptime do /health ............ UptimeRobot (API)
 *   3. Visitas da landing ........... Vercel Analytics (sem API estável no
 *                                     plano free — entra como link pro painel)
 *
 * Também inclui retenção W2 e DAU/WAU/MAU, que já existem em metrics.js.
 *
 * Variáveis de ambiente:
 *   ADMIN_PHONE            — destino do digest (ex: 5517999999999)
 *   UPTIMEROBOT_API_KEY    — chave read-only da conta UptimeRobot (opcional)
 *   LANDING_ANALYTICS_URL  — link do painel do Vercel Analytics (opcional)
 */

const { buscarDashboard, buscarRetencaoW2 } = require('./metrics');
const { enviarMensagem } = require('./zapi');
const { montarDigestSemanal } = require('./formatter');
const { log } = require('./logger');

/**
 * Consulta o uptime dos últimos 7 dias no UptimeRobot.
 * Retorna { ok: true, ratio: '99.95', nome } ou { ok: false, motivo }.
 * Degrada com elegância: se a chave não estiver configurada, não quebra o digest.
 */
async function buscarUptime() {
  const apiKey = process.env.UPTIMEROBOT_API_KEY;
  if (!apiKey) {
    return { ok: false, motivo: 'UPTIMEROBOT_API_KEY não configurada' };
  }
  try {
    const resp = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        format: 'json',
        custom_uptime_ratios: '7', // ratio dos últimos 7 dias
      }).toString(),
    });
    const data = await resp.json();
    if (data.stat !== 'ok' || !Array.isArray(data.monitors) || data.monitors.length === 0) {
      return { ok: false, motivo: data?.error?.message || 'resposta inesperada do UptimeRobot' };
    }
    // Usa o primeiro monitor (o /health). custom_uptime_ratio vem como "99.950".
    const monitor = data.monitors[0];
    const ratio = Number(monitor.custom_uptime_ratio).toFixed(2);
    return { ok: true, ratio, nome: monitor.friendly_name };
  } catch (err) {
    log('uptime_fetch_erro', { erro: err.message });
    return { ok: false, motivo: err.message };
  }
}

/**
 * Monta os dados do digest. Cada fonte degrada de forma independente —
 * se o Supabase falhar, ainda mandamos uptime, e vice-versa.
 */
async function montarDados() {
  const [dashboard, w2, uptime] = await Promise.all([
    buscarDashboard().catch((err) => ({ erro: err.message })),
    buscarRetencaoW2().catch((err) => ({ erro: err.message })),
    buscarUptime(),
  ]);
  return {
    dashboard,
    w2,
    uptime,
    landingUrl: process.env.LANDING_ANALYTICS_URL || null,
  };
}

/**
 * Gera e envia o digest semanal para o ADMIN_PHONE.
 * Chamado pelo scheduler toda sexta às 9h.
 */
async function executarDigestSemanal() {
  if (!process.env.ADMIN_PHONE) {
    log('digest_sem_admin_phone', {});
    return;
  }
  try {
    const dados = await montarDados();
    const texto = montarDigestSemanal(dados);
    await enviarMensagem(process.env.ADMIN_PHONE, texto);
    log('digest_semanal_enviado', {
      novos_7d: dados.dashboard?.novos_7d ?? null,
      uptime: dados.uptime?.ratio ?? null,
    });
  } catch (err) {
    log('digest_semanal_erro', { erro: err.message });
  }
}

module.exports = { executarDigestSemanal, buscarUptime, montarDados };
