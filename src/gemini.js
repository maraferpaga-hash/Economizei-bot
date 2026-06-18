const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const { log } = require('./logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CATEGORIAS_VALIDAS = [
  'carnes','hortifruti','laticinios','padaria',
  'bebidas','limpeza','mercearia','congelados','doces','outros',
];

const PROMPT = `Você é um extrator de dados de cupons fiscais brasileiros.
Analise a imagem e retorne SOMENTE um JSON válido, sem markdown, sem texto adicional.

Se for um cupom fiscal legível — de SUPERMERCADO ou de QUALQUER outro
estabelecimento (farmácia, posto, restaurante, loja, padaria de rua, etc.):
{
  "sucesso": true,
  "tipo": "mercado",   // "mercado" para supermercado/atacadão/mercearia; "outros" para qualquer outro estabelecimento (farmácia, posto, restaurante, loja, etc.)
  "loja": "nome do estabelecimento",
  "cnpj": "XX.XXX.XXX/XXXX-XX ou null",
  "data_compra": "YYYY-MM-DD",
  "total": 99.90,
  "itens": [
    {
      "nome": "nome exato como aparece no cupom",
      "nome_canonico": "nome simplificado e normalizado em letras minúsculas (ex: 'leite integral 1l', 'arroz tipo 1 5kg', 'frango peito 1kg', 'sabao em po 1kg')",
      "categoria": "uma de: carnes | hortifruti | laticinios | padaria | bebidas | limpeza | mercearia | congelados | doces | outros",
      "quantidade": 1,
      "preco_unitario": 9.90,
      "preco_total": 9.90
    }
  ]
}

Guia de categorias (para itens de mercado):
- carnes: carnes bovinas, suínas, frango, peixe, linguiça, salsicha, presunto
- hortifruti: frutas, legumes, verduras, ervas frescas
- laticinios: leite, queijo, iogurte, manteiga, creme de leite, ovos
- padaria: pão, bolo, biscoito, macarrão, farinha
- bebidas: água, suco, refrigerante, cerveja, vinho, café, achocolatado
- limpeza: detergente, sabão, desinfetante, papel higiênico, esponja, amaciante
- mercearia: arroz, feijão, óleo, açúcar, sal, conservas, temperos, enlatados, molhos
- congelados: sorvete, pizza congelada, lasanha, hambúrguer congelado
- doces: chocolate, bala, pirulito, biscoito recheado, salgadinho
- outros: qualquer produto que não se enquadre nas categorias acima

Regra do campo "tipo": use "outros" sempre que o estabelecimento NÃO for um
supermercado/atacadão/mercearia (ex.: farmácia, drogaria, posto de combustível,
restaurante, lanchonete, loja de roupa, pet shop). Mesmo assim, EXTRAIA loja,
total e itens normalmente — o produto registra esses gastos também.

Se NÃO conseguir extrair (problema de leitura, não de tipo de loja):
{
  "sucesso": false,
  "categoria_erro": "<uma das opções abaixo>",
  "motivo": "explica o problema em 1 frase simples"
}

Opções de categoria_erro (escolha A MAIS adequada):
- "borrado" — imagem desfocada, escura, com reflexo, ou parcialmente ilegível
- "sem_itens" — consegue ler total mas não os itens (use só se total estiver legível)
- "muito_longo" — cupom cortado, não é possível ver o final/total
- "nao_e_cupom" — a imagem não é cupom fiscal (foto de pessoa, paisagem, outro documento)
- "outro" — qualquer outro caso

Importante:
- NÃO use sucesso=false só porque a loja não é supermercado — nesse caso use sucesso=true com tipo="outros".
- Se conseguir ler o total mesmo que sem itens, prefira retornar sucesso=true com itens=[] em vez de falhar.`;

// Detecta mimeType pelo magic number do buffer (primeiros bytes)
function detectarMimeType(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp'; // RIFF
  return 'image/jpeg'; // fallback seguro
}

// Remove markdown fence (```json ... ```) caso o Gemini retorne envelopado
function limparMarkdownFence(texto) {
  return texto
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
}

