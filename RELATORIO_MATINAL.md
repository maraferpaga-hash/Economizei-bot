# ☀️ Relatório Matinal — Máquina Local do Economizei

**Data:** 2026-07-27 (segunda-feira)
**Execução:** rotina automática (Cowork Scheduled) — **SEM commit** · **nenhuma tarefa implementada hoje** (motivo abaixo)
**⚠️ 3º dia seguido de fila bloqueada** — e agora o working tree carrega **duas** levas de trabalho seu não-commitado (cod-0033 de 07-24 **+** a sessão financeira de 07-26).

---

## 🎯 Resultado: **nenhuma tarefa pega** — a fila só tem tarefas bloqueadas por você

Percorri a "🌙 Fila pronta" de cima pra baixo. As **duas** tarefas com `status: pronta` são grandes, mexem no **coração** (prompt do Gemini / classificação) e **dependem de material que só você fornece**. Nenhuma é elegível pra run autônoma. Seguindo o protocolo (tarefa grande/ambígua/bloqueada → **não implementar**, relatar o plano e parar), não escrevi código.

| Ordem | Tarefa | Por que a máquina não pega |
|---|---|---|
| 1ª | **cod-0062** — ler comprovante de PIX | A própria AGENDA marca "**NÃO é pra run autônoma**" (nota 07-18): mexe no prompt do Gemini (coração), o firewall acusa o token "pix" **de propósito** (commit consciente = seu), e falta o **pré-req humano: 2–3 comprovantes PIX reais** pro mini-corpus. Rodar **com você presente**. |
| 2ª | **cod-0065** — modo recibo Canadá (Vancouver) | Mesma família: reescreve o PROMPT + `coerceNumber` (coração) e **exige 2–3 recibos canadenses reais** pro mini-corpus de regressão. Risco fino: `coerceNumber` ler `"1,299.90"` (CA) sem quebrar `"1.299,90"` pt-BR — troca no parser numérico que corrompe total em silêncio se errar. Também espera a **sessão de canal (Plaid/app)**. |

> Não inventei trabalho fora da fila (regra da rotina). Não fatiei um pedaço pequeno de nenhuma delas — mexeria no coração sem os recibos que validam. E, principalmente hoje, **não empilhei nada novo em cima de um working tree já cheio de trabalho seu não-commitado** (ver abaixo).

---

## ⏸️ Trava real da esteira: agora há **DUAS levas sem commit** empilhadas no working tree

Diferente de ontem, o `git status` de hoje mostra que o tree carrega **duas frentes** de trabalho não-commitado:

**Leva A — cod-0033 (07-24), ainda em "🔧 Em revisão":** comandos `/acompanhar` `/parar` `/acompanhamentos` `/superfluo`.
- `src/insights.js`, `src/formatter.js`, `src/index.js` (parte da cod-0033)
- `test/acompanhamentos-comandos.test.js` (novo, cod-0033)

**Leva B — sessão financeira (07-26), aguardando seu `/entregar`:** firewall → advisory + remoção do Mercado Pago (bate com o CLAUDE.md "Última atualização" de 07-26).
- `scripts/check-firewall.mjs` (firewall vira advisory, sempre exit 0) — **zona sua**
- `src/supabase.js`, `src/index.js`, `src/formatter.js` (remoção do MP)
- Docs novos em `Economizei app/`: `Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`, `Passo_a_Passo_Financeiro_2026-07-26.md`, `Pesquisa_Cupom_por_Recompensa_Modelo_2026-07-26.md`, `Microsoft_Clarity_Landing_Analytics_2026-07-26.md`, `Projeto_Claude_CONTEXTO_2026-07-26.md`, `Roteiro_Teste_Webhook_Auth_2026-07-24.md`

Não-máquina no tree: `AGENDA.md`, `PAINEL.html`, `CODE_GUIDE.md`, `CLAUDE.md`, `RELATORIO_SENTINELA.md`, `.claude/settings.local.json`.

> As duas levas compartilham arquivos (`src/index.js`, `src/formatter.js`) — misturá-las com uma implementação nova minha tornaria sua revisão bem mais difícil de fatiar por hunk. **Enquanto A e B não forem commitadas ou descartadas, a esteira está entupida.** Nada que eu produza deve entrar antes disso.

---

## 🧪 `npm run check`

Não rodei — **não houve mudança minha pra checar** hoje, e o tree está no meio da sessão financeira de 07-26 (não é meu lugar mexer / rodar em cima disso). O gate confiável continua sendo a sua máquina Windows no `/entregar` (regra 11). Estado de teste conhecido da cod-0033 (do histórico): 86/86 nos arquivos sem `sharp`; SIGBUS são ambientais do sandbox Linux.

