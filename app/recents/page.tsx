import backend from '@/lib/firebase/index';
import RecentsContent from './_components/RecentsContent';

const { getReviewsRecent } = backend;

export default async function RecentsPage() {
  const reviewsRecent = await getReviewsRecent();

  return <RecentsContent reviewsRecent={reviewsRecent} />;
}
