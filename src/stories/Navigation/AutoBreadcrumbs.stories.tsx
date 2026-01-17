import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mantine/core';
import AutoBreadcrumbs from '@/components/AutoBreadcrumbs';

const meta: Meta<typeof AutoBreadcrumbs> = {
  title: 'Navigation/AutoBreadcrumbs',
  component: AutoBreadcrumbs,
  parameters: {
    docs: {
      description: {
        component: 'Automatically generates breadcrumb navigation based on the current URL path. Parses path segments and converts them to human-readable labels.',
      },
    },
  },
  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AutoBreadcrumbs>;

// About page
export const AboutPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/about',
      },
    },
  },
};

// Recent reviews page
export const RecentsPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/recents',
      },
    },
  },
};

// Course page with course ID
export const CoursePage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/course/CS-7637',
      },
    },
  },
};

// Another course page
export const AnotherCoursePage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/course/CS-6515',
      },
    },
  },
};

// User reviews page (nested path)
export const UserReviewsPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/user/reviews',
      },
    },
  },
};

// Schedule page
export const SchedulePage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/schedule',
      },
    },
  },
};

// Privacy policy page
export const PrivacyPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/privacy',
      },
    },
  },
};

// Availability page
export const AvailabilityPage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/availability',
      },
    },
  },
};

// Home page (should render nothing)
export const HomePage: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
    docs: {
      description: {
        story: 'On the home page, AutoBreadcrumbs returns null and renders nothing.',
      },
    },
  },
};
