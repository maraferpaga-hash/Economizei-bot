const { listarUsuariosAtivosNoMes, buscarComprasDoMes, verificarResumoJaEnviado,
        marcarResumoEnviado, buscarGastosPorCategoria, buscarTotaisMensais,
        buscarCategoriasSuperfluas } = require('./supabase');
const { enviarMensagem, enviarImagem } = require('./zapi');
const { montarResumoMensal, nomeDoMes } = require('./formatter');
const { gerarUrlGraficoCategorias } = require('./charts');
const { calcularEconomia, buscarGastoSuperfluo } = require('./insights');
const { log, maskPhone } = require('./logger');

// ---------------------------------------------------------------------------
// Dependências injetáveis (las-03 — cobertura de testes do resumo mensal).
//
// O resumo de fim de mês é hoje a ÚNICA mensagem proativa do produto (o
// reengajamento foi desligado na cod-0068), e não tinha um único teste. Ele
// fala com banco, Z-API e relógio — nada disso pode ser exercitado em teste
// unitário sem uma costura.
//
// A costura escolhida é a mesma já usada no núcleo do recibo: um 3º parâmetro
// OPCIONAL com as dependências. Em produção ninguém passa nada e o
// comportamento é byte a byte o mesmo de antes (os dois call sites —
// scheduler.js e index.js — continuam chamando com 1 e 2 argumentos).
//
// `dormir` está aqui porque os dois `setTimeout` (800ms do gráfico, 1000ms de
// throttle entre usuários) tornariam a suíte lenta e não-determinística; o
// teste injeta um dormir instantâneo E confere que os dois delays acontecem.
// ---------------------------------------------------------------------------
const DEPS_PADRAO = {
  listarUsuariosAtivosNoMes,
  buscarComprasDoMes,
  verificarResumoJaEnviado,
  marcarResumoEnviado,
  buscarGastosPorCategoria,
  buscarTotaisMensais,
  buscarCategoriasSuperfluas,
  enviarMensagem,
  enviarImagem,
  montarResumoMensal,
  nomeDoMes,
  gerarUrlGraficoCategorias,
  calcularEconomia,
  buscarGastoSuperfluo,
  dormir: (ms) => new Promise((r) => setTimeout(r, ms)),
};

function calcularMesAnterior(mesRef) {
  const [ano, mes] = mesRef.split('-').map(Number);
  if (mes === 1) return `${ano - 1}-12`;
  return `${ano}-${String(mes - 1).padStart(2, '0')}`;
}

async function executarResumoMensal(mesReferencia, phoneEspecifico = null, deps = {}) {
  const d = { ...DEPS_PADRAO, ...deps };

  log('resumo_mensal_iniciando', { mes: mesReferencia, phone_especifico: phoneEspecifico ? 'sim' : 'nao' });

  const phones = phoneEspecifico
    ? [phoneEspecifico]
    : await d.listarUsuariosAtivosNoMes(mesReferencia);

  let enviados = 0, pulados = 0, erros = 0;
  const mesAnterior = calcularMesAnterior(mesReferencia);

  for (const phone of phones) {
    try {
      const jaEnviado = await d.verificarResumoJaEnviado(phone, mesReferencia);
      if (jaEnviado) { pulados++; continue; }

      const dadosAtual = await d.buscarComprasDoMes(phone, mesReferencia);
      if (!dadosAtual) { pulados++; continue; }

      const dadosAnterior = await d.buscarComprasDoMes(phone, mesAnterior);

      // F4 — economia anual pro reforço no resumo (degrada pra null em erro).
      let economia = null;
      try {
        const totais = await d.buscarTotaisMensais(phone, 12);
        economia = d.calcularEconomia(totais, { mesAlvo: mesReferencia });
      } catch (errEco) {
        log('resumo_economia_erro', { phone: maskPhone(phone), erro: errEco.message });
      }

      // cod-0032 — bloco de supérfluo no resumo. Busca as categorias do mês
      // ANTES do texto (reusadas pro gráfico logo abaixo). Degradação segura:
      // qualquer falha → superfluo null → o bloco some, o resumo sai normal.
      // Só calcula quando o mês TEM gastos por categoria — o "bom sinal" é
      // "gastou mas nada de supérfluo", nunca "mês sem compra".
      let dadosCat = null;
      let superfluo = null;
      try {
        dadosCat = await d.buscarGastosPorCategoria(phone, mesReferencia);
        if (dadosCat && dadosCat.length > 0) {
          const categoriasSup = await d.buscarCategoriasSuperfluas(phone);
          superfluo = d.buscarGastoSuperfluo(dadosCat, categoriasSup);
        }
      } catch (errSup) {
        log('resumo_superfluo_erro', { phone: maskPhone(phone), erro: errSup.message });
      }

      const texto = d.montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia, economia, superfluo);

      await d.enviarMensagem(phone, texto);
      await d.marcarResumoEnviado(phone, mesReferencia, dadosAtual.qtdCompras, dadosAtual.totalGasto);

      // Tenta enviar gráfico de categorias logo após o texto do resumo
      try {
        if (dadosCat && dadosCat.length > 0) {
          const titulo   = d.nomeDoMes(mesReferencia);
          const chartUrl = d.gerarUrlGraficoCategorias(dadosCat, titulo);
          if (chartUrl) {
            await d.dormir(800);
            await d.enviarImagem(phone, chartUrl, `📊 Gastos por categoria — ${titulo}`);
          }
        }
      } catch (errCat) {
        // Falha no gráfico não impede o resumo de ser marcado como enviado
        log('resumo_grafico_erro', { phone: maskPhone(phone), erro: errCat.message });
      }

      // throttle: 1 segundo entre usuários pra não estourar rate-limit do Z-API
      await d.dormir(1000);
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
