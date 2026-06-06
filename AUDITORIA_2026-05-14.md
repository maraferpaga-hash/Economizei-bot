# 🔍 Auditoria de Código + Sessão de Debug — Economizei Bot

**Data:** 2026-05-14
**Escopo:** `src/` (7 arquivos), `package.json`, `.env.example`, `README.md`, `.gitignore`
**Método:** Leitura completa + análise estática + simulação de cenários (sandbox de execução indisponível nesta sessão, então o debug foi feito por *tracing* manual dos fluxos).

---

## 🎯 TL;DR — Priorização

| Prioridade | Quantidade | O que é |
|---|---|---|
| 🔴 **Crítico** (corrigir antes do beta soft) | 5 | Bug na detecção de comandos, validação fraca do retorno do Gemini, parser sem strip de markdown, `enviarMensagem` engole erros, `qtdComprasMes` com fallback errado |
| 🟡 **Médio** (corrigir nas primeiras 2 semanas) | 8 | Race conditions no contador, dupla chamada de `upsertUsuario`, mensagem de onboarding redundante, `calcularMedia` inclui compra atual, timeout faltando em `enviarMensagem`, etc. |
| 🟢 **Polish** (limpeza, nice-to-have) | ~15 | Logger inconsistente, código morto (`buscarStatusUsuario`), ponto-e-vírgula, snake_case isolado, etc. |

**Recomendação:** atacar os 5 críticos hoje (≈1h de trabalho). Eles afetam diretamente a experiência do usuário e a qualidade do produto no beta.

---

## 🔴 CRÍTICOS

### C1. Detecção de comandos por `includes()` — falsos positivos garantidos
**Arquivo:** `src/index.js`, linhas 207–222

```js
const msg = (texto || '').toLowerCase();
if (msg.includes('historico') || msg.includes('/historico') || msg.includes('/resumo')) {
  await mostrarHistorico(phone);
} else if (
  msg.includes('oi') ||
  msg.includes('ola') ||
  msg.includes('olá') ||
  msg.includes('ajuda') ||
  msg.includes('/ajuda') ||
  msg.includes('start')
) {
  await enviarMensagem(phone, montarMensagemBemVindo());
}
```

**Problemas reais:**
- `"Hoje fui no mercado"` → contém `oi`? Não (procurando substring exata "oi" em "hoje fui..."). Hmm, deixa eu checar... `"hoje"` contém `"oi"`? Não. `"foi"` contém `"oi"`? **SIM.** Logo `"hoje fui ao mercado"` casa `oi` → resposta de boas-vindas.
- `"olá tudo bem"` → casa `ola`? Não, `"olá"` tem acento. Mas se usuário digita `"ola"` sem acento, casa. Inconsistente.
- `"reiniciar"` ou `"estar"` → casa `start` por causa de `"star"` em `"estar"`. **Bug.**
- `"escola"` → casa `ola`. **Bug.**
- `"história"` → casa `historico`? Não, `"história"` ≠ `"historico"`. OK.
- `"viola"` → casa `ola`. Bug.

**Fix recomendado:** comparar com regex word-boundary ou exato após trim.
```js
const msg = (texto || '').trim().toLowerCase();
const palavras = msg.split(/\s+/);
const ehComando = (cmd) => palavras.includes(cmd) || msg === cmd;

if (['historico', '/historico', '/resumo', 'resumo'].some(ehComando)) { ... }
else if (['oi', 'ola', 'olá', 'ajuda', '/ajuda', 'start', 'menu'].some(ehComando)) { ... }
```

---

### C2. Gemini parser não remove markdown fence (` ```json `)
**Arquivo:** `src/gemini.js`, linhas 51–59

O prompt pede "SOMENTE um JSON válido, sem markdown" mas Gemini 2.5 Flash, na prática, **às vezes envolve em ```json ... ``` mesmo assim**. Quando isso acontece, `JSON.parse` falha e o usuário recebe "Erro interno ao ler imagem" — mesmo o cupom tendo sido lido com sucesso.

**Fix:**
```js
let texto = result.response.text().trim();
// Remove markdown fence se vier
texto = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
let dados;
try { dados = JSON.parse(texto); } catch { ... }
```