// Coerce: aceita "99,90" ou "99.90" ou 99.9 e retorna number (ou NaN se impossível)
function coerceNumber(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') {
    const limpo = valor.replace(/[^0-9,.-]/g, '').replace(',', '.');
    const n = Number(limpo);
    return isNaN(n) ? NaN : n;
  }
  return NaN;
}

// ---------------------------------------------------------------
// Reconciliação item × total — detecta extração incompleta.
// Tolerância: maior entre R$ 2,00 e 15% do total declarado.
// confere = null quando não há itens para conferir (cupom só com total).
// ---------------------------------------------------------------
function reconciliarItens(total, itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    return { somaItens: 0, total, diferenca: total, divergencia_pct: null, confere: null };
  }
  const somaItens = itens.reduce((acc, i) => {
    const v = coerceNumber(i.preco_total ?? i.preco_unitario);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);
  const diferenca = Math.round((total - somaItens) * 100) / 100;
  const tolerancia = Math.max(2, total * 0.15);
  const divergencia_pct = total > 0 ? Math.round((Math.abs(diferenca) / total) * 100) : 100;
  return {
    somaItens: Math.round(somaItens * 100) / 100,
    total,
    diferenca,
    divergencia_pct,
    confere: Math.abs(diferenca) <= tolerancia,
  };
}

function inferirCategoria(motivo) {
  if (typeof motivo !== 'string') return 'outro';
  const m = motivo.toLowerCase();
  if (m.includes('borrad') || m.includes('escur') || m.includes('legíve') || m.includes('legive')) return 'borrado';
  if (m.includes('farmác') || m.includes('farmac') || m.includes('restaurante') || m.includes('posto')) return 'nao_supermercado';
  if (m.includes('item') || m.includes('itens')) return 'sem_itens';
  if (m.includes('cortad') || m.includes('long') || m.includes('parcial')) return 'muito_longo';
  if (m.includes('não é cupom') || m.includes('nao é cupom') || m.includes('não parece')) return 'nao_e_cupom';
  return 'outro';
}

// ---------------------------------------------------------------
// Quality check de nome_canonico
// Retorna: 'ok' | 'ausente' | 'igual_ao_nome' | 'muito_longo' | 'muito_curto' | 'pouco_simplificado'
// ---------------------------------------------------------------
function avaliarQualidadeCanonicoItem(item) {
  const { nome, nome_canonico } = item;

  if (!nome_canonico || nome_canonico.trim().length === 0) return 'ausente';

  const nomeNorm  = nome.toLowerCase().replace(/[^a-záéíóúãõç\s0-9]/gi, '').trim();
  const canonico  = nome_canonico.trim();

  if (canonico.length > 60) return 'muito_longo';
  if (canonico.length < 3)  return 'muito_curto';

  // Gemini não simplificou nada — nome original apenas lowercaseado
  if (canonico === nomeNorm) return 'igual_ao_nome';

  // Pouca simplificação: só sinaliza quando o nome ORIGINAL é longo (>25 chars,
  // logo tinha espaço real pra encurtar) E o canônico quase não reduziu (>=95%).
  // Critério afrouxado em 2026-06-08: o limiar antigo (>15 chars e >80%) dava
  // falso positivo em nomes de cupom que já vêm muito abreviados — virava ruído
  // de log sem problema real. Não afeta dado nenhum (o canônico é gravado igual).
  if (nomeNorm.length > 25 && canonico.length >= nomeNorm.length * 0.95) return 'pouco_simplificado';

  return 'ok';
}

