import React, { useState } from "react";
import { validateEmail, validatePassword, validateAlphaOnly } from "../../scripts";
import "../../Styles/Auth.css"; 

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

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    
    // Filter name fields to only allow letters and spaces, and capitalize first letter
    if (name === 'firstName' || name === 'lastName') {
      const nameValue = value.replace(/[^a-zA-Z ]/g, '');
      const capitalizedValue = capitalizeFirstLetter(nameValue);
      setForm({ 
        ...form, 
        [name]: capitalizedValue 
      });
    } else {
      setForm({ 
        ...form, 
        [name]: value 
      });
    }

    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.emailAddress || !form.password || !form.firstName || !form.lastName) {
      setError("All fields are required.");
      return false;
    }

    if (!validateAlphaOnly(form.firstName)) {
      setError("First name can only contain letters.");
      return false;
    }

    if (!validateAlphaOnly(form.lastName)) {
      setError("Last name can only contain letters.");
      return false;
    }

    if (!validateEmail(form.emailAddress)) {
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

      setSuccess("Account created successfully! Redirecting to login...");
      setForm({
        emailAddress: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: ""
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

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
          id="register-email"
          name="emailAddress"
          type="email"
          className="auth-input"
          placeholder="Email Address"
          value={form.emailAddress}
          onChange={updateField}
          autoComplete="email"
        />

        <input
          id="register-firstName"
          name="firstName"
          type="text"
          className="auth-input"
          placeholder="First Name"
          value={form.firstName}
          onChange={updateField}
          autoComplete="given-name"
        />

        <input
          id="register-lastName"
          name="lastName"
          type="text"
          className="auth-input"
          placeholder="Last Name"
          value={form.lastName}
          onChange={updateField}
          autoComplete="family-name"
        />

        <input
          id="register-password"
          type="password"
          name="password"
          className="auth-input"
          placeholder="Password"
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
        />

        <input
          id="register-confirmPassword"
          type="password"
          name="confirmPassword"
          className="auth-input"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={updateField}
          autoComplete="new-password"
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
