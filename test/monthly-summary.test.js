// test/monthly-summary.test.js — cobertura do resumo mensal (las-03).
//
// POR QUE ESTE ARQUIVO EXISTE: com o reengajamento desligado (cod-0068), o
// resumo de fim de mês virou a ÚNICA mensagem proativa do produto — e não
// tinha um único teste. Era exatamente o perfil do `reengagement.js`, que
// ficou semanas morto sem ninguém ver.
//
// O que se testa aqui é o ORQUESTRADOR: quem é pulado, o que é enviado, em
// que ordem, o que degrada em silêncio e o que conta como erro. As funções
// puras que ele chama (montarResumoMensal, calcularEconomia,
// buscarGastoSuperfluo, gerarUrlGraficoCategorias) têm testes próprios e aqui
// são substituídas por dublês — o objeto deste arquivo é a costura, não elas.
//
// Nada aqui vai à rede nem ao banco: todas as dependências são injetadas pelo
// 3º parâmetro opcional de executarResumoMensal.
//
// Rodar: node --test

'use strict';

// monthlySummary.js requer supabase.js, que cria o client no require — env
// dummy só pra carga (mesmo padrão do webhook-dedup.test.js).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'chave-dummy-teste';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { executarResumoMensal, calcularMesAnterior } = require('../src/monthlySummary.js');

const MES = '2026-08';
const PHONE = '5517999999999';

// ── fábrica de dependências ─────────────────────────────────────────────────
// Padrão: um usuário ativo, com dados, que ainda não recebeu o resumo — o
// caminho feliz completo. Cada teste sobrescreve só o que lhe interessa.

function dadosMes(extra = {}) {
  return { qtdCompras: 4, totalGasto: 812.35, ...extra };
}

function fazerDeps(over = {}) {
  const c = {
    ordem: [],
    enviarMensagem: [],
    enviarImagem: [],
    marcarResumoEnviado: [],
    montarResumoMensal: [],
    buscarGastosPorCategoria: 0,
    gerarUrlGraficoCategorias: [],
    dormir: [],
  };

  const deps = {
    listarUsuariosAtivosNoMes: async () => {
      c.ordem.push('listarUsuariosAtivosNoMes');
      return [PHONE];
    },
    verificarResumoJaEnviado: async () => {
      c.ordem.push('verificarResumoJaEnviado');
      return false;
    },
    buscarComprasDoMes: async (_phone, mes) => {
      c.ordem.push(`buscarComprasDoMes:${mes}`);
      return dadosMes();
    },
    buscarTotaisMensais: async () => {
      c.ordem.push('buscarTotaisMensais');
      return [{ mes: '2026-07', total: 900 }, { mes: MES, total: 812.35 }];
    },
    calcularEconomia: () => ({ valor: 87.65 }),
    buscarGastosPorCategoria: async () => {
      c.ordem.push('buscarGastosPorCategoria');
      c.buscarGastosPorCategoria++;
      return [{ categoria: 'mercearia', total: 500 }, { categoria: 'bebidas', total: 312.35 }];
    },
    buscarCategoriasSuperfluas: async () => {
      c.ordem.push('buscarCategoriasSuperfluas');
      return ['bebidas'];
    },
    buscarGastoSuperfluo: () => ({ categoria: 'bebidas', total: 312.35 }),
    montarResumoMensal: (...args) => {
      c.ordem.push('montarResumoMensal');
      c.montarResumoMensal.push(args);
      return 'TEXTO DO RESUMO';
    },
    enviarMensagem: async (phone, texto) => {
      c.ordem.push('enviarMensagem');
      c.enviarMensagem.push({ phone, texto });
    },
    marcarResumoEnviado: async (...args) => {
      c.ordem.push('marcarResumoEnviado');
      c.marcarResumoEnviado.push(args);
    },
    nomeDoMes: () => 'agosto',
    gerarUrlGraficoCategorias: (dados, titulo) => {
      c.ordem.push('gerarUrlGraficoCategorias');
      c.gerarUrlGraficoCategorias.push({ dados, titulo });
      return 'https://quickchart.io/chart?c=fake';
    },
    enviarImagem: async (phone, url, legenda) => {
      c.ordem.push('enviarImagem');
      c.enviarImagem.push({ phone, url, legenda });
    },
    dormir: async (ms) => {
      c.ordem.push(`dormir:${ms}`);
      c.dormir.push(ms);
    },
    ...over,
  };

  return { deps, c };
}

// ── calcularMesAnterior (função pura) ───────────────────────────────────────

