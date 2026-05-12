import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('schedule content future semester probing', () => {
  const source = readFileSync(join(process.cwd(), 'app/schedule/_components/ScheduleContent.tsx'), 'utf8');

  it('uses the shared semester options helper when future terms are discovered', () => {
    expect(source).toContain('setSemesters(getScheduleSemesterOptions(pastSemesters, available));');
  });

  it('does not change the active semester from the future-term probe', () => {
    const probeEffect = source.match(/async function probeFutureSemesters\(\) \{[\s\S]*?\n    \}\n\n    probeFutureSemesters\(\);/);

    expect(probeEffect?.[0]).toBeDefined();
    expect(probeEffect?.[0]).not.toContain('setActiveSemester');
  });
});
