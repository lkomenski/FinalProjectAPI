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

        // Vendor information
        setVendorInfo({
          VendorName: data.VendorName,
          VendorCity: data.VendorCity,
          VendorState: data.VendorState,
          VendorPhone: data.VendorPhone,
          VendorContactFName: data.VendorContactFirstName,
          VendorContactLName: data.VendorContactLastName
        });

        const invoices = data.Invoices || [];

        // Summary
        setSummary({
          TotalInvoices: invoices.length,
          TotalOutstanding: invoices.reduce(
            (t, x) => t + (x.InvoiceTotal - x.PaymentTotal - x.CreditTotal),
            0
          ),
          TotalPaid: invoices.reduce((t, x) => t + x.PaymentTotal, 0)
        });

        // Recent invoices
        setRecentInvoices(invoices.slice(0, 5));

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
        <div className="dashboard-card">
          <h3>Business Name</h3>
          <div className="value">{vendorInfo?.VendorName}</div>
        </div>

        <div className="dashboard-card">
          <h3>Location</h3>
          <div className="value">
            {vendorInfo?.VendorCity}, {vendorInfo?.VendorState}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Phone</h3>
          <div className="value">{vendorInfo?.VendorPhone}</div>
        </div>

        <div className="dashboard-card">
          <h3>Main Contact</h3>
          <div className="value">
            {vendorInfo?.VendorContactFName} {vendorInfo?.VendorContactLName}
          </div>
        </div>
      </div>

      {/* INVOICE SUMMARY */}
      <h3 className="dashboard-subtitle">Invoice Summary</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Invoices</h3>
          <div className="value">{summary?.TotalInvoices}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Outstanding</h3>
          <div className="value">${summary?.TotalOutstanding.toFixed(2)}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Paid</h3>
          <div className="value">${summary?.TotalPaid.toFixed(2)}</div>
        </div>
      </div>

      {/* RECENT INVOICES */}
      <h3 className="dashboard-subtitle">Recent Invoices</h3>

      {recentInvoices.length === 0 ? (
        <p>No recent invoices found.</p>
      ) : (
        recentInvoices.map((inv, idx) => (
          <div key={idx} className="dashboard-list-item">
            <div>
              <strong>Invoice #{inv.InvoiceNumber}</strong><br />
              Date: {new Date(inv.InvoiceDate).toLocaleDateString()}<br />
              Total: ${inv.InvoiceTotal.toFixed(2)}
            </div>
          </div>
        ))
      )}

    </div>
  );
}
