import { describe, it, expect } from 'vitest';
import { render, screen } from '../__setup__/test-utils';
import Footer from '../../src/components/Footer';

describe('Footer Component', () => {
  it('should render footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should display address information', () => {
    render(<Footer />);
    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByText('Priv. Las Rosas 71, Temixco, Morelos, 62580')).toBeInTheDocument();
  });

  it('should display WhatsApp contact', () => {
    render(<Footer />);
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('+52 220 438 1497')).toBeInTheDocument();
  });

  it('should display email contact', () => {
    render(<Footer />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('contacto@condominioelagave.com.mx')).toBeInTheDocument();
  });

  it('should have correct WhatsApp link', () => {
    render(<Footer />);
    const whatsappLink = screen.getByRole('link', { name: '+52 220 438 1497' });
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/+5212204381497');
  });

  it('should have correct email link', () => {
    render(<Footer />);
    const emailLink = screen.getByRole('link', { name: 'contacto@condominioelagave.com.mx' });
    expect(emailLink).toHaveAttribute('href', 'mailto:contacto@condominioelagave.com.mx');
  });

  it('should display copyright notice', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Condominio El Agave. Todos los derechos reservados.`)).toBeInTheDocument();
  });

  it('should have correct CSS classes for styling', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('w-full', 'py-4', 'mt-4', 'border-t');
  });

  it('should render all SVG icons', () => {
    render(<Footer />);
    const svgs = screen.getByRole('contentinfo').querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });
});
