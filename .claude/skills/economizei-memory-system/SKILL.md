---
name: economizei-memory-system
description: Mantém o CLAUDE.md vivo, organizado e atualizado como cérebro institucional do Economizei. Use SEMPRE no início de sessão (ler), ao final de sessão (atualizar), e toda vez que uma decisão importante, aprendizado, métrica nova, ou comando explícito do Gabriel surgir. Não use para criar outros tipos de documentação.
---

# 🧠 economizei-memory-system

## Objetivo
Garantir que o `CLAUDE.md` continue sendo a fonte única de verdade da empresa: legível em 10 minutos, fiel ao histórico, e atualizado com cirurgia (sem inchar, sem perder nada).

## Quando usar
- No **início de toda sessão**: ler o CLAUDE.md por completo antes de qualquer outra ação.
- Toda vez que o Gabriel **toma uma decisão**, mesmo que pareça pequena.
- Toda vez que aparece **aprendizado, dado novo, mudança de premissa**.
- Quando o Gabriel der um **comando explícito importante** (registrar literal na seção 10).
- Quando uma seção do CLAUDE.md ficar **maior que 2 telas** e precisar consolidar.
- Antes de **encerrar a sessão**: salvar o que mudou.

## Quando NÃO usar
- Para criar documentos de produto separados (use docx ou markdown direto).
- Para escrever copy ou conteúdo (use as skills específicas).
- Para registrar pensamentos rascunho — só vai pro CLAUDE.md o que tem valor durável.

## Entradas ideais
- O CLAUDE.md atual.
- Uma decisão fechada, aprendizado, ou comando — com data, racional, e área afetada.

## Saídas esperadas
- Edição cirúrgica do CLAUDE.md (`Edit` tool, não `Write`).
- Confirmação do que foi alterado, com diff resumido (não a versão inteira).
- Quando relevante, marcação de item de roadmap como concluído.

## Regras de comportamento

### Princípios da memória
1. **Nunca reescrever o CLAUDE.md inteiro.** Sempre edição pontual.
2. **Cada linha adicionada precisa ganhar seu espaço.** Se for óbvia ou efêmera, fica fora.
3. **Datas no formato ISO** (`2026-05-13`).
4. **Comandos do Gabriel vão na seção 10 com aspas literais.** Não parafrasear o que ele disse.
5. **Decisões vão na tabela da seção 7.** Uma linha. Data | Decisão | Racional curto.
6. **Aprendizados consolidados vão na seção 8** com cabeçalho de mês.
7. **Roadmap concluído vira `[x]`**, não some.
8. **Quando a seção 7 passar de 30 linhas**, oferecer um arquivo `decisoes-historicas-anteriores.md` e manter só as últimas 20 no CLAUDE.md.
9. **Sempre que atualizar**, mudar a "Última atualização" no topo (linha 16).

### Estrutura sagrada (não mexer sem pedir)
Seções 1 (Identidade) e 5 (As 7 áreas) são estruturais. Mudanças aqui exigem confirmação explícita do Gabriel.

## Fluxo de execução

### Modo "Leitura inicial"
```
1. Read no CLAUDE.md (arquivo completo).
2. Resumir mentalmente: estágio atual, última semana do roadmap, decisões recentes (últimas 5).
3. Identificar a área da empresa que o Gabriel quer atacar hoje.
4. Carregar as skills relevantes àquela área.
```

### Modo "Atualização"
```
1. Identificar o tipo de update:
   - Decisão → Seção 7 (tabela).
   - Aprendizado → Seção 8 (consolidado mensal).
   - Comando do Gabriel → Seção 10 (aspas literais).
   - Item de roadmap pronto → Seção 6 (marcar [x]).
   - Métrica nova → Seção 3 (lista de métricas-chave).
   - Mudança de stack → Seção 4.
2. Usar Edit tool com old_string/new_string preciso.
3. Atualizar "Última atualização" no topo.
4. Confirmar ao Gabriel em 2 linhas: "Atualizei: X. Caminho: linha N."
```

### Modo "Consolidação" (a cada 6 semanas ou quando passar de 800 linhas)
```
1. Mover decisões com mais de 60 dias para decisoes-historicas-anteriores.md.
2. Consolidar aprendizados do mês em parágrafo único.
3. Cortar comandos repetitivos do Gabriel (manter os que ainda regem comportamento).
4. Verificar se a seção 5 (áreas) reflete a operação real.
```

## Checklist de qualidade
- [ ] Não escrevi o arquivo inteiro?
- [ ] A data está em ISO?
- [ ] A "Última atualização" foi mudada?
- [ ] A linha nova é durável (não vai virar irrelevante em 2 semanas)?
- [ ] Comando do Gabriel está em aspas literais, sem paráfrase?
- [ ] Diff confirmado em 2 linhas ao usuário?
- [ ] Não desestruturei seções 1 ou 5?

## Erros comuns a evitar
- **Reescrever o CLAUDE.md inteiro.** Quebra o histórico e o git diff.
- **Registrar decisão sem racional.** Em 2 meses ninguém lembra por quê.
- **Parafrasear o Gabriel.** Perde nuance. Seção 10 é aspas literais.
- **Esquecer de marcar roadmap concluído.** O painel mental do Gabriel desencaixa.
- **Adicionar "rascunho" no CLAUDE.md.** Só vai o que dura.
- **Mover decisões antigas sem perguntar.** Confirme antes de consolidar.

## Exemplo de uso prático

**Cenário:** Gabriel acabou de decidir, ao fim da sessão, que vai usar Mercado Pago em vez de Stripe quando o paywall vier.

**Aplicação:**

Edit no CLAUDE.md, seção 7 (Decisões Tomadas):

```
| 2026-05-13 | Mercado Pago será o gateway de pagamento, não Stripe | MP suporta Pix nativo, fundamental para classe B/C; menos fricção no checkout; sem necessidade de conta internacional |
```

Edit no topo:
```
**Última atualização:** 2026-05-13
```

Confirmação ao Gabriel:
> "Registrei a decisão de Mercado Pago como gateway na linha 7 da tabela de Decisões e atualizei a data no topo. Nada mais foi tocado."
