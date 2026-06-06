# Semana 2 — Landing Page + Waitlist + Pricing Visível
## Prompts para Agentes de IA + Guias para Ações Manuais

> **Como usar este arquivo:**
> - Tarefas marcadas com 🤖 podem ser executadas colando o prompt direto em uma sessão do Claude (Cowork, Claude Code, ou API).
> - Tarefas marcadas com 👤 requerem ação manual sua — estão explicadas passo a passo.
> - Execute as tarefas **na ordem listada** — a landing page depende do domínio, e a waitlist depende da landing page.
> - Cada prompt assume acesso à pasta `E:\Economizei Bot\` e conhece o CLAUDE.md do projeto.
>
> **Objetivo da semana:** Ter uma URL para onde mandar tráfego, com pricing ancorado na cabeça do usuário antes do lançamento.

---

## TAREFA 1 — Comprar domínio + escolher hospedagem
**Tipo:** 👤 Humano (ação manual obrigatória)  
**Tempo estimado:** 30 min  
**Por que não pode ser automatizado:** Requer cartão de crédito, login em registradoras e decisão de produto sobre o nome.

### Decisão de domínio

Opções recomendadas (checar disponibilidade em registro.br ou Hostinger):

| Domínio | Comentário |
|---------|-----------|
| `economizei.com.br` | Ideal — nome exato do produto, `.com.br` transmite credibilidade local |
| `economizei.app` | Alternativa moderna, mais barata, boa para SaaS |
| `oeconomizei.com.br` | Fallback se o principal não estiver disponível |

**Registradoras recomendadas:**
- **Registro.br** — oficial para `.com.br`, R$40/ano, exige CPF/CNPJ
- **Hostinger** — bom custo-benefício, R$30–50/ano, interface simples
- **Namecheap** — bom para `.app` e `.com`, paga em dólar

> ⚠️ Se o CNPJ ainda não estiver aberto, registre o `.com.br` no CPF pessoal mesmo. Pode transferir para o CNPJ depois. Não deixe o domínio esperando o CNPJ — ele pode ser comprado por outra pessoa.

### Decisão de hospedagem

**Use Vercel (recomendado para esta semana):**
1. Acesse [vercel.com](https://vercel.com) e crie uma conta gratuita
2. A landing page vai ser um único arquivo `index.html` — não precisa de build, framework ou repositório
3. Você pode fazer deploy arrastando a pasta no dashboard da Vercel (drag & drop)
4. O plano gratuito da Vercel suporta domínio customizado — aponte o DNS após comprar

**Configurar DNS após comprar o domínio:**
1. No painel da Vercel → Settings → Domains → Add Domain
2. A Vercel vai mostrar os nameservers ou registros A/CNAME
3. Cole esses registros no painel da registradora do domínio
4. Propagação: 5 minutos a 48 horas (geralmente < 1 hora)

---

## TAREFA 2 — Landing page com headline A/B + bloco de pricing
**Tipo:** 🤖 Agente  
**Tempo estimado:** 3h + 1h (tasks 2 e 3 combinadas — o pricing é parte da landing)  
**Entrega:** Um único arquivo `index.html` pronto para deploy na Vercel

### Contexto para o agente
A landing page precisa fazer três coisas ao mesmo tempo: explicar o produto em segundos, ancorar os preços futuros na cabeça do usuário, e capturar o contato de quem quer entrar na waitlist. O público é classe B/C, celular, WhatsApp como principal app — a página tem que carregar rápido e funcionar perfeitamente em tela pequena.

O teste A/B é entre duas headlines com framings diferentes para o mesmo produto:
- **Opção 1:** "Não deixa o mercado te passar a perna" — framing de ameaça evitada, competição, ser esperto
- **Opção 4:** "Economizar virou foto" — framing de simplicidade radical, a foto como gesto mínimo

### Prompt

```
Você está criando a landing page do Economizei — um bot de WhatsApp que analisa cupons 
fiscais via foto (IA) e registra gastos automaticamente. Sem app, sem cadastro, sem fricção.

PÚBLICO-ALVO:
Brasileiros classe B/C, 25–55 anos, celular como dispositivo principal, WhatsApp aberto 
o dia todo. Eles vão ao supermercado semanalmente, são sensíveis a preço, e querem saber 
pra onde vai o dinheiro — mas desistem de qualquer coisa que dê trabalho.

