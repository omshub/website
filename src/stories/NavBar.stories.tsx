import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'
import { NavBar } from '@components/NavBar'

export default {
	title: 'Layout/NavBar',
	component: NavBar,
} as ComponentMeta<typeof NavBar>

const Template: ComponentStory<typeof NavBar> = (args) => <NavBar {...args} />

export const Primary = Template.bind({})
Primary.args = {
	label: 'NavBar',
	nextRouter: {
		pathname: '/',
	},
}
