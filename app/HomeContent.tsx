'use client';

import { useState, useEffect } from 'react';
import { courseFields } from '@globals/constants';
import { Course } from '@globals/types';
import {
  Tooltip,
  useMediaQuery,
  Box,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import Link from '@src/Link';
import { mapPayloadToArray, roundNumber } from '@src/utilities';

interface HomeContentProps {
  allCourseData: Record<string, Course>;
}

export default function HomeContent({ allCourseData }: HomeContentProps) {
  const [mounted, setMounted] = useState(false);
  const isDesktopQuery = useMediaQuery('(min-width:600px)');
  const isDesktop = mounted ? isDesktopQuery : true;

  useEffect(() => {
    setMounted(true);
  }, []);
  const coursesArray: Course[] = mapPayloadToArray(
    allCourseData,
    courseFields.NAME
  );

  const courses = coursesArray.map((data, i) => ({ ...data, id: i }));

  const columns: GridColDef[] = [
    {
      field: courseFields.NAME,
      headerName: 'Course Name',
      flex: isDesktop ? 1 : 0,
      minWidth: isDesktop ? 50 : 200,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip arrow title={`View review page for ${params.row.courseId}`}>
          <Link
            color="text.primary"
            href={`/course/${params.row.courseId}`}
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {params.row.name}
          </Link>
        </Tooltip>
      ),
    },
    {
      field: courseFields.COURSE_ID,
      headerName: 'Course ID',
      flex: isDesktop ? 0.5 : 0,
      minWidth: isDesktop ? 50 : 150,
    },
    {
      field: courseFields.AVG_DIFFICULTY,
      headerName: `Difficulty ${isDesktop ? '(out of 5)' : ''}`,
      flex: isDesktop ? 0.5 : 0,
      minWidth: isDesktop ? 50 : 150,
      valueGetter: (value: any, row: any) => roundNumber(row.avgDifficulty, 1),
      type: 'number',
    },
    {
      field: courseFields.AVG_WORKLOAD,
      headerName: `Workload ${isDesktop ? '(hrs/wk)' : ' '}`,
      flex: isDesktop ? 0.5 : 0,
      minWidth: isDesktop ? 50 : 150,
      valueGetter: (value: any, row: any) => roundNumber(row.avgWorkload, 1),
      type: 'number',
    },
    {
      field: courseFields.AVG_OVERALL,
      headerName: `Overall ${isDesktop ? '(out of 5)' : ''}`,
      flex: isDesktop ? 0.5 : 0,
      minWidth: isDesktop ? 50 : 150,
      valueGetter: (value: any, row: any) => roundNumber(row.avgOverall, 1),
      type: 'number',
    },
    {
      field: courseFields.NUM_REVIEWS,
      headerName: 'Number of Reviews',
      flex: isDesktop ? 0.5 : 0,
      minWidth: isDesktop ? 50 : 200,
      type: 'number',
    },
    {
      field: courseFields.IS_DEPRECATED,
      headerName: 'is Deprecated?',
      type: 'boolean',
    },
    {
      field: courseFields.ALIASES,
      headerName: 'Aliases',
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" sx={{ mt: 5 }} gutterBottom>
          OMS Courses
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 10 }} gutterBottom>
          {`Georgia Tech's Online Master's Course Catalog`}
        </Typography>
        {mounted && (
          <Grid
            container
            sx={{ margin: 0, width: `${isDesktop ? '90%' : '100%'}` }}
            spacing={3}
          >
            <DataGrid
              autoHeight
              rows={courses}
              columns={columns}
              disableDensitySelector
              loading={!allCourseData}
              slots={{ toolbar: isDesktop ? GridToolbar : undefined }}
              sx={{ borderRadius: '25px', padding: '20px 10px' }}
              columnVisibilityModel={{
                isDeprecated: false,
                aliases: false,
              }}
              slotProps={{
                toolbar: {
                  printOptions: { disableToolbarButton: true },
                  showQuickFilter: true,
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 100,
                  },
                },
                filter: {
                  filterModel: {
                    items: [],
                    quickFilterExcludeHiddenColumns: false,
                  },
                },
              }}
            />
          </Grid>
        )}
      </Box>
    </Container>
  );
}
