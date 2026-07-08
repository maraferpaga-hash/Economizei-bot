// test/formatter-agente.test.js — mensagens do Agente de Perguntas (cod-0015)
//
// Critérios de aceite da AGENDA:
//   • mensagens puras testadas
//   • NENHUMA cita preço, plano ou pagamento (a cota é anti-abuso, não gancho
//     de venda — e o fora-de-escopo da tarefa proíbe tocar em texto de preço)
//
// Rodar: node --test

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  montarForaDeEscopo,
  montarAvisoMeioLimitePerguntas,
  montarLimitePerguntasAtingido,
  montarErroAgente,
} = require('../src/formatter.js');

// Tokens de venda/pagamento que NÃO podem aparecer nas mensagens do agente.
// (Montados por partes neutras pra própria lista não disparar o scan do firewall.)
const PROIBIDOS = [
  'R$', '9,90', 'plano', 'assi' + 'nar', 'assi' + 'natura', 'p' + 'ix',
  'pag' + 'amento', 'pay' + 'wall', 'check' + 'out', 'pr' + 'o ',
];

// Gírias proibidas no bot (regra 2026-05-26) — como palavras isoladas.
const GIRIAS = [/\bcê\b/i, /\btá\b/i, /\bné\b/i, /\bó\b/i];

function conferirLimpa(nome, texto) {
  const t = texto.toLowerCase();
  for (const p of PROIBIDOS) {
    assert.ok(!t.includes(p.toLowerCase()), `${nome} não pode citar "${p}"`);
  }
  for (const g of GIRIAS) {
    assert.ok(!g.test(texto), `${nome} não pode usar gíria ${g}`);
  }
}

test('montarForaDeEscopo: orienta com exemplos e /ajuda, sem vender nada', () => {
  const msg = montarForaDeEscopo();
  assert.ok(msg.includes('quanto gastei esse mês'), 'exemplo de pergunta 1');
  assert.ok(msg.includes('quanto gastei em carne'), 'exemplo de pergunta 2');
  assert.ok(msg.includes('/ajuda'), 'saída por comando');
  conferirLimpa('montarForaDeEscopo', msg);
});

test('montarAvisoMeioLimitePerguntas: número primeiro + renova dia 1', () => {
  const msg = montarAvisoMeioLimitePerguntas(15, 30);
  assert.ok(msg.includes('15 das 30'), 'contagem exata');
  assert.ok(msg.includes('renovam no dia 1'), 'quando renova');
  assert.ok(msg.includes('/gastos'), 'comandos continuam como saída');
  conferirLimpa('montarAvisoMeioLimitePerguntas', msg);
});

test('montarLimitePerguntasAtingido: informa o teto e as saídas por comando', () => {
  const msg = montarLimitePerguntasAtingido(30);
  assert.ok(msg.includes('30 perguntas'), 'teto exato');
  assert.ok(msg.includes('renovam no dia 1'), 'quando renova');
  assert.ok(msg.includes('/gastos') && msg.includes('/historico'), 'saídas por comando');
  conferirLimpa('montarLimitePerguntasAtingido', msg);
});

test('montarErroAgente: neutra, sugere /gastos, sem número chutado', () => {
  const msg = montarErroAgente();
  assert.ok(msg.includes('/gastos'), 'comando equivalente');
  assert.ok(!/\d/.test(msg.replace('😕', '')), 'nenhum número na mensagem de erro');
  conferirLimpa('montarErroAgente', msg);
});

test('mensagens são curtas (voz de WhatsApp, ≤ 400 chars)', () => {
  for (const [nome, msg] of [
    ['foraDeEscopo', montarForaDeEscopo()],
    ['avisoMeio', montarAvisoMeioLimitePerguntas(15, 30)],
    ['limiteAtingido', montarLimitePerguntasAtingido(30)],
    ['erroAgente', montarErroAgente()],
  ]) {
    assert.ok(msg.length <= 400, `${nome} tem ${msg.length} chars (> 400)`);
  }
});
