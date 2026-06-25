# 📈 Forecast — Plano Anual & 1ª Rodada de Aquisição (R$200)

**Gerado:** 2026-06-23 · **Skill:** `/sales:forecast` (adaptada de pipeline B2B → assinatura B2C)
**Fonte dos números:** `CLAUDE.md` Seção 3 (pricing anual), Seção 11 (briefing R$200/CPA), `Projecao_6_meses.md`.

> ⚠️ **Isto é projeção, não promessa.** O `/forecast` padrão pressupõe um pipeline de vendas B2B (deals nomeados, quota, estágios). O Economizei é assinatura B2C pré-lançamento: não há pipeline, há um **funil de cadastro grátis → pagante**. Adaptei a estrutura do skill (cenários best/likely/worst, commit × upside, gap, recomendações) pro funil real. Todas as premissas abaixo são **suposições editáveis** — troque os números e o forecast recalcula. Nada aqui passa por cima do `financial-firewall`: o objetivo é mostrar o **efeito do anual no caixa**, não cravar receita.

---

## Premissas (todas editáveis)

| Premissa | Best | Likely | Worst | De onde vem |
|---|---|---|---|---|
| Orçamento da 1ª rodada | R$200 | R$200 | R$200 | Briefing do Gabriel |
| **CPA** (custo por ativação = 1º cupom) | R$30 | R$42 | R$54 | CLAUDE.md (R$30–54) |
| Ativações geradas (= R$200 / CPA) | ~7 | ~5 | ~4 | cálculo |
| Conversão ativado → pagante | 20% | 10% | 5% | **suposição** (sem retenção validada) |
| **Mix anual** (% dos pagantes no anual) | 80% | 40% | 20% | meta do Gabriel (80% = estrela-guia) |
| Meses retidos no **mensal** (quem não vai no anual) | 6 | 4 | 3 | **suposição** (churn pré-validação) |
| Preço de referência (Individual) | R$99/ano · R$9,90/mês | — | — | CLAUDE.md Seção 3 |

> Por que Individual como referência: é o tier "recomendado pra maioria". Família/Família+ elevam o ticket ainda mais (R$150/R$220 anual), então os números abaixo são o **piso** do efeito.

---

## Parte 1 — A rodada de R$200 é aprendizado, não receita

| Etapa | Best | Likely | Worst |
|---|---|---|---|
| Ativações (1º cupom) | 7 | 5 | 4 |
| Pagantes (× conversão) | ~1,4 | ~0,5 | ~0,2 |
| Caixa ano-1 desses pagantes¹ | ~R$122 | ~R$32 | ~R$10 |
| Resultado vs R$200 | −R$78 | −R$168 | −R$190 |

**Leitura honesta:** com R$200 você compra **4–7 ativações** e, na prática, **0–1 pagante**. A rodada é **cash-negativa em todos os cenários — e isso é esperado.** O retorno do R$200 **não é receita, é informação:** o **CPA real** e, principalmente, a **retenção W2** do cohort de Fernandópolis. Quem decide se vale escalar é o W2 ≥ 30%, não o lucro desta rodada.

¹ Caixa ano-1 = pagantes × ARPU-ano-1 blended (ver Parte 3).

---

## Parte 2 — O que o anual muda: payback do CAC

Aqui está o motivo do plano anual existir. Com CAC de R$30–54 por ativação:

| | Mensal (R$9,90) | Anual (R$99) |
|---|---|---|
| Caixa no ato | R$9,90 | **R$99** |
| Recupera o CAC (R$54) em… | ~6 meses **de retenção** | **na hora (dia 1)** |
| Risco se a pessoa some em 2 meses | CAC não volta (prejuízo) | CAC já voltou |

**Conclusão:** no mensal, recuperar o CAC depende de a pessoa **ficar meses** — exatamente o que ainda não está validado. No anual, **R$99 entram de uma vez** e o CAC volta no dia 1. O anual não aumenta quantos pagantes você tem; ele **de-risca cada pagante**.

---

## Parte 3 — ARPU ano-1 por mix de anual (o alvo dos 80%)

