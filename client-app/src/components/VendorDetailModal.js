import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import "../Styles/modal.css";

export default function VendorDetailModal({ vendor, onClose, onEdit, onToggleStatus, onGenerateToken }) {
  const navigate = useNavigate();
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendorDetails() {
      try {
        const data = await Api.get(`/api/dashboard/vendor/${vendor.vendorID}`);
        setRecentInvoices(data.recentInvoices?.slice(0, 5) || []);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{vendor.vendorName}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Vendor Information */}
          <div className="modal-section">
            <h3>Vendor Information</h3>
            <div className="info-grid">
              <div>
                <label>Status</label>
                <span className={vendor.isActive ? "badge-paid" : "badge-unpaid"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <label>Vendor ID</label>
                <p>{vendor.vendorID}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="modal-section">
            <h3>Address</h3>
            <div className="info-grid">
              <div>
                <label>Street Address</label>
                <p>{vendor.vendorAddress1 || "N/A"}</p>
                {vendor.vendorAddress2 && <p>{vendor.vendorAddress2}</p>}
              </div>
              <div>
                <label>City, State ZIP</label>
                <p>
                  {vendor.vendorCity}, {vendor.vendorState} {vendor.vendorZipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="modal-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              <div>
                <label>Contact Name</label>
                <p>
                  {vendor.vendorContactFName} {vendor.vendorContactLName}
                </p>
              </div>
              <div>
                <label>Phone</label>
                <p>{vendor.vendorPhone || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="modal-section">
            <h3>Recent Invoices</h3>
            {loading ? (
              <LoadingSpinner />
            ) : recentInvoices.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No recent invoices found.</p>
            ) : (
              <div className="invoice-list">
                {recentInvoices.map((inv) => (
                  <div key={inv.InvoiceID} className="invoice-item">
                    <div>
                      <strong>Invoice #{inv.InvoiceNumber}</strong>
                      <br />
                      <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        {new Date(inv.InvoiceDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong>${money(inv.InvoiceTotal)}</strong>
                      <br />
                      <span
                        className={
                          inv.InvoiceStatus === "Paid" ? "badge-paid" : "badge-unpaid"
                        }
                        style={{ fontSize: "0.75rem" }}
                      >
                        {inv.InvoiceStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentInvoices.length > 0 && (
              <button
                className="dashboard-btn"
                style={{ marginTop: "15px", width: "100%" }}
                onClick={() => {
                  navigate("/vendor-invoices", {
                    state: { vendorId: vendor.vendorID, vendorName: vendor.vendorName },
                  });
                  onClose();
                }}
              >
                View All Invoices
              </button>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="dashboard-btn" onClick={onEdit}>
            Edit Vendor
          </button>
          {vendor.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-danger"
              onClick={() => onToggleStatus(vendor.vendorID, false)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success"
              onClick={() => onToggleStatus(vendor.vendorID, true)}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-info" 
            onClick={() => onGenerateToken(vendor.vendorID)}
          >
            Generate Token
          </button>
          <button className="dashboard-btn dashboard-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
