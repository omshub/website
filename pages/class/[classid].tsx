import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CommentCard from '../../src/components/CommentCard'

const ClassID: NextPage = () => {
	const router = useRouter()

	const [reviews, setReviews] = useState<any>()
	useEffect(() => {
		if (router.isReady) {
			fetch(`http://localhost:4000/reviews?id=${router.query.classid}`)
				.then((response) => response.json())
				.then((reviews) => setReviews(reviews))
				.catch((err) => console.log(err))
		}
	}, [router.isReady])

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
				<Typography variant='h2' color='text.secondary' gutterBottom>
					{router.query.title}
				</Typography>
				<Grid container spacing={3}>
					{reviews?.map((data: any, i: number) => (
						<Grid key={i} item>
							<CommentCard
								body={data.body}
								rating={data.rating}
								difficulty={data.difficulty}
								workload={data.workload}
								semester={data.semester_id}
							></CommentCard>
						</Grid>
					))}
				</Grid>
			</Box>
		</Container>
	)
}

export default ClassID
