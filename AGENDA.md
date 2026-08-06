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
**🎯 Estado (2026-07-27):** `origin/main` = HEAD = `aebb24a` (cod-0033 `8588c4b` + financeiro `4f49ae7` + docs `8ad9d4f`). Working tree limpo. Último checkpoint integral: **2026-07-08 (Nível 2, 🟡→🟢)** — `Economizei app/Sistema_Checkpoints_Benchmarks_2026-06-30.md`.
**🗄️ Migrations:** pendências antigas rodadas (A4/A9 + agente + alerta pro); **pós-deploy do MP: DROP das colunas/tabela MP no Supabase liberado** (ordem código→deploy→banco cumprida até o deploy).
**🚨 Foco (2026-08-05, sessão de desentupimento):** a esteira está parada há **~6 dias** — working tree sujo com o cod-0043 desde 29/07 (Regra 0 bloqueia toda run), último commit 28/07. **Ordem de ataque:** (1) `npm run check` + `/entregar` o cod-0043 → tree limpo; (2) bloco Supabase S0–S4 (🔴 `lembretes_enviados` = reengajamento morto; 🔴 chave service_role/RLS) — ver 🩺 em "Ações do Gabriel"; (3) fila reordenada: cod-0067 e cod-0025 no topo, cod-0044/0048/0049 no fim. **Decisões pendentes suas:** escolher B1/B2/B3 pro gargalo estrutural + autorizar o ajuste do `.claude/commands/tarefa.md` (runs morrem antes de gravar estado). Plano completo: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md`.

**🎯 Foco anterior (2026-07-27, sessão de repriorização):** fila reabastecida com **cod-0035** (alerta de limite — desbloqueada por cod-0031✅+0033✅) e **cod-0066** (limpeza MP órfãs — autorizada pelo Gabriel, zona advisory), pra rotina matinal voltar a produzir; **cod-0062/cod-0065 seguem aguardando material humano** (comprovantes/recibos reais). Decisões da sessão: supérfluo = baseline pra todos (`/superfluo` config gated Pro); §4.2 resolve-se ENTREGANDO cod-0035 (promessa vira verdade). §4.3 (`/assinar`/MP) ✅ FECHADO em `4f49ae7`. Doc: `Economizei app/Sessao_Repriorizacao_Fila_2026-07-27.md`.
**📌 Pointers:** Pilares `Pilares_do_Negocio_2026-06-30.md` · Mapeamento `Mapeamento_Geral_Pendencias_2026-06-24.md` · Auditorias `Auditoria_Codigo_Direcao_2026-06-25.md` + `Auditoria_Integral_2026-07-10.md`.

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
2. **Checa a esteira:** working tree com código (`.js`/`.mjs`) de leva anterior não-commitada → **não implementa**; relata "esteira entupida" e para (docs `.md`/PAINEL sujos não contam).
3. Vai em **`## 🌙 Fila pronta`** e seleciona trabalho de cima pra baixo (ordem = prioridade) respeitando o **TETO POR RUN (Máquina 2.1, 2026-08-05): 1 tarefa porte P, ≤ ~150 linhas de diff.** Excepcionalmente 1 porte M ou 1 lote (`lote:` igual), mas **só se o Gabriel pedir explicitamente na sessão**. Porte G / ambígua / coração / pré-req humano: não pega (relata o plano e segue adiante na fila). *(Racional do teto menor: entrega que cabe em 10–15min de revisão vira hábito; entrega de 40min vira dívida parada no working tree. O teto de ~500 linhas da Máquina 2.0 durou 8 dias e produziu 6 dias de esteira entupida.)*
4. **Fallback:** se nada da Fila pronta for elegível, pega da **`## ⚓ Fila de lastro`** (só testes/revisão/segurança — mesmo teto). Se nem o lastro tiver item, não faz nada.
5. **Carrega as skills de cada tarefa** (campo `skills:`). Se faltar, deriva do **mapa tipo→skills** da seção "🧠 Gatilho de Skills" e aplica durante todo o trabalho.
6. Implementa **com teste** (TDD), faz **auto-revisão adversarial do diff**, roda a rede de segurança, move cada bloco pra **`## 🔧 Em revisão`** (status `em-revisao` + data) e **mostra o diff** — com **mapa tarefa→arquivos** (pro `/entregar` fatiar) e **declarando quais skills usou**.
7. **O Gabriel revisa e commita** (a automação não commita nem dá push).

