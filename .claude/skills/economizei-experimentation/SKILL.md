---
name: economizei-experimentation
description: Desenha e executa experimentos (A/B tests, testes de preço, microsegmentação) pequenos e baratos no contexto do Economizei. Use para validar headline, fluxo de onboarding, pricing, alerta, ou qualquer hipótese que mude métrica-alvo. Não use para análise pura de dados existentes (use growth-analyst).
---

# 🧪 economizei-experimentation

## Objetivo
Desenhar experimentos que respeitam a realidade do Economizei: amostra pequena, 1 pessoa operando, decisão em ≤2 semanas, custo perto de zero. Cada experimento tem hipótese, métrica primária, critério de parada, e decisão pré-comprometida.

## Quando usar
- A/B de headline de landing (Semana 2).
- Teste de pricing microsegmentado (Semana 6 — R$4,90 vs R$9,90+R$15 vs "pague o que quiser").
- Testar dois fluxos de onboarding diferentes.
- Validar se um alerta novo aumenta retenção W2.
- Testar variantes de Reels (qual hook gera mais save).
- Decidir entre duas redações de mensagem de bot.

## Quando NÃO usar
- Quando ainda não há baseline (≥2 semanas de dado) — primeiro `growth-analyst`.
- Para "testar uma feature" sem hipótese clara — primeiro `product-principles`.
- Quando a amostra é claramente <30 e a métrica é quantitativa — virar pesquisa qualitativa.

## Entradas ideais
- Hipótese específica (não "vai ser melhor", mas "vai aumentar W2 em 5 pontos").
- Variantes (no máximo 2 ou 3, nunca mais).
- Métrica primária (1 só) + métrica de guarda-corpo (1 só).
- Tamanho da amostra disponível.
- Tempo que pode rodar.

## Saídas esperadas
1. **Hipótese em 1 frase** (formato: "Se mudarmos X, então Y vai mover Z%").
2. **Variantes** descritas em 1 linha cada.
3. **Métrica primária + guarda-corpo.**
4. **Tamanho mínimo de amostra** + duração.
5. **Critério de decisão pré-comprometido** ("se A > B em ≥X com n≥Y, adotamos A").
6. **Como instrumentar** (campo no Supabase, tag, link UTM, qualquer coisa).
7. **Quando parar** (timeline + condição de stop-loss).

## Regras de comportamento

### Princípios de experimentação enxuta
1. **1 hipótese por experimento.** Não testar headline + cor + CTA juntos.
2. **2 variantes, no máximo 3.** A/B/C ainda passa; A/B/C/D não.
3. **Decisão pré-comprometida.** Escrever ANTES de rodar: "se isso acontecer, faço isso".
4. **Janela curta.** Máximo 2 semanas. Se em 2 semanas não dá sinal, hipótese está fraca ou amostra é pequena.
5. **Guarda-corpo obrigatório.** Métrica primária pode subir, mas se a guarda-corpo (ex: NPS) cai, perde.
6. **N pequeno = experimento qualitativo.** Com 30 usuários, é entrevista, não significância.
7. **Pricing test não é A/B, é survey ou cohorts.** Não cobrar de uns sim e outros não no mesmo período em pequena escala — é desonesto e quebra confiança.
8. **Documentar sempre.** Mesmo experimento "perdido" gera aprendizado.

### Quando significância estatística importa
- N total <100 → estatística é teatro. Use bom-senso + olhar qualitativo.
- N 100–500 → diferença precisa ser grande (≥30% relativo) pra confiar.
- N 500+ → começa a fazer sentido aplicar teste de proporção.

### Templates de experimento

#### Template "A/B de headline" (Semana 2)
| Campo | Valor |
|---|---|
| Hipótese | "Headline com frame 'esperto' (variante A) terá ≥1.5x a taxa de conversão de 'visitou → mandou oi' que a headline genérica (variante B)." |
| Variante A | "Não deixa o mercado te passar a perna" |
| Variante B | "Economizar virou foto" |
| Métrica primária | Conversão visita→WhatsApp (UTM trackeado) |
| Guarda-corpo | Bounce rate ≤70% em ambas |
| Amostra mínima | 200 visitas por variante |
| Duração max | 2 semanas |
| Decisão pré-comprometida | Se A ≥1.5x B com n≥200 cada → A vence. Senão, rodar B vs uma terceira. |

#### Template "Teste de pricing" (Semana 6)
| Campo | Valor |
|---|---|
| Hipótese | "Pelo menos 1 dos 3 framings de preço terá ≥30% de intent declarada." |
| Variante A | "R$ 4,90/mês — Individual" |
| Variante B | "R$ 9,90 Individual + R$ 15 Família 3 pessoas" |
| Variante C | "Pague o que quiser, mínimo R$ 1" (qualitativo) |
| Método | NÃO cobrar. Mandar mensagem no bot pra 3 grupos diferentes de 20 usuários cada com cada framing, perguntando "pagaria por isso?" |
| Métrica primária | % que diz "sim, pagaria sem hesitar" |
| Guarda-corpo | <10% diz "isso me fez perder confiança" |
| Decisão pré-comprometida | Vencedor = framing com maior "sim sem hesitar". Se nenhum ultrapassar 30%, atraso paywall pro Mês 3. |

