# 🚀 Passo a Passo — Deploy do Agente de Perguntas (conversa fluida)

> **Data:** 2026-07-03 · **O que sobe:** cod-0013..0017 (Agente completo) + cod-0020 (comparativo/`/comparar`), hoje no working tree sem commit.
> **Regra de ouro da ordem:** o Railway faz deploy automático no `git push` — então **as migrations e as envs vêm ANTES do push** (passos 2 e 3 antes do 5).

---

## Passo 1 — Gate final: `npm run check`

**Onde:** terminal (PowerShell ou cmd) na pasta do projeto.

```
cd C:\Economizei
npm run check
```

**Esperado:** `✓ FIREWALL OK`, todos os testes verdes (na sua máquina os 2 testes de `sharp` também passam) e check-pages verde.
**Se falhar:** não siga adiante — me traga o erro. `git checkout .` descarta tudo se quiser abortar.

---

## Passo 2 — Migrations no Supabase (3 pendentes)

**Onde:** [supabase.com](https://supabase.com) → seu projeto → **SQL Editor** → *New query*.

Cole e rode (Run) **um arquivo por vez**, nesta ordem — o conteúdo está em `C:\Economizei\supabase\`:

1. `migration_2026-06-30_A9_compras_cnpj.sql` — **obrigatória antes de QUALQUER deploy** (o `salvarCompra` já commitado grava `cnpj`; sem a coluna, salvar cupom quebra).
2. `migration_2026-06-30_A4_resumos_mensais_enviados.sql` — idempotente (se a tabela já existe à mão, é no-op).
3. `migration_FUTURA_agente_perguntas.sql` — **obrigatória antes do deploy do agente** (coluna `perguntas_mes_atual` + tabela `perguntas_log`). Sem ela o bot responde, mas a cota fica sem limite (fail-open) e o log não grava.

**Verificação (cole no SQL Editor depois):**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'usuarios' AND column_name = 'perguntas_mes_atual'
UNION ALL
SELECT column_name FROM information_schema.columns
WHERE table_name = 'compras' AND column_name = 'cnpj';
-- esperado: 2 linhas (perguntas_mes_atual, cnpj)

SELECT to_regclass('public.perguntas_log') AS tabela_log,
       to_regclass('public.resumos_mensais_enviados') AS tabela_resumos;
-- esperado: os 2 nomes preenchidos (não NULL)
```

---

## Passo 3 — Envs no Railway

**Onde:** [railway.app](https://railway.app) → projeto do bot → serviço → aba **Variables** → *New Variable* (3×):

```
LIMITE_PERGUNTAS_FREE=30
AGENTE_MODO=llm
AGENTE_MODELO=gemini-2.5-flash
COMPARATIVO_AMOSTRAS_FREE=3
```

*(a 4ª é do cod-0020 — teaser do comparativo, pendente desde 07-02)*
O Railway reinicia o serviço ao salvar — sem problema, ainda é o código antigo.

---

## Passo 4 — `.env.example` (na sua máquina)

**Onde:** abra `C:\Economizei\.env.example` no editor e acrescente no fim (a automação não pode tocar `.env*`, por isso é seu):

```
# Agente de Perguntas (cod-0016/0017)
LIMITE_PERGUNTAS_FREE=30
AGENTE_MODO=llm
AGENTE_MODELO=gemini-2.5-flash

# Comparativo entre mercados (cod-0020) — nº de amostras no Free
COMPARATIVO_AMOSTRAS_FREE=3
```

---

## Passo 5 — Commits + push

**Onde:** terminal na pasta `C:\Economizei`.

> Nota honesta: cod-0020 e cod-0014..0017 tocaram os MESMOS arquivos (`formatter.js`, `supabase.js`, `index.js`), então separar por tarefa exigiria `git add -p`. Sugestão pragmática — **3 commits**:

```
:: 1) classificador (arquivos isolados)
git add src/agent/classifier.js test/agent-classifier.test.js
git commit -m "feat(agente): classificador de intencoes via Gemini (cod-0013)"

:: 2) comparativo (arquivos isolados dele)
git add src/insights.js test/insights-comparativo.test.js
git commit -m "feat: comparativo entre mercados - leitura + /comparar (cod-0020, parcial: nucleo)"

:: 3) conversa fluida completa + o restante do cod-0020 (arquivos compartilhados) + envs + memoria
git add src/agent/ src/formatter.js src/supabase.js src/scheduler.js src/index.js test/ .env.example AGENDA.md CLAUDE.md CODE_GUIDE.md RELATORIO_MATINAL.md
git commit -m "feat(agente): conversa fluida completa - render+cota+orquestrador (cod-0014..0017) + wiring /comparar"

git push
```

*(Os 2 docs novos de campanha em `Economizei app/` são de outra sessão — commite junto se quiser: `git add "Economizei app/"`.)*
O push dispara o deploy no Railway (~2 min).

---

## Passo 6 — Smoke test no WhatsApp (3 min)

Mande pro bot, do seu número:

1. `quanto gastei esse mês?` → deve responder com o total real, em texto natural.
2. `tô gastando mais que mês passado?` → comparação com a média dos meses anteriores.
3. `qual a capital da França?` → mensagem gentil de escopo ("eu respondo sobre os seus gastos…").
4. `/gastos` → continua funcionando igual (nenhum comando mudou).
5. *(opcional)* `/comparar` → comparativo ou estado-vazio honesto (a base `precos_mercado` ainda é rala).

**Conferir os logs (Railway → Logs):** filtre por `agente` — deve aparecer o fluxo sem `agente_erro`. Um `agente_render_fidelidade_reprovada` ocasional é o airbag funcionando (a pessoa recebeu o template, número certo). **Muitos** seguidos = me avise.

**Conferir o log de auditoria (SQL Editor):**

```sql
SELECT criado_em, intent, confianca, tem_dados, modo, fidelidade_ok, respondeu
FROM perguntas_log ORDER BY criado_em DESC LIMIT 20;
```

`fidelidade_ok = true` na maioria = narração saudável (métrica do checkpoint do "chat automático", Sistema_Checkpoints §).

---

## Passo 7 — Checkpoint Nível 2 (já estava devido)

A AGENDA registra que o gatilho de volume (6 tarefas commitadas) já passou — e este push adiciona mais 5-6. Depois do smoke test, rode um **checkpoint integral** comigo. Prompt pronto pra colar aqui no Cowork (ou no Claude Code):

```
Leia o CLAUDE.md, a AGENDA.md e o Sistema_Checkpoints_Benchmarks_2026-06-30.md e rode um checkpoint Nível 2 completo: Lado A (máquina) e Lado B (software), incluindo a ênfase no firewall de fidelidade numérica do agente que acabou de subir. Me devolva o checklist preenchido e as ações que sobrarem pra mim.
```

---

## Resumo da ordem (não inverta)

| # | Ação | Onde |
|---|---|---|
| 1 | `npm run check` | Terminal na pasta |
| 2 | 3 migrations (A9 → A4 → agente) | Supabase SQL Editor |
| 3 | 4 envs | Railway → Variables |
| 4 | Acrescentar envs no `.env.example` | Editor, na sua máquina |
| 5 | 3 commits + `git push` (dispara o deploy) | Terminal na pasta |
| 6 | Smoke test (5 mensagens) + logs + `perguntas_log` | WhatsApp / Railway / Supabase |
| 7 | Checkpoint Nível 2 | Prompt pronto acima, comigo |
