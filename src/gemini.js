const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPT = `Você é um extrator de dados de cupons fiscais brasileiros.
Analise a imagem e retorne SOMENTE um JSON válido, sem markdown, sem texto adicional.

Se for um cupom fiscal válido:
{
  "sucesso": true,
  "loja": "nome do estabelecimento",
  "cnpj": "XX.XXX.XXX/XXXX-XX ou null",
  "data_compra": "YYYY-MM-DD",
  "total": 99.90,
  "itens": [
    {
      "nome": "nome do produto",
      "quantidade": 1,
      "preco_unitario": 9.90,
      "preco_total": 9.90
    }
  ]
}

Se NÃO for um cupom ou estiver ilegível:
{
  "sucesso": false,
  "motivo": "explica o problema em 1 frase simples"
}`;

async function lerRecibo(imageBuffer) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([PROMPT, imagePart]);
    const texto = result.response.text().trim();

    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      console.error('[gemini] JSON inválido recebido:', texto);
      return { sucesso: false, motivo: 'Erro interno ao ler imagem' };
    }

    if (typeof dados.sucesso !== 'boolean') {
      console.error('[gemini] resposta sem campo "sucesso":', dados);
      return { sucesso: false, motivo: 'Erro interno ao ler imagem' };
    }

    return dados;
  } catch (err) {
    console.error('[gemini] lerRecibo:', err.message);
    return { sucesso: false, motivo: 'Erro interno ao ler imagem' };
  }
}

module.exports = { lerRecibo };
