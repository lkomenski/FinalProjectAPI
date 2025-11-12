import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * 
 * Wraps around routes that require authentication.
 * - Checks for `user` in localStorage.
 * - Verifies that user's role matches `requiredRole`.
 */
function ProtectedRoute({ children, requiredRole }) {
  // Get user data from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 1. If user not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If user role doesn't match → redirect to their correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    switch (user.role) {
      case "customer":
        return <Navigate to="/customer-dashboard" replace />;
      case "vendor":
        return <Navigate to="/vendor-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // 3. Otherwise → allow access
  return children;
}

export default ProtectedRoute;
