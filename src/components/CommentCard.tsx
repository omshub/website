import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { grey } from '@mui/material/colors'

interface CommentCardProps {
	body: string
	rating: number
	difficulty: number
	workload: number
	semester: string
}

const CommentCard = ({ ...props }: CommentCardProps) => {
	return (
		<Card sx={{ boxShadow: `0 5px 15px 0 ${grey[300]}` }}>
			<CardContent>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
					}}
				>
					<Chip
						label={`Workload ${props.workload}`}
						sx={{ ml: 0.5, mb: 2 }}
						variant='outlined'
					></Chip>
					<Chip
						label={`Rating ${props.rating}`}
						sx={{ ml: 0.5, mb: 2 }}
						variant='outlined'
						color='primary'
					></Chip>
					<Chip
						label={`Difficulty ${props.difficulty}`}
						sx={{ ml: 0.5, mb: 2 }}
						variant='outlined'
						color={props.difficulty >= 4 ? 'error' : 'success'}
					></Chip>
				</Box>

				<Typography variant='body1' color='text.primary' gutterBottom>
					{props.body}
				</Typography>
			</CardContent>
		</Card>
	)
}

export default CommentCard
