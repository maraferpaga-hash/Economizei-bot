// test/onboarding-comandos.test.js — cod-0025 (achado A3).
//
// Bug: nos steps 0 e 1 do onboarding TODO texto virava resposta de onboarding,
// então quem chegava já querendo assinar mandava "/planos" e recebia a mensagem
// de onboarding — conversão paga bloqueada até a pessoa mandar 1 cupom.
//
// A decisão de "isto escapa do gate ou não" mora inteira em
// `comandoLiberadoNoOnboarding` (função pura). O risco do bugfix é o casamento
// ser largo demais e engolir uma resposta legítima do onboarding — é isso que a
// maior parte destes testes vigia.
//
// Rodar: node --test test/onboarding-comandos.test.js

'use strict';

// index.js requer supabase.js, que cria o client no require — env dummy só pra
// carga (a função sob teste é pura). Mesmo padrão do test/webhook-auth.test.js.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// require.main !== module aqui → o index.js NÃO abre porta nem inicia scheduler.
const {
  comandoLiberadoNoOnboarding,
  COMANDOS_LIBERADOS_NO_ONBOARDING,
} = require('../src/index.js');

// ── O que DEVE escapar do gate ──────────────────────────────────────────────

test('comandos de pagamento escapam do onboarding', () => {
  for (const t of ['/planos', 'planos', '/plano', '/pro', '/upgrade', '/preco', '/preço']) {
    assert.equal(comandoLiberadoNoOnboarding(t), 'planos', `"${t}" deveria abrir os planos`);
  }
  for (const t of ['/pix', 'pix']) {
    assert.equal(comandoLiberadoNoOnboarding(t), 'pix', `"${t}" deveria abrir o PIX`);
  }
});

test('ajuda e privacidade escapam do onboarding', () => {
  for (const t of ['/ajuda', '/help', '/menu']) {
    assert.equal(comandoLiberadoNoOnboarding(t), 'ajuda');
  }
  for (const t of ['/privacidade', 'privacidade']) {
    assert.equal(comandoLiberadoNoOnboarding(t), 'privacidade');
  }
});

test('tolera caixa alta, espaços e pontuação no fim', () => {
  assert.equal(comandoLiberadoNoOnboarding('  /PLANOS  '), 'planos');
  assert.equal(comandoLiberadoNoOnboarding('Planos'), 'planos');
  assert.equal(comandoLiberadoNoOnboarding('/pix!'), 'pix');
  assert.equal(comandoLiberadoNoOnboarding('PIX.'), 'pix');
});

test('forma com barra vale como 1ª palavra, mesmo com argumento', () => {
  assert.equal(comandoLiberadoNoOnboarding('/planos familia'), 'planos');
  assert.equal(comandoLiberadoNoOnboarding('/pix individual'), 'pix');
});

// ── O que NÃO pode escapar (o onboarding tem que continuar funcionando) ─────

test('texto livre continua caindo no onboarding', () => {
  const respostasDeOnboarding = [
    'oi',
    'olá',
    'bom dia',
    'ok',
    'entendi, vou mandar',
    'como funciona?',
    'sim',
    'quero testar',
  ];
  for (const t of respostasDeOnboarding) {
    assert.equal(comandoLiberadoNoOnboarding(t), null, `"${t}" não pode pular o onboarding`);
  }
});

test('a palavra do comando NO MEIO da frase não escapa (casamento estreito)', () => {
  const frases = [
    'meu plano é apertado esse mês',
    'nao tenho planos pra hoje',
    'paguei no pix ontem',
    'preciso de ajuda pra entender',
    'a privacidade me preocupa',
    'quanto custa o pro?',
  ];
  for (const t of frases) {
    assert.equal(comandoLiberadoNoOnboarding(t), null, `"${t}" não é comando, é conversa`);
  }
});

test('"ajuda" e "oi" sem barra continuam no onboarding (é o 1º contato)', () => {
  // Se "oi"/"ajuda" pulassem o gate, o step 0 nunca avançaria pro 1.
  for (const t of ['ajuda', 'oi', 'menu', 'help', 'start']) {
    assert.equal(comandoLiberadoNoOnboarding(t), null);
  }
});

test('entradas vazias/inválidas não quebram nem escapam', () => {
  for (const t of ['', '   ', null, undefined, '...']) {
    assert.equal(comandoLiberadoNoOnboarding(t), null);
  }
});

test('comando desconhecido não escapa do onboarding', () => {
  for (const t of ['/gastos', '/historico', '/comparar', '/teto cerveja 50']) {
    assert.equal(comandoLiberadoNoOnboarding(t), null, `${t} não está na lista liberada`);
  }
});

// ── Consistência entre a lista e o roteamento ───────────────────────────────

test('toda chave liberada tem um ramo de resposta em processarTexto', () => {
  const fonte = require('node:fs').readFileSync(
    require.resolve('../src/index.js'),
    'utf8'
  );
  for (const nome of Object.keys(COMANDOS_LIBERADOS_NO_ONBOARDING)) {
    assert.ok(
      fonte.includes(`liberado === '${nome}'`) || nome === 'ajuda',
      `a chave "${nome}" está liberada mas não tem ramo em processarTexto`
    );
  }
});

test('o onboarding_step NÃO é alterado no caminho do comando liberado', () => {
  const fonte = require('node:fs').readFileSync(
    require.resolve('../src/index.js'),
    'utf8'
  );
  const inicio = fonte.indexOf('const liberado = comandoLiberadoNoOnboarding(texto);');
  assert.ok(inicio > 0, 'o gate do cod-0025 sumiu de processarTexto');

  // Recorta exatamente o corpo do `if (liberado) { ... }` — até o `}` que fecha
  // no mesmo nível de indentação (4 espaços).
  const abre = fonte.indexOf('if (liberado) {', inicio);
  assert.ok(abre > 0, 'o ramo `if (liberado)` sumiu');
  const fecha = fonte.indexOf('\n    }', abre);
  assert.ok(fecha > abre, 'não achei o fim do ramo `if (liberado)`');
  const bloco = fonte.slice(abre, fecha);

  assert.ok(
    !bloco.includes('atualizarOnboardingStep'),
    'o comando liberado está avançando o onboarding — ele deve apenas responder e retomar depois'
  );
  assert.ok(
    !bloco.includes('gerenciarOnboarding'),
    'o comando liberado não pode disparar o fluxo de onboarding junto'
  );
  assert.ok(bloco.includes('return;'), 'o ramo do comando liberado precisa encerrar o processamento');
});
