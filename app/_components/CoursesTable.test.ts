import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CoursesTable', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/_components/CoursesTable.tsx'),
    'utf8'
  );

  it('keeps table headers sticky while scrolling the course list', () => {
    expect(source).toContain('stickyHeader');
    expect(source).toContain('stickyHeaderOffset={72}');
  });
});
