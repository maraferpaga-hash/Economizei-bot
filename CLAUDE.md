# 🧠 Memória Institucional — Economizei

> **🛠️ Sistema de skills ativo:** veja `C:\Economizei\.claude\skills\README.md` (índice das 18 skills + 10 regras de ouro).
> **🚀 Instruções do projeto:** veja `C:\Economizei\PROJECT_INSTRUCTIONS.md` (boot sequence + comportamentos default).
> **💻 Memória técnica de código:** veja `C:\Economizei\CODE_GUIDE.md` (stack, padrões, decisões técnicas em vigor). Ler quando a sessão envolver código.
> **🤖 Máquina Noturna & Agenda:** veja `C:\Economizei\AGENDA.md` (fila da automação noturna — agora foco em **mudanças de código**, com o **financeiro blindado** por trava automática — + painel de ações do Gabriel). Guia do sistema em `Economizei app/Automacao_Maquina_Noturna.md`; passo a passo com ícones em `Economizei app/Passo_a_Passo_Maquina_Noturna.md`. Em toda sessão, ofereça puxar o estado da agenda (o que está em revisão, o que está pronto pra próxima noite, pendências humanas).
> Leia os 4 no início de cada sessão, junto com este arquivo.

> Este arquivo é o **cérebro da empresa**. Leia-o no início de cada sessão para ter contexto completo
> sobre o produto, a estratégia e o estado atual da operação.
> Atualize-o sempre que houver decisões importantes, mudanças de direção ou novos aprendizados.

---

## 1. 🏢 Identidade da Empresa

**Nome:** Economizei
**Categoria:** SaaS / B2C
**Estágio:** Pré-lançamento — produto funcional (MVP testado uma vez sem escala), em fase de validação comercial
**Operação:** 1 pessoa (fundador, Gabriel), com vasto conhecimento em administração
**Restrição operacional:** ~12h/semana (média 10–14h, ver seção 6)
**Praça inicial de lançamento:** Fernandópolis-SP e região (interior noroeste de SP) — ver seção 7.1
**Última atualização:** 2026-06-23 (**Máquina Noturna virou engenheiro de CÓDIGO + firewall financeiro** — o Gabriel decidiu que a função principal da automação noturna passa a ser **mudança de código** (funções novas, refino, bugfix), não mais páginas estáticas, **com a condição de blindar o financeiro com certeza**. Como instrução de prompt o modelo pode ignorar, a trava virou **código enforçável**: `scripts/check-firewall.mjs` roda no **CI** e **reprova o PR** se o diff tocar dinheiro — **denylist de caminho** (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, o próprio firewall) **+ scan de conteúdo** nas linhas adicionadas (`mercadopago`, `is_pro`, `assinatura`, `preapproval`, `MP_`, `pix`, `checkout`, `paywall`, `ativar-pro`, `montarMensagemPlanos`…). Com **branch protection** exigindo o check **"CI"**, PR financeiro fica **não-mergeável** (garantia mais forte possível; a máquina nem tenta contornar). Rede de segurança de código nova: workflow **`ci.yml`** roda firewall → `node --check` → `node --test` → `check-pages`; baseline `test/insights.test.js` (5 testes verdes); **TDD obrigatório**. `claude-nightly.yml` reescrito pra código com **zona proibida** explícita + `--max-turns 40`. `AGENDA.md` repropostas: taxonomia `feature-codigo`/`refino-codigo`/`bugfix`/`teste` (+ páginas), bloco **🚫 Zona proibida (financeiro)**, 3 tarefas-semente (cod-0001 F3 "onde cortar", cod-0002 afrouxar heurística de canônico, cod-0003 testes do alerta). Doc novo: `Economizei app/Passo_a_Passo_Maquina_Noturna.md` (ícones 👤/🤖/⚙️/🚫). `pages-ci.yml` deprecado (dobrado no `ci.yml`; remoção pelo Cowork bloqueada — apagar no PC). **Validado no sandbox:** firewall selftest 16/16; 4 cenários git (limpo passa / `is_pro` bloqueia / `package.json` bloqueia / `supabase/` bloqueia); 5 testes verdes; sintaxe ok; check-pages verde. **Ativação (HUMANO):** `git push`, `/install-github-app`, branch protection exigindo **"CI"**, testar 1× via *Run workflow*. Sessão anterior do dia: **Plano ANUAL vira a oferta-destaque comercial** — pra elevar o **ticket médio (ARPU)** e trazer **caixa adiantado** que faça o investimento em aquisição (~R$200; custo por ativação estimado R$30–54) fechar a conta. Estrutura: anual pros **3 tiers pagos** com **~2 meses grátis** — **Individual R$99/ano**, **Família R$150/ano**, **Família+ R$220/ano** — pago via **PIX ou cartão (MP recorrente)**. O **mensal continua** como entrada de baixo atrito (não quebra o "zero atrito"); o anual é o destaque. **Meta:** ~80% dos pagantes no anual — registrada como **estrela-guia, não premissa de lançamento**. Racional: anual recupera o CAC na hora, trava o LTV e mata o churn por esquecimento de renovação (mesma dor da assinatura recorrente de 06-07). **Caveats honestos do `financial-firewall` (registrados na Seção 3):** (1) R$99 à vista é pedido bem maior que R$9,90/mês — vender anual a frio pra quem nunca mandou cupom tende a falhar; caminho realista é free → viver o valor → upsell anual; (2) anual **amplifica, não conserta** — receber o ano adiantado NÃO muda a regra de só escalar aquisição após **W2 ≥ 30%** no cohort de Fernandópolis; (3) não deixar "já recebi o ano" virar desculpa pra gastar antes da retenção provar; (4) honrar reembolso proporcional com elegância. Pricing R$99 (não R$100) fecha a narrativa "pague 10, leve 12". **Pendências de implementação (HUMANO/código):** criar planos anuais no MP, expor ciclo anual no `/planos` e `/assinar` (`formatter.js`/checkout), refletir anual no bloco de pricing da `landing/index.html`. Ideia parada em fila de decisão na `AGENDA.md`: usar a economia do anual como prova de marketing na landing. Sessão anterior do dia: **Máquina Noturna** montada — automação autônoma de **páginas** via GitHub Actions: cron **05h BRT** (08:00 UTC) roda o **Claude Code headless no Sonnet 4.6**, lê a `AGENDA.md` + `CLAUDE.md`, pega a tarefa priorizada, gera a página numa branch e abre **PR em rascunho**. Modelo de **2 cadeiras**: planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na agenda) → execução no **Sonnet** (run noturna, sozinha, nunca decide produto). Foco inicial: **landing A/B + conteúdo/SEO**; a máquina mexe **só** em `landing/` e `docs/` (nunca `src/`/pagamentos/Supabase — guarda-rail do `financial-firewall`). Rede de segurança: branch+PR (backup/restore) → **CI leve** `scripts/check-pages.mjs` (valida HTML/links, já verde nas páginas atuais) → **branch protection** na `main` → modo **rascunho** nas 1ªs semanas + `--max-turns`. Arquivos novos: `AGENDA.md` (fila viva + protocolo + painel "Ações do Gabriel"), `.github/workflows/claude-nightly.yml`, `.github/workflows/pages-ci.yml`, `scripts/check-pages.mjs`, `npm run validate:pages`, guia `Economizei app/Automacao_Maquina_Noturna.md`. **Pendências de ativação (HUMANO):** `git push`; `/install-github-app` (cria secret `ANTHROPIC_API_KEY`); branch protection exigindo o check "CI Páginas"; (opcional) Vercel Preview; testar 1× via *Run workflow*. 1ª tarefa da fila (`pag-0001`) ajusta o `vercel.json` pra páginas novas serem alcançáveis (hoje o catch-all joga tudo pro index). Sessão anterior do dia: documento de **Tráfego Pago & Criação de Páginas** criado — automação autônoma de **páginas** via GitHub Actions: cron **05h BRT** (08:00 UTC) roda o **Claude Code headless no Sonnet 4.6**, lê a `AGENDA.md` + `CLAUDE.md`, pega a tarefa priorizada, gera a página numa branch e abre **PR em rascunho**. Modelo de **2 cadeiras**: planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na agenda) → execução no **Sonnet** (run noturna, sozinha, nunca decide produto). Foco inicial: **landing A/B + conteúdo/SEO**; a máquina mexe **só** em `landing/` e `docs/` (nunca `src/`/pagamentos/Supabase — guarda-rail do `financial-firewall`). Rede de segurança: branch+PR (backup/restore) → **CI leve** `scripts/check-pages.mjs` (valida HTML/links, já verde nas páginas atuais) → **branch protection** na `main` → modo **rascunho** nas 1ªs semanas + `--max-turns`. Arquivos novos: `AGENDA.md` (fila viva + protocolo + painel "Ações do Gabriel"), `.github/workflows/claude-nightly.yml`, `.github/workflows/pages-ci.yml`, `scripts/check-pages.mjs`, `npm run validate:pages`, guia `Economizei app/Automacao_Maquina_Noturna.md`. **Pendências de ativação (HUMANO):** `git push`; `/install-github-app` (cria secret `ANTHROPIC_API_KEY`); branch protection exigindo o check "CI Páginas"; (opcional) Vercel Preview; testar 1× via *Run workflow*. 1ª tarefa da fila (`pag-0001`) ajusta o `vercel.json` pra páginas novas serem alcançáveis (hoje o catch-all joga tudo pro index). Sessão anterior do dia: documento de **Tráfego Pago & Criação de Páginas** criado — `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md`: como o Economizei entra na mídia paga "engatinhando" com ~R$200 escalável, mirando **cadastros grátis**. Reframe central: o playbook de "tráfego pago/vender na página" é de e-commerce/dropshipping; aqui a conversão é **cadastro grátis no WhatsApp**, métrica-rainha = **custo por ativação (1º cupom)**, não ROAS de loja. Recomendação honesta: **Meta Ads clique-pro-WhatsApp (CTWA)** é o carro-chefe, não o Google (não há demanda de busca a capturar); com R$200 **concentrar verba** (Meta primeiro, Google depois) porque dividir nos dois mata o aprendizado de ambos (mínimo Meta ~R$30–50/dia/campanha). Ajuste do modelo mental de "duplicar campanhas": hoje duplicar conjuntos causa sobreposição de leilão — o certo é poucos ângulos, verba concentrada, escala vertical em degraus, teste A/B oficial. Atribuição quase-grátis reaproveitando a leitura de código no 1º contato do `/convidar`. Guarda-rail do `financial-firewall`: R$200 pra **aprender** o canal = ok; escalar só após W2 ≥ 30% no cohort de Fernandópolis. Entrega desta sessão = só estratégia (doc); construção de template clonável + subdomínio Vercel fica pra quando o Gabriel pedir. Sessão anterior 2026-06-18: 3 funções de inteligência construídas e ligadas — **F2 raio-X de categoria** (conclusão no `/gastos`), **F1 inflação pessoal por item** (comando `/inflacao`), **F4 quanto você já economizou** (comando `/economia` + linha no resumo mensal). Novo módulo `src/insights.js` (análise pura) + 3 queries em `supabase.js`; **sem migração** — só leem colunas existentes, deploy é `git push`. Primeira aplicação prática do catálogo de 06-09, na sequência recomendada F2→F1→F4. Sessão de 2026-06-09: documento de **Posicionamento & Norte Estratégico** criado — `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` + nova **seção 1.5** no CLAUDE.md: missão por inteiro — IA que dá ciência e inteligência sobre o gasto do brasileiro médio —, as **3 camadas de valor** (Ciência → Inteligência → Habilidade) e o **Teste de Norte** como filtro de toda decisão de produto/copy/roadmap. Na mesma data, pesquisa profunda de finanças pessoais → catálogo de 12 funções candidatas (Camadas 2/3) em `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md`. Skills: contagem padronizada e `economizei-strategic-review` instalada em `.claude/skills/`. Sessão anterior 2026-06-07: resolvidas as 2 ressalvas abertas: **idempotência por messageId** implementada no webhook — migration `migration_2026-06-07_idempotencia_messageid.sql`; e **backfill de dados antigos** — `supabase/backfill_2026-06-07_dados_antigos.sql` para reclassificar `tipo` de não-mercado antigos + completar `preco_total`. Pendências anteriores seguem: correção dos outputs `migration_2026-06-07_coerencia_outputs.sql`; assinatura MP migration + ativação; indicação `/convidar` migration 003)