---

### C3. Validação do retorno do Gemini é frágil — `sucesso: true` sem `total`/`loja` quebra a mensagem
**Arquivo:** `src/gemini.js` (validação) + `src/formatter.js` (consumidor)

Se o Gemini retornar `{ sucesso: true, loja: "Carrefour" }` sem `total`, o `formatter.brl(undefined)` retorna `"NaN"` e a mensagem vai com `R$ NaN`. Pior: se retornar `total: "99,90"` (string com vírgula em vez de número), `Number("99,90")` = `NaN` também.

**Fix em `gemini.js`:**
```js
if (dados.sucesso === true) {
  if (typeof dados.total !== 'number' || isNaN(dados.total) || dados.total <= 0) {
    return { sucesso: false, motivo: 'Cupom ilegível (não consegui ler o total)' };
  }
  if (!dados.loja || typeof dados.loja !== 'string') dados.loja = 'Mercado';
  if (!Array.isArray(dados.itens)) dados.itens = [];
}
```

---

### C4. `enviarMensagem` engole erros silenciosamente — usuário pode não receber resposta sem o sistema saber
**Arquivo:** `src/zapi.js`, linhas 4–24

```js
} catch(err) {
  log('zapi_erro', { ... });
  // não relança nem retorna nada — função retorna undefined no erro
}
```

O `processarImagem` faz `await enviarMensagem(...)` esperando que o try/catch externo capture falhas. Como o erro é engolido, o catch externo **nunca dispara por falha de envio**. Isso significa: se o Z-API estiver fora do ar, o usuário fica sem resposta e o sistema acha que tudo deu certo (`cupom_registrado` é logado mesmo sem a mensagem ter chegado).

Além disso: **sem timeout no axios** (contraste com `baixarImagem` que tem 15s). Uma chamada travada pode bloquear o handler.

**Fix:**
```js
async function enviarMensagem(phone, texto) {
  const url = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;
  try {
    const response = await axios.post(
      url,
      { phone, message: texto },
      {
        headers: { 'Content-Type': 'application/json', 'Client-Token': process.env.ZAPI_CLIENT_TOKEN },
        timeout: 15_000,
      }
    );
    log('zapi_enviou', { status: response.status });
    return response.data;
  } catch (err) {
    log('zapi_erro', { status: err.response?.status, url: err.config?.url, data: err.response?.data, erro: err.message });
    throw new Error('Falha ao enviar mensagem WhatsApp');
  }
}
```

---

### C5. `qtdComprasMes` com fallback enganoso
**Arquivo:** `src/index.js`, linha 272

```js
qtdComprasMes: usuarioAtualizado.compras_mes_atual ?? historico.compras.length
```

`historico.compras` veio de `buscarHistorico(phone, 1)` — limite 1, então `compras.length` é sempre **1**. Se `compras_mes_atual` estiver null (usuário antigo, RPC nunca rodou), a mensagem mostra "em 1 compra(s)" mesmo o usuário tendo 5.

**Fix:** usar o totalMes/total como contagem (mas exigiria contar compras do mês, não somar) — ou garantir que `compras_mes_atual` nunca seja null (default 0 na tabela do Supabase). A solução mais limpa:

```js
const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
// adicionar query .count() no buscarHistorico, ou trust no contador
qtdComprasMes: usuarioAtualizado.compras_mes_atual ?? 0
```

Se cair no fallback `?? 0`, o display mostra "0 compra(s)" o que é menos confuso e dá sinal de bug.

---

## 🟡 MÉDIO

### M1. `upsertUsuario` chamado 2× na mesma request
**Arquivo:** `src/index.js`, linhas 230 e 264

```js
const usuario = await upsertUsuario(phone);   // ←  1ª chamada
...
const [historico, usuarioAtualizado, media] = await Promise.all([
  buscarHistorico(phone, 1),
  upsertUsuario(phone),                       // ←  2ª chamada (pra pegar contador atualizado)
  calcularMedia(phone),
]);
```

Funciona, mas custa 1 round-trip extra ao Supabase em todo cupom processado. **Fix:** fazer a RPC `incrementar_compras_mes` **RETORNAR** o novo valor, e ler dali. Ou ler `compras_mes_atual` em outro SELECT mais barato. Detalhe: o upsertUsuario faz upsert + select, então é 2 round-trips × 2 chamadas = 4 desnecessários.

