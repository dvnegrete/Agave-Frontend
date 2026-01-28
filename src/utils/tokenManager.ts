/**
 * Token Manager Utility
 * Handles token persistence and user data in localStorage.
 *
 * Hybrid approach for token management:
 * - Access token: Stored in localStorage (for Authorization header)
 *   Fallback cuando cookies no funcionan en dominios diferentes
 * - Refresh token: Stored in localStorage
 * - Cookies: Backend también establece httpOnly cookies para navegadores que las soportan
 */

import type { User } from '@/shared/types/auth.types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'agave_access_token',
  REFRESH_TOKEN: 'agave_refresh_token',
  USER: 'agave_user',
} as const;

export const tokenManager = {
  /**
   * Get access token from localStorage
   * Usado para enviar en Authorization header en cada request
   * Permite funcionar cuando cookies no se comparten entre dominios
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Set access token in localStorage
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Get user data from localStorage
   */
  getUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Set user data in localStorage
   */
  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Clear all auth-related data from localStorage
   */
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};
