---
name: economizei-multi-agent-ops
description: Coordena múltiplos subagentes (Plan, Explore, general-purpose) para tarefas complexas do Economizei. Use quando uma tarefa exige paralelizar pesquisa, planejar antes de executar, ou auditar trabalho em múltiplos arquivos. Não use para tarefa simples (1 chamada direta) ou quando o Gabriel pediu rapidez.
---

# 🤝 economizei-multi-agent-ops

## Objetivo
Saber **quando** e **como** delegar trabalho a subagentes para entregar mais em menos tempo, sem queimar contexto da sessão principal. Para o Economizei, a regra é: o Claude principal é o "gerente" — pensa, decide, registra; os subagentes são "executores especializados" — buscam, planejam, ou geram em paralelo.

## Quando usar
- Tarefa exige ler 5+ arquivos pra entender o estado.
- Existem 2+ subtarefas independentes que dá pra rodar em paralelo.
- Tarefa exige plano detalhado antes de executar (refactor, migração).
- Verificação independente de uma análise/decisão (segunda opinião).
- Pesquisa aberta (não sei onde está, não sei se existe).

## Quando NÃO usar
- Tarefa óbvia em 1 arquivo → faz direto.
- O Gabriel quer resposta em <2min.
- Decisão de produto/copy/estratégia → não delega; o Claude principal pensa.
- Subagent não tem acesso ao contexto do CLAUDE.md → se a tarefa depende muito do contexto, não vale o briefing.

## Entradas ideais
- Tarefa decomposta mentalmente em 1–3 subtarefas com fronteiras claras.
- Para cada subtarefa: objetivo concreto, dado de saída esperado, limite de tempo.

## Saídas esperadas
1. **Decomposição** da tarefa em subtarefas paralelizáveis.
2. **Briefing por subagent** (auto-suficiente — agente não vê a conversa).
3. **Síntese** das respostas pelo Claude principal.
4. **Decisão acionável** baseada na síntese.

## Regras de comportamento

### Tipos de subagent e quando usar cada um

| Tipo | Bom pra | Mau pra |
|---|---|---|
| **Explore** | Achar arquivos, grep símbolos, "onde está X". Leitura focada. | Análise profunda, decisão. |
| **Plan** | Desenhar estratégia de implementação detalhada. | Executar o plano (só desenha). |
| **general-purpose** | Pesquisa aberta multi-arquivo, escrever código, executar tarefa. | Decisão de produto/estratégia. |

### Princípios de coordenação
1. **O principal é o gerente.** Subagent é executor. Decisão final volta pro principal.
2. **Briefing auto-suficiente.** Subagent não viu a conversa. Inclui contexto, objetivo, formato de retorno, limite de tempo.
3. **Paralelizar quando independente.** Se subtarefa B precisa do output de A, é serial, não paralelo.
4. **1 mensagem com vários `Task`s** quando paralelo (mesmo bloco de chamadas).
5. **Limite o output do subagent.** "Reporte em <200 palavras" evita inchar o contexto principal.
6. **Verificar trabalho do subagent.** Subagent reporta intenção, não realidade. Cheque arquivos/diffs.
7. **Não delegar entendimento.** "Com base na sua pesquisa, decida" → erro. Decisão volta pro principal.

### Heurísticas no contexto Economizei
- **Auditoria do código** (revisão da pasta `src/`) → `Explore` ou `general-purpose` paralelos por subpasta.
- **Plano de feature nova** (multi-arquivo) → `Plan` desenha, principal executa.
- **Segunda opinião em decisão de produto** → `general-purpose` com briefing "review independente, ignore contexto anterior".
- **Buscar arquivo de pesquisa antigo** → `Explore` simples.
- **Gerar 10 hooks de Reels** → `general-purpose` 1 só, não vale paralelo.

## Fluxo de execução

```
1. Avaliar: a tarefa rende mais delegada ou feita direto?
2. Se delegada: decompor em subtarefas.
3. Para cada subtarefa, escrever briefing (auto-suficiente).
4. Disparar tudo paralelizável em 1 mensagem.
5. Aguardar.
6. Sintetizar respostas no contexto principal.
7. Verificar pontos críticos (arquivos modificados, decisões).
8. Tomar a decisão final.
9. Reportar ao Gabriel com síntese + decisão + próximo passo.
```

## Checklist de qualidade
- [ ] A decomposição faz sentido (subtarefas independentes ou dependência clara)?
- [ ] Cada briefing é auto-suficiente?
- [ ] Defini limite de output ("reporte em ≤200 palavras")?
- [ ] Paralelizei o que dá em 1 mensagem?
- [ ] Verifiquei o trabalho (não confiei no relato cego)?
- [ ] A decisão final é minha (principal), não do subagent?

