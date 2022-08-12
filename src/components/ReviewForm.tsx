import { addReview } from '@backend/dbOperations'
import { useAuth } from '@context/AuthContext'
import { Review } from '@globals/types'
import { Button, SelectChangeEvent, TextField } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ChangeEvent, SyntheticEvent, useState } from 'react'
const DynamicEditor = dynamic(() => import('@components/FormEditor'), {
	ssr: false,
})

const ReviewForm: any = (props: any) => {
	const { user } = useAuth()
	const { courseData, handleReviewModalClose } = props
	const yearRange = getYearRange()
	const [reviewValues, setReviewValues] = useState<Review>({
		reviewId: '',
		courseId: courseData.courseId,
		year: Number(`${new Date().getFullYear()}`),
		semesterId: 'sm',
		body: '',
		workload: 21,
		overall: 5,
		difficulty: 5,
		reviewerId: user?.uid,
		created: Date.now(),
		modified: Date.now(),
	})

	const handleChange =
		(prop: keyof Review) =>
		(
			event:
				| ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
				| SelectChangeEvent<string>
		) => {
			setReviewValues({ ...reviewValues, [prop]: event.target.value })
		}

	const handleRating =
		(prop: keyof Review) => (event: SyntheticEvent, value: number | null) => {
			setReviewValues({ ...reviewValues, [prop]: value })
		}

	const handleBody = (text: string) => {
		console.log(reviewValues)
		setReviewValues({ ...reviewValues, ['body']: text })
	}

	const handleSubmit = () => {
		const reviewId = `${courseData.courseId}-${reviewValues.year}-${reviewValues.semesterId}`
		setReviewValues({
			...reviewValues,
			['created']: Date.now(),
			['modified']: Date.now(),
			['reviewId']: reviewId,
		})
		addReview(reviewId, reviewValues)
	}
	return (
		<form>
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
						id='outlined-disabled'
						label='Course Name'
						defaultValue={courseData.courseId}
					/>
				</Grid>
				<Grid item xs={12} lg={12}>
					<FormControl fullWidth>
						<InputLabel id='test-select-label'>Semester</InputLabel>
						<Select
							label='Semester'
							value={reviewValues.semesterId}
							onChange={handleChange('semesterId')}
							defaultValue={reviewValues.semesterId}
						>
							<MenuItem value={'sp'}>Spring</MenuItem>
							<MenuItem value={'sm'}>Summer</MenuItem>
							<MenuItem value={'fa'}>Fall</MenuItem>
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12} lg={12}>
					<FormControl fullWidth>
						<InputLabel id='test-select-label'>Year</InputLabel>
						<Select
							label='Year'
							value={String(reviewValues.year)}
							onChange={handleChange('year')}
							defaultValue={String(reviewValues.year)}
						>
							{yearRange.map((year) => {
								return (
									<MenuItem key={year} value={year}>
										<>{year}</>
									</MenuItem>
								)
							})}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12} lg={12}>
					<TextField
						type='number'
						label='Workload Selection'
						defaultValue={'21'}
						onChange={handleChange('workload')}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>hr/wk</InputAdornment>
							),
						}}
						fullWidth
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6} textAlign='center'>
					<Typography component='legend'>Difficulty</Typography>
					<Rating
						name='Difficulty Selection'
						value={reviewValues.difficulty}
						onChange={handleRating('difficulty')}
						size='large'
					/>
				</Grid>
				<Grid item xs={12} md={6} lg={6} textAlign='center'>
					<Typography component='legend'>Overall</Typography>
					<Rating
						name='Overall Selection'
						value={reviewValues.overall}
						onChange={handleRating('overall')}
						size='large'
					/>
				</Grid>
				<Grid item xs={12} lg={12}>
					<Typography sx={{ mb: 1 }} component='legend'>
						Review
					</Typography>
					<DynamicEditor
						initialValue={`Type review here for ${courseData.courseId}: ${courseData.name}!`}
						onChange={handleBody}
					/>
				</Grid>
				<Button
					variant='outlined'
					sx={{ textAlign: 'right', my: 5 }}
					onClick={() => {
						handleSubmit()
						handleReviewModalClose()
					}}
				>
					Submit
				</Button>
			</Grid>
		</form>
	)
}

const getYearRange = () => {
	const currentYear = new Date().getFullYear()
	const programStart = 2013
	const limitYear = 5
	return Array.from(
		{ length: currentYear - programStart - limitYear },
		(_, i) => currentYear + i * -1
	)
}
export default ReviewForm
