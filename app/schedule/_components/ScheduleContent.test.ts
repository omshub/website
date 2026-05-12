import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDisplayedScheduleSections, getGroupedScheduleSections } from './ScheduleContent';

describe('ScheduleContent', () => {
  const source = readFileSync(
    join(process.cwd(), 'app/schedule/_components/ScheduleContent.tsx'),
    'utf8'
  );

  it('renders schedule tables without a sticky header offset gap', () => {
    expect(source).not.toContain('stickyHeader');
    expect(source).not.toContain('stickyHeaderOffset');
    expect(source).not.toContain('Table.ScrollContainer');
    expect(source).not.toContain('aria-hidden="true" role="row"');
    expect(source).not.toContain('boxShadow');
    expect(source).not.toContain("var(--mantine-color-dark-7)");
    expect(source).toContain('const tableHeaderBackground = GT_COLORS.navy');
    expect(source).toContain('const tableHeaderBorderColor = GT_COLORS.techGold');
    expect(source).toContain("const tableBorderColor = 'var(--mantine-color-default-border)'");
    expect(source).toContain("overflowX: 'auto'");
    expect(source).toContain('getScheduleTablePaperProps');
    expect(source).toContain('getScheduleHeaderCellStyle');
  });

  it('excludes unrelated courses when a specialization filter is selected', () => {
    const sections = [
      { courseId: 'CS-6515', crn: '1' },
      { courseId: 'CS-6601', crn: '2' },
      { courseId: 'CS-6200', crn: '3' },
    ];

    const grouped = getGroupedScheduleSections(
      sections as never,
      { specializationId: 'cs:ai', name: 'Artificial Intelligence', programId: 'cs' },
      new Set(['CS-6515']),
      new Set(['CS-6601'])
    );

    expect(grouped.core).toEqual([sections[0]]);
    expect(grouped.electives).toEqual([sections[1]]);
    expect(grouped.freeElectives).toEqual([]);
  });

  it('counts only displayed specialization rows', () => {
    const grouped = {
      all: [],
      core: [{ courseId: 'CS-6515', crn: '1' }],
      electives: [{ courseId: 'CS-6601', crn: '2' }],
      freeElectives: [],
    };

    expect(getDisplayedScheduleSections(grouped as never)).toEqual([
      grouped.core[0],
      grouped.electives[0],
    ]);
  });
});
