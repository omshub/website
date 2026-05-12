import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ScheduleContent', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/schedule/_components/ScheduleContent.tsx'),
    'utf8'
  );

  it('keeps table headers sticky while scrolling the schedule list', () => {
    expect(source).toContain('stickyHeader');
    expect(source).toContain('stickyHeaderOffset={72}');
  });
});
