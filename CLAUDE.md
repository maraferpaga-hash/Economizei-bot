# 🧠 Memória Institucional — Economizei

> **🛠️ Sistema de skills ativo:** veja `C:\Economizei\.claude\skills\README.md` (índice das 18 skills + 10 regras de ouro).
> **🚀 Instruções do projeto:** veja `C:\Economizei\PROJECT_INSTRUCTIONS.md` (boot sequence + comportamentos default).
> **💻 Memória técnica de código:** veja `C:\Economizei\CODE_GUIDE.md` (stack, padrões, decisões técnicas em vigor). Ler quando a sessão envolver código.
> **🤖 Máquina Local & Agenda:** veja `C:\Economizei\AGENDA.md` (fila da automação de **código**, executada **localmente** pelo Gabriel via Claude Code `/tarefa`, com o **financeiro blindado** pelo `check-firewall.mjs` + revisão humana — + painel de ações do Gabriel). Guia em `Economizei app/Automacao_Maquina_Noturna.md`. **O GitHub Actions foi descontinuado** (custo/complexidade não compensaram pra 1 pessoa). Em toda sessão, ofereça puxar o estado da agenda (o que está em revisão, o que está pronto, pendências humanas).
> Leia os 4 no início de cada sessão, junto com este arquivo.
>
> **📝 Nota de correção (2026-07-02):** onde este arquivo diz "cod-0030..0036" (cadeia do Alerta Pro), leia **cod-0030..0035** — a cadeia vai só até o cod-0035 (matching → acompanhamentos → supérfluo → comandos → NL → alerta de limite). O "..0036" é um erro de numeração antigo; a AGENDA já está corrigida. Não há tarefa cod-0036.

> Este arquivo é o **cérebro da empresa**. Leia-o no início de cada sessão para ter contexto completo
> sobre o produto, a estratégia e o estado atual da operação.
> Atualize-o sempre que houver decisões importantes, mudanças de direção ou novos aprendizados.

---

## 1. 🏢 Identidade da Empresa

**Nome:** Economizei
**Categoria:** SaaS / B2C
**Estágio:** Pré-lançamento — produto funcional (MVP testado uma vez sem escala), em fase de validação comercial
**Operação:** 1 pessoa (fundador, Gabriel), com vasto conhecimento em administração
**Localização do fundador:** Vancouver, BC, Canadá — saída fiscal do Brasil declarada à Receita Federal. Empresa jurídica será aberta em British Columbia (BC). Ver seção 3 para impacto no modelo de pagamentos.

