# 🧪 Veredito do teste — a nuvem consegue commitar? **NÃO.**

**Data:** 2026-08-18 · **Decisão testada:** item 1 da tabela do `Revisao_Entregar_Camadas_2026-08-16.md` — *"o ambiente da rotina automática consegue gravar commits, com a leitura sob controle?"*
**Status:** ⛔ **FECHADO POR EVIDÊNCIA.** A Máquina 3.0 (pilha de branches) **não pode rodar na nuvem.** Nunca poderia.
**Risco corrido:** zero — o teste rodou num repositório descartável criado só pra isso, em `_to_delete/`. Seu repositório real não foi tocado (verificado: nenhum lock, HEAD intacto em `97e861f`).

---

## 1. O que foi testado

Em vez de arriscar o seu repositório, criei **repositórios git novos e vazios dentro da mesma pasta** (`C:\Economizei\_to_delete\`) e mandei o git fazer, na ordem, exatamente o que a Máquina 3.0 exige: primeiro commit → criar branch → commitar na branch → voltar pra main → mesclar → apagar a branch.

Mesmo disco, mesmo mount, mesmas permissões. Se funcionasse ali, funcionaria no seu repo.

---

## 2. O resultado, na ordem em que aconteceu

| # | Operação | Resultado |
|---|---|---|
| 0 | Criar arquivo | ✅ OK |
| 0 | **Apagar arquivo** (`rm`) | ❌ **`Operation not permitted`** |
| 1 | `git init` | ✅ OK (com avisos) |
| 2 | `git add` | ✅ OK |
| 3 | **`git commit` (o 1º)** | ✅ **OK** |
| — | *sobra um `.git/HEAD.lock` órfão que ninguém consegue apagar* | ☠️ |
| 4 | `git checkout -b maquina/teste` | ❌ **FALHOU** — *"Unable to create HEAD.lock: File exists"* |
| 5 | `git commit` (o 2º) | ❌ FALHOU |
| 6 | `git checkout main` | ❌ FALHOU |
| 7 | `git branch -d` | ❌ FALHOU |

Repeti num segundo repositório limpo, só com dois commits em sequência, pra isolar:

```
escrita #1 (commit): OK
escrita #2 (commit): FALHOU
commits no repo: 1
locks órfãos deixados: .git/HEAD.lock · .git/objects/maintenance.lock
```

**A regra é essa, e é implacável: exatamente UMA escrita de git funciona. A segunda, e todas depois dela, falham para sempre.**

---

## 3. Por que — e por que o diagnóstico de 07/08 estava certo mas incompleto

O trabalho de 07/08 acertou o alvo que mirou: `git status` e `git diff` são comandos de *leitura* que mexem no índice e criam `index.lock`, e `GIT_OPTIONAL_LOCKS=0` **realmente elimina isso**. Confirmado hoje: nenhum `index.lock` apareceu em nenhum momento do teste.

O que não estava no radar é que **`index.lock` era só um membro de uma família**. Toda escrita do git cria um arquivo `.lock` temporário — `HEAD.lock`, `packed-refs.lock`, `refs/heads/<nome>.lock`, `objects/tmp_obj_*` — grava nele, e depois **apaga**. É assim que o git garante que nunca existe um estado pela metade: ele escreve ao lado e só então troca.

E a descoberta central do teste é mais funda do que "o git trava":

> **Esta pasta, vista da nuvem, é somente-criação. Nada pode ser apagado. Nunca.**
>
> `rm sonda.txt` → `Operation not permitted`. Não é o git: é o disco.

Não existe variável de ambiente pra desligar isso, porque **o lock de escrita não é opcional** — é a garantia de integridade do git. Um git que não apaga o próprio lock é um git que funciona uma vez e trava.

**Consequência prática:** os episódios de 05/08 e 06/08 nunca foram "azar do ambiente". Eram inevitáveis. E a variante MODO TREE, que nasceu de uma suposição ("o sandbox não consegue commitar"), **estava certa o tempo todo — só não sabia por quê.** Agora sabe.

### O que muda na documentação

- A pergunta "Máquina 3.0 × TREE", aberta desde 05/08 e reaberta em 07/08, **está fechada**. Não precisa mais ocupar espaço na AGENDA nem no CLAUDE.md.
- O `/entregar` pode perder o MODO PILHA inteiro (~40% do arquivo) — ele descreve um caminho fisicamente impossível no ambiente onde a máquina roda.
- As 3 Leis da pilha, a tabela "📚 Pilha da máquina" e o teto de 3 branches podem sair. Nunca vão ter uso.

---

## 4. ⚠️ Achado ao vivo: já está entupido de novo — dia 2

Enquanto testava, olhei o estado real do seu repositório. **O ciclo recomeçou:**

- **16/08:** a rotina produziu a **cod-0073 (Gate Pro no `/comparar`)** — `src/index.js`, `src/formatter.js`, `src/supabase.js`, `test/comparativo-gate.test.js`.
- **17/08:** rotina rodou, bateu na guarda (a), **produziu zero**.
- **18/08 (hoje):** mesma coisa.

O relatório matinal de ontem escreveu, com todas as letras: *"Idade da leva parada: 1 dia. Nada alarmante ainda — mas é o mesmo padrão que deixou a cod-0062a 8 dias presa."*

Não é teoria. Está acontecendo agora, pelo segundo dia.

---

## 5. Os dois caminhos que sobram — e nenhum dos dois pede nada de você no dia a dia

Você recusou o modelo de camadas por um motivo correto: a "Camada 2" ainda te obrigava a rodar um comando. Os dois caminhos abaixo **não obrigam**.

### 🅰️ Mudar onde a rotina roda — "no seu computador" em vez de "na nuvem"

O Cowork tem dois modos de execução: **na nuvem** (o que sua rotina usa hoje, e onde o disco não deixa apagar nada) e **no seu computador**, onde a tarefa trabalha direto nos seus arquivos, com permissão total.

**Se a rotina rodar no seu computador, tudo que falhou hoje simplesmente funciona.** A Máquina 3.0 roda como foi desenhada — a máquina cria a branch, commita, volta pro limpo sozinha — e **nada precisa ser adaptado**. O trabalho de 05/08 deixa de ser desperdício e passa a valer.

- ✅ Resolve o problema na raiz, sem gambiarra
- ✅ Zero comando novo pra você
- ✅ Aproveita tudo que já foi construído
- ⚠️ **Requisito a confirmar:** o app do Claude precisa estar aberto no computador na hora em que a rotina dispara. Se a máquina fica ligada, resolvido; se ela dorme às 8h, não.

### 🅱️ Continuar na nuvem — "estoque por pasta" em vez de branch

Se o requisito acima não se sustentar, a adaptação é trocar o mecanismo de empilhamento: **em vez de branches do git, pastas.**

A máquina **para de editar `src/` e `test/`**. Cada leva vira uma pasta nova:

```
estoque/
  2026-08-16_cod-0073/
      src/index.js          ← versão nova, completa
      src/formatter.js
      test/comparativo-gate.test.js
      LEVA.md               ← o que mudou, por quê, como testar
  2026-08-19_cod-0071/
      ...
```

Por que isso funciona **exatamente** dentro das limitações medidas hoje:

| Limitação | Como o estoque por pasta contorna |
|---|---|
| Não pode apagar nada | Nunca precisa apagar. Só cria pasta nova. |
| Não pode fazer 2 escritas de git | **Não usa git nenhum.** |
| Bancada suja bloqueia a máquina | `src/` nunca é tocado → **a bancada nunca fica suja** → a guarda nunca dispara |
| Levas vizinhas conflitam | A leva nova copia a versão da leva anterior como ponto de partida — a mesma "pilha linear", com pastas |

O efeito é o que você pediu desde o começo: **a máquina produz todo dia, indefinidamente, sem você**, e o estoque cresce visível em vez de escondido.

No dia em que você quiser entregar, o `/entregar` roda **na sua máquina** (onde tudo funciona) e faz: copiar as pastas do estoque por cima de `src/`, na ordem → `npm run check` → commit → push. A cópia é feita por script, nunca à mão — foi a cópia manual que deixou o `tarefa.md` quebrado por 8 dias em agosto.

- ✅ Não depende do app estar aberto
- ✅ Imune a todas as limitações medidas
- ⚠️ Exige reescrever o `/tarefa` (onde a máquina escreve) e o `/entregar` (ganha o passo de aplicar o estoque)
- ⚠️ Enquanto a leva está no estoque, o `npm run check` da suíte completa continua sem rodar confiável fora do Windows (o problema do `sharp`, item 7.1 do relatório anterior) — isso não muda em nenhum dos caminhos

---

## 6. Comparação direta

| | 🅰️ Rodar no seu computador | 🅱️ Estoque por pasta |
|---|---|---|
| Precisa de comando seu no dia a dia | Não | Não |
| Trabalho de implementação | ~nenhum | reescrever os 2 comandos |
| Aproveita a Máquina 3.0 de 05/08 | Sim, integralmente | Não (substitui) |
| Depende do app aberto na hora | **Sim** | Não |
| Máquina para se você atrasar a entrega | Não | Não |
| Reversível se der errado | Sim (volta pra nuvem) | Sim (volta pro TREE) |

**Recomendação:** testar o 🅰️ primeiro, porque custa quase nada e, se funcionar, encerra o assunto sem escrever uma linha. O 🅱️ é o plano de contingência — e continua valendo integralmente se o app não puder ficar aberto.

---

## 7. Pendências desta sessão

1. **Apagar a pasta `C:\Economizei\_to_delete\`** — é o resíduo do teste (2 repositórios git de mentira). Não consigo apagar daqui, é justamente a limitação que o teste provou. Nada dentro dela importa. Ela aparece como `?? _to_delete/` no `git status` e **não** dispara a guarda da máquina (a guarda só conta `.js`/`.mjs`), então não tem pressa.
2. **A cod-0073 está parada há 2 dias** e bloqueando a rotina desde ontem. Independente do caminho escolhido, ela precisa de `/entregar` em modo TREE.
3. **Decidir entre 🅰️ e 🅱️** — é o que destrava a reescrita dos comandos.

---

*Teste executado em 2026-08-18 sobre `C:\Economizei\_to_delete\` (repositórios descartáveis). Repositório real verificado intacto antes e depois: HEAD `97e861f`, zero locks, branch única `main`.*
