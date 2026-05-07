function verificarAlerta(totalAtual, mediaHistorica) {
  if (mediaHistorica === null) return null;

  if (totalAtual > mediaHistorica * 1.20) {
    const percentual = ((totalAtual - mediaHistorica) / mediaHistorica * 100).toFixed(1);
    return { temAlerta: true, percentual, media: mediaHistorica };
  }

  return null;
}

module.exports = { verificarAlerta };
