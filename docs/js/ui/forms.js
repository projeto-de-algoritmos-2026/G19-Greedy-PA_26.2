/**
 * @fileoverview Gerenciamento de formulários, captura de dados do usuário e estado local de cadastros.
 */

import {
  createSubject,
  createAvailability,
  createAssessment,
  createCommitment,
  createStudyReservation
} from '../core/models.js';
import { renderRegisteredItems } from './scheduleView.js';

let state = {
  subjects: [],
  availability: [],
  assessments: [],
  commitments: [],
  reservations: []
};

let onChangeListener = () => {};

/**
 * Retorna os dados atuais cadastrados pelo usuário.
 * @returns {{
 *   subjects: Array,
 *   availability: Array,
 *   assessments: Array,
 *   commitments: Array,
 *   reservations: Array
 * }}
 */
export function getFormData() {
  return {
    subjects: [...state.subjects],
    availability: [...state.availability],
    assessments: [...state.assessments],
    commitments: [...state.commitments],
    reservations: [...state.reservations]
  };
}

/**
 * Define e carrega dados no estado dos formulários, atualizando a interface.
 * @param {Object} data - Objeto contendo as entidades.
 */
export function setFormData(data = {}) {
  state.subjects = Array.isArray(data.subjects) ? data.subjects : [];
  state.availability = Array.isArray(data.availability) ? data.availability : [];
  state.assessments = Array.isArray(data.assessments) ? data.assessments : [];
  state.commitments = Array.isArray(data.commitments) ? data.commitments : [];
  state.reservations = Array.isArray(data.reservations) ? data.reservations : [];

  updateSubjectSelects();
  updateRegisteredItemsView();
  onChangeListener();
}

/**
 * Atualiza as opções dos selects de matéria em Provas e Reservas.
 */
export function updateSubjectSelects() {
  const assessmentSelect = document.getElementById('assessment-subject');
  const reservationSelect = document.getElementById('reservation-subject');

  const optionsHtml = state.subjects.length === 0
    ? '<option value="">Nenhuma matéria cadastrada...</option>'
    : '<option value="">Selecione uma matéria...</option>' +
      state.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');

  if (assessmentSelect) assessmentSelect.innerHTML = optionsHtml;
  if (reservationSelect) reservationSelect.innerHTML = optionsHtml;
}

/**
 * Atualiza as listas visuais dos itens cadastrados.
 */
export function updateRegisteredItemsView() {
  renderRegisteredItems({
    subjectsContainer: document.getElementById('list-subjects'),
    availabilityContainer: document.getElementById('list-availability'),
    assessmentsContainer: document.getElementById('list-assessments'),
    commitmentsContainer: document.getElementById('list-commitments'),
    reservationsContainer: document.getElementById('list-reservations')
  }, state);
}

/**
 * Configura os event listeners para os formulários de cadastro e botões de remoção.
 * @param {Function} [onDataChange] - Callback chamado quando qualquer entidade for adicionada ou removida.
 */
