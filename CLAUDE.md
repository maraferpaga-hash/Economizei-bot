# 🧠 Memória Institucional — Economizei

> **🛠️ Sistema de skills ativo:** veja `E:\Economizei Bot\.claude\skills\README.md` (índice das 14 skills + 10 regras de ouro).
> **🚀 Instruções do projeto:** veja `E:\Economizei Bot\PROJECT_INSTRUCTIONS.md` (boot sequence + comportamentos default).
> Leia ambos no início de cada sessão, junto com este arquivo.

> Este arquivo é o **cérebro da empresa**. Leia-o no início de cada sessão para ter contexto completo
> sobre o produto, a estratégia e o estado atual da operação.
> Atualize-o sempre que houver decisões importantes, mudanças de direção ou novos aprendizados.

---

## 1. 🏢 Identidade da Empresa

**Nome:** Economizei
**Categoria:** SaaS / B2C
**Estágio:** Pré-lançamento — produto funcional (MVP testado uma vez sem escala), em fase de validação comercial
**Operação:** 1 pessoa (fundador, Gabriel), com vasto conhecimento em administração
**Restrição operacional:** ~12h/semana (média 10–14h, ver seção 6)
**Praça inicial de lançamento:** Fernandópolis-SP e região (interior noroeste de SP) — ver seção 7.1
**Última atualização:** 2026-06-06 (gastos por categoria + gráfico QuickChart + estrutura preços mercado + rastreio qualidade nome_canonico + resiliência leitura de cupons: Sharp + retry + dica documento)

> **📂 Arquitetura modular atual:**
> A modularização da memória institucional foi materializada via **sistema de skills** + **instruções de projeto**, não via quebra do CLAUDE.md em múltiplos `.md`.
> - `CLAUDE.md` (este arquivo) — estratégia, princípios, persona, pricing atual, stack atual, áreas reais, decisões em vigor, comandos recentes. Lido em toda sessão.
> - `.claude/skills/` — 14 skills operacionais (princípios, copy, debug, métricas, etc.). Disparam automaticamente por gatilho.
> - `PROJECT_INSTRUCTIONS.md` — boot sequence + comportamentos default + ritual de fim de sessão.
> - `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria crítica externa, pontos abertos.
> - `Economizei app/Projecao_6_meses.md` — projeção 3 cenários + gatilhos semáforo.
> - `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` — conteúdo arquivado (decisões revogadas, sessões antigas consolidadas).

### Missão
Ajudar brasileiros de classe B/C a gastar menos no supermercado, com zero esforço.

### Proposta de Valor
Bot de WhatsApp que analisa cupons fiscais via foto usando IA (Gemini 2.5). O usuário manda a foto, o bot classifica os gastos automaticamente — sem app, sem cadastro, sem fricção.

### Princípios Centrais

> **"Zero atrito é o produto."**
> Cada etapa que o usuário precise aprender é uma etapa a eliminar.
> O canal (WhatsApp) é o produto. A foto do cupom é o gesto mínimo possível.

> **"Bom, barato e útil — grátis funciona de verdade, pago é a versão melhor."** *(princípio do Gabriel)*
> Modelo Spotify, não freemium-trial. O free deve resolver a dor central; o pago é genuinamente melhor, nunca o grátis quebrado pra forçar upgrade. Capitalizar EM CIMA do produto, nunca pensando inverso.

---

## 2. 👥 Público-Alvo

**Persona principal:** Brasileiros Classe B/C, 25–55 anos

| Característica | Detalhe |
|----------------|---------|
| Comportamento de compra | Supermercados semanalmente, sensíveis ao preço |
| Relação com tecnologia | WhatsApp como app principal, baixa tolerância a atrito |
| Motivação | Saber para onde vai o dinheiro, economizar sem esforço, **ser esperto** |
| Dor | Gastam mais do que planejam e não sabem onde |
| Canal preferido | WhatsApp — já aberto, já confiável |

**NÃO é para:** early adopters tech, pessoas que querem planilhas complexas, usuários com alto letramento digital.

### Personas detalhadas (definidas em sessão 2026-05-08)

**Persona 1 — Carla, a Otimizadora (35–50 anos, classe B):** mora com marido + filhos, gasta R$1.000–1.500/mês. Já tentou planilha. Mensagem: "Economize sem virar contadora da casa".

**Persona 2 — Bruno, o Controlador (28–40 anos, classe B/C):** casal sem filhos, R$500–900/mês. Gatilho: ir com fome. Mensagem: "Saiba exatamente quanto gasta. Sem planilha, sem app".

**Persona 3 — Marina, a Filha Preocupada (25–40 anos, classe B):** já organizada, mãe/pai gasta descontroladamente, ela se preocupa. Plano-alvo: Família R$15. Mensagem: "Mostra pra sua mãe — você cuida, ela controla".

---

## 3. 💰 Modelo de Negócio (atualizado em 2026-05-22)

**Modelo:** Freemium real (modelo Spotify) + 3 tiers pagos — **TODOS ATIVOS desde o lançamento** (pagamento via PIX manual na fase atual; automação por Stripe/MP a partir do gatilho de ≥ 5 pagantes)

| Plano | Preço | Status | Quem | Funções |
|---|---|---|---|---|
| **Grátis** | R$0 | ✅ Ativo | 1 pessoa | Foto do cupom + análise imediata + resumo mensal automático + alerta básico (>20% acima da média) + comando `/historico` + comando `/apagar`. **Limite: 10 cupons/mês** (técnico, custo Gemini) |
| **Individual** | R$9,90/mês | ✅ Ativo via PIX | 1 pessoa | Tudo do Grátis + **cupons ilimitados** + **comparativo entre mercados** (qual mercado tem preço melhor pros itens que você compra) + **alerta inteligente** (preditivo: avisa antes do mês estourar, categorizado por tipo de item) |
| **Família** | R$15/mês | ✅ Ativo via PIX | até 3 pessoas | Tudo do Individual + **visão consolidada da família** (gastos somados) + **comparação por membro** (quem gasta o quê) |
| **Família+** | R$22/mês | ✅ Ativo via PIX | até 5 pessoas | Igual ao Família + **2 vagas adicionais** (5 pessoas no total) |

**Lógica do limite de 10 cupons no free:** Gabriel paga por cada chamada do Gemini Vision. Limite é técnico (anti-abuso), não artificial. Cobre quem vai ao mercado 2-3x/semana com folga.

**Princípio mantido:** *"bom, barato e útil — grátis funciona de verdade, pago é genuinamente melhor"*. O free resolve a dor central (saber pra onde vai o dinheiro). O Pro entrega features que valem o preço: comparativo entre mercados, alerta preditivo, plano família.

**Fluxo de pagamento PIX (fase manual):**
1. Usuário manda `/pro` ou `/planos` no bot → recebe instruções + QR Code PIX
2. Usuário paga via PIX no QR Code (chave gerenciada pelo Gabriel)
3. Usuário manda comprovante via WhatsApp
4. Gabriel confirma e ativa flag `is_pro = true` no Supabase (até 1h)
5. Renovação mensal: bot envia lembrete no dia 25 com novo QR Code

**Cohort de Beta (uso técnico apenas):** contas criadas durante os 60 primeiros dias recebem uma marca temporal no Supabase **puramente para análise de retenção comparada**. **Não há benefício comercial prometido a esse grupo:** sem 3 meses grátis, sem preço travado, sem desconto vitalício, sem acesso antecipado pago. **Decidido em 2026-05-19, reforçado em 2026-05-22** — subsidiar custo de Gemini sem unit economics validado é compromisso financeiro pesado demais.

**Métricas-chave a acompanhar:**
- MRR (Receita Recorrente Mensal) — começa a contar desde o lançamento
- Pagantes via PIX (acumulado, novos por mês)
- Taxa de conversão Free → Pro (novos pagantes / cadastros mês)
- Churn de pagantes (mês a mês)
- LTV / CAC Ratio
- DAU / MAU (usuários ativos diários / mensais)
- Cupons analisados por usuário ativo
- **Retenção W2** (mandou cupom na semana 2) — métrica crítica de validação de hábito

---

## 4. 🛠️ Stack Técnica

```
WhatsApp ← Z-API (webhook) → Express.js → Gemini 2.5 Vision → Supabase
```

| Componente | Tecnologia |
|------------|------------|
| Runtime | Node.js ≥ 18 |
| WhatsApp API | Z-API (instance + webhook) |
| IA / Visão | Google Gemini 2.5 Flash (análise de cupons) |
| Banco de dados | Supabase (PostgreSQL) |
| Servidor | Express.js |
| Infraestrutura | A definir (Railway / GCP recomendado) |

**Estado do código (auditoria 2026-05-08):** muito mais construído do que parecia. Já implementado:
- `src/index.js` — webhook Express + roteamento texto/imagem
- `src/gemini.js` — prompt + parser de cupom (JSON: loja, cnpj, data, total, itens[])
- `src/supabase.js` — 6 funções (upsert user, save purchase, history, avg spend, free tier check, increment monthly)
- `src/zapi.js` — send message + download image
- `src/formatter.js` — 5 templates de mensagens em português
- `src/alerts.js` — alerta se compra > 120% da média de 90 dias
- Tabelas Supabase: `usuarios` (phone_number PK, compras_mes_atual, is_pro), `compras`, `itens_compra`

**Variáveis de ambiente necessárias:**
- `GEMINI_API_KEY` — Google AI Studio
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` — Supabase
- `ZAPI_INSTANCE_ID` + `ZAPI_TOKEN` + `ZAPI_CLIENT_TOKEN` — Z-API
- `PORT` — porta do servidor (padrão: 3000)

