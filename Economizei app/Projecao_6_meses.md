# 📈 Projeção 6 meses — Economizei

> **Última atualização:** 2026-05-21
> **Horizonte principal:** 6 meses (até 2026-11-21)
> **Horizonte estendido:** ~8 meses, até início de 2027 (régua de break-even definida pelo Gabriel)
> **Autor:** Gabriel + sessão de planejamento estratégico Cowork
> **Documentos irmãos:** `CLAUDE.md` (estratégia e princípios), `Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md` (plano tático), `Auditoria_Consultoria_Economizei_2026-05-19.md` (riscos abertos)

---

## 1. Por que este documento existe

O Economizei deixou de ser hobby. A partir de 2026-05-21 o projeto passa a ser tratado como negócio profissional, com planejamento, gatilhos de decisão e régua de retorno explícita. Este arquivo existe para responder uma única pergunta:

> **Em 6 a 8 meses, o esforço investido vai se traduzir em resultado equivalente ou superior ao que essas horas custariam no trabalho principal?**

Sem essa pergunta respondida, não é possível decidir racionalmente quando continuar, quando contratar, quando pausar ou quando pivotar. O documento traz três cenários (otimista, realista, pessimista), com métricas projetadas mês a mês, e gatilhos semáforo (🟢/🟡/🔴) para forçar decisão em pontos pré-definidos — em vez de deixar o projeto "andar por inércia".

---

## 2. Premissas comuns aos três cenários

Tudo o que vem abaixo se aplica aos três cenários. As diferenças aparecem só nas curvas de adoção, retenção e conversão.

### 2.1. Time e custo de oportunidade

| Item | Valor | Cálculo |
|---|---|---|
| Pessoas no projeto | 1 (Gabriel) | — |
| Horas reais/semana no Economizei | **12h/semana** (média de 10–14) | Confirmado em sessão de 2026-05-21 |
| Custo de oportunidade da hora | **R$65/h** | Equivalente ao R$/h do trabalho principal |
| Custo de oportunidade/semana | **R$780** | 12 × 65 |
| Custo de oportunidade/mês | **R$3.380** | 12 × 4,33 × 65 |
| Custo de oportunidade em 6 meses | **R$20.280** | 26 semanas × R$780 |
| Custo de oportunidade em 8 meses | **R$26.520** | 34 semanas × R$780 |

> **Régua definida pelo Gabriel:** até o início de 2027 (~mês 8), o MRR mensal precisa atingir **R$4.225/mês ou mais** (equivalente a 15h × R$65 × 4,33 semanas — o break-even contínuo entre o que o Economizei rende por mês e o que essas horas custariam por mês no trabalho principal).
>
> Importante: em SaaS não se recupera o custo afundado (R$26.520 das horas), recupera-se o run-rate. Ou seja, a régua é "o quanto o negócio paga por mês daqui pra frente", não "o quanto o negócio devolveu do que foi gasto". Recuperar o afundado vem depois, quando o MRR ultrapassa o custo das horas por vários meses seguidos.

### 2.2. Custos diretos esperados (infra + ferramentas)

| Item | Custo/mês estimado | Observação |
|---|---|---|
| Z-API (WhatsApp gateway) | R$100–200 | Plano básico durante o Beta |
| Gemini 2.5 Flash Vision | R$30–150 | Varia com volume de cupons; ~R$0,02–0,05 por cupom |
| Supabase | R$0 (free tier) | Migrar pra Pro se passar limites — R$130/mês |
| Domínio + Vercel | R$0–50 | Domínio anual; Vercel free pra MVP |
| Ferramentas (UptimeRobot, GA4, etc.) | R$0 | Tudo no free no início |
| **Total mês inicial** | **~R$150–400/mês** | Cresce com volume |
| **Total 8 meses estimado** | **~R$1.500–2.500** | Acumulado |

### 2.3. Stack e estado atual (resumo)

- Bot funcional: webhook + Gemini Vision + Supabase + alertas básicos
- 6 semanas iniciais sem paywall (decisão de 2026-05-08, mantida em 2026-05-19)
- Limite Free: 10 cupons/mês (anti-abuso técnico)
- Pricing futuro: R$9,90 (individual) / R$15 (família 3 pessoas) / R$22 (família+ 5 pessoas)
- Beta sem benefícios prometidos (decisão de 2026-05-19)

