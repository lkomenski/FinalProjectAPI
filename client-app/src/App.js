import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./components/CustomerDashboard";
import VendorDashboard from "./components/VendorDashboard";
import AdminDashboard from "./components/EmployeeDashboard";
import CustomerManagement from "./components/CustomerManagement";
import VendorManagement from "./components/VendorManagement";
import ProductManagement from "./components/ProductManagement";
import SalesDashboard from "./components/SalesDashboard";
import InvoiceArchive from "./components/InvoiceArchive";
import ProductDetails from "./components/ProductDetails";
import CartPage from "./components/CartPage";
import { CartProvider } from "./context/CartContext";
import RegisterForm from "./components/RegisterForm";
import VendorRegisterForm from "./components/VendorRegisterForm";
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
          <Route path="/register-vendor" element={<VendorRegisterForm />} />
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
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <CustomerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <VendorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <SalesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice-archive"
            element={
              <ProtectedRoute requiredRole="admin">
                <InvoiceArchive />
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
