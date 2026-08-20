# 🔍 Revisão do `/entregar` — por que a esteira para, e como empilhar progresso

**Data:** 2026-08-16 · **Pedido do Gabriel:** *"ficamos 8 dias parados e fazer o `/entregar` todos os dias nem sempre é possível — seria possível fazer um agrupamento ou camadas para estacar esses progressos? Reavalie toda a estrutura do processo, cruze com as limitações de código, em linguagem que um leigo em programação entenda."*

**Base da análise:** os dois comandos (`.claude/commands/entregar.md`, 121 linhas · `tarefa.md`, 137 linhas), a AGENDA.md, o CLAUDE.md (seção 11), os relatórios matinal (15/08) e da sentinela (09/08), o `ship.mjs`, o hook `pre-push`, e **o histórico real do git** (log, reflog e estatística de 60 dias — 16/06 a 15/08).

---

## 📖 Antes de tudo: 6 palavras traduzidas

Se algum termo abaixo aparecer no meio do texto, é isto que ele significa aqui:

| Termo | Em português comum |
|---|---|
| **repositório / repo** | A pasta do projeto com histórico. É um "arquivo com máquina do tempo": guarda todas as versões anteriores. |
| **commit** | Uma **fotografia** do projeto num instante, com um bilhete explicando o que mudou. Não publica nada — só registra. |
| **branch** ("ramo") | Uma **linha do tempo paralela**. Você tira uma cópia da realidade, mexe à vontade lá, e o mundo real não é afetado até você decidir juntar. |
| **`main`** | A linha do tempo oficial. **No seu caso, tudo que chega na `main` vai pro ar** (o Railway faz o deploy sozinho). Por isso ela é sagrada. |
| **merge** ("mesclar") | Juntar uma linha do tempo paralela de volta na oficial. |
| **push** | Enviar as fotografias pro servidor. **É o botão de publicar.** Só você aperta. |
| **working tree** | O estado **atual** dos arquivos na sua pasta — o que está aberto na mesa, ainda não fotografado. |

O ponto que importa pro resto do relatório: **hoje, "guardar o progresso com segurança" e "publicar pro usuário final" são a mesma ação.** Não existe lugar intermediário. É daí que nasce o problema dos 8 dias.

---

## 1. Resumo executivo (se você só ler uma seção, leia esta)

1. **A cadência de 1 entrega/dia nunca existiu — e nunca vai existir.** Em 60 dias houve commit em **17 dias**. O padrão real é: você trabalha em rajadas (o dia 05/08 teve 8 commits sozinho), com **buracos de 6 a 8 dias entre elas**. Isso não é indisciplina: é como sua vida funciona. O processo é que foi desenhado supondo o contrário.

2. **O problema não é a entrega estar atrasada. É a produção estar amarrada nela.** Enquanto uma leva de código fica parada na sua mesa, **toda run da máquina seguinte encerra sem produzir nada** (a "guarda (a) — esteira entupida"). Em 2026 isso já custou **~14 dias de produção** em dois episódios: cod-0043 (6 dias) e cod-0062a (8 dias, entre 07/08 e 15/08 — cerca de **8 manhãs de rotina jogadas fora**).

3. **A solução que você pediu já foi desenhada — e nunca rodou uma vez sequer.** A "Máquina 3.0" (pilha de branches) foi criada em 05/08 exatamente pra isso. O git prova que ela nunca foi exercitada: **o repositório inteiro tem ZERO merges**, e a única branch `maquina/*` que existiu na história foi criada e abandonada no mesmo minuto, sem receber nenhum commit.

4. **A causa de ela nunca ter rodado é uma suposição errada que ninguém testou.** Acreditava-se que o ambiente da rotina automática não conseguia gravar commits. Em 07/08 descobriu-se que o travamento vinha de comandos de *leitura*, não de escrita — mas o teste de 5 minutos que confirmaria isso continua na fila, há 9 dias. **A máquina está presa num modo de emergência por causa de um diagnóstico já invalidado.**

