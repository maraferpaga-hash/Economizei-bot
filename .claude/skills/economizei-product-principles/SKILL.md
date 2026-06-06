---
name: economizei-product-principles
description: Aplica os princípios fundamentais de produto do Economizei a qualquer decisão — features, copy, preço, roadmap, onboarding. Use SEMPRE que houver decisão de produto, priorização, escolha entre opções, ou avaliação de ideia. Não use para tarefas de execução técnica pura (código, debug).
---

# 🎯 economizei-product-principles

## Objetivo
Servir como filtro de qualidade para qualquer decisão de produto no Economizei. Garante que toda escolha respeite "zero atrito", o modelo Spotify (grátis funciona de verdade, pago é melhor), a restrição de 1h/dia do Gabriel e o público classe B/C.

## Quando usar
- O Gabriel pediu uma feature, ajuste de produto, ou ideia de roadmap.
- Existe mais de uma opção em cima da mesa e precisa decidir.
- O Claude está prestes a sugerir algo "legal de ter" — esta skill é o freio.
- Toda revisão de pricing, plano, ou benefício por tier.
- Toda mudança de fluxo do bot (onboarding, comandos, alertas).

## Quando NÃO usar
- Debug de erro técnico (use `economizei-debugging`).
- Escrita pura de copy sem decisão de produto envolvida (use `economizei-copywriter`).
- Análise de métrica sem decisão atrelada (use `economizei-growth-analyst`).

## Skill companheira obrigatória
**`economizei-automation-triage`** — toda decisão de produto que vira execução passa por triagem 🤖/🤝/🛠️/🧍 antes de virar plano. O `product-principles` decide *o quê* fazer; o `automation-triage` decide *quem* faz cada etapa. Os dois juntos protegem a 1h/dia e impedem que o Gabriel vire executor de tarefa de robô.

## Entradas ideais
- Uma decisão a tomar, com pelo menos uma alternativa.
- Estado atual do CLAUDE.md (o Claude lê automaticamente).
- Hipótese sobre o impacto: "isso aumenta retenção W2? conversão? reduz churn?"

## Saídas esperadas
Sempre nesta ordem:

1. **Recomendação** (1 frase: o que fazer).
2. **Por quê** (referência explícita a 1–3 princípios desta skill).
3. **O que cortar/simplificar** se a opção avaliada falhar em algum princípio.
4. **Próximo passo concreto** que cabe em 1h.
5. Sugestão de **linha pra adicionar no CLAUDE.md** (Decisões Tomadas) se a decisão for fechada.

## Regras de comportamento

### Os 7 princípios não-negociáveis
1. **Zero atrito é o produto.** Toda etapa nova precisa justificar sua existência. Default é remover.
2. **Bom, barato e útil — grátis funciona de verdade.** Free resolve a dor central. Pago é genuinamente melhor, não o grátis quebrado.
3. **WhatsApp é o produto.** Não introduza app, dashboard web, email ou SMS antes de exaurir o que dá pra fazer no WhatsApp.
4. **Frame "ser esperto", não "disciplina".** Toda decisão de copy/posicionamento usa orgulho brasileiro de "não dar mole / saber das coisas".
5. **1h/dia é o orçamento.** Toda feature que exija manutenção semanal acima disso precisa ser automatizada ou cortada.
6. **Validar antes de construir.** Antes de qualquer feature nova, pergunte: "isso muda retenção W2 ou conversão?" Sem resposta clara, não constrói.
7. **Beta Fundador é vitalício.** Toda comunicação reforça que quem entra agora ganha preço travado + 3 meses Individual quando o paywall vier.

### Hierarquia de tradeoffs (quando dois princípios entram em conflito)
1. Zero atrito > Sofisticação
2. Validar > Polir
3. Útil grátis > Lock-in artificial
4. Simples > Completo
5. Registrado no CLAUDE.md > Decisão "óbvia" implícita

## Fluxo de execução

```
1. Receber a decisão.
2. Listar mentalmente os princípios afetados.
3. Verificar se a decisão fere algum princípio não-negociável.
   - Se ferir → propor alternativa que respeite os 7.
   - Se não ferir → seguir.
4. Aplicar a hierarquia de tradeoffs.
5. Calcular custo em horas (caber em 1h).
6. Entregar a recomendação no formato da "Saída esperada".
7. Oferecer a linha de CLAUDE.md.
```

## Checklist de qualidade (antes de entregar)
- [ ] A recomendação cabe em 1 frase?
- [ ] Está claro qual princípio justifica a escolha?
- [ ] O próximo passo cabe em 1h?
- [ ] Há linha de CLAUDE.md sugerida?
- [ ] A opção rejeitada foi nomeada com motivo?
- [ ] Não há sugestão de app/dashboard/email "porque seria legal"?

## Erros comuns a evitar
- **Sugerir feature porque "outros SaaS têm".** Sempre voltar pra dor do usuário B/C.
- **Adicionar atrito "leve" sem perceber.** Pedir cadastro, número de família, foto adicional — tudo é atrito.
- **Quebrar o free pra empurrar upgrade.** Trai o princípio "grátis funciona de verdade".
- **Plano com 20 funcionalidades.** Plano vira lista; lista perde foco.
- **Esquecer da limitação de 1h.** Propor algo bonito que toma 4h por semana de manutenção.
- **Falar como gringo:** "budget", "mindful spending", "track expenses" — não cola no Brasil B/C.

## Exemplo de uso prático

**Pergunta:** "Devo adicionar um comando `/meta` pro usuário definir uma meta de gasto mensal e o bot avisar?"

**Aplicação da skill:**

> **Recomendação:** Não fazer agora. Adiar para depois do Mês 3.
>
> **Por quê:** Fere 3 princípios. (1) Zero atrito: definir meta exige pensamento prévio, contraria "manda foto e pronto". (2) Validar antes de construir: nada na pesquisa pediu meta — pediram alerta inteligente reativo. (3) 1h/dia: meta exige UX de edição/reset que vira manutenção contínua.
>
> **O que cortar/simplificar:** se quiser sinal de "extrapolei", já entrega isso no alerta inteligente (Pago). Não vira feature separada.
>
> **Próximo passo concreto:** registrar como "ideia parada" no CLAUDE.md e voltar a olhar quando tiver 30 pagantes ativos (Mês 3+).
>
> **Linha pra CLAUDE.md:** `| 2026-05-13 | Comando /meta adiado para Mês 3+ | Fere zero atrito; não pedido na pesquisa; alerta inteligente já cobre o caso |`
