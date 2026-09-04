# 🎬 AGENDA DE CONTEÚDO — Máquina de Conteúdo do Economizei

> **Irmã da `AGENDA.md` (código).** Mesmo regime: a máquina produz uma **leva** em `estoque_conteudo/`, o Gabriel revisa e **publica com a própria mão**. A máquina nunca publica, nunca gasta, nunca usa git de escrita.
> **Prompt-mãe:** `PROMPT_MAQUINA_CONTEUDO.md` (16 decisões travadas, seção 3). **Desenho:** `Economizei app/Desenho_Maquina_Conteudo_2026-09-03.md`.
> **Criada em:** 2026-09-03 · **Última curadoria:** 2026-09-03 (Fase 0 — piloto entregue, esteira ainda não existe)

**Estado:** Fase 0 entregue (piloto mudo à espera da gravação + veredito). Estoque **1/2** (leva 0001, validade 11/09). Fase 1 (esteira) **bloqueada** até o veredito do piloto. Contas @economizei ainda não existem.

---

## 📐 Protocolo (como a run semanal usa esta agenda)

Toda **quinta** (decisão 2026-09-03), a run:

1. Lê este arquivo + `conteudo/DIARIO_CONTEUDO.md` + `conteudo/historico_formato.json`.
2. **Checa o estoque (3 Regras):** 2 levas não publicadas em `estoque_conteudo/` → **"estoque cheio", não produz** · leva com `validade` vencida → marca `vencida` no `LEVA.md` e avisa · contagem de peças publicadas múltipla de 10 sem `REVISAO_10_PECAS_N.md` respondido → **para e pede veredicto**.
3. **RADAR:** coleta IBGE/SIDRA **pelo browser do Claude** (o sandbox não alcança a API por script — medido 03/09), grava em `conteudo/dados/` com carimbo + `fontes.json`, escreve `conteudo/pauta/AAAA-SS.md` com 5 ângulos ranqueados, **enviesado pelo diário**.
4. **ROTEIRO:** escolhe 3 respeitando a **distribuição por lote** (≥1 comparação com número · ≤1 b-roll · 1 âncora local a cada 5 peças · 1 gravação real a cada 3) e a **rotação anti-template** (abaixo). Carrega `economizei-content-engine` + `economizei-copywriter`. Se a rotação travar, **produz 2 em vez de 3** e relata.
5. **VERIFICAÇÃO:** `scripts/conteudo/verificar.mjs` (Fase 1) — 🔴 **bloqueante:** número sem linha em `fontes.md` · 🟡 advisory: preço de plano, promessa quantificada, garantia, mercado real em tom negativo, feature inexistente (atenção: "alerta preditivo" não existe — B9), superlativo. Ignorar a marca "Economizei" no scan de "economize".
6. **ÁUDIO:** rota A (clone ElevenLabs, 2 de 3) ou rota B (slot `audio/GRAVAR_ISTO.md`, 1 de 3). Sem gravação até a hora de publicar → cai pra A **com aviso no `LEVA.md`** e o `disclosure.md` muda. *(Até o clone existir: peças saem mudas com legenda queimada — só rota B publica.)*
7. **RENDER:** `python3 conteudo/piloto/render_piloto.py` hoje; `scripts/conteudo/render.mjs` parametrizado na Fase 1 (ffmpeg + PIL, sem Chromium; Remotion só se a revisão das 10 peças pedir). 1080×1920 · H.264 · ≤60s · legenda queimada · rodapé de fonte obrigatório.
8. **LEVA:** empacota em `estoque_conteudo/NNNN_AAAA-MM-DD/` com `LEVA.md`, atualiza `historico_formato.json`, move as pautas pra "🔧 Em revisão" aqui, e **para**. Mostra mapa peça→arquivos + skills usadas.
9. **APRENDIZADO** (só depois que o Gabriel publica e cola o export em `conteudo/metricas/AAAA-SS/`): cruza métrica × peça, escreve no diário, e a próxima run nasce enviesada.

**Leitura de git sempre com `GIT_OPTIONAL_LOCKS=0`. Nenhum comando de escrita.**

### 🔁 Rotação anti-template (a máquina se aplica sozinha — `historico_formato.json`)
- Mesma **estrutura de abertura** em 2 peças consecutivas: proibido.
- Mesmo **tipo de pauta** em 3 seguidas: proibido.
- Mesmo **modo visual** em 4 seguidas: proibido.
- Mesma **duração ±3s** em 3 seguidas: proibido.
- **"Você sabia que…"**: nunca.

