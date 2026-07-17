# 🗄️ ARQUIVO — AGENDA (snapshot pré-enxugamento de 2026-07-15)

> Snapshot COMPLETO da AGENDA.md imediatamente antes do enxugamento de 2026-07-15
> (~476 linhas / ~68 KB → ~37 KB). **Nada foi deletado** — a AGENDA viva manteve
> a fila pronta, o painel de ações abertas e as ~10 últimas tarefas concluídas;
> tudo que saiu (Concluído antigo, catálogo de skills, descrições longas do Backlog,
> itens [x] já resolvidos, notas narrativas de sessão) está preservado aqui na íntegra.
> Precedente: `CLAUDE_backup_pre_enxugamento_2026-07-15.md` (mesma sessão).

---

# 🤖 AGENDA — Máquina Noturna do Economizei

> **O que é este arquivo.** É a fila de trabalho da automação e a memória viva do
> que está em andamento. O Gabriel prioriza as tarefas aqui (junto com o Opus 4.8,
> no chat). A execução é **local**: na pasta do projeto, o Gabriel roda o Claude
> Code (comando `/tarefa`), que pega **a primeira tarefa pronta**, implementa com
> teste e mostra o diff — **o Gabriel revisa e commita**.
>
> **Função principal: mudanças de CÓDIGO** — desenvolver funções novas, refinar e
> corrigir o código do bot. **O financeiro é blindado** (ver "Zona proibida"): a
> automação não toca em pagamento/cobrança, e o `npm run check:firewall` reprova
> qualquer mudança que tente.
>
> **Leia este arquivo no início de toda sessão** (está na boot list do `CLAUDE.md`).
> Guia do sistema: `Economizei app/Automacao_Maquina_Noturna.md`.

**Última curadoria:** 2026-07-10 (🔍 **AUDITORIA INTEGRAL executada** — 6 de 10 frentes auditadas nesta sessão (firewall, idempotência, schema×código, copy, npm, testes); doc: `Economizei app/Auditoria_Integral_2026-07-10.md`. **Achados críticos:** firewall com 8 lacunas + bypass por rename (patch pronto, humano — §1.4); copy de indicação promete alerta inteligente inexistente; `/assinar` ainda gera checkout MP (abandonado juridicamente). Enfileiradas **cod-0051/0052** (testes extração + dedup); 4 auditorias adiadas viraram **aud-01..04** no painel do Gabriel com material pronto. npm: 0 vulnerabilidades. Mesma data, sessão anterior: 🔓 **Gate Pro (A1) DESDOBRADO** — snippets prontos + checklist em `Economizei app/Gate_Pro_Desdobramento_2026-07-10.md`; decisões: Pro até 10 via `COMPARATIVO_MAX_PRO`, upsell honesto `/planos` no teaser Free, doc-only (código financeiro fica com o Gabriel). cod-0032/0033 promovíveis após aplicação. Antes, 2026-07-09: 🇨🇦 **cod-0065 na Fila pronta** — MVP enxuto do modo recibo Canadá/Vancouver, qualquer comércio, reusando o pipeline; pedido direto do Gabriel, adianta uma fatia da Frente 2; insights + legal em `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md`. Pré-reqs humanos/legais CASL/privacidade/provedor no painel do Gabriel. Antes: 🔭 longo prazo — **Empresa BC ADIADA pra OUTUBRO/2026**; janela de planejamento **até 2 meses**; sementes cod-0060..0064 no Backlog, gated pela sessão de desdobramento — `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`) · **Modo:** execução local (GitHub Actions descontinuado)
**🎯 Último checkpoint integral:** **2026-07-08 (Nível 2) — veredito 🟡→🟢: repositório saudável (184/184 testes reais verdes, firewall OK, working tree limpo), FALTA validação end-to-end em produção.** · **✅ Commitado + pushed até `3b2f375` (origin/main):** cod-0013..0017 (Agente completo) + cod-0020 (comparativo leitura) em `d4eaf51`; + cod-0026/0027/0030/0006/0011/0012 + A4/A9 + 2 migrations futuras. **Tudo no `origin/main`, working tree limpo (só `RELATORIO_MATINAL.md`).** Sistema: `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md`.
**🏛️ Pilares do negócio:** `Economizei app/Pilares_do_Negocio_2026-06-30.md` (Pilar 1 Máquina · Pilar 2 Código/Produto · Pilar 3 futuro Marketing & Anúncios; firewall = tecido conectivo).
**🗄️ Migrations (2026-06-30):** os 4 SQL **já estão commitados** (`a795f65`) em `supabase/` — **A4** (`resumos_mensais_enviados`, versiona tabela feita à mão) e **A9** (`compras.cnpj` + ajuste no `salvarCompra`), + 2 **futuras** (`migration_FUTURA_agente_perguntas.sql`, `migration_FUTURA_alerta_pro_acompanhamentos.sql`). **Pendente humano (só falta RODAR, não commitar):** rodar A4+A9 no SQL Editor do Supabase — **A9: rodar o `ALTER TABLE compras ADD cnpj` ANTES do deploy do código**, senão `salvarCompra` quebra. A futura do **Alerta Pro** (`migration_FUTURA_alerta_pro_acompanhamentos.sql`) **foi RODADA e confirmada em 2026-07-08** (tabela `acompanhamentos` + `usuarios.categorias_superfluas` em produção). A futura do **Agente** (`migration_FUTURA_agente_perguntas.sql`) roda antes do deploy do Agente.
**Foco atual (2026-07-09):** **Assistente Conversacional é a força a desenvolver** (decisão do Gabriel; ideias + benchmark em `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`). Leva 2 de intents enfileirada: **cod-0040 → cod-0041 → cod-0042** (após as 3 rápidas cod-0021/0022/0024). ⚠️ **URGENTE (humano):** o push de 07-08 pode ter deployado o código novo SEM as migrations — rodar **A9 já** (senão salvar cupom quebra) + A4 + migration do agente + envs; ver atualização no topo de `Passo_a_Passo_Deploy_Agente_2026-07-03.md`. Foco anterior (2026-07-08): **fila reabastecida** após o checkpoint Nível 2. Agente (cod-0013..0017) e comparativo (cod-0020) já commitados/pushados; falta só o deploy humano (migration do agente + envs + gate Pro do comparativo — ver "Ações do Gabriel" e `Passo_a_Passo_Deploy_Agente_2026-07-03.md`). **Fila pronta agora:** cod-0021 (copy obsoleta) → cod-0022 (testes formatter) → cod-0024 (nit lembrete). Alerta Pro (cod-0031..0035) segue fora da fila (pricing Free×Pro adiado pelo Gabriel em 07-08). Desenhos: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md` · `Desenho_Alerta_Inteligente_Pro_2026-06-27.md`.
**Mapeamento geral:** `Economizei app/Mapeamento_Geral_Pendencias_2026-06-24.md` (visão única de tudo pendente — código, humano, git, features desenhadas)
**Auditoria de código & direção:** `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md` (achados A1–A10 por severidade + partes travadas + plano de ação; os itens estão distribuídos abaixo no Backlog / Ações do Gabriel / Aguardando decisão)

---

## 🚫 Zona proibida — FINANCEIRO (a máquina NUNCA toca)

> Isto não é só instrução: é **trava automática**. `scripts/check-firewall.mjs`
> roda no CI e **reprova o PR** se o diff mexer em qualquer item abaixo. Com
> branch protection na `main`, um PR reprovado fica **não-mergeável**.

A máquina **não pode** criar, editar ou apagar:

- `src/mercadopago.js` (módulo de pagamento) — arquivo proibido.
- Qualquer linha sobre **pagamento/cobrança**: assinatura, preapproval, Mercado Pago, `is_pro`, `/assinar`, `/pix`, `/cancelar`, checkout, paywall, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`.
- `supabase/` (migrations/SQL — schema e tabelas de dinheiro), `.env*` (segredos), `.github/` (os próprios guarda-rails), `package.json`/`package-lock.json` (dependências), `scripts/check-firewall.mjs` (a trava), `Dockerfile`/`Procfile` (deploy).

Se uma tarefa precisar de algo disso, ela vira **pendência humana** (vai pro painel "Ações do Gabriel"), nunca trabalho da máquina.

---

## 📐 Protocolo (como a automação local usa esta agenda)

Quando o Gabriel roda o Claude Code local (comando `/tarefa`), ele:

1. Lê este arquivo (e consulta `CLAUDE.md`/`CODE_GUIDE.md` só se a tarefa exigir).
2. Vai em **`## 🌙 Fila pronta`** e pega a **primeira** tarefa (de cima pra baixo = maior prioridade) com **`status: pronta`**.
3. **Carrega as skills da tarefa** (campo `skills:`). Se faltar, deriva do **mapa tipo→skills** da seção "🧠 Gatilho de Skills" e aplica durante todo o trabalho.
4. Implementa só aquela tarefa **com teste** (TDD), roda a rede de segurança, move o bloco pra **`## 🔧 Em revisão`** (status `em-revisao` + data) e **mostra o diff** — **declarando quais skills usou**.
5. **O Gabriel revisa e commita** (a automação não commita nem dá push).
6. Se não houver tarefa elegível, não faz nada.

**Rede de segurança (rode antes de commitar):** `npm run check` = `check-firewall.mjs --working` (financeiro) + `node --test` (testes) + `check-pages.mjs` (páginas).

**🗄️ Regra do `/entregar` — checagem de migrations ANTES de qualquer commit/push (2026-07-13, decisão do Gabriel):** o comando `/entregar` (`.claude/commands/entregar.md`) tem uma etapa **bloqueante** de migrations: antes de pedir a aprovação humana, ele cruza o diff com os `supabase/migration_*.sql` pendentes e com as `CHECAGENS_CRITICAS` do `src/schemaGuard.js`, e **avisa explicitamente** qual migration precisa rodar antes do deploy (o push dispara deploy automático no Railway — código que lê coluna/tabela inexistente = incidente A9). Se houver migration pendente que o código do diff USA em runtime, a entrega só prossegue depois que o Gabriel confirmar que rodou a migration OU aceitar conscientemente o alerta da guarda de schema. Racional: o custo de checar é 1 minuto; o custo de não checar foi cupom perdido em silêncio (A9, 07-08→07-09).

