export type SemesterCode = 'sp' | 'sm' | 'fa';

export interface SemesterOption {
  value: string;
  label: string;
}

export function getTermCode(year: number, semester: SemesterCode): string {
  const semesterCodes = { sp: '02', sm: '05', fa: '08' };
  return `${year}${semesterCodes[semester]}`;
}

export function parseTermCode(termCode: string): { year: number; semester: string } {
  const year = parseInt(termCode.substring(0, 4));
  const semCode = termCode.substring(4);
  const semesterMap: Record<string, string> = { '02': 'Spring', '05': 'Summer', '08': 'Fall' };
  return { year, semester: semesterMap[semCode] || 'Unknown' };
}

export function getTermLabel(termCode: string): string {
  const { year, semester } = parseTermCode(termCode);
  return `${semester} ${year}`;
}

export function getCurrentSemester(now = new Date()): { year: number; semester: SemesterCode } {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 1 && month <= 4) {
    return { year, semester: 'sp' };
  }
  if (month >= 5 && month <= 7) {
    return { year, semester: 'sm' };
  }
  return { year, semester: 'fa' };
}

export function getPastSemesters(now = new Date()): SemesterOption[] {
  const { year: currentYear, semester: currentSem } = getCurrentSemester(now);
  const semesters: SemesterOption[] = [];
  const semesterOrder: SemesterCode[] = ['sp', 'sm', 'fa'];
  const startYear = 2014;

  let year = currentYear;
  let semIndex = semesterOrder.indexOf(currentSem);

  while (year >= startYear) {
    const sem = semesterOrder[semIndex];
    semesters.push({
      value: getTermCode(year, sem),
      label: getTermLabel(getTermCode(year, sem)),
    });

    semIndex--;
    if (semIndex < 0) {
      semIndex = 2;
      year--;
    }
  }

  return semesters;
}

export function getFutureCandidates(n: number, now = new Date()): string[] {
  const { year: currentYear, semester: currentSem } = getCurrentSemester(now);
  const semesterOrder: SemesterCode[] = ['sp', 'sm', 'fa'];
  const candidates: string[] = [];

  let year = currentYear;
  let semIndex = semesterOrder.indexOf(currentSem);

  for (let i = 0; i < n; i++) {
    semIndex++;
    if (semIndex >= semesterOrder.length) {
      semIndex = 0;
      year++;
    }
    candidates.push(getTermCode(year, semesterOrder[semIndex]));
  }

  return candidates;
}

export function getInitialActiveSemester(baseSemesters: SemesterOption[]): string {
  return baseSemesters[0]?.value || '';
}

export function getScheduleSemesterOptions(baseSemesters: SemesterOption[], availableFutureTermCodes: string[]): SemesterOption[] {
  const seen = new Set(baseSemesters.map((semester) => semester.value));
  const futureOptions = availableFutureTermCodes
    .filter((termCode, index, allTermCodes) => allTermCodes.indexOf(termCode) === index)
    .filter((termCode) => !seen.has(termCode))
    .map((termCode) => ({
      value: termCode,
      label: getTermLabel(termCode),
    }));

  return [...futureOptions, ...baseSemesters];
}
