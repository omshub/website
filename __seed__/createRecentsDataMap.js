/* 
	This script generates the initial data object/payload used to seed
	the Firebase Firestore db collection `recentsData`.
*/

const reviews = require('./data/reviews')
const courses = require('./data/courses')

const REVIEWS_RECENT_LEN = 50 // <= 50 most recent reviews
const REVIEWS_RECENT_BUFFER = 20 // add padding to prevent net deletion below `REVIEWS_RECENT_LEN` count
const REVIEWS_RECENT_TOTAL = REVIEWS_RECENT_LEN + REVIEWS_RECENT_BUFFER

// initialize
const recentsMap = {}
courses.forEach(({ courseId }) => (recentsMap[courseId] = []))

// N.B. sorted oldest-to-newest by default -- push "on new" server-side, then
// reverse "on retrieve" in endpoint to client-side
const reviewsSorted = reviews.sort((b, a) => a.created - b.created)

const KEY_AGGREGATE_DATA = '_aggregateData'
recentsMap[KEY_AGGREGATE_DATA] = reviewsSorted.slice(0, REVIEWS_RECENT_TOTAL)

reviewsSorted.forEach((review) => {
	recentsMap[review.courseId].push(review)
})

// truncate
Object.entries(recentsMap).forEach(([courseId, courseReviews]) => {
	if (courseReviews.length > REVIEWS_RECENT_TOTAL) {
		recentsMap[courseId] = recentsMap[courseId].slice(0, REVIEWS_RECENT_TOTAL)
	}
})

module.exports = recentsMap
