# Semana 1 — Hardening + Definição do Free
## Prompts para Agentes de IA + Guias para Ações Manuais

> **Como usar este arquivo:**
> - Tarefas marcadas com 🤖 podem ser executadas colando o prompt direto em uma sessão do Claude (Cowork, Claude Code, ou API).
> - Tarefas marcadas com 👤 requerem ação manual sua — estão explicadas passo a passo.
> - Execute as tarefas **na ordem listada** — algumas dependem de anteriores.
> - Cada prompt assume que o agente tem acesso à pasta `C:\Economizei\` e pode editar arquivos.
>
> **Objetivo da semana:** Bot pronto pro modelo Spotify-style, com limite correto, segurança básica, onboarding real e logging funcional.

---

## TAREFA 1 — Subir limite de cupons de 3 → 10
**Tipo:** 🤖 Agente  
**Tempo estimado:** 30 min  
**Arquivos afetados:** `src/supabase.js`, `src/formatter.js`

### Contexto para o agente
Atualmente o limite gratuito está hardcoded como `3` em dois lugares distintos. Precisa subir para `10` (limite técnico real baseado no custo do Gemini Vision por chamada). Também há uma função separada que precisa ser atualizada para retornar informações mais ricas sobre o status do usuário, para preparar o terreno para as próximas tasks.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

CONTEXTO DO PRODUTO:
O bot analisa cupons fiscais via foto (Gemini Vision) e registra gastos no Supabase.
Usuários gratuitos têm um limite mensal de cupons. Esse limite era 3 (número antigo, 
antes de redesenharmos o produto) e precisa ser atualizado para 10.
O limite é técnico — o fundador paga por chamada do Gemini Vision — não é artificial.

ARQUIVOS A EDITAR:

1. src/supabase.js
   - Função `verificarLimiteGratuito` (linha ~142):
     Mudar `data.compras_mes_atual >= 3` para `data.compras_mes_atual >= 10`
   - Mesma função: além de retornar true/false, refatorar para retornar um objeto:
     `{ atingido: boolean, cuponsUsados: number, limite: 10, isBetaFundador: boolean }`
     Isso vai ser necessário nas próximas tasks para mostrar ao usuário quantos cupons restam.
   - O campo `beta_fundador` ainda não existe na tabela (será criado na Task 3), 
     então por agora retorne `isBetaFundador: false` como placeholder.

2. src/formatter.js
   - Função `montarMensagemLimite` (linha ~55):
     Atualizar texto que diz "suas 3 fotos gratuitas" para "seus 10 cupons gratuitos do mês".
     Reescrever a mensagem completa com o seguinte conteúdo:
     
     - Avisar que atingiu o limite de 10 cupons/mês do plano gratuito
     - Tom: amigável, não punitivo — o plano gratuito é generoso por design
     - Mencionar que em breve haverá planos pagos com cupons ilimitados
     - Mencionar que como usuário Beta Fundador, vai ganhar benefícios especiais quando o pago chegar
     - NÃO incluir link de pagamento ainda (paywall ainda não está ativo)
     - Sugerir que mande mensagem "/lista" para ver seus gastos do mês

3. src/index.js
   - A função `processarImagem` chama `verificarLimiteGratuito` e usa o resultado como booleano.
     Atualizar para usar o novo objeto: `const { atingido } = await verificarLimiteGratuito(phone);`
     e checar `if (atingido)` no lugar do booleano direto.

Após editar, confirme as mudanças e mostre um diff resumido do que foi alterado.
```

---

## TAREFA 2A — Criar arquivo .env.example
**Tipo:** 🤖 Agente  
**Tempo estimado:** 15 min  
**Arquivos afetados:** `.env.example` (novo), `.gitignore`

### Contexto para o agente
O repositório não tem `.env.example`. Qualquer novo desenvolvedor ou deploy em servidor novo não vai saber quais variáveis são necessárias. O `.env` com credenciais reais já está no `.gitignore`, mas o `.env.example` com valores placeholder precisa ser criado.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

