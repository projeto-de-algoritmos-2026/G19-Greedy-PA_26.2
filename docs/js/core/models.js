/**
 * @fileoverview Modelos de dados e fábrica de sessões de estudo para o StudyScheduler.
 * Responsável por estruturar as entidades do sistema (Matéria, Disponibilidade, Prova/Trabalho,
 * Compromisso, Reserva de estudo e Sessão de estudo) e converter os requisitos de estudo
 * em sessões individuais com cálculo de prioridade dinâmica baseada em prazos e dificuldades.
 */

import { getDurationMinutes, timeToMinutes, minutesToTime } from './time.js';

let idCounter = 1;
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

/**
 * Cria um objeto de Matéria.
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.name - Nome da matéria (ex: "Cálculo 2").
 * @param {number} params.weeklyHours - Horas semanais desejadas de estudo (ex: 3).
 * @param {number} [params.difficulty=3] - Nível de dificuldade de 1 a 5.
 * @param {string} [params.color='#4f46e5'] - Cor representativa em hexadecimal/HSL.
 * @returns {Object} Matéria formatada.
 */
export function createSubject({
  id = generateId('subj'),
  name,
  weeklyHours = 2,
  difficulty = 3,
  color = '#4f46e5'
}) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('O nome da matéria é obrigatório.');
  }

  const hours = Number(weeklyHours);
  if (Number.isNaN(hours) || hours <= 0) {
    throw new Error('As horas semanais devem ser um número maior que zero.');
  }

  return {
    id: String(id),
    name: name.trim(),
    weeklyHours: hours,
    difficulty: Math.max(1, Math.min(5, Number(difficulty) || 3)),
    color: color || '#4f46e5'
  };
}

/**
 * Cria um bloco de Disponibilidade semanal do estudante.
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.day - Dia da semana ('segunda', 'terca', etc.).
 * @param {string} params.startTime - "HH:MM" de início.
 * @param {string} params.endTime - "HH:MM" de fim.
 * @returns {Object} Bloco de disponibilidade.
 */
export function createAvailability({
  id = generateId('avail'),
  day,
  startTime,
  endTime
}) {
  if (!day) throw new Error('O dia da disponibilidade é obrigatório.');
  if (!startTime || !endTime) throw new Error('Horários de início e término são obrigatórios.');

  const durationMinutes = getDurationMinutes(startTime, endTime);
  if (durationMinutes <= 0) {
    throw new Error('O horário de término deve ser após o início.');
  }

  return {
    id: String(id),
    day: String(day).toLowerCase().trim(),
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    durationMinutes
  };
}

/**
 * Cria uma Prova ou Trabalho associado a uma matéria.
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.subjectId - ID da matéria associada.
 * @param {'exam'|'assignment'|'prova'|'trabalho'} params.type - Tipo de avaliação.
 * @param {string} params.title - Título ou descrição (ex: "P1 de Cálculo").
 * @param {number} params.daysUntil - Dias restantes até a entrega/realização.
 * @param {number} [params.weight=3] - Peso/importância de 1 a 5.
 * @param {string} [params.date] - Data opcional no formato AAAA-MM-DD.
 * @returns {Object} Avaliação.
 */
export function createAssessment({
  id = generateId('assess'),
  subjectId,
  type = 'exam',
  title,
  daysUntil = 7,
  weight = 3,
  date = ''
}) {
  if (!subjectId) throw new Error('O ID da matéria associada é obrigatório.');
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('O título da prova/trabalho é obrigatório.');
  }

  const normalizedType = ['exam', 'prova'].includes(String(type).toLowerCase()) ? 'exam' : 'assignment';
  const days = Math.max(0, parseInt(daysUntil, 10) || 0);

  return {
    id: String(id),
    subjectId: String(subjectId),
    type: normalizedType,
    title: title.trim(),
    daysUntil: days,
    weight: Math.max(1, Math.min(5, Number(weight) || 3)),
    date: date || ''
  };
}

