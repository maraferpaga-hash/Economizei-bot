# 📈 Projeção alternativa — Paywall freemium ativo desde o lançamento

> **Data:** 2026-05-21
> **Documento irmão:** `Projecao_6_meses.md` (cenário base, paywall ativado mês 5)
> **Status:** análise comparativa, NÃO é decisão fechada
> **Pergunta que esse doc responde:** Faz sentido ativar o plano pago já no lançamento (sem bloquear o uso gratuito) em vez de esperar até o mês 5?

---

## 1. O que muda exatamente em relação à projeção original

**No cenário base (`Projecao_6_meses.md`):**
- Mês 1–4: só free, sem oferta paga visível
- Mês 5: paywall ativado (decisão tomada baseada em retenção W2 ≥ 30%)
- Mês 5–8: receita aparece, primeiros pagantes

**Neste cenário alternativo:**
- Mês 1 (lançamento): plano pago **visível** na landing, **ofertável** no bot, **disponível** para quem quiser pagar — sem bloquear o free
- Free continua funcionando de verdade: 10 cupons/mês, resumo, alerta básico
- O pago é melhor (comparativo entre mercados, alerta inteligente, plano família, cupons ilimitados)
- Modelo Spotify completo desde o dia 1

**O que NÃO muda:**
- Pricing (R$9,90 / R$15 / R$22)
- Limite técnico de 10 cupons no free
- Princípio do Gabriel: "grátis funciona; pago é genuinamente melhor"
- Nenhuma promessa de "3 meses grátis", "preço travado" ou similar (decisão de 2026-05-19 mantida)

---

## 2. Premissas de comportamento que mudaram

| Fator | Cenário base (paywall mês 5) | Cenário paywall dia 1 | Justificativa do delta |
|---|---|---|---|
| Cadastros (taxa relativa) | 100% | ~92–95% | Pricing visível afasta um % pequeno de visitantes curiosos. Como o free é forte, não afasta a maioria |
| Conversão Free→Paid mensal | 0% (mês 1–4); 2–3% (mês 5+) | 1–2% nos primeiros meses; 2–3% a partir do mês 4 | Cedo demais para educação completa de valor, mas early adopters convertem |
| Retenção W2 | igual | −1 a −2pp | Fricção mental mínima ("vai ter cobrança depois?") |
| Churn de pagantes | 7–10% | 5–8% | Auto-seleção: quem paga cedo demonstra alta intenção, churn naturalmente menor |
| Custo operacional adicional | R$0 | R$300–1.500 one-shot (Stripe/MP) + ~3,5% das transações | Implementação + taxa de processadora |
| Validação de WTP | Mês 5 | Mês 1–2 | Você sabe se alguém paga em 30–60 dias em vez de 150 |

---

## 3. Cenário Realista — paywall freemium dia 1

> **Tese central:** TikTok orgânico modesto, pricing visível afasta ~8% dos curiosos, mas 1–2% dos cadastrados convertem por mês desde o início. Churn 7%.

| Mês | Cadastrados (cum.) | MAU | W2 | Pagantes (cum.) | MRR | Δ vs base |
|---|---|---|---|---|---|---|
| 1 | 28 (vs 30) | 16 | 33% | 1 | ~R$11 | +R$11 |
| 2 | 82 (vs 90) | 42 | 28% | 3 | ~R$35 | +R$35 |
| 3 | 180 (vs 200) | 88 | 28% | 7 | ~R$83 | +R$83 |
| 4 | 320 (vs 350) | 145 | 26% | 12 | ~R$143 | +R$143 |
| 5 | 480 (vs 520) | 200 | 25% | 18 | ~R$215 | +R$170 |
| 6 | 670 (vs 720) | 265 | 24% | 26 | ~R$315 | +R$185 |
| 7 | 880 (vs 950) | 330 | 24% | 36 | ~R$435 | +R$180 |
| 8 | **1.100** (vs 1.180) | **385** | **23%** | **47** | **~R$570** | **+R$175** |

**MRR acumulado 8 meses:** R$1.807 (vs R$825 no base) → **+R$982 de receita acumulada**

**Unit economics no mês 8 (realista, paywall dia 1):**
- ARPU médio: ~R$12,10
- Churn mensal: ~7% (vs ~8% no base, por auto-seleção)
- LTV: 12,10 ÷ 0,07 = **R$173** (vs R$154 no base)
- **LTV/CAC ≈ 1,4–1,7** (ligeiramente melhor que o base)

---

## 4. Cenário Otimista — paywall freemium dia 1

> **Tese central:** 1–2 vídeos viralizam, plano família ancora valor desde o início (persona 3 "filha preocupada" converte rápido), conversão 4–6%, churn 4%.