5. **A correção mais barata não é técnica, é de preço.** Hoje entregar 1 arquivo inofensivo (cod-0062a: sem migration, sem variável nova, sem dinheiro, nenhum número mudando) custa exatamente o mesmo ritual que entregar 8 commits com migration de banco. Quando tudo custa 30 minutos e presença sua, **você acumula — e o acúmulo trava a máquina.** O conserto é separar em camadas e cobrar por risco.

---

## 2. Os números reais (medidos no git, não estimados)

### 2.1 Quando o código realmente subiu

Dias com commit nos últimos 60 dias: **17 de 60**.

```
JUN: 17 · 19 · 23 · 24 · 26
JUL: 02 · 08 · 09 · 13 · 15 · 17 · 24 · 27 · 28
AGO: 05 · 07 · 15
```

Buracos de 6 dias ou mais entre entregas:

| Intervalo | Dias parados | O que estava preso |
|---|---|---|
| 26/06 → 02/07 | 6 | — |
| 02/07 → 08/07 | 6 | — |
| 17/07 → 24/07 | 7 | — |
| 28/07 → 05/08 | **8** | cod-0043 (6 dias no working tree) |
| 07/08 → 15/08 | **8** | cod-0062a (8 dias no working tree) |

**Leitura honesta:** buracos de 6 dias ou mais são **5 dos 16 intervalos** — quase um terço, e os três maiores são os três mais recentes. Não é exceção, é tendência. O processo trata cada um deles como um incidente ("a esteira entupiu de novo"), quando na verdade é o ritmo normal do projeto. Um sistema que chama seu próprio comportamento normal de "falha" vai gerar alarme o tempo todo — e você vai parar de olhar pro alarme.

### 2.2 A produção acontece em rajadas, não em fluxo

| Dia | Commits | Tamanho somado |
|---|---|---|
| 05/08 | 8 commits | 8 tarefas + docs |
| 13/07 | 6 commits | 6 tarefas |
| 15/07 | 3 commits | 4 tarefas |
| 15/08 | 3 commits | 1 tarefa + docs |

Tamanho médio de uma leva de código: **~550 linhas inseridas** (medidas: 223, 484, 562, 707, 782). O tempo de revisão que o seu próprio relatório matinal estima para uma leva: **~30 minutos**.

### 2.3 O modo principal do `/entregar` nunca foi usado

O `/entregar` atual tem **dois modos**:

- **MODO PILHA** — mesclar branches `maquina/*` que a máquina produziu.
- **MODO TREE** — pegar o que está solto na sua pasta e fotografar.

Evidências do git:

- `git log --merges` → **vazio**. Nenhum merge em toda a história do repositório.
- No histórico interno (`reflog`), só uma branch `maquina/*` já existiu: `maquina/cod-0068-0067-0025`, em 05/08. Ela foi criada e abandonada com **o mesmo código na entrada e na saída** — nenhum commit foi feito nela.
- A tabela "📚 Pilha da máquina" na AGENDA marca **0/3 desde que foi criada**, há 11 dias.

**Ou seja:** ~60% do texto do comando `/entregar` descreve um caminho que **nunca aconteceu**, e o modo que aconteceu em 100% das vezes (TREE) está descrito em meias-frases penduradas nos passos do outro ("MODO TREE: rode `npm run check` no working tree, mesmo critério"). O caminho real é o menos especificado dos dois.

### 2.4 A fila não é o gargalo

Composição atual da fila: **13 tarefas com status `pronta`** · 3 bloqueadas por decisão humana · portes: 5 pequenas, 7 médias, 3 grandes.

Tem trabalho de sobra esperando. O gargalo é **a passagem**, não a origem.

---

## 3. Como o processo funciona hoje — explicado sem jargão

Imagine uma cozinha com três pessoas:

**A máquina (o cozinheiro).** Roda toda manhã às 8:02, sozinha. Pega a próxima receita da fila (AGENDA), cozinha o prato **com o teste junto** e deixa na bancada.