> **📂 Arquitetura modular atual:**
> A modularização da memória institucional foi materializada via **sistema de skills** + **instruções de projeto**, não via quebra do CLAUDE.md em múltiplos `.md`.
> - `CLAUDE.md` (este arquivo) — estratégia, princípios, persona, pricing atual, stack atual, áreas reais, decisões em vigor, comandos recentes. Lido em toda sessão.
> - `.claude/skills/` — 18 skills (16 `economizei-*` + 2 legadas `copy-review`/`roadmap-deps`). Disparam automaticamente por gatilho. Índice e contagem oficial no README de skills.
> - `PROJECT_INSTRUCTIONS.md` — boot sequence + comportamentos default + ritual de fim de sessão.
> - `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria crítica externa, pontos abertos.
> - `Economizei app/Projecao_6_meses.md` — projeção 3 cenários + gatilhos semáforo.
> - `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` — conteúdo arquivado (decisões revogadas, sessões antigas consolidadas).
> - `AGENDA.md` — fila viva da Máquina Noturna + protocolo de execução + painel "Ações do Gabriel". Lido em toda sessão (boot list acima). Guia em `Economizei app/Automacao_Maquina_Noturna.md`.

### Missão
Ajudar brasileiros de classe B/C a gastar menos no supermercado, com zero esforço.

### Proposta de Valor
Bot de WhatsApp que analisa cupons fiscais via foto usando IA (Gemini 2.5). O usuário manda a foto, o bot classifica os gastos automaticamente — sem app, sem cadastro, sem fricção.

### Princípios Centrais

> **"Zero atrito é o produto."**
> Cada etapa que o usuário precise aprender é uma etapa a eliminar.
> O canal (WhatsApp) é o produto. A foto do cupom é o gesto mínimo possível.

> **"Bom, barato e útil — grátis funciona de verdade, pago é a versão melhor."** *(princípio do Gabriel)*
> Modelo Spotify, não freemium-trial. O free deve resolver a dor central; o pago é genuinamente melhor, nunca o grátis quebrado pra forçar upgrade. Capitalizar EM CIMA do produto, nunca pensando inverso.

---

## 1.5. 🧭 Posicionamento & Norte Estratégico *(definido 2026-06-09)*

> **📄 Documento completo:** `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` (missão por inteiro, 3 camadas de valor, Teste de Norte com exemplos, mapa das funções atuais). Esta seção é o resumo que se lê em toda sessão.

**Missão dita por inteiro:** *fazer o brasileiro médio entender o próprio gasto — e usar IA para trazer conhecimento, informação e inteligência a esse gasto.* Não somos um leitor de cupom; somos a **camada de inteligência** que transforma o gasto bruto da pessoa em entendimento, e o entendimento em habilidade financeira real (gastar melhor, economizar, ter mais valor sobre o próprio dinheiro). Isso dá nome e eixo oficial ao reframe "assistente de compras / inteligência sobre o gasto" discutido em 2026-05-19.

**O Norte (frase-bússola que decide discussão):**

> **"A cada interação, o usuário sai sabendo algo sobre o dinheiro dele que ele não sabia antes."**

Se uma feature, mensagem ou fluxo não passa mais ciência, clareza ou inteligência sobre o gasto, ele não pertence ao produto — por mais técnico ou bonito que seja. O norte responde **"para onde"**; os princípios (zero atrito, grátis funciona, frame brasileiro) respondem **"de que jeito"**. O norte não revoga nenhuma decisão da seção 8.

**As 3 camadas de valor (a escada — prefira sempre subir):**

1. **Ciência (saber):** o gasto vira informação organizada — leitura do cupom, categorização, `/gastos`, resumo mensal.
2. **Inteligência (entender):** a IA tira a conclusão que a pessoa não tiraria — alerta em 3 níveis, insight de categoria, comparativo entre mercados, alerta preditivo.
3. **Habilidade (agir melhor):** com ciência + inteligência, a pessoa gasta melhor e economiza de verdade. É o resultado que justifica o produto existir.

> Feature que para na Camada 1 (só mostra dado) tem valor limitado. O diferencial é puxar pra Camada 2 e 3. Em dúvida, construa o que **sobe a escada**.

**O Teste de Norte (filtro antes de construir feature / escrever copy / priorizar roadmap):**

Pergunta-mãe: **"Isso deixa o usuário com mais ciência ou inteligência sobre o gasto dele?"** Se não, pare e questione o esforço. Depois, as 4 sub-perguntas: (1) **Camada** — joga em qual? Sobe a escada? (2) **Atrito** — entrega sem pedir mais trabalho da pessoa? (3) **Quem faz** — é a IA fazendo o peso, ou empurra esforço pro usuário? (4) **Honestidade** — a inteligência prometida é real hoje? (passa pelo `financial-firewall`). Veredito: passa com folga → construir; passa raspando → só se barato ou repensar pra subir a escada; não passa → cortar/reformular.

---

## 2. 👥 Público-Alvo

**Persona principal:** Brasileiros Classe B/C, 25–55 anos

| Característica | Detalhe |
|----------------|---------|
| Comportamento de compra | Supermercados semanalmente, sensíveis ao preço |
| Relação com tecnologia | WhatsApp como app principal, baixa tolerância a atrito |
| Motivação | Saber para onde vai o dinheiro, economizar sem esforço, **ser esperto** |
| Dor | Gastam mais do que planejam e não sabem onde |
| Canal preferido | WhatsApp — já aberto, já confiável |

**NÃO é para:** early adopters tech, pessoas que querem planilhas complexas, usuários com alto letramento digital.

### Personas detalhadas (definidas em sessão 2026-05-08)

**Persona 1 — Carla, a Otimizadora (35–50 anos, classe B):** mora com marido + filhos, gasta R$1.000–1.500/mês. Já tentou planilha. Mensagem: "Economize sem virar contadora da casa".

**Persona 2 — Bruno, o Controlador (28–40 anos, classe B/C):** casal sem filhos, R$500–900/mês. Gatilho: ir com fome. Mensagem: "Saiba exatamente quanto gasta. Sem planilha, sem app".

**Persona 3 — Marina, a Filha Preocupada (25–40 anos, classe B):** já organizada, mãe/pai gasta descontroladamente, ela se preocupa. Plano-alvo: Família R$15. Mensagem: "Mostra pra sua mãe — você cuida, ela controla".

---

## 3. 💰 Modelo de Negócio (atualizado em 2026-06-23)

**Modelo:** Freemium real (modelo Spotify) + 3 tiers pagos — **TODOS ATIVOS desde o lançamento**. **A partir de 2026-06-23 o plano ANUAL é a oferta-destaque** (pague 10, leve 12 = ~2 meses grátis); o mensal continua existindo como entrada de baixo atrito. Pagamento via **PIX ou cartão** (MP recorrente); na fase atual a confirmação ainda é manual até o gatilho de automação (≥ 5 pagantes).

| Plano | Mensal | **Anual (2 meses grátis)** | Quem | Funções |
|---|---|---|---|---|
| **Grátis** | R$0 | — | 1 pessoa | Foto do cupom + análise imediata + resumo mensal automático + alerta básico (>20% acima da média) + `/historico` + `/apagar`. **Limite: 10 cupons/mês** (técnico, custo Gemini) |
| **Individual** | R$9,90/mês | **R$99/ano** (≈ R$8,25/mês · economiza R$19,80) | 1 pessoa | Tudo do Grátis + **cupons ilimitados** + **comparativo entre mercados** + **alerta inteligente** (preditivo, categorizado por tipo de item) |
| **Família** | R$15/mês | **R$150/ano** (≈ R$12,50/mês · economiza R$30) | até 3 pessoas | Tudo do Individual + **visão consolidada da família** + **comparação por membro** |
| **Família+** | R$22/mês | **R$220/ano** (≈ R$18,33/mês · economiza R$44) | até 5 pessoas | Igual ao Família + **2 vagas adicionais** (5 pessoas no total) |

> **Nota sobre o preço do Individual:** o Gabriel pediu "~R$100/ano". Fixado em **R$99** porque fecha exatamente a narrativa de marketing **"pague 10 mensalidades, leve 12"** (10 × R$9,90 = R$99) — número redondo de "2 meses grátis". Mesma lógica aplicada a todos os tiers.

**Por que o anual virou o norte comercial (2026-06-23):** elevar o **ticket médio (ARPU)** e trazer **caixa adiantado** pra que o investimento em aquisição (~R$200, custo por ativação estimado R$30–54) faça sentido. O anual (a) recupera o CAC na hora (R$99 entram já, em vez de pingar R$9,90), (b) trava o LTV e (c) mata o churn por esquecimento de renovação — a mesma dor que motivou a assinatura recorrente no cartão (06-07). **Meta:** que **~80% dos pagantes** estejam no anual. ⚠️ **80% é estrela-guia, não premissa de lançamento** — ver caveats abaixo.

**Lógica do limite de 10 cupons no free:** Gabriel paga por cada chamada do Gemini Vision. Limite é técnico (anti-abuso), não artificial. Cobre quem vai ao mercado 2-3x/semana com folga.

**Princípio mantido:** *"bom, barato e útil — grátis funciona de verdade, pago é genuinamente melhor"*. O free resolve a dor central (saber pra onde vai o dinheiro). O Pro entrega features que valem o preço: comparativo entre mercados, alerta preditivo, plano família. O anual não quebra o "zero atrito" porque o **mensal continua disponível** — quem não quer se comprometer entra mensal e migra depois.

**Caveats honestos do plano anual (financial-firewall):**
1. **Atrito vs. comprometimento.** R$99 à vista é um pedido MUITO maior que R$9,90/mês. Para um produto pré-lançamento sem retenção validada, esperar 80% no anual *no dia 1* é otimista. O caminho realista: free → a pessoa **vive o valor** por alguns meses → aí o upsell anual converte. Vender anual a frio pra quem nunca mandou um cupom tende a falhar.
2. **Anual amplifica, não conserta.** Receber um ano adiantado **não muda a regra** de só escalar aquisição depois de **W2 ≥ 30%** no cohort de Fernandópolis. O anual de-risca o CAC, mas só se vende anual pra quem reteve. Sequência certa: validar W2 → upsell anual pra quem ficou → aí escalar ads.
3. **Anti-padrão a evitar.** Não deixar "já recebi o ano adiantado" virar desculpa pra gastar os R$200+ antes da retenção provar que o motor segura.
4. **Reembolso.** Cobrar um ano de quem usou duas vezes e sumiu gera risco de reembolso/chargeback. Política: honrar reembolso proporcional com elegância — não embolsar ano de quem não usou.

**Fluxo de pagamento (fase atual):**
1. Usuário manda `/pro` ou `/planos` no bot → o bot **destaca o anual** (2 meses grátis) e oferece o mensal como alternativa
2. Paga via **PIX** (QR Code, chave do Gabriel) **ou cartão** (link de checkout recorrente do MP — ver decisão de 06-07)
3. PIX manual: usuário manda comprovante → Gabriel confirma e ativa `is_pro = true` (até 1h). Cartão MP: webhook liga/desliga `is_pro` sozinho
4. **Renovação:** anual = lembrete 1×/ano (muito menos atrito e menos churn que o mensal); mensal = lembrete no dia 25
5. **Pendência de implementação do anual:** criar os planos/links anuais no MP, expor o ciclo anual no `/planos` (`formatter.js`) e no checkout (`/assinar`), e refletir o anual no bloco de pricing da landing. Registrado nas pendências da sessão (Seção 11)

**Cohort de Beta (uso técnico apenas):** contas criadas durante os 60 primeiros dias recebem uma marca temporal no Supabase **puramente para análise de retenção comparada**. **Não há benefício comercial prometido a esse grupo:** sem 3 meses grátis, sem preço travado, sem desconto vitalício, sem acesso antecipado pago. **Decidido em 2026-05-19, reforçado em 2026-05-22** — subsidiar custo de Gemini sem unit economics validado é compromisso financeiro pesado demais.

**Métricas-chave a acompanhar:**
- MRR (Receita Recorrente Mensal) — começa a contar desde o lançamento (anual entra como MRR = valor/12)
- **Ticket médio / ARPU** (receita por pagante) — métrica que o plano anual existe pra elevar
- **% de pagantes no plano anual** — meta-norte de ~80% (estrela-guia, ver Seção 3)
- Pagantes (acumulado, novos por mês) por forma de pagamento (PIX × cartão) e por ciclo (mensal × anual)
- Taxa de conversão Free → Pro (novos pagantes / cadastros mês)
- Churn de pagantes (mês a mês) — esperado cair com mix anual maior
- LTV / CAC Ratio
- DAU / MAU (usuários ativos diários / mensais)
- Cupons analisados por usuário ativo
- **Retenção W2** (mandou cupom na semana 2) — métrica crítica de validação de hábito e **gatilho que libera escalar aquisição** (≥ 30%)

---

## 4. 🛠️ Stack Técnica

```
WhatsApp ← Z-API (webhook) → Express.js → Gemini 2.5 Vision → Supabase
```

| Componente | Tecnologia |
|------------|------------|
| Runtime | Node.js ≥ 18 |
| WhatsApp API | Z-API (instance + webhook) |
| IA / Visão | Google Gemini 2.5 Flash (análise de cupons) |
| Banco de dados | Supabase (PostgreSQL) |
| Servidor | Express.js |
| Infraestrutura | A definir (Railway / GCP recomendado) |

**Estado do código (auditoria 2026-05-08):** muito mais construído do que parecia. Já implementado:
- `src/index.js` — webhook Express + roteamento texto/imagem
- `src/gemini.js` — prompt + parser de cupom (JSON: loja, cnpj, data, total, itens[])
- `src/supabase.js` — 6 funções (upsert user, save purchase, history, avg spend, free tier check, increment monthly)
- `src/zapi.js` — send message + download image
- `src/formatter.js` — 5 templates de mensagens em português
- `src/alerts.js` — alerta se compra > 120% da média de 90 dias
- Tabelas Supabase: `usuarios` (phone_number PK, compras_mes_atual, is_pro), `compras`, `itens_compra`

**Variáveis de ambiente necessárias:**
- `GEMINI_API_KEY` — Google AI Studio
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` — Supabase
- `ZAPI_INSTANCE_ID` + `ZAPI_TOKEN` + `ZAPI_CLIENT_TOKEN` — Z-API
- `PORT` — porta do servidor (padrão: 3000)

**Endpoints ativos:**
- `GET /health` — healthcheck
- `POST /webhook` — recebe eventos do Z-API

**Decisão sobre Z-API vs Meta WhatsApp Cloud API (2026-05-08):**
Manter Z-API até atingir os gatilhos de migração. Migrar para Meta Cloud API só depois de:
1. CNPJ aprovado e Business Account verificado
2. 50-100 usuários ativos (quando custo do Z-API começa a importar)
3. Templates de alerta estabilizados (Meta exige template pré-aprovado pra mensagens fora da janela 24h)

A maior trade-off técnica: o **alerta proativo** seria mais restrito no Meta (precisa template aprovado por mensagem fora janela 24h). Z-API não tem essa restrição.

---

## 5. 🏛️ Áreas reais da empresa (3 áreas durante o Beta)

> **Por que só 3 áreas?** Com 1h/dia e 1 pessoa, manter 7 áreas no documento era teatro corporativo — rotinas que nunca rodaram. Esta seção foi cortada em 2026-05-19 (auditoria) para refletir o que de fato é executado e medido. As áreas suspensas estão registradas no fim desta seção para retomada futura.

### 🛠️ Produto (o bot rodando)
**O que é:** o bot em produção processando cupons reais, sem cair, sem custar mais do que o orçado.
**Rotinas reais:**
- Olhar logs do Railway / Supabase 1×/semana (sexta).
- Checar uptime do `/health` (UptimeRobot avisa por email se cair).
- Conferir custo do Gemini no Google Cloud Console 1×/semana.
**Indicador único (proposta, ver discussão pareada):** *uptime semanal ≥ 99%* **ou** *cupons processados / cupons enviados ≥ 90%*.

### 📣 Distribuição (landing + conteúdo + indicação)
**O que é:** tudo que traz gente nova pro bot. Landing, redes sociais, indicação boca-a-boca.
**Rotinas reais:**
- Landing analytics 1×/semana (Vercel Analytics ou GA4 grátis — instalar assim que possível).
- 3 posts/semana em uma rede social escolhida (TikTok recomendado).
- Conversa com 1 usuário ativo por semana (DM no WhatsApp ou áudio rápido).
**Framing cultural (mantido de 2026-05-08):** evocar "ser esperto / não dar mole / saber das coisas". Brasileiro classe B/C tem orgulho disso. NÃO é frame americano de "disciplina/budget".
**Indicador único (proposta, ver discussão pareada):** *novos cadastros únicos por semana* **ou** *taxa de retenção W2*.

### 💰 Caixa (custo do Gemini/Z-API + tempo seu)
**O que é:** o que sai do seu bolso pra esse projeto rodar — em dinheiro e em horas.
**Rotinas reais:**
- 1×/semana: somar custos do Gemini, Z-API, Vercel, domínio, qualquer ferramenta paga.
- 1×/semana: anotar horas reais trabalhadas (estimativa honesta).
- 1×/mês: atualizar planilha de unit economics.
**Indicador único (proposta, ver discussão pareada):** *custo total/mês em R$* (precisa ficar abaixo de teto que você define) **ou** *custo médio por usuário ativo*.

---

### 🛌 Áreas suspensas até saída do Beta
Estas áreas existem como conceito mas **não têm rotina executável durante o Beta**. Retomar quando: ≥ 50 usuários ativos consistentes **E** decisão de paywall tomada.

- **Customer Success estruturado** (NPS formal, tickets, prevenção de churn) — durante o Beta, suporte é informal no WhatsApp.
- **Financeiro/Contábil** (DRE, DAS, separação PJ/PF) — depende de CNPJ aprovado.
- **Jurídico/Compliance** (Termos, Privacy, INPI) — só Termos + Privacy básicos publicados; INPI fica para depois.
- **Vendas estruturadas / Funil de growth** — durante o Beta não há venda; só validação.
- **Operações documentadas (SOPs)** — só faz sentido com mais de 1 pessoa.

---

## 6. 👥 Time & Capacidade

> **Por que essa seção existe:** A partir de 2026-05-21 o Economizei deixou de ser hobby e passou a ser tratado como negócio profissional. Como negócio profissional, time e capacidade precisam estar explícitos — quem faz o quê, quanto custa, e quando faz sentido terceirizar. Esta seção complementa o documento de projeção (`Economizei app/Projecao_6_meses.md`) e é referência obrigatória pra qualquer decisão sobre contratar, automatizar ou priorizar.

### 6.1. Composição atual

| Pessoa | Função | Tempo dedicado | Custo de oportunidade |
|---|---|---|---|
| **Gabriel (fundador)** | Tudo: Produto, Engenharia, Marketing, CS, Finance, Estratégia | **~12h/semana** (média de 10–14) no Economizei + 40h/semana no trabalho principal | **R$65/h** (equivalente ao R$/h do trabalho principal) |

**Custo de oportunidade do tempo investido:**
- Por semana: R$780 (12h × R$65)
- Por mês: ~R$3.380 (12h × 4,33 sem × R$65)
- Em 6 meses: R$20.280
- Em 8 meses: R$26.520

> **Régua de retorno** (definida em sessão 2026-05-21): o MRR mensal precisa atingir **R$4.225/mês ou mais** (equivalente a 15h × 4,33 × R$65) para que o esforço se traduza em resultado mensal equivalente ou superior ao custo das horas. Cenários otimista/realista/pessimista detalhados em `Economizei app/Projecao_6_meses.md`.

### 6.2. Chapéus que o Gabriel veste hoje (e quanto consomem)

Distribuição estimada das 12h/semana entre funções. **Esta tabela existe para identificar gargalos e candidatos a terceirização**, não para virar burocracia.

| Chapéu (função) | Horas/sem | % do tempo | Atividades típicas |
|---|---|---|---|
| **Produto / Engenharia** | ~4h | 33% | Manter o bot rodando, ler logs, ajustar prompts, fix bugs, deploy |
| **Marketing / Distribuição** | ~3h | 25% | Conteúdo TikTok/Reels, copy de landing, conversas com usuários |
| **Customer Success (informal)** | ~1,5h | 13% | Responder dúvidas no WhatsApp, ler feedback, pequenas pesquisas |
| **Estratégia / Planejamento** | ~1,5h | 13% | Atualizar CLAUDE.md, revisar projeção, decidir gatilhos |
| **Finance / Administração** | ~1h | 8% | Custos, planilha de unit economics, CNPJ, fornecedores |
| **Operações / Imprevistos** | ~1h | 8% | Buffer pra coisa que aparece (suporte Z-API, ferramenta nova, etc.) |

**Observações:**
- Quando volume cresce, CS e Marketing tendem a comer Produto. Esse é gargalo previsível e deve ser endereçado com automação ou freela antes de virar problema.
- Estratégia abaixo de 1,5h/sem é perigoso: vira "andar por inércia". A revisão dos gatilhos da seção 8 da `Projecao_6_meses.md` é não-negociável.

### 6.3. Plano faseado de terceirização (freelas + automação)

Princípio registrado em 2026-05-21: **terceirizar não é necessariamente o mais barato, mas o que destrava o gargalo certo na hora certa**. Cada candidato a terceirização tem gatilho explícito — não se contrata por ansiedade, contrata-se por evidência.

#### Fase 1 — Beta (fase atual) — *Sem freelas, com automação leve*

Objetivo: validar o motor antes de gastar dinheiro com terceiros.

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Scheduler de resumo mensal automático | Automação interna | 0 (Gabriel codifica) | Quando pronto |
| Templates de resposta no Z-API | Automação interna | 0 | Quando pronto |
| UptimeRobot + alerta no email | Ferramenta grátis | R$0 | Assim que possível |
| GA4 ou Vercel Analytics | Ferramenta grátis | R$0 | Assim que possível |

#### Fase 2 — Pós-validação inicial — *Primeiros freelas pontuais*

Objetivo: liberar tempo do Gabriel pras decisões e produto. **Só ativar se o gatilho de validação (W2 ≥ 30%) ficar 🟢** (ver `Projecao_6_meses.md`).

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Freela de conteúdo (TikTok/Reels) — 4 vídeos/mês | Freelancer pontual | R$300–600/mês | W2 ≥ 30% |
| Designer pontual pra atualizar landing | Freelancer pontual | R$200–400 (one-shot) | Quando decidir mudar copy principal |
| Ferramenta de agendamento de posts (Buffer/Later) | SaaS | R$0–60/mês | Se conteúdo escalar |

#### Fase 3 — Escala inicial — *Freelas recorrentes condicionados*

Objetivo: tirar Gabriel de tarefas operacionais repetitivas. **Só ativar se MRR ≥ R$300**.

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Freela de CS no WhatsApp — 5h/semana | Freelancer recorrente | R$700–1.000/mês | MAU ≥ 250 |
| Editor de vídeo dedicado | Freelancer recorrente | R$800–1.500/mês | Se conteúdo for o motor principal |
| Contador (DAS, fiscal, DRE básico) | Recorrente | R$200–400/mês | CNPJ aprovado |
| Migração Z-API → Meta Cloud API | Projeto pontual | R$1.500–3.000 (one-shot) | ≥ 50–100 usuários ativos consistentes |

#### Fase 4 — Crescimento — *Estrutura mínima sustentável*

Só faz sentido se **MRR ≥ R$2.000** e trajetória clara de escala.

| Item | Tipo | Custo estimado |
|---|---|---|
| Tudo da Fase 3 + Designer recorrente | — | — |
| Possível 1ª contratação CLT/PJ part-time (PM ou Engenharia) | Recorrente | R$3.000–5.000/mês |
| Marketing manager part-time | Recorrente | R$2.500–4.000/mês |

### 6.4. Regra de ouro para decidir terceirizar

Antes de contratar qualquer freela, responder 3 perguntas:

1. **Esta tarefa é recorrente?** Se for one-shot, talvez não justifique freela — vale mais um esforço concentrado de fim de semana.
2. **Esta tarefa está bloqueando algo de maior valor?** Se você está gastando 5h/semana editando vídeo enquanto a retenção W2 não está medida, o gargalo não é o vídeo — é a instrumentação.
3. **O custo do freela cabe no orçamento ATUAL, sem contar com receita futura?** Princípio do Gabriel: não comprometer caixa antes de ter receita validada. Se não cabe, não contrata.

