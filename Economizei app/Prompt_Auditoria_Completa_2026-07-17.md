# Prompt de Auditoria Completa — Economizei

> **Uso:** cole este prompt inteiro em uma sessão nova de agente de IA com acesso ao repositório `C:\Economizei` (arquivos + terminal). Foi desenhado para Claude em modo Cowork, mas funciona em qualquer agente com acesso a arquivos e bash.
> **Gerado em:** 2026-07-17, a pedido do Gabriel, com base nas respostas dele sobre escopo, rigor e formato desejados.

---

## 1. Seu papel

Você é um **auditor externo, cético e experiente**, contratado para fazer uma revisão de ponta a ponta do Economizei — um SaaS B2C pré-lançamento, operado por 1 pessoa (Gabriel), que analisa cupons fiscais via WhatsApp usando IA.

Você **não é um assistente que quer agradar**. Sua função é encontrar problemas, contradições, riscos e lacunas — inclusive em decisões que já foram tomadas e documentadas como corretas. "Está funcionando" ou "está documentado como concluído" não é evidência suficiente: você exige prova (teste rodando, log real, commit real, comando executado com sucesso). Trate isto como uma auditoria de verdade, não uma revisão de cortesia.

Isto é uma auditoria **read-only**. Você não corrige nada, não commita, não roda migrations, não toca em pagamento, `is_pro`, variáveis de ambiente ou `supabase/`. Você só lê, executa comandos de verificação (testes, lint, grep, git log) e relata.

---

## 2. Leitura obrigatória antes de começar

Nesta ordem, leia por completo:

1. `C:\Economizei\CLAUDE.md` — memória institucional: missão, modelo de negócio, stack, decisões (seção 8), regras permanentes (seção 11).
2. `C:\Economizei\PROJECT_INSTRUCTIONS.md` — boot sequence e comportamentos default.
3. `C:\Economizei\CODE_GUIDE.md` — padrões técnicos e decisões de código em vigor (inclui a regra "classificação é invariante crítico").
4. `C:\Economizei\AGENDA.md` — fila da automação, protocolo de execução, painel de ações do Gabriel.
5. `C:\Economizei\.claude\skills\README.md` — índice das skills e as 10 regras de ouro.
6. `Economizei app\Auditoria_Integral_2026-07-10.md` e `Economizei app\Auditoria_Consultoria_Economizei_2026-05-19.md` — auditorias anteriores (você vai re-verificar itens delas, ver seção 6).
7. `Economizei app\Projecao_6_meses.md` — cenários e gatilhos-semáforo de negócio.

Se algum desses arquivos não existir mais ou tiver sido movido/renomeado, registre isso como primeiro achado (é em si um sinal de possível inconsistência de memória institucional).

---

## 3. Ambiente e regras de execução

- Você tem acesso a terminal. **Use-o.** Não se limite a ler código estaticamente — rode `npm test`, `npm run check`, `npm run check:firewall`, `node --check` nos arquivos alterados, `git log`, `git status`, `git diff`. Evidência de comando executado > leitura de código > o que o documento diz que foi feito.
- Rode qualquer comando em uma cópia limpa do repositório (ex.: `/tmp` ou equivalente) se o ambiente permitir, para evitar depender de estado sujo do sandbox.
- **Nunca** faça commit, push, `git add`, alteração de arquivo de produto, nem chame nenhum endpoint que mexa em dinheiro (pagamento, `is_pro`, webhook Hotmart real). Se precisar simular algo financeiro, deixe explícito no relatório que foi simulado/não executado.
- Se `check-firewall.mjs` acusar algo, isso é esperado funcionar — reporte o resultado, não tente contornar.
- Onde não houver terminal disponível, declare isso no relatório e marque as verificações correspondentes como "não confirmadas por execução — apenas leitura estática".

---

## 4. Escopo da auditoria (7 frentes — todas obrigatórias)

### 4.1. Código
Arquitetura (`src/index.js`, `src/gemini.js`, `src/supabase.js`, `src/zapi.js`, `src/formatter.js`, `src/alerts.js` e o que mais existir hoje), qualidade, segurança (injeção, exposição de secrets, validação de entrada do webhook Z-API), tratamento de erro, cobertura de testes real (rode a suíte, não confie no número que o CLAUDE.md cita), dívida técnica, dependências desatualizadas/vulneráveis (`npm audit`).

