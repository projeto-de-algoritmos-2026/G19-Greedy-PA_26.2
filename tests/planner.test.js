import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSchedule } from '../docs/js/core/planner.js';
import { createSubject, createAvailability, createAssessment } from '../docs/js/core/models.js';

test('generateSchedule: fluxo completo com matérias e disponibilidade', () => {
  const input = {
    subjects: [
      createSubject({ id: 's1', name: 'Estruturas de Dados', weeklyHours: 2 }),
      createSubject({ id: 's2', name: 'Cálculo 1', weeklyHours: 3 })
    ],
    availability: [
      createAvailability({ day: 'segunda', startTime: '14:00', endTime: '18:00' }),
      createAvailability({ day: 'quarta', startTime: '09:00', endTime: '12:00' })
    ],
    assessments: [
      createAssessment({ subjectId: 's1', type: 'exam', title: 'P1 ED', daysUntil: 3 })
    ]
  };

  const schedule = generateSchedule(input);

  assert.ok(schedule, 'Deve retornar um objeto de agenda');
  assert.ok(Array.isArray(schedule.sessions), 'sessions deve ser um array');
  assert.ok(Array.isArray(schedule.unallocated), 'unallocated deve ser um array');
  assert.ok(schedule.stats, 'stats deve conter estatísticas de alocação');
  assert.equal(schedule.stats.totalRequestedSessions, 5, '2h ED (2 sessões) + 3h Cálculo (3 sessões) = 5 sessões');
  assert.equal(schedule.stats.totalRequestedMinutes, 300);
});

test('generateSchedule: lida com entradas vazias sem quebrar', () => {
  const schedule = generateSchedule({});
  assert.deepEqual(schedule.sessions, []);
  assert.deepEqual(schedule.unallocated, []);
  assert.equal(schedule.stats.totalRequestedSessions, 0);
  assert.equal(schedule.stats.occupancyRate, 0);
});

test('generateSchedule: separa sessões pendentes quando a disponibilidade é insuficiente', () => {
  const input = {
    subjects: [
      createSubject({ id: 's1', name: 'Física Moderna', weeklyHours: 4 })
    ],
    availability: [
      createAvailability({ day: 'sexta', startTime: '08:00', endTime: '09:00' }) // apenas 1 hora livre!
    ]
  };

  const schedule = generateSchedule(input);

  // Total de 4 sessões solicitadas. Apenas 1 cabe no intervalo.
  // 3 devem ficar unallocated
  assert.equal(schedule.stats.totalRequestedSessions, 4);
  assert.ok(schedule.unallocated.length >= 3, 'Pelo menos 3 sessões devem ficar unallocated');
});