### M2. `calcularMedia` inclui a compra recém-salva no cálculo
**Arquivo:** `src/index.js`, linha 267 + `src/alerts.js`

O fluxo é: `salvarCompra` → `calcularMedia` → `verificarAlerta`. A média já contém o valor da compra atual, então o "alerta de gasto acima da média" compara o valor com uma média que ele mesmo puxou pra cima. Matemática: se média antes = R$100 (3 compras), nova compra R$200 → média nova = R$125, threshold 1.2× = R$150, alerta dispara. Funciona, mas o threshold real fica mais permissivo do que o pretendido.

**Fix:** ou calcular média **antes** de salvar a compra, ou excluir a última compra do cálculo:
```sql
.select('total').neq('id', compraId)
```

### M3. Race condition no contador de compras (`compras_mes_atual`)
**Arquivo:** `src/supabase.js`, linhas 63–79

```js
const { error: erroUpdate } = await supabase.rpc('incrementar_compras_mes', { ... });
if (erroUpdate) {
  const { data: usuario } = await supabase.from('usuarios').select('compras_mes_atual')...
  await supabase.from('usuarios').update({ compras_mes_atual: (usuario?.compras_mes_atual ?? 0) + 1 })...
}
```

Se a RPC existir, é atômica → OK. Se cair no fallback (RPC não criada ainda), `SELECT + UPDATE` permite que 2 cupons simultâneos contem só 1 incremento. Não é crítico (1 usuário raramente manda 2 fotos em paralelo) mas vale documentar.

**Fix:** garantir que a RPC existe (definir migration SQL); remover o fallback ou ao menos try/catchá-lo.

### M4. Reset mensal acontece só em `verificarLimiteGratuito` — outros lugares mostram contador stale
**Arquivo:** `src/supabase.js`, `verificarLimiteGratuito` vs `buscarStatusUsuario`

Se um usuário não envia foto há 2 meses e abre o bot dia 1 do novo mês com `/historico`, o contador `compras_mes_atual` ainda mostra o valor antigo (não foi resetado). Não há cron.

**Fix:** extrair a lógica de reset para `_garantirMesAtualizado(phoneNumber)` e chamar em todo lugar que toca `compras_mes_atual`. Ou usar SQL: `WHERE mes_referencia = to_char(now(), 'YYYY-MM')` como filtro lógico.

### M5. Onboarding3 é redundante com a resposta normal — usuário recebe 2 "✅ Compra registrada" em sequência
**Arquivo:** `src/formatter.js` linha 90–97 + `src/index.js` linha 277–280

Fluxo step 1 + imagem:
1. Bot responde: `✅ *Compra registrada!* 🏪 Carrefour — 14/05 💰 Total: R$ 152,00 📦 Itens... 📊 Esse mês: R$ 152,00 em 1 compra(s)`
2. 800ms depois: `🥇 *Primeira compra registrada no Carrefour!* Você acabou de começar seu histórico...`

A mensagem 2 acrescenta valor narrativo, mas o "Primeira compra registrada" duplica o "✅ Compra registrada" da 1. Considerar redigir a #2 sem repetir o status — só o **insight** ("daqui um mês você vai ver padrões").

**Fix proposto para onboarding3:**
```js
return `💡 Esse foi seu *primeiro registro*. Daqui um mês você vai começar a ver padrões — onde está gastando mais, o que sobe de preço, onde dá pra economizar. Continua mandando! 👊`;
```

### M6. Webhook não valida tamanho do body — Express default 100kb
Z-API pode mandar mensagens grandes. Não é crítico (rate limit cobre spam), mas adicionar `express.json({ limit: '50kb' })` é boa prática.

### M7. CORS aberto em `/waitlist` (`'*'`) — TODO já documentado no código
Antes de ligar Meta Ads/landing real, trocar pra `cors({ origin: 'https://economizei.com.br' })`.

### M8. `salvarCompra` retorna a compra mas o caller ignora o retorno
**Arquivo:** `src/index.js`, linha 256

