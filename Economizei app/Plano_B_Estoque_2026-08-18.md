# 🅱️ Plano B — Estoque por pasta

**Data:** 2026-08-18 · **Decisão:** o caminho 🅰️ (rodar a rotina no seu computador) falhou —
a sessão caiu no mesmo sandbox, deixou 4 arquivos `.lock` e não conseguiu nem se limpar.
As duas limitações medidas valem, então, para **qualquer** lugar onde a máquina roda hoje.

**O que este plano faz:** tira o git do caminho da máquina. Ela para de editar `src/` e
passa a escrever cada leva numa pasta numerada. O working tree nunca suja, a guarda nunca
dispara, **e a máquina produz todos os dias mesmo com a entrega parada há uma semana.**

---

## 1. O desenho, em um quadro

**Hoje:**

```
máquina edita src/ direto  →  bancada suja  →  guarda dispara  →  produção ZERO
                                    ↑                                  até você entregar
                              fica aqui 8 dias
```

**Com o plano B:**

```
máquina escreve em estoque/0001_.../  →  src/ intacto  →  guarda nunca dispara
       0002_.../                                              ↓
       0003_.../  (teto: 4)                          produz todo dia, sem você
                          ↓
       você, quando quiser: /entregar aplica as levas em ordem, commita e sobe
```

A pasta de uma leva:

```
estoque/0001_2026-08-19_cod-0071/
    LEVA.md                          ← manifesto: o que muda, migration?, financeiro?
    arquivos/src/agent/canal.js      ← a versão completa do arquivo depois da mudança
    arquivos/test/canal.test.js
```

**A ordem é o nome da pasta.** `0001` antes de `0002`, sempre. A leva `0002` é construída
em cima da `0001` (a máquina usa a cópia mais nova de cada arquivo como ponto de partida) —
é a mesma "pilha linear" da Máquina 3.0, só que com pastas, que é o único mecanismo que
sobrevive às limitações deste disco.

---

## 2. Por que isto é imune ao que foi medido

| Limitação medida | Como o plano B passa por cima |
|---|---|
| **Não pode apagar nada** (`rm` → Operation not permitted) | A máquina nunca precisa apagar. Só cria pasta nova. Quem apaga é você, na sua máquina, depois do push. |
| **Só uma escrita de git funciona** (a 2ª trava pra sempre) | **A máquina não usa git pra escrever. Nenhum comando.** Só leitura, sempre com `GIT_OPTIONAL_LOCKS=0`. |
| **Bancada suja bloqueia a máquina** | `src/` e `test/` nunca são tocados → a bancada nunca suja → a guarda vira o que sempre deveria ter sido: um aviso de que *você* está no meio de uma edição manual. |
| **`git add -p` indisponível** (não dá pra fatiar entrega) | Cada leva é uma pasta separada. Entrega parcial vira `aplicar 1` e pronto — **pela primeira vez, "entrego metade hoje" existe de verdade.** |
| **`.claude/` protegido na nuvem** | Nada muda aqui: os comandos continuam sendo copiados por você. Mas agora existe um `check` que valida se a cópia deu certo (item 5.4). |
| **`sharp`/SIGBUS fora do Windows** | Não resolve — mas contorna melhor: a máquina valida numa cópia em `/tmp` **com todas as levas aplicadas juntas**, então ela testa a pilha integrada, não uma leva isolada. O gate final continua sendo o seu `npm run check`. |

---

## 3. O que se ganha além de destravar

1. **Entrega parcial passa a existir.** "Tenho 15 minutos" → `aplicar 1`, commita, sobe, pronto. As levas 2 e 3 continuam esperando, intactas.
2. **O estoque é a rede de segurança.** Se o `npm run check` der vermelho depois de aplicar, `git reset --hard origin/main` desfaz tudo e **nada se perde** — as pastas só somem depois do push. Hoje, um check vermelho no meio da entrega é uma situação nervosa.
3. **A trava de integridade sai da entrega e vai pra produção.** O `node --check` roda na hora em que o arquivo é escrito, não uma semana depois. Arquivo truncado é pego no mesmo dia.
4. **A zona proibida vira mecânica.** Hoje ela é uma instrução em texto que a máquina obedece por boa vontade. O `estoque.mjs` **recusa aplicar** qualquer leva que toque `supabase/`, `.env*`, `.github/`, `.claude/`, `package.json`, `Dockerfile`, `Procfile` ou o `check-firewall.mjs`. Testado.
5. **Some a duplicidade de modos.** Um regime só. As 3 Leis, a pilha, o teto de branches, o MODO PILHA do `/entregar` — tudo isso sai. Ficam 2 regras (cadeia, teto de estoque).
6. **A cópia manual acaba.** O `tarefa.md` ficou 8 dias quebrado em agosto porque foi corrigido colando texto num editor que renumerou os passos. Aplicar leva agora é um script, não um copiar-colar.

---

## 4. O que custa e o que pode dar errado

