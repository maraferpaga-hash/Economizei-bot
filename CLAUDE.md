# 🧠 Memória Institucional — Economizei

> **🛠️ Sistema de skills ativo:** veja `C:\Economizei\.claude\skills\README.md` (índice das 19 skills + 10 regras de ouro).
> **🧠 Senso crítico automático:** a skill `economizei-critical-partner` roda em todo pedido não-trivial e **para antes de executar** quando detecta atrito real. Memória dos apontamentos em `C:\Economizei\Economizei app\CRITICA_LOG.md` — ler no boot.
> **🚀 Instruções do projeto:** veja `C:\Economizei\PROJECT_INSTRUCTIONS.md` (boot sequence + comportamentos default).
> **💻 Memória técnica de código:** veja `C:\Economizei\CODE_GUIDE.md` (stack, padrões, decisões técnicas em vigor). Ler quando a sessão envolver código.
> **🤖 Máquina Local & Agenda:** veja `C:\Economizei\AGENDA.md` (fila da automação de **código**, executada **localmente** pelo Gabriel via Claude Code `/tarefa`, com o **financeiro blindado** pelo `check-firewall.mjs` + revisão humana — + painel de ações do Gabriel). Guia em `Economizei app/Automacao_Maquina_Noturna.md`. **O GitHub Actions foi descontinuado** (custo/complexidade não compensaram pra 1 pessoa). Em toda sessão, ofereça puxar o estado da agenda (o que está em revisão, o que está pronto, pendências humanas).
> Leia os 4 no início de cada sessão, junto com este arquivo.
>
> **📝 Nota de correção (2026-07-02):** onde este arquivo diz "cod-0030..0036" (cadeia do Alerta Pro), leia **cod-0030..0035** — a cadeia vai só até o cod-0035 (matching → acompanhamentos → supérfluo → comandos → NL → alerta de limite). O "..0036" é um erro de numeração antigo; a AGENDA já está corrigida. Não há tarefa cod-0036.

> Este arquivo é o **cérebro da empresa**. Leia-o no início de cada sessão para ter contexto completo
> sobre o produto, a estratégia e o estado atual da operação.
> Atualize-o sempre que houver decisões importantes, mudanças de direção ou novos aprendizados.

---

## 1. 🏢 Identidade da Empresa

**Nome:** Economizei
**Categoria:** SaaS / B2C
**Estágio:** Pré-lançamento — produto funcional (MVP testado uma vez sem escala), em fase de validação comercial
**Operação:** 1 pessoa (fundador, Gabriel), com vasto conhecimento em administração
**Localização do fundador:** Vancouver, BC, Canadá — saída fiscal do Brasil declarada à Receita Federal. Empresa jurídica será aberta em British Columbia (BC). Ver seção 3 para impacto no modelo de pagamentos.

