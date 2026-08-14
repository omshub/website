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

interface RegistrationPhase {
  start?: string;
  end?: string;
}

interface RegistrationTerm {
  term?: string;
  phase1?: RegistrationPhase;
  continuingOmscs?: RegistrationPhase;
  phase2?: RegistrationPhase;
}

interface RegistrationCalendar {
  schemaVersion?: number;
  terms?: RegistrationTerm[];
}

export interface RegistrationStatus {
  label: string;
  accessibleLabel: string;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function localCalendarDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function isCompatibleRegistrationCalendar(calendar: unknown): calendar is RegistrationCalendar {
  return typeof calendar === 'object'
    && calendar !== null
    && (calendar as RegistrationCalendar).schemaVersion === 1
    && Array.isArray((calendar as RegistrationCalendar).terms);
}

function isWithinPhase(phase: RegistrationPhase | undefined, today: string): boolean {
  return Boolean(phase && isDateOnly(phase.start) && isDateOnly(phase.end) && phase.start <= today && today <= phase.end);
}

export function getRegistrationDefaultTerm(
  availableFutureTermCodes: string[],
  calendar: unknown,
  now = new Date()
): string {
  const fallback = getInitialActiveSemester(getPastSemesters(now));
  if (!isCompatibleRegistrationCalendar(calendar)) return fallback;

  const today = localCalendarDate(now);
  const availableTerms = new Set(availableFutureTermCodes);
  const eligible = calendar.terms!
    .filter((term) => availableTerms.has(term.term || '') && isDateOnly(term.phase1?.start) && term.phase1.start <= today)
    .map((term) => term.term as string)
    .sort((a, b) => b.localeCompare(a));

  return eligible[0] || fallback;
}

export function getRegistrationStatus(
  activeTermCode: string,
  calendar: unknown,
  now = new Date()
): RegistrationStatus | null {
  if (!isCompatibleRegistrationCalendar(calendar)) return null;

  const term = calendar.terms!.find((candidate) => candidate.term === activeTermCode);
  if (!term) return null;

  const today = localCalendarDate(now);
  const phases: Array<[RegistrationPhase | undefined, string]> = [
    [term.phase1, 'Phase I registration open'],
    [term.continuingOmscs, 'Continuing OMSCS registration open'],
    [term.phase2, 'Phase II registration open'],
  ];
  const activePhase = phases.find(([phase]) => isWithinPhase(phase, today));
  if (!activePhase) return null;

  return {
    label: activePhase[1],
    accessibleLabel: `Registration status: ${activePhase[1]}`,
  };
}
