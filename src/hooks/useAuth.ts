/**
 * useAuth Hook
 * Custom hook for consuming the AuthContext
 */

import { useContext } from 'react';
import { AuthContext } from '@context/AuthContextStore';
import type { AuthContextType } from '@/shared/types/auth.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
