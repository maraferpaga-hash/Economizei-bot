# 📦 Contexto do Projeto Economizei — versão condensada e autossuficiente

> **Adicione este arquivo ao conhecimento do Projeto Economizei no Claude (app/web).**
> Ele resume a memória institucional (`CLAUDE.md`, ~60k palavras) no essencial pra operar. **Se a pasta `C:\Economizei` estiver conectada, os arquivos dela vencem este documento** — ele é o retrato de 2026-07-19 e envelhece.

---

## 1. O que é o Economizei

**SaaS B2C, pré-lançamento, operado por 1 pessoa (Gabriel, fundador), ~12h/semana.** Bot de WhatsApp: o usuário manda a **foto do cupom fiscal**, a IA (Gemini 2.5 Flash Vision) lê, classifica os itens e devolve análise imediata — sem app, sem cadastro, sem fricção.

**Missão:** fazer o brasileiro médio (classe B/C, 25–55) entender o próprio gasto, usando IA pra trazer ciência e inteligência ao dinheiro dele.

**O Norte (frase que decide discussão):** *"A cada interação, o usuário sai sabendo algo sobre o dinheiro dele que ele não sabia antes."*

**As 3 camadas de valor (prefira sempre subir):** Ciência (saber: leitura, categorias, `/gastos`) → Inteligência (entender: alertas, insights, comparativo) → Habilidade (agir melhor: economizar de verdade). Feature que para na Camada 1 tem valor limitado.

**Teste de Norte (filtro de toda feature/copy):** isso aumenta a ciência/inteligência do usuário sobre o gasto dele? Em qual camada joga? Entrega sem pedir trabalho da pessoa? A IA faz o peso ou empurra pro usuário? A inteligência prometida é real HOJE?

**Princípio inegociável nº1:** *"A classificação dos itens é o CORAÇÃO do Economizei."* Toda inteligência depende de item lido, nomeado (`nome_canonico`) e categorizado sem erro. Classificar certo vem antes de feature nova; mexeu em extração ⇒ corpus de regressão obrigatório; saída segura > erro que parece certo.

**Outros princípios:** zero atrito é o produto · grátis funciona de verdade, pago é genuinamente melhor (modelo Spotify) · WhatsApp é o produto (no Brasil) · frame brasileiro de "ser esperto / não dar mole", nunca "disciplina/budget" gringo · LGPD é regra de produto (cupom tem CPF; imagem processa-e-descarta, nunca persiste).

## 2. Público e praça

**Personas:** Carla, a Otimizadora (35–50, família, R$1.000–1.500/mês, "economize sem virar contadora da casa") · Bruno, o Controlador (28–40, casal, "saiba exatamente quanto gasta, sem planilha") · Marina, a Filha Preocupada (25–40, paga o plano Família pra mãe). Concorrente real: a planilha de Excel abandonada. NÃO é para early adopters tech.

**Praça de validação: Fernandópolis-SP** (~70k hab, interior noroeste de SP, rede física do Gabriel). Expansão só depois de validar: Votuporanga → Jales → S.J. Rio Preto. Copy de marketing local usa sotaque do interior ("cê", "rancho do mês") — **gíria SÓ em roteiro de marketing, nunca no bot/landing/docs**. Mercados locais citados só em contexto neutro, nunca negativo.

## 3. Modelo de negócio

| Plano | Mensal | Anual (destaque: "pague 10, leve 12") | Diferencial |
|---|---|---|---|
| Grátis | R$0 | — | 10 cupons/mês (limite técnico, custo Gemini), análise, resumo mensal, alerta básico, `/apagar` |
| Individual | R$9,90 | **R$99** | Cupons ilimitados + comparativo entre mercados + alerta inteligente |
| Família | R$15 | **R$150** | + visão consolidada de 3 pessoas |
| Família+ | R$22 | **R$220** | 5 pessoas |

**Pagamentos:** Mercado Pago foi **abandonado juridicamente** (06-24; Gabriel tem saída fiscal do Brasil e mora em Vancouver). Estrutura-alvo: **Hotmart** pro anual (webhook → `/admin/ativar-pro`; afiliados 20–25% recorrente, só anuais) + **Wise BRL** pro mensal via PIX manual. ⚠️ Tudo isso depende da **empresa em BC (Canadá), adiada pra OUTUBRO/2026** — até lá, monetização em escala está estruturalmente pausada e a métrica que manda é **retenção W2, não receita**.

**Métricas e gatilhos-chave:** retenção **W2 ≥ 30%** no cohort de Fernandópolis = gatilho que libera escalar aquisição · MRR ≥ R$4.225/mês = régua de retorno (custo de oportunidade das horas) · ≥5 pagantes PIX = automatizar cobrança · ~80% dos pagantes no anual = estrela-guia (não premissa) · custo por ativação (1º cupom) = métrica-rainha de mídia paga, não ROAS.

