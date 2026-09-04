# 🎬 Desenho da Máquina de Conteúdo — Fase 0 (2026-09-03)

> **Sessão:** execução da Fase 0 do `PROMPT_MAQUINA_CONTEUDO.md` (Cowork, 2026-09-03).
> **Entregue nesta sessão:** este desenho · `AGENDA_CONTEUDO.md` · esqueleto de pastas + `.gitignore` · **peça-piloto renderizada** (`estoque_conteudo/0001_2026-09-03/peca-1-cafe-cenoura/video.mp4`, 30s, 1080×1920, muda à espera da voz).
> **Status:** Fase 0 entregue. **Fase 1 bloqueada até o veredito do piloto** (decisão do Gabriel: piloto ruim → parar e repensar o formato, não construir esteira).

---

## 1. O que foi verificado antes de escrever (regra 14)

| Item | Estado real | Consequência |
|---|---|---|
| `origin/main` | `a4589ea`; working tree só com `.md`/`PAINEL.html`; estoque de código 2/4 (levas 0001/0002 de testes) | Nada desta sessão toca `src/`; zero conflito com a máquina de código |
| Número do bot | `5517996440062` — 5 CTAs `wa.me` na `landing/index.html` | Confirmado; não inventado |
| Texto pré-preenchido `oi #ec-<slug>` | `src/index.js:547-549` normaliza e faz `split(/\s+/)`; `:671` → `ehComando('oi', …)` casa em `palavras.includes('oi')` | **Já funciona hoje** (cai na saudação). Só não grava origem — tarefa de código futura |
| Feature citada no CTA | `/inflacao` existe (`src/index.js:578`, `formatter.js:744`) | CTA honesto; não repete o "alerta preditivo" (B9) |
| Remotion | LICENSE.md oficial: grátis para indivíduo / empresa ≤3 funcionários, uso comercial permitido | Elegível — mas ver §2 |
| **Sandbox do Cowork** | Node 22, Python 3 + PIL 12, ffmpeg 4.4, **sem Chromium**, **sem rede por script** (`curl` → IBGE/fonts/GitHub = bloqueado; só `npm` passa); o browser do Claude alcança o SIDRA | **Muda o desenho** (§2) |
| IBGE / SIDRA | Tabela 7060 responde (v63 mensal + v2265 12 meses, 159 subitens de alimentação no domicílio); último mês = julho/2026 | Fase 1 tem fonte suficiente |
| Menor Preço Brasil | Sem endpoint oficial documentado; API do app é não-oficial; domínio `ERR_BLOCKED_BY_CLIENT` no Cowork | **Fora da Fase 1** (decisão do Gabriel) |
| Calendário IBGE | IPCA ago/26 → **11/09/2026**; IPCA-15 set/26 → 25/09 | Validade do lote 0001 = 11/09 |
| `.gitignore` | 3 linhas, sem `\n` final | Corrigido: `estoque_conteudo/` em linha própria; `git check-ignore -v` confirma as 2 pastas ignoradas |
| Fontes Inter/Sora | Não existem no sandbox; `@fontsource/inter` e `@fontsource/sora` vêm pelo npm (que passa) em `.woff`; convertidas pra `.ttf` com fontTools | Versionadas em `conteudo/assets/fonts/` (OFL) — a esteira não depende de rede pra fonte |

## 2. Decisões desta sessão (8 perguntas da seção 14 + 2 atritos)

| # | Pergunta | Decisão do Gabriel |
|---|---|---|
| A | **Render/coleta** — sandbox sem Chromium nem rede por script (D4: a premissa "scripts Node + scheduled task no Cowork" não se sustentava como escrita) | **Híbrido:** ffmpeg + PIL agora (roda no sandbox, sem intervenção); Remotion só se a revisão das 10 peças pedir visual mais rico. Coleta IBGE pelo **browser do Claude** dentro da run |
| B | **Voz do piloto** (ElevenLabs não contratado, sem voz-referência) | **Rota B:** Gabriel grava os ~30s; o vídeo sai mudo com legenda queimada pra avaliação de formato |
| C | `verificar.mjs` bloqueante? | **Sim** para número sem fonte; resto advisory |
| D | Dia da run | **Quinta** (revisa sexta, publica seg/qua/sex) |
| E | Contas @economizei | **Ainda não existem** — Gabriel cria (pendência no painel) |
| F | Gatilho Fase 2 (dado próprio) | **≥200 cupons · ≥5 mercados · ≥20 obs/agregado**, mesma praça |
| G | Piloto reprovado | **Parar e repensar o formato** |
| H | Menor Preço Brasil | **Fase 1 só IBGE/SIDRA**; backlog |
| 1 | Número do bot | `5517996440062` (confirmado na landing; Gabriel confirma que é o de produção) |
| 6 | Licença Remotion | Grátis no porte (verificado) — irrelevante enquanto ffmpeg for o render |

## 3. Arquitetura (o que muda em relação ao prompt)

