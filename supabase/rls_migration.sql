-- ============================================================
-- RLS MIGRATION — Economizei
-- Protege os dados dos usuários caso a chave anon vaze.
--
-- PRÉ-REQUISITO OBRIGATÓRIO — execute na ordem:
--
--   1. Adicione SUPABASE_SERVICE_ROLE_KEY no Railway
--      (Painel Supabase → Settings → API → service_role key)
--   2. Faça deploy do bot com a nova variável
--   3. Verifique que o bot continua funcionando (/health)
--   4. SÓ ENTÃO execute este script no SQL Editor do Supabase
--
-- Por quê? Depois deste script, a chave 'anon' NÃO consegue
-- mais ler nenhuma tabela. O bot precisa usar 'service_role'
-- para continuar funcionando.
-- ============================================================

-- ------------------------------------------------------------
-- Habilita RLS em todas as tabelas de dados do usuário
-- ------------------------------------------------------------
ALTER TABLE usuarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras                ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_compra           ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumos_mensais_enviados ENABLE ROW LEVEL SECURITY;

-- Tabelas opcionais — comente as que não existirem no seu projeto
ALTER TABLE waitlist               ENABLE ROW LEVEL SECURITY;

-- Tabela do reengajamento (se já criada)
-- ALTER TABLE lembretes_enviados  ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Nega todo acesso via chave 'anon' (acesso público direto)
-- O 'service_role' bypassa RLS automaticamente — não precisa
-- de policy explícita para ele.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "bloquear_anon" ON usuarios;
DROP POLICY IF EXISTS "bloquear_anon" ON compras;
DROP POLICY IF EXISTS "bloquear_anon" ON itens_compra;
DROP POLICY IF EXISTS "bloquear_anon" ON resumos_mensais_enviados;
DROP POLICY IF EXISTS "bloquear_anon" ON waitlist;

CREATE POLICY "bloquear_anon" ON usuarios
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON compras
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON itens_compra
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON resumos_mensais_enviados
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON waitlist
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- ------------------------------------------------------------
-- Verificação: confirme que as policies foram criadas
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE policyname = 'bloquear_anon';
-- ------------------------------------------------------------

-- ============================================================
-- APÓS EXECUTAR:
--   1. Teste o bot — mande "oi" no WhatsApp. Deve funcionar.
--   2. Tente acessar via anon key diretamente:
--      curl https://SEU_PROJETO.supabase.co/rest/v1/usuarios \
--           -H "apikey: SUA_ANON_KEY"
--      Deve retornar vazio ou erro 401 — NUNCA os dados dos usuários.
-- ============================================================
