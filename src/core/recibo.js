'use strict';

// ---------------------------------------------------------------
// src/core/recibo.js — NÚCLEO CANAL-AGNÓSTICO do recebimento de recibo (cod-0071).
//
// Por que existe: até aqui, todo o fluxo de "chegou um cupom" morava dentro do
// manipulador do webhook do WhatsApp (src/index.js). Com o app decidido como 2º
// canal (2026-08-05), a mesma regra teria de ser escrita duas vezes — e as duas
// divergiriam. Este módulo tira a regra de dentro do canal.
//
// Contrato: recebe `(phone, baixar)` — onde `baixar()` devolve o Buffer do
// arquivo, venha ele do Z-API ou de um upload HTTP — e devolve um resultado
// ESTRUTURADO: uma lista ordenada de AÇÕES que o adaptador do canal executa.
// O núcleo não sabe que existe WhatsApp, não importa `zapi.js` e NÃO FORMATA
// mensagem: quem formata continua sendo o `formatter.js`, no adaptador.
//
// Regra de ouro deste refactor: ZERO mudança de comportamento. A ordem das ações,
// os delays entre elas e os logs (que viajam junto de cada ação, para serem
// emitidos exatamente na mesma posição de antes) reproduzem o fluxo original
// linha a linha. Erro NÃO é capturado aqui de propósito — o adaptador mantém o
// mesmo try/catch de antes, para que uma falha de envio continue caindo na
// mesma mensagem de erro interno.
//
// Vocabulário das ações (`tipo`):
//   onboarding            → rodar o passo de onboarding (o canal envia as mensagens)
//   limite                → avisar que o limite gratuito do mês foi atingido
//   erro_leitura          → a leitura falhou; `motivo`/`categoriaErro` explicam
//   enviar_como_arquivo   → dica de reenviar como documento (só quando 'borrado')
//   resposta              → a confirmação do cupom lido (dados + números do mês)
//   aviso_sucesso_parcial → leu o total mas não os itens
//   alerta                → compra fora do padrão histórico
//   pos_compra            → ganchos self-contained pós-registro (teto + indicação)
//
// Cada ação pode trazer `delayMs` (pausa ANTES de executá-la) e `log`
// (`{ evento, dados }`, emitido imediatamente antes da ação).
// ---------------------------------------------------------------

const { lerRecibo } = require('../gemini');
const {
  upsertUsuario,
  salvarCompra,
  buscarHistorico,
  calcularMedia,
  verificarLimiteGratuito,
} = require('../supabase');
const { avaliarCompra, deveEnviarMensagem } = require('../alerts');
const { log, maskPhone } = require('../logger');

/**
 * Processa um recibo recebido, seja qual for o canal.
 *
 * @param {string} phone número do usuário (identidade única do produto)
 * @param {() => Promise<Buffer>} baixar função que devolve o buffer do arquivo
 * @param {object} [deps] dependências injetáveis (usadas pelos testes)
 * @returns {Promise<{acoes: Array<object>}>} ações em ordem de execução
 */
