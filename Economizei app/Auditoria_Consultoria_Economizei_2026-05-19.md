# 🩺 Auditoria Crítica — Economizei

> **Documento de consultoria estratégica**
> Tom: brutal mas construtivo. Cada crítica vem com sugestão.
> Leitor: Gabriel agora + Gabriel daqui a 3 meses (anexo do `CLAUDE.md`).
> Data: 2026-05-19 · Escopo: skills do Claude + estrutura de empresa + fluxo de produção
> Profundidade: análise estratégica (sem mergulho no código `src/`)

---

## 0. Como ler este documento

Este documento está dividido em duas partes:

**Parte A — Consultor crítico.** Pontos identificados, classificados por **impacto × urgência**. Cada ponto tem: o que está errado, por que importa, e o que fazer. Nada é elogiado pra equilibrar — o material elogiável já está no `CLAUDE.md`.

**Parte B — Professor de administração.** Caminhos não convencionais. Coisas que você não tem nos seus documentos. Aqui o objetivo é abrir leque, não validar o que existe.

Classificação de impacto:

- 🔴 **Crítico** — pode matar o produto ou explodir custo nas próximas 6 semanas. Resolver em dias.
- 🟠 **Alto** — vai pesar na validação ou na escala. Resolver em semanas.
- 🟡 **Médio** — atrito acumulado, vai aparecer no Mês 2-3. Resolver quando der.
- 🟢 **Baixo** — higiene estratégica. Cuidar quando tiver folga.

---

## Parte A — Auditoria crítica

### A.1 — Skills do Claude (o que está instalado vs. o que você precisa)

**Diagnóstico geral:** você tem 11 skills instaladas, mas a configuração tem cara de "instalei por curiosidade", não de "essas resolvem meu trabalho". O acúmulo de skills caveman (quatro variantes!) ocupa atenção mental sem te ajudar — você não é dev fazendo PR review em produção. Falta o oposto: skills que cobrem o que de fato faz sua semana acontecer (planilha de unit economics, pesquisa qualitativa, análise de landing).

#### 🟠 A.1.1 — Você tem 4 skills "caveman" e nenhuma resolve sua dor

**O problema:** `caveman`, `caveman-commit`, `caveman-help`, `caveman-review` foram pensadas pra desenvolvedores em situação de pressão de tokens (PRs grandes, commits em série, code review). Você é fundador-solo de SaaS B2C, sua dor é **estratégia, copy e dados de pesquisa**, não compressão de mensagens. Essas 4 skills competem por slot de atenção e nunca aparecem como recomendação útil pro que você faz.

**Por que importa:** o catálogo de skills funciona como autocomplete mental. Quanto mais ruído ele tem, mais difícil você lembrar o que serve pro seu trabalho real.

**O que fazer:**
1. Manter no máximo `caveman` (a versão base) — você usa Claude pra escrever muito copy e às vezes precisar de output compacto pode ajudar.
2. Desinstalar `caveman-commit`, `caveman-review` e `caveman-help`. Os 3 são pra fluxo de desenvolvedor; o Claude Code já tem `/commit` e `/review` nativos.

#### 🟠 A.1.2 — Faltam 3 skills que resolveriam 80% do seu trabalho semanal

**O problema:** nada do que você documentou nas suas decisões mais importantes (precificação, custo por usuário, runway, retenção W2) está com ferramenta dedicada. Você está fazendo tudo no improviso conversacional.

**Skills que te faltam (em ordem de impacto):**

1. **Skill de unit economics / financial model.** Não existe pronta no catálogo, mas você pode criar uma `.skill` própria. Conteúdo: prompt que carrega um template de planilha xlsx com colunas (custo Gemini/cupom, custo Z-API/mês, ARPU projetado por tier, breakeven em N usuários, runway em meses dado capital atual). Toda vez que invocar, abre a planilha pronta pra você atualizar com os números reais. **Esta é a skill mais importante que falta.**

2. **Skill de análise de pesquisa qualitativa.** Você fez 30 respostas qualitativas e analisou no improviso. Em 3 meses você vai querer rodar outra rodada (50, 100 respostas) — sem skill, vai começar do zero. Crie uma que recebe CSV de pesquisa, gera cluster de objeções, identifica linguagem emocional repetida e exporta resumo executivo em md.

3. **Skill de auditoria de landing / copy review.** A landing está deployada em `economizei.space`, você revisou copy várias vezes manualmente em 2026-05-15. Uma skill que faz: pega URL → extrai copy → analisa contra checklist de princípios (hierarquia visual, framing cultural BR, CTAs, prova social, objeções endereçadas) → devolve relatório.

