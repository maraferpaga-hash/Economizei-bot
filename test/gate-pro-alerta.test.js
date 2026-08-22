// test/gate-pro-alerta.test.js — GATE PRO dos comandos do Alerta Pro (cod-0074)
//
// Por que este arquivo existe: até 2026-08-20 os comandos de CONFIGURAÇÃO do
// Alerta Pro (/acompanhar, /teto, /superfluo) rodavam sem gate nenhum — segunda
// metade do achado B10 do Checkpoint N2 de 01/08 ("na prática R$9,90/mês compra
// só cupons ilimitados"). A cod-0073 fechou o /comparar; esta fecha o resto.
//
// O recorte testado aqui é o decidido em 2026-07-08 e refinado em 07-27 — o
// teste existe pra travá-lo, não pra relitigá-lo:
//   • Pro:            /acompanhar, /teto, /superfluo (a configuração)
//   • sempre aberto:  /acompanhamentos e /parar (ver e desligar o que já existe)
//   • Free (intacto): o bloco de supérfluo com baseline no /gastos
//   • alerta proativo de limite: gate SILENCIOSO — não envia e não faz upsell
//
// ⚠️ CAMINHO DO DINHEIRO: este teste toca `temFeaturesProAtivas` e copy que cita
// plano — o `check-firewall` acusa de propósito (modo advisory desde 2026-07-26).
// Commit consciente do Gabriel, conforme regra 3 do §11 do CLAUDE.md.
//
// Rodar: node --test

'use strict';

// index.js → supabase.js cria o client no require; env dummy só pra carga.
// require.main !== module aqui → o index.js NÃO abre porta nem inicia scheduler.
// Nenhuma chamada de rede acontece: as funções testadas são puras ou recebem
// dependências injetadas.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  COMANDOS_PRO_ALERTA,
  comandoExigeProAlerta,
  comandoLiberadoParaUsuario,
  verificarAlertasDeLimite,
} = require('../src/index.js');
const { montarUpsellAcompanhamentos } = require('../src/formatter.js');

const DIA = 24 * 60 * 60 * 1000;

const PRO = { is_pro: true };
const PRO_POR_INDICACAO = { is_pro: false, features_pro_ate: new Date(Date.now() + 7 * DIA).toISOString() };
const FREE = { is_pro: false, features_pro_ate: null };
const EX_PRO = { is_pro: false, features_pro_ate: new Date(Date.now() - 1 * DIA).toISOString() };

const PHONE = '5517999999999';

// ---------------------------------------------------------------
// 1. O recorte — cada comando gated nos DOIS estados
// ---------------------------------------------------------------

test('recorte: os três comandos de configuração exigem Pro', () => {
  assert.deepEqual([...COMANDOS_PRO_ALERTA].sort(), ['acompanhar', 'superfluo', 'teto']);
  for (const cmd of ['acompanhar', 'teto', 'superfluo']) {
    assert.equal(comandoExigeProAlerta(cmd), true, `${cmd} deveria ser gated`);
  }
});

test('recorte: sem Pro, os três comandos são bloqueados', () => {
  for (const cmd of ['acompanhar', 'teto', 'superfluo']) {
    assert.equal(comandoLiberadoParaUsuario(cmd, FREE), false, `${cmd} não pode passar no Free`);
    assert.equal(comandoLiberadoParaUsuario(cmd, EX_PRO), false, `${cmd} não pode passar com janela vencida`);
  }
});

test('recorte: com Pro (assinante OU janela de indicação), os três passam', () => {
  for (const cmd of ['acompanhar', 'teto', 'superfluo']) {
    assert.equal(comandoLiberadoParaUsuario(cmd, PRO), true, `${cmd} deveria passar pro assinante`);
    assert.equal(comandoLiberadoParaUsuario(cmd, PRO_POR_INDICACAO), true,
      `${cmd} deveria passar na janela da recompensa de indicação`);
  }
});

// ---------------------------------------------------------------
// 2. O que fica ABERTO de propósito — decisão 07-10, não é esquecimento
// ---------------------------------------------------------------