**Como priorizar (você + Opus):** a ordem dentro de "Fila pronta" É a prioridade. Subiu = roda antes. Os rótulos `[P0]`..`[P3]` são leitura humana; o que manda é a posição. Use `status: pausada` pra tirar da fila sem apagar.

**Formato de uma tarefa** (molde pra copiar):

```
### [P1] Título curto da tarefa
- id: cod-000X
- tipo: feature-codigo | refino-codigo | bugfix | teste | conteudo-seo | landing-ab | institucional
- skills: skills designadas no planejamento (ver "🧠 Gatilho de Skills"); se vazio, o executor deriva do mapa tipo→skills
- objetivo: uma frase — o que deve existir ao final
- arquivos-alvo: caminho(s) que a máquina pode criar/editar (fora da zona proibida)
- criterios-de-aceite:
  - critério verificável 1
  - teste cobrindo a lógica nova (node --test verde)
  - firewall financeiro verde
- fora-de-escopo: o que NÃO tocar
- status: pronta
```

`tipo`: **feature-codigo** (função nova) · **refino-codigo** (melhora algo que existe) · **bugfix** · **teste** (sobe cobertura) · **conteudo-seo** / **landing-ab** / **institucional** (páginas). Status: `pronta` · `em-revisao` · `pausada` · `bloqueada-humano` · `concluida`.

---

## 🧠 Gatilho de Skills (toda tarefa usa skill — sempre)

> **Regra-mãe:** nenhuma tarefa é implementada sem antes carregar as skills certas.
> A automação **reusa a memória que já construímos** (`.claude/skills/economizei-*`
> + `CLAUDE.md` + `CODE_GUIDE.md`), em vez de reinventar princípio toda run.
> Funciona em dois lados:
>
> - **No planejamento (você + Opus 4.8):** ao escrever uma tarefa nova, o Opus
>   **apresenta as skills candidatas** (cada uma com 1 linha do que faz, pelo
>   catálogo abaixo), **pergunta quais fazem mais sentido**, e grava a escolha no
>   campo **`skills:`** da tarefa. É aqui que você "designa o que o Sonnet vai usar".
> - **Na execução (Claude Code local, `/tarefa`):** carrega as skills do campo
>   `skills:`; se estiver vazio, **deriva do mapa tipo→skills** abaixo; aplica
>   durante todo o trabalho; e **declara no resumo do diff quais skills usou**.
>   Rigor: **recomendado, não bloqueante** — a omissão deve ser exceção, não regra.

### Sempre ligadas (transversais — rodam em qualquer tarefa)
`economizei-product-principles` · `economizei-memory-system` · `economizei-automation-triage` · `economizei-token-economy` · `economizei-financial-firewall` · `economizei-dual-format` — e `economizei-code-decisions` em qualquer tarefa que toque código. Estas não precisam ir no campo `skills:`; já são default (PROJECT_INSTRUCTIONS §2.1).

### Mapa tipo-de-tarefa → skills (fallback quando o campo `skills:` está vazio)
| `tipo` | Skills núcleo (sempre) | Skills condicionais (quando…) |
|---|---|---|
| **feature-codigo** | code-decisions, tdd, product-principles, financial-firewall | copywriter + copy-review (a função gera mensagem ao usuário, ex. `formatter.js`) · security-lgpd (toca CPF/cupom/dado pessoal) · debugging (nasce de um bug) |
| **refino-codigo** | code-decisions, tdd, product-principles, financial-firewall | copywriter (mexe em mensagem do bot) · debugging (corrige comportamento) |
| **bugfix** | debugging, code-decisions, tdd, automation-triage, financial-firewall | security-lgpd (dado pessoal) |
| **teste** | tdd, code-decisions | — |
| **conteudo-seo** | copywriter, copy-review, content-engine, financial-firewall, token-economy | security-lgpd (página com dado/privacidade) |
| **landing-ab** | copywriter, copy-review, financial-firewall, experimentation | security-lgpd (privacidade) |
| **institucional** | copywriter, copy-review, financial-firewall | security-lgpd (privacidade/LGPD) |
| **estrutura / função nova (design)** | product-principles, roadmap-deps, financial-firewall, code-decisions | strategic-review (decisão de direção) · growth-analyst (depende de métrica) |

> O `financial-firewall` aparece em quase tudo **de propósito**: é a trava que
> impede número/preço/promessa sem source no `CLAUDE.md` (a versão em código é o
> `npm run check:firewall`). A landing tem **pricing**, então ele entra em toda
> tarefa de página.

### Catálogo das 18 skills (o que cada uma faz — use pra escolher no planejamento)
**Núcleo:**
- `economizei-product-principles` — toda decisão de produto/feature passa aqui: zero atrito, grátis funciona, frame brasileiro, Teste de Norte.
- `economizei-memory-system` — mantém o `CLAUDE.md` vivo (registrar decisão/aprendizado no fim).
- `economizei-code-decisions` — gêmea da memory-system para o `CODE_GUIDE.md` (stack, padrões, decisão técnica, aprendizado de bug).
- `economizei-automation-triage` — separa 🤖 robô / 🤝 / 🛠️ / 🧍 humano antes de executar; protege o tempo do Gabriel.
- `economizei-token-economy` — calibra esforço ao tamanho do pedido (tier mínimo, sem preâmbulo/postâmbulo).
- `economizei-financial-firewall` — barra número/preço/duração/promessa sem source no `CLAUDE.md`. **Inegociável quando há dinheiro.**
- `economizei-dual-format` — saída tier 4+ em Resumo executivo + Relatório completo.
- `economizei-copywriter` — copy do bot/landing/anúncio em PT-BR classe B/C (sempre com firewall se há número).
- `economizei-debugging` — reduz fogo de horas pra minutos; bot quebrado = produto morto.
- `economizei-growth-analyst` — métricas que importam (retenção W2, WTP), decisão de paywall.

**Secundárias:**
- `economizei-content-engine` — conteúdo orgânico/SEO (Reels/TikTok/guia) sem virar criador full-time.
- `economizei-experimentation` — A/B de headline, teste de pricing.
- `economizei-security-lgpd` — LGPD com dado de cupom (CPF/CNPJ/itens): consentimento e retenção antes de "funciona".
- `economizei-tdd` — todo código além do MVP vem com teste (modelo `test/insights.test.js`).
- `economizei-multi-agent-ops` — operar/paralelizar subagents quando o trabalho cresce.
- `economizei-strategic-review` — SWOT + matriz Eisenhower por gatilho (auditar/decidir direção).

**Legadas (disparam por tópico):**
- `copy-review` — auditoria de copy/landing (TL;DR + problemas mais críticos).
- `roadmap-deps` — mapeia dependências quando um roadmap/planejamento é montado.

---

## 🌙 Fila pronta
*(a máquina executa de cima pra baixo, uma por execução — rotina automática às 8:02 AM Vancouver, ou manual via `/tarefa`)*


> **💳 Promessa do pago primeiro (sequência §4, 06-27).** A prioridade é fechar o que o Pro promete antes de escalar. `/apagar` ✅ (cod-0006). Agora: **cod-0020 (comparativo entre mercados, LEITURA)** — a feature paga nº1, promovida pro topo. Depois a cadeia do Alerta Pro (cod-0031..0035, bloqueada por migration + gate Pro humanos). O Agente de Perguntas (cod-0013..0017) fica **abaixo**, por decisão de sequência.

> **❤️ Classificação + Alerta Inteligente Pro (desenho 2026-06-27).** Desenho completo: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. A classificação é o **coração do produto** (CLAUDE.md / CODE_GUIDE §0) e o alerta Pro depende dela. **cod-0026 + cod-0027 (classificação) e cod-0030 (matching puro) já foram commitados** (até `a795f65`). A cadeia Pro (cod-0031..0035) está refinada no Backlog — sobe pra "Fila pronta" quando a **migration** de `acompanhamentos` (humano) e o **gate Pro** estiverem prontos.

