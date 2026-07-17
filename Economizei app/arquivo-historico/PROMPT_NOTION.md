# PROMPT — Configurar Notion do Economizei

> **Para usar:** Cole este prompt inteiro numa sessão com Claude Opus que tenha o Notion MCP conectado.
> O Opus deve executar tudo em sequência, passo a passo, confirmando cada etapa antes de avançar.

---

## Contexto

Você é um agente configurando o espaço de trabalho no Notion para o projeto **Economizei** — um bot de WhatsApp de análise de cupons fiscais. O operador é uma única pessoa (Gabriel). O objetivo é criar uma estrutura visual e funcional que replique o conteúdo do `CALENDARIO.md`, com checklists recorrentes e checkpoints por gatilho de métrica.

---

## Regras obrigatórias antes de começar

1. **Execute uma ferramenta por vez.** Espere a resposta antes de chamar a próxima.
2. **Antes de criar qualquer coisa**, use `notion-search` com query `"Economizei"` para verificar se já existe alguma página ou database com esse nome. Se existir, liste o que encontrou e pergunte se deve sobrescrever ou usar como base.
3. **Registre o `id` de cada página/database criado** — você vai precisar deles como `parent` nas próximas chamadas.
4. **Se uma chamada falhar**, relate o erro exato e tente a alternativa mais simples (ex: criar a página sem ícone se o ícone falhar).
5. **Não invente IDs.** Nunca use um ID que não tenha recebido como resposta de uma chamada anterior.
6. **Ao final**, liste tudo que foi criado com os respectivos IDs e URLs.

---

## Estrutura a criar (em ordem)

### PASSO 1 — Página raiz

Crie uma página no topo do workspace (sem parent, ou na raiz do workspace) com:
- **Título:** `🤖 Economizei OS`
- **Ícone:** emoji `🤖`
- **Conteúdo do corpo:** bloco de parágrafo com o texto: `Central operacional do projeto Economizei. Contém rotinas, checkpoints e histórico de progresso.`

Guarde o `id` desta página. Chame-a de `PAGE_ROOT`.

---

### PASSO 2 — Database "Rotinas"

Dentro de `PAGE_ROOT`, crie um **database inline** com:
- **Título:** `✅ Rotinas`
- **Propriedades** (crie exatamente estas, nesta ordem):

| Nome da propriedade | Tipo | Opções (se select) |
|---|---|---|
| `Nome` | title | — |
| `Frequência` | select | `Diária`, `Semanal`, `Mensal` |
| `Área` | select | `Produto`, `Distribuição`, `Caixa`, `Estratégia` |
| `Status` | checkbox | — |
| `Notas` | rich_text | — |

Guarde o `id` deste database. Chame-o de `DB_ROTINAS`.

---

### PASSO 3 — Populando "Rotinas" com as metas diárias

Crie **4 páginas** dentro de `DB_ROTINAS`, uma por chamada, com estas propriedades:

**Item 1:**
- Nome: `Verificar se o bot está respondendo`
- Frequência: `Diária`
- Área: `Produto`
- Status: `false`

**Item 2:**
- Nome: `Registrar novos cadastros e pagamentos PIX`
- Frequência: `Diária`
- Área: `Caixa`
- Status: `false`

**Item 3:**
- Nome: `Responder suporte informal no WhatsApp`
- Frequência: `Diária`
- Área: `Produto`
- Status: `false`

**Item 4:**
- Nome: `Anotar feedback ou fricção relatada por usuário`
- Frequência: `Diária`
- Área: `Produto`
- Status: `false`

---

### PASSO 4 — Populando "Rotinas" com as metas semanais

Crie **8 páginas** dentro de `DB_ROTINAS`:

**Item 5:**
- Nome: `Revisar logs do Railway e do Supabase`
- Frequência: `Semanal`
- Área: `Produto`
- Status: `false`

**Item 6:**
- Nome: `Verificar custo do Gemini no Google Cloud Console`
- Frequência: `Semanal`
- Área: `Caixa`
- Status: `false`

**Item 7:**
- Nome: `Conferir uptime do /health na semana`
- Frequência: `Semanal`
- Área: `Produto`
- Status: `false`

**Item 8:**
- Nome: `Publicar 3 posts (TikTok / Reels)`
- Frequência: `Semanal`
- Área: `Distribuição`
- Status: `false`

**Item 9:**
- Nome: `Realizar 1 conversa qualitativa com usuário ativo`
- Frequência: `Semanal`
- Área: `Distribuição`
- Status: `false`

**Item 10:**
- Nome: `Anotar horas reais trabalhadas na semana`
- Frequência: `Semanal`
- Área: `Estratégia`
- Status: `false`

**Item 11:**
- Nome: `Verificar métricas da semana: cadastros, cupons, retenção W2`
- Frequência: `Semanal`
- Área: `Estratégia`
- Status: `false`

**Item 12:**
- Nome: `Olhar analytics da landing (cadastros / origem)`
- Frequência: `Semanal`
- Área: `Distribuição`
- Status: `false`

---

### PASSO 5 — Populando "Rotinas" com as metas mensais

Crie **8 páginas** dentro de `DB_ROTINAS`:

**Item 13:**
- Nome: `Somar todos os custos do período`
- Frequência: `Mensal`
- Área: `Caixa`
- Status: `false`

