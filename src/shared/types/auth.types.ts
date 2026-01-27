/**
 * Auth Types
 * Core type definitions for authentication system
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  houses?: number[];
  emailVerified?: boolean;
}

export interface AuthResponse {
  refreshToken?: string;
  user: User;
  requiresEmailConfirmation?: boolean;
  verificationSent?: boolean;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  houseNumber?: number;
  [key: string]: unknown;
}

export interface OAuthCallbackRequest {
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
