# 🔍 Auditoria Integral — 2026-07-10

> **O que é:** grande auditoria pedida pelo Gabriel em 10 frentes. **6 executadas nesta sessão** (firewall, idempotência/concorrência, schema×código, copy, npm, testes); **4 adiadas** por dependerem de dados que só o Gabriel acessa (classificação com cupons reais, custo Gemini, LGPD nos logs do Railway, custo de infra) — viram sessões futuras, com o material de preparação pronto na §7.
> **Estado do repo no momento da auditoria:** `main @ 0404e99`, working tree com mudanças não commitadas do cod-0021 (formatter/gemini) + docs de 07-09/07-10.

---

## ⚡ Resumo executivo

🎯 **Veredito geral: 🟡 — o núcleo do código está saudável (0 vulnerabilidades npm, dedup sólido, schema versionado), mas o FIREWALL tem 8 lacunas confirmadas + 1 bypass exatamente no momento de maior risco (Gate Pro em desdobramento), e há copy em produção prometendo coisa que não existe.**

**Ações principais:**
- Aplicar o **patch do firewall** (§1.4 — snippet pronto; o arquivo é protegido, só você edita) — 🧍 ~15min
- Rodar a **query de verificação de schema** no Supabase (§3.3) — 🧍 5min
- Decidir a **copy da indicação** (promete "alerta inteligente" que não existe; recompensa hoje não entrega nada) — 🧍 decisão de produto
- Tratar o **fluxo `/assinar` via Mercado Pago ainda ativo** (MP juridicamente abandonado desde 06-24; copy e checkout no ar) — 🧍 financeiro
- Priorizar **cod-0051/cod-0052** (testes da rede de segurança da extração + dedup) — 🤖 máquina

**Hoje (≤1h):** patch do firewall + query de schema (as duas coisas que fecham o risco do Gate Pro).
**Próxima sessão:** escolher 1 das 4 auditorias adiadas (§7) — recomendo a de classificação, que destrava o Alerta Pro.

---

## 📋 Relatório completo

### 1. 🔥 Firewall financeiro — 🔴 lacunas confirmadas por teste real

**O que foi validado (funciona):** selftest 16/16 OK; cenários reais num repo git isolado em /tmp: diff inocente **passa**, `is_pro` **bloqueia**, arquivo em `supabase/` **bloqueia**, `package.json` **bloqueia**, `assinatur*` **bloqueia** (pega `atualizarStatusAssinatura` por substring). O modo `--working` cobre staged + untracked corretamente.

**1.1 — 🔴 8 lacunas de conteúdo (testadas: todas passam limpo hoje).** Termos financeiros que entraram no código DEPOIS da criação do firewall e não estão em `MONEY_PATTERNS`:

| Token que passa limpo | Onde vive | Por que importa agora |
|---|---|---|
| `temFeaturesProAtivas` | `supabase.js:991` | É O gate Pro. Os snippets do Gate Pro (07-10) usam exatamente ele. |
| `COMPARATIVO_MAX_PRO` | env nova do Gate Pro | Decisão de ontem — o teto do Pro. |
| `ehPro` | `opts.ehPro` no desenho do gate | Idem — parâmetro que liga o gate no formatter. |
| `marcarProAtivo` | `supabase.js:955` | Seta `is_pro=true` (a linha interna pega, mas a CHAMADA não). |
| `concederFeaturesPro` | `supabase.js:851` | Concede dias de Pro (recompensa de indicação). |
| `hotmart` | futuro webhook | Plataforma de pagamento oficial dos anuais. |
| `ADMIN_SECRET` | `index.js:254-288` | Chave do endpoint que ativa Pro manualmente. |
| roteamento `'/planos'` | `index.js` | Só `montarMensagemPlanos` é pego; mexer no handler não. |

