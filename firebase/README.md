# Firebase Backend Service

## Preliminaries

**_N.B._** All file-path references assume a starting point of the root directory of the project unless noted otherwise.

**_N.B._** Requires Node v. 16+.

## Overview

`/firebase` contains the backend service for the app, utilizing the [Firebase](https://firebase.google.com/) services Firestore (database), Cloud Functions, and Authentication.

Firestore is a non-relational database, comprised of collections which contain documents. Nesting is generally permissible, i.e., `{collectionName}/{documentId}/{subCollectionName}/{subDocumentId}/...` (and so on).

## General Usage

The principal backend/database "interface" intended for consumption by the frontend is contained in `firebase/index.ts`.

For example:

```ts
import backend from '@backend/index'

const { getCourses } = backend
```

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

| Data Model |    Get All (courseId-year-semesterTerm)    |        Get One        |               Add One               |               Update One               |            Delete One            |
| :--------: | :----------------------------------------: | :-------------------: | :---------------------------------: | :------------------------------------: | :------------------------------: |
|  `Course`  |               `getCourses()`               |    `getCourse(id)`    |        `addCourse(id, data)`        |        `updateCourse(id, data)`        |        `deleteCourse(id)`        |
|  `Review`  | `getReviews(courseId, year, semesterTerm)` | `getReview(reviewId)` | `addReview(userId, reviewId, data)` | `updateReview(userId, reviewId, data)` | `deleteReview(userId, reviewId)` |
|   `User`   |                   (N/A)                    |     `getUser(id)`     |            `addUser(id)`            |            `updateUser(id)`            |         `deleteUser(id)`         |

**_N.B._** See `/globals/types.ts` for definition of document data fields (i.e., argument `data` per above).

Example usage via `courses` document (and similarly for the others):

```ts
import backend from '@backend/index'

const { addCourse, getCourses, getCourse, updateCourse, deleteCourse } = backend

// N.B. Requires corresponding addition/update in `/globals/types`
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
