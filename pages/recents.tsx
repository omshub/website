import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { Review } from '@globals/types'
import Container from '@mui/material/Container'
import { getReviewsRecent50 } from '@backend/dbOperations'
import Grid from '@mui/material/Grid'
import ReviewCard from '@components/ReviewCard'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Link from '@src/Link'

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
		<Container>
			<Box maxWidth='sm'>
				<Button variant='contained' component={Link} noLinkStyle href='/'>
					Return to the home page
				</Button>
			</Box>
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
		</Container>
	)
}

export default Recents