### 📦 As 3 Regras do estoque de conteúdo
- **REGRA 1 — Cadeia.** Levas numeradas em sequência; cada uma registra no `historico_formato.json` o que usou.
- **REGRA 2 — Teto.** **2 levas não publicadas = cheio.** (Conteúdo envelhece; código não.)
- **REGRA 3 — Validade.** Peça com dado datado carrega `validade:`; vencida não se publica — re-renderiza com dado novo ou morre.

### 🚫 Zona proibida desta máquina
Publicar · criar/autenticar conta · gastar (ElevenLabs, b-roll, qualquer assinatura = Gabriel) · tocar `src/`, `supabase/`, `.env*`, `package.json`, `Dockerfile`, `Procfile`, `scripts/check-firewall.mjs`, `.claude/` · git de escrita · prometer benefício (regra 5) · número sem fonte · dado de usuário sem pseudonimização (LGPD) · Fase 2 (dado próprio) antes do gatilho.

### Estados de uma peça
`pauta` → `em-producao` → `em-revisao` (no estoque) → `publicada` → `medida` · desvios: `bloqueada-humano` (falta dado/gravação/decisão) · `descartada` (volta pra pauta) · `vencida` (validade passou).

### Formato de uma pauta (molde)
```
### [P1] Título / hook provisório
- id: con-000X
- tipo-pauta: comparacao-chocante | conta-da-historia | mito-vs-verdade | pov | persona | hack | reaction
- modo-visual: dado-animado | b-roll
- rota-voz: A-clone | B-gravacao
- ancora-local: sim | não
- dado-central: o número + período
- fonte: id em conteudo/dados/fontes.json
- validade: AAAA-MM-DD
- persona: Carla | Bruno | Marina
- skills: content-engine, copywriter, financial-firewall (+ security-lgpd se tocar dado de usuário)
- status: pauta | em-producao | em-revisao | publicada | medida | bloqueada-humano | descartada | vencida
```

---

## 🎯 Gatilhos e decisões vigentes (2026-09-03)
- **Dia da run:** quinta. Gabriel revisa sexta, publica seg/qua/sex.
- **Fontes Fase 1:** só IBGE/SIDRA (+ calendário de divulgação). **Menor Preço Brasil fora** (sem endpoint oficial, domínio bloqueado no Cowork) — backlog.
- **Gatilho da Fase 2 (dado próprio):** `precos_mercado` com **≥200 cupons de ≥5 mercados distintos na mesma praça**, e **≥20 observações por agregado** antes de virar número público. Até lá, Fase 1. Ao abrir: `economizei-security-lgpd` obrigatória.
- **`verificar.mjs`:** bloqueante para número sem fonte; resto advisory.
- **Render:** híbrido — ffmpeg+PIL agora; Remotion só se a revisão das 10 peças pedir.
- **Piloto reprovado → parar e repensar o formato**, não construir esteira.
- **Kill switch:** na 10ª/20ª/30ª peça publicada a máquina para e escreve `conteudo/REVISAO_10_PECAS_N.md`; só volta com o veredito escrito (REPLICAR · PIVOTAR · MATAR).
- **Métrica:** cascata retenção 3s → saves+shares → mensagens no bot. **Peças 1–10 não são julgadas.** Nível 3 **cego** até a tarefa de atribuição entrar.

---

## 🌙 Fila de pautas (ordem = prioridade; detalhe em `conteudo/pauta/2026-36.md`)

> **Sugestão de leva 0002:** con-0002 + con-0003 + con-0004 (cobre comparação com número, 1 b-roll, 1 âncora local, 1 gravação real, 3 aberturas distintas). con-0005 só se produzida até 08/09. **A leva 0002 só é produzida depois do veredito do piloto.**

### [P1] "Tomate caiu 29% em um mês" — o que comprar agora
- id: con-0002
- tipo-pauta: hack
- modo-visual: dado-animado (abertura: lista que desce)
- rota-voz: A-clone (ou mudo até o clone existir)
- ancora-local: não
- dado-central: variação MENSAL jul/26 — tomate −29,09 · pepino −33,42 · batata −19,59 · cenoura −14,41 · abobrinha −10,49 (+ aviso: cenoura ainda +75% em 12m)
- fonte: ibge-ipca-7060-jul2026
- validade: 2026-09-11
- persona: Carla
- skills: content-engine, copywriter, financial-firewall
- status: pauta

