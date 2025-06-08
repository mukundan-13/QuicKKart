import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, roles, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-4">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // if (allowedRoles.length > 0 && !allowedRoles.some(role => roles.includes(role.toUpperCase()))) {
  //   // User is authenticated but doesn't have the required role
  //   return <Navigate to="/unauthorized" replace />; // Create an unauthorized page
  // }

  return <Outlet />;
};

export default ProtectedRoute;
