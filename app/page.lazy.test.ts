import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('home page course table loading boundary', () => {
  const source = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');

  it('uses the lazy courses table wrapper', () => {
    expect(source).toContain("import LazyCoursesTable from './_components/LazyCoursesTable';");
    expect(source).toContain('<LazyCoursesTable allCourseData={coursesData} />');
    expect(source).not.toContain("import CoursesTable from './_components/CoursesTable';");
  });
});
