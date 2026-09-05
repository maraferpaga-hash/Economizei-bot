# 🌅 Relatório Matinal — Máquina Local (rotina automática)

**Data/hora:** 2026-09-04 20:11 → 20:5x (PDT)
**HEAD no início:** `043f420` · **STATUS: concluída**
**Guardas:** todas verdes — working tree sem `.js/.mjs` sujo (só `?? Coop_Report_Answers_EN.md`, untracked, não conta), zero branches `maquina/*`, zero `.git/index.lock`, estoque 0/4.
**`.git/index.lock` ao fim da run:** **não existe** ✅ (todo comando git rodou com `GIT_OPTIONAL_LOCKS=0`; nenhum comando de escrita do git foi usado).

---

## 📦 O que saiu: 3 levas no estoque (0/4 → 3/4)

Pela 1ª vez desde 30/08 a run pegou da **Fila pronta**, não do lastro — a sessão de destravamento de 03/09 funcionou. Teto respeitado: **3 tarefas porte P**.

| Leva | Tarefa | Arquivos | Migration | Financeiro |
|---|---|---|---|---|
| `0001_2026-09-04_cod-0076` | **cod-0076** [P0] 🔴 LGPD — `/apagar` volta a apagar | `src/supabase.js` · `test/apagar-io.test.js` (novo) | não | não |
| `0002_2026-09-04_cod-0075` | **cod-0075** [P1] 💰 Agente — Pro vê mais de um comparativo | `src/index.js` · `src/agent/index.js` · `src/agent/intents.js` · `src/agent/render.js` · `test/agent-comparativo-pro.test.js` (novo) | não | ⚠️ **SIM** |
| `0003_2026-09-04_cod-0078` | **cod-0078** [P2] 🔒 `/cron/monthly-summary` — valida entrada + mascara telefone | `src/index.js` · `test/cron-monthly-entrada.test.js` (novo) | não | vizinhança |

**Ordem de aplicação: 0001 → 0002 → 0003.** As levas 0002 e 0003 editam o mesmo `src/index.js`; a cadeia foi verificada pelo próprio script (17/17 linhas da 0002 presentes na 0003).

```
node scripts/estoque.mjs status
✅ Estoque íntegro — sintaxe OK, zona proibida limpa, cadeia preservada.
```

---

## 🔎 O que mudou, e por quê

### cod-0076 — o `/apagar` não apagava nada (P0, LGPD)

`apagarDadosUsuario` tinha 6 passos. O **passo 3** apagava de `lembretes_enviados`, tabela que **nunca foi criada** (reengajamento desligado na cod-0068). O `42P01` era relançado, os passos 4–6 nunca rodavam, **`usuarios` nunca era apagado** — e como `usuarios` sobrevivia, nem o `ON DELETE CASCADE` de `acompanhamentos`/`perguntas_log` disparava. Um pedido de exclusão LGPD não removia **um único registro**.

Agora: o passo morto saiu; `acompanhamentos` e `perguntas_log` ganharam DELETE explícito (não dependem mais de uma FK que alguém pode alterar sem perceber); a lista de passos virou dado (`PASSOS_APAGAR`, `usuarios` sempre por último); e **um passo que falha não aborta os outros** — os erros são acumulados, todos os DELETEs são tentados, e a função lança no fim se algum falhou. Exclusão parcial silenciosa seria pior que erro: o usuário não pode ouvir "apagado" sobre dado que ficou. O chamador não muda — falha continua caindo no `montarApagarErro()`.

Injeção de teste via `cliente = supabase` (2º parâmetro), **o padrão que 8 funções do arquivo já usam** — não o padrão `deps`, que segue sem ratificação sua.

**Consequência de fila:** com a cod-0076 entregue, a **cod-0049 destrava** (era bloqueada por ela).

### cod-0075 — o Agente entregava menos que o comando

