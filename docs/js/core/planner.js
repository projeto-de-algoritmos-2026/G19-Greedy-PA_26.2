/**
 * @fileoverview Ponto central de integração e geração da agenda de estudos (Planner).
 * Orquestra a criação de sessões a partir dos requisitos do usuário, a seleção gulosa
 * via Interval Scheduling (Pessoa 1) e o particionamento em horários sem sobreposição
 * via Interval Partitioning (Pessoa 2).
 */

import { createStudySessions } from './models.js';
import { selectSessions } from './intervalScheduler.js';
import { partitionSessions } from './intervalPartitioner.js';
import { timeToMinutes } from './time.js';

/**
 * Gera a agenda final de estudos combinando Interval Scheduling e Interval Partitioning.
 *
 * @param {Object} input - Dados de entrada do usuário.
 * @param {Array<Object>} input.subjects - Lista de matérias cadastradas.
 * @param {Array<Object>} input.availability - Blocos de horários livres por dia.
 * @param {Array<Object>} [input.assessments] - Provas e trabalhos cadastrados.
 * @param {Array<Object>} [input.exams] - Provas (caso venham em array separado).
 * @param {Array<Object>} [input.assignments] - Trabalhos (caso venham em array separado).
 * @param {Array<Object>} [input.commitments] - Compromissos fixos.
 * @param {Array<Object>} [input.reservations] - Reservas de estudo fixas.
 * @param {Object} [options] - Opções adicionais de configuração.
 * @returns {{
 *   sessions: Array<Object>,
 *   unallocated: Array<Object>,
 *   stats: Object
 * }} Agenda gerada com sessões alocadas e sessões pendentes.
 */
export function generateSchedule(input = {}, options = {}) {
  const availability = input.availability || [];

  // 1. Cria as sessões de estudo necessárias baseando-se em horas e prazos
  const sessions = createStudySessions(input, options);

  // 2. Seleciona as sessões que cabem na disponibilidade (Interval Scheduling)
  const selected = selectSessions(sessions, availability, {
    commitments: input.commitments
  });

  // 3. Aloca as sessões selecionadas nos blocos livres sem sobreposição (Interval Partitioning)
  const result = partitionSessions(selected, availability);

  // Consolidação de sessões alocadas e não alocadas
  const scheduledSessions = (result && Array.isArray(result.scheduled)) ? result.scheduled : [];
  const partitionUnallocated = (result && Array.isArray(result.unallocated)) ? result.unallocated : [];
  const schedulerPending = (selected && Array.isArray(selected.pending)) ? selected.pending : [];

  // Evita duplicatas caso a mesma sessão apareça em ambas as listas
  const unallocatedMap = new Map();
  for (const session of [...partitionUnallocated, ...schedulerPending]) {
    unallocatedMap.set(session.id, session);
  }
  // Remove do unallocated as que conseguiram ser agendadas
  for (const scheduled of scheduledSessions) {
    unallocatedMap.delete(scheduled.id);
  }
  const finalUnallocated = Array.from(unallocatedMap.values());

  const totalRequestedMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);
  const totalScheduledMinutes = scheduledSessions.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);
  const totalUnallocatedMinutes = finalUnallocated.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);

  return {
    sessions: scheduledSessions,
    unallocated: finalUnallocated,
    stats: {
      totalRequestedMinutes,
      totalScheduledMinutes,
      totalUnallocatedMinutes,
      totalRequestedSessions: sessions.length,
      scheduledSessionsCount: scheduledSessions.length,
      unallocatedSessionsCount: finalUnallocated.length,
      occupancyRate: totalRequestedMinutes > 0
        ? Math.round((totalScheduledMinutes / totalRequestedMinutes) * 100)
        : 0
    }
  };
}
