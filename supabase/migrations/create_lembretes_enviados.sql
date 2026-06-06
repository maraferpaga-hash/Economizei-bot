-- =============================================================
-- Migration — Tabela lembretes_enviados (sistema de reengajamento)
-- Registra cada lembrete proativo enviado a um usuário, para que o
-- mesmo lembrete nunca seja enviado duas vezes.
-- Execute este script no Supabase SQL Editor.
-- =============================================================

CREATE TABLE IF NOT EXISTS lembretes_enviados (
  id             BIGSERIAL   PRIMARY KEY,
  phone_number   TEXT        NOT NULL,
  lembrete_id    TEXT        NOT NULL,  -- ex: 'onboarding_d7', 'inativo_d10'
  enviado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mes_referencia TEXT,                  -- 'YYYY-MM', preenchido só pra lembretes mensais
  CONSTRAINT unique_lembrete_por_usuario UNIQUE (phone_number, lembrete_id, mes_referencia)
);

CREATE INDEX IF NOT EXISTS idx_lembretes_phone ON lembretes_enviados (phone_number);

COMMENT ON TABLE  lembretes_enviados                IS 'Histórico de lembretes de reengajamento enviados (anti-duplicação)';
COMMENT ON COLUMN lembretes_enviados.lembrete_id    IS 'ID do lembrete: onboarding_d2/d7, inativo_d3/d10/d30/d60, fim_mes_d26, limite_aviso_8';
COMMENT ON COLUMN lembretes_enviados.mes_referencia IS 'YYYY-MM para lembretes mensais (fim_mes, limite); NULL para os de ciclo único (onboarding, inativo)';

-- Observação sobre o UNIQUE com NULL:
-- No PostgreSQL padrão, valores NULL são considerados distintos em constraints UNIQUE,
-- então a constraint NÃO bloqueia duplicatas quando mes_referencia é NULL (lembretes de
-- ciclo único). A proteção contra duplicatas desses lembretes é garantida em nível de
-- aplicação por lembreteFoiEnviado() em src/reengagement.js, que checa antes de enviar.
-- Para lembretes mensais (mes_referencia = 'YYYY-MM'), a constraint funciona normalmente.
