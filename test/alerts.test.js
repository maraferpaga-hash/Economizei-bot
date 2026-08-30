// test/alerts.test.js — testes das funções PURAS de alerts.js.
//
// Cobre o alerta de 3 níveis (abaixo 🎉 / dentro ✅ / acima 📈) e o gatilho
// de envio configurável por env (ALERTA_MODO). Faz parte da "rede de
// segurança de código" — roda no CI (node --test) em todo PR.
//
// NÃO altera a lógica de alerts.js; só observa o comportamento.
//
// Rodar local:  node --test

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  avaliarCompra,
  deveEnviarMensagem,
  verificarAlerta,
} = require("../src/alerts.js");

// Helper: o percentual é float (ex.: 120/100 → 19.999…). Comparamos
// arredondado por tolerância pra não tropeçar em ruído de ponto flutuante.
function pctPerto(real, esperado) {
  assert.ok(
    Math.abs(real - esperado) < 1e-6,
    `percentual ${real} ≉ ${esperado}`
  );
}

// Helper: roda um corpo com um conjunto temporário de envs e restaura tudo
// ao final (mesmo se o corpo lançar). As funções leem process.env em tempo
// de chamada, então isolar por teste evita contaminação entre casos.
function comEnv(vars, corpo) {
  const chaves = Object.keys(vars);
  const antigos = {};
  for (const k of chaves) antigos[k] = process.env[k];
  try {
    for (const k of chaves) {
      if (vars[k] === undefined) delete process.env[k];
      else process.env[k] = vars[k];
    }
    corpo();
  } finally {
    for (const k of chaves) {
      if (antigos[k] === undefined) delete process.env[k];
      else process.env[k] = antigos[k];
    }
  }
}

// ── avaliarCompra — sem base de comparação ──────────────────────────────────
test("avaliarCompra: sem média histórica retorna null", () => {
  assert.equal(avaliarCompra(100, null), null);
  assert.equal(avaliarCompra(100, 0), null);
  assert.equal(avaliarCompra(100, -50), null);
});

// ── avaliarCompra — os 3 vereditos (limiares default) ───────────────────────
test("avaliarCompra: classifica 'acima' acima de +20% (default)", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const r = avaliarCompra(120, 100); // ratio 1.20 = limiar exato
    assert.equal(r.nivel, "acima");
    pctPerto(r.percentual, 20);
    assert.equal(r.media, 100);
  });
});

test("avaliarCompra: classifica 'abaixo' abaixo de -15% (default)", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const r = avaliarCompra(85, 100); // ratio 0.85 = limiar exato
    assert.equal(r.nivel, "abaixo");
    pctPerto(r.percentual, -15);
    assert.equal(r.media, 100);
  });
});

test("avaliarCompra: classifica 'normal' dentro da faixa", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const igual = avaliarCompra(100, 100);
    assert.equal(igual.nivel, "normal");
    assert.equal(igual.percentual, 0);

    const poucoAcima = avaliarCompra(110, 100); // +10% < +20%
    assert.equal(poucoAcima.nivel, "normal");

    const poucoAbaixo = avaliarCompra(90, 100); // -10% > -15%
    assert.equal(poucoAbaixo.nivel, "normal");
  });
});

// ── avaliarCompra — limiares por env ────────────────────────────────────────
test("avaliarCompra: respeita ALERTA_LIM_ACIMA / ALERTA_LIM_ABAIXO custom", () => {
  comEnv({ ALERTA_LIM_ACIMA: "0.10", ALERTA_LIM_ABAIXO: "0.05" }, () => {
    // +15% vira 'acima' com limiar de 10% (seria 'normal' no default)
    assert.equal(avaliarCompra(115, 100).nivel, "acima");
    // -8% vira 'abaixo' com limiar de 5% (seria 'normal' no default)
    assert.equal(avaliarCompra(92, 100).nivel, "abaixo");
  });
});

test("avaliarCompra: env inválida cai no default", () => {
  comEnv({ ALERTA_LIM_ACIMA: "abc", ALERTA_LIM_ABAIXO: "-1" }, () => {
    // limiares default voltam a valer: +10% continua 'normal'
    assert.equal(avaliarCompra(110, 100).nivel, "normal");
    // +20% volta a ser 'acima'
    assert.equal(avaliarCompra(120, 100).nivel, "acima");
  });
});

// ── deveEnviarMensagem — modos configuráveis ────────────────────────────────
test("deveEnviarMensagem: modo 'relevante' (default) fala em acima/abaixo, cala em normal", () => {
  comEnv({ ALERTA_MODO: undefined }, () => {
    assert.equal(deveEnviarMensagem("acima"), true);
    assert.equal(deveEnviarMensagem("abaixo"), true);
    assert.equal(deveEnviarMensagem("normal"), false);
  });
});

