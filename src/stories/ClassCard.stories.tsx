import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import ClassCard from '@components/ClassCard';
import Grid from '@mui/material/Grid';

export default {
  title: 'General/ClassCard',
  component: ClassCard,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/class',
      },
    },
  },
} as Meta<typeof ClassCard>;

const Template: StoryFn<typeof ClassCard> = (args) => (
  <>
    <Grid container spacing={2}>
      <Grid size={4}>
        <ClassCard {...args}></ClassCard>
      </Grid>
    </Grid>
  </>
);

export const Primary = Template.bind({});
Primary.args = {
  title: 'Knowledge Based AI',
  acronym: 'KBAI',
  classId: 'CS-7637',
  classNumber: '7637',
  department: 'CS',
  link: 'https://omscs.gatech.edu/cs-7637-knowledge-based-artificial-intelligence-cognitive-systems',
  blurb:
    'The twin goals of knowledge-based artificial intelligence (AI) are to build AI agents capable of human-level intelligence and gain insights into human cognition.',
  isFoundational: true,
  reviewCount: 150,
  reviewValue: 4,
  difficulty: 2.0,
  image: '/static/omshub-stub.jpg',
};