**Rede de segurança (rode antes de commitar):** `npm run check` = `check-firewall.mjs --working` (financeiro) + `node --test` (testes) + `check-pages.mjs` (páginas).

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
*(a máquina executa de cima pra baixo respeitando o teto por run da **Máquina 2.1** — 1 tarefa porte P, ≤ ~150 linhas. **MODO PUXADO desde 2026-08-05: a rotina automática das 8:02 foi DESLIGADA** — a máquina roda sob demanda, via `/tarefa`, na sessão em que o Gabriel já vai revisar. Racional: a vazão é limitada pela revisão dele (~2–3 levas/semana), não pela produção; o cron diário só gerava run abortada + AGENDA stale.)*


> **📍 Estado da fila (REORDENADA em 2026-08-05 — decisão do Gabriel).** A esteira ficou **~6 dias entupida** (working tree sujo com o cod-0043 desde 29/07; último commit 28/07). Diagnóstico e plano completo: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md`. **O que mudou:** (1) **cod-0043 saiu da fila → "🔧 Em revisão"** — já está implementado no working tree, aguarda `/entregar`; (2) **cod-0044 / cod-0048 / cod-0049 desceram pro FIM da fila** (são refinamentos do Agente em cima de infraestrutura hoje quebrada — ver 🩺 abaixo); (3) **cod-0067 e cod-0025 subiram pro topo** (promessa falsa no ar + bugfix que trava conversão). ⚠️ **cod-0049 ganhou condição nova:** o gate do cod-0035 está satisfeito (`df18b53`), mas ela só é elegível **depois do bloco Supabase** do plano (S0–S4) — o cooldown dela provavelmente pede coluna nova, e o banco está com migration atrasada. 🔴 **Bloqueador de negócio descoberto em 05/08: o reengajamento está 100% morto** (`lembretes_enviados` não existe → `lembreteFoiEnviado` lança → zero lembretes D3/D10 já enviados). Isso desliga o motor de retenção que a métrica W2 mede. Fix humano no Supabase, seção 3 do plano. *(Histórico anterior desta nota migrado pro doc de sessão.)* **cod-0035 saiu daqui → "🔧 Em revisão"** (implementada, aguardando `/entregar`) e **cod-0066 está `pausada`** (autorização revogada). Próxima elegível: **cod-0043**. ⚠️ O gate do **cod-0049** (depende do cod-0035 no `origin/main`) segue valendo — só liberar depois do commit. Contexto original da repriorização: reabastecida em 2 levas — cod-0035 + cod-0066 e, com **APROVO** do Gabriel, a cadeia do Assistente em modo híbrido: **cod-0043 → cod-0044 → cod-0048 → cod-0049** (a 0049 antecipada por decisão dele — gatilhos pré-programados agora, aprimorar com dados depois; **gated até o cod-0035 estar no `origin/main`**). 0045/0046/0047/0018 seguem no backlog gated por produção. **cod-0062/cod-0065 desceram SÓ porque aguardam pré-req humano** (rodar com o Gabriel presente; notas de 07-18 valem). **Ordem dos blocos = prioridade** (o `/tarefa` pega o 1º `status: pronta`; rotina matinal = 1/dia → ~6 dias de produção autônoma). Docs: `Desenho_Alerta_Inteligente_Pro_2026-06-27.md` · `Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md` · `Sessao_Repriorizacao_Fila_2026-07-27.md`.

### [P2] Limpeza — remover funções MP órfãs (código morto)
- id: cod-0066
- tipo: refino-codigo
- porte: P (diff grande porém quase só deleção — revisão mecânica)
- skills: economizei-code-decisions, economizei-tdd, economizei-financial-firewall
- objetivo: apagar as funções MP órfãs (ninguém chama desde `4f49ae7`) e seus exports — `supabase.js`: `setPendentePlano`, `limparPendentePlano`, `salvarAssinaturaPreapproval`, `atualizarStatusAssinatura`, `buscarPorPreapprovalId`, `registrarEventoAssinatura`, `buscarDadosAssinatura`; `formatter.js`: `montarMensagemPedirEmail`, `montarMensagemLinkAssinatura`, `montarMensagemAssinaturaAtivada`, `montarMensagemAssinaturaCancelada`, `montarMensagemEmailInvalido`, `montarMensagemErroAssinatura`, `montarMensagemPagamentoFalhou`, `montarMensagemJaAssinante`.
- nota-de-autorizacao: ~~o Gabriel autorizou explicitamente (manhã de 2026-07-27)~~ → **REVOGADA na mesma data (aprovação da Máquina 2.0): "não quero que nada como apagar os dados do MP seja feito" vale GERAL, não só pro lastro.** Tarefa pausada até o Gabriel liberar.
- arquivos-alvo: `src/supabase.js`, `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `grep` sem nenhuma referência restante às funções removidas (código e testes)
  - NENHUMA função viva alterada (`montarMensagemPix`, `montarMensagemPlanos`, `is_pro` etc. intocados)
  - node --test verde (remover/ajustar testes que cobriam só o código morto)