// Valida e normaliza o JSON do Gemini. Retorna { sucesso: false, motivo } se schema inválido.
function validarSchema(dados) {
  if (typeof dados.sucesso !== 'boolean') {
    return { sucesso: false, motivo: 'Resposta sem campo sucesso' };
  }

  if (dados.sucesso === false) {
    return {
      sucesso: false,
      categoria_erro: typeof dados.categoria_erro === 'string'
        ? dados.categoria_erro
        : inferirCategoria(dados.motivo),
      motivo: typeof dados.motivo === 'string' && dados.motivo.length > 0
        ? dados.motivo
        : 'Cupom ilegível',
    };
  }

  // sucesso === true: precisa ter total válido
  const total = coerceNumber(dados.total);
  if (isNaN(total) || total <= 0) {
    return { sucesso: false, motivo: 'Não consegui ler o valor total do cupom' };
  }

  const loja = (typeof dados.loja === 'string' && dados.loja.trim().length > 0)
    ? dados.loja.trim()
    : 'Mercado';

  const data_compra = (typeof dados.data_compra === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dados.data_compra))
    ? dados.data_compra
    : new Date().toISOString().slice(0, 10);

  // tipo do estabelecimento: "mercado" (default) ou "outros" (não-mercado).
  // Decisão 2026-06-04: cupom não-mercado é lido e salvo, não rejeitado.
  const tipo = dados.tipo === 'outros' ? 'outros' : 'mercado';

  const itens = Array.isArray(dados.itens)
    ? dados.itens
        .filter((i) => i && typeof i.nome === 'string')
        .map((i) => ({
          nome: i.nome.trim(),
          nome_canonico: typeof i.nome_canonico === 'string' && i.nome_canonico.trim().length > 0
            ? i.nome_canonico.trim().toLowerCase()
            : null,
          // Não-mercado: todos os itens entram como 'nao_mercado' para virarem
          // uma única fatia "Outros (não-mercado)" no gráfico de /gastos.
          categoria: tipo === 'outros'
            ? 'nao_mercado'
            : (typeof i.categoria === 'string' && CATEGORIAS_VALIDAS.includes(i.categoria)
                ? i.categoria
                : 'outros'),
          quantidade: coerceNumber(i.quantidade) || 1,
          preco_unitario: coerceNumber(i.preco_unitario),
          preco_total: coerceNumber(i.preco_total ?? i.preco_unitario),
        }))
    : [];

  // Rastreia qualidade dos canonicos em tempo real — sem bloquear o fluxo
  if (itens.length > 0) {
    const problemas = itens
      .map(i => ({ nome: i.nome, canonico: i.nome_canonico, qualidade: avaliarQualidadeCanonicoItem(i) }))
      .filter(i => i.qualidade !== 'ok');

    if (problemas.length > 0) {
      log('canonico_suspeito', {
        loja,
        tipo,
        qtd_problemas: problemas.length,
        qtd_total: itens.length,
        taxa_pct: Math.round((problemas.length / itens.length) * 100),
        detalhes: problemas.map(p => ({
          nome:     p.nome.slice(0, 40),
          canonico: p.canonico,
          motivo:   p.qualidade,
        })),
      });
    }
  }

  const reconciliacao = reconciliarItens(total, itens);
  if (reconciliacao.confere === false) {
    log('gemini_reconciliacao_divergente', {
      loja,
      total,
      soma_itens: reconciliacao.somaItens,
      diferenca: reconciliacao.diferenca,
      divergencia_pct: reconciliacao.divergencia_pct,
      qtd_itens: itens.length,
    });
  }

  return {
    sucesso: true,
    tipo,
    loja,
    cnpj: typeof dados.cnpj === 'string' ? dados.cnpj : null,
    data_compra,
    total,
    itens,
    reconciliacao,
  };
}

// Pré-processa a imagem com Sharp para melhorar leitura após compressão do WhatsApp.
// Normaliza contraste + sharpening + converte pra PNG (lossless).
// Falha silenciosa: se Sharp não conseguir, retorna o buffer original.
async function preprocessarImagem(buffer) {
  try {
    return await sharp(buffer)
      .normalise()              // auto-contraste (levanta texto esmaecido)
      .sharpen({ sigma: 1.5 }) // nitidez — ajuda texto fino de cupom
      .png()                    // lossless evita mais compressão
      .toBuffer();
  } catch (err) {
    log('imagem_preprocessar_erro', { erro: err.message });
    return null; // sinaliza que falhou; caller usa original
  }
}

async function chamarGemini(model, buffer, mimeType) {
  const imagePart = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
  const result = await model.generateContent([PROMPT, imagePart]);
  return result.response.text().trim();
}

