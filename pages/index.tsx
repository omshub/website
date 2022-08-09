import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '../src/Link'
import Alert from '@mui/material/Alert'
import { useAlert } from '../context/AlertContext'
import {
	DataGrid,
	GridColDef,
	GridToolbar,
	GridRenderCellParams,
} from '@mui/x-data-grid'

interface ClassData {
	number: string
	aliases: string
	department: string
	deprecated: boolean
	foundational: string
	name: string
	link: string
	course_id: string
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
						pathname: `/class/${params.row.course_id}`,
						query: { classid: params.row.course_id, title: params.row.name },
					}}
				>
					{params.row.name}
				</Link>
			),
		},
		{ field: 'course_id', headerName: 'Course ID', flex: 1 },
		{ field: 'aliases', headerName: 'Aliases', flex: 1, hide: true },
	]
	const [loading, setLoading] = useState<boolean>()
	const [classes, setClasses] = useState<Array<ClassData>>([])

	useEffect(() => {
		setLoading(true)
		// fetch('https://omshub-readonly.gigalixirapp.com/classes')
		fetch('https://omshub-api.gigalixirapp.com/api/classes')
			.then((res) => res.json())
			.then((classes) => {
				//Clean data
				classes = classes.map((data: object, index: number) => ({
					...data,
					id: index,
				}))
				setClasses(classes)
				setLoading(false)
			})
			.catch((err) => {
				setLoading(false)
				console.log(err)
			})
	}, [])
	const { alert } = useAlert()
	return (
		<Container maxWidth='lg'>
			<Box>
				{alert && (
					<Alert severity={alert.severity} variant={alert.variant}>
						{alert.text}
					</Alert>
				)}
			</Box>
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
