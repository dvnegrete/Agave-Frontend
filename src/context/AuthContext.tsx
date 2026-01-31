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
   * Determina la ruta de redirección según el rol y estado del usuario
   * - Tenant sin casas → HOME (mostrar mensaje de espera de confirmación)
   * - Tenant con casas → DASHBOARD
   * - Admin/Owner → DASHBOARD
   */
  const getRedirectRoute = (userData: User): string => {
    // Tenant sin casas asignadas (en espera de confirmación)
    if (userData.role === 'tenant' && (!userData.houses || userData.houses.length === 0)) {
      return ROUTES.HOME;
    }

    // Todos los demás casos van al dashboard
    // - Tenant con casas asignadas
    // - Admin
    // - Owner
    return ROUTES.DASHBOARD;
  };

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

      // Backend establece access_token en httpOnly cookie Y retorna en response
      // Guardar accessToken para enviar en Authorization header (fallback si cookies no funcionan)
      if (response.accessToken) {
        tokenManager.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        tokenManager.setRefreshToken(response.refreshToken);
      }
      tokenManager.setUser(response.user);

      setUser(response.user);

      // Redirigir según rol y estado del usuario
      const redirectRoute = getRedirectRoute(response.user);
      navigate(redirectRoute);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [navigate]);

  /**
   * Login with OAuth provider (Google, Facebook, etc.)
   * Firebase Client SDK maneja el popup y callback automáticamente
   */
  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      const response = await authService.loginWithOAuth(provider);

      // Backend establece access_token en httpOnly cookie Y retorna en response
      // Guardar accessToken para enviar en Authorization header (fallback si cookies no funcionan)
      if (response.accessToken) {
        tokenManager.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        tokenManager.setRefreshToken(response.refreshToken);
      }
      tokenManager.setUser(response.user);

      setUser(response.user);

      // Redirigir según rol y estado del usuario
      const redirectRoute = getRedirectRoute(response.user);
      navigate(redirectRoute);
    } catch (error) {
      console.error('OAuth login failed:', error);
      throw error;
    }
  }, [navigate]);

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
