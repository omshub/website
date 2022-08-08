import * as React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { grey } from '@mui/material/colors'
import ReactMarkdown from 'react-markdown'
import { Review } from '@globals/types'
import Grid from '@mui/material/Grid'
import {
	mapDifficulty,
	mapOverall,
	mapColorPalette,
	mapColorPaletteInverted,
	mapSemesterIdToName,
} from '@src/utilities'

const ReviewCard = ({
	body,
	overall,
	difficulty,
	workload,
	semesterId,
	created,
	year,
}: Review) => {
	const timestamp = new Date(created).toLocaleDateString()

	return (
		<Card sx={{ boxShadow: `0 5px 15px 0 ${grey[300]}` }}>
			<CardContent>
				<Box
					sx={{
						mb: 3,
						display: 'flex',
						direction: 'column',
						alignItems: 'flex-start',
						flexDirection: 'column',
					}}
				>
					<Typography color='text.secondary'>
						Taken {mapSemesterIdToName[semesterId]} {year}
					</Typography>
					<Typography color='text.secondary'>
						Reviewed on {timestamp}
					</Typography>
				</Box>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'flex-start',
					}}
				>
					<Grid
						container
						direction='row'
						rowSpacing={2}
						justifyContent='flex-start'
						alignItems='flex-start'
					>
						<Grid item>
							<Chip
								label={`Workload: ${workload} hr/wk`}
								variant='outlined'
							></Chip>
						</Grid>
						<Grid item>
							<Chip
								label={`Difficulty: ${mapDifficulty[difficulty]}`}
								sx={{
									ml: 1,
									color: mapColorPaletteInverted[difficulty],
									borderColor: mapColorPaletteInverted[difficulty],
								}}
								variant='outlined'
							></Chip>
						</Grid>
						<Grid item>
							<Chip
								label={`Overall: ${mapOverall[overall]}`}
								sx={{
									ml: 1,
									color: mapColorPalette[overall],
									borderColor: mapColorPalette[overall],
								}}
								variant='outlined'
								color='primary'
							></Chip>
						</Grid>
					</Grid>
				</Box>
				<article>
					<ReactMarkdown>{body}</ReactMarkdown>
				</article>
			</CardContent>
		</Card>
	)
}

export default ReviewCard
