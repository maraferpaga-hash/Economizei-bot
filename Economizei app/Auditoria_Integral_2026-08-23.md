# 🔍 Auditoria Integral — Economizei (2026-08-23)

> **Processo:** recriação do `Economizei app/Prompt_Auditoria_Completa_2026-07-17.md` (auditor externo, cético, **read-only**), com a mesma convenção de severidade da `Auditoria_Integral_2026-07-10.md`.
> **Regra que governou a apuração:** regra 14 da §11 do `CLAUDE.md` — *verificar estado, não aceitar resumo*. Nenhum achado abaixo se apoia no que a memória afirma; cada 🔴 tem comando executado, output ou trecho com arquivo+linha.
> **Nada foi alterado:** sem commit, push, migration, endpoint financeiro ou edição de `src/`. Este documento não toca `CLAUDE.md`, `AGENDA.md`, `CODE_GUIDE.md` nem `PROJECT_INSTRUCTIONS.md`.
> **Estado auditado:** `HEAD` = `origin/main` = `2082cca` (2026-08-22 01:39 -0700), working tree com `AGENDA.md` + `RELATORIO_MATINAL.md` modificados, estoque 1/4 (leva `0001_2026-08-22_cod-0065a`).

---

## ⚡ Resumo executivo

🎯 **Veredito: 🟠 LARANJA — a máquina está saudável, o produto não está.**

A engenharia de processo evoluiu de verdade desde julho: os 24 hashes citados na memória existem e batem com o conteúdo declarado, o firewall passa 19/19 no selftest, o estoque está íntegro, as 5 rotinas agendadas rodam, e o RLS — a exposição que ficou aberta desde sempre — foi fechado. **O problema mudou de lugar.** Os quatro achados mais graves desta auditoria não estão na máquina: estão no que o produto **promete** a um usuário real e no que ele **entrega** se esse usuário aparecer amanhã.

**Os 4 riscos mais graves:**

1. **🔴 O `/apagar` (LGPD) está quebrado e apaga pela metade.** Provado por execução: ele apaga `compras` + `itens_compra` + `indicacoes`, então **lança** na tabela `lembretes_enviados` (que nunca foi criada) e **nunca chega em `usuarios`** — logo `perguntas_log` e `acompanhamentos`, que dependem do CASCADE, sobrevivem. O usuário perde o histórico, mantém a identidade e recebe "deu erro". A política publicada promete exclusão total em 48h.
2. **🔴 `sharp@0.34.5` com CVEs de severidade alta** (libvips) e é exatamente por ele que passa **toda foto que um estranho manda no WhatsApp**. É a única superfície do produto que processa binário não-confiável.
3. **🔴 Os planos Família (R$15/R$22 mês · R$150/R$220 ano) não existem no código** — zero linhas de vínculo entre pessoas, visão consolidada ou comparação por membro. Estão à venda no `/planos` e na landing, com pagamento por **PIX manual**: é possível receber por algo que não há como entregar.
4. **🔴 A landing ainda vende "cartão" e cita "Mercado Pago"** ~4 semanas depois do MP ter sido removido do código (`4f49ae7`). O `/pix` do bot foi corrigido (cod-0067); a landing ficou para trás.

**Ações principais (na ordem em que eu faria):**

- **Hoje (≤1h):** rodar `select to_regclass('public.lembretes_enviados');` — se vier `NULL`, o achado 🔴 nº1 está confirmado em produção e o conserto é remover/tolerar o passo 3 do `apagarDadosUsuario` — 🤝
- **Hoje (≤10min):** cortar da landing e do `/planos` o que não existe (cartão, Mercado Pago, planos Família) ou marcar explicitamente como "em breve" — 🧍 (zona financeira/copy pública)
- **Esta semana:** `npm audit fix --force` do `sharp` (0.34.5 → ≥0.35.3, breaking) + smoke de 1 cupom real — 🧍 (`package.json` é sua zona)
- **Esta semana:** rodar o `metrics_views.sql` inteiro — sem as views, a **W2 não é mensurável**, e W2 é o gate que libera toda a aquisição (regra 7) — 🧍
- **Antes da próxima run:** atualizar o texto da tarefa agendada `economizei-rotina-matinal` (ainda diz "Máquina 3.0 / WORKING TREE"; o regime desde 18/08 é ESTOQUE) — 🧍