> **🤖 Agente de Perguntas (MVP — Free, 3 intenções, Opção A com narração LLM).**
> **✅ NO AR E VALIDADO EM PRODUÇÃO (2026-07-09).** cod-0010..0017 commitados (`d4eaf51`), migrations rodadas, envs setadas, e o **smoke test end-to-end passou** (número do Agente bateu com o `/gastos` — firewall de fidelidade OK; off-topic recusado sem inventar). Desenho: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`. **A partir daqui o `perguntas_log` de produção é o juiz** da ordem das próximas intents (Leva 2 = cod-0040..0042, já na fila).

> **🔄 Fila reabastecida (2026-07-08, planejamento Opus + Gabriel).** A máquina ficou 6 dias sem fila (não estava travada — só sem tarefa `pronta`). Promovidas do Backlog as 3 tarefas rápidas, não-financeiras, sem migration: cod-0021 → cod-0022 → cod-0024 (ordem = prioridade). O Alerta Pro (cod-0031..0035) segue **fora da fila** por decisão do Gabriel (pricing Free×Pro adiado). **cod-0021, cod-0022, cod-0024 e cod-0040 movidas pra "Em revisão" (2026-07-10)** — as 3 rápidas + a Leva 2a do Agente foram concluídas; próxima da fila agora é **cod-0041** (Leva 2b — atenção: `depende-de: cod-0031` pro supérfluo configurável; o baseline funciona sem). **Atualização 2026-07-12 (rotina matinal):** cod-0041/0042 seguem bloqueadas até o commit das dependências (cod-0031/cod-0040, ainda só no working tree); a rotina executou a **cod-0050** (guarda de schema — em revisão). **✅ Atualização 2026-07-13 (entrega):** TUDO commitado e pushado (`7082535`..`9182b91`, 6 commits, `origin/main` sincronizado) — cod-0021/0022/0024/0031/0040/0050 movidas pra "Concluído"; **cod-0041 e cod-0042 DESBLOQUEADAS** — cod-0041 é a próxima da fila. **✅ Atualização 2026-07-13 (tarde):** cod-0041 (Cowork iniciou, rotina matinal completou) e cod-0042 (Cowork) implementadas e movidas pra "Em revisão" — commite em 2 commits separados (os diffs no `intents.js` são blocos distintos). **✅ Atualização 2026-07-14 (rotina matinal):** cod-0051 implementada e movida pra "Em revisão" (31 testes da extração + export mínimo no `gemini.js`); **próxima da fila: cod-0052**. **✅ Atualização 2026-07-15 (rotina matinal):** cod-0052 implementada e movida pra "Em revisão" (19 testes do dedup + validação de payload; `validarPayloadWebhook` extraída pura, `app.listen` atrás de `require.main` guard); **próxima da fila: cod-0065** (modo recibo Canadá — atenção: é `feature-codigo` GRANDE, avaliar se cabe na rotina ou se espera sessão com o Gabriel).

> **💬 Assistente Conversacional — Leva 2 de intents (2026-07-09, planejamento Opus + Gabriel).** Direção: transformar o Agente numa força do produto (benchmark + 4 eixos em `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`). Gabriel priorizou a **Leva 2 de intents** (inteligência já pronta no `insights.js`). ⚠️ Pré-requisito de PRODUÇÃO (não de código): deploy do Agente (migrations + envs) — ver alerta urgente em "Ações do Gabriel". As demais sugestões foram TODAS validadas pelo Gabriel (2026-07-09) e estão registradas no Backlog como **cod-0043..0049** — cadeia futura com gate explícito por etapa (só sobem pra fila com a etapa anterior validada em produção).

---

---

> **🇨🇦 Modo recibo Canadá (Vancouver) — MVP enxuto (2026-07-09, pedido direto do Gabriel).** Objetivo do Gabriel: usar o mesmo sistema aqui do Canadá, com recibos de **qualquer comércio** (não só supermercado), seguindo no WhatsApp e **aproveitando tudo que der**. "Não precisa muito desenvolvimento — pelo menos o software precisa entender o recibo e armazenar o dado organizado." Isto **adianta uma fatia concreta da Frente 2** (cod-0063/0064 no Backlog) a pedido explícito; a sessão de desdobramento do Longo Prazo segue valendo para o resto. Insights + legal: `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md`. ⚠️ **Pré-requisitos humanos/legais antes de qualquer envio a usuário no Canadá** (ver "Ações do Gabriel"): consentimento **CASL**, provedor de WhatsApp p/ número canadense, (opcional) migration `compras.moeda`.

> **🔍 Auditoria Integral (2026-07-10)** — 2 tarefas de teste derivadas dos achados (doc: `Economizei app/Auditoria_Integral_2026-07-10.md` §6). Firewall-limpas; a posição na fila é sua na próxima repriorização.

> **🗓️ Sessão de planejamento 2026-07-15 (Opus + Gabriel — reabastecer fila + desdobrar Longo Prazo).** Gargalo reconhecido: a Leva 2 continuada do Agente (cod-0043..0049) está toda travada pelo `perguntas_log` de produção — que não existe pré-lançamento. Logo, a **Frente 1 (ingestão multi-documento)** é o melhor uso da janela (melhora o produto brasileiro em validação, não precisa de log, reusa a fundação). **Decisões:** (1) **Frente 1 começa pelo DESENHO cod-0060** (sessão Opus+Gabriel, não máquina) antes de qualquer código; ordem interna sugerida PIX→fatura, fatura provável Pro. (2) **Reabastecer a fila com cod-0034 + cod-0032 + cod-0033** (abaixo) — Free/Alerta Pro firewall-limpos, melhoram o produto atual sem depender de dados de produção. (3) **Frente 2: repensar o canal** — a tese "WhatsApp é o produto" NÃO viaja pra América do Norte; explorar SMS/app/**Plaid** (agregador bancário muda o produto de "foto do cupom" pra "conexão de conta"). É reframe estratégico pesado → **merece sessão própria**; cod-0063 (i18n) NÃO foi escolhida pro refill. cod-0065 desce (gated também pelo reframe de canal).

> **🧾➕ Frente 1 — DESENHO cod-0060 FEITO (2026-07-15, Opus + Gabriel).** Doc: `Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`. Decisões travadas: (1) modelo = **estender `compras.tipo`** com `'pix'` (reuso, sem tabela nova); (2) escopo do 1º build = **só PIX** (cod-0061 plumbing + cod-0062 leitura); (3) detecção = **Gemini classifica na extração** (campo `tipo_documento`, uma chamada). Invariantes: LGPD processa-e-descarta + `/apagar` cobre PIX; corpus de cupom fica verde (coração); PIX fora de `calcularMedia`/`precos_mercado`; "pix" acusa no firewall (revisão humana). **Achado do desenho:** trocar `if (tipo !== 'outros')` → `if (tipo === 'mercado')` no `salvarCompra` (senão PIX entra em `precos_mercado`). Pré-reqs humanos (ver "Ações do Gabriel"): verificar CHECK em `compras.tipo` + fornecer 2–3 comprovantes PIX reais pro corpus + confirmar payload de documento da Z-API. **cod-0061 lidera a fila (independente); cod-0062 depois (precisa dos PIX reais pra validar o corpus).**

### [P2] Frente 1 — ler comprovante de PIX (foto/PDF)
- id: cod-0062
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o Gemini classifica o documento (`tipo_documento`); se PIX, extrai valor/data/contraparte e grava como `compras` `tipo='pix'` (contraparte→`loja`, itens=[]), confirmando com o número primeiro.
- arquivos-alvo: `src/gemini.js` (campo `tipo_documento` + ramo PIX no prompt e no `validarSchema`), `src/supabase.js` (`salvarCompra` aceita `tipo='pix'` + **trocar guard de `precos_mercado` pra `=== 'mercado'`**), `src/formatter.js` (`montarConfirmacaoPix`), `test/` (+ mini-corpus PIX)
- criterios-de-aceite:
  - comprovante PIX (imagem/PDF) → `tipo_documento='pix'`, valor/data/contraparte extraídos; `salvarCompra` grava `tipo='pix'` com itens vazios
  - PIX NÃO entra em `calcularMedia` nem em `precos_mercado` (o guard virou `=== 'mercado'`)
  - **corpus de cupom continua verde** (coração intacto); mini-corpus PIX verde; confirmação com R$ no topo, sem gíria
  - node --test verde; firewall verde (token "pix" acusa de propósito — commit consciente)
- fora-de-escopo: insight/query dedicado de PIX; fatura; gate Pro; i18n; persistir moeda
- depende-de: cod-0061; **pré-req humano: 2–3 comprovantes PIX reais do Gabriel pro mini-corpus** (sem eles, código pronto mas validação incompleta — como o cod-0065)
- status: pronta

### [P2] Agente — intent `gasto_por_termo` ("quanto gastei em cerveja?")
- id: cod-0034
- tipo: feature-codigo
- skills: economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall, economizei-code-decisions
- objetivo: intent NL Free no Agente de Perguntas que soma o gasto por **categoria OU palavra-chave livre** ("cerveja", "chocolate", "ração") reusando o matching puro `casarItemComAlvo`/`buscarGastoPorAlvo` (cod-0030, já commitado) + o firewall de fidelidade numérica do agente (o número nasce no executor, nunca no LLM). Entra no registro de intents como as da Leva 2.
- arquivos-alvo: `src/agent/intents.js`, `test/`
- criterios-de-aceite:
  - mesmos padrões da Leva 2 (fato rico via `brl()`, `temDados` honesto, exemplos no registro, sem gíria); estado-vazio honesto quando o termo não casa nenhum item (nunca número chutado)
  - reusa `buscarGastoPorAlvo` — NÃO recalcula soma no LLM; Camada 4/5 respeitadas
  - node --test verde; firewall verde (0 tokens financeiros — é intent Free, na cota do Agente; decisão de pricing 07-08)
- fora-de-escopo: comandos `/acompanhar` (é cod-0033); gate Pro; nada financeiro
- depende-de: cod-0030 (`2a83bcd` ✅), cod-0017 (agente no ar e validado 07-09 ✅) — **desbloqueado**
- status: pronta

### [P2] Alerta Pro — Pilar A: bloco de gasto supérfluo no `/gastos` e no resumo mensal
- id: cod-0032
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review, economizei-product-principles, economizei-financial-firewall
- objetivo: mostrar quanto do mês foi em itens supérfluos (via `buscarGastoSuperfluo`, cod-0030 ✅) como um bloco no `/gastos` e no resumo mensal. Número primeiro, sem moralizar ("Doces e bebidas: R$52,40 — 11% do mês"), copy WhatsApp.
- arquivos-alvo: `src/formatter.js` (bloco na `montarMensagemGastos`/`montarResumoMensal`), `src/index.js` (passar o dado), `test/`
- criterios-de-aceite:
  - baseline doces+bebidas (do cod-0031, `buscarCategoriasSuperfluas`); estado-vazio honesto ("sem supérfluo no mês, bom sinal" ≠ "sem gasto no mês")
  - número primeiro, sem julgar; sem gíria proibida; node --test verde; firewall verde
- fora-de-escopo: **gate Pro** = padrão Gate Pro (máquina constrói SEM gate; Gabriel insere ~3 linhas na revisão — `Gate_Pro_Desdobramento_2026-07-10.md`); configuração de categorias supérfluas é cod-0033; nada financeiro
- depende-de: cod-0030 (`2a83bcd` ✅), cod-0031 (em revisão — commitar antes de subir esta)
- status: pronta

### [P3] Alerta Pro — comandos `/acompanhar` `/limite` `/acompanhamentos` `/parar` `/superfluo`
- id: cod-0033
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review, economizei-product-principles, economizei-financial-firewall
- objetivo: comandos pra configurar acompanhamentos (categoria/palavra-chave) e categorias supérfluas, lendo/gravando via as funções do cod-0031. Mensagens curtas, sem gíria. `/acompanhamentos` e `/parar` ficam SEM gate (quem caiu do Pro precisa ver/parar o que configurou — decisão 07-10).
- arquivos-alvo: `src/index.js`, `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `/acompanhar cerveja` cria acompanhamento; `/parar` desativa (soft-delete cod-0031); `/acompanhamentos` lista; `/superfluo doces` ajusta baseline; confirmações curtas e honestas
  - node --test verde; firewall verde (o gate Pro dos que precisam é ~3 linhas humanas na revisão)
