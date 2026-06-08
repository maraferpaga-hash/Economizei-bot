# 🔎 Revisão Geral do Projeto — SWOT + Matriz Eisenhower

> **Arquivo:** `Economizei app/Revisao_Geral_SWOT_Eisenhower_2026-06-08.md`
> **Data:** 2026-06-08
> **Escopo:** CLAUDE.md, PROJECT_INSTRUCTIONS.md, CODE_GUIDE.md, índice de skills e código de `src/` (revisão de alto nível).
> **Método:** leitura cruzada de documentação × código real + `git status`/`git log`. Achados classificados por severidade (🔴 crítico / 🟠 alto / 🟡 médio / 🟢 baixo).
> **Formato:** dual-format (Resumo executivo em cima, Relatório completo embaixo) — padrão do projeto.

---

## ⚡ Resumo executivo

🎯 **Decisão / Objetivo:** O produto está tecnicamente maduro, mas há um **descompasso perigoso entre o que o CLAUDE.md diz que está pronto e o que está de fato em produção** — e o Pro está sendo vendido com features que ainda não existem. A revisão vira insumo para uma gestão por SWOT + Eisenhower.

**Ações principais (3–5 max):**

- **Commitar + dar push do trabalho de 07/06 (MP, `/convidar`, idempotência) na ordem migration→deploy correta** — hoje está só no working tree, fora do GitHub/Railway — 🧍 (Gabriel) + 🛠️ (runbook abaixo)
- **Decidir o destino do Pro:** construir 1 diferencial real (alerta inteligente é o mais barato) ou ajustar a oferta — não dá pra cobrar pelo que não existe — 🤝
- **Instrumentar e olhar a Retenção W2 toda semana** — é a métrica-mãe do go/no-go de paywall e escala; sem ela a gestão é cega — 🤝
- **Faxina rápida de coerência:** deps mortas (`cors`, `@vercel/analytics`), arquivos lixo (`teste.jpg`, `.fuse_hidden…`), versão do Node e contagem de skills divergentes entre docs — 🛠️
- **Adotar a skill `economizei-strategic-review`** (criada nesta sessão) para repetir esta auditoria por gatilho, sem reinventar — 🤖

**Hoje (≤1h):** rodar as 3 migrations pendentes no Supabase **antes** de qualquer push (`upsertUsuario` já lê colunas novas em toda mensagem — push sem migration quebra o bot inteiro), depois `git add/commit/push`.

**Próxima sessão:** escolher e especificar o primeiro diferencial do Pro a construir (recomendado: **alerta inteligente preditivo**, reaproveita `compras`/`calcularMedia`).

**Bloqueadores:** push é manual (Cowork não tem credencial do GitHub) → as ações 🧍 dependem do Gabriel na máquina dele.

---

## 📋 Relatório completo

### 1. O que foi revisado

| Camada | Arquivos | Veredito |
|---|---|---|
| Memória estratégica | `CLAUDE.md` (86 KB), `CALENDARIO.md`, `PROJECT_INSTRUCTIONS.md` | Densa, honesta, bem mantida. Risco de inflar (ver §2.3). |
| Memória técnica | `CODE_GUIDE.md` | Boa, mas com pontos desatualizados vs. código (Node, axios). |
| Sistema de skills | `.claude/skills/` (17 pastas) | Maduro e disciplinado. Índice desatualizado. |
| Código | `src/*.js` (4.321 linhas, 15 módulos) | Resiliente e bem estruturado. Não commitado em parte (🔴). |
| Banco | `supabase/*.sql` (10 migrations) | Migrations nomeadas e versionadas. 3 pendentes de rodar. |

O bot já tem: pré-processamento Sharp + retry, reconciliação item×total, idempotência por `messageId`, rate limit, dedup, fallback amigável, observabilidade (`/admin/metrics`, logs estruturados mascarando PII), scheduler de resumo/digest/reengajamento e dois caminhos de pagamento (PIX manual + assinatura recorrente Mercado Pago). Para uma operação solo, é um nível de robustez acima da média.

---

### 2. Achados

#### 2.1 🔴 Riscos críticos (mexer primeiro)

