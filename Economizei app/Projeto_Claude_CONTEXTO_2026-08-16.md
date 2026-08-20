# 📦 Contexto do Projeto Economizei — versão condensada e autossuficiente

> Documento de contexto para o "Projeto do Claude" (Claude Code / Cowork). Substitui as versões anteriores. Autossuficiente: quem lê aqui entende o projeto sem abrir mais nada. Em caso de conflito com os arquivos da pasta `C:\Economizei`, **a pasta vence**.

---

## 1. O que é o Economizei

Bot de WhatsApp que lê **cupom fiscal por foto** com IA (Gemini 2.5 Flash Vision), classifica os gastos automaticamente e devolve inteligência sobre o dinheiro da pessoa — **sem app, sem cadastro, sem planilha**. SaaS B2C, pré-lançamento, operado por 1 pessoa (Gabriel), ~12h/semana.

**Missão:** fazer o brasileiro médio entender o próprio gasto e usar IA para trazer conhecimento e inteligência a esse gasto. Não é um leitor de cupom; é a **camada de inteligência** sobre o gasto.

**Norte (frase-bússola):** *"a cada interação, o usuário sai sabendo algo sobre o dinheiro dele que ele não sabia antes."* Toda feature/copy/roadmap passa pelo **Teste de Norte**: joga em qual das 3 camadas — Ciência (saber) / Inteligência (entender) / Habilidade (agir melhor)? Sobe a escada? Entrega sem pedir mais trabalho da pessoa? A IA faz o peso? A promessa é real hoje (firewall)?

**Princípios inegociáveis:** (1) **zero atrito é o produto** — a foto do cupom é o gesto mínimo; (2) **grátis funciona de verdade, pago é genuinamente melhor** (modelo Spotify, não freemium-trial quebrado); (3) **a classificação do item é o CORAÇÃO** — todo "andar de cima" (gasto por categoria, comparativo, alerta) depende do item ter sido lido, nomeado (`nome_canonico`) e categorizado sem erro. Mexeu em extração/categoria/`nome_canonico` → corpus de regressão obrigatório antes de subir.

## 2. Público e praça

Classe B/C, 25–55 anos, WhatsApp como app principal, baixa tolerância a atrito, sensível a preço. 3 personas: **Carla** (otimizadora), **Bruno** (controlador), **Marina** (filha que instala pra mãe). Concorrente real = a planilha de Excel que a pessoa nunca manteve.

**Praça inicial:** Fernandópolis-SP e região (noroeste paulista) — Gabriel tem rede local → boca-a-boca autêntico. Canais por prioridade: TikTok/Reels geolocalizado → WhatsApp (grupos próximos) → Meta Ads geo (raio 30km) → boca-a-boca offline. Gíria de interior **só em marketing**, nunca no texto do bot/landing/docs.

**Regra nova (2026-08-05):** sem empresa BC **não se busca cliente — mas se busca usuário controlado**. Nada de aquisição paga, promessa comercial ou base grande até out/2026; uma **micro-cohort** (Gabriel + 5–10 próximos, grátis, sem promessa, com consentimento) é instrumento de aprendizado — alimenta corpus, `perguntas_log` e a primeira leitura de W2. **Pré-requisito inegociável antes de qualquer usuário externo: S2/S4 (service_role em uso + RLS ligado).** O desenho da micro-cohort segue **em aberto** por decisão do Gabriel ("quero repensar isso antes").

## 3. Modelo de negócio

| Plano | Mensal | Anual (destaque: "pague 10, leve 12") | Diferencial |
|---|---|---|---|
| Grátis | R$0 | — | 10 cupons/mês (limite técnico, custo Gemini), análise, resumo mensal, alerta básico, `/apagar` |
| Individual | R$9,90 | **R$99** | Cupons ilimitados + comparativo entre mercados + alerta inteligente |
| Família | R$15 | **R$150** | + visão consolidada de 3 pessoas |
| Família+ | R$22 | **R$220** | 5 pessoas |

⚠️ **O gate Pro nunca foi ligado** (achado B10 do checkpoint de 08-01): hoje quem pagasse R$9,90 receberia **só "cupons ilimitados"** — comparativo e alerta estão liberados no free, e a recompensa de indicação "7 dias Pro" não destranca nada. **Decidido em 2026-08-07: aplicar o desdobramento agora** → tarefas cod-0073 (`/comparar`), cod-0074 (comandos do Alerta Pro), cod-0075 (intent do Agente). A tarefa ficou 28 dias parada por uma premissa vencida (o doc de 07-10 dizia "nunca peça pra máquina aplicar isto" porque o firewall era **bloqueante**; desde 26/07 é **advisory**).

