import { render, screen } from '@testing-library/react';
import BottomNavigation from '@/components/layout/BottomNavigation';

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/main');
  });

  it('renders all navigation items', () => {
    render(<BottomNavigation />);
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('추천가이드')).toBeInTheDocument();
    expect(screen.getByText('리포트')).toBeInTheDocument();
  });

  it('renders navigation links with correct href', () => {
    render(<BottomNavigation />);

    expect(screen.getByRole('link', { name: /HOME/i })).toHaveAttribute('href', '/main');
    expect(screen.getByRole('link', { name: /추천가이드/i })).toHaveAttribute('href', '/recommendation');
    expect(screen.getByRole('link', { name: /리포트/i })).toHaveAttribute('href', '/insight');
  });

  it('highlights active navigation item for /main', () => {
    mockPathname.mockReturnValue('/main');
    render(<BottomNavigation />);

    const homeLink = screen.getByRole('link', { name: /HOME/i });
    expect(homeLink).toHaveClass('text-primary-pink');
  });

  it('highlights active navigation item for /', () => {
    mockPathname.mockReturnValue('/');
    render(<BottomNavigation />);

    const homeLink = screen.getByRole('link', { name: /HOME/i });
    expect(homeLink).toHaveClass('text-primary-pink');
  });

  it('highlights active navigation item for /recommendation', () => {
    mockPathname.mockReturnValue('/recommendation');
    render(<BottomNavigation />);

    const recommendLink = screen.getByRole('link', { name: /추천가이드/i });
    expect(recommendLink).toHaveClass('text-primary-pink');
  });

  it('highlights active navigation item for /insight', () => {
    mockPathname.mockReturnValue('/insight');
    render(<BottomNavigation />);

    const reportLink = screen.getByRole('link', { name: /리포트/i });
    expect(reportLink).toHaveClass('text-primary-pink');
  });

  it('highlights recommendation for sub-paths', () => {
    mockPathname.mockReturnValue('/recommendation/detail');
    render(<BottomNavigation />);

    const recommendLink = screen.getByRole('link', { name: /추천가이드/i });
    expect(recommendLink).toHaveClass('text-primary-pink');
  });

  it('inactive items have neutral color', () => {
    mockPathname.mockReturnValue('/main');
    render(<BottomNavigation />);

    const recommendLink = screen.getByRole('link', { name: /추천가이드/i });
    const reportLink = screen.getByRole('link', { name: /리포트/i });

    expect(recommendLink).toHaveClass('text-neutral-400');
    expect(reportLink).toHaveClass('text-neutral-400');
  });

  it('is fixed positioned at bottom', () => {
    render(<BottomNavigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'bottom-0', 'z-50');
  });

  it('applies custom className', () => {
    render(<BottomNavigation className="custom-class" />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('has proper layout structure', () => {
    render(<BottomNavigation />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('flex', 'justify-center');
  });

  it('renders icons for each navigation item', () => {
    const { container } = render(<BottomNavigation />);
    // Each nav item has an icon (svg element)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(3);
  });
});
