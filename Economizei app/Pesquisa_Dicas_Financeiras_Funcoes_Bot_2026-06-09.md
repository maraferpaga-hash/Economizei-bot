# 🔎 Da Dica à Função — Pesquisa de Finanças Pessoais Transformada em Inteligência do Bot

> **Criado em:** 2026-06-09
> **Origem:** pesquisa profunda na web (finanças pessoais, gastos do dia a dia, economia de mercado, finanças comportamentais) → cada dica-chave traduzida numa função candidata pro Economizei.
> **Lente:** o `Posicionamento_Norte_Estrategico_2026-06-09.md`. Toda função aqui foi puxada pra **Camada 2 (Inteligência)** ou **Camada 3 (Habilidade)** — o objetivo do Gabriel: "ter o que fazer com o dado". Nada que pare na Camada 1.
> **Filtro aplicado:** o **Teste de Norte** (pergunta-mãe + camada/atrito/quem faz/honestidade). Funções que não passam estão na seção 4, com o porquê.

---

## ⚡ Resumo executivo

🎯 **Decisão / Objetivo:** transformar o que a boa literatura de finanças ensina em **conclusões automáticas do bot** sobre o gasto da pessoa — usando exatamente o dado que o cupom já entrega (item, preço, quantidade, loja, data, categoria). O norte: a cada cupom, a IA deveria devolver não só o registro, mas um **"e daí" acionável**.

**As 5 funções que mais sobem a escada com o dado que já temos (Tier 1):**

- **Inflação pessoal por item** — "o arroz que você compra subiu ~12% em 3 meses" — 🤖 (usa histórico do próprio item).
- **Raio-X de categoria com conclusão** — evoluir o `/gastos` de "doces R$52" para "doces = 18% do mês, acima dos seus últimos meses; é o melhor lugar pra cortar" — 🤖.
- **"Onde dá pra cortar sem doer" + 1 troca concreta** — separa supérfluo de essencial e sugere uma única ação — 🤖.
- **"Quanto você já economizou"** — quando a pessoa gasta abaixo da própria média ou troca de mercado, mostrar a economia em R$ — 🤖 (motor de retenção).
- **Comparativo entre mercados** (já no roadmap) — a pesquisa confirma que é a feature mais alavancada: vira economia real. Validada, não inventada.

**Hoje (≤1h):** escolher 1 função do Tier 1 pra detalhar como spec. Recomendo **Inflação pessoal por item** — é novidade real, usa só o dado que já está no banco, e é puro "norte".

**Próxima sessão:** virar a função escolhida em spec técnica (campos, query, gatilho, copy) com a skill `economizei-product-principles` + `copywriter`.

**Bloqueadores:** nenhum pra Tier 1. Tier 2 depende de densidade de dados (mais cupons/usuários); um item (gastos invisíveis) está **fora de escopo** porque o bot não vê fatura de cartão — detalhado na seção 4.

---

## 📋 Relatório completo

### 1. Como li a pesquisa

Varri fontes brasileiras e internacionais em cinco frentes: **métodos de orçamento** (regra 50/30/20), **economia no supermercado** (lista, cardápio, preço por unidade, marca própria, sazonalidade, frequência de compra), **finanças comportamentais** (por que gastamos demais: viés do presente, ancoragem, efeito manada, fome, layout do mercado), **ferramentas existentes** (apps de comparação e cashback, histórico de preço) e **hábitos de poupança** (desafio das 52 semanas, arredondamento, inflação pessoal, custo em horas de trabalho). Fontes completas na seção 7.

O filtro de seleção foi duro: só virou candidata a função a dica que (a) gera **economia ou melhor gasto** e (b) pode ser **concluída pela IA a partir do dado do cupom**, sem pedir trabalho novo da pessoa. Conselho genérico que exige a pessoa "ter disciplina" foi descartado — não é o nosso frame.

### 2. O princípio do mapeamento

O dado que o cupom já entrega ao bot: **item** (nome bruto + nome canônico + categoria), **preço unitário**, **preço da linha**, **quantidade**, **loja + CNPJ**, **data** e **total**. Acumulado no tempo, isso vira histórico por item, por categoria, por loja e por mês. Cruzado entre usuários (anônimo, na `precos_mercado`), vira preço de referência de mercado.

Regra de ouro do mapeamento: **a dica diz "o que olhar"; a função faz a IA olhar por você e concluir.** A pessoa nunca deveria precisar calcular preço por quilo, lembrar quanto pagou no mês passado, ou montar planilha — isso é exatamente o trabalho que a IA assume.

