import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import "../../Styles/modal.css";

export default function VendorDetailModal({ vendor, onClose, onEdit, onToggleStatus, onGenerateToken }) {
  const navigate = useNavigate();
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendorDetails() {
      try {
        const response = await Api.get(`/api/dashboard/vendor/${vendor.vendorID}`);
        const invoices = response.recentInvoices?.slice(0, 5) || [];
        setRecentInvoices(invoices);
      } catch (err) {
        console.error("Failed to load vendor details:", err);
        setRecentInvoices([]);
      } finally {
        setLoading(false);
      }
    }

    if (vendor) {
      loadVendorDetails();
    }
  }, [vendor]);

  const money = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vendor-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header vendor-modal-header">
          <h2 className="customer-modal-title">
            {vendor.vendorName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body vendor-modal-body">
          {/* Vendor Information Section */}
          <div className="vendor-section">
            <h3 className="vendor-section-title">
              Vendor Information
            </h3>
            <div className="vendor-info-grid">
              <div className="vendor-info-item">
                <div className="vendor-info-label">
                  Status:
                </div>
                <span className={vendor.isActive ? "status-active" : "status-inactive"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="vendor-info-item">
                <div className="vendor-info-label">
                  Business Name:
                </div>
                <div className="vendor-info-value">
                  {vendor.vendorName}
                </div>
              </div>
              <div className="vendor-info-item">
                <div className="vendor-info-label">
                  Contact Person:
                </div>
                <div className="vendor-info-value">
                  {vendor.vendorContactFName} {vendor.vendorContactLName}
                </div>
              </div>
              <div className="vendor-info-item">
                <div className="vendor-info-label">
                  Phone:
                </div>
                <div className="vendor-info-value">
                  {vendor.vendorPhone || "Not provided"}
                </div>
              </div>
              {vendor.vendorEmail && (
                <div className="vendor-info-item">
                  <div className="vendor-info-label">
                    Email:
                  </div>
                  <div className="vendor-info-value">
                    {vendor.vendorEmail}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="vendor-section">
            <h3 className="vendor-section-title">
              Address
            </h3>
            <div className="vendor-address-text">
              <div>{vendor.vendorAddress1 || "No address provided"}</div>
              {vendor.vendorAddress2 && <div>{vendor.vendorAddress2}</div>}
              <div>{vendor.vendorCity}, {vendor.vendorState} {vendor.vendorZipCode}</div>
            </div>
          </div>

          {/* Recent Invoices Section */}
          <div className="vendor-section-last">
            <h3 className="vendor-section-title">
              Recent Invoices
            </h3>
            {loading ? (
              <div className="vendor-loading-container">
                <LoadingSpinner />
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="vendor-no-invoices">
                No recent invoices found.
              </div>
            ) : (
              <>
                <div className="vendor-invoices-container">
                  {recentInvoices.map((inv) => {
                    const amountDue = (inv.invoiceTotal || 0) - (inv.paymentTotal || 0) - (inv.creditTotal || 0);
                    const isPaid = amountDue <= 0;
                    
                    return (
                      <div 
                        key={inv.invoiceID} 
                        className="vendor-invoice-item"
                      >
                        <div className="vendor-invoice-info">
                          <div className="vendor-invoice-number">
                            Invoice #{inv.invoiceNumber || 'N/A'}
                          </div>
                          <div className="vendor-invoice-date">
                            {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : 'No date'}
                          </div>
                        </div>
                        <div className="vendor-invoice-amounts">
                          <div className="vendor-invoice-total">
                            ${money(inv.invoiceTotal || 0)}
                          </div>
                          <span className={isPaid ? "status-active vendor-invoice-status" : "status-inactive vendor-invoice-status"}>
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="dashboard-btn vendor-view-all-btn"
                  onClick={() => {
                    navigate("/vendor-invoices", {
                      state: { vendorId: vendor.vendorID, vendorName: vendor.vendorName },
                    });
                    onClose();
                  }}
                >
                  View All Invoices
                </button>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer vendor-modal-footer">
          <button className="dashboard-btn vendor-footer-btn" onClick={onEdit}>
            Edit Vendor
          </button>
          {vendor.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-danger vendor-footer-btn"
              onClick={() => onToggleStatus(vendor.vendorID, false)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success vendor-footer-btn"
              onClick={() => onToggleStatus(vendor.vendorID, true)}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-info vendor-footer-btn" 
            onClick={() => onGenerateToken(vendor.vendorID)}
          >
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}
