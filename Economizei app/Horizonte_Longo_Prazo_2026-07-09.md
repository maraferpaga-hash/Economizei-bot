# 🔭 Horizonte de Longo Prazo — jul→out/2026 e além

> **Criado:** 2026-07-09 · **Gatilho:** Empresa BC adiada pra outubro/2026 (decisão do Gabriel)
> **Resumo lido em toda sessão:** CLAUDE.md seção 7.2 · **Sementes:** AGENDA.md Backlog "🔭 Longo Prazo" (cod-0060..0064)
> **Status:** frentes registradas — o desdobramento em tarefas de fila depende da **sessão de discussão** (item em "Aguardando sua decisão" na AGENDA).

---

## 1. Contexto e o que muda

**Fato novo:** a abertura da empresa em British Columbia **não será possível antes de outubro/2026**. Isso congela, até lá, tudo que depende dela: Meta Ads (e o BM), Hotmart (anuais + afiliados), Wise Business (PIX do mensal) e a regularização da estrutura de recebimento. Na prática, **a monetização em escala está estruturalmente pausada por ~3 meses**.

**Reframe honesto:** isso não é só um atraso — é uma clareza. Até outubro, a única métrica que pode e deve andar é a de **produto e retenção** (W2 no cohort de Fernandópolis, cupons por usuário ativo, qualidade da classificação). Receita não é a régua deste período. O gate W2 ≥ 30% pra escalar aquisição **não muda** — só muda o "quando" da escala.

**Decisões desta sessão:**
1. **Janela de planejamento da AGENDA expandida pra até 2 meses à frente** (antes o planejamento era só a fila imediata). A Máquina Local ganha pista longa.
2. Criação deste horizonte com **2 frentes-semente** (abaixo), registradas no Backlog como cod-0060..0064.
3. **Regra de gate:** nenhuma semente sobe pra "Fila pronta" antes da sessão de desdobramento (discussão + insights). A fila atual (deploy do Agente → Leva 2 de intents → Alerta Pro) tem prioridade sobre qualquer semente.

---

## 2. Frente 1 — Ingestão multi-documento financeiro

**Visão do Gabriel:** hoje o bot só vê o cupom (foto). Expandir o mesmo gesto zero-atrito pra **qualquer documento financeiro**: a pessoa manda a fatura de cartão (PDF), o comprovante de PIX, a notificação do banco, qualquer foto/arquivo — o bot entende, extrai, classifica e devolve insight.

**Por que é estrategicamente forte:**
- **Destrava a G1** (assinaturas/gastos invisíveis), reprovada na pesquisa de 06-09 exatamente porque "o bot só vê cupom, não fatura". Com a fatura, o Economizei deixa de ser "inteligência do supermercado" e vira **inteligência do gasto inteiro** — um salto de categoria.
- **Sobe a escada do Norte:** mais dado → conclusões que a pessoa não tiraria (Camada 2) → decisões melhores (Camada 3).
- **Reusa a fundação que já existe:** Gemini Vision + classificação + guardas de honestidade + Agente de Perguntas. A arquitetura documento→extração→classificação→insight já está provada no cupom.

**O que dá pra captar por tipo de documento (rascunho pra discussão):**

| Documento | Formato típico | Dados extraíveis | Insight que destrava |
|---|---|---|---|
| Fatura de cartão | PDF (às vezes senha) | lançamentos, datas, valores, estabelecimentos, parcelas | assinaturas recorrentes, gasto invisível, parcelas que se acumulam |
| Comprovante PIX | foto/PDF/print | valor, data, destinatário | transferências recorrentes, "pra onde vai fora do mercado" |
| Notificação de banco | print/texto encaminhado | valor, estabelecimento, hora | registro em tempo real sem esperar cupom |
| Recibo genérico (serviço, boleto) | foto/PDF | valor, categoria, data | visão completa do mês |

**Riscos e princípios (honestidade antes de construir):**
1. **Sensibilidade em dobro.** Fatura de cartão expõe a vida financeira INTEIRA da pessoa — muito além de uma ida ao mercado. O princípio **processa-em-memória-e-descarta** (já vigente pro cupom) e o desenho LGPD nascem JUNTO com a feature, não depois. `/apagar` precisa cobrir os novos registros desde o dia 1.
2. **Classificação continua o coração.** Lançamento de fatura ("PAG*IFOOD", "MP *ASSINATURA") é MUITO mais críptico que item de cupom. O corpus de regressão da classificação precisa de um irmão pra lançamentos de fatura antes de qualquer promessa.
3. **Custo Gemini.** Fatura de 8 páginas ≠ cupom de 40 itens. O limite free (hoje 10 cupons/mês) precisa de aritmética própria por tipo de documento.
4. **Firewall intocado.** Tudo aqui é leitura/análise — zero contato com pagamento/cobrança. Nota: a palavra "pix" é token do firewall; a tarefa cod-0062 é LER comprovante, não cobrar — trip do check será falso-positivo consciente, revisado por humano.
5. **Não misturar as médias.** Registro de PIX/fatura não pode contaminar a média de gasto de mercado (mesma lição do `compras.tipo` de 06-07). Taxonomia de tipos de registro é pré-requisito do desenho (cod-0060).

