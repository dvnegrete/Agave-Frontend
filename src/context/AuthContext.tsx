/**
 * Auth Context Provider
 * Global authentication state management using React Context API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthContextType } from '@/shared/types/auth.types';
import { AuthContext } from './AuthContextStore';
import { tokenManager } from '@utils/tokenManager';
import * as authService from '@services/authService';
import { ROUTES } from '@/shared';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  /**
   * Initialize auth state from localStorage on mount
   * Check for refresh token to determine if user is authenticated
   * Access token is stored in httpOnly cookie by the backend
   */
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = tokenManager.getRefreshToken();
      const storedUser = tokenManager.getUser();

      if (refreshToken && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ email, password });

      // Backend automatically sets access_token in httpOnly cookie
      tokenManager.setRefreshToken(response.refreshToken);
      tokenManager.setUser(response.user);

      setUser(response.user);
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [navigate]);

  /**
   * Login with OAuth provider (Google, Facebook, etc.)
   */
  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      const response = await authService.initOAuthFlow(provider);
      // Redirect to OAuth provider - this takes user away from the app
      window.location.href = response.url;
    } catch (error) {
      console.error('OAuth login failed:', error);
      throw error;
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(() => {
    authService.signOut().catch(console.error);
    tokenManager.clearAll();
    setUser(null);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  /**
   * Update user data in context and localStorage
   */
  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    tokenManager.setUser(newUser);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithOAuth,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
