/**
 * US-26 — Success stories UI: filter by hotel type, expandable details with
 * metrics, video testimonial slot and "request more information" hand-off to
 * the demo form.
 */
import { config } from '../../config.js';
import { t, getLanguage, onLanguageChange } from '../../i18n/index.js';
import { requestDemoPrefill } from '../demo-form/demo-prefill.js';
import { STORIES, HOTEL_TYPES, filterStories, storyContent } from './stories.js';

const state = {
  filter: 'all',
  expanded: new Set(),
};

const setText = (root, selector, text) => {
  const element = root.querySelector(selector);
  if (element) element.textContent = text;
};

function renderCard(template, story) {
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector('[data-story-card]');
  const content = storyContent(story, getLanguage());
  const detailsId = `story-details-${story.id}`;
  const expanded = state.expanded.has(story.id);

  item.dataset.storyId = story.id;
  item.dataset.hotelType = story.hotelType;

  setText(item, '[data-story-type]', t(`hotel_type_${story.hotelType}`));
  const badge = item.querySelector('[data-story-illustrative]');
  badge.hidden = !story.illustrative;
  badge.textContent = t('stories_badge_illustrative');

  setText(item, '[data-story-title]', content.title);
  setText(item, '[data-story-location]', content.location);
  setText(item, '[data-story-summary]', content.summary);
  setText(item, '[data-story-challenge-title]', t('stories_challenge'));
  setText(item, '[data-story-challenge]', content.challenge);
  setText(item, '[data-story-solution-title]', t('stories_solution'));
  setText(item, '[data-story-solution]', content.solution);
  setText(item, '[data-story-quote]', `“${content.quote}”`);
  setText(item, '[data-story-quote-author]', `— ${content.quoteAuthor}`);

  const metrics = {
    cost: [story.metrics.costReduction, t('stories_metric_cost')],
    satisfaction: [story.metrics.satisfaction, t('stories_metric_satisfaction')],
    time: [story.metrics.timeSaved, `${t('stories_metric_time')} ${content.timeSavedDetail}`],
  };
  for (const [name, [value, label]] of Object.entries(metrics)) {
    const metric = item.querySelector(`[data-metric="${name}"]`);
    setText(metric, '[data-metric-value]', value);
    setText(metric, '[data-metric-label]', label);
  }

  const details = item.querySelector('[data-story-details]');
  details.id = detailsId;
  details.hidden = !expanded;

  const toggle = item.querySelector('[data-story-toggle]');
  toggle.setAttribute('aria-controls', detailsId);
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.textContent = t(expanded ? 'stories_hide_details' : 'stories_show_details');

  const request = item.querySelector('[data-story-request]');
  request.textContent = t('stories_request_info');
  request.dataset.storyRequest = story.id;

  return fragment;
}

function render(section) {
  const list = section.querySelector('[data-stories-list]');
  const template = document.getElementById('story-card-template');
  const visible = filterStories(STORIES, state.filter);

  list.replaceChildren(...visible.map((story) => renderCard(template, story)));

  for (const button of section.querySelectorAll('[data-story-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.storyFilter === state.filter));
  }
  setText(section, '[data-stories-count]', t('stories_count', { count: visible.length }));
}

function toggleDetails(section, card) {
  const id = card.dataset.storyId;
  const toggle = card.querySelector('[data-story-toggle]');
  const details = card.querySelector('[data-story-details]');
  const expand = details.hidden;

  if (expand) state.expanded.add(id);
  else state.expanded.delete(id);

  details.hidden = !expand;
  toggle.setAttribute('aria-expanded', String(expand));
  toggle.textContent = t(expand ? 'stories_hide_details' : 'stories_show_details');
}

function requestInformation(storyId) {
  const story = STORIES.find((candidate) => candidate.id === storyId);
  if (!story) return;
  const content = storyContent(story, getLanguage());
  requestDemoPrefill({
    accommodationType: story.hotelType,
    message: t('stories_request_message', { title: content.title, location: content.location }),
  });
}

function initVideo(section) {
  const frame = section.querySelector('[data-testimonial-video-frame]');
  const placeholder = section.querySelector('[data-testimonial-video-placeholder]');
  if (!frame || !placeholder || !config.testimonialVideoUrl) return;
  frame.src = config.testimonialVideoUrl;
  frame.hidden = false;
  placeholder.hidden = true;
}

export function initSuccessStories() {
  const section = document.getElementById('success-stories');
  if (!section) return;

  section.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-story-filter]');
    if (filter) {
      const value = filter.dataset.storyFilter;
      state.filter = HOTEL_TYPES.includes(value) ? value : 'all';
      render(section);
      return;
    }
    const toggle = event.target.closest('[data-story-toggle]');
    if (toggle) {
      toggleDetails(section, toggle.closest('[data-story-card]'));
      return;
    }
    const request = event.target.closest('[data-story-request]');
    if (request) requestInformation(request.dataset.storyRequest);
  });

  initVideo(section);
  render(section);
  onLanguageChange(() => render(section));
}