### 2.4. Métricas que serão acompanhadas em todos os cenários

| Métrica | Por que importa |
|---|---|
| Usuários cadastrados (cumulativo) | Tamanho do funil de topo |
| MAU (ativos no mês) | Quantos usam de verdade |
| Retenção W2 | % que mandou cupom na 2ª semana — sinal de hábito |
| Cupons processados/mês | Carga real + custo de Gemini |
| Custo total mensal | Infra + ferramentas |
| Conversão Free→Paid | Só faz sentido após paywall (mês 5+) |
| MRR | Receita recorrente mensal |
| Churn mensal | % de pagantes que cancelam |
| LTV | Receita esperada por cliente ao longo da vida — calculado como `ARPU / churn` |
| CAC | Custo de adquirir um pagante — só calculável quando houver gasto real em Ads |
| LTV/CAC | Saúde do unit economics; quer-se > 3 |

---

## 3. Glossário rápido (o que LTV, CAC e churn baixo significam aqui)

Como o Gabriel pediu, vou explicar antes de usar.

**Churn baixo** = poucos clientes cancelam por mês. Para SaaS B2C de ticket baixo (~R$10–22), churn aceitável é até **5–7% ao mês**. Acima de 10% é sinal de produto que não cria hábito. Um churn de 10%/mês significa que em 10 meses, a base é trocada inteira — você fica correndo atrás de aquisição sem nunca acumular.

**LTV** (Lifetime Value) = receita média esperada de um cliente desde o cadastro até cancelar. Fórmula simplificada: `ARPU mensal ÷ churn mensal`. Exemplo: se o ARPU é R$11 (mix entre R$9,90, R$15 e R$22) e o churn é 7%/mês, LTV = 11 ÷ 0,07 = **R$157**.

**CAC** (Customer Acquisition Cost) = quanto custou trazer um pagante. Inclui gasto em Ads + tempo investido em conteúdo. Se gastei R$300 em Meta Ads e converti 6 pagantes, CAC = R$50. Se trouxe via TikTok orgânico, o "custo" é o tempo de produção — aqui usa-se a régua R$65/h.

**LTV/CAC > 3** = cada real gasto em aquisição volta no mínimo 3× ao longo da vida do cliente. Esse é o número que separa "negócio saudável" de "esteira de aquisição que não acumula". Abaixo de 1,5 = perde dinheiro a cada cliente. Entre 1,5 e 3 = paga o custo mas não cresce. Acima de 3 = pode reinvestir em mais aquisição com confiança.

**Por que isso importa pra régua de R$4.225/mês?** Porque um MRR alto com churn de 20% é ilusão de receita. O motor não acumula. A régua só é "real" se vier com churn < 8% e LTV/CAC > 2,5.

---

## 4. Cenário Realista (probabilidade estimada ~50%)

> **Tese central:** TikTok orgânico gera crescimento modesto e constante. Retenção W2 fica na faixa de 25–35% (alinhada com benchmarks de bots de WhatsApp B2C). Paywall ativa em mês 5, conversão Free→Paid em 2–3%. Churn em torno de 8–10%/mês (alto, mas esperado em fase inicial). Infra controlada.

### 4.1. Projeção mês a mês

| Mês | Data | Cadastrados (cum.) | MAU | W2 reten. | Cupons/mês | Custo infra | Pagantes | MRR | Comentário |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Jun/26 | 30 | 18 | 35% | ~120 | R$150 | 0 | R$0 | Pós-hardening, primeiros cadastros do círculo próximo |
| 2 | Jul/26 | 90 | 48 | 30% | ~300 | R$170 | 0 | R$0 | TikTok começa, 1ª pesquisa NPS informal |
| 3 | Ago/26 | 200 | 100 | 30% | ~600 | R$200 | 0 | R$0 | Conteúdo escalando, comando `/indicar` ativo |
| 4 | Set/26 | 350 | 160 | 28% | ~950 | R$240 | 0 | R$0 | Decisão sobre paywall com base nos dados |
| 5 | Out/26 | 520 | 220 | 27% | ~1.300 | R$280 | 4 | ~R$45 | Paywall ativa, primeiros pagantes |
| 6 | Nov/26 | 720 | 290 | 26% | ~1.700 | R$320 | 11 | ~R$130 | Iteração de pricing, mix começa a aparecer |
| 7 | Dez/26 | 950 | 360 | 25% | ~2.100 | R$370 | 21 | ~R$255 | Sazonalidade de fim de ano (volume +) |
| 8 | Jan/27 | 1.180 | 420 | 25% | ~2.500 | R$420 | 32 | ~R$395 | Pós-Natal, primeira leitura "limpa" de churn |

