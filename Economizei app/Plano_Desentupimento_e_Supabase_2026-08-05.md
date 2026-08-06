# 🔧 Plano — Desentupir a esteira + destravar o banco (2026-08-05)

> **O que é:** o plano da sessão de 05/08. Responde três coisas que você pediu: (1) os códigos
> cod-0043/0044/0048/0049 podem continuar na fila? (2) o que exatamente precisa ser feito no
> Supabase, com os comandos; (3) soluções concretas para os três problemas da esteira que
> diagnostiquei mas não resolvi na resposta anterior.
>
> **Nada aqui foi executado.** É plano. A única alteração feita nesta sessão foi a reordenação
> da AGENDA que você autorizou.
>
> **Contexto que não muda:** empresa BC só em outubro/2026. Meta Ads, Hotmart, Wise e afiliados
> seguem bloqueados. Nada neste documento depende deles nem os antecipa.

---

## 0. O estado medido hoje (não o que a memória diz)

| Fato | Valor |
|---|---|
| `origin/main` = HEAD | `1215d3c` |
| Último commit | **2026-07-28** — 8 dias atrás |
| Working tree | **sujo desde 2026-07-29** — ~707 linhas do cod-0043 |
| Último relatório matinal | **2026-07-30** (relata "2º dia consecutivo entupida") |
| Runs produtivas desde então | **zero** |

A AGENDA diz que o cod-0043 está `pronta` na fila. **Ela mente** — o código existe no tree desde
29/07. A run daquele dia implementou (passos 1–6) e morreu antes de atualizar a AGENDA (passo 7)
e escrever o relatório (passo 9).

**Correção do meu diagnóstico anterior:** eu disse "2 dias parada" com base no relatório de 30/07.
São **~6 dias**. O relatório também está velho.

---

## 1. Os quatro códigos — podem continuar na fila?

**Resposta curta: três podem e vão pro fim; um não pode ir pro fim porque já está construído.**

| id | Veredito | Motivo |
|---|---|---|
| **cod-0043** | ❌ **Não vai pro fim — entregar agora** | Já está implementado e testado no working tree (22/22 verdes na sondagem). Mandar pro fim significa uma de duas coisas: manter o tree sujo (a esteira continua entupida, que é o problema que estamos resolvendo) ou jogar fora 707 linhas prontas. As duas são desperdício. Sem migration, sem coração, sem financeiro — risco de revisão baixo. |
| **cod-0044** | ✅ Pode ficar → fim da fila | Código puro (`intents.js` + `render.js`), sem migration, sem tabela nova, sem financeiro. Risco técnico ~zero. Valor **hoje** é baixo: é polimento de um agente que ~ninguém usa ainda. |
| **cod-0048** | ✅ Pode ficar → fim da fila | Reusa `charts.js`, sem duplicar lógica. **Ressalva:** mexe em `index.js`/`zapi.js`, que é exatamente onde o `autenticarWebhook` entrou em 07-24. Revisão atenta no `/entregar`, sem pressa. |
| **cod-0049** | ⚠️ Pode ficar → fim da fila, **com condição nova** | O gate original ("cod-0035 no `origin/main`") está **satisfeito** ✅ (`df18b53`). Mas os critérios de aceite dela dizem: *"se o cooldown precisar de coluna/tabela nova → PARAR e escrever o `.sql`"*. Com o banco na situação da seção 2, isso vira colisão praticamente garantida. **Condição: só liberar depois do bloco Supabase abaixo estar fechado.** |

### O que eu **não** estou dizendo

Não estou dizendo que a fila está errada em espécie. **Refinar o produto durante a janela até
outubro é exatamente a coisa certa a fazer** — é o que você decidiu em 07-09 e continua válido.
O que está errado é a **ordem**: essas quatro são refinamentos construídos em cima de uma
infraestrutura que hoje está quebrada em dois pontos. Polir a conversa do agente enquanto o motor
de retenção está desligado é otimizar o andar de cima de uma casa sem fundação.

---

## 2. O que está quebrado no banco — "as coisas que você não estava achando"

Você disse que não tem tido acesso a essas coisas ou não as encontra fácil. Elas estavam
espalhadas entre o painel "Ações do Gabriel" da AGENDA, a seção 5 do plano do MP e a auditoria
de 07-10. Aqui estão as cinco, com a cadeia de evidência de cada uma e a severidade real.

---

### ⚫ P1 — O reengajamento nunca enviou uma única mensagem → **DESLIGADO POR DECISÃO (2026-08-05)**

> **DECISÃO DO GABRIEL (2026-08-05):** *"vamos deixar de lado a ideia do reengajamento por agora,
> quero somente a mensagem de final de mês indicando o quanto se gastou."*
>
> **Consequência boa:** a mensagem que ele quer **já existe e já funciona.** O resumo mensal é o
> job `executarResumoMensal` (`monthlySummary.js`, cron `0 9 28-31 * *`), que é **independente** do
> reengajamento — usa `resumos_mensais_enviados` (migration A4, confirmada rodada em 07-09), não a
> `lembretes_enviados`. Ou seja: **abrir mão do reengajamento não custa nada do que ele pediu.**
>
> **Consequência a registrar, sem relitigar:** o resumo mensal dispara nos dias 28–31, ou seja até
> ~4 semanas depois do cadastro — ele **não** funciona como toque proativo na semana 2. Com o
> reengajamento desligado, o produto passa a não ter nenhum toque proativo antes do dia 28. A
> métrica W2 vai medir retenção puramente orgânica. Fica escrito; a decisão é dele.
>
> **O que fazer, então:** ver **S1 (revisado)** na seção 3 — não é mais "criar a tabela", é
> "desligar o job e calar o alarme". A análise abaixo fica registrada porque explica *por que* o
> subsistema estava morto, e a lição de processo continua valendo.