test('aberto: /acompanhamentos e /parar NÃO são gated em nenhum estado de plano', () => {
  // Quem teve Pro e voltou pro Free precisa conseguir VER e DESLIGAR o que
  // configurou. Sem isso o acompanhamento vira zumbi: continua existindo e a
  // pessoa não tem como parar. Decência + LGPD.
  for (const cmd of ['acompanhamentos', 'parar']) {
    assert.equal(comandoExigeProAlerta(cmd), false, `${cmd} não pode entrar na lista gated`);
    for (const usuario of [FREE, EX_PRO, PRO, PRO_POR_INDICACAO, null, undefined, {}]) {
      assert.equal(comandoLiberadoParaUsuario(cmd, usuario), true,
        `${cmd} tem que passar sempre (usuario=${JSON.stringify(usuario)})`);
    }
  }
});

test('aberto: comando desconhecido não é bloqueado por engano', () => {
  // O gate é uma lista de inclusão. Comando fora dela segue o fluxo normal —
  // um gate que bloqueia por omissão quebraria o bot inteiro.
  for (const cmd of ['gastos', 'historico', 'planos', '', undefined]) {
    assert.equal(comandoLiberadoParaUsuario(cmd, FREE), true, `${cmd} não deveria ser gated`);
  }
});

// ---------------------------------------------------------------
// 3. Direção segura do gate
// ---------------------------------------------------------------

test('direção segura: usuário ausente ou sujo é tratado como Free, e não explode', () => {
  // Errar pra menos é recuperável (a pessoa manda /planos); errar pra mais
  // entrega de graça a feature que sustenta o plano pago.
  for (const usuario of [null, undefined, {}, { is_pro: false }, { is_pro: false, features_pro_ate: 'nao-e-data' }]) {
    assert.equal(comandoLiberadoParaUsuario('teto', usuario), false,
      `usuario=${JSON.stringify(usuario)} não pode abrir o gate`);
  }
});

// ---------------------------------------------------------------
// 4. Alerta proativo — gate SILENCIOSO (não envia, e não vende)
// ---------------------------------------------------------------

function criarDepsAlerta(usuarioTemPro, { comLimite = true } = {}) {
  const enviadas = [];
  const eventos = [];
  const marcados = [];
  const chamadas = { buscarAcompanhamentos: 0, buscarItensDoMes: 0 };
  const deps = {
    temFeaturesProAtivas: () => usuarioTemPro,
    buscarAcompanhamentos: async () => {
      chamadas.buscarAcompanhamentos++;
      return comLimite
        ? [{ id: 1, tipo_alvo: 'termo', alvo: 'cerveja', rotulo: 'cerveja', limite_mensal: 100 }]
        : [];
    },
    buscarItensDoMes: async () => {
      chamadas.buscarItensDoMes++;
      // Gasto acima do teto → o alerta DEVE disparar quando há Pro.
      return [{ nome_canonico: 'cerveja', categoria: 'bebidas', preco_total: 150, compra_id: 1 }];
    },
    enviarMensagem: async (phone, msg) => { enviadas.push({ phone, msg }); },
    marcarAlertaLimiteEnviado: async (phone, id, mes) => { marcados.push({ phone, id, mes }); },
    log: (evento, dados) => eventos.push({ evento, dados }),
  };
  return { deps, enviadas, eventos, marcados, chamadas };
}

test('alerta proativo: Free não recebe NADA — nem alerta, nem upsell', async () => {
  const { deps, enviadas, chamadas } = criarDepsAlerta(false);

  await verificarAlertasDeLimite(PHONE, FREE, deps);

  assert.equal(enviadas.length, 0, 'mensagem proativa não pode sair pro Free');
  // E o gate vem ANTES das leituras: não faz sentido consultar o banco duas
  // vezes pra decidir não enviar.
  assert.equal(chamadas.buscarAcompanhamentos, 0, 'não deve nem ler acompanhamentos');
  assert.equal(chamadas.buscarItensDoMes, 0, 'não deve nem ler itens do mês');
});

test('alerta proativo: Pro com teto estourado recebe o alerta normalmente', async () => {
  const { deps, enviadas, eventos, marcados } = criarDepsAlerta(true);

  await verificarAlertasDeLimite(PHONE, PRO, deps);

  assert.equal(enviadas.length, 1, 'Pro tem que receber o alerta');
  assert.match(enviadas[0].msg, /cerveja/i);
  // E o alerta NÃO pode virar propaganda: quem já paga não recebe upsell.
  assert.ok(!enviadas[0].msg.includes('/planos'), 'alerta de teto não faz upsell');
  assert.ok(eventos.some((e) => e.evento === 'alerta_limite_enviado'));
  assert.equal(marcados.length, 1, 'alerta enviado tem que ser marcado');
});