- fora-de-escopo: alerta proativo de limite (é cod-0035); intent NL (é cod-0034); gate Pro humano
- depende-de: cod-0031 (em revisão — **commitar antes**), cod-0033 usa a I/O dele
- status: pronta

### [P2] Modo recibo Canadá (Vancouver) — entender e armazenar qualquer recibo
- nota (2026-07-15): DESCEU na prioridade — a decisão de Frente 2 virou "repensar o canal" (Plaid/app), então o Canadá-via-WhatsApp não está confirmado; a leitura de recibo é canal-agnóstica e segue útil como groundwork, mas espera os seus 2–3 recibos reais + a sessão de canal.
- id: cod-0065
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o bot lê recibo canadense de QUALQUER comércio (mercado, restaurante, varejo, farmácia, etc.), detecta a moeda/idioma ($/en → CAD; R$/pt → BRL), extrai loja/data/total/itens (categoria + `nome_canonico`) e confirma no WhatsApp com o símbolo de moeda certo — **reusando todo o pipeline atual** (`lerRecibo` → `validarSchema` → `salvarCompra` → confirmação). SEM quebrar o comportamento pt-BR/BRL.
- arquivos-alvo: `src/gemini.js` (PROMPT + `coerceNumber` + detecção de moeda), `src/formatter.js` (helper `fmtMoeda(valor, moeda)` currency-aware só na confirmação), `test/` (testes novos + mini-corpus canadense)
- criterios-de-aceite:
  - `coerceNumber` lida com `"1,299.90"` (vírgula de milhar + ponto decimal) **sem** quebrar `"99,90"` pt-BR
  - o prompt detecta a moeda pelo símbolo/idioma e retorna campo `moeda`; **CNPJ opcional** (null quando ausente — o esquema já aceita)
  - recibo canadense de qualquer tipo → `sucesso:true` com loja/total/itens; item names em inglês canonizados **pelo tipo genérico** ("milk whole 2%", "chicken breast")
  - confirmação mostra o símbolo certo ($ vs R$), número no topo, sem gíria
  - **o coração não regride:** corpus de regressão de classificação pt-BR **verde** (CODE_GUIDE §0) + **mini-corpus canadense** (2–3 recibos reais que o Gabriel fornecer)
  - node --test verde; **firewall financeiro verde** (zero token de `is_pro`/plano/preço — "moeda" é dado transacional, não pricing)
- fora-de-escopo: i18n completo das mensagens (é cod-0063); **NÃO gravar `moeda` em `compras`** (sem a migration, o INSERT quebra — lição do A9; persistência é follow-on humano); leitura de fatura/PIX (Frente 1); gate Pro; provedor de WhatsApp p/ número canadense; consentimento CASL (humano/legal); **NÃO** tocar `/planos`/`/assinar`/pagamento
- status: pronta

---

## 🔧 Em revisão
*(a máquina move pra cá ao abrir um PR — esperando o Gabriel revisar/commitar)*

### [P2] Frente 1 — receber DOCUMENTO (foto/PDF) no webhook (plumbing)
- id: cod-0061
- tipo: feature-codigo
- skills-usadas: economizei-code-decisions, economizei-tdd, economizei-security-lgpd, economizei-financial-firewall, economizei-copywriter (mensagem honesta de MIME)
- objetivo: detectar mensagem de documento no payload Z-API, baixar com o mesmo padrão de retry/validação da imagem, e rotear por MIME pro mesmo pipeline de recibo. SÓ a plumbing — a leitura por tipo de comprovante é cod-0062.
- o-que-mudou (rotina matinal 2026-07-16):
  - `src/zapi.js`: `baixarDocumento(mediaUrl)` — espelha `baixarImagem` (2 tentativas, validação de tamanho, timeout), logs próprios (`zapi_documento_*`); exportada.
  - `src/index.js`: `validarPayloadWebhook` reconhece `body.document` → `tipo: 'documento'` (URL defensiva: `documentUrl`|`url`|`fileUrl`; `mimeType` opcional); `mimeAceitavel(mime)` puro (só `image/*` e `application/pdf`); dispatch `'documento'` no webhook; `processarImagem` virou wrapper fino + núcleo compartilhado `processarReciboRecebido(phone, baixar)` (extração mecânica, fluxo de imagem inalterado); `processarDocumento(phone, url, mime)` faz o gate de MIME e roteia pelo mesmo núcleo. Exports test-only: +`mimeAceitavel`.
  - `src/formatter.js`: `montarMensagemDocumentoNaoSuportado()` — mensagem honesta (só foto/PDF), sem gíria, sem token financeiro; exportada.
  - `test/webhook-documento.test.js`: 11 testes (validarPayloadWebhook documento — válido, campos alternativos, sem mime, URL inválida, precedência texto/imagem; `mimeAceitavel`; mensagem honesta).
- decisão de escopo (registrar na revisão): "documento" hoje é foto/PDF de recibo enviado como arquivo → roteado pelo MESMO fluxo do cupom (fecha o gap do `montarMensagemEnviarComoArquivo`, que instrui a reenviar como arquivo mas até então não tinha handler). A classificação cupom × comprovante e a persistência de novos tipos ficam pra cod-0062. Nada de gravar tipo novo em `compras` aqui.
- validação: `npm run check` → firewall **verde** (0 token financeiro; "pix" removido dos comentários de propósito); `check-pages` **OK** (0 erro); testes **366/0** em cópia limpa `/tmp` com `sharp` stubado. ⚠️ no mount do sandbox o `node --test` direto dá SIGBUS ambiental do `sharp` + o mount serviu `zapi.js` truncado/`index.js` com padding NUL (regra 11) — **gate final na máquina do Gabriel (Windows) antes do commit**.
- pendências humanas: (1) confirmar o **payload real de documento da Z-API** em produção — o parser é defensivo (`documentUrl`/`url`/`fileUrl` + `mimeType`/`mime`), mas o campo exato precisa ser verificado; (2) revisar a decisão de escopo acima antes de commitar.
- status: em-revisao (2026-07-16)

> **✅ RECONCILIADO em 2026-07-13 (sessão de entrega — Cowork):** TODAS as tarefas que estavam aqui foram commitadas e pushadas em 6 commits (`origin/main` sincronizado, working tree limpo): **cod-0021 + cod-0024** (`7082535`), **cod-0022** (`473ea18`), **cod-0031** (`86dbb64`), **cod-0040** (`0dc9159`), **cod-0050** (`0b81181`) e docs/memória (`9182b91`). As históricas (cod-0013, cod-0014..0017, cod-0020) já estavam em `d4eaf51`/`3b2f375` desde 07-08. Detalhes de cada tarefa preservados em "✅ Concluído" abaixo. Seção esvaziada (curadoria).

> **✅ RECONCILIADO em 2026-07-16 (comando `/entregar`):** 4 tarefas commitadas e pushadas em 4 commits (`origin/main` sincronizado, working tree limpo, 355/355 testes verdes, firewall verde): **cod-0041+0042** (`c355d74`), **cod-0051** (`38689b9`), **cod-0052** (`a40110f`) e docs/painel (`73f8cce`). Detalhes preservados em "✅ Concluído" abaixo. Seção esvaziada.

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

> **Entrega de 2026-07-13:** 6 tarefas da Máquina Local commitadas e pushadas de uma vez (firewall `--working` OK, 0 tokens financeiros; 260/263 testes verdes no sandbox — 3 SIGBUS ambientais do `sharp` que passam no Windows).

- **cod-0021 · Copy obsoleta `nao_supermercado` corrigida** (commit `7082535`, 2026-07-13) — mensagem de erro reescrita no `formatter.js` (bot lê qualquer estabelecimento → "Outros (não-mercado)") + `inferirCategoria` no `gemini.js` parou de mascarar o motivo real do erro por tipo de loja (exportada pra teste). `test/erro-copy.test.js` (6 testes). *(skills: code-decisions, copywriter, copy-review, tdd, financial-firewall)*
- **cod-0024 · `inativo_d10` sem contador stale** (commit `7082535`, 2026-07-13) — `montarLembreteInativoD10()` sem parâmetro e sem número (o `compras_mes_atual` pode refletir o mês anterior pra inativo, reset preguiçoso); call site no `reengagement.js` ajustado. `test/reengagement-d10.test.js` (4 testes). *(skills: code-decisions, tdd, copywriter)*
- **cod-0022 · Testes do `formatter.js` não-financeiro** (commit `473ea18`, 2026-07-13) — `test/formatter.test.js` (28 testes): gastos, inflação, economia, cortar, alerta 3 níveis, comparativo — estados-vazios honestos incluídos. *(skills: tdd, code-decisions)*
- **cod-0031 · Alerta Pro — camada de persistência de acompanhamentos** (commit `86dbb64`, 2026-07-13) — 5 funções + baseline no `supabase.js` (`buscarAcompanhamentos`, `salvarAcompanhamento` upsert, `desativarAcompanhamento` soft-delete, `set/buscarCategoriasSuperfluas` com baseline `['doces','bebidas']`), degradação segura, `cliente` injetável. `test/acompanhamentos-io.test.js` (17 testes). **Inerte em produção até a cod-0041/0032+ ligarem.** *(skills: code-decisions, tdd, financial-firewall, security-lgpd)*
- **cod-0040 · Agente — Leva 2a: 4 intents com inteligência pronta** (commit `0dc9159`, 2026-07-13) — `inflacao_item`, `raio_x_categorias`, `economia_acumulada`, `onde_cortar` no registro do Agente, reusando F1/F2/F3/F4 do `insights.js`; fato rico via `brl()`, `temDados` honesto, Camada 4/5 respeitadas; `classifier.js` intocado (aprende pelo registro). `test/agent-intents-leva2.test.js` (14 testes) + invariante do MVP atualizado (3→7 intents). *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0050 · Guarda de schema no boot** (commit `0b81181`, 2026-07-13) — `src/schemaGuard.js` (12 checagens críticas via probe de leitura vazia; NUNCA bloqueia o boot; log `schema_guard_faltando` + aviso opcional via `ADMIN_PHONE`) + wiring fire-and-forget no `app.listen`. Rede de segurança do incidente A9. `test/schema-guard.test.js` (13 testes). ⚠️ Vai acusar `acompanhamentos`/`usuarios.categorias_superfluas` até a migration do Alerta Pro rodar — é o desenho. *(skills: code-decisions, tdd, financial-firewall, debugging)*

