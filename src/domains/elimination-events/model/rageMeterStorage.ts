import { isBrowser } from '@utils/ssr';

const STORAGE_KEY = 'mod_rage_percent';

/** Persisted rage-meter fill (0..100) so an in-progress dropout survives a reload. */
export const loadRagePercent = (): number => {
  if (!isBrowser) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const value = Number(raw);
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
  } catch {
    return 0;
  }
};

export const saveRagePercent = (value: number): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Ignore quota / private-mode write failures — the meter just won't persist.
  }
};
