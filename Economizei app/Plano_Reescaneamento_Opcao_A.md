# 🔁 Reescaneamento de Cupons — Opção A (armazenar imagem de falhas)

> ## ❌ REVOGADO em 2026-06-24
> Esta decisão foi **revogada** pelo Gabriel. Mantida a estrutura anterior: a imagem do cupom é
> processada em memória e **descartada**, nunca persistida. Motivo: como o bot já faz Sharp + 2
> retries na leitura, reprocessar a mesma imagem quase nunca muda o resultado — o ganho não paga o
> custo de LGPD nem de storage. Este documento fica **apenas como histórico**; não implementar.
> Ver `CLAUDE.md` (seção 8, decisão de 2026-06-24).

> **Status (histórico):** design aprovado em parâmetros, build nunca iniciado.
> **Sessão:** 2026-06-06. Decisão do Gabriel: implementar a Opção A. **Revogada em 2026-06-24.**
> **Leia junto:** `CLAUDE.md` (seção 8 — decisões) e `.claude/skills/economizei-security-lgpd/SKILL.md`.

---

## 1. Decisões fechadas (parâmetros do Gabriel)

| Pergunta | Decisão |
|---|---|
| **O que guardar** | Só imagens de cupons que **falharam** na leitura (não todas). |
| **Quando excluir** | Ao ler com sucesso **+ 48h** de buffer. Teto absoluto de **7 dias** para falhas que nunca resolvem. |
| **Consentimento** | **Opt-out automático** com aviso claro (base legal: execução do serviço + legítimo interesse). |

Esses 3 parâmetros mantêm o princípio da **minimização**: guarda-se o mínimo (só falha), pelo menor tempo possível (48h após resolver / 7d teto), com saída fácil.

---

## 2. ⚠️ Reversão de postura — e por que é defensável

A postura anterior (skill `economizei-security-lgpd` + política publicada) dizia: **"imagem do cupom é descartada, nunca persistida no Supabase Storage"**. A Opção A **reverte isso conscientemente**. É aceitável porque o novo desenho continua conforme a LGPD:

- **Finalidade declarada e única:** reprocessar um cupom que o usuário mandou mas que não foi lido. Nada além disso.
- **Minimização real:** só falhas (a grande maioria dos cupons é lida na hora e **nunca** é guardada), e por tempo curto.
- **Exclusão garantida:** purga automática (48h pós-sucesso / 7d teto) + `/apagar` apaga tudo + opt-out apaga o que existe.
- **Transparência:** aviso no momento da falha + política atualizada + comando de opt-out.

> Sem esses 4 pontos, guardar imagem de cupom (que tem CPF + dado financeiro) seria não-conforme. **Não cortar nenhum deles na build.**

---

## 3. ⚠️ Verdade técnica que muda o valor da feature

O bot **já faz** pré-processamento (Sharp) + 2 tentativas de leitura no momento do recebimento (decisão 2026-06-04, "Resiliência"). Então:

- **Reprocessar a MESMA imagem com o MESMO leitor → quase sempre falha de novo.** Foto borrada continua borrada; cupom cortado continua cortado.
- O valor real do armazenamento **não** é "tentar de novo no piloto automático e dar certo por mágica". É:
  1. **Lembrete com contexto:** "tenho um cupom do dia X que não consegui ler — quer reenviar mais nítido, ou que eu tente de novo?" (a imagem dá o contexto e permite 1 toque).
  2. **Reprocessamento quando o LEITOR melhora:** se a gente subir uma versão melhor do pipeline (prompt, preprocessing, modelo), o job re-roda as falhas pendentes. Esse é o "a máquina relê sozinha" de verdade.

Por isso o desenho carrega uma **`pipeline_version`**: o reprocessamento automático só vale a pena (e só dispara) quando a versão do leitor mudou desde a falha — senão é só queimar custo de Gemini repetindo o mesmo erro.

---

## 4. Estrutura de armazenamento