A cadeia do defeito, para registro:

1. `src/schemaGuard.js:33` lista `lembretes_enviados` como tabela crítica.
2. A tabela **não existe em produção** — o schema guard já acusou.
3. O SQL existe e nunca foi rodado: `supabase/migrations/create_lembretes_enviados.sql`.
4. `supabase.js:1200` — `lembreteFoiEnviado()` faz `SELECT` na tabela; erro → **`throw err`**.
5. `reengagement.js:125` — a chamada está dentro do `try` do laço por usuário.
6. `reengagement.js:139` — o `catch` faz `erros++` e **segue pro próximo usuário**.

**Consequência:** o `throw` acontece **antes** do `enviarMensagem`. Ou seja, para **todo** usuário
elegível, o job conta um erro e **não envia nada**. Os lembretes D3/D10 (e onboarding D2/D7,
fim-de-mês D26, aviso de limite) **nunca saíram**. O job roda todo dia às 10h, loga
`reengajamento_resumo` com `enviados: 0`, e ninguém olha.

**A lição de processo (esta sobrevive à decisão de desligar):** um subsistema inteiro ficou morto
por semanas sem que ninguém percebesse, mesmo existindo (a) um schema guard que detecta a tabela
faltando no boot, (b) um alerta de WhatsApp pro `ADMIN_PHONE`, e (c) um log de erro por usuário a
cada execução. Três alarmes tocaram e nenhum foi ouvido. Isso é argumento direto pro item
"cobertura de testes de `reengagement.js`" ter saído do lastro e virado dívida com nome — e pra
conferir se o `ADMIN_PHONE` está mesmo setado no Railway.

---

### 🔴 P2 — O bot provavelmente está rodando com a chave `anon`, não a `service_role`

O log que você viu (`registrarMensagemProcessada: new row violates row-level security policy`)
foi lido em 07-26 como "falta uma policy de insert". **Acho que o diagnóstico estava errado**, e o
erro real é mais sério. O raciocínio:

- `supabase.js:8-11` cria o cliente com `SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY`.
- A `service_role` **bypassa RLS por completo** — nenhuma policy se aplica a ela.
- Logo, um erro "violates row-level security policy" é **impossível** se o cliente fosse service_role.
- Conclusão: `SUPABASE_SERVICE_ROLE_KEY` **não está setada (ou está inválida) no Railway**, e o bot
  caiu no fallback para a chave `anon`.

**Duas consequências, e a segunda é a que importa:**

1. **A dedup está desligada.** `mensagens_processadas` tem RLS ligado sem policy → todo insert
   falha → a mesma foto pode ser processada duas vezes (fail-open por design, mas sem proteção).
   Custo: chamadas Gemini duplicadas, compra duplicada no histórico.
2. **O banco está sem proteção nenhuma.** Se o `rls_migration.sql` tivesse sido rodado alguma vez,
   as policies `bloquear_anon` em `usuarios`/`compras`/`itens_compra` teriam matado o bot inteiro
   (ele roda como anon). Como o bot funciona, **o `rls_migration.sql` nunca foi rodado**. Ou seja:
   **hoje, quem tiver a chave anon lê todos os dados de todos os usuários.** A chave anon é, por
   desenho, semi-pública (vive no cliente).

Com ~zero usuários reais a exposição prática é pequena. **Mas isso tem que estar fechado antes de
Fernandópolis** — cupom fiscal é dado pessoal, e a LGPD não perdoa "era pré-lançamento".

**Verificação: 2 minutos.** Railway → seu serviço → Variables → a `SUPABASE_SERVICE_ROLE_KEY` está lá?

---

### 🟡 P3 — A RPC `incrementar_compras_mes` pode não existir em produção

Auditoria 07-10 §3.3, nunca verificada. Se ela não existir, **todo cupom** cai no fallback
read-then-write racy de `supabase.js:90-105` — em corrida, o contador de cupons do mês perde
incrementos (usuário passa do limite free sem que o sistema perceba).

**Você já tem a sentinela instalada:** desde 07-24, `salvarCompra` loga `incremento_fallback`
quando isso acontece. **Procure `incremento_fallback` nos logs do Railway** — se aparecer, a RPC
não existe. Se nunca apareceu e já passou cupom, ela existe e este item está fechado.

---

### 🟢 P4 — DROP das colunas do Mercado Pago: seguro, mas **não faça agora**

Verifiquei os dois riscos que tornariam o DROP perigoso, e ambos estão limpos:

- `upsertUsuario` (`supabase.js:23`) **não seleciona mais** nenhuma coluna de assinatura ✅
- As 7 funções órfãs (`setPendentePlano`, `salvarAssinaturaPreapproval`, etc.) têm **zero
  chamadores** fora do próprio `supabase.js` ✅ (conferido por grep em `src/` e `test/`)

Então o DROP não quebraria nada. **Mesmo assim, recomendo adiar.** Valor: cosmético. Risco:
irreversível. Ordem correta: primeiro apagar as funções órfãs do código (é a cod-0066, que você
pausou), depois o banco. Não há nenhuma urgência — colunas nulas não custam nada.

---

### ⚪ P5 — Tabelas em inglês (`price_history`, `purchases`, `stores`…)

Resíduo de outro experimento, não é do Economizei. Nenhum código toca. Deixe quieto até haver um
motivo real para mexer.

---

### ❓ Uma pergunta que vale responder junto

