# Prompt — Implementar sistema de reengajamento (lembretes amigáveis)

> **Para Claude Opus.** Leia tudo antes de começar. Este prompt é autocontido — não precisa de contexto externo além dos arquivos listados abaixo.

---

## Contexto do projeto

**Economizei** é um bot de WhatsApp (Node.js + Express) que analisa cupons fiscais via foto usando Gemini Vision. O usuário manda a foto, o bot classifica os gastos. Stack: Z-API (WhatsApp) → Express → Gemini 2.5 Flash → Supabase (PostgreSQL).

**Arquivos-chave para ler antes de começar:**
- `src/scheduler.js` — cron jobs existentes (node-cron, já roda no processo principal)
- `src/supabase.js` — todas as funções de banco. Padrão: async/await, try/catch, log de erro via `log()`
- `src/formatter.js` — templates de mensagem. Padrão: funções `montar*()` que retornam string
- `src/index.js` — webhook principal, para entender o fluxo completo
- `src/zapi.js` — funções `enviarMensagem(phone, texto)` e `baixarImagem(url)`
- `src/logger.js` — `log(evento, dados)` e `maskPhone(phone)`

**Convenções obrigatórias do projeto:**
- Todos os logs via `log('nome_evento', { chave: valor })` — nunca `console.log` direto
- Telefones em logs sempre via `maskPhone(phone)`
- Funções Supabase: async, try/catch, throw no catch, log no catch
- Mensagens ao usuário: português brasileiro, tom amigável, sem jargão tech
- Linguagem formal (não usar "cê", "tá" — isso é só pra roteiros de marketing)
- Arquivos novos em `src/` — um módulo por responsabilidade

---

## Objetivo

Implementar um sistema de **lembretes de reengajamento**: mensagens proativas enviadas via Z-API para usuários inativos, com tom de amizade (não de cobrança). O sistema roda via cron diário já dentro do processo Express existente.

---

## Gatilhos e mensagens (implementar todos)

### Segmento A — Nunca mandou cupom (onboarding_step < 3)

| Gatilho | Condição | ID do lembrete |
|---|---|---|
| Dia 2 sem ação | `criado_em` há 2 dias + `compras_mes_atual = 0` + `onboarding_step < 3` | `onboarding_d2` |
| Dia 7 sem ação | Igual, mas 7 dias | `onboarding_d7` |

**Mensagem `onboarding_d2`:**
```
Oi! Tudo bem? 😊

Só passando para lembrar que estou aqui — quando for ao mercado, é só guardar o cupom e me mandar uma foto.

Não precisa de cadastro, não precisa de app. É só a foto mesmo.
```

**Mensagem `onboarding_d7`:**
```
Oi! Faz uma semana que você se cadastrou aqui. 👋

Se ainda não experimentou, que tal hoje? Pega o próximo cupom do mercado e manda pra mim — em menos de um minuto você já vê o resumo da compra.

Estou aqui quando você quiser.
```

---

### Segmento B — Já mandou cupom mas sumiu

Condição base: `compras_mes_atual > 0` OU tem ao menos 1 registro na tabela `compras`.
Referência de "última atividade": data da última linha em `compras` desse usuário.

| Gatilho | Condição | ID do lembrete |
|---|---|---|
| 3 dias sem cupom | Última compra há 3 dias | `inativo_d3` |
| 10 dias sem cupom | Última compra há 10 dias | `inativo_d10` |
| 30 dias sem cupom | Última compra há 30 dias | `inativo_d30` |
| 60 dias sem cupom | Última compra há 60 dias | `inativo_d60` |

**Mensagem `inativo_d3`:**
```
Oi! Passou mais algum dia no mercado? 🛒

É só mandar a foto do cupom quando tiver — fico aqui registrando tudo pra você.
```

**Mensagem `inativo_d10`:**
```
Oi! Você já tem [X] compra(s) registrada(s) aqui comigo este mês.

Quando fechar o mês, te mando um resumo completo de tudo que gastou. Ainda dá tempo de completar — manda mais um cupom quando puder. 📋
```
> Substituir `[X]` pelo valor real de `compras_mes_atual` do usuário (ou contagem do mês corrente).

