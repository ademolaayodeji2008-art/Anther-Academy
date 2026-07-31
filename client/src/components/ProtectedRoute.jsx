import { Navigate } from 'react-router-dom';
import authService from '../lib/authService';

/**
 * ProtectedRoute: Wrapper component for routes that require authentication
 * Redirects to login if not authenticated
 * Optionally checks for specific role
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = null 
}) {
  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  if (!isAuthenticated || !user) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have required role
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return children;
}
