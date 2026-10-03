/**
 * @fileoverview Visualização e Renderização da Agenda Semanal (ScheduleView).
 * Responsável por montar a grade/calendário semanal, renderizar os blocos de estudo
 * alocados com suas respectivas cores, exibir métricas de horas alocadas e pendentes,
 * e listar sessões não alocadas com avisos de prioridade.
 */

import { DAY_LABELS, DAYS_OF_WEEK, minutesToTime, timeToMinutes, formatDuration } from '../core/time.js';

export const DEFAULT_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#ef4444'
];

const DAY_ALIASES = {
  monday: 'segunda',
  mon: 'segunda',
  seg: 'segunda',
  tuesday: 'terca',
  tue: 'terca',
  terça: 'terca',
  ter: 'terca',
  wednesday: 'quarta',
  wed: 'quarta',
  qua: 'quarta',
  thursday: 'quinta',
  thu: 'quinta',
  qui: 'quinta',
  friday: 'sexta',
  fri: 'sexta',
  sex: 'sexta',
  saturday: 'sabado',
  sat: 'sabado',
  sábado: 'sabado',
  sab: 'sabado',
  sunday: 'domingo',
  sun: 'domingo',
  dom: 'domingo'
};

function normalizeDay(day) {
  if (!day) return 'segunda';
  const clean = String(day).toLowerCase().trim();
  return DAY_ALIASES[clean] || clean;
}

function formatTimeValue(val, fallback = '08:00') {
  if (typeof val === 'number') {
    return minutesToTime(val);
  }
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim();
  }
  return fallback;
}

/**
 * Renderiza os cards de métricas (horas alocadas, pendentes, aproveitamento).
 * @param {HTMLElement} container - Elemento HTML onde as métricas serão inseridas.
 * @param {Object} stats - Estatísticas retornadas pelo planner ou scheduler.
 */
