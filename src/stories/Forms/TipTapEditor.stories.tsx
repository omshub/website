import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mantine/core';
import TipTapEditor from '@/components/TipTapEditor';

const meta: Meta<typeof TipTapEditor> = {
  title: 'Forms/TipTapEditor',
  component: TipTapEditor,
  parameters: {
    docs: {
      description: {
        component:
          'Rich text editor built with TipTap featuring a toolbar with formatting options including bold, italic, strikethrough, inline code, headings (H2, H3), bullet and numbered lists, blockquote, horizontal rule, code blocks, links, and undo/redo functionality.',
      },
    },
  },
  argTypes: {
    onChange: { action: 'changed' },
    initialValue: {
      control: 'text',
      description: 'Initial HTML content to populate the editor',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when editor is empty',
    },
  },
  decorators: [
    (Story) => (
      <Box p="md" maw={800} mx="auto">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TipTapEditor>;

// Default empty editor with default placeholder
export const Default: Story = {
  args: {
    onChange: (content: string) => console.log('onChange', content),
  },
};

// Editor with initial HTML content pre-filled
export const WithInitialContent: Story = {
  args: {
    initialValue: '<p>This is a great course!</p>',
    onChange: (content: string) => console.log('onChange', content),
  },
};

// Editor with custom placeholder text
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Write your review here...',
    onChange: (content: string) => console.log('onChange', content),
  },
};

// Editor with rich formatted content showcasing various formatting options
export const WithRichContent: Story = {
  args: {
    initialValue: `<h2>Course Overview</h2>
<p>This course covers <strong>machine learning</strong> fundamentals.</p>
<ul><li>Great lectures</li><li>Challenging assignments</li></ul>
<blockquote>Highly recommended!</blockquote>`,
    onChange: (content: string) => console.log('onChange', content),
  },
};
