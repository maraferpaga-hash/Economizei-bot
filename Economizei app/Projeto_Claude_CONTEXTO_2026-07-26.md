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

**Pagamentos — arquitetura "DOIS TRILHOS" (decidida 2026-07-17):** o Mercado Pago foi **abandonado juridicamente** (exige residência brasileira; Gabriel declarou saída fiscal e mora em Vancouver). A **empresa em BC (Canadá) reabre o Stripe**. Dois trilhos em paralelo, ambos terminam no mesmo `POST /admin/ativar-pro` (o bot não sabe por qual trilho a pessoa pagou):
- **Trilho A — DIRETO (Stripe, conta BC):** cliente que o Gabriel traz (WhatsApp, orgânico, seus ads, landing). Mensal + anual + cartão, recorrência automática, liquida em CAD. Margem alta. ⚠️ **comprador brasileiro paga IOF ~3,5%** (cross-border) — afeta conversão.
- **Trilho B — AFILIADOS (MoR, Hotmart default):** terceiro vende por você; só nos **anuais**; comissão 20–25% recorrente. Custo alto (~9,9% + comissão) só sobre venda incremental. Braip a checar p/ fit-assinatura. Elegibilidade de produtor não-residente = **item a confirmar por plataforma**.

⚠️ Tudo isso depende da **empresa em BC, adiada pra OUTUBRO/2026** — até lá, **monetização em escala está estruturalmente pausada** e a métrica que manda é **retenção W2, não receita**. Dados fiscais a confirmar com contador: BC ~11% corp (SBD/CCPC até CAD 500k), GST/HST limiar CAD 30k, T2 anual obrigatório. Docs: `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` · `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`.

**Métricas e gatilhos-chave:** retenção **W2 ≥ 30%** no cohort de Fernandópolis = gatilho que libera escalar aquisição · MRR ≥ R$4.225/mês = régua de retorno (custo de oportunidade das horas) · ≥5 pagantes = automatizar cobrança · ~80% dos pagantes no anual = estrela-guia (não premissa) · custo por ativação (1º cupom) = métrica-rainha de mídia paga, não ROAS.

## 4. Stack e produto no ar

```
WhatsApp ← Z-API (webhook autenticado por token) → Express.js (Node ≥22, Railway) → Sharp → Gemini 2.5 Flash Vision → Supabase (Postgres)
```

Módulos em `src/`: `index.js` (webhook/roteador/comandos), `gemini.js` (extração `temperature:0` + reconciliação item×total), `supabase.js`, `formatter.js` (todas as mensagens), `alerts.js` (3 níveis), `insights.js` (análise pura: raio-X, inflação pessoal, economia, supérfluo, gasto por alvo), `charts.js` (QuickChart), `agent/` (Agente de Perguntas), `reengagement.js`, `scheduler.js`, `apagar.js` (LGPD), `schemaGuard.js` (guarda de schema no boot), `mercadopago.js` (financeiro — zona proibida da máquina).

**Funções vivas em produção (jul/2026):** leitura de cupom (mercado e não-mercado) · recebimento de documento foto/PDF no webhook (cod-0061) · **webhook autenticado por token** (cod-0053 — segredo no path `/webhook/<token>` ou header `x-webhook-token`; sem `ZAPI_WEBHOOK_TOKEN` = modo aberto p/ rollout, com a env = fail-closed 401) · `/gastos` com gráfico + conclusão + **bloco de gasto supérfluo** (cod-0032) · `/inflacao` · `/economia` · alerta em 3 níveis · resumo mensal automático (com bloco supérfluo) · reengajamento (4 segmentos) · `/convidar` (indicação 2 marcos) · `/apagar` (LGPD, 2 passos) · comparativo entre mercados (leitura) · **Agente de Perguntas** — texto livre → classificador → executor determinístico (o número NUNCA nasce no LLM) → narração Gemini com firewall de fidelidade numérica; cota 30/mês; **11 intents em produção** (incluindo `gasto_por_termo` — "quanto gastei em cerveja?", cod-0034). Validado end-to-end em produção em 07-09.

## 5. Como o trabalho acontece (os 3 pilares)

**Pilar 1 — Máquina de Programação (constrói):** automação LOCAL. Gabriel roda `/tarefa` no Claude Code (ou a rotina agendada das 8:02); pega a 1ª tarefa `pronta` da `AGENDA.md`, carrega as skills do campo `skills:`, implementa com teste (TDD), roda `npm run check` e mostra o diff. **A máquina nunca commita** — revisão e commit são do Gabriel (ou via `/entregar`: aprovação dupla — check verde + "APROVO" literal — com checagem BLOQUEANTE de migrations/envs antes do push, porque o push dispara deploy no Railway). GitHub Actions foi descontinuado.

