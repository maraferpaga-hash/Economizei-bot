# 🧠 Log de Senso Crítico — Economizei

> **O que é:** registro de todo contraponto que o Claude levantou sem o Gabriel pedir, e do que o Gabriel decidiu.
> **Skill dona:** `.claude/skills/economizei-critical-partner/SKILL.md`
> **Criado em:** 2026-07-27
> **Ler:** no início de sessão, junto com o `CLAUDE.md` (é uma tabela, custa segundos).

---

## Por que este arquivo existe

Sem memória, o senso crítico não aprende — só repete. Este log fecha o ciclo:

- **Apontamento acatado 3× pelo mesmo motivo** → deixou de ser opinião, virou padrão. Propor linha nova na **seção 11 do `CLAUDE.md`** (regras permanentes) e marcar aqui `→ virou regra`.
- **Apontamento recusado 3× pelo mesmo motivo** → o detector está errado, não o Gabriel. **Calibrar ou desligar** aquele gatilho na skill e registrar a exceção lá.
- **Apontamento já recusado uma vez** → o Claude **não levanta de novo**. Insistir é desrespeito à decisão dele.

---

## Detectores (referência rápida)

| Código | Detector | Severidade base |
|---|---|---|
| **D1** | Contradiz decisão travada (CLAUDE.md §8/§11, CODE_GUIDE §8) | 🔴 |
| **D2** | Risco financeiro / LGPD / classificação | 🔴 |
| **D3** | Existe caminho mais barato | 🟠 |
| **D4** | Premissa não validada | 🟠 |
| **D5** | Não move W2 nem conversão Free→Pro | 🟡 |
| **D6** | Sequenciamento invertido | 🟡 |
| **OBS** | Sugestão não solicitada (observação lateral, máx. 1/sessão) | — |

---

## Registro

| Data | Det. | O que foi pedido | O que foi apontado | Acatado? | Nota |
|---|---|---|---|---|---|
| 2026-07-27 | D4 | "Podemos agir no cod-5, 7 e 8" (backlog) | cod-0005 e cod-0008 já foram ENTREGUES (viraram cod-0010..0017 e cod-0022); cod-0007 bloqueada por dados de produção — agir seria retrabalho/chute | ✅ Sim | Gabriel redirecionou pra cadeia 0043..0049+0018; de quebra pediu a limpa do backlog (feita) |
| 2026-07-27 | D1 | "Trabalhar cod-0043..0049 + 0018" | Contradiz o gate dele de 07-09 ("cada etapa só sobe validada em produção; perguntas_log é o juiz") — pré-lançamento não há log | ✅ Parcial | Aprovou o híbrido (0043/0044/0048 sobem) E antecipou a 0049 com racional próprio (gatilhos pré-programados pra testar a estrutura; aprimorar com dados depois; gated pelo cod-0035 no main). 0045/0046/0047/0018 seguem gated — o espírito do gate sobreviveu onde importa |
| 2026-08-05 | D5+D6 | "Por que a esteira está entupida? Vamos planejar" | Apontado ANTES de resolver: a esteira estava produzindo refinamentos do Agente (0044/0048/0049) pra um bot com ~0 usuários, enquanto o que bloqueia o lançamento (RLS/dedup, `lembretes_enviados`, RPC) estava numa fila que a máquina não alcança (`supabase/` = zona humana) e por isso apodrecia | ✅ Sim | Ele mandou 0044/0048/0049 pro fim, subiu 0067/0025, e pediu explicitamente a lista do Supabase. Achado que emergiu do desvio: o reengajamento nunca enviou 1 mensagem |
| 2026-08-05 | D6 | "Colocar cod-0043 no fim da agenda também" | cod-0043 já estava IMPLEMENTADO no working tree — mandar pro fim significaria manter a esteira entupida ou jogar fora 707 linhas testadas. Sequenciamento invertido | ✅ Sim | Entregou via `/entregar` na mesma sessão (`9c094aa`). Esteira destravada |
| 2026-08-05 | OBS | Diagnóstico de RLS herdado de 07-26 ("falta policy de insert") | Contestado o próprio diagnóstico anterior do sistema: `service_role` bypassa RLS, logo aquele erro seria impossível com a chave certa → a causa real é a env ausente + banco sem RLS | ✅ Confirmado por evidência | Print do Railway: 14 envs, nenhuma é `SUPABASE_SERVICE_ROLE_KEY`. Query 2: `usuarios`/`compras`/`itens_compra` com RLS `false`. Hipótese correta |
| 2026-08-05 | — | *(erro meu, registrado por simetria)* | A query 3 do S0 que EU escrevi tinha `oid` ambíguo (`pg_proc` × `pg_namespace`) e falhou com `42702` na mão dele | n/a | Corrigida com `p.oid`. Lição: SQL entregue pra ele rodar precisa ser testado mentalmente contra ambiguidade de catálogo, não só contra a semântica |
| 2026-08-05 | D1 | Recomendação B3+B2 (puxar em vez de empurrar) | *Meu* apontamento foi que adicionar vazão do lado que não é o gargalo só produz estoque | ❌ **RECUSADO** | Gabriel escolheu **B1** (branches) e pediu defesas pros contras em vez de evitar o modelo. Defesas construídas: pilha linear, teto de 3, main parada, painel de estoque. **Nota de calibração: o D1 supôs que a restrição de tempo dele era fixa; ele optou por atacar o contra em vez de aceitar o limite. Registrar como sinal — recomendação "aceite a restrição" tende a ser recusada por ele.** |