TOM DE VOZ:
Informal, direto, esperto. Framing cultural brasileiro: "ser esperto / não dar mole / 
saber das coisas". NÃO americanizado, NÃO corporativo, NÃO técnico demais.

ENTREGA:
Um único arquivo `index.html` completo (HTML + CSS inline + JS inline), pronto para 
arrastar na Vercel. Mobile-first. Sem dependências externas além do Supabase JS via CDN 
(para a waitlist — será configurado na Task 4 deste projeto).

---

SEÇÕES DA PÁGINA (nessa ordem):

### 1. HERO — com A/B test de headline

Implementar A/B test via JavaScript puro:
- Na primeira visita: atribuir aleatoriamente variant A ou B (Math.random() < 0.5)
- Salvar em localStorage com chave `ec_variant`
- Visitas seguintes usam o variant salvo (consistência)
- URL param `?v=a` ou `?v=b` sobrescreve localStorage (para testes manuais)

HEADLINE A (variant A):
> "Não deixa o mercado te passar a perna"

HEADLINE A — subheadline:
> "Foto do cupom. Tudo registrado. Você sabe exatamente quanto gastou e onde deu pra economizar."

HEADLINE B (variant B):
> "Economizar virou foto"

HEADLINE B — subheadline:
> "Manda a foto do cupom no WhatsApp. O Economizei registra tudo e te avisa quando você está gastando mais que o normal."

Ambas as variants devem ter:
- CTA primário: botão verde "Quero entrar no Beta gratuito" → ancora para a seção #waitlist
- Nota abaixo do botão: "✓ Beta 100% gratuito agora  ✓ Sem app  ✓ Só pelo WhatsApp"
- Uma imagem mockup ou ilustração placeholder (use um div estilizado com emoji de celular + 
  cupom se não houver imagem real — não quebre o layout por falta de asset)

### 2. COMO FUNCIONA — 3 passos simples

Título da seção: "É sério, é só foto"

Passo 1: 📸 "Foto do cupom"
Descrição: "Chegou do mercado? Abre o WhatsApp e manda a foto do cupom pro Economizei. Só isso."

Passo 2: ✅ "Tudo registrado na hora"
Descrição: "A IA lê o cupom e registra cada item, o total e a loja automaticamente. Você não digita nada."

Passo 3: 📊 "Você fica no controle"
Descrição: "No fim do mês você sabe exatamente quanto gastou, onde gastou mais, e onde deu pra economizar."

### 3. BLOCO DE PRICING — 4 planos

Título da seção: "Planos simples, sem surpresa"
Subtítulo: "Comece de graça. Upgrade quando fizer sentido pra você."

PLANO GRÁTIS — destaque visual sutil (borda, não a cor mais chamativa):
- Nome: "Grátis"
- Preço: R$0/mês
- Tag verde: "ATIVO AGORA"
- Recursos:
  - Foto do cupom → análise imediata
  - Resumo automático no fim do mês
  - Alerta quando gastar mais que o normal
  - Até 10 cupons por mês
- CTA: "Começar agora" → link do WhatsApp (wa.me/[SEU_NUMERO]?text=oi)

PLANO INDIVIDUAL — destaque visual principal (mais chamativo, badge "Mais popular"):
- Nome: "Individual"
- Preço: R$ 9,90/mês
- Tag cinza: "EM BREVE"
- Recursos:
  - Tudo do Grátis
  - Cupons ilimitados
  - Comparativo entre mercados ← "killer feature"
  - Alerta inteligente (preditivo + categorizado)
- CTA: "Quero ser avisado" → ancora para #waitlist

PLANO FAMÍLIA:
- Nome: "Família"
- Preço: R$ 15/mês
- Tag cinza: "EM BREVE"
- Subtítulo: "Até 3 pessoas"
- Recursos:
  - Tudo do Individual
  - Visão consolidada da família
  - Comparação de gastos por membro
- CTA: "Quero ser avisado" → ancora para #waitlist

PLANO FAMÍLIA+:
- Nome: "Família+"
- Preço: R$ 22/mês
- Tag cinza: "EM BREVE"
- Subtítulo: "Até 5 pessoas"
- Recursos:
  - Igual ao Família
  - Mais 2 vagas
- CTA: "Quero ser avisado" → ancora para #waitlist

Nota abaixo dos planos:
"🔒 Quem entrar no Beta agora é Beta Fundador — quando os planos pagos chegarem, você ganha 
3 meses grátis + preço travado pra sempre."

### 4. WAITLIST — captura de contato

