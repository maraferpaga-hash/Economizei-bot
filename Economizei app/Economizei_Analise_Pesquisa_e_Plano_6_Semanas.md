# Economizei — Análise da Pesquisa & Plano de Lançamento (6 semanas)

**Documento estratégico-executivo — versão 2.0**
Atualizado: 2026-05-08
Base: 30 respostas qualitativas únicas + auditoria do código em `C:\Economizei` + decisões tomadas em sessão de discussão estratégica
Restrição operacional: 1 pessoa, ~1h/dia (≈42h em 6 semanas)

---

## 1. Resumo Executivo

**O que a pesquisa valida (30 respostas):**
- Canal WhatsApp validado: 27 de 30 abrem o WhatsApp 6+ vezes/dia, sendo 9 que ficam com ele aberto o dia todo. 100% usa celular como dispositivo principal.
- Dor existe e é descrita em linguagem emocional ("sensação de falha", "decepcionado comigo mesmo", "me senti irresponsável", "incapacidade de administrar a vida cotidiana").
- O alerta proativo gera ação concreta em ~70% dos casos — é a feature mais alavancada do produto.
- Indicação ainda é alta (~48% "com certeza indicaria"), mas não é mais quase-universal como sugeriu a primeira amostra.

**O que a pesquisa coloca em risco:**
- **Preço de R$9,90/mês não está validado** — apenas ~13-16% pagaria com convicção; 45% diz "não pagaria".
- **Preço passou privacidade como objeção #1** com a amostra maior (preço ~29% vs privacidade ~23%).
- "Nunca guardo cupom fiscal" é a resposta mais comum — onboarding exige mudança de hábito, não só uso de app.
- Surgiu medo novo: "tempo que teria que passar alimentando informações no app" (falsa percepção que precisa ser combatida na copy).
- 1 detrator forte ("já tenho isso no cupom") indica que existe segmento que não vê valor agregado se não entender que o produto é temporal.

**Recomendação principal:**
Lançar como **Beta gratuito real (modelo Spotify, não trial)**, com limite técnico generoso (10 cupons/mês — necessário pelo custo do Gemini Vision por chamada), comunicando desde o primeiro contato que existe um plano comercial futuro com benefício vitalício para fundadores. Validar retenção semanal (≥40% W2) e willingness-to-pay com testes microsegmentados nas semanas 5-6. O bot tecnicamente já está pronto. O trabalho das 6 semanas é distribuição, mensagem e endurecimento — não construção.

---

## 2. Análise da Pesquisa (30 respostas)

### 2.1. Perfil dos respondentes

**Frequência de compras:** 2-4+ vezes/mês predomina. Quem vai 4+ vezes (12 respondentes) tem ticket maior e gasto menos previsível — público de alto interesse.

**Ticket mensal:**
- Menos de R$200: 3
- R$200-400: 6
- R$400-700: 6
- R$700-1.200: 9
- Mais de R$1.200: 6

O grupo R$700+ (50% dos respondentes) é o público com mais a economizar.

**Composição familiar:** Predominam casas de 2-3 pessoas (~20). 2 sozinhos. 5+ pessoas (3 respondentes) são os mais "caóticos" no controle.

### 2.2. Comportamento atual de planejamento

| Comportamento | Sempre | Às vezes/Raramente | Nunca |
|---|---|---|---|
| Faz lista | 8 | 17 | 4 |
| Sabe quanto gastou no mês passado | 2 | ~22 | 5 |
| Compara preços entre mercados | 7 | 21 | 1-2 |
| Guarda cupons fiscais | 3 | 6 | ~21 |

**Insight crítico:** O cliente típico não tem nenhum sistema funcionando hoje. Sabe vagamente o que gasta, raramente compara preços, e descarta o cupom. Onboarding precisa endereçar isso — pegar o cupom é a primeira fricção real.

### 2.3. Quando descobre que gastou demais

- "Na hora do caixa": ~14
- "No fim do mês": ~9
- "Quando vê extrato": ~7