**Vigilância agendada (07-15):** 3 tarefas recorrentes no Cowork — sentinela semanal (dom 20h: AGENDA×git, firewall, testes, anti-A9, copy×features, regenera este CONTEXTO quando o estado muda; relatório em `RELATORIO_SENTINELA.md`), checkpoint N2 mensal (dia 1) e lembrete de sexta. Só leem/reportam — nunca commitam nem tocam dinheiro.

**Pilar 2 — Código/Produto (roda):** bot em produção no Railway. Deploy = `git push` do Gabriel. Regra anti-incidente-A9: **migration roda ANTES do código que a usa** (já houve cupom perdido em silêncio por coluna faltando). Guarda de schema no boot (`schemaGuard.js`) acusa coluna/tabela faltante.

**Pilar 3 — Marketing & Anúncios (futuro, gasta dinheiro real):** gated por W2 ≥ 30% + empresa BC. Meta Ads CTWA será o carro-chefe (não Google — não há demanda de busca).

**Firewall financeiro = tecido conectivo:** `scripts/check-firewall.mjs` (código, não só instrução; patch das 8 lacunas + `--no-renames` aplicado em `27fcc16`) reprova qualquer diff que toque dinheiro — denylist de caminhos (`src/mercadopago.js`, `supabase/`, `.env*`, `package.json`, `.github/`) + scan de tokens (`is_pro`, `assinatura`, `pix`, `checkout`, `paywall`, `hotmart`, `stripe`…). A máquina mexe no código, **nunca no dinheiro**. Se uma tarefa precisa disso, vira pendência humana.

**Sistema de checkpoints:** gate por-tarefa (`npm run check`) → checkpoint integral (o primeiro entre: fim-de-cadeia / 5 tarefas commitadas / 3 semanas) → auditoria trimestral. O git é a fonte da verdade; AGENDA/CLAUDE ficam stale e precisam de reconciliação periódica.

**Sistema de skills:** 19 skills em `.claude/skills/` (17 `economizei-*` + 2 legadas). Transversais sempre ligadas: product-principles, memory-system, automation-triage, token-economy, financial-firewall, dual-format, code-decisions, **critical-partner** (senso crítico: para antes de executar quando o pedido tem atrito real; log em `Economizei app/CRITICA_LOG.md`). Toda tarefa da máquina carrega skill antes de codar (campo `skills:` designado no planejamento).

## 6. Estado atual (retrato de 2026-07-26)

