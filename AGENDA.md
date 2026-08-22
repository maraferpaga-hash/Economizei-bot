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
**🎯 Estado (2026-08-22, `/entregar` modo TREE):** `origin/main` = HEAD = `933e855`. **cod-0074 entregue** (`933e855`, gate Pro nos comandos do Alerta Pro — mesmo padrão da cod-0073) + **regime ESTOQUE adotado** (`e6bc992`: `scripts/estoque.mjs` + docs de adoção — ferramenta que a rotina matinal já vinha produzindo levas para, agora versionada). 577/577 testes verdes, `npm run check` verde na máquina real antes de cada commit e no pre-push. Estoque passa de 3/4 pra **2/4** (levas 0002 `cod-0062b` e 0003 `cod-0065b` seguem esperando, nesta ordem). Working tree limpo pros arquivos do plano (exceto `.claude/settings.local.json`, artefato da própria sessão de entrega). **Pendências humanas:** Passo 4 da adoção ESTOQUE (trocar `.claude/commands/tarefa.md`/`entregar.md` — só o Gabriel escreve lá); decidir cod-0075 (devolvida pela rotina de 08-21 — premissa de vazamento não se sustenta). **Segue aberto no banco:** S3 (RPC), S5 (views de métricas), migration PIX, DROP MP.

**🎯 Estado anterior (2026-08-20, `/entregar` modo TREE):** `origin/main` = HEAD = `886cd1a`. **cod-0073 entregue** (`ba1c508`, gate Pro no `/comparar` — Free segue com teaser + upsell honesto, Pro vê até `COMPARATIVO_MAX_PRO` sem upsell; fecha o achado B10) + docs da sessão 08-18 reconciliados (`886cd1a`: RLS fechado/regra 14/veredito do teste de commit no sandbox/Plano B estoque). 563/563 testes verdes, `npm run check` verde na máquina real antes de cada commit e no pre-push. **Segue aberto no banco:** S3 (RPC), S5 (views de métricas), migration PIX, DROP MP.

**🔐 Estado anterior (2026-08-18, sessão de fechamento):** **S4 FECHADO — o RLS está ligado** (os 2 scripts rodados). Encerra a exposição dos dados via anon key e derruba o bloqueio das cod-0069/0070.

**🎯 Estado anterior (2026-08-15, `/entregar` modo TREE):** `origin/main` = HEAD = `e10701f`. **cod-0062a entregue** (`378e2be`) + docs da sessão de revisão da máquina de 08-07 reconciliados (`e10701f`), inclusive a correção de verdade do `.claude/commands/tarefa.md` — o patch de 08-07 tinha ficado com markdown quebrado e sem `GIT_OPTIONAL_LOCKS=0` no `git branch`/`git log`; achado nesta entrega e corrigido antes de commitar (substituição total pelo conteúdo de `tarefa_CORRIGIDO_2026-08-07.md`, agora apagado por ter sido consumido). Working tree limpo. Último checkpoint integral: **2026-08-01 (Nível 2, 🟡 AMARELO)** — doc `Economizei app/Checkpoint_N2_2026-08-01.md`.
**🗄️ Migrations:** pendências antigas rodadas (A4/A9 + agente + alerta pro); **pós-deploy do MP: DROP das colunas/tabela MP no Supabase liberado** (ordem código→deploy→banco cumprida até o deploy).
**🚨 Foco (2026-08-05, sessão de desentupimento — CONCLUÍDA):** esteira ficou ~6 dias parada; **destravada** — cod-0043 entregue (`9c094aa`), `origin/main` = `aa6469c`, tree limpo. **Máquina 3.0 (opção B1) adotada:** a máquina passa a **commitar em branches `maquina/*`** (nunca `main`, nunca `push`), com 3 defesas — pilha linear (LEI 1), teto de 3 branches (LEI 2), main não anda por baixo (LEI 3) — + o painel "📚 Pilha da máquina" pra o estoque não crescer escondido. Rotina das 8:02 **religada**; teto por run de volta a 3 P / 1 M / 1 lote (≤500 linhas). **Reengajamento desligado por decisão** (só o resumo de fim de mês, que já funciona) → cod-0068. **Fila:** cod-0068/0067/0025 no topo; 0044/0048/0049 no fim. **⚠️ Pendências humanas quentes:** ~~setar `SUPABASE_SERVICE_ROLE_KEY` no Railway~~ → ✅ **FEITO 2026-08-07** (confirmado por print). Falta **verificar que está em uso** e então **ligar o RLS (S4)** — com o complemento novo, porque o script original cobre só 5 das 15 relações. ~~Copiar os 2 arquivos de comando novos pra `.claude/commands/`~~ → ✅ feito (sessão Cowork 05/08 noite, junto com a limpeza do `.git/` e a reescrita da rotina agendada pra regra híbrida TREE-no-sandbox). Plano completo: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md`.

**🔓 Também em 2026-08-05 (2ª parte da sessão — desdobramento):** o material humano chegou (**3 comprovantes de PIX + 6 recibos de Vancouver**) e virou **corpus versionado** em `test/corpus/` — **cod-0062 e cod-0065 destravadas** (não esperam mais nada seu além de rodar com você presente). O **canal foi decidido**: app = **2º canal** com as mesmas funções e o mesmo banco, WhatsApp segue carro-chefe → nasceram **cod-0071** (núcleo canal-agnóstico, `pronta`) e **cod-0069/0070** (API + PWA, `bloqueada-humano` pelo S2/RLS). Pendência de `compras.tipo` **fechada por leitura** (não tem CHECK → `'pix'` grava sem migration). 5 decisões novas em "Aguardando sua decisão". Doc: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md`.

**🎯 Foco anterior (2026-07-27, sessão de repriorização):** fila reabastecida com **cod-0035** (alerta de limite — desbloqueada por cod-0031✅+0033✅) e **cod-0066** (limpeza MP órfãs — autorizada pelo Gabriel, zona advisory), pra rotina matinal voltar a produzir; **cod-0062/cod-0065 seguem aguardando material humano** (comprovantes/recibos reais). Decisões da sessão: supérfluo = baseline pra todos (`/superfluo` config gated Pro); §4.2 resolve-se ENTREGANDO cod-0035 (promessa vira verdade). §4.3 (`/assinar`/MP) ✅ FECHADO em `4f49ae7`. Doc: `Economizei app/Sessao_Repriorizacao_Fila_2026-07-27.md`.
**📌 Pointers:** Pilares `Pilares_do_Negocio_2026-06-30.md` · Mapeamento `Mapeamento_Geral_Pendencias_2026-06-24.md` · Auditorias `Auditoria_Codigo_Direcao_2026-06-25.md` + `Auditoria_Integral_2026-07-10.md`.

---

## 🩺 Revisão da máquina — 2026-08-07 (diagnóstico; decisões de processo ficam pra sessão própria)

**1. 🔴 O `index.lock` órfão tinha causa-raiz — e foi corrigida.** Não era "coisa do commit": `git status` e `git diff --stat` (comandos de **leitura**) atualizam o índice e **pegam o lock**, e o mount do sandbox cria dentro de `.git/` mas não apaga. Por isso runs que não commitaram nada mesmo assim travaram o repo (05/08 e 06/08). Reproduzido e corrigido nesta sessão: **`GIT_OPTIONAL_LOCKS=0` elimina o lock na origem** (testado: com a variável, zero lock). A rotina agendada `economizei-rotina-matinal` **já foi atualizada**; o `/tarefa` local precisa do patch à mão (`.claude/commands/` é protegido) → `Economizei app/PATCH_comandos_lock_2026-08-07.md`.

**2. 🟡 A Máquina 3.0 foi construída e nunca rodou — decisão REABERTA porque o fix do lock muda o cálculo.** Adotada em 05/08 (3 leis, painel de pilha, 2 comandos reescritos). Desde então **nenhuma branch `maquina/*` existiu**: pilha 0/3, e as duas entregas (05/08 e 06/08) foram em modo **TREE**.

> **O que mudou em 08/07 (decisão do Gabriel: "sim — e o fix do lock muda o cálculo"):** a variante TREE foi criada com uma justificativa explícita — *"o sandbox NÃO consegue commitar: todo `git add`/`commit`/`checkout -b` deixa `index.lock` órfão e trava o repositório"*. **Essa premissa era imprecisa.** O lock não vinha da escrita: vinha de `git status`/`git diff`, comandos de **leitura**. Com `GIT_OPTIONAL_LOCKS=0`, a leitura deixou de criar lock — então a pergunta "o sandbox consegue commitar?" **nunca foi realmente testada** com a leitura sob controle.
>
> **O que falta pra decidir (teste barato, ~5 min numa run):** deixar a rotina agendada tentar `git checkout -b maquina/teste` + um commit vazio + `git branch -d`, com toda leitura prefixada. Duas saídas: (a) **funciona** → a variante TREE perde a razão de existir, a 3.0 vira o modo único e a duplicidade de comandos acaba; (b) **falha no `.git/` de novo** (o `add`/`commit` cria e apaga vários arquivos lá dentro, não só o índice — é plausível que ainda quebre) → o TREE está justificado por evidência de verdade, e aí a documentação para de dizer que a 3.0 é o regime "normal".
>
> **Nos dois casos o resultado é o mesmo ganho:** um modo só, decidido por teste em vez de suposição. Enquanto não roda, vale o que está no ar: **rotina agendada = TREE · runs locais = 3.0**.

**3. 🟠 A fila autônoma está seca por composição, não por falta de itens.** Das tarefas `pronta`, a rotina das 8h só consegue pegar **cod-0071** — todo o resto é porte G (coração, exige o Gabriel), gated pelo bloco Supabase ou `bloqueada-humano`. Endereçado nesta sessão fatiando as porte-G (ver as `-a` na Fila pronta).

**4. 🔬 Achados do Checkpoint N2 de 01/08 que ninguém leu** (doc: `Economizei app/Checkpoint_N2_2026-08-01.md` — a AGENDA seguia dizendo "último checkpoint: 07-08"). O mais material é o **B10 🔴**: *o gate Pro nunca foi ligado* — `/comparar` usa `COMPARATIVO_AMOSTRAS_FREE` igual pra todos e os comandos do Alerta Pro declaram "sem gate Pro", então **na prática R$9,90/mês compra só "cupons ilimitados"**, e a recompensa de indicação ("7 dias das funções Pro") não destranca nada porque não há nada trancado. Zona financeira = humana. Também abertos: **B9 🟡** (o "preditivo" do `/planos` continua não existindo — é a cod-0049) e **B7 🟡** (`.env.example` sem 4 envs vivas, com 4 mortas do MP).

> **Lição de método que os quatro achados compartilham:** o sistema *produz* diagnóstico bem (checkpoint rodou, sentinela roda, relatório matinal é detalhado) e *consome* mal — o checkpoint de 01/08 ficou 6 dias sem leitura, o `index.lock` foi reportado 2× como "limitação conhecida" sem ninguém procurar a causa, e a cod-0066 passou 11 dias com duas verdades. O gargalo não é a geração de sinal.

---

## ⚠️ Zona sensível — FINANCEIRO (modo ADVISORY desde 2026-07-26)

> **MUDANÇA DE REGRA (decisão do Gabriel, 2026-07-26):** durante a construção dos
> dois trilhos de pagamento (Stripe direto + Hotmart/afiliados), o firewall
> **deixou de BLOQUEAR e passou a só AVISAR**. `scripts/check-firewall.mjs` ainda
> LISTA o que toca dinheiro (checklist de atenção), mas **sempre retorna exit 0** —
> não reprova mais o `npm run check`. A máquina (inclusive a rotina das 8h) **PODE**
> escrever código financeiro. O gate real agora é a **revisão humana no `/entregar`**:
> o Gabriel commita TUDO (regra 3 da seção 11 do CLAUDE.md — essa NÃO mudou).

A lista abaixo continua útil como **atenção extra na revisão** (não como muro):

