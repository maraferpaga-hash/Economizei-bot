const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// Labels em português das categorias (espelho de charts.js para evitar dependência circular)
const LABELS_CATEGORIA = {
  carnes:     'Carnes e Aves',
  hortifruti: 'Hortifruti',
  laticinios: 'Laticínios',
  padaria:    'Padaria',
  bebidas:    'Bebidas',
  limpeza:    'Limpeza',
  mercearia:  'Mercearia',
  congelados: 'Congelados',
  doces:      'Doces e Petiscos',
  outros:     'Outros',
  nao_mercado:'Outros (não-mercado)',
  nao_identificado: 'Não identificado',
};

// Chave PIX configurável via env. Em desenvolvimento, mostra placeholder.
// IMPORTANTE: configurar PIX_KEY no .env antes do deploy.
function pixKey() {
  return process.env.PIX_KEY || '[chave PIX a configurar]';
}

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

function montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia, economia = null) {
  const { totalGasto, qtdCompras, ticketMedio, topLojas = [], topItens = [] } = dadosAtual;

  const labelCompras = qtdCompras === 1 ? 'compra' : 'compras';

  const sufixoTicket = qtdCompras > 1
    ? ` · ticket médio R$ ${brl(ticketMedio)}`
    : '';

  const linhasLojas = topLojas.length === 1
    ? `${topLojas[0].loja} — R$ ${brl(topLojas[0].total)} (${topLojas[0].qtd}x)`
    : topLojas.map((l, i) => `${i + 1}. ${l.loja} — R$ ${brl(l.total)} (${l.qtd}x)`).join('\n');

  // Itens que mais pesaram: 3 (os 2 últimos raramente mudam a decisão).
  const blocoItens = topItens.length > 0
    ? `\n\n📦 *Itens que mais pesaram:*\n` +
      topItens.slice(0, 3).map((it, i) => `${i + 1}. ${it.nome} — R$ ${brl(it.gastoTotal)}`).join('\n')
    : '';

  let linhaComparacao;
  if (!dadosAnterior || !dadosAnterior.totalGasto) {
    const nomeProximo = nomeDoMes(_mesProximoDe(mesReferencia));
    linhaComparacao = `📅 Primeiro mês com dados — em ${nomeProximo} já dá pra comparar.`;
  } else {
    const anterior = dadosAnterior.totalGasto;
    const diff = ((totalGasto - anterior) / anterior) * 100;
    const nomeAnterior = nomeDoMes(_mesAnteriorDe(mesReferencia));
    if (Math.abs(diff) < 5) {
      linhaComparacao = `📊 Parecido com ${nomeAnterior} — diferença de menos de 5%.`;
    } else if (diff > 0) {
      linhaComparacao = `📈 +${Math.round(diff)}% que ${nomeAnterior} (R$ ${brl(totalGasto - anterior)} a mais)`;
    } else {
      linhaComparacao = `📉 ${Math.round(diff)}% que ${nomeAnterior} (R$ ${brl(anterior - totalGasto)} a menos) 🎉`;
    }
  }

  // F4 — economia anual sobe pro topo, logo abaixo do total (Camada 2/3 do norte).
  const linhaEconomia = (economia && economia.economiaAno > 0)
    ? `\n💚 No ano, já economizou R$ ${brl(economia.economiaAno)} nos meses abaixo da média.`
    : '';

  return (
    `🗓️ *Seu mês — ${nomeDoMes(mesReferencia)}*\n\n` +
    `💰 *R$ ${brl(totalGasto)}* em ${qtdCompras} ${labelCompras}${sufixoTicket}\n` +
    `${linhaComparacao}` +
    `${linhaEconomia}\n\n` +
    `🏪 *Onde mais gastou:*\n${linhasLojas}` +
    `${blocoItens}`
  );
}

