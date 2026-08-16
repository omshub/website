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

export interface RegistrationPhase {
  availability?: string;
  tickets?: string;
  ticketsAt?: string;
  start?: string;
  end?: string;
  endAt?: string;
}

export interface RegistrationTerm {
  term?: string;
  availability?: string;
  phase1?: RegistrationPhase;
  continuingOmscs?: RegistrationPhase;
  phase2?: RegistrationPhase;
}

export type RegistrationMilestoneKind = 'availability' | 'tickets' | 'registration-start' | 'registration-end';
export type RegistrationMilestoneState = 'completed' | 'current' | 'upcoming';

export interface RegistrationMilestone {
  term: string;
  kind: RegistrationMilestoneKind;
  label: string;
  date: string;
  timestamp?: string;
  state: RegistrationMilestoneState;
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

function isExplicitOffsetTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function calendarDayDifference(date: string, now: Date): number {
  const [year, month, day] = date.split('-').map(Number);
  const today = localCalendarDate(now).split('-').map(Number);
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(today[0], today[1] - 1, today[2])) / 86_400_000);
}

function getMilestoneState(
  kind: RegistrationMilestoneKind,
  date: string,
  timestamp: string | undefined,
  phase2: RegistrationPhase | undefined,
  now: Date
): RegistrationMilestoneState {
  const isPast = timestamp
    ? Date.parse(timestamp) < now.getTime()
    : calendarDayDifference(date, now) < 0;
  if (isPast) return 'completed';

  if (kind === 'registration-start' || kind === 'registration-end') {
    const today = localCalendarDate(now);
    if (isDateOnly(phase2?.start) && isDateOnly(phase2?.end) && phase2.start <= today && today <= phase2.end) {
      return 'current';
    }
  }
  return 'upcoming';
}

export function formatRegistrationCountdown(milestone: RegistrationMilestone, now = new Date()): string {
  if (milestone.timestamp && isExplicitOffsetTimestamp(milestone.timestamp)) {
    const minutes = Math.ceil((Date.parse(milestone.timestamp) - now.getTime()) / 60_000);
    if (minutes <= 0) return 'completed';
    const days = Math.floor(minutes / 1_440);
    const hours = Math.floor((minutes % 1_440) / 60);
    const remainderMinutes = minutes % 60;
    const parts = [days && `${days}d`, hours && `${hours}h`, remainderMinutes && `${remainderMinutes}m`].filter(Boolean);
    return `in ${parts.join(' ')}`;
  }

  const days = calendarDayDifference(milestone.date, now);
  if (days < 0) return 'completed';
  if (days === 0) return 'today';
  return `in ${days} day${days === 1 ? '' : 's'}`;
}

export function getUpcomingRegistrationTimeline(calendar: unknown, now = new Date()): RegistrationMilestone[] {
  if (!isCompatibleRegistrationCalendar(calendar)) return [];
  const today = localCalendarDate(now);
  const eligibleTerms = calendar.terms!
    .filter(isRegistrationTerm)
    .filter((term) => typeof term.term === 'string' && /^\d{6}$/.test(term.term))
    .filter((term) => {
      const endTimestamp = isExplicitOffsetTimestamp(term.phase2?.endAt) ? term.phase2.endAt : undefined;
      if (endTimestamp) return Date.parse(endTimestamp) >= now.getTime();
      return !isDateOnly(term.phase2?.end) || term.phase2.end >= today;
    })
    .sort((a, b) => (a.term as string).localeCompare(b.term as string))
    .slice(0, 3);

  return eligibleTerms.flatMap((term) => {
    const phase2 = term.phase2;
    const candidates: Array<Omit<RegistrationMilestone, 'state'>> = [
      isDateOnly(term.availability) ? { term: term.term!, kind: 'availability', label: 'Schedule available', date: term.availability } : null,
      isDateOnly(phase2?.tickets) ? {
        term: term.term!, kind: 'tickets', label: 'Phase II tickets post', date: phase2.tickets,
        ...(isExplicitOffsetTimestamp(phase2.ticketsAt) ? { timestamp: phase2.ticketsAt } : {}),
      } : null,
      isDateOnly(phase2?.start) ? { term: term.term!, kind: 'registration-start', label: 'Phase II registration begins', date: phase2.start } : null,
      isDateOnly(phase2?.end) ? {
        term: term.term!, kind: 'registration-end', label: 'Published Phase II window ended', date: phase2.end,
        ...(isExplicitOffsetTimestamp(phase2.endAt) ? { timestamp: phase2.endAt } : {}),
      } : null,
    ].filter((candidate): candidate is Omit<RegistrationMilestone, 'state'> => candidate !== null);

    return candidates.map((candidate) => ({
      ...candidate,
      state: getMilestoneState(candidate.kind, candidate.date, candidate.timestamp, phase2, now),
    }));
  });
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

function isRegistrationTerm(term: unknown): term is RegistrationTerm {
  return typeof term === 'object' && term !== null;
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
    .filter(isRegistrationTerm)
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

  const term = calendar.terms!.filter(isRegistrationTerm).find((candidate) => candidate.term === activeTermCode);
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
