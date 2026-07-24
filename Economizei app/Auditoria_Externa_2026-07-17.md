# 🔍 Auditoria Externa Completa — 2026-07-17

> **O que é:** auditoria read-only de ponta a ponta (7 frentes), executada por auditor externo cético conforme o prompt `Prompt_Auditoria_Completa_2026-07-17.md`. Toda afirmação crítica ou média tem evidência de execução real (comando + output), não só leitura de documento.
> **Estado do repo no momento:** `main @ 882cf6e` = `origin/main`, working tree limpo (exceto o próprio prompt de auditoria, untracked). Testes rodados em cópia limpa `/tmp` com `sharp` stubado (regra 11 da seção 11 do CLAUDE.md).
> **O que NÃO foi executado:** nenhum commit, push, migration, escrita em arquivo de produto, nem chamada a endpoint financeiro. Verificações que dependem do Supabase/Railway de produção estão marcadas como "não confirmadas por execução".

---

## 1. ⚡ Sumário executivo

🎯 **Veredito geral: 🟡 tendendo a 🔴 na camada de proteção financeira.** O motor de engenharia está saudável e melhorou desde 07-10 (366/366 testes verdes, 0 vulnerabilidades npm, memória×git quase toda reconciliada, vigilância agendada ativa e funcionando). Mas **os dois achados 🔴 da Auditoria Integral de 07-10 seguem 100% abertos sete dias depois** — o bypass do firewall por rename foi re-testado hoje e ainda passa, e o `/assinar` ainda gera checkout Mercado Pago — **e esta auditoria encontrou um 🔴 novo: o webhook `/webhook` não tem autenticação nenhuma**, aceitando payload forjado de qualquer origem.

**Os 5 riscos mais graves (em ordem):**

1. 🔴 **NOVO — `/webhook` sem autenticação + URL de mídia arbitrária.** Qualquer um que descubra a URL do Railway pode forjar payloads: fazer o bot mandar WhatsApp para números arbitrários (spam saindo do SEU número Z-API), queimar chamadas Gemini com imagens que ele controla, e consumir a cota Free de usuários reais. O rate limit é por `phone` DO PAYLOAD — o atacante escolhe o phone, então o limiter não segura nada.
2. 🔴 **Firewall: patch de 07-10 não aplicado.** Bypass por rename re-confirmado hoje ao vivo (`git mv src/mercadopago.js src/pagamentos.js` → "FIREWALL OK", exit 0) e os 8 tokens (`temFeaturesProAtivas`, `hotmart`, `ADMIN_SECRET`…) passam limpos. O risco cresceu: cod-0032/0033 (que a máquina constrói "sem gate" pro Gabriel inserir o gate depois) estão no topo da fila pronta.
3. 🔴 **`/assinar` ainda cria assinatura no Mercado Pago** (fluxo completo vivo: pedir e-mail → `criarAssinatura` → link de checkout → webhook MP ativo). MP juridicamente abandonado desde 06-24. Se alguém assinar hoje, entra dinheiro por via irregular.
4. 🟠 **Promessa quebrada em produção:** a indicação promete "alerta inteligente" que não existe e o gate Pro não foi aplicado (zero uso de `temFeaturesProAtivas` no código de produto) — a recompensa de indicação entrega exatamente nada. Aberto desde 07-10.
5. 🟠 **A face comercial contradiz a estratégia:** o anual é a oferta-destaque desde 06-23, mas o bot (`/planos`, `/pix`) só conhece o mensal — e o único fluxo automatizado de cobrança é o MP abandonado.

**1 frase por frente:**