O pipeline de 7 estágios e as pastas da seção 6.1 do prompt ficam como estão, com **duas correções de realidade**:

1. **Estágio 1 (RADAR) não é um `.mjs` que faz `fetch`.** No sandbox, script não tem rede. A coleta é feita pelo Claude (browser → JSON) na própria run, e o que vira script é a **normalização** (`radar.mjs` lê o JSON bruto de `conteudo/dados/`, ranqueia, escreve a pauta). Se um dia a run rodar na máquina do Gabriel, o mesmo script pode ganhar o `fetch`.
2. **Estágio 5 (RENDER) é PIL + ffmpeg, não Remotion.** A prova de conceito (`conteudo/piloto/render_piloto.py`) renderiza 900 frames em ~85s. A Fase 1 transforma isso em `render.mjs`/`render.py` parametrizado por um JSON de composição (cenas, tempos, textos, números), mantendo paleta e tipografia oficiais. `remotion/` da seção 6.1 **não é criado** enquanto a decisão híbrida valer.

Tudo o mais — `AGENDA_CONTEUDO.md`, `estoque_conteudo/`, `LEVA.md`, `verificar.mjs`, `empacotar.mjs`, `estoque-conteudo.mjs`, as 3 Regras, a rotação anti-template, a cascata de métricas, o kill switch das 10 peças — segue o prompt.

## 4. A peça-piloto

- **Ângulo:** "Café moído caiu 17%. Cenoura subiu 75%. No mesmo ano." → a "inflação da comida" de 2,6% é média, e ninguém compra a média → 3 itens que caíram × 3 que subiram → "a SUA inflação não é a média; só o seu cupom sabe" → CTA (foto do cupom, número na tela, `/inflacao` existe).
- **Dado:** IBGE/SIDRA t/7060 v/2265, julho/2026 — 20 números na peça, **todos** com linha em `fontes.md` (0 órfãos, checado por script avulso).
- **Teste de Norte:** passa — o espectador sai sabendo que a média do IBGE não mede o carrinho dele, e que dá pra medir.
- **Firewall:** advisory só em "grátis" (plano Grátis tem source, CLAUDE.md §3). Sem preço, sem promessa, sem mercado nomeado, sem feature inexistente.
- **Disclosure:** não exige (dado animado + voz real). Muda se cair pra clone.
- **Validade:** 11/09/2026.
- **Limitações honestas:** (a) está **muda** — a gravação é do Gabriel; (b) Nível 3 da cascata é cego (sem atribuição no bot); (c) as contas ainda não existem.

## 5. Riscos que continuam de pé

| Risco | Onde bate | Mitigação prevista |
|---|---|---|
| **A ideia já morreu uma vez parando no roteiro** (§2.3 do prompt) | Piloto mudo é *quase* roteiro | Só conta como "vídeo pronto" com voz. Se a gravação não chegar em 1 semana, isso é o sinal — e o Plano B (clone) depende de contratação |
| Política de IA das plataformas (finanças + massa + template + voz sintética) | Rota A (clone) em 2 de 3 peças | Disclosure por peça, rotação anti-template, dado com fonte na tela, 1 de 3 com voz real |
| Dado nacional vendido como local | con-0004 (âncora Fernandópolis) | A peça diz "no Brasil"; local é vocabulário/cena. Dado local só na Fase 2 |
| Validade curta (IPCA muda todo mês) | Todo o lote 0001/0002 | REGRA 3 + re-render barato (mesmo roteiro, JSON novo) |
| Render "pobre" de PIL vs Remotion | Percepção de qualidade | Decisão híbrida: revisão das 10 peças decide |
| Sem métrica de origem no bot | Nível 3 cego | Tarefa `cod-XXXX` na AGENDA principal (Fase 3) — conserta um buraco que a landing já tem |

## 6. Perguntas em aberto (não bloqueiam a Fase 1)
1. ElevenLabs: contratar (🟡 firewall — custo, alternativa, critério de saída no painel) ou rodar só com rota B por um tempo?
2. Se o piloto for aprovado: a Fase 1 nasce em Python (o que já renderiza) ou em Node (padrão do repo)? Proposta: **Python pro render, Node pro resto** (`verificar.mjs`, `empacotar.mjs`, `estoque-conteudo.mjs`) — o `npm run check` continua cobrindo a lógica pura.
3. `conteudo/piloto/render_piloto.py` — manter como fóssil da prova de conceito ou apagar quando o `render` parametrizado existir?

## 7. Fase 1 (só depois do veredito) — o que entra
`scripts/conteudo/radar.mjs` (normalização + ranking a partir de `conteudo/dados/`) · `verificar.mjs` (bloqueante número-sem-fonte + advisory, ignorando a marca "Economizei" no scan de "economize") · `empacotar.mjs` + `estoque-conteudo.mjs` (leva, manifesto, teto de 2, validade) · render parametrizado por JSON (paleta/tipografia oficiais, legenda queimada, rodapé) · testes em `test/` pra toda lógica pura.
