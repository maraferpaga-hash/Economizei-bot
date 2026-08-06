# ✅ Checkpoint Integral — Nível 2 · 2026-08-01

**Executado por:** tarefa agendada `economizei-checkpoint-mensal` (automática, sem o Gabriel presente)
**Escopo:** checklist oficial do `Sistema_Checkpoints_Benchmarks_2026-06-30.md` (Lado A máquina/processo + Lado B software/produto)
**Regras respeitadas:** nada commitado · nenhum código de produto editado · zona financeira intocada · testes rodados em cópia limpa (`/tmp`)

---

## 🎯 Veredito geral: 🟡 AMARELO

> **O repositório está tecnicamente saudável — o que não está saudável é o escoamento.**
> Firewall 19/19 verde, 391 testes verdes (todos os que o sandbox consegue rodar), zero risco A9 no que está no ar, `/assinar`/Mercado Pago finalmente fechado. O amarelo vem de três coisas: (1) uma leva de código (**cod-0043**) parada há 3 dias no working tree que zerou a produção de 3 runs seguidas; (2) a **AGENDA está stale** de novo (afirma tree limpo e cod-0043 "por fazer"); (3) duas falhas de banco em **produção** e o **gate Pro que nunca foi ligado** — hoje quem paga R$9,90 recebe só "cupons ilimitados".

**Gatilhos que dispararam este checkpoint (todos os 3):** fim de cadeia (Alerta Pro `cod-0030..0035` fechada em `df18b53`) · volume (~10 tarefas commitadas desde 07-08) · tempo (24 dias desde o último N2, em 2026-07-08).

---

## 🤖 Lado A — Máquina / Processo

| # | Check | Status | Evidência |
|---|---|---|---|
| A1 | Working tree commitado | 🔴 | 6 arquivos sujos: `src/agent/{contexto.js*,classifier.js,index.js,periodo.js}` + `test/agent-contexto.test.js*` (*novos) + `RELATORIO_MATINAL.md`. ~707 linhas do **cod-0043**, implementadas em **2026-07-29 13:08–13:11**. Parado há **3 dias** |
| A2 | AGENDA × git reconciliados | 🟡 | AGENDA (mtime 07-28) diz "`origin/main` = HEAD = `aebb24a`, **working tree limpo**" — HEAD hoje é `1215d3c` e o tree **não** está limpo. **cod-0043 segue `status: pronta` na "🌙 Fila pronta"** e "🔧 Em revisão" está declarada vazia, quando na verdade o cod-0043 está feito e esperando revisão. Risco concreto: o `/tarefa` reimplementar algo que já existe |
| A3 | Firewall nunca burlado | 🟢 | `--selftest` **19/19 OK** · `--working` sobre os 6 arquivos: **"nenhuma mudança financeira/proibida detectada"**. O diff parado não encosta em dinheiro, `supabase/`, `.env*` nem `package.json` |
| A4 | Tarefas certas, ordem certa, skills declaradas | 🟢 | Regra 0 (esteira entupida) foi respeitada nas 3 runs bloqueadas · fila lida de cima pra baixo (cod-0066 `pausada` → cod-0043) · skills declaradas nos blocos da AGENDA e no relatório |
| A5 | RELATÓRIO sendo lido e agido | 🔴 | 3 relatórios matinais seguidos pedem a mesma coisa (`/entregar` do cod-0043) sem resposta. **4 runs, 1 entrega** |
| A6 | Consistência do próprio relatório matinal | 🟡 | O `RELATORIO_MATINAL.md` foi escrito **hoje** (mtime 2026-08-01 16:27) mas o cabeçalho diz **"Data: 2026-07-30"** e "segundo dia consecutivo", enquanto o corpo fala em "**3ª run bloqueada**" e pede pra conferir 31/07. Cabeçalho desatualizado dentro do próprio arquivo — o bloco de data da rotina matinal não está sendo regravado |
| A7 | Mistério do `PAINEL.html` | 🟢 | **Resolvido:** o arquivo agora está **rastreado no git** (`git ls-files` retorna). Não aparece mais como untracked |

