import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/shared/NavBar";
import HomePage from "./components/shared/HomePage";
import LoginForm from "./components/shared/LoginForm";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import CustomerDashboard from "./components/Customer View/CustomerDashboard";
import VendorDashboard from "./components/Vendor View/VendorDashboard";
import AdminDashboard from "./components/Admin View/EmployeeDashboard";
import CustomerManagement from "./components/Admin View/CustomerManagement";
import VendorManagement from "./components/Admin View/VendorManagement";
import ProductManagement from "./components/Admin View/ProductManagement";
import SalesDashboard from "./components/Admin View/SalesDashboard";
import InvoiceArchive from "./components/Admin View/InvoiceArchive";
import ProductDetails from "./components/shared/ProductDetails";
import CartPage from "./components/Customer View/CartPage";
import { CartProvider } from "./context/CartContext";
import RegisterForm from "./components/shared/RegisterForm";
import VendorRegisterForm from "./components/Vendor View/VendorRegisterForm";
import CustomerProfile from "./components/Customer View/CustomerProfile";
import CheckoutPage from "./components/Customer View/CheckoutPage";
import VendorInvoices from "./components/Vendor View/VendorInvoices";
import VendorInvoiceDetail from "./components/Vendor View/VendorInvoiceDetail";
import VendorAccount from "./components/Vendor View/VendorAccount";
import ResetPassword from "./components/shared/ResetPassword";

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
