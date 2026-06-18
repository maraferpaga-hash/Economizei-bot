---
name: copy-review
description: Audita uma landing page ou peça de copy em pt-BR contra um checklist de princípios (hierarquia visual, framing cultural brasileiro classe B/C, CTAs, prova social, objeções endereçadas, fricção de leitura). Aceita URL ao vivo OU bloco de texto colado. Devolve relatório classificado por severidade. Dispare quando o usuário disser "revise essa landing", "avalia essa copy", "olha pra mim essa página", "/copy-review", ou apontar uma URL pedindo opinião sobre o texto/mensagem.
---

# Copy Review — Auditoria de Landing & Copy (pt-BR, foco B/C)

## Quando usar

- Usuário aponta uma URL ("avalia economizei.space pra mim").
- Usuário cola um bloco de copy/headline/CTA e pede opinião.
- Antes de subir mudança importante na landing (revisão pré-deploy).
- Quando o cliente diz "tá esquisito mas não sei o quê".

## Princípio orientador

O leitor da copy do Economizei é classe B/C brasileira, 25-55 anos, baixa tolerância a atrito, lê com pressa no celular. **Não é** persona americana de produtividade, **não é** early adopter tech, **não é** "decision maker". Frame cultural: "ser esperto, não dar mole, saber das coisas". Toda análise deve ser feita por essa lente.

## Fluxo de execução

### Passo 1 — Coletar a copy

Se URL: usar `mcp__workspace__web_fetch` (ou Chrome MCP se for app client-rendered) pra puxar o texto. Se vier shell vazio com JavaScript ("enable JS"), escalar pro Chrome MCP. Se o usuário colou texto: usar direto.

Extrair em ordem de aparição: headline, sub-headline, badges/selos, blocos de seção (com título), CTAs (texto exato e cor/peso visual quando disponível), prova social, FAQ, pricing, footer.

### Passo 2 — Avaliar contra o checklist

Ler `checklist.md` (na mesma pasta da skill). Cada item gera 0, 1 ou 2 problemas. Anotar tudo.

### Passo 3 — Gerar relatório

Estrutura obrigatória do relatório (markdown):

```
# Copy Review — <nome ou URL>
Data: <YYYY-MM-DD> · Avaliador: Claude (skill copy-review)

## TL;DR
<3-5 linhas: o que está bom, o que está crítico, e a 1 mudança de maior impacto>

## Problemas críticos (🔴)
<itens que mudam decisão de compra ou criam objeção bloqueante>

## Problemas importantes (🟠)
<itens que reduzem conversão mas não impedem>

## Atritos menores (🟡)
<itens de polimento>

## O que está bom (manter)
<reforçar para não regredir em edição futura>

## Sugestões de A/B test
<2-3 testes acionáveis com hipótese, variante A, variante B, métrica>

## Apêndice — Checklist completo
<tabela: item, status (✅/⚠️/❌), nota curta>
```

### Passo 4 — Entregar

Salvar relatório em `C:\Economizei\Economizei app\copy-reviews\<YYYY-MM-DD>_<slug>.md` e apresentar via `mcp__cowork__present_files`. Mostrar TL;DR + 3 problemas mais críticos inline na resposta do chat (resto fica no arquivo).

## Anti-padrões a evitar no relatório

- **Não ser genérico.** Cada problema tem que citar o trecho exato da copy ("Na headline 'X', a palavra Y...").
- **Não copiar regra americana cega.** "Use uma CTA acima da dobra" pode ser falso se a página BR pedir contexto antes. Justificar.
- **Não sugerir mais de 3 testes A/B por vez.** O usuário tem 1h/dia.
- **Não escrever copy substituta sem ser pedido.** Apontar problema + dar direção, não reescrever a página.
- **Não inflar de elogios.** A seção "O que está bom" existe pra registrar âncoras, não pra dourar.

## Conexão com o projeto Economizei

- Princípio cultural canônico está em `CLAUDE.md` seção 2 (Público-Alvo) e seção 5 (Distribuição → framing cultural).
- Personas (Carla, Bruno, Marina) em `CLAUDE.md` seção 2 — toda copy deve servir pelo menos 2 das 3.
- Pesquisa qualitativa com linguagem real do usuário em `Economizei app/Economizei_Analise_Pesquisa_e_Plano_6_Semanas.md` — usar como banco de palavras emocionais reais.
- Auditoria estratégica em `Economizei app/Auditoria_Consultoria_Economizei_2026-05-19.md` — não promete benefícios financeiros (sem 3 meses grátis, sem preço travado).