- **4.1 Código:** 🟢 sólido no núcleo (366/366 testes, npm audit 0, dedup e validação de payload testados) — com um 🔴 novo de autenticação de webhook e um `index.js` que estourou a regra própria de 800 linhas (1.187).
- **4.2 Classificação:** 🟢 os 5 invariantes do CODE_GUIDE §0 estão no código e cobertos por teste (temperature:0, reconciliação, `canonico_suspeito`, corpus verde hoje) — mas o corpus é pequeno e 100% mockado; a taxa de erro REAL nunca foi medida (aud-01 pendente).
- **4.3 Firewall/dinheiro:** 🔴 a trava funciona pro que sempre cobriu (selftest 16/16, casos clássicos bloqueiam) mas as lacunas conhecidas de 07-10 seguem todas abertas, testadas e reproduzidas hoje.
- **4.4 LGPD:** 🟢 no desenho (imagem/documento nunca persistidos, `/apagar` com ordem de FK correta, logs mascarados na amostra, `.env` fora do git) — 🟡 na verificação (aud-03 de logs Railway pendente; política de privacidade só parcialmente auditada).
- **4.5 Operação:** 🟡 a automação de vigilância existe e roda de verdade (5 tarefas agendadas ativas, rotina matinal entregou cod-0061 em 07-16) — mas as rotinas HUMANAS semanais (custo, uptime, planilha) não têm nenhuma evidência de execução no repositório.
- **4.6 Negócio:** 🟢 pricing internamente consistente e sem benefício-beta na copy pública — 🟠 mas com as divergências comerciais acima e 1 gíria proibida no texto do bot.
- **4.7 Memória institucional:** 🟢 a mais saudável que já esteve (20/20 hashes citados existem e batem, CLAUDE.md em 618/800 linhas) — com staleness leve e conhecida na AGENDA (cod-0061 consta "em revisão" mas já está em `origin/main`).

---

## 2. Achados por frente

### 4.1 Código

**🟢 A suíte de testes está verde e a contagem documentada é honesta.** Em cópia limpa `/tmp` com `sharp` stubado: **366 testes, 366 pass, 0 fail** — exatamente o que a AGENDA declara (355 + 11 do cod-0061). Sem o stub, 6 arquivos morrem em SIGBUS do `sharp` (ambiental do sandbox Linux, documentado na regra 11 e na AGENDA; passam no Windows do Gabriel).

**🟢 `npm audit`: 0 vulnerabilidades** (rodado hoje contra o lockfile). `check-pages`: 5 páginas, 0 erros, 20 avisos. Firewall `--working` verde no estado atual; selftest 16/16.

**🔴 NOVO — `POST /webhook` não tem autenticação (ver Achados novos, N1).** `validarPayloadWebhook` (`src/index.js`) aceita qualquer origem; a única validação da URL de mídia é `startsWith('http')` — sem allowlist de domínio Z-API. Evidência e recomendação em N1.

**🟡 `index.js` tem 1.187 linhas** (`wc -l`), acima da regra do próprio CODE_GUIDE §2 ("quando `index.js` passar de 800 linhas, extrair handlers"). Não é bug, é a casa descumprindo a própria regra — e o arquivo concentra roteamento, onboarding, assinatura e admin.

**🟡 O log do fallback racy do incremento segue inexistente** (achado §2.3 de 07-10; pedido desde a auditoria de 05-14). `grep incremento_fallback src/supabase.js` → vazio. Se a RPC `incrementar_compras_mes` falhar em produção, o contador cai em read-then-write silencioso. 1 linha de fix, humano (mesmo commit consciente do patch do firewall).

**🟢 Padrões do CODE_GUIDE seguidos na amostra:** dedup por `messageId` com PK (testado em `webhook-dedup.test.js`, 19 testes), `safeParse` no Gemini, retry com guard de tamanho no download, mensagens de erro amigáveis, um único cliente HTTP (`fetch`). Dependências: 7 declaradas, todas usadas; nota de 07-10 sobre `@google/generative-ai` em fim de vida continua válida (dívida planejável, não urgência).

### 4.2 Classificação (o coração)

**🟢 Os invariantes declarados existem no código, verificados linha a linha em `src/gemini.js`:** `temperature: 0` + `responseMimeType: 'application/json'` (linhas 370–371), `reconciliarItens` (123, chamada em 307), `avaliarQualidadeCanonicoItem` + log `canonico_suspeito` (198/288/292), escolha da melhor tentativa por `_scoreReconciliacao`.

**🟢 O corpus de regressão existe e RODOU VERDE HOJE** (evidência de execução, não menção): `test/classificacao-corpus.test.js` + `test/gemini-canonico.test.js` + `test/gemini-extracao.test.js` (31 testes do cod-0051, que fechou o buraco 6.1 da auditoria de 07-10 — a rede de segurança da extração agora TEM testes). O último commit que tocou `gemini.js` (`38689b9`, cod-0051) passou pelo `/entregar` com a suíte inteira verde — a regra "mexeu na extração ⇒ roda o corpus" está sendo cumprida na prática, porque o corpus roda dentro do `npm run check` que o `/entregar` exige.