## 4. Stack e produto no ar

```
WhatsApp ← Z-API (webhook) → Express.js (Node ≥22, Railway) → Sharp → Gemini 2.5 Flash Vision → Supabase (Postgres)
```

Módulos em `src/`: `index.js` (webhook/roteador/comandos), `gemini.js` (extração `temperature:0` + reconciliação item×total), `supabase.js`, `formatter.js` (todas as mensagens), `alerts.js` (3 níveis), `insights.js` (análise pura: raio-X, inflação pessoal, economia), `charts.js` (QuickChart), `agent/` (Agente de Perguntas), `reengagement.js`, `scheduler.js`, `apagar.js` (LGPD), `schemaGuard.js` (guarda de schema no boot).

**Funções vivas em produção (jul/2026):** leitura de cupom (mercado e não-mercado) · **recebimento de documento foto/PDF no webhook** (cod-0061) · `/gastos` com gráfico + conclusão · `/inflacao` · `/economia` · alerta em 3 níveis · resumo mensal automático · reengajamento (4 segmentos) · `/convidar` (indicação 2 marcos) · `/apagar` (LGPD, 2 passos) · **comparativo entre mercados** (leitura) · **Agente de Perguntas** — texto livre → classificador → executor determinístico (o número NUNCA nasce no LLM) → narração Gemini com firewall de fidelidade numérica; cota 30/mês; **10 intents em produção** (11ª — `gasto_por_termo` — implementada, aguarda commit). Validado end-to-end em produção em 07-09.

## 5. Como o trabalho acontece (os 3 pilares)

**Pilar 1 — Máquina de Programação (constrói):** automação LOCAL. O Gabriel roda `/tarefa` no Claude Code (ou a rotina agendada das 8:02 roda sozinha); ela pega a 1ª tarefa `pronta` da `AGENDA.md`, carrega as skills do campo `skills:`, implementa com teste (TDD), roda `npm run check` e mostra o diff. **A máquina nunca commita** — revisão e commit são do Gabriel (ou via `/entregar`: aprovação dupla — check verde + "APROVO" literal — com checagem BLOQUEANTE de migrations/envs antes do push, porque o push dispara deploy no Railway). GitHub Actions foi descontinuado.

**Vigilância agendada (07-15):** 3 tarefas recorrentes no Cowork — sentinela semanal (dom 20h: AGENDA×git, firewall, testes, anti-A9, copy×features, regenera este CONTEXTO quando o estado muda; relatório em `RELATORIO_SENTINELA.md`), checkpoint N2 mensal (dia 1) e lembrete de sexta. Só leem/reportam — nunca commitam nem tocam dinheiro.

**Pilar 2 — Código/Produto (roda):** bot em produção no Railway. Deploy = `git push` do Gabriel. Regra anti-incidente-A9: **migration roda ANTES do código que a usa** (já houve cupom perdido em silêncio por coluna faltando). Guarda de schema no boot (`schemaGuard.js`) acusa coluna/tabela faltante.

**Pilar 3 — Marketing & Anúncios (futuro, gasta dinheiro real):** gated por W2 ≥ 30% + empresa BC. Meta Ads CTWA será o carro-chefe (não Google — não há demanda de busca).

**Firewall financeiro = tecido conectivo:** `scripts/check-firewall.mjs` (código, não só instrução) reprova qualquer diff que toque dinheiro — denylist de caminhos (`src/mercadopago.js`, `supabase/`, `.env*`, `package.json`, `.github/`) + scan de tokens (`is_pro`, `assinatura`, `pix`, `checkout`, `paywall`, `hotmart`…). A máquina mexe no código, **nunca no dinheiro**. Se uma tarefa precisa disso, vira pendência humana.

**Sistema de checkpoints:** gate por-tarefa (`npm run check`) → checkpoint integral (o primeiro entre: fim-de-cadeia / 5 tarefas commitadas / 3 semanas) → auditoria trimestral. O git é a fonte da verdade; AGENDA/CLAUDE ficam stale e precisam de reconciliação periódica.

**Sistema de skills:** 18 skills em `.claude/skills/` (16 `economizei-*` + 2 legadas). Transversais sempre ligadas: product-principles, memory-system, automation-triage, token-economy, financial-firewall, dual-format, code-decisions. Toda tarefa da máquina carrega skill antes de codar (campo `skills:` designado no planejamento).

## 6. Estado atual (retrato de 2026-07-19)