function montarResposta(dadosCompra, historico) {
  const { loja, total, data_compra, itens = [], tipo = 'mercado' } = dadosCompra;
  const { totalMes, qtdComprasMes } = historico;

  // Decisão 2026-06-04: listar TODOS os itens registrados (antes cortava em 3).
  // Mostra quantidade quando > 1: "• 2x Arroz 5kg — R$ 19,80".
  const formatarLinha = (item) => {
    const qtd = Number(item.quantidade) || 1;
    const prefixoQtd = qtd > 1 ? `${qtd}x ` : '';
    const preco = item.preco_total ?? item.preco_unitario ?? item.preco;
    return `• ${prefixoQtd}${item.nome} — R$ ${brl(preco)}`;
  };

  // Guarda contra o limite (~4096 chars) de uma mensagem do WhatsApp: se a lista
  // completa estourar, mostra o máximo que cabe e indica quantos ficaram de fora.
  const LIMITE_CHARS_ITENS = 3000;
  let linhasItens = '';
  let mostrados = 0;
  for (const item of itens) {
    const linha = formatarLinha(item);
    if (linhasItens.length + linha.length + 1 > LIMITE_CHARS_ITENS) break;
    linhasItens += (linhasItens ? '\n' : '') + linha;
    mostrados++;
  }
  const ocultos = itens.length - mostrados;
  const linhaOcultos = ocultos > 0
    ? `\n• ...e mais ${ocultos} ${ocultos === 1 ? 'item' : 'itens'} (cupom longo demais pra uma mensagem só)`
    : '';

  // Cabeçalho: título com loja+data e os DOIS valores que importam (compra + mês)
  // no topo, antes da lista de itens. Resolve o "número escondido no meio".
  const tituloLinha = tipo === 'outros'
    ? `✅ *Cupom registrado* — ${loja}, ${dataCurta(data_compra)}\n` +
      `💰 *R$ ${brl(total)}* · _Outros (não-mercado)_\n`
    : `✅ *Compra registrada* — ${loja}, ${dataCurta(data_compra)}\n` +
      `💰 *R$ ${brl(total)}* nesta compra\n`;

  const linhaMes = `📊 *R$ ${brl(totalMes)}* no mês (${qtdComprasMes} ${qtdComprasMes === 1 ? 'compra' : 'compras'})`;

  // Lista completa dos itens (decisão 2026-06-04), agora depois dos valores.
  const blocoItens = itens.length > 0
    ? `\n\n📦 *${itens.length} ${itens.length === 1 ? 'item' : 'itens'}:*\n${linhasItens}${linhaOcultos}`
    : '';

  return tituloLinha + linhaMes + blocoItens;
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
    `📸 *Economizei* — você manda a foto do cupom, eu organizo seus gastos no mercado. Sem app, sem planilha, só foto.\n\n` +
    `Manda uma foto de cupom aqui pra começar!\n\n` +
    `*Comandos:*\n` +
    `• */gastos* — gráfico + raio-X dos seus gastos por categoria\n` +
    `• */inflacao* — o que subiu ou caiu de preço nos seus itens\n` +
    `• */economia* — quanto você já economizou perto da sua média\n` +
    `• */historico* ou */resumo* — suas últimas compras\n` +
    `• */limite* — quantos cupons restam esse mês\n` +
    `• */planos* — ver os planos disponíveis\n` +
    `• */convidar* — convide um amigo e os dois ganham funções Pro\n` +
    `• */privacidade* — sobre como usamos seus dados\n` +
    `• */apagar* — apaga todo seu histórico\n` +
    `• */ajuda* — vê esta mensagem de novo\n\n` +
    `💡 O *Grátis* deixa você mandar até 10 cupons/mês — cobre quem vai ao mercado 2-3x por semana. Pra ver o que o Pro oferece (cupons ilimitados, comparativo entre mercados), manda */planos*.`
  );
}