- **Dívida invisível.** Com um lugar confortável pra guardar, dá pra guardar demais. Defesa: **teto de 4 levas / ~1200 linhas** — passou disso, a máquina para de produzir e reporta "estoque cheio". E o `/entregar` abre destacando em vermelho qualquer leva parada há mais de 5 dias.
- **O estoque não vai pro GitHub** (recomendo colocar `estoque/` no `.gitignore` — ver 5.2). Ou seja, o que está em estoque existe só no seu disco. Como uma leva vive dias e não semanas, o risco é pequeno; se preferir versionar, dá pra reverter essa escolha depois.
- **Revisar arquivo completo é diferente de revisar diff.** Mas o diff continua acessível: o `/entregar` mostra `git diff --stat` depois de aplicar, e dá pra rodar `diff src/x.js estoque/0001_.../arquivos/src/x.js` antes.
- **Não conserta o `sharp`.** O verde confiável segue sendo na sua máquina. Isso é tarefa de código pra fila, não de processo.

---

## 5. Adoção — na ordem

### 5.1 · Primeiro, entregue a cod-0073 ⚠️
Ela está parada desde 16/08 e bloqueou as rotinas de 17 e 18. O regime novo pressupõe
`src/` limpo, então rode o `/entregar` **atual** (modo TREE) antes de trocar os comandos.

### 5.2 · Uma linha no `.gitignore`
```
estoque/
```
Assim as levas não entram no repositório nem viram imagem do Railway, e o `git status`
continua limpo — o que mantém a guarda da máquina simples e honesta.

### 5.3 · Crie o script
Copie o arquivo `comandos_novos/estoque.mjs.txt` para `scripts/estoque.mjs`
(renomeando — é cópia de arquivo, **não** copiar-e-colar).

Depois acrescente estas duas linhas em `package.json`, dentro de `"scripts"` — **isso é
zona proibida, então é você quem faz, à mão**:
```json
"estoque": "node scripts/estoque.mjs status",
"estoque:aplicar": "node scripts/estoque.mjs aplicar"
```

Teste na hora, sem risco (o estoque está vazio, ele só vai dizer isso):
```
node scripts/estoque.mjs status
```

### 5.4 · Troque os dois comandos
- `comandos_novos/tarefa_ESTOQUE_2026-08-18.md` → por cima de `.claude/commands/tarefa.md`
- `comandos_novos/entregar_ESTOQUE_2026-08-18.md` → por cima de `.claude/commands/entregar.md`

**Copie o arquivo inteiro, não cole o conteúdo.** Foi exatamente colar que quebrou o
`tarefa.md` em 07/08 (o editor renumerou os passos e comeu um trecho) e ninguém percebeu
por 8 dias. Depois de copiar, confirme com:
```
diff "Economizei app/comandos_novos/tarefa_ESTOQUE_2026-08-18.md" .claude/commands/tarefa.md
```
Saída vazia = cópia correta.

### 5.5 · Ajuste a AGENDA
- Renomeie a seção **"## 📚 Pilha da máquina"** para **"## 📦 Estoque"**, com as colunas:
  `# · Leva · Tarefa · Criada em · Linhas · Migration? · Idade`.
- Apague as 3 Leis, o teto de 3 branches e as menções a `maquina/*` do Protocolo — elas
  descrevem um mecanismo fisicamente impossível neste ambiente.
- No CLAUDE.md, a **regra 3 da seção 11** precisa ser reescrita: onde diz "a máquina commita
  só em branch `maquina/*`", passa a dizer que **a máquina não usa git; produz levas em
  `estoque/`; merge/push/deploy/migrations continuam 100% seus, via `/entregar`**. O espírito
  não muda — o gate real sempre foi o push.

### 5.6 · Primeira run de verdade
Deixe a rotina rodar amanhã e confira três coisas no `RELATORIO_MATINAL.md`:
1. criou `estoque/0001_...` com `LEVA.md` e `arquivos/`;
2. `git status` continua **sem `.js` sujo em `src/`**;
3. nenhum `.git/index.lock` ficou pra trás.

Se as três baterem, rode `node scripts/estoque.mjs status` e você vai ver a leva listada,
com integridade conferida. A partir daí a máquina não para mais por sua causa.

---

## 6. Achado técnico de brinde

Ao testar o script, encontrei um buraco no `node --check` (Node 22): um arquivo `.js`
**truncado** que começa com `export` **passa** na checagem — a deteção automática de módulo
engole o erro. Testei 8 casos de truncamento e esse foi o único que escapou.

Na prática o seu código é CommonJS (`require(...)`), então o buraco quase nunca apareceria.
Mas como `node --check` é justamente a trava do `/entregar` contra arquivo truncado — a
defesa criada por causa do mount que serve arquivo cortado —, o `estoque.mjs` já cobre o
caso com um segundo passe. Vale saber que a trava atual tem essa fresta.

---

## 7. Resumo do que fazer

| | Passo | Quem |
|---|---|---|
| 1 | `/entregar` a cod-0073 (modo TREE, comando atual) | você |
| 2 | `estoque/` no `.gitignore` | você |
| 3 | `estoque.mjs.txt` → `scripts/estoque.mjs` + 2 linhas no `package.json` | você |
| 4 | copiar os 2 comandos novos por cima de `.claude/commands/` | você |
| 5 | renomear a seção da AGENDA e reescrever a regra 3 do CLAUDE.md | posso fazer |
| 6 | deixar a rotina rodar e conferir os 3 sinais | automático |

Se quiser, eu já faço o passo 5 (AGENDA + CLAUDE.md) — são arquivos `.md`, não disparam
nenhuma guarda, e é a parte chata.

**Pendência antiga:** apagar `C:\Economizei\_to_delete\` (resíduo dos testes de git).