> ⚠️ **Pré-requisito bloqueador — Empresa BC desbloqueia: Meta Ads, Meta Business Manager, Hotmart (planos anuais + afiliados) e Wise Business (recebimento de PIX).** Sem a empresa aberta, nenhuma dessas integrações pode ser configurada legalmente. Passo a passo completo em `Economizei app/Abertura_Empresa_BC_2026-06-24.md`.
>
> ⏸️ **ADIAMENTO (decisão 2026-07-09):** a abertura da empresa em BC **não será possível antes de OUTUBRO/2026**. Tudo que depende dela (Meta Ads, Hotmart, Wise, afiliados — monetização em escala) fica bloqueado até lá. A janela jul→out/2026 vira **tempo de construção**: ver seção 7.2 (Horizonte de Longo Prazo) e `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`.
>
> **Custos esperados (aviso):**
> - Abertura (uma vez): ~CAD 380–600 (~R$1.500–2.400) — NAR (CAD 30) + incorporação (CAD 350) + serviço opcional (CAD 50–200)
> - Manutenção anual: ~CAD 650–2.000 (~R$2.600–8.000) — Annual Report (CAD 45) + contador T2 obrigatório (CAD 500–1.500) + endereço registrado se precisar (CAD 100–200) + conta bancária (CAD 0–300)
> - Imposto corporativo sobre lucro: **11% combinado** (federal 9% + BC 2%) até CAD 500k — zero enquanto o negócio tiver prejuízo operacional
> - Meta Ads: **sem os 12,15% de impostos brasileiros** (economia real em cada real gasto em mídia)
> - Esses custos entram no orçamento antes de iniciar. A economia nos ads e a viabilidade jurídica de receber pagamentos internacionais justificam o investimento.
**Restrição operacional:** ~12h/semana (média 10–14h, ver seção 6)
**Praça inicial de lançamento:** Fernandópolis-SP e região (interior noroeste de SP) — ver seção 7.1
**Última atualização:** 2026-07-24 (6ª sessão) — **`/entregar` fechou o webhook sem auth (N1 da Auditoria Externa) e entregou o bloco de gasto supérfluo + intent `gasto_por_termo`** (cod-0053/cod-0032/cod-0034, `origin/main` até `b923805`; detalhe na seção 8). Anterior (5ª sessão) — **Pagamentos "dois trilhos" decididos** (Stripe PSP direto + MoR/afiliados p/ o que escala sem o Gabriel; IOF 3,5% e obrigações da empresa BC registrados na seção 3 — docs `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` + `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`; auditoria externa em `Auditoria_Externa_2026-07-17.md`). Anterior (4ª sessão) — **Vigilância agendada criada** (sentinela semanal dom 20h + checkpoint N2 mensal + lembrete de sexta; só leem/reportam, nunca commitam/tocam dinheiro — ver Decisões, seção 8). Anterior (3ª sessão) — **CLAUDE.md enxugado (~236 KB → ~60 KB, limite de 800 linhas restaurado):** esta linha deixou de ser log corrido de sessões; a tabela de Decisões (seção 8) mantém só as últimas ~21 comprimidas (versões completas de TODAS em `Economizei app/arquivo-historico/DECISOES_arquivo_2026-07-15.md`); a seção 11 virou "Comandos & regras permanentes" (histórico narrativo integral em `Economizei app/arquivo-historico/SESSOES_arquivo_2026-07-15.md`); órfãos da raiz arquivados. **Regra de teto por sessão (nova, inegociável):** cada sessão registra no máximo 1 linha na tabela de Decisões (com pointer pro doc de sessão em `Economizei app/`) + 1 frase aqui; verbatim na seção 11 SÓ se criar regra permanente; o detalhe completo mora no doc de sessão. Diagnóstico: `Economizei app/Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md`.

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

> ⚠️ **"A classificação dos itens é o CORAÇÃO do Economizei."** *(declarado pelo Gabriel em 2026-06-27 — princípio inegociável)*
> Toda a inteligência do produto — gastos por categoria, inflação pessoal, comparativo entre mercados, alerta de supérfluo, acompanhamento personalizável — **depende de o item ter sido lido, nomeado (`nome_canonico`) e categorizado de forma precisa e sem erro**. Se a classificação erra, todo "andar de cima" mente: o número fica errado, o alerta dispara à toa, a busca por "cerveja" não acha a cerveja. Por isso:
> - **Classificar certo vem antes de qualquer feature nova.** Função que dependa de leitura do item só é tão boa quanto a classificação por baixo.
> - **Mexeu em algo que afeta extração/categoria/`nome_canonico`? Roda os testes de regressão de classificação** (corpus de cupons reais) **antes de subir.** Nunca "no olho".
> - **Tratar como dado de alto risco:** prefira a saída segura (não inventar item/categoria) a uma classificação errada que parece certa. `temperature:0` + reconciliação item×total + rastreio `canonico_suspeito` existem por isso — manter e fortalecer, nunca afrouxar sem teste.
> - **Detalhe técnico e invariantes:** `CODE_GUIDE.md` (regra "Classificação é invariante crítico").

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

**Fluxo de pagamento — ARQUITETURA "DOIS TRILHOS" (decidido 2026-07-17; docs: `Economizei app/Parceiros_Pagamento_Empresa_BC_2026-07-17.md` + `Economizei app/Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`):**