function montarMensagemLimite() {
  return (
    `📊 *Você registrou os 10 cupons do plano Grátis este mês.*\n\n` +
    `Isso é ótimo — significa que você está acompanhando os gastos de verdade. Tudo que registrou continua salvo; mande */historico* para ver. Seu limite renova no dia 1.\n\n` +
    `Para quem usa toda semana, o passo natural é o plano *Individual* (R$ 9,90/mês): cupons ilimitados e comparativo entre mercados, para saber onde cada item sai mais barato.\n\n` +
    `Mande */planos* para assinar via PIX.`
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
  // isBetaFundador é mantido como flag técnica de cohort (decisão 2026-05-19),
  // mas não aparece mais em copy promocional (decisão 2026-05-22).
  const { isPro, cuponsUsados, limite } = status;
  const { dias, dataLimite } = diasAteFimDoMes();

  if (isPro) {
    return (
      '✨ *Seu plano: Pro — Ilimitado*\n\n' +
      `Cupons esse mês: ${cuponsUsados}\n` +
      'Manda quantos quiser, sem limite!'
    );
  }

  const restantes = Math.max(0, limite - cuponsUsados);

  if (restantes === 0) {
    return (
      `🏆 *Seu plano: Grátis*\n\n` +
      `Você já usou os ${limite} cupons desse mês — uso completo, parabéns!\n` +
      `Seu limite renova em ${dias} ${dias === 1 ? 'dia' : 'dias'} (${dataLimite}).\n\n` +
      `Se não quiser esperar, o plano *Individual* (R$9,90/mês) tem cupons ilimitados — manda */planos* pra ver como assinar.`
    );
  }

  return (
    `📊 *Seu plano: Grátis*\n\n` +
    `Cupons esse mês: *${cuponsUsados} de ${limite}* usados\n` +
    `Restam: ${restantes} ${restantes === 1 ? 'cupom' : 'cupons'} (até ${dataLimite})\n\n` +
    `Quando quiser cupons ilimitados + comparativo entre mercados, manda */planos*.`
  );
}

function montarMensagemPlanos() {
  return (
    `💰 *Planos do Economizei*\n\n` +
    `*🆓 Grátis — R$0/mês*\n` +
    `✓ Foto do cupom → análise na hora\n` +
    `✓ Resumo automático no fim do mês\n` +
    `✓ Alerta quando gastar acima da sua média\n` +
    `✓ Histórico completo dos seus gastos\n` +
    `• Limite: 10 cupons/mês\n\n` +
    `*⭐ Individual — R$9,90/mês*\n` +
    `Tudo do Grátis +\n` +
    `✓ Cupons *ilimitados*\n` +
    `✓ *Comparativo entre mercados* (qual tá mais barato pros itens que você compra)\n` +
    `✓ *Alerta inteligente* (preditivo + categorizado por tipo de item)\n\n` +
    `*👨‍👩‍👧 Família — R$15/mês* (até 3 pessoas)\n` +
    `Tudo do Individual +\n` +
    `✓ Visão consolidada da família\n` +
    `✓ Comparação de gastos por membro\n\n` +
    `*👨‍👩‍👧‍👦 Família+ — R$22/mês* (até 5 pessoas)\n` +
    `Igual ao Família, com 2 vagas adicionais.\n\n` +
    `*💳 Assinar no cartão (cobrança automática):*\n` +
    `Você cadastra o cartão uma vez e a renovação é automática todo mês — sem precisar pagar de novo. Para começar, mande:\n` +
    `• */assinar individual*\n` +
    `• */assinar familia*\n` +
    `• */assinar familia+*\n\n` +
    `*📱 Prefere PIX?* Mande */pix* e eu te passo a chave.\n\n` +
    `*Pode continuar usando o Grátis* — ele resolve o básico bem. 👍`
  );
}

// Instruções de pagamento via PIX (alternativa manual ao cartão).
function montarMensagemPix() {
  return (
    `📱 *Pagar via PIX*\n\n` +
    `1. Faça um PIX do valor do plano para a chave:\n` +
    `   *${pixKey()}*\n` +
    `   💰 R$9,90 (Individual) / R$15 (Família) / R$22 (Família+)\n` +
    `2. Envie o comprovante aqui no chat\n` +
    `3. Em até 1h eu ativo seu plano\n\n` +
    `_Dica: no cartão (*/planos*) a renovação é automática — você não precisa repetir o pagamento todo mês._`
  );
}

// Pede o e-mail após o usuário escolher um plano para assinar no cartão.
function montarMensagemPedirEmail(planoLabel) {
  return (
    `Ótimo! Você escolheu o plano *${planoLabel}*. 💳\n\n` +
    `Me passa o seu *e-mail*? Preciso dele para gerar a sua assinatura no Mercado Pago e te enviar o link de pagamento.\n\n` +
    `_É só responder com o e-mail. Para cancelar, mande */cancelar*._`
  );
}

// Envia o link de checkout do Mercado Pago.
function montarMensagemLinkAssinatura(planoLabel, valorTexto, initPoint) {
  return (
    `Pronto! Aqui está o link para assinar o plano *${planoLabel}* (R$ ${valorTexto}/mês): 👇\n\n` +
    `${initPoint}\n\n` +
    `No link você cadastra o cartão com segurança pelo *Mercado Pago* (eu não tenho acesso aos dados do seu cartão). A partir daí, a cobrança é *automática todo mês* — sem repetir nada.\n\n` +
    `Assim que o pagamento for aprovado, eu ativo seu plano aqui e te aviso. ✅`
  );
}

// Confirmação enviada quando a assinatura é aprovada (webhook authorized).
function montarMensagemAssinaturaAtivada(planoLabel) {
  return (
    `🎉 *Plano ${planoLabel} ativado!*\n\n` +
    `Sua assinatura está confirmada e a renovação será automática todo mês. Agora você tem:\n` +
    `✓ Cupons *ilimitados*\n` +
    `✓ Comparativo entre mercados\n` +
    `✓ Alerta inteligente\n\n` +
    `Obrigado por apoiar o Economizei! 💚\n` +
    `_Para gerenciar ou cancelar a qualquer momento: */cancelar*._`
  );
}

// Confirmação de cancelamento.
function montarMensagemAssinaturaCancelada() {
  return (
    `Sua assinatura foi *cancelada*. Não haverá novas cobranças. ✅\n\n` +
    `Você volta para o plano *Grátis* (10 cupons/mês) e seu histórico continua salvo normalmente.\n\n` +
    `Se mudar de ideia, é só mandar */planos*. 👍`
  );
}

// E-mail inválido durante o fluxo de assinatura.
function montarMensagemEmailInvalido() {
  return (
    `Hmm, esse e-mail não parece válido. 🤔\n\n` +
    `Me manda de novo no formato *nome@email.com*, por favor.\n\n` +
    `_Para desistir, mande */cancelar*._`
  );
}

// Falha ao gerar o link de assinatura (erro técnico no MP).
function montarMensagemErroAssinatura() {
  return (
    `Ops, não consegui gerar seu link de assinatura agora. 😕\n\n` +
    `Pode tentar de novo em alguns minutos mandando */planos*. Se preferir, dá para pagar via PIX: */pix*.`
  );
}

// Cobrança recorrente recusada (cartão sem saldo/expirado etc.).
function montarMensagemPagamentoFalhou() {
  return (
    `⚠️ *Não consegui renovar sua assinatura*\n\n` +
    `A cobrança no seu cartão foi recusada. O Mercado Pago vai tentar de novo automaticamente nos próximos dias.\n\n` +
    `Se quiser, verifique o cartão cadastrado ou troque a forma de pagamento. Seu plano segue ativo enquanto as tentativas continuam.`
  );
}

// Usuário já é assinante ativo.
function montarMensagemJaAssinante(planoLabel) {
  return (
    `Você já tem o plano *${planoLabel}* ativo. 💚\n\n` +
    `Cupons ilimitados liberados. Para gerenciar ou cancelar: */cancelar*.`
  );
}

/**
 * Texto de breakdown de gastos por categoria (enviado junto ou após o gráfico).
 * @param {Array<{categoria: string, total: number}>} dados - Ordenado por total desc
 * @param {string} mesReferencia - "YYYY-MM"
 */
// Capitaliza a primeira letra de um nome canônico (que vem em minúsculas).
function _tituloItem(s) {
  if (!s || typeof s !== 'string') return 'Item';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// F2 — bloco de conclusão do /gastos a partir da análise de insights.js.
// Retorna '' quando não há conclusão (mantém o /gastos funcionando sem análise).
function _blocoConclusaoRaioX(analise) {
  if (!analise || !analise.temConclusao) return '';

  const labelTop = LABELS_CATEGORIA[analise.top.categoria] || analise.top.categoria;
  let linha = `🔎 *${labelTop}* foi seu maior gasto (${analise.top.pct}% do mês`;
  if (analise.comparativo === 'acima') linha += ', acima da sua média';
  else if (analise.comparativo === 'abaixo') linha += ', abaixo da sua média';
  else if (analise.comparativo === 'em_linha') linha += ', em linha com sua média';
  linha += ').';

  let dica = '';
  if (analise.candidatoCorte) {
    const labelCorte = LABELS_CATEGORIA[analise.candidatoCorte.categoria] || analise.candidatoCorte.categoria;
    dica = `\n💡 Pra aliviar sem mexer no essencial, *${labelCorte}* (R$ ${brl(analise.candidatoCorte.valor)}) costuma ser o ponto mais fácil de cortar.`;
  } else if (analise.mesesHistorico === 0) {
    dica = '\n💡 No mês que vem eu já comparo com sua média e te aviso o que saiu do padrão.';
  }

  return `\n\n${linha}${dica}`;
}

/**
 * Texto de breakdown de gastos por categoria (enviado junto ou após o gráfico).
 * @param {Array<{categoria: string, total: number}>} dados - Ordenado por total desc
 * @param {string} mesReferencia - "YYYY-MM"
 * @param {object|null} analise - resultado de analisarRaioXCategorias (F2), opcional
 */
function montarMensagemGastos(dados, mesReferencia, analise = null) {
  if (!dados || dados.length === 0) {
    return (
      '📊 Ainda não tenho dados de categoria para esse período.\n\n' +
      'Continue mandando os cupons — a partir desta semana cada cupom já vem com a categoria de cada item.'
    );
  }

  const total = dados.reduce((s, d) => s + d.total, 0);

  const linhas = dados.map((d, i) => {
    const pct   = Math.round((d.total / total) * 100);
    const label = LABELS_CATEGORIA[d.categoria] || d.categoria;
    return `${i + 1}. ${label}: *R$ ${brl(d.total)}* (${pct}%)`;
  });

  return (
    `📊 *Gastos por categoria — ${nomeDoMes(mesReferencia)}*\n\n` +
    linhas.join('\n') +
    `\n\n💰 *Total: R$ ${brl(total)}*` +
    _blocoConclusaoRaioX(analise) +
    `\n\n_Mande /gastos a qualquer hora para ver o gráfico atualizado._`
  );
}

// F1 — mensagem de inflação pessoal. Recebe o resultado de analisarInflacaoPessoal.
function montarMensagemInflacao(analise) {
  if (!analise || !analise.temDados) {
    return (
      '📈 *Inflação dos seus itens*\n\n' +
      'Ainda não tenho preços repetidos suficientes pra comparar. Assim que você comprar os mesmos itens de novo ao longo das semanas, eu te mostro o que subiu e o que caiu de preço — com base nos seus próprios cupons. 📸'
    );
  }

  const subiram = analise.subiram.slice(0, 4);
  const cairam = analise.cairam.slice(0, 2);
  const partes = ['📈 *Inflação dos seus itens*\n'];

  if (subiram.length > 0) {
    partes.push('*Subiram de preço:*');
    for (const m of subiram) {
      partes.push(`• ${_tituloItem(m.nome)}: R$ ${brl(m.precoAntigo)} → R$ ${brl(m.precoNovo)} (+${m.variacaoPct}%)`);
    }
  }

  if (cairam.length > 0) {
    partes.push(`${subiram.length > 0 ? '\n' : ''}*Caíram de preço:* 🎉`);
    for (const m of cairam) {
      partes.push(`• ${_tituloItem(m.nome)}: R$ ${brl(m.precoAntigo)} → R$ ${brl(m.precoNovo)} (${m.variacaoPct}%)`);
    }
  }

  partes.push('\n_Comparei o preço unitário desses itens nos seus cupons ao longo do tempo._');
  return partes.join('\n');
}

// F4 — mensagem de "quanto você já economizou". Recebe o resultado de calcularEconomia.
function montarMensagemEconomia(analise) {
  if (!analise || !analise.temDados) {
    return (
      '💚 *Quanto você já economizou*\n\n' +
      'Ainda preciso de pelo menos dois meses de compras pra calcular sua economia. Continue mandando os cupons que logo eu te mostro. 📸'
    );
  }

  const media = `R$ ${brl(analise.mediaRef)}`;
  const linhaAno = analise.economiaAno > 0
    ? `\n\nNo ano, somando os meses em que você ficou abaixo da média, já são *R$ ${brl(analise.economiaAno)}* que ficaram no seu bolso. 🎉`
    : '';

  if (analise.economiaMes > 0.005) {
    return (
      '💚 *Boa notícia!*\n\n' +
      `Esse mês você gastou *R$ ${brl(analise.economiaMes)} abaixo* da sua média de mercado (${media} por mês).` +
      linhaAno
    );
  }

  if (analise.economiaMes < -0.005) {
    return (
      '📊 *Sua economia*\n\n' +
      `Esse mês você gastou cerca de R$ ${brl(Math.abs(analise.economiaMes))} a mais que sua média de mercado (${media} por mês). Acontece — o que conta é a tendência.` +
      (analise.economiaAno > 0
        ? `\n\nE no ano você já economizou *R$ ${brl(analise.economiaAno)}* nos meses em que ficou abaixo da média. Dá pra repetir. 💪`
        : '')
    );
  }

  // Praticamente em linha com a média
  return (
    '📊 *Sua economia*\n\n' +
    `Esse mês você gastou bem em linha com sua média de mercado (${media} por mês).` +
    linhaAno
  );
}

function montarMensagemPrivacidade() {
  return (
    `🔒 *Privacidade no Economizei*\n\n` +
    `*Seus dados pessoais:* seus cupons e histórico ficam guardados na sua conta. Só você tem acesso. Para apagar tudo: */apagar*\n\n` +
    `*Compartilhamento anônimo de preços:*\n` +
    `Para alimentar o comparativo entre mercados, usamos os preços dos seus itens de forma *totalmente anônima* — sem seu nome, número ou qualquer dado pessoal. Isso ajuda todos os usuários a saberem onde cada produto sai mais barato.\n\n` +
    `Você participa automaticamente e pode sair a qualquer momento:\n` +
    `• Para *não* compartilhar: mande */nao-compartilhar*\n` +
    `• Para reativar: mande */compartilhar*\n\n` +
    `Dúvidas? Responda aqui.`
  );
}

// Mensagem de comparação com a média histórica. Recebe a avaliação de alerts.js:
//   { nivel: 'abaixo'|'normal'|'acima', percentual, media }
// Cada nível tem um tom próprio — acima alerta, abaixo elogia, normal tranquiliza.
function montarMensagemAlerta(avaliacao) {
  const { nivel, percentual, media } = avaliacao || {};
  const mediaFmt = `R$ ${brl(media)}`;
  const pctAbs = Math.abs(Math.round(percentual));

  if (nivel === 'acima') {
    return (
      `📈 *${pctAbs}% acima da sua média* (${mediaFmt}/compra).\n` +
      `Pode ser a compra grande do mês — pra ver o que pesou, manda */historico*.`
    );
  }

  if (nivel === 'abaixo') {
    return (
      `📉 *${pctAbs}% abaixo da sua média* (${mediaFmt}/compra). Economia! Continua assim 🎉`
    );
  }

  // normal
  return (
    `✅ *Dentro do seu padrão* — perto da média de ${mediaFmt}/compra. Tudo certo 👍`
  );
}

function montarOnboarding1() {
  return (
    `👋 Bem-vindo ao *Economizei*!\n\n` +
    `Depois do mercado, tira uma foto do cupom e manda aqui. Em segundos eu registro loja, total e cada item — sem cadastro, sem digitar nada.\n\n` +
    `📸 *Manda a foto de um cupom pra começar.*`
  );
}

function montarOnboarding2() {
  return (
    `É sério — é só foto. 📸 Sem cadastro, sem formulário, sem digitar nada.\n\n` +
    `Quando for ao mercado, manda o cupom aqui.`
  );
}

function montarOnboarding3() {
  return (
    `💡 *Primeiro cupom registrado!*\n\n` +
    `Manda o cupom depois de cada compra. Em poucas semanas eu mostro o que passa despercebido:\n\n` +
    `→ R$ 180,00 só em carnes no mês\n` +
    `→ a compra do fim de semana custa o dobro da rápida\n` +
    `→ R$ 90,00 a mais que o mês passado\n\n` +
    `📊 Cada cupom deixa o retrato mais nítido.`
  );
}

function montarOnboarding4(dadosCompra, totalMes) {
  const { loja, total } = dadosCompra;
  return (
    `📊 *Duas compras registradas — o padrão já começa a aparecer.*\n\n` +
    `${loja}: R$ ${brl(total)} hoje · R$ ${brl(totalMes)} no mês.\n\n` +
    `Continua mandando os cupons. Pra ver o plano *Individual* (cupons ilimitados + comparativo entre mercados): */planos*.`
  );
}

// ---------------------------------------------------------------
// Digest semanal dos "3 números" do roadmap — enviado ao ADMIN_PHONE
// dados: { dashboard, w2, uptime, landingUrl } (ver weeklyDigest.js)
// Cada bloco degrada sozinho: se uma fonte falhar, as outras aparecem.
// ---------------------------------------------------------------
function montarDigestSemanal(dados) {
  const { dashboard, w2, uptime, landingUrl } = dados || {};
  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo',
  });

  const linhas = [`📈 *Economizei — placar da semana*`, `_${hoje}_`, ``];

  // 1. Cadastros novos (Supabase)
  if (dashboard && !dashboard.erro) {
    linhas.push(`👤 *Cadastros*`);
    linhas.push(`• Novos (7 dias): *${dashboard.novos_7d}*`);
    linhas.push(`• Hoje: ${dashboard.novos_hoje}  |  Total: ${dashboard.total_usuarios}`);
    linhas.push(`• Pagantes: ${dashboard.pagantes}`);
    linhas.push(`• Ativos — DAU ${dashboard.dau} / WAU ${dashboard.wau} / MAU ${dashboard.mau}`);
    linhas.push(`• Cupons no mês: ${dashboard.cupons_mes_atual}`);
  } else {
    linhas.push(`👤 *Cadastros*: ⚠️ erro ao ler (${dashboard?.erro || 'sem dados'})`);
  }
  linhas.push(``);

  // Retenção W2 (métrica crítica de hábito)
  if (w2 && !w2.erro && w2.usuarios_cohort > 0) {
    linhas.push(`🔁 *Retenção W2*: ${w2.retencao_w2_pct ?? 0}% (${w2.usuarios_retidos_w2}/${w2.usuarios_cohort})`);
  } else if (w2 && !w2.erro) {
    linhas.push(`🔁 *Retenção W2*: cohort ainda pequeno pra medir`);
  }
  linhas.push(``);

  // 2. Uptime (UptimeRobot)
  if (uptime?.ok) {
    const emoji = Number(uptime.ratio) >= 99 ? '🟢' : Number(uptime.ratio) >= 95 ? '🟡' : '🔴';
    linhas.push(`${emoji} *Uptime (7 dias)*: ${uptime.ratio}%`);
  } else {
    linhas.push(`⚪ *Uptime*: indisponível (${uptime?.motivo || 'sem dados'})`);
  }
  linhas.push(``);

  // 3. Visitas da landing (Vercel Analytics — leitura manual)
  linhas.push(`🌐 *Visitas da landing*: ver no painel`);
  if (landingUrl) linhas.push(landingUrl);
  else linhas.push(`(Vercel → projeto → aba Analytics → últimos 7 dias)`);

  linhas.push(``, `_Próximo placar: sexta que vem._`);
  return linhas.join('\n');
}

