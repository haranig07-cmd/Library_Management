import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role not authorized, redirect to an unauthorized page or back home
    // For now, redirecting to their respective dashboard if they try to access wrong one
    const dashboardRoutes = {
      Admin: '/admin-dashboard',
      Librarian: '/librarian-dashboard',
      Faculty: '/faculty-dashboard',
      Student: '/student-dashboard'
    };
    
    return <Navigate to={dashboardRoutes[userRole] || '/'} replace />;
  }

  // If authorized, return child routes
  return <Outlet />;
};

export default ProtectedRoute;
