import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	coreDataDocuments,
	baseCollectionCoreData,
	baseCollectionReviewsData,
	baseCollectionRecentsData,
	baseCollectionUsersData,
} from '@backend/constants'
import {
	Course,
	Review,
	TCourseId,
	TPayloadCourses,
	TPayloadReviews,
	User,
} from '@globals/types'
import { parseReviewId } from './utilityFunctions'
import {
	addOrUpdateCourse,
	addOrUpdateReview,
	updateCourseDataOnAddReview,
	updateReviewsRecentOnAddReview,
	updateCourseDataOnUpdateReview,
	updateReviewsRecentOnUpdateReview,
	updateCourseDataOnDeleteReview,
	updateReviewsRecentOnDeleteReview,
	updateUserDataOnAddReview,
	updateUserDataOnUpdateReview,
	updateUserDataOnDeleteReview,
} from '@backend/utilities'

const { COURSES } = coreDataDocuments

/* --- COURSES --- */
export const getCourses = async () => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${COURSES}`)
		)
		const coursesDataDoc: TPayloadCourses = snapshot.data() ?? {}
		return coursesDataDoc
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const getCourse = async (courseId: string) => {
	try {
		const coursesDataDoc = await getCourses()
		return coursesDataDoc ? coursesDataDoc[courseId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const addCourse = async (courseId: string, courseData: Course) =>
	addOrUpdateCourse(courseId, courseData)
export const updateCourse = async (courseId: string, courseData: Course) =>
	addOrUpdateCourse(courseId, courseData)
export const deleteCourse = async (courseId: string) => {
	try {
		const coursesDataDoc = await getCourses()
		if (coursesDataDoc && Object.keys(coursesDataDoc).length) {
			delete coursesDataDoc[courseId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${COURSES}`),
				coursesDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- REVIEWS (keyed by courseId-year-semesterId) --- */
export const getReviews = async (
	courseId: string,
	year: string,
	semesterTerm: string
) => {
	try {
		const snapshot = await getDoc(
			doc(
				db,
				`${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`
			)
		)
		const allReviewsData: TPayloadReviews = snapshot.data() ?? {}
		return allReviewsData
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

// N.B. End of array has additional "buffer reviews" (initialized to 20) to
// guard against net deletion below 50. Return value should be sliced by
// caller in order to limit to only 50 accordingly, i.e.,:
//   let reviews = await getReviewsRecent()
//   reviews = reviews?.slice(0, 50)
export const getReviewsRecent = async (courseId?: TCourseId) => {
	try {
		// N.B. use empty args version for non-course-specific/aggregated array
		const dataId = courseId ?? `_aggregateData`

		const snapshot = await getDoc(
			doc(db, `${baseCollectionRecentsData}/${dataId}`)
		)
		const data = snapshot.data()
		const reviewsRecent: Review[] = data ? data?.data : []
		return reviewsRecent
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const getReview = async (reviewId: string) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		const review: Review = reviewsDataDoc[reviewId] ?? {}
		return review
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addReview = async (
	userId: string,
	reviewId: string,
	reviewData: Review
) => {
	try {
		await addOrUpdateReview(reviewId, reviewData)
		await updateCourseDataOnAddReview(reviewId, reviewData)
		await updateReviewsRecentOnAddReview(reviewData)
		await updateUserDataOnAddReview(userId, reviewData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateReview = async (
	userId: string,
	reviewId: string,
	reviewData: Review
) => {
	try {
		await addOrUpdateReview(reviewId, reviewData)
		await updateCourseDataOnUpdateReview(reviewId, reviewData)
		await updateReviewsRecentOnUpdateReview(reviewData)
		await updateUserDataOnUpdateReview(userId, reviewData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const deleteReview = async (userId: string, reviewId: string) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		if (
			reviewsDataDoc &&
			Object.keys(reviewsDataDoc).length &&
			reviewsDataDoc[reviewId]
		) {
			// delete review from collection `reviewsData`
			delete reviewsDataDoc[reviewId]
			await setDoc(
				doc(
					db,
					`${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`
				),
				reviewsDataDoc
			)

			await updateCourseDataOnDeleteReview(reviewId)
			await updateReviewsRecentOnDeleteReview(reviewId)
			await updateUserDataOnDeleteReview(userId, reviewId)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- USERS --- */
export const getUser = async (userId: string) => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionUsersData}/${userId}`)
		)
		// @ts-ignore -- coerce to `User` entity based on known form of snapshot.data() per Firestore db data
		const userData: User = snapshot.data() ?? { userId: null, reviews: {} }
		return userData
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addUser = async (userId: string) => {
	try {
		const newUserData: User = { userId, reviews: {} }
		await setDoc(doc(db, `${baseCollectionUsersData}/${userId}`), newUserData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const editUser = async (userId: string, userData: User) => {
	try {
		const oldUserData = await getUser(userId)
		const updatedUserData = {
			...oldUserData,
			...userData,
		}
		await setDoc(
			doc(db, `${baseCollectionUsersData}/${userId}`),
			updatedUserData
		)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const deleteUser = async (userId: string) => {
	try {
		await deleteDoc(doc(db, `${baseCollectionUsersData}/${userId}`))
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
