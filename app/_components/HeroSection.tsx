import Image from 'next/image';
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
} from '@mantine/core';
import {
  IconBook,
  IconMessageCircle,
  IconMoodSad,
} from '@tabler/icons-react';
import SearchButton from './SearchButton';
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

interface HeroSectionProps {
  stats: HeroStats;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <Box
      pos="relative"
      style={{
        minHeight: 420,
        overflow: 'hidden',
      }}
    >
      {/* Hero Background Image - optimized for LCP */}
      <Image
        src="/gt_quad.webp"
        alt="Georgia Tech campus quad"
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center 25%',
        }}
      />

      {/* Overlay - inline CSS for Clarity compatibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: GT_COLORS.navy,
          opacity: 0.85,
          zIndex: 1,
        }}
      />

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

          {/* Search Button - Client Component */}
          <SearchButton />
        </Stack>
      </Container>
    </Box>
  );
}