O `schemaGuard` **já manda um WhatsApp pro `ADMIN_PHONE` a cada boot** listando o que falta no
banco (`index.js:1170-1179`). Se você nunca recebeu uma mensagem tipo
*"⚠️ Guarda de schema: faltando no banco → lembretes_enviados"*, então `ADMIN_PHONE` **não está
setado no Railway** — e o alarme que você mandou construir (cod-0050) está mudo desde que nasceu.
Confira na mesma ida ao Railway do P2.

---

## 3. Supabase — a ordem exata de execução

> Ordem importa: **verificar antes de mudar; código antes de banco.**
> Faça um backup do projeto no Supabase antes de S4 (Settings → Database → Backups).

### S0 — Verificação (só leitura, ~5 min) — **faça isto primeiro**

Supabase → SQL Editor → cole e rode:

```sql
-- 1) Quais tabelas existem? (esperado: todas com "existe" preenchido)
SELECT t.tabela, to_regclass('public.' || t.tabela) AS existe
FROM unnest(ARRAY[
  'usuarios','compras','itens_compra','precos_mercado','indicacoes',
  'lembretes_enviados','resumos_mensais_enviados','mensagens_processadas',
  'perguntas_log','acompanhamentos','waitlist','assinatura_eventos'
]) AS t(tabela);

-- 2) Onde o RLS está ligado, e quantas policies existem em cada tabela?
--    (é isto que explica o erro de dedup)
SELECT c.relname AS tabela,
       c.relrowsecurity AS rls_ligado,
       COUNT(p.polname) AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relrowsecurity DESC, c.relname;

-- 3) A RPC do incremento existe? (auditoria §3.3)
--    ⚠️ CORRIGIDA em 2026-08-05: a 1ª versão deste plano usava `pg_get_function_identity_arguments(oid)`
--    e o Postgres devolvia "42702: column reference 'oid' is ambiguous" — tanto pg_proc quanto
--    pg_namespace têm uma coluna `oid`. Erro meu; a correção é qualificar com `p.`.
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('incrementar_compras_mes','incrementar_perguntas_mes');
```

#### ✅ Resultados do S0 (rodado pelo Gabriel em 2026-08-05)

| Query | Resultado | Leitura |
|---|---|---|
| 1 — tabelas | `assinatura_eventos` = **NULL** | A tabela **não existe**. `to_regclass` testa a existência da *relação*, não se há linhas — **não** tem nada a ver com "ninguém assinou ainda". A migration do MP foi aplicada só em parte. Consequência boa: **não há tabela pra dropar no S5.** |
| 2 — RLS | `usuarios`, `compras`, `itens_compra` = **`rls_ligado = false`** | **Confirma o P2.** O `rls_migration.sql` nunca foi rodado. Combinado com a ausência da service_role no Railway: o bot funciona *porque* o RLS está desligado, e a chave anon lê tudo. |
| 3 — RPC | erro `42702` (bug meu, acima) | **Pendente** — rodar a versão corrigida. |
| Railway | `SUPABASE_SERVICE_ROLE_KEY` **ausente** (14 envs, nenhuma é ela) | **Confirma o P2 na raiz.** O bot roda 100% na `SUPABASE_ANON_KEY`. |
| `ADMIN_PHONE` | setado, e o aviso do schema guard **chegou** no WhatsApp | O alarme funciona. O que faltou não foi alarme — foi destino de ação pro alarme. |

> **Uma coisa ainda a confirmar na query 2:** quais tabelas voltaram com `rls_ligado = **true**`?
> Pelo erro de dedup, `mensagens_processadas` deveria ser uma delas (é a única explicação pra ela
> recusar insert enquanto `compras` aceita). Vale reler o resultado ordenado — a query já traz as
> `true` no topo.

**Como ler o resultado:**

- Query 1: qualquer linha com `existe` vazio = migration não rodada. Espero ver `lembretes_enviados` vazia.
- Query 2: espero ver `mensagens_processadas` com `rls_ligado = true` e `policies = 0` — é a causa do erro. E espero ver `usuarios`/`compras` com `rls_ligado = false` — que é o P2.
- Query 3: se `incrementar_compras_mes` não aparecer, vá para S3.

---

### S1 (REVISADO) — Desligar o reengajamento e calar o alarme — **não criar a tabela**

Com a decisão de 05/08 (só a mensagem de fim de mês), **não rodamos nenhum SQL aqui.**
`lembretes_enviados` deixa de ser necessária. O que fica são duas tarefas de código:

**S1a — Desligar o job de reengajamento** *(vira tarefa de máquina, `src/scheduler.js:108-115`)*
O cron `0 10 * * *` chama `executarReengajamento()` todo dia e hoje só produz erro para cada
usuário. Desligar para de gerar ruído nos logs e evita que o subsistema volte a rodar por acidente.

**S1b — Tirar `lembretes_enviados` da lista crítica do schema guard** *(`src/schemaGuard.js:33`)*
Se a tabela não vai existir por decisão, o guard vai acusá-la para sempre no boot — e alarme que
grita sem motivo é alarme que se aprende a ignorar. Foi exatamente assim que este problema passou
despercebido. Remover a linha.

> ⚠️ **Não apagar `reengagement.js` nem as funções de `supabase.js`.** O reengajamento está
> "por agora" fora, não morto. Desligar o cron + calar o guard é reversível em 2 linhas; apagar o
> módulo não é. Mesma lógica do P4 (colunas do MP).

**O que você QUER já está no ar e não depende de nada disto:** o resumo mensal é o
`executarResumoMensal` (`monthlySummary.js`), cron `0 9 28-31 * *`, com idempotência em
`resumos_mensais_enviados` (migration A4, já rodada). **Nenhuma ação sua é necessária** para a
mensagem de fim de mês continuar funcionando.

