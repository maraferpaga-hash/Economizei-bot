-- ============================================================
-- RLS — PARTE 2 (2026-08-07 · v2, tolerante a objeto ausente)
--
-- POR QUE ESTE ARQUIVO EXISTE
-- O `rls_migration.sql` original (escrito quando o projeto tinha menos tabelas)
-- cobre apenas 5 relações: usuarios, compras, itens_compra,
-- resumos_mensais_enviados e waitlist.
--
-- O código de hoje usa 15. Rodar SÓ o script original deixa dado pessoal
-- exposto à chave anon em 5 tabelas e nas views. Este arquivo fecha o resto.
--
-- ⚠️ MUDANÇA NA v2 (2026-08-07): a v1 listava as views uma a uma e quebrou com
--    `42P01: relation "v_cupons_por_mes" does not exist` — o `metrics_views.sql`
--    está no repositório mas nunca foi executado por inteiro no banco. Como o
--    SQL Editor roda tudo numa transação, um objeto ausente fazia ROLLBACK de
--    tudo. Agora o script DESCOBRE o que existe e age só sobre isso.
--    Efeito colateral bom: cobre também qualquer view/tabela que eu não conheça.
--
-- ✅ É IDEMPOTENTE: pode rodar quantas vezes quiser, inteiro, sem medo.
--
-- ORDEM DE EXECUÇÃO — não inverta:
--   1. SUPABASE_SERVICE_ROLE_KEY no Railway ......... ✅ FEITO (2026-08-07)
--   2. Confirmar que a chave é service_role ......... ⬅️ teste do JWT (passo 0 do roteiro)
--   3. rls_migration.sql (as 5 originais)
--   4. ESTE ARQUIVO (o resto)
--   5. Teste anti-vazamento no rodapé
--
-- ⚠️ Depois disto, a chave `anon` não lê mais NADA. Se o bot ainda estiver
-- rodando com anon, ele PARA. Por isso o passo 2 é inegociável.
-- ============================================================


-- ============================================================
-- DIAGNÓSTICO — rode SOZINHO primeiro (só leitura, não muda nada)
-- Mostra o que de fato existe no banco e o estado atual de cada objeto.
-- ============================================================
-- SELECT c.relname AS objeto,
--        CASE c.relkind WHEN 'r' THEN 'tabela' WHEN 'v' THEN 'view'
--                       WHEN 'm' THEN 'matview' ELSE c.relkind::text END AS tipo,
--        c.relrowsecurity AS rls_ligado
--   FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--  WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m')
--  ORDER BY tipo, objeto;


-- ------------------------------------------------------------
-- PARTE A — Tabelas de dado pessoal que ficaram de fora
-- ------------------------------------------------------------
-- acompanhamentos ...... alvos de alerta do usuário (Alerta Pro)
-- perguntas_log ........ tudo que o usuário perguntou ao bot
-- mensagens_processadas  phone + messageId (dedup)
-- indicacoes ........... quem indicou quem
-- precos_mercado ....... não é PII direto, mas é o ativo de dados do produto
--
-- Cada tabela é tratada só SE existir — tabela ausente vira aviso, não erro.

DO $$
DECLARE
  t text;
  alvos text[] := ARRAY[
    'acompanhamentos',
    'perguntas_log',
    'mensagens_processadas',
    'indicacoes',
    'precos_mercado'
  ];
BEGIN
  FOREACH t IN ARRAY alvos LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'PULADA (não existe): %', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "bloquear_anon" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "bloquear_anon" ON public.%I AS RESTRICTIVE FOR ALL TO anon USING (false)', t
    );
    RAISE NOTICE 'OK (RLS + policy): %', t;
  END LOOP;
END $$;


