import { doc, setDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	coreDataDocuments,
	baseCollectionCoreData,
	baseCollectionReviewsData,
	baseCollectionRecentsData,
	baseCollectionUsersData,
} from '@backend/constants'
import {
	getCourses,
	getCourse,
	updateCourse,
	getReviews,
	getReview,
	getReviewsRecent,
	getUser,
} from '@backend/dbOperations'
import {
	Course,
	Review,
	TCourseId,
	TPayloadCourses,
	TPayloadCoursesDataDynamic,
} from '@globals/types'
import { TDocumentData, TDocumentDataObject } from '@backend/documentsDataTypes'
import { parseReviewId, updateAverages } from '@backend/utilityFunctions'
import { NOT_FOUND_ARRAY_INDEX, REVIEWS_RECENT_TOTAL } from '@globals/constants'
import { getCoursesDataStatic } from '@globals/utilities'

const { COURSES } = coreDataDocuments

/* --- COURSE DATA CRUD SUB-OPERATIONS --- */

export const mapDynamicCoursesDataToCourses = (
	coursesDataDynamic: TPayloadCoursesDataDynamic
) => {
	const coursesDataStatic = getCoursesDataStatic()
	const courses: TPayloadCourses = {}
	Object.keys(coursesDataStatic).forEach((courseId) => {
		courses[courseId] = {
			...coursesDataStatic[courseId],
			...coursesDataDynamic[courseId],
		}
	})
	return courses
}

