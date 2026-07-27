# ✅ Passo a passo — fechar a simplificação do financeiro (2026-07-26)

> **Como ler:** cada passo diz **onde** rodar (`[Terminal em C:\Economizei]`, `[Railway]`, `[Supabase → SQL Editor]`, `[WhatsApp]`) e o **resultado esperado**. Faça **na ordem**, de cima pra baixo. O passo do banco (5) só depois do deploy (4) — nunca antes.
>
> **Decisões que guiaram isto (suas, hoje):** firewall vira aviso (não barreira) · a rotina das 8h pode mexer em pagamento · você commita tudo · apagar o Mercado Pago (código + banco) · manter o `/pix`.

---

## 0. O que eu já deixei pronto no working tree (nada commitado — é o que você vai revisar)

- **`scripts/check-firewall.mjs` → modo advisory.** Ainda lista o que toca dinheiro, mas **sempre sai com exit 0** (não trava mais o `npm run check`). Selftest 19/19.
- **`src/index.js`** — removido TODO o Mercado Pago: imports, rota `POST /webhook/mercadopago`, comando `/assinar`, fluxo de e-mail da assinatura, `/cancelar-assinatura`, e as funções (`iniciarAssinatura`, `finalizarAssinatura`, `processarWebhookMP`, conciliações). `node --check` OK, zero referência ao MP sobrando.
- **`src/supabase.js`** — o `SELECT` do `upsertUsuario` **parou de ler** as colunas de MP (`plano`, `assinatura_status`, `assinatura_pendente_plano`, `mp_preapproval_id`). É isto que torna o DROP do Passo 5 seguro.
- **`src/formatter.js`** — `montarMensagemPlanos` sem `/assinar`; agora aponta pro `/pix`.
- **`AGENDA.md` + `CLAUDE.md`** — regras atualizadas (zona sensível/advisory) + os 2 problemas de saúde do banco enfileirados.
- **Testes:** 331/331 de lógica verdes no sandbox (7 falham só por `SIGBUS` do `sharp`, que é do sandbox Linux — no seu Windows passam).
- **Ficou como código morto** (limpeza fast-follow, já na AGENDA): as funções MP órfãs em `supabase.js`/`formatter.js`. Inócuas (ninguém chama).
- **Não consegui deletar `src/mercadopago.js`** (o bash do sandbox não teve permissão) → é o seu Passo 1.

---

## PASSO 1 — Deletar o arquivo do Mercado Pago
`[Terminal em C:\Economizei]`
```bash
git rm src/mercadopago.js
```
**Esperado:** `rm 'src/mercadopago.js'`. (Nada mais importa esse arquivo, então some sem quebrar nada.)

---

## PASSO 2 — Revisar e rodar a rede de segurança
`[Terminal em C:\Economizei]`
```bash
git status
npm run check
```
**Esperado:**
- O `git status` mostra modificados: `scripts/check-firewall.mjs`, `src/index.js`, `src/supabase.js`, `src/formatter.js`, `AGENDA.md`, `CLAUDE.md`, e deletado `src/mercadopago.js`.
- O `npm run check` agora **imprime um aviso** tipo `⚠️ AVISO DO FIREWALL — este diff toca a zona financeira/sensível…` **mas NÃO trava** — segue direto pros testes.
- Testes **verdes** (no seu Windows o `sharp` funciona, então 0 falha). `check-pages` OK.
- Se algum teste falhar por algo que **não** seja `sharp`/`SIGBUS`, me chame antes de commitar.

---

## PASSO 3 — Commitar (via `/entregar` ou git direto)
`[Claude Code: /entregar]` — ele mostra o diff, você lê e digita **APROVO**.
- ⚠️ O `/entregar` tem a checagem bloqueante de migrations. Aqui **não há migration nova** no diff (o DROP do banco é o Passo 5, manual e depois), então ele **não vai barrar**. É esperado.
- O diff **remove as colunas do SELECT** mas **não mexe no banco** — isso é de propósito: o código para de ler as colunas **antes** de elas serem dropadas.

