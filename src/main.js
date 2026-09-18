import { config } from './config.js';
import { initI18n } from './i18n/index.js';
import { renderIcons } from './lib/icons.js';
import { initNavigation } from './features/navigation.js';
import { initProfile } from './features/profile.js';
import { initSuccessStories } from './features/success-stories/success-stories.js';

if (config.placeholderKeys.length > 0) {
  console.info(
    `[SmartStay] Using placeholder config for: ${config.placeholderKeys.join(', ')}. ` +
      'Set the VITE_* variables (see .env.example) before deploying.',
  );
}

renderIcons();
initI18n();
initNavigation();
initProfile();
initSuccessStories();
