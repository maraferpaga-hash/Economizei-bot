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

**Regra (2026-08-05):** sem empresa BC **não se busca cliente — mas se busca usuário controlado**. Nada de aquisição paga, promessa comercial ou base grande até out/2026; uma **micro-cohort** (Gabriel + 5–10 próximos, grátis, sem promessa, com consentimento) é instrumento de aprendizado — alimenta corpus, `perguntas_log` e a primeira leitura de W2. O **pré-requisito inegociável (S2/S4) foi satisfeito em 18/08**: a `service_role` está setada e o **RLS está ligado**. O desenho da micro-cohort tem rascunho (`Roadmap_Micro_Cohort_2026-08-23.md`, commitado em `31781d2`) e **segue aguardando decisão do Gabriel**.

## 3. Modelo de negócio

| Plano | Mensal | Anual (destaque: "pague 10, leve 12") | Diferencial |
|---|---|---|---|
| Grátis | R$0 | — | 10 cupons/mês (limite técnico, custo Gemini), análise, resumo mensal, alerta básico, `/apagar` |
| Individual | R$9,90 | **R$99** | Cupons ilimitados + comparativo entre mercados + alerta inteligente |
| Família | R$15 | **R$150** | + visão consolidada de 3 pessoas |
| Família+ | R$22 | **R$220** | 5 pessoas |

**✅ O gate Pro foi ligado** (achado B10 do checkpoint de 08-01, resolvido em duas entregas): **cod-0073** (`/comparar` — Free vê teaser de `COMPARATIVO_AMOSTRAS_FREE` + upsell honesto; Pro vê até `COMPARATIVO_MAX_PRO`) e **cod-0074** (comandos do Alerta Pro — `/acompanhar`, `/teto`, `/superfluo` gated; `/acompanhamentos` e `/parar` sempre abertos de propósito; alerta proativo com gate **silencioso**). **cod-0075** (mesma trava na intent do Agente) foi **devolvida em aberto**: a rotina de 08-21 achou que a premissa dela — vazamento em `intents.js:596` — não se sustenta no código atual. Decisão do Gabriel pendente há 9 dias.

🔴 **Dois planos vendidos não existem no código** (auditoria de 23/08, achado N3, aberto há 7 dias): **Família e Família+** (R$15/R$22 mês · R$150/R$220 ano) não têm nenhuma linha de vínculo entre pessoas, visão consolidada ou comparação por membro — e estão à venda no `/planos` e na landing, com pagamento por **PIX manual**. É possível receber por algo que não há como entregar.

**Pagamentos — arquitetura "DOIS TRILHOS" (decidida 2026-07-17):** o Mercado Pago foi **abandonado juridicamente** (exige residência brasileira; Gabriel declarou saída fiscal e mora em Vancouver) e **removido do código** em 2026-07-27 (`4f49ae7`); as 15 funções órfãs que sobraram saíram em 2026-08-25 (**cod-0066**, `c604fe8`) — **hoje não há uma linha de MP em `src/`**. A **empresa em BC (Canadá) reabre o Stripe**. Dois trilhos em paralelo, ambos terminam no mesmo `POST /admin/ativar-pro`:
- **Trilho A — DIRETO (Stripe, conta BC):** cliente que o Gabriel traz. Mensal + anual + cartão, recorrência automática, liquida em CAD. Margem alta. ⚠️ **comprador brasileiro paga IOF ~3,5%** (cross-border) — afeta conversão.
- **Trilho B — AFILIADOS (MoR, Hotmart default):** terceiro vende por você; só nos **anuais**; comissão 20–25% recorrente. Custo alto (~9,9% + comissão) só sobre venda incremental. Elegibilidade de produtor não-residente = **item a confirmar por plataforma**.

🔴 **A landing segue atrás do código** (achado N4, aberto há 7 dias): ainda vende "cartão" e cita "Mercado Pago" em 5 pontos (`landing/index.html:9,22,2037,2183,2268`). O `/pix` do bot já foi corrigido (cod-0067).

⚠️ Tudo isso depende da **empresa em BC, adiada pra OUTUBRO/2026** — até lá, **monetização em escala está estruturalmente pausada** e a métrica que manda é **retenção W2, não receita**. Dados fiscais a confirmar com contador: BC ~11% corp (SBD/CCPC até CAD 500k), GST/HST limiar CAD 30k, T2 anual obrigatório.

