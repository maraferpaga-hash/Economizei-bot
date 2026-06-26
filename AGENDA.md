# 🤖 AGENDA — Máquina Noturna do Economizei

> **O que é este arquivo.** É a fila de trabalho da automação e a memória viva do
> que está em andamento. O Gabriel prioriza as tarefas aqui (junto com o Opus 4.8,
> no chat). A execução é **local**: na pasta do projeto, o Gabriel roda o Claude
> Code (comando `/tarefa`), que pega **a primeira tarefa pronta**, implementa com
> teste e mostra o diff — **o Gabriel revisa e commita**.
>
> **Função principal: mudanças de CÓDIGO** — desenvolver funções novas, refinar e
> corrigir o código do bot. **O financeiro é blindado** (ver "Zona proibida"): a
> automação não toca em pagamento/cobrança, e o `npm run check:firewall` reprova
> qualquer mudança que tente.
>
> **Leia este arquivo no início de toda sessão** (está na boot list do `CLAUDE.md`).
> Guia do sistema: `Economizei app/Automacao_Maquina_Noturna.md`.

**Última curadoria:** 2026-06-25 · **Modo:** execução local (GitHub Actions descontinuado)
**Mapeamento geral:** `Economizei app/Mapeamento_Geral_Pendencias_2026-06-24.md` (visão única de tudo pendente — código, humano, git, features desenhadas)
**Auditoria de código & direção:** `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md` (achados A1–A10 por severidade + partes travadas + plano de ação; os itens estão distribuídos abaixo no Backlog / Ações do Gabriel / Aguardando decisão)

---

## 🚫 Zona proibida — FINANCEIRO (a máquina NUNCA toca)

> Isto não é só instrução: é **trava automática**. `scripts/check-firewall.mjs`
> roda no CI e **reprova o PR** se o diff mexer em qualquer item abaixo. Com
> branch protection na `main`, um PR reprovado fica **não-mergeável**.

A máquina **não pode** criar, editar ou apagar:

- `src/mercadopago.js` (módulo de pagamento) — arquivo proibido.
- Qualquer linha sobre **pagamento/cobrança**: assinatura, preapproval, Mercado Pago, `is_pro`, `/assinar`, `/pix`, `/cancelar`, checkout, paywall, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`.
- `supabase/` (migrations/SQL — schema e tabelas de dinheiro), `.env*` (segredos), `.github/` (os próprios guarda-rails), `package.json`/`package-lock.json` (dependências), `scripts/check-firewall.mjs` (a trava), `Dockerfile`/`Procfile` (deploy).

Se uma tarefa precisar de algo disso, ela vira **pendência humana** (vai pro painel "Ações do Gabriel"), nunca trabalho da máquina.

---

## 📐 Protocolo (como a automação local usa esta agenda)

Quando o Gabriel roda o Claude Code local (comando `/tarefa`), ele:

1. Lê este arquivo (e consulta `CLAUDE.md`/`CODE_GUIDE.md` só se a tarefa exigir).
2. Vai em **`## 🌙 Fila pronta`** e pega a **primeira** tarefa (de cima pra baixo = maior prioridade) com **`status: pronta`**.
3. **Carrega as skills da tarefa** (campo `skills:`). Se faltar, deriva do **mapa tipo→skills** da seção "🧠 Gatilho de Skills" e aplica durante todo o trabalho.
4. Implementa só aquela tarefa **com teste** (TDD), roda a rede de segurança, move o bloco pra **`## 🔧 Em revisão`** (status `em-revisao` + data) e **mostra o diff** — **declarando quais skills usou**.
5. **O Gabriel revisa e commita** (a automação não commita nem dá push).
6. Se não houver tarefa elegível, não faz nada.

**Rede de segurança (rode antes de commitar):** `npm run check` = `check-firewall.mjs --working` (financeiro) + `node --test` (testes) + `check-pages.mjs` (páginas).

**Como priorizar (você + Opus):** a ordem dentro de "Fila pronta" É a prioridade. Subiu = roda antes. Os rótulos `[P0]`..`[P3]` são leitura humana; o que manda é a posição. Use `status: pausada` pra tirar da fila sem apagar.

**Formato de uma tarefa** (molde pra copiar):

```
### [P1] Título curto da tarefa
- id: cod-000X
- tipo: feature-codigo | refino-codigo | bugfix | teste | conteudo-seo | landing-ab | institucional
- skills: skills designadas no planejamento (ver "🧠 Gatilho de Skills"); se vazio, o executor deriva do mapa tipo→skills
- objetivo: uma frase — o que deve existir ao final
- arquivos-alvo: caminho(s) que a máquina pode criar/editar (fora da zona proibida)
- criterios-de-aceite:
  - critério verificável 1
  - teste cobrindo a lógica nova (node --test verde)
  - firewall financeiro verde
- fora-de-escopo: o que NÃO tocar
- status: pronta
```

`tipo`: **feature-codigo** (função nova) · **refino-codigo** (melhora algo que existe) · **bugfix** · **teste** (sobe cobertura) · **conteudo-seo** / **landing-ab** / **institucional** (páginas). Status: `pronta` · `em-revisao` · `pausada` · `bloqueada-humano` · `concluida`.

