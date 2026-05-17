const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// Formata números para o padrão brasileiro (ex: 1234.5 → "1.234,50")
function brl(valor) {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Converte "YYYY-MM-DD" para "DD/MM" — retorna "??/??" se data ausente ou inválida
function dataCurta(dataIso) {
  if (!dataIso || typeof dataIso !== 'string') return '??/??';
  const partes = dataIso.split('-');
  if (partes.length < 3) return '??/??';
  const [, mes, dia] = partes;
  return `${dia}/${mes}`;
}

// Converte 'YYYY-MM' para 'Nome/YYYY' — retorna 'esse mês' se inválido
function nomeDoMes(mesRef) {
  if (!mesRef || typeof mesRef !== 'string') return 'esse mês';
  const [anoStr, mesStr] = mesRef.split('-');
  const ano = parseInt(anoStr, 10);
  const mes = parseInt(mesStr, 10);
  if (isNaN(ano) || isNaN(mes) || mes < 1 || mes > 12) return 'esse mês';
  return `${MESES[mes - 1]}/${ano}`;
}

function _mesAnteriorDe(mesRef) {
  const [ano, mes] = mesRef.split('-').map(Number);
  if (mes === 1) return `${ano - 1}-12`;
  return `${ano}-${String(mes - 1).padStart(2, '0')}`;
}

function _mesProximoDe(mesRef) {
  const [ano, mes] = mesRef.split('-').map(Number);
  if (mes === 12) return `${ano + 1}-01`;
  return `${ano}-${String(mes + 1).padStart(2, '0')}`;
}

function montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia) {
  const { totalGasto, qtdCompras, ticketMedio, topLojas = [], topItens = [] } = dadosAtual;

  const labelCompras = qtdCompras === 1 ? 'compra' : 'compras';

  const linhaTicket = qtdCompras > 1
    ? `\n📊 Ticket médio: R$ ${brl(ticketMedio)}`
    : '';

  const linhasLojas = topLojas.length === 1
    ? `${topLojas[0].loja} — R$ ${brl(topLojas[0].total)} (${topLojas[0].qtd}x)`
    : topLojas.map((l, i) => `${i + 1}. ${l.loja} — R$ ${brl(l.total)} (${l.qtd}x)`).join('\n');

  const blocoItens = topItens.length > 0
    ? `\n\n📦 *Itens que mais pesaram:*\n` +
      topItens.slice(0, 5).map((it, i) => `${i + 1}. ${it.nome} — R$ ${brl(it.gastoTotal)}`).join('\n')
    : '';

  let linhaComparacao;
  if (!dadosAnterior || !dadosAnterior.totalGasto) {
    const nomeProximo = nomeDoMes(_mesProximoDe(mesReferencia));
    linhaComparacao = `📅 Esse é o primeiro mês com dados — em ${nomeProximo} vou conseguir comparar.`;
  } else {
    const anterior = dadosAnterior.totalGasto;
    const diff = ((totalGasto - anterior) / anterior) * 100;
    const nomeAnterior = nomeDoMes(_mesAnteriorDe(mesReferencia));
    if (Math.abs(diff) < 5) {
      linhaComparacao = `📊 Mês parecido com o anterior — diferença de menos de 5%.`;
    } else if (diff > 0) {
      linhaComparacao = `📈 Comparado a ${nomeAnterior}: +${Math.round(diff)}% (R$ ${brl(totalGasto - anterior)} a mais)`;
    } else {
      linhaComparacao = `📉 Comparado a ${nomeAnterior}: ${Math.round(diff)}% (R$ ${brl(anterior - totalGasto)} a menos) 🎉`;
    }
  }

  return (
    `🗓️ *Seu mês no Economizei — ${nomeDoMes(mesReferencia)}*\n\n` +
    `💰 Você gastou R$ ${brl(totalGasto)} em ${qtdCompras} ${labelCompras}${linhaTicket}\n\n` +
    `🏪 *Onde você mais gastou:*\n${linhasLojas}` +
    `${blocoItens}\n\n` +
    `${linhaComparacao}\n\n` +
    `💡 *Continue mandando os cupons* — quanto mais dados, mais padrões eu vejo.\n\n` +
    `🎉 Como *Beta Fundador*, você tem 3 meses grátis do plano Pro quando ele chegar — automaticamente.`
  );
}

