# 🔍 Auditoria dos Seus Comandos + Template de Trabalho — 2026-07-21

> Análise de como você (Gabriel) escreve os comandos pra mim ao longo das sessões, o que se repete, onde a gente perde tempo, e um template pra deixar a relação coesa mesmo quando seus pedidos mudarem. Você pediu essa auditoria; ela **não** altera nenhuma decisão de negócio nem o CLAUDE.md.

---

## 1. Base da análise

Puxei as **81 sessões** locais deste projeto. Dessas, ~**30 são automáticas** (rotina matinal, painel semanal, sentinela, lembrete de sexta — não contam como "seus comandos") e ~**43 foram iniciadas por você**. Li uma amostra representativa dos 6 tipos: estratégia/próximos passos, código, git/commit, definição de comando (skill/`/entregar`), marketing e pessoais.

O que segue tem evidência real das suas frases — não é impressão minha.

---

## 2. Os 5 padrões que encontrei

**① Você comanda em dois registros muito diferentes.**
Nos pedidos de trabalho, você é telegráfico e reativo — cola um erro e escreve *"como resolver o problema"*, ou *"gere um prompt para eu colocar no ideogram"*. Nos pedidos pessoais, você é rico em contexto — na sessão da planta você deu ambiente, luz, o que fez, o que te preocupa e a pergunta exata, tudo num parágrafo. A diferença não é falta de capacidade: no trabalho você **confia que a memória (CLAUDE.md/AGENDA) carrega o contexto**, então economiza palavras. Isso funciona na maior parte do tempo, mas cobra um preço (ver ponto ④).

**② Você me usa como orquestrador de outras ferramentas.**
Um pedaço grande dos seus comandos é *"me gere um prompt pra X"* — Ideogram, Claude Opus (`/tarefa`), outro agente. Você não quer só a resposta; quer o **insumo pronto pra próxima ferramenta**. É um padrão sofisticado e vale otimizar de propósito (o template abaixo tem um campo pra isso).

**③ Você investe pesado em estrutura — mais que a maioria.**
CLAUDE.md, AGENDA.md, CODE_GUIDE.md, PROJECT_INSTRUCTIONS, 18 skills, firewall, checkpoints, sentinela agendada. Você basicamente **engenhou um jeito de não precisar re-explicar o contexto toda vez**. Ótimo instinto. O risco: quanto mais a memória carrega, mais o sucesso depende dela estar **exata** — e ela derrapa (ponto ⑤).

**④ O maior atrito não é o comando — é executar o que eu entrego.**
Isto apareceu repetidamente e é o achado mais importante:
- *"aonde devo rodar o passo 0?"*
- *"me mande então aqui no chat os próximos passos porque não consigo copiar da outra maneira"*
- *"me mande um passo a passo para as pendências que exigem minhas ações, junto com prompts e aonde inserir os comandos"*

Ou seja: eu entrego em arquivo, e você tem dificuldade de copiar dele e de saber **onde** rodar cada coisa (Supabase? Railway? terminal?). Você é administrador, não dev de terminal — e boa parte da fricção da nossa relação mora exatamente aí, no "último metro" entre a minha entrega e a sua ação.

**⑤ Você reabre os mesmos 3 assuntos porque o estado derrapa.**
Contando pelos títulos e conteúdo das sessões:
- **"Qual é o estado / o que vem agora"** — ~8 sessões (Strategic next steps, Project next steps, Agenda tasks, Agenda pending decisions, Session agenda, Project plans, AGENDA optimization…).
- **Git / commit / push** — ~5 sessões (Comando entregar, Automated commit, Git process error, Git push ordering, Firewall bypass).
- **Auditoria / revisão** — ~6 sessões (Complete audit, Project audit tasks, Code review, Automated review…).

Você não volta nesses assuntos por indecisão — volta porque **a AGENDA fica "stale" em relação ao git** (isso aparece explicitamente em várias sessões como "reconciliação AGENDA×git"). Como o commit acontece na sua máquina, fora da sessão, a memória e a realidade divergem, e a sessão seguinte começa com "deixa eu descobrir onde a gente parou". Isso é gasto de tempo evitável.

---

## 3. Os 3 pontos de maior fricção (o que trava a relação)

1. **O "último metro" da execução.** Entrego em formato que você não consegue acionar sozinho sem me pedir de novo "manda no chat / onde rodo isso".
2. **Estado que derrapa entre sessões.** Commit fora da sessão → AGENDA stale → próxima sessão gasta tempo reconstruindo onde parou.
3. **Comando magro no que a memória NÃO sabe.** A memória sabe a estratégia toda, mas não sabe o objetivo **desta** sessão nem a sua "definição de pronto". Quando isso falta, eu preencho com suposição — e às vezes erro o alvo.

---

## 4. O que mudar (5 recomendações práticas)

