# 🗺️ Roadmap — Destravar a micro-cohort (5–10 usuários)

> **Origem:** decisões do Gabriel na sessão de 2026-08-23, tomadas sobre a `Auditoria_Integral_2026-08-23.md`.
> **Norte escolhido:** *destravar a micro-cohort de 5–10 usuários.* Quando houver conflito de tempo, vence o que coloca gente real usando o bot e produz aprendizado — não o que adiciona função.
> **Regra que governou a montagem:** para cada atividade, a pergunta foi *"o que dá pra fazer sem o Gabriel?"*. Nada entrou na coluna dele que pudesse sair.

**Legenda de quem faz:**
🤖 **Máquina** (leva no `estoque/`, rotina das 8h — você só revisa e commita) · 🧠 **Eu, em sessão** (escrevo doc/SQL/copy, não commito nem toco banco) · 🤝 **Par** (eu preparo, você aperta o botão) · 🧍 **Só você** (banco, deploy, dinheiro, WhatsApp real)

---

## ⚡ Resumo executivo

🎯 **Objetivo dos próximos ~14 dias:** ter 5–10 pessoas reais usando o bot, sem prejudicar nenhuma delas, com o aprendizado sendo capturado em vez de evaporar.

O norte reordena a auditoria. Três coisas que eram 🟡 viraram **bloqueio**, e uma que era 🔴 virou "importante, mas não bloqueia":

| Achado | Era | Virou | Por quê |
|---|---|---|---|
| S5 — views de métricas ausentes | 🟡 dívida | 🔴 **bloqueio** | A cohort existe **para medir W2**. Sem as views (ou uma query equivalente), ela roda cega e você paga o custo sem receber o dado. |
| `/apagar` quebrado | 🔴 | 🔴 **bloqueio** | Continua sendo o nº1: com usuário real, é direito dele — e a política publicada promete 48h. |
| Verificações S2/S4 (chave e RLS) | 🟡 pendência | 🔴 **bloqueio** | Você mesmo definiu S2/S4 como pré-requisito inegociável de usuário externo. Ligar o RLS foi feito; **provar que ele protege, não.** 2 minutos. |
| `sharp` com CVE alto | 🔴 | 🟠 **decisão sua** | Análise de impacto abaixo: 1 único ponto de uso, 5 linhas, já com fallback. O upgrade é mais barato do que parecia. |

**As 5 primeiras ações, em ordem:**

1. 🧍 **2 min** — provar o RLS (o `curl` com a anon key) e a chave (`role` do JWT). Sem isso, convidar gente é apostar.
2. 🤝 **10 min** — rodar as views de métricas **na versão corrigida** (`migration_002`, com `criado_em`) e **re-rodar o `rls_migration_parte2` logo depois** — view nova nasce exposta.
3. 🤖 **fila** — cod-0076: consertar o `/apagar` (bloco pronto para colar na AGENDA, abaixo).
4. 🧍 **15 min** — smoke end-to-end (o último foi em 09/07; passaram ~25 commits): 1 cupom, `/gastos`, 1 pergunta em texto livre, `/apagar` **depois** da cod-0076.
5. 🤝 **20 min** — convite + consentimento da cohort (texto pronto por mim, envio seu).

**Bloqueadores fora da sua mão:** nenhum. Tudo que impede a cohort hoje cabe em ~1h sua + o que a máquina entrega sozinha.

---

## 📋 Roadmap completo

### FASE 0 — Pré-voo *(nada de convite antes disto)*