**Mensagem `inativo_d30`:**
```
Faz um tempinho que você não passa por aqui. 

Se quiser retomar, é só mandar a foto do cupom do próximo mercado — sem pressa, sem cobranças. Estou aqui quando precisar. 😊
```

**Mensagem `inativo_d60`:**
```
Oi! Faz dois meses desde a última vez que você me mandou um cupom.

Se quiser continuar controlando os gastos no mercado, é só me mandar uma foto quando for às compras. E se preferir parar por aqui, tudo bem também — é só mandar */apagar* e deleto tudo.
```

---

### Segmento C — Fim de mês com cupons abertos

| Gatilho | Condição | ID do lembrete |
|---|---|---|
| Fim de mês — usuário ativo com cupons | Dias 26–27 do mês + tem ao menos 1 cupom no mês + `onboarding_step >= 3` | `fim_mes_d26` |

> **Atenção:** Este gatilho NÃO deve disparar para os usuários que já recebem o resumo mensal automático no último dia do mês (o scheduler existente em `scheduler.js` já cuida disso). O `fim_mes_d26` é um *teaser* 2–3 dias antes, não o resumo em si.

**Mensagem `fim_mes_d26`:**
```
O mês está quase fechando! 📅

Você tem [X] compra(s) registrada(s) até agora. Se ainda tiver cupons guardados, manda pra mim antes do fim do mês — assim consigo montar um balanço completo pra você.
```
> Substituir `[X]` pelo valor real.

---

### Segmento D — Perto do limite gratuito

| Gatilho | Condição | ID do lembrete |
|---|---|---|
| 8 de 10 cupons usados | `compras_mes_atual = 8` + `is_pro = false` | `limite_aviso_8` |

**Mensagem `limite_aviso_8`:**
```
Você já usou 8 dos 10 cupons gratuitos deste mês. 📊

Ainda dá para mais 2 registros. Se quiser continuar sem limite, dá uma olhada nos planos — é só mandar */planos* aqui.
```

---

## O que implementar

### 1. Tabela Supabase — `lembretes_enviados`

Criar migration SQL (arquivo `supabase/migrations/create_lembretes_enviados.sql`):

```sql
CREATE TABLE IF NOT EXISTS lembretes_enviados (
  id            BIGSERIAL PRIMARY KEY,
  phone_number  TEXT NOT NULL,
  lembrete_id   TEXT NOT NULL,  -- ex: 'onboarding_d7', 'inativo_d10'
  enviado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mes_referencia TEXT,          -- 'YYYY-MM', preenchido só pra lembretes mensais
  CONSTRAINT unique_lembrete_por_usuario UNIQUE (phone_number, lembrete_id, mes_referencia)
);

CREATE INDEX IF NOT EXISTS idx_lembretes_phone ON lembretes_enviados (phone_number);
```

> O `UNIQUE` garante que o mesmo lembrete não seja enviado duas vezes para o mesmo usuário no mesmo mês (para mensais) ou nunca (para os de ciclo único como `onboarding_d7`). Para lembretes mensais, `mes_referencia` é 'YYYY-MM'. Para os outros, `mes_referencia` é `NULL`.

### 2. Novo módulo `src/reengagement.js`

Responsabilidade: toda a lógica de reengajamento. Exporta uma função `executarReengajamento()`.

**Estrutura esperada:**

```js
// src/reengagement.js
const { log, maskPhone } = require('./logger');
const { enviarMensagem } = require('./zapi');
const supabase = require('./supabase'); // ou createClient direto se necessário

async function executarReengajamento() {
  // 1. Para cada segmento (A, B, C, D):
  //    a. Busca usuários elegíveis no Supabase
  //    b. Para cada usuário, verifica se o lembrete já foi enviado (tabela lembretes_enviados)
  //    c. Se não foi: envia via enviarMensagem(), registra na tabela, loga
  //    d. Se já foi: skip silencioso
  // 2. Loga resumo ao final: { enviados: N, skipped: N, erros: N }
}

module.exports = { executarReengajamento };
```

