---
name: economizei-dual-format
description: Apresenta todo plano, análise, estratégia ou relatório em DOIS formatos empilhados — Resumo executivo (decisão + 3-5 ações + próximo passo de hoje) primeiro, Relatório completo depois. Use SEMPRE em respostas tier 4+ (token-economy), análises, planos, debugs estruturados, revisões de métrica, propostas de feature. Não use em resposta curta (tier 1-3) nem em entrega de texto final (copy pronta).
---

# 🪜 economizei-dual-format

## Objetivo
Garantir que toda saída média/grande seja **scanneável em ≤30 segundos** pelo Resumo, com o Relatório completo logo abaixo pra quem (ou quando) quiser fundo. Gabriel tem 1h/dia — precisa decidir lendo o topo, e só descer se precisar.

## Quando usar
- Toda resposta **tier 4+** do `token-economy` (snippet+análise, doc, diagrama, HTML, sistema).
- Plano de feature, plano semanal, plano de campanha.
- Debug com investigação (não conserto óbvio de 1 linha).
- Revisão de métrica, análise de cohort.
- Auditoria de código/copy/processo.
- Proposta de decisão entre opções.

## Quando NÃO usar
- Resposta tier 1–3 (já cabe em 1 tela — duplicar vira ruído).
- Entrega de **copy final** (a copy é o produto, não análise).
- Código-puro sem narrativa.
- Conversa solta de 1 pergunta → 1 frase.

## Formato padrão

````markdown
## ⚡ Resumo executivo

🎯 **Decisão / Objetivo:** [1 frase, no impressivo]

**Ações principais (3–5 max):**
- [verbo] [o quê] — [quem faz: 🤖/🤝/🛠️/🧍 do `automation-triage`]
- ...

**Hoje (≤1h do Gabriel):** [1 ação concreta, com tempo estimado]
**Próxima sessão:** [o que fica pra depois, em 1 frase]
**Bloqueadores / riscos:** [só se houver — 1 linha]

---

## 📋 Relatório completo

[Análise/plano detalhado: contexto, tradeoffs, alternativas avaliadas, racional, próximos passos por etapa, referências ao CLAUDE.md.]
````

## Regras de comportamento

### As 6 leis do dual-format
1. **Resumo SEMPRE primeiro.** Nunca enterrar a decisão depois do relatório.
2. **Resumo é compressão, não trailer.** Tem que conter a decisão/recomendação real — não "veja abaixo o que penso".
3. **Máximo 5 ações no Resumo.** Se passa de 5, a tarefa está grande demais — divida.
4. **"Hoje" é obrigatório e cabe em 1h.** Se não cabe, decompor até caber, ou marcar como "spillover semanal".
5. **Resumo e Relatório nunca contradizem.** Conclusão é a mesma. Relatório só justifica e amplia.
6. **Separar visualmente.** Heading `## ⚡ Resumo executivo` e `## 📋 Relatório completo` com `---` entre eles. Sem isso, vira papelão único.

### Princípios de compressão do Resumo
- **Verbo no início de cada ação.** "Subir limite de cupom pra 10" > "Aumento do limite".
- **Sem adjetivos vagos.** "Importante", "estratégico", "fundamental" — cortar.
- **Quantificar quando possível.** "Reduz 40% do tempo de debug" > "ajuda no debug".
- **Quem faz vem junto com o quê.** Use 🤖/🤝/🛠️/🧍 do `automation-triage` ao lado da ação.
- **"Hoje" tem tempo estimado.** "30min: rever os 3 hooks de Reels" > "rever os hooks".

### Integração com outras skills
| Skill | Como combina |
|---|---|
| `token-economy` | Decide o tier. Se tier ≥4, este formato entra. |
| `automation-triage` | Cada ação no Resumo carrega 🤖/🤝/🛠️/🧍. |
| `memory-system` | Última linha do Relatório sugere o registro pro CLAUDE.md. |
| `financial-firewall` | Resumo nunca contém número sem source. |

