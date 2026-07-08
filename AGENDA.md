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

**Última curadoria:** 2026-07-02 (reconciliação AGENDA × git) · **Modo:** execução local (GitHub Actions descontinuado)
**🎯 Último checkpoint integral:** *(nenhum ainda)* · **✅ Commitado + pushed até `a795f65` (origin/main):** cod-0026/0027/0030/0006/0011 + cod-0012 + memória + **A4/A9 + 2 migrations futuras** + limpeza do Actions — **tudo no `origin/main`, working tree limpo na máquina do Gabriel.** → **passou o gatilho de volume (6 tarefas commitadas); rodar um checkpoint Nível 2.** Sistema: `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md`.
**🏛️ Pilares do negócio:** `Economizei app/Pilares_do_Negocio_2026-06-30.md` (Pilar 1 Máquina · Pilar 2 Código/Produto · Pilar 3 futuro Marketing & Anúncios; firewall = tecido conectivo).
**🗄️ Migrations (2026-06-30):** os 4 SQL **já estão commitados** (`a795f65`) em `supabase/` — **A4** (`resumos_mensais_enviados`, versiona tabela feita à mão) e **A9** (`compras.cnpj` + ajuste no `salvarCompra`), + 2 **futuras** (`migration_FUTURA_agente_perguntas.sql`, `migration_FUTURA_alerta_pro_acompanhamentos.sql`). **Pendente humano (só falta RODAR, não commitar):** rodar A4+A9 no SQL Editor do Supabase — **A9: rodar o `ALTER TABLE compras ADD cnpj` ANTES do deploy do código**, senão `salvarCompra` quebra. As 2 futuras só rodam quando as features subirem (Agente / Alerta Pro).
**Foco atual (2026-07-03):** **rush da conversa fluida — cadeia do Agente de Perguntas FECHADA (cod-0013..0017 em revisão)** por pedido direto do Gabriel (prioridade sobre a sequência §4 nesta sessão). Também em revisão: **cod-0020 (comparativo, LEITURA)** da rotina matinal de 07-02. Tudo aguardando `npm run check` + commit do Gabriel. Próximo na fila: cadeia do Alerta Pro (cod-0031..0035, bloqueada por migration + gate Pro humanos). Desenhos: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md` · `Desenho_Alerta_Inteligente_Pro_2026-06-27.md`.
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
*(a máquina executa de cima pra baixo, uma por execução — rotina automática às 8:02 AM Vancouver, ou manual via `/tarefa`)*


> **💳 Promessa do pago primeiro (sequência §4, 06-27).** A prioridade é fechar o que o Pro promete antes de escalar. `/apagar` ✅ (cod-0006). Agora: **cod-0020 (comparativo entre mercados, LEITURA)** — a feature paga nº1, promovida pro topo. Depois a cadeia do Alerta Pro (cod-0031..0035, bloqueada por migration + gate Pro humanos). O Agente de Perguntas (cod-0013..0017) fica **abaixo**, por decisão de sequência.

> **❤️ Classificação + Alerta Inteligente Pro (desenho 2026-06-27).** Desenho completo: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. A classificação é o **coração do produto** (CLAUDE.md / CODE_GUIDE §0) e o alerta Pro depende dela. **cod-0026 + cod-0027 (classificação) e cod-0030 (matching puro) já foram commitados** (até `a795f65`). A cadeia Pro (cod-0031..0035) está refinada no Backlog — sobe pra "Fila pronta" quando a **migration** de `acompanhamentos` (humano) e o **gate Pro** estiverem prontos.

> **🤖 Agente de Perguntas (MVP — Free, 3 intenções, Opção A com narração LLM).**
> **✅ CADEIA COMPLETA (2026-07-03, rush do Gabriel).** cod-0010/0011/0012 commitados; **cod-0013..0017 todos implementados e em "Em revisão"** (aguardando `npm run check` + commit do Gabriel). Desenho: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`. **Pré-requisito HUMANO antes do deploy:** rodar `migration_FUTURA_agente_perguntas.sql` + envs (ver "Ações do Gabriel").

*(Fila vazia no momento — próximas candidatas: cadeia do Alerta Pro cod-0031..0035, bloqueada por migration + gate Pro humanos; ou cod-0021/0022/0024 do Backlog.)*

---

