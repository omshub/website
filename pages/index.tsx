import * as React from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Copyright from '../src/Copyright'

const Home: NextPage = () => {
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
				<Typography variant='h4' component='h1' sx={{ mb: 10 }} gutterBottom>
					OMSCS Course List
				</Typography>
			</Box>
			<Copyright />
		</Container>
	)
}

export default Home
