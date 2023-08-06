// mock imports (cf. `/firebase/__mocks__`)
import 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

describe('backend dbOperations tests', () => {
  describe('courses CRUD operations', () => {
    describe('getCourses', () => {
      it('gets all courses from Firebase Firestore DB', () => {
        // TODO
      });
    });

    describe('getCourse', () => {
      // TODO
    });

    describe('addCourse', () => {
      // TODO
    });

    describe('updateCourse', () => {
      // TODO
    });

    describe('deleteCourse', () => {
      // TODO
    });
  });

  describe('reviews CRUD operations', () => {
    describe('getReviews', () => {
      // TODO
    });

    describe('getReviewsRecent', () => {
      // TODO
    });

    describe('getReview', () => {
      // TODO
    });

    describe('addReview', () => {
      // TODO
    });

    describe('updateReview', () => {
      // TODO
    });

    describe('deleteReview', () => {
      // TODO
    });
  });

  describe('users CRUD operations', () => {
    describe('getUser', () => {
      // TODO
    });

    describe('addUser', () => {
      // TODO
    });

    describe('editUser', () => {
      // TODO
    });

    describe('deleteUser', () => {
      // TODO
    });
  });
});
