// ---------------------------------------------------------------
// Avaliação de uma compra contra a média histórica do usuário.
// Substitui o antigo verificarAlerta (que só sinalizava "acima").
//
// Retorna { nivel, percentual, media } ou null se não há média
// (menos de 3 compras de mercado nos últimos 90 dias — ver calcularMedia).
//   nivel: 'abaixo' | 'normal' | 'acima'
//   percentual: variação assinada em % vs. a média (negativo = abaixo)
//   media: a própria média usada na comparação
//
// Limiares configuráveis por env (frações, não %):
//   ALERTA_LIM_ACIMA   (default 0.20)  → acima de +20% = 'acima'
//   ALERTA_LIM_ABAIXO  (default 0.15)  → abaixo de -15% = 'abaixo'
// ---------------------------------------------------------------

function _fracaoEnv(nome, padrao) {
  const v = parseFloat(process.env[nome]);
  return Number.isFinite(v) && v >= 0 ? v : padrao;
}

function avaliarCompra(totalAtual, mediaHistorica) {
  if (mediaHistorica === null || !(mediaHistorica > 0)) return null;

  const limAcima  = _fracaoEnv('ALERTA_LIM_ACIMA', 0.20);
  const limAbaixo = _fracaoEnv('ALERTA_LIM_ABAIXO', 0.15);

  const ratio = totalAtual / mediaHistorica;
  const percentual = (ratio - 1) * 100;

  let nivel;
  if (ratio >= 1 + limAcima)       nivel = 'acima';
  else if (ratio <= 1 - limAbaixo) nivel = 'abaixo';
  else                             nivel = 'normal';

  return { nivel, percentual, media: mediaHistorica };
}

// Decide se um nível gera mensagem ao usuário. Configurável via ALERTA_MODO:
//   'relevante' (default) → manda em 'acima' e 'abaixo'; silencioso em 'normal'
//   'sempre'              → manda nos três níveis
//   'so_acima'            → só em 'acima' (comportamento legado)
// Gabriel escolheu afinar depois — por isso o gatilho vive em env.
function deveEnviarMensagem(nivel) {
  const modo = (process.env.ALERTA_MODO || 'relevante').toLowerCase();
  if (modo === 'sempre')   return nivel === 'acima' || nivel === 'abaixo' || nivel === 'normal';
  if (modo === 'so_acima') return nivel === 'acima';
  // 'relevante' (default)
  return nivel === 'acima' || nivel === 'abaixo';
}

// Wrapper de compatibilidade: mantém o contrato antigo (retorna objeto só
// quando 'acima', null caso contrário). Não usado no fluxo novo, preservado
// para qualquer chamada legada.
function verificarAlerta(totalAtual, mediaHistorica) {
  const r = avaliarCompra(totalAtual, mediaHistorica);
  if (!r || r.nivel !== 'acima') return null;
  return { percentual: r.percentual, media: r.media };
}

module.exports = { avaliarCompra, deveEnviarMensagem, verificarAlerta };
