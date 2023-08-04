# Seed Data

## Overview

The current Firebase Firestore database has the following structure (where `{...}` denotes an identifier, and `: <DataModel>` denotes the type of the terminal document's return value via GET):

```
coreData
  /_coursesLegacySnapshot: <TPayloadCourses>
  /courses: <TPayloadCourses>

recentsData
  /_aggregateData/data: <Review[]>
  /{courseId}/data: <Review[]>

reviewsData
  /{courseId}
    /{year}-{SemesterTerm}/data: <TPayloadReviews>

usersData
  /{userId}: <User>
```

***N.B.*** The canonical path format for Firebase Firestore is `{collectionName}/{documentId}/{subCollectionName}/{subDocumentId}/...` and so on, with the path terminating at a (sub)document.

## Seeding a Firebase project

***Note***: All paths indicated in this section are relative to the top-level directory (i.e., `website`). Furthermore, all commands (i.e., `yarn ...`) should also be issued from the top-level directory accordingly.

### Seeding or updating a cloud Firebase project

To seed the data in a development cloud-based Firebase Firestore database, define `/__seed__/.env.js` accordingly with the database environment variables provided in the Firebase project's [console](https://console.firebase.google.com/) (cf. `/__seed__/.example.env.js` for reference), and then run the following command:

```bash
yarn fb:seed-db-cloud
```

***NOTE***: Do **NOT** use this method in **production**!!! Production Firebase database must be updated manually via the Firebase UI/console; otherwise, this seeding approach will wipe all of the live data **without** ability to recover it!

### Seeding or updating local *Firebase Emulator Suite*

To update the local Firebase emulator suite seed data (e.g., on new course addition, see next section), first set `/firebase.json` field `"firestore"."rules"` to value `"firestore.local.rules"` (by default, value is `"firestore.rules"`), i.e.,:

```js
// in file `/firebase.json`

{
  "firestore": {
    "rules": "firestore.local.rules", // NOTE: revert this value back to `"firestore.rules"` after seeding
    // ...other fields
  }
  // ...other fields
}
```

Next, launch the emulator suite with the following commands:

```bash
yarn install
yarn fb:emu
```

With the emulator launched, seed the data in the running emulator with the following command in a *separate* terminal from that of the running emulator:

```bash
yarn fb:seed-db
```

With the emulator Firestore data now updated, export the seed data with the following command:

```bash
yarn fb:exp-seed
```

This will update the corresponding files in directory `/__seed__/firebase-seed`.

***Reference***: https://firebase.google.com/docs/emulator-suite/install_and_configure#export_and_import_emulator_data

## Adding a new course

***Note***: All paths indicated here are relative to the top-level directory (i.e., `website`).

To add a new course, update the following files:

1. `/__seed__/data/courses.js`

```js
module.exports = [
  // ...
  {
    courseId: `<...>`, // indicate appropriate `courseId`
    numReviews: 0,
    avgWorkload: null,
    avgDifficulty: null,
    avgOverall: null,
    avgStaffSupport: null,
    reviewsCountsByYearSem: {},
  },
  // ...
]
```

2. `/firebase/utilityFunctions.ts`

```ts
// ...

export const mapCourseToLegacyNumReviews: TMapCourseToLegacyNumReview = {
  // ...
  '<...>': 0, // indicate appropriate `courseId`
  // ...
}

// ...
```

3. `/globals/staticDataModels.ts`

```ts
// ...

export const coursesDataStatic: TPayloadCoursesDataStatic = {
  // ...
  '<...>': { // indicate appropriate `courseId`
    courseId: '<...>',
    name: '<...>',
    departmentId: '<...>',
    courseNumber: '<...>',
    url: '<...>',
    aliases: ['<...>', '<...>' /* , .... */],
    isDeprecated: false,
    isFoundational: '<true|false>',
  },
  // ...
}

// ...
```

4. `/globals/types.ts`

```ts
// ...

export type TCourseId =
  // ...
  | '<...>' // indicate appropriate `courseId`
  // ...

// ...

export type TCourseName =
  // ...
  | '<...>' // indicate appropriate course `name`
  // ...
```

***Reference PRs***: [#151](https://github.com/omshub/website/pull/151/files), [#352](https://github.com/omshub/website/pull/352)
