# ☀️ Relatório Matinal — Máquina Local do Economizei

**Data:** 2026-06-30 (terça-feira)
**Execução:** rotina automática (Cowork Scheduled) · **sem commit** — você revisa e commita.

---

## 📌 Tarefa pega hoje

**cod-0012 · Agente 3/8 — registro das 3 intenções + templates**
(primeira tarefa com `status: pronta` na "🌙 Fila pronta" — a nota do "Alerta Inteligente Pro" no topo da fila não é tarefa, é contexto; cod-0026/0027/0030 já estavam em "Em revisão" desde a rotina de ontem)

- **Tipo:** feature-codigo (lógica pura + testes, nenhum arquivo financeiro)
- **Tamanho:** pequena e bem-definida → **implementada** seguindo o protocolo (TDD, lógica pura separada de I/O).
- **Skills usadas:** `economizei-tdd`, `economizei-financial-firewall` (+ transversais default: code-decisions, product-principles). As skills designadas `economizei-copywriter`/`copy-review` não entraram de fato — os templates só remontam números já formatados pelo `brl()`, não há copy nova de tom/voz pra revisar (anotado na AGENDA).
- **Referência de desenho:** `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md` §3 (Registro de Intenções).

---

## 🛠️ O que mudou (2 arquivos novos + 1 linha em arquivo existente)

**`src/agent/intents.js`** (novo) — registro declarativo das 3 intenções do MVP (Desenho §3):

1. **`gasto_total_mes`** — "quanto gastei esse mês?" — soma `buscarGastosPorCategoria` (supabase.js, mesma fonte do `/gastos`).
2. **`gasto_por_categoria`** — "quanto gastei em carne?" — mesma busca, filtra pela categoria pedida. Vocabulário fechado (`CATEGORIAS_VALIDAS`) espelhado do `gemini.js` — duplicado de propósito pra não puxar `gemini.js`/`sharp` (mesmo problema de SIGBUS já documentado em cod-0026/0027/0030).
3. **`comparar_meses`** — "tô gastando mais que mês passado?" — reusa `buscarTotaisMensais` + `calcularEconomia` (insights.js, já testada). Honestidade: o template fala "média dos meses anteriores" (até 3 meses), nunca afirma "mês passado" especificamente — é isso que `calcularEconomia` de fato calcula, e dizer "mês passado" seria impreciso quando há 2+ meses na janela.

Cada intenção exporta `{id, descricao, exemplos, parametros, executar(phone,params,deps)→fato, template(fato)→string}`. `REGISTRO` (array das 3) já está pronto pra ser injetado no `guards.validarClassificacao` (cod-0011) e no classificador (cod-0013, próxima da cadeia).

Todo número do fato sai cru **e** pré-formatado em `fmt.*` via `brl()` do `formatter.js` — fonte única de formatação, pré-requisito pro firewall de fidelidade numérica que a cod-0014 vai usar (o Desenho avisa: template e allowlist precisam gerar a mesma string).

`executar(phone, params, deps)` aceita um `deps` opcional pra injetar as funções de leitura (é assim que os testes usam dados sintéticos, sem tocar o Supabase real) e faz **lazy require** do `supabase.js` — só resolve o `createClient` quando chamado de verdade sem `deps`, então importar o módulo nunca quebra em ambiente sem as envs do Supabase configuradas (como este sandbox).

**`src/formatter.js`** — **1 linha fora do escopo original da tarefa:** adicionei `brl` ao `module.exports` (a função já existia, só não estava exportada). Foi necessário pra cumprir o próprio critério de aceite da tarefa ("números do fato formatados com o `brl()` do formatter.js — fonte única") — sem isso, `intents.js` teria que duplicar a lógica de formatação monetária, o que o Desenho Técnico avisa que quebra a checagem de fidelidade numérica mais adiante. Mudança mecânica (1 export), nenhum texto/copy tocado.

**`test/agent-intents.test.js`** (novo) — **20 testes**: fato com/sem dados nas 3 intenções (categoria pedida ausente no mês, mês sem nenhuma compra, só 1 mês de histórico — sem anterior pra comparar), templates determinísticos (abaixo da média / acima da média / parecido, formatação R$ com vírgula brasileira), sanidade de `CATEGORIAS_VALIDAS`/`rotuloCategoria`, e **integração com `guards.validarClassificacao`** (cod-0011) confirmando que o `REGISTRO` real é aceito/rejeitado corretamente (parâmetro desconhecido, enum inválido, intent desconhecida, opcional ausente aceito).