export function setupFormHandlers(onDataChange = () => {}) {
  onChangeListener = onDataChange;

  // 1. Formulário de Matérias
  const formSubject = document.getElementById('form-subject');
  if (formSubject) {
    formSubject.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('subject-name')?.value;
      const hours = parseFloat(document.getElementById('subject-hours')?.value || '2');
      const difficulty = parseInt(document.getElementById('subject-difficulty')?.value || '3', 10);
      const color = document.getElementById('subject-color')?.value || '#6366f1';

      if (!name || !name.trim()) return;

      const subject = createSubject({
        name,
        weeklyHours: hours,
        difficulty,
        color
      });

      state.subjects.push(subject);
      formSubject.reset();
      const colorInput = document.getElementById('subject-color');
      if (colorInput) colorInput.value = getRandomPresetColor();

      updateSubjectSelects();
      updateRegisteredItemsView();
      onChangeListener();
    });
  }

  // 2. Formulário de Disponibilidade
  const formAvailability = document.getElementById('form-availability');
  if (formAvailability) {
    formAvailability.addEventListener('submit', (e) => {
      e.preventDefault();
      const day = document.getElementById('avail-day')?.value || 'segunda';
      const startTime = document.getElementById('avail-start')?.value || '08:00';
      const endTime = document.getElementById('avail-end')?.value || '12:00';

      const block = createAvailability({
        day,
        startTime,
        endTime
      });

      state.availability.push(block);
      updateRegisteredItemsView();
      onChangeListener();
    });
  }

  // 3. Formulário de Provas & Trabalhos
  const formAssessment = document.getElementById('form-assessment');
  if (formAssessment) {
    formAssessment.addEventListener('submit', (e) => {
      e.preventDefault();
      const subjectId = document.getElementById('assessment-subject')?.value;
      const type = document.getElementById('assessment-type')?.value || 'exam';
      const title = document.getElementById('assessment-title')?.value;
      const daysUntil = parseInt(document.getElementById('assessment-days')?.value || '7', 10);

      if (!subjectId) {
        alert('Por favor, selecione a matéria associada à avaliação.');
        return;
      }

      const assessment = createAssessment({
        subjectId,
        type,
        title,
        daysUntil
      });

      state.assessments.push(assessment);
      formAssessment.reset();
      updateRegisteredItemsView();
      onChangeListener();
    });
  }

  // 4. Formulário de Compromisso Fixo
  const formCommitment = document.getElementById('form-commitment');
  if (formCommitment) {
    formCommitment.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('commitment-title')?.value;
      const day = document.getElementById('commitment-day')?.value || 'segunda';
      const startTime = document.getElementById('commitment-start')?.value || '14:00';
      const endTime = document.getElementById('commitment-end')?.value || '16:00';

      const commitment = createCommitment({
        title,
        day,
        startTime,
        endTime
      });

      state.commitments.push(commitment);
      formCommitment.reset();
      updateRegisteredItemsView();
      onChangeListener();
    });
  }

  // 5. Formulário de Reserva Fixa
  const formReservation = document.getElementById('form-reservation');
  if (formReservation) {
    formReservation.addEventListener('submit', (e) => {
      e.preventDefault();
      const subjectId = document.getElementById('reservation-subject')?.value;
      const day = document.getElementById('reservation-day')?.value || 'segunda';
      const startTime = document.getElementById('reservation-start')?.value || '19:00';
      const endTime = document.getElementById('reservation-end')?.value || '20:00';

      if (!subjectId) {
        alert('Selecione uma matéria para a reserva.');
        return;
      }

      const reservation = createStudyReservation({
        subjectId,
        day,
        startTime,
        endTime
      });

      state.reservations.push(reservation);
      formReservation.reset();
      updateRegisteredItemsView();
      onChangeListener();
    });
  }

  // 6. Delegação de Eventos para Exclusão de Itens
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');

    if (action === 'delete-subject') {
      state.subjects = state.subjects.filter(s => s.id !== id);
      state.assessments = state.assessments.filter(a => a.subjectId !== id);
      state.reservations = state.reservations.filter(r => r.subjectId !== id);
      updateSubjectSelects();
      updateRegisteredItemsView();
      onChangeListener();
    } else if (action === 'delete-availability') {
      state.availability = state.availability.filter(a => a.id !== id);
      updateRegisteredItemsView();
      onChangeListener();
    } else if (action === 'delete-assessment') {
      state.assessments = state.assessments.filter(a => a.id !== id);
      updateRegisteredItemsView();
      onChangeListener();
    } else if (action === 'delete-commitment') {
      state.commitments = state.commitments.filter(c => c.id !== id);
      updateRegisteredItemsView();
      onChangeListener();
    } else if (action === 'delete-reservation') {
      state.reservations = state.reservations.filter(r => r.id !== id);
      updateRegisteredItemsView();
      onChangeListener();
    }
  });

  updateSubjectSelects();
  updateRegisteredItemsView();
}

const PRESET_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#f97316'
];
function getRandomPresetColor() {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
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