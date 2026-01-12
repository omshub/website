import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Text,
  Group,
  Paper,
  TextInput,
  Stack,
  UnstyledButton,
  ScrollArea,
  Kbd,
} from '@mantine/core';
import {
  IconSearch,
  IconFlame,
  IconClock,
  IconTrophy,
  IconMessage,
} from '@tabler/icons-react';

interface CourseResult {
  id: string;
  name: string;
  aliases: string[];
  avgDifficulty: number;
  avgWorkload: number;
  avgOverall: number;
  numReviews: number;
}

interface SpotlightSearchStoryProps {
  isOpen: boolean;
  searchQuery: string;
  isMobile: boolean;
}

function StatItem(props: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <Group gap={3} wrap="nowrap">
      <Box c={props.color} style={{ display: 'flex', alignItems: 'center' }}>
        {props.icon}
      </Box>
      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {props.value}
      </Text>
      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', opacity: 0.7 }}>
        {props.label}
      </Text>
    </Group>
  );
}

const mockCourses: CourseResult[] = [
  {
    id: 'CS-7637',
    name: 'Knowledge-Based AI',
    aliases: ['KBAI'],
    avgDifficulty: 3.2,
    avgWorkload: 15,
    avgOverall: 4.1,
    numReviews: 245,
  },
  {
    id: 'CS-6750',
    name: 'Human-Computer Interaction',
    aliases: ['HCI'],
    avgDifficulty: 2.1,
    avgWorkload: 10,
    avgOverall: 4.5,
    numReviews: 312,
  },
  {
    id: 'CS-7641',
    name: 'Machine Learning',
    aliases: ['ML'],
    avgDifficulty: 4.2,
    avgWorkload: 20,
    avgOverall: 3.8,
    numReviews: 289,
  },
  {
    id: 'CS-6515',
    name: 'Graduate Algorithms',
    aliases: ['GA'],
    avgDifficulty: 4.8,
    avgWorkload: 25,
    avgOverall: 3.5,
    numReviews: 198,
  },
  {
    id: 'CS-6035',
    name: 'Intro to Information Security',
    aliases: ['IIS'],
    avgDifficulty: 2.5,
    avgWorkload: 12,
    avgOverall: 4.0,
    numReviews: 178,
  },
  {
    id: 'CS-6250',
    name: 'Computer Networks',
    aliases: ['CN'],
    avgDifficulty: 3.5,
    avgWorkload: 14,
    avgOverall: 3.9,
    numReviews: 156,
  },
];

