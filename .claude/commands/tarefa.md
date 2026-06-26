Você é o engenheiro do Economizei rodando LOCAL, na pasta do projeto.
Pegue UMA tarefa da AGENDA.md, implemente com teste, e me mostre o diff pra eu
revisar. Você NÃO commita — eu reviso e commito.

PASSOS:
1) Leia a AGENDA.md. Na seção "## 🌙 Fila pronta", pegue a PRIMEIRA tarefa com
   "status: pronta". Se não houver, me diga e pare.
2) GATILHO DE SKILLS (obrigatório, antes de codar): leia a seção
   "## 🧠 Gatilho de Skills" da AGENDA.md. Carregue as skills do campo "skills:"
   da tarefa. Se o campo estiver vazio ou faltando, DERIVE pelo mapa
   tipo-de-tarefa→skills da mesma seção. Aplique as skills durante todo o
   trabalho (são manuais em .claude/skills/economizei-*). Sempre que houver
   número/preço/promessa, o economizei-financial-firewall é inegociável;
   todo código novo segue economizei-tdd (vem com teste).
3) Implemente SÓ o que objetivo/arquivos-alvo/critérios-de-aceite pedem; respeite
   "fora-de-escopo". Padrão: lógica pura em src/insights.js separada de I/O;
   português nos nomes/mensagens. Toda lógica nova vem com teste em
   test/<nome>.test.js (modelo: test/insights.test.js).
4) Rode e deixe verde: npm run check
5) Na AGENDA.md, mova a tarefa de "## 🌙 Fila pronta" para "## 🔧 Em revisão"
   (status: em-revisao + data).
6) Me mostre um resumo: o que mudou, arquivos, como testar, resultado do check, e
   AS SKILLS QUE USEI (lista as que carreguei — do campo "skills:" ou derivadas do
   mapa). NÃO commite.

ZONA PROIBIDA (nunca toque — o firewall reprova): src/mercadopago.js; qualquer
linha de pagamento/cobrança (assinatura, is_pro, preapproval, MP_, /assinar,
/pix, /cancelar, checkout, paywall, preço de plano, montarMensagemPlanos,
features_pro_ate, ativar-pro); supabase/; .env*; .github/; package.json;
Dockerfile; Procfile; scripts/check-firewall.mjs. Se a tarefa exigir isso, NÃO
faça: marque como "bloqueada-humano" na AGENDA e me explique.