**Você (o chef).** Prova o prato, aprova, e é o único que pode levar até o salão.

**O salão (a produção).** O momento em que o prato sai pro cliente é literalmente o `git push`: o Railway detecta e publica.

O que o `/entregar` faz hoje, nessa metáfora — **8 etapas, 17 passos numerados**:

| Etapa | O que é | Custo |
|---|---|---|
| 0 | Descobrir se é modo PILHA ou TREE, mapear tudo | baixo |
| 1 | **Trava de integridade** — conferir que nenhum arquivo foi truncado | baixo, alto valor |
| 2 | Montar o plano de entrega, agrupar por tarefa, parar pra você ver | médio |
| 2.5 | **Checar migrations e variáveis de ambiente** (bloqueante) | baixo, **altíssimo valor** |
| 3 | Rodar `npm run check` no resultado final — 552 testes | médio |
| 4 | **Você digita "APROVO"** | exige você presente |
| 5 | Push (= publicar) + apagar as branches | baixo |
| 6 | **Reconciliar a memória** — AGENDA, CLAUDE.md, novo commit, novo push | **alto** |

**O problema estrutural em uma frase:** essas 8 caixas são um bloco único. Você não consegue fazer as 5 primeiras hoje e as 3 últimas na quinta. E como a bancada (o *working tree*) é o único lugar onde o prato pode esperar, **enquanto o prato está lá o cozinheiro não cozinha o próximo** — a regra dele é "bancada suja = não produzo".

---

## 4. O diagnóstico central: o acoplamento

Está tudo em uma linha:

> **Um prato não entregue impede todos os pratos seguintes de existirem.**

Isso não é um bug de implementação, é uma escolha de arquitetura — e ela foi consciente e correta no começo, quando o risco de o código automático subir sem revisão era o maior medo. Só que hoje ela cobra um preço desproporcional:

- **cod-0043** (produzida em 29/07): 6 dias na bancada. Bloqueou todas as runs até 05/08.
- **cod-0062a** (produzida em 07/08): 8 dias na bancada. Bloqueou as manhãs de **08, 09, 10, 11, 12, 13, 14 e 15 de agosto**.

Nesses 8 dias, a máquina rodou 8 vezes, gastou tempo e tokens, escreveu 8 relatórios — e produziu **zero linhas de código**. O relatório de 15/08 é explícito: *"Tarefas concluídas nesta run: 0 · Linhas de diff produzidas: 0"*.

E olha o detalhe cruel: **a leva presa era inofensiva.** O relatório da sentinela de 09/08 classificou a cod-0062a como *"leva pequena: 1 arquivo de produção + 1 de teste, sem migration, sem env, nenhum número muda hoje"*. Ela pagou o preço de uma entrega de alto risco sem ter nenhum risco.

**Esse é o ponto exato que a sua pergunta acerta.** Você não precisa entregar todo dia. Você precisa de um jeito barato de **tirar o prato da bancada sem levar ao salão**.

---

## 5. Pontos fortes (o que NÃO deve ser mexido)

Não é cortesia — são coisas que raramente existem em projetos deste tamanho e que estão comprovadamente funcionando.

**5.1 · O portão nunca falhou.** Em 60 dias, nenhum revert, nenhum `reset --hard` na `main`, nenhum force-push, nenhuma reescrita de história. O histórico é uma linha reta limpa. A disciplina "só o Gabriel publica" produziu **zero acidentes de produção**. Qualquer redesenho tem que preservar isso.

**5.2 · A rede de teste é uma catraca que só sobe.** 552 testes em 38 arquivos, cobrindo ~9.100 linhas de código. E o número cresce monotonicamente a cada entrega: 460 (28/07) → 482 → 509 (05/08) → 534 (07/08) → 552 (15/08). A regra "toda lógica nova vem com teste" está sendo cumprida de verdade, não no papel.