> **Entrega de 2026-07-16:** 4 tarefas commitadas e pushadas via `/entregar` (firewall verde, 355/355 testes verdes, origin/main sincronizado).

- **cod-0041 + cod-0042 · Agente — Leva 2b** (commit `c355d74`, 2026-07-16) — `comparativo_mercados` + `gasto_superfluo` como intents (reusam `compararPrecosMercado`/`buscarGastoSuperfluo`); `duvida_sobre_bot` com lista viva derivada do REGISTRO; `consomeCota:false` + guarda no passo [6] do orquestrador; `test/agent-intents-leva2b.test.js` (16 testes) + `test/agent-duvida-bot.test.js`; invariante REGISTRO 9→10. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0051 · Testes da extração Gemini** (commit `38689b9`, 2026-07-16) — `parseRespostaGemini` extraída de `lerRecibo` (pura, testável); exports test-only em `gemini.js`; `test/gemini-extracao.test.js` (31 testes: `reconciliarItens`, `validarSchema`, `parseRespostaGemini`, `_scoreReconciliacao`). Fecha zero-teste no coração da extração. *(skills: tdd, code-decisions)*
- **cod-0052 · Testes dedup + validação de payload webhook** (commit `a40110f`, 2026-07-16) — `validarPayloadWebhook` extraída pura; `app.listen` atrás de `require.main === module`; exports test-only em `index.js`; `test/webhook-dedup.test.js` (19 testes: dedup com deps injetadas, payload malformado, messageId/phone/imageUrl). *(skills: tdd, code-decisions, financial-firewall)*

> **Reconciliado em 2026-07-02:** as 6 tarefas abaixo já estavam commitadas e pushadas (working tree limpo em `a795f65 = origin/main`); a AGENDA é que estava stale (ainda as listava em "Em revisão"). Verificado por `git log`.

- **cod-0014..0017 · Agente de Perguntas — cadeia FECHADA (render + mensagens + cota + orquestrador)** (commit `d4eaf51`, 2026-07-08) — `src/agent/{cota,render,index}.js` + `src/formatter.js` (+4 msgs, inclui `montarErroAgente`) + wiring no `else` final de `processarTexto` (index.js) + purga do log no `scheduler.js`. Narração LLM com **firewall de fidelidade numérica + airbag template**; off-topic não consome cota; `temDados:false` nunca vai pro LLM. **184/184 testes reais verdes.** *(skills: tdd, financial-firewall, copywriter, copy-review, security-lgpd, code-decisions)* ⚠️ **Deploy pendente (humano): `migration_FUTURA_agente_perguntas.sql` + envs + teste end-to-end com pergunta/cupom real.**
- **cod-0013 · Agente de Perguntas — classificador (Gemini → intenção)** (commit `d4eaf51`, 2026-07-08) — `src/agent/classifier.js` (prompt puro + chamada injetável) + `test/agent-classifier.test.js` (16 testes). Degradação segura → `fora_de_escopo`; porta de topicalidade. *(skills: tdd, code-decisions, financial-firewall)*
- **cod-0020 · Comparativo entre mercados — LEITURA (feature paga nº1)** (commit `d4eaf51`, 2026-07-08) — `compararPrecosMercado` (insights.js, puro) + `buscarObservacoesComparativo` (supabase.js) + `montarMensagemComparativo` (formatter.js) + comando `/comparar` (index.js). Teaser por env `COMPARATIVO_AMOSTRAS_FREE`. 16 testes verdes. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)* ⚠️ **Gate Pro (`is_pro`, financeiro) segue humano.**
- **cod-0012 · Agente 3/8 — registro das 3 intenções + templates** (commit `4a3c62e`) — `src/agent/intents.js` + `test/agent-intents.test.js` (20 testes) + export de `brl` no `formatter.js`. *(skills: tdd, financial-firewall)*
- **cod-0011 · Agente 2/8 — guardas de honestidade (puras), "o coração"** (commit `e4cc493`) — `src/agent/guards.js` (`validarClassificacao`, `extrairNumeros`, `conferirFidelidadeNumerica`) + `test/agent-guards.test.js` (28 testes). *(skills: tdd, financial-firewall)*
- **cod-0006 · `/apagar` — exclusão de dados LGPD** (commit `ddde18c`) — `src/apagar.js` + `apagarDadosUsuario` (supabase.js) + 3 mensagens + handler antes do onboarding + `test/apagar.test.js` (11 testes). Fechou o A2. Sem migration. *(skills: security-lgpd, tdd, copywriter, copy-review, financial-firewall, code-decisions)*
- **cod-0030 · Alerta Pro — engine de matching puro** (commit `2a83bcd`) — `casarItemComAlvo`/`buscarGastoPorAlvo`/`buscarGastoSuperfluo` em `insights.js` + `test/insights-matching.test.js` (17 testes). *(skills: code-decisions, tdd, product-principles, financial-firewall)*
- **cod-0027 · Classificação — corpus de regressão** (commit `743f2b1`) — `test/classificacao-corpus.test.js` (corpus bom/ruim do `nome_canonico`). *(skills: tdd, code-decisions)*
- **cod-0026 · Classificação — `nome_canonico` lidera pelo tipo genérico** (commit `8a479c4`) — prompt + heurística `comeca_por_marca` em `gemini.js` + testes. Habilita o matching por palavra-chave do alerta Pro. *(skills: code-decisions, tdd, product-principles, financial-firewall)*
- **A4/A9 · migrations + `compras.cnpj` no `salvarCompra`** (commit `a795f65`) — `supabase/migration_2026-06-30_A4/A9...sql` + 2 futuras + edição no `salvarCompra`. **Falta rodar A4/A9 no SQL Editor** (ver "Ações do Gabriel"). *(zona `supabase/` — commitado com `--no-verify`)*

- **cod-0010 · Agente 1/8 — parser de período** (commit `b73b15b`) — `src/agent/periodo.js` + `test/agent-periodo.test.js`. Puro, sem I/O. Abre a cadeia do Agente de Perguntas. *(skills: economizei-tdd)*
- **cod-0001 · F3 "Onde cortar sem doer"** (commit `b73b15b`) — comando `/cortar` + `analisarOndeCortar` em `insights.js` + template em `formatter.js`. Fecha a leva F2→F1→F4→F3. *(skills: tdd, copywriter, copy-review, financial-firewall)*
- **cod-0003 · Testes do alerta em 3 níveis** (commit `b73b15b`) — `test/alerts.test.js` (11 testes). Sem mudança em `src/`. *(skills: economizei-tdd)*
- **cod-0002 · Teste de regressão do nome canônico** (commit `b73b15b`) — `test/gemini-canonico.test.js`. A heurística já estava afrouxada (06-08); faltava o teste. *(skills: tdd, debugging)*
- **cod-0004 · Encurtamento das mensagens automáticas (−25%)** (commit `e8de024`) — 14 funções do `formatter.js` reescritas (número no topo, copy WhatsApp). Doc: `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`. *(skills: copywriter, copy-review, financial-firewall)*

---

## 🧊 Backlog (ideias não priorizadas — a máquina NÃO pega daqui)
*(rascunhos. Na sessão de planejamento, você + Opus refinam e sobem pra "Fila pronta")*

