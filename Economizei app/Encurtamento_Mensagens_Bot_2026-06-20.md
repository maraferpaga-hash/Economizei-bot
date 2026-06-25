# ✂️ Encurtamento das mensagens automáticas do bot — antes/depois

**Data:** 2026-06-20 · **Autor:** Claude (skills `economizei-copywriter` + `copy-review`)
**Escopo desta rodada:** só as mensagens **automáticas de alto impacto** (o usuário recebe sem pedir).
**Pendente:** sua aprovação. Só edito o `src/formatter.js` depois que você der o ok (ou ajustar).

---

## TL;DR

O problema que você sentiu é real: o dado de maior impacto (o R$, o %, a economia) estava enterrado embaixo de explicação e reassurance. Três princípios guiaram o corte:

1. **O número vem primeiro.** A linha que importa (quanto gastou, quanto acima da média, quanto economizou) sobe pro topo, antes de qualquer explicação.
2. **Cortar reassurance repetida.** "Tudo sob controle", "É isso, você está no controle agora", "Estou aqui quando você quiser" — uma vez basta, ou nem isso.
3. **Voz de WhatsApp.** Frase curta, "pra/tira/manda", sem "cê/tá/né/ó" (regra do bot, decisão 2026-05-26).

**Resultado medido:** de **4.105 → 3.059 caracteres** no conjunto (**-25%**), sem perder nenhum número nem nenhuma promessa. Cortes por mensagem de **8% a 41%**.

> A confirmação de cupom caiu só 8% em caracteres — **mas é a mudança mais importante da rodada**: os dois números que importam (total da compra + total do mês) saem de baixo da lista de itens e vão pro topo, lado a lado. Isso resolve exatamente o "informação impactante escondida no meio".

---

## Placar de redução

| Mensagem | Antes | Depois | Redução |
|---|---:|---:|---:|
| Confirmação de cupom (mercado) | 237 | 218 | -8% * |
| Confirmação de cupom (não-mercado) | 179 | 121 | -32% |
| Alerta — acima da média | 187 | 120 | -36% |
| Alerta — abaixo da média | 128 | 76 | -41% |
| Alerta — dentro do padrão | 108 | 76 | -30% |
| Resumo mensal | 623 | 429 | -31% |
| Onboarding 1 (bem-vindo) | 270 | 212 | -21% |
| Onboarding 2 ("vai dar trabalho?") | 137 | 115 | -16% |
| Onboarding 3 (comparação temporal) | 382 | 288 | -25% |
| Onboarding 4 (mostra o padrão) | 329 | 236 | -28% |
| Lembrete — D2 (nunca mandou) | 190 | 153 | -19% |
| Lembrete — D7 | 226 | 149 | -34% |
| Lembrete — Inativo D3 | 121 | 94 | -22% |
| Lembrete — Inativo D10 | 200 | 163 | -19% |
| Lembrete — Inativo D30 | 171 | 148 | -13% |
| Lembrete — Inativo D60 | 251 | 185 | -26% |
| Lembrete — Fim de mês | 196 | 154 | -21% |
| Lembrete — Limite (8/10) | 170 | 122 | -28% |
| **TOTAL** | **4.105** | **3.059** | **-25%** |

\* *A confirmação de cupom usa lista de itens completa (decisão 2026-06-04 — você pediu pra mostrar todos). O ganho aqui é estrutural, não de tamanho: os números sobem pro topo.*

---

## 1. Confirmação de cupom — `montarResposta`
*Dispara depois de cada foto. A mais vista de todas.*

### Mercado

**Antes:**
```
✅ *Compra registrada!*

🏪 Supermercado Souza — 15/06
💰 *Total: R$ 287,50*

📦 *Itens registrados (3):*
• Arroz Tio João 5kg — R$ 28,90
• 2x Leite Integral — R$ 9,80
• Picanha Bovina — R$ 64,00

📊 *Esse mês:* R$ 1.234,00 em 5 compra(s)
```

**Depois:**
```
✅ *Compra registrada* — Supermercado Souza, 15/06
💰 *R$ 287,50* nesta compra
📊 *R$ 1.234,00* no mês (5 compras)

📦 *3 itens:*
• Arroz Tio João 5kg — R$ 28,90
• 2x Leite Integral — R$ 9,80
• Picanha Bovina — R$ 64,00
```

**Por quê:** o total do mês estava lá no rodapé, depois de 3 (ou 40) itens — o usuário tinha que rolar pra ver o número que mais importa. Agora os **dois R$ ficam juntos no topo**, antes da lista. Loja e data sobem pra linha do título (economiza 2 quebras). A lista continua completa.