| # | Ação | Quem | Custo | Estado / evidência |
|---|---|---|---|---|
| 0.1 | **Provar o RLS e a chave.** (a) decodificar o JWT da `SUPABASE_SERVICE_ROLE_KEY` e conferir `role: 'service_role'`; (b) o `curl` com a **anon key** contra `usuarios`, `compras`, `perguntas_log`, `v_dashboard` — esperado `[]` ou erro. Testar pelo SQL Editor dá falso positivo. | 🧍 | 2 min | Roteiro já escrito: `Roteiro_SQL_Editor_2026-08-07.md` passo 0 + verificação 3 do `rls_migration_parte2`. |
| 0.2 | **Consertar o `/apagar`** — cod-0076 (bloco abaixo). Sem ele, o direito de eliminação apaga pela metade e mente pro usuário. | 🤖 → 🧍 commita | 1 run | Provado por execução na auditoria (§4.4). |
| 0.3 | **Confirmar `lembretes_enviados`** — `select to_regclass('public.lembretes_enviados');`. Se vier `NULL`, a cod-0076 está certa na premissa. Rodar **antes** da cod-0076 entrar na fila. | 🧍 | 30 seg | — |
| 0.4 | **Decidir o `sharp`** (análise de impacto abaixo). Com ~0 usuários, é o momento mais barato de quebrar algo. | 🧍 | 15 min se for | `npm audit`: 4 CVEs HIGH. |
| 0.5 | **Smoke end-to-end** com você mesmo como usuário: cupom → confirmação → `/gastos` → 1 pergunta livre → `/planos` → `/apagar` (depois da 0.2). | 🧍 | 15 min | Último smoke: 09/07. Desde então: gate Pro, filtro de gasto, sugestões do agente, gráfico sob demanda. |
| 0.6 | **Copy: o que a cohort vai ler.** Decidir o que fazer com "cartão/Mercado Pago" na landing e "alerta preditivo" no `/planos` — os dois prometem o que não existe. Eu escrevo as duas versões (curta e "em breve"), você escolhe e aplica. | 🧠 → 🧍 | 20 min | Auditoria §4.6 (N4, B9). |

> ⚠️ **Tensão que fica registrada (não vou reabrir):** você optou por tratar o plano Família via **gatilho** (abaixo) em vez de tirar da copy. Com a micro-cohort, essas 5–10 pessoas **vão ler o `/planos`** com Família R$15 e Família+ R$22 à venda, e o pagamento é PIX manual. O gatilho resolve o rumo; ele não cobre a janela entre hoje e a construção. A decisão interina virou o item **D-1** dentro do bloco do gatilho — é uma linha para você responder, não um pedido para reconsiderar o caminho.

### FASE 1 — Instrumentação *(o que faz a cohort valer o custo)*

| # | Ação | Quem | Custo | Detalhe |
|---|---|---|---|---|
| 1.1 | **Views de métricas — na ordem certa.** O `metrics_views.sql` original referencia `usuarios.created_at`; o schema real é **`criado_em`** — é por isso que ele quebra desde sempre. A versão certa é a `migration_002_fix_metrics_views.sql`. **E depois de criar as views, re-rodar o `rls_migration_parte2_2026-08-07.sql`**: ele descobre as views existentes e aplica `security_invoker` + `REVOKE anon`. View criada depois do RLS nasce fora da proteção — foi exatamente o buraco de 07/08. | 🤝 | 10 min | Eu monto o script único na ordem certa, se quiser. |
| 1.2 | **Plano B se as views derem trabalho:** uma query direta de W2 que não depende de view nenhuma. Mais barata para 10 usuários e roda colada no SQL Editor. | 🧠 (escrevo) → 🧍 (roda) | 5 min | Evita transformar métrica em projeto. |
| 1.3 | **S3 — a RPC `incrementar_compras_mes` existe?** Query pronta no bloco 3 do roteiro; alternativa grátis: procurar `incremento_fallback` nos logs do Railway. Com 10 usuários o fallback racy é tolerável — mas saber é de graça. | 🧍 | 2 min | Sentinela no código desde 24/07. |
| 1.4 | **Corpus da classificação rodando em qualquer lugar.** Extrair `avaliarQualidadeCanonicoItem` para um módulo puro sem `require('sharp')` — hoje o teste mais importante do repo não roda no sandbox (SIGBUS) **nem nas runs da máquina**. Vira cod-0077. | 🤖 | 1 run porte P | Auditoria §4.2 (N10). |
| 1.5 | **Custo do Gemini na escala da cohort — estimativa fechada.** Com `gemini-2.5-flash` a US$0,30/1M input e US$2,50/1M output, 1 cupom (≈2.500 tok in + ≈1.200 tok out, com margem para 1 retry) sai por **~US$0,004–0,008** ≈ **R$0,02–0,05**. 10 pessoas × 10 cupons/mês = **~US$0,40–0,80/mês**. Ou seja: **custo não é risco nesta fase** — o limite de 10 cupons do Free é anti-abuso, não teto de caixa. | 🧠 (feito) | — | Fecha a parte respondível da aud-02; o número real ainda vem do billing. |

### FASE 2 — A cohort *(o que só acontece com gente de verdade)*

