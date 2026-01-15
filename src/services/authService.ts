/**
 * Auth Service
 * Handles all authentication API calls (sign in, OAuth, token refresh, etc.)
 */

import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  AuthResponse,
  LoginRequest,
  User,
} from '@/shared/types/auth.types';

/**
 * Sign in with email and password
 */
export const signIn = async (
  credentials: LoginRequest,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  try {
    return httpClient.post<AuthResponse>(
      API_ENDPOINTS.authSignIn,
      credentials,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in signIn:', err);
    throw err;
  }
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
  } catch (err: unknown) {
    console.error('❌ [authService] initOAuthFlow error:', err);
    throw err;
  }
};

/**
 * Handle OAuth callback with Supabase access token
 * Sends access token to backend for user creation and JWT generation
 * Backend sets access_token cookie automatically
 */
export const handleOAuthCallback = async (
  supabaseAccessToken: string,
  signal?: AbortSignal
): Promise<{ refreshToken: string }> => {
  console.log('🔐 [authService] handleOAuthCallback called with Supabase access token');
  try {
    const response = await httpClient.post<{ refreshToken: string }>(
      API_ENDPOINTS.authOAuthCallback,
      { accessToken: supabaseAccessToken },
      { signal }
    );
    console.log('🔐 [authService] handleOAuthCallback response:', {
      hasRefreshToken: !!response.refreshToken,
    });
    return response;
  } catch (err: unknown) {
    console.error('❌ [authService] handleOAuthCallback error:', err);
    throw err;
  }
};

/**
 * Refresh access token using refresh token
 * Backend sets new access_token cookie automatically
 */
export const refreshToken = async (
  refreshTokenValue: string,
  signal?: AbortSignal
): Promise<{ success: boolean }> => {
  try {
    return httpClient.post<{ success: boolean }>(
      API_ENDPOINTS.authRefresh,
      { refreshToken: refreshTokenValue },
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in refreshToken:', err);
    throw err;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  signal?: AbortSignal
): Promise<User> => {
  try {
    return httpClient.get<User>(
      API_ENDPOINTS.authMe,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getCurrentUser:', err);
    throw err;
  }
};

/**
 * Sign out current user
 */
export const signOut = async (
  signal?: AbortSignal
): Promise<void> => {
  try {
    await httpClient.post<void>(
      API_ENDPOINTS.authSignOut,
      {},
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in signOut:', err);
    throw err;
  }
};
