import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('schedule page content loading boundary', () => {
  const source = readFileSync(join(process.cwd(), 'app/schedule/page.tsx'), 'utf8');

  it('uses the lazy schedule content wrapper', () => {
    expect(source).toContain("import LazyScheduleContent from './_components/LazyScheduleContent';");
    expect(source).toContain('<LazyScheduleContent />');
    expect(source).not.toContain("import ScheduleContent from './_components/ScheduleContent';");
  });
});