TAREFA: Criar o arquivo `.env.example` na raiz do projeto `C:\Economizei\`

As variáveis de ambiente necessárias para o bot funcionar são:

1. GEMINI_API_KEY — chave da API do Google AI Studio (Gemini 2.5 Flash)
2. SUPABASE_URL — URL do projeto Supabase (formato: https://xxxx.supabase.co)
3. SUPABASE_ANON_KEY — chave anon/public do Supabase
4. ZAPI_INSTANCE_ID — ID da instância Z-API
5. ZAPI_TOKEN — token da instância Z-API
6. ZAPI_CLIENT_TOKEN — client token da Z-API (header de autenticação adicional)
7. PORT — porta do servidor Express (padrão: 3000)

REGRAS para o arquivo:
- Use valores placeholder descritivos (ex: `SUA_CHAVE_AQUI`, `seu-projeto.supabase.co`)
- Adicione comentário acima de cada variável explicando onde conseguir o valor
- Adicione um cabeçalho no arquivo explicando que é um template — copiar para `.env` e preencher
- NÃO coloque nenhuma credencial real

Também verifique o arquivo `.gitignore` atual e confirme que:
- `*.env` OU `.env` está listado (para garantir que o .env real nunca vá pro git)
- `.env.example` NÃO está no gitignore (ele deve ir pro git — é só um template)
- `node_modules` está listado

Se o `.gitignore` estiver incompleto, corrija-o.

Mostre o conteúdo completo do `.env.example` criado ao final.
```

---

## TAREFA 2B — Rotacionar credenciais expostas
**Tipo:** 👤 Humano (ação manual obrigatória)  
**Tempo estimado:** 15 min  
**Por que não pode ser automatizado:** As credenciais vivem em dashboards externos. Um agente não pode acessar esses painéis pra você.

### O que fazer

O `.env` com suas credenciais reais **pode estar no histórico do git** mesmo que hoje esteja no `.gitignore`. Isso significa que qualquer pessoa com acesso ao repositório pode ver as chaves antigas nos commits.

**Passo 1 — Verificar se o .env foi commitado antes**
Abra o terminal na pasta do projeto e rode:
```bash
git log --oneline --all -- .env
```
Se retornar algum commit, o `.env` já esteve no git e as credenciais precisam ser rotacionadas (mesmo que o arquivo já esteja no gitignore agora).

**Passo 2 — Rotacionar a chave do Gemini (Google AI Studio)**
1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Localize a chave atual → clique em "Delete" para revogar
3. Clique em "Create API Key" para gerar uma nova
4. Copie a nova chave e salve no seu `.env` como `GEMINI_API_KEY=...`

**Passo 3 — Rotacionar as chaves do Supabase**
1. Acesse o dashboard do seu projeto Supabase → Settings → API
2. A `SUPABASE_ANON_KEY` é segura de expor (é pública por design, protegida por RLS)
3. Se você usa a `service_role` key em algum lugar, essa sim precisa ser rotacionada via "Regenerate"
4. A `SUPABASE_URL` não muda — não precisa rotacionar

**Passo 4 — Rotacionar tokens da Z-API**
1. Acesse seu painel Z-API
2. Na sua instância, procure a opção de regenerar token ou client token
3. Atualize no `.env`

**Passo 5 — Atualizar o servidor em produção**
Se o bot já estiver rodando em algum servidor (Railway, GCP, etc.), atualize as variáveis de ambiente lá também antes de reiniciar o processo.

---

## TAREFA 3 — Adicionar coluna `beta_fundador` no Supabase
**Tipo:** 🤖 Agente (gera o SQL + atualiza o código) + 👤 Humano (executa o SQL no Supabase)  
**Tempo estimado:** 30 min total  
**Arquivos afetados:** `src/supabase.js`

### PARTE A — 🤖 Agente: Atualizar o código Node.js

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

CONTEXTO:
Vamos adicionar uma coluna `beta_fundador` (BOOLEAN, default TRUE) na tabela `usuarios` 
do Supabase. Essa coluna identifica usuários que entraram durante o período de Beta — 
eles receberão benefícios especiais quando o plano pago for lançado (3 meses grátis + 
preço travado). A coluna ainda não existe no banco, mas você deve atualizar o código 
Node.js já agora para suportá-la, usando `false` como fallback se o campo vier nulo.

TAREFA — Editar `src/supabase.js`:

1. Função `upsertUsuario`:
   - Atualizar o `.select()` para incluir `beta_fundador` nos campos retornados
   - Manter a lógica de upsert igual (não forçar beta_fundador no upsert — o banco 
     vai usar o DEFAULT TRUE da coluna para novos usuários)

2. Função `verificarLimiteGratuito` (que você refatorou na Task 1):
   - Atualizar o `.select()` para incluir `beta_fundador` além de `compras_mes_atual, is_pro`
   - Usar `data.beta_fundador ?? false` no retorno do objeto para evitar null

