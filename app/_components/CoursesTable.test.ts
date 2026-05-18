import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CoursesTable', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/_components/CoursesTable.tsx'),
    'utf8'
  );

  it('renders course tables without a sticky header offset gap', () => {
    expect(source).not.toContain('stickyHeader');
    expect(source).not.toContain('stickyHeaderOffset');
    expect(source).toContain('type="native"');
  });

  it('uses the schedule table visual treatment for the home page table', () => {
    expect(source).toContain("from './tableStyles'");
    expect(source).not.toContain('const tableHeaderBackground = GT_COLORS.navy');
    expect(source).not.toContain('const tableHeaderBorderColor = GT_COLORS.techGold');
    expect(source).not.toContain("const tableBorderColor = 'var(--mantine-color-default-border)'");
    expect(source).not.toContain('const tableHeaderHeight = 72');
    expect(source).toContain('getHomeTablePaperProps');
    expect(source).toContain('getHomeHeaderCellStyle');
  });
});
