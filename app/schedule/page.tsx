import { Metadata } from 'next';
import LazyScheduleContent from './_components/LazyScheduleContent';

import { getCoursesDataStatic, getCourseStats } from '@/lib/staticData';
import { mapDynamicCoursesDataToCourses } from '@/lib/utilities';

export const metadata: Metadata = {
  title: 'Course Schedule - OMSHub',
  description: 'View Georgia Tech OMS course schedule and enrollment data by semester',
};

export default async function SchedulePage() {
  const [coursesDataDynamic, coursesDataStatic] = await Promise.all([
    getCourseStats(),
    getCoursesDataStatic(),
  ]);
  const coursesData = mapDynamicCoursesDataToCourses(
    coursesDataDynamic,
    coursesDataStatic
  );

  return <LazyScheduleContent allCourseData={coursesData} />;
}
