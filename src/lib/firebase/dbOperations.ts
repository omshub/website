import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/FirebaseConfig';
import {
  coreDataDocuments,
  baseCollectionCoreData,
  baseCollectionReviewsData,
  baseCollectionReviewsDataFlat,
  baseCollectionRecentsData,
  baseCollectionUsersData,
} from '@/lib/firebase/constants';
import {
  CourseDataDynamic,
  Review,
  TCourseId,
  TPayloadCoursesDataDynamic,
  TPayloadReviews,
  User,
} from '@/lib/types';
import { parseReviewId } from '@/lib/firebase/utilityFunctions';
import {
  addOrUpdateCourse,
  addOrUpdateReview,
  updateCourseDataOnAddReview,
  updateReviewsRecentOnAddReview,
  updateCourseDataOnUpdateReview,
  updateReviewsRecentOnUpdateReview,
  updateCourseDataOnDeleteReview,
  updateReviewsRecentOnDeleteReview,
  updateUserDataOnAddReview,
  updateUserDataOnUpdateReview,
  updateUserDataOnDeleteReview,
  getOneDoc,
  addOrEditDoc,
  delDoc,
} from '@/lib/firebase/utilities';

const { COURSES } = coreDataDocuments;

/* --- COURSES --- */

/**
 * Get all courses from Firebase Firestore DB document `/coreData/courses`
 * @returns `TPayloadCoursesDataDynamic` containing collection of courses' dynamic data
 */
