import React, { useEffect, useState } from "react";
import { fetchData } from "../../api/api";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

export default function VendorDashboard({ vendorId }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadVendor() {
      try {
        const data = await fetchData(`dashboard/vendor/${vendorId}`);
        setVendor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadVendor();
  }, [vendorId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Vendor Dashboard – {vendor.VendorName}
      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><strong>Contact:</strong> {vendor.VendorContactFName} {vendor.VendorContactLName}</p>
        <p><strong>Phone:</strong> {vendor.VendorPhone}</p>
        <p><strong>City:</strong> {vendor.VendorCity}, {vendor.VendorState}</p>
        <p><strong>Last Updated:</strong> {new Date(vendor.DateUpdated).toLocaleString()}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Invoice Summary</h3>
        <ul className="space-y-1">
          <li>Total Invoices: {vendor.TotalInvoices}</li>
          <li>Total Invoiced: ${vendor.TotalInvoiced?.toFixed(2)}</li>
          <li>Total Paid: ${vendor.TotalPaid?.toFixed(2)}</li>
          <li>Outstanding: ${vendor.TotalOutstanding?.toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
}
