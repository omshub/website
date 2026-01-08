import {
  baseCollectionCoreData,
  baseCollectionRecentsData,
  baseCollectionReviewsData,
  baseCollectionUsersData,
  coreDataDocuments,
} from '@backend/constants';
import {
  getCourse,
  getCourses,
  getReview,
  getReviews,
  getReviewsRecent,
  getUser,
  updateCourse,
} from '@backend/dbOperations';
import {
  TDocumentData,
  TDocumentDataId,
  TDocumentDataObject,
} from '@backend/documentsDataTypes';
import { parseReviewId, updateAverages } from '@backend/utilityFunctions';
import {
  NOT_FOUND_ARRAY_INDEX,
  REVIEWS_RECENT_TOTAL,
} from '@globals/constants';
import {
  CourseDataDynamic,
  Review,
  TCourseId,
  TPayloadCoursesDataDynamic,
} from '@globals/types';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@backend/FirebaseConfig';

const { COURSES } = coreDataDocuments;

/* --- GENERIC CRUD SUB-OPERATIONS (FOR FLAT COLLECTIONS) --- */

/**
 * Get one document from Firestore DB
 * @param collectionPathString Firebase Firestore collection path to document
 * @param documentId Firebase Firestore document ID
 * @returns Firebase Firestore document reference as a `Promise`
 */
export const getOneDoc = async (
  collectionPathString: string,
  documentId: TDocumentDataId,
) => getDoc(doc(db, collectionPathString, documentId));

/**
 * Add or update one document in Firestore DB
 * @param collectionPathString Firebase Firestore collection path to document
 * @param documentId Firebase Firestore document ID
 * @param documentData Firebase Firestore document data
 * @returns A `Promise` which is resolved on successful writing of the document to the Firebase Firestore DB
 */
export const addOrEditDoc = async (
  collectionPathString: string,
  documentId: TDocumentDataId,
  documentData: TDocumentData,
) => setDoc(doc(db, collectionPathString, documentId), documentData);

/**
 * Delete one document from Firestore DB
 * @param collectionPathString Firebase Firestore collection path to document
 * @param documentId Firebase Firestore document ID
 * @returns A `Promise` which is resolved on successful deletion of document from the Firebase Firestore DB
 */
export const delDoc = async (
  collectionPathString: string,
  documentId: TDocumentDataId,
) => deleteDoc(doc(db, collectionPathString, documentId));

/* --- COURSE DATA CRUD SUB-OPERATIONS --- */

/**
 * Add or update a single course `CourseDataDynamic` in Firestore Firestore DB data field `/coreData/courses/{courseId}`
 * @param courseId OMS course ID
 * @param courseData OMS course data
 * @returns A `Promise` which is resolved on successful writing of the `CourseDataDynamic` data field to the Firebase Firestore DB
 */
