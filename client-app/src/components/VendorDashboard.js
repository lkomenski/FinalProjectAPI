import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function VendorDashboard() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCount, setShowCount] = useState(5); // for "Show More"

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

  return (
    <div className="dashboard-container">

      <h2 className="dashboard-title">Vendor Dashboard</h2>

      {/* ------------------------------ */}
      {/* VENDOR ACCOUNT INFORMATION     */}
      {/* ------------------------------ */}
      <h3 className="dashboard-subtitle">Account Information</h3>

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
          <h3>Main Contact</h3>
          <div className="value">
            {vendorInfo?.vendorContactFName} {vendorInfo?.vendorContactLName}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Phone</h3>
          <div className="value">{vendorInfo?.vendorPhone}</div>
        </div>
      </div>

      <button
        className="dashboard-btn"
        onClick={() => navigate("/vendor-account")}
        style={{ marginTop: "10px" }}
      >
        View Full Account Info
      </button>

      {/* TERMS SECTION */}
      {vendorInfo?.termsDescription && (
        <>
          <h3 className="dashboard-subtitle">Terms & Account Details</h3>
          <div className="dashboard-card" style={{ padding: "20px" }}>
            <h3>Terms Description</h3>
            <div className="value">{vendorInfo.termsDescription}</div>
          </div>
        </>
      )}

      {/* ------------------------------ */}
      {/* INVOICE SUMMARY                 */}
      {/* ------------------------------ */}
      <h3 className="dashboard-subtitle">Invoice Summary</h3>

      <div className="dashboard-grid">

        {/* CLICKABLE — View all invoices */}
        <div
          className="dashboard-card dashboard-clickable"
          onClick={() => navigate("/vendor-invoices")}
        >
          <h3>Total Invoices</h3>
          <div className="value">{summary?.TotalInvoices}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Outstanding</h3>
          <div className="value">${money(summary?.TotalOutstanding)}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Paid</h3>
          <div className="value">${money(summary?.TotalPaid)}</div>
        </div>
      </div>

      {/* ------------------------------ */}
      {/* RECENT INVOICES                */}
      {/* ------------------------------ */}
      <h3 className="dashboard-subtitle">Recent Invoices</h3>

      {recentInvoices.length === 0 ? (
        <p>No recent invoices found.</p>
      ) : (
        <>
          {recentInvoices.slice(0, showCount).map((inv) => (
            <div
              key={inv.invoiceID}
              className="dashboard-list-item dashboard-clickable"
              onClick={() => navigate(`/vendor-invoice/${inv.invoiceID}`)}
            >
              <div>
                <strong>Invoice #{inv.invoiceNumber}</strong><br />
                Date: {new Date(inv.invoiceDate).toLocaleDateString()}<br />
                Total: ${money(inv.invoiceTotal)}

                {/* STATUS BADGE */}
                {inv.invoiceStatus && (
                  <span
                    className={
                      inv.invoiceStatus === "Paid"
                        ? "badge badge-paid"
                        : inv.invoiceStatus === "Unpaid"
                        ? "badge badge-unpaid"
                        : "badge badge-none"
                    }
                  >
                    {inv.invoiceStatus}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* LOAD MORE BUTTON */}
          {showCount < recentInvoices.length && (
            <button
              className="dashboard-btn dashboard-btn-secondary"
              onClick={() => setShowCount((prev) => prev + 5)}
            >
              Load More
            </button>
          )}
        </>
      )}

      {/* VIEW ALL INVOICES BUTTON */}
      {recentInvoices.length > 0 && (
        <button
          className="dashboard-btn"
          onClick={() => navigate("/vendor-invoices")}
          style={{ marginTop: "10px" }}
        >
          View All Invoices
        </button>
      )}

    </div>
  );
}
