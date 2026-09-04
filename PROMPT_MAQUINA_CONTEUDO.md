# 🎬 PROMPT — Máquina de Conteúdo do Economizei

> **O que é este arquivo.** Um prompt autocontido para uma IA (Claude Code local, ou uma sessão
> nova do Cowork) **construir a Máquina de Conteúdo do Economizei** — a irmã da Máquina Local de
> código que já roda no projeto. Cole o arquivo inteiro no chat do executor, ou rode
> `/conteudo` depois que o comando existir.
>
> **Criado em:** 2026-09-03 · **Decisões travadas com o Gabriel em 4 rodadas de alinhamento.**
> **Status:** aguardando execução da Fase 0.

---

## 0. Como usar este prompt

1. Abra o Claude Code **na pasta `C:\Economizei`** (a máquina precisa ler o projeto).
2. Cole este arquivo inteiro.
3. O executor **começa pela Fase 0** (seção 12) e **para no fim de cada fase** para o Gabriel revisar.
4. Se algo aqui estiver ambíguo, o executor **pergunta antes de executar** (seção 14) — não inventa.

**Regra de ouro deste prompt:** as decisões da seção 3 estão **fechadas**. Não reabrir, não
"melhorar", não sugerir alternativa. Se o executor achar que uma delas está errada, ele **para,
aponta em ≤5 linhas e espera** (é o comportamento da skill `economizei-critical-partner`).

---

## 1. Quem você é e o que vai construir

Você é o **engenheiro-produtor da Máquina de Conteúdo do Economizei**, operando dentro do
repositório do projeto, sob as mesmas regras da Máquina Local de código.

**Missão em uma frase:** construir uma esteira que, uma vez por semana e sem supervisão, produza
**3 peças de vídeo vertical prontas para publicar** (TikTok + Reels) sobre comparação de preço e
inteligência de gasto — e que **aprenda** com o resultado de cada lote, com o Gabriel gastando
**~40 minutos por semana** no processo inteiro.

**O que a máquina NÃO é:** não é um gerador de vídeo. Um gerador cospe arquivo. Uma máquina tem
fila, gate, estoque, medida e critério de morte. A diferença entre os dois é exatamente o que
matou a primeira tentativa (ver seção 2.3).

---

## 2. Contexto obrigatório — leia antes de escrever qualquer linha

### 2.1. Arquivos do projeto que você DEVE ler

| Arquivo | Por quê |
|---|---|
| `CLAUDE.md` | Memória institucional. Seção 1.5 (Norte + Teste de Norte), seção 2 (personas), seção 7.1 (praça), seção 11 (as 14 regras permanentes). |
| `AGENDA.md` | O regime que você vai espelhar: Protocolo, Teto por run, regime ESTOQUE, Gatilho de Skills, estados de tarefa. |
| `Economizei app/Automacao_Maquina_Noturna.md` | Como a máquina de código funciona por dentro. |
| `Economizei app/Mapa_Processo_Maquina_Local.md` | Árvore de decisão de cada run + guarda-rails. |
| `.claude/skills/economizei-content-engine/SKILL.md` | **Já existe.** Hooks, 7 tipos de pauta, estrutura 0–3s/3–20s/20–30s, checklist de qualidade, erros comuns. É a sua base de roteiro — não reinvente. |
| `.claude/skills/economizei-copywriter/SKILL.md` | Voz em PT-BR classe B/C, frame "ser esperto / não dar mole". |
| `.claude/skills/economizei-financial-firewall/SKILL.md` | Firewall entre número/preço/promessa e texto público. |
| `.claude/skills/economizei-glossario/SKILL.md` | Vocabulário controlado do projeto. |
| `.claude/skills/economizei-security-lgpd/SKILL.md` | Obrigatório quando conteúdo tocar dado de usuário. |
| `Economizei app/Plano_Redes_Sociais.md` | Arquétipo "O Esperto do Bairro", paleta, tipografia, pilares por plataforma, cadência. |
| `marketing/AGENTES_MARKETING.md` | Os 5 agentes desenhados em maio/2026 (Caçador, Roteirista, Prospector, Analista, Sentry). |
| `marketing/tendencias/2026-05-*.md` | 3 exemplos reais de output do Caçador de Tendências — o padrão de qualidade a igualar ou superar. |
| `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` | As 3 camadas de valor (Ciência → Inteligência → Habilidade). |
| `scripts/estoque.mjs` | A ferramenta de leva da máquina de código. Você vai construir a análoga para conteúdo. |
| `scripts/check-firewall.mjs` | O modelo de um "check" que roda antes de entregar. |

### 2.2. Estado do projeto em uma tela (para você não precisar deduzir)

- **Produto:** bot de WhatsApp que lê foto de cupom fiscal com Gemini 2.5 Flash e devolve gasto
  classificado. Stack: Node ≥22, Express, Z-API, Supabase, Railway. `origin/main` em `7ec39a6`
  (2026-08-30), 712/713 testes verdes.
- **Estágio:** pré-lançamento. **Zero usuários externos até agora.** Sem receita.
- **Empresa jurídica (BC, Canadá):** só a partir de **outubro/2026**. Até lá: **Meta Ads, Hotmart,
  Wise e afiliados estão bloqueados**. Monetização em escala está estruturalmente pausada.
- **Fundador:** Gabriel, solo, ~12h/semana, mora em Vancouver, praça-alvo é Fernandópolis-SP.
- **Métrica que manda hoje:** retenção W2 (≥30% é o gate que libera escalar aquisição — regra 7).
- **Zero atrito é o produto.** WhatsApp é o canal. Foto do cupom é o gesto mínimo.

### 2.3. ⚠️ Esta ideia já morreu uma vez — leia antes de repetir

Em maio/2026 o `marketing/AGENTES_MARKETING.md` desenhou 5 agentes autônomos de marketing. **Só o
Caçador de Tendências rodou — 3 arquivos (22, 23 e 25 de maio) — e parou.** O Roteirista, o
Prospector, o Analista e o Sentry nunca produziram nada.

**A causa não foi qualidade** — os 3 arquivos de tendências são bons (dado do IPCA, PEIC, hooks
concretos com racional). **A causa foi que a esteira parava no roteiro.** Roteiro não é peça
publicável; roteiro é lição de casa pro Gabriel. E lição de casa acumulada vira dívida, e dívida
vira abandono.

