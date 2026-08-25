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

// ---------------------------------------------------------------
// fmtMoeda — formatação de valor ciente de moeda (cod-0065b, 2026-08-21).
//
// Semente da internacionalização (Canadá primeiro — seção 7.2 do CLAUDE.md).
// Existe pra que a cod-0065 (recibo canadense) não precise espalhar `if (moeda)`
// por dentro das mensagens: quando o recibo em CAD chegar, troca-se o ponto de
// formatação, não a copy.
//
// Contrato deliberado:
//   • default BRL → `fmtMoeda(v)` é byte a byte `R$ ${brl(v)}` (travado por teste),
//     então adotar a função em qualquer mensagem pt-BR existente não muda um caractere;
//   • moeda DESCONHECIDA → `null`, nunca "chuta" o símbolo. Exibir R$ num valor em
//     CAD (ou o contrário) é mentir sobre dinheiro — pior que não formatar;
//   • valor não numérico → `null` (mesmo motivo: não existe "R$ NaN").
//
// Sem `toLocaleString` fora do pt-BR de propósito: a formatação en-CA dependeria
// do ICU do runtime, que pode diferir entre este ambiente e o Railway. Aqui o
// agrupamento é feito à mão — mesma saída em qualquer Node.
// ---------------------------------------------------------------
const MOEDAS = {
  // BRL não tem regra própria: DELEGA pro `brl()` que já formata todas as
  // mensagens de hoje. Byte a byte por construção, não por coincidência —
  // adotar `fmtMoeda` numa mensagem pt-BR existente não pode mudar 1 caractere,
  // nem no caso feio (`R$ -5,00`, com o sinal depois do símbolo).
  BRL: { legado: true },
  // CAD formata aqui, na convenção local: sinal ANTES do símbolo (`-$5.00`).
  CAD: { simbolo: '$', milhar: ',', decimal: '.' },
};

function _agrupar(inteiro, separador) {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, separador);
}

