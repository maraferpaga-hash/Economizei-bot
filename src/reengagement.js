// ---------------------------------------------------------------
// Reengajamento — lembretes proativos para usuários inativos.
// Tom de amizade, nunca de cobrança (decisão 2026-06-02, CLAUDE.md §11).
// Disparado por cron diário às 10h (America/Sao_Paulo) via scheduler.js.
//
// Segmentos e prioridade de envio: D > C > B > A
//   A — nunca mandou cupom (onboarding):           onboarding_d2, onboarding_d7
//   B — mandou cupom mas sumiu (inatividade):      inativo_d3, _d10, _d30, _d60
//   C — fim de mês com cupons abertos (teaser):    fim_mes_d26 (só dias 26–27)
//   D — perto do limite gratuito (8/10 cupons):    limite_aviso_8
//
// Regras:
//   - Máx. 50 usuários por segmento por execução (protege o Z-API).
//   - 1.5s de delay entre cada envio (rate limit do Z-API).
//   - No máx. 1 lembrete por usuário por execução (prioridade D > C > B > A).
//   - Nunca duplica: checa lembretes_enviados antes de enviar.
//   - Erro em um usuário não para o loop — captura, loga e continua.
// ---------------------------------------------------------------

const { log, maskPhone } = require('./logger');
const { enviarMensagem } = require('./zapi');
const supabase = require('./supabase');
const formatter = require('./formatter');

const MAX_POR_SEGMENTO = 50;
const DELAY_ENTRE_ENVIOS_MS = 1500;

function _sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Monta a lista de tarefas de envio, já em ordem de prioridade (D > C > B > A).
// Cada tarefa: { phone, lembreteId, mesRef, texto }.
// Falha de um segmento é logada mas não derruba os demais.
async function _montarTarefas() {
  const mesAtual = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const diaDoMes = new Date().getDate();
  const tarefas = [];

  // --- Segmento D — limite gratuito (8/10) ---
  try {
    const elegiveis = (await supabase.buscarElegiveisLimiteAviso()).slice(0, MAX_POR_SEGMENTO);
    for (const u of elegiveis) {
      tarefas.push({
        phone: u.phone_number,
        lembreteId: 'limite_aviso_8',
        mesRef: mesAtual,
        texto: formatter.montarLembreteLimite8(),
      });
    }
  } catch (err) {
    log('reengajamento_segmento_erro', { segmento: 'D', erro: err.message });
  }

  // --- Segmento C — fim de mês (somente dias 26 e 27) ---
  // Teaser que antecede o resumo mensal automático (último dia do mês, scheduler.js).
  if (diaDoMes === 26 || diaDoMes === 27) {
    try {
      const elegiveis = (await supabase.buscarElegiveisFinsDeMes()).slice(0, MAX_POR_SEGMENTO);
      for (const u of elegiveis) {
        tarefas.push({
          phone: u.phone_number,
          lembreteId: 'fim_mes_d26',
          mesRef: mesAtual,
          texto: formatter.montarLembreteFimMes(u.compras_mes_atual ?? 0),
        });
      }
    } catch (err) {
      log('reengajamento_segmento_erro', { segmento: 'C', erro: err.message });
    }
  }

  // --- Segmento B — inatividade (ciclo único, mesRef = null) ---
  const inativos = [
    { dias: 3,  id: 'inativo_d3',  texto: () => formatter.montarLembreteInativoD3() },
    { dias: 10, id: 'inativo_d10', texto: (u) => formatter.montarLembreteInativoD10(u.compras_mes_atual ?? 0) },
    { dias: 30, id: 'inativo_d30', texto: () => formatter.montarLembreteInativoD30() },
    { dias: 60, id: 'inativo_d60', texto: () => formatter.montarLembreteInativoD60() },
  ];
  for (const cfg of inativos) {
    try {
      const elegiveis = (await supabase.buscarElegiveisInativos(cfg.dias)).slice(0, MAX_POR_SEGMENTO);
      for (const u of elegiveis) {
        tarefas.push({ phone: u.phone_number, lembreteId: cfg.id, mesRef: null, texto: cfg.texto(u) });
      }
    } catch (err) {
      log('reengajamento_segmento_erro', { segmento: `B:${cfg.id}`, erro: err.message });
    }
  }

  // --- Segmento A — onboarding (ciclo único, mesRef = null) ---
  const onboarding = [
    { dias: 2, id: 'onboarding_d2', texto: () => formatter.montarLembreteOnboardingD2() },
    { dias: 7, id: 'onboarding_d7', texto: () => formatter.montarLembreteOnboardingD7() },
  ];
  for (const cfg of onboarding) {
    try {
      const elegiveis = (await supabase.buscarElegiveisOnboarding(cfg.dias)).slice(0, MAX_POR_SEGMENTO);
      for (const u of elegiveis) {
        tarefas.push({ phone: u.phone_number, lembreteId: cfg.id, mesRef: null, texto: cfg.texto(u) });
      }
    } catch (err) {
      log('reengajamento_segmento_erro', { segmento: `A:${cfg.id}`, erro: err.message });
    }
  }

  return tarefas;
}

async function executarReengajamento() {
  const tarefas = await _montarTarefas();

  const jaContatados = new Set(); // 1 lembrete por usuário por execução
  let enviados = 0;
  let skipped = 0;
  let erros = 0;

  for (const t of tarefas) {
    // Já recebeu lembrete de maior prioridade nesta execução → ignora silenciosamente
    if (jaContatados.has(t.phone)) continue;

    try {
      const jaEnviado = await supabase.lembreteFoiEnviado(t.phone, t.lembreteId, t.mesRef);
      if (jaEnviado) {
        skipped++;
        continue;
      }

      await enviarMensagem(t.phone, t.texto);
      await supabase.registrarLembreteEnviado(t.phone, t.lembreteId, t.mesRef);

      jaContatados.add(t.phone);
      enviados++;
      log('reengajamento_enviado', { phone: maskPhone(t.phone), lembrete: t.lembreteId });

      await _sleep(DELAY_ENTRE_ENVIOS_MS);
    } catch (err) {
      erros++;
      log('reengajamento_envio_erro', { phone: maskPhone(t.phone), lembrete: t.lembreteId, erro: err.message });
    }
  }

  log('reengajamento_resumo', { enviados, skipped, erros, tarefas: tarefas.length });
  return { enviados, skipped, erros };
}

module.exports = { executarReengajamento };
