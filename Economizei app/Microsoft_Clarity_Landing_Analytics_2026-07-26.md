# 🔍 Microsoft Clarity na Landing — pesquisa + plano de ação

> **Criado:** 2026-07-26 · **Status:** ideia registrada (não é fila ainda) · **Área:** Distribuição / Landing / Marketing
> **Pointer na AGENDA:** Backlog → "Páginas" → `pag-0005`
> **Gate:** decisão humana (consentimento + deploy) + faz mais sentido quando houver tráfego (Meta Ads = out/2026, empresa BC)
> **Firewall / Norte:** ✅ não-financeiro (instrumentação de marketing); passa no Teste de Norte porque melhora a **conversão** da landing → mais gente vira usuário do bot (Camada 3, "agir melhor").

---

## 0. Correção de premissa

O Gabriel chamou de "plugin do Google". **Clarity é da Microsoft, não do Google.** É uma ferramenta gratuita de *analytics de comportamento* (heatmap + gravação de sessão). Não confundir com Google Analytics (que mede *quanto*/*quantos*); o Clarity mostra o **porquê** — como a pessoa se mexe na página. Os dois se integram (ver §5), mas são coisas diferentes.

E o enquadramento honesto: **Clarity não "extrai dados das pessoas"** no sentido de nome/telefone/identidade. Ele dá **comportamento anônimo e agregado**. O objetivo real no Economizei não é coletar dado pessoal — é **descobrir por que quem chega na landing não vira usuário do bot**.

---

## 1. O que é e como funciona

Você cola um trecho de JavaScript no `<head>` da landing. A partir daí o Clarity grava automaticamente, sem configuração por página:

- **Session recordings** — "filmes" anônimos de cada visita: movimento de cursor, cliques, rolagem, onde a pessoa travou.
- **Heatmaps** — mapas de calor de **clique**, **rolagem** e **área**, gerados automaticamente pra toda página, sem limite de páginas nem de tráfego.
- **Rage clicks / dead clicks** — clique repetido de frustração, ou clique em algo que parece botão e não é. Ouro pra achar confusão na copy/layout.
- **Funis + resumos por IA (Copilot)** — desde 2025 o Clarity resume cada sessão em texto (de onde veio, ações-chave, anomalias como rage click / dead click / erro de JS).

**Custo:** 100% gratuito. Sem limite de tráfego, sem limite de gravações, sem features premium travadas — heatmaps, gravações, funis, integrações e IA vêm todos por padrão.

**Instalação:** conta grátis em `clarity.microsoft.com` → "Get tracking code" → colar o snippet no `<head>`. Funciona em qualquer plataforma (HTML puro, Vercel, GTM, WordPress, etc.).

---

## 2. O que ele responde pro Economizei

O trabalho da landing é **um só**: converter visitante → clique no CTA do WhatsApp. O Clarity mostra exatamente onde esse funil vaza. As 3 perguntas que ele deve responder:

1. **Headline (A/B):** a "Opção 1" (*"Não deixa o mercado te passar a perna"*) vs "Opção 4" (*"Economizar virou foto"*) — qual segura mais gente na página?
2. **Entendimento do produto:** o pessoal entende que é "só mandar foto do cupom"? Ou trava procurando cadastro (o medo do *"vou ter que alimentar informação"* que apareceu na pesquisa de validação)?
3. **Alcance do CTA:** as pessoas rolam até o bloco de preços / botão do WhatsApp? Ou desistem antes de chegar lá? (heatmap de rolagem)

---

## 3. Fatos importantes / limitações (o que saber antes)

- **⚠️ Retenção de 30 dias.** O Clarity guarda gravações e heatmaps por **30 dias** e depois apaga permanentemente. Implicação: não serve como arquivo histórico — o valor é olhar recorrente (revisão semanal de sexta). Insight que valer a pena, anotar fora.
- **SPA:** em single-page apps o snippet roda só na 1ª carga. **A landing do Economizei é HTML estático (`landing/index.html` na Vercel), então isso não é problema** — cada visita é uma carga real. Só vira tema se um dia a landing virar React/SPA.
- **App mobile:** heatmaps por IA e "conversion maps" ainda não existem pra app nativo. Irrelevante pra landing web; relevante lembrar se um dia houver app.
- **Privacidade:** o Clarity **não respeita o sinal Do Not Track (DNT)** do navegador — ponto a considerar dado o compromisso de privacidade do projeto. Contrapeso: por padrão ele **mascara todo conteúdo sensível** (campos de texto, inputs). Mantê-lo mascarado é a postura certa.

---

## 4. LGPD / consentimento

- **Hoje não é obrigatório** banner de consentimento pro Clarity no Brasil. A exigência de consentimento explícito que a Microsoft ativou (a partir de **31/out/2025**) vale só pra **Europa (EEA) / Reino Unido / Suíça**.
- **Mas** o certo, dado o posicionamento de privacidade do Economizei, é: banner de cookies simples (consentimento afirmativo — banner só informativo não cumpre a LGPD) + campos sensíveis mascarados.
- **Consent API v2 (ConsentV2)** é o método atual e recomendado pra passar o consentimento ao Clarity (a v1 está sendo descontinuada). Ele usa os sinais `analytics_Storage` e `ad_Storage`. Sem consentimento configurado, o Clarity roda em **modo limitado** (funis/heatmaps/jornadas ficam fragmentados) — ou seja, ou faz o consentimento direito, ou aceita dado parcial.

---

## 5. Integração com Google Analytics (opcional)

Existe integração oficial **Clarity ↔ GA4**: um parâmetro `clarity_session_url` aparece no GA4 como link direto pra gravação da sessão do Clarity. Útil se um dia rodarmos GA4 junto (o CLAUDE.md §5 já lista "instalar analytics assim que possível"). GA4 = *quanto*; Clarity = *porquê*; juntos fecham o quadro.

---

## 6. Timing (por que não é fila agora)

- **Meta Ads está travado até a empresa BC (out/2026).** Sem ads, a landing recebe pouca gente → amostra pequena de sessões.
- **Mesmo assim vale instalar cedo:** custo e esforço perto de zero, e os dados começam a acumular (respeitando a retenção de 30 dias). O ganho real vem quando os ads ligarem — aí chegamos em outubro já sabendo o que a página tem de errado, em vez de começar do zero.
- **Não rouba prioridade** da fila atual (Frente 1 / Alerta Pro). É um item de Distribuição pra quando mexermos em landing/marketing.

---

## 7. Plano de ação (quando priorizar)

1. Criar conta gratuita em `clarity.microsoft.com` e um projeto pra landing.
2. Instalar o snippet no `<head>` de `landing/index.html` (direto ou via GTM). — *pode ser tarefa da máquina, tipo `landing-ab`/`institucional`; não toca zona financeira.*
3. Confirmar/ligar o **mascaramento** de conteúdo sensível (default já mascara — validar).
4. Adicionar **banner de consentimento** simples + **Consent API v2** (`analytics_Storage`/`ad_Storage`). — *decisão humana: fazer banner agora ou só quando houver tráfego real de ads?*
5. Definir e anotar as **3 perguntas** da §2 como foco de análise.
6. (Opcional) Ligar **integração GA4** se/quando GA4 estiver no ar.
7. Deixar rodar; revisar na leitura semanal de sexta.

**Deploy é do Gabriel** (via `/entregar`). A máquina/Claude pode preparar o snippet + o código do banner de consentimento prontos pra colar.

---

## 8. Decisões abertas pro Gabriel (quando retomar)

- [ ] Instalar **agora** (acumular dado com tráfego baixo) ou **esperar** os ads de out/2026?
- [ ] Banner de consentimento **já** ou só quando ligar ads? (afeta se o Clarity roda completo ou em modo limitado)
- [ ] Rodar **GA4 junto** (integração oficial) ou só Clarity por ora?
- [ ] Quem escreve o snippet + banner: preparo pronto pra colar quando você pedir.

---

## Fontes

- [Microsoft Clarity — site oficial](https://clarity.microsoft.com/)
- [How to setup Clarity manually — Microsoft Learn](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)
- [Clarity Cookie Consent API — ConsentV2 — Microsoft Learn](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)
- [Microsoft Clarity FAQ — Microsoft Learn](https://learn.microsoft.com/en-us/clarity/faq)
- [Microsoft Clarity Review (2026): Pricing, Features & Alternatives](https://productanalytics.tools/tools/microsoft-clarity/)
- [Microsoft Clarity Review: Pros and Cons (2026) — UXHeat](https://uxheat.com/blog/clarity-review)
- [Clarity divulga mudanças de Privacidade para 2025 — Roesner](https://roesner.com.br/blog/clarity-privacidade-para-2025/)
- [Como configurar o consentimento de cookies do Microsoft Clarity (Guia 2025) — Conversios](https://www.conversios.io/pt/blog/configurar-consentimento-de-cookies-para-o-Microsoft-Clarity/)
