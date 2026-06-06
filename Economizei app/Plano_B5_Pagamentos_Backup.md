# Plano Técnico: Comparativo de Mercados (B5) + Backup (B7) + Pagamentos Automáticos

> Criado em: 2026-06-02  
> Status: Rascunho técnico — implementar conforme gatilhos do CLAUDE.md

---

## 1. Comparativo entre Mercados (B5)

### Por que ainda não existe e o que desbloqueia

O comparativo é a **killer feature do Pro R$9,90** — sem ela, o plano vende só "cupons ilimitados + alerta inteligente", que é defensável mas não matador. É o produto que precisa de dados reais para funcionar: quanto mais usuários mandam cupons, mais preciso fica o comparativo.

**Gatilho para implementar:** ≥ 30 usuários ativos mandando cupons regularmente.  
Com menos que isso, o comparativo fica raso demais (poucos preços por loja) e gera mais frustração do que valor.

---

### Arquitetura da feature

#### Nova tabela: `precos_mercado`

```sql
CREATE TABLE precos_mercado (
  id              BIGSERIAL PRIMARY KEY,
  item_canonico   TEXT NOT NULL,        -- ex: "arroz_tipo1_5kg"
  loja_cnpj       TEXT NOT NULL,        -- CNPJ extraído pelo Gemini
  loja_nome       TEXT,                 -- nome da loja (fallback se sem CNPJ)
  preco_unitario  NUMERIC(10,2),        -- preço por unidade
  data_coleta     DATE NOT NULL,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por item + loja
CREATE INDEX idx_precos_item_loja ON precos_mercado(item_canonico, loja_cnpj);
-- Retém só os últimos 90 dias (preços velhos são inúteis)
CREATE INDEX idx_precos_data ON precos_mercado(data_coleta);
```

**Retenção:** deletar preços com `data_coleta < NOW() - 90 days` via cron semanal.

#### Canonicalização de produtos

Problema: o mesmo produto aparece de formas diferentes em cada loja e estado.  
- "ARROZ BRANCO TIPO 1 5KG" / "ARR TIP1 5KG TROD" / "ARROZ 5 KG TIPO 1"

**Abordagem recomendada (sem custo de Gemini extra):**
1. Durante o `lerRecibo()`, já temos o array de itens com nome.
2. Criar função `canonicalizarItem(nome)` em Node.js com regras simples:
   ```js
   function canonicalizarItem(nome) {
     return nome
       .toLowerCase()
       .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
       .replace(/[^a-z0-9\s]/g, '')                        // só letras, números
       .replace(/\s+/g, '_')
       .trim();
   }
   // "ARROZ BRANCO TIPO 1 5KG" → "arroz_branco_tipo_1_5kg"
   ```
3. Para itens muito curtos (≤ 3 chars) ou genéricos ("MISC", "OUTROS"), não indexar.
4. **Fase 2 (com mais usuários):** usar Gemini para agrupar nomes similares em clusters —
   enviar batch de 100 itens únicos por semana para categorização automática.

#### Fluxo de coleta de preços

No `salvarCompra()`, após salvar os itens normais, paralelamente:
```js
// src/supabase.js — adicionar ao final de salvarCompra()
async function indexarPrecosMercado(cnpj, nomeLoja, itens, dataCompra) {
  if (!cnpj || itens.length === 0) return; // sem CNPJ, sem indexação
  const registros = itens
    .filter(i => i.preco_unitario > 0 && i.nome?.length > 3)
    .map(i => ({
      item_canonico: canonicalizarItem(i.nome),
      loja_cnpj:     cnpj,
      loja_nome:     nomeLoja,
      preco_unitario: i.preco_unitario,
      data_coleta:   dataCompra,
    }));
  if (registros.length === 0) return;
  await supabase.from('precos_mercado').insert(registros);
}
```

**Privacidade:** os preços são indexados por CNPJ, não por usuário — não há ligação entre o usuário e os preços que ele contribuiu.

#### Comando `/comparar` no bot

Quando o usuário pede o comparativo:
1. Pegar os top-10 itens que ele mais compra (últimos 90 dias)
2. Para cada item, buscar o preço médio por loja nos últimos 30 dias
3. Mostrar ranking de lojas com % de economia potencial

```
📊 *Comparativo de preços*

Baseado nas suas compras dos últimos 3 meses:

🛒 *Arroz 5kg*
  Pessotto Max: R$ 21,90 ✅ melhor
  Sakashita: R$ 24,50
  Atacadão: R$ 19,80 ✅✅ mais barato

💡 Comprando no Atacadão seus 3 itens mais frequentes,
   você economizaria ~R$ 28 por mês.
```

**Disponibilidade:** só mostrar comparativo quando tiver ≥ 3 lojas com dados para o item.

#### View de comparativo no Supabase

