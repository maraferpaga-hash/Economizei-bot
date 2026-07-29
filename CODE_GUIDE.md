# 💻 Memória Técnica — Economizei

> **🛠️ Sistema de skills:** veja `C:\Economizei\.claude\skills\README.md`.
> **🧠 Memória estratégica:** veja `C:\Economizei\CLAUDE.md`.
> **🚀 Boot do projeto:** veja `C:\Economizei\PROJECT_INSTRUCTIONS.md`.

> Este arquivo é o **cérebro técnico do código** do Economizei. Sempre que for codar, refatorar,
> adicionar dependência, mudar schema, ou debugar bug não-trivial, **leia este arquivo primeiro**
> e atualize ao final com decisões/aprendizados novos.

> **Critério editorial:** só entra aqui o que rege escolhas técnicas futuras. Implementação descartável fica fora.

**Última atualização:** 2026-07-24 (**Firewall endurecido + sentinela do incremento racy** — `--no-renames` nos 4 `git diff` do `check-firewall.mjs` fecha o bypass por rename; +6 tokens no `MONEY_PATTERNS` (gate Pro/hotmart/admin/`/planos`); +path protegido `src/hotmart.js`; selftest 16→19; commit `27fcc16` com `--no-verify` consciente (o pre-push acusa o próprio firewall por design). Também: `log('incremento_fallback')` em `salvarCompra` — sentinela do lost-update racy. Ver decisão na seção 8 + `Economizei app/Auditoria_Externa_2026-07-17.md`. Sessão anterior: **Schema do Alerta Pro em produção** — migration `acompanhamentos` + `usuarios.categorias_superfluas` rodada/confirmada no Supabase; recorte Free×Pro decidido; ver decisão na seção 8. Sessão anterior: **Agente de Perguntas completo (cod-0010..0017)** — pasta `src/agent/` fechada: periodo, guards, intents, classifier, render, cota, index; padrão de deps injetáveis + lazy-require em todo o agente; ver decisão na seção 8. Sessão anterior: **`/apagar` LGPD implementado** — `src/apagar.js` puro + `apagarDadosUsuario` (DELETE em ordem de FK, firewall-limpo, sem migration); ver decisão na seção 8. Sessão anterior: regra **"Classificação é invariante crítico"** — declarada o coração do produto; ver callout + decisão na seção 8. Desenho do Alerta Inteligente Pro: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`)

---

## 0. ❤️ Classificação é invariante crítico (a regra que rege todas as outras)

> **A classificação dos itens é o CORAÇÃO do Economizei** (princípio do Gabriel, 2026-06-27 — espelhado no `CLAUDE.md`). Cada feature de inteligência (gastos por categoria, inflação pessoal, comparativo, alerta de supérfluo, **acompanhamento personalizável por palavra-chave**) é **só tão confiável quanto a classificação por baixo dela**. Item lido errado, `nome_canonico` pobre ou categoria trocada faz todo o "andar de cima" mentir — número errado, alerta à toa, busca por "cerveja" que não acha a cerveja.

**Invariantes a proteger em todo PR que toque `gemini.js`, extração, `categoria` ou `nome_canonico`:**

1. **Determinismo:** Gemini sempre `temperature:0` + `responseMimeType:'application/json'`. Nunca subir temperatura na extração.
2. **`nome_canonico` descritivo e estável:** deve **liderar pelo substantivo/tipo genérico** do produto (`"cerveja skol lata 350ml"`, não `"skol lata"`; `"chocolate lacta ao leite"`, não `"lacta"`). É isso que torna o matching por palavra-chave (Pilar B do alerta Pro) confiável. Lowercase, sem acento decisivo, sem marca isolada sem o tipo.
3. **Reconciliação item×total** (`reconciliarItens`) e o rastreio **`canonico_suspeito`** são rede de segurança — **manter e fortalecer**, nunca afrouxar um limiar sem um teste que justifique.
4. **Saída segura > erro confiante:** na dúvida, preferir `outros`/marcar como não-identificado a inventar categoria/`nome_canonico` que *parece* certo. Dado de classificação é alto risco (alimenta número que o usuário confia).
5. **Teste de regressão obrigatório:** existe um corpus de nomes de item reais → `nome_canonico`/`categoria` esperados (ver `test/`). **Mexeu em prompt/extração/heurística de canônico ⇒ roda esse teste antes de commitar.** Sem isso, não sobe.

> Quando uma tarefa nova depende de ler o item (qualquer coisa em `insights.js`/matching), a pergunta-zero é: *"a classificação aguenta isso hoje?"* Se não, a tarefa de classificação vem primeiro.

---

## 1. 🏗️ Stack & arquitetura

```
WhatsApp do usuário
   ↓ (webhook Z-API)
Express.js (src/index.js)
   ↓ roteador texto/imagem
   ├── imagem → Z-API download → Sharp preprocess → Gemini 2.5 Flash Vision → parse → Supabase → Z-API send
   └── texto  → handler de comando → Supabase → Z-API send
```

| Camada | Tecnologia | Por quê (decisão registrada) |
|---|---|---|
| Runtime | Node.js ≥ 22 | fetch nativo + Sharp + AbortSignal.timeout (Dockerfile: node:22-bullseye-slim) |
| HTTP | Express.js | Mínimo viável; sem framework pesado |
| WhatsApp | Z-API | Sem CNPJ ainda; sem restrição de template (CLAUDE.md decisão 2026-05-08) |
| IA Vision | Google Gemini 2.5 Flash | Custo/benefício pra OCR + JSON estruturado |
| DB | Supabase (Postgres + Auth) | Hospedado, RLS, REST/RPC pronto |
| Imagem | Sharp | Pré-processamento antes do Gemini (decisão 2026-06-04 — fix WhatsApp comprime imagem) |
| Charts | QuickChart.io | Zero dep, URL GET (decisão 2026-06-06) |
| Schedule | node-cron via `src/scheduler.js` | Lembretes + resumos + digests |
| Deploy | Railway (atual) | Container via `Dockerfile`. Migração futura quando custo justificar. |

### Dependências críticas (atualizar com cuidado)
- `@google/generative-ai` — Gemini SDK.
- `@supabase/supabase-js` — cliente Supabase.
- `express` — servidor.
- `sharp` — preprocessamento (decisão 2026-06-04).
- `node-cron` — agendamento.
- `dotenv` — env loading.
- `ws` — transporte realtime do Supabase (importado em `supabase.js` e `metrics.js`). Dependência real, não remover.

> **Removidos em 2026-06-08:** `axios` (o `zapi.js` migrou para `fetch` nativo), `cors` e `@vercel/analytics` (sem uso em `src/`). O projeto usa um único cliente HTTP: `fetch` nativo.

### Variáveis de ambiente (sempre em `.env.example` sem valores reais)
- `GEMINI_API_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`
- `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_WEBHOOK_URL`, `MP_BACK_URL` (assinatura recorrente Mercado Pago)
- `PIX_KEY` (instruções do `/pix`), `BOT_PHONE` (link `wa.me` do `/convidar`)
- `PORT` (default 3000)

---

## 2. 📁 Estrutura de pastas

```
C:\Economizei\
├── src/
│   ├── index.js           # Express + webhook + roteamento texto/imagem + comandos
│   ├── zapi.js            # Cliente Z-API (download imagem, send texto, send imagem)
│   ├── gemini.js          # Vision parser + safeParse + retry + Sharp preprocess + rastreio canonico
│   ├── supabase.js        # CRUD usuários, compras, itens, preços_mercado, lembretes
│   ├── formatter.js       # Templates de mensagens (PT-BR, persona-aware)
│   ├── alerts.js          # Lógica de alerta (>120% da média 90d)
│   ├── charts.js          # URL do gráfico de BARRAS via QuickChart.io
│   ├── insights.js        # Análise PURA (F2 raio-X categoria, F1 inflação, F4 economia)
│   ├── metrics.js         # Coleta de métricas pra observabilidade
│   ├── monthlySummary.js  # Resumo mensal automático (cron dia 1)
│   ├── weeklyDigest.js    # Digest semanal opcional
│   ├── reengagement.js    # 4 segmentos de lembrete (A/B/C/D)
│   ├── scheduler.js       # node-cron orquestrando os jobs
│   ├── logger.js          # Wrapper de log estruturado
│   └── test-gemini.js     # Script ad-hoc para testes manuais do Gemini
├── supabase/              # SQL migrations + monitoring queries
├── landing/               # Landing page (HTML/CSS/JS estático, deploy Vercel)
├── docs/                  # Documentação técnica adicional
├── .claude/skills/        # 19 skills (17 economizei-* + 2 legadas)
├── Economizei app/        # Pesquisas, análises, roadmap, histórico
├── package.json
├── Dockerfile             # Container para Railway
├── Procfile               # Heroku-style start command (legacy)
├── CLAUDE.md              # Memória estratégica
├── CODE_GUIDE.md          # ← Este arquivo (memória técnica)
└── PROJECT_INSTRUCTIONS.md
```

### Regras de organização
1. **Um arquivo por responsabilidade.** Quando `index.js` passar de 800 linhas, extrair handlers.
2. **Sem subpastas em `src/` até justificar.** Operação solo + 14 arquivos = flat ainda funciona.
3. **Migrations SQL ficam em `supabase/`** com nome `migration_AAAA-MM-DD_descricao.sql`.
4. **Scripts ad-hoc** (tipo `test-gemini.js`) podem ficar em `src/` se rodam contra o stack real; senão, em `scripts/` (criar quando precisar).

---

## 3. 🎨 Padrões de código

### Naming
- **Funções e variáveis JS:** `camelCase` (`enviarResumoMensal`).
- **Constantes globais:** `SCREAMING_SNAKE_CASE`.
- **Arquivos JS:** `camelCase.js` (`monthlySummary.js`).
- **Colunas Postgres / tabelas:** `snake_case` (`phone_number`, `itens_compra`).
- **Texto pro usuário final:** PT-BR sempre (passa pela skill `copywriter`).
- **Comentários no código:** PT-BR ok (operação solo, Gabriel lê).
- **Logs estruturados:** chaves em `snake_case` (`gemini_resposta_bruta`, `zapi_download_tentativa`).

### Async/await
- **Sempre `async/await`**, nunca `.then().catch()` em chain longa.
- **Top-level `try/catch`** em handlers de webhook — webhook nunca responde 500 sem mensagem ao usuário (`sendFallback`).
- **Promise.all** quando paralelizável e independente; **sequencial** quando ordem importa.

### Error handling — as 5 leis
1. **Nunca `catch (e) {}` silencioso.** Sempre log estruturado com contexto.
2. **Usuário nunca vê stack trace.** Stack vai pro log; usuário recebe mensagem amigável via `formatter.js`.
3. **Falhas externas (Gemini, Z-API, Supabase) viram `{ok:false, error}`**, nunca exceção que vaza pro caller.
4. **Retry só onde tem sentido** — `gemini.js` retenta em `borrado`/JSON inválido, **não** em `nao_e_cupom`/`muito_longo`. Z-API download retenta até 2x com guard de tamanho mínimo.
5. **Idempotência via `messageId`** — webhook chamado 2x pelo mesmo evento não duplica compra. **Implementado em 2026-06-07** (`despacharComDedup` em `index.js` + tabela `mensagens_processadas`).

### Padrão `safeParse` (referência: `gemini.js`)
```js
function safeParseGeminiResponse(text) {
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed.total || !Array.isArray(parsed.itens)) {
      throw new Error('JSON sem campos esperados');
    }
    return { ok: true, data: parsed };
  } catch (e) {
    console.error('[gemini] parse fail:', { raw: text.slice(0, 200), err: e.message });
    return { ok: false, error: e.message };
  }
}
```

### Logging — formato estruturado
```js
console.error('[modulo]', { evento: 'gemini_json_invalido', phone_mascarado, err: e.message });
```
- Prefixo `[modulo]` sempre.
- Objeto com chaves snake_case.
- **Nunca logar:** CPF inteiro, telefone inteiro, imagem em base64, chaves de API.
- **Sempre mascarar:** `phone` → últimos 4 dígitos; `cpf` → `123.***.***-09`.

---

## 4. 🔒 Dados sensíveis (regras de manuseio)

| Campo | Sensibilidade | Regra |
|---|---|---|
| `phone_number` | Média (PII) | Hash + últimos 4 em logs. Texto completo só em queries. |
| `cpf` extraído do cupom | **Alta** | Mascarar SEMPRE em log. Nunca exibir ao usuário no resumo. |
| Imagem do cupom | Alta | Processar em memória + descartar. **Não persistir** em Supabase Storage. |
| `itens_compra` | Média | Persistir enquanto conta ativa. Anonimizar após 12m de inatividade (TODO migration). |
| `precos_mercado` | Baixa (anônimo por design) | OK persistir indefinidamente — não tem PII. Pular cupom `tipo='outros'`. |

Detalhamento maior na skill `economizei-security-lgpd`.

---

## 5. 🧪 Testes & smoke

Detalhamento completo na skill `economizei-tdd`.

**Regras-cabeçalho:**
- Framework: **Vitest** (decisão preferida; Jest aceito como alternativa).
- **Fixtures de cupom problemático são prioridade** sobre happy path.
- **Mock externo sempre** (Gemini, Z-API, Supabase). Nunca chamar SDK real em teste.
- **Smoke manual pré-deploy** (3min, 5 passos no README do bot).
- Cobertura **não é meta**. Cobrir caminho crítico + bugs com regressão potencial.

---

## 6. 🚀 Git, commits e deploy

### Branching
- `main` — produção. Deploy automático via Railway no push.
- Branches de feature: `feat/<curto>`, bug: `fix/<curto>`, infra: `chore/<curto>`.
- Sem PRs formais (operação solo) — mas **smoke pré-deploy é obrigatório**.

### Commits (Conventional Commits enxuto)
```
feat: adiciona /gastos com gráfico de categoria
fix: parser tolerante a cupom de farmácia
chore: atualiza dependências
refactor: extrai sendFallback de index.js
docs: atualiza CODE_GUIDE com decisão Sharp preprocess
```
- Mensagem em PT-BR ok.
- Imperativo (`adiciona`, não `adicionei`).
- Sem corpo na maioria; corpo só quando "por quê" não é óbvio.

### Pre-deploy checklist
1. [ ] `npm test` verde (se houver testes).
2. [ ] Smoke manual (5 passos).
3. [ ] `.env.example` atualizado se houve nova env var.
4. [ ] Migration SQL rodada no Supabase antes do push (se aplicável).
5. [ ] `CODE_GUIDE.md` atualizado se houve decisão técnica.

### Rollback
- Railway: deploy anterior fica disponível, rollback via dashboard em ~30s.
- Migration: toda migration SQL precisa ter `-- ROLLBACK` ou explicação no topo.

---

## 7. 📦 Regra de adição de dependência

**Antes de `npm install <pacote>`, responder:**

1. **Qual problema concreto resolve?** Se a resposta é "seria legal ter", **não instala**.
2. **Quantos arquivos vão importar?** Se 1 só e o uso é pontual, considerar implementar à mão (10–30 linhas).
3. **Tamanho do pacote?** Acima de 500KB, justificar bem (Sharp foi justificado: imagem real precisa de C nativo).
4. **Manutenção?** Versão recente, repositório ativo, sem issues críticos abertos.
5. **Substituível por nativo Node 18+?** `fetch` nativo eliminou `axios`; `crypto` nativo elimina `uuid` simples.

Cada dependência nova vira **linha na seção 8** (Decisões técnicas em vigor) com data e racional.

---

## 8. 📋 Decisões técnicas em vigor

| Data | Decisão | Racional |
|---|---|---|
| 2026-07-24 | **Firewall financeiro endurecido + sentinela do incremento racy** | Auditoria externa (`Economizei app/Auditoria_Externa_2026-07-17.md`) re-confirmou 2 buracos abertos desde 07-10. Fix em `scripts/check-firewall.mjs` (arquivo protegido — editado por humano, `--no-verify` consciente): (1) **`--no-renames`** nos 4 `git diff` (working + base) fecha o **bypass por rename** — `git mv src/mercadopago.js src/x.js` deixava de ser pego; agora bloqueia por caminho E conteúdo; (2) **+6 `MONEY_PATTERNS`**: `temFeaturesProAtivas`/`concederFeaturesPro`/`marcarProAtivo`, `\behPro\b`, `COMPARATIVO_MAX_PRO`, `hotmart`, `ADMIN_SECRET`/`X-Admin-Secret`, `['"\`]\/planos\b` — cobrem o gate Pro (que a máquina constrói SEM gate) + webhook Hotmart + admin; (3) **+path protegido** `src/hotmart.js`; (4) **selftest 16→19** trava os tokens contra regressão. Validado: node --check + selftest 19/19 + rename bloqueia + 0 falso-positivo em diff não-financeiro. Commit `27fcc16`. **Também:** `log('incremento_fallback', {fn, phone: maskPhone, erro})` dentro do `if (erroUpdate)` de `salvarCompra` — se aparecer em produção, a RPC `incrementar_compras_mes` falhou e todo cupom usa read-then-write racy em silêncio (auditoria §2.3; verificação da RPC = §3.3, ação humana no Supabase). |
| 2026-07-08 | **Schema do Alerta Pro (`acompanhamentos`) em produção + recorte Free×Pro decidido** | Migration `migration_FUTURA_alerta_pro_acompanhamentos.sql` **rodada e confirmada** no Supabase de produção (tabela `acompanhamentos` com RLS `bloquear_anon`; `usuarios.categorias_superfluas TEXT[]`; FK `ON DELETE CASCADE` faz o `/apagar` limpar os acompanhamentos sozinho). Desbloqueia o **cod-0031** (leitura). **Colunas de `acompanhamentos`:** `id`, `phone_number` (FK), `tipo_alvo` (`categoria\|termo`), `alvo` (lowercased), `rotulo`, `limite_mensal NUMERIC(10,2) NULL`, `superfluo BOOL`, `ativo BOOL`, `alertado_em DATE` (anti-spam do alerta de limite — mês do último aviso), `criado_em`. UNIQUE `(phone_number, tipo_alvo, alvo)`. **Recorte Free×Pro decidido (2026-07-08):** Free = alerta 3 níveis + `/cortar` + pergunta avulsa NL; Pro = acompanhamentos persistentes + alerta de limite + supérfluo configurável (gate `temFeaturesProAtivas`/`is_pro` = humano). Desenho: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. |
| 2026-07-03 | **Agente de Perguntas completo — padrões da pasta `src/agent/`** | Cadeia cod-0010..0017 fechada. **Padrões que valem pra qualquer módulo novo do agente:** (1) **deps injetáveis com resolução preguiçosa POR dependência** (`_resolverDeps` no `agent/index.js`) — injetar as funções de dados evita até o `require('../supabase')` (createClient exige envs) e o teste roda 100% simulado; (2) **lazy-require do SDK Gemini** (`classifier.js`/`render.js`) — importar módulo nunca carrega `@google/generative-ai` nem exige `GEMINI_API_KEY`; (3) **o número nunca nasce no LLM**: executor calcula, `render.js` narra com allowlist (template + `fmt.*` + `mesRef` + pct) conferida por `conferirFidelidadeNumerica`; reprovou → **airbag** template (`fidelidade_ok:false` no log = alarme de regressão); (4) **`temDados:false` nunca vai pro LLM** — template honesto direto (barato e à prova de enfeite); (5) **cota fail-open** (`verificarLimitePerguntas`) — anti-abuso, não trava de custo: erro de leitura não derruba resposta; (6) **aviso do meio por igualdade estrita** (`decidirCota`: `usadas === ceil(limite/2)`) — idempotente sem flag no banco; (7) **reset mensal dos contadores pelas 2 vias** — `verificarLimitePerguntas` zera ambos na virada; `verificarLimiteGratuito` zera `perguntas_mes_atual` em update SEPARADO best-effort (pré-migration a coluna não existe e o update falha sozinho, sem afetar o reset de cupons — NUNCA juntar no mesmo update). **Envs:** `LIMITE_PERGUNTAS_FREE`, `AGENTE_MODO` (template\|llm, default llm), `AGENTE_MODELO`. **Deploy:** migration FUTURA do agente ANTES do push. |
| 2026-06-27 | **`/apagar` (LGPD) — módulo puro `src/apagar.js` + `apagarDadosUsuario` em `supabase.js`, sem migration, firewall-limpo** | Direito de eliminação. **Padrão de separação:** `src/apagar.js` puro (`interpretarApagar(texto)`→`{pedido,confirmar}`, testável sem I/O) ↔ `apagarDadosUsuario(phone)` no `supabase.js` (I/O) ↔ 3 mensagens no `formatter.js`. **Ordem de DELETE por FK:** `compras` (→`itens_compra` por `ON DELETE CASCADE`), `indicacoes` (`.or('indicador_phone.eq.X,indicado_phone.eq.X')`), `lembretes_enviados`, `resumos_mensais_enviados`, `mensagens_processadas`, e `usuarios` **por último** (FK de `compras`→`usuarios`). **Roteamento:** tratado no `index.js` **antes do gate de onboarding** (steps 0/1 engolem texto) pra valer em qualquer etapa. **2 passos:** `/apagar` confirma, `/apagar confirmar` apaga (irreversível). **Firewall:** não referenciar a tabela de eventos de pagamento nem `is_pro`/`assinatura` — nem em comentário (o `scanLine` pega comentários e strings; o teste lista tokens via termos neutros, não literais). **Ressalva:** linha de `usuarios` com FK de eventos de pagamento é barrada — tratar pagante ativo é follow-up humano. Sem coluna/tabela nova. |
| 2026-06-27 | **Classificação declarada invariante crítico (seção 0) + desenho do Alerta Inteligente Pro** | Nova **seção 0** no topo: a classificação (`gemini.js`/`categoria`/`nome_canonico`) é o coração do produto; 5 invariantes (temperature:0, `nome_canonico` liderando pelo tipo genérico, reconciliação+`canonico_suspeito` como rede, saída segura > erro confiante, **teste de regressão obrigatório** ao mexer em extração). Motivado pela evolução do alerta Pro (supérfluo + acompanhamento por palavra-chave), que faz matching por `nome_canonico` e portanto **exige** classificação forte. Desenho técnico: `Economizei app/Desenho_Alerta_Inteligente_Pro_2026-06-27.md`. Novas peças previstas (não codadas — gate Pro/migration = humano): `insights.js` (`casarItemComAlvo`, `buscarGastoSuperfluo`), tabela `acompanhamentos`, comandos `/acompanhar`/`/limite`, intent NL `gasto_por_termo`. |
| 2026-06-18 | **Módulo `src/insights.js` (funções puras de análise) + F2/F1/F4 — sem migração** | Inteligência sobre o gasto separada do acesso a dados (`supabase.js`) e dos templates (`formatter.js`), CODE_GUIDE "um arquivo por responsabilidade". **F2** `analisarRaioXCategorias`: maior categoria do mês + acima/abaixo da média (participação %) dos meses anteriores do próprio usuário + candidato discricionário a corte (`doces`/`bebidas` ≥10%); `montarMensagemGastos` ganhou 3º param opcional `analise`. **F1** `analisarInflacaoPessoal`: preço unitário normalizado `preco_total/quantidade` (fallback `preco`), exige 2+ obs, ≥14 dias e variação 8–150% (descarta ruído de unidade — honestidade); comando `/inflacao`. **F4** `calcularEconomia`: média móvel de 3 meses, `economiaMes` com sinal + `economiaAno` somando só meses abaixo da média (copy afirma exatamente isso); comando `/economia` + linha no resumo mensal (`montarResumoMensal` ganhou 4º param `economia`). Queries novas em `supabase.js`: `buscarHistoricoCategorias`, `buscarHistoricoPrecoItens`, `buscarTotaisMensais` — agregação em JS, `tipo='mercado'` (F1/F4), data sempre via `compras.data_compra` (itens_compra não tem data). **Nenhuma coluna/tabela nova — deploy é só `git push`.** |
| 2026-06-07 | **Assinatura recorrente no cartão via Mercado Pago — `src/mercadopago.js` (fetch nativo, sem dep nova)** | Modelo "preapproval sem plano associado": 1 link de checkout por usuário com `external_reference=phone`. Cartão fica no checkout hospedado do MP (PCI fora do nosso servidor). Webhook `subscription_preapproval` → `POST /webhook/mercadopago` → reconsulta `GET /preapproval/{id}` (fonte da verdade) → liga/desliga `is_pro`. Segurança em 2 camadas: HMAC do `x-signature` + reconsulta no MP (webhook forjado não ativa Pro). Idempotência por `assinatura_eventos(topico, recurso_id=notif_id)`. Notifica só na transição de status. PIX manual continua como alternativa (`/pix`). PRÉ-REQUISITO: rodar `migration_2026-06-07_assinaturas_mp.sql`. |
| 2026-05-07 | **Stack inicial:** Node + Express + Z-API + Gemini Vision + Supabase | MVP funcional com fricção mínima |
| 2026-05-08 | **Manter Z-API até CNPJ + 50–100 usuários** | Meta Cloud API exige template aprovado que restringe alerta proativo |
| 2026-05-08 | **Limite 10 cupons/mês no Free** | Custo Gemini real; 10 cobre uso normal (2-3 mercado/sem) |
| 2026-06-04 | **Sharp como preprocessamento antes do Gemini** | WhatsApp comprime imagem; `normalise() + sharpen()` recupera nitidez. Fallback pro buffer original se Sharp falhar. |
| 2026-06-04 | **Retry automático em download Z-API (2x) e em Gemini (2x)** | Download retenta com guard de tamanho mínimo (<1KB = corrompido). Gemini só retenta em `borrado`/JSON inválido — `nao_e_cupom` retorna imediatamente. |
| 2026-06-04 | **`safeParseGeminiResponse` pattern em todo parse externo** | JSON do Gemini pode vir com ```` ``` ```` ou texto livre — parse seguro evita exceção subir. |
| 2026-06-04 | **Mensagem de fallback amigável ao usuário em qualquer falha técnica** | Stack trace nunca vaza pro WhatsApp. `montarMensagemEnviarComoArquivo` orienta reenvio como Documento. |
| 2026-06-04 | **Cupom não-mercado salvo como `tipo='outros'`** | Antes era rejeitado. Agora conta no limite Free, aparece como fatia única "Outros (não-mercado)" em `/gastos`, NÃO entra na `precos_mercado`. |
| 2026-06-04 | **Imagem do cupom NUNCA é persistida** | Buffer em memória, descartado após processamento. URL Z-API expira sozinha. Decisão de produto + LGPD. |
| 2026-06-06 | **`categoria` (10 valores) + `nome_canonico` extraídos pelo Gemini por item** | Estrutura para gastos por categoria + base anônima para comparativo de mercados futuro. |
| 2026-06-06 | **QuickChart.io como gerador de gráfico (URL GET)** | Zero dependência, sem servidor de render. Sharp continua só pro preprocess de cupom. |
| 2026-06-06 | **`itens_compra` NÃO tem `criado_em`** — filtro de data via JOIN com `compras.data_compra` | Aprendizado de schema descoberto ao escrever `monitoring_canonicos.sql`. Toda query analítica sobre itens precisa do JOIN. |
| 2026-06-06 | **Rastreio de qualidade do `nome_canonico` em 2 camadas** | (1) Runtime: `avaliarQualidadeCanonicoItem()` em `gemini.js` loga `canonico_suspeito`. (2) Auditoria periódica: 5 queries em `supabase/monitoring_canonicos.sql`. |
| 2026-06-07 | **Sistema de indicação `/convidar` — atribuição via `wa.me` + código no texto** | Sem deep-link no WhatsApp: `/convidar` gera código estável (`CONV-XXXX`, alfabeto sem ambíguos) salvo em `usuarios.codigo_indicacao`; link `https://wa.me/<BOT_PHONE>?text=...CODIGO`. O indicado manda o texto no 1º contato, `extrairCodigoIndicacao` (regex) lê e `registrarIndicacaoPendente` grava a aresta. Detecção só em `onboarding_step === 0` (1º contato) — impede "indicar" usuário existente. Nova env `BOT_PHONE`. Ver `CLAUDE.md` decisão 2026-06-07. |
| 2026-06-07 | **Recompensa de indicação vive em `usuarios.features_pro_ate` (timestamptz), separada de `is_pro`** | `concederFeaturesPro(phone, dias)` empilha dias sobre a janela atual com teto de 60d (`min(base+dias, now+60d)`, base = `max(now, atual)` pra nunca encurtar). Gate futuro = helper puro `temFeaturesProAtivas(usuario)` (`is_pro OR features_pro_ate > now`). **`verificarLimiteGratuito` NÃO olha essa coluna** — limite de cupons (teto de custo Gemini) intocado de propósito. Marcos: ativação=7d nos dois lados (`ativarIndicacao`, chamada após cupom salvo, idempotente via flip condicional pendente→ativado); conversão=+30d no indicador (`converterIndicacao`). |
| 2026-06-07 | **Endpoint `POST /admin/ativar-pro?phone=` (X-Admin-Secret) centraliza ativação Pro manual (PIX)** | Seta `is_pro=true` via `marcarProAtivo` e dispara `converterIndicacao` (recompensa do marco 2) numa chamada só, em vez de editar Supabase à mão. Coexiste com o fluxo de assinatura Mercado Pago (`atualizarStatusAssinatura`) que está em construção paralela — ambos mexem em `is_pro`. |
| 2026-06-07 | **Tabela `indicacoes` com `UNIQUE(indicado_phone)` como guarda anti-abuso** | 1 indicação por pessoa (1º código vence); colisão = `23505` tratado como `ja_indicado`. Status pendente→ativado→convertido. Migration `migration_003_indicacoes.sql` (com bloco ROLLBACK). **Rodar antes do push.** |
| 2026-06-07 | **Gemini com `temperature:0` + `responseMimeType:'application/json'`** | Temperatura padrão (~1.0) deixava a extração não-determinística → mesmo cupom dava 38/39/40 itens. Temp 0 torna determinístico; JSON puro reduz falha de parse. |
| 2026-06-07 | **Reconciliação item × total no `gemini.js`** | `reconciliarItens` compara soma dos `preco_total` com o total declarado (tolerância maior entre R$2 e 15%). Loga `gemini_reconciliacao_divergente`; `lerRecibo` escolhe entre as 2 tentativas o resultado que melhor fecha (`_scoreReconciliacao`). |
| 2026-06-07 | **`itens_compra.preco_total` gravado e usado como verdade na agregação por categoria** | Antes só `preco` (unitário) era guardado e a categoria recalculava `preco*quantidade` — dobrava o valor quando o Gemini devolvia o total da linha em `preco_unitario`. Agora agrega por `preco_total` (fallback `preco*qtd` em linhas antigas). Migration `migration_2026-06-07_coerencia_outputs.sql`. |
| 2026-06-07 | **`/gastos` fecha com o total do cupom via resíduo `nao_identificado`** | `buscarGastosPorCategoria` soma os itens e adiciona a fatia "Não identificado" = `total_cupons − soma_itens` (quando > max(R$2, 2%)). Elimina a divergência entre o total da confirmação e o total do /gastos. Resíduo negativo (itens > total) vira log `gastos_itens_excedem_total`. |
| 2026-06-07 | **`compras.tipo` + média de gastos só de `tipo='mercado'`** | Misturar não-mercado (farmácia/posto) derrubava a média e fazia o alerta disparar "acima" quase sempre. `calcularMedia` agora filtra `tipo='mercado'`. Migration adiciona a coluna (default 'mercado'). |
| 2026-06-07 | **Alerta de gasto em 3 níveis configurável por env** | `alerts.js`: `avaliarCompra` retorna `nivel` abaixo/normal/acima (limiares `ALERTA_LIM_ACIMA`/`ALERTA_LIM_ABAIXO`); `deveEnviarMensagem` decide o envio por `ALERTA_MODO` (relevante/sempre/so_acima); default `relevante` = só fala quando o gasto foge do padrão (acima/abaixo). Limiares e modo afináveis por env, sem novo deploy. |
| 2026-06-07 | **Lei 5 implementada — idempotência do webhook Z-API por `messageId`** | `despacharComDedup(messageId, phone, tipo, fn)` em `index.js` envolve o dispatch: grava o `messageId` em `mensagens_processadas` (PK em `message_id`) via `registrarMensagemProcessada`; se já existe (23505) loga `webhook_evento_duplicado` e ignora. Reentrega do mesmo evento (retry/rede/reconexão do Z-API) não duplica compra nem incremento de contador. Atômico por corrida (a PK resolve 2 entregas simultâneas). Sem `messageId` no payload, processa normal (loga `webhook_sem_message_id`). Falha de dedup nunca trava o atendimento (retorna não-duplicado). Mesmo padrão do `assinatura_eventos` do MP. Purga diária (TTL 7d) no cron das 7h via `purgarMensagensProcessadas`. Migration `migration_2026-06-07_idempotencia_messageid.sql`. **Rodar antes do push.** |
| 2026-06-08 | **Limpeza de dependências + migração do `zapi.js` para `fetch` nativo (reaplicado pós-mudança de pasta E:→C:)** | Removidos `axios`, `cors` e `@vercel/analytics` do `package.json`. `zapi.js` reescrito com `fetch` + `AbortSignal.timeout` — um só cliente HTTP no projeto, alinhado ao `mercadopago.js`. Comportamento preservado: mesmas assinaturas, retornos, chaves de log e contagem de retries. Node alinhado a ≥22 (o Dockerfile já usava node:22). `gemini.js`: heurística `pouco_simplificado` afrouxada (era só ruído de log) + contrato do retorno corrigido. **Smoke obrigatório pós-deploy:** receber 1 cupom (download de imagem), a resposta de texto e o gráfico do `/gastos` (send-image). |
| 2026-06-07 | **Backfill de dados antigos pós coerência de outputs** | `supabase/backfill_2026-06-07_dados_antigos.sql` (backfill de DADOS, não schema — rodar bloco a bloco com revisão humana). Parte 1: reclassifica `compras.tipo='outros'` em cupons não-mercado antigos por heurística no nome da loja (PREVIEW `SELECT` antes do `UPDATE`; sem ground truth porque a imagem não é guardada). Parte 2 (OPCIONAL, comentada): `itens_compra.preco_total = preco*quantidade` em linhas NULL — **no-op nos números** (idêntico ao fallback já existente); serve só pra completar a coluna. Ressalva honesta no arquivo: cupons antigos com total-da-linha gravado em `preco` ficariam congelados com valor dobrado, irrecuperável. |
| 2026-06-07 | **`/gastos` usa gráfico de BARRAS HORIZONTAIS (era doughnut)** | `charts.js gerarUrlGraficoCategorias` reescrita: `type:'horizontalBar'`, barras ordenadas desc por gasto, cor por categoria, valor R$ + % no fim de cada barra via datalabels (injetado por placeholder `__FORMATTER__` pós-`JSON.stringify`, pois função não serializa em JSON), altura dinâmica `max(280,110+n*52)`, legenda/eixo X off. Assinatura `(dados, titulo)` inalterada → `index.js`/`monthlySummary.js` intactos. Doughnut ficava ruim de ler com muitas fatias pequenas. |