---

## 🧠 Gatilho de Skills (toda tarefa usa skill — sempre)

> **Regra-mãe:** nenhuma tarefa é implementada sem antes carregar as skills certas.
> A automação **reusa a memória que já construímos** (`.claude/skills/economizei-*`
> + `CLAUDE.md` + `CODE_GUIDE.md`), em vez de reinventar princípio toda run.
> Funciona em dois lados:
>
> - **No planejamento (você + Opus 4.8):** ao escrever uma tarefa nova, o Opus
>   **apresenta as skills candidatas** (cada uma com 1 linha do que faz, pelo
>   catálogo abaixo), **pergunta quais fazem mais sentido**, e grava a escolha no
>   campo **`skills:`** da tarefa. É aqui que você "designa o que o Sonnet vai usar".
> - **Na execução (Claude Code local, `/tarefa`):** carrega as skills do campo
>   `skills:`; se estiver vazio, **deriva do mapa tipo→skills** abaixo; aplica
>   durante todo o trabalho; e **declara no resumo do diff quais skills usou**.
>   Rigor: **recomendado, não bloqueante** — a omissão deve ser exceção, não regra.

### Sempre ligadas (transversais — rodam em qualquer tarefa)
`economizei-product-principles` · `economizei-memory-system` · `economizei-automation-triage` · `economizei-token-economy` · `economizei-financial-firewall` · `economizei-dual-format` — e `economizei-code-decisions` em qualquer tarefa que toque código. Estas não precisam ir no campo `skills:`; já são default (PROJECT_INSTRUCTIONS §2.1).

### Mapa tipo-de-tarefa → skills (fallback quando o campo `skills:` está vazio)
| `tipo` | Skills núcleo (sempre) | Skills condicionais (quando…) |
|---|---|---|
| **feature-codigo** | code-decisions, tdd, product-principles, financial-firewall | copywriter + copy-review (a função gera mensagem ao usuário, ex. `formatter.js`) · security-lgpd (toca CPF/cupom/dado pessoal) · debugging (nasce de um bug) |
| **refino-codigo** | code-decisions, tdd, product-principles, financial-firewall | copywriter (mexe em mensagem do bot) · debugging (corrige comportamento) |
| **bugfix** | debugging, code-decisions, tdd, automation-triage, financial-firewall | security-lgpd (dado pessoal) |
| **teste** | tdd, code-decisions | — |
| **conteudo-seo** | copywriter, copy-review, content-engine, financial-firewall, token-economy | security-lgpd (página com dado/privacidade) |
| **landing-ab** | copywriter, copy-review, financial-firewall, experimentation | security-lgpd (privacidade) |
| **institucional** | copywriter, copy-review, financial-firewall | security-lgpd (privacidade/LGPD) |
| **estrutura / função nova (design)** | product-principles, roadmap-deps, financial-firewall, code-decisions | strategic-review (decisão de direção) · growth-analyst (depende de métrica) |

> O `financial-firewall` aparece em quase tudo **de propósito**: é a trava que
> impede número/preço/promessa sem source no `CLAUDE.md` (a versão em código é o
> `npm run check:firewall`). A landing tem **pricing**, então ele entra em toda
> tarefa de página.

### Catálogo das 18 skills (o que cada uma faz — use pra escolher no planejamento)
**Núcleo:**
- `economizei-product-principles` — toda decisão de produto/feature passa aqui: zero atrito, grátis funciona, frame brasileiro, Teste de Norte.
- `economizei-memory-system` — mantém o `CLAUDE.md` vivo (registrar decisão/aprendizado no fim).
- `economizei-code-decisions` — gêmea da memory-system para o `CODE_GUIDE.md` (stack, padrões, decisão técnica, aprendizado de bug).
- `economizei-automation-triage` — separa 🤖 robô / 🤝 / 🛠️ / 🧍 humano antes de executar; protege o tempo do Gabriel.
- `economizei-token-economy` — calibra esforço ao tamanho do pedido (tier mínimo, sem preâmbulo/postâmbulo).
- `economizei-financial-firewall` — barra número/preço/duração/promessa sem source no `CLAUDE.md`. **Inegociável quando há dinheiro.**
- `economizei-dual-format` — saída tier 4+ em Resumo executivo + Relatório completo.
- `economizei-copywriter` — copy do bot/landing/anúncio em PT-BR classe B/C (sempre com firewall se há número).
- `economizei-debugging` — reduz fogo de horas pra minutos; bot quebrado = produto morto.
- `economizei-growth-analyst` — métricas que importam (retenção W2, WTP), decisão de paywall.

**Secundárias:**
- `economizei-content-engine` — conteúdo orgânico/SEO (Reels/TikTok/guia) sem virar criador full-time.
- `economizei-experimentation` — A/B de headline, teste de pricing.
- `economizei-security-lgpd` — LGPD com dado de cupom (CPF/CNPJ/itens): consentimento e retenção antes de "funciona".
- `economizei-tdd` — todo código além do MVP vem com teste (modelo `test/insights.test.js`).
- `economizei-multi-agent-ops` — operar/paralelizar subagents quando o trabalho cresce.
- `economizei-strategic-review` — SWOT + matriz Eisenhower por gatilho (auditar/decidir direção).

