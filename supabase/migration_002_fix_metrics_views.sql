-- =============================================================
-- Migration 002 — Corrige as views de métricas
-- =============================================================
-- PROBLEMA: supabase/metrics_views.sql referencia a coluna
-- usuarios.created_at, mas o schema real (supabase/schema.sql)
-- define a coluna como usuarios.criado_em. Resultado: todas as
-- views que contam cadastros (v_dashboard, v_retencao_w2,
-- v_novos_por_semana, v_usuarios_sem_cupom) quebram silenciosamente,
-- e o cron de métricas das 7h loga 'metricas_erro' todo dia.
--
-- Esta migration recria essas views usando criado_em.
--
-- COMO USAR:
--   1. Rode primeiro o PASSO 0 (diagnóstico) pra confirmar o nome real.
--   2. Se o diagnóstico mostrar 'criado_em', rode o resto deste arquivo.
--      Se mostrar 'created_at', as views originais já funcionam e você
--      NÃO precisa desta migration (me avise pra eu inverter).
--   Supabase: Database → SQL Editor → New Query → cole → Run.
-- =============================================================

-- -------------------------------------------------------------
-- PASSO 0 — DIAGNÓSTICO (rode isolado primeiro)
-- Mostra qual coluna de data de cadastro existe de fato.
-- -------------------------------------------------------------
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'usuarios'
--   AND column_name IN ('criado_em', 'created_at');

-- -------------------------------------------------------------
-- 1. Dashboard principal — tudo em uma linha
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_dashboard AS
SELECT
  (SELECT COUNT(*) FROM usuarios)                                                AS total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE criado_em >= NOW() - INTERVAL '30 days')  AS novos_30d,
  (SELECT COUNT(*) FROM usuarios WHERE criado_em >= NOW() - INTERVAL '7 days')   AS novos_7d,
  (SELECT COUNT(*) FROM usuarios WHERE criado_em::date = CURRENT_DATE)           AS novos_hoje,
  (SELECT COUNT(*) FROM usuarios WHERE is_pro = true)                            AS pagantes,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra = CURRENT_DATE)                                             AS dau,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra >= CURRENT_DATE - INTERVAL '7 days')                        AS wau,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra >= CURRENT_DATE - INTERVAL '30 days')                       AS mau,
  (SELECT COUNT(*) FROM compras
   WHERE TO_CHAR(data_compra, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM'))     AS cupons_mes_atual,
  (SELECT COUNT(*) FROM compras)                                                  AS cupons_total,
  (SELECT COUNT(*) FROM usuarios
   WHERE is_pro = false
     AND compras_mes_atual >= 10
     AND (mes_referencia IS NULL
       OR mes_referencia = TO_CHAR(CURRENT_DATE, 'YYYY-MM')))                    AS usuarios_no_limite,
  NOW() AS atualizado_em;

-- -------------------------------------------------------------
-- 2. Retenção W2 (dias 8–14 após o cadastro)
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_retencao_w2 AS
WITH cohort AS (
  SELECT
    phone_number,
    criado_em::date AS data_cadastro
  FROM usuarios
  WHERE criado_em >= NOW() - INTERVAL '90 days'
),
w2_activity AS (
  SELECT DISTINCT c.phone_number
  FROM compras cp
  JOIN cohort c ON cp.phone_number = c.phone_number
  WHERE cp.data_compra BETWEEN (c.data_cadastro + INTERVAL '7 days')::date
                            AND (c.data_cadastro + INTERVAL '14 days')::date
)
SELECT
  COUNT(DISTINCT cohort.phone_number)                                          AS usuarios_cohort,
  COUNT(DISTINCT w2_activity.phone_number)                                     AS usuarios_retidos_w2,
  ROUND(
    100.0 * COUNT(DISTINCT w2_activity.phone_number)
          / NULLIF(COUNT(DISTINCT cohort.phone_number), 0),
    1
  )                                                                             AS retencao_w2_pct,
  '90 dias anteriores'                                                          AS janela
FROM cohort
LEFT JOIN w2_activity ON cohort.phone_number = w2_activity.phone_number;

-- -------------------------------------------------------------
-- 5. Novos usuários por semana (últimas 12 semanas)
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_novos_por_semana AS
SELECT
  DATE_TRUNC('week', criado_em)::date    AS semana_inicio,
  COUNT(*)                                AS novos_usuarios
FROM usuarios
WHERE criado_em >= NOW() - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1 DESC;

-- -------------------------------------------------------------
-- 6. Usuários inativos (cadastraram mas nunca mandaram cupom)
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_usuarios_sem_cupom AS
SELECT
  u.phone_number,
  u.criado_em::date AS data_cadastro,
  NOW()::date - u.criado_em::date AS dias_desde_cadastro
FROM usuarios u
LEFT JOIN compras c ON c.phone_number = u.phone_number
WHERE c.phone_number IS NULL
ORDER BY u.criado_em DESC;

-- =============================================================
-- CONSULTA DE CADASTROS NOVOS (ad-hoc) — Tarefa do roadmap
-- Os "3 números": cadastros novos sai daqui; uptime do UptimeRobot;
-- visitas do Vercel Analytics.
-- =============================================================
-- SELECT
--   COUNT(*) FILTER (WHERE criado_em >= NOW() - INTERVAL '7 days') AS novos_7d,
--   COUNT(*) FILTER (WHERE criado_em::date = CURRENT_DATE)         AS novos_hoje,
--   COUNT(*)                                                        AS total_cadastros
-- FROM usuarios;