**Pagamentos — arquitetura "DOIS TRILHOS" (decidida 2026-07-17):** o Mercado Pago foi **abandonado juridicamente** (exige residência brasileira; Gabriel declarou saída fiscal e mora em Vancouver) e **removido do código** em 2026-07-27 (`4f49ae7`). A **empresa em BC (Canadá) reabre o Stripe**. Dois trilhos em paralelo, ambos terminam no mesmo `POST /admin/ativar-pro` (o bot não sabe por qual trilho a pessoa pagou):
- **Trilho A — DIRETO (Stripe, conta BC):** cliente que o Gabriel traz. Mensal + anual + cartão, recorrência automática, liquida em CAD. Margem alta. ⚠️ **comprador brasileiro paga IOF ~3,5%** (cross-border) — afeta conversão.
- **Trilho B — AFILIADOS (MoR, Hotmart default):** terceiro vende por você; só nos **anuais**; comissão 20–25% recorrente. Custo alto (~9,9% + comissão) só sobre venda incremental. Elegibilidade de produtor não-residente = **item a confirmar por plataforma**.

⚠️ Tudo isso depende da **empresa em BC, adiada pra OUTUBRO/2026** — até lá, **monetização em escala está estruturalmente pausada** e a métrica que manda é **retenção W2, não receita**. Dados fiscais a confirmar com contador: BC ~11% corp (SBD/CCPC até CAD 500k), GST/HST limiar CAD 30k, T2 anual obrigatório.

**Candidato a 4º pilar de receita (só registro estratégico, 2026-07-26):** venda de **inteligência agregada e anonimizada** de shopper data pra varejo/indústria/institutos. Prospecção só **pós-empresa BC + anúncios rodando + escala**. Recompensa ao usuário hoje = não-cash.

**Métricas e gatilhos-chave:** **W2 ≥ 30%** no cohort de Fernandópolis = gatilho que libera escalar aquisição · MRR ≥ R$4.225/mês = régua de retorno · ≥5 pagantes = automatizar cobrança · ~80% no anual = estrela-guia (não premissa) · custo por ativação (1º cupom) = métrica-rainha de mídia paga, não ROAS.

## 4. Stack e produto no ar

```
WhatsApp ← Z-API (webhook autenticado por token) → Express.js (Node ≥22, Railway) → Sharp → Gemini 2.5 Flash Vision → Supabase (Postgres)
```

Módulos em `src/`: `index.js` (webhook/roteador/comandos), `gemini.js` (extração `temperature:0` + reconciliação item×total), `supabase.js`, `formatter.js` (todas as mensagens), `alerts.js` (3 níveis), `insights.js` (análise pura), `charts.js` (QuickChart), `agent/` (Agente de Perguntas), `reengagement.js` (**módulo vivo mas desligado**), `scheduler.js`, `apagar.js` (LGPD), `schemaGuard.js` (guarda de schema no boot, 11 checagens). **`mercadopago.js` não existe mais**; restam funções órfãs em `supabase.js`/`formatter.js` = tarefa cod-0066.

**Funções vivas em produção (ago/2026):** leitura de cupom (mercado e não-mercado) · recebimento de documento foto/PDF no webhook (cod-0061) · **webhook autenticado, fail-closed** (cod-0053, rollout completo) · `/gastos` com gráfico + conclusão + bloco de gasto supérfluo · `/inflacao` · `/economia` · alerta em 3 níveis · **resumo mensal automático (dias 28–31) — a ÚNICA mensagem proativa do produto** · `/convidar` · `/apagar` (LGPD) · comparativo entre mercados (leitura) · **Alerta Inteligente Pro completo** (cadeia cod-0030..0035): matching por `nome_canonico`, `/acompanhar` `/acompanhamentos` `/parar` `/superfluo`, `/teto <alvo> <valor>` + alerta automático de limite · **Agente de Perguntas** — texto livre → classificador → executor determinístico (o número NUNCA nasce no LLM) → narração Gemini com firewall de fidelidade numérica; cota 30/mês; **12 intents**, com **sugestões pós-resposta** (cod-0044) e **gráfico sob demanda** (cod-0048). Validado end-to-end em produção em 07-09.