// Enviada quando a imagem ficou borrada mesmo após pré-processamento automático.
// Orienta o usuário a reenviar como documento — o WhatsApp não comprime arquivos.
function montarMensagemEnviarComoArquivo() {
  return (
    '📎 *Dica: tente enviar como arquivo!*\n\n' +
    'O WhatsApp comprime as fotos e isso pode dificultar a leitura do cupom.\n\n' +
    'Para evitar a compressão:\n' +
    '1. Toque no 📎 (clipe/+) na conversa\n' +
    '2. Escolha *"Documento"*\n' +
    '3. Selecione a foto do cupom\n\n' +
    'Assim a imagem chega sem compressão e a leitura fica muito melhor! 🧾'
  );
}

// ---------------------------------------------------------------
// Lembretes de reengajamento — tom de amizade, nunca de cobrança.
// Mensagens aprovadas em 2026-06-02 (ver CLAUDE.md, seção 11).
// Funções puras: recebem dados e retornam string.
// ---------------------------------------------------------------

// Segmento A — nunca mandou cupom
function montarLembreteOnboardingD2() {
  return (
    'Oi! Tudo bem? 😊 Só passando pra lembrar que estou aqui — quando for ao mercado, guarda o cupom e me manda uma foto.\n\n' +
    'Sem cadastro, sem app. É só a foto.'
  );
}

