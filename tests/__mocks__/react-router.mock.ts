import { vi } from 'vitest';

export const mockNavigate = vi.fn();
export const mockUseParams = vi.fn(() => ({}));
export const mockUseLocation = vi.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
    useLocation: mockUseLocation,
  };
});