**Por que importa:** sem skill, toda sessão você reinstrui o Claude do zero sobre como você quer pensar sobre esses temas. Você está pagando o custo de re-explicar contexto em vez de capitalizar nele.

**O que fazer:**
- Próxima sessão de 1h: criar a skill de unit economics. Skill ≠ documento mágico, é um `.skill` (zip de uma pasta com `SKILL.md` + arquivo de template). Você pode pedir pro Claude criar pra você em ~20 min.
- Depois: copy-review.
- Depois: análise de pesquisa.

#### 🟡 A.1.3 — `context-guardian` está instalada mas sem evidência de uso

**O problema:** o `CLAUDE.md` já tem ~35 KB. Em conversas longas isso queima contexto rápido. O `context-guardian` foi feito exatamente pra isso — avisar quando você está chegando no limite e gerar resumo .md pra continuar. Não tem evidência no `CLAUDE.md` de que você tenha sido alertado uma única vez.

**Por que importa:** a próxima vez que você abrir uma sessão pesada de planejamento, o Claude pode começar a "esquecer" decisões antigas e ressugerir bobeira já decidida. Você vai gastar tempo corrigindo ele.

**O que fazer:**
- Início de cada sessão: peça explicitamente "ative o context-guardian e me avise em 50% e 80% de contexto". Ele só dispara proativo se você nutrir o gatilho.
- Considere quebrar o `CLAUDE.md` em 2 arquivos: `CLAUDE_core.md` (estratégia, princípios, personas, pricing — o que muda raro) + `CLAUDE_historico.md` (decisões e comandos — só anexo). No início de sessão, manda o Claude ler só o `core`.

#### 🟡 A.1.4 — `setup-cowork` está ocupando espaço e já foi usada

**O problema:** essa skill é onboarding inicial do Cowork. Você já configurou. Não vai usar de novo. Mas continua aparecendo em listas e sugestões.

**O que fazer:** desinstalar. Cinco segundos.

#### 🟢 A.1.5 — Skills de output (docx, xlsx, pptx, pdf) você tem mas usa pouco

**O problema:** você tem o pptx (`economizei-blueprint.pptx` no `.claude/`) e tem usado HTML como saída de roadmap (Roadmap_6_Semanas.html). Mas não vejo:
- Nenhum xlsx (toda análise quantitativa está embutida em md como tabela).
- Nenhum docx (Termos de Serviço e Privacy Policy ainda estão em HTML cru no `docs/`).

**Por que importa:** a tabela de unit economics em md vira lixo difícil de atualizar. Um termos-de-serviço em HTML não imprime bonito pra eventual notificação legal. O xlsx e docx existem pra esses casos exatos.

**O que fazer:**
- Próxima vez que for ajustar precificação: gere `Economizei_Unit_Economics.xlsx`, não tabela md.
- Termos + Privacy: gere `.docx` (você precisa em arquivo "imprimível"; tem cliente, ANPD ou advogado que pode pedir).

---

### A.2 — Estrutura de empresa e fluxo de produção

#### 🔴 A.2.1 — Sua "estrutura de 7 áreas" é teatro corporativo

**O problema:** a seção 5 do `CLAUDE.md` lista 7 áreas (Produto, Marketing, Vendas/Growth, Customer Success, Financeiro, Jurídico, Operações) com pilares e rotinas. Você é 1 pessoa com 1h/dia (≈42h em 6 semanas). Isso é estrutura de empresa de 30 funcionários, não de fundador-solo pré-receita. Estimo que ~85% dos itens dessa seção nunca foi executado nem uma vez.

**Por que importa:** estrutura que não é executada vira ruído. Pior: ela cria a falsa sensação de que a empresa está "coberta" porque tem coluna no documento, quando na verdade nenhuma das rotinas (responder tickets em 24h, deploy quinzenal, NPS trimestral, revisão de marca trimestral, log diário de finanças) está rodando. Você está se enganando com uma planilha mental.

**O que fazer:**
- Cortar pra **3 áreas reais** durante o Beta: **Produto** (o bot rodando), **Distribuição** (landing + conteúdo + indicação), **Caixa** (custos do Gemini/Z-API + tempo seu). Tudo mais é distração.
- Adicionar uma nota explícita no `CLAUDE.md`: "Áreas suspensas até depois do Beta: Customer Success, Jurídico complexo, Operações documentadas, Vendas estruturadas."
- Pra cada uma das 3 áreas reais, escrever **1 indicador único** que você consegue olhar em <2 min/semana. Sem dashboard. Não inventar.

#### 🔴 A.2.2 — Você tem zero accountability externa

