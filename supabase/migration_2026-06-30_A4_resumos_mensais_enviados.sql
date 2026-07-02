-- =====================================================================
-- Migration A4 — versiona a tabela `resumos_mensais_enviados`
-- =====================================================================
-- Problema: o código usa esta tabela (verificarResumoJaEnviado /
-- marcarResumoEnviado / apagarDadosUsuario em src/supabase.js) e o
-- rls_migration.sql referencia ela, MAS nunca houve um CREATE no repo —
-- foi criada à mão no console. Sem este arquivo, reconstruir o banco a
-- partir do repositório quebra o resumo mensal.
--
-- Idempotente (IF NOT EXISTS): seguro rodar mesmo com a tabela já existindo.
-- Se ela JÁ existe (criada à mão), este CREATE é no-op — confira só que as
-- colunas abaixo batem com as que você tem (id, phone_number, mes_referencia,
-- total_compras, total_gasto) e que existe UNIQUE (phone_number, mes_referencia).
--
-- Esquema derivado do uso real no código:
--   • .select('id')                             → PK `id`
--   • .eq('phone_number', ...)                   → phone_number
--   • .eq('mes_referencia', ...)                 → mes_referencia ('AAAA-MM')
--   • upsert total_compras / total_gasto         → colunas de dados
--   • onConflict: 'phone_number,mes_referencia'  → UNIQUE composto
-- =====================================================================

CREATE TABLE IF NOT EXISTS resumos_mensais_enviados (
  id             BIGSERIAL PRIMARY KEY,
  phone_number   TEXT NOT NULL REFERENCES usuarios(phone_number) ON DELETE CASCADE,
  mes_referencia TEXT NOT NULL,                 -- 'AAAA-MM' (ex.: '2026-06')
  total_compras  INT,
  total_gasto    NUMERIC(10,2),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone_number, mes_referencia)         -- usado como onConflict no upsert
);

-- RLS: bloqueia acesso anônimo (mesmo padrão do rls_migration.sql).
ALTER TABLE resumos_mensais_enviados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloquear_anon" ON resumos_mensais_enviados;
CREATE POLICY "bloquear_anon" ON resumos_mensais_enviados
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- Verificação rápida (rode depois; deve listar as 6 colunas acima):
-- select column_name, data_type from information_schema.columns
-- where table_schema='public' and table_name='resumos_mensais_enviados'
-- order by ordinal_position;
