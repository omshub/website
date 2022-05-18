import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import CommentCard from '../../src/components/CommentCard'

// interface Reviews {
// 	semester_id: string
// 	rating: string
// 	difficulty: string
// 	workload: string
// 	body: string
// }

const ClassID: NextPage = () => {
	const router = useRouter()

	const [reviews, setReviews] = useState<any>()
	useEffect(() => {
		fetch('https://omshub-data.s3.amazonaws.com/data/omscentral_reviews.json')
			.then((response) => response.json())
			.then((reviews) => {
				const data = reviews.filter(
					(review: any) => review.course_id === router.query.classid
				)
				setReviews(data)
			})
			.catch((err) => console.log(err))
	}, [])

	return (
		<Container maxWidth='lg'>
			<>
				{reviews?.map((data: any, i: number) => (
					<CommentCard key={i} rating={data.rating}></CommentCard>
				))}
			</>
			<Box
				sx={{
					my: 4,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Typography variant='h4' component='h1' gutterBottom>
					You are looking at class.tsx
				</Typography>
			</Box>
		</Container>
	)
}

export default ClassID