**O problema:** todas as decisões nos últimos 12 dias têm exatamente 2 inputs: você + o Claude que você instrutui. Não há mentor, sócio, peer review, advisor, investidor-anjo, ou nem grupo de outros fundadores. O Claude tende a validar quem o instrui — quando você escreve "decidi X porque Y", ele raramente responde "Y está errado". Você está construindo uma câmara de eco bem articulada.

**Por que importa:** as duas maiores apostas do projeto (pricing de R$9,90 indeterminado, Beta gratuito por tempo indeterminado) são especificamente o tipo de aposta onde câmara de eco mata startup. Você não vai descobrir que errou até queimar caixa.

**O que fazer (em ordem de menor pra maior atrito):**
1. **Esta semana:** entrar em 2-3 grupos de fundadores brasileiros B2C (Aceleradora Nordeste, Founders Club BR, comunidades em Discord/Slack tipo "Brasil at Y Combinator"). Não pra vender — pra ter alguém pra mostrar a landing e dizer "tá ruim porque...".
2. **Próximas 2 semanas:** marcar 30 min com 1 fundador SaaS que já passou por validação B/C. LinkedIn frio, oferece tomar café/coffee chat. 8 em 10 aceitam se a mensagem for bem escrita.
3. **Mês 2:** considerar um advisor de marketing/growth com equity simbólica (0,5–1%). Não pra trabalhar — pra ser obrigação de prestar contas mensal.

#### 🔴 A.2.3 — Você não tem cap de custo do Gemini

**O problema:** o `CLAUDE.md` decide que o limite de 10 cupons no Free é "técnico, pelo custo do Gemini". Mas não há em parte alguma:
- Quanto custa **exatamente** uma chamada do Gemini Vision pra cupom (R$ ou US$ por imagem).
- Custo total mensal estimado em 3 cenários: 30 usuários, 100 usuários, 500 usuários.
- **Cap de orçamento mensal** ou alerta no Google Cloud Console.
- O que acontece quando alguém abusa (mesmo com 10/mês, 1000 contas = 10k chamadas).

**Por que importa:** se você lançar o Beta gratuito e cair num grupo de WhatsApp com 800 pessoas curiosas, sua conta no Google explode em 1 noite. Sem cap, sem alerta, sem rate limit por IP/número, você acorda com R$2.000 no cartão.

**O que fazer (em ordem de urgência):**
1. **Hoje:** abrir Google Cloud Console → Billing → Budgets & alerts. Configurar alerta em R$50, R$150 e R$300/mês. Configurar **billing cap automático** se possível.
2. **Hoje:** calcular custo real médio. Pegue o número de chamadas Gemini do último mês × preço unitário publicado pela Google. Anote no `CLAUDE.md`.
3. **Esta semana:** preencher a planilha de unit economics (skill que sugeri em A.1.2). Calcular: custo Gemini/usuário ativo × meta de Beta de 100 usuários = quanto sai do seu bolso/mês durante Beta.
4. **Antes do Beta Soft (Semana 5):** adicionar rate limit técnico no `src/index.js` por número (ex: máximo 5 cupons por usuário em 1 hora). Você já planejou isso na Semana 1, mas verificar se foi feito.

#### 🟠 A.2.4 — Sua "killer feature paga" tem defeito conceitual sério

**O problema:** o `CLAUDE.md` define que "Comparativo de preços entre mercados" é a killer feature do plano Individual (R$9,90). Mas:
- O bot só conhece os cupons que **o próprio usuário** mandou.
- Um usuário novo que paga R$9,90 abre o comparativo e vê só os mercados onde **ele mesmo** foi.
- O comparativo só é útil depois de N meses de uso ativo, ou se você cruzar com dados de **outros usuários** (que exige opt-in, anonimização, e volume crítico).
- Você não tem ainda um plano técnico pra fazer comparação cross-user com privacidade aceitável.

**Por que importa:** se a killer feature paga não funciona pra novo usuário pagante, a conversão Free→Pago vai dar 2-4% em vez de 8-12%. Você descobre isso na Semana 6, quando já investiu nas 4 semanas de comunicação dela.

**O que fazer:**
1. **Antes de comunicar a feature na landing:** decidir como o comparativo funciona pra novo usuário. Opções:
   - Opção A — Comparativo cross-user com dados anonimizados (precisa de massa crítica + LGPD bem encaixada).
   - Opção B — Comparativo "do seu histórico" e marketing é honesto que ela fica útil após 2-3 meses de uso.
   - Opção C — Comparativo com dados públicos do governo (Procon, NFCe estados que publicam) — bem mais complexo mas pode ser diferencial.