ID: `waitlist`
Título: "Garante seu lugar como Beta Fundador"
Subtítulo: "Sem compromisso. A gente avisa você quando o plano pago estiver pronto — com seu desconto travado."

Formulário com os campos:
- Nome (texto, obrigatório)
- WhatsApp (tel, obrigatório, placeholder "55 11 99999-9999")
- Plano de interesse (select obrigatório):
  - "Ainda estou testando o gratuito"
  - "Individual — R$9,90/mês"
  - "Família — R$15/mês (até 3 pessoas)"
  - "Família+ — R$22/mês (até 5 pessoas)"
- Botão: "Garantir meu lugar no Beta"

Comportamento do formulário:
- Validação simples no front (campos obrigatórios, formato de WhatsApp)
- Ao submeter: mostrar spinner, depois mensagem de sucesso inline (não redirecionar)
- Mensagem de sucesso: "✅ Pronto! Você está na lista. A gente entra em contato pelo WhatsApp quando chegar sua vez."
- No handler de submit, adicionar o seguinte bloco com placeholder (a URL real é preenchida na Task 4):
  ```javascript
  // TODO: substituir [URL_DO_SERVIDOR] pelo endereço real do bot após o deploy
  const resposta = await fetch('[URL_DO_SERVIDOR]/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome, whatsapp, plano_interesse: planoInteresse,
      variant_ab: localStorage.getItem('ec_variant') || 'desconhecido',
      utm_source: localStorage.getItem('ec_utm_source') || null,
      utm_medium: localStorage.getItem('ec_utm_medium') || null,
      utm_campaign: localStorage.getItem('ec_utm_campaign') || null,
      utm_content: localStorage.getItem('ec_utm_content') || null,
    })
  });
  ```
  Mesmo se a chamada falhar, mostrar a mensagem de sucesso ao usuário — não punir por falha de infra.
- NÃO incluir o Supabase JS via CDN nesta task — a landing page não chama o Supabase diretamente.
  Todo o salvamento e envio de WhatsApp acontece no endpoint do bot (Task 4).
- Capturar UTMs e variant A/B junto com os dados do formulário (Task 5 detalha isso)

### 5. RODAPÉ

- Logo/nome: "Economizei"
- Links: "Termos de uso" e "Privacidade" (ambos com href="#" por enquanto — serão criados na semana 3)
- Texto: "© 2026 Economizei. Bot de controle de gastos via WhatsApp."
- Nota discreta: "Seus dados são tratados com respeito. Sem spam."

---

