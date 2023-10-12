import { addUser, getUser } from '@backend/dbOperations';
import backend from '@backend/index';
import { useAlert } from '@context/AlertContext';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { SEMESTER_ID } from '@globals/constants';

import {
  Review,
  TCourseId,
  TCourseName,
  TNullableNumber,
  TNullableString,
  TRatingScale,
  TSemesterId,
  TUserReviews
} from '@globals/types';
import { isGTEmail } from '@globals/utilities';
import {
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Typography,
} from '@mui/material';
import { mapSemesterIdToName, mapSemsterIdToTerm } from '@src/utilities';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Controller,
  DefaultValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form';

const { addReview,updateReview } = backend;

const DynamicEditor = dynamic(() => import('@components/FormEditor'), {
  ssr: false,
});

interface ReviewFormInputs {
  year: TNullableNumber;
  semesterId: TSemesterId | null;
  body: string;
  workload: TNullableNumber | null;
  overall: TRatingScale | null;
  difficulty: TRatingScale | null;
}

type TPropsReviewForm = {
  courseId: TCourseId;
  courseName: TCourseName;
  reviewInput: Review | null;
  handleReviewModalClose: () => void;
};

type TSemesterMap = {
  // eslint-disable-next-line no-unused-vars
  [semesterId in TSemesterId]: Date;
};

const fallbackDates = {
  sp: 'Feb 01',
  sm: 'June 01',
  fa: 'Sept 01',
};

const ReviewFormDefaults: DefaultValues<ReviewFormInputs> = {
  year: null,
  semesterId: null,
  body: ' ',
  workload: null,
  overall: null,
  difficulty: null,
};

