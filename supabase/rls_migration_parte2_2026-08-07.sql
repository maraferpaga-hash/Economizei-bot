-- ============================================================
-- RLS — PARTE 2 (2026-08-07)
--
-- POR QUE ESTE ARQUIVO EXISTE
-- O `rls_migration.sql` original (escrito quando o projeto tinha menos tabelas)
-- cobre apenas 5 relações: usuarios, compras, itens_compra,
-- resumos_mensais_enviados e waitlist.
--
-- O código de hoje usa 15. Rodar SÓ o script original deixa dado pessoal
-- exposto à chave anon em 5 tabelas e em 7 views. Este arquivo fecha o resto.
--
-- ORDEM DE EXECUÇÃO — não inverta:
--   1. SUPABASE_SERVICE_ROLE_KEY no Railway ......... ✅ FEITO (confirmado 2026-08-07)
--   2. Redeploy + confirmar que o bot funciona ...... ⬅️ CONFIRMAR ANTES DE SEGUIR
--   3. rls_migration.sql (as 5 originais)
--   4. ESTE ARQUIVO (o resto)
--   5. Teste anti-vazamento no rodapé
--
-- ⚠️ Depois disto, a chave `anon` não lê mais NADA. Se o bot ainda estiver
-- rodando com anon, ele PARA. Por isso o passo 2 é inegociável.
-- ============================================================


-- ------------------------------------------------------------
-- PARTE A — Tabelas de dado pessoal que ficaram de fora
-- ------------------------------------------------------------
-- acompanhamentos ...... alvos de alerta do usuário (Alerta Pro)
-- perguntas_log ........ tudo que o usuário perguntou ao bot
-- mensagens_processadas  phone + messageId (dedup)
-- indicacoes ........... quem indicou quem
-- precos_mercado ....... não é PII direto, mas é o ativo de dados do produto
--                        (preço por item por mercado) — não deve ser público

ALTER TABLE acompanhamentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_processadas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicacoes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos_mercado         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bloquear_anon" ON acompanhamentos;
DROP POLICY IF EXISTS "bloquear_anon" ON perguntas_log;
DROP POLICY IF EXISTS "bloquear_anon" ON mensagens_processadas;
DROP POLICY IF EXISTS "bloquear_anon" ON indicacoes;
DROP POLICY IF EXISTS "bloquear_anon" ON precos_mercado;

CREATE POLICY "bloquear_anon" ON acompanhamentos
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON perguntas_log
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON mensagens_processadas
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON indicacoes
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "bloquear_anon" ON precos_mercado
  AS RESTRICTIVE FOR ALL TO anon USING (false);


-- ------------------------------------------------------------
-- PARTE B — 🔴 AS VIEWS (o buraco menos óbvio e mais perigoso)
-- ------------------------------------------------------------
-- Uma view em Postgres roda, por padrão, com os privilégios de QUEM A CRIOU —
-- não de quem a consulta. Consequência: `v_dashboard` seleciona de `usuarios`
-- e `compras`, e continua devolvendo os dados MESMO com RLS ligado nas tabelas
-- base. É o achado "security definer view" do próprio linter do Supabase.
--
-- Ou seja: sem esta parte, ligar o RLS dá uma falsa sensação de proteção —
-- a porta da frente tranca e a lateral fica aberta.
--
-- `security_invoker = on` faz a view respeitar o RLS de quem consulta.
-- Requer Postgres 15+ (o Supabase atual atende).

ALTER VIEW v_dashboard          SET (security_invoker = on);
ALTER VIEW v_retencao_w2        SET (security_invoker = on);
ALTER VIEW v_cupons_por_mes     SET (security_invoker = on);
ALTER VIEW v_funil_conversao    SET (security_invoker = on);
ALTER VIEW v_novos_por_semana   SET (security_invoker = on);
ALTER VIEW v_usuarios_sem_cupom SET (security_invoker = on);
ALTER VIEW v_usuarios_inativos  SET (security_invoker = on);

-- Cinto e suspensório: revoga o acesso direto do anon às views.
REVOKE ALL ON v_dashboard          FROM anon;
REVOKE ALL ON v_retencao_w2        FROM anon;
REVOKE ALL ON v_cupons_por_mes     FROM anon;
REVOKE ALL ON v_funil_conversao    FROM anon;
REVOKE ALL ON v_novos_por_semana   FROM anon;
REVOKE ALL ON v_usuarios_sem_cupom FROM anon;
REVOKE ALL ON v_usuarios_inativos  FROM anon;


-- ------------------------------------------------------------
-- NÃO INCLUÍDAS DE PROPÓSITO
-- ------------------------------------------------------------
-- lembretes_enviados ... nunca foi criada (reengajamento desligado, cod-0068)
-- assinatura_eventos ... nunca foi criada (confirmado 2026-08-05, S0 query 1)
-- Se um dia existirem, acrescente aqui junto com o código que as usa.


-- ============================================================
-- VERIFICAÇÃO 1 — toda tabela de usuário com RLS ligado?
-- Esperado: rls_ligado = true em TODAS as linhas.
-- ============================================================
-- SELECT c.relname AS tabela, c.relrowsecurity AS rls_ligado
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
--   AND c.relkind = 'r'
--   AND c.relname IN ('usuarios','compras','itens_compra','resumos_mensais_enviados',
--                     'waitlist','acompanhamentos','perguntas_log',
--                     'mensagens_processadas','indicacoes','precos_mercado')
-- ORDER BY c.relname;

-- ============================================================
-- VERIFICAÇÃO 2 — toda view com security_invoker?
-- Esperado: invoker = true em TODAS as linhas.
-- ============================================================
-- SELECT c.relname AS view_nome,
--        COALESCE(
--          (SELECT option_value FROM pg_options_to_table(c.reloptions)
--           WHERE option_name = 'security_invoker'), 'false'
--        ) AS invoker
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' AND c.relkind = 'v'
-- ORDER BY c.relname;

-- ============================================================
-- VERIFICAÇÃO 3 — o teste que importa: a anon key vaza alguma coisa?
-- Rode no terminal, NÃO no SQL Editor (o SQL Editor é service_role e
-- sempre vai enxergar tudo — testar por lá dá falso positivo).
--
--   curl "https://SEU_PROJETO.supabase.co/rest/v1/usuarios?select=*" \
--        -H "apikey: SUA_ANON_KEY"
--
-- Esperado: `[]` ou erro. NUNCA dados de usuário.
-- Repita trocando `usuarios` por: compras, itens_compra, perguntas_log,
-- acompanhamentos, precos_mercado, v_dashboard.
--
-- ⚠️ E o teste do outro lado, que é o que quebra o produto se falhar:
-- mande "oi" no WhatsApp DEPOIS de rodar. Se o bot não responder, ele ainda
-- estava em anon — reverta com `ALTER TABLE <tabela> DISABLE ROW LEVEL SECURITY;`
-- e resolva a chave primeiro.
-- ============================================================
