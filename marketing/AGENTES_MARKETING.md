# 🤖 Agentes Autônomos — Marketing Economizei

> Cada agente roda no Cowork como **scheduled task**. Você só abre o app, lê o resumo, aprova ou edita.
> Os horários são em **timezone local** (do seu computador).

---

## 1. 🔥 Caçador de Tendências  *(piloto — vai ser criado agora)*

**Quando:** todo dia, 8h da manhã.
**Insumos:** nada — ele pesquisa do zero.
**Saída:** 5 ideias de hook prontas para virar vídeo, salvas em `C:\Economizei\marketing\tendencias\YYYY-MM-DD.md`.

**Por que ele importa:** o hook resolve 80% da viralização no TikTok. Ter 5 hooks frescos por dia = você nunca trava na hora de gravar.

---

## 2. ✍️ Roteirista

**Quando:** todo dia, 9h.
**Insumos:** o arquivo do dia gerado pelo Caçador.
**Saída:** 2 roteiros completos (gancho + corpo + CTA + sugestão de B-roll/voz off) em `C:\Economizei\marketing\roteiros\`.

**Truque:** o roteiro já vem com a marcação `[B-ROLL]` para você gerar via Veo 3.1 ou Sora 2 e `[VOZ-OFF]` para gerar no ElevenLabs.

---

## 3. 🎯 Prospector de Grupos & Influencers

**Quando:** segunda-feira, 8h.
**Insumos:** nada.
**Saída:** planilha CSV em `C:\Economizei\marketing\prospeccao\semana-NN.csv` com:
- 20 grupos novos no WhatsApp/Facebook (link, tema, nº membros estimado, abordagem sugerida)
- 10 nano-influencers (handle, nicho, seguidores, engajamento estimado, mensagem de pitch personalizada para barter)

**Truque:** ele guarda histórico para nunca repetir o mesmo grupo/perfil.

---

## 4. 📊 Analista de Métricas

**Quando:** sexta-feira, 18h.
**Insumos:** você cola/sobe os exports da semana (TikTok, Insta, dashboard do bot).
**Saída:** relatório de 1 página em `C:\Economizei\marketing\relatorios\YYYY-WW.md` com:
- Top 3 vídeos da semana e o que tinham em comum
- 3 ações concretas para a próxima semana
- Alerta vermelho se alguma métrica caiu > 20%

---

## 5. 💬 Community Sentry

**Quando:** todo dia, 19h.
**Insumos:** você cola comentários/DMs do dia (depois evolui para conector direto).
**Saída:** triage em `C:\Economizei\marketing\inbox\YYYY-MM-DD.md`:
- 🔴 Bug/reclamação grave (responder em até 1h)
- 💚 Lead quente (oferecer Premium)
- 💛 Dúvida (responder em 24h)
- 🩵 Elogio (printar + responder com gratidão)

---

## Como evoluir cada agente

Conforme você for usando, dá pra:

1. **Conectar APIs reais:** quando tiver tempo, pluga o conector do TikTok/Instagram (via MCP) e os agentes leem direto, sem você precisar exportar nada.
2. **Adicionar mais sazonalidade:** ex.: dia 30 do mês, ativar agente "Plano-de-Compras-do-Próximo-Mês".
3. **Trocar o LLM da geração de roteiros** se quiser experimentar diferentes vozes/estilos.

---

*Lembre-se: agente bom é agente que você desliga quando deixa de fazer sentido. Reveja o portfólio toda virada de mês.*
