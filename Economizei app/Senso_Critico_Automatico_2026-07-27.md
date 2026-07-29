# 🧠 Senso Crítico Automático — Sessão 2026-07-27 (3ª)

> **Pedido do Gabriel (verbatim):** *"Você acha que seria possível adicionar no nosso projeto um tom de me dar conselhos ou de dar sugestões em tempos em que eu não peço mas que podem ser aplicadas pra um melhor trabalho? Ou seja, aplicar um senso crítico de certa forma no trabalho quando eu mandar um request que seja sem sentido ou que possa ser feito de uma forma melhor, eu quero que a máquina identifique isso automaticamente, tenha um pensamento gerando no fundo pra que isso aconteça e nós possamos melhorar conforme o tempo."*

---

## ⚡ Resumo executivo

🎯 **Decisão:** ligar um **senso crítico automático** no fluxo de trabalho — skill transversal `economizei-critical-partner`, que roda em todo pedido não-trivial, **para antes de executar** quando detecta atrito real, e **aprende com o tempo** via `CRITICA_LOG.md`.

**O que foi feito (tudo já aplicado nos arquivos):**

- Criada a skill `.claude/skills/economizei-critical-partner/SKILL.md` — 🤖
- Criado `Economizei app/CRITICA_LOG.md` (memória + placar dos detectores) — 🤖
- Plugada no boot e nos comportamentos default (`PROJECT_INSTRUCTIONS.md` §1, §2.1, §3, §5, §6, §7) — 🤖
- Registrada na memória institucional (`CLAUDE.md` topo, §8, §11 regra 12) e sincronizada a contagem 18 → **19 skills** (`README.md` de skills, `CODE_GUIDE.md`, `AGENDA.md`, `Projeto_Claude_CONTEXTO_2026-07-26.md`) — 🤖

**Hoje (≤1h):** nada obrigatório. A skill já está ativa na próxima sessão. Se quiser, teste mandando um pedido que você **sabe** que fura uma regra e veja se o 🛑 aparece.
**Próxima sessão:** o log começa a receber linhas reais. Na 3ª ou 4ª sessão dá pra ler o placar e ver quais detectores estão calibrados.
**Bloqueadores:** nenhum. Zero código de produto tocado, zero risco financeiro, nada que dependa da empresa BC.

---

## 📋 Relatório completo

### 1. O diagnóstico: por que isso faltava

O sistema já tinha muita inteligência — 18 skills, firewall financeiro, checkpoints, sentinela semanal. Mas todas elas respondiam a uma de duas coisas: **um tópico** (copy → copywriter, bug → debugging) ou **um pedido explícito** ("faz um SWOT" → strategic-review).

Não havia nada olhando para **o pedido em si**. Se você mandasse construir a coisa errada, o sistema construía a coisa errada com competência, dentro de todos os princípios, e registrava a decisão no CLAUDE.md. O ponto cego era estrutural: **você trabalha sozinho e ninguém revisa a sua direção.** A `strategic-review` chega perto, mas é reativa — ela só roda quando você já desconfia que algo está errado. O problema mora justamente nos pedidos em que você **não** desconfia.

### 2. As 3 decisões de design (suas escolhas)

| Decisão | Escolha | Por quê importa |
|---|---|---|
| **Gatilho** | Só quando há **atrito real** | Um crítico que fala em todo pedido vira ritual ignorado. Silêncio por padrão é o que preserva o peso do 🛑 quando ele aparece. |
| **Formato** | **Para e pergunta** antes de executar | Você escolheu o mais rigoroso. Custa uma ida-e-volta, mas evita gastar sua hora construindo algo que ia ser refeito. Mitigado por: bloco de ≤5 linhas, máx. 1 por pedido, `AskUserQuestion` quando houver opções. |
| **Aprendizado** | **Log próprio** (`CRITICA_LOG.md`) | Sem memória o crítico não evolui, só repete. É a peça que responde ao seu "possamos melhorar conforme o tempo". |

### 3. Como funciona na prática

**Os 6 detectores** — cada um ancorado numa regra que já existe no projeto, não em opinião genérica:

