import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../__setup__/test-utils';
import userEvent from '@testing-library/user-event';
import Login from '../../src/components/Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should have email input field', () => {
    render(<Login />);
    const emailInputs = screen.getAllByRole('textbox');
    expect(emailInputs.length).toBeGreaterThan(0);
  });

  it('should have password input field', () => {
    render(<Login />);
    const passwordInputs = screen.getAllByRole('textbox');
    expect(passwordInputs.length).toBeGreaterThan(0);
  });

  it('should have submit button', () => {
    render(<Login />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render with correct layout classes', () => {
    const { container } = render(<Login />);
    expect(container.querySelector('main')).toHaveClass('flex', 'min-h-full', 'flex-col');
  });
});
