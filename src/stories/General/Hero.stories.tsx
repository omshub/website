import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from '@/components/Hero';
import { IconBook, IconMessage, IconStar } from '@tabler/icons-react';

const meta: Meta<typeof Hero> = {
  title: 'General/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Hero section component with background image, optional search button, and statistics display.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text',
    },
    subtitle: {
      control: 'text',
      description: 'Secondary text below the title',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show the search courses button',
    },
    backgroundImage: {
      control: 'text',
      description: 'Path to background image',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

// Default hero
export const Default: Story = {
  args: {
    title: 'OMSHub',
    subtitle: 'Your comprehensive guide to Georgia Tech Online Master of Science courses. Read reviews, compare workloads, and make informed decisions about your degree path.',
  },
};

// Hero with search button
export const WithSearch: Story = {
  args: {
    title: 'Find Your Perfect Course',
    subtitle: 'Explore course reviews from fellow students to make informed decisions about your academic journey.',
    showSearch: true,
  },
};

// Hero with custom background image
export const WithCustomBackground: Story = {
  args: {
    title: 'Welcome to OMSHub',
    subtitle: 'The community-driven platform for Georgia Tech OMS course reviews and insights.',
    backgroundImage: '/static/gt-campus.jpg',
    showSearch: true,
  },
};

// Hero with statistics
export const WithStats: Story = {
  args: {
    title: 'OMSHub Community',
    subtitle: 'Join thousands of students sharing their experiences.',
    showSearch: true,
    stats: [
      { icon: <IconBook size={24} />, value: '150+', label: 'Courses' },
      { icon: <IconMessage size={24} />, value: '5,000+', label: 'Reviews' },
      { icon: <IconStar size={24} />, value: '4.2', label: 'Avg Rating' },
    ],
  },
};

// Hero with stats and custom background (full featured)
export const FullFeatured: Story = {
  args: {
    title: 'Georgia Tech OMS Hub',
    subtitle: 'Make informed decisions about your online master\'s degree with real reviews from real students.',
    backgroundImage: '/static/gt-campus.jpg',
    showSearch: true,
    stats: [
      { icon: <IconBook size={24} />, value: '150+', label: 'Courses' },
      { icon: <IconMessage size={24} />, value: '5,000+', label: 'Reviews' },
      { icon: <IconStar size={24} />, value: '4.2', label: 'Avg Rating' },
    ],
  },
};

// Hero for recents page
export const RecentsPage: Story = {
  args: {
    title: 'Recent Reviews',
    subtitle: 'The 50 most recent reviews from the Georgia Tech OMS community.',
  },
};

// Hero for about page
export const AboutPage: Story = {
  args: {
    title: 'About OMSHub',
    subtitle: 'Learn about our mission to help students succeed in their Georgia Tech online master\'s journey.',
  },
};

// Short content hero
export const ShortContent: Story = {
  args: {
    title: 'CS-7637',
    subtitle: 'Knowledge-Based AI',
  },
};

// Long content hero
export const LongContent: Story = {
  args: {
    title: 'Understanding Knowledge-Based Artificial Intelligence and Cognitive Systems',
    subtitle: 'The twin goals of knowledge-based artificial intelligence (AI) are to build AI agents capable of human-level intelligence and gain insights into human cognition. This course provides an in-depth exploration of cognitive architectures, analogical reasoning, and case-based reasoning approaches that form the foundation of intelligent systems.',
    showSearch: true,
  },
};

// Mobile viewport story
export const MobileView: Story = {
  args: {
    title: 'OMSHub Mobile',
    subtitle: 'Course reviews on the go.',
    showSearch: true,
    stats: [
      { icon: <IconBook size={20} />, value: '150+', label: 'Courses' },
      { icon: <IconMessage size={20} />, value: '5K+', label: 'Reviews' },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
