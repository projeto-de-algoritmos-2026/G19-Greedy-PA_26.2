import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSubject,
  createAssessment,
  createAvailability,
  createStudySessions,
  calculateSubjectPriority
} from '../docs/js/core/models.js';
import {
  calculateAvailableMinutes,
  sortSessionsByUrgency,
  selectSessions,
  scheduleIntervals
} from '../docs/js/core/intervalScheduler.js';

test('createStudySessions: divide horas em sessões de 1h e frações', () => {
  const subjects = [
    createSubject({ id: 's1', name: 'Cálculo 2', weeklyHours: 3, difficulty: 4 }),
    createSubject({ id: 's2', name: 'História', weeklyHours: 1.5, difficulty: 2 })
  ];

  const sessions = createStudySessions({ subjects });

  // Cálculo 2 tem 3h -> 3 sessões de 60 min
  const calc2Sessions = sessions.filter(s => s.subjectId === 's1');
  assert.equal(calc2Sessions.length, 3);
  assert.equal(calc2Sessions[0].durationMinutes, 60);
  assert.equal(calc2Sessions[1].durationMinutes, 60);
  assert.equal(calc2Sessions[2].durationMinutes, 60);
  assert.equal(calc2Sessions[0].sessionIndex, 1);
  assert.equal(calc2Sessions[2].sessionIndex, 3);

  // História tem 1.5h (90min) -> 1 de 60 min e 1 de 30 min
  const histSessions = sessions.filter(s => s.subjectId === 's2');
  assert.equal(histSessions.length, 2);
  assert.equal(histSessions[0].durationMinutes, 60);
  assert.equal(histSessions[1].durationMinutes, 30);
});

test('calculateSubjectPriority: provas e trabalhos próximos elevam a prioridade', () => {
  const subjNormal = createSubject({ id: 's1', name: 'Algoritmos', difficulty: 3 });
  const subjWithExam = createSubject({ id: 's2', name: 'Cálculo 2', difficulty: 3 });
  const subjWithAssignment = createSubject({ id: 's3', name: 'Física', difficulty: 3 });

  const assessments = [
    createAssessment({ subjectId: 's2', type: 'exam', title: 'P1 Cálculo', daysUntil: 2 }),
    createAssessment({ subjectId: 's3', type: 'assignment', title: 'Lista Física', daysUntil: 3 })
  ];

  const priorityNormal = calculateSubjectPriority(subjNormal, assessments);
  const priorityExam = calculateSubjectPriority(subjWithExam, assessments);
  const priorityAssignment = calculateSubjectPriority(subjWithAssignment, assessments);

  // Prova em 2 dias deve dar prioridade consideravelmente maior que normal
  assert.ok(priorityExam.priority > priorityNormal.priority, 'Prova próxima deve aumentar a prioridade');
  assert.ok(priorityAssignment.priority > priorityNormal.priority, 'Trabalho próximo deve aumentar prioridade');
  // Prova com mesmo prazo costuma ter peso maior que trabalho
  assert.ok(priorityExam.priority > priorityAssignment.priority, 'Prova tem peso maior que trabalho');
  assert.equal(priorityExam.minDeadlineDays, 2);
  assert.equal(priorityAssignment.minDeadlineDays, 3);
});

test('selectSessions: quando todas as sessões cabem na disponibilidade', () => {
  const subjects = [
    createSubject({ id: 's1', name: 'Matemática', weeklyHours: 2 }),
    createSubject({ id: 's2', name: 'Química', weeklyHours: 1 })
  ];
  // 3h de estudo necessárias (180 min)
  const sessions = createStudySessions({ subjects });

  // 4h de disponibilidade livre (240 min)
  const availability = [
    createAvailability({ day: 'segunda', startTime: '08:00', endTime: '12:00' })
  ];

  const result = selectSessions(sessions, availability);

  assert.equal(result.length, 3, 'Todas as 3 sessões devem ser selecionadas');
  assert.equal(result.pending.length, 0, 'Nenhuma sessão pendente');
  assert.equal(result.totalSelectedMinutes, 180);
  assert.equal(result.totalPendingMinutes, 0);
  assert.equal(result.totalAvailableMinutes, 240);
});

test('selectSessions: quando não cabem todas as sessões, prioriza por prazo e prioridade', () => {
  // Matéria A: 2h de estudo, prova em 2 dias (Urgente!)
  const subjUrgente = createSubject({ id: 's-urg', name: 'Cálculo Urgente', weeklyHours: 2, difficulty: 4 });
  // Matéria B: 3h de estudo, sem prova próxima
  const subjTranquila = createSubject({ id: 's-tranq', name: 'Optativa Tranquila', weeklyHours: 3, difficulty: 2 });

  const assessments = [
    createAssessment({ subjectId: 's-urg', type: 'exam', title: 'Prova P1', daysUntil: 2 })
  ];

  const sessions = createStudySessions({
    subjects: [subjTranquila, subjUrgente], // ordem inversa intencional
    assessments
  });

  // Total necessário: 5 horas (300 min).
  // Disponibilidade restrita: apenas 2 horas livres (120 min).
  const availability = [
    createAvailability({ day: 'segunda', startTime: '14:00', endTime: '16:00' })
  ];

  const result = selectSessions(sessions, availability);

  assert.equal(result.length, 2, 'Cabem exatamente 2 sessões de 1h');
  // As duas sessões selecionadas devem ser da matéria urgente
  assert.equal(result[0].subjectId, 's-urg');
  assert.equal(result[1].subjectId, 's-urg');

  // As 3 sessões da matéria tranquila devem estar pendentes
  assert.equal(result.pending.length, 3);
  assert.equal(result.pending[0].subjectId, 's-tranq');

  assert.equal(result.totalSelectedMinutes, 120);
  assert.equal(result.totalPendingMinutes, 180);
});

test('scheduleIntervals: retorna estatísticas corretas de horas alocadas e pendentes', () => {
  const subjects = [
    createSubject({ id: 's1', name: 'Biologia', weeklyHours: 4 })
  ];
  const sessions = createStudySessions({ subjects }); // 4 sessões de 60m = 240m

  // Disponibilidade de 2h30 (150m)
  const availability = [
    createAvailability({ day: 'terca', startTime: '10:00', endTime: '12:30' })
  ];

  const { selected, pending, stats } = scheduleIntervals(sessions, availability);

  assert.equal(selected.length, 2, 'Cabem 2 sessões inteiras de 60min');
  assert.equal(pending.length, 2, 'Restam 2 sessões de 60min');
  assert.equal(stats.totalAvailableMinutes, 150);
  assert.equal(stats.totalSelectedMinutes, 120);
  assert.equal(stats.totalPendingMinutes, 120);
});