**Endpoints ativos:**
- `GET /health` — healthcheck
- `POST /webhook` — recebe eventos do Z-API

**Decisão sobre Z-API vs Meta WhatsApp Cloud API (2026-05-08):**
Manter Z-API até atingir os gatilhos de migração. Migrar para Meta Cloud API só depois de:
1. CNPJ aprovado e Business Account verificado
2. 50-100 usuários ativos (quando custo do Z-API começa a importar)
3. Templates de alerta estabilizados (Meta exige template pré-aprovado pra mensagens fora da janela 24h)

A maior trade-off técnica: o **alerta proativo** seria mais restrito no Meta (precisa template aprovado por mensagem fora janela 24h). Z-API não tem essa restrição.

---

## 5. 🏛️ Áreas reais da empresa (3 áreas durante o Beta)

> **Por que só 3 áreas?** Com 1h/dia e 1 pessoa, manter 7 áreas no documento era teatro corporativo — rotinas que nunca rodaram. Esta seção foi cortada em 2026-05-19 (auditoria) para refletir o que de fato é executado e medido. As áreas suspensas estão registradas no fim desta seção para retomada futura.

### 🛠️ Produto (o bot rodando)
**O que é:** o bot em produção processando cupons reais, sem cair, sem custar mais do que o orçado.
**Rotinas reais:**
- Olhar logs do Railway / Supabase 1×/semana (sexta).
- Checar uptime do `/health` (UptimeRobot avisa por email se cair).
- Conferir custo do Gemini no Google Cloud Console 1×/semana.
**Indicador único (proposta, ver discussão pareada):** *uptime semanal ≥ 99%* **ou** *cupons processados / cupons enviados ≥ 90%*.

### 📣 Distribuição (landing + conteúdo + indicação)
**O que é:** tudo que traz gente nova pro bot. Landing, redes sociais, indicação boca-a-boca.
**Rotinas reais:**
- Landing analytics 1×/semana (Vercel Analytics ou GA4 grátis — instalar assim que possível).
- 3 posts/semana em uma rede social escolhida (TikTok recomendado).
- Conversa com 1 usuário ativo por semana (DM no WhatsApp ou áudio rápido).
**Framing cultural (mantido de 2026-05-08):** evocar "ser esperto / não dar mole / saber das coisas". Brasileiro classe B/C tem orgulho disso. NÃO é frame americano de "disciplina/budget".
**Indicador único (proposta, ver discussão pareada):** *novos cadastros únicos por semana* **ou** *taxa de retenção W2*.

### 💰 Caixa (custo do Gemini/Z-API + tempo seu)
**O que é:** o que sai do seu bolso pra esse projeto rodar — em dinheiro e em horas.
**Rotinas reais:**
- 1×/semana: somar custos do Gemini, Z-API, Vercel, domínio, qualquer ferramenta paga.
- 1×/semana: anotar horas reais trabalhadas (estimativa honesta).
- 1×/mês: atualizar planilha de unit economics.
**Indicador único (proposta, ver discussão pareada):** *custo total/mês em R$* (precisa ficar abaixo de teto que você define) **ou** *custo médio por usuário ativo*.

---

### 🛌 Áreas suspensas até saída do Beta
Estas áreas existem como conceito mas **não têm rotina executável durante o Beta**. Retomar quando: ≥ 50 usuários ativos consistentes **E** decisão de paywall tomada.

- **Customer Success estruturado** (NPS formal, tickets, prevenção de churn) — durante o Beta, suporte é informal no WhatsApp.
- **Financeiro/Contábil** (DRE, DAS, separação PJ/PF) — depende de CNPJ aprovado.
- **Jurídico/Compliance** (Termos, Privacy, INPI) — só Termos + Privacy básicos publicados; INPI fica para depois.
- **Vendas estruturadas / Funil de growth** — durante o Beta não há venda; só validação.
- **Operações documentadas (SOPs)** — só faz sentido com mais de 1 pessoa.

---

## 6. 👥 Time & Capacidade

> **Por que essa seção existe:** A partir de 2026-05-21 o Economizei deixou de ser hobby e passou a ser tratado como negócio profissional. Como negócio profissional, time e capacidade precisam estar explícitos — quem faz o quê, quanto custa, e quando faz sentido terceirizar. Esta seção complementa o documento de projeção (`Economizei app/Projecao_6_meses.md`) e é referência obrigatória pra qualquer decisão sobre contratar, automatizar ou priorizar.

### 6.1. Composição atual

| Pessoa | Função | Tempo dedicado | Custo de oportunidade |
|---|---|---|---|
| **Gabriel (fundador)** | Tudo: Produto, Engenharia, Marketing, CS, Finance, Estratégia | **~12h/semana** (média de 10–14) no Economizei + 40h/semana no trabalho principal | **R$65/h** (equivalente ao R$/h do trabalho principal) |

**Custo de oportunidade do tempo investido:**
- Por semana: R$780 (12h × R$65)
- Por mês: ~R$3.380 (12h × 4,33 sem × R$65)
- Em 6 meses: R$20.280
- Em 8 meses: R$26.520

> **Régua de retorno** (definida em sessão 2026-05-21): o MRR mensal precisa atingir **R$4.225/mês ou mais** (equivalente a 15h × 4,33 × R$65) para que o esforço se traduza em resultado mensal equivalente ou superior ao custo das horas. Cenários otimista/realista/pessimista detalhados em `Economizei app/Projecao_6_meses.md`.

### 6.2. Chapéus que o Gabriel veste hoje (e quanto consomem)

Distribuição estimada das 12h/semana entre funções. **Esta tabela existe para identificar gargalos e candidatos a terceirização**, não para virar burocracia.

| Chapéu (função) | Horas/sem | % do tempo | Atividades típicas |
|---|---|---|---|
| **Produto / Engenharia** | ~4h | 33% | Manter o bot rodando, ler logs, ajustar prompts, fix bugs, deploy |
| **Marketing / Distribuição** | ~3h | 25% | Conteúdo TikTok/Reels, copy de landing, conversas com usuários |
| **Customer Success (informal)** | ~1,5h | 13% | Responder dúvidas no WhatsApp, ler feedback, pequenas pesquisas |
| **Estratégia / Planejamento** | ~1,5h | 13% | Atualizar CLAUDE.md, revisar projeção, decidir gatilhos |
| **Finance / Administração** | ~1h | 8% | Custos, planilha de unit economics, CNPJ, fornecedores |
| **Operações / Imprevistos** | ~1h | 8% | Buffer pra coisa que aparece (suporte Z-API, ferramenta nova, etc.) |

**Observações:**
- Quando volume cresce, CS e Marketing tendem a comer Produto. Esse é gargalo previsível e deve ser endereçado com automação ou freela antes de virar problema.
- Estratégia abaixo de 1,5h/sem é perigoso: vira "andar por inércia". A revisão dos gatilhos da seção 8 da `Projecao_6_meses.md` é não-negociável.

### 6.3. Plano faseado de terceirização (freelas + automação)

Princípio registrado em 2026-05-21: **terceirizar não é necessariamente o mais barato, mas o que destrava o gargalo certo na hora certa**. Cada candidato a terceirização tem gatilho explícito — não se contrata por ansiedade, contrata-se por evidência.

#### Fase 1 — Beta (fase atual) — *Sem freelas, com automação leve*

Objetivo: validar o motor antes de gastar dinheiro com terceiros.

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Scheduler de resumo mensal automático | Automação interna | 0 (Gabriel codifica) | Quando pronto |
| Templates de resposta no Z-API | Automação interna | 0 | Quando pronto |
| UptimeRobot + alerta no email | Ferramenta grátis | R$0 | Assim que possível |
| GA4 ou Vercel Analytics | Ferramenta grátis | R$0 | Assim que possível |

#### Fase 2 — Pós-validação inicial — *Primeiros freelas pontuais*

