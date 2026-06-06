---
name: economizei-automation-triage
description: Separa qualquer tarefa, processo ou caminho em "o que um robô/automação faz" e "o que só humano (Gabriel) faz". Use SEMPRE que o Gabriel pedir "aponte o caminho", "como faço isso", "qual o passo a passo"; também ao iniciar qualquer trabalho de criação/programação ou sessão de debug. Não use para pergunta de conhecimento puro ou conversa solta.
---

# 🤖↔️🧍 economizei-automation-triage

## Objetivo
Antes de executar qualquer caminho, dividir o trabalho em **o que pode rodar sozinho** (bot, script, Claude, cron, n8n) e **o que exige Gabriel humano** (decisão, taste, relacionamento, juízo legal). Isso protege a 1h/dia, evita o Gabriel ficar fazendo "tarefa de robô" e impede o Claude de tentar automatizar o que precisa de cabeça humana.

## Quando usar
- O Gabriel disse **"aponte o caminho"**, **"como faço"**, **"qual o passo a passo"**, **"me ajuda a fazer X"**.
- Início de qualquer **criação/feature de produto** (antes de programar).
- Início de qualquer **sessão de debug** (acoplar com `economizei-debugging`).
- Quando o Gabriel for executar um **processo recorrente** (resumo mensal, post de Reels, NPS).
- Quando um caminho parecer ter **mais de 3 passos**.

## Quando NÃO usar
- Pergunta de conhecimento puro ("o que é LGPD?").
- Conversa solta / brainstorm sem intenção de execução.
- Microtarefa óbvia (1 passo, 5 min).

## Entradas ideais
- A tarefa, processo ou objetivo descrito em 1–2 frases.
- Estado atual (o que já existe, o que falta).
- Tempo disponível na sessão (se relevante).

## Saídas esperadas
1. **Mapa de etapas** — lista numerada do caminho completo.
2. **Tabela de triagem** com colunas: Etapa · Quem faz · Por quê · Ferramenta · Tempo.
3. **Ordem de execução** sugerida (humano-bloqueador primeiro, automação depois).
4. **ROI de automação** rápido nas etapas marcadas como "automatizar".
5. **Próximo passo concreto** do Gabriel hoje, em ≤30 min.

## Regras de comportamento

### As 4 categorias de quem-faz
| Categoria | Quando se aplica | Exemplos no Economizei |
|---|---|---|
| 🤖 **Full auto** | Regras claras, repetível, baixo risco. | Parsear cupom · Salvar no Supabase · Mandar resumo mensal · Smoke test no CI |
| 🤝 **Auto faz, humano valida** | Auto produz, mas precisa olho antes de soltar. | Claude gera 3 hooks de Reels · Script propõe categorização nova · LLM resume cohort |
| 🛠️ **Humano faz, auto amplifica** | Decisão/taste é humana; automação reproduz/escala. | Escrever copy nova (Claude ajuda, Gabriel decide) · Definir framing de pricing |
| 🧍 **Só humano** | Decisão alta-stake, relacionamento, jurídico, taste final. | Aprovar política LGPD · Conversar com primeiros 30 usuários · Fechar CNPJ · Definir preço final · Aprovar copy que vai pro ar |

### Heurísticas de classificação (decisão em 10 segundos)
- Tem regra clara e desambiguada? → **🤖 auto**.
- Exige juízo, taste, ou relacionamento? → **🧍 humano**.
- Reversível se errar? → tende a auto.
- Toca legal / dinheiro / marca? → humano valida no mínimo (🤝 ou 🧍).
- Repete ≥5x por semana? → forte candidato a automatizar.
- Acontece <1x por mês? → automatizar não vale o setup.
- Único, irreversível, alta visibilidade? → 🧍.

### ROI de automação (para uma operação de 1h/dia)
> **Regra:** uma automação só vale a pena se *pagar o setup em ≤1 mês de uso real*.

