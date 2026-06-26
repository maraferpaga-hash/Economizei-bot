# 🤖 Desenho Técnico — Agente de Perguntas (Q&A sobre o gasto)

> **Status:** rascunho de arquitetura para discussão. Nada codado ainda.
> **Data:** 2026-06-18
> **Escopo:** cenário **A** (perguntas sobre os dados DO PRÓPRIO usuário) — "quanto gastei em carne esse mês?", "tô gastando mais que mês passado?".
> **Estratégia de construção:** implementar a **Opção 1** (LLM só interpreta; código formata a resposta), já deixando **os encaixes prontos para a Opção 2** (LLM redige respostas mais ricas e entende perguntas mais variadas) sem refatorar a base.
> **Norte:** "a cada interação o usuário sai sabendo algo sobre o dinheiro dele que não sabia antes." Esta feature é uma **nova interface** (perguntar) por cima das inteligências que já existem (`insights.js`), não uma feature nova.

---

## 1. Princípio organizador: o número nunca nasce no LLM

A regra que governa toda a arquitetura:

> **O LLM nunca calcula, inventa, arredonda ou narra um número que não tenha vindo do nosso código.**
> Ele só faz duas coisas: (1) **classificar** a pergunta numa intenção conhecida e (2) — só na Opção 2 — **redigir** a resposta a partir de números que o nosso código já formatou e entregou pronto.

Tudo que segue é consequência disso. É também o que torna a Opção 2 segura o suficiente para existir.

---

## 2. Arquitetura — fluxo ponta a ponta

```
texto livre do usuário (não casou nenhum comando em processarTexto)
        │
        ▼
[1] COTA            verificarLimitePerguntas(phone)  → estourou? responde aviso e para
        │
        ▼
[2] CLASSIFICADOR   classifier.classificar(texto, registro)
        │           1 chamada Gemini (JSON, temp 0) → { intent, params, confianca }
        │
        ▼
[3] GUARDA DE       guards.validarClassificacao(...)
    ENTRADA         intent ∈ registro? params válidos? confiança suficiente?
        │           └── não → FALLBACK gracioso (pede pra reformular / sugere comandos)
        ▼
[4] EXECUTOR        intent.executar(phone, params)  → FATO estruturado
        │           (usa supabase.js + insights.js — código determinístico já testado)
        │           └── { temDados:false } → resposta honesta "não tenho dados de X em Y"
        ▼
[5] RENDER          render.responder(fato, modo)
        │           modo='template' (Opção 1)  → intent.template(fato)   ← agora
        │           modo='llm'      (Opção 2)  → narração + GUARDA DE FIDELIDADE  ← depois
        ▼
[6] LOG             registrarPergunta(...)  (intenção, confiança, temDados, modo, fidelidade_ok)
        │
        ▼
   resposta enviada ao usuário (enviarMensagem)
```

O **modo** ([5]) é um único ponto de troca. Hoje fica fixo em `template`. Quando a Opção 2 for ligada, vira uma flag (env ou por usuário Pro). **Nada antes do passo [5] muda entre Opção 1 e Opção 2** — esse é o encaixe que você pediu.

---

## 3. A peça central: o Registro de Intenções (`intents.js`)

Tudo gira em torno de um registro declarativo. Cada intenção é um objeto autocontido. É isto que serve as duas opções ao mesmo tempo: a classificação, a execução, o template (Opção 1) e a base de fatos (Opção 2) saem todos daqui.

