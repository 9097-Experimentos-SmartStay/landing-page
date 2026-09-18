/**
 * US-27 — Demo request: normalisation and client-side validation.
 *
 * Pure functions (no DOM) used by the form. The rules
 * mirror the API contract; the backend validates again and its ProblemDetails
 * errors are mapped back onto the same field names.
 */
import { ACCOMMODATION_TYPES, PROFILES, REFERRAL_SOURCES, ROOMS_RANGES } from '../../domain.js';

export const DEMO_REQUEST_FIELDS = Object.freeze([
  'firstName',
  'lastName',
  'hotelName',
  'jobTitle',
  'email',
  'accommodationType',
  'roomsRange',
  'referralSource',
  'phone',
  'message',
]);

export const LIMITS = Object.freeze({
  name: { min: 2, max: 50 },
  hotelName: { min: 2, max: 100 },
  jobTitle: { min: 2, max: 60 },
  email: { max: 254 },
  message: { max: 500 },
  phoneDigits: { min: 7, max: 15 },
});

// Letters (any script, accents included) separated by single spaces, hyphens or apostrophes.
const PERSON_NAME = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;
// Pragmatic email check: something@domain.tld, no spaces. The API has the final word.
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const PHONE = /^\+?\d{7,15}$/;

const collapseSpaces = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

/** Trims/normalises raw form values. Returns strings for every field. */
export function normalizeDemoRequest(raw) {
  return {
    firstName: collapseSpaces(raw.firstName),
    lastName: collapseSpaces(raw.lastName),
    hotelName: collapseSpaces(raw.hotelName),
    jobTitle: collapseSpaces(raw.jobTitle),
    email: String(raw.email ?? '').trim().toLowerCase(),
    accommodationType: String(raw.accommodationType ?? ''),
    roomsRange: String(raw.roomsRange ?? ''),
    referralSource: String(raw.referralSource ?? ''),
    // Keep "+" and digits only: "+51 987-654 321" -> "+51987654321".
    phone: String(raw.phone ?? '').trim().replace(/[\s().-]/g, ''),
    message: String(raw.message ?? '').trim(),
  };
}

const required = (value) => (value === '' ? { code: 'required' } : null);

const lengthBetween = (value, { min, max }) =>
  value.length < min || value.length > max ? { code: 'length', params: { min, max } } : null;

const oneOf = (value, options) => (options.includes(value) ? null : { code: 'select' });

function validatePersonName(value) {
  return (
    required(value) ??
    lengthBetween(value, LIMITS.name) ??
    (PERSON_NAME.test(value) ? null : { code: 'name_chars' })
  );
}

const RULES = {
  firstName: validatePersonName,
  lastName: validatePersonName,
  hotelName: (value) => required(value) ?? lengthBetween(value, LIMITS.hotelName),
  jobTitle: (value) => required(value) ?? lengthBetween(value, LIMITS.jobTitle),
  email: (value) =>
    required(value) ??
    (value.length > LIMITS.email.max ? { code: 'max', params: { max: LIMITS.email.max } } : null) ??
    (EMAIL.test(value) ? null : { code: 'email' }),
  accommodationType: (value) => oneOf(value, ACCOMMODATION_TYPES),
  roomsRange: (value) => oneOf(value, ROOMS_RANGES),
  referralSource: (value) => oneOf(value, REFERRAL_SOURCES),
  phone: (value) => (value === '' || PHONE.test(value) ? null : { code: 'phone' }),
  message: (value) =>
    value.length > LIMITS.message.max ? { code: 'max', params: { max: LIMITS.message.max } } : null,
};

/**
 * Validates a single normalised field.
 * @returns {{ code: string, params?: Record<string, number> } | null}
 */
export function validateField(field, normalizedValues) {
  const rule = RULES[field];
  return rule ? rule(normalizedValues[field] ?? '') : null;
}

/** Validates every field. `errors` only contains the invalid fields. */
export function validateDemoRequest(normalizedValues) {
  const errors = {};
  for (const field of DEMO_REQUEST_FIELDS) {
    const error = validateField(field, normalizedValues);
    if (error) errors[field] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Builds the request body exactly as the API contract defines it: optional
 * fields are omitted when empty instead of being sent as "".
 */
export function toDemoRequestPayload(normalizedValues, profile) {
  const payload = {
    firstName: normalizedValues.firstName,
    lastName: normalizedValues.lastName,
    hotelName: normalizedValues.hotelName,
    jobTitle: normalizedValues.jobTitle,
    email: normalizedValues.email,
    accommodationType: normalizedValues.accommodationType,
    roomsRange: normalizedValues.roomsRange,
    referralSource: normalizedValues.referralSource,
    profile: PROFILES.includes(profile) ? profile : 'admin',
  };
  if (normalizedValues.phone) payload.phone = normalizedValues.phone;
  if (normalizedValues.message) payload.message = normalizedValues.message;
  return payload;
}
