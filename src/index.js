require('dotenv').config();

const express = require('express');
const { enviarMensagem, baixarImagem, enviarImagem } = require('./zapi');
const { lerRecibo } = require('./gemini');
const {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
  buscarStatusUsuario,
  atualizarOnboardingStep,
  buscarGastosPorCategoria,
  buscarMesMaisRecenteComGastos,
  buscarHistoricoCategorias,
  buscarHistoricoPrecoItens,
  buscarTotaisMensais,
  setOptOutPrecos,
  gerarCodigoIndicacao,
  registrarIndicacaoPendente,
  ativarIndicacao,
  converterIndicacao,
  marcarProAtivo,
  buscarStatusIndicacoes,
  setPendentePlano,
  limparPendentePlano,
  salvarAssinaturaPreapproval,
  atualizarStatusAssinatura,
  buscarPorPreapprovalId,
  registrarEventoAssinatura,
  buscarDadosAssinatura,
  registrarMensagemProcessada,
  // salvarWaitlist — DEPRECATED em 2026-05-22 (waitlist removida); função
  // mantida em supabase.js para reativação futura se necessário.
} = require('./supabase');
const {
  montarResposta,
  montarMensagemErro,
  montarMensagemPlanos,
  montarAvisoSucessoParcial,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemStatusLimite,
  montarMensagemAlerta,
  montarOnboarding1,
  montarOnboarding2,
  montarOnboarding3,
  montarOnboarding4,
  montarMensagemGastos,
  montarMensagemInflacao,
  montarMensagemEconomia,
  montarMensagemPrivacidade,
  montarMensagemEnviarComoArquivo,
  montarMensagemConvite,
  montarBoasVindasIndicado,
  montarAvisoIndicacaoAtivada,
  montarAvisoIndicacaoConvertida,
  montarMensagemPix,
  montarMensagemPedirEmail,
  montarMensagemLinkAssinatura,
  montarMensagemAssinaturaAtivada,
  montarMensagemAssinaturaCancelada,
  montarMensagemEmailInvalido,
  montarMensagemErroAssinatura,
  montarMensagemPagamentoFalhou,
  montarMensagemJaAssinante,
  nomeDoMes,
} = require('./formatter');
const {
  PLANOS,
  normalizarPlano,
  criarAssinatura,
  consultarAssinatura,
  consultarPagamentoRecorrente,
  cancelarAssinatura,
  validarAssinaturaWebhook,
} = require('./mercadopago');
const { gerarUrlGraficoCategorias } = require('./charts');
const { analisarRaioXCategorias, analisarInflacaoPessoal, calcularEconomia } = require('./insights');
const { avaliarCompra, deveEnviarMensagem } = require('./alerts');
const { log, maskPhone } = require('./logger');
const { iniciar: iniciarScheduler } = require('./scheduler');
const { executarResumoMensal } = require('./monthlySummary');
const { buscarTodasMetricas } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50kb' }));
// endpoint /waitlist removido em 2026-05-22 (decisão: paywall PIX dia 1, waitlist
// substituída por CTA direto na landing). Bloco de CORS abaixo mantido como
// comentário caso o endpoint precise ser reativado no futuro.
// app.use('/waitlist', cors({ origin: '*' }));

// ---------------------------------------------------------------
// Rate limiter em memória — 10 mensagens/minuto por número
// Estrutura: { phone: { count: N, resetAt: timestamp } }
// ---------------------------------------------------------------
const rateLimiter = new Map();

function checkRateLimit(phone) {
  const agora = Date.now();
  const entrada = rateLimiter.get(phone);

  if (!entrada || entrada.resetAt < agora) {
    rateLimiter.set(phone, { count: 1, resetAt: agora + 60_000 });
    return { permitido: true };
  }
  if (entrada.count < 10) {
    entrada.count++;
    return { permitido: true };
  }
  return { permitido: false, segundosRestantes: Math.ceil((entrada.resetAt - agora) / 1000) };
}

