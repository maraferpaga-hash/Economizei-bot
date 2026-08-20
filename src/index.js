require('dotenv').config();

const express = require('express');
const { enviarMensagem, baixarImagem, baixarDocumento, enviarImagem } = require('./zapi');
const { lerRecibo } = require('./gemini');
const {
  apagarDadosUsuario,
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
  buscarObservacoesComparativo,
  buscarCategoriasSuperfluas,
  setCategoriasSuperfluas,
  buscarItensDoMes,
  buscarAcompanhamentos,
  salvarAcompanhamento,
  definirLimiteAcompanhamento,
  marcarAlertaLimiteEnviado,
  desativarAcompanhamento,
  setOptOutPrecos,
  gerarCodigoIndicacao,
  registrarIndicacaoPendente,
  ativarIndicacao,
  converterIndicacao,
  marcarProAtivo,
  temFeaturesProAtivas,
  buscarStatusIndicacoes,
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
  montarAcompanharConfirmado,
  montarAcompanharErro,
  montarAcompanharParado,
  montarListaAcompanhamentos,
  montarSuperfluoConfirmado,
  montarSuperfluoConfig,
  montarSuperfluoInvalido,
  montarTetoConfirmado,
  montarTetoErro,
  montarAlertaLimite,
  montarMensagemInflacao,
  montarMensagemEconomia,
  montarMensagemCortar,
  montarMensagemComparativo,
  montarMensagemPrivacidade,
  montarConfirmacaoApagar,
  montarApagarConcluido,
  montarApagarErro,
  montarMensagemEnviarComoArquivo,
  montarMensagemDocumentoNaoSuportado,
  montarMensagemConvite,
  montarBoasVindasIndicado,
  montarAvisoIndicacaoAtivada,
  montarAvisoIndicacaoConvertida,
  montarMensagemPix,
  nomeDoMes,
} = require('./formatter');
const { gerarUrlGraficoCategorias } = require('./charts');
const { analisarRaioXCategorias, analisarInflacaoPessoal, calcularEconomia, analisarOndeCortar, compararPrecosMercado, buscarGastoSuperfluo, buscarGastoPorAlvo, interpretarAcompanhamento, interpretarSuperfluo, interpretarTeto, verificarTetosEstourados } = require('./insights');
const { avaliarCompra, deveEnviarMensagem } = require('./alerts');
const { interpretarApagar } = require('./apagar');
const { responderPergunta } = require('./agent');
const { log, maskPhone } = require('./logger');
const { verificarSchemaCritico } = require('./schemaGuard');
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

// .unref(): o timer de limpeza não segura o processo vivo — em produção roda
// igual (o servidor mantém o processo); em teste (require do módulo) permite
// o node --test encerrar normalmente (cod-0052).
setInterval(() => {
  const agora = Date.now();
  for (const [phone, dados] of rateLimiter.entries()) {
    if (dados.resetAt < agora) rateLimiter.delete(phone);
  }
}, 5 * 60 * 1000).unref();

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
// deps injetáveis (cod-0052): testes passam { registrarMensagemProcessada, log }
// fake — em produção nada muda (defaults = módulos reais).
async function despacharComDedup(messageId, phone, tipo, fn, deps = {}) {
  const registrar = deps.registrarMensagemProcessada || registrarMensagemProcessada;
  const logar = deps.log || log;
  if (messageId) {
    const { duplicado } = await registrar(messageId, phone, tipo);
    if (duplicado) {
      logar('webhook_evento_duplicado', { phone: maskPhone(phone), tipo, message_id: messageId });
      return;
    }
  } else {
    logar('webhook_sem_message_id', { phone: maskPhone(phone), tipo });
  }
  await fn();
}

// MIME aceitável pra leitura de recibo (cod-0061): só foto ou PDF. Qualquer
// outra coisa (áudio, vídeo, contato, zip…) recebe mensagem honesta em vez de
// consumir uma leitura do Gemini à toa. MIME ausente/desconhecido → NÃO aceita
// (protege o orçamento e guia o usuário a mandar como foto/PDF). Pura e testável.
function mimeAceitavel(mime) {
  if (typeof mime !== 'string') return false;
  const m = mime.trim().toLowerCase();
  return m.startsWith('image/') || m.startsWith('application/pdf');
}

