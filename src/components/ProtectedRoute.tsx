/**
 * Protected Route Component
 * Wrapper component that ensures only authenticated users can access routes
 * Redirects unauthenticated users to the login page
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🛡️ [ProtectedRoute] Checking auth:', {
    isAuthenticated,
    isLoading,
    userEmail: user?.email,
  });

  if (isLoading) {
    console.log('🛡️ [ProtectedRoute] Still loading...');
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('⚠️ [ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [ProtectedRoute] Authenticated, allowing access');
  return <>{children}</>;
};
