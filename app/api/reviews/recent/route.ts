import { NextRequest } from 'next/server';
import { publicApiJson, uncachedApiJson } from '@/lib/cacheHeaders';
import {
  getPublicReviewsPage,
  MAX_PUBLIC_REVIEW_LIMIT,
  MAX_PUBLIC_REVIEW_OFFSET,
  MAX_PUBLIC_REVIEW_SEARCH_LENGTH,
} from '@/lib/supabase/publicReviews';

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

// GET /api/reviews/recent?limit=20&offset=0&search=keyword
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInteger(searchParams.get('limit'), 20);
  const offset = parseInteger(searchParams.get('offset'), 0);
  const search = searchParams.get('search')?.trim() || '';

  if (
    limit === null ||
    limit < 1 ||
    limit > MAX_PUBLIC_REVIEW_LIMIT ||
    offset === null ||
    offset < 0 ||
    offset > MAX_PUBLIC_REVIEW_OFFSET
  ) {
    return uncachedApiJson({ error: 'Invalid pagination parameters' }, { status: 400 });
  }
  if (
    search &&
    (search.length < 2 || search.length > MAX_PUBLIC_REVIEW_SEARCH_LENGTH)
  ) {
    return uncachedApiJson(
      { error: 'Search must be between 2 and 100 characters' },
      { status: 400 }
    );
  }

  try {
    const reviewPage = await getPublicReviewsPage({
      search: search || undefined,
      limit,
      offset,
    });

    return publicApiJson({
      reviews: reviewPage.reviews,
      pagination: {
        offset,
        limit,
        hasMore: reviewPage.hasMore,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/reviews/recent:', error);
    return uncachedApiJson({ error: 'Failed to fetch reviews' }, { status: 503 });
  }
}