2. **Se Opção A:** começar a coletar opt-in desde já no onboarding ("aceito contribuir anonimamente com preços pra ajudar todo mundo a economizar?"). Sem esse opt-in retroativo, em 6 meses você não tem dados pra ligar a feature.
3. **Reescrever a copy do plano Individual na landing:** trocar "Comparativo entre mercados" por algo verificável (ex: "Análise do seu padrão" ou "Comparativo conforme você usa, melhora com o tempo").

#### 🟠 A.2.5 — Você diz que vai medir W2 retention mas não sabe como vai

**O problema:** a decisão de 2026-05-08 estabelece que paywall só ativa se W2 retention for ≥ 40%. Mas:
- O `CLAUDE.md` não documenta **como** essa métrica é calculada (W2 = mandou pelo menos 1 cupom na semana 2 após primeiro cupom? Ou W2 = ainda estava no banco semana 2?).
- Não tem query SQL pronta.
- Não tem dashboard.
- Não tem cohort definida.
- A Semana 5 do roadmap diz "coletar NPS" mas não diz "rodar query de W2".

**Por que importa:** se você não definir o cálculo agora, vai chegar na Semana 6 com 30 usuários e dois cenários: (a) você vai inventar a métrica retroativamente (péssimo, viés de confirmação) ou (b) vai adiar a decisão de paywall pra Mês 3 sem dado.

**O que fazer (próxima sessão de 30 min):**
1. Escreva no `CLAUDE.md`, **agora**, a definição operacional: *"W2 = % de usuários que mandaram cupom na cohort_semana_N+1, dentre os que mandaram cupom na cohort_semana_N"*. (Ou outra fórmula — mas definida.)
2. Peça ao Claude pra escrever a query SQL no Supabase que retorna W2 por cohort semanal.
3. Salve a query num arquivo `analytics/w2_query.sql` no repo.
4. Decida em qual dia/semana você roda essa query e onde anota o resultado.

#### 🟠 A.2.6 — Seu "Beta Fundador" virou um cheque em branco

**O problema:** você decidiu (2026-05-15) remover a promessa de "preço travado vitalício", mas manteve "3 meses grátis quando o Pro chegar". Quanto tempo é "quando o Pro chegar"? Não está definido. Tecnicamente, você acabou de prometer 3 meses grátis pra todo mundo que entrar no Beta, mesmo que demore 18 meses pra ativar o pago. E o custo do Gemini desses 18 meses sai do seu bolso.

**Por que importa:** sem deadline, o "Beta" vira o plano grátis permanente da casa. Quem entra agora pode mandar 10 cupons/mês × 18 meses = 180 cupons no seu custo, depois ganhar mais 3 meses grátis (~30 cupons). Você está prometendo subsidiar 210 cupons por usuário antes de ver R$1.

**O que fazer:**
1. **Definir prazo do Beta Fundador no `CLAUDE.md` hoje:** "Beta Fundador é o status de quem entrou até a data X (sugiro 31/08/2026). Depois disso, novas contas entram como Free padrão sem benefício futuro."
2. **Definir prazo dos 3 meses grátis:** "Os 3 meses grátis do Individual são contados a partir da data em que o paywall for ativado, e expiram automaticamente."
3. **Comunicar isso na landing**: "Beta Fundador termina em 31/08" cria urgência real e protege seu CAC.

#### 🟡 A.2.7 — Seu roadmap macro pós-Semana 6 é wishlist, não plano

**O problema:** a seção 6 do `CLAUDE.md` tem Mês 1 ("abrir CNPJ"), Mês 2 ("primeiros usuários"), Mês 3 ("monetização"), Mês 4+ ("escala"). Mas:
- Nenhum item tem data exata.
- Nenhum tem dependência mapeada (ex: abrir CNPJ bloqueia migração Meta Cloud → bloqueia escala).
- "Lançar plano pago" no Mês 3 sem critério de entrada (pode ser dia 1 do Mês 3 ou dia 28).
- "Meta 100 usuários" no Mês 2 sem rota de aquisição clara.

**Por que importa:** roadmap-wishlist gera ansiedade ("nossa, no Mês 3 tem que estar com pago e LTV/CAC") mas não gera ação. Você vai chegar no Mês 2 sem nenhuma decisão automática a tomar.

**O que fazer:**
- Converter os 4 itens em **critérios de saída** das fases anteriores. Exemplo:
  - "Saio da fase de Beta para fase de Monetização **quando**: W2 ≥ 35% **E** ≥ 50 usuários ativos **E** ≥ 10 NPS coletado **E** CNPJ aprovado."
  - "Saio da fase de Monetização para fase de Escala **quando**: ≥ 10 pagantes pagaram 2 meses consecutivos **E** LTV/CAC estimado ≥ 2."

