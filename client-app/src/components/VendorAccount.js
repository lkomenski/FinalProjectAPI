import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function VendorAccount() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const vendorId = user?.id;

  useEffect(() => {
    async function loadAccountInfo() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);

        // Re-use vendor info returned by dashboard API
        setVendorInfo(data.vendor);

      } catch (err) {
        setError(err.message || "Failed to load vendor account info.");
      } finally {
        setLoading(false);
      }
    }

    loadAccountInfo();
  }, [vendorId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!vendorInfo) return <ErrorMessage message="Vendor data unavailable." />;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Vendor Account Information</h2>

      <div className="dashboard-card" style={{ padding: "20px" }}>
        
        <h3>Business Details</h3>
        <p><strong>Name:</strong> {vendorInfo.vendorName}</p>
        <p><strong>City:</strong> {vendorInfo.vendorCity}</p>
        <p><strong>State:</strong> {vendorInfo.vendorState}</p>
        <p><strong>Phone:</strong> {vendorInfo.vendorPhone}</p>

        <hr style={{ margin: "20px 0" }} />

        <h3>Main Contact</h3>
        <p>
          <strong>Contact:</strong> {vendorInfo.vendorContactFName}{" "}
          {vendorInfo.vendorContactLName}
        </p>

        <hr style={{ margin: "20px 0" }} />

        <h3>Account Terms</h3>
        <p>
          <strong>Payment Terms:</strong>{" "}
          {vendorInfo.termsDescription ?? "Not Assigned"}
        </p>

        <p>
          <strong>Last Updated:</strong>{" "}
          {vendorInfo.dateUpdated
            ? new Date(vendorInfo.dateUpdated).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      <button
        className="dashboard-btn"
        style={{ marginTop: "20px" }}
        onClick={() => (window.location.href = "/vendor-dashboard")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
