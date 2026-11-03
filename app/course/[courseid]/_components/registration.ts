import {
  getFutureCandidates,
  getPastSemesters,
  getTermLabel,
} from '../../../schedule/_lib/semesters';

const DATA_BASE = 'https://raw.githubusercontent.com/omshub/data/main/data';

export interface RegistrationSection {
  crn: string;
  sectionNumber: string;
  enrolled: number;
  capacity: number;
  seatsAvailable: number;
  waitCount?: number;
}

export interface RegistrationSnapshot {
  term: string;
  lastUpdated: string;
  courses: Record<
    string,
    { courseId: string; sections: RegistrationSection[] }
  >;
}

export async function fetchRegistrationSnapshot(
  term: string,
  signal: AbortSignal,
): Promise<RegistrationSnapshot | null> {
  const response = await fetch(`${DATA_BASE}/${term}.json`, {
    cache: 'no-store',
    signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load registration data');
  const data = await response.json();
  if (
    data?.term !== term ||
    typeof data.courses !== 'object' ||
    !data.courses ||
    Array.isArray(data.courses)
  ) {
    throw new Error('Invalid registration data');
  }
  return data;
}

export function getCourseRegistrationSections(
  snapshot: RegistrationSnapshot,
  courseId: string,
): RegistrationSection[] {
  // Special topics have their own complete key, e.g. CS-8803-O08. Never match a prefix or alias.
  const entry = snapshot.courses[courseId];
  if (!entry) return [];
  if (
    entry.courseId !== courseId ||
    !Array.isArray(entry.sections) ||
    entry.sections.some(
      (section) =>
        !/^\d{5}$/.test(section.crn) ||
        typeof section.sectionNumber !== 'string' ||
        !section.sectionNumber ||
        ![section.enrolled, section.capacity, section.seatsAvailable].every(
          Number.isFinite,
        ),
    )
  )
    throw new Error('Invalid course registration data');
  return entry.sections;
}

export async function discoverRegistration(
  signal: AbortSignal,
  now = new Date(),
) {
  // Match the schedule's three-term publication horizon, including terms not yet in progress.
  const candidates = [
    ...getFutureCandidates(3, now).reverse(),
    ...getPastSemesters(now).map(({ value }) => value),
  ];
  for (let index = 0; index < candidates.length; index++) {
    const snapshot = await fetchRegistrationSnapshot(candidates[index], signal);
    if (snapshot)
      return {
        snapshot,
        terms: candidates
          .slice(index)
          .map((value) => ({ value, label: getTermLabel(value) })),
      };
  }
  throw new Error('No published registration data');
}