**🟡 Mas o corpus é pequeno e inteiramente sintético.** `classificacao-corpus.test.js` tem 4 blocos de teste; tudo é mockado (correto pela regra "nunca chamar SDK real em teste"), o que significa que ele protege a LÓGICA em volta do Gemini, não a QUALIDADE da extração real. A taxa de erro aparente em cupons reais **não é mensurável nesta auditoria** — não há fixtures de imagem no repo e o Gemini real não pode ser chamado daqui. **aud-01 (15–30 cupons reais + queries de `monitoring_canonicos.sql`) continua sendo a auditoria mais valiosa pendente** e é pré-requisito honesto pra confiar o Alerta Pro ao matching por `nome_canonico`.

**Veredito da frente:** a regra do coração é seguida no papel E nos commits recentes — o que falta é a validação com dado real, que só o Gabriel pode trazer.

### 4.3 Firewall financeiro e controles de dinheiro

**🔴 Bypass por rename — AINDA ABERTO, reproduzido hoje.** Teste real em repo git isolado (`/tmp/fwtest`):

```
$ git mv src/mercadopago.js src/pagamentos.js
$ node scripts/check-firewall.mjs --working
✓ FIREWALL OK: nenhuma mudança financeira/proibida detectada.
EXIT_RENAME=0
```

Nenhum dos 4 `git diff` do script tem `--no-renames` (verificado em `scripts/check-firewall.mjs` linhas 147/150/165/166).

**🔴 As 8 lacunas de conteúdo — AINDA ABERTAS, todas re-testadas via `scanLine` real:**

```
"if (temFeaturesProAtivas(u)) {"            -> PASSA LIMPO
"const max = process.env.COMPARATIVO_MAX_PRO" -> PASSA LIMPO
"opts.ehPro = true"                          -> PASSA LIMPO
"await marcarProAtivo(phone)"                -> PASSA LIMPO
"await concederFeaturesPro(phone, 7)"        -> PASSA LIMPO
"// integracao hotmart webhook"              -> PASSA LIMPO
"const s = process.env.ADMIN_SECRET"         -> PASSA LIMPO
"if (cmd === '/planos') {"                   -> PASSA LIMPO
```

`MONEY_PATTERNS` (linhas 49–64) não ganhou nenhum padrão novo; `PROTECTED_PATHS` não tem `src/hotmart.js`; o selftest continua com os mesmos 16 casos. **O agravante:** cod-0032 e cod-0033 estão na Fila pronta com o desenho explícito "a máquina constrói SEM gate; o Gabriel insere ~3 linhas na revisão" — ou seja, o período em que a máquina vai trabalhar coladíssima na fronteira do gate Pro é exatamente agora, com o firewall cego pros tokens do gate.

**🔴 Fluxo `/assinar` — AINDA É 100% Mercado Pago.** `src/index.js:510` roteia `/assinar` → `iniciarAssinatura` → pede e-mail → `finalizarAssinatura` → `criarAssinatura` (import de `./mercadopago`, linha 879) → envia link de checkout MP. `POST /webhook/mercadopago` segue ativo (linha 307). Zero código Hotmart no repo (`grep -rin hotmart src/ scripts/` → vazio). A recomendação mínima de 07-10 (`/assinar` responder instruções de PIX) não foi aplicada.

**🟢 O que funciona:** o firewall bloqueia corretamente os casos clássicos (selftest 16/16; denylist pega `mercadopago.js`, `supabase/`, `.env`, `package.json`, o próprio script). O `/entregar` (`.claude/commands/entregar.md`) tem de fato a Etapa 2.5 BLOQUEANTE de migrations/envs, mais a trava de integridade (`node --check` por arquivo) e a aprovação dupla com "APROVO" literal — conforme a decisão de 07-13. **Ressalva honesta:** o `/entregar` é enforcement *procedural* (prompt que o Claude Code segue), não código executável — a única trava mecânica é o `check-firewall.mjs`, e é exatamente ela que está com as lacunas.

### 4.4 Segurança de dados e LGPD

