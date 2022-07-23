const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc } = require('firebase/firestore')

// see `./example.env.js` for how to populate `.env.js`
const { config } = require('./.env')
const { courses } = require('./data/courses')

// Initialize Firebase app & services
const firebaseApp = initializeApp(config)
const db = getFirestore(firebaseApp)

const add = async (collectionName, data) =>
	addDoc(collection(db, collectionName), data)

courses.forEach(async (courseData) => add('courses', courseData))
