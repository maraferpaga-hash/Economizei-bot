# 🌅 Relatório Matinal — Máquina Local (variante SANDBOX · regime ESTOQUE)

**Data:** 2026-08-21 · **HEAD:** `b9013fb` · **STATUS: concluída**
**Working tree:** limpo de `.js`/`.mjs` de leva — a produção foi toda pro `estoque/` (gitignored).
**`.git/index.lock`:** ✅ não existe (nenhum ficou pra trás; todo git desta run foi de leitura, com `GIT_OPTIONAL_LOCKS=0`).

---

## 🎯 O mais importante desta run

**Uma tarefa da fila (cod-0075) foi verificada e NÃO implementada: a premissa dela é falsa.**
A AGENDA dizia que o gate Pro "vaza pela porta do lado" no Agente. Fui no código: **não vaza.**
A intent do Agente narra **um** comparativo só (o de maior diferença), igual pra Free e pra Pro — o
teto que a tarefa mandava aumentar governa `mostrados`/`temMais`, e **nenhum dos dois é lido no
caminho do Agente**. Implementar como está escrito seria fiação morta com aparência de correção de
segurança. Ficha completa e os 2 caminhos de decisão estão na AGENDA (cod-0075, `aguardando-decisao`).

---

## 📋 Guardas (passo 1)

| Guarda | Resultado |
|---|---|
| (a) esteira entupida | ⚠️ **disparou na letra, não no espírito — segui, com justificativa** (abaixo) |
| (b) pilha cheia | ✅ 0 branches `maquina/*`; estoque em 1/4 no início |
| (c) repo travado | ✅ sem `index.lock` |

**Sobre a guarda (a).** O `git status` mostra um `.mjs` novo: `scripts/estoque.mjs`. Ele **não é
leva anterior** — é a ferramenta do regime ESTOQUE, instalada na sua sessão de 18/08, e está
untracked porque o **PASSO 6** da adoção (commitar) ainda não foi feito. A bancada que a guarda
protege (`src/`, `test/`) está limpa: a leva 0001 de ontem foi pro `estoque/`, exatamente como
o Plano B previa. Parar a run aqui seria obedecer o texto contra o propósito da regra.

---

## ✅ Tarefas pegas (2 de 3 possíveis pelo teto)

| # | Leva | Tarefa | Porte | Financeiro | Migration |
|---|---|---|---|---|---|
| 1 | `estoque/0002_2026-08-21_cod-0062b/` | **cod-0062b** — PIX: guard do `precos_mercado` + copy | P | ⚠️ por token | não |
| 2 | `estoque/0003_2026-08-21_cod-0065b/` | **cod-0065b** — `fmtMoeda(valor, moeda)` | P | não | não |

**Por que 2 e não 3:** o teto por run permite 3 porte-P, mas o teto do **estoque é 4 levas** e a
0001 já ocupa uma. Com 3 novas eu fecharia 4/4 e a run de amanhã pararia por estoque cheio. Ficou
**3/4**, com um slot de folga. A terceira P da fila (cod-0072a, parser de parcela) fica pra amanhã.

### MAPA TAREFA → ARQUIVOS

**Leva 0002 · cod-0062b** (base: leva 0001)

| Arquivo | O quê | Δ |
|---|---|---|
| `src/supabase.js` | `entraEmPrecosMercado()` (pura) + export; guard em `salvarCompra` | +17 |
| `src/formatter.js` | `_valorPix`, `montarConfirmacaoPix`, `montarConfirmacaoPixEntrada`, `montarPixValorIlegivel` + 3 exports | +76 |
| `test/pix-comprovante-copy.test.js` | **novo** — 15 testes | 180 |

**Leva 0003 · cod-0065b** (base: leva 0002)

| Arquivo | O quê | Δ |
|---|---|---|
| `src/formatter.js` | `MOEDAS`, `_agrupar`, `fmtMoeda` + export | +53 |
| `test/fmt-moeda.test.js` | **novo** — 12 testes | 110 |

> ⚠️ As três levas tocam `src/formatter.js`. Como cada leva guarda o **arquivo inteiro**, a ordem
> de aplicação não é opcional: **0001 → 0002 → 0003**. O `estoque.mjs` recusa fora de ordem.

---

## 🔧 O que mudou e por quê

### cod-0062b — o guard da base de preços virou lista branca

O guard dizia quem **não** entra (`tipo !== 'outros'`). Quem manda quem entra é sempre a lista
branca: todo tipo novo — e o `tipo='pix'` da cod-0062 é o primeiro — entrava por omissão. Um
comprovante de PIX não tem item nem preço unitário de produto; ele poluiria o comparativo entre
mercados com valores que não são preço de nada. Virou `entraEmPrecosMercado(tipo)`, função pura que
lê `TIPOS_MERCADO` (sem segunda fonte de verdade, travado por teste).
**Comportamento hoje é idêntico:** verifiquei que `gemini.js:262` normaliza `tipo` para exatamente
`'mercado'` ou `'outros'` antes de chegar aqui — não existe caminho em que chegue nulo ou
desconhecido. A mudança vale pra amanhã, não pra hoje.

Junto vieram as três mensagens do comprovante: PIX enviado (gasto), PIX recebido (**diz que não
somou nos gastos**) e a recusa honesta quando o valor não é legível. O total do mês na confirmação
é **opcional de propósito** — enquanto o PIX não entrar nas agregações (cod-0062), imprimir "no mês"
daria um número que não bate com o `/gastos`.

### cod-0065b — `fmtMoeda`, com duas travas que valem mais que a função