**Verificação (opcional, 1 min no SQL Editor):**
```sql
SELECT to_regclass('public.resumos_mensais_enviados');  -- deve retornar o nome da tabela
```

---

### S2 — Setar a `SUPABASE_SERVICE_ROLE_KEY` no Railway ✅ **CONFIRMADO AUSENTE — é a ação mais importante da sua lista**

O print do Railway (05/08) mostra 14 variáveis e **nenhuma** é a service_role: `ADMIN_PHONE`,
`AGENTE_MODELO`, `AGENTE_MODO`, `COMPARATIVO_AMOSTRAS_FREE`, `CRON_SECRET`, `GEMINI_API_KEY`,
`LIMITE_PERGUNTAS_FREE`, `LINK_PAGAMENTO`, `SUPABASE_ANON_KEY`, `SUPABASE_URL`,
`ZAPI_CLIENT_TOKEN`, `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_WEBHOOK_TOKEN`.
Hipótese confirmada: o bot roda 100% na chave `anon`.

#### Onde achar a chave

**Supabase → seu projeto → ⚙️ Settings (canto inferior esquerdo) → API.**
Na seção **"Project API keys"** há duas linhas:

- `anon` `public` — é a que já está no Railway.
- **`service_role` `secret`** — é esta. Clique em **Reveal** e copie.

Se o seu painel já estiver no layout novo de chaves, o caminho é **Settings → API Keys**: as
antigas aparecem na aba **"Legacy API keys"** (`anon` / `service_role`), e há a opção de gerar uma
**Secret key** nova (`sb_secret_...`). Qualquer uma das duas serve — o código lê o **valor** da env
`SUPABASE_SERVICE_ROLE_KEY`, não se importa com o formato.

#### O que fazer com ela

1. Railway → seu serviço → **Variables** → **+ New Variable**
   - Nome: `SUPABASE_SERVICE_ROLE_KEY`
   - Valor: a chave copiada
2. O Railway **redeploya sozinho** ao salvar a variável.
3. Mande uma mensagem qualquer pro bot e confira nos logs que **sumiu** o
   `supabase_erro ... registrarMensagemProcessada ... row-level security`.

> ⚠️ **A service_role bypassa RLS por completo.** Ela é uma chave de administrador. Só em
> servidor (Railway), nunca em código de cliente, nunca commitada, nunca numa página. Se
> vazar, vaza o banco inteiro.

Isso corrige a dedup **sem rodar nenhum SQL** e é o pré-requisito do S4.

**Contingência (só se você não quiser mexer no Railway agora):**

```sql
-- Restaura a dedup desligando o RLS da tabela de deduplicação.
-- Trade-off honesto: a tabela guarda message_id + telefone. A exposição fica a
-- MESMA que todas as outras tabelas já têm hoje (P2) — não piora nada, mas
-- também não é a correção certa. Prefira o caminho do Railway.
ALTER TABLE mensagens_processadas DISABLE ROW LEVEL SECURITY;
```

---

### S3 — Recriar a RPC do incremento (**só se** a query 3 do S0 voltar vazia)

```sql
CREATE OR REPLACE FUNCTION incrementar_compras_mes(p_phone_number TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE usuarios
  SET compras_mes_atual = compras_mes_atual + 1
  WHERE phone_number = p_phone_number;
END;
$$ LANGUAGE plpgsql;

-- Conferência
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND proname = 'incrementar_compras_mes';
```

O nome do parâmetro **precisa ser `p_phone_number`** — é o que `supabase.js:85` envia.

---

### S4 — Ligar o RLS de verdade (**só depois do S2 confirmado funcionando**)

> 🚨 **Se você rodar isto antes de a `service_role` estar ativa no Railway, o bot morre por
> completo.** É a ordem que o próprio `rls_migration.sql` avisa no cabeçalho. Confirme primeiro
> que o bot responde normalmente com a chave nova.

> ⚠️ **CORRIGIDO 2026-08-05.** A 1ª versão deste bloco listava `lembretes_enviados` (que decidimos
> NÃO criar) e abortava inteira com `42P01: relation does not exist`. A versão abaixo **substitui
> o `rls_migration.sql` inteiro** — não rode os dois — e **pula tabela que não existir** em vez de
> falhar. É idempotente: pode rodar de novo sem efeito colateral.

```sql
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'usuarios','compras','itens_compra','resumos_mensais_enviados','waitlist',
    'mensagens_processadas','perguntas_log','acompanhamentos','precos_mercado','indicacoes'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "bloquear_anon" ON %I', t);
      EXECUTE format('CREATE POLICY "bloquear_anon" ON %I AS RESTRICTIVE FOR ALL TO anon USING (false)', t);
      RAISE NOTICE 'RLS ligado: %', t;
    ELSE
      RAISE NOTICE 'ignorada (nao existe): %', t;
    END IF;
  END LOOP;
END $$;
```

**Conferência:**
```sql
SELECT c.relname AS tabela, c.relrowsecurity AS rls, COUNT(p.polname) AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relrowsecurity DESC, c.relname;
```

**Teste depois:** mande "oi" e um cupom pro bot. Se responder normal, está certo.

**Rede de segurança — se o bot parar, isto o traz de volta na hora:**
```sql
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'usuarios','compras','itens_compra','resumos_mensais_enviados','waitlist',
    'mensagens_processadas','perguntas_log','acompanhamentos','precos_mercado','indicacoes'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;
```
Se voltar com isso, o diagnóstico é simples: a `SUPABASE_SERVICE_ROLE_KEY` não pegou (valor errado
ou redeploy não rodado).

