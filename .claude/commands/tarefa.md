Você é o engenheiro do Economizei rodando LOCAL, na pasta do projeto (regime
**Máquina 3.0 — PILHA DE BRANCHES**, 2026-08-05 — doc:
`Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §4-B).
Pegue trabalho da AGENDA.md respeitando o TETO POR RUN e o TETO DE PILHA, implemente com
teste, **commite numa branch própria** e me mostre o diff pra eu revisar.

════════════════════════════════════════════════════════════════════════
REGIME NOVO (2026-08-05) — LEIA ANTES DE TUDO
════════════════════════════════════════════════════════════════════════
Você AGORA COMMITA — mas **SÓ em branch `maquina/*`**. NUNCA na `main`. NUNCA `git push`.

Motivo: antes, código não-commitado no working tree bloqueava a run seguinte (Regra 0), e
a esteira ficou 6 dias parada. Agora cada leva vira uma branch, o working tree volta limpo,
e a produção não trava esperando minha revisão. O gate real continua intacto: **push na
`main` deploya no Railway, e isso é 100% meu, via /entregar.**

AS 3 LEIS DA PILHA (violar qualquer uma = PARE e me avise):

  LEI 1 — PILHA LINEAR. Cada leva nova nasce do TOPO da pilha, não da `main`.
     Se já existe `maquina/cod-0067` não-mergeada, a próxima leva faz
     `git checkout maquina/cod-0067` e SÓ ENTÃO `git checkout -b maquina/cod-0025`.
     Isso é o que impede o problema cod-0043 × cod-0044 (levas vizinhas mexendo nos
     mesmos arquivos e conflitando). A ordem de merge é sempre a ordem de criação.

  LEI 2 — TETO DE PILHA = 3 BRANCHES NÃO-MERGEADAS. Se já houver 3, você NÃO produz:
     reporte "pilha cheia" com a lista da pilha e pare. Isto substitui a antiga Regra 0
     e é o que impede estoque não-revisado crescer sem controle.

  LEI 3 — A `main` NÃO PODE TER ANDADO POR BAIXO DA PILHA. No início da run, se a `main`
     tiver commits que a base da pilha não tem, PARE e me avise (eu resolvo o rebase).
     Você NUNCA faz rebase, merge na main, force-push ou reescrita de história.

════════════════════════════════════════════════════════════════════════

TETO POR RUN: até 3 tarefas de porte P, OU 1 tarefa de porte M, OU 1 lote (tarefas com
o mesmo campo "lote:") — sempre ≤ ~500 linhas de diff somadas. Tarefa sem "porte:":
estime (P = 1 função + teste; M = multi-arquivo bem especificado; G = o resto).
Porte G e tarefas do CORAÇÃO (prompt do Gemini / extração / categoria / nome_canonico)
só entram se EU pedir explicitamente nesta sessão.

PASSOS:

0) RASTRO PRIMEIRO (obrigatório, antes de qualquer coisa). Escreva o cabeçalho do
   RELATORIO_MATINAL.md AGORA com: data/hora, HEAD, branch atual, `git status --short`,
   estado da pilha (`git branch --list "maquina/*"`), e "STATUS: run iniciada".
   Runs já morreram no meio sem deixar rastro (29/07/2026) — se esta morrer no passo
   seguinte, eu ainda saberei o que ela estava fazendo.

1) INSPEÇÃO DA PILHA (aplica as 3 leis). Rode:
      git status --short
      git branch --list "maquina/*"
      git log --oneline origin/main..HEAD
   a) Working tree sujo com .js/.mjs? → me avise e PARE (é resto de sessão manual minha;
      .md e PAINEL.html sujos NÃO contam).
   b) Já existem 3 branches `maquina/*`? → LEI 2: reporte "pilha cheia" e PARE.
   c) A `main` andou por baixo da pilha? → LEI 3: reporte e PARE.
   Escreva o resultado no relatório.

2) Leia a AGENDA.md. Na "## 🌙 Fila pronta", selecione de cima pra baixo dentro do teto.
   **NÃO pegue tarefa cujo `depende-de` aponte pra algo que ainda não está na `main`**
   (branch da pilha não conta como entregue). **NÃO pegue tarefa cujos critérios dependam
   de como uma tarefa não-mergeada foi implementada** — reporte e siga adiante na fila.
   Se nada for elegível, use a "## ⚓ Fila de lastro" (só testes/revisão/segurança).
   Se nem o lastro tiver item, me diga e pare.

3) GATILHO DE SKILLS (obrigatório, antes de codar): carregue as skills do campo
   "skills:" de cada tarefa; se vazio, DERIVE pelo mapa tipo→skills da seção
   "🧠 Gatilho de Skills". Com número/preço/promessa, o economizei-financial-firewall
   é inegociável; todo código novo segue economizei-tdd (vem com teste).

4) CRIE A BRANCH — antes de escrever a primeira linha de código.
   - Pilha vazia  → `git checkout main && git checkout -b maquina/cod-XXXX`
   - Pilha existe → `git checkout <topo-da-pilha> && git checkout -b maquina/cod-XXXX`
   (LEI 1). Se a run pegou várias tarefas, use o id da PRIMEIRA no nome da branch.

5) Implemente SÓ o que objetivo/arquivos-alvo/critérios-de-aceite pedem; respeite
   "fora-de-escopo". Padrão: lógica pura separada de I/O; português nos
   nomes/mensagens. Toda lógica nova vem com teste em test/<nome>.test.js
   (modelo: test/insights.test.js).

6) AUTO-REVISÃO ADVERSARIAL: releia o diff como revisor hostil (edge cases, erro
   engolido, LGPD em log, regressão de mensagem, teste frágil) e corrija ANTES de commitar.

7) Rode e deixe verde: npm run check   — se vermelho, corrija; NÃO commite vermelho.

8) COMMITE NA BRANCH (um commit por tarefa, mensagem `tipo(escopo): descricao (cod-XXXX)`).
   NUNCA `git add -A` nem `git add .` — estageie os arquivos explícitos.
   **NUNCA `git push`. NUNCA `git checkout main` depois de commitar.** Termine a run
   com a branch da leva em check-out.

9) GRAVE O ESTADO — ANTES de me mostrar o diff (é a parte cara, e é onde runs morrem):
   a) AGENDA.md → mova cada tarefa pra "## 🔧 Em revisão" (status: em-revisao + data +
      branch + mapa tarefa→arquivos + migration necessária, se houver).
   b) AGENDA.md → atualize a seção "## 📚 Pilha da máquina": acrescente a linha desta
      leva (ordem, branch, tarefa, data, linhas, arquivos, migration s/n) e confira que
      as anteriores continuam lá, na ordem certa.

10) Me mostre: resumo por tarefa, MAPA TAREFA→ARQUIVOS, como testar, resultado do check,
    O NOME DA BRANCH, a pilha atual em ordem de merge, e AS SKILLS QUE USOU.

11) FECHE O RELATÓRIO: complete o RELATORIO_MATINAL.md aberto no passo 0 — diff, métricas,
    pendências humanas, financeiro tocado (se houver), zona proibida, estado da pilha.
    Troque "STATUS: run iniciada" por "STATUS: concluída".

FINANCEIRO (modo ADVISORY, 2026-07-26): PODE tocar código de pagamento/cobrança se a
tarefa pedir — o firewall só avisa. Ao tocar, DESTAQUE a lista exata do que é financeiro
(meu merge é consciente). Nunca invente trabalho financeiro por conta.

ZONA PROIBIDA (continua absoluta — nunca toque): supabase/; .env*; .github/;
package.json; package-lock.json; Dockerfile; Procfile; scripts/check-firewall.mjs;
qualquer deploy. Se a tarefa exigir isso, NÃO faça: marque como "bloqueada-humano"
na AGENDA e me explique.

GIT — O QUE VOCÊ NUNCA FAZ, EM NENHUMA HIPÓTESE:
git push · git merge (em qualquer direção) · git rebase · git reset --hard ·
git checkout main seguido de commit · git branch -D · force-push · alterar tags/remotes.
Se alguma dessas parecer necessária, PARE e me explique por quê.
