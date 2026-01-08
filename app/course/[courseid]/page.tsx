import backend from '@backend/index';
import { TCourseId } from '@globals/types';
import { mapDynamicCoursesDataToCourses } from '@globals/utilities';
import { mapSemesterTermToName } from '@src/utilities';
import CourseContent from './CourseContent';

const { getCourses, getReviews } = backend;

interface CoursePageProps {
  params: Promise<{ courseid: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseid } = await params;
  const courseId = courseid as TCourseId;

  const allCourseDataDynamic = await getCourses();
  const allCourseData = mapDynamicCoursesDataToCourses(allCourseDataDynamic);
  const currentCourseData = allCourseData[courseId];

  if (currentCourseData.numReviews) {
    const courseTimeline = currentCourseData.reviewsCountsByYearSem;
    const courseYears = Object.keys(courseTimeline)
      .map((year) => Number(year))
      .reverse();
    const mostRecentYear = courseYears[0];
    const mostRecentYearSemesters = Object.keys(courseTimeline[mostRecentYear]);
    const mostRecentSemester =
      mostRecentYearSemesters[mostRecentYearSemesters.length - 1];
    const availableSemesters = Object.keys(courseTimeline[mostRecentYear]);
    const activeSemesters = Object.keys(mapSemesterTermToName).reduce(
      (attrs, key) => ({
        ...attrs,
        [key]: !(availableSemesters.indexOf(key.toString()) > -1),
      }),
      {}
    );
    const courseReviews = await getReviews(
      courseId,
      String(mostRecentYear),
      String(mostRecentSemester)
    );

    return (
      <CourseContent
        courseData={currentCourseData}
        courseTimeline={courseTimeline}
        courseYears={courseYears}
        defaultYear={mostRecentYear}
        defaultSemester={mostRecentSemester}
        defaultSemesterToggles={activeSemesters}
        defaultReviews={courseReviews}
      />
    );
  } else {
    return (
      <CourseContent
        courseData={currentCourseData}
        courseTimeline={null}
        courseYears={null}
        defaultYear={null}
        defaultSemester={null}
        defaultSemesterToggles={null}
        defaultReviews={null}
      />
    );
  }
}
