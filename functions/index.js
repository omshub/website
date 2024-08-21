/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const logger = require('firebase-functions/logger');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

admin.initializeApp();

// constants
const httpMethods = {
  GET: 'GET',
};
const httpStatuses = {
  OK: 200,
  NOT_ALLOWED: 405,
  SERVER_ERROR: 500,
};
const collections = {
  reviews: '_reviewsDataFlat',
  users: 'usersData',
};
const fields = {
  // reviews
  isLegacy: 'isLegacy',
  created: 'created',
  // users
  userId: 'userId',
};

// methods/routes
exports.getReviewsFlat = functions.https.onRequest(async (req, res) => {
  logger.info('Requesting reviews');

  if (req.method !== httpMethods.GET) {
    logger.warn(`Method '${req.method}' not allowed`);
    return res.status(httpStatuses.NOT_ALLOWED).send('Method Not Allowed');
  }

  // default: send non-legacy reviews
  let isLegacy = false;

  // parse legacy vs. non-legacy from query params
  if (req.query?.isLegacy) {
    isLegacy = req.query.isLegacy.toLowerCase() === 'true';
  }

  try {
    const db = admin.firestore();
    const querySnapshot = await db
      .collection(collections.reviews)
      .where(fields.isLegacy, '==', isLegacy)
      .orderBy(fields.created, 'desc')
      .get();

    const reviews = [];
    querySnapshot.forEach((doc) => {
      const {
        reviewId,
        courseId,
        year,
        semesterId,
        isLegacy,
        reviewerId,
        isGTVerifiedReviewer,
        created,
        modified,
        workload,
        difficulty,
        overall,
        upvotes,
        downvotes,
        body,
      } = doc.data();

      reviews.push({
        reviewId,
        courseId,
        year,
        semesterId,
        isLegacy,
        reviewerId,
        isGTVerifiedReviewer,
        created,
        modified,
        workload,
        difficulty,
        overall,
        upvotes,
        downvotes,
        body,
      });
    });

    logger.info(`Sending ${isLegacy ? 'legacy' : 'non-legacy'} reviews`);
    res.status(httpStatuses.OK).json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    logger.error('Error getting reviews:', error);
    res.status(httpStatuses.SERVER_ERROR).send('Internal Server Error');
  }
});

exports.getUsers = functions.https.onRequest(async (req, res) => {
  logger.info('Requesting users');

  if (req.method !== httpMethods.GET) {
    logger.warn(`Method '${req.method}' not allowed`);
    return res.status(httpStatuses.NOT_ALLOWED).send('Method Not Allowed');
  }

  try {
    const db = admin.firestore();
    const querySnapshot = await db
      .collection(collections.users)
      .orderBy(fields.userId, 'asc')
      .get();

    const users = [];
    querySnapshot.forEach((doc) => {
      const { userId, hasGTEmail, reviews } = doc.data();

      users.push({
        userId,
        hasGTEmail,
        reviews,
      });
    });

    logger.info(`Sending users`);
    res.status(httpStatuses.OK).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    logger.error('Error getting users:', error);
    res.status(httpStatuses.SERVER_ERROR).send('Internal Server Error');
  }
});