- fora-de-escopo: `/pix`, `/planos`, qualquer lógica viva de pagamento; comentários históricos no `zapi.js`
- status: pausada

### [P1] Desligar o reengajamento (mantendo só o resumo de fim de mês)
- id: cod-0068
- tipo: refino-codigo
- porte: P
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-automation-triage
- origem: decisão do Gabriel 2026-08-05 — *"vamos deixar de lado a ideia do reengajamento por agora, quero somente a mensagem de final de mês indicando o quanto se gastou"*. Doc: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §3 S1.
- objetivo: (a) desligar o cron de reengajamento (`src/scheduler.js`, `0 10 * * *` → `executarReengajamento`), que hoje só produz erro por usuário porque a tabela `lembretes_enviados` não existe; (b) remover `lembretes_enviados` da lista `CHECAGENS_CRITICAS` do `src/schemaGuard.js` (alarme que grita sem motivo é alarme que se aprende a ignorar — foi assim que este problema passou despercebido).
- arquivos-alvo: `src/scheduler.js`, `src/schemaGuard.js`, `test/`
- criterios-de-aceite:
  - o job de reengajamento não é mais agendado; o log de `jobs:` no boot reflete a lista real
  - `executarResumoMensal` (cron `0 9 28-31 * *`) segue **intacto** — é a única mensagem proativa que fica
  - `lembretes_enviados` fora do schema guard; as demais checagens intactas
  - **NÃO apagar** `src/reengagement.js` nem as funções de `supabase.js` (`lembreteFoiEnviado`, `registrarLembreteEnviado`) — é "por agora", não "pra sempre"; reverter deve custar 2 linhas
  - node --test verde
- fora-de-escopo: apagar módulo/funções; mexer no `monthlySummary.js`; criar a tabela; qualquer coisa de pagamento
- status: pronta

### [P1] Copy pós-MP — tirar as referências a cartão/renovação automática
- id: cod-0067
- tipo: refino-codigo
- porte: P
- skills: economizei-copywriter, copy-review, economizei-financial-firewall, economizei-code-decisions, economizei-tdd
- objetivo: o `/pix` ainda termina com "no cartão (/planos) a renovação é automática" — o cartão morreu junto com o Mercado Pago (`4f49ae7`, 2026-07-26). É promessa falsa em produção hoje. Varrer `formatter.js` por referências a cartão / assinatura automática / renovação automática / `/assinar` e alinhar tudo ao fluxo PIX-manual vigente.
- arquivos-alvo: `src/formatter.js`, `test/`
- criterios-de-aceite:
  - `grep` por "cartão", "assinar", "renovação automática", "Mercado Pago" em `formatter.js` → nenhuma promessa que o produto não cumpre hoje
  - `/pix` e `/planos` descrevem SÓ o que existe: PIX manual, ativação em até 1h
  - nada de gíria (regra 4 da §11); número/preço só com source no CLAUDE.md
  - node --test verde; firewall acusa por design (é copy de pagamento) → commit consciente do Gabriel
- fora-de-escopo: adicionar o ciclo anual ao `/planos` (§4.4 da auditoria — bloqueado até a empresa BC); Stripe/Hotmart; gate Pro
- status: pronta

