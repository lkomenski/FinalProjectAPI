import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const vendorId = user?.id;

  useEffect(() => {
    async function loadInvoices() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);

        // API returns invoices under data.recentInvoices for dashboard
        // BUT you actually want *ALL invoices* so use: data.vendor + data.invoiceSummary + data.recentInvoices

        const allInvoices = data.recentInvoices ?? [];

        // Make sure values are safe
        const cleaned = allInvoices.map((inv) => ({
          ...inv,
          invoiceTotal: Number(inv.invoiceTotal || inv.InvoiceTotal || 0),
          paymentTotal: Number(inv.paymentTotal || inv.PaymentTotal || 0),
          creditTotal: Number(inv.creditTotal || inv.CreditTotal || 0),
        }));

        setInvoices(cleaned);
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

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Invoices</h2>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        invoices.map((inv) => (
          <div key={inv.invoiceID} className="dashboard-list-item">
            <strong>Invoice #{inv.invoiceNumber}</strong> <br />
            Date: {new Date(inv.invoiceDate).toLocaleDateString()} <br />
            Total: ${inv.invoiceTotal.toFixed(2)} <br />
            Paid: ${(inv.paymentTotal + inv.creditTotal).toFixed(2)} <br />
            <span
              className={
                inv.invoiceTotal >
                inv.paymentTotal + inv.creditTotal
                  ? "text-red-600"
                  : "text-green-700"
              }
            >
              {inv.invoiceTotal >
              inv.paymentTotal + inv.creditTotal
                ? "Unpaid"
                : "Paid"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
