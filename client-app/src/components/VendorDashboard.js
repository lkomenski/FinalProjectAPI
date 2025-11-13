import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function VendorDashboard() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        // Vendor Info
        setVendorInfo(data.vendor || null);

        // Invoice summary
        setSummary({
          TotalInvoices: data.invoiceSummary?.totalInvoices ?? 0,
          TotalOutstanding: data.invoiceSummary?.totalOutstanding ?? 0,
          TotalPaid: data.invoiceSummary?.totalPaid ?? 0
        });

        // Recent invoices (array)
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

  return (
    <div className="dashboard-container">

      <h2 className="dashboard-title">Vendor Dashboard</h2>

      {/* -------------------- Vendor Info -------------------- */}
      <h3 className="dashboard-subtitle">Vendor Information</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Business Name</h3>
          <div className="value">{vendorInfo?.vendorName}</div>
        </div>

        <div className="dashboard-card">
          <h3>Location</h3>
          <div className="value">
            {vendorInfo?.vendorCity}, {vendorInfo?.vendorState}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Phone</h3>
          <div className="value">{vendorInfo?.vendorPhone}</div>
        </div>

        <div className="dashboard-card">
          <h3>Main Contact</h3>
          <div className="value">
            {vendorInfo?.vendorContactFName} {vendorInfo?.vendorContactLName}
          </div>
        </div>
      </div>

      {/* -------------------- Invoice Summary -------------------- */}
      <h3 className="dashboard-subtitle">Invoice Summary</h3>

      <div className="dashboard-grid">
        <div
          className="dashboard-card dashboard-card-clickable"
          onClick={() => (window.location.href = "/vendor-invoices")}
        >
          <h3>Total Invoices</h3>
          <div className="value">{summary?.TotalInvoices}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Outstanding</h3>
          <div className="value">
            ${Number(summary?.TotalOutstanding).toFixed(2)}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Total Paid</h3>
          <div className="value">
            ${Number(summary?.TotalPaid).toFixed(2)}
          </div>
        </div>
      </div>

      {/* -------------------- Recent Invoices -------------------- */}
      <h3 className="dashboard-subtitle">Recent Invoices</h3>

      {recentInvoices.length === 0 ? (
        <p>No recent invoices found.</p>
      ) : (
        recentInvoices.map((inv) => (
          <div key={inv.invoiceID} className="dashboard-list-item">
            <div>
              <strong>Invoice #{inv.invoiceNumber}</strong><br />
              Date: {new Date(inv.invoiceDate).toLocaleDateString()}<br />
              Total: ${Number(inv.invoiceTotal).toFixed(2)}
            </div>
          </div>
        ))
      )}

    </div>
  );
}
