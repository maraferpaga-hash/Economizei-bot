-- =====================================================================
-- Migration FUTURA — Alerta Inteligente Pro (acompanhamentos + supérfluo)
-- =====================================================================
-- ⚠️ QUANDO RODAR: ANTES de subir cod-0031 (leitura de acompanhamentos),
-- cod-0033 (comandos /acompanhar etc.) e cod-0035 (alerta de limite).
-- A engine de matching (cod-0030, já no repo) é PURA e não depende disto —
-- só a persistência depende.
--
-- ⚠️ Antes de ligar as peças Pro, decidir o recorte Free×Pro e ligar o gate
-- Pro (temFeaturesProAtivas/is_pro) — passo financeiro humano.
--
-- Fonte: Desenho_Alerta_Inteligente_Pro_2026-06-27.md §7.
-- =====================================================================

-- Alvos que o usuário acompanha (categoria OU palavra-chave livre).
CREATE TABLE IF NOT EXISTS acompanhamentos (
  id            BIGSERIAL PRIMARY KEY,
  phone_number  TEXT NOT NULL REFERENCES usuarios(phone_number) ON DELETE CASCADE,
  tipo_alvo     TEXT NOT NULL CHECK (tipo_alvo IN ('categoria','termo')),
  alvo          TEXT NOT NULL,                 -- categoria normalizada OU termo lowercased
  rotulo        TEXT,                          -- rótulo de exibição (default = alvo)
  limite_mensal NUMERIC(10,2),                 -- teto em R$; NULL = só acompanha, não alerta
  superfluo     BOOLEAN NOT NULL DEFAULT false,-- conta no total supérfluo (Pilar A)?
  ativo         BOOLEAN NOT NULL DEFAULT true,
  alertado_em   DATE,                          -- mês do último alerta de limite (anti-spam)
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone_number, tipo_alvo, alvo)
);
CREATE INDEX IF NOT EXISTS idx_acompanhamentos_phone_ativo
  ON acompanhamentos (phone_number, ativo);

-- Config de categorias supérfluas por usuário (Pilar A).
-- NULL → usa o baseline do código ['doces','bebidas'].
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS categorias_superfluas TEXT[];

-- RLS: bloqueia anônimo (padrão do rls_migration.sql).
ALTER TABLE acompanhamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloquear_anon" ON acompanhamentos;
CREATE POLICY "bloquear_anon" ON acompanhamentos
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- Nota: o FK ON DELETE CASCADE já faz o /apagar limpar os acompanhamentos.
