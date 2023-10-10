import backend from '@backend/index';
import ReviewCard from '@components/ReviewCard';
import ReviewForm from '@components/ReviewForm';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { DESC, EMOJI_NO_REVIEWS, REVIEW_ID } from '@globals/constants';
import { Course, Review, TCourseId, TPayloadReviews } from '@globals/types';
import { mapDynamicCoursesDataToCourses } from '@globals/utilities';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import LinkIcon from '@mui/icons-material/Link';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ShareIcon from '@mui/icons-material/Share';
import {
  useMediaQuery,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  Grid,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Link from '@src/Link';
import {
  mapPayloadToArray,
  mapRatingToColor,
  mapRatingToColorInverted,
  mapSemesterTermToEmoji,
  mapSemesterTermToName,
  roundNumber,
} from '@src/utilities';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

type TActiveSemesters = {
  [semesterTerm: number]: boolean;
};

interface CoursePageProps {
  courseData: Course;
  courseTimeline: number[];
  courseYears: number[];
  defaultYear: number;
  defaultSemester: string;
  defaultSemesterToggles: boolean[];
  defaultReviews: TPayloadReviews;
  numberOfReviews: number;
}

const { getCourses, getReviews } = backend;

const CourseId: NextPage<CoursePageProps> = ({
  courseData,
  courseTimeline,
  defaultYear,
  courseYears,
  defaultSemester,
  defaultSemesterToggles,
  defaultReviews,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const handleReviewModalOpen = () => setReviewModalOpen(true);
  const handleReviewModalClose = () => setReviewModalOpen(false);

  const authContext = useAuth();
  let user: FirebaseAuthUser | null = null;
  if (authContext) {
    ({ user } = authContext);
  }

  const [activeSemesters, setActiveSemesters] = useState<TActiveSemesters>(
    defaultSemesterToggles,
  );
  const [selectedSemester, setSelectedSemester] =
    useState<string>(defaultSemester);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [courseReviews, setCourseReviews] =
    useState<TPayloadReviews>(defaultReviews);
  const orientation = useMediaQuery('(min-width:600px)');

  const path = router.asPath.split('/');
  const courseId = path[path.length - 1] as TCourseId;
  const { mutate } = useSWRConfig();
  const { data: course_reviews } = useSWR(
    `/course/${courseId}/${selectedYear}/${selectedSemester}`,
  );

  const actions = [
    {
      icon: <ShareIcon />,
      enabled: true,
      name: 'Share Course URL',
      clickAction: () => {
        navigator.clipboard.writeText(window.location.href);
        setSnackBarMessage('Copied Course URL to Clipboard');
        setSnackBarOpen(true);
      },
    },
    {
      icon: <FileCopyIcon />,
      enabled: true,
      name: 'Copy Course Name',
      clickAction: () => {
        navigator.clipboard.writeText(
          `${courseData?.courseId}: ${courseData?.name}`,
        );
        setSnackBarMessage('Copied Course Name to Clipboard');
        setSnackBarOpen(true);
      },
    },
    {
      icon: <RateReviewIcon />,
      enabled: user ? true : false,
      name: 'Add Review',
      clickAction: user
        ? () => {
            handleReviewModalOpen();
          }
        : () => {},
    },
  ];

  const handleSemester = (
    event: React.MouseEvent<HTMLElement>,
    newSemester: string,
  ) => {
    setSelectedSemester(newSemester);
  };

  const handleYear = (
    event: React.MouseEvent<HTMLElement>,
    newYear: number,
  ) => {
    setSelectedYear(newYear);
  };
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpen(false);
  };
  useEffect(() => {
    if (courseData?.numReviews) {
      setLoading(false);
    }
  }, [courseData]);
  useEffect(() => {
    if (course_reviews) {
      setCourseReviews(course_reviews);
    }
  }, [course_reviews]);
  useEffect(() => {
    if (selectedYear && selectedSemester) {
      setLoading(true);
      const newAvailableSemesters: any = Object.keys(
        courseTimeline[selectedYear],
      );
      const newActiveSemesters: any = Object.keys(mapSemesterTermToName).reduce(
        (attrs, key) => ({
          ...attrs,
          [key]: !(newAvailableSemesters.indexOf(key.toString()) > -1),
        }),
        {},
      );
      if (newActiveSemesters[selectedSemester]) {
        setSelectedSemester(
          newAvailableSemesters[newAvailableSemesters.length - 1],
        );
      }
      setActiveSemesters(newActiveSemesters);
    }
    mutate(
      selectedYear && selectedSemester
        ? `/course/${courseId}/${selectedYear}/${selectedSemester}`
        : null,
      () => {
        return getReviews(
          courseId,
          String(selectedYear),
          String(selectedSemester),
        );
      },
    );
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedSemester]);
  return (
    <Container maxWidth='lg'>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant='h4' color='inherit' gutterBottom>
          {courseData?.name}
        </Typography>
        {courseData && courseData?.url && (
          <Link href={courseData.url} target='_blank'>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LinkIcon />
              <Typography variant='subtitle1' color='inherit'>
                {'Course Website'}
              </Typography>
            </Box>
          </Link>
        )}
        {courseData &&
          courseData?.avgWorkload &&
          courseData?.avgDifficulty &&
          courseData.avgOverall && (
            <Grid
              sx={{ my: 1 }}
              container
              direction='row'
              spacing={4}
              justifyContent='center'
            >
              <Grid item xs={12} lg={4}>
                <Card variant='outlined' sx={{ padding: '5 30', color: 'inherit' }}>
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14 }}
                      gutterBottom
                    >
                      {`Average Workload`}
                    </Typography>
                    <Typography variant='h5' sx={{color: 'inherit'}}>
                      {roundNumber(Number(courseData?.avgWorkload), 1) +
                        ' hrs/wk'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card
                  variant='outlined'
                  sx={{
                    padding: '5 30',
                    borderColor: mapRatingToColorInverted(
                      Number(courseData?.avgDifficulty),
                    ),
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14,
                        color: mapRatingToColorInverted(
                          Number(courseData?.avgDifficulty),
                        ),
                       }}
                      gutterBottom
                    >
                      {`Average Difficulty`}
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        color: mapRatingToColorInverted(
                          Number(courseData?.avgDifficulty),
                        ),
                      }}
                    >
                      {roundNumber(Number(courseData?.avgDifficulty), 1) +
                        ' /5'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card
                  variant='outlined'
                  sx={{
                    margin: '10',
                    padding: '5 30',
                    borderColor: mapRatingToColor(
                      Number(courseData.avgOverall),
                    ),
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{ fontSize: 14, color: mapRatingToColor(Number(courseData.avgOverall)) }}
                      gutterBottom
                    >
                      {`Average Overall`}
                    </Typography>
                    <Typography
                      variant='h5'
                      sx={{
                        color: mapRatingToColor(Number(courseData.avgOverall)),
                      }}
                    >
                      {roundNumber(Number(courseData.avgOverall), 1) + ' /5'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        <Grid>
          <ToggleButtonGroup
            value={selectedSemester}
            onChange={handleSemester}
            exclusive={true}
            aria-label='year selection'
            size='large'
            orientation={`${orientation ? `horizontal` : `vertical`}`}
            sx={{ my: 2, width: `100%`, justifyContent: 'center' }}
          >
            {activeSemesters &&
              Object.entries(activeSemesters).map(
                ([key, value]: [string, boolean], index: number) => (
                  <ToggleButton
                    value={key}
                    key={index}
                    disabled={Boolean(value) || selectedSemester === key}
                  >
                    <Typography variant='body1'>
                      {mapSemesterTermToName[Number(key)]}{' '}
                      {mapSemesterTermToEmoji[Number(key)]}
                    </Typography>
                  </ToggleButton>
                ),
              )}
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={selectedYear}
            onChange={handleYear}
            exclusive={true}
            aria-label='year selection'
            size='large'
            orientation={`${orientation ? `horizontal` : `vertical`}`}
            sx={{ my: 2, width: `100%`, justifyContent: 'center' }}
          >
            {courseYears &&
              courseYears.map((year: number, index: number) => {
                return (
                  <ToggleButton
                    value={year}
                    key={index}
                    disabled={selectedYear === year}
                  >
                    <Typography variant='body2'>{year}</Typography>
                  </ToggleButton>
                );
              })}
          </ToggleButtonGroup>
        </Grid>
        {loading ? (
          <Box sx={{ display: 'flex', m: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {courseData?.numReviews ? (
              <>
                {courseReviews && (
                  <Grid container rowSpacing={5} sx={{ mt: 1 }}>
                    {mapPayloadToArray(courseReviews, REVIEW_ID, DESC).map(
                      (value: Review) => (
                        <Grid sx={{ width: `100%` }} key={value.reviewId} item>
                          <ReviewCard {...value}></ReviewCard>
                        </Grid>
                      ),
                    )}
                  </Grid>
                )}
              </>
            ) : (
              <>
                <Typography
                  variant='h3'
                  color='inherit'
                  style={{ textAlign: 'center' }}
                  gutterBottom
                >
                  {`Aww shucks no reviews ${EMOJI_NO_REVIEWS}`}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
      <Dialog
        open={reviewModalOpen}
        onClose={handleReviewModalClose}
        maxWidth='md'
        closeAfterTransition
      >
        <ReviewForm {...{ courseData, handleReviewModalClose }} />
      </Dialog>
      <SpeedDial
        ariaLabel='Review Dial'
        sx={{ position: 'fixed', bottom: 40, right: 40 }}
        icon={<SpeedDialIcon />}
      >
        {actions
          .flatMap((action) => {
            if (!action.enabled) {
              return [];
            }
            return action;
          })
          .map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.clickAction}
            />
          ))}
      </SpeedDial>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        action={
          <Button color='inherit' size='small' onClick={handleClose}>
            Close
          </Button>
        }
        message={snackBarMessage}
      />
    </Container>
  );
};

export default CourseId;

interface PageProps {
  query: { courseid: string };
}

export async function getServerSideProps(context: PageProps) {
  const { courseid } = context.query;
  const courseId = courseid as TCourseId;
  const allCourseDataDynamic = await getCourses();
  const allCourseData = mapDynamicCoursesDataToCourses(allCourseDataDynamic);
  const currentCourseData = allCourseData[courseId];
  if (currentCourseData.numReviews) {
    const courseTimeline = currentCourseData.reviewsCountsByYearSem;
    const courseYears = Object.keys(courseTimeline)
      .map((year) => Number(year))
      .reverse();
    const mostRecentYear = courseYears[0];
    const mostRecentYearSemesters = Object.keys(courseTimeline[mostRecentYear]);
    const mostRecentSemester =
      mostRecentYearSemesters[mostRecentYearSemesters.length - 1];
    const availableSemesters = Object.keys(courseTimeline[mostRecentYear]);
    const activeSemesters = Object.keys(mapSemesterTermToName).reduce(
      (attrs, key) => ({
        ...attrs,
        [key]: !(availableSemesters.indexOf(key.toString()) > -1),
      }),
      {},
    );
    const courseReviews = await getReviews(
      courseId,
      String(mostRecentYear),
      String(mostRecentSemester),
    );
    return {
      props: {
        courseData: currentCourseData,
        courseTimeline: courseTimeline,
        courseYears: courseYears,
        defaultYear: mostRecentYear,
        defaultSemester: mostRecentSemester,
        defaultSemesterToggles: activeSemesters,
        defaultReviews: courseReviews,
        numReviews: currentCourseData.numReviews,
      },
    };
  } else {
    return {
      props: {
        courseData: currentCourseData,
      },
    };
  }
}