**🟢 `/apagar` — verificado no código, ordem de FK correta.** `apagarDadosUsuario` (`src/supabase.js`) deleta na ordem: `compras` (cascade em `itens_compra`) → `indicacoes` (ambos os lados via `.or`) → `lembretes_enviados` → `resumos_mensais_enviados` → `mensagens_processadas` → `usuarios` por último. `acompanhamentos` e `perguntas_log` são limpos por `ON DELETE CASCADE` (confirmado nos comentários das migrations). `precos_mercado` é retida por design — anônima, sem PII, coerente com a tabela de sensibilidade do CODE_GUIDE §4. *Não testado end-to-end contra banco real (fora do escopo read-only).* 

**🟢 Imagem e documento nunca persistidos.** `baixarImagem` e a nova `baixarDocumento` (cod-0061) retornam `Buffer` em memória; nenhum `writeFile`/`createWriteStream` em `src/zapi.js`. O cod-0061 replicou o padrão LGPD da imagem (validação de tamanho, timeout, logs sem conteúdo).

**🟢 Higiene básica:** `.env` fora do git (só `.env.example` trackeado); grep por logs com `phone`/`cpf` sem máscara → vazio na amostra; o pipeline nem extrai CPF do comprador (grep `cpf` em `gemini.js`/`supabase.js` → vazio).

**🟡 O que segue sem verificação real:** aud-03 (logs do Railway + retenção do plano) pendente; os 2 logs de conteúdo de cupom apontados em 07-10 (`gemini_resposta_bruta` 120 chars, `gemini_json_invalido` 300 chars) continuam como estavam. As purgas TTL (`mensagens_processadas` 7d, `perguntas_log` 90d) existem no cron mas nunca foram conferidas contra o banco (`SELECT min(criado_em)…`).

**🟡 Política de privacidade:** existe e está publicada (`docs/politica-de-privacidade.html`, `docs/como-tratamos-seus-dados.html`, `landing/privacy.html`); menciona o processamento da imagem pelo Gemini e a exclusão de dados (5 ocorrências de "exclusão"). **Auditoria textual completa política×código não foi feita nesta sessão** — fica como verificação parcial; recomendo cruzá-la quando a Frente 1 (PIX/fatura) subir, porque o dado novo é mais sensível que cupom.

**🟠 O achado N1 (webhook sem auth) também é um problema de privacidade:** payload forjado permite disparar mensagens do bot pra qualquer número — abuso do canal em nome do Economizei.

### 4.5 Operação (as 3 áreas reais)

**🟢 O que roda de verdade (evidência de execução):** as 5 tarefas agendadas da decisão de 07-15 existem e estão ativas (listadas via API do scheduler): rotina matinal 8h02 (última execução 2026-07-16 — e produziu o cod-0061 + `RELATORIO_MATINAL.md`, arquivo datado de 07-16), painel semanal segunda 7h32 (última execução 07-13; `PAINEL.html` atualizado), sentinela domingo 20h (criada 07-15, **primeira execução será 07-19** — a ausência de `RELATORIO_SENTINELA.md` é consistente, não é falha), checkpoint mensal dia 1 (próximo 08-01) e lembrete de sexta 9h (dispara hoje).

**🟡 O que é aspiracional (zero evidência no repositório):** as rotinas HUMANAS da seção 5 do CLAUDE.md. Não existe planilha de unit economics (nenhum `.xlsx` no projeto), nenhum registro semanal de custo Gemini/Z-API, nenhum log de leitura de uptime, nenhuma anotação de horas. `CALENDARIO.md` está parado desde 2026-06-10. Os indicadores propostos em 05-19 ("uptime ≥ 99%", "custo total/mês", "cadastros/semana") **nunca ganharam um registro de medição** — 2 meses depois, ainda são "proposta". A instrumentação SQL existe (`v_retencao_w2` em `metrics_views.sql`, queries de monitoring prontas), mas não há rastro de que alguém a leia. Pré-lançamento atenua (não há usuários pra medir), mas a `Projecao_6_meses.md` §10 é explícita: sem medições rodando, os gatilhos-semáforo não podem ser avaliados e o projeto entra em "modo inércia". O lembrete de sexta recém-criado é o fix estrutural certo — mas ainda não tem histórico que prove que fecha o ciclo.

### 4.6 Negócio e estratégia

**🟢 Pricing internamente consistente e implementado onde diz que está:** 10 × R$9,90 = R$99 (narrativa "pague 10 leve 12" fecha nos 3 tiers); limite Free de 10 cupons hardcoded (`src/supabase.js:207`, `LIMITE = 10`) e cota de perguntas via `LIMITE_PERGUNTAS_FREE` (default 30); o Free entrega de verdade a dor central (leitura + `/gastos` + resumo + alerta básico) — o princípio "grátis funciona" está de pé no código.

