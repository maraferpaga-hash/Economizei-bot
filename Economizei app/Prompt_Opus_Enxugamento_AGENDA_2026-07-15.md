# 📨 Prompt pro Opus 4.8 — Enxugamento & reconciliação da AGENDA.md

> **Como usar:** cole o bloco abaixo numa conversa de planejamento com o Opus 4.8, na pasta do projeto.
> Gerado na sessão de enxugamento do CLAUDE.md de 2026-07-15 (o item 6 do diagnóstico apontou a AGENDA como próxima candidata, em rodada separada pra não misturar com a fila em andamento).

---

```
Leia o CLAUDE.md, o PROJECT_INSTRUCTIONS.md e a AGENDA.md inteira antes de responder.

CONTEXTO: em 2026-07-15 o CLAUDE.md foi enxugado de 236 KB pra ~55 KB (diagnóstico em
"Economizei app/Diagnostico_Enxugamento_CLAUDE_md_2026-07-15.md"). A AGENDA.md é a próxima
candidata: tem ~70 KB e é lida no boot de TODA sessão, junto com CLAUDE.md + CODE_GUIDE.md +
PROJECT_INSTRUCTIONS.md. Quero discutir com você como enxugá-la SEM quebrar a Máquina Local
(o /tarefa parseia a AGENDA pra pegar a 1ª tarefa pronta) e aproveitar pra reconciliar o
estado da fila.

DISCUTA COMIGO, NESTA ORDEM:

1. RECONCILIAÇÃO PRIMEIRO (estado real antes de mexer na estrutura):
   - Verifique o git como fonte da verdade (git log/status) e cruze com as seções
     "Em revisão" e "Concluído" da AGENDA. Em 07-15 havia 4 tarefas em revisão no
     working tree (cod-0041/0042/0051/0052) aguardando meu commit — confira se já
     commitei e reconcilie o que estiver stale (falha recorrente AGENDA×git,
     precedentes: 07-02, 07-08, 07-13).
   - Liste o que segue pendente de mim (painel "Ações do Gabriel") e o que já venceu.

2. O QUE ARQUIVAR (proposta com números, pra eu aprovar antes de cortar):
   - Tarefas "Concluído" antigas → mover pra um "Economizei app/arquivo-historico/
     AGENDA_arquivo_2026-07-XX.md", mantendo na AGENDA só as últimas ~10 com hash de commit.
   - O catálogo das 18 skills na seção "Gatilho de Skills" duplica o README de skills —
     avalie substituir por pointer pro "C:\Economizei\.claude\skills\README.md".
   - Descrições longas de tarefas do Backlog distante (cod-0060..0065, aud-01..04):
     avalie comprimir pra 2-3 linhas + pointer pro doc de desenho correspondente.

3. O QUE NÃO PODE MUDAR (guarda-rails — confirme que sua proposta preserva):
   - O formato parseável das tarefas "prontas" (o /tarefa depende do molde: id, tipo,
     skills:, descrição, critérios) e a ordem de prioridade da fila.
   - O bloco "🚫 Zona proibida (financeiro)" e o protocolo do /entregar — intocados.
   - O painel "Ações do Gabriel" e "Aguardando sua decisão" — podem ser compactados,
     nunca removidos.

4. REGRA ANTI-REINCHAÇO pra AGENDA (espelho da regra do CLAUDE.md de 07-15):
   proponha um teto (ex.: tarefa concluída sai da AGENDA pro arquivo após N sessões ou
   após o commit ser confirmado; descrição de tarefa ≤ X linhas com pointer pro doc de
   desenho) e onde registrá-la (protocolo da AGENDA + skill economizei-memory-system).

FORMATO: dual-format (resumo executivo primeiro). Apresente o plano com números
(KB/linhas antes→depois por seção) e AGUARDE meu OK antes de mover qualquer coisa.
Tudo que sair vai pro arquivo-historico, nada é deletado. Sem estimativas de tempo.
Lembre: commit é sempre meu; você não commita.
```
