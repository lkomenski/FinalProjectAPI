import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        const data = await fetchData(`invoices/${id}`);
        setInvoice(data);
      } catch (err) {
        setError(err.message || "Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!invoice) return <ErrorMessage message="Invoice not found." />;

  const statusClass =
    invoice.invoiceStatus === "Paid"
      ? "badge badge-paid"
      : invoice.invoiceStatus === "Unpaid"
      ? "badge badge-unpaid"
      : "badge badge-none";

  return (
    <div className="invoice-detail-container">
      <Link to="/vendor-dashboard" className="back-link">← Back to Dashboard</Link>

      <h2 className="invoice-detail-title">
        Invoice #{invoice.invoiceNumber}
      </h2>

      <div className="invoice-status-wrapper">
        <span className={statusClass}>{invoice.invoiceStatus}</span>
      </div>

      {/* -------- INVOICE INFO -------- */}
      <div className="invoice-section">
        <h3 className="invoice-section-title">Invoice Information</h3>

        <div className="invoice-grid">
          <div>
            <label>Invoice Date</label>
            <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          </div>

          <div>
            <label>Due Date</label>
            <p>
              {invoice.invoiceDueDate
                ? new Date(invoice.invoiceDueDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div>
            <label>Payment Date</label>
            <p>
              {invoice.paymentDate
                ? new Date(invoice.paymentDate).toLocaleDateString()
                : "Unpaid"}
            </p>
          </div>

          <div>
            <label>Terms</label>
            <p>{invoice.termsDescription || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* -------- AMOUNTS -------- */}
      <div className="invoice-section">
        <h3 className="invoice-section-title">Amounts</h3>

        <div className="invoice-grid">
          <div>
            <label>Total Amount</label>
            <p>${invoice.invoiceTotal.toFixed(2)}</p>
          </div>

          <div>
            <label>Amount Paid</label>
            <p>${invoice.paymentTotal.toFixed(2)}</p>
          </div>

          <div>
            <label>Credits Applied</label>
            <p>${invoice.creditTotal.toFixed(2)}</p>
          </div>

          <div>
            <label>Balance Remaining</label>
            <p>
              ${(invoice.invoiceTotal - invoice.paymentTotal - invoice.creditTotal).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* -------- METADATA -------- */}
      <div className="invoice-section">
        <h3 className="invoice-section-title">Record Details</h3>

        <div className="invoice-grid">
          <div>
            <label>Invoice ID</label>
            <p>{invoice.invoiceID}</p>
          </div>

          <div>
            <label>Vendor ID</label>
            <p>{invoice.vendorID}</p>
          </div>

          <div>
            <label>Last Updated</label>
            <p>{invoice.dateUpdated ? new Date(invoice.dateUpdated).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
