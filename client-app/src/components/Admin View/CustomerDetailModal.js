import React, { useEffect, useState } from "react";
import Api from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import "../../Styles/modal.css";

export default function CustomerDetailModal({ customer, onClose, onEdit, onToggleStatus, onDelete }) {
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
      <div className="modal-content customer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header customer-modal-header">
          <h2 className="customer-modal-title">
            {customer.firstName} {customer.lastName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body customer-modal-body">
          {/* Customer Information Section */}
          <div className="customer-section">
            <h3 className="customer-section-title">
              Customer Information
            </h3>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <div className="customer-info-label">
                  Status:
                </div>
                <span className={customer.isActive ? "status-active" : "status-inactive"}>
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="customer-info-item">
                <div className="customer-info-label">
                  Full Name:
                </div>
                <div className="customer-info-value">
                  {customer.firstName} {customer.lastName}
                </div>
              </div>
              <div className="customer-info-item">
                <div className="customer-info-label">
                  Email Address:
                </div>
                <div className="customer-info-email">
                  {customer.emailAddress}
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="customer-section">
            <h3 className="customer-section-title">
              Addresses
            </h3>
            <div className="customer-addresses-container">
              <div className="customer-address-box">
                <div className="customer-address-type">Billing Address</div>
                {customer.billingAddressID ? (
                  <div className="customer-address-content">
                    {customer.billingAddress || 'Address details not available'}
                  </div>
                ) : (
                  <div className="customer-no-address">No billing address on file</div>
                )}
              </div>
              <div className="customer-address-box">
                <div className="customer-address-type">Shipping Address</div>
                {customer.shippingAddressID ? (
                  <div className="customer-address-content">
                    {customer.shippingAddress || 'Address details not available'}
                  </div>
                ) : (
                  <div className="customer-no-address">No shipping address on file</div>
                )}
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div className="customer-section-last">
            <h3 className="customer-section-title">
              Order History
            </h3>
            {loading ? (
              <div className="customer-loading-container">
                <LoadingSpinner />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="customer-no-orders">
                No orders found for this customer.
              </div>
            ) : (
              <>
                <div className="customer-orders-container">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.orderID} 
                      className="customer-order-item"
                    >
                      <div className="customer-order-info">
                        <div className="customer-order-id">
                          Order #{order.orderID}
                        </div>
                        <div className="customer-order-details">
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="customer-order-total">
                        ${money(order.orderTotal)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="customer-orders-summary">
                  Showing {recentOrders.length} most recent order{recentOrders.length !== 1 ? 's' : ''}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer customer-modal-footer">
          <button className="dashboard-btn customer-footer-btn" onClick={onEdit}>
            Edit Customer
          </button>
          {customer.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-warning customer-footer-btn"
              onClick={() => onToggleStatus(customer.customerID, false)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success customer-footer-btn"
              onClick={() => onToggleStatus(customer.customerID, true)}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-danger customer-footer-btn" 
            onClick={() => onDelete(customer.customerID)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
