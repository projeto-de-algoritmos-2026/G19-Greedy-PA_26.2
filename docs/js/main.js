/**
 * @fileoverview Ponto de entrada da aplicação (Main Controller).
 * Conecta formulários, algoritmos gulosos (Interval Scheduling & Partitioning),
 * compressão de Huffman, persistência local e visualização na interface.
 */

import { getFormData, setFormData, setupFormHandlers } from './ui/forms.js';
import { generateSchedule } from './core/planner.js';
import {
  renderScheduleGrid,
  renderScheduleStats,
  renderPendingSessions
} from './ui/scheduleView.js';
import { saveDraft, loadDraft } from './data/storage.js';
import {
  exportJsonSchedule,
  exportCompressedSchedule,
  importScheduleFile
} from './data/importExport.js';
import { showNotification } from './ui/notifications.js';

let currentScheduleResult = null;

/**
 * Executa o cálculo da agenda e atualiza a interface visual.
 */
export function handleGenerateSchedule() {
  const input = getFormData();

  if (input.subjects.length === 0) {
    showNotification('Cadastre pelo menos uma matéria para gerar a agenda.', 'warning');
    return null;
  }

  if (input.availability.length === 0) {
    showNotification('Cadastre pelo menos um horário livre para alocar os estudos.', 'warning');
    return null;
  }

  try {
    // Chama o planejador unificado (Interval Scheduling + Interval Partitioning)
    const schedule = generateSchedule(input);
    currentScheduleResult = schedule;

    // Constrói mapa de matérias para estilização rápida
    const subjectsMap = new Map(input.subjects.map(s => [s.id, s]));

    // 1. Atualiza os cartões de estatísticas e métricas
    const metricsContainer = document.getElementById('schedule-metrics-container');
    if (metricsContainer) {
      renderScheduleStats(metricsContainer, schedule.stats);
    }

    // 2. Atualiza a lista/aviso de sessões pendentes
    const pendingContainer = document.getElementById('pending-sessions-container');
    if (pendingContainer) {
      renderPendingSessions(pendingContainer, schedule.unallocated, subjectsMap);
    }

    // 3. Atualiza a grade semanal de horários
    const calendarContainer = document.getElementById('schedule-calendar-container');
    if (calendarContainer) {
      renderScheduleGrid(calendarContainer, schedule.sessions, input);
    }

    if (schedule.unallocated && schedule.unallocated.length > 0) {
      showNotification(`Agenda gerada! (${schedule.unallocated.length} sessões pendentes por falta de horário)`, 'warning');
    } else {
      showNotification('Agenda semanal gerada com 100% de sucesso!', 'success');
    }

    return schedule;
  } catch (err) {
    console.error('Erro ao gerar a agenda:', err);
    showNotification(`Falha ao calcular a agenda: ${err.message}`, 'error');
    return null;
  }
}

/**
 * Salva o estado atual no localStorage.
 */
export function handleSaveDraft() {
  try {
    const data = getFormData();
    const payload = {
      ...data,
      savedAt: new Date().toISOString(),
      lastSchedule: currentScheduleResult
    };

    saveDraft(payload);
    showNotification('Rascunho salvo no navegador com sucesso!', 'success');
  } catch (err) {
    console.error('Erro ao salvar rascunho:', err);
    showNotification('Falha ao salvar rascunho.', 'error');
  }
}

/**
 * Carrega o rascunho salvo do localStorage.
 */
export function handleLoadDraft() {
  try {
    const saved = loadDraft();
    if (!saved) {
      showNotification('Nenhum rascunho salvo anteriormente.', 'info');
      return;
    }

    setFormData(saved);
    handleGenerateSchedule();
    showNotification('Rascunho carregado com sucesso!', 'success');
  } catch (err) {
    console.error('Erro ao carregar rascunho:', err);
    showNotification('Falha ao carregar rascunho salvo.', 'error');
  }
}

/**
 * Exporta os dados e agenda em JSON legível.
 */
export function handleExportJson() {
  try {
    const data = getFormData();
    const payload = {
      ...data,
      schedule: currentScheduleResult,
      exportedAt: new Date().toISOString()
    };
    exportJsonSchedule(payload);
    showNotification('Arquivo JSON exportado com sucesso!', 'success');
  } catch (err) {
    console.error('Erro ao exportar JSON:', err);
    showNotification('Falha ao exportar JSON.', 'error');
  }
}

/**
 * Exporta a agenda comprimida com o algoritmo de Huffman (.lhf).
 */