> **Anti-padrão:** contratar freela porque "precisamos crescer mais rápido" sem validar que o motor de retenção funciona. Isso é empurrar água em balde furado e queimar caixa.

### 6.5. Funções que NÃO terceirizar (em nenhuma fase)

| Função | Por que fica com o Gabriel |
|---|---|
| Estratégia / direção do produto | É o core do negócio. Quem não direciona, não tem produto. |
| Decisões sobre paywall, pricing, ICP | Decisões de longo prazo precisam estar com o dono |
| Conversas qualitativas com usuários ativos (1/sem) | Aprendizado bruto que nenhum CS pode substituir no início do projeto |
| Leitura semanal de logs + custos | Sinal de saúde do produto e do caixa |
| Atualização do CLAUDE.md | É a memória institucional; só o Gabriel sabe o contexto completo |

### 6.6. Métricas de saúde do time

Mesmo com 1 pessoa, há sinais de que a operação está saudável ou em sobrecarga.

| Sinal | 🟢 | 🟡 | 🔴 |
|---|---|---|---|
| Revisão de gatilho mensal feita | Sim, dentro do prazo | Atrasada 1 semana | Mais de 2 atrasos seguidos |
| Horas reais vs. planejadas | Dentro de ±20% | 20–40% acima | > 40% acima por 3 semanas |
| Atividade no CLAUDE.md | Pelo menos 1 entry/sessão | Sem updates há 2 semanas | Sem updates há 1 mês |
| Burnout subjetivo | Energia pra continuar | Cansaço pontual | Vontade de abandonar |

> Se 2 sinais ficarem amarelos por 2 semanas seguidas, tirar 1 final de semana inteiro do projeto e reavaliar. Sustentabilidade do operador é parte do unit economics.

---

## 7. 🗺️ Roadmap

### 7.1. 📍 Praça inicial — Fernandópolis-SP e região *(definido 2026-05-26)*

