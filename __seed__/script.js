const { initializeApp } = require('firebase/app')
const {
	getFirestore,
	setDoc,
	doc,
	connectFirestoreEmulator,
} = require('firebase/firestore')
const _ = require('lodash')

// N.B. See `./example.env.js` for how to populate `.env.js`
const { config } = require('./.env')

const departments = require('./data/departments')
const programs = require('./data/programs')
const semesters = require('./data/semesters')
const specializations = require('./data/specializations')

// Initialize Firebase app & services
const firebaseApp = initializeApp(config)
const db = getFirestore(firebaseApp)

// By default, seed runs for local Firestore emulator, rather than for cloud/Firebase
// N.B. To run seed (i.e., via `yarn db:seed`), must configure firestore emulator
// accordingly (i.e., set "rules" in `firebase.json` to point to `firebase.local.rules`
// before running the emulator from the command-line)
const isSeedingInCloud = process.argv[2] === 'SEED_FIREBASE_FIRESTORE_IN_CLOUD'
if (!isSeedingInCloud) {
	connectFirestoreEmulator(db, 'localhost', 8080)
}

// convert seed data from array form to map form

/* --- CORE DATA --- */
const coursesMap = require('./createCoursesDataMap')

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

const reviews = require('./data/reviews')
const recentsMap = require('./createRecentsDataMap')

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

const reviewsDataMapFlat = {}
reviews.forEach((review) => {
	reviewsDataMapFlat[review.reviewId] = review
})

// Seed Firebase Firestore collections
const add = async (collectionName, newDocId, data) =>
	setDoc(doc(db, collectionName, newDocId), data)

// seed core data
;(async () => {
	await add('coreData', 'courses', coursesMap)
	await add('coreData', '_coursesLegacySnapshot', coursesMap) // retain separate "legacy snapshot" for "baseline accounting" purposes

	/*
		N.B. Deprecated -- below are all static data which can be stored client-side instead (cf. `/globals/types.ts`)
	*/
	// await add('coreData', 'departments', departmentsMap)
	// await add('coreData', 'programs', programsMap)
	// await add('coreData', 'semesters', semestersMap)
	// await add('coreData', 'specializations', specializationsMap)
})()

// seed reviews data

// nested to minimize ops
for (const courseId in reviewsDataMaps) {
	const yearSem = reviewsDataMaps[courseId]
	for (const yearSemId in yearSem) {
		const reviewData = yearSem[yearSemId]
		;(async () =>
			add(`reviewsData/${courseId}/${yearSemId}`, 'data', reviewData))()
	}
}

// flat
const msg =
	'This is a placeholder only, created here to prevent landing on large-read collections on initial load of Firestore UI. WARNING: Clicking on `_reviewsDataFlat` will cause 500+ read operations, therefore, only access it via Firestore UI if necessary.'
;(async () => add('__dummy', 'do-not-use', { msg }))()

for (const reviewId in reviewsDataMapFlat) {
	const data = reviewsDataMapFlat[reviewId]
	;(async () => add('_reviewsDataFlat', reviewId, data))()
}

// seed recents data (N.B. includes `_aggregateData` array)
Object.entries(recentsMap).forEach(async ([courseId, reviewsArray]) =>
	setDoc(doc(db, `recentsData/${courseId}`), {
		data: reviewsArray.sort((a, b) => a.created - b.created),
	})
)