## 🔧 Em revisão
*(a máquina move pra cá ao abrir um PR — esperando o Gabriel revisar/commitar)*

### [P0] Agente — 5..8/8: render + mensagens + cota + orquestrador (CADEIA FECHADA)
- id: cod-0014 + cod-0015 + cod-0016 + cod-0017
- tipo: feature-codigo
- skills-usadas: economizei-tdd, economizei-financial-firewall, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-code-decisions (+ transversais)
- o-que-foi-feito (2026-07-03, sessão Cowork "rush conversa fluida" — SEM commit): **a conversa fluida do bot está completa de ponta a ponta.** Arquivos:
  - **cod-0014** `src/agent/render.js` (novo) + `test/agent-render.test.js` (11 testes): `responder(fato, intent, modo)` — 'template' determinístico; 'llm' narra via Gemini (temp 0, injetável nos testes, lazy-require do SDK) a partir das strings JÁ formatadas do fato, roda `conferirFidelidadeNumerica` (Camada 5) e **cai no template (airbag)** em reprovação/erro/narração vazia. **Camada 3 reforçada:** `temDados:false` responde o template honesto SEM chamar o LLM. Allowlist = template + `fmt.*` + `mesRef` + pct (cru/arredondado). Prompt proíbe calcular/arredondar número, conselho financeiro e gíria.
  - **cod-0015** `src/formatter.js` (+4 funções) + `test/formatter-agente.test.js` (5 testes): `montarForaDeEscopo`, `montarAvisoMeioLimitePerguntas`, `montarLimitePerguntasAtingido` e **`montarErroAgente`** (extra — Desenho §9, erro técnico neutro + saída por `/gastos`). Nenhuma cita preço/plano/pagamento (testado por scan); sem gíria; número primeiro.
  - **cod-0016** `src/agent/cota.js` (novo, puro) + `test/agent-cota.test.js` (10 testes) + 4 funções no `supabase.js`: `decidirCota` (atingido = usadas≥limite; **cruzouMetade = igualdade estrita com ceil(limite/2)** → aviso idempotente sem flag no banco); `verificarLimitePerguntas` (env `LIMITE_PERGUNTAS_FREE`, default 30; **fail-open** — cota é anti-abuso, falha de leitura não derruba a resposta), `incrementarPerguntas`, `registrarPergunta` (Camada 7/OODA, fire-and-forget), `purgarPerguntasLog` (TTL 90d, LGPD) **ligada no cron das 7h do `scheduler.js`** (degrada sozinha antes da migration). **Reset mensal coerente nas 2 vias:** `verificarLimitePerguntas` zera os 2 contadores na virada; `verificarLimiteGratuito` ganhou um update SEPARADO e best-effort zerando `perguntas_mes_atual` (antes da migration a coluna não existe e ele falha sozinho, sem afetar o reset de cupons).
  - **cod-0017** `src/agent/index.js` (novo) + `test/agent-orquestrador.test.js` (11 testes) + wiring: `responderPergunta(phone, texto)` = cota → classificar → executar → render → enviar → incrementar + aviso do meio + log. Deps 100% injetáveis (resolução preguiçosa POR dependência — teste nunca toca Supabase/Z-API/Gemini). **Off-topic NÃO consome cota** (conforme objetivo da tarefa). Erro técnico → `montarErroAgente`, nunca número chutado. Wiring: `else` final de `processarTexto` (index.js) trocou o "Não consegui entender" por `responderPergunta(phone, texto)` — **nenhum comando de pagamento alterado**.
- validação: **184/184 testes verdes** (suíte completa em cópia limpa /tmp, exceto os 2 testes com `sharp` — SIGBUS no sandbox, passam na sua máquina); `node --check` ok nos 7 arquivos tocados (via cópias limpas — o mount do sandbox trunca arquivo editado, problema recorrente); **self-scan firewall: 0 tokens financeiros nas linhas adicionadas** (mesmos padrões do `check-firewall.mjs`; selftest 16/16).
- pendências humanas (ver "Ações do Gabriel"):
  - `npm run check` na sua máquina = gate final; depois commit + push (sugestão: 4 commits, um por tarefa).
  - **Rodar `supabase/migration_FUTURA_agente_perguntas.sql` ANTES do deploy** (sem ela: cota fail-open = sem limite, e log/contador não gravam — o bot responde, mas sem as travas).
  - **Envs** (`.env*` = zona proibida da máquina): `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODO=llm`, `AGENTE_MODELO=gemini-2.5-flash` no Railway + `.env.example`.
  - Lembrete de custo: cada pergunta agora = até 2 chamadas Gemini (classificação + narração), texto barato (~R$0,001–0,009/pergunta, Desenho §4).
  - A9 (`compras.cnpj`) continua valendo: rodar ANTES de qualquer deploy (já commitado no `salvarCompra`).