O risco é concreto e imediato: o padrão do Gate Pro desdobrado é "a máquina constrói SEM gate, o Gabriel insere o gate" — mas hoje, se a máquina (ou um `/tarefa` confuso) escrever `if (temFeaturesProAtivas(u))` num arquivo qualquer, **o firewall deixa passar**. Adicionar esses tokens mantém o desenho: quando VOCÊ aplicar os snippets, o firewall acusa de propósito e o commit é consciente (exatamente como o doc do Gate Pro prevê).

**1.2 — 🔴 Bypass por rename (testado):** `git mv src/mercadopago.js src/pagamentos.js` passa com "FIREWALL OK". O git detecta rename e o diff não mostra linhas adicionadas nem o caminho antigo na lista. Fix: `--no-renames` nos dois `git diff` do script.

**1.3 — 🟢 Denylist de caminhos:** completa para o estado atual. Sugestão de 1 adição preventiva: `src/hotmart.js` (o webhook futuro nasce protegido).

**1.4 — Patch pronto (você aplica — o arquivo é protegido do Cowork/máquina por design):**

```js
// Em PROTECTED_PATHS, adicionar:
  /^src\/hotmart\.js$/i,            // webhook de pagamento futuro (nasce protegido)

// Em MONEY_PATTERNS, adicionar:
  /temFeaturesProAtivas|concederFeaturesPro|marcarProAtivo/i,
  /\behPro\b/,
  /COMPARATIVO_MAX_PRO/,
  /hotmart/i,
  /ADMIN_SECRET|X-Admin-Secret/i,
  /['"`]\/planos\b/,               // roteamento do comando (montarMensagemPlanos já era pego)

// Nos DOIS git diff do runner (modo --working e modo base), adicionar --no-renames:
  sh("git diff --name-only --no-renames HEAD")            // --working
  execSync("git diff --unified=0 --no-renames HEAD", ...) // --working
  sh(`git diff --name-only --no-renames ${base}...HEAD`)  // CI
  execSync(`git diff --unified=0 --no-renames ${base}...HEAD`, ...)
