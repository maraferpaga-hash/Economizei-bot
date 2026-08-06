# 🧪 Corpus de regressão — recibos e comprovantes

> Criado em 2026-08-05 com material real fornecido pelo Gabriel.
> Regido pelo **§0 do `CODE_GUIDE.md`** — *classificação é invariante crítico*.

## O que é

Fixtures de **expectativa de extração**: para cada documento real, o que o pipeline
(`gemini.js` → `validarSchema` → `salvarCompra`) deve produzir. Serve para dois
tipos de teste:

| Tipo | Como roda | Quando |
|---|---|---|
| **Offline (default)** | lê só o JSON — valida somas, taxonomia, categorias válidas, invariantes de `nome_canonico` | sempre, no `node --test` |
| **Vision (opt-in)** | manda a imagem pro Gemini e compara com o `esperado` | só com `CORPUS_VISION=1` + `GEMINI_API_KEY` (custa dinheiro — nunca no teste padrão) |

## Pastas

- `canada/` — 6 recibos reais de Vancouver/BC (`img/` tem as fotos). Base da **cod-0065**.
- `pix/` — 3 comprovantes de PIX. Base da **cod-0062**.

## ⚠️ Regra de privacidade (LGPD/PIPEDA) — inegociável

1. **Nenhum dado pessoal de terceiro entra neste diretório.** Os comprovantes de PIX
   originais contêm nome completo, CPF, chave PIX (telefone) e dados de conta de
   **outras pessoas**. Por isso `pix/` guarda **só a transcrição pseudonimizada** —
   os PDFs originais **não** são versionados.
2. **As imagens em `canada/img/` são recibos do próprio Gabriel**, sem nome, sem
   documento e com cartão mascarado pelo próprio estabelecimento. Podem ser versionadas.
3. **O que o produto extrai também obedece isso:** de um comprovante de PIX o bot
   guarda valor, data, contraparte e o ID da transação. **CPF, chave PIX, agência e
   conta são lidos e descartados — nunca persistidos.**

## Campos do fixture

- `esperado` — o que o extrator deve devolver.
- `categorias_aceitaveis` (por item, opcional) — quando a categoria é genuinamente
  ambígua, o teste aceita qualquer uma da lista. Evita teste quebradiço sem afrouxar o coração.
- `armadilhas` — o motivo de o caso existir. Ler antes de "consertar" um teste que falhou.