**Métricas de saúde da máquina**

| Métrica | Valor | Leitura |
|---|---|---|
| Tarefas commitadas desde o último N2 (07-08) | ~10 (cod-0041/0042/0051/0052/0053/0032/0034/0061/0033/0035) | 🟢 produção real no período |
| Dias desde o último commit | **4** (`1215d3c`, 07-28) | 🟡 |
| Runs matinais que produziram (últimas 4) | **1 de 4** (28/07 ⛔ · 29/07 ✅ produziu sem fechar passos 7 e 9 · 30/07 ⛔ · 01/08 ⛔; 31/07 sem relatório = provável run inexistente) | 🔴 gargalo no `/entregar`, não na fila |
| Rodadas acumuladas sem revisão | **1** (meta 0–1) | 🟡 no limite — e essa 1 está bloqueando tudo |

> **Diagnóstico do Lado A em uma frase:** a Máquina 2.0 subiu o teto de produção por run, mas o gargalo migrou pro consumo — **a esteira produz mais rápido do que o `/entregar` escoa**. A Regra 0 está funcionando exatamente como projetada (protege o fatiamento de commits), só que sem revisão humana ela transforma cada dia seguinte em zero.

---

## 🛒 Lado B — Software / Produto

| # | Check | Status | Evidência |
|---|---|---|---|
| B1 | Suíte completa verde (cópia limpa em `/tmp`) | 🟢 | **391 testes passando, 0 falhas reais**, em 25 dos 32 arquivos. Os outros **7 arquivos morrem com `SIGBUS` ao carregar o `sharp`** — ambiental do sandbox (confirmado: `node -e "require('sharp')"` mata o processo sozinho). São exatamente os mesmos 7 da sentinela de 07-26: `classificacao-corpus`, `erro-copy`, `gemini-canonico`, `gemini-extracao`, `webhook-auth`, `webhook-dedup`, `webhook-documento` |
| B1b | Coerência da contagem | 🟢 | 331 (baseline sentinela 07-26) + 38 (`alerta-limite`, cod-0035) + 22 (`agent-contexto`, cod-0043) = **391**. Bate exatamente — nenhum teste sumiu no caminho |
| B2 | Corpus de regressão de classificação | 🟡 | **Não verificável no sandbox** (SIGBUS/sharp). Atenuante importante: o `classifier.js` mexido pelo cod-0043 é o **classificador de INTENÇÃO do Agente**, não a extração/categorização de item — **o coração (`gemini.js`) não foi tocado** por esta leva. Ainda assim, só o `npm run check` no Windows fecha esse check |
| B3 | `check-pages` | 🟢 | 5 páginas, **0 erros**, 20 avisos (rotas absolutas resolvidas pelo Vercel — esperado) |
| B4 | Anti-A9 no que está NO AR | 🟢 | O cod-0035 (já deployado em `df18b53`) usa só `acompanhamentos.limite_mensal` e `.alertado_em` — **ambas existem** no `migration_FUTURA_alerta_pro_acompanhamentos.sql`, já rodado. O cod-0043 parado é **100% em memória** (sem tabela, sem coluna, sem migration) — seguro pra subir |
| B5 | Anti-A9 — dívida de schema **em produção** | 🔴 | **`lembretes_enviados` não existe no banco** (achado 07-26, ainda aberto) e o código a usa em 3 pontos (`supabase.js` 1204/1226/1587) + está nas `CHECAGENS_CRITICAS` do `schemaGuard`. O `.sql` já está escrito (`supabase/migrations/create_lembretes_enviados.sql`) — **nunca rodado**. Consequência: reengajamento D3/D10 sem onde registrar |
| B6 | Saúde do banco — RLS da dedup | 🔴 | `mensagens_processadas` com RLS sem policy de insert → `registrarMensagemProcessada` falha em toda mensagem. Dedup fail-open: o cupom processa, mas **sem proteção contra reprocessar a mesma foto** (custo Gemini duplicado + compra duplicada). Aberto desde 07-26 |
| B7 | `.env.example` × envs que o código lê | 🟡 | **Faltam 4** que o código lê: `AGENTE_MODO`, `AGENTE_MODELO`, `LIMITE_PERGUNTAS_FREE`, `COMPARATIVO_AMOSTRAS_FREE` — todas com default seguro no código, então **não quebram deploy**, só ficam invisíveis pra quem for configurar. **Sobram 4 mortas:** `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_WEBHOOK_URL`, `MP_BACK_URL` (Mercado Pago, aposentado em `4f49ae7`). Detalhe cosmético: a linha `ZAPI_WEBHOOK_TOKEN= SUA_CHAVE_AQUI` está solta no fim do arquivo, sem seção nem comentário |
| B8 | Copy × features — `/assinar` / Mercado Pago | 🟢 | **FECHADO.** Nenhum handler de `/assinar` no `src/index.js`; comentário `[REMOVIDO 2026-07-26]` no lugar; `/planos` aponta pro PIX manual. A §4.3 da Auditoria Integral pode ser considerada encerrada também na verificação independente |
| B9 | Copy × features — promessa de "alerta inteligente" | 🟡 | `montarMensagemPlanos` (formatter.js:488) promete no Individual: *"Alerta inteligente (**preditivo** + categorizado por tipo de item)"*. O "categorizado por tipo de item" **virou verdade** com o cod-0033/0035 (`/acompanhar`, `/teto`, `/superfluo`). O "**preditivo**" continua **não existindo** — é o cod-0049, ainda na fila. A promessa encolheu de falsa pra parcialmente falsa |
| B10 | Coerência do que o pago entrega | 🔴 | **O gate Pro nunca foi ligado.** `/comparar` usa `COMPARATIVO_AMOSTRAS_FREE` (default 3) **igual pra todos** e o próprio código comenta *"o gate por plano pago é passo humano SEPARADO"*; os comandos do Alerta Pro declaram *"SEM gate Pro"*. O único `is_pro` que decide algo de verdade é o limite de 10 cupons (`supabase.js:214`). **Na prática, hoje R$9,90/mês compra só "cupons ilimitados"** — as duas features de vitrine do Individual estão liberadas no free. Efeito colateral: a recompensa de indicação ("*7 dias das funções Pro*", formatter.js:1050/1062/1071) **não entrega nada**, porque não há nada trancado pra destrancar. Zona financeira = humana (`Gate_Pro_Desdobramento_2026-07-10.md` continua sem aplicação) |
| B11 | Código morto do MP | 🟢 (nota) | `formatter.js` e `supabase.js` ainda exportam ~15 funções órfãs do Mercado Pago (`montarMensagemLinkAssinatura`, `salvarAssinaturaPreapproval` etc.). Nenhuma tem caminho de chamada — é lixo, não bug. É a **cod-0066**, hoje `pausada` por decisão sua ("não quero que nada como apagar os dados do MP seja feito") |
| B12 | Saúde de produção (uptime, custo Gemini, taxa de processamento) | ⬜ não verificável | Depende de painéis que só você acessa (Railway/UptimeRobot/Google Cloud/Supabase). Continua coberto pelas auditorias **aud-02** e **aud-04**, ainda abertas |