✅ **Rodado e confirmado pelo Gabriel em 2026-08-05.**

---

### S5 — DROP das colunas do Mercado Pago — **adiado conscientemente**

Ver P4 acima. Sem urgência, sem valor imediato, irreversível. Fica registrado como aberto, mas
sai da lista de "fazer agora". Quando for a hora: primeiro liberar a cod-0066 (apagar as funções
órfãs do código), commitar, deployar, e **só então** rodar o `ROLLBACK` que já está escrito no
cabeçalho de `supabase/migration_2026-06-07_assinaturas_mp.sql`.

---

## 4. Os três problemas da esteira — soluções

Na resposta anterior eu diagnostiquei e não propus saída. Aqui estão.

---

### Problema A — A esteira está fisicamente entupida (cod-0043 no tree)

| Opção | O que é | Custo | Veredito |
|---|---|---|---|
| **A1 — `/entregar` o cod-0043** | Revisar e commitar o que já está pronto | ~30–40 min seus | ✅ **Recomendada** |
| A2 — `git stash` | Guarda o código de lado, tree limpo na hora | 1 min | ❌ Cria dívida invisível; stash esquecido é código perdido |
| A3 — Descartar | `git checkout .` + apagar os arquivos novos | 1 min | ❌ Joga fora 707 linhas testadas por nada |

**Por que A1:** o cod-0043 não tem migration, não toca o coração (classificação), não toca
financeiro, e a sondagem deu 22/22 nos testes novos. É a entrega mais barata que existe hoje, e é
o que devolve o tree limpo — sem isso, **nenhuma** run futura roda, independente do que a gente
decida na fila.

---

### Problema B — O estrutural: a máquina produz mais rápido do que você revisa

O desenho atual tem **limite de trabalho em andamento igual a 1**: nada novo entra enquanto a leva
anterior não foi commitada. O produtor roda todo dia às 8:02. O consumidor (você, no `/entregar`)
roda quando você senta — na prática, uma a duas vezes por semana com 12h/semana. Chegada maior que
atendimento é fila travada, sempre. E a Máquina 2.0 **piorou** isso: subir o teto por run aumenta o
lote, que aumenta o tempo de revisão, que reduz ainda mais a frequência do escoamento.

Três saídas reais:

#### B1 — Máquina commita em branch própria (`maquina/cod-00XX`), nunca na `main`

A run termina com `git checkout -b maquina/cod-0044 && git commit`. O tree volta limpo, a Regra 0
nunca dispara, e a próxima run roda no dia seguinte. O gate real fica intacto: **push na `main` é o
que deploya no Railway**, e isso continua 100% seu, via `/entregar` (que passa a ser um merge).

- **A favor:** produção nunca mais para. Relaxa a *letra* da regra 3 ("máquina nunca commita")
  preservando o *espírito* (nada chega em produção sem você).
- **Contra:** o estoque não-revisado cresce invisível. Levas vizinhas conflitam — cod-0043 e
  cod-0044 mexem nos mesmos arquivos de `src/agent/`; três branches empilhadas viram um merge
  desagradável. **E o problema de fundo não é resolvido:** você continua sendo o gargalo, só que
  agora com uma pilha maior esperando.

#### B2 — Baixar o teto e manter o cron diário

Volta o teto por run para **1 tarefa porte P, ≤ ~150 linhas**. A entrega deixa de ser um projeto de
40 minutos e vira um hábito de 10–15. Mais: acrescentar ao relatório um aviso quando o tree estiver
sujo há mais de 24h.

- **A favor:** custo zero de implementação (é mudar um número na AGENDA). Torna o `/entregar`
  suficientemente barato pra caber num intervalo do trabalho principal.
- **Contra:** não aumenta a vazão total; só reduz o tamanho do bolo. Se você passar 6 dias sem
  abrir, entope igual.

#### B3 — Inverter: produção puxada, não empurrada ✅ **minha recomendação**

Desligar o cron diário. A máquina roda quando **você** chama `/tarefa`, no começo da sessão em que
você já vai revisar. Combinado com o teto menor do B2.

- **A favor:** acaba o desperdício de runs que abortam. Acaba a AGENDA velha (a máquina só escreve
  quando você está lá). O relatório matinal deixa de ser ficção. E é honesto sobre a restrição
  real: **com 12h/semana, a vazão sustentável é 2–3 levas por semana, não 7.** O sistema para de
  fingir que é 7 e de acumular culpa por não ser.
- **Contra:** você perde a sensação de "acordar com trabalho feito". É uma perda real — mas hoje
  você acorda com *relatório de run abortada*, que é pior.

> ✅ **DECIDIDO (Gabriel, 2026-08-05, após reverter B3+B2): B1 — a máquina commita em branch.**
> Rotina das 8:02 **religada**, teto por run de volta a 3 P / 1 M / 1 lote (≤ ~500 linhas).
> Pedido dele: *"podemos trabalhar em defesas para os contras como fazer com que a pilha sempre
> fique organizada e não tenha problemas como o exemplo dos cod 43 e 44."* — é o que a seção
> **4-B1-DEFESAS** abaixo especifica. Aplicado nesta sessão.

---

### 4-B1-DEFESAS — Como o B1 fica seguro (Máquina 3.0)

O B1 tem três riscos conhecidos. Cada um ganhou uma trava explícita, escrita nos comandos
`/tarefa` e `/entregar`.

#### Risco 1 — Levas vizinhas conflitam (o caso cod-0043 × cod-0044)

Era o risco mais concreto: as duas mexem em `src/agent/`, e se cada uma nascesse da `main` o
merge da segunda seria um conflito garantido.