### [P1] Bugfix — onboarding tranca os comandos de pagamento [A3]
- id: cod-0025
- tipo: bugfix
- porte: P
- skills: economizei-debugging, economizei-code-decisions, economizei-tdd, economizei-automation-triage, economizei-financial-firewall
- objetivo: nos steps 0–1 do onboarding todo texto é tratado como resposta de onboarding, então `/planos` e `/pix` não respondem até o usuário mandar 1 cupom — bloqueia conversão paga de quem chega já querendo assinar. Rotear os comandos de pagamento ANTES do gate de onboarding (mesmo padrão já usado pelo `/apagar`).
- arquivos-alvo: `src/index.js` (roteamento), `test/`
- criterios-de-aceite:
  - usuário em `onboarding_step` 0 ou 1 manda `/planos` → recebe os planos (não a mensagem de onboarding)
  - idem `/pix`, `/ajuda`, `/privacidade`; o onboarding NÃO é abortado — retoma no passo em que estava
  - texto livre (não-comando) segue caindo no onboarding, exatamente como hoje
  - node --test verde; firewall acusa (roteamento de pagamento) → revisão humana atenta no `/entregar`
- fora-de-escopo: redesenhar o onboarding; mudar as mensagens de boas-vindas; qualquer lógica de cobrança
- status: pronta

### [P2] Frente 1 — ler comprovante de PIX (foto/PDF)
- id: cod-0062
- tipo: feature-codigo
- porte: G (coração + pré-req humano — nunca run autônoma)
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-security-lgpd, economizei-financial-firewall
- objetivo: o Gemini classifica o documento (`tipo_documento`); se PIX, extrai valor/data/contraparte e grava como `compras` `tipo='pix'` (contraparte→`loja`, itens=[]), confirmando com o número primeiro.
- arquivos-alvo: `src/gemini.js` (campo `tipo_documento` + ramo PIX no prompt e no `validarSchema`), `src/supabase.js` (`salvarCompra` aceita `tipo='pix'` + **trocar guard de `precos_mercado` pra `=== 'mercado'`**), `src/formatter.js` (`montarConfirmacaoPix`), `test/` (+ mini-corpus PIX)
- criterios-de-aceite:
  - comprovante PIX (imagem/PDF) → `tipo_documento='pix'`, valor/data/contraparte extraídos; `salvarCompra` grava `tipo='pix'` com itens vazios
  - PIX NÃO entra em `calcularMedia` nem em `precos_mercado` (o guard virou `=== 'mercado'`)
  - **corpus de cupom continua verde** (coração intacto); mini-corpus PIX verde; confirmação com R$ no topo, sem gíria
  - node --test verde; firewall verde (token "pix" acusa de propósito — commit consciente)
- fora-de-escopo: insight/query dedicado de PIX; fatura; gate Pro; i18n; persistir moeda
- depende-de: cod-0061 (✅ `e7f236d`); **pré-req humano: 2–3 comprovantes PIX reais do Gabriel pro mini-corpus** (sem eles, código pronto mas validação incompleta — como o cod-0065)
- nota (2026-07-18): a rotina matinal NÃO pegou esta de propósito — grande demais pra run autônoma (prompt do Gemini = coração + firewall acusa "pix" por design + falta o mini-corpus). Rodar com você presente.
- status: pronta

### [P2] Modo recibo Canadá (Vancouver) — entender e armazenar qualquer recibo
- nota (2026-07-15): DESCEU na prioridade — a decisão de Frente 2 virou "repensar o canal" (Plaid/app), então o Canadá-via-WhatsApp não está confirmado; a leitura de recibo é canal-agnóstica e segue útil como groundwork, mas espera os seus 2–3 recibos reais + a sessão de canal.
- id: cod-0065
- tipo: feature-codigo
- porte: G (coração + pré-req humano — nunca run autônoma)
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

> **⬇️ FIM DA FILA — cadeia de refinamento do Agente (rebaixada em 2026-08-05, decisão do Gabriel).** As três abaixo são código puro, sem migration e sem risco técnico — **podem continuar na fila**, mas desceram porque são polimento de um agente que ainda não tem usuário, enquanto a infraestrutura por baixo está com problemas abertos (ver 🩺 "Saúde do banco" em "Ações do Gabriel"). Racional completo: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §1.

