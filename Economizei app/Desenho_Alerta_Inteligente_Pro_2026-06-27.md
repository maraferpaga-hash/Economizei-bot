# 🎯 Desenho Técnico — Alerta Inteligente Pro (Supérfluo + Acompanhamento Personalizável)

> **Criado em:** 2026-06-27
> **Origem:** pedido do Gabriel — evoluir o "alerta inteligente", **principalmente para o plano Pro**, com (a) **alerta de gasto supérfluo** (quanto a pessoa gasta em supérfluos, com categorias configuráveis) e (b) **acompanhamento personalizável** (a pessoa escolhe o que quer ver: uma categoria, "um tipo específico de cerveja", "qualquer coisa"), o bot buscando **pelo nome do item**.
> **Decisões de escopo (perguntas de clarificação):** desenho + tarefas na AGENDA (sem código de produto nesta sessão) · configurar por **comando + linguagem natural** · alvo = **categoria + palavra-chave livre**.
> **Lente:** `Posicionamento_Norte_Estrategico_2026-06-09.md` (Camadas 2→3) + `Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md` (F3, F6) + `economizei-financial-firewall`.
> **Pré-leitura técnica:** `CODE_GUIDE.md` seção 0 — **"Classificação é invariante crítico"**. Este desenho **depende** dela.

---

## ⚡ Resumo executivo

🎯 **Objetivo:** transformar o alerta de hoje (um número total: "5% acima da sua média") em **inteligência acionável e personalizável** — a pessoa passa a saber *quanto gasta no que escolheu vigiar* (uma categoria supérflua, um tipo de cerveja, ração, chocolate, "qualquer coisa") e a ser avisada quando estoura um limite que ela mesma definiu. É o conteúdo que dá corpo à promessa do **Pro** (que hoje, fora "cupons ilimitados", entrega pouco).

**Dois pilares:**

- **Pilar A — Alerta de gasto supérfluo.** O bot diz **quanto** foi pra supérfluo no mês, **quanto pesa** (% da compra) e se está acima do normal da pessoa. As categorias que contam como supérfluo têm um **baseline** (`doces` + `bebidas`) e são **configuráveis**.
- **Pilar B — Acompanhamento personalizável.** A pessoa cria "vigias" sobre **uma categoria** ou **uma palavra-chave livre** (ex.: `cerveja`, `heineken`, `chocolate`, `ração`). O bot soma o gasto naquilo **buscando pelo nome do item** e — opcional — **avisa quando passa de um limite** (`/limite cerveja 100`).

**O gargalo é a classificação, não o alerta.** Buscar "cerveja" só funciona se o `nome_canonico` do item contiver "cerveja" (e não só "skol"). Por isso este desenho vem **casado** com um plano de endurecimento da classificação (seção 11) — e por isso a classificação foi declarada o **coração do produto** (CLAUDE.md / CODE_GUIDE §0).

**O que é da máquina × o que é humano:** a máquina entrega **leitura + lógica pura + comandos + copy** (não-financeiro). São **humanos** (zona do firewall): a **migration** da tabela `acompanhamentos`, ligar o **gate Pro** (`temFeaturesProAtivas`/`is_pro`) e a **decisão de pricing Free×Pro**.

**Teste de Norte:** ✅ passa com folga — sobe da Camada 2 (entender) pra 3 (agir), a IA faz o peso, zero atrito extra na configuração (comando curto + linguagem natural), e a honestidade está protegida (números vêm do dado real; matching com guarda contra falso-positivo).

---

## 1. O que existe hoje (baseline a não quebrar)

| Peça | Arquivo | Estado |
|---|---|---|
| Alerta de 3 níveis (abaixo/normal/acima) sobre o **total** da compra vs. média 90d | `alerts.js` (`avaliarCompra`, `deveEnviarMensagem`) | ✅ funciona, vai pra **todos** (Free). Limiares/modo por env (`ALERTA_*`). |
| Conceito de **supérfluo** (`CATEGORIAS_SUPERFLUAS = ['doces','bebidas']`) | `insights.js` | ✅ já usado por F2 (`/gastos`) e F3 (`/cortar`). |
| `/cortar` — "onde cortar sem doer" (1–2 categorias supérfluas com peso) | `insights.js` `analisarOndeCortar` + `formatter.js` | ✅ Free. É o embrião do Pilar A. |
| Gasto por categoria | `supabase.js` `buscarGastosPorCategoria` (agrega por `preco_total`) | ✅ |
| Classificação por item: `categoria` (10 valores) + `nome_canonico` | `gemini.js` | ✅ existe — **mas é exatamente o que precisa endurecer** (seção 11). |