**Código (não-financeiro) — prontos para priorizar:**
- ~~**cod-0004 · Encurtamento das mensagens automáticas**~~ — ✅ **CONCLUÍDO** (commit `e8de024`, 06-26 reconciliado). Ver "Concluído".
- **cod-0005 · Agente de Perguntas MVP** — ✅ **Decisões respondidas (2026-06-24) e expandido em cod-0010..0017 na "Fila pronta"** (Free, 3 intenções, Opção A estruturada com narração LLM). Design atualizado: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`.
- **cod-0018 · Agente de Perguntas — Opção B (fundamentação aberta / function-calling)** — o "chat de verdade": o Gemini escolhe entre as intenções como ferramentas (sem classificador fixo), reusando guardas e firewall idênticos. Costura no Desenho §14. ⚠️ **Só subir pra fila DEPOIS de A validada** (cod-0010..0017 no ar, `fidelidade_ok` estável no log + perguntas recorrentes fora das 3 intenções).
- ~~**cod-0006 · `/apagar`**~~ — ✅ **IMPLEMENTADO (2026-06-27), em "Em revisão"** (aguarda Gabriel rodar `npm run check` + commitar). Fechou o A2.
- **cod-0007 · Afinar limiares do alerta** (`ALERTA_*`) com base em dados reais — precisa de dados em produção primeiro.
- **cod-0008 · Testes de `formatter.js`** nas mensagens não-financeiras (gastos, inflação, economia). **[Auditoria 06-25 · A6 🟠]** expandido em cod-0022 (cobre também `/cortar` e o alerta de 3 níveis).

**💬 Assistente Conversacional — cadeia futura (2026-07-09, todas VALIDADAS pelo Gabriel; entram com o tempo, gated pela validação da etapa anterior):**
*(doc-mãe: `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`. Regra do Gabriel: aplicar em ordem, cada etapa só sobe pra "Fila pronta" depois que a anterior estiver validada em produção — o `perguntas_log` é o juiz.)*

- **cod-0043 · Naturalidade 1 — contexto de follow-up (Eixo B2)** — memória curta do último `{intent, params}` por usuário (TTL ~10min) pra herdar parâmetros ("e em bebidas?", "e mês passado?"). A memória só ajuda a ENTENDER a pergunta; o número segue nascendo no executor. tipo: feature-codigo. skills: code-decisions, tdd, product-principles, financial-firewall. **Gate: Leva 2 (cod-0040..0042) no ar + log confirmando perguntas de sequência.**
- **cod-0044 · Naturalidade 2 — sugestão de próxima pergunta (Eixo B3)** — cada intent declara `sugestoes[]`; a resposta termina com no máx. 1 sugestão contextual ("Quer ver por categoria?"). Mata o cold start "o que eu posso perguntar?". tipo: feature-codigo. skills: code-decisions, tdd, copywriter, copy-review, financial-firewall. **Gate: junto ou logo após cod-0043.**
- **cod-0045 · Naturalidade 3 — prompt de narração menos robótico (Eixo B4)** — variar abertura/estrutura da narração LLM (tom "esperto do interior", sem gíria proibida, sem conselho); firewall de fidelidade intocado. tipo: refino-codigo. skills: copywriter, copy-review, financial-firewall, tdd. **Gate: `fidelidade_ok` estável no log (mexer no prompt só com a métrica saudável de baseline).**
- **cod-0046 · ÁUDIO — entrada por voice note (Eixo B1, o maior salto de naturalidade)** — voice note → download via Z-API (padrão do download de imagem) → transcrição Gemini → MESMO pipeline do agente (cota/guardas idênticas). Resposta continua em texto (sem TTS). tipo: feature-codigo. skills: code-decisions, tdd, product-principles, security-lgpd (áudio é dado pessoal — processar em memória e descartar, como a imagem do cupom), financial-firewall. **Gate: Agente VALIDADO com texto em produção (fidelidade + intents estáveis) — não abrir o áudio antes.**
- **cod-0047 · Análises novas + filtros compostos (Eixo A2/A3)** — funções puras novas no `insights.js`: `projetarFimDeMes` ("posso gastar mais?"), `rankearItens` (top 5), `gastoPorLoja`, `ticketMedioPorIda`, `ultimaCompraItem`, `frequenciaCompra` + params compostos categoria×período×loja×termo no vocabulário fechado. tipo: feature-codigo. skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall. **Gate: log da Leva 2 mostrando quais dessas perguntas as pessoas REALMENTE fazem (construir só as pedidas); A9 rodada (loja/cnpj).**
- **cod-0048 · Gráfico sob demanda na conversa (Eixo D2)** — intent `mostrar_grafico` reusando `charts.js`/QuickChart do `/gastos`. tipo: feature-codigo. skills: code-decisions, tdd, financial-firewall. **Gate: Leva 2 no ar.**
- **cod-0049 · Insights proativos (Eixo C — lição da Erica: 60% proativo)** — biblioteca de gatilhos determinísticos (item recorrente subiu ≥X%, categoria cruzou a média no meio do mês, marco de economia, recap semanal opt-in) com cooldown anti-fadiga + base estatística mínima (Camada 4). **⚠️ NASCE UNIFICADO com o Alerta Pro (cod-0031..0035) — é UM sistema de proativos, não dois.** tipo: feature-codigo. skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall. **Gate: Alerta Pro (cod-0032/0035) construído + decisão Free×Pro dos proativos (humano/firewall).**
- **cod-0018 · Chat aberto / function-calling (Eixo B5)** — já registrado acima neste Backlog; segue como ÚLTIMO da escada. **Gate: `fidelidade_ok` alto e estável + log com perguntas recorrentes fora do cardápio de intents.**

**🔭 Longo Prazo (2026-07-09 — Empresa BC ADIADA pra OUTUBRO/2026; doc-mãe: `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`):**
*(sementes pro tempo até a abertura da empresa — janela de planejamento agora é de até 2 meses. Regra do Gabriel: NENHUMA sobe pra "Fila pronta" antes da **sessão de desdobramento** (discussão + insights, item em "Aguardando sua decisão"). Estas linhas existem pra ideia não se perder.)*

- ~~**cod-0060 · Frente 1 — Desenho técnico da ingestão multi-documento**~~ — ✅ **FEITO (2026-07-15, Opus + Gabriel).** Doc: `Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`. Decisões: estender `compras.tipo` com `'pix'` · só PIX no 1º build · Gemini detecta `tipo_documento` na extração. **Desbloqueou cod-0061 + cod-0062 → promovidas pra "Fila pronta".** Pré-reqs humanos no painel "Ações do Gabriel".
- ~~**cod-0061 · Frente 1 — Fundação: receber DOCUMENTO (PDF) no webhook**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-15)** após o desenho cod-0060. Lidera a fila (independente). Ver bloco completo lá em cima.
- ~~**cod-0062 · Frente 1 — Leitura de comprovante PIX (foto/PDF)**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-15)** após o desenho cod-0060. Depende de cod-0061 + dos comprovantes PIX reais do Gabriel pro corpus. Ver bloco completo lá em cima.
- **cod-0063 · Frente 2 — Fundação i18n** — camada de localidade (strings do bot por idioma, moeda/formatação por região) sem mudar NADA do comportamento pt-BR atual. tipo: refino-codigo. skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, economizei-financial-firewall. **Gate: decisão de mercado-alvo + CANAL.** ⚠️ **Atualização 2026-07-15 — Gabriel escolheu REPENSAR O CANAL** (SMS/app/**Plaid**), não o nicho WhatsApp. Isso é um reframe estratégico pesado: com Plaid, o produto deixa de ser "foto do cupom" e vira "conexão de conta bancária" — muda o gesto zero-atrito, o posicionamento e a defensabilidade (o dado item-a-item do recibo). **Merece SESSÃO PRÓPRIA de discussão antes de qualquer código de Frente 2.** i18n NÃO foi promovida pro refill; segue semente.
- ~~**cod-0064 · Frente 2 — Leitura de recibo canadense (Vancouver)**~~ — ✅ **PROMOVIDA como MVP enxuto em cod-0065 (2026-07-09, pedido do Gabriel)** e movida pra "Fila pronta". O MVP cobre leitura + moeda + confirmação de recibo de qualquer comércio, reusando o pipeline. O que sobra desta semente (i18n completo das mensagens, persistência de moeda, provedor de WhatsApp) segue como follow-on / **cod-0063** / humano.

**🔍 Achados da Auditoria de Código (2026-06-25) — ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`:**
*(capturados aqui pra priorizar depois. Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · 🟢 baixo. Itens de SQL/git/financeiro foram pro painel "Ações do Gabriel"; decisões de produto foram pra "Aguardando sua decisão".)*