setInterval(() => {
  const agora = Date.now();
  for (const [phone, dados] of rateLimiter.entries()) {
    if (dados.resetAt < agora) rateLimiter.delete(phone);
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------
// Indicação (/convidar) — helpers de código e link wa.me
// ---------------------------------------------------------------
const REGEX_CODIGO_INDICACAO = /CONV-[A-Z0-9]{4,8}/i;

function extrairCodigoIndicacao(texto) {
  const m = (texto || '').match(REGEX_CODIGO_INDICACAO);
  return m ? m[0].toUpperCase() : null;
}

function montarLinkConvite(codigo) {
  const numero = (process.env.BOT_PHONE || '').replace(/\D/g, '');
  if (!numero) {
    // Sem BOT_PHONE configurado: evita gerar link quebrado
    return `(configure BOT_PHONE no .env) — seu código: ${codigo}`;
  }
  const texto = encodeURIComponent(`Quero começar no Economizei ${codigo}`);
  return `https://wa.me/${numero}?text=${texto}`;
}

// ---------------------------------------------------------------
// Dedup de eventos do webhook por messageId (lei 5 do CODE_GUIDE).
// O Z-API pode reentregar o mesmo evento (retry/rede/reconexão). Se o
// messageId já foi processado, ignora — não duplica compra nem contador.
// Sem messageId no payload, processa normalmente (sem dedup possível).
// ---------------------------------------------------------------
async function despacharComDedup(messageId, phone, tipo, fn) {
  if (messageId) {
    const { duplicado } = await registrarMensagemProcessada(messageId, phone, tipo);
    if (duplicado) {
      log('webhook_evento_duplicado', { phone: maskPhone(phone), tipo, message_id: messageId });
      return;
    }
  } else {
    log('webhook_sem_message_id', { phone: maskPhone(phone), tipo });
  }
  await fn();
}

// ---------------------------------------------------------------
// POST /webhook — ponto de entrada de todos os eventos do Z-API
// ---------------------------------------------------------------
app.post('/webhook', (req, res) => {
  // Único ponto de rejeição 4xx — antes do 200; não veio do Z-API, sem risco de reenvio
  if (!req.is('application/json')) {
    return res.status(400).json({ erro: 'Content-Type deve ser application/json' });
  }

  // A partir daqui o Z-API não vai reenviar — respostas adicionais causariam erro
  res.sendStatus(200);

  const body = req.body;
  // Remove o '+' inicial que alguns gateways incluem no DDI (ex: +15551234567 → 15551234567)
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/^\+/, '') : body?.phone;

  if (typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) {
    log('payload_invalido', { motivo: 'phone inválido' });
    return;
  }

  const rateCheck = checkRateLimit(phone);
  if (!rateCheck.permitido) {
    log('rate_limit_atingido', { phone: maskPhone(phone), segundos_restantes: rateCheck.segundosRestantes });
    enviarMensagem(phone, `⏳ Você enviou muitas mensagens em pouco tempo. Aguarde ${rateCheck.segundosRestantes} segundos e tente novamente.`)
      .catch((err) => log('rate_limit_envio_erro', { phone: maskPhone(phone), erro: err.message }));
    return;
  }

  const tipo = body.text ? 'texto' : body.image ? 'imagem' : 'ignorado';
  log('webhook_recebido', { tipo });

  // messageId do Z-API: chave de idempotência. Reentrega do mesmo evento não
  // pode gerar compra/contador duplicado (lei 5 do CODE_GUIDE).
  const messageId = typeof body.messageId === 'string' && body.messageId.trim()
    ? body.messageId.trim()
    : null;

  if (body.text) {
    if (typeof body.text.message !== 'string' || body.text.message.trim() === '') {
      log('payload_invalido', { motivo: 'text.message ausente' });
      return;
    }
    const mensagem = body.text.message;
    despacharComDedup(messageId, phone, 'texto', () => processarTexto(phone, mensagem)).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message })
    );
  } else if (body.image) {
    if (typeof body.image.imageUrl !== 'string' || !body.image.imageUrl.startsWith('http')) {
      log('payload_invalido', { motivo: 'image.imageUrl ausente' });
      return;
    }
    const imageUrl = body.image.imageUrl;
    despacharComDedup(messageId, phone, 'imagem', () => processarImagem(phone, imageUrl)).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message })
    );
  }
  // Delivery receipts, status updates e outros eventos Z-API — ignorados silenciosamente
});

// ---------------------------------------------------------------
// POST /webhook/mercadopago — eventos de assinatura do Mercado Pago
// O MP espera 200/201 em até 22s, senão reenvia. Respondemos na hora e
// processamos de forma assíncrona. A autenticidade é garantida de duas
// formas: (1) validação HMAC do x-signature e (2) reconsulta do recurso
// na API do MP com nosso access token antes de ligar is_pro.
// ---------------------------------------------------------------
app.post('/webhook/mercadopago', (req, res) => {
  res.sendStatus(200);
  processarWebhookMP(req).catch((err) => log('mp_webhook_erro', { erro: err.message }));
});