> **Contexto:** Gabriel declarou saída fiscal do Brasil e abre empresa em BC (Canadá, out/2026). O Mercado Pago exige residência brasileira e foi abandonado. A **empresa BC reabre o Stripe** (antes bloqueado): conta Stripe canadense aceita PIX + PIX recorrente (Pix Automático) + cartão, liquidando em **CAD**. Decisão do Gabriel (2026-07-17): rodar **dois trilhos em paralelo**, cada um pra uma fonte de cliente. Os dois terminam no mesmo `POST /admin/ativar-pro`, que liga o `is_pro` — o bot não sabe por qual trilho a pessoa pagou.

| Trilho | Plataforma | Fonte de cliente | Papel | Custo |
|---|---|---|---|---|
| **A — DIRETO (PSP)** | **Stripe** (conta BC) | Você traz (WhatsApp, orgânico, seus ads, landing) | Base de margem alta; mensal + anual + cartão, recorrência automática | Baixo (taxa Stripe; **comprador paga IOF ~3,5%** por ser cross-border) |
| **B — AFILIADOS (MoR)** | **Hotmart** (default) — Braip a checar p/ fit-assinatura | Terceiro traz (afiliado vende por você) | Distribuição que escala sem você; só nos **anuais** | Alto (~9,9% + comissão 20–25%); só sobre venda incremental |

> **Por que os dois:** margem máxima em quem o Gabriel traz (Trilho A) + exército de afiliados pra quem ele não alcança (Trilho B). MoR não precisa ser Hotmart — é o maior marketplace + payout internacional via Payoneer confirmado, mas **elegibilidade de produtor não-residente é item a confirmar direto com cada plataforma**. Risco #1 = conflito de canal (afiliado "roubar" quem viria direto): mitigado por afiliado-só-no-anual + funil direto primário + regra anti-lance-em-marca.

**📊 Dados fiscais registrados (jul/2026 — confirmar com contador antes de virar premissa; fontes nos docs):**
- **IOF Trilho A (PSP cross-border):** **3,5%** sobre cartão internacional / câmbio p/ pessoa física (unificado desde jul/2025, Decreto 12.499/2025 restabelecido pelo STF). Pago pelo COMPRADOR brasileiro → afeta conversão e o preço que ele vê. Trilho B (MoR doméstico) **não** tem IOF pro comprador.
- **Imposto corporativo BC:** **~11%** combinado (9% federal + 2% BC) nos 1ºs CAD 500k de active business income, via Small Business Deduction (exige qualificar como **CCPC**); acima de 500k = 27%. Zero enquanto houver prejuízo operacional.
- **GST/HST:** limiar small supplier **CAD 30.000** (receita mundial em 4 trimestres); abaixo, registro voluntário (recupera imposto de despesas via ITCs; venda a cliente BR tende a ser export zero-rated — confirmar). **PST-BC:** registro próprio, provável não-incidência em serviço digital exportado (confirmar).
- **T2 (imposto corporativo):** obrigatório todo ano mesmo sem imposto a pagar; vence 6 meses após o fim do ano fiscal; saldo devido 2–3 meses após year-end. **Annual Report** BC ~CAD 45/ano.

**Estrutura anterior (Hotmart anual + Wise BRL mensal, 2026-06-24) — agora é um SUBCONJUNTO do Trilho B + o mensal:** ⚠️ furo a validar — uma fonte indica que **Wise não saca pra fora de US/EU**; confirmar se o Wise Business BRL→CAD do mensal fecha, senão o Stripe absorve o mensal também. Detalhe do fluxo Hotmart/afiliados abaixo:

| Camada | Plataforma | Quem paga | Como ativa |
|---|---|---|---|
| **Free** | — | Ninguém | Automático no 1º contato |
| **Mensal** (R$9,90–R$22) | **PIX → Wise BRL** | Usuário faz PIX p/ conta BRL do Wise | Gabriel ativa `is_pro` manualmente (até 1h) |
| **Anual** (R$99–R$220) | **Hotmart** | Checkout Hotmart (cartão/PIX) | Webhook Hotmart → endpoint `/admin/ativar-pro` → automático |
| **Anual via afiliado** | **Hotmart** | Checkout via link rastreável do afiliado | Mesmo webhook; afiliado recebe comissão recorrente |

