# 🏋️ Análise — Máquina Local mais pesada + agrupamento de tarefas (lotes)

**Data:** 2026-07-27 · **Status: ✅ APROVADO E IMPLANTADO (mesma data)** — D1=(b) até 3 P ou 1 M · D2=sim, lastro **só testes/revisão/segurança** (sem limpeza MP no lastro) · D3=sim, **pós-piloto** (gatilho: 10 runs; lembrete na AGENDA "Aguardando decisão") · D4=sim · D5=sim. Implantado em: SKILL da rotina matinal, `.claude/commands/tarefa.md`, protocolo+molde+lastro da `AGENDA.md`, notas nos 2 guias, linha na tabela de Decisões do `CLAUDE.md`.
**Escopo:** como a máquina funciona hoje, por que os tokens estão subutilizados, o que "trabalho pesado" pode significar, e quando agrupar vs. separar tarefas.
**Fontes lidas:** `AGENDA.md`, `Automacao_Maquina_Noturna.md`, `Mapa_Processo_Maquina_Local.md`, `.claude/commands/tarefa.md` + `entregar.md`, SKILL da rotina matinal, `RELATORIO_MATINAL.md` (27/07), `CODE_GUIDE.md`, skills README.

---

## 1. Como a máquina funciona hoje (diagnóstico)

### 1.1 A anatomia

| Peça | O que faz | Trava de custo/segurança |
|---|---|---|
| **`/tarefa` (manual)** | Pega a 1ª tarefa `pronta` da fila, implementa com teste, move pra "Em revisão", mostra o diff | 1 tarefa por run; nunca commita |
| **Rotina matinal 8:02** | Mesmo fluxo, automático, + `RELATORIO_MATINAL.md` | 1 tarefa **pequena** por dia; tarefa grande/ambígua → só escreve plano e para |
| **`/entregar` (manual, você)** | Leva o working tree pro git: integridade → check → plano de commits → migrations → "APROVO" → push → reconcilia AGENDA | Aprovação dupla; commit é sempre seu |
| **4 rotinas só-leitura** | Painel (seg 7:32), Sentinela (dom 20h), Checkpoint N2 (dia 1), Lembrete (sex 9h) | Nunca escrevem código |
| **Guarda-rails** | Firewall (advisory desde 07-26), testes (422), corpus de classificação, schema guard | Gate real = sua revisão no `/entregar` |

### 1.2 O que a análise encontrou — 4 achados

**Achado 1 — A máquina está passando fome, não economizando.** O `RELATORIO_MATINAL.md` de 27/07 registra o **3º dia seguido sem produzir nada**: a fila só tem cod-0062 e cod-0065, ambas marcadas "não é pra run autônoma" (mexem no coração + dependem de recibos que só você fornece). A rotina acorda, lê a AGENDA, conclui "nada elegível", escreve relatório e dorme. **O gargalo não é capacidade da máquina — é a fila sem tarefa elegível.** Qualquer plano de "usar mais tokens" começa por resolver isso; aumentar o teto por run sem reabastecer a fila não muda nada.

**Achado 2 — As travas de custo foram desenhadas pra um mundo que acabou.** "1 tarefa pequena por run" nasceu na era GitHub Actions (custo por run + ninguém olhando). Hoje a execução é local/Cowork na sua assinatura: token não usado na janela **expira** — não vira crédito. A rotina roda às 8h, um horário que você tipicamente não está usando interativamente. Ou seja: o custo marginal de uma run mais pesada às 8h é ~zero; o desperdício real é a run leve demais.

**Achado 3 — A zona proibida da rotina matinal está desatualizada.** A decisão de 07-26 (firewall → advisory) liberou a máquina pra código financeiro com sua revisão, mas o SKILL.md da rotina ainda carrega a zona proibida antiga (bloqueia pagamento, cita `src/mercadopago.js` que nem existe mais). Resultado concreto: a **limpeza das funções MP órfãs** — já marcada na AGENDA como "agora é tarefa de máquina" — a rotina se recusa a pegar. O `/tarefa` manual tem o mesmo texto desatualizado.

