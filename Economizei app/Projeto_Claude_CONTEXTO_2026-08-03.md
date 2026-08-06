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

## 3. Modelo de negócio

| Plano | Mensal | Anual (destaque: "pague 10, leve 12") | Diferencial |
|---|---|---|---|
| Grátis | R$0 | — | 10 cupons/mês (limite técnico, custo Gemini), análise, resumo mensal, alerta básico, `/apagar` |
| Individual | R$9,90 | **R$99** | Cupons ilimitados + comparativo entre mercados + alerta inteligente |
| Família | R$15 | **R$150** | + visão consolidada de 3 pessoas |
| Família+ | R$22 | **R$220** | 5 pessoas |

**Pagamentos — arquitetura "DOIS TRILHOS" (decidida 2026-07-17):** o Mercado Pago foi **abandonado juridicamente** (exige residência brasileira; Gabriel declarou saída fiscal e mora em Vancouver) e **removido do código** em 2026-07-27 (`4f49ae7`). A **empresa em BC (Canadá) reabre o Stripe**. Dois trilhos em paralelo, ambos terminam no mesmo `POST /admin/ativar-pro` (o bot não sabe por qual trilho a pessoa pagou):
- **Trilho A — DIRETO (Stripe, conta BC):** cliente que o Gabriel traz (WhatsApp, orgânico, seus ads, landing). Mensal + anual + cartão, recorrência automática, liquida em CAD. Margem alta. ⚠️ **comprador brasileiro paga IOF ~3,5%** (cross-border) — afeta conversão.
- **Trilho B — AFILIADOS (MoR, Hotmart default):** terceiro vende por você; só nos **anuais**; comissão 20–25% recorrente. Custo alto (~9,9% + comissão) só sobre venda incremental. Braip a checar p/ fit-assinatura. Elegibilidade de produtor não-residente = **item a confirmar por plataforma**.

⚠️ Tudo isso depende da **empresa em BC, adiada pra OUTUBRO/2026** — até lá, **monetização em escala está estruturalmente pausada** e a métrica que manda é **retenção W2, não receita**. Dados fiscais a confirmar com contador: BC ~11% corp (SBD/CCPC até CAD 500k), GST/HST limiar CAD 30k, T2 anual obrigatório. Docs: `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` · `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`.

**Candidato a 4º pilar de receita (só registro estratégico, 2026-07-26):** venda de **inteligência agregada e anonimizada** de shopper data (composição de cesta, inflação por categoria, preço por região) pra varejo/indústria/institutos — o modelo real por trás dos apps "manda cupom, ganha ponto". Prospecção só **pós-empresa BC + anúncios rodando + escala**. Recompensa ao usuário hoje = não-cash. Doc: `Pesquisa_Cupom_por_Recompensa_Modelo_2026-07-26.md`.

**Métricas e gatilhos-chave:** retenção **W2 ≥ 30%** no cohort de Fernandópolis = gatilho que libera escalar aquisição · MRR ≥ R$4.225/mês = régua de retorno (custo de oportunidade das horas) · ≥5 pagantes = automatizar cobrança · ~80% dos pagantes no anual = estrela-guia (não premissa) · custo por ativação (1º cupom) = métrica-rainha de mídia paga, não ROAS.

## 4. Stack e produto no ar

```
WhatsApp ← Z-API (webhook autenticado por token) → Express.js (Node ≥22, Railway) → Sharp → Gemini 2.5 Flash Vision → Supabase (Postgres)
```

Módulos em `src/`: `index.js` (webhook/roteador/comandos), `gemini.js` (extração `temperature:0` + reconciliação item×total), `supabase.js`, `formatter.js` (todas as mensagens), `alerts.js` (3 níveis), `insights.js` (análise pura: raio-X, inflação pessoal, economia, supérfluo, gasto por alvo, teto/limite), `charts.js` (QuickChart), `agent/` (Agente de Perguntas), `reengagement.js`, `scheduler.js`, `apagar.js` (LGPD), `schemaGuard.js` (guarda de schema no boot). **`mercadopago.js` não existe mais** (removido em `4f49ae7`; restam funções órfãs em `supabase.js`/`formatter.js` = tarefa cod-0066, hoje `pausada` por decisão do Gabriel).