---

## 🧍 Ações do Gabriel (priorizadas)

### 🔴 Agora — destrava tudo o mais barato

1. **`/entregar` do cod-0043** (~25–30 min, 1 commit). É o único bloqueio da máquina: 3 runs seguidas produziram zero por causa dele. `npm run check` na sua máquina primeiro (é o gate real — o sandbox não roda `sharp`). O diff é limpo: firewall verde, **sem migration, sem env nova**, 22 testes próprios verdes.
2. **Reconciliar a AGENDA no mesmo passo** — cod-0043 sai da "🌙 Fila pronta" → "✅ Concluído" com o hash; atualizar o bloco "🎯 Estado" do topo (hoje ainda diz `aebb24a` + tree limpo) e o campo "Último checkpoint integral" (**2026-07-08 → 2026-08-01**). Sem isso o `/tarefa` reimplementa o que já existe.

### 🔴 Produção — duas falhas silenciosas de banco (SQL Editor, ~10 min as duas)

3. **Rodar `supabase/migrations/create_lembretes_enviados.sql`.** O código já chama a tabela em 3 pontos; sem ela, o reengajamento D3/D10 falha em silêncio. Achado de 07-26, ainda aberto.
4. **Criar a policy de insert em `mensagens_processadas`** (ou alinhar a service key). Hoje a dedup falha em toda mensagem: a mesma foto pode ser processada duas vezes — custo Gemini dobrado e compra duplicada no histórico.
5. **DROP das colunas/tabela MP no Supabase** (o deploy já passou, o passo 3 do plano liberou) — aproveitar a mesma sentada pra fechar a **§3.3 da Auditoria Integral**: verificar se a RPC `incrementar_compras_mes` existe em produção (se não existir, todo cupom usa o fallback racy em silêncio).

