import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import ClassCard from '@components/ClassCard';
import { Grid } from '@mui/material';

export default {
  title: 'General/ClassCard',
  component: ClassCard,
} as Meta<typeof ClassCard>;

const Template: StoryFn<typeof ClassCard> = (args) => (
  <>
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <ClassCard {...args}></ClassCard>
      </Grid>
    </Grid>
  </>
);

export const Primary = Template.bind({});
Primary.args = {
  title: 'Knowledge Based AI',
  acronym: 'KBAI',
  classId: 'CS 7637',
  blurb:
    'The twin goals of knowledge-based artificial intelligence (AI) are to build AI agents capable of human-level intelligence and gain insights into human cognition.',
  isFoundational: true,
  reviewCount: 150,
  reviewValue: 4,
  difficulty: 2.0,
  image: '/static/omshub-stub.jpg',
};
