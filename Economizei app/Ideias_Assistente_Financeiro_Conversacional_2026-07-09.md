# 💬 Ideias — Assistente Financeiro Conversacional (evolução do Agente de Perguntas)

> **Status:** ideias + benchmark para discussão e priorização. Nada codado nesta sessão.
> **Data:** 2026-07-09
> **Pedido do Gabriel:** transformar o Agente de Perguntas numa das FORÇAS do Economizei — um assistente financeiro pessoal com quem a pessoa conversa livremente (texto ou áudio) e recebe dados e insights naturais, "como mandar um áudio pra uma IA hoje em dia".
> **Base existente:** cadeia cod-0010..0017 COMPLETA e commitada (`d4eaf51`) — classificador → executor determinístico → narração LLM com firewall de fidelidade → template como airbag. Desenho-mãe: `Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`. ⚠️ **Ainda NÃO validado em produção** (migration + envs + teste end-to-end pendentes — checkpoint 2026-07-08).
> **Norte:** "a cada interação, o usuário sai sabendo algo sobre o dinheiro dele que não sabia antes."

---

## 0. ⚠️ A verdade incômoda primeiro (financial-firewall)

O Agente que construímos **ainda não respondeu uma pergunta real em produção**. Antes de empilhar features novas em cima dele:

1. Rodar `migration_FUTURA_agente_perguntas.sql` + A9 no Supabase.
2. Setar envs no Railway + `.env.example` (`LIMITE_PERGUNTAS_FREE`, `AGENTE_MODO`, `AGENTE_MODELO`, `COMPARATIVO_AMOSTRAS_FREE`).
3. Teste manual com pergunta real (nenhum teste unitário pega "número inventado" do Gemini real — o bug de 06-07).
4. **Observar ~2 semanas de `perguntas_log`** (fase 2 do faseamento OODA, já desenhada): o log diz QUAIS perguntas as pessoas fazem — construir intenção antes disso é achismo.

Tudo abaixo é o cardápio pra depois (ou em paralelo, nas partes que não dependem do agente no ar).

---

## 1. 🔍 Benchmark — o que os assistentes financeiros fazem (com e sem IA)

### 1.1 Internacionais com IA

| Produto | O que ensina pro Economizei |
|---|---|
| **Cleo** (chat-first, Gen Z) | Personalidade é motor de engajamento: fala "como amiga", tem Roast Mode / Hype Mode. Chat é a interface principal, não um extra. Insights em linguagem simples, assinatura recorrente detectada, resposta a pergunta livre sobre gasto. Free resolve o básico; tiers pagos ampliam. **Modelo mais próximo do que queremos** — mas nosso tom é "esperto do interior", não sarcasmo gringo. |
| **Erica (Bank of America)** | O dado mais importante do benchmark: **60% das interações são PROATIVAS** — a Erica puxa assunto, não espera pergunta. 30+ insights proativos com cooldown anti-fadiga; os 2 campeões: assinatura recorrente que subiu de preço e "entenda seu comportamento de gasto". 98% dos clientes acham a resposta. Lição: **o assistente que só responde é metade do produto; a outra metade é ele te contar o que você não perguntou.** |
| **Monarch Money** | Trio: AI Assistant (pergunta livre sobre o próprio dado) + AI Insights + **Weekly Recap** (resumo semanal narrado). Recap semanal é ponte natural pro nosso resumo mensal. |
| **Copilot Money** | **Resumo mensal narrado por IA em parágrafos simples**: onde o dinheiro foi, o que mudou vs. mês passado, o que cortar. É a versão narrada do nosso resumo mensal — upgrade natural do que já temos. |
| **Plum / Emma (UK)** | Nudges comportamentais + desafios de economia. Confirma o padrão: análise automática → conclusão em 1 frase → ação sugerida. |

### 1.2 Concorrentes brasileiros no WhatsApp (importante — é o nosso quintal)

