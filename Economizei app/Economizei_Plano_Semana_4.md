# 🧱 Plano de Execução — Semana 4

> **Objetivo da semana:** Polimento do Free + Scheduler de Resumo Mensal.
> Deixar o Free 100% funcional pra justificar gratuidade real antes do Beta Soft (Semana 5).
> **Orçamento:** 7 horas distribuídas em 5 tarefas + 30min de setup.
> **Status do código:** todas as 5 tarefas plugam no que já existe — não há reescrita, só extensão.
> **Última atualização:** 2026-05-16

---

## 📊 Resumo executivo

| # | Tarefa | Tempo | Humano | Claude Code | Bloqueia |
|---|---|---|---|---|---|
| 0 | Setup (deps + .env) | 30min | ✅ aprovar | ✅ patch | 1, 4 |
| 1 | Scheduler de resumo mensal | 3h | ⚠️ deploy | ✅ código | 2, 5 |
| 2 | Template de resumo mensal | 1h | – | ✅ código | 5 |
| 3 | Polir mensagens de erro | 1.5h | – | ✅ código | 5 |
| 4 | Comando `/limite` | 1h | – | ✅ código | 5 |
| 5 | Teste E2E (5 cupons reais) | 30min | ✅ executar | ✅ script | – |

**Ordem recomendada:** 0 → (1 ∥ 2 ∥ 3 ∥ 4 em paralelo se quiser) → 5.
A Task 1 depende da 2 só na hora de **chamar** o template; pode codar separado.

---

## 🧭 Decisão arquitetural — Infra do Scheduler

**Recomendação:** **node-cron embutido + endpoint protegido como failsafe externo.**

### Por quê (trade-off completo)

| Critério | node-cron embutido | Cron externo (GitHub Actions) | Híbrido (recomendado) |
|---|---|---|---|
| Custo extra | R$0 | R$0 (GH grátis) | R$0 |
| Complexidade | Baixa | Média | Baixa |
| Robustez se servidor cair | ❌ perde execução | ✅ tenta novamente | ✅ failsafe |
| Latência de implementação | 1h | 2h | 1h30 |
| Adequado pra 30–100 users | ✅ | ✅ | ✅ |

### A solução híbrida

1. **node-cron** roda dentro do próprio Express (`0 9 28-31 * *` — dispara dia 28-31 às 9h e o código checa se é o último dia do mês).
2. **Endpoint `POST /cron/monthly-summary`** protegido por header `X-Cron-Secret`, com flag `?phone=` opcional pra disparar pra 1 usuário específico (teste).
3. **GitHub Actions** roda no último dia do mês às 10h (1h depois do cron interno) como **failsafe** — se já rodou, o código detecta via tabela `resumos_mensais_enviados` e pula.

**Migração futura:** quando passar de 1000 usuários ou for pra Cloud Run/serverless, basta desligar o `node-cron` interno e deixar só o GitHub Actions (zero refactor).

### Custo do Gemini? Zero
O resumo mensal é **agregação SQL pura no Supabase**, não chama Gemini. Custo marginal = R$0 por usuário.

---

## ⚙️ Pré-tarefa: Setup (30min)

### O que muda no projeto

- Instalar `node-cron` (`npm install node-cron`)
- Adicionar `CRON_SECRET` no `.env` e no `.env.example`
- Criar tabela `resumos_mensais_enviados` no Supabase pra idempotência

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | (1) Gerar um secret aleatório (`openssl rand -hex 32` ou qualquer gerador) e setar `CRON_SECRET=...` no Railway/host. (2) Rodar o SQL abaixo no Supabase SQL Editor. |
| 🤖 **Claude Code** | Rodar `npm install node-cron`, atualizar `package.json`, adicionar `CRON_SECRET=` no `.env.example`. |

### SQL para o Gabriel rodar no Supabase

```sql
-- Idempotência: garante que o resumo mensal não é enviado 2x pro mesmo phone+mês
CREATE TABLE IF NOT EXISTS resumos_mensais_enviados (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  mes_referencia TEXT NOT NULL, -- formato 'YYYY-MM'
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  total_compras INT,
  total_gasto NUMERIC(10,2),
  UNIQUE (phone_number, mes_referencia)
);

CREATE INDEX IF NOT EXISTS idx_resumos_phone ON resumos_mensais_enviados(phone_number);
CREATE INDEX IF NOT EXISTS idx_resumos_mes ON resumos_mensais_enviados(mes_referencia);
```

### Prompt pra Claude Code (Setup)

```text
Contexto: Estou na Semana 4 do roadmap do Economizei. Preciso adicionar a dependência
node-cron e criar a variável CRON_SECRET no .env.example.

Faça:
1. Rode `npm install node-cron@^3.0.3 --save`
2. Verifique que `package.json` agora lista node-cron em "dependencies"
3. Abra `.env.example` e adicione no final, antes da última linha em branco:

   # Scheduler — secret usado pra autenticar disparos externos do cron mensal
   # Gere com: openssl rand -hex 32
   CRON_SECRET=

4. NÃO altere o `.env` real (eu coloco o valor)
5. Confirma que está tudo certo rodando `node -e "require('node-cron')"` e
   imprime no terminal se rodou sem erro
```

---

## 🗓️ Task 1 — Scheduler de Resumo Mensal (3h)