### 3. Catálogo de funções (dica → função)

Cada função traz: **dica de origem**, **o que faz**, **exemplo de mensagem** (ilustrativo), **camada**, **veredito do Teste de Norte**, **triagem** (🤖 IA faz / 🤝 IA + 1 input / 🛠️ engenharia / 🧍 Gabriel manual), **dado necessário** e **esforço relativo**. Onde indico Free/Pro, é *candidato* — a decisão de pricing é do Gabriel (passa pelo `financial-firewall`).

---

#### TIER 1 — Constrói já: sobe a escada e usa o dado que já temos

**F1. Inflação pessoal por item**
- **Dica de origem:** inflação pessoal — registrar e comparar o custo dos mesmos itens ao longo do tempo (Nubank, FGV/Portal da Inflação, C6).
- **O que faz:** para cada produto canônico que a pessoa recompra, a IA compara o preço unitário atual com o histórico e avisa quando subiu (ou caiu) de forma relevante.
- **Exemplo:** *"📈 O café que você compra está ~14% mais caro que há 2 meses (R$ 18,90 → R$ 21,50). O arroz, em compensação, caiu 6%."*
- **Camada:** 2 → 3 (sabendo, ela pode trocar de marca/loja). **Veredito:** ✅ passa com folga — é o norte puro, IA conclui, zero atrito.
- **Triagem:** 🤖. **Dado:** `nome_canonico` + `preco_unit` + `data_compra`, ≥2 compras do mesmo item. **Esforço:** médio. **Candidato:** Free (básico) / Pro (cesta completa de inflação).

**F2. Raio-X de categoria com conclusão (evolução do `/gastos`)**
- **Dica de origem:** orçamento por categorias (50/30/20) + "saber onde cortar" (Serasa, InfoMoney, Sicredi).
- **O que faz:** o `/gastos` deixa de só mostrar a fatia e passa a **concluir**: qual categoria pesou mais, se está acima dos meses anteriores, e qual é a candidata óbvia a corte.
- **Exemplo:** *"Doces e bebidas somaram 23% do mês — acima da sua média (15%). É o lugar mais fácil de aliviar sem mexer no essencial (arroz, carne, hortifruti seguem normais)."*
- **Camada:** 2. **Veredito:** ✅ passa — transforma dado em entendimento. **Triagem:** 🤖. **Dado:** `categoria` + `preco_total` + histórico mensal. **Esforço:** baixo (já temos `/gastos`). **Candidato:** Free.

**F3. "Onde dá pra cortar sem doer" + 1 troca concreta**
- **Dica de origem:** separar despesa essencial de variável; cortar supérfluo, não o necessário (50/30/20; finanças comportamentais).
- **O que faz:** a IA classifica os itens em essencial × supérfluo e devolve **uma** sugestão concreta por mês — não uma lista que paralisa.
- **Exemplo:** *"Se o objetivo é apertar esse mês, o caminho mais indolor é refrigerante e salgadinho (R$ 47 no mês). O resto da sua compra é base da casa."*
- **Camada:** 3 (ação). **Veredito:** ✅ passa — uma ação, não dever de casa. **Triagem:** 🤖. **Dado:** `categoria`/`nome_canonico`. **Esforço:** médio (definir o que é supérfluo). **Candidato:** Free.

**F4. "Quanto você já economizou" (espelho de economia)**
- **Dica de origem:** tornar a economia concreta / redirecionar o que se poupa (desafio 52 semanas; gastos invisíveis — "transformar o corte em resultado").
- **O que faz:** quando a pessoa gasta abaixo da própria média, ou troca pra um mercado mais barato, a IA mostra a economia acumulada em R$. Vira reforço positivo (e retenção).
- **Exemplo:** *"🎉 Esse mês você gastou R$ 84 abaixo da sua média dos últimos 3 meses. No ano, já são R$ 312 que ficaram com você."*
- **Camada:** 3 (hábito/comportamento). **Veredito:** ✅ passa — fecha o ciclo "agir melhor". **Triagem:** 🤖. **Dado:** total por mês + média histórica. **Esforço:** baixo. **Candidato:** Free (é motor de retenção, deve ser de todos).