```sql
CREATE OR REPLACE VIEW v_comparativo_mercados AS
SELECT
  item_canonico,
  loja_nome,
  loja_cnpj,
  ROUND(AVG(preco_unitario)::numeric, 2) AS preco_medio,
  COUNT(*)                               AS amostras,
  MAX(data_coleta)                       AS ultima_coleta
FROM precos_mercado
WHERE data_coleta >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY item_canonico, loja_nome, loja_cnpj
HAVING COUNT(*) >= 2  -- mínimo de 2 amostras para confiabilidade
ORDER BY item_canonico, preco_medio;
```

---

## 2. Automação de Pagamentos

### Contexto atual

Hoje: PIX manual → Gabriel confirma → ativa `is_pro = true` no Supabase.  
**Gatilho para automatizar:** ≥ 5 pagantes via PIX (conforme CLAUDE.md).

### Opção recomendada: Mercado Pago (Assinaturas)

**Por que Mercado Pago sobre Stripe:**
- API em português, documentação local, sem configuração de impostos BR
- Suporta PIX, boleto e cartão na mesma API
- Assinaturas recorrentes via API (sem webhooks manuais)
- Conta PJ brasileira — mais fácil de abrir (Conta PJ MP + CNPJ)
- Taxa: ~3.99% + R$0,40 por transação PIX/cartão (variável por método)

**Fluxo automatizado com Mercado Pago:**

```
Usuário manda /pro no bot
  → Bot gera link de assinatura via MP API
  → Usuário clica e paga (PIX ou cartão)
  → MP dispara webhook → POST /webhooks/mercadopago
  → Bot verifica assinatura → ativa is_pro = true no Supabase
  → Bot envia mensagem de confirmação
```

#### Endpoints a implementar

**Novo arquivo: `src/payments.js`**

```js
const axios = require('axios');
const { log } = require('./logger');

const MP_BASE = 'https://api.mercadopago.com';
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

// Cria plano de assinatura (chamar uma vez no setup)
async function criarPlano(nome, valor, frequencia = 'monthly') {
  const { data } = await axios.post(`${MP_BASE}/preapproval_plan`, {
    reason: nome,
    auto_recurring: {
      frequency: 1,
      frequency_type: frequencia,
      transaction_amount: valor,
      currency_id: 'BRL',
    },
    back_url: 'https://economizei.space',
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
  return data;
}

// Gera link de assinatura para um usuário
async function gerarLinkAssinatura(planId, phoneNumber) {
  const { data } = await axios.post(`${MP_BASE}/preapproval`, {
    preapproval_plan_id: planId,
    payer_email: `${phoneNumber}@economizei.placeholder`,
    back_url: 'https://economizei.space',
    external_reference: phoneNumber, // ligação entre pagamento e usuário
  }, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
  return data.init_point; // URL de checkout
}

// Processa webhook do MP — chame quando receber POST /webhooks/mercadopago
async function processarWebhook(payload) {
  const { type, data } = payload;
  if (type !== 'subscription_preapproval') return { ignorado: true };
  
  const { id: preapprovalId } = data;
  const { data: sub } = await axios.get(
    `${MP_BASE}/preapproval/${preapprovalId}`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
  
  const phone = sub.external_reference;
  const ativa = sub.status === 'authorized';
  
  log('pagamento_webhook', { phone_masked: phone?.slice(0,5)+'****', status: sub.status });
  return { phone, ativa, plano: sub.reason };
}

module.exports = { criarPlano, gerarLinkAssinatura, processarWebhook };
```

**Novo endpoint em `src/index.js`:**

```js
app.post('/webhooks/mercadopago', async (req, res) => {
  res.sendStatus(200); // MP exige 200 imediato
  try {
    const { phone, ativa, plano } = await processarWebhook(req.body);
    if (!phone) return;
    // Ativa/desativa Pro no Supabase
    await supabase.from('usuarios').update({ is_pro: ativa }).eq('phone_number', phone);
    // Notifica usuário
    if (ativa) {
      await enviarMensagem(phone, `✅ *Pagamento confirmado!*\nSeu plano *${plano}* está ativo. Seja bem-vindo ao Pro!`);
    }
    log('pagamento_processado', { phone_masked: phone.slice(0,5)+'****', ativa });
  } catch (err) {
    log('pagamento_webhook_erro', { erro: err.message });
  }
});
```

#### Variáveis de ambiente a adicionar

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PLAN_ID_INDIVIDUAL=    # ID do plano R$9,90
MERCADOPAGO_PLAN_ID_FAMILIA=       # ID do plano R$15
MERCADOPAGO_PLAN_ID_FAMILIA_PLUS=  # ID do plano R$22
```

#### Passos para ativar

1. Abrir conta PJ no Mercado Pago (requer CNPJ)
2. Criar os 3 planos de assinatura via API (ou pelo painel MP)
3. Configurar webhook no painel MP → URL: `https://seu-bot.railway.app/webhooks/mercadopago`
4. Adicionar variáveis de ambiente no Railway
5. Testar com conta de teste do MP antes de ir a produção