### Objetivo
Todo último dia do mês, às 9h, o bot envia para cada usuário ativo um resumo do que ele gastou no mês — sem o usuário precisar pedir.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  src/scheduler.js  (boot junto com index.js)                │
│   └─ cron.schedule('0 9 28-31 * *', ...)                    │
│       └─ se ehUltimoDiaDoMes() → executarResumoMensal()     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  src/monthlySummary.js                                      │
│   └─ executarResumoMensal(mesRef)                           │
│       1. listarUsuariosAtivosNoMes(mesRef) → [phones]       │
│       2. pra cada phone:                                    │
│          a. já enviou? (resumos_mensais_enviados) → skip    │
│          b. buscarComprasDoMes(phone, mesRef)               │
│          c. buscarComprasDoMes(phone, mesAnterior)          │
│          d. montarResumoMensal(dadosAtual, dadosAnterior)   │
│          e. enviarMensagem(phone, texto)                    │
│          f. marcar como enviado                             │
│       3. log final: N enviados, M já_enviados, K erros      │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────────┐
│  src/index.js                                               │
│   ├─ POST /cron/monthly-summary  (failsafe, protegido)      │
│   │   ├─ valida X-Cron-Secret                               │
│   │   ├─ aceita ?phone= pra testar com 1 user               │
│   │   └─ chama executarResumoMensal()                       │
│   └─ require('./scheduler') no boot                         │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌─────────────────────────────────────────────────────────────┐
│  .github/workflows/monthly-cron.yml  (failsafe externo)     │
│   └─ cron: '0 10 28-31 * *' → curl POST /cron/...           │
└─────────────────────────────────────────────────────────────┘
```

### Novas funções no `src/supabase.js`

1. **`listarUsuariosAtivosNoMes(mesReferencia)`** → retorna `string[]` (phones com ≥1 compra no mês).
2. **`buscarComprasDoMes(phoneNumber, mesReferencia)`** → retorna `{ compras: [...], totalGasto, qtdCompras, ticketMedio, topLojas: [{loja, total, qtd}], topItens: [{nome, qtd, gastoTotal}] }`.
3. **`marcarResumoEnviado(phoneNumber, mesReferencia, totalCompras, totalGasto)`** → INSERT em `resumos_mensais_enviados` com `ON CONFLICT DO NOTHING`.
4. **`verificarResumoJaEnviado(phoneNumber, mesReferencia)`** → boolean.

### Critério de aceite
- ✅ Rodar `node -e "require('./src/monthlySummary').executarResumoMensal('2026-04')"` envia mensagens reais (em ambiente de teste).
- ✅ Disparar 2x em sequência: a segunda vez todos pulam (idempotência funcionando).
- ✅ `POST /cron/monthly-summary` sem secret retorna 401.
- ✅ `POST /cron/monthly-summary` com `?phone=5511999999999` envia só pra esse user.
- ✅ Log final tem contagem (enviados, pulados, erros).

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | Após Claude Code terminar: (1) Configurar GitHub Actions com o secret `CRON_SECRET` e URL do servidor. (2) Aprovar deploy. (3) Testar com seu próprio número antes de soltar pra todos. |
| 🤖 **Claude Code** | Criar `scheduler.js`, `monthlySummary.js`, novas funções em `supabase.js`, endpoint em `index.js`, workflow `.github/workflows/monthly-cron.yml`. |

### Prompt pra Claude Code (Task 1)

```text
Contexto: Estou trabalhando no bot Economizei (Node.js + Express + Supabase +
Z-API). Já fiz `npm install node-cron` e adicionei CRON_SECRET no .env.

Existem estes arquivos em src/: index.js, gemini.js, supabase.js, zapi.js,
formatter.js, alerts.js, logger.js.

Já existe a função `buscarHistorico(phone, limite)` em supabase.js — não
modifique ela, ela tem outro propósito.

Já existe a tabela `resumos_mensais_enviados` no Supabase com as colunas:
id, phone_number, mes_referencia, enviado_em, total_compras, total_gasto,
e UNIQUE(phone_number, mes_referencia).

OBJETIVO: Implementar o scheduler de resumo mensal automático.

PARTE A — Adicionar 4 funções em src/supabase.js (no final do arquivo, antes
do module.exports, e incluí-las no module.exports):

1. listarUsuariosAtivosNoMes(mesReferencia)
   - mesReferencia formato 'YYYY-MM'
   - SELECT DISTINCT phone_number FROM compras
     WHERE data_compra >= 'YYYY-MM-01' AND data_compra < primeiro_dia_mes_seguinte
   - Retorna array de strings (phones)
   - Tratar erro com log('supabase_erro', {fn:'listarUsuariosAtivosNoMes',...})

2. buscarComprasDoMes(phoneNumber, mesReferencia)
   - Faz JOIN compras + itens_compra
   - Calcula: totalGasto, qtdCompras, ticketMedio (totalGasto/qtdCompras)
   - topLojas: agrupa por loja, soma total, ordena DESC, pega top 3
   - topItens: agrupa por nome do item, soma quantidade e preco*quantidade,
     ordena por gastoTotal DESC, pega top 5
   - Retorna { compras, totalGasto, qtdCompras, ticketMedio, topLojas, topItens }
   - Se qtdCompras === 0, retornar null

3. verificarResumoJaEnviado(phoneNumber, mesReferencia)
   - SELECT id FROM resumos_mensais_enviados WHERE phone_number=$1 AND mes_referencia=$2
   - Retorna boolean

4. marcarResumoEnviado(phoneNumber, mesReferencia, totalCompras, totalGasto)
   - INSERT ... ON CONFLICT (phone_number, mes_referencia) DO NOTHING
   - Não throw em conflito, é esperado

PARTE B — Criar src/monthlySummary.js:

const { listarUsuariosAtivosNoMes, buscarComprasDoMes, verificarResumoJaEnviado,
        marcarResumoEnviado } = require('./supabase');
const { enviarMensagem } = require('./zapi');
const { montarResumoMensal } = require('./formatter');
const { log, maskPhone } = require('./logger');

function calcularMesAnterior(mesRef) {
  const [ano, mes] = mesRef.split('-').map(Number);
  if (mes === 1) return `${ano - 1}-12`;
  return `${ano}-${String(mes - 1).padStart(2, '0')}`;
}

