# 🚦 Arquitetura de pagamentos "dois trilhos" — decisão do Gabriel (2026-07-17)

> **O que é:** o desenho da estrutura de pagamento decidida pelo Gabriel em 2026-07-17, na sequência da pesquisa `Parceiros_Pagamento_Empresa_BC_2026-07-17.md`. **Decisão de direção tomada pelo Gabriel** (o dinheiro é dele — firewall). Este doc registra a decisão, desenha como os dois trilhos coexistem, e lista o que confirmar antes de construir (bloqueado até a empresa BC, out/2026).
> **Não é implementação.** Nenhum código de pagamento foi escrito; a zona financeira é 100% humana.

---

## ⚡ Resumo executivo

🎯 **Decisão:** o Economizei terá **DOIS trilhos de cobrança rodando em paralelo**, cada um com um propósito diferente:

- **Trilho A — DIRETO (PSP):** **Stripe** (conta canadense). Pra clientes que **você mesmo traz** (WhatsApp, orgânico, landing, seus ads). Taxa baixa, PIX recorrente, cartão, liquida em CAD. É a estrutura "bem feita" que você quer como base — margem máxima em quem chega por esforço seu.
- **Trilho B — AFILIADOS (MoR):** uma plataforma de **marketplace de afiliados** onde **terceiros vendem seu produto** e ganham comissão, sem você gerenciar cada um. Distribuição que você não faz sozinho. Taxa alta (paga a plataforma + a comissão), mas só incide sobre venda que **não existiria sem o afiliado**.

**O produto (o bot) não muda:** os dois trilhos terminam no mesmo lugar — um evento de pagamento confirmado que **liga o `is_pro`** do usuário. O bot não sabe (nem precisa saber) por qual trilho a pessoa pagou.

**Qual MoR pro Trilho B:** você disse "não necessariamente Hotmart", e está certo em manter aberto. Os candidatos reais:
- **Hotmart** — o maior marketplace de afiliados do Brasil (afiliado te acha sozinho = aquisição passiva), comissão recorrente em assinatura, e **já tem caminho de pagamento a produtor internacional** (Payoneer). É o mais forte pra "colocar o produto na prateleira e deixar gente vender".
- **Braip** — especializado em produto de **receita recorrente/assinatura** com comissão recorrente. Conceitualmente o mais alinhado ao seu modelo (assinatura), marketplace menor. **Confirmar elegibilidade de produtor não-residente.**
- **Kiwify / Monetizze / Eduzz** — marketplaces alternativos; mesma pergunta de não-residente em aberto.

**A recomendação-forma-de-opção:** pro Trilho B, **Hotmart é o default racional** (maior alcance de afiliados + payout internacional confirmado), com **Braip como o candidato a checar** se o fit "assinatura recorrente" pesar mais que alcance. A decisão fina fica pra quando você confirmar não-residência com cada um.

**O risco #1 a gerenciar (conflito de canal):** o mesmo plano anual custa ~poucos % via Stripe direto e **~30–35% via afiliado** (plataforma + comissão). Isso é saudável **se** o afiliado traz cliente novo; é prejuízo **se** o afiliado só "rouba" quem viria direto. Mitigação já no CLAUDE.md: **afiliados só nos planos anuais**, e o funil direto (WhatsApp/orgânico) continua sendo o primário.

**Hoje (≤1h):** nada a construir — os dois trilhos dependem da empresa BC (out/2026) e são zona financeira (você). O passo é validar este desenho e, se estiver bom, eu registro a decisão no CLAUDE.md (seção 3) pra virar memória.

---

## 📋 Relatório completo

### 1. Por que dois trilhos faz sentido (a lógica da sua decisão)

Os dois trilhos não competem — eles cobrem **fontes de cliente diferentes**, e é por isso que ter os dois é melhor que escolher um:

| | **Trilho A — Direto (Stripe)** | **Trilho B — Afiliados (MoR)** |
|---|---|---|
| De onde vem o cliente | Você traz (WhatsApp, orgânico, seus ads, landing) | Terceiro traz (afiliado vende por você) |
| Seu esforço por venda | Alto (você fez o marketing) | Baixo (o afiliado fez) |
| Custo por venda | **Baixo** (só taxa do PSP) | **Alto** (taxa MoR + comissão do afiliado) |
| Margem | Máxima | Menor, mas sobre venda incremental |
| Papel estratégico | **Base sólida** — o motor que você controla | **Alavanca de distribuição** — escala sem você |

> **A frase que resume sua decisão:** "quero margem máxima em quem eu trago, e quero um exército de vendedores pra quem eu não consigo alcançar." Os dois trilhos são exatamente isso.

### 2. Trilho A — Stripe (o direto)

Já coberto na pesquisa anterior. Resumo do que ele resolve: PIX + PIX recorrente (Pix Automático) + cartão, para empresa canadense, liquidando em **CAD**. Cobre **mensal e anual** com recorrência automática. É a estrutura "bem feita" que vira sua base de margem alta. Ponto a confirmar: **taxa exata de PIX e cartão internacional** na conta CA (não fechei o número na pesquisa) e que o **comprador brasileiro paga IOF (~3,5%, confirmar)** por ser compra transfronteiriça — isso aparece no checkout e afeta conversão.