**Decisão:** as primeiras campanhas (orgânico + ads) serão concentradas em **Fernandópolis-SP** e cidades vizinhas do noroeste paulista (Estrela d'Oeste, Pedranópolis, Meridiano, Macedônia, Mira Estrela, Indiaporã, Votuporanga como cidade-hub regional). O Gabriel mora/tem rede em Fernandópolis, então o boca-a-boca, o vocabulário e a recomendação local saem com autenticidade.

**Por que faz sentido começar aí:**
- **Mercado real, não invisível.** Fernandópolis tem ~70 mil habitantes, potencial de consumo de **R$ 3,4 bilhões** (cresceu 5,8% em 2024). Classes B/C cresceram em **560 + 1.088 domicílios** entre 2023–2024 — exatamente o ICP do Economizei. *(Fonte: Cidadão.NET / IBGE)*
- **Salário médio formal R$ 2.600** (abaixo da média estadual de R$ 3.900) → dor de "pra onde foi o dinheiro" é mais aguda que na capital.
- **Densidade de boca-a-boca.** Cidade pequena = grupos de WhatsApp de bairro, status, grupo de família, igreja, academia. 1 viral local = 50 cadastros sem custo. *(Fonte: Salesforce, Agência Mestre, ExpoSupermercados)*
- **Custo baixo de ads geo-segmentados.** Meta Ads numa cidade do interior tem CPM e CPC muito mais baratos que SP capital ou Rio.
- **Validação social mais rápida.** Em 30 dias dá pra saber se 5 pessoas conversaram entre si sobre o produto. Na capital esse sinal demora 6 meses.

**Mercados-âncora da cidade** (referências culturais que o público reconhece — usar com parcimônia, ver nota abaixo):
- **Pessotto Supermercados** (Pessotto Max, Pessotto Flex, Pessotto da Cida) — rede local com várias lojas, presença forte.
- **Sakashita Supermercados** — Av. Primo Angelucci (Centro) e Av. Expedicionários Brasileiros.
- **Supermercado Souza / Rede Sol** — bairro Parque Nações, atende desde 1990.
- **Max Atacadista, Proença, Amigão, AmPm** — outras opções relevantes.
- **Atacadão / Assaí** — redes nacionais com presença regional (atacarejo).

> **Nota jurídica/editorial sobre citar mercados:** evitar citar nome de mercado em **tom negativo** (ex: "o Pessotto tá te roubando"). Quando o nome aparecer em roteiro, deve ser em **contexto neutro de hábito** ("fui no Sakashita comprar arroz") ou como **referência local positiva**. Idealmente, manter o nome do mercado como **slot variável** no roteiro (`[mercado local]`) e decidir caso a caso na hora de gravar. **Não publicar nada que implique parceria, endosso ou comparação direta entre os mercados sem autorização escrita.**

**Frame cultural do roteiro:**
- Sotaque/jeito do interior, não do paulistano. Use "cê", "ó", "olha aqui", "véi", "rapaz", "mano", "vó", "negócio", "trem". Sem inglês desnecessário.
- Referências de lugar: praça da matriz, rodoviária, av. Brasil (a principal), bairros conhecidos (Centro, Parque Nações, Santa Rita, Vila Regina).
- Referências culturais: peão (rodeio é forte na região), festa do peão, churrasco de domingo, "rancho" do mês (a compra grande), feirinha de sábado.
- **NÃO** usar: emojis tech, jargão de startup, gringuismo, "feature", "killer", "MVP", "stack".

**Canais ordenados por prioridade:**
1. **TikTok** orgânico geolocalizado (perfil novo posta direto da cidade) + **Reels Instagram** com o mesmo corte.
2. **WhatsApp** — divulgação em grupos próximos (família, faculdade, vizinhança, igreja, academia, trabalho). Pedir indicação direta de 5 pessoas.
3. **Meta Ads geo-segmentado** — raio de 30km de Fernandópolis, R$ 50–100 de teste.
4. **Boca-a-boca offline** — Gabriel já tem rede física na cidade, dá pra mostrar o bot pessoalmente em conversas casuais.

**O que mede sucesso de campanha local (90 dias):**
- ≥ 100 cadastros únicos vindos de Fernandópolis (cruzar DDD 17 ou pergunta no onboarding "de onde você é?")
- ≥ 30% de retenção W2 nesse cohort local (métrica crítica de hábito)
- ≥ 3 indicações orgânicas registradas (alguém indica alguém)
- ≥ 1 vídeo passa de 5k views na conta TikTok

**Expansão depois:** se Fernandópolis validar, expansão natural é para cidades de porte similar no noroeste paulista (Votuporanga ~95 mil hab, Jales ~50 mil, São José do Rio Preto como salto regional ~480 mil hab). NÃO pular pra SP capital antes de validar a praça inicial.

---

### Roadmap Tático de Lançamento (definido 2026-05-08)
*Detalhamento completo no PDF/HTML em `Economizei app/Economizei_Roadmap_6_Semanas.html` e no plano em `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`. Blocos de trabalho em ordem sugerida de execução — sem prazo numerado.*

- **Hardening + Definição do Free:** subir limite de 3 → 10 cupons; criar `.env.example`; coluna `beta_fundador`; rate limit; reescrever boas-vindas; onboarding em 4 mensagens.
- **Landing + Pricing visível:** domínio + landing com A/B test de headline; bloco de pricing 4 planos (Grátis ativo, demais "em breve"); waitlist no Supabase; auto-resposta WhatsApp.
- **Privacidade + Conteúdo:** página "Como tratamos seus dados"; política de privacidade; 3 vídeos Reels/TikTok; 1 carrossel Instagram.
- **Polir Free + Scheduler:** scheduler de resumo mensal automático; tratar cupons borrados/farmácia/sem itens; comando `/limite`; teste end-to-end.
- **Beta Soft + Indicação:** lançar para grupos próximos; comando `/indicar`; tabela `indicacoes`; Meta Ads R$50–100; coletar NPS.
- **Iteração + Teste de Pricing:** A/B de preço em 3 grupos (R$4,90 / R$9,90+R$15 família / pague o que quiser); decidir paywall.

**Cortável se necessário:** o bloco "Polir Free + Scheduler" (resumo mensal pode ser manual no início). Cortar qualquer outra compromete a campanha.

### Roadmap Macro

#### Fundação Legal & Financeira
- [ ] Abrir CNPJ / ME
- [ ] Abrir conta PJ separada
- [ ] Publicar Termos de Serviço + Privacy Policy
- [ ] Integrar Stripe ou Mercado Pago para cobranças (só ativar após validação)

#### Primeiros Usuários & Marca
- [ ] Criar perfil no TikTok e Instagram
- [ ] Publicar os 10 primeiros conteúdos
- [ ] Meta: 100 usuários freemium
- [ ] Ativar pesquisa de NPS inicial

#### Monetização & Growth
- [ ] Lançar plano pago (estrutura definida pelo teste de pricing)
- [ ] Teste A/B de preço e posicionamento
- [ ] Meta: 10 usuários pagantes (primeiro MRR)
- [ ] Primeira análise de LTV/CAC

#### Produto & Escala
- [ ] Migrar Z-API → Meta WhatsApp Cloud API (após CNPJ + escala)
- [ ] Iterar produto com base em feedbacks reais
- [ ] Parcerias com influencers de economia doméstica
- [ ] Avaliar contratar CS freelancer se NPS < 40
- [ ] Revisão estratégica trimestral

---

## 8. 📋 Decisões Tomadas

| Data | Decisão | Racional |
|------|----------|----------|
| 2026-06-23 | **Máquina Noturna repropósita pra CÓDIGO + firewall financeiro enforçável (a máquina mexe no código do bot, NUNCA no dinheiro)** | Evolução da decisão de "Máquina Noturna (páginas)" do mesmo dia: o Gabriel decidiu que a **função principal** da automação passa a ser **mudança de código** — desenvolver funções novas, refinar e corrigir o código —, **com a exigência de blindar o financeiro com toda a certeza**. Reconhecido o salto de risco (mexer em `src/` é muito mais perigoso que página estática; o doc de referência e a skill `economizei-financial-firewall` desaconselham código autônomo sem testes). Solução: a blindagem deixou de ser só instrução (que o modelo pode ignorar) e virou **trava de código** — `scripts/check-firewall.mjs` roda no **CI** e **reprova o PR** por **denylist de caminho** (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile`, o próprio firewall) **+ scan das linhas adicionadas** (`mercadopago`, `is_pro`, `assinatura`, `preapproval`, `MP_`, `pix`, `checkout`, `paywall`, `ativar-pro`, `montarMensagemPlanos`, `features_pro_ate`…). Com **branch protection** exigindo o check **"CI"**, PR que toque dinheiro fica **não-mergeável** — a garantia mais forte possível neste setup; a máquina é instruída a nem tentar contornar. Rede de segurança de código (o projeto não tinha testes): `ci.yml` roda **firewall → `node --check` (sintaxe) → `node --test` (testes) → `check-pages`**; baseline `test/insights.test.js` (5 testes verdes) + **TDD obrigatório** no prompt (toda lógica nova vem com teste). `claude-nightly.yml` reescrito (escopo permitido/proibido explícito, `--max-turns 40`). `AGENDA.md` repropostas: novo `tipo` (`feature-codigo`/`refino-codigo`/`bugfix`/`teste`, + páginas em 2º plano), bloco **🚫 Zona proibida (financeiro)**, e tarefas-semente de código (cod-0001 F3 "onde cortar sem doer"; cod-0002 afrouxar a heurística `avaliarQualidadeCanonicoItem`; cod-0003 testes do alerta 3 níveis). Entregue também o doc pedido: **`Economizei app/Passo_a_Passo_Maquina_Noturna.md`** (passo a passo com ícones 👤 você / 🤖 máquina / ⚙️ configurar-colocar / 🚫 proibido + tabela quem-faz-o-quê). `pages-ci.yml` ficou deprecado (CI agora é único em `ci.yml`; remoção via Cowork bloqueada — Gabriel apaga no PC). **Validação no sandbox:** firewall selftest 16/16; 4 cenários git reais (limpo passa / `is_pro` escondido bloqueia / `package.json` bloqueia / `supabase/` bloqueia); 5 testes verdes; `node --check` ok; check-pages verde. **Pendências de ativação (HUMANO):** `git push`; `/install-github-app`; branch protection exigindo **"CI"**; testar 1× via *Run workflow*. **Honestidade registrada:** código autônomo é mais arriscado que página — o firewall + testes + draft PR + revisão de manhã são o que tornam isso aceitável; sem disciplina de revisão, não soltar. |
| 2026-06-23 | **Plano ANUAL vira a oferta-destaque comercial — 3 tiers com ~2 meses grátis (Individual R$99 / Família R$150 / Família+ R$220 ao ano), via PIX ou cartão; meta ~80% dos pagantes no anual** | Gabriel quer **aumentar o ticket médio** e trazer **caixa adiantado** pra que o investimento em aquisição (~R$200; custo por ativação estimado R$30–54) feche a conta — "um investimento que faça mais sentido". Nas perguntas de clarificação definiu: anual pros **3 planos pagos** (não só o Individual) e **mensal continua** como entrada, com o **anual de destaque** (não anual-exclusivo). Estrutura: pague 10 mensalidades, leve 12 → **Individual R$99/ano** (≈R$8,25/mês), **Família R$150/ano**, **Família+ R$220/ano**, todos via **PIX ou cartão (MP recorrente)**. R$99 (não os R$100 que ele citou) fecha a narrativa "pague 10, leve 12". Racional: o anual recupera o CAC na hora, trava o LTV e mata o churn por esquecimento de renovação (mesma dor que motivou a assinatura recorrente no cartão em 06-07). Não fere "zero atrito" porque o mensal segue disponível. **Caveats honestos registrados (financial-firewall, alguns contra o pedido):** (1) **80% no anual é estrela-guia, não premissa de lançamento** — R$99 à vista é pedido bem maior que R$9,90/mês; vender anual a frio pra quem nunca mandou cupom tende a falhar, o caminho realista é free → viver o valor → upsell anual; (2) anual **amplifica, não conserta** — receber o ano adiantado NÃO muda a regra de só escalar aquisição após **W2 ≥ 30%** no cohort de Fernandópolis; (3) anti-padrão: não deixar "já recebi o ano" virar desculpa pra gastar antes da retenção provar; (4) honrar **reembolso proporcional** com elegância. Métricas novas: **ticket médio/ARPU** e **% de pagantes no anual**. **Pendências de implementação (HUMANO/código, não feitas nesta sessão):** criar planos anuais no painel MP; expor o ciclo anual no `/planos` e `/assinar` (`formatter.js`/checkout); refletir o anual no bloco de pricing da `landing/index.html`. **Em fila de decisão (AGENDA.md):** usar a economia do anual como prova de marketing na landing. |
| 2026-06-23 | **Máquina Noturna montada — automação autônoma de páginas (Opus planeja / Sonnet executa às 5h, PR-first)** | Gabriel quis "uma máquina que trabalha sozinha em se aprimorar conforme a direção dada por ele", girando em torno de uma **agenda** que ele prioriza junto com o Opus 4.8, mas com a execução rodando no **Sonnet**. Definido nas perguntas de clarificação: foco inicial **landing A/B + conteúdo/SEO**; fila em **`AGENDA.md` no repo** (vira memória lida em toda sessão, no boot list); entrega = **plano + scaffolding pronto pra push**. Arquitetura de **2 cadeiras** (planejamento Opus 4.8 com o Gabriel → execução Sonnet 4.6 sozinha; a execução nunca decide produto/UX/preço, deixa anotado no PR). Stack: **GitHub Actions** cron `0 8 * * *` (05h BRT, Brasil é UTC-3 fixo) → `anthropics/claude-code-action@v1` lê `AGENDA.md`+`CLAUDE.md`, pega a 1ª tarefa `pronta`, gera página numa branch `claude/<id>`, roda `scripts/check-pages.mjs`, move a tarefa pra "Em revisão" e abre **PR rascunho**. **Rede de segurança** (explicada ao Gabriel): isolamento branch+PR (=backup/restore) → **CI leve** sob medida pra HTML (não há `npm test`; o validador próprio fica **verde nas páginas atuais** e só falha em erro real) → **branch protection** torna PR+CI obrigatórios → **draft mode** + `--max-turns 30` nas 1ªs semanas. **Escopo travado em `landing/`+`docs/`** — nunca `src/`/pagamentos/Supabase (guarda-rail `financial-firewall`; página é reversível, código do bot não). Achado técnico: `landing/vercel.json` tem catch-all `/(.*)→index.html` que torna páginas novas inalcançáveis → virou a 1ª tarefa da fila (`pag-0001`), num PR revisável. **Ativação é HUMANA:** `git push` + `/install-github-app` + branch protection + (opc.) Vercel Preview + teste manual via *Run workflow* antes de confiar no cron. Guia completo: `Economizei app/Automacao_Maquina_Noturna.md`. |
| 2026-06-23 | **Estratégia de tráfego pago + criação de páginas documentada (Meta CTWA carro-chefe, ~R$200 escalável, mirando cadastro grátis)** | Gabriel quis entrar na mídia paga "engatinhando", pulando o orgânico (lento demais pra quem tem tempo escasso), com investimento controlado começando em ~R$200 e crescendo se der retorno. Após perguntas de clarificação, definiu: objetivo = **cadastros grátis (topo de funil)**; canal = **Meta + Google ao mesmo tempo**; entrega = **só pesquisa/estratégia (documento)**; orçamento = **~R$200 escalável**. Pesquisa web traduzida em `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md`. **Reframe central:** o conteúdo comum de tráfego pago é de e-commerce/dropshipping (conversão = checkout); aqui a conversão é **cadastro grátis no WhatsApp** e a métrica-rainha é **custo por ativação (1º cupom)**, não ROAS. **Recomendações honestas (vão contra parte do pedido, por isso registradas):** (1) **Meta Ads clique-pro-WhatsApp (CTWA)** é o canal natural, não o Google — ninguém busca "bot de cupom", não há demanda a capturar; (2) com R$200, rodar **os dois ao mesmo tempo mata o aprendizado de ambos** (mínimo prático Meta ~R$30–50/dia/campanha) → concentrar no Meta primeiro, Google como 2º canal depois; (3) "duplicar campanhas com alterações" (modelo dropshipping) hoje causa **sobreposição de leilão** → o certo é poucos ângulos, verba concentrada, escala vertical em degraus e teste A/B oficial; (4) pra cadastro grátis, **anúncio direto pro WhatsApp** (zero atrito) vence a página na maioria dos casos — página entra como credibilidade e pro Google. **Atribuição:** reaproveitar a leitura de código no 1º contato (já existe no `/convidar`) pra gravar a origem da campanha — quase de graça. **Guarda-rail (`financial-firewall`):** R$200 pra aprender o canal = ok; escalar de verdade só após **W2 ≥ 30%** no cohort de Fernandópolis (aquisição não conserta retenção). Pendências/pré-requisitos no doc (validar Z-API × Meta Business, ligar leitura de código de campanha no bot, template clonável + subdomínio Vercel quando for construir). |
| 2026-06-18 | **F2, F1 e F4 implementadas — primeira leva de funções de inteligência do catálogo de 06-09** | Gabriel mandou desenvolver, nesta ordem, F2 (raio-X de categoria com conclusão), F1 (inflação pessoal por item) e F4 (quanto você já economizou), com a missão de "deixar o Economizei mais robusto e com funções que realmente façam diferença na vida do usuário". Antes, análise de complexidade × efetividade das 12 funções (mapa de quadrante): veredito de que F5 (comparativo) é a mais complexa/efetiva mas bloqueada por densidade de dados, e F2/F1/F4 são as mais efetivas construíveis já. Entregue: novo módulo `src/insights.js` (funções puras de análise, separadas de dados e templates) + 3 queries em `supabase.js`. **F2:** `/gastos` deixa de só listar e conclui — maior categoria, se está acima/abaixo da média dos meses anteriores do próprio usuário, e candidato discricionário a corte (doces/bebidas ≥10%). **F1:** comando `/inflacao` — compara o preço unitário normalizado (`preco_total/qtd`) dos itens recorrentes; filtros de honestidade (2+ observações, ≥14 dias, variação 8–150%). **F4:** comando `/economia` + linha de economia anual no resumo mensal — média móvel de 3 meses; `economiaAno` soma só os meses abaixo da média (copy diz exatamente isso). **Sem migração** (todas leem colunas que já existem); deploy é só `git push`. Camadas 2→3 do norte; F5 segue adiada por densidade de dados; F3 ("onde cortar") fica pra próxima leva. |
| 2026-06-09 | **Pesquisa de finanças pessoais transformada em catálogo de 12 funções candidatas (Camadas 2/3) — primeira aplicação prática do Norte** | Gabriel pediu pesquisa "extremamente profunda" na web (finanças pessoais, gastos do dia a dia, economia de mercado, finanças comportamentais) e a tradução de cada dica-chave numa função que suba a escada (Inteligência → Habilidade), trabalhando a IA + o dado do cupom. Entregue `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md`: 12 funções com dica de origem, exemplo de mensagem, camada, veredito do Teste de Norte, triagem 🤖/🤝/🛠️/🧍, dado necessário, esforço e candidato Free/Pro — em 3 tiers + tabela priorizada + sequência recomendada. **Tier 1 (constrói já, usa o dado que já temos):** F1 inflação pessoal por item, F2 raio-X de categoria com conclusão (evolui o `/gastos`), F3 onde cortar sem doer, F4 quanto você já economizou, F5 comparativo entre mercados (já no roadmap — pesquisa valida como feature mais alavancada). **Reprovados/fora de escopo (honestidade):** G1 assinaturas/gastos invisíveis (bot só vê cupom, não fatura), G2 validade/desperdício (dado insuficiente → vira conteúdo), G3 técnica do elástico no pulso (**excluída por bem-estar** — não usamos desconforto físico como freio; combate ao impulso é informacional). Recomendação de início: F2 → F1 → F4 → F3. Nenhuma decisão de pricing fechada (passa pelo `financial-firewall`); Free/Pro nas funções é candidato a decidir. |
| 2026-06-09 | **Posicionamento & Norte Estratégico oficializado — IA que dá ciência e inteligência sobre o gasto, com Teste de Norte como filtro de decisão** | Gabriel pediu cristalizar a missão e dar um norte único a tudo daqui pra frente. Missão dita por inteiro: *fazer o brasileiro médio entender o próprio gasto e usar IA para trazer conhecimento, informação e inteligência a esse gasto* — o produto não é leitor de cupom, é a camada de inteligência que vira habilidade financeira (gastar melhor, economizar, ter mais valor sobre o dinheiro). Oficializa o reframe "assistente de compras" (discutido em 2026-05-19). Entregues: doc completo `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` + nova **seção 1.5** no CLAUDE.md (lida toda sessão). Estrutura: **3 camadas de valor** (Ciência → Inteligência → Habilidade — prefira sempre subir a escada) e o **Teste de Norte** — pergunta-mãe "isso aumenta a ciência/inteligência do usuário sobre o gasto dele?" + 4 sub-perguntas (camada, atrito, quem faz o trabalho, honestidade/`financial-firewall`). **Não revoga** nenhuma decisão desta seção; é a lente que organiza as próximas — quando 2 features competem pela mesma 1h, ganha a que sobe mais a escada do gasto. Guarda-rails mantidos (zero atrito, WhatsApp é o produto, grátis funciona, frame brasileiro, LGPD, copy honesta). |
| 2026-06-07 | **Lei 5 (idempotência por messageId) implementada + backfill dos dados antigos — fecham as 2 ressalvas abertas da sessão de coerência** | Gabriel pediu pra resolver os 2 pontos honestos deixados em aberto. **(1) Idempotência:** o webhook agora deduplica por `messageId` do Z-API (`despacharComDedup` + tabela `mensagens_processadas`, PK em `message_id`). Reentrega do mesmo evento (retry/rede/reconexão) não cria mais compra/contador duplicado. Purga diária TTL 7d. Migration `migration_2026-06-07_idempotencia_messageid.sql`. **(2) Backfill:** `supabase/backfill_2026-06-07_dados_antigos.sql` reclassifica `compras.tipo='outros'` em não-mercado antigos (heurística por nome da loja, com PREVIEW antes do UPDATE — sem ground truth porque a imagem não é guardada) e, opcionalmente, completa `itens_compra.preco_total` (no-op nos números, só formaliza a coluna; cupons antigos com total-da-linha em `preco` seguem irrecuperáveis). Detalhe técnico no `CODE_GUIDE.md`. **Pré-requisitos de deploy:** rodar a migration de idempotência + (opcional) rodar o backfill bloco a bloco no SQL Editor; depois `git push`. |
| 2026-06-07 | **`/gastos`: gráfico trocado de rosca (doughnut) para barras horizontais** | Gabriel achou a pizza ruim de ler. `src/charts.js` (`gerarUrlGraficoCategorias`) reescrita para barras horizontais ordenadas do maior pro menor gasto, cor por categoria, valor R$ + % no fim de cada barra, título com mês + total, altura dinâmica conforme nº de categorias (legenda e eixo X removidos). A assinatura `(dados, titulo)` não mudou, então `index.js` (`/gastos`) e `monthlySummary.js` (resumo mensal) usam o novo gráfico sem alteração. Continua via QuickChart.io (URL GET, zero dependência). Detalhe técnico no `CODE_GUIDE.md`. Sem migration; deploy é só `git push`. |
| 2026-06-07 | **Correção dos outputs incoerentes do bot (4 fixes) — determinismo, total único, alerta em 3 níveis, reconciliação** | Gabriel reportou 3 sintomas: (1) mesmo cupom dava 38/39/40 itens; (2) follow-up sempre dizia "compra acima do padrão"; (3) os números (% e R$) "não faziam sentido". Diagnóstico: nenhum era erro de fórmula, eram entradas ruins. **Fix 1 — determinismo:** Gemini passa a rodar com `temperature:0` + `responseMimeType:JSON` (mata a variação de contagem). **Fix 2 — total único de verdade:** `itens_compra` agora guarda `preco_total` da linha e a agregação por categoria usa ele (antes recalculava `preco×qtd`, dobrando valor de itens por peso); o `/gastos` passa a fechar com o total do cupom via fatia "Não identificado". **Fix 3 — alerta inteligente:** a média de gastos passa a considerar só compras de mercado (`compras.tipo`), e o alerta vira 3 níveis (abaixo 🎉 / dentro ✅ / acima 📈) com limiares e modo configuráveis por env (`ALERTA_LIM_ACIMA`, `ALERTA_LIM_ABAIXO`, `ALERTA_MODO`); default = só fala quando foge do padrão. **Fix 4 — reconciliação:** soma dos itens é comparada ao total declarado e a melhor das 2 tentativas do Gemini é escolhida. Detalhes técnicos no `CODE_GUIDE.md`. **Pré-requisito de deploy:** rodar `supabase/migration_2026-06-07_coerencia_outputs.sql` antes do push. |
| 2026-06-07 | **Assinatura recorrente no cartão via Mercado Pago — implementada (sem CNPJ, conta MP pessoal do Gabriel)** | Gabriel decidiu plantar a cobrança automática no cartão desde o início porque o PIX cria atrito (pagar manual todo mês → churn por esquecimento). MP escolhido por já ter conta no banco MP e aceitar PF. Modelo: **assinatura sem plano associado** — o bot gera 1 link de checkout por usuário (`/assinar individual\|familia\|familia+`), pede o e-mail, e o MP cobra automático todo mês. Cartão nunca toca o servidor (PCI no MP). Webhook liga/desliga `is_pro`. **PIX manual continua** como alternativa (`/pix`). Comandos novos: `/assinar <plano>`, `/pix`, `/cancelar`. Um assinante pagante que veio por indicação **converte a indicação** automaticamente (recompensa o indicador). Detalhe técnico no `CODE_GUIDE.md`. **Pendências de ativação (HUMANO):** criar aplicação no painel MP, pegar Access Token + secret, configurar `MP_*` no Railway, rodar `migration_2026-06-07_assinaturas_mp.sql`, apontar webhook. Passo a passo em `Economizei app/Plano_Implementacao_Cartao_MP.md`. |
| 2026-06-07 | **Sistema de indicação `/convidar` — programa de 2 lados, 2 marcos, recompensa em dias de "funções Pro" (NÃO em cupons)** | Gabriel quis um motor de boca-a-boca alinhado com a praça de Fernandópolis. Desenho fechado: comando **`/convidar`** (aliases `/indicar`, `/convite`) gera link `wa.me` com código no texto pré-preenchido. **Marco 1 — amigo manda o 1º cupom (ativação):** os DOIS ganham **7 dias** de funções Pro (comparativo + alerta inteligente). **Marco 2 — amigo vira Pro pagante (conversão):** indicador ganha **+30 dias**. **Teto de acúmulo: 60 dias.** Recompensa é em `features_pro_ate`, separada de `is_pro`, e **não altera o limite de 10 cupons** (que é o teto de custo Gemini) — escolha explícita pra não furar o unit economics. Marco 1 é 🤖 automático (bot detecta 1º cupom); marco 2 é 🧍 manual via novo endpoint `POST /admin/ativar-pro`. Guardas anti-abuso: 1 indicação por indicado (UNIQUE), sem auto-indicação, código só registra em 1º contato. **Ressalva honesta:** as funções Pro recompensadas (comparativo/alerta inteligente) ainda NÃO estão implementadas — a recompensa está plumada e gravada, mas só "morde" quando essas features existirem. Decisão técnica espelhada no `CODE_GUIDE.md`. |
| 2026-06-07 | **`/gastos` cai pro mês mais recente com dados quando o mês atual está vazio (Opção 2 do fix), agrupando por `data_compra`** | Debug de "categoria/nome_canonico NULL" concluiu que **não havia bug de gravação** — o INSERT sempre gravou (confirmado por SQL: 40/40, 39/39 itens com categoria, e pelo log `diag_itens_gravados` que é o retorno do `.select()` pós-INSERT). O sintoma real era o `/gastos` retornar "sem dados": ele filtra por `data_compra` (data impressa no cupom = 31/maio) contra o mês corrente (junho), escondendo os dados. Fix: `mostrarGastos` (`index.js`) tenta o mês atual; se vazio, usa `buscarMesMaisRecenteComGastos` (`supabase.js`, nova) e avisa qual mês está mostrando. Resumo mensal automático segue por `data_compra` normalmente. **Aprendizado-chave:** `categoria` NUNCA sai null do `validarSchema` (sempre `'outros'`/`'nao_mercado'`) — então NULL no banco = código antigo rodando OU leitura filtrando errado, nunca falha de extração. Causa secundária descoberta: linhas NULL pré-existentes eram de cupons processados antes do deploy do código novo subir (container reiniciou 20:07). |
| 2026-06-07 | **Heurística `avaliarQualidadeCanonicoItem` (gemini.js) dá falso positivo de `pouco_simplificado` — pendente de ajuste** | Log `canonico_suspeito` acusou 56% dos itens, mas os canônicos estavam bons ("Bisc Marilan 1" → "biscoito marilan", "Picanha Bov Kg 0,456 Kg" → "picanha bovina 0.456kg"). O critério `canonico.length > nomeNorm.length * 0.80` pune nomes de cupom que já vêm muito abreviados. Não afeta dado nenhum (canônico é gravado normalmente), é só ruído de log. Afrouxar o critério numa próxima sessão de código. |
| 2026-06-06 | **`CODE_GUIDE.md` criado como memória técnica paralela ao CLAUDE.md + skill `economizei-code-decisions`** | Decisões de programação misturadas com estratégia inflavam o CLAUDE.md. Separação: `CLAUDE.md` = negócio/produto, `CODE_GUIDE.md` = stack/padrões/decisões técnicas/aprendizados de bug. Skill nova mantém esse guia vivo (paralela à `memory-system`). Decisões com impacto estratégico ficam nos dois com pointer cruzado. Sistema sobe pra 15 skills. |
| 2026-06-06 | **Gastos por categoria implementados — `/gastos` + gráfico doughnut via QuickChart.io** | Gemini passa a retornar `categoria` (10 valores: carnes, hortifruti, laticinios, padaria, bebidas, limpeza, mercearia, congelados, doces, outros) e `nome_canonico` (nome normalizado em lowercase) por item. Novos arquivos: `src/charts.js` (gera URL do gráfico via GET QuickChart.io — zero dependências), `supabase/migration_categorias_precos.sql` (adiciona colunas + cria tabela `precos_mercado`). Arquivos modificados: `gemini.js` (prompt + validação + rastreio de qualidade), `supabase.js` (salva categoria/canonico, registra preços anônimos fire-and-forget, `buscarGastosPorCategoria`), `formatter.js` (`montarMensagemGastos`, `montarMensagemPrivacidade`), `zapi.js` (`enviarImagem`), `index.js` (comandos `/gastos`, `/privacidade`, `/nao-compartilhar`, `/compartilhar`), `monthlySummary.js` (envia gráfico junto com resumo mensal). **PRÉ-REQUISITO DE DEPLOY:** rodar `supabase/migration_categorias_precos.sql` no SQL Editor antes do push. |
| 2026-06-06 | **Rastreio de qualidade do `nome_canonico` — duas camadas** | Camada 1 (runtime): `avaliarQualidadeCanonicoItem()` em `gemini.js` classifica cada item como `ok`, `ausente`, `igual_ao_nome`, `muito_longo`, `pouco_simplificado` — problemas logados como `canonico_suspeito` no Railway. Camada 2 (auditoria periódica): `supabase/monitoring_canonicos.sql` com 5 queries (visão geral, itens problemáticos, duplicatas em `precos_mercado`, variações de nome, correção manual). **Aprendizado técnico da sessão:** `itens_compra` não tem `criado_em` — filtro de data deve usar `compras.data_compra` via JOIN. Queries corrigidas para usar `c.data_compra >= (CURRENT_DATE - INTERVAL '30 days')`. |
| 2026-06-06 | **Estrutura do comparativo de mercados (`precos_mercado`) criada** | Tabela anônima: `produto_canonico`, `loja`, `cnpj`, `preco_unit`, `data_obs`. Participação automática (opt-out via `/nao-compartilhar`). Cupons não-mercado (`tipo='outros'`) não entram na tabela — farmácias/postos/restaurantes poluiriam a base de preços de supermercado. Base ainda sem dados suficientes pra queries de comparativo — estrutura pronta para acumular dados dos próximos meses. |
| 2026-06-06 | **Resiliência da leitura de cupons — 3 correções implementadas** | Diagnóstico: Gemini funcionava no AI Studio mas falhava no bot porque o WhatsApp comprime as fotos antes de entregar. **Correção 1 — pré-processamento Sharp** (`gemini.js`): antes de enviar ao Gemini, a imagem passa por `normalise()` (auto-contraste) + `sharpen(sigma:1.5)` + conversão pra PNG lossless. Se Sharp falhar, usa buffer original como fallback. **Correção 2 — retry automático** (`gemini.js` + `zapi.js`): download com até 2 tentativas e validação de tamanho mínimo (< 1KB = corrompido); Gemini com até 2 tentativas (processada → original) — só retenta em `borrado` ou JSON inválido, retorna imediatamente em qualquer outro erro (nao_e_cupom, muito_longo etc). Logs detalhados: `gemini_resposta_bruta`, `gemini_json_invalido`, `zapi_download_tentativa`, `zapi_download_ok`. **Correção 3 — orientação ao usuário** (`formatter.js`, `index.js`): quando a imagem fica borrada mesmo após retry, o bot envia uma segunda mensagem explicando como reenviar como *Documento* (sem compressão do WhatsApp). Nova função `montarMensagemEnviarComoArquivo()`. Sharp adicionado ao `package.json`. |
| 2026-06-06 | **Mensagem de confirmação passa a listar TODOS os itens do cupom (antes cortava em 3 + "...e mais N")** | Usuário pediu ver tudo que a IA registrou. Itens já eram 100% salvos no Supabase (`itens_compra`); só a mensagem truncava. `formatter.js montarResposta` reescrito: lista todos com quantidade (`2x ...`), com guarda de ~3000 chars pro limite do WhatsApp (acima disso mostra o que cabe + "...e mais N"). Testado com cupom de 32 itens = 1.847 chars, ok. |
| 2026-06-06 | **Cupom de NÃO-mercado passa a ser lido e salvo como "Outros (não-mercado)" — não é mais rejeitado** | Antes retornava `sucesso:false` + mensagem negativa. Agora o prompt do Gemini retorna `sucesso:true` + `tipo:"outros"` extraindo loja/total/itens; `validarSchema` marca todos os itens como categoria `nao_mercado`; confirmação é neutra/positiva. **Conta no limite de 10** do Free (consome cota normal, protege custo Gemini). Aparece como **fatia única "Outros (não-mercado)"** no `/gastos`. **NÃO alimenta o comparativo de mercados** (`registrarPrecosMercado` pulado quando `tipo==='outros'`). Arquivos: `gemini.js`, `formatter.js`, `charts.js`, `supabase.js`, `index.js`. |
| 2026-06-06 | **Reescaneamento de cupons: OPÇÃO A escolhida (armazenar imagem de falhas) — design definido, build pendente** | Gabriel escolheu a Opção A. Achado base: hoje nenhuma imagem é armazenada (buffer → Gemini → descartado; URL Z-API expira), então releitura retroativa de cupons já esquecidos é impossível — só funciona daqui pra frente. **Parâmetros fechados:** guardar SÓ imagens de cupom que falharam na leitura; apagar ao ler com sucesso +48h, teto absoluto de 7 dias; consentimento opt-out automático com aviso (`/nao-guardar`). **Reverte conscientemente** a postura anterior de "nunca persistir imagem" (skill `economizei-security-lgpd`) — defensável porque mantém minimização (só falhas, vida curta), finalidade única, exclusão garantida (purga + `/apagar` cobre imagens) e transparência. **Verdade técnica:** como o bot já faz Sharp+2 retries, reprocessar a mesma imagem raramente muda o resultado — por isso o desenho usa `pipeline_version` (só reprocessa se o leitor mudou) e foca no lembrete com contexto. Design completo em `Economizei app/Plano_Reescaneamento_Opcao_A.md` (schema `cupons_pendentes`, bucket privado, ciclo de vida, módulo `cupomStorage.js`, cron, comandos). LGPD: `landing/privacy.html` já atualizado (publicar só junto com a feature); `/privacidade` do bot fica pra sessão de build. |
| 2026-06-04 | **LGPD: Política de Privacidade (`/privacidade`) e Termos de Uso (`/termos`) publicados na landing** | Pré-requisito para Meta Ads; conformidade LGPD com dados de cupom (CPF, CNPJ mercado, itens). `vercel.json` atualizado com rotas limpas. Links do rodapé da landing corrigidos (eram `#`). |
| 2026-06-04 | **Sistema de skills movido pra `.claude/skills/` + `PROJECT_INSTRUCTIONS.md` criado + CLAUDE.md enxugado** | Skills não estavam sendo auto-descobertas no path antigo (`skills/` workspace root). Mover pro path padrão + instruções de projeto carregadas em toda sessão resolve. CLAUDE.md teve 3 decisões revogadas e 2 sessões antigas movidas pra `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` — reduziu ~170 linhas mantendo histórico íntegro. |
| 2026-06-02 | **Estimativas de tempo banidas do CLAUDE.md e do CALENDARIO.md** | IA é ruim em calcular tempo estimado sem histórico real. Prazos só entram nos documentos depois de medidos em tentativas reais. Gatilhos são baseados em métricas (ex: "≥ 5 pagantes"), nunca em semanas/meses numerados. Prompt de execução em `PROMPT_CALENDARIO.md`. |
| 2026-06-02 | **Criação do CALENDARIO.md** como arquivo modular de rotinas e checkpoints | Centraliza metas diárias, semanais e mensais + checkpoints de progresso por gatilho. Referenciado no topo do CLAUDE.md como os outros módulos. Não substitui o CLAUDE.md — é o calendário operacional, não a memória estratégica. |
| 2026-06-02 | **Sistema de reengajamento planejado** — lembretes amigáveis por inatividade | 4 segmentos definidos: (A) nunca mandou cupom — dias 2 e 7; (B) mandou e sumiu — dias 3, 10, 30, 60; (C) fim de mês com cupons abertos — dias 26–27; (D) perto do limite gratuito — ao chegar em 8/10 cupons. Tom: amizade, não cobrança. Prompt de implementação em `PROMPT_REENGAJAMENTO.md`. Entregáveis: nova tabela `lembretes_enviados` no Supabase, módulo `src/reengagement.js`, novas funções em `supabase.js` e `formatter.js`, cron diário às 10h em `scheduler.js`. Regras: máx 50 usuários/segmento/execução, 1 lembrete/usuário/execução, 1.5s entre envios, nunca duplicar (checar tabela antes). |
| Maio 2026 | Modelo Freemium + Premium | Reduz barreira de entrada para público B/C; monetização via upgrade |
| Maio 2026 | Canal exclusivo WhatsApp | Público usa WhatsApp diariamente; elimina fricção de instalar app |
| Maio 2026 | Foco inicial em B2C (supermercados) | Mercado grande, dor clara, produto simples de demonstrar |
| Maio 2026 | Gemini 2.5 Vision para análise de cupons | Melhor custo-benefício para OCR + compreensão contextual |
| 2026-05-08 | **Lançar como Freemium real (modelo Spotify), não trial** | Princípio "bom, barato e útil — grátis funciona de verdade". Free deve resolver a dor central |
| 2026-05-08 | **Limite de 10 cupons/mês no Free** (era 3) | Limite é técnico (custo Gemini), não artificial. 10 cobre o uso normal de quem vai 2-3x/semana ao mercado |
| 2026-05-08 | **Pricing futuro: 4 tiers** — Grátis / R$9,90 individual / R$15 família 3p / R$22 família+ 5p | Plano família ancora valor; resolve persona indireta "filha paga pra mãe"; ARPU maior; churn menor |
| 2026-05-08 | **Alerta dividido: básico no Free, inteligente no Pago** | Free entrega utilidade real (alerta reativo "20% acima"); Pago entrega inteligência (preditivo + categorizado) |
| 2026-05-08 | **Comparativo de preços é feature paga, não Free** | É a "killer feature" pedida explicitamente na pesquisa. Justifica upgrade |
| 2026-05-08 | **Manter Z-API até CNPJ + 50–100 usuários** | Meta Cloud API exige Business Account verificado + templates aprovados que restringem alertas proativos. Migrar só depois |
| 2026-05-08 | **Headline da landing lidera com "esperto/economia", não privacidade** | Pesquisa: preço passou privacidade como objeção #1. Frame cultural BR é "ser esperto / não dar mole" |
| 2026-05-08 | **Landing mostra os 4 planos desde já** (pagos com tag "em breve") | Ancora preço futuro na cabeça do usuário; sinaliza visão de produto |
| 2026-05-08 | **Onboarding antecipa 2 objeções: "vai dar trabalho?" e "cupom já mostra"** | Mensagem 2 mata "trabalho" ("é sério, é só foto"); Mensagens 3 e 4 matam "cupom já mostra" planta a semente da comparação temporal |
| 2026-05-19 | **EXCLUSÃO total de qualquer benefício prometido ao Beta** — sem 3 meses grátis, sem preço travado, sem desconto vitalício, sem acesso antecipado pago | Princípio: só prometer benefício depois de ter dados que mostrem que o produto retém e converte. Antes disso, prometer subsidio = cheque em branco sem unit economics. Aplicar em: landing (`landing/index.html`), copy do bot (`src/formatter.js`), CLAUDE.md (seção 3 e 11), comunicação em redes sociais. **Comunicação do Beta vira:** "Aplicação em desenvolvimento. Use de graça enquanto durar o Beta. Quando o pago chegar, você decide se continua." Sem âncora financeira de benefício. |
| 2026-05-19 | **Áreas da empresa cortadas de 7 para 3 reais** (Produto, Distribuição, Caixa) | Auditoria identificou que as outras 4 áreas eram teatro corporativo — rotinas que nunca foram executadas. Áreas suspensas registradas na seção 5 para retomada futura. |
| 2026-05-15 | **Revisão de copy da landing — tom mais formal e direto** | Gabriel revisou e reescreveu seções: badge hero ("Aplicação em desenvolvimento · Beta gratuito"), headline com 2 cores (verde "Não deixa" + vermelho "passar a perna"), empatia mais explícita ("Problemas que resolvemos" + disclaimer fictício), copy step 1 mais detalhada, anti-planilha simplificada, pricing sub mais funcional |
| 2026-05-21 | **Economizei deixa de ser tratado como hobby — passa a ser negócio profissional** | Decisão explícita do Gabriel. Implica: planejamento formalizado, gatilhos de decisão obrigatórios, time + capacidade documentados, régua de retorno explícita. Criada nova seção 6 (Time & Capacidade) no CLAUDE.md + novo doc `Economizei app/Projecao_6_meses.md` |
| 2026-05-21 | **Dedicação real ao projeto fixada em ~12h/semana** (média de 10–14) | Calibragem honesta vs. "1h/dia" que estava no doc. Custo de oportunidade dessas horas: R$65/h (R$/h do trabalho principal). Total opportunity cost em 6 meses: R$20.280; em 8 meses: R$26.520 |
| 2026-05-21 | **Régua de retorno: MRR ≥ R$4.225/mês até início de 2027** | Equivalente a 15h × 4,33 sem × R$65/h. Ponto de "break-even contínuo" entre o que o projeto rende por mês e o que essas horas custariam por mês no trabalho principal. Não é payback do afundado — é run-rate de "trabalho que se paga sozinho" |
| 2026-05-21 | **Projeção em 3 cenários (otimista/realista/pessimista) com gatilhos semáforo** | Documento `Projecao_6_meses.md` define probabilidades subjetivas (~15-20% / ~50% / ~30-35%) e gatilhos obrigatórios nos meses 2, 3, 4, 6 e 8. Sem revisão nesses pontos, o projeto entra em modo "andar por inércia" |
| 2026-05-21 | **Plano de terceirização faseado por gatilho, não por ansiedade** | Fase 1 (mês 1-4): sem freelas. Fase 2 (mês 4-6): freelas pontuais SE W2 ≥ 30% no mês 3. Fase 3 (mês 6-8): freelas recorrentes SE MRR ≥ R$300 no mês 6. Fase 4 (mês 8+): contratação CLT/PJ SE MRR ≥ R$2.000. Princípio: contrata-se por evidência, não por ansiedade |
| 2026-05-22 | **Paywall ativo desde o lançamento via PIX manual — sobrescreve decisão de 2026-05-08 ("não ativar paywall nas 6 semanas iniciais")** | Após análise de projeção alternativa (`Projecao_Cenario_Paywall_Dia_1.md`), conclusão: paywall completo com Stripe/MP no dia 1 NÃO compensa (saldo líquido negativo em 2 de 3 cenários). MAS paywall via PIX manual SIM compensa (custo de implementação ~R$130, captura ~80% do benefício). Princípio mantido: free continua funcionando de verdade (10 cupons/mês, alerta básico, resumo), Pro é melhor mas não obrigatório. Modelo Spotify completo desde dia 1. **Gatilho de automação:** ≥ 5 pagantes via PIX em 60 dias → implementar Stripe/MP |
| 2026-05-22 | **Remoção total de tags "Em breve" na landing e no bot — anúncio direto do valor dos 4 planos** | Decisão do Gabriel: ser o mais honesto possível. Pricing dos 4 planos visível desde o lançamento, com indicação clara de quais features cada plano tem e botão "Assinar via PIX" no Individual / Família / Família+. Pesquisa qualitativa havia mostrado que o brasileiro valoriza honestidade direta — mostrar pricing real vale mais que ancorar "em breve" |
| 2026-05-22 | **Waitlist Beta Fundador removida da landing — substituída por CTA direto** | Como o Pro já está disponível via PIX, não faz mais sentido ter waitlist "pra avisar quando o Pro chegar". Seção transformada em bloco "Como começar" com 2 CTAs: (1) "Começar grátis no WhatsApp" → free, (2) "Assinar Pro via PIX" → WhatsApp pré-formatado com instruções |
| 2026-05-22 | **Copy do bot reescrita com foco em honestidade — remoção de Beta Fundador / 3 meses grátis / promessas antigas** | Toda mensagem que referenciava "Beta Fundador" com benefício foi reescrita. Bot agora apresenta os 4 planos de forma natural, com comando `/planos` que mostra o que cada plano oferece e como assinar via PIX. A flag `is_beta` no Supabase é mantida como marcador técnico de cohort (decisão de 2026-05-19), mas não aparece mais em copy promocional |
| 2026-05-26 | **Fernandópolis-SP definida como praça inicial de lançamento** (não SP capital, não nacional) | Gabriel tem rede física e cultural na cidade — boca-a-boca, vocabulário e indicação saem com autenticidade. Cidade de ~70k hab, R$ 3,4 bi de potencial de consumo, classes B/C em crescimento (560+1.088 domicílios novos em 2024). Ads geo-segmentados saem 5–10× mais baratos que capital. Validação social acontece em 30 dias, não 6 meses. Expansão natural depois: Votuporanga → Jales → São José do Rio Preto. Detalhamento completo na seção 7.1 |
| 2026-05-26 | **Roteiros de campanha devem usar sotaque/cultura do interior, não da capital** | Decisão registrada como diretriz editorial: usar "cê", "ó", "véi", "rapaz", "rancho do mês", referências de praça/avenida, peão/rodeio. Sem jargão de startup, sem inglês desnecessário, sem tom paulistano. Mercados locais (Pessotto, Sakashita, Souza) podem ser mencionados em contexto neutro de hábito, NUNCA em tom negativo ou implicando parceria. Aplicar em todos roteiros TikTok/Reels e em ads do Mês 1–3 |

---

## 9. 📚 Aprendizados & Retrospectivas

### Maio 2026 — Pesquisa de validação (30 respostas)

**O que validou:**
- WhatsApp é o canal certo: 27/30 abrem 6+ vezes/dia, 100% celular.
- Dor existe e é descrita em linguagem emocional: "me senti irresponsável", "decepcionado comigo mesmo", "incapacidade de administrar a vida cotidiana".
- Alerta proativo gera ação concreta em ~70% dos casos — é a feature mais alavancada.
- Há 2 perfis psicográficos quase iguais em peso: **Otimizador** ("saber que economizei") e **Controlador** ("saber exatamente quanto gasto"). Copy precisa endereçar os dois.
- Surgiu Persona 3 indireta: "filho/filha que instala pra mãe" — 2 menções espontâneas.

**O que invalidou:**
- Preço de R$9,90/mês não está validado: só 13–16% pagaria com convicção, 45% diz "não pagaria". Tentar cobrar antes de provar valor é destruir o canal.
- Privacidade não é mais a objeção #1 com amostra maior — preço passou (preço ~29%, privacidade ~23%).
- "Indicaria" caiu de 67% (primeira amostra) para ~48% — ainda alto, mas não quase-universal.

**Surpresas:**
- "Já tenho isso no cupom" apareceu como detrator forte — segmento que vê produto como só OCR. Resposta: o valor é **temporal** (agregação no tempo), não transacional. Precisa estar explícito no onboarding (mensagens 3 e 4).
- "Tempo que teria que passar alimentando informações no app" apareceu como medo (linha 20) — apesar do produto ser só foto. Falsa percepção que precisa ser combatida na copy.
- Concorrente real é a **planilha de Excel**, não outros apps. 4 menções espontâneas de quem já tentou e desistiu.

**Aplicação:**
- Posicionamento: "O Economizei é a planilha que você nunca conseguiu manter".
- Headlines com framing brasileiro de "ser esperto" — testar Opção 1 ("Não deixa o mercado te passar a perna") vs Opção 4 ("Economizar virou foto") em A/B.
- Adiar paywall, reforçar Beta Fundador, lançar gratuito real.

### Maio 2026 — Auditoria do código

**O que aprendi:** o bot estava muito mais construído do que o briefing inicial sugeria. MVP técnico já completo (webhook + Gemini + Supabase + alertas). O trabalho das 6 semanas não é construir, é **endurecer + lançar + validar**. Esse insight inverteu a priorização das 6 semanas — de "construir features" para "distribuição, mensagem e validação".

---

## 10. 🔗 Recursos

### Documentos da empresa
- **Tráfego Pago & Criação de Páginas:** `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` *(como entrar na mídia paga com ~R$200, Meta CTWA × Google, métricas CPM/CPC/CPL/ativação, subdomínio na Vercel, estrutura de campanha e plano de teste)*
- **Posicionamento & Norte Estratégico:** `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` *(missão, 3 camadas de valor, Teste de Norte — ver também seção 1.5)*
- **Da Dica à Função (pesquisa de finanças → 12 funções candidatas):** `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md`
- **Plano completo de pesquisa + estratégia (com copy pronta):** `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`
- **Roadmap visual 6 semanas (HTML para impressão/PDF):** `Economizei app/Economizei_Roadmap_6_Semanas.html` *(abrir no navegador, Ctrl+P → "Salvar como PDF")*
- **Apresentação Blueprint Empresarial:** `economizei-blueprint.pptx` (na pasta de outputs do Cowork)
- **Pesquisas brutas:** `local_*/uploads/Pesquisa de Hábitos de Compra no Supermercado*.csv`

### Repositório
- **Código:** `C:\Economizei\src\`

### APIs em uso
- Z-API (WhatsApp gateway)
- Google AI Studio (Gemini 2.5 Flash)
- Supabase (PostgreSQL + Auth)

---

## 11. 💬 Histórico de comandos importantes do Gabriel

*Esta seção registra as instruções e princípios que o Gabriel deu explicitamente, para preservar a intenção original em decisões futuras.*

### 2026-06-23 — Sessão da virada da Máquina Noturna pra CÓDIGO (com firewall financeiro)

**Briefing inicial (verbatim):**
> "Eu entendi todo o plano mas eu gostaria que o bot fizesse na verdade, mudanças de código e que a questão financeira fosse protegida com toda a certeza pra que o bot não mexesse em coisas do tipo mas, eu quero que ele faça alterações do código, que ele desenvolva funções novas, que ele atualize coisas no próprio código e essa função principal por agora dessa automação. Eu quero que você mude isso na agenda, que você mude isso do planejamento que aí sim a gente possa prosseguir. Faça também um documento separado do passo a passo com o ícone do que que eu preciso fazer, do que que é pro bot fazer incluindo também os que serão preciso colocar, pra que eu possa fazer caso tenha alguma coisa que necessite."

**O que mudou em relação à montagem anterior (páginas → código):** a máquina deixa de mirar páginas estáticas e passa a **mexer no código do bot** (funções novas, refino, bugfix) — com a **condição inegociável** de blindar o financeiro.

**Como a blindagem foi feita (não é só instrução):** trava de código `scripts/check-firewall.mjs` que roda no CI e **reprova o PR** se o diff tocar dinheiro, por (1) **denylist de caminho** (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile`, o próprio firewall) e (2) **scan de conteúdo** nas linhas adicionadas (mercadopago, is_pro, assinatura, preapproval, MP_, pix, checkout, paywall, ativar-pro, montarMensagemPlanos, features_pro_ate). Com **branch protection** exigindo o check **"CI"**, PR financeiro fica não-mergeável. Explicado ao Gabriel: é a garantia mais forte possível; nenhum sistema é 100%, mas o financeiro não passa silenciosamente.

**Rede de segurança de código (o projeto não tinha testes):** novo `ci.yml` roda firewall → `node --check` (sintaxe) → `node --test` (testes) → `check-pages`. Baseline `test/insights.test.js` (5 testes, verde) + **TDD obrigatório** no prompt da run. `claude-nightly.yml` reescrito (zona proibida explícita, `--max-turns 40`).

**Entregas desta sessão:**
- `scripts/check-firewall.mjs` (firewall financeiro, com `--selftest`).
- `test/insights.test.js` (baseline + exemplo de teste).
- `.github/workflows/ci.yml` (CI completo) e `claude-nightly.yml` reescrito; `pages-ci.yml` virou stub deprecado (não deu pra remover via Cowork — apagar no PC).
- `AGENDA.md` repropostas (taxonomia de código, bloco 🚫 Zona proibida, tarefas-semente cod-0001/0002/0003).
- **`Economizei app/Passo_a_Passo_Maquina_Noturna.md`** (doc separado pedido: passo a passo com ícones 👤 você / 🤖 máquina / ⚙️ configurar / 🚫 proibido + tabela quem-faz-o-quê).
- Guia `Automacao_Maquina_Noturna.md` atualizado (foco código + seção do firewall) e este CLAUDE.md (boot note, última atualização, decisão, registro).

**Pushback honesto registrado:** código autônomo de madrugada é **bem mais arriscado** que página estática. Foi aceito porque o conjunto firewall + testes + draft PR + revisão de manhã segura o risco — mas a disciplina de revisar todo PR de manhã é o que sustenta isso. Sem isso, não soltar.

**Validação no sandbox:** firewall selftest 16/16; 4 cenários git (limpo passa / `is_pro` escondido bloqueia / `package.json` bloqueia / `supabase/` bloqueia); 5 testes verdes; `node --check` ok; check-pages verde.

**Pré-requisitos de ativação (HUMANO):** `git push`; `/install-github-app` (cria o secret `ANTHROPIC_API_KEY`); branch protection na `main` exigindo o check **"CI"**; testar 1× via Actions → *Run workflow* com a `cod-0001`. **Nota operacional recorrente:** push é sempre do Gabriel na máquina dele (Cowork sem credencial).

### 2026-06-23 — Sessão do plano anual (aumento de ticket médio)

**Briefing inicial (resumo do Gabriel):** com investimento inicial de ~R$200 e custo por usuário de ~R$54 (mínimo ~R$30), precisa aumentar lucro/margem **subindo o ticket médio**. Quer um **plano anual** em que a pessoa paga **~R$100 por 12 meses, economizando ~2 meses**, e quer que **~80% dos usuários fiquem no anual**, pago **via PIX ou cartão**, pra ter ticket médio maior e "um investimento que faça mais sentido". Pediu pra **registrar no CLAUDE.md**, mudar **todas as referências** e começar a trabalhar nesse sentido. Também: usar a economia do anual como **exemplo de marketing no próprio site** — mas **deixar essa ideia em fila de aguardando decisão**. Anexou o caveat do `financial-firewall` (não escalar aquisição antes de validar W2; aquisição não conserta retenção) e o material de métricas de tráfego pago da sessão anterior.

**Perguntas de clarificação (respostas do Gabriel):**
- **Escopo do anual:** *Os 3 planos pagos* (não só o Individual).
- **Mensal × anual:** *Anual em destaque, mensal continua* (oferta-destaque, não anual-exclusivo).

**O que foi entregue (só CLAUDE.md + AGENDA.md nesta sessão):**
- Seção 3 reescrita: tabela com mensal **e** anual (Individual R$99 / Família R$150 / Família+ R$220 ao ano = ~2 meses grátis), anual como destaque, mensal mantido, PIX **ou** cartão, bloco "por que o anual virou o norte comercial" + os 4 caveats honestos + nota do preço R$99.
- Métricas novas: **ticket médio/ARPU** e **% de pagantes no anual**; W2 marcado como gatilho de escala.
- Fluxo de pagamento atualizado pra refletir destaque do anual + cartão MP + pendências de implementação.
- Cabeçalho "Última atualização", linha na tabela de Decisões (Seção 8) e este registro.
- `AGENDA.md`: ideia do "exemplo de economia na landing" parada em **fila de decisão do Gabriel**.

**Pushbacks honestos que precisei dar (e ficaram registrados):** (1) **80% no anual é estrela-guia, não premissa de dia 1** — R$99 à vista é pedido bem maior que R$9,90/mês e fere menos o "zero atrito" só porque o mensal continua; o caminho que converte é free → viver o valor → upsell anual, não vender anual a frio; (2) **anual amplifica, não conserta** — caixa adiantado NÃO libera escalar os R$200+ antes de **W2 ≥ 30%** (honrei o `financial-firewall` que ele mesmo colou); (3) fixei **R$99** em vez de R$100 pra fechar a narrativa "pague 10, leve 12"; (4) acrescentei política de **reembolso proporcional** (cobrar um ano de quem usou 2× e sumiu gera risco). As decisões do Gabriel foram acatadas; os riscos foram anotados, não impostos.

**Pendências deixadas (não feitas nesta sessão — precisam do Gabriel/código):** criar os planos anuais no painel do **Mercado Pago**; expor o ciclo anual no `/planos` e no `/assinar` (`formatter.js` + checkout); refletir o anual no bloco de pricing da `landing/index.html`. Ofereci fazer essas três a seguir. **Nota operacional:** push pro GitHub e mudanças de pagamento são sempre do Gabriel na máquina dele — o Cowork não tem credencial; e pricing/landing são "decisões dele", então parei no registro + plano.

### 2026-06-23 — Sessão da Máquina Noturna (automação autônoma de páginas)

**Briefing inicial (verbatim):**
> "Pensando nessa automação vamos trabalhar em uma maquina que possa trabalhar sozinha em se aprimorar conforme a direção dada por mim atravez de um planejamento conjunto com a maquina. Eu quero que a automação aconteça as 5 da madrugada e que por agora as ações sejam focadas em gerações de paginas (...) girando em torno de uma agenda que eu vou elaborar cada nova etapa dependendo de prioridade, urgência (...) discutidos junto com a IA no OPOS quatro ponto oito, porém eu quero que toda essa automação seja feita no Sonet. (...) uma forma de que eu consiga, a cada nova conversa, acompanhar essa agenda e decidir atividades importantes da IA, coisas que eu preciso fazer porque a gente não consegue fazer (...) que elas estejam referenciada no claud[e] (...) pra que eu consiga ter sempre essa memória guardada."

Complemento: *"Eu disse o comando errado na última vez, eu quero ir testando o que é capaz de desenvolver com essa ferramenta e não limitar a algo logo de início então continue e me pergunte o que for necessário."* (Doc de referência anexado: `automacao-claude-code-agendado.md`.)

**Perguntas de clarificação (respostas do Gabriel):**
- **Tipo de página:** *Landing + A/B **e** Conteúdo/SEO.*
- **Onde fica a agenda:** *`AGENDA.md` no repo* (vira memória lida em toda sessão).
- **Entrega agora:** *Plano + scaffolding pronto pra push.*
- **Segurança:** pediu pra **explicar** o que é rede de segurança / CI leve / PR e como começar isso junto com a automação (respondido no guia + chat; adotada a postura recomendada: rascunho + CI leve).

**Arquitetura escolhida (2 cadeiras):** planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na `AGENDA.md`) → execução no **Sonnet 4.6** (run noturna headless via GitHub Actions, sozinha, nunca decide produto). Cron `0 8 * * *` = **05h BRT**. PR-first: a máquina trabalha em branch e abre **PR rascunho**; nada entra na `main` sem o Gabriel.

