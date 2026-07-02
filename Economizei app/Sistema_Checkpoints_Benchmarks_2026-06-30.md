# 🎯 Sistema de Checkpoints & Benchmarks — Economizei

**Data:** 2026-06-30
**Por que existe:** a Máquina Local produz código sozinha. Sem um ritmo definido de revisão, ou você revisa de menos (e acumula 4 dias de trabalho não commitado, como aconteceu agora) ou revisa de mais (e a revisão vira a tarefa). Este documento define **a cadência** — nem toda hora, nem raro — e **o que olhar** em cada nível, nos **dois lados**: a máquina que constrói e o software que roda.

> **A métrica em uma frase:** o **checkpoint integral** dispara quando o **primeiro** destes acontecer — (a) uma **cadeia de features fecha**, (b) **5 tarefas commitadas** desde o último checkpoint, ou (c) **3 semanas** corridas com a máquina ativa. **Piso:** no máximo **1 checkpoint por semana** (pra não virar burocracia). Cadeia longa (>4 tarefas) ganha **1 pausa de meio**.

---

## 🧭 Os 3 níveis de verificação

Pense em camadas, da mais frequente/barata pra mais rara/profunda.

### Nível 1 — Gate por tarefa *(toda vez · minutos · já existe)*
Roda em **cada** tarefa que a máquina entrega. É o piso de segurança que nunca se pula.

- `npm run check` = firewall financeiro + todos os testes + validação de páginas.
- Você revisa o diff daquela tarefa.
- Commita se verde; `git checkout .` se não.

**Não é "checkpoint"** — é higiene básica de cada commit. O sistema de checkpoints (Níveis 2 e 3) é o que se soma a isso.

### Nível 2 — Checkpoint integral *(por marco/volume/tempo · ~1h · o coração deste doc)*
É a **"revisão geral"** que você pediu. Dispara pela métrica do topo. Cobre os **dois lados** (máquina + software) com o checklist abaixo. Resultado: um parágrafo de veredito (verde/amarelo/vermelho) + ações, registrado no `CLAUDE.md`.

**O gatilho composto (o primeiro que bater):**

| Gatilho | Quando | Por quê |
|---|---|---|
| **Fim de cadeia** | Uma cadeia de features fecha (ex.: Agente `cod-0010→0017`; Alerta Pro `cod-0030→0036`; Comparativo `cod-0020`) | O usuário passa a sentir um pedaço novo de produto — hora de olhar o conjunto, não só o último diff |
| **Volume** | 5 tarefas commitadas desde o último checkpoint | Evita acumular muita mudança sem uma visão de conjunto, mesmo que nenhuma cadeia tenha fechado |
| **Tempo** | 3 semanas corridas de máquina ativa | Teto de segurança — não passar muito tempo sem um olhar integral |

**Piso anti-burocracia:** nunca mais de **1 checkpoint integral por semana**. Se dois gatilhos baterem na mesma semana, conta como um só.

**Pausa de meio (cadeia longa):** se uma cadeia tem **mais de 4 tarefas**, faça um **mini-checkpoint** no ponto médio — versão leve do Nível 2, só pra confirmar que a fundação está de pé antes de empilhar o resto. Exemplo concreto: a cadeia do **Agente de Perguntas** tem 8 tarefas (`cod-0010→0017`) → pausa em `cod-0013/0014` (classificador + render prontos) antes de seguir pro orquestrador.

### Nível 3 — Auditoria profunda *(trimestral ou em marco grande · meio dia · rara)*
A auditoria completa, tipo `Auditoria_Codigo_Direcao_2026-06-25.md`. Não olha só os diffs recentes — olha **arquitetura, dívida técnica, direção, segurança e o alinhamento memória × código**. Dispara: a cada **~3 meses**, ou antes de um **marco grande** (lançar de verdade, escalar ads, abrir o pago). Pode usar um subagente dedicado pra auditar.

---

## 🔍 O checklist do Checkpoint Integral (Nível 2)

Rode os dois lados. Marque verde/amarelo/vermelho em cada e feche com um veredito.

