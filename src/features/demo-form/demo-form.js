/**
 * US-27 — Demo request form.
 *
 * Flow: validate (on blur and on submit) -> POST /demo-requests -> on 201 the
 * form is replaced by a success state and, after a short progress bar, the
 * Cal.com calendar pre-filled with the visitor's name and email. Server
 * validation errors (400 ProblemDetails) are shown on their fields; network or
 * 5xx failures keep the values and offer retry plus direct contact channels.
 */
import { config } from '../../config.js';
import { t, getLanguage, onLanguageChange } from '../../i18n/index.js';
import { getProfile } from '../profile.js';
import { calcomBookingUrl } from '../contact/contact-links.js';
import { contactChannels } from '../contact/contact.js';
import { submitDemoRequest, DemoRequestError, FAILURE } from './api.js';
import { onDemoPrefill, requestDemoPrefill } from './demo-prefill.js';
import {
  DEMO_REQUEST_FIELDS,
  LIMITS,
  normalizeDemoRequest,
  toDemoRequestPayload,
  validateDemoRequest,
  validateField,
} from './validation.js';

const REDIRECT_DELAY_MS = 1600;

/** @typedef {{ code: string, params?: object } | { serverMessages: string[] }} FieldError */

export function initDemoForm() {
  const form = document.querySelector('[data-demo-form]');
  if (!form) return;

  const successPanel = document.querySelector('[data-demo-success]');
  const alertBox = form.querySelector('[data-demo-alert]');
  const submitButton = form.querySelector('[data-demo-submit]');
  const spinner = form.querySelector('[data-demo-spinner]');
  const submitLabel = form.querySelector('[data-demo-submit-label]');
  const counter = form.querySelector('[data-message-counter]');
  const controls = Object.fromEntries(DEMO_REQUEST_FIELDS.map((field) => [field, form.elements.namedItem(field)]));

  /** @type {Map<string, FieldError>} */
  const errors = new Map();
  const touched = new Set();
  let submitting = false;
  let alertState = null; // { kind, messages? }
  let success = null; // { firstName, lastName, email, id }

  const readValues = () =>
    normalizeDemoRequest(Object.fromEntries(DEMO_REQUEST_FIELDS.map((field) => [field, controls[field].value])));

  const errorMessage = (error) =>
    'serverMessages' in error ? error.serverMessages.join(' ') : t(`form_error_${error.code}`, error.params);

  function renderFieldError(field) {
    const control = controls[field];
    const errorElement = form.querySelector(`[data-error-for="${field}"]`);
    const error = errors.get(field);
    const describedBy = [error ? errorElement.id : null, field === 'message' ? counter.id : null].filter(Boolean);

    errorElement.hidden = !error;
    errorElement.textContent = error ? errorMessage(error) : '';
    if (error) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
    else control.removeAttribute('aria-describedby');
  }

  function setFieldError(field, error) {
    if (error) errors.set(field, error);
    else errors.delete(field);
    renderFieldError(field);
  }

  function validateOne(field) {
    setFieldError(field, validateField(field, readValues()));
  }

  function focusFirstInvalid() {
    const first = DEMO_REQUEST_FIELDS.find((field) => errors.has(field));
    controls[first]?.focus();
  }

  function renderCounter() {
    counter.textContent = `${controls.message.value.length}/${LIMITS.message.max}`;
  }

  function renderAlert() {
    alertBox.hidden = !alertState;
    alertBox.replaceChildren();
    if (!alertState) return;

    const isValidation = alertState.kind === FAILURE.VALIDATION;
    alertBox.className = `mt-4 rounded-lg p-3 text-sm ${isValidation ? 'bg-amber-50 text-amber-900' : 'bg-red-50 text-red-800'}`;

    const text = document.createElement('p');
    text.textContent = isValidation
      ? [t('demo_error_validation'), ...(alertState.messages ?? [])].join(' ')
      : t(alertState.kind === FAILURE.RATE_LIMITED ? 'demo_error_rate_limited' : 'demo_error_unavailable');
    alertBox.append(text);

    if (!isValidation) {
      // Offer the direct channels so the lead is not lost while the API is down.
      const channels = contactChannels();
      const links = document.createElement('p');
      links.className = 'mt-2 flex flex-wrap gap-x-4 gap-y-1 font-semibold';
      for (const [name, channel] of Object.entries({ whatsapp: channels.whatsapp, email: channels.email })) {
        const link = document.createElement('a');
        link.href = channel.href;
        link.className = 'underline';
        link.dataset.alertContact = name;
        link.textContent = name === 'whatsapp' ? t('demo_error_contact_whatsapp') : channel.label;
        if (name === 'whatsapp') {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        links.append(link);
      }
      alertBox.append(links);
    }
  }

  function setSubmitting(value) {
    submitting = value;
    submitButton.disabled = value;
    submitButton.setAttribute('aria-busy', String(value));
    spinner.classList.toggle('hidden', !value);
    submitLabel.textContent = t(value ? 'demo_submitting' : 'demo_submit');
  }

  function renderSuccess() {
    if (!success) return;
    successPanel.querySelector('[data-demo-success-title]').textContent = t('demo_success_title', {
      firstName: success.firstName,
    });
    successPanel.querySelector('[data-demo-success-detail]').textContent = t('demo_success_detail', {
      email: success.email,
    });
    const reference = successPanel.querySelector('[data-demo-success-reference]');
    reference.hidden = !success.id;
    reference.textContent = success.id ? t('demo_success_reference', { id: success.id }) : '';
  }

  function showScheduling() {
    const prefill = { name: `${success.firstName} ${success.lastName}`, email: success.email };
    successPanel.querySelector('[data-demo-redirecting]').hidden = true;
    successPanel.querySelector('[data-demo-scheduling]').hidden = false;
    successPanel.querySelector('[data-cal-embed]').src = calcomBookingUrl(config.calcomUrl, prefill, { embed: true });
    successPanel.querySelector('[data-cal-link]').href = calcomBookingUrl(config.calcomUrl, prefill);
  }

  function showSuccess(values, response) {
    success = { firstName: values.firstName, lastName: values.lastName, email: values.email, id: response.id };
    form.hidden = true;
    successPanel.hidden = false;
    renderSuccess();
    successPanel.focus();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(showScheduling, reduceMotion ? 0 : REDIRECT_DELAY_MS);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return; // Prevents double submissions.

    const values = readValues();
    const { valid, errors: clientErrors } = validateDemoRequest(values);
    DEMO_REQUEST_FIELDS.forEach((field) => {
      touched.add(field);
      setFieldError(field, clientErrors[field] ?? null);
    });
    alertState = null;
    renderAlert();
    if (!valid) {
      focusFirstInvalid();
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitDemoRequest(toDemoRequestPayload(values, getProfile()), {
        baseUrl: config.apiBaseUrl,
        knownFields: DEMO_REQUEST_FIELDS,
        language: getLanguage(),
      });
      showSuccess(values, response);
    } catch (error) {
      if (!(error instanceof DemoRequestError)) throw error;
      if (error.kind === FAILURE.VALIDATION) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          setFieldError(field, { serverMessages: messages });
        }
        alertState = { kind: error.kind, messages: error.formErrors };
        renderAlert();
        focusFirstInvalid();
      } else {
        alertState = { kind: error.kind };
        renderAlert();
        alertBox.scrollIntoView({ block: 'nearest' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Validate a field when the visitor leaves it, and keep it live afterwards.
  for (const [field, control] of Object.entries(controls)) {
    control.addEventListener('blur', () => {
      touched.add(field);
      validateOne(field);
    });
    const liveEvent = control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(liveEvent, () => {
      if (touched.has(field) && errors.has(field)) validateOne(field);
    });
  }
  controls.message.addEventListener('input', renderCounter);
  form.addEventListener('submit', handleSubmit);

  // Pre-fill requests from success stories and solution packs.
  onDemoPrefill(({ accommodationType, message }) => {
    if (accommodationType) {
      controls.accommodationType.value = accommodationType;
      if (errors.has('accommodationType')) validateOne('accommodationType');
    }
    if (message) {
      controls.message.value = message.slice(0, LIMITS.message.max);
      renderCounter();
    }
    controls.firstName.focus({ preventScroll: true });
  });
  for (const trigger of document.querySelectorAll('[data-demo-prefill-type]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      requestDemoPrefill({ accommodationType: trigger.dataset.demoPrefillType });
    });
  }

  onLanguageChange(() => {
    DEMO_REQUEST_FIELDS.forEach(renderFieldError);
    renderAlert();
    renderSuccess();
    submitLabel.textContent = t(submitting ? 'demo_submitting' : 'demo_submit');
  });

  renderCounter();
}
