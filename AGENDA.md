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

**Última curadoria:** 2026-07-16 (AGENDA enxugada ~68 KB→~37 KB — histórico integral no snapshot `Economizei app/arquivo-historico/AGENDA_arquivo_2026-07-15.md`; regra anti-inchaço no Protocolo). · **Modo:** execução local (GitHub Actions descontinuado).
**🎯 Estado (2026-07-16):** `origin/main` sincronizado até `9c098c5`. **Working tree pendente de commit (você), 2 pacotes distintos:** (a) **enxugamento de memória** (CLAUDE/AGENDA/PROJECT + `arquivo-historico/`); (b) **impl de cod-0061** pela rotina matinal 07-16 (`src/zapi·index·formatter` + `test/webhook-documento` + `RELATORIO_MATINAL.md`) — está em "Em revisão", passa pelo `/entregar`. Última entrega commitada: cod-0041/0042/0051/0052 (`c355d74`..`a40110f`, 07-15). Último checkpoint integral: **2026-07-08 (Nível 2, 🟡→🟢)** — `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md`.
**🗄️ Migrations:** todas as pendências de deploy **rodadas e confirmadas** (A4/A9 + agente + alerta pro, 07-08/07-09); 2 futuras commitadas em `supabase/` (`a795f65`). Detalhe no snapshot arquivado.
**🎯 Foco (2026-07-15):** **Frente 1 (ingestão multi-documento)** — cod-0061 lidera a fila, cod-0062 depois; reabastecido Alerta Pro Free (cod-0034/0032/0033). Frente 2 (repensar canal/Plaid) espera sessão própria. ⚠️ **Auditoria Integral 07-10 — 🔴 abertos no painel do Gabriel:** §1.4 patch firewall · §4.3 `/assinar` ainda gera checkout MP.
**📌 Pointers:** Pilares `Pilares_do_Negocio_2026-06-30.md` · Mapeamento `Mapeamento_Geral_Pendencias_2026-06-24.md` · Auditorias `Auditoria_Codigo_Direcao_2026-06-25.md` + `Auditoria_Integral_2026-07-10.md`.

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

**🗄️ Regra do `/entregar` — checagem de migrations ANTES de qualquer commit/push (2026-07-13, decisão do Gabriel):** o comando `/entregar` (`.claude/commands/entregar.md`) tem uma etapa **bloqueante** de migrations: antes de pedir a aprovação humana, ele cruza o diff com os `supabase/migration_*.sql` pendentes e com as `CHECAGENS_CRITICAS` do `src/schemaGuard.js`, e **avisa explicitamente** qual migration precisa rodar antes do deploy (o push dispara deploy automático no Railway — código que lê coluna/tabela inexistente = incidente A9). Se houver migration pendente que o código do diff USA em runtime, a entrega só prossegue depois que o Gabriel confirmar que rodou a migration OU aceitar conscientemente o alerta da guarda de schema. Racional: o custo de checar é 1 minuto; o custo de não checar foi cupom perdido em silêncio (A9, 07-08→07-09).

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

### ♻️ Regra anti-inchaço da AGENDA (2026-07-16 — espelho da regra do CLAUDE.md de 07-15)

> A AGENDA é lida no boot de TODA sessão. **Não é log corrido:** o histórico narrativo mora no snapshot `Economizei app/arquivo-historico/AGENDA_arquivo_AAAA-MM-DD.md` e nos docs de sessão em `Economizei app/`. Tetos (governados pela skill `economizei-memory-system`):
>
> 1. **"Concluído" ≤ 10 tarefas.** Ao passar, as mais antigas migram pro snapshot mantendo o hash de commit na linha-pointer. Gatilho: fim-de-cadeia, >10 concluídas, ou checkpoint integral.
> 2. **Tarefa concluída sai da AGENDA assim que o commit está no `origin/main`** — não espera N sessões. Reconciliou → "Concluído" enxuto → snapshot quando estourar o teto.
> 3. **Descrição de tarefa no Backlog ≤ 3 linhas + pointer** pro doc de desenho. O mecanismo completo mora no doc, não aqui.
> 4. **Status do topo ("Última curadoria"/"Estado"/"Foco") ≤ ~5 linhas** (data + estado + pointers). Não acumula sessão a sessão.
> 5. **Fila pronta: máx. 1 nota de "estado atual"** acima dos blocos de tarefa; histórico de reabastecimento vai pro snapshot/doc de sessão.
> 6. **Intocáveis (nunca comprimir/mover):** o molde parseável das tarefas `pronta` (o `/tarefa` depende dele), a ordem = prioridade, a "🚫 Zona proibida", o protocolo do `/entregar`, e os painéis "Ações do Gabriel" / "Aguardando decisão" (compactam itens resolvidos, nunca removem os abertos).

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

### Catálogo das 18 skills — pointer (evita duplicar o README)
> **O que cada skill faz vive no `C:\Economizei\.claude\skills\README.md`** (fonte única). No planejamento, o Opus consulta o README pra apresentar as candidatas. Inventário: **16 `economizei-*`** — 6 núcleo transversais **sempre ligadas** (product-principles, memory-system, automation-triage, token-economy, financial-firewall, dual-format) + code-decisions, copywriter, debugging, growth-analyst, content-engine, experimentation, security-lgpd, tdd, multi-agent-ops, strategic-review — **+ 2 legadas** (`copy-review`, `roadmap-deps`).