## Erros comuns a evitar
- **Delegar decisão de produto.** Subagent não tem contexto do CLAUDE.md, do Gabriel, da história. Decisão é do principal.
- **Briefing sem contexto.** "Faça a feature X" sem dizer onde, com que stack, com que constraints — subagent inventa.
- **Esperar subagent rodar pra disparar próximo.** Se independentes, dispara junto.
- **Confiar no relato do subagent sem ver arquivo.** Sempre verificar.
- **Subagent pra tarefa simples.** 1 leitura de arquivo não precisa de subagent.
- **5 subagents simultâneos.** Mais que 3 vira difícil de sintetizar.

## Templates de briefing

### Briefing pra Explore (busca de arquivo)
```
Subagent: Explore
Objetivo: Encontrar onde o parser do Gemini está no projeto Economizei.
Procure por: arquivos que importam Gemini SDK ou que tenham função `parseGeminiResponse` ou similar.
Caminho-raiz: C:\Economizei\src
Retorne: caminho do arquivo + linhas relevantes (máx 30 linhas).
```

### Briefing pra Plan (estratégia)
```
Subagent: Plan
Objetivo: Desenhar plano pra adicionar coluna `beta_fundador` (boolean) na tabela `usuarios` e marcar como `true` todo usuário criado de hoje em diante.
Contexto:
- Stack: Node 18, Supabase Postgres, src/supabase.js encapsula chamadas.
- Limite: implementação solo, ≤2h.
- Reversibilidade necessária (default = false).
Retorne: ordem de passos com arquivos a editar, comando SQL de migração, teste manual de validação. ≤300 palavras.
```

### Briefing pra general-purpose (segunda opinião)
```
Subagent: general-purpose
Objetivo: Revisão independente da decisão "manter Z-API por 6 semanas vs migrar Meta Cloud API agora".
Contexto: produto WhatsApp B2C, fundador solo, ~1h/dia, sem CNPJ ainda, alerta proativo é killer feature.
Não veja minha análise anterior — pense do zero.
Retorne em ≤250 palavras: recomendação, 3 razões principais, 1 risco que estou subestimando.
```

### Briefing pra auditoria de código
```
Subagent: general-purpose
Objetivo: Auditar src/gemini.js no projeto Economizei.
Foco da auditoria:
1. Tratamento de erro (parser retorna ok:false em vez de explodir?)
2. Logs (vazam dado sensível? CPF, telefone?)
3. Timeout do Gemini (existe? cai gracefully?)
Caminho: C:\Economizei\src\gemini.js
Retorne: lista numerada de problemas encontrados, cada um com linha + sugestão de fix em 1 frase. ≤300 palavras.
```

## Exemplo de uso prático

**Pedido:** "Quero auditar o estado atual de prontidão pra começar Meta Ads na Semana 5. Verifica privacidade, código e métricas em paralelo."

**Aplicação:**

> **Decomposição em 3 subtarefas independentes:**
> 1. Auditoria LGPD (`general-purpose`).
> 2. Auditoria do código de webhook (`Explore` + leitura).
> 3. Snapshot de métricas atuais (`general-purpose`).
>
> **Disparar em 1 mensagem (3 Tasks em paralelo):**
>
> **Task 1 (LGPD):**
> ```
> Objetivo: Verificar quais itens LGPD não estão prontos pra Meta Ads.
> Cheque se há: política publicada (link), termos publicados, email de DPO, mensagem de consentimento no bot (procure em src/index.js e src/formatter.js no Economizei Bot).
> Retorne lista enxuta do que falta. ≤200 palavras.
> ```
>
> **Task 2 (Webhook):**
> ```
> Objetivo: Auditar src/index.js + src/zapi.js do Economizei Bot.
> Foco: tem idempotência? Timeout do Gemini é tratado? Logs vazam CPF/phone?
> Retorne 3–5 issues numeradas com linha + fix em 1 frase. ≤300 palavras.
> ```
>
> **Task 3 (Métricas):**
> ```
> Objetivo: Listar quais campos no Supabase do Economizei permitiriam calcular retenção W2 e ativação 24h hoje.
> Tabelas conhecidas: usuarios (phone_number, compras_mes_atual, is_pro), compras, itens_compra.
> Diga: o que tem, o que falta, sugestão de migração mínima. ≤200 palavras.
> ```
>
> **Síntese (no principal, depois das 3 respostas):**
> Cruzar os 3 outputs com a checklist da `security-lgpd` e do `growth-analyst`. Produzir 1 lista final priorizada de "antes de ligar Meta Ads, faça isso". Registrar no CLAUDE.md.
>
> **Decisão final:** baseada na síntese, marcar quais itens entram na Semana 4 e quais bloqueiam o início da Semana 5.
