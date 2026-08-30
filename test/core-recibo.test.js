// test/core-recibo.test.js — núcleo canal-agnóstico do recibo (cod-0071).
//
// O refactor promete ZERO mudança de comportamento, mas o fluxo do recibo não
// tinha um único teste que o cobrisse ponta a ponta — a "rede de segurança dos
// 482 testes" simplesmente não passava por aqui. Estes testes são essa rede:
// cobrem a ORDEM das ações, os delays, os logs e os argumentos passados ao
// banco, que é exatamente o que um refactor silencioso quebraria.
//
// Rodar: node --test
//
// Nada aqui vai à rede: todas as dependências são injetadas via `deps`.

'use strict';

// core/recibo.js requer supabase.js, que cria o client no require — env dummy só
// pra carga (mesmo padrão do webhook-dedup.test.js / webhook-documento.test.js).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { processarRecibo } = require('../src/core/recibo.js');

const PHONE = '5517999999999';
const BUFFER = Buffer.from('cupom-falso');

// ── fábrica de dependências ──────────────────────────────────────────────────
// Padrão: tudo funciona e nada dispara. Cada teste sobrescreve só o que importa.

function dadosOk(extra = {}) {
  return {
    sucesso: true,
    tipo: 'mercado',
    loja: 'Mercado Teste',
    cnpj: '11.222.333/0001-44',
    data_compra: '2026-08-25',
    total: 150.5,
    itens: [{ nome: 'ARROZ 5KG', nome_canonico: 'arroz tipo 1 5kg', categoria: 'mercearia', quantidade: 1, preco_unitario: 25.9 }],
    ...extra,
  };
}

function fazerDeps(over = {}) {
  const chamadas = { salvarCompra: [], logs: [], ordem: [] };
  const deps = {
    upsertUsuario: async () => {
      chamadas.ordem.push('upsertUsuario');
      return { onboarding_step: 3, compras_mes_atual: 4 };
    },
    verificarLimiteGratuito: async () => {
      chamadas.ordem.push('verificarLimiteGratuito');
      return { atingido: false, cuponsUsados: 2 };
    },
    lerRecibo: async () => {
      chamadas.ordem.push('lerRecibo');
      return dadosOk();
    },
    calcularMedia: async () => {
      chamadas.ordem.push('calcularMedia');
      return 100;
    },
    salvarCompra: async (phone, payload) => {
      chamadas.ordem.push('salvarCompra');
      chamadas.salvarCompra.push({ phone, payload });
    },
    buscarHistorico: async () => {
      chamadas.ordem.push('buscarHistorico');
      return { totalMes: 620.4, compras: [] };
    },
    avaliarCompra: () => null,
    deveEnviarMensagem: () => true,
    log: (evento, dados) => chamadas.logs.push({ evento, dados }),
    ...over,
  };
  return { deps, chamadas };
}

const tipos = (r) => r.acoes.map((a) => a.tipo);
const acaoDe = (r, tipo) => r.acoes.find((a) => a.tipo === tipo);

// ── Gate de onboarding (step 0) ──────────────────────────────────────────────

test('step 0: devolve só a ação de onboarding e NÃO consome cota nem lê o cupom', async () => {
  const { deps, chamadas } = fazerDeps({
    upsertUsuario: async () => ({ onboarding_step: 0 }),
  });
  let baixou = false;
  const r = await processarRecibo(PHONE, async () => { baixou = true; return BUFFER; }, deps);

  assert.deepEqual(tipos(r), ['onboarding']);
  assert.deepEqual(acaoDe(r, 'onboarding'), { tipo: 'onboarding', step: 0, tipoEntrada: 'imagem', dadosProcessados: null });
  assert.equal(baixou, false, 'não pode baixar o arquivo antes das boas-vindas');
  assert.equal(chamadas.ordem.includes('verificarLimiteGratuito'), false);
  assert.equal(chamadas.ordem.includes('lerRecibo'), false);
});

test('onboarding_step ausente é tratado como 0 (usuário novo)', async () => {
  const { deps } = fazerDeps({ upsertUsuario: async () => ({}) });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);
  assert.deepEqual(tipos(r), ['onboarding']);
  assert.equal(r.acoes[0].step, 0);
});

// ── Limite gratuito ──────────────────────────────────────────────────────────

