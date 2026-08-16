import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('schedule content future semester probing', () => {
  const source = readFileSync(join(process.cwd(), 'app/schedule/_components/ScheduleContent.tsx'), 'utf8');

  it('uses the shared semester options helper when future terms are discovered', () => {
    expect(source).toContain('setSemesters(getScheduleSemesterOptions(pastSemesters, available));');
  });

  it('only changes the active semester from the future-term probe before user selection', () => {
    const probeEffect = source.match(/async function probeFutureSemesters\(\) \{[\s\S]*?\n    \}\n\n    probeFutureSemesters\(\);/);

    expect(probeEffect?.[0]).toBeDefined();
    expect(probeEffect?.[0]).toMatch(
      /if \(!userSelectedSemesterRef\.current\) \{\s*setActiveSemester\(getRegistrationDefaultTerm\(available, calendar\)\);\s*\}/
    );
  });

  it('does not render the calendar-current semester before discovery finishes', () => {
    expect(source).toContain("const [activeSemester, setActiveSemester] = useState('');");
    expect(source).toContain('if (!activeSemester) return;');
    expect(source).toContain("isDiscoveringSemester ? 'Finding latest semester…' : undefined");
    expect(source).toContain('disabled={isDiscoveringSemester}');
  });

  it('falls back to the calendar-current semester when no future data exists', () => {
    expect(source).toMatch(
      /else \{\s*setLatestAvailableSemester\(initialActiveSemester\);\s*if \(!userSelectedSemesterRef\.current\) \{\s*setActiveSemester\(initialActiveSemester\);\s*\}/
    );
  });

  it('fetches the registration calendar once alongside future probes and renders an accessible active-phase label', () => {
    expect(source).toContain('fetch(REGISTRATION_WINDOWS_URL');
    expect(source).toContain('const registrationCalendarResponse = fetch(');
    expect(source).toContain('const registrationStatus = useMemo(');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('{registrationStatus.label}');
  });

  it('uses a preview artifact URL override and renders the timeline', () => {
    expect(source).toContain('NEXT_PUBLIC_REGISTRATION_WINDOWS_URL');
    expect(source).toContain('const REGISTRATION_WINDOWS_URL');
    expect(source).toContain('fetch(REGISTRATION_WINDOWS_URL');
    expect(source).toContain('<RegistrationTimeline calendar={registrationCalendar} />');
  });
});
