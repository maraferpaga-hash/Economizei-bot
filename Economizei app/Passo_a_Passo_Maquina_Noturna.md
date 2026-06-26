# 🪜 Passo a passo — Máquina Noturna (quem faz o quê)

> Documento de bolso. Diz, com ícone, **o que é seu** (👤), **o que é da máquina**
> (🤖) e **o que precisa ser colocado/configurado** (⚙️). A blindagem do
> financeiro está marcada com 🚫.

## Legenda

| Ícone | Significado |
|---|---|
| 👤 | **Você (Gabriel)** faz na mão. |
| 🤖 | **A máquina** (Sonnet, run das 5h) faz sozinha. |
| ⚙️ | **Configurar / colocar** algo (secret, variável, setting). É sempre seu. |
| 🚫 | **Zona proibida** — a máquina é barrada por trava automática. |
| ✅ | Verificação / check. |

---

## Parte 1 — Setup inicial (uma vez só)

Faça nesta ordem. A rede de segurança entra **antes** do automático soltar. Repo: `maraferpaga-hash/Economizei-bot`, branch `main`.

### Pré-requisitos
- ⚙️ **Como pagar a run noturna** — duas opções (escolha uma):
  - **A) Sua assinatura Claude Pro/Max (recomendado se você já paga).** A run usa a cota da sua assinatura via um *OAuth token*; **não precisa comprar nada à parte**. É o modo já configurado no workflow.
  - **B) Chave de API da Anthropic** (console.anthropic.com), cobrança avulsa por uso. Alternativa se você não tem Pro/Max ou não quer misturar com a cota da assinatura.
- 👤 Ser **admin** do repositório no GitHub.
- 👤 Git instalado e já autenticado no GitHub na sua máquina (o push é sempre seu — o Cowork não tem credencial).

### Passo 1 — 👤 Subir os arquivos (git push)

Abra o terminal **na pasta do projeto** e rode os comandos da seção "Comandos do push" mais abaixo. No fim, confira em `https://github.com/maraferpaga-hash/Economizei-bot` que apareceram `AGENDA.md`, `scripts/`, `test/` e `.github/workflows/ci.yml`.

### Passo 2 — 👤 Instalar o app do Claude no GitHub

No Claude Code, dentro do projeto, rode `/install-github-app` — instala o app "Claude" no repositório e dá a ele permissão de abrir PRs. (Sem Claude Code: instale o app manualmente em github.com/apps/claude e autorize no repo.)

### Passo 3 — ⚙️ Colocar o token de autenticação (secret)

O workflow já vem configurado pro **modo assinatura (Opção A)**. Faça:

**Opção A — assinatura Pro/Max (recomendado):**
1. No Claude Code, rode `claude setup-token` — gera um **OAuth token** ligado à sua assinatura.
2. Em **Settings → Secrets and variables → Actions → New repository secret**, crie o secret com nome exatamente **`CLAUDE_CODE_OAUTH_TOKEN`** e valor = o token gerado.

**Opção B — chave de API (avulsa):** crie o secret **`ANTHROPIC_API_KEY`** com sua chave (console.anthropic.com → API Keys) e, no `claude-nightly.yml`, troque a linha `claude_code_oauth_token:` pela `anthropic_api_key:` (já deixei a alternativa comentada no arquivo).

✅ Confira que o secret escolhido aparece em **Settings → Secrets and variables → Actions**. Sem ele, a run noturna falha logo no começo.

> O token/chave é como uma senha — por isso vai em **Secret** (o GitHub guarda oculto e nunca mostra de novo).

### Passo 4 — 👤 Ligar a trava (branch protection) — passo mais importante
Em **Settings → Branches → Add branch ruleset** (ou *Add rule*, no clássico):
1. Branch name pattern: `main`.
2. Marque **Require a pull request before merging**.
3. Marque **Require status checks to pass** e, no campo de busca de checks, selecione **`CI`** (aparece depois que o `ci.yml` rodou ao menos 1×; se ainda não aparecer, faça o Passo 5 antes e volte aqui).
4. Salve.

> É isto que torna o **firewall financeiro obrigatório**: um PR que mexe em dinheiro reprova no `CI` e fica **não-mergeável**. Sem este passo, a trava existe mas não é exigida.

### Passo 5 — 👤 Testar 1× na mão (antes de confiar no horário)
Aba **Actions → "Maquina Noturna (Claude · codigo)" → Run workflow**. Com a `cod-0001` na "Fila pronta", confira: saiu um **PR em rascunho**? o check **`CI`** rodou e ficou **verde** (firewall + testes)? o diff te agrada?

### Passo 6 — 👤 Deixar o cron trabalhar
Já está ligado pras **05h (BRT)** no `claude-nightly.yml`. Nas primeiras semanas, mantenha tudo em rascunho e **revise toda manhã** — é a disciplina que segura o risco de código autônomo.

> ⚙️ **Precisa de mais algum secret?** Para as tarefas de código atuais, **não** — os testes (`node --test`) são puros, não chamam Z-API/Gemini/Supabase. Só se uma tarefa futura exigir rodar o bot de verdade no CI é que entrariam secrets — e aí é decisão sua.

---

## Comandos do push (copiar e colar)

Abra o terminal na pasta do projeto. **Windows (PowerShell ou CMD):**

