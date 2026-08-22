// test/pix-comprovante-copy.test.js — cod-0062b
//
// Duas peças da cod-0062 (ler comprovante de PIX) que NÃO dependem da extração,
// portanto não tocam o coração (`src/gemini.js`) e podem nascer antes:
//
//   1. guard do `precos_mercado` — lista negra (`tipo !== 'outros'`) virou lista
//      branca (`só mercado`). Sem isso, o `tipo='pix'` da cod-0062 entraria na
//      base anônima de preços por omissão, poluindo o comparativo entre mercados
//      com valores que não são preço de produto nenhum.
//   2. copy de confirmação — PIX enviado (gasto), PIX recebido (NÃO é gasto) e a
//      recusa honesta quando o valor não é legível (corpus pix-03).
//
// ⚠️ Este arquivo cita "PIX": o firewall financeiro acusa por design (modo
// advisory desde 2026-07-26). Nada aqui cobra, precifica ou toca `is_pro`.
//
// Rodar: node --test test/pix-comprovante-copy.test.js

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// supabase.js cria o client no require (mesmo padrão de test/filtro-gasto.test.js).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const {
  montarConfirmacaoPix,
  montarConfirmacaoPixEntrada,
  montarPixValorIlegivel,
} = require('../src/formatter');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Guard do precos_mercado (função pura — sem banco, sem dublê)
// ─────────────────────────────────────────────────────────────────────────────

test('guard: só tipo "mercado" alimenta a base de preços', () => {
  const { entraEmPrecosMercado } = require('../src/supabase');

  assert.equal(entraEmPrecosMercado('mercado'), true);
  assert.equal(entraEmPrecosMercado('outros'), false);
  assert.equal(entraEmPrecosMercado('pix'), false, 'PIX não tem preço de produto — não pode entrar');
});

test('guard: tipo desconhecido/ausente NÃO entra (lista branca, não lista negra)', () => {
  const { entraEmPrecosMercado } = require('../src/supabase');

  for (const tipo of [undefined, null, '', 'fatura', 'recibo', 'MERCADO', 'pix ']) {
    assert.equal(
      entraEmPrecosMercado(tipo), false,
      `tipo ${JSON.stringify(tipo)} não pode entrar na base de preços por omissão`
    );
  }
});