3. Adicionar nova função exportada `buscarStatusUsuario(phoneNumber)`:
   - Retorna: `{ isBetaFundador, isPro, cuponsUsados, limite: 10 }`
   - Será usada futuramente no comando /status ou /plano

Mostre o arquivo `supabase.js` completo após as edições.
```

### PARTE B — 👤 Humano: Executar a migration no Supabase

Após o agente editar o código, execute o seguinte SQL no **Supabase Dashboard → SQL Editor**:

```sql
-- Adiciona a coluna beta_fundador na tabela usuarios
-- Default TRUE: todo usuário que entra durante o Beta recebe o status automaticamente
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS beta_fundador BOOLEAN DEFAULT TRUE;

-- Garante que usuários existentes também sejam marcados como fundadores
UPDATE usuarios 
SET beta_fundador = TRUE 
WHERE beta_fundador IS NULL;

-- Verifica o resultado
SELECT phone_number, beta_fundador, is_pro, compras_mes_atual 
FROM usuarios 
LIMIT 20;
```

> ⚠️ **Atenção:** Execute isso **após** o agente ter atualizado o código. Se fizer ao contrário, o código antigo pode dar erro ao tentar ler um campo que já existe com valor nulo antes do UPDATE.

---

## TAREFA 4 — Validação básica do payload Z-API
**Tipo:** 🤖 Agente  
**Tempo estimado:** 1h  
**Arquivos afetados:** `src/index.js`

### Contexto para o agente
O webhook atual aceita qualquer corpo sem validação. Requisições malformadas podem causar erros não tratados ou desperdiçar chamadas ao Gemini. Precisamos validar os campos obrigatórios — respeitando uma lógica de resposta HTTP específica ditada pelo comportamento do Z-API.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

TAREFA: Adicionar validação de payload no endpoint POST /webhook em `src/index.js`

CONTEXTO DO PAYLOAD Z-API:
O Z-API envia webhooks com diferentes formatos dependendo do tipo de evento.
Os eventos relevantes para nós são:
- Mensagem de texto: body tem `{ phone, text: { message } }`
- Mensagem de imagem: body tem `{ phone, image: { imageUrl } }`
- Outros eventos (delivery receipt, status update, etc.): body pode ter campos variados

REGRA CRÍTICA DE RESPOSTA HTTP — leia antes de implementar:
O handler atual envia `res.sendStatus(200)` na primeira linha, antes de qualquer validação
de campos. Isso é intencional: o Z-API interpreta qualquer resposta 4xx como falha de entrega
e reenfileira o evento. Portanto:

- A ÚNICA validação que deve ocorrer ANTES do sendStatus(200) é o Content-Type.
  Se o Content-Type não for application/json, retornar 400 é correto — esse payload
  não veio do Z-API e não há risco de reenvio indesejado.
- TODAS as demais validações acontecem APÓS o sendStatus(200).
  Quando um campo é inválido pós-200, a resposta correta é simplesmente `return` —
  nunca chamar res.status() ou res.json() novamente, pois o response já foi enviado.

ESTRUTURA DO HANDLER após as alterações:

```javascript
app.post('/webhook', (req, res) => {
  // ÚNICO ponto de rejeição 4xx — antes do 200
  if (!req.is('application/json')) {
    return res.status(400).json({ erro: 'Content-Type deve ser application/json' });
  }

  // A partir daqui o Z-API não vai reenviar — pode retornar sem enviar nova resposta
  res.sendStatus(200);

  // Use optional chaining: body pode ser undefined se o parse falhar por qualquer motivo
  const body = req.body;
  const phone = body?.phone;

  // Validar phone — após 200, apenas return para parar o processamento
  // ...

  // Eventos sem text e sem image são silenciosos — sem log, sem erro
  // O Z-API envia delivery receipts e status updates com frequência, isso é normal
  // ...
});
```

VALIDAÇÕES A IMPLEMENTAR (todas após o sendStatus(200)):

1. Validar campo `phone`:
   - Usar `body?.phone` com optional chaining
   - Deve existir, ser string não vazia, conter só dígitos, ter entre 10 e 15 caracteres
   - Se inválido: logar `{ evento: 'payload_invalido', motivo: 'phone inválido', ts: ISO }` e `return`
   - NÃO usar `body.phone` diretamente em nenhum ponto — sempre `body?.phone`

2. Validar tipo de evento:
   - Se tiver `body.text`: verificar que `body.text.message` é string não vazia
     - Se malformado: logar `{ evento: 'payload_malformado', motivo: 'text.message ausente', ts: ISO }` e `return`
     - Se válido: delegar para `processarTexto`
   - Se tiver `body.image`: verificar que `body.image.imageUrl` é string que começa com 'http'
     - Se malformado: logar `{ evento: 'payload_malformado', motivo: 'image.imageUrl ausente', ts: ISO }` e `return`
     - Se válido: delegar para `processarImagem`
   - Se não tiver nem `text` nem `image`: `return` silencioso — SEM log, SEM erro
     (são delivery receipts, status updates e outros eventos normais do Z-API)

FORMATO DE LOG (console.log com JSON.stringify, nunca console.error para esses casos):
```json
{ "evento": "payload_invalido", "motivo": "phone inválido", "ts": "ISO string" }
```
Não logar o phone_raw mesmo mascarado — se o phone é inválido, pode ser lixo ou tentativa de ataque.

Mostre o trecho completo do handler `/webhook` após as edições.
```

