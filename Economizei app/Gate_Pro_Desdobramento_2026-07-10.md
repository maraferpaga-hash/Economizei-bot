# 🔓 Gate Pro (A1) — Desdobramento com snippets prontos

> **Data:** 2026-07-10 · **Decisões do Gabriel nesta sessão:** Pro vê até **10** comparativos (env `COMPARATIVO_MAX_PRO`); teaser Free faz **upsell honesto citando /planos**; entrega em **doc com snippets** (código financeiro não sai das mãos do Gabriel).
>
> **O que este doc fecha:** o achado **A1 🔴** da auditoria de 06-25 — o pago hoje entrega só "cupons ilimitados"; comparativo e alerta Pro são promessa sem gate. Com os snippets abaixo aplicados, o comparativo vira feature Pro real (com teaser Free) e a cadeia do Alerta Pro (cod-0032/0033/0035) fica destravada pra fila.
>
> ⚠️ **Firewall:** todos os snippets contêm `temFeaturesProAtivas`/menção a plano — o `npm run check:firewall --working` vai **acusar de propósito**. É o comportamento desenhado: você revisa o diff consciente e commita com `git push --no-verify` se o hook barrar. Nunca peça pra máquina aplicar isto.

---

## Peça 1 — Gate no `/comparar` (3 edits + 1 env)

### 1a. `src/index.js` — import (linha ~38, dentro do require de `./supabase`)

Adicionar à lista:

```js
  temFeaturesProAtivas,
```

### 1b. `src/index.js` — handler (linha ~487)

O `processarTexto` já tem `usuario` na mão (linha 371, e o select do `upsertUsuario` já traz `is_pro` + `features_pro_ate`). Só passar adiante:

```js
  if (ehComando('/comparar', 'comparar', '/comparativo', 'comparativo')) {
    await mostrarComparativo(phone, usuario);
    return;
  }
```

### 1c. `src/index.js` — `mostrarComparativo` (linha ~681)

```js
// Comparativo entre mercados (/comparar) — cod-0020 + gate Pro (A1, ligado 2026-07-10).
// Free: teaser de COMPARATIVO_AMOSTRAS_FREE itens (default 3) + upsell honesto.
// Pro (temFeaturesProAtivas = assinante OU janela de recompensa de indicação):
// até COMPARATIVO_MAX_PRO itens (default 10 — teto por tamanho de mensagem).
async function mostrarComparativo(phone, usuario) {
  try {
    const { observacoes, produtosDoUsuario, lojaDoUsuario } = await buscarObservacoesComparativo(phone);
    const ehPro = temFeaturesProAtivas(usuario);
    const maxComparativos = ehPro
      ? (Number(process.env.COMPARATIVO_MAX_PRO) || 10)
      : (Number(process.env.COMPARATIVO_AMOSTRAS_FREE) || 3);
    const resultado = compararPrecosMercado(observacoes, {
      produtosDoUsuario,
      lojaDoUsuario,
      minEconomiaPct: 3,
      maxComparativos,
    });
    await enviarMensagem(phone, montarMensagemComparativo(resultado, { ehPro }));
  } catch (err) {
    log('comparativo_erro', { phone: maskPhone(phone), erro: err.message });
    await enviarMensagem(phone, 'Não consegui montar o comparativo agora. Tenta de novo em instantes? 🙏');
  }
}
```

### 1d. `src/formatter.js` — `montarMensagemComparativo` (linha ~566)

Assinatura ganha `opts` com default `{}` — **retrocompatível** (o cod-0022, teste do formatter que está na fila da máquina, chama com 1 argumento e continua passando). Só o bloco final muda:

```js
function montarMensagemComparativo(resultado, opts = {}) {
  // ... (tudo igual até o rodapé) ...

  partes.push(`\n_Preços que a rede registrou nos últimos ${resultado.janelaDias} dias._`);
  if (resultado.temMais) {
    partes.push(`_Mostrando os ${resultado.mostrados} com maior diferença, de ${resultado.totalComparaveis} no total._`);
    if (!opts.ehPro) {
      partes.push(`💡 No plano *Individual* você vê o comparativo completo. Detalhes: */planos*`);
    }
  }
  return partes.join('\n');
}
```

**Notas de copy (firewall):** sem preço hardcoded (o preço vive só no `montarMensagemPlanos` — evita copy stale se o pricing mudar); sem urgência falsa; a promessa "comparativo completo" tem source (Seção 3 do CLAUDE.md, feature do Individual). Upsell só aparece quando **há** mais pra ver (`temMais`) — o momento de maior valor percebido.

### 1e. Envs

- `.env.example`: adicionar `COMPARATIVO_MAX_PRO=10` (com comentário: teto de itens do comparativo pro Pro).
- Railway: setar `COMPARATIVO_MAX_PRO=10`.

---

## Peça 2 — Testes (caminho do dinheiro = você escreve, A6 parcial)

