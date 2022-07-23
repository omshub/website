import {
	collection,
	doc,
	getDocs,
	addDoc,
	deleteDoc,
	query,
	where,
} from 'firebase/firestore'
import { db } from './FirebaseConfig'
import { collections } from './constants'
import {
	Course,
	Program,
	Semester,
	Department,
	Specialization,
} from './collectionsTypes'
import { setDoc } from 'firebase/firestore'

const {
	COURSES,
	DEPARTMENTS,
	PROGRAMS,
	// REVIEWS,
	SEMESTERS,
	SPECIALIZATIONS,
	// USERS,
} = collections

type TCollection = Course | Program | Semester | Department | Specialization

/* --- Utility Functions --- */
const nameOf = (id: string) => Object.keys({ id })[0]

/* --- CRUD Operations --- */
const getAll = async (collectionName: string) =>
	getDocs(query(collection(db, collectionName)))
const get = async (collectionName: string, id: string) =>
	getDocs(query(collection(db, collectionName), where(nameOf(id), '==', id)))
const add = async (collectionName: string, data: TCollection) =>
	addDoc(collection(db, collectionName), data)
const update = async (collectionName: string, id: string, data: TCollection) =>
	setDoc(doc(db, collectionName, id), data)
const del = async (collectionName: string, id: string) =>
	deleteDoc(doc(db, collectionName, id))

// Courses
export const getCourses = async () => getAll(COURSES)
export const getCourse = async (courseId: string) => get(COURSES, courseId)
export const addCourse = async (courseData: Course) => add(COURSES, courseData)
export const updateCourse = async (courseId: string, courseData: Course) =>
	update(COURSES, courseId, courseData)
export const deleteCourse = async (courseId: string) => del(COURSES, courseId)

// Departments
export const getDepartments = async () => getAll(DEPARTMENTS)
export const getDepartment = async (departmentId: string) =>
	get(DEPARTMENTS, departmentId)
export const addDepartment = async (departmentData: Department) =>
	add(DEPARTMENTS, departmentData)
export const updateDepartment = async (
	departmentId: string,
	departmentData: Department
) => update(DEPARTMENTS, departmentId, departmentData)
export const deleteDepartment = async (departmentId: string) =>
	del(DEPARTMENTS, departmentId)

// Programs
export const getPrograms = async () => getAll(PROGRAMS)
export const getProgram = async (programId: string) => get(PROGRAMS, programId)
export const addProgram = async (programData: Program) =>
	add(PROGRAMS, programData)
export const updateProgram = async (programId: string, programData: Program) =>
	update(PROGRAMS, programId, programData)
export const deleteProgram = async (programId: string) =>
	del(PROGRAMS, programId)

// Semesters
export const getSemesters = async () => getAll(SEMESTERS)
export const getSemester = async (semesterId: string) =>
	get(SEMESTERS, semesterId)
export const addSemester = async (semesterData: Semester) =>
	add(SEMESTERS, semesterData)
export const updateSemester = async (
	semesterId: string,
	semesterData: Semester
) => update(SEMESTERS, semesterId, semesterData)
export const deleteSemester = async (semesterId: string) =>
	del(SEMESTERS, semesterId)

// Specializations
export const getSpecializations = async () => getAll(SPECIALIZATIONS)
export const getSpecialization = async (specializationId: string) =>
	get(SPECIALIZATIONS, specializationId)
export const addSpecialization = async (specializationData: Specialization) =>
	add(SPECIALIZATIONS, specializationData)
export const updateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => update(SPECIALIZATIONS, specializationId, specializationData)
export const deleteSpecialization = async (specializationId: string) =>
	del(SPECIALIZATIONS, specializationId)
