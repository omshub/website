import { Review } from '@globals/types'
import { getCourseDataStatic } from '@globals/utilities'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material'
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
	mapSemesterIdToName,
} from '@src/utilities'
import { toBlob } from 'html-to-image'
import { SyntheticEvent, useRef, useState } from 'react'
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
	const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false)
	const clipboardRef = useRef<HTMLDivElement>(null)
	const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return
		}

		setSnackBarOpen(false)
	}
	const handleCopyToClipboard = async () => {
		const blob: any = await toBlob(clipboardRef?.current!)
		const item: any = { [blob.type]: blob }
		// eslint-disable-next-line no-undef
		const clipboardItem = new ClipboardItem(item)
		await navigator.clipboard.write([clipboardItem])
		setSnackBarOpen(true)
	}

	return (
		<div ref={clipboardRef!}>
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
						<Grid
							container
							direction='row'
							rowSpacing={1}
							justifyContent='flex-start'
							alignItems='flex-start'
						>
							<Grid item xs={12}>
								<Typography color='text.primary'>{courseId}</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography color='text.secondary'>{courseName}</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography color='text.secondary'>
									Taken {mapSemesterIdToName[semesterId]} {year}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography color='text.secondary'>
									Reviewed on {timestamp}
								</Typography>
							</Grid>
						</Grid>
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
					<Grid textAlign='right'>
						<Tooltip title='Screenshot Review'>
							<IconButton onClick={handleCopyToClipboard}>
								<PhotoCameraIcon />
							</IconButton>
						</Tooltip>
						<Snackbar
							open={snackBarOpen}
							autoHideDuration={6000}
							onClose={handleClose}
							action={
								<Button color='secondary' size='small' onClick={handleClose}>
									Close
								</Button>
							}
							message={'Screenshotted Review to Clipboard!'}
						/>
					</Grid>
				</CardContent>
			</Card>
		</div>
	)
}

export default ReviewCard