### 🟡 Decisão de produto/dinheiro — a promessa do pago

6. **Ligar o gate Pro, ou encolher a copy.** Hoje o Individual não entrega nada além de cupons ilimitados, e o prêmio de indicação é vazio. Duas saídas honestas: (a) aplicar o `Gate_Pro_Desdobramento_2026-07-10.md` (comparativo limitado no free, completo no Pro; `features_pro_ate` passa a valer algo); ou (b) reescrever `/planos` pra prometer só o que está trancado. Enquanto nenhuma das duas acontecer, o `/planos` vende algo que o free já tem.
7. **Tirar "preditivo" do `/planos`** enquanto o cod-0049 não estiver no ar — ou priorizar o cod-0049 (ele está na fila, gated pelo cod-0035, que **já foi entregue**, então o gate caiu).

### 🟢 Higiene — quando sobrar 15 min

8. **`.env.example`:** adicionar `AGENTE_MODO`, `AGENTE_MODELO`, `LIMITE_PERGUNTAS_FREE`, `COMPARATIVO_AMOSTRAS_FREE` (com os defaults do código) e remover os 4 `MP_*` mortos; arrumar a linha solta do `ZAPI_WEBHOOK_TOKEN`. Zona `.env*` = sua.
9. **Corrigir o cabeçalho de data do relatório matinal** (a rotina reescreve o corpo mas mantém a data antiga — confunde na leitura da manhã seguinte).
10. **Considerar a mudança de cadência** que o próprio relatório sugere: a máquina produz mais rápido do que você revisa. Opções: revisar a cada 2 dias em bloco, ou autorizar a run a **reconciliar a AGENDA** quando detectar leva órfã (hoje é proibido) — sem nunca commitar.

---

## 📌 Notas de método

- Testes rodados em cópia limpa de `/tmp/ec` (o mount do sandbox trunca/serve arquivos stale — regra 11 da §11). Rodados **arquivo a arquivo**, porque o processo de background é morto entre chamadas neste ambiente.
- As 7 falhas por `SIGBUS` são de ambiente (`sharp` não carrega no sandbox), **não** do código — mesmo padrão da sentinela de 07-26. **Só o `npm run check` no Windows fecha o B1/B2 de verdade.**
- Nada foi commitado, nenhum arquivo de produto foi editado, a zona financeira não foi tocada. Este documento e o resumo no `RELATORIO_SENTINELA.md` são as únicas escritas.