**🔴 A. Trabalho de 07/06 documentado como "implementado", mas não commitado nem deployado.**
O `git status` mostra `src/mercadopago.js` como **untracked** e as migrations `migration_003_indicacoes.sql`, `migration_2026-06-07_assinaturas_mp.sql`, `migration_2026-06-07_idempotencia_messageid.sql`, `backfill_2026-06-07_dados_antigos.sql` também **untracked**, além de `index.js`, `supabase.js`, `scheduler.js`, `CLAUDE.md`, `CODE_GUIDE.md` **modificados e não commitados**. O último commit é `5f08cf4` (coerência de outputs). Como o Railway só faz deploy no push da `main`, **nada disso está em produção**. O CLAUDE.md descreve Mercado Pago, `/convidar` e a "lei 5" como prontos — mas para o usuário final eles não existem ainda. Risco duplo: (1) perda do trabalho se o working tree for descartado; (2) a memória institucional passa a mentir sobre o estado real.

**🔴 B. Ordem migration→deploy é uma armadilha de "bot quebrado".**
`upsertUsuario()` (chamado em **toda** mensagem recebida) já faz `SELECT` das colunas novas: `features_pro_ate`, `plano`, `assinatura_status`, `assinatura_pendente_plano`, `mp_preapproval_id` (supabase.js, linha 24). Se o `supabase.js` novo subir **antes** de rodar as migrations que criam essas colunas, **todo webhook lança erro e o bot fica 100% mudo**. Isso não é hipótese — é o caminho default se o push acontecer antes do SQL. Precisa de um runbook fixo: **migration primeiro, push depois, smoke logo em seguida.**

**🔴 C. O Pro vende o que ainda não existe.**
CLAUDE.md §3 lista como diferencial pago o **comparativo entre mercados** e o **alerta inteligente preditivo** — e a própria pesquisa aponta o comparativo como a "killer feature". No código, nenhum dos dois existe: o `temFeaturesProAtivas()` é só um helper sem consumidores, a base `precos_mercado` ainda não tem volume para query, e o alerta atual é reativo (compara com a média), não preditivo. Hoje o Pro entrega na prática **apenas "cupons ilimitados"**. Cobrar R$9,90 por um diferencial inexistente é risco de churn e de credibilidade — e contradiz o princípio "pago é genuinamente melhor".

#### 2.2 🟠 Inconsistências documentação × código

| # | Inconsistência | Evidência |
|---|---|---|
| 🟠 D | **Versão do Node divergente.** | `package.json` exige `engines.node >=22`; `CODE_GUIDE.md` e o comentário do `mercadopago.js` dizem "Node ≥ 18". |
| 🟠 E | **`axios` "removido" mas ainda em uso.** | `CODE_GUIDE.md`: "fetch nativo eliminou axios". Mas `zapi.js` faz `require('axios')` e `axios` está no `package.json`. Resultado: **dois clientes HTTP** no mesmo código (fetch no MP, axios no Z-API). |
| 🟡 F | **Dependências mortas no bot.** | `cors` (só comentado no `index.js`) e `@vercel/analytics` (é da landing) estão no `package.json` do bot sem uso em `src/`. |
| 🟡 G | **Contagem de skills não bate.** | CLAUDE.md diz "15 skills", CODE_GUIDE diz "14 skills operacionais", o README numera até 14 (com "9b"). Na pasta há **15** `economizei-*` + `copy-review` + `roadmap-deps` = **17 pastas**. As duas últimas nem aparecem no índice do README. |
| 🟡 H | **`CODE_GUIDE.md` com linha truncada.** | A linha da decisão do "Alerta em 3 níveis" termina cortada em `ALERTA_M…` — registro incompleto na tabela de decisões técnicas. |
| 🟡 I | **Contrato de função desatualizado.** | `avaliarQualidadeCanonicoItem()` retorna `'muito_curto'` (gemini.js:147), valor que **não** está no comentário-contrato (linha 136). |
| 🟢 J | **Regra de tamanho de arquivo já violada.** | CODE_GUIDE: "quando `index.js` passar de 800 linhas, extrair handlers". Hoje tem **901 linhas**. |
| 🟢 K | **Arquivos lixo versionáveis.** | `src/.fuse_hidden0000001000000001`, `teste.jpg` na raiz, `src/test-gemini.js` (script ad-hoc misturado ao código de produção). |
| 🟢 L | **Falso positivo conhecido.** | Heurística `pouco_simplificado` do quality-check de canônicos acusa ~56% dos itens sem problema real (já registrado no CLAUDE.md, segue pendente). |

#### 2.3 🟢 Observações estruturais (não são erros)

