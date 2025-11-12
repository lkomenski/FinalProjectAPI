import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import LoadingSpinner from "./shared/LoadingSpinner";

export default function CheckoutPage() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { cart, clearCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    cardExpiration: "",
    cardCVV: "",
  });

  // ---------------------------------------------------
  // AUTO-FILL CUSTOMER INFO
  // ---------------------------------------------------
  useEffect(() => {
    if (!user) return;

    async function loadCustomer() {
      try {
        const res = await fetch(
          `https://localhost:5077/api/customer/${user.id}`
        );
        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          emailAddress: data.emailAddress || "",
        }));
      } catch {
        console.log("Could not load customer profile");
      }
    }

    loadCustomer();
  }, [user]);


  // ---------------------------------------------------
  // HANDLE FIELD CHANGES
  // ---------------------------------------------------
  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  }

  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------
  function validate() {
    if (!form.address || !form.city || !form.state || !form.zip) {
      setError("Shipping address fields are required.");
      return false;
    }

    if (form.cardNumber.length < 12) {
      setError("Enter a valid card number.");
      return false;
    }

    if (!form.cardExpiration.includes("/")) {
      setError("Expiration date must be in MM/YY format.");
      return false;
    }

    if (form.cardCVV.length < 3) {
      setError("Invalid CVV.");
      return false;
    }

    return true;
  }

  // ---------------------------------------------------
  // PLACE ORDER
  // ---------------------------------------------------
  async function placeOrder() {
    if (!validate()) return;

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    const orderData = {
      customerId: user.id,
      items: cart.map((item) => ({
        productId: item.productID,
        quantity: item.quantity,
        listPrice: item.listPrice,
      })),
      shippingAddress: {
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
    };

    try {
      const res = await fetch("https://localhost:5077/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Could not place order.");
        setLoading(false);
        return;
      }

      clearCart();
      setMessage("Order placed successfully! Redirecting...");
      setTimeout(() => (window.location.href = "/customer-dashboard"), 2000);
    } catch {
      setError("Server error placing order.");
    }

    setLoading(false);
  }

  // ---------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------
  const total = cart.reduce(
    (sum, item) => sum + item.listPrice * item.quantity,
    0
  );

  if (!user) return <p>Please log in to continue.</p>;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {error && <p className="checkout-error">{error}</p>}
      {message && <p className="checkout-success">{message}</p>}

      <div className="checkout-grid">
        
        {/* ---------------------- LEFT SIDE FORM ---------------------- */}
        <div className="checkout-section">

          <h3 className="checkout-subtitle">Shipping Information</h3>

          <div className="checkout-form">

            <input
              className="checkout-input"
              name="address"
              placeholder="Street Address"
              onChange={updateField}
              value={form.address}
            />

            <input
              className="checkout-input"
              name="city"
              placeholder="City"
              onChange={updateField}
              value={form.city}
            />

            <input
              className="checkout-input"
              name="state"
              placeholder="State"
              onChange={updateField}
              value={form.state}
            />

            <input
              className="checkout-input"
              name="zip"
              placeholder="ZIP Code"
              onChange={updateField}
              value={form.zip}
            />

          </div>

          <h3 className="checkout-subtitle">Payment Information</h3>

          <div className="checkout-form">

            <input
              className="checkout-input"
              name="cardNumber"
              placeholder="Card Number"
              onChange={updateField}
              value={form.cardNumber}
            />

            <input
              className="checkout-input"
              name="cardExpiration"
              placeholder="MM/YY"
              onChange={updateField}
              value={form.cardExpiration}
            />

            <input
              className="checkout-input"
              name="cardCVV"
              placeholder="CVV"
              onChange={updateField}
              value={form.cardCVV}
            />

          </div>

        </div>

        {/* ---------------------- RIGHT SIDE ORDER SUMMARY ---------------------- */}
        <div className="checkout-summary">

          <h3 className="checkout-subtitle">Order Summary</h3>

          <div className="summary-items">
            {cart.map((item) => (
              <div key={item.productID} className="summary-item-row">
                <span>{item.productName}</span>
                <span>
                  {item.quantity} × ${item.listPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <h3 className="summary-total">
            Total: ${total.toFixed(2)}
          </h3>

          <button className="checkout-btn" onClick={placeOrder}>
            Place Order
          </button>

        </div>

      </div>
    </div>
  );
}
