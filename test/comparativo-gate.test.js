// test/comparativo-gate.test.js — GATE PRO do comparativo entre mercados (cod-0073)
//
// Por que este arquivo existe: até 2026-08-16 o comparativo era idêntico pra
// Free e Pro (achado B10 do Checkpoint N2 de 01/08 — "na prática R$9,90/mês
// compra só cupons ilimitados"). Aqui trava-se o recorte decidido no
// `Economizei app/Gate_Pro_Desdobramento_2026-07-10.md`:
//   • Free  → teaser (COMPARATIVO_AMOSTRAS_FREE, default 3) + upsell honesto
//             citando */planos*, e SÓ quando há mais comparativo pra ver
//   • Pro   → até COMPARATIVO_MAX_PRO (default 10), sem upsell
//
// ⚠️ CAMINHO DO DINHEIRO: este teste toca `temFeaturesProAtivas` e copy que cita
// plano — o `check-firewall` acusa de propósito (modo advisory desde 2026-07-26).
// Commit consciente do Gabriel, conforme regra 3 do §11 do CLAUDE.md.
//
// Rodar: node --test

'use strict';

// O supabase.js cria o client no require — env dummy só pra carga.
// `temFeaturesProAtivas` é helper PURO: nenhuma chamada de rede acontece aqui.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { montarMensagemComparativo } = require('../src/formatter.js');
const { temFeaturesProAtivas } = require('../src/supabase.js');

const DIA = 24 * 60 * 60 * 1000;

// Resultado com `temMais` — é o único estado em que o upsell pode aparecer.
function _resultadoComMais(extra = {}) {
  return {
    temComparativo: true,
    janelaDias: 30,
    temMais: true,
    mostrados: 3,
    totalComparaveis: 8,
    comparativos: [{
      produto: 'arroz 5kg',
      menor: { loja: 'Mercado A', preco: 20 },
      maior: { loja: 'Mercado B', preco: 26 },
      economia: 6,
      economiaPct: 23,
      posicaoUsuario: null,
      precoUsuario: null,
      economiaUsuario: null,
    }],
    ...extra,
  };
}

// ---------------------------------------------------------------
// 1. Retrocompatibilidade — chamada com 1 argumento
// ---------------------------------------------------------------

test('gate: chamada com 1 argumento não quebra e mantém o corpo da mensagem intacto', () => {
  const semOpts = montarMensagemComparativo(_resultadoComMais());
  const comOptsVazio = montarMensagemComparativo(_resultadoComMais(), {});

  // O default `{}` tem que produzir exatamente o mesmo texto que passar `{}`.
  assert.equal(semOpts, comOptsVazio);
  // E o corpo (números do comparativo) continua o de sempre.
  assert.match(semOpts, /Mais barato: Mercado A — R\$ 20,00/);
  assert.match(semOpts, /Mostrando os 3 com maior diferença, de 8 no total/);
  assert.match(semOpts, /últimos 30 dias/);
});

test('gate: sem `ehPro` o default é o tratamento Free (nunca vaza conteúdo Pro por omissão)', () => {
  // Direção segura: quem chamar sem informar o plano recebe o comportamento
  // restritivo, não o liberado. Errar pra menos é recuperável; errar pra mais
  // entrega de graça a feature que sustenta o plano pago.
  assert.match(montarMensagemComparativo(_resultadoComMais()), /\/planos/);
});

// ---------------------------------------------------------------
// 2. O recorte Free × Pro
// ---------------------------------------------------------------

test('gate: Free com mais comparativos pra ver recebe o upsell citando /planos', () => {
  const msg = montarMensagemComparativo(_resultadoComMais(), { ehPro: false });
  assert.match(msg, /\/planos/);
  assert.match(msg, /comparativo completo/);
});

test('gate: Pro nunca recebe upsell — já pagou pela feature', () => {
  const msg = montarMensagemComparativo(_resultadoComMais(), { ehPro: true });
  assert.ok(!msg.includes('/planos'), 'Pro não pode ver upsell');
  assert.ok(!msg.includes('Individual'), 'Pro não pode ver menção a plano');
  // Mas o corpo é o mesmo — o gate muda o rodapé, não a informação.
  assert.match(msg, /Mostrando os 3 com maior diferença, de 8 no total/);
});

