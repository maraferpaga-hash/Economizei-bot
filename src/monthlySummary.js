const { listarUsuariosAtivosNoMes, buscarComprasDoMes, verificarResumoJaEnviado,
        marcarResumoEnviado } = require('./supabase');
const { enviarMensagem } = require('./zapi');
const { montarResumoMensal } = require('./formatter');
const { log, maskPhone } = require('./logger');

function calcularMesAnterior(mesRef) {
  const [ano, mes] = mesRef.split('-').map(Number);
  if (mes === 1) return `${ano - 1}-12`;
  return `${ano}-${String(mes - 1).padStart(2, '0')}`;
}

async function executarResumoMensal(mesReferencia, phoneEspecifico = null) {
  log('resumo_mensal_iniciando', { mes: mesReferencia, phone_especifico: phoneEspecifico ? 'sim' : 'nao' });

  const phones = phoneEspecifico
    ? [phoneEspecifico]
    : await listarUsuariosAtivosNoMes(mesReferencia);

  let enviados = 0, pulados = 0, erros = 0;
  const mesAnterior = calcularMesAnterior(mesReferencia);

  for (const phone of phones) {
    try {
      const jaEnviado = await verificarResumoJaEnviado(phone, mesReferencia);
      if (jaEnviado) { pulados++; continue; }

      const dadosAtual = await buscarComprasDoMes(phone, mesReferencia);
      if (!dadosAtual) { pulados++; continue; }

      const dadosAnterior = await buscarComprasDoMes(phone, mesAnterior);
      const texto = montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia);

      await enviarMensagem(phone, texto);
      await marcarResumoEnviado(phone, mesReferencia, dadosAtual.qtdCompras, dadosAtual.totalGasto);

      // throttle: 1 mensagem por segundo pra não estourar rate-limit do Z-API
      await new Promise(r => setTimeout(r, 1000));
      enviados++;
    } catch (err) {
      log('resumo_mensal_erro', { phone: maskPhone(phone), erro: err.message });
      erros++;
    }
  }

  log('resumo_mensal_finalizado', { mes: mesReferencia, enviados, pulados, erros, total: phones.length });
  return { enviados, pulados, erros };
}

module.exports = { executarResumoMensal, calcularMesAnterior };
