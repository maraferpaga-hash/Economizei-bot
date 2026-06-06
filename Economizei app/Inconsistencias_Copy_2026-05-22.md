# 🔍 Inconsistências de copy encontradas — 2026-05-22

> **Contexto:** depois das decisões de 2026-05-19 (sem benefícios prometidos ao Beta) e 2026-05-22 (paywall PIX dia 1 + sem "Em breve"), vários arquivos ainda têm copy antiga prometendo "3 meses grátis", "preço travado vitalício", "Beta Fundador com benefícios" ou "em breve". Esta lista é inventário para revisão posterior — nada aqui foi corrigido nesta sessão (só CLAUDE.md, landing parcial e src/formatter.js + src/index.js).

> **Critério de gravidade:**
> 🔴 = arquivo executável ou public-facing (gera código ou texto que vai pra produção)
> 🟠 = documento ativo de planejamento (usado pra tomar decisão; trechos antigos podem confundir o time)
> 🟡 = skill/referência interna (pode mal-orientar futuras sessões)
> 🟢 = registro histórico/auditoria (deve manter como está)

---

## 🔴 Crítico — copy que vai pra produção / dirige código

### 1. `Semana1_Agente_Prompts.md`
Prompts pra agente executar a Semana 1 do roadmap. Ainda têm:
- Linha 41-52: instrui criar coluna `beta_fundador` + "Mencionar que como usuário Beta Fundador, vai ganhar benefícios especiais quando o pago chegar"
- Linha 147-198: TAREFA 3 inteira — "adicionar coluna beta_fundador" com texto explicativo "eles receberão benefícios especiais quando o plano pago for lançado (3 meses grátis + preço travado)"
- Linha 371-396: TAREFA pra reescrever boas-vindas mencionando "Beta Fundador", "ganha benefícios", "planos pagos chegam em breve mas quem é fundador ganha benefícios"
- Linha 478: "Você é Beta Fundador — quando vier o plano pago, você ganha 3 meses grátis + preço travado pra sempre"

**O que fazer:**
- Decisão de cohort técnico (2026-05-19) mantém a coluna no banco — pode renomear `beta_fundador` para `cohort_beta_inicial` ou apenas `is_beta` (sem conotação promocional)
- Toda copy de "ganha benefícios", "3 meses grátis", "preço travado" precisa ser removida
- Substituir por explicação honesta dos 4 planos (mesma lógica do `formatter.js` que já foi atualizado)

### 2. `Semana2_Agente_Prompts.md`
Linhas 176-177, 182, 369, 426-436: copy promocional de "Beta Fundador" + "3 meses grátis + preço travado pra sempre" + título "Garante seu lugar como Beta Fundador" + tom "reforça o status especial".

**O que fazer:** mesmo tratamento da Semana 1.

### 3. `Economizei app/Economizei_Plano_Semana_4.md`
Plano da Semana 4 (scheduler de resumo mensal). Tem mensagens antigas embutidas:
- Linhas 397, 460: "🎉 Como *Beta Fundador*, você tem 3 meses grátis do plano Pro quando ele chegar"
- Linhas 735-748: mensagens de bot pro usuário no limite com "Beta Fundador Grátis" + "3 meses grátis + preço travado"
- Linhas 795-814: código de exemplo da `montarMensagemStatusLimite` com `isBetaFundador` retornando texto promocional — **isto JÁ foi corrigido em `src/formatter.js` mas o plano da Semana 4 ainda tem o código antigo como referência**

**O que fazer:** atualizar o plano da Semana 4 pra refletir o código atual do formatter.js (decisão 2026-05-22).

### 4. `marketing/PLANO_MARKETING_90_DIAS.md`
- Linha 105: "Hack de growth: todo usuário que indicar 3 amigos ganha **Premium vitalício**"
- Linha 140: "Lançar referral 'indique 3, ganhe Premium vitalício'"

**O que fazer:** "Premium vitalício" é exatamente o tipo de promessa que a decisão de 2026-05-19 baniu. Substituir o hack por algo viável: "indique 3, ganhe 1 mês grátis do Individual" (com prazo definido) ou simplesmente remover o hack até ter dados.

---

## 🟠 Importante — planejamento estratégico ativo

### 5. `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`
Plano-mestre das 6 semanas, escrito ANTES da decisão de 2026-05-19. Inclui (linhas 158-535):
- Linha 158: tabela de planos como "Grátis (Beta Fundador)"
- Linhas 167-169: "Quando o paywall for ativado, esse grupo recebe: ... Preço de fundador travado vitalício (ex: 30% off perpétuo)"
- Linhas 204, 230, 374, 396, 403, 410: várias menções a "em breve" nos planos pagos
- Linhas 333, 339, 387-419, 430: copy de "Beta Fundador" + "preço travado pra sempre" em vários canais (Instagram, landing copy, mensagens de bot)
- Linha 472, 479, 491: scripts de vídeo/Reels com "vira fundador" como hook