**🟠 A face comercial diverge da estratégia em 3 pontos, todos conhecidos e todos ainda abertos:** (1) `/planos` e `/pix` só mostram mensal — o anual, oferta-destaque desde 06-23, existe só na landing (16 menções, toggle do `d3fe539`); (2) o único checkout automatizado é o MP abandonado (§4.3); (3) a recompensa de indicação promete "comparativo + alerta inteligente" (`formatter.js:854/866/875`) mas o alerta Pro não existe e o comparativo está SEM gate (`grep temFeaturesProAtivas|COMPARATIVO_MAX src/index.js src/formatter.js src/insights.js` → vazio) — quem "ganha 7 dias de Pro" recebe o mesmo que todo mundo. Nada disso é regressão: é o mesmo estado de 07-10, sem movimento.

**🟢 Gate W2:** nenhum indício de gasto de aquisição contornando a regra 7 — não há config de campanha/ads no repo, e os docs de campanha (Meta R$150/CAD20) permanecem como planos gated. Coerente.

**🟢 Regra 5 (zero benefício ao Beta) na copy pública:** limpa — o endpoint `/waitlist` que prometia benefício foi corretamente aposentado (410 Gone, comentário explicando a decisão de 05-22). **🟡 Exceção conhecida (A10, aberta desde 06-25):** `supabase/schema.sql:23` ainda comenta que `beta_fundador` "garante 3 meses grátis + preço travado" — o schema mente pra quem ler; e a coluna segue `DEFAULT TRUE` marcando todo mundo.

**🟡 Regra 4 (gíria só em marketing):** o texto do bot está quase limpo, mas há **1 violação literal**: `formatter.js:287` — "qual **tá** mais barato pros itens que você compra" (mensagem de planos). "tá" está na lista proibida verbatim da regra. Trivial de corrigir, mas é regra permanente do Gabriel sendo descumprida em produção.

**Roadmap × realidade:** os itens marcados como feitos nas Decisões correspondem a commits reais (ver 4.7). Os itens do Roadmap Macro seguem honestamente desmarcados (CNPJ, Meta Ads etc. — bloqueados até out/2026, coerente com a seção 7.2).

### 4.7 Consistência da memória institucional

**🟢 Decisões × git: os 20 hashes citados existem, todos.** Verificado por `git cat-file` para `c355d74 a40110f 38689b9 7082535 473ea18 86dbb64 0dc9159 0b81181 9182b91 d4eaf51 3b2f375 a795f65 2a83bcd 743f2b1 8a479c4 b73b15b e8de024 f384dab 73f8cce e7f236d` → zero inexistentes; mensagens de commit batem com as descrições (amostrado). Única nota: a AGENDA data a entrega "2026-07-16" mas os commits `c355d74..a40110f` têm data 2026-07-15 (provável fuso Vancouver×UTC) — cosmético.

**🟡 AGENDA stale de novo — leve e do padrão conhecido.** A AGENDA (curadoria 07-16) ainda mostra o cod-0061 "Em revisão / aguarda seu commit" e o enxugamento "pendente de commit", mas ambos JÁ estão em `origin/main` (`e7f236d` e `882cf6e`, commits de hoje). É o mesmo padrão das reconciliações de 06-26 e 07-08 — nada foi perdido, mas a "memória viva" está uma entrega atrás do git. O passo 5 do `/entregar` (reconciliar a AGENDA) aparentemente não rodou nesta entrega.

**🟢 PAINEL.html:** mistério encerrado de fato — commitado no git (`73f8cce`), não está no `.gitignore`, e a tarefa semanal que o regenera está ativa. Decisão "git ou gitignore" foi tomada: git.

**🟢 CLAUDE.md dentro dos tetos:** 618 linhas (< 800), tabela de Decisões ~21 linhas (< 30). Todos os arquivos da leitura obrigatória existem nos caminhos declarados.