- status: em-revisao (2026-07-03)

### [P1] Agente — 4/8: classificador (Gemini → intenção)
- id: cod-0013
- tipo: feature-codigo
- skills-usadas: economizei-tdd, economizei-code-decisions, economizei-financial-firewall (transversais)
- o-que-foi-feito (2026-07-02, rotina matinal — SEM commit): construído o passo de classificação do Agente. **2 arquivos novos**, tudo fora da zona financeira:
  - `src/agent/classifier.js` (novo): `montarPromptClassificacao(registro, pergunta)` — função **PURA**, monta o prompt a partir do registro (ids + descrições + exemplos + vocabulário fechado das categorias + rótulos de período), determinística, e proíbe explicitamente o modelo de devolver número. `classificar(pergunta, opts)` — chama gemini-2.5-flash no mesmo padrão do `gemini.js` (temp 0, `responseMimeType: JSON`), faz parse (tolera cerca de markdown) e valida pela Camada 1 (`guards.validarClassificacao`). A chamada ao Gemini é **injetável** (`opts.chamarModelo`) pros testes rodarem sem tocar a API nem carregar o SDK (SIGBUS-safe). Lazy-require do `@google/generative-ai`.
  - Degradação segura: JSON inválido / erro do modelo / pergunta vazia / intent inexistente → `{ intent: 'fora_de_escopo' }`. **Porta de topicalidade (Desenho §4 / Camada 2):** problema SÓ de parâmetro (categoria fora do enum, período inválido, param desconhecido) **não** joga a pergunta fora — o parâmetro mal-lido é saneado e a intenção (sobre dinheiro) permanece; o template responde o mais geral. O número segue blindado pelas outras camadas.
  - `test/agent-classifier.test.js` (novo): **16 testes**, todos verdes (`node --test`). Cobrem: prompt puro (ids/exemplos/vocabulário/pergunta embutida/determinismo/proíbe número), caminho feliz, período mes_passado, cerca de markdown, fora_de_escopo, intent inexistente, JSON inválido, erro do modelo, pergunta vazia (não chama o modelo), saneamento de categoria/período/param inválidos, normalização de confiança.
- fora-de-escopo respeitado: nada financeiro; nenhuma migration; não liga no fluxo (isso é o cod-0017). Firewall self-scan das linhas adicionadas: **0 tokens financeiros** (`✓ FIREWALL OK`).
- pendências humanas:
  - rodar `npm run check` na sua máquina como gate final (aqui os 2 testes que carregam `sharp` — `gemini-canonico`, `classificacao-corpus` — dão **SIGBUS no sandbox Linux**; passam na sua máquina Windows, como já documentado).
  - depende de cod-0011/cod-0012 (já commitados). Próximo da cadeia: cod-0014 (render).
- status: em-revisao (2026-07-02)

### [P0] Comparativo entre mercados — LEITURA (feature paga nº1)
- id: cod-0020
- tipo: feature-codigo
- skills-usadas: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-financial-firewall
- o-que-foi-feito (2026-07-02, rotina matinal — SEM commit): construída a LEITURA do comparativo. **4 arquivos + 1 teste novo**, tudo fora da zona financeira:
  - `src/insights.js`: `compararPrecosMercado(observacoes, opts)` — função PURA. Agrupa observações de `precos_mercado` por produto canônico e por loja (mantém a obs mais recente de cada loja), acha menor/maior preço, economia, %, e a posição do usuário (`mais_barato`/`mais_caro`/`intermediario`). Janela temporal (default 60 dias), `minLojas` (2), `minEconomiaPct`, e `maxComparativos` (teaser). Honestidade: nada casa em ≥2 lojas → `temComparativo:false`, nunca número chutado; empate de preço não vira comparativo.
  - `test/insights-comparativo.test.js` (novo): **16 testes**, todos verdes em execução isolada (ver relatório). Cobrem: ≥2 lojas, empate, loja única, nada casa, posição do usuário, janela temporal, dedup por loja, teaser (`maxComparativos`/`temMais`), `minEconomiaPct`.
  - `src/supabase.js`: `buscarObservacoesComparativo(phone)` — só LEITURA. Pega os canônicos que o usuário compra + a loja da compra mais recente, e busca em `precos_mercado` dentro da janela. Degrada pra vazio em erro. Exportada.
  - `src/formatter.js`: `montarMensagemComparativo(resultado)` — número no topo (menor preço + economia), voz WhatsApp sem gíria proibida, estado-vazio honesto. Exportada.
  - `src/index.js`: comando `/comparar` (aliases `/comparativo`) + handler `mostrarComparativo`. Teaser via env `COMPARATIVO_AMOSTRAS_FREE` (default 3). Imports adicionados.
