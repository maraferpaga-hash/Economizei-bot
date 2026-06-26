# 🔍 Auditoria de Código & Direção — Economizei

**Data:** 2026-06-25 · **Escopo:** todo o código do bot (`src/`), SQL (`supabase/`), automação (`scripts/`, `.github/`) e coerência com a memória institucional (`CLAUDE.md` / `CODE_GUIDE.md` / `AGENDA.md`).
**Método:** leitura dos 16 módulos de `src/` linha a linha, checagens estáticas executadas no sandbox, cruzamento de schema × código, e mapa das partes travadas de alto valor.

---

## 🧭 Resumo executivo (TL;DR)

**Veredito:** o código está **sólido e bem defendido** — não achei nenhum bug que derrube o bot. O risco real do projeto **não é técnico, é de entrega e honestidade**: o plano pago promete funções que **ainda não existem no código**, e há promessas ao usuário (apagar dados, comparativo entre mercados) que o produto não cumpre. Isso fica mais perigoso agora que o **anual virou o carro-chefe comercial** — cobrar um ano adiantado por uma promessa vazia é risco de reembolso e de confiança.

**Saúde técnica (verificada no sandbox):**

| Checagem | Resultado |
|---|---|
| `node --check` nos 16 arquivos de `src/` | ✅ todos OK |
| `node --test` (testes) | ✅ 8/8 passam |
| Firewall financeiro (`--selftest`) | ✅ 16/16 |
| `check-pages` (5 páginas HTML) | ✅ 0 erros |
| Cobertura de env (`.env.example` × código) | ✅ completa |

**Os 3 achados que mais importam (🔴):**

1. **O tier pago entrega quase nada do que promete.** `/planos`, a mensagem de assinatura ativada e a recompensa de indicação prometem **"comparativo entre mercados"** e **"alerta inteligente (preditivo + categorizado)"** — mas **nenhum dos dois existe no código**. Um pagante hoje recebe só **cupons ilimitados**. A recompensa de indicação (7/30 dias de "funções Pro") está, na prática, **vazia**.
2. **`/apagar` é anunciado mas não existe.** Aparece nas boas-vindas, no `/privacidade` e no lembrete de 60 dias, mas **não há handler** — o comando cai no "não entendi". É uma **promessa de LGPD não cumprida** (direito de exclusão).
3. **O onboarding tranca todo texto.** Nos steps 0–1, qualquer texto é interceptado pelo onboarding → **`/planos`, `/assinar`, `/pix` ficam inacessíveis até o usuário mandar 1 cupom.** Quem quer pagar antes de mandar foto não consegue. Bloqueia conversão no pior momento.

**Maior alavanca travada:** o **comparativo entre mercados** — o dado já está sendo coletado (`precos_mercado`), só falta a consulta de leitura + um comando + o gate de Pro. É a feature nº 1 da sua pesquisa de validação e está **~50% pronta sem ninguém perceber**.

---

## 1. ✅ O que está bem (não mexer)

Antes dos problemas, o que está bem-feito — porque um audit honesto também diz o que não tocar:

- **Arquitetura limpa e modular.** Separação clara: `gemini.js` (visão), `supabase.js` (dados), `insights.js` (análise pura), `formatter.js` (mensagens), `alerts.js` (lógica de alerta). A regra "um arquivo por responsabilidade" está sendo seguida.
- **Defensividade de produção.** Webhook responde `200` na hora e processa async; top-level `try/catch` em todo handler; falha externa nunca vaza stack pro WhatsApp; degradação segura (se a análise F2 falha, o `/gastos` ainda manda o breakdown).
- **Idempotência real.** Dedup por `messageId` (Z-API) e por `(topico, recurso_id)` (Mercado Pago), ambos com `UNIQUE`/PK garantindo atomicidade em corrida. Bem pensado.
- **Segurança do pagamento.** O fluxo MP nunca liga `is_pro` só por webhook: sempre **reconsulta o recurso no MP** antes (webhook forjado não ativa Pro). HMAC do `x-signature` com `timingSafeEqual`. Cartão nunca toca o servidor.
- **LGPD no manuseio de imagem.** Buffer processado em memória e descartado; imagem nunca persistida. Logs mascaram telefone.
- **Determinismo da leitura.** Gemini com `temperature:0` + `responseMimeType:JSON` + reconciliação item×total + retry só onde faz sentido. Resolveu o "38/39/40 itens".
- **Firewall financeiro funcional.** A trava de código existe, roda e passa no self-test. É um diferencial raro pra operação solo.

---

## 2. 🚨 Achados por severidade

### 🔴 Críticos

