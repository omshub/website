/* 
	This script generates the initial data object/payload used to seed
	the Firebase Firestore db.
*/

// eslint-disable-file no-unused-vars

/* --- IMPORTS ---*/
const reviews = require('../firebase/seed/data/reviews')
// N.B. `coursesData` already contains the computed values resulting from this script
const coursesData = require('../firebase/seed/data/courses')

/* --- UTILITIES ---*/
const computeAverage = (fieldArray, numReviews) =>
	fieldArray.reduce((sum, field) => sum + field, 0) / numReviews

const mapSemesterIdToTerm = {
	sp: 1,
	sm: 2,
	fa: 3,
}

/* --- DATA GENERATION SCRIPT ---*/

// get number of reviews for each course
const numReviewsMap = {}
reviews.forEach(({ courseId }) => {
	if (!numReviewsMap[courseId]) {
		numReviewsMap[courseId] = 1
	} else {
		numReviewsMap[courseId] = numReviewsMap[courseId] + 1
	}
})

// initialize `courseDataMap` with static data, and field `numReviews`
const coursesDataMap = {}
coursesData.forEach(
	({
		courseId,
		name,
		departmentId,
		courseNumber,
		url,
		aliases,
		isDeprecated,
		isFoundational,
	}) =>
		(coursesDataMap[courseId] = {
			courseId,
			name,
			departmentId,
			courseNumber,
			url,
			aliases,
			isDeprecated,
			isFoundational,
			numReviews: numReviewsMap[courseId] ? numReviewsMap[courseId] : 0,
		})
)

// add additional dynamic fields (averages and `reviewsCountsByYearSem` map)
Object.keys(coursesDataMap).forEach((courseId) => {
	const numReviews = coursesDataMap[courseId].numReviews
	const avgStaffSupport = null // N.B. field `staffSupport` was not collected in the legacy platform
	let avgWorkload = 0
	let avgDifficulty = 0
	let avgOverall = 0
	const reviewsCountsByYearSem = {}

	const courseReviews = reviews.filter((review) => review.courseId === courseId)

	coursesDataMap[courseId].avgStaffSupport = avgStaffSupport

	const workloads = Object.entries(courseReviews).map(
		([_, { workload }]) => workload
	)
	avgWorkload =
		numReviews && workloads.length
			? computeAverage(workloads, numReviews)
			: null
	coursesDataMap[courseId].avgWorkload = avgWorkload

	const difficulties = Object.entries(courseReviews).map(
		([_, { difficulty }]) => difficulty
	)
	avgDifficulty =
		numReviews && workloads.length
			? computeAverage(difficulties, numReviews)
			: null
	coursesDataMap[courseId].avgDifficulty = avgDifficulty

	const overalls = Object.entries(courseReviews).map(
		([_, { overall }]) => overall
	)
	avgOverall =
		numReviews && workloads.length ? computeAverage(overalls, numReviews) : null
	coursesDataMap[courseId].avgOverall = avgOverall

	const yearSemArray = Object.entries(courseReviews).map(
		([_, { year, semesterId }]) => [year, mapSemesterIdToTerm[semesterId]]
	)
	yearSemArray.forEach(([year, semesterTerm]) => {
		if (!reviewsCountsByYearSem[year]) {
			reviewsCountsByYearSem[year] = {}
		}

		if (!reviewsCountsByYearSem[year][semesterTerm]) {
			reviewsCountsByYearSem[year][semesterTerm] = 0
		}

		reviewsCountsByYearSem[year][semesterTerm] =
			reviewsCountsByYearSem[year][semesterTerm] + 1
	})

	coursesDataMap[courseId].reviewsCountsByYearSem = reviewsCountsByYearSem
})

/* --- EXPORT COURSES DATA MAP OBJECT ---*/
module.exports = coursesDataMap

// REFERENCE ONLY: example call to seed the Firestore db (cf. `./script.js` for full seeding script)
/*
const { initializeApp } = require('firebase/app')
const { getFirestore, setDoc, doc } = require('firebase/firestore')

const firebaseApp = initializeApp(config) // cf. `./example.env.js` for environment config
const db = getFirestore(firebaseApp)

const coursesDataMap = require('__seed__/createCoursesDataMap')

;(async () => {
	await setDoc(doc('coreData', 'courses', coursesDataMap)) // creates document `coreData/courses` in Firebase Firestore
})()
*/
