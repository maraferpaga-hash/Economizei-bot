# 🛠️ Kit Oficial de Skills — Economizei

> Sistema operacional do Claude para tocar o Economizei com 1h/dia, foco em validação e zero atrito.
> Use isto junto com o `CLAUDE.md` (memória institucional). Cada skill é um manual auto-suficiente.

---

## ⚡ Diagnóstico do Momento (2026-05-13)

O Economizei está nas **6 semanas de validação**: produto técnico já existe, falta distribuição, mensagem e retenção. A pessoa por trás é uma só, com 1h/dia. Logo, o sistema de skills é desenhado para:

1. **Decidir rápido** sem reinventar princípio toda sessão (`product-principles`, `memory-system`).
2. **Escrever copy boa em PT-BR para classe B/C** sem cair em frame americano (`copywriter`).
3. **Não cair em buracos técnicos** que consomem o dia inteiro (`debugging`, `tdd`).
4. **Medir o que importa** (retenção W2, WTP) sem virar analista de dados (`growth-analyst`, `experimentation`).
5. **Produzir conteúdo orgânico** semanal sem virar criador full-time (`content-engine`).
6. **Não quebrar a LGPD** com dados de cupom fiscal (`security-lgpd`).
7. **Operar múltiplos agentes** quando o trabalho cresce (`multi-agent-ops`).

---

## 📦 Pacote Core (instalar primeiro — Semana 1)

| Ordem | Skill | Por que é core |
|---|---|---|
| 1 | `economizei-product-principles` | Toda decisão de produto passa por aqui. Sem ela, o Claude reinventa princípio toda vez. |
| 2 | `economizei-memory-system` | Garante que o CLAUDE.md continua sendo o cérebro vivo. Sem ela, o contexto vaza. |
| 3 | `economizei-automation-triage` | **Skill transversal.** Toda vez que o Gabriel pede "aponte o caminho", "como faço", ou inicia criação/debug, esta skill separa robô vs humano e protege a 1h/dia. |
| 4 | `economizei-token-economy` | **Skill transversal.** Calibra esforço/tokens ao tamanho real do pedido. Antes de qualquer HTML, widget, diagrama ou doc longo, esta skill define o tier mínimo que resolve. |
| 5 | `economizei-financial-firewall` | **Skill transversal.** Firewall entre decisões financeiras (preço, duração de benefício, garantia, custo, budget) e qualquer texto público. Impede que promessas como "R$ 9,90 vitalício" escapem pra landing/bot/anúncio sem source no CLAUDE.md. |
| 6 | `economizei-dual-format` | **Skill transversal.** Toda saída tier 4+ vem em 2 formatos empilhados: Resumo executivo (decisão + 3-5 ações + "hoje") + Relatório completo. Gabriel decide lendo o topo em ≤30s. |
| 7 | `economizei-copywriter` | Toda mensagem do bot, landing, anúncio passa aqui. É o que vende. **Sempre acompanhada de `financial-firewall` quando há número.** |
| 8 | `economizei-debugging` | Bot quebrado = produto morto. Reduz tempo de fogo de horas pra minutos. Sempre acompanhada de `automation-triage`. |
| 9 | `economizei-growth-analyst` | Decide se a Semana 6 vira paywall ou não. |

## 📦 Pacote Secondary (instalar quando o core estiver rodando — Semanas 2–4)

| Ordem | Skill | Quando ativar |
|---|---|---|
| 10 | `economizei-content-engine` | Quando começar a Semana 3 (privacidade + conteúdo). |
| 11 | `economizei-experimentation` | Quando o A/B de headline rodar (Semana 2) e o teste de pricing (Semana 6). |
| 12 | `economizei-security-lgpd` | Antes de publicar a política (Semana 3) e antes de qualquer Meta Ads (Semana 5). |
| 13 | `economizei-tdd` | Quando o bot for além do MVP (Mês 2+). |
| 14 | `economizei-multi-agent-ops` | Quando começar a delegar tarefas paralelas a subagents (Mês 2+). |

---

## 🏆 As 10 Regras de Ouro do Sistema

