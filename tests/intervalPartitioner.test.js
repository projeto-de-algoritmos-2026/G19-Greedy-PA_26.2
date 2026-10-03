import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionSessions } from '../docs/js/core/intervalPartitioner.js';

test('partitionSessions: aloca sessões em blocos livres sem sobreposição', () => {
  const sessions = [
    { id: 's1', duration: 60, title: 'Sessão 1' },
    { id: 's2', duration: 60, title: 'Sessão 2' }
  ];

  const freeBlocks = [
    { day: 'segunda', start: 480, end: 600 } // 08:00 a 10:00 (120 min)
  ];

  const result = partitionSessions(sessions, freeBlocks);

  assert.equal(result.scheduled.length, 2);
  assert.equal(result.unallocated.length, 0);

  // Primeira sessão: 480 a 540 (08:00 a 09:00)
  assert.equal(result.scheduled[0].start, 480);
  assert.equal(result.scheduled[0].end, 540);
  assert.equal(result.scheduled[0].day, 'segunda');

  // Segunda sessão: 540 a 600 (09:00 a 10:00)
  assert.equal(result.scheduled[1].start, 540);
  assert.equal(result.scheduled[1].end, 600);
});

test('partitionSessions: envia para unallocated quando bloco é pequeno demais', () => {
  const sessions = [
    { id: 's1', duration: 90, title: 'Sessão Longa' }
  ];

  const freeBlocks = [
    { day: 'terca', start: 480, end: 540 } // apenas 60 min!
  ];

  const result = partitionSessions(sessions, freeBlocks);

  assert.equal(result.scheduled.length, 0);
  assert.equal(result.unallocated.length, 1);
  assert.equal(result.unallocated[0].reason, 'BLOCO_PEQUENO_DEMAIS');
});

test('partitionSessions: lida com múltiplos blocos e dias', () => {
  const sessions = [
    { id: 's1', duration: 60 },
    { id: 's2', duration: 60 }
  ];

  const freeBlocks = [
    { day: 'segunda', start: 480, end: 540 },
    { day: 'quarta', start: 600, end: 660 }
  ];

  const result = partitionSessions(sessions, freeBlocks);

  assert.equal(result.scheduled.length, 2);
  assert.equal(result.unallocated.length, 0);
});