**Custo estimado por pagante/mês:**
- Plano Individual R$9,90: taxa MP ~R$0,79 → líquido R$9,11
- Plano Família R$15: taxa ~R$1,10 → líquido R$13,90
- Plano Família+ R$22: taxa ~R$1,28 → líquido R$20,72

---

## 3. Backup e Disaster Recovery (B7)

### Situação atual

O Supabase Free Tier **não inclui backups automáticos**. Se o banco corromper ou uma query errada deletar dados, não há como recuperar.

### Plano de mitigação (custo zero)

**Opção A — Supabase Pro (recomendado quando MRR ≥ R$200)**
- Custo: US$25/mês (~R$125)
- Inclui: backups diários automáticos com retenção de 7 dias, Point-in-Time Recovery
- **Gatilho de ativação:** MRR ≥ R$200 (quando o custo do Pro representa < 10% da receita)

**Opção B — Backup manual semanal via script (custo zero agora)**

Criar script `scripts/backup.js` que:
1. Exporta todas as tabelas para JSON via Supabase REST API
2. Salva em arquivo local ou envia por e-mail como anexo

```js
// scripts/backup.js — rodar manualmente 1x/semana até ativar Supabase Pro
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backup() {
  const tabelas = ['usuarios', 'compras', 'itens_compra', 'resumos_mensais_enviados'];
  const timestamp = new Date().toISOString().slice(0, 10);
  const resultado = {};

  for (const tabela of tabelas) {
    const { data, error } = await supabase.from(tabela).select('*');
    if (error) { console.error(`Erro em ${tabela}:`, error.message); continue; }
    resultado[tabela] = data;
    console.log(`${tabela}: ${data.length} registros`);
  }

  const nomeArquivo = `backup_economizei_${timestamp}.json`;
  fs.writeFileSync(nomeArquivo, JSON.stringify(resultado, null, 2));
  console.log(`Backup salvo em: ${nomeArquivo}`);
}

backup().catch(console.error);
```

**Frequência recomendada:** 1x/semana (domingo), arquivo salvo localmente e copiado para Google Drive ou e-mail.

### Política de retenção de dados

Registrar como decisão técnica:

| Tabela | Retenção | Ação após prazo |
|---|---|---|
| `compras` + `itens_compra` | 12 meses após última atividade | Deletar via cron anual |
| `usuarios` | Enquanto ativo | Deletar só via `/apagar` |
| `resumos_mensais_enviados` | 12 meses | Deletar via cron anual |
| `lembretes_enviados` | 90 dias | Deletar via cron semanal |

**Cron de limpeza a adicionar em `scheduler.js`:**

```js
// Toda 2ª domingo às 3h — limpa dados antigos
cron.schedule('0 3 * * 0', async () => {
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
  
  // Limpa lembretes com mais de 90 dias
  const noventaDias = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await supabase.from('lembretes_enviados')
    .delete()
    .lt('enviado_em', noventaDias.toISOString());
    
  log('limpeza_dados_ok', { ate: noventaDias.toISOString().slice(0, 10) });
}, { timezone: 'America/Sao_Paulo' });
```

### Risco de vazamento de chave de API

Protocolo de resposta caso uma chave vaze (ex: commitada por acidente no Git):

1. **Supabase:** Settings → API → Regenerate `anon key` e `service_role key` (imediato)
2. **Z-API:** Painel → Instância → Regenerar token (imediato)
3. **Gemini:** Google AI Studio → API Keys → Delete + Create nova (imediato)
4. Atualizar todas as variáveis no Railway → redeploy automático
5. Verificar Railway logs por 24h para detectar acessos suspeitos

**Prevenção:** `.gitignore` já inclui `.env`. Nunca commitar `.env`. Usar `git-secrets` ou similar em pre-commit hook.

---

## Resumo de prioridades e gatilhos

| Item | Prioridade | Gatilho de implementação | Custo estimado |
|---|---|---|---|
| Comparativo mercados — coleta de preços | Alta | Deploy imediato (coleta silenciosa) | R$0 |
| Comparativo mercados — comando /comparar | Alta | ≥ 30 usuários ativos | R$0 |
| Pagamentos automáticos MP | Alta | ≥ 5 pagantes via PIX + CNPJ aprovado | R$0 (% por transação) |
| Backup script manual | Imediato | Agora (rodar toda semana) | R$0 |
| Supabase Pro (backups automáticos) | Média | MRR ≥ R$200 | ~R$125/mês |
| Limpeza automática de dados antigos | Baixa | Pode ser adicionada junto com o reengajamento | R$0 |
