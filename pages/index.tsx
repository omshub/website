import * as React from 'react'
import type { NextPage } from 'next'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Copyright from '../src/Copyright'
import Link from '../src/Link'

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
				Hello! OMSHub is under construction. While the formal OMSHub website is
				being developed, we wanted to offer the community a means of submitting
				reviews in the interim period with a Google Form. All reviews posted to
				this form will ultimately be loaded into the final website. In the mean
				time, the results can be viewed on a spreadsheet.
				<Link
					href='https://docs.google.com/forms/d/e/1FAIpQLSc1xXBa3nnPECvoAKLMC4X3iXbZOghOiIQv6p8xAwR5gysBSA/viewform'
					color='secondary'
				>
					Temporary Submission Form
				</Link>
				<Link
					href='https://docs.google.com/spreadsheets/d/1ezCaFiye6dxVcdOCClndmz0JBLwMDrNtayL1WaTObj0/edit#gid=0'
					color='secondary'
				>
					Temporary Spreadsheet With Reviews
				</Link>
				<Link
					href='https://awaisrauf.github.io/omscs_reviews/'
					color='secondary'
				>
					Alternate site for legacy reviews (NOTE: not developed/maintained by OMSHub)
				</Link>
			</Box>
			<Copyright />
		</Container>
	)
}

export default Home
