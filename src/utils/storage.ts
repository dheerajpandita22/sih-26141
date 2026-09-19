// Thin, defensive localStorage wrapper. All simulation persistence
// (session, latest signature/result, history, batch metrics, known nonces)
// goes through here so the rest of the app never touches window.localStorage
// directly and never throws if storage is unavailable (private browsing,
// quota exceeded, etc).

const PREFIX = "sih26141";

const KEYS = {
  session: `${PREFIX}:session`,
  signature: `${PREFIX}:signature`,
  verdict: `${PREFIX}:verdict`,
  history: `${PREFIX}:history`,
  batchMetrics: `${PREFIX}:batchMetrics`,
  knownNonces: `${PREFIX}:knownNonces`,
  config: `${PREFIX}:config`,
} as const;

export type StorageKey = keyof typeof KEYS;

export function saveToStorage<T>(key: StorageKey, value: T): void {
  try {
    window.localStorage.setItem(KEYS[key], JSON.stringify(value));
  } catch {
    // ignore — storage may be unavailable or full; simulation still works
    // in-memory for the current session.
  }
}

export function loadFromStorage<T>(key: StorageKey): T | null {
  try {
    const raw = window.localStorage.getItem(KEYS[key]);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