### [P3] Agente — Naturalidade 2: sugestões pós-resposta
- id: cod-0044
- tipo: feature-codigo
- porte: P
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: cada intent do REGISTRO pode declarar `sugestoes[]`; a resposta termina com **no máx. 1 sugestão contextual** ("Quer ver o comparativo entre mercados? É só perguntar.") derivada do registro — custo zero de LLM.
- arquivos-alvo: `src/agent/intents.js` (campo `sugestoes` por intent), `src/agent/render.js` (anexar ≤1 sugestão), `test/`
- criterios-de-aceite:
  - ≤1 sugestão por resposta; SÓ quando a resposta teve dados (`temDados` true) — nunca em erro/estado-vazio
  - sugestão só aponta pra intent que EXISTE no REGISTRO (firewall de promessa: nada de feature inexistente); sem gíria
  - intents sem `sugestoes[]` seguem idênticas; node --test verde
- fora-de-escopo: personalização por histórico de uso; rotação/A-B de sugestões
- status: pronta

### [P3] Agente — gráfico sob demanda
- id: cod-0048
- tipo: feature-codigo
- porte: P
- skills: economizei-code-decisions, economizei-tdd, economizei-product-principles, economizei-copywriter, copy-review, economizei-financial-firewall
- objetivo: intent `mostrar_grafico` — "me mostra o gráfico" envia o gráfico de categorias do mês **reusando `charts.js`** (o mesmo do resumo mensal), sem duplicar lógica.
- arquivos-alvo: `src/agent/intents.js` (+1 intent), wiring de envio de imagem (`src/index.js`/`src/zapi.js` — reusar o envio que o resumo mensal já usa), `test/`
- criterios-de-aceite:
  - "me mostra o gráfico" / "gráfico dos gastos" → imagem do gráfico de categorias do mês atual
  - mês sem compras → resposta de texto honesta (nunca imagem quebrada); `charts.js` não duplicado
  - consome cota como pergunta normal (proposta — ratificar na revisão); node --test verde
- atencao-de-revisao (2026-08-05): mexe em `src/index.js`/`src/zapi.js` — o mesmo terreno do `autenticarWebhook` (cod-0053). Revisar o wiring do envio com atenção extra no `/entregar`.
- fora-de-escopo: períodos arbitrários; tipos novos de gráfico; gráfico no follow-up do cod-0043
- status: pronta

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

## 🔧 Em revisão
*(a máquina move pra cá ao abrir um PR — esperando o Gabriel revisar/commitar)*

*(vazia — última tarefa, cod-0043, entregue em 2026-08-05, ver reconciliação abaixo)*

> **✅ RECONCILIADO em 2026-08-05 (comando `/entregar`):** **cod-0043** commitado e pushado (`origin/main` sincronizado, working tree limpo, 482/482 testes verdes, `npm run check` verde antes do commit e no pre-push): `9c094aa`. Entregue na mesma sessão que os docs (Máquina 2.1 modo puxado + desentupimento da esteira + checkpoints, `2790e44`). Sem conflito de arquivo entre grupos — staging direto, sem `git add -p`. Detalhe preservado em "✅ Concluído" abaixo. Seção esvaziada.

> **✅ RECONCILIADO em 2026-07-28 (comando `/entregar`):** **cod-0035** commitado e pushado (`origin/main` sincronizado, working tree limpo, 460/460 testes verdes, `npm run check` verde antes de cada commit e no pre-push): `df18b53`. Entregue na mesma sessão que os docs (senso crítico + Máquina 2.0 + repriorização, `e700ed6`) e o allowlist local (`600db9d`). Sem conflito de arquivo entre grupos — staging direto, sem `git add -p`. Detalhe preservado em "✅ Concluído" abaixo. Seção esvaziada.

> *(Notas de reconciliação de 07-13/07-16/07-24/07-27 migradas pro snapshot em 2026-07-27 — curadoria.)*

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