### Não-mercado

**Antes:**
```
✅ *Cupom registrado!*

🏪 Drogaria Popular — 15/06
🏷️ _Não é de supermercado — guardei em *Outros (não-mercado)*._
💰 *Total: R$ 87,30*

📊 *Esse mês:* R$ 1.234,00 em 5 compra(s)
```

**Depois:**
```
✅ *Cupom registrado* — Drogaria Popular, 15/06
💰 *R$ 87,30* · _Outros (não-mercado)_
📊 *R$ 1.234,00* no mês (5 compras)
```

**Por quê:** a nota de categoria vira um selo curto ao lado do valor, em vez de uma frase explicativa inteira. Mantém a transparência ("não é de supermercado") sem o parágrafo.

---

## 2. Alerta de comparação com a média — `montarMensagemAlerta`
*Dispara junto da confirmação. Os 3 níveis tinham título + 2 parágrafos cada.*

### Acima da média

**Antes:**
```
📈 *Compra acima do seu padrão*

Esta compra ficou *33% acima* da sua média, que é de R$ 215,00 por compra.

Pode ser só a compra do mês — mas se quiser ver o que pesou, mande /historico.
```

**Depois:**
```
📈 *33% acima da sua média* (R$ 215,00/compra).
Pode ser a compra grande do mês — pra ver o que pesou, manda /historico.
```

### Abaixo da média

**Antes:**
```
📉 *Compra abaixo da média — economia!* 🎉

Esta compra ficou *33% abaixo* da sua média de R$ 215,00 por compra. Continue assim!
```

**Depois:**
```
📉 *33% abaixo da sua média* (R$ 215,00/compra). Economia! Continua assim 🎉
```

### Dentro do padrão

**Antes:**
```
✅ *Compra dentro do seu padrão*

Ficou bem perto da sua média de R$ 215,00 por compra. Tudo sob controle. 👍
```

**Depois:**
```
✅ *Dentro do seu padrão* — perto da média de R$ 215,00/compra. Tudo certo 👍
```

**Por quê:** o título repetia o que a frase já dizia. Fundi os dois: o **% e a média viram o próprio título em negrito**. O CTA (/historico) só fica no nível "acima", que é onde faz sentido investigar.

---

## 3. Resumo mensal — `montarResumoMensal`
*A mais longa das automáticas. Disparava 1x/mês com ~12 linhas.*

**Antes:**
```
🗓️ *Seu mês no Economizei — Junho/2026*

💰 Você gastou R$ 1.234,00 em 5 compras
📊 Ticket médio: R$ 246,80

🏪 *Onde você mais gastou:*
1. Supermercado Souza — R$ 600,00 (2x)
2. Atacadão do Povo — R$ 420,00 (1x)
3. Mercado Central — R$ 214,00 (2x)

📦 *Itens que mais pesaram:*
1. Picanha Bovina — R$ 90,00
2. Café 500g — R$ 64,00
3. Detergente — R$ 48,00
4. Refrigerante 2L — R$ 42,00
5. Sabão em pó — R$ 38,00

📈 Comparado a Maio/2026: +12% (R$ 130,00 a mais)

💚 No ano, você já economizou R$ 340,00 nos meses em que gastou abaixo da média.

💡 *Continue mandando os cupons* — quanto mais dados, mais padrões eu vejo.
```

**Depois:**
```
🗓️ *Seu mês — Junho/2026*

💰 *R$ 1.234,00* em 5 compras · ticket médio R$ 246,80
📈 +12% que Maio/2026 (R$ 130,00 a mais)
💚 No ano, já economizou R$ 340,00 nos meses abaixo da média.

🏪 *Onde mais gastou:*
1. Supermercado Souza — R$ 600,00 (2x)
2. Atacadão do Povo — R$ 420,00 (1x)
3. Mercado Central — R$ 214,00 (2x)

📦 *Itens que mais pesaram:*
1. Picanha Bovina — R$ 90,00
2. Café 500g — R$ 64,00
3. Detergente — R$ 48,00
```

**Por quê:** a comparação com o mês passado e a economia do ano (os dois insights de maior valor — Camada 2/3 do norte) estavam **lá no fim**, depois de 8 linhas de lista. Subiram pro topo, logo abaixo do total. Itens que mais pesaram cortados de **5 → 3** (os 2 últimos raramente mudam a decisão). A frase final "continue mandando os cupons" sai — o resumo já é a prova de valor, não precisa de pedido.

