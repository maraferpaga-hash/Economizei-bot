// test/agent-comparativo-pro.test.js — cod-0075
//
// A assimetria que esta tarefa fecha: desde a cod-0073 o /comparar mostra até
// COMPARATIVO_MAX_PRO comparativos pro assinante, mas a MESMA pergunta em texto
// livre ("onde tá mais barato") devolvia UM comparativo pra todo mundo — o
// comando entregava mais que a conversa.
//
// Critérios de aceite da AGENDA (cod-0075):
//   • Free vê 1 (texto idêntico ao de hoje) · Pro vê até N
//   • Pro com menos comparativos que o teto não inventa linha
//   • todo número do texto do Pro está na allowlist de fidelidade (fato.fmt +
//     texto do template) — senão a narração cai no airbag sem motivo
//   • a intent NÃO decide plano: recebe o número pronto
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { comparativoMercados } = require('../src/agent/intents.js');
const { conferirFidelidadeNumerica } = require('../src/agent/guards.js');

// ── Observações fabricadas: 4 produtos comparáveis, 2 lojas cada ────────────
// Diferenças propositalmente distintas pra ordenação (maior diferença primeiro)
// ficar previsível: arroz 4,00 · café 3,00 · leite 2,00 · feijão 1,00.
function observacoes() {
  const hoje = '2026-09-01';
  const par = (produto, precoA, precoB) => [
    { produto_canonico: produto, loja: 'Mercado A', preco_unit: precoA, data_obs: hoje },
    { produto_canonico: produto, loja: 'Mercado B', preco_unit: precoB, data_obs: hoje },
  ];
  return [
    ...par('arroz 5kg', 20.0, 24.0),
    ...par('cafe 500g', 15.0, 18.0),
    ...par('leite integral', 5.0, 7.0),
    ...par('feijao 1kg', 8.0, 9.0),
  ];
}

function deps(extra = {}) {
  return {
    buscarObservacoesComparativo: async () => ({
      observacoes: observacoes(),
      produtosDoUsuario: null,
      lojaDoUsuario: null,
    }),
    ...extra,
  };
}

const TEL = '5517999990000';

// ── Free ────────────────────────────────────────────────────────────────────

test('Free (default, sem maxNarrados) narra só o destaque — texto de hoje', async () => {
  const fato = await comparativoMercados.executar(TEL, {}, deps({ maxComparativos: 3 }));
  const txt = comparativoMercados.template(fato);

  assert.deepEqual(fato.linhasExtras, []);
  assert.ok(!('extras' in fato.fmt), 'sem extras, o fmt não ganha campo vazio');
  assert.ok(!txt.includes('Outros que valem o olho'), 'Free não vê a lista extra');
  assert.ok(txt.includes('arroz 5kg'), 'o destaque é a maior diferença');
  assert.ok(txt.includes('/comparar'), 'o teaser do Free continua');
});

test('Free explícito (maxNarrados=1) é idêntico ao default', async () => {
  const a = await comparativoMercados.executar(TEL, {}, deps({ maxComparativos: 3 }));
  const b = await comparativoMercados.executar(TEL, {}, deps({ maxComparativos: 3, maxNarrados: 1 }));

  assert.equal(comparativoMercados.template(a), comparativoMercados.template(b));
});

// ── Pro ─────────────────────────────────────────────────────────────────────

test('Pro (maxNarrados=10) narra o destaque + os demais, um por linha', async () => {
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    deps({ maxComparativos: 10, maxNarrados: 10 })
  );
  const txt = comparativoMercados.template(fato);

  // 4 comparativos: 1 destaque + 3 extras
  assert.equal(fato.linhasExtras.length, 3);
  assert.ok(txt.includes('Outros que valem o olho'));
  for (const produto of ['cafe 500g', 'leite integral', 'feijao 1kg']) {
    assert.ok(txt.includes(produto), `faltou ${produto} na lista do Pro`);
  }
  // uma linha por comparativo extra
  assert.equal(txt.split('\n').filter((l) => l.startsWith('•')).length, 3);
});