test('calcularMesAnterior: mês do meio do ano', () => {
  assert.equal(calcularMesAnterior('2026-08'), '2026-07');
});

test('calcularMesAnterior: janeiro volta pra dezembro do ano anterior', () => {
  assert.equal(calcularMesAnterior('2026-01'), '2025-12');
});

test('calcularMesAnterior: preserva o zero à esquerda (out → set)', () => {
  // Se o padStart sumir, sai '2026-9' e a query do banco não casa com nada.
  assert.equal(calcularMesAnterior('2026-10'), '2026-09');
  assert.equal(calcularMesAnterior('2026-02'), '2026-01');
});

// ── caminho feliz ───────────────────────────────────────────────────────────

test('caminho feliz: envia texto, marca como enviado e manda o gráfico — nesta ordem', async () => {
  const { deps, c } = fazerDeps();
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  assert.equal(c.enviarMensagem.length, 1);
  assert.equal(c.enviarMensagem[0].texto, 'TEXTO DO RESUMO');

  // A ordem importa: marcar ANTES do gráfico é o que garante que uma falha no
  // gráfico não faça o resumo ser reenviado no mês seguinte.
  const iEnvio = c.ordem.indexOf('enviarMensagem');
  const iMarca = c.ordem.indexOf('marcarResumoEnviado');
  const iImg = c.ordem.indexOf('enviarImagem');
  assert.ok(iEnvio < iMarca, 'texto sai antes de marcar');
  assert.ok(iMarca < iImg, 'marca antes de mandar o gráfico');
});

test('caminho feliz: marcarResumoEnviado recebe a contagem e o total do mês', async () => {
  const { deps, c } = fazerDeps();
  await executarResumoMensal(MES, null, deps);

  assert.deepEqual(c.marcarResumoEnviado[0], [PHONE, MES, 4, 812.35]);
});

test('caminho feliz: compara o mês de referência com o mês ANTERIOR', async () => {
  const { deps, c } = fazerDeps();
  await executarResumoMensal(MES, null, deps);

  assert.ok(c.ordem.includes('buscarComprasDoMes:2026-08'));
  assert.ok(c.ordem.includes('buscarComprasDoMes:2026-07'));
});

test('caminho feliz: respeita os dois delays (800ms do gráfico, 1000ms de throttle)', async () => {
  const { deps, c } = fazerDeps();
  await executarResumoMensal(MES, null, deps);

  assert.deepEqual(c.dormir, [800, 1000]);
});

// ── reuso do dadosCat (critério explícito do las-03) ────────────────────────

test('as categorias são buscadas UMA vez e o mesmo array vai pro gráfico', async () => {
  // O bloco de supérfluo e o gráfico usam a mesma leitura. Se alguém separar
  // as duas, vira uma query a mais por usuário em todo fim de mês.
  const { deps, c } = fazerDeps();
  await executarResumoMensal(MES, null, deps);

  assert.equal(c.buscarGastosPorCategoria, 1, 'uma única leitura de categorias');
  assert.equal(c.gerarUrlGraficoCategorias.length, 1);
  assert.deepEqual(c.gerarUrlGraficoCategorias[0].dados, [
    { categoria: 'mercearia', total: 500 },
    { categoria: 'bebidas', total: 312.35 },
  ]);
  assert.equal(c.gerarUrlGraficoCategorias[0].titulo, 'agosto');
});

test('legenda do gráfico usa o nome do mês, não o código', async () => {
  const { deps, c } = fazerDeps();
  await executarResumoMensal(MES, null, deps);

  assert.match(c.enviarImagem[0].legenda, /agosto/);
  assert.ok(!c.enviarImagem[0].legenda.includes('2026-08'));
});

// ── quem é pulado ───────────────────────────────────────────────────────────

test('pula quem já recebeu o resumo do mês (não manda duas vezes)', async () => {
  const { deps, c } = fazerDeps({ verificarResumoJaEnviado: async () => true });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 0, pulados: 1, erros: 0 });
  assert.equal(c.enviarMensagem.length, 0);
});

test('pula mês sem compra — nunca manda resumo vazio', async () => {
  const { deps, c } = fazerDeps({ buscarComprasDoMes: async () => null });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 0, pulados: 1, erros: 0 });
  assert.equal(c.enviarMensagem.length, 0);
  assert.equal(c.marcarResumoEnviado.length, 0);
});

