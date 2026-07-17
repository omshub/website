import { getCoursesDataStatic } from '@/lib/staticData';
import RecentsContent from './_components/RecentsContent';
import { mapSupabaseReviewsToArray } from '@/lib/supabase/mappers';
import {
  EMPTY_PUBLIC_REVIEW_PAGE,
  getPublicReviewsPage,
} from '@/lib/supabase/publicReviews';

const PAGE_SIZE = 20;

// Route segment config must remain a statically analyzable literal for Next.js.
export const revalidate = 21600;

export default async function RecentsPage() {
  const [reviewPage, coursesDataStatic] = await Promise.all([
    getPublicReviewsPage({ limit: PAGE_SIZE }).catch((error) => {
      console.error('Unable to load recent public reviews:', error);
      return EMPTY_PUBLIC_REVIEW_PAGE;
    }),
    getCoursesDataStatic(),
  ]);

  const initialReviews = mapSupabaseReviewsToArray(reviewPage.reviews);

  return (
    <RecentsContent
      initialReviews={initialReviews}
      coursesDataStatic={coursesDataStatic}
      initialHasMore={reviewPage.hasMore}
    />
  );
}
