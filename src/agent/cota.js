// src/agent/cota.js — decisão de cota do Agente de Perguntas (cod-0016)
//
// Helper PURO, sem I/O: decide o estado da cota mensal de perguntas.
// A cota é PLANA (mesmo limite pra todos — decisão 2026-06-24) e anti-abuso,
// não trava de custo: pergunta é texto, custa centavos de fração. Por isso
// este módulo NÃO conhece o plano de ninguém — a diferenciação Free/Pro,
// se vier, é passo humano (fronteira do firewall, Desenho §11).
//
//   decidirCota(usadas, limite) → { atingido, cruzouMetade, usadas, limite }
//
//   • atingido     — usadas >= limite (não responde mais neste mês)
//   • cruzouMetade — usadas === ceil(limite/2): é NESTA pergunta que a pessoa
//     cruza a metade → o orquestrador manda o aviso do meio UMA vez só
//     (igualdade estrita = idempotente por construção, sem flag no banco).
//
// Convenção de chamada (orquestrador, cod-0017):
//   - ANTES de responder:  decidirCota(usadas, limite).atingido
//   - DEPOIS de incrementar: decidirCota(usadas + 1, limite).cruzouMetade

'use strict';

const LIMITE_DEFAULT = 30; // espelha env LIMITE_PERGUNTAS_FREE (Desenho §8)

function decidirCota(usadas, limite) {
  const l = Number.isFinite(Number(limite)) && Number(limite) > 0
    ? Math.floor(Number(limite))
    : LIMITE_DEFAULT;
  const u = Number.isFinite(Number(usadas)) && Number(usadas) > 0
    ? Math.floor(Number(usadas))
    : 0;

  return {
    atingido: u >= l,
    cruzouMetade: u === Math.ceil(l / 2),
    usadas: u,
    limite: l,
  };
}

module.exports = { decidirCota, LIMITE_DEFAULT };