#### Template "Mudança de fluxo de onboarding"
| Campo | Valor |
|---|---|
| Hipótese | "Antecipar a mensagem 3 (comparação temporal) pra mensagem 2 vai aumentar ativação 24h em 10 pontos." |
| Variante A | Fluxo atual (4 msgs ordem original) |
| Variante B | Mensagem 3 vira mensagem 2 |
| Métrica primária | % de novos usuários que mandam cupom em até 24h |
| Guarda-corpo | Drop-off no meio do onboarding não sobe |
| Amostra mínima | 50 novos usuários por variante |
| Duração max | 10 dias |
| Como atribuir | Coluna `onboarding_variant` em `usuarios`, alocação randômica no primeiro `oi` |

## Fluxo de execução

```
1. Receber a pergunta. Reformular como hipótese testável.
2. Listar 2 variantes (no máximo 3).
3. Escolher métrica primária + guarda-corpo.
4. Estimar amostra disponível na janela.
5. Escrever decisão pré-comprometida (CRÍTICO — antes de rodar).
6. Definir instrumentação (coluna no Supabase, UTM, etc.).
7. Definir prazo + stop-loss.
8. Rodar.
9. Ao fim: comparar com critério pré-comprometido, registrar no CLAUDE.md seção 8 (Aprendizados), independentemente do resultado.
```

## Checklist de qualidade
- [ ] Tenho 1 hipótese clara (1 frase)?
- [ ] São no máximo 3 variantes?
- [ ] Métrica primária é UMA SÓ?
- [ ] Defini a guarda-corpo?
- [ ] Escrevi a decisão ANTES de rodar?
- [ ] A duração ≤2 semanas?
- [ ] Sei como instrumentar (que campo, que UTM)?
- [ ] N estimado é razoável pra a métrica?

## Erros comuns a evitar
- **Múltiplas métricas primárias.** Vira pesca de p-value, decisão fica subjetiva.
- **Decisão pós-fato.** "Ah, mas se olhar só pra esse subgrupo, A vence." Rejeitar.
- **Rodar 4 variantes.** Cada uma fica com 1/4 da amostra. Quase nada decide.
- **Cobrar preços diferentes em A/B real.** Anti-ético + quebra confiança no Beta.
- **Não instrumentar antes de lançar.** Resultado vira "achismo".
- **Não documentar experimento perdido.** A lição estava ali.
- **Esquecer guarda-corpo.** Headline aumenta clique mas mata retenção — você comemora errado.

## Exemplo de uso prático

**Pedido:** "Quero testar se mandar um mini-resumo agregado no 3º cupom aumenta retenção W2."

**Aplicação:**

> **Hipótese:** Se enviarmos um mini-resumo agregado ("Em 3 compras você gastou R$ X, sendo Y% em limpeza") logo após o 3º cupom, a retenção W2 sobe de ~32% pra ≥42% no cohort que entrar nas próximas 2 semanas.
>
> **Variantes:**
> - A (atual): nenhum resumo até o fim do mês.
> - B (novo): mini-resumo automático após o 3º cupom (ou no 7º dia, o que vier antes).
>
> **Métrica primária:** Retenção W2 do cohort.
>
> **Guarda-corpo:** % de usuários que respondem "para de me mandar mensagem" ou bloqueia ≤2%.
>
> **Amostra mínima:** 40 usuários por variante (80 total).
>
> **Duração max:** 21 dias (2 semanas pra entrarem + 1 semana pra medir W2).
>
> **Instrumentação:**
> - Adicionar coluna `onboarding_variant` em `usuarios` com valores 'A' ou 'B'.
> - Alocação randômica 50/50 no primeiro `oi`.
> - Trigger no 3º insert de `compras`: se variant='B', chama `sendMiniResumo()`.
> - Log no `eventos` (criar tabela se não tiver): tipo='mini_resumo_enviado', phone_number, timestamp.
>
> **Decisão pré-comprometida:**
> - Se B − A ≥ 8 pontos percentuais com n≥30 cada → adotar B definitivamente, mover mini-resumo pro fluxo padrão.
> - Se B − A entre 0 e 8 pontos → rodar mais 2 semanas com n maior antes de decidir.
> - Se B ≤ A → matar a variante B, registrar aprendizado, hipótese da causa volta pro `growth-analyst`.
>
> **Linha pra CLAUDE.md (seção 8 ao fim do experimento):** `Exp 2026-05-XX: Mini-resumo após 3º cupom. Resultado: [X]. Próximo passo: [Y].`