// ---------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------
// GET /admin/metrics — métricas consolidadas (autenticado)
// Uso: curl -H "X-Admin-Secret: SEU_SECRET" https://seu-bot.up.railway.app/admin/metrics
// Variável de ambiente necessária: ADMIN_SECRET (gere com: openssl rand -hex 32)
// ---------------------------------------------------------------
app.get('/admin/metrics', async (req, res) => {
  const secret = req.header('X-Admin-Secret');
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ erro: 'unauthorized' });
  }
  try {
    const metricas = await buscarTodasMetricas();
    res.json(metricas);
  } catch (err) {
    log('admin_metrics_erro', { erro: err.message });
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------------
// POST /admin/ativar-pro — ativa o Pro de um usuário (PIX manual) e,
// se ele veio por indicação, concede a recompensa de conversão ao indicador.
// Centraliza o passo manual que antes era editar o is_pro direto no Supabase.
// Uso: curl -X POST -H "X-Admin-Secret: SEU_SECRET" \
//        "https://seu-bot.up.railway.app/admin/ativar-pro?phone=5517999999999"
// ---------------------------------------------------------------
app.post('/admin/ativar-pro', async (req, res) => {
  const secret = req.header('X-Admin-Secret');
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ erro: 'unauthorized' });
  }
  const phone = typeof req.query.phone === 'string' ? req.query.phone.replace(/^\+/, '') : null;
  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({ erro: 'phone inválido (use DDI+DDD+numero, ex: 5517999999999)' });
  }

  try {
    await marcarProAtivo(phone);
    const conv = await converterIndicacao(phone);
    res.json({ ok: true, pro_ativado: maskPhone(phone), indicacao_convertida: conv?.converteu ?? false });

    // Notifica o indicador (best-effort, fora da resposta HTTP)
    if (conv?.converteu) {
      enviarMensagem(conv.indicadorPhone, montarAvisoIndicacaoConvertida(conv.dias))
        .catch((err) => log('indicacao_conversao_aviso_erro', { erro: err.message }));
    }
  } catch (err) {
    log('admin_ativar_pro_erro', { phone: maskPhone(phone), erro: err.message });
    res.status(500).json({ erro: err.message });
  }
});

// ---------------------------------------------------------------
// POST /waitlist — DEPRECATED em 2026-05-22
// ---------------------------------------------------------------
// Antes: aceitava cadastros da waitlist da landing e enviava mensagem
// promocional do "Beta Fundador" (com 3 meses grátis + preço travado).
//
// Decisão de 2026-05-22 (ver CLAUDE.md seção 8): paywall ativo desde o
// lançamento via PIX manual, waitlist removida da landing, copy do bot
// reescrita sem promessas de benefícios.
//
// Endpoint mantido como 410 Gone pra clientes que tenham link/bookmark
// antigo — retorna instrução pra usar o WhatsApp diretamente.
app.post('/waitlist', (req, res) => {
  log('waitlist_endpoint_deprecated_chamado', {});
  res.status(410).json({
    erro: 'endpoint descontinuado',
    instrucao: 'A waitlist foi descontinuada. Use o WhatsApp do bot diretamente — manda "oi" pra começar ou "/planos" pra ver as opções pagas.'
  });
});

// ---------------------------------------------------------------
// POST /cron/monthly-summary — disparo externo do resumo mensal
// ---------------------------------------------------------------
app.post('/cron/monthly-summary', async (req, res) => {
  const secret = req.header('X-Cron-Secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ erro: 'unauthorized' });
  }
  const phone = req.query.phone || null;
  const mesRef = req.query.mes || new Date().toISOString().slice(0, 7);
  res.json({ aceito: true, mes: mesRef, phone_especifico: phone });
  executarResumoMensal(mesRef, phone).catch(err =>
    log('cron_endpoint_erro', { erro: err.message })
  );
});

// ---------------------------------------------------------------
// Gerencia mensagens adicionais do fluxo de onboarding (steps 0-2)
// ---------------------------------------------------------------
async function gerenciarOnboarding(phone, step, tipo, dadosProcessados) {
  if (step === 0) {
    await enviarMensagem(phone, montarOnboarding1());
    await atualizarOnboardingStep(phone, 1);
    log('onboarding_step', { phone: maskPhone(phone), step_anterior: 0, step_novo: 1 });
    return;
  }
  if (step === 1 && tipo === 'texto') {
    await enviarMensagem(phone, montarOnboarding2());
    return;
  }
  if (step === 1 && tipo === 'imagem') {
    await enviarMensagem(phone, montarOnboarding3());
    await atualizarOnboardingStep(phone, 2);
    log('onboarding_step', { phone: maskPhone(phone), step_anterior: 1, step_novo: 2 });
    return;
  }
  if (step === 2 && tipo === 'imagem') {
    await enviarMensagem(phone, montarOnboarding4(dadosProcessados.dados, dadosProcessados.totalMes));
    await atualizarOnboardingStep(phone, 3);
    log('onboarding_step', { phone: maskPhone(phone), step_anterior: 2, step_novo: 3 });
    return;
  }
}

