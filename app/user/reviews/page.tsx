'use client';

import ReviewCard from '@/components/ReviewCard';
import { useAuth } from '@/context/AuthContext';
import { DESC, reviewFields } from '@/lib/constants';
import { Review, TUserReviews } from '@/lib/types';
import { mapPayloadToArray } from '@/utilities';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Center,
  Loader,
  Box,
  Badge,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { IconMessageCircle, IconPencil } from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

// API function to interact with Supabase via API routes
async function getUserReviewsFromApi(userId: string): Promise<TUserReviews> {
  const response = await fetch(`/api/user/reviews?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user reviews');
  }
  return response.json();
}

export default function UserReviewsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const authContext = useAuth();
  const [userReviews, setUserReviews] = useState<TUserReviews>({});
  const user = authContext?.user;

  useEffect(() => {
    async function fetchUserData() {
      if (user?.id) {
        try {
          const reviews = await getUserReviewsFromApi(user.id);
          setUserReviews(reviews);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserReviews({});
        }
        setLoading(false);
      } else {
        setUserReviews({});
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user]);

  const reviewCount = Object.keys(userReviews)?.length || 0;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py="xl"
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          borderBottom: `3px solid ${GT_COLORS.techGold}`,
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              Your Contributions
            </Badge>
            <Title order={1} c="white" ta="center" fw={700}>
              My Reviews
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={500}>
              {user
                ? `Manage and view all the reviews you've contributed to the community`
                : 'Sign in to view and manage your course reviews'
              }
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {loading ? (
          <Center h={200}>
            <Loader color={GT_COLORS.techGold} />
          </Center>
        ) : (
          <>
            {reviewCount > 0 ? (
              <Stack gap="lg">
                {mapPayloadToArray(userReviews, reviewFields.CREATED, DESC).map(
                  (value: Review) => (
                    <ReviewCard key={value.reviewId} {...value} />
                  )
                )}
              </Stack>
            ) : (
              <Paper p="xl" radius="lg" withBorder>
                <Stack align="center" gap="lg" py="xl">
                  <ThemeIcon
                    size={80}
                    radius="xl"
                    variant="light"
                    style={{ backgroundColor: `${GT_COLORS.techGold}20` }}
                  >
                    <IconPencil size={40} stroke={1.5} color={GT_COLORS.techGold} />
                  </ThemeIcon>
                  <Stack align="center" gap="xs">
                    <Title order={3} ta="center">
                      No reviews yet
                    </Title>
                    <Text c="dimmed" ta="center" maw={400}>
                      {user
                        ? "You haven't written any reviews yet. Share your course experiences to help other students!"
                        : 'Sign in to start writing reviews and help the OMS community.'
                      }
                    </Text>
                  </Stack>
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
