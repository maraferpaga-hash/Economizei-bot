/**
 * metrics.js — Consulta de métricas do Economizei via Supabase
 *
 * Depende das views criadas em supabase/metrics_views.sql.
 * Usa SUPABASE_SERVICE_ROLE_KEY para ter acesso de leitura às views
 * mesmo com RLS ativo.
 */

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { log } = require('./logger');

// Service role key: bypassa RLS, nunca exposta ao cliente.
// Fallback para anon key durante transição (remover quando RLS estiver ativo).
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { realtime: { transport: ws } }
);

/**
 * Retorna o dashboard principal — todas as métricas-chave em um objeto.
 */
async function buscarDashboard() {
  const { data, error } = await supabase
    .from('v_dashboard')
    .select('*')
    .single();
  if (error) throw new Error(`v_dashboard: ${error.message}`);
  return data;
}

/**
 * Retorna a métrica de retenção W2.
 */
async function buscarRetencaoW2() {
  const { data, error } = await supabase
    .from('v_retencao_w2')
    .select('*')
    .single();
  if (error) throw new Error(`v_retencao_w2: ${error.message}`);
  return data;
}

/**
 * Retorna histórico de cupons por mês (últimos 6 meses).
 */
async function buscarCuponsPorMes(limite = 6) {
  const { data, error } = await supabase
    .from('v_cupons_por_mes')
    .select('*')
    .limit(limite);
  if (error) throw new Error(`v_cupons_por_mes: ${error.message}`);
  return data;
}

/**
 * Retorna o funil de conversão (cadastro → ativação → pro).
 */
async function buscarFunil() {
  const { data, error } = await supabase
    .from('v_funil_conversao')
    .select('*')
    .single();
  if (error) throw new Error(`v_funil_conversao: ${error.message}`);
  return data;
}

/**
 * Loga as métricas diárias no stdout (Railway captura e indexa).
 * Chamado pelo scheduler às 7h todo dia.
 */
async function logarMetricasDiarias() {
  try {
    const [dashboard, w2] = await Promise.all([
      buscarDashboard(),
      buscarRetencaoW2(),
    ]);

    log('metricas_diarias', {
      total_usuarios:    dashboard.total_usuarios,
      novos_7d:          dashboard.novos_7d,
      novos_hoje:        dashboard.novos_hoje,
      pagantes:          dashboard.pagantes,
      dau:               dashboard.dau,
      wau:               dashboard.wau,
      mau:               dashboard.mau,
      cupons_mes:        dashboard.cupons_mes_atual,
      usuarios_no_limite: dashboard.usuarios_no_limite,
      retencao_w2_pct:   w2.retencao_w2_pct,
      usuarios_w2:       w2.usuarios_retidos_w2,
      cohort_w2:         w2.usuarios_cohort,
    });

    return { dashboard, w2 };
  } catch (err) {
    log('metricas_erro', { fn: 'logarMetricasDiarias', erro: err.message });
    throw err;
  }
}

/**
 * Retorna todas as métricas consolidadas.
 * Usado pelo endpoint GET /admin/metrics.
 */
async function buscarTodasMetricas() {
  const [dashboard, w2, porMes, funil] = await Promise.all([
    buscarDashboard().catch(err => ({ erro: err.message })),
    buscarRetencaoW2().catch(err => ({ erro: err.message })),
    buscarCuponsPorMes().catch(err => ({ erro: err.message })),
    buscarFunil().catch(err => ({ erro: err.message })),
  ]);

  return { dashboard, retencao_w2: w2, cupons_por_mes: porMes, funil };
}

module.exports = {
  buscarDashboard,
  buscarRetencaoW2,
  buscarCuponsPorMes,
  buscarFunil,
  logarMetricasDiarias,
  buscarTodasMetricas,
};
