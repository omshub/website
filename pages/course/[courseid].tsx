import ReviewCard from '@components/ReviewCard'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import {
	mapColorPalette,
	mapColorPaletteInverted,
	mapPayloadToArray,
	mapSemesterTermToEmoji,
	mapSemesterTermToName,
	roundNumber,
} from '@src/utilities'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { getCourses, getReviews } from '@backend/dbOperations'
import { DESC, REVIEW_ID } from '@globals/constants'
import {
	Course,
	Review,
	TKeyMap,
	TNullableNumber,
	TNullableString,
	TPayloadCourses,
	TPayloadReviews,
} from '@globals/types'
import { useMediaQuery } from '@mui/material'

type TActiveSemesters = {
	[semesterTerm: number]: boolean
}

const CourseId: NextPage = () => {
	const router = useRouter()

	const [loading, setLoading] = useState<boolean>()
	const [courseTimeline, setCourseTimeLine] = useState<TKeyMap>({})
	const [courseYears, setCourseYears] = useState<number[]>([])
	const [activeSemesters, setActiveSemesters] = useState<TActiveSemesters>({})
	const [reviews, setReviews] = useState<TPayloadReviews>({})
	const [courseId, setCourseId] = useState<string | undefined>()
	const [selectedSemester, setSelectedSemester] = useState<TNullableString>()
	const [selectedYear, setSelectedYear] = useState<TNullableNumber>()
	const [courseData, setCourseData] = useState<Course>()
	const [payloadCourses, setPayloadCourses] = useState<TPayloadCourses>()

	const orientation = useMediaQuery('(min-width:600px)')

	const handleSemester = (
		event: React.MouseEvent<HTMLElement>,
		newSemester: TNullableString
	) => {
		setSelectedSemester(newSemester)
	}

	const handleYear = (
		event: React.MouseEvent<HTMLElement>,
		newYear: TNullableNumber
	) => {
		setSelectedYear(newYear)
	}

	useEffect(() => {
		setLoading(true)

		const path = router.asPath.split('/')
		const courseId = path[path.length - 1]

		const hasRouterQuerygAnomaly = courseId === '[courseid]'
		if (courseId && !hasRouterQuerygAnomaly) {
			getCourses()
				.then((payloadCourses) => {
					setPayloadCourses(payloadCourses)
					setCourseId(courseId)
					setCourseData(payloadCourses[courseId])
					setLoading(false)
				})
				.catch((err: any) => {
					setLoading(false)
					console.log(err)
				})
		}
	}, [router.asPath])

	useEffect(() => {
		setLoading(true)
		if (router.isReady && payloadCourses && courseId) {
			const course = payloadCourses[courseId]
			setCourseData(course)
			const numReviews = course?.numReviews

			if (!(selectedYear && selectedSemester) && numReviews && courseData) {
				const courseTimeline = course.reviewsCountsByYearSem
				const courseYears = Object.keys(courseTimeline)
					.map((year) => Number(year))
					.reverse()
				const mostRecentYear = courseYears[0]
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

				setCourseData(courseData)
				setCourseTimeLine(courseTimeline)
				setCourseYears(courseYears)
				setSelectedSemester(mostRecentSemester)
				setSelectedYear(mostRecentYear)
				setCourseId(course.courseId)
				setActiveSemesters(activeSemesters)
			} else if (selectedYear && selectedSemester) {
				const newAvailableSemesters: any = Object.keys(
					courseTimeline[selectedYear]
				)
				const newActiveSemesters: any = Object.keys(
					mapSemesterTermToName
				).reduce(
					(attrs, key) => ({
						...attrs,
						[key]: !(newAvailableSemesters.indexOf(key.toString()) > -1),
					}),
					{}
				)
				if (newActiveSemesters[selectedSemester]) {
					setSelectedSemester(
						newAvailableSemesters[newAvailableSemesters.length - 1]
					)
				}
				setActiveSemesters(newActiveSemesters)
			}

			if (selectedYear && selectedSemester) {
				getReviews(courseId, String(selectedYear), selectedSemester)
					.then((reviews) => {
						if (reviews) {
							setReviews(reviews)
							setLoading(false)
						}
					})
					.catch((err) => {
						setLoading(false)
						console.log(err)
					})
			}
		} else if (router.isReady && !courseData?.numReviews) {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, courseId, selectedYear, selectedSemester])

	const hasData = payloadCourses && reviews && courseData && courseId
	return !hasData ? (
		<></>
	) : (
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
					{courseData?.name}
				</Typography>
				{courseData && (
					<Grid
						sx={{ my: 1 }}
						container
						direction='row'
						spacing={4}
						justifyContent='center'
					>
						<Grid item xs={12} lg={4}>
							<Card variant='outlined' sx={{ padding: '5 30' }}>
								<CardContent>
									<Typography
										sx={{ fontSize: 14 }}
										color='text.secondary'
										gutterBottom
									>
										{`Average Workload`}
									</Typography>
									<Typography variant='h5'>
										{roundNumber(Number(courseData?.avgWorkload), 1) +
											' hrs/wk'}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} lg={4}>
							<Card variant='outlined' sx={{ padding: '5 30' }}>
								<CardContent>
									<Typography
										sx={{ fontSize: 14 }}
										color='text.secondary'
										gutterBottom
									>
										{`Average Difficulty`}
									</Typography>
									<Typography
										variant='h5'
										sx={{
											color:
												mapColorPaletteInverted[
													Number(courseData?.avgDifficulty)
												],
											border:
												mapColorPaletteInverted[
													Number(courseData?.avgDifficulty)
												],
										}}
									>
										{roundNumber(Number(courseData?.avgDifficulty), 1) + ' /5'}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={12} lg={4}>
							<Card variant='outlined' sx={{ margin: '10', padding: '5 30' }}>
								<CardContent>
									<Typography
										sx={{ fontSize: 14 }}
										color='text.secondary'
										gutterBottom
									>
										{`Average Overall`}
									</Typography>
									<Typography
										variant='h5'
										sx={{
											color: mapColorPalette[Number(courseData.avgDifficulty)],
											border: mapColorPalette[Number(courseData.avgDifficulty)],
										}}
									>
										{roundNumber(Number(courseData.avgOverall), 1) + ' /5'}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				)}
				<Grid>
					<ToggleButtonGroup
						value={selectedSemester}
						onChange={handleSemester}
						exclusive={true}
						aria-label='year selection'
						size='large'
						orientation={`${orientation ? `horizontal` : `vertical`}`}
						sx={{ my: 2, width: `100%`, justifyContent: 'center' }}
					>
						{activeSemesters &&
							Object.entries(activeSemesters).map(
								([key, value]: [string, boolean], index: number) => {
									return (
										<ToggleButton
											value={key}
											key={index}
											disabled={Boolean(value) || selectedSemester === key}
										>
											<Typography variant='body1'>
												{mapSemesterTermToName[Number(key)]}{' '}
												{mapSemesterTermToEmoji[Number(key)]}
											</Typography>
										</ToggleButton>
									)
								}
							)}
					</ToggleButtonGroup>
					<ToggleButtonGroup
						value={selectedYear}
						onChange={handleYear}
						exclusive={true}
						aria-label='year selection'
						size='large'
						orientation={`${orientation ? `horizontal` : `vertical`}`}
						sx={{ my: 2, width: `100%`, justifyContent: 'center' }}
					>
						{courseYears &&
							courseYears.map((year: number, index: number) => {
								return (
									<ToggleButton
										value={year}
										key={index}
										disabled={selectedYear === year}
									>
										<Typography variant='body2'>{year}</Typography>
									</ToggleButton>
								)
							})}
					</ToggleButtonGroup>
				</Grid>
				{loading ? (
					<Box sx={{ display: 'flex', m: 10 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{courseData?.numReviews ? (
							<>
								{reviews && (
									<Grid container rowSpacing={5} sx={{ mt: 1 }}>
										{mapPayloadToArray(reviews, REVIEW_ID, DESC).map(
											(value: Review) => {
												return (
													<Grid
														sx={{ width: `100%` }}
														key={value.reviewId}
														item
													>
														<ReviewCard {...value}></ReviewCard>
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
			</Box>
		</Container>
	)
}

export default CourseId
