import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@src/Link'

import {
	DataGrid,
	GridColDef,
	GridToolbar,
	GridRenderCellParams,
} from '@mui/x-data-grid'
import { Course } from '@globals/types'
import { getCourses } from '@backend/dbOperations'
import { mapPayloadToArray, roundNumber } from '@src/utilities'
import { courseFields } from '@globals/constants'

const Home: NextPage = () => {
	const columns: GridColDef[] = [
		{
			field: courseFields.NAME,
			headerName: 'Course Name',
			flex: 1,
			renderCell: (params: GridRenderCellParams) => (
				<Link
					href={{
						pathname: `/course/${params.row.courseId}`,
						query: {
							title: params.row.name,
							courseData: JSON.stringify(params.row),
							numReviews: params.row.numReviews,
						},
					}}
					sx={{
						textDecoration: 'unset',
						'&:hover': { textDecoration: 'underline' },
					}}
				>
					{params.row.name}
				</Link>
			),
		},
		{ field: courseFields.COURSE_ID, headerName: 'Course ID', flex: 0.5 },
		{
			field: courseFields.AVG_DIFFICULTY,
			headerName: 'Difficulty (out of 5)',
			flex: 0.5,
			valueGetter: (params: any) => roundNumber(params.row.avgDifficulty, 1),
		},
		{
			field: courseFields.AVG_WORKLOAD,
			headerName: 'Workload (hrs/wk)',
			flex: 0.5,
			valueGetter: (params: any) => roundNumber(params.row.avgWorkload, 1),
		},
		{
			field: courseFields.AVG_OVERALL,
			headerName: 'Overall (out of 5)',
			flex: 0.5,
			valueGetter: (params: any) => roundNumber(params.row.avgOverall, 1),
		},
		{
			field: courseFields.NUM_REVIEWS,
			headerName: 'Number of Reviews',
			flex: 0.5,
		},
		{
			field: courseFields.IS_DEPRECATED,
			headerName: 'is Deprecated?',
			flex: 0,
			hide: true,
		},
		{ field: courseFields.ALIASES, headerName: 'Aliases', flex: 0, hide: true },
	]
	const [loading, setLoading] = useState<boolean>()
	const [courses, setCourses] = useState<Course[]>([])

	useEffect(() => {
		setLoading(true)

		getCourses()
			.then((payloadCourses) => {
				const courses: Course[] = mapPayloadToArray(
					payloadCourses,
					courseFields.COURSE_ID
				)
				const coursesWithIds = courses.map((data, i) => ({ ...data, id: i }))
				setCourses(coursesWithIds)
				setLoading(false)
			})
			.catch((err: any) => {
				setLoading(false)
				console.log(err)
			})
	}, [])
	return (
		<Container maxWidth='xl'>
			<Box
				sx={{
					my: 4,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Typography
					variant='h4'
					component='h1'
					sx={{ mt: 5, mb: 10 }}
					gutterBottom
				>
					GT OMS Courses
				</Typography>

				<>
					<Grid container sx={{ margin: 0, width: `100%` }} spacing={3}>
						<DataGrid
							autoHeight
							disableColumnSelector
							rows={courses}
							columns={columns}
							loading={loading}
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
												operatorValue: 'equals',
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