**Achado 4 — O ciclo já provou que aguenta mais peso.** As entregas de 07-13 (6 tarefas), 07-16 (4) e 07-24 (3) mostram que o `/entregar` processa lotes de trabalho acumulado com segurança. O que doeu nessas entregas não foi o volume — foi **fatiar por hunk arquivos compartilhados entre levas separadas** (`src/index.js`/`formatter.js` reconstruídos manualmente em 07-24 e 07-27). Isso é um argumento **a favor** de agrupar melhor, não contra (ver seção 3).

---

## 2. O que "trabalho mais pesado" pode significar (3 alavancas)

### Alavanca A — Runs mais profundas (mais qualidade por tarefa)
Mesma 1 tarefa, mas a run gasta tokens em coisas que hoje não faz:
- **Passo de auto-revisão adversarial:** depois de implementar, a run revisa o próprio diff com olhos de `code-review` (N+1, edge cases, erro engolido, LGPD em log) e corrige antes de te mostrar. Custo alto de token, ganho direto na qualidade do que você revisa.
- **Plano antes de codar em tarefa média:** hoje "grande/ambígua" → desiste. Proposta: tarefa **média e bem-especificada** → a run escreve o plano E implementa na sequência (o que ela já faz separado em runs manuais).
- **Relatório mais rico:** diff anotado por arquivo com racional, mapa tarefa→arquivos pronto pro `/entregar` fatiar.

### Alavanca B — Runs mais largas (mais tarefas por run)
- Teto da rotina sobe de "1 pequena" pra **"até N pequenas OU 1 média"** (proposta: N=2–3; ver decisão D1).
- **Fila de lastro (novo conceito):** uma lista permanente na AGENDA de trabalho útil, autônomo-seguro e sempre disponível, que a rotina executa **quando a fila principal está vazia/bloqueada** — exatamente o cenário dos últimos 3 dias. Deixa de existir "dia sem produção" enquanto houver lastro. Candidatos reais já mapeados:

| Candidato | Origem | Por que é seguro pra run autônoma |
|---|---|---|
| Limpeza das ~15 funções MP órfãs (`supabase.js` + `formatter.js`) | AGENDA linha "fast-follow" | Código morto, ninguém chama; firewall advisory acusa e você commita consciente |
| Varredura de cobertura de testes (`alerts.js`, `reengagement.js`, `monthlySummary.js`, `charts.js`, `metrics.js`, `scheduler.js`) | cod-0007/0008 espírito | Testes não mudam comportamento; naturalmente batchável |
| pag-0001 (`vercel.json` rotas) + pag-0002/0003 (guias SEO) + pag-0004 (headline B) | Backlog páginas | tipo `conteudo-seo`/`landing-ab` já previsto no mapa de skills; firewall vigia pricing |
| Extração de handlers do `index.js` (regra dos 800 linhas do CODE_GUIDE) | CODE_GUIDE §2 | Refactor mecânico com testes existentes como rede |
| JSDoc + docs técnicos em `docs/` | — | Zero risco de runtime |
| Tooling de auditoria (runner das queries de `monitoring_canonicos.sql`, prep aud-01..04) | Auditoria 07-10 §7 | Ferramenta, não toca o pipeline |

- **O que NÃO entra no lastro (continua com você presente):** prompt do Gemini / classificação / `nome_canonico` (coração — regra 1 da seção 11), qualquer coisa com pré-req humano (recibos PIX/Canadá), decisão de produto/UX/preço, `supabase/`/envs/deploy.

### Alavanca C — Mais janelas de run
- Hoje há 1 run produtiva por dia (8:02). Opcional: **run pesada semanal** (ex. sábado de manhã) dedicada a 1 lote grande do lastro (ex. a varredura de cobertura inteira), aproveitando uma janela em que você não compete pela cota.
- Contra-argumento honesto: cada run nova empilha diff no working tree esperando sua revisão. Só vale se a sua cadência de `/entregar` acompanhar (ver risco R1).