function SpotlightSearchStory(props: SpotlightSearchStoryProps) {
  const { isOpen, searchQuery, isMobile } = props;
  const [query, setQuery] = useState(searchQuery);
  const [open, setOpen] = useState(isOpen);

  const filteredCourses = query
    ? mockCourses.filter(function(course) {
        return (
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.id.toLowerCase().includes(query.toLowerCase()) ||
          course.aliases.some(function(alias) {
            return alias.toLowerCase().includes(query.toLowerCase());
          })
        );
      })
    : mockCourses;

  if (!open) {
    return (
      <Box ta="center" p="xl">
        <Text size="sm" c="dimmed" mb="md">
          Press Ctrl + K or click below to open search
        </Text>
        <UnstyledButton
          onClick={function() { setOpen(true); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 'var(--mantine-radius-md)',
            backgroundColor: 'var(--mantine-color-gray-1)',
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          <IconSearch size={16} />
          <Text size="sm">Search courses...</Text>
          <Kbd size="xs">Ctrl + K</Kbd>
        </UnstyledButton>
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 100,
        minHeight: 500,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={function(e) {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <Paper
        shadow="xl"
        radius="md"
        style={{
          width: isMobile ? '95%' : 600,
          maxWidth: '95vw',
          overflow: 'hidden',
        }}
      >
        <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <TextInput
            value={query}
            onChange={function(e) { setQuery(e.target.value); }}
            placeholder="Search courses..."
            leftSection={<IconSearch size={isMobile ? 24 : 20} />}
            size={isMobile ? 'lg' : 'md'}
            autoFocus
            styles={{
              input: {
                border: 'none',
                backgroundColor: 'transparent',
              },
            }}
          />
        </Box>

        <ScrollArea.Autosize mah={isMobile ? '60vh' : 350}>
          {filteredCourses.length > 0 ? (
            <Stack gap={0}>
              {filteredCourses.map(function(course) {
                return (
                  <UnstyledButton
                    key={course.id}
                    onClick={function() {
                      console.log('Navigate to /course/' + course.id);
                      setOpen(false);
                    }}
                    style={{
                      padding: isMobile ? '16px 12px' : '12px 16px',
                      borderBottom: '1px solid var(--mantine-color-gray-2)',
                    }}
                  >
                    <Box>
                      <Text size={isMobile ? 'md' : 'sm'} fw={500}>
                        {course.name}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <Text size="xs" c="dimmed">
                          {course.id}
                          {course.aliases.length > 0 ? ' (' + course.aliases.join(', ') + ')' : ''}
                        </Text>
                      </Group>
                      {course.numReviews > 0 ? (
                        <Group gap="md" mt={6} wrap="nowrap">
                          <StatItem
                            icon={<IconFlame size={12} />}
                            value={course.avgDifficulty.toFixed(1)}
                            label="diff"
                            color="red.5"
                          />
                          <StatItem
                            icon={<IconClock size={12} />}
                            value={Math.round(course.avgWorkload) + 'h'}
                            label="/wk"
                            color="blue.5"
                          />
                          <StatItem
                            icon={<IconTrophy size={12} />}
                            value={course.avgOverall.toFixed(1)}
                            label="rating"
                            color="yellow.6"
                          />
                          <StatItem
                            icon={<IconMessage size={12} />}
                            value={String(course.numReviews)}
                            label="reviews"
                            color="navyBlue.5"
                          />
                        </Group>
                      ) : null}
                    </Box>
                  </UnstyledButton>
                );
              })}
            </Stack>
          ) : (
            <Box p="xl" ta="center">
              <Text c="dimmed">No courses found...</Text>
            </Box>
          )}
        </ScrollArea.Autosize>

        <Box p="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </Text>
            <Group gap="xs">
              <Kbd size="xs">Enter</Kbd>
              <Text size="xs" c="dimmed">to select</Text>
              <Kbd size="xs">esc</Kbd>
              <Text size="xs" c="dimmed">to close</Text>
            </Group>
          </Group>
        </Box>
      </Paper>
    </Box>
  );
}

const meta: Meta<typeof SpotlightSearchStory> = {
  title: 'General/SpotlightSearch',
  component: SpotlightSearchStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Spotlight search modal for finding courses with stats preview.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    searchQuery: { control: 'text' },
    isMobile: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SpotlightSearchStory>;

export const Default: Story = {
  args: {
    isOpen: true,
    searchQuery: '',
    isMobile: false,
  },
};

export const WithQuery: Story = {
  args: {
    isOpen: true,
    searchQuery: 'Machine',
    isMobile: false,
  },
};

export const SearchByCourseId: Story = {
  args: {
    isOpen: true,
    searchQuery: 'CS-7637',
    isMobile: false,
  },
};

export const SearchByAlias: Story = {
  args: {
    isOpen: true,
    searchQuery: 'KBAI',
    isMobile: false,
  },
};

export const NoResults: Story = {
  args: {
    isOpen: true,
    searchQuery: 'nonexistent course xyz',
    isMobile: false,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    searchQuery: '',
    isMobile: false,
  },
};

export const MobileView: Story = {
  args: {
    isOpen: true,
    searchQuery: '',
    isMobile: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const MobileWithQuery: Story = {
  args: {
    isOpen: true,
    searchQuery: 'AI',
    isMobile: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
