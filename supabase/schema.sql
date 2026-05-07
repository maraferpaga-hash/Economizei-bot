-- =============================================================
-- Economizei Bot — Schema PostgreSQL (Supabase)
-- =============================================================

-- -------------------------------------------------------------
-- Tabela: usuarios
-- Armazena cada usuário identificado pelo número de WhatsApp
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  phone_number    TEXT        PRIMARY KEY,               -- Número no formato internacional (ex: 5511999999999)
  criado_em       TIMESTAMPTZ DEFAULT NOW() NOT NULL,    -- Data/hora de cadastro do usuário
  is_pro          BOOLEAN     DEFAULT FALSE NOT NULL,    -- Indica se o usuário tem plano Pro
  compras_mes_atual INTEGER   DEFAULT 0 NOT NULL         -- Contador de compras registradas no mês corrente
);

COMMENT ON TABLE  usuarios                       IS 'Usuários do bot identificados pelo número de WhatsApp';
COMMENT ON COLUMN usuarios.phone_number          IS 'Número de WhatsApp no formato internacional (ex: 5511999999999)';
COMMENT ON COLUMN usuarios.criado_em             IS 'Data e hora em que o usuário enviou a primeira mensagem';
COMMENT ON COLUMN usuarios.is_pro                IS 'TRUE quando o usuário possui assinatura Pro ativa';
COMMENT ON COLUMN usuarios.compras_mes_atual     IS 'Quantidade de compras registradas no mês corrente (resetado mensalmente)';

-- -------------------------------------------------------------
-- Tabela: compras
-- Cada linha representa um cupom fiscal processado
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compras (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,  -- Identificador único da compra
  phone_number TEXT        NOT NULL REFERENCES usuarios(phone_number),  -- Usuário dono da compra
  loja         TEXT,                                                -- Nome do estabelecimento extraído do cupom
  total        NUMERIC(10,2),                                       -- Valor total da compra em reais
  data_compra  DATE,                                                -- Data da compra conforme o cupom fiscal
  criado_em    TIMESTAMPTZ DEFAULT NOW() NOT NULL                   -- Data/hora em que o registro foi inserido
);

COMMENT ON TABLE  compras              IS 'Cupons fiscais processados pelo bot';
COMMENT ON COLUMN compras.id           IS 'UUID gerado automaticamente como chave primária';
COMMENT ON COLUMN compras.phone_number IS 'Referência ao número de WhatsApp do usuário que enviou o cupom';
COMMENT ON COLUMN compras.loja         IS 'Nome do estabelecimento/supermercado extraído pela Gemini Vision';
COMMENT ON COLUMN compras.total        IS 'Valor total da compra em reais com 2 casas decimais';
COMMENT ON COLUMN compras.data_compra  IS 'Data da compra conforme impresso no cupom fiscal';
COMMENT ON COLUMN compras.criado_em    IS 'Data e hora em que o cupom foi processado e salvo';

-- -------------------------------------------------------------
-- Tabela: itens_compra
-- Produtos individuais de cada compra
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_compra (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,  -- Identificador único do item
  compra_id  UUID        NOT NULL REFERENCES compras(id) ON DELETE CASCADE,  -- Compra à qual o item pertence
  nome       TEXT,                                               -- Nome/descrição do produto
  preco      NUMERIC(10,2),                                      -- Preço unitário do produto em reais
  quantidade NUMERIC(10,3)                                       -- Quantidade (suporta frações para peso/volume)
);

COMMENT ON TABLE  itens_compra             IS 'Itens individuais extraídos de cada cupom fiscal';
COMMENT ON COLUMN itens_compra.id          IS 'UUID gerado automaticamente como chave primária';
COMMENT ON COLUMN itens_compra.compra_id   IS 'Referência à compra; ao deletar a compra, os itens são removidos em cascata';
COMMENT ON COLUMN itens_compra.nome        IS 'Nome ou descrição do produto conforme o cupom';
COMMENT ON COLUMN itens_compra.preco       IS 'Preço unitário do produto em reais com 2 casas decimais';
COMMENT ON COLUMN itens_compra.quantidade  IS 'Quantidade do produto (3 casas para suportar kg/litros, ex: 1.500)';

-- -------------------------------------------------------------
-- Índices
-- -------------------------------------------------------------

-- Consultas por usuário em compras (buscar histórico, calcular médias)
CREATE INDEX IF NOT EXISTS idx_compras_phone_number
  ON compras (phone_number);

-- Consultas por período (relatórios mensais, alertas de gasto)
CREATE INDEX IF NOT EXISTS idx_compras_data_compra
  ON compras (data_compra);

-- Combinado: buscar compras de um usuário em um intervalo de datas
CREATE INDEX IF NOT EXISTS idx_compras_phone_data
  ON compras (phone_number, data_compra);

-- Buscar todos os itens de uma compra
CREATE INDEX IF NOT EXISTS idx_itens_compra_compra_id
  ON itens_compra (compra_id);
