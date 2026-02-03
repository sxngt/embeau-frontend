import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackRating from '@/components/ui/FeedbackRating';

describe('FeedbackRating', () => {
  it('renders default label', () => {
    render(<FeedbackRating />);
    expect(screen.getByText('추천이 마음에 드시나요?')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<FeedbackRating label="이 기능이 마음에 드시나요?" />);
    expect(screen.getByText('이 기능이 마음에 드시나요?')).toBeInTheDocument();
  });

  it('renders all 5 emoji buttons', () => {
    render(<FeedbackRating />);
    expect(screen.getByLabelText('매우 나쁨')).toBeInTheDocument();
    expect(screen.getByLabelText('나쁨')).toBeInTheDocument();
    expect(screen.getByLabelText('보통')).toBeInTheDocument();
    expect(screen.getByLabelText('좋음')).toBeInTheDocument();
    expect(screen.getByLabelText('매우 좋음')).toBeInTheDocument();
  });

  it('calls onChange when rating is selected', () => {
    const handleChange = jest.fn();
    render(<FeedbackRating onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('좋음'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('highlights selected rating', () => {
    render(<FeedbackRating value={4} />);
    const goodButton = screen.getByLabelText('좋음');
    expect(goodButton).toHaveClass('ring-2', 'ring-offset-2');
  });

  it('applies hover effect on mouse enter', () => {
    render(<FeedbackRating />);
    const button = screen.getByLabelText('매우 좋음');

    fireEvent.mouseEnter(button);
    expect(button).toHaveClass('opacity-100');
  });

  it('removes hover effect on mouse leave', () => {
    render(<FeedbackRating />);
    const button = screen.getByLabelText('매우 좋음');

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    expect(button).toHaveClass('opacity-60');
  });

  it('displays rating scale labels', () => {
    render(<FeedbackRating />);
    const labels = screen.getAllByText(/매우 나쁨|매우 좋음/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<FeedbackRating className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows correct emoji for each rating', () => {
    render(<FeedbackRating />);
    expect(screen.getByText('😣')).toBeInTheDocument();
    expect(screen.getByText('😟')).toBeInTheDocument();
    expect(screen.getByText('😐')).toBeInTheDocument();
    expect(screen.getByText('🙂')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('allows changing rating', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <FeedbackRating value={3} onChange={handleChange} />
    );

    expect(screen.getByLabelText('보통')).toHaveClass('ring-2');

    fireEvent.click(screen.getByLabelText('매우 좋음'));
    expect(handleChange).toHaveBeenCalledWith(5);

    rerender(<FeedbackRating value={5} onChange={handleChange} />);
    expect(screen.getByLabelText('매우 좋음')).toHaveClass('ring-2');
  });

  it('all buttons are accessible with type=button', () => {
    render(<FeedbackRating />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('each button has aria-label for accessibility', () => {
    render(<FeedbackRating />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