```

Depois de aplicar: `node scripts/check-firewall.mjs --selftest` (adicionar 2-3 casos novos ao selftest com os tokens acima é bônus barato). ⚠️ Efeito colateral esperado: a cod-0041 (nota-gate menciona `ehPro`) e futuros diffs do gate vão tripar o firewall — **é o comportamento desejado** (revisão humana consciente).

**Limitação estrutural registrada (sem fix):** ofuscação (`'is_' + 'pro'`) não é pegável por scan de linha. A revisão humana do diff continua sendo a última camada — como sempre foi o desenho.

---

### 2. 🔁 Idempotência & concorrência — 🟡 sólido no dedup, frouxo nos contadores

**2.1 — 🟢 Dedup por `messageId` (Lei 5):** correto. PK em `mensagens_processadas.message_id` resolve corrida de 2 entregas simultâneas do MESMO evento (23505 → duplicado). Fail-open documentado (falha de dedup não trava atendimento). Purga TTL 7d **confirmada ligada** no cron das 7h (`scheduler.js:49`), junto com a de `perguntas_log` 90d (`scheduler.js:57`).

**2.2 — 🟢 Incremento de cupons é atômico** — via RPC `incrementar_compras_mes` (`SET compras_mes_atual = compras_mes_atual + 1`, schema.sql:114). Sem lost update **desde que a RPC exista em produção** (ver §3.3).

**2.3 — 🟡 Fallback do incremento é racy E silencioso** (`supabase.js:89-101`): se a RPC falhar por qualquer motivo, cai num read-then-write clássico (lost update em corrida) **sem logar** que caiu no fallback. A auditoria de 05-14 (M3) já pedia esse log — nunca foi feito. Fix de 1 linha: logar `incremento_fallback` dentro do `if (erroUpdate)`.

**2.4 — 🟡 TOCTOU no limite Free (2 fotos quase simultâneas):** o webhook responde 200 e despacha async (fire-and-forget), e o rate limit (10 msg/60s) NÃO segura 2 fotos seguidas — então 2 `processarImagem` do mesmo usuário rodam em paralelo de verdade. Com o contador em 9/10, ambos leem 9 em `verificarLimiteGratuito` → ambos passam → 11/10. Impacto: 1 chamada Gemini extra ocasional (centavos). Não vale transação/lock agora; vale saber que o teto é "±1".

**2.5 — 🟡 `incrementarPerguntas` é read-then-write** (`supabase.js:1429-1448`) — diferente dos cupons, o contador do Agente NÃO tem RPC atômica. Corrida de 2 perguntas simultâneas perde 1 incremento. Cota é anti-abuso (fail-open por design), então severidade baixa — mas a inconsistência entre os dois contadores é gratuita de resolver: mesma RPC, outra coluna. SQL pronto na §8.3.

**2.6 — 🟡 Reset mensal não é condicional:** os updates de reset (`verificarLimiteGratuito:189`, `verificarLimitePerguntas:1413`) não usam `.eq('mes_referencia', valorLido)` como guarda. Corrida na virada do mês pode zerar um contador recém-incrementado (off-by-one, 1x/mês no pior caso). Cosmético, registrado.

**2.7 — 🟡 Nota de semântica: dedup registra ANTES de processar.** `despacharComDedup` grava o `messageId` e SÓ ENTÃO roda `fn()`. Se o processamento falhar no meio (Gemini fora do ar), uma reentrega legítima do Z-API será descartada como duplicada — semântica *at-most-once*. O usuário recebe a mensagem de erro amigável e reenvia a foto (novo messageId), então é aceitável — mas é uma escolha, e agora está escrita.

**2.8 — 🟡 Corrida de onboarding:** 2 primeiras mensagens simultâneas de um número novo podem gerar boas-vindas duplicadas (upsert + step lido antes do write). Cosmético.

---

### 3. 🗄️ Schema × código — 🟢 no repo; produção depende de 1 query de 5min

**3.1 — 🟢 Zero drift no repositório:** varredura automatizada de TODOS os `.from()/.select()/.insert()/.update()/.eq()` do `supabase.js` + `metrics.js` contra os `CREATE TABLE`/`ALTER TABLE ADD COLUMN` dos 17 arquivos de `supabase/`: **toda tabela (14) e toda coluna usada no código tem SQL versionado**. As 7 views de métricas existem em `metrics_views.sql`/`migration_002`. A única RPC (`incrementar_compras_mes`) existe em `schema.sql` E `migration_001`.

**3.2 — O risco real é o que foi RODADO em produção** (a lição do A9). Confirmadas rodadas (AGENDA 07-08/07-09): A4, A9, agente, alerta Pro. **Não confirmadas** (rodadas presumidas por o bot funcionar, mas nunca verificadas formalmente): `migration_2026-06-07_assinaturas_mp.sql` (colunas `assinatura_*`, `mp_preapproval_id`, tabela `assinatura_eventos` — o `upsertUsuario` SELECIONA essas colunas em TODA mensagem, então se faltassem o bot estaria quebrado… mas confirmar custa 1 query), `migration_2026-06-07_idempotencia_messageid.sql`, `migration_003_indicacoes.sql`, `migration_categorias_precos.sql` e a **RPC** `incrementar_compras_mes` (se ela não existir, TODO cupom usa o fallback racy da §2.3 silenciosamente — é a verificação mais importante da lista).

**3.3 — Query de verificação (rodar 1x no SQL Editor, comparar com a lista esperada):**

```sql
-- Colunas por tabela
SELECT table_name, string_agg(column_name, ', ' ORDER BY column_name) AS colunas
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name ORDER BY table_name;

