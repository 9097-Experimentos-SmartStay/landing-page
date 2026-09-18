/**
 * US-27 — Builders for the direct sales channels and the scheduling link.
 * Pure functions so they can be unit tested.
 */

/** `https://wa.me/<digits>?text=...` — wa.me requires the number without "+" or separators. */
export function whatsappLink(number, text = '') {
  const digits = String(number).replace(/\D/g, '');
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function mailtoLink(email, subject = '') {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${query}`;
}

export function telLink(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

/**
 * Cal.com booking URL with the visitor's name and email pre-filled (Cal.com
 * reads the `name` and `email` query params), plus `embed=true` for the iframe.
 */
export function calcomBookingUrl(calcomUrl, { name, email } = {}, { embed = false } = {}) {
  const url = new URL(calcomUrl);
  if (name) url.searchParams.set('name', name);
  if (email) url.searchParams.set('email', email);
  if (embed) url.searchParams.set('embed', 'true');
  return url.toString();
}
