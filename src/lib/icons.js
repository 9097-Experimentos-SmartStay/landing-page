/**
 * Lucide icons, imported one by one so the bundle only ships what we use.
 * Add the PascalCase export here when a new `data-lucide="kebab-name"` appears.
 */
import {
  createIcons,
  Menu,
  X,
  Building2,
  Smartphone,
  ChartNoAxesCombined,
  ShieldCheck,
} from 'lucide';

const icons = {
  Menu,
  X,
  Building2,
  Smartphone,
  ChartNoAxesCombined,
  ShieldCheck,
};

/** Replaces `<i data-lucide>` placeholders (also inside <template>) with inline SVG. */
export function renderIcons(root = document) {
  createIcons({ icons, root, inTemplates: true, attrs: { 'aria-hidden': 'true' } });
}