**Uma frase por frente:** Código 🟡 (sólido e testado; 1 dependência com CVE alto) · Classificação 🟢 (invariantes de pé, corpus existe e é honesto sobre o que testa) · Firewall 🟡 (funciona; o rename foi fechado sem teste que o segure) · LGPD 🔴 (direito de eliminação quebrado + política afirmando controle que não existe) · Operação 🟡 (as rotinas rodam; os 3 indicadores continuam sem registro) · Negócio 🔴 (o produto vende 2 planos e 1 meio de pagamento que não existem) · Memória 🟢 (a melhor nota da auditoria: git e memória batem).

---

## 📋 Relatório completo

### 4.1. Código — 🟡

| Sev. | Achado | Evidência | Recomendação |
|---|---|---|---|
| 🔴 | **`sharp@0.34.5` com CVEs de alta severidade em libvips** (CVE-2026-33327/33328/35590/35591), e o `preprocessarImagem` (`src/gemini.js:334-341`) alimenta a lib com o buffer **cru** baixado do Z-API — imagem de qualquer pessoa que mande foto pro bot. | `npm audit --omit=dev` na cópia limpa: `sharp <0.35.0 · Severity: high`. Versão instalada confirmada: `node -e "require('sharp/package.json').version"` → `0.34.5`. | `npm audit fix --force` (sobe pra 0.35.3, breaking) + smoke de 1 cupom. `package.json` é zona humana. Enquanto não sobe, o risco é real mas de exposição baixa (poucos usuários). |
| 🟢 | `body-parser <1.20.6` (DoS por limite inválido) via Express 4.19. | mesmo `npm audit`: `1 low`. | Entra junto no `npm audit fix` (não-breaking). |
| 🟢 | Suíte: **604 testes**, dos quais 488 rodam neste ambiente e passam; 9 arquivos morrem com `SIGBUS` (dependência nativa do `sharp` — regra 11). | `node --test` em `/tmp/aud`: `pass 488 · fail 9`, todas com `signal: 'SIGBUS'`. Somei os testes dos 9 arquivos (`grep -cE "^\s*(test\|it)\("`): **116**. **488+116 = 604** — o número que a AGENDA declara bate exatamente. | Nenhuma. Registro de que o "604/604 verde" da sua máquina é uma afirmação verificável e verificada. |
| 🟢 | `node --check` limpo em todos os arquivos de `src/`; `check-pages` 0 erros; endpoints `/admin/*` e `/cron/*` são **fail-closed** (sem a env, 401). | `src/index.js:341-343, 362-364, 412-414`. | Nenhuma — é o padrão certo, e contrasta com o webhook (abaixo). |
| 🟡 | **`autenticarWebhook` é fail-open**: sem `ZAPI_WEBHOOK_TOKEN`, retorna `{ok:true, modo:'aberto'}` e o webhook aceita qualquer POST. Hoje a env está setada (rollout de 27/07), mas um redeploy sem ela reabre o endpoint em silêncio — o único sinal é a linha de log `webhook_sem_token_configurado`. | `src/index.js:198-205` e `:286`. | Decidir se vira fail-closed agora que o rollout terminou. É 1 linha; o risco de virar é derrubar o bot se a env sumir — que é exatamente o alarme que hoje falta. |

### 4.2. Classificação (o coração) — 🟢

