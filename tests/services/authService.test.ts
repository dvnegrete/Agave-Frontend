import * as authService from '@/services/authService';
import { firebaseAuth } from '@/config/firebase';
import { httpClient } from '@/utils/httpClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signOut: jest.fn(),
  sendEmailVerification: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
  firebaseAuth: {
    currentUser: null,
  },
}));

jest.mock('@/utils/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('authService', () => {
  const mockUserCredential = {
    user: {
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
    },
  };

  const mockApiResponse = {
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'firebase-uid-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'TENANT',
      status: 'ACTIVE',
      emailVerified: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create user and send verification email', async () => {
      const mockUser = mockUserCredential.user;
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      (httpClient.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await authService.signUp(
        {
          email: 'test@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        },
        new AbortController().signal,
      );

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseAuth,
        'test@example.com',
        'Test123!',
      );

      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/signup',
        expect.objectContaining({
          idToken: expect.any(String),
          firstName: 'Test',
          lastName: 'User',
        }),
        expect.any(Object),
      );

      expect(result).toEqual(mockApiResponse);
    });

    it('should continue signup even if email sending fails', async () => {
      const mockUser = mockUserCredential.user;
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (sendEmailVerification as jest.Mock).mockRejectedValue(new Error('Email send failed'));
      (httpClient.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await authService.signUp(
        {
          email: 'test@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        },
        new AbortController().signal,
      );

      expect(result).toEqual(mockApiResponse);
      expect(sendEmailVerification).toHaveBeenCalled();
    });

    it('should throw error on Firebase creation failure', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Firebase error'),
      );

      await expect(
        authService.signUp(
          {
            email: 'test@example.com',
            password: 'Test123!',
          },
          new AbortController().signal,
        ),
      ).rejects.toThrow('Firebase error');
    });

    it('should throw error on backend signup failure', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUserCredential.user,
      });
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      (httpClient.post as jest.Mock).mockRejectedValue(
        new Error('Este email ya está registrado'),
      );

      await expect(
        authService.signUp(
          {
            email: 'test@example.com',
            password: 'Test123!',
          },
          new AbortController().signal,
        ),
      ).rejects.toThrow('Este email ya está registrado');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = mockUserCredential.user;
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (httpClient.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await authService.signIn(
        {
          email: 'test@example.com',
          password: 'Test123!',
        },
        new AbortController().signal,
      );

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseAuth,
        'test@example.com',
        'Test123!',
      );

      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/signin',
        expect.objectContaining({
          idToken: expect.any(String),
        }),
        expect.any(Object),
      );

      expect(result).toEqual(mockApiResponse);
    });

    it('should throw error on invalid credentials', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(
        authService.signIn(
          {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
          new AbortController().signal,
        ),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if email not verified', async () => {
      const mockUser = mockUserCredential.user;
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (httpClient.post as jest.Mock).mockRejectedValue(
        new Error('Por favor, verifica tu correo electrónico antes de continuar'),
      );

      await expect(
        authService.signIn(
          {
            email: 'test@example.com',
            password: 'Test123!',
          },
          new AbortController().signal,
        ),
      ).rejects.toThrow('Por favor, verifica tu correo electrónico antes de continuar');
    });
  });

  describe('loginWithOAuth', () => {
    it('should login with Google OAuth', async () => {
      const mockUser = mockUserCredential.user;
      (GoogleAuthProvider as jest.Mock).mockImplementation(() => ({}));
      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (httpClient.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await authService.loginWithOAuth(
        'google',
        new AbortController().signal,
      );

      expect(GoogleAuthProvider).toHaveBeenCalled();
      expect(signInWithPopup).toHaveBeenCalled();
      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/oauth/callback',
        expect.objectContaining({
          idToken: expect.any(String),
        }),
        expect.any(Object),
      );

      expect(result).toMatchObject({
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
        }),
      });
    });

    it('should throw error on OAuth failure', async () => {
      (GoogleAuthProvider as jest.Mock).mockImplementation(() => ({}));
      (signInWithPopup as jest.Mock).mockRejectedValue(new Error('OAuth failed'));

      await expect(
        authService.loginWithOAuth('google', new AbortController().signal),
      ).rejects.toThrow('OAuth failed');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email', async () => {
      const mockUser = mockUserCredential.user;
      (firebaseAuth as any).currentUser = mockUser;
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.resendVerificationEmail(new AbortController().signal);

      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result.message).toContain('Email de verificación reenviado');
    });

    it('should throw error when not authenticated', async () => {
      (firebaseAuth as any).currentUser = null;

      await expect(
        authService.resendVerificationEmail(new AbortController().signal),
      ).rejects.toThrow('User not authenticated');
    });

    it('should throw error on Firebase failure', async () => {
      const mockUser = mockUserCredential.user;
      (firebaseAuth as any).currentUser = mockUser;
      (sendEmailVerification as jest.Mock).mockRejectedValue(
        new Error('Email send failed'),
      );

      await expect(
        authService.resendVerificationEmail(new AbortController().signal),
      ).rejects.toThrow('Email send failed');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with backend', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await authService.verifyEmail('firebase-uid-123');

      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/verify-email',
        { uid: 'firebase-uid-123' },
        expect.any(Object),
      );

      expect(result).toEqual(mockApiResponse);
    });

    it('should throw error on verification failure', async () => {
      (httpClient.post as jest.Mock).mockRejectedValue(new Error('Verification failed'));

      await expect(authService.verifyEmail('invalid-uid')).rejects.toThrow(
        'Verification failed',
      );
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      const mockUser = mockUserCredential.user;
      (firebaseAuth as any).currentUser = mockUser;
      (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);
      (httpClient.post as jest.Mock).mockResolvedValue({});

      await authService.signOut();

      expect(firebaseSignOut).toHaveBeenCalledWith(firebaseAuth);
      expect(httpClient.post).toHaveBeenCalledWith('/auth/signout', {});
    });

    it('should still clear backend even if Firebase fails', async () => {
      (firebaseSignOut as jest.Mock).mockRejectedValue(new Error('Firebase error'));
      (httpClient.post as jest.Mock).mockResolvedValue({});

      await authService.signOut();

      expect(httpClient.post).toHaveBeenCalledWith('/auth/signout', {});
    });
  });
});
