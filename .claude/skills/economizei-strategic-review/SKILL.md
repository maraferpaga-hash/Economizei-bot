---
name: economizei-strategic-review
description: Roda uma revisão geral do projeto Economizei — lê o estado REAL (CLAUDE.md, CODE_GUIDE.md, PROJECT_INSTRUCTIONS.md, índice de skills, código de src/ e git status), detecta erros/inconsistências/oportunidades classificados por severidade, e entrega SWOT + matriz Eisenhower com dono por ação (🤖/🛠️/🤝/🧍) em dual-format. Use quando o Gabriel pedir "revisão geral", "faz um SWOT", "prioriza com Eisenhower", "o que tá inconsistente no projeto", "audita o projeto", ou antes de uma decisão de direção (paywall, escala, contratação). NÃO use para debugar um bug pontual (use economizei-debugging) nem para revisar só métricas (use economizei-growth-analyst).
---

# 🔎 economizei-strategic-review

## Objetivo
Transformar "revisar o projeto" de evento manual e improvisado em **rotina repetível por gatilho**. Olha o Economizei inteiro — documentação, código e estado de deploy — confronta o que está *escrito* com o que está *de fato em produção*, e devolve uma leitura de gestão acionável (SWOT + Eisenhower) que cabe na 1h do Gabriel. A entrega decide; não enche.

## Quando usar
- Gabriel pede "revisão geral", "panorama", "SWOT", "matriz Eisenhower", "prioriza pra mim", "o que tá inconsistente".
- Antes de uma decisão de direção: ativar paywall, escalar aquisição, contratar freela, mudar pricing.
- Início de um novo ciclo (mês/trimestre) ou retomada após pausa.
- Quando a sensação é "tem muita coisa em aberto e não sei o que atacar primeiro".

## Quando NÃO usar
- Bug pontual ou erro específico → `economizei-debugging`.
- Só análise de números/retenção/conversão → `economizei-growth-analyst`.
- Decisão isolada de produto/feature → `economizei-product-principles`.
- Revisão de uma copy/landing específica → `copy-review` / `economizei-copywriter`.

