import backend from '@backend/index';
import ReviewForm from '@components/ReviewForm';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { Review, TNullable } from '@globals/types';
import { getCourseDataStatic } from '@globals/utilities';
import { PhotoCamera, ErrorOutline, Edit, Delete } from '@mui/icons-material';
import stringWidth from 'string-width';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { grey } from '@mui/material/colors';

import { techGold } from '@src/colorPalette';

import {
  mapDifficulty,
  mapOverall,
  mapRatingToColor,
  mapRatingToColorInverted,
  mapSemesterIdToName,
} from '@src/utilities';
import { toBlob } from 'html-to-image';
import { useRouter } from 'next/router';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

const { deleteReview } = backend;

const ReviewCard = ({
  reviewId,
  body,
  overall,
  difficulty,
  workload,
  semesterId,
  created,
  year,
  courseId,
  reviewerId,
  isLegacy,
  modified,
  upvotes,
  downvotes,
  isGTVerifiedReviewer = false,
}: Review) => {
  const router = useRouter();
  const authContext: TNullable<any> = useAuth();
  const user: TNullable<FirebaseAuthUser> = authContext.user;
  const timestamp = new Date(created).toLocaleDateString();
  const clipboardRef = useRef<HTMLDivElement>(null);
  const { name: courseName } = getCourseDataStatic(courseId);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFirefox, setIsFirefox] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleReviewModalOpen = () => setReviewModalOpen(true);
  const handleReviewModalClose = () => setReviewModalOpen(false);

  useEffect(() => {
    navigator.userAgent.match(`Firefox`)
      ? setIsFirefox(true)
      : setIsFirefox(false);
  }, []);

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  const handleCopyToClipboard = async () => {
    const blob: any = await toBlob(clipboardRef?.current!);
    const item: any = { [blob.type]: blob };
    // eslint-disable-next-line no-undef
    const clipboardItem = new ClipboardItem(item);
    await navigator.clipboard.write([clipboardItem]);
    setSnackBarOpen(true);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteReview = async () => {
    setIsSubmitting(true);
    if (user && user.uid && reviewId) {
      await deleteReview(user.uid, reviewId);
      handleDeleteDialogClose();
      router.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div ref={clipboardRef!}>
      <Card
        color='inherit'
        sx={{
          backgroundImage: 'none',
          p: 1,
          borderRadius: '15px',
          boxShadow: `0 5px 10px 0 ${grey[500]}`,
          '& a': {
            color: '#6495ED',
            '&:visited': {
              color: '#8a2be2',
            },
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              direction: 'column',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <Grid
              container
              direction='row'
              rowSpacing={1}
              justifyContent='flex-start'
              alignItems='flex-start'
            >
              <Grid item xs={12}>
                <Typography variant='subtitle1'>{courseId}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>{courseName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>
                  Taken {mapSemesterIdToName[semesterId]} {year}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>
                  Reviewed on {timestamp}
                </Typography>
              </Grid>
              {isGTVerifiedReviewer && (
                <Grid item xs={12}>
                  <Typography color={techGold}>Verified GT Email</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Grid
              container
              direction='row'
              rowSpacing={2}
              columnSpacing={1}
              justifyContent='flex-start'
              alignItems='flex-start'
            >
              {isLegacy && (
                <Grid item>
                  <Chip
                    title='This review was originally collected on https://omscentral.com'
                    icon={<ErrorOutline />}
                    color='warning'
                    label='Legacy'
                    variant='outlined'
                  />
                </Grid>
              )}
              <Grid item>
                <Chip
                  label={`Workload: ${workload} hr/wk`}
                  variant='outlined'
                ></Chip>
              </Grid>
              <Grid item>
                <Chip
                  label={`Difficulty: ${mapDifficulty[difficulty]}`}
                  sx={{
                    color: mapRatingToColorInverted(difficulty),
                    borderColor: mapRatingToColorInverted(difficulty),
                  }}
                  variant='outlined'
                ></Chip>
              </Grid>
              <Grid item>
                <Chip
                  label={`Overall: ${mapOverall[overall]}`}
                  sx={{
                    color: mapRatingToColor(overall),
                    borderColor: mapRatingToColor(overall),
                  }}
                  variant='outlined'
                  color='primary'
                ></Chip>
              </Grid>
            </Grid>
          </Box>
          <Markdown
            remarkPlugins={[
              [
                remarkGfm,
                { singleTilde: false },
                { stringLength: stringWidth },
              ],
              remarkMath,
            ]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {body}
          </Markdown>
          {/* <Markdown>{body}</Markdown> */}
          <Grid textAlign='right'>
            {/* Screenshot button*/}
            {!isFirefox && (
              <Tooltip arrow title='Screenshot Review'>
                <IconButton onClick={handleCopyToClipboard}>
                  <PhotoCamera />
                </IconButton>
              </Tooltip>
            )}
            <Snackbar
              open={snackBarOpen}
              autoHideDuration={6000}
              onClose={handleClose}
              action={
                <Button color='secondary' size='small' onClick={handleClose}>
                  Close
                </Button>
              }
              message={'Screenshotted Review to Clipboard!'}
            />
            {!isLegacy && reviewerId == user?.uid ? (
              <>
                {/* Update Button */}
                <Tooltip title='Update review'>
                  <IconButton onClick={handleReviewModalOpen}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Dialog
                  open={reviewModalOpen}
                  onClose={handleReviewModalClose}
                  maxWidth='md'
                  keepMounted
                  closeAfterTransition
                  PaperProps={{ sx: { backgroundImage: 'none' } }}
                >
                  <ReviewForm
                    {...{
                      courseId,
                      courseName,
                      ['reviewInput']: {
                        reviewId,
                        body,
                        overall,
                        difficulty,
                        workload,
                        semesterId,
                        created,
                        year,
                        courseId,
                        reviewerId,
                        isLegacy,
                        isGTVerifiedReviewer,
                        modified,
                        upvotes,
                        downvotes,
                      },
                      handleReviewModalClose,
                    }}
                  />
                </Dialog>
                {/* Delete Button */}
                <Tooltip title='Delete Review'>
                  <IconButton onClick={handleDeleteDialogOpen}>
                    <Delete />
                  </IconButton>
                </Tooltip>
                <Dialog
                  open={deleteDialogOpen}
                  onClose={handleDeleteDialogClose}
                  aria-describedby='delete-review-dialog-slide-description'
                >
                  <DialogTitle>{`Delete ${mapSemesterIdToName[semesterId]} ${year} review for ${courseName}?`}</DialogTitle>
                  <DialogContent>
                    <DialogContentText id='delete-review-dialog-slide-description'>
                      {`Your ${mapSemesterIdToName[semesterId]} ${year} review for ${courseName} will forever be deleted. Note: this process is unrecoverable!`}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    {isSubmitting ? (
                      <CircularProgress color='secondary' />
                    ) : (
                      <>
                        <Button
                          color='warning'
                          disabled={isSubmitting}
                          onClick={handleDeleteReview}
                        >
                          Full Send!
                        </Button>
                        <Button
                          color='success'
                          disabled={isSubmitting}
                          onClick={handleDeleteDialogClose}
                        >
                          Take me Back!
                        </Button>
                      </>
                    )}
                  </DialogActions>
                </Dialog>
              </>
            ) : (
              <></>
            )}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewCard;
