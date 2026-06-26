# 🚦 Tráfego Pago & Criação de Páginas — Como o Economizei Entra na Mídia Paga Engatinhando

> **Criado em:** 2026-06-23
> **Origem:** pesquisa web (Meta Ads clique-pro-WhatsApp, Google Ads para WhatsApp, benchmarks Brasil 2025/2026, landing pages de alta conversão, subdomínios na Vercel, estrutura de teste A/B) → traduzida pra realidade do Economizei.
> **Decisões do Gabriel que guiam este doc (23/06):** objetivo = **cadastros grátis (topo de funil)**; canal = **Meta + Google ao mesmo tempo**; entrega = **só pesquisa + estratégia (este documento)**; orçamento = **começa em ~R$200 e cresce se der retorno**.
> **Lente:** `Posicionamento_Norte_Estrategico_2026-06-09.md` (Norte + Teste de Norte) e o `financial-firewall` (não comprometer caixa antes de evidência).
> **Praça:** Fernandópolis-SP e região (CLAUDE.md seção 7.1).

---

## ⚡ Resumo executivo

🎯 **O que muda na sua cabeça primeiro:** quase todo conteúdo de "tráfego pago / vender em cima da página / foot traffic" que circula é feito pra **e-commerce e dropshipping**, onde a conversão é um *checkout* (cartão na hora, produto físico). O Economizei **não vende produto na página** — ele capta alguém pro WhatsApp, que vira usuário grátis e, lá na frente, assinante. Então a "venda" do anúncio é **um cadastro**, e o que você otimiza é o **custo por cadastro (CPL)**, não ROAS de loja. Copiar o playbook de e-commerce ao pé da letra queima dinheiro.

🧭 **O caminho honesto pro seu caso:**
1. **O canal natural não é o Google — é o Meta (Instagram/Facebook) com anúncio de "clique pro WhatsApp" (CTWA).** Ninguém pesquisa "bot de cupom no WhatsApp" no Google; não há demanda existente pra capturar. Meta **cria** a demanda, manda a pessoa direto pra conversa com o bot, e em cidade do interior tem CPM/CPC baratos.
2. **Você escolheu rodar os dois ao mesmo tempo.** Com R$200 isso é arriscado: o mínimo prático no Meta é **R$30–50/dia por campanha**, então R$200 mal dá pra UM canal aprender. Recomendo fortemente **80% Meta / 20% Google de brincadeira**, ou melhor: **Meta primeiro, Google depois**. Detalho o porquê na seção 6.
3. **Para captar cadastro grátis, você quase não precisa de página.** O anúncio CTWA leva direto pro WhatsApp — menos atrito, que é o seu princípio nº 1. A landing page entra como **camada de credibilidade** (pra quem quer "ver o que é antes") e como **terreno de teste de ângulos** (avaliações, dor, preço). Página vira essencial mesmo no Google.
4. **A "automação de criação de página" que você quer já tem base pronta:** sua landing está na Vercel. Dá pra publicar **subdomínios** (`promo.seudominio`, `mercado.seudominio`) clonando a página e trocando só headline/prova social — cada subdomínio = um teste. Este doc explica o COMO; a construção fica pra quando você pedir (você escolheu "só estratégia" agora).

💰 **O plano dos R$200 em uma frase:** rodar **1 campanha Meta CTWA**, objetivo *Mensagens/Leads*, geo Fernandópolis+30km, com **2–3 criativos testando ângulos diferentes** (dor, esperteza, prova social), medir **CPL e taxa de 1º cupom**, e só escalar (verba ou novo público) o que provar número. Semáforo de decisão na seção 9.

⚠️ **O caveat que o `financial-firewall` obriga:** o CLAUDE.md trata "gastar em aquisição antes de validar retenção (W2)" como **anti-padrão** ("empurrar água em balde furado"). R$200 é pequeno e serve pra **aprender o canal** — ótimo. Mas escalar de verdade só depois que o cohort de Fernandópolis mostrar que **fica** (W2 ≥ 30%). Aquisição não conserta retenção; só amplifica o que já existe.

