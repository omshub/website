import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCoursesDataStatic, getCourseStats } from '@/lib/staticData';
import { TCourseId, Review } from '@/lib/types';
import { mapDynamicCoursesDataToCourses } from '@/lib/utilities';
import { CourseSchema, FAQSchema, BreadcrumbSchema } from '@/components/StructuredData';
import CourseContent from './_components/CourseContent';
import type { Database } from '@/lib/supabase/database.types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

const PAGE_SIZE = 20;

// Convert Supabase reviews to Review array format
function mapSupabaseReviewsToArray(reviews: SupabaseReview[]): Review[] {
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
    isRecommended: review.is_recommended ?? undefined,
    isGoodFirstCourse: review.is_good_first_course ?? undefined,
    isPairable: review.is_pairable ?? undefined,
    hasGroupProjects: review.has_group_projects ?? undefined,
    hasWritingAssignments: review.has_writing_assignments ?? undefined,
    hasExamsQuizzes: review.has_exams_quizzes ?? undefined,
    hasMandatoryReadings: review.has_mandatory_readings ?? undefined,
    hasProgrammingAssignments: review.has_programming_assignments ?? undefined,
    hasProvidedDevEnv: review.has_provided_dev_env ?? undefined,
    programmingLanguagesIds: review.programming_languages as any,
    preparation: review.preparation as 1 | 2 | 3 | 4 | 5 | undefined,
    omsCoursesTaken: review.oms_courses_taken,
    hasRelevantWorkExperience: review.has_relevant_work_experience ?? undefined,
    experienceLevelId: review.experience_level as 'jr' | 'mid' | 'sr' | undefined,
    gradeId: review.grade ?? undefined,
  }));
}

interface CoursePageProps {
  params: Promise<{ courseid: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseid } = await params;
  const courseId = courseid as TCourseId;

  const [allCourseDataDynamic, coursesDataStatic] = await Promise.all([
    getCourseStats(),
    getCoursesDataStatic(),
  ]);
  const allCourseData = mapDynamicCoursesDataToCourses(
    allCourseDataDynamic,
    coursesDataStatic
  );
  const course = allCourseData[courseId];

  if (!course) {
    return {
      title: 'Course Not Found - OMSHub',
      description: 'The requested course could not be found.',
    };
  }

  const title = `${course.courseId}: ${course.name} - Reviews & Ratings | OMSHub`;
  const description = course.numReviews
    ? `${course.name} (${course.courseId}) has ${course.numReviews} student reviews. Average difficulty: ${course.avgDifficulty?.toFixed(1) || 'N/A'}/5, workload: ${course.avgWorkload?.toFixed(1) || 'N/A'} hrs/wk, rating: ${course.avgOverall?.toFixed(1) || 'N/A'}/5. Read honest reviews from Georgia Tech OMS students.`
    : `${course.name} (${course.courseId}) - Georgia Tech Online Master's course. Be the first to leave a review on OMSHub.`;

  const ogImage = `/api/og/course/${courseId}`;

  return {
    title,
    description,
    keywords: [
      course.courseId,
      course.name,
      ...(course.aliases || []),
      'Georgia Tech',
      'OMSCS',
      'OMSA',
      'OMSCyber',
      'online masters',
      'course reviews',
      'student reviews',
    ],
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://omshub.org/course/${courseId}`,
      siteName: 'OMSHub',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${course.courseId}: ${course.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://omshub.org/course/${courseId}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate static params from static course data (can't use Supabase during build time)
export async function generateStaticParams() {
  const coursesDataStatic = await getCoursesDataStatic();
  return Object.keys(coursesDataStatic).map((courseId) => ({
    courseid: courseId,
  }));
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseid } = await params;
  const courseId = courseid as TCourseId;

  const supabase = await createClient();

  // Fetch all data in parallel
  const [allCourseDataDynamic, coursesDataStatic, { data: reviews, count }] = await Promise.all([
    getCourseStats(),
    getCoursesDataStatic(),
    supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ]);

  const allCourseData = mapDynamicCoursesDataToCourses(
    allCourseDataDynamic,
    coursesDataStatic
  );
  const currentCourseData = allCourseData[courseId];

  if (!currentCourseData) {
    notFound();
  }

  // Convert reviews to array format
  const initialReviews = mapSupabaseReviewsToArray(reviews || []);
  const totalReviewCount = count || 0;
  const initialHasMore = totalReviewCount > PAGE_SIZE;

  // Breadcrumb data for structured data
  const breadcrumbs = [
    { name: 'Home', url: 'https://omshub.org' },
    { name: 'Courses', url: 'https://omshub.org' },
    { name: `${courseId}: ${currentCourseData.name}`, url: `https://omshub.org/course/${courseId}` },
  ];

  return (
    <>
      {/* Schema.org Structured Data for SEO */}
      <CourseSchema course={currentCourseData} reviews={initialReviews} />
      <FAQSchema course={currentCourseData} />
      <BreadcrumbSchema items={breadcrumbs} />

      <CourseContent
        courseData={currentCourseData}
        initialReviews={initialReviews}
        initialHasMore={initialHasMore}
        totalReviewCount={totalReviewCount}
      />
    </>
  );
}