> **Decisão sua aqui:** topo dá pra cortar o ticket médio também, se quiser ainda mais enxuto. Deixei porque ele cabe na mesma linha do total, sem custo de espaço.

---

## 4. Onboarding (4 mensagens) — `montarOnboarding1..4`

### Onboarding 1 (bem-vindo)

**Antes:**
```
👋 Bem-vindo ao *Economizei*!

Funciona assim: depois do mercado, tire uma foto do cupom fiscal e mande aqui. Em segundos eu registro loja, total e cada item — sem cadastro, sem digitar nada.

📸 *Mande a foto de um cupom para começar.*

_Precisa de ajuda? Mande /ajuda_
```

**Depois:**
```
👋 Bem-vindo ao *Economizei*!

Depois do mercado, tira uma foto do cupom e manda aqui. Em segundos eu registro loja, total e cada item — sem cadastro, sem digitar nada.

📸 *Manda a foto de um cupom pra começar.*
```

**Por quê:** "Funciona assim:" é muleta — a frase funciona sem ela. "/ajuda" sai do onboarding (já aparece na boas-vindas e a pessoa acabou de chegar).

### Onboarding 2 (mata "vai dar trabalho?")

**Antes:**
```
É sério — é literalmente só foto. 📸

Sem cadastro. Sem formulário. Sem digitar nada.

Quando for ao mercado, manda a foto do cupom aqui.
```

**Depois:**
```
É sério — é só foto. 📸 Sem cadastro, sem formulário, sem digitar nada.

Quando for ao mercado, manda o cupom aqui.
```

**Por quê:** "literalmente" é peso morto. As três negações cabem numa linha só.

### Onboarding 3 (planta a comparação temporal)

**Antes:**
```
💡 *Primeiro cupom registrado!*

Continue mandando o cupom depois de cada compra. Em poucas semanas eu mostro coisas que passam despercebidas no dia a dia:

→ Que você gastou R$ 180,00 só em carnes no mês
→ Que a compra do fim de semana custa o dobro da compra rápida
→ Que o total subiu R$ 90,00 em relação ao mês passado

📊 Cada cupom deixa o retrato dos seus gastos mais nítido.
```

**Depois:**
```
💡 *Primeiro cupom registrado!*

Manda o cupom depois de cada compra. Em poucas semanas eu mostro o que passa despercebido:

→ R$ 180,00 só em carnes no mês
→ a compra do fim de semana custa o dobro da rápida
→ R$ 90,00 a mais que o mês passado

📊 Cada cupom deixa o retrato mais nítido.
```

**Por quê:** os 3 exemplos concretos são o coração da mensagem (é o que prova o valor temporal) — **mantidos**. O corte foi só no "Que..." repetido no início de cada linha e nas muletas ("no dia a dia", "dos seus gastos").

### Onboarding 4 (mostra o padrão)

**Antes:**
```
📊 *Duas compras registradas — já dá pra ver o padrão começando.*

Supermercado Souza: R$ 120,00 hoje. No mês até agora: R$ 240,00.

É isso. Você está no controle agora. 🎯

Continua mandando os cupons depois de cada compra. Pra ver o que tem no plano *Individual* (cupons ilimitados + comparativo entre mercados): manda /planos.
```

**Depois:**
```
📊 *Duas compras registradas — o padrão já começa a aparecer.*

Supermercado Souza: R$ 120,00 hoje · R$ 240,00 no mês.

Continua mandando os cupons. Pra ver o plano *Individual* (cupons ilimitados + comparativo entre mercados): /planos.
```

**Por quê:** "É isso. Você está no controle agora 🎯" é reassurance que não acrescenta dado — sai. Os dois valores cabem numa linha com "·".

---

## 5. Lembretes de reengajamento — `montarLembrete*`
*Tom de amizade (decisão 2026-06-02). Mantido — só tirei a gordura.*