Fórmula prática:
```
ganho_mensal = (tempo_por_ocorrência × ocorrências_por_mês) - tempo_setup
se ganho_mensal > 0 em <1 mês → automatizar agora
se ganho_mensal > 0 só em 2–3 meses → automatizar depois
se < 0 ou irrelevante → fica manual
```

Exemplo: resumo mensal de gasto leva ao bot 2 min/usuário; com 100 usuários, 200 min/mês. Setup do scheduler: 1h30. Paga em <1 mês → **automatizar agora** (Semana 4 do roadmap).

### Princípios não-negociáveis
1. **Humano-bloqueador primeiro.** Identifique o que SÓ o Gabriel pode fazer e bote no topo da ordem; senão a automação fica parada esperando aprovação.
2. **Não automatizar o que ainda não foi feito manualmente uma vez.** Você só sabe o que vale automatizar depois de ter feito à mão e visto onde dói.
3. **Toda automação tem um "kill switch".** Tem que dar pra desligar em 1 comando se quebrar.
4. **Automação sem observabilidade = bomba-relógio.** Se roda sozinho, precisa logar + alertar quando falhar.
5. **Gabriel valida o que vai pro usuário final na fase Beta.** Mesmo que Claude/bot gere, humano aprova até retenção W2 estabilizar.
6. **Conversa com usuário inicial é 🧍 sempre.** Os primeiros 30 usuários têm que sentir o Gabriel. Bot não substitui isso.

## Fluxo de execução

```
1. Receber o objetivo. Reformular em 1 frase.
2. Decompor em etapas atômicas (cada etapa = 1 ação verificável).
3. Para cada etapa, classificar nas 4 categorias.
4. Para etapas 🤖 e 🤝, propor a ferramenta concreta (cron, Claude, n8n, script Node).
5. Para etapas 🤝 e 🧍, escrever o "ponto de aprovação" do Gabriel.
6. Ordenar: humano-bloqueador → setup de auto → execução → verificação humana.
7. Calcular ROI rápido das automações sugeridas.
8. Apresentar tabela + ordem + próximo passo de ≤30 min.
```

## Checklist de qualidade
- [ ] Toda etapa tem uma das 4 marcações?
- [ ] Etapas 🤖 têm ferramenta concreta sugerida?
- [ ] Etapas 🧍 explicitam por que humano, não preguiça de automatizar?
- [ ] O humano-bloqueador está no topo da ordem?
- [ ] Calculei ROI básico das automações novas?
- [ ] O "próximo passo hoje" cabe em ≤30 min?
- [ ] Tem kill switch / observabilidade para o que vai virar automação?

## Erros comuns a evitar
- **Automatizar conversa com primeiros usuários.** Você perde sinal qualitativo e quebra o frame "feito por gente".
- **Querer automatizar antes da primeira execução manual.** Não sabe ainda onde dói, vai automatizar a coisa errada.
- **Triagem sem ordem.** Lista o que cada um faz, mas não diz "comece por aqui hoje".
- **Marcar 🤖 onde precisa de juízo.** Categorização nova de itens, escolha de hook viral, redação final do bot ao usuário — tudo pede 🤝 no mínimo.
- **Esquecer o ROI.** Automatiza um processo que acontece 1x por trimestre. Tempo perdido.
- **Não nomear ferramenta.** "Automatizar" sem dizer com o quê = ninguém executa.
- **Esconder uma decisão de produto dentro de uma "automação".** Decisão é humana (`product-principles`), automação executa.

## Templates prontos

### Tabela de triagem (formato padrão de saída)

| # | Etapa | Quem | Por quê | Ferramenta | Tempo |
|---|---|---|---|---|---|
| 1 | ... | 🧍 humano | Decisão de produto | — | 20min |
| 2 | ... | 🤝 auto+validação | Gera mas precisa olho | Claude + revisão | 10min |
| 3 | ... | 🤖 auto | Repetível, regra clara | Cron + Node script | 2min/ocorrência |
| 4 | ... | 🛠️ humano+auto | Taste do Gabriel, Claude amplifica | Claude como par | 30min |

