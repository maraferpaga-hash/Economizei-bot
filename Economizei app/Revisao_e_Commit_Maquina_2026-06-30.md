# 🔧 Revisão & Commit do Trabalho Acumulado da Máquina Local

**Data:** 2026-06-30
**Contexto:** a Máquina Local rodou ~4 dias (rotina Cowork das 10h) e **nenhuma rodada foi commitada**. Tudo empilhou no working tree desde o seu último commit (`b73b15b`). Este documento é o passo a passo pra você **revisar, testar e commitar** — na sua máquina, porque o Cowork não tem credencial git.

> **Regra de ouro:** a automação **nunca commita**. Quem revisa e commita é você. Este roteiro existe pra esse momento não virar adivinhação.

---

## 📦 O que está no working tree (5 blocos prontos + memória)

Auditei cada arquivo. Está tudo saudável: **95 testes verdes** nos 6 arquivos que rodam no sandbox, **firewall financeiro limpo** (zero toque em pagamento/`is_pro`/`supabase`), **nenhuma migration necessária** pras 5 tarefas.

| # | Bloco | Tarefa | Arquivos | Testes | Migration? |
|---|---|---|---|---|---|
| 1 | Classificação lidera pelo tipo | **cod-0026** | `src/gemini.js`, `test/gemini-canonico.test.js` | +3 ✓ | Não |
| 2 | Corpus de regressão | **cod-0027** | `test/classificacao-corpus.test.js` (novo) | ✓* | Não |
| 3 | Matching do Alerta Pro | **cod-0030** | `src/insights.js`, `test/insights-matching.test.js` (novo) | 17 ✓ | Não |
| 4 | `/apagar` (LGPD) | **cod-0006** | `src/apagar.js` (novo), `test/apagar.test.js` (novo), `src/supabase.js`, `src/formatter.js`, `src/index.js` | 11 ✓ | Não |
| 5 | Guardas do Agente | **cod-0011** | `src/agent/guards.js` (novo), `test/agent-guards.test.js` (novo) | 28 ✓ | Não |
| 6 | Memória + desenhos | — | `AGENDA.md`, `CLAUDE.md`, `CODE_GUIDE.md`, `RELATORIO_MATINAL.md` + 2 docs de desenho + os 3 docs desta sessão | — | — |

> **\*** `test/classificacao-corpus.test.js` e `test/gemini-canonico.test.js` **falham no meu sandbox** porque carregam o `gemini.js` → `require('sharp')`, e a lib nativa do `sharp` dá **SIGBUS** no Linux daqui. **Na sua máquina Windows o `sharp` funciona e os dois passam.** É a única "falha" — e não é do código.

---

## ✅ ETAPA 0 — Pré-voo (uma vez, antes de qualquer commit)

```bash
cd C:\Economizei
git status                 # confere que bate com a tabela acima
npm run check              # firewall + TODOS os testes + páginas — TEM que fechar verde
```

- `npm run check` na sua máquina roda o `sharp` de verdade → os 8 arquivos de teste devem passar (≈ 95+ testes).
- Se **algo vermelho que não seja ambiental** aparecer, **pare** e me chame antes de commitar.
- Se fechar verde, siga pra Etapa 1.

> Por que rodar antes: o gate por-tarefa é `npm run check`. Você está commitando 5 tarefas de uma vez, então roda o gate uma vez cobrindo todas.

---

## ✅ ETAPA 1 — Commitar bloco a bloco (5 commits de feature)

Você escolheu **5 commits lógicos**. Ordem por dependência (classificação primeiro — é o coração; depois as features independentes). Copie e cole um bloco por vez.

### Commit 1 — cod-0026 (classificação lidera pelo tipo genérico)
```bash
git add src/gemini.js test/gemini-canonico.test.js
git commit -m "refino(classificacao): nome_canonico lidera pelo tipo generico + status comeca_por_marca (cod-0026)"
```
**O que revisar no diff:** `gemini.js` ganhou `MARCAS_SEM_SUBSTANTIVO`, helper `comecaPorMarca` e o novo status `comeca_por_marca` em `avaliarQualidadeCanonicoItem`. É só **sinal de log** — não bloqueia nada. Prompt do Gemini reforça "tipo genérico antes da marca".

### Commit 2 — cod-0027 (corpus de regressão da classificação)
```bash
git add test/classificacao-corpus.test.js
git commit -m "teste(classificacao): corpus de regressao do nome_canonico — o coracao (cod-0027)"
```
**O que revisar:** arquivo novo, só teste. 20 casos bons + 10 ruins + 2 de sanidade. Trava regressão sempre que mexer no prompt/extração.