A maioria descobre tarde demais para mudar a compra atual. Justifica o **alerta proativo no meio do mês** como funcionalidade central.

### 2.4. Receptividade ao produto

| Pergunta | Sim, com certeza | Talvez | Não |
|---|---|---|---|
| Mandaria foto do cupom? | 8 | 17 | 5 |
| Alerta "20% mais" motivaria mudar? | ~13 | ~13 | ~4 |
| Pagaria R$9,90/mês? | 4 | 12 | 14 |
| Indicaria para família/amigos? | 15 | 11 | 3 |

### 2.5. Objeções (cluster acumulado)

1. **Preço de R$9,90** — 9 menções (~29%) — virou objeção #1 com a amostra maior
2. **Privacidade** — 7 menções (~23%)
3. **Não me parece útil** — 6 menções (~19%)
4. **Nenhum obstáculo** — 5 menções
5. **Outros / Dificuldade de uso** — 3 menções

### 2.6. Dores qualitativas (linguagem real do usuário)

**Sobre arrependimento:**
- "Me senti irresponsável"
- "Sensação de falha, de incapacidade de administrar a própria vida cotidiana"
- "Fiquei decepcionado comigo mesmo"
- "Achar produto muito mais barato em outro mercado e ter arrependimento"

**Sobre o que faz gastar mais:**
- "Comprar com fome" / "Ir ao mercado antes de uma refeição completa" (5 menções)
- "Promoções" / "Vendas casadas" (7 menções)
- "Crianças junto" (2 menções)
- "Consumismo", "Cerveja", "Doces"
- "Sugestões e conteúdos em redes sociais"

**Sobre tentativas anteriores:**
- "Planilha" (4 menções — concorrente real)
- "Anotar no papel" (3 menções)
- "Nunca tentei, acho complexo ou muito detalhado"

**Sobre família:** 2 respondentes mencionaram explicitamente que **outro membro da família tem o problema mais grave** ("minha mãe tem um descontrole maior que o meu", "Mãe"). Persona indireta: o pagante pode ser jovem/adulto que instala para parente.

### 2.7. Detrator a endereçar
"Já tenho isso no cupom" — indica que parte do público vê o produto como **só OCR** do cupom. Resposta: o valor está em **agregar no tempo** (semana, mês, comparação), não na transação isolada. Esse framing precisa estar explícito no onboarding.

### 2.8. O que daria mais satisfação

- "Saber que economizei dinheiro": ~9
- "Saber exatamente o que gasto (mesmo sem economizar)": ~5
- "Os dois igualmente": ~14

Dois perfis psicográficos ativos: **Otimizador** (economia, jogo) e **Controlador** (paz mental, controle). Copy precisa endereçar os dois.

---

## 3. Insights Estratégicos

**I1 — Lançar grátis de verdade, não trial.**
Modelo Spotify: free resolve a dor central; pago é versão melhor. Free funciona pra quem vai 3x/mês ao mercado controlar gastos. Pago entrega features avançadas reais.

**I2 — Preço como objeção #1 reforça (não enfraquece) a estratégia de adiar paywall.**
Tentar cobrar R$9,90 antes de provar valor é destruir o canal. Validar comportamento primeiro.

**I3 — Privacidade segue importante, mas não é mais o portão único.**
Continua valendo dedicar bloco específico a ela na landing e mensagem de boas-vindas. Mas headline pode liderar com economia/esperteza, não privacidade.

**I4 — A planilha é o concorrente real.**
Posicionamento: "O Economizei é a planilha que você nunca conseguiu manter." Frame que toca quem já tentou e fracassou.

**I5 — Comparativo de preços e plano família são as features killer do plano pago.**
Comparativo: 1 respondente pediu explicitamente, e responde ao gatilho de "ser esperto". Família: resolve a persona indireta ("instala pra mãe") e cria efeito viral embutido + ARPU mais alto + churn menor.

