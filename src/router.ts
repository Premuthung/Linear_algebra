import { useSyncExternalStore } from 'react';

// Tiny hash router: "#/lesson/01-vectors/2" → ["lesson", "01-vectors", "2"].
// Hash routes work from any static host and need no server setup.

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function read(): string {
  return window.location.hash.replace(/^#\/?/, '');
}

export function useRoute(): string[] {
  const path = useSyncExternalStore(subscribe, read);
  return path.split('/').filter(Boolean);
}

export function lessonHref(id: string, step = 0): string {
  return `#/lesson/${id}/${step}`;
}