BRL **delega** pro `brl()` atual, então é byte a byte igual por construção (inclusive no caso feio,
`R$ -5,00`); adotar o helper numa mensagem pt-BR não muda um caractere. E moeda desconhecida devolve
`null` em vez de chutar o símbolo: exibir "R$" num valor em CAD é mentir sobre dinheiro. CAD é
formatado à mão, sem `toLocaleString` — não quero depender do ICU do runtime, que pode diferir entre
este ambiente e o Railway.

### O que a auto-revisão adversarial (passo 5) pegou

Dois bugs meus, os dois da mesma família — **valor ausente virando zero**:

1. `Number.isFinite(Number(x))` **aceita** `null`, `''` e `false` (viram `0`). O comprovante sem
   valor legível apareceria como **"R$ 0,00"** — exatamente o número chutado que a recusa honesta
   existe pra evitar. Virou `_valorPix`, estrito.
2. `Number([])` também é `0`: `fmtMoeda([])` devolvia `R$ 0,00`. Agora só número ou string numérica.

Também confirmei que a leva 0003 **só adiciona** linhas sobre a 0002 (nenhuma remoção), e que
`src/supabase.js` é idêntico entre as duas — a cadeia está consistente.

---

## 🧪 Checagem

| Estado | Testes |
|---|---|
| base (leva 0001) + **0002** | **592/592 verdes** (15 novos) |
| base + 0002 + **0003** | **604/604 verdes** (12 novos) |

- `node --check` verde em todos os arquivos das duas levas; `node scripts/estoque.mjs status` →
  *"✅ Estoque íntegro — nenhuma sintaxe quebrada, nenhuma zona proibida."*
- **Ressalva honesta (regra 11):** rodado numa cópia limpa em `/tmp` com **stub local do `sharp`**
  (sem o stub, 9 arquivos morrem com SIGBUS — limitação do sandbox, não do código). O stub **não**
  está em nenhuma leva. **O gate final é o `npm run check` na sua máquina.**
- `npm run check` completo (firewall + check-pages) não roda aqui: o firewall compara contra o
  `git diff`, e esta run não escreve no git. O que ele vai acusar está listado abaixo.

---

## 📊 Métricas do piloto

| Métrica | Valor |
|---|---|
| Tarefas concluídas | **2** (+1 verificada e devolvida pra decisão) |
| Linhas produzidas | **437** (274 na leva 0002 · 163 na leva 0003) — nenhuma no working tree |
| Revisão humana estimada | **~20 min** (≈12 min a 0062b, por ser copy + financeiro por token; ≈8 min a 0065b) |

---

## 💰 O que é FINANCEIRO (para commit consciente)

**Só na leva 0002, e só por token** — o firewall vai acusar a palavra "PIX" em:

1. `src/formatter.js` — as 3 funções novas e seus comentários.
2. `src/supabase.js` — o comentário do guard.
3. `test/pix-comprovante-copy.test.js` — nome do arquivo e corpo.

Nenhuma linha cria cobrança, decide preço ou lê/escreve `is_pro`. Atenção a um detalhe de nome:
`montarMensagemPix` (pagar a assinatura) e `montarConfirmacaoPix` (comprovante que o usuário
mandou) são coisas **diferentes** e continuam separadas.

**LGPD:** as funções novas recebem só contraparte, valor e data. CPF, chave PIX, agência e conta não
têm campo — e há teste que reprova vazamento se alguém passar esses dados no objeto.

---

## 🙋 O que precisa de você

1. **Decidir a cod-0075** — (a) fechar como resolvida-por-inspeção (custo zero, o B10 já foi fechado
   pela cod-0073) ou (b) fazer o Agente listar mais de um comparativo pro Pro, que é **decisão de
   produto/UX**, não de código. Detalhe na AGENDA.
2. **Entregar o estoque** — 3 levas, ~7.900 linhas de snapshot, **3/4 do teto**. Na quarta a máquina
   para de produzir. Ordem obrigatória: `aplicar 1` → `/entregar` → `aplicar 2` → ... Se algo der
   vermelho depois de aplicar, `git reset --hard origin/main` desfaz tudo sem perder nada.
3. **Fechar a adoção do regime ESTOQUE (PASSOS 4-6 do passo-a-passo de 18/08)** — o
   `scripts/estoque.mjs` está **untracked há 3 dias**: a ferramenta de que a esteira agora depende
   não está versionada. Se essa cópia sumir, as levas viram pastas órfãs sem aplicador. Junto vão os
   dois `.md` untracked e a troca dos 2 comandos em `.claude/commands/` (só você consegue escrever lá).
4. **Ratificar 2 desvios conscientes da cod-0062b:** o guard virou função (`entraEmPrecosMercado`)
   em vez do literal `tipo === 'mercado'`; e nasceu uma **terceira** mensagem
   (`montarPixValorIlegivel`) que o critério não pedia — sem ela o valor ilegível virava "R$ 0,00".
5. **Saber que a cod-0065b é recusável** — o helper não tem chamador (é o que o critério pede, mas
   é peça inerte até a cod-0065). Está isolada na leva 0003; recusar não deixa nada quebrado.

---

## 📝 Nota de processo (pro `CRITICA_LOG`)

A cod-0075 é o **detector D4** (premissa não validada) batendo em cima de uma tarefa que passou por
duas sessões humanas sendo tratada como pendência 🔴 — o CLAUDE.md de 20/08 registra *"sem ela o Pro
segue destravado ao perguntar em texto livre"*. A premissa nasceu por analogia com a cod-0073
(`/comparar`), sem ninguém abrir `intents.js` pra ver se o teto era lido. É o mesmo padrão da
**regra 14**: verificar estado, não herdar diagnóstico. Desta vez o custo foi baixo — 20 minutos de
leitura em vez de uma entrega que fecharia um vazamento inexistente e faria a memória registrar
segurança que não mudou.