Objetivo: liberar tempo do Gabriel pras decisões e produto. **Só ativar se o gatilho de validação (W2 ≥ 30%) ficar 🟢** (ver `Projecao_6_meses.md`).

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Freela de conteúdo (TikTok/Reels) — 4 vídeos/mês | Freelancer pontual | R$300–600/mês | W2 ≥ 30% |
| Designer pontual pra atualizar landing | Freelancer pontual | R$200–400 (one-shot) | Quando decidir mudar copy principal |
| Ferramenta de agendamento de posts (Buffer/Later) | SaaS | R$0–60/mês | Se conteúdo escalar |

#### Fase 3 — Escala inicial — *Freelas recorrentes condicionados*

Objetivo: tirar Gabriel de tarefas operacionais repetitivas. **Só ativar se MRR ≥ R$300**.

| Item | Tipo | Custo estimado | Gatilho |
|---|---|---|---|
| Freela de CS no WhatsApp — 5h/semana | Freelancer recorrente | R$700–1.000/mês | MAU ≥ 250 |
| Editor de vídeo dedicado | Freelancer recorrente | R$800–1.500/mês | Se conteúdo for o motor principal |
| Contador (DAS, fiscal, DRE básico) | Recorrente | R$200–400/mês | CNPJ aprovado |
| Migração Z-API → Meta Cloud API | Projeto pontual | R$1.500–3.000 (one-shot) | ≥ 50–100 usuários ativos consistentes |

#### Fase 4 — Crescimento — *Estrutura mínima sustentável*

Só faz sentido se **MRR ≥ R$2.000** e trajetória clara de escala.

| Item | Tipo | Custo estimado |
|---|---|---|
| Tudo da Fase 3 + Designer recorrente | — | — |
| Possível 1ª contratação CLT/PJ part-time (PM ou Engenharia) | Recorrente | R$3.000–5.000/mês |
| Marketing manager part-time | Recorrente | R$2.500–4.000/mês |

### 6.4. Regra de ouro para decidir terceirizar

Antes de contratar qualquer freela, responder 3 perguntas:

1. **Esta tarefa é recorrente?** Se for one-shot, talvez não justifique freela — vale mais um esforço concentrado de fim de semana.
2. **Esta tarefa está bloqueando algo de maior valor?** Se você está gastando 5h/semana editando vídeo enquanto a retenção W2 não está medida, o gargalo não é o vídeo — é a instrumentação.
3. **O custo do freela cabe no orçamento ATUAL, sem contar com receita futura?** Princípio do Gabriel: não comprometer caixa antes de ter receita validada. Se não cabe, não contrata.

> **Anti-padrão:** contratar freela porque "precisamos crescer mais rápido" sem validar que o motor de retenção funciona. Isso é empurrar água em balde furado e queimar caixa.

### 6.5. Funções que NÃO terceirizar (em nenhuma fase)

| Função | Por que fica com o Gabriel |
|---|---|
| Estratégia / direção do produto | É o core do negócio. Quem não direciona, não tem produto. |
| Decisões sobre paywall, pricing, ICP | Decisões de longo prazo precisam estar com o dono |
| Conversas qualitativas com usuários ativos (1/sem) | Aprendizado bruto que nenhum CS pode substituir no início do projeto |
| Leitura semanal de logs + custos | Sinal de saúde do produto e do caixa |
| Atualização do CLAUDE.md | É a memória institucional; só o Gabriel sabe o contexto completo |

### 6.6. Métricas de saúde do time

Mesmo com 1 pessoa, há sinais de que a operação está saudável ou em sobrecarga.

| Sinal | 🟢 | 🟡 | 🔴 |
|---|---|---|---|
| Revisão de gatilho mensal feita | Sim, dentro do prazo | Atrasada 1 semana | Mais de 2 atrasos seguidos |
| Horas reais vs. planejadas | Dentro de ±20% | 20–40% acima | > 40% acima por 3 semanas |
| Atividade no CLAUDE.md | Pelo menos 1 entry/sessão | Sem updates há 2 semanas | Sem updates há 1 mês |
| Burnout subjetivo | Energia pra continuar | Cansaço pontual | Vontade de abandonar |

> Se 2 sinais ficarem amarelos por 2 semanas seguidas, tirar 1 final de semana inteiro do projeto e reavaliar. Sustentabilidade do operador é parte do unit economics.

---

## 7. 🗺️ Roadmap

### 7.1. 📍 Praça inicial — Fernandópolis-SP e região *(definido 2026-05-26)*

