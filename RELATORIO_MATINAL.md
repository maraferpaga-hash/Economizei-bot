# ☀️ Relatório Matinal — Máquina Local

**Data:** 2026-07-09 (quinta-feira)
**Execução:** rotina automática (`economizei-rotina-matinal`), sem commit.

---

## Tarefa pega

**Nenhuma.** A "## 🌙 Fila pronta" da `AGENDA.md` continua **vazia** — não há tarefa com `status: pronta`. Nada foi implementado (o protocolo manda não inventar trabalho). **7ª execução seguida sem fila** (07-03 a 07-09).

Próximas candidatas anotadas na própria AGENDA: cadeia do Alerta Pro (cod-0031..0035, **bloqueada** por migration de `acompanhamentos` + gate Pro — ambos humanos) ou cod-0021/0022/0024 do Backlog (sobem pra fila na sessão de planejamento com o Opus).

---

## 🔎 Estado verificado (git)

- `git log`: `3b2f375` (docs) e `d4eaf51` (cod-0013..0017 + cod-0020) no topo — **o checkpoint Nível 2 de 07-08 já reconciliou** a AGENDA/CLAUDE com o git. Veredito registrado: 🟡→🟢, falta só a validação end-to-end em produção.
- **Working tree:** `AGENDA.md` e `CLAUDE.md` aparecem **modificados e não commitados** — são as edições de memória da sessão do checkpoint de 07-08 (+ este relatório). Nenhum arquivo de código pendente.

---

## O que mudou nesta execução

- **`RELATORIO_MATINAL.md`** — só este arquivo. Nenhum código, nenhuma movimentação na AGENDA.

`npm run check` não foi rodado (não houve mudança de código).

---

## O que precisa de você (Gabriel)

1. **Commitar a memória do checkpoint** — `AGENDA.md` + `CLAUDE.md` estão modificados no working tree desde a sessão de 07-08 (sugestão: `git add AGENDA.md CLAUDE.md && git commit -m "docs: checkpoint nivel 2 2026-07-08"` + push).
2. **Repriorizar a fila** — vazia há 7 dias; a rotina matinal fica ociosa até você + Opus subirem tarefas. Candidatas prontas pra refinar: **cod-0021** (copy obsoleta `nao_supermercado`), **cod-0022** (testes do formatter não-financeiro), **cod-0024** (nit do lembrete de inativo); ou destravar o **Alerta Pro** rodando a migration de `acompanhamentos`.
3. **Pendências pré-produção do checkpoint (os commits NÃO resolvem isso):**
   - Rodar no SQL Editor do Supabase: `migration_FUTURA_agente_perguntas.sql` + **A4** + **A9** (**A9 — `ALTER TABLE compras ADD cnpj` — ANTES de qualquer deploy**, senão `salvarCompra` quebra).
   - Envs no Railway **e no `.env.example`**: `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODO=llm`, `AGENTE_MODELO=gemini-2.5-flash`, `COMPARATIVO_AMOSTRAS_FREE=3`.
   - **Teste manual end-to-end** com cupom/pergunta real (nenhum teste unitário pega "número inventado" do Gemini real — o bug de 06-07).
   - Ligar o **gate Pro** do comparativo (`temFeaturesProAtivas` — financeiro, só você).
