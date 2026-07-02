-- =====================================================================
-- Migration A9 — guarda o CNPJ no nível da compra
-- =====================================================================
-- Problema: o CNPJ é extraído pelo Gemini (gemini.js) e passado adiante,
-- mas o salvarCompra NUNCA o gravava na tabela `compras` — só ia, anônimo,
-- pra `precos_mercado`. A coluna `compras.cnpj` prepara o comparativo entre
-- mercados (cod-0020): permite agrupar as compras do usuário por loja+CNPJ.
--
-- Acompanha um ajuste de código (fora desta migration, já feito):
--   src/supabase.js › salvarCompra — passa a inserir `cnpj` no INSERT de compras.
--
-- Idempotente. Não altera nenhuma linha existente (cupons antigos ficam com
-- cnpj = NULL; passam a preencher a partir do próximo cupom lido).
-- =====================================================================

ALTER TABLE compras ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Índice pro comparativo (agrupar compras por CNPJ da loja).
CREATE INDEX IF NOT EXISTS idx_compras_cnpj ON compras (cnpj);

-- Verificação (deve retornar 1 linha):
-- select column_name from information_schema.columns
-- where table_schema='public' and table_name='compras' and column_name='cnpj';
