/**
 * US-27 — Builders for the email channel and the scheduling link.
 * Pure functions with no DOM access. Phone and WhatsApp are shown as plain
 * text on purpose (no tel:/wa.me links), so they have no builder.
 */

export function mailtoLink(email, subject = '') {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${query}`;
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
