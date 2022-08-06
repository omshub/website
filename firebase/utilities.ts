import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	baseCollectionCoreData,
	baseCollectionReviewsData,
	baseDocumentReviewsRecent50,
} from './constants'
import {
	getCourse,
	updateCourse,
	getReviews,
	getReview,
	getReviewsRecent50,
} from './dbOperations'
import {
	Course,
	Review,
	TDocumentData,
	TDocumentDataObject,
} from './documentsDataTypes'

/* --- UTILITY FUNCTIONS --- */
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

type TAveragesData = {
	oldAverage?: number | null
	oldCount?: number
	newCount: number
	oldValue?: number | null
	newValue?: number | null
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
	avgWorkload?: number | null
	avgDifficulty?: number | null
	avgOverall?: number | null
	avgStaffSupport?: number | null
	oldWorkload?: number
	oldDifficulty?: number
	oldOverall?: number
	oldStaffSupport?: number | null
	newWorkload?: number
	newDifficulty?: number
	newOverall?: number
	newStaffSupport?: number | null
	oldCount?: number
	newCount: number
	oldValue?: number | null
	newValue?: number | null
}

// This function converts input averages to output averages based on
// review add, edit, or delete
const updateAverages = ({
	oldCount,
	newCount,
	oldWorkload,
	oldDifficulty,
	oldOverall,
	oldStaffSupport,
	newWorkload,
	newDifficulty,
	newOverall,
	newStaffSupport,
	avgWorkload,
	avgDifficulty,
	avgOverall,
	avgStaffSupport,
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
	avgStaffSupport: updateAverage({
		oldAverage: avgStaffSupport,
		oldCount,
		newCount,
		oldValue: oldStaffSupport,
		newValue: newStaffSupport,
	}),
})

/* --- CORE DATA CRUD SUB-OPERATIONS --- */
export const getAll = async (dataDocName: string) => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${dataDocName}`)
		)
		const coreDataDoc = snapshot.data()
		return coreDataDoc ?? null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const get = async (dataDocName: string, dataId: string) => {
	try {
		const coreDataDoc = await getAll(dataDocName)
		return coreDataDoc ? coreDataDoc[dataId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addOrUpdate = async (
	dataDocName: string,
	dataId: string,
	data: TDocumentData
) => {
	try {
		const coreDataDoc = await getAll(dataDocName)
		let newDataDoc: TDocumentDataObject = {}
		if (coreDataDoc) {
			newDataDoc = { ...coreDataDoc }
		}
		newDataDoc[dataId] = data
		await setDoc(
			doc(db, `${baseCollectionCoreData}/${dataDocName}`),
			newDataDoc
		)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const del = async (dataDocName: string, dataId: string) => {
	try {
		const coreDataDoc = await getAll(dataDocName)
		if (coreDataDoc) {
			delete coreDataDoc[dataId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${dataDocName}`),
				coreDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- REVIEWS DATA CRUD SUB-OPERATIONS --- */