---

## 🌙 Fila pronta
*(a máquina executa de cima pra baixo, uma por execução — rotina automática às 8:02 AM Vancouver, ou manual via `/tarefa`)*


> **📍 Estado da fila (2026-07-16).** Sequência viva §4 (06-27): fechar a promessa do pago antes de escalar; a **classificação é o coração** (CODE_GUIDE §0). **cod-0061 (plumbing de documento) foi implementado pela rotina matinal de 07-16 e está em "Em revisão" — aguarda seu commit (via `/entregar`).** Com isso, a Fila pronta abaixo é: **cod-0062** (ler PIX — `depende-de: cod-0061`, então commite o cod-0061 antes) → **cod-0034** (intent NL "gasto por termo") → **cod-0032 / cod-0033** (Alerta Pro Free — `depende-de: cod-0031` ✅ `86dbb64`) → **cod-0065** (recibo Canadá — desceu; espera 2–3 recibos reais + a sessão de canal/Plaid). **A ordem dos blocos abaixo = a prioridade** (o `/tarefa` pega o 1º `status: pronta`). Histórico de reabastecimento e desenhos completos: snapshot `arquivo-historico/AGENDA_arquivo_2026-07-15.md` + `Desenho_Ingestao_Multi_Documento_2026-07-15.md` · `Desenho_Alerta_Inteligente_Pro_2026-06-27.md` · `Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`.

### [P2] Frente 1 — ler comprovante de PIX (foto/PDF)
- id: cod-0062
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o Gemini classifica o documento (`tipo_documento`); se PIX, extrai valor/data/contraparte e grava como `compras` `tipo='pix'` (contraparte→`loja`, itens=[]), confirmando com o número primeiro.
- arquivos-alvo: `src/gemini.js` (campo `tipo_documento` + ramo PIX no prompt e no `validarSchema`), `src/supabase.js` (`salvarCompra` aceita `tipo='pix'` + **trocar guard de `precos_mercado` pra `=== 'mercado'`**), `src/formatter.js` (`montarConfirmacaoPix`), `test/` (+ mini-corpus PIX)
- criterios-de-aceite:
  - comprovante PIX (imagem/PDF) → `tipo_documento='pix'`, valor/data/contraparte extraídos; `salvarCompra` grava `tipo='pix'` com itens vazios
  - PIX NÃO entra em `calcularMedia` nem em `precos_mercado` (o guard virou `=== 'mercado'`)
  - **corpus de cupom continua verde** (coração intacto); mini-corpus PIX verde; confirmação com R$ no topo, sem gíria
  - node --test verde; firewall verde (token "pix" acusa de propósito — commit consciente)
- fora-de-escopo: insight/query dedicado de PIX; fatura; gate Pro; i18n; persistir moeda
- depende-de: cod-0061; **pré-req humano: 2–3 comprovantes PIX reais do Gabriel pro mini-corpus** (sem eles, código pronto mas validação incompleta — como o cod-0065)
- status: pronta

### [P2] Agente — intent `gasto_por_termo` ("quanto gastei em cerveja?")
- id: cod-0034
- tipo: feature-codigo
- skills: economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall, economizei-code-decisions
- objetivo: intent NL Free no Agente de Perguntas que soma o gasto por **categoria OU palavra-chave livre** ("cerveja", "chocolate", "ração") reusando o matching puro `casarItemComAlvo`/`buscarGastoPorAlvo` (cod-0030, já commitado) + o firewall de fidelidade numérica do agente (o número nasce no executor, nunca no LLM). Entra no registro de intents como as da Leva 2.
- arquivos-alvo: `src/agent/intents.js`, `test/`
- criterios-de-aceite:
  - mesmos padrões da Leva 2 (fato rico via `brl()`, `temDados` honesto, exemplos no registro, sem gíria); estado-vazio honesto quando o termo não casa nenhum item (nunca número chutado)
  - reusa `buscarGastoPorAlvo` — NÃO recalcula soma no LLM; Camada 4/5 respeitadas
  - node --test verde; firewall verde (0 tokens financeiros — é intent Free, na cota do Agente; decisão de pricing 07-08)
- fora-de-escopo: comandos `/acompanhar` (é cod-0033); gate Pro; nada financeiro
- depende-de: cod-0030 (`2a83bcd` ✅), cod-0017 (agente no ar e validado 07-09 ✅) — **desbloqueado**
- status: pronta

### [P2] Alerta Pro — Pilar A: bloco de gasto supérfluo no `/gastos` e no resumo mensal
- id: cod-0032
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review, economizei-product-principles, economizei-financial-firewall
- objetivo: mostrar quanto do mês foi em itens supérfluos (via `buscarGastoSuperfluo`, cod-0030 ✅) como um bloco no `/gastos` e no resumo mensal. Número primeiro, sem moralizar ("Doces e bebidas: R$52,40 — 11% do mês"), copy WhatsApp.
- arquivos-alvo: `src/formatter.js` (bloco na `montarMensagemGastos`/`montarResumoMensal`), `src/index.js` (passar o dado), `test/`
- criterios-de-aceite:
  - baseline doces+bebidas (do cod-0031, `buscarCategoriasSuperfluas`); estado-vazio honesto ("sem supérfluo no mês, bom sinal" ≠ "sem gasto no mês")
  - número primeiro, sem julgar; sem gíria proibida; node --test verde; firewall verde
