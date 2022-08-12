/* 
	This script generates the initial data object/payload used to seed
	the Firebase Firestore db collection `recents`.
*/

const reviews = require('./data/reviews')
const courses = require('./data/courses')

const RECENTS_TOTAL = 50 // <= 50 most recent reviews
const BUFFER = 20 // add padding to prevent net deletion below `RECENTS_TOTAL` count
const ARR_LEN = RECENTS_TOTAL + BUFFER

// initialize
const recentsMap = {}
courses.forEach(({ courseId }) => (recentsMap[courseId] = []))

// N.B. sorted oldest-to-newest by default -- push "on new" server-side, then
// reverse "on retrieve" in endpoint to client-side
const reviewsSorted = reviews.sort((b, a) => a.created - b.created)

const KEY_AGGREGATE_DATA = '_aggregateData'
recentsMap[KEY_AGGREGATE_DATA] = reviewsSorted.slice(0, ARR_LEN)

reviewsSorted.forEach((review) => {
	recentsMap[review.courseId].push(review)
})

// truncate
Object.entries(recentsMap).forEach(([courseId, courseReviews]) => {
	if (courseReviews.length > ARR_LEN) {
		recentsMap[courseId] = recentsMap[courseId].slice(0, ARR_LEN)
	}
})

module.exports = recentsMap
