import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import "../Styles/modal.css";

export default function CustomerDetailModal({ customer, onClose, onEdit, onToggleStatus, onDelete }) {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerDetails() {
      try {
        const data = await Api.get(`/api/dashboard/customer/${customer.customerID}`);
        setRecentOrders(data.orders?.slice(0, 5) || []);
      } catch (err) {
        console.error("Failed to load customer details:", err);
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    }

    if (customer) {
      loadCustomerDetails();
    }
  }, [customer]);

  const money = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
            {customer.firstName} {customer.lastName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '20px 0' }}>
          {/* Customer Information Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Customer Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Customer ID:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                  #{customer.customerID}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Status:
                </div>
                <span className={customer.isActive ? "status-active" : "status-inactive"}>
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Full Name:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                  {customer.firstName} {customer.lastName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Email Address:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#2563eb', wordBreak: 'break-all' }}>
                  {customer.emailAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Order History
            </h3>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : recentOrders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                No orders found for this customer.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentOrders.map((order) => (
                    <div 
                      key={order.orderID} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>
                          Order #{order.orderID}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>
                        ${money(order.orderTotal)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                  Showing {recentOrders.length} most recent order{recentOrders.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '2px solid #e5e7eb' }}>
          <button className="dashboard-btn" onClick={onEdit} style={{ flex: 1 }}>
            Edit Customer
          </button>
          {customer.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-warning"
              onClick={() => onToggleStatus(customer.customerID, false)}
              style={{ flex: 1 }}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success"
              onClick={() => onToggleStatus(customer.customerID, true)}
              style={{ flex: 1 }}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-danger" 
            onClick={() => onDelete(customer.customerID)}
            style={{ flex: 1 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