function montarLembreteOnboardingD7() {
  return (
    'Oi! Faz uma semana que você chegou aqui. 👋\n\n' +
    'Se ainda não testou, pega o próximo cupom e manda — em menos de um minuto você já vê o resumo da compra.'
  );
}

// Segmento B — já mandou cupom mas sumiu
function montarLembreteInativoD3() {
  return (
    'Oi! Passou no mercado de novo? 🛒 Manda a foto do cupom quando tiver — registro tudo pra você.'
  );
}

function montarLembreteInativoD10(qtdComprasMes) {
  const qtd = Number(qtdComprasMes) || 0;
  return (
    `Oi! Você já tem ${qtd} compra(s) registrada(s) este mês. No fim do mês te mando o resumo completo de tudo — ainda dá pra completar, manda mais um cupom quando puder. 📋`
  );
}

function montarLembreteInativoD30() {
  return (
    'Faz um tempinho que você não aparece. Pra retomar, é só mandar o cupom do próximo mercado — sem pressa, sem cobrança. Estou aqui quando precisar. 😊'
  );
}

function montarLembreteInativoD60() {
  return (
    'Oi! Faz dois meses desde seu último cupom.\n\n' +
    'Pra voltar a controlar os gastos, é só mandar uma foto quando for às compras. Se preferir parar, tudo bem — manda */apagar* que eu deleto tudo.'
  );
}