**5.3 · A ETAPA 2.5 é a linha mais valiosa do comando inteiro.** Cruzar o código que vai subir com as migrations do Supabase e as variáveis de ambiente, **antes** do push, é o que evita o acidente clássico: publicar um código que lê uma coluna do banco que ainda não existe. Você já teve esse susto (o caso "A9"). Cinco linhas de comando que pagam por si mesmas.

**5.4 · A trava de integridade (ETAPA 1) é uma defesa desenhada sobre uma cicatriz real.** Rodar `node --check` em cada arquivo e desconfiar de "arquivo esvaziado" nasceu do problema conhecido do sandbox servir arquivo truncado. É defesa específica contra um inimigo específico — o tipo bom.

**5.5 · "Nunca `git add -A`".** Fotografar só os arquivos listados no plano, nunca a pasta inteira. Isso importa concretamente: entre 07/08 e 15/08 havia 5 arquivos soltos na pasta (rascunhos de patch, roteiro de SQL, migration não executada) que **não deviam** entrar em nenhuma entrega. Passaram por três entregas sem serem varridos junto. Hoje a pasta está limpa — mas foi essa regra que os manteve fora.

**5.6 · A memória está reconciliada, e isso é raro.** A sentinela de 09/08 registrou: *"AGENDA não está stale — melhor estado desde julho"*. A ETAPA 6 é cara, mas está funcionando. Um projeto onde a documentação bate com o git é a exceção, não a regra.

**5.7 · O sistema falha de forma honesta.** No dia 15/08, mesmo bloqueado e sem produzir nada, o relatório matinal **rodou a suíte assim mesmo** só pra te informar se a leva parada continuava entregável ("18/18 verdes"), e ainda declarou a ressalva de que o gate final é na sua máquina. Um sistema que, ao falhar, gasta energia pra te dar informação útil sobre o próprio bloqueio é bem desenhado.

---

## 6. Pontos fracos (em ordem de quanto custam)

**6.1 🔴 Preço único para risco variável.** Entregar 1 arquivo sem migration, sem variável nova e sem dinheiro envolvido custa o mesmo ritual completo — 8 etapas, "APROVO" literal, ~30 min, você presente — que entregar 8 commits com migration de banco. Consequência mecânica: você racionaliza, acumula, e o acúmulo trava o cozinheiro. **Os 8 dias não foram desleixo: foram a resposta racional a um preço mal calibrado.**

**6.2 🔴 Não existe lugar pra estacionar.** Só há dois estados: "solto na bancada" (bloqueia a máquina) ou "no ar" (deploy pro usuário). O meio-termo — *"revisei, está bom, guarda aí que eu publico depois"* — **não existe no sistema**. É exatamente o que você está pedindo, e é a peça que falta.

**6.3 🔴 O modo principal do comando é ficção.** O MODO PILHA nunca rodou. Além do desperdício de atenção (60% do documento descreve o que não acontece), há um risco concreto: quem for executar esse comando pela primeira vez de verdade vai fazê-lo sem nenhum ensaio, num caminho não testado, **na hora de publicar em produção**.

**6.4 🟠 O sinal de idade está no lugar errado.** A AGENDA tem a regra "branch com mais de 7 dias = 🔴". Mas o alarme mora na tabela da pilha — **que está sempre vazia**. O trabalho que realmente envelhece mora no working tree, e ali **não existe nenhum alarme dentro do comando**. Resultado: a cod-0062a chegou a 8 dias e quem avisou foi a sentinela semanal e o relatório matinal — nunca o próprio `/entregar`.

**6.5 🟠 A contabilidade cara vem depois do deploy.** A ETAPA 6 (reconciliar AGENDA + CLAUDE.md, commitar, pushar de novo) acontece **depois** do push. É o passo mais caro, no momento em que a energia da sessão já acabou. Já está documentado que runs morreram no meio (29/07). Se ela falhar aqui, o código está no ar e a memória fica mentindo — que é exatamente o padrão que vocês já nomearam: *"o sistema produz diagnóstico bem e consome mal"*.

