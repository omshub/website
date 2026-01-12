/**
 * Georgia Tech Brand Colors
 * Reference: https://brand.gatech.edu/our-look/colors
 */
export const GT_COLORS = {
  // Primary
  navy: '#003057',
  techGold: '#B3A369',

  // Secondary
  buzzGold: '#EAAA00',
  olympicTeal: '#008C95',
  boldBlue: '#3A5DAE',
  newHorizon: '#E04F39',
  canopyLime: '#A4D233',
  grayMatter: '#54585A',
} as const;

/**
 * CSS variable names for automatic dark/light mode contrast
 * These reference --stat-color-* variables defined in globals.css
 */
export const CSS_STAT_COLORS = {
  gold: 'var(--stat-color-yellow)',
  teal: 'var(--stat-color-teal)',
  lime: 'var(--stat-color-green)',
  orange: 'var(--stat-color-red)',
} as const;
