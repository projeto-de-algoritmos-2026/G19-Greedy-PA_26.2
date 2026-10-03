<<<<<<< HEAD
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
=======
import { MinHeap } from "../utils/minHeap.js";

/**
 * Distribui sessões de estudo pelos blocos livres,
 * sem permitir sobreposição.
 *
 * @param {Array} sessions
 * Sessões que precisam ser alocadas.
 *
 * Exemplo:
 * [
 *   {
 *     id: "calc2-1",
 *     subjectId: "calc2",
 *     title: "Estudo de Cálculo 2",
 *     duration: 60,
 *     priority: 2
 *   }
 * ]
 *
 * @param {Array} freeBlocks
 * Blocos de tempo disponíveis.
 *
 * Exemplo:
 * [
 *   {
 *     day: "monday",
 *     start: 480, // 08:00
 *     end: 900    // 15:00
 *   }
 * ]
 *
 * @returns {{
 *   scheduled: Array,
 *   unallocated: Array
 * }}
 */
export function partitionSessions(sessions, freeBlocks) {
  // Cria um heap que sempre retorna o bloco
  // que fica disponível mais cedo.
  const heap = new MinHeap((a, b) => a.freeAt - b.freeAt);

  // Coloca cada bloco livre no heap.
  // No início, cada bloco está disponível a partir do seu início.
  for (const block of freeBlocks) {
    heap.push({
      block,
      freeAt: block.start
    });
  }

  // Aqui ficarão as sessões que conseguiram ser alocadas.
  const scheduled = [];

  // Aqui ficarão as sessões que não couberam.
  const unallocated = [];

  // Percorre as sessões na ordem em que foram recebidas.
  for (const session of sessions) {
    // Pega o bloco que fica livre mais cedo.
    const entry = heap.pop();

    // Se não existir nenhum bloco livre,
    // a sessão não pode ser alocada.
    if (!entry) {
      unallocated.push({
        ...session,
        reason: "SEM_BLOCO_LIVRE"
      });

      continue;
    }

    // A sessão começa no primeiro momento livre do bloco.
    const start = entry.freeAt;

    // A sessão termina depois da duração dela.
    const end = start + session.duration;

    // Verifica se a sessão cabe dentro do bloco.
    if (end <= entry.block.end) {
      // Cria a sessão final com dia, início e fim.
      scheduled.push({
        ...session,
        day: entry.block.day,
        start,
        end,
        status: "SCHEDULED"
      });

      // O mesmo bloco continua disponível,
      // mas agora a partir do fim da sessão.
      heap.push({
        block: entry.block,
        freeAt: end
      });
    } else {
      // A sessão não cabe no bloco disponível.
      unallocated.push({
        ...session,
        reason: "BLOCO_PEQUENO_DEMAIS"
      });

      // Devolve o bloco ao heap sem alteração.
      heap.push(entry);
    }
  }

  return {
    scheduled,
    unallocated
  };
}
>>>>>>> 7c4b426442b6a5e23a3b3a0f3de4a841ed2999a0