---

## 1. O reframe: por que o seu funil é diferente do "tráfego pago" comum

O vídeo de tráfego pago típico mostra: anúncio → página de vendas → checkout → "fiz R$10 mil com R$1 mil de ads". Esse mundo tem três coisas que você **não tem**: um preço cobrado na própria página, uma margem por venda clara, e um pixel que vê a compra acontecer. No Economizei:

- **A conversão primária é grátis** (começar a usar o bot). Dinheiro só aparece depois, via Pro (R$9,90–R$22), e mesmo assim por PIX/MP fora do anúncio.
- **A "compra" acontece no WhatsApp**, não num site — o pixel do Meta/Google não enxerga direto o que rolou lá dentro. Rastrear exige um truque (seção 7).
- **O valor é temporal e de hábito** — a pessoa só percebe o valor depois de mandar alguns cupons. Logo, "custo por clique barato" não significa nada se o clique não vira **uso recorrente**.

Tradução prática: a métrica-rainha não é CPC nem CPM, é **custo por cadastro que manda o 1º cupom (ativação)**. Um clique de R$1 que nunca manda cupom é mais caro que um clique de R$3 que vira usuário ativo.

### O funil real, etapa por etapa

| Etapa | O que é | Onde mede | Métrica |
|---|---|---|---|
| Impressão | Anúncio aparece | Meta/Google | CPM (custo por mil) |
| Clique | Pessoa toca no anúncio | Meta/Google | CPC, CTR |
| Conversa iniciada | Abre o WhatsApp e manda 1ª msg | Meta (CTWA conta isso) / bot | Custo por conversa |
| **Cadastro** | Bot registra o número | **Supabase** | **CPL (custo por lead/cadastro)** |
| **Ativação** | Mandou o **1º cupom** | **Supabase** | **Custo por ativação** ← a que importa |
| Retenção W2 | Mandou cupom na 2ª semana | Supabase | % do cohort |
| Pro | Virou pagante | Supabase/MP | CAC pago real |

Você só pode julgar uma campanha de verdade da linha "Ativação" pra baixo. As de cima são sinais intermediários.

---

## 2. Glossário de métricas (com referência Brasil 2025/2026)

Os números abaixo são **médias agregadas** (boa parte em dólar, mercado inteiro) — servem de bússola, não de promessa. Em **cidade do interior** com geo-segmentação, tende a sair **mais barato** que a média nacional, porque há menos anunciante disputando o mesmo público.

| Sigla | O que é | Como se lê | Referência (Brasil) |
|---|---|---|---|
| **CPM** | Custo por mil impressões | Quão caro é "aparecer" | Meta BR ~US$2,8/mil em média no período jun/25–mai/26 (~R$15/mil), com picos sazonais |
| **CPC** | Custo por clique | Quanto custa cada toque no anúncio | Meta BR oscilou ~US$0,06–0,58 (média ~US$0,35 ≈ ~R$2), muito abaixo da média global |
| **CTR** | Cliques ÷ impressões | Quão atraente é o criativo | Saudável costuma ser > 1%; CTWA bom often 1–3% |
| **CPL** | Custo por lead/cadastro | Quanto custa **trazer 1 usuário** | Blogs citam ~R$47/lead em CTWA otimizado pra clique (com desperdício); otimizar pra "leads" derruba ~24% |
| **CPA / Custo por ativação** | Custo por ação que importa (1º cupom) | Eficiência real | Sem benchmark público — **você vai descobrir o seu** com os R$200 |
| **Custo por conversa** | Custo por conversa iniciada no WhatsApp | Métrica nativa do CTWA | Varia muito; meça o seu |
| **Fase de aprendizado** | Período em que o algoritmo Meta busca padrão | Não mexa na campanha aqui | Precisa de volume (~50 eventos/semana por conjunto pra "sair" dela) |