### 4.2. Unit economics realista no mês 8

- ARPU médio: ~R$12,30 (mix de R$9,90 com algum R$15 e R$22)
- Churn mensal: ~8%
- LTV: 12,30 ÷ 0,08 = **R$154**
- CAC (assumindo R$200/mês em Ads + ~4h/sem produção de conteúdo × R$65 × 4,33 = R$1.126/mês total): com 10–12 pagantes novos/mês, CAC ≈ R$100–130
- **LTV/CAC ≈ 1,2–1,5** — abaixo do saudável, mas não terminal

### 4.3. Régua vs. realidade no cenário realista

- MRR mês 8: **~R$395**
- Régua: R$4.225
- **Bate ~9% da régua** em 8 meses
- Para chegar à régua nesse ritmo, seria necessário ~18–22 meses (assumindo crescimento composto sem grande mudança)
- Custo de oportunidade acumulado: R$26.520
- MRR acumulado nos 8 meses: ~R$825 (soma dos meses 5–8)
- **Déficit acumulado:** ~R$25.700

### 4.4. Avaliação

Cenário realista significa: o produto funciona, o motor está vivo, mas é lento. Não é fracasso e não é vitória. É o ponto onde a decisão de continuar precisa ser tomada com base em outras coisas (paixão pelo problema, aprendizado, posicionamento de mercado a longo prazo) — não na régua estrita de R$/h.

Sinais positivos: churn em queda, NPS subindo, conversão organicamente melhorando.
Sinais a vigiar: se o churn não cair pra < 7% até mês 8, o motor tem furo e precisa de iteração de produto.

---

## 5. Cenário Otimista (probabilidade estimada ~15–20%)

> **Tese central:** Um ou dois conteúdos viralizam no TikTok ou Reels (1M+ views), trazendo onda de cadastros. Retenção W2 acima de 45% porque o ICP foi acertado. Plano família vira ancoragem natural (persona 3 "filha preocupada" se manifesta espontaneamente). Conversão Free→Paid em 5–7% após paywall. Churn < 5%/mês. ARPU sobe pelo mix com plano família.

### 5.1. Projeção mês a mês

| Mês | Data | Cadastrados (cum.) | MAU | W2 reten. | Cupons/mês | Custo infra | Pagantes | MRR | Comentário |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Jun/26 | 50 | 35 | 50% | ~250 | R$170 | 0 | R$0 | Hardening + soft launch acerta tom |
| 2 | Jul/26 | 200 | 120 | 48% | ~700 | R$220 | 0 | R$0 | Primeiro Reel/TikTok com tração |
| 3 | Ago/26 | 550 | 300 | 45% | ~1.700 | R$320 | 0 | R$0 | Viralizado leve; indicação orgânica forte |
| 4 | Set/26 | 1.000 | 520 | 44% | ~2.900 | R$430 | 0 | R$0 | Decisão de antecipar paywall |
| 5 | Out/26 | 1.550 | 750 | 43% | ~4.200 | R$580 | 38 | ~R$510 | Paywall ativa; mix família começa |
| 6 | Nov/26 | 2.200 | 1.000 | 42% | ~5.500 | R$720 | 75 | ~R$1.025 | Família 3p representa ~30% dos pagantes |
| 7 | Dez/26 | 2.900 | 1.250 | 41% | ~6.700 | R$850 | 118 | ~R$1.620 | Sazonalidade ajuda; ARPU sobe |
| 8 | Jan/27 | 3.700 | 1.500 | 40% | ~8.000 | R$1.000 | 165 | ~R$2.265 | Maturação do motor; tendência clara |

