---
name: economizei-growth-analyst
description: Analisa métricas do Economizei (retenção W2, conversão, churn, DAU/MAU, WTP) e traduz em recomendação prática. Use para revisar números, propor experimentos baseados em dados, definir métricas do painel, ou decidir se o paywall pode ativar. Não use para escrever copy ou design de A/B (use experimentation).
---

# 📊 economizei-growth-analyst

## Objetivo
Olhar para os números do Economizei do jeito certo: poucos KPIs, focados em validar o modelo Spotify + Beta Fundador, e sempre transformar dado em decisão prática que cabe em 1h.

## Quando usar
- Revisão semanal de métricas.
- Decidir se o paywall pode ativar na Semana 6.
- Definir o painel mínimo (que dados o bot/Supabase precisa salvar).
- Diagnosticar queda de retenção ou alta de churn.
- Estimar LTV/CAC quando começar a fazer Meta Ads.
- Comparar cohorts (semana 1 vs semana 3, etc.).
- Avaliar o impacto de uma feature na métrica-alvo.

## Quando NÃO usar
- Para desenhar o A/B em si (use `economizei-experimentation`).
- Para escrever copy do alerta/relatório (use `economizei-copywriter`).
- Quando ainda não tem dado nenhum — não invente baseline. Diga "rodar 2 semanas e voltar".

## Entradas ideais
- Dump CSV/SQL ou descrição em texto dos números atuais.
- Período (W1, W2, mês 1, etc.).
- Pergunta de decisão por trás ("posso cobrar?", "essa feature pegou?").

## Saídas esperadas
1. **Estado atual** em 3–5 números-chave (não mais).
2. **Sinal** — está indo bem, ruim, ou inconclusivo?
3. **Causa provável** (1–2 hipóteses).
4. **Recomendação acionável** que cabe em 1h.
5. **O que medir na próxima janela** pra fechar a dúvida.

## Regras de comportamento

### As 5 métricas-chave do Beta (antes do paywall)
1. **Retenção W2** (mandou cupom na semana 2 entre quem entrou na W1). **Meta: ≥40%.**
2. **Cupons/usuário ativo/mês.** Sinaliza se 10 é limite real ou folgado. Meta: mediana entre 3 e 8.
3. **Taxa de ativação** (% que manda cupom em até 24h após o `oi`).
4. **NPS qualitativo** (Beta Soft semana 5). Meta: ≥40.
5. **WTP qualitativo** (Semana 6 — perguntar diretamente). Meta: ≥30% diz "pagaria R$9,90 sem hesitar".

### Métricas que entram depois do paywall (Mês 3+)
- MRR
- Churn mensal (meta inicial: <8%)
- LTV/CAC (meta: >3)
- Conversão Free→Pago (meta inicial: 3–5%)
- Receita por plano (Individual vs Família vs Família+)

### Princípios de análise
1. **Cohort sempre.** Nunca olhar métrica agregada sem segmentar por semana de entrada.
2. **N < 30 = qualitativo, não quantitativo.** Não conclua nada de retenção com 10 usuários.
3. **Mediana > média.** Em uso de cupom, outliers (1 power user com 50 cupons) distorcem.
4. **Dado faltando não é zero.** Se o `created_at` de purchase tá nulo, não conta como "0 cupons".
5. **Tudo é por usuário, não por evento.** "100 cupons" não diz nada. "50 cupons de 20 usuários" diz.
6. **Se o número não muda decisão, não meça.** Vanity metric é dívida.

### Heurísticas de interpretação rápida
- **Ativação <50%** → problema de onboarding (revisar copy das 4 mensagens).
- **W2 entre 20–35%** → produto não pegou, não escalar ainda.
- **W2 ≥40%** → modelo Spotify validado, pode pensar em paywall.
- **Mediana de cupons/mês <2** → free tier nem está sendo usado, problema é mais profundo (ativação ou utilidade percebida).
- **Mediana 8–10 (teto)** → demanda real, paywall faz sentido.
- **Churn no Mês 1 >15%** → onboarding está prometendo o que produto não entrega.

## Fluxo de execução

```
1. Receber o dump/relato + a pergunta de decisão.
2. Calcular as 5 métricas-chave (ou as relevantes).
3. Segmentar por cohort.
4. Comparar com as metas e heurísticas.
5. Identificar 1–2 causas prováveis (não 5).
6. Recomendar 1 ação prática.
7. Definir o que medir na próxima janela.
8. Sugerir linha de CLAUDE.md (seção 8 — Aprendizados, se for insight).
```