| Mês | Cadastrados (cum.) | MAU | W2 | Pagantes (cum.) | MRR | Δ vs base |
|---|---|---|---|---|---|---|
| 1 | 47 (vs 50) | 32 | 48% | 2 | ~R$22 | +R$22 |
| 2 | 185 (vs 200) | 115 | 46% | 8 | ~R$98 | +R$98 |
| 3 | 510 (vs 550) | 290 | 44% | 25 | ~R$320 | +R$320 |
| 4 | 925 (vs 1.000) | 500 | 43% | 50 | ~R$650 | +R$650 |
| 5 | 1.430 (vs 1.550) | 720 | 42% | 85 | ~R$1.110 | +R$600 |
| 6 | 2.030 (vs 2.200) | 980 | 41% | 130 | ~R$1.720 | +R$695 |
| 7 | 2.680 (vs 2.900) | 1.225 | 40% | 180 | ~R$2.430 | +R$810 |
| 8 | **3.400** (vs 3.700) | **1.470** | **39%** | **240** | **~R$3.270** | **+R$1.005** |

**MRR acumulado 8 meses:** R$9.620 (vs R$5.420 no base) → **+R$4.200 de receita acumulada**

**No mês 8 (otimista, paywall dia 1):**
- MRR R$3.270 = **77% da régua de R$4.225** (vs 54% no base)
- No ritmo, bate a régua entre **mês 9 e 10** (vs mês 10–14 no base)
- LTV/CAC ≈ 6–8 — saudável demais; reinveste com confiança

---

## 5. Cenário Pessimista — paywall freemium dia 1

> **Tese central:** TikTok não engaja, pricing visível amplifica o afastamento ("ah, é pago"), conversão < 1%.

| Mês | Cadastrados (cum.) | MAU | W2 | Pagantes (cum.) | MRR | Δ vs base |
|---|---|---|---|---|---|---|
| 1 | 22 (vs 25) | 11 | 18% | 0 | R$0 | R$0 |
| 2 | 50 (vs 55) | 20 | 17% | 1 | ~R$11 | +R$11 |
| 3 | 88 (vs 95) | 32 | 16% | 1 | ~R$11 | +R$11 |
| 4 | 130 (vs 140) | 46 | 15% | 2 | ~R$22 | +R$22 |
| 5 | 180 (vs 195) | 60 | 15% | 2 | ~R$22 | +R$22 |
| 6 | 240 (vs 260) | 73 | 14% | 3 | ~R$33 | +R$33 |
| 7 | 305 (vs 330) | 88 | 14% | 3 | ~R$33 | +R$3 |
| 8 | **370** (vs 400) | **100** | **13%** | **4** | **~R$44** | **+R$14** |

**MRR acumulado 8 meses:** R$176 (vs R$95 no base) → **+R$81**

> Neste cenário, o pricing visível **amplifica** o problema: já está difícil engajar, e o pricing afasta mais. A diferença de R$81 em 8 meses é irrelevante, mas a redução de cadastros (−7%) machuca o pouco motor que estava começando.

---

## 6. Comparação lado a lado — mês 8 (jan/27)

| Métrica no mês 8 | Pessimista base | Pessim. paywall dia 1 | Realista base | Real. paywall dia 1 | Otimista base | Otim. paywall dia 1 |
|---|---|---|---|---|---|---|
| Cadastrados (cum.) | 400 | **370** (−7%) | 1.180 | **1.100** (−7%) | 3.700 | **3.400** (−8%) |
| MAU | 110 | 100 | 420 | 385 | 1.500 | 1.470 |
| Pagantes (cum.) | 1–5 | **4** | 32 | **47** (+47%) | 165 | **240** (+45%) |
| MRR | ~R$30 | **~R$44** (+47%) | ~R$395 | **~R$570** (+44%) | ~R$2.265 | **~R$3.270** (+44%) |
| % da régua (R$4.225) | < 1% | 1% | ~9% | **~13%** | ~54% | **~77%** |
| MRR acumulado 8 meses | ~R$95 | ~R$176 | ~R$825 | **~R$1.807** | ~R$5.420 | **~R$9.620** |
| Quando bate a régua | nunca | nunca | ~mês 18–22 | **~mês 14–18** | ~mês 10–14 | **~mês 9–11** |
| Churn médio dos pagantes | n/d | irrelevante | ~8% | ~7% | ~4,5% | ~4% |

---

## 7. Custo operacional adicional do paywall dia 1

O ganho de receita só é real se você descontar o custo de implementar e operar pagamentos desde a semana 1.

