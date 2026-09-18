/**
 * US-27 — Commercial contact block: phone, email and WhatsApp from config.
 */
import { config } from '../../config.js';
import { t, onLanguageChange } from '../../i18n/index.js';
import { mailtoLink, telLink, whatsappLink } from './contact-links.js';

/** Current direct-contact URLs, also used by the demo form error message. */
export function contactChannels() {
  return {
    phone: { href: telLink(config.salesPhone), label: config.salesPhone },
    email: { href: mailtoLink(config.salesEmail, t('contact_email_subject')), label: config.salesEmail },
    whatsapp: { href: whatsappLink(config.whatsappNumber, t('contact_whatsapp_message')), label: 'WhatsApp' },
  };
}

function render() {
  const channels = contactChannels();
  for (const link of document.querySelectorAll('[data-contact]')) {
    const channel = channels[link.dataset.contact];
    if (!channel) continue;
    link.href = channel.href;
    const value = link.querySelector('[data-contact-value]');
    if (value) value.textContent = channel.label;
  }
}

export function initContact() {
  render();
  // Prefilled WhatsApp text and email subject follow the page language.
  onLanguageChange(render);
}
