import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedClaims } from '@/lib/supabase/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { publicApiJson, uncachedApiJson } from '@/lib/cacheHeaders';
import { mapSupabaseReviewToReview } from '@/lib/supabase/mappers';
import {
  courseReviewsCacheTag,
  getPublicReviewsPage,
  MAX_PUBLIC_REVIEW_LIMIT,
  MAX_PUBLIC_REVIEW_OFFSET,
  MAX_PUBLIC_REVIEW_SEARCH_LENGTH,
  RECENT_REVIEWS_CACHE_TAG,
  type PublicReviewRow,
} from '@/lib/supabase/publicReviews';
import { TPayloadReviews } from '@/lib/types';

// Convert Supabase reviews array to TPayloadReviews object format
function mapSupabaseReviewsToPayload(
  reviews: PublicReviewRow[]
): TPayloadReviews {
  const payload: TPayloadReviews = {};
  reviews.forEach((review) => {
    payload[review.id] = mapSupabaseReviewToReview(review);
  });
  return payload;
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function invalidateReviewCaches(courseId: string) {
  revalidateTag(courseReviewsCacheTag(courseId), 'max');
  revalidateTag(RECENT_REVIEWS_CACHE_TAG, 'max');
  revalidatePath(`/course/${courseId}`);
  revalidatePath('/recents');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const year = searchParams.get('year');
  const semester = searchParams.get('semester');
  const search = searchParams.get('search')?.trim() || '';
  const limit = parseInteger(searchParams.get('limit'), 20);
  const offset = parseInteger(searchParams.get('offset'), 0);
  const paginated = searchParams.get('paginated') === 'true';

  if (!courseId || !/^[A-Za-z0-9-]{2,32}$/.test(courseId)) {
    return uncachedApiJson({ error: 'A valid courseId is required' }, { status: 400 });
  }
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
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 2000 || Number(year) > 2100)) {
    return uncachedApiJson({ error: 'Invalid year' }, { status: 400 });
  }
  if (semester && !['sp', 'sm', 'fa'].includes(semester)) {
    return uncachedApiJson({ error: 'Invalid semester' }, { status: 400 });
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
      courseId,
      year: year ? Number(year) : undefined,
      semester: semester || undefined,
      search: search || undefined,
      limit,
      offset: paginated ? offset : 0,
    });
    const reviews = mapSupabaseReviewsToPayload(reviewPage.reviews);

    // Return paginated response if requested
    if (paginated) {
      return publicApiJson({
        reviews,
        pagination: {
          offset,
          limit,
          hasMore: reviewPage.hasMore,
        },
      });
    }

    // Return legacy format for backwards compatibility
    return publicApiJson(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return uncachedApiJson({ error: 'Failed to fetch reviews' }, { status: 503 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const auth = await getAuthenticatedClaims(supabase);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's email for GT verification
    const isGTVerified = auth.email?.endsWith('@gatech.edu') || false;

    // Create the review
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        id: body.reviewId,
        course_id: body.courseId,
        reviewer_id: auth.userId,
        year: body.year,
        semester: body.semesterId,
        body: body.body,
        workload: body.workload,
        difficulty: body.difficulty,
        overall: body.overall,
        is_legacy: false,
        is_gt_verified: isGTVerified,
        upvotes: 0,
        downvotes: 0,
      });

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    invalidateReviewCaches(body.courseId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
