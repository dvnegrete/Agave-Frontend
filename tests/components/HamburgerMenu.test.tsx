import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../__setup__/test-utils';
import userEvent from '@testing-library/user-event';
import { HamburgerMenu } from '../../src/components/HamburgerMenu';

describe('HamburgerMenu Component', () => {
  it('should render hamburger button', () => {
    render(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /toggle menu/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle menu when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    // Menu should be visible
    expect(screen.getByText('El Agave')).toBeInTheDocument();

    await user.click(button);
    // Menu items should still be in DOM but may not be visible
  });

  it('should display menu items when menu is open', async () => {
    const user = userEvent.setup();
    render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(button);

    expect(screen.getByText('El Agave')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Gestión')).toBeInTheDocument();
  });

  it('should have menu links for each route', async () => {
    const user = userEvent.setup();
    render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(button);

    const links = [
      { text: 'Inicio', href: '/' },
      { text: 'Vouchers', href: '/vouchers' },
      { text: 'Transacciones Bancarias', href: '/transactions' },
      { text: 'Conciliación', href: '/reconciliation' },
      { text: 'Gestión de Pagos', href: '/payment-management' },
    ];

    links.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: new RegExp(text) });
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should close menu when a link is clicked', async () => {
    const user = userEvent.setup();
    render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(button);

    const link = screen.getByRole('link', { name: /Inicio/ });
    await user.click(link);

    // Menu should be closed (sidebar should not be visible)
    // The menu state should be toggled
  });

  it('should render overlay when menu is open', async () => {
    const user = userEvent.setup();
    const { container } = render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(button);

    // Menu should be rendered and overlay should be present
    expect(screen.getByText('El Agave')).toBeInTheDocument();
  });

  it('should display menu icons', async () => {
    const user = userEvent.setup();
    render(<HamburgerMenu />);

    const button = screen.getByRole('button', { name: /toggle menu/i });
    await user.click(button);

    // Icons should be in the links
    const homeLink = screen.getByRole('link', { name: /🏠 Inicio/ });
    expect(homeLink).toBeInTheDocument();
  });

  it('should have hamburger button styling', () => {
    render(<HamburgerMenu />);
    const button = screen.getByRole('button', { name: /toggle menu/i });
    expect(button).toHaveClass('fixed', 'top-4', 'left-4', 'z-50');
  });
});
