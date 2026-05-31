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

  it('persists sort settings in browser storage', () => {
    expect(source).toContain("import { useLocalStorage } from '@mantine/hooks';");
    expect(source).toContain(
      "const COURSES_TABLE_SETTINGS_STORAGE_KEY = 'omshub:courses-table:settings';"
    );
    expect(source).toContain('key: COURSES_TABLE_SETTINGS_STORAGE_KEY');
    expect(source).toContain('setTableSettings({ sortBy: field, reverseSortDirection: reversed })');
  });

  it('exposes a clear saved settings action', () => {
    expect(source).toContain('Clear saved table settings');
    expect(source).toContain(
      'const [tableSettings, setTableSettings, clearSavedTableSettings]'
    );
    expect(source).toContain('onClick={clearSavedTableSettings}');
  });

  it('does not prefetch every linked course row', () => {
    expect(source).toContain('prefetch={false}');
  });
});