- ✅ **Determinismo mantido:** `temperature: 0` + `responseMimeType: 'application/json'` (`src/gemini.js:365-371`).
- ✅ **Rede de segurança viva:** `reconciliarItens` (`:123`), `avaliarQualidadeCanonicoItem` (`:198`) e o log `canonico_suspeito` (`:292`) continuam no caminho principal.
- ✅ **Corpus existe e é honesto sobre o próprio alcance:** `test/classificacao-corpus.test.js` declara em cabeçalho que não testa o LLM (não-determinístico) e sim o **guarda de qualidade** do canônico — que é a peça que protege o matching do Alerta Pro. Corpus real de campo versionado em `test/corpus/` (3 PIX + 6 recibos de Vancouver).
- ⚠️ **Limite desta auditoria:** o `classificacao-corpus.test.js` é um dos 9 que dão `SIGBUS` aqui (importa `gemini.js` → `sharp`). **Não consegui executá-lo.** A afirmação "o corpus está verde" só pode ser confirmada na sua máquina — e é o teste mais importante do repositório. Sugestão barata: extrair `avaliarQualidadeCanonicoItem` para um módulo puro sem `require('sharp')`, e o corpus passa a rodar em qualquer ambiente (inclusive nas runs da máquina).
- 🟡 **A regra está sendo seguida na prática?** Sim — por construção. Desde 07/08 a fila fatia as tarefas por "toca `src/gemini.js`?", e as que tocam ficaram explicitamente com você presente (cod-0062, cod-0065, `coerceNumber`). Nenhum commit da janela auditada alterou o prompt ou a heurística de canônico.

### 4.3. Firewall financeiro — 🟡

| Sev. | Achado | Evidência |
|---|---|---|
| 🟢 | Selftest íntegro e advisory por design. | `node scripts/check-firewall.mjs --selftest` → **19/19 OK**; `--working` → *"FIREWALL OK"*, `EXIT=0`. |
| 🟡 | **O bypass por rename foi corrigido, mas não tem teste que o segure.** Os 4 `git diff` usam `--no-renames` (`:156, :159, :174, :175`), porém o selftest é 100% de string (`MONEY_PATTERNS`) e não toca git — se alguém tirar o flag num refactor, nada falha. | leitura + `grep -rn "rename" test/` → vazio. |
| 🟡 | **Limite estrutural do firewall, exposto pelos achados de negócio:** ele valida "tem source no `CLAUDE.md`?", não "existe no código?". Os planos Família têm source (§3 do CLAUDE.md) e passam limpo — mas não existem. O firewall não pega promessa **documentada e não construída**. | ver 4.6, achado N3. |
| 🟢 | `/assinar` e Mercado Pago fora do código (`4f49ae7`); `src/hotmart.js` nasce protegido na denylist; nenhum código de Stripe/Hotmart/Wise foi escrito antecipadamente. | `grep -rniE "hotmart\|stripe\|wise" src/` → só 1 comentário em `index.js:1155`. |
| 🟢 | Funções órfãs do MP seguem em `src/supabase.js` (`salvarAssinaturaPreapproval` etc., `:1417-1480`) — é a cod-0066, ainda na fila. Zero chamadores fora do arquivo. | `grep -nE "assinatura\|preapproval\|mp_" src/supabase.js`. |

### 4.4. Segurança de dados e LGPD — 🔴

#### 🔴 N1 · O `/apagar` aborta no meio e deixa a identidade do usuário no banco

**O que acontece.** `apagarDadosUsuario` (`src/supabase.js`) apaga em 6 passos com `if (error) throw error` em cada um. O passo 3 é `lembretes_enviados` — tabela que **nunca foi criada no Supabase** (diagnóstico de 05/08, confirmado pelo fato de o reengajamento jamais ter enviado uma mensagem; e a cod-0068 **removeu essa tabela das `CHECAGENS_CRITICAS`** do `schemaGuard`, silenciando o único alarme que ainda a mencionava). Resultado: PostgREST devolve `PGRST205`, a função lança, `mostrarApagar` (`src/index.js:1108-1114`) cai no catch e manda `montarApagarErro()`.

**Evidência de execução** (harness com o cliente Supabase simulado devolvendo `PGRST205` só para `lembretes_enviados`):

```
RESULTADO: LANÇOU -> PGRST205 Could not find the table 'public.lembretes_enviados'
Tabelas efetivamente tocadas, em ordem: compras -> indicacoes -> lembretes_enviados
`usuarios` foi apagada? NÃO
```

**Por que é o achado mais grave da auditoria:**