**Desligado por decisão (cod-0068, 2026-08-05):** o **reengajamento D3/D10**. Verbatim do Gabriel: *"vamos deixar de lado a ideia do reengajamento por agora, quero somente a mensagem de final de mês indicando o quanto se gastou"*. Achado que motivou: os lembretes **nunca enviaram uma única mensagem** (`lembretes_enviados` nunca foi criada → `lembreteFoiEnviado` lançava antes do envio). Consequência registrada: **sem toque proativo antes do dia 28, a W2 passa a medir retenção puramente orgânica.**

## 5. Como o trabalho acontece (os 3 pilares)

**Pilar 1 — Máquina de Programação (constrói):** automação LOCAL. Gabriel roda `/tarefa` no Claude Code, ou a rotina agendada das 8:02 (Vancouver) roda no sandbox. Pega tarefa(s) `pronta` da `AGENDA.md`, carrega as skills do campo `skills:`, implementa com teste (TDD), roda `npm run check` e mostra o diff. **Merge/push/deploy/migrations são sempre do Gabriel**, via `/entregar` (aprovação dupla — check verde **no resultado do merge** + "APROVO" literal — com checagem BLOQUEANTE de migrations/envs antes do push, porque o push dispara deploy no Railway). GitHub Actions foi descontinuado.

**Máquina 3.0 (2026-08-05) — regime HÍBRIDO:**
- **Runs locais (`/tarefa`):** a máquina **commita em branch `maquina/cod-XXXX`** — nunca na `main`, nunca `push`. Regem 3 leis: **LEI 1 pilha linear** (cada leva nasce do topo da anterior; ordem de merge = ordem de criação, nunca pular) · **LEI 2 teto de pilha = 3** branches não-mergeadas · **LEI 3 main parada** (se a `main` andou por baixo da base da pilha, a máquina para e avisa — nunca rebaseia sozinha). Painel "📚 Pilha da máquina" na AGENDA torna o estoque visível.
- **Rotina agendada (sandbox):** entrega em **working tree / modo TREE, git só-leitura**. Guardas: `.js` sujo **ou** pilha 3/3 **ou** `index.lock` ⇒ não produz nada.
- Teto por run: até **3 tarefas porte P, OU 1 porte M, OU 1 lote**, ≤ ~500 linhas de diff. Critério de agrupamento é **revisão, não token** (lote ideal ≈ 30 min de revisão); coração/financeiro nunca entram no mesmo lote. Existe uma **Fila de lastro** (só testes/revisão/segurança) como fallback quando a fila principal está bloqueada por pré-requisito — **não** quando a esteira está entupida.
- ⚠️ **Em aberto (teste de 5 min enfileirado desde 07/08):** o fix do lock **invalidou a premissa** que criou a variante TREE (*"o sandbox não consegue commitar"*) — o lock vinha da **leitura**, não da escrita. Nunca se testou de verdade se o sandbox commita. Nos dois resultados o ganho é o mesmo: **um modo só, decidido por evidência**.
- ⚠️ **A Máquina 3.0 nunca rodou uma vez.** O git prova: **zero merges** no repositório inteiro, e a única branch `maquina/*` da história foi criada e abandonada no mesmo minuto, sem receber commit. Todas as entregas desde 05/08 foram em **modo TREE**. Enquanto o teste acima não roda, o regime real é: **rotina agendada = TREE · runs locais = 3.0 no papel**.

**Causa-raiz do `index.lock` (resolvida 2026-08-07):** não era o commit. `git status` e `git diff` são comandos de **leitura que atualizam o índice** e por isso pegam o lock; no mount do sandbox o git cria dentro de `.git/` e não apaga. **`GIT_OPTIONAL_LOCKS=0` = zero lock** (reproduzido nos dois sentidos). Todo comando git das rotinas vai prefixado.

**Vigilância agendada (07-15):** 3 tarefas recorrentes no Cowork — sentinela semanal (AGENDA×git, firewall, testes, anti-A9, copy×features, regenera este CONTEXTO quando o estado muda; relatório em `RELATORIO_SENTINELA.md`), checkpoint N2 mensal (dia 1) e lembrete de sexta. Só leem/reportam — nunca commitam nem tocam dinheiro.

**Pilar 2 — Código/Produto (roda):** bot em produção no Railway. Deploy = `git push` do Gabriel. Regra anti-incidente-A9: **migration roda ANTES do código que a usa**.