### 3. Trilho B — o MoR de afiliados (o coração da sua pergunta)

Você quer um sistema onde **o seu produto fica disponível pra outras pessoas venderem**, gerando renda pra você e pra elas, e onde você possa **investir pra trazer fluxo pro programa**. Isso é exatamente o modelo de **marketplace de afiliados** das plataformas de infoproduto brasileiras. O que a pesquisa mostrou:

**Hotmart** — *o maior marketplace de afiliados do Brasil* (mais afiliados ativos e variedade de produtos). Vantagens pro seu caso:
- **Aquisição passiva de afiliado:** o afiliado te encontra no marketplace e pede pra promover — você não precisa recrutar um a um (embora possa, e deva, pra acelerar).
- **Assinatura recorrente com comissão recorrente:** o afiliado ganha em cada renovação enquanto o cliente fica — alinha o incentivo dele com retenção, não só venda.
- **Payout internacional confirmado:** paga produtor de fora via **Payoneer (USD/EUR)** — forte sinal de que aceita produtor não-residente (confirmar formalmente com a empresa BC).
- **Custo:** 9,9% + R$1 por venda; assinatura tem **R$2,49 na 1ª cobrança + R$0,50 nas recorrências** por cima; + a comissão que você define pro afiliado (seu plano prevê **20–25%** — fonte: CLAUDE.md seção 3).

**Braip** — especializado em **produto de receita recorrente/assinatura**, com comissão recorrente nativa. Conceitualmente o encaixe mais natural pra um produto que É assinatura. Marketplace menor que o da Hotmart. **Elegibilidade de produtor não-residente: confirmar.**

**Kiwify / Monetizze / Eduzz** — marketplaces alternativos, mesmo modelo. Eduzz tende a taxa menor em venda direta (~4,9%, a confirmar), mas o **atrativo do Trilho B não é a taxa — é o tamanho do exército de afiliados**, e aí a Hotmart lidera. A pergunta de não-residente vale pra todas.

> **Como escolher dentro do Trilho B:** o eixo é **alcance de afiliados (Hotmart) × fit de assinatura (Braip)**. Pra "colocar na prateleira e deixar vender", alcance ganha → **Hotmart é o default**. Braip entra se, ao confirmar não-residência, a Hotmart criar atrito e o fit-assinatura do Braip compensar o marketplace menor.

### 4. Como os dois trilhos coexistem tecnicamente

O desenho é limpo porque **o bot já tem o ponto de entrada certo**: hoje existe o endpoint interno `POST /admin/ativar-pro` que liga o `is_pro` e dispara a recompensa de indicação. Os dois trilhos convergem pra ele:

```
Trilho A (Stripe)        → webhook Stripe        ┐
                                                  ├→ verifica o evento → liga is_pro do phone → bot manda boas-vindas Pro
Trilho B (Hotmart/MoR)   → webhook da plataforma ┘
```

- **Cada trilho tem seu webhook** (Stripe e a plataforma MoR), mas ambos fazem a mesma coisa no fim: confirmar o pagamento e **ligar o Pro do número de WhatsApp**.
- **A chave de ligação é o WhatsApp do usuário** — o checkout (dos dois lados) precisa coletar o número, que vira o `external_reference`. Isso já está previsto no plano Hotmart do CLAUDE.md ("webhook Hotmart que chama `/admin/ativar-pro` com o número do campo customizado").
- **O bot não muda:** ele não tem trilho A ou B; ele tem "usuário Pro" ou "não Pro". Toda a inteligência de trilho fica fora do bot.
- **Firewall:** os dois webhooks são **zona financeira** (ligam `is_pro`) → construção e revisão 100% humanas. A máquina/Claude não toca. Isso não muda com dois trilhos.

### 5. Os riscos de ter dois trilhos (e como gerenciar)

**🔴 Conflito de canal / arbitragem de margem.** O mesmo anual de R$99:
- via **Stripe direto**: custo de poucos % → você fica com ~R$95.
- via **afiliado**: 9,9% + micro-taxas + 25% de comissão ≈ **R$35 embora** → você fica com ~**R$61** *(ilustrativo — confirmar taxas)*.

Isso é **ótimo** se o afiliado trouxe alguém que nunca viria por você. É **prejuízo** se o afiliado fez ads mirando seu público orgânico e "converteu" quem já ia chegar direto. **Mitigações:**
1. **Afiliado só no anual** (já no CLAUDE.md) — o ticket alto absorve a comissão; o mensal R$9,90 não aguenta.
2. **Funil direto é o primário** — WhatsApp/orgânico/seus ads mandam pro Stripe; o afiliado é distribuição extra, não substituta.
3. **Regras de afiliação** (a maioria das plataformas permite): proibir afiliado de dar lance no seu nome de marca em ads, pra ele não competir com seu próprio funil.

**🟡 Dobro de operação.** Dois webhooks, duas reconciliações, duas linhas de taxa na planilha de unit economics. O bot é compartilhado, mas o **caminho do dinheiro** dobra. Aceitável pelo ganho de distribuição, mas entra na conta do seu tempo.

