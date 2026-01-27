import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import * as authService from '@/services/authService';
import { tokenManager } from '@/utils/tokenManager';

jest.mock('@/services/authService');
jest.mock('@/utils/tokenManager', () => ({
  tokenManager: {
    setRefreshToken: jest.fn(),
    setUser: jest.fn(),
    getUser: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

// Mock useNavigate hook
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test component that uses AuthContext
const TestComponent = () => {
  const { user, login, logout, loginWithOAuth, loading, error } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {user ? (
        <div>
          <div>Logged in as: {user.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div>Not logged in</div>
          <button
            onClick={() =>
              login({
                email: 'test@example.com',
                password: 'Test123!',
              })
            }
          >
            Login
          </button>
          <button onClick={() => loginWithOAuth('google')}>Login with Google</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 'firebase-uid-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'TENANT',
    status: 'ACTIVE',
    emailVerified: true,
  };

  const mockAuthResponse = {
    refreshToken: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>{component}</AuthProvider>
      </BrowserRouter>,
    );
  };

  describe('login', () => {
    it('should login user successfully', async () => {
      (authService.signIn as jest.Mock).mockResolvedValue(mockAuthResponse);

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'Test123!',
          }),
          expect.any(Object),
        );
      });

      await waitFor(() => {
        expect(tokenManager.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token');
        expect(tokenManager.setUser).toHaveBeenCalledWith(mockUser);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      (authService.signIn as jest.Mock).mockRejectedValue(error);

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Error: Invalid credentials/)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/home');
    });
  });

  describe('loginWithOAuth', () => {
    it('should login with OAuth successfully', async () => {
      (authService.loginWithOAuth as jest.Mock).mockResolvedValue(mockAuthResponse);

      renderWithAuth(<TestComponent />);

      const oauthButton = screen.getByText('Login with Google');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(authService.loginWithOAuth).toHaveBeenCalledWith(
          'google',
          expect.any(Object),
        );
      });

      await waitFor(() => {
        expect(tokenManager.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token');
        expect(tokenManager.setUser).toHaveBeenCalledWith(mockUser);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('should handle OAuth error', async () => {
      const error = new Error('OAuth failed');
      (authService.loginWithOAuth as jest.Mock).mockRejectedValue(error);

      renderWithAuth(<TestComponent />);

      const oauthButton = screen.getByText('Login with Google');
      fireEvent.click(oauthButton);

      await waitFor(() => {
        expect(screen.getByText(/Error: OAuth failed/)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/home');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      (authService.signOut as jest.Mock).mockResolvedValue(undefined);
      // Mock user as already logged in
      (tokenManager.getUser as jest.Mock).mockReturnValue(mockUser);

      renderWithAuth(<TestComponent />);

      // Simulate user being logged in
      const logoutButton = await waitFor(() => screen.getByText('Logout'));

      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(authService.signOut).toHaveBeenCalled();
        expect(tokenManager.clearAll).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should clear tokens even if signOut fails', async () => {
      (authService.signOut as jest.Mock).mockRejectedValue(new Error('Sign out failed'));
      (tokenManager.getUser as jest.Mock).mockReturnValue(mockUser);

      renderWithAuth(<TestComponent />);

      const logoutButton = await waitFor(() => screen.getByText('Logout'));
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(tokenManager.clearAll).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('loading state', () => {
    it('should show loading state during login', async () => {
      (authService.signIn as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockAuthResponse), 100),
          ),
      );

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      // Should show loading state briefly
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      // Should disappear after login completes
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message on login failure', async () => {
      const errorMessage = 'Por favor, verifica tu correo electrónico antes de continuar';
      (authService.signIn as jest.Mock).mockRejectedValue(new Error(errorMessage));

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
      });
    });

    it('should clear error on new login attempt', async () => {
      (authService.signIn as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockAuthResponse);

      renderWithAuth(<TestComponent />);

      const loginButton = screen.getByText('Login');

      // First attempt - error
      fireEvent.click(loginButton);
      await waitFor(() => {
        expect(screen.getByText(/Error: First error/)).toBeInTheDocument();
      });

      // Second attempt - success
      fireEvent.click(loginButton);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });
  });
});
