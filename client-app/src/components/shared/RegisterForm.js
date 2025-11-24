import React, { useState } from "react";
import "../Styles/Auth.css"; 

export default function RegisterForm() {
  const [form, setForm] = useState({
    emailAddress: "",
    firstName: "",
    lastName: "",
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
    if (!form.emailAddress || !form.password || !form.firstName || !form.lastName) {
      setError("All fields are required.");
      return false;
    }

    if (!form.emailAddress.includes("@")) {
      setError("Enter a valid email address.");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
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
      const res = await fetch("http://localhost:5077/api/auth/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully! You may now log in.");
      setForm({
        emailAddress: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-container">

      <h2>Create Your Account</h2>

      {error && <p className="auth-message error">{error}</p>}
      {success && <p className="auth-message success">{success}</p>}

      <form onSubmit={handleRegister} className="auth-form">

        <input
          name="emailAddress"
          className="auth-input"
          placeholder="Email Address"
          value={form.emailAddress}
          onChange={updateField}
        />

        <input
          name="firstName"
          className="auth-input"
          placeholder="First Name"
          value={form.firstName}
          onChange={updateField}
        />

        <input
          name="lastName"
          className="auth-input"
          placeholder="Last Name"
          value={form.lastName}
          onChange={updateField}
        />

        <input
          type="password"
          name="password"
          className="auth-input"
          placeholder="Password"
          value={form.password}
          onChange={updateField}
        />

        <input
          type="password"
          name="confirmPassword"
          className="auth-input"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={updateField}
        />

        <button type="submit" className="auth-btn">
          Create Account
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
    </div>
  );
}
