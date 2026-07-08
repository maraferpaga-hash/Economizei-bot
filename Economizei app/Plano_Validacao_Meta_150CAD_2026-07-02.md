# 🧪 Plano de Validação Paga — Meta CTWA · $150 CAD (≈ R$546/mês)

> **Data:** 2026-07-02 · **Praça:** Fernandópolis-SP + raio ~30 km · **Objetivo:** validar o canal pago (custo por ativação real + retenção W2) — **não** escalar.
> **Câmbio:** 1 CAD = R$3,64 → **$150 CAD ≈ R$546** · **~R$18,20/dia** por 30 dias, repetível.
> **Canal:** Meta Ads clique-pro-WhatsApp (CTWA) — o carro-chefe de topo de funil do projeto.
> **Skill aplicada:** `marketing:campaign-plan`.

---

## ⚠️ Impedimento que continua valendo

Este plano **só roda com a empresa BC aberta** — conta de anúncios legal, Meta Business Manager e método de pagamento dependem dela. Enquanto a empresa não abrir, este documento é o **"pronto pra acionar no dia 1"**, não o executável de hoje (o executável de hoje é o plano orgânico do doc anterior). Toda a estrutura abaixo assume a empresa já constituída.

**Pré-requisito técnico a confirmar antes:** validar se o número do bot (hoje no **Z-API**) pode ser conectado ao Meta Business para CTWA. Se não puder, é preciso um número WhatsApp Business ligado ao Business Manager como destino dos anúncios. *(Pendência já registrada no CLAUDE.md.)*

---

## 1. Por que $150 CAD é "dinheiro de validação", não de escala

R$546 em 30 dias = **~R$18/dia**. Isso é abaixo do conforto do Meta se você otimizar para "ativação" (evento raro). A saída é **otimizar por "conversa iniciada"** — evento barato e frequente — dando ao algoritmo eventos suficientes para aprender, e medir a ativação (1º cupom) por baixo, como métrica de negócio.

O que este teste **compra** não é volume — é **verdade**: substituir nossas estimativas de planejamento (custo por ativação R$30–54) pelos **seus números reais** e por uma leitura de **W2**. Com isso você decide, com dado próprio, se vale subir para R$1.000/mês.

---

## 2. Passo a passo da campanha

### Fase 0 — Preparação (uma vez, ~3–4 h)
1. **Empresa BC aberta** → criar/associar **Meta Business Manager** + **conta de anúncios** + **Página do Facebook** do Economizei.
2. **Conectar o WhatsApp** de destino (confirmar Z-API × Meta; senão, número WhatsApp Business dedicado).
3. **Pixel/eventos:** ativar o rastreio de "conversa iniciada" como evento de otimização.
4. **Atribuição barata:** usar mensagem pré-preenchida do CTWA com um **token de campanha** (reaproveita o mecanismo do `/convidar`) para o bot marcar a origem de cada cadastro.
5. **Criativos prontos:** reusar 2–3 vídeos do plano orgânico (frame do interior) + 1 imagem estática. Mensagens já definidas (zero esforço · não é o cupom, é o mês · ser esperto · grátis funciona).

