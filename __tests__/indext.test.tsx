import Home from '@/pages/index'
import { render, screen } from '@testing-library/react'

jest.mock('../src/Link')

describe('Home', () => {
	it('renders heading', () => {
		render(<Home />)
		expect(screen.getByRole('heading')).toHaveTextContent(
			'You are looking at index.tsx'
		)
	})
})