function montarResposta(dadosCompra, historico) {
  const { loja, total, data_compra, itens = [] } = dadosCompra;
  const { totalMes, qtdComprasMes } = historico;

  const itensPrincipais = itens.slice(0, 3);
  const extras = itens.length - 3;

  const linhasItens = itensPrincipais
    .map((item) => `- ${item.nome} — R$ ${brl(item.preco_total ?? item.preco)}`)
    .join('\n');

  const linhaExtras = extras > 0 ? `\n• ...e mais ${extras} ${extras === 1 ? 'item' : 'itens'}` : '';

  // Bloco de itens só aparece se houver pelo menos um item legível
  const blocoItens = itensPrincipais.length > 0
    ? `📦 *Itens principais:*\n${linhasItens}${linhaExtras}\n\n`
    : '';

  return (
    `✅ *Compra registrada!*\n\n` +
    `🏪 ${loja} — ${dataCurta(data_compra)}\n` +
    `💰 *Total: R$ ${brl(total)}*\n\n` +
    `${blocoItens}` +
    `📊 *Esse mês:* R$ ${brl(totalMes)} em ${qtdComprasMes} compra(s)`
  );
}

function montarMensagemErro(motivo, categoria = 'outro') {
  const dicas = {
    borrado:
      '📸 *A foto ficou meio borrada.*\n\n' +
      'Tira de novo seguindo essas dicas:\n' +
      '• Boa iluminação (perto da janela funciona)\n' +
      '• Cupom esticado, sem dobras\n' +
      '• Câmera paralela ao papel, sem ângulo',
    nao_supermercado:
      '🏪 *Esse cupom não é de supermercado.*\n\n' +
      'Por enquanto eu só leio cupons de mercado/atacadão. ' +
      'Farmácia, restaurante e posto ainda não — tô focado em economia de mercado primeiro.',
    sem_itens:
      '⚠️ *Li o cupom, mas os itens estão ilegíveis.*\n\n' +
      'Tira de novo bem focado na lista de itens — ou se preferir, salvo só o total dessa compra.',
    muito_longo:
      '📜 *Esse cupom é muito comprido — não consegui ver tudo.*\n\n' +
      'Tira em 2 fotos:\n' +
      '1. Topo até o meio\n' +
      '2. Do meio até o final (com o total)\n\n' +
      'Me manda as 2 separadas.',
    nao_e_cupom:
      '🤔 *Isso não parece um cupom fiscal.*\n\n' +
      'Manda a foto do papel que o caixa do mercado te deu — aquele com a lista dos produtos e o CNPJ no topo.',
    outro:
      '❌ Não consegui ler esse cupom.\n' +
      (motivo ? `${motivo}\n\n` : '') +
      'Para funcionar melhor:\n' +
      '- Boa iluminação\n' +
      '- Cupom esticado e sem dobras\n' +
      '- Câmera paralela ao papel, sem ângulo',
  };
  return dicas[categoria] || dicas.outro;
}

function montarAvisoSucessoParcial() {
  return (
    '⚠️ *Aviso:* Li o total certinho, mas os itens individuais não saíram legíveis.\n\n' +
    'Sua compra foi salva. Se quiser que os itens apareçam no resumo do mês, ' +
    'tira a foto de novo com mais luz na lista de produtos.'
  );
}

function montarMensagemBemVindo() {
  return (
    `📸 *Economizei* — você manda a foto do cupom, eu registro e acompanho seus gastos no mercado. Sem app, sem planilha, só foto.\n\n` +
    `Manda uma foto aqui pra começar!\n\n` +
    `🎉 Você entrou no *Beta Fundador* — já funciona de graça de verdade, e quando os planos pagos chegarem você ganha 3 meses grátis automático.\n\n` +
    `Comandos:\n` +
    `• */historico* ou */resumo* — suas últimas compras\n` +
    `• */limite* — quantos cupons restam esse mês\n` +
    `• */ajuda* — ver esta mensagem`
  );
}

function montarMensagemLimite() {
  return (
    `🏆 *10 cupons esse mês — você usou direitinho!*\n\n` +
    `Seu limite renova no dia 1 do próximo mês. Até lá, tudo que você registrou continua salvo.\n\n` +
    `🎉 Como *Beta Fundador*, quando o plano ilimitado chegar você já tem 3 meses grátis — automático, não precisa fazer nada.\n\n` +
    `Enquanto isso: manda */resumo* pra ver tudo que você registrou esse mês.`
  );
}

