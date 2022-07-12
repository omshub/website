import Home from '@/pages/index'
import { render, screen } from '@testing-library/react'
import 'jest-fetch-mock'

jest.mock('../src/Link')

describe('Home', () => {
	it('renders heading', () => {
		render(<Home />)
		expect(screen.getByRole('heading')).toHaveTextContent('OMSCS Courses')
	})
})