/**
 * Cria um Compromisso fixo do estudante (aula, trabalho, médico, etc.).
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.title - Título do compromisso.
 * @param {string} params.day - Dia da semana.
 * @param {string} params.startTime - "HH:MM".
 * @param {string} params.endTime - "HH:MM".
 * @returns {Object} Compromisso.
 */
export function createCommitment({
  id = generateId('commit'),
  title,
  day,
  startTime,
  endTime
}) {
  if (!title) throw new Error('O título do compromisso é obrigatório.');
  if (!day) throw new Error('O dia do compromisso é obrigatório.');
  const durationMinutes = getDurationMinutes(startTime, endTime);
  if (durationMinutes <= 0) {
    throw new Error('O término deve ser após o início.');
  }

  return {
    id: String(id),
    title: title.trim(),
    day: String(day).toLowerCase().trim(),
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    durationMinutes
  };
}

/**
 * Cria uma Reserva de estudo fixa (bloco exclusivo travado para uma matéria específica).
 * @param {Object} params
 * @param {string} [params.id]
 * @param {string} params.subjectId - ID da matéria.
 * @param {string} params.day - Dia da semana.
 * @param {string} params.startTime - "HH:MM".
 * @param {string} params.endTime - "HH:MM".
 * @returns {Object} Reserva de estudo.
 */
export function createStudyReservation({
  id = generateId('res'),
  subjectId,
  day,
  startTime,
  endTime
}) {
  if (!subjectId) throw new Error('O ID da matéria é obrigatório na reserva.');
  if (!day) throw new Error('O dia é obrigatório na reserva.');
  const durationMinutes = getDurationMinutes(startTime, endTime);
  if (durationMinutes <= 0) {
    throw new Error('O término deve ser após o início.');
  }

  return {
    id: String(id),
    subjectId: String(subjectId),
    day: String(day).toLowerCase().trim(),
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    durationMinutes
  };
}

/**
 * Cria uma Sessão de Estudo individual gerada pelo planejador.
 * @param {Object} params
 * @returns {Object} Sessão de estudo.
 */
export function createStudySession({
  id = generateId('session'),
  subjectId,
  subjectName,
  color = '#4f46e5',
  durationMinutes = 60,
  priority = 10,
  deadlineDays = Infinity,
  sessionIndex = 1,
  totalSessions = 1,
  urgencyFactors = {}
}) {
  return {
    id: String(id),
    subjectId: String(subjectId),
    subjectName: String(subjectName),
    color,
    durationMinutes: Number(durationMinutes),
    priority: Number(priority),
    deadlineDays: Number(deadlineDays),
    sessionIndex: Number(sessionIndex),
    totalSessions: Number(totalSessions),
    urgencyFactors: { ...urgencyFactors }
  };
}

/**
 * Calcula os multiplicadores e bônus de prioridade de uma matéria com base nas provas e trabalhos.
 * Regras:
 * - Provas próximas (<= 14 dias): adicionam forte bônus inversamente proporcional ao prazo (até +20 pts).
 * - Trabalhos próximos (<= 14 dias): adicionam bônus moderado (até +12 pts).
 * - Dificuldade base da matéria: peso de 2 a 10 pts.
 *
 * @param {Object} subject - Objeto da matéria.
 * @param {Array<Object>} assessments - Lista de avaliações (provas e trabalhos).
 * @returns {{ priority: number, minDeadlineDays: number, factors: Object }}
 */
