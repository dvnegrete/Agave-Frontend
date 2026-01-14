/**
 * Token Manager Utility
 * Handles refresh tokens and user data persistence in localStorage.
 * Access tokens are now stored in httpOnly cookies by the backend.
 */

import type { User } from '../types/auth.types';

const STORAGE_KEYS = {
  REFRESH_TOKEN: 'agave_refresh_token',
  USER: 'agave_user',
} as const;

export const tokenManager = {
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
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};
