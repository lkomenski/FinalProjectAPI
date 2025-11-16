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

        setVendorInfo(data.vendor);

        setSummary({
          TotalInvoices: data.invoiceSummary.totalInvoices,
          TotalOutstanding: data.invoiceSummary.totalOutstanding,
          TotalPaid: data.invoiceSummary.totalPaid
        });

        setRecentInvoices(data.recentInvoices);

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

      {/* VENDOR INFO */}
      <h3 className="dashboard-subtitle">Vendor Information</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card"><h3>Business Name</h3><div className="value">{vendorInfo.vendorName}</div></div>
        <div className="dashboard-card"><h3>Location</h3><div className="value">{vendorInfo.vendorCity}, {vendorInfo.vendorState}</div></div>
        <div className="dashboard-card"><h3>Phone</h3><div className="value">{vendorInfo.vendorPhone}</div></div>
        <div className="dashboard-card"><h3>Main Contact</h3><div className="value">{vendorInfo.vendorContactFName} {vendorInfo.vendorContactLName}</div></div>
      </div>

      {/* INVOICE SUMMARY */}
      <h3 className="dashboard-subtitle">Invoice Summary</h3>

      <div className="dashboard-grid">
        <div
          className="dashboard-card dashboard-card-link"
          onClick={() => (window.location.href = "/vendor-invoices")}
        >
          <h3>Total Invoices</h3>
          <div className="value">{summary.TotalInvoices}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Outstanding</h3>
          <div className="value">${summary.TotalOutstanding.toFixed(2)}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Paid</h3>
          <div className="value">${summary.TotalPaid.toFixed(2)}</div>
        </div>
      </div>

      {/* RECENT INVOICES */}
      <h3 className="dashboard-subtitle">Recent Invoices</h3>

      {recentInvoices.length === 0 ? (
        <p>No recent invoices found.</p>
      ) : (
        recentInvoices.map((inv) => (
          <div key={inv.invoiceID} className="dashboard-list-item">
            <div>
              <strong>Invoice #{inv.invoiceNumber}</strong><br />
              Date: {new Date(inv.invoiceDate).toLocaleDateString()}<br />
              Total: ${inv.invoiceTotal.toFixed(2)}<br />
            </div>

            <div>
              {inv.paymentTotal + inv.creditTotal >= inv.invoiceTotal ? (
                <span className="text-green-700">PAID</span>
              ) : (
                <span className="text-red-600">UNPAID</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
