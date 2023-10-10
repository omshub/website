import * as React from 'react';
import { Typography } from '@mui/material';

const Copyright = () => (
  <Typography
    sx={{ m: 5 }}
    variant='body2'
    color='text.secondary'
    align='center'
  >
    {'Made with ♥ by the GATech community '}
    {new Date().getFullYear()}.
  </Typography>
);

export default Copyright;
