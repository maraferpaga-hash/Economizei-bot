# 🅰️ Kit de teste — rodar a máquina "no seu computador"

**Objetivo:** provar, em ~10 minutos, se uma sessão do Cowork rodando **no seu computador** consegue fazer as escritas de git que a nuvem não consegue. Se conseguir, a **Máquina 3.0 volta a valer inteira** e nenhum comando precisa ser reescrito.

**Contexto:** o teste de 18/08 provou que na nuvem a pasta é somente-criação (`rm` → `Operation not permitted`), então o git funciona **uma vez** e trava. Detalhe em `Veredito_Teste_Commit_Sandbox_2026-08-18.md`.

---

## Parte 1 — Provar que o git escreve (5 min)

### 1.1 Abrir uma sessão rodando no seu computador

No **app do Claude no desktop**, ao iniciar uma tarefa nova do Cowork, existe um seletor **"Run this task"** no canto superior direito, com duas opções: *na nuvem* e *no seu computador*. Escolha **no seu computador**.

> Se esse seletor não aparecer, a opção não está habilitada na sua conta — e aí o caminho 🅰️ morre aqui. Pule direto pra "Se o teste FALHAR", no fim.

Há também um padrão global em **Configurações → Cowork → "Run new tasks in the cloud"**. Desligar isso faz toda tarefa nova nascer no seu computador.

### 1.2 Colar este prompt na sessão nova

```
Rode este teste de escrita de git dentro de C:\Economizei e me mostre a saída
crua, sem interpretar. NÃO toque no repositório real: todo o teste acontece
dentro de C:\Economizei\_teste_git\, que é descartável.

set +e
cd /c/Economizei || cd "$HOME/mnt/Economizei" || exit 1
rm -rf _teste_git 2>/dev/null
mkdir -p _teste_git && cd _teste_git || exit 1

echo "== 0. apagar arquivo =="
echo x > sonda.txt && rm sonda.txt && echo "APAGAR: OK" || echo "APAGAR: FALHOU"

echo "== 1. init + commit =="
git init -q -b main .
echo l1 > a.txt && git add a.txt
git -c user.email=t@t -c user.name=t commit -q -m c1 && echo "commit 1: OK" || echo "commit 1: FALHOU"

echo "== 2. criar branch e commitar (Maquina 3.0) =="
git checkout -q -b maquina/teste && echo "checkout -b: OK" || echo "checkout -b: FALHOU"
echo l2 >> a.txt && git add a.txt
git -c user.email=t@t -c user.name=t commit -q -m c2 && echo "commit 2: OK" || echo "commit 2: FALHOU"

echo "== 3. merge e apagar branch (/entregar) =="
git checkout -q main && echo "checkout main: OK" || echo "checkout main: FALHOU"
git merge --no-ff -q -m merge maquina/teste && echo "merge: OK" || echo "merge: FALHOU"
git branch -d maquina/teste && echo "branch -d: OK" || echo "branch -d: FALHOU"

echo "== 4. sobrou lock? =="
find .git -name "*.lock"; echo "(vazio acima = limpo)"
echo "commits: $(git rev-list --count HEAD)"

echo "== 5. limpeza =="
cd .. && rm -rf _teste_git && echo "limpeza: OK" || echo "limpeza: FALHOU"
```

### 1.3 Como ler o resultado

**✅ PASSOU** — todas as linhas dizem `OK`, a varredura de lock vem vazia, e `commits: 3`.
Significa: **a Máquina 3.0 funciona no seu computador.** O git faz branch, commit, merge e apaga a branch sem deixar sujeira.

**❌ FALHOU** — qualquer linha `FALHOU`, ou locks na varredura, ou `commits: 1`.
Significa: a mesma limitação da nuvem. Vá pro caminho 🅱️.

> **Sinal decisivo:** se `commit 2: OK` aparecer, passou. Foi exatamente aí que a nuvem morreu.

---

## Parte 2 — Se PASSOU: as 3 perguntas que decidem se dá pra viver com isso

Provar que o git escreve é necessário, mas não é suficiente. A rotina dispara às 8:02 sem você. Então:

### ❓ 2.1 A tarefa agendada consegue nascer "no seu computador"?

O seletor de local aparece **ao iniciar uma tarefa**. Sua rotina matinal foi criada como tarefa na nuvem — é bem possível que ela precise ser **recriada** com o padrão trocado (Configurações → Cowork) pra passar a rodar no computador. Ao recriar, mantenha o mesmo prompt: é o `/tarefa` inteiro.

**Como confirmar sem esperar amanhã:** dispare a rotina recriada uma vez na mão e leia o `RELATORIO_MATINAL.md` que ela escrever. Se o cabeçalho parar de dizer "variante SANDBOX" e a run conseguir criar a branch, está resolvido.

### ❓ 2.2 O app precisa estar aberto às 8:02?

Sim — uma tarefa que roda no seu computador precisa do app do Claude rodando. Seu equipamento é desktop, então provavelmente fica ligado; mas confirme os dois pontos:

- O app do Claude fica aberto (ou inicia junto com o Windows).
- **O Windows não hiberna/suspende às 8h.** Em *Configurações → Sistema → Energia*, o modo de suspensão precisa estar desligado, ou a rotina simplesmente não dispara.

Vale considerar mudar o horário pra um em que você sabe que a máquina está acordada.

### ❓ 2.3 O `npm run check` fica confiável?

**Sim, e este é o bônus grande.** Rodando no seu computador, o `sharp` funciona e os **8 arquivos de teste que morrem por SIGBUS na nuvem passam a rodar**. Isso ataca o item 7.1 do relatório de 16/08 — o "verde confiável" deixa de depender de você estar sentado na frente da máquina, porque a rotina *já está* na máquina.

Se as três respostas forem boas, o desenho final fica assim, e **nada precisa ser escrito**:

```
máquina (8:02, no seu computador) → cria branch maquina/cod-XXXX,
    commita com teste, roda a suíte COMPLETA, volta o tree pro limpo
                        ↓
  a bancada nunca suja → a guarda nunca dispara → produz todo dia
                        ↓
você, quando quiser → /entregar em MODO PILHA (que finalmente vai rodar)
```

---

## Parte 3 — Se FALHAR

Nada se perde: o resultado fecha a última dúvida e a gente vai pro 🅱️ (estoque por pasta), que é imune às duas limitações medidas — não usa git e nunca precisa apagar nada. Me manda a saída crua do teste e eu escrevo os dois comandos novos.

---

## Resumo do que fazer

1. Abrir tarefa nova no desktop com o seletor em **"no seu computador"**
2. Colar o prompt da seção 1.2
3. Me mandar a saída crua
4. Se passou: recriar a rotina matinal no modo local e conferir energia/app aberto
5. Se falhou: partimos pro 🅱️

**Pendente à parte:** apagar `C:\Economizei\_to_delete\` (resíduo do teste de ontem — não consigo apagar da nuvem, é a limitação em pessoa). E a **cod-0073 segue parada há 2 dias**, bloqueando a rotina — o `/entregar` em modo TREE dela é seu, como combinado.
