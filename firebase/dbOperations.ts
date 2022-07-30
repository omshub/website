import {
	doc,
	getDoc,
	setDoc,
	// runTransaction,
} from 'firebase/firestore'
import { db } from './FirebaseConfig'
import { coreDataDocuments } from './constants'
import {
	Course,
	Department,
	Program,
	Review,
	Semester,
	Specialization,
	TDocumentData,
	TDocumentDataObject,
} from './documentsDataTypes'

const { COURSES, DEPARTMENTS, PROGRAMS, SEMESTERS, SPECIALIZATIONS } =
	coreDataDocuments

// Base CRUD operations (core data)
const baseCollectionCoreData = 'coreData'

const getAll = async (dataDocName: string) => {
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
const get = async (dataDocName: string, dataId: string) => {
	try {
		const coreDataDoc = await getAll(dataDocName)
		return coreDataDoc ? coreDataDoc[dataId] : null
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
const addOrUpdate = async (
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
const del = async (dataDocName: string, dataId: string) => {
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
const baseCollectionReviewsData = 'reviewsData'
const LEN_SIMPLE_COURSE_NUMBER = 5 //   DD-CCCC     (e.g., CS-6200)
const LEN_COMPOUND_COURSE_NUMBER = 6 // DD-CCCC-CCC (e.g., CS-8803-O08)

const parseReviewId = (reviewId: string) => {
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
		const allReviewsData = snapshot.data()
		return allReviewsData ?? null
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

const addOrUpdateReview = async (reviewId: string, data: TDocumentData) => {
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

export const addReview = async (reviewId: string, reviewData: Review) => {
	// Include a run transactions here to aggregate course statistics with an updateCourse
	await addOrUpdateReview(reviewId, reviewData)
}

export const updateReview = async (reviewId: string, reviewData: Review) => {
	// Will need to include a run transactions here to both update review data and recalculate course statistics
	await addOrUpdateReview(reviewId, reviewData)
}

export const deleteReview = async (reviewId: string) => {
	try {
		const { courseId, year, semesterTerm } = parseReviewId(reviewId)
		const reviewsDataDoc = await getReviews(courseId, year, semesterTerm)
		if (reviewsDataDoc) {
			delete reviewsDataDoc[reviewId]
			await setDoc(
				doc(
					db,
					`${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`
				),
				reviewsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
