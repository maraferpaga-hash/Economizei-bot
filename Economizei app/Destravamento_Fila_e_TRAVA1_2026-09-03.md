# Destravamento da fila + correção da TRAVA 1 — 2026-09-03 (2ª sessão)

> Sessão pedida assim: *"vamos trabalhar em desbloquear a fila da agenda para que a programação continue e vamos trabalhar no problema da trava 1 que tinha sido mostrada anteriormente, faça o diagnóstico e me traga o que encontrou e possíveis soluções"*.
>
> Estado de entrada: `origin/main` = HEAD = `a4589ea`, working tree limpo de `.js`/`.mjs`, estoque **2/4**.
> Tudo abaixo foi **verificado no estado real** (regra 14), não copiado de relatório anterior.

---

## 1. TRAVA 1 — a pergunta estava errada, não o valor

### O que acontecia

`node scripts/estoque.mjs aplicar 2` era recusado no meio do `/entregar`, mesmo com a leva 1 já aplicada **e commitada**. Contornado à mão **4 vezes seguidas** (22/08, 25/08, 30/08 e agendado pra 5ª vez hoje), sempre do mesmo jeito: `limpar 1` logo após o commit, antes do `aplicar 2`.

### Causa-raiz

`scripts/estoque.mjs:303` usava um **proxy errado**:

| | pergunta feita | pergunta certa |
|---|---|---|
| TRAVA 1 (antes) | "a **pasta** da leva anterior sumiu?" | "o **conteúdo** da leva anterior já está no repositório?" |

Pasta é **ciclo de vida**; aplicação é **estado**. E as duas metades do sistema estavam certas isoladamente — o que não fechava era a junção:

- o `/entregar` (Etapa 6, passo 17) só chama `limpar` **depois do push, de propósito**: as Etapas 3 (passo 13) e 4 (passo 15) usam `git reset --hard origin/main` como desfazer, e isso **apaga os commits da sessão**. A pasta intacta é literalmente a rede de segurança;
- a TRAVA 1 lia a ausência dessa mesma pasta como prova de entrega.

Por isso o contorno funcionava (o conteúdo já estava no git quando a pasta era limpa) e por isso ele nunca poderia ser a solução: ele **desarma a rede** justamente no trecho em que ela existe pra proteger.

### Bug irmão, latente, que a TRAVA 1 vinha mascarando

`limpar N` comparava a leva **só com o working tree**. Numa cadeia real — duas levas tocando o **mesmo arquivo**, que é exatamente o caso que a REGRA 1 existe pra suportar — depois de aplicar as duas o disco tem a versão da leva 2, e `limpar 1` **recusaria**, dizendo que a leva 1 não foi aplicada. Não mordia ainda porque a TRAVA 1 impedia chegar nesse estado, e porque as duas levas de hoje são arquivos disjuntos.

### A correção

Nasce `conteudoJaEntregue(leva, rel)`. Uma leva anterior conta como satisfeita quando, **para cada arquivo dela**, vale um dos dois:

1. o arquivo no disco é **idêntico** ao da leva → aplicada (commitada ou não);
2. o conteúdo exato aparece no **histórico de HEAD** naquele caminho → foi commitado, e pode já ter sido **superado** por uma leva posterior no mesmo arquivo.

A TRAVA 1 e o `limpar` passam a usar a mesma função. **O doc do `/entregar` não muda**: a sequência que ele já descreve — aplicar → commit → aplicar → commit → push → limpar — passa a funcionar literalmente.

> **Erro meu no caminho, corrigido antes de entrar:** a 1ª versão usava `git cat-file -e` (o blob existe no banco de objetos?). O teste reprovou: um blob deixado por um `reset --hard` **passava como entregue**, ou seja, a trava deixaria passar uma leva cujo commit tinha sido desfeito. A versão final exige **alcançabilidade a partir de HEAD**, que é o que "está no repositório" de fato quer dizer.

### Prova

5 cenários, em repositórios descartáveis, contra o script original e o corrigido:

| Cenário | Original | Corrigido |
|---|---|---|
| leva 1 não aplicada → `aplicar 2` | recusa ✅ | recusa ✅ |
| leva 1 aplicada, commitada e **desfeita** por `reset --hard` | recusa ✅ | recusa ✅ |
| leva 1 aplicada **+ commitada**, pasta ainda presente → `aplicar 2` | **recusa ❌** | passa ✅ |
| `limpar 1` com o arquivo já superado pela leva 2 (cadeia) | (inalcançável) | limpa ✅ |
| arquivo editado à mão depois de aplicar → `aplicar 2` | recusa ✅ | recusa ✅ |

E a sessão inteira do `/entregar` rodada num **clone** com as **2 levas reais**, sem contorno nenhum: `aplicar 1` → commit → `aplicar 2` → commit → `limpar 1` → `limpar 2` → estoque vazio, **41/41 testes verdes**.

### Alternativas descartadas

- **Mudar o doc** (limpar logo após o commit): zero código, mas troca a rede de segurança explícita por "recupere pelo reflog" — pior de executar sob pressão, e o próprio `/entregar` proíbe `reset --hard` sem autorização.
- **Oficializar o contorno**: custo zero, mas é a 5ª repetição de um passo manual que existe só porque a ferramenta pergunta a coisa errada.

---

## 2. A fila não estava travada — estava **seca**

Nenhuma guarda disparou na rotina de hoje: working tree limpo, estoque 2/4 (não cheio), sem `index.lock`. O que faltava era **entrada elegível**.

- **Fila pronta: 6 itens, 6 inelegíveis.** cod-0075 `aguardando-decisao` (13 dias) · cod-0062/0072/0065 porte G (coração) · cod-0069/0070 `bloqueada-humano` · cod-0049 com um bloqueio **novo**, achado hoje pela própria rotina: o motivo registrado ("gated pelo S3") tinha vencido, e o gate real era o **cooldown, que não tinha onde ser gravado**.
- **Fila de lastro: esgotada.** las-01/03/04/05 entregues ou no estoque; las-02 e las-06 pausadas.

**5ª run consecutiva sem produção.** Aumentar o teto por run não resolveria: o gargalo é entrada de trabalho, não capacidade.

### As 4 decisões do Gabriel

| # | Decisão | Efeito |
|---|---|---|
| 1 | **TRAVA 1: corrigir o script** | contorno manual acabou; `limpar` em cadeia consertado junto |
| 2 | **cod-0049: autorizar a tabela de cooldown** | `supabase/migration_2026-09-03_insights_enviados.sql` escrita; tarefa vira `pronta` |
| 3 | **cod-0075: caminho (b)** — o Agente passa a mostrar mais de um comparativo pro Pro | deixa de ser fiação morta e vira mudança real de comportamento |
| 4 | **las-06: aprovar os 3 achados** | viram cod-0077 e cod-0078 |

Sobre a **cod-0075**: o achado de 21/08 foi reconfirmado no código hoje (`src/agent/intents.js:589-647`) — **não havia vazamento do gate Pro**. `template()` narra só `fato.destaque`, igual pra Free e Pro, e `mostrados`/`temMais` voltam do executor **sem consumidor**. O torto era o inverso do descrito: o Pro via *menos* pelo Agente (1 item) do que pelo `/comparar` (até 10). A decisão (b) fecha essa assimetria.

Sobre a **cod-0078**: os achados (2) e (3) do las-06 foram **unidos numa tarefa só** — são o mesmo endpoint no mesmo arquivo (`src/index.js:416-417`), e separar criaria dois diffs brigando pelas mesmas linhas, contra o critério de agrupamento da Máquina 2.0. E as correções foram pra **Fila pronta**, não pro lastro, como a própria nota do las-06 já mandava (achado em código de produção não é lastro).

---

## 3. 🔴 Achado da sessão: o `/apagar` (LGPD) não apaga nada

Apareceu ao desenhar a migration do cooldown — a pergunta era só "como esta tabela sai no `/apagar`?". **Verificado no código, linha a linha:**

`apagarDadosUsuario` (`src/supabase.js:1582`) tem 6 passos. O **passo 3** apaga de `lembretes_enviados` — tabela que **nunca foi criada**. O reengajamento foi desligado na cod-0068 e a linha saiu até do `schemaGuard`, mas o DELETE ficou. O Postgres devolve `42P01`, o `if (error) throw error` aborta a função, e:

- os passos **4, 5 e 6 nunca rodam** → `resumos_mensais_enviados`, `mensagens_processadas` e **`usuarios`** ficam intactos;
- como `usuarios` não é apagado, o `ON DELETE CASCADE` de `acompanhamentos`, `perguntas_log` e das demais **também não dispara**.

Ou seja: **um pedido de exclusão LGPD não apaga nada.** É o 🔴 mais grave em aberto — a auditoria de 08-23 já o tinha listado, e ele seguia sem virar tarefa.

Segundo defeito, independente: `acompanhamentos` e `perguntas_log` **não estão** na lista de DELETEs explícitos (zero ocorrências entre as linhas 1582–1645). Hoje só cairiam por cascata, o que é frágil pra dado pessoal.

→ Vira **cod-0076 [P0]**, porte P, sem migration. E **bloqueia a cod-0049**: não se acrescenta uma tabela nova a uma função de exclusão que não chega ao fim — isso aumenta o vazamento em vez de conter.

---

## 4. Estado de saída

**Fila pronta — 5 tarefas elegíveis** (era 0):

| Ordem | Tarefa | Porte | Observação |
|---|---|---|---|
| 1 | **cod-0076** — consertar o `/apagar` (LGPD) | P | 🔴 bloqueia a cod-0049 |
| 2 | **cod-0075** — Agente mostra mais comparativos pro Pro | P | costura `deps.maxComparativos` já existe |
| 3 | **cod-0077** — parar de logar conteúdo de cupom | P | não tocar no prompt (coração) |
| 4 | **cod-0078** — validar entrada do `/cron/monthly-summary` | P | achados 2+3 unidos |
| 5 | **cod-0049** — insights proativos | M | migration tem de rodar ANTES do push |

Uma run autônoma agora pega **até 3 porte P** (cod-0076 + cod-0075 + cod-0077) dentro do teto.

**Arquivos escritos nesta sessão:**

- `scripts/estoque.mjs` — correção da TRAVA 1 + do `limpar`
- `supabase/migration_2026-09-03_insights_enviados.sql` — tabela de cooldown (⚠️ zona humana: **você** roda)
- `AGENDA.md` — cod-0076/0077/0078 criadas, cod-0075 e cod-0049 reescritas como `pronta`, nota da TRAVA 1 atualizada
- `CLAUDE.md` — 1 linha na tabela de Decisões + "Última atualização" (regra 10)

**Nada foi commitado** (regra 3 — o commit e o push são seus).

### Pendências suas

1. **`/entregar` das 2 levas** — leva 0001 (`las-05`) faz 3 dias e vira 🔴 em 05/09 pela régua da própria AGENDA. 697 linhas de teste puro, zero `src/`, sem migration, nada financeiro: a entrega mais barata que já apareceu. **Agora sem contorno.**
2. **Rodar `migration_2026-09-03_insights_enviados.sql`** no Supabase — antes do push da cod-0049, não antes das outras.
3. **Ratificar ou recusar o padrão `deps`** (injeção de dependência pra teste) — usado 2× e proposto 2× mais. Não bloqueia, mas cada leva nova tem de contornar.
4. **Defeito "Total: R$ 1,00"** em `src/charts.js:56` (mês de soma zero) — segue como teste `todo`.
5. **Curadoria do topo da AGENDA** — o bloco de "Estado" passou do teto de ~5 linhas da própria regra anti-inchaço.

### O que continua estruturalmente aberto

Recarregar a fila com bugfixes e segurança compra algumas runs. O trabalho de **produto** que sobrou — PIX (cod-0062), fatura de cartão (cod-0072), recibo Canadá (cod-0065) — é todo **coração**, e por regra só anda com você presente. Destravar a fila autônoma não substitui essa sessão.

---

## 5. Padrão de fundo (para o `CRITICA_LOG`)

A TRAVA 1 foi **diagnosticada corretamente 4 vezes** e contornada 4 vezes. O `/apagar` quebrado estava na auditoria de 08-23 e ficou 11 dias sem virar tarefa. O checkpoint de 01/08 ficou 6 dias sem leitura. É o mesmo detector **D6** já registrado: *o sistema produz diagnóstico bem e consome mal*. O gargalo não é gerar sinal — é transformar sinal em tarefa.

Nesta sessão os dois viraram tarefa ou correção. Vale como ponto de calibração, não como conserto do padrão.