// ---------------------------------------------------------------
// Processa mensagens de texto (comandos)
// ---------------------------------------------------------------
async function processarTexto(phone, texto) {
  const usuario = await upsertUsuario(phone);
  const step = usuario.onboarding_step ?? 0;

  // Detecção de código de indicação no 1º contato (step 0 = nunca respondeu antes).
  // Registra a aresta indicador→indicado; fire-and-forget (não bloqueia onboarding).
  if (step === 0) {
    const codigo = extrairCodigoIndicacao(texto);
    if (codigo) {
      registrarIndicacaoPendente(codigo, phone).catch((err) =>
        log('indicacao_registro_erro', { phone: maskPhone(phone), erro: err.message })
      );
    }
  }

  // Steps 0 e 1: onboarding intercepta qualquer texto
  if (step === 0 || step === 1) {
    await gerenciarOnboarding(phone, step, 'texto', null);
    return;
  }

  // Normaliza: lowercase + trim + remove pontuação ao redor + split em palavras
  const msg = (texto || '').toLowerCase().trim();
  const palavras = msg.replace(/[.,!?;:]/g, '').split(/\s+/);
  const ehComando = (...cmds) => cmds.some((c) => palavras.includes(c) || msg === c);

  // --- Fluxo de assinatura: aguardando o e-mail do usuário ---------------
  // Se o usuário escolheu um plano via /assinar e ainda não mandou o e-mail,
  // a próxima mensagem (que não seja um comando) é interpretada como o e-mail.
  if (usuario.assinatura_pendente_plano) {
    if (ehComando('/cancelar', 'cancelar', '/sair', 'sair', '/parar', 'parar')) {
      await limparPendentePlano(phone);
      await enviarMensagem(phone, 'Tudo bem, cancelei o processo de assinatura. Quando quiser ver os planos de novo: */planos*. 👍');
      return;
    }
    // Comando explícito (começa com "/") abandona o fluxo de e-mail e segue normal
    if (!msg.startsWith('/')) {
      const email = extrairEmail(texto);
      if (!email) {
        await enviarMensagem(phone, montarMensagemEmailInvalido());
        return;
      }
      await finalizarAssinatura(phone, usuario.assinatura_pendente_plano, email);
      return;
    }
    await limparPendentePlano(phone); // usou outro comando: limpa a pendência e continua
  }

  if (msg.includes('quantos cupons') || msg.includes('meu plano') || msg.includes('meu limite')) {
    const status = await buscarStatusUsuario(phone);
    await enviarMensagem(phone, montarMensagemStatusLimite(status));
    return;
  }

  if (ehComando('/limite', 'limite', '/cupons', 'cupons')) {
    const status = await buscarStatusUsuario(phone);
    await enviarMensagem(phone, montarMensagemStatusLimite(status));
    return;
  }

  // "/assinar <plano>" inicia a assinatura no cartão. Sem plano válido, cai
  // no menu de planos. Precisa vir ANTES do bloco /planos (que também casa /assinar).
  if (palavras[0] === '/assinar' || palavras[0] === 'assinar') {
    const plano = normalizarPlano(palavras.slice(1).join(' '));
    if (!plano) {
      await enviarMensagem(phone, montarMensagemPlanos());
      return;
    }
    await iniciarAssinatura(phone, usuario, plano);
    return;
  }

  if (ehComando('/planos', 'planos', '/plano', 'plano', '/pro', 'pro', '/upgrade', 'upgrade', '/preco', 'preço', 'preco')) {
    await enviarMensagem(phone, montarMensagemPlanos());
    return;
  }

  if (ehComando('/pix', 'pix')) {
    await enviarMensagem(phone, montarMensagemPix());
    return;
  }

  if (ehComando('/cancelar', 'cancelar', '/cancelar-assinatura', 'cancelar-assinatura')) {
    await cancelarAssinaturaUsuario(phone);
    return;
  }

  if (ehComando('/gastos', 'gastos', '/categorias', 'categorias', '/grafico', 'gráfico')) {
    await mostrarGastos(phone);
    return;
  }

  if (ehComando('/inflacao', 'inflacao', '/inflação', 'inflação')) {
    await mostrarInflacao(phone);
    return;
  }

  if (ehComando('/economia', 'economia', '/economizei')) {
    await mostrarEconomia(phone);
    return;
  }

  if (ehComando('/convidar', 'convidar', '/indicar', 'indicar', '/convite', 'convite')) {
    await mostrarConvite(phone);
    return;
  }

  if (ehComando('/privacidade', 'privacidade')) {
    await enviarMensagem(phone, montarMensagemPrivacidade());
    return;
  }

  if (ehComando('/nao-compartilhar', 'nao-compartilhar', '/naoquero')) {
    await setOptOutPrecos(phone, true);
    await enviarMensagem(
      phone,
      '✅ Entendido. Seus preços não serão mais usados na rede de comparação de mercados.\n\nSeu histórico pessoal continua salvo normalmente. Para reativar a qualquer momento: */compartilhar*'
    );
    return;
  }

  if (ehComando('/compartilhar', 'compartilhar')) {
    await setOptOutPrecos(phone, false);
    await enviarMensagem(
      phone,
      '✅ Ativado! Seus preços voltam a contribuir anonimamente para o comparativo entre mercados.\n\nPara sair novamente: */nao-compartilhar*'
    );
    return;
  }

  if (ehComando('historico', 'histórico', '/historico', '/resumo', 'resumo')) {
    await mostrarHistorico(phone);
  } else if (ehComando('oi', 'olá', 'ola', 'ajuda', '/ajuda', 'start', 'menu', 'help', '/start')) {
    await enviarMensagem(phone, montarMensagemBemVindo());
  } else {
    await enviarMensagem(phone, 'Não consegui entender essa mensagem, desculpe. 🙂\n\nPara registrar uma compra, mande a foto do cupom fiscal.\nPara ver tudo que eu faço, mande */ajuda*.');
  }
}