**🟡 Contradições pequenas CLAUDE.md/CODE_GUIDE × realidade:** (1) CLAUDE.md seção 4 ainda diz "Infraestrutura: **A definir** (Railway/GCP recomendado)" (linha 211) e lista o `src/` com 7 arquivos — o CODE_GUIDE e a realidade dizem Railway em produção e ~16 arquivos + `src/agent/`; a lista de envs da seção 4 também não tem `MP_*`/`PIX_KEY`/`BOT_PHone`/`LIMITE_PERGUNTAS_FREE`. A seção 4 do CLAUDE.md está ~6 semanas atrás do produto. (2) As migrations `migration_FUTURA_agente_perguntas.sql` e `migration_FUTURA_alerta_pro_acompanhamentos.sql` **já foram rodadas em produção** (07-08/07-09) mas continuam com "FUTURA" no nome — o nome agora mente; renomear (ou anotar no topo do arquivo) evita que um futuro `/entregar` as trate como pendentes. (3) `index.js` > 800 linhas vs regra do CODE_GUIDE (já citado em 4.1).

---

## 3. Pendências conhecidas re-verificadas (tabela da seção 6 do prompt)

| # | Pendência | Status | Evidência |
|---|---|---|---|
| 1 | Firewall: 8 lacunas + bypass por rename | ❌ **ainda aberta** | Re-testado HOJE por execução: `git mv` passa com exit 0 em repo isolado; 8/8 tokens "PASSA LIMPO" via `scanLine`; `check-firewall.mjs` sem `--no-renames`, sem tokens novos, sem `src/hotmart.js`; selftest ainda com os 16 casos originais. Sem teste de regressão pro bypass. |
| 2 | `/assinar` gera checkout MP | ❌ **ainda aberta** | `index.js:510` → `iniciarAssinatura` → `criarAssinatura` (MP, linha 879); webhook `/webhook/mercadopago` ativo (linha 307); mensagens MP no formatter. Nem o paliativo "responder PIX" foi aplicado. |
| 3 | Webhook Hotmart → `/admin/ativar-pro` | ❌ **ainda aberta (adiada de propósito)** | `grep -rin hotmart src/ scripts/` → zero resultados. 100% manual. Coerente com o adiamento pra out/2026 (empresa BC) — aberta por decisão, não por esquecimento. |
| 4 | `perguntas_log` bloqueando Leva 2 (cod-0043+) | ⚠️ **parcial** | A TABELA existe como migration (`migration_FUTURA_agente_perguntas.sql:17`, CREATE TABLE + RLS) e a AGENDA/smoke de 07-09 registram a migration rodada em produção (não verificável daqui — sem acesso ao Supabase). O bloqueio real dos cod-0043+ é **falta de DADOS** (pré-lançamento, log vazio = o "juiz" não tem o que julgar), não falta de tabela. Nota: o nome "FUTURA" no arquivo agora induz erro. |
| 5 | `PAINEL.html` untracked | ✅ **resolvida** | Trackeado no git desde `73f8cce` (07-15); `git check-ignore` → não ignorado; `git ls-files` → 1. Decisão tomada: versionar. |
| 6 | Migrations A4/A9 rodadas na ordem certa | ⚠️ **parcial — não confirmável por execução** | Arquivos existem e estão commitados (`a795f65`: `migration_2026-06-30_A4_…` + `…A9_compras_cnpj.sql`); AGENDA registra "rodadas e confirmadas 07-08/07-09" + smoke end-to-end de 07-09 passou (evidência indireta forte). Verificação DIRETA no Supabase não é possível nesta auditoria — e a query de verificação de schema da §3.3 de 07-10 **segue não rodada** (item aberto no painel do Gabriel), incluindo a checagem mais importante: se a RPC `incrementar_compras_mes` existe em produção. |
| 7 | Migração Z-API → Meta Cloud API | ✅ **nenhum gatilho atingido, nenhum trabalho prematuro** | Gatilhos: CNPJ (bloqueado até out/2026), 50–100 usuários (pré-lançamento), templates estáveis (n/a). `grep "graph.facebook\|cloud api" src/` → vazio. Disciplina mantida. |
| 8 | Gate de skills na AGENDA | ✅ **seguido** | Todas as tarefas da Fila pronta têm campo `skills:` preenchido; as concluídas declaram skills usadas (ex.: cod-0061 → "skills-usadas: code-decisions, tdd, security-lgpd, financial-firewall, copywriter"); o mapa tipo→skills está na AGENDA e no `tarefa.md`. |

---

## 4. Achados novos (não cobertos por auditorias anteriores)

