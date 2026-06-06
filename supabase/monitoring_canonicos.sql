-- ============================================================
-- Monitoramento de qualidade dos nome_canonico
-- Economizei — rodar no SQL Editor do Supabase quando quiser auditar
--
-- PRÉ-REQUISITO: migration_categorias_precos.sql já rodada.
-- Filtro de data usa compras.data_compra (itens_compra não tem criado_em).
-- ============================================================


-- ============================================================
-- 1. VISÃO GERAL: cobertura e taxa de qualidade
-- Mostra quantos itens têm canonico OK, ausente, ou suspeito
-- ============================================================
SELECT
  COUNT(*)                                                           AS total_itens,
  COUNT(ic.nome_canonico)                                            AS com_canonico,
  COUNT(*) FILTER (WHERE ic.nome_canonico IS NULL)                   AS sem_canonico,

  -- ausente ou muito curto
  COUNT(*) FILTER (WHERE LENGTH(COALESCE(ic.nome_canonico,'')) < 3)  AS ausentes,

  -- muito longo (Gemini não simplificou)
  COUNT(*) FILTER (WHERE LENGTH(ic.nome_canonico) > 60)              AS muito_longos,

  -- igual ao nome original (sem normalização real)
  COUNT(*) FILTER (
    WHERE ic.nome_canonico IS NOT NULL
      AND LOWER(REGEXP_REPLACE(ic.nome, '[^A-Za-záéíóúãõçÁÉÍÓÚÃÕÇ\s0-9]', '', 'g')) = ic.nome_canonico
  )                                                                  AS iguais_ao_nome,

  -- cobertura geral (%)
  ROUND(
    100.0 * COUNT(ic.nome_canonico) FILTER (
      WHERE LENGTH(ic.nome_canonico) BETWEEN 3 AND 60
    ) / NULLIF(COUNT(*), 0)
  , 1)                                                               AS cobertura_pct

FROM itens_compra ic
JOIN compras c ON c.id = ic.compra_id
WHERE c.data_compra >= (CURRENT_DATE - INTERVAL '30 days');


-- ============================================================
-- 2. ITENS PROBLEMÁTICOS: lista os canonicos com defeito
-- Para revisar manualmente quais produtos precisam de atenção
-- ============================================================
SELECT
  ic.nome                                          AS nome_original,
  ic.nome_canonico,
  ic.categoria,
  ic.preco,
  c.loja,
  c.data_compra,
  CASE
    WHEN ic.nome_canonico IS NULL OR LENGTH(ic.nome_canonico) < 3
      THEN 'ausente'
    WHEN LENGTH(ic.nome_canonico) > 60
      THEN 'muito_longo'
    WHEN LOWER(REGEXP_REPLACE(ic.nome, '[^A-Za-záéíóúãõçÁÉÍÓÚÃÕÇ\s0-9]', '', 'g')) = ic.nome_canonico
      THEN 'igual_ao_nome'
    WHEN LENGTH(ic.nome) > 15
      AND LENGTH(ic.nome_canonico) > LENGTH(LOWER(ic.nome)) * 0.80
      THEN 'pouco_simplificado'
    ELSE 'ok'
  END AS qualidade
FROM itens_compra ic
JOIN compras c ON c.id = ic.compra_id
WHERE c.data_compra >= (CURRENT_DATE - INTERVAL '30 days')
  AND (
    ic.nome_canonico IS NULL
    OR LENGTH(ic.nome_canonico) < 3
    OR LENGTH(ic.nome_canonico) > 60
    OR LOWER(REGEXP_REPLACE(ic.nome, '[^A-Za-záéíóúãõçÁÉÍÓÚÃÕÇ\s0-9]', '', 'g')) = ic.nome_canonico
    OR (LENGTH(ic.nome) > 15 AND LENGTH(ic.nome_canonico) > LENGTH(LOWER(ic.nome)) * 0.80)
  )
ORDER BY c.data_compra DESC
LIMIT 100;


