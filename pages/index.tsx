import { getCourses } from '@backend/dbOperations'
import { courseFields } from '@globals/constants'
import { Course } from '@globals/types'
import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import {
	DataGrid,
	GridColDef,
	GridRenderCellParams,
	GridToolbar
} from '@mui/x-data-grid'
import Link from '@src/Link'
import { mapPayloadToArray, roundNumber } from '@src/utilities'
import type { NextPage } from 'next'
import useSWR from 'swr'
const Home: NextPage = () => {
	const isDesktop = useMediaQuery('(min-width:600px)')
	const { data, error } = useSWR('/courses', getCourses)
	const coursesArray: Course[] = mapPayloadToArray(data, courseFields.NAME)
	const courses = coursesArray.map((data, i) => ({ ...data, id: i }))

	const columns: GridColDef[] = [
		{
			field: courseFields.NAME,
			headerName: 'Course Name',
			flex: isDesktop ? 1 : 0,
			minWidth: isDesktop ? 50 : 300,
			renderCell: (params: GridRenderCellParams) => (
				<Link
					href="/course/[courseid]"
					as={`/course/${params.row.courseId}`}
					sx={{
						textDecoration: 'unset',
						'&:hover': { textDecoration: 'underline' },
					}}
				>
					{params.row.name}
				</Link>
			),
		},
		{
			field: courseFields.COURSE_ID,
			headerName: 'Course ID',
			flex: isDesktop ? 0.5 : 0,
		},
		{
			field: courseFields.AVG_DIFFICULTY,
			headerName: 'Difficulty (out of 5)',
			flex: isDesktop ? 0.5 : 0,
			valueGetter: (params: any) => roundNumber(params.row.avgDifficulty, 1),
			type: 'number',
		},
		{
			field: courseFields.AVG_WORKLOAD,
			headerName: 'Workload (hrs/wk)',
			flex: isDesktop ? 0.5 : 0,
			valueGetter: (params: any) => roundNumber(params.row.avgWorkload, 1),
			type: 'number',
		},
		{
			field: courseFields.AVG_OVERALL,
			headerName: 'Overall (out of 5)',
			flex: isDesktop ? 0.5 : 0,
			valueGetter: (params: any) => roundNumber(params.row.avgOverall, 1),
			type: 'number',
		},
		{
			field: courseFields.NUM_REVIEWS,
			headerName: 'Number of Reviews',
			flex: isDesktop ? 0.5 : 0,
			type: 'number',
		},
		{
			field: courseFields.IS_DEPRECATED,
			headerName: 'is Deprecated?',
			flex: 0,
			hide: true,
			type: 'boolean',
		},
		{ field: courseFields.ALIASES, headerName: 'Aliases', flex: 0, hide: true },
	]

	return (
		<Container maxWidth='xl'>
			<Box
				sx={{
					my: 4,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
				}}
			>
				<Typography variant='h2' sx={{ mt: 5 }} gutterBottom>
					OMS Courses
				</Typography>
				<Typography variant='subtitle1' sx={{ mb: 10 }} gutterBottom>
					{`Georgia Tech's Online Master's Course Catalog`}
				</Typography>
				<>
					<Grid container sx={{ margin: 0, width: `100%` }} spacing={3}>
						<DataGrid
							autoHeight
							disableColumnSelector
							rows={courses}
							columns={columns}
							loading={!data && !error}
							components={{ Toolbar: GridToolbar }}
							sx={{ borderRadius: '25px', padding: '20px 10px' }}
							columnVisibilityModel={{
								isDeprecated: false,
								aliases: false,
							}}
							componentsProps={{
								toolbar: {
									showQuickFilter: true,
									quickFilterProps: { debounceMs: 500 },
								},
							}}
							initialState={{
								pagination: {
									pageSize: 150,
								},
								filter: {
									filterModel: {
										items: [
											{
												columnField: courseFields.IS_DEPRECATED,
												operatorValue: 'is',
												value: 'false',
											},
										],
									},
								},
							}}
						/>
					</Grid>
				</>
			</Box>
		</Container>
	)
}

export default Home