> **A armadilha do CPC baixo:** um exemplo da pesquisa ilustra bem — clique de R$15 no Google convertendo 10% = lead a R$150; clique de R$2 no Meta convertendo 1% = lead a R$200. **O clique barato pode sair mais caro no fim.** Sempre olhe até o CPL/ativação, nunca pare no CPC.

---

## 3. Páginas e subdomínios — quando usar, como montar, como clonar

### 3.1. Você precisa de página pra captar cadastro grátis? Nem sempre.

Como seu objetivo é **cadastro grátis** e seu princípio é **zero atrito**, o caminho mais curto é **anúncio CTWA → WhatsApp direto** (sem página no meio). Cada etapa extra (carregar página, achar o botão, clicar de novo) derruba conversão. Use a página quando ela **adiciona** algo:

- **Credibilidade / "ver antes de entrar":** parte do público B/C desconfia de "bot" e quer ver que é real (avaliações, como funciona, privacidade). A landing serve a esse perfil.
- **Google Ads:** aqui a página é **obrigatória** — Google manda pra um site, não pra conversa (dá pra usar botão WhatsApp na página).
- **Teste de ângulos:** página é onde você testa mensagens diferentes (dor vs esperteza vs prova social) de forma controlada.

Regra: **Meta → testar primeiro indo direto pro WhatsApp.** Se o CPL vier alto, testar a variante "anúncio → landing → WhatsApp" e comparar.

### 3.2. Anatomia de uma landing page de campanha que converte

Ordem testada (sua landing atual já tem quase tudo — a de campanha é uma versão **enxuta e focada em 1 ação**):

1. **Primeira dobra (o que aparece sem rolar):** promessa em 1 frase + subtítulo + **1 botão** (WhatsApp). Promessa no frame brasileiro de "ser esperto / não dar mole" (CLAUDE.md). Ex.: *"Descubra pra onde vai o dinheiro do mercado — sem planilha, sem app."*
2. **Prova social cedo:** "X pessoas em Fernandópolis já usam", print de conversa, avaliação com nome+foto. **Depoimento com rosto converte mais que frase solta.**
3. **Como funciona em 3 passos** (manda foto → IA lê → você vê o resumo). Mostra o "zero atrito".
4. **Quebra de objeção:** "vai dar trabalho?" e "o cupom já mostra isso" (suas 2 objeções de sempre).
5. **Prova social de novo, perto do CTA final** — é onde bate a dúvida final.
6. **CTA repetido** + rodapé com privacidade/LGPD (gera confiança).

Princípios técnicos da pesquisa: **carregar em < 3s**, **mobile perfeito** (seu público é 100% celular), **1 objetivo só** (não encha de links), e **pouco campo** se houver formulário (cada campo extra = mais abandono — mas no seu caso o "formulário" é o próprio WhatsApp, então melhor ainda).

> **Crédito de credibilidade — atenção à honestidade (passa pelo `financial-firewall`):** prova social só vale se for **real**. "Mais de 5.000 clientes" inventado é tiro no pé e fere o princípio de copy honesta do projeto. No começo, use o que é verdade: número real de usuários, prints reais (com permissão), "feito em Fernandópolis". Avaliação fabricada não entra.

### 3.3. Subdomínios na Vercel — a "automação de criação de página"

Sua landing já está na Vercel (deploy automático via Git). Pra ter várias páginas de campanha sem comprar domínio novo, o caminho é **subdomínio**:

- `economizei.seudominio` → site principal (já existe).
- `promo.seudominio`, `mercado.seudominio`, `esperto.seudominio` → cada um uma variante de campanha.

**Três jeitos de fazer (do mais simples ao mais escalável):**