---

## 3. Agrupar ou separar? (a análise que você pediu)

### 3.1 A inversão de custos que muda a resposta

O instinto de "1 tarefa por vez" otimizava **custo de token por run**. Mas a estrutura real hoje é:

- **Token:** agrupar é MAIS barato. Contexto (AGENDA + CODE_GUIDE + skills + arquivos) é carregado 1x pra N tarefas; arquivo compartilhado é editado 1x; `npm run check` roda 1x no fim.
- **Revisão (seu tempo):** agrupar é MAIS caro *por sessão de revisão*, mas — e aqui está o ponto fino — **separar tarefas que compartilham arquivo é o pior dos mundos**: foi isso que forçou a reconstrução manual por hunk em 07-24 e 07-27. Duas tarefas no mesmo `index.js` feitas em runs separadas que se acumulam no tree = fatiamento doloroso no `/entregar`. As mesmas duas feitas **juntas, como 1 lote com 1 commit combinado** = zero fatiamento.
- **Descarte:** o `git checkout .` é por arquivo, não por tarefa. Lote grande demais = se 1 tarefa saiu ruim, descartar sem levar as outras é trabalhoso. Este é o limite real do tamanho do lote.

**Regra de bolso proposta: "agrupe por revisão, não por token."** O lote ideal é o que você revisa com atenção plena em uma sentada de ~30min. Token deixou de ser o critério; a sua atenção é o recurso escasso (~12h/semana).

### 3.2 Critérios objetivos

**AGRUPAR quando (quanto mais critérios, mais forte o caso):**
1. **Mesmos arquivos-alvo** — o critério mais forte. Elimina o fatiamento por hunk; o `/entregar` já prevê "commit combinado" pra esse caso.
2. **Mesma cadeia/desenho** — ex.: cod-0033 + cod-0035 são o mesmo subsistema (Alerta Pro); o contexto do desenho é carregado 1x e as decisões ficam coerentes entre si.
3. **Mesmo conjunto de skills** — o setup mental da run é um só.
4. **Natureza batchável** — testes de cobertura, limpeza de código morto, JSDoc: 6 arquivos de teste em 1 run é estritamente melhor que 6 runs.

**SEPARAR (isolar em run própria) quando:**
1. **Toca o coração** (classificação/prompt/`nome_canonico`) — isola SEMPRE, com você presente. Inegociável, não muda com este plano.
2. **Financeiro** — o advisory acusa e você quer o commit consciente limpo, não misturado com 3 outras coisas.
3. **Domínios sem arquivo em comum** — juntar não economiza nada relevante e só aumenta o raio de explosão do descarte.
4. **Pré-req humano** — tarefa bloqueada nunca entra em lote com tarefa autônoma (o bloqueio contamina o lote).
5. **Diff combinado estimado > ~500 linhas** — acima disso a qualidade da sua revisão degrada; melhor 2 lotes.

### 3.3 Veredito

**É melhor junto — com condições.** Agrupar é ganho líquido quando os critérios de agrupamento batem (especialmente arquivo compartilhado e cadeia comum), e é perda quando mistura risco alto (coração/financeiro) com trabalho trivial. A resposta não é "sempre juntar" nem "sempre separar" — é **formalizar o lote como conceito de primeira classe na AGENDA** (campo `lote:`), com o Opus montando os lotes no planejamento usando os critérios acima, e o `/entregar` recebendo o mapa tarefa→arquivos pronto.

---

## 4. Plano de ação proposto (nada executado ainda)