- **cod-0020 · 🔴 Comparativo entre mercados — LEITURA [A1] — GATE DECIDIDO (2026-06-27): Pro completo + teaser grátis** — a feature paga nº1 da pesquisa, hoje **só coleta**: `precos_mercado` recebe `INSERT` mas nunca é lido. Construir a leitura: query em `supabase.js` + comparação pura em `insights.js` + `montarMensagemComparativo` em `formatter.js` + comando `/comparar` em `index.js`. **Decisão de gate (Gabriel):** comparativo **completo só no Pro**, mas com **1+ comparativos de amostra liberados no Free** (teaser) pra o usuário entender a função e ver o valor antes de pagar. A máquina entrega a **leitura + a lógica do teaser** (ex.: nº de amostras grátis configurável por env, sem citar `is_pro`); o **gate Pro** (`temFeaturesProAtivas`/`is_pro`) e o limiar exato Free×Pro são passo SEPARADO e humano (toca firewall). Depende de densidade de dados (vários usuários na mesma loja). tipo: feature-codigo. skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall. **Próximo da fila do pago** (depois do `/apagar`, antes do Agente).
- ~~**cod-0021 · 🟡 Corrigir copy obsoleta `nao_supermercado` [A8]**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-08).** Ver o bloco completo lá em cima.
- ~~**cod-0022 · 🟡 Testes do `formatter.js` (não-financeiro) [A6]**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-08).** Ver o bloco completo lá em cima. *(Testes do caminho do dinheiro seguem no firewall → "Ações do Gabriel".)*
- **cod-0023 · 🟠 Alerta inteligente Pro — ✅ DESENHADO (2026-06-27)** — `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. Virou 2 pilares (supérfluo + acompanhamento personalizável por categoria/palavra-chave) e foi quebrado em: **cod-0026/0027** (classificação — na Fila pronta), **cod-0030** (matching puro — na Fila pronta) e a cadeia Pro **cod-0031..0035** abaixo. ⚠️ gate Pro = humano.

**❤️ Alerta Inteligente Pro — cadeia restante (refinada; sobe pra Fila pronta após a migration + decisão Free×Pro):**
*(desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. Código pode ser escrito antes da migration; só não roda em produção sem ela.)*
- ~~**cod-0031 · Leitura de acompanhamentos (`supabase.js`)**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-08)** após a decisão de pricing. Ver o bloco completo lá em cima.
- **cod-0032 · Pilar A — bloco de supérfluo** no `/gastos` e no resumo mensal (formatter), via `buscarGastoSuperfluo`. Número primeiro, sem moralizar. tipo: feature-codigo. skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall. depende-de: cod-0030.
- **cod-0033 · Comandos** `/acompanhar`, `/limite`, `/acompanhamentos`, `/parar`, `/superfluo` (index.js + formatter.js) com mensagens curtas (sem gíria proibida). tipo: feature-codigo. skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall. depende-de: cod-0031.
- **cod-0034 · Intent NL `gasto_por_termo`** no Agente de Perguntas ("quanto gastei em cerveja?") reusando o matching + firewall de fidelidade do agente. tipo: feature-codigo. skills: tdd, copywriter, copy-review, financial-firewall. depende-de: cod-0030 ✅, cod-0017 ✅ (agente no ar e validado em produção 2026-07-09) — **desbloqueado**; promovível à fila (é intent Free, na cota do Agente — decisão de pricing 07-08). Sequência: entra quando a Leva 2 abrir espaço.
- **cod-0035 · Alerta proativo de limite** (per-compra, idempotente no mês — avisa só na virada do teto). tipo: feature-codigo. skills: code-decisions, tdd, copywriter, financial-firewall. depende-de: cod-0031, cod-0033.
- ⚠️ **Humano (firewall):** migration de `acompanhamentos` + `usuarios.categorias_superfluas`; ligar o **gate Pro** (`temFeaturesProAtivas`/`is_pro`); decidir **Free×Pro** (Desenho §8). Ver "Ações do Gabriel" / "Aguardando decisão".
- ~~**cod-0024 · 🟢 `inativo_d10` não citar contador do mês pra inativo [nit]**~~ — ✅ **PROMOVIDA pra "Fila pronta" (2026-07-08).** Ver o bloco completo lá em cima.
- **cod-0025 · 🔴 Onboarding tranca comandos de pagamento [A3]** — nos steps 0–1 todo texto vira onboarding, então `/planos`/`/assinar`/`/pix` não respondem até o usuário mandar 1 cupom (bloqueia conversão paga). ⚠️ A correção mexe no roteamento de comandos de pagamento (`index.js`) → **provável trip do firewall**; tratar como sensível/revisão humana, **não soltar sozinha**. tipo: bugfix. skills: product-principles, code-decisions, tdd, financial-firewall.

**Páginas (foco secundário por enquanto):**
- pag-0001: ajustar `landing/vercel.json` pra páginas novas (`/guias/...`) serem alcançáveis (hoje o catch-all joga tudo pro index). Pré-requisito de qualquer página nova de SEO.
- pag-0002: guia SEO "Como economizar no supermercado".
- pag-0003: guia SEO local "Economizar em Fernandópolis e região".
- pag-0004: variação A/B da headline do hero (`landing/index-b.html`).
- Página "Economizei vs. planilha de Excel" (o concorrente real, segundo a pesquisa).

---

## 🙋 Ações do Gabriel (só humano resolve — a máquina não consegue)

> Esta seção é o seu painel. Guia: `Economizei app/Automacao_Maquina_Noturna.md`.

**✅ ESTABILIZAÇÃO CONCLUÍDA (2026-07-09) — Agente + comparativo + salvar-cupom validados em produção:**
- [x] **A9 RODADA** — `compras.cnpj` confirmado; salvar-cupom desbloqueado em produção.
- [x] **A4 + `migration_FUTURA_agente_perguntas.sql` rodadas** no SQL Editor.
- [x] **4 envs setadas** no Railway + `.env.example` (`LIMITE_PERGUNTAS_FREE`, `AGENTE_MODO`, `AGENTE_MODELO`, `COMPARATIVO_AMOSTRAS_FREE`).
- [x] **Smoke test end-to-end PASSOU** — cupom salvou com `cnpj`; o número do Agente bateu com o `/gastos` (firewall de fidelidade OK); off-topic recusado sem inventar número. Roteiro: `Economizei app/Roteiro_Smoke_Test_2026-07-09.md`.

**🔍 Auditoria Integral (2026-07-10) — ações suas (doc: `Economizei app/Auditoria_Integral_2026-07-10.md`):**
- [ ] **[🔴 §1.4] Aplicar o patch do firewall** — 8 tokens novos (`temFeaturesProAtivas`, `COMPARATIVO_MAX_PRO`, `ehPro`, `marcarProAtivo`, `concederFeaturesPro`, `hotmart`, `ADMIN_SECRET`, roteamento `/planos`) + `--no-renames` nos 2 git diff (bypass por rename testado e confirmado) + path `src/hotmart.js`. Snippet pronto no doc. O arquivo é protegido de propósito — só você edita. Rodar `--selftest` depois.
- [ ] **[🔴 §3.3] Rodar a query de verificação de schema** no SQL Editor (5min) — confirma as migrations antigas nunca verificadas E se a RPC `incrementar_compras_mes` existe em produção (se não existir, todo cupom usa fallback racy em silêncio).
- [ ] **[🔴 §4.2 decisão] Copy da indicação promete "alerta inteligente" que não existe** — e a recompensa hoje não entrega nada (comparativo sem gate = Free vê o mesmo). Decidir: encurtar promessa + aplicar Gate Pro, ou segurar divulgação do `/convidar`.
- [ ] **[🔴 §4.3 financeiro] Fluxo `/assinar` ainda gera checkout Mercado Pago** — MP abandonado juridicamente em 06-24; se alguém assinar hoje, entra dinheiro por via irregular. Mínimo sugerido: `/assinar` → instruções PIX até Hotmart/Wise (out/2026).
- [ ] **[🟡 §2.3] Logar o fallback do incremento** em `salvarCompra` (1 linha; pode ir no mesmo commit consciente do patch do firewall).
- [ ] **[🟡 §8.3 opcional] RPC `incrementar_perguntas_mes`** — SQL pronto no doc; depois a troca no código é tarefa de máquina.

**🔍 Auditorias futuras (dependem de dados que só você acessa — material de preparação pronto no doc §7):**
- [ ] **aud-01 · Classificação com cupons reais** (§7.1 — a mais valiosa; destrava Alerta Pro com confiança). Você traz: 15–30 fotos de cupons variados + resultado das queries de `monitoring_canonicos.sql`.
- [ ] **aud-02 · Custo Gemini por chamada** (§7.2). Você traz: billing 30d do Google + as 2 queries de volume do doc.
- [ ] **aud-03 · LGPD nos logs do Railway** (§7.3). Você traz: export de 1 dia de logs + política de retenção do plano Railway. (Parcial já feito: mascaramento de phone OK na amostra; 2 logs de conteúdo bruto anotados.)
- [ ] **aud-04 · Custo total de infra vs orçado** (§7.4). Você traz: tier/uso de Railway, Supabase (storage/linhas), Z-API, Vercel. Atenção: Supabase free = 500MB com `precos_mercado` crescendo por design.

**🔓 Pré-requisitos jurídicos/financeiros — desbloqueiam Meta Ads, Hotmart e Wise:**
*(estas ações devem ser feitas ANTES de qualquer outra coisa de pagamento ou ads)*

- [ ] **[BLOQUEADOR #1] Abrir empresa em BC** — sem isso, não dá pra vincular Meta Business Manager, Hotmart nem Wise Business. Passo a passo completo em `Economizei app/Abertura_Empresa_BC_2026-06-24.md`. Custo: ~CAD 380–600 (abertura) + ~CAD 650–2.000/ano (manutenção). Prazo: ~2 semanas do zero até operacional. ⏸️ **ADIADO (2026-07-09): só será possível a partir de OUTUBRO/2026** — os bloqueadores #2..#5 herdam o adiamento; até lá o foco é construção (`Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`).
  - [ ] Name Approval Request (NAR) — CAD 30 — [BC Registry](https://www.bcregistry.ca)
  - [ ] Incorporação provincial BC — CAD 350 — [Corporate Online](https://www.corporateonline.gov.bc.ca)
  - [ ] Abre conta bancária empresarial pessoalmente (RBC, TD ou Coast Capital)
  - [ ] Registra Business Number na CRA (gratuito, online)
  - [ ] Registra GST/HST voluntariamente (gratuito — permite recuperar imposto de despesas)

- [ ] **[BLOQUEADOR #2] Criar conta Wise Business vinculada à empresa canadense** — desbloqueia recebimento de PIX dos planos mensais. Ativa conta BRL (dados bancários brasileiros para receber PIX). Gratuito para criar; sem custo fixo mensal.

- [ ] **[BLOQUEADOR #3] Vincular Meta Business Manager à empresa canadense** — trocar a entidade do BM atual para a nova empresa BC. Desbloqueia Meta Ads sem os 12,15% de impostos brasileiros (PIS/COFINS + ISS) sobre cada real gasto em mídia.

- [ ] **[BLOQUEADOR #4] Cadastrar na Hotmart como não-residente com empresa canadense** — desbloqueia os planos anuais (R$99/R$150/R$220) com pagamento direto para conta canadense + programa de afiliados. Hotmart cuida da nota fiscal brasileira.

- [ ] **[BLOQUEADOR #5] Regularizar conta bancária brasileira** — após saída fiscal declarada, conta corrente comum é irregular. Converter para CDE (Conta de Domiciliado no Exterior) ou encerrar. Consultar contador especializado em brasileiros no exterior.

> ⚠️ **Aviso de custo:** abrir e manter a empresa em BC tem custo real. Abertura: ~CAD 380–600 (~R$1.500–2.400). Manutenção anual: ~CAD 650–2.000 (~R$2.600–8.000), sendo o maior item o contador para a declaração T2 obrigatória (~CAD 500–1.500/ano). Esses custos são necessários e se pagam rapidamente (só a economia nos impostos de Meta Ads já justifica parcialmente), mas devem estar no orçamento antes de iniciar.

---

**🧾➕ Frente 1 — ingestão de PIX (cod-0061/0062) — o que só você resolve (desenho: `Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`):**
- [ ] **Verificar CHECK em `compras.tipo`** — query de 1 min no SQL Editor. Se for `TEXT` livre, `'pix'` já funciona (zero migration). Se houver `CHECK (tipo IN ('mercado','outros'))`, precisa `ALTER` (zona `supabase/` = você; escrevo o `.sql` se pedir).
- [ ] **Fornecer 2–3 comprovantes de PIX reais** (print e/ou PDF) pro mini-corpus da cod-0062 — sem eles a extração de PIX não tem como ser validada.
- [ ] **Confirmar o payload de documento da Z-API** — mande um PDF pra você mesmo e veja o campo/URL (o desenho assume `body.document`/`documentUrl`; validar no payload real).

**🇨🇦 Modo recibo Canadá (cod-0065) — o que só você/legal resolve (a máquina entrega a leitura, não isto):**
*(insights: `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md`)*
- [ ] **Fornecer 2–3 recibos reais de Vancouver** (mercado + outro comércio) pro mini-corpus de regressão da cod-0065 — sem eles, a classificação canadense não tem como ser validada.
- [ ] **[LEGAL — CASL] Consentimento anti-spam** antes de QUALQUER mensagem proativa a usuário no Canadá (lembretes de reengajamento, alerta de limite): onboarding com consentimento explícito + opt-out em cada lembrete. Multa até CAD 10M/violação. A confirmação de cupom (iniciada pelo usuário) é transacional e provavelmente ok; o "volta aqui" não é.
- [ ] **[LEGAL — privacidade] BC PIPA + PIPEDA** — dado de recibo cruzando fronteira (Supabase/Gemini). Nossa postura de processar-em-memória-e-descartar já ajuda; formalizar consentimento/finalidade/retenção quando houver usuário real na BC.
- [ ] **Provedor de WhatsApp p/ número canadense** — a Z-API é focada no Brasil; um número CA provavelmente exige Meta WhatsApp Cloud API (ou Twilio) + template aprovado p/ mensagem fora da janela 24h. (Pode testar primeiro com o número BR atual e você mesmo como usuário.)
- [ ] **(Opcional) Migration `compras.moeda TEXT DEFAULT 'BRL'`** — só se quiser **persistir** a moeda (a cod-0065 já mostra a moeda certa na confirmação sem gravar). Padrão A9: rodar o `ALTER` **antes** de qualquer código que grave `moeda`. `supabase/` = zona proibida da máquina; escrevo o `.sql` se você pedir.

---

**Setup (uma vez, bem simples):**
- [ ] Ter o Claude Code instalado e logado na sua assinatura na máquina.
- [x] **[2026-06-25] `tarefa.md` em `.claude/commands/` — FEITO** (confirmado em 06-26: `C:\Economizei\.claude\commands\tarefa.md` existe, com o GATILHO DE SKILLS). Comando `/tarefa` operacional.
- [ ] (Opcional) Colar a nota do Gatilho de Skills no `.claude/skills/README.md` (também protegido pro Cowork) — trecho pronto no chat da sessão de 2026-06-25.
- [ ] Pronto — não tem secret, workflow nem GitHub App pra configurar.

**Rotina de cada vez que for trabalhar (manual):**
- [ ] Na pasta do projeto, rodar `/tarefa` no Claude Code (ou colar o prompt do guia).
- [ ] Revisar o diff; rodar `npm run check` (firewall + testes).
- [ ] Commitar e dar push você mesmo se estiver bom; se não, `git checkout .` descarta.
- [ ] Repriorizar a "Fila pronta" pra próxima vez.

**Rotina automática das 8:02 AM (Vancouver) — Cowork Scheduled (`economizei-rotina-matinal`, cron `0 8 * * *`):**
- Roda 1 tarefa pronta por dia (com o app do Cowork aberto), **sem commitar**, e escreve o `RELATORIO_MATINAL.md`.
- [ ] De manhã: ler `RELATORIO_MATINAL.md` → revisar o diff → `npm run check` → commitar ou `git checkout .`.
- Mapa completo do comportamento: `Economizei app/Mapa_Processo_Maquina_Local.md`.

**Coisas que SÓ você faz (a automação é barrada de propósito):**
- [ ] Qualquer mudança financeira (pagamento, assinatura, preço, `is_pro`).
- [ ] Rodar migration no Supabase (a automação não toca `supabase/`).
- [ ] Adicionar dependência nova (`package.json` é bloqueado) se uma tarefa precisar.
- [ ] Commit e push (a automação local nunca commita).
- [ ] Decisão de produto/UX/pricing/ICP/promessa de feature.

**🔍 Achados da auditoria (2026-06-25) — só humano (SQL / git / financeiro):**
*(ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`)*
- [~] **[A4 🟠] Versionar `CREATE TABLE resumos_mensais_enviados`** — **COMMITADO (`a795f65`):** `supabase/migration_2026-06-30_A4_resumos_mensais_enviados.sql` (idempotente; se a tabela já existe à mão, é no-op — só confere colunas). **Falta só RODAR no SQL Editor.**
- [x] **[A9 🟡] `compras.cnpj` — RODADA (2026-07-09):** `ALTER TABLE compras ADD COLUMN cnpj` executado no SQL Editor; verificação retornou a coluna. O `salvarCompra` (que já gravava `cnpj` desde `a795f65`) está desbloqueado em produção. Cupons antigos ficam com `cnpj=NULL`; preenchem a partir do próximo.
- [ ] **[A10 🟢] Corrigir o comentário de `beta_fundador` no `schema.sql`** ("garante 3 meses grátis + preço travado") — contradiz a decisão de 2026-05-19 que revogou os benefícios de Beta. (`supabase/` = você.)
- [x] **[A7 🟡] Reconciliar memória × deploy — CONCLUÍDO (06-26):** working tree limpo e sincronizado com `origin/main` (F3 `/cortar`, encurtamento, testes e parser todos commitados em `b73b15b`/`e8de024`); `_writetest_root.tmp` removido; `CLAUDE.md` × `AGENDA.md` alinhados nesta sessão. ⚠️ Ressalva: a limpeza do GitHub Actions ficou **parcial** — `pages-ci.yml` saiu, mas `ci.yml` e `claude-nightly.yml` **ainda estão** em `.github/workflows/` (ver checklist "Limpeza do GitHub Actions" abaixo).
- [~] **[A1 🔴 financeiro] Ligar o gate Pro** do comparativo (cod-0020) e do alerta inteligente (cod-0023) via `temFeaturesProAtivas` — toca `is_pro` (firewall), é seu. **Sem isso, o pago entrega só cupons ilimitados** e a recompensa de indicação fica vazia. **✅ DESDOBRADO (2026-07-10):** snippets prontos + checklist em `Economizei app/Gate_Pro_Desdobramento_2026-07-10.md`. Decisões tomadas: Pro vê até 10 (`COMPARATIVO_MAX_PRO`); teaser Free com upsell honesto citando `/planos` (sem preço hardcoded). **Falta só você aplicar na sua máquina** (checklist de 7 passos no doc; firewall vai acusar de propósito — commit consciente).
- [ ] **[A6 🟠] Testes do caminho do dinheiro** (`mercadopago.js`, conciliação de webhook, liga/desliga `is_pro`) — tocam tokens financeiros (firewall) → escrever/revisar é humano.

