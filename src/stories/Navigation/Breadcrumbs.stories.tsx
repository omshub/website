import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumbs from '@/components/Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Breadcrumb navigation component that displays the current page location within a hierarchical structure. Includes an optional home icon link.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

// Default breadcrumb with Home > About path
export const Default: Story = {
  args: {
    items: [
      { label: 'About' },
    ],
  },
};

// Breadcrumbs without home link
export const WithoutHome: Story = {
  args: {
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'CS-6515' },
    ],
    showHome: false,
  },
};

// Single item breadcrumb (current page only)
export const SingleItem: Story = {
  args: {
    items: [
      { label: 'Contact' },
    ],
    showHome: false,
  },
};

// Deep nested path
export const DeepPath: Story = {
  args: {
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'CS-7637', href: '/courses/cs-7637' },
      { label: 'Reviews' },
    ],
  },
};

// Realistic course page breadcrumb
export const CoursePage: Story = {
  args: {
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'CS-6515' },
    ],
  },
};