// ---------------------------------------------------------------
// Processa imagens de cupons fiscais — fluxo principal
// ---------------------------------------------------------------
async function processarImagem(phone, imageUrl) {
  try {
    const usuario = await upsertUsuario(phone);
    const step = usuario.onboarding_step ?? 0;

    // Step 0: enviar boas-vindas e não processar a imagem ainda
    if (step === 0) {
      await gerenciarOnboarding(phone, step, 'imagem', null);
      return;
    }

    const { atingido, cuponsUsados } = await verificarLimiteGratuito(phone);
    if (atingido) {
      log('limite_atingido', { phone: maskPhone(phone), cupons_usados: cuponsUsados });
      await enviarMensagem(phone, montarMensagemLimite());
      return;
    }

    log('cupom_iniciando', { phone: maskPhone(phone) });
    const buffer = await baixarImagem(imageUrl);
    const dados = await lerRecibo(buffer);

    if (!dados.sucesso) {
      log('cupom_erro_leitura', {
        phone: maskPhone(phone),
        categoria: dados.categoria_erro,
        motivo: dados.motivo,
      });
      await enviarMensagem(phone, montarMensagemErro(dados.motivo, dados.categoria_erro));
      // Borrado mesmo após pré-processamento: orienta a reenviar como documento
      if (dados.categoria_erro === 'borrado') {
        await new Promise(r => setTimeout(r, 800));
        await enviarMensagem(phone, montarMensagemEnviarComoArquivo());
      }
      return;
    }

    // Calcula média ANTES de salvar a compra atual — assim o alerta compara
    // com o histórico real e não com uma média já influenciada pela compra de agora.
    const media = await calcularMedia(phone);

    await salvarCompra(phone, {
      loja: dados.loja,
      total: dados.total,
      data_compra: dados.data_compra,
      itens: dados.itens,
      cnpj: dados.cnpj,
      tipo: dados.tipo,
    });

    // Após salvar, busca totalMes (já inclui a compra atual) e o contador atualizado do usuário
    const [historico, usuarioAtualizado] = await Promise.all([
      buscarHistorico(phone, 1),
      upsertUsuario(phone),
    ]);

    const resposta = montarResposta(dados, {
      totalMes: historico.totalMes,
      // Fallback: 0 em vez de historico.compras.length (que é sempre 1 com limit=1)
      qtdComprasMes: usuarioAtualizado.compras_mes_atual ?? 0,
    });
    await enviarMensagem(phone, resposta);

    if (dados.itens.length === 0) {
      log('cupom_sucesso_parcial', { phone: maskPhone(phone), total: dados.total });
      await new Promise((r) => setTimeout(r, 600));
      await enviarMensagem(phone, montarAvisoSucessoParcial());
    }

    // Mensagem de onboarding adicional após a resposta normal (steps 1 e 2)
    if (step === 1 || step === 2) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await gerenciarOnboarding(phone, step, 'imagem', { dados, totalMes: historico.totalMes });
    }

    // Comparação com a média histórica — só para compras de mercado.
    // Cupom não-mercado (farmácia/posto) não tem padrão de gasto comparável.
    if (dados.tipo !== 'outros') {
      const avaliacao = avaliarCompra(dados.total, media);
      if (avaliacao && deveEnviarMensagem(avaliacao.nivel)) {
        log('alerta_disparado', {
          phone: maskPhone(phone),
          nivel: avaliacao.nivel,
          percentual: Math.round(avaliacao.percentual),
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await enviarMensagem(phone, montarMensagemAlerta(avaliacao));
      }
    }

    log('cupom_registrado', { phone: maskPhone(phone), loja: dados.loja, total: dados.total });

    // Marco de ativação de indicação: se este usuário veio por indicação e ainda
    // estava pendente, este 1º cupom libera a recompensa pros dois lados.
    // Self-contained (nunca lança) — não pode derrubar o fluxo do cupom já salvo.
    await processarAtivacaoIndicacao(phone);
  } catch (err) {
    log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message });
    // Best-effort: tentar avisar o usuário, mas não deixar o erro do envio derrubar o handler
    try {
      await enviarMensagem(phone, montarMensagemErro('Erro interno ao processar imagem'));
    } catch (_) { /* já logado em zapi_erro */ }
  }
}