**F5. Comparativo entre mercados** *(já no roadmap — a pesquisa valida)*
- **Dica de origem:** comparar preço do mesmo produto entre lojas; apps de menor preço e histórico (Me Poupe; ClickSuper, Menor Preço Brasil, Zoom, Buscapé, Busca Preço).
- **O que faz:** com a base anônima `precos_mercado`, dizer onde a cesta da pessoa sairia mais barata.
- **Exemplo:** *"Pelos seus itens deste mês, o [Mercado B] sairia ~R$ 60 mais barato que onde você comprou. Quer ver os 5 itens que mais pesam nessa diferença?"*
- **Camada:** 2 → 3 (trocar de mercado = economia real). **Veredito:** ✅ passa com folga — é a feature mais alavancada da escada. **Triagem:** 🤖. **Dado:** `precos_mercado` (precisa densidade). **Esforço:** alto. **Candidato:** Pro (já definido no CLAUDE.md).

---

#### TIER 2 — Forte, mas depende de mais dado ou de 1 input

**F6. Alerta preditivo de estouro** *(já citado como Pro no CLAUDE.md)*
- **Dica de origem:** orçamento + acompanhamento ao longo do mês (50/30/20; meta de gasto).
- **O que faz:** no meio do mês, projeta o fechamento com base no ritmo e avisa antes de estourar.
- **Exemplo:** *"No ritmo atual, seu mês deve fechar ~R$ 130 acima da média. Faltam 11 dias."*
- **Camada:** 2 → 3. **Veredito:** ✅ passa. **Triagem:** 🤖. **Dado:** compras do mês + média. **Esforço:** médio. **Candidato:** Pro.

**F7. Meta mensal proposta pela IA (50/30/20 sem atrito)**
- **Dica de origem:** definir um teto pra alimentação (50/30/20; Meu Bolso em Dia).
- **O que faz:** em vez de pedir a pessoa configurar um orçamento (atrito), a **IA propõe** um teto realista a partir do histórico, e a pessoa só confirma ou ajusta.
- **Exemplo:** *"Pelos seus últimos meses, um teto confortável de mercado seria ~R$ 950. Quer que eu te avise quando você passar de 80% dele?"*
- **Camada:** 2 → 3. **Veredito:** ✅ passa — **desde que a IA proponha o número** (se exigisse a pessoa calcular, fere o atrito). **Triagem:** 🤝 (1 confirmação). **Dado:** média histórica. **Esforço:** médio. **Candidato:** Free (proposta) / Pro (acompanhamento fino).

**F8. Lista de recompra recorrente (previsão de reposição)**
- **Dica de origem:** lista de compras inteligente + previsão de recompra (Tenda, Ecolist; recompra automática).
- **O que faz:** pelos intervalos típicos de cada item, a IA monta uma lista provável do que está acabando — a pessoa recebe pronta, não digita nada.
- **Exemplo:** *"Faz ~32 dias do seu último arroz, café e sabão em pó. Provável que estejam no fim. Quer a lista do rancho pronta?"*
- **Camada:** 3 (ação) + reduz atrito (lista pronta). **Veredito:** ✅ passa — IA faz o trabalho. **Cuidado:** entregar como oferta gentil, nunca cobrança (alinhar ao tom do sistema de reengajamento). **Triagem:** 🤖. **Dado:** intervalos entre compras do mesmo `nome_canonico`. **Esforço:** alto. **Candidato:** Pro.

**F9. Preço por unidade / "qual embalagem compensa"**
- **Dica de origem:** comparar preço por unidade, não preço de etiqueta; pacote grande nem sempre é mais barato (Fidelity, Bankrate, Penny Hoarder).
- **O que faz:** quando o mesmo produto aparece em tamanhos/marcas diferentes no histórico, a IA aponta qual sai mais barato por kg/litro/unidade.
- **Exemplo:** *"O sabão que você levou saiu R$ 12,50/kg. O que você comprou em abril era R$ 9,80/kg — vale conferir o tamanho da próxima vez."*
- **Camada:** 2. **Veredito:** ✅ passa. **Triagem:** 🤖. **Dado:** `preco_unit` + quantidade/peso (depende da qualidade da extração de gramatura). **Esforço:** alto (parsing de unidade). **Candidato:** Pro.

---

#### TIER 3 — Bom valor, mas com atrito ou sensibilidade a tratar