Ou, se preferir manual:
```bash
git add -A
git commit -m "chore(financeiro): firewall advisory + remove Mercado Pago (mantém /pix, is_pro, /admin/ativar-pro)"
git push
```
**Esperado:** push aceito → o Railway começa um deploy automático.

---

## PASSO 4 — Confirmar o deploy (ANTES de tocar o banco)
`[Railway → Deployments]` — o último deploy fica **verde/Active**.

Depois, no `[WhatsApp]`, mande pro bot e confira:
| Você manda | Esperado |
|---|---|
| um **cupom** | processa e responde normal (o coração intacto) |
| `/pix` | mostra sua chave PIX (intacto) |
| `/planos` | lista os planos **sem** `/assinar`; aponta pro `/pix` |
| `/assinar` | **não** inicia mais nada de cartão/Mercado Pago |

`[Railway → Logs]` — **não pode** aparecer `supabase_erro` reclamando de coluna inexistente. (Não vai, porque o SELECT já não pede as colunas de MP.)

> ✅ Só avance pro Passo 5 se o Passo 4 deu tudo certo. Se o bot parar de responder, me chame — dá pra reverter o deploy no Railway na hora.

---

## PASSO 5 — Limpar o banco (DROP das colunas/tabela do MP)
`[Supabase → SQL Editor]` — **só depois do Passo 4**. Faça em 3 blocos, na ordem.

**5a. Conferir o que existe (não altera nada):**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='usuarios'
  AND column_name IN ('plano','assinatura_status','assinatura_pendente_plano',
                      'mp_preapproval_id','assinatura_email','assinatura_atualizada_em');
```
**Esperado:** lista as colunas de MP que ainda existem (as que vamos dropar).

**5b. (Opcional) guardar o histórico antes de apagar:**
```sql
SELECT count(*) AS eventos_mp FROM assinatura_eventos;
```
Se quiser guardar, exporte o resultado (botão de download do editor) antes do DROP.

**5c. Dropar (irreversível):**
```sql
ALTER TABLE usuarios
  DROP COLUMN IF EXISTS plano,
  DROP COLUMN IF EXISTS assinatura_status,
  DROP COLUMN IF EXISTS assinatura_pendente_plano,
  DROP COLUMN IF EXISTS mp_preapproval_id,
  DROP COLUMN IF EXISTS assinatura_email,
  DROP COLUMN IF EXISTS assinatura_atualizada_em;

DROP TABLE IF EXISTS assinatura_eventos;
```
**Esperado:** `ALTER TABLE` e `DROP TABLE` executam sem erro.
> 💡 Se quiser **guardar a coluna `plano`** pra uso futuro (marcar o tier do usuário nos dois trilhos), é só **tirar a linha `DROP COLUMN IF EXISTS plano,`** — o resto pode dropar igual.

**5d. Confirmar que o bot segue de pé:** mande um cupom no WhatsApp. Deve processar normal (o código já não dependia dessas colunas).

---

## Pronto — o que fica pra DEPOIS (não é desta sessão)

Já está tudo anotado na AGENDA pra não esquecer:
- **Limpeza do código morto** — apagar as funções MP órfãs em `supabase.js`/`formatter.js`. Agora é tarefa de máquina (firewall advisory).
- **2 problemas de saúde do banco** (achados hoje): a **RLS bloqueando a dedup** (`mensagens_processadas`) e a tabela **`lembretes_enviados` faltando**. A gente desdobra numa próxima.
- **Rollout da autenticação do webhook (cod-0053)** — item separado da sessão passada (setar `ZAPI_WEBHOOK_TOKEN` no Railway + reconfigurar o Z-API). Roteiro próprio: `Economizei app/Roteiro_Teste_Webhook_Auth_2026-07-24.md`.

*Passo a passo gerado em 2026-07-26. As mudanças de código estão no working tree aguardando o seu `/entregar`; o banco (Passo 5) e o deploy são sua mão.*
