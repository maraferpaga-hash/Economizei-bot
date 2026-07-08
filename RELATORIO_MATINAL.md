# ☀️ Relatório Matinal — Máquina Local

**Data:** 2026-07-07 (terça-feira)
**Execução:** rotina automática (`economizei-rotina-matinal`), sem commit.

---

## Tarefa pega

**Nenhuma.** A "## 🌙 Fila pronta" da `AGENDA.md` continua **vazia** — não há tarefa com `status: pronta`. Nada foi implementado nesta execução (o protocolo manda não inventar trabalho). **5ª execução seguida sem fila** (07-03, 07-04, 07-05, 07-06 e hoje).

Próximas candidatas anotadas na própria AGENDA: cadeia do Alerta Pro (cod-0031..0035, **bloqueada** por migration de `acompanhamentos` + gate Pro — ambos humanos) ou cod-0021/0022/0024 do Backlog (precisam ser refinadas e sobem pra fila na sessão de planejamento com o Opus).

---

## O que mudou

- **`RELATORIO_MATINAL.md`** — só este arquivo. Nenhum código, nenhuma movimentação na AGENDA.

`npm run check` não foi rodado (não houve mudança de código nesta execução).

---

## Estado pendente (conforme AGENDA + relatório anterior)

Último commit conhecido: `a795f65` (= `origin/main`). **A pilha das sessões de 07-02 e 07-03 segue em "Em revisão" — 5º dia sem commit:**

- **cod-0020 (comparativo `/comparar`):** `src/insights.js`, `src/supabase.js`, `src/formatter.js`, `src/index.js`, `test/insights-comparativo.test.js`
- **cod-0013 (classificador):** `src/agent/classifier.js`, `test/agent-classifier.test.js`
- **cod-0014..0017 (render + mensagens + cota + orquestrador):** `src/agent/render.js`, `src/agent/cota.js`, `src/agent/index.js`, `src/formatter.js`, `src/scheduler.js`, `src/index.js` + 4 arquivos de teste

---

## O que precisa de você (Gabriel)

1. **Revisar + commitar o empilhado** — sugestão da sessão de 07-03: commits separados (cod-0020, cod-0013, e um por tarefa do bloco 0014..0017, ou agrupado). Antes: `npm run check` na sua máquina como gate final. **Já são 5 dias com a mesma pilha no working tree** — quanto mais acumula, maior o risco de conflito ou de perda acidental (`git checkout .` descartaria tudo de uma vez).
2. **Migrations no Supabase (SQL Editor):**
   - **A9 (`compras.cnpj`) — rodar ANTES de qualquer deploy** (o `salvarCompra` já commitado grava `cnpj`; sem o ALTER, o insert quebra).
   - A4 (`resumos_mensais_enviados`) — rodar quando puder.
   - `migration_FUTURA_agente_perguntas.sql` — rodar **antes do deploy** dos cod-0016/0017.
3. **Envs no Railway + `.env.example`:** `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODO=llm`, `AGENTE_MODELO=gemini-2.5-flash`, `COMPARATIVO_AMOSTRAS_FREE=3`.
4. **Repriorizar a fila — item mais urgente pra rotina voltar a produzir:** a "Fila pronta" está vazia pelo 5º dia; cada execução automática só queima o slot do dia sem produzir nada. Na próxima sessão de planejamento, decidir o que sobe (Alerta Pro exige a migration de `acompanhamentos` + decisão Free×Pro primeiro; ou refinar cod-0021/0022/0024 do Backlog).
5. Pendente da AGENDA: rodar um **checkpoint integral (Nível 2)** — o gatilho de volume (6 tarefas commitadas) já passou. Com a fila vazia e a pilha parada em revisão, este é um bom momento pra fazer o checkpoint junto com o commit.
