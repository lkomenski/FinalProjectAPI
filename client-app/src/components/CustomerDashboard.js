import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // get logged in user info
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const customerId = user?.id;

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!customerId) {
          setError("No logged-in customer.");
          return;
        }

        // FETCH: /api/dashboard/customer/{id}
        const data = await fetchData(`dashboard/customer/${customerId}`);

        setCustomer(data.customer);
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [customerId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Your Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <div key={idx} className="border p-4 rounded-md">
              <h3 className="font-semibold">
                Order #{order.OrderID} —{" "}
                {new Date(order.OrderDate).toLocaleDateString()}
              </h3>
              <p>Total: ${order.TotalAmount?.toFixed(2)}</p>

              {/* If your stored procedure returns product info */}
              {order.ProductName && (
                <p>
                  Product: {order.ProductName} (x{order.Quantity})
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