**I6 — Programa de indicação deve ser pré-construído.**
Mesmo com 3 "não indicaria" agora aparecendo, ainda 48% indicaria com certeza. Capturar intent agora, ativar depois.

**I7 — Os dois perfis (otimizador / controlador) precisam de cópias diferentes.**
Não escolher um. Landing com 2 CTAs paralelos: "Quero economizar mais" / "Quero saber exatamente quanto gasto".

**I8 — Persona indireta "filho/filha que instala pra mãe" é estratégica.**
Plano família monetiza isso. Marketing precisa de pelo menos 1 peça com esse ângulo.

**I9 — Alerta dividido em básico (free) + inteligente (pago).**
Free: alerta reativo "gastou 20% acima da média". Pago: alerta preditivo "no ritmo, fecha o mês 35% acima; itens que mais subiram foram X e Y".

**I10 — Cultura brasileira de "ser esperto" é o framing certo de marketing.**
Não é sobre disciplina (frame americano). É sobre não dar mole, saber das coisas, não cair em besteira. Headlines devem evocar o orgulho de quem sabe.

---

## 4. Modelo de Negócio Definido

### 4.1. Estrutura de planos (4 tiers)

| Plano | Preço | Quem | Funções |
|---|---|---|---|
| **Grátis (Beta Fundador)** | R$0 | 1 pessoa | Foto + resumo imediato + resumo mensal + alerta básico (>20% acima da média). Limite: 10 cupons/mês* |
| **Individual** | R$9,90/mês | 1 pessoa | Tudo do grátis + comparativo entre mercados + alerta inteligente (preditivo + categorizado) + cupons ilimitados |
| **Família** | R$15/mês | até 3 pessoas | Tudo do individual + visão consolidada da família + comparação por membro |
| **Família+** | R$22/mês | até 5 pessoas | Igual ao Família, com mais 2 vagas |

*O limite de 10 cupons/mês no grátis é técnico, não artificial — cada cupom é uma chamada paga ao Gemini Vision. 10 cobre quem vai ao mercado 2-3 vezes/semana com folga.

### 4.2. Tag de Fundador

Toda conta criada durante o Beta recebe `beta_fundador = true` no Supabase. Quando o paywall for ativado, esse grupo recebe:
- 3 meses gratuitos de plano Individual
- Preço de fundador travado vitalício (ex: 30% off perpétuo)

Comunicado desde a primeira mensagem do bot — transforma "vou ter que pagar depois" em "tô garantindo um privilégio agora".

### 4.3. Por que essa estrutura funciona

- **Free é produto real**, não trial — alinha com a filosofia "bom, barato e útil".
- **Plano Família ancora valor** — R$15 por 3 pessoas = R$5/cabeça parece barato perto de R$9,90 individual. Empurra grande parte da conversão pra cima.
- **Persona "filha paga pra mãe" é monetizada** — 2 menções na pesquisa apontam pra esse uso.
- **Multi-usuário gruda** — contratos família churnam menos.

---

## 5. Estado Atual do Produto vs. Pesquisa

### Já está pronto (não precisa rebuild):
- Webhook Z-API + Express
- Pipeline foto → Gemini 2.5 Flash → JSON estruturado
- Persistência Supabase (`usuarios`, `compras`, `itens_compra`)
- Comando histórico, free tier (atualmente 3 cupons — precisa subir pra 10), incremento mensal
- Lógica de alerta básico (>120% da média de 90 dias)
- 5 templates de mensagens em português

