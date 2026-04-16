// ═══════════════════════════════════════════
// FRONTEND - Protected Route Component
// File: src/components/ProtectedRoute.jsx
// Wraps routes that require authentication
// ═══════════════════════════════════════════

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6366f1'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role?.toLowerCase();
    const hasPermission = allowedRoles.some(
      role => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '16px'
        }}>
          <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
          <p style={{ color: '#64748b' }}>
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;