// Segmento C — fim de mês com cupons abertos
function montarLembreteFimMes(qtdComprasMes) {
  const qtd = Number(qtdComprasMes) || 0;
  return (
    `Fim do mês chegando! 📅 Você tem ${qtd} compra(s) registrada(s). Se tiver cupons guardados, manda antes de virar o mês — aí monto um balanço completo pra você.`
  );
}

// ---------------------------------------------------------------
// Sistema de indicação (/convidar) — copy aprovada em 2026-06-07.
// Recompensa = dias de funções Pro (comparativo + alerta inteligente),
// sem mexer no limite de cupons. Números 7/30 sourced no CLAUDE.md.
// ---------------------------------------------------------------

// Resposta ao comando /convidar — link + como funciona + status atual.
function montarMensagemConvite(codigo, link, status) {
  const { ativados = 0, convertidos = 0 } = status || {};
  const linhaStatus = (ativados > 0 || convertidos > 0)
    ? `\n📊 *Suas indicações até agora:* ${ativados} ${ativados === 1 ? 'amigo ativou' : 'amigos ativaram'}` +
      (convertidos > 0 ? ` · ${convertidos} ${convertidos === 1 ? 'virou' : 'viraram'} Pro` : '') +
      `\n`
    : '';

  return (
    `🤝 *Convide um amigo — e os dois ganham*\n\n` +
    `Compartilhe seu link. Quando seu amigo registrar o primeiro cupom, *vocês dois ganham 7 dias das funções Pro* (comparativo entre mercados + alerta inteligente).\n\n` +
    `E se ele assinar um plano Pro, *você ganha mais 30 dias.* 🎉\n\n` +
    `👉 *Seu link:*\n${link}\n\n` +
    `_Seu código: ${codigo}_${linhaStatus}\n` +
    `Mande pra família, amigos e grupos do WhatsApp. Quanto mais gente economizando junto, melhor. 💚`
  );
}

