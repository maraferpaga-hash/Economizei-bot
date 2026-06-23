# 🤖 Máquina Noturna — automação autônoma de código (Claude agendado)

> **Resumo em uma frase:** o GitHub dispara o Claude às 5h da manhã; ele lê a
> `AGENDA.md` e o `CLAUDE.md`, pega a próxima tarefa que você priorizou,
> implementa a mudança de código **com teste** numa branch isolada, roda a rede
> de segurança e abre um Pull Request em rascunho que você revisa de manhã — o PR
> é, ao mesmo tempo, o backup e o controle de qualidade.

**Criado em:** 2026-06-23 · **Foco:** mudanças de **código** (funções novas, refino, bugfix) — páginas continuam possíveis, em 2º plano · **Planejamento:** Opus 4.8 · **Execução:** Sonnet 4.6

> ⚠️ **ATUALIZAÇÃO 2026-06-23 — virada pra código.** Este sistema nasceu mirando
> páginas estáticas, mas a decisão do Gabriel foi torná-lo um **engenheiro
> noturno**: a máquina mexe no **código do bot** (funções novas, refinos,
> correções) com **testes**. A contrapartida obrigatória é a **blindagem
> financeira**: a máquina **nunca** toca pagamento/cobrança, garantido por uma
> trava automática (`scripts/check-firewall.mjs`) que reprova qualquer PR que
> cruze a linha. Onde este guia ainda falar "página", leia "código ou página";
> a rede de segurança nova está na seção 3. Passo a passo com ícones do que é seu
> × da máquina: `Economizei app/Passo_a_Passo_Maquina_Noturna.md`.

---

## 1. A ideia: duas cadeiras

A "máquina que se aprimora sozinha conforme a sua direção" são, na prática, **dois papéis separados** — e isso é de propósito:

- **🧠 A cadeira de planejamento — Opus 4.8 (você, no chat).** É aqui que se decide *o que* fazer e *em que ordem*, pesando prioridade, urgência e os fatores do projeto. O resultado dessa conversa vira tarefa escrita na `AGENDA.md`. Pensar é caro e exige julgamento — então usa o modelo forte, com você junto.
- **🛠️ A cadeira de execução — Sonnet 4.6 (a run noturna, sozinha).** É aqui que o trabalho braçal acontece: pegar a tarefa pronta, gerar a página, validar, abrir o PR. Executar tarefa bem-delimitada é barato e repetitivo — então usa o modelo rápido e econômico, sem babá.

Você **nunca** delega decisão pra cadeira de execução. A máquina noturna só faz o que já foi decidido e escrito. Quando ela topa com uma dúvida de produto/UX/preço, ela deixa anotado no PR e espera você — não inventa.

---

## 2. Arquitetura (adaptada ao repo real do Economizei)

```
  VOCÊ + OPUS 4.8 (chat)                       GITHUB (nuvem)
 ┌───────────────────────┐                ┌───────────────────────────────┐
 │ planejam a próxima      │  escreve →    │  AGENDA.md  (fila priorizada)  │
 │ etapa, priorizam        │               └──────────────┬────────────────┘
 └───────────────────────┘                               │ 05h BRT (cron)
                                                          ▼
                                          ┌───────────────────────────────┐
                                          │  Maquina Noturna (Sonnet 4.6)  │
                                          │  lê AGENDA.md + CLAUDE.md       │
                                          │  1 branch → gera página →       │
                                          │  check-pages → abre PR rascunho │
                                          └──────────────┬────────────────┘
                                                          │ abre PR
                                                          ▼
                                          ┌───────────────────────────────┐
                                          │  CI roda no PR: firewall         │
                                          │  financeiro + sintaxe + testes  │
                                          │  + páginas. (+ Vercel Preview)  │
                                          └──────────────┬────────────────┘
                                                          │ de manhã
                                                          ▼
                                          VOCÊ revisa o diff + o preview →
                                          merge (entra na main) → Vercel
                                          publica.
```

