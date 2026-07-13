# 🇨🇦 Economizei em Vancouver — Recibos Canadenses (insights)

> **Data:** 2026-07-09 · **Origem:** exercício de viabilidade pedido pelo Gabriel (usar o Economizei aqui do Canadá, com recibos de qualquer comércio, não só supermercado).
> **Natureza:** documento de estratégia/insight. Zero código de produto foi tocado nesta sessão. A tarefa concreta e enxuta foi enfileirada como **cod-0065** na `AGENDA.md`.
> **Relação com o Longo Prazo:** isto adianta uma fatia concreta da **Frente 2 (internacionalização)** da seção 7.2 do `CLAUDE.md` / `Horizonte_Longo_Prazo_2026-07-09.md`. Não substitui a sessão de desdobramento das sementes cod-0060..0064 — é um MVP promovido a pedido explícito do Gabriel.

---

## 1. Resumo executivo

Tecnicamente, ler recibo canadense **reusa quase todo o pipeline atual** (Gemini Vision → `validarSchema` → `salvarCompra` → confirmação no WhatsApp). O esforço é **médio-baixo** para um MVP que "entende o recibo e guarda o dado organizado". As mudanças de código concentram-se em três pontos pequenos: o **prompt de extração**, o **parser numérico** e a **moeda na confirmação**.

O que **não** é código, e é o que realmente pesa, são três realidades do mercado canadense:

1. **Não existe cupom fiscal padronizado** (não há equivalente ao NFC-e brasileiro). Cada comércio imprime do seu jeito e os nomes de item vêm crípticos/abreviados → a **classificação** (o coração do produto) fica mais frágil.
2. **CASL** (lei anti-spam canadense) é **mais afiada que a LGPD** para o nosso modelo de mensagem proativa (alertas, lembretes de reengajamento).
3. **WhatsApp não domina no Canadá** — a tese "WhatsApp é o produto / zero atrito" enfraquece fora do Brasil; o ângulo defensável é o nicho da **diáspora brasileira/latina** em Vancouver, que já usa WhatsApp.

**Decisão desta sessão:** construir o MVP enxuto (entender + armazenar qualquer recibo, seguindo no WhatsApp), enfileirado como **cod-0065**, sem quebrar o comportamento pt-BR/BRL atual. Copy completa em inglês (i18n), leitura de fatura/PIX, gate Pro, provedor de WhatsApp canadense e consentimento CASL ficam **fora do MVP** (follow-ons / humano-legal).

---

## 2. O que se REUSA (aproveitando tudo que dá)

O produto já foi construído de um jeito que viaja bem. Reaproveita direto, sem tocar:

- **Canal WhatsApp** — o mesmo fluxo de webhook/entrada de imagem.
- **Gemini 2.5 Vision** — OCR + raciocínio é agnóstico de layout; lê recibo variado.
- **`validarSchema` / reconciliação item×total** — a lógica de conferência (soma dos itens × total, escolha da melhor tentativa) vale igual.
- **Esquema de dados** — `compras` (loja, data, total, tipo) + `itens_compra` (nome, `nome_canonico`, `categoria`, quantidade, preços) guardam qualquer recibo. Já lemos **não-mercado** (`tipo='outros'`) desde 2026-06-04 — recibo de restaurante/loja/farmácia já cai nesse caminho.
- **As 10 categorias** (carnes, hortifruti, laticínios, padaria, bebidas, limpeza, mercearia, congelados, doces, outros) são **conceitos universais** — só precisam de rótulo em inglês; a estrutura não muda.
- **Confirmação / `/gastos` / gráfico** — a mecânica de exibição é a mesma; muda o símbolo de moeda.
- **Pagamento (quando for a sério)** — aqui até melhora: Canadá = **Stripe em CAD**, muito mais simples que Hotmart/Wise/PIX. A empresa BC já resolve a entidade jurídica.

---

## 3. O que MUDA no código (por complexidade)

### Baixa (mecânico — é o miolo do MVP cod-0065)
| Item | Detalhe |
|---|---|
| **Parser numérico** (`coerceNumber`, `gemini.js`) | Hoje troca vírgula por ponto (`"99,90"→99.90`). Canadá usa ponto decimal + vírgula de milhar (`"1,299.90"`). Precisa lidar com os dois formatos sem quebrar o pt-BR. |
| **Prompt de extração** (`gemini.js`) | Hoje é "extrator de cupons fiscais brasileiros". Passa a **detectar a moeda/idioma** ($/inglês → CAD; R$/português → BRL), tornar **CNPJ opcional** (null quando ausente — Canadá tem GST/HST number, nem sempre no recibo) e canonizar item em inglês pelo tipo genérico ("milk", "chicken breast"). |
| **Moeda na confirmação** (`formatter.js`) | Um helper `fmtMoeda(valor, moeda)` que escolhe o símbolo ($ vs R$). Só a confirmação; **não** tocar `/planos`/`/assinar`. |

### Média (fora do MVP — follow-ons)
| Item | Detalhe |
|---|---|
| **i18n completo das mensagens** | Onboarding + 14 mensagens + 8 lembretes estão 100% em pt-BR hardcoded. Traduzir/estruturar por locale é a semente **cod-0063**. |
| **Persistência de moeda** | Guardar `compras.moeda` exige **migration** (`supabase/` = zona proibida da máquina) — segue o padrão do A9 (rodar o ALTER **antes** de o código gravar, senão `salvarCompra` quebra). Até lá, a moeda vai na confirmação mas **não persiste**. |
| **Provedor de WhatsApp** | A Z-API é focada no Brasil. Um número canadense provavelmente exige **Meta WhatsApp Cloud API** (ou Twilio) — e reabre a questão de template aprovado pra mensagem fora da janela 24h. |