| Código | Dispara quando | Exemplo real no Economizei |
|---|---|---|
| **D1** 🔴 | Contradiz decisão travada (CLAUDE.md §8/§11) | Pedir gíria no texto do bot (regra 4); escalar ads antes de W2 ≥ 30% (regra 7) |
| **D2** 🔴 | Risco financeiro / LGPD / classificação | Mexer no `nome_canonico` sem rodar o corpus de regressão |
| **D3** 🟠 | Existe caminho ≥50% mais barato | Pedir feature nova quando um comando existente já resolve |
| **D4** 🟠 | Premissa não validada | "Os usuários querem X" sem pesquisa; número sem source |
| **D5** 🟡 | Não move W2 nem conversão Free→Pro | Polir algo que não afeta as duas únicas métricas que valem até out/2026 |
| **D6** 🟡 | Sequenciamento invertido | Trabalho novo enquanto um 🔴 do painel "Ações do Gabriel" está parado |

**Os 4 filtros anti-falso-positivo** (rodam antes de qualquer 🛑): tenho evidência citável? já foi decidido antes? o pedido é exploratório? é preferência sua e não erro? Se falhar em qualquer um, a skill **não fala**.

**O bloco de interrupção** é fixo e curto de propósito:

```
🛑 Antes de executar — [D#] [severidade]
Você pediu: ...
O atrito: ... (com evidência: doc, linha, git ou número)
Alternativa: ...
Sigo com o seu, com o meu, ou ajusto?
```

**A parte proativa** (o "conselho que eu não pedi") é separada: **máximo 1 observação lateral por sessão**, sempre no fim da entrega, em 2 linhas, e só se for acionável e barata (≤1h) ou um risco silencioso.

### 4. O ciclo de aprendizado — a parte que responde ao "melhorar com o tempo"

```
apontamento → 1 linha no CRITICA_LOG.md → placar por detector
                                              ↓
     3 acatos pelo mesmo motivo  →  vira REGRA PERMANENTE (CLAUDE.md §11)
     3 recusas pelo mesmo motivo →  o DETECTOR é recalibrado ou desligado
```

O segundo braço é tão importante quanto o primeiro: se um detector te incomoda três vezes e você recusa as três, **o errado é o detector, não você**. Sem isso, a skill vira chata e você desliga tudo — que é como a maioria dos sistemas de "revisor automático" morre.

Efeito colateral útil: o log também vira um retrato honesto dos seus padrões de decisão. Depois de uns dois meses, ele responde a perguntas que hoje ninguém responde — tipo *"eu costumo subestimar custo de quê?"*.

### 5. Riscos assumidos (e as travas)

| Risco | Trava embutida |
|---|---|
| Virar ruído e você ignorar | Silêncio por padrão + máx. 1 interrupção/pedido + proibição explícita de "analisei e está tudo certo" |
| Atrapalhar sua 1h com ida-e-volta | Bloco de ≤5 linhas; `AskUserQuestion` quando houver opções; nada de análise longa antes da sua resposta |
| Crítica sem base ("achismo") | Regra 4 da skill: **evidência ou silêncio** — todo apontamento cita doc, linha, git ou número |
| Insistir em algo já decidido | Filtro 2 lê o log antes de falar; apontamento já recusado não volta |
| Soar condescendente | Regra 1: crítica ao **pedido**, nunca à pessoa. E você decide sempre — a skill tem voz, não voto |

### 6. Fronteiras (o que essa skill NÃO é)

- Não substitui a `strategic-review` — aquela é sob demanda, essa é o inverso (você **não** pediu).
- Não substitui o `financial-firewall` — o D2 só **encaminha** para ele.
- Não decide nada. Ela interrompe, mostra a evidência, e você resolve.

### 7. Registro

- `CLAUDE.md` §8: 1 linha de decisão (2026-07-27).
- `CLAUDE.md` §11: regra permanente **12 — "Pedido não é ordem cega"** (com o seu verbatim).
- `PROJECT_INSTRUCTIONS.md`: skill na tabela transversal (7 → 8 skills sempre ligadas), regra 11 de operação, passo de boot (ler o log), passo de fim de sessão (atualizar o log), controles de invocação manual.
- Contagem sincronizada em 4 arquivos: 18 → **19 skills**.
