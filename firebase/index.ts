import {
	getCourses,
	getCourse,
	getReview,
	getReviews,
	getReviewsRecent50,
} from './dbOperations'

export default {
	// page `index.ts`
	getCourses,

	// page `reviews.ts`
	getReviews,
	getReviewsRecent50,

	// page `[classid].tsx` -- TODO: combine into new page `reviews.ts`
	getCourse,

	// page `[reviewid].tsx`
	getReview,
}