const ReviewForm = ({
  courseId,
  courseName,
  reviewInput,
  handleReviewModalClose,
}: TPropsReviewForm) => {
  const authContext: any | null = useAuth();

  const user: FirebaseAuthUser | null = authContext.user;

  const { setAlert } = useAlert();
  const [userReviews, setUserReviews] = useState<TUserReviews>({});
  const router = useRouter();

  const yearRange = getYearRange();

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    reset,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<ReviewFormInputs>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: undefined,
    defaultValues: ReviewFormDefaults,
    context: undefined,
    criteriaMode: 'firstError',
    shouldFocusError: true,
    shouldUnregister: true,
  });
  const onSubmit: SubmitHandler<ReviewFormInputs> = async (
    data: ReviewFormInputs,
  ) => {
    const isGoodSubmission = await trigger();

    const hasNonNullDataValues = Boolean(
      courseId &&
        data.year &&
        data.semesterId &&
        data.difficulty &&
        data.overall &&
        data.workload,
    );

    const isLoggedIn = Boolean(user && user.uid && user.email);

    if (isGoodSubmission && isLoggedIn && hasNonNullDataValues) {
      
      const currentTime = Date.now();
      const semesterId = data.semesterId as TSemesterId;
      const year = Number(data.year);
      const body = data.body;
      const reviewerId = user?.uid!;
      const reviewId = `${courseId}-${data.year}-${mapSemsterIdToTerm[semesterId]}-${currentTime}`;
      const workload = Number(data.workload);
      const difficulty = Number(data.difficulty) as TRatingScale;
      const overall = Number(data.overall) as TRatingScale;
      const isGTVerifiedReviewer = isGTEmail(user?.email!);
      
      
      const reviewValues = {
        ['courseId']: reviewInput? reviewInput.courseId : courseId,
        ['reviewerId']: reviewInput? reviewInput.reviewerId : reviewerId,
        ['reviewId']: reviewInput ? reviewInput.reviewId : reviewId,
        ['created']: reviewInput? reviewInput.created : currentTime,
        ['modified']: currentTime,
        ['semesterId']: reviewInput? reviewInput.semesterId : semesterId,
        ['upvotes']: reviewInput? reviewInput.upvotes : 0,
        ['downvotes']: reviewInput? reviewInput.downvotes : 0,
        ['isLegacy']: reviewInput? reviewInput.isLegacy : false,
        ['year']: reviewInput? reviewInput.year : year,
        ['isGTVerifiedReviewer']: reviewInput? reviewInput.isGTVerifiedReviewer: isGTVerifiedReviewer,
        body,
        workload,
        difficulty,
        overall,
      };


      reviewInput?.reviewId ? await updateReview(user?.uid!, reviewInput?.reviewId, reviewValues): await addReview(user?.uid!, reviewId, reviewValues)

      setAlert({
        severity: 'success',
        text: `Successful review submission for ${courseId} for ${mapSemesterIdToName[semesterId]} ${year}`,
        variant: 'outlined',
      });

      handleReviewModalClose();
      router.reload();
    }
  };

  useEffect(() => {
    getUser(user?.uid!).then((results) => {
      if (results.userId) {
        setUserReviews(results['reviews']);
      } else if (user && user.uid && user.email) {
        const hasGTEmail = isGTEmail(user.email);
        addUser(user.uid, hasGTEmail);
        setUserReviews({});
      } else {
        setUserReviews({});
      }
    });
  }, [user]);

  useEffect(() => {
    reset({ ...reviewInput });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewInput,reset]);

  return (
    <Grid
      color='inherit'
      container
      rowSpacing={4}
      sx={{ px: 5, py: 10, backgroundImage: 'none' }}
      justifyContent='center'
    >
      <Typography variant='h6'>{`Add Review for ${courseId}: ${courseName}`}</Typography>
      <Grid item xs={12} lg={12}>
        <TextField
          disabled
          fullWidth
          id='review-form-course-name'
          label='Course Name'
          defaultValue={`${courseId}: ${courseName}`}
        />
      </Grid>
      <Grid item xs={12} lg={12}>
        <InputLabel id='review-form-year' sx={{color:'inherit'}}>Year</InputLabel>
        <Controller
          control={control}
          name='year'
          render={({ field }) => (
            <Select
              {...field}
              disabled={reviewInput?.reviewId ? true : false}
              fullWidth
              error={Boolean(errors.year)}
            >
              {yearRange.map((year) => {
                return (
                  <MenuItem key={year} value={year}>
                    <>{year}</>
                  </MenuItem>
                );
              })}
            </Select>
          )}
          rules={{
            required: true,
            validate: reviewInput?.reviewId ? {} : {
              validateYearGivenSemester: (year) => {
                return validateSemesterYear(getValues()?.semesterId, year);
              },
              validateNotTakenCourse: (year) => {
                return  validateUserNotTakenCourse(
                  userReviews,
                  courseId,
                  getValues()?.semesterId,
                  year,
                );
              },
            },
          }}
        ></Controller>
        {errors.year && errors.year.type === 'validateYearGivenSemester' && (
          <Alert severity='error'>{`Please wait until ${
            fallbackDates[getValues()?.semesterId!]
          } to review ${courseId} for semester ${
            mapSemesterIdToName[`${getValues()?.semesterId!}`]
          } ${getValues()['year']}`}</Alert>
        )}
        {errors.year && errors.year.type === 'validateNotTakenCourse' && (
          <Alert severity='error'>
            {`You've already reviewed this course for the semester and year!`}
          </Alert>
        )}
      </Grid>
      <Grid item xs={12} lg={12}>
        <InputLabel id='review-form-semester' sx={{color:'inherit'}}>Semester</InputLabel>
        <Controller
          control={control}
          name={SEMESTER_ID}
          render={({ field }) => (
            <Select
              disabled={reviewInput?.reviewId ? true : false}
              fullWidth
              {...field}
              error={Boolean(errors.semesterId)}
            >
              <MenuItem value={'sp'}>Spring</MenuItem>
              <MenuItem value={'sm'}>Summer</MenuItem>
              <MenuItem value={'fa'}>Fall</MenuItem>
            </Select>
          )}
          rules={{
            required: true,
            validate: reviewInput?.reviewId ? {} :{
              validateSemesterGivenYear: (semester) => {
                return validateSemesterYear(semester, getValues()['year']);
              },
              validateNotTakenCourse: (semester) => {
                return validateUserNotTakenCourse(
                  userReviews,
                  courseId,
                  semester,
                  getValues()?.year,
                );
              },
            },
          }}
        ></Controller>
        {errors.semesterId &&
          errors.semesterId.type === 'validateSemesterGivenYear' && (
            <Alert severity='error'>{`Please wait until ${
              fallbackDates[getValues()?.semesterId!]
            } to review ${courseId} for semester ${
              mapSemesterIdToName[`${getValues()?.semesterId!}`]
            } ${getValues()?.year!}`}</Alert>
          )}
        {errors.semesterId &&
          errors.semesterId.type === 'validateNotTakenCourse' && (
            <Alert severity='error'>{`You've already reviewed this course for the semester and year!`}</Alert>
          )}
      </Grid>
      <Grid item xs={12} lg={12}>
        <InputLabel id='review-form-workload' sx={{color:'inherit'}}>Workload</InputLabel>
        <Controller
          control={control}
          name='workload'
          render={({ field }) => (
            <TextField
              {...field}
              type='number'
              onChange={(event: any) => {
                const double = parseFloat(event.target.value);
                if (double) {
                  return field.onChange(double);
                }
                return;
              }}
              InputProps={{
                inputMode: 'numeric',
                endAdornment: (
                  <InputAdornment position='end'>hr/wk</InputAdornment>
                ),
              }}
              fullWidth
            />
          )}
          rules={{
            min: '1',
            max: '168',
            required: true,
            validate: {
              validateIsNumber: (value: TNullableNumber) =>
                value ? value > 0 : false,
            },
          }}
        ></Controller>
        {errors.workload && errors.workload.type === 'min' && (
          <Alert severity='error'>
            {`Please enter a workload greater than 0`}
          </Alert>
        )}
        {errors.workload && errors.workload.type === 'max' && (
          <Alert severity='error'>
            {`Please enter a workload less than 168`}
          </Alert>
        )}
      </Grid>

      <Grid item xs={12} md={4} lg={4} textAlign='center'>
        <Typography component='legend'>Difficulty</Typography>
        <Controller
          control={control}
          name='difficulty'
          render={({ field }) => <Rating {...field} size='large' />}
          rules={{
            required: true,
            min: '1',
          }}
        ></Controller>
      </Grid>
      <Grid item xs={12} md={4} lg={4} textAlign='center'>
        <Typography component='legend'>Overall</Typography>
        <Controller
          control={control}
          name='overall'
          render={({ field }) => (
            <Rating {...field} defaultValue={0} size='large' />
          )}
          rules={{
            required: true,
            min: '1',
          }}
        ></Controller>
      </Grid>
      <Grid item xs={12} lg={12}>
        <Typography sx={{ mb: 1, color:'inherit' }} component='legend'>
          Review
        </Typography>
        <Controller
          control={control}
          name='body'
          render={({ field }) => (
            <DynamicEditor 
              onChange={(body:any)=>{
                setValue('body',body, {shouldDirty:true})
              }}
              initialValue={field.value} />
          )}
        ></Controller>
      </Grid>
      <Grid textAlign='center' item xs={12} lg={12}>
        {isSubmitting ? (
          <CircularProgress />
        ) : (
          <Button
            disabled={!isDirty || !isValid || isSubmitting}
            sx={{color:'inherit'}}
            variant='contained'
            onClick={handleSubmit(onSubmit)}
          >
            {reviewInput?.reviewId ? `Update` : `Submit`}
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

const getYearRange = () => {
  const currentYear = new Date().getFullYear();
  const programStart = 2013;
  const limitYear = 5;
  return Array.from(
    { length: currentYear - programStart - limitYear + 1 },
    (_, i) => currentYear + i * -1,
  );
};

const validateSemesterYear = (
  semester: TNullableString,
  year: TNullableNumber,
) => {
  if (semester && year) {
    const currentYear = new Date().getFullYear();
    const semesterMap: TSemesterMap = {
      sp: new Date(`02/01/${currentYear}`),
      sm: new Date(`06/01/${currentYear}`),
      fa: new Date(`09/01/${currentYear}`),
    };
    // @ts-ignore -- semester is TSemesterId in this usage/context
    const compareDate = semesterMap[semester] as Date;
    if (year < new Date().getFullYear()) {
      return true;
    }
    if (new Date() < compareDate) {
      return false;
    }
    return true;
  }
};

const validateUserNotTakenCourse = (
  userReviews: TUserReviews | {},
  courseId: TCourseId,
  semester: TNullableString,
  year: TNullableNumber,
) => {
  if (semester && year) {
    const objKey = `${courseId}-${year}-${mapSemsterIdToTerm[semester]}`;
    return Object.keys(userReviews).find((key) => key.includes(objKey))
      ? false
      : true;
  }
};

export default ReviewForm;
