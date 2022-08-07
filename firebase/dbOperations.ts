import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	coreDataDocuments,
	baseCollectionReviewsData,
	baseDocumentReviewsRecent50,
} from './constants'
import {
	Course,
	Department,
	Program,
	Review,
	Semester,
	Specialization,
	TPayloadReviews,
} from '../globals/types'
import { parseReviewId } from './utilityFunctions'
import {
	get,
	getAll,
	addOrUpdate,
	del,
	addOrUpdateReview,
	updateCourseDataOnAddReview,
	updateReviewsRecent50OnAddReview,
	updateCourseDataOnUpdateReview,
	updateReviewsRecent50OnUpdateReview,
	updateCourseDataOnDeleteReview,
	updateReviewsRecent50OnDeleteReview,
} from './utilities'

const { COURSES, DEPARTMENTS, PROGRAMS, SEMESTERS, SPECIALIZATIONS } =
	coreDataDocuments

/* --- COURSES --- */
export const getCourses = async () => getAll(COURSES)
export const getCourse = async (courseId: string) => get(COURSES, courseId)
export const addCourse = async (courseId: string, courseData: Course) =>
	addOrUpdate(COURSES, courseId, courseData)
export const updateCourse = async (courseId: string, courseData: Course) =>
	addOrUpdate(COURSES, courseId, courseData)
export const deleteCourse = async (courseId: string) => del(COURSES, courseId)

/* --- DEPARTMENTS --- */
export const getDepartments = async () => getAll(DEPARTMENTS)
export const getDepartment = async (departmentId: string) =>
	get(DEPARTMENTS, departmentId)
export const addDepartment = async (
	departmentId: string,
	departmentData: Department
) => addOrUpdate(DEPARTMENTS, departmentId, departmentData)
export const updateDepartment = async (
	departmentId: string,
	departmentData: Department
) => addOrUpdate(DEPARTMENTS, departmentId, departmentData)
export const deleteDepartment = async (departmentId: string) =>
	del(DEPARTMENTS, departmentId)

/* --- PROGRAMS --- */
export const getPrograms = async () => getAll(PROGRAMS)
export const getProgram = async (programId: string) => get(PROGRAMS, programId)
export const addProgram = async (programId: string, programData: Program) =>
	addOrUpdate(PROGRAMS, programId, programData)
export const updateProgram = async (programId: string, programData: Program) =>
	addOrUpdate(PROGRAMS, programId, programData)
export const deleteProgram = async (programId: string) =>
	del(PROGRAMS, programId)

/* --- SEMESTERS --- */
export const getSemesters = async () => getAll(SEMESTERS)
export const getSemester = async (semesterId: string) =>
	get(SEMESTERS, semesterId)
export const addSemester = async (semesterId: string, semesterData: Semester) =>
	addOrUpdate(SEMESTERS, semesterId, semesterData)
export const updateSemester = async (
	semesterId: string,
	semesterData: Semester
) => addOrUpdate(SEMESTERS, semesterId, semesterData)
export const deleteSemester = async (semesterId: string) =>
	del(SEMESTERS, semesterId)

/* --- SPECIALIZATIONS --- */
export const getSpecializations = async () => getAll(SPECIALIZATIONS)
export const getSpecialization = async (specializationId: string) =>
	get(SPECIALIZATIONS, specializationId)
export const addSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => addOrUpdate(SPECIALIZATIONS, specializationId, specializationData)
export const updateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => addOrUpdate(SPECIALIZATIONS, specializationId, specializationData)
export const deleteSpecialization = async (specializationId: string) =>
	del(SPECIALIZATIONS, specializationId)

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
//   let reviews = await getReviewsRecent50()
//   reviews = reviews?.slice(0, 50)
export const getReviewsRecent50 = async () => {
	try {
		const snapshot = await getDoc(doc(db, baseDocumentReviewsRecent50))
		const recentReviews50 = snapshot.data()
		return recentReviews50 ?? null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const getReview = async (reviewId: string) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		return reviewsDataDoc ? reviewsDataDoc[reviewId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addReview = async (reviewId: string, reviewData: Review) => {
	try {
		await addOrUpdateReview(reviewId, reviewData)
		await updateCourseDataOnAddReview(reviewId, reviewData)
		await updateReviewsRecent50OnAddReview(reviewData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const updateReview = async (reviewId: string, reviewData: Review) => {
	try {
		await addOrUpdateReview(reviewId, reviewData)
		await updateCourseDataOnUpdateReview(reviewId, reviewData)
		await updateReviewsRecent50OnUpdateReview(reviewData)
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const deleteReview = async (reviewId: string) => {
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
			await updateReviewsRecent50OnDeleteReview(reviewId)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
