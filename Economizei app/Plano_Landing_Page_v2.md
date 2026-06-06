# Plano de Reformulação — Landing Page Economizei
**Versão:** 2.0  
**Data:** 2026-05-26  
**Status:** Planejamento aprovado — aguardando execução

> Este documento descreve **todas as mudanças planejadas** para a landing antes de qualquer alteração no HTML.
> Nenhuma linha de código foi tocada ainda.

---

## Resumo das decisões

| Mudança | Status | Prioridade |
|---|---|---|
| D — Enriquecer mockup do hero com 3 features reais | ✅ Aprovado | Alta |
| B — Reescrever Passo 3 de "Como funciona" | ✅ Aprovado | Alta |
| A — Nova seção "Na prática, o que você recebe" | ✅ Aprovado | Alta |
| Nova seção — "E se meu cupom não ler?" | ✅ Aprovado | Média |
| C — Bloco de comandos visuais | ❌ Removido | — |

---

## Estrutura final da página (ordem das seções)

```
1. NAV (sem mudança)
2. HERO — com mockup enriquecido [MUDANÇA D]
3. FAIXA DE CREDIBILIDADE (sem mudança)
4. EMPATIA / Problemas que resolvemos (sem mudança)
5. COMO FUNCIONA — Passo 3 reescrito [MUDANÇA B]
6. [NOVA] "Na prática, o que você recebe" [MUDANÇA A]  ← entra aqui
7. OBJEÇÃO "Mas o cupom já mostra isso?" (sem mudança)
8. [NOVA] "E se meu cupom não ler?" [NOVA SEÇÃO]  ← entra aqui
9. ANTI-PLANILHA (sem mudança)
10. PRICING (sem mudança)
11. PRIVACIDADE (sem mudança)
12. COMO COMEÇAR (sem mudança)
13. RODAPÉ (sem mudança)
```

---

## MUDANÇA D — Hero Mockup: 3 features reais em sequência

### Objetivo
O mockup atual mostra só o retorno básico do cupom. O usuário vê o produto como "OCR glorificado".
Precisamos mostrar 3 mensagens consecutivas que revelam o produto real: análise imediata, insight de hábito e resumo mensal.

### Estrutura do mockup reformulado

**Mensagem 1 — Usuário (direita):**
> 📸 [foto do cupom]

**Mensagem 2 — Bot (esquerda) — Análise imediata (já existe, manter):**
```
✅ Compra registrada!

🏪 Supermercado Pessotto — 24/mai
💰 Total: R$ 94,70

📦 Itens principais:
- Arroz 5kg — R$ 24,90
- Feijão 1kg — R$ 8,50
- Leite (6 un) — R$ 37,80
• ...e mais 8 itens

📊 Esse mês: R$ 347,20 em 4 compras
```

**Mensagem 3 — Bot (esquerda) — ALERTA DE GASTO + INSIGHT DE ITEM:**
```
⚠️ Essa compra foi 22% acima da sua média habitual (R$ 77,60).

🍫 Dica: você gastou R$ 43,80 em doces e chocolates
esse mês — foi sua categoria que mais cresceu (↑68%
vs. mês passado).
```
*[Badge verde: "Insight automático — sem você pedir nada"]*

**Mensagem 4 — Bot (esquerda) — TEASER "em breve":**
Cartão com visual levemente diferente (border dashed ou badge "em breve"):
```
🏪 Comparativo de mercados — em breve

Vou te mostrar que o Pessotto cobra em média
R$ 4,20 a mais por compra que o Sakashita
nos seus itens habituais.
```
*[Badge roxo claro: "Plano Individual · em desenvolvimento"]*

### Copy de ancoragem abaixo do mockup
Adicionar 3 chips de confiança abaixo do CTA:
- ✓ Análise em ~3 segundos
- ✓ Insight automático — sem você pedir
- ✓ Comparativo de mercados chegando

---

## MUDANÇA B — Reescrever Passo 3 de "Como funciona"

### Problema atual
> "Você fica esperto — Resumo no fim do mês. Alerta quando gastar acima da sua média."

Vago demais. Não explica O QUÊ você vai descobrir, nem por que isso importa.

### Nova versão

**Título do passo:** "Você descobre o que ninguém te conta"