function fmtMoeda(valor, moeda = 'BRL') {
  const cfg = MOEDAS[String(moeda || '').toUpperCase()];
  if (!cfg) return null;
  // Só número ou string numérica. `Number([])` e `Number(null)` são 0 — sem esta
  // porta, um valor ausente vira "R$ 0,00", que é pior que não formatar.
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  if (typeof valor === 'string' && valor.trim() === '') return null;
  const n = Number(valor);
  if (!Number.isFinite(n)) return null;

  if (cfg.legado) return `R$ ${brl(n)}`;

  const abs = Math.abs(n);
  const [inteiro, centavos] = abs.toFixed(2).split('.');
  // `-0.00` não existe como quantia: valor que arredonda pra zero perde o sinal.
  const sinal = n < 0 && Number(abs.toFixed(2)) !== 0 ? '-' : '';
  return `${sinal}${cfg.simbolo}${_agrupar(inteiro, cfg.milhar)}${cfg.decimal}${centavos}`;
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

// cod-0032 — bloco de gasto supérfluo (Alerta Pro, Pilar A).
// Recebe o resultado de buscarGastoSuperfluo (insights.js, cod-0030) e devolve
// um bloco pronto pra anexar no /gastos e no resumo mensal. Número primeiro,
// sem moralizar. Estados honestos e DISTINTOS:
//   analise == null/inválida (não calculada ou leitura falhou) → '' — o bloco
//     some em silêncio; nunca finge que analisou.
//   houve gasto no mês mas nada nas categorias supérfluas → "bom sinal"
//     (≠ "sem gasto no mês" — quem decide isso é quem chama: só passe a análise
//     quando o mês TEM gastos por categoria).
function montarBlocoSuperfluo(analise) {
  if (!analise || !Array.isArray(analise.porCategoria)) return '';

  if (analise.porCategoria.length === 0 || !(analise.totalSuperfluo > 0)) {
    return '\n\n🍬 *Supérfluos:* nenhum gasto nas suas categorias de supérfluo — bom sinal.';
  }

  const partes = analise.porCategoria.map((c) => {
    const label = LABELS_CATEGORIA[c.categoria] || c.categoria;
    return `${label} R$ ${brl(c.valor)}`;
  });

  return (
    `\n\n🍬 *Supérfluos: R$ ${brl(analise.totalSuperfluo)}* — ` +
    `${analise.pctDoMes}% do mês (${partes.join(', ')})`
  );
}

// ---------------------------------------------------------------
// Acompanhamentos personalizáveis (cod-0033) — mensagens dos comandos.
// Tom WhatsApp, sem gíria, número primeiro. Confirmações curtas e honestas.
// SEM gate Pro aqui: quem liga/desliga o Pro é passo humano (firewall).
// ---------------------------------------------------------------

function montarAcompanharConfirmado({ tipo_alvo, rotulo } = {}) {
  const oQue = tipo_alvo === 'categoria'
    ? `a categoria *${LABELS_CATEGORIA[rotulo] || rotulo}*`
    : `*${rotulo}*`;
  return (
    `✅ Pronto! Vou acompanhar ${oQue} nas suas compras.\n\n` +
    `Pra ver quanto já somou no mês: */acompanhamentos*. Pra parar: */parar ${rotulo}*.`
  );
}

function montarAcompanharErro(motivo) {
  if (motivo === 'curto') {
    return 'Esse termo é curto demais pra acompanhar. Use um nome com pelo menos 3 letras, como */acompanhar cerveja*.';
  }
  if (motivo === 'parar_sem_alvo') {
    return 'Me diga o que você quer parar de acompanhar. Ex.: */parar cerveja*. Pra ver a lista: */acompanhamentos*.';
  }
  if (motivo === 'falha') {
    return 'Não consegui salvar seu acompanhamento agora. Tenta de novo em instantes? 🙏';
  }
  // 'vazio'
  return 'O que você quer acompanhar? Ex.: */acompanhar cerveja* ou */acompanhar doces* (uma categoria).';
}

function montarAcompanharParado(rotulo, sucesso) {
  if (!sucesso) {
    return `Não consegui parar o acompanhamento de *${rotulo}* agora. Tenta de novo em instantes? 🙏`;
  }
  return `✅ Parei de acompanhar *${rotulo}*. Pra voltar depois: */acompanhar ${rotulo}*.`;
}

// lista = [{ rotulo, total, temDados }] — já enriquecida pelo index.js com o
// gasto do mês de cada alvo (buscarGastoPorAlvo). temDados:false = leitura falhou
// (nunca mostra R$ 0 como se fosse fato); total 0 = sem itens casados esse mês.
function montarListaAcompanhamentos(lista, mesRef) {
  if (!Array.isArray(lista) || lista.length === 0) {
    return (
      '🔎 Você ainda não está acompanhando nada.\n\n' +
      'Escolha um item ou categoria pra vigiar: */acompanhar cerveja*, */acompanhar ração*, */acompanhar doces*.'
    );
  }

  const titulo = mesRef ? ` — ${nomeDoMes(mesRef)}` : '';
  const linhas = lista.map((a) => {
    if (!a.temDados) return `• ${a.rotulo} — não consegui somar agora`;
    if (!(a.total > 0)) return `• ${a.rotulo} — ainda sem itens esse mês`;
    return `• ${a.rotulo} — *R$ ${brl(a.total)}*`;
  });

  return (
    `🔎 *Seus acompanhamentos${titulo}*\n\n` +
    `${linhas.join('\n')}\n\n` +
    `Pra parar de acompanhar um: */parar <nome>*.`
  );
}

// Baseline (doces+bebidas) quando a lista chega vazia — espelha o default do
// cod-0031 (setCategoriasSuperfluas grava null → buscarCategoriasSuperfluas
// devolve o baseline), pra a mensagem nunca dizer "nenhuma".
function _listaCategoriasSuperfluas(categorias) {
  const arr = (Array.isArray(categorias) && categorias.length > 0)
    ? categorias
    : ['doces', 'bebidas'];
  return arr.map((c) => LABELS_CATEGORIA[c] || c).join(', ');
}

function montarSuperfluoConfirmado(resultado, categorias, sucesso) {
  if (!sucesso) {
    return 'Não consegui ajustar suas categorias de supérfluo agora. Tenta de novo em instantes? 🙏';
  }
  const { acao, categoria } = resultado || {};
  const label = LABELS_CATEGORIA[categoria] || categoria;
  const verbo = acao === 'remove' ? 'não conta mais' : 'passa a contar';
  return (
    `✅ *${label}* ${verbo} como supérfluo.\n\n` +
    `Categorias de supérfluo agora: ${_listaCategoriasSuperfluas(categorias)}.`
  );
}

function montarSuperfluoConfig(categorias) {
  return (
    `🍬 Suas categorias de supérfluo: *${_listaCategoriasSuperfluas(categorias)}*.\n\n` +
    `Pra incluir ou tirar uma: */superfluo doces* (alterna) ou */superfluo bebidas off*.`
  );
}

function montarSuperfluoInvalido(categoria) {
  const validas = 'carnes, hortifruti, laticínios, padaria, bebidas, limpeza, mercearia, congelados, doces, outros';
  const oQue = categoria
    ? `*${categoria}* não é uma categoria que eu conheço.`
    : 'Preciso de uma categoria válida.';
  return `${oQue}\n\nCategorias válidas: ${validas}. Ex.: */superfluo doces*.`;
}

// ---------------------------------------------------------------
// Alerta proativo de limite (cod-0035) — /teto e o aviso automático.
// Número primeiro, sem moralizar: o bot informa o fato e o que dá pra fazer,
// nunca julga a compra. Máx. 1 aviso por alvo por mês (garantido no index.js).
// ---------------------------------------------------------------

function _rotuloExibicao(tipo_alvo, rotulo) {
  return tipo_alvo === 'categoria' ? (LABELS_CATEGORIA[rotulo] || rotulo) : rotulo;
}

function montarTetoConfirmado({ tipo_alvo, rotulo, limite } = {}) {
  const oQue = _rotuloExibicao(tipo_alvo, rotulo);
  return (
    `✅ Teto de *R$ ${brl(limite)}* definido para *${oQue}*.\n\n` +
    `Quando o gasto do mês chegar lá, eu aviso — uma vez por mês, sem encher.\n` +
    `Pra ver quanto já somou: */acompanhamentos*. Pra mudar: */teto ${rotulo} <valor>*.`
  );
}

function montarTetoErro(motivo, extra) {
  if (motivo === 'sem_valor') {
    return 'Falta o valor do teto. Ex.: */teto cerveja 100* — aviso quando o gasto do mês em cerveja chegar a R$ 100,00.';
  }
  if (motivo === 'sem_alvo') {
    return 'Pra qual item ou categoria é esse teto? Ex.: */teto cerveja 100* ou */teto doces 150*.';
  }
  if (motivo === 'valor_invalido') {
    const oQue = extra ? `*${extra}* não é um valor que eu consiga entender.` : 'Não entendi o valor.';
    return `${oQue}\n\nUse um valor em reais entre R$ 1,00 e R$ 1.000.000,00. Ex.: */teto cerveja 100* ou */teto doces 75,50*.`;
  }
  if (motivo === 'curto') {
    return 'Esse termo é curto demais. Use um nome com pelo menos 3 letras. Ex.: */teto cerveja 100*.';
  }
  if (motivo === 'falha') {
    return 'Não consegui salvar seu teto agora. Tenta de novo em instantes? 🙏';
  }
  // 'vazio'
  return 'Pra que item ou categoria você quer definir um teto? Ex.: */teto cerveja 100* ou */teto doces 150*.';
}

// ---------------------------------------------------------------
// GATE PRO — upsell dos comandos de CONFIGURAÇÃO do Alerta Pro (cod-0074,
// 2026-08-20). Mesmo espírito do rodapé do /comparar (cod-0073): fecha o achado
// B10 do Checkpoint N2 de 01/08, em que os comandos de configuração rodavam sem
// gate nenhum.
//
// Regras da copy (critério de aceite da AGENDA + regra 4 do §11 do CLAUDE.md):
//   • VALOR primeiro (o que a pessoa passa a conseguir fazer), caminho depois
//   • SEM preço e SEM ciclo de cobrança — o preço vive só em montarMensagemPlanos,
//     senão a copy fica stale no dia em que o pricing mudar
//   • sem urgência falsa, sem gíria, sem moralizar
//   • lembra que */acompanhamentos* e */parar* continuam abertos — quem já
//     configurou algo precisa poder VER e DESLIGAR mesmo fora do Pro (decisão
//     07-10: decência + LGPD; evita acompanhamento zumbi)
//
// `comando` escolhe só a frase de valor; valor desconhecido cai no texto
// genérico — nunca em erro, nunca em mensagem vazia.
// ---------------------------------------------------------------
const _VALOR_UPSELL_PRO = {
  acompanhar: 'Acompanhe um item ou uma categoria — por exemplo *cerveja* — e veja, a qualquer momento, quanto ele já somou no mês.',
  teto: 'Defina um teto para um item ou categoria — por exemplo R$ 100,00 em *cerveja* — e receba um aviso quando o gasto do mês chegar lá.',
  superfluo: 'Escolha quais categorias contam como supérfluo pra você, e o bloco de supérfluo do */gastos* passa a seguir a sua régua, não a padrão.',
};

function montarUpsellAcompanhamentos(comando) {
  const valor = _VALOR_UPSELL_PRO[comando]
    || 'Acompanhe itens e categorias, defina o teto de gasto de cada um e receba o aviso quando o mês chegar lá.';
  return (
    `⭐ *Essa configuração é do plano Individual*\n\n` +
    `${valor}\n\n` +
    `O que você já configurou continua visível em */acompanhamentos* — e dá pra desligar qualquer um com */parar*.\n\n` +
    `Pra conhecer os planos: */planos*`
  );
}

// alertas = [{ rotulo, tipo_alvo, total, limite, pct }] — vindo de
// verificarTetosEstourados (insights.js). Lista vazia/inválida → '' (o chamador
// não envia nada). Um alvo = mensagem focada; vários = uma mensagem só, pra não
// disparar três avisos seguidos no WhatsApp.
function montarAlertaLimite(alertas) {
  const lista = Array.isArray(alertas) ? alertas.filter(Boolean) : [];
  if (lista.length === 0) return '';

  if (lista.length === 1) {
    const a = lista[0];
    const oQue = _rotuloExibicao(a.tipo_alvo, a.rotulo);
    const situacao = a.total > a.limite
      ? `passou o teto de R$ ${brl(a.limite)} que você definiu (${a.pct}% dele)`
      : `bateu o teto de R$ ${brl(a.limite)} que você definiu`;
    return (
      `⚠️ *R$ ${brl(a.total)} em ${oQue} esse mês* — ${situacao}.\n\n` +
      `Pra mudar o teto: */teto ${a.rotulo} <valor>*. Pra parar de acompanhar: */parar ${a.rotulo}*.`
    );
  }

  const linhas = lista.map((a) => {
    const oQue = _rotuloExibicao(a.tipo_alvo, a.rotulo);
    return `• ${oQue} — *R$ ${brl(a.total)}* (teto R$ ${brl(a.limite)})`;
  });

  return (
    `⚠️ *${lista.length} alvos chegaram no teto esse mês*\n\n` +
    `${linhas.join('\n')}\n\n` +
    `Pra mudar um teto: */teto <nome> <valor>*. Pra parar de acompanhar: */parar <nome>*.`
  );
}

function montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia, economia = null, superfluo = null) {
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
    `${blocoItens}` +
    montarBlocoSuperfluo(superfluo)
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

// ---------------------------------------------------------------
// Comprovante de PIX — copy de confirmação (cod-0062b, 2026-08-21).
//
// Escrita ANTES da leitura do comprovante (cod-0062, porte G, roda com o
// Gabriel presente): quando a extração chegar, é só plugar. Nada aqui lê,
// grava ou decide — são três funções puras de texto.
//
// 🔒 LGPD: estas funções recebem SÓ contraparte, valor e data. CPF, chave PIX
// (que é telefone), agência e conta não entram aqui de propósito — são lidos e
// descartados no pipeline, nunca exibidos e nunca persistidos.
//
// Vocabulário: `saida` = dinheiro que saiu (PIX enviado, vira gasto);
// `entrada` = dinheiro que entrou (PIX recebido, NUNCA vira gasto).
// É o vocabulário da coluna `compras.direcao`
// (migration_2026-08-05_pix_direcao_id_transacao.sql).
// ---------------------------------------------------------------

// `Number.isFinite(Number(x))` sozinho ACEITA null, '' e false (todos viram 0):
// um valor ausente viraria "R$ 0,00" — exatamente o número chutado que a recusa
// honesta existe pra evitar. Daí a checagem estrita.
function _valorPix(v) {
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Confirmação de PIX ENVIADO (direcao='saida'): dinheiro que saiu, é gasto.
// `totalMes` é opcional de propósito — enquanto o PIX não entrar nas agregações
// (cod-0062), mostrar "no mês" seria um número que não bate com o /gastos.
// Sem valor legível NÃO existe confirmação: cai na recusa honesta (corpus
// pix-03, print do Mercado Pago sem o valor impresso). CODE_GUIDE §0.4.
function montarConfirmacaoPix({ contraparte, total, data_compra, totalMes = null, qtdMes = null } = {}) {
  const valor = _valorPix(total);
  if (valor === null) return montarPixValorIlegivel();

  const para = contraparte ? ` — para ${contraparte}` : '';
  let msg =
    `✅ *PIX registrado*${para}, ${dataCurta(data_compra)}\n` +
    `💸 *R$ ${brl(valor)}* neste PIX`;

  const mes = _valorPix(totalMes);
  if (mes !== null) {
    const n = Number(qtdMes) || 0;
    msg += `\n📊 *R$ ${brl(mes)}* no mês (${n} ${n === 1 ? 'lançamento' : 'lançamentos'})`;
  }
  return msg;
}

// Confirmação de PIX RECEBIDO (direcao='entrada'): dinheiro que entrou.
// A mensagem existe para deixar explícito o que o número NÃO é — somar um PIX
// recebido como gasto faria todo o resto mentir (decisão do Gabriel, 2026-08-05).
function montarConfirmacaoPixEntrada({ contraparte, total, data_compra } = {}) {
  const valor = _valorPix(total);
  if (valor === null) return montarPixValorIlegivel();

  const de = contraparte ? ` — de ${contraparte}` : '';
  return (
    `📥 *PIX recebido*${de}, ${dataCurta(data_compra)}\n` +
    `💰 *R$ ${brl(valor)}* que entraram\n\n` +
    `_Guardei como entrada. Não somei nada nos seus gastos: dinheiro que entra não é gasto._`
  );
}

// Recusa honesta: comprovante legível, valor não. Prefere não registrar a
// registrar um número chutado — e diz isso sem culpar a pessoa.
function montarPixValorIlegivel() {
  return (
    `⚠️ *Não consegui ler o valor deste comprovante com segurança.*\n\n` +
    `Não registrei nada: prefiro não colocar um número errado na sua conta.\n\n` +
    `_Se puder, manda o comprovante completo (ou um print em que o valor apareça inteiro)._`
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
      '📋 *Não consegui processar esse cupom.*\n\n' +
      'Eu leio cupom de qualquer estabelecimento — mercado, farmácia, posto, restaurante — ' +
      'e registro como "Outros (não-mercado)". Tenta de novo com boa luz e o cupom bem esticado.',
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
    `• */cortar* — onde reduzir gastos sem abrir mão do essencial\n` +
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
    `*📱 Como assinar:* por enquanto a assinatura é via *PIX* — mande */pix* e eu te passo a chave e o passo a passo.\n\n` +
    `*Pode continuar usando o Grátis* — ele resolve o básico bem. 👍`
  );
}

// Instruções de pagamento via PIX — hoje a ÚNICA forma de assinar.
// O pagamento por cartão saiu do ar junto com o Mercado Pago (4f49ae7,
// 2026-07-26), então nada aqui pode prometer cartão nem renovação automática.
// ⚠️ E também não pode prometer LEMBRETE de renovação: não existe job de aviso
// de vencimento no código hoje (o único cron proativo é o resumo de fim de mês
// — ver src/scheduler.js). Se um dia existir, esta mensagem pode citá-lo.
function montarMensagemPix() {
  return (
    `📱 *Pagar via PIX*\n\n` +
    `1. Faça um PIX do valor do plano para a chave:\n` +
    `   *${pixKey()}*\n` +
    `   💰 R$9,90 (Individual) / R$15 (Família) / R$22 (Família+)\n` +
    `2. Envie o comprovante aqui no chat\n` +
    `3. Em até 1h eu ativo seu plano\n\n` +
    `_A renovação é manual: para seguir no plano no mês seguinte, é só repetir o PIX._`
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
function montarMensagemGastos(dados, mesReferencia, analise = null, superfluo = null) {
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
    montarBlocoSuperfluo(superfluo) +
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

// F3 — mensagem de "onde cortar sem doer". Recebe o resultado de analisarOndeCortar.
function montarMensagemCortar(analise) {
  if (!analise || !analise.temSugestao) {
    return (
      '✂️ *Onde cortar sem doer*\n\n' +
      'Olhando este mês, não encontrei categorias discricionárias com peso relevante nos seus gastos.\n\n' +
      '_Quando doces, petiscos ou bebidas aparecerem com peso no mês, te aviso aqui com sugestões concretas._'
    );
  }

  const partes = ['✂️ *Onde cortar sem doer*\n'];

  for (const s of analise.sugestoes) {
    const label = LABELS_CATEGORIA[s.categoria] || s.categoria;
    let linha = `• *${label}*: R$ ${brl(s.valor)} (${s.pct}% do mês)`;
    if (s.acimaDaMedia === true && s.mediaValorHist) {
      linha += `\n  ↑ Acima da sua média de R$ ${brl(s.mediaValorHist)}/mês — mês mais pesado que o usual.`;
    } else if (s.acimaDaMedia === false && s.mediaValorHist) {
      linha += `\n  → Em linha com sua média de R$ ${brl(s.mediaValorHist)}/mês.`;
    }
    partes.push(linha);
  }

  partes.push('\n_São as categorias mais fáceis de reduzir sem mexer no essencial. Qualquer corte aqui vai direto pro seu bolso._');
  return partes.join('\n');
}

// Primeira letra maiúscula (nome_canonico vem em minúsculas do banco).
function _capitalizar(s) {
  const t = String(s == null ? '' : s).trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

// Comparativo entre mercados (cod-0020). Recebe o resultado de
// insights.compararPrecosMercado. Número no topo (menor preço + economia),
// voz de WhatsApp, sem gíria proibida. Sem dados → mensagem honesta que
// convida a continuar mandando cupom (a base cresce com o uso).
//
// `opts.ehPro` (cod-0073, 2026-08-16) controla só o rodapé de upsell. O default
// `{}` mantém a chamada de 1 argumento byte a byte igual ao que era antes —
// retrocompatibilidade é critério de aceite, não detalhe.
// Copy do upsell: sem preço hardcoded (o preço vive só em montarMensagemPlanos,
// pra não ficar stale se o pricing mudar), sem urgência falsa, sem gíria.
function montarMensagemComparativo(resultado, opts = {}) {
  if (!resultado || !resultado.temComparativo || !resultado.comparativos.length) {
    return (
      '🛒 *Comparativo entre mercados*\n\n' +
      'Ainda não encontrei o mesmo produto em mercados diferentes pra comparar os preços.\n\n' +
      '_Quanto mais cupom a rede registra, mais rico fica o comparativo. Continue mandando os seus. 📸_'
    );
  }

  const partes = ['🛒 *Comparativo entre mercados*\n'];

  for (const c of resultado.comparativos) {
    const nome = _capitalizar(c.produto);
    let linha =
      `💰 *${nome}*\n` +
      `Mais barato: ${c.menor.loja} — R$ ${brl(c.menor.preco)}\n` +
      `Mais caro: ${c.maior.loja} — R$ ${brl(c.maior.preco)}\n` +
      `Diferença: R$ ${brl(c.economia)} (${c.economiaPct}%)`;

    if (c.posicaoUsuario === 'mais_barato') {
      linha += `\n✅ Você já comprou no mais barato. 👏`;
    } else if (c.economiaUsuario) {
      linha += `\n👉 Você pagou R$ ${brl(c.precoUsuario)} — dava pra economizar R$ ${brl(c.economiaUsuario)} no ${c.menor.loja}.`;
    }
    partes.push(linha);
  }

  partes.push(`\n_Preços que a rede registrou nos últimos ${resultado.janelaDias} dias._`);
  if (resultado.temMais) {
    partes.push(`_Mostrando os ${resultado.mostrados} com maior diferença, de ${resultado.totalComparaveis} no total._`);
    // Upsell só quando há de fato mais comparativo pra ver — é o momento de maior
    // valor percebido, e evita prometer conteúdo que não existe.
    if (!opts.ehPro) {
      partes.push(`💡 No plano *Individual* você vê o comparativo completo. Detalhes: */planos*`);
    }
  }
  return partes.join('\n');
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

// --- /apagar — direito de eliminação (LGPD) ----------------------------
// Passo 1: confirmação. Não interroga o motivo (a landing promete "sem
// perguntas"); só avisa que é irreversível e pede o passo explícito.
function montarConfirmacaoApagar() {
  return (
    `⚠️ *Apagar todos os seus dados*\n\n` +
    `Isso remove pra sempre seu histórico de compras, seus itens, seus resumos e suas indicações. Não dá pra desfazer.\n\n` +
    `Se tem certeza, mande: */apagar confirmar*\n\n` +
    `Se foi sem querer, é só ignorar esta mensagem — nada será apagado.`
  );
}

// Passo 2: exclusão concluída.
function montarApagarConcluido() {
  return (
    `✅ Pronto. Apaguei todos os seus dados — histórico de compras, itens, resumos e indicações.\n\n` +
    `Foi bom te ajudar por aqui. Se um dia quiser voltar, é só mandar a foto de um cupom que começamos do zero. 👋`
  );
}

// Falha na exclusão — não expõe detalhe técnico, orienta a tentar de novo.
function montarApagarErro() {
  return (
    `Tive um problema do meu lado e não consegui apagar tudo agora. 😕\n\n` +
    `Pode tentar de novo daqui a alguns minutos? Se continuar, mande */ajuda* que eu resolvo manualmente.`
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
// Documento (arquivo) com tipo que não sei ler — só foto/PDF de recibo por
// enquanto. Honesto sobre o limite, sem gíria, sem prometer nada além do que faz
// hoje (a leitura de outros tipos de comprovante é cod-0062). Guia pro que funciona.
function montarMensagemDocumentoNaoSuportado() {
  return (
    '📎 Recebi seu arquivo, mas por enquanto só consigo ler *foto* ou *PDF* de um recibo.\n\n' +
    'Manda o cupom como imagem (foto normal) ou como PDF, que eu leio pra você. 🧾'
  );
}

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

// cod-0024: NÃO cita a contagem de compras do mês — com o reset preguiçoso,
// `compras_mes_atual` pode refletir o mês ANTERIOR pra usuário inativo há 10
// dias (número enganoso). Decisão do critério de aceite: omitir o número.
function montarLembreteInativoD10() {
  return (
    'Oi! No fim do mês te mando o resumo completo de tudo que você registrar até lá. Ainda dá tempo — manda a foto do cupom da próxima compra que ela entra na conta. 📋'
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

// ---------------------------------------------------------------
// Agente de Perguntas (cod-0015) — mensagens do fluxo de conversa.
// Regras: tom cordial e formal (sem gíria — regra 2026-05-26), o dado de
// impacto primeiro, e NENHUMA menção a preço/plano/pagamento (fora-de-escopo
// da tarefa: a cota é plana e anti-abuso, não é gancho de venda).
// ---------------------------------------------------------------

// Pergunta fora do escopo de gastos (classificador devolveu fora_de_escopo).
// Desenho §9: sem fingir que entendeu + sempre oferecer a saída por comando.
function montarForaDeEscopo() {
  return (
    `Eu respondo perguntas sobre os *seus gastos de mercado*. 🙂\n\n` +
    `Pode perguntar, por exemplo:\n` +
    `• _quanto gastei esse mês?_\n` +
    `• _quanto gastei em carne?_\n` +
    `• _estou gastando mais que mês passado?_\n\n` +
    `Para ver tudo que eu faço: */ajuda*`
  );
}

// Aviso ao cruzar a metade da cota mensal de perguntas (decisão 2026-06-24:
// aviso no meio pra pessoa ficar ciente — número primeiro, sem urgência).
function montarAvisoMeioLimitePerguntas(usadas, limite) {
  return (
    `📊 Você já usou *${usadas} das ${limite} perguntas* do mês.\n\n` +
    `Elas renovam no dia 1. Os comandos (*/gastos*, */historico*, */economia*) continuam ilimitados.`
  );
}

// Cota mensal de perguntas esgotada — honesto, sem drama e com a saída
// determinística por comando (a rede de segurança da conversa).
function montarLimitePerguntasAtingido(limite) {
  return (
    `Você usou as *${limite} perguntas* deste mês. Elas renovam no dia 1. 🗓️\n\n` +
    `Enquanto isso, os comandos continuam funcionando normalmente:\n` +
    `• */gastos* — seus gastos por categoria\n` +
    `• */economia* — quanto você já economizou\n` +
    `• */historico* — suas últimas compras`
  );
}

// Falha técnica no agente (Gemini caiu, query falhou) — Desenho §9: resposta
// neutra + comando equivalente; NUNCA um número chutado.
function montarErroAgente() {
  return (
    `Tive um problema técnico para responder agora. 😕\n\n` +
    `Tente de novo em instantes — ou veja seus gastos do mês direto com o comando */gastos*.`
  );
}

module.exports = {
  nomeDoMes,
  brl,
  fmtMoeda,
  montarConfirmacaoPix,
  montarConfirmacaoPixEntrada,
  montarPixValorIlegivel,
  montarDigestSemanal,
  montarResposta,
  montarMensagemErro,
  montarAvisoSucessoParcial,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemStatusLimite,
  montarMensagemPlanos,
  montarMensagemPix,
  montarMensagemAlerta,
  montarOnboarding1,
  montarOnboarding2,
  montarOnboarding3,
  montarOnboarding4,
  montarResumoMensal,
  montarMensagemGastos,
  montarBlocoSuperfluo,
  montarAcompanharConfirmado,
  montarAcompanharErro,
  montarAcompanharParado,
  montarListaAcompanhamentos,
  montarSuperfluoConfirmado,
  montarSuperfluoConfig,
  montarSuperfluoInvalido,
  montarTetoConfirmado,
  montarTetoErro,
  montarUpsellAcompanhamentos,
  montarAlertaLimite,
  montarMensagemInflacao,
  montarMensagemEconomia,
  montarMensagemCortar,
  montarMensagemComparativo,
  montarMensagemPrivacidade,
  montarConfirmacaoApagar,
  montarApagarConcluido,
  montarApagarErro,
  montarForaDeEscopo,
  montarAvisoMeioLimitePerguntas,
  montarLimitePerguntasAtingido,
  montarErroAgente,
  montarMensagemEnviarComoArquivo,
  montarMensagemDocumentoNaoSuportado,
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
