# 💳 Parceiros de pagamento com a empresa BC — pesquisa pré-decisão (2026-07-17)

> **O que é:** pesquisa de mercado pra alimentar a decisão do Gabriel sobre qual parceiro de pagamento usar quando a empresa em British Columbia (Canadá) estiver aberta (out/2026). Substitui o fluxo Mercado Pago (abandonado juridicamente em 06-24). **NÃO é uma decisão** — o dinheiro é zona 100% humana (regra 2 do firewall). Aqui estão os candidatos, os números com fonte, e o eixo de escolha. A decisão vem depois, com você.
> **Gatilho:** achado 🔴 da auditoria de 07-17 (§4.3): `/assinar` ainda gera checkout MP vivo.
> **⚠️ Todos os números têm data e fonte no rodapé. Onde não consegui confirmar o número exato, está escrito "confirmar" — não inventei taxa.**

---

## ⚡ Resumo executivo

🎯 **Decisão a tomar (depois, com você):** qual parceiro processa o pagamento dos planos (mensal R$9,90–22 + anual R$99–220) recebendo de brasileiros e liquidando pra empresa canadense.

**O achado que muda o jogo:** com a empresa BC, o **Stripe deixa de ser bloqueado**. O Stripe agora aceita PIX para empresas sediadas no **Canadá** (a lista oficial é BR, US, EU, **CA**, GB, AU, SG, CH), **liquida em CAD**, e desde abril/2026 suporta **PIX recorrente (Pix Automático)** para assinaturas — além de cartão e da própria engine de billing/assinatura. Ou seja: **uma conta Stripe canadense pode, em tese, unificar mensal (PIX recorrente) + anual + cartão num só lugar**, coisa que o plano atual resolvia com dois sistemas (Hotmart pro anual + Wise BRL pro mensal manual).

**O eixo real da decisão — MoR vs. PSP:**
- **Merchant of Record (Hotmart, Kiwify, Eduzz):** a plataforma é a "vendedora" no Brasil. Ela emite nota fiscal brasileira, recolhe imposto, trata chargeback, e — o que o seu plano quer — tem **programa de afiliados com comissão recorrente** pronto. Custo: caro (**~9,9%**). Você não pensa em compliance brasileiro.
- **Payment Service Provider (Stripe, Mercado Pago):** é só o encanamento. Mais barato, controle total, PIX recorrente nativo, liquida em CAD. Mas **a sua empresa BC vira a vendedora** — responsável pela própria contabilidade (lado canadense) e o comprador brasileiro paga **IOF (~3,5%, confirmar a alíquota atual)** por ser compra transfronteiriça. **Sem afiliados prontos.**

**Os 3 candidatos-chave que valem levar pra decisão:**
1. **Stripe (conta canadense)** — o mais forte tecnicamente; unifica tudo, PIX recorrente, cartão, CAD. PSP, não MoR.
2. **Hotmart** — já no plano; MoR completo + afiliados; caro mas zero-compliance. Ideal pro anual.
3. **Kiwify / Eduzz** — alternativas brasileiras de MoR, potencialmente mais baratas (Eduzz ~4,9% em venda direta) — **confirmar elegibilidade de produtor não-residente**, que é o ponto fraco delas.

**Descartados:** Mercado Pago (exige residência BR — o motivo do abandono, segue válido); dLocal/EBANX (são infra enterprise, cap e onboarding voltados a grande volume — não fazem sentido pra 1 pessoa pré-lançamento).

**A pergunta que decide (pro contador de brasileiros no exterior):** com a empresa BC, sai mais barato/limpo ser **PSP** (Stripe — você emite fatura canadense, comprador paga IOF) ou **MoR** (Hotmart — NF brasileira, sem IOF pro comprador, mas 9,9%)? Isso é fiscal, não técnico — e some com metade da dúvida.

**Hoje (≤1h):** nada a implementar (bloqueado até a empresa abrir). O passo é ler esta pesquisa e me dizer pra qual eixo você tende, que eu monto a comparação fina de custo por cenário de volume.

---

## 📋 Relatório completo

### 1. Por que a empresa BC reabre o leque