**Legadas (disparam por tópico):**
- `copy-review` — auditoria de copy/landing (TL;DR + problemas mais críticos).
- `roadmap-deps` — mapeia dependências quando um roadmap/planejamento é montado.

---

## 🌙 Fila pronta
*(a máquina executa de cima pra baixo, uma por noite)*


> **🤖 Agente de Perguntas (MVP — Free, 3 intenções, Opção A com narração LLM).**
> Cadeia sequencial cod-0010 → cod-0017. Desenho completo e decisões: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`. **Executar em ordem** (cada uma depende das anteriores). Pré-requisito HUMANO antes de subir cod-0016/0017 em produção: a migration (ver "Ações do Gabriel"). Se quiser o agente antes do F3/cod-0001, mova este bloco pra cima.

### [P1] Agente — 2/8: guardas de honestidade (puras) — o coração
- id: cod-0011
- tipo: feature-codigo
- skills: economizei-tdd, economizei-financial-firewall
- objetivo: funções puras de guarda (Desenho §5): validarClassificacao(saida, registro), extrairNumeros(texto), conferirFidelidadeNumerica(textoLLM, permitidos)→{ok, intrusos}.
- arquivos-alvo: src/agent/guards.js (novo), test/agent-guards.test.js (novo)
- criterios-de-aceite:
  - validarClassificacao rejeita intent fora do registro e param fora do vocabulário
  - conferirFidelidadeNumerica REPROVA quando há número fora da lista permitida (caso testado) e aprova quando todos batem
  - puro, testado · node --test verde · firewall verde
- fora-de-escopo: nada financeiro; não chamar Gemini aqui (só lógica pura)
- status: pronta

### [P1] Agente — 3/8: registro das 3 intenções + templates
- id: cod-0012
- tipo: feature-codigo
- skills: economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: intents.js com gasto_total_mes, gasto_por_categoria, comparar_meses — cada uma {id, descricao, exemplos, parametros, executar(phone,params)→fato, template(fato)→string}. executar reusa buscarGastosPorCategoria/buscarTotaisMensais (supabase.js) + calcularEconomia (insights.js) + resolverPeriodo. Números do fato formatados com o brl() do formatter.js (fonte única). Desenho §3.
- arquivos-alvo: src/agent/intents.js (novo), test/agent-intents.test.js (novo)
- criterios-de-aceite:
  - lógica de "montar fato a partir de dados crus" extraída em função pura e testada com dados sintéticos (com dados e sem dados → temDados:false)
  - templates puros testados; toda string de número via brl()
  - node --test verde · firewall verde
- fora-de-escopo: NÃO referenciar is_pro/features_pro_ate/assinatura; NÃO criar migration nem tocar supabase/; reusar funções de leitura existentes
- depende-de: cod-0010
- status: pronta

### [P1] Agente — 4/8: classificador (Gemini → intenção)
- id: cod-0013
- tipo: feature-codigo
- skills: economizei-tdd
- objetivo: classifier.js — montarPromptClassificacao(registro, pergunta) (puro) + classificar(pergunta) (chama gemini-2.5-flash, temp 0, JSON; valida via guards). Off-topic → {intent:'fora_de_escopo'}. Porta de topicalidade (Desenho Camada 2 / §4): assunto de finanças → responde a mais provável; só off-topic pergunta de volta.
- arquivos-alvo: src/agent/classifier.js (novo), test/agent-classifier.test.js (novo)
- criterios-de-aceite:
  - montarPromptClassificacao puro e testado (inclui ids/exemplos do registro)
  - parse+validação de resposta JSON simulada testada (incl. fora_de_escopo e param inválido)
  - mesmo padrão de chamada do gemini.js (temperature 0, responseMimeType JSON)
  - node --test verde · firewall verde
- fora-de-escopo: nada financeiro
- depende-de: cod-0011, cod-0012
- status: pronta

### [P1] Agente — 5/8: render (template + narração LLM + firewall de fidelidade)
- id: cod-0014
- tipo: feature-codigo
- skills: economizei-tdd, economizei-financial-firewall, economizei-copywriter
- objetivo: render.js — responder(fato, intent, modo): 'template' → intent.template(fato); 'llm' → narra via Gemini a partir das strings já formatadas do fato e roda conferirFidelidadeNumerica; se reprovar, cai no template (airbag). Default 'llm' (Opção A com narração). Desenho §5 Camada 5 e §10.
- arquivos-alvo: src/agent/render.js (novo), test/agent-render.test.js (novo)
- criterios-de-aceite:
  - testados: caminho template; caminho llm-aprovado (LLM simulado); caminho llm-REPROVADO → fallback pro template
  - prompt de narração proíbe calcular número e proíbe conselho além do dado
  - node --test verde · firewall verde
- fora-de-escopo: nada financeiro
- depende-de: cod-0011, cod-0012
- status: pronta

### [P1] Agente — 6/8: mensagens do agente (formatter)
- id: cod-0015
- tipo: feature-codigo
- skills: economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: formatter.js — montarForaDeEscopo(), montarAvisoMeioLimitePerguntas(usadas, limite), montarLimitePerguntasAtingido(limite). Tom formal, sem gíria.
- arquivos-alvo: src/formatter.js (adicionar funções), test/formatter-agente.test.js (novo)
- criterios-de-aceite:
  - mensagens puras testadas; nenhuma cita preço/plano/pagamento
  - node --test verde · firewall verde
- fora-de-escopo: NÃO tocar montarMensagemPlanos nem texto de preço/assinatura
- status: pronta

### [P1] Agente — 7/8: cota plana + log de perguntas (supabase.js)
- id: cod-0016
- tipo: feature-codigo
- skills: economizei-tdd, economizei-financial-firewall, economizei-security-lgpd
- objetivo: cota PLANA de 30/mês para todos (sem Pro). src/agent/cota.js (helper puro decidirCota(usadas,limite)→{atingido,cruzouMetade}); supabase.js com verificarLimitePerguntas, incrementarPerguntas, registrarPergunta, purgarPerguntasLog usando env LIMITE_PERGUNTAS_FREE (default 30). Lê colunas da migration humana (perguntas_mes_atual, perguntas_log).
- arquivos-alvo: src/agent/cota.js (novo), test/agent-cota.test.js (novo), src/supabase.js (funções de I/O)
- criterios-de-aceite:
  - decidirCota puro e testado (15/30 cruza metade; 30/30 e 31 atingido)
  - funções supabase SEM nenhum token proibido (sem is_pro/features_pro_ate/assinatura)
  - node --test verde · firewall verde
- fora-de-escopo: NÃO criar/rodar migration (supabase/ é humano); NÃO gate por Pro
- depende-de: migration humana (ver Ações do Gabriel) para rodar em produção; código pode ser escrito antes
- status: pronta

### [P0] Agente — 8/8: orquestrador + ligar no fluxo de texto
- id: cod-0017
- tipo: feature-codigo
- skills: economizei-tdd, economizei-financial-firewall, economizei-copywriter
- objetivo: agent/index.js — responderPergunta(phone, texto): cota → se atingido envia montarLimitePerguntasAtingido e para; senão classificar → se fora_de_escopo, montarForaDeEscopo; senão executar → render(modo) → incrementarPerguntas + registrarPergunta; envia aviso do meio quando cruzouMetade. Ligar no `else` final de processarTexto (index.js) no lugar do "Não consegui entender". Desenho §2, §9.
- arquivos-alvo: src/agent/index.js (novo), src/index.js (só o else final de processarTexto), test/agent-orquestrador.test.js (novo)
- criterios-de-aceite:
  - fluxo de decisão testado com dependências simuladas (atingiu limite / off-topic / resposta normal / aviso do meio)
  - wiring só no ramo NÃO-financeiro; nenhum comando de pagamento alterado
  - node --test verde · firewall verde
- fora-de-escopo: NÃO mexer em /planos /assinar /pix /cancelar; nada de is_pro
- depende-de: cod-0010..0016
- status: pronta

---

## 🔧 Em revisão
*(a máquina move pra cá ao abrir o PR — esperando o Gabriel revisar/mergear)*

### [P1] Agente — 1/8: parser de período (puro)
- id: cod-0010
- tipo: feature-codigo
- skills: economizei-tdd
- objetivo: módulo puro que resolve rótulo/texto de período em mês de referência (Desenho §3, §6).
- arquivos-alvo: src/agent/periodo.js (novo), test/agent-periodo.test.js (novo)
- criterios-de-aceite:
  - resolverPeriodo cobre 'mes_atual', 'mes_passado', nome de mês ('maio'→'YYYY-MM'), 'YYYY-MM' e inválido → {invalido:true}
  - puro, sem I/O, sem Gemini · node --test verde · firewall verde
- fora-de-escopo: nada financeiro; não tocar supabase/
- status: em-revisao
- data-revisao: 2026-06-26
- nota: criados src/agent/periodo.js e test/agent-periodo.test.js. 20/20 testes verdes. 46/46 na suite completa. Firewall bloqueou só pelos arquivos pré-existentes no working tree (package.json + claude-nightly.yml, A7 pendente) — arquivos novos limpos (zero tokens financeiros confirmado por grep). _hoje injetável para determinismo nos testes.

### [P1] Testes do alerta em 3 níveis
- id: cod-0003
- tipo: teste
- skills: economizei-tdd
- objetivo: cobrir `avaliarCompra` / `deveEnviarMensagem` (alerts.js) com testes dos 3 níveis (abaixo 🎉 / dentro ✅ / acima 📈) e dos limiares por env, solidificando a rede antes de gerar mais feature.
- arquivos-alvo: test/alerts.test.js (novo)
- criterios-de-aceite:
  - cobre os 3 vereditos e o modo "relevante" (default)
  - `node --test` verde · firewall verde
- fora-de-escopo: NÃO mudar a lógica de `alerts.js`, só testar; nada financeiro
- status: em-revisao
- data-revisao: 2026-06-25
- nota: criado `test/alerts.test.js` (11 testes, 11 verdes no sandbox). NÃO houve mudança em `src/` (só teste novo). O `npm run check` foi bloqueado pelo firewall por mudanças **pré-existentes** no working tree (`package.json` + `.github/workflows/claude-nightly.yml` — a limpeza do Actions/A7 ainda não commitada), NÃO pelo arquivo novo (que passou limpo: zero tokens financeiros). Falha de `gemini-canonico.test.js` na suite é pré-existente (sharp não carrega no sandbox — ver cod-0002).

### [P0] F3 — "Onde cortar sem doer"
- id: cod-0001
- tipo: feature-codigo
- skills: economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: a partir dos gastos por categoria do mês + histórico do próprio usuário, sugerir 1–2 cortes discricionários honestos (reusa `CATEGORIAS_SUPERFLUAS` de `insights.js`), expostos via comando `/cortar` (ou conclusão anexa ao `/gastos`). Fecha a leva F2→F1→F4→F3 do catálogo (CLAUDE 06-09/06-18).
- arquivos-alvo: src/insights.js (nova função pura `analisarOndeCortar`), src/formatter.js (template da mensagem — NÃO mexer em pricing), src/index.js (registrar o comando, longe da zona financeira), test/insights.test.js
- criterios-de-aceite:
  - função pura, sem I/O, testada com dados sintéticos
  - honestidade: só sugere corte de categoria claramente supérflua e com peso real; nunca inventa número (passa pelo `financial-firewall`)
  - `node --test` verde · firewall financeiro verde
- fora-de-escopo: nada de pagamento/planos/`is_pro`; não tocar `mercadopago.js`; não prometer feature inexistente
- status: em-revisao
- data-revisao: 2026-06-24

### [P1] Afrouxar a heurística de qualidade do nome_canônico
- id: cod-0002
- tipo: refino-codigo
- skills: economizei-tdd, economizei-debugging
- objetivo: corrigir o falso positivo `pouco_simplificado` de `avaliarQualidadeCanonicoItem` (gemini.js) — pendência do CLAUDE 06-07. A heurística já tinha sido afrouxada no código em 2026-06-08 (limiar 25 chars / 95%); esta tarefa adiciona o TESTE de regressão que trava o comportamento.
- arquivos-alvo: test/gemini-canonico.test.js (novo)
- criterios-de-aceite:
  - exemplos reais não acusam mais: "Bisc Marilan 1" → "biscoito marilan", "Picanha Bov Kg 0,456 Kg" → "picanha bovina 0.456kg" (✓ verificado)
  - teste cobrindo esses casos + os vereditos reais (ausente/curto/longo/igual/pouco_simplificado)
- fora-de-escopo: NÃO mudar o prompt do Gemini nem o fluxo de leitura do cupom
- status: em-revisao
- data-revisao: 2026-06-25
- nota: a função já estava correta no código (afrouxada em 06-08); só faltava o teste, então NÃO houve mudança em src/. `node --test` do arquivo novo precisa rodar na máquina do Gabriel — `sharp` não carrega no sandbox linux (bus error). Lógica verificada standalone: 8/8 casos.

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

*(vazio)*

---

## 🧊 Backlog (ideias não priorizadas — a máquina NÃO pega daqui)
*(rascunhos. Na sessão de planejamento, você + Opus refinam e sobem pra "Fila pronta")*

**Código (não-financeiro) — prontos para priorizar:**
- **cod-0004 · Encurtamento das mensagens automáticas** (`formatter.js`) — proposta pronta em `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md` (−25%, números sobem pro topo). ⚠️ **Aguarda aprovação do Gabriel** — quando aprovar, sobe pra "Fila pronta" com P1.
- **cod-0005 · Agente de Perguntas MVP** — ✅ **Decisões respondidas (2026-06-24) e expandido em cod-0010..0017 na "Fila pronta"** (Free, 3 intenções, Opção A estruturada com narração LLM). Design atualizado: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`.
- **cod-0018 · Agente de Perguntas — Opção B (fundamentação aberta / function-calling)** — o "chat de verdade": o Gemini escolhe entre as intenções como ferramentas (sem classificador fixo), reusando guardas e firewall idênticos. Costura no Desenho §14. ⚠️ **Só subir pra fila DEPOIS de A validada** (cod-0010..0017 no ar, `fidelidade_ok` estável no log + perguntas recorrentes fora das 3 intenções).
- **cod-0006 · `/apagar`** — handler de exclusão de dados do usuário (compras, itens, indicacoes) — LGPD. ⚠️ Sensível (apaga dado): revisar com cuidado, talvez começar como dry-run. **[Auditoria 06-25 · A2 🔴]** anunciado nas boas-vindas, no `/privacidade` e no lembrete D60 mas **SEM handler** — comando quebrado + promessa de LGPD (direito de exclusão) não cumprida. Subir de prioridade.
- **cod-0007 · Afinar limiares do alerta** (`ALERTA_*`) com base em dados reais — precisa de dados em produção primeiro.
- **cod-0008 · Testes de `formatter.js`** nas mensagens não-financeiras (gastos, inflação, economia). **[Auditoria 06-25 · A6 🟠]** expandido em cod-0022 (cobre também `/cortar` e o alerta de 3 níveis).

