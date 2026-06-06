# 🛠️ Pendências da landing — pausa em 2026-05-22

> **Status:** edição interrompida a pedido do Gabriel. Use este arquivo pra retomar depois.
> **Arquivo afetado:** `landing/index.html`
> **Contexto:** decisão de 2026-05-22 — paywall via PIX ativo desde o lançamento, sem tags "Em breve", waitlist Beta Fundador removida.

---

## ✅ O que JÁ foi feito

1. **Nav CTA** (linha ~1505): trocada de "Entrar no Beta" → "Começar agora", apontando para `#comecar`
2. **Hero badge** (linha ~1525): "Aplicação em desenvolvimento · Beta gratuito" → "Funciona agora · Plano Grátis ou Pro a R$9,90"
3. **Hero CTA group** (linha ~1533): botão principal "Começar agora no WhatsApp" + trust badges ajustados ("Plano grátis funciona de verdade")
4. **Hero ribbon** (linha ~1515): "Vagas Limitadas" → "Direto no WhatsApp"
5. **Pricing — 4 planos** (linha ~1808):
   - Tags "Em breve" REMOVIDAS de todos os planos pagos
   - Nova tag "Ativo via PIX" no Individual, Família e Família+
   - CTAs trocados de "Quero ser avisado" → "Assinar [Plano] via PIX" com link WhatsApp pré-formatado pra cada plano
   - Adicionada footnote sob o pricing explicando o fluxo de PIX manual
6. **Waitlist section** (linha ~1958): REMOVIDA inteira. Substituída por nova seção `#comecar` com 2 cards:
   - "Grátis" → CTA "Começar grátis no WhatsApp"
   - "Pro" → CTA "Assinar Pro via PIX" (link WhatsApp pré-formatado)
7. **CSS** (linha ~1162-1344): bloco `/* ===== WAITLIST ===== */` substituído por `/* ===== COMEÇAR ===== */` com novas classes `.comecar-grid`, `.comecar-card`, `.comecar-card-featured`, `.comecar-tag`, etc.
8. **Regra responsiva** (linha ~1476): atualizada de `#waitlist` para `#comecar` + `.waitlist-box` → `.comecar-card`

---

## ❌ O que FALTA fazer

### 1. Limpar JS órfão do waitlist form (CRÍTICO — vai dar erro no console)

**Localização:** linhas ~2045 a ~2090 em `landing/index.html`

O JS de submit do waitlist form ainda existe mas referencia elementos DOM que foram removidos:
- `document.getElementById('waitlist-form')` — não existe mais
- `document.getElementById('f-nome')`, `f-whatsapp`, `f-plano` — não existem mais
- `document.getElementById('submit-btn')`, `spinner`, `btn-label`, `success-msg` — não existem mais

**O que fazer:** remover todo o bloco do listener de submit do waitlist-form. Manter apenas:
- O `capturarUTMs()` (linhas ~2096-2109) — útil, deixa
- O `resolveVariant()` + headline A/B (linhas ~2111-2141) — útil, deixa
- Remover do listener `submit` em diante até a linha ~2090
- Remover também o `['f-nome', 'f-whatsapp', 'f-plano'].forEach(...)` que vem depois (linhas ~2095 em diante no novo arranjo)

**Também remover do CSS:**
- `.form-group`, `.form-group label`, `.form-group input`, `.form-group select`, `.field-error`, `.form-submit-btn`, `.spinner`, `.success-msg` (estavam no bloco WAITLIST original — verificar se sobrou algum)
- `.success-msg .success-check` (linha ~1370)
- Também `.success-msg` no script

### 2. Buscar e remover quaisquer outras referências a `#waitlist` residuais

```bash
grep -n "waitlist\|#waitlist\|Beta Fundador\|3 meses grátis\|preço travado" landing/index.html
```

Deve voltar zero matches quando estiver limpo.

### 3. Footer (linha ~2040+)

Conferir se o link "WhatsApp do bot" tem texto pré-formatado bom — atualmente abre com "?text=oi". Pode-se manter ou trocar pra algo mais convidativo.

### 4. Meta description e Open Graph

Linhas 9-22 — a meta description ainda menciona "Beta gratuito". Considerar atualizar pra "Plano Grátis funcional + Pro a partir de R$9,90/mês. Pelo WhatsApp."

### 5. Validação no navegador

- Abrir a landing localmente
- Conferir se as âncoras `#comecar` funcionam no scroll suave
- Conferir se os links WhatsApp pré-formatados abrem corretamente (URLs com encoding `%20` etc.)
- Conferir se o console não tem erros JS (vai ter por causa do form órfão)
- Conferir layout em mobile (especialmente os 4 cards de pricing)

### 6. Atualizar endpoint do bot (`/waitlist`)

O JS antes chamava `POST /waitlist` no backend (linha ~2067). Esse endpoint provavelmente ainda existe em `src/index.js`. Decisões possíveis:
- **Opção A:** remover o endpoint (mais limpo)
- **Opção B:** manter o endpoint pra retrocompatibilidade caso alguém tenha link antigo
- **Opção C:** redirecionar pra "envie /planos no WhatsApp"

Decisão recomendada: Opção A — remover endpoint + remover tabela `waitlist` do Supabase (ou só parar de gravar nela).

---

## 🧪 Prompt pra retomar (cole em uma sessão futura)

> "Lê `Economizei app/Pendencias_Landing_2026-05-22.md` e termina o que falta. Especificamente:
> 1. Remove o JS órfão do waitlist-form em landing/index.html (linhas ~2045-2090)
> 2. Remove o CSS de form (`.form-group`, `.field-error`, `.form-submit-btn`, `.spinner`, `.success-msg`) que estão órfãos
> 3. Roda grep pra confirmar zero referências a 'waitlist', 'Beta Fundador', '3 meses grátis' ou 'preço travado' na landing
> 4. Atualiza meta description pra refletir o novo modelo (Plano Grátis + Pro a partir de R$9,90)
> 5. Avalia se remove o endpoint /waitlist do src/index.js (opção recomendada: sim, remover)
> 6. Reporta o estado final pra eu validar no navegador"

---

## 📋 Decisões registradas em 2026-05-22

Ver `CLAUDE.md` seção 8 (Decisões Tomadas), entradas de 2026-05-22:
- Paywall ativo desde o lançamento via PIX manual
- Remoção total de tags "Em breve"
- Waitlist substituída por CTA direto
- Copy do bot reescrita com foco em honestidade