async function executarResumoMensal(mesReferencia, phoneEspecifico = null) {
  log('resumo_mensal_iniciando', { mes: mesReferencia, phone_especifico: phoneEspecifico ? 'sim' : 'nao' });

  let phones;
  if (phoneEspecifico) {
    phones = [phoneEspecifico];
  } else {
    phones = await listarUsuariosAtivosNoMes(mesReferencia);
  }

  let enviados = 0, pulados = 0, erros = 0;
  const mesAnterior = calcularMesAnterior(mesReferencia);

  for (const phone of phones) {
    try {
      const jaEnviado = await verificarResumoJaEnviado(phone, mesReferencia);
      if (jaEnviado) { pulados++; continue; }

      const dadosAtual = await buscarComprasDoMes(phone, mesReferencia);
      if (!dadosAtual) { pulados++; continue; }

      const dadosAnterior = await buscarComprasDoMes(phone, mesAnterior);
      const texto = montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia);

      await enviarMensagem(phone, texto);
      await marcarResumoEnviado(phone, mesReferencia, dadosAtual.qtdCompras, dadosAtual.totalGasto);

      // throttle: 1 mensagem por segundo pra não estourar rate-limit do Z-API
      await new Promise(r => setTimeout(r, 1000));
      enviados++;
    } catch (err) {
      log('resumo_mensal_erro', { phone: maskPhone(phone), erro: err.message });
      erros++;
    }
  }

  log('resumo_mensal_finalizado', { mes: mesReferencia, enviados, pulados, erros, total: phones.length });
  return { enviados, pulados, erros };
}

module.exports = { executarResumoMensal, calcularMesAnterior };

PARTE C — Criar src/scheduler.js:

const cron = require('node-cron');
const { executarResumoMensal } = require('./monthlySummary');
const { log } = require('./logger');

function ehUltimoDiaDoMes(date = new Date()) {
  const amanha = new Date(date);
  amanha.setDate(date.getDate() + 1);
  return amanha.getMonth() !== date.getMonth();
}

function iniciar() {
  // Roda 9h dia 28-31; só dispara se for de fato o último dia do mês.
  // Timezone do servidor deve ser America/Sao_Paulo (ou ajustar a hora).
  cron.schedule('0 9 28-31 * *', async () => {
    const agora = new Date();
    if (!ehUltimoDiaDoMes(agora)) {
      log('scheduler_skip_nao_ultimo_dia', { data: agora.toISOString() });
      return;
    }
    const mesRef = agora.toISOString().slice(0, 7); // 'YYYY-MM'
    log('scheduler_disparando', { mes: mesRef });
    try {
      await executarResumoMensal(mesRef);
    } catch (err) {
      log('scheduler_erro', { erro: err.message });
    }
  }, { timezone: 'America/Sao_Paulo' });

  log('scheduler_registrado', { cron: '0 9 28-31 * *', timezone: 'America/Sao_Paulo' });
}

module.exports = { iniciar, ehUltimoDiaDoMes };

PARTE D — Modificar src/index.js:

1. Adicionar import no topo, junto com os outros:
   const { iniciar: iniciarScheduler } = require('./scheduler');
   const { executarResumoMensal } = require('./monthlySummary');

2. Adicionar endpoint ANTES do `app.listen(...)`:

   app.post('/cron/monthly-summary', async (req, res) => {
     const secret = req.header('X-Cron-Secret');
     if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
       return res.status(401).json({ erro: 'unauthorized' });
     }
     const phone = req.query.phone;
     const mesRef = req.query.mes || new Date().toISOString().slice(0, 7);
     // Resposta imediata, processamento em background
     res.json({ aceito: true, mes: mesRef, phone_especifico: phone || null });
     executarResumoMensal(mesRef, phone || null).catch(err =>
       log('cron_endpoint_erro', { erro: err.message })
     );
   });

3. Adicionar dentro do callback do app.listen, logo após console.log:
   iniciarScheduler();

PARTE E — Criar .github/workflows/monthly-cron.yml na raiz do projeto:

name: Monthly Summary Cron (failsafe)
on:
  schedule:
    # Roda dia 28-31 às 13h UTC (10h em São Paulo, 1h depois do cron interno)
    - cron: '0 13 28-31 * *'
  workflow_dispatch: # permite trigger manual pra teste

jobs:
  trigger-summary:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger monthly summary endpoint
        run: |
          curl -X POST "${{ secrets.BOT_URL }}/cron/monthly-summary" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            --fail --show-error

REQUISITOS:
- Não introduzir nenhuma dependência além de node-cron (já instalado).
- Manter o estilo de log JSON usado no logger.js.
- Sempre mascarar phone em logs com maskPhone().
- Tratar erros sem deixar o servidor cair (try/catch em todos os pontos).

Quando terminar, me mostra um diff resumido do que mudou em cada arquivo e
confirme que `node -e "require('./src/scheduler'); require('./src/monthlySummary')"`
roda sem erro.
```

---

## ✉️ Task 2 — Template de Mensagem de Resumo Mensal (1h)

### Objetivo
Mensagem amigável, scaneável no WhatsApp, que ancora o valor do Free e planta seed do Pago **sem ser agressivo**.

### Anatomia da mensagem (rascunho)

```
🗓️ *Seu mês no Economizei — Abril/2026*

💰 Você gastou R$ 1.234,50 em 8 compras
📊 Ticket médio: R$ 154,31

🏪 *Onde você mais gastou:*
1. Atacadão — R$ 580,00 (3x)
2. Carrefour — R$ 420,50 (4x)
3. Hortifruti — R$ 234,00 (1x)

📦 *Itens que mais pesaram:*
1. Carne bovina — R$ 180,00
2. Leite integral — R$ 95,40
3. Café — R$ 72,00

📈 Comparado a Março: +12% (você gastou R$ 138 a mais)

💡 *Continue mandando os cupons* — quanto mais dados, mais padrões eu vejo.

🎉 Como *Beta Fundador*, você tem 3 meses grátis do plano Pro quando ele chegar — automaticamente.
```

### Regras de comportamento

- Se `dadosAnterior === null` (primeiro mês ou mês anterior sem compras): **omitir a linha de comparação**, trocar por *"Esse é o primeiro mês de dados — em maio vou conseguir comparar com abril."*
- Se `qtdCompras === 1`: não mostrar ticket médio.
- Se `topLojas.length === 1`: não numerar, escrever em linha única.
- Sempre usar `brl()` (já existe em formatter.js) pra formatar.
- Nome do mês em português: criar mini helper `nomeDoMes(mesRef)` → "Abril/2026".

### Critério de aceite
- ✅ Caso "primeiro mês": sem linha de comparação, tem disclaimer.
- ✅ Caso "1 compra só": sem ticket médio.
- ✅ Caso "10 compras em 4 lojas com mês anterior": tudo aparece.
- ✅ Nenhum NaN ou undefined renderizado.

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | Revisar a copy final (especialmente CTA Beta Fundador) e aprovar tom. |
| 🤖 **Claude Code** | Implementar `montarResumoMensal()` + helper `nomeDoMes()` em `formatter.js`. |

### Prompt pra Claude Code (Task 2)

```text
Contexto: src/formatter.js do bot Economizei tem 9 funções (montarResposta,
montarMensagemErro, montarMensagemBemVindo, montarMensagemLimite,
montarMensagemAlerta, montarOnboarding1-4) e os helpers brl() e dataCurta().