ESTILO VISUAL:
- Paleta: fundo branco (#fff), cor primária verde (#22c55e ou similar — verde de dinheiro/economia)
- Fonte: system-ui ou 'Inter' via Google Fonts (uma chamada só — não mais de 1 fonte externa)
- Mobile-first: testar mentalmente em tela de 375px de largura
- Botões: arredondados (border-radius: 8px), padding generoso, hover com transição suave
- Cards de pricing: sombra sutil, borda 1px, espaçamento confortável
- Sem animações complexas — o público está no 4G/3G

CÓDIGO:
- Único arquivo index.html
- CSS dentro de <style> no <head>
- JS dentro de <script> no final do <body>
- Sem frameworks (sem React, sem Vue) — HTML/CSS/JS puro
- Comentários em português nos blocos principais do JS
- Deixar placeholder claro onde o número do WhatsApp deve ser inserido: `[SEU_NUMERO_WHATSAPP]`
- Deixar placeholder claro onde as chaves do Supabase serão inseridas: `[SUPABASE_URL]` e `[SUPABASE_ANON_KEY]`

Salve o arquivo como `index.html` na pasta raiz do projeto `E:\Economizei Bot\landing\`
(criar a pasta se não existir).

Ao final, mostre um resumo das seções criadas e qualquer decisão de design que tomou.
```

---

## TAREFA 3 — Criar tabela `waitlist` no Supabase
**Tipo:** 👤 Humano (ação manual obrigatória)  
**Tempo estimado:** 15 min  
**Por que não pode ser automatizado:** A tabela precisa existir no banco antes que o endpoint do bot (Task 4) tente inserir nela.

> **Nota de arquitetura:** a landing page não chama o Supabase diretamente. Ela chama o endpoint `/waitlist` do bot (Task 4), que por sua vez salva no Supabase e envia o WhatsApp de confirmação. Isso mantém as credenciais fora do front-end. Portanto, esta task é só o SQL — sem código JS na landing.

Execute no **Supabase Dashboard → SQL Editor**:

```sql
-- Tabela de captura da waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_em       TIMESTAMPTZ DEFAULT now(),
  nome            TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,
  plano_interesse TEXT,
  variant_ab      TEXT,         -- 'a' ou 'b' — qual headline o usuário viu
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  ja_contatado    BOOLEAN DEFAULT FALSE  -- para controle operacional manual
);

-- Índice para buscas por WhatsApp (evitar duplicatas na hora de contatar)
CREATE INDEX IF NOT EXISTS waitlist_whatsapp_idx ON waitlist (whatsapp);

-- RLS: o bot usa service_role internamente, sem necessidade de INSERT público
-- Habilitar RLS e não criar nenhuma policy — bloqueia acesso anon completamente
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT * FROM waitlist LIMIT 1;
```

> ⚠️ A RLS aqui é mais restritiva que o padrão: sem nenhuma policy, nem INSERT anon funciona.
> O endpoint do bot usa a `SUPABASE_ANON_KEY` com privilégios de `service_role` via variável
> de ambiente — se estiver usando a anon key no bot, crie a policy de INSERT:
> `CREATE POLICY "insert_bot" ON waitlist FOR INSERT WITH CHECK (true);`

---

## TAREFA 3C — Corrigir integração do formulário (reverter Supabase direto → endpoint)
**Tipo:** 🤖 Agente  
**Tempo estimado:** 15 min  
**Quando executar:** Apenas se a Task 3B já foi executada e o formulário está chamando o Supabase diretamente via CDN. Se não executou a 3B, pule esta task.  
**Arquivos afetados:** `landing/index.html`

### Contexto para o agente
A Task 3B integrou o formulário da waitlist chamando o Supabase JS diretamente no front-end via CDN. A arquitetura correta é diferente: a landing page deve chamar o endpoint `/waitlist` do bot (que cuida de salvar no Supabase e enviar o WhatsApp). Isso mantém credenciais fora do front e centraliza a lógica no backend.

### Prompt

```
Você está trabalhando na landing page do Economizei em `E:\Economizei Bot\landing\index.html`.

SITUAÇÃO ATUAL:
O formulário de waitlist está integrado diretamente com o Supabase via CDN — há um 
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"> no <head> e o 
handler de submit usa `_supabase.from('waitlist').insert(...)`.

TAREFA: Substituir essa integração pela chamada ao endpoint /waitlist do bot.

PASSO 1 — Remover o Supabase JS do <head>:
Localizar e remover a linha:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

PASSO 2 — Remover a inicialização do cliente Supabase no <script>:
Localizar e remover o bloco:
const { createClient } = supabase;
const _supabase = createClient(...);

PASSO 3 — Substituir o handler de submit:
Substituir o bloco que chama `_supabase.from('waitlist').insert(...)` por:

```javascript
// Chama o endpoint do bot — ele salva no Supabase e envia o WhatsApp de confirmação
// TODO: substituir [URL_DO_SERVIDOR] pelo endereço real do bot após o deploy
try {
  await fetch('[URL_DO_SERVIDOR]/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      whatsapp,
      plano_interesse: planoInteresse,
      variant_ab: localStorage.getItem('ec_variant') || 'desconhecido',
      utm_source:   localStorage.getItem('ec_utm_source')   || null,
      utm_medium:   localStorage.getItem('ec_utm_medium')   || null,
      utm_campaign: localStorage.getItem('ec_utm_campaign') || null,
      utm_content:  localStorage.getItem('ec_utm_content')  || null,
    })
  });
} catch (err) {
  // Falha silenciosa — mostrar sucesso de qualquer forma
  console.error('[waitlist] erro ao chamar endpoint:', err.message);
}
```

PASSO 4 — Verificar que não sobrou nenhuma referência ao Supabase:
Buscar no arquivo por: `supabase`, `createClient`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
Se encontrar alguma, remover.

Mostre apenas os trechos alterados (antes e depois), não o arquivo inteiro.
```

---

## TAREFA 4 — Auto-resposta de waitlist via WhatsApp
**Tipo:** 🤖 Agente  
**Tempo estimado:** 1h  
**Arquivos afetados:** Novo arquivo `landing/waitlist-handler.js` (Node.js) OU adicionar endpoint no `src/index.js` existente do bot

### Contexto para o agente
Quando alguém preenche a waitlist, a experiência ideal é receber uma mensagem no WhatsApp imediatamente — confirmando o cadastro e reforçando o status de Beta Fundador. Isso fecha o loop e começa um relacionamento no canal onde o produto vive.