- **Fase:** pré-lançamento; produto estável e validado end-to-end; janela jul→out/2026 = **tempo de construção** (monetização pausada até empresa BC).
- **`origin/main` até `882cf6e`:** as entregas de 07-13 (cod-0021/22/24/31/40/50), 07-16 (cod-0041/42/51/52) e 07-18 (cod-0061 `e7f236d` + enxugamento de memória `882cf6e`) estão TODAS commitadas/pushadas.
- **Em revisão no working tree (commit humano pendente, 2 pacotes):** (a) **cod-0034** — intent NL `gasto_por_termo` (rotina matinal 07-18; ⚠️ inclui `buscarItensDoMes` nova em `supabase.js`, desvio de escopo declarado — revisar); (b) **cod-0032** — bloco de gasto supérfluo no `/gastos` e no resumo mensal (implementada 07-19; `formatter.js` + `index.js` + `monthlySummary.js` + 13 testes). Testes do tree completo: **393/393 verdes**; firewall verde. Sem migration/env nova (só leem tabelas cujas migrations rodaram em 07-08/07-09). Gate Pro do supérfluo = ~3 linhas humanas na revisão (padrão Gate Pro).
- **Fila da máquina:** **cod-0062** (ler comprovante PIX) lidera, mas **exige presença do Gabriel** (prompt do Gemini = coração; firewall acusa "pix" por design; falta o pré-req humano dos 2–3 comprovantes reais) → **cod-0033** (comandos `/acompanhar` etc.) → **cod-0065** (recibo Canadá — espera recibos reais + sessão de canal).
- **Frente 1 (ingestão multi-documento):** desenho FEITO (07-15); plumbing de documento no ar (cod-0061); falta o ramo PIX (cod-0062) + confirmar payload real de documento da Z-API em produção.
- **Frente 2 (internacionalização):** reframe pesado pendente — **repensar o canal** (Plaid/app) em vez de WhatsApp-diáspora; merece sessão própria antes de qualquer código.
- **Pendências humanas quentes:** revisar/commitar cod-0034 + cod-0032 via `/entregar` · patch do firewall (8 lacunas + bypass por rename, Auditoria 07-10 §1.4) 🔴 · `/assinar` ainda gera checkout MP (irregular) 🔴 · copy de `/planos` e indicação promete "alerta inteligente" ainda não entregue 🔴 · query de verificação de schema (§3.3) · 2 docs de auditoria de 07-17 untracked (`Auditoria_Externa_2026-07-17.md` + `Prompt_Auditoria_Completa_2026-07-17.md`) — commitar como docs.
- **Leva 2 continuada do Agente (cod-0043..0049)** travada de propósito: o juiz é o `perguntas_log` de produção, que só existe pós-lançamento.
- **PAINEL.html:** mistério resolvido — vem da tarefa agendada `economizei-painel-semanal` e já está trackeado no git.

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
- **Máquina Local / Máquina Noturna** — a automação de código via `/tarefa` (nome "noturna" é histórico; hoje é local).
- **`/entregar`** — comando de entrega assistida: check verde + plano de commits + checagem de migrations + "APROVO" literal + reconciliação da AGENDA.
- **Firewall financeiro** — `check-firewall.mjs` + skill `economizei-financial-firewall`; barra dinheiro no código E promessa sem source na copy.
- **`nome_canonico`** — nome normalizado do item, liderando pelo tipo genérico ("cerveja skol lata 350ml"); base do matching e do comparativo.
- **Teaser Free** — decisão A1: comparativo completo é Pro, mas Free vê 1+ amostras pra sentir o valor.
- **Fidelidade numérica** — firewall do Agente: número narrado pelo LLM fora da allowlist calculada → descarta e usa template.
- **Incidente A9** — deploy de código que lia coluna inexistente; originou a regra "migration antes do código" e o `schemaGuard`.
- **CTWA** — Meta Ads clique-pro-WhatsApp, canal de aquisição planejado.
- **Dual-format** — resposta tier 4+: Resumo executivo em cima, Relatório completo embaixo.
- **🤖/🤝/🛠️/🧍** — triagem de quem faz: robô / colaboração / ferramenta / humano.

## 9. Arquivos-fonte (quando a pasta estiver conectada)

`CLAUDE.md` (memória estratégica, sempre 1º) · `AGENDA.md` (fila da máquina + painel "Ações do Gabriel") · `CODE_GUIDE.md` (memória técnica) · `PROJECT_INSTRUCTIONS.md` (boot do Cowork/Code) · `.claude/skills/README.md` (18 skills + 10 regras de ouro) · `Economizei app/` (desenhos, auditorias, pesquisas — cada um datado no nome).

---

*Retrato de 2026-07-19 (gerado pela sentinela semanal). Em caso de conflito com os arquivos da pasta `C:\Economizei`, a pasta vence. Atualizar este documento a cada mudança estrutural (novo pilar, mudança de modelo de negócio, virada de fase).*
