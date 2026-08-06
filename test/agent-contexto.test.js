// test/agent-contexto.test.js — memória curta de conversa do Agente (cod-0043)
//
// Critérios de aceite da AGENDA:
//   • "quanto gastei em cerveja?" → "e em junho?" responde cerveja em junho
//     (herda intent + termo, troca só o período);
//   • TTL expirado ou sem contexto → comportamento atual INTACTO (sem chute);
//     o contexto só RECLASSIFICA — o número segue nascendo no executor;
//   • off-topic / duvida_sobre_bot não gravam contexto;
//   • contexto é por usuário (não vaza entre números); cota inalterada.
//
// Nada de I/O: Supabase/Z-API/Gemini nunca são tocados (deps injetadas e
// chamarModelo simulado). Rodar: node --test

'use strict';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const {
  lembrarContexto,
  recuperarContexto,
  esquecerContexto,
  CONTEXTO_TTL_MS,
  MAX_ENTRADAS,
  _limparTudo,
  _tamanho,
} = require('../src/agent/contexto.js');
const { extrairPeriodoIsolado } = require('../src/agent/periodo.js');
const { classificar } = require('../src/agent/classifier.js');
const { responderPergunta } = require('../src/agent/index.js');

beforeEach(() => _limparTudo());

// ═══════════════════════════════════════════════════════════════════════════
// extrairPeriodoIsolado — o gatilho determinístico do follow-up
// ═══════════════════════════════════════════════════════════════════════════

test('período isolado: reconhece as formas de follow-up', () => {
  assert.equal(extrairPeriodoIsolado('e em junho?'), 'junho');
  assert.equal(extrairPeriodoIsolado('e junho'), 'junho');
  assert.equal(extrairPeriodoIsolado('junho?'), 'junho');
  assert.equal(extrairPeriodoIsolado('  E EM MARÇO!  '), 'março');
  assert.equal(extrairPeriodoIsolado('e no mês passado?'), 'mes_passado');
  assert.equal(extrairPeriodoIsolado('e o mês anterior'), 'mes_passado');
  assert.equal(extrairPeriodoIsolado('e esse mês?'), 'mes_atual');
  assert.equal(extrairPeriodoIsolado('que tal maio?'), 'maio');
  assert.equal(extrairPeriodoIsolado('e em 2026-05?'), '2026-05');
});

test('período isolado: devolve null pra tudo que NÃO é só um período', () => {
  const naos = [
    'quanto gastei em junho?', 'e você?', 'e o cachorro?', 'oi',
    'e?', 'e em?', '', '   ', 'e em 2026-13?', 'junho de 2026',
    'e em junho eu gastei muito?', 'obrigado',
  ];
  for (const t of naos) {
    assert.equal(extrairPeriodoIsolado(t), null, `deveria ser null: "${t}"`);
  }
  assert.equal(extrairPeriodoIsolado(null), null);
  assert.equal(extrairPeriodoIsolado(42), null);
});

// ═══════════════════════════════════════════════════════════════════════════
// store — TTL, isolamento, teto de memória
// ═══════════════════════════════════════════════════════════════════════════

test('store: grava e recupera dentro da janela', () => {
  const t0 = 1_000_000;
  lembrarContexto('5511999999999', { intent: 'gasto_por_termo', params: { termo: 'cerveja' } }, t0);
  const ctx = recuperarContexto('5511999999999', t0 + 60_000);
  assert.deepEqual(ctx, { intent: 'gasto_por_termo', params: { termo: 'cerveja' } });
});

test('store: TTL expirado devolve null e apaga a entrada', () => {
  const t0 = 1_000_000;
  lembrarContexto('5511999999999', { intent: 'gasto_total_mes', params: {} }, t0);
  assert.equal(recuperarContexto('5511999999999', t0 + CONTEXTO_TTL_MS - 1) !== null, true);
  assert.equal(recuperarContexto('5511999999999', t0 + CONTEXTO_TTL_MS), null, 'no limite já expirou');
  assert.equal(_tamanho(), 0, 'entrada vencida é apagada na leitura');
});

test('store: contexto não vaza entre usuários', () => {
  const t0 = 1_000_000;
  lembrarContexto('5511111111111', { intent: 'gasto_por_termo', params: { termo: 'cerveja' } }, t0);
  lembrarContexto('5522222222222', { intent: 'gasto_total_mes', params: {} }, t0);
  assert.equal(recuperarContexto('5511111111111', t0).params.termo, 'cerveja');
  assert.deepEqual(recuperarContexto('5522222222222', t0).params, {});
  assert.equal(recuperarContexto('5533333333333', t0), null);
});

