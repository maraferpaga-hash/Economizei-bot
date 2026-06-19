const { listarUsuariosAtivosNoMes, buscarComprasDoMes, verificarResumoJaEnviado,
        marcarResumoEnviado, buscarGastosPorCategoria, buscarTotaisMensais } = require('./supabase');
const { enviarMensagem, enviarImagem } = require('./zapi');
const { montarResumoMensal, nomeDoMes } = require('./formatter');
const { gerarUrlGraficoCategorias } = require('./charts');
const { calcularEconomia } = require('./insights');
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

      // F4 — economia anual pro reforço no resumo (degrada pra null em erro).
      let economia = null;
      try {
        const totais = await buscarTotaisMensais(phone, 12);
        economia = calcularEconomia(totais, { mesAlvo: mesReferencia });
      } catch (errEco) {
        log('resumo_economia_erro', { phone: maskPhone(phone), erro: errEco.message });
      }

      const texto = montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia, economia);

      await enviarMensagem(phone, texto);
      await marcarResumoEnviado(phone, mesReferencia, dadosAtual.qtdCompras, dadosAtual.totalGasto);

      // Tenta enviar gráfico de categorias logo após o texto do resumo
      try {
        const dadosCat = await buscarGastosPorCategoria(phone, mesReferencia);
        if (dadosCat && dadosCat.length > 0) {
          const titulo   = nomeDoMes(mesReferencia);
          const chartUrl = gerarUrlGraficoCategorias(dadosCat, titulo);
          if (chartUrl) {
            await new Promise(r => setTimeout(r, 800));
            await enviarImagem(phone, chartUrl, `📊 Gastos por categoria — ${titulo}`);
          }
        }
      } catch (errCat) {
        // Falha no gráfico não impede o resumo de ser marcado como enviado
        log('resumo_grafico_erro', { phone: maskPhone(phone), erro: errCat.message });
      }

      // throttle: 1 segundo entre usuários pra não estourar rate-limit do Z-API
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
