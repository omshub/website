'use client';

import ReviewCard from '@components/ReviewCard';
import ReviewForm from '@components/ReviewForm';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { DESC, EMOJI_NO_REVIEWS, REVIEW_ID } from '@globals/constants';
import {
  Course,
  Review,
  TPayloadReviews,
  TNullable,
} from '@globals/types';
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
  useTheme,
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
import React, { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import backend from '@backend/index';

const { getReviews } = backend;

type TActiveSemesters = {
  [semesterTerm: number]: boolean;
};

interface CourseContentProps {
  courseData: Course;
  courseTimeline: Record<number, Record<string, number>> | null;
  courseYears: number[] | null;
  defaultYear: number | null;
  defaultSemester: string | null;
  defaultSemesterToggles: Record<string, boolean> | null;
  defaultReviews: TPayloadReviews | null;
}

export default function CourseContent({
  courseData,
  courseTimeline,
  courseYears,
  defaultYear,
  defaultSemester,
  defaultSemesterToggles,
  defaultReviews,
}: CourseContentProps) {
  const {
    courseId,
    name: courseName,
    numReviews: courseNumReviews,
    url: courseUrl,
    avgWorkload: courseAvgWorkload,
    avgDifficulty: courseAvgDifficulty,
    avgOverall: courseAvgOverall,
  } = courseData;

  const [loading, setLoading] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const handleReviewModalOpen = () => setReviewModalOpen(true);
  const handleReviewModalClose = () => setReviewModalOpen(false);

  const authContext: TNullable<any> = useAuth();
  const user: TNullable<FirebaseAuthUser> = authContext?.user;

  const theme = useTheme();

  const [activeSemesters, setActiveSemesters] = useState<TActiveSemesters>(
    defaultSemesterToggles || {}
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    defaultSemester || ''
  );
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear || 0);
  const [courseReviews, setCourseReviews] = useState<TPayloadReviews>(
    defaultReviews || {}
  );
  const orientation = useMediaQuery('(min-width:600px)');

  const { mutate } = useSWRConfig();
  const { data: course_reviews } = useSWR(
    `/course/${courseId}/${selectedYear}/${selectedSemester}`
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
        navigator.clipboard.writeText(`${courseId}: ${courseName}`);
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
    _event: React.MouseEvent<HTMLElement>,
    newSemester: string
  ) => {
    setSelectedSemester(newSemester);
  };

  const handleYear = (
    _event: React.MouseEvent<HTMLElement>,
    newYear: number
  ) => {
    setSelectedYear(newYear);
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  useEffect(() => {
    if (course_reviews) {
      setCourseReviews(course_reviews);
    }
  }, [course_reviews]);

  useEffect(() => {
    if (selectedYear && selectedSemester && courseTimeline) {
      setLoading(true);
      const yearData = courseTimeline[selectedYear];
      const newAvailableSemesters: string[] = yearData
        ? Object.keys(yearData)
        : [];
      const newActiveSemesters: Record<string, boolean> = Object.keys(
        mapSemesterTermToName
      ).reduce(
        (attrs, key) => ({
          ...attrs,
          [key]: !(newAvailableSemesters.indexOf(key.toString()) > -1),
        }),
        {}
      );
      if (newActiveSemesters[selectedSemester]) {
        setSelectedSemester(
          newAvailableSemesters[newAvailableSemesters.length - 1]
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
          String(selectedSemester)
        );
      }
    );
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedSemester]);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" color="inherit" gutterBottom>
          {courseName}
        </Typography>
        {courseUrl && (
          <Link href={courseUrl} target="_blank" color="primary.contrastText">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <LinkIcon color="inherit" />
              <Typography variant="subtitle1" color="inherit">
                {'Course Website'}
              </Typography>
            </Box>
          </Link>
        )}
        {courseAvgWorkload && courseAvgDifficulty && courseAvgOverall && (
          <Grid
            sx={{ my: 1 }}
            container
            direction="row"
            spacing={4}
            justifyContent="center"
          >
            <Grid item xs={12} lg={4}>
              <Card
                variant="outlined"
                sx={{ padding: '5 30', color: 'inherit' }}
              >
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    {`Average Workload`}
                  </Typography>
                  <Typography variant="h5">
                    {roundNumber(Number(courseAvgWorkload), 1) + ' hrs/wk'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card
                variant="outlined"
                sx={{
                  padding: '5 30',
                  borderColor: mapRatingToColorInverted(
                    Number(courseAvgDifficulty)
                  ),
                }}
              >
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    {`Average Difficulty`}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: mapRatingToColorInverted(
                        Number(courseAvgDifficulty)
                      ),
                    }}
                  >
                    {roundNumber(Number(courseAvgDifficulty), 1) + ' /5'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card
                variant="outlined"
                sx={{
                  margin: '10',
                  padding: '5 30',
                  borderColor: mapRatingToColor(Number(courseAvgOverall)),
                }}
              >
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    {`Average Overall`}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: mapRatingToColor(Number(courseAvgOverall)),
                    }}
                  >
                    {roundNumber(Number(courseAvgOverall), 1) + ' /5'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        {courseYears && courseYears.length > 0 && (
          <Grid>
            <ToggleButtonGroup
              value={selectedSemester}
              onChange={handleSemester}
              exclusive={true}
              aria-label="year selection"
              size="large"
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
                      <Typography variant="body1">
                        {mapSemesterTermToName[Number(key)]}{' '}
                        {mapSemesterTermToEmoji[Number(key)]}
                      </Typography>
                    </ToggleButton>
                  )
                )}
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={selectedYear}
              onChange={handleYear}
              exclusive={true}
              aria-label="year selection"
              size="large"
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
                      <Typography variant="body2">{year}</Typography>
                    </ToggleButton>
                  );
                })}
            </ToggleButtonGroup>
          </Grid>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', m: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {courseNumReviews ? (
              <>
                {courseReviews && (
                  <Grid container rowSpacing={5} sx={{ mt: 1 }}>
                    {mapPayloadToArray(courseReviews, REVIEW_ID, DESC).map(
                      (value: Review) => (
                        <Grid sx={{ width: `100%` }} key={value.reviewId} item>
                          <ReviewCard {...value}></ReviewCard>
                        </Grid>
                      )
                    )}
                  </Grid>
                )}
              </>
            ) : (
              <>
                <Typography
                  variant="h3"
                  color="inherit"
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
        maxWidth="md"
        closeAfterTransition
        PaperProps={{ sx: { backgroundImage: 'none' } }}
      >
        <ReviewForm
          {...{
            courseId,
            courseName,
            ['reviewInput']: null,
            handleReviewModalClose,
          }}
        />
      </Dialog>
      <SpeedDial
        ariaLabel="Review Dial"
        sx={{ position: 'fixed', bottom: 40, right: 40 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            border: `1px solid ${theme.palette.secondary.contrastText}`,
            backgroundColor: `${theme.palette.secondary.main}`,
            color: `${theme.palette.secondary.contrastText}`,
            '&:hover': {
              backgroundColor: `${theme.palette.secondary.contrastText}`,
              color: `${theme.palette.secondary.main}`,
            },
          },
        }}
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
              sx={{
                border: `1px solid ${theme.palette.secondary.contrastText}`,
                backgroundColor: `${theme.palette.secondary.main}`,
                color: `${theme.palette.secondary.contrastText}`,
                '&:hover': {
                  backgroundColor: `${theme.palette.secondary.contrastText}`,
                  color: `${theme.palette.secondary.main}`,
                },
              }}
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              arrow
              onClick={action.clickAction}
            />
          ))}
      </SpeedDial>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        action={
          <Button color="inherit" size="small" onClick={handleClose}>
            Close
          </Button>
        }
        message={snackBarMessage}
      />
    </Container>
  );
}
