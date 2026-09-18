/**
 * US-24 — Segmented landing: explicit visitor profile (hotel administrator or
 * guest) that switches the content of the "For you" section.
 *
 * The chosen profile is reflected in the URL (?profile=guest) so it can be
 * shared, remembered per visitor, and published to other features (the demo
 * form sends it to the API).
 */
import { config } from '../config.js';
import { t, onLanguageChange } from '../i18n/index.js';
import { storage } from '../lib/storage.js';
import { PROFILES } from '../domain.js';

export { PROFILES };
const DEFAULT_PROFILE = 'admin';
const STORAGE_KEY = 'smartstay.profile';
const QUERY_PARAM = 'profile';

const listeners = new Set();
let currentProfile = DEFAULT_PROFILE;

export const isProfile = (value) => PROFILES.includes(value);
export const getProfile = () => currentProfile;

export function onProfileChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function render(profile) {
  for (const tab of document.querySelectorAll('[data-profile-tab]')) {
    const selected = tab.dataset.profileTab === profile;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const panel of document.querySelectorAll('[data-profile-panel]')) {
    panel.hidden = panel.dataset.profilePanel !== profile;
  }
}

function syncUrl(profile) {
  const url = new URL(window.location.href);
  url.searchParams.set(QUERY_PARAM, profile);
  window.history.replaceState(window.history.state, '', url);
}

export function setProfile(profile) {
  if (!isProfile(profile)) return;
  currentProfile = profile;
  render(profile);
  storage.set(STORAGE_KEY, profile);
  syncUrl(profile);
  for (const listener of listeners) listener(profile);
}

/** Moves the visitor to the content of the selected profile (1 click from the hero). */
function revealPanel(profile) {
  const section = document.getElementById('profile');
  const panel = document.querySelector(`[data-profile-panel="${profile}"]`);
  section?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  panel?.focus({ preventScroll: true });
}

function initTabs() {
  const tabs = [...document.querySelectorAll('[data-profile-tab]')];
  for (const tab of tabs) {
    tab.addEventListener('click', () => setProfile(tab.dataset.profileTab));
    // WAI-ARIA tabs pattern: arrows move between tabs, Home/End jump to the ends.
    tab.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(tab);
      const targets = {
        ArrowRight: tabs[(index + 1) % tabs.length],
        ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
        Home: tabs[0],
        End: tabs[tabs.length - 1],
      };
      const target = targets[event.key];
      if (!target) return;
      event.preventDefault();
      setProfile(target.dataset.profileTab);
      target.focus();
    });
  }
}

function initHeroChoices() {
  for (const button of document.querySelectorAll('[data-profile-choice]')) {
    button.addEventListener('click', () => {
      setProfile(button.dataset.profileChoice);
      revealPanel(button.dataset.profileChoice);
    });
  }
}

/**
 * "Download the app": links to the store page when VITE_APP_DOWNLOAD_URL is
 * set; otherwise shows an honest "coming soon" message instead of a fake link.
 */
function initAppDownload() {
  for (const trigger of document.querySelectorAll('[data-app-download]')) {
    if (config.appDownloadUrl) {
      const link = document.createElement('a');
      for (const { name, value } of trigger.attributes) {
        if (name !== 'type') link.setAttribute(name, value);
      }
      link.href = config.appDownloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = trigger.textContent;
      trigger.replaceWith(link);
      continue;
    }

    const status = trigger.closest('[data-cta-group]')?.querySelector('[data-app-download-status]');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      if (!status) return;
      status.hidden = false;
      status.textContent = t('app_coming_soon');
      trigger.setAttribute('aria-expanded', 'true');
    });
    onLanguageChange(() => {
      if (status && !status.hidden) status.textContent = t('app_coming_soon');
    });
  }
}

export function initProfile() {
  const fromUrl = new URLSearchParams(window.location.search).get(QUERY_PARAM);
  const initial = [fromUrl, storage.get(STORAGE_KEY)].find(isProfile) ?? DEFAULT_PROFILE;
  currentProfile = initial;
  render(initial);

  initTabs();
  initHeroChoices();
  initAppDownload();
}