---

## TAREFA 5 — Rate limit por phone_number
**Tipo:** 🤖 Agente  
**Tempo estimado:** 1h  
**Arquivos afetados:** `src/index.js`

### Contexto para o agente
Sem rate limit, um número malicioso ou com erro pode disparar centenas de chamadas ao Gemini em segundos, gerando custo. Para o MVP, um rate limit em memória é suficiente (evita reinicializar o processo frequentemente de qualquer forma). Limite: máximo 10 mensagens por minuto por número.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

TAREFA: Adicionar rate limiting em memória por phone_number em `src/index.js`

REQUISITOS:
- Limite: 10 mensagens por minuto por número de telefone
- Implementação: Map em memória (sem Redis, sem dependência nova)
- Limpeza automática: entradas no Map devem expirar após 1 minuto para não crescer indefinidamente
- Deve funcionar tanto para mensagens de texto quanto de imagem
- Quando o rate limit é atingido: responder ao usuário com mensagem amigável E logar o evento

IMPLEMENTAÇÃO SUGERIDA:
Crie um Map chamado `rateLimiter` no escopo do módulo:
```javascript
// Estrutura: { phone: { count: N, resetAt: timestamp } }
const rateLimiter = new Map();
```

Crie uma função `checkRateLimit(phone)` que:
1. Pega a entrada atual do Map para o phone
2. Se não existir ou se `resetAt` já passou: cria nova entrada com count=1 e resetAt=agora+60s, retorna `{ permitido: true }`
3. Se existir e count < 10: incrementa count, retorna `{ permitido: true }`
4. Se existir e count >= 10: retorna `{ permitido: false, segundosRestantes: Math.ceil((resetAt - Date.now()) / 1000) }`

Adicione um cleanup a cada 5 minutos para remover entradas expiradas:
```javascript
setInterval(() => {
  const agora = Date.now();
  for (const [phone, dados] of rateLimiter.entries()) {
    if (dados.resetAt < agora) rateLimiter.delete(phone);
  }
}, 5 * 60 * 1000);
```

ONDE APLICAR:
No início do handler do webhook, após a validação de payload (Task 4), antes de delegar para processarTexto/processarImagem:

```javascript
const rateCheck = checkRateLimit(phone);
if (!rateCheck.permitido) {
  // Logar o evento
  // Responder ao usuário (não processar silenciosamente)
  // Retornar
}
```

MENSAGEM ao usuário quando rate limit atingido:
"⏳ Você enviou muitas mensagens em pouco tempo. Aguarde {X} segundos e tente novamente."

LOG ao atingir rate limit:
```json
{ "evento": "rate_limit_atingido", "phone": "primeiros6****", "timestamp": "ISO" }
```

