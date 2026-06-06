---
name: economizei-security-lgpd
description: Garante conformidade LGPD e práticas de segurança apropriadas ao Economizei — que processa cupom fiscal com CPF e dados financeiros. Use para revisar fluxo de dados, escrever política de privacidade, decidir retenção, configurar acesso, lidar com pedido de exclusão, ou antes de qualquer integração nova que toca dado do usuário. Não use para LGPD genérica fora do contexto do produto.
---

# 🔒 economizei-security-lgpd

## Objetivo
Tratar LGPD como **regra de produto, não checkbox jurídico**. Toda feature passa pelo filtro: "isso respeita o consentimento, a finalidade declarada e a política de retenção?". O Economizei processa CPF + histórico de compras — dados sensíveis. Errar aqui é destruir o canal e a reputação.

## Quando usar
- Antes de publicar Política de Privacidade + Termos.
- Antes de adicionar campo novo no Supabase (precisa coletar isso? qual finalidade?).
- Antes de integrar serviço externo (ex: Mercado Pago, ferramenta de analytics).
- Quando usuário pede exclusão ou exportação de dados.
- Quando algum dado precisa ser compartilhado (parceria, suporte, anúncio).
- Em qualquer revisão de logs ou observabilidade que vaze CPF/nomes.
- Antes de rodar Meta Ads (Meta exige declaração de uso de dados).

## Quando NÃO usar
- Para LGPD genérica fora do produto (consulte advogado).
- Para questões corporativas (NF, IR) — isso é financeiro.
- Para criar termo do zero sem entender o fluxo do produto — leia o stack antes.

## Entradas ideais
- Descrição do fluxo de dado em questão.
- Quem coleta, onde armazena, por quanto tempo, com quem compartilha.
- Finalidade declarada.

## Saídas esperadas
1. **Diagnóstico** (conforme / parcial / não-conforme).
2. **Gaps específicos** (lista curta, no máximo 5).
3. **Correções acionáveis** que cabem em ≤2h cada.
4. **Texto de política/aviso** pronto pra uso, se for o caso (em português claro, não juridiquês).
5. **O que adicionar no CLAUDE.md** se a decisão for estrutural.

## Regras de comportamento

### Princípios não-negociáveis
1. **Consentimento explícito e granular.** No primeiro `oi`, o bot pergunta antes de processar a primeira foto.
2. **Finalidade declarada e única.** Cupom é processado para análise de gasto pessoal do usuário, ponto. Nada mais.
3. **Retenção limitada.** Cupom bruto (imagem original) é deletado após análise. JSON estruturado fica enquanto o usuário tiver conta. Usuário inativo >12 meses tem dados anonimizados.
4. **Não compartilhar dado bruto com terceiros.** Gemini processa, mas a chamada é "stateless" — não treinar com nossos dados.
5. **CPF é PII (dado pessoal).** Mascarar em logs (`123.***.***-09`). Nunca em log estruturado puro.
6. **Direitos do titular acessíveis via comando do bot.** `/meusdados` exporta, `/apagar` deleta.
7. **Vazamento = transparência em 72h.** Política interna: comunicar o usuário + ANPD em ≤72h, mesmo que a lei dê 48–72.
8. **DPO (Encarregado) declarado.** Mesmo sendo o Gabriel no início, precisa estar no rodapé do site com email de contato.

### O que precisa estar publicado antes de qualquer Meta Ads
1. **Política de Privacidade** (linkada no rodapé da landing + no bot).
2. **Termos de Uso** (idem).
3. **Email de contato do Encarregado** (DPO).
4. **Aviso de cookies** se a landing usar (mesmo Google Analytics básico).

### Campos sensíveis no produto e como tratar
| Campo | Sensibilidade | Tratamento |
|---|---|---|
| `phone_number` | Médio (PII) | Hash + último 4 dígitos em logs. Texto completo só em queries específicas. |
| `cpf` (extraído do cupom) | **Alto** | Mascarar em logs SEMPRE. Não exibir no resumo do bot ao usuário. |
| Imagem do cupom | Alto | Deletar em ≤24h após processamento. Não persistir no Supabase Storage. |
| Lista de itens (`itens_compra`) | Médio | Persiste enquanto conta ativa. Anonimizar após 12m de inatividade. |
| Total / loja | Baixo | Persiste enquanto conta ativa. |

### Princípios técnicos
- `.env` nunca commitado. `.env.example` sim.
- Chaves de API (Gemini, Z-API, Supabase) **nunca** em log.
- Service role key do Supabase só no backend; nunca no client.
- Webhook do Z-API protegido por verificação de origem (header / token).
- Backup do Supabase semanal, retenção 30 dias, criptografado.

## Fluxo de execução

```
1. Identificar o que está em revisão (feature / política / integração / incidente).
2. Mapear o fluxo do dado: coleta → processamento → armazenamento → compartilhamento → exclusão.
3. Cruzar com os princípios não-negociáveis. Apontar gaps.
4. Pra cada gap, propor correção mínima e acionável.
5. Se for texto público (política, mensagem do bot), escrever em PT claro.
6. Sugerir teste de validação ("se eu pedir /apagar, todos os meus dados saem?").
7. Atualizar CLAUDE.md se for decisão estrutural.
```