**6.6 🟠 Não existe primitiva de "entrega parcial".** O comando diz *"eu decido quantas mergear nesta sessão"* — mas isso só existe no MODO PILHA (que não roda). No MODO TREE a bancada é um borrão único, e a ferramenta que dividiria (`git add -p`) foi registrada como **indisponível neste ambiente duas vezes** (05/08 e 07/08). Então "faço metade hoje" **não é uma opção real** — e é justamente a opção de que você precisa quando tem 15 minutos.

**6.7 🟡 Os dois arquivos que governam a máquina são os únicos sem teste.** Tudo no repositório tem teste — menos `entregar.md` e `tarefa.md`. E isso já cobrou: em 07/08 o `tarefa.md` foi "corrigido", registrado no CLAUDE.md como feito, e **descobriu-se 8 dias depois, durante a entrega de 15/08, que a correção estava quebrada** (markdown corrompido e faltando a variável `GIT_OPTIONAL_LOCKS=0` justamente nos comandos que causavam o travamento). Uma correção que existia só no papel por 8 dias, no arquivo mais crítico do sistema.

**6.8 🟡 Duas fontes de verdade que precisam ser sincronizadas à mão.** A "Pilha da máquina" na AGENDA e o estado real do git podem divergir — o comando inclusive tem uma regra pra isso ("se divergir, a verdade é o GIT"). Toda tabela que precisa ser reconciliada manualmente vai divergir em algum momento; é uma questão de quando.

---

## 7. Cruzando com as limitações de código

Esta seção liga cada travamento de processo à limitação técnica que o empurra. **A conclusão é que quase tudo desce de uma origem só.**

### 7.1 🔴 `sharp` quebra fora do Windows → é a raiz de tudo

O projeto usa `sharp` (biblioteca de imagem, para tratar as fotos dos cupons). É um **módulo nativo** — ou seja, não é JavaScript puro: é código compilado para um sistema operacional específico. No ambiente da nuvem, montado a partir do Windows, ele morre com `SIGBUS` (erro de acesso à memória).

Efeito medido: **8 dos 38 arquivos de teste não conseguem rodar fora da sua máquina** (`classificacao-corpus`, `erro-copy`, `gemini-canonico`, `gemini-extracao`, `onboarding-comandos`, `webhook-auth`, `webhook-dedup`, `webhook-documento`). Fora do Windows a suíte reporta 450/458 e você **não sabe** se as 8 são ambientais ou regressões reais.

A cadeia de consequências, que é a espinha do relatório inteiro:

```
sharp não roda fora do Windows
   └→ o "verde" confiável só existe na SUA máquina
        └→ toda entrega exige você presente, fisicamente
             └→ entregar fica caro (~30 min + agenda sua)
                  └→ você agrupa e adia
                       └→ o código envelhece na bancada
                            └→ a máquina para de produzir
                                 └→ 8 dias, 8 manhãs perdidas
```

**Isto é uma limitação de código com custo de processo.** Ela não vai sumir por reorganização de comando. Duas saídas possíveis (nenhuma trivial): (a) isolar o `sharp` atrás de uma camada que os testes possam substituir por um dublê, deixando 100% da suíte rodável em qualquer lugar; ou (b) aceitar a limitação e **parar de exigir suíte completa para levas que comprovadamente não tocam imagem** — a cod-0062a mexeu em consultas ao banco, o `sharp` era irrelevante para ela.

### 7.2 🔴 Push na `main` = deploy imediato, sem ambiente intermediário

Railway e Vercel publicam a partir do push na `main`. Não existe staging. Por isso a `main` **não pode** ser usada como área de acúmulo, e por isso a única alternativa é a bancada.

**Esta é a limitação que torna a camada intermediária obrigatória, não opcional.** Enquanto "guardar" e "publicar" forem a mesma ação, o dilema volta em qualquer redesenho.

