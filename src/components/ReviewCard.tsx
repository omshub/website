import { Review } from '@globals/types'
import { getCourseDataStatic } from '@globals/utilities'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import { grey } from '@mui/material/colors'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import {
	mapColorPalette,
	mapColorPaletteInverted,
	mapDifficulty,
	mapOverall,
	mapSemesterIdToName
} from '@src/utilities'
import ReactMarkdown from 'react-markdown'

const ReviewCard = ({
	body,
	overall,
	difficulty,
	workload,
	semesterId,
	created,
	year,
	courseId,
}: Review) => {
	const timestamp = new Date(created).toLocaleDateString()
	const { name: courseName } = getCourseDataStatic(courseId)

	return (
		<Card
			sx={{
				p: 1,
				borderRadius: '10px',
				boxShadow: `0 5px 15px 0 ${grey[400]}`,
			}}
		>
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
					<Typography color='text.primary'>{courseId}</Typography>
					<Typography color='text.secondary'>{courseName}</Typography>
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
						columnSpacing={1}
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