Preciso adicionar mais 2 funções:

1. nomeDoMes(mesRef) — helper interno
   - Entrada: 'YYYY-MM' (ex: '2026-04')
   - Saída: 'Abril/2026'
   - Use um array hard-coded com os 12 nomes em português:
     ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
   - Se entrada inválida, retornar 'esse mês' (fallback seguro)

2. montarResumoMensal(dadosAtual, dadosAnterior, mesReferencia)
   - dadosAtual = { totalGasto, qtdCompras, ticketMedio, topLojas: [{loja,total,qtd}], topItens: [{nome,qtd,gastoTotal}] }
   - dadosAnterior pode ser null
   - Retorna string com a mensagem completa

   Estrutura exata:

   🗓️ *Seu mês no Economizei — {nomeDoMes(mesRef)}*

   💰 Você gastou R$ {brl(totalGasto)} em {qtdCompras} {compra(s)}
   [📊 Ticket médio: R$ {brl(ticketMedio)}]   ← só se qtdCompras > 1

   🏪 *Onde você mais gastou:*
   {topLojas formatadas — ver regra abaixo}

   📦 *Itens que mais pesaram:*
   {topItens formatadas — ver regra abaixo}

   {linha de comparação OU disclaimer de primeiro mês}

   💡 *Continue mandando os cupons* — quanto mais dados, mais padrões eu vejo.

   🎉 Como *Beta Fundador*, você tem 3 meses grátis do plano Pro quando ele chegar — automaticamente.

   REGRAS:
   - topLojas com 1 item: "1. {loja} — R$ {brl(total)} ({qtd}x)" sem
     enumeração se for único; com 2+ itens: numerar "1. ", "2. ", "3. ".
   - topItens: até 5 itens, formato "1. {nome} — R$ {brl(gastoTotal)}"
   - Se topItens.length === 0: omitir o bloco inteiro de "Itens que mais pesaram".
   - Comparação com mês anterior:
     * Se dadosAnterior === null OU dadosAnterior.totalGasto === 0:
       "📅 Esse é o primeiro mês com dados — em {nomeProximoMes} vou conseguir comparar."
     * Senão calcular diff = ((atual - anterior) / anterior) * 100
       - Se Math.abs(diff) < 5: "📊 Mês parecido com o anterior — diferença de menos de 5%."
       - Se diff > 0:  "📈 Comparado a {nomeDoMes(mesAnterior)}: +{Math.round(diff)}% (R$ {brl(atual-anterior)} a mais)"
       - Se diff < 0:  "📉 Comparado a {nomeDoMes(mesAnterior)}: {Math.round(diff)}% (R$ {brl(anterior-atual)} a menos) 🎉"
   - Helper local pra calcular mês anterior do mesReferencia (igual ao
     calcularMesAnterior do monthlySummary.js — pode importar ou duplicar pequeno).
   - "compra" se qtdCompras === 1, senão "compras".
   - SEMPRE checar se valores não são NaN/null antes de renderizar.

3. Adicionar `montarResumoMensal` e `nomeDoMes` no module.exports.

Quando terminar, rode mentalmente os 3 cenários abaixo e confirma se a saída
faz sentido (cole a saída esperada na resposta):

CENÁRIO A (primeiro mês, 1 compra):
  dadosAtual = { totalGasto: 87.50, qtdCompras: 1, ticketMedio: 87.50,
                 topLojas: [{loja:'Carrefour', total:87.50, qtd:1}],
                 topItens: [{nome:'Pão', qtd:2, gastoTotal:12}] }
  dadosAnterior = null
  mesRef = '2026-05'

CENÁRIO B (mês cheio, gastou mais):
  dadosAtual = { totalGasto: 1234.50, qtdCompras: 8, ticketMedio: 154.31,
                 topLojas: [{...}, {...}, {...}],
                 topItens: [{...} x 5] }
  dadosAnterior = { totalGasto: 1096.50, qtdCompras: 7, ... }
  mesRef = '2026-04'

CENÁRIO C (gastou menos):
  como B mas dadosAnterior.totalGasto = 1500