`const compra = await salvarCompra(...)` poderia usar `compra.id` para logging ou para futura "última compra registrada: #1234, pode mandar /desfazer". Hoje o `compra` cai no chão. Não é bug, mas o `.select().single()` no `salvarCompra` custa um round-trip que ninguém usa.

---

## 🟢 POLISH / REDUNDÂNCIA

### P1. `console.log` cru em `gemini.js` — inconsistente com `logger.js`
- `gemini.js` linhas 57, 62, 68 usam `console.error`/`console.log` direto.
- O resto do projeto usa `log(evento, dados)` que produz JSON estruturado.
- **Fix:** trocar por `log('gemini_json_invalido', { texto })`, `log('gemini_sem_sucesso', { dados })`, `log('gemini_erro', { erro })`.

### P2. Código morto: `buscarStatusUsuario` exportado mas nunca importado
**Arquivo:** `src/supabase.js` linhas 184–204
Foi feito provavelmente pensando num comando `/status` ou `/plano` que não existe. **Fix:** ou implementar o comando (recomendado, é útil) ou remover.

### P3. `verificarAlerta` retorna `{ temAlerta: true, ... }` mas ninguém usa `temAlerta`
**Arquivo:** `src/alerts.js`. O caller faz `if (alerta)`. Pode remover o campo.

### P4. `maskPhone` usado por toda parte, exceto em `supabase.js` linha 166 — hardcoded `phoneNumber.slice(0, 5) + '****'`
Importar e usar `maskPhone` lá também.

### P5. snake_case em `noventa_dias_atras` (`src/supabase.js` linha 125) num projeto camelCase
Renomear pra `noventaDiasAtras`.

### P6. Ponto-e-vírgula faltando — `src/zapi.js:5`, `src/gemini.js:68`, `src/gemini.js:69`
Não causa bug (ASI), mas inconsistente. Rodar `eslint --fix`.

### P7. Inconsistência de estilo em `catch`:
- `} catch(err) {` (sem espaço) em `index.js:290`, `gemini.js:67`, `zapi.js:21`
- `} catch (err) {` (com espaço) em todo o resto

### P8. `montarMensagemBemVindo` (linha 48) e `montarOnboarding1` (linha 74) repetem conteúdo
Considerar componentizar:
```js
const HEADER = `📸 *Economizei* — você manda a foto do cupom, eu registro...`;
const BETA = `🎉 Você entrou como *Beta Fundador*...`;
```

### P9. `buscarHistorico` retorna `compras` (lista) + `totalMes` (soma) — semântica confusa
`compras` no contexto humano sugere "compras do mês". Renomear pra `ultimasCompras` ou retornar `{ ultimas: [...], totalMes, qtdMes }`.

### P10. Lista de itens vazia gera linha em branco
**Arquivo:** `src/formatter.js` linha 22–32

Se `itens = []`, sai `📦 *Itens principais:*\n\n\n📊...` (parágrafo vazio). Adicionar guarda:
```js
const blocoItens = itensPrincipais.length > 0
  ? `📦 *Itens principais:*\n${linhasItens}${linhaExtras}\n\n`
  : '';
```

### P11. `montarOnboarding3` quando `loja` é null mostra "no " (com espaço final): `Primeira compra registrada${loja ? ` no ${loja}` : ''}!`
Funciona porque o `?:` cuida disso. OK, mas o `loja: dados.loja` veio do Gemini — pode vir `"Mercado"`, `"MERCADINHO DO ZÉ LTDA ME"`, etc. Considerar capitalizar/limpar.

### P12. `/health` retorna `timestamp: new Date()` — funciona (auto serialize) mas explícito é melhor:
`timestamp: new Date().toISOString()`.

### P13. `logger.js` `maskPhone` retorna `'??????'` (6 chars) — formato diferente de `12345****`
Padronizar: sempre 9 chars (`'?????****'`).

### P14. `.env.example` está completo, mas `README.md` não documenta `/waitlist`
Adicionar uma linha sobre o endpoint POST `/waitlist` para a landing.

### P15. Test script `test-gemini.js` não tem error handling se `teste.jpg` não existir
Pequeno, mas: `if (!fs.existsSync(imagePath)) { console.error('Coloque teste.jpg na raiz'); process.exit(1); }`.

