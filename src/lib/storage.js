/**
 * localStorage wrapper that never throws (private mode, blocked storage, SSR).
 * Only used for per-visitor conveniences such as language or profile.
 */
export const storage = {
  get(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Ignored on purpose: persistence is a nice-to-have.
    }
  },
};