export const getCourses = async () => {
  try {
    const snapshot = await getOneDoc(baseCollectionCoreData, COURSES);
    // @ts-expect-error -- `TPayloadCoursesDataDynamic` is known/expected form
    const coursesDataDoc: TPayloadCoursesDataDynamic = snapshot.data() ?? {};
    return coursesDataDoc;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Get single course from Firebase Firestore DB document `/coreData/courses`
 * @param courseId OMS course ID
 * @returns `CourseDataDynamic` containing single course's dynamic data
 */
export const getCourse = async (courseId: TCourseId) => {
  try {
    const coursesDataDoc = await getCourses();
    return coursesDataDoc ? coursesDataDoc[courseId] : null;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Add a single course to Firebase Firestore DB document `/coreData/courses`
 * @param courseId OMS course ID
 * @param courseData OMSHub course data
 * @returns A `Promise` which is resolved on successful addition of `CourseDataDynamic` data field to the Firebase Firestore DB document
 */
export const addCourse = async (
  courseId: TCourseId,
  courseData: CourseDataDynamic,
) => addOrUpdateCourse(courseId, courseData);

/**
 * Update a single course in Firebase Firestore DB document `/coreData/courses`
 * @param courseId OMS course ID
 * @param courseData OMSHub course data
 * @returns A `Promise` which is resolved on successful update of `CourseDataDynamic` data field in the Firebase Firestore DB document
 */
export const updateCourse = async (
  courseId: TCourseId,
  courseData: CourseDataDynamic,
) => addOrUpdateCourse(courseId, courseData);

/**
 * Delete a single course from Firebase Firestore DB document `/coreData/courses`
 * @param courseId OMS course ID
 * @returns A `Promise` which is resolved on successful delete of `CourseDataDynamic` data field from the Firebase Firestore DB document
 */
export const deleteCourse = async (courseId: TCourseId) => {
  try {
    const coursesDataDoc = await getCourses();
    if (coursesDataDoc && Object.keys(coursesDataDoc).length) {
      delete coursesDataDoc[courseId];
      await setDoc(
        doc(db, `${baseCollectionCoreData}/${COURSES}`),
        coursesDataDoc,
      );
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/* --- REVIEWS (keyed by courseId-year-semesterId) --- */

/**
 * Get all course's reviews for specified year-semester from Firebase Firestore DB document `/reviewsData/{courseId}/{year}-{semesterTerm}/data`
 * @param courseId OMS course ID
 * @param year Year of course taken
 * @param semesterTerm Semester of course taken (`1`/Spring, `2`/Summer, `3`/Fall)
 * @returns `TPayloadReviews` containing collection of reviews
 */
export const getReviews = async (
  courseId: TCourseId,
  year: string,
  semesterTerm: string,
) => {
  try {
    const snapshot = await getOneDoc(
      `${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}`,
      'data',
    );
    const allReviewsData: TPayloadReviews = snapshot.data() ?? {};
    return allReviewsData;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Get all course's recent reviews from Firebase Firestore DB document `/recentsData/{courseId}` via data field `data`.
 * Start of array has additional "buffer reviews" (initialized to 20) to guard against net deletion below 50.
 * @param courseId OMS course ID (omitted to get recent reviews across all courses)
 * @returns `Review[]` containing array of reviews
 * @example
 *  // Return value should be sliced by caller in order to
 *  // limit to only 50 accordingly, i.e.,:
 *  let reviewsAggregateData = await getReviewsRecent();
 *  reviewsAggregateData = reviewsAggregateData?.reverse().slice(0, 50);
 */
export const getReviewsRecent = async (courseId?: TCourseId) => {
  try {
    // N.B. use omitted/undefined `courseId` arg form for non-course-specific/aggregated array
    const dataId = courseId ?? `_aggregateData`;

    const snapshot = await getOneDoc(baseCollectionRecentsData, dataId);
    const data = snapshot.data();
    const reviewsRecent: Review[] = data ? data?.data : [];
    if (reviewsRecent?.length) {
      reviewsRecent.sort((a, b) => a.created - b.created);
    }
    return reviewsRecent;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Get a single review from Firebase Firestore DB document `_reviewsDataFlat/{reviewId}`.
 * @param reviewId OMSHub review ID
 * @returns review `Review`
 */
export const getReview = async (reviewId: string) => {
  try {
    const snapshot = await getOneDoc(baseCollectionReviewsDataFlat, reviewId);
    const reviewData = (snapshot.data() ?? {}) as Review;
    return reviewData;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Add a new review to Firestore Firebase DB.
 * @param userId OMSHub user ID
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns `Promise`s which resolve on successful update of the Firestore Firebase DB.
 */
export const addReview = async (
  userId: string,
  reviewId: string,
  reviewData: Review,
) => {
  try {
    await addOrUpdateReview(reviewId, reviewData);
    await updateCourseDataOnAddReview(reviewId, reviewData);
    await updateReviewsRecentOnAddReview(reviewData);
    await updateUserDataOnAddReview(userId, reviewData);
    await addOrEditDoc(baseCollectionReviewsDataFlat, reviewId, reviewData);
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Edit an existing review in Firestore Firebase DB.
 * @param userId OMSHub user ID
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns `Promise`s which resolve on successful update of the Firestore Firebase DB.
 */
export const updateReview = async (
  userId: string,
  reviewId: string,
  reviewData: Review,
) => {
  try {
    await addOrUpdateReview(reviewId, reviewData);
    await updateCourseDataOnUpdateReview(reviewId, reviewData);
    await updateReviewsRecentOnUpdateReview(reviewData);
    await updateUserDataOnUpdateReview(userId, reviewData);
    await addOrEditDoc(baseCollectionReviewsDataFlat, reviewId, reviewData);
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Delete an existing review from Firestore Firebase DB.
 * @param userId OMSHub user ID
 * @param reviewId OMSHub review ID
 * @returns `Promise`s which resolve on successful update of the Firestore Firebase DB.
 */
export const deleteReview = async (userId: string, reviewId: string) => {
  try {
    const { courseId, year, semesterTerm } = parseReviewId(reviewId);
    const reviewsDataDoc = await getReviews(courseId, year, semesterTerm);
    if (
      reviewsDataDoc &&
      Object.keys(reviewsDataDoc).length &&
      reviewsDataDoc[reviewId]
    ) {
      // delete review from collection `reviewsData`
      delete reviewsDataDoc[reviewId];
      await setDoc(
        doc(
          db,
          `${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`,
        ),
        reviewsDataDoc,
      );

      await updateCourseDataOnDeleteReview(reviewId);
      await updateReviewsRecentOnDeleteReview(reviewId);
      await updateUserDataOnDeleteReview(userId, reviewId);
      await delDoc(baseCollectionReviewsDataFlat, reviewId);
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/* --- USERS --- */

/**
 * Get an existing user from Firebase Firestore DB.
 * @param userId OMSHub user ID
 * @returns the updated user `User`
 */
export const getUser = async (userId: string) => {
  try {
    const snapshot = await getOneDoc(baseCollectionUsersData, userId);
    const nullUser: User = { userId: null, hasGTEmail: false, reviews: {} };
    const userData = (snapshot.data() ?? nullUser) as User;
    return userData;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Add a new user to Firebase Firestore DB.
 * @param userId OMSHub user ID
 * @param hasGTEmail Boolean flag indicating whether login email belongs to domain `gatech.edu`
 * @returns A `Promise` which resolves on successful update of the Firestore Firebase DB.
 */
export const addUser = async (userId: string, hasGTEmail: boolean = false) => {
  try {
    const newUserData: User = { userId, hasGTEmail, reviews: {} };
    await setDoc(doc(db, `${baseCollectionUsersData}/${userId}`), newUserData);
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Edit an existing user in Firebase Firestore DB.
 * @param userId OMSHub user ID
 * @param userData OMSHub user data
 * @returns A `Promise` which resolves on successful update of the Firestore Firebase DB.
 */
export const editUser = async (userId: string, userData: User) => {
  try {
    const oldUserData = await getUser(userId);
    const updatedUserData = {
      ...oldUserData,
      ...userData,
    };
    await setDoc(
      doc(db, `${baseCollectionUsersData}/${userId}`),
      updatedUserData,
    );
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Delete an existing user from Firebase Firestore DB.
 * @param userId OMSHub user ID
 * @returns A `Promise` which resolves on successful update of the Firestore Firebase DB.
 */
export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, `${baseCollectionUsersData}/${userId}`));
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};
