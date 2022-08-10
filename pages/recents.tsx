import { getReviewsRecent50 } from '@backend/dbOperations'
import ReviewCard from '@components/ReviewCard'
import { Review } from '@globals/types'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'

interface RecentsProps {
	recent50Reviews: Review[]
}

const Recents: NextPage<RecentsProps> = ({ recent50Reviews }) => {
	return (
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
				{!recent50Reviews ? (
					<Box sx={{ display: 'flex', m: 10 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{recent50Reviews && (
							<Grid container spacing={3} sx={{ margin: '10px 0' }}>
								{recent50Reviews.slice(0, 50).map((value: Review) => {
									return (
										<Grid sx={{ width: `100%` }} key={value.reviewId} item>
											<ReviewCard {...value}></ReviewCard>
										</Grid>
									)
								})}
							</Grid>
						)}
					</>
				)}
			</Box>
		</Container>
	)
}

export default Recents
export async function getServerSideProps() {
	const ReviewsRecent50 = await getReviewsRecent50()
	return {
		props: {
			recent50Reviews: ReviewsRecent50,
		},
	}
}
