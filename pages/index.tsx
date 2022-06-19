import { GetStaticProps } from 'next'
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

type Class = {
	number: string
	aliases: string
	department: string
	deprecated: boolean
	foundational: string
	name: string
	link: string
	course_id: string
}

type ClassWithId = Class & { id: number }

// use axios.get in the getStaticProps method from Next.js to get data from  https://omshub-readonly.gigalixirapp.com/classes
export const getStaticProps: GetStaticProps = async () => {
	const res = await fetch('https://omshub-api.gigalixirapp.com/api/classes')
	const classes: Class[] = await res.json()
	const classesWithId: ClassWithId[] = classes.map((c, i) => ({
		...c,
		id: i,
	}))
	return {
		props: {
			classesWithId,
		},
		revalidate: 60,
	}
}

type HomeProps = {
	classesWithId: Class[]
}

const Home = ({ classesWithId }: HomeProps) => {
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
							rows={classesWithId}
							columns={columns}
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
