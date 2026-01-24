/**
 * Auth Service
 * Handles all authentication API calls (sign in, OAuth, token refresh, etc.)
 */

import { httpClient } from '@utils/httpClient';
import { API_ENDPOINTS } from '@config/api';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
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
    console.error('Sign in failed:', err);
    throw err;
  }
};

/**
 * Sign up new user with email and password
 */
export const signUp = async (
  data: SignupRequest,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  try {
    return httpClient.post<AuthResponse>(
      API_ENDPOINTS.authSignUp,
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('Sign up failed:', err);
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
  try {
    const response = await httpClient.post<{ url: string }>(
      API_ENDPOINTS.authOAuthSignIn,
      { provider },
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('OAuth initiation failed:', err);
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
  try {
    const response = await httpClient.post<{ refreshToken: string }>(
      API_ENDPOINTS.authOAuthCallback,
      { accessToken: supabaseAccessToken },
      { signal }
    );
    return response;
  } catch (err: unknown) {
    console.error('OAuth callback failed:', err);
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
    console.error('Token refresh failed:', err);
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
    console.error('Failed to get current user:', err);
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
    console.error('Sign out failed:', err);
    throw err;
  }
};