### Fase 1 — Atualizar as regras da máquina (1 sessão, eu faço, você revisa)
1. **Reescrever o SKILL da rotina matinal:** teto novo (D1), zona proibida alinhada ao advisory (mantendo `supabase/`, `.env*`, `package.json`, firewall e deploy como intocáveis), fila de lastro como fallback, passo de auto-revisão adversarial, regra formal de "esteira entupida" (não empilhar sobre working tree sujo — hoje é bom senso, vira regra).
2. **Mesma atualização no `.claude/commands/tarefa.md`** (hoje os dois textos divergem do estado real).
3. **AGENDA.md:** molde de tarefa ganha `porte: P|M|G` e `lote: <nome>` (opcionais); protocolo ganha o parágrafo dos critérios de agrupamento (§3.2 resumido); nova seção "⚓ Fila de lastro" com os candidatos aprovados.

### Fase 2 — Reabastecer a fila com peso real (planejamento você + eu)
4. Priorizar juntos os candidatos da tabela §2-B e escrever as tarefas/lotes na fila (com `porte`/`lote`/`skills`). Sugestão de primeiro lote autônomo: **limpeza MP órfãs + testes de `formatter.js` pós-limpeza** (mesmos arquivos = caso perfeito de lote).

### Fase 3 — Piloto de 2 semanas + calibragem
5. Rodar com o teto novo; o `RELATORIO_MATINAL.md` passa a registrar 3 números por run: **tarefas concluídas, linhas de diff, tempo estimado de revisão**. No fim do piloto, olhamos os números e calibramos teto/lastro (sem estimativa de prazo em semanas pra resultado — gatilho é "10 runs executadas", regra 6 da seção 11).
6. (Opcional, D3) Criar a run pesada de sábado só se o piloto mostrar que sua cadência de revisão acompanha.

### O que NÃO muda (invariantes)
- Máquina **nunca** commita/pusha/deploya (regra 3) · gate final na sua máquina Windows (regra 11) · coração só com você presente (regra 1) · `/entregar` intocado · `supabase/`, `.env*`, `package.json`, `check-firewall.mjs`, `Dockerfile` continuam zona sua mesmo no advisory.

### Riscos honestos
- **R1 — o gargalo migra pra você.** Máquina 3x mais produtiva = 3x mais diff esperando revisão. Se você não revisar por 3 dias, a esteira entope (07-27 mostrou). Mitigação: regra de esteira entupida (a rotina para sozinha) + lotes dimensionados por revisão (§3.1).
- **R2 — deriva de qualidade em tarefa maior.** Tarefa média autônoma erra mais que pequena. Mitigação: auto-revisão adversarial + TDD + o piloto medir taxa de descarte (`git checkout .` = sinal vermelho se recorrente).
- **R3 — lote contaminado.** 1 tarefa ruim num lote de 3 dificulta o descarte parcial. Mitigação: critérios §3.2 + teto de ~500 linhas de diff + mapa tarefa→arquivos no relatório.

---

## 5. Decisões que são suas (pra aprovar o plano)

| # | Decisão | Opções | Minha recomendação |
|---|---|---|---|
| **D1** | Teto por run da rotina matinal | (a) manter 1 pequena · (b) até 2–3 pequenas OU 1 média · (c) sem teto numérico, teto por diff (~500 linhas) | **(b)** — sobe o aproveitamento sem abrir mão de previsibilidade no piloto |
| **D2** | Fila de lastro (fallback quando a fila principal está bloqueada) | sim / não / sim-mas-só-testes | **Sim** — é o que mata os "3 dias de nada"; a lista é curada por você na Fase 2 |
| **D3** | Run pesada de sábado | agora / só depois do piloto / não | **Só depois do piloto** — primeiro provar que a revisão acompanha |
| **D4** | Zona proibida da rotina alinhada ao advisory (financeiro liberado com aviso, infra continua bloqueada) | sim / manter bloqueio antigo na rotina | **Sim** — é só materializar a decisão que você já tomou em 07-26 |
| **D5** | Lotes (`lote:` na AGENDA + critérios §3.2 no protocolo) | sim / não | **Sim** — resolve na raiz o fatiamento por hunk das entregas |

**Após seu OK:** executo a Fase 1, e a decisão vira 1 linha na tabela do CLAUDE.md com pointer pra este doc (teto por sessão respeitado — nada foi registrado lá ainda).
