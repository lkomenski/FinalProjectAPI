import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function VendorInvoiceDetail() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Extract invoiceId from URL like /vendor-invoice/123
  const invoiceId = window.location.pathname.split("/").pop();

  useEffect(() => {
    async function loadInvoice() {
      try {
        const data = await fetchData(`invoices/${invoiceId}`);
        setInvoice(data);
      } catch (err) {
        setError(err.message || "Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [invoiceId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (!invoice) return <ErrorMessage message="Invoice not found." />;

  // Determine status
  const outstanding =
    invoice.invoiceTotal - invoice.paymentTotal - invoice.creditTotal;

  const status =
    outstanding <= 0
      ? "Paid"
      : invoice.paymentDate
      ? "Partially Paid"
      : "Unpaid";

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Invoice Detail</h2>

      <div className="dashboard-card" style={{ padding: "20px" }}>
        <h3>Invoice #{invoice.invoiceNumber}</h3>

        <p><strong>Status:</strong> {status}</p>
        <p><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> {invoice.invoiceDueDate
          ? new Date(invoice.invoiceDueDate).toLocaleDateString()
          : "N/A"}
        </p>

        <p><strong>Total:</strong> ${invoice.invoiceTotal.toFixed(2)}</p>
        <p><strong>Paid:</strong> ${invoice.paymentTotal.toFixed(2)}</p>
        <p><strong>Credit:</strong> ${invoice.creditTotal.toFixed(2)}</p>

        <p><strong>Terms:</strong> {invoice.termsDescription ?? "N/A"}</p>

        <hr />

        <h3>Vendor Information</h3>
        <p><strong>{invoice.vendorName}</strong></p>
        <p>{invoice.vendorCity}, {invoice.vendorState}</p>
        <p>Phone: {invoice.vendorPhone}</p>
      </div>

      <button
        className="dashboard-btn"
        onClick={() => (window.location.href = "/vendor-invoices")}
        style={{ marginTop: "20px" }}
      >
        ← Back to Invoices
      </button>
    </div>
  );
}