- **CLAUDE.md está grande (86 KB).** A disciplina de arquivamento (`arquivo-historico/`) é boa, mas a seção 11 (histórico de comandos verbatim) tende a crescer sem teto. Sugestão: mover sessões com mais de ~30 dias para o arquivo histórico, mantendo só o pointer.
- **Sem testes automatizados de fato.** O `tdd` é "decisão preferida" e "cobertura não é meta"; a rede de segurança é o smoke manual. Aceitável no estágio, mas cada deploy depende de disciplina humana — frágil para quem tem 12h/semana.
- **`messageId` da idempotência depende do Z-API enviar o campo.** Se o payload não trouxer, o código processa sem dedup (loga `webhook_sem_message_id`). Confirmar no 1º cupom real que o campo chega — senão a "lei 5" não morde.

---

### 3. Análise SWOT

#### 💪 Forças (internas, positivas)

- **Zero atrito real e defensável.** Foto no WhatsApp, sem app, sem cadastro. O canal É o produto — e isso casa com o público B/C melhor do que qualquer concorrente de planilha/app.
- **Produto técnico robusto para operação solo.** Sharp + retry + reconciliação + idempotência + rate limit + fallback amigável + observabilidade. Pouca startup de 1 pessoa tem essa base.
- **Sistema de memória + skills disciplinado.** CLAUDE.md / CODE_GUIDE / skills por gatilho reduzem retrabalho e impedem decisão repetida. É um diferencial operacional raro.
- **Validação real, não suposta.** 30 respostas de pesquisa, dor confirmada em linguagem emocional, 3 personas claras.
- **Vantagem injusta de praça.** Rede física e cultural do fundador em Fernandópolis → boca-a-boca autêntico, CAC baixo, validação social em 30 dias.
- **Disciplina financeira.** Custo de oportunidade explícito (R$65/h), régua de MRR (R$4.225), gatilhos por evidência e não por ansiedade.

#### 🩹 Fraquezas (internas, negativas)

- **O diferencial do Pro não existe ainda** (comparativo + alerta preditivo). O pago vende promessa. *(🔴 C)*
- **Gap "documentado vs. deployado".** Trabalho crítico fora do GitHub/Railway; memória institucional descreve como pronto. *(🔴 A/B)*
- **Bus factor = 1.** Tudo depende do Gabriel, 12h/semana. Conteúdo e CS são gargalos previsíveis.
- **WTP não validado.** Só 13–16% pagariam com convicção; 45% diz "não pagaria". Paywall ativo antes de provar valor.
- **Sem rede de testes automatizada.** Regressão depende de smoke manual.
- **Dívida técnica somando.** `index.js` > 800 linhas, dois clientes HTTP, deps mortas, docs divergentes.
- **Retenção W2 (métrica-mãe) ainda não medida em escala.** MVP testado 1× sem volume.

#### 🌱 Oportunidades (externas, positivas)

- **Comparativo de mercados como fosso de dados.** A base `precos_mercado` cresce a cada cupom; vira killer feature defensável (efeito de rede). Quanto antes acumular volume, antes o Pro fica real.
- **Reframe "assistente de compras", não OCR.** Mata o detrator "já tenho isso no cupom" — o valor é temporal (agregação no tempo).
- **Boca-a-boca de cidade pequena + `/convidar`.** 1 viral local = dezenas de cadastros a custo ~zero.
- **Persona "filha preocupada" + plano Família.** Âncora de ARPU e canal de indicação intergeracional.
- **Mídia barata no interior.** Meta Ads geo-segmentado e TikTok local com CPM/CPC muito abaixo da capital.
- **Automação já pronta** (scheduler de resumo/digest/reengajamento) libera o tempo do fundador.

#### ⚠️ Ameaças (externas, negativas)

- **Custo do Gemini escala com o uso.** Sem unit economics validado, crescer machuca o caixa.
- **Dependência de Z-API sem CNPJ.** Instabilidade ou ban de número não-oficial é risco existencial do canal.
- **LGPD.** Cupom carrega CPF + dado financeiro. Vazamento ou uso indevido = risco jurídico e reputacional.
- **Concorrência = inércia + entrantes.** O rival real é a planilha/hábito; e bancos/apps de finanças com OCR podem entrar.
- **WTP baixo → "balde furado".** Escalar aquisição antes de validar retenção queima caixa.
- **Política do WhatsApp/Meta sobre automação** pode restringir o canal a qualquer momento.

