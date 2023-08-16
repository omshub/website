import backend from '@backend/index';
import ReviewForm from '@components/ReviewForm';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { Review } from '@globals/types';
import { getCourseDataStatic } from '@globals/utilities';
import { Delete, Edit, ErrorOutline, PhotoCamera } from '@mui/icons-material';
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import stringWidth from 'string-width';

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
  const authContext: any | null = useAuth();
  const user: FirebaseAuthUser | null = authContext.user;
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
        sx={{
          p: 1,
          borderRadius: '10px',
          boxShadow: `0 5px 15px 0 ${grey[400]}`,
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
                <Typography color='text.primary'>{courseId}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color='text.secondary'>{courseName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color='text.secondary'>
                  Taken {mapSemesterIdToName[semesterId]} {year}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color='text.secondary'>
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
          <article>
            <ReactMarkdown
              remarkPlugins={[
                [
                  remarkGfm,
                  { singleTilde: false },
                  { stringLength: stringWidth },
                ],
              ]}
              rehypePlugins={[rehypeRaw]}
            >
              {body}
            </ReactMarkdown>
          </article>
          <Grid textAlign='right'>
            {/* Screenshot button*/}
            {!isFirefox && (
              <Tooltip title='Screenshot Review'>
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
                >
                  {/* <>{console.log(courseId,courseName)}</> */}
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
                      <CircularProgress />
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
