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
        const response = await Api.get(`/api/dashboard/vendor/${vendor.vendorID}`);
        console.log("Vendor dashboard response:", response);
        console.log("Recent invoices array:", response.recentInvoices);
        const invoices = response.recentInvoices?.slice(0, 5) || [];
        console.log("Setting recentInvoices to:", invoices);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
            {vendor.vendorName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '20px 0' }}>
          {/* Vendor Information Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Vendor Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Vendor ID:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                  #{vendor.vendorID}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Status:
                </div>
                <span className={vendor.isActive ? "status-active" : "status-inactive"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Contact Name:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                  {vendor.vendorContactFName} {vendor.vendorContactLName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                  Phone:
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                  {vendor.vendorPhone || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Address
            </h3>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#1f2937' }}>
              <div>{vendor.vendorAddress1 || "No address provided"}</div>
              {vendor.vendorAddress2 && <div>{vendor.vendorAddress2}</div>}
              <div>{vendor.vendorCity}, {vendor.vendorState} {vendor.vendorZipCode}</div>
            </div>
          </div>

          {/* Recent Invoices Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Recent Invoices
            </h3>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : recentInvoices.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                No recent invoices found.
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentInvoices.map((inv) => {
                    console.log("Invoice item:", inv);
                    const amountDue = (inv.invoiceTotal || 0) - (inv.paymentTotal || 0) - (inv.creditTotal || 0);
                    const isPaid = amountDue <= 0;
                    
                    return (
                      <div 
                        key={inv.invoiceID} 
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
                            Invoice #{inv.invoiceNumber || 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                            {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : 'No date'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                            ${money(inv.invoiceTotal || 0)}
                          </div>
                          <span className={isPaid ? "status-active" : "status-inactive"} style={{ fontSize: '0.75rem' }}>
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="dashboard-btn"
                  style={{ marginTop: '15px', width: '100%' }}
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

        <div className="modal-footer" style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '2px solid #e5e7eb' }}>
          <button className="dashboard-btn" onClick={onEdit} style={{ flex: 1 }}>
            Edit Vendor
          </button>
          {vendor.isActive ? (
            <button
              className="dashboard-btn dashboard-btn-danger"
              onClick={() => onToggleStatus(vendor.vendorID, false)}
              style={{ flex: 1 }}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="dashboard-btn dashboard-btn-success"
              onClick={() => onToggleStatus(vendor.vendorID, true)}
              style={{ flex: 1 }}
            >
              Activate
            </button>
          )}
          <button 
            className="dashboard-btn dashboard-btn-info" 
            onClick={() => onGenerateToken(vendor.vendorID)}
            style={{ flex: 1 }}
          >
            Generate Token
          </button>
        </div>
      </div>
    </div>
  );
}
