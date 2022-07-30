# Firebase Backend Service

## Preliminaries

**_N.B._** All file-path references assume a starting point of the root directory of the project unless noted otherwise.

**_N.B._** Requires Node v. 16+.

## Overview and Usage

`/firebase` contains the backend service for the app, utilizing the [Firebase](https://firebase.google.com/) services Firestore (database), Cloud Functions, and Authentication.

The primary interface for consumption by the frontend is contained in `/firebase/dbOperations.ts`, which contains the CRUD operations for the various collections. Firestore is a non-relational database, comprised of collections which contain documents.

The collections defined in this app, and their corresponding CRUD operations' function calls, are as follows:

| Firestore Collection |        Get All         |         Get One         |          Add One          |            Update One            |         Delete One         |
| :------------------: | :--------------------: | :---------------------: | :-----------------------: | :------------------------------: | :------------------------: |
|      `courses`       |     `getCourses()`     |     `getCourse(id)`     |     `addCourse(data)`     |     `updateCourse(id, data)`     |     `deleteCourse(id)`     |
|    `departments`     |   `getDepartments()`   |   `getDepartment(id)`   |   `addDepartment(data)`   |   `updateDepartment(id, data)`   |   `deleteDepartment(id)`   |
|      `programs`      |    `getPrograms()`     |    `getProgram(id)`     |    `addProgram(data)`     |    `updateProgram(id, data)`     |    `deleteProgram(id)`     |
|      `reviews`       |     `getReviews()`     |     `getReview(id)`     |     `addReview(data)`     |     `updateReview(id, data)`     |     `deleteReview(id)`     |
|     `semesters`      |    `getSemesters()`    |    `getSemester(id)`    |    `addSemester(data)`    |    `updateSemester(id, data)`    |    `deleteSemester(id)`    |
|  `specializations`   | `getSpecializations()` | `getSpecialization(id)` | `addSpecialization(data)` | `updateSpecialization(id, data)` | `deleteSpecialization(id)` |

**_N.B._** See `/firebase/colectionsTypes.ts` for definition of collection fields (i.e., `data` per above).

Example usage via `courses` collection (and similarly for the others):

```ts
import {
	addCourse,
	getCourses,
	getCourse,
	updateCourse,
	deleteCourse,
} from '../firebase/dbOperations' // relative to `/src`

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

To seed the static data and legacy reviews, ensure that `/firebase/seed/.env.js` exists locally and is populated with appropriate credentials (cf. `/firebase/seed/example.env.js` for details), and then run the following from the terminal (e.g., bash):

```bash
node firebase/seed/script.js
```

This has already been performed in the production environment, and therefore is not necessary to re-run. This can be used to seed a test/dev environment, for example.