### Ordem padrão de execução
1. 🧍 **Decisões bloqueadoras** (Gabriel desbloqueia o resto).
2. 🛠️ **Criação humana** com auxílio (copy, posicionamento).
3. 🤖 **Setup das automações** (uma vez).
4. 🤝 **Primeiras execuções com validação** (calibrar o auto).
5. 🤖 **Operação contínua** (cron rodando, Gabriel só observa métricas).
6. 🧍 **Revisão semanal** dos resultados.

### Snippets de automação úteis no stack do Economizei

```js
// Scheduler simples (node-cron) — resumo mensal automático
import cron from 'node-cron';
cron.schedule('0 9 1 * *', async () => {
  const usuarios = await getActiveUsers();
  for (const u of usuarios) {
    await enviarResumoMensal(u);
  }
}, { timezone: 'America/Sao_Paulo' });
```

```yaml
# GitHub Action — smoke test pós-deploy (auto faz, humano vê falha)
- name: Smoke
  run: curl -f https://economizei.com.br/health || exit 1
```

## Exemplo de uso prático

**Pedido do Gabriel:** "Aponte o caminho pra eu lançar o A/B de headline da landing na Semana 2."

**Aplicação da skill:**

> **Objetivo reformulado:** publicar landing com 2 variantes de headline, trackear conversão `visita → "oi" no WhatsApp`, decidir vencedora em ≤14 dias.
>
> **Mapa de etapas + triagem:**
>
> | # | Etapa | Quem | Por quê | Ferramenta | Tempo |
> |---|---|---|---|---|---|
> | 1 | Decidir headlines A e B finais | 🧍 humano | Taste + frame "esperto" só Gabriel valida | `economizei-copywriter` como par | 30min |
> | 2 | Decidir métrica primária + critério de vitória | 🧍 humano | Decisão de produto/experimentação | `economizei-experimentation` | 15min |
> | 3 | Comprar domínio + apontar DNS | 🧍 humano | Conta financeira no nome do Gabriel | Registro.br | 20min |
> | 4 | Gerar HTML/CSS da landing com 2 variantes | 🛠️ humano+auto | Estrutura: Claude gera; texto: Gabriel revisa | Claude (HTML) + Vercel | 1h |
> | 5 | Setup de atribuição (UTM A vs B, link WhatsApp único) | 🤖 auto | Regra clara, repetível | Bitly/Yourls + UTM padrão | 30min (setup único) |
> | 6 | Roteamento 50/50 entre A e B | 🤖 auto | Aleatorização determinística | JS no `<head>` da landing | 15min (setup único) |
> | 7 | Trackear cliques → WhatsApp + chegada do `oi` | 🤖 auto | Repetível por visita | Plausible/GA + tag no Supabase | 30min (setup único) |
> | 8 | Rodar 14 dias | 🤖 auto | Só esperar | — | passivo |
> | 9 | Calcular conversão por variante | 🤝 auto+validação | Claude gera, Gabriel olha | SQL no Supabase + `growth-analyst` | 20min |
> | 10 | Decidir vencedora | 🧍 humano | Decisão pré-comprometida vira execução humana | — | 10min |
> | 11 | Trocar landing pra vencedora + registrar no CLAUDE.md | 🛠️ humano+auto | Decisão registrada é decisão viva | `memory-system` | 15min |
>
> **Ordem hoje (próximos 30 min):**
> Etapa 1 + Etapa 2 → as duas são bloqueadoras de todo o resto. Sem headlines e critério, ninguém faz nada. Faça hoje, no Claude, com a skill `copywriter` gerando 3 opções e você escolhendo A e B.
>
> **ROI das automações sugeridas:**
> - Setup atribuição + roteamento + tracking: ~1h15 total único. Replicável pra todo experimento futuro de landing. Paga em 2 experimentos.
>
> **Kill switch:** A landing tem feature flag JS que força "só variante A" se algo quebrar. 1 linha pra alternar.
>
> **Linha pra CLAUDE.md (seção 8, ao fim):** `Exp A/B headline iniciado em [data]. Critério: [...]. Decisão em [data+14].`
