# 🗺️ Mapeamento Geral — Estado do Projeto Economizei

**Data:** 2026-06-24 · **Gerado por:** Claude (Cowork) + auditoria do repositório  
**Propósito:** visão única de tudo que está pendente — para o Gabriel e para a Máquina Local saberem exatamente onde o projeto está.

> **Como usar:** este doc é leitura de planejamento. As tarefas de código vão para a `AGENDA.md` (motor da máquina). As tarefas humanas ficam aqui como checklist. Atualize quando concluir.

---

## ⚡ Resumo executivo (leia só isso se tiver pressa)

| Categoria | Qtd | Status |
|---|---|---|
| Arquivos modificados não commitados | 4 | 🟡 Commitar agora |
| Docs novos não commitados | 6 | 🟡 Commitar agora |
| Tarefas de código na fila (máquina) | 3 | 🟢 Prontas pra rodar |
| Tarefas de código no backlog | 5 | 🔵 Aguardando priorização |
| Grandes features desenhadas, não codadas | 2 | 🔵 Aguardando decisão |
| Ações humanas pendentes (infra/legal/financeiro) | 8 | 🔴 Só o Gabriel |
| Migrações SQL com status incerto | 2 | 🟡 Confirmar se rodaram |

---

## 1. 🔀 Git — arquivos pendentes de commit

O branch está **up-to-date com origin/main** mas com mudanças locais não commitadas.

### Modificados (git add + git commit)

| Arquivo | O que mudou | Ação |
|---|---|---|
| `AGENDA.md` | Reformulada pra modo local (várias sessões) | Commitar |
| `.github/workflows/claude-nightly.yml` | Modificado na sessão de migração local | **Remover** (`git rm`) + commitar |
| `Economizei app/Passo_a_Passo_Maquina_Noturna.md` | Atualizado pra modo local | Commitar |
| `landing/index.html` | Mudanças de sessões anteriores | Commitar (revisar antes) |

> ⚠️ **O workflow `claude-nightly.yml` deve ser removido** (GitHub Actions foi descontinuado — decisão 2026-06-24). Rodar `git rm .github/workflows/claude-nightly.yml` antes do commit. O `monthly-cron.yml` (resumo mensal) **fica**.

### Não rastreados — documentos novos (git add + commit)

| Arquivo | Conteúdo |
|---|---|
| `Economizei app/Abertura_Empresa_BC_2026-06-24.md` | Passo a passo de abertura de empresa em BC, Canadá |
| `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md` | Arquitetura completa do Agente de Perguntas (chat sem comandos) |
| `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md` | Proposta de encurtamento das mensagens automáticas (−25%) aguardando aprovação |
| `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` | Estratégia Meta Ads + Google, CPA, campanha de Fernandópolis |
| `Economizei app/Forecast_Plano_Anual_2026-06-23.md` | Forecast de caixa (cenários best/likely/worst) da 1ª rodada de ads + plano anual |
| `Economizei app/Mapa_Processo_Maquina_Local.md` | Mapa do processo da máquina local |

> **Comando único para commitar tudo de uma vez:**
> ```bash
> git rm .github/workflows/claude-nightly.yml
> git add AGENDA.md "Economizei app/Passo_a_Passo_Maquina_Noturna.md" landing/index.html
> git add "Economizei app/Abertura_Empresa_BC_2026-06-24.md" "Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md" "Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md"
> git add "Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md" "Economizei app/Forecast_Plano_Anual_2026-06-23.md" "Economizei app/Mapa_Processo_Maquina_Local.md"
> git commit -m "chore: limpa Actions; commita docs de sessões (BC, agente, ads, forecast, encurtamento)"
> git push
> ```

---

## 2. 🤖 Fila de código (AGENDA.md) — estado completo

### Em fila (máquina pega e roda)

| ID | Título | Tipo | Prioridade |
|---|---|---|---|
| cod-0001 | F3 "Onde cortar sem doer" — comando `/cortar` | feature-codigo | P0 |
| cod-0002 | Afrouxar heurística `avaliarQualidadeCanonicoItem` | refino-codigo | P1 |
| cod-0003 | Testes do alerta em 3 níveis (`alerts.js`) | teste | P1 |

### Backlog (precisa priorizar junto com o Opus)

| ID | Título | Tipo | Observação |
|---|---|---|---|
| cod-0004 | **Encurtamento das mensagens** — aplicar `Encurtamento_Mensagens_Bot_2026-06-20.md` no `formatter.js` | refino-codigo | ⚠️ **Aguarda aprovação do Gabriel** (ver seção 4) |
| cod-0005 | **Agente de Perguntas MVP** — 3 intenções, Opção 1 | feature-codigo | ⚠️ Aguarda respostas às Open Questions (ver seção 4) |
| cod-0006 | `/apagar` — handler de exclusão de dados (LGPD) | feature-codigo | No backlog do AGENDA.md |
| cod-0007 | Afinar limiares do alerta (`ALERTA_*`) com dados reais | refino-codigo | Precisa de dados em produção primeiro |
| cod-0008 | Testes de `formatter.js` (mensagens não-financeiras) | teste | — |