### Commit 3 — cod-0030 (engine de matching do Alerta Pro)
```bash
git add src/insights.js test/insights-matching.test.js
git commit -m "feat(insights): engine de matching puro do Alerta Pro — item-alvo, gasto por alvo, superfluo (cod-0030)"
```
**O que revisar:** `insights.js` ganhou `casarItemComAlvo`, `buscarGastoPorAlvo`, `buscarGastoSuperfluo` (funções **puras**, sem I/O). Matching por palavra inteira (`\b…\b`), acento-insensível, ≥3 chars. Nada casa → total 0 (nunca chuta número). **Ainda não está ligado em nenhum comando** — é só a engine.

### Commit 4 — cod-0006 (`/apagar`, LGPD)
```bash
git add src/apagar.js test/apagar.test.js src/supabase.js src/formatter.js src/index.js
git commit -m "feat(lgpd): comando /apagar — exclusao total de dados em 2 passos (cod-0006)"
```
**O que revisar com atenção (é o que mais toca arquivos):**
- `src/index.js`: o handler do `/apagar` entra **antes do gate de onboarding** (de propósito — direito de eliminação vale em qualquer etapa). 2 passos: `/apagar` pede confirmação, `/apagar confirmar` apaga.
- `src/supabase.js`: `apagarDadosUsuario` deleta em ordem de FK (compras→itens cascade, indicações, lembretes, resumos, mensagens, usuários). **Não toca** eventos de pagamento nem `precos_mercado`.
- `src/formatter.js`: 3 mensagens novas (confirmação, concluído, erro).
- ⚠️ **Ressalva conhecida:** usuário com evento de pagamento ativo → a FK barra a remoção de `usuarios`. Tratar pagante ativo é follow-up financeiro **seu** (fora do escopo limpo desta tarefa).

### Commit 5 — cod-0011 (guardas de honestidade do Agente)
```bash
git add src/agent/guards.js test/agent-guards.test.js
git commit -m "feat(agente): guardas de honestidade puras — validarClassificacao, extrairNumeros, conferirFidelidadeNumerica (cod-0011)"
```
**O que revisar:** 2 arquivos novos. `guards.js` são 3 funções **puras** (sem I/O, não chamam Gemini) — a base de segurança do futuro Agente de Perguntas. `conferirFidelidadeNumerica` é o que vai impedir o chat de inventar número (airbag → cai no template). Não está ligado em nada ainda; é peça de fundação.

---

## ✅ ETAPA 2 — Commitar memória + desenhos (1 commit)

Os arquivos `.md` (AGENDA, CLAUDE, CODE_GUIDE, RELATORIO) foram tocados **cumulativamente** pelos 5 blocos — não dá pra fatiar por tarefa sem staging manual de hunk. Então vão juntos, num commit de documentação. Isto também varre os 3 documentos que criei nesta sessão.

```bash
git add -A
git status                 # confirme que só sobraram .md / docs (nada de src/ solto)
git commit -m "docs: memoria institucional + checkpoints + pilares + desenhos (rodadas 06-27..06-30)"
```

---

## ✅ ETAPA 3 — Push

```bash
git push
```

Confere no GitHub que os 6 commits subiram. Pronto — o working tree volta a ficar limpo e sincronizado com `origin/main`.

---

## 🧹 ETAPA 4 — Limpeza pendente do GitHub Actions (opcional, mas recomendada)

Sobrou da migração pra automação local (decisão 2026-06-24). Hoje `ci.yml` e `claude-nightly.yml` ainda estão no repo sem uso.

```bash
git rm .github/workflows/ci.yml .github/workflows/claude-nightly.yml
git commit -m "chore: remove workflows do GitHub Actions (automacao agora e local)"
git push
```
- **Mantenha** `monthly-cron.yml` (resumo mensal, sem relação).
- Se você criou branch protection exigindo o check "CI", remova (senão trava PRs futuros).

---

## 🆘 Se precisar desfazer

| Situação | Comando |
|---|---|
| Descartar **tudo** que não foi commitado (tracked) | `git checkout .` (arquivos novos você apaga à mão) |
| Desfazer o **último commit** mantendo as mudanças | `git reset --soft HEAD~1` |
| `npm run check` vermelho num caso não-ambiental | **Pare e me chame** — não commite por cima |

---

## 📋 Resumo do que falta (programação & commit)

1. ✅ **Código:** os 5 blocos estão prontos e testados. Não falta programação neles.
2. 🔲 **Commit:** os 6 commits acima (você, na sua máquina).
3. 🔲 **Limpeza Actions:** Etapa 4 (opcional).
4. ℹ️ **Migrations:** **não** pras 5 tarefas atuais. Só entram nas **próximas** — Agente `cod-0016/0017` (tabela `perguntas_log`) e cadeia Pro `cod-0031+` (tabela `acompanhamentos`). Quando chegar nelas, a migration é **sua** (zona proibida da máquina).
