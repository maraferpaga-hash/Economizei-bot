const cron = require('node-cron');
const { executarResumoMensal } = require('./monthlySummary');
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
}

module.exports = { iniciar, ehUltimoDiaDoMes };
