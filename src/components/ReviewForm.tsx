import { addUser, getUser } from '@backend/dbOperations'
import backend from '@backend/index'
import { useAlert } from '@context/AlertContext'
import { useAuth } from '@context/AuthContext'
import { FirebaseAuthUser } from '@context/types'
import { SEMESTER_ID } from '@globals/constants'
import {
	Course,
	TNullableNumber,
	TNullableString,
	TRatingScale,
	TSemesterId,
	TUserReviews,
} from '@globals/types'
import { Button, TextField } from '@mui/material'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { mapSemesterIdToName, mapSemsterIdToTerm } from '@src/utilities'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
	Controller,
	DefaultValues,
	SubmitHandler,
	useForm,
} from 'react-hook-form'
const { addReview } = backend

const DynamicEditor = dynamic(() => import('@components/FormEditor'), {
	ssr: false,
})

interface ReviewFormInputs {
	year: TNullableNumber
	semesterId: TSemesterId | null
	body: string
	workload: TNullableNumber
	overall: TRatingScale | null
	difficulty: TRatingScale | null
}

type TPropsReviewForm = {
	courseData: Course
	handleReviewModalClose: () => void
}

const ReviewForm = ({
	courseData,
	handleReviewModalClose,
}: TPropsReviewForm) => {
	const authContext = useAuth()

	let user: FirebaseAuthUser | null = null

	if (authContext) {
		;({ user } = authContext)
	}

	const { setAlert } = useAlert()
	const [userReviews, setUserReviews] = useState<TUserReviews>({})
	const router = useRouter()

	const yearRange = getYearRange()

	const ReviewFormDefaults: DefaultValues<ReviewFormInputs> = {
		year: null,
		semesterId: null,
		body: ' ',
		workload: null,
		overall: null,
		difficulty: null,
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
		trigger,
		formState: { errors, isDirty, isValid },
	} = useForm<ReviewFormInputs>({
		mode: 'all',
		reValidateMode: 'onChange',
		defaultValues: ReviewFormDefaults,
		resolver: undefined,
		context: undefined,
		criteriaMode: 'firstError',
		shouldFocusError: true,
		shouldUnregister: true,
	})
	const onSubmit: SubmitHandler<ReviewFormInputs> = async (
		data: ReviewFormInputs
	) => {
		const isGoodSubmission = await trigger()

		const hasNonNullDataValues = Object.values(data).every(
			(x) => x != null && x != '' && x != 0 && x != undefined
		)

		if (
			isGoodSubmission &&
			courseData &&
			user &&
			user.uid &&
			hasNonNullDataValues
		) {
			const currentTime = Date.now()
			const reviewerId = user.uid
			const reviewId = `${courseData.courseId}-${data.year}-${
				mapSemsterIdToTerm[String(data.semesterId)]
			}-${currentTime}`
			const courseId = courseData.courseId
			const workload = Number(data.workload)
			const difficulty = Number(data.difficulty) as TRatingScale
			const overall = Number(data.overall) as TRatingScale
			const semesterId = data.semesterId as TSemesterId
			const year = Number(data.year)

			const reviewValues = {
				...data,
				courseId,
				reviewerId,
				reviewId,
				['created']: currentTime,
				['modified']: currentTime,
				semesterId,
				upvotes: 0,
				downvotes: 0,
				isLegacy: false,
				year,
				workload,
				difficulty,
				overall,
			}

			await addReview(user.uid, reviewId, reviewValues)

			setAlert({
				severity: 'success',
				text: `Successful review submission for ${courseData.courseId} for ${mapSemesterIdToName[semesterId]} ${data.year}`,
				variant: 'outlined',
			})

			handleReviewModalClose()
			router.reload()
		}
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
			})
		} else {
			setUserReviews({})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	return (
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
						required: true,
						validate: {
							validateYearGivenSemester: (year) => {
								if (year != getValues()?.year) {
									clearErrors(SEMESTER_ID)
								}

								return validateSemesterYear(getValues()?.semesterId, year)
							},
							validateNotTakenCourse: (year) => {
								clearErrors(SEMESTER_ID)

								return validateUserNotTakenCourse(
									userReviews,
									courseData.courseId,
									getValues()?.semesterId,
									year
								)
							},
						},
					}}
				></Controller>
				{errors.year && errors.year.type === 'validateYearGivenSemester' && (
					<Alert severity='error'>{`Please wait until ${
						fallbackDates[getValues()?.semesterId!]
					} to review ${courseData?.courseId} for semester ${
						mapSemesterIdToName[`${getValues()?.semesterId!}`]
					} ${getValues()['year']}`}</Alert>
				)}
				{errors.year && errors.year.type === 'validateNotTakenCourse' && (
					<Alert severity='error'>
						{`You've already reviewed this course for the semester and year!`}
					</Alert>
				)}
			</Grid>
			<Grid item xs={12} lg={12}>
				<InputLabel id='review-form-semester'>Semester</InputLabel>
				<Controller
					control={control}
					name={SEMESTER_ID}
					render={({ field }) => (
						<Select fullWidth {...field} error={Boolean(errors.semesterId)}>
							<MenuItem value={'sp'}>Spring</MenuItem>
							<MenuItem value={'sm'}>Summer</MenuItem>
							<MenuItem value={'fa'}>Fall</MenuItem>
						</Select>
					)}
					rules={{
						required: true,
						validate: {
							validateSemesterGivenYear: (semester) => {
								if (semester != getValues()?.semesterId) {
									clearErrors('year')
								}
								return validateSemesterYear(semester, getValues()['year'])
							},
							validateNotTakenCourse: (semester) => {
								clearErrors('year')
								return validateUserNotTakenCourse(
									userReviews,
									courseData.courseId,
									semester,
									getValues()?.year
								)
							},
						},
					}}
				></Controller>
				{errors.semesterId &&
					errors.semesterId.type === 'validateSemesterGivenYear' && (
						<Alert severity='error'>{`Please wait until ${
							fallbackDates[getValues()?.semesterId!]
						} to review ${courseData?.courseId} for semester ${
							mapSemesterIdToName[`${getValues()?.semesterId!}`]
						} ${getValues()?.year!}`}</Alert>
					)}
				{errors.semesterId &&
					errors.semesterId.type === 'validateNotTakenCourse' && (
						<Alert severity='error'>{`You've already reviewed this course for the semester and year!`}</Alert>
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
							defaultValue={undefined}
							type='number'
							onChange={(event: any) => {
								const double = parseFloat(event.target.value)
								if (double) {
									return field.onChange(double)
								}
								return
							}}
							InputProps={{
								inputMode: 'numeric',
								endAdornment: (
									<InputAdornment position='end'>hr/wk</InputAdornment>
								),
							}}
							fullWidth
						/>
					)}
					rules={{
						min: '1',
						max: '168',
						required: true,
						validate: {
							validateIsNumber: (value: TNullableNumber) =>
								value ? value > 0 : false,
						},
					}}
				></Controller>
				{errors.workload && errors.workload.type === 'min' && (
					<Alert severity='error'>
						{`Please enter a workload greater than 0`}
					</Alert>
				)}
				{errors.workload && errors.workload.type === 'max' && (
					<Alert severity='error'>
						{`Please enter a workload less than 168`}
					</Alert>
				)}
			</Grid>

			<Grid item xs={12} md={4} lg={4} textAlign='center'>
				<Typography component='legend'>Difficulty</Typography>
				<Controller
					control={control}
					name='difficulty'
					render={({ field }) => <Rating {...field} size='large' />}
					rules={{
						required: true,
						min: '1',
					}}
				></Controller>
			</Grid>
			<Grid item xs={12} md={4} lg={4} textAlign='center'>
				<Typography component='legend'>Overall</Typography>
				<Controller
					control={control}
					name='overall'
					render={({ field }) => (
						<Rating {...field} defaultValue={0} size='large' />
					)}
					rules={{
						required: true,
						min: '1',
					}}
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
							initialValue={ReviewFormDefaults.body || ' '}
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

const validateSemesterYear = (
	semester: TNullableString,
	year: TNullableNumber
) => {
	if (semester && year) {
		const currentYear = new Date().getFullYear()
		const semesterMap: any = {
			sp: new Date(`02/01/${currentYear}`),
			sm: new Date(`06/01/${currentYear}`),
			fa: new Date(`09/01/${currentYear}`),
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
}

const validateUserNotTakenCourse = (
	userReviews: TUserReviews | {},
	courseId: string,
	semester: TNullableString,
	year: TNullableNumber
) => {
	if (semester && year) {
		const objKey = `${courseId}-${year}-${mapSemsterIdToTerm[semester]}`
		return Object.keys(userReviews).find((key) => key.includes(objKey))
			? false
			: true
	}
}
export default ReviewForm
