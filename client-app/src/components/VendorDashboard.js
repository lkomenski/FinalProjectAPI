import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [invoiceSummary, setInvoiceSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        setVendor(data.vendor);
        setInvoiceSummary(data.invoiceSummary);
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
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Vendor Dashboard
      </h2>

      {/* Vendor Information */}
      {vendor && (
        <div className="mb-6 border p-4 rounded-md bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {vendor.VendorContactFName} {vendor.VendorContactLName}
          </h3>
          <p>Company: {vendor.VendorName}</p>
          <p>Location: {vendor.VendorCity}, {vendor.VendorState}</p>
          <p>Phone: {vendor.VendorPhone}</p>
          <p>Last Updated: {vendor.DateUpdated ? 
            new Date(vendor.DateUpdated).toLocaleString() : "N/A"}
          </p>
        </div>
      )}

      {/* Invoice Summary */}
      {invoiceSummary && (
        <div className="mb-6 border p-4 rounded-md bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Invoice Summary</h3>
          <p>Total Invoices: {invoiceSummary.TotalInvoices}</p>
          <p>Total Invoiced: ${invoiceSummary.TotalInvoiced?.toFixed(2)}</p>
          <p>Total Paid: ${invoiceSummary.TotalPaid?.toFixed(2)}</p>
          <p>Outstanding: ${invoiceSummary.TotalOutstanding?.toFixed(2)}</p>
        </div>
      )}

      {/* Recent Invoices */}
      <h3 className="text-xl font-bold text-gray-800 mb-3">Recent Invoices</h3>
      {recentInvoices.length === 0 ? (
        <p className="text-gray-500">No invoices available.</p>
      ) : (
        <div className="space-y-4">
          {recentInvoices.map((inv, idx) => (
            <div key={idx} className="border p-4 rounded-md">
              <p className="font-semibold">
                Invoice #{inv.InvoiceNumber}
              </p>
              <p>Date: {new Date(inv.InvoiceDate).toLocaleDateString()}</p>
              <p>Total: ${inv.InvoiceTotal?.toFixed(2)}</p>
              <p>Payment Total: ${inv.PaymentTotal?.toFixed(2)}</p>
              <p>Credit Total: ${inv.CreditTotal?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
