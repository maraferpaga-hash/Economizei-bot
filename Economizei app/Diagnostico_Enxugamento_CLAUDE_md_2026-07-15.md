# 🩺 Diagnóstico & Plano de Enxugamento do CLAUDE.md — 2026-07-15

> Sessão de revisão da memória institucional pedida pelo Gabriel: encontrar repetições, verificar o limite combinado e propor condensação. **Nenhum corte foi executado ainda — este doc é a proposta pra aprovação.**

---

## 1. O limite que você lembrava — e ele foi estourado

O limite vive na skill **`economizei-memory-system`** (criada nas primeiras sessões):

| Regra da skill | Limite | Estado hoje | Veredito |
|---|---|---|---|
| Consolidação do CLAUDE.md | **> 800 linhas** dispara consolidação | **1.187 linhas** | 🔴 estourado em ~48% |
| Tabela de Decisões (seção 8) | **> 30 linhas** → arquivar, manter últimas 20 | **75 linhas** | 🔴 estourado em 2,5× |
| Cadência de consolidação | a cada **6 semanas** | última foi **2026-06-04** (6 semanas atrás) | 🟡 vencendo agora |
| Legibilidade | "legível em 10 minutos" | ~236 KB ≈ **60–70 mil tokens** | 🔴 impossível |

**Custo real do inchaço:** o boot de toda sessão lê CLAUDE.md + AGENDA.md + CODE_GUIDE.md + PROJECT_INSTRUCTIONS.md = **~343 KB ≈ 85–95 mil tokens** — quase metade da janela de contexto consumida antes de a sessão começar. Isso degrada a qualidade de toda sessão (menos espaço pra código, docs e raciocínio) e é exatamente o risco que a skill previa.

## 2. Onde está o peso (medido, não estimado)

| Bloco | Linhas | Bytes | % do arquivo |
|---|---|---|---|
| **Seção 11 — Histórico de comandos** | 544 | 75,0 KB | 32% |
| **Seção 8 — Decisões Tomadas** | 87 | 71,3 KB | 30% |
| **Seção 1 — Identidade** (por causa da linha "Última atualização") | 56 | 44,0 KB | 19% |
| Todas as outras 9 seções somadas | ~500 | ~45 KB | 19% |

**O achado central:** a linha **"Última atualização"** da seção 1 tem **38,6 KB num único parágrafo** — ela virou um log corrido de TODAS as sessões desde junho, coladas umas nas outras. Sozinha, essa 1 linha pesa mais que 9 seções inteiras juntas.

## 3. A repetição estrutural (o problema de raiz)

Cada sessão de trabalho hoje é registrada em **até 4 lugares**, com o mesmo conteúdo:

1. Parágrafo narrativo completo na linha "Última atualização" (seção 1)
2. Linha-ensaio na tabela de Decisões (seção 8) — células com 200–400 palavras
3. Registro verbatim + narrativa na seção 11 (Histórico de comandos)
4. **Doc de sessão dedicado em `Economizei app/`** — que já existe pra quase toda sessão relevante

Ou seja: o detalhe **já está preservado nos docs de sessão**. O CLAUDE.md está triplicando (às vezes quadruplicando) o que já tem casa própria. Exemplo concreto: a sessão do Gate Pro de 07-10 aparece na "Última atualização", na tabela de decisões (parágrafo enorme) E tem o doc `Gate_Pro_Desdobramento_2026-07-10.md` completo.

## 4. Plano proposto — 3 cortes + 1 regra anti-reinchaço

**Nada é deletado.** Tudo que sai vai pro `Economizei app/arquivo-historico/` (mesmo precedente da limpeza de 2026-06-04), e o git preserva o histórico integral de qualquer forma.

### Corte 1 — "Última atualização" vira 3 linhas (44 KB → ~0,5 KB)
Passa a ser só: data + 1 frase da última sessão + pointer "histórico completo de sessões: ver tabela de Decisões e arquivo-historico". O log corrido inteiro move pra `arquivo-historico/SESSOES_arquivo_2026-07-15.md`.

### Corte 2 — Tabela de Decisões volta pra regra da skill (71 KB → ~8 KB)
- Manter as **últimas ~20 decisões**, cada uma comprimida pra **1–2 linhas**: decisão + racional de 1 frase + pointer pro doc de sessão quando existir.
- As 55+ anteriores movem íntegras pra `arquivo-historico/DECISOES_arquivo_2026-07-15.md`.
- Decisões-princípio que regem comportamento permanente (firewall, "máquina nunca commita", classificação é o coração, W2 ≥ 30%, gíria só em marketing) **não dependem da tabela** — já vivem nas seções 1–7 e nas skills, então nada se perde de operacional.

### Corte 3 — Seção 11 vira "regras vivas", não diário (75 KB → ~8 KB)
A skill já previa: *"cortar comandos repetitivos, manter os que ainda regem comportamento"*. Ficam só os **comandos verbatim que criaram regra permanente** (ex.: exclusão de benefício Beta, gíria só em marketing, classificação é o coração, plano-e-segue). As narrativas de sessão movem pro arquivo-historico — os detalhes já existem nos docs de sessão de qualquer forma.

### Regra nova — teto por sessão (pra não reinchar em 2 meses)
Cada sessão futura registra **no máximo**:
- **1 linha** na tabela de Decisões (com pointer pro doc de sessão em `Economizei app/`)
- **1 frase** na "Última atualização"
- Verbatim na seção 11 **somente** se criar regra permanente de comportamento
- O detalhe completo mora **só** no doc de sessão — fim da triplicação

Registrar essa regra na própria skill `economizei-memory-system` (pedir pro Gabriel colar, já que `.claude/` é protegido no Cowork) e no PROJECT_INSTRUCTIONS.md.

## 5. Resultado esperado

| Métrica | Hoje | Depois do enxugamento |
|---|---|---|
| CLAUDE.md | 236 KB / 1.187 linhas | **~55–65 KB / ~550–600 linhas** (−73%) |
| Boot total de sessão | ~343 KB (~90k tokens) | **~165 KB (~43k tokens)** |
| Limite de 800 linhas | 🔴 estourado | 🟢 com folga de ~25% |
| Informação perdida | — | **Zero** (tudo em arquivo-historico + git + docs de sessão) |

## 6. Fora do escopo deste corte (mas no radar)

- **AGENDA.md (70 KB):** também lida em todo boot; as tarefas concluídas antigas podem migrar pra um `AGENDA_arquivo`. Sugiro fazer numa rodada separada pra não misturar com a reconciliação de fila em andamento (4 tarefas em revisão).
- **Arquivos órfãos na raiz** (candidatos a mover pra `Economizei app/` ou arquivo-historico, não são lidos no boot): `AUDITORIA_2026-05-14.md`, `Semana1/2_Agente_Prompts.md`, `PROMPT_NOTION.md`, `PROMPT_COPY_WHATSAPP.md`, `Economizei_Plano_Producao_Videos.md`. Só organização de pasta, zero urgência.

---

*Execução pendente de aprovação do Gabriel — a skill de memória exige confirmação antes de consolidar/mover decisões antigas.*