#### 🟡 A.2.8 — A Semana 4 é 17% do orçamento total das 6 semanas, sem buffer

**O problema:** o `Economizei_Plano_Semana_4.md` documenta 7h30 de trabalho numa semana onde você tem ~7h disponíveis (1h/dia × 7). Margem zero. Se uma criança ficar doente, se o Railway cair, se o Gemini mudar API, você passa pra Semana 5 com Semana 4 incompleta.

**Por que importa:** ao chegar lá com semana incompleta, você vai (a) cortar testes ou (b) atrasar o Beta Soft. Ambos pioram a validação.

**O que fazer:**
- **Decidir agora qual task da Semana 4 é cortável.** O próprio plano sugere que o scheduler pode virar GitHub Actions externo (cortar 1h30). O `/limite` pode ser feature de Semana 5 (cortar 1h). Já há flexibilidade — mas você precisa decidir **antes** de bater na parede.
- **Inserir 1h30 de buffer fixo** em cada semana do roadmap. Buffer significa "se nada quebrar, eu jogo essa hora em conteúdo extra; se quebrar, eu uso pra recuperar."

#### 🟡 A.2.9 — Sua memória institucional está acoplada num arquivo só

**O problema:** o `CLAUDE.md` mistura num arquivo: identidade da empresa, decisões cronológicas, pesquisa, comandos seus, roadmap macro, áreas teatrais, e código stack. Mais de 35 KB. Toda sessão você está mandando todo esse contexto, mesmo quando vai trabalhar em coisa pontual.

**Por que importa:** custo de contexto, lentidão pra encontrar info, e risco de o Claude "esquecer" do início quando vai pro fim em conversas longas.

**O que fazer:**
- Dividir em 3 arquivos versionados juntos:
  - `CLAUDE.md` — apenas: identidade, princípios, persona, pricing atual, stack atual, áreas reais. ~5 KB. Lido em toda sessão.
  - `DECISOES.md` — histórico cronológico de decisões + comandos seus. Carregado só quando relevante.
  - `PESQUISA.md` — análise da pesquisa de 30 respostas + futuras rodadas. Carregado só pra revisão de copy/personas.
- O Claude consegue te ajudar a fazer essa quebra em ~15 min.

#### 🟢 A.2.10 — Não há indicador de "saúde do código" / produção

**O problema:** o bot está em produção (Z-API webhook ativo), processando cupons reais. Mas no `CLAUDE.md` não tem:
- Monitoramento de uptime.
- Alerta se webhook do Z-API parar de chegar.
- Backup automático do Supabase.
- Logs centralizados ou retidos.
- Plano de "o que fazer se Z-API banir hoje".

**Por que importa:** quando algo der errado em produção (não se — quando), você descobre por reclamação de usuário no WhatsApp. Em pré-revenue, isso até passa. Em mês 3 com 100 usuários, isso erode confiança violentamente.

**O que fazer (próximos 30 min, custo zero):**
- UptimeRobot grátis monitorando `/health`. Alerta por email se cair.
- Supabase já faz backup automático, mas configure retenção e teste 1× restaurar.
- Configurar log de erro do Express pra Better Stack ou Logflare (planos grátis).

---

### A.3 — Fluxo de produção (como você usa Claude + Cowork)

#### 🟠 A.3.1 — Seu fluxo é "uma sessão massiva, decide tudo"

**O problema:** olhando o histórico de decisões (2026-05-08, 2026-05-15) você opera por sessões longas e densas onde toma 10+ decisões de uma vez. Isso explica por que o `CLAUDE.md` é tão rico. Mas:
- Decisões tomadas em sequência sob fadiga não são todas tomadas com mesma qualidade.
- Você está "cobrando" do futuro-você implementar tudo, mas o futuro-você só tem 1h/dia.

**Por que importa:** o gap entre **quanto você decide** e **quanto você executa** está crescendo. Em 12 dias você acumulou 19 decisões registradas. Em 1h/dia, quantas dessas decisões foram realmente implementadas no produto ou na landing? (Olhando o repo, talvez 60-70%.)

**O que fazer:**
- Adotar uma regra simples: **não decide se não executa em ≤ 7 dias**. Decisões que vão demorar mais que isso pra virar implementação não são decisões, são preferências. Marcar como "preferência pendente" no `CLAUDE.md` separadamente.
- Toda sexta-feira: 15 min revisando "quais decisões dessa semana viraram código/copy/conteúdo? quais ficaram só no documento?".

#### 🟠 A.3.2 — Você não usa subagentes / Task delegation

