import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const vendorId = user?.id;

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await fetchData(`dashboard/vendor/${vendorId}/invoices`);
        setInvoices(data);
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
      <h2 className="dashboard-title">All Invoices</h2>

      {invoices.map((inv) => {
        const paid = inv.paymentTotal + inv.creditTotal >= inv.invoiceTotal;

        return (
          <div key={inv.invoiceID} className="dashboard-list-item">
            <div>
              <strong>Invoice #{inv.invoiceNumber}</strong><br />
              Date: {new Date(inv.invoiceDate).toLocaleDateString()}<br />
              Due: {inv.invoiceDueDate ? new Date(inv.invoiceDueDate).toLocaleDateString() : "N/A"}<br />
              Total: ${inv.invoiceTotal.toFixed(2)}<br />
              Paid: ${(inv.paymentTotal + inv.creditTotal).toFixed(2)}<br />
            </div>
            <div>
              {paid ? (
                <span className="text-green-700">PAID</span>
              ) : (
                <span className="text-red-600">UNPAID</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
