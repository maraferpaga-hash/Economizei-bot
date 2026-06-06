# 📦 Arquivo Histórico — Conteúdo removido do CLAUDE.md em 2026-06-04

> Este arquivo guarda **conteúdo obsoleto, revogado ou superado** que foi removido do `CLAUDE.md`
> em 2026-06-04 para enxugar a memória institucional sem perder histórico.
>
> **Critério de arquivamento:** decisões revogadas, propostas estruturais não materializadas, sessões de comando antigas cujo conteúdo já foi absorvido por decisões posteriores ou pelo sistema de skills.
>
> **Como usar:** consulta histórica. Nada aqui rege comportamento atual.

---

## 1. Bloco "Estrutura modular planejada" — superado pelo sistema de skills

> **Removido da seção 1 do CLAUDE.md.**
> Esta proposta de dividir o CLAUDE.md em 5 arquivos (DECISOES.md, PESQUISA.md, CALENDARIO.md, etc.) foi feita em 2026-05-19 mas **nunca foi materializada fisicamente**. Em 2026-06-04 o sistema de skills + `PROJECT_INSTRUCTIONS.md` resolveu o mesmo problema de outra forma: modularização operacional via 14 skills em `.claude/skills/` + instruções de projeto que carregam em toda sessão.

Conteúdo original:

