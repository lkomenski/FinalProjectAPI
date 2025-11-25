import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/ProfilePage.css";
import { fetchData } from "../shared/Api";
import ConfirmationModal from "../shared/ConfirmationModal";
import { validatePhoneNumber, formatPhoneNumber, validateZipCode, validateState, validateAlphaOnly } from "../../scripts";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      setError("No user logged in.");
      return;
    }

    if (isLoading) return; // Prevent multiple calls

    async function loadProfileAndAddresses() {
      setIsLoading(true);
      try {
        console.log("Loading profile for user ID:", user.id);
        
        // Load basic profile
        const profileData = await fetchData(`customer/${user.id}`);
        console.log("Profile data received:", profileData);
        
        // Load addresses
        const addressData = await fetchData(`customer/${user.id}/addresses`);
        console.log("Address data received:", addressData);
        
        // Set both states together
        setProfile(profileData);
        setAddresses(addressData);
        
        // Check if billing and shipping addresses are the same
        if (addressData?.ShippingLine1 && addressData?.BillingLine1) {
          const isSame = 
            addressData.ShippingLine1 === addressData.BillingLine1 &&
            addressData.ShippingCity === addressData.BillingCity &&
            addressData.ShippingState === addressData.BillingState &&
            addressData.ShippingZipCode === addressData.BillingZipCode;
          setSameAsShipping(isSame);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(`Failed to load profile and addresses: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileAndAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  // Update profile and address fields
  // -------------------------------
  const updateField = (e) => {
    const { name, value } = e.target;
    
    // First and last name: only letters and spaces
    if (name === 'firstName' || name === 'lastName') {
      const nameValue = value.replace(/[^a-zA-Z ]/g, '');
      setProfile({ ...profile, [name]: nameValue });
      setError("");
      setMessage("");
      return;
    }
    
    // Phone number validation and auto-formatting
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setProfile({ ...profile, [name]: formatPhoneNumber(digits) });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
    
    setError("");
    setMessage("");
  };

  const updateAddressField = (addressType, fieldName, value) => {
    let processedValue = value;
    
    // State: only 2 letters, uppercase
    if (fieldName === 'State') {
      processedValue = value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
    }
    
    // Zip code: only 5 digits
    else if (fieldName === 'ZipCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 5);
    }
    
    // Phone: auto-format while typing
    else if (fieldName === 'Phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        processedValue = formatPhoneNumber(digits);
      } else {
        return; // Prevent input beyond 10 digits
      }
    }
    
    setAddresses({
      ...addresses,
      [`${addressType}${fieldName}`]: processedValue
    });
    setError("");
    setMessage("");
  };

  // -------------------------------
  // Save Profile Changes
  // -------------------------------
  const saveProfile = async () => {
    setError("");
    setMessage("");

    // Validate names
    if (profile?.firstName && !validateAlphaOnly(profile.firstName)) {
      setError("First name can only contain letters.");
      return;
    }

    if (profile?.lastName && !validateAlphaOnly(profile.lastName)) {
      setError("Last name can only contain letters.");
      return;
    }

    // Validation
    if (addresses?.ShippingZipCode && !validateZipCode(addresses.ShippingZipCode)) {
      setError("Please enter a valid 5-digit ZIP code for shipping address.");
      return;
    }
    
    if (addresses?.ShippingState && !validateState(addresses.ShippingState)) {
      setError("Please enter a valid 2-letter state code for shipping address.");
      return;
    }
    
    if (!sameAsShipping) {
      if (addresses?.BillingZipCode && !validateZipCode(addresses.BillingZipCode)) {
        setError("Please enter a valid 5-digit ZIP code for billing address.");
        return;
      }
      
      if (addresses?.BillingState && !validateState(addresses.BillingState)) {
        setError("Please enter a valid 2-letter state code for billing address.");
        return;
      }

      if (addresses?.BillingPhone && !validatePhoneNumber(addresses.BillingPhone)) {
        setError("Please enter a valid 10-digit phone number for billing address.");
        return;
      }
    }
    
    // Validate phone number from personal info
    const phoneDigits = profile?.phone ? profile.phone.replace(/\D/g, '') : '';
    if (phoneDigits.length > 0 && !validatePhoneNumber(profile.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      // Save shipping address if it exists - include phone from personal info
      if (addresses?.ShippingLine1) {
        await saveAddress('shipping', null, phoneDigits);
      }
      
      // Save billing address
      if (sameAsShipping) {
        // Always copy shipping to billing when checkbox is checked
        if (addresses?.ShippingLine1) {
          await saveAddress('billing', {
            line1: addresses.ShippingLine1,
            line2: addresses.ShippingLine2 || null,
            city: addresses.ShippingCity,
            state: addresses.ShippingState,
            zipCode: addresses.ShippingZipCode,
            phone: phoneDigits || null
          });
        }
      } else if (addresses?.BillingLine1) {
        // Only save separate billing if fields are filled
        await saveAddress('billing');
      }

      setMessage("Profile updated successfully!");
      setEditMode(false);
      
      // Reload addresses to reflect the changes
      const updatedAddresses = await fetchData(`customer/${user.id}/addresses`);
      setAddresses(updatedAddresses);

    } catch (err) {
      console.error("Save error:", err);
      setError("Server error updating profile.");
    }
  };

  const saveAddress = async (addressType, overrideData = null, phoneFromProfile = null) => {
    const prefix = addressType === 'shipping' ? 'Shipping' : 'Billing';
    
    let addressData;
    if (overrideData) {
      addressData = {
        customerID: user.id,
        addressType: addressType,
        ...overrideData
      };
    } else {
      addressData = {
        customerID: user.id,
        addressType: addressType,
        line1: addresses[`${prefix}Line1`],
        line2: addresses[`${prefix}Line2`] || null,
        city: addresses[`${prefix}City`],
        state: addresses[`${prefix}State`],
        zipCode: addresses[`${prefix}ZipCode`],
        phone: addressType === 'shipping' && phoneFromProfile 
          ? phoneFromProfile 
          : (addresses[`${prefix}Phone`] ? addresses[`${prefix}Phone`].replace(/\D/g, '') : null)
      };
    }

    const response = await fetch("http://localhost:5077/api/customer/address", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData)
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg);
    }
  };

  // -------------------------------
  // Password Change Handler
  // -------------------------------
  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must include at least one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5077/api/customer/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: user.id,
          oldPassword: oldPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to change password.");
        return;
      }

      setMessage("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError("Server error. Could not change password.");
    }
  };

  // -------------------------------
  // Account Actions
  // -------------------------------
  const openDeactivateModal = () => {
    setModalConfig({
      title: "Deactivate Account",
      message: "Are you sure you want to deactivate your account? You can reactivate later by contacting support.",
      confirmText: "Deactivate",
      confirmColor: "#d97706",
      onConfirm: handleDeactivate
    });
    setShowModal(true);
  };

  const openDeleteModal = () => {
    setModalConfig({
      title: "Delete Account",
      message: "This action is permanent and cannot be undone. All your data will be removed.",
      confirmText: "Delete",
      confirmColor: "#dc2626",
      onConfirm: handleDelete
    });
    setShowModal(true);
  };

  const handleDeactivate = async () => {
    setShowModal(false);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5077/api/customer/deactivate/${user.id}`, {
        method: "PUT"
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Failed to deactivate account.");
        return;
      }

      setMessage("Account deactivated. Redirecting...");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setError("Server error. Could not deactivate account.");
    }
  };

  const handleDelete = async () => {
    setShowModal(false);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5077/api/customer/delete/${user.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Failed to delete account.");
        return;
      }

      setMessage("Account deleted. Redirecting...");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setError("Server error. Could not delete account.");
    }
  };

  if (!profile || !addresses) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <button 
          onClick={() => navigate('/customer-dashboard')} 
          className="breadcrumb-link"
        >
          Dashboard
        </button>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Account Settings</span>
      </nav>

      <h2 className="profile-title">My Account</h2>

      {error && <p className="profile-message error">{error}</p>}
      {message && <p className="profile-message success">{message}</p>}

      {/* ---------------------- DISPLAY MODE ---------------------- */}
      {!editMode && (
        <div className="profile-display">

          <div className="profile-section">
            <h3>Personal Info</h3>
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Email:</strong> {profile.emailAddress}</p>
            <p><strong>Phone:</strong> {profile.phone || "—"}</p>
          </div>

          <div className="profile-section">
            <h3>Shipping Address</h3>
            {addresses?.ShippingLine1 ? (
              <>
                <p><strong>Address:</strong> {addresses.ShippingLine1}</p>
                {addresses.ShippingLine2 && <p><strong>Address 2:</strong> {addresses.ShippingLine2}</p>}
                <p><strong>City:</strong> {addresses.ShippingCity}</p>
                <p><strong>State:</strong> {addresses.ShippingState}</p>
                <p><strong>ZIP Code:</strong> {addresses.ShippingZipCode}</p>
              </>
            ) : (
              <p>No shipping address on file</p>
            )}
          </div>

          <div className="profile-section">
            <h3>Billing Address</h3>
            {addresses?.BillingLine1 ? (
              <>
                <p><strong>Address:</strong> {addresses.BillingLine1}</p>
                {addresses.BillingLine2 && <p><strong>Address 2:</strong> {addresses.BillingLine2}</p>}
                <p><strong>City:</strong> {addresses.BillingCity}</p>
                <p><strong>State:</strong> {addresses.BillingState}</p>
                <p><strong>ZIP Code:</strong> {addresses.BillingZipCode}</p>
              </>
            ) : sameAsShipping && addresses?.ShippingLine1 ? (
              <>
                <p><strong>Address:</strong> {addresses.ShippingLine1}</p>
                {addresses.ShippingLine2 && <p><strong>Address 2:</strong> {addresses.ShippingLine2}</p>}
                <p><strong>City:</strong> {addresses.ShippingCity}</p>
                <p><strong>State:</strong> {addresses.ShippingState}</p>
                <p><strong>ZIP Code:</strong> {addresses.ShippingZipCode}</p>
                <p style={{ fontStyle: 'italic', color: '#6b7280', marginTop: '8px' }}>Same as shipping address</p>
              </>
            ) : (
              <p>No billing address on file</p>
            )}
          </div>

          <button
            className="profile-save-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* ---------------------- EDIT MODE ---------------------- */}
      {editMode && (
        <div className="profile-edit">

          {/* Personal Information Section */}
          <div className="profile-section-edit">
            <h3 className="section-header">Personal Information</h3>

            <div className="profile-row">
              <label htmlFor="profile-firstName">First Name</label>
              <input
                id="profile-firstName"
                name="firstName"
                type="text"
                value={profile.firstName}
                className="profile-input"
                onChange={updateField}
                autoComplete="given-name"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="profile-lastName">Last Name</label>
              <input
                id="profile-lastName"
                name="lastName"
                type="text"
                value={profile.lastName}
                className="profile-input"
                onChange={updateField}
                autoComplete="family-name"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                name="emailAddress"
                type="email"
                value={profile.emailAddress}
                className="profile-input"
                onChange={updateField}
                autoComplete="email"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="profile-phone">Phone</label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={profile.phone || ""}
                className="profile-input"
                onChange={updateField}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="profile-section-edit">
            <h3 className="section-header">Shipping Address</h3>

            <div className="profile-row">
              <label htmlFor="shipping-line1">Address Line 1</label>
              <input
                id="shipping-line1"
                name="shippingLine1"
                type="text"
                value={addresses?.ShippingLine1 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'Line1', e.target.value)}
                autoComplete="address-line1"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="shipping-line2">Address Line 2 (Optional)</label>
              <input
                id="shipping-line2"
                name="shippingLine2"
                type="text"
                value={addresses?.ShippingLine2 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'Line2', e.target.value)}
                autoComplete="address-line2"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="shipping-city">City</label>
              <input
                id="shipping-city"
                name="shippingCity"
                type="text"
                value={addresses?.ShippingCity || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'City', e.target.value)}
                autoComplete="address-level2"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="shipping-state">State (e.g., CA)</label>
              <input
                id="shipping-state"
                name="shippingState"
                type="text"
                value={addresses?.ShippingState || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'State', e.target.value)}
                maxLength="2"
                autoComplete="address-level1"
              />
            </div>

            <div className="profile-row">
              <label htmlFor="shipping-zip">ZIP Code</label>
              <input
                id="shipping-zip"
                name="shippingZipCode"
                type="text"
                value={addresses?.ShippingZipCode || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'ZipCode', e.target.value)}
                maxLength="5"
                autoComplete="postal-code"
              />
            </div>
          </div>

          {/* Billing Address Section */}
          <div className="profile-section-edit">
            <h3 className="section-header">Billing Address</h3>

            <div className="profile-row" style={{ marginBottom: '20px' }}>
              <label htmlFor="billing-sameAsShipping" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="billing-sameAsShipping"
                  name="sameAsShipping"
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                  autoComplete="off"
                />
                <span>Same as shipping address</span>
              </label>
            </div>

            {!sameAsShipping && (
              <>
                <div className="profile-row">
                  <label htmlFor="billing-line1">Address Line 1</label>
                  <input
                    id="billing-line1"
                    name="billingLine1"
                    type="text"
                    value={addresses?.BillingLine1 || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'Line1', e.target.value)}
                    autoComplete="billing address-line1"
                  />
                </div>

                <div className="profile-row">
                  <label htmlFor="billing-line2">Address Line 2 (Optional)</label>
                  <input
                    id="billing-line2"
                    name="billingLine2"
                    type="text"
                    value={addresses?.BillingLine2 || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'Line2', e.target.value)}
                    autoComplete="billing address-line2"
                  />
                </div>

                <div className="profile-row">
                  <label htmlFor="billing-city">Billing City</label>
                  <input
                    id="billing-city"
                    name="billingCity"
                    type="text"
                    value={addresses?.BillingCity || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'City', e.target.value)}
                    autoComplete="billing address-level2"
                  />
                </div>

                <div className="profile-row">
                  <label htmlFor="billing-state">State (e.g., CA)</label>
                  <input
                    id="billing-state"
                    name="billingState"
                    type="text"
                    value={addresses?.BillingState || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'State', e.target.value)}
                    maxLength="2"
                    autoComplete="billing address-level1"
                  />
                </div>

                <div className="profile-row">
                  <label htmlFor="billing-zip">ZIP Code</label>
                  <input
                    id="billing-zip"
                    name="billingZipCode"
                    type="text"
                    value={addresses?.BillingZipCode || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'ZipCode', e.target.value)}
                    maxLength="5"
                    autoComplete="billing postal-code"
                  />
                </div>

                <div className="profile-row">
                  <label htmlFor="billing-phone">Phone (Optional)</label>
                  <input
                    id="billing-phone"
                    name="billingPhone"
                    type="tel"
                    value={addresses?.BillingPhone || ""}
                    className="profile-input"
                    onChange={(e) => updateAddressField('Billing', 'Phone', e.target.value)}
                    autoComplete="billing tel"
                  />
                </div>
              </>
            )}
          </div>

          <div className="profile-buttons">
            <button
              className="profile-save-btn"
              onClick={saveProfile}
            >
              Save Changes
            </button>

            <button
              className="profile-cancel-btn"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------------- ACCOUNT MANAGEMENT ---------------------- */}
      <div className="account-management">
        <h3 className="profile-subtitle">Account Management</h3>

        {/* Change Password Section */}
        <div className="account-section">
          <h4 className="account-section-title">Change Password</h4>
          
          <div className="profile-row">
            <label htmlFor="password-current">Current Password</label>
            <input
              id="password-current"
              name="oldPassword"
              type="password"
              className="profile-input"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
              }
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="profile-row">
            <label htmlFor="password-new">New Password</label>
            <input
              id="password-new"
              name="newPassword"
              type="password"
              className="profile-input"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>

          <div className="profile-row">
            <label htmlFor="password-confirm">Confirm New Password</label>
            <input
              id="password-confirm"
              name="confirmPassword"
              type="password"
              className="profile-input"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value
                })
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <button className="account-btn-change-password" onClick={handleChangePassword}>
            Update Password
          </button>
        </div>

        {/* Account Actions Section */}
        <div className="account-section">
          <h4 className="account-section-title">Account Actions</h4>
          
          <div className="account-actions">
            <button className="account-btn-deactivate" onClick={openDeactivateModal}>
              Deactivate Account
            </button>

            <button className="account-btn-delete" onClick={openDeleteModal}>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ConfirmationModal
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          confirmColor={modalConfig.confirmColor}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
