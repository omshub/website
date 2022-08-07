import {
	newHorizon,
	RATCap,
	canopyLime,
	olympicTeal,
	boldBlue,
} from './colorPalette'

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

export const mapColorPalette: TMapFields = {
	1: newHorizon,
	2: RATCap,
	3: canopyLime,
	4: olympicTeal,
	5: boldBlue,
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

export const mapToArray = (
	map: TObject,
	sortKey?: TSortKey,
	sortDirection?: TSortDirection
) => {
	const outputArray = []
	for (const key in map) {
		outputArray.push(map[key])
	}
	if (sortKey) {
		if (!sortDirection) {
			sortDirection = 'ASC'
		}
		const directionFactor = sortDirection === 'ASC' ? 1 : -1
		outputArray.sort((a, b) => directionFactor * (a[sortKey] - b[sortKey]))
	}
	return outputArray
}
