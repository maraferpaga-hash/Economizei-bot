#!/usr/bin/env node
/**
 * ship.mjs — Economizei
 *
 * Um comando só pra subir código com segurança. Faz, em ordem:
 *   1) Sincroniza com o remoto  -> git pull --rebase  (evita divergência/conflito surpresa)
 *   2) Roda a rede de segurança -> npm run check:push (firewall + testes + páginas)
 *   3) Sobe                      -> git push
 *
 * Uso:  npm run ship
 *
 * Se QUALQUER passo falhar, ele para na hora e nada é enviado.
 *
 * Obs.: o passo 3 usa `--no-verify` de propósito porque a checagem já rodou
 * no passo 2 desta mesma execução — assim não roda duas vezes. O hook
 * `.githooks/pre-push` continua protegendo quando você der `git push` na mão.
 *
 * Zero dependências — só Node embutido + git.
 */

import { execSync } from "node:child_process";

function run(cmd, descricao) {
  console.log(`\n▶  ${descricao}`);
  console.log(`   $ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch {
    console.error(`\n❌ Parou em: ${descricao}`);
    console.error("   Nada foi enviado. Resolva o problema acima e rode 'npm run ship' de novo.\n");
    process.exit(1);
  }
}

let branch;
try {
  branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
} catch {
  console.error("❌ Não consegui descobrir a branch atual. Você está dentro do repositório git?");
  process.exit(1);
}

console.log(`\n🚢 ship — branch atual: ${branch}`);

// 1) Sincroniza com o remoto ANTES de tudo.
run(`git pull --rebase origin ${branch}`, "Sincronizando com o remoto (pull --rebase)");

// 2) Rede de segurança (mesma do hook).
run("npm run check:push", "Rodando a rede de segurança (firewall + testes + páginas)");

// 3) Sobe (a checagem já passou acima -> --no-verify evita rodar o hook de novo).
run(`git push --no-verify origin ${branch}`, "Enviando pro GitHub (push)");

console.log("\n✅ Pronto. O deploy do Railway/Vercel dispara a partir deste push.");
console.log("   ⚠️  Se a tarefa tinha MIGRATION, ela precisava ter sido rodada no Supabase ANTES deste push.\n");