- fora-de-escopo: **gate Pro** = padrão Gate Pro (máquina constrói SEM gate; Gabriel insere ~3 linhas na revisão — `Gate_Pro_Desdobramento_2026-07-10.md`); configuração de categorias supérfluas é cod-0033; nada financeiro
- depende-de: cod-0030 (`2a83bcd` ✅), cod-0031 (em revisão — commitar antes de subir esta)
- status: pronta

### [P3] Alerta Pro — comandos `/acompanhar` `/limite` `/acompanhamentos` `/parar` `/superfluo`
- id: cod-0033
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review, economizei-product-principles, economizei-financial-firewall
- objetivo: comandos pra configurar acompanhamentos (categoria/palavra-chave) e categorias supérfluas, lendo/gravando via as funções do cod-0031. Mensagens curtas, sem gíria. `/acompanhamentos` e `/parar` ficam SEM gate (quem caiu do Pro precisa ver/parar o que configurou — decisão 07-10).
- arquivos-alvo: `src/index.js`, `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `/acompanhar cerveja` cria acompanhamento; `/parar` desativa (soft-delete cod-0031); `/acompanhamentos` lista; `/superfluo doces` ajusta baseline; confirmações curtas e honestas
  - node --test verde; firewall verde (o gate Pro dos que precisam é ~3 linhas humanas na revisão)
- fora-de-escopo: alerta proativo de limite (é cod-0035); intent NL (é cod-0034); gate Pro humano
- depende-de: cod-0031 (em revisão — **commitar antes**), cod-0033 usa a I/O dele
- status: pronta

### [P2] Modo recibo Canadá (Vancouver) — entender e armazenar qualquer recibo
- nota (2026-07-15): DESCEU na prioridade — a decisão de Frente 2 virou "repensar o canal" (Plaid/app), então o Canadá-via-WhatsApp não está confirmado; a leitura de recibo é canal-agnóstica e segue útil como groundwork, mas espera os seus 2–3 recibos reais + a sessão de canal.
- id: cod-0065
- tipo: feature-codigo
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o bot lê recibo canadense de QUALQUER comércio (mercado, restaurante, varejo, farmácia, etc.), detecta a moeda/idioma ($/en → CAD; R$/pt → BRL), extrai loja/data/total/itens (categoria + `nome_canonico`) e confirma no WhatsApp com o símbolo de moeda certo — **reusando todo o pipeline atual** (`lerRecibo` → `validarSchema` → `salvarCompra` → confirmação). SEM quebrar o comportamento pt-BR/BRL.
- arquivos-alvo: `src/gemini.js` (PROMPT + `coerceNumber` + detecção de moeda), `src/formatter.js` (helper `fmtMoeda(valor, moeda)` currency-aware só na confirmação), `test/` (testes novos + mini-corpus canadense)
- criterios-de-aceite:
  - `coerceNumber` lida com `"1,299.90"` (vírgula de milhar + ponto decimal) **sem** quebrar `"99,90"` pt-BR
  - o prompt detecta a moeda pelo símbolo/idioma e retorna campo `moeda`; **CNPJ opcional** (null quando ausente — o esquema já aceita)
  - recibo canadense de qualquer tipo → `sucesso:true` com loja/total/itens; item names em inglês canonizados **pelo tipo genérico** ("milk whole 2%", "chicken breast")
  - confirmação mostra o símbolo certo ($ vs R$), número no topo, sem gíria
  - **o coração não regride:** corpus de regressão de classificação pt-BR **verde** (CODE_GUIDE §0) + **mini-corpus canadense** (2–3 recibos reais que o Gabriel fornecer)
  - node --test verde; **firewall financeiro verde** (zero token de `is_pro`/plano/preço — "moeda" é dado transacional, não pricing)
- fora-de-escopo: i18n completo das mensagens (é cod-0063); **NÃO gravar `moeda` em `compras`** (sem a migration, o INSERT quebra — lição do A9; persistência é follow-on humano); leitura de fatura/PIX (Frente 1); gate Pro; provedor de WhatsApp p/ número canadense; consentimento CASL (humano/legal); **NÃO** tocar `/planos`/`/assinar`/pagamento
- status: pronta

---

## 🔧 Em revisão
*(a máquina move pra cá ao abrir um PR — esperando o Gabriel revisar/commitar)*

### [P2] Frente 1 — receber DOCUMENTO (foto/PDF) no webhook (plumbing)
- id: cod-0061
- tipo: feature-codigo
- skills-usadas: economizei-code-decisions, economizei-tdd, economizei-security-lgpd, economizei-financial-firewall, economizei-copywriter (mensagem honesta de MIME)
- objetivo: detectar mensagem de documento no payload Z-API, baixar com o mesmo padrão de retry/validação da imagem, e rotear por MIME pro mesmo pipeline de recibo. SÓ a plumbing — a leitura por tipo de comprovante é cod-0062.
- o-que-mudou (rotina matinal 2026-07-16):
  - `src/zapi.js`: `baixarDocumento(mediaUrl)` — espelha `baixarImagem` (2 tentativas, validação de tamanho, timeout), logs próprios (`zapi_documento_*`); exportada.
  - `src/index.js`: `validarPayloadWebhook` reconhece `body.document` → `tipo: 'documento'` (URL defensiva: `documentUrl`|`url`|`fileUrl`; `mimeType` opcional); `mimeAceitavel(mime)` puro (só `image/*` e `application/pdf`); dispatch `'documento'` no webhook; `processarImagem` virou wrapper fino + núcleo compartilhado `processarReciboRecebido(phone, baixar)` (extração mecânica, fluxo de imagem inalterado); `processarDocumento(phone, url, mime)` faz o gate de MIME e roteia pelo mesmo núcleo. Exports test-only: +`mimeAceitavel`.
  - `src/formatter.js`: `montarMensagemDocumentoNaoSuportado()` — mensagem honesta (só foto/PDF), sem gíria, sem token financeiro; exportada.
  - `test/webhook-documento.test.js`: 11 testes (validarPayloadWebhook documento — válido, campos alternativos, sem mime, URL inválida, precedência texto/imagem; `mimeAceitavel`; mensagem honesta).
- decisão de escopo (registrar na revisão): "documento" hoje é foto/PDF de recibo enviado como arquivo → roteado pelo MESMO fluxo do cupom (fecha o gap do `montarMensagemEnviarComoArquivo`, que instrui a reenviar como arquivo mas até então não tinha handler). A classificação cupom × comprovante e a persistência de novos tipos ficam pra cod-0062. Nada de gravar tipo novo em `compras` aqui.
- validação: `npm run check` → firewall **verde** (0 token financeiro; "pix" removido dos comentários de propósito); `check-pages` **OK** (0 erro); testes **366/0** em cópia limpa `/tmp` com `sharp` stubado. ⚠️ no mount do sandbox o `node --test` direto dá SIGBUS ambiental do `sharp` + o mount serviu `zapi.js` truncado/`index.js` com padding NUL (regra 11) — **gate final na máquina do Gabriel (Windows) antes do commit**.
- pendências humanas: (1) confirmar o **payload real de documento da Z-API** em produção — o parser é defensivo (`documentUrl`/`url`/`fileUrl` + `mimeType`/`mime`), mas o campo exato precisa ser verificado; (2) revisar a decisão de escopo acima antes de commitar.
- status: em-revisao (2026-07-16)

> **✅ RECONCILIADO em 2026-07-13 (sessão de entrega — Cowork):** TODAS as tarefas que estavam aqui foram commitadas e pushadas em 6 commits (`origin/main` sincronizado, working tree limpo): **cod-0021 + cod-0024** (`7082535`), **cod-0022** (`473ea18`), **cod-0031** (`86dbb64`), **cod-0040** (`0dc9159`), **cod-0050** (`0b81181`) e docs/memória (`9182b91`). As históricas (cod-0013, cod-0014..0017, cod-0020) já estavam em `d4eaf51`/`3b2f375` desde 07-08. Detalhes de cada tarefa preservados em "✅ Concluído" abaixo. Seção esvaziada (curadoria).

> **✅ RECONCILIADO em 2026-07-16 (comando `/entregar`):** 4 tarefas commitadas e pushadas em 4 commits (`origin/main` sincronizado, working tree limpo, 355/355 testes verdes, firewall verde): **cod-0041+0042** (`c355d74`), **cod-0051** (`38689b9`), **cod-0052** (`a40110f`) e docs/painel (`73f8cce`). Detalhes preservados em "✅ Concluído" abaixo. Seção esvaziada.

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

> **Entrega de 2026-07-13:** 6 tarefas da Máquina Local commitadas e pushadas de uma vez (firewall `--working` OK, 0 tokens financeiros; 260/263 testes verdes no sandbox — 3 SIGBUS ambientais do `sharp` que passam no Windows).

- **cod-0021 · Copy obsoleta `nao_supermercado` corrigida** (commit `7082535`, 2026-07-13) — mensagem de erro reescrita no `formatter.js` (bot lê qualquer estabelecimento → "Outros (não-mercado)") + `inferirCategoria` no `gemini.js` parou de mascarar o motivo real do erro por tipo de loja (exportada pra teste). `test/erro-copy.test.js` (6 testes). *(skills: code-decisions, copywriter, copy-review, tdd, financial-firewall)*
- **cod-0024 · `inativo_d10` sem contador stale** (commit `7082535`, 2026-07-13) — `montarLembreteInativoD10()` sem parâmetro e sem número (o `compras_mes_atual` pode refletir o mês anterior pra inativo, reset preguiçoso); call site no `reengagement.js` ajustado. `test/reengagement-d10.test.js` (4 testes). *(skills: code-decisions, tdd, copywriter)*
- **cod-0022 · Testes do `formatter.js` não-financeiro** (commit `473ea18`, 2026-07-13) — `test/formatter.test.js` (28 testes): gastos, inflação, economia, cortar, alerta 3 níveis, comparativo — estados-vazios honestos incluídos. *(skills: tdd, code-decisions)*
- **cod-0031 · Alerta Pro — camada de persistência de acompanhamentos** (commit `86dbb64`, 2026-07-13) — 5 funções + baseline no `supabase.js` (`buscarAcompanhamentos`, `salvarAcompanhamento` upsert, `desativarAcompanhamento` soft-delete, `set/buscarCategoriasSuperfluas` com baseline `['doces','bebidas']`), degradação segura, `cliente` injetável. `test/acompanhamentos-io.test.js` (17 testes). **Inerte em produção até a cod-0041/0032+ ligarem.** *(skills: code-decisions, tdd, financial-firewall, security-lgpd)*
- **cod-0040 · Agente — Leva 2a: 4 intents com inteligência pronta** (commit `0dc9159`, 2026-07-13) — `inflacao_item`, `raio_x_categorias`, `economia_acumulada`, `onde_cortar` no registro do Agente, reusando F1/F2/F3/F4 do `insights.js`; fato rico via `brl()`, `temDados` honesto, Camada 4/5 respeitadas; `classifier.js` intocado (aprende pelo registro). `test/agent-intents-leva2.test.js` (14 testes) + invariante do MVP atualizado (3→7 intents). *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0050 · Guarda de schema no boot** (commit `0b81181`, 2026-07-13) — `src/schemaGuard.js` (12 checagens críticas via probe de leitura vazia; NUNCA bloqueia o boot; log `schema_guard_faltando` + aviso opcional via `ADMIN_PHONE`) + wiring fire-and-forget no `app.listen`. Rede de segurança do incidente A9. `test/schema-guard.test.js` (13 testes). ⚠️ Vai acusar `acompanhamentos`/`usuarios.categorias_superfluas` até a migration do Alerta Pro rodar — é o desenho. *(skills: code-decisions, tdd, financial-firewall, debugging)*

> **Entrega de 2026-07-16:** 4 tarefas commitadas e pushadas via `/entregar` (firewall verde, 355/355 testes verdes, origin/main sincronizado).

- **cod-0041 + cod-0042 · Agente — Leva 2b** (commit `c355d74`, 2026-07-16) — `comparativo_mercados` + `gasto_superfluo` como intents (reusam `compararPrecosMercado`/`buscarGastoSuperfluo`); `duvida_sobre_bot` com lista viva derivada do REGISTRO; `consomeCota:false` + guarda no passo [6] do orquestrador; `test/agent-intents-leva2b.test.js` (16 testes) + `test/agent-duvida-bot.test.js`; invariante REGISTRO 9→10. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0051 · Testes da extração Gemini** (commit `38689b9`, 2026-07-16) — `parseRespostaGemini` extraída de `lerRecibo` (pura, testável); exports test-only em `gemini.js`; `test/gemini-extracao.test.js` (31 testes: `reconciliarItens`, `validarSchema`, `parseRespostaGemini`, `_scoreReconciliacao`). Fecha zero-teste no coração da extração. *(skills: tdd, code-decisions)*
- **cod-0052 · Testes dedup + validação de payload webhook** (commit `a40110f`, 2026-07-16) — `validarPayloadWebhook` extraída pura; `app.listen` atrás de `require.main === module`; exports test-only em `index.js`; `test/webhook-dedup.test.js` (19 testes: dedup com deps injetadas, payload malformado, messageId/phone/imageUrl). *(skills: tdd, code-decisions, financial-firewall)*

> **Concluído histórico (até 2026-07-08) — arquivado (curadoria 2026-07-16).** As 14 tarefas anteriores às entregas de 07-13/07-16 já estão em `origin/main` e ficam preservadas **com detalhe integral** no snapshot `Economizei app/arquivo-historico/AGENDA_arquivo_2026-07-15.md`: Agente de Perguntas (cod-0010..0017), comparativo `/comparar` (cod-0020), `/apagar` LGPD (cod-0006), classificação `nome_canonico` + corpus (cod-0026/0027), matching puro (cod-0030), migrations A4/A9, e a leva F3/testes (cod-0001..0004). Commits: `b73b15b` · `e8de024` · `4a3c62e` · `e4cc493` · `ddde18c` · `2a83bcd` · `743f2b1` · `8a479c4` · `a795f65` · `d4eaf51`.

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

**💬 Assistente Conversacional — cadeia futura (2026-07-09, todas VALIDADAS pelo Gabriel; entram com o tempo, gated pela validação da etapa anterior):**
*(doc-mãe: `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`. Regra do Gabriel: aplicar em ordem, cada etapa só sobe pra "Fila pronta" depois que a anterior estiver validada em produção — o `perguntas_log` é o juiz.)*

*(descrições completas de mecanismo/skills no doc-mãe; aqui só id + nome + gate)*
- **cod-0043** · Naturalidade 1 — contexto de follow-up (memória curta `{intent,params}`, TTL ~10min). **Gate: Leva 2 no ar + log com perguntas de sequência.**
- **cod-0044** · Naturalidade 2 — `sugestoes[]` por intent (≤1 sugestão no fim). **Gate: junto/após cod-0043.**
- **cod-0045** · Naturalidade 3 — narração LLM menos robótica (fidelidade intocada). refino. **Gate: `fidelidade_ok` estável.**
- **cod-0046** · ÁUDIO — voice note → transcrição Gemini → mesmo pipeline (security-lgpd: processa e descarta). **Gate: Agente validado com texto em produção.**
- **cod-0047** · Análises novas + filtros compostos no `insights.js`. **Gate: log da Leva 2 dizendo o que pedem + A9 rodada.**
- **cod-0048** · Gráfico sob demanda (`mostrar_grafico` reusa `charts.js`). **Gate: Leva 2 no ar.**
- **cod-0049** · Insights proativos (gatilhos determinísticos + cooldown). **⚠️ NASCE UNIFICADO com o Alerta Pro (cod-0031..0035).** **Gate: Alerta Pro construído + decisão Free×Pro (humano).**
- **cod-0018** · Chat aberto / function-calling — ÚLTIMO da escada. **Gate: `fidelidade_ok` alto + perguntas fora do cardápio no log.**

**🔭 Longo Prazo (2026-07-09 — Empresa BC ADIADA pra OUTUBRO/2026; doc-mãe: `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`):**
*(sementes pro tempo até a abertura da empresa — janela de planejamento agora é de até 2 meses. Regra do Gabriel: NENHUMA sobe pra "Fila pronta" antes da **sessão de desdobramento** (discussão + insights, item em "Aguardando sua decisão"). Estas linhas existem pra ideia não se perder.)*

- **Frente 1 (cod-0060/0061/0062)** — ✅ saíram da semente: desenho cod-0060 FEITO (07-15), cod-0061 implementado (em revisão), cod-0062 na Fila pronta. Ver "Fila pronta" + `Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`.
- **cod-0063 · Frente 2 — Fundação i18n** — localidade (idioma/moeda) sem mudar o pt-BR. ⚠️ **Gabriel escolheu REPENSAR O CANAL (Plaid/app), não o nicho WhatsApp** — reframe pesado (com Plaid o produto vira "conexão de conta", muda gesto/posicionamento/defensabilidade). **Merece sessão própria antes de qualquer código de Frente 2.** Não foi pro refill; segue semente.
- **cod-0064 (Frente 2 — recibo canadense)** — ✅ virou o MVP **cod-0065** (na Fila pronta); o resto (i18n, persistir moeda, provedor WhatsApp CA) é follow-on / cod-0063 / humano.

**🔍 Achados da Auditoria de Código (2026-06-25) — ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`:**
*(capturados aqui pra priorizar depois. Severidade: 🔴 crítico · 🟠 alto · 🟡 médio · 🟢 baixo. Itens de SQL/git/financeiro foram pro painel "Ações do Gabriel"; decisões de produto foram pra "Aguardando sua decisão".)*

- **cod-0020 · Comparativo entre mercados [A1]** — ✅ LEITURA feita e commitada (`d4eaf51`); gate decidido (Pro completo + teaser Free). Gate Pro em si = humano (firewall). Detalhe no "Concluído"/snapshot.
- **cod-0021 / cod-0022 / cod-0023** — ✅ cod-0021 (copy `nao_supermercado`) e cod-0022 (testes formatter) entregues 07-13; cod-0023 (alerta Pro) DESENHADO → virou cod-0026/0027/0030 + cadeia cod-0031..0035.

**❤️ Alerta Inteligente Pro — cadeia restante (desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`):**
- ✅ **cod-0031** (I/O acompanhamentos) entregue `86dbb64`; **cod-0032 / cod-0033 / cod-0034** promovidas pra "Fila pronta" (07-15) — blocos lá em cima.
- **cod-0035 · Alerta proativo de limite** (per-compra, idempotente no mês). tipo: feature-codigo. depende-de: cod-0031 ✅, cod-0033.
- **cod-0025 · 🔴 Onboarding tranca comandos de pagamento [A3]** — steps 0–1 tratam todo texto como onboarding → `/planos`/`/assinar`/`/pix` não respondem até 1 cupom (bloqueia conversão paga). ⚠️ mexe no roteamento de pagamento (`index.js`) → **provável trip do firewall; revisão humana, não soltar sozinha.** tipo: bugfix.
- ⚠️ **Humano (firewall):** migration de `acompanhamentos` + `usuarios.categorias_superfluas` (✅ rodada 07-08) · Free×Pro (✅ decidido 07-08) · **ligar o gate Pro** (desdobrado, você aplica — `Gate_Pro_Desdobramento_2026-07-10.md`).

**Páginas (foco secundário por enquanto):**
- pag-0001: ajustar `landing/vercel.json` pra páginas novas (`/guias/...`) serem alcançáveis (hoje o catch-all joga tudo pro index). Pré-requisito de qualquer página nova de SEO.
- pag-0002: guia SEO "Como economizar no supermercado".
- pag-0003: guia SEO local "Economizar em Fernandópolis e região".
- pag-0004: variação A/B da headline do hero (`landing/index-b.html`).
- Página "Economizei vs. planilha de Excel" (o concorrente real, segundo a pesquisa).

---

## 🙋 Ações do Gabriel (só humano resolve — a máquina não consegue)

> Esta seção é o seu painel. Guia: `Economizei app/Automacao_Maquina_Noturna.md`.

**🆕 Pendente AGORA — revisar/commitar (2 pacotes distintos no working tree):**
- [ ] **cod-0061 (plumbing de documento no webhook) — em "Em revisão".** A rotina matinal 07-16 implementou (`src/zapi·index·formatter` + `test/webhook-documento.test.js`); `npm run check` reportado verde em cópia limpa. Rode `npm run check` na sua máquina → `/entregar`. Pendência de escopo: **confirmar o payload real de documento da Z-API**. Relatório: `RELATORIO_MATINAL.md`.
- [ ] **Commitar o enxugamento de memória** (CLAUDE.md + AGENDA.md + PROJECT_INSTRUCTIONS.md + `arquivo-historico/` + docs de sessão + skill `economizei-memory-system`) — é docs, sem firewall. **Commit à parte do cod-0061** (código vs. memória).

**✅ Estabilização (2026-07-09) — CONCLUÍDA:** A9/A4/migration do agente rodadas + 4 envs no Railway + smoke test end-to-end passou. Detalhe: `Economizei app/Roteiro_Smoke_Test_2026-07-09.md` / snapshot.

**🔍 Auditoria Integral (2026-07-10) — ações suas (doc: `Economizei app/Auditoria_Integral_2026-07-10.md`):**
- [ ] **[🔴 §1.4] Aplicar o patch do firewall** — 8 tokens novos (`temFeaturesProAtivas`, `COMPARATIVO_MAX_PRO`, `ehPro`, `marcarProAtivo`, `concederFeaturesPro`, `hotmart`, `ADMIN_SECRET`, roteamento `/planos`) + `--no-renames` nos 2 git diff (bypass por rename testado e confirmado) + path `src/hotmart.js`. Snippet pronto no doc. O arquivo é protegido de propósito — só você edita. Rodar `--selftest` depois.
- [ ] **[🔴 §3.3] Rodar a query de verificação de schema** no SQL Editor (5min) — confirma as migrations antigas nunca verificadas E se a RPC `incrementar_compras_mes` existe em produção (se não existir, todo cupom usa fallback racy em silêncio).
- [ ] **[🔴 §4.2 decisão] Copy da indicação promete "alerta inteligente" que não existe** — e a recompensa hoje não entrega nada (comparativo sem gate = Free vê o mesmo). Decidir: encurtar promessa + aplicar Gate Pro, ou segurar divulgação do `/convidar`.
- [ ] **[🔴 §4.3 financeiro] Fluxo `/assinar` ainda gera checkout Mercado Pago** — MP abandonado juridicamente em 06-24; se alguém assinar hoje, entra dinheiro por via irregular. Mínimo sugerido: `/assinar` → instruções PIX até Hotmart/Wise (out/2026).
- [ ] **[🟡 §2.3] Logar o fallback do incremento** em `salvarCompra` (1 linha; pode ir no mesmo commit consciente do patch do firewall).
- [ ] **[🟡 §8.3 opcional] RPC `incrementar_perguntas_mes`** — SQL pronto no doc; depois a troca no código é tarefa de máquina.

**🔍 Auditorias futuras (dependem de dados que só você acessa — material de preparação pronto no doc §7):**
- [ ] **aud-01 · Classificação com cupons reais** (§7.1 — a mais valiosa; destrava Alerta Pro com confiança). Você traz: 15–30 fotos de cupons variados + resultado das queries de `monitoring_canonicos.sql`.
- [ ] **aud-02 · Custo Gemini por chamada** (§7.2). Você traz: billing 30d do Google + as 2 queries de volume do doc.
- [ ] **aud-03 · LGPD nos logs do Railway** (§7.3). Você traz: export de 1 dia de logs + política de retenção do plano Railway. (Parcial já feito: mascaramento de phone OK na amostra; 2 logs de conteúdo bruto anotados.)
- [ ] **aud-04 · Custo total de infra vs orçado** (§7.4). Você traz: tier/uso de Railway, Supabase (storage/linhas), Z-API, Vercel. Atenção: Supabase free = 500MB com `precos_mercado` crescendo por design.

**🔓 Pré-requisitos jurídicos/financeiros — desbloqueiam Meta Ads, Hotmart e Wise:**
*(estas ações devem ser feitas ANTES de qualquer outra coisa de pagamento ou ads)*

- [ ] **[BLOQUEADOR #1] Abrir empresa em BC** — sem isso, não dá pra vincular Meta Business Manager, Hotmart nem Wise Business. Passo a passo completo em `Economizei app/Abertura_Empresa_BC_2026-06-24.md`. Custo: ~CAD 380–600 (abertura) + ~CAD 650–2.000/ano (manutenção). Prazo: ~2 semanas do zero até operacional. ⏸️ **ADIADO (2026-07-09): só será possível a partir de OUTUBRO/2026** — os bloqueadores #2..#5 herdam o adiamento; até lá o foco é construção (`Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`).
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

**🧾➕ Frente 1 — ingestão de PIX (cod-0061/0062) — o que só você resolve (desenho: `Economizei app/Desenho_Ingestao_Multi_Documento_2026-07-15.md`):**
- [ ] **Verificar CHECK em `compras.tipo`** — query de 1 min no SQL Editor. Se for `TEXT` livre, `'pix'` já funciona (zero migration). Se houver `CHECK (tipo IN ('mercado','outros'))`, precisa `ALTER` (zona `supabase/` = você; escrevo o `.sql` se pedir).
- [ ] **Fornecer 2–3 comprovantes de PIX reais** (print e/ou PDF) pro mini-corpus da cod-0062 — sem eles a extração de PIX não tem como ser validada.
- [ ] **Confirmar o payload de documento da Z-API** — mande um PDF pra você mesmo e veja o campo/URL (o desenho assume `body.document`/`documentUrl`; validar no payload real).

**🇨🇦 Modo recibo Canadá (cod-0065) — o que só você/legal resolve (a máquina entrega a leitura, não isto):**
*(insights: `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md`)*
- [ ] **Fornecer 2–3 recibos reais de Vancouver** (mercado + outro comércio) pro mini-corpus de regressão da cod-0065 — sem eles, a classificação canadense não tem como ser validada.
- [ ] **[LEGAL — CASL] Consentimento anti-spam** antes de QUALQUER mensagem proativa a usuário no Canadá (lembretes de reengajamento, alerta de limite): onboarding com consentimento explícito + opt-out em cada lembrete. Multa até CAD 10M/violação. A confirmação de cupom (iniciada pelo usuário) é transacional e provavelmente ok; o "volta aqui" não é.
- [ ] **[LEGAL — privacidade] BC PIPA + PIPEDA** — dado de recibo cruzando fronteira (Supabase/Gemini). Nossa postura de processar-em-memória-e-descartar já ajuda; formalizar consentimento/finalidade/retenção quando houver usuário real na BC.
- [ ] **Provedor de WhatsApp p/ número canadense** — a Z-API é focada no Brasil; um número CA provavelmente exige Meta WhatsApp Cloud API (ou Twilio) + template aprovado p/ mensagem fora da janela 24h. (Pode testar primeiro com o número BR atual e você mesmo como usuário.)
- [ ] **(Opcional) Migration `compras.moeda TEXT DEFAULT 'BRL'`** — só se quiser **persistir** a moeda (a cod-0065 já mostra a moeda certa na confirmação sem gravar). Padrão A9: rodar o `ALTER` **antes** de qualquer código que grave `moeda`. `supabase/` = zona proibida da máquina; escrevo o `.sql` se você pedir.

---

**Setup (uma vez) — ✅ pronto:** `/tarefa` operacional (`.claude/commands/tarefa.md` com Gatilho de Skills, 06-26); Claude Code logado; sem secret/workflow/GitHub App. (Opcional: colar a nota do Gatilho de Skills no `.claude/skills/README.md`.)

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

**🔍 Achados auditoria 06-25 — só humano (ref: `Economizei app/Auditoria_Codigo_Direcao_2026-06-25.md`):**
- ✅/parciais: [x] A9 `compras.cnpj` rodada 07-09 · [x] A7 reconciliação memória×deploy 06-26 · [~] A4 commitada `a795f65` (falta rodar no SQL Editor) · [~] A1 gate Pro DESDOBRADO (`Gate_Pro_Desdobramento_2026-07-10.md`, falta você aplicar).
- [ ] **[A10 🟢] Corrigir comentário `beta_fundador` no `schema.sql`** ("3 meses grátis + preço travado" contradiz a revogação de 05-19). `supabase/` = você.
- [ ] **[A6 🟠] Testes do caminho do dinheiro** (`mercadopago.js`, webhook, liga/desliga `is_pro`) — tokens financeiros (firewall) = humano.

**Limpeza GitHub Actions — ✅ CONCLUÍDA (`f384dab`, 07-02):** só resta `monthly-cron.yml`. Opcionais restantes: [ ] remover branch-protection "CI" se existir (senão trava PRs); [ ] desinstalar app Claude no GitHub + secret `CLAUDE_CODE_OAUTH_TOKEN`.

---

## ⏳ Aguardando sua decisão (não virou tarefa da fila ainda)

*(Já resolvidos [x] — encurtamento, open questions + pré-reqs do Agente (migration/envs rodadas 07-09), comparativo Pro+teaser, sequência §4, pricing Free×Pro, migration do alerta pro, classificação, prova de anual na landing — preservados no snapshot `arquivo-historico/AGENDA_arquivo_2026-07-15.md`.)*

**Decisões / pendências humanas ainda ABERTAS:**
- [ ] **[Longo Prazo] Sessão de desdobramento das Frentes 1 e 2** — canal fora do Brasil (Plaid/app), sensibilidade da fatura, ordem jul→out. `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`. **Nada do Longo Prazo sobe pra fila antes dela** (a Frente 1/PIX já começou por pedido explícito via cod-0060..0062).
- [ ] **[financeiro — ADIADO out/2026] Webhook Hotmart → `/admin/ativar-pro`** + **atualizar `formatter.js` com pricing anual/Hotmart** (`/planos` e `/assinar` ainda só mensal/MP) — zona financeira, você faz e revisa.
- [ ] **[Alerta Pro — decisão fina]** bloco de supérfluo com baseline aparece pra todos ou só Pro? (sugestão do desenho: baseline pra todos, `/superfluo` gated). Resto dos pré-reqs ✅; gate Pro desdobrado, você aplica.