**Item 14:**
- Nome: `Atualizar planilha de unit economics`
- Frequência: `Mensal`
- Área: `Caixa`
- Status: `false`

**Item 15:**
- Nome: `Revisar métricas-chave: MRR, pagantes, DAU/MAU, W2`
- Frequência: `Mensal`
- Área: `Estratégia`
- Status: `false`

**Item 16:**
- Nome: `Conferir churn e conversão Free → Pro`
- Frequência: `Mensal`
- Área: `Estratégia`
- Status: `false`

**Item 17:**
- Nome: `Verificar gatilho de automação de pagamento (≥ 5 pagantes PIX)`
- Frequência: `Mensal`
- Área: `Caixa`
- Status: `false`

**Item 18:**
- Nome: `Atualizar CLAUDE.md com decisões e aprendizados`
- Frequência: `Mensal`
- Área: `Estratégia`
- Status: `false`

**Item 19:**
- Nome: `Revisar checkpoints de progresso atingidos`
- Frequência: `Mensal`
- Área: `Estratégia`
- Status: `false`

**Item 20:**
- Nome: `Revisar sinais de saúde do time`
- Frequência: `Mensal`
- Área: `Estratégia`
- Status: `false`

---

### PASSO 6 — Database "Checkpoints"

Dentro de `PAGE_ROOT`, crie um **database inline** com:
- **Título:** `🚩 Checkpoints de Progresso`
- **Propriedades:**

| Nome | Tipo | Opções |
|---|---|---|
| `Nome` | title | — |
| `Gatilho` | rich_text | — |
| `Status` | select | `⏳ Aguardando`, `🔍 Em revisão`, `✅ Atingido` |
| `Pergunta de revisão` | rich_text | — |
| `Ação` | rich_text | — |
| `Data de ativação` | date | — |

Guarde o `id`. Chame-o de `DB_CHECKPOINTS`.

---

### PASSO 7 — Populando "Checkpoints"

Crie **7 páginas** dentro de `DB_CHECKPOINTS`, uma por chamada:

**Checkpoint A:**
- Nome: `A — Primeiro pagante via PIX`
- Gatilho: `1º pagamento PIX confirmado`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O fluxo manual de ativação funcionou? O usuário entendeu o processo?`
- Ação: `Documentar as fricções encontradas no CLAUDE.md`

**Checkpoint B:**
- Nome: `B — Automação de pagamento`
- Gatilho: `≥ 5 pagantes via PIX acumulados`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `Vale implementar Stripe ou Mercado Pago agora?`
- Ação: `Avaliar custo de implementação vs. volume atual; decidir e registrar`

**Checkpoint C:**
- Nome: `C — Validação de hábito`
- Gatilho: `W2 ≥ 30% (30% dos usuários mandaram cupom na semana 2)`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O produto cria hábito real? O motor de retenção funciona?`
- Ação: `Se sim → escalar distribuição. Se não → investigar onboarding antes de crescer`

**Checkpoint D:**
- Nome: `D — Primeiro freela de conteúdo`
- Gatilho: `W2 ≥ 30% confirmado por pelo menos 1 ciclo mensal`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O gargalo atual é conteúdo ou retenção?`
- Ação: `Se conteúdo for o gargalo → contratar freela pontual (4 vídeos/mês)`

**Checkpoint E:**
- Nome: `E — Automação de CS`
- Gatilho: `MAU ≥ 250`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O tempo gasto em suporte está comprometendo produto ou distribuição?`
- Ação: `Avaliar freela de CS de 5h/semana`

**Checkpoint F:**
- Nome: `F — Migração Z-API → Meta Cloud API`
- Gatilho: `CNPJ aprovado E ≥ 50 usuários ativos consistentes E templates de alerta estabilizados`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O custo e risco da migração são menores que o custo de manter o Z-API nessa escala?`
- Ação: `Tocar o projeto pontual de migração`

**Checkpoint G:**
- Nome: `G — Régua de retorno`
- Gatilho: `MRR ≥ R$4.225/mês`
- Status: `⏳ Aguardando`
- Pergunta de revisão: `O projeto está rendendo o equivalente ao custo das horas investidas?`
- Ação: `Revisão estratégica completa — escalar, pivotar ou manter o ritmo`

---

### PASSO 8 — Database "Histórico"

Dentro de `PAGE_ROOT`, crie um **database inline** com:
- **Título:** `🧾 Histórico de Marcos`
- **Propriedades:**

| Nome | Tipo |
|---|---|
| `Descrição` | title |
| `Checkpoint` | select com opções: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `Outro` |
| `Data` | date |
| `Decisão tomada` | rich_text |

Este database começa **vazio** — não crie nenhuma entrada. É preenchido conforme marcos são atingidos.

---

### PASSO 9 — Verificação final

Ao concluir todos os passos, responda com uma tabela no seguinte formato:

| Item criado | ID do Notion | URL (se disponível) |
|---|---|---|
| Página raiz `🤖 Economizei OS` | ... | ... |
| Database `✅ Rotinas` | ... | ... |
| Database `🚩 Checkpoints de Progresso` | ... | ... |
| Database `🧾 Histórico de Marcos` | ... | ... |

E confirme: **quantas páginas foram criadas no total** dentro dos databases (deve ser 20 rotinas + 7 checkpoints + 0 histórico = 27 páginas).

Se algum passo falhou, liste o erro exato e o que foi feito no lugar.