```bat
cd C:\Economizei

REM 1) Ver o que mudou (opcional, só pra conferir)
git status

REM 2) Adicionar SÓ os arquivos da Máquina Noturna
git add AGENDA.md package.json CLAUDE.md scripts test .github "Economizei app/Automacao_Maquina_Noturna.md" "Economizei app/Passo_a_Passo_Maquina_Noturna.md"

REM 3) Commitar
git commit -m "feat: Maquina Noturna de codigo + firewall financeiro (CI, testes, agenda)"

REM 4) Enviar pro GitHub
git push origin main
```

Se aparecer erro de `.git/index.lock` (trava de um processo anterior), rode `del .git\index.lock` e tente o commit de novo.

> **Subir tudo de uma vez (alternativa):** se quiser também versionar as outras mudanças pendentes (ex.: `landing/index.html` e docs de sessões anteriores), troque o passo 2 por `git add -A` — mas rode `git status` antes pra ver o que vai junto. Há arquivos de sessões passadas ainda não commitados; o `git add` específico acima sobe **só** o sistema da automação.

---

## Parte 2 — O ciclo de cada dia

**De madrugada (🤖, sozinho):**
1. 🤖 Lê `AGENDA.md` + `CLAUDE.md` + `CODE_GUIDE.md`.
2. 🤖 Pega a 1ª tarefa `pronta` da "Fila pronta".
3. 🤖 Cria uma branch, implementa **com teste**, e roda a rede de segurança (firewall financeiro, sintaxe, testes).
4. 🤖 Move a tarefa pra "Em revisão" e abre um **PR em rascunho**.

**De manhã (👤, ~5 min):**
1. 👤 Abre o PR, olha o check **`CI`** (verde = firewall passou + testes passaram).
2. 👤 Revisa o diff. Mergeia se bom; se não, comenta o ajuste ou refina o `CLAUDE.md`/a tarefa.
3. 👤 Reordena a "Fila pronta" pra próxima noite (sozinho ou comigo no Opus).

---

## Parte 3 — 🚫 O que a máquina NUNCA faz (e como a trava garante)

A máquina **não toca em dinheiro**. Proibido: `src/mercadopago.js`, e qualquer linha de pagamento/cobrança (assinatura, preapproval, Mercado Pago, `is_pro`, `/assinar`, `/pix`, `/cancelar`, checkout, paywall, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`). Também proibido: `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile`, e o próprio `scripts/check-firewall.mjs`.

**Como a trava funciona (não depende de boa vontade do modelo):**
- 🤖 `scripts/check-firewall.mjs` roda no `CI` em todo PR. Ele olha o diff e **reprova** se achar arquivo proibido OU linha financeira nova.
- 👤 A **branch protection** que você ligou no passo 4 torna o `CI` obrigatório → PR reprovado **não mergeia**.
- Resultado: mesmo que a máquina errasse e mexesse no financeiro, o PR ficaria vermelho e travado, e você veria na revisão. É a garantia mais forte possível nesse setup.

> A trava é **rígida de propósito**. Se ela barrar algo que você sabe que é seguro, o sinal é "humano, olha aqui" — você decide no merge.

---

## Parte 4 — ⚙️ Coisas que podem precisar ser "colocadas" (e quando)

A máquina é barrada de várias coisas justamente pra te manter no controle. Quando uma tarefa esbarrar nelas, ela vira **sua**:

| Situação | Quem | O que fazer |
|---|---|---|
| Tarefa precisa de **dependência nova** (`package.json` é bloqueado) | 👤 ⚙️ | Você instala a dep e dá push; depois a máquina usa. |
| Tarefa precisa de **mudança no banco** (migration) | 👤 ⚙️ | Você roda o SQL no Supabase. A máquina não toca `supabase/`. |
| Tarefa precisa de **variável de ambiente** nova | 👤 ⚙️ | Você coloca no Railway (e no GitHub Secret, se o CI precisar). |
| Tarefa toca **pagamento/preço** | 🚫 👤 | A máquina não faz. Vira PR manual seu, revisado com cuidado. |
| **Deploy / push** pra produção | 👤 | Sempre seu — o Cowork e a máquina não têm credencial. |
| **Decisão** de produto/UX/pricing/ICP | 👤 | A máquina deixa a dúvida escrita no PR; quem decide é você. |

Quando a máquina topar com uma dessas, ela **para a tarefa**, marca como `bloqueada-humano` e escreve no PR/agenda o que precisa de você. Você acompanha tudo pelo painel **"🙋 Ações do Gabriel"** no fim da `AGENDA.md`.

---

## Resumo em uma tabela

| Etapa | 👤 Você | 🤖 Máquina | ⚙️ Colocar |
|---|---|---|---|
| Subir código / push | ✔ | | |
| Instalar GitHub App | ✔ | | — |
| Colocar token de auth | ✔ | | secret `CLAUDE_CODE_OAUTH_TOKEN` (assinatura) ou `ANTHROPIC_API_KEY` (API) |
| Branch protection (check `CI`) | ✔ | | |
| Planejar/priorizar a agenda | ✔ (comigo no Opus) | | |
| Implementar a tarefa + teste | | ✔ | |
| Rodar firewall + testes no PR | | ✔ (automático no CI) | |
| Revisar e mergear o PR | ✔ | | |
| Mexer em dinheiro | ✔ (PR manual) | 🚫 nunca | |
| Migration / dependência / env | ✔ | 🚫 | ⚙️ conforme a tarefa |
| Decisão de produto/preço | ✔ | 🚫 | |
