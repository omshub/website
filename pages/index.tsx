import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '../src/Link'
import { getCourses }  from "../firebase/dbOperations"
import {
	DataGrid,
	GridColDef,
	GridToolbar,
	GridRenderCellParams,
} from '@mui/x-data-grid'

interface ClassData extends Object {

	aliases?: string[]
	avgDifficulty?: number
	avgOverall?: number
	avgStaffSupport?: number
	avgWorkload?: number
	courseId?: string
	courseNumber?: string
	departmentId?: string
	id?:any
	isDeprecated?: boolean
	isFoundational?: boolean
	key?:any
	name?: string
	numReviews?: number
	url?: string
}

const Home: NextPage = () => {
	const columns: GridColDef[] = [
		{
			field: 'name',
			headerName: 'Course Name',
			flex: 1,
			renderCell: (params: GridRenderCellParams) => (
				<Link
					href={{
						pathname: `/class/${params.row.courseId}`,
						query: { courseId: params.row.courseId, title: params.row.name },
					}}
				>
					{params.row.name}
				</Link>
			),
		},
		{ field: 'courseId', headerName: 'Course ID', flex: 0.5 },
		{ field: 'avgDifficulty', headerName: 'Difficulty', flex: 0.5, valueGetter:(params:any)=>Math.round(params.row.avgDifficulty * 10) / 10 },
		{ field: 'avgWorkload', headerName: 'Workload', flex: 0.5, valueGetter:(params:any)=>Math.round(params.row.avgWorkload * 10) / 10 },
		{ field: 'avgOverall', headerName: 'Overall', flex: 0.5 , valueGetter:(params:any)=>Math.round(params.row.avgOverall * 10) / 10},
		{ field: 'numReviews', headerName: 'Number of Reviews', flex: 0.5 },
		{ field: 'aliases', headerName: 'Aliases', flex: 0, hide: true },
	]
	const [loading, setLoading] = useState<boolean>()
	const [classes, setClasses] = useState<Array<ClassData>>([])

	useEffect(() => {
		setLoading(true)
		
		getCourses().then((courses)=>{
			const classes=courses.map((data:ClassData,index:number)=>({
				...data,
				id:index,
			}))
			setClasses(classes)
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
							rows={classes}
							columns={columns}
							loading={loading}
							components={{ Toolbar: GridToolbar }}
							columnVisibilityModel={{
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
							}}
						/>
					</Grid>
				</>
			</Box>
		</Container>
	)
}

export default Home