-- A RPC existe?
SELECT proname FROM pg_proc
JOIN pg_namespace n ON n.oid = pronamespace
WHERE n.nspname = 'public' AND proname = 'incrementar_compras_mes';
```

Esperado: tabelas `usuarios, compras, itens_compra, precos_mercado, indicacoes, lembretes_enviados, resumos_mensais_enviados, mensagens_processadas, assinatura_eventos, perguntas_log, acompanhamentos, waitlist` + a RPC retornando 1 linha. Se a RPC faltar: rodar o bloco dela do `schema.sql` (e o log da §2.3 ganha urgência).

**3.4 — 🟢 cod-0050 (guarda de schema no boot) já está na fila e é o fix estrutural.** Esta auditoria manual cobre o "hoje"; a cod-0050 cobre o "pra sempre". Sugestão: incluir na lista declarativa da cod-0050 também a checagem da RPC.

**3.5 — 🟡 A10 segue aberto:** comentário do `beta_fundador` no `schema.sql` ainda promete "3 meses grátis + preço travado" (revogado em 05-19). Cosmético, mas é o schema mentindo pra quem ler.

---

### 4. 💬 Copy vs produto real — 🔴 duas promessas quebradas no ar

**Método:** todos os comandos citados em mensagens do `formatter.js` cruzados com o roteamento real do `index.js`, + leitura das promessas de feature.

**4.1 — 🟢 Comandos citados × handlers: 100% fecham.** Todos os comandos citados na copy (`/planos`, `/gastos`, `/historico`, `/convidar`, `/apagar`, `/cancelar`, `/economia`, `/assinar`, `/ajuda`, `/pix`, `/resumo`, `/privacidade`, `/limite`, `/inflacao`, `/cortar`, `/compartilhar`, `/nao-compartilhar`) têm handler. O `/apagar` roteia via `interpretarApagar` antes do gate de onboarding, como desenhado.

**4.2 — 🔴 A indicação promete "alerta inteligente" que NÃO existe** (`formatter.js:842/854/863` — `montarMensagemConvite`, `montarBoasVindasIndicado`, `montarAvisoIndicacaoAtivada`): "vocês dois ganham 7 dias das funções Pro (comparativo entre mercados + **alerta inteligente**)". Estado real: o alerta inteligente Pro não foi construído (cod-0032..0035 fora da fila), e o comparativo existe mas **sem gate** — o Free vê o mesmo teaser que o "premiado". Ou seja: **a recompensa de indicação hoje entrega exatamente nada além do que todo mundo já tem**, e a copy está em produção prometendo. É o mesmo padrão promessa-vs-entrega que motivou o `/apagar`. Opções (decisão sua): (a) encurtar a promessa pra só "comparativo entre mercados" E aplicar o Gate Pro antes de divulgar o `/convidar`; (b) segurar a divulgação da indicação até o gate + alerta existirem. A ressalva já era conhecida desde 06-07 ("recompensa plumada, só morde quando as features existirem") — o que mudou é que o comparativo JÁ existe, então aplicar o gate (desdobrado ontem) resolve metade da promessa de uma vez.

**4.3 — 🔴 Fluxo de assinatura no cartão ainda é 100% Mercado Pago** (`formatter.js:322/332/380` + `/assinar` no `index.js` + webhook MP ativo): "gerar a sua assinatura no **Mercado Pago**", checkout MP, retry de cobrança MP. O MP foi **abandonado juridicamente em 06-24** (exige residência brasileira; Gabriel tem saída fiscal declarada). Se alguém assinar hoje, entra dinheiro por uma via juridicamente irregular. Isso é zona financeira = 100% humano, e já existe a pendência "Atualizar formatter.js com pricing anual + Hotmart" na AGENDA — mas a auditoria eleva a severidade: não é só copy desatualizada, é um **fluxo de cobrança ativo numa plataforma que você decidiu não poder usar**. Recomendação mínima enquanto Hotmart/Wise não chegam (bloqueados até out/2026): `/assinar` responder as instruções de PIX (Wise ainda não existe → PIX manual atual) em vez de gerar checkout MP, e as mensagens de cobrança MP ficarem inertes. Decisão sua.

**4.4 — 🟠 `/planos` sem o ciclo anual:** o anual é a oferta-destaque desde 06-23 (R$99/150/220, "pague 10 leve 12"), a landing já tem o toggle (`d3fe539`), e o bot só mostra mensal. Pendência conhecida (06-26), segue aberta — registrada aqui porque é a face mais visível do produto divergindo da estratégia comercial. Financeiro = humano.

**4.5 — 🟠 Promessa "comparativo entre mercados" como diferencial pago** (`formatter.js:221/229/271/699`): 4 mensagens vendem o comparativo como benefício do Individual. Verdade hoje: existe, mas sem gate — Pro e Free veem o mesmo. Resolve-se aplicando o Gate Pro desdobrado (A1). Nada a mudar na copy; mudar o produto.

**4.6 — 🟢 cod-0021 (copy `nao_supermercado`) já corrigida** no working tree (em revisão, aguarda seu `npm run check` + commit). Confirmei as mudanças presentes em `src/formatter.js`/`src/gemini.js` não commitados.

---

### 5. 📦 Dependências npm — 🟢 o melhor resultado da auditoria

**`npm audit` contra o lockfile: 0 vulnerabilidades** (0 críticas, 0 altas, 0 moderadas, 0 baixas). **Zero pacotes órfãos:** as 7 dependências declaradas são todas importadas (`@google/generative-ai` 3 arquivos, `ws` 2 — dependência real do realtime Supabase como documentado, `dotenv` 2, `@supabase/supabase-js` 2, `express`/`node-cron`/`sharp` 1 cada). Superfície de ataque pequena e coerente com a regra da seção 7 do CODE_GUIDE.

**Desatualizações (nenhuma urgente):**

| Pacote | Lock | Latest | Nota |
|---|---|---|---|
| `@google/generative-ai` | 0.21.0 | 0.24.1 | ⚠️ SDK em fim de vida — o Google migrou pro `@google/genai`. Não é vulnerabilidade; é dívida a planejar (o SDK atual continua funcionando). Trocar SDK mexe no coração (extração) → só com corpus de regressão verde. |
| `sharp` | 0.34.5 | 0.35.3 | O SIGBUS é do sandbox Linux do Cowork, não do pacote — atualizar não resolve isso. Sem CVE. |
| `express` | 4.22.2 | 5.2.1 | Major — NÃO subir agora (4.x recebe patches e está limpo). |
| `@supabase/supabase-js` | 2.105.3 | 2.110.2 | Minor, rotina. |
| `node-cron` | 4.2.1 | 4.6.0 | Minor, rotina. |
| `dotenv` | 16.6.1 | 17.4.2 | Major desnecessário. |

Recomendação: nada a fazer hoje. Rodar `npm audit` 1x/mês na rotina de sexta (Caixa) — custo ~30s. `package.json` é zona proibida da máquina, então qualquer bump é sempre seu.

---

### 6. 🧪 Testes reais vs cobertura percebida — 🟠 os 184 verdes medem lógica pura; a cola do sistema tem zero

**O que os ~184 testes cobrem bem:** toda a cadeia do Agente (guards 28, periodo 20, intents 20, classifier 16, render 11, orquestrador 11, cota 10 — inclusive JSON malformado DO CLASSIFICADOR e o airbag de fidelidade numérica com LLM mockado), insights (matching 17, comparativo 16, base 8), alerts (11), apagar (11), corpus de classificação (4+10).

**Os buracos, por ordem de dor:**

**6.1 — 🟠 A rede de segurança da EXTRAÇÃO tem zero testes.** `reconciliarItens`, `validarSchema`, `_scoreReconciliacao` e o `safeParse` do `gemini.js` — exatamente as funções que protegem "o coração" — não têm NENHUM teste (grep confirmado). O corpus de classificação testa `nome_canonico`/categoria, mas não o caminho "Gemini devolveu JSON quebrado / itens que não fecham com o total / campo faltando". Ironia: a parte do produto declarada invariante crítico é a menos testada nas bordas. → **cod-0051** (enfileirada).

**6.2 — 🟠 `despacharComDedup` e o roteamento do webhook: zero testes.** A Lei 5 nunca foi exercitada por teste (nem o caso 23505→duplicado, nem o fail-open, nem payload sem messageId). `index.js` inteiro (rate limit, validação de payload, roteamento) só é validado em produção. → **cod-0052** (enfileirada; pede exportar `despacharComDedup` pra teste — refactor de 2 linhas).

**6.3 — 🟠 Camadas nunca testadas:** `supabase.js` (todas as ~50 funções de I/O — mock nunca usado fora do agente), `zapi.js` (retry/guard de tamanho), `mercadopago.js` (A6 — humano, firewall), `reengagement.js`/`scheduler.js`/`monthlySummary.js`/`weeklyDigest.js`/`charts.js`/`formatter.js` core (cod-0022 na fila cobre parte).

**6.4 — 🟡 O firewall de fidelidade numérica com Gemini REAL foi validado exatamente 1x** (smoke de 07-09) e não é repetível barato. Nenhum teste automatizado chama o Gemini real (correto — regra do CODE_GUIDE §5), mas isso significa que "número inventado pelo modelo real" só é pego pelo airbag em produção + log `fidelidade_ok:false`. Recomendação barata em vez de teste de integração: **transformar o roteiro de smoke de 07-09 num script manual reutilizável** (ex.: `npm run smoke:agente`, roda 5 perguntas contra produção e confere `fidelidade_ok` no log) e rodá-lo a cada deploy que toque agente/prompt. E: **monitorar `fidelidade_ok:false` no Railway é a métrica-sentinela** — se aparecer, o airbag segurou uma invenção; investigar o prompt.

**6.5 — 🟡 Fixando expectativa:** "184/184 verdes" ≠ "produto coberto". A suíte é excelente em lógica pura (o que é a escolha certa pra operação solo), mas o mapa acima é o que "verde" NÃO garante. O checkpoint Nível 2 deveria citar esse mapa ao dar veredito 🟢.

---

### 7. ⏸️ As 4 auditorias adiadas — material de preparação pronto

**7.1 — Auditoria de classificação com cupons reais** *(a mais valiosa — destrava Alerta Pro/comparativo/inflação com confiança)*
Você fornece: 15–30 fotos de cupons reais variados (mercado grande, mercadinho, farmácia, por peso, térmico apagado). Sessão: rodar cada um pelo pipeline real (ou `src/test-gemini.js`), montar planilha item×esperado×extraído, medir taxa de acerto por categoria e por tipo de item (peso, abreviação regional), decidir poda de prompt. As 5 queries de `supabase/monitoring_canonicos.sql` já prontas dão a visão do que está EM PRODUÇÃO (rodar antes da sessão e trazer o resultado). Saída: relatório de acerto + lista de padrões de erro + (se precisar) tarefa de ajuste de prompt com corpus ampliado.

**7.2 — Auditoria de custo Gemini por chamada**
Você fornece: print/export do Google AI Studio ou Cloud Console (billing por dia, últimos 30d) + nº de cupons e perguntas no período (queries abaixo). Aritmética do código pra cruzar: **cupom = 1–2 chamadas Vision** (retry só em borrado/JSON inválido — a taxa de retry aparece no log `gemini_resposta_bruta` 2x pro mesmo evento) · **pergunta = 2 chamadas texto** (classificação + narração; off-topic = 1, template-only = 1) · **transcrição futura (cod-0046) = +1**.
```sql
SELECT date_trunc('day', criado_em) d, count(*) FROM compras GROUP BY 1 ORDER BY 1 DESC LIMIT 30;
SELECT date_trunc('day', criado_em) d, count(*) FROM perguntas_log GROUP BY 1 ORDER BY 1 DESC LIMIT 30;
```
Saída: custo real por cupom e por pergunta → recalibrar limite 10 cupons / 30 perguntas com número, não estimativa.

**7.3 — Auditoria LGPD fim-a-fim (foco: logs do Railway)**
O que já adiantei no código (parcial): mascaramento de phone está consistente nos logs que amostrei (`maskPhone` em todo log com telefone); **2 pontos de atenção achados**: `gemini_resposta_bruta` loga os primeiros 120 chars do JSON do cupom (inclui loja+CNPJ da loja — dado público, ok) e `gemini_json_invalido` loga 300 chars de texto cru do modelo (pode ecoar itens do cupom — sem PII do usuário, mas é conteúdo de compra). Nenhum log de CPF/telefone cru encontrado na amostra.
Você fornece: acesso aos logs do Railway (ou export de 1 dia cheio) + a config de **retenção de logs do plano Railway** (quanto tempo eles guardam — esse é o dado que ninguém olhou). Sessão: grep do export por padrões de CPF/telefone/valores + conferir que `perguntas_log` TTL 90d e `mensagens_processadas` TTL 7d estão DE FATO esvaziando (query `SELECT min(criado_em) FROM ...` — se retornar coisa mais velha que o TTL, a purga não está rodando).

**7.4 — Auditoria de custo total de infra vs orçado**
Você fornece: valores/tier atuais de Railway, Supabase (dashboard → uso de storage/linhas/MAU), Z-API (plano), Gemini (7.2), Vercel, domínio. Checagens-chave: **Supabase free tier** = 500MB banco (com `precos_mercado` crescendo indefinidamente por design + `itens_compra` sem anonimização — os dois candidatos a estourar primeiro; query de tamanho: `SELECT pg_size_pretty(pg_database_size(current_database()));`), **Railway** = créditos/mês do plano, **QuickChart** = gratuito com rate limit (sem conta — se o volume crescer, gráfico começa a falhar silenciosamente; checar se há retry/fallback… não há: o gráfico é URL GET enviada ao Z-API, falha aparece pro usuário como imagem quebrada). Saída: tabela custo real × teto por serviço + gatilhos de upgrade.

---

### 8. 📌 Tarefas derivadas (o que foi enfileirado/registrado)

**8.1 — Na AGENDA (máquina, firewall-limpo):** cod-0051 (testes da rede de segurança da extração), cod-0052 (testes do dedup + webhook). Blocos completos na Fila pronta.

**8.2 — Ações do Gabriel (humano):** patch do firewall (§1.4) · query de schema (§3.3) · decisão copy indicação (§4.2) · fluxo MP (§4.3) · log do fallback de incremento (§2.3, 1 linha — pode ir junto com o patch do firewall no mesmo commit consciente) · 4 auditorias adiadas (§7, com material pronto).

**8.3 — SQL opcional (RPC atômica pro contador de perguntas — §2.5), rodar quando quiser:**
```sql
CREATE OR REPLACE FUNCTION incrementar_perguntas_mes(p_phone_number TEXT)
RETURNS INT AS $$
DECLARE novo INT;
BEGIN
  UPDATE usuarios SET perguntas_mes_atual = COALESCE(perguntas_mes_atual,0) + 1
  WHERE phone_number = p_phone_number
  RETURNING perguntas_mes_atual INTO novo;
  RETURN novo;
END; $$ LANGUAGE plpgsql;
-- ROLLBACK: DROP FUNCTION incrementar_perguntas_mes(TEXT);
```
Depois de rodar, a troca no `incrementarPerguntas` (supabase.js) é tarefa de máquina de 5 linhas — me peça que eu enfileiro.

---

*Auditoria executada em sessão Cowork (Opus/Fable + Gabriel), 2026-07-10. Métodos: testes reais do firewall em repo git isolado (/tmp), varredura automatizada schema×código, npm audit contra lockfile, cruzamento copy×handlers, análise estática de concorrência. Zero código de produto tocado; zero commit (como sempre, commit é seu).*
