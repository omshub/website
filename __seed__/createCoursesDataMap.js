/* 
	This script generates the initial data object/payload used to seed
	the Firebase Firestore db document `coreData/courses`.
*/

// eslint-disable-file no-unused-vars

/* --- IMPORTS ---*/
const reviews = require('./data/reviews');
// N.B. `coursesDataDynamic` already contains the computed values resulting from this script
const coursesDataDynamic = require('./data/courses');

/* --- UTILITIES ---*/
const computeAverage = (fieldArray, numReviews) =>
  fieldArray.reduce((sum, field) => sum + field, 0) / numReviews;

const mapSemesterIdToTerm = {
  sp: 1,
  sm: 2,
  fa: 3,
};

/* --- DATA GENERATION SCRIPT ---*/

// get number of reviews for each course
const numReviewsMap = {};
reviews.forEach(({ courseId }) => {
  if (!numReviewsMap[courseId]) {
    numReviewsMap[courseId] = 1;
  } else {
    numReviewsMap[courseId] = numReviewsMap[courseId] + 1;
  }
});

// initialize `courseDataMap` with field `numReviews`
const coursesDataDynamicMap = {};
coursesDataDynamic.forEach(
  ({ courseId }) =>
    (coursesDataDynamicMap[courseId] = {
      numReviews: numReviewsMap[courseId] ? numReviewsMap[courseId] : 0,
    }),
);

// add additional dynamic fields (averages and `reviewsCountsByYearSem` map)
Object.keys(coursesDataDynamicMap).forEach((courseId) => {
  const numReviews = coursesDataDynamicMap[courseId].numReviews;
  const avgStaffSupport = null; // N.B. field `staffSupport` was not collected in the legacy platform
  let avgWorkload = 0;
  let avgDifficulty = 0;
  let avgOverall = 0;
  const reviewsCountsByYearSem = {};

  const courseReviews = reviews.filter(
    (review) => review.courseId === courseId,
  );

  coursesDataDynamicMap[courseId].avgStaffSupport = avgStaffSupport;

  const workloads = Object.entries(courseReviews).map(
    ([_, { workload }]) => workload,
  );
  avgWorkload =
    numReviews && workloads.length
      ? computeAverage(workloads, numReviews)
      : null;
  coursesDataDynamicMap[courseId].avgWorkload = avgWorkload;

  const difficulties = Object.entries(courseReviews).map(
    ([_, { difficulty }]) => difficulty,
  );
  avgDifficulty =
    numReviews && workloads.length
      ? computeAverage(difficulties, numReviews)
      : null;
  coursesDataDynamicMap[courseId].avgDifficulty = avgDifficulty;

  const overalls = Object.entries(courseReviews).map(
    ([_, { overall }]) => overall,
  );
  avgOverall =
    numReviews && workloads.length
      ? computeAverage(overalls, numReviews)
      : null;
  coursesDataDynamicMap[courseId].avgOverall = avgOverall;

  const yearSemArray = Object.entries(courseReviews).map(
    ([_, { year, semesterId }]) => [year, mapSemesterIdToTerm[semesterId]],
  );
  yearSemArray.forEach(([year, semesterTerm]) => {
    if (!reviewsCountsByYearSem[year]) {
      reviewsCountsByYearSem[year] = {};
    }

    if (!reviewsCountsByYearSem[year][semesterTerm]) {
      reviewsCountsByYearSem[year][semesterTerm] = 0;
    }

    reviewsCountsByYearSem[year][semesterTerm] =
      reviewsCountsByYearSem[year][semesterTerm] + 1;
  });

  coursesDataDynamicMap[courseId].reviewsCountsByYearSem =
    reviewsCountsByYearSem;
});

/* --- EXPORT COURSES DATA MAP OBJECT ---*/
module.exports = coursesDataDynamicMap;

// REFERENCE ONLY: example call to seed the Firestore db (cf. `./script.js` for full seeding script)
/*
const { initializeApp } = require('firebase/app')
const { getFirestore, setDoc, doc } = require('firebase/firestore')

const firebaseApp = initializeApp(config) // cf. `./example.env.js` for environment config
const db = getFirestore(firebaseApp)

const coursesDataDynamicMap = require('__seed__/createCoursesDataMap')

;(async () => {
	await setDoc(doc('coreData', 'courses', coursesDataDynamicMap)) // creates document `coreData/courses` in Firebase Firestore
})()
*/
