# 🤖 AGENDA — Máquina Noturna do Economizei

> **O que é este arquivo.** É a fila de trabalho da automação e a memória viva do
> que está em andamento. O Gabriel prioriza as tarefas aqui (junto com o Opus 4.8,
> no chat). A execução é **local**: na pasta do projeto, o Gabriel roda o Claude
> Code (comando `/tarefa`), que pega **a primeira tarefa pronta**, implementa com
> teste e mostra o diff — **o Gabriel revisa e commita**.
>
> **Função principal: mudanças de CÓDIGO** — desenvolver funções novas, refinar e
> corrigir o código do bot. **O financeiro é blindado** (ver "Zona proibida"): a
> automação não toca em pagamento/cobrança, e o `npm run check:firewall` reprova
> qualquer mudança que tente.
>
> **Leia este arquivo no início de toda sessão** (está na boot list do `CLAUDE.md`).
> Guia do sistema: `Economizei app/Automacao_Maquina_Noturna.md`.

**Última curadoria:** 2026-06-24 · **Modo:** execução local (GitHub Actions descontinuado)

---

## 🚫 Zona proibida — FINANCEIRO (a máquina NUNCA toca)

> Isto não é só instrução: é **trava automática**. `scripts/check-firewall.mjs`
> roda no CI e **reprova o PR** se o diff mexer em qualquer item abaixo. Com
> branch protection na `main`, um PR reprovado fica **não-mergeável**.

A máquina **não pode** criar, editar ou apagar:

- `src/mercadopago.js` (módulo de pagamento) — arquivo proibido.
- Qualquer linha sobre **pagamento/cobrança**: assinatura, preapproval, Mercado Pago, `is_pro`, `/assinar`, `/pix`, `/cancelar`, checkout, paywall, preço de plano, `montarMensagemPlanos`, `features_pro_ate`, `ativar-pro`.
- `supabase/` (migrations/SQL — schema e tabelas de dinheiro), `.env*` (segredos), `.github/` (os próprios guarda-rails), `package.json`/`package-lock.json` (dependências), `scripts/check-firewall.mjs` (a trava), `Dockerfile`/`Procfile` (deploy).

Se uma tarefa precisar de algo disso, ela vira **pendência humana** (vai pro painel "Ações do Gabriel"), nunca trabalho da máquina.

---

## 📐 Protocolo (como a automação local usa esta agenda)

Quando o Gabriel roda o Claude Code local (comando `/tarefa`), ele:

1. Lê este arquivo (e consulta `CLAUDE.md`/`CODE_GUIDE.md` só se a tarefa exigir).
2. Vai em **`## 🌙 Fila pronta`** e pega a **primeira** tarefa (de cima pra baixo = maior prioridade) com **`status: pronta`**.
3. Implementa só aquela tarefa **com teste** (TDD), roda a rede de segurança, move o bloco pra **`## 🔧 Em revisão`** (status `em-revisao` + data) e **mostra o diff**.
4. **O Gabriel revisa e commita** (a automação não commita nem dá push).
5. Se não houver tarefa elegível, não faz nada.

**Rede de segurança (rode antes de commitar):** `npm run check` = `check-firewall.mjs --working` (financeiro) + `node --test` (testes) + `check-pages.mjs` (páginas).

**Como priorizar (você + Opus):** a ordem dentro de "Fila pronta" É a prioridade. Subiu = roda antes. Os rótulos `[P0]`..`[P3]` são leitura humana; o que manda é a posição. Use `status: pausada` pra tirar da fila sem apagar.

**Formato de uma tarefa** (molde pra copiar):

```
### [P1] Título curto da tarefa
- id: cod-000X
- tipo: feature-codigo | refino-codigo | bugfix | teste | conteudo-seo | landing-ab | institucional
- objetivo: uma frase — o que deve existir ao final
- arquivos-alvo: caminho(s) que a máquina pode criar/editar (fora da zona proibida)
- criterios-de-aceite:
  - critério verificável 1
  - teste cobrindo a lógica nova (node --test verde)
  - firewall financeiro verde
- fora-de-escopo: o que NÃO tocar
- status: pronta
```

`tipo`: **feature-codigo** (função nova) · **refino-codigo** (melhora algo que existe) · **bugfix** · **teste** (sobe cobertura) · **conteudo-seo** / **landing-ab** / **institucional** (páginas). Status: `pronta` · `em-revisao` · `pausada` · `bloqueada-humano` · `concluida`.

---

## 🌙 Fila pronta
*(a máquina executa de cima pra baixo, uma por noite)*

### [P0] F3 — "Onde cortar sem doer"
- id: cod-0001
- tipo: feature-codigo
- objetivo: a partir dos gastos por categoria do mês + histórico do próprio usuário, sugerir 1–2 cortes discricionários honestos (reusa `CATEGORIAS_SUPERFLUAS` de `insights.js`), expostos via comando `/cortar` (ou conclusão anexa ao `/gastos`). Fecha a leva F2→F1→F4→F3 do catálogo (CLAUDE 06-09/06-18).
- arquivos-alvo: src/insights.js (nova função pura `analisarOndeCortar`), src/formatter.js (template da mensagem — NÃO mexer em pricing), src/index.js (registrar o comando, longe da zona financeira), test/insights.test.js
- criterios-de-aceite:
  - função pura, sem I/O, testada com dados sintéticos
  - honestidade: só sugere corte de categoria claramente supérflua e com peso real; nunca inventa número (passa pelo `financial-firewall`)
  - `node --test` verde · firewall financeiro verde
- fora-de-escopo: nada de pagamento/planos/`is_pro`; não tocar `mercadopago.js`; não prometer feature inexistente
- status: pronta