**Funções vivas em produção (ago/2026):** leitura de cupom (mercado e não-mercado) · recebimento de documento foto/PDF no webhook (cod-0061) · **webhook autenticado, fail-closed** (cod-0053 — `ZAPI_WEBHOOK_TOKEN` setado no Railway e URL do Z-API reconfigurada pra `/webhook/<token>`; rollout COMPLETO desde 07-27) · `/gastos` com gráfico + conclusão + **bloco de gasto supérfluo** · `/inflacao` · `/economia` · alerta em 3 níveis · resumo mensal automático · reengajamento (4 segmentos) · `/convidar` · `/apagar` (LGPD) · comparativo entre mercados (leitura) · **Alerta Inteligente Pro completo** (cadeia cod-0030..0035 fechada): matching por `nome_canonico`, `/acompanhar` `/acompanhamentos` `/parar` `/superfluo`, e **`/teto <alvo> <valor>` + alerta automático de limite** (1×/alvo/mês) · **Agente de Perguntas** — texto livre → classificador → executor determinístico (o número NUNCA nasce no LLM) → narração Gemini com firewall de fidelidade numérica; cota 30/mês; **11 intents**. Validado end-to-end em produção em 07-09.

## 5. Como o trabalho acontece (os 3 pilares)

**Pilar 1 — Máquina de Programação (constrói):** automação LOCAL. Gabriel roda `/tarefa` no Claude Code (ou a rotina agendada das 8:02 Vancouver); pega tarefa(s) `pronta` da `AGENDA.md`, carrega as skills do campo `skills:`, implementa com teste (TDD), roda `npm run check` e mostra o diff. **A máquina nunca commita** — revisão e commit são do Gabriel (ou via `/entregar`: aprovação dupla — check verde + "APROVO" literal — com checagem BLOQUEANTE de migrations/envs antes do push, porque o push dispara deploy no Railway). GitHub Actions foi descontinuado.

**Máquina 2.0 (aprovada 2026-07-27):** o teto por run subiu — até **3 tarefas porte P, OU 1 porte M, OU 1 lote**, ≤ ~500 linhas de diff. Critério de agrupamento é **revisão, não token**: lote ideal = ~30 min de revisão do Gabriel, e coração/financeiro nunca entram no mesmo lote. A AGENDA ganhou os campos `lote:` e `porte:`. Existe uma **Fila de lastro** (só testes/revisão/segurança) como fallback quando a fila principal está bloqueada por pré-requisito — **não** quando a esteira está entupida. Run pesada de sábado: aprovada em princípio, **gatilho de 10 runs do piloto** antes de criar. Doc: `Analise_Maquina_Pesada_e_Lotes_2026-07-27.md`.

**Regra 0 — esteira entupida:** se o working tree tem código não commitado, a run matinal **não implementa nada** (empilhar diff destrói o fatiamento de commits do `/entregar`). Consequência real: 5 runs perdidas entre 30/07 e 03/08 esperando um `/entregar`.

**Vigilância agendada (07-15):** 3 tarefas recorrentes no Cowork — sentinela semanal (AGENDA×git, firewall, testes, anti-A9, copy×features, regenera este CONTEXTO quando o estado muda; relatório em `RELATORIO_SENTINELA.md`), checkpoint N2 mensal (dia 1) e lembrete de sexta. Só leem/reportam — nunca commitam nem tocam dinheiro.

**Pilar 2 — Código/Produto (roda):** bot em produção no Railway. Deploy = `git push` do Gabriel. Regra anti-incidente-A9: **migration roda ANTES do código que a usa** (já houve cupom perdido em silêncio por coluna faltando). Guarda de schema no boot (`schemaGuard.js`) acusa coluna/tabela faltante — 12 checagens críticas.

**Pilar 3 — Marketing & Anúncios (futuro, gasta dinheiro real):** gated por W2 ≥ 30% + empresa BC. Meta Ads CTWA será o carro-chefe (não Google — não há demanda de busca).

