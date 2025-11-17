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
import CartPage from "./components/CartPage";
import { CartProvider } from "./context/CartContext";
import RegisterForm from "./components/RegisterForm";
import CustomerProfile from "./components/CustomerProfile";
import CheckoutPage from "./components/CheckoutPage";
import VendorInvoices from "./components/VendorInvoices";
import VendorInvoiceDetail from "./components/VendorInvoiceDetail";
import VendorAccount from "./components/VendorAccount";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        {/* NavigationBar will appear on ALL pages */}
        <NavigationBar />

        <Routes>
          {/* Landing page */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication pages */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public pages */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:productId" element={<ProductDetails />} />

          {/* Vendor public pages */}
          <Route path="/vendor-account" element={<VendorAccount />} />
          <Route path="/vendor-invoices" element={<VendorInvoices />} />
          <Route path="/vendor-invoice/:invoiceId" element={<VendorInvoiceDetail />} />

          {/* Customer protected routes */}
          <Route
            path="/customer-profile"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Protected dashboard routes */}
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
