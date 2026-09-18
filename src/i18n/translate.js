/**
 * Pure i18n helpers (no DOM access) so they can run outside the browser.
 */
import es from './locales/es.js';
import en from './locales/en.js';

export const DICTIONARIES = Object.freeze({ es, en });
export const SUPPORTED_LANGUAGES = Object.freeze(Object.keys(DICTIONARIES));
export const DEFAULT_LANGUAGE = 'es';

/**
 * Resolves `key` in `lang`, falling back to the default language and finally
 * to the key itself. `{name}` placeholders are replaced with `params.name`.
 */
export function translate(lang, key, params = {}) {
  const dictionary = DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANGUAGE];
  const template = dictionary[key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}

/** Picks the first supported language from a stored preference or the browser list. */
export function resolveLanguage({ stored, preferred = [] } = {}) {
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}
