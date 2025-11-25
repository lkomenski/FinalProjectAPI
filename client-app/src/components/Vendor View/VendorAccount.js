import React, { useEffect, useState } from "react";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import { useNavigate } from "react-router-dom";
import "../../Styles/Dashboard.css";

export default function VendorAccount() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const vendorId = user?.id;

  useEffect(() => {
    async function loadAccountInfo() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);
        setVendorInfo(data.vendor);

      } catch (err) {
        setError(err.message || "Failed to load vendor account info.");
      } finally {
        setLoading(false);
      }
    }

    loadAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!vendorInfo) return <ErrorMessage message="Vendor data unavailable." />;

  return (
    <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Business Summary */}
      <div style={{ width: '280px', flexShrink: 0, marginTop: '96px' }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Business Summary
          </h3>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '5px' }}>
              {vendorInfo.vendorName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Address</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo.vendorAddress1 || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Location</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo.vendorCity}, {vendorInfo.vendorState}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Phone</div>
              <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                {vendorInfo.vendorPhone || 'N/A'}
              </div>
            </div>
            {vendorInfo.dateUpdated && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>Last Updated</div>
                <div style={{ fontSize: '0.85rem', color: '#1f2937' }}>
                  {new Date(vendorInfo.dateUpdated).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>
              Account Status
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', lineHeight: '1.4' }}>
              All account information is up to date and verified.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
            <span className="breadcrumb-link" onClick={() => navigate('/vendor-dashboard')} style={{ cursor: 'pointer', color: '#3b82f6' }}>
              Dashboard
            </span>
            <span className="breadcrumb-separator"> / </span>
            <span className="breadcrumb-current">Account Information</span>
          </div>

          <h2 className="dashboard-title" style={{ marginBottom: '30px' }}>Complete Account Information</h2>

          {/* Business Details Section */}
          <div className="dashboard-card" style={{ padding: '25px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Business Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Business Name</div>
                <div style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>{vendorInfo.vendorName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Street Address</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorAddress1 || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Phone Number</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorPhone || 'N/A'}</div>
              </div>
              {vendorInfo.vendorAddress2 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Address Line 2</div>
                  <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorAddress2}</div>
                </div>
              )}
              {!vendorInfo.vendorAddress2 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>City</div>
                  <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorCity}</div>
                </div>
              )}
              {vendorInfo.vendorAddress2 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>City</div>
                  <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorCity}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>State</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorState}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>ZIP Code</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorZipCode || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="dashboard-card" style={{ padding: '25px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Primary Contact
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>First Name</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorContactFName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Last Name</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.vendorContactLName}</div>
              </div>
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="dashboard-card" style={{ padding: '25px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
              Payment Terms
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Terms Description</div>
                <div style={{ fontSize: '1rem', color: '#1f2937' }}>{vendorInfo.termsDescription || 'Not Assigned'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Quick Actions */}
      <div style={{ width: '280px', flexShrink: 0, marginTop: '96px' }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              className="dashboard-btn dashboard-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate("/vendor-dashboard")}
            >
              ← Back to Dashboard
            </button>
            <button
              className="dashboard-btn dashboard-btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate("/vendor-invoices")}
            >
              View All Invoices
            </button>
          </div>

          <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#059669' }}>
              Need Help?
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', lineHeight: '1.4' }}>
              Contact our support team if you need to update any account information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
