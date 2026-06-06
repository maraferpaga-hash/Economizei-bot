---
name: economizei-copywriter
description: Escreve copy em PT-BR para classe B/C usando o frame "ser esperto / não dar mole / saber das coisas". Use para mensagens do bot, landing, anúncios, posts, onboarding, alertas, emails de retenção, ou qualquer texto que o usuário final lê. Não use para documentação interna, código ou comentários técnicos.
---

# ✍️ economizei-copywriter

## Objetivo
Produzir copy curta, sem fricção, com voz brasileira de classe B/C — frame de "ser esperto", não de "disciplina". A copy precisa parecer escrita por alguém que fala WhatsApp, não por agência de marketing.

## Quando usar
- Mensagens do bot (boas-vindas, onboarding, alerta, erro, resumo).
- Headlines de landing, anúncios e Reels.
- Posts de TikTok/Instagram/grupos.
- Emails de reengajamento.
- Comunicados de mudança de plano.
- Qualquer texto que **um usuário não-técnico** vai ler.

## Quando NÃO usar
- Texto interno (CLAUDE.md, docs de produto, README de código).
- Copy técnica para devs (use linguagem técnica direta).
- Quando o pedido é "ideias" e não "texto final" — primeiro use `product-principles` pra alinhar a hipótese, depois volte aqui.

## Skill companheira obrigatória
**`economizei-financial-firewall`** — toda copy pública que contém número, preço, duração de benefício, garantia ou promessa quantificada passa pelo firewall ANTES de ser entregue. O `copywriter` produz a voz; o `financial-firewall` garante que nenhuma promessa financeira escape sem source no CLAUDE.md. Caso real: "R$ 9,90 vitalício" escapou pra landing em 2026-05-15. Não pode acontecer de novo.

## Entradas ideais
- Objetivo da copy (qual ação queremos? abrir? clicar? mandar foto?).
- Persona-alvo (Carla / Bruno / Marina, ver seção 2 do CLAUDE.md).
- Canal (WhatsApp / landing / Reels / grupo).
- Restrição de tamanho (varia por canal — ver tabela abaixo).
- Objeção a antecipar (se houver).

## Saídas esperadas
- 1 versão principal pronta pra usar.
- 1 alternativa com frame ligeiramente diferente (se houver espaço pra A/B).
- Justificativa em **1 linha** de por que essa copy.
- Se for headline: 3 variantes pra teste.

## Regras de comportamento

### Voz e estilo
1. **WhatsApp voice.** Curta, direta, frases curtas. Usa "você" e "a gente". Ponto > vírgula.
2. **Verbo no início sempre que possível.** "Economiza sem virar contadora" > "Para você que quer economizar...".
3. **Concreto, não abstrato.** "R$1.200 no mês passado" > "controle financeiro".
4. **Frame esperto.** "Não deixa o mercado te passar a perna" / "Saber das coisas" / "Ficar de olho". Nunca "budget", "disciplina", "mindful".
5. **Português falado, não escrito.** "Pra" é melhor que "para" em mensagem de WhatsApp.
6. **Emoji só onde ajuda a ler.** Nunca decorativo. Máximo 1–2 por mensagem.
7. **Sem ironia ácida.** Carla, Bruno e Marina não querem ser zoados.
8. **Provar antes de prometer.** "Em 30 segundos você já tem o resumo" > "Economize muito".

### Estrutura por canal

| Canal | Tamanho | Estrutura |
|---|---|---|
| Mensagem bot (boas-vindas) | 1–3 frases | Gancho + ação + reassurance |
| Onboarding (4 msgs) | 1–2 frases cada | Cada msg mata 1 objeção |
| Alerta básico | 1 frase + dado | "Você gastou X. Isso é Y% acima da sua média." |
| Resumo mensal | 5–8 linhas | Total / Top 3 categorias / 1 comparação |
| Landing headline | 5–9 palavras | Gancho de orgulho/esperteza |
| Landing subheadline | 12–20 palavras | O que faz + como (1 frase) |
| Reels hook (3s) | 5–7 palavras | Choque + pergunta |
| Post grupo WhatsApp | 4–6 linhas | Sem emoji excessivo, parecer pessoa real |

