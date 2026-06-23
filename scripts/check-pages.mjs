#!/usr/bin/env node
/**
 * check-pages.mjs — Validador leve de páginas estáticas do Economizei.
 *
 * Esta é a "rede de segurança" automática das páginas geradas pela máquina
 * noturna. Roda no CI (em todo Pull Request que toca landing/ ou docs/) e
 * pode ser rodado localmente:  node scripts/check-pages.mjs
 *
 * Objetivo: barrar página QUEBRADA antes de virar merge, sem dar falso-positivo
 * em página boa. Por isso ele FALHA só no que é claramente erro e AVISA no resto.
 *
 * FALHA (exit 1) se encontrar:
 *   - <title> ausente ou vazio
 *   - placeholder esquecido: {{ ... }}, TODO:, FIXME, "lorem ipsum"
 *   - link/asset LOCAL relativo apontando pra arquivo que não existe
 *
 * AVISA (não falha) em:
 *   - âncora interna (#id) sem destino no mesmo arquivo
 *   - rota absoluta (/privacidade, /termos, ...) — resolvida pelo Vercel, não dá
 *     pra checar no disco
 *
 * Zero dependências — só Node embutido. Compatível com Node >= 18.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["landing", "docs"];

// ---- coleta recursiva de .html --------------------------------------------
function listHtml(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listHtml(full));
    else if (extname(entry).toLowerCase() === ".html") out.push(full);
  }
  return out;
}

// ---- extração simples ------------------------------------------------------
function attrValues(html, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "gi");
  const vals = [];
  let m;
  while ((m = re.exec(html)) !== null) vals.push(m[1]);
  return vals;
}

function collectIds(html) {
  const ids = new Set();
  const re = /\bid\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) ids.add(m[1]);
  // <a name="..."> ainda é alvo de âncora válido
  for (const n of attrValues(html, "name")) ids.add(n);
  return ids;
}

const EXTERNAL = /^(https?:|mailto:|tel:|data:|javascript:|wa\.me|#$)/i;

function isExternal(ref) {
  return EXTERNAL.test(ref) || ref.startsWith("//");
}

// ---- validação de um arquivo ----------------------------------------------
function checkFile(file) {
  const fails = [];
  const warns = [];
  const html = readFileSync(file, "utf8");

  // 1) <title>
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) {
    fails.push("<title> ausente ou vazio");
  }

  // 2) placeholders esquecidos
  const placeholders = [
    [/\{\{[\s\S]*?\}\}/g, "placeholder {{...}} não substituído"],
    [/\bTODO:/g, 'marcador "TODO:" esquecido'],
    [/\bFIXME\b/g, 'marcador "FIXME" esquecido'],
    [/lorem ipsum/gi, 'texto "lorem ipsum" de rascunho'],
  ];
  for (const [re, msg] of placeholders) {
    if (re.test(html)) fails.push(msg);
  }

  // 3) links/assets
  const ids = collectIds(html);
  const refs = [...attrValues(html, "href"), ...attrValues(html, "src")];
  for (const ref of refs) {
    if (!ref || isExternal(ref)) continue;

    if (ref.startsWith("#")) {
      const id = ref.slice(1);
      if (id && !ids.has(id)) warns.push(`âncora "${ref}" sem destino no arquivo`);
      continue;
    }

    if (ref.startsWith("/")) {
      // rota absoluta — Vercel resolve (ver landing/vercel.json). Não checável.
      warns.push(`rota absoluta "${ref}" (resolvida pelo Vercel, não verificada)`);
      continue;
    }

    // relativo local: tem que existir no disco
    const cleaned = ref.split("#")[0].split("?")[0];
    if (!cleaned) continue;
    const target = resolve(dirname(file), cleaned);
    if (!existsSync(target)) {
      fails.push(`referência local quebrada: "${ref}"`);
    }
  }

  return { fails, warns };
}

// ---- runner ----------------------------------------------------------------
const files = SCAN_DIRS.flatMap((d) => listHtml(resolve(ROOT, d)));

if (files.length === 0) {
  console.log("check-pages: nenhum .html em landing/ ou docs/. Nada a validar.");
  process.exit(0);
}

let totalFails = 0;
let totalWarns = 0;

console.log(`check-pages: validando ${files.length} página(s)...\n`);

for (const file of files) {
  const rel = file.replace(ROOT + "/", "").replace(ROOT + "\\", "");
  const { fails, warns } = checkFile(file);
  totalFails += fails.length;
  totalWarns += warns.length;

  if (fails.length === 0 && warns.length === 0) {
    console.log(`  ✓ ${rel}`);
    continue;
  }
  const mark = fails.length ? "✗" : "•";
  console.log(`  ${mark} ${rel}`);
  for (const f of fails) console.log(`      ERRO   ${f}`);
  for (const w of warns) console.log(`      aviso  ${w}`);
}

console.log("");
console.log(`Resumo: ${files.length} página(s), ${totalFails} erro(s), ${totalWarns} aviso(s).`);

if (totalFails > 0) {
  console.error("\ncheck-pages FALHOU: corrija os ERROS acima antes de abrir/mergear o PR.");
  process.exit(1);
}
console.log("check-pages OK: páginas íntegras.");
process.exit(0);