### 4.1. Supabase Storage
- **Bucket privado** `cupons-pendentes` (NÃO público; acesso só via service role no backend).
- **Caminho:** `{cupom_pendente_id}.{ext}` (UUID, não usar telefone no path).
- Imagem nunca exposta por URL pública; download só pelo backend para reprocessar.

### 4.2. Nova tabela `cupons_pendentes`
```sql
-- supabase/migration_cupons_pendentes.sql
CREATE TABLE IF NOT EXISTS cupons_pendentes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number     text        NOT NULL,
  storage_path     text        NOT NULL,                 -- caminho no bucket
  mime_type        text,
  categoria_erro   text,                                 -- borrado | muito_longo | sem_itens | nao_e_cupom | outro
  motivo           text,
  status           text        NOT NULL DEFAULT 'pendente', -- pendente | resolvido | erro_permanente | expirado
  tentativas       int         NOT NULL DEFAULT 1,
  pipeline_version text,                                  -- versão do leitor na hora da falha
  lembrete_enviado boolean     NOT NULL DEFAULT false,
  criado_em        timestamptz NOT NULL DEFAULT now(),
  atualizado_em    timestamptz NOT NULL DEFAULT now(),
  resolvido_em     timestamptz,                           -- quando virou compra
  expira_em        timestamptz NOT NULL                   -- criado_em + 7d; ao resolver vira resolvido_em + 48h
);

CREATE INDEX IF NOT EXISTS idx_cupons_pendentes_status   ON cupons_pendentes (status);
CREATE INDEX IF NOT EXISTS idx_cupons_pendentes_expira   ON cupons_pendentes (expira_em);
CREATE INDEX IF NOT EXISTS idx_cupons_pendentes_phone    ON cupons_pendentes (phone_number);

-- opt-out de armazenamento de imagem (separado do opt_out_precos)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS opt_out_imagens boolean NOT NULL DEFAULT false;
```

---

## 5. Ciclo de vida (a "hora de excluir")

```
[Usuário manda foto]
        │
   lerRecibo (Sharp + 2 retries)
        │
   ┌────┴─────┐
sucesso     falha
   │           │
salva       opt_out_imagens?
compra      ├── sim → NÃO guarda (fluxo de erro atual, fim)
            └── não → upload no bucket + insere cupons_pendentes
                        status=pendente, expira_em = now + 7 dias
                        + aviso discreto na msg de erro

[CRON DIÁRIO — reprocessamento]   (1x/dia, manhã)
   pega status='pendente' onde pipeline_version <> versão atual
        │  (só re-roda se o leitor mudou — senão pula, pra não queimar Gemini)
   baixa do bucket → lerRecibo de novo
   ┌────┴─────┐
sucesso     falha de novo
   │           │
salva       tentativas++
compra      categoria não-recuperável (muito_longo/nao_e_cupom) → status='erro_permanente'
status=resolvido
resolvido_em=now
expira_em = now + 48h

[CRON DIÁRIO — lembrete]   (mesma rodada ou junto do reengagement)
   pega pendentes não resolvidos, lembrete_enviado=false, com >1 dia
   manda 1 lembrete amigável (oferece reenviar) → lembrete_enviado=true

[CRON DIÁRIO — purga]   (limpeza)
   apaga bucket + linha onde:
     • status='resolvido' E now > expira_em (resolvido_em + 48h), OU
     • now > expira_em (teto 7d) em qualquer status

[/apagar]        → apaga TODAS as imagens + linhas do usuário (bucket + tabela)
[/nao-guardar]   → opt_out_imagens=true + apaga as pendentes que existirem
[/guardar]       → opt_out_imagens=false (volta a guardar falhas futuras)
```

**Regras de ouro do ciclo:**
- Purga roda **todo dia**, é idempotente, e apaga primeiro do bucket, depois a linha (se falhar o bucket, mantém a linha pra tentar de novo — nunca deixa órfão "fantasma" sem registro).
- `/apagar` **tem que** cobrir as imagens pendentes (direito de exclusão). Hoje o `/apagar` só mexe em compras/itens — **adicionar isso é obrigatório**.

---