export function renderScheduleStats(container, stats = {}) {
  if (!container) return;

  const totalMin = stats.totalRequestedMinutes || 0;
  const schedMin = stats.totalScheduledMinutes || 0;
  const unallocMin = stats.totalUnallocatedMinutes || 0;
  const rate = stats.occupancyRate || (totalMin > 0 ? Math.round((schedMin / totalMin) * 100) : 0);

  container.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon metric-icon-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Horas Solicitadas</span>
          <span class="metric-value">${formatDuration(totalMin)}</span>
          <span class="metric-sub">${stats.totalRequestedSessions || 0} sessões no total</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-icon-success">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Horas Alocadas</span>
          <span class="metric-value text-success">${formatDuration(schedMin)}</span>
          <span class="metric-sub">${stats.scheduledSessionsCount || 0} sessões agendadas</span>
        </div>
      </div>

      <div class="metric-card ${unallocMin > 0 ? 'metric-card-warning' : ''}">
        <div class="metric-icon ${unallocMin > 0 ? 'metric-icon-warning' : 'metric-icon-neutral'}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Horas Pendentes</span>
          <span class="metric-value ${unallocMin > 0 ? 'text-warning' : ''}">${formatDuration(unallocMin)}</span>
          <span class="metric-sub">${stats.unallocatedSessionsCount || 0} sessões não couberam</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon metric-icon-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Taxa de Eficiência</span>
          <span class="metric-value">${rate}%</span>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${rate}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza o aviso e lista de sessões pendentes (unallocated).
 * @param {HTMLElement} container - Elemento HTML container.
 * @param {Array<Object>} unallocated - Lista de sessões não alocadas.
 * @param {Map<string, Object>} [subjectsMap] - Mapeamento de matérias por ID.
 */
export function renderPendingSessions(container, unallocated = [], subjectsMap = new Map()) {
  if (!container) return;

  if (!unallocated || unallocated.length === 0) {
    container.innerHTML = `
      <div class="alert alert-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>
          <strong>Excelente!</strong> Todas as sessões de estudo necessárias couberam perfeitamente na sua disponibilidade semanal.
        </div>
      </div>
    `;
    return;
  }

  const itemsHtml = unallocated.map(session => {
    const subject = subjectsMap.get(session.subjectId) || {};
    const color = session.color || subject.color || '#ef4444';

    let urgencyTag = '';
    if (session.deadlineDays && session.deadlineDays <= 7) {
      urgencyTag = `<span class="badge badge-urgent">⚡ Prova em ${session.deadlineDays}d</span>`;
    }

    return `
      <div class="pending-session-item" style="border-left-color: ${color}">
        <div class="pending-session-header">
          <span class="pending-session-name">
            <span class="color-dot" style="background-color: ${color}"></span>
            ${escapeHtml(session.subjectName || session.title || subject.name || 'Matéria')}
          </span>
          <span class="badge badge-neutral">${session.durationMinutes || session.duration || 60} min</span>
          ${urgencyTag}
        </div>
        <div class="pending-session-detail">
          <span>Sessão ${session.sessionIndex || 1} de ${session.totalSessions || 1}</span>
          <span class="text-muted">• Prioridade: ${session.priority || 0} pts</span>
          ${session.reason ? `<span class="badge badge-neutral">${escapeHtml(session.reason)}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="alert alert-warning">
      <div class="alert-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <strong>Atenção: ${unallocated.length} sessão(ões) pendente(s) não couberam na sua disponibilidade</strong>
      </div>
      <p class="alert-desc">
        O algoritmo priorizou as sessões mais urgentes (provas próximas e matérias com maior peso). Para alocar as restantes, cadastre mais horários livres na semana.
      </p>
      <div class="pending-sessions-list">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Renderiza o calendário/grade semanal com as sessões alocadas por dia da semana.
 * @param {HTMLElement} container - Elemento HTML container.
 * @param {Array<Object>} scheduledSessions - Sessões alocadas.
 * @param {Object} [context={}] - Contexto adicional com matérias, compromissos e disponibilidades.
 */
export function renderScheduleGrid(container, scheduledSessions = [], context = {}) {
  if (!container) return;

  const { subjects = [], commitments = [], reservations = [] } = context;
  const subjectsMap = new Map(subjects.map(s => [s.id, s]));

  // Agrupa itens por dia da semana
  const dayBuckets = {};
  for (const day of DAYS_OF_WEEK) {
    dayBuckets[day] = [];
  }

  // 1. Sessões de estudo agendadas
  for (const session of scheduledSessions) {
    const rawDay = session.day || '';
    const day = normalizeDay(rawDay);

    if (dayBuckets[day]) {
      const subject = subjectsMap.get(session.subjectId) || {};
      const startTime = formatTimeValue(session.start !== undefined ? session.start : session.startTime, '08:00');
      const endTime = formatTimeValue(session.end !== undefined ? session.end : session.endTime, '09:00');

      dayBuckets[day].push({
        type: 'study',
        id: session.id,
        title: session.subjectName || session.title || subject.name || 'Estudo',
        startTime,
        endTime,
        color: session.color || subject.color || '#6366f1',
        sessionIndex: session.sessionIndex,
        totalSessions: session.totalSessions,
        priority: session.priority,
        deadlineDays: session.deadlineDays
      });
    }
  }

  // 2. Compromissos fixos cadastrados
  for (const comm of commitments) {
    const day = normalizeDay(comm.day);
    if (dayBuckets[day]) {
      dayBuckets[day].push({
        type: 'commitment',
        id: comm.id,
        title: comm.title || 'Compromisso',
        startTime: formatTimeValue(comm.startTime, '14:00'),
        endTime: formatTimeValue(comm.endTime, '16:00'),
        color: '#64748b'
      });
    }
  }

  // 3. Reservas de estudo fixas
  for (const res of reservations) {
    const day = normalizeDay(res.day);
    if (dayBuckets[day]) {
      const subject = subjectsMap.get(res.subjectId) || {};
      dayBuckets[day].push({
        type: 'reservation',
        id: res.id,
        title: `Reserva: ${subject.name || 'Estudo Fixo'}`,
        startTime: formatTimeValue(res.startTime, '19:00'),
        endTime: formatTimeValue(res.endTime, '20:00'),
        color: subject.color || '#4f46e5'
      });
    }
  }

  // Ordena cronologicamente os itens de cada dia por horário de início
  for (const day of DAYS_OF_WEEK) {
    dayBuckets[day].sort((a, b) => timeToMinutesSafe(a.startTime) - timeToMinutesSafe(b.startTime));
  }

  // Monta o HTML do calendário semanal
  let calendarHtml = `
    <div class="calendar-wrapper">
      <div class="calendar-grid">
  `;

  for (const day of DAYS_OF_WEEK) {
    const dayItems = dayBuckets[day];
    const dayLabel = DAY_LABELS[day] || day;
    const isToday = isDayToday(day);

    let itemsHtml = '';
    if (dayItems.length === 0) {
      itemsHtml = `
        <div class="calendar-empty-day">
          <span class="text-muted">Sem atividades</span>
        </div>
      `;
    } else {
      itemsHtml = dayItems.map(item => {
        const isCommitment = item.type === 'commitment';
        const isReservation = item.type === 'reservation';

        let badgeIcon = '📖';
        let typeClass = 'item-study';
        if (isCommitment) {
          badgeIcon = '📌';
          typeClass = 'item-commitment';
        } else if (isReservation) {
          badgeIcon = '🔒';
          typeClass = 'item-reservation';
        }

        let urgencyBadge = '';
        if (item.deadlineDays && item.deadlineDays <= 7) {
          urgencyBadge = `<span class="item-badge-urgent" title="Prova em ${item.deadlineDays} dias">⚡ ${item.deadlineDays}d</span>`;
        }

        return `
          <div class="calendar-item ${typeClass}" style="--item-color: ${item.color};">
            <div class="calendar-item-time">
              <span>${item.startTime} - ${item.endTime}</span>
              ${urgencyBadge}
            </div>
            <div class="calendar-item-title">
              <span class="item-icon">${badgeIcon}</span>
              <span>${escapeHtml(item.title)}</span>
            </div>
            ${item.sessionIndex ? `<div class="calendar-item-meta">Sessão ${item.sessionIndex}/${item.totalSessions}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    calendarHtml += `
      <div class="calendar-day-column ${isToday ? 'is-today' : ''}">
        <div class="calendar-day-header">
          <span class="day-name">${dayLabel}</span>
          ${isToday ? '<span class="today-chip">Hoje</span>' : ''}
        </div>
        <div class="calendar-day-body">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  calendarHtml += `
      </div>
    </div>
  `;

  container.innerHTML = calendarHtml;
}

/**
 * Renderiza as listas de itens cadastrados nos formulários.
 */
export function renderRegisteredItems({
  subjectsContainer,
  availabilityContainer,
  assessmentsContainer,
  commitmentsContainer,
  reservationsContainer
}, data = {}) {
  // Matérias
  if (subjectsContainer) {
    const subjects = data.subjects || [];
    if (subjects.length === 0) {
      subjectsContainer.innerHTML = '<p class="empty-list-hint">Nenhuma matéria cadastrada ainda.</p>';
    } else {
      subjectsContainer.innerHTML = subjects.map(s => `
        <div class="chip chip-subject" style="border-left-color: ${s.color || '#6366f1'}">
          <span class="color-dot" style="background-color: ${s.color || '#6366f1'}"></span>
          <span class="chip-name">${escapeHtml(s.name)}</span>
          <span class="chip-badge">${s.weeklyHours}h/sem</span>
          <span class="chip-badge-neutral">Dif. ${s.difficulty || 3}</span>
          <button type="button" class="btn-chip-delete" data-action="delete-subject" data-id="${s.id}" title="Remover matéria">&times;</button>
        </div>
      `).join('');
    }
  }

  // Disponibilidade
  if (availabilityContainer) {
    const avail = data.availability || [];
    if (avail.length === 0) {
      availabilityContainer.innerHTML = '<p class="empty-list-hint">Nenhum horário livre cadastrado.</p>';
    } else {
      availabilityContainer.innerHTML = avail.map(a => {
        const start = formatTimeValue(a.startTime || a.start, '08:00');
        const end = formatTimeValue(a.endTime || a.end, '12:00');
        const dayLabel = DAY_LABELS[normalizeDay(a.day)] || a.day;
        const dur = a.durationMinutes || getDurationMinutesSafe(start, end);
        return `
          <div class="chip chip-availability">
            <span class="chip-name">${dayLabel}: ${start} às ${end}</span>
            <span class="chip-badge">${formatDuration(dur)}</span>
            <button type="button" class="btn-chip-delete" data-action="delete-availability" data-id="${a.id}" title="Remover horário">&times;</button>
          </div>
        `;
      }).join('');
    }
  }

  // Provas e Trabalhos
  if (assessmentsContainer) {
    const assess = data.assessments || [];
    const subjectsMap = new Map((data.subjects || []).map(s => [s.id, s]));
    if (assess.length === 0) {
      assessmentsContainer.innerHTML = '<p class="empty-list-hint">Nenhuma prova ou trabalho cadastrado.</p>';
    } else {
      assessmentsContainer.innerHTML = assess.map(item => {
        const subj = subjectsMap.get(item.subjectId) || {};
        const isExam = item.type === 'exam';
        const typeLabel = isExam ? 'Prova' : 'Trabalho';
        const color = subj.color || '#f59e0b';
        return `
          <div class="chip chip-assessment" style="border-left-color: ${color}">
            <span class="badge ${isExam ? 'badge-exam' : 'badge-assignment'}">${typeLabel}</span>
            <span class="chip-name">${escapeHtml(item.title)} (${escapeHtml(subj.name || 'Geral')})</span>
            <span class="chip-badge-urgent">em ${item.daysUntil} dias</span>
            <button type="button" class="btn-chip-delete" data-action="delete-assessment" data-id="${item.id}" title="Remover">&times;</button>
          </div>
        `;
      }).join('');
    }
  }

  // Compromissos
  if (commitmentsContainer) {
    const comm = data.commitments || [];
    if (comm.length === 0) {
      commitmentsContainer.innerHTML = '<p class="empty-list-hint">Nenhum compromisso fixo cadastrado.</p>';
    } else {
      commitmentsContainer.innerHTML = comm.map(c => {
        const start = formatTimeValue(c.startTime, '14:00');
        const end = formatTimeValue(c.endTime, '16:00');
        const dayLabel = DAY_LABELS[normalizeDay(c.day)] || c.day;
        return `
          <div class="chip chip-commitment">
            <span class="chip-name">${escapeHtml(c.title)} (${dayLabel}: ${start} - ${end})</span>
            <button type="button" class="btn-chip-delete" data-action="delete-commitment" data-id="${c.id}" title="Remover">&times;</button>
          </div>
        `;
      }).join('');
    }
  }

  // Reservas
  if (reservationsContainer) {
    const res = data.reservations || [];
    const subjectsMap = new Map((data.subjects || []).map(s => [s.id, s]));
    if (res.length === 0) {
      reservationsContainer.innerHTML = '<p class="empty-list-hint">Nenhuma reserva fixa cadastrada.</p>';
    } else {
      reservationsContainer.innerHTML = res.map(r => {
        const subj = subjectsMap.get(r.subjectId) || {};
        const start = formatTimeValue(r.startTime, '19:00');
        const end = formatTimeValue(r.endTime, '20:00');
        const dayLabel = DAY_LABELS[normalizeDay(r.day)] || r.day;
        return `
          <div class="chip chip-reservation" style="border-left-color: ${subj.color || '#6366f1'}">
            <span class="chip-name">Reserva: ${escapeHtml(subj.name || 'Matéria')} (${dayLabel}: ${start} - ${end})</span>
            <button type="button" class="btn-chip-delete" data-action="delete-reservation" data-id="${r.id}" title="Remover">&times;</button>
          </div>
        `;
      }).join('');
    }
  }
}

function isDayToday(dayKey) {
  const jsDay = new Date().getDay();
  const mapping = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return mapping[jsDay] === dayKey;
}

function timeToMinutesSafe(str) {
  try {
    return timeToMinutes(str);
  } catch {
    return 0;
  }
}

function getDurationMinutesSafe(start, end) {
  try {
    return timeToMinutes(end) - timeToMinutes(start);
  } catch {
    return 60;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