**Descrição:**
> Todo mês você recebe um relatório automático — sem pedir nada.
> Quanto gastou, onde gastou mais, e o item que mais te fez gastar
> sem você perceber. Com o tempo, os padrões aparecem sozinhos.

**Sub-texto (menor, abaixo):**
> E quando uma compra fugir da sua média, o bot te avisa na hora — com o percentual exato.

### Direção de copy
O frame não é "você fica organizado". É "você finalmente descobre o que estava se escondendo". Usa a lógica do "eu não sabia" que apareceu na pesquisa: "saio do mercado achando que gastei R$ 200, olho o cupom: R$ 340."

---

## MUDANÇA A — Nova seção: "Na prática, o que você recebe"

### Posição na página
Entre "Como funciona" (passo 3 reformulado) e a seção "Mas o cupom já mostra isso?"

### Objetivo
Mostrar o produto real em 3 cenários concretos. O usuário precisa VER antes de crer.
Cada cenário é um mockup de conversa com heading explicativo ao lado.

### Estrutura da seção

**Eyebrow:** `O QUE VOCÊ RECEBE`
**H2:** `Cada foto vai construindo o seu retrato financeiro.`
**Sub:** `Você não precisa fazer nada além de fotografar. O resto chega sozinho.`

---

#### Cenário 1 — Após qualquer compra

**Heading ao lado:** `Análise na hora — com o que importa de verdade`

**Descrição:**
> Loja, data, total e os itens que mais pesaram — tudo registrado automaticamente em ~3 segundos.
> E se essa compra for maior que o seu padrão, você já sabe na mesma mensagem.

**Mockup (simplificado, sem celular):**
```
✅ Compra registrada!
🏪 Mercado Souza — 21/mai · R$ 118,40
📦 Frango (2kg) · Óleo · Macarrão · Detergente...
📊 Esse mês: R$ 412,80 em 5 compras

⚠️ Essa compra foi 34% acima da sua média (R$ 88,20)
```

---

#### Cenário 2 — Fim do mês (automático, sem pedir)

**Heading ao lado:** `Um relatório completo — chega sozinho, todo mês`

**Descrição:**
> No dia 1 de cada mês, você recebe um resumo do mês anterior sem precisar fazer nada.
> Total gasto, em quantas compras, onde foi a maior parte — e o que você comprou
> que mais pesou no orçamento. Inclusive aquilo que você não notava.

**Mockup:**
```
🗓️ Seu mês no Economizei — Maio/2026

💰 Você gastou R$ 687,40 em 8 compras
📊 Ticket médio: R$ 85,93

🏪 Onde você mais gastou:
1. Pessotto — R$ 312,00 (4x)
2. Atacadão — R$ 231,40 (2x)

📦 Itens que mais pesaram:
1. Carne bovina — R$ 143,00
2. Frios e embutidos — R$ 87,60
3. Doces e chocolates — R$ 52,40 ← 

📈 Comparado a Abril: +18%
   (R$ 103,80 a mais)

💡 Continue mandando os cupons — quanto mais
   dados, mais padrões eu vejo.
```

**Copy de destaque lateral (callout):**
> "Doces e chocolates — R$ 52,40"
> Esse é o tipo de coisa que ninguém rastreia,
> mas que aparece no resumo do mês.

---

#### Cenário 3 — Em breve: Comparativo entre mercados

**Heading ao lado:** `[Em breve] Qual mercado tá te cobrando mais caro?`

**Descrição:**
> O Economizei vai cruzar os preços dos seus itens habituais entre os mercados
> que você frequenta. Você vai saber, com dados reais dos seus próprios cupons,
> onde comprar cada coisa. Esse recurso está em desenvolvimento para o plano Individual.

**Mockup (visual "em desenvolvimento" — borda tracejada, cor roxa clara):**
```
🏪 Comparativo de mercados [em breve]

Nos últimos 3 meses, você comprou arroz em
3 mercados diferentes. Preço médio por kg:

• Pessotto: R$ 5,98/kg
• Atacadão: R$ 4,82/kg  ← 19% mais barato
• Souza: R$ 6,20/kg

💡 Se você comprasse só no Atacadão, teria
   economizado ~R$ 38 nos últimos 90 dias.
```

**Badge:** `Plano Individual · R$ 9,90/mês — em desenvolvimento`

**Copy de fechamento da seção:**
> Essas três coisas — análise imediata, resumo mensal e comparativo de preços —
> é o produto que estamos construindo. A foto do cupom é só o começo.