**Sementes na AGENDA:** cod-0060 (desenho, Opus+Gabriel) → cod-0061 (plumbing de PDF no webhook) → cod-0062 (comprovante PIX). Fatura de cartão fica pra depois do desenho — é o documento mais difícil e mais sensível.

---

## 3. Frente 2 — Internacionalização (Canadá → EUA → Europa)

**Visão do Gabriel:** com a empresa em BC e ele morando em Vancouver, preparar a estrutura pra outras línguas, culturas, tipos de recibo e jeitos de lidar com dinheiro. Começar por Vancouver, depois EUA, depois Europa.

**Por que Canadá primeiro faz sentido:**
- Gabriel está fisicamente lá — **recibos reais pra testar**, conhecimento do mercado local, e a empresa BC dá a estrutura jurídica nativa.
- Mercado de teste pequeno e controlável antes do salto EUA.

**O que a internacionalização REALMENTE implica (pra discussão — em ordem de dureza):**
1. **CANAL (a decisão mais dura).** "WhatsApp é o produto" é uma premissa BRASILEIRA. No Canadá/EUA, WhatsApp tem penetração baixa — o dia a dia é iMessage/SMS/apps próprios. Internacionalizar não é traduzir o bot: é decidir se o produto vira SMS (caro/limitado), app, integração bancária (Plaid é o padrão lá — e muda o produto de "foto do cupom" pra "conexão de conta"), ou se mira primeiro nichos onde WhatsApp É forte (imigrantes brasileiros/latinos em Vancouver/Toronto — cabeça de ponte natural e público que o Gabriel entende). Na Europa (Espanha/Itália/Alemanha), WhatsApp é forte — mas GDPR é o regime mais duro do mundo.
2. **Concorrência local.** Na América do Norte o problema "pra onde vai meu dinheiro" já é servido por agregadores bancários (Monarch, Copilot, Rocket Money via Plaid). O diferencial do dado item-a-item do recibo **continua defensável** (agregador vê "$87.43 SAFEWAY", nós vemos os 40 itens) — mas a dor atacada muda de "não sei quanto gastei" pra "não sei O QUE comprei". O posicionamento precisa ser repensado por mercado, não copiado.
3. **Recibos e impostos.** Recibo canadense: GST/PST por item, formatos diferentes, en/fr. O prompt do Gemini e o corpus de regressão precisam de versão por país (cod-0064).
4. **i18n técnico.** Camada de localidade (strings, moeda, formatação) — trabalho mecânico e firewall-limpo, perfeito pra Máquina (cod-0063). É a semente mais barata da frente.
5. **Leis.** PIPEDA (Canadá), CCPA (Califórnia), GDPR (Europa) — cada um com regime próprio de consentimento/retenção. O desenho LGPD atual é o molde, não o teto.

**Sementes na AGENDA:** cod-0063 (fundação i18n) → cod-0064 (recibo canadense). Ambas gated pela decisão de mercado-alvo + canal.

---

## 4. Fases sugeridas da janela jul→out/2026 (proposta, a validar na discussão)

| Fase | Período | Foco | Por quê |
|---|---|---|---|
| **A — Fechar o presente** | jul | Deploy do Agente (migrations/envs/smoke test) + Leva 2 (cod-0040..0042) + Alerta Pro (cod-0031+) | Nada de longo prazo antes do produto atual estar validado em produção — o `perguntas_log` é o juiz da direção |
| **B — Frente 1 fundação** | ago–set | Desenho (cod-0060) → plumbing PDF (cod-0061) → PIX (cod-0062); fatura de cartão se o desenho aprovar | Aumenta o valor do produto BRASILEIRO (que é o que valida W2) e constrói a fundação multi-documento |
| **C — Frente 2 fundação + preparação BC** | set–out | i18n (cod-0063) → recibo canadense (cod-0064); paralelo humano: juntar documentos da abertura BC pra executar em outubro sem atraso | Chegando em outubro com a empresa pronta pra abrir E a fundação internacional plantada |

**Racional da ordem:** a Frente 1 vem antes porque melhora o produto que está sendo validado AGORA no Brasil (fatura/PIX servem o usuário de Fernandópolis); a Frente 2 só vira produto depois de decisões estratégicas pesadas (canal, posicionamento) que merecem discussão própria.

---

## 5. Pontos abertos pra sessão de desdobramento (o Gabriel decide)

1. **Canal internacional:** nicho WhatsApp (brasileiros/latinos no Canadá) como cabeça de ponte, ou repensar canal (SMS/app/Plaid)? — define TODO o resto da Frente 2.
2. **Fatura de cartão no free ou só Pro?** — custo Gemini + sensibilidade sugerem Pro, mas é decisão de pricing (firewall/humano).
3. **Ordem dentro da Frente 1:** PIX primeiro (fácil, registro avulso) ou fatura primeiro (difícil, mas destrava a G1 inteira)?
4. **Quanto da janela da Máquina** vai pra longo prazo vs. melhorar o produto atual (proativos, áudio, cod-0043..0049 — que também estão esperando)?
5. **A abertura BC em outubro:** o que dá pra adiantar desde já (NAR? documentos?) pra não perder semanas em outubro?

---

*Regras permanentes: firewall financeiro intocado nas duas frentes até os gates humanos; Teste de Norte pra toda feature; classificação é o coração — em qualquer país e em qualquer documento.*
