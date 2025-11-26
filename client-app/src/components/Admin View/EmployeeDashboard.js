import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import "../../Styles/Dashboard.css";

// Cache configuration outside component to avoid recreating on every render
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "adminDashboardCache";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingSection, setRefreshingSection] = useState(null);

  // Memoize user to prevent it from changing on every render
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  const loadDashboard = useCallback(async (forceRefresh = false, section = null) => {
    try {
      if (!user || user.role !== "admin") {
        setError("Unauthorized access. Admins only.");
        setLoading(false);
        return;
      }

      if (section) {
        setRefreshingSection(section);
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION) {
            setStats(data);
            setLoading(false);
            setRefreshingSection(null);
            return;
          }
        }
      }

      const data = await fetchData("dashboard/admin");

      const statsData = {
        totalCustomers: data.totalCustomers,
        activeCustomers: data.activeCustomers,
        totalVendors: data.totalVendors,
        activeVendors: data.activeVendors,
        totalProducts: data.totalProducts,
        totalSales: data.totalSales,
        totalOutstandingInvoices: data.totalOutstandingInvoices,
      };

      setStats(statsData);

      // Cache the data with timestamp
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: statsData,
        timestamp: Date.now()
      }));

    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshingSection(null);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Memoize chart data - only recalculate when stats change
  const customerData = useMemo(() => {
    if (!stats) return [];
    const active = stats.activeCustomers || 0;
    const inactive = Math.max((stats.totalCustomers || 0) - active, 0);
    return [
      { name: 'Active', value: active, color: '#10b981' },
      { name: 'Inactive', value: inactive, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stats]);

  const vendorData = useMemo(() => {
    if (!stats) return [];
    const active = stats.activeVendors || 0;
    const inactive = Math.max((stats.totalVendors || 0) - active, 0);
    return [
      { name: 'Active', value: active, color: '#3b82f6' },
      { name: 'Inactive', value: inactive, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  }, [stats]);

  const salesData = useMemo(() => {
    if (!stats) return [];
    const totalSales = stats.totalSales || 0;
    const outstanding = stats.totalOutstandingInvoices || 0;
    const paid = Math.max(totalSales - outstanding, 0);
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Outstanding', value: outstanding, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="employee-dashboard-layout">
      {/* Left Panel - Employee Information - Outside main container */}
      <div className="employee-sidebar">
        <div className="dashboard-card employee-info-card">
          <h3 className="employee-info-title">
            Employee Information
          </h3>
          
          <div className="employee-profile-section">
            <div className="employee-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="employee-name">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="employee-role">
              {user?.role || 'Administrator'}
            </div>
          </div>

          <div className="employee-details">
            <div>
              <div className="employee-detail-label">First Name</div>
              <div className="employee-detail-value">{user?.firstName || 'N/A'}</div>
            </div>
            <div>
              <div className="employee-detail-label">Last Name</div>
              <div className="employee-detail-value">{user?.lastName || 'N/A'}</div>
            </div>
            <div>
              <div className="employee-detail-label">Email</div>
              <div className="employee-detail-value break-word">{user?.emailAddress || 'N/A'}</div>
            </div>
          </div>

          <div className="employee-tip-box">
            <h4 className="employee-tip-title">Quick Tip</h4>
            <p className="employee-tip-text">
              Click on individual metrics to navigate directly to filtered views.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="employee-main-content">
        <div className="dashboard-main-header">
          <h2 className="dashboard-main-title">Admin Dashboard</h2>
          <div className="dashboard-header-buttons">
            <button 
              className="dashboard-btn dashboard-btn-secondary dashboard-header-btn"
              onClick={() => {
                setLoading(true);
                loadDashboard(true);
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh All'}
            </button>
            <button 
              className="dashboard-btn dashboard-btn-primary dashboard-header-btn"
              onClick={() => navigate("/sales-dashboard")}
            >
              View Sales Dashboard
            </button>
          </div>
        </div>

        <div className="dashboard-sections-layout">
          {/* 4 Main Sections Grid */}
          <div className="dashboard-grid-sections">
            
            {/* Customers Section */}
            <div className="dashboard-card dashboard-section-card">
              <button
                onClick={() => loadDashboard(true, 'customers')}
                disabled={refreshingSection === 'customers'}
                className={`section-refresh-btn ${refreshingSection === 'customers' ? 'refreshing' : ''}`}
              >
                {refreshingSection === 'customers' ? '...' : '↻'}
              </button>
              <h3 className="dashboard-section-title">
                Customers
              </h3>
              
              {/* Chart on top */}
              <div className="dashboard-chart-container">
                {customerData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                ) : (
                  <div className="dashboard-no-data">
                    No customer data available
                  </div>
                )}
              </div>

              {/* Stats side by side below chart */}
              <div className="dashboard-stats-row">
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/customer-management")}
                >
                  <div className="dashboard-stat-label">Total</div>
                  <div className="dashboard-stat-value">{stats.totalCustomers}</div>
                </div>
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/customer-management")}
                >
                  <div className="dashboard-stat-label">Active</div>
                  <div className="dashboard-stat-value green">{stats.activeCustomers}</div>
                </div>
              </div>
            </div>

            {/* Vendors Section */}
            <div className="dashboard-card dashboard-section-card">
              <button
                onClick={() => loadDashboard(true, 'vendors')}
                disabled={refreshingSection === 'vendors'}
                className={`section-refresh-btn ${refreshingSection === 'vendors' ? 'refreshing' : ''}`}
              >
                {refreshingSection === 'vendors' ? '...' : '↻'}
              </button>
              <h3 className="dashboard-section-title">
                Vendors
              </h3>
              
              {/* Chart on top */}
              <div className="dashboard-chart-container">
                {vendorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={vendorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                ) : (
                  <div className="dashboard-no-data">
                    No vendor data available
                  </div>
                )}
              </div>

              {/* Stats side by side below chart */}
              <div className="dashboard-stats-row">
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/vendor-management")}
                >
                  <div className="dashboard-stat-label">Total</div>
                  <div className="dashboard-stat-value">{stats.totalVendors}</div>
                </div>
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/vendor-management")}
                >
                  <div className="dashboard-stat-label">Active</div>
                  <div className="dashboard-stat-value blue">{stats.activeVendors}</div>
                </div>
              </div>
            </div>

            {/* Sales Section */}
            <div className="dashboard-card dashboard-section-card">
              <button
                onClick={() => loadDashboard(true, 'sales')}
                disabled={refreshingSection === 'sales'}
                className={`section-refresh-btn ${refreshingSection === 'sales' ? 'refreshing' : ''}`}
              >
                {refreshingSection === 'sales' ? '...' : '↻'}
              </button>
              <h3 className="dashboard-section-title">
                Sales & Invoices
              </h3>
              
              {/* Chart on top */}
              <div className="dashboard-chart-container">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                ) : (
                  <div className="dashboard-no-data">
                    No sales data available
                  </div>
                )}
              </div>

              {/* Stats side by side below chart */}
              <div className="dashboard-stats-row">
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/sales-dashboard")}
                >
                  <div className="dashboard-stat-label">Total Sales</div>
                  <div className="dashboard-stat-value large">${stats.totalSales.toFixed(2)}</div>
                </div>
                <div 
                  className="dashboard-stat-item clickable-stat"
                  onClick={() => navigate("/sales-dashboard", { state: { filter: 'unpaid' } })}
                >
                  <div className="dashboard-stat-label">Outstanding</div>
                  <div className="dashboard-stat-value large red">${stats.totalOutstandingInvoices.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="dashboard-card dashboard-section-card products-section">
              <button
                onClick={() => loadDashboard(true, 'products')}
                disabled={refreshingSection === 'products'}
                className={`section-refresh-btn ${refreshingSection === 'products' ? 'refreshing' : ''}`}
              >
                {refreshingSection === 'products' ? '...' : '↻'}
              </button>
              <h3 className="dashboard-section-title">
                Products
              </h3>
              
              <div 
                className="products-display-container clickable-stat"
                onClick={() => navigate("/product-management")}
              >
                <div className="products-count-section">
                  <div className="products-count-label">Total Products</div>
                  <div className="products-count-value">{stats.totalProducts}</div>
                </div>
                <div className="products-progress-bar">
                  <div className="products-progress-fill"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Quick Actions */}
          <div className="quick-actions-panel">
            <div className="dashboard-card quick-actions-card">
              <h3 className="quick-actions-title">
                Quick Actions
              </h3>
              <div className="quick-actions-buttons">
                <button 
                  className="dashboard-btn dashboard-btn-primary quick-action-btn"
                  onClick={() => navigate("/customer-management")}
                >
                  <span>Customer Management</span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button 
                  className="dashboard-btn dashboard-btn-primary quick-action-btn"
                  onClick={() => navigate("/vendor-management")}
                >
                  <span>Vendor Management</span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button 
                  className="dashboard-btn dashboard-btn-primary quick-action-btn"
                  onClick={() => navigate("/product-management")}
                >
                  <span>Product Management</span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button 
                  className="dashboard-btn dashboard-btn-primary quick-action-btn"
                  onClick={() => navigate("/sales-dashboard")}
                >
                  <span>Sales Dashboard</span>
                  <span className="quick-action-arrow">→</span>
                </button>
              </div>

              <div className="system-overview-box">
                <h4 className="system-overview-title">System Overview</h4>
                <p className="system-overview-text">
                  Monitor and manage all aspects of your business from this central dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
