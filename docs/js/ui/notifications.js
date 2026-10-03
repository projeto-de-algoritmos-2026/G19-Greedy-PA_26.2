/**
 * @fileoverview Sistema de Notificações / Toasts para feedback visual das ações do usuário.
 */

/**
 * Exibe uma notificação toast na tela.
 * @param {string} message - Texto da notificação.
 * @param {'success'|'warning'|'error'|'info'} [type='info'] - Tipo visual do toast.
 * @param {number} [duration=3500] - Tempo em milissegundos para desaparecer.
 */
export function showNotification(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#6366f1'
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.6rem;">
      <span style="color: ${colors[type] || colors.info}; font-weight: bold; font-size: 1.1rem;">
        ${icons[type] || 'ℹ'}
      </span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