// Enviada ao INDICADO quando ele registra o primeiro cupom (marco de ativação).
function montarBoasVindasIndicado(dias) {
  return (
    `🎁 *Você ganhou ${dias} dias das funções Pro!*\n\n` +
    `Como você chegou pela indicação de um amigo e já registrou seu primeiro cupom, liberei pra você o *comparativo entre mercados* e o *alerta inteligente* por ${dias} dias.\n\n` +
    `Continue mandando os cupons pra aproveitar. 📸`
  );
}

// Enviada ao INDICADOR quando o amigo dele ativa (registra o 1º cupom).
function montarAvisoIndicacaoAtivada(dias) {
  return (
    `🎉 *Sua indicação deu certo!*\n\n` +
    `Um amigo que você convidou acabou de registrar o primeiro cupom. Você ganhou *${dias} dias das funções Pro* (comparativo entre mercados + alerta inteligente).\n\n` +
    `Quer ganhar mais? Convide outras pessoas: */convidar*`
  );
}

// Enviada ao INDICADOR quando o amigo dele assina um plano Pro (marco de conversão).
function montarAvisoIndicacaoConvertida(dias) {
  return (
    `🙌 *Boa! Sua indicação assinou o Pro.*\n\n` +
    `Como agradecimento, você ganhou *mais ${dias} dias das funções Pro*. Obrigado por espalhar o Economizei! 💚\n\n` +
    `Convide mais gente: */convidar*`
  );
}