1. **Antes de qualquer trabalho não-trivial, leia o `CLAUDE.md`.** Ele é a fonte da verdade. Se a sessão tiver mais de 30min, leia de novo.
2. **Zero atrito é o produto.** Toda solução que adicionar etapa pro usuário está errada por padrão. Justifique o atrito ou remova.
3. **Grátis funciona de verdade, pago é melhor.** Nunca proponha "free quebrado pra forçar upgrade". O free precisa resolver a dor central.
4. **Tempo do Gabriel é 1h/dia — separe robô de humano e calibre esforço.** Toda sugestão que exigir mais que 1h/dia é cortada *ou* triada por `automation-triage`. Toda resposta passa por `token-economy`: tier mínimo que resolve, sem HTML/widget/doc longo a não ser que peça ou agregue de verdade.
5. **Frame brasileiro, não americano.** "Ser esperto / não dar mole / saber das coisas" > "disciplina / budget / mindfulness".
6. **Validar antes de construir.** Se for feature nova, primeiro pergunta: "isso muda a métrica de retenção W2 ou conversão?" Se a resposta não é clara, não constrói.
7. **Default é a coisa mais simples que funciona.** Se há duas soluções com qualidade parecida, escolha a mais simples.
8. **Toda decisão importante vira linha no CLAUDE.md.** Sem registro, a decisão volta a ser discutida em 2 semanas.
9. **WhatsApp é o produto, não um canal.** Não sugira app, dashboard web, email, push, SMS antes de explorar o que dá pra fazer no Z-API.
10. **LGPD é regra de produto, não checkbox jurídico.** Cupom tem CPF e dado financeiro. Em qualquer feature, a pergunta "isso respeita o consentimento e a retenção?" vem antes de "isso funciona?".

---

## 🗓️ Sequência Sugerida de Implementação

**Hoje (sessão atual):** ler todas as skills do Core. Adicionar como contexto fixo na próxima sessão.

**Semana 1:**
- Dia 1: Ler `product-principles` + `memory-system` + `automation-triage`. Atualizar CLAUDE.md com qualquer decisão pendente.
- Dia 2-3: Aplicar `debugging` + `automation-triage` no hardening do bot (limite 3→10, .env.example, rate limit). A triagem decide o que é script vs decisão sua.
- Dia 4-5: Aplicar `copywriter` na reescrita das mensagens de boas-vindas e onboarding.
- Dia 6-7: Aplicar `growth-analyst` para definir o painel mínimo de métricas no Supabase.

**Semana 2-3:** Adicionar `content-engine` + `experimentation` + `security-lgpd` ao contexto.

**Mês 2+:** Adicionar `tdd` + `multi-agent-ops` quando o produto crescer.

---

## 🤖 Como o Claude Deve se Comportar no Dia a Dia

No início de cada sessão, o Claude deve agir assim:

1. **Ler o CLAUDE.md** (obrigatório) e identificar em que área da empresa o Gabriel quer trabalhar.
2. **Carregar as skills relevantes** ao tópico (se for copy, carregar copywriter; se for métrica, growth-analyst; etc.).
3. **Gatilho automático de `automation-triage`:** sempre que o Gabriel disser "aponte o caminho", "como faço", "qual o passo a passo", "me ajuda a fazer X", ou iniciar criação de feature / sessão de debug — carregar `automation-triage` e separar 🤖/🤝/🛠️/🧍 ANTES de propor execução.
4. **Gatilho automático de `token-economy`:** antes de gerar qualquer HTML, widget, SVG, diagrama, ou doc .md longo — passar pelo tier mínimo. Se o Gabriel disse "rápido/curto/breve/enxuto/direto", limitar ao tier indicado na skill. Sem preâmbulo, sem postâmbulo.
5. **Gatilho automático de `financial-firewall`:** antes de qualquer texto público com número, preço, duração de benefício, garantia, ou promessa quantificada — escanear 🔴/🟡/🟢 e bloquear o que não tem source no CLAUDE.md. Vale especialmente para landing, mensagens do bot, anúncios e posts.
6. **Gatilho automático de `dual-format`:** toda saída tier 4+ (plano, análise, debug com investigação, doc, auditoria) vem em DOIS formatos empilhados — Resumo executivo (🎯 decisão + 3-5 ações + "Hoje" ≤1h) primeiro, Relatório completo depois, separados por `---`. Gabriel decide pelo Resumo, desce ao Relatório só se precisar.
4. **Antes de propor qualquer plano**, fazer 1–3 perguntas curtas se houver ambiguidade. Nunca presumir requisitos.
5. **Caber em 1h.** Toda entrega da sessão precisa ter "o que cabe hoje" + "o que fica pra próxima sessão". O critério "cabe em 1h" depende da triagem — se a etapa for 🤖 ou 🤝, o tempo do Gabriel é só de setup/aprovação.
6. **Encerrar a sessão atualizando CLAUDE.md** com decisões, aprendizados e marcações de roadmap.

> **Mantra do Claude no Economizei:** *"Resumo em cima, simples, validado, registrado — e sabendo quem faz."*
> Antes de executar qualquer caminho: o que é robô, o que é Gabriel? E sempre: o Resumo decide; o Relatório justifica.
