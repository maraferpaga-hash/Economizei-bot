// cod-0024 — o lembrete `inativo_d10` não pode citar a contagem de compras do
// mês: com o reset preguiçoso de `compras_mes_atual`, o número pode refletir o
// mês ANTERIOR pra um usuário inativo há 10 dias (número enganoso). Decisão do
// critério de aceite: OMITIR o número.
// Runner: node:test (modelo test/insights.test.js).

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { montarLembreteInativoD10 } = require('../src/formatter');

test('inativo_d10: não cita nenhum número (contagem possivelmente stale)', () => {
  const msg = montarLembreteInativoD10();
  assert.ok(!/\d/.test(msg), `mensagem não pode conter dígito, veio: "${msg}"`);
});

test('inativo_d10: mantém o gancho do resumo de fim de mês e o convite ao cupom', () => {
  const msg = montarLembreteInativoD10();
  assert.match(msg, /fim do mês/i);
  assert.match(msg, /resumo/i);
  assert.match(msg, /cupom/);
});

test('inativo_d10: argumento legado é ignorado (retrocompatível com quem ainda passar a contagem)', () => {
  // Se algum call site antigo ainda passar a contagem, ela NÃO pode vazar pra mensagem.
  const msg = montarLembreteInativoD10(7);
  assert.ok(!msg.includes('7'));
  assert.strictEqual(msg, montarLembreteInativoD10());
});

test('inativo_d10: reengagement.js não passa mais compras_mes_atual pro lembrete', () => {
  // Guarda estática (o módulo reengagement.js carrega supabase/zapi — pesado pra
  // teste unitário): confere no fonte que o call site do inativo_d10 não injeta
  // o contador stale. Quebra se alguém reintroduzir a contagem.
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'reengagement.js'), 'utf8');
  const linha = src.split('\n').find((l) => l.includes("id: 'inativo_d10'"));
  assert.ok(linha, 'linha do inativo_d10 existe no reengagement.js');
  assert.ok(
    !linha.includes('compras_mes_atual'),
    `o call site do inativo_d10 não deve passar compras_mes_atual: "${linha.trim()}"`
  );
});