**Pilar 3 — Marketing & Anúncios (futuro, gasta dinheiro real):** gated por W2 ≥ 30% + empresa BC. Meta Ads CTWA será o carro-chefe.

**Firewall financeiro — modo ADVISORY (desde 2026-07-26):** `scripts/check-firewall.mjs` **avisa mas não bloqueia** (sempre exit 0). **O gate real é a revisão humana no `/entregar`** — o Gabriel commita tudo. `supabase/`, `.env*`, `package.json` e deploy seguem sendo mão exclusiva dele. Selftest: 19/19.

**Sistema de skills:** 19 skills em `.claude/skills/`. Transversais sempre ligadas, incluindo **critical-partner** (senso crítico: 6 detectores; **para antes de executar** quando o pedido tem atrito real; o Gabriel decide sempre; log em `Economizei app/CRITICA_LOG.md` — 3 acatos pelo mesmo motivo viram regra permanente, 3 recusas recalibram o detector).

**Padrão de fundo registrado no CRITICA_LOG (detector D6, 3/3 acatados — candidato a regra permanente):** *o sistema **produz** diagnóstico bem e **consome** mal.* Checkpoint de 08-01 ficou 6 dias sem leitura; o lock foi reportado 2× como "limitação conhecida" sem ninguém procurar a causa; contradição de tarefa ficou 11 dias sem árbitro. **O gargalo não é gerar sinal.**

## 6. Estado atual (retrato de 2026-08-16)