**F10. Custo em horas de trabalho**
- **Dica de origem:** reframe "quanto isso custa em horas do seu trabalho?" (Montepio, Doutor Finanças, Meu Bolso em Dia).
- **O que faz:** traduz um gasto em horas de trabalho da pessoa — torna o custo tangível.
- **Exemplo:** *"Essa compra equivale a ~6h do seu trabalho."*
- **Camada:** 3. **Veredito:** ⚠️ passa raspando — exige **a renda/hora da pessoa** (atrito + dado sensível). Só vale se for opt-in, com a IA pedindo uma única vez e de forma respeitosa. **Triagem:** 🤝. **Esforço:** baixo (cálculo) / o custo é o input. **Candidato:** Pro, opcional.

**F11. Sugestão de marca própria / substituição mais barata**
- **Dica de origem:** marcas próprias com qualidade parecida e preço menor (Creditas, Santander, iFood).
- **O que faz:** quando a pessoa compra uma marca, a IA sugere que a versão marca-própria/genérica do mesmo item costuma custar menos.
- **Exemplo:** *"O [item de marca] costuma ter versão de marca própria ~20% mais barata. Vale testar."*
- **Camada:** 2 → 3. **Veredito:** ⚠️ raspando — depende de **identificar equivalência de produto** (marca × genérico) com confiança; sem isso, vira palpite e fere a honestidade. **Triagem:** 🛠️ (precisa base de equivalência). **Esforço:** alto. **Candidato:** Pro, futuro.

**F12. Nudge "antes de ir ao mercado"**
- **Dica de origem:** não ir com fome, ir com lista, gatilhos de impulso (finanças comportamentais; Me Poupe).
- **O que faz:** no dia/horário em que a pessoa costuma comprar, um lembrete leve com a lista pronta e 1 alerta do mês passado.
- **Exemplo:** *"Hoje costuma ser seu dia de mercado. Sua lista provável está pronta. Lembrete: mês passado os doces pesaram — eles que costumam fugir do controle."*
- **Camada:** 3 (comportamento). **Veredito:** ✅ passa, **com cuidado de tom** — não pode soar vigilância. **Triagem:** 🤖. **Dado:** padrão de dia de compra + histórico. **Esforço:** médio. **Candidato:** Pro. *(Encaixa no sistema de reengajamento já planejado.)*

---

### 4. Fora do norte agora (honestidade — Teste de Norte reprovou)

**G1. Gastos invisíveis / assinaturas esquecidas.** A pesquisa mostra que é um vilão enorme do orçamento (streaming, apps premium, débitos automáticos — Nubank, PagBank, Sicredi). **Mas o bot só enxerga cupom fiscal, não a fatura do cartão.** Construir isso exigiria a pessoa encaminhar fatura/extrato — mudança grande de escopo, atrito alto e questão de LGPD séria. **Veredito:** ❌ não passa hoje (a inteligência prometida não teria lastro no dado que temos). Registrar como possível visão de futuro, não como função do roadmap atual.

**G2. Controle de validade / desperdício de alimentos.** Ótimas dicas (organizar geladeira por vencimento, "dia da geladeira", FIFO — OMO, iFood, ONU). **Mas o cupom não traz data de validade nem o que sobrou na geladeira.** Dá no máximo um nudge fraco ("compra grande de perecível tende a virar desperdício"). **Veredito:** ⚠️ fraco com o dado atual — manter como conteúdo educativo (TikTok/Reels), não como função.

**G3. Técnica do elástico no pulso (Me Poupe).** Apareceu na pesquisa como truque anti-impulso. **Excluída de propósito:** é uma técnica de desconforto físico como freio de comportamento; não entra no produto nem em copy. O combate ao impulso, pra nós, é informacional (mostrar o gasto, a categoria, a economia) — nunca via punição física. Registro aqui só pra não ser reintroduzida.

---

### 5. Tabela-resumo priorizada

