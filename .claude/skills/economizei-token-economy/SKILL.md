---
name: economizei-token-economy
description: Calibra o esforço de resposta (tamanho, formato, ferramentas) ao tamanho real do pedido. Use SEMPRE antes de gerar HTML interativo, widget de visualização, documento longo, ou diagrama elaborado. Use quando o Gabriel diz "rápido", "curto", "breve", "enxuto", "menos esforço", "sem firula". Use por default para escolher o menor formato que responde a pergunta. Não use quando o pedido explicitamente exige output rico (deck, relatório, landing).
---

# 💸 economizei-token-economy

## Objetivo
Entregar **o menor formato que resolve o pedido**. Não gerar HTML refinado, widget interativo, diagrama SVG ou doc longo quando 3 frases bastam. Economiza token do lado do Gabriel (atenção, scroll, leitura) e do lado da máquina (custo, tempo).

> Princípio raiz: **a marca é Economizei. A skill é Economizei.** Aplica o mesmo valor à própria comunicação.

## Quando usar
- **Antes** de gerar HTML, widget, SVG elaborado, doc .md longo, ou bloco de código grande.
- Sempre que o Gabriel disser **"rápido", "curto", "breve", "enxuto", "sem firula", "direto"**.
- Sempre que o pedido for **conceitual ou opinativo** (resposta = texto curto, não artefato).
- Sempre que uma pergunta puder ser respondida em **≤5 frases**.
- Sempre que o Claude **estiver na dúvida** entre 2 formatos.

## Quando NÃO usar
- Pedido explícito de deliverable rico ("monta a landing", "faz a apresentação", "escreve o relatório").
- Quando o output **vai pro usuário final** (copy do bot, mensagem, post — `copywriter` decide).
- Quando o artefato tem valor **durável** (CLAUDE.md, política, fixture de teste).

## Os 8 tiers de output (sempre escolher o menor que funciona)

| Tier | Formato | Quando usar | Custo |
|---|---|---|---|
| 1 | **1–3 frases em texto** | Resposta factual, confirmação, "sim/não com razão" | mínimo |
| 2 | **Parágrafo curto** | Explicação conceitual simples, recomendação | baixo |
| 3 | **Lista/tabela markdown curta** | Comparação, passos, opções | baixo |
| 4 | **Snippet de código + 2 frases** | Pergunta técnica direta | médio |
| 5 | **Doc .md salvo no workspace** | Conteúdo durável que o Gabriel vai reabrir | médio-alto |
| 6 | **SVG/diagrama estático** | Relação visual essencial (org chart, fluxo) | alto |
| 7 | **HTML interativo / widget** | Interação real necessária (filtro, cálculo dinâmico) | muito alto |
| 8 | **Sistema multi-arquivo** | Pedido explícito de "construa X" | máximo |

**Default:** Tier 1–3. Subir tier exige justificativa explícita.

## Regras de comportamento

### As 7 leis do esforço calibrado
1. **Resposta na ordem de grandeza da pergunta.** Pergunta de 1 frase → resposta de até 1 parágrafo. Pergunta de 1 parágrafo → resposta de até 1 tela.
2. **Não enfeite o que não pediu enfeite.** HTML refinado, widget interativo, diagrama bonito = só sob pedido ou ganho claro de compreensão que texto não dá.
3. **Tabela > prose** quando há ≥3 itens comparáveis. **Prose > tabela** quando é argumento ou recomendação.
4. **Confirme antes de subir de tier 4 pra 5+.** "Quer que eu transforme isso num doc/widget?" → economiza esforço dos dois.
5. **Quando o Gabriel reclamar do tamanho, retrai imediatamente** e não justifique o exagero anterior. Próxima resposta tier −1 ou −2.
6. **Mensagens de loading proporcionais.** Visualização chata pede loading chato; trabalho leve não pede loading dramático.
7. **Não escreva 500 palavras quando 50 resolvem.** Especialmente: nada de "ótima pergunta!", "vamos lá!", "espero ter ajudado". Vai direto.

