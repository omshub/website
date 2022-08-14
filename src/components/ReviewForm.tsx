import { useAuth } from '@context/AuthContext'
import { Review } from '@globals/types'
import { Button, TextField } from '@mui/material'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import {
	Controller,
	DefaultValues,
	SubmitHandler,
	useForm,
} from 'react-hook-form'

const DynamicEditor = dynamic(() => import('@components/FormEditor'), {
	ssr: false,
})

const ReviewForm: any = (props: any) => {
	const { user } = useAuth()
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
		staffSupport: 5,
		reviewerId: user?.uid,
		created: Date.now(),
		modified: Date.now(),
	}
	const {
		control,
		handleSubmit,
		getValues,
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
		console.log(reviewValues)
		handleReviewModalClose()
		// addReview(reviewId, reviewValues)
	}

	return (
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
							<Select fullWidth {...field} error={Boolean(errors.semesterId)}>
								<MenuItem value={'sp'}>Spring</MenuItem>
								<MenuItem value={'sm'}>Summer</MenuItem>
								<MenuItem value={'fa'}>Fall</MenuItem>
							</Select>
						)}
						rules={{
							validate: {
								validateSemesterGivenYear: (value) => {
									return validateSemesterYear(value, getValues()['year'])
								},
							},
						}}
					></Controller>
					{errors.semesterId && (
						<Alert severity='error'>Error for Semester</Alert>
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
								validateYearGivenSemester: (value) => {
									return validateSemesterYear(getValues()['semesterId'], value)
								},
							},
						}}
					></Controller>
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
					<Typography component='legend'>Staff Support</Typography>
					<Controller
						control={control}
						name='staffSupport'
						render={({ field }) => <Rating {...field} size='large' />}
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
	if (new Date(year) < new Date()) {
		return true
	}
	if (new Date() > compareDate) {
		return true
	}
	return false
}

export default ReviewForm
