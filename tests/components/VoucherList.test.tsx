import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { VoucherList } from '../../src/components/VoucherList';

describe('VoucherList Component', () => {
  it('should render without errors', () => {
    expect(() => render(<VoucherList />)).not.toThrow();
  });

  it('should render component', () => {
    const { container } = render(<VoucherList />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should have list structure', () => {
    const { container } = render(<VoucherList />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
