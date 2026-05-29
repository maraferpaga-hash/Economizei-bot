function maskPhone(phone) {
  if (!phone || phone.length < 6) return '?????****';
  return phone.slice(0, 5) + '****';
}

function log(evento, dados = {}) {
  const entry = {
    ts: new Date().toISOString(),
    evento,
    ...dados,
  };
  console.log(JSON.stringify(entry));
}

module.exports = { log, maskPhone };
