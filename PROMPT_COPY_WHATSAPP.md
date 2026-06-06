# Prompt — Revisão de Copy das Mensagens do WhatsApp (Economizei)

> **Como usar:** cole este prompt inteiro em uma conversa nova com Claude Opus.
> Ele é auto-contido — não é necessário compartilhar nenhum outro arquivo.

---

## Seu papel

Você é um especialista em copy conversacional para bots de WhatsApp no Brasil. Seu trabalho é reescrever mensagens que um bot manda para usuários reais — pessoas comuns, não técnicas, que usam o WhatsApp como app principal.

Boa copy de bot não é copy de marketing: é copy de conversa. Cada mensagem deve soar como uma pessoa útil e direta, não como um e-mail corporativo nem como um anúncio.

---

## Contexto do produto

**Economizei** é um bot de WhatsApp que analisa cupons fiscais via foto (IA). O usuário manda a foto do cupom depois de ir ao mercado, e o bot registra automaticamente: loja, data, total, itens. Com o tempo, o bot mostra padrões — onde o dinheiro vai, o que subiu de preço, como os gastos evoluem mês a mês.

**Proposta de valor central:**
> Não é só ler o cupom — é agregar as informações no tempo. O valor real aparece depois de algumas semanas: padrões que o usuário jamais perceberia olhando os cupons um a um.

**O que o plano Grátis entrega (sem precisar pagar nada):**
- Foto do cupom → análise imediata na hora
- Resumo automático no fim do mês (total, lojas, itens que mais pesaram, comparação com mês anterior)
- Alerta quando uma compra está acima da média histórica do usuário
- Histórico das últimas compras via comando `/historico`
- Limite de 10 cupons por mês (técnico, anti-abuso — cobre quem vai ao mercado 2-3x por semana)

**O que o plano pago Individual (R$9,90/mês) adiciona:**
- Cupons ilimitados
- Comparativo entre mercados (qual mercado está mais barato nos itens que o usuário compra)
- Alerta inteligente preditivo (avisa antes do mês estourar, categorizado por tipo de item)

**Planos família:** Família R$15 (até 3 pessoas) e Família+ R$22 (até 5 pessoas) — visão consolidada dos gastos familiares.

**Concorrente real do produto:** a planilha de Excel. Não outros apps. O usuário já tentou controlar gastos com planilha e desistiu.

**Princípio de produto inegociável:**
> "Grátis funciona de verdade. Pago é genuinamente melhor, não o grátis quebrado para forçar upgrade."

---

## Público-alvo e personas

**Perfil:** Brasileiros Classe B/C, 25–55 anos. Vão ao supermercado semanalmente. Sensíveis a preço. WhatsApp é o app que mais usam — têm baixa tolerância a fricção e a apps novos.

**Persona Carla (35–50 anos) — a Otimizadora:**
Mora com marido e filhos. Gasta R$1.000–1.500/mês no mercado. Já tentou planilha e desistiu. Quer saber para onde vai o dinheiro sem virar contadora de casa.

**Persona Bruno (28–40 anos) — o Controlador:**
Casal sem filhos. Gasta R$500–900/mês. Quer saber *exatamente* quanto gasta. Trigger emocional: ir ao mercado com fome e gastar mais do que planejou.

**Persona Marina (25–40 anos) — a Filha Preocupada:**
Organizada, preocupada com os gastos da mãe/pai. Pode ser ela quem instala o bot para outra pessoa.

**Frame cultural que ressoa com esse público:**
> "Ser esperto / não dar mole / saber das coisas." O brasileiro classe B/C tem orgulho de ser atento ao preço. A copy deve ativar esse orgulho — não culpa, não alarme.

---

## Regras de tom e linguagem

**O bot fala:**
- Português formal mas caloroso — como um assistente competente e humano, não robótico
- Frases curtas. Sem bloco de texto longo
- Direto ao ponto — o usuário está no WhatsApp, não lendo e-mail
- Números sempre no formato brasileiro: R$ 1.234,50

**O bot NÃO fala:**
- Linguagem informal ou gíria: "cê", "tá", "né", "ó", "véi", "mano" — esses são reservados EXCLUSIVAMENTE para roteiros de TikTok/Reels, jamais no bot
- Jargão de startup: "feature", "onboarding", "upgrade", "tier", "MVP"
- Promessas de benefício futuro sem data ou condição clara
- Tom de urgência de venda falsa ("só hoje!", "não perca!")

**Formatação WhatsApp disponível:**
- `*texto*` = **negrito**
- `_texto_` = _itálico_
- Emojis com moderação — 1-2 por mensagem, nunca decorativos, só quando reforçam o sentido
- Listas com `•` ou `→` para itens paralelos

---

## As 5 mensagens a reescrever

Para cada mensagem: você vai ver (1) o texto atual, (2) o diagnóstico do problema, (3) um rascunho de direção que eu preparei. Seu trabalho é escrever a versão final — melhorando o rascunho, não apenas copiando-o.

---

### MENSAGEM 1 — Onboarding: primeiro contato

