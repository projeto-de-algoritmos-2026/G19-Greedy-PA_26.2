/**
 * @fileoverview Utilitários de tempo e horários para o StudyScheduler.
 * Responsável por conversões entre representação em string ("HH:MM") e minutos absolutos,
 * além de checagens de sobreposição de intervalos temporais.
 */

export const DAYS_OF_WEEK = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo'
];

export const DAY_LABELS = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

/**
 * Converte um horário no formato "HH:MM" (ou "H:MM") em minutos a partir de 00:00.
 * @param {string} timeStr - Horário a converter (ex: "08:30" ou "8:30").
 * @returns {number} Quantidade total de minutos desde a meia-noite (0 a 1439).
 * @throws {Error} Se o formato for inválido ou valores estiverem fora da faixa [00:00 - 23:59].
 */
export function timeToMinutes(timeStr) {
  if (typeof timeStr !== 'string') {
    throw new TypeError(`Esperado string de horário, recebido: ${typeof timeStr}`);
  }

  const trimmed = timeStr.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);

  if (!match) {
    throw new Error(`Formato de horário inválido: "${timeStr}". Utilize "HH:MM".`);
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new RangeError(`Horário fora dos limites válidos (00:00 a 23:59): "${timeStr}"`);
  }

  return hours * 60 + minutes;
}

/**
 * Converte minutos absolutos desde a meia-noite para uma string no formato "HH:MM".
 * @param {number} totalMinutes - Quantidade de minutos (ex: 510).
 * @returns {string} Horário formatado como "HH:MM" (ex: "08:30").
 */
export function minutesToTime(totalMinutes) {
  if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes)) {
    throw new TypeError(`Esperado número de minutos válido, recebido: ${totalMinutes}`);
  }

  // Normaliza dentro do ciclo de 24 horas (1440 minutos)
  const normalized = Math.floor(totalMinutes) % 1440;
  const nonNegative = normalized < 0 ? normalized + 1440 : normalized;

  const hours = Math.floor(nonNegative / 60);
  const minutes = nonNegative % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${hh}:${mm}`;
}

/**
 * Normaliza um valor de tempo (minutos ou string "HH:MM") para minutos inteiros.
 * @param {string|number} time - Tempo em minutos ou string "HH:MM".
 * @returns {number} Minutos absolutos.
 */
function normalizeTime(time) {
  if (typeof time === 'number') {
    return Math.floor(time);
  }
  return timeToMinutes(time);
}

/**
 * Verifica se dois intervalos [start1, end1] e [start2, end2] se sobrepõem.
 * Intervalos adjacentes (onde o fim de um coincide com o início do outro) NÃO se sobrepõem.
 * Aceita horários como string "HH:MM" ou inteiros em minutos.
 *
 * @param {string|number} start1 - Início do intervalo 1.
 * @param {string|number} end1   - Fim do intervalo 1.
 * @param {string|number} start2 - Início do intervalo 2.
 * @param {string|number} end2   - Fim do intervalo 2.
 * @returns {boolean} True se houver sobreposição positiva, false caso contrário.
 */
export function intervalsOverlap(start1, end1, start2, end2) {
  const s1 = normalizeTime(start1);
  const e1 = normalizeTime(end1);
  const s2 = normalizeTime(start2);
  const e2 = normalizeTime(end2);

  if (s1 > e1 || s2 > e2) {
    throw new Error('O horário de início não pode ser posterior ao de término.');
  }

  // Sobreposição existe se max(s1, s2) < min(e1, e2)
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Calcula a duração em minutos entre dois horários.
 * @param {string|number} start - Início ("HH:MM" ou minutos).
 * @param {string|number} end   - Fim ("HH:MM" ou minutos).
 * @returns {number} Duração em minutos.
 */
export function getDurationMinutes(start, end) {
  const s = normalizeTime(start);
  const e = normalizeTime(end);
  if (s > e) {
    throw new Error('Início não pode ser maior que o fim.');
  }
  return e - s;
}

/**
 * Formata minutos em texto amigável (ex: "1h 30min", "2h", "45min").
 * @param {number} minutes - Minutos totais.
 * @returns {string} Texto formatado.
 */
export function formatDuration(minutes) {
  if (minutes <= 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}