function diasAteFimDoMes() {
  const hoje = new Date();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const diff = ultimoDia.getDate() - hoje.getDate();
  const dataStr = `${String(ultimoDia.getDate()).padStart(2, '0')}/${String(ultimoDia.getMonth() + 1).padStart(2, '0')}`;
  return { dias: diff, dataLimite: dataStr };
}

function montarMensagemStatusLimite(status) {
  const { isPro, isBetaFundador, cuponsUsados, limite } = status;
  const { dias, dataLimite } = diasAteFimDoMes();

  if (isPro) {
    return (
      '✨ *Seu plano: Pro — Ilimitado*\n\n' +
      `Cupons usados esse mês: ${cuponsUsados}\n` +
      'Manda quantos quiser, sem limite!'
    );
  }

  const restantes = Math.max(0, limite - cuponsUsados);
  const planoLabel = isBetaFundador ? 'Beta Fundador Grátis' : 'Grátis';

  if (restantes === 0) {
    return (
      `🏆 *Seu plano: ${planoLabel}*\n\n` +
      `Você já usou os ${limite} cupons desse mês — uso completo, parabéns!\n` +
      `Seu limite renova em ${dias} ${dias === 1 ? 'dia' : 'dias'} (${dataLimite}).\n\n` +
      (isBetaFundador
        ? '🎉 Como *Beta Fundador*, quando o plano Pro chegar você ganha 3 meses grátis e tudo ilimitado — automático.'
        : '💡 Quando o plano Pro chegar, vai ser ilimitado.')
    );
  }

  return (
    `📊 *Seu plano: ${planoLabel}*\n\n` +
    `Cupons esse mês: *${cuponsUsados} de ${limite}* usados\n` +
    `Restam: ${restantes} ${restantes === 1 ? 'cupom' : 'cupons'} ` +
    `(até ${dataLimite})\n\n` +
    (isBetaFundador
      ? '🎉 Como *Beta Fundador*, quando o Pro chegar você ganha 3 meses grátis automaticamente.'
      : '')
  ).trim();
}

function montarMensagemAlerta(percentual, mediaHistorica) {
  return (
    `⚠️ *Atenção!* Essa compra foi ${Math.round(percentual)}% maior que sua média habitual (R$ ${brl(mediaHistorica)}).`
  );
}

function montarOnboarding1() {
  return (
    `📸 *Economizei* — você manda a foto do cupom, eu registro e acompanho seus gastos no mercado. Sem app, sem planilha, só foto.\n\n` +
    `🎉 Você entrou como *Beta Fundador*. Quando chegar o plano pago, você ganha 3 meses grátis — automático.\n\n` +
    `Quando for ao mercado, manda a foto do cupom aqui. Aguardo! 📲`
  );
}

function montarOnboarding2() {
  return (
    `É sério — é literalmente só foto. 📸\n\n` +
    `Sem cadastro. Sem formulário. Sem digitar nada.\n\n` +
    `Quando for ao mercado, manda a foto do cupom aqui.`
  );
}

function montarOnboarding3() {
  return (
    `💡 *Esse foi seu primeiro registro.*\n\n` +
    `Daqui um mês você vai começar a ver padrões que hoje não dá pra ver — onde tá gastando mais, o que sobe de preço, onde dá pra economizar.\n\n` +
    `Na próxima ida ao mercado, manda o cupom de novo. 👊`
  );
}

function montarOnboarding4(dadosCompra, totalMes) {
  const { loja, total } = dadosCompra;
  return (
    `📊 *Duas compras registradas — já dá pra ver o padrão começando.*\n\n` +
    `${loja}: R$ ${brl(total)} hoje. No mês até agora: R$ ${brl(totalMes)}.\n\n` +
    `É isso. Você está no controle agora. 🎯\n\n` +
    `O bot acompanha tudo automaticamente — continua mandando os cupons depois de cada compra!`
  );
}

module.exports = {
  nomeDoMes,
  montarResposta,
  montarMensagemErro,
  montarAvisoSucessoParcial,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemStatusLimite,
  montarMensagemAlerta,
  montarOnboarding1,
  montarOnboarding2,
  montarOnboarding3,
  montarOnboarding4,
  montarResumoMensal,
};