- **Fase:** pré-lançamento; produto estável e validado end-to-end; janela jul→out/2026 = **tempo de construção** (monetização pausada até empresa BC).
- **`origin/main` = HEAD = `97e861f`. Working tree limpo, "Em revisão" vazia.** Entregas recentes: cod-0044 + cod-0048 (`41beafe`) · **cod-0062a** (`378e2be`, 15/08) + reconciliação (`e10701f`/`97e861f`).
- **✅ A esteira foi destravada em 15/08 — mas só depois de 8 dias parada.** A cod-0062a (blindagem de agregação: filtro de `tipo`/`direcao` explícito em toda leitura de gasto) ficou implementada e não commitada de 07/08 a 15/08, e **cada run matinal desse período encerrou sem produzir nada** (guarda "esteira entupida"). Achado na própria entrega: o patch do `index.lock` de 07/08 tinha deixado o `.claude/commands/tarefa.md` **só parcialmente corrigido** (markdown quebrado, `git branch`/`git log` sem `GIT_OPTIONAL_LOCKS=0`) — ou seja, uma correção registrada como feita ficou quebrada 8 dias sem ninguém saber.
- **🆕 Revisão estrutural do `/entregar` (2026-08-16, doc `Revisao_Entregar_Camadas_2026-08-16.md`) — aguarda decisão do Gabriel.** Medido no git de 60 dias: houve commit em **17 dias**, em rajadas (o dia 05/08 sozinho teve 8 commits) com buracos de 6–8 dias. O diagnóstico central é o **acoplamento**: "guardar progresso com segurança" e "publicar pro usuário" são hoje a **mesma ação** (push na `main` = deploy Railway), então enquanto uma leva espera revisão, **a produção inteira para** — já custou ~14 dias em dois episódios (cod-0043, 6 dias; cod-0062a, 8 dias). Proposta: **3 camadas** (PRODUZIR sem o Gabriel · GUARDAR em 2–5 min numa branch `estoque` única · ENTREGAR em ~30 min quando ele quiser publicar) + **3 faixas de risco** (🟢 verde sem migration/env/financeiro = ritual mínimo; 🟡 amarela; 🔴 vermelha = ritual completo). *A cod-0062a era 🟢 e pagou preço 🔴.* 7 decisões na §11 do doc; o doc está **untracked**.
- **Fila da máquina: 9 tarefas `pronta`, composição saudável.** Fatias autônomas criadas em 07/08 (critério "toca `src/gemini.js`?"): **cod-0062b** (guard `precos_mercado` + copy PIX) · **cod-0065a** (módulo puro de datas) · **cod-0065b** (`fmtMoeda`) · **cod-0072a** (parser de parcela). Mais **cod-0073/0074/0075** (gate Pro, M/M/P) e **cod-0066** (limpeza MP). Porte G (coração: cod-0062, cod-0065, cod-0072) exige o Gabriel presente. O `coerceNumber` ficou **de propósito** com ele — coerção numérica afeta todo cupom brasileiro.
- **🔴 Pendências humanas quentes (ordem de urgência):** (1) **sentada única no SQL Editor** (`Roteiro_SQL_Editor_2026-08-07.md`, ~25 min): passo 0 = provar no WhatsApp que a `service_role` está em uso → migration PIX → **RLS (2 scripts)** → S3 → DROP MP. É o caminho crítico: destrava cod-0062, cod-0069 e cod-0070 — **parada há 9 dias**; (2) **teste de 5 min do commit no sandbox** (decide Máquina 3.0 × TREE e é pré-requisito da proposta de camadas) — **parado há 10 dias**; (3) decidir sobre as 7 linhas da revisão do `/entregar`; (4) setar `COMPARATIVO_MAX_PRO=10` (pré-req da cod-0073); (5) encurtar ou cumprir a promessa de "alerta inteligente" na copy de indicação (`formatter.js`), que hoje não destranca nada porque o gate Pro não existe.
- **🩺 Saúde do banco:** **S2 fechado** — `SUPABASE_SERVICE_ROLE_KEY` setada no Railway (confirmada por print, 15 envs). ⚠️ O print prova que a **variável existe**, não que o **valor é a chave certa** nem que houve redeploy; o código faz `SERVICE_ROLE || ANON`, então valor errado-mas-presente **não cai no fallback** — quebra tudo. Daí o passo "S2-verificar" (mandar a mesma foto 2× e ver a dedup agir). **S4 (RLS) destravado mas o script original NÃO BASTA:** `rls_migration.sql` cobre **5 relações**, o código usa **15**, e as **7 views são security-definer** — continuam devolvendo dados mesmo com RLS ligado nas tabelas base. Complemento pronto: `supabase/rls_migration_parte2_2026-08-07.sql` (+`security_invoker`, `REVOKE`, teste por `curl` com a anon key — testar pelo SQL Editor dá falso positivo). **S1 (`lembretes_enviados`) CANCELADO** com a cod-0068.
- **Frente 1 (ingestão multi-documento) — DESDOBRADA em 08-05, o material humano chegou:** 3 comprovantes de PIX (3 layouts) e 6 recibos de Vancouver viraram corpus versionado em `test/corpus/`. Invariantes novos do PIX: 🔴 **`direcao`** (PIX *recebido* é entrada; somá-lo como gasto faz o número mentir → toda agregação filtra `direcao='saida'`) · 🔴 **valor nem sempre impresso** (num dos prints só sai de `saldo antes − saldo depois`; sem conta que feche, **recusa honesta > chute**) · **EndToEndId como dedup determinístico**. `compras.tipo` **não tem CHECK** (`'pix'` grava sem migration), mas a migration `migration_2026-08-05_pix_direcao_id_transacao.sql` (autorizada, **ainda não executada**) precisa rodar **antes** do push da cod-0062. **Fatura de cartão entra agora, em paralelo** (cod-0072) — destrava a G1 (gastos invisíveis).
- **Canadá (cod-0065):** o difícil não é moeda, é o coração — **4 formatos de data no mesmo corpus** (`26/07/29` é AA/MM/DD; lido errado vira 2029), nomes crípticos (`MNSTR ZERO ULTRA`), linhas que não são produto mas entram na soma (DEPOSIT/RECYCLING/ECO fee, e a linha **negativa** `Member Pricing −3.58` → a reconciliação precisa aceitar negativo), item por peso, e **pagamento ≠ total** quando há resgate de pontos. Decisão: `total` = **valor pago**; o impresso vira `total_bruto` e é ele quem reconcilia os itens. `nome_canonico` em inglês, **`categoria` continua no enum pt-BR** — não bifurcar taxonomia.
- **Frente 2 (2º canal) — DECIDIDA em 08-05:** o app **não substitui o WhatsApp**; os dois funcionam juntos e separados, com **as mesmas funções, o mesmo banco e ambos aceitando foto** — muda só **como o usuário visualiza**. WhatsApp segue carro-chefe. Consequência técnica: a regra de negócio tem de **sair de dentro do canal** (núcleo `src/core/` + adaptadores) ou toda função nasce duas vezes e diverge → **cod-0071** (núcleo canal-agnóstico, `pronta`). Identidade = `phone_number` (login por código no WhatsApp) = zero migration. **PWA primeiro** (Vercel, custo zero, sem loja, independe da empresa BC) → **cod-0069/0070** (API + PWA) estão **`bloqueada-humano`**: abrir API pública **força** resolver S2/S4 antes.

