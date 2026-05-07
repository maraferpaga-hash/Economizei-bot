require('dotenv').config();

const express = require('express');
const { enviarMensagem, baixarImagem } = require('./zapi');
const { lerRecibo } = require('./gemini');
const {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
} = require('./supabase');
const {
  montarResposta,
  montarMensagemErro,
  montarMensagemBemVindo,
  montarMensagemLimite,
  montarMensagemAlerta,
} = require('./formatter');
const { verificarAlerta } = require('./alerts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------------------------------------------------------------
// POST /webhook — ponto de entrada de todos os eventos do Z-API
// ---------------------------------------------------------------
app.post('/webhook', (req, res) => {
  // Responde 200 imediatamente para o Z-API não reenviar o evento
  res.sendStatus(200);

  const body = req.body;
  const phone = body.phone;

  if (!phone) return;

  if (body.text) {
    processarTexto(phone, body.text.message).catch((err) =>
      console.error('[webhook] processarTexto:', err.message)
    );
  } else if (body.image) {
    processarImagem(phone, body.image.imageUrl).catch((err) =>
      console.error('[webhook] processarImagem:', err.message)
    );
  }
  // Qualquer outro tipo de evento é ignorado silenciosamente
});

// ---------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ---------------------------------------------------------------
// Processa mensagens de texto (comandos)
// ---------------------------------------------------------------
async function processarTexto(phone, texto) {
  const msg = (texto || '').toLowerCase();

  if (msg.includes('historico') || msg.includes('/historico')) {
    await mostrarHistorico(phone);
  } else if (
    msg.includes('oi') ||
    msg.includes('ola') ||
    msg.includes('olá') ||
    msg.includes('ajuda') ||
    msg.includes('/ajuda') ||
    msg.includes('start')
  ) {
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
    await upsertUsuario(phone);

    const limiteAtingido = await verificarLimiteGratuito(phone);
    if (limiteAtingido) {
      await enviarMensagem(phone, montarMensagemLimite());
      return;
    }

    const buffer = await baixarImagem(imageUrl);
    const dados = await lerRecibo(buffer);

    if (!dados.sucesso) {
      await enviarMensagem(phone, montarMensagemErro(dados.motivo));
      return;
    }

    await salvarCompra(phone, {
      loja: dados.loja,
      total: dados.total,
      data_compra: dados.data_compra,
      itens: dados.itens,
    });

    const historico = await buscarHistorico(phone, 1);
    const media = await calcularMedia(phone);

    const resposta = montarResposta(dados, {
      totalMes: historico.totalMes,
      qtdComprasMes: historico.compras.length,
    });
    await enviarMensagem(phone, resposta);

    const alerta = verificarAlerta(dados.total, media);
    if (alerta) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await enviarMensagem(phone, montarMensagemAlerta(alerta.percentual, alerta.media));
    }

    console.log(JSON.stringify({
      evento: 'compra_registrada',
      phone: phone.slice(0, 6) + '****',
      loja: dados.loja,
      total: dados.total,
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[processarImagem] erro:', err.message);
    await enviarMensagem(phone, '❌ Algo deu errado. Tenta de novo em instantes!');
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
});
