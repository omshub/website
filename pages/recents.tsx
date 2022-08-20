import backend from '@backend/index'
import ReviewCard from '@components/ReviewCard'
import { Review } from '@globals/types'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'

const { getReviewsRecent } = backend

interface RecentsProps {
	reviewsRecent: Review[]
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
				{`A Dynamic List of the 50 Most Recent Reviews`}
			</Typography>
			{!reviewsRecent ? (
				<Box sx={{ display: 'flex', m: 10 }}>
					<CircularProgress />
				</Box>
			) : (
				<>
					{reviewsRecent && (
						<Grid container spacing={3} sx={{ margin: '10px 0' }}>
							{reviewsRecent
								.reverse()
								.slice(0, 50)
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
)

export default Recents
export async function getServerSideProps() {
	const ReviewsRecent = await getReviewsRecent()
	return {
		props: {
			reviewsRecent: ReviewsRecent,
		},
	}
}
