import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { PaymentManagement } from '../../src/components/PaymentManagement';

describe('PaymentManagement Component', () => {
  it('should render without errors', () => {
    expect(() => render(<PaymentManagement />)).not.toThrow();
  });

  it('should render component', () => {
    const { container } = render(<PaymentManagement />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should have content structure', () => {
    const { container } = render(<PaymentManagement />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