// ---------------------------------------------------------------
// Autenticação do webhook (cod-0053) — mesma trava dos endpoints /admin e /cron.
// O Z-API chama /webhook sem credencial própria, então o segredo vai na URL
// (/webhook/<token>) ou, se o painel Z-API permitir, no header x-webhook-token.
// Rollout SEM downtime: enquanto ZAPI_WEBHOOK_TOKEN não estiver setada, PASSA e
// loga (modo 'aberto') — não derruba produção antes de reconfigurar o Z-API.
// Com a env setada, EXIGE o segredo (modo 'fechado', fail-closed).
//   { ok:true,  modo:'aberto'  } → env ausente; processa normal (compat)
//   { ok:true,  modo:'fechado' } → env setada + segredo correto
//   { ok:false, modo:'fechado' } → env setada + segredo errado/ausente → 401
// ---------------------------------------------------------------
function autenticarWebhook(req) {
  const esperado = process.env.ZAPI_WEBHOOK_TOKEN;
  if (!esperado) return { ok: true, modo: 'aberto' };
  const noPath = req && req.params ? req.params.token : null;
  const noHeader = req && typeof req.header === 'function' ? req.header('x-webhook-token') : null;
  const recebido = noPath || noHeader;
  return { ok: recebido === esperado, modo: 'fechado' };
}

// ---------------------------------------------------------------
// Validação pura do payload do webhook (sem I/O) — extraída pra teste
// (cod-0052), comportamento idêntico ao inline anterior. Retorna sempre:
//   { ok:false, motivo, phone:null }             → phone inválido (rejeita ANTES do rate limit)
//   { ok:false, motivo, phone, tipo, messageId } → texto/imagem/documento malformado (rejeita DEPOIS do rate limit)
//   { ok:true,  phone, tipo, messageId, mensagem?|imageUrl?|documentUrl?+mimeType? } → válido
// tipo: 'texto' | 'imagem' | 'documento' | 'ignorado' (delivery receipts etc.)
// ---------------------------------------------------------------
function validarPayloadWebhook(body) {
  // Remove o '+' inicial que alguns gateways incluem no DDI (ex: +15551234567 → 15551234567)
  const phoneRaw = typeof body?.phone === 'string' ? body.phone.replace(/^\+/, '') : body?.phone;
  if (typeof phoneRaw !== 'string' || !/^\d{10,15}$/.test(phoneRaw)) {
    return { ok: false, motivo: 'phone inválido', phone: null };
  }
  const phone = phoneRaw;

  const tipo = body.text ? 'texto' : body.image ? 'imagem' : body.document ? 'documento' : 'ignorado';

  // messageId do Z-API: chave de idempotência. Reentrega do mesmo evento não
  // pode gerar compra/contador duplicado (lei 5 do CODE_GUIDE).
  const messageId = typeof body.messageId === 'string' && body.messageId.trim()
    ? body.messageId.trim()
    : null;

  if (tipo === 'texto') {
    if (typeof body.text.message !== 'string' || body.text.message.trim() === '') {
      return { ok: false, motivo: 'text.message ausente', phone, tipo, messageId };
    }
    return { ok: true, phone, tipo, messageId, mensagem: body.text.message };
  }

  if (tipo === 'imagem') {
    if (typeof body.image.imageUrl !== 'string' || !body.image.imageUrl.startsWith('http')) {
      return { ok: false, motivo: 'image.imageUrl ausente', phone, tipo, messageId };
    }
    return { ok: true, phone, tipo, messageId, imageUrl: body.image.imageUrl };
  }

  if (tipo === 'documento') {
    // Payload de documento do Z-API ainda a confirmar em produção (pré-req humano
    // na AGENDA). Defensivo quanto ao nome do campo de URL: documentUrl (padrão,
    // espelha image.imageUrl) com fallback pra url/fileUrl. mimeType é metadado
    // opcional passado adiante — o gate de MIME acontece no processarDocumento.
    const doc = body.document || {};
    const urlRaw = doc.documentUrl || doc.url || doc.fileUrl;
    if (typeof urlRaw !== 'string' || !urlRaw.startsWith('http')) {
      return { ok: false, motivo: 'document.documentUrl ausente', phone, tipo, messageId };
    }
    const mimeType = typeof doc.mimeType === 'string' ? doc.mimeType
      : typeof doc.mime === 'string' ? doc.mime
      : null;
    return { ok: true, phone, tipo, messageId, documentUrl: urlRaw, mimeType };
  }

  return { ok: true, phone, tipo, messageId };
}