test('Pro com MENOS comparativos que o teto não inventa linha', async () => {
  const soUm = [
    { produto_canonico: 'arroz 5kg', loja: 'Mercado A', preco_unit: 20, data_obs: '2026-09-01' },
    { produto_canonico: 'arroz 5kg', loja: 'Mercado B', preco_unit: 24, data_obs: '2026-09-01' },
  ];
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    {
      buscarObservacoesComparativo: async () => ({
        observacoes: soUm,
        produtosDoUsuario: null,
        lojaDoUsuario: null,
      }),
      maxComparativos: 10,
      maxNarrados: 10,
    }
  );
  const txt = comparativoMercados.template(fato);

  assert.deepEqual(fato.linhasExtras, []);
  assert.ok(!txt.includes('Outros que valem o olho'));
});

test('Pro: maxNarrados maior que maxComparativos não passa do que veio do insights', async () => {
  // O teto real de linhas é quantos comparativos o insights.js devolveu.
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    deps({ maxComparativos: 2, maxNarrados: 10 })
  );

  assert.equal(fato.mostrados, 2);
  assert.equal(fato.linhasExtras.length, 1, 'só sobrou 1 extra além do destaque');
});

// ── Fidelidade numérica (Camada 5) ──────────────────────────────────────────

test('todo número do texto do Pro está autorizado pela allowlist', async () => {
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    deps({ maxComparativos: 10, maxNarrados: 10 })
  );
  const txt = comparativoMercados.template(fato);

  // Mesma allowlist que o render.js monta: fmt + texto do template.
  const permitidos = [txt, ...Object.values(fato.fmt).filter((v) => v != null).map(String)];
  const r = conferirFidelidadeNumerica(txt, permitidos);

  assert.equal(r.ok, true, `intrusos: ${JSON.stringify(r.intrusos)}`);
});

test('fmt.extras carrega os números das linhas extras (rede da fidelidade)', async () => {
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    deps({ maxComparativos: 10, maxNarrados: 10 })
  );

  assert.equal(typeof fato.fmt.extras, 'string');
  // o fmt sozinho (sem o texto do template) já autoriza os números extras
  const soFmt = Object.values(fato.fmt).filter((v) => v != null).map(String);
  const r = conferirFidelidadeNumerica(fato.linhasExtras.join(' '), soFmt);
  assert.equal(r.ok, true, `intrusos: ${JSON.stringify(r.intrusos)}`);
});

// ── A lista não é narrada pelo LLM (senão ela some) ─────────────────────────

test('Pro com lista: o render entrega o TEMPLATE, não a narração de 2 frases', async () => {
  const { responder } = require('../src/agent/render.js');
  const fato = await comparativoMercados.executar(
    TEL,
    {},
    deps({ maxComparativos: 10, maxNarrados: 10 })
  );

  assert.equal(fato.semNarracao, true);

  let chamouLLM = false;
  const r = await responder(fato, comparativoMercados, 'llm', {
    chamarModelo: async () => {
      chamouLLM = true;
      return 'Resumo curtinho que engoliria a lista.';
    },
    registro: [comparativoMercados],
  });

  assert.equal(chamouLLM, false, 'lista não passa pelo LLM');
  assert.equal(r.modoUsado, 'template');
  assert.ok(r.texto.includes('Outros que valem o olho'));
});

test('Free continua narrado pelo LLM (nada muda pra quem não tem lista)', async () => {
  const { responder } = require('../src/agent/render.js');
  const fato = await comparativoMercados.executar(TEL, {}, deps({ maxComparativos: 3 }));

  assert.equal(fato.semNarracao, false);

  let chamouLLM = false;
  await responder(fato, comparativoMercados, 'llm', {
    chamarModelo: async () => {
      chamouLLM = true;
      return 'O arroz 5kg sai por R$ 20,00 no Mercado A e R$ 24,00 no Mercado B.';
    },
    registro: [comparativoMercados],
  });

  assert.equal(chamouLLM, true, 'o caminho do Free segue narrado como sempre');
});

// ── A intent não decide plano ───────────────────────────────────────────────

test('a intent não conhece plano: só reage aos números que recebe', async () => {
  const fonte = comparativoMercados.executar.toString();
  for (const proibido of ['is_pro', 'temFeaturesProAtivas', 'COMPARATIVO_MAX_PRO']) {
    assert.ok(
      !fonte.includes(proibido),
      `regra de plano vazou pro intents.js: ${proibido}`
    );
  }
});
