# Sessão de Repriorização da Fila — 2026-07-27 (2ª sessão do dia)

**Contexto:** pós-`/entregar` da manhã (`8588c4b`/`4f49ae7`/`8ad9d4f`/`aebb24a`). Gabriel confirmou: MP e `/assinar` resolvidos, `ZAPI_WEBHOOK_TOKEN` setado no Railway. Pediu: pendências, revisão de encaminhamento e opções de decisão pra destravar a máquina.

## 1. Revisão de encaminhamento (git = verdade, verificado nesta sessão)

- `origin/main` = HEAD = `aebb24a`, working tree limpo. Zero memória stale após reconciliação.
- `src/mercadopago.js` removido; handler de `/assinar` eliminado do `index.js`; `/planos` aponta pro PIX manual (§4.3 da Auditoria Integral **FECHADO**).
- Firewall em advisory confirmado no código (runner sempre exit 0; o exit 1 restante é só do `--selftest`, correto).
- `RELATORIO_MATINAL.md` de 07-27 rodou ANTES do `/entregar` — descreve estado defasado, ignorar.
- Achado novo: **`montarMensagemPix` termina com dica de cartão/renovação automática via `/planos`** — stale pós-MP → backlog **cod-0067**.
- Achado operacional: `.git/index.lock` órfão (0 bytes) deixado pelo git do sandbox; deletar se o git reclamar.

## 2. Decisões do Gabriel (via pergunta estruturada)

1. **Refill da fila:** sobem **cod-0035** (alerta proativo de limite — desbloqueada por cod-0031✅+cod-0033✅) e **cod-0066** (limpeza das funções MP órfãs — **autorização explícita** pra máquina/rotina matinal tocar código financeiro morto no modo advisory). Copy pós-MP e testes de cobertura NÃO priorizados agora (cod-0067 registrada no backlog).
2. **Gate do supérfluo:** **baseline (doces/bebidas) pra todos; `/superfluo` configurável gated no Pro.** Aplicação do gate = desdobramento `Gate_Pro_Desdobramento_2026-07-10.md` (mão do Gabriel).
3. **§4.2 (over-promise "alerta inteligente"):** **entregar o cod-0035 primeiro** — a promessa vira verdade; sem reescrita de copy. Se emperrar, reabrir como encurtamento de promessa.

**Nota do cod-0035:** comando de config proposto **`/teto <termo|categoria> <valor>`** (evita colisão com o `/limite` atual de cota). Nome a ratificar na revisão do diff. Critério anti-A9 embutido: verificar schema de `acompanhamentos` antes de codar; coluna nova → migration escrita e parada pro Gabriel.

## 3. 🔴 Pendências urgentes do Gabriel (em ordem)

1. **Smoke test do webhook AGORA** — token setado ⇒ fail-closed. Se a URL no Z-API ainda for `/webhook` sem token no path, todas as mensagens levam 401 (bot surdo). Mandar `/gastos`/foto; se mudo, reconfigurar URL pra `/webhook/<token>`.
2. **DROP das colunas/tabela MP no Supabase** (deploy já ocorreu; roteiro no `Plano_Financeiro_Firewall_e_Remocao_MP_2026-07-26.md`) + na mesma sentada a **§3.3** (query de schema + RPC `incrementar_compras_mes`).
3. **Saúde do banco:** policy de INSERT em `mensagens_processadas` (RLS quebra a dedup em toda mensagem) + `CREATE TABLE lembretes_enviados`.
4. **Destravar cod-0062/0065:** 2–3 comprovantes PIX + 2–3 recibos de Vancouver + query do CHECK em `compras.tipo`.

## 3.5. Continuação da sessão — cadeia do Assistente (decisão do Gabriel)

- **Pedido inicial:** agir em cod-0005/0007/0008 → apontamento D4 (5/8 entregues, 7 bloqueada por dados) → **acatado**; redirecionou pra cadeia 0043..0049+0018 e mandou a **limpa da AGENDA** (feita: backlog morto removido, Concluído migrado pro snapshot, teto de 10 restaurado).
- **Apontamento D1** (cadeia contradiz o gate de produção de 07-09) → **acato parcial**: aprovou o **híbrido** (0043 follow-up, 0044 sugestões, 0048 gráfico — código puro, sobem) **e antecipou a cod-0049** com racional próprio: *insights proativos pré-programados agora, criando a base pra testar a estrutura; aprimorar depois com o que as pessoas falam* (`perguntas_log`). A 0049 fica **gated até o cod-0035 estar no `origin/main`** (nasce unificada com a infra do alerta de limite).
- **Fila final (ordem):** cod-0035 → cod-0066 → cod-0043 → cod-0044 → cod-0048 → cod-0049 → cod-0062 (com Gabriel) → cod-0065 (com Gabriel). ~6 dias de produção autônoma na rotina matinal.
- **Seguem gated por produção:** cod-0045 (fidelidade_ok), cod-0046 (áudio), cod-0047 (análises por demanda), cod-0018 (chat aberto — último da escada).
- **Webhook auth:** URL do Z-API reconfigurada pelo Gabriel → rollout do cod-0053 COMPLETO (fail-closed no ar).

## 4. Aberto pra próxima sessão (não decidido hoje)

- Sessão de desdobramento das Frentes 1/2 (canal Plaid/app) — gate de tudo do Longo Prazo.
- Microsoft Clarity na landing (instalar já × esperar ads) — `Microsoft_Clarity_Landing_Analytics_2026-07-26.md`.
- Aplicar o gate Pro desdobrado (comparativo + `/superfluo`) — mão do Gabriel.
- Auditorias aud-01..04 (dependem de material do Gabriel).