- `src/mercadopago.js` — ⛔ **REMOVIDO 2026-07-26** (MP aposentado; falta o `git rm` do Gabriel — ver "Ações do Gabriel").
- Linhas sobre **pagamento/cobrança**: `is_pro`, `/pix`, checkout, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`, Stripe, Hotmart, afiliado.
- `supabase/` (migrations/SQL — schema e tabelas de dinheiro), `.env*` (segredos), `.github/`, `package.json`/`package-lock.json`, `scripts/check-firewall.mjs`, `Dockerfile`/`Procfile`.

> Deploy, migrations no Supabase e commit/push **continuam sendo do Gabriel** — a máquina escreve, ele revisa e sobe.

---

## 📐 Protocolo (como a automação local usa esta agenda)

Quando o Gabriel roda o Claude Code local (comando `/tarefa`), ele:

1. Lê este arquivo (e consulta `CLAUDE.md`/`CODE_GUIDE.md` só se a tarefa exigir).
2. **Inspeciona o estoque (as 2 Regras do regime ESTOQUE):** working tree sujo com `.js`/`.mjs` **em `src/` ou `test/`** → para (é resto de sessão manual do Gabriel; `.md`, `PAINEL.html` e a pasta `estoque/` não contam — no regime novo isto quase nunca dispara, porque a máquina não escreve em `src/`) · **4 levas em `estoque/`, ou ~1200 linhas de trabalho novo → "estoque cheio", não produz** (REGRA 2) · `.git/index.lock` presente → algum comando rodou sem `GIT_OPTIONAL_LOCKS=0`; se o `rm` falhar, só o Gabriel resolve (`del .git\index.lock` no Windows).
3. Vai em **`## 🌙 Fila pronta`** e seleciona trabalho de cima pra baixo (ordem = prioridade) respeitando o **TETO POR RUN: até 3 tarefas porte P, OU 1 porte M, OU 1 lote (`lote:` igual) — sempre ≤ ~500 linhas de diff somadas.** Porte G / ambígua / coração / pré-req humano: não pega (relata o plano e segue adiante na fila). **Também não pega:** tarefa cujo `depende-de` aponte pra algo que está só no estoque (leva ≠ entregue), nem tarefa cujos critérios dependam de como uma leva ainda não entregue foi implementada.
4. **Fallback:** se nada da Fila pronta for elegível, pega da **`## ⚓ Fila de lastro`** (só testes/revisão/segurança — mesmo teto). Se nem o lastro tiver item, não faz nada.
5. **Carrega as skills de cada tarefa** (campo `skills:`). Se faltar, deriva do **mapa tipo→skills** da seção "🧠 Gatilho de Skills" e aplica durante todo o trabalho.
6. **Cria a pasta da leva ANTES de codar, e copia a base (REGRA 1 — cadeia):** `estoque/NNNN_AAAA-MM-DD_cod-XXXX/arquivos/`, onde `NNNN` é o maior número já existente + 1. Antes de editar um arquivo, a base é a **cópia da leva de maior número que já o contém**; se nenhuma contém, é o arquivo em `src/`/`test/`. Copia a base pra dentro da leva e **edita a cópia** — nunca reescreve o arquivo inteiro do zero (Regra 11 do CLAUDE.md: o mount serve arquivo truncado). Cada leva nasce da anterior, nunca do repositório ignorando o estoque — é isto que impede o problema cod-0043 × cod-0044 (levas vizinhas nos mesmos arquivos se desfazendo).
7. Implementa **com teste** (TDD), faz **auto-revisão adversarial do diff**, valida numa cópia limpa em `/tmp` com **todas** as levas do estoque aplicadas em ordem, escreve o **`LEVA.md`** (manifesto: tarefa, base, migration, env, financeiro, integridade, como testar, pendências), move cada bloco pra **`## 🔧 Em revisão`** (status `em-revisao` + data + **número da leva**), **registra a leva na `## 📦 Estoque`**, e só então **mostra o resultado** — com **mapa tarefa→arquivos** e **declarando quais skills usou**.
8. **O Gabriel aplica e pusha** via `/entregar`, que usa o `scripts/estoque.mjs` pra copiar as levas de volta pro repositório, na ordem. A automação **nunca usa um comando de escrita do git** — nem `add`, nem `commit`, nem `checkout`. Comandos de leitura, sempre com `GIT_OPTIONAL_LOCKS=0`. Motivo medido em 2026-08-18: o disco montado não permite apagar, então a segunda escrita de git trava o repositório pra sempre (doc: `Economizei app/Veredito_Teste_Commit_Sandbox_2026-08-18.md`).

**Rede de segurança (o Gabriel roda antes de commitar, na máquina dele):** `npm run check` = `check-firewall.mjs --working` (financeiro) + `node --test` (testes) + `check-pages.mjs` (páginas).

**🗄️ Regra do `/entregar` — checagem de migrations ANTES de qualquer commit/push (2026-07-13, decisão do Gabriel):** o comando `/entregar` (`.claude/commands/entregar.md`) tem uma etapa **bloqueante** de migrations: antes de pedir a aprovação humana, ele cruza o diff com os `supabase/migration_*.sql` pendentes e com as `CHECAGENS_CRITICAS` do `src/schemaGuard.js`, e **avisa explicitamente** qual migration precisa rodar antes do deploy (o push dispara deploy automático no Railway — código que lê coluna/tabela inexistente = incidente A9). Se houver migration pendente que o código do diff USA em runtime, a entrega só prossegue depois que o Gabriel confirmar que rodou a migration OU aceitar conscientemente o alerta da guarda de schema. Racional: o custo de checar é 1 minuto; o custo de não checar foi cupom perdido em silêncio (A9, 07-08→07-09).

**Como priorizar (você + Opus):** a ordem dentro de "Fila pronta" É a prioridade. Subiu = roda antes. Os rótulos `[P0]`..`[P3]` são leitura humana; o que manda é a posição. Use `status: pausada` pra tirar da fila sem apagar.

**Formato de uma tarefa** (molde pra copiar):

```
### [P1] Título curto da tarefa
- id: cod-000X
- tipo: feature-codigo | refino-codigo | bugfix | teste | conteudo-seo | landing-ab | institucional
- porte: P | M | G — P = 1 função+teste · M = multi-arquivo bem especificado · G = só com o Gabriel presente (nunca run autônoma)
- lote: nome-do-lote (opcional — tarefas com o mesmo `lote:` rodam juntas na mesma run e viram 1 commit combinado no /entregar)
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

**📦 Critérios de agrupamento (lotes — Máquina 2.0, 2026-07-27):** AGRUPAR quando as tarefas dividem arquivos-alvo (mata o fatiamento por hunk no `/entregar`), são da mesma cadeia/desenho, usam as mesmas skills, ou são batcháveis por natureza (testes, limpeza). SEPARAR sempre que: toca o coração (classificação — só com Gabriel presente), é financeiro (commit consciente isolado), domínios sem arquivo em comum, tem pré-req humano, ou o diff combinado passa de ~500 linhas. Regra de bolso: **agrupe por revisão, não por token** — o lote ideal é o que o Gabriel revisa em ~30min. Análise completa: `Economizei app/Analise_Maquina_Pesada_e_Lotes_2026-07-27.md`.

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

### Catálogo das 19 skills — pointer (evita duplicar o README)
> **O que cada skill faz vive no `C:\Economizei\.claude\skills\README.md`** (fonte única). No planejamento, o Opus consulta o README pra apresentar as candidatas. Inventário: **16 `economizei-*`** — 6 núcleo transversais **sempre ligadas** (product-principles, memory-system, automation-triage, token-economy, financial-firewall, dual-format) + code-decisions, copywriter, debugging, growth-analyst, content-engine, experimentation, security-lgpd, tdd, multi-agent-ops, strategic-review — **+ 2 legadas** (`copy-review`, `roadmap-deps`).

---

## 🌙 Fila pronta
*(a máquina executa de cima pra baixo respeitando o teto por run — até 3 tarefas porte P, OU 1 porte M, OU 1 lote, ≤ ~500 linhas somadas. Rotina automática às 8:02 AM Vancouver **ATIVA**, ou manual via `/tarefa`. **Desde 2026-08-18 a máquina NÃO USA GIT: ela entrega cada leva numa pasta em `estoque/`**, sem tocar em `src/`/`test/`. O que a trava não é mais o working tree sujo, é o **teto de estoque: 4 levas ou ~1200 linhas** — ver "## 📦 Estoque".)*


> **📍 Estado da fila (2026-08-07 — sessão de revisão da máquina, 2 rodadas).** A fila autônoma saiu de **1** tarefa elegível para **9**, sem inventar trabalho:
>
> - **Por fatiamento das porte-G** (o que não toca `src/gemini.js` virou tarefa própria): **cod-0062a** (blindagem de agregação, M — nasceu de um achado real, não do desenho) · **cod-0062b** (guard `precos_mercado` + copy PIX, P) · **cod-0065a** (módulo puro de datas, M) · **cod-0065b** (`fmtMoeda`, P) · **cod-0072a** (parser de parcela, P). As porte-G originais continuam na fila, menores, e seguem exigindo você presente. O `coerceNumber` ficou **de propósito** com você — coerção numérica afeta todo cupom brasileiro.
> - **Por decisão de aplicar o gate Pro** (achado B10 do Checkpoint de 01/08): **cod-0073** (`/comparar`, P1) · **cod-0074** (comandos do Alerta Pro) · **cod-0075** (intent do Agente). Destravadas porque a premissa "a máquina não pode tocar nisso" venceu em 26/07, quando o firewall virou advisory.
> - **cod-0066** ✅ **liberada** (contradição arbitrada por você em 08-07).
>
> **A ordem do arquivo É a prioridade** (protocolo): **cod-0073** → cod-0074 → cod-0075 → as P (0062b/0065b/0072a, agrupáveis) → cod-0065a → cod-0066 → cod-0071. **cod-0062a saiu daqui — entregue em `378e2be` (`/entregar` 2026-08-15, modo TREE), ver "✅ Concluído".** **cod-0049** segue gated pelo bloco Supabase. *(O `index.lock` de 06/08 foi limpo e a causa-raiz corrigida — ver "🩺 Revisão da máquina" no topo.)* Anterior (2026-08-05, `/entregar` modo TREE): cod-0068/0067/0025 entregues (`18a0b45`/`689c9ae`/`548468f`, `origin/main`; detalhe em "✅ Concluído"). **cod-0062/cod-0065** foram **destravadas** na 2ª parte desta sessão (corpus real chegou) mas continuam fora da "Fila pronta" — são porte G, rodam com o Gabriel presente. **cod-0071** (núcleo canal-agnóstico) está `pronta`; **cod-0069/cod-0070** (API/PWA) seguem `bloqueada-humano` pelo S2/RLS. **cod-0066 segue `pausada`** (autorização revogada). Docs: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` · `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md`.

> ✅ **cod-0074 saiu daqui — entregue em `933e855`** (`/entregar` 2026-08-22, modo TREE), ver "✅ Concluído".

### [P3] 💰 Gate Pro — intent `comparativo_mercados` do Agente (Peça 4)
- id: cod-0075
- tipo: refino-codigo
- porte: P
- skills: economizei-code-decisions, economizei-tdd, economizei-financial-firewall
- objetivo: a intent do Agente (cod-0041) usa `COMPARATIVO_AMOSTRAS_FREE` pra todo mundo — passar `ehPro` ao executor pra usar `COMPARATIVO_MAX_PRO` no Pro. **Mesma decisão, mesmo env, zero decisão nova.** Sem isso, o Pro é gated no `/comparar` e destravado ao perguntar em texto livre — o gate vaza pela porta do lado.
- depende-de: cod-0073
- criterios-de-aceite: intent respeita o mesmo teto do comando; teste cobre Free e Pro; node --test verde
- fora-de-escopo: outras intents; upsell dentro da narração do Agente
- status: **aguardando-decisao** (2026-08-21, rotina matinal — NÃO implementada)
- 🛑 **A PREMISSA NÃO SE SUSTENTA (achado da rotina matinal de 2026-08-21 — verificado no código, não deduzido).** Não existe vazamento nenhum: a intent do Agente **narra só UM comparativo** (`fato.destaque` = a maior diferença), para Free e para Pro igualmente. O teto (`maxComparativos`) só governa `fato.mostrados` e `fato.temMais` — e **nenhum dos dois é usado no caminho do Agente**: `template()` não os lê, o firewall de fidelidade só olha `fato.fmt`, e `montarMensagemComparativo` (o único consumidor de `mostrados`/`temMais`, em `formatter.js:846`) é do comando `/comparar`. `totalComparaveis` é contado **antes** do corte, então nem a frase "tenho N produtos comparáveis" muda. **Consequência: implementar como está escrito não muda uma vírgula do que o usuário vê — é fiação morta.** Se algo está torto hoje, é o contrário do descrito: o Pro vê *menos* pelo Agente (1 item) do que pelo `/comparar` (até 10).
- ⚖️ **Decisão sua (2 caminhos, nenhum é código puro):**
  - **(a) Fechar a tarefa como resolvida-por-inspeção** — o B10 já foi fechado pela cod-0073 no `/comparar`; não há segunda porta. Custo: zero.
  - **(b) Fazer o Agente listar mais de um comparativo pro Pro** (aí o teto passa a valer). Isso é **decisão de produto/UX**: muda a cara da resposta do Agente, que hoje é curta e de um fato só por design. Fora do que a máquina pode decidir sozinha.
  - Se você escolher (b), a fiação técnica é a que a tarefa já descreve (3 linhas: `index.js` passa `ehPro`, `agent/index.js` repassa ao `executar`, `intents.js` escolhe o env) e volta pra fila como porte P.

> ⏩ **cod-0062b SAIU DAQUI em 2026-08-21** — implementada pela rotina matinal e movida para "## 🔧 Em revisão". **NÃO está no working tree:** está em `estoque/0002_2026-08-21_cod-0062b/`. Ficha preservada abaixo como referência.

