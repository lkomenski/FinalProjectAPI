import React, { useEffect, useState } from "react";
import { fetchData } from "../../api/api";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

export default function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await fetchData("dashboard/employee");
        data.TopProducts = JSON.parse(data.TopProductsJSON || "[]");
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Employee Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div><p className="text-xl font-semibold">${dashboard.TotalSales?.toFixed(2)}</p><p>Total Sales</p></div>
        <div><p className="text-xl font-semibold">{dashboard.TotalOrders}</p><p>Total Orders</p></div>
        <div><p className="text-xl font-semibold">{dashboard.TotalCustomers}</p><p>Total Customers</p></div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Top Products</h3>
        <ul className="list-disc list-inside">
          {dashboard.TopProducts.map((p, i) => (
            <li key={i}>{p.ProductName} — {p.TotalSold} sold</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
