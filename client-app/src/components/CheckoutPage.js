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
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
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
          `http://localhost:5077/api/customer/${user.id}`
        );
        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          emailAddress: data.emailAddress || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zipCode || "",
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
  // TOGGLE BILLING ADDRESS
  // ---------------------------------------------------
  function toggleBillingAddress(checked) {
    setSameAsShipping(checked);
    if (checked) {
      // Copy shipping to billing
      setForm({
        ...form,
        billingAddress: form.address,
        billingCity: form.city,
        billingState: form.state,
        billingZip: form.zip,
      });
    }
  }

  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------
  function validate() {
    if (!form.address || !form.city || !form.state || !form.zip) {
      setError("Shipping address fields are required.");
      return false;
    }

    if (!sameAsShipping) {
      if (!form.billingAddress || !form.billingCity || !form.billingState || !form.billingZip) {
        setError("Billing address fields are required.");
        return false;
      }
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
      const res = await fetch("http://localhost:5077/api/orders/create", {
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

      // Update customer profile with shipping info
      await updateCustomerShippingInfo();

      clearCart();
      setMessage("Order placed successfully! Redirecting...");
      setTimeout(() => (window.location.href = "/customer-dashboard"), 2000);
    } catch {
      setError("Server error placing order.");
    }

    setLoading(false);
  }

  // ---------------------------------------------------
  // UPDATE CUSTOMER SHIPPING INFO
  // ---------------------------------------------------
  async function updateCustomerShippingInfo() {
    try {
      const profileData = {
        customerId: user.id,
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.emailAddress,
        phone: form.phone || null,
        city: form.city,
        state: form.state,
        zipCode: form.zip,
        billingCity: sameAsShipping ? form.city : form.billingCity,
        billingState: sameAsShipping ? form.state : form.billingState,
        billingZipCode: sameAsShipping ? form.zip : form.billingZip,
        newPassword: null
      };

      await fetch("http://localhost:5077/api/customer/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
    } catch (err) {
      console.log("Could not update customer profile:", err);
      // Don't throw error - order was already placed successfully
    }
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

          <h3 className="checkout-subtitle">Billing Address</h3>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="sameAsShipping"
              checked={sameAsShipping}
              onChange={(e) => toggleBillingAddress(e.target.checked)}
            />
            <label htmlFor="sameAsShipping">Same as shipping address</label>
          </div>

          {!sameAsShipping && (
            <div className="checkout-form">
              <input
                className="checkout-input"
                name="billingAddress"
                placeholder="Billing Street Address"
                onChange={updateField}
                value={form.billingAddress}
              />

              <input
                className="checkout-input"
                name="billingCity"
                placeholder="Billing City"
                onChange={updateField}
                value={form.billingCity}
              />

              <input
                className="checkout-input"
                name="billingState"
                placeholder="Billing State"
                onChange={updateField}
                value={form.billingState}
              />

              <input
                className="checkout-input"
                name="billingZip"
                placeholder="Billing ZIP Code"
                onChange={updateField}
                value={form.billingZip}
              />
            </div>
          )}

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
