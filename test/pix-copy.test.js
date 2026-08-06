// test/pix-copy.test.js — cod-0067: copy de pagamento pós-Mercado Pago.
//
// O MP foi aposentado em 2026-07-26 (4f49ae7) e o pagamento por cartão saiu do
// ar junto. A copy do /pix, porém, continuava dizendo "no cartão a renovação é
// automática" — promessa que o produto NÃO cumpre. Estes testes são a trava
// contra a promessa voltar.
//
// ⚠️ Este arquivo cobre mensagens do caminho do dinheiro (exceção consciente à
// nota do topo de test/formatter.test.js): o firewall financeiro ACUSA por
// design, e o commit é revisado pelo Gabriel. Nenhum preço novo é introduzido —
// os valores conferidos aqui são os do CLAUDE.md §3.
//
// Rodar: node --test test/pix-copy.test.js

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { montarMensagemPix, montarMensagemPlanos } = require('../src/formatter');

// Promessas que o produto não cumpre hoje (só existiam com o MP no ar).
const PROMESSAS_MORTAS = [
  /cart[ãa]o/i,
  /mercado\s*pago/i,
  /renova[çc][ãa]o\s+autom[áa]tica/i,
  /cobran[çc]a\s+autom[áa]tica/i,
  /autom[áa]tica\s+todo\s+m[êe]s/i,
  /\/assinar/i,
];

function assertSemPromessaMorta(msg, nome) {
  for (const padrao of PROMESSAS_MORTAS) {
    assert.ok(
      !padrao.test(msg),
      `${nome} voltou a prometer algo que o produto não faz (${padrao}):\n${msg}`
    );
  }
}

// ── /pix — a única forma de assinar hoje ────────────────────────────────────

test('/pix: não promete cartão, Mercado Pago nem renovação automática', () => {
  assertSemPromessaMorta(montarMensagemPix(), 'montarMensagemPix');
});

test('/pix: descreve o fluxo real — chave, comprovante e ativação em até 1h', () => {
  const msg = montarMensagemPix();
  assert.match(msg, /PIX/);
  assert.match(msg, /comprovante/i);
  assert.match(msg, /at[ée] 1h/i);
  // os 3 valores vigentes (CLAUDE.md §3) continuam visíveis
  assert.match(msg, /9,90/);
  assert.match(msg, /15/);
  assert.match(msg, /22/);
});

test('/pix: diz que a renovação é manual — e NÃO promete lembrete de vencimento', () => {
  const msg = montarMensagemPix();
  assert.match(msg, /manual/i);
  // Não existe job de aviso de vencimento no scheduler: prometer um seria
  // trocar uma promessa falsa (cartão) por outra.
  assert.ok(
    !/(te aviso|eu aviso|vou avisar|lembrete).{0,40}(vencimento|renova)/i.test(msg)
      && !/(vencimento|renova\w*).{0,40}(te aviso|eu aviso|vou avisar|lembrete)/i.test(msg),
    `o /pix voltou a prometer um lembrete de renovação que o produto não envia:\n${msg}`
  );
});

// ── /planos — aponta só pro que existe ──────────────────────────────────────

test('/planos: não promete cartão, Mercado Pago nem renovação automática', () => {
  assertSemPromessaMorta(montarMensagemPlanos(), 'montarMensagemPlanos');
});

test('/planos: manda assinar via PIX (o único caminho vivo)', () => {
  const msg = montarMensagemPlanos();
  assert.match(msg, /PIX/);
  assert.match(msg, /\/pix/);
});

// ── Sem gíria (regra 4 da §11 do CLAUDE.md — gíria só em marketing) ─────────

test('copy de pagamento: sem gíria informal no texto do bot', () => {
  const proibidas = [/\bcê\b/i, /\bné\b/i, /\bpra\s+cê\b/i, /\bvéi\b/i, /\bmano\b/i];
  for (const msg of [montarMensagemPix(), montarMensagemPlanos()]) {
    for (const p of proibidas) {
      assert.ok(!p.test(msg), `gíria ${p} na copy do bot:\n${msg}`);
    }
  }
});

// ── O bloco de código morto do MP continua rotulado ─────────────────────────
// Se alguém religar uma daquelas funções sem meio de pagamento por trás, a
// promessa falsa volta em produção. O rótulo é o aviso; este teste o protege.

test('formatter: as mensagens órfãs do MP seguem marcadas como código morto', () => {
  const fonte = require('node:fs').readFileSync(
    require.resolve('../src/formatter.js'),
    'utf8'
  );
  assert.match(fonte, /⚠️ CÓDIGO MORTO — fluxo de assinatura por cartão via Mercado Pago/);

  const orfas = [
    'montarMensagemPedirEmail',
    'montarMensagemLinkAssinatura',
    'montarMensagemAssinaturaAtivada',
    'montarMensagemAssinaturaCancelada',
    'montarMensagemEmailInvalido',
    'montarMensagemErroAssinatura',
    'montarMensagemPagamentoFalhou',
    'montarMensagemJaAssinante',
  ];
  const linhas = fonte.split('\n');
  for (const nome of orfas) {
    const i = linhas.findIndex((l) => l.startsWith(`function ${nome}(`));
    assert.ok(i > 0, `função órfã ${nome} sumiu (remoção é a cod-0066, hoje pausada)`);
    assert.match(
      linhas[i - 1],
      /\[MORTA — MP\]/,
      `${nome} perdeu o rótulo [MORTA — MP] — sem ele ninguém sabe que a copy promete cartão`
    );
  }
});

// ── Nenhuma órfã do MP é chamada em produção ────────────────────────────────

test('nenhuma mensagem órfã do MP é usada por src/ (continuam desligadas)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = path.dirname(require.resolve('../src/formatter.js'));

  const arquivos = [];
  (function varrer(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) varrer(p);
      else if (e.name.endsWith('.js') && e.name !== 'formatter.js') arquivos.push(p);
    }
  })(dir);

  const orfas = [
    'montarMensagemPedirEmail',
    'montarMensagemLinkAssinatura',
    'montarMensagemAssinaturaAtivada',
    'montarMensagemAssinaturaCancelada',
    'montarMensagemEmailInvalido',
    'montarMensagemErroAssinatura',
    'montarMensagemPagamentoFalhou',
    'montarMensagemJaAssinante',
  ];

  for (const arq of arquivos) {
    const src = fs.readFileSync(arq, 'utf8');
    for (const nome of orfas) {
      assert.ok(
        !src.includes(nome),
        `${path.basename(arq)} voltou a usar ${nome} — copy de cartão sem meio de pagamento por trás`
      );
    }
  }
});
