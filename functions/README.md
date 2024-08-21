# Firebase Cloud Functions

This sub-repo contains the definitions for the Firebase Cloud Functions, intended primarily to read-dump the data into JSON output.

## Deploying the Cloud Functions

### Cloud Firebase Project

> ![WARNING]
> Deploying Cloud Functions requires a ***paid plan*** Firebase project, which must be preconfigured as such accordingly prior to deployment.

To deploy the cloud functions as defined in `/website/functions/index.js` to a cloud-based Firebase project, ensure that the terminal is in location `.../website/functions/` and then perform the following steps via terminal:

1) Log into Firebase account.
```bash
firebase login
```
2) Identify the target `<project-id>` for the cloud-based Firebase project in question.
```bash
firebase projects:list
```
3) Set the Firebase CLI to the target project.
```bash
firebase use <project-id>
```
4) Deploy the Cloud Functions to the target project.
```bash
yarn deploy
```

## Local Firebase Emulators

If running local Firebase Emulators, the functions will be detected accordingly.

## Using the Cloud Functions

Once deployed (or running locally), simply make HTTP GET requests to the corresponding URLs as provided.

The following functions are defined:

|  GET Route | Query Params | Result |
|:--:|:--:|:--:|
| `/getReviewsFlat` | `isLegacy` | Returns an array of objects containing the reviews in ascending order by created time. Param `?isLegacy=true` returns the legacy reviews, otherwise omission of this param returns only the reviews collected since inception of OMSHub (i.e., post-legacy). |
| `/getUsers` | (N/A) | Returns an array of objects containing the users. |
