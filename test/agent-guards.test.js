// test/agent-guards.test.js — testes das guardas de honestidade (cod-0011)
// Rodar: node --test
//
// Cobre as 3 funções puras de src/agent/guards.js:
//   validarClassificacao · extrairNumeros · conferirFidelidadeNumerica

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validarClassificacao,
  extrairNumeros,
  conferirFidelidadeNumerica,
} = require('../src/agent/guards.js');

// Registro de intenções sintético, no shape do intents.js (cod-0012).
const CATEGORIAS = [
  'carnes', 'hortifruti', 'laticinios', 'padaria', 'bebidas',
  'limpeza', 'mercearia', 'congelados', 'doces', 'outros',
];

const REGISTRO = [
  {
    id: 'gasto_total_mes',
    parametros: {
      periodo: { tipo: 'periodo', default: 'mes_atual' },
    },
  },
  {
    id: 'gasto_por_categoria',
    parametros: {
      categoria: { tipo: 'enum', valores: CATEGORIAS, obrigatorio: true },
      periodo: { tipo: 'periodo', default: 'mes_atual' },
    },
  },
  {
    id: 'comparar_meses',
    parametros: {
      periodo: { tipo: 'periodo', default: 'mes_atual' },
    },
  },
];

// ── validarClassificacao ──────────────────────────────────────────────────────

test('validarClassificacao: intenção válida com enum e período válidos → ok', () => {
  const saida = { intent: 'gasto_por_categoria', params: { categoria: 'carnes', periodo: 'maio' }, confianca: 'alta' };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, true);
  assert.equal(r.intent, 'gasto_por_categoria');
  assert.deepEqual(r.params, { categoria: 'carnes', periodo: 'maio' });
});

test('validarClassificacao: parâmetro opcional ausente → ok (executor aplica default)', () => {
  const r = validarClassificacao({ intent: 'gasto_total_mes', params: {} }, REGISTRO);
  assert.equal(r.ok, true);
  assert.equal(r.intent, 'gasto_total_mes');
});

test('validarClassificacao: intent fora do registro → rejeita (intent_desconhecida)', () => {
  const r = validarClassificacao({ intent: 'previsao_do_tempo', params: {} }, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'intent_desconhecida');
});

test('validarClassificacao: fora_de_escopo é sinalizado distintamente', () => {
  const r = validarClassificacao({ intent: 'fora_de_escopo' }, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'fora_de_escopo');
});