export const addOrUpdateCourse = async (
  courseId: TCourseId,
  courseData: CourseDataDynamic,
) => {
  try {
    const coursesDataDoc = await getCourses();
    let newCoursesDataDoc = {} as TPayloadCoursesDataDynamic;
    if (coursesDataDoc) {
      if (Object.keys(coursesDataDoc).length) {
        newCoursesDataDoc = { ...coursesDataDoc };
      }
      newCoursesDataDoc[courseId] = courseData;
      await setDoc(
        doc(db, `${baseCollectionCoreData}/${COURSES}`),
        newCoursesDataDoc,
      );
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/* --- REVIEWS DATA CRUD SUB-OPERATIONS --- */

// base updates

export const ON_ADD_REVIEW = 'ON_ADD_REVIEW';
export const ON_EDIT_REVIEW = 'ON_EDIT_REVIEW';
export const ON_DELETE_REVIEW = 'ON_DELETE_REVIEW';
type TOperationUpdateOnReviewEvent =
  | 'ON_ADD_REVIEW'
  | 'ON_EDIT_REVIEW'
  | 'ON_DELETE_REVIEW';

interface ArgsUpdateReviewsRecent {
  operation: TOperationUpdateOnReviewEvent;
  reviewData?: Review;
  reviewId: string;
  courseId?: TCourseId;
}

/**
 * Update recent reviews array `Review[]` in Firestore Firestore DB document `/recentsData/{courseId}/data` or `/recentsData/_aggregateData/data`
 * @param operation add (`ON_ADD_REVIEW`), edit (`ON_EDIT_REVIEW`), or delete (`ON_DELETE_REVIEW`)
 * @param reviewData OMSHub review data (omitted if operation is delete)
 * @param reviewId OMSHub review ID
 * @param courseId OMS course ID (omitted if recent reviews array in question is `_aggregateData`)
 * @returns A `Promise` which is resolved on successful add, edit, or delete of the `Review[]` document in the Firebase Firestore DB
 */
export const updateReviewsRecent = async ({
  operation,
  reviewData = undefined, // delete only
  reviewId,
  courseId = undefined, // update aggregate
}: ArgsUpdateReviewsRecent) => {
  try {
    // N.B. if `courseId` is undefined, updates Firestore document `recentsData/_aggregateData`
    const dataDoc = courseId ?? `_aggregateData`;
    let arrayRecentData = await getReviewsRecent(courseId);

    if (arrayRecentData) {
      switch (operation) {
        case ON_ADD_REVIEW: {
          if (reviewData) {
            arrayRecentData.push(reviewData);
            if (arrayRecentData.length > REVIEWS_RECENT_TOTAL) {
              // maintain buffer size
              arrayRecentData.shift();
            }
            await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
              data: arrayRecentData,
            });
          }
          break;
        }
        case ON_EDIT_REVIEW: {
          if (reviewData) {
            const indexFoundAt = arrayRecentData
              .map(({ reviewId }: Review) => reviewId)
              .indexOf(reviewId);
            if (indexFoundAt !== NOT_FOUND_ARRAY_INDEX) {
              arrayRecentData[indexFoundAt] = reviewData;
              await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
                data: arrayRecentData,
              });
            }
          }
          break;
        }
        case ON_DELETE_REVIEW: {
          const indexFoundAt = arrayRecentData
            .map(({ reviewId }: Review) => reviewId)
            .indexOf(reviewId);
          if (indexFoundAt !== NOT_FOUND_ARRAY_INDEX) {
            arrayRecentData = arrayRecentData.filter(
              (_: Review, index: number) => index !== indexFoundAt,
            );
            await setDoc(doc(db, `${baseCollectionRecentsData}/${dataDoc}`), {
              data: arrayRecentData,
            });
          }
          break;
        }
        default:
          break;
      }
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

interface ArgsUpdateUser {
  operation: TOperationUpdateOnReviewEvent;
  reviewData?: Review;
  reviewId: string;
  userId: string;
}

/**
 * Update user `User` in Firestore Firestore DB document `/usersData/{userId}` on review add, edit, or delete
 * @param operation add (`ON_ADD_REVIEW`), edit (`ON_EDIT_REVIEW`), or delete (`ON_DELETE_REVIEW`)
 * @param reviewData OMSHub review data (omitted if operation is delete)
 * @param reviewId OMSHub review ID
 * @param userId Firebase Auth user ID
 * @returns A `Promise` which is resolved on successful update of `User` document in the Firebase Firestore DB
 */
export const updateUser = async ({
  operation,
  reviewData = undefined, // delete only
  reviewId,
  userId,
}: ArgsUpdateUser) => {
  try {
    const userData = await getUser(userId);

    if (userData) {
      switch (operation) {
        case ON_ADD_REVIEW: {
          if (reviewData) {
            userData.reviews[reviewId] = reviewData;
            await setDoc(
              doc(db, `${baseCollectionUsersData}/${userId}`),
              userData,
            );
          }
          break;
        }
        case ON_EDIT_REVIEW: {
          if (reviewData && userData.reviews[reviewId]) {
            userData.reviews[reviewId] = reviewData;
            await setDoc(
              doc(db, `${baseCollectionUsersData}/${userId}`),
              userData,
            );
          }
          break;
        }
        case ON_DELETE_REVIEW: {
          if (userData.reviews[reviewId]) {
            delete userData.reviews[reviewId];
            await setDoc(
              doc(db, `${baseCollectionUsersData}/${userId}`),
              userData,
            );
          }
          break;
        }
        default:
          break;
      }
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * Add or update review `Review` in Firestore Firestore DB document `/reviewsData/{courseId}/{year}-{semesterTerm}/data` on review add or edit
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful add or update of `Review` document in the Firebase Firestore DB
 */
export const addOrUpdateReview = async (
  reviewId: string,
  reviewData: TDocumentData,
) => {
  try {
    const { courseId, year, semesterTerm } = parseReviewId(reviewId);
    const reviewsDataDoc = await getReviews(courseId, year, semesterTerm);
    let newDataDoc: TDocumentDataObject = {};
    if (reviewsDataDoc) {
      if (Object.keys(reviewsDataDoc).length) {
        newDataDoc = { ...reviewsDataDoc };
      }
      newDataDoc[reviewId] = reviewData;
      await setDoc(
        doc(
          db,
          `${baseCollectionReviewsData}/${courseId}/${year}-${semesterTerm}/data`,
        ),
        newDataDoc,
      );
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

// updates on add review

/**
 * On add review `Review`, update Firebase Firestore DB document `/coreData/courses/{courseId}`
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `CourseDataDynamic` data field in the Firebase Firestore DB
 */
export const updateCourseDataOnAddReview = async (
  reviewId: string,
  reviewData: Review,
) => {
  try {
    const parsed = parseReviewId(reviewId);
    const courseId = parsed.courseId;
    const year = Number(parsed.year);
    const semesterTerm = Number(parsed.semesterTerm);

    const courseDataDoc = await getCourse(courseId);
    if (courseDataDoc) {
      const { avgStaffSupport, reviewsCountsByYearSem } = courseDataDoc;
      let { numReviews, avgWorkload, avgDifficulty, avgOverall } = courseDataDoc;

      const {
        workload: newWorkload,
        difficulty: newDifficulty,
        overall: newOverall,
        staffSupport: newStaffSupport,
      } = reviewData;

      const oldCount = numReviews;
      const newCount = numReviews + 1;
      numReviews = numReviews + 1;
      ({
        avgWorkload,
        avgDifficulty,
        avgOverall,
        // avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
      } = updateAverages({
        courseId,
        oldCount,
        newCount,
        newWorkload,
        newDifficulty,
        newOverall,
        newStaffSupport: newStaffSupport ?? undefined,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
      }));

      if (!reviewsCountsByYearSem[year]) {
        reviewsCountsByYearSem[year] = {};
      }

      if (!reviewsCountsByYearSem[year][semesterTerm]) {
        reviewsCountsByYearSem[year][semesterTerm] = 0;
      }

      reviewsCountsByYearSem[year][semesterTerm] =
        reviewsCountsByYearSem[year][semesterTerm] + 1;

      const updatedCourseData = {
        ...courseDataDoc,
        numReviews,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
        reviewsCountsByYearSem,
      };

      await updateCourse(courseId, updatedCourseData);
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On add review `Review`, update Firebase Firestore DB documents `/recentsData/{courseId}` and `/recentsData/_aggregateData`
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `data` data field in the Firebase Firestore DB
 */
export const updateReviewsRecentOnAddReview = async (newReviewData: Review) => {
  try {
    const { reviewId } = newReviewData;
    const { courseId } = parseReviewId(reviewId);

    // update course
    await updateReviewsRecent({
      operation: ON_ADD_REVIEW,
      reviewId,
      reviewData: newReviewData,
      courseId,
    });

    // update aggregate
    await updateReviewsRecent({
      operation: ON_ADD_REVIEW,
      reviewId,
      reviewData: newReviewData,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On add review `Review`, update Firebase Firestore DB document `/usersData/{userId}`
 * @param userId OMSHub user ID
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `userId` document in the Firebase Firestore DB
 */
export const updateUserDataOnAddReview = async (
  userId: string,
  newReviewData: Review,
) => {
  try {
    const { reviewId } = newReviewData;

    await updateUser({
      operation: ON_ADD_REVIEW,
      reviewId,
      reviewData: newReviewData,
      userId,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

// updates on update review

/**
 * On update review `Review`, update Firebase Firestore DB document `/coreData/courses/{courseId}`
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `CourseDataDynamic` data field in the Firebase Firestore DB
 */
export const updateCourseDataOnUpdateReview = async (
  reviewId: string,
  reviewData: Review,
) => {
  try {
    const { courseId } = parseReviewId(reviewId);
    const courseDataDoc = await getCourse(courseId);
    if (courseDataDoc) {
      const { numReviews, avgStaffSupport } = courseDataDoc;
      let { avgWorkload, avgDifficulty, avgOverall } = courseDataDoc;

      const oldCount = numReviews;
      const newCount = numReviews;

      const {
        workload: oldWorkload,
        difficulty: oldDifficulty,
        overall: oldOverall,
        staffSupport: oldStaffSupport,
      }: Review = await getReview(reviewId);

      const {
        workload: newWorkload,
        difficulty: newDifficulty,
        overall: newOverall,
        staffSupport: newStaffSupport,
      } = reviewData;

      ({
        avgWorkload,
        avgDifficulty,
        avgOverall,
        // avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
      } = updateAverages({
        courseId,
        oldCount,
        newCount,
        oldWorkload,
        oldDifficulty,
        oldOverall,
        oldStaffSupport: oldStaffSupport ?? undefined,
        newWorkload,
        newDifficulty,
        newOverall,
        newStaffSupport: newStaffSupport ?? undefined,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
      }));

      const updatedCourseData = {
        ...courseDataDoc,
        numReviews,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
        // N.B. No net change in field `reviewsCountsByYearSem` on update
      };

      await updateCourse(courseId, updatedCourseData);
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On update review `Review`, update Firebase Firestore DB documents `/recentsData/{courseId}` and `/recentsData/_aggregateData`
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `data` data field in the Firebase Firestore DB
 */
export const updateReviewsRecentOnUpdateReview = async (
  newReviewData: Review,
) => {
  try {
    const { reviewId } = newReviewData;
    const { courseId } = parseReviewId(reviewId);

    // update course
    await updateReviewsRecent({
      operation: ON_EDIT_REVIEW,
      reviewId,
      reviewData: newReviewData,
      courseId,
    });

    // update aggregate
    await updateReviewsRecent({
      operation: ON_EDIT_REVIEW,
      reviewId,
      reviewData: newReviewData,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On update review `Review`, update Firebase Firestore DB document `/usersData/{userId}`
 * @param userId OMSHub user ID
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `userId` document in the Firebase Firestore DB
 */
export const updateUserDataOnUpdateReview = async (
  userId: string,
  newReviewData: Review,
) => {
  try {
    const { reviewId } = newReviewData;

    await updateUser({
      operation: ON_EDIT_REVIEW,
      reviewId,
      reviewData: newReviewData,
      userId,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

// updates on delete review

/**
 * On delete review `Review`, update Firebase Firestore DB document `/coreData/courses/{courseId}`
 * @param reviewId OMSHub review ID
 * @param reviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `CourseDataDynamic` data field in the Firebase Firestore DB
 */
export const updateCourseDataOnDeleteReview = async (reviewId: string) => {
  try {
    const parsed = parseReviewId(reviewId);
    const courseId = parsed.courseId;
    const year = Number(parsed.year);
    const semesterTerm = Number(parsed.semesterTerm);

    const courseDataDoc = await getCourse(courseId);
    if (courseDataDoc) {
      const { avgStaffSupport, reviewsCountsByYearSem } = courseDataDoc;
      let { numReviews, avgWorkload, avgDifficulty, avgOverall } = courseDataDoc;

      const oldCount = numReviews;
      const newCount = numReviews - 1;
      numReviews = numReviews - 1;

      const {
        workload: oldWorkload,
        difficulty: oldDifficulty,
        overall: oldOverall,
        staffSupport: oldStaffSupport,
      }: Review = await getReview(reviewId);

      ({
        avgWorkload,
        avgDifficulty,
        avgOverall,
        // avgStaffSupport // TODO: implement additional logic for `avgStaffSupport`
      } = updateAverages({
        courseId,
        oldCount,
        newCount,
        oldWorkload,
        oldDifficulty,
        oldOverall,
        oldStaffSupport: oldStaffSupport ?? undefined,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
      }));

      if (reviewsCountsByYearSem[year][semesterTerm] === 1) {
        // remove last remaining count
        delete reviewsCountsByYearSem[year][semesterTerm];
      } else {
        reviewsCountsByYearSem[year][semesterTerm] =
          reviewsCountsByYearSem[year][semesterTerm] - 1;
      }

      // remove year if no remaining year-sem's
      if (Object.keys(reviewsCountsByYearSem[year]).length === 0) {
        delete reviewsCountsByYearSem[year];
      }

      const updatedCourseData = {
        ...courseDataDoc,
        numReviews,
        avgWorkload,
        avgDifficulty,
        avgOverall,
        avgStaffSupport,
        reviewsCountsByYearSem,
      };

      await updateCourse(courseId, updatedCourseData);
    }
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On delete review `Review`, update Firebase Firestore DB documents `/recentsData/{courseId}` and `/recentsData/_aggregateData`
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `data` data field in the Firebase Firestore DB
 */
export const updateReviewsRecentOnDeleteReview = async (reviewId: string) => {
  try {
    const { courseId } = parseReviewId(reviewId);

    // update course
    await updateReviewsRecent({
      operation: ON_DELETE_REVIEW,
      reviewId,
      courseId,
    });

    // update aggregate
    await updateReviewsRecent({
      operation: ON_DELETE_REVIEW,
      reviewId,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

/**
 * On delete review `Review`, update Firebase Firestore DB document `/usersData/{userId}`
 * @param userId OMSHub user ID
 * @param newReviewData OMSHub review data
 * @returns A `Promise` which is resolved on successful update of `userId` document in the Firebase Firestore DB
 */
export const updateUserDataOnDeleteReview = async (
  userId: string,
  reviewId: string,
) => {
  try {
    await updateUser({
      operation: ON_DELETE_REVIEW,
      reviewId,
      userId,
    });
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};