-- ============================================================
-- 3. DUPLICATAS POTENCIAIS em precos_mercado
-- Encontra pares de produto_canonico que provavelmente são o mesmo produto
-- mas receberam nomes ligeiramente diferentes do Gemini.
-- Executa quando tiver pelo menos 50 registros em precos_mercado.
-- ============================================================
WITH palavras AS (
  SELECT
    produto_canonico,
    palavra,
    COUNT(*)      AS ocorrencias,
    AVG(preco_unit) AS preco_medio
  FROM precos_mercado,
       UNNEST(STRING_TO_ARRAY(produto_canonico, ' ')) AS palavra
  WHERE data_obs >= (CURRENT_DATE - INTERVAL '60 days')
    AND LENGTH(palavra) > 3   -- ignora palavras curtas ("de", "em", "kg")
  GROUP BY produto_canonico, palavra
),
pares AS (
  SELECT
    a.produto_canonico AS canonico_a,
    b.produto_canonico AS canonico_b,
    COUNT(*) AS palavras_em_comum,
    a.preco_medio AS preco_a,
    b.preco_medio AS preco_b
  FROM palavras a
  JOIN palavras b
    ON a.palavra = b.palavra
    AND a.produto_canonico < b.produto_canonico  -- evita pares duplicados
  GROUP BY a.produto_canonico, b.produto_canonico, a.preco_medio, b.preco_medio
  HAVING COUNT(*) >= 2
)
SELECT
  canonico_a,
  canonico_b,
  palavras_em_comum,
  ROUND(preco_a::numeric, 2) AS preco_medio_a,
  ROUND(preco_b::numeric, 2) AS preco_medio_b,
  ROUND(ABS(preco_a - preco_b)::numeric, 2) AS diff_preco
FROM pares
WHERE canonico_a <> canonico_b
ORDER BY palavras_em_comum DESC, diff_preco ASC
LIMIT 50;


-- ============================================================
-- 4. TOP produtos com mais variações de nome_canonico
-- Mostra produtos que provavelmente são o mesmo mas têm canonicos diferentes
-- Útil para criar um dicionário de correção manual
-- ============================================================
WITH base AS (
  SELECT
    ARRAY_TO_STRING(
      (STRING_TO_ARRAY(ic.nome_canonico, ' '))[1:2], ' '
    ) AS raiz,
    ic.nome_canonico,
    COUNT(*)      AS qtd_registros,
    AVG(ic.preco) AS preco_medio
  FROM itens_compra ic
  JOIN compras c ON c.id = ic.compra_id
  WHERE ic.nome_canonico IS NOT NULL
    AND LENGTH(ic.nome_canonico) BETWEEN 4 AND 60
    AND c.data_compra >= (CURRENT_DATE - INTERVAL '60 days')
  GROUP BY raiz, ic.nome_canonico
)
SELECT
  raiz,
  COUNT(DISTINCT nome_canonico) AS variacoes,
  ARRAY_AGG(nome_canonico ORDER BY qtd_registros DESC) AS canonicos,
  SUM(qtd_registros) AS total_registros
FROM base
GROUP BY raiz
HAVING COUNT(DISTINCT nome_canonico) > 1
ORDER BY variacoes DESC, total_registros DESC
LIMIT 30;


-- ============================================================
-- 5. CORREÇÃO MANUAL de canonico
-- Use quando identificar um canonico errado na query 2 ou 3.
-- Substitui em itens_compra E em precos_mercado de uma vez.
-- ============================================================
-- Exemplo: corrigir "leite 1 litro" → "leite integral 1l"
-- Descomente, substitua os valores e execute:

-- BEGIN;
--   UPDATE itens_compra
--     SET nome_canonico = 'leite integral 1l'
--     WHERE nome_canonico = 'leite 1 litro';
--
--   UPDATE precos_mercado
--     SET produto_canonico = 'leite integral 1l'
--     WHERE produto_canonico = 'leite 1 litro';
--
-- COMMIT;

-- ============================================================