### 5.2. Unit economics otimista no mês 8

- ARPU médio: ~R$13,70 (família puxando)
- Churn mensal: ~4,5%
- LTV: 13,70 ÷ 0,045 = **R$304**
- CAC (Ads R$400/mês + conteúdo orgânico de altíssimo retorno): ~R$40–60
- **LTV/CAC ≈ 5–7,5** — saudável demais, reinveste com confiança

### 5.3. Régua vs. realidade no cenário otimista

- MRR mês 8: **~R$2.265**
- Régua: R$4.225
- **Bate ~54% da régua** em 8 meses
- No ritmo, **bate régua entre mês 10 e 12**
- Sinal de escala claríssimo (LTV/CAC > 5)
- Custo afundado começa a ser recuperado em ~mês 14–16

### 5.4. Avaliação

Cenário otimista significa: o produto encontrou ICP forte, o canal funciona, e o motor escala. Nesse cenário, a decisão correta entre mês 6 e 8 é **acelerar** — investir mais horas, considerar primeiro freelancer de conteúdo (ver seção Time no CLAUDE.md), aumentar investimento em Ads.

Sinais positivos: viralizações orgânicas, ARPU acima do esperado, churn baixíssimo, NPS > 50.
Sinais a vigiar: custo de Gemini escalando junto com volume; precisa monitorar margem unitária.

---

## 6. Cenário Pessimista (probabilidade estimada ~30–35%)

> **Tese central:** TikTok não pega tração orgânica (algoritmo não favorece nicho). Crescimento depende quase só de Ads, com CAC alto. Retenção W2 abaixo de 20% (usuários testam, não voltam). Paywall não é ativado por falta de massa crítica. Concorrência indireta (planilha de Excel mental) ganha.

### 6.1. Projeção mês a mês

| Mês | Data | Cadastrados (cum.) | MAU | W2 reten. | Cupons/mês | Custo infra | Pagantes | MRR | Comentário |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Jun/26 | 25 | 12 | 20% | ~80 | R$140 | 0 | R$0 | Hardening pronto, mas tração inicial fraca |
| 2 | Jul/26 | 55 | 22 | 18% | ~160 | R$155 | 0 | R$0 | Conteúdo não engaja |
| 3 | Ago/26 | 95 | 35 | 17% | ~260 | R$170 | 0 | R$0 | Ads testados, CAC alto |
| 4 | Set/26 | 140 | 50 | 16% | ~380 | R$185 | 0 | R$0 | Paywall adiado por falta de base |
| 5 | Out/26 | 195 | 65 | 16% | ~500 | R$200 | 0 | R$0 | Decisão pendente: continuar, pivotar ou pausar |
| 6 | Nov/26 | 260 | 80 | 15% | ~620 | R$215 | 0 | R$0 | Sem MRR; revisão estratégica |
| 7 | Dez/26 | 330 | 95 | 15% | ~740 | R$230 | 0–3 | R$0–30 | Paywall em teste micro, conversão fraca |
| 8 | Jan/27 | 400 | 110 | 14% | ~850 | R$250 | 1–5 | R$10–55 | Decisão final: continuar com aporte ou parar |

### 6.2. Unit economics pessimista no mês 8

- Pagantes: 0–5
- Churn: irrelevante (base pequena demais)
- LTV/CAC: incalculável de forma confiável
- **Verdade nua:** o motor não está funcionando

### 6.3. Régua vs. realidade no cenário pessimista

- MRR mês 8: **~R$30**
- Régua: R$4.225
- **Bate < 1% da régua**
- Custo afundado em horas: R$26.520
- Custo afundado em infra: ~R$1.500
- **Total queimado: ~R$28.000**

### 6.4. Avaliação

Cenário pessimista significa: produto não acha ressonância, canal não funciona, ou ICP estava errado. Decisão necessária no mês 6: continuar investindo (com novo plano de canal) ou parar e absorver o aprendizado.