| # | Antes | Depois |
|---|---|---|
| **D2** (nunca mandou) | Oi! Tudo bem? 😊 / Só passando para lembrar que estou aqui — quando for ao mercado, é só guardar o cupom e me mandar uma foto. / Não precisa de cadastro, não precisa de app. É só a foto mesmo. | Oi! Tudo bem? 😊 Só passando pra lembrar que estou aqui — quando for ao mercado, guarda o cupom e me manda uma foto. / Sem cadastro, sem app. É só a foto. |
| **D7** | Oi! Faz uma semana que você se cadastrou aqui. 👋 / Se ainda não experimentou, que tal hoje? Pega o próximo cupom do mercado e manda pra mim — em menos de um minuto você já vê o resumo da compra. / Estou aqui quando você quiser. | Oi! Faz uma semana que você chegou aqui. 👋 / Se ainda não testou, pega o próximo cupom e manda — em menos de um minuto você já vê o resumo da compra. |
| **D3** (inativo) | Oi! Passou mais algum dia no mercado? 🛒 / É só mandar a foto do cupom quando tiver — fico aqui registrando tudo pra você. | Oi! Passou no mercado de novo? 🛒 Manda a foto do cupom quando tiver — registro tudo pra você. |
| **D10** | Oi! Você já tem 3 compra(s) registrada(s) aqui comigo este mês. / Quando fechar o mês, te mando um resumo completo de tudo que gastou. Ainda dá tempo de completar — manda mais um cupom quando puder. 📋 | Oi! Você já tem 3 compra(s) registrada(s) este mês. No fim do mês te mando o resumo completo de tudo — ainda dá pra completar, manda mais um cupom quando puder. 📋 |
| **D30** | Faz um tempinho que você não passa por aqui. / Se quiser retomar, é só mandar a foto do cupom do próximo mercado — sem pressa, sem cobranças. Estou aqui quando precisar. 😊 | Faz um tempinho que você não aparece. Pra retomar, é só mandar o cupom do próximo mercado — sem pressa, sem cobrança. Estou aqui quando precisar. 😊 |
| **D60** | Oi! Faz dois meses desde a última vez que você me mandou um cupom. / Se quiser continuar controlando os gastos no mercado, é só me mandar uma foto quando for às compras. E se preferir parar por aqui, tudo bem também — é só mandar /apagar e deleto tudo. | Oi! Faz dois meses desde seu último cupom. / Pra voltar a controlar os gastos, é só mandar uma foto quando for às compras. Se preferir parar, tudo bem — manda /apagar que eu deleto tudo. |
| **Fim de mês** | O mês está quase fechando! 📅 / Você tem 3 compra(s) registrada(s) até agora. Se ainda tiver cupons guardados, manda pra mim antes do fim do mês — assim consigo montar um balanço completo pra você. | Fim do mês chegando! 📅 Você tem 3 compra(s) registrada(s). Se tiver cupons guardados, manda antes de virar o mês — aí monto um balanço completo pra você. |
| **Limite 8/10** | Você já usou 8 dos 10 cupons gratuitos deste mês. 📊 / Ainda dá para mais 2 registros. Se quiser continuar sem limite, dá uma olhada nos planos — é só mandar /planos aqui. | Você já usou 8 dos 10 cupons grátis do mês. 📊 Ainda dá pra mais 2. Pra não ter limite, dá uma olhada nos planos: /planos. |

**Por quê:** os lembretes tinham 3 parágrafos pra dizer 1 coisa. Mantive o tom de amizade e o gancho de cada um (o número de compras no D10/fim-de-mês, a opção `/apagar` no D60, o `/planos` no limite), só juntei frases e tirei o "Estou aqui quando você quiser" repetido.

---

## Conformidade (checagem feita)

- ✅ **Nenhum número ou promessa novo.** Preços, %, limites e médias são idênticos aos atuais (`financial-firewall` ok — nada que não tenha source no CLAUDE.md).
- ✅ **Sem gíria proibida no bot.** Zero "cê/tá/né/ó" nas reescritas (regra 2026-05-26). Mantive só o falado sancionado pela skill `copywriter`: "pra", "tira", "manda".
- ✅ **Norte preservado.** Os insights de Camada 2/3 (comparação temporal, economia do ano, % vs. média) não só ficaram — **subiram** pro topo, ficando mais visíveis.
- ✅ **Zero atrito.** Nenhum corte adicionou passo pro usuário.

## Fora do escopo desta rodada (candidatos à próxima)

Mensagens **acionadas por comando** (não automáticas), que também estão longas: `/planos`, `/gastos`, `/privacidade`, boas-vindas (`/ajuda`), e as de assinatura (MP/PIX). E as de **erro** (`montarMensagemErro`, enviar-como-arquivo) — automáticas, mas ficaram de fora por você ter escolhido "alto impacto". Posso encurtar qualquer uma quando quiser.

## Próximo passo

Me diz **aprovado** (ou aponta os ajustes) e eu aplico direto no `src/formatter.js`, pronto pro seu `git push`. Como sempre, o push é seu — eu deixo o código salvo em `C:\Economizei`.
