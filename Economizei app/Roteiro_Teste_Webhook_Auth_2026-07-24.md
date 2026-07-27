# 🧪 Roteiro de teste — Webhook + saúde do pipeline (cod-0053)

> **Pra que serve:** você manda um cupom de verdade pro bot e este roteiro te diz, passo a passo, **o que esperar** — nos logs do Railway e nas queries do Supabase. Serve pra duas coisas ao mesmo tempo:
> 1. **Confirmar a saúde do código** (o cupom entra, é lido, gravado e o contador incrementa) — inclusive se a RPC `incrementar_compras_mes` existe em produção (o elo com a §3.3).
> 2. **Ligar a autenticação do webhook (cod-0053) SEM derrubar o bot** — na ordem certa, com um teste de 401 no fim.
>
> **Regra de ouro:** faça uma FASE por vez, de cima pra baixo. Não pule pra Fase 3 antes da Fase 1 dar verde.
>
> Legenda de onde rodar: `[WhatsApp]` no seu celular · `[Railway → Deployments/Logs]` · `[Supabase → SQL Editor]` · `[terminal em C:\Economizei]`.

---

## 0. Antes de começar — o número de teste

Use o **seu próprio número** de WhatsApp como cobaia (o que você usa pra testar o bot). Nas queries abaixo, onde estiver `SEU_NUMERO`, troque pelo número no formato internacional **sem `+` e sem espaços/traços** — do jeito que o Z-API entrega. Exemplo: `5517999998888`.

> Pra descobrir exatamente como seu número está gravado: `[Supabase → SQL Editor]`
> ```sql
> SELECT phone_number, is_pro, compras_mes_atual, mes_referencia, onboarding_step, criado_em
> FROM usuarios
> ORDER BY criado_em DESC
> LIMIT 10;
> ```
> Ache a sua linha e copie o `phone_number` exato.

---

## FASE 1 — Saúde do pipeline (ainda em modo aberto, sem token)

Hoje o `ZAPI_WEBHOOK_TOKEN` **ainda não está setado**, então o webhook roda em **modo aberto** (aceita e processa normal). Essa fase valida que o cupom flui de ponta a ponta ANTES de mexer na autenticação.

### 1.1 — Deixe o log aberto
`[Railway → seu serviço → Logs]` — deixe a aba de logs aberta e visível. Você vai acompanhar em tempo real.

### 1.2 — Mande um cupom bom
`[WhatsApp]` — mande pro bot **uma foto nítida de um cupom fiscal de mercado** (bem iluminada, cupom esticado). Se o seu número for novo/zerado e cair no onboarding, mande um "oi" antes, siga as boas-vindas, e só então mande a foto.

### 1.3 — O que esperar nos LOGS (na ordem)
`[Railway → Logs]` — você deve ver, em sequência, algo como:

| Ordem | Evento no log | O que significa |
|---|---|---|
| 1 | `webhook_sem_token_configurado` | ✅ Esperado por enquanto — confirma que está em **modo aberto** (o token ainda não foi setado). Vai sumir na Fase 3. |
| 2 | `webhook_recebido` → `{ tipo: 'imagem' }` | O payload chegou e foi reconhecido como imagem. |
| 3 | `cupom_iniciando` | Passou pelo onboarding + limite Free; começou a baixar e ler. |
| 4 | `cupom_registrado` → `{ loja, total }` | ✅ **O ouro.** O cupom foi lido, gravado e o contador incrementado. |

**Sinais de atenção (se aparecerem):**
- 🔴 `incremento_fallback` → **A RPC `incrementar_compras_mes` NÃO existe em produção.** O cupom até salva, mas o contador vira read-then-write racy. É exatamente o que a query da §3.3 confirma — se vir isto, rode a query de schema e crie a RPC. **Este é o teste mais valioso do roteiro.**
- 🟡 `cupom_sucesso_parcial` → leu o cupom mas não extraiu itens (só o total). Aceitável; a foto pode estar cortada na lista de itens.
- 🟡 `cupom_erro_leitura` → não conseguiu ler (borrado/não é cupom). O bot te responde pedindo pra reenviar. Tente outra foto.
- 🟡 `alerta_disparado` → normal se a compra ficou acima da sua média; é a feature de alerta funcionando.

