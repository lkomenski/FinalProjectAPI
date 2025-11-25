import React, { useEffect, useState } from "react";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import InvoiceDetailModal from "../Admin View/InvoiceDetailModal";
import "../../Styles/Dashboard.css";
import "../../Styles/VendorDashboard.css";
import { useNavigate } from "react-router-dom";

export default function VendorDashboard() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCount, setShowCount] = useState(8); // for "Show More"
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const vendorId = user?.id;

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);

        // Vendor information
        setVendorInfo(data.vendor);

        // Summary with safety defaults
        setSummary({
          TotalInvoices: data.invoiceSummary?.totalInvoices ?? 0,
          TotalOutstanding: data.invoiceSummary?.totalOutstanding ?? 0,
          TotalPaid: data.invoiceSummary?.totalPaid ?? 0,
        });

        // Recent invoices list
        setRecentInvoices(data.recentInvoices || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Safely format money
  const money = (num) =>
    typeof num === "number" ? num.toFixed(2) : "0.00";

  // Handle clicking on an invoice to show details
  const handleInvoiceClick = async (invoiceId) => {
    setLoadingInvoice(true);
    try {
      const data = await fetchData(`invoices/${invoiceId}`);
      setSelectedInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice details:", err);
      alert("Failed to load invoice details. Please try again.");
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <>
      {selectedInvoice && (
        <InvoiceDetailModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
      
      {loadingInvoice && (
        <div className="vendor-loading-overlay">
          <LoadingSpinner />
        </div>
      )}

      <div className="vendor-main-layout">
      {/* Left Panel - Business Info */}
      <div className="vendor-left-panel">
        <div className="dashboard-card vendor-left-panel-card">
          <h3 className="vendor-business-info-title">
            Business Information
          </h3>
          
          <div className="vendor-business-info-section">
            <div className="vendor-business-avatar-section">
              <div className="vendor-business-avatar">
                🏢
              </div>
              <div className="vendor-business-name">
                {vendorInfo?.vendorName}
              </div>
              <div className="vendor-business-location">
                {vendorInfo?.vendorCity}, {vendorInfo?.vendorState}
              </div>
            </div>
          </div>

          <div className="vendor-contact-details">
            <div>
              <div className="vendor-detail-label">Main Contact</div>
              <div className="vendor-detail-value">
                {vendorInfo?.vendorContactFName} {vendorInfo?.vendorContactLName}
              </div>
            </div>
            <div>
              <div className="vendor-detail-label">Address</div>
              <div className="vendor-detail-value">
                {vendorInfo?.vendorAddress1 || 'N/A'}
              </div>
            </div>
            <div>
              <div className="vendor-detail-label">Phone</div>
              <div className="vendor-detail-value">
                {vendorInfo?.vendorPhone}
              </div>
            </div>
            {vendorInfo?.termsDescription && (
              <div>
                <div className="vendor-detail-label">Terms</div>
                <div className="vendor-terms-value">
                  {vendorInfo.termsDescription}
                </div>
              </div>
            )}
          </div>

          <button
            className="dashboard-btn dashboard-btn-primary vendor-btn-full-width"
            onClick={() => navigate("/vendor-account")}
          >
            View Full Account Info
          </button>

          <div className="vendor-tip-box">
            <h4 className="vendor-tip-title">
              Quick Tip
            </h4>
            <p className="vendor-tip-text">
              Click on invoice cards to view detailed information and payment history.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="vendor-main-content">
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs vendor-breadcrumbs">
            <span className="breadcrumb-current">Dashboard</span>
          </div>

          <h2 className="dashboard-title vendor-title">Vendor Dashboard</h2>

          {/* Invoice Summary Cards */}
          <h3 className="dashboard-subtitle">Invoice Summary</h3>

          <div className="vendor-invoice-summary">
            <div 
              className="vendor-invoice-card-green clickable-stat"
              onClick={() => navigate("/vendor-invoices")}
            >
              <div className="vendor-invoice-label-green">Total Invoices</div>
              <div className="vendor-invoice-value-green">{summary?.TotalInvoices}</div>
            </div>
            <div 
              className="vendor-invoice-card-yellow clickable-stat"
              onClick={() => navigate("/vendor-invoices", { state: { filter: 'unpaid' } })}
            >
              <div className="vendor-invoice-label-yellow">Total Outstanding</div>
              <div className="vendor-invoice-value-yellow">${money(summary?.TotalOutstanding)}</div>
            </div>
            <div 
              className="vendor-invoice-card-blue clickable-stat"
              onClick={() => navigate("/vendor-invoices", { state: { filter: 'paid' } })}
            >
              <div className="vendor-invoice-label-blue">Total Paid</div>
              <div className="vendor-invoice-value-blue">${money(summary?.TotalPaid)}</div>
            </div>
          </div>

          {/* Recent Invoices */}
          <h3 className="dashboard-subtitle">Recent Invoices</h3>

          {recentInvoices.length === 0 ? (
            <div className="vendor-no-invoices">
              <div className="vendor-no-invoices-icon">📄</div>
              <p className="vendor-no-invoices-text">No recent invoices found.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-grid">
                {recentInvoices.slice(0, showCount).map((inv) => (
                  <div
                    key={inv.invoiceID}
                    className="dashboard-card vendor-invoice-clickable"
                    onClick={() => handleInvoiceClick(inv.invoiceID)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="vendor-invoice-header">
                      <div>
                        <h3 className="vendor-invoice-title">
                          Invoice #{inv.invoiceNumber}
                        </h3>
                        <p className="vendor-invoice-date">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="vendor-invoice-amount-section">
                        <div className="vendor-invoice-amount-value">
                          ${money(inv.invoiceTotal)}
                        </div>
                      </div>
                    </div>

                    {inv.invoiceStatus && (
                      <span
                        className={`${inv.invoiceStatus === "Paid"
                            ? "badge badge-paid"
                            : inv.invoiceStatus === "Unpaid"
                            ? "badge badge-unpaid"
                            : "badge badge-none"} vendor-badge-margin-top`}
                      >
                        {inv.invoiceStatus}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {showCount < recentInvoices.length && (
                <button
                  className="dashboard-btn dashboard-btn-secondary vendor-show-more-margin"
                  onClick={() => setShowCount((prev) => prev + 5)}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Quick Actions */}
      <div className="vendor-right-panel">
        <div className="dashboard-card vendor-right-panel-card">
          <h3 className="vendor-user-info-title">
            User Information
          </h3>

          <div className="vendor-account-info-section">
            <div className="vendor-account-avatar">
              👤
            </div>
            <h3 className="vendor-account-name">
              Hello, {user?.firstName || 'Vendor'}!
            </h3>
            <p className="vendor-account-location">
              Welcome back
            </p>
          </div>

          <div className="vendor-account-details-section">
            <h4 className="vendor-account-section-title">
              Account Information
            </h4>
            <div className="vendor-account-info-grid">
              <div>
                <div className="vendor-detail-label">Name</div>
                <div className="vendor-detail-value">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div>
                <div className="vendor-detail-label">Email</div>
                <div className="vendor-account-email-value">
                  {user?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          <h4 className="vendor-quick-actions-title">
            Quick Actions
          </h4>
          <div className="vendor-quick-actions-buttons">
            <button
              className="dashboard-btn dashboard-btn-primary vendor-btn-full-width vendor-btn-center"
              onClick={() => navigate("/vendor-invoices")}
            >
              All Invoices
            </button>
            <button
              className="dashboard-btn dashboard-btn-secondary vendor-btn-full-width vendor-btn-center"
              onClick={() => navigate("/vendor-account")}
            >
              Account Details
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
