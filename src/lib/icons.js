/**
 * Lucide icons, imported one by one so the bundle only ships what we use.
 * Add the PascalCase export here when a new `data-lucide="kebab-name"` appears
 * (Lucide prints a console warning for unknown icons).
 */
import {
  createIcons,
  Building2,
  ChartNoAxesCombined,
  CircleCheck,
  ClipboardCheck,
  ConciergeBell,
  ExternalLink,
  Info,
  KeyRound,
  LayoutDashboard,
  Leaf,
  Luggage,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  SmartphoneNfc,
  Target,
  Telescope,
  ThermometerSun,
  Video,
  Zap,
} from 'lucide';

const icons = {
  Building2,
  ChartNoAxesCombined,
  CircleCheck,
  ClipboardCheck,
  ConciergeBell,
  ExternalLink,
  Info,
  KeyRound,
  LayoutDashboard,
  Leaf,
  Luggage,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  SmartphoneNfc,
  Target,
  Telescope,
  ThermometerSun,
  Video,
  Zap,
};

/** Replaces `<i data-lucide>` placeholders (also inside <template>) with inline SVG. */
export function renderIcons(root = document) {
  createIcons({ icons, root, inTemplates: true, attrs: { 'aria-hidden': 'true' } });
}