> **LEI 1 — PILHA LINEAR.** Cada leva nova nasce do **topo da pilha**, nunca da `main`.
> `main → maquina/A → maquina/B → maquina/C`. A leva B já contém tudo de A, então **não existe
> conflito entre elas por construção**. A ordem de merge é a ordem de criação, e o `/entregar`
> nunca pula uma branch.

Trava complementar: a máquina **não pega** tarefa cujo `depende-de` aponte pra algo que só existe
na pilha (branch ≠ entregue), nem tarefa cujos critérios dependam de *como* uma leva não-mergeada
foi implementada. Nesses casos ela reporta e segue adiante na fila.

#### Risco 2 — Estoque não-revisado cresce invisível

Era a crítica mais forte ao B1: sem o working tree sujo pra te lembrar, a dívida some de vista.

> **LEI 2 — TETO DE PILHA = 3.** Com 3 branches `maquina/*` abertas, a máquina **para de
> produzir** e reporta "pilha cheia" com a lista. É o substituto direto da antiga Regra 0 — a
> diferença é que agora o freio é explícito e contável, em vez de ser um efeito colateral de o
> tree estar sujo.

> **PAINEL "📚 Pilha da máquina" na AGENDA.** Toda leva registra: ordem, branch, tarefa, data,
> linhas, arquivos, migration s/n, idade. A máquina atualiza a cada run; o `/entregar` limpa
> depois do push. Branch com **>7 dias = 🔴** — e o rótulo diz a verdade: o atraso é do
> `/entregar`, não da máquina. Se a tabela divergir do git, **o git vence** e o `/entregar` avisa.

#### Risco 3 — A `main` anda por baixo da pilha

Se você commitar direto na `main` (sessão manual, hotfix) enquanto a pilha existe, a base dela
fica velha e o merge vira surpresa.

> **LEI 3 — MAIN PARADA.** No início de cada run a máquina compara a `main` com a base da pilha.
> Se a `main` andou, ela **para e avisa** — você decide o rebase. A máquina **nunca** faz rebase,
> merge, force-push ou reescrita de história.

#### O que continua absolutamente proibido à máquina

`git push` · `git merge` (em qualquer direção) · `git rebase` · `git reset --hard` ·
commit na `main` · `git branch -D` · force-push · mexer em tags/remotes.
E a zona proibida de arquivos não mudou: `supabase/`, `.env*`, `.github/`, `package.json`,
`package-lock.json`, `Dockerfile`, `Procfile`, `scripts/check-firewall.mjs`, deploy.

> **A regra 3 da §11 do CLAUDE.md muda de redação, não de espírito:** de *"a máquina nunca
> commita"* para *"a máquina commita SÓ em branch `maquina/*`; `main` e `push` seguem 100% do
> Gabriel"*. O gate real sempre foi o push (que deploya no Railway) — esse não se moveu um
> milímetro.

#### O contra que fica de pé (honestidade)

Nada disso muda o fato de que **você continua sendo o gargalo**. O B1 impede a produção de
*travar*, não faz a revisão andar mais rápido. Se a pilha viver cheia (3/3) por semanas, o
sistema estará te dizendo a mesma coisa que a esteira entupida dizia — só que sem custar dias
parados. **A pilha cheia é o sinal a observar.**

---

### Problema C — Runs morrem no meio e não deixam rastro

A run de 29/07 implementou (passos 1–6) e morreu antes do passo 7 (atualizar AGENDA) e do passo 9
(escrever relatório). Não é acaso: **os passos de fechamento estão no fim do roteiro**, depois da
parte cara (mostrar o diff completo). Uma run que estoura contexto ou tempo sempre morre lá.

**Solução — inverter a ordem de escrita no `.claude/commands/tarefa.md`:**

1. **Primeiro ato da run:** escrever `RELATORIO_MATINAL.md` com um cabeçalho mínimo —
   data, HEAD, tarefa escolhida, "em andamento". Assim, mesmo uma run que morre logo em seguida
   deixa rastro do que ela estava fazendo.
2. **Logo após implementar (novo passo 6.5, antes de exibir o diff):** mover a tarefa para
   "🔧 Em revisão" na AGENDA. O estado passa a ser gravado **antes** da parte que pode matar a run.
3. **Último ato:** completar o relatório com diff, métricas e pendências.

Fica: *implementou → gravou o estado → só então exibiu*. A AGENDA nunca mais mente sobre o tree.

**Bônus barato:** adicionar ao início do roteiro a checagem "o tree está sujo há mais de 24h?" e,
se sim, escrever isso no topo do relatório em vez de só "esteira entupida". Você teria descoberto
os 6 dias no segundo dia.

---

## 5. Nova ordem da fila (aplicada na AGENDA nesta sessão)

**Topo — depois que o tree estiver limpo:**

0. **cod-0068 · Desligar o reengajamento (S1a + S1b)** — NOVA, criada pela decisão de 05/08.
   Comentar o cron `0 10 * * *` em `src/scheduler.js` e remover `lembretes_enviados` da lista
   crítica do `schemaGuard.js`. Reversível, ~10 linhas. Sem apagar módulo nenhum.
1. **cod-0067 · Copy pós-MP** — o `/pix` ainda promete *"no cartão (/planos) a renovação é
   automática"*. O cartão morreu com o Mercado Pago em 07-26. É uma promessa falsa no ar hoje,
   pequena de corrigir, e o `financial-firewall` existe exatamente pra isso.
2. **cod-0025 · Onboarding tranca comandos de pagamento [A3]** — bugfix real de usuário: nos steps
   0–1 todo texto é tratado como onboarding, então `/planos` e `/pix` não respondem até o primeiro
   cupom. Bloqueia conversão.