**O que foi entregue (scaffolding real, pronto pra `git push`):**
- `AGENDA.md` — fila viva + protocolo parseável pela run + seções (Fila pronta / Em revisão / Concluído / Backlog / **Ações do Gabriel**) + 4 tarefas-semente (pag-0001 roteamento Vercel, pag-0002/0003 guias SEO, pag-0004 variação A/B).
- `.github/workflows/claude-nightly.yml` (motor Sonnet, 5h, prompt completo) e `.github/workflows/pages-ci.yml` (CI leve em PRs de página).
- `scripts/check-pages.mjs` (validador HTML zero-dependência; **testado verde** nos 5 HTML existentes) + `npm run validate:pages`.
- Guia `Economizei app/Automacao_Maquina_Noturna.md` (arquitetura, rede de segurança explicada, setup, rollout, custos).
- `CLAUDE.md`: boot list (+AGENDA.md, "leia os 4"), arquitetura modular, "Última atualização", linha em Decisões e este registro.

**Decisões honradas / pushbacks:** escopo travado em `landing/`+`docs/` — a máquina **não toca `src/`/pagamentos/Supabase** (guarda-rail `financial-firewall`: página é reversível, código do bot não); autonomia só na execução, julgamento de produto fica com o Gabriel; rede de segurança ligada **antes** do automático soltar (isolamento → CI → branch protection → cron). Achado técnico: `vercel.json` catch-all tornava páginas novas inalcançáveis → virou a 1ª tarefa (`pag-0001`) num PR revisável, em vez de eu mudar roteamento de deploy por conta própria.