**Gatilho:** usuário manda qualquer mensagem pela primeira vez (texto ou imagem).

**Texto atual:**
```
👋 Oi! Eu sou o *Economizei* — um bot que te ajuda a acompanhar seus gastos no mercado pelo WhatsApp.

*Como funciona:* depois de comprar, você tira foto do cupom fiscal e manda aqui. Eu organizo tudo automaticamente — quanto gastou, onde, em quê.

Quando for ao mercado, manda a foto do cupom aqui. Aguardo! 📲

(Pra ver os planos disponíveis, manda */planos* a qualquer momento.)
```

**Problema:** longa demais para uma abertura. Parece um manual de instruções. O usuário ainda não fez nada — não precisa de explicação, precisa de uma ação clara e de acolhimento. A lista de comandos que vem depois (em `/ajuda`) já cobre o resto.

**Rascunho de direção:**
```
👋 Bem-vindo ao *Economizei*!

Depois do mercado, tire foto do cupom e mande aqui. Eu registro tudo automaticamente — loja, total e itens.

📸 *Mande a foto de um cupom para começar.*

_Precisa de ajuda? Mande /ajuda_
```

**O que melhorar no rascunho:** o rascunho está funcional, mas pode ser mais caloroso e criar mais antecipação sem ficar longo. Pense em como deixar o usuário curioso sobre o que vai acontecer quando mandar o cupom.

---

### MENSAGEM 2 — Onboarding: após o primeiro cupom registrado

**Gatilho:** usuário acabou de registrar seu *primeiro* cupom. Esta mensagem é enviada logo após a confirmação da compra.

**Texto atual:**
```
💡 *Esse foi seu primeiro registro.*

Daqui um mês você vai começar a ver padrões que hoje não dá pra ver — onde tá gastando mais, o que sobe de preço, onde dá pra economizar.

Na próxima ida ao mercado, manda o cupom de novo. 👊
```

**Problema:** diz que o usuário vai ver padrões, mas não mostra o que são esses padrões. "Padrões" é abstrato — o usuário não consegue imaginar o que esperar. É a maior oportunidade de plantar a semente do hábito: mostrar exemplos concretos do que ele vai descobrir depois de algumas semanas.

**Rascunho de direção:**
```
💡 *Primeiro registro feito.*

Continue mandando o cupom depois de cada ida ao mercado. Com o tempo você vai ver coisas que hoje passam despercebidas:

→ Em qual semana do mês você mais gasta
→ Qual categoria de produto está pesando no orçamento
→ Se seus gastos estão subindo ou caindo mês a mês

Cada cupom é um dado a mais. 📊
```

**O que melhorar no rascunho:** os exemplos da lista precisam ser mais vívidos e específicos — menos genéricos, mais próximos do que o usuário realmente vai descobrir. Pense nos padrões reais que uma Carla ou um Bruno descobririam depois de 4 semanas de uso. Use números hipotéticos concretos quando fizer sentido (ex: "Gastei R$ X a mais em..."). Não mencione comparativo entre mercados aqui — é feature paga.

---

### MENSAGEM 3 — Alerta de gasto acima da média

**Gatilho:** a compra registrada está acima de 120% da média histórica do usuário (mínimo 3 compras anteriores para calcular).

**Texto atual:**
```
⚠️ *Atenção!* Essa compra foi X% maior que sua média habitual (R$ Y).
```
*(onde X = percentual e Y = média histórica em R$)*

**Problema:** informa o fato, mas não dá contexto nem orientação. O usuário recebe o dado e não sabe o que fazer com ele. Pior: o ícone ⚠️ + "Atenção!" soa alarmante para o que pode ser simplesmente a compra do rancho mensal. Precisa de tom mais neutro/analítico e de um próximo passo claro.

**Rascunho de direção:**
```
📊 *Compra acima do seu padrão*

Essa compra ficou X% acima da sua média (R$ Y por compra).

Pode ser o mês de fazer o rancho — normal. Se quiser ver o que pesou, mande */historico*.
```

**O que melhorar no rascunho:** o rascunho está neutro e funcional. Pense em como tornar o dado mais legível e útil sem ser alarmista. A referência ao "rancho" é boa — mas pode ser ainda mais específica ao contexto do usuário. Considere se há uma forma mais elegante de apresentar o número.

---

### MENSAGEM 4 — Limite do plano gratuito atingido

**Gatilho:** usuário tenta mandar o 11º cupom do mês. O limite do plano Grátis é 10 por mês.

**Texto atual:**
```
🏆 *10 cupons esse mês — você usou seu limite do plano Grátis.*

Seu limite renova no dia 1 do próximo mês. Até lá, tudo que você registrou continua salvo — manda */resumo* pra ver.

*Se quiser cupons ilimitados agora:*
O plano *Individual* (R$9,90/mês) tem:
✓ Cupons ilimitados
✓ Comparativo entre mercados (qual tá mais barato pros itens que você compra)
✓ Alerta inteligente antes do mês estourar

Manda */planos* pra ver como assinar via PIX.
```

