import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { UnclaimedDepositsSection } from '../../src/components/UnclaimedDepositsSection';

describe('UnclaimedDepositsSection Component', () => {
  it('should render without errors', () => {
    expect(() => render(<UnclaimedDepositsSection />)).not.toThrow();
  });

  it('should render component', () => {
    const { container } = render(<UnclaimedDepositsSection />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should have section structure', () => {
    const { container } = render(<UnclaimedDepositsSection />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
