import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

// Since SearchButton depends on Mantine Spotlight, we create a wrapper for stories
const SearchButtonStory = () => {
  return (
    <Box ta="center">
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#B3A369', // GT Tech Gold
          color: '#003057', // GT Navy
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
        onClick={() => alert('Spotlight would open here')}
      >
        <IconSearch size={18} />
        Search Courses
      </button>
      <p
        style={{
          fontSize: '12px',
          color: 'white',
          marginTop: '8px',
          opacity: 0.7,
        }}
      >
        Press{' '}
        <kbd
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          Ctrl+K
        </kbd>{' '}
        to search
      </p>
    </Box>
  );
};

const meta: Meta<typeof SearchButtonStory> = {
  title: 'Home/SearchButton',
  component: SearchButtonStory,
  parameters: {
    docs: {
      description: {
        component:
          'A prominent search button that opens the Mantine Spotlight search modal. Displays keyboard shortcut hint.',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#003057' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <Box
        p="xl"
        style={{
          background: 'linear-gradient(135deg, #003057 0%, #001a30 100%)',
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchButtonStory>;

// Default state
export const Default: Story = {};

// Hover state simulation
export const HoverState: Story = {
  render: () => (
    <Box ta="center">
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#C4B57A', // Lighter gold on hover
          color: '#003057',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(179, 163, 105, 0.3)',
        }}
      >
        <IconSearch size={18} />
        Search Courses
      </button>
      <p
        style={{
          fontSize: '12px',
          color: 'white',
          marginTop: '8px',
          opacity: 0.7,
        }}
      >
        Press{' '}
        <kbd
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          Ctrl+K
        </kbd>{' '}
        to search
      </p>
    </Box>
  ),
};

// Mac keyboard shortcut
export const MacKeyboardShortcut: Story = {
  render: () => (
    <Box ta="center">
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#B3A369',
          color: '#003057',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        <IconSearch size={18} />
        Search Courses
      </button>
      <p
        style={{
          fontSize: '12px',
          color: 'white',
          marginTop: '8px',
          opacity: 0.7,
        }}
      >
        Press{' '}
        <kbd
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          Cmd+K
        </kbd>{' '}
        to search
      </p>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'On macOS, the keyboard shortcut displays Cmd+K instead of Ctrl+K.',
      },
    },
  },
};

// Mobile view (no keyboard shortcut shown)
export const MobileView: Story = {
  render: () => (
    <Box ta="center">
      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 600,
          backgroundColor: '#B3A369',
          color: '#003057',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '280px',
          justifyContent: 'center',
        }}
      >
        <IconSearch size={18} />
        Search Courses
      </button>
    </Box>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'On mobile devices, the keyboard shortcut hint may be hidden as it is not applicable to touch interfaces.',
      },
    },
  },
};
