# 🧾➕ Desenho técnico — Ingestão multi-documento (Frente 1, cod-0060)

> **Criado:** 2026-07-15 · **Sessão:** Opus + Gabriel (Cowork) · **Tipo:** desenho técnico (cod-0060, planejamento — não código)
> **Doc-mãe:** `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` (Frente 1) · **Resumo em toda sessão:** CLAUDE.md seção 7.2
> **Saída deste desenho:** desbloqueia **cod-0061** (receber documento) e **cod-0062** (ler PIX) pra "Fila pronta".

---

## 1. Objetivo e recorte do MVP

Expandir o gesto zero-atrito do cupom para **outros documentos financeiros**, começando pelo **comprovante de PIX**. A pessoa manda o arquivo (foto ou PDF), o bot entende, registra e confirma — reusando o máximo do pipeline do cupom. Destrava a primeira fatia da G1 (gasto fora do mercado / invisível), reprovada em 06-09 porque "o bot só vê cupom".

**Recorte decidido nesta sessão (3 forks):**
1. **Modelo de dados:** estender `compras.tipo` (reuso), **não** criar tabela nova.
2. **Escopo do 1º build:** **só PIX** (cod-0061 plumbing + cod-0062 leitura). Fatura e notificação = fases seguintes.
3. **Detecção do tipo de documento:** o **próprio Gemini** classifica na extração (campo `tipo_documento`), sem atrito e sem chamada extra.

**Fora do escopo do MVP:** fatura de cartão, notificação de banco, i18n, gate Pro, persistência de moeda, insight dedicado de PIX (query "pra onde vai fora do mercado").

---

## 2. Invariantes (não são forks — valem por decisão de memória)

- **LGPD — processa-em-memória-e-descarta.** O documento (imagem/PDF) é baixado, mandado ao Gemini e **descartado**; nunca persistido. Vale a postura do cupom (skill `economizei-security-lgpd`). `/apagar` já deleta as linhas de `compras`/`itens_compra` do usuário → cobre PIX automaticamente (é `tipo='pix'` na mesma tabela). Confirmar no teste do `/apagar`.
- **Classificação é o coração.** O corpus de regressão de cupom (`test/classificacao-corpus.test.js`) **tem que continuar verde** — é o guarda-rail de que a mudança no prompt não estragou a leitura de cupom. PIX ganha o seu próprio mini-corpus (precisa de comprovantes reais — ver §7).
- **Não contaminar as médias.** `tipo='pix'` fica fora de `calcularMedia` (que já filtra `tipo='mercado'` ✅) e fora de `precos_mercado` (ver o ajuste obrigatório em §4).
- **Firewall.** "pix" é token do `check-firewall`. A cod-0062 vai **acusar de propósito** (é LER comprovante, não cobrar) → revisão humana consciente no commit. Zero token de `is_pro`/plano/preço.
- **Custo Gemini.** Cada documento = 1 chamada Gemini → **conta na cota** de 10/mês do Free (mesma regra do cupom não-mercado). PIX é barato (1 imagem / 1 página). Fatura (N páginas) é que vai exigir aritmética própria — por isso fica pra fase Pro.

---

## 3. Pipeline unificado (reuso da fundação)

O fluxo do cupom já é: `webhook → validarPayloadWebhook → despacharComDedup → processarImagem → baixarImagem → lerRecibo → validarSchema → salvarCompra → confirmação`.

O multi-documento **entra como um 4º ramo** e reusa o miolo:

```
webhook (Z-API)
  ├─ body.text   → 'texto'      → processarTexto        (hoje)
  ├─ body.image  → 'imagem'     → processarImagem       (hoje)
  ├─ body.document → 'documento' → processarDocumento   ◀── cod-0061 (NOVO: baixa + roteia por MIME)
  └─ (outro)     → 'ignorado'                            (hoje)

processarDocumento / processarImagem
  → baixar(arquivo)                        (zapi.js: baixarDocumento novo, espelha baixarImagem)
  → lerRecibo(buffer, mime)                (gemini.js: prompt retorna tipo_documento)   ◀── cod-0062
  → validarSchema(dados)                   (branch por tipo_documento: cupom | pix)     ◀── cod-0062
  → salvarCompra(phone, dados)             (aceita tipo='pix'; loja=contraparte; itens=[]) ◀── cod-0062
  → confirmação                            (formatter: montarConfirmacaoPix)            ◀── cod-0062
```

