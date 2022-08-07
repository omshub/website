import { TNullableNumber } from '../globals/types'

const LEN_SIMPLE_COURSE_NUMBER = 5 //   DD-CCCC     (e.g., CS-6200)
const LEN_COMPOUND_COURSE_NUMBER = 6 // DD-CCCC-CCC (e.g., CS-8803-O08)

export const parseReviewId = (reviewId: string) => {
	let courseId = ''
	let departmentId = ''
	let courseNumberA = ''
	let courseNumberB = ''
	let year = ''
	let semesterTerm = ''

	const parsedValues = reviewId.split('-')

	if (parsedValues.length === LEN_SIMPLE_COURSE_NUMBER) {
		;[departmentId, courseNumberA, year, semesterTerm] = parsedValues
		courseId = `${departmentId}-${courseNumberA}`
	}

	if (parsedValues.length === LEN_COMPOUND_COURSE_NUMBER) {
		;[departmentId, courseNumberA, courseNumberB, year, semesterTerm] =
			parsedValues
		courseId = `${departmentId}-${courseNumberA}-${courseNumberB}`
	}

	return {
		courseId,
		year,
		semesterTerm,
	}
}

export type TAveragesData = {
	oldAverage?: TNullableNumber
	oldCount?: number
	newCount: number
	oldValue?: number
	newValue?: number
}

export const updateAverage = ({
	oldAverage,
	oldCount = 0, // 0 for `oldAverage === null`
	newCount,
	oldValue = 0, // 0 for add new value
	newValue = 0, // 0 for delete existing value
}: TAveragesData) => {
	if (newCount === 0) {
		return null
	}

	oldAverage = oldAverage ?? 0
	oldValue = oldValue ?? 0
	newValue = newValue ?? 0

	// adding new value:        newCount - oldCount ===  1
	// editing existing value:  newCount - oldCount ===  0
	// deleting existing value: newCount - oldCount === -1
	return (
		(oldAverage * oldCount - oldValue + newValue) /
		(oldCount + (newCount - oldCount))
	)
}

type TAveragesInputData = {
	// N.B. `avg`s are null when `numReviews` === 0
	avgWorkload?: TNullableNumber
	avgDifficulty?: TNullableNumber
	avgOverall?: TNullableNumber
	avgStaffSupport?: TNullableNumber
	oldWorkload?: number
	oldDifficulty?: number
	oldOverall?: number
	oldStaffSupport?: number // N.B. `staffSupport` is null for legacy reviews, however, those records are not modifiable
	newWorkload?: number
	newDifficulty?: number
	newOverall?: number
	newStaffSupport?: number // N.B. `staffSupport` is null for legacy reviews, however, those records are not modifiable
	oldCount?: number
	newCount: number
	oldValue?: number
	newValue?: number
}

// This function converts input averages to output averages based on
// review add, edit, or delete
export const updateAverages = ({
	oldCount,
	newCount,
	oldWorkload,
	oldDifficulty,
	oldOverall,
	// oldStaffSupport,
	newWorkload,
	newDifficulty,
	newOverall,
	// newStaffSupport,
	avgWorkload,
	avgDifficulty,
	// avgStaffSupport,
	avgOverall,
}: TAveragesInputData) => ({
	avgWorkload: updateAverage({
		oldAverage: avgWorkload,
		oldCount,
		newCount,
		oldValue: oldWorkload,
		newValue: newWorkload,
	}),
	avgDifficulty: updateAverage({
		oldAverage: avgDifficulty,
		oldCount,
		newCount,
		oldValue: oldDifficulty,
		newValue: newDifficulty,
	}),
	avgOverall: updateAverage({
		oldAverage: avgOverall,
		oldCount,
		newCount,
		oldValue: oldOverall,
		newValue: newOverall,
	}),
	// TODO: implement additional logic for `avgStaffSupport`
	// avgStaffSupport: updateAverage({
	// 	oldAverage: avgStaffSupport,
	// 	oldCount,
	// 	newCount,
	// 	oldValue: oldStaffSupport,
	// 	newValue: newStaffSupport,
	// }),
})
