# PROMPT — Limpeza Temporal do CLAUDE.md + Criação do CALENDARIO.md
> Versão: 1.0 | Modelo: Claude Opus | Última edição: 2026-06-02
> Reutilizável. Edite apenas seções marcadas com `<!-- EDITÁVEL -->`.

---

## COMO USAR ESTE PROMPT

Cole o conteúdo abaixo diretamente em uma conversa com Claude Opus.
O prompt está dividido em 3 partes executadas em ordem:

1. **PARTE 1** — Leitura e limpeza do `CLAUDE.md` (remove estimativas de tempo)
2. **PARTE 2** — Criação do `CALENDARIO.md` com metas diárias, semanais e mensais
3. **REGRAS GERAIS** — Comportamento esperado do modelo em ambas as partes

---

## PROMPT PARA COLAR NO CLAUDE OPUS

```
<papel>
Você é o assistente de memória institucional do projeto Economizei.
Seu trabalho é manter os arquivos do projeto precisos, limpos e úteis.
Você segue instruções na ordem em que aparecem e não pula etapas.
</papel>

<contexto_do_projeto>
Economizei é um bot de WhatsApp que analisa cupons fiscais via foto usando IA (Gemini 2.5).
Fundador: Gabriel. Operação solo. Estágio: pré-lançamento, em validação comercial.
Arquivos principais do projeto estão em C:\Economizei\
O arquivo de memória institucional é CLAUDE.md — lido no início de cada sessão.
</contexto_do_projeto>

<parte_1_limpeza_do_claude_md>

## OBJETIVO DA PARTE 1
Remover do CLAUDE.md todas as referências de tempo que são estimativas — ou seja, qualquer
menção que vincule uma tarefa, entrega ou decisão a um prazo estimado sem dados reais medidos.

## POR QUE FAZER ISSO
IA é ruim em calcular tempo estimado para tarefas sem histórico real.
Incluir estimativas não medidas no documento de memória cria falsas certezas e desorientação
nas próximas sessões. Prazos só devem entrar no CLAUDE.md depois de medidos em tentativas reais.

## PASSO A PASSO

### Passo 1.1 — Ler o arquivo
Leia o arquivo completo: C:\Economizei\CLAUDE.md

### Passo 1.2 — Identificar o que deve ser REMOVIDO
Remover qualquer texto que:
- Associe uma tarefa ou entrega a uma semana numerada (ex: "Semana 1", "Semana 2", "até a Semana 4")
- Associe uma tarefa ou entrega a um mês numerado (ex: "Mês 1", "Mês 2", "mês 4-6")
- Dê prazo estimado em dias ou semanas para uma tarefa futura (ex: "em 60 dias", "1-2 semanas após X")
- Use estrutura de roadmap baseada em tempo (ex: "Roadmap Tático 6 Semanas", "Fase 1 — Beta (mês 1–4)")
- Mencione "até [prazo]" referenciando uma tarefa não concluída

### Passo 1.3 — Identificar o que deve ser MANTIDO
Não remover:
- Datas históricas de decisões já tomadas (ex: "2026-05-08", "decidido em maio/2026") — são registros, não estimativas
- Gatilhos baseados em métricas (ex: "≥ 5 pagantes via PIX", "MAU ≥ 250", "W2 ≥ 30%") — esses são condicionais, não temporais
- Frequências de rotina já estabelecidas (ex: "1×/semana", "1×/mês") — descrevem cadência, não prazo
- Referências de tempo que descrevem o passado (ex: "durante os 60 primeiros dias recebem uma marca")

### Passo 1.4 — Substituições sugeridas
Quando remover uma estimativa de tempo, preserve a intenção com uma das fórmulas abaixo:
- "Semana X" ou "Mês X" como prazo → substituir por "quando pronto" ou remover o prazo completamente
- "até Semana X" → substituir por "assim que possível" ou omitir
- "Fase 1 — Beta (mês 1–4)" → substituir por "Fase 1 — Beta (fase atual)"
- "Manter Z-API durante as 6 semanas" → substituir por "Manter Z-API até atingir os gatilhos de migração"
- "Mês 1" em títulos de roadmap → substituir por marcos como "Pré-lançamento", "Validação inicial", "Monetização"
- "em 60 dias" atrelado a gatilho → manter apenas o gatilho, remover o prazo (ex: "≥ 5 pagantes via PIX" sem "em 60 dias")

### Passo 1.5 — Salvar o arquivo
Salve as alterações em C:\Economizei\CLAUDE.md
Não altere nenhum outro conteúdo além das referências temporais identificadas.
Informe ao final: quantas referências foram removidas ou ajustadas e em quais seções.

</parte_1_limpeza_do_claude_md>

<parte_2_criacao_do_calendario>

## OBJETIVO DA PARTE 2
Criar o arquivo C:\Economizei\CALENDARIO.md com as metas e rotinas do projeto Economizei,
organizadas em três frequências: diária, semanal e mensal.

## REGRAS DO ARQUIVO
- Nenhuma meta deve ter prazo estimado em dias, semanas ou meses numerados
- Metas são baseadas em frequência (diário, semanal, mensal) ou gatilho (quando X acontece)
- O arquivo deve ser fácil de editar: cada meta ocupa exatamente 1 linha com formato padronizado
- O arquivo deve ser fácil de acumular: novas metas são adicionadas dentro da seção correta sem reformatar o arquivo inteiro
- O arquivo deve ser fácil para IA ler: use tags de seção claras e formato de checklist simples

## ESTRUTURA DO ARQUIVO A CRIAR

### Cabeçalho
- Nome do arquivo, versão, data de criação
- Instrução breve de como usar e como adicionar novas metas

### Seção 1 — Metas Diárias
Coisas que devem ser feitas ou verificadas todo dia de trabalho no projeto.
Inclua as seguintes metas (e qualquer outra que faça sentido dado o CLAUDE.md):
- Verificar se o bot está respondendo (teste manual ou UptimeRobot)
- Registrar novos cadastros ou pagamentos PIX recebidos no dia
- Responder suporte informal no WhatsApp (se houver mensagem pendente)

### Seção 2 — Metas Semanais
Coisas que devem acontecer uma vez por semana.
Inclua:
- Revisar logs do Railway e Supabase
- Verificar custo do Gemini no Google Cloud Console
- Publicar 3 posts (TikTok / Reels) — 1 roteiro, 1 gravação, 1 edição/publicação
- Realizar 1 conversa qualitativa com usuário ativo (DM ou áudio)
- Anotar horas reais trabalhadas na semana (honestidade sobre saúde do time)
- Verificar métricas da semana: cadastros novos, cupons processados, W2

### Seção 3 — Metas Mensais
Coisas que devem acontecer uma vez por mês, sem data fixa.
Inclua:
- Somar todos os custos do período (Gemini, Z-API, Vercel, domínio, outros)
- Atualizar planilha de unit economics
- Revisar métricas-chave: MRR, pagantes PIX, DAU/MAU, retenção W2, cupons/usuário
- Verificar gatilho de automação do pagamento (≥ 5 pagantes → implementar Stripe/MP)
- Atualizar o CLAUDE.md com decisões e aprendizados do período
- Revisar e marcar checkpoints de progresso no CALENDARIO.md (seção 4)

### Seção 4 — Checkpoints de Progresso (por gatilho, não por data)
Lista de marcos do projeto que devem ser revisados quando atingidos.
Cada checkpoint tem: nome, gatilho de ativação, pergunta de decisão, ação esperada.
Inclua os seguintes checkpoints baseados no CLAUDE.md:

CHECKPOINT A — Primeiro pagante via PIX
  Gatilho: 1º pagamento PIX confirmado
  Pergunta: O fluxo manual de ativação funcionou? O usuário entendeu o processo?
  Ação: Documentar fricções encontradas no CLAUDE.md

CHECKPOINT B — Automação de pagamento
  Gatilho: ≥ 5 pagantes via PIX acumulados
  Pergunta: Vale implementar Stripe ou Mercado Pago agora?
  Ação: Avaliar custo de implementação vs. volume atual; decidir e registrar

CHECKPOINT C — Validação de hábito
  Gatilho: W2 ≥ 30% (30% dos usuários ativos mandaram cupom na semana 2)
  Pergunta: O produto cria hábito real? O motor de retenção funciona?
  Ação: Se sim → escalar distribuição. Se não → investigar onboarding antes de crescer

CHECKPOINT D — Primeiro freela de conteúdo
  Gatilho: W2 ≥ 30% confirmado por pelo menos 1 ciclo mensal
  Pergunta: O gargalo atual é conteúdo ou retenção?
  Ação: Se conteúdo for gargalo → contratar freela pontual (4 vídeos/mês)

CHECKPOINT E — Automação de CS
  Gatilho: MAU ≥ 250
  Pergunta: O tempo gasto em suporte está comprometendo produto ou distribuição?
  Ação: Avaliar freela de CS 5h/semana

CHECKPOINT F — Migração Z-API → Meta Cloud API
  Gatilho: CNPJ aprovado E ≥ 50 usuários ativos consistentes E templates de alerta estabilizados
  Pergunta: O custo e risco da migração são menores que o custo de manter Z-API nessa escala?
  Ação: Projeto pontual de migração

CHECKPOINT G — Régua de retorno
  Gatilho: MRR ≥ R$4.225/mês
  Pergunta: O projeto está rendendo o equivalente ao custo das horas investidas?
  Ação: Revisão estratégica completa — escalar, pivotar ou manter ritmo

### Seção 5 — Registro de Histórico do Calendário
<!-- EDITÁVEL — adicione entradas aqui conforme o projeto evolui -->
Seção para registrar quando checkpoints foram atingidos e o que foi decidido.
Formato: [DATA] — [CHECKPOINT] — [DECISÃO TOMADA]
Começa vazia. Exemplos de como preencher:
  [2026-06-15] — CHECKPOINT A — Primeiro pagante confirmado. Fluxo PIX funcionou sem fricção.
  [2026-07-10] — CHECKPOINT C — W2 = 34%. Hábito validado. Iniciando escala de conteúdo.

## SALVAR O ARQUIVO
Salve em: C:\Economizei\CALENDARIO.md
Informe ao final que o arquivo foi criado e liste as seções geradas.

</parte_2_criacao_do_calendario>

<regras_gerais>

1. Execute a PARTE 1 antes da PARTE 2. Não inverta a ordem.
2. Não altere o CLAUDE.md além do que está especificado na PARTE 1.
3. Não adicione estimativas de tempo ao CALENDARIO.md. Se sentir tentação de escrever
   "em X semanas" ou "até o mês Y", substitua por um gatilho baseado em métrica ou evento.
4. Mantenha o português brasileiro em todos os arquivos.
5. Ao final, faça um resumo com:
   - Quantas referências temporais foram removidas do CLAUDE.md e em quais seções
   - Confirmação de que o CALENDARIO.md foi criado com as 5 seções
   - Qualquer inconsistência encontrada que mereça atenção do Gabriel

</regras_gerais>
```

---

## COMO EDITAR ESTE PROMPT

<!-- EDITÁVEL — Adicione aqui novos checkpoints, metas ou instruções para versões futuras -->

### Adicionar nova meta diária/semanal/mensal
Localize a seção correspondente dentro do bloco `<parte_2_criacao_do_calendario>` e adicione
uma linha no formato:
```
- [Descrição da meta em uma linha]
```

### Adicionar novo checkpoint
Localize a Seção 4 dentro do bloco `<parte_2_criacao_do_calendario>` e adicione no formato:
```
CHECKPOINT [LETRA] — [Nome do marco]
  Gatilho: [condição mensurável]
  Pergunta: [o que decidir quando atingir]
  Ação: [o que fazer]
```

### Atualizar versão
Atualize o cabeçalho deste arquivo: `Versão: X.Y | Última edição: [DATA]`

---

## HISTÓRICO DE VERSÕES

| Versão | Data | O que mudou |
|--------|------|-------------|
| 1.0 | 2026-06-02 | Criação inicial — limpeza temporal + estrutura do CALENDARIO.md |
<!-- Adicione novas versões aqui -->
