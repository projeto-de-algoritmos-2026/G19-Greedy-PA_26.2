/**
 * @fileoverview Interval Partitioning (Módulo atribuído à Pessoa 2).
 * Responsável por alocar sessões em blocos de tempo livres sem sobreposição utilizando MinHeap.
 * Este arquivo serve como contrato de integração e stub inicial para os testes da Pessoa 1.
 */

/**
 * Particiona as sessões nos blocos livres disponíveis.
 * @param {Array<Object>} sessions - Sessões selecionadas para agendamento.
 * @param {Array<Object>} freeBlocks - Blocos de tempo livre disponíveis.
 * @returns {{ scheduled: Array<Object>, unallocated: Array<Object> }}
 */
export function partitionSessions(sessions = [], freeBlocks = []) {
  // Stub inicial para integração e compatibilidade com a Pessoa 2.
  // A Pessoa 2 implementará este algoritmo com MinHeap.
  return {
    scheduled: [],
    unallocated: [...sessions]
  };
}
