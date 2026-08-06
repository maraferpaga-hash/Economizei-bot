# 🔓 Desdobramento — Frente 1 (PIX), Frente 2 (Canadá) e o 2º canal (App/Painel)

> **Data:** 2026-08-05 · **Gatilho:** o Gabriel forneceu o material humano que faltava (comprovantes de PIX + recibos de Vancouver) e decidiu a natureza do aplicativo.
> **Efeito:** esta é a **sessão de desdobramento** que estava pendente desde 2026-07-09 (`Horizonte_Longo_Prazo_2026-07-09.md`). As sementes deixam de ser sementes.
> **Entregável físico desta sessão:** `test/corpus/` (corpus de regressão versionado) — não é código, é **material**. Commitar sozinho, sem risco.

---

## 0. O que chegou e o que isso destrava

| Material | Quantidade | Destrava |
|---|---|---|
| Comprovantes de PIX (2 PDFs + 1 print de app) | 3 layouts totalmente diferentes | **cod-0062** — estava parada desde 07-15 esperando exatamente isso |
| Recibos de Vancouver | 6 (2 supermercados, 1 farmácia, 1 loja de variedades, 1 serviço) | **cod-0065** — estava parada desde 07-09 pelo mesmo motivo |
| PDF de livro (veio junto) | 1 | Virou **caso negativo** do corpus: PDF legível que não é documento financeiro |

Tudo transcrito em `test/corpus/{pix,canada}/`. As fotos dos recibos canadenses (do
próprio Gabriel) estão versionadas; **os PDFs de PIX não** — contêm nome, CPF, chave
PIX (telefone) e conta de terceiros. O corpus guarda a transcrição **pseudonimizada**,
com formato preservado. Regra completa em `test/corpus/README.md`.

---

## 1. Frente 1 — PIX: o que o material real ensinou

O desenho de 07-15 assumia "comprovante de PIX = valor + data + contraparte". Os
três documentos reais mostraram **quatro coisas que não estavam no desenho** — e
duas delas fariam o produto mentir.

### 1.1 🔴 Direção do PIX (enviado × recebido) — invariante novo

O print do app diz **"Pix enviado"**. Um comprovante de PIX **recebido** tem layout
quase idêntico e significa o oposto: **entrada de dinheiro, não gasto**. Se o bot
registrar um PIX recebido como `compra`, o total do mês infla e todo o andar de cima
(alerta, teto, resumo) mente.

