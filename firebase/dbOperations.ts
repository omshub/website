import {
	collection,
	doc,
	getDocs,
	getDoc,
	setDoc,
	deleteDoc,
	query,
	// runTransaction,
	DocumentData,
} from 'firebase/firestore'
import { db } from './FirebaseConfig'
import { collections } from './constants'
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

// Base CRUD operations
const getAll = async (collectionName: string) => {
	const snapshot = await getDocs(query(collection(db, collectionName)))
	const allData: DocumentData[] = []
	snapshot.forEach((doc) => {
		allData.push(doc.data())
	})
	return allData
}
const get = async (collectionName: string, documentId: string) => {
	const snapshot = await getDoc(doc(db, collectionName, documentId))
	return snapshot.data()
}
const add = async (
	collectionName: string,
	newDocumentId: string,
	data: TCollection
) => setDoc(doc(db, collectionName, newDocumentId), data)
const update = async (collectionName: string, id: string, data: TCollection) =>
	setDoc(doc(db, collectionName, id), data)
const del = async (collectionName: string, id: string) =>
	deleteDoc(doc(db, collectionName, id))

/* --- COURSES --- */
export const getCourses = async () => getAll(COURSES)
export const getCourse = async (courseId: string) => get(COURSES, courseId)
export const addCourse = async (courseId: string, courseData: Course) =>
	add(COURSES, courseId, courseData)
export const updateCourse = async (courseId: string, courseData: Course) =>
	update(COURSES, courseId, courseData)
export const deleteCourse = async (courseId: string) => del(COURSES, courseId)

/* --- DEPARTMENTS --- */
export const getDepartments = async () => getAll(DEPARTMENTS)
export const getDepartment = async (departmentId: string) =>
	get(DEPARTMENTS, departmentId)
export const addDepartment = async (
	departmentId: string,
	departmentData: Department
) => add(DEPARTMENTS, departmentId, departmentData)
export const updateDepartment = async (
	departmentId: string,
	departmentData: Department
) => update(DEPARTMENTS, departmentId, departmentData)
export const deleteDepartment = async (departmentId: string) =>
	del(DEPARTMENTS, departmentId)

/* --- PROGRAMS --- */
export const getPrograms = async () => getAll(PROGRAMS)
export const getProgram = async (programId: string) => get(PROGRAMS, programId)
export const addProgram = async (programId: string, programData: Program) =>
	add(PROGRAMS, programId, programData)
export const updateProgram = async (programId: string, programData: Program) =>
	update(PROGRAMS, programId, programData)
export const deleteProgram = async (programId: string) =>
	del(PROGRAMS, programId)

/* --- REVIEWS --- */
export const getReviews = async () => getAll(REVIEWS)
export const getReview = async () => (reviewId: string) =>
	get(REVIEWS, reviewId)
export const addReview = async (reviewId: string, reviewData: Review) => {
	// Include a run transcations here to aggregate course statistics with an updateCourse
	return add(REVIEWS, reviewId, reviewData)
}
export const updateReview = async (reviewId: string, reviewData: Review) =>
	// Will need to include a run transcations here to both update review data and recalculate course statistics
	update(REVIEWS, reviewId, reviewData)
export const deleteReview = async (reviewId: string) => del(REVIEWS, reviewId)

/* --- SEMESTERS --- */
export const getSemesters = async () => getAll(SEMESTERS)
export const getSemester = async (semesterId: string) =>
	get(SEMESTERS, semesterId)
export const addSemester = async (semesterId: string, semesterData: Semester) =>
	add(SEMESTERS, semesterId, semesterData)
export const updateSemester = async (
	semesterId: string,
	semesterData: Semester
) => update(SEMESTERS, semesterId, semesterData)
export const deleteSemester = async (semesterId: string) =>
	del(SEMESTERS, semesterId)

/* --- SPECIALIZATIONS --- */
export const getSpecializations = async () => getAll(SPECIALIZATIONS)
export const getSpecialization = async (specializationId: string) =>
	get(SPECIALIZATIONS, specializationId)
export const addSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => add(SPECIALIZATIONS, specializationId, specializationData)
export const updateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => update(SPECIALIZATIONS, specializationId, specializationData)
export const deleteSpecialization = async (specializationId: string) =>
	del(SPECIALIZATIONS, specializationId)