test('gate: sem mais comparativos pra ver, ninguém recebe upsell (nem Free)', () => {
  // Não prometer conteúdo que não existe: se o usuário já está vendo tudo,
  // "veja o comparativo completo" seria propaganda enganosa.
  const semMais = _resultadoComMais({ temMais: false });
  for (const opts of [undefined, {}, { ehPro: false }, { ehPro: true }]) {
    const msg = opts === undefined
      ? montarMensagemComparativo(semMais)
      : montarMensagemComparativo(semMais, opts);
    assert.ok(!msg.includes('/planos'), `temMais:false não pode gerar upsell (opts=${JSON.stringify(opts)})`);
  }
});

test('gate: estado vazio nunca vira gancho de venda', () => {
  // Quem ainda não tem comparativo nenhum recebe orientação, não upsell —
  // vender antes de entregar valor queima o canal.
  for (const opts of [{ ehPro: false }, { ehPro: true }]) {
    const msg = montarMensagemComparativo({ temComparativo: false, comparativos: [] }, opts);
    assert.match(msg, /Ainda não encontrei o mesmo produto/);
    assert.ok(!msg.includes('/planos'));
  }
});

// ---------------------------------------------------------------
// 3. Copy do upsell — regras do firewall e da voz do bot
// ---------------------------------------------------------------

test('gate: upsell não traz preço hardcoded nem urgência falsa nem gíria', () => {
  const msg = montarMensagemComparativo(_resultadoComMais(), { ehPro: false });

  // Preço vive só no montarMensagemPlanos — hardcodear aqui gera copy stale
  // no dia em que o pricing mudar (firewall, lei 1: promessa precisa de source).
  assert.ok(!/R\$\s*9|R\$\s*15|R\$\s*22|R\$\s*99|\/mês|por mês|por ano/.test(msg),
    'upsell não pode conter preço nem ciclo de cobrança');
  // Urgência falsa / escassez inventada.
  assert.ok(!/agora mesmo|últimas vagas|só hoje|corre|não perca/i.test(msg));
  // Gíria proibida no texto do bot (regra 4 do §11 do CLAUDE.md).
  assert.ok(!/\bcê\b|\btá\b|\bné\b|\bpra você\b.*\bó\b/i.test(msg));
});

// ---------------------------------------------------------------
// 4. temFeaturesProAtivas — a chave que abre o gate
// ---------------------------------------------------------------

test('temFeaturesProAtivas: assinante ativo tem acesso', () => {
  assert.equal(temFeaturesProAtivas({ is_pro: true }), true);
  // is_pro vence mesmo com janela de recompensa vencida.
  assert.equal(
    temFeaturesProAtivas({ is_pro: true, features_pro_ate: new Date(Date.now() - 10 * DIA).toISOString() }),
    true
  );
});

test('temFeaturesProAtivas: janela de recompensa de indicação no futuro abre o gate', () => {
  const futuro = new Date(Date.now() + 7 * DIA).toISOString();
  assert.equal(temFeaturesProAtivas({ is_pro: false, features_pro_ate: futuro }), true);
});

test('temFeaturesProAtivas: janela vencida, ausente ou usuário nulo NÃO abrem o gate', () => {
  const passado = new Date(Date.now() - 1 * DIA).toISOString();
  assert.equal(temFeaturesProAtivas({ is_pro: false, features_pro_ate: passado }), false);
  assert.equal(temFeaturesProAtivas({ is_pro: false, features_pro_ate: null }), false);
  assert.equal(temFeaturesProAtivas({ is_pro: false }), false);
  assert.equal(temFeaturesProAtivas({}), false);
  assert.equal(temFeaturesProAtivas(null), false);
  assert.equal(temFeaturesProAtivas(undefined), false);
});

test('temFeaturesProAtivas: data inválida em features_pro_ate degrada pra Free, não explode', () => {
  // Dado sujo no banco não pode nem derrubar o /comparar nem liberar Pro de graça.
  assert.equal(temFeaturesProAtivas({ is_pro: false, features_pro_ate: 'nao-e-data' }), false);
});