**Pré-requisitos de ativação (HUMANO, nesta ordem):** (1) `git push` dos arquivos; (2) `/install-github-app` (cria o secret `ANTHROPIC_API_KEY`); (3) branch protection na `main` exigindo o check "CI Páginas"; (4) opcional: Vercel Preview Deployments; (5) testar 1× via Actions → *Run workflow* antes de confiar no cron das 5h.

**Nota operacional recorrente:** push pro GitHub é sempre do Gabriel na máquina dele — o Cowork não tem credencial. Os arquivos foram salvos direto em `C:\Economizei`; `node scripts/check-pages.mjs` rodou verde no sandbox (0 erros nos 5 HTML).

### 2026-06-23 — Sessão de estratégia de tráfego pago + criação de páginas

**Briefing inicial (resumo):** Gabriel vem consumindo conteúdo sobre página, tráfego pago e "foot traffic internet", como isso traz vendas, como criar várias campanhas no Google Ads focando em avaliações/credibilidade, e estudar métricas (custo por clique, custo por venda etc.) — começando com ~R$200 e "duplicando campanhas com alterações" pra melhorar números e vendas. Quis criar uma **automação de criação de página com subdomínio** pra divulgar o Economizei facilmente, prospectar clientes e gerar mais usuários/assinaturas, **pulando a etapa do orgânico** (lento demais pra quem tem tempo escasso), com um certo nível de investimento. Pediu uma **seção/documento** sobre criação de páginas e divulgação paga, e pediu explicitamente que eu **fizesse perguntas** sobre pontos vagos antes.

**Perguntas de clarificação (respostas do Gabriel):**
- **Objetivo do R$200:** *Cadastros grátis (topo de funil).*
- **Canal:** *Os dois ao mesmo tempo (Meta + Google).*
- **Escopo da entrega:** *Só pesquisa + estratégia (documento).*
- **Orçamento:** *Começo com ~R$200 e aumento se der retorno.*

**O que foi entregue:** `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` (pesquisa web → estratégia adaptada) + linha em Decisões (seção 8), entrada em Recursos (seção 10), cabeçalho "Última atualização" e este registro.

**Pushbacks honestos que precisei dar (e estão no doc):** (1) o playbook de tráfego pago que ele vê é de e-commerce — o funil dele é cadastro grátis no WhatsApp, métrica-rainha é **custo por ativação (1º cupom)**; (2) o canal certo é **Meta CTWA**, não o Google (sem demanda de busca pra capturar); (3) com R$200, **rodar os dois ao mesmo tempo mata o aprendizado** — recomendei Meta primeiro / Google depois, honrando o desejo dele de conhecer os dois de forma sequencial; (4) "duplicar campanhas" hoje causa sobreposição de leilão — o jeito certo é poucos ângulos + escala vertical + teste A/B oficial; (5) `financial-firewall`: R$200 pra aprender = ok, escalar só após W2 ≥ 30% (mídia não conserta retenção). Mantive o respeito à autonomia dele: as decisões dele foram acatadas, os riscos foram registrados.

**Pendências deixadas:** validar se o número do bot (Z-API) pode ligar ao Meta Business pra CTWA; ligar a leitura de código de campanha no 1º contato (reaproveita `/convidar`) pra atribuição; construir template de landing clonável + passo a passo de subdomínio na Vercel — só quando o Gabriel sair do "só estratégia".

### 2026-06-18 — Sessão de implementação de F2, F1 e F4 (funções de inteligência)

**Briefing inicial (verbatim):**
> "Vamos desenvolver a F2, F1, e F4 em ordem."

Precedido por um pedido de análise: "Planejar qual das alterações será mais complexa e qual será mais efetiva (...) a missão agora é deixar o economizei mais robusto e com funções que realmente façam diferença na vida do usuário." Entregue mapa de quadrante complexidade × efetividade das 12 funções + resumo de cada uma. Veredito: F5 (comparativo) é a mais complexa e a mais efetiva, mas bloqueada por densidade de dados; F2/F1/F4 são as mais efetivas construíveis já (recomendação F2→F1→F4).

**O que foi implementado (nesta ordem):**
- **Novo módulo `src/insights.js`** — funções puras de análise, sem I/O, separando a "inteligência" do acesso a dados (`supabase.js`) e dos templates (`formatter.js`).
- **F2 — Raio-X de categoria com conclusão:** `analisarRaioXCategorias` + `buscarHistoricoCategorias` (média da participação de cada categoria nos 3 meses anteriores). O `/gastos` agora conclui: maior categoria, se está acima/abaixo da média do próprio usuário, e candidato discricionário a corte. `montarMensagemGastos` ganhou 3º parâmetro opcional `analise`.
- **F1 — Inflação pessoal por item:** comando `/inflacao` + `analisarInflacaoPessoal` + `buscarHistoricoPrecoItens`. Preço unitário normalizado (`preco_total/quantidade`, robusto a item por peso); filtros de honestidade (2+ observações, ≥14 dias, variação 8–150% — descarta ruído de unidade).
- **F4 — Quanto você já economizou:** comando `/economia` + `calcularEconomia` + `buscarTotaisMensais`. Média móvel de 3 meses; `economiaAno` soma só os meses abaixo da média (copy honesta). Reforço de economia anual também no resumo mensal (`montarResumoMensal` ganhou 4º parâmetro `economia`).
- Boas-vindas atualizadas com `/inflacao` e `/economia`.

**Decisões honradas:** zero atrito (a IA conclui, o usuário não calcula nada); honestidade/`financial-firewall` (descarte de variação absurda em F1; copy de F4 afirma exatamente o que o número representa); F1/F2/F4 ficam Free (Camada 2/3 com o dado que já temos). F5 (comparativo) segue adiada por densidade; F3 ("onde cortar") fica pra próxima leva.

**Verificação:** `node --check` ok nos 5 arquivos; teste das funções puras com dados sintéticos (F1/F2/F4 + resumo mensal), saídas conferidas (inclui descarte correto de item de mesma semana e de variação abaixo do limiar em F1).

**Pré-requisitos de deploy:** **nenhuma migração** — todas as funções leem colunas que já existem (`preco`, `preco_total`, `quantidade`, `nome_canonico`, `categoria`, `compras.total/data_compra/tipo`). Deploy é só `git push` (Gabriel, na máquina dele). Recomendado `node --check src/*.js` local antes do push.

**Ressalvas honestas:** (1) F1/F2 dependem da qualidade do `nome_canonico`/`categoria` — itens mal canonicalizados podem não casar entre compras (não quebra, só reduz cobertura); (2) F1 usa `preco_total/quantidade` como preço unitário — cupons antigos sem `preco_total` caem no `preco`, e linhas com total-da-linha gravado em `preco` podem gerar comparação imprecisa pra aquele item; (3) F4 usa `tipo='mercado'` — compras não-mercado antigas mal classificadas (ver backfill pendente) podem entrar na média até serem renovadas.

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o ambiente Cowork não tem credencial. Nesta sessão o `node --check` rodou limpo nos 5 arquivos via sandbox.

### 2026-06-09 — Sessão de pesquisa de finanças → funções do bot

**Briefing inicial (verbatim):**
> "Então agora que a gente já tem esse documento, eu quero que você faça uma pesquisa extremamente profunda na internet, sobre assuntos relacionados à finanças do mercado, à finanças de gastos no dia a dia, e eu quero que você pegue cada dica e pense como que você pode transformar ela numa função pra o nosso bot. Então eu quero que você pesquise em vídeos, sites, tudo que seja relacionado à finanças pessoais, a gastos do dia a dia, gastos de mercado, gastos pessoais, e que todas as dicas que forem de ponto chave (...) consigam trazer um benefício de economia ou de melhor gasto para, o usuário, vamos tentar transformar ela numa função pra melhorar como você disse a etapa dois e três, de ter o que fazer com isso, e como trabalhar com a IA e os dados que a gente vai receber."

**O que foi entregue:**
- `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md` (novo): pesquisa web em 5 frentes (orçamento/50-30-20; economia no supermercado; finanças comportamentais; apps de comparação/cashback; hábitos de poupança/inflação pessoal/custo em horas) → **12 funções candidatas** organizadas em 3 tiers, cada uma com dica de origem, exemplo de mensagem, camada, veredito do Teste de Norte, triagem 🤖/🤝/🛠️/🧍, dado necessário, esforço e candidato Free/Pro. Tabela priorizada + sequência recomendada (F2 → F1 → F4 → F3). Fontes linkadas.
- `CLAUDE.md`: linha na tabela de Decisões (seção 8), entrada em Recursos (seção 10) e este registro.

**Princípios honrados na curadoria:** (1) só virou função a dica que a **IA consegue concluir a partir do dado do cupom** sem pedir trabalho novo da pessoa (zero atrito); (2) **honestidade** — gastos invisíveis/assinaturas reprovados porque o bot não vê fatura de cartão; (3) **bem-estar** — a "técnica do elástico no pulso" (que apareceu na pesquisa) foi **deliberadamente excluída**: não usamos desconforto físico como freio de comportamento, o combate ao impulso é informacional; (4) **nenhum preço/promessa fechado** — Free/Pro das funções é candidato a decidir, passa pelo `financial-firewall`.

