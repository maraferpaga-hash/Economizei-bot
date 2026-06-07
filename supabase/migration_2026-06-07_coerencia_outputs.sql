-- ============================================================
-- Migration: Coerência dos outputs (preco_total + tipo)
-- Economizei — 2026-06-07
-- Rodar no SQL Editor do Supabase UMA VEZ, antes do deploy.
--
-- Por quê (ver CLAUDE.md / CODE_GUIDE.md, sessão 2026-06-07):
--  1. itens_compra só guardava `preco` (unitário). A agregação por categoria
--     recalculava preco*quantidade, o que dobra o valor quando o Gemini devolve
--     o total da linha já em preco_unitario. Passamos a gravar o preco_total da
--     linha (ground truth do cupom) e agregar por ele.
--  2. compras não tinha `tipo`. A média de gastos misturava mercado com
--     não-mercado (farmácia, posto), derrubando a média e fazendo o alerta
--     disparar "acima do padrão" quase sempre. Agora a média filtra tipo='mercado'.
--
-- ROLLBACK:
--   ALTER TABLE itens_compra DROP COLUMN IF EXISTS preco_total;
--   ALTER TABLE compras      DROP COLUMN IF EXISTS tipo;
-- ============================================================

-- 1. preco_total por item (total da linha como impresso no cupom).
--    NULL em linhas antigas — o app cai pro fallback preco*quantidade nesses casos.
ALTER TABLE itens_compra
  ADD COLUMN IF NOT EXISTS preco_total numeric(10,2);

COMMENT ON COLUMN itens_compra.preco_total
  IS 'Total da linha do item conforme o cupom (preco_unitario x quantidade já calculado pelo emissor). Fonte de verdade para agregação por categoria.';

-- 2. tipo da compra: 'mercado' (default) ou 'outros' (não-mercado).
--    Linhas antigas viram 'mercado' por default — aceitável; daqui pra frente correto.
ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'mercado';

COMMENT ON COLUMN compras.tipo
  IS 'mercado = supermercado/atacadão; outros = farmácia/posto/restaurante etc. A média de gastos só considera tipo=mercado.';

-- Índice para a média filtrar por (phone_number, tipo, data_compra) com eficiência.
CREATE INDEX IF NOT EXISTS idx_compras_phone_tipo_data
  ON compras (phone_number, tipo, data_compra);

-- ============================================================
-- Verificação rápida após rodar:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'itens_compra' AND column_name = 'preco_total';
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'compras' AND column_name = 'tipo';
-- ============================================================