**O problema:** olhando o `Plano_Semana_4.md`, todas as 5 tasks dependem de você instruir o Claude Code passo a passo. Você está sendo o "engenheiro de prompt" de cada uma. Mas Cowork tem Agents (Plan, Explore, claude-code-guide) que poderiam fazer parte do trabalho em paralelo.

**Por que importa:** com 1h/dia, todo minuto que você passa narrando contexto pra cada task é minuto que não vai pra distribuição/copy/conteúdo (a parte que ninguém mais faz por você).

**O que fazer:**
- Próxima task técnica: tente delegar pra um Agent com prompt curto ("usando o Plano_Semana_4 como spec, implemente a Task 2 de A a Z e me devolve diff"). Você vira reviewer, não engenheiro de prompt.
- Pra pesquisa/copy: delegue ao Explore agent ("vasculha o `CLAUDE.md` + análise de pesquisa e me devolve as 3 contradições internas").

#### 🟡 A.3.3 — Você não tem ritual de fechamento de semana

**O problema:** no fim de cada semana do roadmap, não há um momento agendado de "retro + métricas + ajuste". O `Plano_Semana_4` tem um checklist de fechamento, mas é a primeira vez que você documenta isso (Semana 4 de 6). Provavelmente vai esquecer de fazer.

**O que fazer:**
- **Sexta-feira, 30 min, todo final de semana:**
  1. Olhar 3 indicadores das 3 áreas (Produto, Distribuição, Caixa).
  2. Atualizar `DECISOES.md` com o que ficou pendente.
  3. Reescrever em 1 linha qual é o gargalo da próxima semana.
- Pode virar uma skill: "Retro_Semanal" que carrega checklist + gera um snapshot semanal.

#### 🟢 A.3.4 — Você não documenta erros / o que não deu certo

**O problema:** a seção 8 "Aprendizados & Retrospectivas" do `CLAUDE.md` tem só sucessos da pesquisa de 2026-05. Não tem nenhum "isso eu tentei e foi ruim". Em pré-launch isso é normal, mas vira hábito ruim — você só vai documentar wins e o futuro-você vai achar que tudo funcionou.

**O que fazer:**
- Toda semana, registrar 1 "experimento que deu errado / hipótese que se mostrou furada". Mesmo pequeno. Treina o músculo da honestidade institucional.

---

### A.4 — Resumo executivo da Parte A

**Top 5 ações urgentes (faz em ≤ 7 dias):**

1. 🔴 **Configurar alertas de custo no Google Cloud** + escrever custo real por cupom no `CLAUDE.md`. (30 min)
2. 🔴 **Definir prazo do Beta Fundador** (data limite) + atualizar landing. (15 min)
3. 🔴 **Decidir Opção A/B/C** do comparativo de mercados e ajustar copy do plano Individual. (1h)
4. 🟠 **Definir fórmula operacional de W2** + escrever query SQL. (45 min)
5. 🟠 **Criar skill de unit economics** + popular a primeira versão do xlsx. (1h)

**Top 5 ações de curto prazo (próximas 4 semanas):**

6. Cortar áreas "teatrais" do `CLAUDE.md` pra 3 áreas reais.
7. Entrar em 2-3 grupos de fundadores BR + agendar 1 coffee chat com fundador SaaS B/C.
8. UptimeRobot + alerta de Z-API parada. (10 min)
9. Quebrar `CLAUDE.md` em 3 arquivos versionados juntos. (30 min)
10. Decidir critérios de saída das fases macro (Beta → Monetização → Escala).

---

## Parte B — Professor de administração: 12 caminhos fora da caixa

> *Aqui o objetivo é abrir leque. Nem todos são pra agora — mas você não tem nenhum desses no `CLAUDE.md`, e pelo menos 3 podem mudar a trajetória do produto.*

### B.1 — Substituir Gemini Vision por leitura de QR code NFCe

**O insight:** todo cupom fiscal brasileiro emitido depois de 2018 (NFCe) tem um QR code que aponta pra uma URL pública da SEFAZ do estado (SP, RJ, MG, PR, RS pelo menos). Essa URL retorna o XML estruturado da nota — loja, CNPJ, itens, valores — sem OCR, sem IA, sem custo por chamada.

**Por que isso muda tudo:**
- Custo por cupom cai de ~$0.005 (Gemini Vision) pra ~zero (request HTTP).
- Precisão sobe de ~90% (OCR) pra 100% (dado estruturado oficial).
- Você consegue ler **promoções aplicadas, impostos, NCM, código de barras** — coisas que o Gemini erra.
- Diferencial técnico real vs concorrente.

**O catch:** nem todo estado publica NFCe online (alguns exigem captcha). Estados com NFCe pública: SP, MG, RS, PR. Estados problemáticos: BA, PE. Você pode tratar QR como caminho principal e Gemini como fallback. **Esse é provavelmente o maior ganho técnico-econômico disponível.**

