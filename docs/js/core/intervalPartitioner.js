import { MinHeap } from "../utils/minHeap.js";

/**
 * Distribui sessões de estudo pelos blocos livres,
 * sem permitir sobreposição, utilizando MinHeap.
 *
 * @param {Array} sessions - Sessões que precisam ser alocadas.
 * @param {Array} freeBlocks - Blocos de tempo disponíveis.
 * @returns {{
 *   scheduled: Array,
 *   unallocated: Array
 * }}
 */
export function partitionSessions(sessions = [], freeBlocks = []) {
  // Cria um heap que sempre retorna o bloco que fica disponível mais cedo.
  const heap = new MinHeap((a, b) => a.freeAt - b.freeAt);

  // Coloca cada bloco livre no heap.
  // No início, cada bloco está disponível a partir do seu início.
  for (const rawBlock of freeBlocks) {
    const start = typeof rawBlock.start === "number"
      ? rawBlock.start
      : (typeof rawBlock.startTime === "string" ? parseTimeToMin(rawBlock.startTime) : 0);

    const end = typeof rawBlock.end === "number"
      ? rawBlock.end
      : (typeof rawBlock.endTime === "string" ? parseTimeToMin(rawBlock.endTime) : 0);

    if (start < end) {
      const block = {
        ...rawBlock,
        start,
        end
      };

      heap.push({
        block,
        freeAt: block.start
      });
    }
  }

  // Aqui ficarão as sessões que conseguiram ser alocadas.
  const scheduled = [];

  // Aqui ficarão as sessões que não couberam.
  const unallocated = [];

  // Percorre as sessões na ordem em que foram recebidas.
  for (const session of sessions) {
    const sessionDuration = session.duration || session.durationMinutes || 60;
    let allocated = false;
    const skippedEntries = [];

    // Tenta alocar no bloco que fica livre mais cedo
    while (!heap.isEmpty()) {
      const entry = heap.pop();
      const start = entry.freeAt;
      const end = start + sessionDuration;

      // Verifica se a sessão cabe dentro do bloco
      if (end <= entry.block.end) {
        // Cria a sessão final com dia, início e fim
        scheduled.push({
          ...session,
          duration: sessionDuration,
          durationMinutes: sessionDuration,
          day: entry.block.day,
          start,
          end,
          status: "SCHEDULED"
        });

        // O mesmo bloco continua disponível se ainda tiver tempo sobrando
        if (end < entry.block.end) {
          heap.push({
            block: entry.block,
            freeAt: end
          });
        }

        allocated = true;
        break;
      } else {
        // O bloco não suportou esta sessão.
        // Se ainda tem algum espaço que possa caber uma sessão menor futura, preserva:
        if (entry.freeAt < entry.block.end) {
          skippedEntries.push(entry);
        }
      }
    }

    // Devolve os blocos não utilizados de volta ao heap
    for (const skipped of skippedEntries) {
      heap.push(skipped);
    }

    if (!allocated) {
      unallocated.push({
        ...session,
        duration: sessionDuration,
        durationMinutes: sessionDuration,
        reason: "BLOCO_PEQUENO_DEMAIS"
      });
    }
  }

  return {
    scheduled,
    unallocated
  };
}

function parseTimeToMin(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":");
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}