// ---------------------------------------------------------------
// Indicação — responde ao /convidar com link + status
// ---------------------------------------------------------------
async function mostrarConvite(phone) {
  try {
    const [codigo, status] = await Promise.all([
      gerarCodigoIndicacao(phone),
      buscarStatusIndicacoes(phone),
    ]);
    const link = montarLinkConvite(codigo);
    await enviarMensagem(phone, montarMensagemConvite(codigo, link, status));
  } catch (err) {
    log('convite_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui gerar seu link de convite agora. Tenta de novo em instantes? 🙏');
  }
}

// Marco de ativação: chamado após o usuário registrar um cupom com sucesso.
// Se houver indicação pendente, ativa e notifica os dois lados. Nunca lança.
async function processarAtivacaoIndicacao(phone) {
  try {
    const r = await ativarIndicacao(phone);
    if (!r?.ativou) return;

    // Avisa o indicado (este número) que ganhou a recompensa
    await enviarMensagem(phone, montarBoasVindasIndicado(r.dias));
    // Avisa o indicador que a indicação dele deu certo
    await enviarMensagem(r.indicadorPhone, montarAvisoIndicacaoAtivada(r.dias))
      .catch((err) => log('indicacao_aviso_erro', { erro: err.message }));
    log('indicacao_ativacao_notificada', { indicado: maskPhone(phone), indicador: maskPhone(r.indicadorPhone) });
  } catch (err) {
    log('indicacao_ativacao_erro', { phone: maskPhone(phone), erro: err.message });
  }
}

// ---------------------------------------------------------------
// Assinaturas (Mercado Pago) — fluxo de comandos
// ---------------------------------------------------------------

// Extrai um e-mail válido de um texto livre, ou null.
function extrairEmail(texto) {
  const m = (texto || '').match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  return m ? m[0].trim().toLowerCase() : null;
}