**Próximo passo:** numa sessão de 1h, escreva um script que dado QR code de NFCe SP, retorna XML parseado. Se funcionar, vira a Semana 7 inteira de roadmap.

### B.2 — Vender pra contadores e escritórios contábeis (B2B oculto)

**O insight:** seu produto pra usuário final é "controle de gastos". Mas pra um contador que atende 20 MEIs/pequenas empresas, o **mesmo bot** vira "meus clientes mandam cupom no WhatsApp e eu recebo dashboard agregado". B2B onde 1 contador = 20-50 endpoints, ticket de R$200-500/mês.

**Por que importa:** público B/C cancela em massa. Contador paga em dia, indica colega, renova anual. LTV 10× maior. CAC pode ser zero (1 visita a um sindicato de contadores em SP, 30 leads).

**Catch:** muda posicionamento. Considera B2B em paralelo, não em vez de. Beta atual valida B2C, mas você pode rodar 5 entrevistas com contadores em paralelo e validar B2B sem custo.

### B.3 — Parceria com cashback (Méliuz, PicPay, Cuponomia)

**O insight:** apps de cashback já têm 10M+ usuários B/C e dão dinheiro pra eles. Mas eles só "viram" 1 dado por compra (valor total). Se você der pra eles **item por item**, eles podem dar cashback condicional ("R$2 de volta se você comprar X marca de café").

**Modelo possível:** você vira a "infra de leitura de cupom" para cashback. Eles pagam B2B (ou licenciam), você consegue distribuição via base deles, usuário final usa de graça. Você nunca cobra usuário final.

**Catch:** depende de fechar parceria com 1 player grande, processo demorado. Mas vale 1 email frio pra cada um.

### B.4 — Pré-venda paga (waitlist com R$5)

**O insight:** Kickstarter mostrou que pedir R$5 pra entrar na waitlist filtra os sérios e dá caixa antes de soltar o produto. Pode ser "R$5 entra na waitlist, vira crédito de R$10 quando o pago abrir".

**Por que importa:** você descobre **agora** quem realmente paga, sem precisar lançar o paywall. Os R$5 não fazem diferença financeira, mas o **gesto de pagar** filtra os 13% que disseram "pagaria com convicção" dos 45% que disseram "não pagaria". Pesquisa de validação real, não declarada.

**Catch:** pode reduzir cadastros gerais. Combinar com tier gratuito padrão (entrada gratuita) e pré-venda paga como opção VIP.

### B.5 — Reframe de posicionamento: "assistente de compras", não "controle de gastos"

**O insight:** a pesquisa mostrou que **"controle financeiro"** é palavra que carrega vergonha em B/C ("me senti irresponsável"). É o exato oposto do framing "ser esperto". Você pegou parte (a parte do "esperto") mas manteve parte do framing antigo ("controle de gastos") na copy de pricing e onboarding.

**O reframe completo:** o Economizei não controla seus gastos. Ele **sabe quanto custa o que você compra**. Você fica esperto sabendo. Diferença sutil mas importante:
- "Controlar gastos" = sou culpado, preciso de disciplina.
- "Saber o que custa" = eu mando, eu sou esperto.

**Próximo passo:** rodar A/B test entre as duas semânticas em landing.

### B.6 — Conteúdo viral primeiro, app depois

**O insight:** a pesquisa diz que público B/C confia em conteúdo de TikTok de "sou esperto, descobri X". Você está montando landing e bot **antes** de ter conteúdo. Considere inverter: monta perfil de TikTok como "@economizei_dicas", posta 30 dias seguidos de "como o mercado X esconde aumento de preço Y", **só depois** divulga o bot como "ferramenta que faz isso por você".

**Por que importa:** custo de aquisição via tráfego pago em B/C é R$8-15 por instalação. Via conteúdo orgânico viral, pode ser zero. E você constrói marca, não só funil.

**Catch:** exige 3-5h/semana de criação de conteúdo. Não cabe em 1h/dia atual. Pode terceirizar a edição (R$30/vídeo, freelancer no GetNinjas) e você só grava o roteiro.

### B.7 — Microtransação em vez de assinatura (pague-por-uso)

**O insight:** público B/C tem aversão a assinatura mensal recorrente. Mesmos que pagam R$15 no Mercado Livre Premium acham "pra que isso" no Economizei. **Mas** todo mundo paga frete de R$5,99 sem pensar.

**Modelo:** em vez de "R$9,90/mês ilimitado", testar "R$2,90 = pacote de 30 cupons extra". Sem mensalidade, sem cancelamento, sem fricção. Pagamento via PIX. Quem usa muito, gasta naturalmente mais. Quem usa pouco, fica grátis.

