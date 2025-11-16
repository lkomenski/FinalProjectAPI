import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("date-desc");

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const vendorId = user?.id;

  useEffect(() => {
    async function loadInvoices() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);

        setVendorName(data.vendor.vendorName);
        setInvoices(data.recentInvoicesFull || data.recentInvoices || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [vendorId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // -------------------------
  // Invoice “status”
  // -------------------------
  const getStatus = (inv) => {
    if (!inv.paymentTotal && !inv.creditTotal) return "unpaid";
    if (inv.paymentDate) return "paid";
    if ((inv.creditTotal ?? 0) + (inv.paymentTotal ?? 0) >= inv.invoiceTotal)
      return "paid";

    return "unpaid";
  };

  // Badge UI
  const StatusBadge = ({ status }) => (
    <span
      className={
        status === "paid"
          ? "badge-paid"
          : "badge-unpaid"
      }
    >
      {status.toUpperCase()}
    </span>
  );

  // -------------------------
  // Sorting Handler
  // -------------------------
  const sortInvoices = (list, mode) => {
    switch (mode) {
      case "date-desc":
        return [...list].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );

      case "date-asc":
        return [...list].sort(
          (a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate)
        );

      case "total-desc":
        return [...list].sort(
          (a, b) => b.invoiceTotal - a.invoiceTotal
        );

      case "total-asc":
        return [...list].sort(
          (a, b) => a.invoiceTotal - b.invoiceTotal
        );

      case "status":
        return [...list].sort((a, b) =>
          getStatus(a).localeCompare(getStatus(b))
        );

      default:
        return list;
    }
  };

  const sortedInvoices = sortInvoices(invoices, sortField);

  const money = (n) =>
    typeof n === "number" ? n.toFixed(2) : "0.00";

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Invoices — {vendorName}</h2>

      {/* Sorting Controls */}
      <div className="filters-row">
        <select
          className="dashboard-select"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="total-desc">Amount (High → Low)</option>
          <option value="total-asc">Amount (Low → High)</option>
          <option value="status">Status (Paid → Unpaid)</option>
        </select>
      </div>

      {/* Invoices List */}
      {sortedInvoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        sortedInvoices.map((inv) => (
          <div
            key={inv.invoiceID}
            className="dashboard-list-item dashboard-clickable"
            onClick={() => navigate(`/vendor-invoices/${inv.invoiceID}`)}
          >
            <div>
              <strong>Invoice #{inv.invoiceNumber}</strong> <br />
              Date: {new Date(inv.invoiceDate).toLocaleDateString()} <br />
              Total: ${money(inv.invoiceTotal)}
              Status: {inv.invoiceStatus}
            </div>

            <div>
              <StatusBadge status={getStatus(inv)} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