| # | Função | Camada | Norte | Triagem | Esforço | Dado já existe? | Free/Pro (candidato) |
|---|---|---|---|---|---|---|---|
| F1 | Inflação pessoal por item | 2→3 | ✅ folga | 🤖 | Médio | Sim | Free/Pro |
| F2 | Raio-X de categoria c/ conclusão | 2 | ✅ | 🤖 | Baixo | Sim | Free |
| F3 | Onde cortar sem doer + 1 troca | 3 | ✅ | 🤖 | Médio | Sim | Free |
| F4 | Quanto você já economizou | 3 | ✅ | 🤖 | Baixo | Sim | Free |
| F5 | Comparativo entre mercados | 2→3 | ✅ folga | 🤖 | Alto | Parcial (densidade) | Pro |
| F6 | Alerta preditivo de estouro | 2→3 | ✅ | 🤖 | Médio | Sim | Pro |
| F7 | Meta mensal proposta pela IA | 2→3 | ✅ | 🤝 | Médio | Sim | Free/Pro |
| F8 | Lista de recompra recorrente | 3 | ✅ | 🤖 | Alto | Sim | Pro |
| F9 | Preço por unidade / embalagem | 2 | ✅ | 🤖 | Alto | Parcial (gramatura) | Pro |
| F10 | Custo em horas de trabalho | 3 | ⚠️ raspando | 🤝 | Baixo+input | Não (renda) | Pro opc. |
| F11 | Marca própria / substituição | 2→3 | ⚠️ raspando | 🛠️ | Alto | Não (equivalência) | Pro futuro |
| F12 | Nudge antes do mercado | 3 | ✅ c/ tom | 🤖 | Médio | Sim | Pro |
| G1 | Assinaturas / gastos invisíveis | — | ❌ | — | — | Não (fatura) | Fora de escopo |
| G2 | Validade / desperdício | — | ⚠️ fraco | — | — | Não | Conteúdo, não função |
| G3 | Elástico no pulso | — | ❌ | — | — | — | Excluída (bem-estar) |

### 6. Recomendação de sequência

Prefira o que **sobe mais a escada com o dado que já está no banco** — sem depender de densidade de usuários nem de novo input da pessoa:

1. **F2 (Raio-X de categoria)** primeiro: menor esforço, evolui algo que já existe (`/gastos`) e já entrega Camada 2 de verdade.
2. **F1 (Inflação pessoal por item)**: o maior "uau" de novidade, puro norte, e prova o conceito de "a IA olha o histórico por você".
3. **F4 (Quanto você economizou)**: barato e é motor de retenção — fecha o ciclo da Camada 3.
4. **F3 (Onde cortar)**: completa o trio "entender → agir".
5. Só então **F5/F6/F8 (Pro)**, que dependem de mais dado ou são mais pesados.

> Critério de avanço, no espírito do projeto (sem prazo): só priorizar Tier 2 quando o Tier 1 estiver no ar e houver **densidade de histórico** suficiente (ex.: usuários com ≥2–3 meses de cupons) pra que inflação, comparativo e previsão tenham do que concluir.

### 7. Fontes

