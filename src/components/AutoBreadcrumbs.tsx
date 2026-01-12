'use client';

import { usePathname } from 'next/navigation';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';

// Map path segments to display names
const pathLabels: Record<string, string> = {
  about: 'About',
  recents: 'Recent Reviews',
  privacy: 'Privacy Policy',
  schedule: 'Schedule',
  course: 'Courses',
  user: 'Account',
  reviews: 'My Reviews',
  availability: 'Availability',
};

export default function AutoBreadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check if this is a course ID (e.g., CS-6250)
    const isCourseId = /^[A-Z]+-\d+$/.test(segment.toUpperCase());

    let label: string;
    if (isCourseId) {
      label = segment.toUpperCase(); // Display course ID
    } else {
      label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return <Breadcrumbs items={items} />;
}