### ~~[P2] PIX — guard do `precos_mercado` + copy da confirmação~~ → EM REVISÃO
- id: cod-0062b
- tipo: feature-codigo
- porte: P — **fatia autônoma da cod-0062** (2026-08-07). Não toca `src/gemini.js`.
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: duas peças da cod-0062 que não dependem da extração: (1) trocar o guard de `registrarPrecosMercado` em `supabase.js:78` de `if (tipo !== 'outros')` para `if (tipo === 'mercado')` — senão PIX polui o histórico de preços; (2) escrever `montarConfirmacaoPix` (saída) e a mensagem de **entrada** ("isso é uma entrada, não registro como gasto") no `formatter.js`, prontas pra cod-0062 plugar.
- arquivos-alvo: `src/supabase.js` (só a linha do guard), `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `tipo='mercado'` continua registrando preço; `'outros'` e `'pix'` não. Teste cobre os três
  - as duas mensagens: valor com R$ no topo, sem gíria (regra 4 §11), sem prometer o que o bot não faz
  - a mensagem de entrada deixa claro que **nada foi gravado como gasto**
  - node --test verde; firewall acusa o token "pix" por design → commit consciente
- fora-de-escopo: `gemini.js`, `tipo_documento`, gravar compra, `direcao` no banco
- status: **em-revisao** (2026-08-21, rotina matinal — no ESTOQUE, leva 0002, sem commit)
- desvio consciente (2 itens, ambos pra mais): (1) o guard virou `entraEmPrecosMercado(tipo)` lendo `TIPOS_MERCADO` em vez do literal `tipo === 'mercado'` — mesma semântica, uma fonte de verdade só, testável sem banco; (2) nasceu uma **terceira** mensagem, `montarPixValorIlegivel` (recusa honesta do caso `pix-03` do corpus) — o critério pedia duas, mas sem a terceira o valor ausente virava "R$ 0,00".

### [P2] Canadá — módulo puro de datas (4 formatos do corpus)
- id: cod-0065a
- tipo: feature-codigo
- porte: M — **fatia autônoma da cod-0065** (2026-08-07). Módulo NOVO e puro; não toca `src/gemini.js`.
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles
- objetivo: `src/datas.js` — função pura que recebe a string de data crua e devolve ISO ou `null`, cobrindo os 4 formatos que o corpus real trouxe: `26/07/29` (**AA/MM/DD** — lido como DD/MM/AA vira 2029), `Jul 29, 2026`, `2026-07-29`, `27-JUL-26`. Sem tocar em nada que já funciona: a cod-0065 pluga depois.
- corpus: `test/corpus/canada/recibos.json` — ler antes de codar.
- criterios-de-aceite:
  - os 4 formatos verdes + o formato pt-BR atual (`DD/MM/AAAA`) inalterado
  - 🔴 **ambiguidade não vira chute:** entrada que case com mais de um formato com resultados diferentes → devolve `null` + motivo, nunca escolhe. `CODE_GUIDE` §0.4 (saída segura > erro confiante)
  - data futura implausível e ano de 2 dígitos ambíguo tratados explicitamente no teste
  - função pura, sem I/O, sem dependência de locale do sistema
- fora-de-escopo: usar o módulo em `gemini.js` (é a cod-0065); moeda; i18n de mensagem
- status: pronta

> ⏩ **cod-0065b SAIU DAQUI em 2026-08-21** — implementada pela rotina matinal e movida para "## 🔧 Em revisão". **NÃO está no working tree:** está em `estoque/0003_2026-08-21_cod-0065b/`. Ficha preservada abaixo como referência.

### ~~[P3] Canadá — `fmtMoeda(valor, moeda)` no formatter~~ → EM REVISÃO
- id: cod-0065b
- tipo: refino-codigo
- porte: P — **fatia autônoma da cod-0065** (2026-08-07).
- skills: economizei-code-decisions, economizei-tdd, economizei-copywriter, copy-review
- objetivo: helper currency-aware (`R$ 99,90` / `$99.90`) usado só na formatação de mensagem, com **default BRL** — toda chamada atual sem o parâmetro devolve byte a byte o que devolve hoje.
- criterios-de-aceite: nenhuma mensagem pt-BR existente muda (teste compara string a string); CAD formata com `$` e ponto decimal; valor negativo e zero cobertos
- fora-de-escopo: gravar `moeda` no banco (precisa migration — proibido); `gemini.js`
- status: **em-revisao** (2026-08-21, rotina matinal — no ESTOQUE, leva 0003, sem commit)
- decisões tomadas na implementação (ambas travadas por teste): BRL **delega** pro `brl()` atual (byte a byte por construção, inclusive `R$ -5,00`); moeda desconhecida e valor não numérico devolvem **`null`**, nunca um símbolo ou número chutado. CAD formatado à mão, sem `toLocaleString` — não depender do ICU do runtime.
- ⚠️ ressalva honesta: o helper **não tem chamador** (é o que o critério pede). Leva legítima pra recusar se você não quiser código inerte na `main` — está isolada na leva 0003.

### [P3] Fatura — parser puro de parcela (`03/12`)
- id: cod-0072a
- tipo: feature-codigo
- porte: P — **fatia autônoma da cod-0072** (2026-08-07). Não toca `src/gemini.js` nem depende da fatura real.
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles
- objetivo: função pura que extrai `{parcelaAtual, parcelaTotal}` das formas usuais em fatura brasileira (`03/12`, `PARC 3/12`, `3 DE 12`) e devolve `null` quando não há parcelamento — para que o gasto do mês seja **a parcela, não o valor cheio**.
- criterios-de-aceite: formas cobertas + negativos (`12/2026` é data, não parcela — não pode virar parcela); ambiguidade → `null`; função pura
- fora-de-escopo: ler fatura, prompt, gravar; detectar assinatura recorrente
- status: pronta

---

### [P2] Limpeza — remover funções MP órfãs (código morto)
- id: cod-0066
- tipo: refino-codigo
- porte: P (diff grande porém quase só deleção — revisão mecânica)
- skills: economizei-code-decisions, economizei-tdd, economizei-financial-firewall
- objetivo: apagar as funções MP órfãs (ninguém chama desde `4f49ae7`) e seus exports — `supabase.js`: `setPendentePlano`, `limparPendentePlano`, `salvarAssinaturaPreapproval`, `atualizarStatusAssinatura`, `buscarPorPreapprovalId`, `registrarEventoAssinatura`, `buscarDadosAssinatura`; `formatter.js`: `montarMensagemPedirEmail`, `montarMensagemLinkAssinatura`, `montarMensagemAssinaturaAtivada`, `montarMensagemAssinaturaCancelada`, `montarMensagemEmailInvalido`, `montarMensagemErroAssinatura`, `montarMensagemPagamentoFalhou`, `montarMensagemJaAssinante`.
- nota-de-autorizacao: ✅ **CONTRADIÇÃO ARBITRADA pelo Gabriel em 2026-08-07: vale a AUTORIZAÇÃO.** A restrição *"nada de apagar MP"* vale **só pro lastro**; esta tarefa está liberada e volta pra Fila pronta. *(Histórico: duas anotações opostas da mesma data 2026-07-27 deixaram a tarefa 11 dias em limbo — a máquina obedeceu a mais conservadora e nunca a pegou.)*
- 🔗 **sequência com o banco:** as 15 funções não têm chamador desde `4f49ae7`, então o DROP das colunas MP no Supabase é seguro mesmo antes desta tarefa. A ordem preferida continua sendo **código → deploy → banco** (esta tarefa entregue e no ar, e só então o DROP).
- arquivos-alvo: `src/supabase.js`, `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `grep` sem nenhuma referência restante às funções removidas (código e testes)
  - NENHUMA função viva alterada (`montarMensagemPix`, `montarMensagemPlanos`, `is_pro` etc. intocados)
  - node --test verde (remover/ajustar testes que cobriam só o código morto)
- fora-de-escopo: `/pix`, `/planos`, qualquer lógica viva de pagamento; comentários históricos no `zapi.js`
- status: pronta