> **Princípio:** o alerta de 3 níveis **continua Free e intocado**. O que estamos construindo é a **camada Pro por cima** (supérfluo + acompanhamento), não uma substituição.

---

## 2. Pilar A — Alerta de gasto supérfluo (Pro)

**O quê:** ao processar um cupom e no resumo mensal, o bot informa o **gasto supérfluo acumulado no mês** — valor, % do total, e comparação com o normal da pessoa.

**Como decide o que é supérfluo:**
- **Baseline:** `doces` + `bebidas` (já no código).
- **Configurável (Pro):** a pessoa adiciona/remove categorias com `/superfluo bebidas on|off` (ou marca um acompanhamento como supérfluo — ver Pilar B). A config vive por usuário (ver modelo de dados).
- **Honestidade:** "supérfluo" é uma escolha da pessoa, não um julgamento do bot. A copy nunca moraliza ("você gastou demais"); ela informa ("supérfluos somaram R$ X — Y% do mês").

**Lógica pura (nova em `insights.js`):**
```
buscarGastoSuperfluo(gastosPorCategoria, categoriasSuperfluas) →
  { totalSuperfluo, pctDoMes, porCategoria: [{categoria, valor, pct}] }
```
Reusa o array que o `/gastos` já produz. Sem I/O novo, sem migration pra parte de categorias (lê `usuarios` se a config viver lá).

**Exemplo de mensagem (ilustrativa, copy curta, número no topo):**
> 🍫 *Supérfluos: R$ 138 este mês* (18% da sua compra).
> Doces R$ 86 · Bebidas R$ 52. Acima do seu normal (12%). Pra ver onde aliviar, manda */cortar*.

---

## 3. Pilar B — Acompanhamento personalizável (Pro) — o pedido central

**O quê:** a pessoa escolhe **o que** quer acompanhar. Dois tipos de alvo:

1. **Categoria** — uma das 10 categorias (ex.: `doces`, `bebidas`, `limpeza`).
2. **Palavra-chave livre** — qualquer termo que apareça no nome do item: `cerveja`, `heineken`, `chocolate`, `ração`, `refrigerante`, `café`. Cobre o "um tipo específico de cerveja" e o "qualquer coisa" do pedido.

Para cada acompanhamento, o bot:
- **soma o gasto do mês** naquele alvo (buscando pelo nome do item),
- mostra sob demanda (`/acompanhamentos`) e no **resumo mensal**,
- **opcionalmente** dispara **alerta quando o gasto do mês passa de um limite** que a pessoa definiu (`/limite cerveja 100`).

**Por que "buscar pelo nome do item" é o ponto delicado:** veja seção 6 (engine de matching) e 11 (classificação). Em resumo: o matching de palavra-chave casa o termo contra o `nome_canonico`; se o canônico for pobre, a busca falha silenciosamente (recall baixo). Daí o endurecimento da classificação ser parte deste desenho, não um extra.

**Exemplos de mensagem:**
> 🔎 *Acompanhamentos (junho)*
> 🍺 cerveja — *R$ 118* (limite R$ 100 ⚠️ passou)
> 🐶 ração — *R$ 94*
> 🍫 chocolate — *R$ 41*

> ⚠️ *Cerveja passou do seu limite.* Você definiu R$ 100 e já são *R$ 118* este mês (5 compras). Pra ajustar, manda */limite cerveja 130* — ou */parar cerveja* pra não te avisar mais.

---

## 4. Como a pessoa configura (comando + linguagem natural)