test('validarClassificacao: categoria fora do vocabulário (enum) → rejeita (param_invalido)', () => {
  const saida = { intent: 'gasto_por_categoria', params: { categoria: 'cigarros' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_invalido');
  assert.equal(r.param, 'categoria');
});

test('validarClassificacao: período inválido (data inventada pelo LLM) → rejeita (param_invalido)', () => {
  const saida = { intent: 'gasto_total_mes', params: { periodo: 'semana que vem' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_invalido');
  assert.equal(r.param, 'periodo');
});

test('validarClassificacao: período válido (rótulo conhecido) passa', () => {
  const r = validarClassificacao({ intent: 'gasto_total_mes', params: { periodo: 'mes_passado' } }, REGISTRO);
  assert.equal(r.ok, true);
});

test('validarClassificacao: parâmetro não declarado para a intenção → param_desconhecido', () => {
  const saida = { intent: 'gasto_total_mes', params: { loja: 'mercado X' } };
  const r = validarClassificacao(saida, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_desconhecido');
  assert.equal(r.param, 'loja');
});

test('validarClassificacao: parâmetro obrigatório ausente → param_obrigatorio_ausente', () => {
  const r = validarClassificacao({ intent: 'gasto_por_categoria', params: { periodo: 'maio' } }, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'param_obrigatorio_ausente');
  assert.equal(r.param, 'categoria');
});

test('validarClassificacao: saída malformada (null) → saida_invalida', () => {
  assert.deepEqual(validarClassificacao(null, REGISTRO), { ok: false, motivo: 'saida_invalida' });
});

test('validarClassificacao: intent não-string → saida_invalida', () => {
  const r = validarClassificacao({ intent: 42 }, REGISTRO);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'saida_invalida');
});

test('validarClassificacao: registro vazio → qualquer intent é desconhecida', () => {
  const r = validarClassificacao({ intent: 'gasto_total_mes', params: {} }, []);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'intent_desconhecida');
});

// ── extrairNumeros ────────────────────────────────────────────────────────────

test('extrairNumeros: valor monetário BR → [248.3]', () => {
  assert.deepEqual(extrairNumeros('Você gastou R$ 248,30 em carne.'), [248.3]);
});

test('extrairNumeros: milhar + decimal BR → [1234.56]', () => {
  assert.deepEqual(extrairNumeros('No total foram R$ 1.234,56 no mês.'), [1234.56]);
});

test('extrairNumeros: porcentagem → [20]', () => {
  assert.deepEqual(extrairNumeros('Isso é 20% a mais.'), [20]);
});

test('extrairNumeros: vários números no mesmo texto', () => {
  assert.deepEqual(
    extrairNumeros('Gastou R$ 248,30, que é 20% acima dos R$ 206,90.'),
    [248.3, 20, 206.9],
  );
});

test('extrairNumeros: milhar sem decimal → [1234]', () => {
  assert.deepEqual(extrairNumeros('Foram R$ 1.234 no cartão.'), [1234]);
});

test('extrairNumeros: ponto final da frase não polui o número', () => {
  assert.deepEqual(extrairNumeros('Custou R$ 248,30.'), [248.3]);
});

test('extrairNumeros: texto sem números → []', () => {
  assert.deepEqual(extrairNumeros('Ainda não tenho gastos registrados em maio.'), []);
});

test('extrairNumeros: null/undefined → []', () => {
  assert.deepEqual(extrairNumeros(null), []);
  assert.deepEqual(extrairNumeros(undefined), []);
});

// ── conferirFidelidadeNumerica ────────────────────────────────────────────────

test('conferirFidelidade: todos os números batem com a allowlist → ok', () => {
  const texto = 'Em maio você gastou R$ 248,30 em carne.';
  const r = conferirFidelidadeNumerica(texto, ['R$ 248,30']);
  assert.equal(r.ok, true);
  assert.deepEqual(r.intrusos, []);
});

test('conferirFidelidade: número distorcido (R$ 284,30 ≠ R$ 248,30) → REPROVA', () => {
  const texto = 'Em maio você gastou R$ 284,30 em carne.';
  const r = conferirFidelidadeNumerica(texto, ['R$ 248,30']);
  assert.equal(r.ok, false);
  assert.deepEqual(r.intrusos, [284.3]);
});

test('conferirFidelidade: número inventado a mais → REPROVA com o intruso', () => {
  const texto = 'Você gastou R$ 248,30, economizando R$ 50,00.';
  const r = conferirFidelidadeNumerica(texto, ['R$ 248,30']);
  assert.equal(r.ok, false);
  assert.deepEqual(r.intrusos, [50]);
});

test('conferirFidelidade: allowlist com vários itens, narração fiel → ok', () => {
  const texto = 'Você gastou R$ 248,30, 20% acima dos R$ 206,90.';
  const r = conferirFidelidadeNumerica(texto, ['R$ 248,30', '20%', 'R$ 206,90']);
  assert.equal(r.ok, true);
  assert.deepEqual(r.intrusos, []);
});

test('conferirFidelidade: zeros à direita não causam falso-positivo (248,30 ≡ 248,3)', () => {
  const r = conferirFidelidadeNumerica('Gastou R$ 248,3 em carne.', ['R$ 248,30']);
  assert.equal(r.ok, true);
});

test('conferirFidelidade: allowlist de Numbers (não-string) também funciona', () => {
  const r = conferirFidelidadeNumerica('Total: R$ 1.234,56.', [1234.56]);
  assert.equal(r.ok, true);
});

test('conferirFidelidade: permitido único (não-array) é aceito', () => {
  const r = conferirFidelidadeNumerica('Gastou R$ 248,30.', 'R$ 248,30');
  assert.equal(r.ok, true);
});

test('conferirFidelidade: texto sem números → ok (nada a conferir)', () => {
  const r = conferirFidelidadeNumerica('Ainda não tenho dados de maio.', ['R$ 248,30']);
  assert.equal(r.ok, true);
  assert.deepEqual(r.intrusos, []);
});
