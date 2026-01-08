import backend from '@backend/index';
import RecentsContent from './RecentsContent';

const { getReviewsRecent } = backend;

export default async function RecentsPage() {
  const reviewsRecent = await getReviewsRecent();

  return <RecentsContent reviewsRecent={reviewsRecent} />;
}
