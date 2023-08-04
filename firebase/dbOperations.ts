import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@backend/FirebaseConfig';
import {
  coreDataDocuments,
  baseCollectionCoreData,
  baseCollectionReviewsData,
  baseCollectionReviewsDataFlat,
  baseCollectionRecentsData,
  baseCollectionUsersData,
} from '@backend/constants';
import {
  CourseDataDynamic,
  Review,
  TCourseId,
  TPayloadCoursesDataDynamic,
  TPayloadReviews,
  User,
} from '@globals/types';
import { parseReviewId } from '@backend/utilityFunctions';
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
} from '@backend/utilities';

const { COURSES } = coreDataDocuments;

/* --- COURSES --- */
export const getCourses = async () => {
  try {
    const snapshot = await getOneDoc(baseCollectionCoreData, COURSES);
    // @ts-ignore -- `TPayloadCoursesDataDynamic` is known/expected form
    const coursesDataDoc: TPayloadCoursesDataDynamic = snapshot.data() ?? {};
    return coursesDataDoc;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const getCourse = async (courseId: TCourseId) => {
  try {
    const coursesDataDoc = await getCourses();
    return coursesDataDoc ? coursesDataDoc[courseId] : null;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const addCourse = async (
  courseId: TCourseId,
  courseData: CourseDataDynamic,
) => addOrUpdateCourse(courseId, courseData);

export const updateCourse = async (
  courseId: TCourseId,
  courseData: CourseDataDynamic,
) => addOrUpdateCourse(courseId, courseData);

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

// N.B. Start of array has additional "buffer reviews" (initialized to 20) to
// guard against net deletion below 50. Return value should be sliced by
// caller in order to limit to only 50 accordingly, i.e.,:
//   let reviews = await getReviewsRecent()
//   reviews = reviews?.reverse().slice(0, 50)
export const getReviewsRecent = async (courseId?: TCourseId) => {
  try {
    // N.B. use undefined `courseId` arg form for non-course-specific/aggregated array
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

export const getReview = async (reviewId: string) => {
  try {
    const snapshot = await getOneDoc(baseCollectionReviewsDataFlat, reviewId);
    // @ts-ignore -- coerce to `Review` entity based on known form of snapshot.data() per Firestore db data
    const reviewData: Review = snapshot.data() ?? {};
    return reviewData;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

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
export const getUser = async (userId: string) => {
  try {
    const snapshot = await getOneDoc(baseCollectionUsersData, userId);
    const nullUser: User = { userId: null, hasGTEmail: false, reviews: {} };
    // @ts-ignore -- coerce to `User` entity based on known form of snapshot.data() per Firestore db data
    const userData: User = snapshot.data() ?? nullUser;
    return userData;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const addUser = async (userId: string, hasGTEmail: boolean = false) => {
  try {
    const newUserData: User = { userId, hasGTEmail, reviews: {} };
    await setDoc(doc(db, `${baseCollectionUsersData}/${userId}`), newUserData);
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

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

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, `${baseCollectionUsersData}/${userId}`));
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};
