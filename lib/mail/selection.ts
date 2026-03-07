export const SELECTION_STORAGE_KEY = "tech-news-digest:selected-articles";

export function loadSelectedArticleIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SELECTION_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function saveSelectedArticleIds(articleIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(articleIds));
  window.dispatchEvent(new Event("selection:changed"));
}

export function toggleSelectedArticleId(articleId: string) {
  const current = loadSelectedArticleIds();
  const next = current.includes(articleId)
    ? current.filter((id) => id !== articleId)
    : [...current, articleId];

  saveSelectedArticleIds(next);
  return next;
}

export function removeSelectedArticleId(articleId: string) {
  const current = loadSelectedArticleIds();
  const next = current.filter((id) => id !== articleId);
  saveSelectedArticleIds(next);
  return next;
}

export function clearSelectedArticleIds() {
  saveSelectedArticleIds([]);
}
