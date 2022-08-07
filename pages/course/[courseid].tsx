import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import ReviewCard from '../../src/components/ReviewCard'
import { mapSemesterTermToName } from '../../src/utilities'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { getReviews } from '../../firebase/dbOperations'
interface Review {
	semesterId: string
	rating: number
	difficulty: number
	workload: number
	overall: number
	body: string
	course_id: string
	created: string
}

interface CourseData {
	aliases: string[]
	avgDifficulty: number
	avgOverall: number
	avgStaffSupport: number
	avgWorkload: number
	courseId: string
	courseNumber: string
	departmentId: string
	id: number
	isDeprecated: boolean
	isFoundational: boolean
	name: string
	numReviews: number
	reviewsCountsByYearSem: object
	url: string
}


const CourseId: NextPage = () => {
	const router = useRouter()
	const [loading, setLoading] = useState<boolean>()
	const [courseTimeline, setCourseTimeLine] = useState<Object>({})
	const [courseYears, setCourseYears] = useState([])
	const [activeSemesters, setActiveSemesters] = useState({})
	const [reviews, setReviews] = useState<[Review]>()
	const [courseId, setCourseId] = useState<string>()
	const [selectedSemester, setSelectedSemester] = useState<string | null>()
	const [selectedYear, setSelectedYear] = useState<string | null>()

	const handleSemester = (
		event: React.MouseEvent<HTMLElement>,
		newSemester: string | null
	) => {
		setSelectedSemester(newSemester)
	}

	const handleYear = (
		event: React.MouseEvent<HTMLElement>,
		newYear: string | null
	) => {
		setSelectedYear(newYear)
	}
	useEffect(() => {
		setLoading(true)
		if (router.isReady) {
			if (selectedYear == undefined || selectedSemester == undefined) {
				const courseData:CourseData = JSON.parse(router.query?.courseData)
				const courseTimeline = courseData?.reviewsCountsByYearSem
				const courseYears = Object.keys(courseTimeline)
				const mostRecentYear = courseYears[courseYears.length - 1]
				const mostRecentYearSemesters = Object.keys(
					courseTimeline[mostRecentYear]
				)
				const mostRecentSemester =
					mostRecentYearSemesters[mostRecentYearSemesters.length - 1]
				const availableSemesters = Object.keys(courseTimeline[mostRecentYear])
				const activeSemesters = Object.keys(mapSemesterTermToName).reduce(
					(attrs, key) => ({
						...attrs,
						[key]: !(availableSemesters.indexOf(key.toString()) > -1),
					}),
					{}
				)

				setCourseTimeLine(courseTimeline)
				setCourseYears(courseYears)
				setSelectedSemester(mostRecentSemester)
				setSelectedYear(mostRecentYear)
				setCourseId(courseData.courseId)
				setActiveSemesters(activeSemesters)
			} else {
				const newAvailableSemesters = Object.keys(courseTimeline[selectedYear])
				const newActiveSemesters = Object.keys(mapSemesterTermToName).reduce(
					(attrs, key) => ({
						...attrs,
						[key]: !(newAvailableSemesters.indexOf(key.toString()) > -1),
					}),
					{}
				)
				setActiveSemesters(newActiveSemesters)
			}

			getReviews(courseId, selectedYear, selectedSemester)
				.then((reviews) => {
					setReviews(reviews)
					setLoading(false)
				})
				.catch((err) => {
					setLoading(false)
					console.log(err)
				})
		}
	}, [router.query, router.isReady, selectedYear, selectedSemester])

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
				{loading ? (
					<Box sx={{ display: 'flex', m: 10 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						<Grid>
							<ToggleButtonGroup
								value={selectedSemester}
								onChange={handleSemester}
								exclusive={true}
								aria-label='year selection'
								size='small'
								sx={{ margin: '10px', width: `100%` }}
							>
								{activeSemesters &&
									Object.entries(activeSemesters).map(([key, value]:[number,boolean], index) => {
										return (
											<ToggleButton value={key} key={index} disabled={value}>
												{mapSemesterTermToName[key]}
											</ToggleButton>
										)
									})}
							</ToggleButtonGroup>
							<ToggleButtonGroup
								value={selectedYear}
								onChange={handleYear}
								exclusive={true}
								aria-label='year selection'
								size='small'
								sx={{ margin: '10px', width: `100%` }}
							>
								{courseYears &&
									courseYears.map((year: number, index: number) => {
										return (
											<ToggleButton value={year} key={index}>
												{year}
											</ToggleButton>
										)
									})}
							</ToggleButtonGroup>
						</Grid>
						<Grid container spacing={3} sx={{ margin: '10px 0' }}>
							{reviews && (
								<>
									{Object.values(reviews).map((value, index) => {
										return (
											<Grid sx={{ width: `100%` }} key={index} item>
												<ReviewCard
													body={value.body}
													overall={value.overall}
													difficulty={value.difficulty}
													workload={value.workload}
													semesterId={value.semesterId}
													created={value.created}
												></ReviewCard>
											</Grid>
										)
									})}
								</>
							)}
						</Grid>
					</>
				)}
			</Box>
		</Container>
	)
}
{
	/* <Grid sx={{ width: `100%` }} item>
							
							</Grid> */
}
{
	/* <CommentCard
	body={value.body}
	rating={value.overall}
	difficulty={value.difficulty}
	workload={value.workload}
	semester={value.semesterId}
	created={value.created}
></CommentCard> */
}

export default CourseId
