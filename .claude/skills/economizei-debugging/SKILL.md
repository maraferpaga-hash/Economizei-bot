---
name: economizei-debugging
description: Diagnostica e corrige bugs no stack do Economizei (Node.js, Z-API webhook, Gemini 2.5 Vision, Supabase). Use SEMPRE que o bot apresentar comportamento inesperado, erro em produção, falha de OCR, parsing quebrado, timeout, mensagem não entregue, ou regressão após deploy. Não use para feature nova (use product-principles primeiro).
---

# 🐛 economizei-debugging

## Objetivo
Achar e corrigir bugs no bot do Economizei no menor tempo possível, com correção mínima e segura. Cada hora de debug é hora a menos de validação — então o método é cirúrgico.

## Quando usar
- Bot não responde após `oi`.
- Mensagem de cupom não retorna análise.
- Gemini retorna JSON quebrado.
- Supabase falha em salvar compra.
- Z-API webhook retorna 500 ou timeout.
- Deploy quebrou algo que funcionava.
- Logs com erro inesperado.
- Usuário relatou comportamento estranho via WhatsApp.

## Quando NÃO usar
- Para criar feature nova (use `product-principles` primeiro).
- Para testes preventivos (use `economizei-tdd`).
- Quando o "bug" é na verdade decisão de produto ("o limite tá baixo demais") — isso vira `product-principles`.

## Skill companheira obrigatória
**`economizei-automation-triage`** — toda sessão de debug abre com a triagem 🤖/🤝/🛠️/🧍. Reproduzir bug, rodar script de log, executar query SQL = robô. Decidir prioridade do bug, comunicar usuário afetado, decidir rollback = humano. Sem essa separação, o Gabriel gasta a 1h fazendo "tarefa de robô" e o bug crítico fica esperando decisão humana.

## Entradas ideais
- Sintoma exato em palavras do usuário ou descrição do Gabriel.
- Log (ou trecho dele) com timestamp.
- Hora aproximada do problema.
- Recent diff (último commit ou deploy).

## Saídas esperadas
1. **Hipótese principal** (em 1 frase).
2. **Comandos/checagens** específicos pra confirmar (não "verifique os logs" genérico — `grep "ERR" logs/2026-05-13.log`).
3. **Correção mínima** (diff conceitual ou patch).
4. **Como validar** que ficou ok (1 cenário concreto).
5. **Prevenção** futura (linha no `economizei-tdd` ou guard no código).

## Regras de comportamento

### Mapa mental do stack (decorar)
```
WhatsApp do usuário
  ↓ (Z-API webhook)
POST /webhook (Express, src/index.js)
  ↓
roteador: texto ou imagem?
  ↓ se imagem
download via Z-API (src/zapi.js)
  ↓
Gemini 2.5 Flash Vision (src/gemini.js) ← retorna JSON {loja, cnpj, data, total, itens[]}
  ↓
parser → save em Supabase (src/supabase.js)
  ↓
checkAlert (src/alerts.js) ← se >120% média 90d
  ↓
formatter (src/formatter.js)
  ↓
sendMessage via Z-API
```

### Pontos de falha frequentes (priorizar nesta ordem)
1. **Gemini retornou texto que não é JSON puro.** Acontece em cupom borrado, farmácia, ou cupom sem itens visíveis. Parser quebra silenciosamente.
2. **Z-API instance desconectada.** Token expira ou número do bot desconectou do WhatsApp. Mensagem nunca chega.
3. **Supabase erro de schema** (campo NOT NULL faltando, tamanho de varchar excedido em nome de item).
4. **Rate limit Gemini.** 60 reqs/min — usuário em rajada quebra.
5. **Timeout no webhook.** Z-API espera 200 OK em ~10s. Gemini pode demorar 8–15s — perde o webhook.
6. **Encoding de cpf/nome com acento** quebrando no parser.
7. **Imagem muito grande** (>4MB) — Gemini rejeita.

### Princípios de correção
1. **Reproduzir antes de corrigir.** Se não consegue reproduzir, está consertando o bug errado.
2. **Menor diff possível.** Patch focado, não refactor.
3. **Loga antes de blindar.** Adicione log estruturado antes de tratar o erro silenciosamente.
4. **Fail fast em dev, fail safe em prod.** Em produção, sempre devolver mensagem amigável ao usuário ("não consegui ler esse cupom, tenta de novo com foto mais nítida?") mesmo que internamente logue erro.
5. **Idempotência.** Se webhook for chamado 2x pelo mesmo evento, não duplica compra.
6. **Nunca expor stack trace ao usuário no WhatsApp.**
7. **Toda correção em prod gera 1 linha no CLAUDE.md (Aprendizados).**

## Fluxo de execução

