-- ============================================================================
-- Migration: PIX — direção do movimento + ID de transação (dedup)
-- Data: 2026-08-05
-- Autorizada por: Gabriel (decisões 2 e 3 da sessão de desdobramento)
-- Doc: Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md §1.1 e §1.3
--
-- ⚠️ ORDEM OBRIGATÓRIA (padrão anti-A9, incidente de 2026-07-08):
--    1) rodar ESTE arquivo no SQL Editor do Supabase
--    2) SÓ DEPOIS commitar/pushar o código da cod-0062 (push = deploy no Railway)
--    Código que lê coluna inexistente = cupom perdido em silêncio.
--
-- Reversão:
--   ALTER TABLE compras DROP COLUMN IF EXISTS direcao;
--   ALTER TABLE compras DROP COLUMN IF EXISTS id_transacao;
--   DROP INDEX IF EXISTS idx_compras_id_transacao;
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. direcao — 'saida' (padrão, todo gasto) | 'entrada' (PIX recebido)
--
--    Decisão 3 do Gabriel: PIX recebido É REGISTRADO, marcado como entrada,
--    e NUNCA conta como gasto. Sem esta coluna, um PIX recebido inflaria o
--    total do mês e faria o alerta, o teto e o resumo mentirem.
--
--    DEFAULT 'saida' garante que TODA compra já existente continua sendo gasto.
-- ----------------------------------------------------------------------------
ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS direcao text NOT NULL DEFAULT 'saida';

COMMENT ON COLUMN compras.direcao
  IS 'saida = dinheiro que saiu (todo cupom e PIX enviado); entrada = dinheiro que entrou (PIX recebido). Toda agregação de GASTO deve filtrar direcao = ''saida''.';

-- ----------------------------------------------------------------------------
-- 2. id_transacao — EndToEndId do PIX (E + 8 ISPB + 12 AAAAMMDDHHMM + 11 alfanum)
--
--    Decisão 2 do Gabriel: chave natural e determinística de deduplicação.
--    Importa porque a dedup atual (mensagens_processadas) está fail-open em
--    produção enquanto o RLS não estiver resolvido (S2/S4): mandar o mesmo
--    comprovante duas vezes, ou o PDF e o print da MESMA transação, hoje
--    gravaria duas compras.
--
--    NULL para cupom fiscal (não tem EndToEndId) — por isso o índice é PARCIAL.
-- ----------------------------------------------------------------------------
ALTER TABLE compras
  ADD COLUMN IF NOT EXISTS id_transacao text;

COMMENT ON COLUMN compras.id_transacao
  IS 'EndToEndId do PIX (32 chars, começa com E). NULL em cupom fiscal. Chave de idempotência: mesmo id = mesma transação, não gravar de novo.';

-- Índice único parcial: impede a MESMA transação ser gravada 2x para o MESMO
-- usuário, sem impedir que duas pessoas diferentes registrem o mesmo PIX
-- (pagador e recebedor podem ambos usar o bot).
CREATE UNIQUE INDEX IF NOT EXISTS idx_compras_id_transacao
  ON compras (phone_number, id_transacao)
  WHERE id_transacao IS NOT NULL;

-- ============================================================================
-- Verificação (rodar depois; as duas devem retornar linha):
--
--   SELECT column_name, data_type, column_default, is_nullable
--     FROM information_schema.columns
--    WHERE table_name = 'compras' AND column_name IN ('direcao','id_transacao');
--
--   SELECT indexname FROM pg_indexes
--    WHERE tablename = 'compras' AND indexname = 'idx_compras_id_transacao';
-- ============================================================================