- fora-de-escopo respeitado: **gate Pro NÃO ligado** (é passo humano/firewall); `INSERT` de `precos_mercado` intocado; nada de pagamento/cobrança. Firewall self-scan das linhas adicionadas: **0 tokens financeiros**.
- pendências humanas:
  - rodar `npm run check` na sua máquina como gate final (o mount do sandbox serviu snapshot antigo do repo — não deu pra rodar o check integral aqui; ver `RELATORIO_MATINAL.md`).
  - adicionar `COMPARATIVO_AMOSTRAS_FREE=3` no `.env.example` e no Railway (`.env*` é zona proibida da máquina).
  - **[financeiro/humano]** ligar o gate Pro (mostrar N amostras no Free, tudo no pago) usando `temFeaturesProAtivas` — `resultado.temMais` já sinaliza que há mais pra mostrar.
  - (opcional) rodar o `ALTER` do A9 (`compras.cnpj`) melhora o casamento por loja/CNPJ no futuro.
- status: em-revisao (2026-07-02)

---

**As 6 tarefas anteriores** (cod-0006/0011/0012/0026/0027/0030) já foram commitadas e pushadas (até `a795f65` em `origin/main`) — estão em "✅ Concluído". Detalhe no git log e no `CLAUDE.md`.

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

> **Reconciliado em 2026-07-02:** as 6 tarefas abaixo já estavam commitadas e pushadas (working tree limpo em `a795f65 = origin/main`); a AGENDA é que estava stale (ainda as listava em "Em revisão"). Verificado por `git log`.

- **cod-0012 · Agente 3/8 — registro das 3 intenções + templates** (commit `4a3c62e`) — `src/agent/intents.js` + `test/agent-intents.test.js` (20 testes) + export de `brl` no `formatter.js`. *(skills: tdd, financial-firewall)*
- **cod-0011 · Agente 2/8 — guardas de honestidade (puras), "o coração"** (commit `e4cc493`) — `src/agent/guards.js` (`validarClassificacao`, `extrairNumeros`, `conferirFidelidadeNumerica`) + `test/agent-guards.test.js` (28 testes). *(skills: tdd, financial-firewall)*
- **cod-0006 · `/apagar` — exclusão de dados LGPD** (commit `ddde18c`) — `src/apagar.js` + `apagarDadosUsuario` (supabase.js) + 3 mensagens + handler antes do onboarding + `test/apagar.test.js` (11 testes). Fechou o A2. Sem migration. *(skills: security-lgpd, tdd, copywriter, copy-review, financial-firewall, code-decisions)*
- **cod-0030 · Alerta Pro — engine de matching puro** (commit `2a83bcd`) — `casarItemComAlvo`/`buscarGastoPorAlvo`/`buscarGastoSuperfluo` em `insights.js` + `test/insights-matching.test.js` (17 testes). *(skills: code-decisions, tdd, product-principles, financial-firewall)*
- **cod-0027 · Classificação — corpus de regressão** (commit `743f2b1`) — `test/classificacao-corpus.test.js` (corpus bom/ruim do `nome_canonico`). *(skills: tdd, code-decisions)*
- **cod-0026 · Classificação — `nome_canonico` lidera pelo tipo genérico** (commit `8a479c4`) — prompt + heurística `comeca_por_marca` em `gemini.js` + testes. Habilita o matching por palavra-chave do alerta Pro. *(skills: code-decisions, tdd, product-principles, financial-firewall)*
- **A4/A9 · migrations + `compras.cnpj` no `salvarCompra`** (commit `a795f65`) — `supabase/migration_2026-06-30_A4/A9...sql` + 2 futuras + edição no `salvarCompra`. **Falta rodar A4/A9 no SQL Editor** (ver "Ações do Gabriel"). *(zona `supabase/` — commitado com `--no-verify`)*