**Firewall financeiro — hoje em modo ADVISORY (desde 2026-07-26):** `scripts/check-firewall.mjs` **avisa mas não bloqueia** (sempre exit 0; lista o que toca dinheiro como checklist), pra permitir construir os dois trilhos sem atrito. **O gate real é a revisão humana no `/entregar`** — o Gabriel commita tudo, sem exceção. `supabase/`, `.env*`, `package.json` e deploy seguem sendo mão exclusiva dele. Reverter pra bloqueante quando os trilhos estiverem prontos. Selftest: 19/19.

**Sistema de checkpoints:** gate por-tarefa (`npm run check`) → checkpoint integral N2 (o primeiro entre: fim-de-cadeia / 5 tarefas commitadas / 3 semanas) → auditoria trimestral. O git é a fonte da verdade; AGENDA/CLAUDE ficam stale e precisam de reconciliação periódica. Último N2: **2026-08-01, veredito 🟡** (`Checkpoint_N2_2026-08-01.md`).

**Sistema de skills:** 19 skills em `.claude/skills/` (17 `economizei-*` + 2 legadas). Transversais sempre ligadas: product-principles, memory-system, automation-triage, token-economy, financial-firewall, dual-format, code-decisions, **critical-partner** (senso crítico: 6 detectores; **para antes de executar** quando o pedido tem atrito real, entrega bloco 🛑 de ≤5 linhas, e o Gabriel decide sempre; log em `Economizei app/CRITICA_LOG.md` — 3 acatos pelo mesmo motivo viram regra permanente, 3 recusas recalibram o detector). Toda tarefa da máquina carrega skill antes de codar.

## 6. Estado atual (retrato de 2026-08-03)

