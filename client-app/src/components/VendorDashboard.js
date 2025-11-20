import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import InvoiceDetailModal from "./InvoiceDetailModal";
import "../Styles/Dashboard.css";
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
  }, [vendorId]);

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
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999 
        }}>
          <LoadingSpinner />
        </div>
      )}

      <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Business Info */}
      <div style={{ width: '280px', flexShrink: 0, marginTop: '96px' }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Business Information
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                margin: '0 auto 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '3px solid #bfdbfe'
              }}>
                🏢
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '5px' }}>
                {vendorInfo?.vendorName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                {vendorInfo?.vendorCity}, {vendorInfo?.vendorState}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Main Contact</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo?.vendorContactFName} {vendorInfo?.vendorContactLName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Address</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo?.vendorAddress1 || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Phone</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo?.vendorPhone}
              </div>
            </div>
            {vendorInfo?.termsDescription && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Terms</div>
                <div style={{ fontSize: '0.85rem', color: '#1f2937', lineHeight: '1.4' }}>
                  {vendorInfo.termsDescription}
                </div>
              </div>
            )}
          </div>

          <button
            className="dashboard-btn dashboard-btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate("/vendor-account")}
          >
            View Full Account Info
          </button>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>
              Quick Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', lineHeight: '1.4' }}>
              Click on invoice cards to view detailed information and payment history.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
            <span className="breadcrumb-current">Dashboard</span>
          </div>

          <h2 className="dashboard-title" style={{ marginBottom: '30px' }}>Vendor Dashboard</h2>

          {/* Invoice Summary Cards */}
          <h3 className="dashboard-subtitle">Invoice Summary</h3>

          <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
            <div 
              style={{ flex: 1, cursor: 'pointer', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', transition: 'transform 0.2s' }}
              className="clickable-stat"
              onClick={() => navigate("/vendor-invoices")}
            >
              <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '5px', fontWeight: '500' }}>Total Invoices</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>{summary?.TotalInvoices}</div>
            </div>
            <div 
              style={{ flex: 1, cursor: 'pointer', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d', transition: 'transform 0.2s' }}
              className="clickable-stat"
              onClick={() => navigate("/vendor-invoices", { state: { filter: 'unpaid' } })}
            >
              <div style={{ fontSize: '0.85rem', color: '#d97706', marginBottom: '5px', fontWeight: '500' }}>Total Outstanding</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d97706' }}>${money(summary?.TotalOutstanding)}</div>
            </div>
            <div 
              style={{ flex: 1, cursor: 'pointer', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', transition: 'transform 0.2s' }}
              className="clickable-stat"
              onClick={() => navigate("/vendor-invoices", { state: { filter: 'paid' } })}
            >
              <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '5px', fontWeight: '500' }}>Total Paid</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>${money(summary?.TotalPaid)}</div>
            </div>
          </div>

          {/* Recent Invoices */}
          <h3 className="dashboard-subtitle">Recent Invoices</h3>

          {recentInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.3 }}>📄</div>
              <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '20px' }}>No recent invoices found.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-grid">
                {recentInvoices.slice(0, showCount).map((inv) => (
                  <div
                    key={inv.invoiceID}
                    className="dashboard-card"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: '0 0 5px 0' }}>
                          Invoice #{inv.invoiceNumber}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                          {new Date(inv.invoiceDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669' }}>
                          ${money(inv.invoiceTotal)}
                        </div>
                      </div>
                    </div>

                    {inv.invoiceStatus && (
                      <span
                        className={
                          inv.invoiceStatus === "Paid"
                            ? "badge badge-paid"
                            : inv.invoiceStatus === "Unpaid"
                            ? "badge badge-unpaid"
                            : "badge badge-none"
                        }
                        style={{ marginTop: '10px' }}
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
                  className="dashboard-btn dashboard-btn-secondary"
                  onClick={() => setShowCount((prev) => prev + 5)}
                  style={{ marginTop: '20px' }}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Quick Actions */}
      <div style={{ width: '280px', flexShrink: 0, marginTop: '96px' }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            User Information
          </h3>

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
              Hello, {user?.firstName || 'Vendor'}!
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

          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
            Quick Actions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="dashboard-btn dashboard-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate("/vendor-invoices")}
            >
              All Invoices
            </button>
            <button
              className="dashboard-btn dashboard-btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
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