**Candidato a 4º pilar de receita (só registro estratégico, 2026-07-26):** venda de **inteligência agregada e anonimizada** de shopper data pra varejo/indústria/institutos. Prospecção só **pós-empresa BC + anúncios rodando + escala**. Recompensa ao usuário hoje = não-cash.

**Métricas e gatilhos-chave:** **W2 ≥ 30%** no cohort de Fernandópolis = gatilho que libera escalar aquisição · MRR ≥ R$4.225/mês = régua de retorno · ≥5 pagantes = automatizar cobrança · ~80% no anual = estrela-guia (não premissa) · custo por ativação (1º cupom) = métrica-rainha de mídia paga, não ROAS.

## 4. Stack e produto no ar

```
WhatsApp ← Z-API (webhook autenticado por token) → Express.js (Node ≥22, Railway) → Sharp → Gemini 2.5 Flash Vision → Supabase (Postgres, RLS ligado)
```

Módulos em `src/`: `index.js` (webhook/roteador/comandos — **agora adaptador fino sobre o núcleo**), **`core/recibo.js` (🆕 cod-0071: núcleo canal-agnóstico que devolve `{acoes:[...]}` sem conhecer WhatsApp)**, `gemini.js` (extração `temperature:0` + reconciliação item×total), `supabase.js`, `formatter.js` (todas as mensagens), `alerts.js` (3 níveis), `insights.js` (análise pura), `charts.js` (QuickChart), `agent/` (Agente de Perguntas), `datas.js` (🆕 parsing multi-formato), `parcelas.js` (🆕 parser de parcela de fatura), `reengagement.js` (**módulo vivo mas desligado**), `scheduler.js`, `monthlySummary.js`, `apagar.js` (LGPD), `schemaGuard.js` (guarda de schema no boot, 11 checagens). **`mercadopago.js` não existe mais e as funções órfãs foram removidas (cod-0066).**

**Funções vivas em produção (ago/2026):** leitura de cupom (mercado e não-mercado) · recebimento de documento foto/PDF no webhook (cod-0061) · **webhook autenticado, fail-closed** (cod-0053) · `/gastos` com gráfico + conclusão + bloco de gasto supérfluo · `/inflacao` · `/economia` · alerta em 3 níveis · **resumo mensal automático (dias 28–31) — a ÚNICA mensagem proativa do produto** · `/convidar` · `/apagar` (LGPD — **quebrado, ver §6**) · **comparativo entre mercados com gate Pro** (cod-0073) · **Alerta Inteligente Pro completo com gate Pro** (cadeia cod-0030..0035 + cod-0074) · **Agente de Perguntas** — texto livre → classificador → executor determinístico (o número NUNCA nasce no LLM) → narração Gemini com firewall de fidelidade numérica; cota 30/mês; **12 intents**, com sugestões pós-resposta (cod-0044) e gráfico sob demanda (cod-0048). Validado end-to-end em produção em 07-09.

**Peças inertes no código (sem chamador, por desenho, todas já na `main`):** `fmtMoeda` (cod-0065b), `src/datas.js` (cod-0065a) e `src/parcelas.js` (cod-0072a). Cada uma tem `fora-de-escopo` proibindo plugar, porque plugar significa tocar `src/gemini.js` (coração, só com o Gabriel presente). **São 3 seguidas — é padrão estrutural, não desleixo:** a fila autônoma só contém as fatias que não fazem diferença sozinhas. Decisão pendente do Gabriel: (a) seguir estocando, (b) marcar uma sessão pra plugar as três, ou (c) parar de fatiar porte-G e deixar a rotina no lastro. *(O `core/recibo.js` NÃO é peça inerte — está plugado e é o caminho real da foto de cupom hoje.)*

**🆕 Convenção sem ratificação:** o padrão **`deps` opcional** (3º parâmetro de injeção de dependência só pra teste) já foi usado 2× (`core/recibo.js`, `monthlySummary.js`) e o `metrics.js` (las-04) vai pedir o mesmo. É decisão de convenção, não de execução — **o Gabriel ainda não ratificou**.