**A1 — Funções Pro prometidas e não construídas (entrega + honestidade).**
`formatter.js` promete em vários pontos "comparativo entre mercados" e "alerta inteligente (preditivo + categorizado)" como benefícios ativos do pago:
- `montarMensagemPlanos` (Individual): *"✓ Comparativo entre mercados ✓ Alerta inteligente (preditivo + categorizado por tipo de item)"*
- `montarMensagemAssinaturaAtivada`: *"Agora você tem: ✓ Comparativo entre mercados ✓ Alerta inteligente"*
- `montarBoasVindasIndicado` / `montarAvisoIndicacaoAtivada`: recompensa = *"comparativo entre mercados + alerta inteligente"*

No código: `precos_mercado` só recebe `INSERT` (coleta), **nunca um `SELECT`** — não há comparação. O helper `temFeaturesProAtivas()` está definido e exportado mas **nunca é usado como gate em lugar nenhum** do fluxo. O alerta de `alerts.js` (3 níveis) é enviado a **todos**, igual pro Free e pro Pro. Conclusão: **o pago entrega só "cupons ilimitados"**, e a recompensa de indicação está vazia (dá dias de funções que não existem). *Risco direto sobre a decisão de 2026-06-23/24 de empurrar o anual.*

**A2 — `/apagar` anunciado, sem handler (LGPD).**
Citado em `montarMensagemBemVindo` (*"/apagar — apaga todo seu histórico"*), em `montarMensagemPrivacidade` (*"Para apagar tudo: /apagar"*) e no `montarLembreteInativoD60`. Em `processarTexto` (index.js) **não existe ramo `/apagar`** → cai no fallback "não consegui entender". Além de comando quebrado, é o **direito de exclusão da LGPD prometido e não honrado** — exatamente o tipo de coisa sensível pra um produto que lê CPF e dado financeiro.

**A3 — Onboarding tranca conversão paga.**
`gerenciarOnboarding`: no step 1 + texto, manda `montarOnboarding2()` e **não avança o step**. Em `processarTexto`, `if (step === 0 || step === 1)` intercepta **qualquer texto** antes dos comandos. Resultado: o usuário só "gradua" pro step 2 depois de **mandar uma imagem**. Até lá, `/planos`, `/assinar`, `/pix`, `/convidar` **não respondem** — repetem o onboarding. Quem chega decidido a assinar (ou veio de um anúncio "assine") esbarra num muro antes de ver o preço.

### 🟠 Altos

**A4 — Schema não-reproduzível: `resumos_mensais_enviados` sem `CREATE TABLE`.**
O código (`verificarResumoJaEnviado`, `marcarResumoEnviado`) e o `rls_migration.sql` usam essa tabela, mas **nenhum arquivo SQL a cria**. Ela provavelmente foi criada à mão no console do Supabase. Se o banco precisar ser reconstruído do repositório, **o resumo mensal quebra**. (As outras tabelas — `indicacoes`, `mensagens_processadas`, `assinatura_eventos`, `precos_mercado`, `lembretes_enviados` — têm `CREATE` versionado. Só essa ficou de fora.)

