# ✅ Passo a passo — adoção do regime ESTOQUE

**Estado verificado agora (18/08):** cod-0073 entregue (`ba1c508`), docs reconciliados
(`b9013fb`), `main` == `origin/main`, working tree limpo. Você já fez 2 dos 6 passos.

| | Passo | Situação |
|---|---|---|
| 1 | Entregar a cod-0073 | ✅ **feito** |
| 2 | `estoque/` no `.gitignore` | ✅ **feito** |
| 3 | `scripts/estoque.mjs` | ✅ **feito agora** — instalei e testei no seu repo |
| 4 | Trocar os 2 comandos em `.claude/commands/` | ⬜ **só você pode** (ver abaixo) |
| 5 | AGENDA + CLAUDE.md | ⬜ posso fazer, é só falar |
| 6 | Commitar e limpar | ⬜ você |

---

## PASSO 4 — Trocar os dois comandos ⬅️ **este é o único que trava tudo**

As ferramentas remotas são **bloqueadas** de escrever em `.claude/` (tentei agora e o
sistema recusou: *"Writing to .claude is not permitted via remote tools"*). Então esta
cópia é sua, à mão. É exatamente o passo que quebrou em 07/08 — por isso tem verificação.

### 4.1 · Copiar (arquivo inteiro, NÃO copiar-e-colar)

**No PowerShell:**
```powershell
cd C:\Economizei
Copy-Item ".\Economizei app\comandos_novos\tarefa_ESTOQUE_2026-08-18.md"   ".\.claude\commands\tarefa.md"   -Force
Copy-Item ".\Economizei app\comandos_novos\entregar_ESTOQUE_2026-08-18.md" ".\.claude\commands\entregar.md" -Force
```

**Ou no Git Bash:**
```bash
cd /c/Economizei
cp "Economizei app/comandos_novos/tarefa_ESTOQUE_2026-08-18.md"   .claude/commands/tarefa.md
cp "Economizei app/comandos_novos/entregar_ESTOQUE_2026-08-18.md" .claude/commands/entregar.md
```

> ⚠️ **Não abra os arquivos num editor e cole o conteúdo.** Foi assim que o `tarefa.md`
> ficou 8 dias quebrado em agosto: o editor renumerou os passos e comeu um trecho, e a
> memória registrou como "feito". Cópia de arquivo não tem esse risco.

### 4.2 · Verificar que a cópia deu certo — **não pule**

**PowerShell** (saída vazia = idêntico):
```powershell
Compare-Object (Get-Content ".\Economizei app\comandos_novos\tarefa_ESTOQUE_2026-08-18.md")   (Get-Content ".\.claude\commands\tarefa.md")
Compare-Object (Get-Content ".\Economizei app\comandos_novos\entregar_ESTOQUE_2026-08-18.md") (Get-Content ".\.claude\commands\entregar.md")
```

**Git Bash** (saída vazia = idêntico):
```bash
diff "Economizei app/comandos_novos/tarefa_ESTOQUE_2026-08-18.md"   .claude/commands/tarefa.md
diff "Economizei app/comandos_novos/entregar_ESTOQUE_2026-08-18.md" .claude/commands/entregar.md
```

**Conferência rápida de sanidade** — as contagens têm que bater exatamente:

| Arquivo | Linhas | 1ª linha começa com |
|---|---|---|
| `.claude/commands/tarefa.md` | **173** | `Você é o engenheiro do Economizei. Pegue trabalho da AGENDA.md…` |
| `.claude/commands/entregar.md` | **146** | `Você é o entregador do Economizei rodando LOCAL, na máquina do Gabriel…` |

Se a `tarefa.md` ainda começar com *"…rodando LOCAL, na pasta do projeto (regime **Máquina
3.0 — PILHA DE BRANCHES**…"*, a cópia **não** aconteceu.

---

## PASSO 5 — AGENDA e CLAUDE.md (posso fazer, é só falar)

São 3 edições em arquivos `.md`, nenhuma toca código:

1. **AGENDA** — renomear `## 📚 Pilha da máquina` para `## 📦 Estoque`, com as colunas
   `# · Leva · Tarefa · Criada em · Linhas · Migration? · Idade`, e trocar o texto
   explicativo (as 3 Leis e o teto de 3 branches descrevem algo fisicamente impossível
   neste ambiente).
2. **AGENDA** — no `## 📐 Protocolo`, reescrever os itens 2, 6 e 7 (inspeção da pilha,
   criação de branch, commit na branch) para o fluxo de leva em pasta.
3. **CLAUDE.md** — reescrever a **regra 3 da seção 11**: onde hoje diz *"a máquina commita
   só em branch `maquina/*`"*, passa a dizer que **a máquina não usa git; produz levas em
   `estoque/`**. Merge/push/deploy/migrations continuam 100% seus, via `/entregar` — o
   espírito não muda, o gate real sempre foi o push.

---

## PASSO 6 — Commitar e limpar

### 6.1 · O que vai entrar no commit

```
scripts/estoque.mjs                                    (novo)
.claude/commands/tarefa.md                             (substituído)
.claude/commands/entregar.md                           (substituído)
.gitignore                                             (já tem estoque/)
Economizei app/Plano_B_Estoque_2026-08-18.md           (novo)
Economizei app/comandos_novos/*                        (novo)
AGENDA.md · CLAUDE.md                                  (se o passo 5 rodar)
```

Sugestão de mensagem:
```
chore(maquina): regime ESTOQUE - a maquina para de usar git, produz levas em pasta
```

Rode o `npm run check` antes (o `pre-push` vai rodar de novo, mas melhor descobrir cedo).

### 6.2 · Dois arquivos de lixo pra apagar (não consigo daqui)

```powershell
Remove-Item -Recurse -Force "C:\Economizei\_to_delete"
Remove-Item -Force "C:\Economizei\Economizei app\comandos_novos\scriptsestoque.mjs.md"
```

- `_to_delete\` — os repositórios descartáveis do teste de git de ontem.
- `scriptsestoque.mjs.md` — cópia do `tarefa_ESTOQUE` com o nome trocado, sobrou da sua
  sessão. O arquivo com o nome certo já está lá; este é duplicata.

### 6.3 · Opcional — dois atalhos no `package.json`

Puro conforto: o script funciona sem isso. Como `package.json` é zona proibida, é edição sua:
```json
"estoque": "node scripts/estoque.mjs status",
"estoque:aplicar": "node scripts/estoque.mjs aplicar"
```

---

## Depois: a primeira run de verdade

Amanhã de manhã, confira 3 coisas no `RELATORIO_MATINAL.md`:

1. criou `estoque/0001_2026-08-19_cod-XXXX/` com `LEVA.md` e `arquivos/` dentro;
2. `git status` **sem `.js` sujo em `src/` ou `test/`** — a bancada continua limpa;
3. nenhum `.git/index.lock` ficou pra trás.

Aí rode:
```
node scripts/estoque.mjs status
```

Você deve ver a leva listada, com `node --check` conferido em cada arquivo e o delta de
linhas. **A partir daí a máquina não para mais por sua causa** — o teto é 4 levas, então
você tem ~4 dias de folga antes de precisar entregar qualquer coisa.

---

## Como vai ser entregar, daqui pra frente

```
/entregar
   → abre com: "📦 estoque: 2 levas · 340 linhas · mais antiga há 3 dias
                faixa: 🟢 VERDE · custo estimado ~10 min"
   → você escolhe quantas levas entram (só um prefixo: as N primeiras)
   → ele aplica uma a uma, commita cada uma, roda npm run check
   → você digita APROVO
   → push, limpa as levas entregues, reconcilia a AGENDA
```

Se o check der vermelho depois de aplicar: `git reset --hard origin/main` desfaz tudo e
**nada se perde** — as pastas do estoque só são apagadas depois do push.
