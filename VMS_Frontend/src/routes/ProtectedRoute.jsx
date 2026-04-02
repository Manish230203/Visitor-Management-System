import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute: Checks if a valid token exists in localStorage.
 * Optionally verifies if the user's role matches any of the allowedRoles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  // 1. If no token, the user is not authenticated -> redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. If allowedRoles is provided, check if user's role is in the list
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Determine where to redirect unauthorized but logged-in users
    // If they have a role, send them back to their own dashboard
    if (userRole) {
      const defaultPath = userRole === 'host' ? '/host/dashboard' : `/${userRole}/dashboard`;
      return <Navigate to={defaultPath} replace />;
    }
    // Fallback to login if something is wrong
    return <Navigate to="/" replace />;
  }

  // 3. User is authenticated and authorized -> render children
  return children;
};

export default ProtectedRoute;
