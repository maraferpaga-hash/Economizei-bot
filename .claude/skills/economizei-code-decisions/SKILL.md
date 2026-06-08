---
name: economizei-code-decisions
description: Mantém o CODE_GUIDE.md vivo como memória técnica do Economizei. Use SEMPRE no início de sessão que envolva código (ler), durante decisões técnicas (consultar), e no fim de sessão (atualizar). Dispara quando há escolha de stack/lib, mudança de schema, padrão de error/log, bug interessante resolvido, ou refator estrutural. Não use para decisão estratégica (use memory-system + CLAUDE.md) nem para receita de execução (use debugging/tdd).
---

# 💻🧠 economizei-code-decisions

## Objetivo
Garantir que toda **decisão técnica durável** seja registrada no `CODE_GUIDE.md` e que o guia seja consultado antes de codar. Paralela à `economizei-memory-system`, mas focada em código.

## Quando usar
- **Início de toda sessão de código.** Ler `CODE_GUIDE.md` para alinhar padrões antes de tocar `src/`.
- **Antes de adicionar dependência** (passar pela seção 7).
- **Quando escolher entre 2 abordagens técnicas** (regex vs parser, polling vs cron, etc.).
- **Após resolver bug interessante** (aprendizado vai pra seção 9).
- **Após mudança de schema Supabase** (decisão + migration nomeada).
- **Antes de encerrar sessão de código.** Atualizar seção 8/9 + "Última atualização".

## Quando NÃO usar
- Decisão estratégica/produto (vai pra `CLAUDE.md` via `economizei-memory-system`).
- "Como debugar X" (use `economizei-debugging`).
- "Como testar Y" (use `economizei-tdd`).
- Rascunho de código que ainda vai mudar — só registrar quando estabilizar.

## Entradas ideais
- O `CODE_GUIDE.md` atual.
- Decisão técnica fechada + racional curto + data ISO.

## Saídas esperadas
- Edição cirúrgica do `CODE_GUIDE.md` (`Edit` tool, nunca `Write`).
- Confirmação em 2 linhas do que foi alterado.
- Quando relevante: também atualizar `CLAUDE.md` decisões (se a escolha técnica tem impacto estratégico).

## Regras de comportamento

### Princípios da memória técnica
1. **Edição cirúrgica.** Nunca reescrever o arquivo inteiro.
2. **Datas ISO** (`YYYY-MM-DD`).
3. **1 decisão = 1 linha** na seção 8. Não vire ensaio.
4. **Racional em ≤25 palavras.** Se precisar mais, vira aprendizado (seção 9).
5. **Aprendizado de bug** vira parágrafo curto na seção 9 com "linha-mãe" — a regra prática extraída.
6. **Toda decisão de dependência** menciona substituto nativo considerado.
7. **TODOs ficam na seção 8** com `TODO` na coluna data — vira data quando confirmar.
8. **Quando a seção 8 passar de 30 linhas**, oferecer arquivar as ≥6 meses em `Economizei app/arquivo-historico/CODE_GUIDE_arquivo_AAAA-MM-DD.md`.

### Estrutura sagrada (não mexer sem confirmação)
- Seção 1 (Stack) e Seção 2 (Estrutura de pastas) são mapas. Mudanças exigem comando explícito do Gabriel.
- Seção 4 (Dados sensíveis) é regra de produto — só muda via decisão LGPD registrada em `CLAUDE.md` também.

### Conexão cruzada com CLAUDE.md
Se a decisão técnica tem impacto estratégico (custo, prazo, posicionamento), **registre nos dois**:
- `CODE_GUIDE.md` seção 8 → detalhe técnico
- `CLAUDE.md` seção 7 → decisão estratégica com pointer pro CODE_GUIDE

Exemplo: "Migração Z-API → Meta Cloud API" vai nos dois (operação muda + restrição de mensagem proativa muda).

## Fluxo de execução

### Modo "Leitura inicial" (toda sessão de código)
```
1. Read CODE_GUIDE.md inteiro.
2. Resumir mentalmente: stack atual, últimas 5 decisões, aprendizados recentes.
3. Identificar a área do código que vai ser tocada.
4. Carregar skills técnicas complementares (debugging / tdd / security-lgpd) conforme tópico.
```

### Modo "Atualização" (decisão nova ou aprendizado)
```
1. Identificar tipo de update:
   - Decisão técnica → Seção 8 (tabela).
   - Aprendizado de bug → Seção 9 (parágrafo com linha-mãe).
   - Nova dependência → Seção 1 (lista) + Seção 8 (decisão).
   - Mudança de estrutura → Seção 2 + Seção 8.
   - Nova env var → Seção 1 (env vars) + .env.example.
2. Edit cirúrgico.
3. Atualizar "Última atualização" no topo.
4. Se há impacto estratégico, refletir no CLAUDE.md também.
5. Confirmar ao Gabriel em 2 linhas.
```

### Modo "Consulta" (antes de escolher abordagem)
```
1. Ler seção 3 (padrões) + seção 8 (decisões em vigor).
2. Procurar precedente: já decidimos algo parecido?
3. Se sim → seguir o padrão; se quer divergir, justificar.
4. Se não → propor a decisão, registrar quando fechar.
```

## Checklist de qualidade
- [ ] Não reescrevi o arquivo inteiro?
- [ ] Data em ISO?
- [ ] "Última atualização" no topo está em sincronia?
- [ ] Linha de decisão é curta (≤25 palavras de racional)?
- [ ] Aprendizado de bug tem "linha-mãe" (regra prática)?
- [ ] Se a decisão é estratégica também, atualizei o CLAUDE.md?
- [ ] Confirmei em 2 linhas?

## Erros comuns a evitar
- **Misturar decisão técnica em CLAUDE.md** (e vice-versa). Confunde memória estratégica com técnica.
- **Registrar "qual lib eu testei e descartei".** Só decisão fechada entra.
- **Aprendizado virar diário de campo.** 1 parágrafo, com linha-mãe. Se precisa mais, vai pra `docs/`.
- **Adicionar dependência sem registrar.** Em 2 meses ninguém lembra por quê.
- **Esquecer de atualizar `.env.example`** quando adicionou env var.
- **Mover decisões antigas sem ofertar arquivamento.** Tem que rolar com a consolidação dos 6 meses.

## Exemplo de uso prático

**Cenário:** Gabriel decidiu trocar `console.log` por `pino` para logs estruturados em JSON.

**Aplicação:**

Edit no `CODE_GUIDE.md`, seção 8 (Decisões técnicas em vigor):

```
| 2026-06-XX | Migração de console.log para pino (logger JSON estruturado) | console.log dificulta filtro/observabilidade no Railway; pino é zero-config, fast, JSON nativo. Substituto nativo considerado: usar console.log com JSON.stringify — descartado por boilerplate. |
```

Edit em seção 1 (Dependências críticas):
```
- `pino` — logger estruturado.
```

Edit em seção 3 (Logging):
```
Antes: console.error('[modulo]', {...})
Agora: logger.error({ modulo: 'gemini', evento: 'json_invalido', err: e.message })
```

Edit no topo:
```
**Última atualização:** 2026-06-XX
```

Confirmação ao Gabriel:
> "Registrei pino na seção 1 e seção 8 do CODE_GUIDE.md, atualizei o padrão de logging na seção 3 e a data no topo. Próximo passo: substituir uses em src/ (não toquei nada fora do guia)."
