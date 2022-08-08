import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import ReviewCard from '../../src/components/ReviewCard'
import {
	mapColorPalette,
	mapColorPaletteInverted,
	mapSemesterTermToEmoji,
	mapSemesterTermToName,
	mapPayloadToArray,
	roundNumber,
} from '../../src/utilities'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CardContent from '@mui/material/CardContent'
import Card from '@mui/material/Card'

import {
	TNullableNumber,
	TNullableString,
	TKeyMap,
	Course,
	TPayloadReviews,
	Review,
} from '../../globals/types'
import { getReviews } from '../../firebase/dbOperations'
import { REVIEW_ID, DESC } from '../../globals/constants'

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
		if (router.isReady && Number(router?.query?.numReviews)) {
			if (!(selectedYear && selectedSemester)) {
				const parseArg: any = router.query?.courseData
				const courseData: Course = JSON.parse(parseArg)
				const courseTimeline = courseData?.reviewsCountsByYearSem
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
				setCourseId(courseData.courseId)
				setActiveSemesters(activeSemesters)
			} else {
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

			if (courseId && selectedYear && selectedSemester) {
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
		} else if (router.isReady && !Number(router.query?.numReviews)) {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
						{courseData && (
							<Grid container sx={{ justifyContent: 'center' }}>
								<Card variant='outlined' sx={{ padding: '5px 30px' }}>
									<CardContent>
										<Typography
											sx={{ fontSize: 14 }}
											color='text.secondary'
											gutterBottom
										>
											{`Average Workload`}
										</Typography>
										<Typography variant='h5' component='div'>
											{roundNumber(Number(courseData?.avgWorkload), 1) +
												' hrs/wk'}
										</Typography>
									</CardContent>
								</Card>
								<Card variant='outlined' sx={{ padding: '5px 30px' }}>
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
											component='div'
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
											{roundNumber(Number(courseData?.avgDifficulty), 1) +
												' /5'}
										</Typography>
									</CardContent>
								</Card>
								<Card variant='outlined' sx={{ padding: '5px 30px' }}>
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
											component='div'
											sx={{
												color:
													mapColorPalette[Number(courseData.avgDifficulty)],
												border:
													mapColorPalette[Number(courseData.avgDifficulty)],
											}}
										>
											{roundNumber(Number(courseData.avgOverall), 1) + ' /5'}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						)}
						<Grid>
							<ToggleButtonGroup
								value={selectedSemester}
								onChange={handleSemester}
								exclusive={true}
								aria-label='year selection'
								size='large'
								sx={{ margin: '10px', width: `100%`, justifyContent: 'center' }}
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
													<Typography variant='h6' gutterBottom component='div'>
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
								sx={{ margin: '10px', width: `100%`, justifyContent: 'center' }}
							>
								{courseYears &&
									courseYears.map((year: number, index: number) => {
										return (
											<ToggleButton
												value={year}
												key={index}
												disabled={selectedYear === year}
											>
												<Typography variant='h6' gutterBottom component='div'>
													{year}
												</Typography>
											</ToggleButton>
										)
									})}
							</ToggleButtonGroup>
						</Grid>

						{Number(router.query?.numReviews) ? (
							<>
								{reviews && (
									<Grid container spacing={3} sx={{ margin: '10px 0' }}>
										{mapPayloadToArray(reviews, REVIEW_ID, DESC).map(
											(value: Review) => {
												return (
													<Grid
														sx={{ width: `100%` }}
														key={value.reviewId}
														item
													>
														<ReviewCard
															body={value.body}
															overall={value.overall}
															difficulty={value.difficulty}
															workload={value.workload}
															semesterId={value.semesterId}
															created={value.created}
															year={value.year}
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
			</Box>
		</Container>
	)
}

export default CourseId