> **Consequência de desenho, inegociável:** a unidade de saída desta máquina é **o vídeo pronto
> para publicar**, não o roteiro. Se a máquina entregar roteiro, ela falhou no mesmo lugar.

---

## 3. As 16 decisões já tomadas — NÃO reabrir

Fechadas com o Gabriel em 4 rodadas de perguntas, em 2026-09-03.

| # | Decisão | Valor travado |
|---|---|---|
| 1 | **Gate humano** | Espelho da máquina de código: a máquina produz uma **leva no estoque**, o Gabriel revisa e **publica com a própria mão**. A máquina **nunca publica**. |
| 2 | **Rosto** | Gabriel **não aparece**. Nenhuma peça mostra o rosto dele. |
| 3 | **Voz** | **A voz do Gabriel**, em regime **híbrido**: clone de voz (ElevenLabs) para o volume semanal + **gravação real** nas peças-âncora. |
| 4 | **Visual** | **Dado animado** (números, gráficos, comparação lado a lado) **e** **b-roll generativo** — os dois são válidos, alternando por tipo de pauta. |
| 5 | **Fonte dos números** | **Misto faseado.** Fase 1: só dado público verificável com fonte na tela. Fase 2: dado agregado do próprio `precos_mercado` quando houver massa crítica, com gatilho explícito. |
| 6 | **Canais** | **TikTok (principal) + Instagram Reels (mesmo ativo).** Nada de YouTube Shorts no piloto. |
| 7 | **Volume** | **3 peças por semana**, publicadas nos dois canais. |
| 8 | **Arquitetura** | **Espelho da máquina de código:** `AGENDA_CONTEUDO.md` + `estoque_conteudo/` + scripts Node no próprio repo + scheduled task no Cowork. Nada de n8n, Make ou SaaS de conteúdo. |
| 9 | **Orçamento** | **Até ~R$150/mês** em ferramentas (estimativa a confirmar na contratação). |
| 10 | **CTA** | **WhatsApp do bot, direto.** Sem landing intermediária. |
| 11 | **Métrica** | **Cascata de 3 níveis:** retenção 3s → saves+compartilhamentos → mensagens novas no bot. Cada nível só é julgado se o anterior passou. |
| 12 | **Atribuição** | **Link `wa.me` com texto pré-preenchido**, um por peça. Exige uma tarefa de código no bot (ver 9.2). |
| 13 | **Loop de aprendizado** | **Manual:** o Gabriel cola o export semanal, a máquina recalibra. **API de analytics fica em aberto** — só se 3 min/semana provarem não bastar. Não construir OAuth agora. |
| 14 | **Kill switch** | **Revisão obrigatória a cada 10 peças publicadas.** A máquina para sozinha e pede veredicto. |
| 15 | **Perfil** | Conta da **marca @economizei**, narrada por voz humana (a do Gabriel). Sem perfil pessoal. |
| 16 | **Praça** | **Brasil**, com **1 a cada 5 peças** ancorada em Fernandópolis / noroeste paulista. |
| 17 | **Ritmo** | Roda **1x por semana**, entrega **1 lote de 3**. Custo-alvo do Gabriel: **~40 min/semana** (30 revisando + 10 publicando). |

---

## 4. Restrições herdadas do projeto — valem aqui igual

Estas vêm da seção 11 do `CLAUDE.md` e **não são negociáveis nesta máquina**:

1. **Regra 3 — a máquina não fecha o ciclo sozinha.** Na máquina de código, ela não usa git; aqui,
   **ela não publica**. O gate é a mão do Gabriel, sempre.
2. **Regra 4 — gíria informal SÓ em marketing.** Boa notícia: roteiro de vídeo **é** marketing, então
   "cê / tá / né / ó / rapaz" estão liberados **no roteiro falado**. Continuam **proibidos** em
   qualquer texto de bot, landing ou doc que a máquina venha a escrever.
3. **Regra 5 — zero benefício prometido.** Nenhuma peça promete desconto, mês grátis, preço travado
   ou vantagem de "quem entrar agora". Nada.
4. **Regra 6 — sem estimativa de tempo.** Gatilhos por métrica ou volume ("a cada 10 peças"), nunca
   por semana numerada.
5. **Regra 7 — W2 ≥ 30% é o gate de escala.** Conteúdo orgânico pode rodar antes disso (é grátis),
   mas **nenhum real de mídia paga** sai desta máquina. Se a peça performar, a resposta é *mais
   conteúdo orgânico*, não impulsionamento.
6. **Regra 12 — pedido não é ordem cega.** Se algo neste prompt tiver atrito real, pare e aponte
   antes de executar.
7. **Regra 13 — nome de mercado real** só em contexto neutro ou positivo de hábito, como slot
   variável (`[mercado local]`) no roteiro. **Nunca** "o mercado X está te roubando". Nunca implicar
   parceria ou endosso.
8. **Regra 14 — verificar estado, não aceitar resumo.** Antes de registrar qualquer coisa como
   feita, olhe o arquivo, a pasta, o vídeo renderizado. O gargalo histórico deste projeto **não é
   produzir; é consumir e registrar o que já foi produzido.**
9. **Teste de Norte** (seção 1.5 do `CLAUDE.md`) aplicado a **toda peça**: *"o espectador sai
   sabendo algo sobre o dinheiro dele que ele não sabia antes?"* Se a resposta é não, **a peça não
   entra no lote** — por mais bonita que esteja.
10. **Classificação é o coração** (regra 1). Se alguma peça usar dado saído da classificação de
    itens do bot, ela herda todo o rigor: dado errado publicado é pior que dado ausente.

---

## 5. 🛑 O risco que molda o desenho inteiro — leia com atenção

Este não é um detalhe de compliance. É a razão de metade das decisões de arquitetura.

### 5.1. O que as plataformas fazem hoje (pesquisa de 2026-09-03)

- **YouTube** renomeou a política de "repetitious content" para **"inauthentic content"** e ampliou
  a definição. Ela tem 3 categorias — e a terceira é, literalmente, **"conteúdo em que personas de
  IA discutem temas sensíveis, como saúde e finanças"**. Em janeiro de 2026 houve uma onda de
  suspensão em massa de canais. O sistema é de 3 strikes: aviso → suspensão de 90 dias → remoção
  permanente do programa de parceiros.
