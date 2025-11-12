import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!user || user.role !== "admin") {
          setError("Unauthorized access. Admins only.");
          return;
        }

        const data = await fetchData("dashboard/employee");
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Customers
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.TotalCustomers}
          </p>
        </div>

        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Vendors
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.TotalVendors}
          </p>
        </div>

        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Active Vendors
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.ActiveVendors}
          </p>
        </div>

        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.TotalProducts}
          </p>
        </div>

      </div>

      {/* Financial Section */}
      <div className="mt-8 p-4 border rounded-md bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Financial Summary
        </h3>

        <p className="mb-2">
          <strong>Total Sales:</strong>{" "}
          <span className="text-green-700 font-semibold">
            ${stats.TotalSales.toFixed(2)}
          </span>
        </p>

        <p className="mb-2">
          <strong>Outstanding Invoices:</strong>{" "}
          <span className="text-red-600 font-semibold">
            ${stats.TotalOutstandingInvoices.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
