# 🏛️ Os Pilares do Economizei

**Data:** 2026-06-30
**Por que existe:** o negócio tem partes que **rodam em background** com naturezas diferentes — a máquina que *constrói* o produto, o produto que *roda*, e (no futuro) o marketing que *gasta dinheiro pra trazer gente*. Misturar as três numa cabeça só leva a erro: a regra que protege o código não é a regra que governa o orçamento de anúncios. Este documento separa em **pilares**, com fronteira clara e o **firewall financeiro como tecido conectivo**.

> **Hoje: 2 pilares. No futuro: 3.**
> 1. **Máquina de Programação** (constrói) · 2. **Código / Produto** (roda) · 3. *(futuro)* **Marketing & Anúncios** (adquire).

---

## 🧱 Pilar 1 — Máquina de Programação *(constrói o produto)*

A meta-camada que produz código sozinha, conforme a sua direção. **Gasta tempo/compute, nunca dinheiro de verdade.**

| | |
|---|---|
| **O que é** | A fila (`AGENDA.md`), o executor local (`/tarefa`), o firewall (`scripts/check-firewall.mjs`), a rotina Cowork das 10h, o `RELATORIO_MATINAL.md`. |
| **Roda em background?** | Sim — gera trabalho enquanto você não está olhando. |
| **Quem decide** | Planejamento: **Opus 4.8 + você** (*o quê* construir). Execução: **Sonnet/local** (*como*) — nunca decide produto/preço. |
| **Métrica de saúde** | Tarefas commitadas/semana · dias desde o último commit · % de runs verdes · rodadas acumuladas sem revisão (meta 0–1). |
| **Risco principal** | **Acumular trabalho não revisado** (foi o que aconteceu: 4 dias empilhados). Mitigação: o Sistema de Checkpoints, Lado A. |
| **Checkpoint** | Lado A do `Sistema_Checkpoints_Benchmarks_2026-06-30.md`. |

---

## 🛒 Pilar 2 — Código / Produto *(o bot que roda)*

O bot de WhatsApp em produção, atendendo usuários. **Gasta tempo + custo de infra (Gemini/Z-API), nunca move dinheiro de cliente sozinho.**

| | |
|---|---|
| **O que é** | O bot em produção: features, testes, deploy, custo Gemini/Z-API, uptime, a leitura/classificação de cupom. |
| **Roda em background?** | Sim — atende 24/7. |
| **Quem decide** | **Você** (produto, UX, pricing, ICP, promessa de feature). |
| **Métrica de saúde** | Suíte verde **+ corpus de classificação verde** · uptime `/health` · custo Gemini/mês · cupons processados ÷ enviados · outputs coerentes (sem número inventado). |
| **Risco principal** | **Classificação errada** — o *coração*. Se o item é lido/nomeado/categorizado errado, todo "andar de cima" mente (gasto, inflação, comparativo, alerta). Mitigação: `temperature:0`, corpus de regressão, reconciliação item×total. |
| **Checkpoint** | Lado B do `Sistema_Checkpoints_Benchmarks_2026-06-30.md`. |

---

## 🔥 A fronteira entre 1 e 2 — o Firewall Financeiro *(o tecido conectivo)*

O que conecta e ao mesmo tempo separa os dois pilares: **a Máquina (Pilar 1) pode mexer no Código (Pilar 2), mas NUNCA no dinheiro.**

- **Trava enforçável**, não só instrução: `check-firewall.mjs` reprova qualquer diff que toque a zona proibida — pagamento, `is_pro`, assinatura, `supabase/` (schema/migrations), `.env*`, `package.json`, o próprio firewall.
- Tudo que é financeiro **sai da máquina** e vira **"Ação do Gabriel"** (humano): migrations, gate Pro, webhook de pagamento, pricing.
- É por isso que as 5 tarefas das últimas rodadas são seguras de commitar: nenhuma toca dinheiro (firewall verde).

> O firewall é a razão de a automação de código ser **aceitável**. Sem ele, máquina mexendo em `src/` de madrugada seria risco alto demais. Com ele + testes + sua revisão, o dinheiro nunca passa silenciosamente.

---

## 📣 Pilar 3 — Marketing & Anúncios *(futuro — adquire usuários)*

O que trará gente nova: Meta Ads (clique-pro-WhatsApp), landing/SEO, Hotmart, afiliados. **É estruturalmente diferente dos outros dois: gasta DINHEIRO REAL.** Por isso é um pilar à parte, governado por finanças — exatamente como você apontou.

| | |
|---|---|
| **O que é** | Aquisição: Meta CTWA, landing/SEO, Hotmart (anuais), programa de afiliados. |
| **Roda em background?** | Parcialmente (campanhas rodando), **mas com supervisão financeira forte** — diferente de "deixar rodar". |
| **Quem decide** | **Você**, sob régua financeira (orçamento-teto, custo por ativação). |
| **Métrica de saúde** | **Custo por ativação (1º cupom)** · retenção **W2** · CAC · ROAS (só quando houver pagantes). |
| **Risco principal** | **Queimar caixa antes da retenção provar** — escalar aquisição num balde furado. Mitigação: só escalar após **W2 ≥ 30%** no cohort de Fernandópolis. |
| **Guarda-rail próprio** | O firewall do Pilar 1 protege o *código* do dinheiro. O Pilar 3 é onde o dinheiro **sai** → precisa do seu próprio teto: orçamento fixo pra *aprender* o canal (~R$200), e escala só com retenção validada. |
| **Bloqueado por** | Os 5 bloqueadores jurídicos/financeiros (empresa BC → Wise → Meta BM → Hotmart → conta BR). Ver `AGENDA.md` › "Ações do Gabriel". |

**Por que vem depois:** os Pilares 1 e 2 só consomem tempo e compute — erram "de graça" (reverte commit, conserta bug). O Pilar 3 erra **gastando caixa**. Ativá-lo antes de o produto reter é empurrar água em balde furado. Sequência: validar W2 (Pilar 2) → abrir os bloqueadores → ligar o Pilar 3.

---

## 🗺️ Visão geral

```
                         VOCÊ (direção · decisões · dinheiro)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
   PILAR 1                       PILAR 2                      PILAR 3 (futuro)
   Máquina de Programação        Código / Produto             Marketing & Anúncios
   "constrói"                    "roda"                        "adquire"
   gasta tempo/compute           gasta infra (Gemini)          gasta DINHEIRO REAL
         │                            │                            │
         └────── FIREWALL ───────────┘                     régua financeira
              financeiro (trava)                        (W2 ≥ 30% · custo/ativação)
        a máquina mexe no código,                     escala só com retenção provada
            nunca no dinheiro
```

**A regra que amarra tudo:** dinheiro nunca é tocado por automação. No Pilar 1, o firewall barra a máquina. No Pilar 3, a régua financeira barra o gasto sem retenção. Você é o único ponto por onde o dinheiro passa — de propósito.

---

## 🎯 Como usar esta divisão

- **Ao planejar uma tarefa:** pergunte "isso é Pilar 1, 2 ou 3?". Pilar 1/2 não-financeiro → pode ir pra fila da máquina. Qualquer coisa que toque dinheiro → "Ação do Gabriel".
- **Ao revisar saúde:** rode o checkpoint com os dois lados (Pilar 1 = Lado A, Pilar 2 = Lado B). Quando o Pilar 3 existir, ele entra com suas próprias métricas (custo/ativação, W2, ROAS).
- **Ao decidir prioridade:** Pilar 2 (produto que retém) vem antes do Pilar 3 (gastar pra trazer gente). Sempre.