---

## 🙋 O que precisa de você (em ordem)

1. **Fechar a Leva B (sessão financeira 07-26) via `/entregar`** — é o item mais urgente porque toca `check-firewall.mjs` e `supabase.js`, zona sua. Passos que o próprio plano já lista (`Economizei app/Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`): revisar → `git rm src/mercadopago.js` (o sandbox não teve permissão) → `/entregar` → **depois do deploy**, DROP das colunas/tabela MP no Supabase (ordem código→deploy→banco).
2. **Fechar a Leva A (cod-0033)** — se ainda não entrou junto: revisar → `npm run check` no Windows → commitar (`feat(alerta-pro): comandos /acompanhar /parar /acompanhamentos /superfluo (cod-0033)`) **ou** `git checkout .`. Decisão fina aberta: o `/limite <termo> <valor>` **não** foi feito (colide com o `/limite` atual + pertence à cod-0035) — decidir comando novo (ex. `/teto cerveja 100`) ou juntar à cod-0035.
3. **Destravar a cod-0062:** fornecer os **2–3 comprovantes PIX reais** (print/PDF) pro mini-corpus e rodá-la **com você presente** (firewall acusa "pix" por design → commit consciente). Antes: **verificar o CHECK em `compras.tipo`** (query de 1 min no SQL Editor — se for TEXT livre, `'pix'` já funciona sem migration).
4. **Reabastecer a fila com algo autônomo, se quiser que a rotina matinal volte a produzir** — hoje (3º dia) ela só tem tarefas suas. Candidatos pequenos e sem dependência humana pra subir pra "Fila pronta" (não fiz — priorização é sua):
   - Testes puros de cobertura (ex. `insights.js` / `monthlySummary.js`, sem tocar `sharp`).
   - Refinos de mensagem não-financeira no `formatter.js`.
   - A **limpeza das funções MP órfãs** (linha 290 da AGENDA) virou "tarefa de máquina" no modo advisory — **mas o firewall/ZONA PROIBIDA desta rotina matinal ainda lista pagamento como intocável**, então a rotina automática *não* pega. Se quiser que a máquina faça, é um passo seu: rebaixar a ZONA PROIBIDA da rotina OU deixar pro `/tarefa` manual com você presente.
5. **(Contexto, não urgente)** Auditoria Integral 07-10 ainda com 🔴 abertos: §3.3 (query de schema/RPC no Supabase), §4.2 (copy da indicação), §4.3 (`/assinar` ainda gera checkout MP — a Leva B começa a resolver isso ao aposentar o MP).

---

## 📝 Plano da cod-0062 (pronto pra quando rodarmos juntos)

Pra a sessão presencial não começar do zero, o desenho já definido (`Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`) prevê:

- **`src/gemini.js`** — adicionar campo `tipo_documento` ao schema de saída + ramo PIX no PROMPT (classifica cupom × PIX × outros); no `validarSchema`, quando `tipo_documento='pix'`, aceitar `valor`/`data`/`contraparte` com `itens=[]`. **Rodar o corpus de regressão de cupom antes de subir** (coração intacto).
- **`src/supabase.js`** — `salvarCompra` aceitar `tipo='pix'` (contraparte→`loja`, `itens=[]`); **trocar o guard de `registrarPrecosMercado` pra `=== 'mercado'`** (hoje PIX/qualquer não-mercado poluiria `precos_mercado`). PIX **não** entra em `calcularMedia`.
- **`src/formatter.js`** — `montarConfirmacaoPix` (valor no topo, sem gíria, confirma antes de gravar).
- **`test/`** — mini-corpus PIX (2–3 comprovantes reais seus) + testes de schema/roteamento; corpus de cupom segue verde.
- **Firewall:** vai acusar "pix" por design → commit consciente seu.

---

## 📌 Estado da AGENDA
- **Não alterei a AGENDA.md hoje** (nenhuma tarefa implementada → nada movido). O `AGENDA.md` modificado no tree é a movimentação de 07-24 (cod-0033), ainda não commitada.
- Fila pronta: **cod-0062** (com você) → **cod-0065** (com você) — ambas bloqueadas por recibos reais.
- Em revisão: **cod-0033** (Leva A) + a **sessão financeira 07-26** (Leva B) aguardando seu `/entregar`.
- `origin/main` sincronizado até `1d27d43`; nenhum commit novo desde 07-24.