**Decisão:** as primeiras campanhas (orgânico + ads) serão concentradas em **Fernandópolis-SP** e cidades vizinhas do noroeste paulista (Estrela d'Oeste, Pedranópolis, Meridiano, Macedônia, Mira Estrela, Indiaporã, Votuporanga como cidade-hub regional). O Gabriel mora/tem rede em Fernandópolis, então o boca-a-boca, o vocabulário e a recomendação local saem com autenticidade.

**Por que faz sentido começar aí:**
- **Mercado real, não invisível.** Fernandópolis tem ~70 mil habitantes, potencial de consumo de **R$ 3,4 bilhões** (cresceu 5,8% em 2024). Classes B/C cresceram em **560 + 1.088 domicílios** entre 2023–2024 — exatamente o ICP do Economizei. *(Fonte: Cidadão.NET / IBGE)*
- **Salário médio formal R$ 2.600** (abaixo da média estadual de R$ 3.900) → dor de "pra onde foi o dinheiro" é mais aguda que na capital.
- **Densidade de boca-a-boca.** Cidade pequena = grupos de WhatsApp de bairro, status, grupo de família, igreja, academia. 1 viral local = 50 cadastros sem custo. *(Fonte: Salesforce, Agência Mestre, ExpoSupermercados)*
- **Custo baixo de ads geo-segmentados.** Meta Ads numa cidade do interior tem CPM e CPC muito mais baratos que SP capital ou Rio.
- **Validação social mais rápida.** Em 30 dias dá pra saber se 5 pessoas conversaram entre si sobre o produto. Na capital esse sinal demora 6 meses.

**Mercados-âncora da cidade** (referências culturais que o público reconhece — usar com parcimônia, ver nota abaixo):
- **Pessotto Supermercados** (Pessotto Max, Pessotto Flex, Pessotto da Cida) — rede local com várias lojas, presença forte.
- **Sakashita Supermercados** — Av. Primo Angelucci (Centro) e Av. Expedicionários Brasileiros.
- **Supermercado Souza / Rede Sol** — bairro Parque Nações, atende desde 1990.
- **Max Atacadista, Proença, Amigão, AmPm** — outras opções relevantes.
- **Atacadão / Assaí** — redes nacionais com presença regional (atacarejo).

> **Nota jurídica/editorial sobre citar mercados:** evitar citar nome de mercado em **tom negativo** (ex: "o Pessotto tá te roubando"). Quando o nome aparecer em roteiro, deve ser em **contexto neutro de hábito** ("fui no Sakashita comprar arroz") ou como **referência local positiva**. Idealmente, manter o nome do mercado como **slot variável** no roteiro (`[mercado local]`) e decidir caso a caso na hora de gravar. **Não publicar nada que implique parceria, endosso ou comparação direta entre os mercados sem autorização escrita.**

**Frame cultural do roteiro:**
- Sotaque/jeito do interior, não do paulistano. Use "cê", "ó", "olha aqui", "véi", "rapaz", "mano", "vó", "negócio", "trem". Sem inglês desnecessário.
- Referências de lugar: praça da matriz, rodoviária, av. Brasil (a principal), bairros conhecidos (Centro, Parque Nações, Santa Rita, Vila Regina).
- Referências culturais: peão (rodeio é forte na região), festa do peão, churrasco de domingo, "rancho" do mês (a compra grande), feirinha de sábado.
- **NÃO** usar: emojis tech, jargão de startup, gringuismo, "feature", "killer", "MVP", "stack".

**Canais ordenados por prioridade:**
1. **TikTok** orgânico geolocalizado (perfil novo posta direto da cidade) + **Reels Instagram** com o mesmo corte.
2. **WhatsApp** — divulgação em grupos próximos (família, faculdade, vizinhança, igreja, academia, trabalho). Pedir indicação direta de 5 pessoas.
3. **Meta Ads geo-segmentado** — raio de 30km de Fernandópolis, R$ 50–100 de teste.
4. **Boca-a-boca offline** — Gabriel já tem rede física na cidade, dá pra mostrar o bot pessoalmente em conversas casuais.

**O que mede sucesso de campanha local (90 dias):**
- ≥ 100 cadastros únicos vindos de Fernandópolis (cruzar DDD 17 ou pergunta no onboarding "de onde você é?")
- ≥ 30% de retenção W2 nesse cohort local (métrica crítica de hábito)
- ≥ 3 indicações orgânicas registradas (alguém indica alguém)
- ≥ 1 vídeo passa de 5k views na conta TikTok

**Expansão depois:** se Fernandópolis validar, expansão natural é para cidades de porte similar no noroeste paulista (Votuporanga ~95 mil hab, Jales ~50 mil, São José do Rio Preto como salto regional ~480 mil hab). NÃO pular pra SP capital antes de validar a praça inicial.

---

### Roadmap Tático de Lançamento (definido 2026-05-08)
*Detalhamento completo no PDF/HTML em `Economizei app/Economizei_Roadmap_6_Semanas.html` e no plano em `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`. Blocos de trabalho em ordem sugerida de execução — sem prazo numerado.*

- **Hardening + Definição do Free:** subir limite de 3 → 10 cupons; criar `.env.example`; coluna `beta_fundador`; rate limit; reescrever boas-vindas; onboarding em 4 mensagens.
- **Landing + Pricing visível:** domínio + landing com A/B test de headline; bloco de pricing 4 planos (Grátis ativo, demais "em breve"); waitlist no Supabase; auto-resposta WhatsApp.
- **Privacidade + Conteúdo:** página "Como tratamos seus dados"; política de privacidade; 3 vídeos Reels/TikTok; 1 carrossel Instagram.
- **Polir Free + Scheduler:** scheduler de resumo mensal automático; tratar cupons borrados/farmácia/sem itens; comando `/limite`; teste end-to-end.
- **Beta Soft + Indicação:** lançar para grupos próximos; comando `/indicar`; tabela `indicacoes`; Meta Ads R$50–100; coletar NPS.
- **Iteração + Teste de Pricing:** A/B de preço em 3 grupos (R$4,90 / R$9,90+R$15 família / pague o que quiser); decidir paywall.

**Cortável se necessário:** o bloco "Polir Free + Scheduler" (resumo mensal pode ser manual no início). Cortar qualquer outra compromete a campanha.

### Roadmap Macro

#### Fundação Legal & Financeira
- [ ] Abrir CNPJ / ME
- [ ] Abrir conta PJ separada
- [ ] Publicar Termos de Serviço + Privacy Policy
- [ ] Integrar Stripe ou Mercado Pago para cobranças (só ativar após validação)

#### Primeiros Usuários & Marca
- [ ] Criar perfil no TikTok e Instagram
- [ ] Publicar os 10 primeiros conteúdos
- [ ] Meta: 100 usuários freemium
- [ ] Ativar pesquisa de NPS inicial

#### Monetização & Growth
- [ ] Lançar plano pago (estrutura definida pelo teste de pricing)
- [ ] Teste A/B de preço e posicionamento
- [ ] Meta: 10 usuários pagantes (primeiro MRR)
- [ ] Primeira análise de LTV/CAC

#### Produto & Escala
- [ ] Migrar Z-API → Meta WhatsApp Cloud API (após CNPJ + escala)
- [ ] Iterar produto com base em feedbacks reais
- [ ] Parcerias com influencers de economia doméstica
- [ ] Avaliar contratar CS freelancer se NPS < 40
- [ ] Revisão estratégica trimestral

---

## 8. 📋 Decisões Tomadas

| Data | Decisão | Racional |
|------|----------|----------|
| 2026-06-06 | **Gastos por categoria implementados — `/gastos` + gráfico doughnut via QuickChart.io** | Gemini passa a retornar `categoria` (10 valores: carnes, hortifruti, laticinios, padaria, bebidas, limpeza, mercearia, congelados, doces, outros) e `nome_canonico` (nome normalizado em lowercase) por item. Novos arquivos: `src/charts.js` (gera URL do gráfico via GET QuickChart.io — zero dependências), `supabase/migration_categorias_precos.sql` (adiciona colunas + cria tabela `precos_mercado`). Arquivos modificados: `gemini.js` (prompt + validação + rastreio de qualidade), `supabase.js` (salva categoria/canonico, registra preços anônimos fire-and-forget, `buscarGastosPorCategoria`), `formatter.js` (`montarMensagemGastos`, `montarMensagemPrivacidade`), `zapi.js` (`enviarImagem`), `index.js` (comandos `/gastos`, `/privacidade`, `/nao-compartilhar`, `/compartilhar`), `monthlySummary.js` (envia gráfico junto com resumo mensal). **PRÉ-REQUISITO DE DEPLOY:** rodar `supabase/migration_categorias_precos.sql` no SQL Editor antes do push. |
| 2026-06-06 | **Rastreio de qualidade do `nome_canonico` — duas camadas** | Camada 1 (runtime): `avaliarQualidadeCanonicoItem()` em `gemini.js` classifica cada item como `ok`, `ausente`, `igual_ao_nome`, `muito_longo`, `pouco_simplificado` — problemas logados como `canonico_suspeito` no Railway. Camada 2 (auditoria periódica): `supabase/monitoring_canonicos.sql` com 5 queries (visão geral, itens problemáticos, duplicatas em `precos_mercado`, variações de nome, correção manual). **Aprendizado técnico da sessão:** `itens_compra` não tem `criado_em` — filtro de data deve usar `compras.data_compra` via JOIN. Queries corrigidas para usar `c.data_compra >= (CURRENT_DATE - INTERVAL '30 days')`. |
| 2026-06-06 | **Estrutura do comparativo de mercados (`precos_mercado`) criada** | Tabela anônima: `produto_canonico`, `loja`, `cnpj`, `preco_unit`, `data_obs`. Participação automática (opt-out via `/nao-compartilhar`). Cupons não-mercado (`tipo='outros'`) não entram na tabela — farmácias/postos/restaurantes poluiriam a base de preços de supermercado. Base ainda sem dados suficientes pra queries de comparativo — estrutura pronta para acumular dados dos próximos meses. |
| 2026-06-06 | **Resiliência da leitura de cupons — 3 correções implementadas** | Diagnóstico: Gemini funcionava no AI Studio mas falhava no bot porque o WhatsApp comprime as fotos antes de entregar. **Correção 1 — pré-processamento Sharp** (`gemini.js`): antes de enviar ao Gemini, a imagem passa por `normalise()` (auto-contraste) + `sharpen(sigma:1.5)` + conversão pra PNG lossless. Se Sharp falhar, usa buffer original como fallback. **Correção 2 — retry automático** (`gemini.js` + `zapi.js`): download com até 2 tentativas e validação de tamanho mínimo (< 1KB = corrompido); Gemini com até 2 tentativas (processada → original) — só retenta em `borrado` ou JSON inválido, retorna imediatamente em qualquer outro erro (nao_e_cupom, muito_longo etc). Logs detalhados: `gemini_resposta_bruta`, `gemini_json_invalido`, `zapi_download_tentativa`, `zapi_download_ok`. **Correção 3 — orientação ao usuário** (`formatter.js`, `index.js`): quando a imagem fica borrada mesmo após retry, o bot envia uma segunda mensagem explicando como reenviar como *Documento* (sem compressão do WhatsApp). Nova função `montarMensagemEnviarComoArquivo()`. Sharp adicionado ao `package.json`. |
| 2026-06-04 | **Mensagem de confirmação passa a listar TODOS os itens do cupom (antes cortava em 3 + "...e mais N")** | Usuário pediu ver tudo que a IA registrou. Itens já eram 100% salvos no Supabase (`itens_compra`); só a mensagem truncava. `formatter.js montarResposta` reescrito: lista todos com quantidade (`2x ...`), com guarda de ~3000 chars pro limite do WhatsApp (acima disso mostra o que cabe + "...e mais N"). Testado com cupom de 32 itens = 1.847 chars, ok. |
| 2026-06-04 | **Cupom de NÃO-mercado passa a ser lido e salvo como "Outros (não-mercado)" — não é mais rejeitado** | Antes retornava `sucesso:false` + mensagem negativa. Agora o prompt do Gemini retorna `sucesso:true` + `tipo:"outros"` extraindo loja/total/itens; `validarSchema` marca todos os itens como categoria `nao_mercado`; confirmação é neutra/positiva. **Conta no limite de 10** do Free (consome cota normal, protege custo Gemini). Aparece como **fatia única "Outros (não-mercado)"** no `/gastos`. **NÃO alimenta o comparativo de mercados** (`registrarPrecosMercado` pulado quando `tipo==='outros'`). Arquivos: `gemini.js`, `formatter.js`, `charts.js`, `supabase.js`, `index.js`. |
| 2026-06-04 | **Reescaneamento de cupons esquecidos: DECISÃO PENDENTE — Gabriel quer entender as opções antes de escolher** | Achado técnico crítico: **hoje nenhuma imagem é armazenada** (`zapi.baixarImagem` → buffer → Gemini → descartado; URL do Z-API expira). Releitura retroativa de cupons já esquecidos é impossível — não há nada salvo. "Máquina reler sozinha" só é viável guardando a imagem daqui pra frente (Opção A, peso de LGPD: cupom tem CPF + dado financeiro) ou versão leve sem imagem que só facilita o reenvio (Opção B). Trade-offs apresentados em chat 2026-06-04; aguardando escolha. |
| 2026-06-04 | **LGPD: Política de Privacidade (`/privacidade`) e Termos de Uso (`/termos`) publicados na landing** | Pré-requisito para Meta Ads; conformidade LGPD com dados de cupom (CPF, CNPJ mercado, itens). `vercel.json` atualizado com rotas limpas. Links do rodapé da landing corrigidos (eram `#`). |
| 2026-06-04 | **Sistema de skills movido pra `.claude/skills/` + `PROJECT_INSTRUCTIONS.md` criado + CLAUDE.md enxugado** | Skills não estavam sendo auto-descobertas no path antigo (`skills/` workspace root). Mover pro path padrão + instruções de projeto carregadas em toda sessão resolve. CLAUDE.md teve 3 decisões revogadas e 2 sessões antigas movidas pra `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` — reduziu ~170 linhas mantendo histórico íntegro. |
| 2026-06-02 | **Estimativas de tempo banidas do CLAUDE.md e do CALENDARIO.md** | IA é ruim em calcular tempo estimado sem histórico real. Prazos só entram nos documentos depois de medidos em tentativas reais. Gatilhos são baseados em métricas (ex: "≥ 5 pagantes"), nunca em semanas/meses numerados. Prompt de execução em `PROMPT_CALENDARIO.md`. |
| 2026-06-02 | **Criação do CALENDARIO.md** como arquivo modular de rotinas e checkpoints | Centraliza metas diárias, semanais e mensais + checkpoints de progresso por gatilho. Referenciado no topo do CLAUDE.md como os outros módulos. Não substitui o CLAUDE.md — é o calendário operacional, não a memória estratégica. |
| 2026-06-02 | **Sistema de reengajamento planejado** — lembretes amigáveis por inatividade | 4 segmentos definidos: (A) nunca mandou cupom — dias 2 e 7; (B) mandou e sumiu — dias 3, 10, 30, 60; (C) fim de mês com cupons abertos — dias 26–27; (D) perto do limite gratuito — ao chegar em 8/10 cupons. Tom: amizade, não cobrança. Prompt de implementação em `PROMPT_REENGAJAMENTO.md`. Entregáveis: nova tabela `lembretes_enviados` no Supabase, módulo `src/reengagement.js`, novas funções em `supabase.js` e `formatter.js`, cron diário às 10h em `scheduler.js`. Regras: máx 50 usuários/segmento/execução, 1 lembrete/usuário/execução, 1.5s entre envios, nunca duplicar (checar tabela antes). |
| Maio 2026 | Modelo Freemium + Premium | Reduz barreira de entrada para público B/C; monetização via upgrade |
| Maio 2026 | Canal exclusivo WhatsApp | Público usa WhatsApp diariamente; elimina fricção de instalar app |
| Maio 2026 | Foco inicial em B2C (supermercados) | Mercado grande, dor clara, produto simples de demonstrar |
| Maio 2026 | Gemini 2.5 Vision para análise de cupons | Melhor custo-benefício para OCR + compreensão contextual |
| 2026-05-08 | **Lançar como Freemium real (modelo Spotify), não trial** | Princípio "bom, barato e útil — grátis funciona de verdade". Free deve resolver a dor central |
| 2026-05-08 | **Limite de 10 cupons/mês no Free** (era 3) | Limite é técnico (custo Gemini), não artificial. 10 cobre o uso normal de quem vai 2-3x/semana ao mercado |
| 2026-05-08 | **Pricing futuro: 4 tiers** — Grátis / R$9,90 individual / R$15 família 3p / R$22 família+ 5p | Plano família ancora valor; resolve persona indireta "filha paga pra mãe"; ARPU maior; churn menor |
| 2026-05-08 | **Alerta dividido: básico no Free, inteligente no Pago** | Free entrega utilidade real (alerta reativo "20% acima"); Pago entrega inteligência (preditivo + categorizado) |
| 2026-05-08 | **Comparativo de preços é feature paga, não Free** | É a "killer feature" pedida explicitamente na pesquisa. Justifica upgrade |
| 2026-05-08 | **Manter Z-API até CNPJ + 50–100 usuários** | Meta Cloud API exige Business Account verificado + templates aprovados que restringem alertas proativos. Migrar só depois |
| 2026-05-08 | **Headline da landing lidera com "esperto/economia", não privacidade** | Pesquisa: preço passou privacidade como objeção #1. Frame cultural BR é "ser esperto / não dar mole" |
| 2026-05-08 | **Landing mostra os 4 planos desde já** (pagos com tag "em breve") | Ancora preço futuro na cabeça do usuário; sinaliza visão de produto |
| 2026-05-08 | **Onboarding antecipa 2 objeções: "vai dar trabalho?" e "cupom já mostra"** | Mensagem 2 mata "trabalho" ("é sério, é só foto"); Mensagens 3 e 4 matam "cupom já mostra" planta a semente da comparação temporal |
| 2026-05-19 | **EXCLUSÃO total de qualquer benefício prometido ao Beta** — sem 3 meses grátis, sem preço travado, sem desconto vitalício, sem acesso antecipado pago | Princípio: só prometer benefício depois de ter dados que mostrem que o produto retém e converte. Antes disso, prometer subsidio = cheque em branco sem unit economics. Aplicar em: landing (`landing/index.html`), copy do bot (`src/formatter.js`), CLAUDE.md (seção 3 e 11), comunicação em redes sociais. **Comunicação do Beta vira:** "Aplicação em desenvolvimento. Use de graça enquanto durar o Beta. Quando o pago chegar, você decide se continua." Sem âncora financeira de benefício. |
| 2026-05-19 | **Áreas da empresa cortadas de 7 para 3 reais** (Produto, Distribuição, Caixa) | Auditoria identificou que as outras 4 áreas eram teatro corporativo — rotinas que nunca foram executadas. Áreas suspensas registradas na seção 5 para retomada futura. |
| 2026-05-15 | **Revisão de copy da landing — tom mais formal e direto** | Gabriel revisou e reescreveu seções: badge hero ("Aplicação em desenvolvimento · Beta gratuito"), headline com 2 cores (verde "Não deixa" + vermelho "passar a perna"), empatia mais explícita ("Problemas que resolvemos" + disclaimer fictício), copy step 1 mais detalhada, anti-planilha simplificada, pricing sub mais funcional |
| 2026-05-21 | **Economizei deixa de ser tratado como hobby — passa a ser negócio profissional** | Decisão explícita do Gabriel. Implica: planejamento formalizado, gatilhos de decisão obrigatórios, time + capacidade documentados, régua de retorno explícita. Criada nova seção 6 (Time & Capacidade) no CLAUDE.md + novo doc `Economizei app/Projecao_6_meses.md` |
| 2026-05-21 | **Dedicação real ao projeto fixada em ~12h/semana** (média de 10–14) | Calibragem honesta vs. "1h/dia" que estava no doc. Custo de oportunidade dessas horas: R$65/h (R$/h do trabalho principal). Total opportunity cost em 6 meses: R$20.280; em 8 meses: R$26.520 |
| 2026-05-21 | **Régua de retorno: MRR ≥ R$4.225/mês até início de 2027** | Equivalente a 15h × 4,33 sem × R$65/h. Ponto de "break-even contínuo" entre o que o projeto rende por mês e o que essas horas custariam por mês no trabalho principal. Não é payback do afundado — é run-rate de "trabalho que se paga sozinho" |
| 2026-05-21 | **Projeção em 3 cenários (otimista/realista/pessimista) com gatilhos semáforo** | Documento `Projecao_6_meses.md` define probabilidades subjetivas (~15-20% / ~50% / ~30-35%) e gatilhos obrigatórios nos meses 2, 3, 4, 6 e 8. Sem revisão nesses pontos, o projeto entra em modo "andar por inércia" |
| 2026-05-21 | **Plano de terceirização faseado por gatilho, não por ansiedade** | Fase 1 (mês 1-4): sem freelas. Fase 2 (mês 4-6): freelas pontuais SE W2 ≥ 30% no mês 3. Fase 3 (mês 6-8): freelas recorrentes SE MRR ≥ R$300 no mês 6. Fase 4 (mês 8+): contratação CLT/PJ SE MRR ≥ R$2.000. Princípio: contrata-se por evidência, não por ansiedade |
| 2026-05-22 | **Paywall ativo desde o lançamento via PIX manual — sobrescreve decisão de 2026-05-08 ("não ativar paywall nas 6 semanas iniciais")** | Após análise de projeção alternativa (`Projecao_Cenario_Paywall_Dia_1.md`), conclusão: paywall completo com Stripe/MP no dia 1 NÃO compensa (saldo líquido negativo em 2 de 3 cenários). MAS paywall via PIX manual SIM compensa (custo de implementação ~R$130, captura ~80% do benefício). Princípio mantido: free continua funcionando de verdade (10 cupons/mês, alerta básico, resumo), Pro é melhor mas não obrigatório. Modelo Spotify completo desde dia 1. **Gatilho de automação:** ≥ 5 pagantes via PIX em 60 dias → implementar Stripe/MP |
| 2026-05-22 | **Remoção total de tags "Em breve" na landing e no bot — anúncio direto do valor dos 4 planos** | Decisão do Gabriel: ser o mais honesto possível. Pricing dos 4 planos visível desde o lançamento, com indicação clara de quais features cada plano tem e botão "Assinar via PIX" no Individual / Família / Família+. Pesquisa qualitativa havia mostrado que o brasileiro valoriza honestidade direta — mostrar pricing real vale mais que ancorar "em breve" |
| 2026-05-22 | **Waitlist Beta Fundador removida da landing — substituída por CTA direto** | Como o Pro já está disponível via PIX, não faz mais sentido ter waitlist "pra avisar quando o Pro chegar". Seção transformada em bloco "Como começar" com 2 CTAs: (1) "Começar grátis no WhatsApp" → free, (2) "Assinar Pro via PIX" → WhatsApp pré-formatado com instruções |
| 2026-05-22 | **Copy do bot reescrita com foco em honestidade — remoção de Beta Fundador / 3 meses grátis / promessas antigas** | Toda mensagem que referenciava "Beta Fundador" com benefício foi reescrita. Bot agora apresenta os 4 planos de forma natural, com comando `/planos` que mostra o que cada plano oferece e como assinar via PIX. A flag `is_beta` no Supabase é mantida como marcador técnico de cohort (decisão de 2026-05-19), mas não aparece mais em copy promocional |
| 2026-05-26 | **Fernandópolis-SP definida como praça inicial de lançamento** (não SP capital, não nacional) | Gabriel tem rede física e cultural na cidade — boca-a-boca, vocabulário e indicação saem com autenticidade. Cidade de ~70k hab, R$ 3,4 bi de potencial de consumo, classes B/C em crescimento (560+1.088 domicílios novos em 2024). Ads geo-segmentados saem 5–10× mais baratos que capital. Validação social acontece em 30 dias, não 6 meses. Expansão natural depois: Votuporanga → Jales → São José do Rio Preto. Detalhamento completo na seção 7.1 |
| 2026-05-26 | **Roteiros de campanha devem usar sotaque/cultura do interior, não da capital** | Decisão registrada como diretriz editorial: usar "cê", "ó", "véi", "rapaz", "rancho do mês", referências de praça/avenida, peão/rodeio. Sem jargão de startup, sem inglês desnecessário, sem tom paulistano. Mercados locais (Pessotto, Sakashita, Souza) podem ser mencionados em contexto neutro de hábito, NUNCA em tom negativo ou implicando parceria. Aplicar em todos roteiros TikTok/Reels e em ads do Mês 1–3 |

---

## 9. 📚 Aprendizados & Retrospectivas

### Maio 2026 — Pesquisa de validação (30 respostas)

**O que validou:**
- WhatsApp é o canal certo: 27/30 abrem 6+ vezes/dia, 100% celular.
- Dor existe e é descrita em linguagem emocional: "me senti irresponsável", "decepcionado comigo mesmo", "incapacidade de administrar a vida cotidiana".
- Alerta proativo gera ação concreta em ~70% dos casos — é a feature mais alavancada.
- Há 2 perfis psicográficos quase iguais em peso: **Otimizador** ("saber que economizei") e **Controlador** ("saber exatamente quanto gasto"). Copy precisa endereçar os dois.
- Surgiu Persona 3 indireta: "filho/filha que instala pra mãe" — 2 menções espontâneas.

**O que invalidou:**
- Preço de R$9,90/mês não está validado: só 13–16% pagaria com convicção, 45% diz "não pagaria". Tentar cobrar antes de provar valor é destruir o canal.
- Privacidade não é mais a objeção #1 com amostra maior — preço passou (preço ~29%, privacidade ~23%).
- "Indicaria" caiu de 67% (primeira amostra) para ~48% — ainda alto, mas não quase-universal.

**Surpresas:**
- "Já tenho isso no cupom" apareceu como detrator forte — segmento que vê produto como só OCR. Resposta: o valor é **temporal** (agregação no tempo), não transacional. Precisa estar explícito no onboarding (mensagens 3 e 4).
- "Tempo que teria que passar alimentando informações no app" apareceu como medo (linha 20) — apesar do produto ser só foto. Falsa percepção que precisa ser combatida na copy.
- Concorrente real é a **planilha de Excel**, não outros apps. 4 menções espontâneas de quem já tentou e desistiu.

**Aplicação:**
- Posicionamento: "O Economizei é a planilha que você nunca conseguiu manter".
- Headlines com framing brasileiro de "ser esperto" — testar Opção 1 ("Não deixa o mercado te passar a perna") vs Opção 4 ("Economizar virou foto") em A/B.
- Adiar paywall, reforçar Beta Fundador, lançar gratuito real.

### Maio 2026 — Auditoria do código

**O que aprendi:** o bot estava muito mais construído do que o briefing inicial sugeria. MVP técnico já completo (webhook + Gemini + Supabase + alertas). O trabalho das 6 semanas não é construir, é **endurecer + lançar + validar**. Esse insight inverteu a priorização das 6 semanas — de "construir features" para "distribuição, mensagem e validação".

---

## 10. 🔗 Recursos

### Documentos da empresa
- **Plano completo de pesquisa + estratégia (com copy pronta):** `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`
- **Roadmap visual 6 semanas (HTML para impressão/PDF):** `Economizei app/Economizei_Roadmap_6_Semanas.html` *(abrir no navegador, Ctrl+P → "Salvar como PDF")*
- **Apresentação Blueprint Empresarial:** `economizei-blueprint.pptx` (na pasta de outputs do Cowork)
- **Pesquisas brutas:** `local_*/uploads/Pesquisa de Hábitos de Compra no Supermercado*.csv`

### Repositório
- **Código:** `E:\Economizei Bot\src\`

### APIs em uso
- Z-API (WhatsApp gateway)
- Google AI Studio (Gemini 2.5 Flash)
- Supabase (PostgreSQL + Auth)

---

## 11. 💬 Histórico de comandos importantes do Gabriel

*Esta seção registra as instruções e princípios que o Gabriel deu explicitamente, para preservar a intenção original em decisões futuras.*

### 2026-05-08 — Análise da pesquisa e plano de lançamento *(condensado)*

> **Conteúdo completo arquivado em** `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` (seção 3.1).

**Princípios e diretrizes que permanecem em vigor desta sessão:**
- Filosofia "bom, barato e útil — grátis funciona de verdade, pago é melhor". Capitalizar EM CIMA do produto, nunca pensando inverso.
- Limite Free de 10 cupons/mês — técnico (custo Gemini), não artificial.
- Framing de marketing: "ser esperto / não dar mole / saber das coisas". Nome da app não é à toa.
- Antecipar 2 objeções no onboarding: "vai dar trabalho?" e "cupom já mostra isso, né?".
- Manter Z-API até CNPJ + 50–100 usuários (templates Meta restringem alerta proativo).
- Pricing 4-tier estrutural (Grátis / Individual / Família / Família+).

**Decisões desta sessão que foram revogadas/sobrescritas depois:** tag `beta_fundador` com benefícios (revogada 2026-05-19), paywall adiado 6 semanas (sobrescrita 2026-05-22), tags "em breve" nos planos pagos (removidas 2026-05-22). Detalhe completo no arquivo.

### 2026-05-15 — Redesign da landing + revisão de copy *(condensado)*

> **Conteúdo completo arquivado em** `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` (seção 3.2).

**O que permanece em vigor desta sessão:**
- Direção visual "Confiável e brasileiro" (estilo Nubank/PicPay), hospedado em Vercel.
- Headline "Não deixe o mercado te passar a perna" (verde em "Não deixe", vermelho em "passar a perna").
- Selo "vagas limitadas" (não "beta fundador").
- Seção "Problemas que resolvemos" com disclaimer de nomes fictícios.
- Bullets anti-planilha simplificados.
- Regra editorial: linguagem informal ("cê", "tá", "véi") **somente em roteiros de marketing** — nunca na landing, no bot, ou em documentos institucionais.

**Decisão desta sessão revogada depois:** promessa de "R$ 9,90 travado pra sempre" removida em 15/05; promessa de "3 meses grátis" também removida em 19/05. Histórico no arquivo.

### 2026-05-19 — Sessão de auditoria crítica externa + correções estruturais

**Briefing inicial:**
> "Analise o projeto economizei... reflexão e sugestões sobre aonde podemos melhorar em pontos especificos nas skills que usamos, na estrutra de 'empresa' ou fluxo de produção que fazemos e nas ferramentas que são usadas. (...) aja como um consultor de empresas extremamente críticos que aponta os erros sem dó e que consegue classificar eles por importancia e impacto."

**Aplicação:** auditoria entregue em `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` com 24 pontos classificados em 🔴/🟠/🟡/🟢 + 12 caminhos fora da caixa.

**Decisões/correções tomadas na mesma sessão:**

**Sobre Beta Fundador:**
> "Sobre a questão do beta fundador eu quero a EXCLUSÃO de qualquer coisa que mencione um benefício como 3 meses de graça, ou o preço travado, qualquer coisa do tipo, como você disse não é possível pra mim subsidiar o custo disso, por isso precisamos ter resultado pra ai oferecer algo assim. Por enquanto vamos continuar somente com estratégias basicas"
> *Aplicação: removido da seção 3 (Modelo de Negócio) toda menção a 3 meses grátis e preço travado; revogadas as decisões de 2026-05-08 e 2026-05-15 nesse ponto; "Tag de Fundador" virou "Cohort de Beta (uso técnico apenas)". Pendente: aplicar mesma remoção em `landing/index.html` e em `src/formatter.js` (templates de mensagem do bot).*

**Sobre áreas da empresa:**
> "Vamos colocar em pratica a ação A.2.1 faça as ações sugeridas e vamos discutir qual opção de indicadores eu tenho"
> *Aplicação: seção 5 do CLAUDE.md reescrita de 7 áreas para 3 áreas reais (Produto, Distribuição, Caixa) + lista de áreas suspensas. Indicadores únicos sugeridos por área, discussão pareada pendente em chat.*

**Sobre comparativo de mercados (Opção A):**
> "Sobre a decisão 2.4 vamos pensar em ja estruturar a feature na opção A, me mostre como poderiamos desenvolver a função com essa estratégia."
> *Aplicação: estrutura técnica de comparativo cross-user anonimizado proposta em chat (opt-in no onboarding, agregação por loja+CNPJ+produto canonicalizado, percentil de preço). Não codada ainda.*

**Sobre reframe de marca:**
> "Eu gostaria também de desenvolver mais sobre o reframe da marca, me fale mais sobre isso de assistente de compras e como podemos vender isso"
> *Aplicação: aprofundamento do reframe entregue em chat. Aplicação prática (testes A/B na landing, copy do bot) pendente.*

**Sobre divisão do CLAUDE.md:**
> "fico preocupado com a complexidade adicionada e como eu posso estar perdendo informações importantes as vezes, como acha que podemos fazer essa divisão da melhor forma?"
> *Aplicação: proposta de divisão modular com referências cruzadas no topo do CLAUDE.md (ver bloco "Estrutura modular planejada" na seção 1). Quebra física dos arquivos é decisão pendente do Gabriel.*

**Sobre skills criadas nesta sessão:**
> "crie a skill de auditoria de landing/copy review (...). Eu gostaria também de desenvolver mais sobre [dependency mapping] e até criar uma skill que ativasse sempre que um roadmap ou um planejamento fosse feito"
> *Aplicação: 2 skills criadas em `E:\Economizei Bot\.claude\skills\` — `copy-review` e `roadmap-deps`. Pendente: empacotar como `.skill` e instalar no perfil global.*

### 2026-05-21 — Sessão de projeção 6 meses + estruturação de time

**Briefing inicial:**
> "Ative a skill que proteje e avisa o limite de contexto, leia o claude md e vamos desenvolver uma projeção para o projeto economizei bot. para isso crie um arquivo MD com 3 perspectivas, otimista, realista e pessimista. (...) tudo isso tem que ser comparado com o time que existe agora no projeto, para ter certeza que o esforço esta sendo recompensado de maneira correta, não só sendo desperdiçado."

**Sobre time e custo de oportunidade:**
> "vamos criar uma sessão para isso no claude MD para que seja divido entre as pessoas atribuidas no projeto e que se leve em consideração principalmente agora que só existe eu como colaborador do projeto e que ja tenho na minha rotina da semana 40 horas semanais trabalhadas que equivalem 65 reais cada hora."
> *Aplicação: criada seção 6 (Time & Capacidade) no CLAUDE.md com composição atual (só Gabriel, ~12h/sem, R$65/h), chapéus por área, plano de terceirização faseado e métricas de saúde do time.*

**Sobre tratar o projeto como negócio sério:**
> "vamos agora entender que o projeto do economizei não é só hobbie mas algo sério e profissional, que deve ter planejamento e que mesmo começando ja deve seguir boas praticas e ter um rumo estruturado."
> *Aplicação: registrado como decisão de 2026-05-21. Implica revisões obrigatórias nos gatilhos da projeção, atualização contínua de CLAUDE.md e instrumentação de métricas até a Semana 2.*

**Respostas-chave do Gabriel nas perguntas de clarificação:**

> Sobre horas reais: "~10–14h/semana (1-2h/dia mais alguns blocos no fim de semana)"
> *Aplicação: usado 12h/semana como média em todos os cálculos de opportunity cost.*

> Sobre régua de sucesso em 6-8 meses: "se eu trabalho 15 horas no projeto eu quero que no inicio de 2027 essas 15 horas semanais se traduzam em 975 reais ou mais toda semana"
> *Aplicação: convertido para MRR ≥ R$4.225/mês (15h × 4,33 sem × R$65/h) como régua de "trabalho que se paga sozinho". Documentado no doc de projeção como o ponto de break-even contínuo, não como payback do afundado.*

> Sobre time/contratação: "Eu + planos de contratação pequena como freelas. Isso cabe uma análise das funções que temos e que teremos no decorrer do projeto e ja planejar em terceirizar isso seja para uma automação ou para um terceiro que acaba tendo um custo melhor, mas não necessáriamente menor"
> *Aplicação: princípio "terceirizar não é necessariamente o mais barato, mas o que destrava o gargalo certo na hora certa" registrado na seção 6.3 com plano faseado por gatilho.*

**Comando final implícito:** estruturar tudo no CLAUDE.md (nova seção 6 + decisões + registro de comandos) + arquivo de projeção em `Economizei app/Projecao_6_meses.md`.

### 2026-05-26 — Sessão de reformulação da landing page

**Briefing inicial:**
> "vamos olhar a landing page, eu acho que o valor do produto ainda não está claro, vamos revisar as funções que temos no bot e vamos deixar mais explícito, queremos entregar funcionalidade também."

**Fluxo da sessão:**
1. Leitura completa do `CLAUDE.md`, `src/index.js`, `src/formatter.js`, `src/alerts.js`
2. Montagem de organograma visual do fluxo completo do usuário (onboarding 4 passos, fluxo de imagem, fluxo de texto, comandos, alertas, resumo mensal, limite gratuito)
3. Diagnóstico: landing apresentava o produto como "OCR glorificado" — não comunicava o valor real (comparação temporal, insight de hábito, resumo mensal automático, comparativo de mercados)
4. Planejamento aprovado antes de qualquer implementação → arquivo `Economizei app/Plano_Landing_Page_v2.md` criado
5. Implementação das 4 mudanças aprovadas em `landing/index.html`

**Decisões tomadas durante a sessão:**

> Sobre nomes de mercados nos mockups: "retire os nomes dos mercados e coloque nomes fictícios"
> *Aplicação: todos os mockups da landing usam "Mercado Central", "Atacadão do Povo" e "Mercado Bom Preço". Nomes reais de Fernandópolis (Pessotto, Sakashita, Souza) reservados para roteiros de marketing com contexto neutro, conforme diretriz do CLAUDE.md seção 7.1.*

> Sobre frase do Cenário 2: "retire essa frase 'sem pedir' por que parece ser algo importuno"
> *Aplicação: frase "sem pedir nada" removida de toda a seção de Cenário 2 (resumo mensal). Heading passou a ser "O mês inteiro em uma mensagem".*

> Sobre linguagem informal: "essas adaptações servem SOMENTE E EXCLUSIVAMENTE para marketing, nunca para o texto do bot ou para qualquer outro texto fora de roteiros de marketing"
> *Aplicação: corrigidos todos os "cê", "tá" e "Não deixa" encontrados na landing page. Regra registrada: linguagem informal (cê, tá, né, ó) é permitida apenas em roteiros de TikTok/Reels/scripts de campanha — nunca na landing, no bot (`formatter.js`) ou em documentos institucionais.*

**Mudanças implementadas em `landing/index.html`:**

| Mudança | Descrição |
|---|---|
| Hero mockup enriquecido | Substituiu bubble genérico por: (1) alerta de 22% acima da média + insight de doces/chocolates, (2) teaser "Em breve: comparativo entre mercados" com visual roxo/dashed |
| Passo 3 reescrito | Título: "Você descobre o que ninguém te conta". Descrição explica relatório automático mensal + alerta com percentual exato |
| Nova seção `#na-pratica` | 3 cenários com mockups de conversa reais: análise imediata, resumo mensal (com callout "Doces e chocolates — R$ 52,40"), comparativo de mercados em desenvolvimento |
| Nova seção `#erros` | 5 cards de situações de erro com a mensagem exata que o bot envia em cada caso. Frame: "o bot nunca some — sempre te orienta" |
| Correções de ortografia | "Não deixa" → "Não deixe" (headline), 2× "cê" → "você", 2× "tá" → "está"/"vai para" |

**Estado final da página:** ~2.700 linhas. Ordem das seções: Nav → Hero → Credibilidade → Empatia → Como funciona → Na prática → Objeção → E se o cupom não ler? → Anti-planilha → Pricing → Privacidade → Como começar → Rodapé.

**Deploy:** via Git push (repositório conectado ao Vercel — deploy automático após push).

### 2026-06-02 — Sessão de sistema de reengajamento

**Briefing inicial:**
> "Eu quero criar um aviso depois de 7 dias da primeira mensagem da pessoa, para que ela se lembre de mandar o cupom, quero que essa mensagem não tenha um tom de cobrança mas de amizade lembrando que esta ali e que se importa, podemos criar mais mensagens em outros periodos de tempos sem resposta do usuario ou entre respostas, me de sugestoes para mais possibilidades."

**Decisões e definições aprovadas:**

4 segmentos de reengajamento definidos:
- **Segmento A (onboarding sem ação):** dia 2 e dia 7 após cadastro sem nenhum cupom enviado
- **Segmento B (usuário ativo que sumiu):** 3, 10, 30 e 60 dias após a última compra registrada
- **Segmento C (fim de mês):** dias 26–27 do mês para quem tem cupons no mês mas não recebeu o resumo ainda
- **Segmento D (limite):** ao atingir 8 de 10 cupons gratuitos no mês

**Princípio de tom aprovado:** amizade, não cobrança. Mensagens curtas, sem urgência artificial, sem emojis em excesso. Oferecer a opção `/apagar` no lembrete de 60 dias (respeito à saída).

**Regras técnicas definidas:**
- Máximo 50 usuários por segmento por execução do cron (respeitar Z-API)
- 1.5s de delay entre cada envio
- 1 lembrete por usuário por execução (prioridade: D > C > B > A)
- Nova tabela `lembretes_enviados` com UNIQUE por `(phone_number, lembrete_id, mes_referencia)` — evita duplicatas
- Cron diário às 10h (America/Sao_Paulo) integrado ao `scheduler.js` existente

**Entregável desta sessão:** `PROMPT_REENGAJAMENTO.md` — prompt autocontido para Claude Opus implementar todos os arquivos e funções necessárias.

### 2026-06-06 — Sessão de gastos por categoria + qualidade de canonicos

**Briefing inicial:**
> "Analise todo o código da pasta do projeto e leia o claude md para entender o projeto e vamos discutir como podemos colocar um resumo de gastos melhor, por exemplo pra desde a primeira compra a IA ja fazer uma separação de categorias e assim criar uma lista de gastos, pensando nisso como podemos fazer com que um agente responda as mensagens no whatsapp com dados, por exemplo gerar um pdf ou algo que seja além de somente letras e emojis. Vamos pensar também em como programar a comparação entre mercados, como podemos ja começar a estruturar isso para quando tivermos dados suficientes"

**O que foi implementado:**
- `src/charts.js` (novo): gera URL de gráfico doughnut via QuickChart.io — zero dependências, só GET + JSON codificado na URL
- `supabase/migration_categorias_precos.sql` (novo): adiciona `categoria` e `nome_canonico` em `itens_compra`, `opt_out_precos` em `usuarios`, cria tabela `precos_mercado`
- `gemini.js`: prompt atualizado para extrair `categoria` (10 valores) + `nome_canonico` por item; `avaliarQualidadeCanonicoItem()` rastreia canonicos suspeitos; logs `canonico_suspeito`
- `supabase.js`: `salvarCompra` passa categoria/canonico; `registrarPrecosMercado` (fire-and-forget); `buscarGastosPorCategoria`; `setOptOutPrecos`
- `formatter.js`: `montarMensagemGastos`, `montarMensagemPrivacidade`, `nomeDoMes` exportado
- `zapi.js`: `enviarImagem` (POST send-image para Z-API)
- `index.js`: comandos `/gastos`, `/privacidade`, `/nao-compartilhar`, `/compartilhar`; `mostrarGastos()` envia gráfico + texto
- `monthlySummary.js`: após resumo mensal, envia gráfico de categorias do mês
- `supabase/monitoring_canonicos.sql` (novo): 5 queries de auditoria de qualidade dos canonicos

**Aprendizado técnico crítico:**
`itens_compra` NÃO tem coluna `criado_em`. O timestamp de data existe em `compras.data_compra`. Toda query SQL que precise filtrar itens por data deve fazer `JOIN compras c ON c.id = ic.compra_id` e filtrar por `c.data_compra`. Erro descoberto ao tentar rodar `monitoring_canonicos.sql` antes de entender o schema. Arquivo corrigido.

**Pendente no próximo deploy:**
1. Rodar `supabase/migration_categorias_precos.sql` no SQL Editor do Supabase (obrigatório antes do push)
2. Verificar colunas criadas com a query de verificação do arquivo
3. `git push` para Railway ativar todas as features novas

### 2026-06-04 — Sessão de estruturação do sistema de skills + limpeza do CLAUDE.md

**Briefing inicial:**
> "Eu tenho visto pouco a utilização dessas skills nos meus utlimos chats, devo dar algum comando para que elas sejam usadas ou talvez esteja usando de forma errada. Me fale mais sobre e juntando esse assunto quero desenvolver instruções para o projeto para que ele seja estruturado de uma melhor maneira, sabendo da estrutura do claude e suas divisoes em projetos e skills desenvolva essa descrição para que eu possa usar"

**Diagnóstico:** as 14 skills criadas estavam em `E:\Economizei Bot\skills\` — pasta que Claude não auto-descobre. O path padrão de descoberta é `.claude/skills/`. Sistema também precisava de **instruções de projeto** que carregam em toda sessão para amarrar tudo.

**Ações executadas:**
1. Movidas as 14 skills + 2 antigas (`copy-review`, `roadmap-deps`) + `README.md` para `E:\Economizei Bot\.claude\skills\`.
2. Criado `E:\Economizei Bot\PROJECT_INSTRUCTIONS.md` com boot sequence, gatilhos automáticos das 6 transversais, formato `dual-format`, ritual de fim de sessão.
3. Adicionado bloco no topo do CLAUDE.md apontando para o sistema de skills + project instructions.

**Comando complementar do Gabriel:**
> "Vamos aplicar essa instrução sugerida no início do claude.md e tente reduzir ele retirando tudo que for obsoleto, para segurança transfira para outra pasta"

**Ações de limpeza:**
- Criada pasta `Economizei app/arquivo-historico/` com arquivo `CLAUDE_arquivo_2026-06-04.md`.
- Movidas 3 decisões revogadas (paywall adiado, tag `beta_fundador` com benefícios, promessa "R$ 9,90 vitalício") da seção 7 do CLAUDE.md.
- Condensadas as sessões de 2026-05-08 e 2026-05-15 da seção 11 — apenas o que permanece em vigor fica no CLAUDE.md, conteúdo completo (briefings + comandos verbatim) preservado no arquivo histórico.
- Bloco "Estrutura modular planejada (em transição)" reescrito como "Arquitetura modular atual" refletindo a realização via sistema de skills.
- Linha "Última atualização" no topo movida para 2026-06-04.

**Princípio reforçado:** sistema de skills + project instructions resolveu o problema de modularização sem precisar quebrar o CLAUDE.md em múltiplos arquivos `.md`. A memória institucional permanece em 1 documento; a operação é modular via skills disparadas por gatilho.

---

## Como usar este arquivo

**No início de cada sessão no Cowork ou Claude Code:**
> "Leia o CLAUDE.md antes de começar. Hoje quero trabalhar na área de [Marketing / Produto / Financeiro / etc.]."

**Para atualizar:**
> "Adicione no CLAUDE.md em Decisões Tomadas: [data] — [decisão] — [racional]"
> "Marque como concluído no roadmap: [item]"
> "Adicione em Aprendizados: [insight do mês]"
> "Adicione em Histórico de Comandos: [comando importante]"
