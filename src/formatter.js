// Formata números para o padrão brasileiro (ex: 1234.5 → "1.234,50")
function brl(valor) {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Converte "YYYY-MM-DD" para "DD/MM"
function dataCurta(dataIso) {
  const [, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}`;
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

  return (
    `✅ *Compra registrada!*\n\n` +
    `🏪 ${loja} — ${dataCurta(data_compra)}\n` +
    `💰 *Total: R$ ${brl(total)}*\n\n` +
    `📦 *Itens principais:*\n${linhasItens}${linhaExtras}\n\n` +
    `📊 *Esse mês:* R$ ${brl(totalMes)} em ${qtdComprasMes} compra(s)`
  );
}

function montarMensagemErro(motivo) {
  return (
    `❌ Não consegui ler esse cupom.\n` +
    `${motivo}\n\n` +
    `Para funcionar melhor:\n` +
    `- Boa iluminação\n` +
    `- Cupom esticado e sem dobras\n` +
    `- Câmera paralela ao papel, sem ângulo`
  );
}

function montarMensagemBemVindo() {
  return (
    `👋 Olá! Sou o *Economizei*.\n\n` +
    `📸 Me manda uma foto do cupom do mercado e eu registro tudo automaticamente.\n\n` +
    `💡 Outros comandos:\n` +
    `- */historico* — ver suas últimas compras\n` +
    `- */ajuda* — ver esta mensagem`
  );
}

function montarMensagemLimite() {
  return (
    `📊 Você já usou suas 3 fotos gratuitas do mês.\n\n` +
    `Para continuar sem limite:\n` +
    `💳 *Plano Pro — R$ 9,90/mês*\n` +
    `👉 [link de pagamento]\n\n` +
    `Responda *'ativei'* após pagar para liberar.`
  );
}

function montarMensagemAlerta(percentual, mediaHistorica) {
  return (
    `⚠️ *Atenção!* Essa compra foi ${Math.round(percentual)}% maior que sua média habitual (R$ ${brl(mediaHistorica)}).`
  );
}

module.exports = {
  montarResposta,
  montarMensagemErro,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemAlerta,
};
