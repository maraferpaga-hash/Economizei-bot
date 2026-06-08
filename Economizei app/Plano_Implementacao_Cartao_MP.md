# 💳 Assinatura recorrente no cartão — Mercado Pago

**Data:** 2026-06-07
**Objetivo:** cobrança automática no cartão (o usuário cadastra uma vez, o Mercado Pago cobra todo mês sozinho) — sem o atrito do PIX manual mensal. PIX manual continua existindo como alternativa.
**Restrição respeitada:** funciona **sem CNPJ** (conta MP pessoa física — a mesma do seu banco Mercado Pago).

---

## 1. Como funciona (visão de 30 segundos)

```
Usuário manda /assinar individual
        ↓
Bot pede o e-mail  →  usuário responde o e-mail
        ↓
Bot cria a assinatura no MP (link de checkout)  →  manda o link no WhatsApp
        ↓
Usuário abre o link, cadastra o cartão no site do Mercado Pago  (o cartão NUNCA passa pelo nosso servidor)
        ↓
MP aprova e avisa o bot por webhook  →  bot liga o is_pro e confirma no WhatsApp
        ↓
Todo mês o MP cobra de novo sozinho. Se recusar, o bot avisa o usuário.
```

**Modelo técnico:** "assinatura sem plano associado" (preapproval). Cada usuário ganha um link próprio com `external_reference = telefone`, que é o que liga o pagamento de volta à conta dele no nosso banco.

**Segurança:** o cartão fica no checkout hospedado do Mercado Pago (PCI é problema deles, não nosso). Todo webhook é reconferido com uma consulta à API do MP antes de liberar o Pro — então um webhook falso não consegue ativar nada.

---

## 2. Divisão 🤖 Robô (já feito) × 🧍 Humano (você precisa fazer)

### 🤖 O que o robô (código) já faz — PRONTO nesta sessão

| Item | Arquivo |
|---|---|
| 🤖 Módulo de integração com o MP (criar, consultar, cancelar assinatura, validar webhook) | `src/mercadopago.js` (novo) |
| 🤖 Endpoint que recebe os avisos do MP | `POST /webhook/mercadopago` em `src/index.js` |
| 🤖 Comandos `/assinar individual` `/assinar familia` `/assinar familia+`, `/pix`, `/cancelar` | `src/index.js` |
| 🤖 Captura do e-mail e geração do link de pagamento | `src/index.js` |
| 🤖 Liga/desliga `is_pro` conforme o status da assinatura + avisa o usuário | `src/index.js` + `src/supabase.js` |
| 🤖 Avisa quando a renovação mensal é recusada | `src/index.js` |
| 🤖 Converte indicação quando o indicado vira pagante | `src/index.js` (integra com o `/convidar`) |
| 🤖 Mensagens em PT-BR de todo o fluxo | `src/formatter.js` |
| 🤖 Estrutura de banco (colunas + tabela de eventos) | `supabase/migration_2026-06-07_assinaturas_mp.sql` (novo) |
| 🤖 Variáveis novas documentadas | `.env.example` |

> Tudo isso já passou no `node --check` e em teste de carga dos módulos. **Não precisa mexer no código** — só ativar.

### 🧍 O que só você pode fazer (ativação)

Faça **nesta ordem**. Sem esses passos, o código fica dormindo (os comandos respondem, mas nenhuma cobrança acontece).

---

#### 🧍 Passo 1 — Criar a aplicação no Mercado Pago
1. Acesse **https://www.mercadopago.com.br/developers/panel/app** (logado na sua conta MP do banco).
2. Clique em **Criar aplicação**.
3. Nome: `Economizei`. Em "solução de pagamento", escolha **Assinaturas / Pagamentos recorrentes** (CheckoutPro/Subscriptions).
4. Salve.

#### 🧍 Passo 2 — Pegar o Access Token
1. Dentro da aplicação → menu **Credenciais**.
2. Vão existir dois conjuntos:
   - **Credenciais de teste** → `Access Token` começa com `TEST-...` (use primeiro, pra testar sem cobrar de verdade).
   - **Credenciais de produção** → `Access Token` começa com `APP_USR-...` (use quando for pra valer).
3. Copie o **Access Token** (começa com TEST nos testes).

#### 🧍 Passo 3 — Configurar o webhook + pegar o secret
1. Dentro da aplicação → menu **Webhooks** / **Notificações**.
2. Em **URL de produção**, coloque:
   `https://SEU-BOT.up.railway.app/webhook/mercadopago`
   (troque pelo domínio real do seu bot no Railway).
3. Marque os eventos de **Assinaturas / Planos e Assinaturas** (`subscription_preapproval` e `subscription_authorized_payment`).
4. Salve. O painel gera uma **assinatura secreta (secret)** — copie. É o `MP_WEBHOOK_SECRET`.

> **Se o painel não deixar configurar webhook pra assinaturas:** sem problema. O código já manda a URL de notificação junto de cada assinatura (via `MP_WEBHOOK_URL`). Nesse caso, deixe o `MP_WEBHOOK_SECRET` **vazio** — o bot continua seguro porque reconsulta o MP antes de liberar o Pro. O secret é uma camada extra, não obrigatória.