Mostre o arquivo `src/index.js` com as adições integradas de forma limpa.
```

---

## TAREFA 6 — Reescrever mensagem de boas-vindas
**Tipo:** 🤖 Agente  
**Tempo estimado:** 1h  
**Arquivos afetados:** `src/formatter.js`, `src/index.js`

### Contexto para o agente
A mensagem de boas-vindas atual é genérica e não reflete o posicionamento do produto. Ela precisa ser reescrita com o framing correto: "ser esperto / economizar / não dar mole", mencionando o status de Beta Fundador e deixando claro que o produto é gratuito agora com planos pagos chegando. É a primeira impressão do bot — precisa ser boa.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

PRODUTO:
Bot de WhatsApp que analisa cupons fiscais via foto usando IA. O usuário manda a foto 
do cupom e o bot classifica os gastos automaticamente.

PÚBLICO: Brasileiros classe B/C, 25-55 anos. WhatsApp como app principal.
Tom de voz: informal, esperto, prático. NÃO corporativo, NÃO americanizado.
Framing cultural: "ser esperto / não dar mole / saber das coisas".

TAREFA: Reescrever a função `montarMensagemBemVindo()` em `src/formatter.js`

A nova mensagem de boas-vindas deve:
1. Ser enviada em UMA única mensagem (não dividir em várias aqui — o onboarding em 4 partes 
   será implementado na Task 7. Essa função é o fallback para quem já passou do onboarding)
2. Tom: amigável, direto, empolgante mas sem exagero
3. Conteúdo obrigatório:
   a) Apresentar o Economizei em 1 frase: o que faz e por que é diferente
   b) Instrução clara da ação: "manda a foto do cupom"
   c) Mencionar que está em fase Beta gratuita — quem entra agora é Beta Fundador
   d) Mencionar brevemente que planos pagos chegam em breve mas quem é fundador ganha benefícios
   e) Comandos disponíveis (bem resumidos)

4. NÃO mencionar preços ainda
5. NÃO pedir nenhum tipo de cadastro ou dado
6. Tamanho: máximo 10 linhas visíveis no WhatsApp (mensagens longas são ignoradas)
7. Usar emojis com moderação — 1-2 por bloco temático, não mais

TAMBÉM atualizar a função `montarMensagemLimite()`:
Hoje ela menciona um link de pagamento `[link de pagamento]` e pede para responder 'ativei'.
Remover isso — o paywall não está ativo ainda. Substituir por:
- Parabéns por usar tanto o bot (tom positivo, não punitivo)
- Informar que os cupons reiniciam no dia 1 do próximo mês
- Mencionar que em breve terá plano ilimitado, e como Beta Fundador vai ter desconto vitalício
- Sugerir: "Enquanto isso, mande /resumo para ver tudo que você registrou esse mês"

Mostre ambas as funções atualizadas.
```

---

## TAREFA 7 — Fluxo de onboarding em 4 mensagens
**Tipo:** 🤖 Agente (código) + 👤 Humano (executar migration SQL no Supabase)  
**Tempo estimado:** 2h (a maior da semana)  
**Arquivos afetados:** `src/supabase.js`, `src/formatter.js`, `src/index.js`

### Contexto
Esta é a task mais complexa da semana. O onboarding converte a primeira impressão em hábito. As 4 mensagens têm papéis específicos baseados em pesquisa:
- **Msg 1 (boas-vindas):** Posicionamento + instrução + status de fundador
- **Msg 2 (após cadastro / antes do 1º cupom):** Matar objeção "vai dar trabalho?" → "é só foto, juro"
- **Msg 3 (após 1º cupom):** Celebração + plantar semente do valor temporal ("você acaba de começar seu histórico")
- **Msg 4 (após 2º cupom):** Mostrar a mágica da comparação → esse é o momento que converte

### PARTE A — 👤 Humano: Executar SQL no Supabase ANTES de rodar o agente

```sql
-- Adiciona coluna de step do onboarding na tabela usuarios
-- 0 = novo (nunca recebeu boas-vindas)
-- 1 = recebeu boas-vindas, aguardando 1º cupom
-- 2 = enviou 1º cupom, aguardando 2º
-- 3 = onboarding completo
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Usuários existentes já passaram do onboarding — marcar como completo
UPDATE usuarios 
SET onboarding_step = 3 
WHERE onboarding_step IS NULL OR onboarding_step = 0;

-- Verificar
SELECT phone_number, onboarding_step, beta_fundador FROM usuarios LIMIT 10;
```

### PARTE B — 🤖 Agente: Implementar o onboarding no código

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

CONTEXTO DO ONBOARDING:
O bot precisa de um fluxo de 4 mensagens para converter novos usuários em usuários ativos.
A tabela `usuarios` tem uma coluna `onboarding_step` (INTEGER, 0-3) já adicionada no Supabase.

