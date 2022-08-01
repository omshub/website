const { initializeApp } = require('firebase/app')
const { getFirestore, setDoc, doc } = require('firebase/firestore')
const _ = require('lodash')

// N.B. See `./example.env.js` for how to populate `.env.js`
const { config } = require('./.env')

const courses = require('./data/courses')
const departments = require('./data/departments')
const programs = require('./data/programs')
const reviews = require('./data/reviews')
const semesters = require('./data/semesters')
const specializations = require('./data/specializations')

// Initialize Firebase app & services
const firebaseApp = initializeApp(config)
const db = getFirestore(firebaseApp)

// convert seed data from array form to map form

/* --- CORE DATA --- */
const coursesMap = {}
courses.forEach((course) => {
	coursesMap[course.courseId] = course
})

const departmentsMap = {}
departments.forEach((department) => {
	departmentsMap[department.departmentId] = department
})

const programsMap = {}
programs.forEach((program) => {
	programsMap[program.programId] = program
})

const semestersMap = {}
semesters.forEach((semester) => {
	semestersMap[semester.semesterId] = semester
})

const specializationsMap = {}
specializations.forEach((specialization) => {
	specializationsMap[specialization.specializationId] = specialization
})

/* --- REVIEWS DATA --- */
const mapSemIdToTerm = {
	sp: 1,
	sm: 2,
	fa: 3,
}

const reviewsDataMaps = {}
_.sortBy(reviews, ['courseId', 'reviewId']).forEach((review) => {
	const { year, semesterId, courseId, reviewId } = review
	const semesterTerm = mapSemIdToTerm[semesterId]
	const key = `${year}-${semesterTerm}`

	if (!reviewsDataMaps[courseId]) {
		reviewsDataMaps[courseId] = {}
	}

	if (!reviewsDataMaps[courseId][key]) {
		reviewsDataMaps[courseId][key] = {}
	}
	reviewsDataMaps[courseId][key][reviewId] = review
})

const reviewsRecent50 = []
reviews
	.sort((a, b) => b.created - a.created)
	.slice(0, 50)
	.forEach((review) => {
		reviewsRecent50.push(review)
	})

// Seed Firebase Firestore collections in the cloud
const add = async (collectionName, newDocId, data) =>
	setDoc(doc(db, collectionName, newDocId), data)

// seed core data
;(async () => {
	await add('coreData', 'courses', coursesMap)
	await add('coreData', 'departments', departmentsMap)
	await add('coreData', 'programs', programsMap)
	await add('coreData', 'semesters', semestersMap)
	await add('coreData', 'specializations', specializationsMap)
})()

// seed reviews data
for (const courseId in reviewsDataMaps) {
	const yearSem = reviewsDataMaps[courseId]
	for (const yearSemId in yearSem) {
		const reviewData = yearSem[yearSemId]
		;(async () =>
			add(`reviewsData/${courseId}/${yearSemId}`, 'data', reviewData))()
	}
}

;(async () => add(`reviewsRecent50`, 'reviews', { data: reviewsRecent50 }))()
