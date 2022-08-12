import { doc, setDoc } from 'firebase/firestore'
import { db } from './FirebaseConfig'
import {
	coreDataDocuments,
	baseCollectionCoreData,
	baseCollectionReviewsData,
	baseCollectionRecentsData,
} from './constants'
import {
	getCourses,
	getCourse,
	updateCourse,
	getReviews,
	getReview,
	getReviewsRecent,
} from './dbOperations'
import { Course, Review, TPayloadCourses } from '@globals/types'
import { TDocumentData, TDocumentDataObject } from '@backend/documentsDataTypes'
import { parseReviewId, updateAverages } from '@backend/utilityFunctions'

const { COURSES } = coreDataDocuments

/* --- COURSE DATA CRUD SUB-OPERATIONS --- */

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
		let dataArray = await getReviewsRecent()
		if (dataArray && dataArray?.length) {
			dataArray.unshift(newReviewData)
			if (dataArray.length > 50) {
				// maintain buffer size
				dataArray.pop()
			}
			await setDoc(doc(db, baseCollectionRecentsData), { data: dataArray })
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
		let dataArray = await getReviewsRecent()
		if (dataArray && dataArray?.length) {
			const indexFoundAt = dataArray
				.map(({ reviewId }: Review) => reviewId)
				.indexOf(newReviewData.reviewId)
			if (indexFoundAt !== -1) {
				dataArray[indexFoundAt] = newReviewData
				await setDoc(doc(db, baseCollectionRecentsData), {
					data: dataArray,
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
		let dataArray = await getReviewsRecent()
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

				await setDoc(doc(db, baseCollectionRecentsData), {
					data: dataArray,
				})
			}
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

/*
	The following operations are deprecated. This is generally static/non-dynamic
	data which is not otherwise dependent on user-generated data in Firestore.
	Corresponding API has been ported to client-side; cf. `/globals/utilities.ts`
	for reference.
*/
/*

import {
	getDepartments,
	getPrograms,
	getSemesters,
	getSpecializations,
} from './dbOperations'

import {
	Department,
	Program,
	Semester,
	Specialization,
	TPayloadDepartments,
	TPayloadPrograms,
	TPayloadSemesters,
	TPayloadSpecializations,
} from '@globals/types'

const { DEPARTMENTS, PROGRAMS, SEMESTERS, SPECIALIZATIONS } =
	coreDataDocuments

export const addOrUpdateDepartment = async (
	departmentId: string,
	departmentData: Department
) => {
	try {
		const departmentsDataDoc = await getDepartments()
		let newDepartmentsDataDoc: TPayloadDepartments = {}
		if (departmentsDataDoc) {
			if (Object.keys(departmentsDataDoc).length) {
				newDepartmentsDataDoc = { ...departmentsDataDoc }
			}
			newDepartmentsDataDoc[departmentId] = departmentData
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${DEPARTMENTS}`),
				newDepartmentsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addOrUpdateProgram = async (
	programId: string,
	programData: Program
) => {
	try {
		const programsDataDoc = await getPrograms()
		let newProgramsDataDoc: TPayloadPrograms = {}
		if (programsDataDoc) {
			if (Object.keys(programsDataDoc).length) {
				newProgramsDataDoc = { ...programsDataDoc }
			}
			newProgramsDataDoc[programId] = programData
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${PROGRAMS}`),
				newProgramsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addOrUpdateSemester = async (
	semesterId: string,
	semesterData: Semester
) => {
	try {
		const semestersDataDoc = await getSemesters()
		let newSemestersDataDoc: TPayloadSemesters = {}
		if (semestersDataDoc) {
			if (Object.keys(semestersDataDoc).length) {
				newSemestersDataDoc = { ...semestersDataDoc }
			}
			newSemestersDataDoc[semesterId] = semesterData
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${SEMESTERS}`),
				newSemestersDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}

export const addOrUpdateSpecialization = async (
	specializationId: string,
	specializationData: Specialization
) => {
	try {
		const specializationsDataDoc = await getSpecializations()
		let newSpecializationsDataDoc: TPayloadSpecializations = {}
		if (specializationsDataDoc) {
			if (Object.keys(specializationsDataDoc).length) {
				newSpecializationsDataDoc = { ...specializationsDataDoc }
			}
			newSpecializationsDataDoc[specializationId] = specializationData
			await setDoc(
				doc(db, `${baseCollectionCoreData}/${SPECIALIZATIONS}`),
				newSpecializationsDataDoc
			)
		}
	} catch (e: any) {
		console.log(e)
		throw new Error(e)
	}
}
*/
