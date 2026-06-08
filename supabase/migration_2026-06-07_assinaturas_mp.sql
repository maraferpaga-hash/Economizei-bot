-- =============================================================
-- Economizei Bot — Assinaturas recorrentes via Mercado Pago
-- Data: 2026-06-07
-- =============================================================
-- Adiciona o suporte a cobrança recorrente no cartão (modelo
-- "assinatura sem plano associado" do Mercado Pago). O cartão NUNCA
-- toca o nosso servidor — o usuário cadastra no checkout hospedado do
-- MP (init_point) e o MP cobra automaticamente todo mês. O nosso bot
-- só recebe o webhook subscription_preapproval e liga/desliga is_pro.
--
-- PRÉ-REQUISITO DE DEPLOY: rodar este arquivo no SQL Editor do
-- Supabase ANTES de subir o código que usa as colunas/tabela abaixo.
--
-- -- ROLLBACK -------------------------------------------------
--   ALTER TABLE usuarios
--     DROP COLUMN IF EXISTS mp_preapproval_id,
--     DROP COLUMN IF EXISTS plano,
--     DROP COLUMN IF EXISTS assinatura_status,
--     DROP COLUMN IF EXISTS assinatura_email,
--     DROP COLUMN IF EXISTS assinatura_pendente_plano,
--     DROP COLUMN IF EXISTS assinatura_atualizada_em;
--   DROP TABLE IF EXISTS assinatura_eventos;
-- -----------------------------------------------------------
-- =============================================================

-- -------------------------------------------------------------
-- 1. Novas colunas em usuarios
-- -------------------------------------------------------------
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS mp_preapproval_id        TEXT,         -- ID da assinatura no Mercado Pago (preapproval)
  ADD COLUMN IF NOT EXISTS plano                    TEXT,         -- 'individual' | 'familia' | 'familia_plus'
  ADD COLUMN IF NOT EXISTS assinatura_status        TEXT,         -- pending | authorized | paused | cancelled
  ADD COLUMN IF NOT EXISTS assinatura_email         TEXT,         -- e-mail usado no checkout MP (conciliação)
  ADD COLUMN IF NOT EXISTS assinatura_pendente_plano TEXT,        -- plano escolhido aguardando o e-mail (estado conversacional)
  ADD COLUMN IF NOT EXISTS assinatura_atualizada_em TIMESTAMPTZ;  -- última mudança de status da assinatura

COMMENT ON COLUMN usuarios.mp_preapproval_id        IS 'ID da assinatura recorrente no Mercado Pago (preapproval). NULL = sem assinatura.';
COMMENT ON COLUMN usuarios.plano                     IS 'Plano pago vigente: individual (R$9,90) / familia (R$15) / familia_plus (R$22).';
COMMENT ON COLUMN usuarios.assinatura_status         IS 'Status da assinatura no MP: pending, authorized (ativa), paused, cancelled.';
COMMENT ON COLUMN usuarios.assinatura_email          IS 'E-mail informado pelo usuário e enviado ao MP no momento da assinatura.';
COMMENT ON COLUMN usuarios.assinatura_pendente_plano IS 'Plano escolhido via /assinar aguardando o e-mail do usuário na próxima mensagem. NULL quando não há fluxo em andamento.';
COMMENT ON COLUMN usuarios.assinatura_atualizada_em  IS 'Timestamp da última atualização de status da assinatura.';

-- Busca reversa: do preapproval_id (vindo no webhook) para o usuário.
CREATE INDEX IF NOT EXISTS idx_usuarios_mp_preapproval
  ON usuarios (mp_preapproval_id);

-- -------------------------------------------------------------
-- 2. Tabela: assinatura_eventos
-- Log de todos os eventos de webhook do MP. Serve para:
--   (a) idempotência — não reprocessar o mesmo evento duas vezes;
--   (b) auditoria — histórico de cobranças/mudanças por usuário;
--   (c) debug — guardar o payload bruto quando algo der errado.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assinatura_eventos (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number   TEXT        REFERENCES usuarios(phone_number),  -- pode ser NULL se ainda não conciliado
  preapproval_id TEXT,                                            -- ID da assinatura no MP
  topico         TEXT        NOT NULL,                            -- subscription_preapproval | subscription_authorized_payment | payment
  recurso_id     TEXT        NOT NULL,                            -- data.id que veio no webhook (chave de idempotência)
  acao           TEXT,                                            -- action do webhook (ex: created, updated)
  status         TEXT,                                            -- status do recurso conciliado (authorized, approved, rejected...)
  payload        JSONB,                                           -- corpo bruto do webhook (debug)
  criado_em      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE  assinatura_eventos             IS 'Log de eventos de webhook do Mercado Pago (assinaturas). Idempotência + auditoria + debug.';
COMMENT ON COLUMN assinatura_eventos.recurso_id  IS 'data.id do webhook — usado como chave de idempotência junto com topico.';

-- Idempotência: o mesmo (tópico + recurso) só é processado uma vez.
CREATE UNIQUE INDEX IF NOT EXISTS uq_assinatura_eventos_topico_recurso
  ON assinatura_eventos (topico, recurso_id);

CREATE INDEX IF NOT EXISTS idx_assinatura_eventos_phone
  ON assinatura_eventos (phone_number);
