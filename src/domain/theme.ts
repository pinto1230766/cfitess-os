export type AccentColorId = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'cyan';
export type ThemeMode = 'light' | 'dark';

export interface AccentColorOption {
  id: AccentColorId;
  label: string;
  shortLabel: string;
  hexPrimary: string;
  hexSecondary: string;
  hexLightBg: string;
  hexDarkText: string;
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  {
    id: 'violet',
    label: 'Violet C.Fitness',
    shortLabel: 'Violet',
    hexPrimary: '#7C3AED',
    hexSecondary: '#4F46E5',
    hexLightBg: '#F5F3FF',
    hexDarkText: '#C4B5FD',
  },
  {
    id: 'blue',
    label: 'Bleu Océan',
    shortLabel: 'Bleu',
    hexPrimary: '#2563EB',
    hexSecondary: '#0284C7',
    hexLightBg: '#EFF6FF',
    hexDarkText: '#93C5FD',
  },
  {
    id: 'emerald',
    label: 'Vert Émeraude',
    shortLabel: 'Émeraude',
    hexPrimary: '#059669',
    hexSecondary: '#0D9488',
    hexLightBg: '#ECFDF5',
    hexDarkText: '#6EE7B7',
  },
  {
    id: 'rose',
    label: 'Rose Énergie',
    shortLabel: 'Rose',
    hexPrimary: '#E11D48',
    hexSecondary: '#DB2777',
    hexLightBg: '#FFF1F2',
    hexDarkText: '#FDA4AF',
  },
  {
    id: 'amber',
    label: 'Ambre Solaire',
    shortLabel: 'Ambre',
    hexPrimary: '#D97706',
    hexSecondary: '#EA580C',
    hexLightBg: '#FFFBEB',
    hexDarkText: '#FCD34D',
  },
  {
    id: 'cyan',
    label: 'Cyan Polaire',
    shortLabel: 'Cyan',
    hexPrimary: '#0891B2',
    hexSecondary: '#2563EB',
    hexLightBg: '#ECFEFF',
    hexDarkText: '#67E8F9',
  },
];

export function isValidAccentColor(value: unknown): value is AccentColorId {
  return (
    typeof value === 'string' &&
    ACCENT_COLOR_OPTIONS.some((opt) => opt.id === value)
  );
}

export function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function getAccentColorOption(id: AccentColorId): AccentColorOption {
  return (
    ACCENT_COLOR_OPTIONS.find((opt) => opt.id === id) ?? ACCENT_COLOR_OPTIONS[0]
  );
}

export function getNextAccentColor(current: AccentColorId): AccentColorId {
  const idx = ACCENT_COLOR_OPTIONS.findIndex((opt) => opt.id === current);
  if (idx < 0) return ACCENT_COLOR_OPTIONS[0].id;
  return ACCENT_COLOR_OPTIONS[(idx + 1) % ACCENT_COLOR_OPTIONS.length].id;
}