### 2026-06-09 — Sessão de criação do documento de Posicionamento & Norte Estratégico

**Briefing inicial (verbatim):**
> "Vamos lá, agora eu quero trabalhar num documento de posicionamento que vai ficar registrado no Claude MD (...) tendo em vista de que o economizei, tem como função e tem como missão Fazer com que o brasileiro médio entenda os seus gastos e fazer a utilizacao da inteligência artificial pra, trazer conhecimento, informação, e inteligência por si só, ao gasto do brasileiro médio. (...) o norte que devemos seguir pras nossas funções, pra tudo que devemos seguir agora é pensar em, levar ao brasileiro médio a ciência de em que ele está gastando, como está gastando. e que isso traga pra ele uma habilidade financeira melhor. Faça com que ele gaste seu dinheiro melhor, faça com que ele economize dinheiro e tenha mais valor. Sobre o seu dinheiro."

**Decisões do Gabriel nas perguntas de clarificação:**
- **Onde registrar:** "Seção no CLAUDE.md + doc completo" — nova seção 1.5 no CLAUDE.md (lida toda sessão) + documento detalhado em `Economizei app/`.
- **Função do doc:** "Norte + filtro de decisão" — além de declarar missão/posicionamento, embutir um **Teste de Norte** acionável que toda feature/copy/roadmap precisa passar.

**O que foi entregue:**
- `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` (novo): missão por inteiro, o reframe de "leitor de cupom" → "inteligência financeira do brasileiro médio", o que somos/não somos, **3 camadas de valor** (Ciência → Inteligência → Habilidade), o **Teste de Norte** (pergunta-mãe + 4 sub-perguntas + exemplos PASSA/NÃO PASSA), mapa das funções atuais contra as camadas, implicações pro roadmap, guarda-rails e ritual de revisão.
- `CLAUDE.md`: nova **seção 1.5** (resumo do norte + camadas + Teste de Norte) + linha na tabela de Decisões (seção 8) + este registro + cabeçalho "Última atualização".

**Princípio-chave reforçado:** *"o cupom é a porta; a inteligência é o produto. A cada foto, a pessoa sai mais esperta com o próprio dinheiro."* O norte responde "para onde"; os princípios em vigor (zero atrito, grátis funciona, frame brasileiro) respondem "de que jeito". O norte não revoga nenhuma decisão anterior — é a lente que organiza as próximas.

### 2026-06-09 — Sessão de mudança de pasta + restauração + correção de skills

**Briefing (resumo):** Gabriel moveu a pasta do projeto de `E:\Economizei Bot` para `C:\Economizei` e pediu para (1) atualizar todas as referências ao caminho antigo, (2) corrigir a contagem inconsistente de skills e verificar a estrutura (`/engineering:system-design`).

**Achado crítico:** a pasta reconectada `C:\Economizei` era uma **cópia mais antiga** (estado 2026-06-07) — não continha os 2 documentos de 06-09 nem as edições do CLAUDE.md feitas nas sessões anteriores desta conversa (que tinham sido salvas na `E:\Economizei Bot`, agora desconectada/vazia). Decisão do Gabriel: **tornar `C:\Economizei` a versão oficial e restaurar tudo**. Os 2 documentos foram recriados a partir do conteúdo em memória e as edições do CLAUDE.md reaplicadas.

**O que foi feito:** (1) substituição de todas as referências `E:\Economizei Bot` → `C:\Economizei` em 12 arquivos + `.claude/settings.local.json` (mantidas as menções ao **nome** do projeto); (2) restauração dos 2 docs de 06-09 + reaplicação das seções/decisões/comandos no CLAUDE.md; (3) padronização da contagem de skills e instalação da `economizei-strategic-review` em `.claude/skills/`.

### 2026-06-07 — Sessão de fechamento das 2 ressalvas (idempotência + backfill)

**Briefing inicial (verbatim):**
> "Quero trabalhar nesses 2 erros que você me apontou anteriormente, leia o claude.md e as instruções de skill e vamops trabalhar nisso. Duas ressalvas honestas: dados antigos não são reescritos (linhas sem `preco_total` usam o cálculo antigo; cupons não-mercado já salvos entram na média como 'mercado' até serem renovados pelo fluxo novo). E descobri que a 'lei 5' do CODE_GUIDE — idempotência por messageId — está documentada mas nunca foi implementada: o webhook não deduplica, então mandar o mesmo cupom 2× cria 2 compras."

**O que foi implementado:**
- **Idempotência (lei 5):** `migration_2026-06-07_idempotencia_messageid.sql` (tabela `mensagens_processadas`, PK `message_id`); `registrarMensagemProcessada` + `purgarMensagensProcessadas` em `supabase.js`; `despacharComDedup` no `index.js` envolvendo o dispatch texto/imagem (loga `webhook_evento_duplicado` / `webhook_sem_message_id`); purga diária TTL 7d no cron das 7h (`scheduler.js`).
- **Backfill:** `supabase/backfill_2026-06-07_dados_antigos.sql` — Parte 1 reclassifica `tipo='outros'` (heurística por loja, PREVIEW antes do UPDATE); Parte 2 opcional preenche `preco_total` (no-op nos números, documentado).

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `migration_2026-06-07_idempotencia_messageid.sql` no SQL Editor; (2) opcional: rodar `backfill_2026-06-07_dados_antigos.sql` bloco a bloco, revisando os PREVIEWs; (3) `git push` (Gabriel, na máquina dele).

**Ressalvas honestas remanescentes:** (1) o dedup depende do Z-API enviar `messageId` — se o payload não trouxer, processa sem dedup (loga `webhook_sem_message_id`); confirmar no 1º cupom real que o campo chega. (2) idempotência protege contra reentrega do MESMO evento (retry do gateway), NÃO contra o usuário mandar a foto 2× de propósito (são messageIds diferentes) — isso é comportamento esperado. (3) backfill de `preco_total` não recupera precisão perdida de cupons antigos (imagem não guardada); por isso veio opcional/comentado.

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o Cowork não tem credencial. Nesta sessão o mount Linux do sandbox de novo serviu versões truncadas em cache dos `.js`, então `node --check` no sandbox falhou com falso-positivo (arquivos reais íntegros, validados por releitura dos blocos e fronteiras via Read). **Recomendado rodar `node --check src/*.js` localmente antes do push como gate final.**

### 2026-06-07 — Sessão de correção dos outputs incoerentes do bot

**Briefing inicial (verbatim):**
> "Tenho visto inconsistencias nas gravações dos cupons, mandando o mesmo cupom eu tive varios resultados, sendo 38,39 ou 40 produtos registrados do mesmo cupom (...) a mensagem que é mandada logo em seguida não faz sentido, ela sempre manda compra acima do padrão, precisamos colocar outros tipos de respostas dependendo da compra, ficar sempre alertando também não é ideal. E mais grave que isso é que os numeros não fazem sentido, normalmente o numero de porcentagem e o valor em reais é inventado ou não fazem sentido (...) faça o que for preciso para investigar esses outputs incoerentes."

**Diagnóstico (3 sintomas, nenhum era erro de fórmula — eram entradas ruins):**
1. **Contagem de itens oscilando (38/39/40):** Gemini rodava com temperatura padrão (~1.0) = não-determinístico. Sem reconciliação item×total, item perdido passava despercebido.
2. **Alerta sempre "acima do padrão":** `calcularMedia` misturava compras de mercado com não-mercado (farmácia/posto, valores baixos), derrubando a média; e só existia 1 template de follow-up (o alerta de "acima").
3. **Números que não batem:** duas fontes de verdade para "total" sem conciliação — `compras.total` (Gemini) vs. soma dos itens. E `itens_compra` só guardava `preco` (unitário), recalculando `preco×qtd` na categoria (dobra valor de item por peso).

**Decisões do Gabriel nas perguntas de clarificação:**
- **Escopo:** implementar os 4 fixes — determinismo do Gemini, total único de verdade, alerta inteligente em 3 níveis, e reconciliação item×total.
- **Comportamento do alerta:** "Você decide depois" → implementar a estrutura dos 3 níveis (abaixo/dentro/acima) mas deixar o gatilho **configurável por env**; afinar numa próxima rodada. Default escolhido: `ALERTA_MODO=relevante` (só fala quando foge do padrão).

**Implementado nesta sessão:**
- `supabase/migration_2026-06-07_coerencia_outputs.sql` (novo): `itens_compra.preco_total` + `compras.tipo` + índice. **Rodar antes do push.**
- `gemini.js`: `generationConfig {temperature:0, responseMimeType:'application/json'}`; `reconciliarItens` + log `gemini_reconciliacao_divergente`; `lerRecibo` escolhe a melhor das 2 tentativas via `_scoreReconciliacao`.
- `supabase.js`: grava `preco_total` e `tipo`; `calcularMedia` filtra `tipo='mercado'`; `buscarGastosPorCategoria` agrega por `preco_total` (fallback `preco×qtd`) + fatia resíduo `nao_identificado` fechando com o total do cupom.
- `alerts.js`: reescrito — `avaliarCompra` (níveis + limiares por env), `deveEnviarMensagem` (modo por env), `verificarAlerta` mantido como wrapper de compat.
- `formatter.js` + `charts.js`: `montarMensagemAlerta` recebe objeto de avaliação e tem 3 tons; label+cor de `nao_identificado`.
- `index.js`: usa `avaliarCompra`/`deveEnviarMensagem`; não-mercado nunca alerta.
- `.env.example`: `ALERTA_LIM_ACIMA`, `ALERTA_LIM_ABAIXO`, `ALERTA_MODO`.

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `supabase/migration_2026-06-07_coerencia_outputs.sql` no SQL Editor; (2) `git push` (Gabriel, na máquina dele). Opcional: ajustar as envs `ALERTA_*` no Railway.

**Pendências/ressalvas deixadas:** (1) linhas antigas de `itens_compra` sem `preco_total` caem no fallback `preco×qtd` — comportamento idêntico ao anterior, não retroativo; (2) `compras.tipo` antigas viram 'mercado' por default (não-mercado antigas entram na média até serem substituídas pelo fluxo novo); (3) a "lei 5" do CODE_GUIDE (idempotência via messageId) segue **documentada mas não implementada** — o webhook não deduplica por messageId; mandar o mesmo cupom 2× ainda cria 2 compras (fora do escopo desta sessão, candidato a próxima).

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o ambiente Cowork não tem credencial. Nesta sessão o mount Linux do sandbox serviu versões em cache defasadas de `formatter.js`/`CLAUDE.md`/`CODE_GUIDE.md`; as edições foram aplicadas nos arquivos reais (Edit guardou contra cache via "modified since read") e `node --check` passou nos 6 arquivos.

### 2026-06-07 — Sessão de criação do comando `/convidar` (indicação)

**Briefing inicial (verbatim):**
> "Vamos começar a trabalhar no comando compartilhar (...) quais benefícios e incentivos podemos dar ao usuario por fazer esse favor, eu estava pensando em talvez dar acesso limitado aos recursos do premium ou até ganhar mais cupons, podemos fazer por exemplo uma ação de compartilhar valer mais cupons e quando esse outro contato por esse link ativar o plano a pessoa ganha acesso aos benefícios do pro por tempo limitado."

**Achado que mudou o ponto de partida:** `/compartilhar` já existia (liga/desliga compartilhamento anônimo de preços). O comando de indicação virou **`/convidar`** (aliases `/indicar`, `/convite`) pra não colidir.

**Decisões do Gabriel nas perguntas de clarificação:**
- **Gatilho:** "2 marcos (ativação + conversão)" — recompensa quando o amigo manda o 1º cupom E quando vira Pro pagante.
- **Moeda da recompensa:** "Features Pro por X dias (sem mexer no limite de cupons)" — escolhida em vez de "mais cupons" (que furaria o teto de custo Gemini) e em vez de Pro completo.
- **Números:** confirmou os defaults — 7 dias na ativação (os dois lados), +30 dias na conversão (indicador), teto de 60 dias.
- **Comando final:** "faça a codagem e deixe tudo pronto para fazer o push."

**Implementado nesta sessão:**
- `supabase/migration_003_indicacoes.sql` (novo): colunas `codigo_indicacao` + `features_pro_ate` em `usuarios`; tabela `indicacoes` (1 linha por indicado, UNIQUE em `indicado_phone`).
- `src/supabase.js`: `gerarCodigoIndicacao`, `registrarIndicacaoPendente`, `concederFeaturesPro` (com teto), `ativarIndicacao`, `converterIndicacao`, `marcarProAtivo`, `buscarStatusIndicacoes`, `temFeaturesProAtivas` (helper de gate futuro) + `features_pro_ate` no select do `upsertUsuario`.
- `src/formatter.js`: `montarMensagemConvite`, `montarBoasVindasIndicado`, `montarAvisoIndicacaoAtivada`, `montarAvisoIndicacaoConvertida` + `/convidar` na lista de comandos das boas-vindas.
- `src/index.js`: handler `/convidar`, detecção de código no 1º contato, hook de ativação após cupom, endpoint `POST /admin/ativar-pro` (ativa Pro manual + dispara recompensa de conversão).
- `.env.example`: nova var `BOT_PHONE` (número do bot pro link `wa.me`).

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `supabase/migration_003_indicacoes.sql` no SQL Editor; (2) configurar `BOT_PHONE` no Railway; (3) `git push` (feito pelo Gabriel na máquina dele).

**Pendências/ressalvas deixadas:** (1) as funções Pro recompensadas (comparativo + alerta inteligente) ainda não existem no código — a recompensa está gravada mas só vira valor visível quando essas features forem implementadas e usarem `temFeaturesProAtivas()` como gate; (2) `/apagar` é citado na copy mas ainda não tem handler — quando for criado, deve limpar `indicacoes` também; (3) descoberto sistema de assinaturas Mercado Pago em construção paralela no `supabase.js` — o `/admin/ativar-pro` (PIX manual) seta `is_pro` direto e coexiste com o fluxo MP (`atualizarStatusAssinatura`).

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele; o ambiente Cowork não tem credencial. Edits de código são salvos direto em `C:\Economizei`. (Nesta sessão o mount Linux do sandbox serviu versões truncadas em cache desses `.js` — sintaxe foi validada por bloco isolado + revisão das fronteiras; recomendado rodar `node --check src/*.js` localmente antes do push como gate final.)

### 2026-06-07 — Sessão de debug: categoria/nome_canonico "NULL" no /gastos

**Briefing inicial:** Gabriel trouxe relatório de bug — `categoria` e `nome_canonico` saindo NULL em `itens_compra` mesmo com migration rodada e deploy ativo (commit ae58972). Pediu para rastrear o fluxo imagem → INSERT, adicionar logs de diagnóstico e corrigir a causa raiz, sem estimativas de tempo.

**Investigação (sem mexer no que estava certo):**
1. Lidos `gemini.js`, `supabase.js`, `index.js` — fluxo `lerRecibo → validarSchema → dados.itens → salvarCompra → INSERT` está correto ponta a ponta.
2. Pista decisiva: `validarSchema` **nunca** retorna `categoria` null. Logo, NULL no banco ⇒ o código rodando não é o esperado, OU a leitura está errada.
3. Git confirmou que ae58972 (HEAD) contém o código de categoria; descartada hipótese de working tree não commitado.
4. Adicionados logs temporários `diag_itens_antes_insert` / `diag_itens_gravados` / `diag_insert_itens_erro` em `salvarCompra`.
5. Teste `/gastos` no bot retornou a mensagem nova → confirmou que o código novo ESTAVA no ar (o comando nem existia na versão anterior).
6. Logs do Railway de um cupom novo (CSD, R$240,33): `diag_itens_gravados` mostrou `categoria:"padaria"` — ou seja, **o banco gravou certo**. As linhas NULL eram de cupons processados antes do container novo subir (20:07).
7. SQL pedido confirmou: cupons CSD com `com_categoria = itens` (40/40, 39/39) MAS `data_compra = 2026-05-31`. O `/gastos` filtra por `data_compra` no mês atual (junho) → escondia os dados de maio.

**Diagnóstico final:** nunca houve bug de gravação. Era leitura — `buscarGastosPorCategoria` filtra por `data_compra` (data impressa no cupom), e o cupom de teste era de maio.

**Decisão do Gabriel:** escolheu a **Opção 2** (manter agrupamento por `data_compra`, mas com fallback pro mês mais recente com dados quando o atual está vazio, avisando qual mês).

**Implementação:** `buscarMesMaisRecenteComGastos` nova em `supabase.js` (+ export); `mostrarGastos` em `index.js` com fallback + mensagem de aviso de mês; logs de diagnóstico removidos. Syntax check ok nos dois arquivos.

**Pendências deixadas:** (1) afrouxar a heurística `avaliarQualidadeCanonicoItem` que dá falso positivo de `pouco_simplificado`; (2) as linhas NULL antigas (código antigo) são inofensivas — `/gastos` as ignora, não dá pra preencher retroativamente (imagens não guardadas).

**Nota operacional recorrente:** o push para o GitHub é sempre feito pelo Gabriel na própria máquina — o ambiente Cowork não tem credencial do GitHub e o `.git/index.lock` precisa de `del .git\index.lock` antes do commit. Edits de código são salvos direto em `C:\Economizei`, mas o `git add/commit/push` é manual.

### 2026-05-08 — Análise da pesquisa e plano de lançamento *(condensado)*

> **Conteúdo completo arquivado em** `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` (seção 3.1).

**Princípios e diretrizes que permanecem em vigor desta sessão:**
- Filosofia "bom, barato e útil — grátis funciona de verdade, pago é melhor". Capitalizar EM CIMA do produto, nunca pensando inverso.
- Limite Free de 10 cupons/mês — técnico (custo Gemini), não artificial.
- Framing de marketing: "ser esperto / não dar mole / saber das coisas". Nome da app não é à toa.
- Antecipar 2 objeções no onboarding: "vai dar trabalho?" e "cupom já mostra isso, né?".
- Manter Z-API até CNPJ + 50–100 usuários (templates Meta restringem alerta proativo).
- Pricing 4-tier estrutural (Grátis / Individual / Família / Família+).