export const addOrUpdateReview = async (
	reviewId: string,
	data: TDocumentData
) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		let newDataDoc: TDocumentDataObject = {}
		if (reviewsDataDoc) {
			newDataDoc = { ...reviewsDataDoc }
		}
		newDataDoc[reviewId] = data
		await setDoc(
			doc(
				db,
				`${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`
			),
			newDataDoc
		)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateCourseDataOnAddReview = async (
	reviewId: string,
	reviewData: Review
) => {
	try {
		let { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const courseDataDoc: Course = await getCourse(courseId)
		let {
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
			reviewsCountsByYearSem,
		} = courseDataDoc

		const {
			workload: newWorkload,
			difficulty: newDifficulty,
			overall: newOverall,
			staffSupport: newStaffSupport,
		} = reviewData

		const oldCount = numReviews
		const newCount = numReviews + 1
		numReviews = numReviews + 1
		;({ avgWorkload, avgDifficulty, avgOverall, avgStaffSupport } =
			updateAverages({
				oldCount,
				newCount,
				newWorkload,
				newDifficulty,
				newOverall,
				newStaffSupport,
				avgWorkload,
				avgDifficulty,
				avgOverall,
				avgStaffSupport,
			}))

		if (!reviewsCountsByYearSem[year][semesterTerm]) {
			// no previous reviews in year-semesterTerm
			reviewsCountsByYearSem[year][semesterTerm] = 1
		} else {
			reviewsCountsByYearSem[year][semesterTerm] =
				reviewsCountsByYearSem[year][semesterTerm] + 1
		}

		const updatedCourseData = {
			...courseDataDoc,
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
			reviewsCountsByYearSem,
		}

		await updateCourse(courseId, updatedCourseData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateReviewsRecent50OnAddReview = async (
	newReviewData: Review
) => {
	try {
		let dataArray = await getReviewsRecent50()
		if (dataArray && dataArray.length) {
			dataArray.unshift(newReviewData)
			if (dataArray.length > 50) {
				dataArray.pop()
			}
			await setDoc(doc(db, baseDocumentReviewsRecent50), { reviews: dataArray })
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateCourseDataOnUpdateReview = async (
	reviewId: string,
	reviewData: Review
) => {
	try {
		let { courseId } = parseReviewId(reviewId)
		const courseDataDoc: Course = await getCourse(courseId)
		let {
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
		} = courseDataDoc

		const oldCount = numReviews
		const newCount = numReviews

		const {
			workload: oldWorkload,
			difficulty: oldDifficulty,
			overall: oldOverall,
			staffSupport: oldStaffSupport,
		}: Review = await getReview(reviewId)

		const {
			workload: newWorkload,
			difficulty: newDifficulty,
			overall: newOverall,
			staffSupport: newStaffSupport,
		} = reviewData

		;({ avgWorkload, avgDifficulty, avgOverall, avgStaffSupport } =
			updateAverages({
				oldCount,
				newCount,
				oldWorkload,
				oldDifficulty,
				oldOverall,
				oldStaffSupport,
				newWorkload,
				newDifficulty,
				newOverall,
				newStaffSupport,
				avgWorkload,
				avgDifficulty,
				avgOverall,
				avgStaffSupport,
			}))

		const updatedCourseData = {
			...courseDataDoc,
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
		}

		await updateCourse(courseId, updatedCourseData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateReviewsRecent50OnUpdateReview = async (
	newReviewData: Review
) => {
	try {
		let dataArray = await getReviewsRecent50()
		if (dataArray && dataArray?.length) {
			const indexFoundAt = dataArray
				.map(({ reviewId }: Review) => reviewId)
				.indexOf(newReviewData.reviewId)
			if (indexFoundAt !== -1) {
				dataArray[indexFoundAt] = newReviewData
				await setDoc(doc(db, baseDocumentReviewsRecent50), {
					reviews: dataArray,
				})
			}
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateCourseDataOnDeleteReview = async (reviewId: string) => {
	try {
		let { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const courseDataDoc: Course = await getCourse(courseId)
		let {
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
			reviewsCountsByYearSem,
		} = courseDataDoc

		const oldCount = numReviews
		const newCount = numReviews - 1
		numReviews = numReviews - 1

		const {
			workload: oldWorkload,
			difficulty: oldDifficulty,
			overall: oldOverall,
			staffSupport: oldStaffSupport,
		}: Review = await getReview(reviewId)

		;({ avgWorkload, avgDifficulty, avgOverall, avgStaffSupport } =
			updateAverages({
				oldCount,
				newCount,
				oldWorkload,
				oldDifficulty,
				oldOverall,
				oldStaffSupport,
				avgWorkload,
				avgDifficulty,
				avgOverall,
				avgStaffSupport,
			}))

		if (reviewsCountsByYearSem[year][semesterTerm] === 1) {
			// remove last remaining count
			delete reviewsCountsByYearSem.year.semesterTerm
		} else {
			reviewsCountsByYearSem[year][semesterTerm] =
				reviewsCountsByYearSem[year][semesterTerm] - 1
		}

		const updatedCourseData = {
			...courseDataDoc,
			numReviews,
			avgWorkload,
			avgDifficulty,
			avgOverall,
			avgStaffSupport,
			reviewsCountsByYearSem,
		}

		await updateCourse(courseId, updatedCourseData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateReviewsRecent50OnDeleteReview = async (reviewId: string) => {
	try {
		let dataArray = await getReviewsRecent50()
		if (dataArray && dataArray?.length) {
			const indexFoundAt = dataArray
				.map(({ reviewId }: Review) => reviewId)
				.indexOf(reviewId)

			if (indexFoundAt !== -1) {
				dataArray = [
					...dataArray.slice(0, indexFoundAt),
					...dataArray.slice(indexFoundAt + 1),
				]

				if (dataArray?.length > 50) {
					dataArray?.pop()
				}

				await setDoc(doc(db, baseDocumentReviewsRecent50), {
					reviews: dataArray,
				})
			}
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
