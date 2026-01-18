import type { TPayloadCoursesDataStatic, TPayloadCoursesDataDynamic } from '@/lib/types';

const DATA_REPO_BASE =
  'https://raw.githubusercontent.com/omshub/data/main/static';

async function fetchStaticData<T>(filename: string): Promise<T> {
  const url = `${DATA_REPO_BASE}/${filename}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${filename}: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch static course data (names, aliases, etc.) from data repo
 */
export async function getCoursesDataStatic(): Promise<TPayloadCoursesDataStatic> {
  return fetchStaticData<TPayloadCoursesDataStatic>('courses.json');
}

/**
 * Fetch dynamic course stats (avgWorkload, avgDifficulty, etc.) from data repo
 */
export async function getCourseStats(): Promise<TPayloadCoursesDataDynamic> {
  try {
    return await fetchStaticData<TPayloadCoursesDataDynamic>('course-stats.json');
  } catch (error) {
    // Return empty object if stats file doesn't exist yet
    console.warn('Could not fetch course stats:', error);
    return {} as TPayloadCoursesDataDynamic;
  }
}

export interface GlobalStats {
  hoursSuffered: number;
  semesterWeeks: {
    spring: number;
    fall: number;
    summer: number;
  };
}

/**
 * Fetch global stats (hoursSuffered, semester weeks) from data repo
 */
export async function getGlobalStats(): Promise<GlobalStats | null> {
  try {
    return await fetchStaticData<GlobalStats>('global-stats.json');
  } catch (error) {
    console.warn('Could not fetch global stats:', error);
    return null;
  }
}
