import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavigationBar from "./Styles/NavBar";
import HomePage from "./Styles/HomePage";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./components/CustomerDashboard";
import VendorDashboard from "./components/VendorDashboard";
import AdminDashboard from "./components/EmployeeDashboard";
import ProductDetails from "./components/ProductDetails";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      {/* NavigationBar will appear on ALL pages */}
      <NavigationBar />

      <Routes>
        {/* Landing page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Cart page */}
        <Route path="/cart" element={<CartPage />} />

        {/* Public login page */}
        <Route path="/login" element={<LoginForm />} />

        {/* Product details page */}
        <Route path="/product/:productId" element={<ProductDetails />} />

        {/* Protected dashboards */}
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

        {/* Default fallback → HomePage */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </CartProvider>
  </BrowserRouter>
);
}
export default App;
