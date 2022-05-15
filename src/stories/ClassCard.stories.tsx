import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import Grid from '@mui/material/Grid'
import ClassCard from '../components/ClassCard'

export default {
	title: 'General/ClassCard',
	component: ClassCard,
} as ComponentMeta<typeof ClassCard>

const Template: ComponentStory<typeof ClassCard> = () => (
	<>
		<Grid container spacing={2}>
			<Grid item xs={4}>
				<ClassCard
					title='Machine Learning for Trading'
					acronym='ML4T'
					classId='CS 7641'
					blurb='This course introduces students to the real world challenges of implementing machine learning based trading strategies including the algorithmic steps from information gathering to market orders.'
					reviewCount={100}
					reviewValue={3.5}
					difficulty={3.0}
					image='/static/omshub-stub.jpg'
				></ClassCard>
			</Grid>
			<Grid item xs={4}>
				<ClassCard
					title='Knowledge Based AI'
					acronym='KBAI'
					classId='CS 7637'
					blurb='The twin goals of knowledge-based artificial intelligence (AI) are to build AI agents capable of human-level intelligence and gain insights into human cognition.'
					isFoundational={true}
					reviewCount={150}
					reviewValue={4}
					difficulty={2.0}
					image='/static/omshub-stub.jpg'
				></ClassCard>
			</Grid>
		</Grid>
	</>
)

export const Primary = Template.bind({})