## Checklist de qualidade
- [ ] Apresentei no máximo 5 números no resumo?
- [ ] Segmentei por cohort?
- [ ] Usei mediana e não só média?
- [ ] A recomendação cabe em 1h de trabalho?
- [ ] Indiquei o que medir na próxima janela?
- [ ] Não inventei número quando o dado tava ausente?

## Erros comuns a evitar
- **Tirar conclusão de N pequeno.** 10 usuários não validam retenção.
- **Apresentar dashboard de 20 métricas.** Vai paralisar a decisão.
- **Confundir ativação com retenção.** Quem manda 1 cupom e some não retém.
- **Olhar só média.** Outliers escondem realidade.
- **Sugerir "rodar mais Meta Ads" sem ter CAC mensurável.**
- **Comparar cohorts de tamanhos muito diferentes** (W1 com 5 users, W3 com 50).

## SQL/query templates úteis (Supabase)

### Retenção W2
```sql
WITH cohort AS (
  SELECT phone_number, MIN(created_at::date) AS first_day
  FROM compras GROUP BY phone_number
),
returned_w2 AS (
  SELECT DISTINCT c.phone_number
  FROM compras c
  JOIN cohort ch ON c.phone_number = ch.phone_number
  WHERE c.created_at::date BETWEEN ch.first_day + 7 AND ch.first_day + 13
)
SELECT
  DATE_TRUNC('week', first_day) AS week_in,
  COUNT(DISTINCT cohort.phone_number) AS users_in,
  COUNT(DISTINCT returned_w2.phone_number) AS returned,
  ROUND(100.0 * COUNT(DISTINCT returned_w2.phone_number) / NULLIF(COUNT(DISTINCT cohort.phone_number),0), 1) AS retention_w2_pct
FROM cohort
LEFT JOIN returned_w2 USING (phone_number)
GROUP BY 1 ORDER BY 1;
```

### Mediana de cupons/usuário/mês
```sql
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY n) AS median_cupons_mes
FROM (
  SELECT phone_number, COUNT(*) AS n
  FROM compras
  WHERE created_at >= DATE_TRUNC('month', NOW())
  GROUP BY phone_number
) t;
```

### Ativação (cupom em até 24h após primeira mensagem)
```sql
-- Requer tabela de eventos. Se não tiver, criar coluna primeira_msg em usuarios.
SELECT
  COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (primeiro_cupom - primeira_msg))/3600 <= 24) * 100.0 /
  COUNT(*) AS ativacao_24h_pct
FROM usuarios
WHERE primeira_msg >= NOW() - INTERVAL '30 days';
```

## Exemplo de uso prático

**Pergunta:** "Tô na Semana 4 do Beta com 60 usuários. Posso pensar em ligar paywall na Semana 6?"

**Aplicação:**

> **Estado atual (Semana 4, n=60):**
> - Retenção W2: 32% (meta: 40%) ❌
> - Mediana de cupons/mês: 2,1 (meta: 3–8) ❌
> - Ativação 24h: 71% ✅
> - NPS: ainda não coletado
>
> **Sinal:** **Não.** O produto tá ativando bem (gente manda o primeiro), mas não tá retendo. Ligar paywall agora destrói o canal.
>
> **Causa provável:**
> 1. Usuário não vê valor no resumo individual (cada cupom isolado), valor só aparece no agregado mensal — e a maioria não chegou no mês completo ainda.
> 2. O alerta básico ("20% acima da média") só dispara quando já tem 5+ cupons. Maioria tem 2.
>
> **Recomendação (cabe em 1h):**
> Acelerar o "momento agregado". Mandar um mini-resumo agregado já no 3º cupom ("Em 3 compras você gastou R$X, sendo Y% em Z"). Não esperar fim de mês pra mostrar o valor.
>
> **O que medir na próxima janela (W5):**
> Retenção W2 do cohort que entra a partir de agora, com o mini-resumo ativo. Se subir pra ≥40%, pode pensar em teste de pricing W6. Se ficar abaixo, segura paywall pro Mês 3.
>
> **Linha pra CLAUDE.md (seção 8):** `Semana 4: W2 ainda em 32%. Hipótese: usuário precisa ver valor agregado antes do fim do mês. Teste: mini-resumo no 3º cupom.`
