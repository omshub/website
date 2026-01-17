'use client';

import { useAuth } from '@/context/AuthContext';
import { notifySuccess, notifyError } from '@/utils/notifications';

import {
  Review,
  TCourseId,
  TCourseName,
  TNullable,
  TRatingScale,
  TSemesterId,
  TUserReviews,
} from '@/lib/types';
import {
  Button,
  Loader,
  Alert,
  Select,
  Rating,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Badge,
  Divider,
  ThemeIcon,
  NumberInput,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCalendar,
  IconClock,
  IconPencil,
  IconCheck,
  IconBrain,
  IconThumbUp,
} from '@tabler/icons-react';
import { mapSemesterIdToName, mapSemsterIdToTerm } from '@/utilities';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  Controller,
  DefaultValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { GT_COLORS } from '@/lib/theme';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <Box p="xl" ta="center">
      <Loader color={GT_COLORS.techGold} size="sm" />
    </Box>
  ),
});

interface ReviewFormInputs {
  year: TNullable<number>;
  semesterId: TNullable<TSemesterId>;
  body: string;
  workload: TNullable<number>;
  overall: TNullable<TRatingScale>;
  difficulty: TNullable<TRatingScale>;
}

type TPropsReviewForm = {
  courseId: TCourseId;
  courseName: TCourseName;
  reviewInput: TNullable<Review>;
  handleReviewModalClose: () => void;
};