test('store: entrada inválida é ignorada; esquecer apaga', () => {
  const t0 = 1_000_000;
  lembrarContexto('5511999999999', null, t0);
  lembrarContexto('5511999999999', { intent: '' }, t0);
  lembrarContexto('', { intent: 'gasto_total_mes' }, t0);
  assert.equal(_tamanho(), 0);

  lembrarContexto('5511999999999', { intent: 'gasto_total_mes', params: {} }, t0);
  esquecerContexto('5511999999999');
  assert.equal(recuperarContexto('5511999999999', t0), null);
});

test('store: mutar o objeto devolvido não corrompe a memória', () => {
  const t0 = 1_000_000;
  const params = { termo: 'cerveja' };
  lembrarContexto('5511999999999', { intent: 'gasto_por_termo', params }, t0);
  params.termo = 'vinho'; // quem gravou mexeu no objeto depois

  const lido = recuperarContexto('5511999999999', t0);
  lido.params.termo = 'chocolate'; // e quem leu também

  assert.equal(recuperarContexto('5511999999999', t0).params.termo, 'cerveja');
});

test('store: respeita o teto de entradas (sem vazamento de memória)', () => {
  const t0 = 1_000_000;
  for (let i = 0; i < MAX_ENTRADAS + 50; i += 1) {
    lembrarContexto(`55119${String(i).padStart(8, '0')}`, { intent: 'gasto_total_mes', params: {} }, t0);
  }
  assert.ok(_tamanho() <= MAX_ENTRADAS, `tamanho ${_tamanho()} deveria caber no teto`);
  assert.ok(recuperarContexto(`55119${String(MAX_ENTRADAS + 49).padStart(8, '0')}`, t0), 'o mais recente sobrevive');
});

// ═══════════════════════════════════════════════════════════════════════════
// classificar — herança do contexto SEM chamar o modelo
// ═══════════════════════════════════════════════════════════════════════════

