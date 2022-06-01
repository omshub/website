import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { grey } from '@mui/material/colors'
import Markdown from 'markdown-to-jsx'

interface CommentCardProps {
	body: string
	rating: number
	difficulty: number
	workload: number
	semester: string
	created: string
}

const CommentCard = ({ ...props }: CommentCardProps) => {
	const timestamp = new Date(props.created).toLocaleDateString()

	return (
		<Card sx={{ boxShadow: `0 5px 15px 0 ${grey[300]}` }}>
			<CardContent>
				<Box sx={{ mb: 3 }}>
					<Typography color='text.secondary'>
						Reviewed on {timestamp}
					</Typography>
				</Box>

				<Markdown sx={{ mb: 3 }}>{props.body}</Markdown>

				<Box
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
					}}
				>
					<Chip label={`Workload ${props.workload}`} variant='outlined'></Chip>
					<Chip
						label={`Rating ${props.rating}`}
						sx={{ ml: 1 }}
						variant='outlined'
						color='primary'
					></Chip>
					<Chip
						label={`Difficulty ${props.difficulty}`}
						sx={{ ml: 1 }}
						variant='outlined'
						color={props.difficulty >= 4 ? 'error' : 'success'}
					></Chip>
				</Box>
			</CardContent>
		</Card>
	)
}

export default CommentCard