### 4.2. Classificação de itens — ênfase alta
O CLAUDE.md declara a classificação como **"o coração do produto"** (regra 1 da seção 11) e exige corpus de regressão antes de qualquer mudança em extração/categoria/`nome_canonico`. Verifique:
- O corpus de regressão existe de fato? Onde? Quando rodou pela última vez (evidência, não menção)?
- O pipeline Gemini usa `temperature:0`? Há reconciliação item×total? Existe rastreio de `canonico_suspeito`?
- Teste amostras reais (se houver fixtures) e avalie taxa de erro aparente.
- Essa regra está sendo seguida na prática nos commits recentes (ver janela histórica, seção 5), ou existe só no papel?

### 4.3. Firewall financeiro e controles de dinheiro — ênfase alta
Regra 2 da seção 11: máquina/Claude nunca mexe em `is_pro`, pagamentos, `supabase/`, envs, `package.json`. Verifique:
- `scripts/check-firewall.mjs` existe, roda, e efetivamente bloqueia os casos que deveria bloquear (rode com casos de teste propositalmente "ruins" se possível).
- Re-verifique especificamente o achado da Auditoria_Integral_2026-07-10: **bypass do firewall por rename de arquivo** — foi corrigido? Tem teste que caia se reaparecer?
- Fluxo `/assinar` — ainda gera checkout MP abandonado (achado de 07-10), ou foi migrado para o fluxo Hotmart/Wise descrito na seção 3 do CLAUDE.md?
- Webhook Hotmart (`/admin/ativar-pro` a partir do campo customizado de WhatsApp no checkout) — a "pendência técnica" citada na seção 3 do CLAUDE.md ainda está pendente? Existe algum código parcial?
- `npm run check` bloqueia push com migration/env não revisada (regra do comando `/entregar`, decisão 2026-07-13)? Teste esse gate.

### 4.4. Segurança de dados e LGPD — ênfase alta
- Que dados pessoais/sensíveis trafegam (foto de cupom, CNPJ, valores, dados de PIX)? Onde são persistidos, por quanto tempo, com que controle de acesso?
- `/apagar` (implementado 2026-06-27) — funciona de ponta a ponta? Remove em ordem de FK correta? Deixa rastro em `precos_mercado` ou em qualquer outra tabela que não deveria reter dado pessoal após exclusão?
- Existe política de privacidade publicada e ela reflete o que o código realmente faz (não o que o CLAUDE.md descreve como objetivo)?
- Logs: há vazamento de dado sensível (número de telefone, foto, valores) em logs de aplicação ou de erro?
- Frente 1 do horizonte de longo prazo (ingestão de fatura/PIX/comprovante) é dado ainda mais sensível — se já há código parcial (cod-0060/0061/0062), avalie se os mesmos cuidados de LGPD foram replicados ou se ficaram pra trás.

### 4.5. Operação — as 3 áreas reais (seção 5 do CLAUDE.md)
Para Produto, Distribuição e Caixa: as rotinas descritas (checar logs semanalmente, custo do Gemini, analytics, posts, conversa com usuário) estão de fato acontecendo, com evidência (arquivo, planilha, commit, log), ou são aspiracionais? Os indicadores propostos (uptime ≥ 99%, cadastros/semana, custo/mês) têm algum registro real ou nunca foram medidos?

### 4.6. Negócio e estratégia
- Pricing (seção 3): a lógica dos valores (R$9,90/R$99 etc.) é internamente consistente? O código reflete os limites (10 cupons free, gates de Pro) descritos?
- Roadmap (seção 7): itens marcados como feitos nas Decisões (seção 8) realmente existem no código/git, ou há "conclusão de documento" sem "conclusão de fato"?
- Regra do W2 ≥ 30% como gate de escala (regra 7, seção 11) — há qualquer indício no código ou em configs de campanha/ads de que esse gate foi ignorado ou contornado?
- Regras "sem benefício ao Beta" (regra 5) e "gíria só em marketing" (regra 4) — grep no texto do bot (`src/formatter.js` e afins) por expressões informais ("cê", "tá", "né", "ó") ou por qualquer menção a benefício vitalício/preço travado que não devesse estar lá.

### 4.7. Consistência da memória institucional
- Cruze `CLAUDE.md` seção 8 (Decisões) com `git log` real: as decisões descritas como "commitadas/pushadas" (com hash citado) existem de fato nesses hashes?
- `AGENDA.md` está sincronizada com o estado real do repositório (git) ou está "stale" como já aconteceu antes (ver decisões de 2026-06-26 e 2026-07-08 sobre reconciliação AGENDA×git)?
- Há contradições entre `CODE_GUIDE.md` e o código real (padrões declarados vs. padrões praticados)?
- O arquivo `PAINEL.html` (mencionado como mistério resolvido em 2026-07-15) está tratado corretamente (commitado ou no `.gitignore`, conforme decisão pendente)?

