import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role);
    if (!hasRole) {
      // Direct user to their appropriate role home if attempting unauthorized route
      if (user?.role === 'ROLE_PATIENT') return <Navigate to="/patient" replace />;
      if (user?.role === 'ROLE_DOCTOR') return <Navigate to="/doctor" replace />;
      if (user?.role === 'ROLE_CHW') return <Navigate to="/chw" replace />;
      if (user?.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