| Produto | O que faz | Diferença pro Economizei |
|---|---|---|
| **Magie** | IA no WhatsApp com Pix por foto/áudio, paga boleto, conecta banco | É banco/pagamento, não inteligência de gasto. Mas prova que **áudio no WhatsApp financeiro já é expectativa do usuário BR**. |
| **Poupa.ai** | Despesa por texto, áudio ou foto; categorização por IA | Entrada manual de gasto (fricção). Nosso cupom lê a compra INTEIRA item a item — granularidade que ninguém tem. |
| **Meu Assessor** | Assistente geral (finanças + agenda + tarefas), Open Finance | Generalista. Nós somos fundos no supermercado. |
| **Jota / ZapGastos / Financinha** | Controle de gastos conversacional no WhatsApp | Todos dependem de a pessoa DIGITAR o gasto. Nosso gesto mínimo (foto do cupom) alimenta o dado sem esforço. |

**Leitura honesta do quadro:** a categoria "assistente financeiro no WhatsApp" já existe e está lotando no Brasil. Nosso diferencial defensável não é "conversar" (todos conversam) — é **a qualidade do dado por baixo** (cupom lido item a item, `nome_canonico`, categoria, preço unitário, histórico temporal, comparativo entre mercados). A conversa é a interface; a classificação é o coração (princípio 2026-06-27). O assistente vence se responder perguntas que os outros NÃO TÊM DADO pra responder: "quanto o arroz subiu pra mim?", "em que mercado a cerveja tá mais barata?", "o que mais pesou no rancho do mês?".

### 1.3 Sem IA (planilha, YNAB, Mobills, Organizze)

O concorrente real segue sendo a planilha (pesquisa de maio). Apps tradicionais entregam relatório e gráfico — a pessoa precisa IR ATÉ o dado e interpretá-lo sozinha. Nosso frame: **o dado vem até a pessoa, já interpretado, na conversa que ela já tem aberta.** Toda ideia abaixo deve preservar isso.

---

## 2. 💡 Ideias, organizadas em 4 eixos

### Eixo A — Mais perguntas respondidas (intenções + dados + filtros)

A inteligência já existe em `insights.js` — a maioria vira intenção nova com pouco código. Em ordem de esforço:

**A1. Leva 2 de intenções (inteligência JÁ PRONTA, só plugar no registro):**

| Intent nova | Pergunta típica | Reusa |
|---|---|---|
| `inflacao_item` | "o que subiu de preço?" / "quanto tá o leite?" | `analisarInflacaoPessoal` |
| `raio_x_categorias` | "onde vai meu dinheiro?" / "qual categoria pesa mais?" | `analisarRaioXCategorias` |
| `economia_acumulada` | "quanto já economizei?" | `calcularEconomia` |
| `onde_cortar` | "onde dá pra cortar?" | `analisarOndeCortar` |
| `comparativo_mercados` | "onde tá mais barato?" | `compararPrecosMercado` (cod-0020) |
| `gasto_por_termo` | "quanto gastei em cerveja?" | `buscarGastoPorAlvo` (cod-0030) — já é o cod-0034 da AGENDA |
| `gasto_superfluo` | "quanto foi de besteira esse mês?" | `buscarGastoSuperfluo` (cod-0030) |

**A2. Funções de análise NOVAS em `insights.js` (puras, testáveis) que destravam perguntas de alto valor:**

| Função nova | Pergunta que destrava | Observação |
|---|---|---|
| `projetarFimDeMes` | "no ritmo atual, quanto fecho o mês?" / "posso gastar mais?" | Run-rate: total até hoje ÷ dias corridos × dias do mês. Honestidade: exigir mínimo de dias/compras pra projetar; rotular como estimativa. **Camada 3 do norte (Habilidade)** — a mais alavancada da leva. |
| `rankearItens` | "o que mais pesou na compra?" / "top 5 do mês" | Ordenação por `preco_total`. Trivial e muito perguntável. |
| `ticketMedioPorIda` | "quanto gasto por ida ao mercado?" | Total ÷ nº de compras do período. |
| `gastoPorLoja` | "quanto gastei no [mercado]?" | Agrupa `compras.loja`(+`cnpj` do A9). Casa com a cultura local (Pessotto, Sakashita…). |
| `ultimaCompraItem` | "quando comprei fralda pela última vez? quanto paguei?" | Busca por `nome_canonico` + matching cod-0030. |
| `frequenciaCompra` | "quantas vezes fui ao mercado esse mês?" | Contagem simples. |

**A3. Filtros compostos (seleção e filtragem que o Gabriel pediu):** hoje cada intent tem 1-2 parâmetros (categoria, período). Evoluir o vocabulário fechado do classificador pra combinar **categoria × período × loja × termo** ("quanto gastei em carne no Pessotto mês passado?"). Continua vocabulário fechado + parser determinístico — só cresce a matriz de params. É aqui que o dado do cupom brilha contra os concorrentes.