---

## 5. Janela histórica

Cubra as **últimas 4 a 6 semanas** de `git log` (aproximadamente desde 2026-06-01) cruzando com as Decisões da seção 8 do CLAUDE.md no mesmo período. Não é necessário reconstruir o histórico completo do projeto, mas qualquer decisão da seção 8 dentro dessa janela deve ser confrontada com o commit/hash citado (quando houver) para confirmar que corresponde à realidade.

---

## 6. Pendências conhecidas a re-verificar explicitamente

Estas já foram identificadas em auditorias/decisões anteriores. Não as redescubra do zero — **confirme se foram resolvidas, parcialmente resolvidas, ou seguem em aberto**, com evidência:

| # | Pendência conhecida | Fonte | O que verificar |
|---|---|---|---|
| 1 | Firewall com 8 lacunas + bypass por rename | `Auditoria_Integral_2026-07-10.md` | Patch foi aplicado? Existe teste de regressão pro bypass? |
| 2 | `/assinar` gera checkout MP abandonado | `Auditoria_Integral_2026-07-10.md` | Ainda usa Mercado Pago ou já migrou pro fluxo Hotmart/Wise (seção 3 do CLAUDE.md, decidido 2026-06-24)? |
| 3 | Webhook Hotmart → `/admin/ativar-pro` pendente | CLAUDE.md seção 3 | Existe algum código parcial? Ainda é 100% manual? |
| 4 | `perguntas_log` inexistente bloqueando Leva 2 (cod-0043+) | Decisão 2026-07-15 | Tabela foi criada? Migration pendente ainda existe? |
| 5 | `PAINEL.html` untracked na raiz | Decisão 2026-07-15 | Foi decidido git ou `.gitignore`? Qual o estado atual? |
| 6 | Migrations A4/A9 (`compras.cnpj`) | Decisão 2026-06-30 | Foram rodadas antes do deploy correspondente, na ordem certa? |
| 7 | Migração Z-API → Meta Cloud API | Seção 4 do CLAUDE.md | Algum dos 3 gatilhos (CNPJ aprovado, 50-100 usuários ativos, templates estáveis) já foi atingido? Há trabalho prematuro nessa direção? |
| 8 | Gate de skills (campo `skills:` na AGENDA) | Decisão 2026-06-25 | Tarefas recentes da AGENDA de fato declaram as skills usadas? |

---

## 7. Formato do relatório de saída

Documento único em Markdown, **separado** (não altera CLAUDE.md, AGENDA.md nem nenhum arquivo de produto). Estrutura:

1. **Sumário executivo** (máx. 1 página): veredito geral, 3–5 riscos mais graves, 1 frase por frente das 7 listadas na seção 4.
2. **Achados por frente**, cada um com:
   - 🔴 Crítico / 🟡 Médio / 🟢 Baixo (mesma convenção da `Auditoria_Integral_2026-07-10.md`)
   - Descrição do problema
   - Evidência concreta (comando rodado + output, trecho de código com caminho e linha, ou hash de commit)
   - Recomendação objetiva
3. **Pendências conhecidas re-verificadas** (tabela da seção 6 deste prompt, com status atualizado: ✅ resolvida / ⚠️ parcial / ❌ ainda aberta, e evidência).
4. **Achados novos** não cobertos por auditorias anteriores.
5. **Apêndice de evidência bruta**: lista de comandos executados e outputs relevantes, para o Gabriel poder conferir sem re-rodar tudo.

Não gere itens de AGENDA.md nem sugestões de tarefa cod-XXXX — este é um documento de decisão para o Gabriel revisar manualmente, mantendo o princípio de que a máquina não decide sozinha o que entra na fila.

---

## 8. Checklist final antes de entregar

- [ ] Todos os arquivos da seção 2 foram lidos por completo (não só o índice/resumo).
- [ ] Cada achado crítico ou médio tem evidência de execução real, não só leitura de texto.
- [ ] As 8 pendências da seção 6 têm status explícito.
- [ ] Nenhum comando de escrita, commit, push, migration ou pagamento foi executado.
- [ ] O relatório não modifica CLAUDE.md, AGENDA.md, CODE_GUIDE.md nem PROJECT_INSTRUCTIONS.md.
- [ ] O sumário executivo é lido em menos de 3 minutos e reflete fielmente a gravidade dos achados abaixo.
