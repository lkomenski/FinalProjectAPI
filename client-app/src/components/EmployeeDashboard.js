import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import "../Styles/Dashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const loadDashboard = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Prepare chart data
  const customerData = stats ? [
    { name: 'Active', value: stats.activeCustomers, color: '#10b981' },
    { name: 'Inactive', value: stats.totalCustomers - stats.activeCustomers, color: '#ef4444' }
  ] : [];

  const vendorData = stats ? [
    { name: 'Active', value: stats.activeVendors, color: '#3b82f6' },
    { name: 'Inactive', value: stats.totalVendors - stats.activeVendors, color: '#f59e0b' }
  ] : [];

  const salesData = stats ? [
    { name: 'Paid', value: stats.totalSales - stats.totalOutstandingInvoices, color: '#10b981' },
    { name: 'Outstanding', value: stats.totalOutstandingInvoices, color: '#ef4444' }
  ] : [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="dashboard-title" style={{ margin: 0 }}>Admin Dashboard</h2>
        <button 
          className="dashboard-btn dashboard-btn-primary" 
          style={{ padding: '12px 24px', fontSize: '1rem' }}
          onClick={() => navigate("/sales-dashboard")}
        >
          View Sales Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', gap: '25px' }}>
        {/* Left Panel - Employee Information */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="dashboard-card" style={{ padding: '25px', height: '100%' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Employee Information
            </h3>
            
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 15px' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                {user?.role || 'Administrator'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Email</div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937', wordBreak: 'break-word' }}>{user?.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Employee ID</div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>{user?.id || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Status</div>
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ padding: '3px 10px', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Quick Tip</h4>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                Click on individual metrics to navigate directly to filtered views.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          {/* 4 Main Sections Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
            
            {/* Customers Section */}
            <div 
              className="dashboard-card" 
              style={{ padding: '25px', minHeight: '300px' }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                Customers
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ marginBottom: '15px', cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/customer-management")}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Total Customers</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalCustomers}</div>
                  </div>
                  <div 
                    style={{ cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/customer-management")}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Active Customers</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.activeCustomers}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Vendors Section */}
            <div 
              className="dashboard-card" 
              style={{ padding: '25px', minHeight: '300px' }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                Vendors
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ marginBottom: '15px', cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/vendor-management")}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Total Vendors</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalVendors}</div>
                  </div>
                  <div 
                    style={{ cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/vendor-management")}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Active Vendors</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.activeVendors}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={vendorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vendorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sales Section */}
            <div 
              className="dashboard-card" 
              style={{ padding: '25px', minHeight: '300px' }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                Sales & Invoices
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div 
                    style={{ marginBottom: '15px', cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/sales-dashboard")}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Total Sales</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>${stats.totalSales.toFixed(2)}</div>
                  </div>
                  <div 
                    style={{ cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                    className="clickable-stat"
                    onClick={() => navigate("/sales-dashboard", { state: { filter: 'unpaid' } })}
                  >
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Outstanding</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>${stats.totalOutstandingInvoices.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div 
              className="dashboard-card" 
              style={{ padding: '25px', minHeight: '300px' }}
            >
              <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                Products
              </h3>
              <div 
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '180px', cursor: 'pointer', padding: '10px', borderRadius: '8px', transition: 'background-color 0.2s' }}
                className="clickable-stat"
                onClick={() => navigate("/product-management")}
              >
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px' }}>Total Products</div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalProducts}</div>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#8b5cf6', animation: 'pulse 2s ease-in-out infinite' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Quick Actions */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="dashboard-card" style={{ padding: '25px', height: '100%' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="dashboard-btn dashboard-btn-primary" 
                style={{ padding: '15px', fontSize: '0.95rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => navigate("/customer-management")}
              >
                <span>Customer Management</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
              <button 
                className="dashboard-btn dashboard-btn-primary" 
                style={{ padding: '15px', fontSize: '0.95rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => navigate("/vendor-management")}
              >
                <span>Vendor Management</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
              <button 
                className="dashboard-btn dashboard-btn-primary" 
                style={{ padding: '15px', fontSize: '0.95rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => navigate("/product-management")}
              >
                <span>Product Management</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
              <button 
                className="dashboard-btn dashboard-btn-primary" 
                style={{ padding: '15px', fontSize: '0.95rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => navigate("/sales-dashboard")}
              >
                <span>Sales Dashboard</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>System Overview</h4>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                Monitor and manage all aspects of your business from this central dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