### P16. `salvarWaitlist` não valida `plano_interesse` — qualquer string entra
Definir enum `['gratuito', 'individual', 'familia', 'familia_plus', null]` e validar.

### P17. `processarTexto` step 1 envia onboarding2 infinitamente até a primeira foto
Não é grave (rate limit cobre), mas considerar avançar pra step 1.5 após N tentativas ou adicionar um pequeno "vamos lá, é só foto mesmo 📸" diferente da segunda vez.

---

## 🧪 SESSÃO DE DEBUG — Cenários Simulados

Validação por *tracing* manual (sandbox indisponível). Notação: ✅ funciona, ⚠️ funciona mas com observação, ❌ bug.

| # | Cenário | Resultado |
|---|---|---|
| 1 | Payload sem `phone` | ✅ regex bloqueia, log `payload_invalido`, sai |
| 2 | Phone com `+55...` | ❌ regex `/^\d{10,15}$/` rejeita. Verificar formato real do Z-API |
| 3 | Texto vazio (`""`) | ✅ trim check bloqueia |
| 4 | Texto "Hoje fui ao mercado" | ❌ casa `oi` em `f**oi** ao mercado`? Sim → boas-vindas indevida (ver C1) |
| 5 | Texto "escola" | ❌ casa `ola` → boas-vindas |
| 6 | Texto "/historico" exato | ✅ casa `/historico` → mostra histórico |
| 7 | Texto "/HISTORICO" maiúsculo | ✅ `.toLowerCase()` cuida |
| 8 | Step 0 + texto qualquer | ✅ onboarding1, avança pra step 1 |
| 9 | Step 0 + imagem | ✅ onboarding1 (não processa foto), step → 1 |
| 10 | Step 1 + texto | ⚠️ onboarding2 sempre, sem avançar step (loop até foto) |
| 11 | Step 1 + imagem | ✅ processa, salva, resposta normal, +800ms onboarding3, step → 2 |
| 12 | Step 2 + imagem | ✅ idem, onboarding4 ("Duas compras registradas"), step → 3 |
| 13 | Step 3+ | ✅ fluxo normal sem onboarding |
| 14 | 11 cupons no mês (free) | ✅ verificarLimiteGratuito retorna atingido=true, envia mensagem de limite |
| 15 | Cupom no dia 1 do novo mês após 10 do mês anterior | ✅ reset lazy zera contador antes de checar limite |
| 16 | Gemini retorna ```json {...} ``` (com fence) | ❌ JSON.parse falha, usuário recebe "Erro interno" mesmo cupom válido (ver C2) |
| 17 | Gemini retorna `{sucesso: true, total: "99,90"}` (string) | ❌ `brl` retorna "NaN", mensagem corrompida (ver C3) |
| 18 | Gemini retorna `{sucesso: true}` sem campos | ❌ `salvarCompra` insere NULL em total → erro no Supabase (ou aceita), mensagem com NaN |
| 19 | Imagem .heic (iPhone) | ⚠️ detectarMimeType cai no fallback `image/jpeg`. Gemini pode aceitar ou não — depende da versão |
| 20 | Z-API offline (timeout) | ❌ enviarMensagem trava sem timeout (ver C4); upstream pensa que deu certo |
| 21 | Supabase offline | ✅ upsertUsuario lança, processarImagem cai no catch externo, manda mensagem de erro (mas o `enviarMensagem` desse erro também pode falhar — silencioso) |
| 22 | 2 fotos paralelas do mesmo usuário | ⚠️ se RPC existe, ok atômico. Se cai no fallback, contador pode ficar errado |
| 23 | `/waitlist` sem `nome` | ✅ 400 |
| 24 | `/waitlist` com whatsapp "11" | ✅ 400 (< 10 dígitos) |
| 25 | `/waitlist` com whatsapp "551199999999999" (15 dígitos) | ❌ rejeita (limite 13). Webhook aceita até 15. Inconsistência |
| 26 | Webhook recebe delivery receipt (sem text nem image) | ✅ silenciosamente ignorado |
| 27 | Rate limit: 11 mensagens em 1 minuto | ✅ 11ª recebe mensagem de espera |
| 28 | Rate limit: depois de 60s | ✅ reset automático na próxima chamada |
| 29 | Memória do rateLimiter após reboot | ⚠️ perde estado (esperado, em memória) |
| 30 | Compra de R$0 ou negativo (cupom estranho) | ❌ aceita, soma no totalMes, alerta não dispara (média comparada com 0). Validar `total > 0` |