// Segmento D — perto do limite gratuito
function montarLembreteLimite8() {
  return (
    'Você já usou 8 dos 10 cupons grátis do mês. 📊 Ainda dá pra mais 2. Pra não ter limite, dá uma olhada nos planos: */planos*.'
  );
}

module.exports = {
  nomeDoMes,
  montarDigestSemanal,
  montarResposta,
  montarMensagemErro,
  montarAvisoSucessoParcial,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemStatusLimite,
  montarMensagemPlanos,
  montarMensagemPix,
  montarMensagemPedirEmail,
  montarMensagemLinkAssinatura,
  montarMensagemAssinaturaAtivada,
  montarMensagemAssinaturaCancelada,
  montarMensagemEmailInvalido,
  montarMensagemErroAssinatura,
  montarMensagemPagamentoFalhou,
  montarMensagemJaAssinante,
  montarMensagemAlerta,
  montarOnboarding1,
  montarOnboarding2,
  montarOnboarding3,
  montarOnboarding4,
  montarResumoMensal,
  montarMensagemGastos,
  montarMensagemInflacao,
  montarMensagemEconomia,
  montarMensagemPrivacidade,
  montarMensagemEnviarComoArquivo,
  montarLembreteOnboardingD2,
  montarLembreteOnboardingD7,
  montarLembreteInativoD3,
  montarLembreteInativoD10,
  montarLembreteInativoD30,
  montarLembreteInativoD60,
  montarLembreteFimMes,
  montarLembreteLimite8,
  montarMensagemConvite,
  montarBoasVindasIndicado,
  montarAvisoIndicacaoAtivada,
  montarAvisoIndicacaoConvertida,
};