| 2026-08-07 | D6 | "Revise a máquina e as decisões pendentes; faça perguntas pra eu guiar o foco" | Antes de propor foco, apontado que o sistema **gera diagnóstico bem e consome mal**: o Checkpoint N2 rodou em 01/08, gerou doc completo com um 🔴 material (gate Pro nunca ligado → R$9,90 compra só cupons ilimitados) e ficou **6 dias sem leitura**, com a AGENDA ainda dizendo "último checkpoint: 07-08". Mesmo padrão no `index.lock` (reportado 2× como "limitação conhecida", ninguém procurou a causa) e na cod-0066 (11 dias com duas verdades contraditórias na mesma AGENDA) | ✅ Sim | Gabriel escolheu "consertar a máquina" como foco. Achados promovidos pro painel de ações; causa-raiz do lock encontrada e corrigida (`GIT_OPTIONAL_LOCKS=0`) |
| 2026-08-07 | OBS | Fatiar as porte-G em P/M (escolha dele) | Ao fatiar, a varredura do código achou o que a tarefa-mãe não previa: **`buscarComprasDoMes` e `buscarHistorico` não filtram `tipo`** — com PIX gravando `tipo='pix'`, um comprovante entraria no `/gastos` e no resumo mensal como gasto. Virou a cod-0062a, com prioridade P1 acima das demais fatias | ✅ Aplicado | Reforça o padrão: o fatiamento não é só logístico — obriga a ler o código e revela invariante que o desenho assumia resolvido |

| 2026-08-07 | — | *(erro meu, registrado por simetria — 2º da série)* | Propus, como prova de que a `service_role` está em uso, *"mande a mesma foto 2× e a 2ª deve ser ignorada pela dedup"*. **Errado:** a dedup é por `messageId` (retry do Z-API), não por conteúdo — duas fotos enviadas pelo usuário são duas mensagens legítimas. O Gabriel rodou, viu 2 respostas e perguntou se podia seguir. Pior: `registrarMensagemProcessada` é **fail-open**, então *nenhum* teste de comportamento pelo WhatsApp poderia distinguir anon de service_role | n/a | Corrigido com teste **de estado**: decodificar o JWT da chave e ler o campo `role` (30s, decisivo), com os logs do Railway como alternativa. **Lição virou nota no roteiro:** defeito silencioso por construção exige teste de estado (o que a chave é / o que o log diz), nunca de comportamento (o que o bot respondeu). É o mesmo tipo de erro do `oid` ambíguo de 08-05 — instrução entregue pro Gabriel executar precisa ser testada mentalmente contra o mecanismo real, não contra o que eu esperava que ele fosse |