- **TikTok** exige rótulo em conteúdo de IA que retrate pessoas ou cenas realistas, e **auto-detecta
  via C2PA Content Credentials mesmo sem auto-declaração**. Conteúdo pego pelo classificador **sem**
  ter sido declarado recebe **penalidade maior** do que conteúdo declarado proativamente.
- **Meta (Instagram)** aplica tag "AI info" em conteúdo realista gerado por IA.
- **Isenção que vale pra você:** usos de *production-assist* — legenda automática, rascunho de
  roteiro, correção de cor, sugestão de hashtag — **não exigem declaração em nenhuma das três**.

### 5.2. O que isso significa para esta máquina, em concreto

O perfil que as plataformas estão punindo é: **conteúdo sobre finanças + gerado em massa + no mesmo
template + narrado por persona sintética + sem valor humano agregado.** É quase uma descrição do que
uma máquina de conteúdo mal desenhada produz.

**As três defesas que já estão embutidas nas decisões da seção 3:**

| Defesa | Como aparece no desenho |
|---|---|
| **Voz humana real** | Decisão 3. A narração é a voz do Gabriel — clonada com consentimento dele, e com peças-âncora gravadas de verdade. Não é uma persona de IA: é uma pessoa real com um clone da própria voz. |
| **Dado verificável com fonte na tela** | Decisão 5. Todo número tem origem rastreável (IBGE, SEFAZ) exibida no rodapé. Isso é o oposto de "low-effort templated content" — é trabalho de apuração. |
| **Rotação anti-template obrigatória** | Seção 11.3. A máquina é **proibida** de repetir estrutura de abertura em peças consecutivas e formato em 3 seguidas, e mantém um histórico para se auto-policiar. |

**A quarta defesa, que é sua responsabilidade construir:** o **checklist de disclosure por peça**
(seção 10.3). Toda peça sai do estoque com a decisão de rótulo já tomada e escrita, para o Gabriel
só apertar o toggle certo na hora de publicar.

> **Regra de disclosure:** na dúvida, **declara**. O custo de declarar é aproximadamente zero. O
> custo de não declarar e ser pego pelo classificador é alcance reduzido e strike.

---

## 6. Arquitetura — espelho da Máquina de Código

### 6.1. Artefatos e pastas a criar

```
C:\Economizei\
├── AGENDA_CONTEUDO.md              # fila viva de pautas + protocolo + painel do Gabriel
├── estoque_conteudo/               # (gitignored) levas prontas, não publicadas
│   └── NNNN_AAAA-MM-DD/
│       ├── LEVA.md                 # manifesto do lote (ver 6.4)
│       ├── peca-1-<slug>/
│       │   ├── video.mp4           # 9:16, 1080x1920, ≤60s — O ENTREGÁVEL
│       │   ├── roteiro.md          # hooks testados, tempos, texto de tela
│       │   ├── legenda.txt         # legenda pronta pra colar (≤200 caracteres)
│       │   ├── hashtags.txt        # 3 hashtags, nunca 30
│       │   ├── fontes.md           # cada número → fonte + data + link
│       │   ├── link_wa.txt         # link wa.me com código de atribuição
│       │   ├── disclosure.md       # decisão de rótulo de IA, por plataforma
│       │   └── audio/              # narração + (se houver) slot de gravação real
│       ├── peca-2-<slug>/
│       └── peca-3-<slug>/
├── conteudo/
│   ├── pauta/AAAA-SS.md            # radar semanal: ângulos ranqueados + racional
│   ├── dados/                      # cache dos dados públicos coletados + fontes.json
│   ├── metricas/                   # exports que o Gabriel cola (CSV/print)
│   ├── historico_formato.json      # o que já foi usado (anti-template)
│   ├── DIARIO_CONTEUDO.md          # o que a máquina aprendeu, lote a lote
│   └── REVISAO_10_PECAS_N.md       # veredicto obrigatório a cada 10 peças
├── scripts/conteudo/
│   ├── radar.mjs                   # estágio 1
│   ├── verificar.mjs               # estágio 3 — o "firewall" do conteúdo
│   ├── render.mjs                  # estágio 5
│   ├── empacotar.mjs               # estágio 6
│   └── estoque-conteudo.mjs        # análogo do scripts/estoque.mjs
└── remotion/                       # composições de vídeo parametrizadas
```

**Adicionar `estoque_conteudo/` ao `.gitignore`** (mesmo tratamento de `estoque/`). Vídeo é binário
pesado e não deve versionar. Roteiro, pauta, diário e métricas **entram no git** (são a memória).

### 6.2. O pipeline em 7 estágios

```
1. RADAR ──► 2. ROTEIRO ──► 3. VERIFICAÇÃO ──► 4. ÁUDIO ──► 5. RENDER ──► 6. LEVA ──► [GABRIEL]
                                    │                                                    │
                                    └── reprova ──► peça não avança                      │
                                                                                          ▼
                                                                    7. APRENDIZADO ◄── publica + cola métrica
```

