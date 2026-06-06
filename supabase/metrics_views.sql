-- ============================================================
-- VIEWS DE MÉTRICAS — Economizei
-- Cole no SQL Editor do Supabase: Database → SQL Editor → New Query
-- Execute uma vez; as views ficam disponíveis permanentemente.
--
-- ATENÇÃO: Ajuste os nomes de colunas se necessário:
--   - 'created_at' em 'usuarios' é o nome padrão do Supabase.
--     Se você usou 'criado_em', substitua abaixo.
--   - 'data_compra' em 'compras' é a data da compra (YYYY-MM-DD).
--   - 'criado_em' em 'compras' é o timestamp de inserção.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Dashboard principal — tudo em uma linha
--    Acesse em: Table Editor → v_dashboard
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_dashboard AS
SELECT
  (SELECT COUNT(*) FROM usuarios)                                                      AS total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE created_at >= NOW() - INTERVAL '30 days')      AS novos_30d,
  (SELECT COUNT(*) FROM usuarios WHERE created_at >= NOW() - INTERVAL '7 days')       AS novos_7d,
  (SELECT COUNT(*) FROM usuarios WHERE created_at::date = CURRENT_DATE)               AS novos_hoje,
  (SELECT COUNT(*) FROM usuarios WHERE is_pro = true)                                  AS pagantes,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra = CURRENT_DATE)                                                   AS dau,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra >= CURRENT_DATE - INTERVAL '7 days')                             AS wau,
  (SELECT COUNT(DISTINCT phone_number) FROM compras
   WHERE data_compra >= CURRENT_DATE - INTERVAL '30 days')                            AS mau,
  (SELECT COUNT(*) FROM compras
   WHERE TO_CHAR(data_compra, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM'))          AS cupons_mes_atual,
  (SELECT COUNT(*) FROM compras)                                                        AS cupons_total,
  (SELECT COUNT(*) FROM usuarios
   WHERE is_pro = false
     AND compras_mes_atual >= 10
     AND (mes_referencia IS NULL
       OR mes_referencia = TO_CHAR(CURRENT_DATE, 'YYYY-MM')))                         AS usuarios_no_limite,
  NOW() AS atualizado_em;

-- ------------------------------------------------------------
-- 2. Retenção W2
--    Mede % de usuários que mandou cupom na semana 2 (dias 8–14)
--    após o cadastro — métrica crítica de validação de hábito.
--    Considera apenas usuários cadastrados nos últimos 90 dias.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_retencao_w2 AS
WITH cohort AS (
  SELECT
    phone_number,
    created_at::date AS data_cadastro
  FROM usuarios
  WHERE created_at >= NOW() - INTERVAL '90 days'
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
  '90 dias anteriores'                                                          AS janela;

-- ------------------------------------------------------------
-- 3. Cupons e usuários ativos por mês (histórico)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_cupons_por_mes AS
SELECT
  TO_CHAR(data_compra, 'YYYY-MM')           AS mes,
  COUNT(*)                                   AS total_cupons,
  COUNT(DISTINCT phone_number)               AS usuarios_ativos,
  ROUND(AVG(total::numeric), 2)              AS ticket_medio,
  SUM(total::numeric)                        AS volume_total_r$
FROM compras
GROUP BY 1
ORDER BY 1 DESC;

-- ------------------------------------------------------------
-- 4. Funil de conversão simples
--    Cadastrados → Mandaram ≥1 cupom → Mandaram ≥3 cupons → Pro
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_funil_conversao AS
WITH niveis AS (
  SELECT
    u.phone_number,
    u.is_pro,
    COUNT(c.id) AS total_cupons
  FROM usuarios u
  LEFT JOIN compras c ON c.phone_number = u.phone_number
  GROUP BY u.phone_number, u.is_pro
)
SELECT
  COUNT(*)                                             AS cadastrados,
  COUNT(*) FILTER (WHERE total_cupons >= 1)            AS mandaram_1_cupom,
  COUNT(*) FILTER (WHERE total_cupons >= 3)            AS mandaram_3_cupons,
  COUNT(*) FILTER (WHERE is_pro = true)                AS convertidos_pro,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE total_cupons >= 1)
          / NULLIF(COUNT(*), 0), 1
  )                                                    AS pct_ativacao,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_pro = true)
          / NULLIF(COUNT(*) FILTER (WHERE total_cupons >= 1), 0), 1
  )                                                    AS pct_conversao_pro;

-- ------------------------------------------------------------
-- 5. Novos usuários por semana (últimas 12 semanas)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_novos_por_semana AS
SELECT
  DATE_TRUNC('week', created_at)::date   AS semana_inicio,
  COUNT(*)                                AS novos_usuarios
FROM usuarios
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1 DESC;

-- ------------------------------------------------------------
-- 6. Usuários inativos (cadastraram mas nunca mandaram cupom)
--    Útil para o segmento A do reengajamento
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_usuarios_sem_cupom AS
SELECT
  u.phone_number,
  u.created_at::date AS data_cadastro,
  NOW()::date - u.created_at::date AS dias_desde_cadastro
FROM usuarios u
LEFT JOIN compras c ON c.phone_number = u.phone_number
WHERE c.phone_number IS NULL
ORDER BY u.created_at DESC;

-- ------------------------------------------------------------
-- 7. Usuários ativos que sumiram (mandaram cupom, depois pararam)
--    Útil para o segmento B do reengajamento
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_usuarios_inativos AS
SELECT
  phone_number,
  MAX(data_compra)                         AS ultima_compra,
  NOW()::date - MAX(data_compra)           AS dias_sem_compra,
  COUNT(*)                                  AS total_cupons_historico
FROM compras
GROUP BY phone_number
HAVING MAX(data_compra) < CURRENT_DATE - INTERVAL '7 days'
ORDER BY MAX(data_compra) ASC;