```

---

## 🛠️ Task 3 — Polir Mensagens de Erro (1h30)

### Objetivo
Hoje qualquer falha cai num único `montarMensagemErro(motivo)` genérico. Os usuários do Beta precisam saber **exatamente** o que aconteceu pra retentar (ou aceitar que não dá).

### Os 4 (na verdade 5) cenários a tratar

| # | Cenário | O que mostrar |
|---|---|---|
| 1 | Cupom borrado / mal iluminado | "Tá meio borrada — tira de novo com mais luz, sem dobras." |
| 2 | Cupom de farmácia / não-supermercado | "Esse cupom não é de supermercado. Por enquanto só leio cupons de mercado." |
| 3 | Cupom sem itens lidos (total ok mas itens vazios) | "Li o total (R$ X) mas não consegui ler os itens. Salvei a compra mesmo assim." ⚠️ **caso especial: sucesso parcial** |
| 4 | Cupom muito longo / cortado | "Esse cupom é muito grande — tira em 2 fotos e me manda separado." |
| 5 | Não é cupom (foto de gato, paisagem, etc) | "Isso não parece um cupom fiscal. Tira foto do papel do mercado, com o CNPJ visível." |

### Estratégia técnica

**Não dá pra confiar 100% no `motivo` em texto livre do Gemini.** Solução em 2 camadas:

1. **Camada A — enriquecer o prompt do Gemini** pra retornar `categoria_erro` enum: `["borrado", "nao_supermercado", "sem_itens", "muito_longo", "nao_e_cupom", "outro"]`.
2. **Camada B — heurística fallback** em JS que tenta classificar a partir do `motivo` string caso o Gemini não devolva `categoria_erro`.

**Caso especial (#3 "sucesso parcial"):** Gemini retorna `sucesso: true` com `total` válido mas `itens: []`. Hoje isso já é tratado em `formatter.js:29` (omite bloco de itens), mas o usuário não é avisado. Solução: salvar normal e enviar **mensagem extra** explicando.

### Critério de aceite
- ✅ 5 prompts de teste retornam categoria correta na maioria.
- ✅ Mensagem específica aparece pra cada categoria.
- ✅ Sucesso parcial (sem itens): compra é salva + mensagem extra "salvei o total mas não consegui ler itens" aparece após a resposta normal.
- ✅ Heurística fallback nunca quebra (se vier `motivo` vazio, cai em "outro" com mensagem genérica).

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | Revisar copy das 5 mensagens (tom amigável, não condescendente). |
| 🤖 **Claude Code** | Atualizar prompt do Gemini, adicionar `categoria_erro` na validação, criar `montarMensagemErroCategorizada()`, adicionar mensagem extra de sucesso parcial. |

### Prompt pra Claude Code (Task 3)

```text
Contexto: O bot Economizei usa Gemini 2.5 Flash pra ler cupons (src/gemini.js).
Hoje retorna { sucesso, loja, cnpj, data_compra, total, itens[] } ou
{ sucesso: false, motivo: "string livre" }.

A mensagem de erro pra usuário (src/formatter.js:42, montarMensagemErro) é
genérica. Preciso melhorar 3 coisas:

PARTE A — Enriquecer o prompt do Gemini em src/gemini.js

Substitua a constante PROMPT atual pelo novo prompt abaixo (mantém o formato
JSON mas adiciona categoria_erro):

const PROMPT = `Você é um extrator de dados de cupons fiscais brasileiros.
Analise a imagem e retorne SOMENTE um JSON válido, sem markdown, sem texto adicional.

Se for um cupom fiscal de SUPERMERCADO válido e legível:
{
  "sucesso": true,
  "loja": "nome do estabelecimento",
  "cnpj": "XX.XXX.XXX/XXXX-XX ou null",
  "data_compra": "YYYY-MM-DD",
  "total": 99.90,
  "itens": [
    {
      "nome": "nome do produto",
      "quantidade": 1,
      "preco_unitario": 9.90,
      "preco_total": 9.90
    }
  ]
}

Se NÃO conseguir extrair:
{
  "sucesso": false,
  "categoria_erro": "<uma das opções abaixo>",
  "motivo": "explica o problema em 1 frase simples"
}

Opções de categoria_erro (escolha A MAIS adequada):
- "borrado" — imagem desfocada, escura, com reflexo, ou parcialmente ilegível
- "nao_supermercado" — é cupom fiscal mas de farmácia, restaurante, posto, loja
- "sem_itens" — consegue ler total mas não os itens (use só se total estiver legível)
- "muito_longo" — cupom cortado, não é possível ver o final/total
- "nao_e_cupom" — a imagem não é cupom fiscal (foto de pessoa, paisagem, outro documento)
- "outro" — qualquer outro caso

Importante: se conseguir ler o total mesmo que sem itens, prefira retornar
sucesso=true com itens=[] em vez de falhar.`;

PARTE B — Atualizar validarSchema() em src/gemini.js

Na ramificação `if (dados.sucesso === false)` (linha ~65), retornar também
a categoria_erro:

if (dados.sucesso === false) {
  return {
    sucesso: false,
    categoria_erro: typeof dados.categoria_erro === 'string'
      ? dados.categoria_erro
      : inferirCategoria(dados.motivo),
    motivo: typeof dados.motivo === 'string' && dados.motivo.length > 0
      ? dados.motivo
      : 'Cupom ilegível',
  };
}

E adicionar nova função-helper inferirCategoria(motivo) ANTES de validarSchema:

function inferirCategoria(motivo) {
  if (typeof motivo !== 'string') return 'outro';
  const m = motivo.toLowerCase();
  if (m.includes('borrad') || m.includes('escur') || m.includes('legíve') || m.includes('legive')) return 'borrado';
  if (m.includes('farmác') || m.includes('farmac') || m.includes('restaurante') || m.includes('posto')) return 'nao_supermercado';
  if (m.includes('item') || m.includes('itens')) return 'sem_itens';
  if (m.includes('cortad') || m.includes('long') || m.includes('parcial')) return 'muito_longo';
  if (m.includes('não é cupom') || m.includes('nao é cupom') || m.includes('não parece')) return 'nao_e_cupom';
  return 'outro';
}

PARTE C — Substituir montarMensagemErro em src/formatter.js

Trocar a função atual pela versão categorizada:

function montarMensagemErro(motivo, categoria = 'outro') {
  const dicas = {
    borrado:
      '📸 *A foto ficou meio borrada.*\n\n' +
      'Tira de novo seguindo essas dicas:\n' +
      '• Boa iluminação (perto da janela funciona)\n' +
      '• Cupom esticado, sem dobras\n' +
      '• Câmera paralela ao papel, sem ângulo',
    nao_supermercado:
      '🏪 *Esse cupom não é de supermercado.*\n\n' +
      'Por enquanto eu só leio cupons de mercado/atacadão. ' +
      'Farmácia, restaurante e posto ainda não — tô focado em economia de mercado primeiro.',
    sem_itens:
      '⚠️ *Li o cupom, mas os itens estão ilegíveis.*\n\n' +
      'Tira de novo bem focado na lista de itens — ou se preferir, salvo só o total dessa compra.',
    muito_longo:
      '📜 *Esse cupom é muito comprido — não consegui ver tudo.*\n\n' +
      'Tira em 2 fotos:\n' +
      '1. Topo até o meio\n' +
      '2. Do meio até o final (com o total)\n\n' +
      'Me manda as 2 separadas.',
    nao_e_cupom:
      '🤔 *Isso não parece um cupom fiscal.*\n\n' +
      'Manda a foto do papel que o caixa do mercado te deu — aquele com a lista dos produtos e o CNPJ no topo.',
    outro:
      '❌ Não consegui ler esse cupom.\n' +
      (motivo ? `${motivo}\n\n` : '') +
      'Para funcionar melhor:\n' +
      '- Boa iluminação\n' +
      '- Cupom esticado e sem dobras\n' +
      '- Câmera paralela ao papel, sem ângulo',
  };
  return dicas[categoria] || dicas.outro;
}