**Por que Hotmart para o anual:**
- Hotmart paga direto para conta bancária canadense (não-residentes suportados)
- Cuida de nota fiscal brasileira, chargebacks e renovação automática
- Taxa ~9,9% + R$1/transação — aceitável no ticket anual (≈11% no R$99); inviável no mensal (≈30% no R$9,90)
- Suporta **programa de afiliados com comissão recorrente** — afiliado ganha em cada renovação

**Programa de afiliados (decidido 2026-06-24):**
- Planos elegíveis: **somente anuais** (R$99 / R$150 / R$220) — margem suporta comissão
- Comissão: **20–25%** do valor da venda + recorrente em cada renovação anual
- Perfis: afiliação aberta no marketplace Hotmart + recrutamento direto de influencers de finanças/economia
- Fluxo: link do afiliado → checkout Hotmart (coleta WhatsApp + pagamento) → webhook → bot ativa Pro e manda boas-vindas
- **Pendência técnica:** construir webhook listener do Hotmart que chama `/admin/ativar-pro` com o número de WhatsApp do campo customizado do checkout

**Por que Wise BRL para o mensal:**
- Wise Business vinculado à empresa canadense tem dados de conta BRL que aceitam PIX
- Usuário paga PIX normalmente → Gabriel converte para CAD no Canadá
- Fluxo legal e limpo para não-residente com saída fiscal declarada
- Volume baixo do mensal torna a ativação manual aceitável no curto prazo

**Renovação:**
- Anual (Hotmart): automática no cartão; boleto/PIX lembrado pelo Hotmart
- Mensal (PIX manual): lembrete no dia 25 via bot

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

### 7.2. 🔭 Horizonte de Longo Prazo *(criado 2026-07-09 — Empresa BC adiada pra outubro/2026)*

> **📄 Documento completo:** `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` (contexto, 2 frentes, fases sugeridas, pontos de discussão). Esta seção é o resumo lido em toda sessão.

**Contexto:** a abertura da empresa em BC **só será possível a partir de outubro/2026**. Meta Ads, Hotmart, Wise e afiliados ficam bloqueados até lá — logo, **monetização em escala está estruturalmente pausada**. A janela jul→out/2026 é tempo de construção: validar o produto no Brasil (a métrica é retenção W2, não receita) e usar a Máquina Local pra construir a fundação do que vem depois. **Janela de planejamento da AGENDA: até 2 meses à frente** (não mais só a fila imediata).

**As 2 frentes-semente (aguardam sessão de desdobramento — NADA é fila ainda):**

1. **Ingestão multi-documento financeiro.** Hoje o bot só vê cupom (foto). Expandir o mesmo gesto zero-atrito pra: fatura de cartão de crédito (PDF), comprovante de PIX, notificação de banco, recibo em PDF/foto de qualquer tipo — a pessoa manda o arquivo, o bot entende, classifica e devolve insight. Destrava a G1 (assinaturas/gastos invisíveis), reprovada em 06-09 justamente por "o bot não vê fatura". ⚠️ Dado muito mais sensível que cupom — processa-em-memória-e-descarta + LGPD valem em dobro; a classificação continua sendo o coração.
2. **Internacionalização.** Sequência: **Canadá/Vancouver primeiro** (Gabriel está lá — recibos reais pra testar, empresa BC, mercado local), depois EUA, depois Europa. Implica: i18n das mensagens, multi-moeda, formatos de recibo por país (GST/PST no Canadá), leis de privacidade (PIPEDA/GDPR) e — o ponto mais duro — **canal**: WhatsApp é fraco no Canadá/EUA; a premissa "WhatsApp é o produto" não viaja sem uma decisão nova de canal.

**Regras que continuam valendo:** firewall financeiro intocado (as frentes são 100% não-financeiras até o gate humano); Teste de Norte pra toda feature nova; e Fernandópolis continua sendo a validação — o longo prazo **não rouba a prioridade da fila atual** (deploy do Agente + Leva 2 + Alerta Pro vêm antes de qualquer semente).

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