**Desligado por decisão (cod-0068, 2026-08-05):** o **reengajamento D3/D10** — nunca enviou uma única mensagem (`lembretes_enviados` nunca foi criada). Consequência registrada: **sem toque proativo antes do dia 28, a W2 mede retenção puramente orgânica.** *(Efeito colateral não previsto: essa mesma tabela ausente é o que quebra o `/apagar` — ver §6.)*

## 5. Como o trabalho acontece (os 3 pilares)

**Pilar 1 — Máquina de Programação (constrói):** automação LOCAL + rotina agendada das 8:02 (Vancouver) no sandbox. Pega tarefa(s) `pronta` da `AGENDA.md`, carrega as skills do campo `skills:`, implementa com teste (TDD), valida em cópia limpa `/tmp`. **Commit, push, deploy e migrations são sempre do Gabriel**, via `/entregar` (aprovação dupla — `npm run check` verde **na máquina dele** + "APROVO" literal — com checagem BLOQUEANTE de migrations/envs antes do push, porque o push dispara deploy no Railway). GitHub Actions foi descontinuado.

**Regime ESTOQUE (desde 2026-08-18) — substituiu a Máquina 3.0, que nunca rodou:**
- **A máquina não usa nenhum comando de ESCRITA do git** — nem `add`, `commit`, `checkout`, `branch`, `merge`, `rebase`, `reset`, `push`, `stash`, `tag`. Leitura sempre com `GIT_OPTIONAL_LOCKS=0`.
- Cada leva vira uma **pasta numerada** em `estoque/NNNN_AAAA-MM-DD_cod-XXXX/` (gitignored), com manifesto `LEVA.md` + versões completas dos arquivos em `arquivos/`. A máquina **não escreve em `src/`/`test/`**.
- **REGRA 1 (cadeia):** a leva `NNNN+1` é construída **em cima** da `NNNN`; a ordem de aplicação é a ordem do número, nunca pular. **REGRA 2 (teto):** 4 levas **ou** ~1200 linhas ⇒ "estoque cheio", a máquina para de produzir.
- Ferramenta ponte: **`scripts/estoque.mjs`** (`status` / `aplicar <n>` / `limpar <n>`) — mede delta contra a base correta, roda `node --check`, checa zona proibida, verifica se a cadeia foi preservada. **Verdade é o disco, não a tabela da AGENDA.**
- **Por que mudou:** teste em repositórios descartáveis (18/08) provou que o disco montado **não permite apagar arquivo** (`rm` → `Operation not permitted`); como toda escrita do git cria um `.lock` que precisa ser apagado, a **segunda** escrita trava o repositório pra sempre. A Máquina 3.0 (pilha de branches) era fisicamente impossível — o repositório inteiro tem **zero merges**.
- **Ganho colateral:** como o working tree nunca suja, **entrega atrasada não bloqueia mais a produção** — o acoplamento que custou 6 dias (cod-0043) e 8 dias (cod-0062a) deixou de existir. *(Efeito colateral inverso, medido: sem esse acoplamento, o estoque ficou **5 dias parado** antes da entrega de 30/08 — a dívida não trava, só espera.)*
- ⚠️ **Contradição conhecida, já na 4ª repetição sem correção:** a TRAVA 1 do `aplicar` exige que a leva anterior já tenha sido `limpar`-ada, mas o `/entregar` só manda limpar **depois** do push (rede de segurança pro `reset --hard`). Com 2+ levas na mesma sessão isso trava; contorna-se limpando logo após cada commit. **Script ou doc precisam de ajuste.**
- Teto por run: até **3 tarefas porte P, OU 1 porte M, OU 1 lote**, ≤ ~500 linhas. Critério de agrupamento é **revisão, não token** (lote ideal ≈ 30 min). Existe uma **Fila de lastro** (só testes/revisão/segurança) como fallback — hoje é ela que sustenta a produção.
- ⚠️ **O texto da tarefa agendada `economizei-rotina-matinal` ainda descreve "Máquina 3.0 / TREE / pilha de branches"** — desatualizado desde 18/08. Cada run precisa decidir isso de novo até alguém reescrever o prompt.

