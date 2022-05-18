import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import ClassCard from '../src/components/ClassCard'

interface ClassData {
	number: string
	aliases: string
	department: string
	deprecated: boolean
	foundational: string
	name: string
	link: string
	course_id: string
}

const Home: NextPage = () => {
	const [loading, setLoading] = useState<boolean>()
	const [classes, setClasses] = useState<[ClassData]>()

	useEffect(() => {
		setLoading(true)
		fetch('http://localhost:4000/classes')
			.then((res) => res.json())
			.then((classes) => {
				setLoading(false)
				setClasses(classes)
			})
			.catch((err) => {
				setLoading(false)
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
				<Typography variant='h4' component='h1' sx={{ mb: 10 }} gutterBottom>
					OMSCS Courses
				</Typography>
				{loading && (
					<Box sx={{ display: 'flex', m: 10 }}>
						<CircularProgress />
					</Box>
				)}
				<Grid container spacing={3}>
					{classes?.map((data, i) => (
						<Grid key={i} item>
							<ClassCard
								title={data.name}
								classNumber={data.number}
								acronym={
									JSON.parse(data.aliases).length > 0
										? JSON.parse(data.aliases).toString().split(',').join(', ')
										: ''
								}
								image='/static/omshub-stub.jpg'
								isFoundational={data.foundational === 'true'}
								department={data.department}
								link={data.link}
								classId={data.course_id}
							></ClassCard>
						</Grid>
					))}
				</Grid>
			</Box>
		</Container>
	)
}

export default Home