export function handleExportLhf() {
  try {
    const data = getFormData();
    const payload = {
      ...data,
      schedule: currentScheduleResult,
      exportedAt: new Date().toISOString()
    };
    exportCompressedSchedule(payload);
    showNotification('Agenda comprimida com Huffman (.lhf) exportada!', 'success');
  } catch (err) {
    console.error('Erro ao exportar .lhf:', err);
    showNotification('Falha na compressão Huffman do arquivo.', 'error');
  }
}

/**
 * Importa um arquivo selecionado (.json ou .lhf).
 * @param {File} file
 */
export async function handleImportFile(file) {
  if (!file) return;

  try {
    showNotification('Lendo e descompactando arquivo...', 'info', 2000);
    const data = await importScheduleFile(file);

    if (!data || typeof data !== 'object') {
      throw new Error('Conteúdo do arquivo inválido');
    }

    setFormData(data);
    handleGenerateSchedule();
    showNotification(`Arquivo "${file.name}" importado e agenda gerada com sucesso!`, 'success');
  } catch (err) {
    console.error('Erro ao importar arquivo:', err);
    showNotification(`Erro ao importar arquivo: ${err.message}`, 'error');
  }
}

/**
 * Carrega dados iniciais de demonstração caso o usuário não tenha nada cadastrado.
 */
// function loadDefaultDemoData() {
//   const demoData = {
//     subjects: [
//       { id: 'subj-1', name: 'Cálculo 2', weeklyHours: 3, difficulty: 5, color: '#6366f1' },
//       { id: 'subj-2', name: 'Algoritmos e Estruturas', weeklyHours: 3, difficulty: 4, color: '#06b6d4' },
//       { id: 'subj-3', name: 'Banco de Dados', weeklyHours: 2, difficulty: 3, color: '#10b981' }
//     ],
//     availability: [
//       { id: 'avail-1', day: 'segunda', startTime: '08:00', endTime: '11:00', durationMinutes: 180 },
//       { id: 'avail-2', day: 'terca', startTime: '14:00', endTime: '17:00', durationMinutes: 180 },
//       { id: 'avail-3', day: 'quarta', startTime: '08:00', endTime: '11:00', durationMinutes: 180 },
//       { id: 'avail-4', day: 'quinta', startTime: '14:00', endTime: '16:00', durationMinutes: 120 }
//     ],
//     assessments: [
//       { id: 'ass-1', subjectId: 'subj-1', type: 'exam', title: 'Prova P1 de Cálculo', daysUntil: 3, weight: 5 },
//       { id: 'ass-2', subjectId: 'subj-2', type: 'assignment', title: 'Trabalho de Grafos', daysUntil: 6, weight: 4 }
//     ],
//     commitments: [
//       { id: 'comm-1', title: 'Aula de Laboratório', day: 'segunda', startTime: '14:00', endTime: '16:00', durationMinutes: 120 }
//     ],
//     reservations: []
//   };

//   setFormData(demoData);
//   handleGenerateSchedule();
// }

/**
 * Inicialização global da aplicação.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa manipuladores de formulários
  setupFormHandlers(() => {
    // Quando qualquer dado muda nos formulários, re-calcula a agenda automaticamente
    handleGenerateSchedule();
  });

  // Conecta botões da barra superior
  const btnGenerate = document.getElementById('btn-generate');
  if (btnGenerate) btnGenerate.addEventListener('click', handleGenerateSchedule);

  const btnSave = document.getElementById('btn-save');
  if (btnSave) btnSave.addEventListener('click', handleSaveDraft);

  const btnLoad = document.getElementById('btn-load');
  if (btnLoad) btnLoad.addEventListener('click', handleLoadDraft);

  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) btnExportJson.addEventListener('click', handleExportJson);

  const btnExportLhf = document.getElementById('btn-export-lhf');
  if (btnExportLhf) btnExportLhf.addEventListener('click', handleExportLhf);

  // Gatilho de Importação de Arquivos
  const btnImportTrigger = document.getElementById('btn-import-trigger');
  const fileImportInput = document.getElementById('file-import-input');

  if (btnImportTrigger && fileImportInput) {
    btnImportTrigger.addEventListener('click', () => {
      fileImportInput.value = '';
      fileImportInput.click();
    });

    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleImportFile(file);
      }
    });
  }

  // Tenta carregar rascunho anterior ou dados demo
  const saved = loadDraft();
  if (saved && Array.isArray(saved.subjects) && saved.subjects.length > 0) {
    setFormData(saved);
    handleGenerateSchedule();
  } else {
    loadDefaultDemoData();
  }
});