### [P1] Afrouxar a heurística de qualidade do nome_canônico
- id: cod-0002
- tipo: refino-codigo
- objetivo: corrigir o falso positivo `pouco_simplificado` de `avaliarQualidadeCanonicoItem` (gemini.js) — hoje pune canônico bom de cupom já abreviado (pendência registrada no CLAUDE 06-07). É só ruído de log, mas suja a auditoria.
- arquivos-alvo: src/gemini.js (só a heurística de qualidade), test/gemini-canonico.test.js (novo)
- criterios-de-aceite:
  - exemplos reais não acusam mais: "Bisc Marilan 1" → "biscoito marilan", "Picanha Bov Kg 0,456 Kg" → "picanha bovina 0.456kg"
  - teste cobrindo esses casos · `node --test` verde · firewall verde
- fora-de-escopo: NÃO mudar o prompt do Gemini nem o fluxo de leitura do cupom; só a função de avaliação de qualidade
- status: pronta

### [P1] Testes do alerta em 3 níveis
- id: cod-0003
- tipo: teste
- objetivo: cobrir `avaliarCompra` / `deveEnviarMensagem` (alerts.js) com testes dos 3 níveis (abaixo 🎉 / dentro ✅ / acima 📈) e dos limiares por env, solidificando a rede antes de gerar mais feature.
- arquivos-alvo: test/alerts.test.js (novo)
- criterios-de-aceite:
  - cobre os 3 vereditos e o modo "relevante" (default)
  - `node --test` verde · firewall verde
- fora-de-escopo: NÃO mudar a lógica de `alerts.js`, só testar; nada financeiro
- status: pronta

---

## 🔧 Em revisão
*(a máquina move pra cá ao abrir o PR — esperando o Gabriel revisar/mergear)*

*(vazio)*

---

## ✅ Concluído
*(tarefas mergeadas — registro histórico, mais recente no topo)*

*(vazio)*

---

## 🧊 Backlog (ideias não priorizadas — a máquina NÃO pega daqui)
*(rascunhos. Na sessão de planejamento, você + Opus refinam e sobem pra "Fila pronta")*

**Código (não-financeiro):**
- `/apagar`: handler de exclusão de dados do usuário (compras, itens, indicacoes) — LGPD. ⚠️ Sensível (apaga dado): revisar com cuidado, talvez começar como dry-run.
- Afinar limiares do alerta inteligente (`ALERTA_*`) com base em dados reais.
- Testes de `formatter.js` nas mensagens não-financeiras (gastos, inflação, economia).

**Páginas (foco secundário por enquanto):**
- pag-0001: ajustar `landing/vercel.json` pra páginas novas (`/guias/...`) serem alcançáveis (hoje o catch-all joga tudo pro index). Pré-requisito de qualquer página nova de SEO.
- pag-0002: guia SEO "Como economizar no supermercado".
- pag-0003: guia SEO local "Economizar em Fernandópolis e região".
- pag-0004: variação A/B da headline do hero (`landing/index-b.html`).
- Página "Economizei vs. planilha de Excel" (o concorrente real, segundo a pesquisa).

---

## 🙋 Ações do Gabriel (só humano resolve — a máquina não consegue)

> Esta seção é o seu painel. Guia: `Economizei app/Automacao_Maquina_Noturna.md`.

**Setup (uma vez, bem simples):**
- [ ] Ter o Claude Code instalado e logado na sua assinatura na máquina.
- [ ] (Opcional) Criar `.claude/commands/tarefa.md` com o prompt do guia, pra ter o comando `/tarefa`.
- [ ] Pronto — não tem secret, workflow nem GitHub App pra configurar.

**Rotina de cada vez que for trabalhar:**
- [ ] Na pasta do projeto, rodar `/tarefa` no Claude Code (ou colar o prompt do guia).
- [ ] Revisar o diff; rodar `npm run check` (firewall + testes).
- [ ] Commitar e dar push você mesmo se estiver bom; se não, `git checkout .` descarta.
- [ ] Repriorizar a "Fila pronta" pra próxima vez.

**Coisas que SÓ você faz (a automação é barrada de propósito):**
- [ ] Qualquer mudança financeira (pagamento, assinatura, preço, `is_pro`).
- [ ] Rodar migration no Supabase (a automação não toca `supabase/`).
- [ ] Adicionar dependência nova (`package.json` é bloqueado) se uma tarefa precisar.
- [ ] Commit e push (a automação local nunca commita).
- [ ] Decisão de produto/UX/pricing/ICP/promessa de feature.

**Limpeza do GitHub Actions (uma vez, ver comandos no chat):**
- [ ] `git rm` dos workflows `ci.yml` e `claude-nightly.yml` + apagar `pages-ci.yml` (untracked).
- [ ] Se tiver criado branch protection exigindo o check "CI", remover (senão trava PRs futuros).
- [ ] (Opcional) Desinstalar o app do Claude no GitHub e apagar o secret `CLAUDE_CODE_OAUTH_TOKEN`.

---

## ⏳ Aguardando sua decisão (não virou tarefa da fila ainda)

- [ ] **[2026-06-23] Usar a economia do plano anual como prova de marketing na landing.** Ideia: mostrar na própria página o ganho do anual (ex.: selo "pague 10, leve 12 — economize R$19,80/ano no Individual" ou um comparativo mensal × anual) pra justificar o destaque do anual e aumentar conversão. **Parado aguardando sua decisão** — quando aprovar, vira uma tarefa `landing-ab`/`institucional` na "Fila pronta" pra Máquina Noturna montar. Contexto completo no `CLAUDE.md` Seção 3 (plano anual). ⚠️ Atenção: a landing tem **pricing**; uma tarefa dessas precisa ser desenhada pra não esbarrar no firewall financeiro (texto de preço na página é zona sensível — você revisa).
