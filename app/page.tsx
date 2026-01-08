import backend from '@backend/index';
import { mapDynamicCoursesDataToCourses } from '@globals/utilities';
import HomeContent from './HomeContent';

const { getCourses } = backend;

export default async function HomePage() {
  const coursesDataDynamic = await getCourses();
  const coursesData = mapDynamicCoursesDataToCourses(coursesDataDynamic);

  return <HomeContent allCourseData={coursesData} />;
}