**Chave:** o comprovante de PIX pode chegar como **imagem** (print) OU **documento** (PDF). Então o roteamento por tipo de documento **não** é feito pelo container (image/document) — é feito pelo Gemini via `tipo_documento`. `processarImagem` e `processarDocumento` convergem no mesmo `lerRecibo`; quem decide "é cupom ou é PIX" é a resposta do Gemini.

---

## 4. Taxonomia de tipos de registro (`compras.tipo`)

| `tipo` | O que é | `loja` | `itens_compra` | Entra em `calcularMedia`? | Entra em `precos_mercado`? |
|---|---|---|---|---|---|
| `mercado` | cupom de supermercado (hoje) | nome do mercado | N itens | **sim** | **sim** |
| `outros` | cupom de não-mercado (hoje) | nome da loja | N itens | não | não |
| `pix` ◀ NOVO | comprovante de PIX/transferência | **contraparte** (destinatário) | **vazio** | não | não |
| *(futuro)* `fatura` | fatura de cartão | banco/emissor | N transações | não | (decidir) |

**Por que PIX encaixa limpo:** um comprovante de PIX é uma `compra` com `total` (valor) + `loja` (contraparte) + `data_compra` + **zero itens**. O `salvarCompra` já tolera `itens=[]` (o loop não roda) e `cnpj=null`. Como PIX não tem `itens_compra`, ele **não aparece** no `/gastos` por categoria — sem contaminação. O valor imediato é a **confirmação** ("PIX registrado: R$X pra Fulano").

**⚠️ Ajuste obrigatório (achado nesta sessão):** hoje `salvarCompra` faz
`if (tipo !== 'outros') registrarPrecosMercado(...)`.
Com `'pix'` adicionado, `'pix' !== 'outros'` é **verdadeiro** → PIX entraria na base de preços de mercado por engano. **Trocar para `if (tipo === 'mercado')`.** (Muda 1 linha; comportamento de `mercado`/`outros` fica idêntico.)

---

## 5. O detector de tipo (`tipo_documento` no prompt)

Uma só chamada Gemini classifica **e** extrai. O prompt do cupom é **preservado inteiro** (protege o coração) e ganha um campo no topo + um ramo:

- Novo campo de saída: `"tipo_documento": "cupom" | "pix" | "fatura" | "outro"`.
- Se `cupom` → retorna exatamente o schema de hoje (loja, total, itens[], cnpj, tipo mercado/outros). **Nada muda.**
- Se `pix` → retorna `{ valor, data, contraparte, tipo_documento:"pix" }` e `itens: []`.
- Se `fatura` ou `outro` → no MVP, resposta honesta: "por enquanto eu leio cupom e comprovante de PIX; fatura ainda estou aprendendo" (sem inventar dado). Não quebra nada.

`validarSchema` passa a **ramificar por `tipo_documento`**: mantém o caminho cupom intacto e adiciona o caminho PIX (validação de `valor`/`data`/`contraparte`, saída segura, nunca exceção — mesmo padrão do cod-0051). Ambiguidade → cai em `outro` e o bot pergunta gentilmente.

**Guarda-rail:** o corpus de cupom precisa ficar verde depois de adicionar o ramo PIX. É o teste que prova que a detecção nova não fez o cupom regredir.

---

## 6. Desdobramento em tarefas (prontas pra "Fila pronta")

### cod-0061 — Frente 1: receber DOCUMENTO (foto/PDF) no webhook (plumbing)
- **tipo:** feature-codigo · **skills:** code-decisions, tdd, security-lgpd, financial-firewall
- **objetivo:** detectar mensagem de documento no payload Z-API (hoje só texto/imagem), baixar com o mesmo padrão de retry/validação da imagem, e rotear por MIME pro mesmo `lerRecibo`. **Só a plumbing — não interpreta PIX ainda** (isso é a cod-0062).
- **arquivos-alvo:** `src/index.js` (`validarPayloadWebhook` reconhece `body.document` → tipo `'documento'` com `documentUrl`+mime; dispatch → `processarDocumento`), `src/zapi.js` (`baixarDocumento`, espelha `baixarImagem`), `test/`
- **critérios:** payload de documento válido → baixa e roteia; MIME inaceitável (não imagem/PDF) → mensagem honesta; retry/validação de tamanho como na imagem; **cupom e imagem seguem idênticos**; node --test verde; firewall verde
- **fora-de-escopo:** extração/classificação de PIX (é cod-0062); gravar em `compras`; fatura
- **depende-de:** — (independente; pode ir já)