| # | Ação | Quem | Custo | Detalhe |
|---|---|---|---|---|
| 2.1 | **Texto do convite + consentimento.** Precisa dizer: é teste, é grátis, **sem promessa comercial** (regra 5), o que o bot faz com a foto, e como apagar tudo (`/apagar`). Escrevo passando por `copywriter` + `financial-firewall`. | 🧠 → 🧍 envia | 20 min | Sem isto, "usuário controlado" vira "usuário sem contrato". |
| 2.2 | **Escolher as 5–10 pessoas** — variedade importa mais que volume: quem faz rancho grande, quem compra pouco toda semana, alguém com pouca paciência digital (o teste real do zero atrito). | 🧍 | 30 min | — |
| 2.3 | **Roteiro de escuta D+7 e D+14** — 3 perguntas fixas, iguais para todos, para virar dado comparável em vez de impressão. | 🧠 → 🧍 conversa | 15 min | A rotina "1 conversa/semana" da §5 do CLAUDE.md nunca teve evidência; esta é a primeira chance. |
| 2.4 | **Fotos de cupom viram corpus.** Cada erro de leitura que aparecer vira caso no `test/corpus/` — é a aud-01 acontecendo de graça, sem sessão dedicada. | 🧍 (coleta) → 🤖 (vira teste) | contínuo | A aud-01 é a auditoria mais valiosa da lista e depende só de cupom real. |
| 2.5 | **Ler o `perguntas_log` uma vez por semana** — é o que destrava as cod-0045/0046/0047/0018, congeladas desde 09/07 por falta exatamente disso. | 🤝 | 10 min/sem | O gate de 09/07 (*"perguntas_log é o juiz"*) finalmente pode ser cumprido. |

### FASE 3 — O que a cohort destrava *(não fazer antes)*

- **W2 medida pela primeira vez** → é o gate da regra 7 (≥30% libera aquisição paga). Sem cohort, essa régua nunca sai do papel.
- **Alerta com limiares reais** (cod-0007, bloqueada por dados desde sempre).
- **Decisão informada sobre o Agente** (0045/0046/0047/0018) com log de perguntas de verdade.
- **Prova ou refutação do "zero atrito"** — se alguém trava no onboarding, é o achado mais importante que o produto pode receber hoje.

### EM PARALELO — não bloqueia a cohort, não some da fila

| Item | Quem | Nota |
|---|---|---|
| Estoque atual: leva `0001_2026-08-22_cod-0065a` (datas do Canadá) esperando `/entregar` | 🧍 | Íntegra, sem migration, 457 linhas. |
| cod-0066 (limpar funções MP órfãs), cod-0072a (parser de parcela) | 🤖 | Fila normal. |
| cod-0075 — **rever com o diagnóstico certo**: o defeito não é "Free destravado", é o **Pro rebaixado ao teto Free** ao perguntar em texto livre (`intents.js:596`). O gancho já existe (`deps.maxComparativos`) — é 1 linha no chamador. | 🤝 decide, 🤖 faz | Auditoria §4.6. |
| Migration PIX → destrava cod-0062 (PIX) e a Frente 1 | 🧍 | Aditiva, não quebra nada. |
| `.env.example` (5 envs vivas faltando, 4 mortas do MP), A10 (comentário `beta_fundador`), DROP MP | 🧍 | Higiene; entra numa sentada só. |
| Texto da tarefa agendada `economizei-rotina-matinal` (ainda diz WORKING TREE; o regime é ESTOQUE) | 🧍 | A run de 22/08 acertou por escolha do modelo, não por instrução. |
| Teste de regressão do bypass por rename no firewall | 🤖 | Fecha a pendência nº1 de julho de verdade. |

---

## 🔬 Análise de impacto — `sharp` 0.34.5 → 0.35.x *(você pediu o dado antes de decidir)*

**O que o 0.35.0 quebra** (changelog oficial):

1. Remove propriedades **depreciadas** do `sharpen`.
2. Renomeia `format.jp2k` → `format.jp2`.
3. Exige **Node ≥ 20.9** (dropa o 18).
4. Remove o *install script* do `package.json` — compilar da fonte vira opt-in (o binário pré-compilado continua vindo como dependência opcional).

**O que o Economizei usa** — um único ponto, `src/gemini.js:334-344`:

```js
sharp(buffer).normalise().sharpen({ sigma: 1.5 }).png().toBuffer()
```

