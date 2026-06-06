---
name: economizei-financial-firewall
description: Firewall entre decisões financeiras (preço, duração de benefício, garantia, custo operacional, budget) e qualquer texto público (landing, bot, anúncio, post, email). Use ANTES de publicar qualquer copy que toque número, preço, duração, garantia, benefício quantificado. Use ANTES de fechar custo com terceiro ou definir orçamento de marketing. Não use para pesquisa interna sem publicação.
---

# 🔥💸 economizei-financial-firewall

## Objetivo
Impedir que **compromisso financeiro** vaze pra **comunicação pública** sem aprovação explícita do Gabriel + registro no CLAUDE.md. O caso de referência (2026-05-15): "R$ 9,90 travado pra sempre / preço congelado vitalício" escapou pra landing sem ser uma decisão fechada. Esta skill existe pra que isso não se repita.

## Quando usar
- **Antes de publicar** qualquer texto que vá pro usuário final: landing, bot, anúncio, post, email, vídeo.
- **Antes de fechar** contratação de serviço pago (gateway, hosting, ferramenta).
- **Antes de definir** budget de ads / parceria paga.
- **Antes de aceitar** cupom/desconto/promoção que terceiros sugiram.

## Quando NÃO usar
- Pesquisa interna sem publicação (análise de pricing no chat, brainstorm).
- Análise de custo histórico no DRE.
- Decisão de produto sem componente público (use `product-principles`).

## As 3 zonas de risco (sempre classificar)

### 🔴 BLOQUEIO — publicação pública com compromisso quantificado
Não pode sair sem **(a)** decisão registrada na seção 7 do CLAUDE.md confirmando o número/duração, **ou** **(b)** aprovação explícita do Gabriel na sessão atual.

Detectar por palavras-chave:
- **Preço:** `R$`, `reais`, `/mês`, `por mês`, `por ano`, `%`, "grátis para sempre", "de graça".
- **Duração de benefício:** "vitalício", "para sempre", "travado", "congelado", "garantido para sempre", "X meses grátis", "primeiros X usuários".
- **Garantia:** "reembolso", "satisfação garantida", "devolução", "se não gostar".
- **Cashback/desconto:** "cashback", "X% off", "primeiro mês grátis", "indica e ganha".
- **Comparação:** "mais barato que [concorrente]", "X% menor que".
- **Limite quantificado público:** "ilimitado", "sem limite", "infinito" (cuidado — `10 cupons no Free` é técnico, mas "ilimitado" no Pago vira promessa).

### 🟡 REVISÃO — decisão operacional com custo
Gabriel decide. Claude propõe estimativa + traz tradeoff. Nada sai pro mundo.

- Contratação/upgrade de serviço pago (Stripe, Mercado Pago, Vercel Pro, etc.).
- Upgrade de tier de API (Gemini, Supabase, Z-API).
- Orçamento de Meta Ads / Google Ads.
- Pagamento a influenciador / parceria paga.
- Compra de domínio / hospedagem / ferramentas.

### 🟢 INFORMATIVO — custo já decidido, registrar
Só registra (CLAUDE.md seção 8 ou em arquivo financeiro separado se for recorrente).

- Custo mensal recorrente já incorrido (Gemini, Z-API, Supabase).
- Atualização de unit economics (LTV, CAC, margem).
- DRE mensal.

## Regras de comportamento

### As 6 leis do firewall
1. **Toda promessa financeira pública precisa de source of truth.** Source = linha na tabela de Decisões (seção 7) ou Modelo de Negócio (seção 3) do CLAUDE.md. Sem source, corta a promessa.
2. **Default é cortar a promessa, não inventar.** Em dúvida, retira o número/duração da copy e mantém o conceito sem compromisso ("plano pago genuinamente melhor" > "R$ 9,90 travado vitalício").
3. **"Beta Fundador" tem regras específicas (decisão 2026-05-15):** OK falar "3 meses grátis quando paywall abrir" e "acesso antecipado/preço de fundador". NÃO OK falar "preço travado vitalício" ou "preço de fundador vitalício".
4. **Custo operacional não vai pra copy pública.** "A gente paga R$ X por cupom" — nunca aparece pro usuário.
5. **Toda decisão 🟡 precisa de 3 dados antes de aprovar:** custo mensal estimado, alternativa mais barata avaliada, critério de desativação.
6. **Compromisso financeiro fechado vira linha no CLAUDE.md no mesmo passo.** Senão volta a virar discussão em 2 semanas.

### Regra do Beta Fundador (caso especial)
Permitido na copy pública:
- "Beta gratuito"
- "Aplicação em desenvolvimento"
- "Vagas limitadas"
- "3 meses do plano pago quando o paywall abrir" *(é decisão registrada na seção 7)*
- "Acesso antecipado"

Proibido na copy pública (decisão 2026-05-15):
- "Preço travado pra sempre / vitalício / para sempre"
- "R$ 9,90 garantido pro resto da vida"
- "Preço de fundador congelado"
- Qualquer número de plano pago em destaque, já que o pricing ainda não foi validado (Semana 6 do roadmap)

