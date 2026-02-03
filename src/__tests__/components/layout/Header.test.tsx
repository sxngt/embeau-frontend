import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';

// Mock next/navigation
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title when provided', () => {
    render(<Header title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('h1')).not.toBeInTheDocument();
  });

  it('shows back button when showBack is true', () => {
    render(<Header showBack />);
    expect(screen.getByLabelText('뒤로 가기')).toBeInTheDocument();
  });

  it('does not show back button by default', () => {
    render(<Header />);
    expect(screen.queryByLabelText('뒤로 가기')).not.toBeInTheDocument();
  });

  it('calls router.back when back button is clicked without onBack', () => {
    render(<Header showBack />);

    fireEvent.click(screen.getByLabelText('뒤로 가기'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls custom onBack when provided', () => {
    const handleBack = jest.fn();
    render(<Header showBack onBack={handleBack} />);

    fireEvent.click(screen.getByLabelText('뒤로 가기'));
    expect(handleBack).toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('renders right action when provided', () => {
    render(
      <Header rightAction={<button data-testid="right-action">Action</button>} />
    );
    expect(screen.getByTestId('right-action')).toBeInTheDocument();
  });

  it('applies transparent style by default', () => {
    render(<Header data-testid="header" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-transparent');
  });

  it('applies solid background when transparent is false', () => {
    render(<Header transparent={false} />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white/80');
  });

  it('applies custom className', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-class');
  });

  it('is sticky positioned', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('renders complete header with all props', () => {
    const handleBack = jest.fn();
    render(
      <Header
        title="Complete Header"
        showBack
        onBack={handleBack}
        rightAction={<span>Right</span>}
        transparent={false}
        className="test-class"
      />
    );

    expect(screen.getByText('Complete Header')).toBeInTheDocument();
    expect(screen.getByLabelText('뒤로 가기')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white/80', 'test-class');
  });
});