async function processarRecibo(phone, baixar, deps = {}) {
  const {
    upsertUsuario: _upsertUsuario = upsertUsuario,
    verificarLimiteGratuito: _verificarLimiteGratuito = verificarLimiteGratuito,
    lerRecibo: _lerRecibo = lerRecibo,
    calcularMedia: _calcularMedia = calcularMedia,
    salvarCompra: _salvarCompra = salvarCompra,
    buscarHistorico: _buscarHistorico = buscarHistorico,
    avaliarCompra: _avaliarCompra = avaliarCompra,
    deveEnviarMensagem: _deveEnviarMensagem = deveEnviarMensagem,
    log: _log = log,
  } = deps;

  const acoes = [];

  const usuario = await _upsertUsuario(phone);
  const step = usuario.onboarding_step ?? 0;

  // Step 0: enviar boas-vindas e não processar a imagem ainda
  if (step === 0) {
    acoes.push({ tipo: 'onboarding', step, tipoEntrada: 'imagem', dadosProcessados: null });
    return { acoes };
  }

  const { atingido, cuponsUsados } = await _verificarLimiteGratuito(phone);
  if (atingido) {
    acoes.push({
      tipo: 'limite',
      log: { evento: 'limite_atingido', dados: { phone: maskPhone(phone), cupons_usados: cuponsUsados } },
    });
    return { acoes };
  }

  _log('cupom_iniciando', { phone: maskPhone(phone) });
  const buffer = await baixar();
  const dados = await _lerRecibo(buffer);

  if (!dados.sucesso) {
    acoes.push({
      tipo: 'erro_leitura',
      motivo: dados.motivo,
      categoriaErro: dados.categoria_erro,
      log: {
        evento: 'cupom_erro_leitura',
        dados: { phone: maskPhone(phone), categoria: dados.categoria_erro, motivo: dados.motivo },
      },
    });
    // Borrado mesmo após pré-processamento: orienta a reenviar como documento
    if (dados.categoria_erro === 'borrado') {
      acoes.push({ tipo: 'enviar_como_arquivo', delayMs: 800 });
    }
    return { acoes };
  }

  // Calcula média ANTES de salvar a compra atual — assim o alerta compara
  // com o histórico real e não com uma média já influenciada pela compra de agora.
  const media = await _calcularMedia(phone);

  await _salvarCompra(phone, {
    loja: dados.loja,
    total: dados.total,
    data_compra: dados.data_compra,
    itens: dados.itens,
    cnpj: dados.cnpj,
    tipo: dados.tipo,
  });

  // Após salvar, busca totalMes (já inclui a compra atual) e o contador atualizado do usuário
  const [historico, usuarioAtualizado] = await Promise.all([
    _buscarHistorico(phone, 1),
    _upsertUsuario(phone),
  ]);

  acoes.push({
    tipo: 'resposta',
    dados,
    totalMes: historico.totalMes,
    // Fallback: 0 em vez de historico.compras.length (que é sempre 1 com limit=1)
    qtdComprasMes: usuarioAtualizado.compras_mes_atual ?? 0,
  });

  if (dados.itens.length === 0) {
    acoes.push({
      tipo: 'aviso_sucesso_parcial',
      delayMs: 600,
      log: { evento: 'cupom_sucesso_parcial', dados: { phone: maskPhone(phone), total: dados.total } },
    });
  }

  // Mensagem de onboarding adicional após a resposta normal (steps 1 e 2)
  if (step === 1 || step === 2) {
    acoes.push({
      tipo: 'onboarding',
      step,
      tipoEntrada: 'imagem',
      dadosProcessados: { dados, totalMes: historico.totalMes },
      delayMs: 800,
    });
  }

  // Comparação com a média histórica — só para compras de mercado.
  // Cupom não-mercado (farmácia/posto) não tem padrão de gasto comparável.
  if (dados.tipo !== 'outros') {
    const avaliacao = _avaliarCompra(dados.total, media);
    if (avaliacao && _deveEnviarMensagem(avaliacao.nivel)) {
      acoes.push({
        tipo: 'alerta',
        avaliacao,
        delayMs: 1000,
        log: {
          evento: 'alerta_disparado',
          dados: {
            phone: maskPhone(phone),
            nivel: avaliacao.nivel,
            percentual: Math.round(avaliacao.percentual),
          },
        },
      });
    }
  }

  // Ganchos self-contained pós-registro (alerta proativo de teto + marco de
  // ativação de indicação). Continuam no adaptador porque falam com o canal;
  // o núcleo só diz QUANDO rodam e com qual leitura de usuário.
  acoes.push({
    tipo: 'pos_compra',
    usuario: usuarioAtualizado || usuario,
    log: {
      evento: 'cupom_registrado',
      dados: { phone: maskPhone(phone), loja: dados.loja, total: dados.total },
    },
  });

  return { acoes };
}

module.exports = { processarRecibo };