1. **Um projeto Vercel por subdomínio (mais simples):** clona a pasta da landing, troca headline/prova social/criativo, cria um novo projeto na Vercel e aponta o subdomínio em *Settings → Domains*. Bom pra 2–5 páginas.
2. **Pastas no mesmo projeto + rotas:** uma página por rota (`/promo`, `/mercado`) — mais fácil de manter, mas não é "subdomínio puro". Suficiente pra teste de ângulo.
3. **Wildcard `*.seudominio` + multi-tenant (Platforms Starter Kit da Vercel):** infraestrutura que cria subdomínio dinamicamente. **Overkill agora** — só faz sentido quando você gerar dezenas de páginas. Anotado pro futuro.

**Recomendado pra começar:** opção 1 ou 2. Quando você pedir a construção (você escolheu "só estratégia" hoje), eu monto um **template clonável** (1 arquivo, trocar 5 variáveis no topo = nova página) + o passo a passo de apontar o subdomínio. Isso é a "automação" que você descreveu, na versão enxuta e sem dependência cara.

### 3.4. Teste A/B de página

Duas variantes mudando **UMA coisa por vez** (só a headline, ou só a prova social). Mande tráfego pros dois subdomínios e compare a taxa de clique-pro-WhatsApp. Sem ferramenta paga: dá pra alternar qual subdomínio o anúncio usa, ou usar o teste A/B nativo do Meta apontando criativos pra URLs diferentes. **Nunca teste 5 coisas ao mesmo tempo com pouco tráfego** — você não saberá o que moveu o número.

---

## 4. Canal 1 — Meta Ads (Instagram/Facebook) clique-pro-WhatsApp (CTWA)

É o **carro-chefe** pro seu caso. O anúncio aparece no feed/stories e tem botão que abre a conversa no WhatsApp do bot.

### 4.1. Pré-requisitos (one-time)

- Página no Facebook (do Economizei).
- Conta de anúncios no Gerenciador de Negócios (Meta Business) com forma de pagamento.
- **WhatsApp conectado ao Gerenciador** — sem isso a opção "WhatsApp" não aparece. (Atenção: hoje seu bot roda via **Z-API**, não pela WhatsApp API oficial da Meta. CTWA funciona apontando pro número; confirmar no setup que o número do bot pode ser ligado ao Business sem quebrar o Z-API — **ponto a validar antes**, anotado na seção 11.)

### 4.2. Configuração que importa