- **Fase:** pré-lançamento; produto estável e validado end-to-end; janela jul→out/2026 = **tempo de construção** (monetização pausada até empresa BC).
- **`origin/main` até `1d27d43`** (working tree sincronizado com o remoto, exceto o cod-0033 abaixo). A entrega de 07-24 (`/entregar`) subiu 4 commits + o patch do firewall: **cod-0053** webhook auth (`6cadcb8`), **cod-0032** bloco de supérfluo (`d2cc3c4`), **cod-0034** intent `gasto_por_termo` (`d3e0169`), docs/memória (`b923805`), e o **patch do firewall** — 8 lacunas + `--no-renames` — **aplicado e pushado** (`27fcc16`). O push final usou `--no-verify` consciente/autorizado (o pre-push comparava contra a própria trava, que se autoacusa por design).
- **Em revisão no working tree (commit humano pendente):** **cod-0033** — comandos `/acompanhar`, `/acompanhamentos`, `/parar`, `/superfluo` (Alerta Pro; implementado pela rotina matinal 07-24). Arquivos: `src/index.js` + `src/formatter.js` + `src/insights.js` + novo `test/acompanhamentos-comandos.test.js`. **Sem migration/env nova** (reusa `acompanhamentos` e `usuarios.categorias_superfluas`, cujas migrations já rodaram com cod-0031/0032). **SEM gate Pro no código** (ligar/desligar Pro é passo humano/firewall). `/limite <termo> <valor>` (teto proativo) ficou de fora de propósito: colide com o `/limite` atual (status de cupons) e é o cod-0035 — disambiguar é decisão de UX do Gabriel. Rede de segurança na sentinela 07-26: **331/331 testes reais verdes** (7 falhas SIGBUS = sharp, ambiental do sandbox, passam no Windows); firewall verde.
- **Fila da máquina:** **cod-0062** (ler comprovante PIX) lidera, mas **exige presença do Gabriel** (prompt do Gemini = coração; firewall acusa "pix" por design; falta o pré-req humano dos 2–3 comprovantes reais) → **cod-0065** (recibo Canadá — espera recibos reais + sessão de canal/Plaid). cod-0033 saiu da fila (está em revisão).
- **Frente 1 (ingestão multi-documento):** desenho FEITO (07-15); plumbing de documento no ar (cod-0061); falta o ramo PIX (cod-0062) + confirmar payload real de documento da Z-API em produção.
- **Frente 2 (internacionalização):** reframe pesado pendente — **repensar o canal** (Plaid/app) em vez de WhatsApp-diáspora; merece sessão própria antes de qualquer código.
- **Pendências humanas quentes:** (1) revisar/commitar **cod-0033** via `/entregar`; (2) **cod-0053 — setar `ZAPI_WEBHOOK_TOKEN` no Railway + reconfigurar a URL do webhook no Z-API pra `/webhook/<token>`, NESSA ORDEM** (enquanto a env não existir, o webhook segue em modo aberto); (3) `/assinar` ainda gera checkout **Mercado Pago** (abandonado juridicamente) — reescrever pro trilho Stripe/Hotmart 🔴 (zona financeira/humana); (4) copy de `/planos` e de indicação promete **"alerta inteligente"** ainda não entregue (cod-0035) 🔴; (5) decisão de gate Pro do bloco de supérfluo (baseline pra todos ou só Pro?).
- **Resolvido desde o retrato 07-19:** patch do firewall (Auditoria 07-10 §1.4) — aplicado `27fcc16`; N1 da Auditoria Externa 07-17 (webhook sem auth) — fechado por cod-0053; docs de auditoria/pagamentos de 07-17 — todos commitados/trackeados.
- **Leva 2 continuada do Agente (cod-0043..0049)** travada de propósito: o juiz é o `perguntas_log` de produção, que só existe pós-lançamento.

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
- **cod-XXXX / aud-XX / pag-XXXX** — IDs de tarefa na `AGENDA.md` (código / auditoria / páginas).
- **A1..A10** — achados da auditoria de código de 06-25 (A9 = incidente da coluna `cnpj` faltando).
- **Dois trilhos** — arquitetura de pagamento 07-17: Trilho A = Stripe direto (margem alta, cliente que o Gabriel traz); Trilho B = MoR/afiliados (Hotmart, só anual, escala sem ele). Ambos ligam `is_pro` no mesmo `/admin/ativar-pro`.
- **Máquina Local / Máquina Noturna** — a automação de código via `/tarefa` (nome "noturna" é histórico; hoje é local).
- **`/entregar`** — comando de entrega assistida: check verde + plano de commits + checagem de migrations + "APROVO" literal + reconciliação da AGENDA.
- **Firewall financeiro** — `check-firewall.mjs` + skill `economizei-financial-firewall`; barra dinheiro no código E promessa sem source na copy.
- **`nome_canonico`** — nome normalizado do item, liderando pelo tipo genérico ("cerveja skol lata 350ml"); base do matching e do comparativo.
- **Teaser Free** — decisão A1: comparativo completo é Pro, mas Free vê 1+ amostras pra sentir o valor.
- **Fidelidade numérica** — firewall do Agente: número narrado pelo LLM fora da allowlist calculada → descarta e usa template.
- **Incidente A9** — deploy de código que lia coluna inexistente; originou a regra "migration antes do código" e o `schemaGuard`.
- **SIGBUS/sharp** — falha ambiental do sandbox Linux ao carregar a lib `sharp` (imagem); os testes do pipeline de cupom/webhook falham no sandbox mas passam no Windows do Gabriel. Não é falha real.
- **CTWA** — Meta Ads clique-pro-WhatsApp, canal de aquisição planejado.
- **IOF 3,5%** — imposto cross-border que o comprador brasileiro paga no Trilho A (Stripe/cartão internacional); afeta conversão e o preço percebido.

## 9. Arquivos-fonte (quando a pasta estiver conectada)

`CLAUDE.md` (memória estratégica, sempre 1º) · `AGENDA.md` (fila da máquina + painel "Ações do Gabriel") · `CODE_GUIDE.md` (memória técnica) · `PROJECT_INSTRUCTIONS.md` (boot do Cowork/Code) · `.claude/skills/README.md` (19 skills + 10 regras de ouro) · `Economizei app/CRITICA_LOG.md` (memória do senso crítico) · `Economizei app/` (desenhos, auditorias, pesquisas — cada um datado no nome).

---

*Retrato de 2026-07-26 (gerado pela sentinela semanal — substitui o de 2026-07-19). Em caso de conflito com os arquivos da pasta `C:\Economizei`, a pasta vence. Atualizar este documento a cada mudança estrutural (novo pilar, mudança de modelo de negócio, virada de fase).*
