import ReviewCard from '@components/ReviewCard'
import { useAuth } from '@context/AuthContext'
import { FirebaseAuthUser } from '@context/types'
import { DESC, REVIEW_ID } from '@globals/constants'
import { TUserReviews } from '@globals/types'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { mapPayloadToArray } from '@src/utilities'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'

import { addUser, getUser } from '@backend/dbOperations'

const UserReviews: NextPage = () => {
	const [loading, setLoading] = useState<boolean>(true)

	const authContext = useAuth()

	const [userReviews, setUserReviews] = useState<TUserReviews>({})

	let user: FirebaseAuthUser | null = null
	if (authContext) {
		;({ user } = authContext)
	}

	useEffect(() => {
		if (user) {
			getUser(user.uid).then((results) => {
				if (results.userId) {
					setUserReviews(results['reviews'])
				} else if (user && user.uid) {
					addUser(user.uid)
					setUserReviews({})
				}
				setLoading(false)
			})
		} else {
			setUserReviews({})
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

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
				<>
					<Typography variant='h4' color='text.secondary' gutterBottom>
						{`My Reviews`}
					</Typography>
					{loading ? (
						<Box sx={{ display: 'flex', m: 10 }}>
							<CircularProgress />
						</Box>
					) : (
						<>
							{Object.keys(userReviews)?.length ? (
								<>
									{userReviews && (
										<Grid container rowSpacing={5} sx={{ mt: 1 }}>
											{mapPayloadToArray(userReviews, REVIEW_ID, DESC).map(
												(value: any) => {
													return (
														<Grid
															sx={{ width: `100%` }}
															key={value.reviewId}
															item
														>
															<ReviewCard
																{...value}
																isUserReviewsView={true}
															></ReviewCard>
														</Grid>
													)
												}
											)}
										</Grid>
									)}
								</>
							) : (
								<>
									<Typography
										variant='h3'
										color='text.secondary'
										style={{ textAlign: 'center' }}
										gutterBottom
									>
										{`Aww shucks no reviews 🥲`}
									</Typography>
								</>
							)}
						</>
					)}
				</>
			</Box>
		</Container>
	)
}

export default UserReviews