- **Objetivo da campanha:** *Mensagens* (ou *Leads* com destino WhatsApp). **Nunca "Tráfego" ou "Engajamento"** — eles otimizam pra clique barato e enchem de gente que não vira conversa.
- **Otimização:** se houver opção, otimizar **pra leads/conversas**, não só pra clique — a pesquisa mostra CPL ~24% menor.
- **Segmentação geo:** Fernandópolis + raio de 30 km (Votuporanga, Estrela d'Oeste etc., conforme CLAUDE.md 7.1). Geo apertada = público certo e CPM barato.
- **Público:** comece **amplo dentro da geo** (deixa o algoritmo achar), idade 25–55, sem encher de interesses. Em cidade pequena, interesse demais "sufoca" o público.
- **Criativo:** vídeo curto ou imagem com a dor + a solução em 1 frase. Frame interior (CLAUDE.md): "cê", "rancho do mês", praça, sem jargão de startup. Mercados locais só em tom neutro.
- **Mensagem pré-preenchida:** configure o texto que já vem digitado quando abre o WhatsApp — **coloque um código de campanha** aqui (ex.: *"Oi! Quero começar — vim do anúncio [META-DOR-01]"*). Isso é ouro pra atribuição (seção 7).

### 4.3. Mudança de pricing do WhatsApp (contexto)

Desde jul/2025 a Meta cobra por **mensagem entregue** por categoria, mas conversas que **vêm de anúncio CTWA têm janela gratuita de 72h** (era 24h). Ou seja: quem chega pelo anúncio pode conversar de graça por 3 dias — bom pro onboarding do bot. (Isso afeta a WhatsApp API oficial; no Z-API o modelo de custo é o do seu plano Z-API — revisar.)

---

## 5. Canal 2 — Google Ads (o papel realista dele aqui)

Google **captura demanda existente** — funciona quando alguém já procura a solução. O problema: **quase ninguém busca "bot de cupom fiscal WhatsApp"**. Então no curto prazo o Google é **fraco pra você**, e some o fato de que ele manda pra site (precisa de landing), não pra conversa.

**Onde o Google ainda pode entrar (testes pequenos):**

- **Termos de dor genéricos** (Search): "como economizar no mercado", "controlar gastos do mês", "pra onde vai meu dinheiro". Volume baixo no interior, CPC pode ser ok.
- **Marca** (defensivo): se alguém buscar "Economizei", garantir que aparece. Barato, mas volume mínimo no início.
- **Performance Max / Display:** alcança gente sem busca, mas é mais difícil de controlar com R$ baixo e tende a desperdiçar no começo.

**Tracking no Google:** como termina no WhatsApp, use **link wa.me com UTMs** no botão da landing (`...&utm_source=google&utm_medium=cpc&utm_campaign=dor`) + evento de clique no botão (Google Tag Manager) marcado como conversão. Sem isso, o Google otimiza no escuro.

**Veredito:** Google é **plano B** pro Economizei hoje. Vale um teste de R$30–40 em 3–5 palavras de dor **depois** que o Meta estiver rodando — não em paralelo dividindo os R$200.

---

## 6. "Os dois ao mesmo tempo" — o ajuste honesto

Você escolheu rodar Meta + Google juntos. Preciso ser direto, porque é dinheiro seu: **com R$200, dividir nos dois provavelmente faz os dois falharem.** A razão é técnica, não preferência —

- O Meta precisa de **~R$30–50/dia por campanha** pra sair da fase de aprendizado. R$200 ÷ 2 canais = ~R$100 cada = **abaixo do mínimo de aprendizado dos dois**. Nenhum gera dado confiável.
- A própria literatura de mídia recomenda: **com menos de R$3.000/mês, concentre em uma plataforma** e aprenda bem antes de diversificar. Fragmentar verba pequena **diminui a velocidade de aprendizado do algoritmo**.

**Como honrar seu desejo de conhecer os dois sem queimar os R$200:**

| Abordagem | Como | Quando |
|---|---|---|
| **Recomendada — sequencial** | R$200 inteiros no **Meta CTWA** agora. Quando achar seu CPL, separar os **próximos** R$100–150 pra um teste Google de dor. | Já |
| Aceitável — ponderada | ~R$160 Meta / ~R$40 Google (Google só "sentindo o terreno", sem esperar resultado). | Se quiser ver as duas telas funcionando |
| Não recomendada | R$100/R$100. | — |

Como você também disse que **aumenta o orçamento se der retorno**, o sequencial é perfeito: Meta prova o motor → você sobe a verba → aí sim abre Google como segundo canal com orçamento próprio.

---

## 7. Rastreamento e atribuição — como saber qual anúncio trouxe o usuário

Esse é o pulo do gato pro seu caso, porque a conversão acontece **dentro do WhatsApp**, fora do alcance do pixel. Três camadas, da mais simples (faça já) à mais avançada:

1. **Código de campanha na mensagem pré-preenchida (faça já, custo zero):** cada anúncio abre o WhatsApp com um texto contendo uma etiqueta — *"...vim do anúncio [META-DOR-01]"*. **O bot já detecta código no 1º contato** (o fluxo de `/convidar` no CLAUDE.md faz exatamente isso). Dá pra reaproveitar essa lógica pra ler o código do anúncio e gravar a **origem** no Supabase. Assim você sabe, por cadastro, de qual criativo veio — e cruza com quem mandou o 1º cupom (ativação real). **Esta é a atribuição que mais te serve e é praticamente de graça.**
2. **UTMs nos links wa.me / na landing (Google e Meta-via-página):** `https://wa.me/SEUNUMERO?text=...&utm_source=meta&utm_campaign=dor`. Útil quando passa por página.
3. **CTWA referral / Conversions API (avançado):** o anúncio CTWA entrega um identificador da conversa (`ctwa_clid`) e dá pra **mandar de volta pro Meta** o evento "ativou" (mandou 1º cupom) via Conversions API — aí o algoritmo otimiza pra quem realmente ativa, não só clica. Isso depende da WhatsApp API oficial / integração, então é **fase 2**, quando o volume justificar.

> Sem a camada 1, você roda no escuro. Recomendo que, **antes do 1º real**, a leitura do código de campanha no 1º contato esteja ligada (é pequeno, reaproveita o que já existe). Isso vira um pré-requisito na seção 11.

---

## 8. Estrutura de campanha pra "duplicar e otimizar" — o jeito certo em 2026

Você descreveu a tática clássica: "duplicar campanhas com pequenas alterações e ir melhorando os números". **Cuidado:** essa tática vem muito de conteúdo de dropshipping antigo e **hoje pode te prejudicar** — duplicar conjuntos que miram o mesmo público cria **sobreposição de leilão** (seus próprios anúncios competindo entre si, encarecendo tudo). A prática atual desaconselha "duplicar pra escalar na horizontal".

**O modelo certo, adaptado pro seu orçamento:**

1. **1 campanha, 1 conjunto, 2–3 criativos** testando **ângulos diferentes** (não 10 variações da mesma coisa):
   - Ângulo A — **dor**: "no fim do mês some dinheiro e você não sabe onde".
   - Ângulo B — **esperteza**: "não dá mole pro mercado, saiba o preço de verdade".
   - Ângulo C — **prova social**: print/depoimento real de alguém de Fernandópolis.
2. **Deixe rodar sem mexer** durante a fase de aprendizado (não pause/edite a cada 6h — reseta o aprendizado). Dê alguns dias e volume mínimo.
3. **Leia o vencedor** por CPL/ativação (não por curtida).
4. **Escalar = vertical, com calma:** aumentar a verba do que venceu em passos de ~20% a cada 2–3 dias. Ou **horizontal de verdade:** novo público diferente (outra cidade da região), não cópia do mesmo.
5. **Teste A/B só pela ferramenta oficial do Meta** quando quiser comparar limpo (ela divide o público pra não haver sobreposição) — é o jeito honesto de "duplicar e comparar".
6. **Mate criativo ruim** e suba um novo no lugar, mantendo o aprendizado do conjunto.

Resumo: **poucos ângulos, verba concentrada, paciência na leitura, escala em degraus.** Com R$200, teste **no máximo 3 criativos** — mais que isso, nenhum recebe dado.

---

## 9. Plano dos R$200 — passo a passo e semáforo de decisão

**Setup (antes de gastar):** página FB + conta de anúncios + WhatsApp ligado ao Business (validar Z-API); leitura de código de campanha no 1º contato ligada no bot; 2–3 criativos no frame Fernandópolis prontos.

**Execução:**

1. 1 campanha Meta, objetivo **Mensagens/Leads**, geo Fernandópolis +30km, 25–55 anos, público amplo.
2. Orçamento ~**R$35–40/dia** → os R$200 duram **~5 dias** (um ciclo de aprendizado curto, suficiente pra primeiros sinais).
3. 3 criativos (dor / esperteza / prova social), cada um com **código de campanha distinto** na mensagem pré-preenchida.
4. **Não mexer** nos primeiros 3 dias. Anotar CPM, CTR, custo por conversa, CPL e **quantos mandaram o 1º cupom**.

**Semáforo ao fim dos R$200:**

| Sinal | 🟢 Escala | 🟡 Ajusta | 🔴 Para e repensa |
|---|---|---|---|
| CPL (cadastro) | ≤ R$5 | R$5–15 | > R$15 |
| Taxa de ativação (cadastrou → 1º cupom) | ≥ 40% | 20–40% | < 20% |
| CTR do criativo | ≥ 1,5% | 0,8–1,5% | < 0,8% |
| Custo por ativação | descobrir e comparar com o valor que um usuário tem pra você | — | — |

- 🟢 nas duas primeiras linhas → **suba verba** no criativo vencedor (degraus de 20%) e/ou abra Google como 2º canal.
- 🟡 → **troque ângulo/criativo**, mantenha a verba, rode mais um ciclo.
- 🔴, especialmente **ativação < 20%** → **o problema não é o anúncio, é o produto/onboarding ou a retenção.** Pausar mídia, voltar pro orgânico/boca-a-boca de Fernandópolis e consertar o motor antes de gastar mais. (É exatamente o anti-padrão do CLAUDE.md.)

> **Quanto vale um usuário pra você (pra saber o teto do CPL):** se ~X% dos cadastros gratuitos viram Pro lá na frente, e o Pro paga R$9,90–22/mês por alguns meses, dá pra estimar quanto você pode pagar por cadastro sem prejuízo. Hoje você **não tem esse dado** (conversão Free→Pro não validada) — por isso o teste é pra **aprender**, e o teto de CPL inicial deve ser conservador. Quando tiver alguns Pro vindos de anúncio, recalcule o teto de verdade.

---

## 10. Alinhamento com o Norte e o `financial-firewall`

- **Teste de Norte:** mídia paga **não passa ciência/inteligência sobre o gasto** por si só — é distribuição, não produto. Logo, ela **serve** o Norte trazendo gente pro bot, mas **não substitui** o trabalho de fazer o bot deixar a pessoa mais esperta. Mídia sem retenção é balde furado.
- **Zero atrito:** o caminho CTWA (anúncio → WhatsApp direto) é o que mais respeita o princípio. Página só quando agrega.
- **Honestidade:** prova social real, copy honesta, nada de "5.000 clientes" inventado. Frame interior, não paulistano (CLAUDE.md 7.1).
- **Caixa (financial-firewall):** R$200 pra **aprender** o canal = sim. Escalar antes de W2 ≥ 30% no cohort = não. "Aumento se der retorno" deve significar retorno **na ativação/retenção**, não só em cliques baratos.

---

## 11. Pré-requisitos e próximos passos (checklist)

**Antes de rodar o 1º R$1 (HUMANO / setup):**
- [ ] Página do Facebook do Economizei criada e ativa.
- [ ] Conta no Meta Business + forma de pagamento.
- [ ] **Validar:** número do bot (Z-API) pode ser ligado ao Meta Business pra CTWA sem quebrar o Z-API — ou definir número/fluxo pra isso. *(ponto técnico em aberto)*
- [ ] **Bot lê código de campanha no 1º contato** e grava origem no Supabase (reaproveitar a lógica do `/convidar`). *(pequena tarefa de código — quando você pedir)*
- [ ] 2–3 criativos prontos no frame Fernandópolis (posso roteirizar com a base de `Roteiros_Campanha_Fernandopolis.md`).

**Quando você quiser sair do "só estratégia" (entrega futura):**
- [ ] Template de landing **clonável** (trocar 5 variáveis = nova página) + passo a passo de subdomínio na Vercel — a "automação de criação de página".
- [ ] Configurar a 1ª campanha Meta CTWA junto.
- [ ] Painel simples no Supabase: cadastros e ativações **por código de campanha**.

**Futuro (fase 2, com volume):**
- [ ] Conversions API mandando "ativou" de volta pro Meta (otimização por ativação real).
- [ ] Teste Google de termos de dor (orçamento próprio, não dividindo o do Meta).

---

## 12. Fontes

- Meta / WhatsApp — otimização de anúncios e mensagens: [WhatsApp Business resources](https://business.whatsapp.com/resources/resource-library/whatsapp-business-app-resources/down-funnel-optimizations-whatsapp?lang=pt_BR), [New ways for businesses to do more with messaging](https://business.whatsapp.com/blog/new-ways-for-businesses-to-do-more-with-messaging?lang=pt_BR), [Criar anúncios de clique para o WhatsApp](https://pt-br.facebook.com/business/help/447934475640650)
- Click-to-WhatsApp (guias/benchmarks): [Zenvia — CTWA 2026](https://zenvia.com/blog/como-usar-anuncios-click-to-whatsapp-no-seu-negocio/), [SocialHub — Meta Ads CBO CTWA 2026](https://www.socialhub.pro/blog/meta-ads-cbo-2026-atualizacao-click-to-whatsapp-otimizacao-conversao-pme-brasileira/), [SocialHub — CTWA serviços locais 2026](https://www.socialhub.pro/blog/meta-ads-ctwa-servicos-locais-2026-leads-whatsapp/), [AiSensy — guia CTWA](https://m.aisensy.com/blog/pt/anuncios-click-to-whatsapp-guia-completo/), [Converte Negócio — campanha negócios locais](https://convertenegocio.com.br/campanha-para-negocios-locais-meta-ads/)
- Precificação WhatsApp 2025: [goVendas](https://govendas.com/whatsapp-business-mudancas-precificacao-em-2025/), [ChatLabs](https://www.chatlabs.com.br/whatsapp-api-2025-como-ficou-o-custo-da-meta-apos-1-de-julho-e-o-impacto-na-cobranca-de-templates), [Huggy](https://blog.huggy.io/nova-precificacao-do-whatsapp/)
- Google Ads + WhatsApp (rastreamento): [Tintim](https://tintim.app/conversao-whatsapp-google-ads-como-rastrear-e-otimizar-suas-campanhas/), [Daniel Bogo — trackeamento](https://danielbogo.com.br/blog/trackeamento-whatsapp/), [SocialHub — WhatsApp + Google Ads](https://www.socialhub.pro/blog/whatsapp-business-google-ads-extensao-conversao-rastreamento/)
- Google vs Meta (orçamento pequeno): [Agência Coruja](https://agenciacoruja.com/performance/google-ads-ou-meta-ads-onde-investir/), [Babitonhela 2026](https://babitonhela.com/blog/google-ads-vs-meta-ads-investir/), [QualitySMI](https://qualitysmi.com.br/blog/google-ads-vs-meta-ads)
- Benchmarks Meta Brasil: [SuperAds — CPC Brasil](https://www.superads.ai/facebook-ads-costs/cpc-cost-per-click/brazil), [SuperAds — CPM Brasil](https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/brazil), [AdAmigo — CPM/CPC por país 2026](https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026)
- Estrutura de teste / orçamento mínimo: [Vini Ensina — Meta Ads 2026](https://viniensina.com.br/meta-ads-guia-completo-2026/), [Mirago — teste A/B](https://www.mirago.com.br/teste-ab-facebook-ads/), [Estêvão Soares — teste A/B](https://newsletter.estevaosoares.com/p/meta-ads-teste-ab-dicas-melhores-praticas)
- Landing pages / prova social: [Automarticles — guia 2025](https://automarticles.com/2025/09/11/landing-page-guia-completo-criar-converter-2025/), [Wix — estrutura](https://pt.wix.com/blog/estrutura-landing-page), [Kamus — prova social](https://kamus.com.br/landing-page/prova-social-como-aumentar-as-conversoes-da-sua-landing-page-com-depoimentos-e-cases-reais/)
- Subdomínios Vercel: [Vercel KB — múltiplos projetos](https://vercel.com/kb/guide/how-can-i-serve-multiple-projects-under-a-single-domain), [Vercel — working with domains](https://vercel.com/docs/domains/working-with-domains), [Platforms Starter Kit](https://vercel.com/templates/next.js/platforms-starter-kit)