```js
// src/agent/intents.js  (esboço)
{
  id: 'gasto_por_categoria',
  descricao: 'Quanto a pessoa gastou em uma categoria, num período',
  exemplos: [
    'quanto gastei em carne', 'gastos com bebida esse mês',
    'quanto foi de limpeza em maio',
  ],
  parametros: {
    categoria: { tipo: 'enum', valores: CATEGORIAS_VALIDAS, obrigatorio: false },
    periodo:   { tipo: 'periodo', default: 'mes_atual' },
  },

  // Busca o dado + roda a análise. NÃO formata texto. Devolve um FATO.
  async executar(phone, params) {
    const mesRef = resolverMesRef(params.periodo);          // periodo.js (determinístico)
    const cats   = await buscarGastosPorCategoria(phone, mesRef);
    if (!cats.length) return { temDados: false, mesRef };
    const alvo = params.categoria
      ? cats.find(c => c.categoria === params.categoria)
      : null;
    return {
      temDados: true,
      mesRef,
      categoria: params.categoria || null,
      valor: alvo ? alvo.valor : null,         // número cru
      total: cats.reduce((s,c)=>s+c.total,0),
      // strings JÁ FORMATADAS — usadas pelo template E pela allowlist da Opção 2:
      fmt: {
        valor: alvo ? `R$ ${brl(alvo.total)}` : null,
        total: `R$ ${brl(total)}`,
      },
    };
  },

  // OPÇÃO 1 — resposta determinística. O LLM não toca aqui.
  template(fato) {
    if (!fato.temDados) return `Ainda não tenho gastos registrados em ${nomeDoMes(fato.mesRef)}.`;
    if (!fato.categoria) return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.total} no total.`;
    if (fato.valor == null) return `Não encontrei gastos de ${rotuloCategoria(fato.categoria)} em ${nomeDoMes(fato.mesRef)}.`;
    return `Em ${nomeDoMes(fato.mesRef)} você gastou ${fato.fmt.valor} em ${rotuloCategoria(fato.categoria)}.`;
  },
}
```

**Intenções do MVP (3, conforme combinado):**

| id | Pergunta típica | Reusa | Camada |
|---|---|---|---|
| `gasto_total_mes` | "quanto gastei esse mês?" | `buscarGastosPorCategoria` / `buscarTotaisMensais` | 1 Ciência |
| `gasto_por_categoria` | "quanto gastei em carne?" | `buscarGastosPorCategoria` | 1–2 |
| `comparar_meses` | "tô gastando mais que mês passado?" | `buscarTotaisMensais` + `calcularEconomia` | 2 Inteligência |

**Expansão natural (depois de observar o log):** `inflacao_item` (reusa `analisarInflacaoPessoal`), `raio_x_categorias` (reusa `analisarRaioXCategorias`), `economia_acumulada` (reusa `calcularEconomia`). Todas já têm a inteligência pronta no `insights.js` — viram intenção quando o log mostrar que as pessoas perguntam.

---

## 4. O passo da classificação (`classifier.js`)

Uma única chamada ao Gemini, no mesmo padrão do `gemini.js` atual (`model: 'gemini-2.5-flash'`, `temperature: 0`, `responseMimeType: 'application/json'`). O prompt é montado **a partir do registro** (lista de ids + descrições + exemplos), então adicionar intenção não exige reescrever prompt.

Saída obrigatória e fechada:

```json
{ "intent": "gasto_por_categoria",
  "params": { "categoria": "carnes", "periodo": "mes_atual" },
  "confianca": "alta" }
