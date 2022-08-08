import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '../src/Link'
import {
	DataGrid,
	GridColDef,
	GridToolbar,
	GridRenderCellParams,
} from '@mui/x-data-grid'
import { Course, TPayloadCourses } from '../globals/types'
import backendAPI from '../firebase'

const { getCourses } = backendAPI

const Home: NextPage = () => {
	const columns: GridColDef[] = [
		{
			field: 'name',
			headerName: 'Course Name',
			flex: 1,
			renderCell: (params: GridRenderCellParams) => (
				<Link
					href={{
						pathname: `/course/${params.row.courseId}`,
						query: { courseData: JSON.stringify(params.row) },
					}}
				>
					{params.row.name}
				</Link>
			),
		},
		{ field: 'courseId', headerName: 'Course ID', flex: 0.5 },
		{
			field: 'avgDifficulty',
			headerName: 'Difficulty (out of 5)',
			flex: 0.5,
			valueGetter: (params: any) =>
				Math.round(params.row.avgDifficulty * 10) / 10,
		},
		{
			field: 'avgWorkload',
			headerName: 'Workload (hrs/wk)',
			flex: 0.5,
			valueGetter: (params: any) =>
				Math.round(params.row.avgWorkload * 10) / 10,
		},
		{
			field: 'avgOverall',
			headerName: 'Overall (hrs/wk)',
			flex: 0.5,
			valueGetter: (params: any) => Math.round(params.row.avgOverall * 10) / 10,
		},
		{ field: 'numReviews', headerName: 'Number of Reviews', flex: 0.5 },
		{
			field: 'isDeprecated',
			headerName: 'is Deprecated?',
			flex: 0,
			hide: true,
		},
		{ field: 'aliases', headerName: 'Aliases', flex: 0, hide: true },
	]
	const [loading, setLoading] = useState<boolean>()
	const [courses, setCourses] = useState<Array<Course>>([])

	useEffect(() => {
		setLoading(true)

		getCourses()
			.then((payloadCourses: TPayloadCourses) => {
				const courses = Object.keys(payloadCourses).map(
					(key: string, index: number) => ({
						...payloadCourses[key],
						id: index,
					})
				)
				setCourses(courses)
				setLoading(false)
			})
			.catch((err) => {
				setLoading(false)
				console.log(err)
			})
	}, [])
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
				<Typography
					variant='h4'
					component='h1'
					sx={{ mt: 5, mb: 10 }}
					gutterBottom
				>
					OMSCS Courses
				</Typography>

				<>
					<Grid container sx={{ marginLeft: 0, width: `100%` }} spacing={3}>
						<DataGrid
							autoHeight
							disableColumnSelector
							rows={courses}
							columns={columns}
							loading={loading}
							components={{ Toolbar: GridToolbar }}
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
												columnField: 'isDeprecated',
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
