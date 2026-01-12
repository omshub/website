import {
  /* --- COURSES --- */
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  /* --- REVIEWS --- */
  getReviews,
  getReviewsRecent,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  /* --- USERS --- */
  getUser,
  addUser,
  editUser,
  deleteUser,
} from '@/lib/firebase/dbOperations';

const backend = {
  /* --- COURSES --- */
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  /* --- REVIEWS --- */
  getReviews,
  getReviewsRecent,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  /* --- USERS --- */
  getUser,
  addUser,
  editUser,
  deleteUser,
};

export default backend;
