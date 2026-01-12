import { Course, Review } from '@/lib/types';
import { SOCIAL_LINKS } from '@/lib/socialLinks';

// Schema.org structured data for SEO - these generate rich snippets in Google

interface CourseSchemaProps {
  course: Course;
  reviews?: Review[];
}

// Course schema with AggregateRating for rich snippets
export function CourseSchema({ course, reviews = [] }: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: `${course.name} (${course.courseId}) - Georgia Tech Online Master's course. ${course.numReviews || 0} student reviews with average rating of ${course.avgOverall?.toFixed(1) || 'N/A'}/5.`,
    provider: {
      '@type': 'Organization',
      name: 'Georgia Institute of Technology',
      sameAs: 'https://www.gatech.edu',
    },
    courseCode: course.courseId,
    ...(course.url && { url: course.url }),
    ...(course.avgOverall && course.numReviews && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: course.avgOverall.toFixed(1),
        bestRating: '5',
        worstRating: '1',
        ratingCount: course.numReviews,
        reviewCount: course.numReviews,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 5).map((review) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.overall,
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Person',
          name: 'Anonymous Student',
        },
        datePublished: new Date(review.created).toISOString().split('T')[0],
        reviewBody: review.body.substring(0, 500) + (review.body.length > 500 ? '...' : ''),
      })),
    }),
    teaches: course.name,
    educationalLevel: 'Graduate',
    ...(course.isFoundational && {
      coursePrerequisites: 'Admission to Georgia Tech OMS program',
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization schema for the website
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OMSHub',
    description: 'Community-driven course reviews for Georgia Tech Online Master\'s programs (OMSCS, OMSA, OMSCyber)',
    url: 'https://omshub.org',
    logo: 'https://omshub.org/logo.png',
    sameAs: [
      SOCIAL_LINKS.github,
      SOCIAL_LINKS.discord,
      SOCIAL_LINKS.reddit,
      SOCIAL_LINKS.slack,
    ],
    foundingDate: '2024',
    slogan: 'By students, for students',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website schema with search action for sitelinks search box
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OMSHub',
    url: 'https://omshub.org',
    description: 'Georgia Tech OMS Course Reviews - Community-driven ratings and reviews',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://omshub.org/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb schema for navigation
interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ schema for course pages with common questions
interface FAQSchemaProps {
  course: Course;
}

export function FAQSchema({ course }: FAQSchemaProps) {
  const faqs = [
    {
      question: `How difficult is ${course.courseId} ${course.name}?`,
      answer: course.avgDifficulty
        ? `Based on ${course.numReviews} student reviews, ${course.courseId} has an average difficulty rating of ${course.avgDifficulty.toFixed(1)}/5. Students report an average workload of ${course.avgWorkload?.toFixed(1) || 'N/A'} hours per week.`
        : `${course.courseId} does not have enough reviews yet to determine difficulty.`,
    },
    {
      question: `What is the workload for ${course.courseId}?`,
      answer: course.avgWorkload
        ? `Students report spending an average of ${course.avgWorkload.toFixed(1)} hours per week on ${course.courseId} ${course.name}.`
        : `Workload data is not yet available for ${course.courseId}.`,
    },
    {
      question: `Is ${course.courseId} worth taking?`,
      answer: course.avgOverall
        ? `${course.courseId} has an overall rating of ${course.avgOverall.toFixed(1)}/5 based on ${course.numReviews} student reviews. ${course.avgOverall >= 4 ? 'Students generally recommend this course.' : course.avgOverall >= 3 ? 'Student opinions are mixed.' : 'Some students have concerns about this course.'}`
        : `There are not enough reviews to determine if ${course.courseId} is worth taking.`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