O Mercado Pago foi abandonado em 06-24 porque exige residência fiscal brasileira, que você não tem mais. O que a pesquisa mostra é que **o problema era a residência, não o Brasil** — vários processadores atendem empresa estrangeira vendendo pra brasileiro. Com um CNPJ-equivalente canadense (BC Ltd.), você passa a ser elegível a:

- **Stripe conta Canadá** (PIX + cartão, liquidação CAD) — antes travado porque o Stripe Brasil exige entidade brasileira; o Stripe **Canadá** exige entidade canadense, que você terá.
- **Hotmart / Kiwify / Eduzz como produtor internacional** (pagam via Payoneer em USD/EUR, ou conta estrangeira).
- **Wise Business** vinculada à BC (o plano atual pro mensal).

### 2. O eixo da decisão: Merchant of Record vs. Payment Service Provider

Essa é a escolha de verdade — o resto é detalhe.

| | **Merchant of Record (MoR)** | **Payment Service Provider (PSP)** |
|---|---|---|
| Exemplos | Hotmart, Kiwify, Eduzz | Stripe, Mercado Pago |
| Quem é o "vendedor" no Brasil | A plataforma | **Sua empresa BC** |
| Nota fiscal brasileira | Plataforma emite | Você não emite NF brasileira (vende como empresa estrangeira; fatura canadense) |
| Imposto brasileiro | Plataforma recolhe | Comprador paga **IOF** na compra transfronteiriça (~3,5%, confirmar) |
| Chargeback / fraude | Plataforma trata | Você trata (Stripe tem ferramentas, mas o risco é seu) |
| **Afiliados recorrentes** | **Pronto (Hotmart)** | Não nativo — teria que montar |
| Taxa típica | **~9,9%** | Mais baixa (PIX barato; cartão ~ variável) |
| PIX recorrente | Depende da plataforma | **Stripe: sim (Pix Automático, abr/2026)** |
| Liquidação | Payoneer USD/EUR (Hotmart) | **Stripe Canadá: CAD** |
| Esforço de compliance seu | ~Zero | Real (contador canadense + entender IOF) |

> **Tradução:** MoR = você paga caro pra não pensar em imposto/afiliado. PSP = você paga barato mas assume a responsabilidade de ser a empresa vendedora. Com a BC aberta e um contador já no radar, o PSP fica viável pela 1ª vez.

### 3. Os candidatos, um a um

**🟢 Stripe (conta canadense) — o mais forte tecnicamente**
- Aceita PIX para empresas em CA (lista oficial inclui Canadá); **liquida em CAD**.
- **PIX recorrente (Pix Automático)** suportado desde abr/2026 → resolve o mensal R$9,90 sem lembrete manual (mata o churn por esquecimento, que foi o motivo original da recorrência).
- Cartão + billing/assinatura nativos → resolve mensal e anual no mesmo lugar.
- **É PSP, não MoR:** sua empresa BC é a vendedora. Sem NF brasileira (fatura canadense); comprador paga IOF; sem afiliados prontos.
- **Taxa PIX exata: confirmar** na página `stripe.com/en-br/pricing/local-payment-methods` (não consegui o número fechado na pesquisa — não vou chutar). Cartão internacional no Stripe costuma ser mais salgado que doméstico; confirmar.

**🟢 Hotmart — MoR completo, já no plano**
- Taxa **9,99% + R$1** (PIX **9,9%**); PIX cai em 2 dias, cartão em 30.
- Paga produtor internacional via **Payoneer (USD/EUR, mín. saque US$20 + US$1,99)**.
- MoR: emite NF, trata chargeback, parcelamento, e tem **programa de afiliados com comissão recorrente** — exatamente o que o CLAUDE.md quer pro anual.
- Melhor encaixe pro **anual** (ticket alto absorve os 9,9%); inviável pro mensal (9,9% sobre R$9,90 come a margem).

**🟡 Kiwify / Eduzz — MoR brasileiro, possivelmente mais barato**
- **Eduzz: 4,90% + R$1** em venda direta do produtor (bem mais barato que Hotmart — *fonte comunitária, confirmar oficialmente*).
- **Kiwify: 8,99% + R$2,49** por venda.
- Mesmo modelo MoR (NF, afiliados). **Ponto fraco a confirmar:** aceitação de **produtor não-residente / empresa estrangeira** e forma de saque pra fora — a documentação delas é mais focada no produtor brasileiro que a Hotmart. É o item que precisa de verificação direta antes de considerar.