| Item | Custo inicial (one-shot) | Custo recorrente | Observação |
|---|---|---|---|
| Implementar Stripe ou Mercado Pago | R$0 (você codifica) + **10–20h de Gabriel = R$650–1.300 em opportunity cost** | — | Inclui integração, webhooks, página de checkout |
| Conta PJ ou MEI ativo | R$0–500 (depende do tipo) | R$70/mês (DAS MEI) | **Bloqueio:** sem CNPJ, Stripe/MP funcionam só em modalidade pessoa física com taxa maior e limites |
| Taxa de processadora | — | ~3,5% das transações + R$0,40/transação | Em R$1.807 (realista 8 meses), custo ≈ R$80 |
| Suporte a pagamentos | — | +1h/semana de CS (R$65/sem) | Lidar com cobranças, churns, problemas de cartão |
| Risco de bug em produção | — | indefinido | Bug em pagamento afasta usuários mais que bug em foto |

**Custo operacional acumulado em 8 meses (realista):**
- One-shot: ~R$1.000
- Recorrente: ~R$2.250 (R$70 × 8 + R$65 × 32 sem + R$80 de taxa)
- **Total: ~R$3.250**

**Comparação líquida:**
- Receita extra acumulada (realista): +R$982
- Custo operacional extra: ~R$3.250
- **Saldo líquido: −R$2.268** ⚠️

No cenário otimista:
- Receita extra: +R$4.200
- Custo operacional extra: ~R$3.500 (escala um pouco com volume)
- **Saldo líquido: +R$700** ✅

No cenário pessimista:
- Receita extra: +R$81
- Custo operacional extra: ~R$3.250
- **Saldo líquido: −R$3.169** 🔴

---

## 8. Faz sentido por si só?

### Resposta curta

**Não, não faz sentido por si só nas condições atuais.** Em 2 dos 3 cenários (realista e pessimista), o custo operacional supera o ganho de receita. Só no otimista (~15–20% de probabilidade) o saldo é positivo, e mesmo lá o ganho líquido é modesto (R$700 em 8 meses).

### Resposta longa

O ganho de receita do paywall dia 1 é real (+R$170 a +R$200/mês a partir do mês 4–5 no realista), mas é amplamente comido por:

1. **Custo de implementação de Stripe/MP** com seu R$/h = R$650–1.300 que poderiam ter ido pra Produto ou Distribuição
2. **Necessidade de CNPJ ou MEI ativo no dia 1** — hoje o CNPJ ainda está como "Mês 1" do roadmap macro, não foi feito. Sem CNPJ, Stripe/MP têm taxa maior e limite de R$10k/mês
3. **Pesquisa diz "preço virou objeção #1"** — mostrar preço cedo amplifica essa objeção em alguns segmentos
4. **Você perde validação limpa do motor de retenção** — não consegue separar "W2 baixa porque produto não fideliza" de "W2 baixa porque pricing afastou"

O argumento mais forte a favor do paywall dia 1 é **validação cedo de WTP**. Mas isso pode ser conseguido com custo zero por outras vias (ver seção 9).

### Quando isso passaria a fazer sentido