A arquitetura mais simples para o MVP: adicionar um endpoint `/waitlist` no próprio servidor Express do bot (que já está rodando). A landing page chama esse endpoint ao invés de ir direto ao Supabase, e o endpoint faz as duas coisas: salva no Supabase E envia o WhatsApp.

### Prompt

```
Você está trabalhando no bot WhatsApp Economizei em Node.js.

TAREFA: Adicionar endpoint POST /waitlist no servidor Express em `src/index.js`
que recebe os dados do formulário da landing page, salva no Supabase e envia 
uma mensagem de confirmação via WhatsApp (Z-API).

CONTEXTO DE ARQUITETURA:
Em vez de a landing page chamar o Supabase diretamente, ela vai chamar este endpoint.
Vantagem: o número do WhatsApp do usuário nunca fica exposto no front-end, e podemos 
fazer lógica adicional no backend (deduplicação, formatação, etc.).

ATENÇÃO: O servidor do bot pode estar em um domínio diferente da landing page.
Adicionar CORS para aceitar requisições da landing page:
```javascript
const cors = require('cors');
// Antes dos outros middleware:
app.use('/waitlist', cors({ origin: '*' })); // Restringir ao domínio real depois do deploy
```
Se `cors` não estiver instalado: `npm install cors`

ENDPOINT A CRIAR:

```
POST /waitlist
Content-Type: application/json

Body:
{
  "nome": "string",
  "whatsapp": "string (só dígitos, 10-13 chars)",
  "plano_interesse": "string",
  "variant_ab": "a" | "b",
  "utm_source": "string | null",
  "utm_medium": "string | null",
  "utm_campaign": "string | null",
  "utm_content": "string | null"
}
```

LÓGICA DO ENDPOINT:

1. Validar campos obrigatórios (nome, whatsapp) — retornar 400 se faltarem
2. Sanitizar whatsapp: remover tudo que não for dígito, garantir 10–13 dígitos
3. Inserir no Supabase tabela `waitlist` com todos os campos recebidos
4. Montar e enviar mensagem WhatsApp via `enviarMensagem(whatsapp, texto)` já disponível em `src/zapi.js`
5. Retornar { sucesso: true } independente do resultado do WhatsApp (não bloquear o cadastro
   se o envio falhar)
6. Log estruturado: `{ evento: 'waitlist_cadastro', nome, whatsapp_mascarado, plano, variant_ab }`

MENSAGEM WHATSAPP DE CONFIRMAÇÃO:
Tom: acolhedor, direto, reforça o status especial de Beta Fundador.
Conteúdo obrigatório:
- Confirmar que está na lista
- Deixar claro que é Beta Fundador (vai ganhar benefícios quando o pago chegar)
- Dar instrução para começar a usar agora (mandar foto do cupom)
- Máximo 8 linhas — mensagens longas no WhatsApp não são lidas

Exemplo de estrutura (você escreve o texto final):
"[saudação com nome] 🎉
Você está dentro! ...
[status de Beta Fundador e benefício]
[instrução para começar agora]
[assinatura]"

TAMBÉM ATUALIZAR a landing page `landing/index.html`:
Substituir a chamada direta ao Supabase (ou o TODO) pela chamada fetch() ao endpoint /waitlist:
```javascript
const resposta = await fetch('[URL_DO_SERVIDOR]/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome, whatsapp, plano_interesse, variant_ab, ...utms })
});
```
Manter `[URL_DO_SERVIDOR]` como placeholder — será o endereço Railway/GCP depois do deploy.

Mostre o endpoint criado em `src/index.js` e o trecho da landing page atualizado.
```

---

## TAREFA 5 — UTM tracking básico
**Tipo:** 🤖 Agente  
**Tempo estimado:** 30 min  
**Arquivos afetados:** `landing/index.html`

### Contexto para o agente
UTM params são passados em links de campanhas (ex: posts TikTok, grupos de WhatsApp). Capturar quais canais estão trazendo cadastros é essencial para saber onde investir tempo de conteúdo. A implementação é simples: ler os params da URL ao carregar a página e salvar no localStorage para incluir no submit da waitlist.

### Prompt

