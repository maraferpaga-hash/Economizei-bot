// test/agent-sugestoes.test.js — cod-0044: sugestões pós-resposta do Agente.
//
// O que está sendo garantido (criterios-de-aceite da AGENDA):
//   • ≤1 sugestão por resposta, SÓ quando a resposta teve dados (temDados
//     true) — nunca em erro/estado-vazio;
//   • a sugestão só aponta pra intent que EXISTE no REGISTRO (firewall de
//     promessa: nada de feature inexistente) e não tem gíria;
//   • intents sem `sugestoes[]` seguem idênticas;
//   • a sugestão entra DEPOIS do firewall de fidelidade numérica — por isso
//     também não pode conter dígito.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { montarSugestao, responder } = require('../src/agent/render.js');
const {
  REGISTRO,
  gastoTotalMes,
  ondeCortar,
  temGiria,
  exemploSemGiria,
} = require('../src/agent/intents.js');

// ─── helpers de intent sintética ─────────────────────────────────────────────

function intentFake(extra = {}) {
  return {
    id: 'fake_origem',
    descricao: 'intent de teste',
    exemplos: ['pergunta de teste'],
    parametros: {},
    async executar() { return { temDados: true, fmt: {} }; },
    template(fato) { return fato.temDados ? 'Resposta com dados.' : 'Sem dados.'; },
    ...extra,
  };
}

const alvoFake = intentFake({
  id: 'fake_alvo',
  exemplos: ['qual meu maior gasto'],
});

// ─── montarSugestao (pura) ───────────────────────────────────────────────────

test('montarSugestao: null quando a resposta NÃO teve dados (estado-vazio/erro)', () => {
  const origem = intentFake({ sugestoes: ['fake_alvo'] });
  assert.equal(montarSugestao(origem, { temDados: false }, [origem, alvoFake]), null);
  assert.equal(montarSugestao(origem, null, [origem, alvoFake]), null);
  assert.equal(montarSugestao(origem, {}, [origem, alvoFake]), null);
});

test('montarSugestao: null quando a intent não declara sugestoes[]', () => {
  const origem = intentFake();
  assert.equal(montarSugestao(origem, { temDados: true }, [origem, alvoFake]), null);
  const vazia = intentFake({ sugestoes: [] });
  assert.equal(montarSugestao(vazia, { temDados: true }, [vazia, alvoFake]), null);
});

test('montarSugestao: firewall de promessa — alvo fora do registro não vira sugestão', () => {
  const origem = intentFake({ sugestoes: ['intent_que_nao_existe'] });
  assert.equal(montarSugestao(origem, { temDados: true }, [origem, alvoFake]), null);
});

test('montarSugestao: com alvo válido, devolve UMA sugestão com o exemplo do alvo', () => {
  const origem = intentFake({ sugestoes: ['fake_alvo'] });
  const s = montarSugestao(origem, { temDados: true }, [origem, alvoFake]);
  assert.ok(s, 'sugestão existe');
  assert.ok(s.includes('qual meu maior gasto?'), 'texto derivado do exemplo do alvo');
  assert.ok(s.startsWith('\n\n'), 'sufixo separado da resposta');
});

test('montarSugestao: nunca sugere a si mesma', () => {
  const origem = intentFake({ id: 'fake_alvo', sugestoes: ['fake_alvo'] });
  assert.equal(montarSugestao(origem, { temDados: true }, [origem]), null);
});

test('montarSugestao: alvo cujos exemplos são todos com gíria é pulado', () => {
  const alvoGiria = intentFake({
    id: 'so_giria',
    exemplos: ['cê tá gastando muito', 'tá caro né'],
  });
  const origem = intentFake({ sugestoes: ['so_giria'] });
  assert.equal(montarSugestao(origem, { temDados: true }, [origem, alvoGiria]), null);
});

test('montarSugestao: alvo cujo exemplo tem dígito é pulado (entra pós-fidelidade)', () => {
  const alvoNumero = intentFake({
    id: 'com_numero',
    exemplos: ['gastei 100 reais em maio'],
  });
  const origem = intentFake({ sugestoes: ['com_numero'] });
  assert.equal(montarSugestao(origem, { temDados: true }, [origem, alvoNumero]), null);
});

test('montarSugestao: primeiro alvo inválido → cai pro próximo (mas nunca mais de 1)', () => {
  const origem = intentFake({ sugestoes: ['nao_existe', 'fake_alvo'] });
  const s = montarSugestao(origem, { temDados: true }, [origem, alvoFake]);
  assert.ok(s && s.includes('qual meu maior gasto?'));
  // ≤1 por construção: a função retorna no primeiro válido (uma string única).
  assert.equal((s.match(/💡/g) || []).length, 1);
});