- **cod-0043 · Agente — Naturalidade 1: contexto de follow-up** (commit `9c094aa`, 2026-08-05) — memória curta por usuário (`{intent, params, timestamp}`, TTL ~10min, em memória do processo — sem tabela nova, sem migration) pra follow-up tipo "e em junho?" herdar a intent anterior trocando só o período/termo. O contexto só reclassifica — o número continua nascendo no executor determinístico. `src/agent/contexto.js` (novo). `src/agent/periodo.js`/`classifier.js`/`index.js`: integração da memória curta no fluxo do agente. `test/agent-contexto.test.js` (22 testes). Implementada 2026-07-29 pela rotina matinal, ficou 6 dias no working tree entupindo a esteira (Regra 0 do `/tarefa` bloqueava toda run nova) — motivou a mudança pra Máquina 2.1 (modo puxado, mesmo commit de docs `2790e44`). Financeiro: não toca · coração (classificação): não toca. *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0035 · Alerta Pro — comando `/teto` + alerta proativo de limite** (commit `df18b53`, 2026-07-28) — fecha a cadeia do Alerta Pro (cod-0030..0035) e a promessa do `/planos`. `/teto <termo|categoria> <valor>` grava `limite_mensal` no acompanhamento (colunas já existiam desde a migration de 07-08 — sem migration nova); alerta automático dispara pós-cupom quando o gasto do mês no alvo atinge o teto, 1×/alvo/mês via `acompanhamentos.alertado_em`. `src/insights.js`: `interpretarTeto`, `verificarTetosEstourados`. `src/formatter.js`: `montarTetoConfirmado/Erro`, `montarAlertaLimite`. `src/supabase.js`: `definirLimiteAcompanhamento`, `marcarAlertaLimiteEnviado` + fix no `salvarAcompanhamento`. `src/index.js`: roteamento `/teto` + `verificarAlertasDeLimite` pós-`salvarCompra`. Número nasce só em `buscarGastoPorAlvo`, nunca no LLM. `test/alerta-limite.test.js` (38 testes) + ajuste em `test/acompanhamentos-io.test.js`. ⚠️ Pendências humanas: ratificar o nome `/teto` · decidir se entra no `/ajuda` · gate Pro segue fora (desdobramento humano). *(skills: code-decisions, tdd, product-principles, copywriter, copy-review, financial-firewall)*
- **cod-0033 · Alerta Pro — comandos `/acompanhar` `/acompanhamentos` `/parar` `/superfluo`** (commit `8588c4b`, 2026-07-27) — 4 comandos finos sobre a I/O do cod-0031 e a lógica pura do cod-0030/0033. `src/insights.js`: `interpretarAcompanhamento(arg)` (categoria×termo pelas 10 CATEGORIAS_VALIDAS; guarda ≥3 chars) + `interpretarSuperfluo(arg, atuais)` (toggle/on|off/listar). `src/formatter.js`: `montarAcompanharConfirmado/Erro/Parado`, `montarListaAcompanhamentos` (R$ do mês por alvo; distingue "sem itens" de "não consegui somar"), `montarSuperfluoConfirmado/Config/Invalido`. `src/index.js`: roteamento (`/acompanhamentos`+alias `/meusalertas`; `/acompanhar` `/parar` `/superfluo` por `palavras[0]`) + 4 handlers, enriquecendo via `buscarItensDoMes`+`buscarGastoPorAlvo`. `test/acompanhamentos-comandos.test.js` (20 testes). ⚠️ `/limite <termo> <valor>` NÃO implementado (desvio consciente): colide com o `/limite` atual (status de cupons) e é a config do alerta proativo (cod-0035, fora-de-escopo). *(skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall)*
- **cod-0053 · Segurança — autenticação do webhook Z-API** (commit `6cadcb8`, 2026-07-24) — fecha o N1 da Auditoria Externa 07-17 (`/webhook` aceitava payload forjado de qualquer origem). `autenticarWebhook(req)`: segredo no path (`/webhook/<token>`) ou header `x-webhook-token`; sem `ZAPI_WEBHOOK_TOKEN` = modo aberto (rollout sem downtime), com a env = fail-closed (401). `test/webhook-auth.test.js` (9 testes). ⚠️ Pendência humana: gerar+setar `ZAPI_WEBHOOK_TOKEN` no Railway e reconfigurar a URL do webhook no Z-API pra `/webhook/<token>` — NESSA ORDEM (ver "Ações do Gabriel"). *(skills: code-decisions, tdd, security-lgpd, financial-firewall)*
- **cod-0032 · Alerta Pro — bloco de gasto supérfluo no `/gastos` e resumo mensal** (commit `d2cc3c4`, 2026-07-24) — `montarBlocoSuperfluo` via `buscarGastoSuperfluo` (cod-0030) + baseline doces/bebidas (cod-0031 ✅ `86dbb64`); número primeiro, sem moralizar; 3 estados honestos (sem análise → some / gastou mas nada supérfluo → "bom sinal" / com dados → valor+%). `monthlySummary.js` passou a reusar `dadosCat` pro gráfico logo abaixo (antes buscava de novo). `test/superfluo-bloco.test.js` (13 testes). ⚠️ Pendência humana: gate Pro (baseline pra todos ou só Pro? — ver "Aguardando sua decisão"). *(skills: code-decisions, tdd, copywriter, copy-review, product-principles, financial-firewall)*
- **cod-0034 · Agente — intent `gasto_por_termo`** (commit `d3e0169`, 2026-07-24) — "quanto gastei em cerveja?" via `buscarGastoPorAlvo` (cod-0030); o número nasce só no executor, nunca no LLM. 4 estados-vazios honestos e distintos: sem termo / mês sem compras / termo sem match / erro de leitura. Nova leitura `buscarItensDoMes` em `supabase.js` (desvio consciente do arquivos-alvo original, revisado na entrega). `test/agent-gasto-por-termo.test.js` (14 testes). Inclui também o log `incremento_fallback` em `salvarCompra` (auditoria 07-10 §2.3, mesmo arquivo). *(skills: code-decisions, tdd, copywriter, copy-review, financial-firewall)*