### cod-0062 — Frente 1: ler comprovante de PIX (foto/PDF)
- **tipo:** feature-codigo · **skills:** code-decisions, tdd, product-principles, copywriter, copy-review, security-lgpd, financial-firewall
- **objetivo:** o Gemini classifica o documento (`tipo_documento`) e, se PIX, extrai valor/data/contraparte; grava como `compras` `tipo='pix'` (contraparte→`loja`, itens=[]); confirma no WhatsApp com o número primeiro.
- **arquivos-alvo:** `src/gemini.js` (campo `tipo_documento` + ramo PIX no prompt e no `validarSchema`), `src/supabase.js` (`salvarCompra` aceita `tipo='pix'` + **trocar o guard de `precos_mercado` pra `=== 'mercado'`**), `src/formatter.js` (`montarConfirmacaoPix` — número primeiro, sem gíria), `test/` (+ mini-corpus PIX)
- **critérios:** comprovante PIX (imagem/PDF) → `tipo_documento='pix'`, valor/data/contraparte extraídos, `salvarCompra` grava tipo `pix` com itens vazios; PIX **não** entra em `calcularMedia` nem em `precos_mercado`; **corpus de cupom continua verde** (coração intacto); mini-corpus PIX verde; confirmação com R$ no topo; node --test verde; firewall verde (o token "pix" acusa de propósito — revisão humana)
- **fora-de-escopo:** insight/query dedicado de PIX ("pra onde vai fora do mercado"); fatura; gate Pro; i18n
- **depende-de:** cod-0061

---

## 7. Pendências humanas (só o Gabriel / fora do firewall)

- [ ] **Verificar se `compras.tipo` tem CHECK constraint.** Se for coluna `TEXT` livre (provável — o código insere string simples), **zero migration**, `'pix'` já funciona. Se houver `CHECK (tipo IN ('mercado','outros'))`, precisa `ALTER` pra incluir `'pix'` (zona `supabase/` = humano; escrevo o `.sql` se precisar). Query de 1 min no SQL Editor.
- [ ] **Fornecer 2–3 comprovantes de PIX reais** (print e/ou PDF) pro mini-corpus de regressão da cod-0062 — sem eles a extração de PIX não tem como ser validada (mesma lógica do corpus de cupom).
- [ ] **Confirmar que a Z-API entrega mensagem de documento** e com qual campo/URL (o `body.document`/`documentUrl` do desenho é o esperado — validar no payload real de um PDF enviado a você mesmo).
- [ ] **Gemini + PDF:** confirmar que o modelo aceita `application/pdf` inline (Gemini 2.5 aceita); se um PDF específico falhar, o fallback é rasterizar a 1ª página (lib) — decisão de implementação da cod-0061, não bloqueia o desenho.

---

## 8. Fases seguintes (fora do MVP, registradas pra não se perder)

- **Fatura de cartão (cod-006x futuro):** o documento que **destrava a G1 inteira** (assinaturas, gasto invisível). É multi-transação → revisita o modelo de dados (cada lançamento = "item"? ou o modelo `registros`?), custo Gemini alto (N páginas), corpus próprio de lançamentos crípticos ("PAG*IFOOD"), e **provável Pro** (decisão de pricing = humano/firewall). Só depois do PIX provado.
- **Notificação de banco:** registro avulso parecido com PIX (valor+estabelecimento+hora) — barato, entra fácil depois do PIX.
- **Insight dedicado de PIX:** "pra onde vai seu dinheiro fora do mercado" — query nova em `insights.js` + intent no Agente. Sobe quando houver volume de PIX registrado.

---

*Regras permanentes: firewall intocado até o gate humano; Teste de Norte pra cada feature; classificação é o coração — em qualquer documento.*