> **Tabela viva: só as últimas ~21 decisões, comprimidas.** As versões COMPLETAS de todas as decisões (incluindo estas) estão em `Economizei app/arquivo-historico/DECISOES_arquivo_2026-07-15.md`; anteriores a 2026-06-04 também em `CLAUDE_arquivo_2026-06-04.md`. Regra (skill `economizei-memory-system`): máx. ~30 linhas; ao passar, arquivar mantendo ~20. Cada sessão adiciona NO MÁXIMO 1 linha, com pointer pro doc de sessão.

| Data | Decisão | Racional / pointer |
|------|----------|----------|
| 2026-07-24 | **`/entregar` fechou o buraco N1 da Auditoria Externa (webhook sem auth) + entregou 2 tarefas do Alerta Pro/Agente — cod-0053/cod-0032/cod-0034 no `origin/main`** | `autenticarWebhook` (segredo no path/header, fail-closed com a env); bloco de gasto supérfluo no `/gastos`/resumo mensal; intent `gasto_por_termo` no Agente. 4 commits (`6cadcb8`..`b923805`); push final com `--no-verify` consciente (autorizado) — pre-push comparou contra o patch do firewall (`27fcc16`, também reconciliado agora) que se autoacusa por design. Pendência humana: `ZAPI_WEBHOOK_TOKEN` no Railway + reconfigurar Z-API (ver AGENDA). |
| 2026-07-17 | **Pagamentos "dois trilhos": Stripe (PSP direto, margem alta) + MoR/afiliados (Hotmart default, Braip a checar) — os dois ligam `is_pro` no mesmo `/admin/ativar-pro`** | Empresa BC reabre o Stripe (PIX+recorrente+cartão, liquida CAD); Trilho A = cliente que o Gabriel traz, Trilho B = afiliado vende por ele (só anual). Registrados na seção 3: IOF 3,5% (comprador cross-border), BC ~11% corp/GST 30k/T2. MoR não-Hotmart possível — não-residência a confirmar por plataforma. Bloqueado até BC out/2026; webhooks = zona financeira humana. Também nesta sessão: auditoria externa (`Auditoria_Externa_2026-07-17.md`) achou 🔴 `/webhook` sem auth + bypass firewall por rename ainda aberto. Docs: `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` · `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md` |
| 2026-07-15 | **Vigilância agendada: 3 tarefas recorrentes (sentinela dom 20h · checkpoint N2 dia 1 8h30 · lembrete sexta 9h) + mistério do PAINEL.html resolvido** | Sentinela: AGENDA×git, firewall, testes, anti-A9, copy×features, e regenera o `Projeto_Claude_CONTEXTO` quando o estado muda (relatório em `RELATORIO_SENTINELA.md`); tarefas só leem/reportam — nunca commitam nem tocam dinheiro; rodam com o app aberto. `PAINEL.html` untracked vem da tarefa agendada `economizei-painel-semanal` (segundas 7h32) — decidir git ou `.gitignore`. Nota: "1%" no Projeto do Claude = capacidade ocupada, não uso; CONTEXTO se mantém por substituição, nunca acúmulo |
| 2026-07-15 | **CLAUDE.md enxugado (−75%) + regra de teto por sessão + órfãos da raiz arquivados** | Limite de 800 linhas estourado (1.187); sessões registradas em 4 lugares redundantes. Zero perda: tudo em `arquivo-historico/`. Doc: `Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md` |
| 2026-07-15 | **Instruções + Contexto do Projeto Claude — divisão de papéis "plano-e-segue"** | Claude executa o que domina anunciando plano em 3 linhas; Gabriel fica com dinheiro/deploy/estratégia. Docs: `Projeto_Claude_INSTRUCOES_2026-07-15.md` + `Projeto_Claude_CONTEXTO_2026-07-15.md` (a pasta vence em conflito) |
| 2026-07-15 | **Frente 1 desenhada: ingestão multi-documento começa por PIX (cod-0060 feito; cod-0061/0062 promovidas)** | PIX = `compras.tipo='pix'` (sem tabela nova); Gemini classifica via `tipo_documento`; PIX fora da média e de `precos_mercado`; corrigir `registrarPrecosMercado` pra `tipo==='mercado'`. Doc: `Desenho_Ingestao_Multi_Documento_2026-07-15.md` |
| 2026-07-15 | **Fila reabastecida (cod-0034/0032/0033) + Frente 2 = repensar canal (Plaid/app, não WhatsApp-diáspora)** | Leva 2 continuada (cod-0043+) travada pelo `perguntas_log` inexistente pré-lançamento; Plaid muda o produto → sessão própria. cod-0041/0042/0051/0052 commitadas/pushadas (`c355d74`..`a40110f`, `origin/main`) |
| 2026-07-13 | **6 commits da Máquina pushados + comando `/entregar` (aprovação dupla + checagem BLOQUEANTE de migrations)** | `npm run check` verde + "APROVO" literal; cruza diff com migrations/envs ANTES do push (anti-A9); reconciliação automática da AGENDA mata a memória stale. Commits `7082535`/`473ea18`/`86dbb64`/`0dc9159`/`0b81181`/`9182b91` |
| 2026-07-13 | **Leva 2b fechada: cod-0041 + cod-0042 — Agente com 10 intents** | `comparativo_mercados`, `gasto_superfluo`, `duvida_sobre_bot` (lista viva, não consome cota, custo zero de LLM); 284/284 testes; sem migration/env nova. ⚠️ `PAINEL.html` untracked na raiz, origem desconhecida |
| 2026-07-10 | **Auditoria Integral (6/10 frentes): firewall com 8 lacunas + bypass por rename 🔴; copy de indicação e fluxo MP 🔴** | Patch pronto (aplicação humana — arquivo protegido); `/assinar` ainda gera checkout MP abandonado; cod-0051/0052 + aud-01..04 criadas. Doc: `Auditoria_Integral_2026-07-10.md` |
| 2026-07-10 | **Gate Pro desdobrado: Pro vê até 10 comparativos (`COMPARATIVO_MAX_PRO`); teaser Free com upsell `/planos`; entrega doc-only** | Código financeiro não sai das mãos do Gabriel; recompensa de indicação (`features_pro_ate`) passa a valer algo real. Doc: `Gate_Pro_Desdobramento_2026-07-10.md` |
| 2026-07-09 | **Recibo Canadá MVP enfileirado (cod-0065)** | Reusa o pipeline; pesa CASL + WhatsApp fraco no CA; ângulo = diáspora. Doc: `Economizei_Vancouver_Recibos_2026-07-09.md` |
| 2026-07-09 | **Estabilização VALIDADA em produção — smoke test end-to-end passou; frente fechada** | A9/A4/migration do agente rodadas + 4 envs; número do Agente bateu com `/gastos` (fidelidade OK); cod-0050 enfileirada. Doc: `Roteiro_Smoke_Test_2026-07-09.md` |
| 2026-07-09 | **Empresa BC adiada pra OUT/2026 — janela jul→out vira construção; planejamento até 2 meses** | Meta Ads/Hotmart/Wise/afiliados bloqueados; métrica até lá = W2, não receita. Doc: `Horizonte_Longo_Prazo_2026-07-09.md` (seção 7.2) |
| 2026-07-09 | **Assistente Conversacional = força a desenvolver; Leva 2 (cod-0040..0042) primeiro** | Diferencial defensável é o dado do cupom item a item, não a conversa; cod-0043..0049 gated por validação em produção. Doc: `Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md` |
| 2026-07-08 | **Recorte Free×Pro do Alerta Pro decidido + fila reabastecida (cod-0021/0022/0024/0031)** | Free = alerta 3 níveis + `/cortar` + pergunta avulsa na cota; Pro = acompanhamentos persistentes + limite proativo + supérfluo configurável. Migration do Alerta Pro já estava escrita |
| 2026-07-08 | **Checkpoint N2: 🟡→🟢 — repositório saudável; AGENDA estava stale (reconciliada)** | Git é a verdade: cod-0013..0017/0020 já pushados (`d4eaf51`/`3b2f375`); 184/184 testes; faltava só validação end-to-end (fechada em 07-09) |
| 2026-07-03 | **Agente de Perguntas COMPLETO (cod-0014..0017; cadeia 0010..0017 fechada)** | Texto livre → cota → classificador → executor determinístico (número NUNCA nasce no LLM) → narração com firewall de fidelidade numérica + airbag template; off-topic não consome cota. 37 testes novos |
| 2026-06-30 | **Migrations A4/A9 escritas + 2 futuras (agente, alerta pro)** | A9 (`compras.cnpj`): rodar o ALTER ANTES do deploy; futuras só quando as features subirem; `supabase/` commitada com `--no-verify` consciente |
| 2026-06-30 | **Sistema de checkpoints (3 níveis) + negócio em pilares (Máquina · Produto · futuro Marketing)** | Checkpoint integral = primeiro entre fim-de-cadeia / 5 commits / 3 semanas; firewall = tecido conectivo. Docs: `Sistema_Checkpoints_Benchmarks_2026-06-30.md` + `Pilares_do_Negocio_2026-06-30.md` |
| 2026-06-27 | **Sequência: fechar a promessa do pago ANTES de escalar; comparativo = Pro completo + teaser Free** | `/apagar` → comparativo → alerta Pro antes de anual/afiliados/ads; teaser mostra o valor antes de pagar |
| 2026-06-27 | **`/apagar` implementado (LGPD, 2 passos, firewall-limpo, sem migration)** | Fecha o A2; DELETE em ordem de FK; não toca pagamento nem `precos_mercado`; pagante ativo = follow-up financeiro humano |
| 2026-06-27 | **Classificação = CORAÇÃO do produto (princípio inegociável) + Alerta Pro desenhado** | Callout na seção 1; endurecimento cod-0026/0027 vem junto; matching por `nome_canonico`. Doc: `Desenho_Alerta_Inteligente_Pro_2026-06-27.md` |
| 2026-06-26 | **Reconciliação AGENDA×git — 5 tarefas movidas pra Concluído** | AGENDA stale vs `origin/main` (`b73b15b`/`e8de024`); ressalvas: limpeza do Actions parcial, `/planos` sem anual |
| 2026-06-25 | **Gatilho de Skills: toda tarefa da máquina carrega a skill certa (campo `skills:` + mapa fallback)** | Opus designa no planejamento (perguntando quais usar), Sonnet declara quais usou; recomendado-não-bloqueante. Regra na AGENDA |

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
- **Economizei em Vancouver — Recibos Canadenses (2026-07-09):** `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md` *(viabilidade de usar o sistema no Canadá com recibo de qualquer comércio: o que se reusa, complexidade de código, risco da classificação, e o legal — CASL/BC PIPA/PIPEDA. Tarefa: cod-0065 na AGENDA.)*
- **Horizonte de Longo Prazo (2026-07-09):** `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` *(BC adiada pra out/2026; Frente 1 ingestão multi-documento + Frente 2 internacionalização; fases e pontos de discussão)*
- **Revisão & Commit da Máquina (2026-06-30):** `Economizei app/Revisao_e_Commit_Maquina_2026-06-30.md` *(passo a passo dos 6 commits do trabalho acumulado da automação)*
- **Sistema de Checkpoints & Benchmarks:** `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md` *(cadência de revisão integral — 3 níveis, métrica de gatilho, checklist máquina + software)*
- **Pilares do Negócio:** `Economizei app/Pilares_do_Negocio_2026-06-30.md` *(Pilar 1 Máquina · Pilar 2 Código/Produto · Pilar 3 futuro Marketing; firewall como tecido conectivo)*
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