**🔴 Descartar (com motivo):**
- **Mercado Pago:** exige residência BR. É o motivo do abandono de 06-24. Segue válido — não reabrir.
- **dLocal / EBANX:** são a infra cross-border que fica *por trás* de gente como o Stripe (o próprio Stripe usa EBANX pro PIX). Onboarding e contratos são enterprise, orientados a volume (EBANX tem tetos e termos de grande merchant). Overkill e provavelmente inacessível pra 1 pessoa pré-lançamento. Ficam no radar só se o volume explodir.
- **PayPal:** aceitação real no Brasil pra compra recorrente de ticket baixo é fraca e as regras cross-border têm restrições; não compete com PIX no seu público B/C.

### 4. Como isso conversa com o plano atual (Hotmart + Wise)

O CLAUDE.md (seção 3) hoje planeja **Hotmart pro anual + Wise BRL pro mensal (PIX manual)**. A pesquisa traz dois ajustes pra você pesar:

1. **O Stripe pode colapsar os dois em um.** Se o Stripe canadense entregar PIX recorrente + cartão liquidando em CAD, você não precisa do split Hotmart/Wise — um só processador cobre mensal e anual, com recorrência automática nos dois. Simplifica operação e código (um webhook, não dois).
2. **Atenção a um furo no plano Wise:** uma das fontes diz que **Wise não é usável pra saque de produtor fora de US/EU** (SWIFT amarrado a bancos US/EU). Como o saque seria pra conta canadense, **confirmar se o Wise Business BRL→CAD funciona como o plano assume** — senão o mensal-via-Wise não fecha e o Stripe vira ainda mais atraente.
3. **Afiliados só o MoR entrega fácil.** Se o programa de afiliados recorrente (CLAUDE.md seção 3) for inegociável, isso puxa pra manter **Hotmart no anual** mesmo que o Stripe leve o mensal. Um desenho híbrido (**Stripe pro mensal recorrente + Hotmart pro anual/afiliados**) é uma opção legítima — não precisa ser um só.

### 5. Custo real — o que muda com IOF

O ponto que o resumo de custo costuma esquecer: **quem é a empresa vendedora muda quem paga imposto.**
- **MoR (Hotmart):** venda é doméstica no Brasil. Comprador **não** paga IOF. Você paga os 9,9% e pronto.
- **PSP cross-border (Stripe, empresa BC):** o comprador brasileiro paga **IOF (~3,5%, confirmar alíquota — mudou em 2025)** por estar comprando de fora. Some com a taxa do Stripe pra ter o custo real, e considere o efeito na conversão (o brasileiro vê o IOF).

Isso é decisivo e é **pergunta de contador**, não de engenharia. Não dá pra escolher PSP vs MoR sem essa conta fechada.

### 6. Perguntas abertas pra fechar antes de decidir

**Pro contador (brasileiros no exterior / BC Ltd.):**
- [ ] Com a BC vendendo via PSP (Stripe), qual a alíquota de **IOF atual** que o comprador paga, e como isso aparece no checkout?
- [ ] A BC precisa recolher algum imposto brasileiro vendendo como estrangeira via Stripe, ou só a obrigação canadense (T2 + GST/HST)?
- [ ] **Wise Business** vinculada à BC recebe PIX (conta BRL) e transfere pra CAD sem o problema de SWIFT-US/EU citado? (valida o plano mensal atual)

**Pros processadores (verificação direta):**
- [ ] **Stripe:** taxa exata de PIX e de cartão internacional pra conta CA; onboarding de BC Ltd recém-aberta; PIX recorrente disponível pra conta canadense (não só BR).
- [ ] **Hotmart:** confirmar cadastro de produtor não-residente com empresa canadense + saque (Payoneer vs. conta CA).
- [ ] **Kiwify / Eduzz:** aceitam produtor não-residente? Como sacam pra fora? (é o que decide se entram na disputa)