### 4.1. Comandos (previsíveis, fáceis de testar)
| Comando | Faz |
|---|---|
| `/acompanhar <termo\|categoria>` | Cria um acompanhamento. Ex.: `/acompanhar cerveja`, `/acompanhar doces`. |
| `/limite <termo> <valor>` | Define limite mensal em R$ (cria o acompanhamento se não existir). Ex.: `/limite cerveja 100`. |
| `/acompanhamentos` | Lista os acompanhamentos ativos + gasto do mês em cada. (alias `/meusalertas`) |
| `/parar <termo>` | Desativa um acompanhamento. |
| `/superfluo <categoria> on\|off` | Inclui/remove categoria do cálculo de supérfluo (Pilar A). |

Tom da copy: WhatsApp, formal-amigável, **sem gíria proibida no bot** (`cê/tá/né/ó`), número primeiro — alinhado à decisão de 2026-06-24 (mensagens −25%).

### 4.2. Linguagem natural (reusa o Agente de Perguntas — cod-0010..0017)
O Agente já está desenhado para classificar a pergunta numa intenção. Adicionamos uma intenção nova:

- **`gasto_por_termo`** — responde "quanto gastei em cerveja?", "quanto foi de ração esse mês?", "tô gastando muito em chocolate?". Faz o matching na hora (não precisa ter criado acompanhamento antes) e devolve o número via template/narração com o **firewall de fidelidade numérica** já existente do agente.

> **Recorte:** a **pergunta** ("quanto gastei em X") é leitura → cabe no agente (e pode ser Free, ver seção 7). **Criar acompanhamento persistente + alerta de limite proativo** é ação/config → comando, e é **Pro**. Criar acompanhamento *por linguagem natural* ("me avisa quando passar de R$100 em cerveja") fica como **evolução futura** (o agente hoje é read-only por design).

---

## 5. Quando o bot fala (gatilhos)

| Gatilho | O que dispara | Pilar |
|---|---|---|
| **Após processar um cupom** | Se algum acompanhamento **com limite** cruzou o teto **neste mês** com esta compra → 1 alerta (idempotente: só avisa na transição, não a cada cupom depois de passar). | B |
| **Resumo mensal** (`monthlySummary.js`) | Bloco de supérfluo (Pilar A) + linha por acompanhamento (Pilar B). | A+B |
| **Sob demanda** | `/acompanhamentos`, `/cortar`, `gasto_por_termo` (NL). | A+B |

**Regra anti-spam (honestidade de tom):** o alerta de limite avisa **uma vez** na virada do teto; depois só reaparece no resumo mensal ou se a pessoa perguntar. Nada de cobrar a cada compra. Reaproveita o espírito do sistema de reengajamento ("amizade, não cobrança").

---

## 6. Engine de matching (o núcleo técnico)

Tudo gira em torno de uma função **pura** que casa um item com um alvo. Sem I/O, 100% testável.

```
casarItemComAlvo(item, alvo) → boolean
  alvo = { tipo: 'categoria'|'termo', valor: string }

  - tipo 'categoria': item.categoria === alvo.valor
  - tipo 'termo':
      norm(s) = lowercase + remove acento + colapsa espaço
      base = norm(item.nome_canonico) || norm(item.nome)
      casa se o termo aparece como PALAVRA (limite de palavra),
        não substring solta — evita "cafe" casar "descafeinado" errado,
        e "uva" casar "luva". Guarda de comprimento mínimo (≥3).
```

```
buscarGastoPorAlvo(itensDoMes, alvo) →
  { total, qtdCompras, itensCasados: [...] }   // soma preco_total dos itens que casam
```

**Decisões de matching (registrar no CODE_GUIDE quando implementar):**
- **Palavra inteira, não substring crua** — reduz falso-positivo. (`\bcerveja\b` sobre o texto normalizado.)
- **Sem inventar:** se nada casa, retorna `total: 0` e a copy diz "ainda não encontrei itens de *cerveja* nos seus cupons" — nunca um número chutado.
- **Camada de sinônimos = evolução, não MVP.** Um léxico leve (`cerveja → [skol, brahma, heineken, itaipava, ...]`) elevaria muito o recall, mas é manutenção e risco de erro. **No MVP, a resposta é melhorar o `nome_canonico`** (seção 11), não manter dicionário de marcas. Léxico fica como cod-futuro, opcional.

