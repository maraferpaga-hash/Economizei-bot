# 🗺️ Mapa de Processo — Máquina Local do Economizei

> Como o trabalho flui e **como a máquina se comporta** em cada situação. Vale
> para os dois gatilhos: você rodando `/tarefa` na mão, e a **rotina automática
> das 10h (Vancouver)**.

**Atualizado:** 2026-06-24

---

## 1. Quem faz o quê (atores)

| Ator | Papel |
|---|---|
| **Opus 4.8 (você + eu, no chat)** | Planeja. Decide a próxima etapa e escreve a tarefa na `AGENDA.md`. |
| **Claude executor** (Claude Code local OU a rotina das 10h no Cowork) | Implementa UMA tarefa com teste. Nunca decide produto/preço. **Não commita.** |
| **Gabriel** | Revisa o diff, roda `npm run check`, e **commita + push**. Único que mexe em dinheiro. |
| **Guarda-rails** (`check-firewall.mjs` + testes) | Barram mudança financeira e quebra de código antes do commit. |

---

## 2. Os dois gatilhos (quando a máquina age)

**A) Manual — `/tarefa`** (quando você quiser, na pasta, no Claude Code).
Você está presente, vê acontecer, revisa e commita na hora. Custo só quando você decide rodar.

**B) Automático — rotina das 10h (Vancouver).**
Todo dia às ~10h (com o app do Cowork aberto), a rotina pega UMA tarefa pronta, adianta o trabalho **sem commitar**, e escreve um `RELATORIO_MATINAL.md`. Você chega, lê o relatório, revisa e commita. Faz **no máximo 1 tarefa por execução** (trava de custo).

> Os dois fazem o mesmo fluxo abaixo. A diferença é só quem aperta o play.

---

## 3. O ciclo de uma tarefa (estados)

```
   (backlog)
      │  você + Opus priorizam
      ▼
  status: pronta ──► [Claude executa] ──► status: em-revisao ──► [Gabriel revisa]
      │                                                              │
      │                                              ┌───────────────┴───────────┐
      │                                              ▼                           ▼
      │                                        commit + push                  descarta
      │                                       status: concluida            (git checkout .)
      │                                                                     volta p/ pronta
      ▼
  (se exige dinheiro/decisão) ──► status: bloqueada-humano ──► só você resolve
```

Estados na `AGENDA.md`: `pronta` · `em-revisao` · `bloqueada-humano` · `pausada` · `concluida`.

---

## 4. Como a máquina se comporta (árvore de decisão de cada run)

1. **Lê a `AGENDA.md`** → pega a 1ª tarefa `pronta` da "🌙 Fila pronta".
   - **Não há tarefa pronta?** → não faz nada (custo mínimo). Na rotina das 10h, anota "nenhuma" no relatório.
2. **Avalia o tamanho:**
   - **Pequena e clara** (uma função + teste, refino, bugfix) → **implementa**.
   - **Grande / ambígua / decisão de produto** → **não implementa**; escreve um **plano** e o que precisa de você. Para.
3. **Implementou?** → roda `npm run check` (firewall + testes + páginas). Corrige até ficar verde.
4. **Bateu na zona proibida (financeiro)?** → o firewall reprova. A máquina **reverte** essa parte ou marca a tarefa como `bloqueada-humano`. Nunca insiste.
5. **Move a tarefa** para "🔧 Em revisão" (status `em-revisao` + data).
6. **Para. Não commita.** (Na rotina das 10h, ainda escreve o `RELATORIO_MATINAL.md`.)

---

## 5. Guarda-rails (o que protege)

- **Uma tarefa por run** → custo previsível e PR/diff pequeno de revisar.
- **Nunca commita** → nada entra no repositório sem você. `git checkout .` descarta tudo.
- **Firewall financeiro** (`npm run check:firewall`, modo `--working`) → bloqueia qualquer mudança em pagamento/cobrança (lista no topo da `AGENDA.md`). Só escaneia arquivos de código, então docs que citam "is_pro/assinatura" não dão falso-alarme.
- **Testes** (`npm test`) → lógica nova só "fica pronta" com teste (TDD).
- **Zona proibida de caminho** → `src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, etc. nunca são tocados.

---

## 6. A sua rotina (Gabriel), de manhã

1. Abrir o **`RELATORIO_MATINAL.md`** (a rotina das 10h escreveu).
2. Ver o **diff** (`git diff`) do que a máquina mudou.
3. Rodar **`npm run check`** (confirma firewall + testes verdes).
4. Gostou? **commit + push**. Não gostou? **`git checkout .`** descarta e ajusta a tarefa comigo.
5. Repriorizar a "🌙 Fila pronta" pra próxima.

---

## 7. Custo & limite de uso (honestidade)

- A rotina das 10h **consome a sua cota** do Claude (mesmo pool do seu uso interativo). Por isso ela faz **só 1 tarefa pequena por dia** — é a trava de custo possível.
- **Não dá** pra a máquina "parar em X% do limite": o agente não enxerga a sua porcentagem de uso pra se autocortar (ver explicação no chat/`CLAUDE.md`). O controle real é **bounding**: 1 tarefa, escopo pequeno, e você decide quando rodar o `/tarefa` manual.
- Se um dia quiser teto financeiro de verdade, o caminho é **billing de API** (com limite de gasto no console) em vez da assinatura — mas aí volta a ter custo por run.