// ─── as sugestões REAIS do registro ──────────────────────────────────────────

test('REGISTRO: toda sugestão declarada aponta pra intent existente e gera texto sem gíria e sem dígito', () => {
  const comSugestao = REGISTRO.filter((i) => Array.isArray(i.sugestoes) && i.sugestoes.length);
  assert.ok(comSugestao.length >= 3, 'há intents com sugestão no registro');
  for (const intent of comSugestao) {
    for (const alvoId of intent.sugestoes) {
      const alvo = REGISTRO.find((i) => i.id === alvoId);
      assert.ok(alvo, `${intent.id} sugere '${alvoId}', que existe no REGISTRO`);
    }
    const s = montarSugestao(intent, { temDados: true }, REGISTRO);
    assert.ok(s, `${intent.id} gera sugestão com dados`);
    assert.ok(!temGiria(s), `sugestão de ${intent.id} sem gíria`);
    assert.ok(!/\d/.test(s), `sugestão de ${intent.id} sem dígito`);
  }
});

test('exemploSemGiria: prefere exemplo limpo; fallback no primeiro', () => {
  assert.equal(
    exemploSemGiria({ exemplos: ['tô gastando mais', 'esse mês foi caro'] }),
    'esse mês foi caro'
  );
  assert.equal(
    exemploSemGiria({ exemplos: ['cê viu', 'tá caro'] }),
    'cê viu',
    'todos com gíria → fallback (quem filtra é o chamador)'
  );
  assert.equal(exemploSemGiria({ exemplos: [] }), null);
  assert.equal(exemploSemGiria(null), null);
});

// ─── responder (integração) ──────────────────────────────────────────────────

test('responder (template): resposta com dados de intent com sugestoes[] termina com a sugestão', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
  });
  const r = await responder(fato, gastoTotalMes, 'template');
  assert.ok(r.texto.includes('💡 Você também pode perguntar:'), 'sugestão anexada');
  assert.equal(r.sugestaoAnexada, true);
  assert.equal((r.texto.match(/💡/g) || []).length, 1, 'no máximo 1 sugestão');
});

test('responder (template): estado-vazio NÃO ganha sugestão', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async () => [],
  });
  const r = await responder(fato, gastoTotalMes, 'template');
  assert.ok(!r.texto.includes('💡'), 'sem sugestão em estado-vazio');
  assert.equal(r.sugestaoAnexada, undefined);
});

test('responder (template): intent SEM sugestoes[] segue idêntica (mesmo texto do template)', async () => {
  const fato = { temDados: false, mesRef: '2026-08' };
  const r = await responder(fato, ondeCortar, 'template');
  assert.equal(r.texto, ondeCortar.template(fato), 'byte a byte o template');
});

test('responder (llm): sugestão entra DEPOIS da narração aprovada pela fidelidade', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
  });
  const r = await responder(fato, gastoTotalMes, 'llm', {
    chamarModelo: async () => `Neste mês você gastou ${fato.fmt.total} no total.`,
  });
  assert.equal(r.modoUsado, 'llm');
  assert.equal(r.fidelidadeOk, true);
  assert.ok(r.texto.includes('💡 Você também pode perguntar:'), 'sugestão anexada à narração');
});

test('responder (llm): airbag (fidelidade reprovada) também ganha a sugestão — a resposta teve dados', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
  });
  const r = await responder(fato, gastoTotalMes, 'llm', {
    chamarModelo: async () => 'Você gastou R$ 999,99 este mês.', // número intruso
  });
  assert.equal(r.caiuNoAirbag, true);
  assert.ok(r.texto.startsWith(gastoTotalMes.template(fato)), 'airbag = template');
  assert.ok(r.texto.includes('💡'), 'sugestão anexada mesmo no airbag');
});

test('responder: registro injetado sem o alvo → sem sugestão (firewall de promessa)', async () => {
  const fato = await gastoTotalMes.executar('5511999999999', {}, {
    buscarGastosPorCategoria: async () => [{ categoria: 'carnes', total: 100 }],
  });
  const r = await responder(fato, gastoTotalMes, 'template', { registro: [gastoTotalMes] });
  assert.ok(!r.texto.includes('💡'), 'alvo fora do registro injetado → nada prometido');
});