> **Por que isso prova que classificação é o coração:** o matching é trivial; o que decide se ele acerta é a **qualidade do `nome_canonico`**. "Buscar pelo nome do item" = confiar na classificação. Endurecer a classificação (seção 11) é o que faz o Pilar B funcionar de verdade.

---

## 7. Modelo de dados (migration = humano — `supabase/` é zona proibida)

**Nova tabela `acompanhamentos`:**
```
acompanhamentos
  id              bigint PK
  phone_number    text  (FK usuarios)
  tipo_alvo       text  CHECK ('categoria','termo')
  alvo            text  -- categoria normalizada OU termo lowercased
  rotulo          text  -- rótulo de exibição (opcional; default = alvo)
  limite_mensal   numeric NULL  -- teto em R$; NULL = só acompanha, não alerta
  superfluo       boolean DEFAULT false  -- conta no total supérfluo (Pilar A)?
  ativo           boolean DEFAULT true
  criado_em       timestamptz DEFAULT now()
  UNIQUE (phone_number, tipo_alvo, alvo)
```

**Config de categorias supérfluas por usuário (Pilar A):** opção mais simples = coluna `usuarios.categorias_superfluas text[] NULL` (NULL → usa o baseline `['doces','bebidas']`). Evita uma tabela só pra isso. (Também migration humana.)

**Estado do limite (anti-spam):** registrar que já avisou neste mês — coluna `acompanhamentos.alertado_em date NULL` (mês do último alerta) ou uma linha em `lembretes_enviados`/análogo. Decidir na implementação; ambos sem PII nova.

> **Nada disso a máquina faz** — `supabase/` é zona proibida do firewall. A migration entra no painel "Ações do Gabriel".

---

## 8. Free × Pro (proposta — decisão do Gabriel / firewall)

> ⚠️ **Pricing é decisão do Gabriel.** Abaixo é proposta; o **gate** (`temFeaturesProAtivas`/`is_pro`) é passo humano. Nenhum preço novo é criado aqui.

| Recurso | Proposta | Por quê |
|---|---|---|
| Alerta de 3 níveis (total) | **Free** (como hoje) | Já é o básico prometido. |
| `/cortar` (supérfluo, 1 sugestão) | **Free** (como hoje) | Resolve a dor central sem quebrar o grátis. |
| Pergunta avulsa "quanto gastei em X" (NL) | **Free** (sujeito à cota de perguntas) | É leitura; encaixa na cota do Agente. Gera "uau" que puxa upsell. |
| **Acompanhamentos persistentes** (`/acompanhar`, `/acompanhamentos`) | **Pro** | É a personalização contínua — valor recorrente. |
| **Alerta proativo de limite** (`/limite`) | **Pro** | Inteligência preditiva/vigia — exatamente o "alerta inteligente" do Pro. |
| **Supérfluo configurável + bloco no resumo** | **Pro** | Evolui o `/cortar` Free pra um painel pessoal. |

Racional: o Free continua resolvendo a dor (modelo Spotify); o Pro entrega **vigias personalizadas + alertas proativos**, que são genuinamente melhores e dão substância à promessa paga (hoje fraca além de cupons ilimitados — ver §4 da auditoria 06-25).

---

## 9. Endurecimento da classificação (o plano que sustenta tudo) ❤️

Sem isto, o Pilar B é uma promessa furada. Alinhado ao princípio "classificação é o coração" (CLAUDE.md / CODE_GUIDE §0).

1. **`nome_canonico` lidera pelo tipo genérico (cod-0026).** Ajustar o prompt do Gemini para o canônico **começar pelo substantivo do produto**: `"cerveja skol lata 350ml"`, `"chocolate lacta ao leite 90g"`, `"refrigerante coca 2l"`, `"ração golden cães 15kg"`. Marca vem **depois** do tipo, nunca sozinha. É isso que faz `/acompanhar cerveja` achar a Skol. **Mudança de prompt = exige teste de regressão antes de subir.**
2. **Corpus de regressão de classificação (cod-0027).** `test/` com um conjunto de nomes de cupom reais → `nome_canonico`/`categoria` esperados (especialmente os alvos comuns de acompanhamento: cervejas, refrigerantes, chocolates, ração, café, limpeza). Trava regressão sempre que mexer no prompt/heurística. Mockar o Gemini (não chamar SDK real) e/ou testar as funções puras de normalização/matching.
3. **Fortalecer o rastreio `canonico_suspeito`** já existente pra também sinalizar "canônico sem substantivo genérico" (marca isolada). Vira métrica de saúde da classificação.
4. **Saída segura.** Manter `temperature:0`, reconciliação item×total, e a regra "na dúvida, `outros`/não-identificado" em vez de inventar.