### 7. O que fazer com o `/assinar` enquanto isso (achado da auditoria)

Independente da escolha de longo prazo, o `/assinar` **ainda gera checkout Mercado Pago vivo** (auditoria 07-17, §4.3). Como qualquer processador novo só liga depois da empresa BC (out/2026), o paliativo continua o mesmo: **`/assinar` responder as instruções de PIX manual** (Wise/PIX atual) em vez de abrir checkout MP, e as mensagens de cobrança MP ficarem inertes. Isso é zona financeira = você aplica; eu preparo o texto se pedir.

---

### 📎 Fontes
- Stripe — PIX suportado para empresas em BR/US/EU/**CA**/GB/AU/SG/CH; liquidação na moeda doméstica: [Accept Pix Payments | Stripe](https://stripe.com/payment-method/pix) · [How to enable Pix : Stripe Support](https://support.stripe.com/questions/how-to-enable-pix-as-a-payment-method-in-brazil)
- Stripe — PIX recorrente (Pix Automático) para assinaturas, abr/2026: [Pix recurring payments | Stripe changelog](https://docs.stripe.com/changelog/dahlia/2026-04-22/pix-recurring-payments-support) · [Pix Automático | Stripe Docs](https://docs.stripe.com/payments/pix/pix-automatico)
- Stripe — PIX via EBANX / cross-border: [Stripe users can now accept Pix via EBANX (PRNewswire)](https://www.prnewswire.com/news-releases/stripe-users-can-now-accept-pix-in-brazil-via-ebanx-302526007.html) · [Finovate](https://finovate.com/stripe-taps-ebanx-to-facilitate-pix-payments-in-brazil/)
- Stripe — pricing PIX/local (número a confirmar): [Local payment methods pricing | Stripe](https://stripe.com/en-br/pricing/local-payment-methods)
- IOF ~3,5% em compra transfronteiriça: [A guide to Pix payments in Brazil | Stripe](https://stripe.com/resources/more/pix-replacing-cards-cash-brazil)
- Taxas Hotmart/Eduzz/Kiwify 2026: [InstaNinja — Taxas das plataformas 2026](https://www.instaninja.com.br/es/blog/tasas-plataformas-digitales-hotmart-eduzz-monetizze-kiwify-2026/) · [FreelaSemCrise — comparativo](https://www.freelasemcrise.com.br/blog/hotmart-kiwify-eduzz-comparativo) · [bit4learn — Hotmart taxas](https://bit4learn.com/pt/lms/hotmart/)
- Hotmart — saque produtor internacional via Payoneer: [How to withdraw my commission — Hotmart Help](https://help.hotmart.com/en/article/216440207/how-to-withdraw-my-commission-) · [Payoneer registration — Hotmart Help](https://help.hotmart.com/en/article/115002698271/how-to-register-my-account-with-payoneer-)
- MoR (Paddle/Lemon Squeezy) contexto: [Dodo — Best MoR platforms 2026](https://dodopayments.com/blogs/best-merchant-of-record-platforms) · [Lemon Squeezy](https://www.lemonsqueezy.com/)
- EBANX/dLocal cross-border, orientação enterprise: [dLocal certified PISP (PYMNTS)](https://www.pymnts.com/news/cross-border-commerce/cross-border-payments/2024/dlocal-becomes-certified-payment-initiation-service-provider-in-brazil/) · [EBANX Brazil gateway](https://www.ebanx.com/en/latin-america/brazil/) · [EBANX Terms](https://www.ebanx.com/en/legal/merchants/terms-and-conditions-for-payment-processing-services/)
- EBANX recurring PIX crescendo (contexto de mercado): [EBANX — recurring Pix growing 41%/month](https://markets.financialcontent.com/dowtheoryletters/article/gnwcq-2025-12-16-ebanx-six-months-after-its-launch-recurring-pix-is-growing-at-41-per-month-unlocking-a-new-market-for-subscription-based-global-players)

*Pesquisa read-only, 2026-07-17. Não altera CLAUDE.md nem código; nenhuma decisão financeira tomada — o dinheiro é seu (firewall). Números com "confirmar" precisam de checagem direta na fonte oficial antes de virarem premissa.*
