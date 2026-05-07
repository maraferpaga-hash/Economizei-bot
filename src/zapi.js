const axios = require('axios');

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const TOKEN = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

const BASE_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}`;

// Cabeçalho obrigatório para autenticação na Z-API
const headers = {
  'Client-Token': CLIENT_TOKEN,
  'Content-Type': 'application/json',
};

/**
 * Envia uma mensagem de texto para um número via Z-API.
 * @param {string} phoneNumber - Número no formato internacional (ex: 5511999999999)
 * @param {string} texto - Conteúdo da mensagem
 */
async function enviarMensagem(phoneNumber, texto) {
  const url = `${BASE_URL}/send-text`;

  const response = await axios.post(
    url,
    { phone: phoneNumber, message: texto },
    { headers }
  );

  return response.data;
}

/**
 * Baixa uma imagem a partir de uma URL e retorna o buffer binário.
 * @param {string} mediaUrl - URL da imagem enviada pelo usuário
 * @returns {Buffer}
 */
async function baixarImagem(mediaUrl) {
  const response = await axios.get(mediaUrl, {
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data);
}

module.exports = { enviarMensagem, baixarImagem };
