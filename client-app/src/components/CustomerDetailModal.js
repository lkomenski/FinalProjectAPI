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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{customer.firstName} {customer.lastName}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Customer Information */}
          <div className="modal-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div>
                <label>Customer ID</label>
                <p>{customer.customerID}</p>
              </div>
              <div>
                <label>Status</label>
                <span className={customer.isActive ? "badge-paid" : "badge-unpaid"}>
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="modal-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              <div>
                <label>Name</label>
                <p>{customer.firstName} {customer.lastName}</p>
              </div>
              <div>
                <label>Email Address</label>
                <p>{customer.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="modal-section">
            <h3>Order History</h3>
            {loading ? (
              <LoadingSpinner />
            ) : recentOrders.length === 0 ? (
              <p style={{ color: "#6b7280", fontStyle: "italic", padding: "20px 0" }}>
                No orders found for this customer.
              </p>
            ) : (
              <>
                <div className="invoice-list">
                  {recentOrders.map((order) => (
                    <div key={order.orderID} className="invoice-item">
                      <div>
                        <strong>Order #{order.orderID}</strong>
                        <br />
                        <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "1.1rem", color: "#059669" }}>
                          ${money(order.orderTotal)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    Showing {recentOrders.length} most recent order{recentOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="dashboard-btn" onClick={onEdit}>
            Edit Customer
          </button>
          {customer.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-warning"
              onClick={() => onToggleStatus(customer.customerID, false)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success"
              onClick={() => onToggleStatus(customer.customerID, true)}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-danger" 
            onClick={() => onDelete(customer.customerID)}
          >
            Delete
          </button>
          <button className="dashboard-btn dashboard-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