```

Regras inegociáveis:
- O classificador **só pode** devolver um `intent` da lista, ou `"fora_de_escopo"`.
- Os `params` saem de **vocabulário fechado** (categorias do `CATEGORIAS_VALIDAS`; período como rótulo, não como data).
- Ele **não** devolve nenhum número de gasto. Não é função dele.

> Sobre custo: hoje começamos com `gemini-2.5-flash`. Quando quiser cortar custo, trocar o modelo desta chamada por `gemini-2.5-flash-lite` é uma linha — a classificação é tarefa simples e o Lite dá conta. (Ver simulação de custo: ~R$0,0009–0,0086/pergunta.)

---

## 5. ❤️ O Sistema de Guarda de Honestidade (o coração)

Esta é a parte que merece mais cuidado. Um bot de finanças que erra um número uma vez perde a confiança para sempre — e isso **já mordeu o projeto** (correção de 07/06: "os números não fazem sentido"). A defesa é **em camadas** (defense in depth): se uma falha, a próxima segura.

### Modelo de ameaça — como o agente poderia mentir

1. **Número inventado** — afirma um valor que não existe no banco.
2. **Número distorcido** — pega um valor real e arredonda/troca ao narrar (risco da Opção 2).
3. **Intenção errada** — usuário pergunta X, classificador escolhe Y (número certo, pergunta errada).
4. **Parâmetro errado** — intenção certa, categoria/período errado ("carne" → bebidas; "mês passado" → mês atual).
5. **Resposta sem dado** — período sem compras, mas o bot insinua um número.
6. **Conclusão sem base** — "você está gastando demais" com 1 ponto de dado.
7. **Dado parcial como completo** — ignora o resíduo "não identificado" e subconta o total.

### As camadas de defesa

**Camada 0 — Arquitetural (a mais forte): o número não nasce no LLM.**
Por construção (seção 1), todo número vem de `executar()` → JS determinístico sobre o Supabase, reusando `insights.js`/`supabase.js` que já foram testados. **Mata a ameaça #1 de raiz**, nas duas opções. Esta é a camada que faz a Opção 1 ser, na prática, tão segura quanto os comandos `/gastos` atuais. A conta em si também é sempre do código — ver **Regra da Matemática** no adendo: nunca pedimos ao LLM que calcule, só que narre.

**Camada 1 — Vocabulário fechado na classificação.**
A saída do classificador é validada contra o registro: `intent` tem que existir; `categoria` tem que estar em `CATEGORIAS_VALIDAS`; `periodo` é resolvido pelo **nosso** parser determinístico (`periodo.js`), nunca por uma data que o LLM escreveu. Qualquer coisa fora → rejeita → fallback. Corta boa parte de #4.

**Camada 2 — Porta de topicalidade (decisão 2026-06-24).**
O critério não é a confiança, é o **assunto**. Se a pergunta é plausivelmente sobre dinheiro/compras/valores, o agente **responde a intenção mais provável** — sem perguntar de volta (zero atrito, escolha do Gabriel). A pergunta de volta fica reservada para o caso **off-topic**: quando a pergunta não tem nada a ver com finanças, o classificador devolve `fora_de_escopo` e o bot responde com gentileza que só fala sobre os gastos da pessoa. Para amortecer o risco de intenção mal-lida (#3), **a resposta sempre reafirma o que entendeu** ("Seus gastos com carne em maio foram…"), de modo que um erro de leitura fica visível e o usuário se corrige — sem o atrito de um "você quis dizer?". O número continua blindado pelas outras camadas, então responder o palpite mais provável não cria risco de número errado, só de eventualmente responder a pergunta ligeiramente trocada (aceitável em leitura, e capturado pelo log).

**Camada 3 — Guarda de presença de dado (sem dado → sem número).**
`executar()` devolve `{ temDados: false }` quando não há compras no período/categoria. O render é **obrigado** a dar uma resposta honesta de ausência ("ainda não tenho gastos de limpeza em maio") — nunca um zero disfarçado de fato nem um número insinuado. Reusa as flags `temDados`/`temConclusao` que o `insights.js` já expõe. Mata #5.

**Camada 4 — Guarda de suficiência para conclusões (não superinterpretar).**
Conclusões da Camada 2/3 ("acima da média", "subiu de preço") só aparecem quando a função de análise **já decidiu** que há base: `analisarRaioXCategorias` só preenche `comparativo` com `mesesComDados > 0`; `analisarInflacaoPessoal` exige 2+ observações, ≥14 dias e descarta variação > 150%. O agente **só pode repassar a conclusão que a análise validou** — ele não tem permissão de transformar um `temConclusao:false` numa afirmação. Mata #6. *(Bônus: isso já está pronto no `insights.js`; o agente só precisa respeitar, não reimplementar.)*

**Camada 5 — Firewall de fidelidade numérica (o que torna a Opção 2 segura).**
Quando a Opção 2 deixar o LLM **redigir**, é assim que se impede a distorção (#2):
- O `executar()` entrega ao LLM um objeto de fato com **todos os números já formatados como string** (`fmt.valor = "R$ 248,30"`, `fmt.total`, etc.), usando o **mesmo `brl()`** do `formatter.js`. O prompt manda: *"use exatamente estas strings; nunca calcule, arredonde ou altere um número; se precisar de um número que não está aqui, diga que não tem."*
- **Validação pós-geração (determinística):** antes de enviar, o `guards.conferirFidelidadeNumerica(textoLLM, fato)` extrai por regex todo token numérico/monetário da resposta do LLM e confere se **cada um** está na *allowlist* das strings que nós entregamos. Se aparecer um número que não demos → **descarta a resposta do LLM e cai no template da Opção 1** para aquela pergunta.
- Resultado: o LLM **não consegue** despachar um número que não saiu do nosso código. A naturalidade da Opção 2 sem o risco dela.

> Para a Camada 5 funcionar, **o `brl()` tem que ser a única fonte de formatação** — template e allowlist precisam gerar a mesma string, senão a checagem dá falso-rejeição. Nota de implementação importante.

**Camada 6 — Contrato de saída (sem conselho além do dado).**
O prompt de narração proíbe conselho financeiro/promessa que vá além de reapresentar os fatos (respeita o `financial-firewall` e a regra de não dar recomendação financeira). Tom formal (regra do projeto: nada de gíria no bot).

**Camada 7 — Observabilidade / trilha de auditoria.**
Todo Q&A loga: pergunta, intenção, params, confiança, `temDados`, modo, e (Opção 2) se o firewall de fidelidade passou. Serve para (a) o aprendizado OODA — descobrir o que as pessoas realmente perguntam — e (b) detectar regressão: um pico de falhas de fidelidade é alarme precoce.

### Resumo de cobertura

| Ameaça | Coberta por |
|---|---|
| #1 número inventado | Camada 0 |
| #2 número distorcido (Opção 2) | Camada 5 |
| #3 intenção errada | Camadas 2, 7 |
| #4 parâmetro errado | Camadas 1, 2 |
| #5 resposta sem dado | Camada 3 |
| #6 conclusão sem base | Camada 4 |
| #7 dado parcial | Camada 0 (resíduo "não identificado" já entra no `buscarGastosPorCategoria`) |

> Observação honesta: a Opção 1 elimina #1 e #2 por completo. #3 e #4 (intenção/parâmetro) são risco compartilhado pelas duas opções, porque a *classificação* é feita pelo LLM nos dois casos — por isso as Camadas 2 e 7 valem desde o MVP, não só na Opção 2.

---

## ⭐ Adendo (2026-06-18) — Geração fundamentada no banco: a visão de "chat de verdade"

> Incluído após retorno do Gabriel: *"o Gemini vai gerar somente a resposta, e pra isso não precisaríamos ter respostas prontas — a pergunta seria processada como um chat normal de IA, respondida com base nos dados que a gente tem no banco, todos tirados de lá, tornando impossível inventar dados."*

**Você entendeu certo, e essa é a destinação do produto — é exatamente a Opção 2.** O que você descreveu tem nome técnico: **geração fundamentada** (RAG — *Retrieval-Augmented Generation*). O fluxo é: o nosso código busca os dados reais no banco → entrega esses dados ao Gemini como contexto → o Gemini **redige** a resposta em linguagem natural apoiado *só* nesses dados. Sem template à vista, parecendo conversa.

E o desenho **já está pronto pra isso**: o `executar()` de cada intenção (seção 3) já devolve um "fato estruturado" tirado do banco — é justamente esse fato que vira o contexto entregue ao Gemini no `modo='llm'`. Sua visão não muda a fundação; ela é o passo 4 do faseamento (ligar a Opção 2).

**A única correção honesta — e ela pesa muito num produto de finanças:** fundamentar nos dados **reduz drasticamente** a chance de inventar, mas, sozinho, **não torna impossível**. Mesmo recebendo "você gastou R$ 248,30 em carne", um LLM ainda pode, de vez em quando: trocar dígitos ("R$ 284,30"), **errar uma conta** se a gente pedir que ele some/compare, ou acrescentar uma afirmação que o dado não sustenta. LLM é ótimo redigindo e ruim em aritmética. Então "impossível inventar" é a meta certa — falta o que transforma meta em **garantia**:

1. **Firewall de fidelidade (Camada 5, já no desenho):** entregamos os números **já calculados e já formatados** e, depois que o Gemini escreve, uma checagem automática confere se *todo* número usado por ele está na lista do que demos. Número que não saiu do nosso código → resposta descartada. Ele **não consegue** despachar um número inventado, mesmo tentando.
2. **Regra da matemática (explicitada agora):** **toda conta é feita no nosso código, nunca pelo Gemini.** "Tô gastando mais que mês passado?" → a subtração e a porcentagem saem do `calcularEconomia` (que já faz isso), e o Gemini recebe o **resultado pronto** só pra colocar em palavras. Nunca pedimos pro LLM "calcular" — só "narrar".

**As "respostas prontas" (templates) somem?** Pro usuário, sim — em regime de Opção 2 ele vê texto gerado, conversa de verdade. Mas o template **continua nos bastidores como rede de segurança**: é pra ele que a resposta cai na vez rara em que o firewall barra o texto do Gemini. Deixa de ser a voz principal e vira o **airbag**.

**Dois sabores de "chat de verdade" (vale decidir — ver Open Questions):**

- **(A) Fundamentação estruturada** (o que está desenhado): o nosso código decide *qual* dado buscar (via intenção) e faz as contas; o Gemini só redige. Mais seguro, conta feita por nós.
- **(B) Fundamentação aberta / agente com acesso ao banco** (mais perto do "chat normal de IA" que você descreveu): o próprio Gemini decide o que consultar — via *function-calling*, escolhendo entre funções de consulta que a gente define — e monta a resposta. Responde até perguntas que não pré-definimos; é o mais "conversa livre", mas concentra mais risco, então exige **as mesmas travas acima, não menos**.

Caminho recomendado: começar no **(A)** e evoluir pro **(B)** reusando as mesmas guardas — mesmo no (B), quem faz a conta é o código (function-calling = o LLM escolhe a função, a função calcula) e o firewall continua valendo. Assim chegamos no "chat de verdade" sem abrir mão da honestidade do número.

---

## 6. Módulos

**Novos (pasta `src/agent/` — mesma filosofia "um arquivo, uma responsabilidade" do `insights.js`):**

| Arquivo | Responsabilidade | Complexidade |
|---|---|---|
| `agent/intents.js` | Registro declarativo de intenções (descrição, params, `executar`, `template`) | Média |
| `agent/classifier.js` | Monta prompt do registro, chama Gemini, devolve `{intent, params, confianca}` | Média |
| `agent/periodo.js` | Parser determinístico de período ("esse mês"/"mês passado"/"maio"/"YYYY-MM") | Baixa |
| `agent/guards.js` | Funções **puras** de guarda: `validarClassificacao`, `conferirFidelidadeNumerica`, `extrairNumeros` | Média (coração) |
| `agent/render.js` | `responder(fato, modo)` — template agora; narração+firewall depois | Baixa→Média |
| `agent/index.js` | Orquestrador `responderPergunta(phone, texto)` (cota → classify → guard → execute → render → log) | Baixa |

**Modificados:**

| Arquivo | Mudança |
|---|---|
| `src/index.js` | O `else` final do `processarTexto` (hoje "Não consegui entender") passa a chamar `agent.responderPergunta(phone, texto)` + checagem de cota antes |
| `src/supabase.js` | `incrementarPerguntas`, `verificarLimitePerguntas`, `registrarPergunta`, `purgarPerguntasLog` |
| `src/formatter.js` | Expor/garantir `brl()` como helper único + mensagens de fallback/desambiguação |
| migration SQL | contador + tabela de log (abaixo) |

---

## 7. Data model / migration

```sql
-- contador de perguntas no mês (espelha compras_mes_atual; mesmo reset mensal)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perguntas_mes_atual INT NOT NULL DEFAULT 0;