### O risco técnico real — a classificação (o coração)
No Brasil, o NFC-e (obrigatório nacionalmente desde jan/2026) dá recibos relativamente padronizados. No Canadá **não há** sistema fiscal eletrônico obrigatório equivalente: cada rede imprime diferente e os nomes de item vêm crípticos ("PC ORG MLK 2% 4L", "GV CHKN BRST"). Como toda a inteligência do produto depende do `nome_canonico` liderar pelo tipo genérico, a classificação fica **mais difícil** justamente no mercado novo. Por isso **cod-0065 exige o corpus de regressão pt-BR verde** (o comportamento brasileiro não pode regredir) **+ um mini-corpus canadense** com recibos reais que o Gabriel fornecer.

---

## 4. Implicações legais

### CASL — Canada's Anti-Spam Legislation (a mais séria pro nosso modelo)
Toda **mensagem eletrônica comercial** enviada de/para/dentro do Canadá exige **(1)** consentimento (expresso ou implícito), **(2)** identificação do remetente e **(3)** mecanismo de descadastro. Nossos **lembretes de reengajamento** (dias 2/7/10/30/60), avisos de limite e qualquer upsell são exatamente o que a lei regula. A confirmação de cupom (iniciada pelo usuário) provavelmente é transacional e ok; o "volta aqui!" não é. **Multa até CAD 10 milhões por violação** (empresa). Implicação prática: o onboarding precisa capturar **consentimento explícito** e todo lembrete precisa de **opt-out** — mais rígido que o `/apagar` da LGPD.

### Privacidade — BC PIPA + PIPEDA (os dois)
- **BC PIPA** cobre usuários na Colúmbia Britânica e é **mais amplo** que a lei federal (vale independentemente de a atividade ser comercial).
- **PIPEDA** entra pela **transferência internacional de dados** (Supabase/Gemini fora da província/país).
- Recibo tem dado financeiro (e às vezes nome/loyalty card) → consentimento, limitação de finalidade, salvaguardas e notificação de vazamento. **A nossa postura atual ajuda:** imagem processada em memória e **descartada** (decisão 2026-06-24) já reduz muito o risco.

### Outras
- **Nome de loja:** a cautela que já temos no Brasil (não citar mercado em tom negativo/implicando parceria) vale igual ou mais.
- **Impostos no recibo:** GST/PST/HST aparecem como linhas — decisão de produto se entram ou não no total por categoria (código trivial).

---

## 5. As três teses do produto que o Canadá testa

1. **"WhatsApp é o produto / zero atrito"** — **enfraquece.** ~15–16M usuários de WhatsApp no Canadá; Messenger lidera (~55%), SMS/iMessage dominam. Forte na diáspora (brasileiros/latinos/sul-asiáticos), não no mercado amplo.
2. **"Cupom fiscal padronizado"** — **cai.** Sem NFC-e, a extração fica mais suja.
3. **Pagamento + entidade jurídica** — **melhora.** Empresa BC + Stripe CAD é trivial perto da gambiarra brasileira.

**Ângulo recomendado, se algum:** nicho da **diáspora brasileira/latina em Vancouver** — preserva a tese do canal (já usam WhatsApp), sofre a mesma dor, e é barato de testar com o próprio Gabriel como primeiro usuário.

---

## 6. Escopo do MVP (cod-0065) e o que fica de fora

**Dentro (a máquina faz, firewall-limpo):** entender recibo canadense de **qualquer comércio** + parser numérico CA + moeda certa na confirmação + seguir no WhatsApp + corpus de regressão (pt-BR intacto + mini-corpus CA). Reusa todo o pipeline.

**Fora (follow-on ou humano/legal):**
- i18n completo das mensagens em inglês (**cod-0063**).
- Persistência de `compras.moeda` (**migration humana**, padrão A9).
- Leitura de fatura de cartão / comprovante PIX (**Frente 1**, cod-0060..0062).
- Gate Pro / pricing (financeiro — humano).
- Provedor de WhatsApp para número canadense (Meta Cloud API / Twilio).
- **Consentimento CASL** no onboarding + opt-out nos lembretes (humano/legal — pré-requisito para qualquer envio proativo a usuário no Canadá).

---

## Fontes
- CASL — [Canadian Chamber of Commerce](https://chamber.ca/resources/canadas-anti-spam-legislation/) · [CRTC FAQ](https://crtc.gc.ca/eng/com500/faq500.htm)
- Privacidade — [Provincial laws that may apply instead of PIPEDA (OPC)](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/prov-pipeda/) · [BC PIPA (Clym)](https://clym.io/regulations/british-columbia-privacy-act)
- Fiscal — [Brazil mandates nationwide NFC-e 2026 (VATupdate)](https://www.vatupdate.com/2025/12/15/brazil-mandates-nationwide-digital-fiscal-receipts-nfc-e-for-retailers-starting-january-2026/) · [CRA receipt requirements](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/keeping-records/acceptable-format-imaging-paper-documents-backing-electronic-files.html)
- Canal — [Most used messenger by brand in Canada 2025 (Statista)](https://www.statista.com/forecasts/998457/most-used-messenger-by-brand-in-canada/) · [Most popular messaging apps by country (Infobip)](https://www.infobip.com/blog/most-popular-messaging-apps-by-country)