## Fluxo de execução

```
1. Receber o texto/decisão a revisar.
2. Escanear por palavras-chave das 3 zonas (🔴/🟡/🟢).
3. Para cada item detectado:
   a. Classificar zona.
   b. Cross-check com CLAUDE.md seções 3 (Modelo) e 7 (Decisões).
   c. Se 🔴 sem source → marcar BLOQUEADO, propor versão sem compromisso.
   d. Se 🟡 → listar os 3 dados que o Gabriel precisa pra decidir.
   e. Se 🟢 → propor linha de registro.
4. Devolver:
   - Lista de itens detectados (tier + status + ação).
   - Versão corrigida do texto (se 🔴).
   - Pergunta ao Gabriel se há aprovação na sessão (se 🔴 sem source).
5. Após aprovação, sugerir linha pra CLAUDE.md seção 7.
```

## Checklist de qualidade
- [ ] Escaneei TODOS os números/durações/garantias do texto?
- [ ] Cada item 🔴 tem source no CLAUDE.md OU pergunta explícita ao Gabriel?
- [ ] A versão corrigida ainda comunica valor sem inventar compromisso?
- [ ] Itens 🟡 vieram com 3 dados (custo, alternativa, critério de saída)?
- [ ] Compromisso aprovado tem linha pra registrar no CLAUDE.md?
- [ ] Custo operacional não vazou pra copy pública?

## Erros comuns a evitar
- **Inventar número "que soa bem".** "R$ 9,90 vitalício", "primeiros 100 grátis pra sempre" — sem decisão = corta.
- **Confundir "intenção interna" com "compromisso público".** Gabriel discutindo no chat "talvez 9,90" não é decisão. Só vira pública quando entra na seção 7.
- **Misturar 3 tipos de "fundador"** (acesso antecipado / 3 meses grátis / preço travado). O 3º foi removido em 2026-05-15.
- **Achar que "grátis" é seguro.** "Grátis pra sempre" é compromisso financeiro pesado (vai bancar com quê?).
- **Aprovar custo 🟡 sem critério de saída.** "Vou rodar R$ 100 em Meta Ads" sem definir "quando paro" = vazamento contínuo de runway.
- **Esquecer de registrar a decisão.** Aprovou, esqueceu, em 2 semanas tá discutindo de novo.
- **Custo de Gemini/Z-API aparecer na copy.** "Pagamos por cupom" — quebra magia, e o usuário não tem por que saber.

## Exemplo de uso prático

**Texto submetido (rascunho de bloco da landing):**
> "Garante seu lugar no Beta Fundador!
> R$ 9,90 travado pra sempre quando o paywall abrir.
> 3 meses do plano Individual de cara, e seu preço fica congelado vitalício."

**Aplicação da skill:**

| Item detectado | Zona | Status | Ação |
|---|---|---|---|
| "Beta Fundador" | 🔴 (palavra crítica) | OK | Decisão 2026-05-15 reformulou — só "Beta gratuito" / "vagas limitadas". Trocar. |
| "R$ 9,90 travado pra sempre" | 🔴 | **BLOQUEADO** — sem source. Decisão 2026-05-15 removeu vitaliciedade. | Cortar. |
| "3 meses do plano Individual" | 🔴 | OK — decisão registrada seção 7 (2026-05-08, mantida). | Manter. |
| "preço fica congelado vitalício" | 🔴 | **BLOQUEADO** — explicitamente removido 2026-05-15. | Cortar. |

**Versão corrigida:**
> "Garante seu lugar — vagas limitadas no Beta gratuito.
> Quando o paywall abrir, você ganha 3 meses do plano Individual.
> Acesso antecipado e prioridade pra moldar o produto com a gente."

**Próximo passo:** publicar essa versão. Sem nova linha no CLAUDE.md (a decisão já existe em 2026-05-15).

---

**Cenário 🟡:** Gabriel pergunta "posso rodar R$ 200 em Meta Ads na Semana 5?"

**Aplicação:**

> Zona 🟡. Antes de aprovar, preciso de 3 dados:
> 1. **Custo total previsto:** R$ 200 + custo de criativo (se pago) + custo do operacional do Gabriel (1h pra setup conta + criativo). Total real ≈ R$ 200.
> 2. **Alternativa mais barata:** postar nos 5 grupos de economia/WhatsApp identificados na pesquisa (custo = 30min de tempo do Gabriel, alcance estimado 1000 olhares vs ~3000 com R$ 200 em Meta).
> 3. **Critério de saída:** se em 7 dias o CAC > R$ 40, parar.
>
> **Pré-requisitos LGPD não atendidos:** política/termos/DPO ainda não publicados (ver `security-lgpd`). **Resolver isso bloqueia o gasto.**
>
> Se aprovar após LGPD pronto, registrar:
> `| 2026-05-XX | Meta Ads R$ 200 na Semana 5 | Critério saída: CAC>R$40 em 7d para. Alternativa orgânica rodando em paralelo. |`