**Esse cenário não é fracasso pessoal** — é um resultado possível de um experimento de mercado. O ganho, mesmo no pessimista, é:
- Stack técnica funcionando e reutilizável
- Aprendizado validado sobre o ICP e o canal
- ~R$28k em "tuition de empreendedorismo" — caro, mas defensável **se a decisão de parar for tomada cedo** (mês 6, não mês 12)

A pior versão do cenário pessimista é a que **não decide** — continua queimando R$3.380/mês indefinidamente sem cortar.

---

## 7. Comparativo lado a lado

| Métrica no mês 8 (jan/27) | Pessimista | Realista | Otimista |
|---|---|---|---|
| Cadastrados (cum.) | 400 | 1.180 | 3.700 |
| MAU | 110 | 420 | 1.500 |
| Retenção W2 | 14% | 25% | 40% |
| Pagantes | 1–5 | 32 | 165 |
| MRR | ~R$30 | ~R$395 | ~R$2.265 |
| % da régua de R$4.225 | < 1% | ~9% | ~54% |
| LTV/CAC | n/d | ~1,2–1,5 | ~5–7,5 |
| Churn mensal | n/d | ~8% | ~4,5% |
| Custo infra acumulado (8 meses) | ~R$1.500 | ~R$2.150 | ~R$4.290 |
| Custo oportunidade horas (8 meses) | R$26.520 | R$26.520 | R$26.520 |
| Receita acumulada (8 meses) | ~R$95 | ~R$825 | ~R$5.420 |
| **Saldo cumulativo (Receita − Custos)** | **−R$27.925** | **−R$27.845** | **−R$25.390** |

> Em todos os cenários o saldo cumulativo em 8 meses é negativo. Isso é normal e esperado em SaaS B2C — o retorno vem da continuidade do MRR após o break-even, não do acumulado no período de investimento. A diferença é que no cenário otimista há **trajetória clara de break-even em ~12 meses**, no realista em ~18–22 meses, e no pessimista não há trajetória.

---

## 8. Gatilhos de decisão (semáforo)

Estes são os pontos onde o projeto **obriga uma decisão**, em vez de seguir por inércia. Cada gatilho tem critério verde, amarelo e vermelho. Se ficar amarelo duas avaliações seguidas, trata-se como vermelho.

### Mês 2 (Jul/26) — Validação de tração inicial
- 🟢 ≥ 100 cadastros únicos **e** W2 ≥ 35% → seguir plano
- 🟡 40–100 cadastros **ou** W2 entre 20–35% → revisar copy de landing e onboarding
- 🔴 < 40 cadastros **ou** W2 < 20% → revisão de canal e mensagem; considerar mudar TikTok → outro canal

### Mês 3 (Ago/26) — Validação de hábito
- 🟢 ≥ 250 cadastros **e** W2 ≥ 30% **e** NPS ≥ 30 → planejar paywall pra mês 5
- 🟡 100–250 cadastros **ou** W2 entre 20–30% → manter Beta gratuito; iterar copy de retenção
- 🔴 < 100 cadastros **ou** W2 < 20% → revisar fit produto-mercado; conversar com 10 usuários ativos

### Mês 4 (Set/26) — Decisão sobre paywall
- 🟢 ≥ 500 cadastros **e** W2 ≥ 30% **e** ≥ 3 menções espontâneas de WTP → **ativar paywall em mês 5**
- 🟡 300–500 cadastros → continuar Beta gratuito mais 30 dias
- 🔴 < 300 cadastros → adiar paywall indefinidamente; focar em distribuição

### Mês 6 (Nov/26) — Avaliação intermediária
- 🟢 MRR ≥ R$300 **e** LTV/CAC ≥ 2 **e** churn < 10% → continuar e escalar
- 🟡 MRR R$50–300 → revisar pricing, considerar testar plano família mais cedo
- 🔴 MRR < R$50 **ou** churn > 15% → revisão estratégica; opções: pivot, pausa, ou aporte de horas

### Mês 8 (Jan/27) — Avaliação contra a régua
- 🟢 MRR ≥ R$2.000 (~47% da régua) **e** trajetória clara → seguir, considerar 1º freela de conteúdo
- 🟡 MRR R$500–2.000 → seguir mais 3–4 meses; reavaliar régua e timeline
- 🔴 MRR < R$500 → decisão dura: aporte significativo de horas, pivot ou pausa

