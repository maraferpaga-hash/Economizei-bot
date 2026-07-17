# 💬 Arquivo — Histórico narrativo de sessões (até 2026-07-15)

> Extraído do `CLAUDE.md` no enxugamento de 2026-07-15 (ver `Economizei app/Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md`).
> Parte 1 = a linha "Última atualização" integral (log corrido de todas as sessões). Parte 2 = a seção 11 integral
> ("Histórico de comandos importantes do Gabriel", com briefings verbatim). Período inicial (mai/2026) também em `CLAUDE_arquivo_2026-06-04.md`.

---

## Parte 1 — Linha "Última atualização" integral (estado de 2026-07-15, 2ª sessão)

**Última atualização:** 2026-07-15 (2ª sessão — **Instruções + Contexto do Projeto Claude criados**: divisão formal de papéis Claude×Gabriel com protocolo "plano-e-segue" — Claude executa as áreas que domina anunciando o plano em 3 linhas, Gabriel fica só com decisão estratégica/dinheiro/deploy; docs `Economizei app/Projeto_Claude_INSTRUCOES_2026-07-15.md` (colar em "Instruções do projeto") + `Projeto_Claude_CONTEXTO_2026-07-15.md` (conhecimento do Projeto, retrato condensado autossuficiente; a pasta vence em conflito); firewall e "máquina nunca commita" intocados — ver Decisões, seção 8) · anterior mesma data: sessão de planejamento — reabastece a fila com cod-0034/0032/0033, Frente 1 começa pelo desenho cod-0060, Frente 2 = repensar canal/Plaid; painel atualizado; 4 tarefas em revisão no working tree aguardando seu commit — ver 1ª linha das Decisões, seção 8) · anterior: 2026-07-13 (2ª sessão) — (**Leva 2b FECHADA: cod-0041 + cod-0042 em revisão — o Agente agora tem 10 intents.** Sessão Cowork em 2 atos, com colaboração inédita Cowork×rotina matinal: a sessão da madrugada implementou as 2 intents da cod-0041 (`comparativo_mercados` reusando o cod-0020 com o MESMO teaser `COMPARATIVO_AMOSTRAS_FREE` e `deps.maxComparativos` deixando o gate Pro futuro em 1 linha; `gasto_superfluo` com baseline doces+bebidas e 2 estados-vazios distintos — "sem gasto no mês" ≠ "sem supérfluo, bom sinal") e **parou antes dos testes**; a **rotina matinal das 8h encontrou o código no working tree, revisou sem mudar 1 linha e completou a tarefa** (`test/agent-intents-leva2b.test.js`, 16 testes + invariante 7→9); a retomada da tarde reconciliou (zero conflito, zero retrabalho) e implementou a **cod-0042** (`duvida_sobre_bot`: "o que você sabe fazer?" respondido com **lista viva** derivada do REGISTRO — intent nova entra na ajuda sozinha, sem copy duplicada; **não consome cota** via flag `consomeCota:false` + guarda no passo [6] do orquestrador, mesma decisão do off-topic; `temDados:false` → template direto, **custo zero de LLM**; exemplos exibidos filtram gíria "tá/tô" — regra 2026-05-26, precedente do `montarForaDeEscopo`; template ficou no `intents.js` de propósito — no `formatter.js` seria dependência circular). **Validação em réplica /tmp** (mount do sandbox truncou os arquivos editados DE NOVO — recorrente): **284/284 testes puros verdes + firewall `--working` verde (5 arquivos, 0 tokens financeiros)**. **Pendências humanas:** `npm run check` na máquina (gate final) + **2 commits separados** (cod-0041 e cod-0042 — blocos distintos no `intents.js`) ou `/entregar`; **SEM migration nova, SEM env nova** (a migration do Alerta Pro já rodou em 07-08; `COMPARATIVO_AMOSTRAS_FREE` já existe no Railway). ⚠️ **`PAINEL.html` untracked na raiz, origem desconhecida** (nem da rotina, nem desta sessão — verificar antes de commitar). Próxima da fila: **cod-0051**. Sessão anterior do dia: **ENTREGA da Máquina commitada/pushada + comando `/entregar` criado (aprovação dupla + checagem de migrations bloqueante) + AGENDA reconciliada.** As 6 tarefas em revisão foram commitadas pelo Gabriel em 6 commits (`7082535` cod-0021+0024 · `473ea18` cod-0022 · `86dbb64` cod-0031 · `0dc9159` cod-0040 · `0b81181` cod-0050 · `9182b91` docs), `origin/main` sincronizado — firewall `--working` verde e 260/263 testes no sandbox (3 SIGBUS ambientais do `sharp`, passam no Windows). **Efeitos no produto:** Agente ganha 4 intents (Leva 2a — inflação/raio-x/economia/onde-cortar em texto livre), guarda de schema ativa no boot (rede do incidente A9; **vai acusar `acompanhamentos`/`categorias_superfluas` até a migration do Alerta Pro rodar** — env opcional `ADMIN_PHONE` pro aviso via WhatsApp), persistência de acompanhamentos pronta e inerte, copy de erro `nao_supermercado` honesta, lembrete d10 sem contador stale. **cod-0041/0042 desbloqueadas** — cod-0041 é a próxima da fila. **Processo novo — comando `/entregar`** (arquivo entregue pro Gabriel soltar em `.claude/commands/entregar.md`; `.claude/` é protegido pro Cowork): entrega assistida com **aprovação dupla** — (1ª) `npm run check` verde obrigatório, (2ª) plano de commits agrupado por tarefa da AGENDA apresentado e só executado com "APROVO" literal; depois push + **reconciliação automática da AGENDA** (mata a memória stale recorrente). **Regra nova BLOQUEANTE (pedido do Gabriel): checagem de migrations/envs ANTES da aprovação** — o `/entregar` cruza o diff com `supabase/migration_*.sql` + `CHECAGENS_CRITICAS` do `schemaGuard.js` + `.env.example` e avisa em destaque o que rodar antes do deploy (o push dispara deploy automático no Railway); registrada também no protocolo da AGENDA. Sessão anterior: 2026-07-10 — (**AUDITORIA INTEGRAL — 6 de 10 frentes executadas; firewall com 8 lacunas + bypass por rename (patch pronto, humano); copy de indicação e fluxo MP flagados 🔴; npm limpo; cod-0051/0052 enfileiradas + aud-01..04 no painel.** Gabriel pediu grande auditoria em 10 frentes e escolheu: executar as 6 locais agora, adiar as 4 que dependem de dados dele (classificação com cupons reais, custo Gemini, LGPD nos logs Railway, custo infra → **aud-01..04** na AGENDA com material de preparação pronto). Doc completo: `Economizei app/Auditoria_Integral_2026-07-10.md`. **Firewall (§1):** selftest 16/16 e cenários-núcleo OK, mas 8 tokens financeiros pós-criação passam limpo (testados em repo git isolado): `temFeaturesProAtivas`, `COMPARATIVO_MAX_PRO`, `ehPro`, `marcarProAtivo`, `concederFeaturesPro`, `hotmart`, `ADMIN_SECRET`, roteamento `/planos`; e `git mv src/mercadopago.js → outro nome` bypassa a denylist (fix: `--no-renames`). Patch pronto no doc — aplicação é humana (o arquivo é protegido de propósito); crítico AGORA por causa do desdobramento do Gate Pro. **Idempotência (§2):** dedup por PK sólido, purgas TTL confirmadas no cron; achados 🟡 — TOCTOU no limite Free (2 fotos simultâneas furam o teto em ±1), `incrementarPerguntas` read-then-write (SQL de RPC pronto), fallback do incremento de cupons silencioso, dedup registra-antes-de-processar (at-most-once, decisão documentada). **Schema×código (§3):** zero drift no repo — toda coluna usada tem SQL versionado; resta query de 5min confirmando produção (migrations antigas nunca verificadas + a RPC `incrementar_compras_mes`). **Copy (§4):** 🔴 indicação promete "alerta inteligente" inexistente (recompensa entrega nada — comparativo sem gate); 🔴 `/assinar` ainda gera checkout Mercado Pago (abandonado juridicamente 06-24 — fluxo de cobrança ativo por via irregular; mínimo sugerido: cair pro PIX até Hotmart/Wise); 🟠 `/planos` sem anual. **npm (§5):** 0 vulnerabilidades, 0 pacotes órfãos; nota: `@google/generative-ai` em fim de vida (migração futura pro `@google/genai`, só com corpus verde). **Testes (§6):** 184 verdes = lógica pura; a rede de segurança da extração (`reconciliarItens`/`validarSchema`/parse — o coração!) e o dedup têm ZERO teste → **cod-0051/0052** na fila; recomendação: transformar o smoke de 07-09 em script reutilizável e monitorar `fidelidade_ok:false` como sentinela. Zero código de produto tocado; commit é do Gabriel. Sessão anterior (mesmo dia): **Gate Pro (A1) DESDOBRADO — snippets prontos pro Gabriel aplicar.** Sessão de análise das pendências de decisão da AGENDA; Gabriel escolheu desdobrar o Gate Pro entre 4 candidatos (Longo Prazo, Gate Pro, pré-reqs Canadá, Hotmart). Decisões dele: **Pro vê até 10 comparativos** (nova env `COMPARATIVO_MAX_PRO=10`, não "todos" — teto por tamanho de mensagem WhatsApp); **teaser Free faz upsell honesto** citando `/planos` quando `temMais` (sem preço hardcoded — preço vive só no `montarMensagemPlanos`); entrega **doc-only** (código financeiro não sai das mãos dele). Entregue: `Economizei app/Gate_Pro_Desdobramento_2026-07-10.md` — diffs exatos de `index.js` (import `temFeaturesProAtivas`, handler passa `usuario`, `mostrarComparativo` com gate) e `formatter.js` (`montarMensagemComparativo` ganha `opts.ehPro`, retrocompatível com o cod-0022 da fila), envs, 5 testes sugeridos (A6 parcial, caminho do dinheiro = humano), **padrão de gate pro Alerta Pro** (máquina constrói cod-0032/0033/0035 SEM gate; Gabriel insere ~3 linhas na revisão; `/acompanhamentos` e `/parar` ficam sem gate — quem caiu do Pro precisa ver/parar o que configurou) e checklist de 7 passos. **Efeito colateral:** a recompensa de indicação (`features_pro_ate`, plumada desde 06-07 e vazia) passa a valer algo real. **Decisão fina pendente (dele):** bloco de supérfluo baseline pra todos ou só Pro (sugestão no doc: baseline pra todos, configuração gated). AGENDA atualizada (A1 desdobrado, cod-0032/0033 promovíveis, nota-gate na cod-0041). Zero código de produto tocado — o firewall vai acusar os snippets de propósito quando ele aplicar; commit consciente é o desenho. Sessão anterior: 2026-07-09 — 3ª sessão do dia (**Estabilização VALIDADA em produção — Agente de Perguntas + comparativo + salvar-cupom no ar e testados end-to-end; frente "Estabilizar o produto" FECHADA.** Numa sessão de estratégia sobre os próximos passos das outras áreas do negócio, o Gabriel escolheu a frente Produto/Estabilização. Investiguei o código e confirmei o bug do incidente A9 (`salvarCompra` grava `cnpj` desde `a795f65`; sem a coluna `compras.cnpj`, o INSERT quebra → cupom perdido em silêncio desde o deploy de 07-08). O Gabriel então rodou tudo e confirmou: **A9** (`compras.cnpj` verificada), **A4**, `migration_FUTURA_agente_perguntas.sql`, as **4 envs** no Railway + `.env.example` (`LIMITE_PERGUNTAS_FREE`/`AGENTE_MODO`/`AGENTE_MODELO`/`COMPARATIVO_AMOSTRAS_FREE`), e o **smoke test end-to-end PASSOU** — cupom salvou com `cnpj`; o número narrado pelo Agente **bateu com o `/gastos`** (firewall de fidelidade numérica OK — o bug de 06-07 não reapareceu); pergunta off-topic recusada com gentileza, **sem inventar número**. Isso resolve o único pendente do **checkpoint N2 de 07-08** ("falta validação end-to-end em produção" → ✅). Entregas de memória/processo (zero código de produto): roteiro `Economizei app/Roteiro_Smoke_Test_2026-07-09.md`; enfileirada **cod-0050** (guarda de schema no boot — rede de segurança pro incidente A9 não repetir: loga alerta gritante no start se coluna/tabela crítica faltar; firewall-limpa); "Ações do Gabriel" marcadas concluídas. **Desbloqueado:** o Assistente Conversacional pode avançar de verdade — Leva 2 (cod-0040..0042) já na fila, e o `perguntas_log` de produção passa a ser o juiz da ordem das próximas (cod-0043+); **cod-0034** (intent NL `gasto_por_termo`, Free) teve a dependência "agente no ar" satisfeita → promovível. **Seguem humano/financeiro (intocados pelo firewall):** gate Pro do comparativo (A1, `is_pro`) e a abertura da empresa BC (adiada pra out/2026). 2ª sessão do dia (**Empresa BC ADIADA pra outubro/2026 + Horizonte de Longo Prazo criado (seção 7.2).** Gabriel registrou que a abertura da empresa em BC não será possível antes de out/2026 — todos os bloqueadores dependentes (Meta Ads, Hotmart, Wise, afiliados) ficam parados até lá, e a janela jul→out vira tempo de construção. Decisões: (1) **janela de planejamento da AGENDA expandida pra até 2 meses** (antes: só a fila imediata); (2) nova **seção 7.2** + doc `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` com as 2 frentes-semente — **Frente 1: ingestão multi-documento financeiro** (fatura de cartão, comprovante PIX, notificação de banco, PDF/foto — mesmo gesto zero-atrito do cupom; destrava a G1 reprovada em 06-09) e **Frente 2: internacionalização** (Canadá/Vancouver primeiro, depois EUA/Europa — i18n, moeda, formatos de recibo, leis); (3) sementes **cod-0060..0064** plantadas no Backlog da AGENDA, **não priorizadas** — o desdobramento em tarefas de fila só acontece depois da **sessão de discussão com insights** (pedido explícito do Gabriel). Pushbacks honestos no doc: WhatsApp é fraco no Canadá/EUA (a premissa "WhatsApp é o produto" não viaja — decisão de canal é a discussão mais dura da Frente 2), fatura de cartão é dado bem mais sensível que cupom (LGPD/PIPEDA nascem junto com a feature), e até out/2026 a métrica que manda é retenção W2, não receita. Zero código de produto nesta sessão. Sessão anterior do dia: (**Assistente Conversacional definido como a força a desenvolver — benchmark + doc de ideias + Leva 2 de intents enfileirada.** Gabriel pediu transformar o Agente de Perguntas num assistente financeiro pessoal de conversa livre e natural ("como mandar um áudio pra uma IA"), com mais respostas, insights pré-programados e melhor seleção/filtragem de dados. Entregue (zero código de produto): benchmark com pesquisa web — **Cleo** (chat-first, personalidade engaja), **Erica/BofA** (dado-chave: **60% das interações são PROATIVAS**, 30+ insights com cooldown), **Monarch** (assistant + weekly recap), **Copilot Money** (resumo mensal narrado por IA), e **concorrentes BR de WhatsApp: Magie, Poupa.ai, Meu Assessor, Jota, ZapGastos** — a categoria "assistente financeiro no WhatsApp" está LOTANDO; nosso diferencial defensável não é conversar, é **o dado do cupom item a item** (`nome_canonico`, preço unitário, comparativo entre mercados) — responder o que os outros não têm dado pra responder. Doc de 4 eixos: `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md` (**A** mais intents/filtros compostos · **B** naturalidade: áudio via transcrição Gemini, contexto de follow-up, sugestões, prompt de narração · **C** proativos unificados com o Alerta Pro · **D** fato rico com comparação) + sequência recomendada e anti-escopo (sem conselho financeiro, sem TTS, sem small talk aberto). **Decisão do Gabriel: Leva 2 de intents primeiro** → enfileirados **cod-0040** (inflação/raio-x/economia/onde-cortar — inteligência já pronta no `insights.js`), **cod-0041** (comparativo + supérfluo como intents) e **cod-0042** (`duvida_sobre_bot`), após as 3 rápidas cod-0021/0022/0024. **🚨 Achado urgente da sessão:** o push de 07-08 (`d4eaf51`) pode ter disparado o deploy automático do Railway com o `salvarCompra` gravando `cnpj` **sem a migration A9 rodada** → **salvar cupom pode estar quebrado em produção AGORA**; o passo a passo de deploy foi atualizado (`Passo_a_Passo_Deploy_Agente_2026-07-03.md` — migrations viraram o passo 1; check/commit/push já feitos) e o alerta está no topo de "Ações do Gabriel" na AGENDA. Sessão anterior: 2026-07-08 (**Checkpoint integral Nível 2** — disparado por fim-de-cadeia + volume. Verifiquei o **git como fonte da verdade**: cod-0013..0017 (Agente completo) + cod-0020 (comparativo leitura) **foram commitados e pushados** em `d4eaf51`/`3b2f375` (07-08 00:28 PT), branch sincronizado com `origin/main`, working tree limpo (só `RELATORIO_MATINAL.md`). **A memória estava stale** — AGENDA/CLAUDE descreviam essas tarefas como "SEM commit" (falha clássica AGENDA×git, reconciliada nesta sessão). Rede de segurança: **184/184 testes reais verdes**; as 2 falhas (`classificacao-corpus`, `gemini-canonico`) são **SIGBUS do `sharp` só no sandbox Linux** — ambientais, passam no Windows; firewall financeiro OK (0 tokens em `src/agent/`). **Veredito 🟡→🟢:** repositório saudável e no ar; falta a **validação end-to-end em produção**. Pendências pré-produção (todas humanas): (1) rodar `migration_FUTURA_agente_perguntas.sql` + o `ALTER` do A9 no Supabase; (2) setar envs no Railway **e no `.env.example`, que ainda NÃO as tem** (`LIMITE_PERGUNTAS_FREE`, `AGENTE_MODO`, `AGENTE_MODELO`, `COMPARATIVO_AMOSTRAS_FREE`); (3) **teste manual com cupom/pergunta real** — nenhum teste unitário pega "número inventado" do Gemini real (o bug de 06-07); (4) ligar o gate Pro do comparativo. Sessão anterior: 2026-07-03 (**rush da conversa fluida — Agente de Perguntas COMPLETO (cod-0014..0017 implementados; cadeia cod-0010..0017 fechada).** Gabriel pediu rush na função de conversa fluida, priorizando-a sobre a sequência §4 nesta sessão (decisão dele; cod-0020 segue em revisão em paralelo). Entregues, todos firewall-limpos e SEM commit (Cowork sem credencial): **cod-0014** `src/agent/render.js` — narração LLM (Opção A, modo default `llm`) com **firewall de fidelidade numérica** (Camada 5) e **airbag** pro template em reprovação/erro; sem dado → template honesto SEM chamar o LLM (Camada 3); **cod-0015** 4 mensagens novas no `formatter.js` (fora de escopo, aviso do meio, limite atingido, +`montarErroAgente` extra do Desenho §9) — zero menção a preço/plano, sem gíria; **cod-0016** `src/agent/cota.js` puro (`decidirCota`, aviso do meio idempotente por igualdade) + 4 funções de I/O no `supabase.js` (cota fail-open anti-abuso, log OODA fire-and-forget, purga TTL 90d ligada no cron das 7h do `scheduler.js`) + reset mensal coerente nas 2 vias (best-effort pré-migration); **cod-0017** orquestrador `src/agent/index.js` (deps 100% injetáveis; off-topic não consome cota; erro técnico → resposta neutra) + wiring no `else` final de `processarTexto` no lugar do "Não consegui entender" — nenhum comando de pagamento tocado. **Validação: 184/184 testes verdes** (37 novos; suíte rodada em cópia limpa /tmp — o mount do sandbox truncou TODO arquivo editado nesta sessão, problema recorrente agravado; `sharp`-tests SIGBUS como sempre) + self-scan firewall 0 tokens nas linhas adicionadas. **Pendências humanas:** `npm run check` na máquina (gate final) → commit/push (sugestão: 4 commits, um por tarefa); **rodar `migration_FUTURA_agente_perguntas.sql` ANTES do deploy**; envs `LIMITE_PERGUNTAS_FREE=30`/`AGENTE_MODO=llm`/`AGENTE_MODELO=gemini-2.5-flash` no Railway + `.env.example`; A9 antes de qualquer deploy. Detalhe na AGENDA ("Em revisão") e na seção 8. Sessão anterior: 2026-06-30 (**revisão da Máquina Local + sistema de checkpoints + divisão em pilares + migrations pendentes escritas (A4/A9/2 futuras).** Adendo do fim da sessão: os 5 blocos da automação + memória + cod-0012 + limpeza do Actions foram **commitados e pushed** pelo Gabriel (`origin/main`); e escrevi 4 SQL em `supabase/` — **A4** versiona `resumos_mensais_enviados` (tabela feita à mão sem `CREATE` no repo), **A9** adiciona `compras.cnpj` + grava no `salvarCompra` (prepara o comparativo cod-0020; **rodar o ALTER antes do deploy**), e 2 **futuras** (`perguntas_log`/`perguntas_mes_atual` do Agente; `acompanhamentos`/`categorias_superfluas` do Alerta Pro) a rodar só quando as features subirem. Pendente humano: rodar A4+A9 no Supabase + commitar os `.sql` com `git push --no-verify` (zona `supabase/`). Detalhe do miolo desta sessão abaixo. Gabriel rodou a Máquina Local ~4 dias sem supervisão e pediu 3 coisas: (1) revisar o que foi feito + montar passo a passo de teste/commit; (2) estabelecer cadência de "check integral" — nem toda hora, nem raro — pra máquina **e** software; (3) dividir o negócio em pilares (2 hoje, 3 no futuro). **Auditoria do working tree:** desde o último commit `b73b15b`, a automação empilhou **5 blocos prontos e NÃO commitados** — **cod-0026** (`nome_canonico` lidera pelo tipo genérico, `gemini.js`), **cod-0027** (corpus de regressão da classificação), **cod-0030** (engine de matching do Alerta Pro em `insights.js`), **cod-0006** (`/apagar` LGPD ligado no `index.js`/`supabase.js`/`formatter.js`), **cod-0011** (guardas de honestidade do Agente em `src/agent/guards.js`). **95 testes verdes** nos 6 arquivos que rodam no sandbox; **firewall financeiro limpo** (18 arquivos, zero dinheiro); **nenhuma migration** pras 5. As 2 únicas "falhas" (`gemini-canonico`, `classificacao-corpus`) são **ambientais** — carregam `gemini.js`→`require('sharp')` e o `sharp` dá **SIGBUS** no sandbox Linux; **passam na máquina Windows do Gabriel** (confirmei isolando o require). **Entregues 3 docs** (`Economizei app/`): **Revisao_e_Commit_Maquina_2026-06-30** (6 commits lógicos = 5 de feature + 1 de memória, comandos exatos por bloco, pré-voo `npm run check`, limpeza pendente do Actions `ci.yml`/`claude-nightly.yml`, rollback); **Sistema_Checkpoints_Benchmarks_2026-06-30** (3 níveis: gate por-tarefa → checkpoint integral → auditoria trimestral; **métrica do checkpoint integral = o primeiro entre fim-de-cadeia / 5-tarefas-commitadas / 3-semanas; piso 1/semana; pausa de meio em cadeia >4 tarefas**; checklist de 2 lados — Lado A máquina, Lado B software; o checkpoint do "chat automático" = quando o Agente `cod-0017` ligar, ênfase no firewall de fidelidade numérica); **Pilares_do_Negocio_2026-06-30** (Pilar 1 Máquina de Programação "constrói" · Pilar 2 Código/Produto "roda" · Pilar 3 futuro Marketing & Anúncios "gasta dinheiro real"; **firewall financeiro = tecido conectivo**: a máquina mexe no código nunca no dinheiro; Pilar 3 vem depois porque erra gastando caixa, gated por W2 ≥ 30%). **Pendências humanas:** commit+push dos 6 commits (Cowork sem credencial git), limpeza do Actions, e rodar um checkpoint Nível 2 logo após o push. **Honestidade:** não commitei nada — só revisei, testei e documentei; o código das 5 tarefas está saudável, o que faltava era puramente processo (commit). Sessão anterior: 2026-06-27 (**`/apagar` implementado + sequência do pago confirmada** — diante do §4 da auditoria, Gabriel confirmou **fechar a promessa do pago** (`/apagar` → comparativo entre mercados → alerta Pro) **antes** de escalar anual/afiliados/ads e antes do Agente de Perguntas. Começou pelo **`/apagar`** (cod-0006, direito de eliminação LGPD, fecha o A2): novo `src/apagar.js` puro (`interpretarApagar`) + `apagarDadosUsuario` no `supabase.js` (DELETE em ordem de FK — `compras`→`itens` cascade, `indicacoes`, `lembretes_enviados`, `resumos_mensais_enviados`, `mensagens_processadas`, `usuarios`; **não toca** a tabela de eventos de pagamento nem `precos_mercado` anônima) + 3 mensagens no `formatter.js` + handler no `index.js` **antes do gate de onboarding** (vale em qualquer etapa), em 2 passos (`/apagar` → `/apagar confirmar`). **11 testes verdes** (`test/apagar.test.js`), `check:firewall` ✓, **sem migration**. **Gate do comparativo decidido (A1):** Pro completo + **teaser grátis** (1+ amostras pra mostrar valor). Deploy = `git push` do Gabriel; rodar `npm run check` na máquina dele como gate (o `formatter.js` veio **stale no mount do sandbox** — verifiquei a lógica em cópia limpa). **Ressalva:** pagante ativo no `/apagar` (FK de eventos de pagamento) é follow-up financeiro humano. Sessão anterior do dia: **Alerta Inteligente Pro desenhado (supérfluo + acompanhamento personalizável) + classificação declarada o CORAÇÃO do produto** — o Gabriel pediu pra evoluir o alerta inteligente, principalmente pro **plano Pro**, com (a) **alerta de gasto supérfluo** — quanto a pessoa gastou em itens supérfluos, com categorias supérfluas configuráveis — e (b) **acompanhamento personalizável**: a pessoa escolhe o que quer ver (uma categoria, "um tipo específico de cerveja", "qualquer coisa") e o bot busca **pelo nome do item**, dependendo de classificação muito boa. Decisões nas perguntas: **desenho + tarefas na AGENDA** (não codei produto; o gate Pro é humano/firewall), configurar por **comando + linguagem natural** (reusa o Agente de Perguntas cod-0010..0017), alvo = **categoria + palavra-chave livre** (matching por `nome_canonico`). Entregue (só memória/processo/design, zero código de produto, financeiro intocado): **aviso "classificação é o coração"** como princípio central no CLAUDE.md (pedido explícito) + reforço no `CODE_GUIDE.md` ("Classificação é invariante crítico"); **desenho técnico** `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md` (2 pilares, engine de matching puro `casarItemComAlvo`, tabela `acompanhamentos` [migration = humano], comandos `/acompanhar` `/limite` `/acompanhamentos` `/parar`, intent NL `gasto_por_termo`, gatilhos per-compra + resumo mensal, Free×Pro proposto, **plano de endurecimento da classificação**); **AGENDA**: cod-0023 expandido em cadeia cod-0030..0036 (matching → acompanhamentos → supérfluo → comandos → NL → alerta de limite) + cod-0026/0027 de classificação (prompt do `nome_canonico` lidera com o tipo genérico + corpus de regressão), com skills designadas; pré-requisitos humanos registrados (migration da tabela, gate Pro `temFeaturesProAtivas`, decisão de pricing Free×Pro). **Honestidade:** o alerta Pro só é tão bom quanto a classificação — por isso o endurecimento vem junto; matching por palavra-chave depende de o `nome_canonico` conter o termo genérico (ex.: "cerveja skol lata" e não só "skol"), endereçado no cod-0026. Sessão anterior: **Reconciliação AGENDA × git (housekeeping)** — a `AGENDA.md` estava stale: 5 tarefas que já estavam commitadas e sincronizadas com `origin/main` (`b73b15b`/`e8de024`: F3 `/cortar` cod-0001, testes de alerta cod-0003 e de nome canônico cod-0002, parser de período do agente cod-0010, encurtamento de mensagens cod-0004) foram movidas de "Em revisão"/"Aguardando decisão" pra **"Concluído"**; "Em revisão" esvaziada. A7 fechado (working tree limpo, `_writetest_root.tmp` removido, memórias alinhadas); `tarefa.md` confirmado em `.claude/commands/`. **Ressalvas honestas:** limpeza do GitHub Actions ficou **parcial** (`ci.yml` e `claude-nightly.yml` ainda no repo, só `pages-ci.yml` saiu) e o `/planos` (`formatter.js`) **ainda não tem o ciclo anual** (pendência financeira/humana); toggle anual/mensal já está na landing (`d3fe539`). Fila real da máquina a seguir: cod-0011→cod-0017 (Agente de Perguntas); decisão de alto valor pendente: §4. Sessão anterior: **Gatilho de Skills na automação** — regra: toda tarefa da Máquina Local **carrega a skill certa antes de codar**, reusando a memória que já construímos em vez de programar "no vácuo". Dois lados: no **planejamento** (Opus 4.8 + Gabriel) cada tarefa da `AGENDA.md` ganha um campo **`skills:`** — o Opus apresenta as skills candidatas com 1 linha do que cada uma faz e **pergunta quais usar**; na **execução** (`/tarefa`, Sonnet 4.6) carrega o que está em `skills:`, ou **deriva do mapa tipo→skill**, e **declara quais usou**. Mecânica **híbrida** (designação + fallback), rigor **recomendado-não-bloqueante**. Entregue (só memória/processo, zero código de produto, financeiro intocado): seção **"🧠 Gatilho de Skills"** na `AGENDA.md` (regra + mapa tipo→skill + catálogo das 18 skills com descrição), campo `skills:` no molde + **backfill** nas tarefas ativas (cod-0001..0003, cod-0010..0017), passo no protocolo e no prompt `/tarefa` (guia `Automacao_Maquina_Noturna.md` §4 + §4.1), `tarefa.md` pronto pra soltar em `.claude/commands/`. Sessão anterior do dia: **Mensagens automáticas do bot encurtadas (−25%, dado de impacto no topo)** — o Gabriel notou que as mensagens automáticas eram longas e o que mais importa (R$, %, economia) ficava enterrado no meio do texto. Aplicadas as skills `economizei-copywriter` + `copy-review`: **14 funções** reescritas no `src/formatter.js` — confirmação de cupom (mercado + não-mercado), alerta nos 3 níveis, resumo mensal, onboarding 1–4 e os 8 lembretes de reengajamento. Princípios: **o número vem primeiro** (na confirmação e no resumo, total da compra/mês, comparação e economia do ano sobem pro topo, antes da lista de itens), corte de reassurance repetida, voz de WhatsApp **sem gíria proibida no bot** (`cê/tá/né/ó`, regra 2026-05-26). Medido: **4.105 → 3.059 chars (−25%)**, cortes de 8–41% por mensagem, **sem mudar nenhum número nem promessa** (`financial-firewall` ok). Doc antes/depois aprovado: `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`. Validado: `node --check` ok (contornando o cache de bytes-nulos do mount do sandbox) + render das 14 mensagens conferido contra o doc. **Sem migração** — só strings, deploy é `git push` (HUMANO, na máquina do Gabriel). Fora do escopo (próxima rodada): `/planos`, `/gastos`, mensagens de erro, assinatura. Sessão anterior do dia: **Automação migrada de GitHub Actions → execução LOCAL** — o run noturno se mostrou caro e penoso: um run custou ~US$10 e **não abriu PR** (35 negações de permissão), exigindo OIDC `id-token: write`, `--permission-mode bypassPermissions`, secret OAuth e branch protection. O Gabriel decidiu **descartar o GitHub Actions** e rodar **localmente**: na pasta, o Claude Code (`/tarefa`) pega a 1ª tarefa pronta da `AGENDA.md`, implementa com teste, roda `npm run check` e **mostra o diff — o Gabriel revisa e commita** (a automação não commita). Racional: o Actions só valia pelo autônomo-sem-supervisão; local = zero infra, controle total, custo só do que ele acompanha. **Mantido (vale local):** `AGENDA.md`, `scripts/check-firewall.mjs` (firewall com novo modo **`--working`** que checa mudanças não commitadas e **só escaneia arquivos de código** — docs `.md`/`.html` citando "is_pro/assinatura" não dão falso-positivo), `test/insights.test.js` (5 testes), scripts npm **`check`/`test`/`check:firewall`/`validate:pages`**. **Removido:** `claude-nightly.yml`, `ci.yml`, `pages-ci.yml` (Gabriel faz `git rm`/apaga no PC; `monthly-cron.yml` fica). Guia reescrito pra local (`Automacao_Maquina_Noturna.md`, inclui o conteúdo do `/tarefa`); `Passo_a_Passo_Maquina_Noturna.md` consolidado/removido. **Proteção do dinheiro agora:** revisão humana do diff (principal) + `npm run check:firewall` — sem branch protection. Sessão anterior do dia: **Máquina Noturna virou engenheiro de CÓDIGO + firewall financeiro** — o Gabriel decidiu que a função principal da automação noturna passa a ser **mudança de código** (funções novas, refino, bugfix), não mais páginas estáticas, **com a condição de blindar o financeiro com certeza**. Como instrução de prompt o modelo pode ignorar, a trava virou **código enforçável**: `scripts/check-firewall.mjs` roda no **CI** e **reprova o PR** se o diff tocar dinheiro — **denylist de caminho** (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, o próprio firewall) **+ scan de conteúdo** nas linhas adicionadas (`mercadopago`, `is_pro`, `assinatura`, `preapproval`, `MP_`, `pix`, `checkout`, `paywall`, `ativar-pro`, `montarMensagemPlanos`…). Com **branch protection** exigindo o check **"CI"**, PR financeiro fica **não-mergeável** (garantia mais forte possível; a máquina nem tenta contornar). Rede de segurança de código nova: workflow **`ci.yml`** roda firewall → `node --check` → `node --test` → `check-pages`; baseline `test/insights.test.js` (5 testes verdes); **TDD obrigatório**. `claude-nightly.yml` reescrito pra código com **zona proibida** explícita + `--max-turns 40`. `AGENDA.md` repropostas: taxonomia `feature-codigo`/`refino-codigo`/`bugfix`/`teste` (+ páginas), bloco **🚫 Zona proibida (financeiro)**, 3 tarefas-semente (cod-0001 F3 "onde cortar", cod-0002 afrouxar heurística de canônico, cod-0003 testes do alerta). Doc novo: `Economizei app/Passo_a_Passo_Maquina_Noturna.md` (ícones 👤/🤖/⚙️/🚫). `pages-ci.yml` deprecado (dobrado no `ci.yml`; remoção pelo Cowork bloqueada — apagar no PC). **Validado no sandbox:** firewall selftest 16/16; 4 cenários git (limpo passa / `is_pro` bloqueia / `package.json` bloqueia / `supabase/` bloqueia); 5 testes verdes; sintaxe ok; check-pages verde. **Ativação (HUMANO):** `git push`, `/install-github-app`, branch protection exigindo **"CI"**, testar 1× via *Run workflow*. Sessão anterior do dia: **Plano ANUAL vira a oferta-destaque comercial** — pra elevar o **ticket médio (ARPU)** e trazer **caixa adiantado** que faça o investimento em aquisição (~R$200; custo por ativação estimado R$30–54) fechar a conta. Estrutura: anual pros **3 tiers pagos** com **~2 meses grátis** — **Individual R$99/ano**, **Família R$150/ano**, **Família+ R$220/ano** — pago via **PIX ou cartão (MP recorrente)**. O **mensal continua** como entrada de baixo atrito (não quebra o "zero atrito"); o anual é o destaque. **Meta:** ~80% dos pagantes no anual — registrada como **estrela-guia, não premissa de lançamento**. Racional: anual recupera o CAC na hora, trava o LTV e mata o churn por esquecimento de renovação (mesma dor da assinatura recorrente de 06-07). **Caveats honestos do `financial-firewall` (registrados na Seção 3):** (1) R$99 à vista é pedido bem maior que R$9,90/mês — vender anual a frio pra quem nunca mandou cupom tende a falhar; caminho realista é free → viver o valor → upsell anual; (2) anual **amplifica, não conserta** — receber o ano adiantado NÃO muda a regra de só escalar aquisição após **W2 ≥ 30%** no cohort de Fernandópolis; (3) não deixar "já recebi o ano" virar desculpa pra gastar antes da retenção provar; (4) honrar reembolso proporcional com elegância. Pricing R$99 (não R$100) fecha a narrativa "pague 10, leve 12". **Pendências de implementação (HUMANO/código):** criar planos anuais no MP, expor ciclo anual no `/planos` e `/assinar` (`formatter.js`/checkout), refletir anual no bloco de pricing da `landing/index.html`. Ideia parada em fila de decisão na `AGENDA.md`: usar a economia do anual como prova de marketing na landing. Sessão anterior do dia: **Máquina Noturna** montada — automação autônoma de **páginas** via GitHub Actions: cron **05h BRT** (08:00 UTC) roda o **Claude Code headless no Sonnet 4.6**, lê a `AGENDA.md` + `CLAUDE.md`, pega a tarefa priorizada, gera a página numa branch e abre **PR em rascunho**. Modelo de **2 cadeiras**: planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na agenda) → execução no **Sonnet** (run noturna, sozinha, nunca decide produto). Foco inicial: **landing A/B + conteúdo/SEO**; a máquina mexe **só** em `landing/` e `docs/` (nunca `src/`/pagamentos/Supabase — guarda-rail do `financial-firewall`). Rede de segurança: branch+PR (backup/restore) → **CI leve** `scripts/check-pages.mjs` (valida HTML/links, já verde nas páginas atuais) → **branch protection** na `main` → modo **rascunho** nas 1ªs semanas + `--max-turns`. Arquivos novos: `AGENDA.md` (fila viva + protocolo + painel "Ações do Gabriel"), `.github/workflows/claude-nightly.yml`, `.github/workflows/pages-ci.yml`, `scripts/check-pages.mjs`, `npm run validate:pages`, guia `Economizei app/Automacao_Maquina_Noturna.md`. **Pendências de ativação (HUMANO):** `git push`; `/install-github-app` (cria secret `ANTHROPIC_API_KEY`); branch protection exigindo o check "CI Páginas"; (opcional) Vercel Preview; testar 1× via *Run workflow*. 1ª tarefa da fila (`pag-0001`) ajusta o `vercel.json` pra páginas novas serem alcançáveis (hoje o catch-all joga tudo pro index). Sessão anterior do dia: documento de **Tráfego Pago & Criação de Páginas** criado — automação autônoma de **páginas** via GitHub Actions: cron **05h BRT** (08:00 UTC) roda o **Claude Code headless no Sonnet 4.6**, lê a `AGENDA.md` + `CLAUDE.md`, pega a tarefa priorizada, gera a página numa branch e abre **PR em rascunho**. Modelo de **2 cadeiras**: planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na agenda) → execução no **Sonnet** (run noturna, sozinha, nunca decide produto). Foco inicial: **landing A/B + conteúdo/SEO**; a máquina mexe **só** em `landing/` e `docs/` (nunca `src/`/pagamentos/Supabase — guarda-rail do `financial-firewall`). Rede de segurança: branch+PR (backup/restore) → **CI leve** `scripts/check-pages.mjs` (valida HTML/links, já verde nas páginas atuais) → **branch protection** na `main` → modo **rascunho** nas 1ªs semanas + `--max-turns`. Arquivos novos: `AGENDA.md` (fila viva + protocolo + painel "Ações do Gabriel"), `.github/workflows/claude-nightly.yml`, `.github/workflows/pages-ci.yml`, `scripts/check-pages.mjs`, `npm run validate:pages`, guia `Economizei app/Automacao_Maquina_Noturna.md`. **Pendências de ativação (HUMANO):** `git push`; `/install-github-app` (cria secret `ANTHROPIC_API_KEY`); branch protection exigindo o check "CI Páginas"; (opcional) Vercel Preview; testar 1× via *Run workflow*. 1ª tarefa da fila (`pag-0001`) ajusta o `vercel.json` pra páginas novas serem alcançáveis (hoje o catch-all joga tudo pro index). Sessão anterior do dia: documento de **Tráfego Pago & Criação de Páginas** criado — `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md`: como o Economizei entra na mídia paga "engatinhando" com ~R$200 escalável, mirando **cadastros grátis**. Reframe central: o playbook de "tráfego pago/vender na página" é de e-commerce/dropshipping; aqui a conversão é **cadastro grátis no WhatsApp**, métrica-rainha = **custo por ativação (1º cupom)**, não ROAS de loja. Recomendação honesta: **Meta Ads clique-pro-WhatsApp (CTWA)** é o carro-chefe, não o Google (não há demanda de busca a capturar); com R$200 **concentrar verba** (Meta primeiro, Google depois) porque dividir nos dois mata o aprendizado de ambos (mínimo Meta ~R$30–50/dia/campanha). Ajuste do modelo mental de "duplicar campanhas": hoje duplicar conjuntos causa sobreposição de leilão — o certo é poucos ângulos, verba concentrada, escala vertical em degraus, teste A/B oficial. Atribuição quase-grátis reaproveitando a leitura de código no 1º contato do `/convidar`. Guarda-rail do `financial-firewall`: R$200 pra **aprender** o canal = ok; escalar só após W2 ≥ 30% no cohort de Fernandópolis. Entrega desta sessão = só estratégia (doc); construção de template clonável + subdomínio Vercel fica pra quando o Gabriel pedir. Sessão anterior 2026-06-18: 3 funções de inteligência construídas e ligadas — **F2 raio-X de categoria** (conclusão no `/gastos`), **F1 inflação pessoal por item** (comando `/inflacao`), **F4 quanto você já economizou** (comando `/economia` + linha no resumo mensal). Novo módulo `src/insights.js` (análise pura) + 3 queries em `supabase.js`; **sem migração** — só leem colunas existentes, deploy é `git push`. Primeira aplicação prática do catálogo de 06-09, na sequência recomendada F2→F1→F4. Sessão de 2026-06-09: documento de **Posicionamento & Norte Estratégico** criado — `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` + nova **seção 1.5** no CLAUDE.md: missão por inteiro — IA que dá ciência e inteligência sobre o gasto do brasileiro médio —, as **3 camadas de valor** (Ciência → Inteligência → Habilidade) e o **Teste de Norte** como filtro de toda decisão de produto/copy/roadmap. Na mesma data, pesquisa profunda de finanças pessoais → catálogo de 12 funções candidatas (Camadas 2/3) em `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md`. Skills: contagem padronizada e `economizei-strategic-review` instalada em `.claude/skills/`. Sessão anterior 2026-06-07: resolvidas as 2 ressalvas abertas: **idempotência por messageId** implementada no webhook — migration `migration_2026-06-07_idempotencia_messageid.sql`; e **backfill de dados antigos** — `supabase/backfill_2026-06-07_dados_antigos.sql` para reclassificar `tipo` de não-mercado antigos + completar `preco_total`. Pendências anteriores seguem: correção dos outputs `migration_2026-06-07_coerencia_outputs.sql`; assinatura MP migration + ativação; indicação `/convidar` migration 003)


---

## Parte 2 — Seção 11 integral: Histórico de comandos importantes do Gabriel

## 11. 💬 Histórico de comandos importantes do Gabriel

*Esta seção registra as instruções e princípios que o Gabriel deu explicitamente, para preservar a intenção original em decisões futuras.*

### 2026-07-09 — 2ª sessão do dia: BC adiada pra outubro + Horizonte de Longo Prazo

**Briefing inicial (resumo do pedido de voz):** até outubro/2026 não será possível abrir a empresa em BC — tudo que depende disso fica bloqueado até lá. Como há bastante tempo, Gabriel quer: (1) expandir a janela de planejamento pra até 2 meses e criar uma seção de longo prazo na documentação; (2) começar a elaborar código/estrutura pra **ler faturas de cartão de crédito, notificações de banco e recibos de PIX** — "a pessoa manda o comprovante, o PDF, qualquer tipo de arquivo, e a gente entende os dados e processa pra dar insights"; (3) explorar **outros mercados** (Europa, Canadá, EUA), já preparando estrutura pra outras línguas/culturas/tipos de recibo — começando por Vancouver, depois EUA/Europa, desdobrando diferenças de recibos e leis mais pra frente; (4) plantar sementes na AGENDA pra Máquina automática trabalhar ao longo do tempo e chegar num MVP sólido e com valor real — **mas o desdobramento em tarefas concretas só depois de uma discussão com insights**.

**O que foi entregue (só memória/planejamento — zero código de produto):** adiamento registrado no bloqueador BC (seção 1) + decisão na seção 8; nova **seção 7.2 Horizonte de Longo Prazo** + doc `Economizei app/Horizonte_Longo_Prazo_2026-07-09.md` (contexto, 2 frentes, fases sugeridas, pontos pra discussão); AGENDA: bloco "🔭 Longo Prazo" no Backlog com as sementes **cod-0060..0064** (todas gated pela sessão de desdobramento), item em "Aguardando sua decisão" e nota de adiamento no BLOQUEADOR #1.

**Pushbacks honestos registrados:** (1) **canal** — WhatsApp domina no Brasil mas é fraco no Canadá/EUA; internacionalizar não é só traduzir, é decidir canal (a discussão mais importante da Frente 2); (2) **sensibilidade do dado** — fatura de cartão expõe a vida financeira inteira, muito além do cupom; processa-em-memória-e-descarta + LGPD/PIPEDA nascem JUNTO com a feature, não depois; (3) **prioridade** — o longo prazo não rouba a fila: deploy do Agente (migrations/envs/smoke test), Leva 2 e Alerta Pro vêm antes de qualquer semente; (4) até out/2026 **receita não é a métrica** — retenção W2 em Fernandópolis é o que valida; o adiamento não muda o gate W2 ≥ 30%, só empurra o "quando" da escala.

### 2026-07-09 — Sessão de ideias do Assistente Conversacional (benchmark + Leva 2)

**Briefing inicial (verbatim, transcrição de voz):**
> "agora que a gente chego num certo ponto do projeto, quero focar na programação principalmente do agente de respostas, das perguntas feitas, ou seja, eu quero transformar uma das forças do economize essa função. ser uma espécie de assistente financeiro pessoal pra pessoa, em que ela possa conversar de uma maneira livremente, e que o bot traga dados relevantes, insights úteis (...) quero desenvolver mais, as respostas que pode o programa pode dar os insights que são préprogramados, os dados apurados e a seleção de dados e filtragem. (...) Como o nosso Lema é ser sem fricção, eu quero que esse bot seja o mais natural possível (...) Quase como se você mandasse um áudio pra uma inteligência artificial hoje em dia ela te respondesse naturalmente (...) faça algumas pesquisas com ferramentas de resposta de assistência pessoal feitas com e sem IA"

**Decisões do Gabriel nas perguntas:** priorizar a **Leva 2 de intents** (inteligência pronta no `insights.js`) e pedir o **passo a passo do deploy de novo** (Fase 0).

**O que foi entregue (só pesquisa/design/memória — zero código de produto):** benchmark web (Cleo, Erica, Monarch, Copilot, Magie/Poupa.ai/Meu Assessor/Jota) + doc `Economizei app/Ideias_Assistente_Financeiro_Conversacional_2026-07-09.md` (4 eixos + sequência + anti-escopo) + tarefas cod-0040/0041/0042 na Fila pronta (skills designadas pelo mapa feature-codigo + copywriter/copy-review) + atualização urgente no `Passo_a_Passo_Deploy_Agente_2026-07-03.md`.

**Pushbacks honestos registrados:** (1) o Agente ainda não foi validado em produção — deploy (migrations + envs + smoke test) vem antes de qualquer expansão valer de verdade, e o log de 2 semanas é quem manda na ordem das próximas intents; (2) **achado urgente:** o push de 07-08 pode ter colocado no ar o `salvarCompra` com `cnpj` sem a coluna existir (A9 não rodada) — salvar cupom pode estar quebrado; (3) a categoria "assistente no WhatsApp" está cheia no Brasil — o discurso de marketing deve vender o DADO (cupom item a item), não "um bot que conversa"; (4) anti-escopo: sem conselho financeiro (Camada 6), sem resposta em áudio/TTS por ora, sem small talk aberto.

### 2026-07-03 — Sessão do rush da conversa fluida (Agente de Perguntas completo)

**Briefing inicial (verbatim):**
> "Vamos fazer um rush na função de conversa fluida do bot, para isso pegue as atividades de programação previstas na agenda.md e depois de ler o claude md faça todas as atividades restantes, vamos desenvolver esse código e função da maneira mais bem elaborada possível"

**Interpretação e escopo:** "conversa fluida" = a cadeia do Agente de Perguntas. Restavam **cod-0014 (render), cod-0015 (mensagens), cod-0016 (cota) e cod-0017 (orquestrador + wiring)** — todas implementadas nesta sessão, com as skills designadas nos campos `skills:` das tarefas (tdd, financial-firewall, copywriter, copy-review, security-lgpd, code-decisions + transversais). O pedido do Gabriel priorizou o Agente sobre a sequência §4 nesta sessão (prerrogativa dele; o cod-0020 já estava pronto em revisão, nada do pago foi despriorizado de fato).

**O que existe agora (fluxo completo):** texto livre → cota → classificador → executor (código calcula) → **narração Gemini com firewall de fidelidade** (número fora da allowlist → descarta e responde o template) → aviso do meio (15/30) → log de auditoria. Detalhe por tarefa na AGENDA ("Em revisão") e na decisão da seção 8.

**Além do pedido literal (declarado):** `montarErroAgente` no formatter (Desenho §9 exigia resposta neutra de erro; não estava em nenhuma tarefa); purga do log ligada no `scheduler.js` (fora dos arquivos-alvo do cod-0016, mas sem ela o TTL de LGPD nunca rodaria); reset mensal best-effort em `verificarLimiteGratuito` (coerência dos contadores na virada — as linhas adicionadas não têm token financeiro).

**Honestidade/ressalvas:** (1) o mount do sandbox **truncou todos os arquivos editados** nesta sessão (problema recorrente, pior que antes) — os arquivos reais no Windows estão íntegros (verificados por leitura), e TODA a validação (184/184 testes, node --check, scan de firewall) rodou em cópias limpas em /tmp; **`npm run check` na sua máquina é o gate final obrigatório**. (2) Sem a migration, a cota fica fail-open (sem limite) e o log não grava — o bot responde, mas rode a migration antes do deploy. (3) Custo: cada pergunta = até 2 chamadas Gemini (classificação + narração). (4) Push é seu (Cowork sem credencial).

### 2026-06-27 — Sessão de fechar a promessa do pago + `/apagar`

**Briefing inicial (verbatim):**
> "Vamos sim fechar as funções antes de escalar e lançar, começe com o /apagar e para o comparativo de mercado ele fica disponível completamente somente no pro, mas eu acredito que seja necessário colcar pelo menos 1 ou alguns comparativos para que o usuario entenda a função e veja o valor do produto"

**Contexto:** a sessão começou com a retomada da agenda + reconciliação AGENDA × git (5 tarefas commitadas movidas pra "Concluído"). Depois expliquei o §4 da auditoria (lacuna promessa × entrega do pago); o Gabriel confirmou a sequência e mandou começar pelo `/apagar`.

**Decisões do Gabriel:**
- **Sequência:** fechar as funções prometidas do pago **antes** de escalar/lançar. Ordem: `/apagar` → comparativo → alerta Pro (este já desenhado em cod-0030..0036). O Agente de Perguntas (cod-0011→0017) **desce** na fila.
- **Gate do comparativo (A1):** completo **só no Pro**, **mas com 1+ comparativos de amostra no Free** como teaser (mostrar o valor antes de pagar).

**O que foi entregue (código, Cowork):** `/apagar` completo (cod-0006) — `src/apagar.js` puro, `apagarDadosUsuario` no `supabase.js` (DELETE em ordem de FK, **não toca** pagamento nem `precos_mercado`), 3 mensagens no `formatter.js`, handler no `index.js` **antes do gate de onboarding**, 2 passos (`/apagar` → `/apagar confirmar`). `test/apagar.test.js` (11 testes, verdes em cópia limpa). `check:firewall` ✓. **Sem migration.** Memória atualizada (CLAUDE.md decisões + CODE_GUIDE.md + AGENDA: cod-0006 em "Em revisão", gate do cod-0020 decidido, §4/A1 resolvidos).

**Honestidade registrada:** (1) o mount do sandbox serviu `formatter.js` **stale/truncado** (problema recorrente) — validei a lógica em cópia limpa em `/tmp`; o Gabriel deve rodar `npm run check` na máquina dele como gate final. (2) Pagante ativo no `/apagar` (FK de eventos de pagamento) é **follow-up financeiro humano** — fora do escopo firewall-limpo desta sessão. (3) Deploy = `git push` do Gabriel (Cowork sem credencial).

### 2026-06-27 — Sessão do Alerta Inteligente Pro + classificação como coração

**Briefing inicial (verbatim, transcrição de voz):**
> "Eu quero desenvolver mais o nosso al[e]rta inteligente. Nós já fizemos antes uma pesquisa sobre as dicas financeiras que podem ser usadas, e eu quero melhorar o[s] nossos alertas pra principalmente o plano pró, pra que ele tenha alertas de por exemplo gasto supérfluo, quanto que é o valor de gasto supérfluo e a gente pode colocar categorias de itens, que serão gastos supérfluos, a gente pode deixar de alguma forma personalizável isso, e com personalizável eu quero dizer, a pessoa pode escolher qual coisa quer ser mostrada se é uma categoria específica, se ela quer ver quanto que ela [está] gastando em que jogo ou quanto ela está gastando em um tipo específico de cerveja ou se ela está gastando em qualquer coisa. Eu quero que tenha esse tipo de personalização e que seja possível pra o bot buscar as informações, tudo dependendo do nome do item de uma classificação muito boa. Eu quero também (...) forçar especialmente agora que a gente vai mexer nessas funções a importância da classificação precisa e sem erros dos itens porque essa é a função principal então eu quero deixar aqui (...) inclusive que seja colocado no Claude MD, um aviso de que a classificação dos itens é o coração e o ponto principal do economizei, ou seja isso tem que ser levado o máximo a sério possível e da forma mais segura possível."

**Decisões do Gabriel nas perguntas de clarificação:**
- **Até onde levar agora:** *Desenho + tarefas na AGENDA* (eu não escrevo código de produto; o gate Pro mexe em `is_pro` = zona do firewall, é humano).
- **Como a pessoa configura:** *Comando + linguagem natural* — comandos previsíveis (`/acompanhar`, `/limite`) E entender "quanto gasto em cerveja?" via o Agente de Perguntas (cod-0010..0017).
- **O que pode rastrear / marcar como supérfluo:** *Categoria + palavra-chave livre* — categorias (doces, bebidas) e qualquer termo no item ("cerveja", "heineken", "chocolate", "ração"). Matching por `nome_canonico`.

**O que foi entregue (só memória/processo/design — nenhum código de produto, financeiro intocado):**
- **Aviso explícito pedido:** callout **"A classificação dos itens é o CORAÇÃO do Economizei"** em Princípios Centrais (CLAUDE.md) + reforço técnico **"Classificação é invariante crítico"** no `CODE_GUIDE.md` (nome_canonico descritivo, categoria correta, testes de regressão obrigatórios ao mexer em extração, dado de alto risco → saída segura).
- **Desenho técnico:** `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md` — 2 pilares (supérfluo + acompanhamento personalizável), engine de matching puro `casarItemComAlvo`/`buscarGastoPorAlvo`, tabela `acompanhamentos` (migration = humano), comandos + intent NL `gasto_por_termo`, gatilhos (per-compra com `/limite` + resumo mensal), Free×Pro proposto, e o **plano de endurecimento da classificação** (o porquê de o desenho casar com o aviso).
- **AGENDA.md:** cod-0023 expandido na cadeia **cod-0030..0036** (matching → acompanhamentos → supérfluo → comandos → NL → alerta de limite) + **cod-0026/0027** (classificação: prompt do `nome_canonico` liderar com o tipo genérico + corpus de regressão), com skills designadas; pré-requisitos humanos no painel "Ações do Gabriel" e em "Aguardando sua decisão".

**Pushbacks honestos registrados:** (1) **o alerta Pro só vale o que a classificação entrega** — matching de "cerveja" depende de o `nome_canonico` conter "cerveja", não só "skol"; por isso o endurecimento (cod-0026) vem **antes/junto**, não depois; (2) o **gate Pro** (`temFeaturesProAtivas`/`is_pro`), a **migration** da tabela e a **decisão de pricing Free×Pro** são humanas (firewall) — a máquina entrega a leitura/lógica, o Gabriel liga o que é dinheiro; (3) mantida a regra: aquisição/escala do anual continua condicionada a **W2 ≥ 30%** — esta feature reforça a *promessa do pago* (hoje vazia além de "cupons ilimitados"), o que é pré-requisito de cobrar o anual com tranquilidade (alinhado à pendência §4 da auditoria).

**Pendências deixadas (humano):** rodar a migration de `acompanhamentos`; ligar o gate Pro; decidir o recorte Free×Pro final; push é sempre do Gabriel (Cowork sem credencial).

### 2026-06-25 — Sessão do Gatilho de Skills na automação

**Briefing inicial (verbatim, transcrição de voz):**
> "Agora que a gente tem outra etapa do projeto e a gente está fazendo uma máquina automática de programação, que faz as funções conforme nossa agenda. Eu quero que essa automação use os que a gente tem desenvolvido, eu quero que seja criado uma regra de que o bot precisa usar uma [skill] sempre que for desenvolver uma função, seja ela uma de programação que na maioria dos casos vai ser realidade, seja essa uma de caso ele for desenvolver uma página, seja uma de estrutura caso ele esteja desenvolvendo uma nova função, enfim eu quero que nós usemos os [logins] e skills que temos desenvolvido e que essa memória seja utilizada, portanto eu quero que você desenvolva esse gatilho que sempre aconteça pra que toda automação for feita, nós usemos essas skills precisamente. E pra isso eu quero que sempre que formos programar, essas skills já estejam incluídas ou seja, na minha conversa com o Opus 4.8, eu vou designar o que o correto é pro Sonnet 4.6 utilizar."

**Decisões do Gabriel nas perguntas de clarificação:**
- **Mecânica:** *Híbrido* — o Opus designa as skills no campo `skills:` da tarefa **+** mapa tipo→skill de fallback. Acrescentou: *"quero que sempre seja perguntado quais das skills que podem ser usadas fazem mais sentido, tendo sempre uma breve explicação do que cada skill faz para contexto"* → a etapa de planejamento apresenta as skills candidatas com 1 linha cada e pergunta.
- **Rigor:** *Recomendado, não bloqueante.*

**O que foi entregue (só memória/processo — nenhum código de produto tocado):**
- `AGENDA.md`: nova seção **"🧠 Gatilho de Skills"** (regra-mãe dos 2 lados + **mapa tipo-de-tarefa→skills** + **catálogo das 18 skills** com descrição breve de cada); campo **`skills:`** no molde de tarefa; passo de skills no Protocolo (carregar antes de codar + declarar quais usou); **backfill** do campo `skills:` nas tarefas ativas (cod-0001..0003 e cod-0010..0017).
- `Economizei app/Automacao_Maquina_Noturna.md`: passo de skills no prompt `/tarefa` (§4) + nova **§4.1** explicando o gatilho.
- `tarefa.md` atualizado (com o GATILHO DE SKILLS) entregue na pasta de saída pra o Gabriel soltar em `.claude/commands/` — **`.claude/` é protegido pro Cowork**, então a cópia é manual dele.
- `CLAUDE.md` (Seção 8 + este registro + "Última atualização"); `PROJECT_INSTRUCTIONS.md` e `.claude/skills/README.md` com nota cruzada.

**Honestidade registrada:** o gatilho é **regra de prompt + declaração**, não trava de CI — o `check-firewall.mjs` escaneia diff de arquivo (dinheiro), não consegue verificar se uma skill foi "carregada". Por isso o rigor é recomendado-não-bloqueante: a disciplina de declarar as skills no resumo do diff é o que sustenta o gatilho. A blindagem financeira (zona proibida + firewall) continua valendo por cima, intocada.

### 2026-06-24 — Sessão de encurtamento das mensagens automáticas do bot

**Briefing inicial (verbatim):**
> "Eu estou percebendo que as mensagens que o bot manda são normalmente muito grandes e as informações realmente impactantes ficam escondidas no meio do texto, eu quero encurtar o tamanho das mensagens mas manter o mesmo sentido e importancia, quero que use as habilidades de copy instaladas e leia o claude.md para entender as mensagens automaticas que enviamos atualmente."

**Perguntas de clarificação (respostas do Gabriel):**
- **Escopo:** *Só as automáticas de alto impacto* — confirmação de cupom, alerta, resumo mensal, onboarding 1–4 e os lembretes (não a leva inteira do `formatter.js`).
- **Formato:** *Doc antes/depois pra aprovar* primeiro; só editar o código depois do ok.

**O que foi feito:**
- Lidos `src/formatter.js` (todas as mensagens) + as skills de copy do projeto (`economizei-copywriter` e `copy-review`).
- Doc `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`: cada mensagem antes→depois, contagem de caracteres **medida por script** (não chutada), % de redução e o porquê de cada corte. **Aprovado pelo Gabriel.**
- Aplicadas as **14 reescritas** no `src/formatter.js`: `montarResposta` (confirmação mercado + não-mercado), `montarMensagemAlerta` (3 níveis), `montarResumoMensal`, `montarOnboarding1..4`, e os 8 lembretes (`montarLembreteOnboardingD2/D7`, `InativoD3/D10/D30/D60`, `FimMes`, `Limite8`).

**Princípios honrados:** o número de maior impacto sobe pro topo (na confirmação, o total da compra **e** o total do mês ficam antes da lista de itens; no resumo mensal, a comparação com o mês anterior e a economia do ano sobem pro topo); corte de reassurance repetida; voz de WhatsApp **sem gíria proibida no bot** (`cê/tá/né/ó` — regra 2026-05-26 —, mantido só `pra/tira/manda`); **lista completa de itens preservada** na confirmação (decisão 2026-06-04); **nenhum número/preço/promessa alterado** (`financial-firewall` ok). Resultado: **−25%** (4.105 → 3.059 chars).

**Verificação:** `node --check` passou e renderizei as 14 mensagens conferindo contra o doc. ⚠️ O mount Linux do sandbox de novo serviu o `.js` com **bytes nulos** no fim (falso-positivo de sintaxe, problema já registrado); contornei com `tr -d '\000'` antes do check — recomendado o Gabriel rodar `node --check src/formatter.js` na máquina dele como gate final.

**Pendências/escopo deixado:** push é do Gabriel na máquina dele (Cowork sem credencial) — sem migração, deploy é só `git push`. Próxima rodada (se ele quiser): encurtar `/planos`, `/gastos`, as mensagens de erro e as de assinatura.

### 2026-06-24 — Sessão da migração da automação pra LOCAL (descarte do GitHub Actions)

**Contexto:** depois de montar a Máquina Noturna no GitHub Actions, o Gabriel tentou ativá-la e bateu numa sequência de fricções: erro de OIDC (`id-token: write`), e um run que ficou **verde mas falhou de verdade** (`is_error: true`) — **35 negações de permissão**, 27 turns, ~US$10 e **nenhum PR**. Ele anexou o log; diagnóstico: a action roda pedindo aprovação humana por comando e, sem ninguém às 5h, nega tudo (corta após ~20 denials). Cheguei a corrigir (`--permission-mode bypassPermissions`, comandos git/PR explícitos, `--max-turns 20`, cron desligado na validação), mas o Gabriel concluiu que **não compensa**.

**Briefing (verbatim, resumido):**
> "foi muito ineficiente essa questão, demorou demais e é uma configuração que aparentemente vai ser muito difícil pro resultado que a gente vai ter então vamos mudar todo o nosso planejamento pra colocar rodando na máquina que eu estou fazendo agora localmente, pra rodar direto na pasta e eu fazer o [commit] assim que estiver pronto. (...) faça uma limpeza no Git pra (...) descartar todo esse fluxo (...) pra que não fique coisa sobrando (...) pesando desnecessariamente."

**Análise que dei (e concordei com ele):** o GitHub Actions só se paga pelo **autônomo sem supervisão**; como ele prefere rodar e revisar na hora, todo o aparato (App, secret, OIDC, permission-mode, branch protection, "verde mentiroso", custo por run) vira peso sem retorno. **Local** = usa o Claude Code que ele já tem, zero infra, controle total, custo só do que ele acompanha.

**O que entreguei nesta sessão:**
- **Modo local no firewall:** `scripts/check-firewall.mjs --working` (checa mudanças não commitadas, incluindo arquivos novos) e passou a **só escanear conteúdo de arquivos de código** (`.js/.mjs/...`) — corrige o falso-positivo em que `CLAUDE.md`/`AGENDA.md` citam "is_pro/assinatura" em prosa.
- **Scripts npm:** `check` (firewall --working + testes + páginas), `test`, `check:firewall`, mantido `validate:pages`. `node --test "test/**/*.test.js"` (cross-platform, ignora o legado `src/test-gemini.js`).
- **Runner local:** conteúdo do comando `/tarefa` (pra salvar em `.claude/commands/tarefa.md` — não pude criar por aqui, `.claude` é protegido) escrito no guia; alternativa é colar o prompt no Claude Code.
- **Guia reescrito pra local** (`Automacao_Maquina_Noturna.md`); `AGENDA.md` (intro/protocolo/painel) atualizada; `CLAUDE.md` (boot note, última atualização, decisão, este registro).
- **Limpeza (comandos pro Gabriel rodar):** `git rm .github/workflows/ci.yml .github/workflows/claude-nightly.yml`; apagar `pages-ci.yml` (untracked); remover branch protection do check "CI" (senão trava PRs futuros); opcional desinstalar app + apagar secret. `monthly-cron.yml` fica.

**Honestidade registrada:** validei a lógica do firewall (selftest 16/16 e cenários --working) antes dos 2 últimos ajustes; o mount do sandbox voltou a servir o `.mjs` truncado (213 linhas reais vistas como 198), então a verificação final dos 2 ajustes foi por leitura íntegra do arquivo, não por execução — recomendado o Gabriel rodar `npm run check:firewall` na máquina dele como gate. **Aprendizado-chave pro projeto:** pra operação de 1 pessoa, automação autônoma em nuvem custou mais (configuração + dinheiro + um run de US$10 sem resultado) do que entregou; o modelo assistido-local dá o mesmo ganho com controle e sem infra.

### 2026-06-24 — Sessão de estrutura jurídica + pagamentos + afiliados (Gabriel no Canadá)

**Contexto descoberto na sessão:** Gabriel está em Vancouver, BC, Canadá — não no Brasil. Saída fiscal declarada à Receita Federal. Isso mudou completamente a análise de abertura de empresa e pagamentos.

**Briefing inicial:** Gabriel perguntou sobre a possibilidade de abrir empresa em Vancouver ao invés do Brasil para fazer anúncios e integrações na Meta, mencionando não ter acesso fácil ao país. Corrigiu em seguida: ele está no Canadá e não tem fácil acesso ao Brasil.

**O que foi discutido e decidido:**

**(1) Empresa em BC (Canadá):** confirmado como caminho principal. BC é ideal para não-residentes (sem exigência de diretores residentes, 100% propriedade estrangeira, abertura em 1-2 dias). Gabriel abre pessoalmente, tem conta bancária canadense, Meta Business fica na empresa canadense. Sem os 12,15% de impostos sobre ads brasileiros. Documento criado: `Economizei app/Abertura_Empresa_BC_2026-06-24.md` (passo a passo, custos, impostos).

**(2) Mercado Pago abandonado:** MP exige residência brasileira; com saída fiscal declarada é risco jurídico. Substituído por estrutura em camadas: Hotmart para anuais (cuida de NF, paga para Canadá, suporta afiliados); Wise Business BRL para mensais (PIX do usuário → Wise → converte para CAD).

**(3) Conta bancária brasileira:** orientado que conta corrente comum é irregular após saída fiscal — deve ser convertida em CDE (Conta de Domiciliado no Exterior) ou encerrada. Recomendado consultar contador especializado em brasileiros no exterior.

**(4) Programa de afiliados via Hotmart:** afiliados vendem exclusivamente os planos anuais (R$99/R$150/R$220). Dois perfis: afiliação aberta no marketplace + influencers de finanças recrutados diretamente. Comissão 20-25% recorrente em cada renovação. Pendência técnica: webhook Hotmart → `/admin/ativar-pro`.

**Pushbacks honestos registrados:** (a) Hotmart cobra ~10% por transação — inviável no mensal (30% da receita) mas aceitável no anual (11%); (b) a conta bancária brasileira precisa ser regularizada — manter conta corrente comum após saída fiscal é risco; (c) programa de afiliados depende do webhook funcionando antes de lançar — afiliado que vende sem ativação automática é desastre operacional.

**Pendências desta sessão (HUMANO):** abrir a empresa em BC (passo a passo no doc); converter conta bancária brasileira para CDE ou encerrar; registrar na Hotmart como não-residente canadense; construir webhook de ativação Hotmart.

### 2026-06-23 — Sessão da virada da Máquina Noturna pra CÓDIGO (com firewall financeiro)

**Briefing inicial (verbatim):**
> "Eu entendi todo o plano mas eu gostaria que o bot fizesse na verdade, mudanças de código e que a questão financeira fosse protegida com toda a certeza pra que o bot não mexesse em coisas do tipo mas, eu quero que ele faça alterações do código, que ele desenvolva funções novas, que ele atualize coisas no próprio código e essa função principal por agora dessa automação. Eu quero que você mude isso na agenda, que você mude isso do planejamento que aí sim a gente possa prosseguir. Faça também um documento separado do passo a passo com o ícone do que que eu preciso fazer, do que que é pro bot fazer incluindo também os que serão preciso colocar, pra que eu possa fazer caso tenha alguma coisa que necessite."

**O que mudou em relação à montagem anterior (páginas → código):** a máquina deixa de mirar páginas estáticas e passa a **mexer no código do bot** (funções novas, refino, bugfix) — com a **condição inegociável** de blindar o financeiro.

**Como a blindagem foi feita (não é só instrução):** trava de código `scripts/check-firewall.mjs` que roda no CI e **reprova o PR** se o diff tocar dinheiro, por (1) **denylist de caminho** (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile`, o próprio firewall) e (2) **scan de conteúdo** nas linhas adicionadas (mercadopago, is_pro, assinatura, preapproval, MP_, pix, checkout, paywall, ativar-pro, montarMensagemPlanos, features_pro_ate). Com **branch protection** exigindo o check **"CI"**, PR financeiro fica não-mergeável. Explicado ao Gabriel: é a garantia mais forte possível; nenhum sistema é 100%, mas o financeiro não passa silenciosamente.

**Rede de segurança de código (o projeto não tinha testes):** novo `ci.yml` roda firewall → `node --check` (sintaxe) → `node --test` (testes) → `check-pages`. Baseline `test/insights.test.js` (5 testes, verde) + **TDD obrigatório** no prompt da run. `claude-nightly.yml` reescrito (zona proibida explícita, `--max-turns 40`).

**Entregas desta sessão:**
- `scripts/check-firewall.mjs` (firewall financeiro, com `--selftest`).
- `test/insights.test.js` (baseline + exemplo de teste).
- `.github/workflows/ci.yml` (CI completo) e `claude-nightly.yml` reescrito; `pages-ci.yml` virou stub deprecado (não deu pra remover via Cowork — apagar no PC).
- `AGENDA.md` repropostas (taxonomia de código, bloco 🚫 Zona proibida, tarefas-semente cod-0001/0002/0003).
- **`Economizei app/Passo_a_Passo_Maquina_Noturna.md`** (doc separado pedido: passo a passo com ícones 👤 você / 🤖 máquina / ⚙️ configurar / 🚫 proibido + tabela quem-faz-o-quê).
- Guia `Automacao_Maquina_Noturna.md` atualizado (foco código + seção do firewall) e este CLAUDE.md (boot note, última atualização, decisão, registro).

**Pushback honesto registrado:** código autônomo de madrugada é **bem mais arriscado** que página estática. Foi aceito porque o conjunto firewall + testes + draft PR + revisão de manhã segura o risco — mas a disciplina de revisar todo PR de manhã é o que sustenta isso. Sem isso, não soltar.

**Validação no sandbox:** firewall selftest 16/16; 4 cenários git (limpo passa / `is_pro` escondido bloqueia / `package.json` bloqueia / `supabase/` bloqueia); 5 testes verdes; `node --check` ok; check-pages verde.

**Pré-requisitos de ativação (HUMANO):** `git push`; `/install-github-app`; **autenticação por assinatura** — `claude setup-token` → secret **`CLAUDE_CODE_OAUTH_TOKEN`** (a run usa a cota Pro/Max do Gabriel, sem comprar API; alternativa é `ANTHROPIC_API_KEY` + trocar a linha de auth, já comentada no `claude-nightly.yml`); branch protection na `main` exigindo o check **"CI"**; testar 1× via Actions → *Run workflow* com a `cod-0001`. **Nota operacional recorrente:** push é sempre do Gabriel na máquina dele (Cowork sem credencial). **Decisão de auth (2026-06-24):** o Gabriel optou por rodar com a **assinatura Claude Pro/Max via OAuth** em vez de comprar créditos de API — workflow já configurado com `claude_code_oauth_token`.

### 2026-06-23 — Sessão do plano anual (aumento de ticket médio)

**Briefing inicial (resumo do Gabriel):** com investimento inicial de ~R$200 e custo por usuário de ~R$54 (mínimo ~R$30), precisa aumentar lucro/margem **subindo o ticket médio**. Quer um **plano anual** em que a pessoa paga **~R$100 por 12 meses, economizando ~2 meses**, e quer que **~80% dos usuários fiquem no anual**, pago **via PIX ou cartão**, pra ter ticket médio maior e "um investimento que faça mais sentido". Pediu pra **registrar no CLAUDE.md**, mudar **todas as referências** e começar a trabalhar nesse sentido. Também: usar a economia do anual como **exemplo de marketing no próprio site** — mas **deixar essa ideia em fila de aguardando decisão**. Anexou o caveat do `financial-firewall` (não escalar aquisição antes de validar W2; aquisição não conserta retenção) e o material de métricas de tráfego pago da sessão anterior.

**Perguntas de clarificação (respostas do Gabriel):**
- **Escopo do anual:** *Os 3 planos pagos* (não só o Individual).
- **Mensal × anual:** *Anual em destaque, mensal continua* (oferta-destaque, não anual-exclusivo).

**O que foi entregue (só CLAUDE.md + AGENDA.md nesta sessão):**
- Seção 3 reescrita: tabela com mensal **e** anual (Individual R$99 / Família R$150 / Família+ R$220 ao ano = ~2 meses grátis), anual como destaque, mensal mantido, PIX **ou** cartão, bloco "por que o anual virou o norte comercial" + os 4 caveats honestos + nota do preço R$99.
- Métricas novas: **ticket médio/ARPU** e **% de pagantes no anual**; W2 marcado como gatilho de escala.
- Fluxo de pagamento atualizado pra refletir destaque do anual + cartão MP + pendências de implementação.
- Cabeçalho "Última atualização", linha na tabela de Decisões (Seção 8) e este registro.
- `AGENDA.md`: ideia do "exemplo de economia na landing" parada em **fila de decisão do Gabriel**.

**Pushbacks honestos que precisei dar (e ficaram registrados):** (1) **80% no anual é estrela-guia, não premissa de dia 1** — R$99 à vista é pedido bem maior que R$9,90/mês e fere menos o "zero atrito" só porque o mensal continua; o caminho que converte é free → viver o valor → upsell anual, não vender anual a frio; (2) **anual amplifica, não conserta** — caixa adiantado NÃO libera escalar os R$200+ antes de **W2 ≥ 30%** (honrei o `financial-firewall` que ele mesmo colou); (3) fixei **R$99** em vez de R$100 pra fechar a narrativa "pague 10, leve 12"; (4) acrescentei política de **reembolso proporcional** (cobrar um ano de quem usou 2× e sumiu gera risco). As decisões do Gabriel foram acatadas; os riscos foram anotados, não impostos.

**Pendências deixadas (não feitas nesta sessão — precisam do Gabriel/código):** criar os planos anuais no painel do **Mercado Pago**; expor o ciclo anual no `/planos` e no `/assinar` (`formatter.js` + checkout); refletir o anual no bloco de pricing da `landing/index.html`. Ofereci fazer essas três a seguir. **Nota operacional:** push pro GitHub e mudanças de pagamento são sempre do Gabriel na máquina dele — o Cowork não tem credencial; e pricing/landing são "decisões dele", então parei no registro + plano.

### 2026-06-23 — Sessão da Máquina Noturna (automação autônoma de páginas)

**Briefing inicial (verbatim):**
> "Pensando nessa automação vamos trabalhar em uma maquina que possa trabalhar sozinha em se aprimorar conforme a direção dada por mim atravez de um planejamento conjunto com a maquina. Eu quero que a automação aconteça as 5 da madrugada e que por agora as ações sejam focadas em gerações de paginas (...) girando em torno de uma agenda que eu vou elaborar cada nova etapa dependendo de prioridade, urgência (...) discutidos junto com a IA no OPOS quatro ponto oito, porém eu quero que toda essa automação seja feita no Sonet. (...) uma forma de que eu consiga, a cada nova conversa, acompanhar essa agenda e decidir atividades importantes da IA, coisas que eu preciso fazer porque a gente não consegue fazer (...) que elas estejam referenciada no claud[e] (...) pra que eu consiga ter sempre essa memória guardada."

Complemento: *"Eu disse o comando errado na última vez, eu quero ir testando o que é capaz de desenvolver com essa ferramenta e não limitar a algo logo de início então continue e me pergunte o que for necessário."* (Doc de referência anexado: `automacao-claude-code-agendado.md`.)

**Perguntas de clarificação (respostas do Gabriel):**
- **Tipo de página:** *Landing + A/B **e** Conteúdo/SEO.*
- **Onde fica a agenda:** *`AGENDA.md` no repo* (vira memória lida em toda sessão).
- **Entrega agora:** *Plano + scaffolding pronto pra push.*
- **Segurança:** pediu pra **explicar** o que é rede de segurança / CI leve / PR e como começar isso junto com a automação (respondido no guia + chat; adotada a postura recomendada: rascunho + CI leve).

**Arquitetura escolhida (2 cadeiras):** planejamento no **Opus 4.8** (com o Gabriel, escreve a tarefa na `AGENDA.md`) → execução no **Sonnet 4.6** (run noturna headless via GitHub Actions, sozinha, nunca decide produto). Cron `0 8 * * *` = **05h BRT**. PR-first: a máquina trabalha em branch e abre **PR rascunho**; nada entra na `main` sem o Gabriel.

**O que foi entregue (scaffolding real, pronto pra `git push`):**
- `AGENDA.md` — fila viva + protocolo parseável pela run + seções (Fila pronta / Em revisão / Concluído / Backlog / **Ações do Gabriel**) + 4 tarefas-semente (pag-0001 roteamento Vercel, pag-0002/0003 guias SEO, pag-0004 variação A/B).
- `.github/workflows/claude-nightly.yml` (motor Sonnet, 5h, prompt completo) e `.github/workflows/pages-ci.yml` (CI leve em PRs de página).
- `scripts/check-pages.mjs` (validador HTML zero-dependência; **testado verde** nos 5 HTML existentes) + `npm run validate:pages`.
- Guia `Economizei app/Automacao_Maquina_Noturna.md` (arquitetura, rede de segurança explicada, setup, rollout, custos).
- `CLAUDE.md`: boot list (+AGENDA.md, "leia os 4"), arquitetura modular, "Última atualização", linha em Decisões e este registro.

**Decisões honradas / pushbacks:** escopo travado em `landing/`+`docs/` — a máquina **não toca `src/`/pagamentos/Supabase** (guarda-rail `financial-firewall`: página é reversível, código do bot não); autonomia só na execução, julgamento de produto fica com o Gabriel; rede de segurança ligada **antes** do automático soltar (isolamento → CI → branch protection → cron). Achado técnico: `vercel.json` catch-all tornava páginas novas inalcançáveis → virou a 1ª tarefa (`pag-0001`) num PR revisável, em vez de eu mudar roteamento de deploy por conta própria.

**Pré-requisitos de ativação (HUMANO, nesta ordem):** (1) `git push` dos arquivos; (2) `/install-github-app` (cria o secret `ANTHROPIC_API_KEY`); (3) branch protection na `main` exigindo o check "CI Páginas"; (4) opcional: Vercel Preview Deployments; (5) testar 1× via Actions → *Run workflow* antes de confiar no cron das 5h.

**Nota operacional recorrente:** push pro GitHub é sempre do Gabriel na máquina dele — o Cowork não tem credencial. Os arquivos foram salvos direto em `C:\Economizei`; `node scripts/check-pages.mjs` rodou verde no sandbox (0 erros nos 5 HTML).

### 2026-06-23 — Sessão de estratégia de tráfego pago + criação de páginas

**Briefing inicial (resumo):** Gabriel vem consumindo conteúdo sobre página, tráfego pago e "foot traffic internet", como isso traz vendas, como criar várias campanhas no Google Ads focando em avaliações/credibilidade, e estudar métricas (custo por clique, custo por venda etc.) — começando com ~R$200 e "duplicando campanhas com alterações" pra melhorar números e vendas. Quis criar uma **automação de criação de página com subdomínio** pra divulgar o Economizei facilmente, prospectar clientes e gerar mais usuários/assinaturas, **pulando a etapa do orgânico** (lento demais pra quem tem tempo escasso), com um certo nível de investimento. Pediu uma **seção/documento** sobre criação de páginas e divulgação paga, e pediu explicitamente que eu **fizesse perguntas** sobre pontos vagos antes.

**Perguntas de clarificação (respostas do Gabriel):**
- **Objetivo do R$200:** *Cadastros grátis (topo de funil).*
- **Canal:** *Os dois ao mesmo tempo (Meta + Google).*
- **Escopo da entrega:** *Só pesquisa + estratégia (documento).*
- **Orçamento:** *Começo com ~R$200 e aumento se der retorno.*

**O que foi entregue:** `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` (pesquisa web → estratégia adaptada) + linha em Decisões (seção 8), entrada em Recursos (seção 10), cabeçalho "Última atualização" e este registro.

**Pushbacks honestos que precisei dar (e estão no doc):** (1) o playbook de tráfego pago que ele vê é de e-commerce — o funil dele é cadastro grátis no WhatsApp, métrica-rainha é **custo por ativação (1º cupom)**; (2) o canal certo é **Meta CTWA**, não o Google (sem demanda de busca pra capturar); (3) com R$200, **rodar os dois ao mesmo tempo mata o aprendizado** — recomendei Meta primeiro / Google depois, honrando o desejo dele de conhecer os dois de forma sequencial; (4) "duplicar campanhas" hoje causa sobreposição de leilão — o jeito certo é poucos ângulos + escala vertical + teste A/B oficial; (5) `financial-firewall`: R$200 pra aprender = ok, escalar só após W2 ≥ 30% (mídia não conserta retenção). Mantive o respeito à autonomia dele: as decisões dele foram acatadas, os riscos foram registrados.

**Pendências deixadas:** validar se o número do bot (Z-API) pode ligar ao Meta Business pra CTWA; ligar a leitura de código de campanha no 1º contato (reaproveita `/convidar`) pra atribuição; construir template de landing clonável + passo a passo de subdomínio na Vercel — só quando o Gabriel sair do "só estratégia".

### 2026-06-18 — Sessão de implementação de F2, F1 e F4 (funções de inteligência)

**Briefing inicial (verbatim):**
> "Vamos desenvolver a F2, F1, e F4 em ordem."

Precedido por um pedido de análise: "Planejar qual das alterações será mais complexa e qual será mais efetiva (...) a missão agora é deixar o economizei mais robusto e com funções que realmente façam diferença na vida do usuário." Entregue mapa de quadrante complexidade × efetividade das 12 funções + resumo de cada uma. Veredito: F5 (comparativo) é a mais complexa e a mais efetiva, mas bloqueada por densidade de dados; F2/F1/F4 são as mais efetivas construíveis já (recomendação F2→F1→F4).

**O que foi implementado (nesta ordem):**
- **Novo módulo `src/insights.js`** — funções puras de análise, sem I/O, separando a "inteligência" do acesso a dados (`supabase.js`) e dos templates (`formatter.js`).
- **F2 — Raio-X de categoria com conclusão:** `analisarRaioXCategorias` + `buscarHistoricoCategorias` (média da participação de cada categoria nos 3 meses anteriores). O `/gastos` agora conclui: maior categoria, se está acima/abaixo da média do próprio usuário, e candidato discricionário a corte. `montarMensagemGastos` ganhou 3º parâmetro opcional `analise`.
- **F1 — Inflação pessoal por item:** comando `/inflacao` + `analisarInflacaoPessoal` + `buscarHistoricoPrecoItens`. Preço unitário normalizado (`preco_total/quantidade`, robusto a item por peso); filtros de honestidade (2+ observações, ≥14 dias, variação 8–150% — descarta ruído de unidade).
- **F4 — Quanto você já economizou:** comando `/economia` + `calcularEconomia` + `buscarTotaisMensais`. Média móvel de 3 meses; `economiaAno` soma só os meses abaixo da média (copy honesta). Reforço de economia anual também no resumo mensal (`montarResumoMensal` ganhou 4º parâmetro `economia`).
- Boas-vindas atualizadas com `/inflacao` e `/economia`.

**Decisões honradas:** zero atrito (a IA conclui, o usuário não calcula nada); honestidade/`financial-firewall` (descarte de variação absurda em F1; copy de F4 afirma exatamente o que o número representa); F1/F2/F4 ficam Free (Camada 2/3 com o dado que já temos). F5 (comparativo) segue adiada por densidade; F3 ("onde cortar") fica pra próxima leva.

**Verificação:** `node --check` ok nos 5 arquivos; teste das funções puras com dados sintéticos (F1/F2/F4 + resumo mensal), saídas conferidas (inclui descarte correto de item de mesma semana e de variação abaixo do limiar em F1).

**Pré-requisitos de deploy:** **nenhuma migração** — todas as funções leem colunas que já existem (`preco`, `preco_total`, `quantidade`, `nome_canonico`, `categoria`, `compras.total/data_compra/tipo`). Deploy é só `git push` (Gabriel, na máquina dele). Recomendado `node --check src/*.js` local antes do push.

**Ressalvas honestas:** (1) F1/F2 dependem da qualidade do `nome_canonico`/`categoria` — itens mal canonicalizados podem não casar entre compras (não quebra, só reduz cobertura); (2) F1 usa `preco_total/quantidade` como preço unitário — cupons antigos sem `preco_total` caem no `preco`, e linhas com total-da-linha gravado em `preco` podem gerar comparação imprecisa pra aquele item; (3) F4 usa `tipo='mercado'` — compras não-mercado antigas mal classificadas (ver backfill pendente) podem entrar na média até serem renovadas.

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o ambiente Cowork não tem credencial. Nesta sessão o `node --check` rodou limpo nos 5 arquivos via sandbox.

### 2026-06-09 — Sessão de pesquisa de finanças → funções do bot

**Briefing inicial (verbatim):**
> "Então agora que a gente já tem esse documento, eu quero que você faça uma pesquisa extremamente profunda na internet, sobre assuntos relacionados à finanças do mercado, à finanças de gastos no dia a dia, e eu quero que você pegue cada dica e pense como que você pode transformar ela numa função pra o nosso bot. Então eu quero que você pesquise em vídeos, sites, tudo que seja relacionado à finanças pessoais, a gastos do dia a dia, gastos de mercado, gastos pessoais, e que todas as dicas que forem de ponto chave (...) consigam trazer um benefício de economia ou de melhor gasto para, o usuário, vamos tentar transformar ela numa função pra melhorar como você disse a etapa dois e três, de ter o que fazer com isso, e como trabalhar com a IA e os dados que a gente vai receber."

**O que foi entregue:**
- `Economizei app/Pesquisa_Dicas_Financeiras_Funcoes_Bot_2026-06-09.md` (novo): pesquisa web em 5 frentes (orçamento/50-30-20; economia no supermercado; finanças comportamentais; apps de comparação/cashback; hábitos de poupança/inflação pessoal/custo em horas) → **12 funções candidatas** organizadas em 3 tiers, cada uma com dica de origem, exemplo de mensagem, camada, veredito do Teste de Norte, triagem 🤖/🤝/🛠️/🧍, dado necessário, esforço e candidato Free/Pro. Tabela priorizada + sequência recomendada (F2 → F1 → F4 → F3). Fontes linkadas.
- `CLAUDE.md`: linha na tabela de Decisões (seção 8), entrada em Recursos (seção 10) e este registro.

**Princípios honrados na curadoria:** (1) só virou função a dica que a **IA consegue concluir a partir do dado do cupom** sem pedir trabalho novo da pessoa (zero atrito); (2) **honestidade** — gastos invisíveis/assinaturas reprovados porque o bot não vê fatura de cartão; (3) **bem-estar** — a "técnica do elástico no pulso" (que apareceu na pesquisa) foi **deliberadamente excluída**: não usamos desconforto físico como freio de comportamento, o combate ao impulso é informacional; (4) **nenhum preço/promessa fechado** — Free/Pro das funções é candidato a decidir, passa pelo `financial-firewall`.

### 2026-06-09 — Sessão de criação do documento de Posicionamento & Norte Estratégico

**Briefing inicial (verbatim):**
> "Vamos lá, agora eu quero trabalhar num documento de posicionamento que vai ficar registrado no Claude MD (...) tendo em vista de que o economizei, tem como função e tem como missão Fazer com que o brasileiro médio entenda os seus gastos e fazer a utilizacao da inteligência artificial pra, trazer conhecimento, informação, e inteligência por si só, ao gasto do brasileiro médio. (...) o norte que devemos seguir pras nossas funções, pra tudo que devemos seguir agora é pensar em, levar ao brasileiro médio a ciência de em que ele está gastando, como está gastando. e que isso traga pra ele uma habilidade financeira melhor. Faça com que ele gaste seu dinheiro melhor, faça com que ele economize dinheiro e tenha mais valor. Sobre o seu dinheiro."

**Decisões do Gabriel nas perguntas de clarificação:**
- **Onde registrar:** "Seção no CLAUDE.md + doc completo" — nova seção 1.5 no CLAUDE.md (lida toda sessão) + documento detalhado em `Economizei app/`.
- **Função do doc:** "Norte + filtro de decisão" — além de declarar missão/posicionamento, embutir um **Teste de Norte** acionável que toda feature/copy/roadmap precisa passar.

**O que foi entregue:**
- `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` (novo): missão por inteiro, o reframe de "leitor de cupom" → "inteligência financeira do brasileiro médio", o que somos/não somos, **3 camadas de valor** (Ciência → Inteligência → Habilidade), o **Teste de Norte** (pergunta-mãe + 4 sub-perguntas + exemplos PASSA/NÃO PASSA), mapa das funções atuais contra as camadas, implicações pro roadmap, guarda-rails e ritual de revisão.
- `CLAUDE.md`: nova **seção 1.5** (resumo do norte + camadas + Teste de Norte) + linha na tabela de Decisões (seção 8) + este registro + cabeçalho "Última atualização".

**Princípio-chave reforçado:** *"o cupom é a porta; a inteligência é o produto. A cada foto, a pessoa sai mais esperta com o próprio dinheiro."* O norte responde "para onde"; os princípios em vigor (zero atrito, grátis funciona, frame brasileiro) respondem "de que jeito". O norte não revoga nenhuma decisão anterior — é a lente que organiza as próximas.

### 2026-06-09 — Sessão de mudança de pasta + restauração + correção de skills

**Briefing (resumo):** Gabriel moveu a pasta do projeto de `E:\Economizei Bot` para `C:\Economizei` e pediu para (1) atualizar todas as referências ao caminho antigo, (2) corrigir a contagem inconsistente de skills e verificar a estrutura (`/engineering:system-design`).

**Achado crítico:** a pasta reconectada `C:\Economizei` era uma **cópia mais antiga** (estado 2026-06-07) — não continha os 2 documentos de 06-09 nem as edições do CLAUDE.md feitas nas sessões anteriores desta conversa (que tinham sido salvas na `E:\Economizei Bot`, agora desconectada/vazia). Decisão do Gabriel: **tornar `C:\Economizei` a versão oficial e restaurar tudo**. Os 2 documentos foram recriados a partir do conteúdo em memória e as edições do CLAUDE.md reaplicadas.

**O que foi feito:** (1) substituição de todas as referências `E:\Economizei Bot` → `C:\Economizei` em 12 arquivos + `.claude/settings.local.json` (mantidas as menções ao **nome** do projeto); (2) restauração dos 2 docs de 06-09 + reaplicação das seções/decisões/comandos no CLAUDE.md; (3) padronização da contagem de skills e instalação da `economizei-strategic-review` em `.claude/skills/`.

### 2026-06-07 — Sessão de fechamento das 2 ressalvas (idempotência + backfill)

**Briefing inicial (verbatim):**
> "Quero trabalhar nesses 2 erros que você me apontou anteriormente, leia o claude.md e as instruções de skill e vamops trabalhar nisso. Duas ressalvas honestas: dados antigos não são reescritos (linhas sem `preco_total` usam o cálculo antigo; cupons não-mercado já salvos entram na média como 'mercado' até serem renovados pelo fluxo novo). E descobri que a 'lei 5' do CODE_GUIDE — idempotência por messageId — está documentada mas nunca foi implementada: o webhook não deduplica, então mandar o mesmo cupom 2× cria 2 compras."

**O que foi implementado:**
- **Idempotência (lei 5):** `migration_2026-06-07_idempotencia_messageid.sql` (tabela `mensagens_processadas`, PK `message_id`); `registrarMensagemProcessada` + `purgarMensagensProcessadas` em `supabase.js`; `despacharComDedup` no `index.js` envolvendo o dispatch texto/imagem (loga `webhook_evento_duplicado` / `webhook_sem_message_id`); purga diária TTL 7d no cron das 7h (`scheduler.js`).
- **Backfill:** `supabase/backfill_2026-06-07_dados_antigos.sql` — Parte 1 reclassifica `tipo='outros'` (heurística por loja, PREVIEW antes do UPDATE); Parte 2 opcional preenche `preco_total` (no-op nos números, documentado).

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `migration_2026-06-07_idempotencia_messageid.sql` no SQL Editor; (2) opcional: rodar `backfill_2026-06-07_dados_antigos.sql` bloco a bloco, revisando os PREVIEWs; (3) `git push` (Gabriel, na máquina dele).

**Ressalvas honestas remanescentes:** (1) o dedup depende do Z-API enviar `messageId` — se o payload não trouxer, processa sem dedup (loga `webhook_sem_message_id`); confirmar no 1º cupom real que o campo chega. (2) idempotência protege contra reentrega do MESMO evento (retry do gateway), NÃO contra o usuário mandar a foto 2× de propósito (são messageIds diferentes) — isso é comportamento esperado. (3) backfill de `preco_total` não recupera precisão perdida de cupons antigos (imagem não guardada); por isso veio opcional/comentado.

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o Cowork não tem credencial. Nesta sessão o mount Linux do sandbox de novo serviu versões truncadas em cache dos `.js`, então `node --check` no sandbox falhou com falso-positivo (arquivos reais íntegros, validados por releitura dos blocos e fronteiras via Read). **Recomendado rodar `node --check src/*.js` localmente antes do push como gate final.**

### 2026-06-07 — Sessão de correção dos outputs incoerentes do bot

**Briefing inicial (verbatim):**
> "Tenho visto inconsistencias nas gravações dos cupons, mandando o mesmo cupom eu tive varios resultados, sendo 38,39 ou 40 produtos registrados do mesmo cupom (...) a mensagem que é mandada logo em seguida não faz sentido, ela sempre manda compra acima do padrão, precisamos colocar outros tipos de respostas dependendo da compra, ficar sempre alertando também não é ideal. E mais grave que isso é que os numeros não fazem sentido, normalmente o numero de porcentagem e o valor em reais é inventado ou não fazem sentido (...) faça o que for preciso para investigar esses outputs incoerentes."

**Diagnóstico (3 sintomas, nenhum era erro de fórmula — eram entradas ruins):**
1. **Contagem de itens oscilando (38/39/40):** Gemini rodava com temperatura padrão (~1.0) = não-determinístico. Sem reconciliação item×total, item perdido passava despercebido.
2. **Alerta sempre "acima do padrão":** `calcularMedia` misturava compras de mercado com não-mercado (farmácia/posto, valores baixos), derrubando a média; e só existia 1 template de follow-up (o alerta de "acima").
3. **Números que não batem:** duas fontes de verdade para "total" sem conciliação — `compras.total` (Gemini) vs. soma dos itens. E `itens_compra` só guardava `preco` (unitário), recalculando `preco×qtd` na categoria (dobra valor de item por peso).

**Decisões do Gabriel nas perguntas de clarificação:**
- **Escopo:** implementar os 4 fixes — determinismo do Gemini, total único de verdade, alerta inteligente em 3 níveis, e reconciliação item×total.
- **Comportamento do alerta:** "Você decide depois" → implementar a estrutura dos 3 níveis (abaixo/dentro/acima) mas deixar o gatilho **configurável por env**; afinar numa próxima rodada. Default escolhido: `ALERTA_MODO=relevante` (só fala quando foge do padrão).

**Implementado nesta sessão:**
- `supabase/migration_2026-06-07_coerencia_outputs.sql` (novo): `itens_compra.preco_total` + `compras.tipo` + índice. **Rodar antes do push.**
- `gemini.js`: `generationConfig {temperature:0, responseMimeType:'application/json'}`; `reconciliarItens` + log `gemini_reconciliacao_divergente`; `lerRecibo` escolhe a melhor das 2 tentativas via `_scoreReconciliacao`.
- `supabase.js`: grava `preco_total` e `tipo`; `calcularMedia` filtra `tipo='mercado'`; `buscarGastosPorCategoria` agrega por `preco_total` (fallback `preco×qtd`) + fatia resíduo `nao_identificado` fechando com o total do cupom.
- `alerts.js`: reescrito — `avaliarCompra` (níveis + limiares por env), `deveEnviarMensagem` (modo por env), `verificarAlerta` mantido como wrapper de compat.
- `formatter.js` + `charts.js`: `montarMensagemAlerta` recebe objeto de avaliação e tem 3 tons; label+cor de `nao_identificado`.
- `index.js`: usa `avaliarCompra`/`deveEnviarMensagem`; não-mercado nunca alerta.
- `.env.example`: `ALERTA_LIM_ACIMA`, `ALERTA_LIM_ABAIXO`, `ALERTA_MODO`.

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `supabase/migration_2026-06-07_coerencia_outputs.sql` no SQL Editor; (2) `git push` (Gabriel, na máquina dele). Opcional: ajustar as envs `ALERTA_*` no Railway.

**Pendências/ressalvas deixadas:** (1) linhas antigas de `itens_compra` sem `preco_total` caem no fallback `preco×qtd` — comportamento idêntico ao anterior, não retroativo; (2) `compras.tipo` antigas viram 'mercado' por default (não-mercado antigas entram na média até serem substituídas pelo fluxo novo); (3) a "lei 5" do CODE_GUIDE (idempotência via messageId) segue **documentada mas não implementada** — o webhook não deduplica por messageId; mandar o mesmo cupom 2× ainda cria 2 compras (fora do escopo desta sessão, candidato a próxima).

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele — o ambiente Cowork não tem credencial. Nesta sessão o mount Linux do sandbox serviu versões em cache defasadas de `formatter.js`/`CLAUDE.md`/`CODE_GUIDE.md`; as edições foram aplicadas nos arquivos reais (Edit guardou contra cache via "modified since read") e `node --check` passou nos 6 arquivos.

### 2026-06-07 — Sessão de criação do comando `/convidar` (indicação)

**Briefing inicial (verbatim):**
> "Vamos começar a trabalhar no comando compartilhar (...) quais benefícios e incentivos podemos dar ao usuario por fazer esse favor, eu estava pensando em talvez dar acesso limitado aos recursos do premium ou até ganhar mais cupons, podemos fazer por exemplo uma ação de compartilhar valer mais cupons e quando esse outro contato por esse link ativar o plano a pessoa ganha acesso aos benefícios do pro por tempo limitado."

**Achado que mudou o ponto de partida:** `/compartilhar` já existia (liga/desliga compartilhamento anônimo de preços). O comando de indicação virou **`/convidar`** (aliases `/indicar`, `/convite`) pra não colidir.

**Decisões do Gabriel nas perguntas de clarificação:**
- **Gatilho:** "2 marcos (ativação + conversão)" — recompensa quando o amigo manda o 1º cupom E quando vira Pro pagante.
- **Moeda da recompensa:** "Features Pro por X dias (sem mexer no limite de cupons)" — escolhida em vez de "mais cupons" (que furaria o teto de custo Gemini) e em vez de Pro completo.
- **Números:** confirmou os defaults — 7 dias na ativação (os dois lados), +30 dias na conversão (indicador), teto de 60 dias.
- **Comando final:** "faça a codagem e deixe tudo pronto para fazer o push."

**Implementado nesta sessão:**
- `supabase/migration_003_indicacoes.sql` (novo): colunas `codigo_indicacao` + `features_pro_ate` em `usuarios`; tabela `indicacoes` (1 linha por indicado, UNIQUE em `indicado_phone`).
- `src/supabase.js`: `gerarCodigoIndicacao`, `registrarIndicacaoPendente`, `concederFeaturesPro` (com teto), `ativarIndicacao`, `converterIndicacao`, `marcarProAtivo`, `buscarStatusIndicacoes`, `temFeaturesProAtivas` (helper de gate futuro) + `features_pro_ate` no select do `upsertUsuario`.
- `src/formatter.js`: `montarMensagemConvite`, `montarBoasVindasIndicado`, `montarAvisoIndicacaoAtivada`, `montarAvisoIndicacaoConvertida` + `/convidar` na lista de comandos das boas-vindas.
- `src/index.js`: handler `/convidar`, detecção de código no 1º contato, hook de ativação após cupom, endpoint `POST /admin/ativar-pro` (ativa Pro manual + dispara recompensa de conversão).
- `.env.example`: nova var `BOT_PHONE` (número do bot pro link `wa.me`).

**Pré-requisitos de deploy (nesta ordem):** (1) rodar `supabase/migration_003_indicacoes.sql` no SQL Editor; (2) configurar `BOT_PHONE` no Railway; (3) `git push` (feito pelo Gabriel na máquina dele).

**Pendências/ressalvas deixadas:** (1) as funções Pro recompensadas (comparativo + alerta inteligente) ainda não existem no código — a recompensa está gravada mas só vira valor visível quando essas features forem implementadas e usarem `temFeaturesProAtivas()` como gate; (2) `/apagar` é citado na copy mas ainda não tem handler — quando for criado, deve limpar `indicacoes` também; (3) descoberto sistema de assinaturas Mercado Pago em construção paralela no `supabase.js` — o `/admin/ativar-pro` (PIX manual) seta `is_pro` direto e coexiste com o fluxo MP (`atualizarStatusAssinatura`).

**Nota operacional recorrente:** push pro GitHub é sempre feito pelo Gabriel na máquina dele; o ambiente Cowork não tem credencial. Edits de código são salvos direto em `C:\Economizei`. (Nesta sessão o mount Linux do sandbox serviu versões truncadas em cache desses `.js` — sintaxe foi validada por bloco isolado + revisão das fronteiras; recomendado rodar `node --check src/*.js` localmente antes do push como gate final.)

### 2026-06-07 — Sessão de debug: categoria/nome_canonico "NULL" no /gastos

**Briefing inicial:** Gabriel trouxe relatório de bug — `categoria` e `nome_canonico` saindo NULL em `itens_compra` mesmo com migration rodada e deploy ativo (commit ae58972). Pediu para rastrear o fluxo imagem → INSERT, adicionar logs de diagnóstico e corrigir a causa raiz, sem estimativas de tempo.

**Investigação (sem mexer no que estava certo):**
1. Lidos `gemini.js`, `supabase.js`, `index.js` — fluxo `lerRecibo → validarSchema → dados.itens → salvarCompra → INSERT` está correto ponta a ponta.
2. Pista decisiva: `validarSchema` **nunca** retorna `categoria` null. Logo, NULL no banco ⇒ o código rodando não é o esperado, OU a leitura está errada.
3. Git confirmou que ae58972 (HEAD) contém o código de categoria; descartada hipótese de working tree não commitado.
4. Adicionados logs temporários `diag_itens_antes_insert` / `diag_itens_gravados` / `diag_insert_itens_erro` em `salvarCompra`.
5. Teste `/gastos` no bot retornou a mensagem nova → confirmou que o código novo ESTAVA no ar (o comando nem existia na versão anterior).
6. Logs do Railway de um cupom novo (CSD, R$240,33): `diag_itens_gravados` mostrou `categoria:"padaria"` — ou seja, **o banco gravou certo**. As linhas NULL eram de cupons processados antes do container novo subir (20:07).
7. SQL pedido confirmou: cupons CSD com `com_categoria = itens` (40/40, 39/39) MAS `data_compra = 2026-05-31`. O `/gastos` filtra por `data_compra` no mês atual (junho) → escondia os dados de maio.

**Diagnóstico final:** nunca houve bug de gravação. Era leitura — `buscarGastosPorCategoria` filtra por `data_compra` (data impressa no cupom), e o cupom de teste era de maio.

**Decisão do Gabriel:** escolheu a **Opção 2** (manter agrupamento por `data_compra`, mas com fallback pro mês mais recente com dados quando o atual está vazio, avisando qual mês).

**Implementação:** `buscarMesMaisRecenteComGastos` nova em `supabase.js` (+ export); `mostrarGastos` em `index.js` com fallback + mensagem de aviso de mês; logs de diagnóstico removidos. Syntax check ok nos dois arquivos.

**Pendências deixadas:** (1) afrouxar a heurística `avaliarQualidadeCanonicoItem` que dá falso positivo de `pouco_simplificado`; (2) as linhas NULL antigas (código antigo) são inofensivas — `/gastos` as ignora, não dá pra preencher retroativamente (imagens não guardadas).

**Nota operacional recorrente:** o push para o GitHub é sempre feito pelo Gabriel na própria máquina — o ambiente Cowork não tem credencial do GitHub e o `.git/index.lock` precisa de `del .git\index.lock` antes do commit. Edits de código são salvos direto em `C:\Economizei`, mas o `git add/commit/push` é manual.

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
> *Aplicação: 2 skills criadas em `C:\Economizei\.claude\skills\` — `copy-review` e `roadmap-deps`. Pendente: empacotar como `.skill` e instalar no perfil global.*

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

**Diagnóstico:** as 14 skills criadas estavam em `C:\Economizei\skills\` — pasta que Claude não auto-descobre. O path padrão de descoberta é `.claude/skills/`. Sistema também precisava de **instruções de projeto** que carregam em toda sessão para amarrar tudo.

**Ações executadas:**
1. Movidas as 14 skills + 2 antigas (`copy-review`, `roadmap-deps`) + `README.md` para `C:\Economizei\.claude\skills\`.
2. Criado `C:\Economizei\PROJECT_INSTRUCTIONS.md` com boot sequence, gatilhos automáticos das 6 transversais, formato `dual-format`, ritual de fim de sessão.
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