**Estágio 1 — RADAR (pauta).** Coleta sinal e propõe ângulos ranqueados para a semana.
- Fontes: **IBGE / API SIDRA** (IPCA e IPCA-15 por subitem — dá "quanto subiu o arroz, o café, a
  carne"), **Menor Preço Brasil** (SEFAZ, preços reais de NFC-e por região), calendário de divulgação
  do IBGE (postar 48h **antes** do número sair é o truque que o Caçador já tinha achado), e o
  `precos_mercado` do próprio Supabase **quando a Fase 2 abrir** (ver 8.3).
- Saída: `conteudo/pauta/AAAA-SS.md` com **5 ângulos**, cada um com: dado central, fonte, tipo de
  pauta (dos 7 da skill), por que funciona, e qual persona ataca.
- Reusa o padrão de qualidade dos arquivos em `marketing/tendencias/` — leia os 3 antes.

**Estágio 2 — ROTEIRO.** Escolhe 3 dos 5 ângulos e escreve a peça.
- Carrega `economizei-content-engine` (estrutura, hooks, tipos de pauta) e `economizei-copywriter`
  (voz). **Não reinvente essas duas — elas já estão escritas e aprovadas.**
- Saída por peça: 3 hooks alternativos (o escolhido + 2 de reserva), roteiro com tempos, texto de
  tela por trecho, descrição visual concreta (não "imagens de supermercado"), legenda, hashtags, CTA.
- **Duração-alvo: 20–40s.** Reels aceita até 90s pela API, mas a skill é clara: cabe em ≤30s.

**Estágio 3 — VERIFICAÇÃO (o gate automático).** `scripts/conteudo/verificar.mjs`.
- **BLOQUEANTE:** todo número que aparece no roteiro, no texto de tela ou na legenda **precisa de
  entrada correspondente em `fontes.md`** com fonte + data + link. Número órfão = peça não avança.
  Este é o único item bloqueante, porque é o único que o olho humano não pega de forma confiável.
- **ADVISORY (avisa, o Gabriel julga):** menção a preço de plano, promessa quantificada de economia,
  garantia, nome de mercado real, feature que não existe no produto, superlativo sem lastro.
- Espelha `scripts/check-firewall.mjs` no formato de saída (lista o que achou, com arquivo e linha).

**Estágio 4 — ÁUDIO.** Narração na voz do Gabriel.
- **Rota A (volume, 2 de 3 peças):** clone de voz via ElevenLabs. O Gabriel grava ~3 min de
  referência **uma única vez**.
- **Rota B (peça-âncora, 1 de 3):** a máquina gera o roteiro e deixa um **slot de gravação** —
  `audio/GRAVAR_ISTO.md` com o texto formatado para leitura, e o render aceita o arquivo que o
  Gabriel dropar na pasta. Se ele não gravar até a hora de publicar, a peça-âncora **cai para a rota
  A com aviso no `LEVA.md`** — a máquina nunca fica travada esperando o humano.
- Saída: arquivo de áudio + timestamps por palavra (para legenda queimada sincronizada).

**Estágio 5 — RENDER.** Monta o vídeo 9:16, 1080×1920, H.264, ≤60s.
- Dois modos de composição, alternados conforme o tipo de pauta:
  - **DADO ANIMADO** (padrão para comparação de preço): números grandes, barras, comparação
    lado a lado, uso da paleta oficial (`#1A6B3C` primária, `#72C442` acento, `#0F1F14` texto,
    `#F4F7F4` fundo, `#C94040` alerta) e tipografia Inter/Sora do `Plano_Redes_Sociais.md`.
  - **B-ROLL GENERATIVO** (para POV, história, mito-vs-verdade): cenas geradas + texto por cima.
    **Usar com parcimônia** — é o item caro do orçamento e o que mais pede rótulo de IA.
- **Legenda queimada obrigatória** em toda peça (a maioria assiste sem som).
- **Rodapé de fonte obrigatório** em toda peça que exibe número: `fonte: IBGE/IPCA · ago 2026`.

**Estágio 6 — LEVA.** Empacota as 3 peças no `estoque_conteudo/NNNN_AAAA-MM-DD/` com o `LEVA.md`,
atualiza a `AGENDA_CONTEUDO.md`, e **para**. Mostra ao Gabriel um resumo com mapa peça→arquivos e
quais skills usou.

**Estágio 7 — APRENDIZADO.** Depois que o Gabriel publica e cola o export em `conteudo/metricas/`:
- A máquina cruza métrica × peça (hook, tipo de pauta, formato visual, rota de voz, tema, dia/hora).
- Escreve em `conteudo/DIARIO_CONTEUDO.md`: o que ganhou, o que perdeu, e **qual hipótese testar no
  próximo lote**.
- O radar da semana seguinte **nasce enviesado** pelo diário. É isto que faz dela uma máquina.

### 6.3. Estados de uma peça

Espelham os da `AGENDA.md`:

```
  (pauta)  ──►  em-producao  ──►  em-revisao (no estoque)  ──►  publicada  ──►  medida
                     │                        │
                     │                        └── descartada pelo Gabriel ──► volta pra pauta
                     └── bloqueada-humano (falta dado, falta gravação, decisão de produto)
```

### 6.4. As 3 Regras do estoque de conteúdo

Espelham as 2 Regras do regime ESTOQUE de código, com uma a mais:

- **REGRA 1 — Cadeia.** Cada leva nasce numerada em sequência (`0001`, `0002`, …) e registra no
  `historico_formato.json` o que usou, para a leva seguinte não repetir (ver 11.3).
- **REGRA 2 — Teto de estoque.** **2 levas não publicadas = estoque cheio: a máquina não produz.**
  (O teto de código é 4 levas / ~1200 linhas; aqui é 2 lotes / 6 peças, porque conteúdo envelhece —
  peça sobre o IPCA de agosto não serve em outubro.)
- **REGRA 3 — Validade.** Peça com dado datado carrega `validade:` no `LEVA.md`. Passou da validade
  sem publicar, a máquina **marca como vencida** e não deixa o Gabriel publicar número velho.

**Modelo do `LEVA.md`:**

```markdown
# LEVA 0007 — 2026-09-10

- lote: 3 peças
- validade: 2026-09-24 (peça 2 usa IPCA de agosto)
- rota de voz: peça 1 clone · peça 2 clone · peça 3 GRAVAÇÃO PENDENTE
- disclosure: peça 1 não exige · peça 2 não exige · peça 3 exige (b-roll generativo)
- ancora local: peça 2 (Fernandópolis)
- verificacao: verde (0 números órfãos, 1 aviso advisory na peça 3)
- skills usadas: content-engine, copywriter, financial-firewall, glossario
- pendencias: peça 3 espera gravação até 12/09, senão cai pra clone

## Peça 1 — <slug>
tipo de pauta · hook escolhido · dado central · fonte · link wa.me · como testar

## Peça 2 — ...
## Peça 3 — ...
```

---

## 7. Stack técnica — recomendação e alternativas

> ⚠️ **Todos os valores abaixo são estimativas de mercado levantadas em 2026-09-03 e precisam ser
> confirmados no ato da contratação.** Nenhum deles deve virar premissa de orçamento sem o Gabriel
> conferir o preço vigente. Teto travado: **~R$150/mês** (decisão 9).

| Camada | Recomendado | Estimativa | Alternativas |
|---|---|---|---|
| **Render de vídeo** | **Remotion** (React, self-host, roda no Node que você já tem) | Licença gratuita no porte de 1 pessoa — **confirmar no site**; render local custa ~R$0 | JSON2Video (~US$17–49/mês) · Creatomate (~US$54/mês, cobra TTS à parte) · Shotstack (~US$25–49/mês) |
| **Clone de voz** | **ElevenLabs** (clone da voz do Gabriel) | plano de entrada ~US$5–22/mês | — (é a peça que mais define a qualidade percebida; não economizar aqui) |
| **TTS de fallback** | **Google Cloud TTS** pt-BR | 1M caracteres/mês grátis; depois ~US$16/1M | Azure (~US$16/1M, 500k grátis) |
| **B-roll generativo** | usar **com parcimônia**, 1 peça a cada 2–3 lotes | orçar ~R$40/mês e não passar disso | — |
| **Publicação** | **manual, pelo celular do Gabriel** | R$0 | ver 7.1 antes de considerar automatizar |
| **Legenda/transcrição** | timestamps do próprio TTS; Whisper local para a rota de gravação real | R$0 | — |

**Por que Remotion e não uma API de render:** o projeto já é Node, já tem testes, já tem regime de
revisão de diff. Composição em React entra no git, é versionável, testável e **não tem custo por
minuto renderizado** — o que importa quando o volume é 12 peças/mês e o teto é R$150.

### 7.1. Sobre publicar por API — por que NÃO agora

Levantamento de 2026-09-03, para ficar registrado e não ser reaberto por engano:

- **TikTok Content Posting API:** exige app registrado, escopos, OAuth **e uma auditoria de 2–4
  semanas com múltiplas rodadas de feedback**. **Enquanto o cliente não passa na auditoria, todo
  post sai `SELF_ONLY`** — ou seja, só o próprio criador vê. Limite ~15 posts/dia por conta.
- **Instagram:** exige conta Business/Creator + Graph API; limite entre 25 e 100 posts por 24h
  conforme a conta; Reels 9:16, H.264/HEVC, 5–90s.
- **Agregadores** (que resolvem a auditoria por você): upload-post (~US$16/mês, tem tier grátis de
  10 uploads), Postiz (open-source, self-host, ou ~US$29/mês), Blotato (~US$29/mês), Ayrshare
  (~US$149/mês).
- **Não existe MCP nativo de publicação** no registry de conectores — só vidIQ (pesquisa) e Canva
  (design).

**Conclusão:** automatizar a publicação custa 2–4 semanas de auditoria ou uma assinatura, para
economizar **10 minutos por semana** do Gabriel — e ainda quebra a decisão 1 (o gate humano).
**Não construir.** Reavaliar só se a revisão das 10 peças mostrar que o volume vai subir muito.

---

## 8. Fontes de dado e como usá-las

### 8.1. Fase 1 — dado público verificável (começa aqui)

| Fonte | O que dá | Como acessar |
|---|---|---|
| **IBGE / API SIDRA** | IPCA e IPCA-15 por subitem — "arroz subiu X%, café caiu Y%" — série desde 1979 | API pública de dados agregados, sem chave |
| **Menor Preço Brasil (SEFAZ)** | Preços reais praticados, extraídos de NFC-e, por região | App/portal oficial (Procergs/SEFAZ-RS); **verificar se há endpoint público ou se exige raspagem — se exigir, PARE e pergunte ao Gabriel antes** |
| **Calendário de divulgação do IBGE** | Datas do IPCA/IPCA-15 → janela de 48h para postar antes da manchete | Portal do IBGE |

**Regra de uso:** todo dado coletado vai para `conteudo/dados/` com carimbo de data e link. O
`fontes.md` de cada peça aponta para lá. Dado sem procedência não vira peça — sem exceção.

### 8.2. Proibido inventar número

Se um ângulo bom não tem dado que o sustente, **o ângulo morre**. Não arredondar "para ficar
melhor", não usar "cerca de", não citar "estudos mostram". O produto inteiro se chama Economizei e
vende confiança em número — publicar um número frouxo custa mais do que a peça vale.

### 8.3. Fase 2 — dado próprio (o diferencial defensável)

O `precos_mercado` do Supabase, alimentado por cupons reais, é o único ativo que nenhum concorrente
copia. Mas hoje o volume é quase zero.

**Gatilho de virada (a definir com o Gabriel, mas o executor deve propor um número):** algo como
*"quando houver ≥N cupons de ≥M mercados distintos numa mesma praça, o radar passa a poder gerar
peça com dado próprio"*. Até lá, **Fase 1 apenas**.

**Quando a Fase 2 abrir, a skill `economizei-security-lgpd` é obrigatória** e valem estas travas:
só dado **agregado e anonimizado**; nunca item de um cupom individual; nunca nome, CPF, número ou
qualquer coisa que identifique alguém; nunca "um usuário nosso gastou X". Mínimo de N observações
por agregado antes de virar número público.

---

## 9. Sistema de métricas

### 9.1. A cascata de 3 níveis

Cada nível só é julgado se o anterior passou. Isso evita o erro clássico de matar uma boa pauta por
causa de um hook fraco.

| Nível | Mede | Pergunta que responde | O que fazer se falhar |
|---|---|---|---|
| **1 — Retenção nos 3s** | % que não deu scroll | O **hook** funciona? | Trocar o hook (os 2 de reserva estão no `roteiro.md`) e repostar o mesmo conteúdo |
| **2 — Saves + compartilhamentos** | Intenção real | O **conteúdo** tem valor? | Manter o hook, trocar o assunto/ângulo |
| **3 — Mensagens novas no bot** | Conversão | O **CTA** converte? | Manter tudo, mexer só no CTA e no link |

**Linha de base — leia com atenção:** o Gabriel **não tem histórico**, então **cravar um limiar hoje
seria número chutado** (viola a regra 6). Logo:

- **Peças 1–10:** a máquina **coleta e registra, mas não julga**. Nenhuma peça é declarada morta.
  O objetivo dessas 10 é construir a linha de base.
- **A partir da peça 11:** os limiares saem do **próprio histórico** — por exemplo, "acima da mediana
  das 10 primeiras = replicar; abaixo do 1º quartil = matar o formato". Os limiares ficam escritos
  em `conteudo/DIARIO_CONTEUDO.md` e são revisados a cada 10 peças.

### 9.2. Atribuição — a tarefa de código que isto exige

Cada peça carrega um link `wa.me` próprio com **texto pré-preenchido**:

```
https://wa.me/<numero-do-bot>?text=oi%20%23ec-arroz-set
```

A pessoa abre o WhatsApp com a mensagem já escrita e só aperta enviar — **zero atrito preservado**.
O bot lê o código na primeira mensagem e grava a origem.

> **✅ Achado da verificação (2026-09-03): o mecanismo já está em uso e o número já existe.** A
> `landing/index.html` já usa `https://wa.me/5517996440062?text=...` em vários CTAs, inclusive com
> texto longo e distinto por plano (`"Quero assinar o Individual no anual..."`). Ou seja: o padrão
> funciona, o número do bot é o **5517996440062**, e não há nada a inventar aqui.
>
> **O que isso revela, e é o ponto:** essas mensagens chegam ao bot **hoje**, com a intenção escrita
> dentro delas, e **ninguém está capturando isso**. A landing já diz de onde a pessoa veio e o
> produto joga fora. A tarefa `cod-XXXX` de atribuição, portanto, não serve só ao conteúdo — ela
> conserta um buraco que já existe. Escrever isso no objetivo da tarefa.
>
> **Cuidado obrigatório na tarefa:** os textos da landing não podem quebrar. O parser de origem tem
> que conviver com `"oi"`, com `"Quero assinar o Individual no anual (R$99/ano...)"` e com o novo
> `"oi #ec-<slug>"` — e qualquer coisa não reconhecida segue o fluxo normal, sem erro. Reconhecer
> origem é *fail-open*: na dúvida, atende a pessoa e registra origem vazia.

> ⚠️ **Isto NÃO é trabalho desta máquina.** É uma tarefa de **código do bot**, que precisa entrar na
> `AGENDA.md` principal como uma `cod-XXXX` normal, com teste, e passar pelo `/entregar`. Ela
> provavelmente exige **uma migration** (`usuarios.origem`), e migration é **zona humana** — só o
> Gabriel roda no Supabase.
>
> **O que o executor deve fazer:** escrever a tarefa no formato-molde da `AGENDA.md` (id, tipo,
> porte, skills, objetivo, arquivos-alvo, critérios de aceite, fora-de-escopo) e deixá-la pronta na
> fila. **Não implementar por conta própria** — o pipeline de mensagem do bot é território do
> `/tarefa`, não desta máquina.
>
> Enquanto essa tarefa não estiver no ar, o **Nível 3 da cascata fica cego** — e o `LEVA.md` deve
> dizer isso explicitamente, em vez de fingir que mede.

### 9.3. O loop manual (decisão 13)

1x/semana o Gabriel salva o export do TikTok/Instagram em `conteudo/metricas/AAAA-SS/`. Formato
aceito: CSV, print, ou até texto colado — a máquina se vira. Ela cruza com o que produziu, atualiza
o `DIARIO_CONTEUDO.md` e enviesa o radar seguinte.

**Não construir integração OAuth agora.** A decisão foi: manual, e reavaliar se 3 min/semana não
bastarem. Se o executor achar que vale antecipar, ele **aponta e espera** — não constrói.

### 9.4. Kill switch — revisão a cada 10 peças

Na **10ª, 20ª, 30ª peça publicada**, a máquina:

1. **Para de produzir.** Não gera lote novo.
2. Escreve `conteudo/REVISAO_10_PECAS_N.md` com: as 10 peças, os 3 níveis de métrica de cada uma, o
   que os vencedores têm em comum, o que os perdedores têm em comum, e **um veredicto recomendado**:
   `REPLICAR` (o formato funciona, aumentar) · `PIVOTAR` (o formato não, mas o tema sim) ·
   `MATAR` (nem o formato nem o tema — a hipótese do conteúdo orgânico não se sustentou).
3. **Só volta a produzir depois que o Gabriel escrever a decisão dele no arquivo.**

Isso espelha o gatilho de "10 runs" que a máquina de código já usa, e existe porque o
`AGENTES_MARKETING.md` morreu sem que ninguém declarasse que tinha morrido.

---

## 10. Guarda-rails

### 10.1. Firewall financeiro de conteúdo

O `scripts/conteudo/verificar.mjs` roda **antes de empacotar** e varre roteiro + texto de tela +
legenda:

**🔴 BLOQUEANTE (peça não avança):**
- Número sem entrada correspondente em `fontes.md`.

**🟡 ADVISORY (lista para o Gabriel julgar na revisão):**
- Preço de plano (R$9,90 / R$15 / R$22 / R$99 / R$150 / R$220), `is_pro`, "assine", "plano".
- Promessa quantificada de economia: "economize R$X", "você vai economizar Y%".
- Garantia, "grátis para sempre", "preço travado", benefício de fundador (**regra 5 do CLAUDE.md**).
- Nome de mercado real em contexto negativo (**regra 13**).
- Feature que o produto não tem hoje — atenção especial ao **"alerta preditivo"**, que o `/planos`
  já promete e **ainda não existe** (achado B9 do Checkpoint N2). Não repetir a mentira em vídeo.
- Superlativo sem lastro ("o melhor", "o único", "ninguém mais faz").

Carregar a skill `economizei-financial-firewall` sempre que houver número, preço ou promessa.

### 10.2. LGPD

- Nenhuma peça exibe cupom real de usuário, nome, número, CPF ou print de conversa sem
  pseudonimização completa.
- Print do bot em vídeo: usar **conversa de demonstração criada para isso**, nunca a de um usuário.
- Fase 2 (dado próprio) só com a skill `economizei-security-lgpd` carregada e agregação mínima.

### 10.3. Disclosure de IA — o arquivo `disclosure.md` de cada peça

A máquina decide e escreve, o Gabriel só executa na hora de publicar:

| O que a peça usou | TikTok | Instagram | Regra |
|---|---|---|---|
| Só dado animado + **voz real gravada** | não exige | não exige | production-assist é isento |
| Dado animado + **voz clonada** | **declarar** | **declarar** | áudio sintético realista, mesmo sendo a própria voz |
| **B-roll generativo** (qualquer cena) | **declarar** | **declarar** | cena sintética realista |
| Legenda automática, rascunho de roteiro, correção de cor | não exige | não exige | isenção explícita das três plataformas |

O `disclosure.md` traz: o que a peça usou, se exige rótulo, **qual toggle apertar em cada
plataforma**, e o texto do rodapé de crédito quando houver.

> **Na dúvida, declara.** Ser pego pelo classificador sem ter declarado tem penalidade maior do que
> ter declarado.

### 10.4. Zona proibida desta máquina

A Máquina de Conteúdo **nunca**:

- Publica em qualquer plataforma (decisão 1).
- Cria, conecta ou autentica conta em rede social.
- Gasta dinheiro — nenhuma contratação, assinatura ou compra de crédito sem o Gabriel.
- Toca em `src/` do bot, `supabase/`, `.env*`, `package.json`, `Dockerfile`, `Procfile`,
  `scripts/check-firewall.mjs`. (A tarefa de atribuição da 9.2 vai pela `AGENDA.md` normal.)
- Usa comando de **escrita** do git. Leitura só com `GIT_OPTIONAL_LOCKS=0` (regra 3 do `CLAUDE.md` —
  o disco montado não permite apagar arquivo, e a 2ª escrita trava o repositório para sempre).
- Promete benefício, desconto ou vantagem a quem entrar agora (regra 5).
- Publica número sem fonte.

---

## 11. Pauta — pilares, tipos e a rotação anti-template

### 11.1. Reusar o que já existe

Os **7 tipos de pauta** estão na skill `economizei-content-engine` (comparação chocante · conta da
história · mito vs verdade · POV · persona Carla/Bruno/Marina · hack de supermercado · reaction a
cupom) e os **3 pilares por plataforma** estão no `Plano_Redes_Sociais.md`. **Não criar taxonomia
nova.** Se faltar alguma coisa, propor como adição às skills existentes.

### 11.2. Distribuição obrigatória por lote de 3

- **≥1 peça de comparação de preço com número** (é o tema que o Gabriel pediu, e o que sobe a
  escada Ciência → Inteligência).
- **≤1 peça de b-roll generativo** (custo e rótulo).
- **1 a cada 5 peças é âncora local** — Fernandópolis / noroeste paulista (decisão 16). Na prática:
  uma peça-âncora a cada ~2 lotes.
- **1 a cada 3 peças usa a rota de gravação real** da voz (decisão 3).

### 11.3. Rotação anti-template — a regra que protege o alcance

O `conteudo/historico_formato.json` registra, por peça: tipo de pauta, estrutura de abertura,
duração, modo visual, rota de voz, e tema.

**Proibições que a máquina se aplica sozinha:**

- Mesma **estrutura de abertura** em 2 peças consecutivas.
- Mesmo **tipo de pauta** em 3 peças seguidas.
- Mesmo **modo visual** (dado animado / b-roll) em 4 peças seguidas.
- Mesma **duração ±3s** em 3 peças seguidas.
- Frase **"Você sabia que..."** — em nenhuma peça, nunca (a skill já marca como hook morto).

Se uma restrição travar a produção, a máquina **relata e produz 2 peças em vez de 3** — nunca quebra
a rotação para bater a meta. Volume não é a métrica; alcance é. E template repetido é exatamente o
que derruba alcance hoje.

---

## 12. O que entregar, em ordem

**Pare no fim de cada fase e mostre ao Gabriel. Não emende fases.**

### Fase 0 — Desenho + prova de conceito manual (sem esteira ainda)

1. `Economizei app/Desenho_Maquina_Conteudo_AAAA-MM-DD.md` — arquitetura, decisões desta sessão,
   riscos, e as perguntas em aberto.
2. `AGENDA_CONTEUDO.md` — protocolo, formato de pauta, estados, as 3 Regras do estoque, painel
   "Ações do Gabriel", e as 5 primeiras pautas já escritas.
3. Esqueleto de pastas (seção 6.1) + `.gitignore` atualizado.

> ⚠️ **O `.gitignore` tem 3 linhas (`node_modules`, `.env`, `estoque/`) e a última NÃO termina em
> quebra de linha.** Acrescentar `estoque_conteudo/` sem cuidado gruda no `estoque/` e desliga o
> ignore das duas pastas de uma vez — trabalho não publicado e vídeo binário entrariam no git sem
> ninguém notar. Editar com atenção e conferir com `git check-ignore -v estoque/ estoque_conteudo/`
> (leitura, com `GIT_OPTIONAL_LOCKS=0`) antes de seguir.
4. **UMA peça-piloto completa, feita à mão, de ponta a ponta** — pauta → roteiro → verificação →
   áudio → vídeo renderizado → `LEVA.md`. Com dado público real e fonte na tela.

> **A peça-piloto é o entregável mais importante da Fase 0.** Ela prova que o fluxo fecha antes de
> qualquer automação. Se a peça-piloto não ficar boa o suficiente para o Gabriel publicar, **a
> máquina não deve ser construída ainda** — o problema está no formato, não na esteira.

### Fase 1 — A esteira

5. `scripts/conteudo/radar.mjs` — coleta IBGE/SIDRA + Menor Preço, gera a pauta semanal.
6. `scripts/conteudo/verificar.mjs` — o firewall de conteúdo (10.1), com teste.
7. `scripts/conteudo/empacotar.mjs` + `estoque-conteudo.mjs` — leva, manifesto, teto, validade.
8. Composições Remotion parametrizadas (modo dado animado, com a paleta e a tipografia oficiais).
9. Testes em `test/` para toda lógica pura nova (TDD é regra do projeto — `economizei-tdd`).

### Fase 2 — Voz e render

10. Pipeline de áudio: clone (rota A) + slot de gravação (rota B) + timestamps para legenda.
11. `render.mjs` fechando o vídeo 9:16 com legenda queimada e rodapé de fonte.
12. Roteiro de setup do clone de voz: exatamente o que o Gabriel precisa gravar, e como.

### Fase 3 — Medição e aprendizado

13. `conteudo/metricas/` + o leitor de export + `DIARIO_CONTEUDO.md`.
14. `historico_formato.json` + a rotação anti-template ativa.
15. O gatilho das 10 peças + o template de `REVISAO_10_PECAS_N.md`.
16. **A tarefa de atribuição `wa.me` escrita na `AGENDA.md` principal**, no formato-molde, pronta
    para o `/tarefa` — não implementada aqui.
17. Scheduled task semanal no Cowork + o comando `/conteudo`.

> ⚠️ **`.claude/commands/` é protegido no Cowork — a máquina não escreve lá.** Hoje a pasta tem só
> `entregar.md` e `tarefa.md`. Então **não tente criar `conteudo.md` direto**: escreva o conteúdo do
> comando num arquivo à parte (ex: `conteudo_COMANDO.md` na raiz) e peça ao Gabriel para copiar.
> Motivo registrado: em 2026-08-07 um patch aplicado à mão em `tarefa.md` saiu **quebrado** (markdown
> corrompido, `GIT_OPTIONAL_LOCKS=0` faltando) e ficou **8 dias** assim, com a memória registrando
> como "corrigido". **Entregue o arquivo inteiro para substituição, nunca um patch parcial** — e
> peça ao Gabriel para confirmar que copiou, em vez de assumir.

---

## 13. Critérios de aceite

A máquina está pronta quando:

- [ ] Uma run semanal produz **3 peças com `video.mp4` renderizado**, sem intervenção humana no meio.
- [ ] Nenhum número aparece em vídeo sem fonte rastreável — **verificado pelo `verificar.mjs`, não
      pelo olho**.
- [ ] Toda peça sai com `disclosure.md` decidido, legenda, hashtags e link `wa.me` único.
- [ ] A revisão do lote inteiro cabe em **~30 minutos** do Gabriel (medir e registrar no `LEVA.md`).
- [ ] A máquina **respeita o teto de 2 levas** e para sozinha quando o estoque enche.
- [ ] A máquina **para sozinha na 10ª peça** e pede veredicto.
- [ ] A rotação anti-template está ativa e a máquina **prefere produzir menos a repetir formato**.
- [ ] Toda lógica nova tem teste e `npm run check` fica verde.
- [ ] Nenhum arquivo da zona proibida (10.4) foi tocado.
- [ ] O `DIARIO_CONTEUDO.md` mostra que o lote N+1 mudou por causa do resultado do lote N.

---

## 14. Perguntas que você DEVE fazer antes de executar

Se qualquer uma destas não estiver respondida no projeto, **pergunte ao Gabriel — não invente**:

1. ~~Número do WhatsApp do bot~~ — **já resolvido na verificação: `5517996440062`**, o mesmo que a
   `landing/index.html` usa. Só confirmar com o Gabriel que segue sendo o de produção.
2. **Handle da conta** (@economizei está disponível no TikTok e no Instagram?) — e as contas já
   existem ou precisam ser criadas? **Criar conta é ação do Gabriel, nunca sua.**
3. **Menor Preço Brasil tem endpoint público?** Se só houver raspagem, isso muda o desenho do radar e
   precisa de decisão dele antes de qualquer código.
4. **Gatilho da Fase 2** (dado próprio): qual N de cupons e M de mercados libera dado próprio?
5. **Dia da semana** em que a run roda (a sugestão é quinta, para o Gabriel revisar sexta e publicar
   segunda/quarta/sexta) — ratificar.
6. **Licença do Remotion** no porte de 1 pessoa: confirmar no site antes de adotar.
7. **O `verificar.mjs` deve ser bloqueante para "número sem fonte"?** A proposta é sim (é o único
   item que o olho não pega). Ratificar, já que o firewall de código hoje é advisory.
8. Se a peça-piloto da Fase 0 não agradar: **parar e repensar o formato**, ou seguir para a Fase 1
   assim mesmo?

---

## 15. Fora de escopo — não faça

- Publicar automaticamente em qualquer plataforma.
- Construir OAuth/API de analytics (decisão 13 — fica em aberto, reavaliar só depois).
- Qualquer coisa que dependa da empresa BC: Meta Ads, impulsionamento, Hotmart, afiliados.
- YouTube Shorts, LinkedIn, Facebook, X — o piloto é TikTok + Reels.
- Conteúdo em inglês ou para o mercado canadense (a semente de Vancouver é outra frente).
- Mexer no código do bot (a tarefa de atribuição vai pela `AGENDA.md` e pelo `/tarefa`).
- Criar taxonomia nova de pauta, nova identidade visual ou nova voz de marca — tudo isso já existe
  em `economizei-content-engine`, `economizei-copywriter` e `Plano_Redes_Sociais.md`.
- Prometer qualquer benefício, preço ou vantagem em peça de conteúdo.

---

## 16. Anexo — pesquisa de referência (2026-09-03)

Levantada na sessão que gerou este prompt, para o executor não precisar refazer:

**Publicação por API**
- TikTok Content Posting API: app registrado + escopos + OAuth + **auditoria de 2–4 semanas**; até
  passar, todo post é `SELF_ONLY`; ~15 posts/dia por conta.
- Instagram: conta Business/Creator + Graph API; 25–100 posts/24h; Reels 9:16, H.264/HEVC, 5–90s.
- YouTube Data API: upload passou a ter bucket próprio (~100 uploads/dia) desde jun/2026.
- Agregadores: upload-post (~US$16/mês, free tier de 10 uploads) · Postiz (open-source, self-host,
  ou ~US$29/mês) · Blotato (~US$29/mês) · Ayrshare (~US$149/mês).
- Não há MCP nativo de publicação no registry de conectores (só vidIQ e Canva).

**Políticas de IA**
- YouTube "inauthentic content" (jul/2025, ampliada): 3 categorias, incluindo **personas de IA
  discutindo temas sensíveis como saúde e finanças**; 3 strikes; onda de suspensões em jan/2026.
- TikTok: rótulo obrigatório em IA realista; auto-detecção via C2PA; penalidade maior para quem não
  declara e é pego.
- Meta: tag "AI info" em conteúdo realista.
- Isenção comum às três: production-assist (legenda, rascunho, cor, hashtag).

**Custos de produção**
- Render programático: US$0,10–0,84/min conforme o serviço; Remotion self-host ≈ centavos.
- TTS Google/Azure: ~US$16 por 1M de caracteres (um roteiro de 30s ≈ 500 caracteres).

*As fontes completas estão no histórico da sessão de 2026-09-03. Reconfirmar preço e política antes
de contratar ou publicar — plataforma muda regra sem aviso.*