1. **Adote "chat-first" como padrão pro que é executável.** Sempre que a entrega for comando (SQL, git, env, terminal), peça no próprio comando: *"entregue os passos no chat, em blocos copiáveis, com o local exato de cada um"*. Isso mata os pedidos ⑤ recorrentes de uma vez. (Já virou campo no template.)
2. **Sempre exija o "onde".** Todo passo executável deve vir marcado com **onde roda**: `[Supabase SQL Editor]`, `[Railway → Variables]`, `[terminal em C:\Economizei]`. Peça isso uma vez no comando e não precisa repetir "aonde devo rodar".
3. **Fixe um ritual de abertura** (seção 6) pra colapsar as ~8 sessões de "qual o próximo passo" numa só frase padrão.
4. **Diga sempre a "definição de pronto".** Uma linha: "termina quando X". É o que mais falta nos seus comandos magros.
5. **Separe pessoal de trabalho.** Planta, cultivo, visto do Canadá caem na mesma pasta do Economizei. Não quebra nada, mas polui o contexto. Se der, use outra conversa/espaço pra pessoal.

---

## 5. 🧩 O Template de Comando (o pedido central)

A ideia: **você não precisa re-especificar o que a memória já sabe.** O template só pede o *delta* — o que muda nesta sessão. Ele é coeso e continua valendo mesmo quando seus pedidos mudarem, porque os campos são sobre a *forma* do trabalho, não sobre o assunto.

### 5a. Versão completa (pra tarefa de peso — código, decisão, entrega)

```
OBJETIVO: (1 linha — o que quero ter no fim desta sessão)

ÁREA: código | estratégia | marketing | financeiro | memória | pessoal
  → dispara as skills certas e o firewall; me diz se posso "plano-e-segue"

CONTEXTO NOVO: (só o que a memória NÃO sabe — o que mudou desde a última vez.
  Se nada mudou, escreva "só o que está na AGENDA")

DEFINIÇÃO DE PRONTO: (como sei que terminou — ex: "284 testes verdes + doc atualizado")

FORMATO DE ENTREGA:
  - chat-first (blocos copiáveis + ONDE roda cada um) para comandos executáveis
  - arquivo .md para documento/estratégia
  - prompt pronto para outra ferramenta (Ideogram / Opus /tarefa / etc.)

RESTRIÇÕES: (o que NÃO fazer — ex: "não tocar em pagamento/is_pro", "sem gíria no bot")
```

### 5b. Versão rápida (pro dia a dia — cabe numa linha)

> **[ÁREA] OBJETIVO — entregue [FORMATO], pronto quando [DEFINIÇÃO DE PRONTO].**

Exemplos reais reescritos:
- `[código] fecha o bypass do firewall por rename — entregue os comandos no chat com o local de cada um, pronto quando o selftest der 19/19.`
- `[marketing] prompt de logo pra V6 no Ideogram — entregue o prompt pronto pra colar, pronto quando cobrir cor, formato e o que NÃO incluir.`
- `[memória] reconcilia AGENDA com o git e me diz só o próximo passo — pronto quando a fila refletir os últimos commits.`

### 5c. Regra de ouro do formato (cola isto quando for executar)

> "Todo passo que eu preciso rodar vem **no chat**, em bloco copiável, marcado com **onde** (Supabase / Railway / terminal), na **ordem** que não pode inverter. Nada só em arquivo."

---

## 6. 🔁 Ritual de abertura fixo (mata as sessões repetidas)

Em vez de abrir uma sessão nova toda vez perguntando "o que vem agora?", use **sempre a mesma frase**:

> **"Leia CLAUDE.md + AGENDA.md, reconcilie a AGENDA com o git, e me diga em 3 linhas: (1) o que está pronto, (2) o que está em revisão, (3) qual o único próximo passo. Não faça mais nada até eu escolher."**

Isso transforma ~8 sessões dispersas de "estado/próximo passo" num **ritual de 30 segundos** com resposta sempre no mesmo formato — e resolve o problema da memória stale logo na primeira mensagem, em vez de no meio da sessão.

---

## 7. Antes → Depois (seus comandos reais)

| Você escreveu | Por que custou tempo | Reescrito |
|---|---|---|
| *"como resolver o problema"* (+ erro colado) | Sem área nem "definição de pronto"; tive que inferir | `[código] resolve esse erro de git lock — me dá os comandos no chat com onde rodar, pronto quando o git add funcionar.` |
| *"me mande um passo a passo… junto com prompts e aonde inserir"* | Você já teve que **pedir** o "onde" — devia ser padrão | Com o template, "chat-first + onde roda" já está implícito; não precisa pedir. |
| *"gere um prompt para eu colocar no ideogram"* | Não disse a variação → gerei 2 no chute | `[marketing] prompt Ideogram da logo V6 — cobre cor #, formato flat e o que NÃO incluir.` |

---

## 8. Uma regra de ouro pra fechar

**Seu contexto já está guardado. O que falta nos seus comandos não é mais informação sobre o Economizei — é o alvo desta sessão e o formato que você consegue acionar.** Especifique só isso (objetivo + definição de pronto + "chat-first com onde roda") e a nossa relação fica coesa mesmo quando o assunto mudar, porque o *esqueleto do comando* nunca muda.

Se quiser, no fim desta sessão eu registro esse template como uma **regra permanente** no seu sistema (uma linha no PROJECT_INSTRUCTIONS ou uma skill leve tipo `economizei-command-template`), pra ele carregar sozinho toda vez — aí você nem precisa lembrar dele.
