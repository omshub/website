import Home from '@/pages/index'
import { render, screen } from '@testing-library/react'

jest.mock('../src/Link')

describe('Home', () => {
	it('renders heading', () => {
		render(<Home />)
		expect(screen.getByRole('heading')).toHaveTextContent(
			'MUI v5 + Next.js with TypeScript example'
		)
	})
})
