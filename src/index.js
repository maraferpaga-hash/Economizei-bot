require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { enviarMensagem, baixarImagem } = require('./zapi');
const { lerRecibo } = require('./gemini');
const {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
  buscarStatusUsuario,
  atualizarOnboardingStep,
  salvarWaitlist,
} = require('./supabase');
const {
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
} = require('./formatter');
const { verificarAlerta } = require('./alerts');
const { log, maskPhone } = require('./logger');
const { iniciar: iniciarScheduler } = require('./scheduler');
const { executarResumoMensal } = require('./monthlySummary');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50kb' }));
app.use('/waitlist', cors({ origin: '*' })); // restringir ao domínio real pós-deploy

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
  const phone = body?.phone;

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

  if (body.text) {
    if (typeof body.text.message !== 'string' || body.text.message.trim() === '') {
      log('payload_invalido', { motivo: 'text.message ausente' });
      return;
    }
    processarTexto(phone, body.text.message).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message })
    );
  } else if (body.image) {
    if (typeof body.image.imageUrl !== 'string' || !body.image.imageUrl.startsWith('http')) {
      log('payload_invalido', { motivo: 'image.imageUrl ausente' });
      return;
    }
    processarImagem(phone, body.image.imageUrl).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message })
    );
  }
  // Delivery receipts, status updates e outros eventos Z-API — ignorados silenciosamente
});

// ---------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------
// POST /waitlist — cadastro de interesse da landing page
// ---------------------------------------------------------------
app.post('/waitlist', async (req, res) => {
  const { nome, whatsapp, plano_interesse, variant_ab,
          utm_source, utm_medium, utm_campaign, utm_content } = req.body || {};

  if (!nome || !whatsapp) {
    return res.status(400).json({ erro: 'nome e whatsapp são obrigatórios' });
  }
  const digits = String(whatsapp).replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    return res.status(400).json({ erro: 'whatsapp inválido' });
  }

  try {
    await salvarWaitlist({ nome, whatsapp: digits, plano_interesse, variant_ab,
                           utm_source, utm_medium, utm_campaign, utm_content });
  } catch (err) {
    log('waitlist_erro_supabase', { erro: err.message });
    return res.status(500).json({ erro: 'falha ao salvar' });
  }

  log('waitlist_cadastro', {
    nome,
    whatsapp_mascarado: maskPhone(digits),
    plano: plano_interesse,
    variant_ab,
  });

  const msg =
    `Oi, ${nome}! 🎉\n\n` +
    `Você está dentro do Economizei como *Beta Fundador*. 🏆\n\n` +
    `Isso significa que quando os planos pagos chegarem, você ganha *3 meses grátis* + preço travado pra sempre. 🔒\n\n` +
    `Por enquanto, começa a usar agora: manda a foto do cupom aqui nessa conversa depois das suas compras no mercado.\n\n` +
    `— Equipe Economizei`;

  enviarMensagem(digits, msg).catch((err) =>
    log('waitlist_whatsapp_erro', { erro: err.message })
  );

  res.json({ sucesso: true });
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

  // Steps 0 e 1: onboarding intercepta qualquer texto
  if (step === 0 || step === 1) {
    await gerenciarOnboarding(phone, step, 'texto', null);
    return;
  }

  // Normaliza: lowercase + trim + remove pontuação ao redor + split em palavras
  const msg = (texto || '').toLowerCase().trim();
  const palavras = msg.replace(/[.,!?;:]/g, '').split(/\s+/);
  const ehComando = (...cmds) => cmds.some((c) => palavras.includes(c) || msg === c);

  if (msg.includes('quantos cupons') || msg.includes('meu plano') || msg.includes('meu limite')) {
    const status = await buscarStatusUsuario(phone);
    await enviarMensagem(phone, montarMensagemStatusLimite(status));
    return;
  }

  if (ehComando('/limite', 'limite', '/plano', 'plano', '/cupons', 'cupons')) {
    const status = await buscarStatusUsuario(phone);
    await enviarMensagem(phone, montarMensagemStatusLimite(status));
    return;
  }

  if (ehComando('historico', 'histórico', '/historico', '/resumo', 'resumo')) {
    await mostrarHistorico(phone);
  } else if (ehComando('oi', 'olá', 'ola', 'ajuda', '/ajuda', 'start', 'menu', 'help', '/start')) {
    await enviarMensagem(phone, montarMensagemBemVindo());
  } else {
    await enviarMensagem(phone, '📸 Me manda a foto do cupom do mercado!');
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

    const alerta = verificarAlerta(dados.total, media);
    if (alerta) {
      log('alerta_disparado', { phone: maskPhone(phone), percentual: Math.round(alerta.percentual) });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await enviarMensagem(phone, montarMensagemAlerta(alerta.percentual, alerta.media));
    }

    log('cupom_registrado', { phone: maskPhone(phone), loja: dados.loja, total: dados.total });
  } catch (err) {
    log('cupom_erro_interno', { phone: maskPhone(phone), erro: err.message });
    // Best-effort: tentar avisar o usuário, mas não deixar o erro do envio derrubar o handler
    try {
      await enviarMensagem(phone, montarMensagemErro('Erro interno ao processar imagem'));
    } catch (_) { /* já logado em zapi_erro */ }
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
