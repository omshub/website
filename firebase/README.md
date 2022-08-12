# Firebase Backend Service

## Preliminaries

**_N.B._** All file-path references assume a starting point of the root directory of the project unless noted otherwise.

**_N.B._** Requires Node v. 16+.

## Overview

`/firebase` contains the backend service for the app, utilizing the [Firebase](https://firebase.google.com/) services Firestore (database), Cloud Functions, and Authentication.

Firestore is a non-relational database, comprised of collections which contain documents. Nesting is generally permissible, i.e., `{collectionName}/{documentId}/{subCollectionName}/{subDocumentId}/...` (and so on).

## General Usage

The principal backend/database "interface" intended for consumption by the frontend is contained in `firebase/dbOperations.ts`. This file organizes exports with respect to the corresponding client-side views/pages and components, as applicable.

## Atomic Operations (Full CRUD)

The full CRUD (create, read, update, delete) operations are defined around the semantics of the underlying (Firestore-based) data model. The corresponding implementation logic is defined in `firebase/dbOperations.ts`, which contains the CRUD operations for the various data-containing documents.

The data documents defined in this app, and their corresponding CRUD operations' function calls, are as follows:

(**_data models_**)

| Data Model |         Firestore Document Reference String         |               Document Primary Key                |
| :--------: | :-------------------------------------------------: | :-----------------------------------------------: |
|  `Course`  |                 `coreData/courses`                  |                    `courseId`                     |
|  `Review`  | `reviewsData/{courseId}/{year}-{semesterTerm}/data` | `reviewId [=] courseId-year-semesterTerm-created` |
|   `User`   |                `usersData/{userId}`                 |                     `userId`                      |

(**_operations_**)

| Data Model |    Get All (courseId-year-semesterTerm)    |        Get One        |           Add One           |           Update One           |        Delete One        |
| :--------: | :----------------------------------------: | :-------------------: | :-------------------------: | :----------------------------: | :----------------------: |
|  `Course`  |               `getCourses()`               |    `getCourse(id)`    |    `addCourse(id, data)`    |    `updateCourse(id, data)`    |    `deleteCourse(id)`    |
|  `Review`  | `getReviews(courseId, year, semesterTerm)` | `getReview(reviewId)` | `addReview(reviewId, data)` | `updateReview(reviewId, data)` | `deleteReview(reviewId)` |
|   `User`   |                   (N/A)                    |     `getUser(id)`     |        `addUser(id)`        |        `updateUser(id)`        |     `deleteUser(id)`     |

**_N.B._** See `/globals/types.ts` for definition of document data fields (i.e., argument `data` per above).

Example usage via `courses` document (and similarly for the others):

```ts
import {
	addCourse,
	getCourses,
	getCourse,
	updateCourse,
	deleteCourse,
} from '@backend/dbOperations'

const courseId = 'CS-1927'

// CREATE
const newCourseData = {
	courseId,
	name: 'Computing with George P. Burdell',
	departmentId: 'CS',
	courseNumber: '1927',
	aliases: ['GPB'],
	isDeprecated: false,
	isFoundational: true,
	numReviews: 0,
	avgWorkload: null,
	avgDifficulty: null,
	avgOverall: null,
	avgStaffSupport: null,
}
await addCourse(newCourseData)

// READ
const allCourses = await getCourses()

const existingCourseData = await getCourse(courseId)

// UPDATE
const updatedCourseData = {
	...existingCourseData,
	numReviews: 1,
	avgWorkload: 100,
	avgDifficulty: 5,
	avgOverall: 5,
	avgStaffSupport: 5,
}
await updateCourse(courseId, updatedCourseData)

// DELETE
await deleteCourse(courseId)
```

**_N.B._** All non-"`GET`" operations require authorization/authentication via Firebase Authentication and corresponding permissions.

## Seeding the Data

To seed the static data and legacy reviews, ensure that `/__seed__/.env.js` exists locally and is populated with appropriate credentials (cf. `/__seed__/example.env.js` for details), and then run the following from the terminal (e.g., bash):

```bash
yarn db:seed
```

**_N.B._** This has already been performed in the production environment, and therefore is not necessary to re-run. This can be used to seed a test/dev environment, for example.