### Eixo B — Naturalidade da conversa (o "áudio pra IA")

**B1. Entrada por ÁUDIO (a ideia de maior impacto do eixo).** O público B/C manda áudio, não texto — é o gesto mais natural do WhatsApp brasileiro. Fluxo: voice note → Z-API entrega o áudio → Gemini multimodal transcreve (mesmo padrão do download de imagem que já temos em `zapi.js`) → o texto entra no MESMO pipeline do agente (cota → classificar → executar → narrar). Zero mudança nas guardas. Magie já treinou o mercado a esperar isso. Custo: 1 chamada extra barata por áudio. Resposta continua em TEXTO (número escrito é auditável e re-lível; TTS fica fora por ora — custo e risco de número mal-ouvido).

**B2. Memória de contexto curto (follow-up).** Hoje cada pergunta nasce órfã. Conversa de verdade tem sequência: "quanto gastei esse mês?" → "e em bebidas?" → "e mês passado?". Solução barata: guardar o último `{intent, params, ts}` por usuário (em memória com TTL ~10min, ou coluna leve) e passar ao classificador como contexto de herança de parâmetros ("e em bebidas?" herda o período anterior). O número continua nascendo no executor — a memória só ajuda a ENTENDER a pergunta, nunca a respondê-la.

**B3. Follow-up sugerido (conversation starters).** Padrão dos benchmarks pra matar o cold start ("o que eu posso perguntar?"): terminar a resposta com 1 sugestão contextual — respondeu gasto do mês → "Quer ver por categoria? É só perguntar." Cada intent declara seus `sugestoes[]` no registro. Ensina o vocabulário do agente sem tutorial. Regra anti-ruído: no máx. 1 sugestão, nem sempre.

**B4. Variação de narração (matar o tom robótico).** A narração LLM já existe; refinar o prompt pra variar abertura/estrutura entre respostas (sem gíria proibida, sem conselho, firewall de fidelidade intocado). Personalidade "esperto do interior, direto e parceiro" — versão nossa do que a Cleo prova que engaja. Barato: é prompt, não arquitetura.

**B5. Opção B — function-calling (cod-0018, já no backlog).** O destino "chat de verdade": o Gemini escolhe qual `executar()` chamar, respondendo perguntas compostas e não previstas ("gastei mais em carne ou em cerveja?"). As intenções já têm formato de tool declaration (costura §14 do desenho). Gatilho mantido: Opção A validada + log mostrando perguntas fora do cardápio.

### Eixo C — Insights proativos pré-programados (a lição da Erica: 60% proativo)

O assistente não só responde — **puxa assunto quando tem algo que vale a pena dizer**. Biblioteca de gatilhos determinísticos (código decide QUANDO e o QUÊ; LLM no máximo narra; mesmo firewall):

| Gatilho (código, determinístico) | Mensagem-exemplo | Momento |
|---|---|---|
| Item recorrente subiu ≥X% na compra recém-lida | "O queijo subiu 18% desde a última compra." | Junto da confirmação do cupom (não é mensagem extra — encaixa na que já existe) |
| Categoria cruzou a média histórica no meio do mês | "Bebidas já passou o que você costuma gastar no mês inteiro." | Pós-cupom |
| Marco de economia | "Você fechou 3 meses seguidos abaixo da média. R$ X a menos." | Resumo mensal |
| Item sumiu do padrão | (guardar — pode soar vigilância; avaliar depois) | — |
| Recap semanal opt-in ("quer um resumo toda semana?") | Mini-resumo: total, maior categoria, 1 conclusão | Semanal, só pra quem pediu |

Regras de honestidade e não-fadiga: (1) cooldown por tipo de insight (padrão Erica); (2) máx. 1 insight proativo por evento; (3) só dispara com base estatística suficiente (Camada 4 — `temConclusao`); (4) sempre carrega o número que o sustenta. **Atenção de escopo:** os gatilhos per-compra do Alerta Pro (cod-0031..0035, limite de acompanhamento, supérfluo) JÁ COBREM parte disso — esta biblioteca deve NASCER unificada com aquele desenho, não duplicá-lo. Recorte Free×Pro dos proativos = decisão humana (firewall).