- **cod-0061 · Frente 1 — receber documento (foto/PDF) no webhook** (commit `e7f236d`, no `origin/main` — reconciliado pela rotina matinal 07-18) — `baixarDocumento` no `zapi.js`, `validarPayloadWebhook` reconhece `body.document`, gate de MIME (`image/*`+PDF) e roteamento pro MESMO pipeline de recibo via núcleo `processarReciboRecebido`; mensagem honesta de MIME não suportado; `test/webhook-documento.test.js` (11 testes). ⚠️ Pendência que sobrevive ao commit: **confirmar o payload real de documento da Z-API em produção** (parser defensivo `documentUrl`/`url`/`fileUrl`). *(skills: code-decisions, tdd, security-lgpd, financial-firewall, copywriter)*

> **Concluído histórico — arquivado.** Detalhe integral no snapshot `Economizei app/arquivo-historico/AGENDA_arquivo_2026-07-15.md` (curadorias 2026-07-16 e 2026-07-27):
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

**🩺 Saúde do banco — REPRIORIZADO EM 2026-08-05 (virou o foco; roteiro com SQL exato: `Economizei app/Plano_Desentupimento_e_Supabase_2026-08-05.md` §3):**
- [x] ~~**🔴 S1 · criar `lembretes_enviados`**~~ → ⚫ **CANCELADO — decisão do Gabriel (2026-08-05): reengajamento fora por agora, só a mensagem de fim de mês.** O defeito era real (`lembreteFoiEnviado` lança quando a tabela falta, o `throw` vem ANTES do `enviarMensagem`, e o `catch` do laço em `reengagement.js:139` só conta o erro → **nenhum lembrete D3/D10 jamais foi enviado**), mas a decisão torna o fix desnecessário: **o que ele quer já está no ar** — `executarResumoMensal` (`monthlySummary.js`, cron `0 9 28-31 * *`) é independente e usa `resumos_mensais_enviados` (A4, já rodada). **Nenhuma ação no Supabase.** Vira a tarefa de código **cod-0068** (desligar o cron + tirar do schema guard). *Registrado sem relitigar: o resumo dispara nos dias 28–31, então não é toque de semana 2 — a W2 passa a medir retenção puramente orgânica.*
- [ ] **🔴 S2 · O bot provavelmente roda com a chave `anon`, não `service_role`.** Diagnóstico de 07-26 ("falta policy de insert") estava errado: `service_role` **bypassa RLS por completo**, logo o erro `new row violates row-level security policy` seria impossível se a chave certa estivesse em uso. Conclusão: `SUPABASE_SERVICE_ROLE_KEY` ausente/inválida no Railway → fallback pra anon (`supabase.js:8-11`). **Duas consequências:** (a) dedup desligada; (b) como o bot funciona, o `rls_migration.sql` **nunca foi rodado** → hoje quem tiver a chave anon lê os dados de todos os usuários. Verificação: 2 min no Railway → Variables. **Fechar antes de Fernandópolis (LGPD).**
- [ ] **🟡 S3 · Confirmar a RPC `incrementar_compras_mes`** (auditoria §3.3). A sentinela já existe: procurar `incremento_fallback` nos logs do Railway. Se aparecer, a RPC não existe e todo cupom usa o read-then-write racy. SQL de recriação no plano (parâmetro **precisa** ser `p_phone_number`).
- [ ] **🟢 S4 · Ligar o RLS de verdade** (`supabase/rls_migration.sql` + as 6 tabelas criadas depois). **SÓ depois do S2 confirmado** — rodar antes derruba o bot inteiro.
- [ ] **❓ Conferir se `ADMIN_PHONE` está setado no Railway.** O `schemaGuard` (cod-0050) já manda WhatsApp a cada boot listando o que falta no banco (`index.js:1170`). Se você nunca recebeu "⚠️ Guarda de schema: faltando no banco → lembretes_enviados", o alarme que você mandou construir está mudo desde que nasceu.
- [x] ~~DROP das colunas MP~~ → **adiado conscientemente em 2026-08-05.** Verificado que seria seguro (`upsertUsuario` não seleciona mais as colunas; as 7 funções órfãs têm **zero chamadores** fora do `supabase.js`), mas o valor é cosmético e a operação é irreversível. Ordem correta quando for a hora: liberar a cod-0066 → commit → deploy → **só então** o banco.
- [ ] **(curiosidade)** tabelas em inglês no banco (`price_history`, `products_normalized`, `purchase_items`, `purchases`, `stores`) não são do código do Economizei — provável resíduo de outro experimento. Sem urgência.