**Vigilância agendada (07-15):** 3 tarefas recorrentes no Cowork — sentinela semanal (AGENDA×git, firewall, testes, anti-A9, copy×features, regenera este CONTEXTO quando o estado muda; relatório em `RELATORIO_SENTINELA.md`), checkpoint N2 mensal (dia 1) e lembrete de sexta. Só leem/reportam — nunca commitam nem tocam dinheiro.

**Pilar 2 — Código/Produto (roda):** bot em produção no Railway. Deploy = `git push` do Gabriel. Regra anti-incidente-A9: **migration roda ANTES do código que a usa**.

**Pilar 3 — Marketing & Anúncios (futuro, gasta dinheiro real):** gated por W2 ≥ 30% + empresa BC. Meta Ads CTWA será o carro-chefe.

**Firewall financeiro — modo ADVISORY (desde 2026-07-26):** `scripts/check-firewall.mjs` **avisa mas não bloqueia** (sempre exit 0). **O gate real é a revisão humana no `/entregar`.** `supabase/`, `.env*`, `package.json` e deploy seguem sendo mão exclusiva do Gabriel. Selftest: 19/19.

**Sistema de skills:** 19 skills em `.claude/skills/`. Transversais sempre ligadas, incluindo **critical-partner** (6 detectores; **para antes de executar** quando o pedido tem atrito real; o Gabriel decide sempre; log em `Economizei app/CRITICA_LOG.md` — 3 acatos pelo mesmo motivo viram regra permanente).

**Regra 14 (promovida em 18/08, detector D6 com 4/4 acatados) — "verificar estado, não aceitar resumo":** antes de fechar sessão, registrar algo como "feito" ou partir de um diagnóstico anterior, **olhar o estado real** (`git status`/`git log`, working tree, banco) — inclusive contra o resumo que o próprio Claude escreveu na sessão anterior. Motivo: 3 vezes em 3 semanas a memória mentiu por registro otimista. **O gargalo do projeto não é produzir; é consumir e registrar o que já foi produzido.**

## 6. Estado atual (retrato de 2026-08-30)

- **Fase:** pré-lançamento; produto estável e validado end-to-end; janela jul→out/2026 = **tempo de construção** (monetização pausada até empresa BC).
- **`origin/main` = HEAD = `a4589ea`. Working tree limpo, zero untracked, `estoque/` vazio.** Entregas de 25 e 30/08: cod-0065a (`042e156`) · cod-0072a (`f9987be`) · **cod-0066** (`c604fe8`, remoção do MP órfão) · **cod-0071** (`dcc0be1`, núcleo canal-agnóstico) · lote `cobertura-jobs` las-03+las-01 (`646460b`) · las-04 parcial `charts.js` (`656d3fc`).
- **Estoque 0/4** — pela 1ª vez desde a adoção do regime, a máquina está com folga total. **A `Fila pronta` está sem item elegível autônomo:** o que resta é porte G (cod-0062/0065/0072 — coração, exigem o Gabriel presente), cod-0069/0070 (desbloqueadas pelo RLS mas não repriorizadas) e cod-0075 (`aguardando-decisao`). **Na prática, a próxima run cai no lastro** (las-04 `metrics.js`, las-05 `scheduler.js`, las-06 revisão de segurança).
- **🔴 Os 4 vermelhos da auditoria de 23/08 seguem TODOS abertos, agora há 7 dias — nenhum foi enfileirado:**
  1. **O `/apagar` (LGPD) está quebrado e apaga pela metade.** `src/supabase.js:1605` faz `DELETE FROM lembretes_enviados` com `if (error) throw error` — e a tabela **nunca foi criada** (a linha saiu do schema guard na cod-0068). Resultado: apaga `compras` + `itens_compra` + `indicacoes`, **lança no passo 3** e **nunca chega aos passos 4–6** — `resumos_mensais_enviados`, `mensagens_processadas`, `usuarios` e (por dependerem do CASCADE de `usuarios`) `perguntas_log` e `acompanhamentos` **sobrevivem**. O usuário perde o histórico, **mantém a identidade e o texto cru das perguntas**, e recebe "deu erro" — contra uma política que promete exclusão total em 48h. Conserto é código puro, porte P (tolerar a ausência, mesma família de erro que o `schemaGuard` já classifica em `CODIGOS_AUSENCIA`). **É a única pendência com exposição jurídica ativa.**
  2. **`sharp@0.34.5` com CVEs em libvips** — é por ele que passa **toda foto que um estranho manda no WhatsApp**, a única superfície que processa binário não-confiável. `npm audit fix --force` sobe pra 0.35.4 (breaking) + smoke de 1 cupom. `package.json` é zona humana.
  3. **Planos Família / Família+ vendidos sem existir no código** (§3).
  4. **Landing ainda vende cartão e cita Mercado Pago** (§3).