STEP 0 → Usuário nunca interagiu. Ao receber qualquer mensagem (texto ou imagem):
  - Enviar Mensagem 1 (boas-vindas com framing correto)
  - Atualizar step para 1
  - NÃO processar a imagem ou texto original ainda — só dar boas-vindas e esperar

STEP 1 → Recebeu boas-vindas. Aguardando primeiro cupom:
  - Se receber texto: enviar Mensagem 2 ("relaxa, é só foto")
  - Se receber imagem: processar normalmente, depois enviar Mensagem 3 (celebração + histórico)
  - Após processar cupom: atualizar step para 2

STEP 2 → Enviou 1º cupom. Aguardando 2º:
  - Se receber imagem: processar normalmente, depois enviar Mensagem 4 (comparação, mostrar a mágica)
  - Após processar 2º cupom: atualizar step para 3

STEP 3 → Onboarding completo. Comportamento normal (código atual).

MENSAGENS DO ONBOARDING (escreva você mesmo o conteúdo, seguindo as diretrizes abaixo):

MENSAGEM 1 — Boas-vindas (step 0 → 1):
- Apresentar o Economizei em 1 linha curta
- "Você é Beta Fundador — quando vier o plano pago, você ganha 3 meses grátis + preço travado pra sempre"
- Instrução clara: manda a foto do cupom quando for ao mercado
- Tom: "ser esperto", empolgante mas sem exagero
- Máximo 8 linhas

MENSAGEM 2 — Matar objeção "vai dar trabalho?" (step 1, quando manda texto):
- Responder que é literalmente só foto
- "Sem cadastro. Sem formulário. Só foto."
- Encorajar: "Quando for ao mercado, manda a foto do cupom aqui"
- Curta — máximo 5 linhas

MENSAGEM 3 — Após 1º cupom (step 1 → 2, após processar imagem):
- Parabéns pela primeira compra registrada
- Frase-chave: "Você acabou de começar seu histórico financeiro. Daqui um mês você vai ver padrões que nunca percebeu."
- Encorajar a registrar a próxima compra também
- Tom: celebração genuína, sem exagero

MENSAGEM 4 — Após 2º cupom — mostrar a mágica (step 2 → 3, após processar imagem):
- Mencionar que com 2 compras já dá pra ver padrões
- Se tiver dados de comparação (qual mercado, qual total), incluir brevemente
- "É isso. Você está no controle agora."
- Mencionar que o bot vai acompanhar tudo automaticamente

IMPLEMENTAÇÃO:

1. `src/supabase.js`:
   - Atualizar `upsertUsuario` para retornar `onboarding_step` no select
   - Adicionar função `atualizarOnboardingStep(phoneNumber, novoStep)`

2. `src/formatter.js`:
   - Adicionar 4 funções: `montarOnboarding1()`, `montarOnboarding2()`, `montarOnboarding3(dadosCompra)`, `montarOnboarding4(dadosCompra, totalMes)`

3. `src/index.js`:
   - Refatorar `processarTexto` e `processarImagem` para verificar `onboarding_step` antes de processar
   - O step deve ser buscado via `upsertUsuario` (que já cria o usuário e retorna os dados)
   - Isolar a lógica de onboarding em uma função `gerenciarOnboarding(phone, step, tipo, dados)` 
     para não poluir as funções principais
   - IMPORTANTE: o processamento normal do cupom (salvar, buscar histórico, etc.) deve acontecer 
     normalmente ANTES de enviar a mensagem de onboarding — a mensagem de onboarding é ADICIONAL, 
     não substitui a resposta normal

Mostre os 3 arquivos completos após a implementação.
```

---

## TAREFA 8 — Logging mínimo estruturado
**Tipo:** 🤖 Agente  
**Tempo estimado:** 30 min  
**Arquivos afetados:** `src/index.js` (principalmente), pode criar `src/logger.js`

### Contexto para o agente
O bot já tem alguns console.log espalhados, mas são inconsistentes. Precisamos de um logging estruturado mínimo que permita debugar problemas em produção sem precisar de ferramenta externa. Todos os logs devem ser JSON parseável (para poder filtrar com `grep` ou `jq`).

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

TAREFA: Criar um logger mínimo estruturado e aplicar em todo o projeto.

CRIAR arquivo `src/logger.js`:

```javascript
// Logger mínimo — todos os logs são JSON para facilitar grep/jq em produção
// Uso: log('evento_nome', { campo1: valor1, campo2: valor2 })

