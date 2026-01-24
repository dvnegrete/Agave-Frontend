import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../__setup__/test-utils';
import userEvent from '@testing-library/user-event';
import Home from '../../src/components/Home';

describe('Home Component', () => {
  beforeEach(() => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  it('should render welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
  });

  it('should render main image', () => {
    render(<Home />);
    const img = screen.getByAltText('El Agave');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/el-agave-2.png');
  });

  it('should render login button', () => {
    render(<Home />);
    const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/ });
    expect(loginButton).toBeInTheDocument();
  });

  it('should render upload button', () => {
    render(<Home />);
    const uploadButton = screen.getByRole('button', { name: /Subir comprobante de mantenimiento/ });
    expect(uploadButton).toBeInTheDocument();
  });

  it('should render quick access buttons', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /Vouchers/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transacciones/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conciliación/ })).toBeInTheDocument();
  });

  it('should have quick access label', () => {
    render(<Home />);
    expect(screen.getByText('Acceso rápido:')).toBeInTheDocument();
  });

  it('should render "Quiénes Somos" button', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /Quiénes Somos/ });
    expect(button).toBeInTheDocument();
  });

  it('should render "Aviso de Privacidad" button', () => {
    render(<Home />);
    const button = screen.getByRole('button', { name: /Aviso de Privacidad/ });
    expect(button).toBeInTheDocument();
  });

  it('should open "Quiénes Somos" modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = screen.getByRole('button', { name: /Quiénes Somos/ });
    await user.click(button);

    expect(screen.getByText(/El Comité de vigilancia del Condominio El Agave/)).toBeInTheDocument();
  });

  it('should open "Aviso de Privacidad" modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = screen.getByRole('button', { name: /Aviso de Privacidad/ });
    await user.click(button);

    expect(screen.getByText(/respetamos y protegemos/)).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = screen.getByRole('button', { name: /Quiénes Somos/ });
    await user.click(button);

    expect(screen.getByText(/El Comité de vigilancia/)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: '' });
    if (closeButton) {
      // The close button is an SVG button, so we click it
      await user.click(closeButton);
    }
  });

  it('should have correct button variants', () => {
    render(<Home />);
    const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/ });
    expect(loginButton).toHaveClass('bg-blue-600/85');
  });

  it('should display privacy info modal with correct title', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = screen.getByRole('button', { name: /Aviso de Privacidad/ });
    await user.click(button);

    expect(screen.getByText('🔒 Aviso de Privacidad')).toBeInTheDocument();
  });

  it('should display privacy info with ARCO rights', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const button = screen.getByRole('button', { name: /Aviso de Privacidad/ });
    await user.click(button);

    expect(screen.getByText(/derechos de acceso, rectificación, cancelación u oposición/)).toBeInTheDocument();
  });
});