**O que fazer:** este é o documento mais comprometido. Como o roadmap das 6 semanas mudou (paywall PIX dia 1 substitui "validar antes de cobrar"), vale **gerar uma v2 deste plano** em vez de remendar. Sugestão de nome: `Economizei_Plano_Roadmap_v2_2026-05-22.md`.

### 6. `Economizei app/Plano_Redes_Sociais.md`
Linha 212: já tem a regra "Não prometer '3 meses grátis' ou benefícios de beta nas redes — decisão de 2026-05-19". 🟢 **Este está alinhado, não precisa mexer.**

---

## 🟡 Skills internas — orientam futuras sessões

### 7. `skills/economizei-product-principles/SKILL.md`
Linha 49: **"7. Beta Fundador é vitalício. Toda comunicação reforça que quem entra agora ganha preço travado + 3 meses Individual quando o paywall vier."**

**O que fazer:** este princípio está em conflito direto com a decisão de 2026-05-19. Reescrever pra: "Beta é apenas um marcador técnico de cohort. Não há benefício prometido. Comunicação reforça honestidade: plano grátis funciona, planos pagos disponíveis via PIX desde o lançamento."

### 8. `skills/economizei-financial-firewall/SKILL.md`
Linhas 56, 61, 70, 102, 104, 113-124: a skill foi escrita pra ENFORÇAR a decisão de 2026-05-15 (que ainda permitia "3 meses grátis" mas bloqueava "preço travado vitalício"). Depois da decisão de 2026-05-19, **TUDO** está bloqueado.

**O que fazer:** atualizar a skill pra refletir o estado pós-2026-05-19. Mudar a regra de "Beta Fundador tem regras específicas" para "Beta não tem benefícios prometidos, ponto". Todas as âncoras 🟡 sobre "3 meses grátis" agora são 🔴.

### 9. `skills/economizei-copywriter/SKILL.md`
Linha 146: "Justificativa: Princípio 'grátis funciona de verdade' mantido — não bloqueia, só pausa. Ancora o Beta Fundador (preço travado vitalício)."

**O que fazer:** remover "Ancora o Beta Fundador (preço travado vitalício)" da justificativa. Princípio "grátis funciona de verdade" continua válido — só o tipo de ancoragem mudou.

### 10. `skills/economizei-growth-analyst/SKILL.md`
Linha 9: "validar o modelo Spotify + Beta Fundador".

**O que fazer:** trocar "Spotify + Beta Fundador" por "Spotify (free funcional + Pro genuinamente melhor via PIX)".

### 11. `skills/economizei-multi-agent-ops/SKILL.md`
Linha 104: exemplo usa "coluna `beta_fundador` (boolean)" como caso de estudo. Não é problema sério (é exemplo), mas vale modernizar pra `cohort_beta_inicial` se renomear no banco.

### 12. `skills/README.md`
Linha 30: descrição da `economizei-financial-firewall` usa exemplo de "R$ 9,90 vitalício". É registro histórico aceitável — manter ou atualizar o exemplo pra um mais recente.

### 13. `skills/copy-review/SKILL.md` + `checklist.md`
Já estão alinhados com decisão de 2026-05-19. 🟢 **Não precisa mexer.**

---

## 🟢 Registros históricos — não tocar

Estes documentos REGISTRAM as decisões antigas pra dar contexto. Devem manter o histórico intacto:

- `CLAUDE.md` — tabela de Decisões Tomadas tem entradas revogadas com `~~strikethrough~~` apontando pra revogação. Correto.
- `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — auditoria que identificou o problema. Manter.
- `AUDITORIA_2026-05-14.md` — auditoria de código pré-decisão. Manter.
- `Economizei app/Projecao_6_meses.md` — só menciona "sem benefícios prometidos (decisão 2026-05-19)" como premissa. Correto.
- `Economizei app/Projecao_Cenario_Paywall_Dia_1.md` — novo, alinhado.
- `Economizei app/Pendencias_Landing_2026-05-22.md` — meta-doc, alinhado.
- Este arquivo — meta-doc, alinhado.

---

## 📋 Ordem sugerida de correção (quando você retomar)

Priorizar pelo que IMPACTA produção ou execução:

1. **Primeiro** (🔴 produção): Semana1 + Semana2 + marketing 90 dias
2. **Segundo** (🟠 estratégia): regerar `Plano_Roadmap_v2_2026-05-22.md` substituindo `Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md`
3. **Terceiro** (🔴 código de referência): atualizar `Economizei_Plano_Semana_4.md` com formatter.js atualizado
4. **Quarto** (🟡 skills): product-principles → financial-firewall → copywriter → growth-analyst
5. **Quinto** (cosmético): multi-agent-ops + skills/README

## 🧪 Prompt sugerido pra retomar

> "Lê `Economizei app/Inconsistencias_Copy_2026-05-22.md` e me ajude a corrigir os itens em ordem. Começa pelos 🔴 (produção): Semana1_Agente_Prompts.md, Semana2_Agente_Prompts.md, marketing/PLANO_MARKETING_90_DIAS.md. Pra cada arquivo: mostra o que vai mudar antes de aplicar."
