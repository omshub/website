import {
  getSharedTableHeaderCellStyle,
  getSharedTablePaperProps,
  sharedTableBorderColor,
  sharedTableHeaderBackground,
  sharedTableHeaderBorderColor,
  sharedTableHeaderHeight,
} from './tableStyles';
import { GT_COLORS } from '@/lib/theme';

describe('shared table styles', () => {
  it('keeps course and schedule tables on the same visual tokens', () => {
    expect(sharedTableHeaderBackground).toBe(GT_COLORS.navy);
    expect(sharedTableHeaderBorderColor).toBe(GT_COLORS.techGold);
    expect(sharedTableBorderColor).toBe('var(--mantine-color-default-border)');
    expect(sharedTableHeaderHeight).toBe(72);
  });

  it('provides the shared clipped table container treatment', () => {
    expect(getSharedTablePaperProps()).toEqual({
      radius: 'lg',
      withBorder: true,
      style: {
        overflow: 'hidden',
      },
    });
  });

  it('provides the shared header cell treatment with page-specific overrides', () => {
    expect(getSharedTableHeaderCellStyle('center', { zIndex: 2 })).toEqual({
      backgroundColor: GT_COLORS.navy,
      borderRadius: 0,
      color: 'white',
      height: 72,
      padding: 'var(--mantine-spacing-sm)',
      textAlign: 'center',
      zIndex: 2,
    });
  });
});
