import { render, screen } from '@testing-library/react';
import ColorCircle from '@/components/ui/ColorCircle';

describe('ColorCircle', () => {
  it('renders with specified color', () => {
    render(<ColorCircle color="#FF6B6B" data-testid="color-circle" />);
    const circles = document.querySelectorAll('.rounded-full');
    const coloredCircle = circles[0];
    expect(coloredCircle).toHaveStyle({ backgroundColor: '#FF6B6B' });
  });

  it('applies default medium size', () => {
    render(<ColorCircle color="#FF6B6B" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('w-12', 'h-12');
  });

  it('applies small size correctly', () => {
    render(<ColorCircle color="#FF6B6B" size="sm" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('w-8', 'h-8');
  });

  it('applies large size correctly', () => {
    render(<ColorCircle color="#FF6B6B" size="lg" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('w-20', 'h-20');
  });

  it('applies xl size correctly', () => {
    render(<ColorCircle color="#FF6B6B" size="xl" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('w-28', 'h-28');
  });

  it('renders label when provided', () => {
    render(<ColorCircle color="#FF6B6B" label="Coral Pink" />);
    expect(screen.getByText('Coral Pink')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<ColorCircle color="#FF6B6B" />);
    expect(container.querySelector('span')).not.toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <ColorCircle color="#FF6B6B" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has hover scale transition', () => {
    render(<ColorCircle color="#FF6B6B" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('hover:scale-105');
  });

  it('has shadow effect', () => {
    render(<ColorCircle color="#FF6B6B" />);
    const circle = document.querySelector('.rounded-full');
    expect(circle).toHaveClass('shadow-md');
  });

  it('centers content with flex', () => {
    const { container } = render(<ColorCircle color="#FF6B6B" label="Test" />);
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'items-center');
  });

  it('accepts various color formats', () => {
    const { rerender } = render(<ColorCircle color="#FF0000" />);
    let circle = document.querySelector('.rounded-full') as HTMLElement;
    expect(circle.style.backgroundColor).toBeTruthy();

    rerender(<ColorCircle color="rgb(255, 0, 0)" />);
    circle = document.querySelector('.rounded-full') as HTMLElement;
    expect(circle.style.backgroundColor).toBeTruthy();

    rerender(<ColorCircle color="red" />);
    circle = document.querySelector('.rounded-full') as HTMLElement;
    expect(circle.style.backgroundColor).toBeTruthy();
  });
});
