/**
 * Header behaviour: mobile menu toggle and links to the web application.
 */
import { config } from '../config.js';
import { t, onLanguageChange } from '../i18n/index.js';

const APP_PATHS = { login: '/login', register: '/register' };

function initAppLinks() {
  for (const link of document.querySelectorAll('[data-app-link]')) {
    const path = APP_PATHS[link.dataset.appLink];
    if (path) link.href = `${config.webAppUrl}${path}`;
  }
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'nav_close_menu' : 'nav_open_menu'));
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  // Selecting a destination closes the menu so the section is not covered.
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Same breakpoint as the inline navigation (Tailwind `xl`): from there the menu has nothing left to show.
  window.matchMedia('(min-width: 80rem)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
  onLanguageChange(() => setOpen(!menu.hidden));
}

export function initNavigation() {
  initAppLinks();
  initMobileMenu();
  for (const element of document.querySelectorAll('[data-current-year]')) {
    element.textContent = String(new Date().getFullYear());
  }
}