**Por que pode funcionar:** mata 2 objeções de uma vez (preço + comprometimento). Quem mandou 1× já provou intenção.

**Catch:** churn não existe (não tem assinatura), mas LTV é volátil. Modelo financeiro fica diferente.

### B.8 — White-label / parceria com banco digital ou conta popular

**O insight:** Nubank, Inter, C6, PicPay, Caixa Tem — todos têm milhões de clientes B/C e **querem engajamento financeiro**. O Economizei dentro do app deles ("escaneie seu cupom") seria feature de retenção pra eles e canal de distribuição massivo pra você.

**Modelo:** API + white-label. Você não cobra usuário, banco paga taxa por usuário ativo.

**Catch:** ciclo de vendas B2B-bank é longo (6-12 meses). Mas dá pra começar mandando email frio pro time de "personal finance" do Nubank/Inter agora, sem custo.

### B.9 — Coleção de "dados públicos de preços" como ativo

**O insight:** se você acumular 10 mil cupons de SP por 6 meses, você passa a ter **a melhor base privada de preços reais de mercado de SP**. Esse dado vale dinheiro pra:
- Fintechs (modelos de inflação real).
- Imprensa (jornalismo de dados sobre alta de preços).
- Procon (parceria institucional, brand boost gigante).
- Pesquisadores acadêmicos (USP, FGV).

**Modelo:** dados anonimizados (LGPD ok) como produto B2B paralelo. O bot vira tanto produto B2C quanto coleta de dados. Receita dupla.

### B.10 — Skill "Economizei" pra outros agents (Claude/Cowork/ChatGPT)

**O insight:** Cowork e ChatGPT são usados por audiência tech (TAM diferente da sua atual). Se você criar uma `.skill` pra Claude que permite "analise meus gastos do mês usando Economizei", você ganha distribuição via plataforma + selo de produto sério.

**Catch:** TAM tech é menor que B/C, mas é canal extra zero-CAC.

### B.11 — Foco em "preço por grama/litro" vs "preço final"

**O insight:** a pesquisa mostrou que mercados enganam B/C principalmente em **preço por unidade** (pacote de 900g a R$10 parece mais barato que 1kg a R$11, mas custa mais por grama). Toda copy do bot está focada em "preço total" e "alerta de gasto". Pivotar pra "alerta de preço por unidade enganoso" pode ser feature killer real.

**Por que importa:** alinha exatamente com framing "ser esperto" e "não dar mole". É **muito** difícil pro mercado se defender ("nós explicamos no rótulo!" — sim, em fonte 8).

### B.12 — Vender como ferramenta "anti-inflação familiar" (timing macroeconômico)

**O insight:** Brasil 2026 tem inflação alimentar persistente como tema público. O Economizei pode ser posicionado não como "app pessoal" mas como **resposta cívica à inflação**. Headline tipo: "Em 2026, mercado subiu 12%. Seu gasto subiu quanto?".

**Por que importa:** timing macroeconômico transforma feature em pauta. Imprensa cobre, viraliza orgânico. CAC zero.

---

## Conclusão — leitura pra você daqui a 3 meses

Se você abrir este documento em 3 meses, leia esta página final primeiro.

**O que está bom:**
- Você documenta decisões. A maioria dos fundadores solos não. Isso vai te salvar 1000h de re-decidir.
- A pesquisa de 30 respostas é diamante. Use ela pra brigar com qualquer decisão futura.
- O princípio "bom, barato e útil — grátis funciona de verdade" é compass moral defensável. Mantém.

**O risco maior que você ainda não viu (em 2026-05-19):**
- Você é 1 pessoa decidindo tudo, com 1 LLM como companhia. Em 3 meses isso vai ter virado uma câmara de eco bem articulada que valida tudo que você decide. Quando ler isso aqui no futuro, **pergunta a 1 pessoa real** se as suas últimas 5 decisões parecem boas. Não pro Claude. Pessoa.

**O experimento de maior ROI que você não está rodando:**
- NFCe via QR code (B.1) muda economics. Sério, faz o teste antes de qualquer outra coisa.

**A pergunta que você não está se fazendo:**
- "Se o Economizei nunca virar negócio rentável, o que **eu** ganho fazendo isso por 12 meses?" — se a resposta for só "eu queria muito que desse certo", você tem risco emocional. Se for "eu vou aprender X e Y, e mesmo que feche eu saio melhor", você tem cobertura psicológica. Documenta isso.

— *Documento gerado em 2026-05-19. Próxima revisão sugerida: 2026-07-01 (após Semana 6 do roadmap).*