test('mês com compras mas sem categorias: manda o texto e NÃO manda gráfico', async () => {
  const { deps, c } = fazerDeps({ buscarGastosPorCategoria: async () => [] });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  assert.equal(c.enviarMensagem.length, 1);
  assert.equal(c.enviarImagem.length, 0);
  assert.deepEqual(c.dormir, [1000], 'sem gráfico, sem o delay de 800ms');
});

test('gráfico sem URL (dados que o QuickChart recusa) não vira imagem em branco', async () => {
  const { deps, c } = fazerDeps({ gerarUrlGraficoCategorias: () => null });
  await executarResumoMensal(MES, null, deps);

  assert.equal(c.enviarImagem.length, 0);
});

// ── degradação segura (o resumo tem que sair mesmo assim) ───────────────────

test('erro na economia degrada pra null — o resumo sai assim mesmo', async () => {
  const { deps, c } = fazerDeps({
    buscarTotaisMensais: async () => { throw new Error('banco fora'); },
  });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  const [, , , economia] = c.montarResumoMensal[0];
  assert.equal(economia, null);
});

test('erro no supérfluo degrada pra null e ainda derruba o gráfico (dadosCat não veio)', async () => {
  const { deps, c } = fazerDeps({
    buscarGastosPorCategoria: async () => { throw new Error('timeout'); },
  });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  const [, , , , superfluo] = c.montarResumoMensal[0];
  assert.equal(superfluo, null);
  assert.equal(c.enviarImagem.length, 0);
});

test('falha no gráfico NÃO desfaz o resumo já marcado como enviado', async () => {
  const { deps, c } = fazerDeps({
    enviarImagem: async () => { throw new Error('Z-API 500'); },
  });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  assert.equal(c.marcarResumoEnviado.length, 1);
});

// ── erros de verdade ────────────────────────────────────────────────────────

test('falha no envio do texto conta como erro e NÃO marca como enviado', async () => {
  // Marcar sem ter enviado é o pior desfecho possível: o usuário perde o
  // resumo do mês e nada tenta de novo.
  const { deps, c } = fazerDeps({
    enviarMensagem: async () => { throw new Error('Z-API fora do ar'); },
  });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 0, pulados: 0, erros: 1 });
  assert.equal(c.marcarResumoEnviado.length, 0);
});

test('um usuário quebrado não derruba a fila inteira', async () => {
  const outro = '5517888888888';
  const { deps, c } = fazerDeps({
    listarUsuariosAtivosNoMes: async () => [PHONE, outro],
    enviarMensagem: async (phone, texto) => {
      if (phone === PHONE) throw new Error('numero invalido');
      c.enviarMensagem.push({ phone, texto });
    },
  });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 1 });
  assert.equal(c.enviarMensagem.length, 1);
  assert.equal(c.enviarMensagem[0].phone, outro);
});

test('lista vazia de ativos: nada é enviado e o retorno é zerado', async () => {
  const { deps, c } = fazerDeps({ listarUsuariosAtivosNoMes: async () => [] });
  const r = await executarResumoMensal(MES, null, deps);

  assert.deepEqual(r, { enviados: 0, pulados: 0, erros: 0 });
  assert.equal(c.enviarMensagem.length, 0);
});

// ── modo phone específico (usado pelo comando manual em index.js) ───────────

test('phone específico não consulta a lista de ativos', async () => {
  const { deps, c } = fazerDeps({
    listarUsuariosAtivosNoMes: async () => {
      throw new Error('não deveria ser chamado com phone específico');
    },
  });
  const r = await executarResumoMensal(MES, PHONE, deps);

  assert.deepEqual(r, { enviados: 1, pulados: 0, erros: 0 });
  assert.equal(c.enviarMensagem[0].phone, PHONE);
  assert.ok(!c.ordem.includes('listarUsuariosAtivosNoMes'));
});

test('phone específico ainda respeita o "já enviado" (nada de reenvio manual silencioso)', async () => {
  const { deps, c } = fazerDeps({ verificarResumoJaEnviado: async () => true });
  const r = await executarResumoMensal(MES, PHONE, deps);

  assert.deepEqual(r, { enviados: 0, pulados: 1, erros: 0 });
  assert.equal(c.enviarMensagem.length, 0);
});

// ── retrocompatibilidade da assinatura ──────────────────────────────────────

test('a assinatura antiga continua valendo (deps é o 3º parâmetro OPCIONAL)', () => {
  // Os dois call sites de produção chamam com 1 (scheduler) e 2 (index)
  // argumentos. Se alguém trocar a ordem dos parâmetros, isto quebra.
  assert.equal(executarResumoMensal.length, 1); // só mesReferencia é obrigatório
});
