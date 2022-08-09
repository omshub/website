import { getReviewsRecent50 } from '@backend/dbOperations'
import ReviewCard from '@components/ReviewCard'
import { Review } from '@globals/types'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'

const Recents: NextPage = () => {
	const [loading, setLoading] = useState<boolean>()
	const [reviews, setReviews] = useState<Review[]>([])

	useEffect(() => {
		setLoading(true)

		getReviewsRecent50()
			.then((reviews) => {
				if (reviews) {
					setReviews(reviews)
					setLoading(false)
				}
			})
			.catch((err: any) => {
				console.log(err)
			})
	}, [])

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
				{loading ? (
					<Box sx={{ display: 'flex', m: 10 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{reviews && (
							<Grid container spacing={3} sx={{ margin: '10px 0' }}>
								{reviews.slice(0, 50).map((value: Review) => {
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
