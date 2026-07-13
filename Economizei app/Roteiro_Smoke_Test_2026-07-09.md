# 🧪 Roteiro de Smoke Test — Agente + salvar-cupom (pós-A9)

> **Data:** 2026-07-09 · **Tempo:** ~10 min · **Onde:** seu WhatsApp + Railway (Logs) + Supabase (SQL Editor).
> **Por que existe:** nenhum teste unitário pega "o Gemini inventou um número" (o bug de 06-07) nem "o cupom parou de salvar" (o incidente A9). Só o teste manual com dado real prova. Este roteiro é o que fecha a frente **Estabilizar o produto**.

---

## Antes de começar — pré-requisitos

- [x] **A9 rodada** — `compras.cnpj` existe (confirmado 2026-07-09). Salvar-cupom desbloqueado.
- [ ] **A4** + **`migration_FUTURA_agente_perguntas.sql`** rodadas no SQL Editor.
- [ ] **Envs no Railway:** `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODO=llm`, `AGENTE_MODELO=gemini-2.5-flash`, `COMPARATIVO_AMOSTRAS_FREE=3`.
- [ ] **Deploy vivo** — o último deploy do Railway terminou e `GET /health` responde 200.

> Se a migration do agente ainda **não** rodou, o Agente responde mesmo assim (a cota é *fail-open* e o log é *fire-and-forget*), mas você **não** vai conseguir conferir o `perguntas_log` na Parte 4. Rode-a antes pra o teste ficar completo.

---

## Parte 1 — Salvar cupom (o que a A9 conserta) 🧾

Do seu número, manda pro bot uma **foto de um cupom de mercado real**.

- [ ] O bot confirma com a lista de itens + total. *(Erro ou silêncio aqui = a A9 não pegou → ver "Se falhar".)*
- [ ] Anota o **total confirmado**: R$ ________

Confere no banco (SQL Editor — troca `SEU_NUMERO` por `55DDDNUMERO`):

```sql
SELECT id, loja, total, cnpj, data_compra
FROM compras
WHERE phone_number = 'SEU_NUMERO'
ORDER BY id DESC LIMIT 3;
```

- [ ] A compra apareceu, com **`cnpj` preenchido** (não NULL) e `total` batendo com a confirmação.

---

## Parte 2 — Agente de Perguntas (número certo + honestidade) 🤖

**O truque do teste:** o `/gastos` é calculado por **código** (fonte da verdade); o Agente **narra**. Se os dois divergirem, o firewall de fidelidade numérica falhou.

**Passo A — pega a verdade (determinística):**
- [ ] Manda `/gastos`. Anota o total do mês: R$ ________

**Passo B — pergunta a MESMA coisa em linguagem natural:**
- [ ] `quanto gastei esse mês?` → o número narrado **tem que bater** com o do `/gastos`.  ✅ bate / ❌ diverge
- [ ] `tô gastando mais que mês passado?` → comparação coerente com os seus meses.
- [ ] `quais minhas maiores categorias?` → responde com dado real, não genérico.

**Passo C — honestidade (não inventa, não sai do escopo):**
- [ ] `qual a capital da França?` → mensagem gentil de escopo ("eu respondo sobre os seus gastos…"), **sem** inventar número. *(E não consome cota — confere na Parte 4.)*
- [ ] Uma pergunta sem resposta possível pros seus dados → deve dizer honestamente que não tem, **sem chutar**.

---

## Parte 3 — Regressão (nada velho quebrou) 🔁

- [ ] `/gastos`, `/historico`, `/economia` respondem igual a antes.
- [ ] `/comparar` → comparativo de amostra **OU** estado-vazio honesto. *(A base `precos_mercado` ainda é rala; vazio é o esperado, não é bug.)*

---

## Parte 4 — Conferência técnica 🔍

**Railway → Logs**, filtra por `agente`:
- [ ] Fluxo sem `agente_erro`. Um `agente_render_fidelidade_reprovada` **isolado** = airbag funcionando (a pessoa recebeu o template com o número certo). **Muitos** seguidos = me avisa.

**Supabase → SQL Editor:**
```sql
SELECT criado_em, intent, confianca, tem_dados, modo, fidelidade_ok, respondeu
FROM perguntas_log ORDER BY criado_em DESC LIMIT 20;

SELECT perguntas_mes_atual FROM usuarios WHERE phone_number = 'SEU_NUMERO';
```
- [ ] `fidelidade_ok = true` na maioria das linhas com `modo = 'llm'`.
- [ ] A pergunta off-topic (França) **não** incrementou `perguntas_mes_atual`; as on-topic incrementaram.

---

## ✅ Critério de aprovação

Passou se: **(1)** o cupom salvou com `cnpj`, **(2)** o número do Agente **bateu** com o `/gastos`, **(3)** a pergunta fora de escopo foi recusada com gentileza (sem número inventado), e **(4)** o `perguntas_log` mostra `fidelidade_ok` majoritário. Aí o Agente + salvar-cupom estão validados em produção — pode dar a frente "Estabilizar o produto" por fechada.

---

## 🚑 Se falhar — o que fazer

| Sintoma | Ação |
|---|---|
| Cupom não salva | Railway Logs → procura o erro do insert em `salvarCompra`; confirma que A9 **e** A4 rodaram. Me traz a linha do log. |
| Agente narrou número **errado** (divergiu do `/gastos`) | **P0.** Copia a mensagem exata + a linha do `perguntas_log` (`fidelidade_ok`) e me manda. **Mitigação imediata:** setar `AGENTE_MODO=template` no Railway — desliga a narração LLM e usa só o template determinístico até a gente investigar. |
| Agente sempre "fora de escopo" | Problema no classificador. Me manda 2–3 exemplos das perguntas que ele recusou. |
| Custo/chamadas Gemini altos | `AGENTE_MODO=template` corta pela metade (1 chamada em vez de 2 por pergunta). |

---

*Depois do smoke test verde: rodar um **checkpoint Nível 2** (prompt pronto no fim de `Passo_a_Passo_Deploy_Agente_2026-07-03.md`).*