### Gaps que a pesquisa expôs:
| Gap | Severidade | Esforço |
|---|---|---|
| Limite atual de 3 cupons → subir para 10 | Alta — define modelo freemium | <30min |
| Sem `.env.example`; credenciais expostas | Alta — segurança | <30min |
| Mensagem de boas-vindas sem framing de privacidade + tag fundador | Alta — objeção + retenção futura | 1h |
| Sem fluxo de pagamento real | Baixa — não vai lançar pago | adiar |
| Sem onboarding guiado para 1ª foto | Alta — UX é risco #1 de churn | 2h |
| Sem coluna `beta_fundador` no Supabase | Média — easy win | 30min |
| Sem comparativo de preços (paywall) | Adiar — feature paga | adiar |
| Sem programa de indicação | Média — alto leverage | 2h |
| Sem rate limit / validação de webhook | Média — risco de abuso | 1h |
| Sem landing page com pricing visível ("em breve") | Alta — bloqueia distribuição | 4h |
| Sem scheduler de resumo de fim de mês (free) | Alta — feature core do free | 3h |

---

## 6. Roadmap 6 Semanas (≈42h, 1h/dia)

> **Filosofia:** cada semana entrega algo lançável. Preferir publicar imperfeito a guardar polido. Buffer realista: ~6h não alocadas, dado que 1h/dia raramente acontece todo dia.

### Semana 1 — Hardening + Definição do Free (7h)
**Objetivo:** Bot pronto pro modelo Spotify-style, sem ser trial disfarçado.

- [ ] Subir limite de cupons mensais de 3 para 10 (`supabase.js`) — 30min
- [ ] Criar `.env.example`, remover `.env` do git, rotacionar credenciais expostas — 30min
- [ ] Adicionar coluna `beta_fundador` (BOOLEAN, default true) na tabela `usuarios` — 30min
- [ ] Adicionar validação básica do payload Z-API no webhook — 1h
- [ ] Adicionar rate limit por phone_number (max 10 mensagens/min) — 1h
- [ ] Reescrever mensagem de boas-vindas: framing privacidade + status fundador + "vai virar pago no futuro, você ganha 3 meses + preço travado" — 1h
- [ ] Criar fluxo de onboarding em 4 mensagens (boas-vindas → pedido 1º cupom → após 1º cupom → após 2º cupom com a comparação) — 2h
- [ ] Logging mínimo (timestamp + phone + ação) em arquivo ou console estruturado — 30min

### Semana 2 — Landing Page + Waitlist + Pricing Visível (7h)
**Objetivo:** Ter para onde mandar tráfego, com pricing já mostrado.

- [ ] Comprar domínio + escolher hospedagem (Vercel/Netlify grátis) — 30min
- [ ] Construir landing page com headline em A/B test (Opção 1 vs Opção 4 — ver §7) — 3h
- [ ] Bloco de pricing com 4 planos visíveis (Grátis ativo, demais com tag "em breve") — 1h
- [ ] Captura de waitlist no Supabase (formulário → tabela `waitlist`) — 1h
- [ ] Auto-resposta de waitlist via WhatsApp (template + envio Z-API) — 1h
- [ ] Adicionar UTM tracking básico para medir origem — 30min

### Semana 3 — Mensagem de Privacidade + Conteúdo (7h)
**Objetivo:** Conteúdo para distribuir + reforço da objeção #2.

- [ ] Página dedicada "Como tratamos seus dados" — 1.5h
- [ ] Política de privacidade simples (template + ajuste) — 1h
- [ ] Gravar 3 vídeos curtos (formato Reels/TikTok, 30-60s): — 3.5h total
  - "A planilha que você nunca conseguiu manter" (esperto + zero esforço)
  - "Não deixa o mercado te passar a perna" (provocação)
  - "Indica pra sua mãe" (persona indireta + família)
- [ ] 1 post de carrossel para Instagram com prints reais do bot — 1h

### Semana 4 — Polimento do Free + Scheduler de Resumo Mensal (7h)
**Objetivo:** Free 100% funcional pra justificar gratuidade real.

- [ ] Implementar scheduler (cron-like) que envia resumo no último dia do mês — 3h
- [ ] Template de mensagem de resumo mensal — 1h
- [ ] Polir mensagens de erro: cupom borrado, cupom de farmácia, cupom muito longo, cupom sem itens lidos — 1.5h
- [ ] Comando `/limite` que mostra quantos cupons restam no mês (UX transparente) — 1h
- [ ] Testar fluxo completo de ponta a ponta com 5 cupons reais — 30min

