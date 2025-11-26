import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute Component
 * 
 * Wraps around routes that require authentication.
 * - Checks for `user` in localStorage.
 * - Verifies that user's role matches `requiredRole`.
 * - If user is not authenticated or has wrong role, redirects to login page.
 */
function ProtectedRoute({ children, requiredRole }) {
  // Get user data from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // If user not logged in or role doesn't match → redirect to login
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise → allow access
  return children;
}

export default ProtectedRoute;