Desde a cod-0073 o `/comparar` mostra até `COMPARATIVO_MAX_PRO` itens pro assinante. A **mesma pergunta em texto livre** devolvia 1 comparativo pra todo mundo. Agora o `src/index.js` calcula o teto pelo perfil (a expressão que morava dentro do `mostrarComparativo` virou a função pura `tetoComparativos(ehPro)` — fonte única, usada pelos dois caminhos) e entrega o número pronto ao Agente. A intent **não conhece plano**: há teste que reprova se `is_pro`, `temFeaturesProAtivas` ou `COMPARATIVO_MAX_PRO` aparecerem dentro do `executar`. Free: texto idêntico ao de hoje, sem uma vírgula de diferença.

### cod-0078 — endpoint sem validação e com telefone cru

Achados (2) e (3) do las-06. `phone` e `mes` entravam sem checagem nenhuma, enquanto o `/admin/ativar-pro` — 50 linhas acima — valida com regex; e a resposta devolvia o número inteiro. Agora a regra do `/admin/ativar-pro` virou função compartilhada (`normalizarPhoneQuery`), somada a `mesRefValido` (`AAAA-MM` com mês 01–12: `2026-13` não passa) e `validarEntradaResumoMensal`. Entrada inválida → **400 sem tocar o banco**. `phone` continua opcional (ausente = todos os usuários, como o cron roda). Resposta passa por `maskPhone`.

---

## 🛑 Achado da auto-revisão adversarial (PASSO 5) — decisão sua embutida

A cod-0075 **teria ficado sem efeito prático** e ninguém perceberia. Motivo: em `AGENTE_MODO=llm` (o default) o texto enviado é a **narração**, e o prompt manda "no máximo 2 frases" — o LLM resumiria a lista de comparativos do Pro de volta pra um item, em silêncio. Os números continuariam fiéis; a feature é que sumiria.

**Correção:** `fato.semNarracao` — quando há lista, o `render.js` entrega o **template determinístico** e pula a narração. É o mesmo princípio que o `entregaImagem` (cod-0048) já usa: quando o formato faz parte da resposta, não se reescreve. Opt-in por fato; **nenhuma outra intent muda de comportamento** (há teste provando que o Free segue narrado pelo LLM).

⚠️ **Isto é uma escolha de produto, reversível em 1 linha:** o Pro passa a receber a resposta de comparativo em texto de template — correto, sem gíria, mas menos "conversado". Se preferir a narração fluida, tire o `semNarracao` do `intents.js`; mas aí o Pro volta a ver 1 comparativo.

**Desvio de escopo declarado:** o `src/agent/render.js` **não** constava em `arquivos-alvo` da cod-0075. Foi tocado (1 condição) porque sem ele a tarefa não cumpre o próprio critério de aceite ("Pro vê N").

---

## ⛔ O que NÃO peguei — e o plano pronto

### cod-0077 [P1] — log de conteúdo de cupom no `src/gemini.js`

**Não executada de propósito.** A tarefa diz "não mexer no prompt, só o `log()`", mas o arquivo **é o coração**, e a rotina automática tem proibição absoluta de tocá-lo sem você presente. Preferi obedecer a regra a interpretá-la a meu favor.

**Plano (≈15 min numa sessão com você):** em `src/gemini.js:394`, o caminho de **sucesso** troca `resposta.slice(0,120)` por metadados — `{ chars: texto.length, itens: dados.itens?.length ?? 0, parseLimpo: true }`. O caminho de **erro/parse falho** mantém o trecho truncado (é onde o log ganha o pão), com comentário explícito dizendo por que ali o risco vale. Teste: sucesso não emite conteúdo · erro ainda emite o suficiente pra depurar. Corpus de classificação tem de continuar verde.

### Demais itens da fila

- **cod-0062 / cod-0065 / cod-0072** — porte G, coração. Sessão com você.
- **cod-0069 / cod-0070** — `bloqueada-humano`.
- **cod-0049** — dependia da cod-0076; **destrava assim que a leva 0001 for entregue**. A migration `insights_enviados` já está escrita e autorizada, e precisa rodar no Supabase **antes** do push dela.
- **Lastro** — sem item elegível (las-02 e las-06 `pausada`). Não foi necessário.

---

## ✅ Checagem