E adicionar uma nova função pra sucesso parcial (chamada quando sucesso=true
mas itens=[]):

function montarAvisoSucessoParcial() {
  return (
    '⚠️ *Aviso:* Li o total certinho, mas os itens individuais não saíram legíveis.\n\n' +
    'Sua compra foi salva. Se quiser que os itens apareçam no resumo do mês, ' +
    'tira a foto de novo com mais luz na lista de produtos.'
  );
}

Exportar montarAvisoSucessoParcial junto com o resto.

PARTE D — Atualizar src/index.js

1. Importar montarAvisoSucessoParcial junto dos outros imports do formatter.

2. Na função processarImagem, encontre o bloco:

   if (!dados.sucesso) {
     log('cupom_erro_leitura', { phone: maskPhone(phone), motivo: dados.motivo });
     await enviarMensagem(phone, montarMensagemErro(dados.motivo));
     return;
   }

   Substitua por:

   if (!dados.sucesso) {
     log('cupom_erro_leitura', {
       phone: maskPhone(phone),
       categoria: dados.categoria_erro,
       motivo: dados.motivo,
     });
     await enviarMensagem(phone, montarMensagemErro(dados.motivo, dados.categoria_erro));
     return;
   }

3. Depois do bloco que envia `resposta` (linha ~274, `await enviarMensagem(phone, resposta)`)
   e ANTES do `if (step === 1 || step === 2)`, adicione:

   if (dados.itens.length === 0) {
     log('cupom_sucesso_parcial', { phone: maskPhone(phone), total: dados.total });
     await new Promise(r => setTimeout(r, 600));
     await enviarMensagem(phone, montarAvisoSucessoParcial());
   }

REQUISITOS:
- Não quebrar testes ou cenários atuais — montarMensagemErro com 1 arg só
  ainda deve funcionar (default categoria='outro').
- Manter padrão de log JSON.
- Não tocar em mais nada em index.js ou gemini.js além do descrito.

Quando terminar, faz um diff resumido e me confirma:
1. Que o prompt do Gemini agora pede categoria_erro
2. Que validarSchema retorna categoria_erro
3. Que montarMensagemErro tem 6 ramificações (5 categorias + outro)
4. Que processarImagem usa categoria_erro nos logs e na mensagem
5. Que sucesso parcial dispara mensagem extra
```

---

## 🎯 Task 4 — Comando `/limite` (1h)

### Objetivo
Usuário pergunta "quantos cupons eu tenho?" e o bot responde na hora. UX transparente, reduz ansiedade do limite.

### Comportamento esperado

```
Usuário: /limite

Bot: 📊 *Seu plano: Beta Fundador Grátis*

     Cupons esse mês: *3 de 10* usados
     Restam: 7 cupons (até 31/maio)

     🎉 Como Beta Fundador, quando o Pro chegar você
     ganha 3 meses grátis + preço travado automaticamente.
```

### Casos a tratar

- Usuário no limite (10/10): mostrar mensagem específica + lembrete do reset.
- Usuário Pro (`is_pro = true`): "Ilimitado — manda quantos quiser ✨".
- Usuário Beta Fundador no limite: mensagem mais empática + reforço do benefício.

### Critério de aceite
- ✅ Variações `/limite`, `limite`, `quantos cupons`, `meu plano` ativam o comando.
- ✅ Mostra dias até o fim do mês corretamente.
- ✅ Usa `buscarStatusUsuario` (já existe!) — não duplica lógica.
- ✅ Funciona em qualquer step do onboarding ≥ 2 (não conflita).

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | Decidir se mantém `/limite` como nome ou prefere `/plano`, `/cupons`, etc. |
| 🤖 **Claude Code** | Adicionar comando em `processarTexto`, criar `montarMensagemStatusLimite()` em formatter.js. |

### Prompt pra Claude Code (Task 4)

```text
Contexto: O bot Economizei (src/index.js) já tem processarTexto que normaliza
texto e detecta comandos via ehComando(...). Já existe buscarStatusUsuario(phone)
em src/supabase.js que retorna { isBetaFundador, isPro, cuponsUsados, limite }.

Adicionar comando /limite que mostra status do plano do usuário.

PARTE A — Adicionar em src/formatter.js a função montarMensagemStatusLimite(status):

function diasAteFimDoMes() {
  const hoje = new Date();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const diff = ultimoDia.getDate() - hoje.getDate();
  const dataStr = `${String(ultimoDia.getDate()).padStart(2,'0')}/${String(ultimoDia.getMonth()+1).padStart(2,'0')}`;
  return { dias: diff, dataLimite: dataStr };
}

function montarMensagemStatusLimite(status) {
  const { isPro, isBetaFundador, cuponsUsados, limite } = status;
  const { dias, dataLimite } = diasAteFimDoMes();

  if (isPro) {
    return (
      '✨ *Seu plano: Pro — Ilimitado*\n\n' +
      `Cupons usados esse mês: ${cuponsUsados}\n` +
      'Manda quantos quiser, sem limite!'
    );
  }

  const restantes = Math.max(0, limite - cuponsUsados);
  const planoLabel = isBetaFundador ? 'Beta Fundador Grátis' : 'Grátis';

  if (restantes === 0) {
    return (
      `🏆 *Seu plano: ${planoLabel}*\n\n` +
      `Você já usou os ${limite} cupons desse mês — uso completo, parabéns!\n` +
      `Seu limite renova em ${dias} ${dias === 1 ? 'dia' : 'dias'} (${dataLimite}).\n\n` +
      (isBetaFundador
        ? '🎉 Como *Beta Fundador*, quando o plano Pro chegar você ganha 3 meses grátis e tudo ilimitado — automático.'
        : '💡 Quando o plano Pro chegar, vai ser ilimitado.')
    );
  }

  return (
    `📊 *Seu plano: ${planoLabel}*\n\n` +
    `Cupons esse mês: *${cuponsUsados} de ${limite}* usados\n` +
    `Restam: ${restantes} ${restantes === 1 ? 'cupom' : 'cupons'} ` +
    `(até ${dataLimite})\n\n` +
    (isBetaFundador
      ? '🎉 Como *Beta Fundador*, quando o Pro chegar você ganha 3 meses grátis automaticamente.'
      : '')
  ).trim();
}