**🔍 Achados da Auditoria de Código (2026-06-25) — ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`:**
*(capturados aqui pra priorizar depois. Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · 🟢 baixo. Itens de SQL/git/financeiro foram pro painel "Ações do Gabriel"; decisões de produto foram pra "Aguardando sua decisão".)*

- **cod-0020 · 🔴 Comparativo entre mercados — LEITURA [A1]** — a feature paga nº1 da pesquisa, hoje **só coleta**: `precos_mercado` recebe `INSERT` mas nunca é lido. Construir a leitura: query em `supabase.js` + comparação pura em `insights.js` + `montarMensagemComparativo` em `formatter.js` + comando `/comparar` em `index.js`. ⚠️ O **gate por Pro** (`temFeaturesProAtivas`/`is_pro`) é passo SEPARADO e humano (toca firewall) — a máquina entrega a leitura, você liga o gate depois. Depende de densidade de dados (vários usuários na mesma loja). tipo: feature-codigo. skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall.
- **cod-0021 · 🟡 Corrigir copy obsoleta `nao_supermercado` [A8]** — a mensagem de `montarMensagemErro` ("só leio mercado, farmácia/posto não") contradiz o comportamento real (lê não-mercado desde 2026-06-04). Ajustar a copy + o valor `nao_supermercado` que `inferirCategoria` (`gemini.js`) ainda devolve. tipo: refino-codigo. skills: copywriter, copy-review, code-decisions, tdd.
- **cod-0022 · 🟡 Testes do `formatter.js` (não-financeiro) [A6]** — cobrir gastos, inflação, economia, `/cortar` e o alerta de 3 níveis. Substitui/expande cod-0008. tipo: teste. skills: tdd, code-decisions. *(Testes do caminho do dinheiro tocam firewall → ver "Ações do Gabriel".)*
- **cod-0023 · 🟠 Alerta inteligente Pro (preditivo/categorizado) [A1]** — hoje o alerta de 3 níveis (`alerts.js`) vai pra todos; o Pro promete um alerta diferenciado que **não existe**. Primeiro DESENHAR o que "preditivo/categorizado" significa, depois implementar. ⚠️ gate Pro = humano. tipo: estrutura/design → feature-codigo. skills: product-principles, roadmap-deps, code-decisions, tdd, financial-firewall.
- **cod-0024 · 🟢 `inativo_d10` não citar contador do mês pra inativo [nit]** — o reset preguiçoso de `compras_mes_atual` pode fazer o lembrete citar a contagem do mês passado. Ajustar `reengagement.js`/`formatter.js`. tipo: refino-codigo. skills: code-decisions, tdd.
- **cod-0025 · 🔴 Onboarding tranca comandos de pagamento [A3]** — nos steps 0–1 todo texto vira onboarding, então `/planos`/`/assinar`/`/pix` não respondem até o usuário mandar 1 cupom (bloqueia conversão paga). ⚠️ A correção mexe no roteamento de comandos de pagamento (`index.js`) → **provável trip do firewall**; tratar como sensível/revisão humana, **não soltar sozinha**. tipo: bugfix. skills: product-principles, code-decisions, tdd, financial-firewall.

**Páginas (foco secundário por enquanto):**
- pag-0001: ajustar `landing/vercel.json` pra páginas novas (`/guias/...`) serem alcançáveis (hoje o catch-all joga tudo pro index). Pré-requisito de qualquer página nova de SEO.
- pag-0002: guia SEO "Como economizar no supermercado".
- pag-0003: guia SEO local "Economizar em Fernandópolis e região".
- pag-0004: variação A/B da headline do hero (`landing/index-b.html`).
- Página "Economizei vs. planilha de Excel" (o concorrente real, segundo a pesquisa).

---

## 🙋 Ações do Gabriel (só humano resolve — a máquina não consegue)

> Esta seção é o seu painel. Guia: `Economizei app/Automacao_Maquina_Noturna.md`.

**🔓 Pré-requisitos jurídicos/financeiros — desbloqueiam Meta Ads, Hotmart e Wise:**
*(estas ações devem ser feitas ANTES de qualquer outra coisa de pagamento ou ads)*

- [ ] **[BLOQUEADOR #1] Abrir empresa em BC** — sem isso, não dá pra vincular Meta Business Manager, Hotmart nem Wise Business. Passo a passo completo em `Economizei app/Abertura_Empresa_BC_2026-06-24.md`. Custo: ~CAD 380–600 (abertura) + ~CAD 650–2.000/ano (manutenção). Prazo: ~2 semanas do zero até operacional.
  - [ ] Name Approval Request (NAR) — CAD 30 — [BC Registry](https://www.bcregistry.ca)
  - [ ] Incorporação provincial BC — CAD 350 — [Corporate Online](https://www.corporateonline.gov.bc.ca)
  - [ ] Abre conta bancária empresarial pessoalmente (RBC, TD ou Coast Capital)
  - [ ] Registra Business Number na CRA (gratuito, online)
  - [ ] Registra GST/HST voluntariamente (gratuito — permite recuperar imposto de despesas)

- [ ] **[BLOQUEADOR #2] Criar conta Wise Business vinculada à empresa canadense** — desbloqueia recebimento de PIX dos planos mensais. Ativa conta BRL (dados bancários brasileiros para receber PIX). Gratuito para criar; sem custo fixo mensal.

- [ ] **[BLOQUEADOR #3] Vincular Meta Business Manager à empresa canadense** — trocar a entidade do BM atual para a nova empresa BC. Desbloqueia Meta Ads sem os 12,15% de impostos brasileiros (PIS/COFINS + ISS) sobre cada real gasto em mídia.

- [ ] **[BLOQUEADOR #4] Cadastrar na Hotmart como não-residente com empresa canadense** — desbloqueia os planos anuais (R$99/R$150/R$220) com pagamento direto para conta canadense + programa de afiliados. Hotmart cuida da nota fiscal brasileira.

- [ ] **[BLOQUEADOR #5] Regularizar conta bancária brasileira** — após saída fiscal declarada, conta corrente comum é irregular. Converter para CDE (Conta de Domiciliado no Exterior) ou encerrar. Consultar contador especializado em brasileiros no exterior.

> ⚠️ **Aviso de custo:** abrir e manter a empresa em BC tem custo real. Abertura: ~CAD 380–600 (~R$1.500–2.400). Manutenção anual: ~CAD 650–2.000 (~R$2.600–8.000), sendo o maior item o contador para a declaração T2 obrigatória (~CAD 500–1.500/ano). Esses custos são necessários e se pagam rapidamente (só a economia nos impostos de Meta Ads já justifica parcialmente), mas devem estar no orçamento antes de iniciar.

---

**Setup (uma vez, bem simples):**
- [ ] Ter o Claude Code instalado e logado na sua assinatura na máquina.
- [ ] **[2026-06-25] Soltar o `tarefa.md` (já com o GATILHO DE SKILLS) em `.claude/commands/`.** O Cowork não escreve em `.claude/` — o arquivo foi entregue na pasta de saída da sessão; copie pra `C:\Economizei\.claude\commands\tarefa.md` pra ter o comando `/tarefa` carregando as skills certas. (Conteúdo também no guia `Automacao_Maquina_Noturna.md` §4.)
- [ ] (Opcional) Colar a nota do Gatilho de Skills no `.claude/skills/README.md` (também protegido pro Cowork) — trecho pronto no chat da sessão de 2026-06-25.
- [ ] Pronto — não tem secret, workflow nem GitHub App pra configurar.

**Rotina de cada vez que for trabalhar (manual):**
- [ ] Na pasta do projeto, rodar `/tarefa` no Claude Code (ou colar o prompt do guia).
- [ ] Revisar o diff; rodar `npm run check` (firewall + testes).
- [ ] Commitar e dar push você mesmo se estiver bom; se não, `git checkout .` descarta.
- [ ] Repriorizar a "Fila pronta" pra próxima vez.

**Rotina automática das 10h (Vancouver) — Cowork Scheduled:**
- Roda 1 tarefa pronta por dia (com o app do Cowork aberto), **sem commitar**, e escreve o `RELATORIO_MATINAL.md`.
- [ ] De manhã: ler `RELATORIO_MATINAL.md` → revisar o diff → `npm run check` → commitar ou `git checkout .`.
- Mapa completo do comportamento: `Economizei app/Mapa_Processo_Maquina_Local.md`.

**Coisas que SÓ você faz (a automação é barrada de propósito):**
- [ ] Qualquer mudança financeira (pagamento, assinatura, preço, `is_pro`).
- [ ] Rodar migration no Supabase (a automação não toca `supabase/`).
- [ ] Adicionar dependência nova (`package.json` é bloqueado) se uma tarefa precisar.
- [ ] Commit e push (a automação local nunca commita).
- [ ] Decisão de produto/UX/pricing/ICP/promessa de feature.

**🔍 Achados da auditoria (2026-06-25) — só humano (SQL / git / financeiro):**
*(ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`)*
- [ ] **[A4 🟠] Versionar `CREATE TABLE resumos_mensais_enviados`** numa migration — hoje a tabela é usada pelo código (`verificarResumoJaEnviado`/`marcarResumoEnviado`) e pelo `rls_migration.sql`, mas **não existe `CREATE` em nenhum arquivo** (foi criada à mão no console). Sem isso, reconstruir o banco a partir do repo quebra o resumo mensal. (`supabase/` = zona proibida → você.)
- [ ] **[A9 🟡] Migration `ALTER TABLE compras ADD COLUMN cnpj`** + gravar o cnpj no `salvarCompra` — hoje o CNPJ extraído pelo Gemini **nunca é guardado** no nível da compra (só anônimo em `precos_mercado`). Prepara o comparativo (cod-0020). (migration = você; o ajuste no `salvarCompra` pode ir junto na revisão.)
- [ ] **[A10 🟢] Corrigir o comentário de `beta_fundador` no `schema.sql`** ("garante 3 meses grátis + preço travado") — contradiz a decisão de 2026-05-19 que revogou os benefícios de Beta. (`supabase/` = você.)
- [ ] **[A7 🟡] Reconciliar memória × deploy:** commitar/deployar o working tree (13 modificados + untracked, incl. o `/cortar` da F3 e o encurtamento de mensagens), alinhar `CLAUDE.md` (diz que o encurtamento foi aplicado) × `AGENDA.md` (cod-0004 diz pendente), e remover `_writetest_root.tmp` da raiz.
- [ ] **[A1 🔴 financeiro] Ligar o gate Pro** do comparativo (cod-0020) e do alerta inteligente (cod-0023) via `temFeaturesProAtivas` — toca `is_pro` (firewall), é seu. **Sem isso, o pago entrega só cupons ilimitados** e a recompensa de indicação fica vazia.
- [ ] **[A6 🟠] Testes do caminho do dinheiro** (`mercadopago.js`, conciliação de webhook, liga/desliga `is_pro`) — tocam tokens financeiros (firewall) → escrever/revisar é humano.