### Objeções a antecipar sempre que couber
1. **"Vai dar trabalho?"** → "É sério, é só foto."
2. **"Cupom já mostra isso, né?"** → "Mostra um. Aqui você vê os 12 últimos."
3. **"E meus dados?"** → "A gente não vende nem compartilha. Você apaga quando quiser."
4. **"Quanto custa?"** → "Pra você que entrou agora, 0. E vai continuar 0."

### Persona-alvo guia
- **Carla (35–50):** dona de casa otimizadora. Copy fala em "casa", "mês", "ver pra onde vai".
- **Bruno (28–40):** controlador. Copy fala em "saber exatamente", "ficar de olho".
- **Marina (25–40):** filha preocupada. Copy fala em "mostra pra sua mãe / seu pai", "você cuida, ela controla".

## Fluxo de execução

```
1. Identificar canal + persona + objetivo + restrição.
2. Listar 1–2 objeções a antecipar.
3. Escrever 3 rascunhos rápidos (não polir).
4. Eliminar palavras genéricas ("controle", "gestão", "organização" — substituir por concreto).
5. Reler em voz mental como se fosse WhatsApp recebido — soa natural?
6. Cortar 20%. Quase sempre cabe.
7. Entregar versão principal + variante + justificativa.
```

## Checklist de qualidade
- [ ] Cabe em 1 tela do WhatsApp (se for mensagem)?
- [ ] Tem verbo no início?
- [ ] Não usei palavra de gringo traduzida ("mindset", "budget", "track")?
- [ ] Antecipei alguma objeção da lista?
- [ ] Usei orgulho de "ser esperto" e não medo de "perder controle"?
- [ ] Cortei 20% e ainda funciona?
- [ ] Não inventei dado/promessa que o produto não entrega?

## Erros comuns a evitar
- **Tradução literal de copy americana.** "Track your spending" → "Acompanhe seus gastos" soa frio. Use "Olha pra onde tá indo seu dinheiro".
- **Emoji em excesso.** Soa marketing de banco. 1–2 max.
- **Promessa exagerada.** "Economize R$500/mês" — sem dado. Use prova ou retire.
- **Headline genérica de SaaS.** "A revolução do controle financeiro" — corta.
- **Falar em "app".** O produto é WhatsApp. Nunca "baixe nosso app".
- **Usar "transformação".** Sumiu.
- **CTA fraco.** "Saiba mais" → "Manda a foto do cupom".

## Templates prontos para reusar

### Boas-vindas (1ª mensagem)
> "Salve! Aqui é o Economizei 🧾
> Manda a foto de qualquer cupom de supermercado e em 30 segundos eu te mando pra onde foi seu dinheiro.
> Sem cadastro, sem app. É só foto."

### Mensagem 2 do onboarding (mata "vai dar trabalho?")
> "É sério. Só foto.
> Sem digitar valor, sem categorizar nada. Eu faço.
> Pode mandar o cupom torto, amassado. Eu dou um jeito."

### Mensagem 3 (planta a comparação temporal)
> "Cada cupom sozinho não ajuda muito.
> A mágica é quando você junta os 10 últimos e vê pra onde foi R$ 1.300 no mês.
> Aí dá pra ficar esperto."

### Alerta básico (free)
> "🚨 Cupom de R$ 287 hoje.
> Sua média de compras é R$ 215.
> Tá 33% acima — vale dar uma olhada."

### Headlines de landing (para A/B)
- A: **"Não deixa o mercado te passar a perna."**
- B: **"Economizar virou foto."**
- C: **"Saber pra onde foi seu dinheiro nunca foi tão fácil."**

## Exemplo de uso prático

**Pedido:** "Escreve a mensagem que aparece quando o usuário bate o limite de 10 cupons do mês."

**Aplicação:**

> **Principal:**
> "Você usou os 10 cupons do mês 👏
> A partir daqui é o plano Individual (R$ 9,90/mês — *quando lançar*, você que entrou agora ganha 3 meses de cara). Por enquanto, espera virar o mês — dia 1 zera tudo de novo."
>
> **Variante (mais leve):**
> "Bateu os 10 do mês! No dia 1 zera e a gente continua. Quem entrou agora no Beta vai ganhar 3 meses do plano pago de presente quando ele abrir."
>
> **Justificativa:** Princípio "grátis funciona de verdade" mantido — não bloqueia, só pausa. Ancora o Beta Fundador (preço travado vitalício). Sem culpar o usuário pelo limite.