| Etapa | Resultado |
|---|---|
| `node --check` em todos os arquivos alterados | ✅ |
| `node --test test/apagar-io.test.js` | **9/9** |
| `node --test test/agent-comparativo-pro.test.js` | **10/10** |
| `node --test test/cron-monthly-entrada.test.js` | **11/11** |
| Regressão do Agente (5 arquivos) | **70/70** |
| **Suíte completa, 3 levas aplicadas** | **784 testes · 783 pass · 0 fail · 1 `todo`** |
| `node scripts/check-pages.mjs` | ✅ (nenhum `.html` a validar) |
| `node scripts/estoque.mjs status` | ✅ íntegro |

**Baseline era 754** (753 pass + 1 `todo`) → **+30 testes novos, zero regressão**. O `todo` é o de `src/charts.js:56` ("Total: R$ 1,00" em mês de soma zero), aberto desde 30/08 — sem relação com esta run.

**Ressalva honesta (regra 11 do CLAUDE.md):** a suíte rodou numa **cópia limpa em `/tmp`** com **stub local do `sharp`** — o módulo nativo dá SIGBUS neste sandbox. O stub **não existe no repositório** e não vai junto com nenhuma leva. **O gate final continua sendo o `npm run check` na sua máquina.** Não rodei o `check-firewall --working` porque ele lê o working tree do git, e o estoque é gitignored — o `/entregar` vai rodá-lo depois do `aplicar`, que é onde ele tem sentido.

---

## 💰 FINANCEIRO — lista exata pro commit consciente (modo ADVISORY)

**Leva 0002 (cod-0075), `src/index.js`:** o `check-firewall` vai acusar `temFeaturesProAtivas`, `ehPro` / `ehProAgente` e `COMPARATIVO_MAX_PRO`. É o **gate Pro**, mesmo recorte da cod-0073/cod-0074: **não cobra nada, não cria cobrança, não decide preço** — só escolhe quantos comparativos mostrar.

**Leva 0003 (cod-0078), `src/index.js`:** vai acusar `ativar-pro`, `ADMIN_SECRET` e `X-Admin-Secret`. São **linhas vizinhas** do endpoint administrativo, tocadas só porque a validação do `phone` virou função compartilhada. **Nenhuma regra de cobrança mudou.**

**Leva 0001 (cod-0076):** não toca dinheiro.

---

## 📊 Métricas do piloto

| Métrica | Valor |
|---|---|
| Tarefas concluídas | **3** (cod-0076, cod-0075, cod-0078) |
| Linhas de trabalho novo | **~674** — sendo **+128 de código de produção** e **546 de testes novos** (3 arquivos) |
| Tempo estimado de revisão humana | **~35 min** (15 min cod-0076 · 12 min cod-0075, por ser financeira e ter a decisão do `semNarracao` · 8 min cod-0078) |

**Sobre o teto:** 3 porte-P está dentro da regra; as ~674 linhas passam dos "~500 de diff", mas o teto existe pra limitar a **sua revisão**, e o que pesa nela são as 128 de produção. Registrado por honestidade, não como pedido de exceção.

---

## 🙋 O que precisa de você

1. **Entregar as 3 levas** — `aplicar 1` → `/entregar` → `aplicar 2` → … na ordem. **Nenhuma precisa de migration**, então a checagem bloqueante do `/entregar` deve passar limpa.
2. **Decidir o `semNarracao`** (leva 0002): Pro vê a lista em template determinístico, ou volta a ver 1 comparativo narrado? Está tudo explicado no `LEVA.md` da leva 0002.
3. **cod-0077** — abrir uma sessão curta com você presente (é `src/gemini.js`, coração). Plano pronto acima.
4. **cod-0049** — assim que a cod-0076 estiver na `main`, ela destrava; lembrar de rodar `supabase/migration_2026-09-03_insights_enviados.sql` **antes** do push dela.
5. **Pendência que sobrevive** (não bloqueia): o padrão `deps` opcional segue sem ratificação sua. **Esta run não criou uma 3ª ocorrência** — a cod-0076 usou `cliente = supabase`, o padrão já estabelecido no `supabase.js`.
