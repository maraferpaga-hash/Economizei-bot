# 📆 CALENDARIO — Economizei

> **Arquivo:** `CALENDARIO.md`
> **Versão:** 1.0
> **Criado em:** 2026-06-02
> **Função:** calendário operacional do projeto — metas por frequência (diária, semanal, mensal) e
> checkpoints de progresso por gatilho. É o **complemento operacional** do `CLAUDE.md` (a memória
> estratégica), não substitui ele.

## Como usar
- **Marque** cada meta com `[x]` quando concluída no ciclo (e desmarque no ciclo seguinte, se for recorrente).
- **Frequência manda, não data.** Metas são diárias, semanais ou mensais — nunca presas a uma data fixa.
- **Checkpoints são por gatilho**, não por prazo: só são revisados quando o gatilho de métrica/evento é atingido.

## Como adicionar novas metas
- Adicione **1 linha por meta**, dentro da seção correta, no formato `- [ ] descrição da meta`.
- **Não** adicione estimativas de tempo ("em X semanas", "até o mês Y"). Se precisar condicionar algo,
  use um **gatilho de métrica ou evento** (ex: "quando ≥ 5 pagantes", "quando o cupom não lê").
- Para registrar um marco atingido, use a **Seção 5** no formato `[DATA] — [CHECKPOINT] — [DECISÃO]`.

---

## Seção 1 — 🌅 Metas Diárias
*Fazer ou verificar todo dia de trabalho no projeto.*

- [ ] Verificar se o bot está respondendo (teste manual rápido ou conferir status do UptimeRobot)
- [ ] Registrar novos cadastros e pagamentos PIX recebidos no dia
- [ ] Responder suporte informal no WhatsApp, se houver mensagem pendente
- [ ] Anotar qualquer feedback ou fricção relatada por usuário no dia

---

## Seção 2 — 🗓️ Metas Semanais
*Acontecem uma vez por semana.*

- [ ] Revisar logs do Railway e do Supabase
- [ ] Verificar o custo do Gemini no Google Cloud Console
- [ ] Conferir uptime do `/health` na semana
- [ ] Publicar 3 posts (TikTok / Reels) — produzir 1 roteiro, fazer 1 gravação, fazer 1 edição/publicação
- [ ] Realizar 1 conversa qualitativa com usuário ativo (DM ou áudio)
- [ ] Anotar as horas reais trabalhadas na semana (honestidade sobre a saúde do time)
- [ ] Verificar métricas da semana: cadastros novos, cupons processados, retenção W2
- [ ] Olhar o analytics da landing (cadastros / origem)

---

## Seção 3 — 📅 Metas Mensais
*Acontecem uma vez por mês, sem data fixa.*

- [ ] Somar todos os custos do período (Gemini, Z-API, Vercel, domínio, outras ferramentas pagas)
- [ ] Atualizar a planilha de unit economics
- [ ] Revisar métricas-chave: MRR, pagantes PIX, DAU/MAU, retenção W2, cupons por usuário ativo
- [ ] Conferir churn de pagantes e conversão Free → Pro
- [ ] Verificar o gatilho de automação de pagamento (≥ 5 pagantes via PIX → avaliar Stripe/MP)
- [ ] Atualizar o `CLAUDE.md` com decisões e aprendizados do período
- [ ] Revisar e marcar os checkpoints de progresso atingidos (Seção 4) e registrar na Seção 5
- [ ] Revisar os sinais de saúde do time (seção 6.6 do `CLAUDE.md`)

---

## Seção 4 — 🚩 Checkpoints de Progresso (por gatilho, não por data)
*Cada checkpoint só é revisado quando seu gatilho é atingido. Ao revisar, registre o resultado na Seção 5.*

### CHECKPOINT A — Primeiro pagante via PIX
- **Gatilho:** 1º pagamento PIX confirmado
- **Pergunta:** O fluxo manual de ativação funcionou? O usuário entendeu o processo?
- **Ação:** Documentar as fricções encontradas no `CLAUDE.md`

### CHECKPOINT B — Automação de pagamento
- **Gatilho:** ≥ 5 pagantes via PIX acumulados
- **Pergunta:** Vale implementar Stripe ou Mercado Pago agora?
- **Ação:** Avaliar custo de implementação vs. volume atual; decidir e registrar

### CHECKPOINT C — Validação de hábito
- **Gatilho:** W2 ≥ 30% (30% dos usuários ativos mandaram cupom na semana 2)
- **Pergunta:** O produto cria hábito real? O motor de retenção funciona?
- **Ação:** Se sim → escalar distribuição. Se não → investigar onboarding antes de crescer

### CHECKPOINT D — Primeiro freela de conteúdo
- **Gatilho:** W2 ≥ 30% confirmado por pelo menos 1 ciclo mensal
- **Pergunta:** O gargalo atual é conteúdo ou retenção?
- **Ação:** Se conteúdo for o gargalo → contratar freela pontual (4 vídeos/mês)

### CHECKPOINT E — Automação de CS
- **Gatilho:** MAU ≥ 250
- **Pergunta:** O tempo gasto em suporte está comprometendo produto ou distribuição?
- **Ação:** Avaliar freela de CS de 5h/semana

### CHECKPOINT F — Migração Z-API → Meta Cloud API
- **Gatilho:** CNPJ aprovado **E** ≥ 50 usuários ativos consistentes **E** templates de alerta estabilizados
- **Pergunta:** O custo e o risco da migração são menores que o custo de manter o Z-API nessa escala?
- **Ação:** Tocar o projeto pontual de migração

### CHECKPOINT G — Régua de retorno
- **Gatilho:** MRR ≥ R$4.225/mês
- **Pergunta:** O projeto está rendendo o equivalente ao custo das horas investidas?
- **Ação:** Revisão estratégica completa — escalar, pivotar ou manter o ritmo

---

## Seção 5 — 🧾 Registro de Histórico do Calendário
<!-- EDITÁVEL — adicione entradas aqui conforme o projeto evolui -->
*Registre quando cada checkpoint foi atingido e o que foi decidido.*
*Formato:* `[DATA] — [CHECKPOINT] — [DECISÃO TOMADA]`

<!-- Exemplos de como preencher (apague quando inserir entradas reais):
  [2026-06-15] — CHECKPOINT A — Primeiro pagante confirmado. Fluxo PIX funcionou sem fricção.
  [2026-07-10] — CHECKPOINT C — W2 = 34%. Hábito validado. Iniciando escala de conteúdo.
-->

_(vazio — aguardando o primeiro marco)_
