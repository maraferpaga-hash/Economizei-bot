const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

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
    `💡 *Continue mandando os cupons* — quanto mais dados, mais padrões eu vejo.`
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
    `📸 *Economizei* — você manda a foto do cupom, eu organizo seus gastos no mercado. Sem app, sem planilha, só foto.\n\n` +
    `Manda uma foto de cupom aqui pra começar!\n\n` +
    `*Comandos:*\n` +
    `• */planos* — vê os planos (Grátis, Individual, Família, Família+)\n` +
    `• */historico* ou */resumo* — suas últimas compras\n` +
    `• */limite* — quantos cupons restam esse mês\n` +
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
    `*Como assinar via PIX:*\n` +
    `1. Pague o valor do plano no PIX abaixo:\n` +
    `   📱 Chave PIX: ${pixKey()}\n` +
    `   💰 R$9,90 (Individual) / R$15 (Família) / R$22 (Família+)\n` +
    `2. Manda o comprovante aqui no chat\n` +
    `3. Em até 1h eu ativo seu plano\n\n` +
    `*Pode continuar usando o Grátis* — ele resolve o básico bem. 👍`
  );
}

function montarMensagemAlerta(percentual, mediaHistorica) {
  return (
    `📊 *Compra acima do seu padrão*\n\n` +
    `Esta compra ficou ${Math.round(percentual)}% acima da sua média, que é de R$ ${brl(mediaHistorica)} por compra.\n\n` +
    `Pode ser só a compra do mês — mas se quiser ver o que pesou, mande */historico*.`
  );
}

function montarOnboarding1() {
  return (
    `👋 Bem-vindo ao *Economizei*!\n\n` +
    `Funciona assim: depois do mercado, tire uma foto do cupom fiscal e mande aqui. Em segundos eu registro loja, total e cada item — sem cadastro, sem digitar nada.\n\n` +
    `📸 *Mande a foto de um cupom para começar.*\n\n` +
    `_Precisa de ajuda? Mande /ajuda_`
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
    `💡 *Primeiro cupom registrado!*\n\n` +
    `Continue mandando o cupom depois de cada compra. Em poucas semanas eu mostro coisas que passam despercebidas no dia a dia:\n\n` +
    `→ Que você gastou R$ 180,00 só em carnes no mês\n` +
    `→ Que a compra do fim de semana custa o dobro da compra rápida\n` +
    `→ Que o total subiu R$ 90,00 em relação ao mês passado\n\n` +
    `📊 Cada cupom deixa o retrato dos seus gastos mais nítido.`
  );
}

function montarOnboarding4(dadosCompra, totalMes) {
  const { loja, total } = dadosCompra;
  return (
    `📊 *Duas compras registradas — já dá pra ver o padrão começando.*\n\n` +
    `${loja}: R$ ${brl(total)} hoje. No mês até agora: R$ ${brl(totalMes)}.\n\n` +
    `É isso. Você está no controle agora. 🎯\n\n` +
    `Continua mandando os cupons depois de cada compra. Pra ver o que tem no plano *Individual* (cupons ilimitados + comparativo entre mercados): manda */planos*.`
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
  montarMensagemPlanos,
  montarMensagemAlerta,
  montarOnboarding1,
  montarOnboarding2,
  montarOnboarding3,
  montarOnboarding4,
  montarResumoMensal,
};