### 1.4 — O que esperar no WHATSAPP
`[WhatsApp]` — o bot deve responder com o resumo do cupom (loja, total, gastos do mês). Se veio o resumo, o "último metro" com o usuário está de pé.

### 1.5 — Confirmar a gravação no banco
`[Supabase → SQL Editor]` — rode os 3 blocos e compare:

**(a) O contador do usuário subiu?**
```sql
SELECT phone_number, compras_mes_atual, mes_referencia
FROM usuarios
WHERE phone_number = 'SEU_NUMERO';
```
*Esperado:* `compras_mes_atual` = 1 a mais do que antes do teste; `mes_referencia` no mês atual (ex: `2026-07`).

**(b) A compra foi salva?**
```sql
SELECT id, loja, total, data_compra, tipo, cnpj, criado_em
FROM compras
WHERE phone_number = 'SEU_NUMERO'
ORDER BY criado_em DESC
LIMIT 1;
```
*Esperado:* 1 linha com a loja e o total que o bot te respondeu. Copie o `id` pro próximo bloco.

**(c) Os itens foram classificados?** (o coração do produto)
```sql
SELECT nome, nome_canonico, categoria, preco, preco_total, quantidade
FROM itens_compra
WHERE compra_id = 'COLE_O_ID_DA_COMPRA_AQUI'
ORDER BY nome;
```
*Esperado:* uma linha por item do cupom, com `categoria` e `nome_canonico` preenchidos (não nulos) na maioria. Nulo esporádico é tolerável; **tudo nulo** é sinal de que a classificação regrediu — me avise se acontecer.

> ✅ **Fim da Fase 1.** Se o contador subiu, a compra e os itens estão lá, e **não** apareceu `incremento_fallback`, o pipeline está saudável. Pode ir pra Fase 2.
> Se apareceu `incremento_fallback`, **pare aqui** e rode a query de schema da §3.3 (te passei os blocos no chat) — precisa criar a RPC antes de seguir.

---

## FASE 2 — Ligar a autenticação, na ordem que não derruba o bot

O código da auth já está no ar (commit `6cadcb8`). O truque do rollout sem downtime é: **reconfigurar o Z-API pra mandar o token ANTES de exigir o token**. Enquanto a env não existe, o token no path é só ignorado — então dá pra preparar o Z-API com calma.

### 2.1 — Confirme que o código novo está deployado
`[Railway → Deployments]` — confirme que o último deploy verde inclui o commit `6cadcb8` (ou mais novo). O sinal prático já veio na Fase 1: o log `webhook_sem_token_configurado` só existe no código novo — se você o viu, o deploy está no ar.

### 2.2 — Gere um token secreto
`[terminal em C:\Economizei]`
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie a string de 64 caracteres que sair. Ela é o seu `ZAPI_WEBHOOK_TOKEN`. **Guarde num lugar seguro** — você vai usá-la em dois lugares (Z-API e Railway).

### 2.3 — Reconfigure a URL do webhook no Z-API **(faça este ANTES do Railway)**
`[Painel do Z-API → sua instância → Webhooks]` — troque a URL que hoje é
```
https://SEU-APP.up.railway.app/webhook
```
por (colando o token no fim do caminho):
```
https://SEU-APP.up.railway.app/webhook/COLE_O_TOKEN_AQUI
```
Salve. **Nada quebra agora**, porque a env ainda não existe → o servidor continua em modo aberto e ignora o token no caminho.

### 2.4 — Teste rápido: ainda funciona?
`[WhatsApp]` — mande outro cupom (ou um "oi"). Deve responder normal, e o log ainda mostra `webhook_sem_token_configurado`. ✅ Confirma que o Z-API novo está entregando certo.

---

## FASE 3 — Fechar a porta (exigir o token) e provar que fechou

### 3.1 — Setar a env no Railway
`[Railway → seu serviço → Variables]` — adicione:
```
ZAPI_WEBHOOK_TOKEN = <o mesmo token de 64 caracteres da Fase 2.2>
```
Salve. O Railway vai redeployar sozinho (~1–2 min). A partir daqui o webhook está em **modo fechado (fail-closed)**.

