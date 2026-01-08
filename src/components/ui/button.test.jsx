import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', () => {
    let clicked = false;
    const handleClick = () => { clicked = true; };

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(clicked).toBe(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('secondary');
  });

  it('should apply size classes', () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole('button');
    // Size 'sm' results in 'text-xs' class in the button implementation
    expect(button.className).toContain('text-xs');
  });

  it('should support asChild prop for custom element', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link as button</a>
      </Button>
    );

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/test');
  });

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });
});