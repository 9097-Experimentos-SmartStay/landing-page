/**
 * US-27 — Commercial contact block: phone, email and WhatsApp from config.
 * Only the email is a link; phone and WhatsApp are plain text on purpose.
 */
import { config } from '../../config.js';
import { t, onLanguageChange } from '../../i18n/index.js';
import { mailtoLink } from './contact-links.js';

/** Current direct-contact channels, also used by the demo form error message. */
export function contactChannels() {
  return {
    phone: { label: config.salesPhone },
    email: { href: mailtoLink(config.salesEmail, t('contact_email_subject')), label: config.salesEmail },
    whatsapp: { label: config.whatsappNumber },
  };
}

function render() {
  const channels = contactChannels();
  for (const item of document.querySelectorAll('[data-contact]')) {
    const channel = channels[item.dataset.contact];
    if (!channel) continue;
    if (channel.href && item instanceof HTMLAnchorElement) item.href = channel.href;
    const value = item.querySelector('[data-contact-value]');
    if (value) value.textContent = channel.label;
  }
}

export function initContact() {
  render();
  // The prefilled email subject follows the page language.
  onLanguageChange(render);
}
