const axios = require('axios');
const { log } = require('./logger');

async function enviarMensagem(phone, texto) {
  const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

  try {
    const response = await axios.post(
      url,
      { phone, message: texto },
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
        },
        timeout: 15_000,
      }
    );

    log('zapi_enviou', { status: response.status });
    return response.data;
  } catch (err) {
    log('zapi_erro', {
      status: err.response?.status,
      url: err.config?.url,
      data: err.response?.data,
      erro: err.message,
    });
    throw new Error('Falha ao enviar mensagem WhatsApp');
  }
}

async function baixarImagem(mediaUrl) {
  const MAX_TENTATIVAS = 2;
  let ultimoErro;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 15_000 });
      const buffer = Buffer.from(response.data);

      if (buffer.length < 1000) {
        throw new Error(`Buffer muito pequeno (${buffer.length} bytes) — imagem provavelmente corrompida`);
      }

      log('zapi_download_ok', { tentativa, tamanho_kb: Math.round(buffer.length / 1024) });
      return buffer;
    } catch (err) {
      ultimoErro = err;
      log('zapi_download_tentativa', {
        tentativa,
        status: err.response?.status,
        erro: err.message,
      });
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
 *
 * Documentação Z-API: GET /instances/{id}/token/{token}/status
 * Resposta conectado: { "connected": true, ... }
 */
async function verificarConexao() {
  const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/status`;
  try {
    const response = await axios.get(url, {
      headers: { 'Client-Token': process.env.ZAPI_CLIENT_TOKEN },
      timeout: 10_000,
    });
    // Z-API retorna { connected: true } quando conectado
    const conectado = response.data?.connected === true;
    log('zapi_status_check', { conectado, status_raw: response.data?.value });
    return { conectado, dados: response.data };
  } catch (err) {
    log('zapi_status_erro', { status: err.response?.status, erro: err.message });
    return { conectado: false, erro: err.message };
  }
}

async function enviarImagem(phone, imageUrl, caption = '') {
  const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-image`;

  try {
    const response = await axios.post(
      url,
      { phone, image: imageUrl, caption },
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': process.env.ZAPI_CLIENT_TOKEN,
        },
        timeout: 20_000,
      }
    );
    log('zapi_imagem_enviada', { status: response.status });
    return response.data;
  } catch (err) {
    log('zapi_imagem_erro', {
      status: err.response?.status,
      data: err.response?.data,
      erro: err.message,
    });
    throw new Error('Falha ao enviar imagem WhatsApp');
  }
}

module.exports = { enviarMensagem, baixarImagem, verificarConexao, enviarImagem };