| Quebra | Afeta o Economizei? | Por quê |
|---|---|---|
| props depreciadas do `sharpen` | **Não** | O código usa a forma **de objeto** (`{ sigma }`), que é a atual. O que sai é a forma posicional legada (`sharpen(sigma, flat, jagged)`). |
| `jp2k` → `jp2` | **Não** | Não é usado. |
| Node ≥ 20.9 | **Não** | `package.json` exige `>=22`; Dockerfile é `node:22-bullseye-slim`. |
| install script | **Risco baixo, único real** | O build no Railway precisa resolver o binário `@img/sharp-linux-x64`. Mitigação: `npm install` + `npm run check` na sua máquina e olhar o log do build do Railway no primeiro deploy. |

**Rede de segurança que já existe:** a chamada inteira está dentro de `try/catch` e, se o Sharp falhar, retorna `null` e o caller usa o buffer original — o bot continua lendo cupom, só sem o pré-processamento.

**Veredito honesto:** o upgrade tem **1 ponto de contato, 5 linhas, com fallback**. O custo de fazer é ~15 min (`npm audit fix --force` + `npm run check` + 1 cupom de smoke); o custo de não fazer é carregar 4 CVEs altos na única superfície que recebe binário de estranho. **Decisão sua** — o dado está aqui.

---

## 📌 Blocos prontos para colar na AGENDA

### 1) Fila pronta — conserto do `/apagar`

```
### [P0] 🔴 LGPD — /apagar aborta e não apaga `usuarios` (exclusão parcial)
- id: cod-0076
- tipo: bugfix
- porte: P
- skills: debugging, security-lgpd, code-decisions, tdd, automation-triage
- objetivo: `apagarDadosUsuario` conclui SEMPRE, mesmo com tabela ausente no banco, e `usuarios` é sempre apagada por último — fechando o CASCADE de `perguntas_log` e `acompanhamentos`.
- contexto: provado por execução em 2026-08-23 (Auditoria_Integral_2026-08-23.md §4.4). O passo 3 apaga `lembretes_enviados`, tabela que nunca foi criada; o `if (error) throw error` interrompe a função DEPOIS de apagar `compras`/`itens_compra`/`indicacoes` e ANTES de `usuarios`. O usuário perde o histórico, mantém a identidade e recebe "deu erro". A política publicada promete exclusão total em 48h.
- arquivos-alvo: src/supabase.js, test/apagar-io.test.js (novo)
- criterios-de-aceite:
  - erro de AUSÊNCIA de tabela/coluna (mesmos códigos do `ehErroDeAusencia` do schemaGuard: 42703, 42P01, PGRST204, PGRST205) é LOGADO e a função SEGUE; qualquer outro erro continua abortando
  - `usuarios` é sempre o último DELETE e sempre executado quando nenhum erro real ocorreu
  - teste novo com cliente Supabase injetado que simula `lembretes_enviados` ausente e asserta: função NÃO lança, ordem das tabelas correta, `usuarios` incluída
  - teste do caminho triste: erro REAL (ex.: 500) ainda propaga e o usuário recebe `montarApagarErro`
  - `node --test` verde; firewall verde
- fora-de-escopo: criar a tabela `lembretes_enviados` (o reengajamento foi desligado em 05/08); mexer em `is_pro`, pagamento ou `supabase/`
- pré-req humano (não bloqueia a implementação): confirmar `select to_regclass('public.lembretes_enviados');`
- status: pronta
```

### 2) Fila pronta — corpus da classificação rodando em qualquer ambiente

```
### [P2] Classificação — tornar o corpus executável fora da máquina do Gabriel
- id: cod-0077
- tipo: refino-codigo
- porte: P
- skills: tdd, code-decisions, product-principles
- objetivo: `test/classificacao-corpus.test.js` roda em ambiente sem `sharp` funcional (sandbox e runs da máquina), sem mudar nenhuma regra de classificação.
- contexto: o teste mais importante do repositório importa `gemini.js`, que faz `require('sharp')` no topo e morre com SIGBUS no Linux do sandbox. Hoje só a máquina do Gabriel consegue rodá-lo — ou seja, o guarda do coração não protege as runs automáticas.
- arquivos-alvo: src/canonico.js (novo, PURO), src/gemini.js (re-export), test/classificacao-corpus.test.js (import)
- criterios-de-aceite:
  - `avaliarQualidadeCanonicoItem` (e o que mais for puro do mesmo bloco) migra para módulo sem I/O e sem `sharp`
  - `gemini.js` continua exportando o mesmo nome (retrocompatível byte a byte para os chamadores)
  - o corpus passa a rodar isolado; nenhum caso do corpus muda de veredito
  - `node --test` verde
- fora-de-escopo: alterar prompt, heurística, categorias ou qualquer regra de classificação (é o coração — só com o Gabriel presente)
- status: pronta
```

