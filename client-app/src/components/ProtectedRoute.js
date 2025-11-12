import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // If no user logged in, redirect to login
  if (!user) return <Navigate to="/login" />;

  // If user role doesn't match, redirect to their correct dashboard
  if (user.role !== requiredRole) return <Navigate to={`/${user.role}-dashboard`} />;

  // Otherwise, allow access
  return children;
};

export default ProtectedRoute;