---

## 9. Conclusão estratégica e recomendação

### O que essa projeção mostra de mais importante

A régua de **R$4.225/mês em 8 meses é agressiva** para um SaaS B2C com ticket baixo, sem paywall ativo nos primeiros 4–5 meses, e com 12h/semana de dedicação. No cenário otimista (que tem ~15–20% de probabilidade), bate-se 54% da régua. No realista, ~9%. No pessimista, ~0%.

Isso **não invalida o projeto**. Significa que a régua dos R$4.225/mês precisa ser entendida como ponto de break-even contínuo de "trabalho que se paga sozinho", não como prazo realista de payback em 8 meses. **Realisticamente, o break-even contínuo no caminho saudável (otimista) acontece entre mês 10 e 14. No realista, mês 18–24.**

### Recomendação

1. **Manter a régua dos R$4.225/mês como ponto de orientação de longo prazo**, mas adotar **metas intermediárias mais alcançáveis**:
   - Mês 4: paywall ativável (≥500 cadastros, W2 ≥30%)
   - Mês 6: R$300–500 MRR (sinal de motor funcionando)
   - Mês 8: R$1.500–2.500 MRR (sinal de escala)
   - Mês 12: R$4.000+ MRR (régua original)

2. **Não inflar as horas dedicadas antes do gatilho do mês 4**. Aumentar pra 20h/semana antes de validar W2 ≥30% só aumenta o custo de oportunidade sem aumentar a probabilidade de sucesso. O gargalo nos primeiros 4 meses é distribuição/mensagem, não capacidade de produção.

3. **Acompanhar saldo cumulativo trimestralmente**, com tolerância máxima de queima:
   - 6 meses: até −R$22.000 (Receita − Custos)
   - 8 meses: até −R$25.000
   - 12 meses: até −R$30.000 → se passar disso sem trajetória clara, pausar

4. **Os gatilhos da seção 8 são obrigatórios**. No fim de cada mês indicado, parar 1 hora pra revisar. Sem isso, o projeto se mantém por inércia em vez de por decisão.

5. **Em qualquer cenário, manter `CLAUDE.md` atualizado** com decisões e resultados reais — ele é a memória que protege contra repetir erros e contra esquecer a régua.

---

## 10. O que precisa ser monitorado fora desta projeção

Esta projeção depende de medições. Sem instrumentação, vira ficção. As seguintes capacidades precisam estar funcionando até o **fim da Semana 2** do plano de 6 semanas (ver `Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`):

| Métrica | Onde medir | Quem mede |
|---|---|---|
| Cadastros únicos | Supabase, query semanal | Gabriel, sexta |
| MAU | Supabase, query semanal | Gabriel, sexta |
| Retenção W2 | Supabase, query mensal | Gabriel, fim do mês |
| Cupons processados | Supabase + Gemini console | Gabriel, semanal |
| Custo Gemini | Google Cloud Console | Gabriel, semanal |
| Funil landing → bot | GA4 ou Vercel Analytics | Gabriel, semanal |
| NPS / qualitativo | Pesquisa direta no WhatsApp (mês 3, 6) | Gabriel, mensal |
| Custo de Ads (se houver) | Meta Ads Manager | Gabriel, semanal |

> **Sem essas medições rodando até a Semana 2, o gatilho do Mês 2 não pode ser avaliado e o projeto entra em modo "andar por inércia".** Instrumentação é prioridade igual a produto.

---

## 11. Próximas revisões deste documento

| Quando | O que revisar | Saída esperada |
|---|---|---|
| 2026-06-21 (mês 1) | Atualizar números reais do mês 1; comparar com projeção | Nota de "estou acima/no meio/abaixo do realista" |
| 2026-08-21 (mês 3) | Avaliar gatilho do Mês 3; reescrever projeção 4 meses | Decisão sobre paywall mês 5 |
| 2026-11-21 (mês 6) | Avaliar gatilho do Mês 6; revisar régua de 2027 | Decisão sobre seguir, escalar, pausar |
| 2027-01-21 (mês 8) | Avaliar contra régua original; revisão estratégica anual | Plano para 2027 |
