import backend from '@/lib/firebase/index';
import { getCoursesDataStatic } from '@/lib/staticData';
import RecentsContent from './_components/RecentsContent';

const { getReviewsRecent } = backend;

export default async function RecentsPage() {
  const [reviewsRecent, coursesDataStatic] = await Promise.all([
    getReviewsRecent(),
    getCoursesDataStatic(),
  ]);

  return <RecentsContent reviewsRecent={reviewsRecent} coursesDataStatic={coursesDataStatic} />;
}
