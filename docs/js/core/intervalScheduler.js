/**
 * @fileoverview Algoritmo de Interval Scheduling para seleção e priorização de sessões de estudo.
 * Responsável por calcular a capacidade total de estudo livre disponível e selecionar
 * de forma gulosa (Earliest Deadline First + Maior Prioridade) as sessões que cabem no tempo,
 * identificando as sessões selecionadas e as pendentes (unallocated).
 */

import { getDurationMinutes, timeToMinutes } from './time.js';

/**
 * Calcula a soma total de minutos disponíveis a partir de uma lista de blocos de disponibilidade.
 * Opcionalmente deduz compromissos fixos que coincidam com os blocos.
 *
 * @param {Array<Object>} availability - Lista de blocos de disponibilidade.
 * @param {Array<Object>} [commitments=[]] - Lista de compromissos fixos opcionais.
 * @returns {number} Quantidade total de minutos livres disponíveis.
 */
export function calculateAvailableMinutes(availability = [], commitments = []) {
  if (!Array.isArray(availability)) return 0;

  let totalMinutes = 0;

  for (const block of availability) {
    if (typeof block.durationMinutes === 'number') {
      totalMinutes += block.durationMinutes;
    } else if (block.startTime && block.endTime) {
      totalMinutes += getDurationMinutes(block.startTime, block.endTime);
    }
  }

  // Se houver compromissos fornecidos separadamente para dedução
  if (Array.isArray(commitments) && commitments.length > 0) {
    let commitmentMinutes = 0;
    for (const c of commitments) {
      if (typeof c.durationMinutes === 'number') {
        commitmentMinutes += c.durationMinutes;
      } else if (c.startTime && c.endTime) {
        commitmentMinutes += getDurationMinutes(c.startTime, c.endTime);
      }
    }
    totalMinutes = Math.max(0, totalMinutes - commitmentMinutes);
  }

  return totalMinutes;
}

/**
 * Ordena sessões de estudo segundo a estratégia gulosa de agendamento por intervalos e prazos:
 * 1. Prazo mais próximo (Earliest Deadline First - menor deadlineDays primeiro).
 * 2. Maior prioridade dinâmica (maior bônus de prova/trabalho e dificuldade).
 * 3. Menor índice da sessão na matéria (sessão 1 antes da sessão 2).
 *
 * @param {Array<Object>} sessions - Lista de sessões a ordenar.
 * @returns {Array<Object>} Nova lista ordenada de sessões.
 */
export function sortSessionsByUrgency(sessions = []) {
  return [...sessions].sort((a, b) => {
    // 1º critério: Prazo mais próximo (Earliest Deadline)
    const deadlineA = typeof a.deadlineDays === 'number' ? a.deadlineDays : Infinity;
    const deadlineB = typeof b.deadlineDays === 'number' ? b.deadlineDays : Infinity;
    if (deadlineA !== deadlineB) {
      return deadlineA - deadlineB;
    }

    // 2º critério: Maior prioridade calculada
    const priorityA = typeof a.priority === 'number' ? a.priority : 0;
    const priorityB = typeof b.priority === 'number' ? b.priority : 0;
    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    // 3º critério: Índice sequencial da sessão na matéria
    return (a.sessionIndex || 0) - (b.sessionIndex || 0);
  });
}

/**
 * Seleciona as sessões que cabem na disponibilidade informada (Interval Scheduling).
 * Retorna uma lista de sessões selecionadas que também contém propriedades .selected e .pending,
 * garantindo compatibilidade direta tanto com quem espera um Array puro quanto com desestruturação { selected, pending }.
 *
 * @param {Array<Object>} sessions - Sessões de estudo a serem avaliadas.
 * @param {Array<Object>|number} availability - Lista de blocos de disponibilidade ou total de minutos livres.
 * @param {Object} [options={}] - Configurações extras (ex: compromissos fixos).
 * @returns {Array<Object> & { selected: Array<Object>, pending: Array<Object>, totalAvailableMinutes: number, totalSelectedMinutes: number, totalPendingMinutes: number }}
 */
export function selectSessions(sessions = [], availability = [], options = {}) {
  const totalAvailableMinutes = typeof availability === 'number'
    ? availability
    : calculateAvailableMinutes(availability, options.commitments);

  const sortedSessions = sortSessionsByUrgency(sessions);

  const selected = [];
  const pending = [];
  let accumulatedMinutes = 0;

  for (const session of sortedSessions) {
    const duration = session.durationMinutes || 60;
    if (accumulatedMinutes + duration <= totalAvailableMinutes) {
      selected.push(session);
      accumulatedMinutes += duration;
    } else {
      pending.push(session);
    }
  }

  const totalSelectedMinutes = selected.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);
  const totalPendingMinutes = pending.reduce((acc, s) => acc + (s.durationMinutes || 60), 0);

  // Retorna array selecionado com propriedades extras de metadados
  const result = [...selected];
  result.selected = selected;
  result.pending = pending;
  result.unallocated = pending;
  result.totalAvailableMinutes = totalAvailableMinutes;
  result.totalSelectedMinutes = totalSelectedMinutes;
  result.totalPendingMinutes = totalPendingMinutes;

  return result;
}

/**
 * Função alternativa explícita com retorno de objeto estruturado { selected, pending, stats }.
 * @param {Array<Object>} sessions
 * @param {Array<Object>|number} availability
 * @param {Object} [options]
 * @returns {{ selected: Array<Object>, pending: Array<Object>, stats: Object }}
 */
export function scheduleIntervals(sessions = [], availability = [], options = {}) {
  const res = selectSessions(sessions, availability, options);
  return {
    selected: res.selected,
    pending: res.pending,
    stats: {
      totalAvailableMinutes: res.totalAvailableMinutes,
      totalSelectedMinutes: res.totalSelectedMinutes,
      totalPendingMinutes: res.totalPendingMinutes
    }
  };
}