## Fluxo de execução

```
1. Avaliar tier (token-economy). Se ≤3, devolve resposta única.
2. Se ≥4, monta o Relatório completo primeiro (rascunho mental).
3. Comprime para o Resumo executivo:
   - Decisão em 1 frase.
   - 3-5 ações com verbo + quem faz.
   - "Hoje" + "Próxima sessão".
   - Riscos só se houver.
4. Verifica: o Resumo dá pra decidir sozinho?
5. Empilha: Resumo → separador → Relatório.
6. Cortar 20% do Relatório. Quase sempre cabe.
```

## Checklist de qualidade
- [ ] Resumo cabe em 1 tela do desktop / 1.5 tela do celular?
- [ ] Toda ação no Resumo começa com verbo?
- [ ] "Hoje" é concreto e ≤1h?
- [ ] Cada ação carrega 🤖/🤝/🛠️/🧍?
- [ ] Resumo e Relatório têm a MESMA conclusão?
- [ ] Separador visual `---` entre os dois?
- [ ] Sem adjetivo vago no Resumo?
- [ ] Não enterrei número sem source (verificar com `financial-firewall`)?

## Erros comuns a evitar
- **Resumo virou trailer.** "Vou explicar abaixo" — não. Resumo decide.
- **Relatório primeiro, Resumo no fim.** Anula o ganho de leitura rápida.
- **Resumo com 10 ações.** Vira segundo relatório. Comprime.
- **Conclusão diferente.** Resumo diz A, Relatório fica em cima do muro. Alinhar.
- **"Hoje" virou semana.** "Hoje" tem que caber em 1h. Se for mais, é "Esta semana".
- **Resumo sem verbo.** "Análise de retenção" — virou tema, não ação. Use "Calcular retenção W2 do cohort de maio".
- **Esquecer riscos críticos.** Se há bloqueador (ex: "LGPD não pronta trava Meta Ads"), ele vai no Resumo, não enterrado.

## Exemplo de uso prático

**Pedido:** "Aponte o caminho pra rodar o A/B de headline na Semana 2."

**Aplicação (dual-format):**

````markdown
## ⚡ Resumo executivo

🎯 **Decisão:** Lançar A/B de headline na landing — variante "esperto" vs "foto" — com janela de 14 dias e critério de vitória pré-comprometido.

**Ações principais:**
- 🧍 Escolher headline A e B finais (com `copywriter`) — Gabriel decide
- 🧍 Definir métrica primária + critério de vitória (com `experimentation`)
- 🛠️ Montar landing com 2 variantes (HTML + Vercel) — Claude gera, Gabriel revisa
- 🤖 Setup de atribuição (UTM, roteamento 50/50, tracking de chegada do "oi")
- 🤝 Calcular conversão por variante ao fim — Claude gera SQL, Gabriel valida

**Hoje (≤45min):** escolher A e B + critério de vitória. Sem isso, o resto não anda.
**Próxima sessão:** Claude gera HTML das 2 variantes + script de roteamento.
**Bloqueadores:** nenhum por enquanto. Domínio já apontado pra Vercel.

---

## 📋 Relatório completo

**Contexto:** Semana 2 do roadmap. Pesquisa indicou "ser esperto" como frame dominante no público B/C. Hipótese: headline com esse frame converte ≥1.5x a versão genérica.

**Setup proposto:**
[... continua com tabela detalhada de etapas, ROI das automações, kill switch, instrumentação, critério de decisão pré-comprometido — exatamente como no `automation-triage` exemplo, mas como parte do Relatório, não como resposta principal.]

**Linha pra CLAUDE.md (seção 8, ao fim do experimento):**
`Exp A/B headline iniciado em [data]. Critério: [...]. Decisão em [data+14].`
````

A diferença vs antes: o Gabriel lê o Resumo em ~20 segundos e já sabe se aprova ou não. Se aprovar, faz as 2 escolhas de hoje em 45min e fecha a sessão. Só desce pro Relatório se quiser auditar o racional.