**Limpeza do GitHub Actions (uma vez, ver comandos no chat):**
- [ ] `git rm` dos workflows `ci.yml` e `claude-nightly.yml` + apagar `pages-ci.yml` (untracked).
- [ ] Se tiver criado branch protection exigindo o check "CI", remover (senão trava PRs futuros).
- [ ] (Opcional) Desinstalar o app do Claude no GitHub e apagar o secret `CLAUDE_CODE_OAUTH_TOKEN`.

---

## ⏳ Aguardando sua decisão (não virou tarefa da fila ainda)

- [ ] **[2026-06-24] Approvar encurtamento das mensagens automáticas** — ler `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`, dizer "aprovado" (ou ajustar) e a máquina aplica no `formatter.js`. Nenhum dado financeiro tocado.
- [x] **[2026-06-24] Open Questions do Agente de Perguntas — RESPONDIDAS** (Free básico 3 intenções · limite 30/mês com aviso no meio · responde a mais provável, pergunta de volta só off-topic · guarda a pergunta no log · gemini-2.5-flash · Opção A estruturada com narração LLM, depois B). Tarefas na fila: cod-0010..0017.
- [ ] **[2026-06-24] Pré-requisitos HUMANOS do Agente de Perguntas** (a máquina é barrada de propósito nestes):
  - [ ] **Migration** (`supabase/` = zona proibida): criar `usuarios.perguntas_mes_atual INT DEFAULT 0` + tabela `perguntas_log` (ver SQL no Desenho §7) + reset mensal acompanhando o de `compras_mes_atual`.
  - [ ] **Envs** (`.env*` = bloqueado): `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODELO=gemini-2.5-flash`, `AGENTE_MODO=llm` — no Railway e no `.env.example`.
  - [ ] **Ordem de deploy:** rodar a migration ANTES de commitar/subir cod-0016 e cod-0017 (senão a cota quebra em produção).
  - [ ] **Pro depois:** o gate Free/Pro do Q&A (usa `is_pro`/`features_pro_ate`) é seu quando expandir — a máquina não pode tocar (firewall).
