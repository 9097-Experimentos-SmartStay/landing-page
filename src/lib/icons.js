/**
 * Lucide icons, imported one by one so the bundle only ships what we use.
 * Add the PascalCase export here when a new `data-lucide="kebab-name"` appears
 * (the E2E suite fails on the console warning Lucide prints for unknown icons).
 */
import {
  createIcons,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  ConciergeBell,
  KeyRound,
  LayoutDashboard,
  Luggage,
  Menu,
  ShieldCheck,
  Smartphone,
  SmartphoneNfc,
  ThermometerSun,
  X,
  Zap,
} from 'lucide';

const icons = {
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  ConciergeBell,
  KeyRound,
  LayoutDashboard,
  Luggage,
  Menu,
  ShieldCheck,
  Smartphone,
  SmartphoneNfc,
  ThermometerSun,
  X,
  Zap,
};

/** Replaces `<i data-lucide>` placeholders (also inside <template>) with inline SVG. */
export function renderIcons(root = document) {
  createIcons({ icons, root, inTemplates: true, attrs: { 'aria-hidden': 'true' } });
}
