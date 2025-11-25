import React, { useState } from "react";
import { validateEmail, validatePassword } from "../../scripts";
import "../../Styles/Auth.css";

export default function VendorRegisterForm() {
  const [form, setForm] = useState({
    registrationToken: "",
    vendorEmail: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (e) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });

    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.registrationToken || !form.vendorEmail || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return false;
    }

    if (!validateEmail(form.vendorEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!validatePassword(form.password)) {
      setError("Password must be at least 8 characters and contain at least one letter and one number.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5077/api/auth/register-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationToken: form.registrationToken,
          vendorEmail: form.vendorEmail,
          password: form.password
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Registration failed.");
        return;
      }

      const data = await res.json();
      setSuccess(`Account activated successfully! Welcome ${data.FirstName}. You can now login.`);
      
      // Clear form
      setForm({
        registrationToken: "",
        vendorEmail: "",
        password: "",
        confirmPassword: ""
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-container">

      <h2>Vendor Account Activation</h2>
      <p className="auth-subtitle">Use the registration token provided by administration to activate your vendor account.</p>

      {error && <p className="auth-message error">{error}</p>}
      {success && <p className="auth-message success">{success}</p>}

      <form onSubmit={handleRegister} className="auth-form">

        <input
          id="vendor-registrationToken"
          name="registrationToken"
          type="text"
          className="auth-input"
          placeholder="Registration Token"
          value={form.registrationToken}
          onChange={updateField}
          autoComplete="off"
        />

        <input
          id="vendor-email"
          name="vendorEmail"
          type="email"
          className="auth-input"
          placeholder="Business Email Address"
          value={form.vendorEmail}
          onChange={updateField}
          autoComplete="email"
        />

        <input
          id="vendor-password"
          type="password"
          name="password"
          className="auth-input"
          placeholder="Create Password"
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
        />

        <input
          id="vendor-confirmPassword"
          type="password"
          name="confirmPassword"
          className="auth-input"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={updateField}
          autoComplete="new-password"
        />

        <button type="submit" className="auth-btn">
          Activate Vendor Account
        </button>

      </form>

      {/* Login link */}
      <div className="auth-register-section">
        <p className="auth-register-text">
          Already have an account? 
          <button 
            className="auth-register-link"
            onClick={() => window.location.href="/login"}
            type="button"
          >
            Login here
          </button>
        </p>
      </div>

      {/* Help text */}
      <div className="auth-help-section">
        <p className="auth-help-text">
          Don't have a registration token? Contact your business administrator to get started.
        </p>
      </div>
    </div>
  );
}