### Eixo D — A resposta que ensina (dados apurados)

**D1. Toda resposta de valor carrega comparação.** Regra de produto pro registro de intents: sempre que o executor tiver base, o fato inclui o comparativo ("R$ 320 em carnes — 12% acima do seu normal"). Número sozinho é Camada 1; número + referência é Camada 2. Já temos as médias históricas; é padronizar o "fato rico".

**D2. Gráfico sob demanda na conversa.** "Me mostra em gráfico" → intent `mostrar_grafico` reusa `charts.js`/QuickChart que o `/gastos` já usa. Resposta visual dentro da conversa, custo ~zero.

**D3. `duvida_sobre_bot` como intent.** "O que você sabe fazer?", "como funciona o limite?" → resposta natural (substitui o /ajuda seco na conversa). Mata boa parte do `fora_de_escopo` do log.

---

## 3. 🗺️ Sequência recomendada (honesta com o custo e o estado atual)

| Fase | O quê | Depende de |
|---|---|---|
| **0. Validar o que existe** | Deploy do Agente (migration + envs + teste real) + 2 semanas de log | 🧍 Gabriel (tudo humano) |
| **1. Leva 2 de intents + fato rico** | A1 (7 intents com inteligência pronta) + D1 + D3 | Nada — código pode nascer antes do deploy |
| **2. Naturalidade barata** | B2 (contexto follow-up) + B3 (sugestões) + B4 (prompt de narração) | Fase 1 |
| **3. Áudio** | B1 (voice → transcrição → mesmo pipeline) | Agente no ar (validar com texto antes de abrir o áudio) |
| **4. Análises novas + filtros compostos** | A2 + A3 (projeção, ranking, por-loja…) | A9 rodada; matching cod-0030 (✅) |
| **5. Proativos** | Eixo C unificado com o Alerta Pro (cod-0031..0035) | Decisões Free×Pro + gate Pro (humano) |
| **6. Chat aberto** | B5 / cod-0018 (function-calling) | `fidelidade_ok` estável no log |

**Racional da ordem:** validar antes de construir (regra 6); as intents da Fase 1 são quase-de-graça (inteligência pronta, só registro + testes); áudio é o maior salto de percepção de naturalidade, mas só depois que o pipeline provar honestidade com texto; o chat aberto (B) é o fim da escada, não o começo.

**O que NÃO fazer (Teste de Norte / firewall):**
- ❌ Conselho financeiro além do dado ("invista em X", "você deveria…") — Camada 6 continua valendo em toda expansão.
- ❌ TTS/resposta em áudio por ora — número falado não é auditável, custo sobe, ganho duvidoso.
- ❌ Small talk aberto (deixar o bot conversar sobre qualquer assunto) — queima cota, dilui o produto, risco de reputação. Off-topic segue com resposta gentil de escopo.
- ❌ Duplicar o Alerta Pro com outra "biblioteca de proativos" concorrente — é UM sistema.

---

## 4. 💰 Custo (ordem de grandeza, honesto)

- Pergunta texto hoje: até 2 chamadas Gemini (classificar + narrar) ≈ R$0,001–0,009/pergunta (Desenho §4).
- Áudio: +1 chamada de transcrição (áudio de WhatsApp é curto; Gemini Flash cobra barato por segundo de áudio) — a cota de 30/mês segue segurando abuso.
- Intents novas e proativos: custo marginal ~zero (análise é JS; proativo determinístico nem chama LLM se narrado por template).
- Function-calling (fase 6): mais tokens por pergunta (loop de ferramenta) — medir na hora, com o log da Opção A como baseline.

---

## 5. Fontes do benchmark

- Cleo: thepennyhoarder.com/budgeting/cleo-app-review · web.meetcleo.com
- Erica/BofA: newsroom.bankofamerica.com (3 bilhões de interações, 60% proativas, top insights) · customerexperiencedive.com
- Monarch: help.monarch.com (AI Assistant, Insights, Weekly Recap)
- Copilot Money: copilot.money · reviews 2026 (resumo mensal narrado por IA)
- BR/WhatsApp: magie.com.br · poupa.ai · meuassessor.com · blog.jota.ai · zapgastos.com · blog.financinha.com.br
- UX conversacional: shapeof.ai/patterns/nudges · neuronux.com (conversation starters, cooldown de nudges)
