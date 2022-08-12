# Seed Data Overview

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
    /{year-SemesterTerm}/data: <TPayloadReviews>
```

**_N.B._** The canonical path format for Firebase Firestore is `{collectionName}/{documentId}/{subCollectionName}/{subDocumentId}/...` and so on.