### [P2] Frente 1 — ler comprovante de PIX (foto/PDF) ✅ **DESTRAVADA 2026-08-05 (corpus entregue)**
- id: cod-0062
- tipo: feature-codigo
- porte: G (coração — rodar com o Gabriel presente; o pré-req de material FOI CUMPRIDO)
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o Gemini classifica o documento (`tipo_documento`); se PIX, extrai valor/data/contraparte/**direção** e grava como `compras` `tipo='pix'` (contraparte→`loja`, itens=[]), confirmando com o número primeiro.
- corpus: **`test/corpus/pix/comprovantes.json`** — 3 layouts reais (PDF Bradesco/QR, PDF BB/SISBB, print do app) + 1 caso negativo. Achados completos: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md` §1. **Ler antes de codar.**
- ✂️ **FATIADA em 2026-08-07:** o guard do `precos_mercado` e a copy de confirmação saíram pra **cod-0062b**; o filtro de agregação (`direcao='saida'` em todo somatório) saiu pra **cod-0062a**. O que sobra aqui é **só o coração**: `tipo_documento`, extração de valor/data/contraparte/direção, dedup por EndToEndId. Se as fatias já estiverem na `main`, esta tarefa encolhe bastante.
- arquivos-alvo: `src/gemini.js` (campo `tipo_documento` + ramo PIX no prompt e no `validarSchema`), `src/supabase.js` (`salvarCompra` aceita `tipo='pix'`), `test/` (usar o corpus)
- criterios-de-aceite:
  - comprovante PIX (imagem/PDF) → `tipo_documento='pix'`, valor/data/contraparte extraídos; `salvarCompra` grava `tipo='pix'` com itens vazios
  - 🔴 **`direcao` obrigatória** — ✅ **DECIDIDO 2026-08-05:** PIX recebido **É REGISTRADO, marcado como entrada** (`compras.direcao='entrada'`) e **nunca conta como gasto**. PIX enviado → `direcao='saida'`. Direção indeterminada → falhar, nunca assumir
  - 🔴 **toda agregação de gasto passa a filtrar `direcao='saida'`** — `calcularMedia`, `/gastos`, resumo mensal, alerta, teto, supérfluo. Um único esquecimento faz entrada virar gasto (é o mesmo tipo de erro do `tipo='outros'` de 06-07)
  - 🟢 **dedup por `id_transacao`** (EndToEndId): mesmo comprovante (ou PDF + print da mesma transação) mandado 2× grava **uma** compra. Índice único parcial já na migration
  - 🔴 **valor não-impresso** (caso `pix-03`, print do Mercado Pago): só aceitar valor deduzido do saldo se a conta fechar exatamente; senão **recusa honesta**. O teste reprova número errado e ACEITA recusa (`aceita_falha_honesta`)
  - **nunca persistir** CPF, chave PIX (é telefone), agência ou conta — ler e descartar (LGPD)
  - PIX NÃO entra em `calcularMedia` nem em `precos_mercado` (o guard virou `=== 'mercado'`)
  - **corpus de cupom continua verde** (coração intacto); corpus PIX verde; confirmação com R$ no topo, sem gíria
  - node --test verde; firewall verde (token "pix" acusa de propósito — commit consciente)
- ✅ **pendência humana FECHADA 2026-08-05:** `compras.tipo` **não tem CHECK** (`migration_2026-06-07_coerencia_outputs.sql` faz só `ADD COLUMN ... text NOT NULL DEFAULT 'mercado'`) → `tipo='pix'` grava **sem migration**.
- fora-de-escopo: insight/query dedicado de PIX; fatura (é a cod-0072); gate Pro; i18n; persistir moeda
- 🗄️ **depende-de MIGRATION (anti-A9):** `supabase/migration_2026-08-05_pix_direcao_id_transacao.sql` — autorizada pelo Gabriel em 2026-08-05, **precisa rodar no Supabase ANTES do push desta tarefa**. Adiciona `compras.direcao` (default `'saida'`, preserva todo histórico) e `compras.id_transacao` + índice único parcial. Acrescentar as duas às `CHECAGENS_CRITICAS` do `src/schemaGuard.js`.
- depende-de: cod-0061 (✅ `e7f236d`)
- status: pronta

### [P2] Frente 1 — ler FATURA DE CARTÃO (PDF) 🆕 **decisão do Gabriel 2026-08-05: entra agora, em paralelo ao PIX**
- id: cod-0072
- tipo: feature-codigo
- porte: G (coração + documento mais sensível do produto — nunca run autônoma)
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- decisão de origem: *"a fatura de cartão entra na frente 1 mesmo sem termos o pix estabilizado, vamos testando e estabilizando com o tempo"* (Gabriel, 2026-08-05). Destrava a **G1** (assinaturas e gastos invisíveis), reprovada na pesquisa de 06-09 exatamente porque "o bot só vê cupom, não fatura".
- ✂️ **FATIADA em 2026-08-07:** o parser puro de parcela saiu pra **cod-0072a** (não depende de ter fatura real em mãos, então pode adiantar).
- objetivo: `tipo_documento='fatura'` → extrair os LANÇAMENTOS (data, estabelecimento, valor, parcela x/y) de um PDF de fatura e gravar cada um como registro de gasto, sem quebrar nada do cupom.
- criterios-de-aceite:
  - lançamento críptico é o novo coração: `PAG*IFOOD`, `MP *ASSINATURA`, `AMZN MKTPL` → `nome_canonico` + categoria pelo mesmo padrão do item de cupom
  - **parcela** (`03/12`) reconhecida: o gasto do mês é a parcela, não o valor cheio
  - **reconciliação:** soma dos lançamentos × total da fatura, mesma rede do cupom; sem fechar → recusa honesta
  - **pagamento da fatura NÃO é gasto novo** (senão conta duas vezes: a compra e a fatura)
  - **custo:** fatura de 8 páginas ≠ cupom de 40 itens → medir e decidir a aritmética do limite free por tipo de documento (hoje 10 cupons/mês)
  - LGPD em dobro: a fatura expõe a vida financeira inteira. Processa-em-memória-e-descarta; `/apagar` cobre os novos registros desde o dia 1; **nada de número de cartão persistido**
  - corpus de cupom e de PIX continuam verdes
- ⚠️ **pré-req humano (não bloqueia começar, bloqueia terminar):** 1 fatura real (sua) pro corpus. Sem ela dá pra escrever prompt e parser, mas **não dá pra afirmar que funciona** — mesma lição das cod-0062/0065, que ficaram 3 semanas paradas por falta de material.
- fora-de-escopo: conectar com banco/Open Finance; gate Pro; cobrança; detectar assinatura recorrente (vem depois, em cima dos lançamentos)
- status: pronta

### [P2] Modo recibo Canadá (Vancouver) — entender e armazenar qualquer recibo ✅ **DESTRAVADA 2026-08-05 (corpus entregue)**
- nota (2026-08-05): a **sessão de canal aconteceu** — o Gabriel decidiu que o app é um **2º canal** (não substituto), e a leitura de recibo é canal-agnóstica, então ela serve os dois. Os **6 recibos reais chegaram**. O pré-requisito humano que a segurava desde 07-09 **caiu**.
- corpus: **`test/corpus/canada/recibos.json`** (+ fotos em `canada/img/`) — 2 supermercados, 1 farmácia, 1 loja de variedades, 1 serviço. Achados que MUDAM o escopo: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md` §2. **Ler antes de codar.**
- id: cod-0065
- tipo: feature-codigo
- porte: G (coração — rodar com o Gabriel presente)
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o bot lê recibo canadense de QUALQUER comércio (mercado, restaurante, varejo, farmácia, etc.), detecta a moeda/idioma ($/en → CAD; R$/pt → BRL), extrai loja/data/total/itens (categoria + `nome_canonico`) e confirma no WhatsApp com o símbolo de moeda certo — **reusando todo o pipeline atual** (`lerRecibo` → `validarSchema` → `salvarCompra` → confirmação). SEM quebrar o comportamento pt-BR/BRL.
- ✂️ **FATIADA em 2026-08-07:** o parser multi-formato de data saiu pra **cod-0065a** (módulo puro `src/datas.js`) e o `fmtMoeda` pra **cod-0065b**. O `coerceNumber` **ficou aqui de propósito** — mexer na coerção numérica afeta todo cupom brasileiro, é coração. O que sobra: prompt, moeda, `nome_canonico` em inglês, contexto de seção, reconciliação com negativo, item por peso.
- arquivos-alvo: `src/gemini.js` (PROMPT + `coerceNumber` + detecção de moeda + reconciliação aceitando negativo), `test/` (testes novos + corpus canadense)
- criterios-de-aceite:
  - `coerceNumber` lida com `"1,299.90"` (vírgula de milhar + ponto decimal) **sem** quebrar `"99,90"` pt-BR
  - o prompt detecta a moeda pelo símbolo/idioma e retorna campo `moeda`; **CNPJ opcional** (null quando ausente — o esquema já aceita)
  - recibo canadense de qualquer tipo → `sucesso:true` com loja/total/itens; item names em inglês canonizados **pelo tipo genérico** ("milk whole 2%", "chicken breast"). **`categoria` continua no enum pt-BR de 10 valores** — não bifurcar a taxonomia
  - 🔴 **DATA — 4 formatos no mesmo corpus:** `26/07/29` (AA/MM/DD! lido como DD/MM/AA vira 2029), `Jul 29, 2026`, `2026-07-29` e `27-JUL-26`. Todos os 4 casos verdes; em ambiguidade, marcar suspeita em vez de chutar
  - 🟠 **linhas que não são produto mas entram na soma:** `DEPOSIT`, `RECYCLING FEE`, `ECO FEE` e a linha **NEGATIVA** `Member Pricing −3.58` → registrar como item `categoria:"outros"` mantendo o sinal; **a reconciliação item×total passa a aceitar valor negativo** (senão o cupom é rejeitado à toa)
  - 🟠 **item por peso:** `0.620 kg @ $4.39/kg` → `quantidade` deixa de ser inteiro
  - usar o **contexto de seção** do recibo (`21-GROCERY`, `22-DAIRY`, `31-MEATS`, `27-PRODUCE`, `34-BAKERY`) pra decifrar nome críptico — é categoria impressa pelo próprio mercado
  - confirmação mostra o símbolo certo ($ vs R$), número no topo, sem gíria
  - **o coração não regride:** corpus de regressão de classificação pt-BR **verde** (CODE_GUIDE §0) + **corpus canadense verde** (`test/corpus/canada/`)
  - node --test verde; **firewall financeiro verde** (zero token de `is_pro`/plano/preço — "moeda" é dado transacional, não pricing)
- ✅ **DECIDIDO 2026-08-05 — `total` = o que saiu do bolso.** No `ca-04`, `total` = **54,78** (debitado no cartão) e o impresso 64,78 vira `total_bruto`. ⚠️ Consequência: **a reconciliação item×total roda contra `total_bruto`**, nunca contra `total` — senão todo recibo com resgate de pontos é rejeitado. Persistir só `total` por enquanto (gravar `total_bruto` pede coluna nova = decisão humana à parte).
- fora-de-escopo: i18n completo das mensagens (é cod-0063); **NÃO gravar `moeda` em `compras`** (sem a migration, o INSERT quebra — lição do A9; persistência é follow-on humano); leitura de fatura/PIX (Frente 1); gate Pro; provedor de WhatsApp p/ número canadense; consentimento CASL (humano/legal); **NÃO** tocar `/planos`/`/assinar`/pagamento
- status: pronta

---

> **⬇️ FIM DA FILA — cadeia de refinamento do Agente (rebaixada em 2026-08-05, decisão do Gabriel).** ~~As três abaixo~~ → **cod-0044 e cod-0048 implementadas pela rotina matinal de 2026-08-06** (ver "🔧 Em revisão"); resta a cod-0049, gated pelo bloco Supabase. Racional do rebaixamento: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §1.

### [P3] Alerta Pro — insights proativos pré-programados (base)
- id: cod-0049
- tipo: feature-codigo
- porte: M
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-financial-firewall
- depende-de: ✅ **cod-0035 já está no `origin/main`** (`df18b53`, 2026-07-28) — gate original SATISFEITO. ⚠️ **CONDIÇÃO NOVA (2026-08-05):** só é elegível **depois do bloco Supabase S0–S4** do `Plano_Desentupimento_e_Supabase_2026-08-05.md`. Motivo: o cooldown desta tarefa provavelmente pede coluna/tabela nova, e o banco está hoje com migration atrasada (`lembretes_enviados` inexistente) — implementar antes de arrumar o banco é convite ao A9.
- objetivo: base de insights proativos com **gatilhos determinísticos pré-programados** + cooldown (decisão do Gabriel 2026-07-27: começar pré-programado pra testar a estrutura; aprimorar depois com o que os usuários falarem/`perguntas_log`). 2–3 gatilhos iniciais, ex.: (a) gasto do mês cruzou a média histórica antes do dia 20; (b) categoria ≥50% acima da média dela; (c) economia acumulada atingiu marco redondo (insight positivo).
- arquivos-alvo: `src/insights.js` (gatilhos puros, testáveis), wiring pós-`salvarCompra` (junto ao do cod-0035), `src/formatter.js` (mensagens — número no topo, sem moralizar, tom honesto), `test/`
- criterios-de-aceite:
  - gatilhos 100% determinísticos (número nasce no `insights.js`, zero LLM); cooldown **máx. 1 insight proativo/usuário/semana** e 1×/gatilho/mês
  - **anti-A9:** se o cooldown precisar de coluna/tabela nova → PARAR, escrever o `.sql` e deixar pro Gabriel rodar ANTES (+ `schemaGuard`)
  - não duplicar o reengajamento D3/D10 nem o alerta de limite do cod-0035 (fronteiras claras); node --test verde
  - sem gate Pro nesta base (gate entra na aplicação do desdobramento `Gate_Pro_Desdobramento_2026-07-10.md`)
- fora-de-escopo: insights derivados de `perguntas_log` (fase 2, pós-lançamento); LLM escolhendo insight; configuração pelo usuário
- status: pronta

---

---

## 📱 2º canal — App/Painel (semente plantada em 2026-08-05, decisão do Gabriel)

> **A decisão:** o app **não substitui** o WhatsApp. Os dois funcionam **juntos e separados**, com **as mesmas funcionalidades** e o **mesmo banco** — os dois aceitam foto. O que muda é **como o usuário visualiza**. WhatsApp segue carro-chefe pela simplicidade.
> **A consequência técnica:** dois canais com as mesmas funções só se sustentam se a regra de negócio **sair de dentro do canal** — daí a extração do núcleo (cod-0071). Sem isso, toda função nova seria escrita duas vezes e as duas divergiriam.
> **Identidade:** `usuarios.phone_number` continua sendo a chave; o app loga com o número + código no WhatsApp. Zero migration, e quem já usa o bot abre o app com os dados já lá.
> **Superfície:** PWA primeiro (Vercel, custo zero, sem loja de app, **não depende da empresa BC**); nativo depois, se as lojas fizerem falta.
> Desenho completo (incl. fases D e E): `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md` §3.

### [P2] Painel — extrair o núcleo canal-agnóstico (Fase C)
- id: cod-0071
- tipo: refino-codigo
- porte: M (refactor puro — **zero mudança de comportamento**; os 482 testes atuais são a rede de segurança)
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-financial-firewall
- objetivo: extrair de `src/index.js` um `src/core/recibo.js` que receba `(phoneNumber, buffer, mimeType)` e devolva um **resultado estruturado** (dados extraídos + o que deve ser dito ao usuário), sem saber que existe WhatsApp. O manipulador do webhook passa a ser um adaptador fino que traduz esse resultado em mensagem Z-API.
- arquivos-alvo: `src/core/recibo.js` (novo), `src/index.js` (passa a chamar o núcleo), `test/`
- criterios-de-aceite:
  - **nenhum teste existente muda de expectativa** — se um precisar mudar, o refactor mudou comportamento e está errado
  - `src/core/recibo.js` não importa `zapi.js` nem conhece formato de mensagem
  - o núcleo devolve dados + intenção de resposta; quem formata continua sendo `formatter.js` no adaptador
  - node --test verde (482/482 ou mais); firewall verde
- fora-de-escopo: criar endpoint HTTP (é a Fase A); mexer em `gemini.js`/classificação; mudar qualquer mensagem
- status: pronta

### [P2] Painel — API só-leitura autenticada (Fase A)
- id: cod-0069
- tipo: feature-codigo
- porte: M
- skills: economizei-code-decisions, economizei-tdd, economizei-security-lgpd, economizei-product-principles, economizei-financial-firewall
- objetivo: `GET /api/resumo`, `/api/compras`, `/api/itens` — os mesmos números que o `/gastos` já devolve, em JSON, autenticados por sessão do próprio usuário (login por código de 6 dígitos enviado no WhatsApp do número).
- criterios-de-aceite: cada resposta só contém dado do usuário autenticado (nunca de outro número); token com expiração; **o app nunca fala com o Supabase direto** — só com esta API; número nasce nas mesmas funções de `insights.js`, nunca recalculado à parte
- 🔴 depende-de: **S2 ✅ (2026-08-07) + S4 ainda aberto.** Metade do bloqueio caiu: a `service_role` está no Railway. Falta ligar o RLS (S4, com o complemento das 5 tabelas + 7 views) — abrir API pública com o banco sem RLS é expor dado de todo mundo. Ver 🩺 em "Ações do Gabriel".
- status: bloqueada-humano

### [P3] Painel — casca do PWA (Fase B)
- id: cod-0070
- tipo: feature-codigo
- porte: M — **greenfield em pasta isolada `painel/`**: não toca `src/`, não toca classificação, não toca dinheiro. Pior caso = apagar a pasta.
- objetivo: login por código, tela do mês (total, categorias, gráfico), lista de compras. Consome só a API da Fase A.
- ⚠️ **proposta de regime de revisão** (decisão sua — item em "Aguardando sua decisão"): por ser greenfield isolado, rodar acima do teto de linhas e revisar **por comportamento** (abre no navegador e funciona?) em vez de linha a linha.
- depende-de: cod-0069
- status: bloqueada-humano

---

## ⚓ Fila de lastro (fallback — a máquina só pega daqui quando NADA da Fila pronta é elegível)

> **Regra (decisão do Gabriel, 2026-07-27 — Máquina 2.0):** por enquanto o lastro é **SÓ testes, revisões e segurança** — nada de apagar código, nada de feature nova, nada de página. Mesmo teto por run da Fila pronta. Item executado vira tarefa normal em "🔧 Em revisão". Objetivo: acabar com o "dia sem produção" quando a fila principal está bloqueada por pré-req humano.

### [las-01] Cobertura de testes — `alerts.js`
- tipo: teste · porte: P · lote: cobertura-jobs
- objetivo: testes da lógica de alerta (>120% da média 90d, limiares `ALERTA_*`, estados sem dados) onde ainda não coberta.
- status: pronta

### [las-03] Cobertura de testes — `monthlySummary.js` ⬆️ **PRIORIDADE DO LASTRO (2026-08-05)**
- tipo: teste · porte: P · lote: cobertura-jobs
- objetivo: testes do resumo mensal (agregação, mês vazio, reuso de `dadosCat` pro gráfico).
- por que subiu: com o reengajamento desligado (cod-0068), o resumo de fim de mês virou **a única mensagem proativa do produto**. É o job que menos pode quebrar em silêncio — e o `reengagement.js` acabou de provar que um subsistema inteiro fica morto por semanas sem ninguém ver.
- status: pronta

### [las-02] Cobertura de testes — `reengagement.js` ⬇️ **REBAIXADA (2026-08-05)**
- tipo: teste · porte: P · lote: cobertura-jobs
- objetivo: testes dos 4 segmentos de lembrete (A/B/C/D) com deps injetadas; estados-vazios honestos. (Complementa `reengagement-d10.test.js`.)
- nota: subsistema desligado por decisão de 2026-08-05 (cod-0068). O módulo fica no repo (reversível), mas testar o que não roda não é prioridade. Reabilitar se/quando o reengajamento voltar.
- status: pausada

### [las-04] Cobertura de testes — `charts.js` + `metrics.js`
- tipo: teste · porte: P · lote: cobertura-obs
- objetivo: testes da URL do QuickChart (encoding, dados vazios, labels longos) e da coleta de métricas.
- status: pronta

### [las-05] Cobertura de testes — `scheduler.js`
- tipo: teste · porte: P · lote: cobertura-obs
- objetivo: testes do wiring dos jobs com cron mockado (nenhum job dispara de verdade em teste).
- status: pronta

### [las-06] Revisão de segurança só-leitura (relatório, sem diff)
- tipo: teste · porte: M
- objetivo: varrer `src/` e REPORTAR (sem alterar código): dado sensível em log (LGPD — CPF/telefone/conteúdo de cupom), input não validado no webhook, erro engolido em silêncio. Saída = seção no RELATORIO_MATINAL com arquivo+linha+sugestão, não diff.
- status: pronta

---

## 📦 Estoque (regime ESTOQUE — levas em `estoque/` ainda NÃO entregues)

> **Como funciona.** Cada leva da máquina vira uma **pasta numerada** em `estoque/`, com o manifesto `LEVA.md` e as versões completas dos arquivos em `arquivos/`. A leva `NNNN+1` é construída **em cima** da `NNNN` (REGRA 1 — cadeia), então **a ordem de aplicação é a ordem do número. Nunca pular uma.** O `scripts/estoque.mjs` recusa mecanicamente aplicar fora de ordem.
>
> **Por que pasta e não branch.** Medido em 2026-08-18: o disco montado onde a máquina roda **não permite apagar arquivo**, e todo comando de escrita do git cria um `.lock` que precisa ser apagado — resultado, a **segunda** escrita de git trava o repositório pra sempre (`commit #1: OK`, `commit #2: FALHOU`). A Máquina 3.0 (pilha de branches) era fisicamente impossível aqui. Doc: `Economizei app/Veredito_Teste_Commit_Sandbox_2026-08-18.md`.
>
> **Teto de estoque = 4 levas ou ~1200 linhas de trabalho novo.** Estourou, a máquina para de produzir e reporta "estoque cheio". É o que impede a dívida crescer escondida.
>
> **Como a máquina NÃO suja mais o working tree**, entrega atrasada **não bloqueia mais a produção**. Era esse acoplamento que custou 6 dias (cod-0043) e 8 dias (cod-0062a).
>
> **Verdade é o disco, não esta tabela.** Rode `node scripts/estoque.mjs status` — ele lista as levas em ordem, mede o delta contra a base correta, roda `node --check` em cada arquivo, checa zona proibida e **verifica se a cadeia foi preservada**. Se divergir desta tabela, o `/entregar` avisa.
>
> **Sinal de idade:** leva com >5 dias = 🔴 (o `/entregar` está atrasado, não a máquina).

| # | Leva | Tarefa | Criada em | Linhas novas | Migration? | Idade |
|---|---|---|---|---|---|---|
| 1 | `0002_2026-08-21_cod-0062b` | cod-0062b — copy do comprovante de PIX | 2026-08-21 | ~274 | não | 1 dia |
| 2 | `0003_2026-08-21_cod-0065b` | cod-0065b — `fmtMoeda` currency-aware | 2026-08-21 | ~164 | não | 1 dia |

**Estoque: 2/4 · ~438 linhas de trabalho novo · cadeia verificada ✅** (`src/formatter.js` é compartilhado pelas duas: 52/52 linhas da leva 0002 preservadas na 0003). Última reconciliação: 2026-08-22 (`origin/main` = `103226a`).

---

## 🔧 Em revisão
*(a máquina move pra cá ao commitar numa branch — esperando o Gabriel mergear via `/entregar`)*

> **📦 Estoque: 2 levas · aplicar SEMPRE na ordem** (as duas tocam `src/formatter.js`; cada uma nasceu do topo da anterior).
> `node scripts/estoque.mjs status` → `aplicar <n>` → `npm run check` → `/entregar` → depois do push, `limpar <n>`.
> Teto = 4 levas. **2/4 ocupadas** — leva 0001 (cod-0074) foi entregue em `933e855` (2026-08-22) e removida daqui.

### 📦 cod-0065b — `fmtMoeda(valor, moeda)` · **NO ESTOQUE, leva 0003** (2026-08-21)

- **status:** em-revisao · **produzida por:** rotina matinal de 2026-08-21 · **base:** leva 0002
- **⚠️ ONDE ESTÁ:** `estoque/0003_2026-08-21_cod-0065b/` — sem commit, fora do working tree.
- **migration:** ❌ nenhuma · **💰 financeiro:** ❌ não
- **mapa tarefa→arquivos:** `src/formatter.js` (+53: `MOEDAS`, `_agrupar`, `fmtMoeda` + export) · `test/fmt-moeda.test.js` (**novo**, 12 testes, 110 linhas)
- **testes:** 604/604 com as 3 levas aplicadas (stub do `sharp` em `/tmp`, regra 11). Gate final é o seu `npm run check`.
- **⚠️ o helper não tem chamador** — é o que o critério pede (nenhuma mensagem pt-BR pode mudar), mas é peça inerte até a cod-0065. Recusável sem prejuízo.

### 📦 cod-0062b — PIX: guard do `precos_mercado` + copy · **NO ESTOQUE, leva 0002** (2026-08-21)

- **status:** em-revisao · **produzida por:** rotina matinal de 2026-08-21 · **base:** leva 0001
- **⚠️ ONDE ESTÁ:** `estoque/0002_2026-08-21_cod-0062b/` — sem commit, fora do working tree.
- **migration:** ❌ nenhuma
- **💰 financeiro: SIM, por token** — a palavra "PIX" em `formatter.js`, `supabase.js` e no teste. O firewall acusa por design (advisory). Nada cobra, precifica ou toca `is_pro`.
- **mapa tarefa→arquivos:** `src/supabase.js` (+17: `entraEmPrecosMercado` + guard em `salvarCompra`) · `src/formatter.js` (+76: `_valorPix` + 3 mensagens) · `test/pix-comprovante-copy.test.js` (**novo**, 15 testes, 180 linhas)
- **testes:** 592/592 com as levas 0001+0002 (stub do `sharp` em `/tmp`, regra 11). Gate final é o seu `npm run check`.
- **comportamento hoje: idêntico** — `gemini.js:262` normaliza `tipo` pra exatamente `'mercado'`/`'outros'` antes de chegar no guard. A troca de lista negra → lista branca vale pro `'pix'` de amanhã.
- **pendência que NÃO é desta leva:** o corpus fala `direcao: 'enviado'|'recebido'`, a coluna fala `'saida'|'entrada'`. O mapeamento é da cod-0062 — a leva entrega as duas mensagens separadas e não escolhe por você.

> **✅ RECONCILIADO em 2026-08-22 (comando `/entregar`, modo TREE):** **cod-0074** entregue (`933e855`, gate Pro nos comandos do Alerta Pro) + adoção do regime ESTOQUE (`e6bc992`: `scripts/estoque.mjs` + docs, antes só no disco há 3 dias). `origin/main` sincronizado em `933e855`. 577/577 testes verdes, `npm run check` verde na máquina real antes de cada commit e no pre-push. Leva 0001 aplicada via `node scripts/estoque.mjs aplicar 1` e removida do estoque após o push. Detalhe em "✅ Concluído". Seção esvaziada (cod-0074).

> **✅ RECONCILIADO em 2026-08-20 (comando `/entregar`, modo TREE):** **cod-0073** commitada e pushada (`origin/main` sincronizado em `886cd1a`, working tree limpo pros arquivos do plano — exceto `.claude/settings.local.json`, artefato da própria sessão de entrega —, 563/563 testes verdes, `npm run check` verde na máquina real antes de cada commit e no pre-push): código `feat(financeiro): gate Pro no /comparar (cod-0073)` `ba1c508` · docs (RLS fechado/regra 14/veredito do teste de commit no sandbox/Plano B estoque) `886cd1a`. **Pendência aberta:** `src/agent/intents.js:596` segue usando `COMPARATIVO_AMOSTRAS_FREE` pra todos (cod-0075 é quem fecha esse vazamento — Pro gated no `/comparar` mas destravado ao perguntar em texto livre). Pré-req humano não-bloqueante: setar `COMPARATIVO_MAX_PRO=10` no Railway/`.env.example` (default do código já é 10). Seção esvaziada.

> **✅ RECONCILIADO em 2026-08-15 (comando `/entregar`, modo TREE):** **cod-0062a** commitada e pushada (`origin/main` sincronizado em `e10701f`, working tree limpo pros arquivos do plano — exceto `.claude/settings.local.json`, deixado de fora por ser artefato da própria sessão de entrega —, 552/552 testes verdes, `npm run check` verde na máquina real antes do commit e no pre-push): código `refino(supabase): filtro de gasto explicito em toda leitura agregada (cod-0062a)` `378e2be` · docs (reconciliação da sessão de revisão da máquina 08-07 + correção real do `.claude/commands/tarefa.md`) `e10701f`. A tarefa tinha ficado **8 dias no working tree** (produzida em 08-07, a esteira relatou "guarda (a) esteira entupida" em toda rotina matinal desde então). **Achado durante a entrega:** o `.claude/commands/tarefa.md` no working tree NÃO era a correção completa do lock que o CLAUDE.md registrava como feita — markdown quebrado + `git branch`/`git log` sem `GIT_OPTIONAL_LOCKS=0`. Substituído pelo conteúdo de `Economizei app/tarefa_CORRIGIDO_2026-08-07.md` antes de commitar (decisão do Gabriel); os 2 bilhetes de tarefa (`PATCH_comandos_lock_2026-08-07.md` + `tarefa_CORRIGIDO_2026-08-07.md`) foram apagados por já terem sido consumidos. Pendências de ratificação (não bloqueiam, seguem abertas): (a) `insights.js` não foi tocado de propósito; (b) `listarUsuariosAtivosNoMes`/`buscarElegiveisInativos` não filtram — medem atividade, não gasto. Migration: **nenhuma necessária** — o filtro de `direcao` fica atrás de um probe de existência. Seção esvaziada.

> **✅ RECONCILIADO em 2026-08-07 (comando `/entregar`, modo TREE):** **cod-0044 + cod-0048** commitadas e pushadas em 2 commits (`origin/main` sincronizado em `da1307e`, working tree limpo pros arquivos do plano, 534/534 testes verdes, `npm run check` verde na máquina real antes do commit e no pre-push): feat combinado `41beafe` (intents.js compartilhado entre as duas — commit único consciente, `git add -p` indisponível neste ambiente) · docs `da1307e`. Detalhe abaixo em "✅ Concluído". Seção esvaziada. Pendências de ratificação (não bloqueiam): (a) sugestão omitida quando único exemplo do alvo tem gíria/número; (b) sugestão também em "categoria não encontrada" com mês tendo dados; (c) `mostrar_grafico` consome cota como pergunta normal.

> **✅ RECONCILIADO em 2026-08-05, sessão à noite (comando `/entregar`, modo TREE):** **cod-0068 + cod-0067 + cod-0025** commitados e pushados em 8 grupos, na ordem código→docs (`origin/main` sincronizado em `b485ba8`, working tree limpo pros arquivos do plano, 509/509 testes verdes, `npm run check` verde antes de cada commit e no pre-push): cod-0068 `18a0b45` · cod-0067 `689c9ae` · cod-0025 `548468f` · Máquina 3.0/comandos `2fa59c1` · corpus PIX/Canadá `67fe676` · migration PIX (ainda não executada no Supabase) `46f9e96` · config `8e39333` · docs `b485ba8`. Sem conflito de arquivo entre grupos — staging direto, sem `git add -p`. Detalhe preservado em "✅ Concluído" abaixo. Seção esvaziada.

> **✅ RECONCILIADO em 2026-08-05 (comando `/entregar`):** **cod-0043** commitado e pushado (`origin/main` sincronizado, working tree limpo, 482/482 testes verdes, `npm run check` verde antes do commit e no pre-push): `9c094aa`. Entregue na mesma sessão que os docs (Máquina 2.1 modo puxado + desentupimento da esteira + checkpoints, `2790e44`). Sem conflito de arquivo entre grupos — staging direto, sem `git add -p`. Detalhe preservado em "✅ Concluído" abaixo. Seção esvaziada.

> **✅ RECONCILIADO em 2026-07-28 (comando `/entregar`):** **cod-0035** commitado e pushado (`origin/main` sincronizado, working tree limpo, 460/460 testes verdes, `npm run check` verde antes de cada commit e no pre-push): `df18b53`. Entregue na mesma sessão que os docs (senso crítico + Máquina 2.0 + repriorização, `e700ed6`) e o allowlist local (`600db9d`). Sem conflito de arquivo entre grupos — staging direto, sem `git add -p`. Detalhe preservado em "✅ Concluído" abaixo. Seção esvaziada.

> *(Notas de reconciliação de 07-13/07-16/07-24/07-27 migradas pro snapshot em 2026-07-27 — curadoria.)*

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

- **cod-0074 · Gate Pro nos comandos do Alerta Pro** (commit `933e855`, 2026-08-22) — Peça 3 do desdobramento do gate Pro, mesmo padrão da cod-0073 no `/comparar`. Recorte decidido em 07-08, refinado em 07-27: Pro em `/acompanhar`, `/teto`, `/superfluo` (a configuração); `/acompanhamentos` e `/parar` sempre abertos de propósito (quem caiu do Pro precisa ver e desligar o que configurou); alerta proativo de teto (cod-0035) com **gate silencioso** (sem Pro, não envia e não faz upsell — mensagem não solicitada é o pior lugar pra vender); bloco de supérfluo com baseline no `/gastos` continua Free. `src/index.js` (`COMANDOS_PRO_ALERTA` + `comandoExigeProAlerta`/`comandoLiberadoParaUsuario` puras, test-only + `exigirProAlerta`; `verificarAlertasDeLimite` ganha `usuario`+`deps` injetáveis, padrão da cod-0052), `src/formatter.js` (`montarUpsellAcompanhamentos`). `test/gate-pro-alerta.test.js` (14 testes). Financeiro: firewall acusa `temFeaturesProAtivas`/`is_pro`/`features_pro_ate` de propósito — commit consciente. **Produzida pela rotina matinal de 2026-08-20 no regime ESTOQUE** (primeira leva do novo Plano B — `estoque/0001_2026-08-20_cod-0074/`, aplicada via `node scripts/estoque.mjs aplicar 1`); entregue junto com a adoção da própria ferramenta (`e6bc992`). **⚠️ mudança visível:** usuário Free que já tinha acompanhamento/teto configurado para de receber o alerta proativo (config fica salva, volta a alertar se o Pro voltar). **Destrava:** cod-0075 (`depende-de` satisfeito; segue `aguardando-decisao`, achado da rotina de 08-21 diz que a premissa dela não se sustenta). *(skills: code-decisions, tdd, financial-firewall, copywriter, copy-review)*
- **cod-0073 · Gate Pro no `/comparar`** (commit `ba1c508`, 2026-08-20) — fecha o achado **B10 🔴** do Checkpoint N2 de 01/08 (o comparativo entre mercados era idêntico pra Free e Pro; na prática R$9,90/mês comprava só "cupons ilimitados"). Free: teaser de `COMPARATIVO_AMOSTRAS_FREE` (default 3) + upsell honesto, só quando há mais comparativo pra ver (`resultado.temMais`). Pro (`temFeaturesProAtivas` — assinante OU janela de recompensa de indicação): até `COMPARATIVO_MAX_PRO` (default 10), sem upsell. `montarMensagemComparativo(resultado, opts = {})` retrocompatível byte a byte com a chamada de 1 argumento. `src/index.js`, `src/formatter.js`, `src/supabase.js` (só comentário). `test/comparativo-gate.test.js` (11 testes). Financeiro: firewall acusa `temFeaturesProAtivas`/`ehPro`/`COMPARATIVO_MAX_PRO`/`is_pro`/`features_pro_ate` de propósito — commit consciente. Pré-req humano não-bloqueante: `COMPARATIVO_MAX_PRO=10` no Railway/`.env.example` (default no código já é 10). **Pendência aberta:** cod-0075 é quem fecha o vazamento equivalente na intent do Agente (`intents.js:596` ainda usa o teto Free pra todos). *(skills: code-decisions, tdd, financial-firewall, copywriter, copy-review, product-principles)*
- **cod-0062a · Blindagem de agregação — `tipo`/`direcao` explícitos em toda leitura de gasto** (commit `378e2be`, 2026-08-15) — `filtroGasto()`/`aplicarFiltroGasto()` centralizam o filtro que 5 leituras aplicavam na mão (`.eq('tipo','mercado')`) e 5 outras (`buscarComprasDoMes`, `buscarHistorico` — as que alimentam `/gastos` e o resumo mensal) **não aplicavam nenhum**; sem isso, um comprovante de PIX (`tipo='pix'`, quando a cod-0062 gravar) entraria no total do mês como se fosse compra. `TIPOS_GASTO`/`TIPOS_MERCADO` cobrem 100% do que existe hoje — nenhum número muda. Filtro de `direcao` fica atrás de um probe de existência da coluna (ainda não existe — migration da cod-0062 pendente), padrão anti-A9. Cada `.from('compras')` ganhou marcador `// filtro-gasto: aplicado | nao-se-aplica` + teste de guarda que reprova leitura nova sem marcador. `src/supabase.js`. `test/filtro-gasto.test.js` (18 testes). Fatiada autonomamente da cod-0062 em 08-07 (achado de varredura, não do desenho); ficou 8 dias no working tree entupindo a rotina matinal antes desta entrega. Financeiro: firewall acusa só a palavra "PIX" em comentário — zero lógica de pagamento. Pendências de ratificação: (a) `insights.js` não tocado de propósito; (b) `listarUsuariosAtivosNoMes`/`buscarElegiveisInativos` não filtram (medem atividade, não gasto). *(skills: code-decisions, tdd, product-principles, financial-firewall)*
- **cod-0025 · Bugfix — onboarding tranca os comandos de pagamento [A3]** (commit `548468f`, 2026-08-05) — `/planos` e `/pix` (+ `/ajuda`, `/privacidade`) agora respondem mesmo nos steps 0–1 do onboarding, roteados ANTES do gate (mesmo padrão do `/apagar`); onboarding não é abortado, retoma no passo em que estava. `src/index.js`. `test/onboarding-comandos.test.js` (11 testes). Financeiro: roteia comandos de pagamento — commit consciente. *(skills: debugging, code-decisions, tdd, automation-triage, financial-firewall)*
- **cod-0067 · Copy pós-MP no `/pix`** (commit `689c9ae`, 2026-08-05) — remove promessas que o produto não cumpre mais desde a saída do Mercado Pago (cartão, renovação automática) e alinha o texto ao fluxo PIX-manual vigente. `src/formatter.js`. `test/pix-copy.test.js` (8 testes). Financeiro: copy de pagamento — commit consciente. *(skills: copywriter, copy-review, financial-firewall, code-decisions, tdd)*
- **cod-0044 + cod-0048 · Agente — sugestões pós-resposta + gráfico sob demanda** (commit `41beafe`, 2026-08-07) — **cod-0044:** cada intent do REGISTRO pode declarar `sugestoes[]`; `render.responder` anexa no máximo 1 sugestão contextual pós-fidelidade ("💡 Você também pode perguntar: ..."), derivada dos `exemplos` do próprio REGISTRO (firewall de promessa por construção), só quando `temDados===true`; helpers `temGiria`/`exemploSemGiria` extraídos de `duvida_sobre_bot` pra uso compartilhado; 7 intents ganharam sugestão. **cod-0048:** intent `mostrar_grafico` ("me mostra o gráfico") entrega **imagem** via `zapi.enviarImagem` (mesmo envio do resumo mensal), reusando `gerarUrlGraficoCategorias` de `charts.js` — sem narração LLM, sem lógica de gráfico duplicada; mês sem compras cai no template de texto honesto; não tocou `src/index.js`/`src/zapi.js` (o envio já existia). `src/agent/intents.js`, `src/agent/render.js`, `src/agent/index.js`, `test/agent-sugestoes.test.js` (16 testes), `test/agent-grafico.test.js` (9 testes), `test/agent-intents.test.js` (inventário 11→12). Commit combinado consciente (`intents.js` compartilhado pelas duas; `git add -p` indisponível neste ambiente). Financeiro: não toca · coração: não toca. Pendências de ratificação: sugestão omitida quando único exemplo do alvo tem gíria/número; sugestão também em "categoria não encontrada" com mês tendo dados; `mostrar_grafico` consome cota como pergunta normal. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0068 · Desliga o reengajamento (mantém só o resumo de fim de mês)** (commit `18a0b45`, 2026-08-05) — cron `executarReengajamento` (D3/D10) desligado — nunca enviou uma mensagem sequer (`lembretes_enviados` nunca existiu, `lembreteFoiEnviado` lançava antes do envio). `executarResumoMensal` (cron dias 28-31) segue intacto e vira a única mensagem proativa do produto. Módulo `src/reengagement.js` fica no repo (reversível, não apagado). `src/scheduler.js`, `src/schemaGuard.js` (tira `lembretes_enviados` das CHECAGENS_CRITICAS). `test/scheduler-reengajamento-off.test.js` (8 testes). Financeiro: não toca. *(skills: code-decisions, tdd, product-principles, automation-triage)*
- **Máquina 3.0 + corpus real + migration PIX preparatória** (commits `2fa59c1`/`67fe676`/`46f9e96`/`8e39333`/`b485ba8`, 2026-08-05) — `/tarefa` e `/entregar` reescritos pro regime de pilha de branches `maquina/*` (LEI 1 linear · LEI 2 teto 3 · LEI 3 main parada); corpus real versionado em `test/corpus/` (3 comprovantes PIX + 6 recibos de Vancouver, pseudonimizados), destravando cod-0062/cod-0065; migration `supabase/migration_2026-08-05_pix_direcao_id_transacao.sql` versionada (⚠️ **ainda NÃO executada no Supabase** — rodar antes do código da cod-0062); allowlist de permissões locais; AGENDA/CLAUDE.md/RELATORIO_MATINAL/CRITICA_LOG reconciliados. Docs: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md`.
- **cod-0043 · Agente — Naturalidade 1: contexto de follow-up** (commit `9c094aa`, 2026-08-05) — memória curta por usuário (`{intent, params, timestamp}`, TTL ~10min, em memória do processo — sem tabela nova, sem migration) pra follow-up tipo "e em junho?" herdar a intent anterior trocando só o período/termo. O contexto só reclassifica — o número continua nascendo no executor determinístico. `src/agent/contexto.js` (novo). `src/agent/periodo.js`/`classifier.js`/`index.js`: integração da memória curta no fluxo do agente. `test/agent-contexto.test.js` (22 testes). Implementada 2026-07-29 pela rotina matinal, ficou 6 dias no working tree entupindo a esteira (Regra 0 do `/tarefa` bloqueava toda run nova) — motivou a mudança pra Máquina 2.1 (modo puxado, mesmo commit de docs `2790e44`). Financeiro: não toca · coração (classificação): não toca. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0035 · Alerta Pro — comando `/teto` + alerta proativo de limite** (commit `df18b53`, 2026-07-28) — fecha a cadeia do Alerta Pro (cod-0030..0035) e a promessa do `/planos`. `/teto <termo|categoria> <valor>` grava `limite_mensal` no acompanhamento (colunas já existiam desde a migration de 07-08 — sem migration nova); alerta automático dispara pós-cupom quando o gasto do mês no alvo atinge o teto, 1×/alvo/mês via `acompanhamentos.alertado_em`. `src/insights.js`: `interpretarTeto`, `verificarTetosEstourados`. `src/formatter.js`: `montarTetoConfirmado/Erro`, `montarAlertaLimite`. `src/supabase.js`: `definirLimiteAcompanhamento`, `marcarAlertaLimiteEnviado` + fix no `salvarAcompanhamento`. `src/index.js`: roteamento `/teto` + `verificarAlertasDeLimite` pós-`salvarCompra`. Número nasce só em `buscarGastoPorAlvo`, nunca no LLM. `test/alerta-limite.test.js` (38 testes) + ajuste em `test/acompanhamentos-io.test.js`. ⚠️ Pendências humanas: ratificar o nome `/teto` · decidir se entra no `/ajuda` · gate Pro segue fora (desdobramento humano). *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0033 · Alerta Pro — comandos `/acompanhar` `/acompanhamentos` `/parar` `/superfluo`** (commit `8588c4b`, 2026-07-27) — 4 comandos finos sobre a I/O do cod-0031 e a lógica pura do cod-0030/0033. `src/insights.js`: `interpretarAcompanhamento(arg)` (categoria×termo pelas 10 CATEGORIAS_VALIDAS; guarda ≥3 chars) + `interpretarSuperfluo(arg, atuais)` (toggle/on|off/listar). `src/formatter.js`: `montarAcompanharConfirmado/Erro/Parado`, `montarListaAcompanhamentos` (R$ do mês por alvo; distingue "sem itens" de "não consegui somar"), `montarSuperfluoConfirmado/Config/Invalido`. `src/index.js`: roteamento (`/acompanhamentos`+alias `/meusalertas`; `/acompanhar` `/parar` `/superfluo` por `palavras[0]`) + 4 handlers, enriquecendo via `buscarItensDoMes`+`buscarGastoPorAlvo`. `test/acompanhamentos-comandos.test.js` (20 testes). ⚠️ `/limite <termo> <valor>` NÃO implementado (desvio consciente): colide com o `/limite` atual (status de cupons) e é a config do alerta proativo (cod-0035, fora-de-escopo). *(skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall)*
> **Concluído histórico — arquivado.** Detalhe integral no snapshot `Economizei app/arquivo-historico/AGENDA_arquivo_2026-07-15.md` (curadorias 2026-07-16, 2026-07-27 e 2026-08-15 — teto de 10 estourado, migradas cod-0061/cod-0034/cod-0032/cod-0053):
> - **Entrega 07-13** (6 tarefas): cod-0021+0024 (`7082535`) · cod-0022 (`473ea18`) · cod-0031 (`86dbb64`) · cod-0040 (`0dc9159`) · cod-0050 (`0b81181`) · docs (`9182b91`).
> - **Entrega 07-16** (4 tarefas): cod-0041+0042 (`c355d74`) · cod-0051 (`38689b9`) · cod-0052 (`a40110f`) · docs (`73f8cce`).
> - **Até 07-08** (14 tarefas): Agente (cod-0010..0017), `/comparar` (cod-0020), `/apagar` (cod-0006), classificação/corpus (cod-0026/0027), matching (cod-0030), migrations A4/A9, leva F3/testes (cod-0001..0004). Commits: `b73b15b` · `e8de024` · `4a3c62e` · `e4cc493` · `ddde18c` · `2a83bcd` · `743f2b1` · `8a479c4` · `a795f65` · `d4eaf51`.

---

## 🧊 Backlog (ideias não priorizadas — a máquina NÃO pega daqui)
*(rascunhos. Na sessão de planejamento, você + Opus refinam e sobem pra "Fila pronta")*

**Código (não-financeiro) — vivos:**
- **cod-0007 · Afinar limiares do alerta** (`ALERTA_*`) com base em dados reais — ⏳ **BLOQUEADA POR DADOS**: precisa de compras reais em produção. Não subir antes do lançamento.

*(limpa 2026-07-27: cod-0004, cod-0005, cod-0006 e cod-0008 removidos — todos entregues; detalhe no "Concluído"/snapshot. cod-0018 consolidado na cadeia do Assistente abaixo.)*

**💬 Assistente Conversacional — cadeia (doc-mãe: `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md`):**
*(REVISADO 2026-07-27 — decisão do Gabriel, modo híbrido: o gate de "validada em produção" foi relaxado CONSCIENTEMENTE só pro que é código puro. **cod-0043/0044/0048/0049 subiram pra "Fila pronta"** — a 0049 antecipada com gatilhos pré-programados, gated pelo cod-0035 no `origin/main`. As 4 abaixo SEGUEM gated por dados de produção:)*

- **cod-0045** · Naturalidade 3 — narração LLM menos robótica. **Gate: `fidelidade_ok` estável em produção.**
- **cod-0046** · ÁUDIO — voice note → transcrição → mesmo pipeline (security-lgpd: processa e descarta). **Gate: Agente validado com texto em produção (+ custo Gemini novo).**
- **cod-0047** · Análises novas + filtros compostos no `insights.js`. **Gate: `perguntas_log` dizendo o que pedem.**
- **cod-0018** · Chat aberto / function-calling — **ÚLTIMO da escada** (maior risco de fidelidade numérica). **Gate: `fidelidade_ok` alto + perguntas fora do cardápio no log.**

**🔭 Longo Prazo (2026-07-09 — Empresa BC ADIADA pra OUTUBRO/2026; doc-mãe: `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`):**
*(sementes pro tempo até a abertura da empresa. Regra do Gabriel: NENHUMA sobe pra "Fila pronta" antes da **sessão de desdobramento**. Limpa 07-27: Frente 1 saiu da semente — virou cod-0060✅/0061✅/0062-na-fila; cod-0064 virou cod-0065.)*

- **cod-0063 · Frente 2 — Fundação i18n** — localidade (idioma/moeda) sem mudar o pt-BR. ⚠️ **Gabriel escolheu REPENSAR O CANAL (Plaid/app), não o nicho WhatsApp** — reframe pesado. **Merece sessão própria antes de qualquer código de Frente 2.** Segue semente.

*(limpa 2026-07-27 — Achados da Auditoria 06-25: cod-0020/0021/0022 entregues; cod-0023 virou a cadeia do Alerta Pro. Bloco removido; detalhe no snapshot.)*

**❤️ Alerta Inteligente Pro — cadeia (desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`):**
- ✅ cod-0031/0032/0033/0034 entregues (ver "Concluído"); **cod-0035 na "Fila pronta"** (07-27) — último elo da cadeia.
- **cod-0067 · Copy pós-MP** — o `/pix` ainda termina com "no cartão (/planos) a renovação é automática" (cartão morreu com o MP); varrer `formatter.js` por referências a cartão/assinatura automática e alinhar ao fluxo PIX-manual. Pequena; não priorizada em 07-27.
- **cod-0025 · 🔴 Onboarding tranca comandos de pagamento [A3]** — steps 0–1 tratam todo texto como onboarding → `/planos`/`/pix` não respondem até 1 cupom (bloqueia conversão paga). ⚠️ roteamento de pagamento (`index.js`) → revisão humana atenta no `/entregar`. tipo: bugfix.
- ⚠️ **Humano:** aplicar o **gate Pro desdobrado** (`Gate_Pro_Desdobramento_2026-07-10.md`) — inclui o `/superfluo` configurável gated (decisão 07-27).

**Páginas (foco secundário por enquanto):**
- pag-0001: ajustar `landing/vercel.json` pra páginas novas (`/guias/...`) serem alcançáveis (hoje o catch-all joga tudo pro index). Pré-requisito de qualquer página nova de SEO.
- pag-0002: guia SEO "Como economizar no supermercado".
- pag-0003: guia SEO local "Economizar em Fernandópolis e região".
- pag-0004: variação A/B da headline do hero (`landing/index-b.html`).
- Página "Economizei vs. planilha de Excel" (o concorrente real, segundo a pesquisa).
- **pag-0005 · Microsoft Clarity na landing (analytics de comportamento — heatmap + gravação de sessão, grátis)** — instrumenta a landing pra ver POR QUE o visitante não vira usuário (headline A/B, entendimento do "só foto", alcance do CTA). Não-financeiro (snippet no `<head>` + banner de consentimento LGPD); deploy = Gabriel. Faz mais sentido com tráfego (Meta Ads = out/2026), mas custo ~zero pra instalar cedo. ⚠️ retenção de só 30 dias; Clarity é da **Microsoft** (não Google). Decisões humanas abertas: instalar já ou esperar ads · banner de consentimento já ou depois · rodar GA4 junto. Pesquisa + plano completo: `Economizei app/Microsoft_Clarity_Landing_Analytics_2026-07-26.md`.

---

## 🙋 Ações do Gabriel (só humano resolve — a máquina não consegue)

> Esta seção é o seu painel. Guia: `Economizei app/Automacao_Maquina_Noturna.md`.

**🆕 Financeiro simplificado (2026-07-26 — decisão do Gabriel; plano: `Economizei app/Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`):**
- [x] ~~Firewall → advisory~~ — ✅ ENTREGUE (`4f49ae7`, 2026-07-27).
- [x] ~~Remover código do Mercado Pago (inclusive `git rm src/mercadopago.js`)~~ — ✅ ENTREGUE (`4f49ae7`, 2026-07-27; `/assinar` sem handler = §4.3 da Auditoria FECHADO).
- [ ] **🔴 DROP das colunas/tabela MP no Supabase** — o deploy já aconteceu (push = deploy Railway), então o passo 3 do plano LIBEROU. Rodar no SQL Editor (roteiro no `Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`). Aproveitar pra fechar a §3.3 (query de schema + RPC) na mesma sentada.
- [x] ~~Limpeza fast-follow das funções MP órfãs~~ — ✅ virou **cod-0066 na "Fila pronta"** (2026-07-27, autorização explícita do Gabriel pra máquina executar).
- [x] ~~🔴 Smoke test do webhook auth~~ — ✅ RESOLVIDO (2026-07-27): token no Railway + **URL do Z-API reconfigurada pra `/webhook/<token>`** pelo Gabriel. Rollout do cod-0053 completo (fail-closed ativo). *(Opcional de confiança: mandar 1 `/gastos` pro bot pra confirmar end-to-end.)*

**🩺 Saúde do banco — S2 ✅ FECHADO em 2026-08-07; a bola está no S4** (roteiro com SQL exato: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §3 + o complemento novo `supabase/rls_migration_parte2_2026-08-07.sql`):
- [x] ~~**🔴 S2 · `SUPABASE_SERVICE_ROLE_KEY` não existe no Railway**~~ → ✅ **SETADA pelo Gabriel — confirmado por print em 2026-08-07.** O serviço `Economizei-bot` agora lista 15 envs, com `SUPABASE_SERVICE_ROLE_KEY` entre `SUPABASE_ANON_KEY` e `SUPABASE_URL`. Destrava o S4 e corrige a dedup sem nenhum SQL.
  - ⚠️ **O que o print prova e o que não prova.** Prova que a **variável existe**. NÃO prova que (a) o valor é a `service_role` mesmo (e não a anon colada por engano — as duas são JWT e parecem iguais de relance), (b) houve redeploy depois de setar, nem (c) o bot já está usando. O código faz `SERVICE_ROLE_KEY || ANON_KEY` (`supabase.js:9-11`): se o valor estiver **errado mas presente**, não há fallback — o cliente é criado com chave inválida e **toda query falha**. No print o serviço aparece **"Sleeping"**, então ele ainda não acordou com a env nova.
  - [ ] **🔎 S2-verificar (30 seg, faça antes do S4):** decodificar o JWT da chave e ler o campo `role` — `role: 'service_role'` ✅ · `role: 'anon'` 🚦 pare. Comando e cuidados no roteiro (`Roteiro_SQL_Editor_2026-08-07.md`, passo 0). Alternativa: logs do Railway procurando `supabase_erro` com `fn: registrarMensagemProcessada` (uma por mensagem = ainda em anon).
  - ❌ **Teste anterior era inválido (erro meu, corrigido 2026-08-07):** eu havia proposto "mande a mesma foto 2× e a 2ª deve ser ignorada". A dedup é por **`messageId`** (retry do Z-API), não por conteúdo — duas fotos enviadas pelo usuário são 2 mensagens legítimas e o bot processa as duas. O Gabriel rodou e viu as 2 respostas: **comportamento correto**. E como `registrarMensagemProcessada` é *fail-open*, **nenhum** teste de comportamento pelo WhatsApp distingue anon de service_role — o defeito é silencioso por construção. Regra que fica: **defeito silencioso pede teste de ESTADO, não de comportamento.**
- [x] ~~**🔴 S1 · criar `lembretes_enviados`**~~ → ⚫ **CANCELADO — decisão do Gabriel (2026-08-05): reengajamento fora por agora, só a mensagem de fim de mês.** O defeito era real (`lembreteFoiEnviado` lança quando a tabela falta, o `throw` vem ANTES do `enviarMensagem`, e o `catch` do laço em `reengagement.js:139` só conta o erro → **nenhum lembrete D3/D10 jamais foi enviado**), mas a decisão torna o fix desnecessário: **o que ele quer já está no ar** — `executarResumoMensal` (`monthlySummary.js`, cron `0 9 28-31 * *`) é independente e usa `resumos_mensais_enviados` (A4, já rodada). **Nenhuma ação no Supabase.** Vira a tarefa de código **cod-0068** (desligar o cron + tirar do schema guard). *Registrado sem relitigar: o resumo dispara nos dias 28–31, então não é toque de semana 2 — a W2 passa a medir retenção puramente orgânica.*
- [x] ~~**🔴 S2 (duplicata da linha acima)**~~ — ✅ resolvido 2026-08-07. *(Mantido o registro do diagnóstico, que se provou certo: `service_role` bypassa RLS por completo, então o erro `new row violates row-level security policy` de 07-26 era impossível com a chave certa em uso — a causa era a env ausente, não "falta policy de insert".)*
- [ ] **🟡 S3 · Confirmar a RPC `incrementar_compras_mes`** (auditoria §3.3) — ⚠️ a query 3 do S0 tinha um **bug meu**: `oid` é ambíguo entre `pg_proc` e `pg_namespace`. Versão corrigida (com `p.oid`) no plano §3 S3. A sentinela também serve: procurar `incremento_fallback` nos logs do Railway. Se a RPC não existir, todo cupom usa o read-then-write racy (o parâmetro do `CREATE FUNCTION` **precisa** ser `p_phone_number`).
- [x] ~~**🔴 S4 · Ligar o RLS**~~ → ✅ **FECHADO em 2026-08-18: os 2 scripts rodados** (`rls_migration.sql` + `rls_migration_parte2_2026-08-07.sql` v2). Encerra a exposição que estava aberta desde sempre — até 07/08 quem tivesse a anon key lia os dados de todos os usuários. Era o pré-requisito inegociável de qualquer usuário externo e o bloqueio das cod-0069/0070.
  - [ ] **🔎 Verificação que ainda falta (2 min, não bloqueia nada mas fecha o ciclo):** (a) mande **"oi"** no WhatsApp — se o bot responde, ele está mesmo em `service_role` (se estivesse em anon, o RLS o teria derrubado; **e isso é a prova retroativa do S2**); (b) o `curl` anti-vazamento da verificação 3 do script, com a **anon key**, contra `usuarios`, `compras`, `perguntas_log` e `v_dashboard` — esperado `[]` ou erro. Testar pelo SQL Editor dá falso positivo (o Editor é service_role).
- 📌 **Contexto do achado que motivou o script complementar (mantido por valor histórico):** ⚠️ **Achado de 2026-08-07:** o `supabase/rls_migration.sql` foi escrito quando o projeto era menor e cobre **5 relações** (usuarios, compras, itens_compra, resumos_mensais_enviados, waitlist). O código de hoje usa **15**. Rodar só o original deixa exposto: `acompanhamentos`, `perguntas_log`, `mensagens_processadas`, `indicacoes`, `precos_mercado` — **e as 7 views**. As views são o buraco menos óbvio: view em Postgres roda com o privilégio de **quem a criou**, então `v_dashboard` continua devolvendo os dados mesmo com RLS ligado nas tabelas base (é o achado "security definer view" do linter do Supabase). Sem isso, ligar o RLS **tranca a porta da frente e deixa a lateral aberta**.
  - **Complemento escrito e pronto: `supabase/rls_migration_parte2_2026-08-07.sql`** — RLS + policy nas 5 tabelas faltantes, `security_invoker = on` nas 7 views, `REVOKE` do anon, e 3 verificações no rodapé (incluindo o `curl` com a anon key, que é o único teste que vale — testar pelo SQL Editor dá falso positivo, porque o Editor é service_role e enxerga tudo).
  - **Ordem:** S2-verificar ✅ → `rls_migration.sql` → `rls_migration_parte2_2026-08-07.sql` → mandar "oi" no WhatsApp. **Se o bot parar de responder, ele ainda estava em anon** → `ALTER TABLE <t> DISABLE ROW LEVEL SECURITY;` e volte pro S2.
- [x] ~~**❓ `ADMIN_PHONE` setado?**~~ — ✅ **SIM, confirmado 2026-08-05:** o Gabriel recebeu o aviso do schema guard no WhatsApp. O alarme funciona. *(Lição: 3 alarmes tocaram — schema guard no boot, WhatsApp ao ADMIN, log de erro por usuário a cada execução — e o subsistema ficou morto por semanas. O problema não é falta de alarme; é alarme sem destino de ação.)*
- [x] ~~**`assinatura_eventos`**~~ — ✅ **A TABELA NÃO EXISTE** (S0 query 1 = NULL; `to_regclass` testa existência da relação, **não** se há linhas — nada a ver com "ninguém assinou ainda"). A migration do MP foi aplicada só parcialmente. **Consequência boa: não há tabela pra dropar no S5.** As colunas `assinatura_*`/`mp_preapproval_id` em `usuarios` podem existir ainda — sem urgência (P4 adiado).
- [x] ~~DROP das colunas MP~~ → **adiado conscientemente em 2026-08-05.** Verificado que seria seguro (`upsertUsuario` não seleciona mais as colunas; as 7 funções órfãs têm **zero chamadores** fora do `supabase.js`), mas o valor é cosmético e a operação é irreversível. Ordem correta quando for a hora: liberar a cod-0066 → commit → deploy → **só então** o banco.
- [ ] **🟡 S5 (novo, achado em 2026-08-07 ao rodar o RLS) · as views de métricas não existem no banco.** O `ALTER VIEW v_cupons_por_mes` falhou com `42P01: relation does not exist` — o `supabase/metrics_views.sql` está no repositório mas **nunca foi executado por inteiro**. O `src/supabase.js` referencia `v_dashboard`, `v_funil_conversao` e `v_cupons_por_mes`: as que faltarem devolvem erro em silêncio. **Não quebra o bot** (alimentam métricas, não o fluxo do usuário) — mas é dívida de schema do mesmo tipo do A9. Rodar o diagnóstico do topo do `rls_migration_parte2` mostra quais existem. **Decisão sua:** (a) rodar o `metrics_views.sql` pra criar as que faltam — e então rodar a parte 2 de novo (é idempotente) pra proteger as novas; ou (b) remover as referências mortas do código (vira tarefa de máquina).
- [ ] **(curiosidade)** tabelas em inglês no banco (`price_history`, `products_normalized`, `purchase_items`, `purchases`, `stores`) não são do código do Economizei — provável resíduo de outro experimento. Sem urgência.

**🔬 Do Checkpoint N2 de 2026-08-01 — nunca lidos até 08-07** (doc: `Economizei app/Checkpoint_N2_2026-08-01.md`; a AGENDA dizia "último checkpoint: 07-08" e o resultado ficou 6 dias parado):
- [x] ~~**🔴 B10 · O gate Pro nunca foi ligado**~~ → ✅ **DECIDIDO 2026-08-07: aplicar o desdobramento agora.** Virou **cod-0073** (`/comparar`), **cod-0074** (comandos do Alerta Pro) e **cod-0075** (intent do Agente) na Fila pronta. Descoberta que destravou: o doc de 07-10 diz *"nunca peça pra máquina aplicar isto"* porque o firewall era **bloqueante** na época — desde 26/07 ele é **advisory**, então a máquina pode escrever e você commita consciente. A tarefa ficou 28 dias parada por uma premissa vencida. **Sua parte:** setar `COMPARATIVO_MAX_PRO=10` no Railway e no `.env.example` (o default do código já é 10, então não quebra nada se atrasar) + o commit consciente no `/entregar`.
- [ ] **🟡 B9 · `/planos` ainda promete "alerta preditivo"**, que não existe (é a cod-0049, gated pelo bloco Supabase). A promessa encolheu de falsa pra *parcialmente* falsa com o cod-0033/0035. Decisão: entregar a cod-0049 ou encurtar a promessa.
- [ ] **🟢 B7 · `.env.example` desalinhado** — faltam 4 envs que o código lê (`AGENTE_MODO`, `AGENTE_MODELO`, `LIMITE_PERGUNTAS_FREE`, `COMPARATIVO_AMOSTRAS_FREE`, todas com default seguro) e sobram 4 mortas do MP (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_WEBHOOK_URL`, `MP_BACK_URL`). `.env*` é zona sua.

**🆕 Pendente AGORA:**
- [ ] **🔒 SUBSTITUIR o `.claude/commands/tarefa.md` pelo `Economizei app/tarefa_CORRIGIDO_2026-08-07.md`** (copiar por cima, não editar à mão). O patch do lock **entrou certo**, mas o editor renumerou os passos (o `PASSO 0` virou `1.` e a numeração reinicia no meio) e comeu o `<nome>` de `test/<nome>.test.js`. O arquivo corrigido usa `PASSO 0)`…`PASSO 11)` — prefixo literal que nenhum editor renumera. Detalhe do que quebrou: `Economizei app/PATCH_comandos_lock_2026-08-07.md`. Apagar os dois arquivos depois. *(A rotina agendada já está correta — o prompt dela é editável por ferramenta.)*
- [~] **🗄️ SENTADA NO SQL EDITOR** (`Economizei app/Roteiro_SQL_Editor_2026-08-07.md`) — **PARCIAL em 2026-08-18: o RLS foi feito** (bloco 2, o crítico). **Faltam os 3 blocos baratos**, todos independentes entre si:
  - [ ] **Migration PIX** (`migration_2026-08-05_pix_direcao_id_transacao.sql`) — puramente aditiva, não quebra nada, e é o que **destrava a cod-0062**. Roda ANTES do push do código de PIX (anti-A9).
  - [ ] **S3 — a RPC `incrementar_compras_mes` existe?** Só leitura, query pronta no bloco 3 do roteiro.
  - [ ] **DROP das colunas MP** — irreversível e cosmético; a cod-0066 (limpeza do código) ainda não foi entregue, então a ordem preferida é código → deploy → banco.
- [x] ~~**🧪 Teste do commit no sandbox (5 min, decide a Máquina 3.0 × TREE)**~~ → ✅ **FEITO 2026-08-18 — resultado: NÃO COMMITA.** Rodado em repositórios descartáveis, sem risco pro repo real: `rm` → `Operation not permitted`; `commit #1: OK`; `commit #2: FALHOU` (o `HEAD.lock` órfão da primeira escrita não pode ser apagado). Vale pra `commit`, `checkout -b`, `merge`, `branch -d`. A Máquina 3.0 morreu por evidência e nasceu o **regime ESTOQUE**. Docs: `Veredito_Teste_Commit_Sandbox_2026-08-18.md` + `Plano_B_Estoque_2026-08-18.md`. ~~Texto original:~~ — deixar uma run tentar `git checkout -b maquina/teste` + commit vazio + `git branch -d`, com toda leitura prefixada por `GIT_OPTIONAL_LOCKS=0`. Funcionou → a variante TREE perde a razão de existir e fica um modo só. Falhou → o TREE está justificado por evidência, e a doc para de tratar a 3.0 como regime normal. Ver "🩺 Revisão da máquina" §2.
- [ ] **⚙️ Setar `COMPARATIVO_MAX_PRO=10`** no Railway e no `.env.example` — pré-req do gate Pro (cod-0073). O default do código já é 10, então não quebra se atrasar; fica só invisível pra quem for configurar.
- [ ] **⚖️ Resolver a contradição da cod-0066** (autorizada × revogada, ambas datadas 2026-07-27) — ver a nota na tarefa e em "⏳ Aguardando sua decisão".
- [x] ~~**🔴 Limpar a sujeira de git que a rotina matinal de 2026-08-05 deixou**~~ — ✅ **FEITO na sessão Cowork de 2026-08-05 (noite)**, com permissão de deleção concedida pelo Gabriel: locks `.stale*` apagados, `_lixo_stale_locks/` removida, branch vazia `maquina/cod-0068-0067-0025` apagada (`git branch -d`), git saudável (`main`=`origin/main`=`aa6469c`, fsck limpo). *(Opcional que sobrou: `git gc --prune=now` pros `tmp_obj_*` órfãos.)* **Consequência de método DECIDIDA → regra HÍBRIDA:** rotina agendada (sandbox) = entrega em **working tree / modo TREE, git só-leitura** (nenhum comando git de escrita — é o que travava o repo); Máquina 3.0 completa (commit em branch `maquina/*`) vale nas runs locais via `/tarefa`.
- [x] ~~**📌 O arquivo da tarefa agendada `economizei-rotina-matinal` está DESATUALIZADO**~~ — ✅ **FEITO na mesma sessão:** prompt + descrição reescritos (Máquina 3.0 variante sandbox/TREE, guardas: `.js` sujo OU pilha 3/3 OU `index.lock` = não produz; conflito 2.0×3.0 eliminado). Também: `tarefa_NOVO`/`entregar_NOVO` **instalados** em `.claude/commands/` (pendência do topo da AGENDA fechada). Rotina segue ATIVA (próxima run 8:02).
- [x] ~~**Destravar a cod-0062:** fornecer os 2–3 comprovantes PIX reais~~ — ✅ **ENTREGUES 2026-08-05** (2 PDFs + 1 print de app = 3 layouts distintos). Transcritos e pseudonimizados em `test/corpus/pix/comprovantes.json`. Falta só **rodar a tarefa com você presente** (é coração + o firewall acusa "pix" por design → commit consciente).
- [ ] **Confirmar o payload real de documento da Z-API** (sobra do cod-0061 — mandar um PDF pra si mesmo e olhar o campo/URL).
- *(compactado 07-27: cod-0032/0034/0053/0061 commitados; token+URL do webhook configurados — rollout cod-0053 COMPLETO; enxugamento `882cf6e`.)*

**✅ Estabilização (2026-07-09) — CONCLUÍDA:** A9/A4/migration do agente rodadas + 4 envs no Railway + smoke test end-to-end passou. Detalhe: `Economizei app/Roteiro_Smoke_Test_2026-07-09.md` / snapshot.

**🔍 Auditoria Integral (2026-07-10) — ações suas (doc: `Economizei app/Auditoria_Integral_2026-07-10.md`):**
- [x] ~~**[🔴 §1.4] Aplicar o patch do firewall**~~ — ✅ commitado e pushado (`27fcc16`, reconciliado 2026-07-24 junto com o `/entregar`). 8 tokens novos + `--no-renames` + path `src/hotmart.js`, como planejado.
- [ ] **[🔴 §3.3] Rodar a query de verificação de schema** no SQL Editor (5min) — confirma as migrations antigas nunca verificadas E se a RPC `incrementar_compras_mes` existe em produção (se não existir, todo cupom usa fallback racy em silêncio).
- [x] ~~**[🔴 §4.2 decisão] Copy da indicação promete "alerta inteligente"**~~ — ✅ DECIDIDO (2026-07-27): **entregar o cod-0035 primeiro** (a promessa vira verdade) em vez de reescrever copy. Se o cod-0035 emperrar, reabrir como encurtamento de promessa.
- [x] ~~**[🔴 §4.3 financeiro] `/assinar` gerava checkout Mercado Pago**~~ — ✅ FECHADO (`4f49ae7`, 2026-07-27): MP removido, handler de `/assinar` eliminado, `/planos` aponta pro PIX manual.
- [x] ~~**[🟡 §2.3] Logar o fallback do incremento**~~ — ✅ feito 2026-07-24 (`log('incremento_fallback', {fn, phone: maskPhone, erro})` no `if (erroUpdate)` de `salvarCompra`, sentinela do lost-update racy; commit consciente). Deixa em aberto só a §3.3 (verificar a RPC no Supabase) — se a sentinela disparar, é lá que se resolve.
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
- [x] ~~**Verificar CHECK em `compras.tipo`**~~ — ✅ **RESPONDIDO 2026-08-05 sem precisar do banco:** `migration_2026-06-07_coerencia_outputs.sql` faz só `ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'mercado'` — **não existe CHECK**. Logo `tipo='pix'` grava hoje, **zero migration**.
- [x] ~~**Fornecer 2–3 comprovantes de PIX reais**~~ — ✅ ENTREGUES 2026-08-05 (ver acima).
- [ ] **🔴 🆕 RODAR A MIGRATION `supabase/migration_2026-08-05_pix_direcao_id_transacao.sql`** — autorizada por você em 2026-08-05. Adiciona `compras.direcao` (default `'saida'` — histórico intacto) e `compras.id_transacao` + índice único parcial. **Roda ANTES do push da cod-0062** (push = deploy no Railway; código lendo coluna inexistente = incidente A9). Query de verificação no rodapé do arquivo.
- [ ] **🆕 Fornecer 1 fatura de cartão real (sua)** pro corpus da **cod-0072** — dá pra escrever prompt e parser sem ela, mas não dá pra afirmar que funciona. É o mesmo pré-requisito que segurou a cod-0062/0065 por 3 semanas.
- [ ] **Confirmar o payload de documento da Z-API** — mande um PDF pra você mesmo e veja o campo/URL (o desenho assume `body.document`/`documentUrl`; validar no payload real).

**🇨🇦 Modo recibo Canadá (cod-0065) — o que só você/legal resolve (a máquina entrega a leitura, não isto):**
*(insights: `Economizei app/Economizei_Vancouver_Recibos_2026-07-09.md`)*
- [x] ~~**Fornecer 2–3 recibos reais de Vancouver**~~ — ✅ **ENTREGUES 2026-08-05: 6 recibos** (No Frills ×2, Independent, Shoppers, Dollarama, Revs boliche). Em `test/corpus/canada/` com as fotos. Cobrem 4 formatos de data, GST/PST separados, item por peso, desconto de fidelidade e serviço sem produto.
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

- [ ] **[Máquina 2.0 — LEMBRETE do Gabriel, 2026-07-27] Run pesada de sábado** — aprovada em princípio, mas SÓ entra depois do piloto. **Gatilho: 10 runs da rotina matinal com o teto novo** → revisar as métricas do RELATORIO (tarefas/run, linhas de diff, tempo de revisão, taxa de descarte) e decidir se cria a rotina de sábado (1 lote grande do lastro por semana). Doc: `Economizei app/Analise_Maquina_Pesada_e_Lotes_2026-07-27.md`.
- [x] ~~**cod-0066 — a AGENDA se contradizia sobre a autorização**~~ — ✅ **ARBITRADO em 2026-08-07: vale a autorização.** A restrição "nada de apagar MP" fica **só pro lastro**; a cod-0066 voltou pra `pronta`. *(Ficou 11 dias em limbo porque duas anotações da mesma data diziam o oposto e ninguém arbitrou — a máquina, na dúvida, obedeceu a mais restritiva.)*

*(Já resolvidos [x] — encurtamento, open questions + pré-reqs do Agente (migration/envs rodadas 07-09), comparativo Pro+teaser, sequência §4, pricing Free×Pro, migration do alerta pro, classificação, prova de anual na landing — preservados no snapshot `arquivo-historico/AGENDA_arquivo_2026-07-15.md`.)*

**Decisões da sessão de desdobramento (2026-08-05) — RESPONDIDAS pelo Gabriel na mesma sessão. Doc: `Economizei app/Frente1_Frente2_App_Desdobramento_2026-08-05.md` §4:**
- [x] ~~1. `total` com resgate de pontos~~ → ✅ **vale o valor PAGO (54,78)**; o impresso vira `total_bruto` e é ele quem reconcilia os itens. Aplicado na cod-0065 e no corpus.
- [x] ~~2. Coluna `id_transacao`~~ → ✅ **AUTORIZADA.** SQL escrito: `supabase/migration_2026-08-05_pix_direcao_id_transacao.sql` (roda ANTES do push da cod-0062).
- [x] ~~3. PIX recebido~~ → ✅ **registrar marcado como ENTRADA** (`compras.direcao='entrada'`), nunca contando como gasto. Coluna na mesma migration.
- [ ] **4. Regime de revisão greenfield** pro `painel/` (Fase B, cod-0070): rodar acima do teto de linhas e revisar por comportamento, já que a pasta é isolada e descartável? — **ÚNICA AINDA ABERTA** (só vira urgente quando a cod-0069 destravar).
- [x] ~~5. Fatura de cartão~~ → ✅ **entra agora, em paralelo ao PIX** (*"vamos testando e estabilizando com o tempo"*). Virou **cod-0072** na Fila pronta.

**Decisões / pendências humanas ainda ABERTAS:**
- [x] ~~**[Longo Prazo] Sessão de desdobramento das Frentes 1 e 2**~~ — ✅ **FEITA em 2026-08-05** (material humano chegou + canal decidido: app = 2º canal, não substituto). Sementes viraram tarefa: cod-0062/cod-0065 destravadas, cod-0069/0070/0071 criadas.
  - *(o que a sessão respondeu: canal fora do Brasil = **PWA/app como 2º canal**, não Plaid nem substituição do WhatsApp; sensibilidade da fatura segue aberta — é a decisão 5 acima. Contexto original: `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`.)*
- [ ] **[financeiro — ADIADO out/2026] Webhook Hotmart → `/admin/ativar-pro`** + **atualizar `formatter.js` com pricing anual/Hotmart** (`/planos` e `/assinar` ainda só mensal/MP) — zona financeira, você faz e revisa.
- [x] ~~**[Alerta Pro — decisão fina]** bloco de supérfluo: todos ou só Pro?~~ — ✅ DECIDIDO (2026-07-27): **baseline pra todos; `/superfluo` configurável gated no Pro** (aplicar junto com o gate Pro desdobrado — `Gate_Pro_Desdobramento_2026-07-10.md`, mão do Gabriel).