- **Fase:** pré-lançamento; produto estável e validado end-to-end; janela jul→out/2026 = **tempo de construção** (monetização pausada até empresa BC).
- **`origin/main` = HEAD = `1215d3c`.** Entregas recentes: **cod-0033** comandos do Alerta Pro (`8588c4b`), **firewall ADVISORY + remoção do Mercado Pago** (`4f49ae7`), **cod-0035** `/teto` + alerta de limite (`df18b53` — **fecha a cadeia cod-0030..0035**), docs de senso crítico/Máquina 2.0/repriorização (`e700ed6`).
- **🔴 Esteira entupida — o item nº 1 do projeto hoje:** o **cod-0043** (memória curta de follow-up do Agente — "e em junho?") está **implementado e não commitado desde 2026-07-29**. Arquivos: `src/agent/classifier.js`, `src/agent/index.js`, `src/agent/periodo.js` + novos `src/agent/contexto.js` e `test/agent-contexto.test.js` (~700 linhas). É **memória em processo, sem tabela nova, sem env nova**; firewall verde. **Bloqueou 5 runs matinais seguidas** (30/07 → 03/08). ⚠️ A AGENDA está **stale**: ainda lista o cod-0043 como `status: pronta` na "Fila pronta" e declara "Em revisão" vazia — risco de reimplementar o que já existe. Um `/entregar` resolve os dois problemas.
- **Fila da máquina (repriorizada 07-27):** **cod-0043** (feito, esperando commit) → **cod-0044** (sugestões pós-resposta) → **cod-0048** → **cod-0049** (insights proativos pré-programados — já liberada pelo `df18b53`). A Leva 2 do Agente foi destravada em **modo híbrido**: o que é código puro anda agora; 0045/0046/0047/0018 seguem gated pelo `perguntas_log` de produção. **cod-0066** (limpar funções MP órfãs) está **`pausada`** — o Gabriel revogou a autorização. **cod-0062** (comprovante PIX) e **cod-0065** (recibo Canadá) aguardam pré-requisito humano (corpus real + presença dele).
- **Pendências humanas quentes:** (1) **`/entregar` o cod-0043** — destrava tudo; (2) **DROP das colunas/tabela MP no Supabase** (o deploy já passou; roteiro no `Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`) + §3.3 da auditoria (query de schema + RPC `incrementar_compras_mes`); (3) **saúde do banco em produção:** RLS sem policy de insert em `mensagens_processadas` (dedup falha em toda mensagem, fail-open) e **`lembretes_enviados` não existe** (`supabase/migrations/create_lembretes_enviados.sql` nunca rodada); (4) **copy `/planos`** ainda diz "alerta inteligente (**preditivo**)" — o entregue é alerta por **teto do usuário**, não preditivo; (5) **gate Pro nunca ligado** — hoje quem paga R$9,90 recebe só "cupons ilimitados" (`Gate_Pro_Desdobramento_2026-07-10.md`).
- **Resolvido desde o retrato 07-26:** `/assinar` + Mercado Pago (§4.3 da Auditoria) — **fechado**, arquivo removido; copy de indicação prometendo "alerta inteligente" (§4.2) — resolvida **entregando** o cod-0035, resta só a palavra "preditivo"; rollout do webhook auth — **completo** (token + URL); mistério do `PAINEL.html` — agora rastreado no git.
- **Frente 1 (ingestão multi-documento):** desenho FEITO (07-15); plumbing de documento no ar (cod-0061); falta o ramo PIX (cod-0062) + confirmar o payload real de documento da Z-API em produção.
- **Frente 2 (internacionalização):** reframe pesado pendente — **repensar o canal** (Plaid/app) em vez de WhatsApp-diáspora; merece sessão própria antes de qualquer código. Nada do Longo Prazo sobe pra fila antes dessa sessão.

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
- **cod-XXXX / aud-XX / las-XX** — IDs de tarefa na `AGENDA.md` (código / auditoria / fila de lastro).
- **A1..A10** — achados da auditoria de código de 06-25 (A9 = incidente da coluna `cnpj` faltando).
- **Regra 0 / esteira entupida** — working tree sujo ⇒ a run matinal não implementa nada. Destrava com `/entregar`.
- **Porte P/M/G e `lote:`** — campos da Máquina 2.0 que definem quanto cabe numa run (critério = tempo de revisão, ~30 min).
- **Dois trilhos** — arquitetura de pagamento 07-17: Trilho A = Stripe direto; Trilho B = MoR/afiliados (Hotmart, só anual). Ambos ligam `is_pro` no mesmo `/admin/ativar-pro`.
- **Firewall ADVISORY** — desde 07-26 o `check-firewall.mjs` avisa e sai 0; o gate real é a revisão humana no `/entregar`.
- **`/entregar`** — entrega assistida: check verde + plano de commits + checagem BLOQUEANTE de migrations/envs + "APROVO" literal + reconciliação da AGENDA.
- **`nome_canonico`** — nome normalizado do item; base do matching, do comparativo e do Alerta Pro.
- **Fidelidade numérica** — firewall do Agente: número narrado pelo LLM fora da allowlist calculada → descarta e usa template.
- **Incidente A9** — deploy de código que lia coluna inexistente; originou a regra "migration antes do código" e o `schemaGuard`.
- **SIGBUS/sharp** — falha ambiental do sandbox Linux (`sharp`, e `@supabase/supabase-js` quando o `node_modules` vem do Windows); esses testes falham no sandbox e passam no Windows do Gabriel. Não é falha real.
- **CTWA** — Meta Ads clique-pro-WhatsApp, canal de aquisição planejado.
- **IOF 3,5%** — imposto cross-border que o comprador brasileiro paga no Trilho A; afeta conversão e preço percebido.

## 9. Arquivos-fonte (quando a pasta estiver conectada)

`CLAUDE.md` (memória estratégica, sempre 1º) · `AGENDA.md` (fila da máquina + painel "Ações do Gabriel") · `CODE_GUIDE.md` (memória técnica) · `PROJECT_INSTRUCTIONS.md` (boot do Cowork/Code) · `.claude/skills/README.md` (19 skills + 10 regras de ouro) · `Economizei app/CRITICA_LOG.md` (memória do senso crítico) · `RELATORIO_MATINAL.md` / `RELATORIO_SENTINELA.md` (saídas das rotinas) · `Economizei app/` (desenhos, auditorias, pesquisas — cada um datado no nome).

---

*Retrato de 2026-08-03 (gerado pela sentinela semanal — substitui o de 2026-07-26). Em caso de conflito com os arquivos da pasta `C:\Economizei`, a pasta vence. Atualizar este documento a cada mudança estrutural (novo pilar, mudança de modelo de negócio, virada de fase).*