### 3.2 — Provar que o caminho legítimo (com token) funciona
`[WhatsApp]` — mande um cupom.
`[Railway → Logs]` — esperado agora:
- ✅ **NÃO** aparece mais `webhook_sem_token_configurado` (sumiu = modo fechado ativo).
- ✅ Aparece `webhook_recebido` → `cupom_iniciando` → `cupom_registrado` normalmente.
- ✅ O bot te responde no WhatsApp como sempre.

Se o bot **parou de responder** depois de setar a env, é quase certo que o Z-API não está mandando o token certo → volte à Fase 2.3 e confira se a URL tem exatamente o mesmo token (sem espaço, sem `/` sobrando no fim).

### 3.3 — Provar que a porta fechou pra intruso (o teste do 401)
`[terminal em C:\Economizei]` — simule um atacante batendo no `/webhook` **sem** token:
```bash
curl -i -X POST https://SEU-APP.up.railway.app/webhook \
  -H "content-type: application/json" \
  -d "{}"
```
*Esperado:* a **primeira linha** da resposta é `HTTP/1.1 401 Unauthorized` e o corpo é `{"erro":"unauthorized"}`.
`[Railway → Logs]` — deve registrar `webhook_token_invalido` → `{ veio_no_path: false }`.

Agora prove que **com** o token passa (não custa Gemini — o corpo `{}` é rejeitado por payload inválido, sem chamar a IA):
```bash
curl -i -X POST https://SEU-APP.up.railway.app/webhook/COLE_O_TOKEN_AQUI \
  -H "content-type: application/json" \
  -d "{}"
```
*Esperado:* primeira linha `HTTP/1.1 200 OK`. Nos logs, `payload_invalido` (esperado — corpo vazio), **sem** `webhook_token_invalido`.

> ✅ **Fim.** Se o 401 apareceu sem token e o 200 apareceu com token, a autenticação está ativa e o problema #1 da auditoria está fechado de verdade — não só no código, mas em produção.

---

## 📋 Checklist rápido (marque conforme faz)

- [ ] Fase 1: cupom respondido no WhatsApp
- [ ] Fase 1: logs `webhook_recebido` → `cupom_iniciando` → `cupom_registrado`
- [ ] Fase 1: **`incremento_fallback` NÃO apareceu** (senão → rodar query §3.3)
- [ ] Fase 1: SQL confirma `compras_mes_atual` +1, linha em `compras`, itens classificados
- [ ] Fase 2: token gerado e guardado
- [ ] Fase 2: Z-API reconfigurado pra `/webhook/<token>` (ANTES do Railway)
- [ ] Fase 2: bot ainda responde (modo aberto, token ignorado)
- [ ] Fase 3: env `ZAPI_WEBHOOK_TOKEN` setada no Railway
- [ ] Fase 3: bot responde normal + `webhook_sem_token_configurado` sumiu
- [ ] Fase 3: `curl` sem token → **401**; `curl` com token → **200**

---

## 🆘 Se algo der errado

| Sintoma | Provável causa | O que fazer |
|---|---|---|
| Bot não responde depois da Fase 3 | Z-API mandando sem token / token diferente | Confira a URL no Z-API (Fase 2.3). Em emergência: **remova a env `ZAPI_WEBHOOK_TOKEN`** no Railway → volta ao modo aberto na hora, sem downtime. |
| `incremento_fallback` nos logs | RPC `incrementar_compras_mes` ausente em produção | Rode a query de schema (§3.3) e crie a RPC pelo bloco do `schema.sql`. |
| `curl` sem token retorna 200 (devia ser 401) | Env não aplicou ainda / deploy não terminou | Espere o redeploy do Railway terminar e teste de novo. |
| Itens todos com `categoria`/`nome_canonico` nulos | Possível regressão da classificação | Me avise — é o coração do produto; a gente investiga antes de qualquer outra coisa. |

*Roteiro gerado em 2026-07-24. Só teste e verificação — não altera código nem toca em pagamento.*
