-- =============================================================
-- Migration 001 — Adiciona colunas ausentes no banco existente
-- Execute este script no Supabase SQL Editor se você já criou
-- o banco com o schema original (sem beta_fundador, onboarding_step, etc.)
-- =============================================================

-- Colunas adicionadas na tabela usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS beta_fundador     BOOLEAN DEFAULT TRUE  NOT NULL,
  ADD COLUMN IF NOT EXISTS mes_referencia    TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS onboarding_step   INTEGER DEFAULT 0     NOT NULL;

COMMENT ON COLUMN usuarios.beta_fundador   IS 'TRUE para usuários que entraram durante o Beta';
COMMENT ON COLUMN usuarios.mes_referencia  IS 'Mês de referência YYYY-MM para reset mensal de compras_mes_atual';
COMMENT ON COLUMN usuarios.onboarding_step IS '0=boas-vindas, 1=aguardando foto, 2=primeira foto, 3=concluído';

-- Tabela waitlist (leads da landing page)
CREATE TABLE IF NOT EXISTS waitlist (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome           TEXT        NOT NULL,
  whatsapp       TEXT        NOT NULL,
  plano_interesse TEXT,
  variant_ab     TEXT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  utm_content    TEXT,
  criado_em      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_whatsapp ON waitlist (whatsapp);

-- RPC para incremento atômico do contador mensal
CREATE OR REPLACE FUNCTION incrementar_compras_mes(p_phone_number TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE usuarios
  SET compras_mes_atual = compras_mes_atual + 1
  WHERE phone_number = p_phone_number;
END;
$$ LANGUAGE plpgsql;
