import type { TPayloadCoursesDataStatic } from '@/lib/types';

const DATA_REPO_BASE =
  'https://raw.githubusercontent.com/omshub/data/main/static';

async function fetchStaticData<T>(filename: string): Promise<T> {
  const url = `${DATA_REPO_BASE}/${filename}`;
  const res = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 1 day
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

export async function getCoursesDataStatic(): Promise<TPayloadCoursesDataStatic> {
  return fetchStaticData<TPayloadCoursesDataStatic>('courses.json');
}
