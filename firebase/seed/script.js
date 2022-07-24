const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc } = require('firebase/firestore')

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

const add = async (collectionName, data) =>
	addDoc(collection(db, collectionName), data)

// Seed Firebase Firestore collections in the cloud
courses.forEach(async (courseData) => add('courses', courseData))
departments.forEach(async (departmentData) =>
	add('departments', departmentData)
)
programs.forEach(async (programData) => add('programs', programData))
reviews.forEach(async (reviewData) => add('reviews', reviewData))
semesters.forEach(async (semesterData) => add('semesters', semesterData))
specializations.forEach(async (specializationData) =>
	add('specializations', specializationData)
)
