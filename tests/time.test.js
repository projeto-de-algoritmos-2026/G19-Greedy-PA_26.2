import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  intervalsOverlap,
  getDurationMinutes,
  formatDuration,
  DAYS_OF_WEEK
} from '../docs/js/core/time.js';

test('timeToMinutes: conversões válidas', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('08:30'), 510);
  assert.equal(timeToMinutes('8:30'), 510);
  assert.equal(timeToMinutes('12:00'), 720);
  assert.equal(timeToMinutes('23:59'), 1439);
  assert.equal(timeToMinutes(' 14:45 '), 885);
});

test('timeToMinutes: entradas inválidas devem lançar exceção', () => {
  assert.throws(() => timeToMinutes('24:00'), /fora dos limites/);
  assert.throws(() => timeToMinutes('12:60'), /fora dos limites/);
  assert.throws(() => timeToMinutes('-01:00'), /Formato de horário inválido/);
  assert.throws(() => timeToMinutes('invalido'), /Formato de horário inválido/);
  assert.throws(() => timeToMinutes(123), /Esperado string/);
});

test('minutesToTime: conversões válidas e padding', () => {
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(510), '08:30');
  assert.equal(minutesToTime(720), '12:00');
  assert.equal(minutesToTime(1439), '23:59');
  assert.equal(minutesToTime(5), '00:05');
  assert.equal(minutesToTime(65), '01:05');
});

test('minutesToTime: lida com valores fora de 1440 de forma circular', () => {
  assert.equal(minutesToTime(1440), '00:00');
  assert.equal(minutesToTime(1440 + 510), '08:30');
  assert.throws(() => minutesToTime('string'), /Esperado número/);
});

test('intervalsOverlap: intervalos sobrepostos', () => {
  // Sobreposição parcial
  assert.equal(intervalsOverlap('08:00', '10:00', '09:00', '11:00'), true);
  // Intervalo contido dentro do outro
  assert.equal(intervalsOverlap('08:00', '12:00', '09:00', '10:00'), true);
  // Intervalos idênticos
  assert.equal(intervalsOverlap('10:00', '11:00', '10:00', '11:00'), true);
  // Usando números (minutos)
  assert.equal(intervalsOverlap(480, 600, 540, 660), true);
});

test('intervalsOverlap: intervalos não sobrepostos e adjacentes', () => {
  // Claramente separados
  assert.equal(intervalsOverlap('08:00', '09:00', '10:00', '11:00'), false);
  // Adjacentes (fim de um coincide com início do outro)
  assert.equal(intervalsOverlap('08:00', '09:00', '09:00', '10:00'), false);
  assert.equal(intervalsOverlap('10:00', '11:00', '09:00', '10:00'), false);
  assert.equal(intervalsOverlap(480, 540, 540, 600), false);
});

test('intervalsOverlap: validação de início maior que fim', () => {
  assert.throws(() => intervalsOverlap('10:00', '09:00', '08:00', '09:00'), /posterior/);
});

test('getDurationMinutes e formatDuration', () => {
  assert.equal(getDurationMinutes('08:30', '10:00'), 90);
  assert.equal(formatDuration(90), '1h 30min');
  assert.equal(formatDuration(60), '1h');
  assert.equal(formatDuration(45), '45min');
  assert.equal(formatDuration(0), '0min');
});

test('DAYS_OF_WEEK contém os 7 dias esperados', () => {
  assert.equal(DAYS_OF_WEEK.length, 7);
  assert.equal(DAYS_OF_WEEK[0], 'segunda');
  assert.equal(DAYS_OF_WEEK[6], 'domingo');
});
