import type React from 'react';
import { GT_COLORS } from '@/lib/theme';

export const sharedTableHeaderBackground = GT_COLORS.navy;
export const sharedTableHeaderBorderColor = GT_COLORS.techGold;
export const sharedTableBorderColor = 'var(--mantine-color-default-border)';
export const sharedTableHeaderHeight = 72;

export function getSharedTablePaperProps() {
  return {
    radius: 'lg' as const,
    withBorder: true,
    style: {
      overflow: 'hidden',
    },
  };
}

export function getSharedTableHeaderCellStyle(
  textAlign?: React.CSSProperties['textAlign'],
  overrides: React.CSSProperties = {}
): React.CSSProperties {
  return {
    backgroundColor: sharedTableHeaderBackground,
    borderRadius: 0,
    color: 'white',
    height: sharedTableHeaderHeight,
    padding: 'var(--mantine-spacing-sm)',
    textAlign,
    ...overrides,
  };
}
