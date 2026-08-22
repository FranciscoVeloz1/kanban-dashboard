const STORAGE_KEY = 'kanban:refresh:v1';

export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeRefreshToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private mode may throw; in-memory auth still works for this tab.
  }
}

export function clearRefreshToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Already cleared in memory.
  }
}
