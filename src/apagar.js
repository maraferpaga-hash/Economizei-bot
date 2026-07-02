// =============================================================
// /apagar — lógica pura (direito de eliminação, LGPD)
// Separada do I/O (supabase) e do roteamento (index) para ser testável
// sem efeitos colaterais. Não há nada financeiro aqui.
// =============================================================

// Interpreta o texto recebido do usuário.
//   - pedido:    é uma invocação de /apagar? (aceita "/apagar" e "apagar")
//   - confirmar: veio com a palavra "confirmar"? (ex.: "/apagar confirmar")
//
// A confirmação EXIGE a palavra "confirmar" — a exclusão é irreversível, então
// repetir o comando sozinho nunca apaga; só o passo explícito de confirmação.
// Case-insensitive e tolerante a pontuação ao redor.
function interpretarApagar(texto) {
  const msg = (texto || '').toLowerCase().trim().replace(/[.,!?;:]/g, '');
  const palavras = msg.split(/\s+/).filter(Boolean);
  const pedido = palavras[0] === '/apagar' || palavras[0] === 'apagar';
  const confirmar = pedido && palavras.includes('confirmar');
  return { pedido, confirmar };
}

module.exports = { interpretarApagar };
