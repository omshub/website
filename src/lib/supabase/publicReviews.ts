import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type ReviewRow = Database['public']['Tables']['reviews']['Row'];

export type PublicReviewRow = Pick<
  ReviewRow,
  | 'id'
  | 'course_id'
  | 'reviewer_id'
  | 'year'
  | 'semester'
  | 'body'
  | 'workload'
  | 'difficulty'
  | 'overall'
  | 'is_legacy'
  | 'is_gt_verified'
  | 'upvotes'
  | 'downvotes'
  | 'created_at'
  | 'modified_at'
>;

export const PUBLIC_REVIEW_COLUMNS = [
  'id',
  'course_id',
  'reviewer_id',
  'year',
  'semester',
  'body',
  'workload',
  'difficulty',
  'overall',
  'is_legacy',
  'is_gt_verified',
  'upvotes',
  'downvotes',
  'created_at',
  'modified_at',
].join(',');

export const PUBLIC_REVIEW_REVALIDATE_SECONDS = 21600;
export const RECENT_REVIEWS_CACHE_TAG = 'reviews:recent';
export const MAX_PUBLIC_REVIEW_LIMIT = 50;
export const MAX_PUBLIC_REVIEW_OFFSET = 5000;
export const MAX_PUBLIC_REVIEW_SEARCH_LENGTH = 100;
const RESTRICTION_BACKOFF_MS = 5 * 60 * 1000;

let restrictedUntil = 0;

export function courseReviewsCacheTag(courseId: string) {
  return `reviews:course:${courseId.trim().toUpperCase()}`;
}

export function normalizePublicReviewSearch(search?: string) {
  return search?.trim().replace(/\s+/g, ' ').toLowerCase() || undefined;
}

export interface PublicReviewFilters {
  courseId?: string;
  year?: number;
  semester?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PublicReviewPage {
  reviews: PublicReviewRow[];
  hasMore: boolean;
}

export const EMPTY_PUBLIC_REVIEW_PAGE: PublicReviewPage = {
  reviews: [],
  hasMore: false,
};

export function toPublicReviewPage(
  rows: PublicReviewRow[],
  limit: number
): PublicReviewPage {
  return {
    reviews: rows.slice(0, limit),
    hasMore: rows.length > limit,
  };
}

function createPublicReadClient(tags: string[]) {
  const cachedFetch: typeof fetch = async (input, init) => {
    if (Date.now() < restrictedUntil) {
      throw new Error('Supabase public reads are temporarily restricted');
    }

    const response = await fetch(input, {
      ...init,
      next: {
        revalidate: PUBLIC_REVIEW_REVALIDATE_SECONDS,
        tags,
      },
    } as RequestInit & {
      next: { revalidate: number; tags: string[] };
    });

    if (response.status === 402) {
      restrictedUntil = Date.now() + RESTRICTION_BACKOFF_MS;
    }

    return response;
  };

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: { fetch: cachedFetch },
    }
  );
}

export async function getPublicReviewsPage({
  courseId,
  year,
  semester,
  search,
  limit = 20,
  offset = 0,
}: PublicReviewFilters = {}): Promise<PublicReviewPage> {
  const safeLimit = Math.min(Math.max(limit, 1), MAX_PUBLIC_REVIEW_LIMIT);
  const safeOffset = Math.min(Math.max(offset, 0), MAX_PUBLIC_REVIEW_OFFSET);
  const normalizedCourseId = courseId?.trim().toUpperCase() || undefined;
  const normalizedSemester = semester?.trim().toLowerCase() || undefined;
  const normalizedSearch = normalizePublicReviewSearch(search);
  const tags = normalizedCourseId
    ? [courseReviewsCacheTag(normalizedCourseId)]
    : [RECENT_REVIEWS_CACHE_TAG];
  const supabase = createPublicReadClient(tags);

  let query = supabase
    .from('reviews')
    .select(PUBLIC_REVIEW_COLUMNS)
    .order('created_at', { ascending: false });

  if (normalizedCourseId) query = query.eq('course_id', normalizedCourseId);
  if (year) query = query.eq('year', year);
  if (normalizedSemester) query = query.eq('semester', normalizedSemester);
  if (normalizedSearch) query = query.ilike('body', `%${normalizedSearch}%`);

  // Request one extra row to determine hasMore without an exact COUNT query.
  const { data, error } = await query.range(
    safeOffset,
    safeOffset + safeLimit
  );

  if (error) {
    throw new Error(`Failed to fetch public reviews: ${error.message}`);
  }

  return toPublicReviewPage(
    (data ?? []) as unknown as PublicReviewRow[],
    safeLimit
  );
}