async function lerRecibo(imageBuffer) {
  // Valida buffer antes de qualquer coisa
  if (!imageBuffer || imageBuffer.length < 1000) {
    log('gemini_buffer_invalido', { tamanho: imageBuffer?.length ?? 0 });
    return { sucesso: false, categoria_erro: 'borrado', motivo: 'Imagem inválida ou muito pequena' };
  }

  // temperature:0 → extração determinística (mata a variação 38/39/40 do mesmo cupom).
  // responseMimeType JSON → Gemini devolve JSON puro, sem markdown, reduzindo falha de parse.
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
    },
  });

  // Pré-processa — se Sharp falhar, bufferProcessado = null e pulamos pro original
  const bufferProcessado = await preprocessarImagem(imageBuffer);

  // Tentativas: [1] imagem processada (PNG), [2] imagem original (formato detectado)
  const tentativas = [
    ...(bufferProcessado ? [{ buffer: bufferProcessado, mimeType: 'image/png', label: 'processada' }] : []),
    { buffer: imageBuffer, mimeType: detectarMimeType(imageBuffer), label: 'original' },
  ];

  let ultimoResultado = null;
  let melhorSucesso = null;

  for (const tentativa of tentativas) {
    try {
      const textoBruto = await chamarGemini(model, tentativa.buffer, tentativa.mimeType);
      const texto = limparMarkdownFence(textoBruto);

      log('gemini_resposta_bruta', {
        tentativa: tentativa.label,
        tamanho_chars: texto.length,
        inicio: texto.slice(0, 120),
      });

      let dados;
      try {
        dados = JSON.parse(texto);
      } catch {
        log('gemini_json_invalido', { tentativa: tentativa.label, texto: texto.slice(0, 300) });
        ultimoResultado = { sucesso: false, categoria_erro: 'outro', motivo: 'Erro interno ao ler imagem' };
        continue; // tenta com o buffer seguinte
      }

      const resultado = validarSchema(dados);
      ultimoResultado = resultado;

      if (resultado.sucesso) {
        // Guarda o melhor sucesso por reconciliação (soma dos itens × total).
        if (!melhorSucesso || _scoreReconciliacao(resultado) > _scoreReconciliacao(melhorSucesso)) {
          melhorSucesso = resultado;
        }
        // Se os itens fecham com o total, é o resultado ideal — retorna já.
        if (resultado.reconciliacao?.confere === true) return resultado;
        // Itens não fecham (ou cupom sem itens): tenta a próxima imagem buscando
        // uma extração melhor; no fim retorna o melhor candidato visto.
        log('gemini_buscando_extracao_melhor', {
          tentativa: tentativa.label,
          divergencia_pct: resultado.reconciliacao?.divergencia_pct ?? null,
        });
        continue;
      }

      // Erro não relacionado a qualidade de imagem → retorna já
      if (resultado.categoria_erro !== 'borrado') return resultado;

      // borrado → tenta próxima versão da imagem (se houver)
      log('gemini_tentando_novamente', { tentativa: tentativa.label, motivo: resultado.motivo });

    } catch (err) {
      log('gemini_erro', { tentativa: tentativa.label, erro: err.message });
      ultimoResultado = { sucesso: false, categoria_erro: 'outro', motivo: 'Erro ao ler imagem' };
      // aguarda 1s antes de tentar novamente
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Prioriza o melhor sucesso (mesmo que não reconcilie) sobre erros.
  return melhorSucesso ?? ultimoResultado ?? { sucesso: false, categoria_erro: 'borrado', motivo: 'Imagem ilegível' };
}

// Score de reconciliação para escolher entre tentativas:
// itens que fecham com o total (100) > itens divergentes (quanto menor a
// divergência, melhor) > cupom sem itens (0).
function _scoreReconciliacao(resultado) {
  const rc = resultado.reconciliacao;
  if (!rc || rc.confere === null) return 0;
  if (rc.confere === true) return 100;
  return Math.max(0, 100 - Math.min(100, rc.divergencia_pct ?? 100));
}

module.exports = { lerRecibo, avaliarQualidadeCanonicoItem };