## Entradas ideais
- Acesso de leitura ao repositório `C:\Economizei\` (docs + `src/` + `supabase/`).
- `git status` e `git log --oneline` recentes (estado de deploy é parte do diagnóstico).
- Opcional: a pergunta de decisão por trás ("posso escalar?", "o Pro tá pronto?").

## Saídas esperadas (sempre em dual-format)
1. **Resumo executivo** — 1 frase de decisão + 3–5 ações com dono (🤖/🛠️/🤝/🧍) + "Hoje (≤1h)" + próxima sessão + bloqueadores.
2. **Achados** classificados por severidade: 🔴 crítico / 🟠 alto / 🟡 médio / 🟢 baixo, separando *riscos*, *inconsistências doc×código* e *observações estruturais*.
3. **SWOT** — Forças/Fraquezas (internas) e Oportunidades/Ameaças (externas), cada item ancorado em evidência real do projeto, não genérico. Fechar com uma leitura TOWS (1 jogada central).
4. **Matriz Eisenhower** — Q1 (fazer agora) / Q2 (agendar) / Q3 (automatizar) / Q4 (adiar), com dono por item.
5. **Pointer de registro** — sugerir a linha de decisão pro CLAUDE.md §8.

## Procedimento (passo a passo)

### Passo 1 — Ler o estado real (não confiar na memória)
Ler, nesta ordem: `CLAUDE.md` (estratégia + tabela de decisões + pendências), `CODE_GUIDE.md` (decisões técnicas), `PROJECT_INSTRUCTIONS.md`, `.claude/skills/README.md`, e fazer uma varredura de alto nível em `src/` (`index.js`, `supabase.js`, `gemini.js`, `mercadopago.js`, `alerts.js`, `scheduler.js`) + `package.json` + `.env.example`.

### Passo 2 — Rodar o "gap de deploy" (o achado que mais escapa)
Sempre checar `git status` e `git log --oneline`. **Confrontar o que o CLAUDE.md diz que está "implementado" com o que está commitado/pushado.** Trabalho documentado como pronto mas em working tree = 🔴. Lembrar: Railway só deploya no push da `main`; e migration tem que rodar **antes** do push (colunas novas lidas em toda mensagem quebram o bot se o SQL não rodou).

### Passo 3 — Caçar inconsistências doc × código
Pontos recorrentes a verificar: versão do Node (`package.json` vs docs), dependências reais vs. as listadas no CODE_GUIDE (ex.: axios "removido" mas em uso), deps mortas no `package.json`, contagem/índice de skills, contratos de função vs. comentário, regras auto-impostas violadas (ex.: tamanho de `index.js`), arquivos lixo versionados.

### Passo 4 — Cruzar com os princípios do projeto
Cada achado passa pelo filtro: isso ajuda ou fere "zero atrito", "grátis funciona / pago é melhor", "WhatsApp é o produto", "validar antes de construir", "LGPD é regra de produto"? Achado que fere princípio sobe de severidade.

### Passo 5 — Montar SWOT e Eisenhower
SWOT ancorado em evidência (cada bullet aponta pra um fato do código/doc). Eisenhower calibrado para **12h/semana** e com a regra: *se não move Retenção W2 ou conversão Free→Pro, não entra em Q1/Q2*. Todo item de ação recebe dono 🤖/🛠️/🤝/🧍 (via `economizei-automation-triage`).

### Passo 6 — Entregar e registrar
Saída em dual-format (via `economizei-dual-format`). Fechar sugerindo a linha de decisão pro CLAUDE.md §8 e, se a revisão gerou tarefas, oferecer registrá-las no `CALENDARIO.md`.

## Regras de comportamento
- **Estado real > narrativa.** Se o CLAUDE.md diz "pronto" e o git diz "untracked", o git ganha. Reportar o gap explicitamente.
- **Severidade honesta.** Não inflar 🟢 em 🔴 pra parecer rigoroso, nem suavizar 🔴 pra agradar. Crítico é o que quebra o bot, perde trabalho, ou cobra por algo inexistente.
- **Toda ação tem dono.** Nunca entregar uma lista de "fazer X" sem dizer se é 🤖 (automação), 🛠️ (script/execução técnica), 🤝 (decisão Gabriel+Claude) ou 🧍 (só Gabriel).
- **Cabe em 1h.** O Resumo executivo precisa permitir decidir o "Hoje" em ≤30s. O Relatório é pra quem quer fundo.
- **Sem teatro.** Não listar "área da empresa" ou rotina que não roda. A revisão reflete o que de fato é executado e medido.
- **Não inventar baseline.** Se uma métrica (ex.: Retenção W2) ainda não foi medida, dizer "não medido" — não estimar.

## Severidade — régua de calibragem
| Nível | Critério |
|---|---|
| 🔴 Crítico | Quebra o bot em produção, perde trabalho, viola LGPD, ou cobra por feature inexistente. |
| 🟠 Alto | Inconsistência que vai gerar bug ou decisão errada em breve; doc que mente sobre o código. |
| 🟡 Médio | Ruído que confunde manutenção (deps mortas, contrato desatualizado, doc truncado). |
| 🟢 Baixo | Higiene (arquivo lixo, regra estética violada, falso positivo de log). |

## Anti-padrões
- SWOT genérico de manual de MBA, sem ancorar em fato do projeto.
- Eisenhower que joga tudo em Q1 ("tudo é urgente") — isso é não-priorizar.
- Esquecer o `git status` e auditar só o que o CLAUDE.md afirma (o erro mais caro).
- Recomendar construir feature nova antes de checar se a anterior foi deployada.

## Mantra
> *"O git é a verdade; o CLAUDE.md é a intenção. A revisão mede a distância entre os dois — e diz o que fazer hoje pra encurtá-la."*
