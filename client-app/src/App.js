import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./components/CustomerDashboard";
import VendorDashboard from "./components/VendorDashboard";
import AdminDashboard from "./components/EmployeeDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="*" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
