# 🤖 Máquina Local — automação de código na sua máquina

> **Resumo em uma frase:** você roda o Claude Code **na pasta do projeto**, ele
> pega a próxima tarefa da `AGENDA.md`, implementa **com teste**, roda os checks,
> e te mostra o diff — **você revisa e commita** quando estiver bom.

**Atualizado:** 2026-06-24 · **Modo:** execução **local** (descontinuamos o GitHub Actions) · **Planejamento:** Opus 4.8 (no chat) · **Execução:** Claude Code local

---

## 1. Por que local (e não GitHub Actions)

A automação por GitHub Actions só valia a pena pelo **autônomo às 5h sem ninguém olhando**. Na prática isso trouxe muita configuração (App, secret, OIDC, permission-mode, branch protection) e um custo alto por run — para um fundador solo, não compensou. Rodando **local** você ganha:

- **Zero infra:** usa o Claude Code que você já tem, com a sua assinatura. Sem secret, sem workflow, sem Actions.
- **Controle total:** vê o diff na hora e **você** decide o commit. A sua revisão é a melhor rede de segurança que existe.
- **Mais barato e rápido de iterar:** você acompanha, corta cedo se desviar, e não paga run que falhou.

O que **continua valendo** (não muda): a `AGENDA.md` (o plano), o **firewall financeiro** (`scripts/check-firewall.mjs`) e os **testes** (`test/`). Só o aparato do GitHub Actions foi descartado.

---

## 2. O ciclo (como você usa no dia a dia)

1. **Planeje comigo (Opus, aqui no chat):** a gente decide a próxima etapa e escreve a tarefa na `AGENDA.md`, na seção "🌙 Fila pronta".
2. **Na pasta do projeto, abra o Claude Code** e rode o comando **`/tarefa`** (veja como instalar na seção 4) — ou cole o prompt da seção 4.
3. **O Claude implementa** a primeira tarefa pronta, com teste, e roda `npm run check`.
4. **Você revisa o diff**, confere que `npm run check` ficou verde, e **commita você mesmo**:
   ```bat
   git add -A
   git commit -m "feat: <descricao da tarefa>"
   git push
   ```

Uma tarefa por vez. Se não gostar do resultado, é só **não commitar** (`git checkout .` descarta as mudanças não commitadas) — nada foi pro repositório.

---

## 3. A rede de segurança local

Antes de commitar, rode (ou peça pro Claude rodar):

```bat
npm run check
```

Isso roda, em sequência: o **firewall financeiro** (no modo `--working`, olhando as mudanças ainda não commitadas), os **testes** (`node --test`) e a **validação de páginas**. Se ficar vermelho, tem algo pra corrigir antes do commit.

- `npm run check:firewall` — só o firewall (bloqueia se você/o Claude mexeu em pagamento/cobrança).
- `npm test` — só os testes.

> A proteção do dinheiro agora tem duas camadas: **você revisando o diff** (principal) + o **firewall** avisando se alguma mudança tocou a zona proibida. Sem GitHub, sem branch protection — a trava virou um check que roda na sua mão.

---

## 4. O comando `/tarefa` (opcional, recomendado)

O Claude Code aceita comandos próprios do projeto. Para ter um `/tarefa` que dispara o fluxo, crie o arquivo **`.claude/commands/tarefa.md`** na pasta do projeto com este conteúdo:

```markdown
Você é o engenheiro do Economizei rodando LOCAL, na pasta do projeto.
Pegue UMA tarefa da AGENDA.md, implemente com teste, e me mostre o diff pra eu
revisar. Você NÃO commita — eu reviso e commito.

PASSOS:
1) Leia a AGENDA.md. Na seção "## 🌙 Fila pronta", pegue a PRIMEIRA tarefa com
   "status: pronta". Se não houver, me diga e pare.
2) Implemente SÓ o que objetivo/arquivos-alvo/critérios-de-aceite pedem; respeite
   "fora-de-escopo". Padrão: lógica pura em src/insights.js separada de I/O;
   português nos nomes/mensagens. Toda lógica nova vem com teste em
   test/<nome>.test.js (modelo: test/insights.test.js).
3) Rode e deixe verde: npm run check
4) Na AGENDA.md, mova a tarefa de "## 🌙 Fila pronta" para "## 🔧 Em revisão"
   (status: em-revisao + data).
5) Me mostre um resumo (o que mudou, arquivos, como testar, resultado do check).
   NÃO commite.

ZONA PROIBIDA (nunca toque — o firewall reprova): src/mercadopago.js; qualquer
linha de pagamento/cobrança (assinatura, is_pro, preapproval, MP_, /assinar,
/pix, /cancelar, checkout, paywall, preço de plano, montarMensagemPlanos,
features_pro_ate, ativar-pro); supabase/; .env*; .github/; package.json;
Dockerfile; Procfile; scripts/check-firewall.mjs. Se a tarefa exigir isso, NÃO
faça: marque como "bloqueada-humano" na AGENDA e me explique.
```

Aí, na pasta, é só digitar **`/tarefa`** no Claude Code. (Se preferir não criar o comando, cole esse mesmo texto direto no chat do Claude Code quando quiser rodar.)

---

## 5. Zona proibida — FINANCEIRO (continua valendo)

A automação **nunca** mexe em pagamento/cobrança: `src/mercadopago.js`, qualquer linha sobre assinatura/`is_pro`/preapproval/`MP_`/`/assinar`/`/pix`/`/cancelar`/checkout/paywall/preço de plano/`montarMensagemPlanos`/`features_pro_ate`/`ativar-pro`, além de `supabase/`, `.env*`, `.github/`, `package.json`, `Dockerfile`/`Procfile` e o próprio firewall. O `npm run check:firewall` reprova se alguma dessas for tocada. A lista completa está no topo da `AGENDA.md`.

---

## 6. O que foi removido (limpeza do GitHub Actions)

Descartados (não fazem mais parte do projeto): `.github/workflows/claude-nightly.yml`, `.github/workflows/ci.yml`, `.github/workflows/pages-ci.yml`. No GitHub: pode remover a branch protection que exigia o check "CI" e, se quiser, desinstalar o app do Claude e apagar o secret. O `monthly-cron.yml` (resumo mensal) **não** tem relação com isso e permanece. Os comandos de limpeza estão no chat / no histórico do `CLAUDE.md`.