// ---------------------------------------------------------------
// POST /webhook — ponto de entrada de todos os eventos do Z-API
// ---------------------------------------------------------------
app.post(['/webhook', '/webhook/:token'], (req, res) => {
  // Autenticação (cod-0053) — ANTES de qualquer processamento. Segredo no path
  // (/webhook/<token>) ou header x-webhook-token; mesma trava dos /admin e /cron.
  const auth = autenticarWebhook(req);
  if (!auth.ok) {
    log('webhook_token_invalido', { veio_no_path: !!(req.params && req.params.token) });
    return res.status(401).json({ erro: 'unauthorized' });
  }

  // Único ponto de rejeição 4xx por formato — antes do 200; não veio do Z-API, sem risco de reenvio
  if (!req.is('application/json')) {
    return res.status(400).json({ erro: 'Content-Type deve ser application/json' });
  }

  // A partir daqui o Z-API não vai reenviar — respostas adicionais causariam erro
  res.sendStatus(200);

  // Sentinela do rollout: enquanto não há segredo configurado, avisa — assim você
  // sabe quando é seguro exigir (Fase 3). Some quando ZAPI_WEBHOOK_TOKEN for setada.
  if (auth.modo === 'aberto') log('webhook_sem_token_configurado', {});

  const val = validarPayloadWebhook(req.body);

  // phone inválido: rejeita ANTES do rate limit (não polui o limiter) — mesma ordem de antes
  if (!val.phone) {
    log('payload_invalido', { motivo: val.motivo });
    return;
  }

  const rateCheck = checkRateLimit(val.phone);
  if (!rateCheck.permitido) {
    log('rate_limit_atingido', { phone: maskPhone(val.phone), segundos_restantes: rateCheck.segundosRestantes });
    enviarMensagem(val.phone, `⏳ Você enviou muitas mensagens em pouco tempo. Aguarde ${rateCheck.segundosRestantes} segundos e tente novamente.`)
      .catch((err) => log('rate_limit_envio_erro', { phone: maskPhone(val.phone), erro: err.message }));
    return;
  }

  log('webhook_recebido', { tipo: val.tipo });

  // texto/imagem malformado: rejeita DEPOIS do rate limit — mesma ordem de antes
  if (!val.ok) {
    log('payload_invalido', { motivo: val.motivo });
    return;
  }

  if (val.tipo === 'texto') {
    despacharComDedup(val.messageId, val.phone, 'texto', () => processarTexto(val.phone, val.mensagem)).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(val.phone), erro: err.message })
    );
  } else if (val.tipo === 'imagem') {
    despacharComDedup(val.messageId, val.phone, 'imagem', () => processarImagem(val.phone, val.imageUrl)).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(val.phone), erro: err.message })
    );
  } else if (val.tipo === 'documento') {
    despacharComDedup(val.messageId, val.phone, 'documento', () => processarDocumento(val.phone, val.documentUrl, val.mimeType)).catch((err) =>
      log('cupom_erro_interno', { phone: maskPhone(val.phone), erro: err.message })
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
// Comandos que funcionam DURANTE o onboarding (cod-0025 / achado A3).
//
// Nos steps 0 e 1 todo texto era engolido pelo onboarding, então quem chegava
// já querendo assinar mandava "/planos" e recebia a mensagem de onboarding —
// conversão paga travada até a pessoa mandar 1 cupom. Estes comandos passam
// ANTES do gate (mesmo tratamento que o /apagar já tinha por LGPD).
//
// Regra de casamento DELIBERADAMENTE mais estreita que a do `ehComando` normal:
// durante o onboarding a mensagem precisa SER o comando (`/planos`, `planos`)
// ou começar com a forma com barra. Assim "meu plano é apertado", respondendo
// ao onboarding, continua caindo no onboarding — só o comando explícito escapa.
//
// O `onboarding_step` NÃO é alterado aqui: responde o comando e o onboarding
// retoma no passo em que estava na próxima mensagem.
// ---------------------------------------------------------------
const COMANDOS_LIBERADOS_NO_ONBOARDING = {
  planos: ['/planos', 'planos', '/plano', '/pro', '/upgrade', '/preco', '/preço'],
  pix: ['/pix', 'pix'],
  ajuda: ['/ajuda', '/help', '/menu'],
  privacidade: ['/privacidade', 'privacidade'],
};

/**
 * Qual comando liberado a mensagem representa durante o onboarding.
 * Função pura (exportada só para teste).
 * @param {string} texto mensagem crua do usuário
 * @returns {'planos'|'pix'|'ajuda'|'privacidade'|null}
 */
function comandoLiberadoNoOnboarding(texto) {
  const msg = (texto || '').toLowerCase().trim().replace(/[.,!?;:]+$/g, '');
  if (!msg) return null;
  const primeira = msg.split(/\s+/)[0];

  for (const [nome, aliases] of Object.entries(COMANDOS_LIBERADOS_NO_ONBOARDING)) {
    for (const alias of aliases) {
      if (msg === alias) return nome;
      // formas com barra também valem como 1ª palavra (ex.: "/planos familia")
      if (alias.startsWith('/') && primeira === alias) return nome;
    }
  }
  return null;
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

  // /apagar funciona em QUALQUER etapa (direito de eliminação — LGPD),
  // inclusive durante o onboarding. Por isso é tratado ANTES do gate abaixo.
  {
    const { pedido, confirmar } = interpretarApagar(texto);
    if (pedido) {
      await mostrarApagar(phone, confirmar);
      return;
    }
  }

  // Steps 0 e 1: o onboarding intercepta qualquer texto — EXCETO os poucos
  // comandos explícitos liberados acima (cod-0025). O step não é tocado: a
  // pessoa responde o que quiser e o onboarding retoma na próxima mensagem.
  if (step === 0 || step === 1) {
    const liberado = comandoLiberadoNoOnboarding(texto);
    if (liberado) {
      log('comando_durante_onboarding', { phone: maskPhone(phone), step, comando: liberado });
      if (liberado === 'planos') {
        await enviarMensagem(phone, montarMensagemPlanos());
      } else if (liberado === 'pix') {
        await enviarMensagem(phone, montarMensagemPix());
      } else if (liberado === 'privacidade') {
        await enviarMensagem(phone, montarMensagemPrivacidade());
      } else {
        await enviarMensagem(phone, montarMensagemBemVindo());
      }
      return;
    }
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

  if (ehComando('/limite', 'limite', '/cupons', 'cupons')) {
    const status = await buscarStatusUsuario(phone);
    await enviarMensagem(phone, montarMensagemStatusLimite(status));
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

  if (ehComando('/cortar', 'cortar', '/onde-cortar')) {
    await mostrarCortar(phone);
    return;
  }

  if (ehComando('/comparar', 'comparar', '/comparativo', 'comparativo')) {
    await mostrarComparativo(phone, usuario);
    return;
  }

  // Alerta Pro — acompanhamentos personalizáveis (cod-0033). Comandos finos
  // sobre a I/O do cod-0031 e a lógica pura do cod-0030/0033. SEM gate Pro aqui:
  // ligar/desligar o Pro é passo humano (firewall). /acompanhamentos e /parar
  // ficam sempre acessíveis (decisão 07-10: quem caiu do plano pago precisa ver
  // e parar o que configurou). Comandos com argumento casam por palavras[0]
  // (não por ehComando, que casaria a palavra em qualquer posição da mensagem).
  if (ehComando('/acompanhamentos', 'acompanhamentos', '/meusalertas', 'meusalertas')) {
    await mostrarAcompanhamentos(phone);
    return;
  }

  if (palavras[0] === '/acompanhar' || palavras[0] === 'acompanhar') {
    await criarAcompanhamento(phone, palavras.slice(1).join(' '));
    return;
  }

  if (palavras[0] === '/parar' || palavras[0] === 'parar') {
    await pararAcompanhamento(phone, palavras.slice(1).join(' '));
    return;
  }

  // /teto <alvo> <valor> — configura o alerta proativo de limite (cod-0035).
  // Nome escolhido pra NÃO colidir com o /limite atual (status de cupons), que
  // segue significando "quantos cupons ainda tenho".
  if (palavras[0] === '/teto' || palavras[0] === 'teto') {
    await definirTeto(phone, palavras.slice(1).join(' '));
    return;
  }

  if (palavras[0] === '/superfluo' || palavras[0] === 'superfluo'
      || palavras[0] === '/supérfluo' || palavras[0] === 'supérfluo') {
    await configurarSuperfluo(phone, palavras.slice(1).join(' '));
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
    // Agente de Perguntas (cod-0017): texto livre que não casou nenhum comando
    // vira pergunta sobre os próprios gastos — cota → classificar → executar →
    // narrar com firewall de fidelidade (Desenho_Tecnico_Agente_Perguntas §2).
    // O agente responde com honestidade em qualquer falha (fora de escopo /
    // erro técnico), então substitui o antigo "Não consegui entender".
    await responderPergunta(phone, texto);
  }
}

// ---------------------------------------------------------------
// Processa imagens de cupons fiscais — fluxo principal.
// Entry-point fino: baixa por URL com baixarImagem e entrega ao núcleo
// compartilhado (processarReciboRecebido). Comportamento inalterado.
// ---------------------------------------------------------------
async function processarImagem(phone, imageUrl) {
  return processarReciboRecebido(phone, () => baixarImagem(imageUrl));
}

// ---------------------------------------------------------------
// Processa DOCUMENTO (foto/PDF enviado como arquivo) — Frente 1 (cod-0061).
// Faz o gate de MIME (só foto/PDF) e, sendo aceito, roteia pelo MESMO pipeline
// do cupom por imagem — fechando o gap do "reenviar como arquivo"
// (montarMensagemEnviarComoArquivo). A classificação por tipo de comprovante e a
// persistência de novos tipos são cod-0062; aqui é só a plumbing.
// ---------------------------------------------------------------
async function processarDocumento(phone, documentUrl, mimeType) {
  if (!mimeAceitavel(mimeType)) {
    log('documento_mime_recusado', { phone: maskPhone(phone), mime: mimeType || '(vazio)' });
    try {
      await enviarMensagem(phone, montarMensagemDocumentoNaoSuportado());
    } catch (_) { /* já logado em zapi_erro */ }
    return;
  }
  return processarReciboRecebido(phone, () => baixarDocumento(documentUrl));
}

// ---------------------------------------------------------------
// Núcleo compartilhado imagem/documento: recebe o phone e uma função que baixa
// o buffer (baixarImagem OU baixarDocumento). A partir do buffer tudo é igual:
// gate de onboarding/limite, leitura no Gemini, gravação e resposta. Extraído
// de processarImagem (cod-0061) sem mudar o comportamento do fluxo de imagem.
// ---------------------------------------------------------------
async function processarReciboRecebido(phone, baixar) {
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
    const buffer = await baixar();
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

    // Alerta proativo de teto (cod-0035): esta compra pode ter feito um alvo
    // acompanhado cruzar o limite do mês. Self-contained — nunca derruba o fluxo.
    await verificarAlertasDeLimite(phone);

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
// F3 — Onde cortar sem doer (/cortar)
// Identifica categorias discricionárias (doces, bebidas) com peso no mês
// e compara com a média histórica do próprio usuário.
// ---------------------------------------------------------------
async function mostrarCortar(phone) {
  try {
    const mesAtual = new Date().toISOString().slice(0, 7);
    let mesAlvo = mesAtual;
    let dadosCat = await buscarGastosPorCategoria(phone, mesAtual);

    if (!dadosCat || dadosCat.length === 0) {
      const mesRecente = await buscarMesMaisRecenteComGastos(phone);
      if (mesRecente && mesRecente !== mesAtual) {
        mesAlvo = mesRecente;
        dadosCat = await buscarGastosPorCategoria(phone, mesRecente);
      }
    }

    let historico = null;
    try {
      historico = await buscarHistoricoCategorias(phone, mesAlvo, 3);
    } catch (_) { /* degradação segura: segue sem histórico */ }

    const analise = analisarOndeCortar(dadosCat || [], historico);
    await enviarMensagem(phone, montarMensagemCortar(analise));
  } catch (err) {
    log('cortar_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui analisar os cortes agora. Tenta de novo em instantes? 🙏');
  }
}

// ---------------------------------------------------------------
// Comparativo entre mercados (/comparar) — cod-0020 + GATE PRO (cod-0073,
// ligado em 2026-08-16; fecha o achado B10 do Checkpoint N2 de 01/08, em que o
// plano pago entregava só "cupons ilimitados").
// Lê a base anônima de preços dos produtos que o usuário compra e mostra onde
// cada um sai mais barato.
//   Free: teaser de COMPARATIVO_AMOSTRAS_FREE itens (default 3) + upsell honesto
//         — e o upsell só aparece quando há mais pra ver (resultado.temMais).
//   Pro (temFeaturesProAtivas = assinante OU janela da recompensa de indicação):
//        até COMPARATIVO_MAX_PRO itens (default 10 — teto por tamanho de mensagem),
//        sem upsell.
// O gate NÃO cobra nada e não decide preço: só escolhe quantos itens mostrar.
// ---------------------------------------------------------------
async function mostrarComparativo(phone, usuario) {
  try {
    const { observacoes, produtosDoUsuario, lojaDoUsuario } = await buscarObservacoesComparativo(phone);
    const ehPro = temFeaturesProAtivas(usuario);
    const maxComparativos = ehPro
      ? (Number(process.env.COMPARATIVO_MAX_PRO) || 10)
      : (Number(process.env.COMPARATIVO_AMOSTRAS_FREE) || 3);
    const resultado = compararPrecosMercado(observacoes, {
      produtosDoUsuario,
      lojaDoUsuario,
      minEconomiaPct: 3,
      maxComparativos,
    });
    await enviarMensagem(phone, montarMensagemComparativo(resultado, { ehPro }));
  } catch (err) {
    log('comparativo_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui montar o comparativo agora. Tenta de novo em instantes? 🙏');
  }
}

// ---------------------------------------------------------------
// Alerta Pro — acompanhamentos personalizáveis (cod-0033).
// Handlers finos: parsing puro (insights.js) + I/O (supabase.js cod-0031) +
// copy (formatter.js). SEM gate Pro — passo humano (firewall).
// A config do alerta proativo (cod-0035) virou o comando */teto* — nome novo
// pra não colidir com o /limite atual, que segue sendo o status de cupons.
// ---------------------------------------------------------------
async function criarAcompanhamento(phone, argumento) {
  const alvo = interpretarAcompanhamento(argumento);
  if (!alvo.ok) {
    await enviarMensagem(phone, montarAcompanharErro(alvo.motivo));
    return;
  }
  try {
    const salvo = await salvarAcompanhamento(phone, {
      tipo_alvo: alvo.tipo_alvo,
      alvo: alvo.alvo,
      rotulo: alvo.rotulo,
    });
    if (!salvo) {
      await enviarMensagem(phone, montarAcompanharErro('falha'));
      return;
    }
    await enviarMensagem(phone, montarAcompanharConfirmado(alvo));
  } catch (err) {
    log('acompanhar_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, montarAcompanharErro('falha'));
  }
}

async function pararAcompanhamento(phone, argumento) {
  const alvo = interpretarAcompanhamento(argumento);
  if (!alvo.ok) {
    // Sem argumento vira instrução; termo curto reaproveita o texto de erro.
    const motivo = alvo.motivo === 'vazio' ? 'parar_sem_alvo' : alvo.motivo;
    await enviarMensagem(phone, montarAcompanharErro(motivo));
    return;
  }
  try {
    const ok = await desativarAcompanhamento(phone, alvo.alvo);
    await enviarMensagem(phone, montarAcompanharParado(alvo.rotulo, ok));
  } catch (err) {
    log('parar_acompanhamento_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, montarAcompanharParado(alvo.rotulo, false));
  }
}

// /teto <termo|categoria> <valor> — define o teto mensal do alvo (cod-0035).
// Se o alvo ainda não era acompanhado, o /teto também passa a acompanhá-lo
// (zero atrito: um comando só em vez de dois).
async function definirTeto(phone, argumento) {
  const alvo = interpretarTeto(argumento);
  if (!alvo.ok) {
    await enviarMensagem(phone, montarTetoErro(alvo.motivo, alvo.valor));
    return;
  }
  try {
    const salvo = await definirLimiteAcompanhamento(phone, {
      tipo_alvo: alvo.tipo_alvo,
      alvo: alvo.alvo,
      rotulo: alvo.rotulo,
      limite_mensal: alvo.limite,
    });
    if (!salvo) {
      await enviarMensagem(phone, montarTetoErro('falha'));
      return;
    }
    await enviarMensagem(phone, montarTetoConfirmado(alvo));
  } catch (err) {
    log('teto_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, montarTetoErro('falha'));
  }
}

// Alerta proativo de limite (cod-0035) — roda depois de cada cupom salvo.
// Self-contained: NUNCA lança (o cupom já foi salvo e respondido; um erro aqui
// não pode virar "erro ao processar imagem" pro usuário).
//
// Ordem enviar → marcar de propósito: se a marcação falhar, o pior caso é
// repetir o aviso na próxima compra; se marcasse antes e o envio falhasse, o
// usuário ficaria sem o aviso no mês inteiro — silêncio é o pior dos dois.
async function verificarAlertasDeLimite(phone) {
  try {
    const acompanhamentos = await buscarAcompanhamentos(phone);
    if (!acompanhamentos.some((a) => Number(a.limite_mensal) > 0)) return;

    const mesAtual = new Date().toISOString().slice(0, 7);
    const itens = await buscarItensDoMes(phone, mesAtual);
    if (itens === null) return; // leitura falhou: não alerta com número chutado

    const alertas = verificarTetosEstourados(acompanhamentos, itens, mesAtual);
    if (alertas.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await enviarMensagem(phone, montarAlertaLimite(alertas));
    log('alerta_limite_enviado', { phone: maskPhone(phone), alvos: alertas.length });

    for (const a of alertas) {
      await marcarAlertaLimiteEnviado(phone, a.id, mesAtual);
    }
  } catch (err) {
    log('alerta_limite_erro', { phone: maskPhone(phone), erro: err.message });
  }
}

async function mostrarAcompanhamentos(phone) {
  try {
    const lista = await buscarAcompanhamentos(phone);
    if (!lista || lista.length === 0) {
      await enviarMensagem(phone, montarListaAcompanhamentos([]));
      return;
    }

    // Enriquece cada acompanhamento com o gasto do mês (buscarGastoPorAlvo sobre
    // os itens do mês). buscarItensDoMes: null = leitura falhou (não fingir R$ 0),
    // [] = mês sem compras. A soma nasce do dado real, nunca chutada.
    const mesAtual = new Date().toISOString().slice(0, 7);
    const itens = await buscarItensDoMes(phone, mesAtual);
    const leituraFalhou = itens === null;

    const enriquecida = lista.map((a) => {
      const rotulo = a.rotulo || a.alvo;
      if (leituraFalhou) return { rotulo, total: 0, temDados: false };
      const { total } = buscarGastoPorAlvo(itens, { tipo: a.tipo_alvo, valor: a.alvo });
      return { rotulo, total, temDados: true };
    });

    await enviarMensagem(phone, montarListaAcompanhamentos(enriquecida, mesAtual));
  } catch (err) {
    log('acompanhamentos_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui buscar seus acompanhamentos agora. Tenta de novo em instantes? 🙏');
  }
}

async function configurarSuperfluo(phone, argumento) {
  try {
    const atuais = await buscarCategoriasSuperfluas(phone);
    const r = interpretarSuperfluo(argumento, atuais);
    if (!r.ok) {
      await enviarMensagem(phone, montarSuperfluoInvalido(r.categoria));
      return;
    }
    if (r.acao === 'listar') {
      await enviarMensagem(phone, montarSuperfluoConfig(r.categorias));
      return;
    }
    const ok = await setCategoriasSuperfluas(phone, r.categorias);
    await enviarMensagem(phone, montarSuperfluoConfirmado(r, r.categorias, ok));
  } catch (err) {
    log('superfluo_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui ajustar suas categorias de supérfluo agora. Tenta de novo em instantes? 🙏');
  }
}

// ---------------------------------------------------------------
// /apagar — exclusão total dos dados do usuário (LGPD, direito de eliminação).
// Em 2 passos: 1º pedido pede confirmação; só "/apagar confirmar" apaga.
// Funciona em qualquer etapa (ver chamada antes do gate de onboarding).
// ---------------------------------------------------------------
async function mostrarApagar(phone, confirmar) {
  if (!confirmar) {
    await enviarMensagem(phone, montarConfirmacaoApagar());
    return;
  }
  try {
    await apagarDadosUsuario(phone);
    await enviarMensagem(phone, montarApagarConcluido());
  } catch (err) {
    log('apagar_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, montarApagarErro());
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
// [REMOVIDO 2026-07-26] Assinaturas via Mercado Pago — código aposentado.
// O MP foi abandonado na saída fiscal; a cobrança volta pelos dois trilhos
// (Stripe direto + Hotmart/afiliados) quando a empresa BC abrir (out/2026),
// convergindo no /admin/ativar-pro (que continua ativo). /pix segue de pé.
// ---------------------------------------------------------------
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

  // cod-0032 — bloco de supérfluo (baseline doces+bebidas quando o usuário não
  // configurou nada; buscarCategoriasSuperfluas devolve null em erro e a análise
  // cai no baseline sozinha). Degradação segura: falhou → bloco simplesmente some.
  // Só calcula porque aqui dadosCat JÁ tem gastos (o vazio retornou lá em cima) —
  // assim o "bom sinal" nunca aparece pra mês sem compra.
  let superfluo = null;
  try {
    const categoriasSup = await buscarCategoriasSuperfluas(phone);
    superfluo = buscarGastoSuperfluo(dadosCat, categoriasSup);
  } catch (err) {
    log('gastos_superfluo_erro', { phone: maskPhone(phone), erro: err.message });
  }

  // Sempre envia o texto com os valores detalhados (+ conclusão quando houver)
  await enviarMensagem(phone, montarMensagemGastos(dadosCat, mesAlvo, analise, superfluo));
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
// Sobe o servidor — só quando executado diretamente (node src/index.js).
// Quando requerido como módulo (testes — cod-0052), não abre porta, não
// inicia scheduler e não roda a guarda de schema. `npm start` não muda.
// ---------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Bot Economizei rodando na porta ${PORT}`);
    iniciarScheduler();

    // Guarda de schema (cod-0050): checagem NÃO-bloqueante — se faltar coluna/
    // tabela crítica (lição do incidente A9), loga alerta gritante e, se houver
    // ADMIN_PHONE, manda 1 aviso. Nunca derruba nem atrasa o boot.
    verificarSchemaCritico({
      avisar: process.env.ADMIN_PHONE
        ? (faltando) =>
            enviarMensagem(
              process.env.ADMIN_PHONE,
              `⚠️ Guarda de schema: faltando no banco → ${faltando.join(', ')}.\nRode a migration correspondente em supabase/ (logs: schema_guard_faltando).`
            )
        : null,
    }).catch((e) => log('schema_guard_erro', { etapa: 'boot', erro: e && e.message ? e.message : String(e) }));
  });
}

// Exports test-only (cod-0052/cod-0061): dedup por messageId (lei 5), validação
// pura do payload do webhook e o gate de MIME de documento. Nenhum outro módulo
// de produção importa daqui.
module.exports = {
  despacharComDedup,
  validarPayloadWebhook,
  mimeAceitavel,
  autenticarWebhook,
  // cod-0025: quais comandos escapam do gate de onboarding (função pura)
  comandoLiberadoNoOnboarding,
  COMANDOS_LIBERADOS_NO_ONBOARDING,
};
// fim do arquivo