### Semana 5 — Lançamento Beta Soft + Indicação (7h)
**Objetivo:** 30-50 usuários ativos.

- [ ] Lançar para grupos próximos: família, amigos, 2-3 grupos de WhatsApp — 1h ativa, monitoramento contínuo
- [ ] Implementar fluxo de indicação: comando `/indicar` que gera link único — 2h
- [ ] Tabela `indicacoes` no Supabase + lógica de rastreio — 1h
- [ ] Anúncios pagos teste: R$50-100 em Meta Ads (Reels) segmentando 25-45 anos, classe B/C, BR — 1h setup + monitoramento
- [ ] Coletar feedback ativo: mensagem após 3º cupom pedindo nota 0-10 e comentário — 1h
- [ ] Análise diária de métricas (15min/dia ≈ 1h)

### Semana 6 — Iteração + Teste de Pricing (7h)
**Objetivo:** Validar willingness-to-pay com dados reais.

- [ ] Segmentar usuários ativos em 3 grupos randomizados — 30min
- [ ] Enviar mensagem de teste de preço diferente para cada grupo: — 2h
  - Grupo A: "R$4,90/mês para continuar usando a partir do próximo mês"
  - Grupo B: "R$9,90/mês individual ou R$15/mês família (até 3)"
  - Grupo C: "Pague o que achar justo"
- [ ] Medir conversão por grupo — 1h análise
- [ ] Reescrever página principal com a oferta vencedora — 2h
- [ ] Documento de retrospectiva: o que funcionou, o que não, próximos 30 dias — 1h
- [ ] Decisão final: ativar paywall em qual estrutura — 30min

### Semana cortável (se necessário):
**Semana 4** é a única realmente cortável sem matar o lançamento — o resumo mensal pode ser substituído por mensagem manual no primeiro mês. Cortar tudo o resto compromete a campanha.

---

## 7. Plano de Marketing

### 7.1. Posicionamento

> **"O Economizei é a planilha de gastos do mercado que você nunca conseguiu manter — porque agora é só uma foto no WhatsApp."**

Frame: contra a planilha (que falhou) e contra "mais um app" (que dá preguiça baixar).

### 7.2. Personas (3, com a indireta nova)

**Persona 1 — Carla, a Otimizadora (35-50 anos, classe B)**
- Mora com marido + 2 filhos
- Gasta R$1.000-1.500/mês no mercado
- Já tentou planilha. Manteve por 2 meses.
- Gatilho de compra: ver promoção que não estava na lista
- Mensagem que converte: "Economize sem virar contadora da casa"

**Persona 2 — Bruno, o Controlador (28-40 anos, classe B/C)**
- Mora com namorada/esposa, sem filhos ou 1
- Gasta R$500-900/mês no mercado
- Gatilho de compra: ir ao mercado com fome
- Mensagem que converte: "Saiba exatamente quanto gasta. Sem planilha, sem app."

**Persona 3 (NOVA) — Marina, a Filha Preocupada (25-40 anos, classe B)**
- Já tem alguma organização financeira própria
- Mãe ou pai gastam descontrolado e ela se preocupa
- Mensagem que converte: "Quem deveria controlar os gastos não é só você. Mostra o Economizei pra sua mãe — você cuida, ela controla."
- Plano-alvo: Família R$15 (paga ela, usa a família).

### 7.3. Mensagens-chave (hierarquia)

1. **Esperto/Economia (headline):** "Não deixa o mercado te passar a perna" / "Economizar virou foto"
2. **Privacidade (bloco dedicado):** "Sua foto fica com você. A gente lê os números e apaga."
3. **Sem app:** "Funciona dentro do WhatsApp. Nada para baixar."
4. **Sem planilha:** "Você manda a foto. Pronto."
5. **Alerta proativo:** "A gente avisa **antes** de você estourar o orçamento."
6. **Família:** "Indica pra sua mãe — controla quem precisa."