-- log para aprendizado (OODA) + auditoria de honestidade. TTL curto (LGPD: minimização).
CREATE TABLE IF NOT EXISTS perguntas_log (
  id           BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  pergunta     TEXT,                 -- texto cru; purga em 90 dias
  intent       TEXT,
  params       JSONB,
  confianca    TEXT,                 -- alta|media|baixa|fora_de_escopo
  tem_dados    BOOLEAN,
  modo         TEXT,                 -- template|llm
  fidelidade_ok BOOLEAN,             -- null no modo template
  respondeu    BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_perguntas_log_intent ON perguntas_log (intent);
```

- **Reset mensal:** reaproveitar o mesmo mecanismo que zera `compras_mes_atual`.
- **Purga:** seguir o padrão do `purgarMensagensProcessadas` (TTL), por LGPD — o texto cru da pergunta não precisa viver para sempre.

---

## 8. Cota / Free vs Pro (decisão pendente — ver Open Questions)

O desenho suporta os dois caminhos com uma env:
- `LIMITE_PERGUNTAS_FREE` (ex.: generoso, tipo 30/mês) + ilimitado para Pro / `features_pro_ate` ativo (reusa `temFeaturesProAtivas`).
- Como o custo por pergunta é desprezível (texto, não imagem), a cota aqui é **anti-abuso**, não trava de custo — então o Free pode ser generoso sem comprometer unit economics. Candidato forte a também ser um **diferencial Pro** ("pergunte qualquer coisa") com os comandos seguindo no Free.

---

## 9. Erro & fallback gracioso

O `else` de hoje é seco ("Não consegui entender"). O agente melhora isso, mas **sem fingir que entendeu**:
- Confiança baixa / fora de escopo → "Não entendi bem 🙂. Você pode me perguntar coisas como *quanto gastei em carne esse mês* ou *tô gastando mais que mês passado*. Ou veja tudo em */ajuda*."
- Erro técnico (Gemini caiu, query falhou) → resposta neutra + sugere o comando equivalente (`/gastos`), nunca um número chutado.
- Sempre oferecer a "saída por comando" — o comando determinístico é a rede de segurança da conversa.

---

## 10. Faseamento (OODA — observar antes de escalar)

> Decisão 2026-06-24: o MVP já nasce com o **LLM narrando** (Opção A estruturada, `modo='llm'`), com o **template como airbag**. Não há fase "só template" voltada ao usuário.

1. **MVP — Opção A estruturada com narração (Free, 3 intenções):** classificação → executor (código busca o dado e faz a conta) → **Gemini narra** a partir do fato → firewall de fidelidade (Camada 5) → template como fallback. Cota plana 30/mês com aviso no meio + **log de tudo**.
2. **Observar (~2 semanas):** ler `perguntas_log` — quais perguntas aparecem, quais caem em `fora_de_escopo`, e a taxa de `fidelidade_ok` (saúde da narração). Isso diz o que construir, sem achismo.
3. **Expandir intenções:** adicionar as que o log pedir (inflação, raio-x, economia — inteligência já pronta no `insights.js`). Aqui entra a decisão de **Pro vs Free** (tarefa humana, por tocar `is_pro`).
4. **Opção B — fundamentação aberta (function-calling):** depois de (A) validada, o Gemini passa a **escolher** entre as funções de consulta (as intenções viram "ferramentas"), respondendo perguntas não pré-definidas. **Mesmas guardas** (Camada 0/5 + Regra da Matemática). Costura na Seção 14.

---

## 11. Decisões tomadas (2026-06-24)

As Open Questions foram resolvidas pelo Gabriel:

1. **Free vs Pro:** **Free básico com as 3 intenções** no MVP. Expansão (mais intenções / conversa mais rica) vira Pro depois — e talvez parte volte ao Free. *(O gate por Pro é tarefa HUMANA — ver fronteira do firewall abaixo.)*
2. **Limite:** **30 perguntas/mês**, com **aviso no meio** (ao cruzar ~15) pra pessoa ficar ciente. Limite plano, igual pra todos no MVP.
3. **Desambiguação → porta de TOPICALIDADE:** se a pergunta é plausivelmente sobre **dinheiro / compras / valores**, o bot **responde a intenção mais provável** (sem perguntar de volta). Só quando a pergunta **não faz sentido nenhum** com finanças (assunto totalmente fora) ele faz a pergunta de volta / diz que só responde sobre gastos. *(Atualiza a Camada 2.)*
4. **Log da pergunta crua:** **sim**, guardar para aprendizado, com purga (TTL) e menção na privacidade.
5. **Modelo:** **`gemini-2.5-flash`** por agora (acessível e já no projeto). Trocar pra `flash-lite` é troca de 1 linha quando quiser cortar custo.
6. **Sabor da geração:** começar na **(A) estruturada com o LLM narrando** (modo `llm` desde o MVP — código escolhe o dado e faz a conta, Gemini redige) e, depois de (A) validada, evoluir pra **(B) aberta / function-calling**. A costura de (B) já fica prevista (Seção 14).

### 🚧 Fronteira do firewall financeiro (o que a máquina NÃO pode codar)

Duas peças desta feature caem na **zona proibida** da `AGENDA.md` e por isso são **tarefas humanas**, não da automação:

- **A migration** (coluna `perguntas_mes_atual` + tabela `perguntas_log`) mora em `supabase/` — caminho bloqueado. **Gabriel cria e roda.**
- **O gate por Pro** (mais tarde) referencia `is_pro` / `features_pro_ate` — tokens bloqueados pelo scan de conteúdo. **Gabriel implementa quando expandirmos pra Pro.**

Consequência de design no MVP: a **cota é plana (30/mês para todos), sem nenhuma referência a `is_pro`/`features_pro_ate`** — assim o código do agente fica 100% na zona permitida e passa no `check:firewall`. A diferenciação Free/Pro entra depois, pela mão do Gabriel.

---

## 12. Pré-requisitos de deploy (quando for codar)

1. Rodar a migration (contador + `perguntas_log`).
2. Configurar envs: `LIMITE_PERGUNTAS_FREE`, (opcional) `AGENTE_MODO=template|llm`, (opcional) `AGENTE_MODELO`.
3. `git push` (feito pelo Gabriel na máquina dele — o ambiente Cowork não tem credencial).
4. Gate final recomendado: `node --check src/agent/*.js` local antes do push.

---

## 13. Veredito

Complexidade **média**, puxada para baixo porque a inteligência (a parte difícil) já existe no `insights.js`/`supabase.js` — o agente é uma **casca de conversa + guardas** por cima do que já roda. Sem infra nova (fica no Express; n8n custaria ~178× o custo real da IA no início). O trabalho de verdade, e onde mora o risco, é o **Sistema de Guarda de Honestidade** da seção 5 — e é exatamente nele que o desenho concentra o cuidado, porque num produto de finanças a honestidade do número *é* o produto.

---

## 14. Costura para a Opção B (fundamentação aberta) — prevista desde já

A Opção B é o "chat de verdade": o Gemini decide **o que** consultar, em vez de um classificador escolher entre 3 intenções fixas. Para que ela seja um **acréscimo**, não uma reescrita, o MVP (A) já é desenhado com estas costuras:

1. **Intenções = ferramentas em potencial.** Cada item do `intents.js` já tem `id`, `descricao`, `exemplos`, `parametros` e um `executar(phone, params)` puro de I/O. Esse é exatamente o formato de uma *function declaration* de tool-calling. Migrar para B = expor o mesmo array como ferramentas para o Gemini, sem reescrever a lógica de dados.
2. **A matemática e a busca já estão fora do LLM.** Em A e em B, quem busca e calcula é o `executar`. Em B o Gemini só ganha o poder de *escolher* qual `executar` chamar — nunca o de calcular. A Regra da Matemática vale igual.
3. **As guardas são as mesmas.** `guards.conferirFidelidadeNumerica` (Camada 5) opera sobre o texto final, independente de quem escolheu a consulta. O firewall não muda entre A e B.
4. **O render já é plugável.** `render.responder(fato, modo)` isola a geração; B reusa o mesmo passo de narração + firewall.
5. **O ponto de troca é único:** trocar `classifier.classificar()` (escolha por classificação) por um loop de function-calling do Gemini (escolha pelo próprio modelo). Tudo antes e depois é reaproveitado.

**Gatilho para construir B:** Opção A no ar, `fidelidade_ok` alto e estável no log, e o log mostrando perguntas recorrentes fora das 3 intenções (sinal de que a flexibilidade de B agrega). Tarefa correspondente já registrada no backlog da `AGENDA.md` (cod-0018), em estado de espera até A ser validada.
