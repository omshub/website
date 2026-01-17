import { createClient } from '@/lib/supabase/server';
import { getCoursesDataStatic } from '@/lib/staticData';
import { Review, TCourseId } from '@/lib/types';
import RecentsContent from './_components/RecentsContent';
import type { Database } from '@/lib/supabase/database.types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

const PAGE_SIZE = 20;

// Convert Supabase reviews to Review format
function mapSupabaseReviewsToReviews(reviews: SupabaseReview[]): Review[] {
  return reviews.map((review) => ({
    reviewId: review.id,
    courseId: review.course_id as TCourseId,
    year: review.year,
    semesterId: review.semester as 'sp' | 'sm' | 'fa',
    isLegacy: review.is_legacy,
    reviewerId: review.reviewer_id ?? '',
    isGTVerifiedReviewer: review.is_gt_verified,
    created: new Date(review.created_at).getTime(),
    modified: review.modified_at ? new Date(review.modified_at).getTime() : null,
    body: review.body ?? '',
    upvotes: review.upvotes,
    downvotes: review.downvotes,
    workload: review.workload ?? 0,
    difficulty: (review.difficulty ?? 3) as 1 | 2 | 3 | 4 | 5,
    overall: (review.overall ?? 3) as 1 | 2 | 3 | 4 | 5,
    staffSupport: review.staff_support as 1 | 2 | 3 | 4 | 5 | undefined,
  }));
}

export default async function RecentsPage() {
  const supabase = await createClient();

  // Fetch initial page of reviews with count
  const [{ data: reviews, count }, coursesDataStatic] = await Promise.all([
    supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1),
    getCoursesDataStatic(),
  ]);

  const initialReviews = mapSupabaseReviewsToReviews(reviews || []);
  const initialHasMore = (count || 0) > PAGE_SIZE;

  return (
    <RecentsContent
      initialReviews={initialReviews}
      coursesDataStatic={coursesDataStatic}
      initialHasMore={initialHasMore}
    />
  );
}
