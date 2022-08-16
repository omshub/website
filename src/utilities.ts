import { ASC } from '@globals/constants'
import {
	boldBlue,
	canopyLime,
	newHorizon,
	olympicTeal,
	RATCap,
} from '@src/colorPalette'

type TMapFields = {
	[key: number]: string
}

export const mapDifficulty: TMapFields = {
	1: 'Very Easy',
	2: 'Easy',
	3: 'Neutral',
	4: 'Hard',
	5: 'Very Hard',
}

export const mapOverall: TMapFields = {
	1: 'Strongly Disliked',
	2: 'Disliked',
	3: 'Neutral',
	4: 'Liked',
	5: 'Strongly Liked',
}

export const mapStaffSupport: TMapFields = {
	1: 'Little/No Support',
	2: 'Some Support',
	3: 'Neutral',
	4: 'Supportive',
	5: 'Strong Support',
}

export const mapSemesterTermToName: TMapFields = {
	1: 'Spring',
	2: 'Summer',
	3: 'Fall',
}

export const mapSemesterTermToEmoji: TMapFields = {
	1: '🌱',
	2: '🌞',
	3: '🍂',
}

export const mapSemsterIdToTerm: TObject = {
	sp: 1,
	sm: 2,
	fa: 3,
}

export const mapSemesterIdToName: TObject = {
	sp: 'Spring',
	sm: 'Summer',
	fa: 'Fall',
}
type TObject = {
	[key: string | number]: any
}
type TSortKey =
	| 'courseId'
	| 'departmentId'
	| 'programId'
	| 'semesterId'
	| 'specializationId'
	| 'userId'
type TSortDirection = 'ASC' | 'DESC'

/**
 * Returns a hex color string from a 1-5 rating, with 1 being "bad" and 5 being "good"
 */
export const mapRatingToColor = (rating: Number) => {
	const mapColorPalette: TMapFields = {
		1: newHorizon,
		2: RATCap,
		3: boldBlue,
		4: olympicTeal,
		5: canopyLime,
	}

	return mapColorPalette[Math.round(rating.valueOf())]
}

/**
 * Same as mapRatingToColor, except low values are "good" and higher values "bad"
 * @see mapRatingToColor
 */
export const mapRatingToColorInverted = (rating: Number) =>
	mapRatingToColor(-rating + 6)

export const mapPayloadToArray = (
	map: TObject | undefined,
	sortKey?: TSortKey | string,
	sortDirection?: TSortDirection
) => {
	const outputArray = []
	if (map) {
		for (const key in map) {
			outputArray.push(map[key])
		}
	}
	if (sortKey) {
		if (!sortDirection) {
			sortDirection = ASC
		}
		const isAscendingSortFactor = sortDirection === ASC ? 1 : -1
		outputArray.sort((a, b) => {
			const valA = a[sortKey]
			const valB = b[sortKey]

			if (typeof valA === 'string' && typeof valB === 'string') {
				return valA < valB
					? isAscendingSortFactor * -1
					: isAscendingSortFactor * 1
			}

			if (typeof valA === 'number' && typeof valB === 'number') {
				return isAscendingSortFactor * (valA - valB) ? 1 : -1
			}

			// default fallthrough
			return -1
		})
	}
	return outputArray
}

export const roundNumber = (number: number, fixed: number) => {
	return (Math.round(number * 10) / 10).toFixed(fixed)
}
