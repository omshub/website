import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('courses table saved settings', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/_components/CoursesTable.tsx'),
    'utf8'
  );

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
});
