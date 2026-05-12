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
});