Novo `test/comparativo-gate.test.js` (vai tripar o firewall — commit consciente):

1. `montarMensagemComparativo(resultado)` sem opts → comporta como hoje (retrocompat).
2. `temMais:true` + `{ehPro:false}` → mensagem contém `/planos`.
3. `temMais:true` + `{ehPro:true}` → mensagem NÃO contém `/planos`.
4. `temMais:false` → nunca contém `/planos` (sem upsell quando não há mais pra ver).
5. `temFeaturesProAtivas`: `is_pro:true` → true; `features_pro_ate` futuro → true; passado/null → false; usuario null → false. *(Já coberto implicitamente? Não — não há teste; vale cobrir aqui.)*

---

## Peça 3 — Padrão de gate pro Alerta Pro (destrava cod-0032/0033/0035)

Recorte já decidido (2026-07-08): **Free** = alerta 3 níveis + `/cortar` + pergunta avulsa na cota do Agente · **Pro** = acompanhamentos persistentes + alerta de limite proativo + supérfluo configurável.

**Divisão de trabalho:** a máquina constrói os handlers/lógica **sem gate** (firewall-limpa); você insere o gate na revisão do diff, antes do commit — 3 linhas por ponto de entrada, mesmo padrão:

```js
// cod-0033 — comandos /acompanhar, /limite, /superfluo (Pro):
if (!temFeaturesProAtivas(usuario)) {
  await enviarMensagem(phone, montarUpsellAcompanhamentos()); // você escreve a msg (cita plano)
  return;
}
```

```js
// cod-0035 — alerta proativo de limite: gate ANTES de enviar
if (!temFeaturesProAtivas(usuario)) return; // silencioso — proativo não faz upsell não solicitado
```

- `/acompanhamentos` e `/parar` (leitura/desligar) podem ficar SEM gate — quem teve Pro e caiu pro Free precisa conseguir ver/parar o que configurou (LGPD/decência; evita acompanhamento zumbi).
- `cod-0032` (bloco de supérfluo no `/gastos`/resumo) usa o **baseline** doces+bebidas pra todos? **Não** — pela decisão de 07-08, supérfluo *configurável* é Pro. Sugestão de recorte fino (sua decisão na hora): bloco de supérfluo com baseline aparece pra todos (é insight, sobe a escada), e só a **configuração** (`/superfluo`) é gated. Se preferir tudo Pro, o gate entra também no render do bloco.
- Mensagem de upsell `montarUpsellAcompanhamentos()`: você escreve (cita plano → financeiro). Padrão da copy: valor primeiro ("acompanhe 'cerveja' e receba alerta quando passar do seu limite"), depois o caminho (*/planos*), sem preço hardcoded.

**Sequência de fila resultante:** cod-0031 (já `pronta`) → **cod-0032 e cod-0033 podem subir pra fila** (a máquina entrega sem gate; gate = seu passo na revisão) → cod-0035 por último (depende de 0031+0033).

---

## Peça 4 — Follow-on: gate na intent `comparativo_mercados` do Agente (cod-0041)

A intent (Leva 2b) usa o mesmo `COMPARATIVO_AMOSTRAS_FREE`. Quando ela estiver no ar, o executor precisa receber `ehPro` pra usar `COMPARATIVO_MAX_PRO` no Pro — **mesma decisão, mesmo env, zero decisão nova**. Registrado como nota na cod-0041; não bloqueia nada agora.

---

## Peça 5 — Efeito colateral bom: a recompensa de indicação passa a valer

`temFeaturesProAtivas` inclui a janela `features_pro_ate` (7 dias na ativação, +30 na conversão — sistema `/convidar` de 06-07). Desde então a recompensa estava **plumada mas vazia** ("ganhe funções Pro" que não existiam). Com o gate ligado, quem indica ganha comparativo completo de verdade — o `/convidar` vira argumento real. Vale mencionar nas próximas copies de marketing (não mudar copy do bot agora).

---

## ✅ Checklist de execução (ordem)

1. [ ] Aplicar 1a–1d na sua máquina (colar os snippets).
2. [ ] Adicionar `COMPARATIVO_MAX_PRO=10` no `.env.example` e no Railway.
3. [ ] Escrever `test/comparativo-gate.test.js` (Peça 2).
4. [ ] `npm run check` — **firewall vai acusar `temFeaturesProAtivas`/plano: esperado.** Testes e sintaxe devem passar.
5. [ ] Commit consciente (`--no-verify` se o hook barrar) + push → deploy Railway.
6. [ ] Smoke test: `/comparar` com usuário Free (deve mostrar ≤3 + upsell se `temMais`) e com `is_pro=true` setado à mão no Supabase (deve mostrar até 10, sem upsell).
7. [ ] (Sessão de planejamento) Promover cod-0032/0033 pra Fila pronta com a nota "gate = passo humano na revisão".