type TSemesterMap = {
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

const difficultyLabels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
const overallLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

const ReviewForm = ({
  courseId,
  reviewInput,
  handleReviewModalClose,
}: TPropsReviewForm) => {
  const authContext = useAuth();
  const user = authContext?.user;

  const [userReviews, setUserReviews] = useState<TUserReviews>({});

  const yearRange = getYearRange();

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    reset,
    setValue,
    watch,
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

  const watchWorkload = watch('workload');
  const watchDifficulty = watch('difficulty');
  const watchOverall = watch('overall');

  const onSubmit: SubmitHandler<ReviewFormInputs> = async (
    data: ReviewFormInputs
  ) => {
    const isGoodSubmission = await trigger();

    const hasNonNullDataValues = Boolean(
      courseId &&
        data.year &&
        data.semesterId &&
        data.difficulty &&
        data.overall &&
        data.workload
    );

    const isLoggedIn = Boolean(user && user.id && user.email);

    if (isGoodSubmission && isLoggedIn && hasNonNullDataValues) {
      const currentTime = Date.now();
      const semesterId = data.semesterId as TSemesterId;
      const year = Number(data.year);
      const body = data.body;
      const reviewId = `${courseId}-${data.year}-${mapSemsterIdToTerm[semesterId]}-${currentTime}`;
      const workload = Number(data.workload);
      const difficulty = Number(data.difficulty) as TRatingScale;
      const overall = Number(data.overall) as TRatingScale;

      try {
        if (reviewInput?.reviewId) {
          // Update existing review
          const response = await fetch(`/api/reviews/${reviewInput.reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              body,
              workload,
              difficulty,
              overall,
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to update review');
          }
        } else {
          // Create new review
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reviewId,
              courseId,
              year,
              semesterId,
              body,
              workload,
              difficulty,
              overall,
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to create review');
          }
        }

        notifySuccess({
          title: 'Review Submitted!',
          message: `Your review for ${courseId} (${mapSemesterIdToName[semesterId]} ${year}) has been saved.`,
        });

        handleReviewModalClose();
        window.location.reload();
      } catch (error) {
        console.error('Error submitting review:', error);
        notifyError({
          title: 'Submission Failed',
          message: 'Failed to submit review. Please try again.',
        });
      }
    }
  };

  // Fetch user reviews only when userId changes (not entire user object)
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;

    const fetchUserReviews = async () => {
      try {
        const response = await fetch(`/api/user/reviews?userId=${userId}`);
        if (response.ok) {
          const reviews = await response.json();
          setUserReviews(reviews);
        } else {
          setUserReviews({});
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        setUserReviews({});
      }
    };

    fetchUserReviews();
  }, [userId]);

  // Only reset form when reviewId changes (editing a different review)
  // Using reviewInput?.reviewId as dependency instead of the whole object
  useEffect(() => {
    if (reviewInput) {
      reset({ ...reviewInput });
    }
  }, [reviewInput?.reviewId, reset]);

  const yearOptions = yearRange.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  const semesterOptions = [
    { value: 'sp', label: 'Spring' },
    { value: 'sm', label: 'Summer' },
    { value: 'fa', label: 'Fall' },
  ];

  return (
    <Stack gap="lg">
      {/* Semester & Year Selection */}
      <Paper p="md" radius="md" withBorder>
        <Group gap="xs" mb="md">
          <ThemeIcon size="sm" variant="light" color="blue">
            <IconCalendar size={14} />
          </ThemeIcon>
          <Text size="sm" fw={600}>When did you take this course?</Text>
        </Group>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}
        >
          <Controller
            control={control}
            name="semesterId"
            render={({ field }) => (
              <Select
                {...field}
                label="Semester"
                placeholder="Select semester"
                value={field.value ?? null}
                disabled={Boolean(reviewInput?.reviewId)}
                data={semesterOptions}
                error={Boolean(errors.semesterId)}
                searchable
                comboboxProps={{ withinPortal: true }}
                onChange={(val) => {
                  field.onChange(val);
                  // Trigger year validation when semester changes
                  trigger('year');
                }}
                styles={{
                  input: {
                    fontWeight: 500,
                  },
                }}
              />
            )}
            rules={{
              required: true,
              validate: reviewInput?.reviewId
                ? {}
                : {
                    validateSemesterGivenYear: (semester) => {
                      return validateSemesterYear(semester, getValues()['year']);
                    },
                    validateNotTakenCourse: (semester) => {
                      return validateUserNotTakenCourse(
                        userReviews,
                        courseId,
                        semester,
                        getValues()?.year
                      );
                    },
                  },
            }}
          />

          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <Select
                {...field}
                label="Year"
                placeholder="Select year"
                value={field.value ? String(field.value) : null}
                onChange={(val) => {
                  field.onChange(val ? Number(val) : null);
                  // Trigger semester validation when year changes
                  trigger('semesterId');
                }}
                disabled={Boolean(reviewInput?.reviewId)}
                data={yearOptions}
                error={Boolean(errors.year)}
                searchable
                comboboxProps={{ withinPortal: true }}
                styles={{
                  input: {
                    fontWeight: 500,
                  },
                }}
              />
            )}
            rules={{
              required: true,
              validate: reviewInput?.reviewId
                ? {}
                : {
                    validateYearGivenSemester: (year) => {
                      return validateSemesterYear(getValues()?.semesterId, year);
                    },
                    validateNotTakenCourse: (year) => {
                      return validateUserNotTakenCourse(
                        userReviews,
                        courseId,
                        getValues()?.semesterId,
                        year
                      );
                    },
                  },
            }}
          />
        </Box>

        {(errors.year?.type === 'validateYearGivenSemester' ||
          errors.semesterId?.type === 'validateSemesterGivenYear') && (
          <Alert icon={<IconAlertCircle size={16} />} color="orange" mt="sm" radius="md">
            Please wait until {fallbackDates[getValues().semesterId!]} to review this course for{' '}
            {mapSemesterIdToName[`${getValues().semesterId!}`]} {getValues()['year']}
          </Alert>
        )}
        {(errors.year?.type === 'validateNotTakenCourse' ||
          errors.semesterId?.type === 'validateNotTakenCourse') && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mt="sm" radius="md">
            You've already reviewed this course for this semester and year.
          </Alert>
        )}
      </Paper>

      {/* Ratings Section */}
      <Paper p="md" radius="md" withBorder>
        <Text size="sm" fw={600} mb="md">Rate your experience</Text>

        <Stack gap="xl">
          {/* Workload */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="cyan">
                  <IconClock size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Weekly Workload</Text>
              </Group>
              <Badge variant="light" color="cyan">
                {watchWorkload || '—'} hrs/week
              </Badge>
            </Group>
            <Controller
              control={control}
              name="workload"
              render={({ field }) => (
                <NumberInput
                  {...field}
                  placeholder="Enter hours per week"
                  min={1}
                  max={60}
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(typeof val === 'number' ? val : null)}
                  suffix=" hours/week"
                  styles={{
                    input: {
                      textAlign: 'center',
                      fontWeight: 500,
                    },
                  }}
                />
              )}
              rules={{
                min: 1,
                max: 168,
                required: true,
                validate: {
                  validateIsNumber: (value: TNullable<number>) =>
                    value ? value > 0 : false,
                },
              }}
            />
          </Box>

          <Divider />

          {/* Difficulty */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconBrain size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Difficulty</Text>
              </Group>
              {watchDifficulty && (
                <Badge
                  variant="light"
                  color={watchDifficulty <= 2 ? 'green' : watchDifficulty <= 3 ? 'yellow' : 'red'}
                >
                  {difficultyLabels[(watchDifficulty || 1) - 1]}
                </Badge>
              )}
            </Group>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <Box px="xs">
                  <Rating
                    {...field}
                    value={field.value ?? 0}
                    size="xl"
                    count={5}
                    highlightSelectedOnly
                    emptySymbol={<IconBrain size={28} color="var(--mantine-color-gray-4)" />}
                    fullSymbol={<IconBrain size={28} color={GT_COLORS.newHorizon} />}
                    styles={{
                      symbolGroup: {
                        gap: 8,
                      },
                    }}
                  />
                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">Very Easy</Text>
                    <Text size="xs" c="dimmed">Very Hard</Text>
                  </Group>
                </Box>
              )}
              rules={{
                required: true,
                min: 1,
              }}
            />
          </Box>

          <Divider />

          {/* Overall */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="green">
                  <IconThumbUp size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Overall Rating</Text>
              </Group>
              {watchOverall && (
                <Badge
                  variant="light"
                  color={watchOverall >= 4 ? 'green' : watchOverall >= 3 ? 'blue' : 'red'}
                >
                  {overallLabels[(watchOverall || 1) - 1]}
                </Badge>
              )}
            </Group>
            <Controller
              control={control}
              name="overall"
              render={({ field }) => (
                <Box px="xs">
                  <Rating
                    {...field}
                    value={field.value ?? 0}
                    size="xl"
                    count={5}
                    highlightSelectedOnly
                    emptySymbol={<IconThumbUp size={28} color="var(--mantine-color-gray-4)" />}
                    fullSymbol={<IconThumbUp size={28} color={GT_COLORS.canopyLime} />}
                    styles={{
                      symbolGroup: {
                        gap: 8,
                      },
                    }}
                  />
                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">Terrible</Text>
                    <Text size="xs" c="dimmed">Excellent</Text>
                  </Group>
                </Box>
              )}
              rules={{
                required: true,
                min: 1,
              }}
            />
          </Box>
        </Stack>
      </Paper>

      {/* Review Body */}
      <Paper p="md" radius="md" withBorder>
        <Group gap="xs" mb="md">
          <ThemeIcon size="sm" variant="light" color="grape">
            <IconPencil size={14} />
          </ThemeIcon>
          <Text size="sm" fw={600}>Your Review</Text>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Share your experience with the course. What did you learn? What was challenging?
          Would you recommend it? Markdown formatting is supported.
        </Text>
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <TipTapEditor
              onChange={(body: string) => {
                setValue('body', body, { shouldDirty: true });
              }}
              initialValue={field.value}
              placeholder="Share your experience with this course. What did you learn? What were the assignments like? Would you recommend it to other students?"
            />
          )}
        />
      </Paper>

      {/* Submit Button */}
      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          color="gray"
          onClick={handleReviewModalClose}
        >
          Cancel
        </Button>
        {isSubmitting ? (
          <Loader color={GT_COLORS.techGold} size="sm" />
        ) : (
          <Button
            disabled={!isDirty || !isValid || isSubmitting}
            variant="filled"
            leftSection={<IconCheck size={18} />}
            onClick={handleSubmit(onSubmit)}
            style={{
              backgroundColor: GT_COLORS.techGold,
              color: GT_COLORS.navy,
            }}
          >
            {reviewInput?.reviewId ? 'Update Review' : 'Submit Review'}
          </Button>
        )}
      </Group>
    </Stack>
  );
};

const getYearRange = () => {
  const currentYear = new Date().getFullYear();
  const programStart = 2013;
  const limitYear = 5;
  return Array.from(
    { length: currentYear - programStart - limitYear + 1 },
    (_, i) => currentYear + i * -1
  );
};

const validateSemesterYear = (
  semester: TNullable<string>,
  year: TNullable<number>
) => {
  if (semester && year) {
    const currentYear = new Date().getFullYear();
    const semesterMap: TSemesterMap = {
      sp: new Date(`02/01/${currentYear}`),
      sm: new Date(`06/01/${currentYear}`),
      fa: new Date(`09/01/${currentYear}`),
    };
    // @ts-expect-error -- semester is TSemesterId in this usage/context
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
  userReviews: TUserReviews | Record<string, never>,
  courseId: TCourseId,
  semester: TNullable<string>,
  year: TNullable<number>
) => {
  if (semester && year) {
    const objKey = `${courseId}-${year}-${mapSemsterIdToTerm[semester]}`;
    return Object.keys(userReviews).find((key) => key.includes(objKey))
      ? false
      : true;
  }
};

export default ReviewForm;
