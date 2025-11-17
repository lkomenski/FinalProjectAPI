import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";  

export default function CustomerDashboard() {
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

        const data = await fetchData(`dashboard/customer/${customerId}`);
        setOrders(data.orders || []);
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Your Orders</h2>
        <Link to="/customer-profile" className="dashboard-btn">
          Account Settings
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="dashboard-grid">
          {orders.map((order, idx) => (
            <div key={idx} className="dashboard-card">
              <h3 className="font-semibold">
                Order #{order.OrderID} —{" "}
                {new Date(order.OrderDate).toLocaleDateString()}
              </h3>

              <p className="value">${order.TotalAmount?.toFixed(2)}</p>

              {order.ProductName && (
                <p>
                  Product: {order.ProductName} (x{order.Quantity})
                </p>
              )}
              <button
              className="dashboard-btn dashboard-btn-warning"
              onClick={async () => {
                const newPass = prompt("Enter new password:");
                if (!newPass) return;

                const res = await fetch("http://localhost:5077/api/auth/customer/reset-password", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    customerID: user.id,
                    newPassword: newPass
                  })
                });

                const msg = await res.text();
                alert(msg);
              }}
            >
              Reset Password
            </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
