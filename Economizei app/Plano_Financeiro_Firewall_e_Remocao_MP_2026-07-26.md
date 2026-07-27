# 🔧 Plano — Simplificar o financeiro: afrouxar o firewall + remover o Mercado Pago (2026-07-26)

> **O que é:** o "outro texto" que combinamos pra desenvolver, com calma, a decisão de destravar o financeiro. Nasce das suas 4 respostas de hoje. **Este doc é plano, não execução** — nada de código ou banco foi mexido. Ele existe pra a gente alinhar a ordem certa antes de mover qualquer coisa, porque tem um passo (apagar colunas do banco) que, feito fora de ordem, derruba o bot.
>
> **Contexto:** sem a empresa BC até out/2026, a monetização em escala está pausada; a janela é de construção. Você vai mexer MUITO no financeiro pra montar os dois trilhos (direto + Hotmart/afiliados), e o firewall — desenhado pra "máquina constrói, humano guarda o dinheiro" — virou atrito porque agora **você** é quem constrói o dinheiro.

---

## 1. Suas decisões de hoje (e uma tensão pra confirmar)

| Pergunta | Sua resposta |
|---|---|
| Firewall | **Afrouxar, com guarda mínimo** |
| Quem commita o financeiro | **Você ainda commita tudo** |
| Rotina das 8h pode tocar dinheiro | **Sim, pode** |
| Escopo do "apagar Mercado Pago" | **Código + limpar o banco** |

**⚠️ Uma tensão que preciso confirmar antes de escrever qualquer linha.** Você marcou *"afrouxar com guarda mínimo"* (onde o guarda mínimo que descrevi era "a rotina das 8h fica barrada do dinheiro") **e** *"a rotina pode tocar dinheiro"*. Os dois juntos se contradizem na definição que eu tinha dado. Minha leitura do que você quer — me confirma se está certa:

> **O guarda que sobra não é uma parede, é um aviso + o seu commit.** O firewall deixa de *bloquear* e passa a só *avisar* ("olha, isso aqui mexe em dinheiro"). A rotina das 8h pode até **escrever** código de pagamento sozinha, porque ela **nunca commita** — e você revisa tudo antes de subir (sua resposta 2). Então o que te protege de verdade não é mais a trava mecânica; é o **seu olho no `/entregar`** + a checagem de migrations que já existe. É isso?

Se sim, o desenho abaixo funciona. Se você quiser algo ainda mais solto (nem o aviso), a gente ajusta.

---

## 2. Novo modelo do firewall — de "parede" pra "aviso"

**Hoje:** `scripts/check-firewall.mjs` roda dentro do `npm run check` e **reprova** (exit ≠ 0) qualquer diff que toque dinheiro. É o que te barra.

**Proposto — 3 mudanças:**

1. **A trava vira advisory (avisa, não reprova).** O `check-firewall.mjs` passa a **listar** o que tocou dinheiro e retornar **exit 0** (sucesso) — o `npm run check` não trava mais por causa dele. Você continua vendo o aviso ("este diff mexe em `is_pro`/pagamento") na hora de revisar, mas ele não te impede de nada. *(Alternativa, se preferir mais limpo: tirar o firewall do `npm run check` e deixá-lo como um comando separado `npm run flag:financeiro` que você roda quando quiser o aviso.)*

2. **A "Zona proibida" da AGENDA vira "Zona sensível".** Muda de "a máquina NUNCA toca" pra "a máquina PODE tocar; você revisa com atenção extra antes de commitar". A lista de arquivos continua útil como *checklist de atenção*, não como muro.

3. **O `/entregar` mantém a checagem de migrations/schema (isto NÃO é firewall — é anti-A9).** Essa parte fica, e fica importante **justamente por causa da remoção do MP** (seção 3): ela é o que impede um push de deployar código que lê uma coluna que você já apagou. É a rede que continua valendo a pena.

**O que muda na prática pra você:** para de ter que "voltar toda hora no código" e "comandar o processo" — eu escrevo pagamento à vontade na sessão, a rotina das 8h pode adiantar tarefas de pagamento, e o único gate que sobra é o que você **quer** que sobre: seu commit + o aviso + a checagem de migration.

**Regras de memória que precisam ser reescritas** (CLAUDE.md seção 11 e AGENDA): a regra 2 ("firewall inegociável") e a regra 3 ("máquina nunca commita") — a 3 você quer **manter** (você commita tudo); a 2 muda de "inegociável/bloqueante" pra "advisory durante a fase de construção do financeiro". Eu faço essa reescrita quando você aprovar.

---

## 3. Remover o Mercado Pago — o mapa exato + a ORDEM que não pode inverter

> 🚨 **A regra de ouro desta seção:** **código primeiro, banco depois.** O `upsertUsuario` (`supabase.js:24`) lê as colunas de assinatura em **toda mensagem** que chega. Se você apagar as colunas do banco **antes** de tirar o código que as lê, o bot quebra em cima de cada usuário — é o incidente A9 de novo, ao contrário. A sequência abaixo respeita isso.

### Passo A — Código (eu escrevo, você revisa e commita via `/entregar`)

