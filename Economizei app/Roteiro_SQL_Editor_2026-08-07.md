# 🗄️ Roteiro da sentada no SQL Editor — 2026-08-07

> **Uma sentada, 4 blocos, ~25 min.** Ordem escolhida pra que **cada bloco seja
> verificável antes do próximo** e o ponto de reversão esteja sempre claro.
> Se algo der errado no meio, você para ali — nenhum bloco depende de um bloco
> posterior ter rodado.
>
> **Decisões do Gabriel que originaram isto (2026-08-07):** ligar o RLS (S4),
> rodar a migration PIX, confirmar a RPC (S3) e dropar as colunas do Mercado Pago.

---

## ⚠️ ANTES DE ABRIR O SQL EDITOR — passo 0, no WhatsApp

O S2 (`SUPABASE_SERVICE_ROLE_KEY`) foi setado, mas o print prova só que a
**variável existe**. Falta provar que o **valor certo está em uso** — e o bloco 2
(RLS) **derruba o bot** se ele ainda estiver rodando com a chave `anon`.

> ❌ **CORREÇÃO 2026-08-07 — o teste original deste passo estava ERRADO (erro meu).**
> Eu escrevi *"mande a mesma foto 2× e a 2ª deve ser ignorada pela dedup"*. **Não deve.**
> A dedup é por **`messageId`**, não por conteúdo — ela existe pro caso de *"o Z-API
> reentregar o mesmo evento (retry/rede/reconexão)"* (`index.js:155`). Duas fotos que
> você envia separadamente são duas mensagens distintas, com messageIds distintos: o
> bot processa as duas, e isso é o **comportamento correto**. O Gabriel rodou o teste
> em 07/08, recebeu 2 respostas, e não havia nada de errado.
>
> **E o mais importante:** o comportamento visível do bot **não distingue** anon de
> service_role. A falha de `registrarMensagemProcessada` é *fail-open* — o cupom
> processa normal e nada aparece pro usuário. Foi por isso que o problema passou
> semanas despercebido. Nenhum teste "pelo WhatsApp" decide isso.

**Teste 1 — decisivo, 30 segundos.** As chaves do Supabase são JWTs que carregam o
próprio papel no payload. Decodifique e leia o campo `role` (PowerShell, na pasta do projeto):

```
node -e "const t=process.argv[1].split('.')[1];console.log(JSON.parse(Buffer.from(t,'base64url')))" COLE_A_CHAVE_AQUI
```

- `role: 'service_role'` → ✅ chave certa. Pode seguir.
- `role: 'anon'` → 🚦 **PARE.** Você colou a anon por engano — o bloco 2 derrubaria o bot. Supabase → Settings → API → `service_role` → Reveal.

⚠️ A chave fica no histórico do PowerShell: rode `Clear-History` depois, ou salve num
`.txt` temporário **fora do repositório** e passe o caminho. **Não** use jwt.io nem
sites parecidos — é uma chave com acesso total ao banco.

**Teste 2 — confirmação pelos logs (se preferir não mexer na chave).**
Mande qualquer mensagem ao bot, depois Railway → Deployments → logs e procure
`supabase_erro` com `fn: registrarMensagemProcessada`:

- **nenhuma ocorrência** → ✅ service_role em uso
- **uma por mensagem** → 🚦 ainda em anon. Não rode o bloco 2.

**Teste 3 — o bot está de pé.** Mande "oi" (acorda o serviço, que aparecia "Sleeping",
e força o boot com a env nova). Isto **não** prova qual chave está em uso — prova só
que o bot subiu. Se ele **não** responder, algo mais básico quebrou: pare aqui.

---

## Bloco 1 — Migration PIX *(destrava a cod-0062)*

Rode o conteúdo de **`supabase/migration_2026-08-05_pix_direcao_id_transacao.sql`**.

Adiciona `compras.direcao` (default `'saida'` — **todo histórico continua sendo gasto**),
`compras.id_transacao` e o índice único parcial de dedup.

**Por que primeiro:** é puramente aditivo, não pode quebrar nada, e não depende do RLS.
Se o resto da sentada falhar, esta parte já está feita e a cod-0062 destrava.

**Verificação** (as duas devem retornar linha):

```sql
SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'compras' AND column_name IN ('direcao','id_transacao');

SELECT indexname FROM pg_indexes
 WHERE tablename = 'compras' AND indexname = 'idx_compras_id_transacao';
```

**Reversão:** `ALTER TABLE compras DROP COLUMN IF EXISTS direcao, DROP COLUMN IF EXISTS id_transacao;`

---

## Bloco 2 — 🔴 RLS *(o item que fecha a exposição LGPD)*

**Dois arquivos, nesta ordem:**

1. `supabase/rls_migration.sql` — as 5 relações originais
2. `supabase/rls_migration_parte2_2026-08-07.sql` — **o resto** (escrito nesta sessão)

**Por que o segundo arquivo existe:** o original foi escrito quando o projeto era
menor e cobre 5 relações. O código de hoje usa **15**. Sem a parte 2, ficam expostas
`acompanhamentos`, `perguntas_log`, `mensagens_processadas`, `indicacoes`,
`precos_mercado` — **e as 7 views**. As views são o buraco menos óbvio: em Postgres
elas rodam com o privilégio de **quem as criou**, então `v_dashboard` continuaria
devolvendo tudo mesmo com RLS ligado nas tabelas base. Ligar só o original tranca a
porta da frente e deixa a lateral aberta.

