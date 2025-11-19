import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
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
    <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Cart Info */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Shopping Cart
          </h3>
          
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛒</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '5px' }}>
              {cartItemCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>
              {cartItemCount === 1 ? 'item' : 'items'} in cart
            </div>
            <button
              className="dashboard-btn dashboard-btn-primary"
              style={{ width: '100%', marginBottom: '10px' }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
            {cartItemCount > 0 && (
              <button
                className="dashboard-btn dashboard-btn-success"
                style={{ width: '100%' }}
                onClick={() => navigate("/cart")}
              >
                View Cart
              </button>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>
              Quick Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', lineHeight: '1.4' }}>
              Browse our featured products and add items to your cart to start shopping!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span className="breadcrumb-current">Dashboard</span>
          </div>

          <h2 className="dashboard-title">Your Orders</h2>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.3 }}>📦</div>
              <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '20px' }}>You have no orders yet.</p>
              <button
                className="dashboard-btn dashboard-btn-primary"
                onClick={() => navigate("/products")}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '5px', fontWeight: '500' }}>Total Orders</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>{orders.length}</div>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '5px', fontWeight: '500' }}>Total Spent</div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>${totalSpent.toFixed(2)}</div>
                </div>
              </div>

              <div className="dashboard-grid">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="dashboard-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: '0 0 5px 0' }}>
                          Order #{order.orderID}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669' }}>
                          ${order.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {order.itemsCount && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '10px' }}>
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {orders.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Showing {recentOrders.length} of {orders.length} orders
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Profile & Settings */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#eff6ff', 
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '3px solid #bfdbfe'
            }}>
              👤
            </div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', fontWeight: '700', color: '#111827' }}>
              Hello, {user?.firstName || 'Guest'}!
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
              Welcome back
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              Account Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Name</div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Email</div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937', wordBreak: 'break-word' }}>
                  {user?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="dashboard-btn dashboard-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
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