> ⚠️ **Pré-requisito bloqueador — Empresa BC desbloqueia: Meta Ads, Meta Business Manager, Hotmart (planos anuais + afiliados) e Wise Business (recebimento de PIX).** Sem a empresa aberta, nenhuma dessas integrações pode ser configurada legalmente. Passo a passo completo em `Economizei app/Abertura_Empresa_BC_2026-06-24.md`.
>
> ⏸️ **ADIAMENTO (decisão 2026-07-09):** a abertura da empresa em BC **não será possível antes de OUTUBRO/2026**. Tudo que depende dela (Meta Ads, Hotmart, Wise, afiliados — monetização em escala) fica bloqueado até lá. A janela jul→out/2026 vira **tempo de construção**: ver seção 7.2 (Horizonte de Longo Prazo) e `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`.
>
> **Custos esperados (aviso):**
> - Abertura (uma vez): ~CAD 380–600 (~R$1.500–2.400) — NAR (CAD 30) + incorporação (CAD 350) + serviço opcional (CAD 50–200)
> - Manutenção anual: ~CAD 650–2.000 (~R$2.600–8.000) — Annual Report (CAD 45) + contador T2 obrigatório (CAD 500–1.500) + endereço registrado se precisar (CAD 100–200) + conta bancária (CAD 0–300)
> - Imposto corporativo sobre lucro: **11% combinado** (federal 9% + BC 2%) até CAD 500k — zero enquanto o negócio tiver prejuízo operacional
> - Meta Ads: **sem os 12,15% de impostos brasileiros** (economia real em cada real gasto em mídia)
> - Esses custos entram no orçamento antes de iniciar. A economia nos ads e a viabilidade jurídica de receber pagamentos internacionais justificam o investimento.
**Restrição operacional:** ~12h/semana (média 10–14h, ver seção 6)
**Praça inicial de lançamento:** Fernandópolis-SP e região (interior noroeste de SP) — ver seção 7.1
**Última atualização:** 2026-09-03 (2ª sessão) — **Fila destravada (0 → 5 tarefas elegíveis) e TRAVA 1 do `estoque.mjs` corrigida na causa-raiz;** achado novo verificado no código: **o `/apagar` (LGPD) não apaga nada** — `apagarDadosUsuario` aborta no passo 3 numa tabela que nunca existiu, então `usuarios` nunca é apagado e nem o CASCADE dispara (nasce a cod-0076 [P0]). Doc: `Economizei app/Destravamento_Fila_e_TRAVA1_2026-09-03.md`. Anterior (2026-09-03, 1ª sessão) — **Máquina de Conteúdo, Fase 0 entregue: `AGENDA_CONTEUDO.md` + esqueleto (`conteudo/`, `estoque_conteudo/` gitignored) + peça-piloto renderizada (30s, 1080×1920, IPCA jul/26 com fonte na tela, muda à espera da gravação do Gabriel); 8 decisões travadas (render híbrido ffmpeg→Remotion, run às quintas, `verificar` bloqueante, Fase 2 em ≥200 cupons/≥5 mercados/≥20 obs, só IBGE na Fase 1); Fase 1 bloqueada até o veredito do piloto** (doc: `Economizei app/Desenho_Maquina_Conteudo_2026-09-03.md`). Anterior (2026-08-30) — **`/entregar` esvaziou o estoque (5 dias parado): cod-0071 (núcleo canal-agnóstico do recibo) + lote `cobertura-jobs` (las-03+las-01) + las-04 parcial (`charts.js`) em 4 commits até `7ec39a6` no `origin/main`; 712/713 testes verdes (1 `todo` documentando um defeito no `charts.js`, "Total: R$ 1,00" em mês de soma zero, correção pendente de decisão); AGENDA curada (Concluído acima do teto de 10 — 10 tarefas antigas migradas pro snapshot). Pendência aberta: padrão `deps` opcional (injeção de dependência pra teste) usado 2x sem ratificação sua.** Anterior (2026-08-22, 2ª sessão) — **`/entregar` entregou o "Passo 4" da adoção ESTOQUE (Gabriel refinou `scripts/estoque.mjs` com verificação de cadeia entre levas + reescreveu `.claude/commands/entregar.md`/`tarefa.md`) + cod-0062b (guard lista-branca do `precos_mercado` + copy do comprovante PIX) + cod-0065b (`fmtMoeda`, semente i18n) em 3 commits até `7f38bbf` no `origin/main`; 604/604 testes verdes, estoque esvaziado (0/4). Achado no caminho: o `estoque.mjs aplicar` recusa a próxima leva enquanto a anterior não for `limpar`-ada, mas o `/entregar` só manda limpar DEPOIS do push — contradição real entre ferramenta e doc quando há 2+ levas na mesma sessão (contornado chamando `limpar` logo após cada commit, já que o conteúdo fica preservado no git); ainda não corrigido no script/doc.** Anterior (2026-08-22, 1ª sessão) — **`/entregar` (modo TREE) adotou o regime ESTOQUE (script ponte `scripts/estoque.mjs` + docs, até então só no disco) e entregou cod-0074 (gate Pro nos comandos do Alerta Pro, mesmo padrão da cod-0073) em 2 commits até `933e855` no `origin/main`; AGENDA reconciliada, estoque 3/4→2/4. cod-0075 segue em aberto — a rotina matinal de 08-21 achou que a premissa dela (vazamento do gate no Agente) não se sustenta.** Anterior (2026-08-20) — **`/entregar` (modo TREE) entregou cod-0073 (gate Pro no `/comparar` — fecha o achado B10: até aqui R$9,90/mês comprava só "cupons ilimitados") + docs da sessão 08-18 (RLS fechado, regra 14, veredito do teste de commit no sandbox, Plano B estoque) em 2 commits até `886cd1a` no `origin/main`; AGENDA reconciliada. Pendência aberta: cod-0075 (mesmo gate na intent do Agente) — sem ela o Pro segue destravado ao perguntar em texto livre.** Anterior (2026-08-18) — **🔐 O RLS foi ligado (S4 fechado, 2 scripts): acabou a exposição em que quem tivesse a anon key lia os dados de todos os usuários — o bloqueio das cod-0069/0070 caiu e o pré-requisito para usuário externo está satisfeito. Nasce a regra 14 (§11): verificar estado, não aceitar resumo — o detector D6 bateu 4/4 acatados depois de a memória mentir 3 vezes em 3 semanas por registro otimista.** Anterior (2026-08-15) — **`/entregar` (modo TREE) destravou a esteira: cod-0062a (blindagem de agregação, 8 dias parada no working tree) entregue em 2 commits até `e10701f` no `origin/main`; achado na entrega — o patch do `index.lock` de 08-07 tinha ficado com o `.claude/commands/tarefa.md` só parcialmente corrigido (markdown quebrado, `git branch`/`git log` sem `GIT_OPTIONAL_LOCKS=0`); substituído pelo conteúdo correto antes de commitar; AGENDA reconciliada (Concluído acima do teto de 10 — 4 tarefas antigas migradas pro snapshot).** Anterior (2026-08-07, 2ª sessão) — **Revisão da máquina: causa-raiz do `index.lock` encontrada e corrigida (`GIT_OPTIONAL_LOCKS=0` — eram os comandos de LEITURA pegando o lock, não o commit), fila autônoma reabastecida por fatiamento das porte-G (5 tarefas novas, com a cod-0062a nascendo de um achado real: `buscarComprasDoMes`/`buscarHistorico` não filtram `tipo`, então PIX entraria no `/gastos` como gasto), `SUPABASE_SERVICE_ROLE_KEY` CONFIRMADA no Railway (S2 fechado) e o S4 destravado — mas o `rls_migration.sql` cobre só 5 das 15 relações e as 7 views furam RLS por serem security-definer: complemento escrito em `supabase/rls_migration_parte2_2026-08-07.sql`.** Anterior (mesmo dia) — **`/entregar` (modo TREE) entregou a cadeia de Naturalidade do Agente: cod-0044 (sugestões pós-resposta) + cod-0048 (gráfico sob demanda), commit combinado (arquivo `intents.js` compartilhado) em 2 commits até `da1307e` no `origin/main`; AGENDA reconciliada.** Anterior (2026-08-05) — **`/entregar` (modo TREE) fechou a sessão: cod-0068 + cod-0067 + cod-0025 + Máquina 3.0 (comandos reescritos) + corpus real (PIX/Canadá) + migration PIX preparatória + docs, em 8 commits até `b485ba8` no `origin/main`; AGENDA reconciliada.** Anterior (mesmo dia) — **Frentes 1 e 2 desdobradas: o material humano chegou (3 comprovantes de PIX + 6 recibos de Vancouver) e virou corpus versionado em `test/corpus/`, destravando cod-0062 e cod-0065; e o app foi decidido como 2º CANAL (mesmas funções, mesmo banco, ambos aceitam foto — WhatsApp segue carro-chefe), nascendo cod-0071 (núcleo canal-agnóstico) + cod-0069/0070 (API e PWA, travadas pelo RLS). Registrado também: sem empresa BC não se busca cliente, mas se busca usuário controlado** (doc: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md`). Anterior (mesmo dia) — **`/entregar` fechou a sessão anterior: cod-0043 (memória curta de follow-up do Agente, 6 dias entupindo a esteira) + docs (Máquina 2.1 modo puxado + desentupimento da esteira + checkpoints) entregues em 2 commits** (`9c094aa`/`2790e44`, `origin/main`; AGENDA reconciliada). Ainda nesta sessão, DEPOIS da entrega — **Máquina 3.0 (opção B1) implantada: a máquina passa a COMMITAR em branches `maquina/*` (nunca `main`, nunca `push`), com 3 leis de pilha (linear · teto 3 · main parada) + painel "📚 Pilha da máquina" na AGENDA; `/tarefa` e `/entregar` reescritos (o segundo virou mergeador de pilha); rotina das 8h religada e teto por run restaurado — B3+B2 revertidos. Confirmado no Railway/Supabase: `SUPABASE_SERVICE_ROLE_KEY` NÃO existe (o bot roda com a chave `anon`) e o RLS está desligado nas tabelas de usuário — dados expostos a quem tiver a anon key; `assinatura_eventos` não existe (nada a dropar).** Anterior (mesmo dia, sessão que gerou o trabalho) — **Esteira desentupida: reengajamento desligado por decisão (fica só o resumo de fim de mês, que já funciona), fila reordenada (cod-0068/0067/0025 no topo; 0044/0048/0049 no fim) e bloco Supabase levantado com SQL exato** (doc: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md`). Anterior (2026-07-28) — **`/entregar` fechou a sessão anterior: cod-0035 (comando `/teto` + alerta proativo de limite, fecha a cadeia do Alerta Pro) + docs (senso crítico automático + Máquina 2.0 + repriorização) entregues em 3 commits** (`df18b53`/`e700ed6`/`600db9d`, `origin/main`; AGENDA reconciliada). Anterior (2026-07-27, 4ª sessão) — **Máquina 2.0 aprovada e implantada: teto por run sobe (até 3 tarefas P ou 1 M ou 1 lote, ≤~500 linhas de diff), lotes (`lote:`) e `porte:` na AGENDA, Fila de lastro SÓ-testes como fallback, rotina matinal alinhada ao firewall advisory + auto-revisão adversarial + métricas de piloto; run pesada de sábado adiada pro pós-piloto (gatilho: 10 runs — lembrete na AGENDA)** (doc: `Economizei app/Analise_Maquina_Pesada_e_Lotes_2026-07-27.md`). Anterior (3ª sessão) — **Senso crítico automático ligado: nova skill transversal `economizei-critical-partner` (para antes de executar quando o pedido tem atrito real) + `Economizei app/CRITICA_LOG.md` como memória que faz o sistema calibrar com o tempo** (doc: `Economizei app/Senso_Critico_Automatico_2026-07-27.md`). Anterior (2ª sessão) — **Repriorização: fila com 6 tarefas (cod-0035, cod-0066, e a cadeia do Assistente em modo híbrido — 0043/0044/0048 + 0049 antecipada com gatilhos pré-programados); limpa da AGENDA (backlog morto fora, Concluído no teto); webhook auth 100% no ar; 🔴 restantes: DROP MP no Supabase + RLS dedup + `lembretes_enviados`** (doc `Economizei app/Sessao_Repriorizacao_Fila_2026-07-27.md`). Anterior (manhã) — **`/entregar` fechou a sessão anterior: cod-0033 (comandos de acompanhamento) + firewall ADVISORY/remoção do MP entregues em 3 commits** (`8588c4b`/`4f49ae7`/`8ad9d4f`, `origin/main`; AGENDA reconciliada). Anterior (2026-07-26, 7ª sessão) — **Monetização de dados agregados dos recibos registrada como candidata a pilar de receita** (só registro estratégico — prospecção de clientes fica pro pós-empresa BC + anúncios rodando + painel com escala; venda só agregada/anonimizada por LGPD; recompensa ao usuário hoje = não-cash; doc `Economizei app/Pesquisa_Cupom_por_Recompensa_Modelo_2026-07-26.md`). Também nesta sessão — **Financeiro destravado: firewall → ADVISORY (avisa, não bloqueia) + Mercado Pago removido do código** (working tree, aguarda `git rm src/mercadopago.js` + `/entregar` + DROP das colunas MP no Supabase pós-deploy). 2 problemas de saúde do banco enfileirados (RLS dedup, `lembretes_enviados`). Plano de passos: `Economizei app/Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`. Anterior (6ª sessão, 2026-07-24) — **`/entregar` fechou o webhook sem auth (N1 da Auditoria Externa) e entregou o bloco de gasto supérfluo + intent `gasto_por_termo`** (cod-0053/cod-0032/cod-0034, `origin/main` até `b923805`; detalhe na seção 8). Anterior (5ª sessão) — **Pagamentos "dois trilhos" decididos** (Stripe PSP direto + MoR/afiliados p/ o que escala sem o Gabriel; IOF 3,5% e obrigações da empresa BC registrados na seção 3 — docs `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` + `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`; auditoria externa em `Auditoria_Externa_2026-07-17.md`). Anterior (4ª sessão) — **Vigilância agendada criada** (sentinela semanal dom 20h + checkpoint N2 mensal + lembrete de sexta; só leem/reportam, nunca commitam/tocam dinheiro — ver Decisões, seção 8). Anterior (3ª sessão) — **CLAUDE.md enxugado (~236 KB → ~60 KB, limite de 800 linhas restaurado):** esta linha deixou de ser log corrido de sessões; a tabela de Decisões (seção 8) mantém só as últimas ~21 comprimidas (versões completas de TODAS em `Economizei app/arquivo-historico/DECISOES_arquivo_2026-07-15.md`); a seção 11 virou "Comandos & regras permanentes" (histórico narrativo integral em `Economizei app/arquivo-historico/SESSOES_arquivo_2026-07-15.md`); órfãos da raiz arquivados. **Regra de teto por sessão (nova, inegociável):** cada sessão registra no máximo 1 linha na tabela de Decisões (com pointer pro doc de sessão em `Economizei app/`) + 1 frase aqui; verbatim na seção 11 SÓ se criar regra permanente; o detalhe completo mora no doc de sessão. Diagnóstico: `Economizei app/Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md`.

> **📂 Arquitetura modular atual:**
> A modularização da memória institucional foi materializada via **sistema de skills** + **instruções de projeto**, não via quebra do CLAUDE.md em múltiplos `.md`.
> - `CLAUDE.md` (este arquivo) — estratégia, princípios, persona, pricing atual, stack atual, áreas reais, decisões em vigor, comandos recentes. Lido em toda sessão.
> - `.claude/skills/` — 19 skills (17 `economizei-*` + 2 legadas `copy-review`/`roadmap-deps`). Disparam automaticamente por gatilho. Índice e contagem oficial no README de skills.
> - `Economizei app/CRITICA_LOG.md` — memória do senso crítico (apontamentos levantados, acatados e recusados + placar dos detectores). Lido no boot, atualizado no fim da sessão.
> - `PROJECT_INSTRUCTIONS.md` — boot sequence + comportamentos default + ritual de fim de sessão.
> - `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria crítica externa, pontos abertos.
> - `Economizei app/Projecao_6_meses.md` — projeção 3 cenários + gatilhos semáforo.
> - `Economizei app/arquivo-historico/CLAUDE_arquivo_2026-06-04.md` — conteúdo arquivado (decisões revogadas, sessões antigas consolidadas).
> - `AGENDA.md` — fila viva da Máquina Noturna + protocolo de execução + painel "Ações do Gabriel". Lido em toda sessão (boot list acima). Guia em `Economizei app/Automacao_Maquina_Noturna.md`.

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

> ⚠️ **"A classificação dos itens é o CORAÇÃO do Economizei."** *(declarado pelo Gabriel em 2026-06-27 — princípio inegociável)*
> Toda a inteligência do produto — gastos por categoria, inflação pessoal, comparativo entre mercados, alerta de supérfluo, acompanhamento personalizável — **depende de o item ter sido lido, nomeado (`nome_canonico`) e categorizado de forma precisa e sem erro**. Se a classificação erra, todo "andar de cima" mente: o número fica errado, o alerta dispara à toa, a busca por "cerveja" não acha a cerveja. Por isso:
> - **Classificar certo vem antes de qualquer feature nova.** Função que dependa de leitura do item só é tão boa quanto a classificação por baixo.
> - **Mexeu em algo que afeta extração/categoria/`nome_canonico`? Roda os testes de regressão de classificação** (corpus de cupons reais) **antes de subir.** Nunca "no olho".
> - **Tratar como dado de alto risco:** prefira a saída segura (não inventar item/categoria) a uma classificação errada que parece certa. `temperature:0` + reconciliação item×total + rastreio `canonico_suspeito` existem por isso — manter e fortalecer, nunca afrouxar sem teste.
> - **Detalhe técnico e invariantes:** `CODE_GUIDE.md` (regra "Classificação é invariante crítico").

---

## 1.5. 🧭 Posicionamento & Norte Estratégico *(definido 2026-06-09)*

> **📄 Documento completo:** `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` (missão por inteiro, 3 camadas de valor, Teste de Norte com exemplos, mapa das funções atuais). Esta seção é o resumo que se lê em toda sessão.

**Missão dita por inteiro:** *fazer o brasileiro médio entender o próprio gasto — e usar IA para trazer conhecimento, informação e inteligência a esse gasto.* Não somos um leitor de cupom; somos a **camada de inteligência** que transforma o gasto bruto da pessoa em entendimento, e o entendimento em habilidade financeira real (gastar melhor, economizar, ter mais valor sobre o próprio dinheiro). Isso dá nome e eixo oficial ao reframe "assistente de compras / inteligência sobre o gasto" discutido em 2026-05-19.

**O Norte (frase-bússola que decide discussão):**

> **"A cada interação, o usuário sai sabendo algo sobre o dinheiro dele que ele não sabia antes."**

Se uma feature, mensagem ou fluxo não passa mais ciência, clareza ou inteligência sobre o gasto, ele não pertence ao produto — por mais técnico ou bonito que seja. O norte responde **"para onde"**; os princípios (zero atrito, grátis funciona, frame brasileiro) respondem **"de que jeito"**. O norte não revoga nenhuma decisão da seção 8.

**As 3 camadas de valor (a escada — prefira sempre subir):**

1. **Ciência (saber):** o gasto vira informação organizada — leitura do cupom, categorização, `/gastos`, resumo mensal.
2. **Inteligência (entender):** a IA tira a conclusão que a pessoa não tiraria — alerta em 3 níveis, insight de categoria, comparativo entre mercados, alerta preditivo.
3. **Habilidade (agir melhor):** com ciência + inteligência, a pessoa gasta melhor e economiza de verdade. É o resultado que justifica o produto existir.

> Feature que para na Camada 1 (só mostra dado) tem valor limitado. O diferencial é puxar pra Camada 2 e 3. Em dúvida, construa o que **sobe a escada**.

**O Teste de Norte (filtro antes de construir feature / escrever copy / priorizar roadmap):**

Pergunta-mãe: **"Isso deixa o usuário com mais ciência ou inteligência sobre o gasto dele?"** Se não, pare e questione o esforço. Depois, as 4 sub-perguntas: (1) **Camada** — joga em qual? Sobe a escada? (2) **Atrito** — entrega sem pedir mais trabalho da pessoa? (3) **Quem faz** — é a IA fazendo o peso, ou empurra esforço pro usuário? (4) **Honestidade** — a inteligência prometida é real hoje? (passa pelo `financial-firewall`). Veredito: passa com folga → construir; passa raspando → só se barato ou repensar pra subir a escada; não passa → cortar/reformular.

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

## 3. 💰 Modelo de Negócio (atualizado em 2026-06-23)

**Modelo:** Freemium real (modelo Spotify) + 3 tiers pagos — **TODOS ATIVOS desde o lançamento**. **A partir de 2026-06-23 o plano ANUAL é a oferta-destaque** (pague 10, leve 12 = ~2 meses grátis); o mensal continua existindo como entrada de baixo atrito. Pagamento via **PIX ou cartão** (MP recorrente); na fase atual a confirmação ainda é manual até o gatilho de automação (≥ 5 pagantes).

| Plano | Mensal | **Anual (2 meses grátis)** | Quem | Funções |
|---|---|---|---|---|
| **Grátis** | R$0 | — | 1 pessoa | Foto do cupom + análise imediata + resumo mensal automático + alerta básico (>20% acima da média) + `/historico` + `/apagar`. **Limite: 10 cupons/mês** (técnico, custo Gemini) |
| **Individual** | R$9,90/mês | **R$99/ano** (≈ R$8,25/mês · economiza R$19,80) | 1 pessoa | Tudo do Grátis + **cupons ilimitados** + **comparativo entre mercados** + **alerta inteligente** (preditivo, categorizado por tipo de item) |
| **Família** | R$15/mês | **R$150/ano** (≈ R$12,50/mês · economiza R$30) | até 3 pessoas | Tudo do Individual + **visão consolidada da família** + **comparação por membro** |
| **Família+** | R$22/mês | **R$220/ano** (≈ R$18,33/mês · economiza R$44) | até 5 pessoas | Igual ao Família + **2 vagas adicionais** (5 pessoas no total) |

> **Nota sobre o preço do Individual:** o Gabriel pediu "~R$100/ano". Fixado em **R$99** porque fecha exatamente a narrativa de marketing **"pague 10 mensalidades, leve 12"** (10 × R$9,90 = R$99) — número redondo de "2 meses grátis". Mesma lógica aplicada a todos os tiers.

**Por que o anual virou o norte comercial (2026-06-23):** elevar o **ticket médio (ARPU)** e trazer **caixa adiantado** pra que o investimento em aquisição (~R$200, custo por ativação estimado R$30–54) faça sentido. O anual (a) recupera o CAC na hora (R$99 entram já, em vez de pingar R$9,90), (b) trava o LTV e (c) mata o churn por esquecimento de renovação — a mesma dor que motivou a assinatura recorrente no cartão (06-07). **Meta:** que **~80% dos pagantes** estejam no anual. ⚠️ **80% é estrela-guia, não premissa de lançamento** — ver caveats abaixo.

**Lógica do limite de 10 cupons no free:** Gabriel paga por cada chamada do Gemini Vision. Limite é técnico (anti-abuso), não artificial. Cobre quem vai ao mercado 2-3x/semana com folga.

**Princípio mantido:** *"bom, barato e útil — grátis funciona de verdade, pago é genuinamente melhor"*. O free resolve a dor central (saber pra onde vai o dinheiro). O Pro entrega features que valem o preço: comparativo entre mercados, alerta preditivo, plano família. O anual não quebra o "zero atrito" porque o **mensal continua disponível** — quem não quer se comprometer entra mensal e migra depois.

**Caveats honestos do plano anual (financial-firewall):**
1. **Atrito vs. comprometimento.** R$99 à vista é um pedido MUITO maior que R$9,90/mês. Para um produto pré-lançamento sem retenção validada, esperar 80% no anual *no dia 1* é otimista. O caminho realista: free → a pessoa **vive o valor** por alguns meses → aí o upsell anual converte. Vender anual a frio pra quem nunca mandou um cupom tende a falhar.
2. **Anual amplifica, não conserta.** Receber um ano adiantado **não muda a regra** de só escalar aquisição depois de **W2 ≥ 30%** no cohort de Fernandópolis. O anual de-risca o CAC, mas só se vende anual pra quem reteve. Sequência certa: validar W2 → upsell anual pra quem ficou → aí escalar ads.
3. **Anti-padrão a evitar.** Não deixar "já recebi o ano adiantado" virar desculpa pra gastar os R$200+ antes da retenção provar que o motor segura.
4. **Reembolso.** Cobrar um ano de quem usou duas vezes e sumiu gera risco de reembolso/chargeback. Política: honrar reembolso proporcional com elegância — não embolsar ano de quem não usou.

**Fluxo de pagamento — ARQUITETURA "DOIS TRILHOS" (decidido 2026-07-17; docs: `Economizei app/Parceiros_Pagamento_Empresa_BC_2026-07-17.md` + `Economizei app/Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md`):**

> **Contexto:** Gabriel declarou saída fiscal do Brasil e abre empresa em BC (Canadá, out/2026). O Mercado Pago exige residência brasileira e foi abandonado. A **empresa BC reabre o Stripe** (antes bloqueado): conta Stripe canadense aceita PIX + PIX recorrente (Pix Automático) + cartão, liquidando em **CAD**. Decisão do Gabriel (2026-07-17): rodar **dois trilhos em paralelo**, cada um pra uma fonte de cliente. Os dois terminam no mesmo `POST /admin/ativar-pro`, que liga o `is_pro` — o bot não sabe por qual trilho a pessoa pagou.

| Trilho | Plataforma | Fonte de cliente | Papel | Custo |
|---|---|---|---|---|
| **A — DIRETO (PSP)** | **Stripe** (conta BC) | Você traz (WhatsApp, orgânico, seus ads, landing) | Base de margem alta; mensal + anual + cartão, recorrência automática | Baixo (taxa Stripe; **comprador paga IOF ~3,5%** por ser cross-border) |
| **B — AFILIADOS (MoR)** | **Hotmart** (default) — Braip a checar p/ fit-assinatura | Terceiro traz (afiliado vende por você) | Distribuição que escala sem você; só nos **anuais** | Alto (~9,9% + comissão 20–25%); só sobre venda incremental |

> **Por que os dois:** margem máxima em quem o Gabriel traz (Trilho A) + exército de afiliados pra quem ele não alcança (Trilho B). MoR não precisa ser Hotmart — é o maior marketplace + payout internacional via Payoneer confirmado, mas **elegibilidade de produtor não-residente é item a confirmar direto com cada plataforma**. Risco #1 = conflito de canal (afiliado "roubar" quem viria direto): mitigado por afiliado-só-no-anual + funil direto primário + regra anti-lance-em-marca.

**📊 Dados fiscais registrados (jul/2026 — confirmar com contador antes de virar premissa; fontes nos docs):**
- **IOF Trilho A (PSP cross-border):** **3,5%** sobre cartão internacional / câmbio p/ pessoa física (unificado desde jul/2025, Decreto 12.499/2025 restabelecido pelo STF). Pago pelo COMPRADOR brasileiro → afeta conversão e o preço que ele vê. Trilho B (MoR doméstico) **não** tem IOF pro comprador.
- **Imposto corporativo BC:** **~11%** combinado (9% federal + 2% BC) nos 1ºs CAD 500k de active business income, via Small Business Deduction (exige qualificar como **CCPC**); acima de 500k = 27%. Zero enquanto houver prejuízo operacional.
- **GST/HST:** limiar small supplier **CAD 30.000** (receita mundial em 4 trimestres); abaixo, registro voluntário (recupera imposto de despesas via ITCs; venda a cliente BR tende a ser export zero-rated — confirmar). **PST-BC:** registro próprio, provável não-incidência em serviço digital exportado (confirmar).
- **T2 (imposto corporativo):** obrigatório todo ano mesmo sem imposto a pagar; vence 6 meses após o fim do ano fiscal; saldo devido 2–3 meses após year-end. **Annual Report** BC ~CAD 45/ano.

**Estrutura anterior (Hotmart anual + Wise BRL mensal, 2026-06-24) — agora é um SUBCONJUNTO do Trilho B + o mensal:** ⚠️ furo a validar — uma fonte indica que **Wise não saca pra fora de US/EU**; confirmar se o Wise Business BRL→CAD do mensal fecha, senão o Stripe absorve o mensal também. Detalhe do fluxo Hotmart/afiliados abaixo:

| Camada | Plataforma | Quem paga | Como ativa |
|---|---|---|---|
| **Free** | — | Ninguém | Automático no 1º contato |
| **Mensal** (R$9,90–R$22) | **PIX → Wise BRL** | Usuário faz PIX p/ conta BRL do Wise | Gabriel ativa `is_pro` manualmente (até 1h) |
| **Anual** (R$99–R$220) | **Hotmart** | Checkout Hotmart (cartão/PIX) | Webhook Hotmart → endpoint `/admin/ativar-pro` → automático |
| **Anual via afiliado** | **Hotmart** | Checkout via link rastreável do afiliado | Mesmo webhook; afiliado recebe comissão recorrente |

**Por que Hotmart para o anual:**
- Hotmart paga direto para conta bancária canadense (não-residentes suportados)
- Cuida de nota fiscal brasileira, chargebacks e renovação automática
- Taxa ~9,9% + R$1/transação — aceitável no ticket anual (≈11% no R$99); inviável no mensal (≈30% no R$9,90)
- Suporta **programa de afiliados com comissão recorrente** — afiliado ganha em cada renovação

**Programa de afiliados (decidido 2026-06-24):**
- Planos elegíveis: **somente anuais** (R$99 / R$150 / R$220) — margem suporta comissão
- Comissão: **20–25%** do valor da venda + recorrente em cada renovação anual
- Perfis: afiliação aberta no marketplace Hotmart + recrutamento direto de influencers de finanças/economia
- Fluxo: link do afiliado → checkout Hotmart (coleta WhatsApp + pagamento) → webhook → bot ativa Pro e manda boas-vindas
- **Pendência técnica:** construir webhook listener do Hotmart que chama `/admin/ativar-pro` com o número de WhatsApp do campo customizado do checkout

**Por que Wise BRL para o mensal:**
- Wise Business vinculado à empresa canadense tem dados de conta BRL que aceitam PIX
- Usuário paga PIX normalmente → Gabriel converte para CAD no Canadá
- Fluxo legal e limpo para não-residente com saída fiscal declarada
- Volume baixo do mensal torna a ativação manual aceitável no curto prazo

**Renovação:**
- Anual (Hotmart): automática no cartão; boleto/PIX lembrado pelo Hotmart
- Mensal (PIX manual): lembrete no dia 25 via bot

**Cohort de Beta (uso técnico apenas):** contas criadas durante os 60 primeiros dias recebem uma marca temporal no Supabase **puramente para análise de retenção comparada**. **Não há benefício comercial prometido a esse grupo:** sem 3 meses grátis, sem preço travado, sem desconto vitalício, sem acesso antecipado pago. **Decidido em 2026-05-19, reforçado em 2026-05-22** — subsidiar custo de Gemini sem unit economics validado é compromisso financeiro pesado demais.

**Métricas-chave a acompanhar:**
- MRR (Receita Recorrente Mensal) — começa a contar desde o lançamento (anual entra como MRR = valor/12)
- **Ticket médio / ARPU** (receita por pagante) — métrica que o plano anual existe pra elevar
- **% de pagantes no plano anual** — meta-norte de ~80% (estrela-guia, ver Seção 3)
- Pagantes (acumulado, novos por mês) por forma de pagamento (PIX × cartão) e por ciclo (mensal × anual)
- Taxa de conversão Free → Pro (novos pagantes / cadastros mês)
- Churn de pagantes (mês a mês) — esperado cair com mix anual maior
- LTV / CAC Ratio
- DAU / MAU (usuários ativos diários / mensais)
- Cupons analisados por usuário ativo
- **Retenção W2** (mandou cupom na semana 2) — métrica crítica de validação de hábito e **gatilho que libera escalar aquisição** (≥ 30%)

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

### 7.2. 🔭 Horizonte de Longo Prazo *(criado 2026-07-09 — Empresa BC adiada pra outubro/2026)*

> **📄 Documento completo:** `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` (contexto, 2 frentes, fases sugeridas, pontos de discussão). Esta seção é o resumo lido em toda sessão.

**Contexto:** a abertura da empresa em BC **só será possível a partir de outubro/2026**. Meta Ads, Hotmart, Wise e afiliados ficam bloqueados até lá — logo, **monetização em escala está estruturalmente pausada**. A janela jul→out/2026 é tempo de construção: validar o produto no Brasil (a métrica é retenção W2, não receita) e usar a Máquina Local pra construir a fundação do que vem depois. **Janela de planejamento da AGENDA: até 2 meses à frente** (não mais só a fila imediata).

**As 2 frentes-semente (aguardam sessão de desdobramento — NADA é fila ainda):**

1. **Ingestão multi-documento financeiro.** Hoje o bot só vê cupom (foto). Expandir o mesmo gesto zero-atrito pra: fatura de cartão de crédito (PDF), comprovante de PIX, notificação de banco, recibo em PDF/foto de qualquer tipo — a pessoa manda o arquivo, o bot entende, classifica e devolve insight. Destrava a G1 (assinaturas/gastos invisíveis), reprovada em 06-09 justamente por "o bot não vê fatura". ⚠️ Dado muito mais sensível que cupom — processa-em-memória-e-descarta + LGPD valem em dobro; a classificação continua sendo o coração.
2. **Internacionalização.** Sequência: **Canadá/Vancouver primeiro** (Gabriel está lá — recibos reais pra testar, empresa BC, mercado local), depois EUA, depois Europa. Implica: i18n das mensagens, multi-moeda, formatos de recibo por país (GST/PST no Canadá), leis de privacidade (PIPEDA/GDPR) e — o ponto mais duro — **canal**: WhatsApp é fraco no Canadá/EUA; a premissa "WhatsApp é o produto" não viaja sem uma decisão nova de canal.

**Regras que continuam valendo:** firewall financeiro intocado (as frentes são 100% não-financeiras até o gate humano); Teste de Norte pra toda feature nova; e Fernandópolis continua sendo a validação — o longo prazo **não rouba a prioridade da fila atual** (deploy do Agente + Leva 2 + Alerta Pro vêm antes de qualquer semente).

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

> **Tabela viva: só as últimas ~21 decisões, comprimidas.** As versões COMPLETAS de todas as decisões (incluindo estas) estão em `Economizei app/arquivo-historico/DECISOES_arquivo_2026-07-15.md`; anteriores a 2026-06-04 também em `CLAUDE_arquivo_2026-06-04.md`. Regra (skill `economizei-memory-system`): máx. ~30 linhas; ao passar, arquivar mantendo ~20. Cada sessão adiciona NO MÁXIMO 1 linha, com pointer pro doc de sessão.

| Data | Decisão | Racional / pointer |
|------|----------|----------|
| 2026-09-03 (2ª sessão) | **Fila destravada: 0 → 5 tarefas elegíveis · TRAVA 1 do `estoque.mjs` corrigida na causa-raiz · 4 decisões suas registradas · 🔴 achado novo: o `/apagar` (LGPD) não apaga nada** | A máquina estava há **5 runs sem produzir** — não por capacidade nem por estoque cheio (2/4, íntegro), mas por **falta de entrada elegível**: Fila pronta 6/6 inelegível e lastro esgotado. Suas 4 decisões: **cod-0075** vira o caminho (b) — o Agente passa a mostrar até `COMPARATIVO_MAX_PRO` comparativos pro Pro, fechando a assimetria em que o `/comparar` entregava mais que a pergunta em texto livre (a premissa original de "vazamento do gate" foi reconfirmada como falsa no código); **cod-0049** destravada com a tabela de cooldown autorizada — `supabase/migration_2026-09-03_insights_enviados.sql` escrita (rodar no Supabase ANTES do push); **las-06** aprovado e promovido a **cod-0077** (log de conteúdo de cupom no `gemini.js:394`, LGPD) e **cod-0078** (achados 2+3 unidos — mesmo endpoint, mesmo arquivo); **TRAVA 1** corrigida no script em vez de no doc. **A TRAVA 1 usava um proxy errado:** perguntava *"a pasta da leva anterior sumiu?"* (ciclo de vida) quando a pergunta é *"o conteúdo já está no repositório?"* (estado) — e o `/entregar` só limpa depois do push **de propósito**, porque as Etapas 3 e 4 desfazem com `reset --hard`, que apagaria os commits: a pasta é a rede de segurança. Nasce `conteudoJaEntregue()` (working tree **ou** blob alcançável pelo histórico de HEAD), usada pela TRAVA 1 e pelo `limpar`; **o doc do `/entregar` não muda**. Conserta junto um **bug irmão latente** que a própria TRAVA 1 mascarava: `limpar N` comparava só com o working tree e teria recusado numa cadeia real (duas levas no mesmo arquivo). Validado em 5 cenários + a sessão inteira do `/entregar` num clone com as 2 levas reais (41/41 verdes, sem contorno). **A 1ª versão da correção tinha um furo** — blob órfão de `reset --hard` passava como entregue; o teste pegou. **O 🔴 mais grave é o achado lateral:** `apagarDadosUsuario` (`src/supabase.js:1582`) apaga no passo 3 de `lembretes_enviados`, tabela que **nunca foi criada** (reengajamento desligado na cod-0068); o `42P01` é relançado, os passos 4–6 não rodam, **`usuarios` nunca é apagado** e por isso nem o `ON DELETE CASCADE` de `acompanhamentos`/`perguntas_log` dispara — um pedido de exclusão LGPD **não apaga nada**. Vira **cod-0076 [P0]** e **bloqueia** a cod-0049 (não se liga tabela nova numa função de exclusão que não chega ao fim). Doc: `Economizei app/Destravamento_Fila_e_TRAVA1_2026-09-03.md` |
| 2026-09-03 | **Máquina de Conteúdo — Fase 0 entregue (piloto renderizado) · render HÍBRIDO (ffmpeg+PIL no sandbox agora; Remotion só se a revisão das 10 peças pedir) · run às quintas · `verificar.mjs` BLOQUEANTE pra número sem fonte · Fase 2 (dado próprio) abre em ≥200 cupons/≥5 mercados/≥20 obs por agregado · Fase 1 só IBGE/SIDRA (Menor Preço fora) · piloto reprovado = parar e repensar formato** | Verificado antes de desenhar: o sandbox do Cowork **não tem Chromium nem rede por script** (só o browser do Claude alcança o SIDRA) — a premissa "esteira 100% em `.mjs` no Cowork" caiu (D4 acatado). Piloto: "Café −17% × Cenoura +75%" vs média de 2,6% (IPCA jul/26, 20 números, 0 órfãos), CTA no `/inflacao` que existe, `oi #ec-<slug>` já cai na saudação (`index.js:671`). Pendências humanas: gravar 30s (rota B), veredito, criar @economizei, decidir ElevenLabs. Docs: `Economizei app/Desenho_Maquina_Conteudo_2026-09-03.md` · `AGENDA_CONTEUDO.md` · `PROMPT_MAQUINA_CONTEUDO.md` |
| 2026-08-30 | **Estoque esvaziado (0/4), 5 dias parado: cod-0071 (núcleo canal-agnóstico do recibo) + lote `cobertura-jobs` (las-03+las-01) + las-04 parcial (`charts.js`) · AGENDA curada (Concluído acima do teto — 10 tarefas migradas pro snapshot)** | `git push` até `7ec39a6` (4 commits: `dcc0be1`·`646460b`·`656d3fc`·docs), 712/713 testes verdes (1 `todo`). Achado (4ª vez): a mesma contradição da TRAVA 1 do `estoque.mjs` se repetiu, contornada limpando cada leva após o commit. 2 pendências não-bloqueantes abertas: padrão `deps` opcional (injeção de dependência pra teste, usado 2x) sem ratificação; defeito "Total: R$ 1,00" em `src/charts.js:56` (mês de soma zero) não corrigido, registrado como teste `todo`. |
| 2026-08-22 (2ª sessão) | **Estoque esvaziado (0/4): cod-0062b + cod-0065b entregues · achada uma contradição real entre `estoque.mjs` (exige leva anterior `limpar`-ada antes da próxima) e o `/entregar` (só manda limpar depois do push)** | `git push` até `7f38bbf` (3 commits: mesa/Passo-4 do Gabriel em `scripts/estoque.mjs`+`.claude/commands/*` · cod-0062b · cod-0065b), 604/604 testes verdes. O achado: com 2+ levas na mesma sessão, a TRAVA 1 do `comandoAplicar` bloqueia aplicar a leva N+1 enquanto a pasta da N ainda existir em `estoque/` — mas a Etapa 6 do `/entregar` manda só `limpar` depois do push (rede de segurança pro `reset --hard` se o check vier vermelho). Contornado nesta sessão limpando a leva 0002 assim que commitada (conteúdo já preservado no git); **o script ou o doc precisam ser ajustados** pra essa sequência não depender de decisão manual toda vez. |
| 2026-08-22 | **Regime ESTOQUE adotado (`scripts/estoque.mjs` versionado) · cod-0074 entregue (gate Pro no Alerta Pro) · `/entregar` passa a lidar com um 3º modo além de PILHA/TREE** | A rotina matinal na nuvem não consegue commitar (disco montado não apaga arquivo — `Veredito_Teste_Commit_Sandbox_2026-08-18.md`); desde então ela escreve cada leva numa pasta numerada em `estoque/` (gitignored) e o Gabriel aplica com `node scripts/estoque.mjs aplicar <n>` na própria máquina. A ferramenta (351 linhas, trava ordem/zona-proibida/fuga-de-diretório/sintaxe) já existia há 3 dias só no disco, sem commit — versionada nesta entrega. cod-0074 era a leva 0001; aplicada e entregue (`933e855`) junto com a adoção (`e6bc992`). Estoque cai de 3/4 pra 2/4 (levas 0002 `cod-0062b` e 0003 `cod-0065b` seguem, nesta ordem — as duas tocam `src/formatter.js` em cadeia). cod-0075 devolvida em aberto: a própria rotina (08-21) achou que a premissa dela (vazamento do gate Pro no Agente) não se sustenta no código. |
| 2026-08-18 | **🔐 RLS LIGADO (S4 fechado) — a exposição de dados acabou · gate Pro pronto pra entrega · regra 14 nasce (verificar estado, não aceitar resumo)** | **(1) O item mais importante:** os 2 scripts de RLS rodados (`rls_migration.sql` + `rls_migration_parte2_2026-08-07.sql` v2). Até 07/08, **quem tivesse a anon key lia os dados de todos os usuários** — aberto desde sempre, diagnosticado errado em 26/07 ("falta policy de insert"), causa real achada em 05/08 (env ausente) e fechado agora. Derruba o bloqueio das **cod-0069/0070** e satisfaz o pré-requisito que o próprio Gabriel chamou de inegociável antes de qualquer usuário externo. O script precisou de **duas correções na execução**: a v1 listava as 7 views uma a uma e quebrou com `42P01` — o `metrics_views.sql` está no repo mas **nunca foi executado por inteiro** (virou o **S5**); a v2 passou a descobrir sozinha o que existe, e ficou idempotente. **(2) Erro meu corrigido no caminho:** propus como prova da `service_role` o teste *"mande a mesma foto 2× e a dedup ignora a 2ª"* — **inválido**, a dedup é por `messageId` (retry do Z-API), não por conteúdo, e `registrarMensagemProcessada` é *fail-open*, então **nenhum** teste de comportamento pelo WhatsApp distingue anon de service_role. Trocado por teste de **estado** (decodificar o JWT e ler o campo `role`). Lição registrada: *defeito silencioso por construção exige teste de estado, nunca de comportamento*. **(3) O que aconteceu nos 11 dias entre as duas metades desta sessão:** a cod-0062a ficou **8 dias** no working tree (a esteira relatou "entupida" em toda rotina matinal), foi entregue em 15/08 — e na entrega descobriu-se que **o patch do `tarefa.md` que o CLAUDE.md registrava como feito estava quebrado** (markdown corrompido, `git branch`/`git log` sem `GIT_OPTIONAL_LOCKS=0`); substituído pelo arquivo corrigido. Em 16/08 a rotina produziu a **cod-0073** (gate Pro no `/comparar`, 3 arquivos + 11 testes, sem migration) e nasceu o doc `Revisao_Entregar_Camadas_2026-08-16.md`, que mediu o problema estrutural: **em 60 dias houve commit em 17 dias**, o padrão real é rajada com buracos de 6–8 dias, e o `/entregar` cobra o mesmo ritual de ~30min para uma leva inofensiva e para uma com migration — *"os 8 dias não foram desleixo: foram a resposta racional a um preço mal calibrado"*. Proposta de faixas de risco (🟢/🟡/🔴) **ainda não decidida**. **(4) Estado da cod-0073 na entrega:** 461/469 testes verdes no sandbox — as 8 falhas são **SIGBUS do `sharp`** (regra 11, limitação do ambiente), o teste novo passa 11/11 e nenhum teste do formatter regrediu (a assinatura `opts = {}` é retrocompatível como desenhado). **(5) Regra 14 promovida** (§11): o detector D6 chegou a **4/4 acatados** — 3 vezes em 3 semanas a memória mentiu por registro otimista. **Segue aberto no banco:** S3 (RPC), S5 (views), migration PIX (destrava cod-0062), DROP MP. **Segue aberto em decisão:** faixas de risco do `/entregar`, Máquina 3.0 × TREE (o teste de 5 min continua na fila há 11 dias), micro-cohort |
| 2026-08-07 | **Revisão da máquina: lock resolvido na causa-raiz · fila reabastecida por FATIAMENTO (não por tarefa nova) · S2 fechado e S4 destravado — com o buraco do RLS descoberto antes de rodar** | Sessão de revisão pedida pelo Gabriel ("revise a máquina e as decisões expostas; faça perguntas pra eu guiar o foco"), com foco escolhido por ele: **consertar a máquina**. **(1) `index.lock` — a causa não era o commit.** `git status` e `git diff` são comandos de LEITURA que **atualizam o índice** e por isso pegam o lock; no mount do sandbox o git cria dentro de `.git/` mas não apaga, então o lock ficava e travava o repo — por isso runs que **não commitaram nada** (05/08, 06/08) mesmo assim quebraram o git dele. Reproduzido e corrigido na sessão: **`GIT_OPTIONAL_LOCKS=0` = zero lock** (testado nos dois sentidos). Rotina agendada já atualizada; o `/tarefa` local precisou de arquivo pra copiar (`.claude/commands/` é protegido no Cowork) — e o patch aplicado à mão **renumerou os passos** (`PASSO 0`→`1.`, numeração reiniciando no meio) e comeu o `<nome>` de `test/<nome>.test.js`, então a correção virou substituição total com prefixo literal `PASSO N)`. **(2) Fila autônoma: de 1 para 6 elegíveis, sem inventar trabalho.** O problema não era falta de item, era **composição** — quase tudo era porte G (coração). Fatiadas as cod-0062/0065/0072 pelo critério "toca `src/gemini.js`?": saíram **cod-0062a** (blindagem de agregação, P1) · **cod-0062b** (guard `precos_mercado` + copy PIX) · **cod-0065a** (módulo puro de datas, 4 formatos do corpus) · **cod-0065b** (`fmtMoeda`) · **cod-0072a** (parser de parcela). O `coerceNumber` **ficou de propósito** com o Gabriel — coerção numérica afeta todo cupom brasileiro. **A cod-0062a nasceu de um achado, não do desenho:** a varredura mostrou que `calcularMedia` e `buscarItensDoMes` filtram `.eq('tipo','mercado')` mas **`buscarComprasDoMes` (`:295`) e `buscarHistorico` (`:116`) não filtram nada** — são elas que alimentam `/gastos` e o resumo mensal, logo o PIX entraria como gasto. Feita hoje (todo mundo é `mercado`) tem comportamento idêntico e risco zero; feita junto com a tarefa de coração, seria o critério mais fácil de esquecer. **(3) S2 fechado, S4 destravado — e o script não bastava.** O Gabriel setou a `SUPABASE_SERVICE_ROLE_KEY` (confirmado por print, 15 envs). Registrado o limite honesto da evidência: o print prova que a **variável existe**, não que o **valor é a chave certa** nem que houve redeploy (serviço aparecia "Sleeping"), e como o código faz `SERVICE_ROLE ‖ ANON`, valor errado-mas-presente **não cai no fallback** — quebra tudo. Daí o passo "S2-verificar" (mandar a mesma foto 2× e ver a dedup agir). E antes de ligar o RLS, achado que teria dado falsa segurança: o `rls_migration.sql` cobre **5 relações**, o código usa **15** — ficariam expostas `acompanhamentos`, `perguntas_log`, `mensagens_processadas`, `indicacoes`, `precos_mercado` **e as 7 views**, que por serem security-definer **continuam devolvendo dados mesmo com RLS ligado nas tabelas base**. Complemento escrito: `supabase/rls_migration_parte2_2026-08-07.sql` (+`security_invoker`+`REVOKE`+teste por `curl` com a anon key, porque testar pelo SQL Editor dá falso positivo). **(4) Achados de checkpoint resgatados.** A AGENDA dizia "último checkpoint: 07-08"; na verdade o `economizei-checkpoint-mensal` rodou em **01/08** e gerou `Checkpoint_N2_2026-08-01.md`, que ficou **6 dias sem leitura** — dentro dele o **B10 🔴: o gate Pro nunca foi ligado**, ou seja **hoje R$9,90/mês compra só "cupons ilimitados"** (comparativo e alerta liberados no free; a recompensa de indicação "7 dias Pro" não destranca nada). Promovido pro painel de ações junto com B9 (o `/planos` ainda promete "preditivo", que é a cod-0049) e B7 (`.env.example` desalinhado). Também resolvida a contradição da **cod-0066** (duas anotações opostas da mesma data, 11 dias em limbo — mantida `pausada`, arbitragem devolvida ao Gabriel). **Padrão de fundo registrado no `CRITICA_LOG` (D6 chegou a 3/3 acatados → candidato a regra permanente): o sistema PRODUZ diagnóstico bem e CONSOME mal** — checkpoint sem leitura, lock reportado 2× como "limitação conhecida" sem ninguém procurar a causa, contradição sem árbitro. O gargalo não é gerar sinal. **(5) 4 decisões dele na 2ª rodada da sessão** (depois do print do Railway): **(a) gate Pro — "aplicar o desdobramento agora"** → viraram cod-0073/0074/0075. O que destravou depois de 28 dias parado foi descobrir que o doc de 07-10 dizia *"nunca peça pra máquina aplicar isto"* porque o firewall era **bloqueante** na época — desde 26/07 é **advisory**, então a premissa que segurava a tarefa tinha vencido; **(b) cod-0066 liberada** (arbitrou que a autorização vale, restrição fica só pro lastro); **(c) sentada única no SQL Editor** — migration PIX + RLS + S3 + DROP MP, roteiro em `Economizei app/Roteiro_SQL_Editor_2026-08-07.md`, com o passo 0 fora do Editor (o teste da chave é no WhatsApp) e o alerta de que o DROP inverte a ordem código→deploy→banco que ele mesmo definiu, sendo o único bloco irreversível **e** o único de valor cosmético; **(d) Máquina 3.0 × TREE reaberta** — o fix do lock **invalidou a premissa** que criou a variante TREE (*"o sandbox não consegue commitar"*): o lock vinha da leitura, não da escrita, então "o sandbox commita?" **nunca foi testado de verdade**. Teste de 5 min enfileirado; nos dois resultados o ganho é o mesmo — um modo só, decidido por evidência. **Segue em aberto:** a micro-cohort de 5–10 usuários ("quero repensar isso antes") |
| 2026-08-05 | **Frentes 1 e 2 desdobradas (material humano virou corpus) + App decidido como 2º CANAL, não substituto + regra "sem empresa, usuário controlado ≠ cliente"** | A sessão de desdobramento pendente desde 07-09 **aconteceu**, porque o pré-requisito era material humano e ele chegou: **3 comprovantes de PIX** (2 PDFs + 1 print, 3 layouts distintos) e **6 recibos de Vancouver** (2 supermercados, farmácia, loja de variedades, serviço) → transcritos, pseudonimizados e versionados em **`test/corpus/`** (fotos dos recibos sim; PDFs de PIX **não** — dado pessoal de terceiro). **cod-0062 e cod-0065 destravadas.** O material real mudou o escopo das duas: **PIX** ganhou 2 invariantes novos — 🔴 **`direcao`** (PIX *recebido* é entrada; somá-lo como gasto faz o número mentir) e 🔴 **valor nem sempre impresso** (no print do Mercado Pago o valor só sai de `saldo antes − saldo depois`; sem conta que feche, recusa honesta > chute) — mais o **EndToEndId como dedup determinístico** (coluna nova = decisão dele, anti-A9) e a confirmação de que **`compras.tipo` não tem CHECK** (`'pix'` grava sem migration — pendência humana fechada por leitura). **Canadá:** o difícil não é moeda, é o coração — **4 formatos de data no mesmo corpus** (`26/07/29` é AA/MM/DD, lido errado vira 2029), nomes crípticos (`MNSTR ZERO ULTRA`, `NN BAR P MOZZ`), **linhas que não são produto mas entram na soma** (DEPOSIT/RECYCLING/ECO fee e a linha **negativa** `Member Pricing −3.58` → reconciliação precisa aceitar negativo), item por peso, e **pagamento ≠ total** quando há resgate de pontos. **Decisões dele na mesma sessão:** (1) `total` = **valor pago** (o impresso vira `total_bruto`, e é ele quem reconcilia os itens); (2) **migration autorizada** (`compras.direcao` + `compras.id_transacao` + índice único parcial — roda ANTES do push da cod-0062); (3) **PIX recebido é registrado marcado como ENTRADA**, nunca como gasto → toda agregação passa a filtrar `direcao='saida'`; (5) **fatura de cartão entra agora**, em paralelo ao PIX (*"vamos testando e estabilizando com o tempo"*) → cod-0072, destrava a G1 (gastos invisíveis). Só a decisão 4 (regime de revisão greenfield do `painel/`) segue aberta. `nome_canonico` em inglês, **`categoria` continua no enum pt-BR** — não bifurcar taxonomia. **App (decisão do Gabriel):** *não substitui o WhatsApp*; os dois funcionam **juntos e separados**, com **as mesmas funções, o mesmo banco e ambos aceitando foto** — muda só **como o usuário visualiza**; WhatsApp segue carro-chefe pela simplicidade. Consequência técnica: a regra de negócio tem de **sair de dentro do canal** (núcleo `src/core/` + adaptadores) ou toda função nasce duas vezes e diverge. **Identidade = `phone_number`** (login por código no WhatsApp): zero migration e quem já usa o bot abre o app com os dados lá. **PWA primeiro** (Vercel, custo zero, sem loja de app, **independe da empresa BC**). Fases → **cod-0071** (núcleo, `pronta`) · **cod-0069/0070** (API + PWA, `bloqueada-humano`): abrir API **força** resolver o S2/S4 — hoje o bot roda com a chave `anon` e o RLS está desligado; com app público isso vira exposição direta. **Sem empresa BC, não se busca CLIENTE — mas se busca USUÁRIO controlado:** nada de aquisição paga, promessa comercial ou base grande até out/2026; uma micro-cohort (ele + 5–10 próximos, grátis, sem promessa, com consentimento) é **instrumento** — alimenta corpus, `perguntas_log` e a primeira leitura de W2. **Pré-requisito inegociável antes de qualquer usuário externo: S2/S4.** Doc: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md` |
| 2026-08-05 | **Esteira desentupida + Máquina 2.1 (modo PUXADO) + reengajamento desligado (só o resumo de fim de mês fica)** | Esteira parada **~6 dias** (working tree sujo com o cod-0043 desde 29/07; Regra 0 bloqueia toda run). Diagnóstico: o gargalo **não é a fila, é a revisão humana** — produtor 1 leva/dia × consumidor 1–2×/semana com WIP=1 = trava permanente; a Máquina 2.0 piorou (lote maior → revisão mais longa → escoamento mais raro). **Decisão final — B1 / Máquina 3.0 (B3+B2 propostos e revertidos pelo Gabriel na mesma sessão):** a máquina passa a **COMMITAR em branches `maquina/cod-XXXX`** — nunca na `main`, nunca `git push`. Rotina das 8:02 segue ligada; teto por run mantido (3 P / 1 M / 1 lote, ≤~500 linhas). **3 defesas** (pedido dele: *"trabalhar em defesas para os contras… que a pilha sempre fique organizada"*): **LEI 1 pilha linear** (cada leva nasce do topo da anterior, não da `main` → mata o conflito cod-0043×cod-0044 por construção; ordem de merge = ordem de criação, nunca pular) · **LEI 2 teto de pilha = 3 branches** não-mergeadas (substitui a Regra 0; freio explícito e contável contra estoque invisível) · **LEI 3 main parada** (se a `main` andou por baixo da base da pilha, a máquina para e avisa — nunca rebaseia/mergeia sozinha). + painel **"📚 Pilha da máquina"** na AGENDA (ordem/branch/linhas/migration/idade; >7 dias = 🔴) e o `/entregar` virou **mergeador de pilha** com 2 modos (PILHA/TREE), `npm run check` no resultado do merge e `git branch -d` (nunca `-D`). *Contra que fica de pé: o B1 impede a produção travar, não acelera a revisão — pilha 3/3 por semanas é o mesmo sinal que a esteira entupida dava, só sem custar dias parados.* Também: ordem de escrita da run invertida (relatório-cabeçalho no passo 0, AGENDA gravada ANTES de exibir o diff) — runs morriam no fim do roteiro e deixavam a AGENDA mentindo. **Reengajamento:** verbatim do Gabriel — *"vamos deixar de lado a ideia do reengajamento por agora, quero somente a mensagem de final de mês indicando o quanto se gastou"*. Achado que motivou: os lembretes D3/D10 **nunca enviaram uma única mensagem** (`lembretes_enviados` nunca criada → `lembreteFoiEnviado` lança antes do envio). O que ele quer **já está no ar** (`executarResumoMensal`, cron dias 28–31, independente). Vira cod-0068 (desligar cron + tirar do schema guard, sem apagar módulo). *Registrado: sem reengajamento, o produto não tem toque proativo antes do dia 28 — a W2 passa a medir retenção orgânica.* **Fila reordenada:** cod-0068/0067/0025 no topo; cod-0044/0048/0049 no fim (cod-0049 com condição nova: só depois do bloco Supabase). **Supabase (mão do Gabriel):** 🔴 bot provavelmente rodando com a chave `anon` (`service_role` bypassa RLS, logo o erro de dedup seria impossível com a chave certa) → RLS nunca ligado, dados expostos a quem tiver a anon key; verificar RPC `incrementar_compras_mes`; DROP das colunas MP **adiado** (seguro mas cosmético e irreversível). Doc: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` |
| 2026-07-27 | **Máquina 2.0: teto por run (b) até 3 P OU 1 M OU 1 lote (≤~500 linhas) · lotes/`porte:` na AGENDA · Fila de lastro SÓ testes/revisão/segurança · rotina alinhada ao advisory + auto-revisão adversarial · run de sábado adiada pro pós-piloto (gatilho: 10 runs)** | Tokens da janela das 8h expiravam sem uso (3 dias de fila bloqueada); critério novo: **agrupar por revisão, não por token** (lote ideal = ~30min de revisão do Gabriel; separar sempre coração/financeiro). Invariantes intactos: máquina nunca commita, coração só com Gabriel, `supabase/`/envs/`package.json`/firewall seguem zona humana. Doc: `Economizei app/Analise_Maquina_Pesada_e_Lotes_2026-07-27.md` |
| 2026-07-27 | **Senso crítico automático: skill transversal `economizei-critical-partner` + `CRITICA_LOG.md` (19 skills agora)** | Gabriel pediu um Claude que aponte e sugira **sem ser perguntado**. Skill roda silenciosa em todo pedido não-trivial, 6 detectores (D1 decisão travada · D2 financeiro/LGPD/classificação · D3 caminho mais barato · D4 premissa não validada · D5 não move W2/conversão · D6 sequenciamento invertido); ao disparar **PARA antes de executar** (escolha dele) e entrega bloco 🛑 de ≤5 linhas; passou limpo, executa calado. Cada apontamento vira 1 linha no log; **3 acatos pelo mesmo motivo → vira regra permanente na §11; 3 recusas → o detector é recalibrado/desligado**. Doc: `Economizei app/Senso_Critico_Automatico_2026-07-27.md` |
| 2026-07-27 | **Fila reabastecida (6 tarefas): cod-0035 + cod-0066 + cadeia do Assistente em modo HÍBRIDO (cod-0043/0044/0048 + cod-0049 antecipada com gatilhos pré-programados, gated pelo cod-0035 no main) · decisões: supérfluo = baseline pra todos (`/superfluo` gated Pro), §4.2 resolve-se ENTREGANDO o cod-0035 · limpa da AGENDA (backlog morto removido, Concluído no teto de 10) · rollout do webhook auth COMPLETO (token + URL Z-API)** | Fila estava seca há 3 dias; gate de produção de 07-09 relaxado conscientemente SÓ pro que é código puro — 0045/0046/0047/0018 seguem gated pelo `perguntas_log`. Revisão confirmou `origin/main`=`aebb24a`, MP removido, §4.3 fechado; `/teto` proposto (ratificar na revisão). 🔴 abertos: DROP MP no Supabase + saúde do banco (RLS dedup, `lembretes_enviados`). Doc: `Economizei app/Sessao_Repriorizacao_Fila_2026-07-27.md` |
| 2026-07-26 | **Monetização de dados agregados dos recibos registrada como candidata a PILAR de receita (só registro estratégico; prospecção fica pro pós-BC)** | Gabriel definiu que vender **inteligência agregada de shopper data** (composição de cesta, inflação de categoria, comparativo de preço por região — coisas que já calculamos item a item) pra **varejo/indústria/institutos** entra como candidata a **4º pilar de receita**, ao lado de Máquina·Produto·Marketing. É o modelo real por trás dos apps "manda cupom, ganha ponto" (Fetch/Ibotta/Gelt/NielsenIQ): recompensa é isca, o dinheiro vem do B2B de dados. **Prospecção de empresas interessadas só pós-empresa BC + anúncios rodando + painel com escala.** Venda só **agregada e anonimizada** (LGPD); recompensa ao usuário hoje = **não-cash** (cash sem marca pagando fura W2 + firewall). Por agora **nada de código/gasto/AGENDA** — só registro estratégico. Doc: `Economizei app/Pesquisa_Cupom_por_Recompensa_Modelo_2026-07-26.md` |
| 2026-07-26 | **Firewall → ADVISORY + Mercado Pago removido (código no working tree, aguarda `/entregar`)** | Gabriel destravou o financeiro pra construir os dois trilhos sem atrito: `check-firewall.mjs` só avisa (exit 0), a rotina das 8h pode tocar dinheiro, mas ele **commita tudo** (gate real). MP apagado do `index.js`/`supabase.js`/`formatter.js` (331/331 testes de lógica verdes; falta `git rm src/mercadopago.js` + DROP das colunas MP no Supabase DEPOIS do deploy — ordem código→deploy→banco). Também: 2 problemas de saúde do banco enfileirados (RLS dedup em `mensagens_processadas`; `lembretes_enviados` faltando). Doc: `Economizei app/Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md` |
| 2026-07-24 | **`/entregar` fechou o buraco N1 da Auditoria Externa (webhook sem auth) + entregou 2 tarefas do Alerta Pro/Agente — cod-0053/cod-0032/cod-0034 no `origin/main`** | `autenticarWebhook` (segredo no path/header, fail-closed com a env); bloco de gasto supérfluo no `/gastos`/resumo mensal; intent `gasto_por_termo` no Agente. 4 commits (`6cadcb8`..`b923805`); push final com `--no-verify` consciente (autorizado) — pre-push comparou contra o patch do firewall (`27fcc16`, também reconciliado agora) que se autoacusa por design. Pendência humana: `ZAPI_WEBHOOK_TOKEN` no Railway + reconfigurar Z-API (ver AGENDA). |
| 2026-07-17 | **Pagamentos "dois trilhos": Stripe (PSP direto, margem alta) + MoR/afiliados (Hotmart default, Braip a checar) — os dois ligam `is_pro` no mesmo `/admin/ativar-pro`** | Empresa BC reabre o Stripe (PIX+recorrente+cartão, liquida CAD); Trilho A = cliente que o Gabriel traz, Trilho B = afiliado vende por ele (só anual). Registrados na seção 3: IOF 3,5% (comprador cross-border), BC ~11% corp/GST 30k/T2. MoR não-Hotmart possível — não-residência a confirmar por plataforma. Bloqueado até BC out/2026; webhooks = zona financeira humana. Também nesta sessão: auditoria externa (`Auditoria_Externa_2026-07-17.md`) achou 🔴 `/webhook` sem auth + bypass firewall por rename ainda aberto. Docs: `Parceiros_Pagamento_Empresa_BC_2026-07-17.md` · `Arquitetura_Pagamentos_Dois_Trilhos_2026-07-17.md` |
| 2026-07-15 | **Vigilância agendada: 3 tarefas recorrentes (sentinela dom 20h · checkpoint N2 dia 1 8h30 · lembrete sexta 9h) + mistério do PAINEL.html resolvido** | Sentinela: AGENDA×git, firewall, testes, anti-A9, copy×features, e regenera o `Projeto_Claude_CONTEXTO` quando o estado muda (relatório em `RELATORIO_SENTINELA.md`); tarefas só leem/reportam — nunca commitam nem tocam dinheiro; rodam com o app aberto. `PAINEL.html` untracked vem da tarefa agendada `economizei-painel-semanal` (segundas 7h32) — decidir git ou `.gitignore`. Nota: "1%" no Projeto do Claude = capacidade ocupada, não uso; CONTEXTO se mantém por substituição, nunca acúmulo |
| 2026-07-15 | **CLAUDE.md enxugado (−75%) + regra de teto por sessão + órfãos da raiz arquivados** | Limite de 800 linhas estourado (1.187); sessões registradas em 4 lugares redundantes. Zero perda: tudo em `arquivo-historico/`. Doc: `Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md` |
| 2026-07-15 | **Instruções + Contexto do Projeto Claude — divisão de papéis "plano-e-segue"** | Claude executa o que domina anunciando plano em 3 linhas; Gabriel fica com dinheiro/deploy/estratégia. Docs: `Projeto_Claude_INSTRUCOES_2026-07-15.md` + `Projeto_Claude_CONTEXTO_2026-07-15.md` (a pasta vence em conflito) |
| 2026-07-15 | **Frente 1 desenhada: ingestão multi-documento começa por PIX (cod-0060 feito; cod-0061/0062 promovidas)** | PIX = `compras.tipo='pix'` (sem tabela nova); Gemini classifica via `tipo_documento`; PIX fora da média e de `precos_mercado`; corrigir `registrarPrecosMercado` pra `tipo==='mercado'`. Doc: `Desenho_Ingestao_Multi_Documento_2026-07-15.md` |
| 2026-07-15 | **Fila reabastecida (cod-0034/0032/0033) + Frente 2 = repensar canal (Plaid/app, não WhatsApp-diáspora)** | Leva 2 continuada (cod-0043+) travada pelo `perguntas_log` inexistente pré-lançamento; Plaid muda o produto → sessão própria. cod-0041/0042/0051/0052 commitadas/pushadas (`c355d74`..`a40110f`, `origin/main`) |
| 2026-07-13 | **6 commits da Máquina pushados + comando `/entregar` (aprovação dupla + checagem BLOQUEANTE de migrations)** | `npm run check` verde + "APROVO" literal; cruza diff com migrations/envs ANTES do push (anti-A9); reconciliação automática da AGENDA mata a memória stale. Commits `7082535`/`473ea18`/`86dbb64`/`0dc9159`/`0b81181`/`9182b91` |
| 2026-07-13 | **Leva 2b fechada: cod-0041 + cod-0042 — Agente com 10 intents** | `comparativo_mercados`, `gasto_superfluo`, `duvida_sobre_bot` (lista viva, não consome cota, custo zero de LLM); 284/284 testes; sem migration/env nova. ⚠️ `PAINEL.html` untracked na raiz, origem desconhecida |
| 2026-07-10 | **Auditoria Integral (6/10 frentes): firewall com 8 lacunas + bypass por rename 🔴; copy de indicação e fluxo MP 🔴** | Patch pronto (aplicação humana — arquivo protegido); `/assinar` ainda gera checkout MP abandonado; cod-0051/0052 + aud-01..04 criadas. Doc: `Auditoria_Integral_2026-07-10.md` |
| 2026-07-10 | **Gate Pro desdobrado: Pro vê até 10 comparativos (`COMPARATIVO_MAX_PRO`); teaser Free com upsell `/planos`; entrega doc-only** | Código financeiro não sai das mãos do Gabriel; recompensa de indicação (`features_pro_ate`) passa a valer algo real. Doc: `Gate_Pro_Desdobramento_2026-07-10.md` |
| 2026-07-09 | **Recibo Canadá MVP enfileirado (cod-0065)** | Reusa o pipeline; pesa CASL + WhatsApp fraco no CA; ângulo = diáspora. Doc: `Economizei_Vancouver_Recibos_2026-07-09.md` |
| 2026-07-09 | **Estabilização VALIDADA em produção — smoke test end-to-end passou; frente fechada** | A9/A4/migration do agente rodadas + 4 envs; número do Agente bateu com `/gastos` (fidelidade OK); cod-0050 enfileirada. Doc: `Roteiro_Smoke_Test_2026-07-09.md` |
| 2026-07-09 | **Empresa BC adiada pra OUT/2026 — janela jul→out vira construção; planejamento até 2 meses** | Meta Ads/Hotmart/Wise/afiliados bloqueados; métrica até lá = W2, não receita. Doc: `Horizonte_Longo_Prazo_2026-07-09.md` (seção 7.2) |
| 2026-07-09 | **Assistente Conversacional = força a desenvolver; Leva 2 (cod-0040..0042) primeiro** | Diferencial defensável é o dado do cupom item a item, não a conversa; cod-0043..0049 gated por validação em produção. Doc: `Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md` |
| 2026-07-08 | **Recorte Free×Pro do Alerta Pro decidido + fila reabastecida (cod-0021/0022/0024/0031)** | Free = alerta 3 níveis + `/cortar` + pergunta avulsa na cota; Pro = acompanhamentos persistentes + limite proativo + supérfluo configurável. Migration do Alerta Pro já estava escrita |
| 2026-07-08 | **Checkpoint N2: 🟡→🟢 — repositório saudável; AGENDA estava stale (reconciliada)** | Git é a verdade: cod-0013..0017/0020 já pushados (`d4eaf51`/`3b2f375`); 184/184 testes; faltava só validação end-to-end (fechada em 07-09) |
| 2026-07-03 | **Agente de Perguntas COMPLETO (cod-0014..0017; cadeia 0010..0017 fechada)** | Texto livre → cota → classificador → executor determinístico (número NUNCA nasce no LLM) → narração com firewall de fidelidade numérica + airbag template; off-topic não consome cota. 37 testes novos |
| 2026-06-30 | **Migrations A4/A9 escritas + 2 futuras (agente, alerta pro)** | A9 (`compras.cnpj`): rodar o ALTER ANTES do deploy; futuras só quando as features subirem; `supabase/` commitada com `--no-verify` consciente |
| 2026-06-30 | **Sistema de checkpoints (3 níveis) + negócio em pilares (Máquina · Produto · futuro Marketing)** | Checkpoint integral = primeiro entre fim-de-cadeia / 5 commits / 3 semanas; firewall = tecido conectivo. Docs: `Sistema_Checkpoints_Benchmarks_2026-06-30.md` + `Pilares_do_Negocio_2026-06-30.md` |
| 2026-06-27 | **Sequência: fechar a promessa do pago ANTES de escalar; comparativo = Pro completo + teaser Free** | `/apagar` → comparativo → alerta Pro antes de anual/afiliados/ads; teaser mostra o valor antes de pagar |
| 2026-06-27 | **`/apagar` implementado (LGPD, 2 passos, firewall-limpo, sem migration)** | Fecha o A2; DELETE em ordem de FK; não toca pagamento nem `precos_mercado`; pagante ativo = follow-up financeiro humano |
| 2026-06-27 | **Classificação = CORAÇÃO do produto (princípio inegociável) + Alerta Pro desenhado** | Callout na seção 1; endurecimento cod-0026/0027 vem junto; matching por `nome_canonico`. Doc: `Desenho_Alerta_Inteligente_Pro_2026-06-27.md` |
| 2026-06-26 | **Reconciliação AGENDA×git — 5 tarefas movidas pra Concluído** | AGENDA stale vs `origin/main` (`b73b15b`/`e8de024`); ressalvas: limpeza do Actions parcial, `/planos` sem anual |
| 2026-06-25 | **Gatilho de Skills: toda tarefa da máquina carrega a skill certa (campo `skills:` + mapa fallback)** | Opus designa no planejamento (perguntando quais usar), Sonnet declara quais usou; recomendado-não-bloqueante. Regra na AGENDA |

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
- **Economizei em Vancouver — Recibos Canadenses (2026-07-09):** `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md` *(viabilidade de usar o sistema no Canadá com recibo de qualquer comércio: o que se reusa, complexidade de código, risco da classificação, e o legal — CASL/BC PIPA/PIPEDA. Tarefa: cod-0065 na AGENDA.)*
- **Horizonte de Longo Prazo (2026-07-09):** `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` *(BC adiada pra out/2026; Frente 1 ingestão multi-documento + Frente 2 internacionalização; fases e pontos de discussão)*
- **Revisão & Commit da Máquina (2026-06-30):** `Economizei app/Revisao_e_Commit_Maquina_2026-06-30.md` *(passo a passo dos 6 commits do trabalho acumulado da automação)*
- **Sistema de Checkpoints & Benchmarks:** `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md` *(cadência de revisão integral — 3 níveis, métrica de gatilho, checklist máquina + software)*
- **Pilares do Negócio:** `Economizei app/Pilares_do_Negocio_2026-06-30.md` *(Pilar 1 Máquina · Pilar 2 Código/Produto · Pilar 3 futuro Marketing; firewall como tecido conectivo)*
- **Tráfego Pago & Criação de Páginas:** `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` *(como entrar na mídia paga com ~R$200, Meta CTWA × Google, métricas CPM/CPC/CPL/ativação, subdomínio na Vercel, estrutura de campanha e plano de teste)*
- **Posicionamento & Norte Estratégico:** `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` *(missão, 3 camadas de valor, Teste de Norte — ver também seção 1.5)*
- **Da Dica à Função (pesquisa de finanças → 12 funções candidatas):** `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md`
- **Plano completo de pesquisa + estratégia (com copy pronta):** `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`
- **Roadmap visual 6 semanas (HTML para impressão/PDF):** `Economizei app/Economizei_Roadmap_6_Semanas.html` *(abrir no navegador, Ctrl+P → "Salvar como PDF")*
- **Apresentação Blueprint Empresarial:** `economizei-blueprint.pptx` (na pasta de outputs do Cowork)
- **Pesquisas brutas:** `local_*/uploads/Pesquisa de Hábitos de Compra no Supermercado*.csv`

### Repositório
- **Código:** `C:\Economizei\src\`

### APIs em uso
- Z-API (WhatsApp gateway)
- Google AI Studio (Gemini 2.5 Flash)
- Supabase (PostgreSQL + Auth)

---

## 11. 💬 Comandos & regras permanentes do Gabriel

> **Histórico narrativo completo** (briefings verbatim, entregas, ressalvas de cada sessão): `Economizei app/arquivo-historico/SESSOES_arquivo_2026-07-15.md` (+ `CLAUDE_arquivo_2026-06-04.md` pro período inicial) e os docs de sessão em `Economizei app/`. Aqui ficam **só as regras que continuam regendo comportamento** — cada uma com a data e, quando definidor, o verbatim.

1. **Classificação é o coração** *(2026-06-27)* — verbatim: *"a classificação dos itens é o coração e o ponto principal do economizei, ou seja isso tem que ser levado o máximo a sério possível e da forma mais segura possível."* Mexeu em extração/categoria/`nome_canonico` → corpus de regressão obrigatório antes de subir.
2. **Financeiro — firewall em modo ADVISORY** *(revisado 2026-07-26; era "inegociável/bloqueante" desde 2026-06-23)* — durante a construção dos dois trilhos de pagamento, a máquina/Claude **PODE** escrever código financeiro (inclusive a rotina das 8h). O `scripts/check-firewall.mjs` **avisa mas não bloqueia** (sempre exit 0; lista o que toca dinheiro como checklist). O gate real é a revisão humana no `/entregar` — reforçado pela regra 3 (o Gabriel commita tudo), que **não mudou**. `supabase/`, `.env*`, `package.json` e deploy seguem sendo mão do Gabriel. Reverter pra bloqueante quando os trilhos estiverem prontos. Doc: `Economizei app/Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`.
3. **Máquina NÃO usa git — produz levas em `estoque/`; commit, push e deploy são do Gabriel** *(revisado 2026-08-18; era "commita só em branch `maquina/*`" desde 2026-08-05, e "nunca commita" desde 2026-06-24)* — mudou a **mecânica**, nunca o espírito: o gate real sempre foi o push (que deploya no Railway), e esse não se moveu um milímetro. **Por que mudou:** teste de 2026-08-18 em repositórios descartáveis provou que o disco montado onde a máquina roda **não permite apagar arquivo** (`rm` → `Operation not permitted`), e como toda escrita do git cria um `.lock` que precisa ser apagado, a **segunda** escrita trava o repositório pra sempre (`commit #1: OK` · `commit #2: FALHOU`). A Máquina 3.0 (pilha de branches, 05/08) era fisicamente impossível aqui e **nunca rodou uma vez** — o repositório inteiro tem zero merges. **Como é agora:** a máquina escreve cada leva em `estoque/NNNN_data_cod-XXXX/` (manifesto `LEVA.md` + arquivos completos), sem tocar `src/`/`test/`; o Gabriel aplica com `node scripts/estoque.mjs aplicar <n>` e sobe via `/entregar` (aprovação dupla: `npm run check` verde **na máquina dele** + "APROVO" literal; checagem de migrations/envs BLOQUEANTE antes do push). **A máquina nunca usa comando de ESCRITA do git** — nem `add`, `commit`, `checkout`, `branch`, `merge`, `rebase`, `reset`, `push`, `stash`, `tag`; leitura só com `GIT_OPTIONAL_LOCKS=0`. Regem o estoque as 2 Regras (cadeia · teto de 4 levas/~1200 linhas) — ver AGENDA "📦 Estoque". **Ganho colateral:** como o working tree nunca suja, entrega atrasada **não bloqueia mais a produção** — o acoplamento que custou 6 dias (cod-0043) e 8 dias (cod-0062a) deixou de existir. Docs: `Economizei app/Veredito_Teste_Commit_Sandbox_2026-08-18.md` · `Plano_B_Estoque_2026-08-18.md`.
4. **Gíria informal só em marketing** *(2026-05-26)* — verbatim: *"essas adaptações servem SOMENTE E EXCLUSIVAMENTE para marketing, nunca para o texto do bot ou para qualquer outro texto fora de roteiros de marketing"* ("cê/tá/né/ó" proibidos no bot, landing e docs).
5. **Zero benefício prometido ao Beta** *(2026-05-19)* — verbatim: *"eu quero a EXCLUSÃO de qualquer coisa que mencione um benefício como 3 meses de graça, ou o preço travado"*. Só prometer benefício depois de dados de retenção/conversão.
6. **Sem estimativas de tempo** *(2026-06-02)* — prazos só depois de medidos em tentativas reais; gatilhos por métrica (ex.: "≥ 5 pagantes"), nunca semanas numeradas.
7. **W2 ≥ 30% é o gate de escala** *(2026-06-23)* — nenhum gasto de aquisição escala antes da retenção W2 validar no cohort de Fernandópolis. Aquisição não conserta retenção; anual amplifica, não conserta.
8. **Gatilho de Skills** *(2026-06-25)* — toda tarefa da Máquina carrega as skills do campo `skills:` da AGENDA (ou o mapa tipo→skill de fallback) e declara quais usou. Recomendado-não-bloqueante.
9. **Plano-e-segue** *(2026-07-15)* — Claude executa as áreas que domina anunciando o plano em 3 linhas e seguindo sem esperar aprovação; Gabriel interrompe se quiser. Domínio dele: dinheiro/firewall, commit/deploy, direção estratégica, jurídico/fiscal, usuários reais.
10. **Teto por sessão na memória** *(2026-07-15)* — cada sessão registra no máx. 1 linha na tabela de Decisões + 1 frase na "Última atualização"; verbatim aqui SÓ se criar regra permanente; detalhe completo mora no doc de sessão em `Economizei app/`. Fim da quadruplicação de registro.
11. **Gate final é na máquina do Gabriel** *(recorrente desde 2026-06-07)* — o mount do sandbox trunca/serve stale arquivos editados; `npm run check` / `node --check` local é o gate obrigatório antes de qualquer push. Validações no sandbox rodam em cópia limpa `/tmp`.
12. **Pedido não é ordem cega** *(2026-07-27)* — verbatim: *"aplicar um senso crítico de certa forma no trabalho quando eu mandar um request que seja sem sentido ou que possa ser feito de uma forma melhor, eu quero que a máquina identifique isso automaticamente"*. O Claude **para e aponta ANTES de executar** quando o pedido tem atrito real (skill `economizei-critical-partner`, 6 detectores); passou limpo, executa calado. **O Gabriel decide sempre** — a skill tem voz, não voto; depois do "segue assim", o assunto morre. Todo apontamento vira linha no `CRITICA_LOG.md`.
13. **Nomes de mercados reais** *(2026-05-26)* — só em contexto neutro/positivo de hábito, como slot variável em roteiro; nunca tom negativo, nunca implicar parceria sem autorização escrita.
14. **Verificar estado, não aceitar resumo** *(2026-08-18 — promovida do `CRITICA_LOG` após o detector D6 bater 4/4 acatados)* — antes de fechar sessão, registrar algo como "feito" ou partir de um diagnóstico anterior, **olhar o estado real**: `git status`/`git log`, o working tree, e o que de fato está no banco. Vale inclusive para o resumo que o próprio Claude escreveu na sessão anterior. Motivo: 3 vezes em 3 semanas a memória passou a mentir por registro otimista — a cod-0043 "entregue" que estava no working tree (6 dias), o patch do `tarefa.md` registrado como corrigido mas quebrado (8 dias), e "tudo foi feito" que era só o RLS. **O gargalo do projeto não é produzir; é consumir e registrar o que já foi produzido.**

---

## Como usar este arquivo

**No início de cada sessão no Cowork ou Claude Code:**
> "Leia o CLAUDE.md antes de começar. Hoje quero trabalhar na área de [Marketing / Produto / Financeiro / etc.]."

**Para atualizar (respeitando o teto por sessão — regra 10 da seção 11):**
> "Adicione no CLAUDE.md em Decisões Tomadas: [data] — [decisão] — [racional curto + pointer pro doc de sessão]"
> "Marque como concluído no roadmap: [item]"
> "Adicione em Aprendizados: [insight do mês]"
> "Adicione em Comandos & regras permanentes: [comando importante]" *(só se criar regra permanente)*