---

## NOVA SEÇÃO — "E se meu cupom não ler?"

### Posição na página
Após a seção A ("Na prática, o que você recebe") e antes de "Anti-planilha".

### Objetivo
Desdramatizar o medo de "mas e se não funcionar?". Transformar a possibilidade de erro
numa prova de cuidado do produto — o bot sempre te orienta, nunca some.

### Direção de copy
**Frame:** não é "nosso produto tem limitações". É "a gente pensou em tudo, inclusive no que pode dar errado".

Brasileiro não quer produto perfeito — quer produto honesto que funciona quando importa.

### Estrutura

**Eyebrow:** `TRANSPARÊNCIA`
**H2:** `E se o bot não conseguir ler o cupom?`
**Sub:** `Acontece. Foto ruim, luz baixa, cupom amassado — a gente sabe. Por isso, o bot nunca some: ele te avisa o que aconteceu e te fala o que fazer.`

**Grid de 5 situações** (cards compactos):

| Situação | O que o bot diz |
|---|---|
| 📸 Foto borrada ou escura | "A foto ficou meio borrada. Tenta com mais luz — perto da janela funciona bem." |
| 🏪 Cupom de farmácia ou restaurante | "Esse cupom não é de supermercado. Por enquanto foco só em mercado — farmácia e restaurante chegam depois." |
| 📜 Cupom muito comprido | "Esse cupom é muito longo. Tira em 2 fotos: topo até o meio, e do meio até o total." |
| ⚠️ Itens ilegíveis | "Li o total certinho, mas os itens estão ilegíveis. Salvo o total — se quiser os itens, tira de novo com mais luz na lista." |
| 🤔 Não é cupom fiscal | "Isso não parece um cupom fiscal. Manda o papel que o caixa te deu — com a lista de produtos e o CNPJ no topo." |

**Copy de fechamento:**
> Em todos os casos, o bot te orienta. Você nunca fica no escuro sobre o que aconteceu.

---

## Notas de tom e copy (para todas as mudanças)

### Regras de voz
- **Sotaque do interior:** "cê", "a gente", "né", "ó". Sem inglês, sem jargão de startup.
- **Frame:** "ser esperto / não dar mole / saber das coisas" — não "disciplina financeira".
- **Honestidade direta:** mostrar o que funciona hoje e o que vem depois, sem exagerar.
- **"Você" singular:** nunca "os usuários", sempre falar direto com quem lê.

### Frases a evitar
- ❌ "Controle financeiro completo"
- ❌ "Gestão de gastos inteligente"
- ❌ "Solução inovadora"
- ❌ Qualquer frase de 3 palavras que poderia estar em qualquer fintech

### Frases a usar
- ✅ "A foto do cupom é só o começo"
- ✅ "Chega sozinho, todo mês — sem você pedir nada"
- ✅ "Você não sabia que gastava R$ 52 com chocolate por mês"
- ✅ "O bot nunca some — ele te fala o que aconteceu"
- ✅ "Quanto mais cupons, mais padrões aparecem"

---

## O que NÃO muda nessa versão

- Design geral, cores, tipografia ✓
- Seção de empatia (Carla, Bruno, Marina) ✓
- Seção "Mas o cupom já mostra isso?" ✓
- Seção anti-planilha ✓
- Pricing (4 planos com PIX) ✓
- Seção de privacidade ✓
- Seção "Como começar" ✓
- Rodapé ✓
- Lógica de A/B de headline ✓

---

## Estimativa de tamanho do HTML após mudanças

A landing atual tem ~2.017 linhas. Com as 2 novas seções e o mockup expandido, estimativa: **+600–800 linhas**, totalizando ~2.700–2.800 linhas. Ainda um arquivo único, sem dependências externas novas.

---

## Próximos passos (após aprovação deste plano)

1. Implementar Mudança D (mockup do hero — menor esforço, alto impacto visual imediato)
2. Implementar Mudança B (reescrever passo 3 — 5 linhas de HTML)
3. Implementar seção A (nova seção com 3 mockups — maior esforço)
4. Implementar nova seção de erros (média complexidade)
5. Deploy no Vercel e validar ao vivo

**Nenhuma alteração no `src/` do bot é necessária** — todas as mudanças são puramente na landing.
