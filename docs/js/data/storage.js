const STORAGE_KEY = "studyscheduler:draft";

export function saveDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  return JSON.parse(saved);
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}