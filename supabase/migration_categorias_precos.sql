-- ============================================================
-- Migration: Categorias + Preços de Mercado
-- Economizei — 2026-06-02
-- Rodar no SQL Editor do Supabase (uma vez)
-- ============================================================

-- 1. Adiciona categoria e nome_canonico em itens_compra
--    (NULL em compras antigas — ok, o app só usa em compras futuras)
ALTER TABLE itens_compra
  ADD COLUMN IF NOT EXISTS categoria     text,
  ADD COLUMN IF NOT EXISTS nome_canonico text;

-- 2. Adiciona opt_out_precos em usuarios
--    (false por padrão — usuário participa, pode sair a qualquer momento)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS opt_out_precos boolean NOT NULL DEFAULT false;

-- 3. Tabela de preços anônimos para comparativo entre mercados
CREATE TABLE IF NOT EXISTS precos_mercado (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_canonico text        NOT NULL,
  loja             text        NOT NULL,
  cnpj             text,
  preco_unit       numeric     NOT NULL,
  data_obs         date        NOT NULL,
  criado_em        timestamptz NOT NULL DEFAULT now()
);

-- Índices para as queries de comparativo
CREATE INDEX IF NOT EXISTS idx_precos_mercado_produto_loja
  ON precos_mercado (produto_canonico, loja);

CREATE INDEX IF NOT EXISTS idx_precos_mercado_data
  ON precos_mercado (data_obs DESC);

-- ============================================================
-- Verificação rápida após rodar:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'itens_compra'
--   AND column_name IN ('categoria', 'nome_canonico');
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'usuarios'
--   AND column_name = 'opt_out_precos';
-- SELECT table_name FROM information_schema.tables
--   WHERE table_name = 'precos_mercado';
-- ============================================================
