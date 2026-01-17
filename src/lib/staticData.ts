import type { TPayloadCoursesDataStatic, TPayloadCoursesDataDynamic } from '@/lib/types';

const DATA_REPO_BASE =
  'https://raw.githubusercontent.com/omshub/data/main/static';

async function fetchStaticData<T>(filename: string, revalidate = 86400): Promise<T> {
  const url = `${DATA_REPO_BASE}/${filename}`;
  const res = await fetch(url, {
    next: { revalidate }, // Cache duration in seconds
    cache: 'force-cache',
  } as RequestInit);
  if (!res.ok) {
    // Retry once without cache on failure
    const retryRes = await fetch(url, { cache: 'no-store' });
    if (!retryRes.ok) {
      throw new Error(`Failed to fetch ${filename}: ${retryRes.status}`);
    }
    return retryRes.json();
  }
  return res.json();
}

/**
 * Fetch static course data (names, aliases, etc.) from data repo
 * Cached for 1 day
 */
export async function getCoursesDataStatic(): Promise<TPayloadCoursesDataStatic> {
  return fetchStaticData<TPayloadCoursesDataStatic>('courses.json');
}

/**
 * Fetch dynamic course stats (avgWorkload, avgDifficulty, etc.) from data repo
 * Cached for 1 hour since stats are updated twice daily
 */
export async function getCourseStats(): Promise<TPayloadCoursesDataDynamic> {
  try {
    return await fetchStaticData<TPayloadCoursesDataDynamic>('course-stats.json', 3600);
  } catch (error) {
    // Return empty object if stats file doesn't exist yet
    console.warn('Could not fetch course stats:', error);
    return {} as TPayloadCoursesDataDynamic;
  }
}
