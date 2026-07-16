// test/agent-duvida-bot.test.js — intent duvida_sobre_bot (cod-0042)
//
// Critérios de aceite da AGENDA:
//   • a resposta lista exemplos de pergunta REAIS derivados dos `exemplos` do
//     registro (lista viva, não copy duplicada) — testado comparando com o
//     próprio REGISTRO, não com strings fixas;
//   • não consome cota (como o off-topic — decisão do orquestrador cod-0017)
//     — testado de ponta a ponta no responderPergunta com deps simuladas;
//   • sem citar preço/plano.
// I/O sempre injetado (nunca Supabase/Gemini/Z-API reais). Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { REGISTRO, duvidaSobreBot } = require('../src/agent/intents.js');
const { responderPergunta } = require('../src/agent/index.js');
const { responder } = require('../src/agent/render.js');

// Tokens de venda/pagamento que a ajuda NÃO pode citar (mesma régua do
// formatter-agente.test.js — termos montados por concatenação pra própria
// suíte não disparar o scan de conteúdo do firewall).
const PROIBIDOS = [
  'R$', 'plano', 'Pro', 'assin' + 'atura', '/pla' + 'nos', 'pag' + 'amento',
];
const GIRIAS = [/\bcê\b/i, /\btá\b/i, /\bné\b/i, /\bó\b/i];

// ── registro ────────────────────────────────────────────────────────────────

test('duvida_sobre_bot: está no REGISTRO com descricao, exemplos e consomeCota:false', () => {
  const intent = REGISTRO.find((i) => i.id === 'duvida_sobre_bot');
  assert.ok(intent, 'presente no REGISTRO (o classificador deriva daqui)');
  assert.ok(intent.descricao && intent.descricao.length > 10);
  assert.ok(Array.isArray(intent.exemplos) && intent.exemplos.length >= 3);
  assert.equal(typeof intent.executar, 'function');
  assert.equal(typeof intent.template, 'function');
  assert.equal(intent.consomeCota, false, 'ajuda não consome cota (critério da tarefa)');
});

// ── executar ────────────────────────────────────────────────────────────────

test('executar: sem I/O, sem deps, retorna temDados:false (nunca chega ao LLM — Camada 3)', async () => {
  const fato = await duvidaSobreBot.executar('5517999999999', {}, {});
  assert.equal(fato.temDados, false);
  assert.equal(fato.ajuda, true);
});

test('executar + render: modo llm cai no template SEM chamar o modelo (temDados:false)', async () => {
  let chamouModelo = false;
  const fato = await duvidaSobreBot.executar('5517999999999', {}, {});
  const r = await responder(fato, duvidaSobreBot, 'llm', {
    chamarModelo: async () => { chamouModelo = true; return 'nunca'; },
  });
  assert.equal(chamouModelo, false, 'ajuda nunca gasta chamada de LLM');
  assert.equal(r.modoUsado, 'template');
});

// ── template (lista viva) ───────────────────────────────────────────────────

test('template: lista 1 exemplo real de CADA intent do registro (derivado, não hardcoded)', () => {
  const msg = duvidaSobreBot.template({ temDados: false, ajuda: true });
  const outras = REGISTRO.filter((i) => i.id !== 'duvida_sobre_bot');
  for (const intent of outras) {
    assert.ok(
      intent.exemplos.some((e) => msg.includes(e)),
      `ajuda cita um exemplo real de ${intent.id}`
    );
  }
  // não se auto-lista
  assert.ok(!msg.includes(duvidaSobreBot.exemplos[0]), 'não lista a si mesma');
  // uma linha de exemplo por intent (lista viva acompanha o registro)
  const bullets = msg.split('\n').filter((l) => l.startsWith('•'));
  assert.equal(bullets.length, outras.length);
});

test('template: explica o gesto do cupom e oferece a saída por comando (/ajuda)', () => {
  const msg = duvidaSobreBot.template({ temDados: false, ajuda: true });
  assert.match(msg, /foto do seu cupom/);
  assert.ok(msg.includes('/ajuda'), 'saída por comando (Desenho §9)');
});

test('template: sem preço/plano/pagamento e sem gíria proibida', () => {
  const msg = duvidaSobreBot.template({ temDados: false, ajuda: true });
  for (const t of PROIBIDOS) {
    assert.ok(!msg.includes(t), `ajuda não pode citar "${t}"`);
  }
  for (const g of GIRIAS) {
    assert.ok(!g.test(msg), `ajuda não pode usar gíria ${g}`);
  }
});

test('template: lista viva reage a registro que cresce (prova de não-duplicação)', () => {
  // Simula um registro futuro maior clonando o módulo? Não — a lista é
  // derivada do REGISTRO real em runtime; a prova aqui é estrutural: o nº de
  // bullets é REGISTRO.length - 1, calculado, não fixo.
  const msg = duvidaSobreBot.template({ temDados: false, ajuda: true });
  const bullets = msg.split('\n').filter((l) => l.startsWith('•'));
  assert.equal(bullets.length, REGISTRO.length - 1);
});

// ── orquestrador: não consome cota ──────────────────────────────────────────

function montarDeps(sobrescrever = {}) {
  const enviadas = [];
  const logadas = [];
  const chamadas = { incrementou: 0 };
  const deps = {
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 14, limite: 30 }),
    incrementarPerguntas: async () => { chamadas.incrementou += 1; return 15; },
    registrarPergunta: async (e) => { logadas.push(e); },
    enviarMensagem: async (phone, texto) => { enviadas.push(texto); },
    classificar: async () => ({ intent: 'duvida_sobre_bot', params: {}, confianca: 'alta' }),
    responder,
    registro: REGISTRO,
    modo: 'template',
    ...sobrescrever,
  };
  return { deps, enviadas, logadas, chamadas };
}

test('orquestrador: duvida_sobre_bot responde SEM incrementar cota nem aviso do meio', async () => {
  // usadas=14→15 cruzaria a metade de 30: se a cota fosse consumida, o aviso
  // do meio dispararia — a ausência das DUAS coisas prova o critério.
  const { deps, enviadas, logadas, chamadas } = montarDeps();
  const r = await responderPergunta('5517999999999', 'o que você sabe fazer?', deps);

  assert.equal(r.respondeu, true);
  assert.equal(r.intent, 'duvida_sobre_bot');
  assert.equal(chamadas.incrementou, 0, 'não consome cota');
  assert.equal(enviadas.length, 1, 'só a ajuda — sem aviso do meio');
  assert.match(enviadas[0], /foto do seu cupom/);
  assert.equal(logadas[0].respondeu, true, 'Camada 7: a pergunta vai pro log mesmo sem cota');
});

test('orquestrador: intent SEM a flag continua consumindo cota normalmente (regressão)', async () => {
  const intentComum = {
    id: 'gasto_total_mes',
    descricao: 'gasto total',
    parametros: {},
    async executar() { return { temDados: true, mesRef: '2026-07', total: 10, fmt: { total: 'R$ 10,00' } }; },
    template(f) { return f.temDados ? `Total: ${f.fmt.total}.` : 'Sem dados.'; },
  };
  const { deps, enviadas, chamadas } = montarDeps({
    classificar: async () => ({ intent: 'gasto_total_mes', params: {}, confianca: 'alta' }),
    registro: [intentComum],
  });
  const r = await responderPergunta('5517999999999', 'quanto gastei?', deps);
  assert.equal(r.respondeu, true);
  assert.equal(chamadas.incrementou, 1, 'intent comum consome cota');
  assert.equal(enviadas.length, 2, 'resposta + aviso do meio (14→15 de 30)');
});