**Problema:** o título "🏆" seguido de upsell imediato é dissonante — ou é conquista, ou é venda, não os dois ao mesmo tempo. O usuário atingiu o limite porque usa o produto ativamente — isso é um comportamento positivo que merece ser reconhecido antes de apresentar uma oferta. A lista de ✓ parece um anúncio no meio de uma conversa.

**Rascunho de direção:**
```
📊 *Você chegou ao limite de 10 cupons do plano Grátis este mês.*

Tudo que registrou continua salvo — mande */historico* para ver o resumo. Seu limite renova no dia 1.

Se não quiser esperar: o plano *Individual* (R$9,90/mês) tem cupons ilimitados e comparativo entre mercados. Mande */planos* para assinar via PIX.
```

**O que melhorar no rascunho:** o rascunho retira a dissonância mas ficou neutro demais. Encontre o equilíbrio entre reconhecer o comportamento positivo (usar o produto todo mês é exatamente o que queremos) e apresentar o upgrade de forma natural — como o próximo passo lógico para quem usa o produto com frequência, não como um anúncio.

---

### MENSAGEM 5 — Texto não reconhecido

**Gatilho:** usuário (pós-onboarding) manda uma mensagem de texto que não é nenhum dos comandos conhecidos.

**Texto atual:**
```
📸 Me manda a foto do cupom do mercado!

(Manda */planos* pra ver as opções pagas, ou */ajuda* pra ver todos os comandos.)
```

**Problema:** descarta o usuário rápido demais. Ele pode estar tentando fazer uma pergunta, relatando um problema ou simplesmente explorando o bot. O tom é um pouco imperativo ("Me manda!"). Um redirecionamento mais acolhedor funciona melhor.

**Rascunho de direção:**
```
Não entendi essa mensagem.

Para registrar uma compra: mande a foto do cupom fiscal.
Para ver comandos disponíveis: mande */ajuda*.
```

**O que melhorar no rascunho:** o rascunho está funcional e limpo, mas um pouco frio. Adicione um toque humano sem perder a brevidade. Pense em como um atendente prestativo responderia quando não entende o que o cliente quis dizer.

---

## O que entregar

Reescreva as 5 mensagens como funções JavaScript prontas para substituir as originais no arquivo `src/formatter.js`.

**Regras técnicas:**
- Mantenha o mesmo nome de função em cada caso
- Mantenha os mesmos parâmetros de entrada
- Use template literals (backtick) e `\n` para quebras de linha, exatamente como o código original
- A variável `pixKey()` já existe — use-a onde precisar mencionar a chave PIX
- A função `brl(valor)` já existe — use-a para formatar valores monetários

**Funções a reescrever:**

| Mensagem | Função no formatter.js |
|---|---|
| 1 — Primeiro contato | `montarOnboarding1()` |
| 2 — Após primeiro cupom | `montarOnboarding3()` |
| 3 — Alerta de gasto | `montarMensagemAlerta(percentual, mediaHistorica)` |
| 4 — Limite atingido | `montarMensagemLimite()` |
| 5 — Texto não reconhecido | **Hardcoded em `src/index.js`**, na função `processarTexto()`, linha do `else` final |

Para a mensagem 5, entregue apenas o novo string — não reescreva o arquivo inteiro.

---

## Critérios de qualidade

Antes de entregar, verifique cada mensagem contra estes critérios:

- [ ] **Brevidade:** nenhuma mensagem tem mais de 5 linhas de texto corrido
- [ ] **Ação clara:** toda mensagem termina com um próximo passo claro (ou não precisa de um — em casos óbvios)
- [ ] **Tom correto:** formal mas caloroso, nunca robótico, nunca gíria
- [ ] **Sem promessas vazias:** nenhuma menção a "Beta Fundador", preços travados ou benefícios não confirmados
- [ ] **Emojis com propósito:** no máximo 2 por mensagem, nunca decorativos
- [ ] **Legível em WhatsApp:** sem markdown que não funciona no WhatsApp (sem `##`, sem `---`, sem listas com `-` que não renderizam)

---

## Referências de tom (exemplos do que já funciona bem no bot)

Estas mensagens já estão boas e servem como referência de tom — não as reescreva, só as use como âncora:

**Mensagem de planos (boa estrutura):**
```
💰 *Planos do Economizei*

*🆓 Grátis — R$0/mês*
✓ Foto do cupom → análise na hora
✓ Resumo automático no fim do mês
...
```

**Mensagem de erro "foto borrada" (boa orientação prática):**
```
📸 *A foto ficou meio borrada.*

Tira de novo seguindo essas dicas:
• Boa iluminação (perto da janela funciona)
• Cupom esticado, sem dobras
• Câmera paralela ao papel, sem ângulo
```

**Resumo mensal (bom tom analítico):**
```
🗓️ *Seu mês no Economizei — Maio/2026*

💰 Você gastou R$ 1.240,00 em 8 compras
📊 Ticket médio: R$ 155,00
...
```