**Leitura cruzada (TOWS):** a jogada central é **usar a Força "produto robusto + praça com boca-a-boca" para atacar a Oportunidade "comparativo como fosso"**, enquanto se **neutraliza a Fraqueza "Pro vazio"** construindo 1 diferencial real — tudo isso **defendido contra a Ameaça "custo Gemini"** mantendo o limite de 10 cupons no Free.

---

### 4. Matriz Eisenhower (urgência × importância)

Priorização calibrada para 12h/semana. Cada item traz o dono: 🤖 automação · 🛠️ script/execução técnica · 🤝 decisão do Gabriel + Claude · 🧍 só Gabriel.

#### 🟥 Q1 — Importante **e** Urgente → **FAZER AGORA**

- **Rodar as 3 migrations pendentes no Supabase** (idempotência, indicações, assinaturas MP) — 🧍 *(pré-requisito de tudo abaixo; sem isso o push quebra o bot)*
- **Commit + push do trabalho de 07/06** na ordem migration→deploy→smoke — 🧍 + 🛠️
- **Smoke pós-deploy** (mandar 1 cupom real e confirmar que `upsertUsuario` não quebra e que o `messageId` chega) — 🧍
- **Decisão do Pro:** construir 1 diferencial OU suspender a cobrança do que não existe — 🤝

#### 🟩 Q2 — Importante, **não** Urgente → **AGENDAR** (o coração do projeto)

- **Instrumentar e revisar Retenção W2 toda semana** (métrica-mãe do go/no-go) — 🤝
- **Construir o 1º diferencial do Pro** — recomendado **alerta inteligente preditivo** (reaproveita `compras`/`calcularMedia`, custo baixo) — 🤝 + 🛠️
- **Acumular dados para o comparativo de mercados** (já roda a cada cupom; garantir que o opt-in/anonimização seguem firmes) — 🤖
- **Conteúdo orgânico recorrente em Fernandópolis** (motor de aquisição barata) — 🧍 *(candidato nº 1 a freela quando W2 ≥ 30%)*
- **Reduzir dívida técnica:** extrair handlers do `index.js`, unificar HTTP em `fetch` (remover `axios`) — 🛠️

#### 🟦 Q3 — Urgente, **não** Importante → **AUTOMATIZAR / LOTE RÁPIDO**

- **Faxina de coerência:** alinhar versão do Node nos docs, corrigir contagem/índice de skills, completar a linha truncada do CODE_GUIDE, atualizar o contrato de `avaliarQualidadeCanonicoItem` — 🛠️ *(1 sessão curta de "doc-fix")*
- **Remover deps mortas** (`cors`, `@vercel/analytics`) e arquivos lixo (`teste.jpg`, `.fuse_hidden…`) — 🛠️
- **Afrouxar a heurística `pouco_simplificado`** (só ruído de log) — 🛠️
- **Health-check Z-API** já automatizado no scheduler — manter — 🤖

#### ⬜ Q4 — Nem Importante nem Urgente → **ADIAR / NÃO FAZER AGORA**

- Migração **Z-API → Meta Cloud API** (só após CNPJ + 50–100 usuários) — adiar
- **CNPJ / estrutura PJ / contador** (depende de validação) — adiar
- **Áreas suspensas** (CS estruturado, jurídico além do básico, INPI) — adiar
- **Refatorações estéticas** sem impacto em retenção/conversão — não fazer

> **Regra de ouro de priorização do projeto:** se uma tarefa não move **Retenção W2** ou **conversão Free→Pro**, ela não entra no Q1/Q2 — vai pro Q3 (automatiza) ou Q4 (adia).

---

### 5. Como repetir esta análise (skill nova)

Esta revisão foi encapsulada na skill **`economizei-strategic-review`** (`.claude/skills/economizei-strategic-review/SKILL.md`). Ela dispara quando o Gabriel pede *"revisão geral"*, *"faz um SWOT"*, *"prioriza com Eisenhower"*, *"o que tá inconsistente no projeto"* — e roda o mesmo procedimento: lê o estado real (docs + código + `git status`), classifica achados por severidade, monta SWOT e Eisenhower com dono por ação, e entrega em dual-format. Assim a auditoria deixa de ser um evento manual e vira rotina por gatilho.

---

*Documento gerado em 2026-06-08 como parte da revisão geral do projeto. Para registrar a decisão na memória institucional, adicionar uma linha em CLAUDE.md §8 (Decisões) apontando para este arquivo e para a skill nova.*