### 7.4. Canais (priorização para 6 semanas)

| Canal | Esforço | ROI esperado | Quando |
|---|---|---|---|
| WhatsApp orgânico (família/amigos/grupos) | Baixo | Alto | Sem 5 |
| Reels Instagram + TikTok (3 vídeos) | Médio | Médio-alto | Sem 3-5 |
| Meta Ads R$50-100 teste | Baixo | Variável | Sem 5-6 |
| Comunidades de finanças no Telegram/Reddit BR | Baixo | Médio (nicho qualificado) | Sem 4 |
| Indicação via `/indicar` | Baixo (após código pronto) | Alto se semente boa | Sem 5-6 |

### 7.5. Campanha de Lançamento (Semana 5-6)

**Nome interno:** "Beta Fundador"
**Duração:** 14 dias
**Meta quantitativa:** 50 usuários únicos enviarem ≥1 cupom; ≥40% retornarem na semana 2; ≥10 indicações geradas.
**Meta qualitativa:** 5 entrevistas curtas (10min) com usuários ativos.

**Sequência:**
- **D-3:** Post "anúncio" no Instagram + status pessoal: "Lancei o Economizei em beta gratuito. Quem testar agora vira fundador — preço travado pra sempre."
- **D-1:** Mensagem em 3 grupos pessoais de WhatsApp explicando o porquê.
- **D0:** Vídeo de demonstração (1 min) postado em Reels + TikTok + Stories. Link na bio leva à landing.
- **D+3:** Carrossel "como funciona em 3 passos".
- **D+7:** Post com primeiro caso real (com permissão).
- **D+10:** Ativar Meta Ads R$50 para o vídeo de melhor desempenho orgânico.
- **D+14:** Post de gratidão + abertura formal do programa de indicação.

---

## 8. Copy Pronta

### 8.1. Headlines para landing (A/B test recomendado)

**Opção 1 — provocação direta (rodar como variante A):**
> **"Não deixa o mercado te passar a perna."**
> *Subhead:* Manda a foto do cupom no WhatsApp. A gente te mostra onde tá saindo dinheiro sem você ver.

**Opção 4 — esperto + zero esforço (rodar como variante B):**
> **"Economizar virou foto."**
> *Subhead:* Manda o cupom, recebe o resumo. Zero planilha, zero cadastro, zero chatice.

**Opções de reserva:**
- "Quem economiza no mercado é quem sabe onde gasta."
- "Comprou achando que tava barato. Era." (de barato — sarcástico)
- "O preço subiu sem você ver. A gente vê."
- "Pra quem não gosta de pagar mais."

**Recomendação tática:** Opção 1 tende a ter CTR maior em anúncio (provocação). Opção 4 tende a converter melhor na landing (clareza vence emoção depois do clique).

### 8.2. Bullets de benefício (landing — bloco principal)

- **Sem app pra baixar.** Tudo dentro do WhatsApp.
- **Sem digitar nada.** Foto do cupom é o suficiente.
- **Aviso antes de estourar.** Quando seu gasto passa do normal, a gente te avisa — não depois.
- **Comparativo de preços.** *(em breve, plano Individual)* Aquele arroz tava mais barato no outro mercado? A gente te conta.
- **Sua privacidade é o ponto.** A foto é processada e apagada. Só ficam os números.

### 8.3. Bloco de privacidade (landing — destaque)

> **"Mas e os meus dados?"**
>
> A gente entende. Mandar foto de cupom parece estranho.
>
> Aqui está o trato: a foto serve só pra ler os números. Depois disso, ela some. A gente guarda só o que importa: data, loja, total e o que você comprou. Nada cruzado com seu nome, seu CPF, ou qualquer coisa do tipo. Você apaga sua conta quando quiser, e tudo vai junto.

### 8.4. Bloco de pricing (landing — 4 cards)