> Sequência correta: **cod-0026 (prompt) + cod-0027 (corpus) vêm antes ou junto** do matching/acompanhamento. Construir o Pilar B sobre classificação fraca seria entregar busca que erra — o oposto do "coração levado a sério".

---

## 10. Quebra em tarefas da AGENDA (resumo — detalhe na `AGENDA.md`)

Cadeia (cada uma com teste, skills designadas, firewall verde). Ordem = dependência.

| id | Tarefa | tipo | Depende |
|---|---|---|---|
| **cod-0026** | Prompt: `nome_canonico` lidera pelo tipo genérico | refino-codigo | — |
| **cod-0027** | Corpus de regressão de classificação | teste | cod-0026 |
| **cod-0030** | Engine de matching puro (`casarItemComAlvo`, `buscarGastoPorAlvo`, `buscarGastoSuperfluo`) + testes | feature-codigo | cod-0027 |
| **cod-0031** | Leitura de acompanhamentos em `supabase.js` (lê tabela da migration humana) | feature-codigo | cod-0030 |
| **cod-0032** | Pilar A — bloco de supérfluo no `/gastos`/resumo (formatter) | feature-codigo | cod-0030 |
| **cod-0033** | Comandos `/acompanhar` `/limite` `/acompanhamentos` `/parar` `/superfluo` (index + formatter) | feature-codigo | cod-0031 |
| **cod-0034** | Intent NL `gasto_por_termo` no Agente de Perguntas | feature-codigo | cod-0030, agente (cod-0017) |
| **cod-0035** | Alerta proativo de limite (per-compra, idempotente no mês) | feature-codigo | cod-0031, cod-0033 |

> **Não é tarefa da máquina (humano):** migration de `acompanhamentos`/`categorias_superfluas`; ligar o **gate Pro**; decidir **Free×Pro**. Vão pro painel "Ações do Gabriel" / "Aguardando decisão".

---

## 11. Honestidade, riscos e guarda-rails

- **O Pro só vale o que a classificação entrega.** Registrado em letras grandes: matching por palavra-chave depende de `nome_canonico` forte. Por isso cod-0026/0027 abrem a fila.
- **Falso-positivo/negativo de matching** é o risco de UX nº1. Mitigação: palavra inteira (não substring), comprimento mínimo, e copy que admite "não encontrei itens de X" em vez de mostrar R$ 0 como se fosse fato consumado.
- **Privacidade/LGPD:** acompanhamentos guardam só termo + valor agregado (sem PII nova além do vínculo `phone_number`). Sem imagem, sem CPF. `economizei-security-lgpd` na revisão.
- **Firewall financeiro:** nenhuma tarefa da máquina toca `is_pro`/preço/assinatura. O **gate Pro** é humano. Nenhum preço novo foi inventado neste documento.
- **Não escala aquisição por causa disto.** A regra segue: só escalar anual/ads após **W2 ≥ 30%** (Fernandópolis). Esta feature **fortalece a promessa do pago** — pré-requisito de cobrar o anual com tranquilidade —, não é gatilho de gasto.

---

## 12. Próximo passo

1. Gabriel: rodar a **migration** de `acompanhamentos` (+ `categorias_superfluas`) — SQL pode ser escrito numa próxima sessão.
2. Decidir o **recorte Free×Pro** (seção 8) e ligar o **gate Pro**.
3. Soltar a fila pela ordem: **cod-0026 → cod-0027** (classificação) **→ cod-0030...** (alerta/acompanhamento), via `/tarefa` local, revisando o diff.

> **Mantra:** o cupom é a porta; a **classificação** é o chão sobre o qual toda inteligência pisa. Buscar "cerveja" e achar a cerveja é, no fundo, levar a classificação a sério.
