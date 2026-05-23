/**
 * Storage parsing helpers.
 *
 * `JSON.parse(localStorage.getItem(...))` throws on corrupt/tampered keys —
 * inside `useMemo`/render, that blanks the whole page via the error boundary.
 * Use these wrappers in critical paths so a single bad key degrades gracefully
 * to the fallback instead of crashing the screen.
 */

export function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    return safeParse<T>(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}