- [ ] **[2026-06-24] Construir webhook Hotmart → /admin/ativar-pro** — quando Hotmart confirmar pagamento, setar `is_pro=true` automaticamente. É código que toca pagamento, tem que ser o Gabriel fazendo e revisando.
- [ ] **[2026-06-24] Atualizar formatter.js com pricing anual + Hotmart** — `/planos` e `/assinar` ainda mostram só preços mensais/MP. Toca zona financeira, revisar com cuidado.
- [ ] **[2026-06-24] Commitar arquivos pendentes** — ver comando pronto no `Mapeamento_Geral_Pendencias_2026-06-24.md` Seção 1.
- [ ] **[2026-06-23] Usar a economia do plano anual como prova de marketing na landing.** Ideia: mostrar na própria página o ganho do anual (ex.: selo "pague 10, leve 12 — economize R$19,80/ano no Individual" ou um comparativo mensal × anual) pra justificar o destaque do anual e aumentar conversão. **Parado aguardando sua decisão** — quando aprovar, vira uma tarefa `landing-ab`/`institucional` na "Fila pronta" pra Máquina Noturna montar. Contexto completo no `CLAUDE.md` Seção 3 (plano anual). ⚠️ Atenção: a landing tem **pricing**; uma tarefa dessas precisa ser desenhada pra não esbarrar no firewall financeiro (texto de preço na página é zona sensível — você revisa).
- [ ] **[Auditoria 06-25 · A1] Comparativo entre mercados: liberar pra todos ou só Pro?** Decisão de produto/pricing antes de a máquina montar o cod-0020 — a leitura é neutra; o **gate** é que define Free × Pro. Contexto: é a feature paga nº1 da pesquisa e a base da recompensa de indicação.
- [ ] **[Auditoria 06-25 · §4] Confirmar a sequência recomendada:** fechar a promessa do pago (comparativo cod-0020 + alerta Pro cod-0023 + `/apagar` cod-0006) **antes** de escalar anual/afiliados/ads — porque hoje o pago entrega só "cupons ilimitados" e cobrar o anual por uma promessa vazia é risco de reembolso/confiança. Ver §4 da auditoria. Concorda com essa ordem?
