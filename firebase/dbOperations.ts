import {
	collection,
	doc,
	getDocs,
	addDoc,
	setDoc,
	deleteDoc,
	query,
	// runTransaction,
	where,
	DocumentData,
} from 'firebase/firestore'
import { db } from './FirebaseConfig'
import { collections, idKeys, queryOperators } from './constants'
import {
	Course,
	Department,
	Program,
	Review,
	Semester,
	Specialization,
	TCollection,
} from './collectionsTypes'

const {
	COURSES,
	DEPARTMENTS,
	PROGRAMS,
	REVIEWS,
	SEMESTERS,
	SPECIALIZATIONS,
	// USERS,
} = collections

const {
	COURSE_ID,
	DEPARTMENT_ID,
	PROGRAM_ID,
	REVIEW_ID,
	SEMESTER_ID,
	SPECIALIZATION_ID,
	// USER_ID,
} = idKeys

const { EQUAL_TO } = queryOperators

// Base CRUD operations
const getAll = async (collectionName: string) => {
	const snapshot = await getDocs(query(collection(db, collectionName)))
	const allData: DocumentData[] = []
	snapshot.forEach((doc) => {
		allData.push(doc.data())
	})
	return allData
}
const get = async (collectionName: string, idKey: string, idValue: string) => {
	const snapshot = await getDocs(
		query(collection(db, collectionName), where(idKey, EQUAL_TO, idValue))
	)
	const data: DocumentData[] = []
	snapshot.forEach((doc) => {
		data.push(doc.data())
	})
	return data[0]
}
const add = async (collectionName: string, data: TCollection) =>
	addDoc(collection(db, collectionName), data)
const update = async (collectionName: string, id: string, data: TCollection) =>
	setDoc(doc(db, collectionName, id), data)
const del = async (collectionName: string, id: string) =>
	deleteDoc(doc(db, collectionName, id))

/* --- COURSES --- */
export const getCourses = async () => getAll(COURSES)
export const getCourse = async (courseId: string) =>
	get(COURSES, COURSE_ID, courseId)
export const addCourse = async (courseData: Course) => add(COURSES, courseData)
export const updateCourse = async (courseId: string, courseData: Course) =>
	update(COURSES, courseId, courseData)
export const deleteCourse = async (courseId: string) => del(COURSES, courseId)

/* --- DEPARTMENTS --- */
export const getDepartments = async () => getAll(DEPARTMENTS)
export const getDepartment = async (departmentId: string) =>
	get(DEPARTMENTS, DEPARTMENT_ID, departmentId)
export const addDepartment = async (departmentData: Department) =>
	add(DEPARTMENTS, departmentData)
export const updateDepartment = async (
	departmentId: string,
	departmentData: Department
) => update(DEPARTMENTS, departmentId, departmentData)
export const deleteDepartment = async (departmentId: string) =>
	del(DEPARTMENTS, departmentId)

/* --- PROGRAMS --- */
export const getPrograms = async () => getAll(PROGRAMS)
export const getProgram = async (programId: string) =>
	get(PROGRAMS, PROGRAM_ID, programId)
export const addProgram = async (programData: Program) =>
	add(PROGRAMS, programData)
export const updateProgram = async (programId: string, programData: Program) =>
	update(PROGRAMS, programId, programData)
export const deleteProgram = async (programId: string) =>
	del(PROGRAMS, programId)

/* --- REVIEWS --- */
export const getReviews = async () => getAll(REVIEWS)

export const getReview = async () => (reviewId: string) =>
	get(REVIEWS, REVIEW_ID, reviewId)
export const addReview = async (reviewData: Review) => {
	// Include a run transcations here to aggregate course statistics with an updateCourse
	return add(REVIEWS, reviewData)
}
export const updateReview = async (reviewId: string, reviewData: Review) =>
	// Will need to include a run transcations here to both update review data and recalculate course statistics
	update(REVIEWS, reviewId, reviewData)

export const deleteReview = async (reviewId: string) => del(REVIEWS, reviewId)

/* --- SEMESTERS --- */
export const getSemesters = async () => getAll(SEMESTERS)
export const getSemester = async (semesterId: string) =>
	get(SEMESTERS, SEMESTER_ID, semesterId)
export const addSemester = async (semesterData: Semester) =>
	add(SEMESTERS, semesterData)
export const updateSemester = async (
	semesterId: string,
	semesterData: Semester
) => update(SEMESTERS, semesterId, semesterData)
export const deleteSemester = async (semesterId: string) =>
	del(SEMESTERS, semesterId)

/* --- SPECIALIZATIONS --- */
export const getSpecializations = async () => getAll(SPECIALIZATIONS)
export const getSpecialization = async (specializationId: string) =>
	get(SPECIALIZATIONS, SPECIALIZATION_ID, specializationId)
export const addSpecialization = async (specializationData: Specialization) =>
	add(SPECIALIZATIONS, specializationData)
export const updateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => update(SPECIALIZATIONS, specializationId, specializationData)
export const deleteSpecialization = async (specializationId: string) =>
	del(SPECIALIZATIONS, specializationId)