**Decisões desta sessão que foram revogadas/sobrescritas depois:** tag `beta_fundador` com benefícios (revogada 2026-05-19), paywall adiado 6 semanas (sobrescrita 2026-05-22), tags "em breve" nos planos pagos (removidas 2026-05-22). Detalhe completo no arquivo.

### 2026-05-15 — Redesign da landing + revisão de copy *(condensado)*

> **Conteúdo completo arquivado em** `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` (seção 3.2).

**O que permanece em vigor desta sessão:**
- Direção visual "Confiável e brasileiro" (estilo Nubank/PicPay), hospedado em Vercel.
- Headline "Não deixe o mercado te passar a perna" (verde em "Não deixe", vermelho em "passar a perna").
- Selo "vagas limitadas" (não "beta fundador").
- Seção "Problemas que resolvemos" com disclaimer de nomes fictícios.
- Bullets anti-planilha simplificados.
- Regra editorial: linguagem informal ("cê", "tá", "véi") **somente em roteiros de marketing** — nunca na landing, no bot, ou em documentos institucionais.

**Decisão desta sessão revogada depois:** promessa de "R$ 9,90 travado pra sempre" removida em 15/05; promessa de "3 meses grátis" também removida em 19/05. Histórico no arquivo.

### 2026-05-19 — Sessão de auditoria crítica externa + correções estruturais

**Briefing inicial:**
> "Analise o projeto economizei... reflexão e sugestões sobre aonde podemos melhorar em pontos especificos nas skills que usamos, na estrutra de 'empresa' ou fluxo de produção que fazemos e nas ferramentas que são usadas. (...) aja como um consultor de empresas extremamente críticos que aponta os erros sem dó e que consegue classificar eles por importancia e impacto."

**Aplicação:** auditoria entregue em `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` com 24 pontos classificados em 🔴/🟠/🟡/🟢 + 12 caminhos fora da caixa.

**Decisões/correções tomadas na mesma sessão:**

**Sobre Beta Fundador:**
> "Sobre a questão do beta fundador eu quero a EXCLUSÃO de qualquer coisa que mencione um benefício como 3 meses de graça, ou o preço travado, qualquer coisa do tipo, como você disse não é possível pra mim subsidiar o custo disso, por isso precisamos ter resultado pra ai oferecer algo assim. Por enquanto vamos continuar somente com estratégias basicas"
> *Aplicação: removido da seção 3 (Modelo de Negócio) toda menção a 3 meses grátis e preço travado; revogadas as decisões de 2026-05-08 e 2026-05-15 nesse ponto; "Tag de Fundador" virou "Cohort de Beta (uso técnico apenas)". Pendente: aplicar mesma remoção em `landing/index.html` e em `src/formatter.js` (templates de mensagem do bot).*

**Sobre áreas da empresa:**
> "Vamos colocar em pratica a ação A.2.1 faça as ações sugeridas e vamos discutir qual opção de indicadores eu tenho"
> *Aplicação: seção 5 do CLAUDE.md reescrita de 7 áreas para 3 áreas reais (Produto, Distribuição, Caixa) + lista de áreas suspensas. Indicadores únicos sugeridos por área, discussão pareada pendente em chat.*

**Sobre comparativo de mercados (Opção A):**
> "Sobre a decisão 2.4 vamos pensar em ja estruturar a feature na opção A, me mostre como poderiamos desenvolver a função com essa estratégia."
> *Aplicação: estrutura técnica de comparativo cross-user anonimizado proposta em chat (opt-in no onboarding, agregação por loja+CNPJ+produto canonicalizado, percentil de preço). Não codada ainda.*

**Sobre reframe de marca:**
> "Eu gostaria também de desenvolver mais sobre o reframe da marca, me fale mais sobre isso de assistente de compras e como podemos vender isso"
> *Aplicação: aprofundamento do reframe entregue em chat. Aplicação prática (testes A/B na landing, copy do bot) pendente.*

**Sobre divisão do CLAUDE.md:**
> "fico preocupado com a complexidade adicionada e como eu posso estar perdendo informações importantes as vezes, como acha que podemos fazer essa divisão da melhor forma?"
> *Aplicação: proposta de divisão modular com referências cruzadas no topo do CLAUDE.md (ver bloco "Estrutura modular planejada" na seção 1). Quebra física dos arquivos é decisão pendente do Gabriel.*

**Sobre skills criadas nesta sessão:**
> "crie a skill de auditoria de landing/copy review (...). Eu gostaria também de desenvolver mais sobre [dependency mapping] e até criar uma skill que ativasse sempre que um roadmap ou um planejamento fosse feito"
> *Aplicação: 2 skills criadas em `C:\Economizei\.claude\skills\` — `copy-review` e `roadmap-deps`. Pendente: empacotar como `.skill` e instalar no perfil global.*

### 2026-05-21 — Sessão de projeção 6 meses + estruturação de time

**Briefing inicial:**
> "Ative a skill que proteje e avisa o limite de contexto, leia o claude md e vamos desenvolver uma projeção para o projeto economizei bot. para isso crie um arquivo MD com 3 perspectivas, otimista, realista e pessimista. (...) tudo isso tem que ser comparado com o time que existe agora no projeto, para ter certeza que o esforço esta sendo recompensado de maneira correta, não só sendo desperdiçado."

**Sobre time e custo de oportunidade:**
> "vamos criar uma sessão para isso no claude MD para que seja divido entre as pessoas atribuidas no projeto e que se leve em consideração principalmente agora que só existe eu como colaborador do projeto e que ja tenho na minha rotina da semana 40 horas semanais trabalhadas que equivalem 65 reais cada hora."
> *Aplicação: criada seção 6 (Time & Capacidade) no CLAUDE.md com composição atual (só Gabriel, ~12h/sem, R$65/h), chapéus por área, plano de terceirização faseado e métricas de saúde do time.*

**Sobre tratar o projeto como negócio sério:**
> "vamos agora entender que o projeto do economizei não é só hobbie mas algo sério e profissional, que deve ter planejamento e que mesmo começando ja deve seguir boas praticas e ter um rumo estruturado."
> *Aplicação: registrado como decisão de 2026-05-21. Implica revisões obrigatórias nos gatilhos da projeção, atualização contínua de CLAUDE.md e instrumentação de métricas até a Semana 2.*

**Respostas-chave do Gabriel nas perguntas de clarificação:**

> Sobre horas reais: "~10–14h/semana (1-2h/dia mais alguns blocos no fim de semana)"
> *Aplicação: usado 12h/semana como média em todos os cálculos de opportunity cost.*

> Sobre régua de sucesso em 6-8 meses: "se eu trabalho 15 horas no projeto eu quero que no inicio de 2027 essas 15 horas semanais se traduzam em 975 reais ou mais toda semana"
> *Aplicação: convertido para MRR ≥ R$4.225/mês (15h × 4,33 sem × R$65/h) como régua de "trabalho que se paga sozinho". Documentado no doc de projeção como o ponto de break-even contínuo, não como payback do afundado.*

> Sobre time/contratação: "Eu + planos de contratação pequena como freelas. Isso cabe uma análise das funções que temos e que teremos no decorrer do projeto e ja planejar em terceirizar isso seja para uma automação ou para um terceiro que acaba tendo um custo melhor, mas não necessáriamente menor"
> *Aplicação: princípio "terceirizar não é necessariamente o mais barato, mas o que destrava o gargalo certo na hora certa" registrado na seção 6.3 com plano faseado por gatilho.*

**Comando final implícito:** estruturar tudo no CLAUDE.md (nova seção 6 + decisões + registro de comandos) + arquivo de projeção em `Economizei app/Projecao_6_meses.md`.

### 2026-05-26 — Sessão de reformulação da landing page

**Briefing inicial:**
> "vamos olhar a landing page, eu acho que o valor do produto ainda não está claro, vamos revisar as funções que temos no bot e vamos deixar mais explícito, queremos entregar funcionalidade também."

**Fluxo da sessão:**
1. Leitura completa do `CLAUDE.md`, `src/index.js`, `src/formatter.js`, `src/alerts.js`
2. Montagem de organograma visual do fluxo completo do usuário (onboarding 4 passos, fluxo de imagem, fluxo de texto, comandos, alertas, resumo mensal, limite gratuito)
3. Diagnóstico: landing apresentava o produto como "OCR glorificado" — não comunicava o valor real (comparação temporal, insight de hábito, resumo mensal automático, comparativo de mercados)
4. Planejamento aprovado antes de qualquer implementação → arquivo `Economizei app/Plano_Landing_Page_v2.md` criado
5. Implementação das 4 mudanças aprovadas em `landing/index.html`

**Decisões tomadas durante a sessão:**

> Sobre nomes de mercados nos mockups: "retire os nomes dos mercados e coloque nomes fictícios"
> *Aplicação: todos os mockups da landing usam "Mercado Central", "Atacadão do Povo" e "Mercado Bom Preço". Nomes reais de Fernandópolis (Pessotto, Sakashita, Souza) reservados para roteiros de marketing com contexto neutro, conforme diretriz do CLAUDE.md seção 7.1.*

> Sobre frase do Cenário 2: "retire essa frase 'sem pedir' por que parece ser algo importuno"
> *Aplicação: frase "sem pedir nada" removida de toda a seção de Cenário 2 (resumo mensal). Heading passou a ser "O mês inteiro em uma mensagem".*

> Sobre linguagem informal: "essas adaptações servem SOMENTE E EXCLUSIVAMENTE para marketing, nunca para o texto do bot ou para qualquer outro texto fora de roteiros de marketing"
> *Aplicação: corrigidos todos os "cê", "tá" e "Não deixa" encontrados na landing page. Regra registrada: linguagem informal (cê, tá, né, ó) é permitida apenas em roteiros de TikTok/Reels/scripts de campanha — nunca na landing, no bot (`formatter.js`) ou em documentos institucionais.*

**Mudanças implementadas em `landing/index.html`:**

| Mudança | Descrição |
|---|---|
| Hero mockup enriquecido | Substituiu bubble genérico por: (1) alerta de 22% acima da média + insight de doces/chocolates, (2) teaser "Em breve: comparativo entre mercados" com visual roxo/dashed |
| Passo 3 reescrito | Título: "Você descobre o que ninguém te conta". Descrição explica relatório automático mensal + alerta com percentual exato |
| Nova seção `#na-pratica` | 3 cenários com mockups de conversa reais: análise imediata, resumo mensal (com callout "Doces e chocolates — R$ 52,40"), comparativo de mercados em desenvolvimento |
| Nova seção `#erros` | 5 cards de situações de erro com a mensagem exata que o bot envia em cada caso. Frame: "o bot nunca some — sempre te orienta" |
| Correções de ortografia | "Não deixa" → "Não deixe" (headline), 2× "cê" → "você", 2× "tá" → "está"/"vai para" |

**Estado final da página:** ~2.700 linhas. Ordem das seções: Nav → Hero → Credibilidade → Empatia → Como funciona → Na prática → Objeção → E se o cupom não ler? → Anti-planilha → Pricing → Privacidade → Como começar → Rodapé.

**Deploy:** via Git push (repositório conectado ao Vercel — deploy automático após push).

### 2026-06-02 — Sessão de sistema de reengajamento

**Briefing inicial:**
> "Eu quero criar um aviso depois de 7 dias da primeira mensagem da pessoa, para que ela se lembre de mandar o cupom, quero que essa mensagem não tenha um tom de cobrança mas de amizade lembrando que esta ali e que se importa, podemos criar mais mensagens em outros periodos de tempos sem resposta do usuario ou entre respostas, me de sugestoes para mais possibilidades."

**Decisões e definições aprovadas:**

4 segmentos de reengajamento definidos:
- **Segmento A (onboarding sem ação):** dia 2 e dia 7 após cadastro sem nenhum cupom enviado
- **Segmento B (usuário ativo que sumiu):** 3, 10, 30 e 60 dias após a última compra registrada
- **Segmento C (fim de mês):** dias 26–27 do mês para quem tem cupons no mês mas não recebeu o resumo ainda
- **Segmento D (limite):** ao atingir 8 de 10 cupons gratuitos no mês

**Princípio de tom aprovado:** amizade, não cobrança. Mensagens curtas, sem urgência artificial, sem emojis em excesso. Oferecer a opção `/apagar` no lembrete de 60 dias (respeito à saída).

**Regras técnicas definidas:**
- Máximo 50 usuários por segmento por execução do cron (respeitar Z-API)
- 1.5s de delay entre cada envio
- 1 lembrete por usuário por execução (prioridade: D > C > B > A)
- Nova tabela `lembretes_enviados` com UNIQUE por `(phone_number, lembrete_id, mes_referencia)` — evita duplicatas
- Cron diário às 10h (America/Sao_Paulo) integrado ao `scheduler.js` existente

**Entregável desta sessão:** `PROMPT_REENGAJAMENTO.md` — prompt autocontido para Claude Opus implementar todos os arquivos e funções necessárias.

### 2026-06-06 — Sessão de gastos por categoria + qualidade de canonicos

**Briefing inicial:**
> "Analise todo o código da pasta do projeto e leia o claude md para entender o projeto e vamos discutir como podemos colocar um resumo de gastos melhor, por exemplo pra desde a primeira compra a IA ja fazer uma separação de categorias e assim criar uma lista de gastos, pensando nisso como podemos fazer com que um agente responda as mensagens no whatsapp com dados, por exemplo gerar um pdf ou algo que seja além de somente letras e emojis. Vamos pensar também em como programar a comparação entre mercados, como podemos ja começar a estruturar isso para quando tivermos dados suficientes"

**O que foi implementado:**
- `src/charts.js` (novo): gera URL de gráfico doughnut via QuickChart.io — zero dependências, só GET + JSON codificado na URL
- `supabase/migration_categorias_precos.sql` (novo): adiciona `categoria` e `nome_canonico` em `itens_compra`, `opt_out_precos` em `usuarios`, cria tabela `precos_mercado`
- `gemini.js`: prompt atualizado para extrair `categoria` (10 valores) + `nome_canonico` por item; `avaliarQualidadeCanonicoItem()` rastreia canonicos suspeitos; logs `canonico_suspeito`
- `supabase.js`: `salvarCompra` passa categoria/canonico; `registrarPrecosMercado` (fire-and-forget); `buscarGastosPorCategoria`; `setOptOutPrecos`
- `formatter.js`: `montarMensagemGastos`, `montarMensagemPrivacidade`, `nomeDoMes` exportado
- `zapi.js`: `enviarImagem` (POST send-image para Z-API)
- `index.js`: comandos `/gastos`, `/privacidade`, `/nao-compartilhar`, `/compartilhar`; `mostrarGastos()` envia gráfico + texto
- `monthlySummary.js`: após resumo mensal, envia gráfico de categorias do mês
- `supabase/monitoring_canonicos.sql` (novo): 5 queries de auditoria de qualidade dos canonicos

**Aprendizado técnico crítico:**
`itens_compra` NÃO tem coluna `criado_em`. O timestamp de data existe em `compras.data_compra`. Toda query SQL que precise filtrar itens por data deve fazer `JOIN compras c ON c.id = ic.compra_id` e filtrar por `c.data_compra`. Erro descoberto ao tentar rodar `monitoring_canonicos.sql` antes de entender o schema. Arquivo corrigido.

**Pendente no próximo deploy:**
1. Rodar `supabase/migration_categorias_precos.sql` no SQL Editor do Supabase (obrigatório antes do push)
2. Verificar colunas criadas com a query de verificação do arquivo
3. `git push` para Railway ativar todas as features novas

### 2026-06-04 — Sessão de estruturação do sistema de skills + limpeza do CLAUDE.md

**Briefing inicial:**
> "Eu tenho visto pouco a utilização dessas skills nos meus utlimos chats, devo dar algum comando para que elas sejam usadas ou talvez esteja usando de forma errada. Me fale mais sobre e juntando esse assunto quero desenvolver instruções para o projeto para que ele seja estruturado de uma melhor maneira, sabendo da estrutura do claude e suas divisoes em projetos e skills desenvolva essa descrição para que eu possa usar"

**Diagnóstico:** as 14 skills criadas estavam em `C:\Economizei\skills\` — pasta que Claude não auto-descobre. O path padrão de descoberta é `.claude/skills/`. Sistema também precisava de **instruções de projeto** que carregam em toda sessão para amarrar tudo.

**Ações executadas:**
1. Movidas as 14 skills + 2 antigas (`copy-review`, `roadmap-deps`) + `README.md` para `C:\Economizei\.claude\skills\`.
2. Criado `C:\Economizei\PROJECT_INSTRUCTIONS.md` com boot sequence, gatilhos automáticos das 6 transversais, formato `dual-format`, ritual de fim de sessão.
3. Adicionado bloco no topo do CLAUDE.md apontando para o sistema de skills + project instructions.

**Comando complementar do Gabriel:**
> "Vamos aplicar essa instrução sugerida no início do claude.md e tente reduzir ele retirando tudo que for obsoleto, para segurança transfira para outra pasta"

**Ações de limpeza:**
- Criada pasta `Economizei app/arquivo-historico/` com arquivo `CLAUDE_arquivo_2026-06-04.md`.
- Movidas 3 decisões revogadas (paywall adiado, tag `beta_fundador` com benefícios, promessa "R$ 9,90 vitalício") da seção 7 do CLAUDE.md.
- Condensadas as sessões de 2026-05-08 e 2026-05-15 da seção 11 — apenas o que permanece em vigor fica no CLAUDE.md, conteúdo completo (briefings + comandos verbatim) preservado no arquivo histórico.
- Bloco "Estrutura modular planejada (em transição)" reescrito como "Arquitetura modular atual" refletindo a realização via sistema de skills.
- Linha "Última atualização" no topo movida para 2026-06-04.

**Princípio reforçado:** sistema de skills + project instructions resolveu o problema de modularização sem precisar quebrar o CLAUDE.md em múltiplos arquivos `.md`. A memória institucional permanece em 1 documento; a operação é modular via skills disparadas por gatilho.

---

## Como usar este arquivo

**No início de cada sessão no Cowork ou Claude Code:**
> "Leia o CLAUDE.md antes de começar. Hoje quero trabalhar na área de [Marketing / Produto / Financeiro / etc.]."

**Para atualizar:**
> "Adicione no CLAUDE.md em Decisões Tomadas: [data] — [decisão] — [racional]"
> "Marque como concluído no roadmap: [item]"
> "Adicione em Aprendizados: [insight do mês]"
> "Adicione em Histórico de Comandos: [comando importante]"
