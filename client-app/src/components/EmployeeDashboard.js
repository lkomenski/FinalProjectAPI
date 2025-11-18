import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      if (!user || user.role !== "admin") {
        setError("Unauthorized access. Admins only.");
        setLoading(false);
        return;
      }

      const data = await fetchData("dashboard/admin");

      setStats({
        totalCustomers: data.totalCustomers,
        activeCustomers: data.activeCustomers,
        totalVendors: data.totalVendors,
        activeVendors: data.activeVendors,
        totalProducts: data.totalProducts,
        totalSales: data.totalSales,
        totalOutstandingInvoices: data.totalOutstandingInvoices,
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      <h3 className="dashboard-subtitle">System Metrics</h3>
      <div className="dashboard-grid">
        <div className="dashboard-card clickable" onClick={() => navigate("/customer-management")}>
          <h3>Total Customers</h3>
          <div className="value">{stats.totalCustomers}</div>
        </div>
        <div className="dashboard-card clickable" onClick={() => navigate("/customer-management")}>
          <h3>Active Customers</h3>
          <div className="value">{stats.activeCustomers}</div>
        </div>
        <div className="dashboard-card clickable" onClick={() => navigate("/vendor-management")}>
          <h3>Total Vendors</h3>
          <div className="value">{stats.totalVendors}</div>
        </div>
        <div className="dashboard-card clickable" onClick={() => navigate("/vendor-management")}>
          <h3>Active Vendors</h3>
          <div className="value">{stats.activeVendors}</div>
        </div>
        <div className="dashboard-card clickable" onClick={() => navigate("/product-management")}>
          <h3>Total Products</h3>
          <div className="value">{stats.totalProducts}</div>
        </div>
        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <div className="value">${stats.totalSales.toFixed(2)}</div>
        </div>
        <div className="dashboard-card">
          <h3>Outstanding Invoices</h3>
          <div className="value">${stats.totalOutstandingInvoices.toFixed(2)}</div>
        </div>
      </div>

      <h3 className="dashboard-subtitle">Management</h3>
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <button 
          className="dashboard-btn dashboard-btn-primary" 
          style={{ padding: '20px', fontSize: '1.1rem' }}
          onClick={() => navigate("/customer-management")}
        >
          Manage Customers
        </button>
        <button 
          className="dashboard-btn dashboard-btn-primary" 
          style={{ padding: '20px', fontSize: '1.1rem' }}
          onClick={() => navigate("/vendor-management")}
        >
          Manage Vendors
        </button>
        <button 
          className="dashboard-btn dashboard-btn-primary" 
          style={{ padding: '20px', fontSize: '1.1rem' }}
          onClick={() => navigate("/product-management")}
        >
          Manage Products
        </button>
      </div>
    </div>
  );
}
