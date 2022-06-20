import Home from '@/pages/index'
import { render, screen } from '@testing-library/react'
import 'jest-fetch-mock'
import { HomeProps } from '../pages/index'

jest.mock('../src/Link')

const props: HomeProps = {
	classesWithId: [
		{
			number: '6035',
			aliases: 'IIS',
			department: 'Computer Science',
			deprecated: false,
			foundational: 'Foundational',
			name: 'Introduction to Information Security',
			link: 'https://omscs.gatech.edu/cs-6035-introduction-to-information-security',
			course_id: 'CS-6035',
			id: 1,
		},
	],
}

describe('Home', () => {
	it('renders heading', () => {
		render(<Home {...props} />)
		expect(screen.getByRole('heading')).toHaveTextContent('OMSCS Courses')
	})
})