**Decisão:** `direcao` (`enviado` | `recebido`) é campo **obrigatório** da extração.
Só `enviado` vira gasto. `recebido` → resposta honesta ("isso é uma entrada, não
registro como gasto") e nada é gravado. **Se a direção não for determinável com
segurança, falhar — nunca assumir.**

### 1.2 🔴 O valor nem sempre está escrito

No print do Mercado Pago **não existe campo "Valor"**. O número só sai da subtração
`Saldo antes − Saldo depois` (1.680,67 − 1.480,67 = 200,00). E a data é "4/ago",
**sem ano**.

**Decisão:** vale o §0.4 do `CODE_GUIDE` (*saída segura > erro confiante*) em dobro.
Valor deduzido é aceitável **se a conta fecha exatamente**; na dúvida, o bot pergunta
ou recusa. O corpus tem esse caso marcado com `aceita_falha_honesta: true` — o teste
aceita acerto **ou** recusa honesta, e reprova **número errado**.

### 1.3 🟢 Deduplicação sai de graça

Todo comprovante traz o **EndToEndId** (`E` + 8 ISPB + 12 AAAAMMDDHHMM + 11 alfanum).
É determinístico e único por transação — mandar o mesmo comprovante duas vezes
(ou o PDF e o print da mesma transação) deve gravar **uma** compra.

Isso importa porque a dedup atual (`mensagens_processadas`) está **fail-open** em
produção pelo problema de RLS (S2). O EndToEndId é uma segunda linha de defesa que
não depende disso.

**Decisão:** guardar `id_transacao` e usá-lo como chave de idempotência. ⚠️ **Requer
coluna nova** → padrão anti-A9: escrever o `.sql`, o Gabriel roda **antes** do código
que grava. Não fazer "no meio do caminho".

### 1.4 🟢 `compras.tipo` aceita `'pix'` sem migration — pendência humana FECHADA

Estava aberto na AGENDA: *"verificar se há CHECK em `compras.tipo`"*. Verificado no
repositório: `migration_2026-06-07_coerencia_outputs.sql` faz apenas
`ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'mercado'` — **sem CHECK**.
Logo `tipo='pix'` grava hoje, zero migration. **Riscar da lista de ações do Gabriel.**

Mas confirma-se o furo já previsto: em `salvarCompra` o guard de preços é
`if (tipo !== 'outros')` — com `'pix'` os "itens" entrariam em `precos_mercado`.
Como PIX tem `itens: []` o efeito prático hoje é nulo, mas a troca para
`=== 'mercado'` continua obrigatória (já está nos critérios da cod-0062).

### 1.5 ⚫ O que NUNCA é persistido

Os comprovantes trazem CPF, chave PIX (**que é um telefone**), agência e conta.
Nada disso entra no banco. Lê-se para localizar a contraparte e descarta-se —
mesma postura de processa-em-memória-e-descarta do cupom, e é o que torna o
`/apagar` verdadeiro.

---

## 2. Frente 2 — Recibo canadense: o que o material real ensinou

O `cod-0065` assumia "trocar R$ por $ e aceitar `1,299.90`". O corpus mostra que o
problema é maior — e **quase todo ele é do coração (classificação), não de moeda**.

### 2.1 🔴 Três formatos de data no mesmo país, no mesmo mês

| Recibo | Impresso | Significa |
|---|---|---|
| No Frills | `26/07/29` | 2026-07-29 (**AA/MM/DD**) |
| Shoppers | `Jul 29, 2026` | 2026-07-29 |
| Dollarama | `2026-07-29` | 2026-07-29 (ISO) |
| Revs | `27-JUL-26` | 2026-07-27 (DD-MON-AA) |

O caso do No Frills é uma **armadilha real**: lido como DD/MM/AA vira 2029.
Só se resolve porque Shoppers e Dollarama do **mesmo dia** imprimem a data por
extenso. Regra: em ambiguidade de data, **ancorar pelo formato menos ambíguo
disponível e, na dúvida, marcar suspeita** — data errada joga a compra no mês errado
e envenena a média.

### 2.2 🔴 Nomes de item são muito mais crípticos que no Brasil

`MNSTR ZERO ULTRA` · `PCBM PINTO BEAN` · `NN BAR P MOZZ` · `LYSL ALL PRP LMN` ·
`NN THCK SLC BCN` · `GRN & PRTN BREAD`. Não são abreviações leves: são consoantes
comprimidas por limite de caracteres da impressora.

**Decisão (confirma a cod-0065):** `nome_canonico` de recibo canadense é escrito
**em inglês** (`"mozzarella cheese part skim bar no name"`), porque é nesse idioma
que o usuário perguntaria. **A `categoria` continua no enum pt-BR de 10 valores** —
não bifurcar a taxonomia, ou todo `insights.js` teria que existir duas vezes.

O contexto de seção do recibo (`21-GROCERY`, `22-DAIRY`, `31-MEATS`, `27-PRODUCE`,
`34-BAKERY`) é **o melhor sinal disponível** para decifrar o nome — é praticamente
uma categoria impressa pelo próprio mercado. Usar.

### 2.3 🟠 Linhas que não são produto, mas entram na soma

`DEPOSIT 0.10` · `RECYCLING FEE 0.07` · `ECO FEE` · e a linha **negativa**
`Member Pricing −3.58`. Se a reconciliação item×total ignorar qualquer uma, a soma
nunca fecha e o cupom é rejeitado à toa.

**Decisão:** registrar como item com `categoria: "outros"`, mantendo o sinal
(inclusive negativo). A reconciliação passa a aceitar linha negativa.

### 2.4 🟠 Item por peso e pagamento ≠ total

`0.620 kg @ $4.39/kg = 2.72` → `quantidade` deixa de ser inteiro.

E o caso mais interessante: no recibo `ca-04`, **TOTAL 64.78** mas o cartão foi
debitado **54.78** — 10.00 vieram de pontos de fidelidade resgatados.

> ❓ **Decisão sua:** "quanto eu gastei" nesse dia é 64,78 ou 54,78?
> Proposta: **`total` = o que saiu do bolso (54,78)**, com o desconto guardado à
> parte. Motivo: o produto responde "para onde foi o **dinheiro**", e pontos não são
> dinheiro que saiu agora. Contra: para comparar preço entre mercados, a base certa
> é o preço cheio. Dá para ter os dois — `total` (pago) e `total_bruto` — mas isso
> é coluna nova.

### 2.5 🟢 GST/PST são um presente de dados

O imposto vem **separado por tipo e por item** (`GST 5%` sobre a base tributável,
`PST 7%` sobre a mesma). Como alimento básico é zero-rated no Canadá, **a linha de
imposto revela o que não é comida** — um classificador secundário grátis, útil para
conferir a categoria que o modelo escolheu.

---

## 3. O 2º canal — App/Painel (decisão do Gabriel, 2026-08-05)

**O que ele definiu, em verbatim resumido:** o app **não substitui** o WhatsApp.
Os dois funcionam **juntos e separados**, com **as mesmas funcionalidades** e o
**mesmo banco** — os dois aceitam foto. A diferença é **como o usuário visualiza**.
O WhatsApp segue carro-chefe pela simplicidade; o app é o canal mais organizado.

### 3.1 A consequência arquitetural (a parte que importa)

Hoje o bot é um monólito de webhook: a regra de negócio mora dentro do manipulador
do WhatsApp. "Dois canais com as mesmas funcionalidades" **só é sustentável se a
regra sair do canal**:

```
                    ┌──────────────────────────┐
   WhatsApp ──────► │  adaptador whatsapp      │ ──┐
   (Z-API)          └──────────────────────────┘   │
                                                   ├──► src/core/  (regra de negócio,
   App/PWA ───────► ┌──────────────────────────┐   │     canal-agnóstica)
   (HTTP)           │  adaptador http (API)    │ ──┘         │
                    └──────────────────────────┘             ▼
                                                        Supabase (um só)
```

Sem isso, cada função nova teria que ser escrita duas vezes — e as duas versões
divergiriam em semanas.

### 3.2 Identidade: o número de telefone continua sendo a chave

`usuarios.phone_number` é PK hoje. **Manter.** O app loga com o número + código
enviado no WhatsApp (OTP). Consequências, todas boas:

- zero migration de identidade;
- a pessoa que já usa o bot **abre o app e os dados já estão lá** — não existe "criar conta";
- a foto mandada no app aparece no histórico do WhatsApp e vice-versa, **de graça**;
- é literalmente o "funcionam juntos e separados" que ele pediu.

### 3.3 Superfície: PWA primeiro, nativo depois (se necessário)

PWA (web instalável na tela inicial) roda hoje: câmera funciona via `<input capture>`,
deploy na Vercel junto com a landing, **custo zero**, sem loja de aplicativo, sem
revisão, sem taxa anual de desenvolvedor, e **sem depender da empresa BC**. Se um dia
a presença nas lojas for necessária, o mesmo código vira app nativo empacotado —
não se joga fora nada.

### 3.4 🔴 Pré-requisito que deixou de ser opcional

Abrir uma API para um app **força resolver o S2/S4** (o bot provavelmente roda com a
chave `anon` e o RLS nunca foi ligado). Hoje isso é um risco silencioso; com um app
público, vira exposição direta. **Nenhuma tarefa de API sobe antes do S2 confirmado.**

Regra de ouro do desenho: **o app nunca fala com o Supabase direto** — fala com a
nossa API, que é quem tem a chave privilegiada.

### 3.5 Fases (cada uma é uma tarefa de máquina)

| Fase | O que é | Depende de |
|---|---|---|
| **A — API só-leitura** | `GET /api/resumo`, `/api/compras`, `/api/itens` + login OTP pelo número | S2/S4 (RLS) |
| **B — PWA casca** | login, tela do mês (total, categorias, gráfico), lista de compras. Greenfield em `painel/` | Fase A |
| **C — núcleo canal-agnóstico** | extrair `src/core/recibo.js` **sem mudar comportamento** (os 482 testes atuais são a rede) | — (pode ir em paralelo) |
| **D — foto pelo app** | `POST /api/recibo` usando o núcleo da Fase C | B + C |
| **E — paridade de comandos** | `POST /api/pergunta` reusando o Agente | D |

> **Regime de revisão diferente (proposta):** a Fase B é **greenfield em pasta
> isolada** — não toca `src/`, não toca classificação, não toca dinheiro, e o pior
> caso é apagar a pasta. Merece run maior que o teto de 150 linhas da Máquina 2.1,
> revisada **por comportamento** (abre no navegador e funciona?) em vez de linha a
> linha. As Fases C e D **não** — mexem no bot vivo e ficam no teto normal.

---

## 4. Decisões — RESPONDIDAS pelo Gabriel na mesma sessão (2026-08-05)

| # | Pergunta | Decisão |
|---|---|---|
| 1 | `total` com fidelidade resgatada *(§2.4)* | ✅ **valor PAGO (54,78)**. O impresso vira `total_bruto` — e é ele quem reconcilia os itens, nunca o `total`. |
| 2 | Coluna `id_transacao` *(§1.3)* | ✅ **autorizada**. SQL: `supabase/migration_2026-08-05_pix_direcao_id_transacao.sql`. |
| 3 | PIX recebido *(§1.1)* | ✅ **registrar marcado como ENTRADA** (`compras.direcao='entrada'`), nunca contando como gasto. Coluna na mesma migration. |
| 4 | Regime de revisão greenfield *(§3.5)* | ⏳ **ainda aberta** — só fica urgente quando a cod-0069 destravar. |
| 5 | Fatura de cartão | ✅ **entra agora**, em paralelo ao PIX: *"vamos testando e estabilizando com o tempo"*. Virou **cod-0072**. |

### 4.1 Consequências que essas decisões criam

- **Decisão 1** obriga separar as duas grandezas: quem fecha a conta dos itens é `total_bruto`; quem responde "quanto gastei" é `total`. Trocar os dois faz **todo recibo com resgate de pontos ser rejeitado à toa**.
- **Decisão 3** obriga **toda agregação de gasto a filtrar `direcao='saida'`** — média, `/gastos`, resumo mensal, alerta, teto, supérfluo. Um único ponto esquecido transforma entrada em gasto. É exatamente o mesmo tipo de erro que o `tipo='outros'` causou em 06-07, então a lição já existe.
- **Decisão 5** coloca na fila o documento mais sensível do produto **antes** de o PIX ter rodado uma vez em produção. Foi escolha consciente dele; o risco fica registrado aqui: a fatura expõe a vida financeira inteira, e sem uma fatura real no corpus dá para escrever o parser mas **não** para afirmar que funciona.

### 4.2 Correção de rastreabilidade (mesma sessão)

Na primeira montagem do corpus, **5 dos 6 recibos canadenses foram salvos com o nome errado** — a ordem dos anexos não correspondeu à ordem em que foram lidos. Conferido imagem por imagem e corrigido; o `md5sum` de cada arquivo foi registrado na verificação. Lição para o corpus da fatura e para qualquer material futuro: **conferir arquivo↔conteúdo antes de versionar**, porque um corpus com rótulo errado ensina o modelo a coisa errada e ninguém percebe.

---

*Regras que continuam valendo: classificação é o coração (corpus obrigatório antes de subir); firewall advisory com commit humano; máquina não faz merge nem push; nada disso depende da empresa BC.*
