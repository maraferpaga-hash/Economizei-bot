-- ============================================================
-- Backfill: dados antigos pós coerência de outputs
-- Economizei — 2026-06-07
--
-- Contexto (ver CLAUDE.md / CODE_GUIDE.md, sessão 2026-06-07):
-- A migration migration_2026-06-07_coerencia_outputs.sql adicionou
-- compras.tipo (default 'mercado') e itens_compra.preco_total (NULL em
-- linhas antigas). Isso deixou DUAS ressalvas em dados já gravados:
--   (1) cupons NÃO-mercado salvos antes da migration ficaram tipo='mercado'
--       e entram na média de gastos, derrubando-a e fazendo o alerta
--       disparar "acima do padrão".
--   (2) itens antigos sem preco_total caem no fallback preco*quantidade.
--
-- Este arquivo NÃO é uma migration de schema — é um backfill de DADOS,
-- feito com revisão humana (preview antes do UPDATE). Rode bloco a bloco
-- no SQL Editor, conferindo o resultado de cada SELECT antes do UPDATE.
--
-- NÃO É IDEMPOTENTE POR NATUREZA no sentido de "reverter" — mas pode rodar
-- mais de uma vez sem efeito colateral (os UPDATEs são condicionais).
-- ============================================================


-- ============================================================
-- PARTE 1 — Reclassificar cupons NÃO-mercado antigos (compras.tipo)
-- ============================================================
-- Heurística por NOME DA LOJA. Não existe ground truth para cupons antigos
-- (a imagem não é guardada), então identificamos não-mercado pelos nomes de
-- estabelecimento típicos. REVISE o preview antes de aplicar — ajuste a lista
-- de palavras-chave se aparecer um supermercado classificado errado, ou um
-- não-mercado que escapou.

-- 1A. PREVIEW — veja o que SERIA reclassificado para 'outros'.
--     Rode este SELECT primeiro e confira a coluna loja linha a linha.
SELECT
  loja,
  COUNT(*)            AS qtd_cupons,
  ROUND(SUM(total),2) AS total_reais,
  MIN(data_compra)    AS primeira,
  MAX(data_compra)    AS ultima
FROM compras
WHERE tipo = 'mercado'                       -- só mexe no que ainda está como mercado
  AND loja IS NOT NULL
  AND (
       loja ILIKE '%farmac%' OR loja ILIKE '%farmác%' OR loja ILIKE '%drogar%'
    OR loja ILIKE '%drogasil%' OR loja ILIKE '%pacheco%' OR loja ILIKE '%pague menos%'
    OR loja ILIKE '%raia%' OR loja ILIKE '%ultrafarma%'
    OR loja ILIKE '%posto%' OR loja ILIKE '%combust%' OR loja ILIKE '%petrol%'
    OR loja ILIKE '%ipiranga%' OR loja ILIKE '%shell%' OR loja ILIKE '%br mania%'
    OR loja ILIKE '%restaurant%' OR loja ILIKE '%lanchonet%' OR loja ILIKE '%pizzar%'
    OR loja ILIKE '%hamburg%' OR loja ILIKE '%churrasc%' OR loja ILIKE '%espetin%'
    OR loja ILIKE '%padaria%' OR loja ILIKE '%panific%' OR loja ILIKE '%confeitar%'
    OR loja ILIKE '%açaí%' OR loja ILIKE '%acai%' OR loja ILIKE '%sorveter%'
    OR loja ILIKE '%cafeter%' OR loja ILIKE '%bar %' OR loja ILIKE '%pet shop%'
    OR loja ILIKE '%petshop%' OR loja ILIKE '%papelar%' OR loja ILIKE '%livrar%'
  )
GROUP BY loja
ORDER BY total_reais DESC;