3. **Lastro (las-01..05)** — cobertura de testes em `alerts.js`, `monthlySummary.js`, `charts.js`,
   `scheduler.js`. **Ajuste:** `las-02` (testes de `reengagement.js`) desce, já que o subsistema
   está sendo desligado; **`las-03` (`monthlySummary.js`) sobe pro topo do lastro** — passou a ser
   a única mensagem proativa do produto, então é o job que menos pode quebrar em silêncio.

**Fim da fila (como você pediu):** cod-0044 → cod-0048 → cod-0049 *(a 0049 com a condição da
seção 1)*.

**Sem mudança:** cod-0062 e cod-0065 seguem aguardando material humano (comprovantes PIX e recibos
canadenses reais). cod-0066 segue `pausada`.

---

## 6. Comandos — na ordem

### Bloco 1 — Desentupir (sua máquina, hoje)

```bash
cd C:\Economizei
git status                 # confirma: 3 modificados + 2 novos em src/agent/ e test/
npm run check              # gate obrigatório — regra 11: só vale na SUA máquina
```

Se verde, no Claude Code:

```
/entregar
```

O `/entregar` vai cruzar o diff com as migrations pendentes (checagem bloqueante) e pedir a
palavra **APROVO** literal. Espere ele avisar de migration — o cod-0043 não usa nenhuma tabela
nova (contexto é em memória do processo), então não deve travar.

Depois do push:

```bash
git log --oneline -3
git status                 # tree limpo = esteira desentupida
```

### Bloco 2 — Supabase (navegador, ~20 min no total)

1. Supabase → SQL Editor → rodar o **S0** (as 3 queries de verificação) e guardar o resultado.
2. Rodar o **S1** (criar `lembretes_enviados`) → conferir com `SELECT to_regclass(...)`.
3. Railway → Variables → conferir `SUPABASE_SERVICE_ROLE_KEY` **e** `ADMIN_PHONE` (**S2**).
4. Railway → Deployments → Restart.
5. Logs do Railway: procurar `schema_guard_faltando`, `supabase_erro`, `incremento_fallback`.
6. **S3** só se a RPC não apareceu no S0. **S4** só depois do bot confirmado funcionando com a
   service_role. **S5 adiado.**

### Bloco 3 — Confirmar que o resumo de fim de mês está de pé

É a única mensagem proativa que fica (decisão de 05/08). Ela roda nos dias 28–31 às 9h. Para
confirmar sem esperar o fim do mês, procure nos logs do Railway a última execução:

```
resumo_mensal_disparando
resumo_mensal_resumo   { enviados: N, ... }
```

Se você quiser testar antes do dia 28, dá pra chamar `executarResumoMensal(mesRef)` manualmente —
mas com o volume atual de usuários isso é opcional.

### Bloco 4 — Ajustes de processo — ✅ **APLICADOS em 2026-08-05**

Decisão final: **B1 — Máquina 3.0, pilha de branches** (B3+B2 foram revertidos).

- ✅ **Rotina das 8:02 RELIGADA** (`economizei-rotina-matinal`, `enabled: true`), com descrição
  atualizada pro novo regime.
- ✅ **Teto por run restaurado:** até 3 P, OU 1 M, OU 1 lote, ≤ ~500 linhas.
- ✅ **A máquina passa a commitar em `maquina/cod-XXXX`** — nunca `main`, nunca `push`, com as
  3 Leis da pilha (§4-B1-DEFESAS).
- ✅ **Painel "📚 Pilha da máquina"** criado na AGENDA, com teto 3 e sinal de idade.
- ✅ **Ordem de escrita invertida** (Problema C, autorizado): relatório-cabeçalho como passo 0,
  AGENDA + pilha gravadas **antes** de exibir o diff, relatório completo por último. A run deixa
  rastro mesmo se morrer no meio.
- ⚠️ **Ação manual sua:** `.claude/` é diretório protegido nesta sessão, então não consegui
  escrever direto. Os **dois** comandos foram reescritos e estão prontos pra copiar:

```powershell
Copy-Item "C:\Economizei\Economizei app\tarefa_NOVO_2026-08-05.md" `
          "C:\Economizei\.claude\commands\tarefa.md" -Force
Copy-Item "C:\Economizei\Economizei app\entregar_NOVO_2026-08-05.md" `
          "C:\Economizei\.claude\commands\entregar.md" -Force
Remove-Item "C:\Economizei\Economizei app\tarefa_NOVO_2026-08-05.md"
Remove-Item "C:\Economizei\Economizei app\entregar_NOVO_2026-08-05.md"
```

> **Por que o `/entregar` também mudou:** ele era um "commitador de working tree". Agora precisa
> ser um "mergeador de pilha" — detectar as branches, mergear **na ordem**, rodar `npm run check`
> **no resultado do merge** (não só na branch), pushar, apagar as branches com `git branch -d`
> (nunca `-D`) e limpar o painel da pilha. Ele mantém os dois modos: **PILHA** (novo) e **TREE**
> (o antigo, pra quando você mesmo mexer no código).

---

## 7. O que continua bloqueado até a empresa BC (outubro/2026)

Sem alteração — nada neste plano depende disso nem antecipa nada:

- Meta Ads e Meta Business Manager
- Hotmart (planos anuais + programa de afiliados)
- Wise Business (recebimento de PIX)
- Stripe (Trilho A) — depende da conta canadense
- Qualquer escala de aquisição paga

