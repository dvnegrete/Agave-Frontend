import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { BankReconciliation } from '../../src/components/BankReconciliation';

describe('BankReconciliation Component', () => {
  it('should render without errors', () => {
    expect(() => render(<BankReconciliation />)).not.toThrow();
  });

  it('should render component', () => {
    const { container } = render(<BankReconciliation />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should have main content structure', () => {
    const { container } = render(<BankReconciliation />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
