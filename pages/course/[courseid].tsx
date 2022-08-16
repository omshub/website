import backend from '@backend/index'
import ReviewCard from '@components/ReviewCard'
import { DESC, REVIEW_ID } from '@globals/constants'
import { Course, TPayloadReviews } from '@globals/types'
import LinkIcon from '@mui/icons-material/Link'
import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import {
	mapPayloadToArray,
	mapRatingToColor,
	mapRatingToColorInverted,
	mapSemesterTermToEmoji,
	mapSemesterTermToName,
	roundNumber
} from '@src/utilities'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
type TActiveSemesters = {
	[semesterTerm: number]: boolean
}

const { getCourses, getReviews } = backend

interface CoursePageProps {
	courseData: Course
	courseTimeline: number[]
	courseYears: number[]
	defaultYear: number
	defaultSemester: string
	defaultSemesterToggles: boolean[]
	defaultReviews: TPayloadReviews
	numberOfReviews: number
}

const CourseId: NextPage<CoursePageProps> = ({
	courseData,
	courseTimeline,
	defaultYear,
	courseYears,
	defaultSemester,
	defaultSemesterToggles,
	defaultReviews,
}) => {
	const router = useRouter()
	const [loading, setLoading] = useState<boolean>(false)
	const [activeSemesters, setActiveSemesters] = useState<TActiveSemesters>(
		defaultSemesterToggles
	)
	const [selectedSemester, setSelectedSemester] =
		useState<string>(defaultSemester)
	const [selectedYear, setSelectedYear] = useState<number>(defaultYear)
	const [courseReviews, setCourseReviews] =
		useState<TPayloadReviews>(defaultReviews)
	const orientation = useMediaQuery('(min-width:600px)')

	const path = router.asPath.split('/')
	const courseId = path[path.length - 1]
	const { mutate } = useSWRConfig()
	const { data: course_reviews } = useSWR(
		`/course/${courseId}/${selectedYear}/${selectedSemester}`
	)
	const handleSemester = (
		event: React.MouseEvent<HTMLElement>,
		newSemester: string
	) => {
		setSelectedSemester(newSemester)
	}

	const handleYear = (
		event: React.MouseEvent<HTMLElement>,
		newYear: number
	) => {
		setSelectedYear(newYear)
	}
	useEffect(() => {
		if (courseData?.numReviews) {
			setLoading(false)
		}
	}, [courseData])
	useEffect(() => {
		if (course_reviews) {
			setCourseReviews(course_reviews)
		}
	}, [course_reviews])
	useEffect(() => {
		if (selectedYear && selectedSemester) {
			setLoading(true)
			const newAvailableSemesters: any = Object.keys(
				courseTimeline[selectedYear]
			)
			const newActiveSemesters: any = Object.keys(mapSemesterTermToName).reduce(
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
		mutate(
			selectedYear && selectedSemester
				? `/course/${courseId}/${selectedYear}/${selectedSemester}`
				: null,
			() => {
				return getReviews(
					courseId,
					String(selectedYear),
					String(selectedSemester)
				)
			}
		)
		setLoading(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedYear, selectedSemester])
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
					{courseData?.name}
				</Typography>
				{courseData && courseData?.url && (
					<Link href={courseData.url} target='_blank'>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<LinkIcon />
							<Typography
								variant='subtitle1'
								color='text.secondary'
							>
								{'Course Website'}
							</Typography>
						</Box>
					</Link>
				)}

				{courseData &&
					courseData?.avgWorkload &&
					courseData?.avgDifficulty &&
					courseData.avgOverall && (
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
								<Card
									variant='outlined'
									sx={{
										padding: '5 30',
										borderColor: mapRatingToColorInverted(
											Number(courseData?.avgDifficulty)
										),
									}}
								>
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
												color: mapRatingToColorInverted(
													Number(courseData?.avgDifficulty)
												),
											}}
										>
											{roundNumber(Number(courseData?.avgDifficulty), 1) +
												' /5'}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} lg={4}>
								<Card
									variant='outlined'
									sx={{
										margin: '10',
										padding: '5 30',
										borderColor: mapRatingToColor(
											Number(courseData.avgOverall)
										),
									}}
								>
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
												color: mapRatingToColor(Number(courseData.avgOverall)),
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
								{courseReviews && (
									<Grid container rowSpacing={5} sx={{ mt: 1 }}>
										{mapPayloadToArray(courseReviews, REVIEW_ID, DESC).map(
											(value: any) => {
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

interface PageProps {
	query: { courseid: string }
}
export async function getServerSideProps(context: PageProps) {
	const { courseid } = context.query
	const allCourseData = await getCourses()
	const currentCourseData = allCourseData[courseid]
	if (currentCourseData.numReviews) {
		const courseTimeline = currentCourseData.reviewsCountsByYearSem
		const courseYears = Object.keys(courseTimeline)
			.map((year) => Number(year))
			.reverse()
		const mostRecentYear = courseYears[0]
		const mostRecentYearSemesters = Object.keys(courseTimeline[mostRecentYear])
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
		const courseReviews = await getReviews(
			courseid,
			String(mostRecentYear),
			String(mostRecentSemester)
		)
		return {
			props: {
				courseData: currentCourseData,
				courseTimeline: courseTimeline,
				courseYears: courseYears,
				defaultYear: mostRecentYear,
				defaultSemester: mostRecentSemester,
				defaultSemesterToggles: activeSemesters,
				defaultReviews: courseReviews,
				numReviews: currentCourseData.numReviews,
			},
		}
	} else {
		return {
			props: {
				courseData: currentCourseData,
			},
		}
	}
}
