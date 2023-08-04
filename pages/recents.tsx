import backend from '@backend/index';
import ReviewCard from '@components/ReviewCard';
import { REVIEWS_RECENT_LEN } from '@globals/constants';
import { Review } from '@globals/types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';

const { getReviewsRecent } = backend;

interface RecentsProps {
  reviewsRecent: Review[];
}

const Recents: NextPage<RecentsProps> = ({ reviewsRecent }) => (
  <Container maxWidth='lg'>
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant='h4' color='text.secondary' gutterBottom>
        {`Recent Reviews`}
      </Typography>
      <Typography variant='subtitle1' color='text.secondary' gutterBottom>
        {`A Dynamic List of the ${REVIEWS_RECENT_LEN} Most Recent Reviews`}
      </Typography>
      {!reviewsRecent ? (
        <Box sx={{ display: 'flex', m: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {reviewsRecent && (
            <Grid container rowSpacing={5} sx={{ mt: 1 }}>
              {reviewsRecent
                .sort((a, b) => b.created - a.created)
                .slice(0, REVIEWS_RECENT_LEN)
                .map((value: Review) => (
                  <Grid sx={{ width: `100%` }} key={value.reviewId} item>
                    <ReviewCard {...value}></ReviewCard>
                  </Grid>
                ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  </Container>
);

export default Recents;

export async function getServerSideProps() {
  const ReviewsRecent = await getReviewsRecent();
  return {
    props: {
      reviewsRecent: ReviewsRecent,
    },
  };
}
