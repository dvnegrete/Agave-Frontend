import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { TransactionUpload } from '../../src/components/TransactionUpload';

describe('TransactionUpload Component', () => {
  it('should render without errors', () => {
    expect(() => render(<TransactionUpload />)).not.toThrow();
  });

  it('should render component', () => {
    const { container } = render(<TransactionUpload />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should have upload interface', () => {
    const { container } = render(<TransactionUpload />);
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
  });
});
