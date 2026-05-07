const axios = require('axios');

async function enviarMensagem(phone, texto) {
  const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

  console.log('[ZAPI DEBUG] URL:', url);
  console.log('[ZAPI DEBUG] Phone:', phone);
  console.log('[ZAPI DEBUG] INSTANCE_ID:', process.env.ZAPI_INSTANCE_ID);
  console.log('[ZAPI DEBUG] TOKEN:', process.env.ZAPI_TOKEN?.slice(0, 8) + '...');
  console.log('[ZAPI DEBUG] CLIENT_TOKEN:', process.env.ZAPI_CLIENT_TOKEN?.slice(0, 8) + '...');

  await axios.post(
    url,
    { phone: phone, message: texto },
    { headers: { 'Client-Token': process.env.ZAPI_CLIENT_TOKEN } }
  );
}

async function baixarImagem(mediaUrl) {
  const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

module.exports = { enviarMensagem, baixarImagem };
