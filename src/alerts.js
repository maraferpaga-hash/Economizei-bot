// Retorna { percentual, media } se compra atual > 120% da média histórica.
// Retorna null se não há média (menos de 3 compras) ou se compra está dentro do padrão.
function verificarAlerta(totalAtual, mediaHistorica) {
  if (mediaHistorica === null) return null;
  if (totalAtual <= mediaHistorica * 1.20) return null;

  const percentual = ((totalAtual - mediaHistorica) / mediaHistorica) * 100;
  return { percentual, media: mediaHistorica };
}

module.exports = { verificarAlerta };