**Regras importantes:**
- Processar no máximo **50 usuários por segmento por execução** (evitar sobrecarga no Z-API)
- Aguardar **1.5 segundos entre cada envio** (respeitar rate limit do Z-API)
- Nunca enviar mais de **1 lembrete por usuário por execução** (mesmo que seja elegível em vários segmentos — prioridade: D > C > B > A)
- Erro em um usuário não deve parar o loop — capturar, logar e continuar
- Não enviar para usuários com `onboarding_step = 0` (nunca nem responderam a boas-vindas)

### 3. Novas funções em `src/supabase.js`

Adicionar ao final do arquivo (antes do `module.exports`):

```js
// Retorna usuários elegíveis para lembrete de onboarding (nunca mandaram cupom)
async function buscarElegiveisOnboarding(diasDesde) { ... }

// Retorna usuários com última compra exatamente há N dias
async function buscarElegiveisInativos(diasDesde) { ... }

// Retorna usuários com compras_mes_atual >= 8 e is_pro = false (limite)
async function buscarElegiveisLimiteAviso() { ... }

// Retorna usuários ativos no mês corrente (para aviso de fim de mês)
async function buscarElegiveisFinsDeMes() { ... }

// Verifica se lembrete já foi enviado para o usuário
async function lembreteFoiEnviado(phoneNumber, lembreteId, mesReferencia = null) { ... }

// Registra que o lembrete foi enviado
async function registrarLembreteEnviado(phoneNumber, lembreteId, mesReferencia = null) { ... }
```

Exportar todas no `module.exports` existente.

### 4. Novos templates em `src/formatter.js`

Adicionar as funções `montarLembrete*()` correspondentes a cada mensagem listada acima. Todas seguem o padrão existente: função pura, retorna string, sem efeitos colaterais.

Exemplo de assinatura:
```js
function montarLembreteInativoD10(qtdComprasMes) { ... }
function montarLembreteFimMes(qtdComprasMes) { ... }
// etc.
```

Exportar todas no `module.exports`.

### 5. Integrar ao `src/scheduler.js`

Adicionar ao `iniciar()`:

```js
const { executarReengajamento } = require('./reengagement');

// Roda todo dia às 10h (horário de Brasília)
cron.schedule('0 10 * * *', async () => {
  log('reengajamento_disparando', { hora: new Date().toISOString() });
  try {
    await executarReengajamento();
  } catch (err) {
    log('reengajamento_erro', { erro: err.message });
  }
}, { timezone: 'America/Sao_Paulo' });
```

---

## O que NÃO fazer

- Não criar endpoint HTTP para o reengajamento (o cron basta)
- Não usar `console.log` — sempre `log()`
- Não enviar mensagem se o usuário não interagiu nem uma vez (onboarding_step = 0)
- Não enviar mais de 1 lembrete por execução por usuário
- Não duplicar lembrete: checar `lembretes_enviados` antes de enviar
- Não usar linguagem informal (sem "cê", "tá", emojis em excesso)
- Não criar novas dependências npm além das já existentes

---

## Entregáveis esperados

1. `supabase/migrations/create_lembretes_enviados.sql` — SQL da nova tabela
2. `src/reengagement.js` — módulo principal (novo arquivo)
3. `src/supabase.js` — atualizado com novas funções + exports
4. `src/formatter.js` — atualizado com novos templates
5. `src/scheduler.js` — atualizado com novo cron às 10h

Após implementar, rodar uma verificação rápida:
- `node -e "require('./src/reengagement')"` deve retornar sem erro de sintaxe
- Confirmar que o `module.exports` do `supabase.js` inclui todas as novas funções
- Confirmar que o `module.exports` do `formatter.js` inclui todos os novos templates

---

## Contexto adicional

- O projeto usa `node-cron` (já instalado)
- O `supabase` client já está configurado em `supabase.js` — reutilizar o mesmo padrão de import
- A chave de acesso ao Supabase está em variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- O Z-API pode ter rate limit — por isso o delay de 1.5s entre envios é obrigatório
- A tabela `usuarios` tem: `phone_number`, `compras_mes_atual`, `is_pro`, `beta_fundador`, `onboarding_step`, `mes_referencia`, `criado_em`
- A tabela `compras` tem: `id`, `phone_number`, `loja`, `total`, `data_compra`, `criado_em`
