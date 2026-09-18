/**
 * Single source of runtime configuration for the landing.
 *
 * Values come from build-time environment variables (VITE_*), injected by Vite
 * from `.env*` files or from the hosting provider (Vercel project settings).
 * Anything not provided falls back to an obvious placeholder so the page still
 * renders, and `placeholderKeys` lists what must be replaced before going live.
 */

/** Fallback values. They are intentionally fake: replace them via env vars. */
export const PLACEHOLDERS = Object.freeze({
  API_BASE_URL: 'http://localhost:5192/api/v1',
  WHATSAPP_NUMBER: '51900000000',
  SALES_EMAIL: 'ventas@smartstay.example',
  SALES_PHONE: '+51 900 000 000',
});

const DEFAULTS = Object.freeze({
  ...PLACEHOLDERS,
  // Real Cal.com event "Demo SmartStay" (30 min).
  CALCOM_URL: 'https://cal.com/piero-sulca-sanchez-rhh1nt/demo-smartstay',
  WEB_APP_URL: 'https://smartstay-3cffc.web.app',
  APP_DOWNLOAD_URL: '',
  TESTIMONIAL_VIDEO_URL: '',
  PRODUCT_VIDEO_URL: '',
});

// Keys that can never be blank (an empty env var falls back to the default).
const REQUIRED_KEYS = new Set([...Object.keys(PLACEHOLDERS), 'CALCOM_URL', 'WEB_APP_URL']);

const readString = (env, key) => {
  const value = env[`VITE_${key}`];
  return typeof value === 'string' ? value.trim() : undefined;
};

const withoutTrailingSlash = (url) => url.replace(/\/+$/, '');

/**
 * Builds the configuration object from an env map (e.g. `import.meta.env`).
 * Exported so it can be reused with any env map; the app uses the `config` singleton below.
 *
 * @param {Record<string, string | undefined>} env
 */
export function createConfig(env = {}) {
  const pick = (key) => {
    const value = readString(env, key);
    // Required keys fall back when empty; optional ones may be explicitly blank.
    if (value === undefined) return DEFAULTS[key];
    if (value === '' && REQUIRED_KEYS.has(key)) return DEFAULTS[key];
    return value;
  };

  const values = {
    apiBaseUrl: withoutTrailingSlash(pick('API_BASE_URL')),
    calcomUrl: withoutTrailingSlash(pick('CALCOM_URL')),
    whatsappNumber: pick('WHATSAPP_NUMBER').replace(/\D/g, ''),
    salesEmail: pick('SALES_EMAIL'),
    salesPhone: pick('SALES_PHONE'),
    webAppUrl: withoutTrailingSlash(pick('WEB_APP_URL')),
    appDownloadUrl: pick('APP_DOWNLOAD_URL'),
    testimonialVideoUrl: pick('TESTIMONIAL_VIDEO_URL'),
    productVideoUrl: pick('PRODUCT_VIDEO_URL'),
  };

  const placeholderKeys = Object.keys(PLACEHOLDERS).filter((key) => {
    const value = readString(env, key);
    return value === undefined || value === '';
  });

  return Object.freeze({ ...values, placeholderKeys: Object.freeze(placeholderKeys) });
}

export const config = createConfig(import.meta.env ?? {});