E a regra 7 da §11 continua valendo por cima de tudo: **W2 ≥ 30% antes de escalar aquisição.** O que
este plano faz é garantir que, quando você medir W2, o motor de retenção esteja ligado — hoje não está.

---

## 7.5. 🚨 Achado de última hora — o corpus de regressão está com as imagens trocadas

> Descoberto em 2026-08-05, na conferência pré-`/entregar` do `test/corpus/` (material criado na
> sessão paralela de desdobramento Frente 1/Frente 2). **Bloqueia a entrega até ser corrigido.**

Li as 6 fotos de `test/corpus/canada/img/` e cruzei com as expectativas de `recibos.json`.
**Cinco das seis estão com o nome errado** — é uma rotação cíclica: o conteúdo que pertence ao
`ca-0N` está gravado no arquivo `ca-0(N+1)`.

| Arquivo hoje | Conteúdo REAL da foto | Expectativa do JSON com esse nome | Bate? |
|---|---|---|---|
| `ca-01-nofrills-denman-2026-07-29` | No Frills Denman · 26/07/29 · **23.24** | No Frills · 2026-07-29 · 23.24 | ✅ |
| `ca-02-independent-davie-2026-07-17` | **Revs Burnaby** · 27-JUL-26 · **46.03** | Independent · 2026-07-17 · 22.16 | ❌ |
| `ca-03-shoppers-denman-2026-07-29` | **Independent Davie** · 26/07/17 · **22.16** | Shoppers · 2026-07-29 · 8.95 | ❌ |
| `ca-04-nofrills-denman-2026-07-22` | **Shoppers Drug Mart Denman** · Jul 29 · **8.95** | No Frills · 2026-07-22 · 64.78 | ❌ |
| `ca-05-dollarama-comox-2026-07-29` | **No Frills Denman** · 26/07/22 · **64.78** | Dollarama · 2026-07-29 · 11.26 | ❌ |
| `ca-06-revs-bowling-2026-07-27` | **Dollarama Comox** · 2026-07-29 · **11.26** | Revs · 2026-07-27 · 46.03 | ❌ |

**As expectativas do `recibos.json` estão CORRETAS** — conferi cada total contra a foto real
(23.24 · 22.16 · 8.95 · 64.78 · 11.26 · 46.03, todos batem com algum recibo). **O erro é só o nome
do arquivo de imagem.**

**Por que isso é grave, e não cosmético:** o teste offline (default) lê só o JSON, então ele
**passa** — o defeito é invisível na rede de segurança. Só o teste `CORPUS_VISION=1` compararia
imagem × expectativa, e aí 5 de 6 falhariam. O risco real não é a falha: é alguém "consertar" o
JSON pra casar com a imagem errada e **destruir a verdade-base do corpus que protege o coração**
(classificação). Corpus com ground truth corrompido é pior que corpus nenhum, porque dá confiança
falsa.

**Correção (rotação de 5 posições, com arquivo temporário pra não sobrescrever):**

```powershell
cd "C:\Economizei\test\corpus\canada\img"
Rename-Item ca-02-independent-davie-2026-07-17.jpeg _tmp.jpeg
Rename-Item ca-03-shoppers-denman-2026-07-29.jpeg  ca-02-independent-davie-2026-07-17.jpeg
Rename-Item ca-04-nofrills-denman-2026-07-22.jpeg  ca-03-shoppers-denman-2026-07-29.jpeg
Rename-Item ca-05-dollarama-comox-2026-07-29.jpeg  ca-04-nofrills-denman-2026-07-22.jpeg
Rename-Item ca-06-revs-bowling-2026-07-27.jpeg     ca-05-dollarama-comox-2026-07-29.jpeg
Rename-Item _tmp.jpeg                              ca-06-revs-bowling-2026-07-27.jpeg
Get-ChildItem | Select-Object Name
```

**Varredura de privacidade (feita na mesma conferência) — ✅ limpa.** Os recibos mostram cartão
mascarado (`******0236`, `******2899`), nomes que são de **estabelecimento** (gerente/franqueado
impressos no cupom, informação comercial pública), sem nome de cliente, sem documento, sem dado de
saúde (o item do Shoppers é cosmético, não medicamento controlado). No `pix/comprovantes.json`, os
3 números que uma varredura de CPF acusa são **códigos ISPB de banco dentro do `id_transacao`**,
não CPF. A regra de privacidade do `test/corpus/README.md` está sendo cumprida.

---

## 8. Decisões — estado

**✅ Decididas nesta sessão (2026-08-05):**

- **B3 + B2** para o gargalo estrutural — cron das 8h desligado, teto por run em 1 P (≤150 linhas). Aplicado.
- **Ajuste do `tarefa.md`** autorizado — arquivo novo pronto, falta só o `Copy-Item` (Bloco 4).
- **Reengajamento fora por agora** — só a mensagem de fim de mês, que já existe e já funciona.
  Vira S1a/S1b (desligar cron + tirar do schema guard). Registrado no `CLAUDE.md`.

**⏳ Abertas:**

1. **Confirmar A1** — entregar o cod-0043 em vez de mandá-lo pro fim. É o que desentope a esteira;
   sem isso, nenhuma run futura roda.
2. **S4 (ligar RLS) entra agora ou pouco antes de Fernandópolis?** Depende do S2 estar confirmado
   primeiro. Rodar antes disso derruba o bot.
3. **Liberar ou manter pausada a cod-0066** (apagar as funções órfãs do MP) — hoje `pausada` por
   decisão sua de 27/07.

---

*Documento de plano, 2026-08-05. Não altera código, banco, firewall nem memória institucional. A
única alteração desta sessão é a reordenação da fila na `AGENDA.md`, autorizada pelo Gabriel.*