- **🩺 Saúde do banco: S4 FECHADO em 18/08 — o RLS está ligado.** **S2 fechado.** **Ainda abertos:** **S3** (a RPC `incrementar_compras_mes` existe? só leitura) · **S5** (as 7 views de métricas — o `metrics_views.sql` está no repo mas nunca foi executado por inteiro; `v_dashboard`/`v_funil_conversao`/`v_cupons_por_mes` são lidas por `src/metrics.js` e lançam se faltarem) · **migration PIX** (`migration_2026-08-05_pix_direcao_id_transacao.sql`, aditiva, **destrava a cod-0062**, roda ANTES do push) · **DROP das colunas MP** (agora **liberado**: a cod-0066 está no ar, ordem código→deploy→banco cumprida).
- **Pendências abertas da entrega de 30/08 (não bloqueiam):** (a) o padrão **`deps` opcional** sem ratificação (§4); (b) **defeito conhecido em `src/charts.js:56`** — `totalGeral = soma || 1` protege a divisão do percentual mas é impresso no título, então **mês de soma zero mostra "Total: R$ 1,00"**, número que não existe. Registrado como teste `todo`; correção é 1 linha, decisão do Gabriel.
- **Frente 1 (ingestão multi-documento) — desdobrada em 08-05:** corpus real versionado em `test/corpus/` (3 comprovantes PIX de 3 layouts + 6 recibos de Vancouver). Invariantes do PIX: 🔴 **`direcao`** (PIX recebido é entrada; somá-lo como gasto faz o número mentir → toda agregação filtra `direcao='saida'`) · 🔴 **valor nem sempre impresso** (num print só sai de `saldo antes − saldo depois`; **recusa honesta > chute**) · **EndToEndId como dedup determinístico**. A blindagem já está no código (cod-0062a) atrás de um probe de existência da coluna — anti-A9. **Fatura de cartão em paralelo** (cod-0072) — destrava a G1 (gastos invisíveis).
- **Canadá (cod-0065):** o difícil não é moeda, é o coração — **4 formatos de data no mesmo corpus** (`26/07/29` é AA/MM/DD), nomes crípticos (`MNSTR ZERO ULTRA`), linhas que não são produto mas entram na soma (DEPOSIT/RECYCLING/ECO fee, e a **negativa** `Member Pricing −3.58`), item por peso, e **pagamento ≠ total** com resgate de pontos. `total` = **valor pago**; o impresso vira `total_bruto` e é ele quem reconcilia. `nome_canonico` em inglês, **`categoria` no enum pt-BR** — não bifurcar taxonomia. O módulo de datas (cod-0065a) já está na `main`, inerte.
- **Frente 2 (2º canal) — decidida em 08-05, primeira pedra assentada em 30/08:** o app **não substitui o WhatsApp**; mesmas funções, mesmo banco, ambos aceitam foto; muda só a visualização. **O núcleo canal-agnóstico (cod-0071) foi entregue** — `src/core/recibo.js` recebe `(phone, baixar, deps)` e devolve `{acoes}`, e `index.js` virou adaptador. Achado da entrega: **nenhum teste cobria `processarReciboRecebido`/`processarImagem`** antes — os 18 testes novos preencheram esse buraco. Identidade = `phone_number` = zero migration. **PWA primeiro** (Vercel, custo zero, independe da empresa BC) → **cod-0069/0070 (API + PWA) seguem desbloqueadas desde o RLS de 18/08**, aguardando repriorização.

## 7. Divisão de papéis (resumo — detalhada nas Instruções do Projeto)

| Claude executa (com plano anunciado) | Gabriel decide/executa (Claude prepara) |
|---|---|
| Código não-financeiro + testes | Tudo que toca dinheiro (pricing, gate Pro, pagamentos) |
| Copy, conteúdo, análise, pesquisa | Commit/push/deploy, migrations, envs, secrets |
| Design técnico, migrations ESCRITAS | Direção estratégica (canal, praça, escala) |
| Documentação e memória viva | Jurídico/fiscal (empresa BC, LGPD/CASL) |
| Planejamento e desdobramento da fila | Gastar dinheiro; contato com usuários reais |