- É **destrutivo e parcial**: o usuário perde `compras` + `itens_compra` (irrecuperável), e mantém `usuarios`, `mensagens_processadas`, `resumos_mensais_enviados` — e, por dependerem do `ON DELETE CASCADE` de `usuarios`, também **`perguntas_log`** (texto cru das perguntas dele) e **`acompanhamentos`**.
- Contradiz um **compromisso publicado**: `docs/politica-de-privacidade.html:341` — *"`/apagar` — exclui todos os seus dados em até 48 horas"*.
- É o pior tipo de defeito do repertório deste projeto: **silencioso por construção**. Nenhum teste pega, porque `test/apagar.test.js` cobre só a parte pura (`interpretarApagar` + as 3 mensagens) — a I/O nunca é exercitada.

**Verificação que fecha o caso (30 seg, SQL Editor):** `select to_regclass('public.lembretes_enviados');` → `NULL` confirma.
**Conserto:** remover o passo 3 (o reengajamento foi desligado em 05/08 — a tabela não deve nascer só para isso) **ou** tolerar ausência com o mesmo `ehErroDeAusencia` que o `schemaGuard` já implementa. Junto: um teste de I/O com cliente injetado que asserte "`usuarios` é sempre a última e sempre acontece".

#### 🟡 N5 · A política de privacidade afirma um controle que não existe no código

`docs/politica-de-privacidade.html:~249`: *"O CPF eventualmente presente na imagem não é extraído nem armazenado — **nosso sistema instrui a IA a ignorá-lo**."*

O `PROMPT` de `src/gemini.js` **não menciona CPF em lugar nenhum** (`grep -rniE "\bcpf\b" src/` devolve só um comentário no `formatter.js:456`). O **resultado** afirmado se sustenta por outro motivo: `salvarCompra` mapeia campo a campo por lista branca, então nada fora do schema é persistido. Ou seja: a frase sobre o **efeito** é verdadeira; a frase sobre o **mecanismo** é falsa — num documento jurídico.

Agravante menor: `src/gemini.js:399` loga `texto.slice(0, 300)` da resposta crua quando o JSON falha — se o modelo ecoar o cupom, conteúdo bruto vai pro log do Railway (é o que a aud-03 já anotou como "2 logs de conteúdo bruto").

**Conserto:** ou ajustar a frase da política (10 min, zero risco), ou adicionar a instrução ao prompt — mas **isso é o coração**, exige o corpus de regressão e você presente.

#### 🟢 O que está certo (e vale registrar)

- Mascaramento consistente: nenhum `log(...)` com telefone cru; `maskPhone` em todos os pontos de PII.
- Imagem nunca persistida (buffer em memória); `perguntas_log` com TTL de 90 dias (`purgarPerguntasLog`) + cron diário.
- `precos_mercado` só recebe `tipo === 'mercado'` por **lista branca** desde a cod-0062b — o comprovante de PIX de amanhã não vaza pra base de preços.
- RLS ligado em 18/08 (S4) — a exposição via anon key acabou. **Ressalva honesta:** a verificação anti-vazamento (o `curl` com a anon key) **ainda não foi feita**, então "está fechado" hoje é a conclusão de quem rodou o script, não uma medição.

### 4.5. Operação (as 3 áreas reais) — 🟡

| Área | Rotina prometida | O que existe de fato |
|---|---|---|
| **Produto** | logs 1×/sem, uptime, custo Gemini | Automação: cron de health-check Z-API às 8h com aviso no WhatsApp (`scheduler.js:103`) — funciona, o `ADMIN_PHONE` já provou receber. Custo Gemini: **nenhum registro em lugar nenhum do repositório** (é a aud-02, aberta desde 07-10). |
| **Distribuição** | analytics 1×/sem, 3 posts/sem, 1 conversa/sem | Nenhum artefato. `marketing/` não é tocado desde 17/06. Zero evidência de post ou conversa registrada. Coerente com a decisão de 09/07 (janela de construção até out/2026) — mas então o indicador "cadastros/semana" está oficialmente parado, e vale dizer isso na memória em vez de manter a rotina como se rodasse. |
| **Caixa** | somar custos 1×/sem, horas, unit economics | Nenhuma planilha, nenhum arquivo de custo. O digest de sexta (`weeklyDigest.js`) manda cadastros + uptime pro seu WhatsApp — **sem deixar registro** e dependendo de `UPTIMEROBOT_API_KEY` (não verificável daqui). |

