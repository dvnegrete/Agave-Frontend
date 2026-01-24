/**
 * Auth Context Store
 * Separated context creation for proper Fast Refresh support
 */

import { createContext } from 'react';
import type { AuthContextType } from '@/shared/types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