## 6. Código — o que criar / mexer

| Arquivo | Mudança |
|---|---|
| `supabase/migration_cupons_pendentes.sql` | **novo** — tabela + bucket (criar bucket no painel) + coluna `opt_out_imagens`. |
| `src/cupomStorage.js` | **novo** — `salvarCupomPendente()`, `reprocessarPendentes()`, `enviarLembretesPendentes()`, `purgarExpirados()`, `apagarPendentesDoUsuario()`, `setOptOutImagens()`. Usa `supabase.storage`. |
| `src/gemini.js` | exportar `PIPELINE_VERSION` (constante; bumpar quando o leitor mudar). |
| `src/index.js` | no ramo `if (!dados.sucesso)`: chamar `salvarCupomPendente()` (respeitando opt-out) antes de mandar o erro; aviso de opt-out na msg. Comandos `/nao-guardar`, `/guardar`. `/apagar` passa a chamar `apagarPendentesDoUsuario()`. |
| `src/scheduler.js` | novo cron diário (ex: 10h) → `reprocessarPendentes()` → `enviarLembretesPendentes()` → `purgarExpirados()`. |
| `src/formatter.js` | linha de aviso na msg de erro; texto de `/nao-guardar` e `/guardar`; atualizar `montarMensagemPrivacidade()`. |

**Custo de Gemini sob controle:** reprocessa só quando `pipeline_version` mudou. Sem mudança de versão = zero reprocessamento automático (só lembrete + purga). Isso evita a armadilha de re-rodar foto borrada todo dia.

---

## 7. Consentimento (opt-out automático)

**Aviso no momento da falha** (anexar à mensagem de erro existente, discreto):
> _Guardei essa foto por até 7 dias pra tentar ler de novo e te lembrar. Não quer que eu guarde? Manda /nao-guardar._

**Comandos novos:**
- `/nao-guardar` → para de guardar + apaga pendentes → "✅ Não vou mais guardar as fotos. As que estavam guardadas foram apagadas."
- `/guardar` → volta a guardar falhas futuras.

---

## 8. Texto de LGPD a publicar (aplicado nos arquivos)

> ⚠️ **Publicar a política só JUNTO com o deploy da feature** — não antes. Se a landing for ao ar dizendo que guardamos imagem antes de o código guardar, fica incoerente.

**`landing/privacy.html` — seção "Dados que coletamos":** acrescentar que, quando um cupom não é lido, a imagem é guardada temporariamente.

**`landing/privacy.html` — seção "Retenção":** acrescentar:
> **Imagem de cupom não lido:** quando não conseguimos ler um cupom, guardamos a foto por até 7 dias para tentar processá-la de novo e te lembrar. Assim que o cupom é lido com sucesso, a imagem é apagada em até 48 horas. Você pode desativar isso a qualquer momento mandando `/nao-guardar` no bot.

**Bot `/privacidade`:** acrescentar a mesma ideia em PT claro + o comando de opt-out.

---

## 9. Checklist de aceite (antes de considerar pronto)
- [ ] Migration rodada; bucket privado criado.
- [ ] Cupom que falha gera linha + arquivo no bucket (se não opt-out).
- [ ] `/apagar` remove imagens pendentes (bucket + tabela). **Testar.**
- [ ] `/nao-guardar` para de guardar e apaga as existentes. **Testar.**
- [ ] Purga apaga resolvidos após 48h e qualquer um após 7d.
- [ ] Reprocessamento só dispara com `pipeline_version` diferente.
- [ ] CPF nunca em log; `storage_path` por UUID, não por telefone.
- [ ] Política publicada **no mesmo deploy** da feature.

---

## 10. O que cabe em 1h vs. o que fica
- **Cabe numa sessão de build:** migration + `cupomStorage.js` + integração no `index.js` (falha + `/apagar` + opt-out) + cron. É a maior parte.
- **Fica pra ajuste fino:** tuning do lembrete (texto/timing — pode reusar o sistema de reengajamento já planejado), e bump da `pipeline_version` quando o leitor for melhorado.