**O que a máquina pode e não pode tocar.** A máquina trabalha no **código não-financeiro** (`src/` exceto a parte de dinheiro, mais `test/`, `scripts/` exceto a trava, e `landing/`/`docs/`). O que ela **nunca** toca: `src/mercadopago.js`, qualquer linha de pagamento/cobrança (assinatura, `is_pro`, `/assinar`, `/pix`, `/cancelar`, checkout, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`), `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile`. Isso é o que a skill `economizei-financial-firewall` manda manter sob decisão humana — e agora é **enforçado por código**, não só por instrução (ver seção 3, "Firewall financeiro"). Página é reversível; código do bot exige a rede de testes + o firewall. A lista completa da zona proibida está no topo da `AGENDA.md`.

---

## 3. A rede de segurança — explicada (a parte que você pediu)

"Rede de segurança" é o conjunto de travas que deixa a máquina trabalhar sozinha **sem poder quebrar o site no ar**. São camadas que se somam — se uma falhar, a próxima segura. Vamos por partes, com os termos.

### O que é "PR" (Pull Request)
Um **Pull Request** é um *pedido de mudança*. Em vez de editar o site direto, a máquina trabalha numa cópia paralela do projeto (uma **branch**) e diz: "fiz estas alterações, dá uma olhada antes de aceitar". Você vê exatamente o que mudou (o **diff**, linha por linha), comenta, e só entra no site (a branch **`main`**) quando **você** clica em *merge*. Enquanto não der merge, **nada está no ar**. É o seu botão de aprovação — e, como o Git guarda todo o histórico, a branch isolada é também o seu **ponto de restauração**: deu ruim, você descarta a branch e nada aconteceu na `main`.

### 🔒 Firewall financeiro — a trava nova e mais importante
Como agora a máquina mexe em **código**, a peça central da segurança é o **firewall financeiro**: `scripts/check-firewall.mjs`. Ele roda no `CI` em todo PR e **reprova** se o diff cruzar a linha do dinheiro, de dois jeitos somados:

1. **Denylist de caminhos:** se um arquivo proibido foi alterado (`src/mercadopago.js`, `supabase/`, `.env*`, `.github/`, `package.json`, o próprio firewall…), falha.
2. **Scan de conteúdo:** nas linhas **adicionadas** do diff, procura padrões financeiros (`mercadopago`, `is_pro`, `assinatura`, `preapproval`, `MP_`, `pix`, `checkout`, `paywall`, `ativar-pro`, `montarMensagemPlanos`…). Assim pega edição financeira escondida dentro de um arquivo "misto" como `index.js`.

Com a **branch protection** exigindo o check `CI`, um PR reprovado pelo firewall fica **não-mergeável**. É a garantia mais forte possível: mesmo que o modelo errasse, o dinheiro não passa — e você vê na revisão. Ele é **rígido de propósito**; um flag quer dizer "humano, olhe aqui", não necessariamente "código errado".

### O que é "CI" no nosso caso (a checagem automática completa)
**CI** (Integração Contínua) são **checagens automáticas que rodam sozinhas em todo PR**. O Economizei não tinha testes; criamos a rede mínima necessária pra código autônomo. O workflow **`CI`** (`.github/workflows/ci.yml`) roda, nesta ordem, em ~1–2 min:

1. **🔒 Firewall financeiro** — `node scripts/check-firewall.mjs` (acima).
2. **🧩 Sintaxe** — `node --check` em todo `src/*.js` e `scripts/*.mjs` (pega arquivo quebrado).
3. **🧪 Testes** — `node --test test/*.test.js` (o runner nativo do Node 22). A baseline é `test/insights.test.js`; **toda lógica nova vem com teste** (regra de TDD no prompt da máquina).
4. **📄 Páginas** — `node scripts/check-pages.mjs` valida o HTML de `landing/`/`docs/` (título, placeholder esquecido, link local quebrado), verde nas páginas atuais.

Se qualquer passo fica vermelho, o PR não pode ser mergeado (com branch protection). Os scripts são Node puro, zero dependência.

> Mais pra frente dá pra somar checagens (Lighthouse, cobertura de teste mínima). Começamos enxuto de propósito: pouca peça, fácil de confiar.

### O que é "branch protection" (a trava que torna tudo obrigatório)
**Branch protection** é uma config do GitHub na branch `main` que **exige** PR + CI verde antes de qualquer merge. Sem ela, as camadas acima seriam só "boa vontade". Com ela ligada, **ninguém** — nem você por engano, nem a máquina — consegue empurrar direto pra `main` com página quebrada. É o que transforma a rede de segurança de recomendação em regra.

### As travas operacionais (de brinde)
- **Modo rascunho (draft PR):** nas primeiras semanas a máquina abre o PR como *rascunho* — um carimbo de "ainda não é pra mergear", que te força a revisar. Você solta a rédea (PR normal) quando confiar no padrão.
- **`--max-turns`:** limita quantas iterações o Claude faz por noite. Controla custo e evita loop infinito.
- **Escopo apertado:** uma tarefa por noite, bem-delimitada, sem decisão de produto. Tarefa boa pra rodar sozinha é "criar página X com a headline Y"; tarefa ruim é "repensar a estratégia da landing".
- **Secret, nunca no código:** a `ANTHROPIC_API_KEY` fica nos GitHub Secrets, jamais escrita num arquivo.

### Como começar a rede de segurança JUNTO com a automação
Você liga as duas coisas na mesma instalação — a rede vem antes do automático ficar solto:

1. **Instala o CI e a trava primeiro** (workflows + branch protection). A partir daí, qualquer PR — seu ou da máquina — já é checado e protegido.
2. **Roda a máquina 1× na mão** (botão *Run workflow*), ainda sem depender do horário, e confere: o PR saiu? a CI rodou? o preview do Vercel mostrou a página? o padrão te agrada?
3. **Só então deixa o cron das 5h trabalhar**, e em **modo rascunho**. Cada manhã você revisa e ajusta o `CLAUDE.md`/a tarefa com o que a máquina entendeu errado. Quando estiver redondo, troca pra PR normal.

Resumindo a ordem mental: **isolamento (branch+PR) → checagem (CI leve) → obrigatoriedade (branch protection) → autonomia (cron)**. A autonomia é a última coisa a ligar, nunca a primeira.

---

## 4. Como a agenda funciona (o ciclo que se repete)

A `AGENDA.md` (na raiz do repo) é o coração. Ela é, ao mesmo tempo, a **fila da máquina** e a sua **memória** — por isso fica versionada no repo e referenciada no `CLAUDE.md`, e é lida em toda conversa nova.

**O ciclo:**

1. **Planejamento (você + Opus, no chat):** discutem a próxima etapa e escrevem uma tarefa nova em `## 🌙 Fila pronta`, na posição certa (topo = mais urgente). O molde da tarefa está no protocolo da própria AGENDA.
2. **Execução (Sonnet, 5h):** pega a primeira tarefa `pronta`, faz, move pra `## 🔧 Em revisão` e abre o PR rascunho.
3. **Revisão (você, de manhã):** vê o preview, revisa o diff, mergeia ou devolve. Tarefa mergeada vira `## ✅ Concluído`.
4. **Repriorização:** você reordena a fila pra próxima noite. Repete.

**O ritual de "puxar a agenda" numa conversa nova** — é só pedir, em qualquer sessão:

> "Leia o `CLAUDE.md` e a `AGENDA.md` e me diga: o que está em revisão esperando por mim, o que está pronto pra próxima noite, e quais são minhas pendências humanas."

Como a `AGENDA.md` está na boot list do `CLAUDE.md`, toda sessão já começa com esse contexto carregado. A seção **`🙋 Ações do Gabriel`** no fim da agenda é o seu painel do que só você resolve (instalar app, aprovar PR, decisões de produto) — separado do que a IA faz.

---

## 5. Arquivos que fazem o sistema (entregues nesta sessão)

| Arquivo | Papel |
|---|---|
| `AGENDA.md` | Fila priorizada + protocolo + painel de ações do Gabriel. **O coração.** |
| `.github/workflows/claude-nightly.yml` | Motor noturno: cron 5h (08:00 UTC), Sonnet, lê a agenda, implementa código com teste, abre PR rascunho. |
| `.github/workflows/ci.yml` | Workflow **CI**: firewall financeiro + sintaxe + testes + páginas, em todo PR. |
| `scripts/check-firewall.mjs` | 🔒 O **firewall financeiro** (zero dependência). Reprova PR que toque dinheiro. Tem `--selftest`. |
| `scripts/check-pages.mjs` | Validador de HTML (zero dependência). Roda no CI e localmente. |
| `test/insights.test.js` | Baseline de testes (node:test) + exemplo pra máquina seguir. |
| `Economizei app/Passo_a_Passo_Maquina_Noturna.md` | Passo a passo com ícones: 👤 você / 🤖 máquina / ⚙️ configurar. |
| `package.json` | Ganhou o script `npm run validate:pages`. |
| `CLAUDE.md` | Boot list aponta pra `AGENDA.md`; nova seção + decisão registradas. |
| `Economizei app/Automacao_Maquina_Noturna.md` | Este guia. |

---

## 6. Setup — passo a passo (faça uma vez)

> Pré-requisitos: ser admin do repo `maraferpaga-hash/Economizei-bot` e ter créditos de API em console.anthropic.com.

1. **Suba estes arquivos.** No seu PC, dentro de `C:\Economizei`, dê `git add` + `commit` + `push` dos arquivos novos (a Cowork não tem credencial do GitHub — o push é sempre seu).
2. **Instale o GitHub App.** No Claude Code, dentro do projeto, rode `/install-github-app`. Isso instala o app, cria o secret `ANTHROPIC_API_KEY` e configura o acesso. (Precisa ser admin.)
3. **Confirme o secret** em Settings → Secrets and variables → Actions: deve existir `ANTHROPIC_API_KEY`.
4. **Ative branch protection** na `main`: Settings → Branches → Add rule → Branch name `main` → marque *Require a pull request before merging* e *Require status checks to pass* → selecione o check **`CI / verificar`**. Salve. **É este passo que torna o firewall financeiro obrigatório.**
5. **(Recomendado) Ligue o Vercel Preview** pro repo, se ainda não estiver: cada PR passa a gerar uma URL de preview com a página renderizada — é assim que você "vê" o que a máquina fez antes de mergear.
6. **Teste na mão antes de confiar no horário:** aba **Actions → Maquina Noturna → Run workflow**. Com a `pag-0001` na fila, confira se sai um PR rascunho, se a CI roda e se o preview aparece.
7. **Deixe o cron trabalhar.** Ele já está ligado pras 5h (BRT) no arquivo. Nas primeiras semanas, mantenha o PR em rascunho e revise toda manhã.

---

## 7. Rollout faseado (validar antes de soltar a rédea)

**Fase 0 — fundação (sem horário ainda).** Suba os arquivos, instale o app, ligue branch protection, rode 1 tarefa simples na mão. Confira: o PR sai bem? a CI roda? o padrão te agrada?

**Fase 1 — rascunho agendado.** Cron das 5h ligado, PRs em rascunho. Toda manhã: revise e corrija o `CLAUDE.md`/a tarefa com o que a máquina errou. É aqui que você ensina o padrão.

**Fase 2 — operação.** Quando confiar, deixe abrir PR normal (tire o "draft"). Você ainda dá o merge; a `main` segue protegida pela CI.

**Mais à frente.** Aumentar cadência (mais de uma tarefa/dia), somar checagens (Lighthouse), ou ampliar o escopo da máquina pra além de páginas — sempre como decisão consciente.

---

## 8. Custos e limites

- **GitHub Actions:** consome minutos de Actions. Repo privado tem cota mensal grátis generosa; um job de ~5-15 min/dia cabe folgado. Veja o billing do GitHub.
- **API Anthropic:** cada noite gasta tokens conforme o tamanho da página e da tarefa. Controlado por `--max-turns 30` + `timeout-minutes: 30` + uso do **Sonnet** (bem mais barato que Opus pra trabalho repetitivo). Tarifas: https://claude.com/platform/api
- **Recomendação de início:** uma tarefa por noite. Meça o gasto na primeira semana antes de aumentar.

---

## 9. Como crescer depois (além de páginas)

A arquitetura já comporta mais — é só adicionar com cuidado:

- **Mais tipos de página:** novos `tipo:` na AGENDA (ex.: post de blog, página de campanha) — só escrever a tarefa.
- **Checagens mais fortes:** Lighthouse/acessibilidade no CI quando o volume de páginas justificar.
- **Tarefas de código do bot (`src/`):** possível, mas é outra liga de risco (toca pagamento/dados). Se um dia abrir essa porta, faça com testes de verdade no projeto + escopo ainda mais apertado + revisão redobrada. Decisão consciente, não default.
- **Cadência:** de uma tarefa/dia pra várias, conforme a sua capacidade de revisar de manhã — o gargalo é a sua revisão, não a máquina.

> Princípio que não muda: a máquina executa o que foi decidido; o julgamento é seu. Ela te dá alavanca, não autonomia de decisão.
