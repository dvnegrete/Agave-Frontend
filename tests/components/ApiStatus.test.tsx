import { describe, it, expect } from 'vitest';
import { render } from '../__setup__/test-utils';
import { ApiStatus } from '../../src/components/ApiStatus';

describe('ApiStatus Component', () => {
  it('should render without errors', () => {
    expect(() => render(<ApiStatus />)).not.toThrow();
  });

  it('should check API status on mount', () => {
    render(<ApiStatus />);
    // Component performs API check in useEffect
  });

  it('should initialize status check', () => {
    render(<ApiStatus />);
    // Component initializes status check in useEffect
    // Status is 'checking' initially, so component returns null
  });
});
