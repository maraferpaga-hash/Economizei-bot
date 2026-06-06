---
name: economizei-tdd
description: Define estratégia de teste enxuta para o bot do Economizei — testes de unidade onde dá retorno alto, smoke tests do webhook, e checklist manual antes de deploy. Use ao adicionar feature crítica, ao corrigir bug que pode regredir, ou ao montar pipeline mínimo de CI. Não use para tentar cobrir 100% — o objetivo é "não quebrar o crítico", não cobertura.
---

# ✅ economizei-tdd

## Objetivo
Garantir que o bot não regrida no caminho crítico (recebe foto → analisa → salva → responde), sem virar um projeto paralelo de testes. Estratégia: pirâmide invertida pra operação solo — pouquíssimos testes, mas estratégicos.

## Quando usar
- Adicionando feature no caminho crítico (parser, salvamento, alerta).
- Corrigindo bug que vale a pena travar com teste.
- Antes de migração técnica importante (Z-API → Meta).
- Definindo o smoke test que roda antes de cada deploy.
- Quando aparece "esse bug eu já consertei antes" — sinal claro de teste faltando.

## Quando NÃO usar
- Pra aumentar cobertura por estética. Cada teste tem custo de manutenção.
- Pra testar UI/landing (smoke manual basta).
- Pra testar integração de terceiros (Gemini, Z-API) — usar fakes/mocks.

## Entradas ideais
- O caminho crítico em foco.
- Bug que motivou (se for o caso).
- Lista de cenários que já quebraram em produção.

## Saídas esperadas
1. **Lista enxuta de testes** (3–8 testes total por módulo, não 30).
2. **Código do teste** com framework de baixo atrito (Vitest/Jest).
3. **Mocks pra dependências externas** (Gemini, Z-API, Supabase).
4. **Checklist manual de smoke test** pré-deploy.
5. **Sugestão de CI mínimo** (GitHub Actions com 1 job).

## Regras de comportamento

### Pirâmide invertida (para operação solo)
```
      ▲
     ╱ ╲       Manual checklist (5 itens)
    ╱   ╲      ←  default. Cobertura: caminho crítico.
   ╱─────╲
  ╱       ╲    Integration (3–5 testes)
 ╱         ╲   ← webhook → resposta, com mocks dos externos
╱───────────╲
              Unit (10–15 testes total)
              ← parser, formatter, alerts, validation
```

### Princípios
1. **Testar o que dói se quebrar.** Parser Gemini, alerta, formatter, validações de input.
2. **Mock o externo.** Nunca chamar Gemini de verdade no teste. Sempre fixture.
3. **1 teste = 1 cenário.** Não teste "fluxo completo" em 1 caso com 30 asserts.
4. **Casos limites importam mais que happy path.** Cupom sem itens, número estranho, JSON malformado.
5. **Nomes de teste = especificação.** `parseGeminiResponse_handles_markdown_wrapper`.
6. **Smoke pré-deploy é manual e cabe em 3min.** Não bloqueia, mas faz.
7. **CI simples > CI completo.** 1 job, rodar tudo, dar verde ou vermelho.
8. **Bug → teste primeiro.** Reproduzir o bug com teste falhando, então corrigir, então o teste passa.

### Casos críticos pra cobrir (priorizados)
1. **Parser de Gemini** com 5 fixtures: JSON puro, JSON com ```json wrapper, texto sem JSON, JSON com campos faltando, cupom de farmácia (estrutura diferente).
2. **Alerta** dispara só com ≥5 compras no histórico e total >120% da média.
3. **Formatter** trunca itens longos, formata moeda em PT-BR, mostra data em DD/MM.
4. **Validação de phone_number** aceita formatos brasileiros (+55, com e sem 9).
5. **Idempotência do webhook** — mesma messageId não duplica.
6. **Limite de cupom mensal** — usuário no 11º cupom recebe mensagem de bloqueio.
7. **safeParseGeminiResponse** retorna `{ok:false}` em vez de explodir.

## Fluxo de execução

```
1. Identificar o caminho crítico em foco.
2. Listar 3–8 cenários (mix de happy + limites + falhas).
3. Mockar Gemini, Z-API, Supabase com mocks simples.
4. Escrever os testes (Vitest preferido — mais rápido que Jest pra Node).
5. Rodar localmente. Garantir <2s.
6. Adicionar ao GH Actions com 1 job (node 18 + npm test).
7. Adicionar smoke checklist no README.
8. Linha no CLAUDE.md se for estrutural.
```

## Checklist de qualidade
- [ ] Cada teste tem 1 cenário claro?
- [ ] Mocks dos externos estão isolados?
- [ ] O teste todo roda em <2s?
- [ ] Os nomes dos testes descrevem o cenário?
- [ ] Casos limites estão cobertos (não só happy path)?
- [ ] Smoke manual cabe em 3min?
- [ ] CI mínimo configurado?

## Erros comuns a evitar
- **Cobertura como meta.** 80% de cobertura testando coisa banal é dívida.
- **Mock complicado.** Mock 200 linhas pra testar 10 linhas = abandonar testes.
- **Teste que chama Gemini de verdade.** Custo + flakiness + lentidão.
- **Não fazer fixture de cupom problemático.** Os bugs que dão estão aqui.
- **CI em 4 jobs paralelos.** Pra projeto solo, complica sem ganho.
- **Não rodar smoke antes de deploy.** Deploy quebra produção, usuário some, retenção morre.

## Snippets prontos

### Setup mínimo (Vitest)
```bash
npm i -D vitest
# package.json
# "scripts": { "test": "vitest run", "test:watch": "vitest" }
```

### Fixture de cupom (test/fixtures/cupom-ok.json)
```json
{
  "loja": "Supermercado Esperança",
  "cnpj": "12.345.678/0001-90",
  "data": "2026-05-10",
  "total": 287.45,
  "itens": [
    { "nome": "ARROZ TIO 5KG", "valor": 28.90, "categoria": "Mercearia" },
    { "nome": "DETERGENTE YPE 500ML", "valor": 3.49, "categoria": "Limpeza" }
  ]
}
```

### Teste de parser
```js
import { describe, it, expect } from 'vitest';
import { safeParseGeminiResponse } from '../src/gemini.js';
import okFixture from './fixtures/cupom-ok.json' assert { type: 'json' };