### Fase 1 — Estrutura da campanha (simples de propósito)
- **1 campanha · 1 conjunto de anúncios · 3 criativos.** Nada de duplicar conjuntos (evita sobreposição de leilão — erro que já mapeamos).
- **Objetivo:** Engajamento/Mensagens → destino **WhatsApp** → otimizar por **conversas iniciadas**.
- **Orçamento:** nível de campanha, **R$18/dia**.
- **Público:** **geo** (Fernandópolis + Votuporanga, Jales, Estrela d'Oeste etc., raio ~30 km), **25–55 anos**, aberto (sem interesses) ou no máximo 1–2 interesses leves (economia doméstica, supermercados). Em CTWA, público amplo + geo costuma render mais que segmentação estreita.

### Fase 2 — Operação dos 30 dias (baixo toque, ~1 h/semana)
| Dia | Ação |
|---|---|
| 1–3 | **Não mexer.** Fase de aprendizado do algoritmo. Evitar editar orçamento/criativo |
| 7 | 1º check: custo por conversa, CTR, CPM. Só observar |
| 14 | Cortar o criativo perdedor, reforçar o vencedor. Sem trocar tudo |
| 21 | Check de ativação (quantos mandaram o 1º cupom) e leitura preliminar de W2 |
| 30 | Fechamento: custo por ativação real + W2 + decisão (§5) |

### Fase 3 — Decisão (o entregável real do teste)
Ver a **régua de decisão** na seção 5.

---

## 3. Dados e benchmarks usados

| Métrica | O que é | Faixa usada (BR interior, CTWA) |
|---|---|---|
| **CPM** | custo por mil impressões | R$10–18 |
| **Custo por conversa iniciada** | evento de otimização | R$4–12 |
| **Cadastro** | 1º contato no bot (automático) ≈ 90% das conversas | — |
| **Taxa de ativação** | cadastro → manda o 1º cupom | 18%–40% |
| **Custo por ativação** | R$546 ÷ ativações | resultado |
| **W2** | mandou cupom na 2ª semana | gatilho de escala ≥ 30% |

> Benchmarks são **estimativas com margem larga** porque não temos histórico pago. É exatamente isso que o teste vem substituir por dado real.

---

## 4. Cenários de resultado (R$546 · 30 dias)

| Métrica | 🔴 Pessimista | 🟡 Realista | 🟢 Otimista |
|---|---|---|---|
| CPM | R$18 | R$14 | R$10 |
| Impressões | ~30.000 | ~39.000 | ~55.000 |
| Custo por conversa | R$12 | R$7 | R$4 |
| Conversas iniciadas | ~46 | ~78 | ~136 |
| Cadastros (~90%) | ~41 | ~70 | ~122 |
| Taxa de ativação | 18% | 28% | 40% |
| **Ativações (1º cupom)** | **~7** | **~20** | **~49** |
| **Custo por ativação** | **~R$78** | **~R$27** | **~R$11** |
| Leitura provável de W2 | < 15% | ~30% | 40%+ |

**🔴 Pessimista — o canal (ou o criativo/público) não engaja.** Criativo fraco, CPM alto de leilão, público mal casado. Custo por ativação **acima** da nossa banda de planejamento (R$30–54). Sinal: **não é problema de dinheiro, é de mensagem/oferta ou de retenção** — não escalar.

**🟡 Realista — funciona como o esperado.** ~20 novos usuários ativados no mês a **~R$27 cada** (dentro/abaixo da banda estimada), com W2 na casa dos 30%. É o resultado que **justifica repetir** e começar a pensar em subir a verba.

**🟢 Otimista — um criativo "pega" + geo quente.** Custo por conversa baixo no interior + vídeo que viraliza localmente. ~49 ativações a ~R$11. Aqui a decisão vira **acelerar** (subir pra R$1.000/mês), desde que o W2 acompanhe.

> **Leitura honesta:** o realista já é bom para um teste de R$546. O que decide o futuro **não é só o custo por ativação — é o W2**. Custo baixo com W2 ruim = balde furado; custo médio com W2 ≥ 30% = motor que vale alimentar.

---

## 5. Régua de decisão ao fim dos 30 dias

| Resultado | Decisão |
|---|---|
| Custo/ativação **≤ R$40** **E** W2 **≥ 30%** | ✅ **Repetir e escalar** — próximo ciclo a R$1.000/mês |
| Custo/ativação **R$40–60** **OU** W2 **20–30%** | 🔁 **Repetir igual** — iterar criativo/público antes de subir verba |
| Custo/ativação **> R$60** **E** W2 **< 20%** | ⏸️ **Pausar o pago** — voltar ao orgânico; o gargalo é retenção/produto, não mídia |

Essa régua honra o firewall financeiro: **aquisição não conserta retenção**. Só se aumenta a verba depois que o W2 prova que o produto segura.

---

## 6. Ajuste ao seu tempo curto

- **Montagem:** ~3–4 h uma vez (Fase 0 + 1).
- **Manutenção:** **~1 h/semana** (checks dos dias 7/14/21 + troca de criativo).
- Comparado ao plano orgânico (8 vídeos/mês = moinho de conteúdo), o pago **devolve horas**: monta uma vez, roda sozinho, você só lê e ajusta. É o modelo que mais cabe nas suas 12h/semana — **quando a empresa permitir**.

---

## 7. Próximos passos

1. **Humano/bloqueador:** abrir a empresa BC (desbloqueia conta de anúncios).
2. **Humano/técnico:** confirmar Z-API × Meta Business ou providenciar número WhatsApp Business de destino.
3. **Quando liberar:** montar Fase 0+1, gravar/subir 3 criativos, ligar o token de atribuição no `/convidar`.
4. **Ao fim dos 30 dias:** aplicar a régua da §5 e registrar os números reais no CLAUDE.md (substituindo as estimativas deste doc).

> Nada aqui toca `is_pro`/pagamento — é topo de funil, só cadastro grátis. Push e mudanças de conta são sempre seus (o ambiente não tem credencial).

---

### Fontes
- Câmbio CAD→BRL: [Investing.com — CAD/BRL](https://br.investing.com/currencies/cad-brl) · [Wise — CAD para BRL](https://wise.com/br/currency-converter/dolar-canadense-hoje)
- Estimativa de custo por ativação, mínimo de mídia, gatilho W2 e pré-requisito Z-API × Meta: `CLAUDE.md` (Seção 3) e `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md`.