---

## 🛠️ Sugestões de Melhorias Estruturais (futuro)

1. **Testes automatizados.** Hoje só existe `test-gemini.js` manual. Sugiro:
   - `vitest` ou `jest` com mocks de `axios` (Z-API, Gemini) e `supabase-js`.
   - Cobrir os 30 cenários da tabela acima.
2. **Migrations SQL versionadas.** A RPC `incrementar_compras_mes`, colunas `beta_fundador`, `mes_referencia`, `onboarding_step`, tabela `waitlist` — tudo isso vive apenas no Supabase, sem código de migration. Risco se precisar recriar o ambiente. Sugiro `supabase/migrations/*.sql` no repo.
3. **Schema validator no retorno do Gemini.** `zod` ou `valibot`:
   ```js
   const CupomSchema = z.object({ sucesso: z.literal(true), loja: z.string().min(1), total: z.number().positive(), data_compra: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), itens: z.array(...) });
   ```
4. **Observabilidade.** Os logs JSON estão bons. Quando subir o tráfego, considerar enviar pra Axiom/BetterStack (free tiers generosos).
5. **Idempotência.** Z-API pode reenviar webhook em caso de falha (já documentado no código). Considerar hash de `(phone, messageId)` numa tabela `mensagens_processadas` para evitar duplo processamento.

---

## ✅ O que está bem feito

Antes de focar nos problemas, vale registrar — porque está acima da média pra um MVP de 1 pessoa:

- **Estrutura de arquivos limpa e modular** (webhook vs gemini vs supabase vs formatter vs alerts vs logger).
- **Logger estruturado em JSON** desde o dia 1 — vai render muito quando precisar debugar produção.
- **Rate limiter em memória correto** (sliding-window aproximado, com GC interno).
- **`maskPhone` por padrão nos logs** — LGPD-friendly.
- **Tratamento de eventos não-mensagem do Z-API** (ignora delivery receipts silenciosamente).
- **Detecção de mimeType por magic number** — robusto a extensões mentidas.
- **Reset lazy do contador mensal** — não precisa de cron, simples e funciona.
- **Onboarding em 4 mensagens** com lógica de step bem amarrada na tabela `usuarios`.
- **Tag `beta_fundador` desde o dia 1** alinhada com a estratégia documentada no CLAUDE.md.

---

## 📋 Checklist de Ação Recomendado

**Hoje (1h):**
- [ ] C1 — corrigir detecção de comandos para usar word boundary
- [ ] C2 — strip de markdown no parser do Gemini
- [ ] C3 — validar schema do retorno do Gemini
- [ ] C4 — adicionar timeout + throw em `enviarMensagem`
- [ ] C5 — corrigir fallback do `qtdComprasMes`

**Esta semana (2–3h):**
- [ ] M1 — eliminar 2ª chamada de `upsertUsuario`
- [ ] M2 — calcular média antes de salvar a compra
- [ ] M3 — garantir que a RPC `incrementar_compras_mes` existe (e remover fallback ou logá-lo)
- [ ] M5 — reescrever onboarding3 sem repetir "Compra registrada"
- [ ] M7 — fechar CORS de `/waitlist` pro domínio real antes do lançamento

**Quando der (1h de polish):**
- [ ] P1, P3, P4, P5 — consistência (logger, código morto, snake_case, maskPhone)
- [ ] P2 — decidir: implementar `/status` ou remover `buscarStatusUsuario`
- [ ] P10 — guarda para itens vazios no formatter
- [ ] Adicionar testes para os 5 cenários críticos

**Backlog:**
- [ ] Migrations SQL versionadas
- [ ] Validador de schema (zod)
- [ ] Idempotência via `mensagens_processadas`

---

*Auditoria executada em 14/05/2026. Próxima revisão recomendada após implementar os críticos.*