const registroFake = [
  {
    id: 'gasto_por_termo',
    descricao: 'gasto num item específico',
    parametros: {
      termo: { tipo: 'texto', obrigatorio: true },
      periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
    },
  },
  {
    id: 'gasto_total_mes',
    descricao: 'gasto total do mês',
    parametros: { periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' } },
  },
  {
    id: 'comparativo_mercados',
    descricao: 'comparativo entre mercados (sem período)',
    parametros: {},
  },
];

function modeloProibido() {
  return async () => {
    throw new Error('o modelo NÃO deveria ser chamado neste caso');
  };
}

test('herança: "e em junho?" reusa intent + termo, trocando só o período', async () => {
  const r = await classificar('e em junho?', {
    registro: registroFake,
    chamarModelo: modeloProibido(),
    contexto: { intent: 'gasto_por_termo', params: { termo: 'cerveja', periodo: 'mes_atual' } },
  });
  assert.equal(r.intent, 'gasto_por_termo');
  assert.deepEqual(r.params, { termo: 'cerveja', periodo: 'junho' });
  assert.equal(r.herdado, true);
});

test('herança: sem contexto → segue o caminho normal (LLM decide)', async () => {
  let chamou = false;
  const r = await classificar('e em junho?', {
    registro: registroFake,
    chamarModelo: async () => {
      chamou = true;
      return JSON.stringify({ intent: 'gasto_total_mes', params: { periodo: 'junho' }, confianca: 'media' });
    },
  });
  assert.equal(chamou, true, 'sem contexto, o classificador continua chamando o modelo');
  assert.equal(r.intent, 'gasto_total_mes');
  assert.equal(r.herdado, undefined);
});

test('herança: pergunta completa NÃO herda (vai pro classificador)', async () => {
  let chamou = false;
  await classificar('quanto gastei em chocolate em junho?', {
    registro: registroFake,
    chamarModelo: async () => {
      chamou = true;
      return JSON.stringify({ intent: 'gasto_por_termo', params: { termo: 'chocolate' } });
    },
    contexto: { intent: 'gasto_por_termo', params: { termo: 'cerveja' } },
  });
  assert.equal(chamou, true);
});

test('herança: intenção anterior sem parâmetro de período não herda', async () => {
  let chamou = false;
  await classificar('e em junho?', {
    registro: registroFake,
    chamarModelo: async () => {
      chamou = true;
      return JSON.stringify({ intent: 'fora_de_escopo' });
    },
    contexto: { intent: 'comparativo_mercados', params: {} },
  });
  assert.equal(chamou, true, 'comparativo_mercados não aceita período → sem herança');
});

test('herança: intenção que saiu do registro não herda', async () => {
  let chamou = false;
  await classificar('e em junho?', {
    registro: registroFake,
    chamarModelo: async () => {
      chamou = true;
      return JSON.stringify({ intent: 'fora_de_escopo' });
    },
    contexto: { intent: 'intencao_aposentada', params: { periodo: 'mes_atual' } },
  });
  assert.equal(chamou, true);
});

test('herança: params herdados inválidos reprovam na Camada 1 → sem herança', async () => {
  let chamou = false;
  await classificar('e em junho?', {
    registro: registroFake,
    chamarModelo: async () => {
      chamou = true;
      return JSON.stringify({ intent: 'fora_de_escopo' });
    },
    // termo é obrigatório: contexto corrompido sem termo não pode virar resposta
    contexto: { intent: 'gasto_por_termo', params: {} },
  });
  assert.equal(chamou, true, 'guards barram a herança incompleta');
});

test('herança: pergunta vazia continua fora de escopo mesmo com contexto', async () => {
  const r = await classificar('   ', {
    registro: registroFake,
    chamarModelo: modeloProibido(),
    contexto: { intent: 'gasto_por_termo', params: { termo: 'cerveja' } },
  });
  assert.equal(r.intent, 'fora_de_escopo');
});

// ═══════════════════════════════════════════════════════════════════════════
// orquestrador — grava/consulta contexto no fluxo real
// ═══════════════════════════════════════════════════════════════════════════

const PHONE = '5517999990000';

function intentTermoFake() {
  return {
    id: 'gasto_por_termo',
    descricao: 'gasto num item específico',
    parametros: {
      termo: { tipo: 'texto', obrigatorio: true },
      periodo: { tipo: 'periodo', obrigatorio: false, default: 'mes_atual' },
    },
    _chamadas: [],
    async executar(phone, params) {
      this._chamadas.push({ phone, params });
      return { temDados: true, total: 42.5, fmt: { total: 'R$ 42,50' } };
    },
    template() {
      return 'Em Junho/2026 você gastou R$ 42,50 em cerveja.';
    },
  };
}

function montarDeps(sobrescrever = {}) {
  const enviadas = [];
  const logadas = [];
  const deps = {
    verificarLimitePerguntas: async () => ({ atingido: false, usadas: 1, limite: 30 }),
    incrementarPerguntas: async () => 2,
    registrarPergunta: async (e) => { logadas.push(e); },
    enviarMensagem: async (phone, texto) => { enviadas.push(texto); },
    responder: async (fato, def) => ({ texto: def.template(fato), modoUsado: 'template', fidelidadeOk: null }),
    modo: 'template',
    ...sobrescrever,
  };
  return { deps, enviadas, logadas };
}

test('orquestrador: resposta normal memoriza intent + params do usuário', async () => {
  const intent = intentTermoFake();
  const { deps } = montarDeps({
    registro: [intent],
    classificar: async () => ({ intent: 'gasto_por_termo', params: { termo: 'cerveja' }, confianca: 'alta' }),
  });
  await responderPergunta(PHONE, 'quanto gastei em cerveja?', deps);

  const ctx = recuperarContexto(PHONE);
  assert.deepEqual(ctx, { intent: 'gasto_por_termo', params: { termo: 'cerveja' } });
});

test('orquestrador: follow-up de período usa o contexto e chega no executor', async () => {
  const intent = intentTermoFake();
  // 1ª pergunta: classificador real com modelo simulado.
  const { deps } = montarDeps({
    registro: [intent],
    classificar: (texto, opts) => classificar(texto, {
      ...opts,
      registro: [intent],
      chamarModelo: async () => JSON.stringify({
        intent: 'gasto_por_termo', params: { termo: 'cerveja' }, confianca: 'alta',
      }),
    }),
  });
  await responderPergunta(PHONE, 'quanto gastei em cerveja?', deps);

  // 2ª pergunta: só o período — o modelo NÃO pode ser chamado.
  const deps2 = montarDeps({
    registro: [intent],
    classificar: (texto, opts) => classificar(texto, {
      ...opts,
      registro: [intent],
      chamarModelo: modeloProibido(),
    }),
  }).deps;
  const r = await responderPergunta(PHONE, 'e em junho?', deps2);

  assert.equal(r.respondeu, true);
  assert.equal(r.intent, 'gasto_por_termo');
  assert.deepEqual(
    intent._chamadas[1].params,
    { termo: 'cerveja', periodo: 'junho' },
    'o executor recebe o termo herdado + o período novo — e é ELE quem faz a conta'
  );
});

test('orquestrador: contexto de um usuário não responde pelo outro', async () => {
  const intent = intentTermoFake();
  const { deps } = montarDeps({
    registro: [intent],
    classificar: async () => ({ intent: 'gasto_por_termo', params: { termo: 'cerveja' } }),
  });
  await responderPergunta('5517911111111', 'quanto gastei em cerveja?', deps);

  let chamouModelo = false;
  const deps2 = montarDeps({
    registro: [intent],
    classificar: (texto, opts) => classificar(texto, {
      ...opts,
      registro: [intent],
      chamarModelo: async () => {
        chamouModelo = true;
        return JSON.stringify({ intent: 'fora_de_escopo' });
      },
    }),
  }).deps;
  await responderPergunta('5517922222222', 'e em junho?', deps2);

  assert.equal(chamouModelo, true, 'outro número não herda contexto alheio');
});

test('orquestrador: off-topic e ajuda (consomeCota:false) não gravam contexto', async () => {
  const intent = intentTermoFake();

  const { deps } = montarDeps({
    registro: [intent],
    classificar: async () => ({ intent: 'fora_de_escopo' }),
  });
  await responderPergunta(PHONE, 'qual a capital da França?', deps);
  assert.equal(recuperarContexto(PHONE), null, 'off-topic não vira contexto');

  const ajuda = {
    id: 'duvida_sobre_bot',
    descricao: 'ajuda',
    parametros: {},
    consomeCota: false,
    async executar() { return { temDados: true }; },
    template() { return 'Eu leio o cupom e organizo seus gastos.'; },
  };
  const { deps: deps2 } = montarDeps({
    registro: [ajuda],
    classificar: async () => ({ intent: 'duvida_sobre_bot', params: {} }),
  });
  await responderPergunta(PHONE, 'o que você sabe fazer?', deps2);
  assert.equal(recuperarContexto(PHONE), null, 'ajuda não vira contexto');
});

test('orquestrador: erro técnico não memoriza contexto', async () => {
  const quebrada = {
    ...intentTermoFake(),
    executar: async () => { throw new Error('query falhou'); },
  };
  const { deps, enviadas } = montarDeps({
    registro: [quebrada],
    classificar: async () => ({ intent: 'gasto_por_termo', params: { termo: 'cerveja' } }),
  });
  const r = await responderPergunta(PHONE, 'quanto gastei em cerveja?', deps);
  assert.equal(r.motivo, 'erro_tecnico');
  assert.ok(enviadas[0].includes('problema técnico'));
  assert.equal(recuperarContexto(PHONE), null);
});

test('orquestrador: falha na memória de contexto não derruba o atendimento', async () => {
  const intent = intentTermoFake();
  const { deps, enviadas } = montarDeps({
    registro: [intent],
    classificar: async () => ({ intent: 'gasto_por_termo', params: { termo: 'cerveja' } }),
    recuperarContexto: () => { throw new Error('memória pifou'); },
    lembrarContexto: () => { throw new Error('memória pifou'); },
  });
  const r = await responderPergunta(PHONE, 'quanto gastei em cerveja?', deps);
  assert.equal(r.respondeu, true, 'contexto é conveniência, não requisito');
  assert.equal(enviadas[0], 'Em Junho/2026 você gastou R$ 42,50 em cerveja.');
});

test('orquestrador: cota inalterada — follow-up conta como 1 pergunta', async () => {
  const intent = intentTermoFake();
  let incrementos = 0;
  const { deps } = montarDeps({
    registro: [intent],
    incrementarPerguntas: async () => { incrementos += 1; return incrementos + 1; },
    classificar: (texto, opts) => classificar(texto, {
      ...opts,
      registro: [intent],
      chamarModelo: async () => JSON.stringify({ intent: 'gasto_por_termo', params: { termo: 'cerveja' } }),
    }),
  });
  await responderPergunta(PHONE, 'quanto gastei em cerveja?', deps);
  await responderPergunta(PHONE, 'e em junho?', deps);
  assert.equal(incrementos, 2, 'o follow-up consome cota como qualquer pergunta');
});
