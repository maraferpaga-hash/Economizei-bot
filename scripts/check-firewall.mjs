#!/usr/bin/env node
/**
 * check-firewall.mjs — FIREWALL FINANCEIRO da máquina noturna.
 *
 * Esta é a trava que blinda o dinheiro. Roda no CI em TODO Pull Request e
 * REPROVA o PR se as mudanças tocarem qualquer coisa de pagamento/cobrança.
 * Com branch protection ligado na `main`, um PR que mexa no financeiro fica
 * NÃO-MERGEÁVEL — nem o da máquina, nem o seu por engano.
 *
 * Como a blindagem funciona (duas camadas):
 *   1. DENYLIST DE CAMINHOS — se um arquivo proibido foi alterado, falha.
 *      (ex.: src/mercadopago.js, supabase/, .env, .github/, package.json,
 *       o próprio firewall — pra ninguém desarmar a trava)
 *   2. SCAN DE CONTEÚDO — nas linhas ADICIONADAS do diff, procura padrões
 *      financeiros (mercadopago, is_pro, assinatura, preapproval, MP_, pix,
 *      checkout, paywall, ativar-pro, montarMensagemPlanos...). Assim, edição
 *      financeira ESCONDIDA dentro de um arquivo "misto" (index.js, supabase.js,
 *      formatter.js) também é pega.
 *
 * É PROPOSITALMENTE rígido: um flag significa "humano precisa olhar", não
 * necessariamente "o código está errado". Você (admin) decide no merge.
 *
 * Uso:
 *   node scripts/check-firewall.mjs              # compara contra a base (CI) ou origin/main
 *   FIREWALL_BASE=origin/main node scripts/check-firewall.mjs
 *   node scripts/check-firewall.mjs --selftest   # valida a própria lógica (sem git)
 *
 * Zero dependências — só Node embutido + git.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// ── 1) Caminhos proibidos (regex sobre o path do arquivo alterado) ──────────
const PROTECTED_PATHS = [
  /^src\/mercadopago\.js$/i,        // módulo 100% financeiro (Mercado Pago)
  /^supabase\//i,                   // migrations/SQL: schema + tabelas de dinheiro
  /(^|\/)\.env(\..*)?$/i,           // segredos
  /^\.github\//i,                   // workflows = os próprios guarda-rails
  /^scripts\/check-firewall\.mjs$/i,// a trava não se edita sozinha
  /^Dockerfile$/i,
  /^Procfile$/i,
  /^package(-lock)?\.json$/i,       // dependências = risco de supply-chain
];

// ── 2) Padrões financeiros (sobre cada linha ADICIONADA do diff) ────────────
// Específicos de propósito. NÃO inclui "preco"/"total"/"R$" genéricos, que são
// dado de gasto NÃO-financeiro (preco_total do item, valores de relatório).
const MONEY_PATTERNS = [
  /mercado[\s_]?pago/i,
  /preapproval/i,
  /\bMP_[A-Z0-9_]+/,            // env do Mercado Pago (MP_ACCESS_TOKEN etc.)
  /\bis_pro\b/i,
  /assinatur/i,                // assinatura, assinaturas, assinar(Assinatura)
  /\bassinar\b/i,
  /\bpaywall\b/i,
  /\bcheckout\b/i,
  /\bpix\b/i,
  /ativar-pro/i,
  /features_pro_ate/i,
  /montarMensagemPlanos/i,
  /cancelarAssinatura/i,
  /salvarAssinaturaPreapproval/i,
];

// O scan de CONTEÚDO só vale pra arquivo de código — docs (.md), páginas (.html)
// e afins citam "assinatura/is_pro" em prosa sem serem perigosos. Os caminhos
// realmente sensíveis (.env, supabase/, mercadopago.js…) são pegos pela denylist.
const CODE_EXT = /\.(js|mjs|cjs|ts|tsx|jsx)$/i;

export function isProtectedPath(file) {
  return PROTECTED_PATHS.some((re) => re.test(file));
}

export function isCodeFile(file) {
  return CODE_EXT.test(file);
}

export function scanLine(line) {
  // recebe o conteúdo de uma linha (sem o '+' do diff)
  const hits = [];
  for (const re of MONEY_PATTERNS) {
    if (re.test(line)) hits.push(re.source);
  }
  return hits;
}

// ── self-test (não toca git) ────────────────────────────────────────────────
function selftest() {
  const cases = [
    // [entrada, esperado-protegido?]
    [() => isProtectedPath("src/mercadopago.js"), true],
    [() => isProtectedPath("supabase/migration_x.sql"), true],
    [() => isProtectedPath(".env"), true],
    [() => isProtectedPath(".github/workflows/claude-nightly.yml"), true],
    [() => isProtectedPath("package.json"), true],
    [() => isProtectedPath("scripts/check-firewall.mjs"), true],
    [() => isProtectedPath("src/insights.js"), false],
    [() => isProtectedPath("src/formatter.js"), false],
    [() => isProtectedPath("test/insights.test.js"), false],
    [() => scanLine("  await ativarIsPro(phone) // is_pro").length > 0, true],
    [() => scanLine("const r = await cancelarAssinatura(id)").length > 0, true],
    [() => scanLine("link = montarMensagemPlanos()").length > 0, true],
    [() => scanLine("if (palavras[0] === '/pix') {").length > 0, true],
    [() => scanLine("const precoTotal = preco * qtd; // gasto do item").length > 0, false],
    [() => scanLine("return _round2(ref.total)").length > 0, false],
    [() => scanLine("msg += `R$ ${valor}`; // relatorio de gasto").length > 0, false],
  ];
  let ok = 0;
  cases.forEach(([fn, exp], i) => {
    const got = fn();
    if (got === exp) ok++;
    else console.error(`  selftest #${i} FALHOU: esperado ${exp}, veio ${got}`);
  });
  const pass = ok === cases.length;
  console.log(`firewall selftest: ${ok}/${cases.length} ${pass ? "OK" : "FALHOU"}`);
  process.exit(pass ? 0 : 1);
}

// ── runner real (usa git) ───────────────────────────────────────────────────
function sh(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function resolveBase() {
  if (process.env.FIREWALL_BASE) return process.env.FIREWALL_BASE;
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  try { sh("git rev-parse --verify origin/main"); return "origin/main"; } catch {}
  try { sh("git rev-parse --verify HEAD~1"); return "HEAD~1"; } catch {}
  return null;
}

function main() {
  if (process.argv.includes("--selftest")) return selftest();

  const working = process.argv.includes("--working");
  let changed = [];
  let patch = "";
  let escopo = "";

  try {
    if (working) {
      // Modo LOCAL: olha as mudanças ainda NÃO commitadas (working tree + staged
      // + arquivos novos). É o que você roda ANTES do commit, depois que o Claude
      // local mexeu nos arquivos.
      escopo = "mudanças não commitadas (working tree)";
      const tracked = sh("git diff --name-only HEAD").split("\n").filter(Boolean);
      const untracked = sh("git ls-files --others --exclude-standard").split("\n").filter(Boolean);
      changed = [...new Set([...tracked, ...untracked])];
      patch = execSync("git diff --unified=0 HEAD", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
      // arquivos novos não aparecem em `git diff`: trata cada linha como adicionada
      for (const f of untracked) {
        try {
          const content = readFileSync(f, "utf8");
          patch += `\n+++ b/${f}\n` + content.split("\n").map((l) => "+" + l).join("\n") + "\n";
        } catch {}
      }
    } else {
      const base = resolveBase();
      if (!base) {
        console.error("FIREWALL: não consegui determinar a base de comparação (git). Falhando por segurança.");
        process.exit(1);
      }
      escopo = `${base}...HEAD`;
      changed = sh(`git diff --name-only ${base}...HEAD`).split("\n").filter(Boolean);
      patch = execSync(`git diff --unified=0 ${base}...HEAD`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    }
  } catch (e) {
    console.error(`FIREWALL: erro ao calcular o diff. Falhando por segurança.\n${e.message}`);
    process.exit(1);
  }

  const pathViolations = changed.filter(isProtectedPath);

  // varre as linhas adicionadas, atribuindo ao arquivo corrente do hunk
  const contentViolations = [];
  let curFile = null;
  for (const raw of patch.split("\n")) {
    if (raw.startsWith("+++ b/")) { curFile = raw.slice(6); continue; }
    if (raw.startsWith("+++ ")) { curFile = null; continue; }
    if (raw.startsWith("+") && !raw.startsWith("+++")) {
      if (!curFile || !isCodeFile(curFile)) continue; // só escaneia conteúdo de código
      const content = raw.slice(1);
      const hits = scanLine(content);
      if (hits.length) {
        contentViolations.push({ file: curFile, text: content.trim().slice(0, 120), hits });
      }
    }
  }

  console.log(`firewall: ${escopo} — ${changed.length} arquivo(s) alterado(s).\n`);

  if (pathViolations.length === 0 && contentViolations.length === 0) {
    console.log("✓ FIREWALL OK: nenhuma mudança financeira/proibida detectada.");
    process.exit(0);
  }

  console.error("✗ FIREWALL BLOQUEOU — mudança em zona financeira/protegida:\n");
  for (const f of pathViolations) {
    console.error(`  [arquivo proibido] ${f}`);
  }
  for (const v of contentViolations) {
    console.error(`  [conteúdo financeiro] ${v.file}: "${v.text}"  (padrão: ${v.hits.join(", ")})`);
  }
  console.error(
    "\nA automação NÃO pode mexer em pagamento/cobrança. Se foi o Claude, reverta essa " +
    "parte antes de commitar. Se foi você de propósito, prossiga com cuidado e revise."
  );
  process.exit(1);
}

main();