test('alerta proativo: nunca lança, mesmo com dependência quebrada', async () => {
  // O cupom já foi salvo e respondido — um erro aqui não pode virar
  // "erro ao processar imagem" pro usuário.
  const { deps, eventos } = criarDepsAlerta(true);
  deps.buscarAcompanhamentos = async () => { throw new Error('banco fora'); };

  await assert.doesNotReject(() => verificarAlertasDeLimite(PHONE, PRO, deps));
  assert.ok(eventos.some((e) => e.evento === 'alerta_limite_erro'));
});

// ---------------------------------------------------------------
// 5. Copy do upsell — valor primeiro, caminho depois, sem preço
// ---------------------------------------------------------------

test('upsell: cada comando gated tem frase de valor própria e concreta', () => {
  const acompanhar = montarUpsellAcompanhamentos('acompanhar');
  const teto = montarUpsellAcompanhamentos('teto');
  const superfluo = montarUpsellAcompanhamentos('superfluo');

  assert.notEqual(acompanhar, teto);
  assert.notEqual(teto, superfluo);
  // Valor concreto, com exemplo — não "desbloqueie recursos premium".
  assert.match(teto, /teto/i);
  assert.match(acompanhar, /cerveja/);
  assert.match(superfluo, /supérfluo/i);
});

test('upsell: comando desconhecido cai no texto genérico, nunca em vazio ou erro', () => {
  for (const cmd of [undefined, null, '', 'inexistente']) {
    const msg = montarUpsellAcompanhamentos(cmd);
    assert.ok(typeof msg === 'string' && msg.length > 40, `mensagem vazia pra ${cmd}`);
    assert.match(msg, /\/planos/);
  }
});

test('upsell: mostra o caminho (/planos) e lembra que dá pra ver e desligar o que já existe', () => {
  for (const cmd of ['acompanhar', 'teto', 'superfluo']) {
    const msg = montarUpsellAcompanhamentos(cmd);
    assert.match(msg, /\/planos/, 'precisa do caminho');
    assert.match(msg, /\/acompanhamentos/, 'precisa dizer que dá pra ver o que já existe');
    assert.match(msg, /\/parar/, 'precisa dizer que dá pra desligar');
  }
});

test('upsell: sem preço, sem ciclo de cobrança, sem urgência falsa, sem gíria', () => {
  for (const cmd of ['acompanhar', 'teto', 'superfluo', 'desconhecido']) {
    const msg = montarUpsellAcompanhamentos(cmd);

    // Preço vive só no montarMensagemPlanos — hardcodear aqui gera copy stale
    // no dia em que o pricing mudar (firewall, lei 1: promessa precisa de source).
    assert.ok(!/R\$\s*9,90|R\$\s*15|R\$\s*22|R\$\s*99|R\$\s*150|R\$\s*220|\/mês|por mês|por ano/.test(msg),
      `upsell de ${cmd} não pode conter preço nem ciclo de cobrança`);
    // Urgência falsa / escassez inventada.
    assert.ok(!/agora mesmo|últimas vagas|só hoje|corre|não perca|aproveite/i.test(msg),
      `upsell de ${cmd} não pode inventar urgência`);
    // Gíria proibida no texto do bot (regra 4 do §11 do CLAUDE.md).
    assert.ok(!/\bcê\b|\btá\b|\bné\b|\bó\b|\bvéi\b|\bmano\b/i.test(msg),
      `upsell de ${cmd} não pode usar gíria`);
    // Não moralizar nem culpar quem não paga.
    assert.ok(!/você deveria|precisa se controlar|gasta demais/i.test(msg));
  }
});

test('upsell: o exemplo de R$ 100,00 no /teto é ilustração de teto, não preço de plano', () => {
  // Trava contra falso positivo do teste acima: o /teto cita um valor por ser um
  // comando de valor. O que não pode é valor de PLANO.
  const msg = montarUpsellAcompanhamentos('teto');
  assert.match(msg, /R\$ 100,00/);
  assert.ok(!/plano.*R\$|R\$.*\/mês/i.test(msg));
});