### 7.3 🟠 `git add -p` indisponível no ambiente

A ferramenta que permite separar mudanças dentro de um mesmo arquivo não funciona aí. Registrado duas vezes. Consequência real: o commit `41beafe` juntou cod-0044 e cod-0048 num só porque as duas mexiam em `intents.js` e não deu pra separar. Ou seja: **o sistema não consegue fatiar uma entrega**, o que reforça o tudo-ou-nada.

### 7.4 🟠 `.git/index.lock` — resolvido, mas só metade

Diagnóstico de 07/08, correto e bem feito: comandos de **leitura** (`git status`, `git diff`) atualizam o índice e pegam a trava; no ambiente montado o git cria o arquivo dentro de `.git/` mas não consegue apagar; a trava fica e congela o repositório. `GIT_OPTIONAL_LOCKS=0` resolve **a leitura** — testado nos dois sentidos, zero travas.

**O que continua em aberto:** a **escrita** (`git commit`, `git checkout -b`) nunca foi testada com a leitura sob controle. E é exatamente disso que a Máquina 3.0 depende. O teste custa ~5 minutos e está na fila há 9 dias. **É o item de melhor relação custo/benefício da lista inteira** — porque os dois resultados possíveis resolvem o impasse:

- **Se funcionar:** o modo TREE perde a razão de existir, sobra um modo só, o comando encolhe pela metade.
- **Se falhar:** o modo TREE fica justificado por evidência, e a documentação para de dizer que a 3.0 é o regime normal.

Hoje a máquina opera num modo de emergência criado por uma premissa que já se sabe imprecisa.

### 7.5 🟡 `.claude/commands/` é protegido no ambiente da nuvem

Os arquivos de comando não podem ser editados de lá — a correção tem que ser copiada à mão por você. Foi assim que a correção do `tarefa.md` ficou quebrada por 8 dias (item 6.7). **Todo passo que depende de uma cópia manual sua é um passo que vai falhar em silêncio.**

---

## 8. A proposta: três camadas

O princípio é um só e cabe numa frase:

> **Separar "guardar com segurança" de "publicar pro usuário" — porque hoje são a mesma ação, e é isso que trava tudo.**

### Camada 1 — PRODUZIR (a máquina, todo dia, sem você)

A máquina para de deixar o prato na bancada. Ela grava direto numa linha do tempo paralela chamada **`estoque`** — uma branch que **nunca é publicada**, e que fica lá acumulando quantos dias forem necessários.

- A bancada (working tree) volta limpa ao fim de toda run.
- **A máquina nunca mais para por causa de entrega atrasada.** É a Camada 1 inteira do seu pedido: "estacar o progresso".
- Um freio de segurança continua existindo, mas por **volume**, não por tempo: se o `estoque` passar de ~3 tarefas ou ~800 linhas sem entrega, a máquina reporta "estoque cheio" e para de produzir. Isso preserva o espírito da LEI 2 sem o risco de dívida invisível.

**Simplificação importante sobre a Máquina 3.0:** o desenho de 05/08 previa uma *pilha* de até 3 branches empilhadas, com 3 leis para manter a ordem correta (LEI 1 linear, LEI 2 teto, LEI 3 main parada). Uma branch única de estoque **elimina as leis 1 e 2 inteiras** — com uma linha só não existe ordem de merge pra errar, não existe "nunca pule uma branch", não existe pilha pra estourar. Você ganha o mesmo benefício com um terço da regra. E a tabela "📚 Pilha da máquina" vira uma linha: *"estoque: N tarefas, X linhas, Y dias desde a última entrega"*.

### Camada 2 — GUARDAR (você, 2 a 5 minutos, quando der)

Um comando novo e **barato** — algo como `/guardar` ou `/empilhar`. O que ele faz:

1. Roda a trava de integridade (`node --check`) — a ETAPA 1, que é barata e valiosa.
2. Roda a suíte **na sua máquina** (o único verde confiável, por causa do `sharp`).
3. Fotografa e joga no `estoque`.
4. Atualiza a linha do estoque na AGENDA — só isso, a contabilidade barata.
5. **NÃO publica. Nada vai pro ar. Nenhum "APROVO" necessário.**

Como não há deploy, não há risco de produção — o critério de aceitação é só *"está verde"*. Isso cabe num café. E é o que destrava a máquina no dia seguinte.

Nos dias em que você tiver 15 minutos e não 30, **este é o comando que você roda.**

### Camada 3 — ENTREGAR (você, ~30 min, quando você quiser publicar)

O `/entregar` fica só com o que é caro **e realmente perigoso**:

- ✅ Checagem de migrations e variáveis de ambiente (a ETAPA 2.5 — mantida integral, é a joia)
- ✅ Destaque do que é financeiro no que vai subir
- ✅ `npm run check` verde **no resultado do merge**, na sua máquina
- ✅ "APROVO" literal
- ✅ Push (= deploy)
- ✅ Reconciliação da memória

A diferença: agora ele roda **quando você quiser publicar** — de 2 em 2 dias, de 8 em 8, tanto faz. **O atraso dele não custa mais nada**, porque a máquina não depende mais dele. Ele volta a ser o que sempre deveria ter sido: o botão de publicar, não o desentupidor.

### O quadro comparativo

| | Hoje | Proposto |
|---|---|---|
| Máquina para se você atrasar? | **Sim** | Não |
| Lugar pra guardar sem publicar | **Não existe** | `estoque` |
| Custo de destravar a esteira | ~30 min + você presente | 2–5 min |
| Custo de publicar | ~30 min | ~30 min (igual) |
| Modos do comando de entrega | 2 (um deles nunca rodou) | 1 |
| Leis pra máquina obedecer | 3 | 1 |
| Onde mora o alarme de idade | Numa tabela sempre vazia | Na linha do estoque |

---

## 9. Duas melhorias que valem tanto quanto as camadas

### 9.1 Cobrar por risco, não por tamanho — as três faixas

Antes de qualquer coisa, o comando classifica a leva em uma de três faixas e **te diz em 30 segundos quanto vai custar**:

| Faixa | O que caracteriza | Ritual |
|---|---|---|
| 🟢 **Verde** | Só `src/` + `test/`. Sem migration, sem variável nova, sem palavra de dinheiro, nenhum número de usuário muda. | Check verde + push. Sem cerimônia de aprovação. **~5 min.** |
| 🟡 **Amarela** | Toca copy de preço/promessa, ou dois grupos dividem o mesmo arquivo. | Você lê o diff + "APROVO". **~15 min.** |
| 🔴 **Vermelha** | Migration, variável de ambiente, lógica financeira de verdade, zona proibida. | Ritual completo atual, integral. **~30 min.** |

**A cod-0062a era 🟢 verde e pagou preço 🔴 vermelho por 8 dias.** Essa única mudança de calibragem teria evitado o episódio inteiro.

### 9.2 O comando abre com o estado, não com o procedimento

Hoje o `/entregar` começa executando a Etapa 0. Deveria começar te dando uma linha:

```
📦 estoque: 1 tarefa (cod-0062a) · 484 linhas · 8 dias parado 🔴
   faixa: 🟢 VERDE (sem migration · sem env · sem financeiro)
   custo estimado: ~10 min
   ⚠️ a esteira está bloqueada há 8 dias por causa disto
```

Com isso você decide em 30 segundos se tem tempo agora — em vez de descobrir no meio da etapa 3 que não tinha. **É o alarme de idade posto no único lugar onde você garantidamente olha.**

---

## 10. O que pode dar errado nesta proposta

Sendo honesto sobre os custos, não só sobre os benefícios:

