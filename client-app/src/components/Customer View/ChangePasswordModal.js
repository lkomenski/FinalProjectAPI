import React, { useState } from "react";
import { validatePassword } from "../../scripts";
import "../../Styles/Dashboard.css";
import "../../Styles/modal.css";

export default function ChangePasswordModal({ user, onClose }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Clear error/message when user starts typing
    if (error) setError("");
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Client-side validation
    if (!form.oldPassword.trim()) {
      setError("Current password is required.");
      setLoading(false);
      return;
    }

    if (!form.newPassword.trim() || !form.confirmPassword.trim()) {
      setError("New password and confirmation are required.");
      setLoading(false);
      return;
    }

    if (!validatePassword(form.newPassword)) {
      setError("Password must be at least 8 characters and contain at least one letter and one number.");
      setLoading(false);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5077/api/customer/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: user.id,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password changed successfully!");
        // Clear form
        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("An error occurred while changing the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Change Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            
            <input
              id="change-oldPassword"
              className="dashboard-input"
              name="oldPassword"
              type="password"
              placeholder="Current Password *"
              value={form.oldPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="current-password"
            />

            <input
              id="change-newPassword"
              className="dashboard-input"
              name="newPassword"
              type="password"
              placeholder="New Password (8+ chars, 1+ number) *"
              value={form.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />

            <input
              id="change-confirmPassword"
              className="dashboard-input"
              name="confirmPassword"
              type="password"
              placeholder="Confirm New Password *"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />

            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
              Password requirements:
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                <li>At least 8 characters long</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

          </div>

          <div className="modal-buttons">
            <button 
              type="submit" 
              className="dashboard-btn dashboard-btn-success"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>

            <button 
              type="button" 
              className="dashboard-btn dashboard-btn-danger" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}