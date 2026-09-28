/**
 * Protected Route Component
 * Wrapper component that ensures only authenticated users can access routes
 * Redirects unauthenticated users to the login page
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@/shared';
import type { User } from '@shared/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional permission check; redirects to dashboard when it returns false */
  canAccess?: (user: User) => boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, canAccess }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (canAccess && (!user || !canAccess(user))) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