Exportar montarMensagemStatusLimite no module.exports.

PARTE B — Em src/index.js:

1. Adicionar no destructuring do require('./supabase') a função buscarStatusUsuario.
2. Adicionar no destructuring do require('./formatter') a função montarMensagemStatusLimite.

3. Em processarTexto, no bloco de detecção de comando (após o cálculo
   de `palavras` e `ehComando`), adicionar ANTES do `if (ehComando('historico'...))`:

   if (ehComando('/limite', 'limite', '/plano', 'plano', '/cupons', 'cupons')) {
     const status = await buscarStatusUsuario(phone);
     await enviarMensagem(phone, montarMensagemStatusLimite(status));
     return;
   }

   Também detectar a frase composta "quantos cupons" — ANTES do bloco acima,
   adicionar uma checagem extra:

   if (msg.includes('quantos cupons') || msg.includes('meu plano') || msg.includes('meu limite')) {
     const status = await buscarStatusUsuario(phone);
     await enviarMensagem(phone, montarMensagemStatusLimite(status));
     return;
   }

4. Atualizar montarMensagemBemVindo em formatter.js — adicionar /limite
   na lista de comandos:

     `Comandos:\n` +
     `• */historico* ou */resumo* — suas últimas compras\n` +
     `• */limite* — quantos cupons restam esse mês\n` +
     `• */ajuda* — ver esta mensagem`

REQUISITOS:
- Comando funciona em qualquer step do onboarding ≥ 2 (o early return em
  step 0/1 do processarTexto continua intacto — não mexer).
- Não quebrar o /historico nem outros comandos.
- Manter os logs no padrão JSON.

Quando terminar, mostre o diff e simule 3 chamadas: usuário no início
(0/10), no meio (5/10) e no limite (10/10) — cole as 3 mensagens esperadas.
```

---

## 🧪 Task 5 — Teste E2E com 5 cupons reais (30min)

### Objetivo
Validar o fluxo completo: foto → leitura → resposta → resumo no mês → alerta (se passar 120% da média) → status /limite → resumo mensal forçado.

### Checklist dos 5 cupons

| # | Tipo de cupom | O que estamos testando | Resultado esperado |
|---|---|---|---|
| 1 | Cupom de mercado limpo | Caminho feliz | ✅ Resposta com itens + total + mês |
| 2 | Cupom borrado de propósito (foto desfocada) | `categoria_erro = "borrado"` | ✅ Mensagem específica de borrado |
| 3 | Cupom de farmácia | `categoria_erro = "nao_supermercado"` | ✅ Mensagem específica de farmácia |
| 4 | Cupom de mercado com valor 2x maior que os outros | Alerta de gasto +20% | ✅ Mensagem de alerta dispara |
| 5 | Foto qualquer (gato, paisagem) | `categoria_erro = "nao_e_cupom"` | ✅ Mensagem específica |

### Bônus (depois dos 5)
- Mandar `/limite` → mensagem com 4/10 (os 4 cupons que deram sucesso).
- Forçar o scheduler via endpoint: `curl POST /cron/monthly-summary -H 'X-Cron-Secret: ...' -H 'Content-Type: application/json'` → recebe o resumo mensal no seu WhatsApp.

### Separação humano vs Claude Code

| Quem | O quê |
|---|---|
| 🧑 **Gabriel** | (1) Enviar os 5 cupons no WhatsApp. (2) Disparar o `curl` do scheduler. (3) Confirmar visualmente que cada mensagem chegou correta. (4) Preencher a tabela de resultados. |
| 🤖 **Claude Code** | Criar um script auxiliar `scripts/test-e2e.js` que ajude a forçar o scheduler localmente (sem precisar de curl) e gerar checklist em markdown. |

### Prompt pra Claude Code (Task 5)

```text
Contexto: Já implementei o scheduler de resumo mensal (Task 1), os novos
templates (Task 2), os erros categorizados (Task 3) e o /limite (Task 4)
no bot Economizei.

Preciso de um script auxiliar pra testar o scheduler localmente sem precisar
chamar o endpoint via curl.

PARTE A — Criar scripts/test-e2e.js:

#!/usr/bin/env node
// Script auxiliar pra testes E2E da Semana 4.
// Uso: node scripts/test-e2e.js <comando> [args]
//
// Comandos:
//   resumo-mes <phone> [mes-YYYY-MM]     → dispara resumo mensal pra 1 user
//   status <phone>                       → mostra status do usuário
//   listar-ativos [mes-YYYY-MM]          → lista phones com compras no mês

require('dotenv').config();

const comando = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

