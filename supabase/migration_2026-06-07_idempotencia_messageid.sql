-- ============================================================
-- Migration: Idempotência por messageId (lei 5 do CODE_GUIDE)
-- Economizei — 2026-06-07
-- Rodar no SQL Editor do Supabase UMA VEZ, antes do deploy.
--
-- Por quê (ver CODE_GUIDE.md seção 3, "as 5 leis", lei 5):
--  O Z-API pode reentregar o MESMO evento de webhook mais de uma vez
--  (retry, falha de rede, reconexão da instância). Sem dedup, a mesma
--  foto de cuped era processada 2x e gerava 2 compras + 2 incrementos
--  do contador mensal. Esta tabela registra cada messageId já visto;
--  o webhook ignora qualquer reentrega do mesmo id.
--
--  Mesmo padrão já em uso para o webhook do Mercado Pago
--  (assinatura_eventos com UNIQUE em (topico, recurso_id)).
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS mensagens_processadas;
-- ============================================================

CREATE TABLE IF NOT EXISTS mensagens_processadas (
  message_id   TEXT        PRIMARY KEY,                 -- id do evento Z-API (messageId)
  phone_number TEXT,                                    -- dono da mensagem (para auditoria)
  tipo         TEXT,                                    -- 'texto' | 'imagem'
  criado_em    TIMESTAMPTZ DEFAULT NOW() NOT NULL       -- quando foi processado pela 1ª vez
);

COMMENT ON TABLE  mensagens_processadas             IS 'Dedup de eventos do webhook Z-API por messageId. Reentrega do mesmo id é ignorada (lei 5 do CODE_GUIDE).';
COMMENT ON COLUMN mensagens_processadas.message_id IS 'messageId único do evento Z-API. PK garante a idempotência.';
COMMENT ON COLUMN mensagens_processadas.criado_em  IS 'Timestamp do 1º processamento. Usado pela rotina de purga (TTL ~7 dias).';

-- Índice para a purga periódica (DELETE WHERE criado_em < now() - 7d) ser eficiente.
CREATE INDEX IF NOT EXISTS idx_mensagens_processadas_criado_em
  ON mensagens_processadas (criado_em);

-- ============================================================
-- Verificação rápida após rodar:
--   SELECT to_regclass('public.mensagens_processadas');  -- deve retornar o nome da tabela
-- ============================================================