**10.1 · Dívida invisível.** Com um lugar confortável pra guardar, é natural guardar demais. `estoque` pode virar um depósito de 3 semanas e aí a revisão final vira um monstro. **Defesa:** o teto por volume da Camada 1 (a máquina para quando enche) + a linha de idade no topo do comando. A crítica original ao modelo de branches — "a dívida cresce escondida" — continua válida e é o principal risco a monitorar.

**10.2 · Mais um conceito pra manter na cabeça.** Uma branch a mais é uma coisa a mais que pode dessincronizar. **Mitigação parcial:** a proposta *remove* mais complexidade do que adiciona (2 modos → 1, 3 leis → 1, pilha de N branches → 1 branch).

**10.3 · Isso depende do teste dos 5 minutos.** Se o ambiente da nuvem realmente não conseguir gravar commits, a máquina não consegue escrever no `estoque` sozinha, e a Camada 1 vira semiautomática (você mesmo roda o `/guardar`). **Ainda assim vale**: o `/guardar` de 5 minutos continua sendo infinitamente mais barato que o `/entregar` de 30. Mas o desenho fica melhor se o teste passar — e ele **precisa rodar antes de qualquer implementação**.

**10.4 · O `sharp` continua lá.** Nada nesta proposta conserta a dependência da sua máquina física para o verde confiável. Ela **contorna** o problema tornando a cerimônia mais barata. O conserto de verdade é isolar o `sharp` atrás de uma camada testável — e isso é uma tarefa de código, para a fila.

---

## 11. O que precisa de decisão sua

Em ordem de retorno sobre esforço:

| # | Decisão | Custo | Retorno |
|---|---|---|---|
| 1 | **Rodar o teste dos 5 minutos** (o ambiente da nuvem consegue commitar?) | 5 min | Destrava a decisão Máquina 3.0 × TREE, parada há 9 dias. Os dois resultados servem. |
| 2 | **Aprovar (ou recusar) o modelo de 3 camadas** | decisão | Quebra o acoplamento que já custou ~14 dias de produção |
| 3 | **Aprovar as 3 faixas de risco** | decisão | Faz entregas 🟢 verdes custarem 5 min em vez de 30 |
| 4 | **Substituir a pilha de 3 branches por uma branch `estoque` única** | decisão | Remove 2 das 3 leis; um conceito no lugar de quatro |
| 5 | **Decidir o destino do MODO PILHA** — vira o modo único, ou é apagado do comando | decisão | Comando encolhe ~40%; some o caminho não-ensaiado |
| 6 | **Criar um `check:comandos`** que valide os próprios arquivos de comando | tarefa P | Impede o caso 6.7 (correção quebrada por 8 dias sem ninguém saber) |
| 7 | **Fila: isolar o `sharp` atrás de uma camada testável** | tarefa M/G | Ataca a raiz do item 7.1 — a única correção que remove a dependência da sua máquina |

---

## 12. Observação final

Vale registrar o padrão porque ele se repete e é a lição mais transferível daqui:

Nos três casos analisados — o `index.lock` reportado 2× como "limitação conhecida" sem ninguém procurar a causa, o Checkpoint de 01/08 que ficou 6 dias sem leitura, e a Máquina 3.0 construída em 05/08 e nunca executada — **o sinal existia, estava correto, e foi produzido no prazo. O que falhou foi o consumo.**

Isto está aliás registrado no próprio CRITICA_LOG como padrão de fundo (*"o sistema produz diagnóstico bem e consome mal"*). Este relatório é mais um sinal produzido. **O teste dos 5 minutos da linha 1 da tabela acima é o menor consumo possível — e é a prova de que o padrão foi quebrado.**

---

*Relatório gerado em 2026-08-16 · fontes: `.claude/commands/entregar.md` e `tarefa.md`, `AGENDA.md`, `CLAUDE.md` §11, `RELATORIO_MATINAL.md` (15/08), `RELATORIO_SENTINELA.md` (09/08), `scripts/ship.mjs`, `.githooks/pre-push`, `package.json`, e `git log`/`git reflog`/`git log --merges` do período 2026-05-15 → 2026-08-15.*
