'use client';

import { Container, Title, Text, Button, Stack, Box, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';

const DEFAULT_IMAGE = '/static/omshub-static.jpg';

interface HeroStat {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

interface HeroProps {
  title: string;
  subtitle: string;
  showSearch?: boolean;
  backgroundImage?: string;
  stats?: HeroStat[];
}

export function Hero({
  title,
  subtitle,
  showSearch = false,
  backgroundImage = DEFAULT_IMAGE,
  stats,
}: HeroProps) {
  const isMobileQuery = useMediaQuery('(max-width: 768px)');
  // Default to mobile-first to ensure full viewport on initial render
  const isMobile = isMobileQuery ?? true;

  return (
    <Box
      component="section"
      aria-label="Page header"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-navyBlue-6)',
        color: 'white',
        minHeight: isMobile ? '100dvh' : 280,
        display: 'flex',
        alignItems: isMobile ? 'center' : undefined,
        padding: isMobile ? '0' : '60px 0',
      }}
    >
      {/* Background Image */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* Dark Overlay for text readability */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isMobile
            ? 'rgba(0, 48, 87, 0.75)'
            : 'linear-gradient(to right, rgba(0, 48, 87, 0.85) 0%, rgba(0, 48, 87, 0.7) 50%, rgba(0, 48, 87, 0.5) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container size="lg" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <Stack align={isMobile ? 'center' : 'flex-start'} gap="md">
          <Title
            order={1}
            size="h1"
            fw={700}
            ta={isMobile ? 'center' : 'left'}
            style={{ fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2rem)' : 'clamp(1.75rem, 4vw, 2.5rem)' }}
          >
            {title}
          </Title>
          <Text
            size={isMobile ? 'md' : 'lg'}
            maw={600}
            ta={isMobile ? 'center' : 'left'}
            style={{ opacity: 0.9, lineHeight: 1.6 }}
          >
            {subtitle}
          </Text>
          {/* Desktop: Two columns - Search button left, Stats right */}
          {/* Mobile: Stacked - Search button, then Stats below */}
          {(showSearch || (stats && stats.length > 0)) && (
            <Group
              mt="md"
              gap={isMobile ? 'xl' : 'xl'}
              justify={isMobile ? 'center' : 'space-between'}
              align="center"
              w="100%"
              wrap={isMobile ? 'wrap' : 'nowrap'}
              style={{ flexDirection: isMobile ? 'column' : 'row' }}
            >
              {showSearch && (
                <Button
                  size={isMobile ? 'xl' : 'lg'}
                  variant="white"
                  color="dark"
                  leftSection={<IconSearch size={isMobile ? 24 : 20} />}
                  onClick={spotlight.open}
                  aria-label="Search for courses"
                  fullWidth={isMobile}
                  maw={isMobile ? 300 : undefined}
                >
                  Search Courses
                </Button>
              )}
              {stats && stats.length > 0 && (
                <Group gap={isMobile ? 'md' : 'xl'} justify="center" wrap="nowrap">
                  {stats.map((stat, index) => (
                    <Box
                      key={index}
                      ta="center"
                      style={{
                        minWidth: isMobile ? 80 : 100,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginBottom: 4,
                          opacity: 0.9,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Text size={isMobile ? 'lg' : 'xl'} fw={700} lh={1}>
                        {stat.value}
                      </Text>
                      <Text size="xs" style={{ opacity: 0.8 }} mt={2}>
                        {stat.label}
                      </Text>
                    </Box>
                  ))}
                </Group>
              )}
            </Group>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