## 8. Glossário interno

- **W2** — retenção semana 2 (mandou cupom na 2ª semana); a métrica de validação de hábito.
- **cod-XXXX / aud-XX / las-XX** — IDs de tarefa na `AGENDA.md`. Sufixo `a`/`b` = fatia de uma tarefa maior.
- **A1..A10** — achados da auditoria de código de 06-25 (A9 = incidente da coluna `cnpj` faltando).
- **N1..N4** — achados vermelhos da auditoria integral de 23/08 (`/apagar`, `sharp`, planos Família, landing) — **os 4 seguem abertos**.
- **Regime ESTOQUE / leva** — desde 18/08: a máquina entrega pastas numeradas em `estoque/`, sem tocar `src/`; o Gabriel aplica com `scripts/estoque.mjs`. Substituiu a Máquina 3.0.
- **REGRA 1 / REGRA 2** — cadeia (aplicar em ordem, nunca pular) e teto (4 levas ou ~1200 linhas).
- **TRAVA 1** — a checagem do `aplicar` que exige a leva anterior já limpa; contradiz o `/entregar` (4ª repetição).
- **Peça inerte** — módulo correto e testado que ninguém chama, porque plugar exige tocar o coração.
- **Padrão `deps`** — 3º parâmetro opcional de injeção de dependência, só pra teste; usado 2× e **sem ratificação**.
- **Núcleo canal-agnóstico** — `src/core/recibo.js` (cod-0071): a regra de negócio do recibo fora do canal; base do 2º canal.
- **`GIT_OPTIONAL_LOCKS=0`** — prefixo obrigatório em todo git do sandbox; foi a causa-raiz do `index.lock`.
- **Regra 14** — verificar estado, não aceitar resumo (inclusive o resumo do próprio Claude).
- **Porte P/M/G e `lote:`** — quanto cabe numa run (critério = tempo de revisão, ~30 min).
- **Dois trilhos** — Trilho A = Stripe direto; Trilho B = MoR/afiliados (Hotmart, só anual).
- **Firewall ADVISORY** — desde 07-26 o `check-firewall.mjs` avisa e sai 0; o gate real é a revisão humana.
- **S1..S5** — bloco de saúde do banco (S1 `lembretes_enviados`, cancelado · S2 service_role ✅ · S3 RPC · S4 RLS ✅ · S5 views de métricas).
- **`nome_canonico`** — nome normalizado do item; base do matching, do comparativo e do Alerta Pro.
- **Fidelidade numérica** — firewall do Agente: número narrado pelo LLM fora da allowlist calculada → descarta e usa template.
- **SIGBUS/sharp** — falha ambiental do sandbox Linux; **10 testes** falham lá e passam no Windows do Gabriel. Não é falha real. O gate final é `npm run check` na máquina dele.
- **CTWA** — Meta Ads clique-pro-WhatsApp, canal de aquisição planejado.
- **IOF 3,5%** — imposto cross-border que o comprador brasileiro paga no Trilho A.

## 9. Arquivos-fonte (quando a pasta estiver conectada)

`CLAUDE.md` (memória estratégica, sempre 1º) · `AGENDA.md` (fila da máquina + estoque + painel "Ações do Gabriel") · `CODE_GUIDE.md` (memória técnica) · `PROJECT_INSTRUCTIONS.md` (boot do Cowork/Code) · `.claude/skills/README.md` (19 skills + regras de ouro) · `Economizei app/CRITICA_LOG.md` (memória do senso crítico) · `RELATORIO_MATINAL.md` / `RELATORIO_SENTINELA.md` (saídas das rotinas) · `Economizei app/` (desenhos, auditorias, pesquisas — cada um datado no nome).

---

*Retrato de 2026-08-30 (gerado pela sentinela semanal — substitui o de 2026-08-23). Em caso de conflito com os arquivos da pasta `C:\Economizei`, a pasta vence. Atualizar a cada mudança estrutural (novo pilar, mudança de modelo de negócio, virada de fase).*
