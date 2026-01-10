'use client';

import ReviewCard from '@components/ReviewCard';
import { REVIEWS_RECENT_LEN } from '@globals/constants';
import { Review } from '@globals/types';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface RecentsContentProps {
  reviewsRecent: Review[];
}

export default function RecentsContent({ reviewsRecent }: RecentsContentProps) {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          {`Recent Reviews`}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {`A Dynamic List of the ${REVIEWS_RECENT_LEN} Most Recent Reviews`}
        </Typography>
        <Grid container rowSpacing={5} sx={{ mt: 1 }}>
          {reviewsRecent
            .sort((a, b) => b.created - a.created)
            .slice(0, REVIEWS_RECENT_LEN)
            .map((value: Review) => (
              <Grid sx={{ width: '100%' }} key={value.reviewId} size={12}>
                <ReviewCard {...value}></ReviewCard>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Container>
  );
}