**🆕 Pendente AGORA:**
- [ ] **Destravar a cod-0062:** fornecer os **2–3 comprovantes PIX reais** (mini-corpus) e rodá-la com você presente (firewall acusa "pix" por design → commit consciente).
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

- [ ] **[Máquina 2.0 — LEMBRETE do Gabriel, 2026-07-27] Run pesada de sábado** — aprovada em princípio, mas SÓ entra depois do piloto. **Gatilho: 10 runs da rotina matinal com o teto novo** → revisar as métricas do RELATORIO (tarefas/run, linhas de diff, tempo de revisão, taxa de descarte) e decidir se cria a rotina de sábado (1 lote grande do lastro por semana). Doc: `Economizei app/Analise_Maquina_Pesada_e_Lotes_2026-07-27.md`.
- [x] ~~**[Máquina 2.0 — ratificar] cod-0066 continua na Fila pronta?**~~ — ✅ RATIFICADO pelo Gabriel (2026-07-27): a restrição "nada de apagar MP" vale **só pro lastro**; a **cod-0066 segue na Fila pronta** com a autorização da manhã.

*(Já resolvidos [x] — encurtamento, open questions + pré-reqs do Agente (migration/envs rodadas 07-09), comparativo Pro+teaser, sequência §4, pricing Free×Pro, migration do alerta pro, classificação, prova de anual na landing — preservados no snapshot `arquivo-historico/AGENDA_arquivo_2026-07-15.md`.)*

**Decisões / pendências humanas ainda ABERTAS:**
- [ ] **[Longo Prazo] Sessão de desdobramento das Frentes 1 e 2** — canal fora do Brasil (Plaid/app), sensibilidade da fatura, ordem jul→out. `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md`. **Nada do Longo Prazo sobe pra fila antes dela** (a Frente 1/PIX já começou por pedido explícito via cod-0060..0062).
- [ ] **[financeiro — ADIADO out/2026] Webhook Hotmart → `/admin/ativar-pro`** + **atualizar `formatter.js` com pricing anual/Hotmart** (`/planos` e `/assinar` ainda só mensal/MP) — zona financeira, você faz e revisa.
- [x] ~~**[Alerta Pro — decisão fina]** bloco de supérfluo: todos ou só Pro?~~ — ✅ DECIDIDO (2026-07-27): **baseline pra todos; `/superfluo` configurável gated no Pro** (aplicar junto com o gate Pro desdobrado — `Gate_Pro_Desdobramento_2026-07-10.md`, mão do Gabriel).