**Card 1 — Grátis (Beta Fundador)** — *destaque visual*
- R$0
- Até 10 cupons/mês
- Resumo imediato
- Resumo mensal
- Alerta básico
- **Bônus fundador:** 3 meses do Individual grátis quando virar pago + preço de fundador vitalício
- CTA: "Quero entrar"

**Card 2 — Individual** — *tag "em breve"*
- R$9,90/mês
- Cupons ilimitados
- Comparativo de preços entre mercados
- Alerta inteligente (preditivo)
- CTA: "Avise quando liberar"

**Card 3 — Família** — *tag "em breve" + selo "mais escolhido"*
- R$15/mês
- Até 3 pessoas
- Tudo do Individual
- Visão consolidada da família
- CTA: "Avise quando liberar"

**Card 4 — Família+** — *tag "em breve"*
- R$22/mês
- Até 5 pessoas
- Igual ao Família, mais 2 vagas
- CTA: "Avise quando liberar"

### 8.5. CTA principal

**Botão:** "Quero entrar no Beta"
**Microcopy:** "100% gratuito. Sem cartão. Você vira fundador — preço travado pra sempre."

### 8.6. Mensagens WhatsApp do onboarding (sequência completa)

**Mensagem 1 — Boas-vindas (envio imediato)**
> Oi! 👋 Bem-vindo ao Economizei.
>
> Antes de qualquer coisa: aqui não tem app pra baixar, nem cadastro chato. Só esse WhatsApp.
>
> E uma promessa importante — sua foto do cupom é processada na hora e apagada. A gente guarda só os números (data, loja, valor, itens). Nada do seu rosto, nada do seu CPF.
>
> Você tá entrando como **fundador** do beta. Tudo grátis agora. Quando virar pago (daqui uns meses), você ganha 3 meses do plano Individual de presente e preço travado pra sempre.
>
> Bora começar?

**Mensagem 2 — Pedido do primeiro cupom (após resposta — endereça objeção "vai dar trabalho?")**
> Olha, vou ser direto: **só tem uma coisa pra você fazer**. Tirar foto do cupom fiscal e mandar aqui.
>
> Sem cadastro. Sem escolher categoria. Sem digitar nada. Sem configurar meta. Não tem app pra baixar.
>
> É sério. É só foto. Quando mandar, eu faço o resto em uns 30 segundos.
>
> Da próxima vez que for ao mercado, pega o cupom (aquele papel comprido) e tira uma foto reta, com luz boa. Pode ser amanhã, semana que vem, quando der.

**Mensagem 3 — Após o primeiro cupom processado (planta a semente da objeção "cupom já mostra")**
> Pronto! 🎉
>
> Esse cupom: R$XXX,XX em N itens, no [Mercado].
>
> A partir do próximo cupom, eu começo a comparar — e é aí que o negócio fica útil. O cupom mostra o momento. Eu vou te mostrar o mês.

**Mensagem 4 — Após o segundo cupom (mata a objeção "cupom já mostra")**
> Esse cupom: R$XXX,XX. Junto com o anterior, você já gastou R$YYY,YY esse mês. Tá Z% [acima/abaixo] da média dos últimos meses.
>
> **Esse é o ponto.** O cupom te mostra o momento. Eu te mostro o mês.
>
> Manda mais quando quiser. Tô aqui.

### 8.7. Posts para redes sociais (3 prontos)

**Post 1 — Reels/TikTok (roteiro 30s)**
> [0-3s] Câmera fechada em planilha de Excel cheia de gastos abandonada.
> Voz: "Você já tentou planilha de gastos do mercado?"
>
> [3-8s] Mão fechando o notebook, expressão de cansaço.
> Voz: "Quanto tempo durou? Dois meses? Três?"
>
> [8-15s] Tela de WhatsApp recebendo foto de cupom + resposta automática "R$847,30 — 12% acima do mês passado".
> Voz: "O Economizei é a planilha que você não precisa preencher."
>
> [15-25s] Tela mostrando alerta "Atenção: você já gastou R$800 esse mês. Tá 30% acima."
> Voz: "Foto do cupom. Resumo automático. Aviso antes de estourar o mês."
>
> [25-30s] Logo + "Beta gratuito. Vira fundador. Link na bio."