test('guard: a lista branca é exatamente TIPOS_MERCADO (sem segunda fonte de verdade)', () => {
  const { entraEmPrecosMercado, TIPOS_MERCADO } = require('../src/supabase');

  for (const t of TIPOS_MERCADO) assert.equal(entraEmPrecosMercado(t), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Copy — PIX enviado (saída = gasto)
// ─────────────────────────────────────────────────────────────────────────────

test('PIX enviado: valor em R$ na primeira metade da mensagem, com a contraparte', () => {
  const msg = montarConfirmacaoPix({
    contraparte: 'ACME PAY', total: 396.74, data_compra: '2024-12-05',
  });

  assert.match(msg, /R\$ 396,74/);
  assert.match(msg, /ACME PAY/);
  assert.match(msg, /05\/12/);
  // o número tem que estar nas DUAS primeiras linhas (decisão de copy: "R$ primeiro")
  assert.match(msg.split('\n').slice(0, 2).join('\n'), /R\$ 396,74/);
});

test('PIX enviado: sem contraparte, a mensagem continua íntegra (sem "para undefined")', () => {
  const msg = montarConfirmacaoPix({ total: 15, data_compra: '2023-03-08' });

  assert.match(msg, /R\$ 15,00/);
  assert.doesNotMatch(msg, /undefined|null|NaN/);
  assert.doesNotMatch(msg, /—\s*para\s*,/);
});

test('PIX enviado: total do mês só aparece quando é informado', () => {
  const sem = montarConfirmacaoPix({ total: 15, data_compra: '2023-03-08' });
  assert.doesNotMatch(sem, /no mês/, 'PIX ainda não entra nas agregações (cod-0062) — não inventar o número do mês');

  const com = montarConfirmacaoPix({ total: 15, data_compra: '2023-03-08', totalMes: 1234.5, qtdMes: 12 });
  assert.match(com, /R\$ 1\.234,50/);
  assert.match(com, /12 lançamentos/);
});

test('PIX enviado: singular/plural do contador de lançamentos', () => {
  const um = montarConfirmacaoPix({ total: 10, data_compra: '2026-08-01', totalMes: 10, qtdMes: 1 });
  assert.match(um, /1 lançamento\b/);
  assert.doesNotMatch(um, /1 lançamentos/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Copy — PIX recebido (entrada = NÃO é gasto)
// ─────────────────────────────────────────────────────────────────────────────

test('PIX recebido: diz explicitamente que NÃO foi somado como gasto', () => {
  const msg = montarConfirmacaoPixEntrada({ contraparte: 'João', total: 100, data_compra: '2026-08-01' });

  assert.match(msg, /R\$ 100,00/);
  assert.match(msg, /entrada/i);
  assert.match(msg, /não\s+som(ei|ou)|não\s+é\s+gasto|não\s+entra/i);
});

test('PIX recebido: nunca se descreve como gasto/compra registrada', () => {
  const msg = montarConfirmacaoPixEntrada({ contraparte: 'João', total: 100, data_compra: '2026-08-01' });

  assert.doesNotMatch(msg, /compra registrada/i);
  assert.doesNotMatch(msg, /gastou/i);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recusa honesta — valor ilegível NUNCA vira R$ 0,00 (corpus pix-03)
// ─────────────────────────────────────────────────────────────────────────────

test('valor ausente/inválido cai na recusa honesta, sem número na mensagem', () => {
  for (const total of [null, undefined, '', 0, -5, NaN, 'abc', false, {}]) {
    for (const fn of [montarConfirmacaoPix, montarConfirmacaoPixEntrada]) {
      const msg = fn({ contraparte: 'X', total, data_compra: '2026-08-01' });
      assert.equal(msg, montarPixValorIlegivel(), `total ${JSON.stringify(total)} deveria recusar`);
      assert.doesNotMatch(msg, /R\$/, 'recusa honesta não pode exibir valor nenhum');
      assert.doesNotMatch(msg, /NaN|undefined|null/);
    }
  }
});

test('recusa honesta diz que NADA foi registrado e não culpa o usuário', () => {
  const msg = montarPixValorIlegivel();

  assert.match(msg, /não registrei/i);
  assert.doesNotMatch(msg, /você errou|erro seu|foto ruim demais/i);
});

test('chamada sem argumento nenhum não quebra', () => {
  assert.equal(montarConfirmacaoPix(), montarPixValorIlegivel());
  assert.equal(montarConfirmacaoPixEntrada(), montarPixValorIlegivel());
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Travas transversais (regra 4 §11 · LGPD · firewall de promessa)
// ─────────────────────────────────────────────────────────────────────────────

const GIRIA = [/\bcê\b/i, /\btá\b/i, /\bné\b/i, /\bpra\s+cê\b/i, /\bvéi\b/i, /\bmano\b/i];

test('nenhuma gíria nas mensagens do bot (regra 4 §11 — gíria é só marketing)', () => {
  const msgs = [
    montarConfirmacaoPix({ contraparte: 'X', total: 10, data_compra: '2026-08-01', totalMes: 10, qtdMes: 2 }),
    montarConfirmacaoPixEntrada({ contraparte: 'X', total: 10, data_compra: '2026-08-01' }),
    montarPixValorIlegivel(),
  ];
  for (const m of msgs) for (const g of GIRIA) assert.doesNotMatch(m, g, `gíria ${g} em: ${m}`);
});

test('nenhuma promessa que o produto não cumpre (categorizar PIX, comparar, avisar)', () => {
  const msgs = [
    montarConfirmacaoPix({ contraparte: 'X', total: 10, data_compra: '2026-08-01' }),
    montarConfirmacaoPixEntrada({ contraparte: 'X', total: 10, data_compra: '2026-08-01' }),
  ];
  const PROMESSAS = [/categori/i, /compar(ar|ativo)/i, /avis(o|arei|amos)/i, /todo\s+m[êe]s/i, /autom[áa]tic/i];
  for (const m of msgs) for (const p of PROMESSAS) assert.doesNotMatch(m, p, `promessa ${p} em: ${m}`);
});

test('LGPD: a copy não tem campo para CPF, chave PIX, agência ou conta', () => {
  // Se algum desses aparecer na assinatura no futuro, este teste cai junto.
  const msg = montarConfirmacaoPix({
    contraparte: 'ACME', total: 10, data_compra: '2026-08-01',
    cpf: '123.456.789-00', chave: '+5517999999999', agencia: '1234', conta: '56789-0',
  });
  for (const vazado of ['123.456.789-00', '5517999999999', '1234', '56789-0']) {
    assert.ok(!msg.includes(vazado), `dado sensível vazou na mensagem: ${vazado}`);
  }
});