#### 🧍 Passo 4 — Rodar a migration no Supabase
1. Supabase → **SQL Editor**.
2. Cole e rode o conteúdo de `supabase/migration_2026-06-07_assinaturas_mp.sql`.
3. Confirme que as colunas novas apareceram em `usuarios` e que a tabela `assinatura_eventos` foi criada.

> ⚠️ Faça isso **antes** do deploy do código novo. Sem as colunas, o bot dá erro ao tentar gravar a assinatura.

#### 🧍 Passo 5 — Configurar as variáveis no Railway
No painel do Railway → seu serviço → **Variables**, adicione:

| Variável | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | o Access Token (TEST-... nos testes, APP_USR-... em produção) |
| `MP_WEBHOOK_URL` | `https://SEU-BOT.up.railway.app/webhook/mercadopago` |
| `MP_BACK_URL` | pra onde o usuário volta após pagar (ex: `https://economizei.app`) |
| `MP_WEBHOOK_SECRET` | o secret do Passo 3 (ou deixe vazio) |
| `PIX_KEY` | sua chave PIX (pro comando `/pix` funcionar) |
| `BOT_PHONE` | número do bot, se ainda não estiver setado (pro `/convidar`) |

#### 🧍 Passo 6 — Subir o código (deploy)
- `git push` no seu repositório (o Railway faz deploy automático).
- Lembrete do projeto: o push é sempre feito por você na sua máquina — o ambiente Cowork não tem credencial do GitHub.

#### 🧍 Passo 7 — Testar (com cartão de teste, sem cobrar de verdade)
1. Garanta que está com o **Access Token de TESTE** no Railway.
2. No WhatsApp do bot, mande: `/assinar individual`.
3. Responda com um e-mail qualquer (ex: o seu).
4. Abra o link que o bot mandar.
5. Pague com um **cartão de teste do MP** (na doc do MP, seção "Cartões de teste" — ex: Mastercard `5031 4332 1540 6351`, qualquer CVV, validade futura, nome `APRO` para aprovar).
6. Confirme que o bot mandou "Plano ativado!" e que no Supabase o seu `is_pro` virou `true` e o `assinatura_status` virou `authorized`.
7. Teste o `/cancelar` e confira que `is_pro` volta pra `false`.

#### 🧍 Passo 8 — Virar a chave pra produção
1. Troque o `MP_ACCESS_TOKEN` no Railway pelo de **produção** (`APP_USR-...`).
2. (Se usou) troque o `MP_WEBHOOK_SECRET` pelo de produção.
3. Faça um teste real com o seu próprio cartão e um valor real (pode cancelar logo depois). Pronto pra divulgar.

---

## 3. Comandos novos pro usuário

| Comando | O que faz |
|---|---|
| `/planos` | Mostra os 4 planos e como assinar (cartão ou PIX) |
| `/assinar individual` | Inicia a assinatura no cartão do plano Individual (R$ 9,90) |
| `/assinar familia` | Plano Família (R$ 15) |
| `/assinar familia+` | Plano Família+ (R$ 22) |
| `/pix` | Mostra a chave PIX (pagamento manual) |
| `/cancelar` | Cancela a assinatura no cartão (ou aborta o cadastro em andamento) |

---

## 4. Pontos de atenção honestos

- **Taxa do MP no ticket baixo:** a taxa de assinatura no cartão fica em torno de ~5% (varia com o prazo de liberação que você escolher no painel). Num ticket de R$ 9,90 isso é ~R$ 0,50. Aceitável, mas é bom acompanhar na planilha de unit economics.
- **Recompensa de indicação (`/convidar`):** quando um indicado vira pagante pelo cartão, o sistema já converte a indicação e recompensa o indicador automaticamente. As *funções* Pro recompensadas (comparativo + alerta inteligente) ainda não existem no código — então a recompensa fica gravada, mas só "morde" quando essas features forem construídas. (Mesma ressalva já registrada pro `/convidar`.)
- **PIX manual coexiste:** o fluxo de PIX (`/pix` + comprovante + `POST /admin/ativar-pro`) continua valendo pra quem não quiser cartão.
- **Pré-requisito de deploy:** rodar a migration **antes** do push (Passo 4 antes do 6).

---

## 5. Checklist rápido de ativação

- [ ] 🧍 Aplicação criada no painel MP
- [ ] 🧍 Access Token copiado (teste e produção)
- [ ] 🧍 Webhook configurado + secret copiado (ou ciente de que vai sem secret)
- [ ] 🧍 `migration_2026-06-07_assinaturas_mp.sql` rodada no Supabase
- [ ] 🧍 Variáveis `MP_*` + `PIX_KEY` no Railway
- [ ] 🧍 `git push` (deploy)
- [ ] 🧍 Teste com cartão de teste OK (is_pro liga e desliga)
- [ ] 🧍 Trocado pro Access Token de produção