**AGENDA.md** — cod-0012 movido de "🌙 Fila pronta" para "🔧 Em revisão" (`status: em-revisao`, `data-revisao: 2026-06-30`), com a nota completa de verificação. Cabeçalho atualizado: 6 tarefas prontas no working tree desde o último checkpoint (cod-0026/0027/0030/0006/0011/0012) — confirma que já passou o gatilho de volume (5+) pro próximo checkpoint Nível 2.

---

## ✅ Resultado da verificação

| Etapa | Resultado |
|---|---|
| Firewall financeiro (`--working`) | ✓ OK — nenhuma mudança financeira/proibida (23 arquivos no working tree) |
| check-pages | ✓ OK — 5 páginas, 0 erros |
| `node --check` (sintaxe) dos arquivos tocados | ✓ OK |
| `node --test test/agent-intents.test.js` | ✓ **20/20** verdes — rodado numa **cópia limpa em `/tmp`** (ver ressalva abaixo) |
| Suíte completa (`node --test "test/**/*.test.js"` direto no repo) | **não fechou** neste sandbox — ver ressalva |

⚠️ **Ressalva ambiental (não é bug do meu código):** o mount Linux deste sandbox voltou a servir `src/formatter.js` **cortado perto do fim do arquivo** (`node --check` nele dá `SyntaxError: Unexpected end of input` — falta literalmente o `};` final). Confirmei por leitura direta do arquivo que o arquivo real está íntegro e termina corretamente (foi assim que apliquei o export do `brl` com segurança). É o mesmo tipo de problema já registrado várias vezes no histórico do projeto ("mount serviu `.js` stale/truncado"), só que desta vez na ponta do arquivo, não no meio.

Por causa disso, rodar a suíte completa direto no sandbox falha em **3 arquivos** que requerem `formatter.js`: `test/agent-intents.test.js` (o meu, novo), `test/apagar.test.js` (já existia no repo, de uma sessão anterior) e os 2 já conhecidos por causa do `sharp`/SIGBUS (`test/gemini-canonico.test.js`, `test/classificacao-corpus.test.js`). **Não toquei em nada relacionado a `apagar.js`/`sharp` nesta tarefa** — são falhas pré-existentes do ambiente, não regressão.

Pra confirmar que o código novo está correto de verdade, reconstruí uma cópia limpa em `/tmp` com o conteúdo **já verificado correto** de `formatter.js`, `insights.js`, `agent/periodo.js`, `agent/guards.js` e `agent/intents.js`, e rodei os testes lá: **20/20 verdes**, incluindo a integração com o `guards.js` da cod-0011.

**Na sua máquina (Windows, arquivo `formatter.js` íntegro), `npm run check` deve fechar verde.** Recomendo rodar `node --check src/formatter.js` primeiro como confirmação rápida, depois `npm run check` completo como gate final antes de commitar.

---

## 🙋 O que precisa de você (Gabriel)

1. **Revisar o diff:** `src/agent/intents.js` e `test/agent-intents.test.js` (ambos novos) + `src/formatter.js` (1 linha — export de `brl`) + o bloco movido na `AGENDA.md`.
2. **Rodar `npm run check`** na sua máquina (deve fechar verde, sem os problemas de mount/sharp do sandbox).
3. **Commitar** se estiver bom (a automação não commita nem dá push). Se não, `git checkout src/agent/intents.js src/formatter.js` (e apagar o teste novo) descarta só esta tarefa.
4. **Lembrete da sua sequência confirmada (2026-06-27):** fechar a promessa do pago (comparativo cod-0020, depois o alerta Pro cod-0030..0036) tem prioridade sobre a cadeia do Agente (cod-0012→0017). Como cod-0012 já estava pronta na fila e era a próxima elegível, a rotina a pegou — mas se você quiser reforçar a ordem, vale subir o cod-0020 (ou puxar a cadeia Pro pra cima) antes da próxima execução automática.
5. **Working tree acumulado:** já são 6 rodadas prontas pra commit (cod-0026/0027/0030/0006/0011/0012). Talvez valha revisar e commitar em lote antes de deixar a automação adiantar mais — ver `Economizei app/Revisao_e_Commit_Maquina_2026-06-30.md` (cobre as 5 anteriores; esta é a 6ª).

Sem migration, sem dependência nova, sem nada financeiro nesta tarefa.
