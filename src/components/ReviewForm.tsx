import backend from '@backend/index'
import { useAuth } from '@context/AuthContext'
import { Review, TUserReviews } from '@globals/types'
import { Button, Skeleton, TextField } from '@mui/material'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { mapSemesterIdToName } from '@src/utilities'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import {
	Controller,
	DefaultValues,
	SubmitHandler,
	useForm
} from 'react-hook-form'
const { addReview, getUser } = backend

const DynamicEditor = dynamic(() => import('@components/FormEditor'), {
	ssr: false,
})

const ReviewForm: any = (props: any) => {
	const { user } = useAuth()
	const [userReviews, setUserReviews] = useState<TUserReviews>()
	const [loading, setLoading] = useState<Boolean>()
	const { courseData, handleReviewModalClose } = props
	const yearRange = getYearRange()

	const ReviewFormDefaults: DefaultValues<Review> = {
		reviewId: '',
		courseId: courseData.courseId,
		year: Number(`${new Date().getFullYear()}`),
		semesterId: 'sm',
		body: ` `,
		workload: 10,
		overall: 5,
		difficulty: 5,
		reviewerId: user?.uid,
		created: Date.now(),
		modified: Date.now(),
	}

	const fallbackDates = {
		sp: 'Feb 01',
		sm: 'June 01',
		fa: 'Sept 01',
	}
	const {
		control,
		handleSubmit,
		getValues,
		clearErrors,
		formState: { errors, isDirty, isValid },
	} = useForm<Review>({
		mode: 'all',
		reValidateMode: 'onChange',
		defaultValues: ReviewFormDefaults,
		resolver: undefined,
		context: undefined,
		criteriaMode: 'firstError',
		shouldFocusError: true,
		shouldUnregister: false,
	})
	const onSubmit: SubmitHandler<Review> = (data: Review) => {
		const reviewId = `${courseData.courseId}-${data.year}-${data.semesterId}`
		const reviewValues = {
			...data,
			['reviewId']: reviewId,
			['created']: Date.now(),
			['modified']: Date.now(),
		}

		handleReviewModalClose()
		addReview(user?.uid, reviewId, reviewValues)
	}
	useEffect(() => {
		setLoading(true)
		getUser(user?.uid).then((result) => {
			setUserReviews(result['reviews'])
			setLoading(false)
		})
	}, [])

	return (
		<>
			{loading ? (
				<Skeleton animation='wave' />
			) : (
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid
						container
						rowSpacing={4}
						sx={{ px: 5, py: 10 }}
						justifyContent='center'
					>
						<Typography variant='h6'>{`Add Review for ${courseData.courseId}: ${courseData.name}`}</Typography>
						<Grid item xs={12} lg={12}>
							<TextField
								disabled
								fullWidth
								id='review-form-course-name'
								label='Course Name'
								defaultValue={courseData.courseId}
							/>
						</Grid>
						<Grid item xs={12} lg={12}>
							<InputLabel id='review-form-semester'>Semester</InputLabel>
							<Controller
								control={control}
								name='semesterId'
								render={({ field }) => (
									<Select
										fullWidth
										{...field}
										error={Boolean(errors.semesterId)}
									>
										<MenuItem value={'sp'}>Spring</MenuItem>
										<MenuItem value={'sm'}>Summer</MenuItem>
										<MenuItem value={'fa'}>Fall</MenuItem>
									</Select>
								)}
								rules={{
									validate: {
										validateSemesterGivenYear: (semester) => {
											clearErrors('year')
											return validateSemesterYear(semester, getValues()['year'])
										},
										validateNotTakenCourse: (semester) => {
											return validateUserNotTakenCourse(
												userReviews,
												courseData.courseId,
												semester,
												getValues()['year']
											)
										},
									},
								}}
							></Controller>
							{errors.semesterId &&
								errors.semesterId.type === 'validateSemesterGivenYear' && (
									<Alert severity='error'>{`Please wait until ${
										fallbackDates[getValues()['semesterId']]
									} to review ${courseData?.courseId} for semester ${
										mapSemesterIdToName[`${getValues()['semesterId']}`]
									} ${getValues()['year']}`}</Alert>
								)}
							{errors.semesterId &&
								errors.semesterId.type === 'validateNotTakenCourse' && (
									<Alert severity='error'>{`You've already reviewed this course for the semester and year!`}</Alert>
								)}
						</Grid>
						<Grid item xs={12} lg={12}>
							<InputLabel id='review-form-year'>Year</InputLabel>
							<Controller
								control={control}
								name='year'
								render={({ field }) => (
									<Select {...field} fullWidth error={Boolean(errors.year)}>
										{yearRange.map((year) => {
											return (
												<MenuItem key={year} value={year}>
													<>{year}</>
												</MenuItem>
											)
										})}
									</Select>
								)}
								rules={{
									validate: {
										validateYearGivenSemester: (year) => {
											clearErrors('semesterId')
											return validateSemesterYear(
												getValues()['semesterId'],
												year
											)
										},
										validateNotTakenCourse: (year) => {
											return validateUserNotTakenCourse(
												userReviews,
												courseData.courseId,
												getValues()['semesterId'],
												year
											)
										},
									},
								}}
							></Controller>
							{errors.year &&
								errors.year.type === 'validateYearGivenSemester' && (
									<Alert severity='error'>{`Please wait until ${
										fallbackDates[getValues()['semesterId']]
									} to review ${courseData?.courseId} for semester ${
										mapSemesterIdToName[`${getValues()['semesterId']}`]
									} ${getValues()['year']}`}</Alert>
								)}
							{errors.year && errors.year.type === 'validateNotTakenCourse' && (
								<Alert severity='error'>
									{`You've already reviewed this course for the semester and year!`}
								</Alert>
							)}
						</Grid>
						<Grid item xs={12} lg={12}>
							<InputLabel id='review-form-workload'>Workload</InputLabel>
							<Controller
								control={control}
								name='workload'
								render={({ field }) => (
									<TextField
										{...field}
										InputProps={{
											endAdornment: (
												<InputAdornment position='end'>hr/wk</InputAdornment>
											),
										}}
										fullWidth
									/>
								)}
							></Controller>
						</Grid>
						<Grid item xs={12} md={4} lg={4} textAlign='center'>
							<Typography component='legend'>Difficulty</Typography>
							<Controller
								control={control}
								name='difficulty'
								render={({ field }) => <Rating {...field} size='large' />}
							></Controller>
						</Grid>
						<Grid item xs={12} md={4} lg={4} textAlign='center'>
							<Typography component='legend'>Overall</Typography>
							<Controller
								control={control}
								name='overall'
								render={({ field }) => <Rating {...field} size='large' />}
							></Controller>
						</Grid>
						<Grid item xs={12} lg={12}>
							<Typography sx={{ mb: 1 }} component='legend'>
								Review
							</Typography>
							<Controller
								control={control}
								name='body'
								render={({ field }) => (
									<DynamicEditor
										{...field}
										initialValue={String(ReviewFormDefaults.body)}
									/>
								)}
							></Controller>
						</Grid>
						<Grid textAlign='center' item xs={12} lg={12}>
							<Button
								disabled={!isDirty || !isValid}
								variant='contained'
								onClick={handleSubmit(onSubmit)}
							>
								Submit
							</Button>
						</Grid>
					</Grid>
				</form>
			)}
		</>
	)
}

const getYearRange = () => {
	const currentYear = new Date().getFullYear()
	const programStart = 2013
	const limitYear = 5
	return Array.from(
		{ length: currentYear - programStart - limitYear + 1 },
		(_, i) => currentYear + i * -1
	)
}

const validateSemesterYear = (semester: string, year: number) => {
	const semesterMap: any = {
		sp: new Date('02-01-' + new Date().getFullYear()),
		sm: new Date('06-01-' + new Date().getFullYear()),
		fa: new Date('09-01-' + new Date().getFullYear()),
	}
	const compareDate = semesterMap[semester]
	if (year < new Date().getFullYear()) {
		return true
	}
	if (new Date() < compareDate) {
		return false
	}
	return true
}

const validateUserNotTakenCourse = (
	userReviews: TUserReviews | undefined,
	courseId: string,
	semester: string,
	year: number
) => {
	const objKey = `${courseId}-${year}-${semester}`
	if (typeof userReviews !== 'undefined') {
		return !(objKey in userReviews)
	}
}
export default ReviewForm