**Post 2 — Carrossel Instagram (5 slides)**
- Slide 1: "Você sabe quanto gastou no mercado mês passado?"
- Slide 2: "67% das pessoas não sabem com certeza." (citando a própria pesquisa)
- Slide 3: "E a maioria descobre tarde demais — no extrato do cartão."
- Slide 4: "O Economizei te avisa antes. Por WhatsApp. Sem app pra baixar."
- Slide 5: "Beta gratuito. Quem entra agora vira fundador. Link na bio."

**Post 3 — Story / texto curto WhatsApp (Persona 3 / família)**
> Quem na sua família tem mais descontrole no mercado? Você ou sua mãe?
>
> Lancei algo em beta: foto do cupom no WhatsApp = resumo automático + aviso quando passar do limite. Funciona pra quem instala e pra quem ela aponta.
>
> Quem quiser testar (e indicar pra alguém da família que precisa), manda "quero" aqui. Tá grátis.

### 8.8. Anúncio Meta Ads (Reels)

**Primary text:**
> Você já tentou planilha de gastos do mercado e desistiu? O Economizei é a versão que funciona — porque é só foto do cupom no WhatsApp. Beta grátis. Quem entra agora vira fundador.

**Headline:** "Não deixa o mercado te passar a perna."
**Description:** "A gente te avisa antes de você estourar o mês."
**CTA:** Saiba mais

---

## 9. Métricas de Sucesso (final das 6 semanas)

| Métrica | Mínimo | Meta | Excelente |
|---|---|---|---|
| Visitantes únicos na landing | 200 | 500 | 1.000+ |
| Cadastros na waitlist | 50 | 120 | 250+ |
| Usuários que mandaram ≥1 cupom | 30 | 60 | 100+ |
| Retenção W2 (cupom na semana 2) | 30% | 45% | 60%+ |
| Indicações geradas | 5 | 15 | 30+ |
| Respostas qualitativas obtidas | 5 | 15 | 25+ |
| % "pagaria R$X" no teste de preço | 15% | 25% | 35%+ |

**Decisão crítica em D+42:** Se retenção W2 < 30% **e** willingness-to-pay < 15%, **não ativar paywall.** Continuar gratuito mais 30 dias e iterar produto.

---

## 10. Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Z-API bloqueia número | Média | Alta | Usar número dedicado, ritmo orgânico |
| Custo Gemini explode | Baixa | Média | Cap de 10 cupons/mês no free, monitorar custo semanal |
| Privacidade vira escândalo | Baixa | Alta | Mensagem de privacidade na 1ª interação + página dedicada |
| Indicação não acontece | Média-alta | Média | Recompensa explícita, não depender de boa vontade |
| 1h/dia não acontece sempre | Alta | Média | Buffer já embutido; cortar Semana 4 (scheduler) primeiro se precisar |
| Free vira "treinamento de gratuidade" | Média | Alta | Tag fundador + comunicação clara desde dia 1 sobre paywall futuro |

---

## 11. Próximos Passos Imediatos (próximas 48h)

1. Ler este documento e confirmar/discordar pontos.
2. Decidir: domínio + nome confirmado? Logo existe?
3. Criar `.env.example` e remover `.env` do git (se ainda não).
4. Bloquear 1h fixa no calendário, mesmo horário, próximos 7 dias.
5. Listar 20 pessoas próximas que serão a primeira semente do beta.
6. Criar coluna `beta_fundador` no Supabase.

---

*Documento gerado a partir de 30 respostas qualitativas únicas + auditoria do código em C:\Economizei + decisões tomadas em sessão de discussão estratégica em 2026-05-08. Atualizar após Semana 2 com dados de tráfego reais.*