ARPU-ano-1 blended = `mix_anual × R$99 + (1 − mix_anual) × (R$9,90 × meses_retidos)`. Usando 4 meses retidos no mensal (cenário likely):

| Mix anual | ARPU ano-1 | vs tudo-mensal |
|---|---|---|
| 0% (só mensal) | R$39,60 | — |
| 20% | R$51,48 | +30% |
| 40% | R$63,36 | +60% |
| **80% (meta do Gabriel)** | **R$87,12** | **+120%** |

**Leitura:** mover o mix de pagantes pro anual **mais que dobra** o caixa ano-1 por cliente (R$39,60 → R$87,12). É exatamente o "aumentar o ticket médio" que você pediu — e é o que faz uma futura rodada de ads "fechar a conta".

---

## Parte 4 — Cenários de caixa quando escalar (pós-W2)

Ilustração de uma rodada **maior**, só pra mostrar o efeito do anual — **NÃO autorizada até W2 ≥ 30%**. Suposição: R$1.000 de ads, CPA já conhecido, conversão e mix por cenário.

| Cenário | Ativações | Pagantes | Mix anual | Caixa ano-1 | vs R$1.000 |
|---|---|---|---|---|---|
| **Best** | ~33 (CPA 30) | ~7 (20%) | 80% | ~R$610 | −R$390 |
| **Likely** | ~24 (CPA 42) | ~2–3 (10%) | 40% | ~R$152 | −R$848 |
| **Worst** | ~18 (CPA 54) | ~1 (5%) | 20% | ~R$46 | −R$954 |

**Leitura honesta:** mesmo escalando, **ads pago sozinho não se paga no ano 1** com essas conversões — o anual ajuda muito (best case quase fecha), mas **a alavanca real é a conversão free→pago e a retenção**, não o anúncio. Por isso o anual **amplifica**, não conserta: ele só brilha depois que o motor de retenção prova que segura.

---

## Commit × Upside

**Commit (alta confiança — o que dá pra "bater o martelo"):**
- A rodada de R$200 entrega **aprendizado de CPA + W2**. Isso é certo.
- O anual, quando vendido a quem **já reteve**, recupera o CAC na hora. Isso é matemática, não aposta.

**Upside (depende de validar):**
- Conversão free→pago de 10–20% — **não validada**. Pode ser bem menor no começo.
- Mix de 80% no anual no dia 1 — **otimista**; o caminho realista é free → viver o valor → upsell anual.

---

## Gap analysis — o que falta pra fechar a conta

Pra uma rodada de ads se pagar no ano 1 (caixa ≥ gasto), com ARPU-ano-1 de R$87 (mix 80%) e CPA de R$42, você precisa de **conversão ativado→pago ≈ 48%** — muito acima do realista hoje. Ou seja: **o gargalo não é o anúncio nem o preço; é a conversão e a retenção.** O anual baixa essa barra (no tudo-mensal a conversão exigida seria ~106%, impossível), mas não a zera.

---

## Recomendações

1. [ ] **Rodar os R$200 como experimento de aprendizado**, mirando CPA e W2 — não esperar receita.
2. [ ] **Medir a retenção W2 do cohort** antes de qualquer escala. Gatilho: **W2 ≥ 30%**.
3. [ ] **Não vender anual a frio.** Oferecer o anual no **upsell**, depois que a pessoa viveu o valor (mandou alguns cupons). É onde os 80% se tornam plausíveis.
4. [ ] **Instrumentar a origem da campanha** (reusar a leitura de código do `/convidar`) pra medir CPA por anúncio.
5. [ ] **Acompanhar ticket médio/ARPU e % no anual** como métricas-rainha (já adicionadas ao CLAUDE.md Seção 3).
6. [ ] Quando escalar, **priorizar conversão e retenção** sobre volume de ads — é onde está o gargalo.

---

*Modelo simples e transparente. Quer que eu transforme num xlsx com as premissas editáveis (você muda CPA/conversão/mix e os cenários recalculam sozinhos)? É a evolução natural deste forecast.*
