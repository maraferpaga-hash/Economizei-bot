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

**Última curadoria:** 2026-06-27 · **Modo:** execução local (GitHub Actions descontinuado)
**🎯 Último checkpoint integral:** *(nenhum ainda)* · **✅ Commitado + pushed 2026-06-30:** cod-0026/0027/0030/0006/0011 + cod-0012 + memória + limpeza Actions, tudo no `origin/main`. → **passou o gatilho de volume (5+); rodar um checkpoint Nível 2.** Sistema: `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md`.
**🏛️ Pilares do negócio:** `Economizei app/Pilares_do_Negocio_2026-06-30.md` (Pilar 1 Máquina · Pilar 2 Código/Produto · Pilar 3 futuro Marketing & Anúncios; firewall = tecido conectivo).
**🗄️ Migrations (2026-06-30):** SQL escrito em `supabase/` — **A4** (`resumos_mensais_enviados`, versiona tabela feita à mão) e **A9** (`compras.cnpj` + ajuste no `salvarCompra`), + 2 **futuras** (`migration_FUTURA_agente_perguntas.sql`, `migration_FUTURA_alerta_pro_acompanhamentos.sql`). **Pendente humano:** (1) rodar A4+A9 no SQL Editor — **A9: a coluna ANTES do deploy do código**, senão `salvarCompra` quebra; (2) commitar os `.sql` + `supabase.js` com `git push --no-verify` (zona `supabase/` = firewall barra de propósito). As 2 futuras só rodam quando as features subirem.
**Foco novo (2026-06-27):** Alerta Inteligente Pro (supérfluo + acompanhamento personalizável) — cod-0026 (classificação lidera pelo tipo genérico) **em Em revisão**; cod-0027 (corpus) e cod-0030 (matching) na Fila pronta; cadeia Pro cod-0031..0035 no Backlog. Desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`.
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


> **❤️ Classificação + Alerta Inteligente Pro (desenho 2026-06-27).** Desenho completo: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. A classificação é o **coração do produto** (CLAUDE.md / CODE_GUIDE §0) e o alerta Pro depende dela. **cod-0026 + cod-0027 (classificação) e cod-0030 (matching puro) já estão em "🔧 Em revisão"** (aguardando o Gabriel rodar `npm run check` + commitar). A cadeia Pro completa (cod-0031..0035) está refinada no Backlog — sobe pra "Fila pronta" quando a **migration** (humano) e o **gate Pro** estiverem prontos.

> **🤖 Agente de Perguntas (MVP — Free, 3 intenções, Opção A com narração LLM).**
> Cadeia sequencial cod-0010 → cod-0017. Desenho completo e decisões: `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`. **Executar em ordem** (cada uma depende das anteriores). Pré-requisito HUMANO antes de subir cod-0016/0017 em produção: a migration (ver "Ações do Gabriel"). Se quiser o agente antes do F3/cod-0001, mova este bloco pra cima.

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

### [P1] Agente — 3/8: registro das 3 intenções + templates
- id: cod-0012
- tipo: feature-codigo
- skills usadas: economizei-tdd, economizei-financial-firewall (+ transversais default por PROJECT_INSTRUCTIONS §2.1: code-decisions, product-principles). *(copywriter/copy-review designadas no campo `skills:` não entraram — os templates só remontam números já formatados pelo `brl()`, sem copy nova de tom/voz a revisar; nenhuma mensagem nova ao estilo `formatter.js` foi escrita do zero.)*
- objetivo: registro declarativo das 3 intenções do MVP do Agente de Perguntas (Desenho §3) — gasto_total_mes, gasto_por_categoria, comparar_meses.
- entregue (Cowork, rotina matinal 2026-06-30):
  - `src/agent/intents.js` (novo) — 3 intenções `{id, descricao, exemplos, parametros, executar(phone,params,deps)→fato, template(fato)→string}` + `REGISTRO` (array das 3, pronto pra injetar no `guards.validarClassificacao` da cod-0011 e no classificador da cod-0013):
    - `gasto_total_mes` — soma `buscarGastosPorCategoria` (supabase.js, mesma fonte do `/gastos`).
    - `gasto_por_categoria` — mesma busca, filtra pela categoria pedida (vocabulário fechado = `CATEGORIAS_VALIDAS`, espelho do `gemini.js` pra não puxar `sharp`).
    - `comparar_meses` — reusa `buscarTotaisMensais` + `calcularEconomia` (insights.js, já testada). Honestidade: o template fala "média dos meses anteriores" (até 3), nunca afirma "mês passado" especificamente, porque é isso que `calcularEconomia` de fato calcula.
    - Todo número do fato vem cru **e** pré-formatado em `fmt.*` via `brl()` do `formatter.js` — fonte única de formatação (pré-requisito da Camada 5/firewall de fidelidade numérica da cod-0014, Desenho nota de implementação §5).
    - `executar(phone, params, deps)` aceita `deps` opcional pra injetar as funções de leitura (usado nos testes com dados sintéticos) e faz **lazy require** do `supabase.js` (só resolve `createClient` quando chamado de verdade sem `deps`) — assim importar o módulo nunca quebra em ambiente sem as envs do Supabase.
  - `src/formatter.js` — **1 linha fora do `arquivos-alvo` original:** adicionado `brl` ao `module.exports` (já existia a função, só não estava exportada). Necessário para cumprir o critério de aceite "números do fato formatados com o `brl()` do formatter.js (fonte única)" — sem isso, `intents.js` teria que duplicar a lógica de formatação monetária, o que o próprio Desenho Técnico (§5) avisa que quebra o firewall de fidelidade numérica da Opção 2 (template e allowlist precisam gerar a mesma string). Mudança puramente mecânica (1 export), sem tocar texto/copy.
  - `test/agent-intents.test.js` (novo) — **20 testes**: fato com/sem dados nas 3 intenções (inclui categoria pedida ausente no mês, mês sem nenhuma compra, só 1 mês de histórico), templates determinísticos (abaixo/acima/parecido com a média, formatação R$ com vírgula), sanidade de `CATEGORIAS_VALIDAS`/`rotuloCategoria`, e **integração com `guards.validarClassificacao`** (cod-0011) confirmando que o `REGISTRO` real valida certo (parâmetro desconhecido, enum inválido, intent desconhecida, opcional ausente aceito).
- verificação: `node scripts/check-firewall.mjs --working` ✓ · `node scripts/check-pages.mjs` ✓ (0 erros) · `node --test test/agent-intents.test.js` **20/20** ✓ — rodado em cópia limpa (`/tmp`, reconstruindo `formatter.js`/`insights.js`/`agent/periodo.js`/`agent/guards.js`/`agent/intents.js` a partir do conteúdo já confirmado correto via leitura direta do arquivo) porque o mount Linux do sandbox voltou a servir `src/formatter.js` **truncado no fim do arquivo** (mesmo problema ambiental já documentado em várias sessões anteriores — não é staleness de conteúdo, é corte de bytes perto do EOF; `node --check` no arquivo real do mount falha por `SyntaxError: Unexpected end of input`, mas o arquivo real — confirmado por leitura direta — termina corretamente). Por isso `npm run check` **não fecha neste sandbox** (também arrasta `test/apagar.test.js`, que já estava no repo e também requer `formatter.js`) — **não é regressão desta tarefa**. Na máquina do Gabriel (Windows, arquivo íntegro) deve fechar verde; gate recomendado: `node --check src/formatter.js` primeiro, pra confirmar.
- depende-de: cod-0010 (concluído, commit `b73b15b`).
- status: em-revisao
- data-revisao: 2026-06-30
- nota: Gabriel revisa o diff (`src/agent/intents.js` + `test/agent-intents.test.js`, novos; `src/formatter.js`, 1 linha — export de `brl`), roda `npm run check` na máquina dele e commita. Próxima da cadeia do Agente na "Fila pronta": cod-0013 (classificador Gemini → intenção, depende desta + cod-0011).

### [P1] Agente — 2/8: guardas de honestidade (puras) — o coração
- id: cod-0011
- tipo: feature-codigo
- skills usadas: economizei-tdd, economizei-financial-firewall (+ transversais default por PROJECT_INSTRUCTIONS §2.1: code-decisions, product-principles)
- objetivo: funções PURAS de guarda de honestidade do Agente de Perguntas (Desenho §5, "o coração") — sem I/O e sem chamar o Gemini.
- entregue (Cowork, rotina matinal 2026-06-29):
  - `src/agent/guards.js` (novo) — 3 funções puras + helpers privados (`_paraNumero`, `_chave`):
    - `validarClassificacao(saida, registro)` → `{ok, motivo?, intent?, params?}`. Camada 1 (vocabulário fechado): o registro de intenções é **injetado** (não acopla ao `intents.js`). Rejeita intent fora do registro (`intent_desconhecida`), parâmetro não declarado (`param_desconhecido`), enum fora do vocabulário (`param_invalido`), período que o LLM inventou — validado pelo `resolverPeriodo` do `periodo.js` (`param_invalido`), e obrigatório ausente (`param_obrigatorio_ausente`). `fora_de_escopo` é sinalizado distintamente (motivo próprio) pro orquestrador. Opcional ausente → ok (executor aplica default). **Não usa `confianca`** (decisão 2026-06-24: porta de topicalidade, não de confiança).
    - `extrairNumeros(texto)` → `number[]`. Pega todo token numérico/monetário (R$ 248,30 · 1.234,56 · 20% · milhar 1.234), tolerante a acento de frase/pontuação. Normaliza BR (vírgula decimal, ponto milhar) e o caso US (ponto decimal) por heurística.
    - `conferirFidelidadeNumerica(textoLLM, permitidos)` → `{ok, intrusos}` (Camada 5). `permitidos` aceita strings JÁ formatadas e/ou Numbers. Compara por chave canônica em centavos (`248,30 ≡ 248,3`, sem falso-positivo de zero à direita). Qualquer número fora da allowlist → `ok:false` + lista de `intrusos`. Filosofia de **falha segura**: em dúvida reprova → render cai no template (airbag).
  - `test/agent-guards.test.js` (novo) — **28 testes**: validarClassificacao (12: válida, opcional ausente, intent fora, fora_de_escopo, enum inválido, período inválido/válido, param desconhecido, obrigatório ausente, saída malformada/null, intent não-string, registro vazio); extrairNumeros (8: monetário, milhar+decimal, %, vários, milhar puro, ponto final, sem número, null); conferirFidelidadeNumerica (8: bate, distorcido REPROVA, inventado REPROVA, vários fiéis, zeros à direita, Numbers, único não-array, texto sem número).
- verificação: `node --check` ✓ · firewall `--working` ✓ · check-pages ✓ (0 erros) · `node --test test/agent-guards.test.js` **28/28** ✓.
- ⚠️ ressalva (ambiental, idêntica a cod-0026/0027/0030): `npm run check` completo acusa 2 falhas **pré-existentes e sem relação** — `test/gemini-canonico.test.js` e `test/classificacao-corpus.test.js` — porque `require('sharp')` (via `gemini.js`) dá **SIGBUS** neste sandbox. `guards.js`/o teste novo não tocam `sharp`/`gemini` (verificado por grep). Na máquina do Gabriel (Windows, sharp ok) fecha verde.
- depende-de: cod-0010 (periodo.js — já concluído, commit `b73b15b`).
- status: em-revisao
- data-revisao: 2026-06-29
- nota: Gabriel revisa o diff (`src/agent/guards.js` + `test/agent-guards.test.js`, ambos novos), roda `npm run check` na máquina dele e commita. Próxima da cadeia do Agente na "Fila pronta": cod-0012 (registro das 3 intenções + templates).

### [P1] Alerta Pro — engine de matching puro
- id: cod-0030
- tipo: feature-codigo
- skills usadas: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-financial-firewall (transversais default por PROJECT_INSTRUCTIONS §2.1)
- objetivo: funções PURAS em `insights.js` (Desenho §6) pro Pilar B do Alerta Pro — casar item↔alvo (categoria ou palavra-chave), somar gasto por alvo e somar gasto supérfluo. Nada casa → total 0 (nunca chuta número).
- entregue (Cowork, rotina matinal 2026-06-28):
  - `src/insights.js` — 3 funções puras + helpers (`_norm` sem acento, `_casaTermo`, `_valorItem`) + export:
    - `casarItemComAlvo(item, alvo)` — alvo `{tipo:'categoria'|'termo', valor}`. Categoria = igualdade (tolerante a acento/caixa, não casa vazio). Termo = PALAVRA INTEIRA (`\b…\b`) sobre `norm(nome_canonico) || norm(nome)`, sem acento, **≥3 chars, sem substring solta**. Cai pro `nome` quando o canônico falta.
    - `buscarGastoPorAlvo(itensDoMes, alvo)` → `{total, qtdCompras, itensCasados}`. Soma `preco_total` (fallback `preco×quantidade`); `qtdCompras` = compras distintas por `compra_id` (proxy = nº de itens quando não há id).
    - `buscarGastoSuperfluo(gastosPorCategoria, categoriasSuperfluas)` → `{totalSuperfluo, pctDoMes, porCategoria[]}`. `null`/não-array → baseline `['doces','bebidas']`; array (mesmo vazio) usado como veio; ordena desc por valor.
  - `test/insights-matching.test.js` (novo) — 17 testes: palavra inteira (casa "cerveja"/"skol"; NÃO casa "uva" em "luva" nem "cafe" em "descafeinado"); acento-insensível (cafe↔café, racao↔ração); guarda ≥3 chars; fallback pro `nome`; soma por alvo com `compra_id` distinto e nada-casa→0; fallback preco×qtd; supérfluo baseline/custom/vazio/sem-dados.
- verificação: `node --check` ✓ · firewall `--working` ✓ · `node --test` das funções puras **25/25** ✓ (17 matching + 8 insights base) · check-pages ✓ (0 erros).
- ⚠️ ressalva (ambiental): `npm run check` completo acusa 2 falhas **pré-existentes** — `test/gemini-canonico.test.js` e `test/classificacao-corpus.test.js` — porque `require('sharp')` (topo do `gemini.js`) dá **SIGBUS** neste sandbox (mesmo problema já registrado em cod-0026/0027). Sem relação com esta tarefa (`insights.js` não usa sharp). Na máquina do Gabriel (Windows, sharp ok) fecha verde.
- depende-de: cod-0027 (corpus) — já em "Em revisão" no working tree.
- status: em-revisao
- data-revisao: 2026-06-28
- nota: Gabriel revisa o diff (`src/insights.js` + `test/insights-matching.test.js`), roda `npm run check` na máquina dele e commita. Próximas da cadeia Pro (Backlog): cod-0031 (leitura de acompanhamentos — depende da migration humana) e cod-0032 (bloco de supérfluo no `/gastos`/resumo).

### [P0] Classificação — corpus de regressão
- id: cod-0027
- tipo: teste
- skills usadas: economizei-tdd, economizei-code-decisions (+ transversais default por PROJECT_INSTRUCTIONS §2.1)
- objetivo: criar `test/classificacao-corpus.test.js` — corpus de regressão da classificação (o coração do produto). Trava regressão sempre que mexer em prompt/extração do `nome_canonico`.
- entregue (Cowork, rotina matinal 2026-06-28):
  - `test/classificacao-corpus.test.js` (novo) — corpus de itens reais exercitando a função PURA `avaliarQualidadeCanonicoItem` (gemini.js), única peça determinística que protege o matching por palavra-chave do alerta Pro (cod-0030):
    - **CORPUS BOM (20 casos)** com `nome_canonico` liderando pelo tipo genérico → todos `ok`. Cobre as 7 famílias-alvo: cervejas, refrigerantes, chocolates, ração, café, limpeza e itens por peso (picanha/banana/queijo/tomate por kg). Inclui marca no MEIO (sprite/omo/ype/comfort) pra garantir que não acusa à toa.
    - **CORPUS RUIM (10 casos)** com `nome_canonico` começando pela marca → todos `comeca_por_marca` (o sinal que a cod-0026 introduziu). Garante que o guarda não "afrouxa pra nunca sinalizar".
    - + 2 testes de sanidade do próprio corpus (≥15 casos / 7 famílias; categorias declaradas válidas).
- verificação: firewall `--working` ✓ · check-pages ✓ (0 erros) · `node --test` **14/14** ✓ no conjunto corpus + canonico (rodado em cópia /tmp com `sharp` e o SDK do Gemini stubados — `sharp` dá SIGBUS ao carregar neste sandbox).
- ⚠️ ressalva 1 (escopo honesto): a GERAÇÃO do `nome_canonico`/`categoria` é feita pelo Gemini (LLM, não-determinístico) — não dá pra unit-testar sem modelo. O corpus trava a parte determinística e de maior risco: o guarda de qualidade que pega o canônico começando pela marca antes que ele quebre a busca do alerta Pro. A `categoria` entra no corpus como documentação do alvo (não asseverada contra o LLM).
- ⚠️ ressalva 2 (ambiental): `npm run check` completo não fecha no sandbox porque `require('sharp')` no topo do `gemini.js` dá SIGBUS aqui. Na máquina do Gabriel (Windows, `sharp` ok) fecha verde.
- status: em-revisao
- data-revisao: 2026-06-28
- nota: Gabriel revisa o diff (só `test/classificacao-corpus.test.js`, arquivo novo), roda `npm run check` na máquina dele e commita. Depende da cod-0026 (em revisão logo abaixo) já estar no working tree — está. Próxima da fila: cod-0030 (matching puro do alerta Pro).

### [P0] Classificação — `nome_canonico` lidera pelo tipo genérico
- id: cod-0026
- tipo: refino-codigo
- skills usadas: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-financial-firewall (transversais default por PROJECT_INSTRUCTIONS §2.1)
- objetivo: o `nome_canonico` sempre liderar pelo tipo/substantivo genérico do produto (marca depois), habilitando o matching por palavra-chave do alerta Pro (cod-0030 / Pilar B).
- entregue (Cowork, rotina matinal 2026-06-27):
  - `src/gemini.js` — PROMPT: novo bloco "Regra do nome_canonico (MUITO IMPORTANTE)" com exemplos certo/errado (cerveja/refri/chocolate/ração/café) + linha de exemplo do JSON atualizada pra liderar pelo tipo genérico.
  - `src/gemini.js` — heurística: novo status `comeca_por_marca` em `avaliarQualidadeCanonicoItem` (via `MARCAS_SEM_SUBSTANTIVO` + helper puro `comecaPorMarca`, com remoção de acento ASCII-safe). Sinaliza canônico que começa pela marca sozinha. Conservador: só dispara quando o 1º token é marca reconhecida (baixo falso-positivo); é só sinal de log, não bloqueia nada.
  - `test/gemini-canonico.test.js` — +3 testes: lidera-por-tipo → 'ok'; começa-por-marca → 'comeca_por_marca' (inclui acento "pilão"); marca no meio → 'ok'.
- verificação: firewall `--working` ✓ · `node --test` **60/60** ✓ (rodado em cópia /tmp com `sharp` stubado — `sharp` dá SIGBUS ao carregar neste sandbox; ver ressalva) · check-pages ✓ (0 erros).
- ⚠️ ressalva: `npm run check` completo não fecha no sandbox porque `require('sharp')` (topo do `gemini.js`) dá SIGBUS aqui — é ambiental, não do código. Na máquina do Gabriel (Windows, `sharp` ok) fecha verde.
- status: em-revisao
- data-revisao: 2026-06-27
- nota: Gabriel revisa o diff (só `src/gemini.js` + `test/gemini-canonico.test.js`), roda `npm run check` na máquina dele e commita. Próxima da fila: cod-0027 (corpus de regressão, depende desta).

### [P0] `/apagar` — exclusão de dados (LGPD)
- id: cod-0006
- tipo: feature-codigo
- skills: economizei-security-lgpd, economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall, economizei-code-decisions
- objetivo: implementar o handler de `/apagar` (direito de eliminação) — fecha o A2 (comando anunciado mas sem handler).
- entregue (Cowork, sessão 2026-06-27):
  - `src/apagar.js` (novo, puro): `interpretarApagar(texto)` → `{pedido, confirmar}`.
  - `src/supabase.js`: `apagarDadosUsuario(phone)` — DELETE em ordem de FK: `compras` (→`itens_compra` cascade), `indicacoes` (indicador/indicado), `lembretes_enviados`, `resumos_mensais_enviados`, `mensagens_processadas`, `usuarios`. **Não toca** eventos de pagamento (FK, zona financeira) nem `precos_mercado` (anônima).
  - `src/formatter.js`: `montarConfirmacaoApagar`, `montarApagarConcluido`, `montarApagarErro`.
  - `src/index.js`: handler **antes do gate de onboarding** (vale em qualquer etapa) + `mostrarApagar`. 2 passos: `/apagar` confirma, `/apagar confirmar` apaga.
  - `test/apagar.test.js`: 11 testes (parse + mensagens) — **verdes** (validados em cópia limpa; mount serviu `formatter.js` stale).
- verificação: `check:firewall --working` ✓ · 11/11 testes ✓ · **sem migration**.
- ⚠️ ressalva: usuário com eventos de pagamento — a remoção de `usuarios` é barrada pela FK (tratar pagante ativo = follow-up financeiro humano).
- status: em-revisao
- data-revisao: 2026-06-27
- nota: Gabriel revisa o diff, roda `npm run check` na máquina dele (Windows, com `sharp`/`formatter.js` íntegro) e commita.

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

> **Reconciliado em 2026-06-26:** working tree limpo e sincronizado com `origin/main`. Os itens abaixo já estavam commitados; a AGENDA é que estava stale (ainda listava em "Em revisão").

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
- [~] **[A4 🟠] Versionar `CREATE TABLE resumos_mensais_enviados`** — **SQL ESCRITO (2026-06-30):** `supabase/migration_2026-06-30_A4_resumos_mensais_enviados.sql` (idempotente; se a tabela já existe à mão, é no-op — só confere colunas). **Falta:** rodar no SQL Editor + commitar (`git push --no-verify`, zona `supabase/`).
- [~] **[A9 🟡] `ALTER TABLE compras ADD COLUMN cnpj` + gravar no `salvarCompra`** — **FEITO (2026-06-30):** `supabase/migration_2026-06-30_A9_compras_cnpj.sql` + edição no `salvarCompra` (destructure + insert `cnpj`). Prepara o comparativo (cod-0020). **Falta:** rodar o `ALTER` no SQL Editor **ANTES** do deploy do código (senão o insert quebra) + commitar. Cupons antigos ficam com `cnpj=NULL`; preenchem a partir do próximo.
- [ ] **[A10 🟢] Corrigir o comentário de `beta_fundador` no `schema.sql`** ("garante 3 meses grátis + preço travado") — contradiz a decisão de 2026-05-19 que revogou os benefícios de Beta. (`supabase/` = você.)
- [x] **[A7 🟡] Reconciliar memória × deploy — CONCLUÍDO (06-26):** working tree limpo e sincronizado com `origin/main` (F3 `/cortar`, encurtamento, testes e parser todos commitados em `b73b15b`/`e8de024`); `_writetest_root.tmp` removido; `CLAUDE.md` × `AGENDA.md` alinhados nesta sessão. ⚠️ Ressalva: a limpeza do GitHub Actions ficou **parcial** — `pages-ci.yml` saiu, mas `ci.yml` e `claude-nightly.yml` **ainda estão** em `.github/workflows/` (ver checklist "Limpeza do GitHub Actions" abaixo).
- [ ] **[A1 🔴 financeiro] Ligar o gate Pro** do comparativo (cod-0020) e do alerta inteligente (cod-0023) via `temFeaturesProAtivas` — toca `is_pro` (firewall), é seu. **Sem isso, o pago entrega só cupons ilimitados** e a recompensa de indicação fica vazia.
- [ ] **[A6 🟠] Testes do caminho do dinheiro** (`mercadopago.js`, conciliação de webhook, liga/desliga `is_pro`) — tocam tokens financeiros (firewall) → escrever/revisar é humano.

**Limpeza do GitHub Actions (parcial — ainda falta, confirmado em 06-26):**
- [ ] `git rm .github/workflows/ci.yml .github/workflows/claude-nightly.yml` — **ainda presentes** no repo. (`pages-ci.yml` já foi removido ✅.) `monthly-cron.yml` fica.
- [ ] Se tiver criado branch protection exigindo o check "CI", remover (senão trava PRs futuros).
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
- [x] **[Auditoria 06-25 · §4] Sequência — CONFIRMADA (2026-06-27):** fechar a promessa do pago (`/apagar` ✅ → comparativo cod-0020 → alerta Pro cod-0030..0036) **antes** de escalar anual/afiliados/ads e antes do Agente de Perguntas (cod-0011→0017 descem na fila). Ordem aceita pelo Gabriel.
- [ ] **[2026-06-27] Alerta Inteligente Pro — pré-requisitos humanos** (desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`):
  - [ ] **Migration** (`supabase/` = zona proibida): criar tabela `acompanhamentos` + coluna `usuarios.categorias_superfluas text[]` (+ controle anti-spam do alerta de limite). SQL no Desenho §7. **Rodar antes de subir cod-0031/0033/0035.**
  - [ ] **Decisão de pricing Free×Pro** (Desenho §8): confirmar o recorte — proposta é alerta de 3 níveis + `/cortar` + pergunta avulsa "quanto gastei em X" **Free**; acompanhamentos persistentes + alerta de limite + supérfluo configurável **Pro**.
  - [ ] **Ligar o gate Pro** (`temFeaturesProAtivas`/`is_pro`) nas peças Pro — toca financeiro (firewall), é seu.
  - [ ] **Sequência:** soltar **cod-0026 → cod-0027** (classificação, o coração) **antes** do matching/acompanhamento — o Pilar B só vale se o `nome_canonico` estiver forte.