**Apagar de vez:**
- `src/mercadopago.js` — o módulo inteiro.
- `src/index.js`: o handler `POST /webhook/mercadopago` + `processarWebhookMP`; o comando `/assinar` (`iniciarAssinatura`/`finalizarAssinatura`); o fluxo de "e-mail pendente" da assinatura; o `/cancelar` de assinatura MP.
- `src/formatter.js`: as mensagens só-de-MP (`montarMensagemPedirEmail`, `montarMensagemLinkAssinatura`, `montarMensagemJaAssinante`, `montarMensagemAssinaturaCancelada`, `montarMensagemErroAssinatura`, `montarMensagemCobrancaRecusada`).
- `src/supabase.js`: **remover as colunas de assinatura do SELECT do `upsertUsuario` (linha 24)** ← este é o passo que destrava o banco com segurança; + apagar `setPendentePlano`, `limparPendentePlano`, `salvarAssinaturaPreapproval`, `atualizarStatusAssinatura`.

**Ajustar (não apagar):**
- `montarMensagemPlanos` — tirar a menção a `/assinar` e a "cartão via Mercado Pago"; manter o caminho do PIX.

### Passo B — Deploy + conferir (sua mão)
Subir o Passo A, mandar um cupom e um "oi", confirmar nos logs que **não há `supabase_erro`** por coluna inexistente. Só depois disso o banco pode ser mexido.

### Passo C — Banco (sua mão, destrutivo — **backup antes**)
`[Supabase → SQL Editor]`, depois de confirmar o Passo B:
- `DROP TABLE assinatura_eventos;`
- `ALTER TABLE usuarios DROP COLUMN` para: `plano`, `assinatura_status`, `assinatura_pendente_plano`, `mp_preapproval_id`, `assinatura_email`, `assinatura_atualizada_em`.
- Marcar a migration `migration_2026-06-07_assinaturas_mp.sql` como revogada (comentário no topo).

Escrevo o `.sql` exato — com um `SELECT` de conferência antes de cada `DROP` — quando você der o ok.

---

## 4. O que FICA de pé (não confundir com "apagar o financeiro")

- **`is_pro`** — a chave que liga o Pro. É o ponto de convergência dos dois trilhos futuros. **Fica.**
- **`POST /admin/ativar-pro`** — o endpoint que liga o `is_pro` na mão (e dispara a recompensa de indicação). É por onde Stripe e Hotmart vão entrar depois. **Fica.**
- **`/pix` + sua chave PIX** (`montarMensagemPix`, `PIX_KEY`) — como você pediu, pra estabilidade. **Fica.**
- **`features_pro_ate` / `concederFeaturesPro`** — a janela de Pro da indicação; não é do MP. **Fica.**
- **`marcarProAtivo`** — liga `is_pro=true`; usada pelo `/admin/ativar-pro`. **Fica.**

Ou seja: o `/assinar` (o "Barra Sinal" que você quer aposentar) sai; o meio de ligar o Pro e o PIX continuam. Fica coerente com o "Pro em breve" que a gente decidiu na conversa passada.

---

## 5. 🩺 Bônus — 2 problemas de saúde do banco (achados nas suas imagens)

Já que você vai estar no SQL Editor de qualquer jeito, valem a mesma ida:

1. **RLS bloqueando a dedup.** O log mostra `supabase_erro fn: registrarMensagemProcessada erro: new row violates row-level security policy`. A `mensagens_processadas` está com RLS ligado sem policy de insert pro bot → o registro de deduplicação falha em toda mensagem (o cupom ainda processa, fail-open, mas sem proteção contra a mesma foto entrar 2x). Fix: uma policy de insert (ou alinhar a service key). Escrevo o SQL.
2. **`lembretes_enviados` não existe em produção.** O schema guard pegou ("Could not find the table 'public.lembretes_enviados'"). É a migration do reengajamento que nunca rodou. Enquanto não roda, os lembretes D3/D10 não têm onde registrar o que já mandaram.

*(E uma curiosidade a confirmar: há tabelas em inglês no banco — `price_history`, `products_normalized`, `purchase_items`, `purchases`, `stores` — que não são do código do Economizei. Provável resíduo de outro experimento. Se for lixo, dá pra limpar.)*

---

## 6. Próximos passos — o que preciso de você

1. **Confirmar a tensão da seção 1** (firewall vira aviso + seu commit é o gate; rotina pode escrever mas não commita). Sim/ajustar.
2. **Confirmar o escopo do banco** (seção 3 Passo C) — os `DROP` são irreversíveis; ok fazer com backup antes?
3. Com isso, eu executo na ordem: **(a)** reescrevo o `check-firewall.mjs` pra advisory + atualizo AGENDA/CLAUDE.md; **(b)** escrevo o Passo A (remoção do código MP) pra você revisar/commitar; **(c)** te entrego o `.sql` do Passo C pra rodar **depois** do deploy do Passo A.

> Nada disso roda sem seu ok. E mesmo com o firewall afrouxado, **você continua sendo quem commita** — então o freio final é sempre seu.

*Plano escrito em 2026-07-26. Documento de decisão; não altera código, banco, firewall nem memória institucional.*