- **cod-0010 · Agente 1/8 — parser de período** (commit `b73b15b`) — `src/agent/periodo.js` + `test/agent-periodo.test.js`. Puro, sem I/O. Abre a cadeia do Agente de Perguntas. *(skills: economizei-tdd)*
- **cod-0001 · F3 "Onde cortar sem doer"** (commit `b73b15b`) — comando `/cortar` + `analisarOndeCortar` em `insights.js` + template em `formatter.js`. Fecha a leva F2→F1→F4→F3. *(skills: tdd, copywriter, copy-review, financial-firewall)*
- **cod-0003 · Testes do alerta em 3 níveis** (commit `b73b15b`) — `test/alerts.test.js` (11 testes). Sem mudança em `src/`. *(skills: economizei-tdd)*
- **cod-0002 · Teste de regressão do nome canônico** (commit `b73b15b`) — `test/gemini-canonico.test.js`. A heurística já estava afrouxada (06-08); faltava o teste. *(skills: tdd, debugging)*
- **cod-0004 · Encurtamento das mensagens automáticas (−25%)** (commit `e8de024`) — 14 funções do `formatter.js` reescritas (número no topo, copy WhatsApp). Doc: `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`. *(skills: copywriter, copy-review, financial-firewall)*

---

## 🧊 Backlog (ideias não priorizadas — a máquina NÃO pega daqui)
*(rascunhos. Na sessão de planejamento, você + Opus refinam e sobem pra "Fila pronta")*

**Código (não-financeiro) — prontos para priorizar:**
- ~~**cod-0004 · Encurtamento das mensagens automáticas**~~ — ✅ **CONCLUÍDO** (commit `e8de024`, 06-26 reconciliado). Ver "Concluído".
- **cod-0005 · Agente de Perguntas MVP** — ✅ **Decisões respondidas (2026-06-24) e expandido em cod-0010..0017 na "Fila pronta"** (Free, 3 intenções, Opção A estruturada com narração LLM). Design atualizado: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`.
- **cod-0018 · Agente de Perguntas — Opção B (fundamentação aberta / function-calling)** — o "chat de verdade": o Gemini escolhe entre as intenções como ferramentas (sem classificador fixo), reusando guardas e firewall idênticos. Costura no Desenho §14. ⚠️ **Só subir pra fila DEPOIS de A validada** (cod-0010..0017 no ar, `fidelidade_ok` estável no log + perguntas recorrentes fora das 3 intenções).
- ~~**cod-0006 · `/apagar`**~~ — ✅ **IMPLEMENTADO (2026-06-27), em "Em revisão"** (aguarda Gabriel rodar `npm run check` + commitar). Fechou o A2.
- **cod-0007 · Afinar limiares do alerta** (`ALERTA_*`) com base em dados reais — precisa de dados em produção primeiro.
- **cod-0008 · Testes de `formatter.js`** nas mensagens não-financeiras (gastos, inflação, economia). **[Auditoria 06-25 · A6 🟠]** expandido em cod-0022 (cobre também `/cortar` e o alerta de 3 níveis).

**🔍 Achados da Auditoria de Código (2026-06-25) — ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`:**
*(capturados aqui pra priorizar depois. Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · 🟢 baixo. Itens de SQL/git/financeiro foram pro painel "Ações do Gabriel"; decisões de produto foram pra "Aguardando sua decisão".)*