**N1 — 🔴 `POST /webhook` sem autenticação, com URL de mídia arbitrária.**
Evidência: `app.post('/webhook', …)` em `src/index.js` — a única rejeição é `Content-Type != application/json`; `validarPayloadWebhook` aceita qualquer `phone` de 10–15 dígitos e qualquer URL que `startsWith('http')` para `image.imageUrl`/`document.documentUrl`. Não há verificação de token/segredo/origem (o `Client-Token` do Z-API não é conferido; compare com `/admin/ativar-pro` e `/cron/monthly-summary`, que TÊM secret). Consequências práticas de um payload forjado: (a) o bot envia mensagens WhatsApp pra qualquer número que o atacante escolher (spam/assédio saindo do número do Economizei — risco de banimento no Z-API/WhatsApp); (b) cada imagem forjada custa 1–2 chamadas Gemini Vision (abuso de custo — exatamente o cenário "conta explode numa noite" do A.2.3 de 05-19); (c) consumo da cota Free de um usuário REAL (10/mês) forjando o phone dele; (d) download de URL arbitrária pelo servidor (SSRF leve). O rate limit não mitiga: é keyed pelo `phone` do payload, que o atacante controla e rotaciona.
Recomendação: exigir um segredo no webhook — o Z-API permite configurar header de segurança no webhook (ou, no mínimo, validar que a URL de mídia pertence a domínio do Z-API + colocar um path secreto no endpoint). É mudança pequena em `index.js`, fora da zona financeira (tarefa de máquina candidata), mas a configuração do lado Z-API é humana.

**N2 — 🟡 `index.js` com 1.187 linhas** — regra dos 800 do CODE_GUIDE §2 estourada há tempos; extrair handlers (onboarding, assinatura, admin) reduziria também a superfície que o firewall precisa varrer em arquivo "misto".

**N3 — 🟡 Gíria proibida no texto do bot:** `formatter.js:287` "qual **tá** mais barato" — viola a regra permanente 4 (verbatim do Gabriel: "cê/tá/né/ó" nunca fora de marketing). 1 palavra, 1 linha.

**N4 — 🟡 CLAUDE.md seção 4 (Stack) desatualizada:** "Infraestrutura: A definir" (produção está no Railway desde antes de 06-04), inventário de `src/` com 7 arquivos (são ~16 + `src/agent/`), lista de envs sem as 8+ adicionadas desde junho. Quem ler só o CLAUDE.md (que é o contrato de boot) subestima o produto.

**N5 — 🟡 Migrations "FUTURA" já aplicadas em produção** (`migration_FUTURA_agente_perguntas.sql`, `migration_FUTURA_alerta_pro_acompanhamentos.sql`) — o prefixo agora descreve o passado errado; risco pequeno mas real de confundir a checagem de migrations do `/entregar` ou um futuro colaborador.

**N6 — 🟢 AGENDA uma entrega atrás do git** (cod-0061 + enxugamento já commitados/pushados hoje, AGENDA ainda os lista como pendentes) — reconciliar na próxima sessão; considerar tornar o passo 5 do `/entregar` inescapável.

**N7 — 🟢 Nota positiva de fechamento de ciclo:** dos 6 buracos de teste apontados em 07-10 (§6), dois já foram fechados por cod-0051/cod-0052 (extração e dedup/webhook agora testados) — a máquina está consumindo os achados de auditoria. O contraste é com os itens HUMANOS de 07-10, que estão 0/6 aplicados (patch firewall, query schema, copy indicação, fluxo MP, log fallback, RPC perguntas).

---

## 5. Apêndice — evidência bruta (comandos executados)

Ambiente: sandbox Linux do Cowork; testes em cópia limpa `/tmp/eco` (src+test+scripts+supabase copiados; `node_modules` espelhado com `sharp` substituído por stub); Node v22.22.3. Nenhum comando de escrita/commit/push/migration/pagamento executado. O firewall e o `check-pages` foram rodados no mount (só leitura); o teste adversarial do firewall rodou em repo git descartável `/tmp/fwtest`.

