import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../context/CartContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import { validateZipCode, validateState, validatePhoneNumber, formatPhoneNumber } from "../../scripts";
import "../../Styles/CheckoutPage.css";

export default function CheckoutPage() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { cart, clearCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [hasAddresses, setHasAddresses] = useState(false);

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
  // AUTO-FILL CUSTOMER INFO AND ADDRESSES
  // ---------------------------------------------------
  useEffect(() => {
    if (!user) return;

    async function loadCustomerData() {
      try {
        // Load basic profile
        const profileRes = await fetch(`http://localhost:5077/api/customer/${user.id}`);
        const profileData = await profileRes.json();

        // Load addresses
        const addressRes = await fetch(`http://localhost:5077/api/customer/${user.id}/addresses`);
        const addressData = await addressRes.json();

        // Check if customer has saved addresses
        const hasShipping = !!addressData?.ShippingLine1;
        setHasAddresses(hasShipping);
        setEditMode(!hasShipping); // Auto-edit mode if no addresses

        // Check if billing and shipping are the same
        const isSame = 
          addressData?.ShippingLine1 && addressData?.BillingLine1 &&
          addressData.ShippingLine1 === addressData.BillingLine1 &&
          addressData.ShippingCity === addressData.BillingCity &&
          addressData.ShippingState === addressData.BillingState &&
          addressData.ShippingZipCode === addressData.BillingZipCode;

        setSameAsShipping(isSame || !addressData?.BillingLine1);

        setForm((prev) => ({
          ...prev,
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          emailAddress: profileData.emailAddress || "",
          phone: profileData.phone || "",
          address: addressData?.ShippingLine1 || "",
          city: addressData?.ShippingCity || "",
          state: addressData?.ShippingState || "",
          zip: addressData?.ShippingZipCode || "",
          billingAddress: addressData?.BillingLine1 || "",
          billingCity: addressData?.BillingCity || "",
          billingState: addressData?.BillingState || "",
          billingZip: addressData?.BillingZipCode || "",
        }));
      } catch {
        console.log("Could not load customer profile and addresses");
        setEditMode(true); // Default to edit mode on error
      }
    }

    loadCustomerData();
  }, [user]);

  // ---------------------------------------------------
  // FIELD HANDLER
  // ---------------------------------------------------
  function updateField(e) {
    const { name, value } = e.target;
    
    // Phone number validation and auto-formatting
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setForm({ ...form, [name]: formatPhoneNumber(digits) });
      }
      return;
    }
    
    // State: only 2 letters, uppercase
    if (name === 'state' || name === 'billingState') {
      const stateValue = value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
      setForm({ ...form, [name]: stateValue });
      return;
    }
    
    // Zip code: only 5 digits
    if (name === 'zip' || name === 'billingZip') {
      const zipValue = value.replace(/\D/g, '').slice(0, 5);
      setForm({ ...form, [name]: zipValue });
      return;
    }
    
    setForm({ ...form, [name]: value });
    setError("");
    setMessage("");
  }

  // ---------------------------------------------------
  // SYNC BILLING ADDRESS
  // ---------------------------------------------------
  function toggleBillingAddress(checked) {
    setSameAsShipping(checked);

    if (checked) {
      setForm((prev) => ({
        ...prev,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingState: prev.state,
        billingZip: prev.zip,
      }));
    }
  }

  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------
  function validate() {
    // Required fields check
    if (!form.address || !form.city || !form.state || !form.zip) {
      setError("All shipping address fields are required.");
      return false;
    }

    // Validate shipping state
    if (!validateState(form.state)) {
      setError("Shipping state must be a valid 2-letter state code (e.g., CA, NY).");
      return false;
    }

    // Validate shipping zip code
    if (!validateZipCode(form.zip)) {
      setError("Shipping ZIP code must be exactly 5 digits.");
      return false;
    }

    // Validate billing address if different
    if (!sameAsShipping) {
      if (!form.billingAddress || !form.billingCity || !form.billingState || !form.billingZip) {
        setError("All billing address fields are required.");
        return false;
      }

      if (!validateState(form.billingState)) {
        setError("Billing state must be a valid 2-letter state code (e.g., CA, NY).");
        return false;
      }

      if (!validateZipCode(form.billingZip)) {
        setError("Billing ZIP code must be exactly 5 digits.");
        return false;
      }
    }

    // Validate phone if provided
    if (form.phone && !validatePhoneNumber(form.phone)) {
      setError("Phone number must be exactly 10 digits.");
      return false;
    }

    // Validate payment info
    if (!form.cardNumber || form.cardNumber.length < 13) {
      setError("Please enter a valid card number (minimum 13 digits).");
      return false;
    }

    if (!form.cardExpiration || !form.cardExpiration.includes("/")) {
      setError("Card expiration must be in MM/YY format.");
      return false;
    }

    if (!form.cardCVV || form.cardCVV.length < 3) {
      setError("CVV must be at least 3 digits.");
      return false;
    }

    return true;
  }

  // ---------------------------------------------------
  // UPDATE CUSTOMER SHIPPING & BILLING ADDRESSES AFTER ORDER
  // ---------------------------------------------------
  async function updateCustomerAddresses() {
    try {
      // Always save shipping address first
      const shippingData = {
        customerID: user.id,
        addressType: "shipping",
        line1: form.address,
        line2: null,
        city: form.city,
        state: form.state,
        zipCode: form.zip,
        phone: form.phone ? form.phone.replace(/\D/g, '') : null
      };

      await fetch("http://localhost:5077/api/customer/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingData),
      });

      // Save billing address
      // If same as shipping, the stored procedure will automatically reuse the same AddressID
      const billingData = {
        customerID: user.id,
        addressType: "billing",
        line1: sameAsShipping ? form.address : form.billingAddress,
        line2: null,
        city: sameAsShipping ? form.city : form.billingCity,
        state: sameAsShipping ? form.state : form.billingState,
        zipCode: sameAsShipping ? form.zip : form.billingZip,
        phone: form.phone ? form.phone.replace(/\D/g, '') : null
      };

      await fetch("http://localhost:5077/api/customer/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingData),
      });
    } catch (err) {
      console.log("Could not update addresses:", err);
    }
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
        productId: item.productID || item.ProductID,
        quantity: item.quantity,
        listPrice: item.listPrice || item.ListPrice,
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

      await updateCustomerAddresses();

      clearCart();
      setMessage("Order placed successfully! Redirecting...");
      setEditMode(false);
      setHasAddresses(true);
      setTimeout(() => (window.location.href = "/customer-dashboard"), 2000);
    } catch {
      setError("Server error placing order.");
    }

    setLoading(false);
  }

  // ---------------------------------------------------
  // TOTAL
  // ---------------------------------------------------
  const total = cart.reduce((sum, item) => {
    const price = item.listPrice || item.ListPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  if (!user) return <p>Please log in to continue.</p>;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {error && <p className="checkout-error">{error}</p>}
      {message && <p className="checkout-success">{message}</p>}

      <div className="checkout-grid">

        {/* ----------------------------------------------------
            LEFT SIDE — ADDRESS INFORMATION
        ---------------------------------------------------- */}
        <div className="checkout-section">

          {/* DISPLAY MODE */}
          {!editMode && hasAddresses && (
            <>
              <div className="checkout-address-display">
                <div className="address-header">
                  <h3 className="checkout-subtitle">Shipping Information</h3>
                  <button 
                    className="checkout-edit-btn" 
                    onClick={() => setEditMode(true)}
                  >
                    Edit Addresses
                  </button>
                </div>
                <div className="address-content">
                  <p><strong>Address:</strong> {form.address}</p>
                  <p><strong>City:</strong> {form.city}</p>
                  <p><strong>State:</strong> {form.state}</p>
                  <p><strong>ZIP:</strong> {form.zip}</p>
                </div>
              </div>

              <div className="checkout-address-display">
                <h3 className="checkout-subtitle">Billing Address</h3>
                <div className="address-content">
                  {sameAsShipping ? (
                    <>
                      <p><strong>Address:</strong> {form.address}</p>
                      <p><strong>City:</strong> {form.city}</p>
                      <p><strong>State:</strong> {form.state}</p>
                      <p><strong>ZIP:</strong> {form.zip}</p>
                      <p style={{ fontStyle: 'italic', color: '#6b7280', marginTop: '8px' }}>
                        Same as shipping address
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>Address:</strong> {form.billingAddress}</p>
                      <p><strong>City:</strong> {form.billingCity}</p>
                      <p><strong>State:</strong> {form.billingState}</p>
                      <p><strong>ZIP:</strong> {form.billingZip}</p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {editMode && (
            <>
              <div className="address-header">
                <h3 className="checkout-subtitle">Shipping Information</h3>
                {hasAddresses && (
                  <button 
                    className="checkout-cancel-btn" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="checkout-form">
                <input 
                  id="checkout-address" 
                  className="checkout-input full" 
                  name="address" 
                  type="text" 
                  placeholder="Street Address *" 
                  onChange={updateField} 
                  value={form.address} 
                  autoComplete="street-address" 
                />
                <input 
                  id="checkout-city" 
                  className="checkout-input" 
                  name="city" 
                  type="text" 
                  placeholder="City *" 
                  onChange={updateField} 
                  value={form.city} 
                  autoComplete="address-level2" 
                />
                <input 
                  id="checkout-state" 
                  className="checkout-input" 
                  name="state" 
                  type="text" 
                  placeholder="State *" 
                  onChange={updateField} 
                  value={form.state} 
                  autoComplete="address-level1" 
                  maxLength="2"
                />
                <input 
                  id="checkout-zip" 
                  className="checkout-input" 
                  name="zip" 
                  type="text" 
                  placeholder="ZIP Code *" 
                  onChange={updateField} 
                  value={form.zip} 
                  autoComplete="postal-code" 
                  maxLength="5"
                />
              </div>

              <h3 className="checkout-subtitle" style={{ marginTop: '24px' }}>Billing Address</h3>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="sameAsShipping"
                  name="sameAsShipping"
                  checked={sameAsShipping}
                  onChange={(e) => toggleBillingAddress(e.target.checked)}
                  autoComplete="off"
                />
                <label htmlFor="sameAsShipping">Same as shipping address</label>
              </div>

              {!sameAsShipping && (
                <div className="checkout-form">
                  <input 
                    id="checkout-billingAddress" 
                    className="checkout-input full" 
                    name="billingAddress" 
                    type="text" 
                    placeholder="Billing Street Address *" 
                    onChange={updateField} 
                    value={form.billingAddress} 
                    autoComplete="billing street-address" 
                  />
                  <input 
                    id="checkout-billingCity" 
                    className="checkout-input" 
                    name="billingCity" 
                    type="text" 
                    placeholder="Billing City *" 
                    onChange={updateField} 
                    value={form.billingCity} 
                    autoComplete="billing address-level2" 
                  />
                  <input 
                    id="checkout-billingState" 
                    className="checkout-input" 
                    name="billingState" 
                    type="text" 
                    placeholder="Billing State *" 
                    onChange={updateField} 
                    value={form.billingState} 
                    autoComplete="billing address-level1" 
                    maxLength="2"
                  />
                  <input 
                    id="checkout-billingZip" 
                    className="checkout-input" 
                    name="billingZip" 
                    type="text" 
                    placeholder="Billing ZIP *" 
                    onChange={updateField} 
                    value={form.billingZip} 
                    autoComplete="billing postal-code" 
                    maxLength="5"
                  />
                </div>
              )}

              {hasAddresses && (
                <button 
                  className="checkout-save-address-btn" 
                  onClick={() => setEditMode(false)}
                  style={{ marginTop: '16px' }}
                >
                  Save Address Changes
                </button>
              )}
            </>
          )}

          {/* PAYMENT - ALWAYS SHOW */}
          <h3 className="checkout-subtitle" style={{ marginTop: '24px' }}>Payment Information</h3>
          <div className="checkout-form">
            <input 
              id="checkout-cardNumber" 
              className="checkout-input full" 
              name="cardNumber" 
              type="text" 
              placeholder="Card Number *" 
              onChange={updateField} 
              value={form.cardNumber} 
              autoComplete="cc-number" 
            />
            <input 
              id="checkout-cardExpiration" 
              className="checkout-input" 
              name="cardExpiration" 
              type="text" 
              placeholder="MM/YY *" 
              onChange={updateField} 
              value={form.cardExpiration} 
              autoComplete="cc-exp" 
            />
            <input 
              id="checkout-cardCVV" 
              className="checkout-input" 
              name="cardCVV" 
              type="text" 
              placeholder="CVV *" 
              onChange={updateField} 
              value={form.cardCVV} 
              autoComplete="cc-csc" 
              maxLength="4"
            />
          </div>

        </div>

        {/* ----------------------------------------------------
            RIGHT SIDE — ORDER SUMMARY
        ---------------------------------------------------- */}
        <div className="checkout-summary">
          <h3 className="checkout-subtitle">Order Summary</h3>

          <div className="summary-items">
            {cart.map((item) => (
              <div key={item.productID || item.ProductID} className="summary-item-row">
                <span>{item.productName || item.ProductName}</span>
                <span>
                  {item.quantity} × ${(item.listPrice || item.ListPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <h3 className="summary-total">Total: ${total.toFixed(2)}</h3>

          <button className="checkout-btn" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