### Páginas (foco secundário)

| ID | Título | Tipo |
|---|---|---|
| pag-0001 | Ajustar `vercel.json` pra páginas novas serem alcançáveis | conteudo-seo |
| pag-0002 | Guia SEO "Como economizar no supermercado" | conteudo-seo |
| pag-0003 | Guia SEO local "Economizar em Fernandópolis e região" | conteudo-seo |
| pag-0004 | Variação A/B da headline do hero | landing-ab |
| pag-0005 | Página "Economizei vs. planilha de Excel" | conteudo-seo |

---

## 3. 🏗️ Features desenhadas — aguardando construção

### 3.1. 🤖 Agente de Perguntas (chat sem comandos)

**Documento:** `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md`  
**Status:** arquitetura completa, Open Questions respondidas, **nada codado**.  
**O que é:** o usuário manda qualquer frase ("quanto gastei em carne?", "tô gastando mais?") e o bot responde com números reais do banco. Interface nova por cima das inteligências que já existem (`insights.js`).

**Open Questions que o Gabriel precisa responder antes de codar:**

| # | Pergunta | Sugestão |
|---|---|---|
| 1 | Q&A é Free generoso, Pro exclusivo, ou Free básico + Pro rico (Opção 2)? | Free com cota generosa (30/mês); ilimitado no Pro |
| 2 | Limite anti-abuso: qual número para `LIMITE_PERGUNTAS_FREE`? | 30/mês (custo é texto, não imagem) |
| 3 | Quando confiança é baixa: bot **pergunta de volta** ou **responde o palpite + aviso**? | Perguntar de volta (honestidade > fluidez no MVP) |
| 4 | Ok guardar a pergunta literal por 90 dias para aprendizado (OODA)? | Sim, com purga + menção na política de privacidade |
| 5 | Modelo da classificação: `flash` (já no projeto) ou `flash-lite` (mais barato)? | Começar com `flash`, trocar depois |
| 6 | Começar na geração estruturada (A) ou já na geração aberta com function-calling (B)? | (A) estruturada → (B) depois de observar o log |

**Complexidade estimada:** média. A parte difícil (inteligência) já existe em `insights.js`. O agente é uma casca de conversa + guardas de honestidade.

---

### 3.2. ✂️ Encurtamento das Mensagens Automáticas

**Documento:** `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md`  
**Status:** proposta pronta com antes/depois de 18 mensagens, **aguardando aprovação do Gabriel para aplicar no `formatter.js`**.  
**Impacto:** −25% de texto (4.105 → 3.059 chars), número importante sobe pro topo.  
**Ação:** Gabriel aprova (ou ajusta) → vira cod-0004 na AGENDA, máquina aplica.

---

### 3.3. 🔄 Reescaneamento de Cupons (Opção A)

**Documento:** `Economizei app/Plano_Reescaneamento_Opcao_A.md`  
**Status:** design completo, **nada codado**.  
**O que é:** armazenar cupons que falharam na leitura, reprocessar quando o modelo melhora.  
**Dependência:** precisa de bucket privado no Supabase + migration + módulo `cupomStorage.js`.  
**Observação honesta:** como o bot já faz Sharp + 2 retries, reprocessar raramente muda o resultado. Feature de menor urgência.

---

## 4. 🙋 Ações humanas pendentes (só o Gabriel)

### Financeiro / Legal (urgentes)

- [ ] **Abrir empresa em BC, Canadá** — ver `Economizei app/Abertura_Empresa_BC_2026-06-24.md` (passo a passo). Libera: Meta Business, Hotmart, Wise Business.
- [ ] **Converter conta bancária brasileira para CDE** (Conta de Domiciliado no Exterior) ou encerrar. Manter conta corrente comum após saída fiscal é risco jurídico. Consultar contador especializado em brasileiros no exterior.
- [ ] **Registrar na Hotmart** como produtor não-residente (conta vinculada à empresa canadense). Criar os 3 produtos de plano anual (Individual R$99 / Família R$150 / Família+ R$220) com campo customizado de WhatsApp no checkout.

### Técnico financeiro (zona proibida pra máquina)

- [ ] **Construir o webhook Hotmart → `/admin/ativar-pro`**: quando Hotmart confirmar pagamento, acionar o endpoint que já existe e setar `is_pro=true` + enviar boas-vindas Pro. É código que toca pagamento — tem que ser feito e revisado pelo Gabriel.  
  *Arquivos que serão tocados: `src/index.js` (endpoint novo `/webhook/hotmart`) + talvez `src/supabase.js` — todos na zona proibida.*

- [ ] **Desativar / arquivar `src/mercadopago.js`**: o MP foi substituído por Hotmart. O arquivo ainda existe e é zona proibida pra máquina. Gabriel pode renomear pra `_mercadopago.js.bak` ou simplesmente deixar morto (não é chamado diretamente agora).

