require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { lerRecibo } = require('./gemini');

async function main() {
  const imagePath = path.join(__dirname, '..', 'teste.jpg');
  const imageBuffer = fs.readFileSync(imagePath);

  console.log('Enviando imagem para o Gemini...\n');

  const resultado = await lerRecibo(imageBuffer);

  console.log(JSON.stringify(resultado, null, 2));
  console.log('');

  if (resultado.sucesso) {
    console.log('✅ FUNCIONOU');
  } else {
    console.log('❌ FALHOU: ' + resultado.motivo);
  }
}

main();
