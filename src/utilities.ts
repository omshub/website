import { ASC, EMOJI_FALL, EMOJI_SPRING, EMOJI_SUMMER } from '@globals/constants'
import { semesters } from '@globals/staticDataModels'
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
	1: semesters.sp.name,
	2: semesters.sm.name,
	3: semesters.fa.name,
}

export const mapSemesterTermToEmoji: TMapFields = {
	1: EMOJI_SPRING,
	2: EMOJI_SUMMER,
	3: EMOJI_FALL,
}

export const mapSemsterIdToTerm: TObject = {
	sp: semesters.sp.term,
	sm: semesters.sm.term,
	fa: semesters.fa.term,
}

export const mapSemesterIdToName: TObject = {
	sp: semesters.sp.name,
	sm: semesters.sm.name,
	fa: semesters.fa.name,
}

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
				return isAscendingSortFactor * (valA - valB)
			}

			// default fallthrough
			return -1
		})
	}
	return outputArray
}

export const roundNumber = (number: number, fixed: number) =>
	(Math.round(number * 10) / 10).toFixed(fixed)
