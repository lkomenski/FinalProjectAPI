import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchData } from "../Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import "../Styles/Dashboard.css";  

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // get logged in user info
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const customerId = user?.id;

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!customerId) {
          setError("No logged-in customer.");
          return;
        }

        const data = await fetchData(`dashboard/customer/${customerId}`);
        setOrders(data.orders || []);
        
        // Load cart info (simulated for now - you can implement actual cart API)
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItemCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [customerId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="dashboard-main-layout">
      {/* Left Panel - Cart Info */}
      <div className="dashboard-sidebar-customer">
        <div className="dashboard-card business-info-card">
          <h3 className="business-info-title">
            Shopping Cart
          </h3>
          
          <div className="business-avatar-section">
            <div className="customer-icon-large">🛒</div>
            <div className="customer-cart-count">
              {cartItemCount}
            </div>
            <div className="customer-cart-text">
              {cartItemCount === 1 ? 'item' : 'items'} in cart
            </div>
            <button
              className="dashboard-btn dashboard-btn-primary dashboard-btn-full-width customer-btn-margin"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
            {cartItemCount > 0 && (
              <button
                className="dashboard-btn dashboard-btn-success dashboard-btn-full-width"
                onClick={() => navigate("/cart")}
              >
                View Cart
              </button>
            )}
          </div>

          <div className="dashboard-tip-box">
            <h4 className="dashboard-tip-title">
              Quick Tip
            </h4>
            <p className="dashboard-tip-text">
              Browse our featured products and add items to your cart to start shopping!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main-content">
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span className="breadcrumb-current">Dashboard</span>
          </div>

          <h2 className="dashboard-title">Your Orders</h2>

          {orders.length === 0 ? (
            <div className="customer-orders-center">
              <div className="customer-orders-icon">📦</div>
              <p className="customer-orders-text">You have no orders yet.</p>
              <button
                className="dashboard-btn dashboard-btn-primary"
                onClick={() => navigate("/products")}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="customer-orders-stats">
                <div className="customer-orders-stat-card">
                  <div className="customer-stat-label">Total Orders</div>
                  <div className="customer-stat-value">{orders.length}</div>
                </div>
                <div className="customer-stat-card-total">
                  <div className="customer-stat-label">Total Spent</div>
                  <div className="customer-stat-value">${totalSpent.toFixed(2)}</div>
                </div>
              </div>

              <div className="dashboard-grid">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="dashboard-card">
                    <div className="order-card-header">
                      <div>
                        <h3 className="order-card-title">
                          Order #{order.orderID}
                        </h3>
                        <p className="order-card-date">
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="order-card-amount-section">
                        <div className="order-card-amount">
                          ${order.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {order.itemsCount && (
                      <div className="order-card-items">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {orders.length > 5 && (
                <div className="orders-pagination-info">
                  <p className="pagination-text">
                    Showing {recentOrders.length} of {orders.length} orders
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Profile & Settings */}
      <div className="customer-profile-panel">
        <div className="dashboard-card customer-profile-card">
          <div className="customer-profile-header">
            <div className="customer-profile-avatar">
              👤
            </div>
            <h3 className="customer-profile-name">
              Hello, {user?.firstName || 'Guest'}!
            </h3>
            <p className="customer-profile-welcome">
              Welcome back
            </p>
          </div>

          <div className="customer-account-info">
            <h4 className="customer-account-title">
              Account Information
            </h4>
            <div className="customer-info-fields">
              <div>
                <div className="customer-field-label">Name</div>
                <div className="customer-field-value">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div>
                <div className="customer-field-label">Email</div>
                <div className="customer-field-value customer-field-email">
                  {user?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          <div className="customer-actions">
            <button
              className="dashboard-btn dashboard-btn-primary dashboard-btn-full-width"
              onClick={() => navigate("/customer-profile")}
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