> **📂 Estrutura modular planejada (em transição):**
> A partir de 2026-05-19 a memória institucional está sendo dividida em 3 arquivos versionados juntos:
> - `CLAUDE.md` (este arquivo) — estratégia, princípios, persona, pricing atual, stack atual, áreas reais. Lido em toda sessão.
> - `Economizei app/DECISOES.md` — histórico cronológico de decisões + comandos seus. Carregado só quando relevante.
> - `Economizei app/PESQUISA.md` — análise da pesquisa de 30 respostas + futuras rodadas. Carregado só pra revisão de copy/personas.
> - `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria crítica externa, pontos abertos.
> - `CALENDARIO.md` — metas diárias, semanais e mensais + checkpoints de progresso por gatilho. Carregado quando for revisar rotinas ou progresso.
> - `PROMPT_CALENDARIO.md` — prompt reutilizável para Claude Opus: limpa estimativas de tempo do CLAUDE.md e regera/atualiza o CALENDARIO.md.
>
> Durante a transição, o conteúdo ainda está consolidado aqui — a quebra física dos arquivos é uma decisão pendente (ver discussão pareada).

---

## 2. Decisões revogadas (removidas da seção 7 / 8 do CLAUDE.md)

### 2.1. Paywall adiado — sobrescrita em 2026-05-22

> | 2026-05-08 | **NÃO ativar paywall nas 6 semanas iniciais** | Pesquisa: só 13–16% pagaria com convicção; preço virou objeção #1. Validar retenção e WTP antes |

**Status:** sobrescrita pela decisão de 2026-05-22 ("Paywall ativo desde o lançamento via PIX manual"). A análise alternativa em `Economizei app/Projecao_Cenario_Paywall_Dia_1.md` mostrou que paywall via PIX manual captura ~80% do benefício a custo ~R$130.

### 2.2. Tag `beta_fundador` com benefícios — REVOGADA em 2026-05-19

> | 2026-05-08 | **Tag `beta_fundador` desde dia 1** | Original: "Quem entra no Beta ganha 3 meses Individual + preço travado vitalício". |

**Status:** revogada totalmente em 2026-05-19. Tag mantida como marcador técnico de cohort. Sem benefício comercial prometido. Razão: sem unit economics validado, subsidiar custo de Gemini × N usuários × prazo indeterminado vira compromisso financeiro pesado demais.

### 2.3. Promessa "R$ 9,90 travado pra sempre" — REVOGADA em 2026-05-19

> | 2026-05-15 | **Removida promessa "R$ 9,90 travado pra sempre"; mantém "3 meses grátis"** | Em 15/05 a promessa de preço vitalício foi removida mas mantida a promessa de "3 meses grátis quando o Pro chegar". |

**Status:** em 19/05 a promessa de "3 meses grátis" também foi removida. Comunicação do Beta hoje: "Aplicação em desenvolvimento. Use de graça enquanto durar o Beta. Quando o pago chegar, você decide se continua."

---

## 3. Sessões antigas de comando — seção 11 do CLAUDE.md

### 3.1. Sessão 2026-05-08 — Análise da pesquisa e plano de lançamento

**Briefing inicial:**
> "Eu vou inserir agora alguns dados das pesquisas... organize esses dados e dê insights sobre as respostas qualitativas... gere um arquivo de texto que contenha tudo isso. Pense também que a estrutura é limitada a uma pessoa com tempo de 1h diária em caso de expansão ou implementação de uma nova feature. Pense também que nenhum marketing ou landing page foi feito ainda, porém você já vai começar um plano baseado nessas respostas."

**Sobre formato do documento:**
> "Mais puxado pro lado executivo do que pro analítico. Contanto que você possa juntar perguntas que fazem sentido juntas para serem respondidas."

**Sobre o estado atual:**
> "Foi até somente 1 teste inicial, sem escala. Eu quero que você inclua a copy pronta assim e deixe bem estruturado. Não somente a estratégia do plano de marketing — eu quero sim que já tenha tudo que se espera em uma campanha de marketing."

**Sobre o tempo:**
> "Coloque tudo isso em formato que caiba nisso, tempo de 6 semanas."

**Sobre Z-API vs Meta:**
> Decidiu manter Z-API durante as 6 semanas, baseado na análise de que o CNPJ ainda não está pronto e que templates aprovados pelo Meta restringiriam o alerta proativo (killer feature).

**Sobre Freemium (princípio central preservado):**
> "Vou redescrever o que eu queria dizer com freemium de início sem incluir as funções: por agora vamos fazer apenas funções básicas e essenciais, como tirar foto, o resumo imediato da compra e o resumo de compras no fim do mês. Eu quero que o produto seja usável mesmo que gratuitamente, que uma pessoa que vai no mercado 3x no mês consiga colocar seus cupons e consiga controlar seus gastos."

> "No pago por exemplo quero que tenha comparação de mercados, uma função killer, também a comparação entre família. Podemos pensar em um plano família de R$15 que você pode colocar até 3 pessoas, ou 20 para 5. Eu acredito que tiers de preços traga uma atratividade também."

> *(Filosofia de produto registrada na memória pessoal — princípio "bom, barato e útil")*
> "No final eu quero criar um produto que funcione, seja barato e útil. Lembre-se disso em todos os chats inclusive. Com esse produto, o bot que estamos desenvolvendo, eu quero capitalizar em cima, mas nunca pensar no inverso — sempre pensar em fazer um produto bom e que funcione GRATUITAMENTE, mas que faz muito melhor se pago."

**Sobre o limite do Free:**
> "Não concordo com [unlimited free] por que preciso colocar um limite nos usuários gratuitos por que pago por cada cupom lido. Deixar um limite previne utilização desnecessária ou abuso do uso. Podemos deixar um limite grande como 6 ou 10, mas sem limite o produto quebra."
> *Decisão final: 10 cupons/mês no Free.*

**Sobre o framing de marketing:**
> "Temos também que enfatizar muito a questão do economizar — o nome da aplicação é esse não é à toa. Quero que sempre que uma propaganda seja feita tenha essa sensação de economizar, de ser mais esperto que os outros em saber as coisas. Isso é algo que tem no brasileiro e principalmente naquele que busca praticidade pra vida."

**Sobre antecipação de objeções:**
> "Antecipar 2 objeções na copy do onboarding: 'não vai dar trabalho? só foto?' e 'mas o cupom já mostra isso, né?'"

**Outras confirmações na sessão:**
- Concordou com alerta dividido (básico free / inteligente pago).
- Concordou com tag `beta_fundador` no Supabase com benefícios. **(Revogado em 2026-05-19 — sem benefícios prometidos.)**
- Concordou com pricing 4-tier.
- Concordou com mostrar os 4 planos na landing já (pagos com "em breve"). **(Tags "em breve" removidas em 2026-05-22 — pricing direto.)**
- Concordou com a Semana 4 trocada de "comparativo de preços" para "polir o free + scheduler".

**Comando final da sessão:**
> "Faça um arquivo PDF com as etapas somente, o restante posso ver no chat através de um arquivo .MD. Por fim, depois de gerar tudo salve no arquivo Claude.MD nossa conversa e deixe todas as alterações e estratégias anexadas. Tente ser detalhado, principalmente lembrando meus comandos."

### 3.2. Sessão 2026-05-15 — Redesign da landing + revisão de copy

**Briefing inicial:**
> "Vamos analisar a página de landing que está no domínio economizei.space e quero que use todas as habilidades que discutimos para podermos melhorar a página, criar mais valor e também pensar mais em um design feito não de emojis mas pensado de maneira simples mas eficiente."

**Decisões aprovadas em sequência:**
- Refazer tudo (copy + design) | Direção visual "Confiável e brasileiro" (Nubank/PicPay) | Hospedado em Vercel
- Headline A: "Não deixa o mercado te passar a perna" | Mockup WhatsApp em SVG puro | Fita Beta Fundador no canto
- Plano de execução em 4 etapas com checkpoints

**Comandos de revisão na 2ª rodada (após ver o resultado deployado):**

Sobre design e ícones:
> "Vamos mudar a casa que está no ícone junto com o economizei no celular, vamos usar o mesmo sinal de correto."

Sobre badges e copy do hero:
> "Mude a frase 'beta gratuito acesso vitalício travado' para 'aplicação em desenvolvimento beta gratuito'."
> "Enfatize o 'Não deixe' na frase destaque, pode colocar um verde no 'não deixe' e uma cor vermelha no 'passar a perna'."
> "Mude o início da frase de baixo para 'mande a foto do cupom...'."
> "Mude o selo e retire a frase 'beta fundador', deixe somente 'vagas limitadas'."
> "Mude '100% pelo whatsapp', retire o 'que você já usa'."

Sobre seção de empatia:
> "Mude 'A dor que ninguém fala' para 'Problemas que resolvemos'."
> "A frase em baixo deixe em 'Você se identifica com alguma dessas pessoas'."
> "Mude a frase inteira para 'Conversamos com várias pessoas e pesquisamos muito até chegar na solução que o brasileiro queria'."
> "Especifique que os nomes são fictícios e usados somente como exemplo, isso deve aparecer em um canto com um asterisco, em fonte bem pequena."

Sobre como funciona:
> "Mude 'É só uma foto. Sério.' para 'Uma foto e pronto'."
> "Adicione 'sem planilha complexa', e a frase seguinte mude para 'mas o melhor assistente pessoal no seu whatsapp 24/7'."
> "No quadro de número 1 mude para 'No caixa do mercado, pegue o cupom, tire uma foto visível, manda no nosso número de whatsapp'."
> "No quadro de número 3 retire a parte 'sem virar contador da casa'."

Sobre anti-planilha:
> "Bullet 1 → 'Foto do cupom. A IA registra item por item, loja, data e total e organiza os dados.'"
> "Bullet 2 → 'No seu whatsapp, com privacidade, a qualquer momento que precisar.'"

Sobre pricing:
> "Mude o sub para 'Você pode testar gratuitamente ou ter os benefícios do plano pró que possui comparativo entre mercados e outras funcionalidades'."
> "Remova a nota 'O limite de 10 cupons no Grátis é técnico'."

Sobre privacidade:
> "Em 'Pode apagar a qualquer momento — Manda /apagar...', remova somente o 'sem fricção'."

**Decisão estratégica importante (registrada e depois sobrescrita):**
> "Existem algumas referências ao 9,90 travado para quem assinar agora, vamos remover isso, salve essa decisão na memória e retire tudo que mencione isso na landing page."
> *Aplicação naquele momento: removida promessa de preço vitalício, mantida promessa de 3 meses grátis. **Em 2026-05-19 a promessa de 3 meses grátis também foi removida** — auditoria identificou que sem unit economics validado, mesmo "3 meses grátis × N usuários × prazo indeterminado" vira compromisso pesado demais.*

---

## 4. Notas adicionais arquivadas

### 4.1. Pendência das skills `copy-review` e `roadmap-deps`

A nota da sessão 2026-05-19 dizia: *"2 skills criadas em `.claude/skills/` — `copy-review` e `roadmap-deps`. Pendente: empacotar como `.skill` e instalar no perfil global."*

**Status em 2026-06-04:** as duas skills permanecem em `.claude/skills/` junto com as 14 novas do sistema Economizei. Empacotamento `.skill` continua não-prioridade. Sistema atual é confiável via `PROJECT_INSTRUCTIONS.md` carregado a cada sessão.