test("deveEnviarMensagem: modo 'sempre' fala nos três níveis", () => {
  comEnv({ ALERTA_MODO: "sempre" }, () => {
    assert.equal(deveEnviarMensagem("acima"), true);
    assert.equal(deveEnviarMensagem("abaixo"), true);
    assert.equal(deveEnviarMensagem("normal"), true);
  });
});

test("deveEnviarMensagem: modo 'so_acima' só fala em acima", () => {
  comEnv({ ALERTA_MODO: "so_acima" }, () => {
    assert.equal(deveEnviarMensagem("acima"), true);
    assert.equal(deveEnviarMensagem("abaixo"), false);
    assert.equal(deveEnviarMensagem("normal"), false);
  });
});

test("deveEnviarMensagem: modo é case-insensitive", () => {
  comEnv({ ALERTA_MODO: "SEMPRE" }, () => {
    assert.equal(deveEnviarMensagem("normal"), true);
  });
});

// ── avaliarCompra — entradas degeneradas (las-01, 2026-08-26) ───────────────
// O total vem de `dados.total`, que nasce da leitura do cupom. Se a extração
// devolver algo que não é número, o alerta não pode inventar um veredito.
test("avaliarCompra: média NaN/undefined é tratada como 'sem base' (null)", () => {
  assert.equal(avaliarCompra(100, NaN), null);
  assert.equal(avaliarCompra(100, undefined), null);
});

test("avaliarCompra: total NaN não produz veredito falso", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const r = avaliarCompra(NaN, 100);
    // Há média, então há retorno — mas nenhuma comparação com NaN é
    // verdadeira, logo o veredito cai em 'normal' (o silencioso no modo
    // default). O que NÃO pode acontecer é acusar 'acima' e alarmar à toa.
    assert.equal(r.nivel, "normal");
    assert.notEqual(r.nivel, "acima");
  });
});

test("avaliarCompra: compra de valor zero é 'abaixo', não erro", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const r = avaliarCompra(0, 100);
    assert.equal(r.nivel, "abaixo");
    pctPerto(r.percentual, -100);
  });
});

test("avaliarCompra: limiar zero é respeitado (env '0' não cai no default)", () => {
  // `0` é falsy — se a validação da env usasse `||` em vez de checar
  // Number.isFinite, o zero viraria 0.20 silenciosamente.
  comEnv({ ALERTA_LIM_ACIMA: "0", ALERTA_LIM_ABAIXO: undefined }, () => {
    // Com limiar 0, qualquer coisa igual ou acima da média é 'acima'.
    assert.equal(avaliarCompra(100, 100).nivel, "acima");
    assert.equal(avaliarCompra(100.01, 100).nivel, "acima");
  });
});

// ── deveEnviarMensagem — entradas fora do vocabulário ───────────────────────
test("deveEnviarMensagem: modo desconhecido cai no 'relevante' (default seguro)", () => {
  comEnv({ ALERTA_MODO: "modo-que-nao-existe" }, () => {
    assert.equal(deveEnviarMensagem("acima"), true);
    assert.equal(deveEnviarMensagem("abaixo"), true);
    assert.equal(deveEnviarMensagem("normal"), false);
  });
});

test("deveEnviarMensagem: nível desconhecido nunca vira mensagem", () => {
  // Se um nível novo for adicionado ao avaliarCompra sem atualizar aqui, o
  // padrão tem que ser o silêncio — nunca mandar mensagem que ninguém redigiu.
  for (const modo of [undefined, "sempre", "so_acima"]) {
    comEnv({ ALERTA_MODO: modo }, () => {
      assert.equal(deveEnviarMensagem("inexistente"), false);
      assert.equal(deveEnviarMensagem(undefined), false);
    });
  }
});

// ── verificarAlerta — wrapper de compatibilidade ────────────────────────────
test("verificarAlerta: só retorna objeto quando 'acima', null caso contrário", () => {
  comEnv({ ALERTA_LIM_ACIMA: undefined, ALERTA_LIM_ABAIXO: undefined }, () => {
    const acima = verificarAlerta(130, 100); // +30% → 'acima'
    assert.ok(acima);
    pctPerto(acima.percentual, 30);
    assert.equal(acima.media, 100);

    assert.equal(verificarAlerta(100, 100), null); // normal
    assert.equal(verificarAlerta(80, 100), null); // abaixo
    assert.equal(verificarAlerta(100, null), null); // sem média
  });
});