### 3) ⏳ Aguardando sua decisão — gatilho do vínculo familiar

```
**[GATILHO] Plano Família / Família+ — construir o vínculo entre pessoas**

Estado: os planos Família (R$15/mês · R$150/ano) e Família+ (R$22/mês · R$220/ano)
estão à venda no /planos e na landing e NÃO existem em código (auditoria 2026-08-23
§4.6 — zero linhas de vínculo, visão consolidada ou comparação por membro).

GATILHO PARA VIRAR TAREFA (qualquer um dos três):
  (a) alguém da micro-cohort pedir explicitamente o plano familiar; OU
  (b) a W2 do cohort individual ficar ≥ 30% (regra 7 — só então vale ampliar escopo); OU
  (c) a empresa BC abrir (out/2026) e o trilho de pagamento anual entrar no ar.

DECISÕES SUAS ANTES DE VIRAR TAREFA:
  D-1 [INTERINA — vale a partir do 1º convidado] O que a cohort lê no /planos?
      ( ) mantém como está e você trata caso a caso se alguém pedir
      ( ) marca Família/Família+ como "em breve" no /planos e na landing
      ( ) tira da copy até existir
  D-2 Modelo de vínculo: convite por código (como o /convidar) ou o titular cadastra
      os números? Quem pode ver o gasto de quem — todos veem tudo, ou só o titular
      vê o consolidado?
  D-3 Identidade: cada membro é um `phone_number` próprio (mantém o modelo atual) ou
      existe uma entidade "grupo" nova no schema? (a 2ª exige migration e mexe em
      quase toda leitura agregada)
  D-4 Cobrança: 1 pagante para o grupo todo (titular) ou rateio? Como cai o membro
      quando o titular deixa de pagar?
  D-5 LGPD: o membro precisa consentir em ter o gasto visível pra outra pessoa —
      onde esse consentimento acontece no fluxo?

PORTE ESTIMADO: G (schema novo + toda leitura agregada passa a ter escopo de grupo
+ gate Pro por grupo). Nunca em run autônoma.
```

### 4) 🙋 Ações do Gabriel — itens novos

```
- [ ] 🔴 2 min · Provar RLS + chave (curl com anon key; `role` do JWT). Pré-req inegociável da cohort.
- [ ] 🔴 30 seg · `select to_regclass('public.lembretes_enviados');` (premissa da cod-0076).
- [ ] 🔴 10 min · Views de métricas NA ORDEM: `migration_002_fix_metrics_views.sql` (usa `criado_em`, não `created_at`) → depois `rls_migration_parte2_2026-08-07.sql` de novo (view nova nasce exposta).
- [ ] 🟠 15 min · Decidir/aplicar o upgrade do `sharp` (análise de impacto: Roadmap_Micro_Cohort_2026-08-23.md).
- [ ] 🟡 15 min · Smoke end-to-end (o último foi 09/07, ~25 commits atrás).
- [ ] 🟡 20 min · Copy: "cartão/Mercado Pago" na landing e "preditivo" no /planos (eu escrevo as opções).
- [ ] 🟢 Atualizar o texto da tarefa agendada `economizei-rotina-matinal` (diz WORKING TREE; o regime é ESTOQUE).
```

---

## ❓ O que ainda depende de você decidir

1. **D-1 do gatilho familiar** — o que a cohort vê no `/planos` a partir do 1º convidado.
2. **`sharp`** — sobe agora, sobe junto do push da cod-0076, ou fica como dívida com data de revisão.
3. **Views × query direta** (1.1 vs 1.2) — quer o conjunto completo de métricas ou só a W2 pelo caminho curto?
4. **Tamanho e perfil da cohort** — 5 ou 10? Só gente próxima ou alguém que não te deva favor nenhum (o teste de atrito mais honesto)?
5. **cod-0075** — com o diagnóstico corrigido (Pro rebaixado, não Free destravado), entra na fila agora ou espera a cohort dizer se alguém usa o comparativo por texto livre?
