import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text, Stack } from '@mantine/core';
import HighlightedText from '@/components/HighlightedText';

const meta: Meta<typeof HighlightedText> = {
  title: 'General/HighlightedText',
  component: HighlightedText,
  parameters: {
    docs: {
      description: {
        component: 'A component that highlights matching text within a string, useful for search result highlighting.',
      },
    },
  },
  argTypes: {
    text: { control: 'text', description: 'The full text to display' },
    highlight: { control: 'text', description: 'The text to highlight within the full text' },
    highlightColor: { control: 'color', description: 'Background color for highlighted text' },
  },
  decorators: [
    (Story) => (
      <Box p="md" maw={600}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HighlightedText>;

// Default highlight
export const Default: Story = {
  args: {
    text: 'This course provides an excellent introduction to machine learning concepts.',
    highlight: 'machine learning',
  },
};

// Custom highlight color
export const CustomColor: Story = {
  args: {
    text: 'The professor was very helpful and responsive to questions.',
    highlight: 'helpful',
    highlightColor: '#90EE90',
  },
};

// Multiple matches (case-insensitive)
export const MultipleMatches: Story = {
  args: {
    text: 'The course covers algorithms, data structures, and more algorithms. Algorithms are important!',
    highlight: 'algorithms',
  },
};

// No match found
export const NoMatch: Story = {
  args: {
    text: 'This is a review about the computer networks course.',
    highlight: 'machine learning',
  },
};

// Empty highlight
export const EmptyHighlight: Story = {
  args: {
    text: 'When no highlight is provided, the text displays normally.',
    highlight: '',
  },
};

// Special characters in search
export const SpecialCharacters: Story = {
  args: {
    text: 'The course uses C++ and covers topics like O(n) complexity.',
    highlight: 'C++',
  },
};

// Long text with highlight
export const LongText: Story = {
  args: {
    text: 'This course was challenging but rewarding. The professor explained concepts clearly and the assignments helped reinforce the material. I would highly recommend it to anyone interested in artificial intelligence and machine learning. The workload was manageable if you stay on top of things.',
    highlight: 'machine learning',
  },
};

// Case insensitive matching
export const CaseInsensitive: Story = {
  args: {
    text: 'Machine Learning is fascinating. I love MACHINE LEARNING concepts!',
    highlight: 'machine learning',
  },
};

// In context - simulating search results
export const InSearchContext: Story = {
  render: () => (
    <Stack gap="md">
      <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-yellow-light)', borderRadius: 8, borderLeft: '3px solid var(--mantine-color-yellow-6)' }}>
        <Text size="xs" fw={600} c="dimmed" mb={4}>Match found:</Text>
        <Text size="sm">
          <HighlightedText
            text="...The course provides an excellent introduction to machine learning and covers topics like neural networks, decision trees, and clustering algorithms..."
            highlight="machine learning"
          />
        </Text>
      </Box>
      <Box p="sm" style={{ backgroundColor: 'var(--mantine-color-yellow-light)', borderRadius: 8, borderLeft: '3px solid var(--mantine-color-yellow-6)' }}>
        <Text size="xs" fw={600} c="dimmed" mb={4}>Match found:</Text>
        <Text size="sm">
          <HighlightedText
            text="...I highly recommend this course for anyone interested in machine learning. The projects were engaging and practical..."
            highlight="machine learning"
          />
        </Text>
      </Box>
    </Stack>
  ),
};

// Different highlight colors showcase
export const ColorVariations: Story = {
  render: () => (
    <Stack gap="md">
      <Text size="sm">
        <HighlightedText
          text="Yellow highlight (default): This is the standard highlight color."
          highlight="Yellow highlight"
          highlightColor="#fff3cd"
        />
      </Text>
      <Text size="sm">
        <HighlightedText
          text="Green highlight: Success or positive context."
          highlight="Green highlight"
          highlightColor="#d4edda"
        />
      </Text>
      <Text size="sm">
        <HighlightedText
          text="Blue highlight: Informational context."
          highlight="Blue highlight"
          highlightColor="#cce5ff"
        />
      </Text>
      <Text size="sm">
        <HighlightedText
          text="Red highlight: Warning or important context."
          highlight="Red highlight"
          highlightColor="#f8d7da"
        />
      </Text>
    </Stack>
  ),
};
