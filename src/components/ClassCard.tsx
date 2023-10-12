import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';

import { grey } from '@mui/material/colors';

interface ClassCardProps {
  title: string;
  acronym?: string;
  classNumber: string;
  classId: string;
  blurb?: string;
  image?: string;
  isFoundational?: boolean;
  reviewCount?: number;
  reviewValue?: number;
  difficulty?: number;
  department: string;
  link: string;
}

const ClassCard = ({ ...props }: ClassCardProps) => {
  const router = useRouter();

  return (
    <Card sx={{ width: 350, boxShadow: `0 5px 0px 0 ${grey[200]}` }}>
      <CardActionArea
        onClick={() => {
          router.push({
            pathname: '/class/[classid]',
            query: { classid: props.classId, title: props.title },
          });
        }}
      >
        <CardMedia
          component='img'
          height='140'
          image={props.image}
          alt='class background'
        />
        <CardContent sx={{ height: 150 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            {props.department} {props.classNumber}
          </Typography>
          <Typography variant='h5' color='text.primary' gutterBottom>
            {props.title}
          </Typography>
          <Typography noWrap variant='body2' color='text.secondary'>
            {props.blurb}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 5,
          }}
        >
          {props.reviewValue && (
            <>
              <Typography sx={{ mr: 1 }} variant='body2' color='text.secondary'>
                {props.reviewCount} reviews
              </Typography>
              <Rating
                defaultValue={props.reviewValue}
                precision={0.5}
                readOnly
              />
            </>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mt: 5,
          }}
        >
          <Chip
            label='Course Site'
            component='a'
            href={props.link}
            variant='outlined'
            clickable
          />
          {props.acronym && (
            <Chip label={props.acronym} sx={{ ml: 0.5 }} variant='outlined' />
          )}
          {(() => {
            if (!props.difficulty) {
              return <></>;
            }
            if (props.difficulty >= 4.0) {
              return (
                <Chip
                  label='Hard'
                  sx={{ ml: 0.5 }}
                  variant='outlined'
                  color='error'
                ></Chip>
              );
            } else if (props.difficulty >= 3.0) {
              return (
                <Chip
                  label='Medium'
                  sx={{ ml: 0.5 }}
                  variant='outlined'
                  color='warning'
                ></Chip>
              );
            } else {
              return (
                <Chip
                  label='Easy'
                  sx={{ ml: 0.5 }}
                  variant='outlined'
                  color='success'
                ></Chip>
              );
            }
          })()}
          {props.isFoundational ? (
            <Tooltip title='This course satisfies the foundational requirement (first 2 courses with B or better).'>
              <Chip
                sx={{ ml: 0.5 }}
                label='Foundational'
                variant='outlined'
                color='primary'
              />
            </Tooltip>
          ) : null}
        </Box>
      </CardActions>
    </Card>
  );
};

export default ClassCard;
