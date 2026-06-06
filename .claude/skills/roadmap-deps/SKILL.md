---
name: roadmap-deps
description: Força mapeamento de dependências, critérios de saída e riscos sempre que um roadmap ou planejamento é construído. Não deixa um plano passar como "wishlist datada" — exige grafo de dependências, gatilhos de transição entre fases, e identificação de gargalo único. Dispare quando o usuário disser "vamos planejar", "monta um roadmap", "plano pras próximas semanas/meses", "/roadmap-deps", ou quando um documento de planejamento estiver sendo criado/revisado.
---

# Roadmap Dependency Mapping — anti-wishlist em planejamento

## Por que esta skill existe

A auditoria de 2026-05-19 (`Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md`, ponto A.2.7) identificou que o roadmap macro do Economizei tinha 4 fases (Mês 1, 2, 3, 4+) mas **nenhuma dependência mapeada, nenhum critério de saída, nenhum gatilho de transição**. Isso é wishlist datada, não plano. Esta skill garante que isso não se repita.

## Quando disparar

- Início de sessão onde o usuário menciona "roadmap", "planejamento", "próximas semanas/meses", "fases", "etapas".
- Quando um arquivo `*Plano*.md`, `*Roadmap*.md`, `*Etapas*.md` está sendo criado ou editado.
- Quando o usuário decompõe um problema em "primeiro X, depois Y, depois Z".
- Antes de aprovar qualquer roadmap escrito em sessão.

## O que esta skill exige no plano

Todo plano que sai com esta skill ativa **precisa conter, no mínimo:**

### 1. Tabela de fases com critério de saída

| Fase | Objetivo único da fase | Critério de saída (mensurável) | Saída atual? |
|---|---|---|---|
| 1 | (1 frase) | (métrica + valor mínimo) | ✅ / ❌ / ⏳ |
| 2 | ... | ... | ... |

**Regra:** critério de saída tem que ser **observável sem ambiguidade**. Não vale "ter validado". Vale "≥ 40% de W2 retention em cohort de ≥ 30 usuários".

### 2. Grafo de dependências (lista bloqueante)

Para cada tarefa/marco crítico, listar **explicitamente o que precisa estar pronto antes**. Formato:

```
- Tarefa X
  └─ Bloqueada por: Tarefa A, Tarefa B (motivo curto)
  └─ Bloqueia: Tarefa Y, Tarefa Z
```

**Regra:** se uma tarefa não tem dependências para cima nem para baixo, **questionar se ela deveria estar no plano**. Tarefas órfãs costumam ser ruído.

### 3. Caminho crítico identificado

Uma única linha: "O caminho crítico do plano é: A → B → C → D. Se qualquer um atrasa, todo o resto atrasa."

**Regra:** se não consegue identificar caminho crítico, o plano está mal modelado.

### 4. Gargalo único da próxima janela

Uma única frase respondendo: **"Qual a UMA coisa cujo atraso mata o plano nas próximas 2 semanas?"**

Não é uma lista. É uma frase. Aponta para um arquivo, uma decisão pendente, ou uma dependência externa.

### 5. Riscos com mitigação

Tabela de no mínimo 3 riscos:

| Risco | Probabilidade (B/M/A) | Impacto (B/M/A) | Mitigação concreta |
|---|---|---|---|
| ... | ... | ... | (ação específica, não "estar atento") |

**Regra:** "estar atento", "monitorar", "ficar de olho" não são mitigações. Mitigação é uma ação executável com responsável.

### 6. Buffer explícito

Total de horas/dias previstos no plano + linha clara: **"Buffer: X% do total (recomendado ≥ 20%)"**.

**Regra:** plano sem buffer é plano que vai estourar. Se buffer < 20%, listar quais tarefas são cortáveis.

## Anti-padrões que esta skill deve flagar imediatamente

- ❌ "No Mês 3 lançar o pago" — sem critério de entrada na fase.
- ❌ "Meta: 100 usuários" — sem rota de aquisição definida + sem buffer.
- ❌ Lista de bullet points sem ordem ou dependência.
- ❌ Fase com mais de 2 objetivos (foco diluído = nada feito).
- ❌ "Próximos passos" listados como bullets sem owner, deadline ou critério de "feito".
- ❌ Uso de "validar", "explorar", "entender" sem critério observável.
- ❌ Roadmap > 12 semanas sem checkpoints intermediários.

## Fluxo de execução

### Passo 1 — Identificar que estamos em modo planejamento

Indicadores: usuário disse "vamos planejar", "monta um roadmap", "fases", ou está editando arquivo `*Plano*.md` / `*Roadmap*.md`.

### Passo 2 — Antes de escrever o plano

**Antes** de gerar o roadmap, fazer ao usuário (via AskUserQuestion ou perguntas inline) **3 perguntas obrigatórias**:
1. "Qual é o critério mensurável que diz que a fase 1 acabou?"
2. "O que tem que estar pronto pra fase 2 começar (dependências)?"
3. "Se uma coisa atrasar nas próximas 2 semanas, qual seria?"

Se o usuário não consegue responder, **flagar publicamente** que o plano ainda não está pronto pra ser escrito.

### Passo 3 — Estruturar o plano com os 6 elementos obrigatórios

Cada plano gerado por esta skill **precisa ter as 6 seções** (Fases+Critérios, Dependências, Caminho Crítico, Gargalo Único, Riscos, Buffer). Sem exceção.

### Passo 4 — Auto-review

Ao final do plano, rodar checklist:

- [ ] Toda fase tem critério de saída mensurável?
- [ ] Toda tarefa crítica tem dependência mapeada (bloqueia/bloqueada por)?
- [ ] Caminho crítico está nomeado em uma linha?
- [ ] Gargalo único está nomeado em uma frase?
- [ ] Riscos têm mitigação concreta (não "estar atento")?
- [ ] Buffer ≥ 20% do tempo total?

Se qualquer item falha: avisar usuário antes de salvar.

### Passo 5 — Salvar

Salvar em pasta apropriada (`Economizei app/` para planos do projeto). Adicionar referência no `CLAUDE.md` se for plano macro.

## Conexão com o projeto Economizei

- Roadmap macro está em `CLAUDE.md` seção 6.
- Planos táticos por semana em `Economizei app/Economizei_Plano_Semana_*.md`.
- Auditoria pendente em `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` ponto A.2.7 (roadmap macro precisa de critério de saída).
- Restrição operacional: 1h/dia, 1 pessoa. Planos que ignoram isso são automaticamente irrealistas — flagar.

## Saída esperada (template mínimo)

```markdown
# Roadmap — <nome>
Data: <YYYY-MM-DD> · Janela: <X semanas/meses>

## Caminho crítico
A → B → C → D

## Gargalo único das próximas 2 semanas
<uma frase>

## Fases

### Fase 1 — <nome>
**Objetivo único:** ...
**Critério de saída:** ...
**Sai dessa fase quando:** <métrica>

### Fase 2 — ...

## Dependências
- Tarefa X
  └─ Bloqueada por: ...
  └─ Bloqueia: ...

## Riscos
| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| ... | ... | ... | ... |

## Buffer
Total previsto: X horas. Buffer: Y horas (Z% do total).
Tarefas cortáveis se o buffer estourar: ...
```