| Comando | Resultado relevante |
|---|---|
| `git status` / `git log --oneline -40` | branch `main` = `origin/main` @ `882cf6e`; working tree limpo (só o prompt de auditoria untracked) |
| `node --test "test/**/*.test.js"` (em `/tmp/eco`, sharp stubado) | **366 pass / 0 fail** (sem stub: 284 pass / 6 arquivos SIGBUS do sharp — ambiental) |
| `npm audit --omit=dev` | **found 0 vulnerabilities** |
| `node scripts/check-firewall.mjs --working` | ✓ FIREWALL OK (1 arquivo alterado — o prompt) |
| `node scripts/check-firewall.mjs --selftest` | 16/16 OK (mesmos 16 casos de sempre — sem casos novos do patch) |
| `node scripts/check-pages.mjs` | 5 páginas, 0 erros, 20 avisos |
| `/tmp/fwtest`: `git mv src/mercadopago.js src/pagamentos.js` + firewall `--working` | **✓ FIREWALL OK, exit 0 — bypass por rename confirmado** |
| `scanLine()` com os 8 tokens do patch de 07-10 | **8/8 "PASSA LIMPO"** |
| Leitura `scripts/check-firewall.mjs` | sem `--no-renames` (4 ocorrências de `git diff`), sem `src/hotmart.js`, `MONEY_PATTERNS` inalterado |
| `grep /assinar + mercadopago src/index.js` | handler vivo: `:510` → `iniciarAssinatura` → `:879 criarAssinatura` (MP); webhook MP `:307` |
| `grep -rin hotmart src/ scripts/` | vazio |
| `git cat-file -t` nos 20 hashes citados em CLAUDE.md/AGENDA | todos existem |
| `git log -- PAINEL.html` + `git check-ignore` | trackeado em `73f8cce`; não ignorado |
| `grep temperature/reconciliarItens/canonico_suspeito src/gemini.js` | `temperature:0` (:370), `responseMimeType` json (:371), `reconciliarItens` (:123/:307), `canonico_suspeito` (:292) |
| `awk apagarDadosUsuario src/supabase.js` | ordem de DELETE: compras → indicacoes → lembretes → resumos → mensagens_processadas → usuarios |
| `grep writeFile/createWriteStream src/zapi.js` | vazio (imagem/documento só em Buffer) |
| `git ls-files \| grep .env` | só `.env.example` |
| `grep "temFeaturesProAtivas\|COMPARATIVO_MAX" src/{index,formatter,insights}.js` | vazio — **gate Pro não aplicado** |
| `grep "alerta inteligente" src/formatter.js` | :839/:854/:866/:875 — promessa da indicação segue no ar |
| `grep gíria src/formatter.js` | 1 hit: `:287` "qual tá mais barato" |
| `grep beta_fundador supabase/schema.sql` | `:23` comentário ainda promete "3 meses grátis + preço travado" (A10 aberto) |
| `grep incremento_fallback src/supabase.js` | vazio (log do fallback nunca criado — §2.3 de 07-10 aberto) |
| `wc -l src/index.js` / `CLAUDE.md` | 1.187 / 618 |
| `list_scheduled_tasks` (API do scheduler) | 5 tarefas ativas: matinal (last run 07-16), painel (07-13), sentinela (criada, 1ª execução 07-19), checkpoint mensal (próx. 08-01), lembrete sexta (hoje 9h) |
| `awk validarPayloadWebhook src/index.js` + leitura do handler `/webhook` | sem verificação de token/origem; URL de mídia validada só por `startsWith('http')`; rate limit keyed pelo phone do payload |
| `grep w2 supabase/` | `v_retencao_w2` existe em `metrics_views.sql:46` |
| `find . -iname "*.xlsx"` / `stat CALENDARIO.md` | nenhuma planilha de unit economics; CALENDARIO parado desde 06-10 |

**Limitações declaradas:** (1) sem acesso ao Supabase/Railway de produção — migrations rodadas, RPC, purgas TTL e logs reais ficam como "não confirmadas por execução" (a query §3.3 de 07-10 continua sendo o fecho); (2) sem chamadas ao Gemini real — qualidade de classificação em cupom real não mensurada (aud-01); (3) `/apagar` e fluxo de webhook validados por leitura de código + testes unitários, não end-to-end contra banco; (4) o mount do sandbox pode servir arquivo stale (regra 11) — todos os testes rodaram em cópia `/tmp`, e nenhum sintoma de truncamento foi observado nos arquivos lidos.

---

*Auditoria executada em 2026-07-17, sessão Cowork, modo read-only. Este documento não altera CLAUDE.md, AGENDA.md, CODE_GUIDE.md nem PROJECT_INSTRUCTIONS.md, e não gera tarefas cod-XXXX — as decisões sobre o que enfileirar são do Gabriel.*