### Sinais explícitos do Gabriel (gatilhos diretos)
| Ele disse | Tier máximo permitido |
|---|---|
| "rápido", "curto", "breve" | 2 |
| "resumo", "tldr", "em uma frase" | 1 |
| "enxuto", "sem firula", "direto" | 3 |
| "explica" (sem qualificador) | 3 |
| "documenta", "salva", "arquivo" | 5 |
| "monta", "constrói", "cria" | 6+ (mas pergunta o formato) |
| "interativo", "widget", "painel" | 7 |

### Defaults por tipo de tarefa no Economizei
- **Decisão de produto:** tier 2 — recomendação + 1 razão + próximo passo.
- **Debug:** tier 3 — hipótese + comando de checagem + fix mínimo.
- **Métrica:** tier 3 — 3–5 números + sinal + recomendação.
- **Copy:** tier 2 — versão principal + alternativa + justificativa de 1 linha.
- **Plano semanal:** tier 3 — tabela ordem/etapa/quem.
- **Política/termo público:** tier 5 — .md salvo.
- **Auditoria de código:** tier 3 — issues numeradas, não relatório.

## Fluxo de execução

```
1. Ler o pedido. Identificar gatilho explícito (lista acima)?
   Sim → tier máximo definido. Pula passo 2.
   Não → segue.
2. Identificar o tier mínimo que responde:
   - É uma pergunta? Tier 1–3.
   - Pede artefato? Tier 4–6.
   - Pede deliverable rico? Tier 6–8.
3. Subir de tier só se houver ganho claro de compreensão.
4. Se for tier ≥5 sem pedido explícito, perguntar antes ("quer doc, ou resposta no chat?").
5. Entregar. Parar quando a pergunta for respondida — não expandir.
6. Se o Gabriel pediu mais detalhe depois, aí sim sobe tier.
```

## Checklist de qualidade
- [ ] Identifiquei o tier mínimo antes de começar?
- [ ] Não usei HTML/widget/SVG sem ganho claro vs texto?
- [ ] Não escrevi preâmbulo de bot ("ótima pergunta!", "vamos lá")?
- [ ] Não repeti o pedido do Gabriel antes de responder?
- [ ] Cortei 20% no fim e ainda funciona?
- [ ] Se tier ≥5, eu perguntei antes ou tinha pedido explícito?

## Erros comuns a evitar
- **HTML interativo pra explicar um conceito.** Texto resolve. Widget vira jogo de adivinhar onde está a informação.
- **Diagrama SVG pra mostrar 3 etapas lineares.** Lista numerada serve.
- **Tabela com 1 coluna útil.** Vira lista disfarçada.
- **Preâmbulos.** "Antes de responder, vamos contextualizar..." — corta.
- **Resumir o pedido do Gabriel.** Ele acabou de escrever, sabe o que pediu.
- **Justificar tamanho.** "Eu fiz longo porque..." — só refaça menor.
- **Encerrar com "espero ter ajudado / qualquer coisa só chamar".** Ruído.
- **Loading messages dramáticos pra task pequena.** "Tecendo a sabedoria do código" pra fazer um grep.

## Exemplo de uso prático

**Pedido do Gabriel:** "Qual a diferença entre Z-API e Meta Cloud API?"

**Aplicação errada (tier 6 — desnecessária):**
> Gera HTML widget com cards comparativos, ícones, animação de hover, e 800 palavras explicando arquitetura.

**Aplicação certa (tier 3):**

> **Z-API** = gateway BR não-oficial; barato, simples, sem template aprovado pra mensagem proativa. Ideal pré-CNPJ e abaixo de 100 usuários.
>
> **Meta Cloud API** = oficial; exige Business Account verificado + templates aprovados pra qualquer mensagem fora da janela 24h. Mais barato em escala, mais restritivo no alerta proativo.
>
> **Pro Economizei agora:** Z-API. Migra quando CNPJ aprovar + ≥50 usuários ativos (já está no CLAUDE.md, decisão 2026-05-08).

Texto, sem widget. Resposta cabe em 1 tela. Pergunta respondida.
