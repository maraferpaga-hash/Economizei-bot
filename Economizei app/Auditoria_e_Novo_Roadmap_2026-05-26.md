# Auditoria + Novo Roadmap 6 Semanas — Economizei

**Data:** 2026-05-26
**Autor:** Análise pareada Gabriel + Claude
**Contexto:** O roadmap original (08/05/2026) cobre até ~19/06. Estamos no meio da Semana 3. Várias entregas foram superadas por decisões posteriores, várias ficaram em pé. Distribuição (vídeo) não começou, instrumentação não existe, CNPJ não iniciado. Este documento audita tudo e propõe um novo roadmap de 6 semanas focado em validar a praça de Fernandópolis.

**Documentos relacionados (não duplicar conteúdo aqui):**
- `CLAUDE.md` — memória institucional
- `Projecao_6_meses.md` — cenários e gatilhos
- `Projecao_Cenario_Paywall_Dia_1.md` — racional do paywall PIX
- `Economizei_Plano_Producao_Videos.md` — plano de vídeo (existe, ainda não executado)
- `Roteiros_Campanha_Fernandopolis.md` — roteiros para a praça inicial (criado em 2026-05-26)
- `Plano_Redes_Sociais.md` — estratégia de canais
- `Pendencias_Landing_2026-05-22.md` + `Inconsistencias_Copy_2026-05-22.md` — backlog de copy/landing
- `Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria crítica anterior

---

## 1. Resumo Executivo

O Economizei está numa contradição de estágio: tecnicamente é "lançado" (bot em produção, paywall PIX ativo, landing pública, pricing visível), mas operacionalmente é "pré-lançamento" (zero distribuição, zero instrumentação, zero usuário fora do círculo do fundador, CNPJ não iniciado). O motor existe; o combustível e o painel de controle não.

**Estado das 3 áreas reais:**

| Área | Status hoje | Risco principal |
|---|---|---|
| Produto | Em produção, Semanas 1–4 do roadmap codadas | Sem instrumentação, não se sabe se funciona em escala |
| Distribuição | Landing existe, nada mais. Vídeo não iniciado | Sem conteúdo, ninguém chega no bot |
| Caixa | Pricing PIX manual ativo, custo sob controle | Sem CNPJ, paywall PIX como PF é frágil legalmente |

**Os 3 gargalos das próximas 6 semanas:**

1. **Instrumentação básica (UptimeRobot, GA4/Vercel Analytics, tracking de W2 no Supabase)** — sem isso todos os gatilhos da projeção viram chute.
2. **Produção de vídeo para TikTok/Reels com frame de Fernandópolis** — sem isso, distribuição não existe e a praça inicial não se prova.
3. **CNPJ iniciado** — sem isso Meta Ads não roda, recibo PIX como PJ não existe e migração Z-API → Meta Cloud API fica congelada.

Resolver esses 3 destrava todo o restante do planejamento.

---

## 2. Análise Crítica do CLAUDE.md

### 2.1. Contradições internas (precisam ser reconciliadas)

**C1 — Régua de retorno descalibrada.**
A seção 6 define dedicação real em ~12h/sem, mas a régua de break-even (R$4.225/mês) foi calculada com 15h × 4,33 × R$65. Hoje, no ritmo real, a régua honesta é R$3.380/mês. Decisão pendente: meta é dedicar 15h e mirar R$4.225, ou manter 12h e calibrar para R$3.380?

**C2 — Roadmap macro do Mês 3 zumbi.**
"Mês 3 — Lançar plano pago + meta 10 pagantes" foi superado pela decisão de 22/05 (paywall PIX ativo desde dia 1). O Mês 3 macro precisa ser reescrito ou removido.

**C3 — Roadmap Semana 2 com entregas revogadas.**
"Bloco de pricing com 3 planos pagos 'em breve'" e "waitlist no Supabase" foram revogadas em 22/05. A entrega real da Semana 2 hoje é outra.

**C4 — "Pré-lançamento" vs "paywall ativo".**
A seção 1 diz "Pré-lançamento — em fase de validação comercial". A seção 3 diz "TODOS ATIVOS desde o lançamento". A landing fala em "Aplicação em desenvolvimento, Beta gratuito" enquanto oferece assinatura PIX. Cliente lê e estranha: "Beta que cobra?". Falta uma linha de copy que resolva isso ("Estamos em Beta porque seguimos polindo, mas você já pode assinar se quiser as funções avançadas").

**C5 — Áreas (3) vs Chapéus (6).**
Seção 5 lista 3 áreas reais. Seção 6.2 lista 6 chapéus consumindo tempo. Não é erro, mas o documento não explica a diferença e quem ler depois vai estranhar a aritmética.

**C6 — Cálculo R$4.225 errado.**
15 × 4,33 × 65 = R$4.221,75. Pequeno arredondamento que virou fato citado em 3 lugares.

### 2.2. Conteúdo a verificar (possível inferência da IA, não fato)

**V1 — Dados sobre Fernandópolis.** Estatísticas como "R$ 3,4 bi de potencial de consumo", "5,8% em 2024", "560 + 1.088 domicílios B/C novos" precisam ser conferidas contra a fonte primária (cidadao.net e/ou IBGE). A afirmação "1 viral local = 50 cadastros" é projeção qualitativa, não dado — deve ser apresentada como hipótese.

**V2 — Lista de mercados-âncora.** Pessotto Max/Flex/da Cida, Sakashita Av. Primo Angelucci, Souza/Rede Sol Parque Nações desde 1990 — Gabriel precisa confirmar nomes, bairros e endereços antes que esses dados virem slot variável de roteiro publicado.

**V3 — Estatísticas da pesquisa (30 respostas).** "27/30 abrem WhatsApp 6+ vezes/dia", "70% age após alerta" — conferir contra os CSVs brutos em `local_*/uploads/Pesquisa de Hábitos*.csv`.

**V4 — "Salário médio formal R$ 2.600 vs estadual R$ 3.900".** Plausível mas precisa fonte/ano, não só "IBGE genérico".

### 2.3. Buracos estruturais (riscos não endereçados)

**B1 — Zero instrumentação.** O CLAUDE.md cita ~10 métricas e usa elas como gatilho para decisões caras (contratar freela, migrar Z-API → Meta, Fase 3 da terceirização). Nenhuma está medida automaticamente. Sem isso, gatilhos são chute. **Prioridade #1.**

**B2 — CNPJ não iniciado.** Bloqueia Meta Ads (precisa Privacy Policy + razão social), conta PJ, Meta Cloud API, recibo PIX legal, contabilidade. Aparece em 4–5 decisões como "depende de CNPJ" e o status próprio nunca foi tratado.

**B3 — PIX manual escala até ~10 pagantes.** Renovação mensal exige Gabriel ativando flag. Com 30 pagantes vira 90 min/mês + churn por fricção. O gatilho "5 pagantes em 60 dias → automatizar" precisa virar plano executável, não nota.

**B4 — Privacy Policy + Termos não publicados.** Bloqueia Meta Ads. Risco LGPD num produto que processa CNPJ + lista de itens + data.

**B5 — Comparativo entre mercados não codado.** É a "killer feature" paga. Sem ela, o Pro de R$9,90 oferece "cupom ilimitado + alerta inteligente" — defensável, não matador.

**B6 — Risco operacional Z-API.** Número WhatsApp pode ser banido/desconectado e derruba o bot todo. Sem plano B, sem número secundário, sem alerta de desconexão.

**B7 — Backup e disaster recovery do Supabase.** Não há menção a backup automatizado, nem ao que acontece se a chave de API vazar. Tabela de cupons cresce e nunca foi planejada janela de retenção (1 ano? 5 anos? quanto?).

**B8 — RLS (Row Level Security) no Supabase.** Cupons contêm CNPJ do mercado, data, lista de itens. Sem RLS, qualquer chave anon que vazar lê tudo de todo mundo. Risco LGPD.

**B9 — Áreas suspensas viram problema previsível.** CS estruturado, Financeiro, Jurídico — suspensos hoje mas a partir de 50+ usuários vão virar dor real. O CLAUDE.md registra mas não data quando reabrir.

**B10 — Onboarding existe (Semana 1 marcada feita) mas não foi medido se funciona.** Quantas pessoas mandaram o primeiro cupom depois das 4 mensagens? Sem dado, não há iteração.

### 2.4. Sinais bons que merecem ser preservados

Em meio à crítica, vale registrar o que está saudável:

- Princípio "bom, barato e útil" mantido com disciplina ao longo de 3 ciclos de pressão (08/05, 19/05, 22/05).
- Memória institucional viva e versionada (CLAUDE.md atualizado em quase toda sessão).
- Decisões controversas (paywall PIX antecipado, exclusão de Beta Fundador com benefícios) tomadas com racional explícito e antecedente registrado.
- Praça inicial definida com critério (Fernandópolis em vez de "lançamento nacional vago").
- Time documentado com custo de oportunidade explícito.

---

## 3. Status do Roadmap Original (08/05 → 26/05)

Confirmação do Gabriel: **tudo do código das Semanas 1–4 está em produção.** Isso muda significativamente a calibragem.

### 3.1. Feito e em produção

**Código (Semanas 1–4):**
- Limite de 10 cupons/mês no Free
- `.env.example`
- Coluna `beta_fundador` (mantida como marcador técnico de cohort)
- Rate limit
- Reescrita de boas-vindas + onboarding em 4 mensagens
- Scheduler de resumo mensal automático
- Tratamento de cupons borrados / farmácia / sem itens
- Comando `/limite`
- Comando `/indicar` + tabela `indicacoes`
- Teste end-to-end

**Estratégia e comunicação:**
- Landing publicada em economizei.space (Vercel) — 15/05
- Revisão completa de copy da landing — 15/05
- Pricing dos 4 planos visível, todos ativos via PIX — 22/05
- Remoção total de tags "Em breve" da landing — 22/05
- Reescrita da copy do bot (sem promessas Beta Fundador) — 22/05
- Definição de paywall PIX manual — 22/05
- Auditoria crítica externa — 19/05
- Reestruturação de áreas (7 → 3 reais + suspensas) — 19/05
- Documento Projeção 6 meses + cenários otimista/realista/pessimista — 21/05
- Praça inicial Fernandópolis definida — 26/05
- Roteiros de campanha para Fernandópolis criados — 26/05
- Skills internas: copy-review, roadmap-deps — 19/05
- Plano de produção de vídeos documentado — 16/05
- Identidade visual base — 20/05

### 3.2. Pendente do roadmap original (ainda válido)

| Item | Originalmente | Status | Observação |
|---|---|---|---|
| Política de Privacidade publicada | Semana 3 | Pendente | Bloqueia Meta Ads. Prioridade alta |
| Página "Como tratamos seus dados" | Semana 3 | Pendente | Complementa Privacy |
| 3 vídeos Reels/TikTok | Semana 3 | **Não iniciado** | Plano existe (`Economizei_Plano_Producao_Videos.md`) e roteiros existem |
| 1 carrossel Instagram | Semana 3 | Não iniciado | — |
| Beta soft (lançamento controlado) | Semana 5 | Pendente | Depende dos itens acima |
| Meta Ads R$ 50–100 | Semana 5 | Pendente | Bloqueado por CNPJ + Privacy |
| Coletar NPS inicial | Semana 5 | Pendente | Tem 0 usuários ativos consistentes |
| UptimeRobot | Mês 1 | **Não instalado** | Tarefa de 30 min, alto leverage |
| GA4 ou Vercel Analytics | Mês 1 | **Não instalado** | Tarefa de 30 min, alto leverage |

### 3.3. Pendente do roadmap original mas obsoleto/superado

| Item | Por que morreu |
|---|---|
| Bloco de pricing "em breve" (Semana 2) | Substituído por pricing ativo via PIX (22/05) |
| Waitlist no Supabase (Semana 2) | Removida pela decisão de 22/05 |
| A/B test de preço Semana 6 | Superado pela decisão de paywall PIX |
| "Mês 3 — Lançar plano pago" | Já lançado |

### 3.4. Pendente do Mês 1 macro (importante revisitar)

| Item | Status real |
|---|---|
| Abrir CNPJ / ME | **Não iniciado** — confirmado pelo Gabriel |
| Conta PJ separada | Bloqueado por CNPJ |
| Termos de Serviço | Pendente |
| Privacy Policy | Pendente |
| Integração Stripe ou Mercado Pago | Gatilho: ≥ 5 pagantes PIX em 60 dias |

---

## 4. Novo Roadmap 6 Semanas (26/05 → 06/07/2026)

**Foco único:** validar a praça de Fernandópolis com instrumentação real, conteúdo em escala produzível e Privacy/CNPJ destravados.

**Princípios:**
- Cada semana entrega 3 coisas no máximo. Mais que isso vira lista de desejos.
- Cada semana termina com um número medido, não uma sensação.
- Nada que dependa do código entra: o código já está pronto.
- Distribuição (vídeo) é a coluna vertebral das 6 semanas.

### Semana 1 — Instrumentação + Privacy + CNPJ iniciado (26/05 → 01/06)

**Objetivo:** ao final da semana você consegue medir 3 números (uptime, visitantes da landing, cadastros novos) e a Privacy Policy + processo de CNPJ estão andando.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 1.1 | Instalar UptimeRobot (free tier) apontando para `/health` | 30 min | Gabriel | Email de alerta funciona em teste de queda |
| 1.2 | Instalar Vercel Analytics na landing (ou GA4 se preferir) | 30 min | Gabriel | Dashboard mostra visitas dos últimos 7 dias |
| 1.3 | Adicionar coluna `first_message_at` + `last_message_at` na tabela `usuarios` (se não existe) e função que conta W2 | 1 h | Gabriel | Query SQL devolve % de cadastros da semana N–2 que mandaram cupom na semana N |
| 1.4 | Iniciar abertura de CNPJ (MEI ou ME conforme contador) | 1 h | Gabriel | Protocolo de abertura no celular |
| 1.5 | Publicar Política de Privacidade na landing (template LGPD adaptado para o produto) | 2 h | Gabriel | Link `/privacidade` ativo, mencionando: dados coletados (foto, telefone, CNPJ mercado, itens), finalidade, retenção, base legal, contato |
| 1.6 | Publicar Termos de Uso simples | 1 h | Gabriel | Link `/termos` ativo |

**Entrega da semana:** dashboard mínimo de saúde (uptime + visitas + cadastros + W2). Privacy/Termos publicados. CNPJ em processo.

**Tempo total estimado:** ~6 h. Cabe folgado em 12 h/sem.

### Semana 2 — Primeiros 3 vídeos + perfis ativos (02/06 → 08/06)

**Objetivo:** sair com 3 vídeos publicados em TikTok + Reels, perfis criados, primeira métrica de alcance medida.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 2.1 | Criar perfil TikTok @economizei + perfil Instagram @economizei.app (ou nome confirmado) | 1 h | Gabriel | Bio + foto + link da landing |
| 2.2 | Gravar 3 vídeos curtos (15–30s) usando roteiros de `Roteiros_Campanha_Fernandopolis.md` | 4 h | Gabriel | 3 arquivos brutos na pasta `marketing/videos/` |
| 2.3 | Editar (CapCut ou similar) com legenda queimada e mockup do bot | 3 h | Gabriel | 3 arquivos finais publicáveis |
| 2.4 | Publicar 1 vídeo por dia útil (3 dias, qua/qui/sex) com hashtags locais | 1 h | Gabriel | 3 publicações ativas |
| 2.5 | Medir views, watch time, perfis novos vindos do bio | 30 min | Gabriel | Planilha simples com 3 colunas: vídeo, views, cliques no link |

**Entrega da semana:** 3 vídeos publicados, perfis ativos, primeiro número de alcance medido.

**Tempo total estimado:** ~9,5 h. Apertado mas factível em 12 h/sem.

**Risco:** se a gravação atrasar, prioridade absoluta é a Tarefa 2.2 — sem material bruto não tem nada que editar. Não fica preso em editar perfeito.

### Semana 3 — Beta soft Fernandópolis + Comparativo MVP (09/06 → 15/06)

**Objetivo:** convidar 15–25 pessoas conhecidas em Fernandópolis pra testar de verdade. Soltar versão 1 (MVP) do comparativo entre mercados.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 3.1 | Lista de 15–25 contatos pessoais em Fernandópolis (família, amigos, vizinhos, igreja, academia) | 1 h | Gabriel | Lista com nome + telefone na planilha de tracking |
| 3.2 | Mensagem-convite personalizada (não copy-paste óbvio) | 30 min | Gabriel | Template + 3 variações por perfil (família / amigo / colega) |
| 3.3 | Codar comparativo de mercado MVP: dado um item canonicalizado, retorna preço médio nas últimas 4 semanas em qualquer mercado da base, sem percentil | 6 h | Gabriel | Comando `/comparar arroz` devolve resposta útil |
| 3.4 | Publicar mais 3 vídeos (cadência semanal estabelecida) | 4 h | Gabriel | 3 publicações novas |
| 3.5 | Medir: quantos dos 15–25 convidados mandaram pelo menos 1 cupom | 30 min | Gabriel | Planilha atualizada |

**Entrega da semana:** primeiro cohort real de Fernandópolis ativo. Comparativo de mercados em produção. 6 vídeos no ar acumulados.

**Tempo total estimado:** ~12 h. Limite do orçamento semanal.

### Semana 4 — Iteração de copy + primeiro NPS (16/06 → 22/06)

**Objetivo:** com o primeiro cohort em uso, coletar dor real, ajustar copy do bot, medir NPS.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 4.1 | Conversa 1-a-1 (áudio WhatsApp ou ligação de 10 min) com 5 dos 15–25 convidados | 3 h | Gabriel | 5 áudios/transcrições salvos em `Economizei app/feedback/` |
| 4.2 | Pergunta NPS no bot ("De 0 a 10, quanto você indicaria pra um amigo?") em mensagem agendada para quem mandou ≥ 3 cupons | 1 h | Gabriel | Comando + resposta salva em nova coluna `usuarios.nps_score` |
| 4.3 | Ajustar 1 mensagem do onboarding baseado no feedback (ex: clareza, antecipar objeção, encurtar) | 1 h | Gabriel | Deploy de versão nova |
| 4.4 | Publicar 3 vídeos novos (com base no que ressoou nas semanas 2–3) | 4 h | Gabriel | 3 publicações |
| 4.5 | Medir W2 do cohort de Fernandópolis | 30 min | Gabriel | Número específico do cohort, não da base toda |

**Entrega da semana:** primeiro NPS coletado, copy iterada, W2 medido, 9 vídeos no ar acumulados.

**Tempo total estimado:** ~9,5 h.

### Semana 5 — Meta Ads geo + primeiro pagante PIX (23/06 → 29/06)

**Objetivo:** ativar Meta Ads geo-segmentado em Fernandópolis (se Privacy estiver no ar e CNPJ permitir) e fechar o primeiro pagante PIX vindo de fora do círculo pessoal.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 5.1 | Configurar Meta Business + pixel da landing | 2 h | Gabriel | Pixel disparando eventos de page view |
| 5.2 | Criar 2 anúncios (cada um usando 1 dos 3 vídeos mais performáticos), público raio 30km Fernandópolis, R$ 50 budget de teste | 1,5 h | Gabriel | Anúncios aprovados e rodando |
| 5.3 | Cadência de 3 vídeos publicados (semana normal) | 4 h | Gabriel | 3 publicações |
| 5.4 | Acompanhamento manual diário do funil PIX: alguém pediu `/planos`? Pagou? | 30 min × 7 = 3,5 h | Gabriel | Planilha de pipeline atualizada |
| 5.5 | Cálculo de custo total do mês (Gemini + Z-API + Vercel + ads + domínio) | 30 min | Gabriel | Número na planilha de unit economics |

**Entrega da semana:** primeiro ad rodando, 12 vídeos acumulados, 1º pagante PIX fora do círculo (meta — não garantia).

**Tempo total estimado:** ~11,5 h.

### Semana 6 — Revisão de gatilho + decisão Mês 3 (30/06 → 06/07)

**Objetivo:** parar, medir, decidir. Esta é uma semana de balanço, não de mais entrega.

| # | Tarefa | Tempo | Responsável | Critério de aceite |
|---|---|---|---|---|
| 6.1 | Compilar números das 5 semanas anteriores: cadastros totais, W2 do cohort local, NPS médio, custo total, pagantes PIX | 2 h | Gabriel | Tabela única consolidada |
| 6.2 | Comparar contra gatilhos do `Projecao_6_meses.md` (Mês 2 e Mês 3) | 1 h | Gabriel | Semáforo 🟢/🟡/🔴 para cada gatilho |
| 6.3 | Decidir: continuar Fernandópolis, expandir para Votuporanga, ou pivotar formato de conteúdo? | 2 h | Gabriel | Decisão registrada no CLAUDE.md |
| 6.4 | Atualizar CLAUDE.md com tudo aprendido nas 6 semanas | 2 h | Gabriel | Seções 7, 8, 9 atualizadas |
| 6.5 | Escrever próximo roadmap (semanas 7–12) com base na decisão | 3 h | Gabriel | Novo doc `Roadmap_Semanas_7_12_2026-07-06.md` |

**Entrega da semana:** decisão informada por dado sobre próximo ciclo. CLAUDE.md atualizado. Novo roadmap pronto.

**Tempo total estimado:** ~10 h.

---

## 5. Métricas obrigatórias por semana (painel mínimo)

Sem essas 5 métricas medidas semanalmente, o roadmap acima vira teatro. Anotar toda sexta-feira em planilha simples.

| Métrica | Onde mede | Meta semana 6 |
|---|---|---|
| Uptime do bot | UptimeRobot | ≥ 99% |
| Visitas únicas na landing | Vercel Analytics | ≥ 200 acumuladas |
| Cadastros novos no bot | Supabase: `count(usuarios) created_at >= ...` | ≥ 30 acumulados |
| W2 do cohort Fernandópolis | Query SQL própria | ≥ 30% |
| Pagantes PIX | Tabela `usuarios.is_pro = true` | ≥ 1 fora do círculo pessoal |

---

## 6. Decisões pendentes para o Gabriel responder

Estas decisões bloqueiam o roadmap acima. Vale tirar 30 min e responder cada uma.

**D1 — Régua de retorno:** assumir 12h e mirar R$ 3.380/mês, ou mirar 15h e R$ 4.225/mês? (afeta gatilhos do Mês 8)

**D2 — CNPJ: MEI ou ME?** MEI tem teto de R$ 81 mil/ano e limita atividades; ME é mais flexível mas exige contador. Definir antes de iniciar o processo.

**D3 — Vídeo: gravar com aparição própria ou animação/voiceover?** Aparição cria conexão mais rápida em cidade pequena, mas expõe você. Definir antes da Semana 2.

**D4 — Comparativo de mercado: opt-in ou opt-out?** Pra o MVP funcionar, dados de cupons precisam ser agregados anonimizados. Decidir se usuário precisa autorizar explicitamente no onboarding (mais respeitoso, menos dados) ou se é opt-out via comando (mais dados, mais delicado de LGPD).

**D5 — Beta soft: convite por mensagem direta individual ou grupo?** Mensagem direta tem melhor conversão e menos "queima" mas escala 1-a-1. Grupo escala mas tem o risco de espalhar "ferramenta gratis da [pessoa conhecida]" sem cuidado.

**D6 — Frase de transição "Beta que cobra":** qual linha resolve a aparente contradição na landing? Sugestão: "Estamos em Beta porque seguimos polindo. Use de graça sempre que quiser. Se as funções avançadas resolverem mais sua vida, assina via PIX." Validar redação.

---

## 7. O que NÃO entra nas próximas 6 semanas (cortes deliberados)

Para manter as 6 semanas executáveis em 12 h/sem, estas coisas ficam fora — e isso é a decisão difícil.

- **Migração Z-API → Meta Cloud API.** Espera os 50–100 usuários ativos como o CLAUDE.md já registra.
- **Stripe/MP integrado.** Só ativa quando bater 5 pagantes PIX em 60 dias (gatilho registrado).
- **Persona 3 (filha que paga pra mãe).** Continua em pauta mas sem campanha dedicada antes de validar persona 1 + 2.
- **Conteúdo em formato longo (carrossel Instagram, post de LinkedIn).** Foco em vídeo curto único nas 6 semanas.
- **Reabertura das áreas suspensas** (CS estruturado, Financeiro formal, Jurídico além de Privacy/Termos básicos).
- **Expansão para Votuporanga ou outras cidades.** Decisão só na Semana 6.
- **Freela de conteúdo.** Gatilho ainda não bateu (W2 ≥ 30% no Mês 3).
- **Skill de auditoria/dependency-mapping global.** Skills internas ficam como estão; o produto vem primeiro.

---

## 8. Próxima sessão de trabalho — checklist de abertura

Pra começar a Semana 1 amanhã com tudo destravado:

- [ ] Reler este documento
- [ ] Responder as 6 decisões pendentes da seção 6
- [ ] Abrir CLAUDE.md e atualizar seção 7 substituindo o roadmap antigo por referência a este documento
- [ ] Bloquear 2 h no calendário pessoal para a Tarefa 1.5 (Privacy Policy) — é a mais demorada da Semana 1
- [ ] Procurar contador de Fernandópolis ou usar plataforma online (Contabilizei, Agilize) para Tarefa 1.4 (CNPJ)
- [ ] Confirmar com pessoa conhecida da cidade os nomes dos mercados-âncora antes de gravar vídeo

---

## 9. Critério único de sucesso ao final das 6 semanas

Se ao final do dia 06/07/2026 estes 5 fatos forem verdade, as 6 semanas valeram:

1. CNPJ aprovado ou em fase final de aprovação
2. Privacy Policy + Termos publicados
3. 12+ vídeos no ar com pelo menos 1 passando de 1k views
4. 30+ cadastros únicos com pelo menos 30% W2 no cohort Fernandópolis
5. 1+ pagante PIX fora do círculo pessoal

Se 4 dos 5 forem verdade: continuar. Se 3 ou menos: revisar premissa (canal, mensagem, oferta).

---

*Documento criado em 2026-05-26 a partir de auditoria pareada Gabriel + Claude.*
*Referenciar este doc no CLAUDE.md como substituto do "Roadmap Tático 6 Semanas" original.*
