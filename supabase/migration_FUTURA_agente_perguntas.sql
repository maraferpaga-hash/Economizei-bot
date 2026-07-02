-- =====================================================================
-- Migration FUTURA — Agente de Perguntas (cota + log)
-- =====================================================================
-- ⚠️ QUANDO RODAR: ANTES de commitar/subir cod-0016 (cota) e cod-0017
-- (orquestrador). Se subir o código sem esta migration, a cota quebra em
-- produção. Hoje (cod-0010/0011/0012 já commitados) o código do agente
-- ainda NÃO toca estas colunas — então não há pressa.
--
-- Fonte: Desenho_Tecnico_Agente_Perguntas_2026-06-18.md §7.
-- =====================================================================

-- Contador de perguntas no mês (espelha compras_mes_atual; MESMO reset mensal).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perguntas_mes_atual INT NOT NULL DEFAULT 0;

-- Log pra aprendizado (OODA) + auditoria de honestidade. TTL curto na purga
-- do código (LGPD: minimização — purgarPerguntasLog, ~90 dias).
CREATE TABLE IF NOT EXISTS perguntas_log (
  id            BIGSERIAL PRIMARY KEY,
  phone_number  TEXT NOT NULL REFERENCES usuarios(phone_number) ON DELETE CASCADE,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  pergunta      TEXT,                 -- texto cru; purga em ~90 dias
  intent        TEXT,
  params        JSONB,
  confianca     TEXT,                 -- alta|media|baixa|fora_de_escopo
  tem_dados     BOOLEAN,
  modo          TEXT,                 -- template|llm
  fidelidade_ok BOOLEAN,             -- null no modo template
  respondeu     BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_perguntas_log_intent ON perguntas_log (intent);

-- RLS: bloqueia anônimo (padrão do rls_migration.sql).
ALTER TABLE perguntas_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloquear_anon" ON perguntas_log;
CREATE POLICY "bloquear_anon" ON perguntas_log
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- Nota: o FK ON DELETE CASCADE já faz o /apagar limpar o perguntas_log
-- automaticamente. Se preferir apagar explícito, adicionar em apagarDadosUsuario.
-- Nota: o reset mensal reaproveita o mesmo mecanismo que zera compras_mes_atual.