## 11. 💬 Comandos & regras permanentes do Gabriel

> **Histórico narrativo completo** (briefings verbatim, entregas, ressalvas de cada sessão): `Economizei app/arquivo-historico/SESSOES_arquivo_2026-07-15.md` (+ `CLAUDE_arquivo_2026-06-04.md` pro período inicial) e os docs de sessão em `Economizei app/`. Aqui ficam **só as regras que continuam regendo comportamento** — cada uma com a data e, quando definidor, o verbatim.

1. **Classificação é o coração** *(2026-06-27)* — verbatim: *"a classificação dos itens é o coração e o ponto principal do economizei, ou seja isso tem que ser levado o máximo a sério possível e da forma mais segura possível."* Mexeu em extração/categoria/`nome_canonico` → corpus de regressão obrigatório antes de subir.
2. **Financeiro é humano — firewall inegociável** *(2026-06-23)* — máquina/Claude mexe em código, NUNCA em dinheiro (`is_pro`, pagamentos, `supabase/`, envs, `package.json`). Trava enforçável: `scripts/check-firewall.mjs` (`npm run check:firewall`).
3. **Máquina nunca commita** *(2026-06-24)* — commit/push/deploy/migrations = sempre Gabriel, hoje via `/entregar` (aprovação dupla: check verde + "APROVO" literal; checagem de migrations/envs BLOQUEANTE antes do push, pois o push deploya no Railway).
4. **Gíria informal só em marketing** *(2026-05-26)* — verbatim: *"essas adaptações servem SOMENTE E EXCLUSIVAMENTE para marketing, nunca para o texto do bot ou para qualquer outro texto fora de roteiros de marketing"* ("cê/tá/né/ó" proibidos no bot, landing e docs).
5. **Zero benefício prometido ao Beta** *(2026-05-19)* — verbatim: *"eu quero a EXCLUSÃO de qualquer coisa que mencione um benefício como 3 meses de graça, ou o preço travado"*. Só prometer benefício depois de dados de retenção/conversão.
6. **Sem estimativas de tempo** *(2026-06-02)* — prazos só depois de medidos em tentativas reais; gatilhos por métrica (ex.: "≥ 5 pagantes"), nunca semanas numeradas.
7. **W2 ≥ 30% é o gate de escala** *(2026-06-23)* — nenhum gasto de aquisição escala antes da retenção W2 validar no cohort de Fernandópolis. Aquisição não conserta retenção; anual amplifica, não conserta.
8. **Gatilho de Skills** *(2026-06-25)* — toda tarefa da Máquina carrega as skills do campo `skills:` da AGENDA (ou o mapa tipo→skill de fallback) e declara quais usou. Recomendado-não-bloqueante.
9. **Plano-e-segue** *(2026-07-15)* — Claude executa as áreas que domina anunciando o plano em 3 linhas e seguindo sem esperar aprovação; Gabriel interrompe se quiser. Domínio dele: dinheiro/firewall, commit/deploy, direção estratégica, jurídico/fiscal, usuários reais.
10. **Teto por sessão na memória** *(2026-07-15)* — cada sessão registra no máx. 1 linha na tabela de Decisões + 1 frase na "Última atualização"; verbatim aqui SÓ se criar regra permanente; detalhe completo mora no doc de sessão em `Economizei app/`. Fim da quadruplicação de registro.
11. **Gate final é na máquina do Gabriel** *(recorrente desde 2026-06-07)* — o mount do sandbox trunca/serve stale arquivos editados; `npm run check` / `node --check` local é o gate obrigatório antes de qualquer push. Validações no sandbox rodam em cópia limpa `/tmp`.
12. **Nomes de mercados reais** *(2026-05-26)* — só em contexto neutro/positivo de hábito, como slot variável em roteiro; nunca tom negativo, nunca implicar parceria sem autorização escrita.

---

## Como usar este arquivo

**No início de cada sessão no Cowork ou Claude Code:**
> "Leia o CLAUDE.md antes de começar. Hoje quero trabalhar na área de [Marketing / Produto / Financeiro / etc.]."

**Para atualizar (respeitando o teto por sessão — regra 10 da seção 11):**
> "Adicione no CLAUDE.md em Decisões Tomadas: [data] — [decisão] — [racional curto + pointer pro doc de sessão]"
> "Marque como concluído no roadmap: [item]"
> "Adicione em Aprendizados: [insight do mês]"
> "Adicione em Comandos & regras permanentes: [comando importante]" *(só se criar regra permanente)*