// Passo 1: usuário escolheu um plano. Se já for Pro, avisa; senão pede o e-mail.
async function iniciarAssinatura(phone, usuario, plano) {
  try {
    if (usuario.is_pro) {
      const label = PLANOS[usuario.plano]?.label || 'Pro';
      await enviarMensagem(phone, montarMensagemJaAssinante(label));
      return;
    }
    await setPendentePlano(phone, plano);
    await enviarMensagem(phone, montarMensagemPedirEmail(PLANOS[plano].label));
  } catch (err) {
    log('assinatura_iniciar_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, montarMensagemErroAssinatura());
  }
}

// Passo 2: usuário mandou o e-mail. Cria o preapproval no MP e envia o link.
async function finalizarAssinatura(phone, plano, email) {
  try {
    const r = await criarAssinatura({ phone, email, plano });
    if (!r.ok) {
      await limparPendentePlano(phone);
      log('assinatura_criar_falhou', { phone: maskPhone(phone), erro: r.error });
      await enviarMensagem(phone, montarMensagemErroAssinatura());
      return;
    }
    // salvarAssinaturaPreapproval grava o preapproval e limpa o pendente_plano
    await salvarAssinaturaPreapproval(phone, {
      preapprovalId: r.preapprovalId,
      plano,
      email,
      status: r.status || 'pending',
    });
    const valorTexto = PLANOS[plano].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    await enviarMensagem(phone, montarMensagemLinkAssinatura(PLANOS[plano].label, valorTexto, r.initPoint));
    log('assinatura_link_enviado', { phone: maskPhone(phone), plano });
  } catch (err) {
    log('assinatura_finalizar_erro', { phone: maskPhone(phone), erro: err.message });
    await limparPendentePlano(phone).catch(() => {});
    await enviarMensagem(phone, montarMensagemErroAssinatura());
  }
}

// Comando /cancelar (quando não há fluxo de e-mail pendente): cancela a assinatura.
async function cancelarAssinaturaUsuario(phone) {
  try {
    const dados = await buscarDadosAssinatura(phone);
    if (!dados?.mp_preapproval_id || dados.assinatura_status === 'cancelled') {
      await enviarMensagem(phone, 'Você não tem uma assinatura ativa por cartão no momento. Para ver os planos: */planos*.');
      return;
    }
    const r = await cancelarAssinatura(dados.mp_preapproval_id);
    if (!r.ok) {
      await enviarMensagem(phone, 'Não consegui cancelar agora. Tenta de novo em instantes, por favor. 🙏');
      return;
    }
    await atualizarStatusAssinatura(phone, 'cancelled');
    await enviarMensagem(phone, montarMensagemAssinaturaCancelada());
    log('assinatura_cancelada_usuario', { phone: maskPhone(phone) });
  } catch (err) {
    log('assinatura_cancelar_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui cancelar agora. Tenta de novo em instantes, por favor. 🙏');
  }
}

// ---------------------------------------------------------------
// Assinaturas (Mercado Pago) — processamento do webhook
// ---------------------------------------------------------------
async function processarWebhookMP(req) {
  const tipo   = req.body?.type || req.query.type || req.query.topic || null;
  const dataId = req.body?.data?.id || req.query['data.id'] || req.query.id || null;
  const acao   = req.body?.action || null;
  // id único da notificação (idempotência). Cada entrega tem um id; transições
  // de status do mesmo preapproval vêm com ids diferentes → todas processadas.
  const notifId = req.body?.id ? String(req.body.id) : (dataId ? `${dataId}-${Date.now()}` : null);

  if (!tipo || !dataId) {
    log('mp_webhook_payload_incompleto', { tipo, tem_data_id: !!dataId });
    return;
  }

  // Validação de assinatura (defesa em profundidade). Se houver secret e não
  // bater, rejeita. Sem secret, segue — a verdade é reconfirmada no GET do MP.
  const val = validarAssinaturaWebhook({
    xSignature: req.header('x-signature'),
    xRequestId: req.header('x-request-id'),
    dataId,
  });
  if (process.env.MP_WEBHOOK_SECRET && !val.validado) {
    log('mp_webhook_rejeitado', { tipo, motivo: val.motivo });
    return;
  }

  // Idempotência via índice único (topico, recurso_id=notifId).
  const ev = await registrarEventoAssinatura({
    preapprovalId: tipo === 'subscription_preapproval' ? String(dataId) : null,
    topico: String(tipo),
    recursoId: notifId,
    acao,
    payload: req.body || null,
  });
  if (ev.duplicado) {
    log('mp_webhook_duplicado', { tipo, notif_id: notifId });
    return;
  }

  if (tipo === 'subscription_preapproval') {
    await conciliarPreapproval(String(dataId));
  } else if (tipo === 'subscription_authorized_payment') {
    await conciliarPagamentoRecorrente(String(dataId));
  } else {
    log('mp_webhook_tipo_ignorado', { tipo });
  }
}

// Concilia o estado de uma assinatura: lê o status real no MP e atualiza is_pro.
async function conciliarPreapproval(preapprovalId) {
  const info = await consultarAssinatura(preapprovalId);
  if (!info.ok) {
    log('mp_conciliar_preapproval_falha', { preapproval_id: preapprovalId });
    return;
  }
  const phone = String(info.externalReference || '').replace(/^\+/, '');
  if (!/^\d{10,15}$/.test(phone)) {
    log('mp_conciliar_sem_phone', { preapproval_id: preapprovalId });
    return;
  }

  const { statusAnterior } = await atualizarStatusAssinatura(phone, info.status, { preapprovalId });

  // Notifica só na TRANSIÇÃO para authorized (evita mensagem repetida)
  if (info.status === 'authorized' && statusAnterior !== 'authorized') {
    const dados = await buscarDadosAssinatura(phone);
    const label = PLANOS[dados?.plano]?.label || 'Pro';
    await enviarMensagem(phone, montarMensagemAssinaturaAtivada(label))
      .catch((err) => log('mp_aviso_ativada_erro', { erro: err.message }));

    // Marco de conversão de indicação: assinante pagante converte a indicação
    const conv = await converterIndicacao(phone).catch(() => null);
    if (conv?.converteu) {
      enviarMensagem(conv.indicadorPhone, montarAvisoIndicacaoConvertida(conv.dias))
        .catch((err) => log('mp_indicacao_conversao_erro', { erro: err.message }));
    }
  }

  // Notifica cancelamento vindo do lado do MP (ex: usuário cancelou na conta MP)
  if (info.status === 'cancelled' && statusAnterior !== 'cancelled') {
    await enviarMensagem(phone, montarMensagemAssinaturaCancelada())
      .catch((err) => log('mp_aviso_cancelada_erro', { erro: err.message }));
  }
}

// Concilia uma cobrança recorrente (renovação): avisa o usuário se recusada.
async function conciliarPagamentoRecorrente(authorizedPaymentId) {
  const pg = await consultarPagamentoRecorrente(authorizedPaymentId);
  if (!pg.ok || !pg.preapprovalId) {
    log('mp_conciliar_pagamento_falha', { id: authorizedPaymentId });
    return;
  }
  const usuario = await buscarPorPreapprovalId(pg.preapprovalId);
  if (!usuario?.phone_number) {
    log('mp_pagamento_sem_usuario', { preapproval_id: pg.preapprovalId });
    return;
  }

  if (pg.statusPagamento === 'rejected') {
    log('mp_renovacao_recusada', { phone: maskPhone(usuario.phone_number) });
    await enviarMensagem(usuario.phone_number, montarMensagemPagamentoFalhou())
      .catch((err) => log('mp_aviso_falha_erro', { erro: err.message }));
  } else if (pg.statusPagamento === 'approved') {
    log('mp_renovacao_aprovada', { phone: maskPhone(usuario.phone_number) });
    // Reativa is_pro se por algum motivo a assinatura tinha sido pausada
    if (!usuario.is_pro) {
      await atualizarStatusAssinatura(usuario.phone_number, 'authorized', { preapprovalId: pg.preapprovalId });
    }
  }
}

// ---------------------------------------------------------------
// Mostra gráfico de gastos por categoria do mês atual
// ---------------------------------------------------------------
async function mostrarGastos(phone) {
  const mesAtual = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Agrupa por data_compra (data impressa no cupom). Se o mês atual ainda não
  // tem gastos categorizados, cai pro mês mais recente que tem — e avisa qual é.
  let mesAlvo   = mesAtual;
  let dadosCat  = await buscarGastosPorCategoria(phone, mesAtual);
  let usouFallback = false;

  if (!dadosCat || dadosCat.length === 0) {
    const mesRecente = await buscarMesMaisRecenteComGastos(phone);
    if (mesRecente && mesRecente !== mesAtual) {
      mesAlvo = mesRecente;
      dadosCat = await buscarGastosPorCategoria(phone, mesRecente);
      usouFallback = true;
    }
  }

  if (!dadosCat || dadosCat.length === 0) {
    await enviarMensagem(
      phone,
      '📊 Ainda não tenho dados de categoria para nenhum mês.\n\n' +
      'Continue mandando os cupons — a partir de agora cada cupom registra a categoria de cada item automaticamente. 📸'
    );
    return;
  }

  const titulo = nomeDoMes(mesAlvo);

  // Avisa quando está mostrando um mês diferente do atual (data do cupom)
  if (usouFallback) {
    await enviarMensagem(
      phone,
      `📊 Você ainda não tem cupons de *${nomeDoMes(mesAtual)}*.\n\n` +
      `Mostrando seus gastos de *${titulo}* (mês mais recente com compras):`
    );
    await new Promise(r => setTimeout(r, 400));
  }

  const chartUrl = gerarUrlGraficoCategorias(dadosCat, titulo);

  // Envia o gráfico — fallback silencioso se a imagem falhar
  if (chartUrl) {
    try {
      await enviarImagem(phone, chartUrl, `📊 Gastos por categoria — ${titulo}`);
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      log('gastos_imagem_erro', { phone: maskPhone(phone), erro: err.message });
    }
  }

  // F2 — conclusão (raio-X): compara a maior categoria do mês com a média dos
  // meses anteriores do próprio usuário. Degradação segura: se a análise falhar,
  // o /gastos segue mandando o breakdown sem conclusão.
  let analise = null;
  try {
    const historico = await buscarHistoricoCategorias(phone, mesAlvo, 3);
    analise = analisarRaioXCategorias(dadosCat, historico);
  } catch (err) {
    log('gastos_analise_erro', { phone: maskPhone(phone), erro: err.message });
  }

  // Sempre envia o texto com os valores detalhados (+ conclusão quando houver)
  await enviarMensagem(phone, montarMensagemGastos(dadosCat, mesAlvo, analise));
}

// ---------------------------------------------------------------
// F1 — Inflação pessoal por item (/inflacao)
// Compara o preço unitário dos itens recorrentes do usuário ao longo do tempo.
// ---------------------------------------------------------------
async function mostrarInflacao(phone) {
  try {
    const itens = await buscarHistoricoPrecoItens(phone, 6);
    const analise = analisarInflacaoPessoal(itens);
    await enviarMensagem(phone, montarMensagemInflacao(analise));
  } catch (err) {
    log('inflacao_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui calcular a inflação dos seus itens agora. Tenta de novo em instantes? 🙏');
  }
}

// ---------------------------------------------------------------
// F4 — Quanto você já economizou (/economia)
// Compara o gasto de mercado com a média móvel do próprio usuário.
// ---------------------------------------------------------------
async function mostrarEconomia(phone) {
  try {
    const totais = await buscarTotaisMensais(phone, 12);
    const analise = calcularEconomia(totais);
    await enviarMensagem(phone, montarMensagemEconomia(analise));
  } catch (err) {
    log('economia_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui calcular sua economia agora. Tenta de novo em instantes? 🙏');
  }
}

// ---------------------------------------------------------------
// Mostra as últimas 5 compras do usuário
// ---------------------------------------------------------------
async function mostrarHistorico(phone) {
  const { compras } = await buscarHistorico(phone, 5);

  if (!compras || compras.length === 0) {
    await enviarMensagem(phone, 'Você ainda não tem compras registradas. Manda uma foto do cupom! 📸');
    return;
  }

  const linhas = compras.map((c) => {
    const data = c.data_compra ? c.data_compra.slice(5).replace('-', '/') : '??/??';
    const total = Number(c.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return `• ${c.loja || 'Loja'} (${data}) — R$ ${total}`;
  });

  const mensagem = `🧾 *Suas últimas compras:*\n\n${linhas.join('\n')}`;
  await enviarMensagem(phone, mensagem);
}

// ---------------------------------------------------------------
// Sobe o servidor
// ---------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bot Economizei rodando na porta ${PORT}`);
  iniciarScheduler();
});
// fim do arquivo
