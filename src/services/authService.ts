/**
 * Auth Service
 * Handles all authentication API calls (sign in, OAuth, token refresh, etc.)
 */

import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  AuthResponse,
  LoginRequest,
  User,
} from '../types/auth.types';

/**
 * Sign in with email and password
 */
export const signIn = async (
  credentials: LoginRequest,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  return httpClient.post<AuthResponse>(
    API_ENDPOINTS.authSignIn,
    credentials,
    { signal }
  );
};

/**
 * Initiate OAuth flow with provider
 * Returns URL to redirect user to
 */
export const initOAuthFlow = async (
  provider: 'google' | 'facebook',
  signal?: AbortSignal
): Promise<{ url: string }> => {
  console.log('🔐 [authService] initOAuthFlow called with provider:', provider);
  console.log('🔐 [authService] About to POST to:', API_ENDPOINTS.authOAuthSignIn, 'with data:', { provider });

  try {
    const response = await httpClient.post<{ url: string }>(
      API_ENDPOINTS.authOAuthSignIn,
      { provider },
      { signal }
    );
    console.log('🔐 [authService] initOAuthFlow response:', response);
    return response;
  } catch (error) {
    console.error('❌ [authService] initOAuthFlow error:', error);
    throw error;
  }
};

/**
 * Handle OAuth callback with authorization code
 */
export const handleOAuthCallback = async (
  code: string,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  console.log('🔐 [authService] handleOAuthCallback called with code:', code);
  try {
    const response = await httpClient.get<AuthResponse>(
      `${API_ENDPOINTS.authOAuthCallback}?code=${code}`,
      { signal }
    );
    console.log('🔐 [authService] handleOAuthCallback response:', {
      hasAccessToken: !!response.accessToken,
      hasRefreshToken: !!response.refreshToken,
      user: response.user,
    });
    console.log('🔐 [authService] handleOAuthCallback full response:', response);
    return response;
  } catch (error) {
    console.error('❌ [authService] handleOAuthCallback error:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  refreshTokenValue: string,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  return httpClient.post<AuthResponse>(
    API_ENDPOINTS.authRefresh,
    { refreshToken: refreshTokenValue },
    { signal }
  );
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  signal?: AbortSignal
): Promise<User> => {
  return httpClient.get<User>(
    API_ENDPOINTS.authMe,
    { signal }
  );
};

/**
 * Sign out current user
 */
export const signOut = async (
  signal?: AbortSignal
): Promise<void> => {
  await httpClient.post<void>(
    API_ENDPOINTS.authSignOut,
    {},
    { signal }
  );
};