test('limite atingido: devolve ação de limite, loga cupons usados e não gasta Gemini', async () => {
  const { deps, chamadas } = fazerDeps({
    verificarLimiteGratuito: async () => ({ atingido: true, cuponsUsados: 10 }),
  });
  let baixou = false;
  const r = await processarRecibo(PHONE, async () => { baixou = true; return BUFFER; }, deps);

  assert.deepEqual(tipos(r), ['limite']);
  assert.equal(baixou, false, 'limite atingido não pode custar download nem chamada de IA');
  assert.equal(chamadas.ordem.includes('lerRecibo'), false);
  const acao = acaoDe(r, 'limite');
  assert.equal(acao.log.evento, 'limite_atingido');
  assert.equal(acao.log.dados.cupons_usados, 10);
  assert.doesNotMatch(JSON.stringify(acao.log.dados), new RegExp(PHONE), 'telefone vai mascarado no log (LGPD)');
});

// ── Erro de leitura ──────────────────────────────────────────────────────────

test('leitura falhou: só a ação de erro, com motivo e categoria repassados', async () => {
  const { deps, chamadas } = fazerDeps({
    lerRecibo: async () => ({ sucesso: false, motivo: 'não parece um cupom', categoria_erro: 'nao_cupom' }),
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['erro_leitura']);
  const acao = acaoDe(r, 'erro_leitura');
  assert.equal(acao.motivo, 'não parece um cupom');
  assert.equal(acao.categoriaErro, 'nao_cupom');
  assert.equal(acao.log.evento, 'cupom_erro_leitura');
  assert.equal(chamadas.salvarCompra.length, 0, 'leitura falhada nunca grava compra');
});

test('cupom borrado: acrescenta a dica de reenviar como arquivo, com pausa de 800ms', async () => {
  const { deps } = fazerDeps({
    lerRecibo: async () => ({ sucesso: false, motivo: 'imagem ilegível', categoria_erro: 'borrado' }),
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['erro_leitura', 'enviar_como_arquivo']);
  assert.equal(acaoDe(r, 'enviar_como_arquivo').delayMs, 800);
});

// ── Caminho feliz ────────────────────────────────────────────────────────────

test('sucesso: resposta + pos_compra, com totalMes e contador do mês', async () => {
  const { deps, chamadas } = fazerDeps();
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['resposta', 'pos_compra']);
  const resposta = acaoDe(r, 'resposta');
  assert.equal(resposta.totalMes, 620.4);
  assert.equal(resposta.qtdComprasMes, 4);
  assert.equal(resposta.dados.loja, 'Mercado Teste');

  const pos = acaoDe(r, 'pos_compra');
  assert.equal(pos.log.evento, 'cupom_registrado');
  assert.equal(pos.usuario.compras_mes_atual, 4);

  // O que vai pro banco é o recorte exato de sempre — nada a mais, nada a menos.
  assert.equal(chamadas.salvarCompra.length, 1);
  const { phone, payload } = chamadas.salvarCompra[0];
  assert.equal(phone, PHONE);
  assert.deepEqual(Object.keys(payload).sort(), ['cnpj', 'data_compra', 'itens', 'loja', 'tipo', 'total']);
  assert.equal(payload.total, 150.5);
  assert.equal(payload.tipo, 'mercado');
});

test('a média é calculada ANTES de salvar (senão o alerta compara com a compra de agora)', async () => {
  const { deps, chamadas } = fazerDeps();
  await processarRecibo(PHONE, async () => BUFFER, deps);
  assert.ok(
    chamadas.ordem.indexOf('calcularMedia') < chamadas.ordem.indexOf('salvarCompra'),
    'calcularMedia precisa vir antes de salvarCompra',
  );
});

test('contador do mês ausente vira 0 (nunca "undefined compras")', async () => {
  let chamada = 0;
  const { deps } = fazerDeps({
    upsertUsuario: async () => {
      chamada += 1;
      // 1ª leitura: usuário já onboardado; 2ª (pós-salvar): sem o contador
      return chamada === 1 ? { onboarding_step: 3, compras_mes_atual: 1 } : { onboarding_step: 3, compras_mes_atual: null };
    },
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);
  assert.equal(acaoDe(r, 'resposta').qtdComprasMes, 0);
});

test('cupom sem itens: aviso de sucesso parcial entra entre a resposta e o pos_compra', async () => {
  const { deps } = fazerDeps({ lerRecibo: async () => dadosOk({ itens: [] }) });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['resposta', 'aviso_sucesso_parcial', 'pos_compra']);
  const aviso = acaoDe(r, 'aviso_sucesso_parcial');
  assert.equal(aviso.delayMs, 600);
  assert.equal(aviso.log.evento, 'cupom_sucesso_parcial');
});

// ── Onboarding depois da resposta (steps 1 e 2) ───────────────────────────────

for (const step of [1, 2]) {
  test(`step ${step}: onboarding vem DEPOIS da resposta, com pausa de 800ms e os dados do cupom`, async () => {
    const { deps } = fazerDeps({
      upsertUsuario: async () => ({ onboarding_step: step, compras_mes_atual: 1 }),
    });
    const r = await processarRecibo(PHONE, async () => BUFFER, deps);

    assert.deepEqual(tipos(r), ['resposta', 'onboarding', 'pos_compra']);
    const onb = acaoDe(r, 'onboarding');
    assert.equal(onb.step, step);
    assert.equal(onb.tipoEntrada, 'imagem');
    assert.equal(onb.delayMs, 800);
    assert.equal(onb.dadosProcessados.totalMes, 620.4);
    assert.equal(onb.dadosProcessados.dados.loja, 'Mercado Teste');
  });
}

// ── Alerta de compra fora do padrão ──────────────────────────────────────────

test('compra acima da média: ação de alerta com pausa de 1s e percentual arredondado no log', async () => {
  const { deps } = fazerDeps({
    avaliarCompra: () => ({ nivel: 'alto', percentual: 42.7 }),
    deveEnviarMensagem: () => true,
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['resposta', 'alerta', 'pos_compra']);
  const alerta = acaoDe(r, 'alerta');
  assert.equal(alerta.delayMs, 1000);
  assert.equal(alerta.avaliacao.nivel, 'alto');
  assert.equal(alerta.log.dados.percentual, 43, 'percentual vai arredondado, como antes');
});

test('nível abaixo do limiar: avaliou, mas não alerta', async () => {
  const { deps } = fazerDeps({
    avaliarCompra: () => ({ nivel: 'leve', percentual: 5 }),
    deveEnviarMensagem: () => false,
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);
  assert.deepEqual(tipos(r), ['resposta', 'pos_compra']);
});

test("cupom tipo 'outros' (farmácia/posto) NUNCA gera alerta — não há padrão comparável", async () => {
  let avaliou = false;
  const { deps } = fazerDeps({
    lerRecibo: async () => dadosOk({ tipo: 'outros' }),
    avaliarCompra: () => { avaliou = true; return { nivel: 'alto', percentual: 90 }; },
  });
  const r = await processarRecibo(PHONE, async () => BUFFER, deps);

  assert.deepEqual(tipos(r), ['resposta', 'pos_compra']);
  assert.equal(avaliou, false, 'nem chega a avaliar cupom não-mercado');
});

// ── Erro não é engolido pelo núcleo ──────────────────────────────────────────

test('falha no download propaga (quem trata é o adaptador, como antes do refactor)', async () => {
  const { deps } = fazerDeps();
  await assert.rejects(
    () => processarRecibo(PHONE, async () => { throw new Error('z-api fora do ar'); }, deps),
    /z-api fora do ar/,
  );
});

test('falha ao salvar propaga (o usuário recebe erro interno, não uma confirmação falsa)', async () => {
  const { deps } = fazerDeps({ salvarCompra: async () => { throw new Error('supabase indisponível'); } });
  await assert.rejects(() => processarRecibo(PHONE, async () => BUFFER, deps), /supabase indisponível/);
});

// ── O núcleo é mesmo canal-agnóstico ─────────────────────────────────────────

test('src/core/recibo.js não conhece WhatsApp: nada de zapi nem de formatter', () => {
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'core', 'recibo.js'), 'utf8');
  const requires = [...fonte.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]);
  assert.equal(requires.some((r) => /zapi/.test(r)), false, 'o núcleo não pode importar zapi.js');
  assert.equal(requires.some((r) => /formatter/.test(r)), false, 'quem formata mensagem é o adaptador');
  assert.doesNotMatch(fonte, /montarMensagem|enviarMensagem/, 'nenhuma menção a montar/enviar mensagem');
});

// ── Contrato núcleo ↔ adaptador ──────────────────────────────────────────────

test('adaptador: ação de tipo desconhecido é registrada e não derruba o fluxo', async () => {
  const { executarAcoesDoRecibo } = require('../src/index.js');
  await executarAcoesDoRecibo(PHONE, [{ tipo: 'tipo_que_nao_existe' }]);
});
