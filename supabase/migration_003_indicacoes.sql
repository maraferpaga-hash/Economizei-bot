-- ============================================================
-- Migration 003: Sistema de Indicação (/convidar)
-- Economizei — 2026-06-07
-- Rodar no SQL Editor do Supabase ANTES do push.
-- ============================================================
--
-- Programa de indicação de 2 lados e 2 marcos (decisão CLAUDE.md 2026-06-07):
--   • Marco 1 — amigo manda o 1º cupom (ativação): indicador E indicado ganham
--     7 dias de "features Pro".
--   • Marco 2 — amigo vira Pro pagante (conversão): indicador ganha +30 dias.
--   • Teto de acúmulo: 60 dias na conta.
--
-- "Features Pro" = comparativo entre mercados + alerta inteligente, SEM mexer no
-- limite de 10 cupons/mês (que é o teto de custo Gemini). Por isso a janela vive
-- na coluna features_pro_ate, separada de is_pro.
-- ============================================================

-- 1. Colunas novas em usuarios
--    codigo_indicacao: código estável do indicador (gerado no 1º /convidar)
--    features_pro_ate: até quando as funções Pro estão liberadas por recompensa
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS codigo_indicacao text,
  ADD COLUMN IF NOT EXISTS features_pro_ate timestamptz;

-- Garante unicidade do código (índice parcial — ignora NULLs de quem nunca convidou)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_codigo_indicacao
  ON usuarios (codigo_indicacao)
  WHERE codigo_indicacao IS NOT NULL;

COMMENT ON COLUMN usuarios.codigo_indicacao IS 'Código estável de indicação do usuário (ex: CONV-A7K2). NULL até o primeiro /convidar.';
COMMENT ON COLUMN usuarios.features_pro_ate IS 'Timestamp até quando as funções Pro (comparativo + alerta inteligente) estão liberadas por recompensa de indicação. NÃO altera o limite de cupons. NULL = sem janela ativa.';

-- 2. Tabela de indicações (1 linha por indicado)
CREATE TABLE IF NOT EXISTS indicacoes (
  id              bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo          text        NOT NULL,                    -- código do indicador usado
  indicador_phone text        NOT NULL,                    -- quem indicou
  indicado_phone  text        NOT NULL UNIQUE,             -- quem foi indicado (1 indicação por pessoa: o 1º vence)
  status          text        NOT NULL DEFAULT 'pendente', -- pendente | ativado | convertido
  criado_em       timestamptz NOT NULL DEFAULT now(),      -- quando o indicado entrou pelo link
  ativado_em      timestamptz,                             -- quando mandou o 1º cupom
  convertido_em   timestamptz                              -- quando virou Pro pagante
);

COMMENT ON TABLE  indicacoes                 IS 'Arestas indicador→indicado do programa /convidar. 1 linha por indicado.';
COMMENT ON COLUMN indicacoes.codigo          IS 'Código de indicação usado pelo indicado no 1º contato.';
COMMENT ON COLUMN indicacoes.indicado_phone  IS 'UNIQUE: cada pessoa só pode ser indicada uma vez (o primeiro código vence).';
COMMENT ON COLUMN indicacoes.status          IS 'pendente (entrou pelo link) → ativado (mandou 1º cupom) → convertido (virou Pro pagante).';

-- Índices para as consultas do bot (status do indicador, lookup por indicado)
CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador ON indicacoes (indicador_phone);
CREATE INDEX IF NOT EXISTS idx_indicacoes_status    ON indicacoes (status);

-- ============================================================
-- ROLLBACK (se necessário):
--   DROP TABLE IF EXISTS indicacoes;
--   DROP INDEX IF EXISTS idx_usuarios_codigo_indicacao;
--   ALTER TABLE usuarios DROP COLUMN IF EXISTS codigo_indicacao;
--   ALTER TABLE usuarios DROP COLUMN IF EXISTS features_pro_ate;
-- ============================================================

-- ============================================================
-- Verificação rápida após rodar:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'usuarios'
--     AND column_name IN ('codigo_indicacao', 'features_pro_ate');
--   SELECT table_name FROM information_schema.tables WHERE table_name = 'indicacoes';
-- ============================================================