-- 1B. APLICAR — só depois de revisar o preview acima.
--     (Mesmo WHERE do preview. Rodar de novo não causa dano: linhas já
--      reclassificadas não casam mais com tipo='mercado'.)
/*
UPDATE compras
SET tipo = 'outros'
WHERE tipo = 'mercado'
  AND loja IS NOT NULL
  AND (
       loja ILIKE '%farmac%' OR loja ILIKE '%farmác%' OR loja ILIKE '%drogar%'
    OR loja ILIKE '%drogasil%' OR loja ILIKE '%pacheco%' OR loja ILIKE '%pague menos%'
    OR loja ILIKE '%raia%' OR loja ILIKE '%ultrafarma%'
    OR loja ILIKE '%posto%' OR loja ILIKE '%combust%' OR loja ILIKE '%petrol%'
    OR loja ILIKE '%ipiranga%' OR loja ILIKE '%shell%' OR loja ILIKE '%br mania%'
    OR loja ILIKE '%restaurant%' OR loja ILIKE '%lanchonet%' OR loja ILIKE '%pizzar%'
    OR loja ILIKE '%hamburg%' OR loja ILIKE '%churrasc%' OR loja ILIKE '%espetin%'
    OR loja ILIKE '%padaria%' OR loja ILIKE '%panific%' OR loja ILIKE '%confeitar%'
    OR loja ILIKE '%açaí%' OR loja ILIKE '%acai%' OR loja ILIKE '%sorveter%'
    OR loja ILIKE '%cafeter%' OR loja ILIKE '%bar %' OR loja ILIKE '%pet shop%'
    OR loja ILIKE '%petshop%' OR loja ILIKE '%papelar%' OR loja ILIKE '%livrar%'
  );
*/

-- 1C. CORREÇÃO MANUAL pontual (se o preview mostrar um caso específico que a
--     heurística não pegou, ou pegou errado). Edite e rode conforme precisar:
/*
-- marcar uma loja específica como não-mercado:
UPDATE compras SET tipo = 'outros' WHERE loja ILIKE '%NOME EXATO%';
-- desfazer (voltar para mercado) se a heurística errou:
UPDATE compras SET tipo = 'mercado' WHERE loja ILIKE '%NOME EXATO%';
*/


-- ============================================================
-- PARTE 2 — Completar itens_compra.preco_total (OPCIONAL)
-- ============================================================
-- IMPORTANTE — leia antes de rodar:
-- O app já trata linhas antigas com FALLBACK preco*quantidade (idêntico ao
-- que este UPDATE gravaria). Ou seja: este backfill NÃO muda nenhum número
-- exibido no /gastos. Ele só serve para "completar a coluna" e poder, no
-- futuro, remover o fallback do código.
--
-- Ressalva honesta: para cupons antigos onde o Gemini gravou o TOTAL da linha
-- dentro de `preco` (bug que motivou a coluna preco_total), preco*quantidade
-- fica dobrado — e este backfill congelaria esse valor errado. Como a imagem
-- não é guardada, NÃO há como recuperar o valor correto. Por isso este bloco
-- é OPCIONAL e vem comentado. Recomendação: deixar NULL e confiar no fallback,
-- a menos que você queira a coluna 100% preenchida por algum motivo analítico.

-- 2A. PREVIEW — quantas linhas estão sem preco_total.
SELECT
  COUNT(*)                                  AS itens_sem_preco_total,
  COUNT(*) FILTER (WHERE preco IS NOT NULL) AS com_preco_para_derivar
FROM itens_compra
WHERE preco_total IS NULL;

-- 2B. APLICAR (opcional) — materializa o mesmo valor do fallback.
/*
UPDATE itens_compra
SET preco_total = ROUND(COALESCE(preco,0) * COALESCE(quantidade,1), 2)
WHERE preco_total IS NULL
  AND preco IS NOT NULL;
*/


-- ============================================================
-- VERIFICAÇÃO FINAL (depois de aplicar a Parte 1)
-- ============================================================
-- Distribuição de tipos após o backfill:
SELECT tipo, COUNT(*) AS qtd, ROUND(SUM(total),2) AS total_reais
FROM compras
GROUP BY tipo
ORDER BY qtd DESC;
-- ============================================================
