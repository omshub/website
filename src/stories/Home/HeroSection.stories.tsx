import type { Meta, StoryObj } from '@storybook/react';
import {
  Container,
  Badge,
  Text,
  Box,
  Stack,
  Paper,
  Group,
  ThemeIcon,
  SimpleGrid,
  Title,
  Button,
} from '@mantine/core';
import {
  IconBook,
  IconMessageCircle,
  IconMoodSad,
  IconSearch,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

interface HeroStats {
  totalCourses: number;
  totalReviews: number;
  hoursSuffered: number;
}

// Stat card for hero section
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: string }) {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <Group gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color={color} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xl" fw={700} c="white" lh={1}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          <Text size="xs" c="white" style={{ opacity: 0.8 }} tt="uppercase" fw={500}>
            {label}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

// Simplified SearchButton for Storybook
function SearchButtonStory() {
  return (
    <Box ta="center">
      <Button
        size="lg"
        leftSection={<IconSearch size={18} />}
        onClick={() => console.log('Open spotlight search')}
        radius="md"
        style={{
          backgroundColor: GT_COLORS.techGold,
          color: GT_COLORS.navy,
        }}
      >
        Search Courses
      </Button>
      <Text size="xs" c="white" mt="xs" style={{ opacity: 0.7 }}>
        Press <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4 }}>Ctrl+K</kbd> to search
      </Text>
    </Box>
  );
}

interface HeroSectionStoryProps {
  stats: HeroStats;
}

// Simplified HeroSection for Storybook (without Next.js Image)
const HeroSectionStory = ({ stats }: HeroSectionStoryProps) => {
  return (
    <Box
      pos="relative"
      style={{
        minHeight: 420,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
      }}
    >
      <Container size="xl" h="100%" pos="relative" style={{ zIndex: 2 }} py="xl">
        <Stack h="100%" justify="center" gap="lg">
          {/* Title Section */}
          <Box ta="center">
            <Badge
              size="lg"
              variant="filled"
              style={{ backgroundColor: GT_COLORS.techGold, color: GT_COLORS.navy }}
              mb="sm"
            >
              Georgia Tech OMS Programs
            </Badge>
            <Title order={1} c="white" fw={700} mb="sm" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>
              Course Reviews &amp; Ratings
            </Title>
            <Text c="white" size="md" style={{ opacity: 0.9 }} maw={600} mx="auto" px="md">
              Community-driven reviews to help you make informed decisions about your Online Master's courses
            </Text>
          </Box>

          {/* Stats Row */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" maw={700} mx="auto" w="100%">
            <StatCard
              icon={<IconBook size={20} color="white" />}
              value={stats.totalCourses}
              label="Courses"
              color="blue"
            />
            <StatCard
              icon={<IconMessageCircle size={20} color="white" />}
              value={stats.totalReviews}
              label="Reviews"
              color="teal"
            />
            <StatCard
              icon={<IconMoodSad size={20} color="white" />}
              value={stats.hoursSuffered}
              label="Hours Suffered"
              color="orange"
            />
          </SimpleGrid>

          {/* Search Button */}
          <SearchButtonStory />
        </Stack>
      </Container>
    </Box>
  );
};

const meta: Meta<typeof HeroSectionStory> = {
  title: 'Home/HeroSection',
  component: HeroSectionStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Hero section for the home page with background image, program badge, title, description, stats cards, and search button.',
      },
    },
  },
  argTypes: {
    stats: {
      description: 'Statistics to display in the hero section',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSectionStory>;

// Default with realistic stats
export const Default: Story = {
  args: {
    stats: {
      totalCourses: 128,
      totalReviews: 5420,
      hoursSuffered: 82500,
    },
  },
};

// New program with few courses
export const NewProgram: Story = {
  args: {
    stats: {
      totalCourses: 15,
      totalReviews: 120,
      hoursSuffered: 1800,
    },
  },
};

// Large numbers
export const LargeNumbers: Story = {
  args: {
    stats: {
      totalCourses: 250,
      totalReviews: 25000,
      hoursSuffered: 500000,
    },
  },
};

// Zero state
export const ZeroState: Story = {
  args: {
    stats: {
      totalCourses: 0,
      totalReviews: 0,
      hoursSuffered: 0,
    },
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    stats: {
      totalCourses: 128,
      totalReviews: 5420,
      hoursSuffered: 82500,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet view
export const TabletView: Story = {
  args: {
    stats: {
      totalCourses: 128,
      totalReviews: 5420,
      hoursSuffered: 82500,
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
