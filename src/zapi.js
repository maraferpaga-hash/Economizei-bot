// Cliente Z-API — HTTP via fetch nativo (Node >= 22). Sem dependência de axios:
// fetch nativo já cobre POST/GET com timeout (AbortSignal.timeout). Mesma escolha
// do mercadopago.js — um único cliente HTTP no projeto (decisão 2026-06-08).
const { log } = require('./logger');

function _url(acao) {
  return `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/${acao}`;
}

// fetch não lança em status != 2xx (ao contrário do axios) — checamos resp.ok
// explicitamente. E não tem opção `timeout` — usamos AbortSignal.timeout.
async function enviarMensagem(phone, texto) {
  const url = _url('send-text');
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
      },
      body: JSON.stringify({ phone, message: texto }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    log('zapi_erro', { url, erro: err.message });
    throw new Error('Falha ao enviar mensagem WhatsApp');
  }

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    log('zapi_erro', { status: resp.status, url, data });
    throw new Error('Falha ao enviar mensagem WhatsApp');
  }

  log('zapi_enviou', { status: resp.status });
  return data;
}

async function baixarImagem(mediaUrl) {
  const MAX_TENTATIVAS = 2;
  let ultimoErro;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(mediaUrl, { signal: AbortSignal.timeout(15_000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const buffer = Buffer.from(await resp.arrayBuffer());

      if (buffer.length < 1000) {
        throw new Error(`Buffer muito pequeno (${buffer.length} bytes) — imagem provavelmente corrompida`);
      }

      log('zapi_download_ok', { tentativa, tamanho_kb: Math.round(buffer.length / 1024) });
      return buffer;
    } catch (err) {
      ultimoErro = err;
      log('zapi_download_tentativa', { tentativa, erro: err.message });
      if (tentativa < MAX_TENTATIVAS) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  log('zapi_download_erro', { url: mediaUrl, erro: ultimoErro.message });
  throw new Error('Falha ao baixar imagem do Z-API');
}

/**
 * Verifica se a instância Z-API está conectada ao WhatsApp.
 * Retorna { conectado: boolean, dados?, erro? }
 */
async function verificarConexao() {
  const url = _url('status');
  try {
    const resp = await fetch(url, {
      headers: { 'Client-Token': process.env.ZAPI_CLIENT_TOKEN },
      signal: AbortSignal.timeout(10_000),
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      log('zapi_status_erro', { status: resp.status });
      return { conectado: false, erro: `HTTP ${resp.status}` };
    }
    const conectado = data?.connected === true;
    log('zapi_status_check', { conectado, status_raw: data?.value });
    return { conectado, dados: data };
  } catch (err) {
    log('zapi_status_erro', { erro: err.message });
    return { conectado: false, erro: err.message };
  }
}

async function enviarImagem(phone, imageUrl, caption = '') {
  const url = _url('send-image');
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
      },
      body: JSON.stringify({ phone, image: imageUrl, caption }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    log('zapi_imagem_erro', { url, erro: err.message });
    throw new Error('Falha ao enviar imagem WhatsApp');
  }

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    log('zapi_imagem_erro', { status: resp.status, data });
    throw new Error('Falha ao enviar imagem WhatsApp');
  }

  log('zapi_imagem_enviada', { status: resp.status });
  return data;
}

module.exports = { enviarMensagem, baixarImagem, verificarConexao, enviarImagem };
