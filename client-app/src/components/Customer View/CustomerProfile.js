import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ProfilePage.css";
import { fetchData } from "../Api";
import ConfirmationModal from "../ConfirmationModal";

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

    async function loadProfileAndAddresses() {
      try {
        // Load basic profile
        const profileData = await fetchData(`customer/${user.id}`);
        setProfile(profileData);
        
        // Load addresses
        const addressData = await fetchData(`customer/${user.id}/addresses`);
        setAddresses(addressData);
      } catch (err) {
        setError("Failed to load profile and addresses.");
      }
    }

    loadProfileAndAddresses();
  }, [user]);

  // -------------------------------
  // Update profile and address fields
  // -------------------------------
  const updateField = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const updateAddressField = (addressType, fieldName, value) => {
    setAddresses({
      ...addresses,
      [`${addressType}${fieldName}`]: value
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

    try {
      // Save basic profile info (if there's an endpoint for it)
      // For now, we'll focus on address updates
      
      // Save shipping address if it exists
      if (addresses?.ShippingLine1) {
        await saveAddress('shipping');
      }
      
      // Save billing address if it exists
      if (addresses?.BillingLine1) {
        await saveAddress('billing');
      }

      setMessage("Profile updated successfully!");
      setEditMode(false);

    } catch (err) {
      setError("Server error updating profile.");
    }
  };

  const saveAddress = async (addressType) => {
    const addressData = {
      customerID: user.id,
      addressType: addressType,
      line1: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}Line1`],
      line2: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}Line2`] || null,
      city: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}City`],
      state: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}State`],
      zipCode: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}ZipCode`],
      phone: addresses[`${addressType === 'shipping' ? 'Shipping' : 'Billing'}Phone`] || null
    };

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

  if (!profile || !addresses) return <p>Loading...</p>;

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
            <p><strong>Name:</strong> {profile.FirstName} {profile.LastName}</p>
            <p><strong>Email:</strong> {profile.EmailAddress}</p>
            <p><strong>Phone:</strong> {profile.Phone || "—"}</p>
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
                {addresses.ShippingPhone && <p><strong>Phone:</strong> {addresses.ShippingPhone}</p>}
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
                {addresses.BillingPhone && <p><strong>Phone:</strong> {addresses.BillingPhone}</p>}
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
              <label>First Name</label>
              <input
                name="FirstName"
                value={profile.FirstName}
                className="profile-input"
                onChange={updateField}
              />
            </div>

            <div className="profile-row">
              <label>Last Name</label>
              <input
                name="LastName"
                value={profile.LastName}
                className="profile-input"
                onChange={updateField}
              />
            </div>

            <div className="profile-row">
              <label>Email</label>
              <input
                name="EmailAddress"
                type="email"
                value={profile.EmailAddress}
                className="profile-input"
                onChange={updateField}
              />
            </div>

            <div className="profile-row">
              <label>Phone</label>
              <input
                name="Phone"
                type="tel"
                value={profile.Phone || ""}
                className="profile-input"
                onChange={updateField}
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="profile-section-edit">
            <h3 className="section-header">Shipping Address</h3>

            <div className="profile-row">
              <label>Address Line 1</label>
              <input
                value={addresses?.ShippingLine1 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'Line1', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Address Line 2 (Optional)</label>
              <input
                value={addresses?.ShippingLine2 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'Line2', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>City</label>
              <input
                value={addresses?.ShippingCity || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'City', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>State</label>
              <input
                value={addresses?.ShippingState || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'State', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>ZIP Code</label>
              <input
                value={addresses?.ShippingZipCode || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'ZipCode', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                value={addresses?.ShippingPhone || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Shipping', 'Phone', e.target.value)}
              />
            </div>
          </div>

          {/* Billing Address Section */}
          <div className="profile-section-edit">
            <h3 className="section-header">Billing Address</h3>

            <div className="profile-row">
              <label>Address Line 1</label>
              <input
                value={addresses?.BillingLine1 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'Line1', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Address Line 2 (Optional)</label>
              <input
                value={addresses?.BillingLine2 || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'Line2', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Billing City</label>
              <input
                value={addresses?.BillingCity || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'City', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Billing State</label>
              <input
                value={addresses?.BillingState || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'State', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Billing ZIP Code</label>
              <input
                value={addresses?.BillingZipCode || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'ZipCode', e.target.value)}
              />
            </div>

            <div className="profile-row">
              <label>Billing Phone (Optional)</label>
              <input
                type="tel"
                value={addresses?.BillingPhone || ""}
                className="profile-input"
                onChange={(e) => updateAddressField('Billing', 'Phone', e.target.value)}
              />
            </div>
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
            <label>Current Password</label>
            <input
              type="password"
              className="profile-input"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
              }
              placeholder="Enter current password"
            />
          </div>

          <div className="profile-row">
            <label>New Password</label>
            <input
              type="password"
              className="profile-input"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Enter new password"
            />
          </div>

          <div className="profile-row">
            <label>Confirm New Password</label>
            <input
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