**A5 — O pivô estratégico (anual + Hotmart/Wise) está 0% no produto.**
A `CLAUDE.md` define o **anual como norte comercial** e a migração **MP → Hotmart (anual) + Wise PIX (mensal)**. No código, `mercadopago.js` e `montarMensagemPlanos` só conhecem **planos mensais via Mercado Pago**. Não há ciclo anual, nem Hotmart, nem webhook de ativação. É a maior distância entre estratégia e produto hoje. *Legitimamente bloqueado pela abertura da empresa BC (BLOQUEADOR #1) — mas vale ter clareza de que a oferta-destaque não existe pro usuário ainda.*

**A6 — Cobertura de teste no lugar de menor risco.**
A `economizei-tdd` é mandatória, mas os testes cobrem só `insights.js` (funções puras, baixo risco). **Nada testa o caminho do dinheiro** (`mercadopago.js`, conciliação de webhook, ligar/desligar `is_pro`), nem `formatter.js`, nem o roteamento de `index.js`. O risco está concentrado exatamente onde não há rede.

### 🟡 Médios

**A7 — Deriva de memória + trabalho não commitado.**
A `CLAUDE.md` registra o **encurtamento de mensagens (−25%) como aplicado** ao `formatter.js` (decisão 2026-06-24), mas a `AGENDA.md` lista a mesma tarefa (cod-0004) **em backlog "aguardando aprovação"**. As duas memórias se contradizem. E o working tree tem **13 arquivos modificados + vários untracked não commitados** (`src/formatter.js`, `src/index.js`, `src/insights.js`, o `/cortar` da F3, etc.) → **a produção roda código mais antigo** que o que está na pasta. Recomendo reconciliar: o que de fato já foi deployado?

**A8 — Copy obsoleta contradiz o comportamento.**
`montarMensagemErro` ainda tem o ramo `nao_supermercado`: *"só leio cupons de mercado… Farmácia, restaurante e posto ainda não"*. Mas desde 2026-06-04 o bot **lê e salva** cupom não-mercado (`tipo='outros'`). Mensagem mente sobre o que o produto faz.

**A9 — `cnpj` extraído mas nunca guardado no nível da compra.**
O Gemini extrai o `cnpj`, mas a tabela `compras` **não tem coluna `cnpj`** — `salvarCompra` insere só `{ phone_number, loja, total, data_compra, tipo }`. O CNPJ só sobrevive (anônimo) em `precos_mercado`. Quando o comparativo entre mercados for construído, distinguir loja por CNPJ no histórico do próprio usuário vai ser mais difícil sem isso. Correção barata: adicionar a coluna e gravar.

**A10 — Comentário de schema contradiz decisão revogada.**
`schema.sql` ainda comenta `beta_fundador` como *"garante 3 meses grátis + preço travado ao ativar pagamentos"* — benefício **revogado em 2026-05-19**. Cosmético, mas é contrato escrito errado dentro do schema.

### 🟢 Baixos / nits

- `_writetest_root.tmp` (arquivo vazio) sobrando na raiz do projeto — lixo de teste de escrita.
- O `npm run check` está **vermelho agora** porque o firewall (`--working`) sinaliza `package.json` e o workflow modificados — são mudanças **suas**, legítimas, mas o firewall não distingue humano de máquina. Esperado, só saiba que o gate trava em edição humana de `package.json`.
- `inferirCategoria` (gemini.js) pode devolver `nao_supermercado`, valor fora da lista oficial de `categoria_erro` — só alimenta a copy obsoleta do A8.
- Lembrete `inativo_d10` usa `compras_mes_atual`, que só zera no próximo cupom (reset preguiçoso) — pode citar a contagem do mês passado pra um inativo. Inexatidão pequena.

---

## 3. 🔓 Partes travadas de alto valor (o que destravar primeiro)

Você pediu pra apontar o que está parado e traria grande benefício. Em ordem de retorno sobre esforço:

| # | Feature travada | Estado real | Valor | Esforço | O que destrava |
|---|---|---|---|---|---|
| 1 | **Comparativo entre mercados** | Coleta pronta (`precos_mercado` recebendo dados); **leitura/comparação inexistente** | 🔥 Altíssimo (feature nº1 da pesquisa, razão central pra pagar) | Médio | Query de leitura + comando `/comparar` + gate `temFeaturesProAtivas`. Precisa de densidade de dados (vários usuários na mesma loja). |
| 2 | **Agente de Perguntas (Q&A em linguagem natural)** | Desenhado e fatiado em 8 tarefas (cod-0010..0017); **`src/agent/` nem existe** — 0% construído | Alto (Camada 2/3 do norte; "pergunte sobre seu gasto") | Médio-alto | Sem bloqueio legal. Precisa execução + 1 migration humana (`perguntas_mes_atual` + `perguntas_log`). |
| 3 | **Alerta inteligente (Pro)** | Só o alerta básico de 3 níveis existe, igual pra todos | Médio-alto (diferencia o pago de verdade) | Médio | Definir o que "preditivo/categorizado" significa e gatear por Pro. |
| 4 | **`/apagar`** | Anunciado, sem código | Médio (LGPD + tapa um buraco de confiança) | Baixo | Handler que limpa `compras`, `itens_compra`, `indicacoes`, etc. (cod-0006 no backlog; começar como dry-run). |
| 5 | **Plano anual + Hotmart/Wise** | Estratégia definida; **0% no produto** | Alto (ARPU, caixa adiantado) | Alto + jurídico | Bloqueado pela empresa BC (BLOQUEADOR #1). Depois: ciclo anual no `/planos`/`/assinar` + webhook Hotmart. |

> **Insight central:** itens 1, 3 e 4 não são "construir do zero" — são **terminar o que foi prometido**. O comparativo está meio pronto; o alerta Pro é uma evolução do que já roda; o `/apagar` é um handler pequeno. Fechar esses três alinha o que o pago **promete** com o que **entrega** — pré-requisito pra empurrar o anual com a consciência limpa.

---

## 4. 🎯 Estamos no caminho certo?

**Na visão e na engenharia, sim.** A base técnica é mais madura do que o estágio do negócio sugere: idempotência, firewall, defensividade, logs estruturados — coisas que muita startup com time só faz depois. O norte estratégico (ciência → inteligência → habilidade sobre o gasto) é claro e as funções F1/F2/F4 já sobem essa escada.

**O risco de direção é um só, e é importante:** existe uma **lacuna crescente entre o que o produto promete pagar e o que entrega**, e a estratégia está acelerando justamente o lado da cobrança (anual em destaque, afiliados, tráfego pago) enquanto o lado da entrega Pro segue vazio. A própria `CLAUDE.md` já registra o guarda-rail certo — *"anual amplifica, não conserta; não escalar aquisição antes de W2 ≥ 30%"*. O equivalente técnico desse guarda-rail é: **não vender Pro/anual antes de o Pro existir.**

Há também um sinal de **dispersão de foco**: a próxima grande construção priorizada é o Agente de Perguntas (8 tarefas), uma feature nova e legal — enquanto a promessa paga central (comparativo) continua a 50% e parada. Construir o novo antes de fechar o prometido aumenta a dívida de confiança.

**Recomendação de sequência (honesta, mesmo indo contra a vontade de construir o novo):**

1. **Fechar a promessa antes de cobrar mais.** `/apagar` (rápido, tira risco LGPD) → comparativo entre mercados (destrava o valor nº1 e a recompensa de indicação) → diferenciar o alerta Pro.
2. **Reconciliar a memória e o deploy.** Commitar/deployar o working tree, alinhar `CLAUDE.md` × `AGENDA.md` sobre o que já foi ao ar, versionar `resumos_mensais_enviados`.
3. **Validar retenção (W2) com o que já existe** antes de gastar os ~R$200 em aquisição — o motor de retenção é o Free, que já funciona bem.
4. **Só então** escalar anual/afiliados/ads, com a empresa BC aberta e o Pro entregando de verdade.
5. Agente de Perguntas e novas features entram **depois** de fechado o que já foi prometido.

---

## 5. 📋 Plano de ação priorizado

**Agora (baixo esforço, alto retorno / tapa risco):**
- [ ] Implementar `/apagar` (LGPD) — começar como dry-run que confirma antes de apagar.
- [ ] Corrigir/retirar a copy `nao_supermercado` (A8) e o comentário `beta_fundador` no schema (A10).
- [ ] Versionar `CREATE TABLE resumos_mensais_enviados` numa migration (A4).
- [ ] Commitar/deployar o working tree e reconciliar CLAUDE.md × AGENDA.md (A7); remover `_writetest_root.tmp`.

**Próximo (a alavanca de valor):**
- [ ] Construir a **leitura** do comparativo entre mercados (query + `/comparar` + gate Pro) — destrava o valor pago nº1 e a recompensa de indicação (A1).
- [ ] Persistir `cnpj` em `compras` (A9) — barato e prepara o comparativo.
- [ ] Adicionar testes no caminho do dinheiro e no `formatter` (A6).
- [ ] Desbloquear o onboarding pra comandos de pagamento (A3) — deixar `/planos`/`/assinar`/`/pix` passarem mesmo durante o onboarding.

**Depois (estratégico / bloqueado por jurídico):**
- [ ] Diferenciar o alerta inteligente Pro (A1).
- [ ] Ciclo anual + Hotmart/Wise + webhook de ativação (A5) — após a empresa BC.
- [ ] Agente de Perguntas (cod-0010..0017) — após o Pro estar entregue.

---

## Apêndice — verificações executadas no sandbox

- `node --check` em `src/*.js` (16 arquivos, contornando o cache de bytes-nulos do mount com `tr -d '\000'`): todos OK.
- `node --test "test/**/*.test.js"`: 8/8 passam (inclui os testes da F3 `analisarOndeCortar`, ainda não commitada/mergeada).
- `node scripts/check-firewall.mjs --selftest`: 16/16.
- `node scripts/check-pages.mjs`: 5 páginas, 0 erros, 20 avisos (rotas absolutas resolvidas pelo Vercel — esperado).
- Grep de `precos_mercado`: só `INSERT`, nenhum `SELECT` → comparativo não implementado.
- Grep de `temFeaturesProAtivas`: definido/exportado, **nunca usado** como gate.
- Grep de `/apagar` e `/comparar` em `index.js`: sem handler.
- Cruzamento schema × código: todas as colunas/tabelas usadas existem em migrations, **exceto** `resumos_mensais_enviados` (sem `CREATE`).
- `.env.example` × `process.env.*`: cobertura completa, nenhuma env indocumentada.
- `git status`: 13 modificados + untracked não commitados no working tree.

*Nada foi alterado no código nesta auditoria — só leitura e checagem. Os números de plano/preço citados vêm da `CLAUDE.md`; nenhum valor foi inventado (financial-firewall respeitado).*