describe('safeParseGeminiResponse', () => {
  it('parses JSON puro', () => {
    const res = safeParseGeminiResponse(JSON.stringify(okFixture));
    expect(res.ok).toBe(true);
    expect(res.data.total).toBe(287.45);
  });

  it('parses JSON com markdown wrapper', () => {
    const wrapped = '```json\n' + JSON.stringify(okFixture) + '\n```';
    const res = safeParseGeminiResponse(wrapped);
    expect(res.ok).toBe(true);
  });

  it('retorna ok:false em texto sem JSON', () => {
    const res = safeParseGeminiResponse('não consegui ler o cupom');
    expect(res.ok).toBe(false);
  });

  it('retorna ok:false em JSON sem campos esperados', () => {
    const res = safeParseGeminiResponse(JSON.stringify({ foo: 'bar' }));
    expect(res.ok).toBe(false);
  });
});
```

### Mock do Supabase
```js
// test/mocks/supabase.js
export const supabaseMock = {
  from: () => ({
    insert: async (data) => ({ data, error: null }),
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    upsert: async (data) => ({ data, error: null }),
  })
};
```

### Smoke checklist (cole no README)
```markdown
## Smoke test pré-deploy (3 min)
1. [ ] Manda `oi` num número não cadastrado → recebe boas-vindas e msg de consentimento.
2. [ ] Manda foto de cupom OK → recebe resumo com loja, total, top categorias.
3. [ ] Manda foto que NÃO é cupom (selfie) → recebe fallback amigável.
4. [ ] Comando `/meusdados` → recebe resumo dos dados.
5. [ ] Confere log do servidor: zero erros não-tratados nos últimos 5 minutos.
```

### CI mínimo (.github/workflows/test.yml)
```yaml
name: test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm test
```

## Exemplo de uso prático

**Pedido:** "Quero garantir que o parser não quebre mais com cupom de farmácia."

**Aplicação:**

> **Cenários a cobrir (3 testes novos):**
> 1. Cupom de farmácia (estrutura diferente — medicamentos sem categoria limpa) é aceito com `categoria='Saúde'` como fallback.
> 2. Cupom com 0 itens detectados → parser retorna `ok:false` com mensagem específica.
> 3. Cupom com total = 0 ou negativo → rejeita.
>
> **Fixture nova:** `test/fixtures/cupom-farmacia.json` (estrutura real de uma drogaria, em anexo).
>
> **Teste novo:**
> ```js
> import farmaciaFixture from './fixtures/cupom-farmacia.json' assert { type: 'json' };
>
> it('parses cupom de farmácia mesmo sem categoria limpa', () => {
>   const res = safeParseGeminiResponse(JSON.stringify(farmaciaFixture));
>   expect(res.ok).toBe(true);
>   expect(res.data.itens[0].categoria).toBeDefined();
> });
>
> it('rejeita cupom com total <=0', () => {
>   const bad = { ...okFixture, total: 0 };
>   const res = safeParseGeminiResponse(JSON.stringify(bad));
>   expect(res.ok).toBe(false);
> });
> ```
>
> **Validação:** rodar `npm test`. Deve ficar verde. Quando alguém alterar o parser, esses testes pegam regressão.
>
> **Smoke manual:** adicionar item "Manda foto de cupom de farmácia → recebe resumo válido" ao checklist do README.
>
> **Linha pra CLAUDE.md (seção 8):** `Bugfix 2026-05-13: parser tolerante a cupom de farmácia. Cobertura: 3 testes novos + fixture real.`
