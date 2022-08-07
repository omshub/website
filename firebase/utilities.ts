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
import { Course, Review } from '../globals/types'
import { TDocumentData, TDocumentDataObject } from './documentsDataTypes'
import { parseReviewId, updateAverages } from './utilityFunctions'

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
			if (Object.keys(coreDataDoc).length) {
				newDataDoc = { ...coreDataDoc }
			}
			newDataDoc[dataId] = data
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${dataDocName}`),
				newDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const del = async (dataDocName: string, dataId: string) => {
	try {
		const coreDataDoc = await getAll(dataDocName)
		if (coreDataDoc && Object.keys(coreDataDoc).length) {
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
	reviewData: TDocumentData
) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		let newDataDoc: TDocumentDataObject = {}
		if (reviewsDataDoc) {
			if (Object.keys(reviewsDataDoc).length) {
				newDataDoc = { ...reviewsDataDoc }
			}
			newDataDoc[reviewId] = reviewData
			await setDoc(
				doc(
					db,
					`${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`
				),
				newDataDoc
			)
		}
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
		if (courseDataDoc) {
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
			;({
				avgWorkload,
				avgDifficulty,
				avgOverall,
				// avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
			} = updateAverages({
				oldCount,
				newCount,
				newWorkload,
				newDifficulty,
				newOverall,
				newStaffSupport: newStaffSupport ?? undefined,
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
		}
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
		if (dataArray && dataArray?.length) {
			dataArray.unshift(newReviewData)
			if (dataArray.length > 50) {
				// maintain buffer size
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
		if (courseDataDoc) {
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

			;({
				avgWorkload,
				avgDifficulty,
				avgOverall,
				// avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
			} = updateAverages({
				oldCount,
				newCount,
				oldWorkload,
				oldDifficulty,
				oldOverall,
				oldStaffSupport: oldStaffSupport ?? undefined,
				newWorkload,
				newDifficulty,
				newOverall,
				newStaffSupport: newStaffSupport ?? undefined,
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
				// N.B. No net change in field `reviewsCountsByYearSem` on update
			}

			await updateCourse(courseId, updatedCourseData)
		}
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
		if (courseDataDoc) {
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

			;({
				avgWorkload,
				avgDifficulty,
				avgOverall,
				// avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
			} = updateAverages({
				oldCount,
				newCount,
				oldWorkload,
				oldDifficulty,
				oldOverall,
				oldStaffSupport: oldStaffSupport ?? undefined,
				avgWorkload,
				avgDifficulty,
				avgOverall,
				avgStaffSupport,
			}))

			if (reviewsCountsByYearSem[year][semesterTerm] === 1) {
				// remove last remaining count
				delete reviewsCountsByYearSem[year][semesterTerm]
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
		}
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
				dataArray = dataArray.filter(
					(data: Review, index: number) => index !== indexFoundAt
				)

				if (dataArray?.length > 50) {
					// truncate buffer
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