(async () => {
  try {
    if (comando === 'resumo-mes') {
      if (!arg1) throw new Error('Uso: resumo-mes <phone> [mes-YYYY-MM]');
      const { executarResumoMensal } = require('../src/monthlySummary');
      const mes = arg2 || new Date().toISOString().slice(0, 7);
      console.log(`📤 Disparando resumo de ${mes} pra ${arg1}...`);
      const r = await executarResumoMensal(mes, arg1);
      console.log('✅ Resultado:', r);
    } else if (comando === 'status') {
      if (!arg1) throw new Error('Uso: status <phone>');
      const { buscarStatusUsuario } = require('../src/supabase');
      const s = await buscarStatusUsuario(arg1);
      console.log('📊 Status:', s);
    } else if (comando === 'listar-ativos') {
      const { listarUsuariosAtivosNoMes } = require('../src/supabase');
      const mes = arg1 || new Date().toISOString().slice(0, 7);
      const phones = await listarUsuariosAtivosNoMes(mes);
      console.log(`👥 ${phones.length} usuário(s) ativos em ${mes}:`);
      phones.forEach(p => console.log(`  - ${p.slice(0,5)}****`));
    } else {
      console.log('Comandos disponíveis:');
      console.log('  resumo-mes <phone> [mes-YYYY-MM]');
      console.log('  status <phone>');
      console.log('  listar-ativos [mes-YYYY-MM]');
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();

PARTE B — Adicionar no package.json em "scripts":

"test:resumo": "node scripts/test-e2e.js resumo-mes",
"test:status": "node scripts/test-e2e.js status",
"test:ativos": "node scripts/test-e2e.js listar-ativos"

PARTE C — Criar TESTE_E2E_SEMANA_4.md na raiz do projeto:

# Checklist E2E — Semana 4

Data do teste: ___________
Tester: ___________

## Cupom 1 — Mercado limpo (caminho feliz)
- [ ] Foto enviada
- [ ] Resposta recebida em <10s
- [ ] Loja correta? ___________
- [ ] Total correto? R$ ___________
- [ ] Itens listados? Quantos: ___________

## Cupom 2 — Borrado de propósito
- [ ] Foto enviada
- [ ] Mensagem retornou categoria "borrado"? (verificar log)
- [ ] Texto começa com "A foto ficou meio borrada"?

## Cupom 3 — Farmácia
- [ ] Foto enviada
- [ ] Mensagem categoria "nao_supermercado"?
- [ ] Texto menciona farmácia/restaurante?

## Cupom 4 — Mercado com valor anômalo (>120% da média)
- [ ] Foto enviada
- [ ] Resposta normal chegou
- [ ] Mensagem de alerta separada chegou (~1s depois)
- [ ] Percentual no alerta faz sentido?

## Cupom 5 — Não é cupom (foto de gato/paisagem)
- [ ] Foto enviada
- [ ] Mensagem categoria "nao_e_cupom"?

## Comando /limite
- [ ] Enviei "/limite"
- [ ] Mensagem mostra "X de 10"?
- [ ] X bate com cupons que deram sucesso (cupons 1 e 4 → X=2)?

## Scheduler forçado
- [ ] Rodei: `npm run test:resumo 55XXXXXXXXXXX`
- [ ] Recebi a mensagem de resumo mensal?
- [ ] Estatísticas batem com o que enviei?

## Idempotência
- [ ] Rodei o mesmo comando uma 2ª vez
- [ ] Saída diz "pulados: 1"?

## Observações / Bugs encontrados



REQUISITOS:
- Script tem que rodar standalone (`node scripts/test-e2e.js status 5511...`)
- Não duplica lógica — só importa do src/.
- Logs do logger.js continuam acontecendo (você vai ver JSON no terminal).

Quando terminar, me mostre:
1. Confirmação de que `node scripts/test-e2e.js` (sem args) mostra a ajuda
2. O caminho do TESTE_E2E_SEMANA_4.md
```

---

## 🔚 Pós-Semana 4 — Checklist humano de fechamento

Antes de fechar a semana e passar pra Semana 5 (Beta Soft + Indicação):

- [ ] Atualizar `CLAUDE.md` em **Decisões Tomadas** com a decisão da infra híbrida do scheduler.
- [ ] Atualizar `CLAUDE.md` em **Aprendizados** com o que surpreendeu no teste E2E.
- [ ] Adicionar print de teste E2E preenchido na pasta `Economizei app/`.
- [ ] Verificar logs do Railway por ~24h pra ver se rate limit do Z-API foi atingido em algum ponto.
- [ ] Confirmar no Supabase que a tabela `resumos_mensais_enviados` está sendo populada.
- [ ] Decidir se ativa o GitHub Actions failsafe agora ou só na Semana 5 (recomendação: ativar agora).

---

## 📚 Referências de arquivos tocados nesta semana

| Arquivo | Status | Quem mexe |
|---|---|---|
| `package.json` | modificado | Claude Code (instala node-cron) |
| `.env.example` | modificado | Claude Code |
| `.env` (real) | modificado | 🧑 Gabriel (CRON_SECRET) |
| `src/scheduler.js` | **novo** | Claude Code |
| `src/monthlySummary.js` | **novo** | Claude Code |
| `src/supabase.js` | +4 funções | Claude Code |
| `src/gemini.js` | prompt + validarSchema + inferirCategoria | Claude Code |
| `src/formatter.js` | +montarResumoMensal, +montarMensagemStatusLimite, +montarAvisoSucessoParcial, refatora montarMensagemErro | Claude Code |
| `src/index.js` | +endpoint cron, +scheduler boot, +comando /limite, +aviso sucesso parcial | Claude Code |
| `scripts/test-e2e.js` | **novo** | Claude Code |
| `.github/workflows/monthly-cron.yml` | **novo** | Claude Code |
| `TESTE_E2E_SEMANA_4.md` | **novo** | Claude Code |
| Supabase — tabela `resumos_mensais_enviados` | **nova** | 🧑 Gabriel (SQL no editor) |

---

## ⏱️ Orçamento final

| Bloco | Tempo previsto | Quem |
|---|---|---|
| Setup | 0h30 | Claude Code + Gabriel (SQL) |
| Task 1 — Scheduler | 3h00 | Claude Code |
| Task 2 — Template | 1h00 | Claude Code |
| Task 3 — Erros polidos | 1h30 | Claude Code |
| Task 4 — `/limite` | 1h00 | Claude Code |
| Task 5 — Teste E2E | 0h30 | Gabriel + script Claude Code |
| **Total** | **7h30** | ~5h supervisionando Claude Code + 2h de trabalho ativo do Gabriel (SQL, deploy, testes) |

> ✅ Bate com as 7h do roadmap original + 30min de setup necessário (não estava na estimativa).

---

*Plano gerado em 2026-05-16 com base na auditoria real de `src/` e no estado documentado em `CLAUDE.md`.*