```
1. Receber sintoma. Pedir log/horário se não tiver.
2. Mapear no stack mental: onde foi a falha provável?
3. Listar 1–3 hipóteses ranqueadas.
4. Pedir comando exato pra confirmar (logs, query Supabase).
5. Confirmar hipótese.
6. Propor correção mínima como diff.
7. Especificar teste manual de validação (1 cenário concreto).
8. Sugerir guard preventivo + linha pro CLAUDE.md.
```

## Checklist de qualidade
- [ ] A hipótese tá em 1 frase específica (não "algo na integração")?
- [ ] O comando de checagem é executável (não "olhe os logs")?
- [ ] O diff é mínimo (não refactor disfarçado)?
- [ ] O usuário final recebe mensagem amigável se voltar a falhar?
- [ ] Há log estruturado novo onde antes havia silêncio?
- [ ] A correção é idempotente (webhook duplicado não quebra)?
- [ ] Stack trace não vaza pro WhatsApp?

## Erros comuns a evitar
- **Refactor disfarçado.** Bug pequeno vira PR de 500 linhas. Foco.
- **`catch (e) {}` sem log.** Engole o problema, volta semana que vem.
- **Não reproduzir.** Adivinhar corrige bug paralelo, não o reportado.
- **Assumir que Gemini retorna JSON válido.** Sempre validar antes de parsear.
- **Não testar com cupom borrado/farmácia.** São os casos que quebram em prod.
- **Mensagem de erro técnica pro usuário.** "TypeError: cannot read property 'total' of undefined" no WhatsApp — destruidor de confiança.
- **Deploy direto sem reproduzir local.** Especialmente com 1 pessoa, não tem como rollback rápido.

## Snippets úteis

### Validar JSON do Gemini antes de parsear (src/gemini.js)
```js
function safeParseGeminiResponse(text) {
  // Gemini às vezes envolve em ```json ... ```
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    // Validar shape mínimo
    if (!parsed.total || !Array.isArray(parsed.itens)) {
      throw new Error('JSON sem campos esperados');
    }
    return { ok: true, data: parsed };
  } catch (e) {
    console.error('[gemini] parse fail:', { raw: text.slice(0, 200), err: e.message });
    return { ok: false, error: e.message };
  }
}
```

### Idempotência no webhook (src/index.js)
```js
// Usar o messageId do Z-API como chave única
const { messageId } = req.body;
const { data: existing } = await supabase
  .from('eventos_processados')
  .select('id').eq('message_id', messageId).single();
if (existing) {
  console.log('[webhook] duplicado ignorado', messageId);
  return res.status(200).send('ok');
}
// processa...
await supabase.from('eventos_processados').insert({ message_id: messageId });
```

### Resposta amigável ao usuário em qualquer falha
```js
async function sendFallback(phone) {
  await zapi.sendMessage(phone,
    "Putz, não consegui ler esse cupom 😕\n" +
    "Tenta de novo com a foto mais reta e iluminada? " +
    "Se continuar, manda outro cupom — esse pode ter alguma parte cortada."
  );
}
```

## Exemplo de uso prático

**Sintoma reportado:** "Mandei foto e o bot não respondeu nada."

**Aplicação:**

> **Hipótese principal:** Gemini retornou texto que não é JSON válido (provável cupom borrado/farmácia) e o parser jogou exceção que ninguém capturou — webhook retornou 500 silenciosamente.
>
> **Comandos pra confirmar:**
> 1. Ver últimos logs do servidor: `tail -200 logs/app.log | grep -E "(gemini|parse|webhook)"`
> 2. Buscar no Supabase: `SELECT * FROM compras WHERE phone_number = '<X>' ORDER BY created_at DESC LIMIT 3;` — se a última não chegou, confirma.
> 3. Olhar a foto recebida (Z-API tem log das mensagens enviadas — ver se a imagem chegou OK).
>
> **Correção mínima:**
> - Em `src/gemini.js`, envolver o `JSON.parse` no `safeParseGeminiResponse` (snippet acima).
> - Em `src/index.js`, no catch do bloco de imagem, chamar `sendFallback(phone)` antes de responder 200 ao webhook.
> - Adicionar log estruturado: `console.error('[webhook]', {phone, step, err: e.message})`.
>
> **Como validar:**
> Mandar uma foto de algo que NÃO é cupom (uma selfie, ou um cupom de farmácia). O bot deve responder "Não consegui ler esse cupom..." em vez de silêncio.
>
> **Prevenção:**
> Adicionar caso de teste no `economizei-tdd`: "imagem não-cupom retorna fallback ao usuário e loga em vez de explodir".
>
> **Linha pra CLAUDE.md (seção 8):** `Bug 2026-05-13: Gemini quebrava silenciosamente em cupom borrado. Fix: safeParse + fallback amigável. Prevenção: caso de teste cupom inválido.`