- **cod-0020 · 🔴 Comparativo entre mercados — LEITURA [A1] — GATE DECIDIDO (2026-06-27): Pro completo + teaser grátis** — a feature paga nº1 da pesquisa, hoje **só coleta**: `precos_mercado` recebe `INSERT` mas nunca é lido. Construir a leitura: query em `supabase.js` + comparação pura em `insights.js` + `montarMensagemComparativo` em `formatter.js` + comando `/comparar` em `index.js`. **Decisão de gate (Gabriel):** comparativo **completo só no Pro**, mas com **1+ comparativos de amostra liberados no Free** (teaser) pra o usuário entender a função e ver o valor antes de pagar. A máquina entrega a **leitura + a lógica do teaser** (ex.: nº de amostras grátis configurável por env, sem citar `is_pro`); o **gate Pro** (`temFeaturesProAtivas`/`is_pro`) e o limiar exato Free×Pro são passo SEPARADO e humano (toca firewall). Depende de densidade de dados (vários usuários na mesma loja). tipo: feature-codigo. skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall. **Próximo da fila do pago** (depois do `/apagar`, antes do Agente).
- **cod-0021 · 🟡 Corrigir copy obsoleta `nao_supermercado` [A8]** — a mensagem de `montarMensagemErro` ("só leio mercado, farmácia/posto não") contradiz o comportamento real (lê não-mercado desde 2026-06-04). Ajustar a copy + o valor `nao_supermercado` que `inferirCategoria` (`gemini.js`) ainda devolve. tipo: refino-codigo. skills: copywriter, copy-review, code-decisions, tdd.
- **cod-0022 · 🟡 Testes do `formatter.js` (não-financeiro) [A6]** — cobrir gastos, inflação, economia, `/cortar` e o alerta de 3 níveis. Substitui/expande cod-0008. tipo: teste. skills: tdd, code-decisions. *(Testes do caminho do dinheiro tocam firewall → ver "Ações do Gabriel".)*
- **cod-0023 · 🟠 Alerta inteligente Pro — ✅ DESENHADO (2026-06-27)** — `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. Virou 2 pilares (supérfluo + acompanhamento personalizável por categoria/palavra-chave) e foi quebrado em: **cod-0026/0027** (classificação — na Fila pronta), **cod-0030** (matching puro — na Fila pronta) e a cadeia Pro **cod-0031..0035** abaixo. ⚠️ gate Pro = humano.

**❤️ Alerta Inteligente Pro — cadeia restante (refinada; sobe pra Fila pronta após a migration + decisão Free×Pro):**
*(desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. Código pode ser escrito antes da migration; só não roda em produção sem ela.)*
- **cod-0031 · Leitura de acompanhamentos (`supabase.js`)** — `buscarAcompanhamentos(phone)`, `salvarAcompanhamento`, `desativarAcompanhamento`, `setCategoriasSuperfluas`. Lê a tabela `acompanhamentos` + `usuarios.categorias_superfluas` da migration humana. tipo: feature-codigo. skills: code-decisions, tdd, financial-firewall, security-lgpd. depende-de: cod-0030 + migration (humano).
- **cod-0032 · Pilar A — bloco de supérfluo** no `/gastos` e no resumo mensal (formatter), via `buscarGastoSuperfluo`. Número primeiro, sem moralizar. tipo: feature-codigo. skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall. depende-de: cod-0030.
- **cod-0033 · Comandos** `/acompanhar`, `/limite`, `/acompanhamentos`, `/parar`, `/superfluo` (index.js + formatter.js) com mensagens curtas (sem gíria proibida). tipo: feature-codigo. skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall. depende-de: cod-0031.
- **cod-0034 · Intent NL `gasto_por_termo`** no Agente de Perguntas ("quanto gastei em cerveja?") reusando o matching + firewall de fidelidade do agente. tipo: feature-codigo. skills: tdd, copywriter, copy-review, financial-firewall. depende-de: cod-0030, cod-0017 (agente no ar).
- **cod-0035 · Alerta proativo de limite** (per-compra, idempotente no mês — avisa só na virada do teto). tipo: feature-codigo. skills: code-decisions, tdd, copywriter, financial-firewall. depende-de: cod-0031, cod-0033.
- ⚠️ **Humano (firewall):** migration de `acompanhamentos` + `usuarios.categorias_superfluas`; ligar o **gate Pro** (`temFeaturesProAtivas`/`is_pro`); decidir **Free×Pro** (Desenho §8). Ver "Ações do Gabriel" / "Aguardando decisão".
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
- [x] **[2026-06-25] `tarefa.md` em `.claude/commands/` — FEITO** (confirmado em 06-26: `C:\Economizei\.claude\commands\tarefa.md` existe, com o GATILHO DE SKILLS). Comando `/tarefa` operacional.
- [ ] (Opcional) Colar a nota do Gatilho de Skills no `.claude/skills/README.md` (também protegido pro Cowork) — trecho pronto no chat da sessão de 2026-06-25.
- [ ] Pronto — não tem secret, workflow nem GitHub App pra configurar.

**Rotina de cada vez que for trabalhar (manual):**
- [ ] Na pasta do projeto, rodar `/tarefa` no Claude Code (ou colar o prompt do guia).
- [ ] Revisar o diff; rodar `npm run check` (firewall + testes).
- [ ] Commitar e dar push você mesmo se estiver bom; se não, `git checkout .` descarta.
- [ ] Repriorizar a "Fila pronta" pra próxima vez.

**Rotina automática das 8:02 AM (Vancouver) — Cowork Scheduled (`economizei-rotina-matinal`, cron `0 8 * * *`):**
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
- [~] **[A4 🟠] Versionar `CREATE TABLE resumos_mensais_enviados`** — **COMMITADO (`a795f65`):** `supabase/migration_2026-06-30_A4_resumos_mensais_enviados.sql` (idempotente; se a tabela já existe à mão, é no-op — só confere colunas). **Falta só RODAR no SQL Editor.**
- [~] **[A9 🟡] `ALTER TABLE compras ADD COLUMN cnpj` + gravar no `salvarCompra`** — **COMMITADO (`a795f65`):** `supabase/migration_2026-06-30_A9_compras_cnpj.sql` + edição no `salvarCompra` (destructure + insert `cnpj`), tudo no `origin/main`. Prepara o comparativo (cod-0020). **Falta só RODAR o `ALTER` no SQL Editor — ANTES do próximo deploy do código** (senão o insert quebra). Cupons antigos ficam com `cnpj=NULL`; preenchem a partir do próximo.
- [ ] **[A10 🟢] Corrigir o comentário de `beta_fundador` no `schema.sql`** ("garante 3 meses grátis + preço travado") — contradiz a decisão de 2026-05-19 que revogou os benefícios de Beta. (`supabase/` = você.)
- [x] **[A7 🟡] Reconciliar memória × deploy — CONCLUÍDO (06-26):** working tree limpo e sincronizado com `origin/main` (F3 `/cortar`, encurtamento, testes e parser todos commitados em `b73b15b`/`e8de024`); `_writetest_root.tmp` removido; `CLAUDE.md` × `AGENDA.md` alinhados nesta sessão. ⚠️ Ressalva: a limpeza do GitHub Actions ficou **parcial** — `pages-ci.yml` saiu, mas `ci.yml` e `claude-nightly.yml` **ainda estão** em `.github/workflows/` (ver checklist "Limpeza do GitHub Actions" abaixo).
- [ ] **[A1 🔴 financeiro] Ligar o gate Pro** do comparativo (cod-0020) e do alerta inteligente (cod-0023) via `temFeaturesProAtivas` — toca `is_pro` (firewall), é seu. **Sem isso, o pago entrega só cupons ilimitados** e a recompensa de indicação fica vazia.
- [ ] **[A6 🟠] Testes do caminho do dinheiro** (`mercadopago.js`, conciliação de webhook, liga/desliga `is_pro`) — tocam tokens financeiros (firewall) → escrever/revisar é humano.

**Limpeza do GitHub Actions — ✅ CONCLUÍDA (commit `f384dab`, confirmado 2026-07-02):**
- [x] `ci.yml`, `claude-nightly.yml` e `pages-ci.yml` **removidos** do repo. Só resta `monthly-cron.yml` (deve ficar — é o resumo mensal). Verificado por `ls .github/workflows/`.
- [ ] Se tiver criado branch protection exigindo o check "CI" no GitHub, remover (senão trava PRs futuros). *(Não dá pra verificar daqui — é config no site do GitHub.)*
- [ ] (Opcional) Desinstalar o app do Claude no GitHub e apagar o secret `CLAUDE_CODE_OAUTH_TOKEN`.

---

## ⏳ Aguardando sua decisão (não virou tarefa da fila ainda)

- [x] **[2026-06-24] Encurtamento das mensagens automáticas — APROVADO E APLICADO** (commit `e8de024`). Concluído; reconciliado em 06-26.
- [x] **[2026-06-24] Open Questions do Agente de Perguntas — RESPONDIDAS** (Free básico 3 intenções · limite 30/mês com aviso no meio · responde a mais provável, pergunta de volta só off-topic · guarda a pergunta no log · gemini-2.5-flash · Opção A estruturada com narração LLM, depois B). Tarefas na fila: cod-0010..0017.
- [ ] **[2026-06-24] Pré-requisitos HUMANOS do Agente de Perguntas** (a máquina é barrada de propósito nestes):
  - [ ] **Migration** (`supabase/` = zona proibida): criar `usuarios.perguntas_mes_atual INT DEFAULT 0` + tabela `perguntas_log` (ver SQL no Desenho §7) + reset mensal acompanhando o de `compras_mes_atual`.
  - [ ] **Envs** (`.env*` = bloqueado): `LIMITE_PERGUNTAS_FREE=30`, `AGENTE_MODELO=gemini-2.5-flash`, `AGENTE_MODO=llm` — no Railway e no `.env.example`.
  - [ ] **Ordem de deploy:** rodar a migration ANTES de commitar/subir cod-0016 e cod-0017 (senão a cota quebra em produção).
  - [ ] **Pro depois:** o gate Free/Pro do Q&A (usa `is_pro`/`features_pro_ate`) é seu quando expandir — a máquina não pode tocar (firewall).
- [ ] **[2026-06-24] Construir webhook Hotmart → /admin/ativar-pro** — quando Hotmart confirmar pagamento, setar `is_pro=true` automaticamente. É código que toca pagamento, tem que ser o Gabriel fazendo e revisando.
- [ ] **[2026-06-24] Atualizar formatter.js com pricing anual + Hotmart** — `/planos` e `/assinar` ainda mostram só preços mensais/MP. Toca zona financeira, revisar com cuidado.
- [ ] **[2026-06-24] Commitar arquivos pendentes** — ver comando pronto no `Mapeamento_Geral_Pendencias_2026-06-24.md` Seção 1.
- [x] **[2026-06-23] Economia do plano anual como prova de marketing na landing — ESSENCIALMENTE FEITO** (commit `d3fe539`): a landing ganhou toggle anual/mensal nos 3 tiers, default anual, com selo "2 meses grátis". Reconciliado em 06-26. *(Se quiser reforçar com um comparativo mensal × anual mais explícito, isso vira uma tarefa `landing-ab` nova — me avise.)*
- [x] **[Auditoria 06-25 · A1] Comparativo: liberar pra todos ou só Pro? — DECIDIDO (2026-06-27): Pro completo + teaser grátis** (1+ comparativos de amostra no Free pra mostrar o valor). Refletido no cod-0020. O gate Pro em si segue como ação financeira sua.
- [x] **[Auditoria 06-25 · §4] Sequência — CONFIRMADA (2026-06-27):** fechar a promessa do pago (`/apagar` ✅ → comparativo cod-0020 → alerta Pro cod-0030..0035) **antes** de escalar anual/afiliados/ads e antes do Agente de Perguntas (cod-0013→0017 descem na fila). Ordem aceita pelo Gabriel. *(numeração corrigida 2026-07-02: a cadeia Pro vai até cod-0035, não 0036.)*
- [ ] **[2026-06-27] Alerta Inteligente Pro — pré-requisitos humanos** (desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`):
  - [ ] **Migration** (`supabase/` = zona proibida): criar tabela `acompanhamentos` + coluna `usuarios.categorias_superfluas text[]` (+ controle anti-spam do alerta de limite). SQL no Desenho §7. **Rodar antes de subir cod-0031/0033/0035.**
  - [ ] **Decisão de pricing Free×Pro** (Desenho §8): confirmar o recorte — proposta é alerta de 3 níveis + `/cortar` + pergunta avulsa "quanto gastei em X" **Free**; acompanhamentos persistentes + alerta de limite + supérfluo configurável **Pro**.
  - [ ] **Ligar o gate Pro** (`temFeaturesProAtivas`/`is_pro`) nas peças Pro — toca financeiro (firewall), é seu.
  - [ ] **Sequência:** soltar **cod-0026 → cod-0027** (classificação, o coração) **antes** do matching/acompanhamento — o Pilar B só vale se o `nome_canonico` estiver forte.
