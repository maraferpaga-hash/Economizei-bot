#!/usr/bin/env node
/**
 * estoque.mjs — Economizei
 *
 * A máquina (rotina matinal, na nuvem) NÃO consegue commitar: o disco montado
 * não permite apagar arquivo, então o git funciona uma vez e trava
 * (provado em 2026-08-18 — ver "Economizei app/Veredito_Teste_Commit_Sandbox_2026-08-18.md").
 *
 * Por isso ela para de editar `src/` e passa a escrever cada leva numa pasta
 * própria, numerada, dentro de `estoque/`. Este script é a ponte: ele aplica
 * essas pastas de volta no repositório, aqui na máquina do Gabriel, onde tudo
 * funciona. A cópia é mecânica de propósito — foi a cópia MANUAL que deixou o
 * `.claude/commands/tarefa.md` quebrado por 8 dias em agosto de 2026.
 *
 * USO
 *   node scripts/estoque.mjs status            lista as levas na ordem, com integridade
 *   node scripts/estoque.mjs aplicar <n>       aplica A LEVA <n> por cima do repo
 *   node scripts/estoque.mjs limpar <n>        apaga a pasta da leva <n> (SÓ após o push)
 *
 * FORMATO DE UMA LEVA
 *   estoque/0001_2026-08-19_cod-0071/
 *       LEVA.md                     ← manifesto (o que mudou, migration?, financeiro?)
 *       arquivos/src/agent/canal.js ← versão COMPLETA do arquivo depois da mudança
 *       arquivos/test/canal.test.js
 *
 * TRAVAS (o script recusa, não avisa)
 *   1. Ordem: só aplica a leva de MENOR número que ainda existe. Pular quebra a
 *      cadeia, porque a leva N foi construída em cima da N-1.
 *   2. Zona proibida: recusa qualquer caminho em supabase/, .env*, .github/,
 *      package.json, package-lock.json, Dockerfile, Procfile, .claude/ e
 *      scripts/check-firewall.mjs.
 *   3. Fuga de diretório: recusa caminho que escape da raiz do repositório.
 *   4. Integridade: recusa .js/.mjs que não passe no `node --check`.
 *
 * Zero dependências — só Node embutido.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(process.cwd());
const ESTOQUE = path.join(RAIZ, "estoque");

// ---------------------------------------------------------------- zona proibida
const PROIBIDO_PREFIXO = ["supabase/", ".github/", ".claude/", "node_modules/", ".git/"];
const PROIBIDO_EXATO = [
  "package.json",
  "package-lock.json",
  "Dockerfile",
  "Procfile",
  "scripts/check-firewall.mjs",
];
const PROIBIDO_REGEX = [/^\.env/];

function ehProibido(rel) {
  const p = rel.replace(/\\/g, "/");
  if (PROIBIDO_EXATO.includes(p)) return true;
  if (PROIBIDO_PREFIXO.some((pre) => p.startsWith(pre))) return true;
  if (PROIBIDO_REGEX.some((re) => re.test(p))) return true;
  return false;
}

// ---------------------------------------------------------------- utilidades
function morrer(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function listarLevas() {
  if (!fs.existsSync(ESTOQUE)) return [];
  return fs
    .readdirSync(ESTOQUE, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}_/.test(d.name))
    .map((d) => ({
      nome: d.name,
      numero: parseInt(d.name.slice(0, 4), 10),
      dir: path.join(ESTOQUE, d.name),
    }))
    .sort((a, b) => a.numero - b.numero);
}

function arquivosDaLeva(leva) {
  const base = path.join(leva.dir, "arquivos");
  if (!fs.existsSync(base)) return [];
  const out = [];
  (function andar(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) andar(full);
      else if (e.isFile()) out.push(path.relative(base, full).replace(/\\/g, "/"));
    }
  })(base);
  return out.sort();
}

function contarLinhas(p) {
  try {
    return fs.readFileSync(p, "utf8").split("\n").length;
  } catch {
    return null;
  }
}

function checarSintaxe(p) {
  if (!/\.(js|mjs|cjs)$/.test(p)) return { ok: true, pulou: true };
  try {
    execFileSync(process.execPath, ["--check", p], { stdio: "pipe" });
  } catch (e) {
    return { ok: false, erro: String(e.stderr || e.message).trim().split("\n")[0] };
  }

  // Buraco medido no Node 22 (2026-08-18): um arquivo .js TRUNCADO que começa com
  // `export`/`import` PASSA no `node --check` — a deteção automática de módulo
  // engole o erro. O código do Economizei é CommonJS, então isso quase nunca
  // aparece; mas como esta é a trava contra arquivo truncado, vale o segundo passe.
  if (/\.js$/.test(p)) {
    const texto = fs.readFileSync(p, "utf8");
    const primeira = texto.split("\n").find((l) => l.trim() && !l.trim().startsWith("//"));
    if (primeira && /^\s*(export|import)\s/.test(primeira)) {
      const tmp = p + ".checagem.mjs";
      try {
        fs.writeFileSync(tmp, texto);
        execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
      } catch (e) {
        return { ok: false, erro: String(e.stderr || e.message).trim().split("\n")[0] };
      } finally {
        try { fs.rmSync(tmp, { force: true }); } catch {}
      }
    }
  }
  return { ok: true };
}

function lerCampoDoManifesto(leva, campo) {
  const md = path.join(leva.dir, "LEVA.md");
  if (!fs.existsSync(md)) return null;
  const linha = fs
    .readFileSync(md, "utf8")
    .split("\n")
    .find((l) => l.toLowerCase().trim().startsWith(campo.toLowerCase() + ":"));
  return linha ? linha.slice(linha.indexOf(":") + 1).trim() : null;
}

// ---------------------------------------------------------------- status
function comandoStatus() {
  const levas = listarLevas();
  console.log(`\n📦 estoque — ${RAIZ}\n`);
  if (levas.length === 0) {
    console.log("   Estoque vazio. Nada esperando entrega.\n");
    return;
  }

  let totalLinhas = 0;
  let algumProblema = false;

  for (const leva of levas) {
    const arquivos = arquivosDaLeva(leva);
    const tarefa = lerCampoDoManifesto(leva, "tarefa") || "(sem manifesto)";
    const migration = lerCampoDoManifesto(leva, "migration") || "?";
    const financeiro = lerCampoDoManifesto(leva, "financeiro") || "?";

    console.log(`── leva ${String(leva.numero).padStart(4, "0")} · ${leva.nome}`);
    console.log(`   tarefa:     ${tarefa}`);
    console.log(`   migration:  ${migration}    financeiro: ${financeiro}`);

    if (!fs.existsSync(path.join(leva.dir, "LEVA.md"))) {
      console.log(`   ⚠️  SEM LEVA.md — manifesto obrigatório ausente`);
      algumProblema = true;
    }
    if (arquivos.length === 0) {
      console.log(`   ⚠️  NENHUM ARQUIVO em arquivos/ — leva vazia`);
      algumProblema = true;
    }

    for (const rel of arquivos) {
      const origem = path.join(leva.dir, "arquivos", rel);
      const destino = path.join(RAIZ, rel);
      const nl = contarLinhas(origem);
      const na = fs.existsSync(destino) ? contarLinhas(destino) : null;
      totalLinhas += nl || 0;

      const marcas = [];
      if (ehProibido(rel)) {
        marcas.push("⛔ ZONA PROIBIDA");
        algumProblema = true;
      }
      const sint = checarSintaxe(origem);
      if (!sint.ok) {
        marcas.push(`⛔ SINTAXE: ${sint.erro}`);
        algumProblema = true;
      }
      if (na === null) marcas.push("novo");
      else {
        const delta = nl - na;
        marcas.push(`${na} → ${nl} linhas (${delta >= 0 ? "+" : ""}${delta})`);
        if (na > 0 && nl < na * 0.5) {
          marcas.push("⚠️ ENCOLHEU MAIS DE 50% — conferir truncamento");
          algumProblema = true;
        }
      }
      console.log(`     • ${rel}  ${marcas.join(" · ")}`);
    }
    console.log("");
  }

  const proxima = levas[0];
  console.log(`Total: ${levas.length} leva(s) · ~${totalLinhas} linhas em estoque`);
  console.log(`Próxima a aplicar: leva ${String(proxima.numero).padStart(4, "0")} (${proxima.nome})`);
  if (algumProblema) {
    console.log(`\n⚠️  Há problemas acima. NÃO aplique antes de resolver.`);
    process.exitCode = 2;
  } else {
    console.log(`\n✅ Estoque íntegro — nenhuma sintaxe quebrada, nenhuma zona proibida.`);
  }
  console.log("");
}

// ---------------------------------------------------------------- aplicar
function comandoAplicar(alvoStr) {
  const levas = listarLevas();
  if (levas.length === 0) morrer("Estoque vazio — nada pra aplicar.");

  const alvo = parseInt(alvoStr, 10);
  if (!Number.isInteger(alvo)) morrer("Uso: node scripts/estoque.mjs aplicar <numero-da-leva>");

  const leva = levas.find((l) => l.numero === alvo);
  if (!leva) morrer(`Leva ${alvo} não existe. Levas presentes: ${levas.map((l) => l.numero).join(", ")}`);

  // TRAVA 1 — ordem
  if (levas[0].numero !== alvo) {
    morrer(
      `Ordem violada. A leva ${levas[0].numero} ainda está no estoque e precisa ser aplicada e entregue antes da ${alvo}.\n` +
        `   A leva ${alvo} foi construída EM CIMA da ${levas[0].numero} — aplicar fora de ordem desfaz mudanças.`
    );
  }

  const arquivos = arquivosDaLeva(leva);
  if (arquivos.length === 0) morrer(`Leva ${alvo} não tem nenhum arquivo em arquivos/.`);

  // TRAVAS 2/3/4 — antes de escrever qualquer coisa
  for (const rel of arquivos) {
    if (rel.includes("..")) morrer(`Caminho suspeito na leva ${alvo}: ${rel}`);
    const destino = path.resolve(RAIZ, rel);
    if (!destino.startsWith(RAIZ + path.sep)) morrer(`Caminho escapa da raiz do repositório: ${rel}`);
    if (ehProibido(rel)) morrer(`ZONA PROIBIDA na leva ${alvo}: ${rel}\n   A máquina nunca deveria ter escrito aqui. Investigue antes de aplicar.`);
    const sint = checarSintaxe(path.join(leva.dir, "arquivos", rel));
    if (!sint.ok) morrer(`Sintaxe quebrada em ${rel} (leva ${alvo}):\n   ${sint.erro}\n   Arquivo provavelmente truncado. NÃO aplicado.`);
  }

  // TRAVA 5 — destino sujo. Se você mexeu no arquivo à mão depois que a máquina
  // produziu a leva, aplicar por cima APAGA o seu trabalho sem aviso.
  const forcar = process.argv.includes("--forcar");
  const sujos = arquivos.filter((rel) => {
    try {
      const saida = execFileSync("git", ["status", "--porcelain", "--", rel], {
        cwd: RAIZ,
        encoding: "utf8",
        env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
      });
      return saida.trim().length > 0 && fs.existsSync(path.join(RAIZ, rel));
    } catch {
      return false; // sem git disponível: não é motivo pra travar
    }
  });
  if (sujos.length > 0 && !forcar) {
    morrer(
      `Estes arquivos têm mudança NÃO COMMITADA no repositório e seriam sobrescritos:\n` +
        sujos.map((s) => `     • ${s}`).join("\n") +
        `\n   Commite (ou guarde) o seu trabalho primeiro.\n` +
        `   Se você tem certeza de que pode perder essas mudanças: acrescente --forcar`
    );
  }
  if (sujos.length > 0 && forcar) {
    console.log(`\n⚠️  --forcar: sobrescrevendo ${sujos.length} arquivo(s) com mudança não commitada.\n`);
  }

  console.log(`\n▶  Aplicando leva ${String(alvo).padStart(4, "0")} — ${leva.nome}\n`);
  const escritos = [];
  for (const rel of arquivos) {
    const origem = path.join(leva.dir, "arquivos", rel);
    const destino = path.join(RAIZ, rel);
    const existia = fs.existsSync(destino);
    const antes = existia ? contarLinhas(destino) : null;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origem, destino);
    const depois = contarLinhas(destino);
    escritos.push(rel);
    console.log(`   ${existia ? "sobrescrito" : "criado     "}  ${rel}  ${existia ? `${antes} → ${depois} linhas` : `${depois} linhas`}`);
  }

  console.log(`\n✅ ${escritos.length} arquivo(s) aplicado(s).`);
  console.log(`   Agora, NESTA ordem:`);
  console.log(`     1) npm run check          (a suíte completa, nesta máquina)`);
  console.log(`     2) git add ${escritos.join(" ")}`);
  console.log(`     3) git commit -m "<tipo>(<escopo>): <descricao> (<cod>)"`);
  console.log(`   Só apague a pasta da leva DEPOIS do push:`);
  console.log(`     node scripts/estoque.mjs limpar ${alvo}\n`);
}

// ---------------------------------------------------------------- limpar
function comandoLimpar(alvoStr) {
  const alvo = parseInt(alvoStr, 10);
  if (!Number.isInteger(alvo)) morrer("Uso: node scripts/estoque.mjs limpar <numero-da-leva>");
  const leva = listarLevas().find((l) => l.numero === alvo);
  if (!leva) morrer(`Leva ${alvo} não existe (já foi limpa?).`);

  // Confere que o que está no disco bate com o que a leva entregou — se bater,
  // o conteúdo já está no repositório e a pasta virou lixo seguro.
  const arquivos = arquivosDaLeva(leva);
  const divergentes = arquivos.filter((rel) => {
    const a = path.join(leva.dir, "arquivos", rel);
    const b = path.join(RAIZ, rel);
    if (!fs.existsSync(b)) return true;
    return fs.readFileSync(a, "utf8") !== fs.readFileSync(b, "utf8");
  });

  if (divergentes.length > 0) {
    morrer(
      `A leva ${alvo} NÃO foi aplicada (ou foi alterada depois). Divergem:\n` +
        divergentes.map((d) => `     • ${d}`).join("\n") +
        `\n   Nada apagado. Rode "aplicar ${alvo}" primeiro, ou investigue.`
    );
  }

  fs.rmSync(leva.dir, { recursive: true, force: true });
  console.log(`\n🗑️  Leva ${alvo} (${leva.nome}) apagada do estoque — o conteúdo está no repositório.\n`);
}

// ---------------------------------------------------------------- main
const [, , comando, arg] = process.argv;
switch (comando) {
  case "status":
    comandoStatus();
    break;
  case "aplicar":
    comandoAplicar(arg);
    break;
  case "limpar":
    comandoLimpar(arg);
    break;
  default:
    console.log(`
estoque.mjs — ponte entre o que a máquina produz e o repositório

  node scripts/estoque.mjs status         lista as levas em ordem, com integridade
  node scripts/estoque.mjs aplicar <n>    aplica a leva <n> por cima do repo
  node scripts/estoque.mjs limpar <n>     apaga a pasta da leva <n> (só após o push)
`);
    process.exit(comando ? 1 : 0);
}