export const addOrUpdateCourse = async (
	courseId: string,
	courseData: Course
) => {
	try {
		const coursesDataDoc = await getCourses()
		let newCoursesDataDoc: TPayloadCourses = {}
		if (coursesDataDoc) {
			if (Object.keys(coursesDataDoc).length) {
				newCoursesDataDoc = { ...coursesDataDoc }
			}
			newCoursesDataDoc[courseId] = courseData
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${COURSES}`),
				newCoursesDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- REVIEWS DATA CRUD SUB-OPERATIONS --- */

// utilities

const ON_ADD_REVIEW = 'ON_ADD_REVIEW'
const ON_EDIT_REVIEW = 'ON_EDIT_REVIEW'
const ON_DELETE_REVIEW = 'ON_DELETE_REVIEW'
type TOperationUpdateOnReviewEvent =
	| 'ON_ADD_REVIEW'
	| 'ON_EDIT_REVIEW'
	| 'ON_DELETE_REVIEW'

interface ArgsUpdateReviewsRecent {
	operation: TOperationUpdateOnReviewEvent
	reviewData?: Review
	reviewId: string
	courseId?: TCourseId
}

const updateReviewsRecent = async ({
	operation,
	reviewData = undefined, // delete only
	reviewId,
	courseId = undefined, // update aggregate
}: ArgsUpdateReviewsRecent) => {
	try {
		// N.B. if `courseId` is undefined, updates Firestore document `recentsData/_aggregateData`
		const dataDoc = courseId ?? `_aggregateData`
		let arrayRecentData = await getReviewsRecent(courseId)

		if (arrayRecentData) {
			switch (operation) {
				case ON_ADD_REVIEW: {
					if (reviewData) {
						arrayRecentData.push(reviewData)
						if (arrayRecentData.length > REVIEWS_RECENT_TOTAL) {
							// maintain buffer size
							arrayRecentData.shift()
						}
						await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
							data: arrayRecentData,
						})
					}
					break
				}
				case ON_EDIT_REVIEW: {
					if (reviewData) {
						const indexFoundAt = arrayRecentData
							.map(({ reviewId }: Review) => reviewId)
							.indexOf(reviewId)
						if (indexFoundAt !== NOT_FOUND_ARRAY_INDEX) {
							arrayRecentData[indexFoundAt] = reviewData
							await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
								data: arrayRecentData,
							})
						}
					}
					break
				}
				case ON_DELETE_REVIEW: {
					const indexFoundAt = arrayRecentData
						.map(({ reviewId }: Review) => reviewId)
						.indexOf(reviewId)
					if (indexFoundAt !== NOT_FOUND_ARRAY_INDEX) {
						arrayRecentData = arrayRecentData.filter(
							(_: Review, index: number) => index !== indexFoundAt
						)
						if (arrayRecentData.length > REVIEWS_RECENT_TOTAL) {
							// truncate buffer
							arrayRecentData.shift()
						}
						await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
							data: arrayRecentData,
						})
					}
					break
				}
				default:
					break
			}
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

interface ArgsUpdateUser {
	operation: TOperationUpdateOnReviewEvent
	reviewData?: Review
	reviewId: string
	userId: string
}

const updateUser = async ({
	operation,
	reviewData = undefined, // delete only
	reviewId,
	userId,
}: ArgsUpdateUser) => {
	try {
		const userData = await getUser(userId)

		if (userData) {
			switch (operation) {
				case ON_ADD_REVIEW: {
					if (reviewData) {
						userData.reviews[reviewId] = reviewData
						await setDoc(
							doc(db, `${baseCollectionUsersData}/${userId}`),
							userData
						)
					}
					break
				}
				case ON_EDIT_REVIEW: {
					if (reviewData && userData.reviews[reviewId]) {
						userData.reviews[reviewId] = reviewData
						await setDoc(
							doc(db, `${baseCollectionUsersData}/${userId}`),
							userData
						)
					}
					break
				}
				case ON_DELETE_REVIEW: {
					if (userData.reviews[reviewId]) {
						delete userData.reviews[reviewId]
						await setDoc(
							doc(db, `${baseCollectionUsersData}/${userId}`),
							userData
						)
					}
					break
				}
				default:
					break
			}
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

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

// updates on add review

export const updateCourseDataOnAddReview = async (
	reviewId: string,
	reviewData: Review
) => {
	try {
		let { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const courseDataDoc = await getCourse(courseId)
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

export const updateReviewsRecentOnAddReview = async (newReviewData: Review) => {
	try {
		const { reviewId } = newReviewData
		const { courseId } = parseReviewId(reviewId)

		// update course
		await updateReviewsRecent({
			operation: ON_ADD_REVIEW,
			reviewId,
			reviewData: newReviewData,
			courseId,
		})

		// update aggregate
		await updateReviewsRecent({
			operation: ON_ADD_REVIEW,
			reviewId,
			reviewData: newReviewData,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateUserDataOnAddReview = async (
	userId: string,
	newReviewData: Review
) => {
	try {
		const { reviewId } = newReviewData

		await updateUser({
			operation: ON_ADD_REVIEW,
			reviewId,
			reviewData: newReviewData,
			userId,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

// updates on update review

export const updateCourseDataOnUpdateReview = async (
	reviewId: string,
	reviewData: Review
) => {
	try {
		let { courseId } = parseReviewId(reviewId)
		const courseDataDoc = await getCourse(courseId)
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

export const updateReviewsRecentOnUpdateReview = async (
	newReviewData: Review
) => {
	try {
		const { reviewId } = newReviewData
		const { courseId } = parseReviewId(reviewId)

		// update course
		await updateReviewsRecent({
			operation: ON_EDIT_REVIEW,
			reviewId,
			reviewData: newReviewData,
			courseId,
		})

		// update aggregate
		await updateReviewsRecent({
			operation: ON_EDIT_REVIEW,
			reviewId,
			reviewData: newReviewData,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateUserDataOnUpdateReview = async (
	userId: string,
	newReviewData: Review
) => {
	try {
		const { reviewId } = newReviewData

		await updateUser({
			operation: ON_EDIT_REVIEW,
			reviewId,
			reviewData: newReviewData,
			userId,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

// updates on delete review

export const updateCourseDataOnDeleteReview = async (reviewId: string) => {
	try {
		let { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const courseDataDoc = await getCourse(courseId)
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

export const updateReviewsRecentOnDeleteReview = async (reviewId: string) => {
	try {
		const { courseId } = parseReviewId(reviewId)

		// update course
		await updateReviewsRecent({
			operation: ON_DELETE_REVIEW,
			reviewId,
			courseId,
		})

		// update aggregate
		await updateReviewsRecent({
			operation: ON_DELETE_REVIEW,
			reviewId,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateUserDataOnDeleteReview = async (
	userId: string,
	reviewId: string
) => {
	try {
		await updateUser({
			operation: ON_DELETE_REVIEW,
			reviewId,
			userId,
		})
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
