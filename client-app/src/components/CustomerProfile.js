import React, { useEffect, useState } from "react";
import "../Styles/ProfilePage.css";
import { fetchData } from "./Api";
import ConfirmationModal from "./ConfirmationModal";

export default function CustomerProfile() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) {
      setError("No user logged in.");
      return;
    }

    async function loadProfile() {
      try {
        const data = await fetchData(`customer/${user.id}`);
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile.");
      }
    }

    loadProfile();
  }, [user]);

  // -------------------------------
  // Update profile fields
  // -------------------------------
  const updateField = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  // -------------------------------
  // Save Profile Changes
  // -------------------------------
  const saveProfile = async () => {
    setError("");
    setMessage("");

    const body = {
      customerId: user.id,
      firstName: profile.FirstName,
      lastName: profile.LastName,
      emailAddress: profile.EmailAddress,
      phone: profile.Phone,
      city: profile.City,
      state: profile.State,
      zipCode: profile.ZipCode,
      billingCity: profile.BillingCity,
      billingState: profile.BillingState,
      billingZipCode: profile.BillingZipCode,
      newPassword:
        passwordForm.newPassword.trim() !== ""
          ? passwordForm.newPassword
          : null
    };

    try {
      const res = await fetch("http://localhost:5077/api/customer/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      setMessage("Profile updated successfully!");
      setEditMode(false);

    } catch (err) {
      setError("Server error updating profile.");
    }
  };

  // -------------------------------
  // Password Validation
  // -------------------------------
  const validatePassword = () => {
    const { newPassword, confirmPassword } = passwordForm;

    if (!newPassword && !confirmPassword) return true;

    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters long.");

    if (!/\d/.test(newPassword))
      return setError("Password must include at least one number.");

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    return true;
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

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-container">
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
            <p><strong>City:</strong> {profile.City || "—"}</p>
            <p><strong>State:</strong> {profile.State || "—"}</p>
            <p><strong>ZIP Code:</strong> {profile.ZipCode || "—"}</p>
          </div>

          <div className="profile-section">
            <h3>Billing Address</h3>
            <p><strong>City:</strong> {profile.BillingCity || profile.City || "—"}</p>
            <p><strong>State:</strong> {profile.BillingState || profile.State || "—"}</p>
            <p><strong>ZIP Code:</strong> {profile.BillingZipCode || profile.ZipCode || "—"}</p>
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

          <h3>Edit Personal Info</h3>

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

          <h3>Shipping Address</h3>

          <div className="profile-row">
            <label>City</label>
            <input
              name="City"
              value={profile.City || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <div className="profile-row">
            <label>State</label>
            <input
              name="State"
              value={profile.State || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <div className="profile-row">
            <label>ZIP Code</label>
            <input
              name="ZipCode"
              value={profile.ZipCode || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <h3>Billing Address</h3>

          <div className="profile-row">
            <label>Billing City</label>
            <input
              name="BillingCity"
              value={profile.BillingCity || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <div className="profile-row">
            <label>Billing State</label>
            <input
              name="BillingState"
              value={profile.BillingState || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <div className="profile-row">
            <label>Billing ZIP Code</label>
            <input
              name="BillingZipCode"
              value={profile.BillingZipCode || ""}
              className="profile-input"
              onChange={updateField}
            />
          </div>

          <h3>Change Password</h3>

          <div className="profile-row">
            <label>New Password</label>
            <input
              type="password"
              className="profile-input"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />
          </div>

          <div className="profile-row">
            <label>Confirm Password</label>
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
            />
          </div>

          <div className="profile-buttons">
            <button
              className="profile-save-btn"
              onClick={() => {
                if (validatePassword()) saveProfile();
              }}
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

        <div className="account-actions">
          <button className="account-btn-deactivate" onClick={openDeactivateModal}>
            Deactivate Account
          </button>

          <button className="account-btn-delete" onClick={openDeleteModal}>
            Delete Account
          </button>
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