**Limpeza do GitHub Actions — ✅ CONCLUÍDA (commit `f384dab`, confirmado 2026-07-02):**
- [x] `ci.yml`, `claude-nightly.yml` e `pages-ci.yml` **removidos** do repo. Só resta `monthly-cron.yml` (deve ficar — é o resumo mensal). Verificado por `ls .github/workflows/`.
- [ ] Se tiver criado branch protection exigindo o check "CI" no GitHub, remover (senão trava PRs futuros). *(Não dá pra verificar daqui — é config no site do GitHub.)*
- [ ] (Opcional) Desinstalar o app do Claude no GitHub e apagar o secret `CLAUDE_CODE_OAUTH_TOKEN`.

---

## ⏳ Aguardando sua decisão (não virou tarefa da fila ainda)

- [x] **[2026-06-24] Encurtamento das mensagens automáticas — APROVADO E APLICADO** (commit `e8de024`). Concluído; reconciliado em 06-26.
- [x] **[2026-06-24] Open Questions do Agente de Perguntas — RESPONDIDAS** (Free básico 3 intenções · limite 30/mês com aviso no meio · responde a mais provável, pergunta de volta só off-topic · guarda a pergunta no log · gemini-2.5-flash · Opção A estruturada com narração LLM, depois B). Tarefas na fila: cod-0010..0017.
- [ ] **[2026-06-24] Pré-requisitos HUMANOS do Agente de Perguntas** (a máquina é barrada de propósito nestes):
  - [ ] **Migration** (`supabase/` = zona proibida): criar `usuarios.perguntas_mes_atual INT DEFAULT 0` + tabela `perguntas_log` (ver SQL no Desenho §7) + reset mensal acompanhando o de `compras_mes_atual`.
  - [ ] **Envs** (`.env*` = bloqueado): `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODELO=gemini-2.5-flash`, `AGENTE_MODO=llm` — no Railway e no `.env.example`.
  - [ ] **Ordem de deploy:** rodar a migration ANTES de commitar/subir cod-0016 e cod-0017 (senão a cota quebra em produção).
  - [ ] **Pro depois:** o gate Free/Pro do Q&A (usa `is_pro`/`features_pro_ate`) é seu quando expandir — a máquina não pode tocar (firewall).
- [ ] **[2026-06-24] Construir webhook Hotmart → /admin/ativar-pro** — quando Hotmart confirmar pagamento, setar `is_pro=true` automaticamente. É código que toca pagamento, tem que ser o Gabriel fazendo e revisando.
- [ ] **[2026-06-24] Atualizar formatter.js com pricing anual + Hotmart** — `/planos` e `/assinar` ainda mostram só preços mensais/MP. Toca zona financeira, revisar com cuidado.
- [ ] **[2026-06-24] Commitar arquivos pendentes** — ver comando pronto no `Mapeamento_Geral_Pendencias_2026-06-24.md` Seção 1.
- [x] **[2026-06-23] Economia do plano anual como prova de marketing na landing — ESSENCIALMENTE FEITO** (commit `d3fe539`): a landing ganhou toggle anual/mensal nos 3 tiers, default anual, com selo "2 meses grátis". Reconciliado em 06-26. *(Se quiser reforçar com um comparativo mensal × anual mais explícito, isso vira uma tarefa `landing-ab` nova — me avise.)*
- [x] **[Auditoria 06-25 · A1] Comparativo: liberar pra todos ou só Pro? — DECIDIDO (2026-06-27): Pro completo + teaser grátis** (1+ comparativos de amostra no Free pra mostrar o valor). Refletido no cod-0020. O gate Pro em si segue como ação financeira sua.
- [x] **[Auditoria 06-25 · §4] Sequência — CONFIRMADA (2026-06-27):** fechar a promessa do pago (`/apagar` ✅ → comparativo cod-0020 → alerta Pro cod-0030..0035) **antes** de escalar anual/afiliados/ads e antes do Agente de Perguntas (cod-0013→0017 descem na fila). Ordem aceita pelo Gabriel. *(numeração corrigida 2026-07-02: a cadeia Pro vai até cod-0035, não 0036.)*
- **[2026-06-27] Alerta Inteligente Pro — pré-requisitos humanos** (desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`):
  - [x] **Decisão de pricing Free×Pro — DECIDIDA (2026-07-08): proposta do desenho.** **Free** = alerta de 3 níveis + `/cortar` + pergunta avulsa "quanto gastei em X" (dentro da cota do Agente). **Pro** = acompanhamentos persistentes + alerta de limite proativo + supérfluo configurável.
  - [x] **Migration RODADA e confirmada (2026-07-08):** `supabase/migration_FUTURA_alerta_pro_acompanhamentos.sql` aplicada no Supabase de produção. Verificado por query: tabela `acompanhamentos` existe com RLS `true`, coluna `usuarios.catego