### 🤖 Lado A — Máquina de Programação *(o processo está saudável?)*
1. **Working tree commitado?** Nada de empilhar rodadas (a falha de agora). Working tree limpo e sincronizado com `origin/main`.
2. **AGENDA × git em sincronia?** Toda tarefa "em revisão" que já foi commitada vira "Concluído"; a fila reflete a realidade (a reconciliação que você fez em 06-26).
3. **Firewall nunca burlado?** Confirmar que todo diff do período passou no `check:firewall`; nenhum token financeiro escapou.
4. **Tarefas certas, ordem certa?** A máquina pegou as tarefas na prioridade definida e **declarou as skills** que usou (Gatilho de Skills).
5. **RELATÓRIO sendo lido e agido?** O `RELATORIO_MATINAL.md` de cada run foi revisado e a ação tomada (commit ou descarte).

**Métricas de saúde da máquina:** tarefas commitadas no período · dias desde o último commit · % de runs que fecharam verde · nº de rodadas acumuladas sem revisão (meta: 0–1).

### 🛒 Lado B — Software / Produto *(o bot funciona de verdade?)*
1. **Suíte completa verde na SUA máquina** (não só no sandbox — aqui o `sharp` engana).
2. **Corpus de classificação verde** (`cod-0027`) — a classificação é o **coração**; se o corpus quebra, toda inteligência por cima mente.
3. **Teste end-to-end manual:** mandar **2–3 cupons reais** e conferir os outputs (total, %, categoria, `nome_canonico`). Os testes unitários **não** pegam o Gemini real — só este passo pega "número inventado" (o bug de 06-07).
4. **Comandos principais respondem:** `/gastos`, `/inflacao`, `/economia`, `/cortar`, `/apagar` — e o Agente/Alerta Pro quando existirem.
5. **Saúde de produção:** uptime do `/health` · custo do Gemini dentro do orçado · cupons processados ÷ enviados ≥ 90%.

**Métricas de saúde do software:** suíte verde (sim/não) · corpus verde (sim/não) · custo Gemini/mês · uptime semanal · nenhum output incoerente nos cupons de teste.

---

## 📌 O checkpoint que você já tem marcado: o Agente de Perguntas (chat automático)

Você citou exatamente este caso: *quando a gente chegar na função de chat automático — a pessoa manda qualquer mensagem e o chat entende e responde com número/dado — fazemos uma revisão geral.*

Isso é um **checkpoint de Nível 2 com ênfase pesada no Lado B**, disparado por **fim de cadeia** (`cod-0017`, o orquestrador ligado no fluxo de texto). Roteiro específico desse checkpoint:

- Mandar **muitas perguntas em texto livre** ("quanto gastei esse mês?", "e em bebida?", "comparado com maio?") e off-topic ("qual o clima hoje?").
- Confirmar o **firewall de fidelidade numérica** (`conferirFidelidadeNumerica`, da `cod-0011`): **nenhum número fora do dado** — em dúvida, cai no template.
- Confirmar a **cota** (30/mês) e o **aviso do meio**.
- Confirmar o **off-topic**: assunto de finanças → responde a intenção mais provável; fora disso → pergunta de volta, não inventa.
- Só depois de tudo verde, considerar a **Opção B** (chat aberto / function-calling, `cod-0018`).

E, por ser cadeia longa (8 tarefas), a **pausa de meio** em `cod-0013/0014` evita chegar no fim com um problema de fundação.

---

## ⏱️ Como isso roda na prática

1. A cada tarefa: **Nível 1** (você já faz).
2. Quando bater o gatilho composto: **Nível 2** — abre este checklist, fecha com veredito de uma linha, registra no `CLAUDE.md` (decisão/aprendizado).
3. A cada ~3 meses ou marco grande: **Nível 3** — auditoria profunda.

> **Onde mora a contagem:** o nº de tarefas desde o último checkpoint e a data do último checkpoint ficam no topo da `AGENDA.md` (campo "Último checkpoint"). Assim, em toda sessão, dá pra ver se já está na hora.

**Próximo checkpoint integral previsto:** ao fechar a **promessa do pago** (comparativo `cod-0020` + cadeia Alerta Pro) **ou** ao ligar o **Agente** (`cod-0017`) — o que vier primeiro. Hoje você está commitando 5 tarefas de uma vez (acima do gatilho de volume = 5), então **vale rodar um Nível 2 logo após o push** desta leva.