**🟡 IOF só no trilho direto.** Ironia: o Stripe (direto, "barato") tem **IOF pro comprador** por ser cross-border; o MoR (afiliado, "caro") é venda **doméstica** no Brasil, sem IOF. Ou seja, o preço final que o cliente vê pode diferir entre os trilhos. Decidir se absorve, repassa, ou mostra igual — é decisão de pricing sua (e de contador).

**🟡 Retenção do afiliado × sua.** Comissão recorrente alinha o afiliado com renovação (bom), mas se o cliente do afiliado tem retenção pior que o seu orgânico, o Trilho B pode inflar aquisição sem inflar base ativa. **Medir W2 por trilho** quando rodar (a regra 7 do firewall — W2 ≥ 30% — vale por trilho, não só no agregado).

### 6. O que confirmar antes de construir (nada disso é código)

**Pro contador (BC Ltd.):**
- [ ] IOF atual no trilho Stripe (comprador cross-border) e como exibir/absorver.
- [ ] Obrigação fiscal da BC vendendo via PSP (Stripe) vs. via MoR (a plataforma é a vendedora no Brasil).

**Direto com as plataformas (verificação que só contato resolve):**
- [ ] **Hotmart:** cadastro de produtor não-residente com empresa canadense + payout (Payoneer vs. conta CA) + comissão recorrente de afiliado em assinatura.
- [ ] **Braip:** aceita produtor não-residente? É o candidato de fit-assinatura.
- [ ] **Stripe:** taxa exata PIX/cartão pra conta CA + onboarding de BC recém-aberta + PIX recorrente disponível na conta canadense.

### 7. Sequência (quando a empresa BC abrir — out/2026)

1. **Abrir Stripe (conta BC)** e ligar o Trilho A primeiro — é a base, e não depende de marketplace. Mensal + anual + cartão direto.
2. **Cadastrar no MoR escolhido** (Hotmart default) como produtor, configurar o produto anual + programa de afiliados + comissão.
3. **Construir os 2 webhooks** (financeiro = você) apontando pro `/admin/ativar-pro`, coletando o WhatsApp no checkout.
4. **Recrutar afiliados** (o "investir e trazer fluxo pro programa" que você quer): abrir no marketplace + recrutar influencers de finanças/economia direto. Isso é motion de marketing contínuo, separado da técnica.
5. **Medir por trilho:** custo por ativação, W2 e churn separados A × B, pra saber se o afiliado traz cliente incremental de verdade.

### 8. Impacto no `/assinar` hoje (achado da auditoria, independe disso)

Enquanto nada disso liga (out/2026), o `/assinar` **ainda gera checkout Mercado Pago vivo** (auditoria 07-17). Paliativo inalterado: `/assinar` responder instruções de PIX manual em vez de abrir o MP. Zona financeira = você aplica; preparo o texto se pedir.

---

### 📎 Fontes
- Hotmart — maior marketplace de afiliados, assinatura + comissão recorrente, taxas de assinatura (R$2,49 1ª + R$0,50 recorrência): [bit4learn — Hotmart 2026](https://bit4learn.com/pt/lms/hotmart/) · [Assinaturas — Central Hotmart](https://help.hotmart.com/pt-br/article/115002364191/assinaturas-tudo-o-que-voce-precisa-saber-para-cadastrar-e-configurar-seu-produto) · [Programa de Afiliados — Central Hotmart](https://help.hotmart.com/pt-br/article/210874788/como-configurar-o-meu-programa-de-afiliados-) · [Taxas Hotmart produtor 2026 — Tactus](https://tactus.com.br/taxas-da-hotmart-para-produtor/)
- Hotmart — payout produtor internacional via Payoneer: [How to withdraw my commission — Hotmart Help](https://help.hotmart.com/en/article/216440207/how-to-withdraw-my-commission-)
- Braip — foco em receita recorrente/assinatura + comissão recorrente: [Núcleo Performar — comparativo plataformas](https://nucleoperformar.com/melhor-plataforma-marketing-afiliados/) · [No Marketing Digital — Hotmart/Kiwify/Braip](https://nomarketingdigital.com.br/melhor-plataforma-de-afiliados-hotmart-kiwify-ou-braip/)
- Kiwify — marketplace de afiliados: [Kiwify — Afiliados](https://ajuda.kiwify.com.br/pt-br/category/afiliados-18psomu/) · [Fórmula Ninja — Kiwify 2026](https://formulaninja.com.br/kiwify/)
- Comparativo de marketplaces (Hotmart/Kiwify/Monetizze/Braip): [EncurtaTurbo — afiliado iniciante 2026](https://encurtaturbo.com/blog/afiliado-iniciante-hotmart-monetizze-kiwify)
- Stripe (trilho A) — ver fontes em `Parceiros_Pagamento_Empresa_BC_2026-07-17.md`.

*Desenho de arquitetura, 2026-07-17. Decisão de direção do Gabriel; nenhuma implementação financeira feita (firewall). Números com "confirmar/ilustrativo" precisam de checagem antes de virarem premissa de unit economics.*