-- ------------------------------------------------------------
-- PARTE B — 🔴 AS VIEWS (o buraco menos óbvio e mais perigoso)
-- ------------------------------------------------------------
-- Uma view em Postgres roda, por padrão, com os privilégios de QUEM A CRIOU —
-- não de quem a consulta. Consequência: `v_dashboard` seleciona de `usuarios`
-- e `compras`, e continuaria devolvendo os dados MESMO com RLS ligado nas
-- tabelas base. É o achado "security definer view" do linter do Supabase.
--
-- Sem esta parte, ligar o RLS dá falsa sensação de proteção: a porta da frente
-- tranca e a lateral fica aberta.
--
-- `security_invoker = on` faz a view respeitar o RLS de quem consulta (PG 15+).
-- Aqui percorremos TODAS as views existentes no schema public — não uma lista
-- fixa. Assim não quebra com view ausente e cobre views que eu não conheço.

DO $$
DECLARE
  v record;
BEGIN
  FOR v IN
    SELECT c.relname
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'v'
  LOOP
    BEGIN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', v.relname);
    EXCEPTION WHEN OTHERS THEN
      -- security_invoker exige Postgres 15+. Se falhar, o REVOKE abaixo ainda protege.
      RAISE NOTICE 'security_invoker NÃO aplicado em % (%). O REVOKE cobre.', v.relname, SQLERRM;
    END;

    EXECUTE format('REVOKE ALL ON public.%I FROM anon', v.relname);
    RAISE NOTICE 'OK (view protegida): %', v.relname;
  END LOOP;
END $$;


-- ------------------------------------------------------------
-- NOTA — views que o CÓDIGO usa mas podem não existir no banco
-- ------------------------------------------------------------
-- O `src/supabase.js` referencia `v_dashboard`, `v_funil_conversao` e
-- `v_cupons_por_mes`. Em 2026-08-07 descobrimos que pelo menos
-- `v_cupons_por_mes` NÃO EXISTE — o `metrics_views.sql` nunca foi rodado por
-- inteiro. Isso NÃO quebra o bot hoje (essas views alimentam métricas, não o
-- fluxo do usuário), mas significa que qualquer painel/consulta que dependa
-- delas devolve erro em silêncio.
--
-- 👉 Decisão pendente do Gabriel: rodar `supabase/metrics_views.sql` para criar
--    as que faltam, ou remover as referências mortas do código. Ver AGENDA.
--    Se rodar o metrics_views.sql DEPOIS deste arquivo, rode este de novo
--    (é idempotente) para proteger as views recém-criadas.


-- ------------------------------------------------------------
-- NÃO INCLUÍDAS DE PROPÓSITO
-- ------------------------------------------------------------
-- lembretes_enviados ... nunca foi criada (reengajamento desligado, cod-0068)
-- assinatura_eventos ... nunca foi criada (confirmado 2026-08-05, S0 query 1)


-- ============================================================
-- VERIFICAÇÃO 1 — toda tabela de usuário com RLS ligado?
-- Esperado: rls_ligado = true em todas as que existem.
-- ============================================================
-- SELECT c.relname AS tabela, c.relrowsecurity AS rls_ligado
--   FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--  WHERE n.nspname = 'public' AND c.relkind = 'r'
--    AND c.relname IN ('usuarios','compras','itens_compra','resumos_mensais_enviados',
--                      'waitlist','acompanhamentos','perguntas_log',
--                      'mensagens_processadas','indicacoes','precos_mercado')
--  ORDER BY c.relname;

-- ============================================================
-- VERIFICAÇÃO 2 — toda view com security_invoker?
-- Esperado: invoker = true em todas.
-- ============================================================
-- SELECT c.relname AS view_nome,
--        COALESCE(
--          (SELECT option_value FROM pg_options_to_table(c.reloptions)
--           WHERE option_name = 'security_invoker'), 'false'
--        ) AS invoker
--   FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--  WHERE n.nspname = 'public' AND c.relkind = 'v'
--  ORDER BY c.relname;

-- ============================================================
-- VERIFICAÇÃO 3 — o teste que importa: a anon key vaza alguma coisa?
-- Rode no terminal, NÃO no SQL Editor (o Editor é service_role e sempre
-- enxerga tudo — testar por lá dá falso positivo).
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
