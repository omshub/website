import backend from '@backend/index';
import { useAuth } from '@context/AuthContext';
import { FirebaseAuthUser } from '@context/types';
import { Review } from '@globals/types';
import { getCourseDataStatic } from '@globals/utilities';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
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
  isLegacy,
  isGTVerifiedReviewer = false,
}: Review) => {
  const authContext = useAuth();
  const router = useRouter();
  const path = router.asPath;
  const isUserReviewsView = path.includes('user');
  let user: FirebaseAuthUser | null = null;
  const timestamp = new Date(created).toLocaleDateString();
  const { name: courseName } = getCourseDataStatic(courseId);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const clipboardRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isFirefox, setIsFirefox] = useState<boolean>(false);
  useEffect(() => {
    navigator.userAgent.match(`Firefox`)
      ? setIsFirefox(true)
      : setIsFirefox(false);
  }, []);

  if (authContext) {
    ({ user } = authContext);
  }
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
                <Typography>{courseId}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>{courseName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Taken {mapSemesterIdToName[semesterId]} {year}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
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
                    icon={<ErrorOutlineIcon />}
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
            {/* Not User View */}
            {!isFirefox && (
              <Tooltip title='Screenshot Review'>
                <IconButton onClick={handleCopyToClipboard}>
                  <PhotoCameraIcon />
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
            {/* User Review View */}
            {isUserReviewsView ? (
              <>
                <Tooltip title='Delete Review'>
                  <IconButton onClick={handleDeleteDialogOpen}>
                    <DeleteIcon />
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
