import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	coreDataDocuments,
	baseCollectionCoreData,
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
	TPayloadCourses,
	TPayloadDepartments,
	TPayloadPrograms,
	TPayloadReviews,
	TPayloadSemesters,
	TPayloadSpecializations,
} from '@globals/types'
import { parseReviewId } from './utilityFunctions'
import {
	addOrUpdateReview,
	updateCourseDataOnAddReview,
	updateReviewsRecent50OnAddReview,
	updateCourseDataOnUpdateReview,
	updateReviewsRecent50OnUpdateReview,
	updateCourseDataOnDeleteReview,
	updateReviewsRecent50OnDeleteReview,
	addOrUpdateCourse,
	addOrUpdateDepartment,
	addOrUpdateProgram,
	addOrUpdateSemester,
	addOrUpdateSpecialization,
} from './utilities'

const { COURSES, DEPARTMENTS, PROGRAMS, SEMESTERS, SPECIALIZATIONS } =
	coreDataDocuments

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

/* --- DEPARTMENTS --- */
export const getDepartments = async () => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${DEPARTMENTS}`)
		)
		const departmentsDataDoc: TPayloadDepartments = snapshot.data() ?? {}
		return departmentsDataDoc
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const getDepartment = async (departmentId: string) => {
	try {
		const departmentsDataDoc = await getDepartments()
		return departmentsDataDoc ? departmentsDataDoc[departmentId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const addDepartment = async (
	departmentId: string,
	departmentData: Department
) => addOrUpdateDepartment(departmentId, departmentData)
export const updateDepartment = async (
	departmentId: string,
	departmentData: Department
) => addOrUpdateDepartment(departmentId, departmentData)
export const deleteDepartment = async (departmentId: string) => {
	try {
		const departmentsDataDoc = await getDepartments()
		if (departmentsDataDoc && Object.keys(departmentsDataDoc).length) {
			delete departmentsDataDoc[departmentId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${DEPARTMENTS}`),
				departmentsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- PROGRAMS --- */
export const getPrograms = async () => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${PROGRAMS}`)
		)
		const programsDataDoc: TPayloadPrograms = snapshot.data() ?? {}
		return programsDataDoc
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const getProgram = async (programId: string) => {
	try {
		const programsDataDoc = await getPrograms()
		return programsDataDoc ? programsDataDoc[programId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const addProgram = async (programId: string, programData: Program) =>
	addOrUpdateProgram(programId, programData)
export const updateProgram = async (programId: string, programData: Program) =>
	addOrUpdateProgram(programId, programData)
export const deleteProgram = async (programId: string) => {
	try {
		const programsDataDoc = await getPrograms()
		if (programsDataDoc && Object.keys(programsDataDoc).length) {
			delete programsDataDoc[programId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${PROGRAMS}`),
				programsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
/* --- SEMESTERS --- */
export const getSemesters = async () => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${SEMESTERS}`)
		)
		const semestersDataDoc: TPayloadSemesters = snapshot.data() ?? {}
		return semestersDataDoc
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const getSemester = async (semesterId: string) => {
	try {
		const semestersDataDoc = await getSemesters()
		return semestersDataDoc ? semestersDataDoc[semesterId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const addSemester = async (semesterId: string, semesterData: Semester) =>
	addOrUpdateSemester(semesterId, semesterData)
export const updateSemester = async (
	semesterId: string,
	semesterData: Semester
) => addOrUpdateSemester(semesterId, semesterData)
export const deleteSemester = async (semesterId: string) => {
	try {
		const semestersDataDoc = await getSemesters()
		if (semestersDataDoc && Object.keys(semestersDataDoc).length) {
			delete semestersDataDoc[semesterId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${SEMESTERS}`),
				semestersDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/* --- SPECIALIZATIONS --- */
export const getSpecializations = async () => {
	try {
		const snapshot = await getDoc(
			doc(db, `${baseCollectionCoreData}/${SPECIALIZATIONS}`)
		)
		const specializationsDataDoc: TPayloadSpecializations =
			snapshot.data() ?? {}
		return specializationsDataDoc
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const getSpecialization = async (specializationId: string) => {
	try {
		const specializationsDataDoc = await getSpecializations()
		return specializationsDataDoc
			? specializationsDataDoc[specializationId]
			: null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
export const addSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => addOrUpdateSpecialization(specializationId, specializationData)
export const updateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => addOrUpdateSpecialization(specializationId, specializationData)
export const deleteSpecialization = async (specializationId: string) => {
	try {
		const specializationsDataDoc = await getSpecializations()
		if (specializationsDataDoc && Object.keys(specializationsDataDoc).length) {
			delete specializationsDataDoc[specializationId]
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${SPECIALIZATIONS}`),
				specializationsDataDoc
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
//   let reviews = await getReviewsRecent50()
//   reviews = reviews?.slice(0, 50)
export const getReviewsRecent50 = async () => {
	try {
		const snapshot = await getDoc(doc(db, baseDocumentReviewsRecent50))
		const data = snapshot.data()
		const recentReviews50: Review[] = data ? data?.data : []
		return recentReviews50
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