- 🟢 **As 5 tarefas agendadas estão ativas e rodando** (`list_scheduled_tasks`): matinal (última 22/08), painel (17/08), sentinela (17/08 — a de hoje, domingo, roda à noite), checkpoint mensal (01/08), lembrete de sexta (22/08).
- 🟡 **O prompt da `economizei-rotina-matinal` está desatualizado**: a descrição diz *"Máquina 3.0, entrega em WORKING TREE"*, e o regime desde 18/08 é **ESTOQUE** (regra 3 da §11). A run de 22/08 fez o certo **porque o modelo escolheu a regra mais recente** e registrou o conflito no próprio relatório. É sorte estrutural: uma run pode seguir o prompt e voltar a sujar `src/` — o acoplamento que custou 6 e 8 dias.
- 🟢 `PAINEL.html` agora é rastreado pelo git (a pendência #5 de julho fechou), mas o conteúdo está velho (última run 17/08 — ainda descreve a cod-0073 como "em revisão", entregue em 20/08).

### 4.6. Negócio e estratégia — 🔴

#### 🔴 N3 · Os planos Família e Família+ não existem no código

`grep -rniE "familia|membro|consolidad"` em `src/` devolve **zero** ocorrências de funcionalidade (só o comentário de roteamento em `index.js:488` e "métricas consolidadas" do `/admin/metrics`). Não há tabela de grupo, vínculo entre telefones, visão consolidada nem comparação por membro.

Enquanto isso: `montarMensagemPlanos()` (`src/formatter.js`) vende **"👨‍👩‍👧 Família — R$15/mês (até 3 pessoas) · Visão consolidada da família · Comparação de gastos por membro"** e **"Família+ — R$22/mês (até 5 pessoas)"**; a landing (`landing/index.html:2268`) vende os mesmos planos no anual (R$150 / R$220). O pagamento é **PIX manual** com ativação sua — ou seja, o caminho de alguém pagar R$220 por algo inexistente está aberto e depende só de o usuário pedir.

**Recomendação:** decidir entre (a) tirar os dois planos da copy até existirem, (b) marcá-los como "em breve" explicitamente, ou (c) construir o vínculo familiar. Menos custoso: (a). Ele não custa conversão real — não há tráfego pago rodando até out/2026.

#### 🔴 N4 · A landing vende um meio de pagamento aposentado

- `landing/index.html:2183`: *"O **cartão recorrente** (Mercado Pago) **está sendo ativado**."* — pior que uma sobra: é uma promessa **futura** de um trilho que foi **desativado** em 27/07 (`4f49ae7`). Quem lê entende que o cartão chega em dias.
- `:2037` e as 3 metatags (`:9`, `:13`, `:22`): *"paga no PIX ou cartão"*.

O `/pix` do bot foi corrigido pela cod-0067 no mesmo dia; **a landing não entrou no escopo**. A regra 2 da §11 e o `financial-firewall` existem exatamente para isto: copy pública com promessa que o produto não cumpre.

#### 🟡 B9 · `/planos` ainda promete "alerta inteligente (preditivo + categorizado)"

O preditivo é a cod-0049, não construída. Achado do Checkpoint de 01/08, **ainda aberto**. Encolheu de falso para *parcialmente* falso com a entrega das cod-0033/0035 — o "categorizado por tipo de item" hoje é verdade.

#### 🟡 cod-0075 · a memória descreve o defeito ao contrário

AGENDA e CLAUDE.md dizem que sem a cod-0075 *"o Pro segue destravado ao perguntar em texto livre"* — e a rotina de 21/08 devolveu a tarefa dizendo que a premissa não se sustenta. **Ela não se sustenta mesmo, mas existe um defeito real, e é o oposto:** `src/agent/intents.js:596` usa `COMPARATIVO_AMOSTRAS_FREE` (3) para **todo mundo**. Quem paga R$9,90 vê 10 comparativos no `/comparar` (cod-0073) e **3** ao perguntar "onde tá mais barato" — o assinante é rebaixado ao nível Free no caminho mais natural do produto. O Free, por sua vez, não recebe upsell nenhum ali. O código já tem o gancho pronto (`deps.maxComparativos`, `:594`) — o wiring é 1 linha no chamador.

#### 🟡 Coerência de preço entre canais

Landing: anual em destaque (R$99/R$150/R$220), "2 meses grátis". Bot `/planos`: **só mensal**, PIX. Quem chega pela landing convencido do anual e cai no WhatsApp não encontra o produto que viu. Conhecido e conscientemente adiado (pricing anual no `formatter.js` depende de Hotmart → empresa BC → out/2026) — mas então a landing está vendendo hoje uma oferta que só existe daqui a dois meses.

#### 🟢 Regras respeitadas

- **Regra 7 (W2 ≥ 30%):** nenhum indício de contorno — nenhuma config de ads, pixel ou campanha no repositório.
- **Regra 5 (zero benefício ao Beta):** nenhuma promessa de "3 meses grátis"/"preço travado" na copy do bot, landing ou docs. Sobrevive só em comentário (ver 🟢 A10 abaixo).
- **Regra 4 (gíria só em marketing):** uma única ocorrência de "tá" na copy do bot (`formatter.js:647`, dentro do `/planos`). 🟢 — corrigir quando tocar a linha.
- **Limite Free = 10 cupons** confere com o CLAUDE.md (`src/supabase.js:357`).

### 4.7. Consistência da memória institucional — 🟢 (a melhor nota desta auditoria)

- ✅ **24 hashes citados na memória, 24 existem e batem com o conteúdo declarado.** Conferi um a um com `git log -1 --format="%ci %s"` (apêndice). Isto era 🔴 recorrente em auditorias anteriores ("AGENDA stale") e hoje não é mais.
- ✅ **O estoque não mente:** `node scripts/estoque.mjs status` → *"Estoque íntegro — sintaxe OK, zona proibida limpa, cadeia preservada"*, 1 leva (~457 linhas), coerente com a tabela da AGENDA.
- ✅ **Números verificáveis batem** (604 testes, 19/19 selftest).
- 🟢 **Drift cosmético de sempre:** AGENDA e CLAUDE.md dizem `origin/main = 7f38bbf`; o real é `2082cca` (o próprio commit de reconciliação seguinte). É o mesmo drift que a sentinela de 16/08 registrou. Inofensivo, mas é o padrão que já produziu decisão errada — resolve-se com o `/entregar` gravando o hash depois do último push, não antes.
- 🟡 **Uma contradição viva:** o prompt da tarefa agendada (fonte que a máquina obedece toda manhã) contradiz a regra 3 da §11 (fonte que governa). Ver 4.5.
- 🟢 `CODE_GUIDE.md` × código: nenhuma contradição encontrada nos padrões declarados (deps injetáveis no agente, lazy-require, `safeParse`, logs mascarados, um só cliente HTTP). A "Última atualização" do arquivo está em 24/07 — atrasada em relação às decisões de agosto, mas nada do que ele afirma ficou falso.

---

## 📌 Pendências conhecidas — status re-verificado

| # | Pendência | Origem | Status | Evidência |
|---|---|---|---|---|
| 1 | Firewall: 8 lacunas + bypass por rename | Aud. 07-10 | ⚠️ **parcial** | Patch aplicado (`27fcc16`), `--no-renames` presente nos 4 diffs, selftest 19/19 — **sem teste de regressão do rename**. |
| 2 | `/assinar` gera checkout MP | Aud. 07-10 | ✅ **resolvida** no código (`4f49ae7`) · ❌ **aberta na landing** (achado N4). |  |
| 3 | Webhook Hotmart → `/admin/ativar-pro` | CLAUDE §3 | ❌ **aberta, e corretamente não iniciada** | `grep hotmart src/` → 1 comentário. Bloqueada pela empresa BC (out/2026). |
| 4 | `perguntas_log` inexistente bloqueando Leva 2 | Dec. 07-15 | ✅ **resolvida** | Migration do agente rodada em 07-09; tabela está nas `CHECAGENS_CRITICAS`; cod-0043/0044/0048 entregues. |
| 5 | `PAINEL.html` untracked | Dec. 07-15 | ✅ **resolvida** | `git ls-files PAINEL.html` → rastreado. (Conteúdo desatualizado — 🟢.) |
| 6 | Migrations A4/A9 | Dec. 06-30 | ✅ **resolvida** (07-09), sem regressão: `schemaGuard` cobre `compras.cnpj` e `resumos_mensais_enviados`. |  |
| 7 | Z-API → Meta Cloud API | CLAUDE §4 | ✅ **sem trabalho prematuro** | `grep -rniE "graph.facebook\|cloud api"` → vazio. Nenhum dos 3 gatilhos atingido. |
| 8 | Gate de skills declarado nas tarefas | Dec. 06-25 | ✅ **cumprido** | Todas as entradas recentes do "Concluído" trazem `(skills: ...)`. |
| S1 | `lembretes_enviados` nunca criada | AGENDA | ⚠️ **"cancelada" — mas voltou como o 🔴 nº1 desta auditoria.** Cancelar a criação da tabela foi certo; ninguém removeu a **dependência** que o `/apagar` tem dela. |  |
| S2 | `SUPABASE_SERVICE_ROLE_KEY` | AGENDA | ⚠️ **provavelmente ok, ainda não provada** | Env setada (print 07/08); a prova de estado (decodificar o JWT e ler `role`) segue pendente. Se o RLS ligou em 18/08 e o bot continua respondendo, é prova retroativa — mas ninguém registrou esse teste. |
| S3 | RPC `incrementar_compras_mes` | Aud. §3.3 | ❌ **aberta** | Sentinela `incremento_fallback` está no código desde 24/07; basta procurar nos logs do Railway. |
| S4 | Ligar o RLS | AGENDA | ✅ **feita em 18/08** · ⚠️ verificação anti-vazamento (`curl` com anon key) ainda não. |  |
| S5 | Views de métricas não existem | AGENDA (07/08) | ❌ **aberta — e mais grave do que "dívida cosmética"** | `src/metrics.js:26-62` lê `v_dashboard`, `v_retencao_w2`, `v_cupons_por_mes`, `v_funil_conversao`; `weeklyDigest.js:66-67` depende das 2 primeiras. **Sem elas, a W2 — o gate da regra 7 — não é mensurável**, e o digest degrada em silêncio (`.catch(err => ({erro}))`). |
| B7 | `.env.example` desalinhado | Checkpoint 01/08 | ❌ **aberta, e pior que o registrado** | Faltam **5** envs vivas (`AGENTE_MODO`, `AGENTE_MODELO`, `LIMITE_PERGUNTAS_FREE`, `COMPARATIVO_AMOSTRAS_FREE`, `COMPARATIVO_MAX_PRO`); sobram as 4 mortas do MP; `ZAPI_WEBHOOK_TOKEN` foi colado no fim do arquivo sem seção nem quebra de linha. |
| B9 | `/planos` promete "preditivo" | Checkpoint 01/08 | ❌ **aberta** (ver 4.6). |  |
| B10 | Gate Pro nunca ligado | Checkpoint 01/08 | ⚠️ **parcial** | cod-0073 (`/comparar`) e cod-0074 (Alerta Pro) entregues; **cod-0075 aberta** — e o diagnóstico dela na memória está invertido (ver 4.6). |
| A10 | Comentário `beta_fundador` no `schema.sql` | Aud. 06-25 | ❌ **aberta** | `supabase/schema.sql:23` ainda diz *"garante 3 meses grátis + preço travado"* — contradiz a regra 5. A coluna nasce `DEFAULT TRUE` para todo usuário novo. |
| cod-0066 | Funções MP órfãs | AGENDA | ❌ **aberta** (na fila, `pronta`). |  |
| — | Migration PIX + DROP MP no Supabase | AGENDA | ❌ **abertas** — a migration PIX segue sendo o que destrava a cod-0062. |  |

---

## 🆕 Achados novos (não cobertos por auditoria anterior)

| # | Sev. | Achado | Onde |
|---|---|---|---|
| **N1** | 🔴 | `/apagar` aborta em `lembretes_enviados` e nunca apaga `usuarios` → exclusão parcial + PII retida + promessa pública descumprida. | `src/supabase.js` (`apagarDadosUsuario`), §4.4 |
| **N2** | 🔴 | `sharp@0.34.5` com 4 CVEs de alta severidade processando imagem não-confiável de terceiros. | `package.json` / `src/gemini.js:334`, §4.1 |
| **N3** | 🔴 | Planos Família e Família+ vendidos no bot e na landing sem nenhuma linha de implementação. | `src/formatter.js` / `landing/index.html:2268`, §4.6 |
| **N4** | 🔴 | Landing ainda vende "cartão" e cita "Mercado Pago", 4 semanas após a remoção. | `landing/index.html:9,13,22,2037,2183`, §4.6 |
| **N5** | 🟡 | Política de privacidade afirma que o sistema instrui a IA a ignorar o CPF — o prompt não menciona CPF. | `docs/politica-de-privacidade.html` × `src/gemini.js` PROMPT, §4.4 |
| **N6** | 🟡 | S5 tem consequência estratégica não registrada: sem as views, **a W2 não é mensurável** — e ela é o gate de toda a aquisição. | `src/metrics.js`, `src/weeklyDigest.js`, §4.5 |
| **N7** | 🟡 | O prompt da tarefa agendada contradiz a regra 3 da §11 (WORKING TREE × ESTOQUE); a run de 22/08 acertou por escolha do modelo, não por instrução. | tarefa `economizei-rotina-matinal`, §4.5 |
| **N8** | 🟡 | cod-0075: o defeito real é o **Pro rebaixado ao teto Free** no agente, não "Free destravado". A memória descreve ao contrário. | `src/agent/intents.js:596`, §4.6 |
| **N9** | 🟡 | O bypass por rename foi fechado sem teste de regressão. | `scripts/check-firewall.mjs`, §4.3 |
| **N10** | 🟢 | O corpus da classificação — o teste mais importante do repo — não roda em nenhum ambiente sem `sharp` funcional, incluindo as runs da máquina. | `test/classificacao-corpus.test.js`, §4.2 |

> **Um padrão atravessa N1, N3, N4, N5 e B9:** todos são **promessa sem entrega** — o produto (ou um documento público) afirma algo que o código não faz. É exatamente o inverso do padrão que dominava as auditorias anteriores ("código pronto que a memória não registrou"). O gargalo mudou de lado: de *consumir o que foi produzido* para *verificar o que foi prometido*.

---

## 🧾 Apêndice — comandos executados

```bash
# Ambiente: cópia limpa em /tmp/aud (regra 11), Node v22.23.2
node --test "test/**/*.test.js"          # pass 488 · fail 9 (todas SIGBUS/sharp) · 488+116 = 604
node --check <cada arquivo de src/>      # sem erro
npm audit --omit=dev                     # sharp <0.35.0 HIGH · body-parser <1.20.6 LOW
node scripts/check-firewall.mjs --selftest   # 19/19 OK
node scripts/check-firewall.mjs --working    # FIREWALL OK · EXIT=0
node scripts/check-pages.mjs             # 5 páginas · 0 erros · 20 avisos (rotas Vercel)
node scripts/estoque.mjs status          # 1 leva · ~457 linhas · cadeia preservada
node probe-apagar.js                     # ver §4.4 — prova do /apagar
GIT_OPTIONAL_LOCKS=0 git log -1 --format="%ci %s" <24 hashes>   # 24/24 existem e batem
mcp scheduled-tasks list                 # 5 tarefas, todas enabled
grep -rniE "familia|membro|consolidad" src/          # zero implementação
grep -rniE "\bcpf\b" src/                            # 1 comentário, nenhuma instrução no prompt
grep -rniE "hotmart|stripe|wise" src/                # 1 comentário
grep -rniE "graph.facebook|cloud api" src/           # vazio
```

**Limites honestos desta auditoria (o que NÃO foi verificado):**

1. **Nada foi verificado no banco.** Todo achado sobre Supabase (existência de `lembretes_enviados`, das views, da RPC, do RLS efetivo, da `service_role` em uso) é inferência a partir de código + memória, com o comando de verificação indicado em cada caso.
2. **9 arquivos de teste não rodam neste ambiente** (`SIGBUS`/`sharp`), incluindo o corpus da classificação e os 3 de webhook.
3. **Nenhum dado real de uso** (cupons, custo Gemini, logs do Railway, retenção) — são as aud-01..04, que continuam dependendo de material só seu.
4. **Nenhuma chamada a endpoint financeiro** foi feita, nem simulada contra produção.