### [P1] "Feijão subiu? Depende de qual." — mito vs verdade
- id: con-0003
- tipo-pauta: mito-vs-verdade
- modo-visual: dado-animado (abertura: pergunta direta)
- rota-voz: A-clone
- ancora-local: não
- dado-central: 12m jul/26 — carioca +47,98 · preto +16,98 · mulatinho +0,37 · fradinho −2,07
- fonte: ibge-ipca-7060-jul2026
- validade: 2026-09-11
- persona: Carla/Bruno
- skills: content-engine, copywriter, financial-firewall
- status: pauta

### [P1] 🏠 "O rancho do mês, item por item" — âncora Fernandópolis
- id: con-0004
- tipo-pauta: persona (Carla)
- modo-visual: b-roll (a única do lote; exige rótulo de IA)
- rota-voz: B-gravacao (peça-âncora)
- ancora-local: sim — vocabulário e cena; **dado é nacional, a peça diz "no Brasil"**; `[mercado local]` como slot (regra 13)
- dado-central: 12m jul/26 — arroz −12,41 · feijão carioca +47,98 · açúcar −17,06 · café −17,20 · óleo −0,80 · leite +7,52 · ovo −5,40 · frango pedaços −4,43
- fonte: ibge-ipca-7060-jul2026
- validade: 2026-09-11
- persona: Carla
- skills: content-engine, copywriter, financial-firewall, security-lgpd (b-roll não pode simular usuário real)
- status: pauta

### [P2] "Sexta o IBGE solta o número. Seu cupom já sabia." — antecipação
- id: con-0005
- tipo-pauta: pov
- modo-visual: dado-animado (abertura: data em tela)
- rota-voz: A-clone
- ancora-local: não
- dado-central: calendário — IPCA ago/26 em 11/09; referência jul/26 (+2,57% 12m alimentação no domicílio); feature `/inflacao` (existe)
- fonte: calendario-ipca-2026 + ibge-ipca-7060-jul2026 + bot-comando-inflacao
- validade: 2026-09-10 (janela dura — depois de 11/09 morre)
- persona: Bruno
- skills: content-engine, copywriter, financial-firewall
- status: pauta

---

## 🔧 Em revisão (no estoque — esperando o Gabriel)

### [P0] "Café −17% × Cenoura +75%" — PILOTO da Fase 0
- id: con-0001
- leva: `estoque_conteudo/0001_2026-09-03/peca-1-cafe-cenoura/`
- tipo-pauta: comparacao-chocante · modo-visual: dado-animado · rota-voz: B-gravacao (PENDENTE) · 30s
- validade: 2026-09-11
- status: em-revisao — **vídeo mudo** até a gravação chegar; veredito da Fase 0 pendente

---

## ✅ Publicadas / medidas
_(nenhuma — 0/10 peças da linha de base)_

---

## 📦 Estoque de conteúdo
| # | Leva | Peças | Criada | Validade | Voz | Disclosure | Estado |
|---|---|---|---|---|---|---|---|
| 0001 | `0001_2026-09-03` | 1 (piloto) | 2026-09-03 | 2026-09-11 | B pendente | não exige | em-revisao |

**Estoque: 1/2.**

---

## 🙋 Ações do Gabriel (só humano resolve)
1. **Gravar os 30s do piloto** — `estoque_conteudo/0001_2026-09-03/peca-1-cafe-cenoura/audio/GRAVAR_ISTO.md` → dropar `narracao.m4a` em `audio/` e avisar. (~5 min)
2. **Veredito da Fase 0:** a peça é publicável? Se sim → Fase 1. Se não → parar e repensar formato (decisão 03/09).
3. **Criar as contas @economizei** no TikTok e no Instagram (a máquina nunca cria/autentica conta). Conferir disponibilidade do handle.
4. **ElevenLabs** (rota A): decisão 🟡 do firewall — custo estimado US$5–22/mês (confirmar no site), alternativa = só rota B (você grava as 3), critério de saída = revisão das 10 peças. Sem contratar, 2 de 3 peças saem mudas. Se contratar: gravar ~3 min de referência.
5. **Medir o tempo de revisão** desta leva e anotar no `LEVA.md` (meta: ~30 min por lote de 3).
6. *(Fase 3)* tarefa de atribuição `wa.me` na `AGENDA.md` principal — molde pronto na seção 9.2 do prompt; vai como `cod-XXXX` pelo `/tarefa` + `/entregar`, provável migration `usuarios.origem` (zona humana). Até lá o Nível 3 é cego.

## ⏳ Aguardando decisão
- Menor Preço Brasil (API não-oficial) — só se a Fase 1 mostrar que IBGE não basta.
- Remotion — só se a revisão das 10 peças pedir visual mais rico.
- API de analytics (OAuth) — só se os 3 min/semana do export manual não bastarem (decisão 13).