## 7. Divisão de papéis (resumo — detalhada nas Instruções do Projeto)

| Claude executa (com plano anunciado) | Gabriel decide/executa (Claude prepara) |
|---|---|
| Código não-financeiro + testes | Tudo que toca dinheiro (pricing, gate Pro, pagamentos) |
| Copy, conteúdo, análise, pesquisa | Merge/commit/push/deploy, migrations, envs, secrets |
| Design técnico, migrations ESCRITAS | Direção estratégica (canal, praça, escala) |
| Documentação e memória viva | Jurídico/fiscal (empresa BC, LGPD/CASL) |
| Planejamento e desdobramento da fila | Gastar dinheiro; contato com usuários reais |

## 8. Glossário interno

- **W2** — retenção semana 2 (mandou cupom na 2ª semana); a métrica de validação de hábito.
- **cod-XXXX / aud-XX / las-XX** — IDs de tarefa na `AGENDA.md` (código / auditoria / fila de lastro). Sufixo `a`/`b` = fatia de uma tarefa maior.
- **A1..A10** — achados da auditoria de código de 06-25 (A9 = incidente da coluna `cnpj` faltando).
- **Esteira entupida** — `.js` não commitado ⇒ a run matinal não implementa nada. Destrava com `/entregar`. Já custou ~14 dias de produção em 2026 (cod-0043 e cod-0062a).
- **Camadas / faixas de risco** — proposta de 16/08 (ainda não decidida): separar PRODUZIR / GUARDAR / ENTREGAR e cobrar ritual **por risco** (🟢/🟡/🔴), não por tamanho.
- **3 Leis da pilha** — Máquina 3.0: pilha linear · teto de 3 branches · main parada.
- **Modo TREE × modo PILHA** — `/entregar` em working tree (rotina sandbox) × merge de branches `maquina/*` (runs locais).
- **`GIT_OPTIONAL_LOCKS=0`** — prefixo obrigatório em todo git do sandbox; foi a causa-raiz do `index.lock`.
- **Porte P/M/G e `lote:`** — campos que definem quanto cabe numa run (critério = tempo de revisão, ~30 min).
- **Dois trilhos** — Trilho A = Stripe direto; Trilho B = MoR/afiliados (Hotmart, só anual). Ambos ligam `is_pro` no mesmo `/admin/ativar-pro`.
- **Firewall ADVISORY** — desde 07-26 o `check-firewall.mjs` avisa e sai 0; o gate real é a revisão humana.
- **S1..S5** — itens do bloco de saúde do banco (S2 = service_role key; S3 = RPC; S4 = RLS; S5 = DROP MP).
- **`nome_canonico`** — nome normalizado do item; base do matching, do comparativo e do Alerta Pro.
- **Fidelidade numérica** — firewall do Agente: número narrado pelo LLM fora da allowlist calculada → descarta e usa template.
- **Incidente A9** — deploy de código que lia coluna inexistente; originou "migration antes do código" e o `schemaGuard`.
- **SIGBUS/sharp** — falha ambiental do sandbox Linux (`sharp`, e `@supabase/supabase-js` com `node_modules` do Windows); esses testes falham no sandbox e passam no Windows do Gabriel. **Não é falha real.**
- **CTWA** — Meta Ads clique-pro-WhatsApp, canal de aquisição planejado.
- **IOF 3,5%** — imposto cross-border que o comprador brasileiro paga no Trilho A.

## 9. Arquivos-fonte (quando a pasta estiver conectada)

`CLAUDE.md` (memória estratégica, sempre 1º) · `AGENDA.md` (fila da máquina + pilha + painel "Ações do Gabriel") · `CODE_GUIDE.md` (memória técnica) · `PROJECT_INSTRUCTIONS.md` (boot do Cowork/Code) · `.claude/skills/README.md` (19 skills + 10 regras de ouro) · `Economizei app/CRITICA_LOG.md` (memória do senso crítico) · `RELATORIO_MATINAL.md` / `RELATORIO_SENTINELA.md` (saídas das rotinas) · `Economizei app/` (desenhos, auditorias, pesquisas — cada um datado no nome).

---

*Retrato de 2026-08-16 (gerado pela sentinela semanal — substitui o de 2026-08-09). Em caso de conflito com os arquivos da pasta `C:\Economizei`, a pasta vence. Atualizar a cada mudança estrutural (novo pilar, mudança de modelo de negócio, virada de fase).*