```
Você está trabalhando na landing page do Economizei em `E:\Economizei Bot\landing\index.html`.

TAREFA: Adicionar captura de UTM parameters ao carregar a página.

UTMs a capturar: utm_source, utm_medium, utm_campaign, utm_content
(utm_term não é relevante para nosso caso — não usamos Google Ads com keywords)

IMPLEMENTAÇÃO (adicionar no início do bloco <script>, antes de qualquer outra lógica):

```javascript
// Captura UTMs da URL e salva no localStorage para incluir no submit da waitlist
function capturarUTMs() {
  const params = new URLSearchParams(window.location.search);
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  
  utms.forEach(utm => {
    const valor = params.get(utm);
    if (valor) {
      localStorage.setItem('ec_' + utm, valor);
    }
    // Se o param não estiver na URL, mantém o valor anterior no localStorage
    // (usuário pode ter chegado por link orgânico numa visita de retorno)
  });
}
capturarUTMs();
```

LEITURA no submit do formulário (já deve estar implementado da Task 3, só confirmar):
```javascript
const utms = {
  utm_source:   localStorage.getItem('ec_utm_source')   || null,
  utm_medium:   localStorage.getItem('ec_utm_medium')   || null,
  utm_campaign: localStorage.getItem('ec_utm_campaign') || null,
  utm_content:  localStorage.getItem('ec_utm_content')  || null,
};
```

LINKS DE TESTE para validar (abrir no browser após deploy):
- TikTok: `?utm_source=tiktok&utm_medium=organic&utm_campaign=lancamento`
- WhatsApp: `?utm_source=whatsapp&utm_medium=grupo&utm_campaign=indicacao`
- Instagram: `?utm_source=instagram&utm_medium=reels&utm_campaign=lancamento`

Mostre apenas o bloco JavaScript da captura de UTMs adicionado ao arquivo.
```

---

## Checklist Final da Semana 2

| # | Item | Tipo | Status |
|---|------|------|--------|
| 1 | Domínio comprado e apontado para Vercel | Manual | ⬜ |
| 2 | `landing/index.html` criado e com todas as seções | Verificar no browser | ⬜ |
| 3 | A/B test funciona: abrir em aba anônima, checar localStorage `ec_variant` | Testar | ⬜ |
| 4 | URL `?v=a` e `?v=b` sobrescreve o variant corretamente | Testar | ⬜ |
| 5 | Tabela `waitlist` criada no Supabase com RLS | SQL: `SELECT * FROM waitlist` | ⬜ |
| 6 | Formulário submete e dado aparece no Supabase | Preencher e checar dashboard | ⬜ |
| 7 | Mensagem WhatsApp chega após cadastro na waitlist | Testar com número real | ⬜ |
| 8 | UTMs aparecem salvos no Supabase ao acessar com `?utm_source=teste` | Verificar | ⬜ |
| 9 | Página carrega em < 3 segundos no celular (4G) | Chrome DevTools → Network → Fast 4G | ⬜ |
| 10 | Todos os 4 planos visíveis no mobile sem scroll horizontal | Testar em 375px | ⬜ |

### Teste rápido de sanidade — abrir no browser local antes do deploy
```bash
# Servir a pasta landing localmente (Node.js)
npx serve E:\Economizei Bot\landing

# Acessar:
# http://localhost:3000            → variant aleatório
# http://localhost:3000?v=a        → forçar headline A
# http://localhost:3000?v=b        → forçar headline B
# http://localhost:3000?utm_source=tiktok&utm_campaign=lancamento → captura UTMs
```

---

## Ordem de execução recomendada

```
[Task 1 — HUMANO: comprar domínio + criar conta Vercel]
→ Task 2 (4h — landing page completa + pricing + formulário com fetch() ao endpoint)
→ [Task 3 — HUMANO: criar tabela waitlist no Supabase — 15min]
→ Task 4 (1h — endpoint /waitlist no bot: salva no Supabase + envia WhatsApp)
→ Task 5 (30min — UTM tracking na landing page)
→ [Checklist + deploy na Vercel + deploy do bot com endpoint /waitlist exposto]
→ [Substituir [URL_DO_SERVIDOR] na landing pelo endereço real do bot — HUMANO]
→ [Configurar DNS do domínio para apontar à Vercel — HUMANO]
```

> **Dica de deploy:** Para fazer o primeiro deploy na Vercel sem CLI, basta arrastar a pasta 
> `E:\Economizei Bot\landing\` (com o `index.html` dentro) no dashboard da Vercel. 
> O servidor do bot (Express + endpoint /waitlist) continua separado — hospedado no Railway 
> ou onde você já tem. São duas peças distintas.