Orçamento e método 50/30/20: [InfoMoney](https://www.infomoney.com.br/minhas-financas/regra-50-30-20-conheca-um-metodo-para-organizar-suas-financas/), [Serasa](https://www.serasa.com.br/score/blog/metodo-50-30-20-qual-a-importancia-para-manter-a-saude-financeira/), [Sicredi](https://www.sicredi.com.br/coop/altosdaserra/noticias/produtos-e-servicos/conheca-o-metodo-50-30-20-para-deixar-suas-financas-em-ordem/), [Instituto de Longevidade](https://institutodelongevidade.org/longevidade-financeira/financas/regra-50-30-20-financas-pessoais).

Economia no supermercado: [Creditas/Exponencial](https://www.creditas.com/exponencial/como-economizar-no-supermercado/), [Meu Bolso em Dia](https://meubolsoemdia.com.br/Materias/15-dicas-praticas-para-reduzir-os-gastos-no-supermercado), [Santander](https://www.santander.com.br/blog/como-economizar-no-supermercado), [Serasa](https://www.serasa.com.br/blog/economizar-no-supermercado/), [iFood](https://institucional.ifood.com.br/clientes/como-economizar-no-mercado/), [UAI](https://www.uai.com.br/economia/2026/02/17/5-estrategias-simples-que-podem-reduzir-sua-conta-do-supermercado-em-ate-20/).

Economia no supermercado (internacional / preço por unidade): [Fidelity](https://www.fidelity.com/learning-center/personal-finance/save-on-groceries), [Bankrate](https://www.bankrate.com/banking/savings/ways-to-save-money-on-groceries/), [The Penny Hoarder](https://www.thepennyhoarder.com/budgeting/grocery-budget-tips/), [Mayo Clinic Press](https://mcpress.mayoclinic.org/nutrition-fitness/meal-planning-on-a-budget-plan-purchase-prepare/).

Finanças comportamentais: [Meu Bolso em Dia — cérebro x bolso](https://meubolsoemdia.com.br/Materias/o-cerebro-e-o-bolso), [Onze](https://www.onze.com.br/blog/financas-comportamentais/), [Capitalist](https://capitalist.com.br/economia-comportamental-conheca-6-gatilhos-que-sabotam-as-suas-financas/), [BTG Pactual](https://content.btgpactual.com/blog/financas/compras-por-impulso-como-identificar-e-evitar), [Serasa](https://www.serasa.com.br/score/blog/compras-por-impulso-como-evitar-esse-habito/).

Criadores / Me Poupe: [TikTok @natharcuri](https://www.tiktok.com/@natharcuri/video/7508836901533650182), [Me Poupe — 10 passos](https://organizefinanceiro.com/me-poupe-10-passos-para-nunca-mais-faltar-dinheiro-no-seu-bolso/), [UAI — economizar até 30% pelo celular](https://www.uai.com.br/uainoticias/2026/02/27/como-economizar-ate-30-nas-compras-no-supermercado-usando-apenas-o-celular/).

Apps de comparação / cashback: [ClickSuper](https://www.clicksuper.com.br/), [Olhar Digital — Menor Preço Brasil](https://olhardigital.com.br/2025/08/03/dicas-e-tutoriais/quer-economizar-na-farmacia-e-supermercado-conheca-o-app-menor-preco-brasil/), [TechTudo](https://www.techtudo.com.br/listas/2021/09/cinco-aplicativos-para-comparar-precos-e-encontrar-os-produtos-mais-baratos.ghtml), [Zoom (cashback/histórico)](https://apps.apple.com/br/app/zoom-cashback-e-menor-pre%C3%A7o/id938003628).

Gastos invisíveis / assinaturas: [PagBank](https://blog.pagbank.com.br/gastos-invisiveis), [Sicredi](https://www.sicredi.com.br/coop/integracaorsscmg/noticias/seu-dinheiro/o-que-sao-gastos-invisiveis-e-por-que-eles-drenam-seu-orcamento/), [Catraca Livre](https://catracalivre.com.br/noticias/como-cancelar-as-assinaturas-esquecidas-no-celular-que-comem-o-seu-saldo-sem-voce-perceber/), [Revista Oeste](https://revistaoeste.com/oestegeral/2026/03/06/assinaturas-que-voce-quase-nao-usa-podem-pesar-no-orcamento-anual/).

Desperdício de alimentos: [OMO](https://www.omo.com/br/sustentabilidade/vida-sustentavel/dicas-para-evitar-o-desperdicio-de-alimentos.html), [iFood](https://institucional.ifood.com.br/impacto-social/6-dicas-para-zerar-o-desperdicio-de-comida-em-casa/), [ONU Brasil](https://brasil.un.org/pt-br/134649-reduzir-o-desperd%C3%ADcio-de-alimentos-%C3%A9-uma-das-maneiras-mais-f%C3%A1ceis-de-diminuir-o-impacto).

Poupança / hábito: [Mobills — 52 semanas](https://www.mobills.com.br/blog/economizar/desafio-52-semanas/), [Serasa Carteira Digital](https://www.serasa.com.br/carteira-digital/blog/desafio-financeiro/), [PagBank](https://blog.pagbank.com.br/desafio-das-52-semanas).

Custo em horas de trabalho: [Montepio](https://www.montepio.org/ei/pessoal/poupanca/horas-de-trabalho/), [Doutor Finanças](https://www.doutorfinancas.pt/financas-pessoais/orcamento-familiar/pense-quanto-custa-isto-em-horas-de-trabalho-e-poupe/), [Meu Bolso em Dia — valor da sua hora](https://meubolsoemdia.com.br/Materias/quanto-vale-seu-tempo).

Lista inteligente / recompra: [Tenda Atacado](https://www.tendaatacado.com.br/dicas/lista-de-compras-inteligente/), [Ecolist](https://ecolist.com.br/blog/lista-de-compras-inteligente-guia-definitivo), [Zenvia — compra recorrente](https://zenvia.com/blog/compra-recorrente/).

Inflação pessoal: [Nubank](https://blog.nubank.com.br/inflacao-pessoal-como-calcular/), [C6 Bank](https://www.c6bank.com.br/blog/inflacao-pessoal), [Nord Investimentos](https://www.nordinvestimentos.com.br/blog/como-calcular-sua-inflacao/).

---

> **Mantra que guiou esta pesquisa:** a dica diz o que olhar; a IA olha por você e conclui. Toda função aqui existe pra que, a cada cupom, a pessoa saia sabendo algo sobre o dinheiro dela que não sabia antes.
