/**
 * DOM side of i18n: applies the dictionaries to elements marked with
 *   data-i18n="key"                 -> textContent
 *   data-i18n-attr="attr:key;..."   -> attributes (aria-label, placeholder, title...)
 * and notifies feature modules that render dynamic content.
 */
import { translate, resolveLanguage, SUPPORTED_LANGUAGES } from './translate.js';
import { storage } from '../lib/storage.js';

const STORAGE_KEY = 'smartstay.lang';
const listeners = new Set();
let currentLanguage = resolveLanguage();

export const t = (key, params) => translate(currentLanguage, key, params);
export const getLanguage = () => currentLanguage;

/** Registers a callback invoked after every language change. Returns an unsubscribe fn. */
export function onLanguageChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyTranslations(root = document) {
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of element.dataset.i18nAttr.split(';')) {
      const [attribute, key] = pair.split(':').map((part) => part.trim());
      if (attribute && key) element.setAttribute(attribute, t(key));
    }
  }
}

function updateDocumentMetadata() {
  document.documentElement.lang = currentLanguage;
  document.title = t('meta_title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta_description'));
  for (const button of document.querySelectorAll('[data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === currentLanguage));
  }
}

export function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) return;
  currentLanguage = language;
  storage.set(STORAGE_KEY, language);
  applyTranslations();
  updateDocumentMetadata();
  for (const listener of listeners) listener(language);
}

export function initI18n() {
  currentLanguage = resolveLanguage({
    stored: storage.get(STORAGE_KEY),
    preferred: navigator.languages ?? [navigator.language],
  });

  for (const button of document.querySelectorAll('[data-lang]')) {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  }

  applyTranslations();
  updateDocumentMetadata();
}
