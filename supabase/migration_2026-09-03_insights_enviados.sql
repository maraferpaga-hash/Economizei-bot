-- =====================================================================
-- Migration 2026-09-03 — `insights_enviados` (cooldown da cod-0049)
-- =====================================================================
-- AUTORIZADA PELO GABRIEL em 2026-09-03 (sessão Cowork). Sem esta tabela a
-- cod-0049 (insights proativos) não é implementável: a rotina matinal de
-- 2026-09-03 verificou no código que NENHUMA das 11 tabelas em uso serve de
-- cooldown genérico —
--   • acompanhamentos.alertado_em .... é por ALVO do teto, não por gatilho
--   • resumos_mensais_enviados ....... é a dedup do fim de mês (A4)
--   • mensagens_processadas .......... dedup de messageId, purgada aos 7 dias
--                                      (um cooldown mensal morreria na purga)
--   • usuarios ....................... não tem coluna de data de insight
--
-- ⚠️ ORDEM DE EXECUÇÃO (anti-A9 — o push deploya no Railway automaticamente):
--       1. Rodar ESTE arquivo no SQL Editor do Supabase
--       2. Conferir com a query de verificação no rodapé
--       3. SÓ ENTÃO fazer o push da cod-0049
--    Código que lê tabela inexistente = cupom perdido em silêncio (incidente A9,
--    07-08 → 07-09). É por isso que a checagem de migrations do `/entregar` é
--    bloqueante.
--
-- ✅ IDEMPOTENTE (IF NOT EXISTS + DROP POLICY IF EXISTS): seguro rodar de novo.
-- =====================================================================


-- ---------------------------------------------------------------------
-- A TABELA
-- ---------------------------------------------------------------------
-- Minimização (LGPD): guarda o MÍNIMO que responde "já mandei este insight
-- para esta pessoa recentemente?" — telefone, nome do gatilho e quando.
-- NÃO guarda valor, item, categoria, nem o texto da mensagem enviada. O
-- conteúdo do insight é recalculado na hora a partir de `compras`; esta tabela
-- é só o relógio do cooldown.
CREATE TABLE IF NOT EXISTS insights_enviados (
  id           BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL REFERENCES usuarios(phone_number) ON DELETE CASCADE,
  gatilho      TEXT NOT NULL,        -- identificador curto e estável do gatilho,
                                     -- ex.: 'media_cruzada_cedo', 'categoria_acima',
                                     -- 'marco_economia'. Nome vem de src/insights.js.
  enviado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE insights_enviados IS
  'Cooldown dos insights proativos (cod-0049). Só relógio: telefone + gatilho + quando. Purgar aos 90 dias.';


-- ---------------------------------------------------------------------
-- ÍNDICE
-- ---------------------------------------------------------------------
-- Um índice só, de propósito. As duas perguntas do cooldown são:
--   (1) "algum insight nos últimos 7 dias?"      → phone_number + enviado_em
--   (2) "ESTE gatilho nos últimos 30 dias?"      → phone_number + enviado_em, filtrando gatilho
-- A (1) usa o índice inteiro. A (2) usa o mesmo índice e filtra `gatilho` sobre
-- um punhado de linhas — com teto de 1 insight/semana/usuário, são ~4 linhas em
-- 30 dias. Um segundo índice em (phone_number, gatilho, ...) custaria escrita
-- para poupar leitura que já é trivial.
CREATE INDEX IF NOT EXISTS idx_insights_enviados_phone_data
  ON insights_enviados (phone_number, enviado_em DESC);


-- ---------------------------------------------------------------------
-- RLS — mesmo padrão das outras tabelas de dado pessoal
-- ---------------------------------------------------------------------
-- O RLS foi ligado em 2026-08-18 (S4). Tabela nova nasce fechada: sem estas 3
-- linhas, `insights_enviados` seria a única relação legível por quem tiver a
-- anon key — exatamente o buraco que o S4 fechou.
ALTER TABLE insights_enviados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloquear_anon" ON insights_enviados;
CREATE POLICY "bloquear_anon" ON insights_enviados
  AS RESTRICTIVE FOR ALL TO anon USING (false);


-- =====================================================================
-- VERIFICAÇÃO — rode depois. Esperado: 4 colunas, rls_ligado = true.
-- =====================================================================
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--  WHERE table_schema = 'public' AND table_name = 'insights_enviados'
--  ORDER BY ordinal_position;
--
-- SELECT relname, relrowsecurity AS rls_ligado
--   FROM pg_class
--  WHERE relname = 'insights_enviados';


-- =====================================================================
-- O QUE O CÓDIGO DA cod-0049 PRECISA FAZER (não é SQL — é checklist da tarefa)
-- =====================================================================
-- 1. `src/schemaGuard.js` → acrescentar `{ tabela: 'insights_enviados' }` às
--    CHECAGENS_CRITICAS. Sem isso, esquecer de rodar esta migration em outro
--    ambiente vira falha silenciosa no boot.
--
-- 2. PURGA (LGPD, retenção): acrescentar ao job das 7h, junto das duas purgas
--    que já existem, um DELETE de `enviado_em < now() - 90 dias`. O cooldown
--    mais longo é 30 dias, então 90 dá folga de 3× e alinha com o TTL do
--    `perguntas_log`. Guardar mais que isso é acumular dado sem uso.
--
-- 3. 🔴 `/apagar` (LGPD) — LEIA ANTES DE LIGAR A TABELA. O `ON DELETE CASCADE`
--    acima NÃO basta hoje, porque `apagarDadosUsuario` (src/supabase.js:1582)
--    está QUEBRADO: o passo 3 apaga de `lembretes_enviados`, tabela que nunca
--    foi criada (o reengajamento foi desligado na cod-0068). O DELETE devolve
--    42P01, o `if (error) throw error` aborta a função, e os passos 4, 5 e 6
--    nunca rodam — ou seja, `usuarios` NUNCA é apagado, e o CASCADE nunca
--    dispara. Além disso `acompanhamentos` e `perguntas_log` sequer estão na
--    lista. Acrescentar `insights_enviados` a uma função que não chega ao fim
--    aumenta o vazamento em vez de conter. Consertar o `/apagar` primeiro
--    (tarefa cod-0076) e só então incluir esta tabela na sequência de DELETE.
