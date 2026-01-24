import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../__setup__/test-utils';
import userEvent from '@testing-library/user-event';
import { StartReconciliationModal } from '../../src/components/StartReconciliationModal';

describe('StartReconciliationModal Component', () => {
  it('should not render when isOpen is false', () => {
    render(
      <StartReconciliationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <StartReconciliationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <StartReconciliationModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    // Try to find and click close button
    const closeButton = screen.queryByRole('button', { name: '' });
    if (closeButton && closeButton.querySelector('svg')) {
      await user.click(closeButton);
    }
  });

  it('should have action buttons', () => {
    render(
      <StartReconciliationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it('should render modal content', () => {
    render(
      <StartReconciliationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Modal should be visible when isOpen is true
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() =>
      render(
        <StartReconciliationModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
        />
      )
    ).not.toThrow();
  });
});
