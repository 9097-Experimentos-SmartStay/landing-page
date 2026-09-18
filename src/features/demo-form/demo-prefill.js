/**
 * Tiny channel so other sections (success stories, solution packs) can open the
 * demo form pre-filled without depending on its DOM.
 */
const listeners = new Set();

/** @param {(prefill: { accommodationType?: string, message?: string }) => void} listener */
export function onDemoPrefill(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pre-fills the demo form and brings it into view. */
export function requestDemoPrefill(prefill) {
  for (const listener of listeners) listener(prefill);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('demo')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