| 2026-08-18 | D6 | "Tudo foi feito, vamos confirmar e finalizar a sessão" | Antes de confirmar, verificado o estado real: **"tudo" era o RLS** — S3, S5, migration PIX e DROP MP seguiam abertos na AGENDA, e a **cod-0073 estava no working tree há 2 dias**, com a esteira entupida de novo (guarda (a) = toda rotina matinal encerra sem produzir). Registrar "sessão fechada" sem isso deixaria a memória mentindo pela 3ª vez em 3 semanas | ✅ Sim | Ele confirmou o escopo real (só RLS) e mandou entregar a cod-0073. **Padrão que se repete:** o custo de não perguntar não é o erro em si — é a AGENDA virar ficção e a próxima sessão partir de um estado falso (foi o que aconteceu em 07-28 → 08-01 e de novo em 08-07 → 08-15) |

| 2026-09-03 | D4 | Executar a Fase 0 do `PROMPT_MAQUINA_CONTEUDO.md` (decisão 8: "scripts Node no repo + scheduled task no Cowork"; estágio 5 = Remotion) | Antes de escrever qualquer arquivo, verificado o sandbox: **sem Chromium** (Remotion não renderiza) e **sem rede por script** (`curl` → IBGE/fonts = bloqueado; só o browser do Claude alcança o SIDRA). A premissa de que a esteira roda inteira em `.mjs` no Cowork não se sustentava. Também: o piloto não podia usar clone de voz (ElevenLabs não contratado) | ✅ Sim | Gabriel escolheu **híbrido** (ffmpeg+PIL agora, Remotion só se a revisão das 10 peças pedir) e **rota B** (ele grava o piloto). Achado colateral que virou aviso na AGENDA_CONTEUDO: o `verificar.mjs` precisa ignorar a marca "Economizei" no scan de "economize" (falso positivo medido no piloto) |

---

## Placar dos detectores (atualizar ao registrar)

| Detector | Disparos | Acatados | Recusados | Status |
|---|---|---|---|---|
| D1 | 2 | 1 | 1 | ativo — **atenção à calibração:** a recusa de 08-05 foi contra uma recomendação de "aceitar a restrição de tempo". O Gabriel prefere atacar o contra a aceitar o limite. Enquadrar recomendações como "aqui estão as defesas necessárias", não como "aceite o teto" |
| D2 | 0 | 0 | 0 | ativo |
| D3 | 0 | 0 | 0 | ativo |
| D4 | 2 | 2 | 0 | ativo — 2º disparo (09-03): premissa de infraestrutura (sandbox) não verificada antes do desenho. Padrão: **checar o ambiente de execução antes de aceitar a arquitetura escrita no prompt** |
| D5 | 1 | 1 | 0 | ativo — 1º disparo (08-05): esteira otimizando o que não move W2 |
| D6 | 4 | 4 | 0 | ativo — **4/4 acatados. Promover a regra permanente na §11.** Padrão consolidado: o gargalo do Economizei quase nunca é produzir, é **consumir e registrar o que já foi produzido** (checkpoint sem leitura, relatório sem ação, lock reportado sem causa-raiz, contradição sem árbitro, "tudo feito" sem verificação). Regra proposta: **antes de gerar diagnóstico novo ou fechar sessão, verificar o ESTADO REAL (git + banco + working tree) em vez de aceitar o resumo** — inclusive o meu próprio da sessão anterior |
| OBS | 2 | 2 | 0 | ativo — 2/2. Ambos vieram de **olhar o código/evidência em vez de confiar no doc** (08-05: chave anon × RLS; 08-07: leituras agregadas sem filtro de `tipo`) |

> **Leitura do placar:** detector com muitos disparos e poucos acatos está mal calibrado (gera ruído e queima a credibilidade dos outros). Detector com 3 acatos seguidos pelo mesmo motivo virou candidato a regra permanente.