- CNPJ aprovado e conta PJ ativa (hoje não está)
- Implementação de pagamento já existente (não é o caso)
- Pesquisa de WTP em N=100+ confirmando que o preço não afasta (a atual tem N=30 e mostra que preço é objeção #1)
- Disposição de assumir o saldo líquido negativo nos cenários pessimista e realista (mediano −R$2.000 a −R$3.000 em 8 meses) em troca de aprendizado mais rápido

---

## 9. Recomendação intermediária — "paywall light por PIX manual"

Existe um caminho que captura **80% do benefício** do paywall dia 1 sem o custo operacional alto. Funciona assim:

### Fase 0 — Lançamento (Mês 1)

**Na landing:**
- Pricing dos 4 planos visível (já está no plano)
- Botão "Quero o Pro" abre um WhatsApp pré-formatado: *"Olá! Quero assinar o plano Pro do Economizei. Como faço pra pagar?"*

**No bot:**
- Comando `/upgrade` ou `/pro` responde com: *"O Pro custa R$9,90/mês. Pague por PIX no QR Code abaixo e mande o comprovante. Em até 1h ativo seu plano manualmente."*
- Pagamento confirmado pelo Gabriel → flag `is_pro = true` no Supabase

**Custo de implementação:** ~2h (template de mensagem + flag manual). **R$0 em ferramentas.**

### Fase 1 — Se aparecer ≥ 5 pagantes via PIX nos primeiros 2 meses

- Sinaliza que WTP existe → vale investir em automação
- Implementa Stripe ou MP (10–20h)
- Migra fluxo manual → automático no Mês 3–4

### Fase 2 — Mês 5+

- Paywall completo com automação
- Conversão flui pelo bot sem intervenção do Gabriel

### Vantagens desta abordagem

| Critério | Paywall dia 1 (com Stripe/MP) | PIX manual primeiro (recomendado) | Cenário base (paywall mês 5) |
|---|---|---|---|
| Validação de WTP em 60 dias | ✅ Sim | ✅ Sim | ❌ Não |
| Custo de implementação inicial | R$650–1.300 (10–20h) | ~R$130 (2h) | R$650–1.300 (já previsto pra mês 5) |
| Requer CNPJ no dia 1 | ✅ Sim | ❌ Não (PIX de PF aceita até R$50k/ano) | ❌ Não |
| Receita extra esperada (realista 8 meses) | +R$982 | +R$600–800 (alguns pagantes vão preferir esperar Stripe) | R$0 |
| Custo operacional 8 meses | ~R$3.250 | ~R$650 (taxa PIX zero + 1h/sem de CS manual) | ~R$650 |
| Saldo líquido (realista) | −R$2.268 | **+R$0 a +R$150** | R$0 |
| Saldo líquido (otimista) | +R$700 | **+R$2.500 a +R$3.500** | R$0 |
| Saldo líquido (pessimista) | −R$3.169 | **−R$500 a −R$200** | R$0 |
| Aprendizado de pricing | ✅ Cedo | ✅ Cedo | ❌ Tarde |
| Risco de bug em pagamento | Médio | Quase zero | Médio |

> **Conclusão:** PIX manual é estritamente superior ao "paywall dia 1 com Stripe/MP" nas condições atuais. Captura o aprendizado, mantém o custo baixo, dispensa CNPJ no lançamento, e o downside no pessimista é muito menor.

---

## 10. Decisão sugerida (não tomada)

Esta é minha recomendação técnica, mas a decisão é sua e precisa entrar no `CLAUDE.md` formalmente.

**Sugestão:** adotar a **versão híbrida (PIX manual desde dia 1)**. Concretamente:

1. **Semana 1 do roadmap (já planejada):** adicionar ao bot o comando `/upgrade` ou `/pro` com instruções de PIX
2. **Semana 2:** mostrar pricing na landing (já planejado) com botão WhatsApp pré-formatado pra "Quero o Pro"
3. **Mês 2 (Julho):** avaliar quantos pagantes via PIX (gatilho: ≥ 5 → automatizar; < 3 → manter manual; 3–4 → reavaliar mês 3)
4. **Mês 3–4:** se houve validação, implementar Stripe/MP
5. **Mês 5:** paywall automatizado, plano original retomado

**O que isso muda no `CLAUDE.md`:**
- Adiciona uma decisão de 2026-05-21: "Pago disponível por PIX manual desde o lançamento, automação por gatilho"
- Mantém a decisão de 2026-05-08 de não ativar paywall bloqueador (não conflita — PIX manual não bloqueia free)
- Adiciona métrica nova ao acompanhamento: "Pagantes via PIX no mês"

**O que isso NÃO muda:**
- Princípio "grátis funciona de verdade"
- Pricing dos 4 planos
- Limite de 10 cupons no free
- Decisão de 2026-05-19 de não prometer benefícios ao Beta

---

## 11. Próximas perguntas que esta análise levanta

Antes de fechar a decisão, vale pensar em:

1. **Você tem CPF/MEI/CNPJ pronto pra receber PIX comercial?** PF aceita PIX mas tem limite anual (~R$50k) e implicações fiscais. MEI seria suficiente.
2. **Quanto suporte manual você aguenta?** A 1h/semana de processamento de PIX é absorvível em 5–10 pagantes/mês. Acima disso, vira gargalo.
3. **Você está disposto a publicar pricing na landing já no lançamento?** A decisão original era "mostra os 4 planos com tag 'em breve' pra ancorar valor". Aqui o Pro deixa de ser "em breve" — é "disponível agora via PIX". Pequena mudança de tom mas decisiva.
4. **A copy do bot precisa ser revista?** O onboarding atual planta a comparação temporal sem mencionar plano pago. Vale antecipar a menção ao Pro logo no início ou esperar 30 dias antes de oferecer?

---

## 12. Resumo executivo (TL;DR)

Ativar paywall completo com Stripe/MP no dia 1 → **não compensa** nas condições atuais. Saldo líquido negativo em 2 de 3 cenários.

Ativar paywall por PIX manual no dia 1 → **compensa** em 2 de 3 cenários, custo de implementação baixíssimo (~2h), dispensa CNPJ, valida WTP cedo. Recomendado.

Manter paywall só no mês 5 (cenário base) → **opção segura** mas você fica 5 meses no escuro sobre WTP. Aceitável se preferir minimizar variáveis nos primeiros meses.
