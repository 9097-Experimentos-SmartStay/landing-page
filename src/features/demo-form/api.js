/**
 * US-27 — HTTP client for `POST ${API_BASE_URL}/demo-requests`.
 *
 * Contract: 201 `{ id, status: "Received", message }`; 400 ProblemDetails with
 * `errors` keyed by the camelCase field names; rate limited with 429.
 * `fetchImpl` is injectable so the client can be unit tested without a network.
 */

export const DEMO_REQUESTS_PATH = '/demo-requests';

// The API runs on a free tier that sleeps: the first request can take a while.
const DEFAULT_TIMEOUT_MS = 60_000;

/** Failure kinds the UI knows how to explain. */
export const FAILURE = Object.freeze({
  VALIDATION: 'validation',
  RATE_LIMITED: 'rate_limited',
  SERVER: 'server',
  NETWORK: 'network',
  TIMEOUT: 'timeout',
});

export class DemoRequestError extends Error {
  /**
   * @param {string} kind one of FAILURE
   * @param {{ status?: number, fieldErrors?: Record<string, string[]>, formErrors?: string[], cause?: unknown }} [details]
   */
  constructor(kind, details = {}) {
    super(`Demo request failed: ${kind}`, { cause: details.cause });
    this.name = 'DemoRequestError';
    this.kind = kind;
    this.status = details.status;
    this.fieldErrors = details.fieldErrors ?? {};
    this.formErrors = details.formErrors ?? [];
  }
}

/**
 * Maps ProblemDetails `errors` onto known form fields. Keys are matched
 * case-insensitively and tolerate ASP.NET styles such as "FirstName" or
 * "$.firstName"; anything unknown is returned as a form-level error.
 */
export function mapProblemDetailsErrors(errors, knownFields) {
  const fieldErrors = {};
  const formErrors = [];
  if (!errors || typeof errors !== 'object') return { fieldErrors, formErrors };

  const byLowerName = new Map(knownFields.map((field) => [field.toLowerCase(), field]));
  for (const [rawKey, rawMessages] of Object.entries(errors)) {
    const messages = (Array.isArray(rawMessages) ? rawMessages : [rawMessages]).map(String).filter(Boolean);
    const key = rawKey.replace(/^\$\.?/, '').split('.').pop().toLowerCase();
    const field = byLowerName.get(key);
    if (field) fieldErrors[field] = [...(fieldErrors[field] ?? []), ...messages];
    else formErrors.push(...messages);
  }
  return { fieldErrors, formErrors };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Sends the demo request.
 * @returns {Promise<{ id: string, status: string, message?: string }>}
 * @throws {DemoRequestError}
 */
export async function submitDemoRequest(payload, options) {
  const { baseUrl, knownFields = [], language, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(`${baseUrl}${DEMO_REQUESTS_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, application/problem+json',
        ...(language ? { 'Accept-Language': language } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    const kind = controller.signal.aborted ? FAILURE.TIMEOUT : FAILURE.NETWORK;
    throw new DemoRequestError(kind, { cause: error });
  } finally {
    clearTimeout(timer);
  }

  if (response.ok) {
    const body = (await readJson(response)) ?? {};
    return { id: body.id ?? '', status: body.status ?? 'Received', message: body.message };
  }

  if (response.status === 400 || response.status === 422) {
    const problem = await readJson(response);
    const { fieldErrors, formErrors } = mapProblemDetailsErrors(problem?.errors, knownFields);
    if (Object.keys(fieldErrors).length === 0 && formErrors.length === 0 && problem?.detail) {
      formErrors.push(String(problem.detail));
    }
    throw new DemoRequestError(FAILURE.VALIDATION, { status: response.status, fieldErrors, formErrors });
  }

  if (response.status === 429) {
    throw new DemoRequestError(FAILURE.RATE_LIMITED, { status: response.status });
  }

  throw new DemoRequestError(FAILURE.SERVER, { status: response.status });
}