function maskPhone(phone) {
  if (!phone || phone.length < 6) return '??????';
  return phone.slice(0, 5) + '****';
}

function log(evento, dados = {}) {
  const entry = {
    ts: new Date().toISOString(),
    evento,
    ...dados,
  };
  console.log(JSON.stringify(entry));
}

module.exports = { log, maskPhone };
```

APLICAR logging estruturado em `src/index.js` para os seguintes eventos:

| Evento | Quando logar | Campos extras |
|--------|-------------|---------------|
| `webhook_recebido` | Início do handler POST /webhook | tipo (texto/imagem/ignorado) |
| `rate_limit_atingido` | Quando rate limit bloqueia | phone mascarado, segundos_restantes |
| `payload_invalido` | Quando payload falha validação | motivo |
| `cupom_iniciando` | Antes de chamar lerRecibo() | phone mascarado |
| `cupom_registrado` | Após salvar compra com sucesso | phone mascarado, loja, total |
| `cupom_erro_leitura` | Quando Gemini não consegue ler | phone mascarado, motivo |
| `cupom_erro_interno` | Quando catch() é ativado | phone mascarado, erro.message |
| `limite_atingido` | Quando usuário atingiu cota mensal | phone mascarado, cupons_usados |
| `alerta_disparado` | Quando alerta de gasto alto é enviado | phone mascarado, percentual |
| `onboarding_step` | Quando step de onboarding avança | phone mascarado, step_anterior, step_novo |

REMOVER todos os `console.log` e `console.error` antigos que não seguem esse formato — 
substituir pelos eventos padronizados acima. Manter apenas logs de erros críticos de 
bibliotecas externas (supabase, zapi) que já têm seu próprio formato.

Para os arquivos `src/supabase.js` e `src/zapi.js`: manter os logs de erro existentes 
(`console.error('[supabase]...')` e `console.log('[ZAPI...]')`), mas importar o logger 
e usar `log('supabase_erro', ...)` e `log('zapi_erro', ...)` no lugar — assim ficam JSON também.

Mostre o arquivo `src/logger.js` criado e o `src/index.js` com os logs integrados.
```

---

## Checklist Final da Semana 1

Após executar todas as tasks, valide:

| # | Item | Tipo | Status |
|---|------|------|--------|
| 1 | Limite no código é 10 (não 3) | Verificar `supabase.js` linha ~152 | ⬜ |
| 2 | Mensagem de limite não menciona link de pagamento | Verificar `formatter.js` | ⬜ |
| 3 | `.env.example` existe e `.env` NÃO está no git | `git status` + `git log -- .env` | ⬜ |
| 4 | Credenciais antigas foram rotacionadas | Manual — dashboards das APIs | ⬜ |
| 5 | Coluna `beta_fundador` existe no Supabase | SQL: `SELECT * FROM usuarios LIMIT 1` | ⬜ |
| 6 | Coluna `onboarding_step` existe no Supabase | SQL: `SELECT * FROM usuarios LIMIT 1` | ⬜ |
| 7 | Payload inválido não crashea o servidor | Testar com curl enviando JSON malformado | ⬜ |
| 8 | Rate limit funciona | Testar enviando 11 msgs rápidas | ⬜ |
| 9 | Novo usuário recebe 4 mensagens de onboarding | Testar com número novo | ⬜ |
| 10 | Todos os logs são JSON válido | `node src/index.js` e checar output | ⬜ |

### Teste rápido de sanidade (rodar localmente)
```bash
# Com as variáveis de ambiente preenchidas no .env:
node src/index.js

# Em outro terminal, simular um webhook de texto:
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"5511999999999","text":{"message":"oi"}}'

# Simular payload inválido (deve ser rejeitado silenciosamente):
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":""}'
```

---

## Ordem de execução recomendada

```
Task 1 (30min) → Task 2A (15min) → [Task 2B — HUMANO] → Task 3A (15min) 
→ [Task 3B — HUMANO: rodar SQL] → [Task 7 PARTE A — HUMANO: rodar SQL]
→ Task 4 (1h) → Task 5 (1h) → Task 6 (1h) → Task 7B (2h) → Task 8 (30min)
→ Checklist final
```

> **Dica de execução:** Tasks 1, 2A e 3A podem ser passadas para um único agente em sequência. Tasks 4, 5, 6 e 8 são independentes entre si e podem ser executadas em qualquer ordem após o banco estar atualizado. Task 7 deve ser a última pois depende de todas as outras.
