import { render, screen } from '@testing-library/react';
import AutoBreadcrumbs from '@/components/AutoBreadcrumbs';
import HighlightedText from '@/components/HighlightedText';

const usePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

jest.mock('@/components/Breadcrumbs', () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <nav>
      {items.map((item: any) => (
        <span key={item.label}>{item.label}:{item.href ?? 'last'}</span>
      ))}
    </nav>
  ),
}));

jest.mock('@mantine/core', () => ({
  Text: ({ children, component: Component = 'span', ...props }: any) => (
    <Component {...props}>{children}</Component>
  ),
}));

describe('small component branches', () => {
  it('hides automatic breadcrumbs on home and index paths', () => {
    usePathname.mockReturnValue('/');
    const { container, rerender } = render(<AutoBreadcrumbs />);
    expect(container).toBeEmptyDOMElement();

    usePathname.mockReturnValue('/index');
    rerender(<AutoBreadcrumbs />);
    expect(container).toBeEmptyDOMElement();

    usePathname.mockReturnValue('///');
    rerender(<AutoBreadcrumbs />);
    expect(container).toBeEmptyDOMElement();
  });

  it('labels known, generated, and course breadcrumb segments', () => {
    usePathname.mockReturnValue('/course/cs-6200/custom');
    render(<AutoBreadcrumbs />);

    expect(screen.getByText('Courses:/course')).toBeInTheDocument();
    expect(screen.getByText('CS-6200:/course/cs-6200')).toBeInTheDocument();
    expect(screen.getByText('Custom:last')).toBeInTheDocument();
  });

  it('renders highlighted and unhighlighted text paths', () => {
    const { rerender } = render(<HighlightedText text="Operating Systems" highlight="" />);
    expect(screen.getByText('Operating Systems')).toBeInTheDocument();

    rerender(<HighlightedText text="A+B systems" highlight="A+B" />);
    expect(screen.getByText('A+B').tagName.toLowerCase()).toBe('mark');
  });
});
