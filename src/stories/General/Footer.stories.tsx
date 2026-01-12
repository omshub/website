import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Footer from '@/components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'General/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Site footer with navigation links, social icons, and branding.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

// Default footer
export const Default: Story = {};

// Mobile view
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

// Tablet view
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Desktop view
export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

// Footer with page content above it
export const WithPageContent: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '40px', backgroundColor: '#f8f9fa' }}>
          <h1>Page Content</h1>
          <p>This demonstrates how the footer appears at the bottom of a page.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};