export function calculateSubjectPriority(subject, assessments = []) {
  const subjectAssessments = assessments.filter(a => String(a.subjectId) === String(subject.id));

  const baseDifficulty = (subject.difficulty || 3) * 2; // 2 a 10
  let examBonus = 0;
  let assignmentBonus = 0;
  let minDeadlineDays = Infinity;

  for (const item of subjectAssessments) {
    const days = typeof item.daysUntil === 'number' ? item.daysUntil : 14;
    if (days < minDeadlineDays) {
      minDeadlineDays = days;
    }

    const weightFactor = (item.weight || 3) / 3;

    if (item.type === 'exam') {
      // Prova em 1 dia: bônus 20 * peso. Prova em 7 dias: 10 * peso. Prova > 14 dias: 2.
      if (days <= 1) {
        examBonus = Math.max(examBonus, 20 * weightFactor);
      } else if (days <= 7) {
        examBonus = Math.max(examBonus, (20 - (days - 1) * 1.5) * weightFactor);
      } else if (days <= 14) {
        examBonus = Math.max(examBonus, (10 - (days - 7) * 0.8) * weightFactor);
      } else {
        examBonus = Math.max(examBonus, 2 * weightFactor);
      }
    } else {
      // Trabalho em 1 dia: bônus 12 * peso. Em 7 dias: 6 * peso.
      if (days <= 1) {
        assignmentBonus = Math.max(assignmentBonus, 12 * weightFactor);
      } else if (days <= 7) {
        assignmentBonus = Math.max(assignmentBonus, (12 - (days - 1) * 1.0) * weightFactor);
      } else if (days <= 14) {
        assignmentBonus = Math.max(assignmentBonus, (6 - (days - 7) * 0.5) * weightFactor);
      } else {
        assignmentBonus = Math.max(assignmentBonus, 1 * weightFactor);
      }
    }
  }

  const priority = Number((baseDifficulty + examBonus + assignmentBonus).toFixed(2));

  return {
    priority,
    minDeadlineDays,
    factors: {
      baseDifficulty,
      examBonus: Number(examBonus.toFixed(2)),
      assignmentBonus: Number(assignmentBonus.toFixed(2))
    }
  };
}

/**
 * Cria todas as sessões de estudo necessárias a partir dos dados de entrada.
 * Exemplo: Cálculo 2 com 3h vira três sessões de 1h (60 min).
 * Se as horas totais tiverem frações (ex: 2.5h = 150 min), vira duas sessões de 60m e uma de 30m.
 *
 * @param {Object} input
 * @param {Array<Object>} input.subjects - Lista de matérias.
 * @param {Array<Object>} [input.assessments] - Provas e trabalhos.
 * @param {Array<Object>} [input.exams] - Provas (caso venha separado).
 * @param {Array<Object>} [input.assignments] - Trabalhos (caso venha separado).
 * @param {Object} [options]
 * @param {number} [options.defaultSessionMinutes=60] - Duração padrão de cada sessão em minutos.
 * @returns {Array<Object>} Lista de sessões de estudo criadas.
 */
export function createStudySessions(input = {}, options = {}) {
  const { subjects = [] } = input;
  const defaultSessionMinutes = options.defaultSessionMinutes || 60;

  // Unifica avaliações se vierem em listas separadas ou únicas
  const allAssessments = [
    ...(input.assessments || []),
    ...(input.exams || []).map(e => ({ ...e, type: 'exam' })),
    ...(input.assignments || []).map(a => ({ ...a, type: 'assignment' }))
  ];

  const sessions = [];

  for (const subject of subjects) {
    const { priority, minDeadlineDays, factors } = calculateSubjectPriority(subject, allAssessments);

    const totalMinutes = Math.round((subject.weeklyHours || 0) * 60);
    if (totalMinutes <= 0) continue;

    // Divide em blocos de defaultSessionMinutes
    let remainingMinutes = totalMinutes;
    const sessionDurations = [];

    while (remainingMinutes > 0) {
      if (remainingMinutes >= defaultSessionMinutes) {
        sessionDurations.push(defaultSessionMinutes);
        remainingMinutes -= defaultSessionMinutes;
      } else {
        sessionDurations.push(remainingMinutes);
        remainingMinutes = 0;
      }
    }

    const totalSubjectSessions = sessionDurations.length;

    sessionDurations.forEach((duration, index) => {
      sessions.push(
        createStudySession({
          id: `${subject.id}-s${index + 1}`,
          subjectId: subject.id,
          subjectName: subject.name,
          color: subject.color || '#4f46e5',
          durationMinutes: duration,
          priority,
          deadlineDays: minDeadlineDays,
          sessionIndex: index + 1,
          totalSessions: totalSubjectSessions,
          urgencyFactors: factors
        })
      );
    });
  }

  return sessions;
}