- [ ] **Expor o ciclo anual no bot**: `/planos` e `/assinar` no `formatter.js` ainda mostram só os preços mensais. Precisam ser atualizados com os valores anuais e como pagar (Hotmart link para anual, PIX Wise para mensal). Toca `src/formatter.js` (zona proibida) — revisar e commitar.

- [ ] **Refletir o pricing anual na `landing/index.html`**: o bloco de pricing mostra só o mensal. Adicionar destaque "Anual — 2 meses grátis". Toca a landing (zona sensível de pricing, revisar com cuidado).

### Git / Infraestrutura

- [ ] **Commitar os arquivos pendentes** (ver Seção 1 — comando pronto).
- [ ] **Limpar GitHub Actions**: `git rm .github/workflows/ci.yml` (se existir), `git rm .github/workflows/claude-nightly.yml`, apagar `pages-ci.yml` (untracked) manualmente. Se tiver branch protection exigindo check "CI", remover.
- [ ] **Responder Open Questions do Agente de Perguntas** (Seção 3.1) para poder criar a tarefa na AGENDA.

### Produto / Decisão

- [ ] **Aprovar ou ajustar o Encurtamento das Mensagens** (Seção 3.2) — manda a palavra e vira código em seguida.
- [ ] **Responder Open Questions do Agente** (Seção 3.1 acima).

---

## 5. 🧪 Migrations SQL — status incerto

Algumas migrations foram criadas em sessões anteriores. O status de execução no Supabase não é verificável daqui.

| Arquivo | O que faz | Status provável |
|---|---|---|
| `migration_categorias_precos.sql` | Adiciona `categoria`, `nome_canonico`, `precos_mercado` | ✅ Provavelmente rodou (F1/F2/F4 funcionam) |
| `migration_2026-06-07_coerencia_outputs.sql` | `itens_compra.preco_total`, `compras.tipo` | ✅ Provavelmente rodou (alertas 3 níveis funcionam) |
| `migration_2026-06-07_idempotencia_messageid.sql` | Tabela `mensagens_processadas` (dedup) | ✅ Provavelmente rodou (commitado em 7047b5c) |
| `migration_003_indicacoes.sql` | Tabela `indicacoes`, colunas `codigo_indicacao`/`features_pro_ate` | ✅ Provavelmente rodou (commitado em 7047b5c) |
| `migration_2026-06-07_assinaturas_mp.sql` | Estrutura de assinaturas do Mercado Pago | ⚠️ **Obsoleta** — MP foi substituído por Hotmart. Verificar se rodou antes de apagar o arquivo. |

> **Como verificar:** no SQL Editor do Supabase, rodar `SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios';` e conferir se `codigo_indicacao`, `features_pro_ate`, `is_pro`, `compras_mes_atual` aparecem.

---

## 6. 📄 Documentos estratégicos — índice rápido

| Documento | Uso |
|---|---|
| `AGENDA.md` | Fila da máquina. Ler toda sessão. |
| `CLAUDE.md` | Memória institucional. Ler toda sessão. |
| `CODE_GUIDE.md` | Padrões técnicos. Ler quando for codar. |
| `Economizei app/Abertura_Empresa_BC_2026-06-24.md` | Passo a passo legal — prioridade imediata |
| `Economizei app/Desenho_Tecnico_Agente_Perguntas_2026-06-18.md` | Arquitetura do Q&A — ler antes de codar o agente |
| `Economizei app/Encurtamento_Mensagens_Bot_2026-06-20.md` | Copy pronta — aprovar e codar |
| `Economizei app/Estrategia_Trafego_Pago_Landing_Pages_2026-06-23.md` | Plano de ads Meta/Google |
| `Economizei app/Forecast_Plano_Anual_2026-06-23.md` | Projeção financeira do plano anual + R$200 |
| `Economizei app/Posicionamento_Norte_Estrategico_2026-06-09.md` | Norte do produto (missão, 3 camadas, Teste de Norte) |
| `Economizei app/Projecao_6_meses.md` | Cenários e gatilhos semáforo |
| `Economizei app/Automacao_Maquina_Noturna.md` | Guia da máquina local |

---

## 7. 🧭 Sugestão de ordem de execução

1. **Agora (hoje):** commitar os arquivos pendentes (Seção 1 — comando pronto).
2. **Esta semana (humano):** iniciar abertura da empresa em BC + configurar Hotmart.
3. **Próxima sessão com Opus:** responder Open Questions do Agente → criar cod-0004 (encurtamento) + cod-0005 (agente) na AGENDA.
4. **Máquina rodando:** cod-0001 → cod-0002 → cod-0003 enquanto as pendências humanas andam em paralelo.
5. **Quando Hotmart estiver pronto:** construir webhook (humano/revisado) + atualizar formatter.js com preços anuais.