> ⚠️ **Se você já tentou rodar e tomou `42P01: relation "..." does not exist`:**
> nada foi aplicado (o SQL Editor roda tudo numa transação — o erro fez rollback
> do bloco inteiro). O arquivo da parte 2 foi **reescrito em v2** e agora
> **descobre sozinho** o que existe, em vez de assumir uma lista fixa. É
> idempotente: pode rodar inteiro, quantas vezes quiser. Pegue a versão nova.

**Verificação — o teste que vale é fora do SQL Editor.** O Editor roda como
`service_role` e enxerga tudo: testar por lá dá **falso positivo**. Use o terminal:

```bash
curl "https://SEU_PROJETO.supabase.co/rest/v1/usuarios?select=*" -H "apikey: SUA_ANON_KEY"
```

Esperado: `[]` ou erro. **Nunca** dados de usuário. Repita para `compras`,
`itens_compra`, `perguntas_log`, `acompanhamentos`, `precos_mercado` e `v_dashboard`.

**E o teste do outro lado:** mande **"oi"** no WhatsApp de novo. Se o bot **parou de
responder**, ele ainda estava em anon → reverta e volte ao passo 0:

```sql
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras  DISABLE ROW LEVEL SECURITY;
-- (e as demais que você tiver ligado)
```

---

## Bloco 3 — S3: a RPC `incrementar_compras_mes` existe?

Só leitura, não muda nada. *(A versão antiga desta query tinha um bug meu — `oid`
ambíguo entre `pg_proc` e `pg_namespace`. Esta está corrigida com `p.oid`.)*

```sql
SELECT p.proname       AS funcao,
       pg_get_function_identity_arguments(p.oid) AS argumentos
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname = 'incrementar_compras_mes';
```

- **Retornou linha** → ✅ existe. Confira que o argumento é **`p_phone_number`** (o código chama por nome; nome diferente = a RPC nunca é usada e o fallback roda em silêncio).
- **Vazio** → a RPC não existe: **todo cupom** usa um read-then-write com condição de corrida, e dois cupons simultâneos podem contar como um. Não é urgente com 1 usuário; vira urgente com base real.

Confirmação cruzada nos logs do Railway: procure `incremento_fallback`. Se aparecer, a RPC não está em uso.

---

## Bloco 4 — DROP das colunas do Mercado Pago *(irreversível)*

⚠️ **Leia antes de rodar.** Você escolheu incluir isto na sentada, e é **seguro
hoje** — a verificação de 05/08 confirmou que `upsertUsuario` não seleciona mais
essas colunas e que as funções órfãs têm **zero chamadores**.

Mas isto **inverte a ordem que você mesmo definiu** (código → deploy → banco). O
código morto que menciona essas colunas ainda está no repositório: é a **cod-0066**,
que você acabou de liberar nesta sessão e que a máquina pega na próxima run.

**Duas opções — sua escolha:**

- **(a) Rodar agora.** Seguro pela verificação, e resolve numa sentada só. Custo: durante alguns dias o código terá funções que referenciam colunas inexistentes — inertes, porque ninguém as chama.
- **(b) Esperar a cod-0066.** É porte P, a máquina entrega na próxima run; depois do deploy você roda o DROP com o código já limpo. Custo: mais uma sentada no SQL Editor.

> **Se a dúvida for real, escolha (b).** Este bloco é o único da sentada que é
> **irreversível** e o único cujo valor é **cosmético** — nada no produto melhora
> com ele. Foi exatamente por isso que ficou adiado em 05/08.

```sql
-- Só rode se escolheu (a) — ou depois do deploy da cod-0066, se escolheu (b).
ALTER TABLE usuarios
  DROP COLUMN IF EXISTS mp_preapproval_id,
  DROP COLUMN IF EXISTS assinatura_status,
  DROP COLUMN IF EXISTS assinatura_email,
  DROP COLUMN IF EXISTS assinatura_pendente_plano,
  DROP COLUMN IF EXISTS assinatura_atualizada_em;

DROP INDEX IF EXISTS idx_usuarios_mp_preapproval;

-- assinatura_eventos NÃO existe (confirmado 2026-08-05, S0 query 1) — nada a dropar.
```

**Verificação** (deve retornar **zero linhas**):

```sql
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'usuarios'
   AND (column_name LIKE 'mp_%' OR column_name LIKE 'assinatura_%');
```

---

## ✅ Depois da sentada

- [ ] Marcar na AGENDA: S3 respondido · S4 fechado · migration PIX rodada · DROP (se feito)
- [ ] **cod-0062 destravada** — é porte G (coração), roda em sessão com você presente
- [ ] **cod-0069/0070 destravadas** — o bloqueio delas era exatamente o S2+S4
- [ ] Setar `COMPARATIVO_MAX_PRO=10` no Railway (pré-req da cod-0073, o gate Pro)

---

## 📌 Nota de método (2026-08-07)

O erro do passo 0 vale ficar registrado: eu propus um teste **de comportamento** para
uma falha que é **silenciosa por construção**. `registrarMensagemProcessada` é
fail-open — quando falha, nada muda pro usuário. Testar pelo WhatsApp nunca poderia
distinguir anon de service_role.

**Regra que fica:** quando o defeito é silencioso, o teste tem que ser **de estado**
(o que a chave é, o que a tabela tem, o que o log diz), nunca **de comportamento**
(o que o bot respondeu). Vale para tudo nesta pasta: dedup, RLS, RPC, schema guard.