## Checklist de qualidade
- [ ] Verifiquei consentimento, finalidade, retenção, compartilhamento, direitos?
- [ ] CPF não aparece em log em texto claro?
- [ ] Imagem original tem prazo de exclusão definido?
- [ ] Política mencionada está em PT claro (não juridiquês)?
- [ ] Há canal de contato com Encarregado?
- [ ] Direitos do titular têm fluxo prático no bot (`/meusdados`, `/apagar`)?
- [ ] Backup criptografado e com retenção definida?
- [ ] Nenhuma chave de API exposta?

## Erros comuns a evitar
- **Copiar política de outro SaaS sem adaptar.** LGPD exige especificidade.
- **Termo de 8 páginas em juridiquês.** Usuário B/C não lê. Quebra o consentimento informado.
- **"Aceito" em letra pequena.** Consentimento precisa ser claro e granular.
- **Persistir imagem do cupom "porque pode ser útil".** Não pode. Princípio da minimização.
- **Log de erro com objeto inteiro.** Vaza tudo. Sempre log estruturado com campos filtrados.
- **Atrelar finalidade vaga ("melhoria do serviço").** ANPD pega.
- **Esquecer do `/apagar`.** Direito de exclusão é exigido por lei.
- **Compartilhar dado com "parceiro" sem aviso prévio + opt-in renovado.**

## Templates prontos

### Mensagem de consentimento no primeiro contato (bot)
> "Antes da gente começar — pra analisar o cupom eu preciso ler a foto, extrair os itens e guardar o resumo (não a imagem). Tudo fica privado, só você vê. A imagem é deletada em 24h. Mais detalhes em [link política].
>
> Pode mandar a primeira foto? 📸"

### Resposta ao comando `/meusdados`
> "📦 Aqui está o resumo dos seus dados no Economizei:
> - 12 compras registradas
> - Última compra: 11/05/2026
> - Total acumulado: R$ 2.847,30
>
> Quer exportar tudo em CSV? Responde 'exportar'.
> Quer apagar tudo? Responde 'apagar tudo' (ação irreversível)."

### Esqueleto da Política de Privacidade (versão curta — PT claro)
```markdown
# Política de Privacidade — Economizei

**Quem somos:** Economizei (CNPJ XX.XXX.XXX/0001-XX), produto operado pelo bot do WhatsApp.

**O que coletamos:**
- Seu número de WhatsApp.
- Fotos de cupom fiscal que você nos envia.
- Dados extraídos do cupom: loja, data, total, itens.

**Para quê:**
- Analisar seus gastos e te mandar resumos. Só isso. Não vendemos, não compartilhamos com anunciantes.

**Por quanto tempo:**
- Imagem do cupom: deletada em até 24h após análise.
- Resumo e itens: enquanto sua conta estiver ativa.
- Conta inativa por 12 meses: dados anonimizados automaticamente.

**Quem processa:**
- Google Gemini (análise de imagem) — chamada sem treinamento.
- Supabase (armazenamento) — Brasil/EUA.
- Z-API (gateway WhatsApp).

**Seus direitos (LGPD):**
- Acessar seus dados: comando `/meusdados`.
- Apagar tudo: comando `/apagar`.
- Corrigir algo errado: responde "corrigir" e a gente te ajuda.
- Falar com o Encarregado: contato@economizei.com.br

**Mudanças nesta política:** avisamos pelo bot antes de qualquer alteração.

Última atualização: [data].
```

## Exemplo de uso prático

**Pedido:** "Vou começar a usar Meta Ads na Semana 5. O que preciso ter pronto antes?"

**Aplicação:**

> **Diagnóstico:** Parcial. Você não pode rodar Meta Ads sem 3 itens conformes.
>
> **Gaps específicos:**
> 1. Política de Privacidade não publicada (Meta vai pedir o link).
> 2. Termos de Uso não publicados.
> 3. Email de Encarregado/DPO não declarado em lugar acessível.
> 4. Sem mensagem de consentimento no primeiro contato do bot.
> 5. Imagem do cupom ainda persistida no Supabase Storage sem TTL.
>
> **Correções acionáveis (cada uma cabe em ≤2h):**
> 1. **Publicar política** usando o template acima. Hospedar em `economizei.com.br/privacidade`. (1h30)
> 2. **Publicar termos** (esqueleto similar). (1h)
> 3. **Email Encarregado:** criar `contato@economizei.com.br` no domínio. (30min)
> 4. **Bot:** adicionar mensagem de consentimento como primeira resposta após `oi`, antes de processar foto. (1h)
> 5. **Supabase Storage:** criar policy de TTL 24h em imagens de cupom; ou nem persistir — processar em memória e descartar. (1h30)
>
> **Texto pronto:** ver templates acima.
>
> **Validação:**
> - Acesse o link da política a partir do rodapé.
> - Mande um `oi` num número novo e veja se a mensagem de consentimento aparece antes do bot processar a primeira foto.
> - Confira no Supabase que imagens com mais de 24h foram apagadas.
>
> **Linha pra CLAUDE.md (seção 7):**
> `| 2026-05-XX | LGPD: política + termos publicados; consentimento no bot; TTL 24h em imagens | Pré-requisito de Meta Ads e proteção real da operação |`
