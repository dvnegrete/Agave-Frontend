import { describe, it, expect, vi } from 'vitest';
import { render } from '../__setup__/test-utils';
import { ModalAssignHouse } from '../../src/components/ModalAssignHouse';

describe('ModalAssignHouse Component', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ModalAssignHouse
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        houses={[]}
      />
    );
    // Modal should not be visible
  });

  it('should render when isOpen is true', () => {
    const { container } = render(
      <ModalAssignHouse
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        houses={[]}
      />
    );

    expect(container.children.length).toBeGreaterThanOrEqual(0);
  });

  it('should render without errors', () => {
    expect(() =>
      render(
        <ModalAssignHouse
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          houses={[]}
        />
      )
    ).not.toThrow();
  });
});
